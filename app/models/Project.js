const mongoose = require('mongoose');
const { sanitize } = require('../middleware/security');

const STEP_STATUSES = ['a_venir', 'en_cours', 'termine', 'bloque'];
const PROJECT_STATUSES = ['cadrage', 'en_cours', 'en_revue', 'livre', 'suspendu'];
const MAX_STEPS = 30;

// Etape de suivi affichee au client dans son espace (barre de progression).
const stepSchema = new mongoose.Schema({
  label: { type: String, required: true, maxlength: 120 },   // ex. « Maquettes validées »
  description: { type: String, default: '', maxlength: 600 },
  status: { type: String, enum: STEP_STATUSES, default: 'a_venir' },
  dueDate: { type: Date },         // échéance prévue de l'étape (optionnelle)
  completedAt: { type: Date },
}, { _id: false });

// Projet client : le fil conducteur de l'espace client (suivi, livrables, echeances).
const projectSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  clientName: { type: String, default: '', maxlength: 200 },
  clientEmail: { type: String, default: '', lowercase: true, maxlength: 200 },

  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 4000 },
  service: { type: String, default: '', maxlength: 120 },   // site web, SEO, automatisation...

  status: { type: String, enum: PROJECT_STATUSES, default: 'cadrage', index: true },
  steps: { type: [stepSchema], default: [] },

  startedAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
  deliveredAt: { type: Date },

  // Lien vers le projet en ligne une fois livre (prevision / recette)
  previewUrl: { type: String, default: '', maxlength: 500 },
  liveUrl: { type: String, default: '', maxlength: 500 },

  internalNotes: { type: String, default: '', maxlength: 5000 },   // jamais expose au client
  lastNotifiedAt: { type: Date },                                   // dernier e-mail de suivi envoyé au client
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

// ---------------------------------------------------------------------------
// Fonctions pures (utilisables sur un document comme sur un objet .lean()).
// ---------------------------------------------------------------------------
function progressOf(p) {
  const steps = (p && Array.isArray(p.steps)) ? p.steps : [];
  if (!steps.length) return p && p.status === 'livre' ? 100 : 0;
  return Math.round((steps.filter(s => s.status === 'termine').length / steps.length) * 100);
}
// Étape en cours (ou bloquée), sinon la prochaine à venir.
function currentStepOf(p) {
  const steps = (p && Array.isArray(p.steps)) ? p.steps : [];
  return steps.find(s => s.status === 'en_cours' || s.status === 'bloque') || steps.find(s => s.status === 'a_venir') || null;
}
// Étape qui suivra l'étape courante.
function nextStepOf(p) {
  const steps = (p && Array.isArray(p.steps)) ? p.steps : [];
  const cur = currentStepOf(p);
  if (!cur) return null;
  const i = steps.indexOf(cur);
  return steps.slice(i + 1).find(s => s.status !== 'termine') || null;
}

// Modèles d'étapes par type de prestation (l'admin les ajuste ensuite librement).
const STEP_TEMPLATES = {
  site_web: {
    label: 'Site web',
    steps: ['Cadrage et brief', 'Arborescence et contenus', 'Maquettes graphiques', 'Validation des maquettes', 'Développement', 'Intégration des contenus', 'Recette et corrections', 'Mise en ligne', 'Formation et passation'],
  },
  e_commerce: {
    label: 'E-commerce',
    steps: ['Cadrage et catalogue', 'Maquettes de la boutique', 'Validation des maquettes', 'Développement de la boutique', 'Paiements (Mobile Money, carte) et livraison', 'Import des produits', 'Recette et commandes de test', 'Mise en ligne', 'Formation à la gestion de la boutique'],
  },
  seo: {
    label: 'SEO',
    steps: ['Audit technique et sémantique', 'Recherche de mots-clés', 'Plan d’action priorisé', 'Corrections techniques', 'Optimisation des contenus existants', 'Création de nouveaux contenus', 'Netlinking', 'Rapport de résultats'],
  },
  application: {
    label: 'Application / SaaS',
    steps: ['Atelier de cadrage', 'Spécifications fonctionnelles', 'Maquettes UX/UI', 'Validation des maquettes', 'Architecture technique', 'Développement par itérations', 'Tests et recette', 'Déploiement en production', 'Suivi et maintenance'],
  },
  community_management: {
    label: 'Community management',
    steps: ['Audit des réseaux sociaux', 'Stratégie éditoriale', 'Charte et gabarits visuels', 'Calendrier éditorial', 'Production des contenus', 'Publication et animation', 'Rapport mensuel'],
  },
  automatisation: {
    label: 'Automatisation',
    steps: ['Analyse des processus', 'Cartographie des flux', 'Choix des outils', 'Mise en place des automatisations', 'Tests sur des cas réels', 'Mise en production', 'Formation de l’équipe', 'Suivi et ajustements'],
  },
  autre: {
    label: 'Autre prestation',
    steps: ['Cadrage', 'Production', 'Validation', 'Livraison'],
  },
};

// Devine le modèle à partir d'un libellé de service libre (« création de site vitrine », « seo-local »…).
function templateKeyForService(service) {
  const s = String(service || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (STEP_TEMPLATES[s]) return s;
  if (/e-?commerce|boutique|shop/.test(s)) return 'e_commerce';
  if (/seo|referencement/.test(s)) return 'seo';
  if (/saas|application|appli|app\b|logiciel|mobile/.test(s)) return 'application';
  if (/community|reseaux|social/.test(s)) return 'community_management';
  if (/automati|workflow|\bia\b|agent/.test(s)) return 'automatisation';
  if (/site|web|vitrine|landing/.test(s)) return 'site_web';
  return 'autre';
}

function stepsFromTemplate(key) {
  const t = STEP_TEMPLATES[key] || STEP_TEMPLATES.autre;
  return t.steps.map(label => ({ label, description: '', status: 'a_venir' }));
}

function validDate(v) {
  if (v === null || v === undefined || v === '') return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d;
}

// Nettoie un tableau d'étapes envoyé par l'admin (ajout, renommage, ordre, statut).
// Retourne { steps } ou { error }.
function normalizeSteps(input) {
  if (!Array.isArray(input)) return { error: 'Étapes invalides.' };
  if (input.length > MAX_STEPS) return { error: `${MAX_STEPS} étapes au maximum.` };
  const steps = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const label = sanitize(String(raw.label || ''), 120);
    if (!label) return { error: 'Chaque étape doit avoir un intitulé.' };
    const status = STEP_STATUSES.includes(raw.status) ? raw.status : 'a_venir';
    const step = { label, description: sanitize(String(raw.description || ''), 600), status };
    const due = validDate(raw.dueDate);
    if (due) step.dueDate = due;
    if (status === 'termine') step.completedAt = validDate(raw.completedAt) || new Date();
    steps.push(step);
  }
  return { steps };
}

// URL publique affichable (http/https uniquement) ; '' si vide ; null si invalide.
function normalizeUrl(v) {
  const s = String(v == null ? '' : v).trim().slice(0, 500);
  if (!s) return '';
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:') return null;
    return u.toString();
  } catch (e) { return null; }
}

projectSchema.statics.STEP_STATUSES = STEP_STATUSES;
projectSchema.statics.PROJECT_STATUSES = PROJECT_STATUSES;
projectSchema.statics.STEP_TEMPLATES = STEP_TEMPLATES;
projectSchema.statics.progressOf = progressOf;
projectSchema.statics.currentStepOf = currentStepOf;
projectSchema.statics.nextStepOf = nextStepOf;
projectSchema.statics.templateKeyForService = templateKeyForService;
projectSchema.statics.stepsFromTemplate = stepsFromTemplate;
projectSchema.statics.normalizeSteps = normalizeSteps;
projectSchema.statics.normalizeUrl = normalizeUrl;

// Progression calculee : part des etapes terminees.
projectSchema.virtual('progress').get(function () { return progressOf(this); });
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

projectSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('Project', projectSchema);
