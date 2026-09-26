/**
 * Qualification des demandes (formulaire en étapes de /contact).
 *
 * Source unique des questions : app/qualification.json (lu aussi par le
 * formulaire côté navigateur). Ici, le serveur fait foi : toute valeur hors
 * liste est ignorée, les champs obligatoires sont revérifiés, le score est
 * recalculé sans jamais faire confiance au client.
 */
const Q = require('./qualification.json');
const { stripTags } = require('./middleware/security');

// Barème : côté serveur uniquement (s'il était dans le JSON partagé, il partirait dans le
// bundle du navigateur et un spammeur pourrait viser un score « chaud »).
const SCORING = {
  "budget": {
    "b1": 6,
    "b2": 16,
    "b3": 26,
    "b4": 34,
    "b5": 40,
    "nsp": 10
  },
  "timeline": {
    "asap": 25,
    "1m": 21,
    "3m": 13,
    "later": 6,
    "explore": 0
  },
  "size": {
    "solo": 3,
    "tpe": 8,
    "pme": 12,
    "eti": 15,
    "asso": 5
  },
  "maturity": {
    "creation": 2,
    "jeune": 5,
    "etablie": 8
  },
  "descriptionMin": 40,
  "descriptionPoints": 6,
  "phonePoints": 4,
  "websitePoints": 2,
  "hot": 65,
  "warm": 40
};

const byId = (list) => new Map(list.map((o) => [o.id, o]));
const PROJECTS = byId(Q.projects);
const GOALS = byId(Q.goals);
const SIZES = byId(Q.companySizes);
const MATURITY = byId(Q.maturity);
const SECTORS = byId(Q.sectors);
const BUDGET_TYPES = byId(Q.budgetTypes);
const TIMELINES = byId(Q.timelines);
const ASSETS = byId(Q.assets);
const CHANNELS = byId(Q.channels);
const COUNTRIES = new Map(Q.countries.map((c) => [c.code, c]));
const TIERS = new Set([...Q.budgetTiers, Q.budgetUnknown.id]);

// Texte libre : sans balises, sans caractères de contrôle, longueur bornée.
function cleanText(value, max) {
  if (typeof value !== 'string') return '';
  // Même retrait linéaire des balises que security.js (évite le ReDoS de /<[^>]*>/g).
  return stripTags(value.slice(0, max * 2 + 200))
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .trim()
    .slice(0, max);
}
const cleanLine = (value, max) => cleanText(value, max).replace(/\s+/g, ' ');

const pickOne = (value, map) => (typeof value === 'string' && map.has(value) ? value : '');
function pickMany(value, map, max = 20) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v) => typeof v === 'string' && map.has(v)))].slice(0, max);
}

function cleanUrl(value) {
  let raw = cleanLine(value, 300);
  if (!raw) return '';
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw;
  try {
    const u = new URL(raw);
    if (!['http:', 'https:'].includes(u.protocol) || !u.hostname.includes('.')) return '';
    return u.href.slice(0, 300);
  } catch (e) {
    return '';
  }
}

function cleanPhone(value) {
  const raw = cleanLine(value, 30);
  return /^[+()\d\s.\-]{6,30}$/.test(raw) ? raw : '';
}

function isValidEmail(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Réponses détaillées par projet : seules les questions et options connues passent.
function cleanDetails(projects, raw) {
  const out = {};
  const src = raw && typeof raw === 'object' ? raw : {};
  for (const pid of projects) {
    const def = Q.details[pid];
    if (!def) continue;
    const given = src[pid] && typeof src[pid] === 'object' ? src[pid] : {};
    const answers = {};
    for (const q of def.questions) {
      const opts = byId(q.options);
      const v = q.type === 'multi' ? pickMany(given[q.id], opts) : pickOne(given[q.id], opts);
      if (v && v.length) answers[q.id] = v;
    }
    out[pid] = answers;
  }
  return out;
}

/**
 * Valide le corps de la requête. Renvoie { ok, error, data }.
 * `error` est un message en français prêt à afficher.
 */
function validateQualification(body) {
  const b = body && typeof body === 'object' ? body : {};
  const contact = b.contact && typeof b.contact === 'object' ? b.contact : {};

  const projects = pickMany(b.projects, PROJECTS, Q.maxProjects);
  if (!projects.length) return { ok: false, error: 'Choisissez au moins un type de projet.' };

  const country = typeof b.country === 'string' && COUNTRIES.has(b.country) ? b.country : '';
  if (!country) return { ok: false, error: 'Indiquez votre pays.' };

  const goal = pickOne(b.goal, GOALS);
  if (!goal) return { ok: false, error: 'Indiquez votre objectif principal.' };

  const size = pickOne(b.size, SIZES);
  if (!size) return { ok: false, error: 'Indiquez la taille de votre structure.' };

  const budget = typeof b.budget === 'string' && TIERS.has(b.budget) ? b.budget : '';
  if (!budget) return { ok: false, error: 'Indiquez une fourchette de budget.' };

  const timeline = pickOne(b.timeline, TIMELINES);
  if (!timeline) return { ok: false, error: 'Indiquez quand vous souhaitez démarrer.' };

  const name = cleanLine(contact.name, 120);
  if (name.length < 2) return { ok: false, error: 'Indiquez votre nom.' };

  const email = cleanLine(contact.email, 254).toLowerCase();
  if (!isValidEmail(email)) return { ok: false, error: 'Adresse e-mail invalide.' };

  if (contact.consent !== true) {
    return { ok: false, error: 'Merci d’accepter d’être recontacté pour que nous puissions vous répondre.' };
  }

  const assets = pickMany(b.assets, ASSETS);
  const data = {
    projects,
    details: cleanDetails(projects, b.details),
    country,
    currency: COUNTRIES.get(country).currency,
    city: cleanLine(b.city, 80),
    goal,
    size,
    maturity: pickOne(b.maturity, MATURITY),
    sector: pickOne(b.sector, SECTORS),
    sectorOther: cleanLine(b.sectorOther, 80),
    budgetType: pickOne(b.budgetType, BUDGET_TYPES) || 'projet',
    budget,
    timeline,
    assets: assets.includes('rien') ? ['rien'] : assets,
    websiteUrl: assets.includes('site') ? cleanUrl(b.websiteUrl) : '',
    description: cleanText(b.description, 3000),
    contact: {
      name,
      email,
      phone: cleanPhone(contact.phone),
      company: cleanLine(contact.company, 120),
      channel: pickOne(contact.channel, CHANNELS) || 'email',
    },
    context: {
      page: cleanLine(b.context && b.context.page, 200),
      referrer: cleanLine(b.context && b.context.referrer, 300),
      utmSource: cleanLine(b.context && b.context.utmSource, 80),
      utmMedium: cleanLine(b.context && b.context.utmMedium, 80),
      utmCampaign: cleanLine(b.context && b.context.utmCampaign, 120),
    },
  };
  return { ok: true, data };
}

// Score 0-100 recalculé côté serveur + étiquette froid / tiède / chaud.
function scoreQualification(d) {
  const s = SCORING;
  let score = (s.budget[d.budget] || 0) + (s.timeline[d.timeline] || 0) + (s.size[d.size] || 0) + (s.maturity[d.maturity] || 0);
  if (d.description.length >= s.descriptionMin) score += s.descriptionPoints;
  if (d.contact.phone) score += s.phonePoints;
  if (d.websiteUrl) score += s.websitePoints;
  score = Math.max(0, Math.min(100, score));
  const label = score >= s.hot ? 'chaud' : score >= s.warm ? 'tiede' : 'froid';

  const flags = [];
  if (d.timeline === 'asap') flags.push('Démarrage urgent');
  if (d.budget === 'b1' && d.projects.some((p) => ['app', 'ecommerce'].includes(p))) flags.push('Budget à clarifier pour ce type de projet');
  if (d.budget === Q.budgetUnknown.id) flags.push('Budget à construire ensemble');
  return { score, label, flags };
}

const optLabel = (list, id) => {
  const o = list.find((x) => x.id === id);
  return o ? o.label : '';
};
function budgetLabel(d) {
  if (d.budget === Q.budgetUnknown.id) return Q.budgetUnknown.label;
  const labels = Q.budgetLabels[d.currency] || Q.budgetLabels.EUR;
  const i = Q.budgetTiers.indexOf(d.budget);
  const suffix = d.budgetType === 'mensuel' ? ' par mois' : ' (projet ponctuel)';
  return (labels[i] || '') + suffix;
}

// Résumé lisible (e-mail admin, fiche prospect, assistante IA).
function summarizeQualification(d, sc) {
  const lines = [];
  const labelTag = { chaud: 'chaud', tiede: 'tiède', froid: 'froid' }[sc.label];
  lines.push(`Demande qualifiée en ligne — score ${sc.score}/100 (${labelTag})`);
  if (sc.flags.length) lines.push('Points d’attention : ' + sc.flags.join(' · '));
  lines.push('');
  lines.push('Projets : ' + d.projects.map((p) => PROJECTS.get(p).label).join(', '));
  for (const pid of d.projects) {
    const def = Q.details[pid];
    const ans = d.details[pid];
    if (!def || !ans || !Object.keys(ans).length) continue;
    const parts = def.questions
      .filter((q) => ans[q.id])
      .map((q) => {
        const v = Array.isArray(ans[q.id]) ? ans[q.id] : [ans[q.id]];
        return q.short + ' : ' + v.map((id) => optLabel(q.options, id)).join(', ');
      });
    lines.push('— ' + PROJECTS.get(pid).label + ' → ' + parts.join(' · '));
  }
  lines.push('Objectif principal : ' + GOALS.get(d.goal).label);
  const sector = d.sector === 'autre' && d.sectorOther ? d.sectorOther : optLabel(Q.sectors, d.sector);
  lines.push('Structure : ' + [SIZES.get(d.size).label, optLabel(Q.maturity, d.maturity), sector].filter(Boolean).join(' · '));
  lines.push('Localisation : ' + [d.city, COUNTRIES.get(d.country).label].filter(Boolean).join(', '));
  lines.push('Budget : ' + budgetLabel(d));
  lines.push('Démarrage : ' + TIMELINES.get(d.timeline).label);
  if (d.assets.length) {
    lines.push('Existant : ' + d.assets.map((a) => optLabel(Q.assets, a) + (a === 'site' && d.websiteUrl ? ' (' + d.websiteUrl + ')' : '')).join(', '));
  }
  lines.push('Canal préféré : ' + CHANNELS.get(d.contact.channel).label);
  if (d.description) {
    lines.push('');
    lines.push('Description :');
    lines.push(d.description);
  }
  return lines.join('\n');
}

const projectLabels = (d) => d.projects.map((p) => PROJECTS.get(p).label).join(', ');
const timelineLabel = (d) => TIMELINES.get(d.timeline).label;

module.exports = {
  QUALIFICATION: Q,
  validateQualification,
  scoreQualification,
  summarizeQualification,
  budgetLabel,
  projectLabels,
  timelineLabel,
  primaryService: (d) => PROJECTS.get(d.projects[0]).service,
};
