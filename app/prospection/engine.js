// ============================================================================
// PROSPECTION IA — moteur
// ----------------------------------------------------------------------------
// Un cycle (cron quotidien ou « Lancer un cycle maintenant ») :
//   1. envoie les e-mails dus (brouillons déjà prêts ou modèles : rapide) ;
//   2. découvre quelques entreprises sur Google Maps si une campagne en manque ;
//   3. enrichit / audite quelques prospects (site, e-mail public) ;
//   4. prépare avec l'IA les brouillons des prochains envois ;
//   5. renvoie les e-mails dus s'il reste du temps et du quota.
// Chaque étape vérifie le temps restant : un cycle se termine en moins de 50 s
// (limite Vercel Hobby : 60 s). Un verrou en base empêche deux cycles simultanés.
// ============================================================================
const crypto = require('crypto');
const core = require('./core');
const { safeFetch, searchPlaces } = require('./net');
const Prospect = require('../models/Prospect');
const ProspectCampaign = require('../models/ProspectCampaign');
const ProspectRun = require('../models/ProspectRun');
const Suppression = require('../models/Suppression');
const Lead = require('../models/Lead');
const Setting = require('../models/Setting');
const { sendEmail } = require('../config/email');
const AI = require('../agents');

const clean = (v) => String(v || '').trim();
const SITE = () => clean(process.env.SITE_URL) || core.SITE_URL;
const REPLY_TO = 'contact@pirabellabs.com';
const ADMIN_EMAIL = () => clean(process.env.ADMIN_EMAIL) || clean(process.env.CONTACT_EMAIL) || 'contact@pirabellabs.com';
const TOKEN_SECRET = () => process.env.JWT_SECRET || 'dev-only-fallback-secret-do-not-use-in-production';
const CYCLE_BUDGET_MS = 45000;
const ACTIVE_SEQUENCE = ['qualifie', 'contacte', 'relance_1'];
const STOP_STATUSES = ['repondu', 'interesse', 'pas_interesse', 'desinscrit', 'erreur', 'converti', 'relance_2'];

// ---------------------------------------------------------------------------
// Réglages
// ---------------------------------------------------------------------------
const K = {
  enabled: 'prospection.enabled', globalCap: 'prospection.globalCap', testMode: 'prospection.testMode',
  testEmail: 'prospection.testEmail', sendDays: 'prospection.sendDays', lastSendDay: 'prospection.lastSendDay',
  lock: 'prospection.lock',
};
async function readSettings(keys) {
  const rows = await Setting.find({ key: { $in: keys } }).lean();
  const out = {};
  rows.forEach((r) => { out[r.key] = r.value; });
  return out;
}
async function setSetting(key, value) {
  await Setting.updateOne({ key }, { $set: { value: String(value), updatedAt: new Date() } }, { upsert: true });
}
async function getConfig() {
  const s = await readSettings([K.enabled, K.globalCap, K.testMode, K.testEmail, K.sendDays, K.lastSendDay]);
  const cap = parseInt(s[K.globalCap], 10);
  return {
    enabled: s[K.enabled] === 'true',
    globalCap: Number.isFinite(cap) && cap > 0 ? Math.min(cap, 200) : 30,
    testMode: s[K.testMode] === undefined ? true : s[K.testMode] === 'true', // nouvelle installation : mode test ACTIVÉ
    testEmail: core.parseAddress(s[K.testEmail]) || 'contact@pirabellabs.com',
    sendDays: Math.max(0, parseInt(s[K.sendDays], 10) || 0),
    lastSendDay: s[K.lastSendDay] || '',
  };
}

// Verrou de cycle (expiration automatique : un cycle interrompu ne bloque pas le suivant).
async function acquireLock(ms) {
  const now = new Date().toISOString();
  const until = new Date(Date.now() + ms).toISOString();
  const r = await Setting.updateOne({ key: K.lock, value: { $lt: now } }, { $set: { value: until, updatedAt: new Date() } });
  if (r.matchedCount) return true;
  try { await Setting.create({ key: K.lock, value: until }); return true; } catch (e) { return false; }
}
async function releaseLock() {
  await Setting.updateOne({ key: K.lock }, { $set: { value: new Date(0).toISOString() } }).catch(() => {});
}

// ---------------------------------------------------------------------------
// Configuration de l'expéditeur et clés (jamais renvoyées au client)
// ---------------------------------------------------------------------------
function prospectFrom() { const v = clean(process.env.PROSPECT_FROM); return core.isValidFrom(v) ? v : ''; }
async function aiKeys() {
  const s = await readSettings(['openrouterApiKey', 'groqApiKey', 'groqModel']);
  return {
    openrouter: clean(process.env.OPENROUTER_API_KEY) || clean(s.openrouterApiKey),
    groq: clean(process.env.GROQ_API_KEY) || clean(s.groqApiKey),
    groqModel: clean(process.env.GROQ_MODEL) || clean(s.groqModel) || 'llama-3.3-70b-versatile',
    openrouterModel: clean(process.env.OPENROUTER_MODEL_PROSPECTION) || AI.MODEL_FAST,
  };
}
async function setupChecklist() {
  const keys = await aiKeys();
  const runs = await ProspectRun.find({ trigger: 'cron' }).sort({ startedAt: -1 }).limit(1).lean();
  const whsec = clean(process.env.RESEND_WEBHOOK_SECRET);
  return [
    { key: 'places', ok: !!clean(process.env.GOOGLE_PLACES_API_KEY), label: 'Clé Google Places (GOOGLE_PLACES_API_KEY)',
      help: 'Google Cloud Console → activer « Places API (New) » → Identifiants → créer une clé API restreinte à cette API, puis l’ajouter dans Vercel.' },
    { key: 'resend', ok: !!clean(process.env.RESEND_API_KEY), label: 'Clé Resend (RESEND_API_KEY)', help: 'Déjà utilisée par le site pour les e-mails transactionnels.' },
    { key: 'from', ok: !!prospectFrom(), label: 'Expéditeur dédié (PROSPECT_FROM)',
      help: 'Ex. « Pirabel Labs <bonjour@go.pirabellabs.com> ». Le sous-domaine doit être vérifié dans Resend (enregistrements DNS dans Cloudflare). Sans lui, seuls les e-mails de test partent (depuis l’adresse habituelle).' },
    { key: 'webhook', ok: /^whsec_[A-Za-z0-9+/=]{16,}$/.test(whsec), label: 'Secret du webhook Resend (RESEND_WEBHOOK_SECRET)',
      help: 'Resend → Webhooks → ajouter https://www.pirabellabs.com/api/prospection/webhook (événements delivered, opened, bounced, complained, received), puis copier le secret « whsec_… ».' },
    { key: 'ai', ok: !!(keys.openrouter || keys.groq), label: 'IA de rédaction (OpenRouter ou Groq)',
      help: 'Facultatif : sans IA (ou crédit épuisé), l’agent utilise ses modèles de messages rédigés à l’avance.', optional: true },
    { key: 'cron', ok: true, label: 'Cycle automatique planifié', optional: true,
      help: 'Du lundi au vendredi vers 10 h (heure du Bénin), via vercel.json.' + (runs[0] ? ' Dernier passage : ' + new Date(runs[0].startedAt).toISOString() + '.' : ' Aucun passage enregistré pour l’instant.') },
  ];
}

// ---------------------------------------------------------------------------
// Quotas
// ---------------------------------------------------------------------------
async function countSentToday(campaignId) {
  const match = { 'emails.sentAt': { $gte: core.startOfLocalDay() }, 'emails.test': { $ne: true }, 'emails.error': '' };
  const pipeline = [];
  if (campaignId) pipeline.push({ $match: { campaignId } });
  pipeline.push({ $unwind: '$emails' }, { $match: match }, { $count: 'n' });
  const r = await Prospect.aggregate(pipeline);
  return r[0] ? r[0].n : 0;
}
async function computeBudget(cfg, campaigns) {
  const today = core.localParts().dayKey;
  const sendDaysBefore = cfg.sendDays - (cfg.lastSendDay === today ? 1 : 0);
  const sumLimits = campaigns.reduce((s, c) => s + (Number(c.dailyLimit) || 0), 0);
  const warm = core.warmupCap(sendDaysBefore, cfg.globalCap);
  const dailyCap = Math.min(sumLimits, cfg.globalCap, warm);
  const sentToday = await countSentToday();
  return { dailyCap, warmCap: warm, sumLimits, sentToday, remaining: Math.max(0, dailyCap - sentToday) };
}
async function markSendDay(cfg) {
  const today = core.localParts().dayKey;
  if (cfg.lastSendDay === today) return;
  cfg.sendDays += 1; cfg.lastSendDay = today;
  await setSetting(K.sendDays, cfg.sendDays);
  await setSetting(K.lastSendDay, today);
}

// Destinataire interdit ? (liste d'exclusion, ou contact déjà connu du CRM hors prospection)
async function blockedReason(email) {
  const e = String(email || '').toLowerCase();
  if (!e) return 'pas d’adresse e-mail';
  if (await Suppression.exists({ email: e })) return 'adresse dans la liste d’exclusion';
  const lead = await Lead.findOne({ email: e }).select('stage status source').lean();
  if (lead && (lead.stage === 'client' || lead.status === 'converti' || lead.source !== 'prospection')) return 'contact déjà présent dans le CRM';
  return '';
}

// ---------------------------------------------------------------------------
// Découverte (Google Maps)
// ---------------------------------------------------------------------------
async function discoverForCampaign(campaign, notes) {
  const apiKey = clean(process.env.GOOGLE_PLACES_API_KEY);
  if (!apiKey) { notes.push('Découverte impossible : clé Google Places absente.'); return 0; }
  const total = await Prospect.countDocuments({ campaignId: campaign._id });
  if (total >= campaign.maxProspects) return 0;
  const state = Object.assign({}, campaign.discovery || {});
  const cities = (campaign.cities || []).filter(Boolean);
  const open = cities.filter((c) => !(state[c] && state[c].exhausted));
  if (!open.length) return 0;
  open.sort((a, b) => ((state[a] && state[a].pages) || 0) - ((state[b] && state[b].pages) || 0));
  const city = open[0];
  const st = state[city] || { pages: 0, pageToken: '', exhausted: false };
  const r = await searchPlaces({ apiKey, query: (campaign.sector + ' ' + city).trim(), country: campaign.country, pageToken: st.pageToken, timeoutMs: 6000 });
  if (!r.ok) { notes.push(r.error); return 0; }
  let added = 0;
  for (const pl of r.places) {
    if (total + added >= campaign.maxProspects) break;
    if (!pl || !pl.id) continue;
    if (pl.businessStatus && pl.businessStatus !== 'OPERATIONAL') continue;
    const doc = {
      campaignId: campaign._id, placeId: String(pl.id).slice(0, 200),
      name: String((pl.displayName && pl.displayName.text) || 'Entreprise').slice(0, 200),
      address: String(pl.formattedAddress || '').slice(0, 300), city: String(city).slice(0, 100),
      phone: String(pl.internationalPhoneNumber || pl.nationalPhoneNumber || '').slice(0, 40),
      website: core.normalizeWebsite(pl.websiteUri), mapsUrl: /^https:\/\//.test(pl.googleMapsUri || '') ? String(pl.googleMapsUri).slice(0, 500) : '',
      rating: typeof pl.rating === 'number' ? pl.rating : undefined, reviewsCount: Number(pl.userRatingCount) || 0,
    };
    try { await Prospect.create(doc); added++; } catch (e) { if (e.code !== 11000) notes.push('Création impossible : ' + e.message.slice(0, 80)); }
  }
  state[city] = { pages: (st.pages || 0) + 1, pageToken: r.nextPageToken || '', exhausted: !r.nextPageToken };
  campaign.discovery = state;
  campaign.markModified('discovery');
  await campaign.save();
  return added;
}

// ---------------------------------------------------------------------------
// Enrichissement + audit
// ---------------------------------------------------------------------------
function contactLinks(html, baseUrl) {
  const out = [];
  const rx = /<a\b[^>]*href\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]{0,200}?)<\/a>/gi;
  let m;
  const baseHost = core.hostOf(baseUrl);
  while ((m = rx.exec(String(html || ''))) && out.length < 3) {
    const href = m[1];
    const label = m[2].replace(/<[^>]+>/g, ' ');
    if (!/contact|nous-?joindre|joindre|coordonn/i.test(href + ' ' + label)) continue;
    try {
      const u = new URL(href, baseUrl);
      if (!/^https?:$/.test(u.protocol) || core.hostOf(u.toString()) !== baseHost) continue;
      if (!out.includes(u.toString())) out.push(u.toString());
    } catch (e) { /* lien ignoré */ }
  }
  return out;
}
async function enrichProspect(p) {
  let pageResult = { hasWebsite: !!p.website, reachable: false };
  let emails = [];
  let emailSource = '';
  if (p.website) {
    const home = await safeFetch(p.website, { timeoutMs: 6000 });
    if (home.ok && home.body) {
      pageResult = { hasWebsite: true, reachable: true, html: home.body, finalUrl: home.finalUrl, loadMs: home.loadMs };
      emails = core.extractEmails(home.body, home.finalUrl);
      emailSource = home.finalUrl;
      if (!emails.length && !p.email) {
        const candidates = contactLinks(home.body, home.finalUrl);
        ['/contact', '/nous-contacter'].forEach((path) => {
          try { const u = new URL(path, home.finalUrl).toString(); if (!candidates.includes(u)) candidates.push(u); } catch (e) { /* ignoré */ }
        });
        for (const url of candidates.slice(0, 2)) {
          const r = await safeFetch(url, { timeoutMs: 5000 });
          if (r.ok && r.body) {
            emails = core.extractEmails(r.body, home.finalUrl);
            if (emails.length) { emailSource = r.finalUrl; break; }
          }
        }
      }
    }
  }
  p.audit = core.auditPage(pageResult);
  if (!p.email && emails[0]) { p.email = emails[0]; p.emailSource = String(emailSource).slice(0, 300); }
  p.score = core.scoreProspect(p);
  if (['nouveau', 'qualifie', 'sans_email'].includes(p.status)) {
    p.status = p.email ? 'qualifie' : 'sans_email';
    if (p.email && !p.nextActionAt) p.nextActionAt = new Date();
  }
  p.lastActionAt = new Date();
  await p.save();
  return p;
}
function withTimeout(promise, ms, label) {
  let t;
  return Promise.race([promise, new Promise((_, rej) => { t = setTimeout(() => rej(new Error(label || 'Délai dépassé')), ms); })])
    .finally(() => clearTimeout(t));
}

// ---------------------------------------------------------------------------
// Rédaction (IA avec repli sur modèles)
// ---------------------------------------------------------------------------
function clearDraft(p) { p.draft = { step: -1, subject: '', text: '', source: 'modele', createdAt: null }; }
function realEmails(p) { return (p.emails || []).filter((e) => !e.test && !e.error && e.sentAt); }
function nextStepOf(p) { const n = realEmails(p).length; return n >= 3 ? null : n; }
function firstSubjectOf(p) {
  const first = (p.emails || []).find((e) => e.step === 0 && !e.error);
  return first ? first.subject : '';
}
async function generateAi(p, campaign, step, timeoutMs) {
  const keys = await aiKeys();
  if (!keys.openrouter && !keys.groq) return null;
  const facts = core.aiFacts(p, campaign, step);
  const messages = [
    { role: 'system', content: core.aiSystemPrompt() },
    { role: 'user', content: 'Faits vérifiés (n’utilise rien d’autre) :\n' + JSON.stringify(facts, null, 2) },
  ];
  const attempts = [];
  if (keys.openrouter) attempts.push(() => AI.callOpenRouter({ apiKey: keys.openrouter, model: keys.openrouterModel, messages, maxTokens: 450, temperature: 0.6, timeoutMs: Math.min(timeoutMs || 8000, 8000) }));
  if (keys.groq) attempts.push(() => AI.callGroq({ apiKey: keys.groq, model: keys.groqModel, messages, maxTokens: 450, temperature: 0.6, timeoutMs: Math.min(timeoutMs || 6000, 6000) }));
  for (const call of attempts) {
    try {
      const r = await call();
      if (!r || !r.ok) continue;
      const content = r.data && r.data.choices && r.data.choices[0] && r.data.choices[0].message && r.data.choices[0].message.content;
      const v = core.validateAiMessage(core.parseAiJson(content), facts);
      if (v.ok) {
        const subject = step === 1 ? 'Re: ' + (firstSubjectOf(p) || v.subject) : v.subject;
        return { subject: subject.slice(0, 200), body: v.body, source: 'ia' };
      }
    } catch (e) { /* délai dépassé ou réseau : tentative suivante */ }
  }
  return null;
}
// Message d'une étape : brouillon prêt > IA (si autorisée) > modèle.
async function buildMessage(p, campaign, step, opts) {
  const o = opts || {};
  if (!o.fresh && p.draft && p.draft.step === step && p.draft.text) return { subject: p.draft.subject, body: p.draft.text, source: p.draft.source || 'modele' };
  if (o.useAi) {
    const ai = await generateAi(p, campaign, step, o.timeoutMs);
    if (ai) return ai;
  }
  const t = core.templateMessage(p, campaign, step, firstSubjectOf(p));
  return { subject: t.subject, body: t.body, source: 'modele' };
}
function unsubUrlFor(p) { return SITE() + '/desinscription/' + core.signUnsubToken(String(p._id), TOKEN_SECRET()); }
function renderMessage(p, campaign, step, msg, testRecipient) {
  const unsubUrl = unsubUrlFor(p);
  const text = core.assembleText(p, campaign, step, msg.body, unsubUrl);
  const html = core.assembleHtml(text, unsubUrl, testRecipient ? (p.email || 'aucune adresse trouvée') : '');
  const subject = (testRecipient ? '[TEST] ' : '') + msg.subject;
  return {
    subject, text: (testRecipient ? 'Mode test — destinataire réel : ' + (p.email || 'aucune adresse trouvée') + '\n\n' : '') + text,
    html, unsubUrl, source: msg.source,
    headers: { 'List-Unsubscribe': '<' + unsubUrl + '>, <mailto:' + REPLY_TO + '?subject=desinscription>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}

// ---------------------------------------------------------------------------
// Envoi d'une étape
// ---------------------------------------------------------------------------
// opts : { test: bool, testEmail, step (forcé, tests uniquement), cfg }
async function sendStep(p, campaign, opts) {
  const o = opts || {};
  const step = typeof o.step === 'number' ? o.step : nextStepOf(p);
  if (step === null || step === undefined) return { ok: false, error: 'Séquence terminée (3 e-mails déjà envoyés).' };
  const from = prospectFrom();
  if (!o.test && !from) return { ok: false, error: 'Expéditeur PROSPECT_FROM non configuré.' };
  if (!o.test) {
    if (STOP_STATUSES.includes(p.status) || !ACTIVE_SEQUENCE.includes(p.status)) return { ok: false, error: 'Statut incompatible avec un envoi.' };
    const why = await blockedReason(p.email);
    if (why) return { ok: false, blocked: why };
  }
  const msg = await buildMessage(p, campaign, step, { useAi: false });
  const testTo = o.test ? (o.testEmail || 'contact@pirabellabs.com') : '';
  const r = renderMessage(p, campaign, step, msg, testTo);
  const to = o.test ? testTo : p.email;
  const res = await sendEmail(to, r.subject, r.html, {
    from: from || undefined, replyTo: REPLY_TO, headers: r.headers, text: r.text, returnInfo: true,
  });
  const entry = {
    step, subject: msg.subject.slice(0, 200), text: r.text.slice(0, 4000), source: msg.source === 'ia' ? 'ia' : 'modele',
    to: String(to).slice(0, 254), sentAt: new Date(), resendId: res && res.messageId ? String(res.messageId).slice(0, 100) : '',
    test: !!o.test, error: res ? '' : 'Envoi refusé par Resend (voir les journaux Vercel).',
  };
  p.emails.push(entry);
  if (res && !o.test) {
    const now = new Date();
    if (step === 0) p.firstContactAt = now;
    const fu = (campaign.followUps && campaign.followUps.length ? campaign.followUps : [3, 7]).slice(0, 2);
    const base = p.firstContactAt || now;
    p.status = step === 0 ? 'contacte' : (step === 1 ? 'relance_1' : 'relance_2');
    p.nextActionAt = step < 2 ? new Date(new Date(base).getTime() + (Number(fu[step]) || (step === 0 ? 3 : 7)) * 86400000) : null;
    clearDraft(p);
  }
  p.lastActionAt = new Date();
  await p.save();
  return res ? { ok: true, step, to } : { ok: false, error: entry.error };
}

// ---------------------------------------------------------------------------
// Cycle complet
// ---------------------------------------------------------------------------
async function runCycle({ trigger }) {
  const started = Date.now();
  const deadline = started + CYCLE_BUDGET_MS;
  const left = () => deadline - Date.now();
  const run = { trigger: trigger === 'cron' ? 'cron' : 'manuel', startedAt: new Date(started), discovered: 0, enriched: 0, drafted: 0, sent: 0, skipped: 0, failed: 0, budget: 0, notes: [] };
  const finish = async () => {
    run.durationMs = Date.now() - started;
    run.notes = run.notes.slice(0, 20).map((n) => String(n).slice(0, 300));
    try {
      await ProspectRun.create(run);
      const old = await ProspectRun.find().sort({ startedAt: -1 }).skip(60).select('_id').lean();
      if (old.length) await ProspectRun.deleteMany({ _id: { $in: old.map((o) => o._id) } });
    } catch (e) { console.error('[prospection.run.log]', e.message); }
    return run;
  };

  if (!(await acquireLock(58000))) { run.notes.push('Un cycle est déjà en cours : nouvel essai plus tard.'); return finish(); }
  try {
    const cfg = await getConfig();
    run.testMode = cfg.testMode;
    if (!cfg.enabled) { run.notes.push('Agent désactivé (interrupteur général) : aucun traitement.'); return await finish(); }
    const campaigns = await ProspectCampaign.find({ status: 'active', isTest: { $ne: true } });
    if (!campaigns.length) { run.notes.push('Aucune campagne active.'); return await finish(); }
    const byId = new Map(campaigns.map((c) => [String(c._id), c]));
    const canSend = core.isSendWindow(new Date());
    if (!canSend) run.notes.push('Hors fenêtre d’envoi (lun.–ven., 8 h – 18 h, heure du Bénin) : découverte et analyse uniquement.');
    if (!cfg.testMode && !prospectFrom()) run.notes.push('PROSPECT_FROM non configuré : aucun envoi réel possible.');

    let budget = null;
    const perCampaignSent = new Map();
    let consecutiveFailures = 0;
    const sendPass = async () => {
      if (!canSend || left() < 6000) return;
      if (!cfg.testMode && !prospectFrom()) return;
      if (budget === null) {
        if (cfg.testMode) { budget = { remaining: 3, dailyCap: 3 }; run.notes.push('Mode test : 3 e-mails au maximum par cycle, envoyés uniquement à ' + cfg.testEmail + '.'); }
        else { budget = await computeBudget(cfg, campaigns); run.budget = budget.dailyCap; }
        for (const c of campaigns) perCampaignSent.set(String(c._id), cfg.testMode ? 0 : await countSentToday(c._id));
      }
      if (budget.remaining <= 0) return;
      const due = await Prospect.find({
        isTest: { $ne: true }, campaignId: { $in: campaigns.map((c) => c._id) }, status: { $in: ACTIVE_SEQUENCE },
        email: { $ne: '' }, nextActionAt: { $lte: new Date() },
      }).sort({ nextActionAt: 1, score: -1 }).limit(Math.min(120, budget.remaining * 3 + 10));
      // Relances d'abord (engagements déjà pris), puis premiers contacts par score décroissant.
      due.sort((a, b) => (a.status === 'qualifie' ? 1 : 0) - (b.status === 'qualifie' ? 1 : 0) || (b.score || 0) - (a.score || 0));
      for (const p of due) {
        if (budget.remaining <= 0 || left() < 4000) break;
        const c = byId.get(String(p.campaignId));
        if (!c) continue;
        const step = nextStepOf(p);
        if (step === null) { p.status = 'relance_2'; p.nextActionAt = null; await p.save(); continue; }
        if (cfg.testMode) {
          if ((p.emails || []).some((e) => e.test && e.step === step && !e.error)) continue; // déjà testé pour cette étape
          const r = await sendStep(p, c, { test: true, testEmail: cfg.testEmail, step });
          if (r.ok) { run.sent++; budget.remaining--; } else run.failed++;
        } else {
          const used = perCampaignSent.get(String(c._id)) || 0;
          if (used >= c.dailyLimit) continue;
          const r = await sendStep(p, c, {});
          if (r.blocked) {
            run.skipped++;
            p.status = r.blocked.includes('exclusion') ? 'desinscrit' : 'erreur';
            p.nextActionAt = null;
            p.notes = (p.notes ? p.notes + '\n' : '') + 'Exclu automatiquement : ' + r.blocked + '.';
            await p.save();
            continue;
          }
          if (r.ok) {
            run.sent++; budget.remaining--; consecutiveFailures = 0;
            perCampaignSent.set(String(c._id), used + 1);
            await markSendDay(cfg);
          } else {
            run.failed++; consecutiveFailures++;
            if (consecutiveFailures >= 3) { run.notes.push('3 échecs d’envoi consécutifs : arrêt des envois (vérifiez le domaine dans Resend).'); budget.remaining = 0; }
          }
        }
        await new Promise((res) => setTimeout(res, 550)); // limite Resend : 2 requêtes par seconde
      }
    };

    // 1. Envois dus
    await sendPass();

    // 2. Découverte (2 pages Google au maximum par cycle)
    let pages = 0;
    for (const c of campaigns) {
      if (pages >= 2 || left() < 20000) break;
      const pending = await Prospect.countDocuments({ campaignId: c._id, status: { $in: ['nouveau', 'qualifie'] } });
      if (pending >= c.dailyLimit * 2) continue;
      run.discovered += await discoverForCampaign(c, run.notes);
      pages++;
    }

    // 3. Enrichissement (lots de 4 en parallèle, 8 prospects au maximum)
    const toEnrich = await Prospect.find({ isTest: { $ne: true }, campaignId: { $in: campaigns.map((c) => c._id) }, status: 'nouveau' })
      .sort({ createdAt: 1 }).limit(8);
    for (let i = 0; i < toEnrich.length; i += 4) {
      if (left() < 16000) break;
      const batch = toEnrich.slice(i, i + 4);
      const results = await Promise.allSettled(batch.map((p) => withTimeout(enrichProspect(p), 13000, 'Analyse trop longue')));
      results.forEach((r, k) => {
        if (r.status === 'fulfilled') run.enriched++;
        else {
          const p = batch[k];
          p.audit = core.auditPage({ hasWebsite: !!p.website, reachable: false });
          p.score = core.scoreProspect(p);
          p.status = p.email ? 'qualifie' : 'sans_email';
          if (p.email) p.nextActionAt = new Date();
          p.save().catch(() => {});
          run.enriched++;
        }
      });
    }

    // 4. Brouillons IA pour les prochains envois (3 en parallèle, arrêt après 2 échecs)
    let aiFailures = 0;
    const soon = new Date(Date.now() + 36 * 3600000);
    const toDraft = await Prospect.find({
      isTest: { $ne: true }, campaignId: { $in: campaigns.map((c) => c._id) }, status: { $in: ACTIVE_SEQUENCE },
      email: { $ne: '' }, nextActionAt: { $lte: soon },
    }).sort({ nextActionAt: 1, score: -1 }).limit(12);
    const needing = toDraft.filter((p) => { const s = nextStepOf(p); return s !== null && !(p.draft && p.draft.step === s && p.draft.text); });
    for (let i = 0; i < needing.length; i += 3) {
      if (left() < 18000 || aiFailures >= 2) break;
      const batch = needing.slice(i, i + 3);
      const results = await Promise.allSettled(batch.map(async (p) => {
        const step = nextStepOf(p);
        const ai = await generateAi(p, byId.get(String(p.campaignId)), step, 8000);
        if (!ai) throw new Error('IA indisponible');
        p.draft = { step, subject: ai.subject, text: ai.body, source: 'ia', createdAt: new Date() };
        await p.save();
      }));
      results.forEach((r) => { if (r.status === 'fulfilled') run.drafted++; else aiFailures++; });
    }
    if (aiFailures >= 2) run.notes.push('IA indisponible (crédit épuisé ou délai) : les modèles de messages prennent le relais.');

    // 5. Second passage d'envoi (prospects qualifiés pendant ce cycle)
    await sendPass();

    await refreshStats(campaigns.map((c) => c._id));
    return await finish();
  } catch (e) {
    console.error('[prospection.run]', e.message);
    run.notes.push('Erreur inattendue : ' + String(e.message).slice(0, 150));
    return await finish();
  } finally {
    await releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Statistiques par campagne (prospects et envois de test exclus)
// ---------------------------------------------------------------------------
async function refreshStats(campaignIds) {
  const ids = (campaignIds || []).filter(Boolean);
  const match = { isTest: { $ne: true } };
  if (ids.length) match.campaignId = { $in: ids };
  const rows = await Prospect.aggregate([
    { $match: match },
    { $project: {
      campaignId: 1, status: 1,
      hasEmail: { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ['$email', ''] } }, 0] }, 1, 0] },
      real: { $filter: { input: { $ifNull: ['$emails', []] }, as: 'e', cond: { $and: [{ $ne: ['$$e.test', true] }, { $eq: ['$$e.error', ''] }] } } },
    } },
    { $group: {
      _id: '$campaignId',
      found: { $sum: 1 },
      withEmail: { $sum: '$hasEmail' },
      contacted: { $sum: { $cond: [{ $gt: [{ $size: '$real' }, 0] }, 1, 0] } },
      opened: { $sum: { $cond: [{ $gt: [{ $size: { $filter: { input: '$real', as: 'r', cond: { $eq: ['$$r.opened', true] } } } }, 0] }, 1, 0] } },
      replied: { $sum: { $cond: [{ $in: ['$status', ['repondu', 'interesse', 'pas_interesse', 'converti']] }, 1, 0] } },
      interested: { $sum: { $cond: [{ $in: ['$status', ['interesse', 'converti']] }, 1, 0] } },
      converted: { $sum: { $cond: [{ $eq: ['$status', 'converti'] }, 1, 0] } },
    } },
  ]);
  const map = new Map(rows.map((r) => [String(r._id), r]));
  const campaigns = await ProspectCampaign.find(ids.length ? { _id: { $in: ids } } : {});
  for (const c of campaigns) {
    const r = map.get(String(c._id)) || {};
    c.stats = { found: r.found || 0, withEmail: r.withEmail || 0, contacted: r.contacted || 0, opened: r.opened || 0,
      replied: r.replied || 0, interested: r.interested || 0, converted: r.converted || 0, updatedAt: new Date() };
    await ProspectCampaign.updateOne({ _id: c._id }, { $set: { stats: c.stats } });
  }
  return campaigns;
}

// ---------------------------------------------------------------------------
// CRM : création / fusion d'un Lead à partir d'un prospect
// ---------------------------------------------------------------------------
async function upsertLeadFromProspect(p, campaign, note, stage) {
  let lead = p.leadId ? await Lead.findById(p.leadId) : null;
  if (!lead && p.email) lead = await Lead.findOne({ email: p.email });
  const line = '[' + new Date().toISOString().slice(0, 10) + '] Prospection IA — ' + note;
  if (!lead) {
    lead = await Lead.create({
      name: String(p.name).slice(0, 120), company: String(p.name).slice(0, 120), email: p.email || '', phone: String(p.phone || '').slice(0, 30),
      service: String((campaign && campaign.sector) || 'Prospection').slice(0, 60), source: 'prospection',
      stage: stage || 'prospect', status: 'en_cours', message: String(p.replyText || note).slice(0, 5000),
      internalNotes: line.slice(0, 5000),
      clientData: { address: String(p.address || '').slice(0, 500), city: String(p.city || '').slice(0, 100), website: String(p.website || '').slice(0, 300) },
    });
  } else {
    lead.internalNotes = ((lead.internalNotes ? lead.internalNotes + '\n' : '') + line).slice(-5000);
    if (stage && lead.stage === 'prospect') lead.stage = stage;
    if (lead.status === 'nouveau' || lead.status === 'lu') lead.status = 'en_cours';
    await lead.save();
  }
  p.leadId = lead._id;
  return lead;
}

// ---------------------------------------------------------------------------
// Webhooks Resend
// ---------------------------------------------------------------------------
async function fetchInboundText(emailId) {
  const key = clean(process.env.RESEND_API_KEY);
  if (!key || !/^[A-Za-z0-9-]{8,100}$/.test(String(emailId || ''))) return '';
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 5000);
  try {
    const r = await fetch('https://api.resend.com/emails/receiving/' + encodeURIComponent(emailId), { headers: { Authorization: 'Bearer ' + key }, signal: ctrl.signal });
    if (!r.ok) return '';
    const d = await r.json().catch(() => ({}));
    const txt = d.text || String(d.html || '').replace(/<[^>]+>/g, ' ');
    return String(txt || '').replace(/\s+\n/g, '\n').trim().slice(0, 4000);
  } catch (e) { return ''; } finally { clearTimeout(t); }
}
async function handleWebhookEvent(evt) {
  const type = String((evt && evt.type) || '');
  const data = (evt && evt.data) || {};
  const emailId = String(data.email_id || data.id || '').slice(0, 100);

  if (type === 'email.received') {
    const from = core.parseAddress(data.from);
    if (!from) return { handled: false, reason: 'expéditeur inconnu' };
    const p = await Prospect.findOne({ email: from, isTest: { $ne: true } }).sort({ lastActionAt: -1 });
    if (!p) return { handled: false, reason: 'aucun prospect correspondant' };
    if (p.status === 'desinscrit') return { handled: true, reason: 'prospect désinscrit' };
    const text = (await fetchInboundText(emailId)) || String(data.text || '').slice(0, 4000) || ('Réponse reçue : « ' + String(data.subject || '').slice(0, 150) + ' »');
    p.replyText = text.slice(0, 5000);
    if (!['interesse', 'converti', 'pas_interesse'].includes(p.status)) p.status = 'repondu';
    p.nextActionAt = null;
    clearDraft(p);
    p.lastActionAt = new Date();
    const campaign = p.campaignId ? await ProspectCampaign.findById(p.campaignId).lean() : null;
    const lead = await upsertLeadFromProspect(p, campaign, 'réponse reçue : ' + text.slice(0, 600), 'qualifie');
    await p.save();
    const esc = core.escHtml;
    await sendEmail(ADMIN_EMAIL(), '[Prospection] Réponse de ' + String(p.name).slice(0, 80),
      '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1f1a17;max-width:600px;">' +
      '<p><strong>' + esc(p.name) + '</strong> (' + esc(p.city || '') + ') a répondu à la prospection.</p>' +
      '<blockquote style="margin:0 0 16px;padding:10px 14px;border-left:3px solid #FF5500;background:#faf7f4;white-space:pre-wrap;">' + esc(text.slice(0, 1500)) + '</blockquote>' +
      '<p>La séquence est arrêtée et le contact a été ajouté au CRM.</p>' +
      '<p><a href="' + SITE() + '/admin/dashboard#prospection" style="color:#B83A00;font-weight:700;">Ouvrir la Prospection IA</a></p></div>',
      { replyTo: p.email || undefined }).catch(() => {});
    return { handled: true, leadId: String(lead._id) };
  }

  if (!emailId) return { handled: false, reason: 'identifiant absent' };
  const p = await Prospect.findOne({ 'emails.resendId': emailId });
  if (!p) return { handled: false, reason: 'e-mail inconnu' };
  const entry = p.emails.find((e) => e.resendId === emailId);
  if (type === 'email.delivered') entry.delivered = true;
  else if (type === 'email.opened') { entry.opened = true; if (!entry.openedAt) entry.openedAt = new Date(); }
  else if ((type === 'email.bounced' || type === 'email.complained') && !entry.test) {
    const isBounce = type === 'email.bounced';
    const target = String(p.email || entry.to || '').toLowerCase();
    if (target) {
      await Suppression.updateOne({ email: target }, { $setOnInsert: { email: target, reason: isBounce ? 'bounce' : 'plainte', createdAt: new Date() } }, { upsert: true });
    }
    p.status = isBounce ? 'erreur' : 'desinscrit';
    p.nextActionAt = null;
    clearDraft(p);
    p.notes = ((p.notes ? p.notes + '\n' : '') + (isBounce ? 'Adresse en échec (rebond) : ajoutée à la liste d’exclusion.' : 'Signalé comme indésirable : ajouté à la liste d’exclusion.')).slice(-5000);
  } else if (type === 'email.bounced' && entry.test) {
    entry.error = 'Rebond sur l’adresse de test.';
  }
  p.markModified('emails');
  await p.save();
  return { handled: true };
}

// ---------------------------------------------------------------------------
// Désinscription
// ---------------------------------------------------------------------------
async function prospectFromToken(token) {
  const id = core.verifyUnsubToken(token, TOKEN_SECRET());
  if (!id) return null;
  return Prospect.findById(id);
}
async function unsubscribe(token) {
  const p = await prospectFromToken(token);
  if (!p) return { ok: false };
  if (p.email) {
    await Suppression.updateOne({ email: p.email }, { $setOnInsert: { email: p.email, reason: 'desinscription', createdAt: new Date() } }, { upsert: true });
  }
  if (!p.isTest) {
    p.status = 'desinscrit';
    p.nextActionAt = null;
    clearDraft(p);
    p.lastActionAt = new Date();
    await p.save();
  }
  return { ok: true, name: p.name };
}

// ---------------------------------------------------------------------------
// Mode test : prospect de test, aperçus, envoi à l'adresse de test
// ---------------------------------------------------------------------------
async function testCampaign() {
  let c = await ProspectCampaign.findOne({ isTest: true });
  if (!c) c = await ProspectCampaign.create({ name: 'Tests', sector: '', cities: [], isTest: true, status: 'brouillon', dailyLimit: 5, maxProspects: 500 });
  return c;
}
async function createTestProspect(input) {
  let campaign = null;
  if (input.campaignId) campaign = await ProspectCampaign.findById(input.campaignId);
  if (!campaign) campaign = await testCampaign();
  const p = new Prospect({
    campaignId: campaign._id, placeId: 'test_' + crypto.randomBytes(8).toString('hex'), isTest: true,
    name: input.name, city: input.city || '', phone: input.phone || '', website: input.website || '',
    email: input.email || '', emailSource: input.email ? 'manuel' : '',
  });
  await p.save();
  try { await withTimeout(enrichProspect(p), 14000, 'Analyse trop longue'); } catch (e) {
    p.audit = core.auditPage({ hasWebsite: !!p.website, reachable: false });
    p.score = core.scoreProspect(p);
    p.status = p.email ? 'qualifie' : 'sans_email';
  }
  const msg = await buildMessage(p, campaign, 0, { useAi: true, fresh: true, timeoutMs: 8000 });
  p.draft = { step: 0, subject: msg.subject, text: msg.body, source: msg.source, createdAt: new Date() };
  await p.save();
  return { prospect: p, campaign };
}
async function previewFor(p, step, opts) {
  const o = opts || {};
  const campaign = p.campaignId ? await ProspectCampaign.findById(p.campaignId) : null;
  const s = typeof step === 'number' ? step : nextStepOf(p);
  if (s === null) return { done: true };
  const msg = await buildMessage(p, campaign, s, { useAi: !!o.ai, fresh: !!o.ai, timeoutMs: 9000 });
  if (o.ai && o.save) {
    p.draft = { step: s, subject: msg.subject, text: msg.body, source: msg.source, createdAt: new Date() };
    await p.save();
  }
  const r = renderMessage(p, campaign, s, msg, '');
  return { step: s, subject: r.subject, text: r.text, html: r.html, source: msg.source };
}
async function sendTestEmail(p, step) {
  const cfg = await getConfig();
  const campaign = p.campaignId ? await ProspectCampaign.findById(p.campaignId) : await testCampaign();
  const s = typeof step === 'number' ? step : (nextStepOf(p) === null ? 0 : nextStepOf(p));
  const r = await sendStep(p, campaign, { test: true, testEmail: cfg.testEmail, step: s });
  return Object.assign({ testEmail: cfg.testEmail }, r);
}

module.exports = {
  K, getConfig, setSetting, setupChecklist, computeBudget, countSentToday, prospectFrom,
  runCycle, enrichProspect, discoverForCampaign, sendStep, nextStepOf, buildMessage, renderMessage,
  refreshStats, upsertLeadFromProspect, handleWebhookEvent, unsubscribe, prospectFromToken,
  createTestProspect, previewFor, sendTestEmail, testCampaign, blockedReason,
  ACTIVE_SEQUENCE, STOP_STATUSES,
};
