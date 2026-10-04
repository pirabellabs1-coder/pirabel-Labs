// ============================================================================
// PROSPECTION IA — routes Express
//   Admin (auth + adminOnly) : /api/admin/prospection/*
//   Public : POST /api/prospection/webhook (Resend, signature Svix),
//            GET|POST /desinscription/:token, GET /api/cron/prospection
// ============================================================================
const crypto = require('crypto');
const express = require('express');
const core = require('./core');
const engine = require('./engine');
const Prospect = require('../models/Prospect');
const ProspectCampaign = require('../models/ProspectCampaign');
const ProspectRun = require('../models/ProspectRun');
const Suppression = require('../models/Suppression');
const Setting = require('../models/Setting');

const RX_ID = /^[a-f0-9]{24}$/i;
const CAMPAIGN_STATUSES = ['brouillon', 'active', 'en_pause', 'terminee'];
const MANUAL_STATUSES = ['repondu', 'interesse', 'pas_interesse', 'desinscrit', 'converti', 'qualifie'];
const escRx = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const intIn = (v, min, max, def) => { const n = parseInt(v, 10); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def; };
function safeEqual(a, b) {
  const x = Buffer.from(String(a || '')); const y = Buffer.from(String(b || ''));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

module.exports = function registerProspection(app, deps) {
  const { auth, adminOnly, rateLimit, sanitize, sanitizeEmail, isValidEmail } = deps;
  const A = [auth, adminOnly];
  const runLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 4, keyPrefix: 'prosp-run', message: 'Trop de lancements : réessayez dans quelques minutes.' });
  const testLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 15, keyPrefix: 'prosp-test', message: 'Trop d’essais : réessayez dans quelques minutes.' });
  const webhookLimiter = rateLimit({ windowMs: 60 * 1000, max: 300, keyPrefix: 'prosp-wh', message: 'Trop de requêtes.' });
  const unsubLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, keyPrefix: 'prosp-unsub', message: 'Trop de requêtes.' });

  // ------------------------------------------------------------------ utilitaires
  function campaignInput(b, partial) {
    const out = {};
    const err = (m) => { const e = new Error(m); e.userMessage = m; throw e; };
    if (!partial || b.sector !== undefined) {
      out.sector = sanitize(String(b.sector || ''), 120);
      if (out.sector.length < 2) err('Indiquez le secteur recherché (ex. « restaurant », « clinique »).');
    }
    if (!partial || b.cities !== undefined) {
      const raw = Array.isArray(b.cities) ? b.cities : String(b.cities || '').split(/[,;\n]/);
      out.cities = [...new Set(raw.map((c) => sanitize(String(c || ''), 60)).filter((c) => c.length >= 2))].slice(0, 10);
      if (!out.cities.length) err('Indiquez au moins une ville.');
    }
    if (!partial || b.name !== undefined) {
      out.name = sanitize(String(b.name || ''), 120) || ((out.sector || 'Campagne') + (out.cities ? ' — ' + out.cities.slice(0, 3).join(', ') : ''));
    }
    if (!partial || b.country !== undefined) out.country = sanitize(String(b.country || 'Bénin'), 60) || 'Bénin';
    if (!partial || b.offer !== undefined) out.offer = sanitize(String(b.offer || ''), 1000);
    if (!partial || b.dailyLimit !== undefined) out.dailyLimit = intIn(b.dailyLimit, 1, 100, 20);
    if (!partial || b.maxProspects !== undefined) out.maxProspects = intIn(b.maxProspects, 1, 5000, 200);
    if (!partial || b.followUps !== undefined) {
      const f = (Array.isArray(b.followUps) ? b.followUps : [3, 7]).map((x) => intIn(x, 1, 60, 0)).filter(Boolean).slice(0, 2);
      out.followUps = f.length === 2 && f[0] < f[1] ? f : [3, 7];
    }
    return out;
  }
  function prospectSummary(p) {
    const real = (p.emails || []).filter((e) => !e.test && !e.error);
    const last = (p.emails || []).filter((e) => e.sentAt).slice(-1)[0];
    return {
      _id: p._id, campaignId: p.campaignId, name: p.name, city: p.city, phone: p.phone, website: p.website, email: p.email,
      score: p.score, status: p.status, isTest: !!p.isTest, rating: p.rating, reviewsCount: p.reviewsCount,
      emailsSent: real.length, opened: real.some((e) => e.opened), lastActionAt: p.lastActionAt, nextActionAt: p.nextActionAt,
      lastEmailAt: last ? last.sentAt : null, issues: (p.audit && p.audit.issues) || [], leadId: p.leadId || null,
    };
  }
  async function loadProspect(req, res) {
    if (!RX_ID.test(req.params.id || '')) { res.status(400).json({ error: 'Identifiant invalide.' }); return null; }
    const p = await Prospect.findById(req.params.id);
    if (!p) { res.status(404).json({ error: 'Prospect introuvable.' }); return null; }
    return p;
  }
  const fail = (res, e, label) => {
    if (e && e.userMessage) return res.status(400).json({ error: e.userMessage });
    console.error('[prospection.' + label + ']', e && e.message);
    return res.status(500).json({ error: 'Erreur serveur.' });
  };

  // ------------------------------------------------------------------ vue d'ensemble
  app.get('/api/admin/prospection/overview', ...A, async (req, res) => {
    try {
      const cfg = await engine.getConfig();
      const active = await ProspectCampaign.find({ status: 'active', isTest: { $ne: true } }).lean();
      const [budget, checklist, campaigns, runs, counts] = await Promise.all([
        engine.computeBudget(cfg, active),
        engine.setupChecklist(),
        engine.refreshStats([]),
        ProspectRun.find().sort({ startedAt: -1 }).limit(10).lean(),
        Prospect.aggregate([{ $match: { isTest: { $ne: true } } }, { $group: { _id: '$status', n: { $sum: 1 } } }]),
      ]);
      res.json({
        config: { enabled: cfg.enabled, globalCap: cfg.globalCap, testMode: cfg.testMode, testEmail: cfg.testEmail, sendDays: cfg.sendDays },
        budget, checklist, from: engine.prospectFrom(), sendWindowOpen: core.isSendWindow(new Date()),
        campaigns: campaigns.sort((a, b) => (a.isTest ? 1 : 0) - (b.isTest ? 1 : 0) || b.createdAt - a.createdAt),
        runs, statusCounts: Object.fromEntries(counts.map((c) => [c._id, c.n])),
      });
    } catch (e) { fail(res, e, 'overview'); }
  });

  app.put('/api/admin/prospection/settings', ...A, async (req, res) => {
    try {
      const b = req.body || {};
      const K = engine.K;
      if (b.enabled !== undefined) await engine.setSetting(K.enabled, b.enabled === true || b.enabled === 'true' ? 'true' : 'false');
      if (b.globalCap !== undefined) await engine.setSetting(K.globalCap, intIn(b.globalCap, 1, 200, 30));
      if (b.testEmail !== undefined) {
        const e = sanitizeEmail(b.testEmail);
        if (!isValidEmail(e)) return res.status(400).json({ error: 'Adresse de test invalide.' });
        await engine.setSetting(K.testEmail, e);
      }
      if (b.testMode !== undefined) {
        const on = b.testMode === true || b.testMode === 'true';
        if (!on && b.confirmLive !== true) return res.status(400).json({ error: 'Confirmation requise pour passer en envoi réel.' });
        if (!on && !engine.prospectFrom()) return res.status(400).json({ error: 'Configurez d’abord PROSPECT_FROM (expéditeur dédié vérifié dans Resend).' });
        await engine.setSetting(K.testMode, on ? 'true' : 'false');
      }
      const cfg = await engine.getConfig();
      res.json({ success: true, config: { enabled: cfg.enabled, globalCap: cfg.globalCap, testMode: cfg.testMode, testEmail: cfg.testEmail } });
    } catch (e) { fail(res, e, 'settings'); }
  });

  // ------------------------------------------------------------------ campagnes
  app.get('/api/admin/prospection/campaigns', ...A, async (req, res) => {
    try { res.json({ campaigns: await engine.refreshStats([]) }); } catch (e) { fail(res, e, 'campaigns'); }
  });
  app.post('/api/admin/prospection/campaigns', ...A, async (req, res) => {
    try {
      const data = campaignInput(req.body || {}, false);
      data.status = req.body && req.body.start === true ? 'active' : 'brouillon';
      const c = await ProspectCampaign.create(data);
      res.json({ success: true, campaign: c });
    } catch (e) { fail(res, e, 'campaign.create'); }
  });
  app.put('/api/admin/prospection/campaigns/:id', ...A, async (req, res) => {
    try {
      if (!RX_ID.test(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide.' });
      const c = await ProspectCampaign.findById(req.params.id);
      if (!c) return res.status(404).json({ error: 'Campagne introuvable.' });
      if (c.isTest) return res.status(400).json({ error: 'La campagne « Tests » ne se modifie pas.' });
      const data = campaignInput(req.body || {}, true);
      if (data.cities) { // nouvelles villes : curseurs conservés pour les anciennes
        const st = Object.assign({}, c.discovery || {});
        Object.keys(st).forEach((k) => { if (!data.cities.includes(k)) delete st[k]; });
        c.discovery = st; c.markModified('discovery');
      }
      c.set(data);
      await c.save();
      res.json({ success: true, campaign: c });
    } catch (e) { fail(res, e, 'campaign.update'); }
  });
  app.post('/api/admin/prospection/campaigns/:id/status', ...A, async (req, res) => {
    try {
      if (!RX_ID.test(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide.' });
      const status = String((req.body || {}).status || '');
      if (!CAMPAIGN_STATUSES.includes(status)) return res.status(400).json({ error: 'Statut invalide.' });
      const c = await ProspectCampaign.findById(req.params.id);
      if (!c) return res.status(404).json({ error: 'Campagne introuvable.' });
      if (c.isTest && status === 'active') return res.status(400).json({ error: 'La campagne « Tests » ne peut pas être activée.' });
      if (status === 'active' && (!c.sector || !(c.cities || []).length)) return res.status(400).json({ error: 'Secteur et villes requis pour démarrer.' });
      c.status = status;
      await c.save();
      res.json({ success: true, campaign: c });
    } catch (e) { fail(res, e, 'campaign.status'); }
  });
  app.delete('/api/admin/prospection/campaigns/:id', ...A, async (req, res) => {
    try {
      if (!RX_ID.test(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide.' });
      const c = await ProspectCampaign.findById(req.params.id);
      if (!c) return res.status(404).json({ error: 'Campagne introuvable.' });
      const sent = await Prospect.exists({ campaignId: c._id, emails: { $elemMatch: { test: { $ne: true }, error: '', sentAt: { $ne: null } } } });
      if (sent) return res.status(409).json({ error: 'Cette campagne a déjà envoyé des e-mails : passez-la plutôt en « Terminée » pour garder l’historique.' });
      await Prospect.deleteMany({ campaignId: c._id });
      await c.deleteOne();
      res.json({ success: true });
    } catch (e) { fail(res, e, 'campaign.delete'); }
  });

  // ------------------------------------------------------------------ prospects
  app.get('/api/admin/prospection/prospects', ...A, async (req, res) => {
    try {
      const f = { isTest: req.query.test === '1' ? true : { $ne: true } };
      if (req.query.campaignId && RX_ID.test(String(req.query.campaignId))) f.campaignId = String(req.query.campaignId);
      const st = String(req.query.status || '');
      if (st && Prospect.STATUTS.includes(st)) f.status = st;
      const qs = sanitize(String(req.query.q || ''), 80);
      if (qs) { const rx = new RegExp(escRx(qs), 'i'); f.$or = [{ name: rx }, { city: rx }, { email: rx }]; }
      const page = intIn(req.query.page, 1, 1000, 1);
      const limit = 25;
      const sortKey = req.query.sort === 'recent' ? { lastActionAt: -1, createdAt: -1 } : { score: -1, createdAt: -1 };
      const [items, total] = await Promise.all([
        Prospect.find(f).sort(sortKey).skip((page - 1) * limit).limit(limit).lean(),
        Prospect.countDocuments(f),
      ]);
      res.json({ prospects: items.map(prospectSummary), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
    } catch (e) { fail(res, e, 'prospects'); }
  });

  app.get('/api/admin/prospection/prospects/:id', ...A, async (req, res) => {
    try {
      const p = await loadProspect(req, res); if (!p) return;
      const campaign = p.campaignId ? await ProspectCampaign.findById(p.campaignId).lean() : null;
      let preview = null;
      try { preview = await engine.previewFor(p, null, {}); } catch (e) { preview = null; }
      const o = p.toObject();
      o.emails = (o.emails || []).map((e) => Object.assign({}, e, { resendId: undefined }));
      res.json({
        prospect: o, campaign: campaign ? { _id: campaign._id, name: campaign.name, sector: campaign.sector, isTest: !!campaign.isTest, followUps: campaign.followUps } : null,
        nextStep: engine.nextStepOf(p), preview, whatsappUrl: core.whatsappUrl(p.phone, p.name),
      });
    } catch (e) { fail(res, e, 'prospect'); }
  });

  // Aperçu exact d'un e-mail (sans envoi). ai=true : nouvelle rédaction par l'IA (enregistrée comme brouillon si c'est la prochaine étape).
  app.post('/api/admin/prospection/prospects/:id/preview', ...A, testLimiter, async (req, res) => {
    try {
      const p = await loadProspect(req, res); if (!p) return;
      const b = req.body || {};
      const step = b.step === undefined || b.step === null || b.step === '' ? null : intIn(b.step, 0, 2, 0);
      const next = engine.nextStepOf(p);
      const r = await engine.previewFor(p, step, { ai: b.ai === true, save: b.ai === true && (step === null || step === next || p.isTest) });
      if (r.done) return res.json({ done: true, message: 'Séquence terminée : aucun autre e-mail prévu.' });
      res.json(r);
    } catch (e) { fail(res, e, 'preview'); }
  });

  app.post('/api/admin/prospection/prospects/:id/status', ...A, async (req, res) => {
    try {
      const p = await loadProspect(req, res); if (!p) return;
      const status = String((req.body || {}).status || '');
      const note = sanitize(String((req.body || {}).note || ''), 1000);
      if (!MANUAL_STATUSES.includes(status)) return res.status(400).json({ error: 'Statut invalide.' });
      const campaign = p.campaignId ? await ProspectCampaign.findById(p.campaignId).lean() : null;
      let lead = null;
      if (status === 'qualifie') {
        if (!p.email) return res.status(400).json({ error: 'Ajoutez d’abord une adresse e-mail.' });
        if (engine.nextStepOf(p) === null) return res.status(400).json({ error: 'Séquence déjà terminée.' });
        p.status = engine.nextStepOf(p) === 0 ? 'qualifie' : (engine.nextStepOf(p) === 1 ? 'contacte' : 'relance_1');
        p.nextActionAt = new Date();
      } else {
        p.status = status;
        p.nextActionAt = null;
      }
      if (status === 'interesse' || status === 'converti') {
        lead = await engine.upsertLeadFromProspect(p, campaign, (status === 'interesse' ? 'marqué intéressé' : 'converti') + (note ? ' — ' + note : ''), 'qualifie');
      }
      if (status === 'desinscrit' && p.email) {
        await Suppression.updateOne({ email: p.email }, { $setOnInsert: { email: p.email, reason: 'manuel', note: 'Désinscrit depuis le tableau de bord', createdAt: new Date() } }, { upsert: true });
      }
      if (note) p.notes = ((p.notes ? p.notes + '\n' : '') + '[' + new Date().toISOString().slice(0, 10) + '] ' + note).slice(-5000);
      p.lastActionAt = new Date();
      await p.save();
      res.json({ success: true, prospect: prospectSummary(p), leadId: lead ? String(lead._id) : (p.leadId ? String(p.leadId) : null) });
    } catch (e) { fail(res, e, 'prospect.status'); }
  });

  app.post('/api/admin/prospection/prospects/:id/email', ...A, async (req, res) => {
    try {
      const p = await loadProspect(req, res); if (!p) return;
      const email = sanitizeEmail((req.body || {}).email);
      if (!isValidEmail(email) || !core.isPlausibleBusinessEmail(email)) return res.status(400).json({ error: 'Adresse e-mail invalide.' });
      p.email = email; p.emailSource = 'manuel';
      if (['sans_email', 'nouveau'].includes(p.status)) { p.status = 'qualifie'; p.nextActionAt = new Date(); }
      p.lastActionAt = new Date();
      await p.save();
      res.json({ success: true, prospect: prospectSummary(p) });
    } catch (e) { fail(res, e, 'prospect.email'); }
  });

  // « Envoyer maintenant » : en mode test (ou prospect de test), l'e-mail part vers l'adresse de test.
  app.post('/api/admin/prospection/prospects/:id/send', ...A, testLimiter, async (req, res) => {
    try {
      const p = await loadProspect(req, res); if (!p) return;
      const cfg = await engine.getConfig();
      if (p.isTest || cfg.testMode) {
        const r = await engine.sendTestEmail(p, null);
        return r.ok ? res.json({ success: true, test: true, message: 'E-mail de test envoyé à ' + r.testEmail + '.' }) : res.status(502).json({ error: r.error || 'Envoi impossible.' });
      }
      if (!cfg.enabled) return res.status(400).json({ error: 'L’agent est désactivé : activez l’interrupteur général pour envoyer.' });
      const active = await ProspectCampaign.find({ status: 'active', isTest: { $ne: true } }).lean();
      const budget = await engine.computeBudget(cfg, active.length ? active : [{ dailyLimit: cfg.globalCap }]);
      if (budget.remaining <= 0) return res.status(429).json({ error: 'Quota d’envois du jour atteint (' + budget.dailyCap + ').' });
      const campaign = await ProspectCampaign.findById(p.campaignId);
      if (!campaign) return res.status(400).json({ error: 'Campagne introuvable.' });
      if (p.status === 'qualifie' || p.status === 'contacte' || p.status === 'relance_1') { /* ok */ } else return res.status(400).json({ error: 'Ce prospect n’est pas dans une séquence d’envoi.' });
      const r = await engine.sendStep(p, campaign, {});
      if (r.blocked) return res.status(400).json({ error: 'Envoi bloqué : ' + r.blocked + '.' });
      if (!r.ok) return res.status(502).json({ error: r.error || 'Envoi impossible.' });
      res.json({ success: true, message: 'E-mail envoyé à ' + p.email + '.' });
    } catch (e) { fail(res, e, 'prospect.send'); }
  });

  // « M’envoyer cet e-mail » : toujours vers l'adresse de test, même agent désactivé.
  app.post('/api/admin/prospection/prospects/:id/send-test', ...A, testLimiter, async (req, res) => {
    try {
      const p = await loadProspect(req, res); if (!p) return;
      const b = req.body || {};
      const step = b.step === undefined || b.step === null || b.step === '' ? null : intIn(b.step, 0, 2, 0);
      const r = await engine.sendTestEmail(p, step);
      if (!r.ok) return res.status(502).json({ error: r.error || 'Envoi impossible.' });
      res.json({ success: true, message: 'E-mail de test envoyé à ' + r.testEmail + '.' });
    } catch (e) { fail(res, e, 'prospect.sendTest'); }
  });

  app.delete('/api/admin/prospection/prospects/:id', ...A, async (req, res) => {
    try {
      const p = await loadProspect(req, res); if (!p) return;
      if (!p.isTest) return res.status(400).json({ error: 'Seuls les prospects de test peuvent être supprimés (marquez les autres « Pas intéressé »).' });
      await p.deleteOne();
      res.json({ success: true });
    } catch (e) { fail(res, e, 'prospect.delete'); }
  });

  // Prospect de test : analyse réelle + rédaction immédiate.
  app.post('/api/admin/prospection/test-prospect', ...A, testLimiter, async (req, res) => {
    try {
      const b = req.body || {};
      const name = sanitize(String(b.name || ''), 120);
      if (name.length < 2) return res.status(400).json({ error: 'Nom de l’entreprise requis.' });
      const website = b.website ? core.normalizeWebsite(sanitize(String(b.website), 300)) : '';
      if (b.website && !website) return res.status(400).json({ error: 'Adresse du site invalide.' });
      const email = b.email ? sanitizeEmail(b.email) : '';
      if (email && !isValidEmail(email)) return res.status(400).json({ error: 'Adresse e-mail invalide.' });
      const campaignId = b.campaignId && RX_ID.test(String(b.campaignId)) ? String(b.campaignId) : null;
      const r = await engine.createTestProspect({ name, city: sanitize(String(b.city || ''), 60), website, email, phone: sanitize(String(b.phone || ''), 30), campaignId });
      const preview = await engine.previewFor(r.prospect, 0, {});
      res.json({ success: true, prospectId: String(r.prospect._id), preview, audit: r.prospect.audit, score: r.prospect.score, email: r.prospect.email, emailSource: r.prospect.emailSource });
    } catch (e) { fail(res, e, 'testProspect'); }
  });

  // ------------------------------------------------------------------ cycle manuel
  app.post('/api/admin/prospection/run', ...A, runLimiter, async (req, res) => {
    try { const run = await engine.runCycle({ trigger: 'manuel' }); res.json({ success: true, run }); }
    catch (e) { fail(res, e, 'run'); }
  });
  app.get('/api/admin/prospection/runs', ...A, async (req, res) => {
    try { res.json({ runs: await ProspectRun.find().sort({ startedAt: -1 }).limit(30).lean() }); } catch (e) { fail(res, e, 'runs'); }
  });

  // ------------------------------------------------------------------ liste d'exclusion
  app.get('/api/admin/prospection/suppressions', ...A, async (req, res) => {
    try {
      const f = {};
      const qs = sanitize(String(req.query.q || ''), 80);
      if (qs) f.email = new RegExp(escRx(qs.toLowerCase()), 'i');
      const page = intIn(req.query.page, 1, 1000, 1);
      const [items, total] = await Promise.all([Suppression.find(f).sort({ createdAt: -1 }).skip((page - 1) * 50).limit(50).lean(), Suppression.countDocuments(f)]);
      res.json({ suppressions: items, total, page, pages: Math.max(1, Math.ceil(total / 50)) });
    } catch (e) { fail(res, e, 'suppressions'); }
  });
  app.post('/api/admin/prospection/suppressions', ...A, async (req, res) => {
    try {
      const email = sanitizeEmail((req.body || {}).email);
      if (!isValidEmail(email)) return res.status(400).json({ error: 'Adresse e-mail invalide.' });
      await Suppression.updateOne({ email }, { $setOnInsert: { email, reason: 'manuel', note: sanitize(String((req.body || {}).note || ''), 300), createdAt: new Date() } }, { upsert: true });
      await Prospect.updateMany({ email, isTest: { $ne: true }, status: { $in: ['nouveau', 'qualifie', 'contacte', 'relance_1', 'sans_email'] } }, { $set: { status: 'desinscrit', nextActionAt: null } });
      res.json({ success: true });
    } catch (e) { fail(res, e, 'suppression.add'); }
  });
  app.delete('/api/admin/prospection/suppressions/:id', ...A, async (req, res) => {
    try {
      if (!RX_ID.test(req.params.id)) return res.status(400).json({ error: 'Identifiant invalide.' });
      await Suppression.deleteOne({ _id: req.params.id });
      res.json({ success: true });
    } catch (e) { fail(res, e, 'suppression.delete'); }
  });

  // ------------------------------------------------------------------ cron
  app.get('/api/cron/prospection', async (req, res) => {
    try {
      const secret = process.env.CRON_SECRET || ((await Setting.findOne({ key: 'cronSecret' }).lean()) || {}).value || '';
      const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
      let ok;
      if (secret) ok = safeEqual(bearer, secret) || safeEqual(req.query.secret, secret);
      else {
        const ua = String(req.headers['user-agent'] || '').toLowerCase();
        ok = ua.includes('vercel-cron') || !!req.headers['x-vercel-cron'];
      }
      if (!ok) return res.status(401).json({ error: 'Non autorisé.' });
      const run = await engine.runCycle({ trigger: 'cron' });
      res.json({ success: true, sent: run.sent, discovered: run.discovered, enriched: run.enriched, durationMs: run.durationMs });
    } catch (e) { console.error('[cron.prospection]', e.message); res.status(500).json({ error: 'Erreur cron.' }); }
  });

  // ------------------------------------------------------------------ webhook Resend
  app.post('/api/prospection/webhook', webhookLimiter, async (req, res) => {
    try {
      const secret = String(process.env.RESEND_WEBHOOK_SECRET || '').trim();
      if (!secret) return res.status(503).json({ error: 'Webhook non configuré.' });
      const raw = typeof req.rawBody === 'string' ? req.rawBody : '';
      const v = core.verifySvix({
        secret, id: req.headers['svix-id'], timestamp: req.headers['svix-timestamp'], signature: req.headers['svix-signature'], rawBody: raw,
      });
      if (!v.ok) return res.status(401).json({ error: 'Signature invalide.' });
      let evt;
      try { evt = JSON.parse(raw); } catch (e) { return res.status(400).json({ error: 'Corps invalide.' }); }
      const r = await engine.handleWebhookEvent(evt);
      res.json({ received: true, handled: !!r.handled });
    } catch (e) { console.error('[prospection.webhook]', e.message); res.status(500).json({ error: 'Erreur serveur.' }); }
  });

  // ------------------------------------------------------------------ désinscription (public)
  function unsubPage(title, bodyHtml, status) {
    return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<meta name="robots" content="noindex,nofollow"><title>' + core.escHtml(title) + ' · Pirabel Labs</title>' +
      '<style>body{margin:0;background:#f6f3ef;color:#17120f;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.6}' +
      'main{max-width:34rem;margin:8vh auto;padding:0 16px}.card{background:#fff;border:1px solid #ece5de;border-radius:18px;padding:32px 28px;box-shadow:0 20px 50px -30px rgba(0,0,0,.25)}' +
      '.brand{font-weight:800;font-size:1.05rem;margin:0 0 18px;color:#17120f;text-decoration:none;display:inline-block}h1{font-size:1.45rem;line-height:1.25;margin:0 0 12px}' +
      'p{margin:0 0 14px;color:#4a413b}button{font:inherit;font-weight:700;background:#FF5500;color:#140700;border:0;border-radius:12px;padding:13px 22px;cursor:pointer;min-height:44px}' +
      'button:hover{background:#ff6a1a}button:focus-visible,a:focus-visible{outline:3px solid #B83A00;outline-offset:3px}a{color:#B83A00;font-weight:600}.small{font-size:.88rem;color:#6b605a}</style></head>' +
      '<body><main><div class="card"><a class="brand" href="https://www.pirabellabs.com">Pirabel Labs</a>' + bodyHtml + '</div></main></body></html>';
  }
  app.get('/desinscription/:token', unsubLimiter, async (req, res) => {
    try {
      res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Content-Type': 'text/html; charset=utf-8' });
      const p = await engine.prospectFromToken(req.params.token);
      if (!p) return res.status(404).send(unsubPage('Lien invalide', '<h1>Lien invalide ou expiré</h1><p>Pour ne plus recevoir nos messages, écrivez-nous à <a href="mailto:contact@pirabellabs.com?subject=D%C3%A9sinscription">contact@pirabellabs.com</a> : nous vous retirons de nos listes immédiatement.</p>'));
      if (p.status === 'desinscrit') return res.send(unsubPage('Désinscription confirmée', '<h1>Vous êtes déjà désinscrit</h1><p>Vous ne recevrez plus de messages de prospection de Pirabel Labs.</p>'));
      const action = '/desinscription/' + encodeURIComponent(req.params.token);
      res.send(unsubPage('Se désinscrire', '<h1>Ne plus recevoir nos messages</h1>' +
        '<p>Confirmez pour ne plus recevoir de messages de prospection de Pirabel Labs à l’adresse associée à <strong>' + core.escHtml(p.name) + '</strong>.</p>' +
        '<form method="post" action="' + core.escHtml(action) + '"><button type="submit">Confirmer la désinscription</button></form>' +
        '<p class="small" style="margin-top:18px;">Nous avions trouvé votre entreprise sur Google Maps, où ses coordonnées sont publiques. Pirabel Labs, agence web et marketing digital, Abomey-Calavi (Bénin).</p>'));
    } catch (e) { console.error('[unsub.get]', e.message); res.status(500).send('Erreur serveur.'); }
  });
  // Confirmation par le formulaire ou désinscription « en un clic » (List-Unsubscribe-Post) envoyée par la messagerie.
  app.post('/desinscription/:token', unsubLimiter, express.urlencoded({ extended: false, limit: '2kb' }), async (req, res) => {
    try {
      res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'Content-Type': 'text/html; charset=utf-8' });
      const r = await engine.unsubscribe(req.params.token);
      if (!r.ok) return res.status(404).send(unsubPage('Lien invalide', '<h1>Lien invalide ou expiré</h1><p>Écrivez-nous à <a href="mailto:contact@pirabellabs.com?subject=D%C3%A9sinscription">contact@pirabellabs.com</a> : nous vous retirons de nos listes immédiatement.</p>'));
      res.send(unsubPage('Désinscription confirmée', '<h1>Désinscription confirmée</h1><p>Vous ne recevrez plus de messages de prospection de Pirabel Labs. Merci de votre retour, et belle continuation.</p>'));
    } catch (e) { console.error('[unsub.post]', e.message); res.status(500).send('Erreur serveur.'); }
  });
};
