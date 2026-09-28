/**
 * Pirabel Labs - Vercel serverless entry point.
 *
 * Endpoints :
 *   POST   /api/contact                 (public, soumission formulaire)
 *   POST   /api/admin/login             (login admin)
 *   POST   /api/admin/logout            (logout)
 *   GET    /api/admin/me                (session check)
 *   GET    /api/admin/leads             (liste leads, admin)
 *   GET    /api/admin/leads/:id         (detail lead, admin)
 *   PATCH  /api/admin/leads/:id         (update status/notes, admin)
 *   DELETE /api/admin/leads/:id         (delete lead, admin)
 *   GET    /api/health                  (status check)
 *
 * Admin views servies statiquement :
 *   GET /pirabel-admin-7x9k2m -> app/views/admin-login.html
 *   GET /admin/leads          -> app/views/admin-leads.html
 */
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
// Signature des articles du blog : l'agence, jamais une personne.
const BLOG_TEAM = 'L’équipe Pirabel Labs';

const connectDB = require('../app/config/db');
const { sendEmail, masterTemplate, newOrderEmail, infoTable: emailInfoTable, EMAIL_STYLES: ES,
  newApplicationAdminEmail, applicationConfirmationEmail, applicationStatusEmail, STATUS_MESSAGES,
} = require('../app/config/email');
const {
  rateLimit, sanitize, sanitizeSoft, sanitizeEmail, honeypotCheck, limitBody,
  isValidEmail, securityHeaders, globalSanitize,
} = require('../app/middleware/security');
const { auth, adminOnly } = require('../app/middleware/auth');
const siteNav = require('../app/nav'); // en-tête de site partagé (mega menu) pour blog/réalisations/témoignages
const {
  validateQualification, scoreQualification, summarizeQualification, qualificationRows,
  budgetLabel: qualificationBudgetLabel, primaryService: qualificationPrimaryService,
  projectLabels: qualificationProjectLabels, timelineLabel: qualificationTimelineLabel,
} = require('../app/qualification'); // formulaire en étapes de /contact
const AI = require('../app/agents'); // registre des agents IA (rôles, prompts, modèles) + client OpenRouter
const User = require('../app/models/User');
const Lead = require('../app/models/Lead');
const Media = require('../app/models/Media');
const Quote = require('../app/models/Quote');
const Invoice = require('../app/models/Invoice');
const Review = require('../app/models/Review');
const TrafficStat = require('../app/models/TrafficStat');
const Article = require('../app/models/Article');
const CaseStudy = require('../app/models/CaseStudy');
const LivreBlanc = require('../app/models/LivreBlanc');
const Comment = require('../app/models/Comment');
const Task = require('../app/models/Task');
const Conversation = require('../app/models/Conversation');
const PendingAction = require('../app/models/PendingAction');
const Project = require('../app/models/Project');
const ClientMessage = require('../app/models/ClientMessage');
const ChatSession = require('../app/models/ChatSession');
const Expense = require('../app/models/Expense');
const Job = require('../app/models/Job');
const Application = require('../app/models/Application');
const SentEmail = require('../app/models/SentEmail');
const Setting = require('../app/models/Setting');
const Appointment = require('../app/models/Appointment');
const Counter = require('../app/models/Counter');

// ========================================================================
// === MONNAIE, NUMÉROTATION, STATUTS (devis / factures) ===
// ========================================================================
const DEVISES = ['EUR', 'USD', 'CAD', 'XOF', 'XAF', 'MAD', 'TND', 'GNF', 'CHF'];
const DEVISES_SANS_DECIMALES = ['XOF', 'XAF', 'GNF'];
// Fuseau de l'agence (Bénin, UTC+1 toute l'année, sans heure d'été).
const TZ_AGENCE = 'Africa/Porto-Novo';
const DECALAGE_AGENCE_MS = 3600000;

function decimalesDevise(devise) { return DEVISES_SANS_DECIMALES.includes(devise) ? 0 : 2; }
function arrondiDevise(v, devise) {
  const f = Math.pow(10, decimalesDevise(devise));
  return Math.round((Number(v) || 0) * f) / f;
}
// Format monétaire unique (e-mails, messages) : pas de décimales pour XOF / XAF / GNF.
function moneyFmt(amount, currency) {
  const cur = DEVISES.includes(currency) ? currency : 'EUR';
  const d = decimalesDevise(cur);
  try {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: cur, minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(amount) || 0);
  } catch (e) { return (Number(amount) || 0).toFixed(d) + ' ' + cur; }
}

// Libellés affichés (jamais de code brut côté utilisateur).
const LIBELLES_STATUT_DEVIS = { brouillon: 'Brouillon', envoye: 'Envoyé', consulte: 'Consulté', accepte: 'Accepté', refuse: 'Refusé', expire: 'Expiré', annule: 'Annulé' };
const LIBELLES_STATUT_FACTURE = { brouillon: 'Brouillon', envoyee: 'Envoyée', consultee: 'Consultée', partiellement_payee: 'Partiellement payée', payee: 'Payée', en_retard: 'En retard', annulee: 'Annulée' };
const MOYENS_PAIEMENT = ['Virement', 'Mobile Money', 'Espèces', 'Carte', 'Chèque', 'Autre'];

// Statut réel d'un devis à l'instant T : un devis envoyé/consulté dont la validité est
// dépassée est « expiré », même si la base n'a pas encore été mise à jour.
function statutDevisEffectif(q, now) {
  if (!q) return '';
  if (['envoye', 'consulte'].includes(q.status) && q.validUntil && new Date(q.validUntil) < (now || new Date())) return 'expire';
  return q.status;
}
function exposerDevis(q) {
  const o = q && typeof q.toObject === 'function' ? q.toObject() : Object.assign({}, q);
  o.status = statutDevisEffectif(q);
  return o;
}
function exposerFacture(inv) {
  const o = inv && typeof inv.toObject === 'function' ? inv.toObject() : Object.assign({}, inv);
  o.status = Invoice.effectiveStatus(inv);
  o.amountPaid = Invoice.amountPaidOf(inv);
  o.balanceDue = Invoice.balanceOf(inv);
  o.payments = Invoice.paymentsOf(inv).map(p => ({
    _id: p._id ? String(p._id) : null, amount: p.amount, date: p.date, method: p.method || '', note: p.note || '', legacy: !!p.legacy,
  }));
  return o;
}

// Année courante dans le fuseau de l'agence (une pièce émise le 31/12 à 23 h 30 à
// Cotonou appartient bien à l'année qui se termine).
function anneeAgence(d) {
  return Number(new Intl.DateTimeFormat('en', { timeZone: TZ_AGENCE, year: 'numeric' }).format(d || new Date()));
}

// Numérotation séquentielle sans trou ni doublon : FACT-2026-0001, DEVIS-2026-0001.
// Le compteur est initialisé paresseusement à partir du plus grand numéro déjà
// utilisé cette année-là, pour ne jamais entrer en collision avec l'historique.
async function prochaineReference(prefixe, Model) {
  const annee = anneeAgence();
  const cle = `${prefixe}-${annee}`;
  const existe = await Counter.findById(cle).lean();
  if (!existe) {
    const rx = new RegExp('^' + prefixe + '-' + annee + '-(\\d+)$');
    const docs = await Model.find({ reference: { $regex: '^' + prefixe + '-' + annee + '-' } }).select('reference').lean();
    let max = 0;
    docs.forEach(d => { const m = rx.exec(d.reference || ''); if (m) max = Math.max(max, parseInt(m[1], 10) || 0); });
    try { await Counter.create({ _id: cle, seq: max }); }
    catch (e) { if (e.code !== 11000) throw e; } // créé en parallèle par une autre requête : on continue
  }
  const c = await Counter.findOneAndUpdate({ _id: cle }, { $inc: { seq: 1 } }, { upsert: true, new: true });
  return `${prefixe}-${annee}-${String(c.seq).padStart(4, '0')}`;
}

// Création avec référence séquentielle. En cas (très improbable) de collision
// d'index unique, on retente avec un nouveau numéro / jeton.
async function creerAvecReference(Model, prefixe, donnees) {
  for (let essai = 0; essai < 4; essai++) {
    const doc = Object.assign({}, donnees, { reference: await prochaineReference(prefixe, Model) });
    if (essai > 0) {
      doc.publicToken = generateToken();
      if (doc.publicSlug) doc.publicSlug = genererAlias(doc.title);
    }
    try { return await Model.create(doc); }
    catch (e) { if (e && e.code === 11000) continue; throw e; }
  }
  const err = new Error('Numérotation indisponible, réessayez dans un instant.');
  err.messageUtilisateur = err.message;
  throw err;
}

// Message d'erreur présentable : jamais d'erreur Mongo brute (E11000…) côté interface.
function messageErreur(err, defaut) {
  if (err && err.messageUtilisateur) return err.messageUtilisateur;
  if (err && err.code === 11000) return 'Ce document existe déjà (doublon de référence). Réessayez.';
  if (err && err.name === 'VersionError') return 'Ce document a été modifié entre-temps : actualisez la page puis réessayez.';
  if (err && err.name === 'ValidationError') return 'Données invalides : vérifiez les montants, taux et dates saisis.';
  if (err && err.name === 'CastError') return 'Identifiant ou valeur invalide.';
  return defaut || 'Erreur serveur.';
}

// Validation commune des champs numériques / dates d'un devis ou d'une facture.
// Renvoie un message d'erreur français, ou null si tout est valide.
function validerChampsDocument(b, opts) {
  opts = opts || {};
  const pct = (v) => { const n = Number(v); return Number.isFinite(n) && n >= 0 && n <= 100; };
  if (b.taxRate !== undefined && b.taxRate !== '' && !pct(b.taxRate)) return 'Taux de TVA invalide : il doit être compris entre 0 et 100 %.';
  if (b.discountPercent !== undefined && b.discountPercent !== '' && !pct(b.discountPercent)) return 'Remise invalide : elle doit être comprise entre 0 et 100 %.';
  if (b.depositPercent !== undefined && b.depositPercent !== '' && !pct(b.depositPercent)) return 'Acompte invalide : il doit être compris entre 0 et 100 %.';
  if (b.currency !== undefined && b.currency !== '' && !DEVISES.includes(b.currency)) return 'Devise non prise en charge.';
  if (b.validDays !== undefined && b.validDays !== '') { const n = Number(b.validDays); if (!Number.isFinite(n) || n < 1 || n > 3650) return 'Durée de validité invalide : au moins 1 jour.'; }
  if (b.dueDays !== undefined && b.dueDays !== '') { const n = Number(b.dueDays); if (!Number.isFinite(n) || n < 0 || n > 3650) return 'Délai d’échéance invalide.'; }
  const nomsDates = { validUntil: 'date de validité', dueDate: 'date d’échéance', date: 'date' };
  for (const champ of (opts.dates || [])) {
    if (b[champ] === null || (b[champ] !== undefined && b[champ] !== '' && isNaN(new Date(b[champ]).getTime()))) return 'Date invalide (' + (nomsDates[champ] || 'date') + ').';
  }
  if (b.items !== undefined && !Array.isArray(b.items)) return 'Lignes invalides.';
  return null;
}

// Lecture d'un réglage serveur (clé/valeur en base). Jamais renvoyé au client.
async function getSetting(key) {
  try { const s = await Setting.findOne({ key }).lean(); return s ? s.value : ''; } catch (e) { return ''; }
}

const app = express();

// === Middlewares ===
app.set('trust proxy', 1);
app.use(express.json({ limit: '3mb' })); // 3MB pour upload images base64
app.use(cookieParser());

const ALLOWED_ORIGINS = new Set([
  'https://www.pirabellabs.com',
  'https://pirabellabs.com',
  'http://localhost:3000',
  'http://localhost:3055',
]);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.has(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(securityHeaders);
app.use(globalSanitize);

// === DB connection (lazy, partagee entre invocations serverless) ===
let dbReady = null;
async function ensureDB() {
  if (!dbReady) {
    dbReady = connectDB().then(async () => {
      try { await bootstrapAdmin(); } catch (e) { console.error('[bootstrap] failed:', e.message); }
      try { await seedCaseStudies(); } catch (e) { console.error('[seed.cases] failed:', e.message); }
      try { await patchCaseStudies(); } catch (e) { console.error('[seed.casePatches] failed:', e.message); }
      try { await seedArticles(); } catch (e) { console.error('[seed.articles] failed:', e.message); }
      try { await updateArticles(); } catch (e) { console.error('[seed.articleUpdates] failed:', e.message); }
      try { await patchArticles(); } catch (e) { console.error('[seed.articlePatches] failed:', e.message); }
    });
  }
  return dbReady;
}

// === Réalisations versionnées dans le dépôt (app/seed/case-studies.json) ===
// Ajoutées à la base au premier démarrage si leur slug n'existe pas encore. Jamais de mise à jour :
// une fiche modifiée ou supprimée depuis l'admin n'est pas écrasée (suppression = retirer aussi du fichier).
async function seedCaseStudies() {
  const seeds = require('../app/seed/case-studies.json');
  if (!Array.isArray(seeds) || !seeds.length) return;
  const slugs = seeds.map((c) => c.slug).filter(Boolean);
  const existing = new Set((await CaseStudy.find({ slug: { $in: slugs } }).select('slug').lean()).map((c) => c.slug));
  for (const c of seeds) {
    if (!c.slug || existing.has(c.slug)) continue;
    await CaseStudy.create({ ...c, status: c.status || 'publie', publishedAt: new Date() });
    console.log('[seed.cases] ajoutée :', c.slug);
  }
}

// === Correctifs ponctuels de réalisations existantes (app/seed/case-patches.json) ===
// Chaque correctif s'exécute une seule fois (ids mémorisés dans Setting) et seulement si sa condition tient :
// `whenEmpty` (champ encore vide) ou `whenEqual` (valeur connue ou liste de valeurs acceptées, ex. lien mort). Une fiche retouchée depuis l'admin n'est jamais écrasée.
const CASE_PATCHES_KEY = 'seed.casePatches.applied';
async function patchCaseStudies() {
  const patches = require('../app/seed/case-patches.json');
  if (!Array.isArray(patches) || !patches.length) return;
  const row = await Setting.findOne({ key: CASE_PATCHES_KEY }).lean();
  let applied = [];
  try { applied = JSON.parse((row && row.value) || '[]'); } catch (e) { applied = []; }
  const done = new Set(Array.isArray(applied) ? applied : []);
  const todo = patches.filter((p) => p && p.id && p.slug && p.set && !done.has(p.id));
  if (!todo.length) return;
  const docs = await CaseStudy.find({ slug: { $in: [...new Set(todo.map((p) => p.slug))] } });
  const bySlug = new Map(docs.map((d) => [d.slug, d]));
  const isEmpty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0);
  const norm = (v) => String(v || '').trim().replace(/\/+$/, '').toLowerCase();
  const changed = new Set();
  for (const p of todo) {
    const doc = bySlug.get(p.slug);
    if (!doc) continue; // fiche absente : on réessaiera au prochain démarrage
    done.add(p.id);
    if (p.whenEmpty && !isEmpty(doc[p.whenEmpty])) continue;
    if (p.whenEqual && !Object.entries(p.whenEqual).every(([k, v]) => (Array.isArray(v) ? v : [v]).some((x) => norm(doc[k]) === norm(x)))) continue;
    doc.set(p.set);
    changed.add(doc);
    console.log('[seed.casePatches] appliqué :', p.id);
  }
  for (const doc of changed) await doc.save();
  await Setting.updateOne({ key: CASE_PATCHES_KEY }, { $set: { value: JSON.stringify([...done]), updatedAt: new Date() } }, { upsert: true });
}

// === Refonte d'articles existants (app/seed/article-updates.json) : appliquée une seule fois par lot ===
// Remplace le contenu et le SEO des articles listés (slug inchangé, statut conservé) ; date de mise à jour = maintenant.
const ARTICLE_UPDATES_KEY = 'seed.articleUpdates.applied';
async function updateArticles() {
  const batch = require('../app/seed/article-updates.json');
  if (!batch || !batch.id || !Array.isArray(batch.articles)) return;
  const row = await Setting.findOne({ key: ARTICLE_UPDATES_KEY }).lean();
  const done = new Set(row && row.value ? JSON.parse(row.value) : []);
  if (done.has(batch.id)) return;
  let n = 0;
  const missing = [];
  for (const a of batch.articles) {
    const set = { updatedAt: new Date() };
    for (const k of ['title', 'category', 'excerpt', 'seoTitle', 'metaDescription', 'imageAlt', 'content']) if (a[k]) set[k] = a[k];
    const words = (a.content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    if (words) set.readTime = Math.max(1, Math.round(words / 200));
    const r = await Article.updateOne({ slug: a.slug }, { $set: set });
    if (!r.matchedCount) { missing.push(a.slug); continue; }
    n += r.modifiedCount || 0;
  }
  if (missing.length) { console.warn('[seed.articleUpdates] introuvables, lot non marqué :', missing.join(', ')); return; }
  done.add(batch.id);
  await Setting.updateOne({ key: ARTICLE_UPDATES_KEY }, { $set: { value: JSON.stringify([...done]), updatedAt: new Date() } }, { upsert: true });
  console.log('[seed.articleUpdates] lot ' + batch.id + ' :', n, 'article(s) mis à jour');
}

// === Correctifs ponctuels du contenu des articles en base (appliqués une seule fois, mémorisés dans Setting) ===
// 2026-09-28 : les articles sont signés par l'agence ; plus aucune personne nommée dans le texte.
const ARTICLE_PATCHES_KEY = 'seed.articlePatches.applied';
const ARTICLE_PATCHES = [
  {
    id: 'sans-nom-2026-09-28',
    rules: [
      [/Chez (<strong>)?Pirabel Labs(<\/strong>)?, fondée? par (?:<strong>)?Lissanon Gildas(?:<\/strong>)?(?: à Abomey-Calavi)?,/g, 'Chez $1Pirabel Labs$2, agence basée à Abomey-Calavi,'],
      [/, fondée? par (?:<strong>)?Lissanon Gildas(?:<\/strong>)? à Abomey-Calavi( \(Bénin\))?,/g, ', basée à Abomey-Calavi$1,'],
      [/, fondée? par (?:<strong>)?Lissanon Gildas(?:<\/strong>)?,/g, ','],
      [/Fondée par Lissanon Gildas à Abomey-Calavi( \(Bénin\))?, /g, 'Basée à Abomey-Calavi$1, '],
      [/Fondée par Lissanon Gildas, Pirabel Labs a été créée/g, 'Pirabel Labs a été créée'],
      [/Lissanon Gildas et l['’]équipe Pirabel Labs ont accompagné/g, 'L’équipe Pirabel Labs a accompagné'],
      [/Lissanon Gildas et son équipe sont prêts/g, 'Notre équipe est prête'],
      [/Lissanon Gildas et son équipe ont aidé/g, 'Notre équipe a aidé'],
      [/C['’]est face à ce constat que Lissanon Gildas a fondé Pirabel Labs à Abomey-Calavi\./g, 'C’est face à ce constat qu’est née Pirabel Labs, à Abomey-Calavi.'],
      [/Lissanon Gildas, fondateur de Pirabel Labs, répète souvent que/g, 'Chez Pirabel Labs, nous répétons souvent que'],
      [/Chez Pirabel Labs, Lissanon Gildas incarne cette vision/g, 'Chez Pirabel Labs, nous incarnons cette vision'],
      [/Chez Pirabel Labs, par exemple, Lissanon Gildas a fondé l['’]agence avec une conviction claire/g, 'Pirabel Labs, par exemple, est née d’une conviction claire'],
    ],
  },
];
async function patchArticles() {
  const row = await Setting.findOne({ key: ARTICLE_PATCHES_KEY }).lean();
  const done = new Set(row && row.value ? JSON.parse(row.value) : []);
  const todo = ARTICLE_PATCHES.filter((p) => !done.has(p.id));
  if (!todo.length) return;
  const articles = await Article.find({}).select('slug content excerpt metaDescription');
  for (const p of todo) {
    let n = 0;
    for (const doc of articles) {
      let changed = false;
      for (const f of ['content', 'excerpt', 'metaDescription']) {
        const before = doc[f] || '';
        let after = before;
        for (const [re, rep] of p.rules) after = after.replace(re, rep);
        if (after !== before) { doc[f] = after; changed = true; }
      }
      if (changed) { await Article.updateOne({ _id: doc._id }, { $set: { content: doc.content, excerpt: doc.excerpt, metaDescription: doc.metaDescription } }); n++; }
      if (/Lissanon|Gildas/.test(doc.content || '')) console.warn('[seed.articlePatches] nom restant :', doc.slug);
    }
    done.add(p.id);
    console.log('[seed.articlePatches] appliqué :', p.id, '—', n, 'article(s)');
  }
  await Setting.updateOne({ key: ARTICLE_PATCHES_KEY }, { $set: { value: JSON.stringify([...done]), updatedAt: new Date() } }, { upsert: true });
}

// === Articles de blog versionnés (app/seed/articles.json) : ajoutés en BROUILLON si leur slug n'existe pas ===
// Jamais de mise à jour du contenu d'un article existant.
// Publication groupée unique (lot mémorisé dans Setting) : la série SaaS paraît d'un bloc, car ses articles se citent
// entre eux (demande du CEO, 2026-09-26). Seuls les brouillons passent en ligne ; l'ordre du fichier donne l'ordre
// d'affichage (le guide pilier en tête), avec une minute d'écart entre deux articles.
const ARTICLES_PUBLISH_KEY = 'seed.articles.published';
const ARTICLES_PUBLISH_BATCH = 'seo-2026-09-28';
async function seedArticles() {
  const seeds = require('../app/seed/articles.json');
  if (!Array.isArray(seeds) || !seeds.length) return;
  const slugs = seeds.map((a) => a.slug).filter(Boolean);
  const existing = new Set((await Article.find({ slug: { $in: slugs } }).select('slug').lean()).map((a) => a.slug));
  for (const a of seeds) {
    if (!a.slug || !a.content || existing.has(a.slug)) continue;
    await Article.create({ ...a, author: BLOG_TEAM, status: 'brouillon' });
    console.log('[seed.articles] brouillon ajouté :', a.slug);
  }
  const batch = await Setting.findOne({ key: ARTICLES_PUBLISH_KEY }).lean();
  if (batch && batch.value === ARTICLES_PUBLISH_BATCH) return;
  const now = Date.now();
  let published = 0;
  const lot = seeds.filter((a) => a.batch === ARTICLES_PUBLISH_BATCH).map((a) => a.slug);
  for (const [i, slug] of lot.entries()) {
    const r = await Article.updateOne({ slug, status: 'brouillon' }, { $set: { status: 'publie', publishedAt: new Date(now - i * 60000), updatedAt: new Date(now) } });
    published += r.modifiedCount || 0;
  }
  await Setting.updateOne({ key: ARTICLES_PUBLISH_KEY }, { $set: { value: ARTICLES_PUBLISH_BATCH, updatedAt: new Date() } }, { upsert: true });
  console.log('[seed.articles] lot ' + ARTICLES_PUBLISH_BATCH + ' publié :', published, 'article(s)');
}

// === Auto-create admin on first boot if env vars are set ===
// Set INITIAL_ADMIN_EMAIL + INITIAL_ADMIN_PASSWORD in Vercel env vars,
// redeploy once: the admin gets created on first DB connection. Then you
// can remove the env vars (or keep them — they're only used when no admin exists).
async function bootstrapAdmin() {
  const email = (process.env.INITIAL_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD || '';
  if (!email || !password) return;
  if (password.length < 8) {
    console.warn('[bootstrap] INITIAL_ADMIN_PASSWORD too short (need 8+ chars), skipping');
    return;
  }
  const name = (process.env.INITIAL_ADMIN_NAME || 'Admin').trim();
  const forceReset = (process.env.ADMIN_FORCE_RESET || '').trim().toLowerCase() === 'true';
  const count = await User.countDocuments({ role: 'admin' });

  if (count > 0) {
    if (!forceReset) return; // admin existe deja, pas de reset demande
    // RESET demande : on remet l'admin a zero avec les identifiants fournis
    await User.deleteMany({ role: 'admin' });
    console.log('[bootstrap] ADMIN_FORCE_RESET=true -> anciens admins supprimes');
  }

  const user = new User({ name, email, password, role: 'admin', isActive: true });
  await user.save();
  console.log(`[bootstrap] admin ${forceReset ? 'reinitialise' : 'cree'}: ${email} (id: ${user._id})`);
}
// === PUBLIC : pays du visiteur (devise des prix) ===
// Déclaré avant le middleware de base de données : aucune requête Mongo, rien n'est enregistré.
app.get('/api/geo', (req, res) => {
  const cc = String(req.headers['x-vercel-ip-country'] || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
  res.set({ 'Cache-Control': 'private, no-store', Vary: '*' }).json({ country: cc });
});

app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (e) {
    return res.status(503).json({ error: 'Database indisponible.' });
  }
});

// === PUBLIC : Contact form ===
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  message: 'Trop de demandes. Réessayez dans 15 minutes.',
  keyPrefix: 'contact',
});

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
// Convertit une URL media admin (JSON, protégée) en URL publique servant l'image brute.
function pubImg(src) { return String(src || '').replace('/api/admin/media/', '/media/'); }

app.post('/api/contact', contactLimiter, honeypotCheck('website_url'), limitBody(10), async (req, res) => {
  try {
    const name = sanitize(req.body.name, 120);
    const email = sanitizeEmail(req.body.email);
    const phone = sanitize(req.body.phone || '', 30);
    const company = sanitize(req.body.company || '', 120);
    const service = sanitize(req.body.service, 30);
    const message = sanitize(req.body.message, 5000);

    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom requis.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide.' });
    const VALID_SERVICES = new Set([
      'site-web','site-sur-mesure','site-vitrine','ecommerce','saas','multilingue',
      'wordpress','webflow','nextjs','prestashop','refonte','hebergement','maintenance','developpement',
      'application','application-web',
      'seo','audit-seo','seo-local','netlinking',
      'fiche-google-business','google-business','gestion-avis-google',
      'community-management','community','community-instagram','community-tiktok','community-linkedin',
      'montage-video','video',
      'automatisation','automatisation-marketing','make','n8n','agents-ia',
      'email-marketing-crm','email-crm','email','hubspot','brevo','mailchimp',
      'tunnels-de-vente','tunnels','landing-page-conversion','systeme-io','clickfunnels',
      'consulting-marketing','consulting',
      'audit-lighthouse','audit-gratuit','livre-blanc-sites','livre-blanc-geo',
      'partenariat','recrutement','autre',
    ]);
    if (!VALID_SERVICES.has(service)) {
      return res.status(400).json({ error: 'Service invalide.' });
    }
    if (!message || message.length < 10) return res.status(400).json({ error: 'Message trop court (10 caracteres min).' });

    const ipHash = crypto.createHash('sha256')
      .update((req.ip || '') + (process.env.JWT_SECRET || ''))
      .digest('hex').slice(0, 32);

    const lead = await Lead.create({
      name, email, phone, company, service, message,
      source: 'site_contact',
      userAgent: (req.headers['user-agent'] || '').slice(0, 500),
      ipHash,
    });

    // Ayaba qualifie la demande et prépare la réponse pendant que le reste part.
    // En cas d'échec, la demande suit son cours normal : c'est un bonus, pas un maillon critique.
    await traiterFormulaire(lead).catch(e => console.error('[contact] traitement IA:', e.message));

    // Email admin (AWAIT : sur Vercel, sans await l'envoi est coupé au retour de la fonction)
    await sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      '[Pirabel Labs] Nouvelle demande - ' + service +
        (lead.aiQualification && lead.aiQualification !== 'non_evalue' ? ' [' + lead.aiQualification.toUpperCase() + ' ' + lead.aiScore + '/100]' : ''),
      newOrderEmail({ name, email, phone, company, service,
        message: message + (lead.aiSummary ? '\n\n— Analyse d\'Ayaba —\n' + lead.aiSummary + (lead.aiNextAction ? '\n\nProchaine action : ' + lead.aiNextAction : '') + '\n\nUne réponse est prête à valider dans l\'assistant.' : '') }),
      { replyTo: email }
    ).catch(e => console.error('[contact] admin email error:', e.message));

    // E-mail de confirmation client (charte claire Pirabel Labs)
    const step = (t, d) => '<div style="' + ES.note + '"><strong style="' + ES.strong + '">' + t + '</strong><br><span style="font-size:14px;">' + d + '</span></div>';
    const confirmHtml = masterTemplate({
      headerType: 'hero',
      preheader: 'Demande reçue : réponse sous 24 h ouvrées',
      title: 'Bonjour ' + escapeHtml(name.split(' ')[0]) + ',',
      subtitle: 'Votre demande est entre de bonnes mains',
      body: '<p style="' + ES.p + '">Merci de nous avoir contactés&nbsp;! Nous avons bien reçu votre demande concernant <strong style="' + ES.strong + '">' + escapeHtml(service) + '</strong>.</p>' +
        '<p style="' + ES.p + '">Un membre de notre équipe vous répond sous <strong style="' + ES.strong + '">24&nbsp;h ouvrées</strong> avec&nbsp;:</p>' +
        step('Une première estimation', 'Un budget réaliste et un planning indicatif.') +
        step('Une proposition d’étape suivante', 'Un appel découverte gratuit de 30 minutes, ou un devis ferme sous 48&nbsp;h.') +
        step('Aucune relance insistante', 'Nous vous répondons, vous prenez le temps de réfléchir.') +
        '<p style="' + ES.small + '"><strong style="' + ES.strong + '">Une urgence&nbsp;?</strong> Écrivez-nous sur <a href="https://wa.me/33757751778" style="' + ES.link + '">WhatsApp</a> ou répondez simplement à cet e-mail.</p>' +
        '<p style="' + ES.p + 'margin-top:24px;">Bien cordialement,<br><strong style="' + ES.strong + '">L’équipe Pirabel Labs</strong></p>',
      cta: 'Voir nos réalisations',
      ctaUrl: 'https://www.pirabellabs.com/realisations',
      ctaSecondary: 'Choisir un créneau d’appel',
      ctaSecondaryUrl: 'https://www.pirabellabs.com/rdv',
    });

    await sendEmail(
      email,
      'Pirabel Labs — Demande reçue, réponse sous 24 h',
      confirmHtml
    ).catch(e => console.error('[contact] confirm email error:', e.message));

    res.json({ success: true, message: 'Demande envoyée. Réponse sous 24 h ouvrées.' });
  } catch (err) {
    console.error('[contact] error:', err && err.message, err && err.name);
    // Toujours renvoyer une CHAINE (jamais l'objet d'erreur) pour eviter "[object Object]" cote client
    var msg = 'Erreur serveur. Réessayez ou écrivez-nous à contact@pirabellabs.com';
    if (err && err.name === 'ValidationError') {
      msg = 'Données invalides. Vérifiez les champs et réessayez.';
    }
    res.status(500).json({ error: msg });
  }
});

// === PUBLIC : Formulaire de qualification en étapes (page /contact) ===
// Validation + score côté serveur dans app/qualification.js (le navigateur ne fait jamais foi).
// Honeypot `qf_hp` : champ display:none + readonly côté page (jamais auto-rempli).
const qualificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  message: 'Trop de demandes. Réessayez dans 15 minutes.',
  keyPrefix: 'qualif',
});
app.post('/api/qualification', qualificationLimiter, honeypotCheck('qf_hp'), limitBody(20), async (req, res) => {
  try {
    const { ok, error, data } = validateQualification(req.body);
    if (!ok) return res.status(400).json({ error });

    const sc = scoreQualification(data);
    const message = summarizeQualification(data, sc);
    const service = qualificationPrimaryService(data);
    const ipHash = crypto.createHash('sha256')
      .update((req.ip || '') + (process.env.JWT_SECRET || ''))
      .digest('hex').slice(0, 32);

    const lead = await Lead.create({
      name: data.contact.name,
      email: data.contact.email,
      phone: data.contact.phone,
      company: data.contact.company,
      service,
      message: message.slice(0, 5000),
      clientData: { city: data.city, country: data.country, website: data.websiteUrl },
      qualification: data,
      qualificationScore: sc.score,
      qualificationLabel: sc.label,
      source: 'site_qualification',
      userAgent: (req.headers['user-agent'] || '').slice(0, 500),
      ipHash,
    });

    // Anti-abus : une seule confirmation (et un seul appel IA) par adresse et par 24 h.
    // Le lead et l'e-mail admin sont toujours créés ; seuls les envois « sortants » sont limités.
    const recentForEmail = await Lead.countDocuments({
      email: data.contact.email, createdAt: { $gt: new Date(Date.now() - 24 * 3600 * 1000) },
    }).catch(() => 1);
    const firstRequest = recentForEmail <= 1; // inclut le lead qui vient d'être créé

    // Ayaba enrichit la fiche (résumé + brouillon de réponse). Bonus, jamais bloquant.
    if (firstRequest) {
      await traiterFormulaire(lead).catch(e => console.error('[qualification] traitement IA:', e.message));
    }

    const safe = (s) => escapeHtml(s).replace(/\n/g, '<br>');
    const tag = { chaud: 'CHAUD', tiede: 'TIÈDE', froid: 'FROID' }[sc.label];
    const heat = { chaud: ['#15803d', '#ecfdf3', 'Prospect chaud'], tiede: ['#b45309', '#fff7e6', 'Prospect tiède'], froid: ['#475569', '#f1f5f9', 'Prospect froid'] }[sc.label];
    const scoreHtml = '<p style="margin:0 0 18px;"><span style="display:inline-block;background:' + heat[1] + ';color:' + heat[0] + ';border:1px solid ' + heat[0] + '33;border-radius:999px;padding:6px 16px;font-size:15px;font-weight:800;">' +
      heat[2] + ' · ' + sc.score + '/100</span></p>';
    const qRows = qualificationRows(data, sc).filter((r) => !['Score', 'Budget'].includes(r[0])).map(([k, v]) => [escapeHtml(k), escapeHtml(v)]);
    await sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      `[Pirabel Labs] Demande qualifiée ${tag} ${sc.score}/100 — ${data.contact.name}`,
      newOrderEmail({
        name: escapeHtml(data.contact.name), email: escapeHtml(data.contact.email),
        phone: escapeHtml(data.contact.phone), company: escapeHtml(data.contact.company),
        service: escapeHtml(service), budget: escapeHtml(qualificationBudgetLabel(data)),
        intro: scoreHtml,
        extraHtml: '<p style="margin:0 0 8px;' + ES.label + '">Réponses au formulaire</p>' + emailInfoTable(qRows),
        message: data.description || lead.aiSummary
          ? safe((data.description ? data.description : '') + (lead.aiSummary ? (data.description ? '\n\n' : '') + '— Analyse d’Ayaba —\n' + lead.aiSummary : ''))
          : '',
      }),
      { replyTo: data.contact.email }
    ).catch(e => console.error('[qualification] admin email error:', e.message));

    // E-mail de confirmation : AUCUN texte libre du visiteur (nom exotique, description, URL…),
    // sinon le formulaire servirait de relais de phishing signé pirabellabs.com vers n'importe quelle adresse.
    // Seuls des libellés de la liste blanche sont repris.
    if (firstRequest) {
      const fn = data.contact.name.split(' ')[0];
      const firstName = /^[\p{L}' -]{1,30}$/u.test(fn) ? escapeHtml(fn) : '';
      const recap = emailInfoTable([
        ['Projet', escapeHtml(qualificationProjectLabels(data))],
        ['Budget', escapeHtml(qualificationBudgetLabel(data))],
        ['Démarrage', escapeHtml(qualificationTimelineLabel(data))],
      ]);
      const confirmHtml = masterTemplate({
        headerType: 'hero',
        preheader: 'Votre demande est bien reçue : réponse sous 24 h ouvrées',
        title: firstName ? 'Bonjour ' + firstName + ',' : 'Bonjour,',
        subtitle: 'Votre projet est entre de bonnes mains',
        body: '<p style="' + ES.p + '">Merci d’avoir pris le temps de décrire votre projet. Grâce à vos réponses, nous arrivons à l’appel découverte avec une première lecture de votre besoin.</p>' +
          '<p style="margin:0 0 8px;' + ES.label + '">En résumé</p>' + recap +
          '<p style="' + ES.p + '">Un membre de notre équipe vous répond sous <strong style="' + ES.strong + '">24&nbsp;h ouvrées</strong> avec une proposition de rendez-vous. Le devis est gratuit et ferme, établi sous 48&nbsp;h après notre échange.</p>' +
          '<p style="' + ES.small + '">Une urgence&nbsp;? Écrivez-nous sur <a href="https://wa.me/33757751778" style="' + ES.link + '">WhatsApp</a> ou répondez simplement à cet e-mail.</p>' +
          '<p style="' + ES.p + 'margin-top:24px;">Bien cordialement,<br><strong style="' + ES.strong + '">L’équipe Pirabel Labs</strong></p>',
        cta: 'Choisir un créneau',
        ctaUrl: 'https://www.pirabellabs.com/rdv',
        ctaSecondary: 'Voir nos réalisations',
        ctaSecondaryUrl: 'https://www.pirabellabs.com/realisations',
      });
      await sendEmail(data.contact.email, 'Pirabel Labs — Votre demande est bien reçue', confirmHtml)
        .catch(e => console.error('[qualification] confirm email error:', e.message));
    }

    res.json({ success: true, level: sc.label, confirmationSent: firstRequest });
  } catch (err) {
    console.error('[qualification] error:', err && err.message, err && err.name);
    res.status(500).json({ error: 'Erreur serveur. Réessayez ou écrivez-nous à contact@pirabellabs.com.' });
  }
});

// === PUBLIC : Prise de rendez-vous (depuis la page contact) ===
app.post('/api/rdv', contactLimiter, honeypotCheck('website_url'), limitBody(10), async (req, res) => {
  try {
    const name = sanitize(req.body.name, 120);
    const email = sanitizeEmail(req.body.email);
    const phone = sanitize(req.body.phone || '', 30);
    const company = sanitize(req.body.company || '', 120);
    const preferredDate = sanitize(req.body.date || '', 10);
    const preferredTime = sanitize(req.body.time || '', 10);
    const channel = ['visio', 'telephone', 'whatsapp', 'presentiel'].includes(req.body.channel) ? req.body.channel : 'visio';
    const subject = sanitize(req.body.subject || '', 200);
    const message = sanitize(req.body.message || '', 3000);
    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom requis.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'E-mail invalide.' });
    if (!preferredDate) return res.status(400).json({ error: 'Date souhaitée requise.' });
    if (!phone && channel !== 'visio') return res.status(400).json({ error: 'Téléphone requis pour ce canal.' });

    const publicToken = crypto.randomBytes(24).toString('hex');
    const appt = await Appointment.create({ name, email, phone, company, preferredDate, preferredTime, channel, subject, message, publicToken, source: 'site_contact' });

    const chanLabel = { visio: 'Visioconférence', telephone: 'Téléphone', whatsapp: 'WhatsApp', presentiel: 'Présentiel (Abomey-Calavi)' }[channel];
    const when = preferredDate + (preferredTime ? (' à ' + preferredTime) : '');
    const manageUrl = (process.env.SITE_URL || 'https://www.pirabellabs.com') + '/rdv/' + publicToken;
    // E-mail admin (AWAIT : sinon Vercel gèle la fonction après la réponse et l'envoi est coupé)
    await sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      '[Pirabel Labs] Nouvelle demande de RDV — ' + name,
      masterTemplate({
        headerType: 'hero', preheader: 'Nouvelle demande de rendez-vous',
        title: 'Nouvelle demande de rendez-vous',
        body: '<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;color:rgba(229,226,225,0.85);">' +
          '<tr><td style="padding:6px 0;"><strong>Nom :</strong> ' + escapeHtml(name) + (company ? ' (' + escapeHtml(company) + ')' : '') + '</td></tr>' +
          '<tr><td style="padding:6px 0;"><strong>E-mail :</strong> ' + escapeHtml(email) + '</td></tr>' +
          (phone ? '<tr><td style="padding:6px 0;"><strong>Téléphone :</strong> ' + escapeHtml(phone) + '</td></tr>' : '') +
          '<tr><td style="padding:6px 0;"><strong>Créneau souhaité :</strong> ' + escapeHtml(when) + '</td></tr>' +
          '<tr><td style="padding:6px 0;"><strong>Canal :</strong> ' + escapeHtml(chanLabel) + '</td></tr>' +
          (subject ? '<tr><td style="padding:6px 0;"><strong>Objet :</strong> ' + escapeHtml(subject) + '</td></tr>' : '') +
          (message ? '<tr><td style="padding:12px 16px;border-left:3px solid #FF5500;background:#0e0e0e;">' + escapeHtml(message) + '</td></tr>' : '') +
          '</table>',
        cta: 'Ouvrir l\'admin', ctaUrl: 'https://www.pirabellabs.com/admin/dashboard',
      }),
      { replyTo: email }
    ).catch(e => console.error('[rdv] admin email error:', e.message));

    // Confirmation client (AWAIT également)
    await sendEmail(
      email, 'Pirabel Labs — votre demande de rendez-vous est bien reçue',
      masterTemplate({
        headerType: 'hero', preheader: 'Demande de rendez-vous reçue',
        title: 'Bonjour ' + escapeHtml(name.split(' ')[0]) + ',',
        body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Merci&nbsp;! Votre demande de rendez-vous (' + escapeHtml(chanLabel) + ') pour le <strong style="color:#FF5500;">' + escapeHtml(when) + '</strong> est bien enregistrée.</p>' +
          '<p style="font-size:15px;line-height:1.7;color:rgba(229,226,225,0.7);">L\'équipe Pirabel Labs vous confirme le créneau (ou vous en propose un proche) sous 24&nbsp;h ouvrées.</p>' +
          '<div style="border-left:3px solid rgba(255,85,0,0.3);padding:14px 18px;background:rgba(255,85,0,0.03);margin:20px 0;"><p style="margin:0;font-size:14px;color:rgba(229,226,225,0.7);line-height:1.6;">Besoin de <strong style="color:#e5e2e1;">changer de créneau ou d\'annuler</strong>&nbsp;? Vous pouvez le faire vous-même en un clic, à tout moment&nbsp;:<br><a href="' + escapeHtml(manageUrl) + '" style="color:#FF5500;font-weight:600;">Gérer mon rendez-vous &rarr;</a></p></div>' +
          '<p style="font-size:14px;line-height:1.7;color:rgba(229,226,225,0.6);">Une urgence&nbsp;? Écrivez-nous sur <a href="https://wa.me/33757751778" style="color:#FF5500;">WhatsApp</a>.</p>',
        cta: 'Gérer mon rendez-vous', ctaUrl: manageUrl,
      })
    ).catch(e => console.error('[rdv] confirm email error:', e.message));

    res.json({ success: true, message: 'Demande de rendez-vous envoyée. Confirmation sous 24h ouvrées.' });
  } catch (err) {
    console.error('[rdv] error:', err && err.message);
    res.status(500).json({ error: 'Erreur serveur. Réessayez ou écrivez à contact@pirabellabs.com.' });
  }
});

// === PUBLIC : le client gère son rendez-vous (replanifier / annuler) ===
const RDV_CHAN = { visio: 'Visioconférence', telephone: 'Téléphone', whatsapp: 'Appel WhatsApp', presentiel: 'En personne (Abomey-Calavi)' };
const RDV_HOURS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const rdvHour = (v) => v.replace(':', '\u00a0h\u00a0'); // « 09 h 00 »
// Styles communs aux deux pages de rendez-vous (formulaire en verre, jetons de thème).
const RDV_CSS = '<style>' +
  '.rdv{display:grid;gap:clamp(28px,4vw,56px);align-items:start;padding-top:clamp(120px,13vw,160px);}' +
  '@media(min-width:1024px){.rdv{grid-template-columns:.9fr 1.1fr;}}' +
  '.rdv__intro h1{font-family:var(--font-display);font-weight:800;font-size:clamp(1.85rem,1.1rem + 2.2vw,2.9rem);line-height:1.05;letter-spacing:-.035em;}' +
  '.rdv__intro .px-hero__lead{margin:18px 0 0;}' +
  '.rdv__chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px;}' +
  '.rdv__contact{display:grid;gap:10px;margin-top:28px;}' +
  '.rdv__contact a{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:var(--r-md);transition:transform .4s var(--ease-out);}' +
  '.rdv__contact a:hover{transform:translateX(4px);}' +
  '.rdv__contact b{display:block;font-family:var(--font-ui);font-weight:600;}' +
  '.rdv__contact small{color:var(--text-3);font-size:.85rem;}' +
  '.rdv__form{display:grid;gap:16px;padding:clamp(22px,3.5vw,36px);border-radius:var(--r-xl);background:var(--panel-bg);}' +
  '.rdv__form .btn{justify-self:start;}' +
  '.px-field select{appearance:none;-webkit-appearance:none;padding-right:40px;background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),linear-gradient(135deg,currentColor 50%,transparent 50%);background-position:calc(100% - 20px) 55%,calc(100% - 15px) 55%;background-size:5px 5px;background-repeat:no-repeat;}' +
  '.rdv__foot{font-size:.88rem;color:var(--text-3);}' +
  '.rdv__foot a{color:var(--accent-3);text-decoration:underline;text-underline-offset:2px;}' +
  '.rdv-card{max-width:640px;margin:0 auto;padding:clamp(24px,4vw,40px);border-radius:var(--r-xl);background:var(--panel-bg);}' +
  '.rdv-wrap{padding-top:clamp(120px,13vw,160px);}' +
  '.rdv-card h1{margin:0 0 12px;font-family:var(--font-display);font-weight:800;font-size:clamp(1.8rem,1.3rem + 1.8vw,2.5rem);line-height:1.08;letter-spacing:-.03em;}' +
  '.rdv-card>p{color:var(--text-2);line-height:1.65;}' +
  '.rdv-card a:not(.btn){color:var(--accent-3);text-decoration:underline;text-underline-offset:2px;}' +
  '.rdv-card form,.rdv-card .rdv-form{display:grid;gap:16px;margin-top:22px;}' +
  '.rdv-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:6px;}' +
  '.btn--danger:where(:not(.lg *)){color:var(--danger);background:rgba(255,138,138,.08);box-shadow:inset 0 0 0 1px rgba(255,138,138,.4);}' +
  '.btn--danger:where(:not(.lg *)):hover{background:rgba(255,138,138,.14);}' +
  '.btn--danger-solid:where(:not(.lg *)){color:#1a0505;background:#f87171;}' +
  '.rdv-cancel{display:grid;gap:10px;padding:16px 18px;border-radius:var(--r-md);background:rgba(255,138,138,.08);box-shadow:inset 0 0 0 1px rgba(255,138,138,.35);}' +
  '.rdv-cancel strong{color:var(--danger);}' +
  '.rdv-cancel p{margin:0;color:var(--text-2);font-size:.9rem;}' +
  '@media(max-width:520px){.rdv__form .btn,.rdv-actions .btn{width:100%;}}' +
  '</style>';

// === PUBLIC : page de prise de rendez-vous (lien court partageable pirabellabs.com/rdv) ===
app.get('/rdv', (req, res) => {
  const head = '<title>Prendre rendez-vous — Pirabel Labs</title>' +
    '<meta name="description" content="Réservez un échange de 30 minutes avec Pirabel Labs : gratuit, sans engagement, confirmation sous 24 h ouvrées.">' +
    '<meta name="robots" content="noindex,follow">' + RDV_CSS;
  const body = '<div class="px-wrap"><section class="rdv">' +
    '<div class="rdv__intro"><p class="eyebrow">Rendez-vous</p>' +
    '<h1>Réservez votre <span class="grad">rendez-vous</span></h1>' +
    '<p class="px-hero__lead">Choisissez un créneau : un échange de 30&nbsp;minutes avec l’équipe Pirabel Labs, gratuit et sans engagement. Confirmation sous 24&nbsp;h ouvrées.</p>' +
    '<ul class="rdv__chips"><li class="chip">' + ic('clock', 16) + ' 30&nbsp;minutes</li><li class="chip">' + ic('handshake', 16) + ' Gratuit et sans engagement</li><li class="chip">' + ic('check', 16) + ' Confirmation sous 24&nbsp;h</li></ul>' +
    '<div class="rdv__contact">' +
    '<a href="' + escapeHtml(siteNav.SITE.whatsapp) + '" target="_blank" rel="noopener" class="glass glass--flat spot"><span class="card__icon">' + ic('whatsapp', 20) + '</span><span><b>WhatsApp</b><small>Réponse rapide</small></span></a>' +
    '<a href="mailto:' + escapeHtml(siteNav.SITE.email) + '" class="glass glass--flat spot"><span class="card__icon">' + ic('mail', 20) + '</span><span><b>' + escapeHtml(siteNav.SITE.email) + '</b><small>Pour un brief détaillé</small></span></a>' +
    '</div></div>' +
    '<form class="rdv__form glass" id="f" autocomplete="on" novalidate aria-labelledby="rdvFormTitle">' +
    '<h2 id="rdvFormTitle" class="sr-only">Formulaire de demande de rendez-vous</h2>' +
    // Pot de miel anti-robots : hors écran, jamais tabulable ni lu par les lecteurs d'écran.
    '<div class="px-hp" aria-hidden="true"><label for="website_url">Ne pas remplir</label><input type="text" id="website_url" name="website_url" tabindex="-1" autocomplete="off"></div>' +
    '<div class="px-field"><label for="name">Nom complet <span aria-hidden="true">*</span></label><input id="name" required maxlength="120" autocomplete="name"></div>' +
    '<div class="px-grid2"><div class="px-field"><label for="email">E-mail <span aria-hidden="true">*</span></label><input id="email" type="email" required maxlength="200" autocomplete="email"></div>' +
    '<div class="px-field"><label for="phone">Téléphone ou WhatsApp</label><input id="phone" type="tel" maxlength="30" autocomplete="tel"></div></div>' +
    '<div class="px-field"><label for="company">Entreprise <span class="px-opt">(facultatif)</span></label><input id="company" maxlength="120" autocomplete="organization"></div>' +
    '<div class="px-grid2"><div class="px-field"><label for="date">Date souhaitée <span aria-hidden="true">*</span></label><input id="date" type="date" required></div>' +
    '<div class="px-field"><label for="time">Heure</label><select id="time"><option value="">Indifférente</option>' + RDV_HOURS.map(v => '<option value="' + v + '">' + rdvHour(v) + '</option>').join('') + '</select></div></div>' +
    '<div class="px-field"><label for="channel">Comment&nbsp;?</label><select id="channel"><option value="visio">Visioconférence</option><option value="whatsapp">Appel WhatsApp</option><option value="telephone">Téléphone</option><option value="presentiel">En personne (Abomey-Calavi)</option></select></div>' +
    '<div class="px-field"><label for="message">Votre projet en quelques mots <span class="px-opt">(facultatif)</span></label><textarea id="message" rows="3" maxlength="3000"></textarea></div>' +
    '<div id="msg" class="px-msg" role="status" aria-live="polite"></div>' +
    '<button class="btn btn--primary btn--lg" id="go" type="submit">' + ic('calendar', 18) + ' <span>Demander mon rendez-vous</span></button>' +
    '<p class="rdv__foot">Une question&nbsp;? <a href="https://wa.me/33757751778">WhatsApp</a> · <a href="/contact">Contact</a></p>' +
    '</form></section></div>' +
    '<script>(function(){var f=document.getElementById("f"),d=document.getElementById("date"),g=document.getElementById("go"),lbl=g.querySelector("span");' +
    'var t=new Date();t.setDate(t.getDate()+1);d.min=t.toISOString().slice(0,10);' +
    'function show(ok,txt,strong){var m=document.getElementById("msg");m.className="px-msg "+(ok?"is-ok":"is-err");m.textContent="";if(strong){var s=document.createElement("strong");s.textContent=strong+" ";m.appendChild(s);}m.appendChild(document.createTextNode(txt));m.scrollIntoView({behavior:"smooth",block:"center"});}' +
    'f.addEventListener("submit",async function(e){e.preventDefault();var v=function(id){return (document.getElementById(id).value||"").trim();};' +
    'if(!v("name")||!v("email")||!v("date")){show(false,"Merci de renseigner votre nom, votre e-mail et la date souhaitée.");return;}' +
    'g.disabled=true;lbl.textContent="Envoi…";' +
    'try{var r=await fetch("/api/rdv",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:v("name"),email:v("email"),phone:v("phone"),company:v("company"),date:v("date"),time:document.getElementById("time").value,channel:document.getElementById("channel").value,message:v("message"),website_url:document.getElementById("website_url").value})});' +
    'var j=await r.json();if(r.ok&&j.success!==false){[].forEach.call(f.querySelectorAll(".px-field,.px-grid2,#go"),function(x){x.hidden=true;});show(true,"Votre demande de rendez-vous est bien reçue. Pirabel Labs vous confirme le créneau sous 24\u00a0h ouvrées (vérifiez vos e-mails, pensez aux indésirables).","C’est envoyé\u00a0!");}else{show(false,j.error||"Une erreur est survenue. Réessayez ou écrivez à contact@pirabellabs.com.");g.disabled=false;lbl.textContent="Demander mon rendez-vous";}}catch(err){show(false,"Erreur réseau. Vérifiez votre connexion et réessayez.");g.disabled=false;lbl.textContent="Demander mon rendez-vous";}});})();</script>';
  res.set('Content-Type', 'text/html; charset=utf-8').send(blogShell(head, body, { showCta: false }));
});
app.get('/rdv/:token', async (req, res) => {
  try {
    const token = String(req.params.token || '').slice(0, 80);
    // L'URL porte un jeton qui permet de modifier le rendez-vous : ni cache, ni référent, ni mesure tierce.
    res.set({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
    const a = await Appointment.findOne({ publicToken: token }).lean();
    const page = (inner) => blogShell('<title>Mon rendez-vous — Pirabel Labs</title><meta name="robots" content="noindex">' + RDV_CSS,
      '<div class="px-wrap rdv-wrap"><div class="rdv-card glass">' + inner + '</div></div>', { showCta: false, tracking: false });
    if (!a) return res.status(404).set('Content-Type', 'text/html; charset=utf-8').send(page('<p class="eyebrow">Rendez-vous</p><h1>Lien introuvable</h1><p>Ce rendez-vous n’existe pas ou le lien a expiré. Écrivez-nous à <a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a>.</p>'));
    if (a.status === 'annule') return res.set('Content-Type', 'text/html; charset=utf-8').send(page('<p class="eyebrow">Rendez-vous</p><h1>Rendez-vous annulé</h1><p>Ce rendez-vous a été annulé. Pour en reprendre un, <a href="/contact#rdv">réservez un nouveau créneau</a>.</p>'));
    const chanOpt = (k) => '<option value="' + k + '"' + (a.channel === k ? ' selected' : '') + '>' + RDV_CHAN[k] + '</option>';
    const inner = '<p class="eyebrow">Rendez-vous</p><h1>Votre rendez-vous</h1>' +
      '<p>Bonjour ' + escapeHtml(String(a.name || '').split(' ')[0]) + ', vous pouvez déplacer ce rendez-vous ou l’annuler. Pirabel Labs est prévenu automatiquement.</p>' +
      '<div id="msg" class="px-msg" role="status" aria-live="polite" style="margin-top:18px"></div>' +
      '<div id="form" class="rdv-form">' +
      '<div class="px-grid2"><div class="px-field"><label for="d">Date souhaitée</label><input id="d" type="date" value="' + escapeHtml(a.preferredDate || '') + '"></div>' +
      '<div class="px-field"><label for="t">Heure</label><select id="t"><option value=""' + (a.preferredTime ? '' : ' selected') + '>Indifférente</option>' + RDV_HOURS.map(v => '<option value="' + v + '"' + (v === a.preferredTime ? ' selected' : '') + '>' + rdvHour(v) + '</option>').join('') + '</select></div></div>' +
      '<div class="px-field"><label for="c">Comment&nbsp;?</label><select id="c">' + ['visio', 'whatsapp', 'telephone', 'presentiel'].map(chanOpt).join('') + '</select></div>' +
      '<div class="px-field"><label for="r">Motif <span aria-hidden="true">*</span> <span class="px-opt">(obligatoire pour déplacer ou annuler)</span></label>' +
      '<textarea id="r" rows="2" maxlength="1000" placeholder="Ex. imprévu, conflit d’agenda, besoin d’un autre créneau…"></textarea></div>' +
      '<div class="rdv-actions"><button type="button" class="btn btn--primary" id="save">' + ic('check', 18) + ' Enregistrer le changement</button>' +
      '<button type="button" class="btn btn--danger" id="cancel">' + ic('x', 18) + ' Annuler le rendez-vous</button></div>' +
      // Bloc de confirmation d'annulation (inline, masqué) — pas de pop-up navigateur
      '<div id="cancelBox" class="rdv-cancel" hidden>' +
        '<strong>Confirmer l’annulation&nbsp;?</strong>' +
        '<p>Indiquez le motif ci-dessus, puis confirmez. Cette action est définitive.</p>' +
        '<div class="rdv-actions"><button type="button" class="btn btn--glass btn--sm" id="cancelBack">Garder le rendez-vous</button>' +
        '<button type="button" class="btn btn--danger-solid btn--sm" id="cancelYes">' + ic('x', 16) + ' Oui, annuler</button></div>' +
      '</div>' +
      '</div>' +
      '<script>var T=' + jsStr(token) + ';function show(ok,txt,strong){var m=document.getElementById("msg");m.className="px-msg "+(ok?"is-ok":"is-err");m.textContent="";if(strong){var s=document.createElement("strong");s.textContent=strong+" ";m.appendChild(s);}m.appendChild(document.createTextNode(txt));m.scrollIntoView({behavior:"smooth",block:"center"});}' +
      'function reason(){return (document.getElementById("r").value||"").trim();}' +
      'async function post(b){return (await fetch("/api/rdv/"+encodeURIComponent(T),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)})).json();}' +
      'document.getElementById("save").onclick=async function(){if(reason().length<3){show(false,"Merci d’indiquer un motif (au moins quelques mots) pour ce changement.");return;}this.disabled=true;try{var r=await post({action:"reschedule",date:document.getElementById("d").value,time:document.getElementById("t").value,channel:document.getElementById("c").value,reason:reason()});if(r.success)show(true,"Votre nouveau créneau a été enregistré et transmis à Pirabel Labs.","C’est noté\u00a0!");else show(false,r.error||"Erreur.");}catch(e){show(false,"Erreur réseau.");}this.disabled=false;};' +
      'document.getElementById("cancel").onclick=function(){var b=document.getElementById("cancelBox");b.hidden=false;b.scrollIntoView({behavior:"smooth",block:"center"});};' +
      'document.getElementById("cancelBack").onclick=function(){document.getElementById("cancelBox").hidden=true;};' +
      'document.getElementById("cancelYes").onclick=async function(){if(reason().length<3){show(false,"Merci d’indiquer le motif de l’annulation dans le champ ci-dessus.");return;}this.disabled=true;try{var r=await post({action:"cancel",reason:reason()});if(r.success){document.getElementById("form").hidden=true;show(true,"Merci de nous avoir prévenus. Vous pouvez en reprendre un quand vous le souhaitez sur pirabellabs.com/contact.","Rendez-vous annulé.");}else{show(false,r.error||"Erreur.");this.disabled=false;}}catch(e){show(false,"Erreur réseau.");this.disabled=false;}};<\/script>';
    res.set('Content-Type', 'text/html; charset=utf-8').send(page(inner));
  } catch (e) { console.error('[rdv.page]', e.message); res.status(500).send('Erreur'); }
});

app.post('/api/rdv/:token', contactLimiter, limitBody(10), async (req, res) => {
  try {
    const token = String(req.params.token || '').slice(0, 80);
    const a = await Appointment.findOne({ publicToken: token });
    if (!a) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
    const action = req.body.action;
    const reason = sanitize(req.body.reason || '', 1000);
    if (action === 'cancel') {
      if (!reason || reason.length < 3) return res.status(400).json({ error: 'Merci d\'indiquer un motif d\'annulation.' });
      a.status = 'annule'; a.clientReason = reason; a.modifiedByClientAt = new Date(); await a.save();
    } else if (action === 'reschedule') {
      const d = sanitize(req.body.date || '', 10);
      if (!d) return res.status(400).json({ error: 'Date requise.' });
      if (!reason || reason.length < 3) return res.status(400).json({ error: 'Merci d\'indiquer un motif du changement.' });
      a.preferredDate = d;
      a.preferredTime = sanitize(req.body.time || '', 10);
      if (['visio', 'telephone', 'whatsapp', 'presentiel'].includes(req.body.channel)) a.channel = req.body.channel;
      if (['effectue', 'no_show', 'confirme'].includes(a.status)) a.status = 'demande'; // à reconfirmer
      a.clientReason = reason; a.modifiedByClientAt = new Date(); await a.save();
    } else return res.status(400).json({ error: 'Action invalide.' });

    // Prévenir l'admin (avec le motif)
    const when = a.preferredDate + (a.preferredTime ? (' à ' + a.preferredTime) : '');
    await sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      '[Pirabel Labs] RDV ' + (action === 'cancel' ? 'ANNULÉ' : 'modifié') + ' par ' + a.name,
      masterTemplate({
        headerType: 'hero', preheader: 'Modification de rendez-vous par le client',
        title: action === 'cancel' ? 'Rendez-vous annulé par le client' : 'Rendez-vous modifié par le client',
        body: '<p style="font-size:15px;color:rgba(229,226,225,0.85);line-height:1.7;"><strong>' + escapeHtml(a.name) + '</strong> (' + escapeHtml(a.email) + ')' +
          (action === 'cancel' ? ' a annulé son rendez-vous.' : ' a déplacé son rendez-vous au <strong style="color:#FF5500;">' + escapeHtml(when) + '</strong> (' + escapeHtml(RDV_CHAN[a.channel]) + ').') + '</p>' +
          '<div style="margin-top:14px;padding:12px 16px;border-left:3px solid #FF5500;background:#0e0e0e;"><div style="font-size:12px;color:rgba(229,226,225,0.5);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Motif indiqué</div><div style="font-size:14px;color:#e5e2e1;line-height:1.6;white-space:pre-wrap;">' + escapeHtml(reason) + '</div></div>',
        cta: 'Ouvrir l\'admin', ctaUrl: 'https://www.pirabellabs.com/admin/dashboard',
      })
    ).catch(e => console.error('[rdv.client] admin email error:', e.message));

    res.json({ success: true });
  } catch (e) { console.error('[rdv.update]', e.message); res.status(500).json({ error: 'Erreur. Réessayez.' }); }
});

// === PUBLIC : Demande de livre blanc ===
const livreBlancLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: 'Trop de demandes. Réessayez dans 15 minutes.',
  keyPrefix: 'livre-blanc',
});

const LIVRES_BLANCS = {
  'seo-pme-francophones-2026': {
    title: 'Le guide complet du SEO pour PME francophones en 2026',
    pages: 62,
    pdfUrl: '/downloads/livre-blanc-seo-pme-francophones-2026.pdf',
    description: 'Méthodologie SEO complète : audit technique en 60 points, recherche de mots-clés, contenu E-E-A-T, netlinking white-hat.'
  },
  'ia-pme-cas-usage-roi': {
    title: "Integrer l'IA dans votre PME : cas d'usage et ROI mesurables",
    pages: 78,
    pdfUrl: '/downloads/livre-blanc-ia-pme-cas-usage-roi.pdf',
    description: "20 cas d'usage IA concrets pour PME : chatbots WhatsApp, agents IA, automatisation, RAG."
  },
  'tunnels-vente-cro-3x-conversion': {
    title: 'Tunnels de vente : passer de 1% a 5% de conversion en 90 jours',
    pages: 54,
    pdfUrl: '/downloads/livre-blanc-tunnels-vente-cro-3x-conversion.pdf',
    description: 'Méthodologie CRO complète : audit comportemental, conception de pages d’atterrissage, tests A/B, paiements optimisés.'
  },
  'ecommerce-afrique-paiement-mobile-money': {
    title: 'E-commerce en Afrique francophone : Mobile Money, logistique, conversion',
    pages: 68,
    pdfUrl: '/downloads/livre-blanc-ecommerce-afrique-paiement-mobile-money.pdf',
    description: 'Guide complet pour lancer ou scaler un e-commerce en Afrique francophone.'
  },
  'refonte-site-checklist-complete': {
    title: 'Refonte de site web : checklist 60 points pour eviter les pieges',
    pages: 48,
    pdfUrl: '/downloads/livre-blanc-refonte-site-checklist-complete.pdf',
    description: 'Checklist 60 points couvrant tous les pieges techniques, SEO, UX, business a eviter.'
  }
};

app.post('/api/livre-blanc/request', livreBlancLimiter, honeypotCheck('lb_check_hp'), limitBody(10), async (req, res) => {
  try {
    const name = sanitize(req.body.name, 120);
    const email = sanitizeEmail(req.body.email);
    const company = sanitize(req.body.company || '', 120);
    const phone = sanitize(req.body.phone || '', 30);
    const slug = sanitize(req.body.slug || '', 100);
    const newsletterOptIn = req.body.newsletter === true; // consentement explicite (case non pré-cochée)

    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom requis.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide.' });
    // Cherche d'abord en base (CMS), repli sur les livres blancs historiques codés.
    // Slug strict (jamais « constructor », « __proto__ »…) et repli uniquement sur les clés propres.
    if (!/^[a-z0-9-]{1,100}$/.test(slug)) return res.status(400).json({ error: 'Livre blanc inconnu.' });
    let lb = await LivreBlanc.findOne({ slug, status: 'publie' }).lean();
    if (!lb && Object.prototype.hasOwnProperty.call(LIVRES_BLANCS, slug)) lb = LIVRES_BLANCS[slug];
    if (!lb) return res.status(400).json({ error: 'Livre blanc inconnu.' });
    // Lien PDF : uniquement un fichier de /downloads (évite « https://www.pirabellabs.com@autre-site »).
    if (!/^\/downloads\/[\w.-]+\.pdf$/.test(lb.pdfUrl || '')) return res.status(400).json({ error: 'Livre blanc indisponible.' });
    if (lb._id) LivreBlanc.updateOne({ _id: lb._id }, { $inc: { downloads: 1 } }).catch(() => {});

    const ipHash = crypto.createHash('sha256')
      .update((req.ip || '') + (process.env.JWT_SECRET || ''))
      .digest('hex').slice(0, 32);

    const lead = await Lead.create({
      type: 'livre-blanc',
      livreBlancSlug: slug,
      livreBlancTitle: lb.title,
      name, email, phone, company,
      service: 'livre-blanc',
      message: `Téléchargement du livre blanc : ${lb.title}`,
      newsletterOptIn,
      source: 'site_livre_blanc',
      userAgent: (req.headers['user-agent'] || '').slice(0, 500),
      ipHash,
    });

    const pdfFullUrl = 'https://www.pirabellabs.com' + lb.pdfUrl;

    // Email admin
    await sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      '[Pirabel Labs] Nouveau téléchargement de livre blanc — ' + lb.title,
      newOrderEmail({ name: escapeHtml(name), email: escapeHtml(email), phone: escapeHtml(phone), company: escapeHtml(company), service: escapeHtml('Livre blanc : ' + lb.title), message: escapeHtml(`Lead : ${name} <${email}>\nLivre blanc téléchargé : ${lb.title}\nNewsletter opt-in : ${newsletterOptIn ? 'OUI' : 'NON'}`).replace(/\n/g, '<br>') }),
      { replyTo: email }
    ).catch(e => console.error('[livre-blanc] admin email error:', e.message));

    // Email client avec lien de telechargement
    const downloadHtml = masterTemplate({
      headerType: 'hero',
      preheader: 'Votre livre blanc est prêt à télécharger',
      // Prénom affiché seulement s'il ressemble à un prénom (aucun texte arbitraire relayé par e-mail).
      title: /^[\p{L}' -]{1,30}$/u.test(name.split(' ')[0]) ? 'Bonjour ' + escapeHtml(name.split(' ')[0]) + ',' : 'Bonjour,',
      subtitle: 'Voici votre livre blanc Pirabel Labs',
      body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Merci d’avoir téléchargé notre livre blanc&nbsp;:</p>' +
        '<div style="margin:24px 0;padding:24px;background:#0e0e0e;border:1px solid rgba(255,85,0,0.3);border-radius:12px;">' +
        '<div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:#FF5500;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">Livre blanc &middot; ' + lb.pages + ' pages</div>' +
        '<div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:20px;color:#e5e2e1;line-height:1.3;margin-bottom:12px;">' + escapeHtml(lb.title) + '</div>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.7);line-height:1.6;margin:0;">' + escapeHtml(lb.description) + '</p>' +
        '</div>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.6);line-height:1.6;">Vous pouvez le télécharger avec le bouton ci-dessous. Conservez cet e-mail pour y revenir plus tard.</p>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.5);margin-top:24px;">Une question après lecture&nbsp;? Écrivez-nous directement&nbsp;: <a href="mailto:contact@pirabellabs.com" style="color:#FF5500;">contact@pirabellabs.com</a> ou WhatsApp : <a href="https://wa.me/33757751778" style="color:#FF5500;">+33 7 57 75 17 78</a>.</p>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.5);margin-top:24px;">Bonne lecture,<br><strong style="color:#e5e2e1;">L’équipe Pirabel Labs</strong></p>',
      cta: 'Télécharger le PDF',
      ctaUrl: pdfFullUrl,
      ctaSecondary: 'Voir tous nos livres blancs',
      ctaSecondaryUrl: 'https://www.pirabellabs.com/livres-blancs',
    });

    await sendEmail(
      email,
      'Votre livre blanc : ' + lb.title,
      downloadHtml
    ).catch(e => console.error('[livre-blanc] client email error:', e.message));

    res.json({
      success: true,
      message: 'Livre blanc envoyé par e-mail !',
      pdfUrl: lb.pdfUrl
    });
  } catch (err) {
    console.error('[livre-blanc] error:', err.message);
    res.status(500).json({ error: 'Erreur serveur. Réessayez ou écrivez-nous à contact@pirabellabs.com' });
  }
});

// === ADMIN AUTH ===
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: 'Trop de tentatives. Réessayez dans 15 minutes.',
  keyPrefix: 'login',
});

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

app.post('/api/admin/login', loginLimiter, limitBody(5), async (req, res) => {
  try {
    const email = sanitizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive || user.role !== 'admin') {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides.' });

    user.lastLogin = new Date();
    await user.save();

    const token = user.generateToken();
    res.cookie('token', token, COOKIE_OPTS);
    res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[login] error:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ success: true });
});

// Changement du mot de passe par l'administrateur connecté (ancien mot de passe exigé).
// Les autres sessions sont fermées ; la session courante reçoit un nouveau jeton.
app.post('/api/admin/account/password', loginLimiter, limitBody(5), auth, adminOnly, async (req, res) => {
  try {
    const current = String(req.body.current || '');
    const next = String(req.body.next || '');
    const confirm = String(req.body.confirm || '');
    if (!current || !next) return res.status(400).json({ error: 'Renseignez le mot de passe actuel et le nouveau.' });
    if (next !== confirm) return res.status(400).json({ error: 'Les deux nouveaux mots de passe ne sont pas identiques.' });
    if (next.length < 12 || next.length > 128) return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir entre 12 et 128 caractères.' });
    if (!/[A-Za-z]/.test(next) || !/[0-9]/.test(next)) return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins une lettre et un chiffre.' });
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(400).json({ error: 'Compte introuvable.' });
    if (!(await user.comparePassword(current))) return res.status(400).json({ error: 'Le mot de passe actuel est incorrect.' });
    if (await user.comparePassword(next)) return res.status(400).json({ error: 'Le nouveau mot de passe doit être différent de l’actuel.' });
    user.password = next;
    user.passwordChangedAt = new Date(Date.now() - 1000);
    await user.save();
    res.cookie('token', user.generateToken(), COOKIE_OPTS);
    res.json({ success: true });
  } catch (err) {
    console.error('[account.password] error:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.get('/api/admin/me', auth, adminOnly, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

// === ADMIN : LEADS ===
app.get('/api/admin/leads', auth, adminOnly, async (req, res) => {
  try {
    const status = sanitize(req.query.status || '', 30);
    const type = sanitize(req.query.type || '', 30);
    const stage = sanitize(req.query.stage || '', 30);
    const source = sanitize(req.query.source || '', 40);
    const search = sanitize(req.query.q || '', 80);
    const livreBlanc = sanitize(req.query.livreBlanc || '', 100);
    const q = {};
    if (['nouveau', 'lu', 'en_cours', 'converti', 'perdu', 'newsletter_ok'].includes(status)) q.status = status;
    if (['contact', 'livre-blanc'].includes(type)) q.type = type;
    if (['prospect', 'qualifie', 'devis_envoye', 'client', 'inactif'].includes(stage)) q.stage = stage;
    if (source === 'prospection') q.source = 'prospection';
    else if (source === 'site') q.source = { $ne: 'prospection' };
    if (livreBlanc) q.livreBlancSlug = livreBlanc;
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      q.$or = [{ name: rx }, { company: rx }, { email: rx }, { phone: rx }, { 'clientData.city': rx }, { 'clientData.industry': rx }];
    }
    const leads = await Lead.find(q).sort({ createdAt: -1 }).limit(1500);
    const stats = await Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byType = await Lead.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);
    const byLivreBlanc = await Lead.aggregate([
      { $match: { type: 'livre-blanc' } },
      { $group: { _id: '$livreBlancSlug', count: { $sum: 1 }, title: { $first: '$livreBlancTitle' } } },
      { $sort: { count: -1 } }
    ]);
    // Réponses du formulaire de qualification, prêtes à afficher (libellés lisibles) dans la fiche du tableau de bord.
    const withRows = leads.map((l) => {
      const o = l.toObject();
      if (o.qualification) {
        let flags = [];
        try { flags = scoreQualification(o.qualification).flags; } catch (e) { flags = []; }
        try { o.qualificationRows = qualificationRows(o.qualification, { score: o.qualificationScore, label: o.qualificationLabel, flags }); } catch (e) { o.qualificationRows = []; }
      }
      return o;
    });
    res.json({ leads: withRows, stats, byType, byLivreBlanc });
  } catch (err) {
    console.error('[leads] list error:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Import en masse de prospects (prospection à froid). Dédup par entreprise+téléphone/e-mail.
app.post('/api/admin/leads/import', auth, adminOnly, limitBody(4000), async (req, res) => {
  try {
    const items = Array.isArray(req.body.prospects) ? req.body.prospects.slice(0, 600) : [];
    if (!items.length) return res.status(400).json({ error: 'Aucun prospect fourni.' });
    // Clés existantes (entreprise|tel) des prospects déjà importés — une seule requête.
    const existing = await Lead.find({ source: 'prospection' }).select('company phone').lean();
    const seen = new Set(existing.map(l => (l.company || '').toLowerCase() + '|' + (l.phone || '')));
    let skipped = 0;
    const docs = [];
    for (const p of items) {
      const company = sanitize(p.company || p.name || '', 120);
      if (!company) { skipped++; continue; }
      const phone = sanitize(p.phone || '', 30);
      const key = company.toLowerCase() + '|' + phone;
      if (seen.has(key)) { skipped++; continue; }
      seen.add(key);
      const niche = sanitize(p.niche || '', 100);
      docs.push({
        type: 'contact', stage: 'prospect', status: 'nouveau',
        name: company, company, email: sanitizeEmail(p.email || ''), phone,
        service: niche.slice(0, 60), source: 'prospection', newsletterOptIn: false,
        clientData: { city: sanitize(p.city || '', 100), industry: niche, website: sanitize(p.website || '', 300), notes: sanitize(p.notes || '', 5000) },
        internalNotes: sanitize(p.notes || '', 5000),
        createdAt: new Date(), updatedAt: new Date(),
      });
    }
    let created = 0;
    if (docs.length) { const r = await Lead.insertMany(docs, { ordered: false }); created = r.length; }
    res.json({ success: true, created, skipped, received: items.length });
  } catch (err) { console.error('[leads.import]', err.message); res.status(500).json({ error: 'Erreur import.', message: err.message }); }
});

// Bulk email aux leads (newsletter / relance / annonce)
const bulkEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  message: 'Trop d’envois groupés. Réessayez dans 1 heure.',
  keyPrefix: 'bulk-email',
});

app.post('/api/admin/leads/bulk-email', auth, adminOnly, bulkEmailLimiter, limitBody(50), async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.filter(id => /^[a-f0-9]{24}$/i.test(id)) : [];
    const subject = sanitize(req.body.subject || '', 200);
    const bodyHtml = sanitizeSoft(String(req.body.bodyHtml || ''), 50000);
    const onlyOptIn = req.body.onlyOptIn !== false;

    if (!ids.length) return res.status(400).json({ error: 'Aucun contact sélectionné.' });
    if (!subject || subject.length < 3) return res.status(400).json({ error: 'Sujet requis (3 caracteres min).' });
    if (!bodyHtml || bodyHtml.length < 20) return res.status(400).json({ error: 'Corps email requis (20 caracteres min).' });

    const query = { _id: { $in: ids } };
    if (onlyOptIn) query.newsletterOptIn = true;

    const leads = await Lead.find(query);
    if (!leads.length) return res.status(404).json({ error: 'Aucun contact valide trouvé (consentement newsletter ?).' });

    let sent = 0, failed = 0;
    const errors = [];

    // Send sequentially to avoid Resend rate limits (1 email = ~150ms minimum)
    for (const lead of leads) {
      const fullEmail = adminCampaignEmailHtml(bodyHtml, lead);

      try {
        await sendEmail(lead.email, subject, fullEmail);
        lead.lastEmailSentAt = new Date();
        lead.emailsSentCount = (lead.emailsSentCount || 0) + 1;
        await lead.save();
        sent++;
      } catch (e) {
        failed++;
        errors.push({ leadId: lead._id, error: e.message });
      }
    }

    // Journal de la campagne (un résumé)
    try {
      await SentEmail.create({
        type: 'masse', to: '', toName: leads.length + ' destinataire(s)', subject, body: bodyHtml,
        recipientsCount: leads.length, sentCount: sent, failedCount: failed,
        status: failed === 0 ? 'envoye' : (sent === 0 ? 'echec' : 'partiel'),
        sentBy: req.user._id, sentByName: req.user.name || '',
      });
    } catch (logErr) { console.error('[bulk-email.log]', logErr.message); }

    res.json({
      success: true,
      message: `${sent} e-mail(s) envoyé(s), ${failed} échec(s) sur ${leads.length} contacts.`,
      sent, failed, errors
    });
  } catch (err) {
    console.error('[bulk-email] error:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.get('/api/admin/leads/:id', auth, adminOnly, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead introuvable.' });
    const o = lead.toObject();
    if (o.qualification) {
      let flags = [];
      try { flags = scoreQualification(o.qualification).flags; } catch (e) { flags = []; }
      try { o.qualificationRows = qualificationRows(o.qualification, { score: o.qualificationScore, label: o.qualificationLabel, flags }); } catch (e) { o.qualificationRows = []; }
    }
    res.json(o);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.patch('/api/admin/leads/:id', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead introuvable.' });
    if (req.body.status !== undefined && ['nouveau', 'lu', 'en_cours', 'converti', 'perdu'].includes(req.body.status)) {
      lead.status = req.body.status;
    }
    if (req.body.internalNotes !== undefined) {
      lead.internalNotes = sanitize(req.body.internalNotes, 5000);
    }
    await lead.save();
    res.json(lead);
  } catch (err) {
    console.error('[leads] update error:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.delete('/api/admin/leads/:id', auth, adminOnly, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead introuvable.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// === STATS (dashboard analytics) ===
app.get('/api/admin/stats', auth, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    const d7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [total, last30, last7, byService, byStatus, bySource, last12Months] = await Promise.all([
      Lead.countDocuments({}),
      Lead.countDocuments({ createdAt: { $gte: d30 } }),
      Lead.countDocuments({ createdAt: { $gte: d7 } }),
      Lead.aggregate([{ $group: { _id: '$service', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.aggregate([
        { $match: { createdAt: { $gte: yearStart } } },
        { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { '_id.y': 1, '_id.m': 1 } },
      ]),
    ]);

    const converted = await Lead.countDocuments({ $or: [{ status: 'converti' }, { stage: 'client' }] });
    const conversionRate = total ? Math.round((converted / total) * 100 * 10) / 10 : 0;

    res.json({
      kpis: { total, last30, last7, converted, conversionRate },
      byService,
      byStatus,
      bySource,
      last12Months,
    });
  } catch (err) {
    console.error('[stats]', err.message);
    res.status(500).json({ error: 'Erreur stats.' });
  }
});

// === REPONDRE / ECRIRE A UN CLIENT OU PROSPECT (envoi email individuel) ===
// === E-mails écrits depuis le tableau de bord : même rendu à l'envoi et dans l'aperçu ===
function adminSignatureHtml() {
  return '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;border-top:1px solid #ece5de;padding-top:18px;width:100%;"><tr>' +
    '<td style="width:52px;vertical-align:middle;"><span style="display:inline-block;width:44px;height:44px;line-height:44px;border-radius:50%;background:#fff4ec;border:1px solid #ffd9c2;color:#B83A00;font-weight:800;text-align:center;font-size:15px;">PL</span></td>' +
    '<td style="vertical-align:middle;font-size:14px;line-height:1.5;color:#4a413b;"><strong style="color:#17120f;">L’équipe Pirabel Labs</strong><br>www.pirabellabs.com · <a href="https://wa.me/33757751778" style="color:#B83A00;font-weight:600;">WhatsApp</a></td>' +
    '</tr></table>';
}
function adminTextEmailHtml(message, firstName, subject) {
  const para = ES.p;
  const text = String(message || '');
  const bodyHtml = '<p style="' + para + '">' +
    escapeHtml(text).replace(/\n\n+/g, '</p><p style="' + para + '">').replace(/\n/g, '<br>') + '</p>' +
    (/(lissanon|équipe pirabel labs)[\s\S]{0,120}$/i.test(text.trim()) ? '' : adminSignatureHtml());
  return masterTemplate({
    headerType: 'hero',
    preheader: subject || '',
    title: firstName ? 'Bonjour ' + escapeHtml(firstName) + ',' : 'Bonjour,',
    body: bodyHtml,
    cta: 'Voir nos réalisations',
    ctaUrl: 'https://www.pirabellabs.com/realisations',
  });
}
function adminCampaignEmailHtml(bodyHtml, lead) {
  const first = String((lead && lead.name) || '').split(' ')[0];
  let raw = String(bodyHtml || '');
  // Texte sans balise : paragraphes et retours à la ligne, comme un e-mail individuel.
  if (!/<[a-z][^>]*>/i.test(raw)) raw = '<p style="' + ES.p + '">' + escapeHtml(raw).replace(/\n\n+/g, '</p><p style="' + ES.p + '">').replace(/\n/g, '<br>') + '</p>';
  const personalized = raw
    .replace(/\{\{name\}\}/g, escapeHtml((lead && lead.name) || ''))
    .replace(/\{\{firstName\}\}/g, escapeHtml(first))
    .replace(/\{\{company\}\}/g, escapeHtml((lead && lead.company) || ''));
  return masterTemplate({
    headerType: 'hero',
    title: first ? 'Bonjour ' + escapeHtml(first) + ',' : 'Bonjour,',
    body: personalized +
      '<p style="margin-top:32px;font-size:13px;color:#6b605a;line-height:1.5;">Vous recevez cet e-mail car vous avez échangé avec Pirabel Labs. Pour ne plus en recevoir, répondez simplement « DÉSABONNEMENT ».</p>',
    cta: 'Voir nos réalisations',
    ctaUrl: 'https://www.pirabellabs.com/realisations',
  });
}

// Aperçu fidèle d'un e-mail avant envoi (ou d'un e-mail du journal) : rendu dans une iframe du tableau de bord.
app.post('/api/admin/email-preview', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const b = req.body || {};
    const leadId = sanitize(b.leadId || '', 30);
    let lead = null;
    if (leadId && /^[a-f0-9]{24}$/i.test(leadId)) lead = await Lead.findById(leadId).select('name company').lean().catch(() => null);
    if (!lead && b.name) lead = { name: sanitize(b.name, 120), company: '' };
    const html = b.mode === 'masse'
      ? adminCampaignEmailHtml(sanitizeSoft(String(b.bodyHtml || ''), 60000), lead || { name: 'Aïcha Koné', company: 'Maison Koné' })
      : adminTextEmailHtml(String(b.message || '').slice(0, 20000), lead ? String(lead.name || '').split(' ')[0] : '', sanitize(b.subject || '', 200));
    res.set('Cache-Control', 'no-store').json({ html });
  } catch (e) {
    res.status(500).json({ error: 'Aperçu indisponible.' });
  }
});

app.post('/api/admin/send-email', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const leadId = sanitize(req.body && req.body.leadId || '', 30);
    let to = sanitizeEmail(req.body && req.body.to || '');
    const subject = sanitize(req.body && req.body.subject || '', 200);
    const message = String(req.body && req.body.message || '').slice(0, 20000);

    let lead = null;
    if (leadId && /^[a-f0-9]{24}$/i.test(leadId)) {
      lead = await Lead.findById(leadId);
      if (lead && !to) to = (lead.email || '').toLowerCase();
    }
    if (!isValidEmail(to)) return res.status(400).json({ error: 'Adresse email du destinataire invalide.' });
    if (!subject || subject.length < 2) return res.status(400).json({ error: 'Sujet requis.' });
    if (!message || message.trim().length < 2) return res.status(400).json({ error: 'Message requis.' });

    // Texte libre -> HTML (paragraphes + retours à la ligne), échappé, avec signature
    const html = adminTextEmailHtml(message, lead && lead.name ? lead.name.split(' ')[0] : '', subject);

    const ok = await sendEmail(to, subject, html, { replyTo: process.env.ADMIN_EMAIL || 'contact@pirabellabs.com' });
    if (!ok) return res.status(502).json({ error: "Envoi refusé. Vérifiez que le domaine pirabellabs.com est validé sur Resend (resend.com/domains)." });

    if (lead) {
      lead.lastEmailSentAt = new Date();
      lead.emailsSentCount = (lead.emailsSentCount || 0) + 1;
      if (lead.status === 'nouveau') lead.status = 'lu';
      await lead.save();
    }
    // Journal de l'e-mail envoyé (trace consultable)
    try {
      await SentEmail.create({
        type: 'individuel', to, toName: (lead && lead.name) || '', subject, body: message,
        recipientsCount: 1, sentCount: 1, failedCount: 0, status: 'envoye',
        leadId: lead ? lead._id : undefined, sentBy: req.user._id, sentByName: req.user.name || '',
      });
    } catch (logErr) { console.error('[send-email.log]', logErr.message); }
    res.json({ success: true, message: 'E-mail envoyé à ' + to });
  } catch (err) {
    console.error('[send-email]', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// === TRAFFIC TRACKING (public, léger) ===
const trackLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, message: 'rate', keyPrefix: 'track' });
function todayUTC() { return new Date().toISOString().slice(0, 10); }

app.post('/api/track', trackLimiter, limitBody(5), async (req, res) => {
  try {
    const type = sanitize(req.body && req.body.type || '', 20);
    const vid = sanitize(req.body && req.body.vid || '', 40);
    const day = todayUTC();
    if (type === 'pageview') {
      const update = { $inc: { pageviews: 1 } };
      if (vid) update.$addToSet = { visitors: vid };
      await TrafficStat.updateOne({ day }, update, { upsert: true });
    } else if (type === 'whatsapp') {
      await TrafficStat.updateOne({ day }, { $inc: { whatsappClicks: 1 } }, { upsert: true });
    }
    res.json({ ok: true });
  } catch (err) {
    // Ne jamais casser le tracking côté client
    res.json({ ok: false });
  }
});

app.get('/api/admin/traffic', auth, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const days = [];
    for (let i = 29; i >= 0; i--) days.push(new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10));
    const stats = await TrafficStat.find({ day: { $in: days } }).lean();
    const map = {};
    stats.forEach(s => { map[s.day] = s; });
    const series = days.map(day => {
      const s = map[day] || {};
      return { day, pageviews: s.pageviews || 0, uniqueVisitors: (s.visitors || []).length, whatsappClicks: s.whatsappClicks || 0 };
    });
    const sum = (arr, k) => arr.reduce((a, x) => a + x[k], 0);
    const last7 = series.slice(-7);
    const tStr = todayUTC();
    const t = map[tStr] || {};
    res.json({
      today: { pageviews: t.pageviews || 0, uniqueVisitors: (t.visitors || []).length, whatsappClicks: t.whatsappClicks || 0 },
      last7: { pageviews: sum(last7, 'pageviews'), uniqueVisitors: sum(last7, 'uniqueVisitors'), whatsappClicks: sum(last7, 'whatsappClicks') },
      last30: { pageviews: sum(series, 'pageviews'), uniqueVisitors: sum(series, 'uniqueVisitors'), whatsappClicks: sum(series, 'whatsappClicks') },
      series,
    });
  } catch (err) {
    console.error('[traffic]', err.message);
    res.status(500).json({ error: 'Erreur trafic.' });
  }
});

// ========================================================================
// === BLOG / CMS : articles geres depuis le dashboard, rendus sur le site ===
// ========================================================================
function slugify(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
async function uniqueSlug(base, excludeId) {
  let slug = slugify(base) || ('article-' + Date.now().toString(36));
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await Article.findOne({ slug });
    if (!existing || (excludeId && String(existing._id) === String(excludeId))) return slug;
    n++; slug = slugify(base).slice(0, 76) + '-' + n;
  }
}
const SITE = () => (process.env.SITE_URL || 'https://www.pirabellabs.com').replace(/\/$/, '');

// ========================================================================
// Habillage des pages publiques rendues par le serveur (blog, réalisations,
// témoignages, carrières, rendez-vous) : même en-tête, pied de page, thèmes
// clair/sombre et jetons de design que les pages Astro (app/nav.js + /css/site.css).
// ========================================================================
const ASSET_V = siteNav.VER; // ?v= des ressources /css, /js, /img (cache d'un an)
const ic = (name, size, cls) => siteNav.icon(name, size, cls, ASSET_V);
// JSON-LD sûr dans un <script> : « < » échappé, aucune chaîne ne peut fermer la balise.
const ldJson = (o) => '<script type="application/ld+json">' + JSON.stringify(o).replace(/</g, '\\u003c') + '</script>';
// Texte saisi dans l'admin, échappé puis mis aux normes typographiques françaises :
// espace insécable avant « : ; ! ? » et à l'intérieur des guillemets (pas de « : » orphelin en début de ligne).
const NBSP = String.fromCharCode(160);
const frt = (s) => escapeHtml(s).replace(/ ([:;!?»])/g, NBSP + '$1').replace(/« /g, '«' + NBSP);
// Même règle appliquée au texte visible d'un fragment HTML (gabarits et contenu) : seuls les
// nœuds texte sont touchés, jamais les balises, attributs, scripts, styles, code ni zones de saisie.
// Découpage d'un fragment HTML en jetons : bloc brut (script, style, pre, code, textarea,
// laissé intact), balise, ou texte. Le « < » isolé d'un texte reste un jeton neutre.
const HTML_TOKENS = /<(script|style|pre|code|textarea)\b[\s\S]*?<\/\1\s*>|<[^>]*>|[^<]+|</gi;
function frTypoHtml(html) {
  return String(html || '').replace(HTML_TOKENS, (tok, raw) =>
    (raw || tok[0] === '<') ? tok : tok.replace(/ ([:;!?»])/g, NBSP + '$1').replace(/« /g, '«' + NBSP));
}
// Valeur JS sûre dans un <script> inline.
const jsStr = (v) => JSON.stringify(String(v == null ? '' : v)).replace(/</g, '\\u003c');

// Fil d'Ariane visible + JSON-LD BreadcrumbList. items : [{ name, path }] (le dernier = page courante).
function crumbs(items) {
  const all = [{ name: 'Accueil', path: '/' }].concat(items);
  const html = '<nav class="px-crumbs" aria-label="Fil d’Ariane"><ol>' + all.map((it, i) =>
    i === all.length - 1
      ? '<li><span aria-current="page">' + frt(it.name) + '</span></li>'
      : '<li><a href="' + escapeHtml(it.path) + '">' + escapeHtml(it.name) + '</a></li>').join('') + '</ol></nav>';
  const ld = ldJson({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: all.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE() + (it.path === '/' ? '/' : it.path) })),
  });
  return { html, ld };
}

// Contenu HTML saisi dans l'admin (articles, études de cas) : les couleurs en dur des
// attributs style (anciens gabarits sombres) sont converties en jetons de thème, pour que
// le thème clair reste lisible. Les tableaux sont enveloppés pour défiler sur mobile.
function themeContent(html) {
  const theme = (css) => css
    .replace(/(^|;)\s*color\s*:\s*(#fff(?:fff)?|white|#e5e2e1)\b/gi, '$1color:var(--text)')
    .replace(/(^|;)\s*color\s*:\s*#ff5500\b/gi, '$1color:var(--accent-3)')
    .replace(/rgba\(\s*(?:229\s*,\s*226\s*,\s*225|255\s*,\s*255\s*,\s*255)\s*,/gi, 'rgba(var(--ink),')
    .replace(/(background(?:-color)?\s*:\s*)(#0a0a0a|#0e0e0e|#0e0d0d|#111|#111111|#131313|#141313|#141414|#151414|#161515|#161616|#1a1a1a)\b/gi, '$1var(--flat-bg)')
    .replace(/(border(?:-[a-z]+)?\s*:[^;]*?)(#161616|#1a1a1a|#222|#222222)\b/gi, '$1rgba(var(--ink),.12)');
  // Seules les vraies balises sont modifiées : ni le texte, ni les blocs pre/code/script/style.
  return String(html || '').replace(HTML_TOKENS, (tok, raw) => {
    if (raw || tok[0] !== '<' || tok.length < 3) return tok;
    let t = tok.replace(/\sstyle="([^"]*)"/gi, (m, css) => ' style="' + theme(css) + '"');
    if (/^<table\b/i.test(t)) t = '<div class="px-table">' + t; // tableau défilant sur mobile
    else if (/^<\/table\s*>$/i.test(t)) t += '</div>';
    return t;
  });
}

// Décode les entités HTML courantes d'un texte extrait du contenu (réécrit ensuite par escapeHtml).
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: String.fromCharCode(160), rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', laquo: '«', raquo: '»', hellip: '…', ndash: '–', mdash: '—', eacute: 'é', egrave: 'è', ecirc: 'ê', agrave: 'à', ccedil: 'ç', oelig: 'œ', Eacute: 'É', Egrave: 'È', Ecirc: 'Ê', Agrave: 'À', Ccedil: 'Ç', OElig: 'Œ', acirc: 'â', icirc: 'î', ocirc: 'ô', ucirc: 'û', ugrave: 'ù', euml: 'ë', iuml: 'ï', uuml: 'ü', euro: '€', middot: '·', rarr: '→', times: '×' };
function decodeEnt(s) {
  return String(s || '').replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(n); } catch (x) { return ' '; } }
    return Object.prototype.hasOwnProperty.call(ENT, e) ? ENT[e] : ' ';
  });
}

// Styles communs des pages publiques rendues par le serveur (jetons de /css/site.css).
const PUB_CSS = `
main [hidden]{display:none!important;}
.px-wrap{width:100%;max-width:var(--container);margin-inline:auto;padding:0 var(--gutter) clamp(48px,6vw,88px);}
.px-hero{max-width:860px;margin-inline:auto;padding:clamp(128px,14vw,170px) 0 clamp(30px,4vw,48px);text-align:center;}
main p.eyebrow{max-width:none;margin:0 0 18px;color:var(--accent-3);font-size:.78rem;}
.px-hero .eyebrow{justify-content:center;}
.px-hero h1,.px-title{font-family:var(--font-display);font-weight:800;font-size:clamp(1.85rem,1.1rem + 2.2vw,2.9rem);letter-spacing:-.035em;line-height:1.05;}
.px-hero__lead{max-width:660px;margin:20px auto 0;color:var(--text-2);font-size:var(--fs-lead);text-wrap:pretty;}
.px-hero__ctas{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:30px;}
.px-hero .eyebrow,.px-hero__lead,.px-hero__ctas{animation:px-rise .9s var(--ease-out) both;}
.px-hero__lead{animation-delay:.12s;}.px-hero__ctas{animation-delay:.22s;}
@keyframes px-rise{from{opacity:0;transform:translate3d(0,18px,0);}}
.px-crumbs{padding-top:clamp(106px,11vw,128px);margin-bottom:26px;font-family:var(--font-ui);font-size:.86rem;color:var(--text-3);}
.px-crumbs ol{display:flex;flex-wrap:wrap;align-items:center;gap:4px 0;}
.px-crumbs li{display:inline-flex;align-items:center;min-width:0;}
.px-crumbs li+li::before{content:"›";margin:0 10px;opacity:.6;}
.px-crumbs a{color:var(--text-2);transition:color var(--dur-fast);}
.px-crumbs a:hover{color:var(--accent-3);}
.px-crumbs [aria-current]{color:var(--text);max-width:46ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.px-back{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-ui);font-weight:600;font-size:.9rem;color:var(--text-2);transition:color var(--dur-fast);}
.px-back:hover{color:var(--accent-3);}
.px-empty{max-width:640px;margin-inline:auto;padding:clamp(140px,16vw,190px) var(--gutter) clamp(40px,6vw,80px);text-align:center;}
.px-empty .eyebrow{justify-content:center;}
.px-empty p{margin:16px 0 28px;color:var(--text-2);font-size:var(--fs-lead);}
.px-note{padding:48px 24px;text-align:center;color:var(--text-2);border-radius:var(--r-lg);}
.px-kicker{font-family:var(--font-ui);font-size:.74rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-3);}
.px-field{display:grid;gap:8px;}
.px-field label{font-family:var(--font-ui);font-weight:600;font-size:.9rem;}
.px-field .px-opt{font-weight:400;color:var(--text-3);}
.px-field input,.px-field textarea,.px-field select,.px-input{width:100%;padding:13px 16px;border:0;border-radius:14px;background:var(--field-bg);color:var(--text);box-shadow:inset 0 0 0 1px rgba(var(--ink),.14);font-size:1rem;line-height:1.5;transition:box-shadow .2s;}
.px-field textarea{resize:vertical;min-height:120px;}
.px-field input::placeholder,.px-field textarea::placeholder,.px-input::placeholder{color:rgba(var(--text-rgb),.42);}
.px-field input:focus,.px-field textarea:focus,.px-field select:focus,.px-input:focus{outline:none;box-shadow:inset 0 0 0 1.5px var(--accent-2),0 0 0 4px rgba(255,85,0,.18);}
.px-hint{font-size:.8rem;color:var(--text-3);}
.px-grid2{display:grid;gap:16px;}
@media(min-width:640px){.px-grid2{grid-template-columns:1fr 1fr;}}
.px-msg{padding:13px 16px;border-radius:12px;font-size:.92rem;line-height:1.55;}
.px-msg:empty{display:none;}
.px-msg.is-ok{color:var(--success);background:rgba(74,222,128,.08);box-shadow:inset 0 0 0 1px rgba(74,222,128,.32);}
.px-msg.is-err{color:var(--danger);background:rgba(255,138,138,.08);box-shadow:inset 0 0 0 1px rgba(255,138,138,.32);}
.px-hp{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;}
.px-table{max-width:100%;overflow-x:auto;margin:1.6em 0;border-radius:var(--r-md);box-shadow:inset 0 0 0 1px rgba(var(--ink),.1);}
.px-table table{width:100%;min-width:520px;border-collapse:collapse;font-size:.94rem;line-height:1.55;}
.px-table th,.px-table td{padding:12px 16px;text-align:left;vertical-align:top;border-bottom:1px solid rgba(var(--ink),.08);}
.px-table th{font-family:var(--font-ui);font-weight:600;color:var(--text);background:rgba(var(--ink),.05);}
.px-table tr:last-child td{border-bottom:0;}
/* ---- Blog : liste ---- */
.bx-toolbar{display:flex;gap:14px;align-items:center;margin:0 0 30px;}
.bx-filters{display:flex;flex-wrap:nowrap;gap:8px;overflow-x:auto;flex:1;min-width:0;padding:4px 2px 8px;scrollbar-width:none;}
.bx-filters::-webkit-scrollbar{display:none;}
.bx-filters a{flex-shrink:0;padding:8px 15px;border-radius:999px;font-family:var(--font-ui);font-size:.86rem;font-weight:500;color:var(--text-2);background:rgba(var(--ink),.05);box-shadow:inset 0 0 0 1px rgba(var(--ink),.1);white-space:nowrap;transition:color var(--dur-fast),box-shadow var(--dur-fast),background-color var(--dur-fast);}
.bx-filters a:hover{color:var(--text);box-shadow:inset 0 0 0 1px rgba(255,140,80,.45);}
.bx-filters a.is-active{background:var(--accent);color:var(--on-accent);box-shadow:none;font-weight:600;}
.bx-search{display:flex;align-items:center;gap:6px;flex-shrink:0;padding:4px;border-radius:999px;background:var(--field-bg);box-shadow:inset 0 0 0 1px rgba(var(--ink),.14);transition:box-shadow .2s;}
.bx-search:focus-within{box-shadow:inset 0 0 0 1.5px var(--accent-2),0 0 0 4px rgba(255,85,0,.18);}
.bx-search input{min-width:13rem;padding:8px 6px 8px 14px;border:0;background:transparent;color:var(--text);font-size:.92rem;}
.bx-search input:focus{outline:none;}
.bx-search input::placeholder{color:rgba(var(--text-rgb),.45);}
.bx-search button{display:grid;place-items:center;width:38px;height:38px;border:0;border-radius:50%;background:var(--accent);color:var(--on-accent);}
.bx-count{margin:-12px 0 26px;text-align:center;color:var(--text-3);font-size:.9rem;}
.bx-count a{color:var(--accent-3);text-decoration:underline;text-underline-offset:2px;}
.bx-grid{display:grid;gap:clamp(16px,1.8vw,24px);grid-template-columns:repeat(auto-fill,minmax(min(100%,19rem),1fr));}
.bx-card{display:flex;flex-direction:column;overflow:hidden;border-radius:var(--r-lg);color:var(--text);transition:transform .5s var(--ease-out);}
.bx-card:hover{transform:translateY(-4px);}
.bx-card__img{position:relative;aspect-ratio:16/9;overflow:hidden;background:var(--shade);}
.bx-card__img>img,.bx-card__img>svg{width:100%;height:100%;object-fit:cover;display:block;transition:transform .7s var(--ease-out);}
.bx-card:hover .bx-card__img>img,.bx-card:hover .bx-card__img>svg{transform:scale(1.04);}
.bx-card__b{display:flex;flex-direction:column;gap:8px;flex:1;padding:20px 22px 22px;}
.bx-cat{font-family:var(--font-ui);font-size:.72rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-3);}
.bx-card h2,.bx-card h3{font-size:1.14rem;line-height:1.3;letter-spacing:-.01em;}
.bx-card p{color:var(--text-2);font-size:.93rem;line-height:1.6;}
.bx-card__meta{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:auto;padding-top:6px;}
.bx-views{display:inline-flex;align-items:center;gap:6px;color:var(--text-3);font-size:.8rem;}
.bx-feat{display:grid;grid-template-columns:1.1fr 1fr;overflow:hidden;margin:0 0 clamp(28px,4vw,44px);border-radius:var(--r-xl);color:var(--text);transition:transform .5s var(--ease-out);}
.bx-feat:hover{transform:translateY(-3px);}
.bx-feat__img{position:relative;min-height:300px;overflow:hidden;background:var(--shade);}
.bx-feat__img>img,.bx-feat__img>svg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s var(--ease-out);}
.bx-feat:hover .bx-feat__img>img,.bx-feat:hover .bx-feat__img>svg{transform:scale(1.03);}
.bx-feat__b{display:flex;flex-direction:column;justify-content:center;gap:12px;padding:clamp(24px,3.6vw,48px);}
.bx-feat__star{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-ui);font-size:.74rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-3);}
.bx-feat h2{font-family:var(--font-display);font-weight:800;font-size:clamp(1.45rem,1rem + 1.5vw,2.15rem);line-height:1.12;letter-spacing:-.025em;}
.bx-feat p{color:var(--text-2);line-height:1.65;}
.bx-feat .link-arrow{margin-top:4px;}
.bx-pager{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px;margin:clamp(32px,4vw,52px) 0 0;}
.bx-pager a,.bx-pager span{display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:42px;padding:0 14px;border-radius:999px;font-family:var(--font-ui);font-size:.9rem;font-weight:600;color:var(--text-2);background:rgba(var(--ink),.05);box-shadow:inset 0 0 0 1px rgba(var(--ink),.1);transition:color var(--dur-fast),box-shadow var(--dur-fast);}
.bx-pager a:hover{color:var(--text);box-shadow:inset 0 0 0 1px rgba(255,140,80,.45);}
.bx-pager .is-active{background:var(--accent);color:var(--on-accent);box-shadow:none;}
.bx-pager .is-disabled{opacity:.4;}
/* ---- Blog : article ---- */
.bx-layout{display:grid;grid-template-columns:minmax(0,780px) 280px;justify-content:space-between;gap:clamp(32px,4vw,56px);align-items:start;}
.bx-article{min-width:0;}
.bx-preview{display:flex;align-items:center;gap:10px;margin:0 0 22px;padding:12px 16px;border-radius:12px;font-weight:600;color:var(--text);background:rgba(251,191,36,.14);box-shadow:inset 0 0 0 1px rgba(251,191,36,.5);}
.bx-preview b{padding:3px 10px;border-radius:999px;background:var(--warning);color:#1a1200;font-size:.74rem;letter-spacing:.08em;text-transform:uppercase;}
.bx-head .bx-cat{display:inline-flex;padding:6px 12px;border-radius:999px;background:var(--accent-soft);box-shadow:inset 0 0 0 1px rgba(255,140,80,.3);}
.bx-head h1{margin:16px 0 18px;font-family:var(--font-display);font-weight:800;font-size:clamp(1.85rem,1.1rem + 2.2vw,2.9rem);line-height:1.08;letter-spacing:-.03em;}
.bx-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;margin-bottom:28px;color:var(--text-3);font-size:.9rem;}
.bx-meta strong{color:var(--text-2);font-weight:600;}
.bx-meta .icon{color:var(--accent-2);}
.bx-cover{margin:0 0 clamp(28px,4vw,40px);padding:6px;border-radius:var(--r-lg);}
.bx-cover>img,.bx-cover>svg{display:block;width:100%;height:auto;border-radius:calc(var(--r-lg) - 6px);}
.bx-content{max-width:72ch;font-size:1.09rem;line-height:1.8;color:rgba(var(--text-rgb),.86);overflow-wrap:break-word;}
.bx-content>:first-child{margin-top:0;}
.bx-content h2{margin:2.3em 0 .7em;font-size:clamp(1.4rem,1.1rem + .9vw,1.75rem);line-height:1.2;color:var(--text);}
.bx-content h3{margin:1.8em 0 .5em;font-size:1.25rem;line-height:1.3;color:var(--text);}
.bx-content h4{margin:1.5em 0 .4em;font-size:1.08rem;color:var(--text);}
.bx-content p{margin:0 0 1.15em;}
.bx-content strong,.bx-content b{color:var(--text);font-weight:650;}
.bx-content a{color:var(--accent-3);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px;}
.bx-content a:hover{color:var(--accent-2);}
.bx-content ul,.bx-content ol{margin:0 0 1.2em;padding-left:1.35em;}
.bx-content ul{list-style:disc;}.bx-content ol{list-style:decimal;}
.bx-content li{margin:.35em 0;padding-left:.2em;}
.bx-content li::marker{color:var(--accent-2);}
.bx-content img{max-width:100%;height:auto;margin:1.4em 0;border-radius:var(--r-md);}
.bx-content blockquote{margin:1.6em 0;padding:4px 0 4px 20px;border-left:3px solid var(--accent);color:var(--text);font-style:italic;}
.bx-content code{padding:.12em .4em;border-radius:6px;font-size:.9em;background:rgba(var(--ink),.08);color:var(--text);}
.bx-content pre{overflow-x:auto;padding:16px 18px;border-radius:var(--r-md);background:rgba(var(--ink),.06);}
.bx-content pre code{padding:0;background:none;}
.bx-content hr{margin:2.4em 0;border:0;border-top:1px solid rgba(var(--ink),.1);}
.bx-content .article-intro{font-size:1.18em;line-height:1.7;color:var(--text);}
.bx-content nav[aria-label]{margin:0 0 2em;padding:18px 22px;border-radius:var(--r-md);background:var(--flat-bg)!important;border:0!important;box-shadow:inset 0 0 0 1px rgba(var(--ink),.1);}
.bx-content nav[aria-label] ul,.bx-content nav[aria-label] ol{margin:.6em 0 0;}
.bx-content .material-symbols-outlined{font-size:0!important;}
.art-pullquote{display:flex;gap:16px;align-items:flex-start;margin:1.9em 0;padding:20px 22px;border-left:3px solid var(--accent);border-radius:0 var(--r-md) var(--r-md) 0;background:linear-gradient(90deg,rgba(255,85,0,.1),rgba(255,85,0,.02));}
.art-pullquote__icon{flex-shrink:0;color:var(--accent-2);line-height:1;}
.art-pullquote__icon::before{content:"\\201C";display:block;font-family:var(--font-display);font-weight:800;font-size:3rem;line-height:.9;}
.art-pullquote__text{font-style:italic;color:var(--text);font-size:1.1rem;line-height:1.65;}
.art-stat-box{display:flex;gap:20px;align-items:center;margin:1.9em 0;padding:22px 24px;border-radius:var(--r-md);background:var(--flat-bg);box-shadow:inset 0 0 0 1px rgba(var(--ink),.1);}
.art-stat-box__num{flex-shrink:0;font-family:var(--font-display);font-weight:800;font-size:2.4rem;line-height:1;color:var(--accent-2);}
.art-stat-box__label{margin-bottom:4px;font-family:var(--font-ui);font-weight:600;color:var(--text);}
.art-stat-box__desc{color:var(--text-2);font-size:.93rem;line-height:1.55;}
.art-author{display:flex;gap:16px;align-items:flex-start;margin:2.6rem 0 0;padding:22px;border-radius:var(--r-lg);}
.art-author__avatar{display:grid;place-items:center;flex-shrink:0;width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#ff6a1a,var(--accent));color:var(--on-accent);font-family:var(--font-ui);font-weight:700;font-size:1.15rem;}
.art-author__label{font-family:var(--font-ui);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text-3);}
.art-author__name{font-family:var(--font-ui);font-weight:600;font-size:1.05rem;color:var(--text);}
.art-author__role{margin-bottom:6px;color:var(--accent-3);font-size:.86rem;}
.art-author__bio{margin:0;color:var(--text-2);font-size:.9rem;line-height:1.55;}
.bx-cta{position:relative;overflow:hidden;margin-top:clamp(36px,5vw,56px);padding:clamp(28px,4vw,44px);border-radius:var(--r-xl);text-align:center;}
.bx-cta__t{font-family:var(--font-display);font-weight:800;font-size:clamp(1.4rem,1.1rem + 1vw,1.85rem);letter-spacing:-.02em;}
.bx-cta__sub{max-width:34rem;margin:10px auto 0;color:var(--text-2);line-height:1.6;}
.bx-cta__btns{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:24px;}
.bx-side{position:sticky;top:96px;display:flex;flex-direction:column;gap:14px;}
.bx-toc{max-height:calc(100vh - 330px);overflow:auto;padding:18px 16px 14px;border-radius:var(--r-md);overscroll-behavior:contain;}
.bx-toc strong{display:block;margin:0 0 10px 4px;font-family:var(--font-ui);font-size:.72rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3);}
.bx-toc a{display:block;padding:6px 10px;border-left:2px solid rgba(var(--ink),.1);color:var(--text-2);font-size:.86rem;line-height:1.35;transition:color var(--dur-fast),border-color var(--dur-fast);}
.bx-toc a:hover{color:var(--text);border-left-color:var(--accent);}
.bx-side__author{display:flex;gap:12px;align-items:center;padding:14px;border-radius:var(--r-md);}
.bx-side__author .art-author__avatar{width:44px;height:44px;font-size:.95rem;}
.bx-side__name{font-family:var(--font-ui);font-weight:600;font-size:.92rem;}
.bx-side__role{color:var(--accent-3);font-size:.78rem;}
.bx-side__cta{padding:20px 18px;border-radius:var(--r-md);text-align:center;}
.bx-side__cta b{display:block;font-family:var(--font-ui);font-size:1rem;}
.bx-side__cta p{margin:6px 0 14px;color:var(--text-2);font-size:.85rem;}
.bx-related{margin-top:clamp(44px,6vw,72px);}
.bx-related>h2,.bx-comments>h2{margin:0 0 20px;font-size:clamp(1.35rem,1.1rem + .8vw,1.7rem);}
.bx-related__grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr));}
.bx-related .bx-card h3{font-size:1rem;}
.bx-comments{margin-top:clamp(44px,6vw,72px);padding-top:clamp(28px,4vw,40px);border-top:1px solid rgba(var(--ink),.1);}
.bx-cmlist{display:flex;flex-direction:column;gap:12px;margin-bottom:32px;color:var(--text-3);}
.bx-cm{padding:16px 18px;border-radius:var(--r-md);background:var(--flat-bg);box-shadow:inset 0 0 0 1px rgba(var(--ink),.1);}
.bx-cm__h{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:6px;}
.bx-cm__h strong{font-family:var(--font-ui);color:var(--text);font-size:.95rem;}
.bx-cm__h span{color:var(--text-3);font-size:.8rem;white-space:nowrap;}
.bx-cm p{margin:0;color:var(--text-2);font-size:.95rem;line-height:1.6;white-space:pre-wrap;}
.bx-cmform{display:grid;gap:14px;padding:clamp(20px,3vw,30px);border-radius:var(--r-lg);background:var(--panel-bg);}
.bx-cmform h3{font-size:1.2rem;}
.bx-cmnote{margin-top:-8px;color:var(--text-3);font-size:.88rem;}
.bx-cmmsg{font-size:.9rem;}
.bx-cmmsg:empty{display:none;}
.bx-cmform .btn{justify-self:start;}
@media(max-width:1023px){.bx-layout{grid-template-columns:minmax(0,1fr);}.bx-side{display:none;}.bx-content{max-width:none;}}
@media(max-width:760px){.bx-feat{grid-template-columns:1fr;}.bx-feat__img{min-height:200px;}.bx-toolbar{flex-direction:column;align-items:stretch;gap:12px;}.bx-search{order:-1;}.bx-search input{min-width:0;flex:1;}}
@media(max-width:600px){.bx-content{font-size:1.02rem;line-height:1.74;}.art-pullquote{padding:16px 18px;}.art-pullquote__text{font-size:1rem;}.art-stat-box{flex-direction:column;align-items:flex-start;gap:10px;padding:18px;}.art-stat-box__num{font-size:2rem;}.bx-cta__btns .btn{width:100%;}}
`;

// Coquille HTML commune : en-tête, pied de page, thèmes et scripts partagés (app/nav.js).
// headExtra : balises de la page (title, meta, canonical, JSON-LD) suivies de ses <style> éventuels.
// opts : { current: '/blog', showCta: true|false }
function blogShell(headExtra, bodyHtml, opts) {
  const h = String(headExtra || '');
  const cut = h.indexOf('<style');
  const meta = cut === -1 ? h : h.slice(0, cut);
  const pageCss = cut === -1 ? '' : h.slice(cut);
  // Image de partage par défaut (comme les pages Astro) quand la page n'en fournit pas.
  const ogDefault = (meta.includes('og:image') ? '' : '<meta property="og:image" content="' + escapeHtml(siteNav.SITE.ogImage) + '">') +
    (meta.includes('twitter:card') ? '' : '<meta name="twitter:card" content="summary_large_image">');
  return siteNav.page(
    meta + ogDefault + '<meta name="msvalidate.01" content="EB6FCB92F9E0D2E3264DE2FFBE2EEA94">' + '<style>' + PUB_CSS + '</style>' + pageCss,
    frTypoHtml(bodyHtml),
    Object.assign({ ver: ASSET_V }, opts || {})
  );
}
function fmtFr(d) {
  try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; }
}
function fmtViews(n) { n = n || 0; return n >= 1000 ? (Math.round(n / 100) / 10) + 'k' : String(n); }
// Couverture SVG générée (16/9) — repli quand aucune image réelle n'est définie.
function coverSvg(title, cat) {
  const c = escapeHtml(String(cat || 'Blog').toUpperCase());
  return '<svg viewBox="0 0 1200 675" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + escapeHtml(title || '') + '">' +
    '<defs><linearGradient id="bxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF5500" stop-opacity="0.30"/><stop offset="1" stop-color="#0e0e0e"/></linearGradient></defs>' +
    '<rect width="1200" height="675" fill="#141313"/><rect width="1200" height="675" fill="url(#bxg)"/>' +
    '<g fill="none" stroke="#FF5500" stroke-opacity="0.16" stroke-width="2"><circle cx="600" cy="337" r="300"/><circle cx="600" cy="337" r="210"/><circle cx="600" cy="337" r="120"/></g>' +
    '<text x="600" y="298" text-anchor="middle" fill="#FF5500" font-family="Space Grotesk,Arial,sans-serif" font-weight="700" font-size="30" letter-spacing="6">' + c + '</text>' +
    '<text x="600" y="378" text-anchor="middle" fill="#ffffff" font-family="Montserrat,Arial,sans-serif" font-weight="800" font-size="68">Pirabel Labs</text>' +
    '<text x="600" y="430" text-anchor="middle" fill="rgba(229,226,225,0.6)" font-family="Inter,Arial,sans-serif" font-size="26">Marketing digital &#183; IA &#183; Web</text></svg>';
}

// --- ADMIN CRUD ---
app.get('/api/admin/articles', auth, adminOnly, async (req, res) => {
  try {
    const list = await Article.find({}).select('title slug status category author featuredImage publishedAt updatedAt views readTime').sort({ updatedAt: -1 }).lean();
    res.json({ articles: list });
  } catch (e) { res.status(500).json({ error: 'Erreur chargement articles.' }); }
});
app.get('/api/admin/articles/:id', auth, adminOnly, async (req, res) => {
  try {
    const a = await Article.findById(req.params.id).lean();
    if (!a) return res.status(404).json({ error: 'Article introuvable.' });
    res.json({ article: a });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});
async function applyArticleBody(body, doc) {
  if (body.title != null) doc.title = sanitize(body.title, 200);
  if (body.excerpt != null) doc.excerpt = sanitize(body.excerpt, 500);
  if (body.content != null) doc.content = sanitizeSoft(body.content, 100000); // garde le HTML, retire <script>
  if (body.featuredImage != null) doc.featuredImage = sanitize(body.featuredImage, 2000);
  if (body.imageAlt != null) doc.imageAlt = sanitize(body.imageAlt, 200);
  if (body.category != null) doc.category = sanitize(body.category, 60) || 'Marketing';
  if (body.author != null) doc.author = sanitize(body.author, 80) || 'Pirabel Labs';
  if (body.seoTitle != null) doc.seoTitle = sanitize(body.seoTitle, 200);
  if (body.metaDescription != null) doc.metaDescription = sanitize(body.metaDescription, 320);
  if (body.status != null && ['brouillon', 'publie'].includes(body.status)) doc.status = body.status;
}
app.post('/api/admin/articles', auth, adminOnly, limitBody(20), async (req, res) => {
  try {
    const title = sanitize(req.body.title || '', 200);
    if (!title || title.length < 3) return res.status(400).json({ error: 'Titre requis (3 caracteres min).' });
    const doc = new Article({ title });
    await applyArticleBody(req.body, doc);
    doc.slug = await uniqueSlug(req.body.slug || title);
    await doc.save();
    res.json({ success: true, article: doc });
  } catch (e) { console.error('[articles.create]', e.message); res.status(500).json({ error: 'Erreur lors de la création.' }); }
});
app.patch('/api/admin/articles/:id', auth, adminOnly, limitBody(20), async (req, res) => {
  try {
    const doc = await Article.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Article introuvable.' });
    await applyArticleBody(req.body, doc);
    if (req.body.slug && slugify(req.body.slug) !== doc.slug) doc.slug = await uniqueSlug(req.body.slug, doc._id);
    await doc.save();
    res.json({ success: true, article: doc });
  } catch (e) { console.error('[articles.update]', e.message); res.status(500).json({ error: 'Erreur de mise à jour.' }); }
});
app.delete('/api/admin/articles/:id', auth, adminOnly, async (req, res) => {
  try { await Article.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: 'Erreur suppression.' }); }
});

// ============ MAINTENANCE (backfill readTime + migration tâches) ============
app.post('/api/admin/maintenance/backfill', auth, adminOnly, async (req, res) => {
  try {
    let articlesFixed = 0;
    const arts = await Article.find({}).select('content readTime').lean();
    for (const a of arts) {
      const words = (a.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
      const rt = Math.max(1, Math.round(words / 200));
      if (rt !== a.readTime) { await Article.updateOne({ _id: a._id }, { $set: { readTime: rt } }); articlesFixed++; }
    }
    // Migration des anciens statuts/priorités de tâches vers le nouveau schéma
    const statusMap = { done: 'termine', completed: 'termine', todo: 'a_faire', 'to_do': 'a_faire', in_progress: 'en_cours', doing: 'en_cours', review: 'en_revue', in_review: 'en_revue', blocked: 'bloque' };
    const prioMap = { high: 'haute', urgent: 'urgente', medium: 'normale', normal: 'normale', low: 'basse' };
    let tasksFixed = 0;
    const tasks = await Task.collection.find({}).toArray();
    for (const t of tasks) {
      const set = {};
      if (statusMap[t.status]) set.status = statusMap[t.status];
      if (prioMap[t.priority]) set.priority = prioMap[t.priority];
      if (Object.keys(set).length) { await Task.collection.updateOne({ _id: t._id }, { $set: set }); tasksFixed++; }
    }
    // Rétro-attribution d'un jeton public aux RDV qui n'en ont pas (liens « gérer mon RDV »)
    let apptsFixed = 0;
    const apptsNoToken = await Appointment.find({ $or: [{ publicToken: { $exists: false } }, { publicToken: null }, { publicToken: '' }] }).select('_id').lean();
    for (const ap of apptsNoToken) {
      await Appointment.updateOne({ _id: ap._id }, { $set: { publicToken: crypto.randomBytes(24).toString('hex') } });
      apptsFixed++;
    }
    res.json({ success: true, articlesFixed, tasksFixed, apptsFixed, totalArticles: arts.length });
  } catch (e) { console.error('[backfill]', e.message); res.status(500).json({ error: 'Erreur backfill.', message: e.message }); }
});

// ============ STATS BLOG ============
app.get('/api/admin/blog-stats', auth, adminOnly, async (req, res) => {
  try {
    const [all, publie] = await Promise.all([
      Article.find({}).select('title slug category status views readTime publishedAt createdAt').lean(),
      Article.find({ status: 'publie' }).select('title slug category views readTime publishedAt').lean(),
    ]);
    // Top 10 articles par vues
    const top10 = [...publie].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10).map(a => ({
      title: a.title, slug: a.slug, views: a.views || 0, readTime: a.readTime || 0
    }));
    // Vues par catégorie
    const byCategory = {};
    publie.forEach(a => { const c = a.category || 'Marketing'; byCategory[c] = (byCategory[c] || 0) + (a.views || 0); });
    // Articles publiés par mois (12 derniers mois)
    const now = new Date(); const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), count: 0 });
    }
    publie.forEach(a => {
      if (!a.publishedAt) return;
      const d = new Date(a.publishedAt); const mIdx = (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - now.getMonth() + 11;
      if (mIdx >= 0 && mIdx < 12) months[mIdx].count++;
    });
    // Vues par mois (approximatif : répartition uniforme sur les publiés récents — sans tracking temporel granulaire)
    // Distribution par readTime
    const rtBuckets = { '1 min': 0, '2-3 min': 0, '4-5 min': 0, '6-10 min': 0, '+10 min': 0 };
    publie.forEach(a => {
      const rt = a.readTime || 1;
      if (rt <= 1) rtBuckets['1 min']++;
      else if (rt <= 3) rtBuckets['2-3 min']++;
      else if (rt <= 5) rtBuckets['4-5 min']++;
      else if (rt <= 10) rtBuckets['6-10 min']++;
      else rtBuckets['+10 min']++;
    });
    const totalViews = publie.reduce((s, a) => s + (a.views || 0), 0);
    const avgReadTime = publie.length ? Math.round(publie.reduce((s, a) => s + (a.readTime || 0), 0) / publie.length) : 0;
    res.json({
      kpi: { total: all.length, publie: publie.length, brouillon: all.filter(a => a.status === 'brouillon').length, totalViews, avgReadTime },
      top10, byCategory, publishedByMonth: months, readTimeDist: rtBuckets,
    });
  } catch (e) { console.error('[blog-stats]', e.message); res.status(500).json({ error: 'Erreur stats.' }); }
});

// ============ ÉQUIPE (employés) ============
// Liste des membres de l'équipe (admins + employés), jamais les clients.
app.get('/api/admin/team', auth, adminOnly, async (req, res) => {
  try {
    const team = await User.find({ role: { $in: ['admin', 'employee'] } })
      .select('name email role poste department phone hiredAt bio isActive lastLogin createdAt avatar')
      .sort({ role: 1, createdAt: 1 }).lean();
    // Charge de travail : tâches ouvertes par membre
    const openTasks = await Task.aggregate([
      { $match: { status: { $in: ['a_faire', 'en_cours', 'en_revue', 'bloque'] } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]);
    const loadMap = {}; openTasks.forEach(t => { if (t._id) loadMap[String(t._id)] = t.count; });
    team.forEach(m => { m.openTasks = loadMap[String(m._id)] || 0; });
    res.json({ team });
  } catch (e) { console.error('[team.list]', e.message); res.status(500).json({ error: 'Erreur chargement équipe.' }); }
});

// Créer un membre d'équipe (employé ou admin)
app.post('/api/admin/team', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const name = sanitize(req.body.name || '', 120);
    const email = sanitizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const role = ['admin', 'employee'].includes(req.body.role) ? req.body.role : 'employee';
    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom requis (2 caractères min).' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'E-mail invalide.' });
    if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (8 caractères min).' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Un compte existe déjà avec cet e-mail.' });
    const user = new User({
      name, email, password, role, isActive: true,
      poste: sanitize(req.body.poste || '', 100),
      department: sanitize(req.body.department || '', 60),
      phone: sanitize(req.body.phone || '', 30),
      bio: sanitize(req.body.bio || '', 1000),
      hiredAt: req.body.hiredAt ? new Date(req.body.hiredAt) : new Date(),
    });
    await user.save();
    const out = user.toObject(); delete out.password;
    res.json({ success: true, member: out });
  } catch (e) { console.error('[team.create]', e.message); res.status(500).json({ error: 'Erreur création membre.' }); }
});

// Modifier un membre (infos + rôle + activation + reset mot de passe)
app.patch('/api/admin/team/:id', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'client') return res.status(404).json({ error: 'Membre introuvable.' });
    if (req.body.name != null) user.name = sanitize(req.body.name, 120) || user.name;
    if (req.body.poste != null) user.poste = sanitize(req.body.poste, 100);
    if (req.body.department != null) user.department = sanitize(req.body.department, 60);
    if (req.body.phone != null) user.phone = sanitize(req.body.phone, 30);
    if (req.body.bio != null) user.bio = sanitize(req.body.bio, 1000);
    if (req.body.hiredAt != null) user.hiredAt = req.body.hiredAt ? new Date(req.body.hiredAt) : user.hiredAt;
    if (req.body.role != null && ['admin', 'employee'].includes(req.body.role)) user.role = req.body.role;
    if (typeof req.body.isActive === 'boolean') {
      // Empêcher de se désactiver soi-même
      if (String(user._id) === String(req.user._id) && !req.body.isActive) return res.status(400).json({ error: 'Vous ne pouvez pas désactiver votre propre compte.' });
      user.isActive = req.body.isActive;
    }
    if (req.body.password) {
      const pw = String(req.body.password);
      if (pw.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (8 caractères min).' });
      user.password = pw;
    }
    await user.save();
    const out = user.toObject(); delete out.password;
    res.json({ success: true, member: out });
  } catch (e) { console.error('[team.update]', e.message); res.status(500).json({ error: 'Erreur mise à jour.' }); }
});

// Supprimer un membre (jamais soi-même ; jamais le dernier admin)
app.delete('/api/admin/team/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'client') return res.status(404).json({ error: 'Membre introuvable.' });
    if (String(user._id) === String(req.user._id)) return res.status(400).json({ error: 'Vous ne pouvez pas vous supprimer vous-même.' });
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) return res.status(400).json({ error: 'Impossible de supprimer le dernier administrateur.' });
    }
    await User.findByIdAndDelete(req.params.id);
    // Détacher ses tâches plutôt que les perdre
    await Task.updateMany({ assignedTo: user._id }, { $set: { assignedTo: null, assignedToName: '(non assigné)' } });
    res.json({ success: true });
  } catch (e) { console.error('[team.delete]', e.message); res.status(500).json({ error: 'Erreur suppression.' }); }
});

// ============ TÂCHES ============
app.get('/api/admin/tasks', auth, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    const tasks = await Task.find(filter).sort({ status: 1, dueDate: 1, createdAt: -1 }).limit(500).lean();
    // Compteurs par statut (pour le tableau de bord kanban)
    const counts = await Task.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
    const countMap = {}; counts.forEach(c => { countMap[c._id] = c.n; });
    res.json({ tasks, counts: countMap });
  } catch (e) { console.error('[tasks.list]', e.message); res.status(500).json({ error: 'Erreur chargement tâches.' }); }
});

app.post('/api/admin/tasks', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const title = sanitize(req.body.title || '', 200);
    if (!title || title.length < 2) return res.status(400).json({ error: 'Titre requis.' });
    let assignedToName = '';
    if (req.body.assignedTo) {
      const u = await User.findById(req.body.assignedTo).select('name role').lean();
      if (u && u.role !== 'client') assignedToName = u.name;
    }
    const task = new Task({
      title,
      description: sanitize(req.body.description || '', 4000),
      assignedTo: req.body.assignedTo || null,
      assignedToName,
      createdBy: req.user._id,
      status: ['a_faire', 'en_cours', 'en_revue', 'termine', 'bloque'].includes(req.body.status) ? req.body.status : 'a_faire',
      priority: ['basse', 'normale', 'haute', 'urgente'].includes(req.body.priority) ? req.body.priority : 'normale',
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      relatedType: ['lead', 'quote', 'client', 'article', 'autre'].includes(req.body.relatedType) ? req.body.relatedType : '',
      relatedId: sanitize(req.body.relatedId || '', 100),
      relatedLabel: sanitize(req.body.relatedLabel || '', 200),
    });
    await task.save();
    res.json({ success: true, task });
  } catch (e) { console.error('[tasks.create]', e.message); res.status(500).json({ error: 'Erreur création tâche.' }); }
});

app.patch('/api/admin/tasks/:id', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tâche introuvable.' });
    if (req.body.title != null) task.title = sanitize(req.body.title, 200) || task.title;
    if (req.body.description != null) task.description = sanitize(req.body.description, 4000);
    if (req.body.status != null && ['a_faire', 'en_cours', 'en_revue', 'termine', 'bloque'].includes(req.body.status)) task.status = req.body.status;
    if (req.body.priority != null && ['basse', 'normale', 'haute', 'urgente'].includes(req.body.priority)) task.priority = req.body.priority;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : undefined;
    if (req.body.assignedTo !== undefined) {
      task.assignedTo = req.body.assignedTo || null;
      if (req.body.assignedTo) {
        const u = await User.findById(req.body.assignedTo).select('name role').lean();
        task.assignedToName = (u && u.role !== 'client') ? u.name : '';
      } else task.assignedToName = '(non assigné)';
    }
    await task.save();
    res.json({ success: true, task });
  } catch (e) { console.error('[tasks.update]', e.message); res.status(500).json({ error: 'Erreur mise à jour tâche.' }); }
});

app.delete('/api/admin/tasks/:id', auth, adminOnly, async (req, res) => {
  try { await Task.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: 'Erreur suppression tâche.' }); }
});

// ============ ASSISTANT IA (directeur commercial Pirabel Labs) ============
// Construit un instantané métier compact à injecter dans le contexte de Claude.
async function gatherBusinessContext() {
  try {
    const [leadCount, byStage, recentLeads, quotes, quoteByStatus, openTasks, team, articleCount] = await Promise.all([
      Lead.countDocuments({}),
      Lead.aggregate([{ $group: { _id: '$stage', n: { $sum: 1 } } }]),
      Lead.find({}).sort({ createdAt: -1 }).limit(8).select('name email company service stage createdAt phone').lean(),
      Quote.find({}).sort({ createdAt: -1 }).limit(8).select('reference clientName clientCompany total currency status validUntil createdAt').lean(),
      Quote.aggregate([{ $group: { _id: { s: '$status', c: '$currency' }, n: { $sum: 1 }, montant: { $sum: '$total' } } }]),
      Task.find({ status: { $in: ['a_faire', 'en_cours', 'en_revue', 'bloque'] } }).sort({ dueDate: 1 }).limit(15).select('title status priority dueDate assignedToName').lean(),
      User.find({ role: { $in: ['admin', 'employee'] }, isActive: true }).select('name role poste department').lean(),
      Article.countDocuments({ status: 'publie' }),
    ]);
    const stageMap = {}; byStage.forEach(s => { stageMap[s._id] = s.n; });
    // Montants ventilés par devise (jamais additionnés entre devises différentes).
    const quoteMap = {}; quoteByStatus.forEach(s => {
      const k = s._id.s, c = s._id.c || 'EUR';
      quoteMap[k] = quoteMap[k] || { nombre: 0, montant: {} };
      quoteMap[k].nombre += s.n; quoteMap[k].montant[c] = arrondiDevise(s.montant || 0, c);
    });
    return {
      date: new Date().toISOString().slice(0, 10),
      prospects: { total: leadCount, par_stade: stageMap, recents: recentLeads.map(l => ({ nom: l.name, entreprise: l.company || '', service: l.service || '', stade: l.stage, tel: l.phone || '', email: l.email, le: new Date(l.createdAt).toISOString().slice(0, 10) })) },
      devis: { par_statut: quoteMap, recents: quotes.map(q => ({ ref: q.reference, client: q.clientName, entreprise: q.clientCompany || '', montant: q.total, devise: q.currency, statut: statutDevisEffectif(q), valide_jusqu: q.validUntil ? new Date(q.validUntil).toISOString().slice(0, 10) : '' })) },
      taches_ouvertes: openTasks.map(t => ({ titre: t.title, statut: t.status, priorite: t.priority, echeance: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : '', assigne: t.assignedToName || '(non assigné)' })),
      equipe: team.map(u => ({ nom: u.name, role: u.role, poste: u.poste || '', pole: u.department || '' })),
      blog: { articles_publies: articleCount },
    };
  } catch (e) { console.error('[ai.context]', e.message); return { erreur: 'contexte indisponible' }; }
}

const AI_SYSTEM_PROMPTS = {
  redaction: "Tu es l'assistant de rédaction de Pirabel Labs, agence web et marketing digital basée à Abomey-Calavi (Bénin), dirigée par Lissanon Gildas (CEO). Tu rédiges en français impeccable (accents sur les majuscules, ç, œ, guillemets « », espaces insécables avant : ; ! ?). Tu écris des e-mails de prospection, réponses clients, propositions, posts réseaux sociaux et contenus selon les consignes. Ton professionnel, chaleureux et orienté résultat. Ne jamais inventer de chiffres ni de références. Ne jamais mentionner d'autre dirigeant que Lissanon Gildas, CEO. Les articles du blog sont signés par l’agence : ne les signe jamais au nom d’une personne et n’ajoute pas d’encadré auteur.",
  analyse: "Tu es le directeur commercial de Pirabel Labs (agence web/marketing à Abomey-Calavi, Bénin, dirigée par Lissanon Gildas, CEO). Tu analyses le pipeline commercial réel fourni dans le contexte (prospects, devis, tâches) et donnes des recommandations concrètes, priorisées et actionnables : qui relancer en priorité, quels devis suivre, risques, opportunités, plan de la semaine. Sois direct, chiffré quand les données le permettent, et ne jamais inventer de données absentes du contexte. Français impeccable.",
  equipe: "Tu es le bras droit RH et opérationnel du dirigeant de Pirabel Labs (Lissanon Gildas), agence web/marketing à Abomey-Calavi (Bénin). Tu aides à répartir les tâches entre les employés selon leur pôle et leur charge actuelle, à rédiger des consignes claires, des comptes-rendus et des objectifs. Tu t'appuies sur la liste d'équipe et les tâches ouvertes du contexte. Pragmatique, bienveillant, structuré. Français impeccable.",
  libre: "Tu es l'assistant IA de Pirabel Labs, agence web et marketing digital à Abomey-Calavi (Bénin), dirigée par Lissanon Gildas (CEO). Tu réponds à toute question business, marketing, SEO, technique ou stratégique pour aider à développer l'agence. Précis, honnête, jamais d'invention de chiffres. Français impeccable. Tu peux t'appuyer sur les données réelles de l'entreprise fournies dans le contexte.",
};

// Outils que l'assistant peut EXÉCUTER réellement (lecture + écriture interne, réversible).
const ASSISTANT_TOOLS = [
  { name: 'creer_tache', description: "Créer une nouvelle tâche interne et l'assigner éventuellement à un employé. Utilise-le quand l'utilisateur demande d'organiser, planifier ou confier du travail.", input_schema: { type: 'object', properties: {
    title: { type: 'string', description: 'Titre court et clair de la tâche' },
    description: { type: 'string', description: 'Détails / consignes (optionnel)' },
    assignedToEmail: { type: 'string', description: "E-mail de l'employé à qui assigner (optionnel, doit exister dans l'équipe)" },
    priority: { type: 'string', enum: ['basse', 'normale', 'haute', 'urgente'] },
    dueDate: { type: 'string', description: 'Échéance au format AAAA-MM-JJ (optionnel)' },
  }, required: ['title'] } },
  { name: 'modifier_tache', description: 'Modifier une tâche existante (statut, priorité, assignation, titre). Utilise lister_taches d\'abord pour obtenir les IDs.', input_schema: { type: 'object', properties: {
    taskId: { type: 'string' }, status: { type: 'string', enum: ['a_faire', 'en_cours', 'en_revue', 'termine', 'bloque'] },
    priority: { type: 'string', enum: ['basse', 'normale', 'haute', 'urgente'] }, assignedToEmail: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' },
  }, required: ['taskId'] } },
  { name: 'lister_taches', description: 'Lister les tâches existantes avec leurs IDs, statuts et assignés. Filtrer par statut optionnel.', input_schema: { type: 'object', properties: { status: { type: 'string', enum: ['a_faire', 'en_cours', 'en_revue', 'termine', 'bloque'] } } } },
  { name: 'lister_equipe', description: 'Lister les membres de l\'équipe (nom, e-mail, poste, pôle, charge de tâches ouvertes).', input_schema: { type: 'object', properties: {} } },
  { name: 'rechercher_prospects', description: "Rechercher des prospects/leads par stade ou par texte (nom, entreprise, e-mail). Pour préparer des relances.", input_schema: { type: 'object', properties: {
    stage: { type: 'string', enum: ['prospect', 'qualifie', 'devis_envoye', 'client', 'inactif'] }, query: { type: 'string', description: 'Texte recherché (optionnel)' },
  } } },
  { name: 'lister_devis', description: 'Lister les devis, filtrables par statut (brouillon, envoye, consulte, accepte, refuse, expire).', input_schema: { type: 'object', properties: { status: { type: 'string' } } } },
  { name: 'creer_brouillon_article', description: "Créer un brouillon d'article de blog COMPLET (reste en brouillon pour relecture). N'appelle cet outil qu'une fois l'article entièrement rédigé.", input_schema: { type: 'object', properties: {
    title: { type: 'string' }, category: { type: 'string', description: 'Ex: Marketing, SEO, IA, Web, Agence' }, excerpt: { type: 'string', description: 'Résumé court (chapô), 1 à 2 phrases réelles' },
    content: { type: 'string', description: "Contenu HTML COMPLET et fini de l'article, 900 mots minimum. Structure obligatoire : <p> d'introduction, plusieurs <h2> avec attribut id, des <h3>, des <ul>/<ol>, un <table> si une comparaison s'y prête, puis une conclusion avec appel à l'action. INTERDIT : placeholders (Agence XYZ, ABC, Lorem ipsum, [à compléter]) et sections vides. Français impeccable." },
  }, required: ['title', 'content'] } },
  { name: 'lister_articles', description: "Lister les articles de blog existants (titre, statut, catégorie) pour éviter les doublons de sujet avant d'en rédiger un nouveau.", input_schema: { type: 'object', properties: { status: { type: 'string', enum: ['brouillon', 'publie'] } } } },
  { name: 'creer_devis', description: "Créer un DEVIS en brouillon pour un prospect/client existant. Le devis n'est jamais envoyé automatiquement : il attend la validation du dirigeant. Utilise rechercher_prospects avant pour obtenir l'e-mail exact du client.", input_schema: { type: 'object', properties: {
    clientEmail: { type: 'string', description: "E-mail exact du prospect/client (doit déjà exister dans le CRM)" },
    title: { type: 'string', description: 'Intitulé du devis, ex : « Création site vitrine + SEO local »' },
    introduction: { type: 'string', description: 'Phrase de contexte affichée en tête du devis (optionnel)' },
    items: { type: 'array', description: 'Lignes du devis', items: { type: 'object', properties: {
      description: { type: 'string' }, quantity: { type: 'number' }, unitPrice: { type: 'number' },
    }, required: ['description', 'unitPrice'] } },
    currency: { type: 'string', enum: ['EUR', 'USD', 'CAD', 'XOF', 'XAF', 'MAD', 'TND', 'GNF', 'CHF'] },
    taxRate: { type: 'number', description: 'Taux de TVA en %, 0 si non applicable' },
    terms: { type: 'string', description: 'Conditions de règlement (optionnel)' },
  }, required: ['clientEmail', 'title', 'items'] } },
  { name: 'creer_facture', description: "Créer une FACTURE en brouillon pour un client existant. Jamais envoyée automatiquement : elle attend la validation du dirigeant.", input_schema: { type: 'object', properties: {
    clientEmail: { type: 'string', description: "E-mail exact du client (doit exister dans le CRM)" },
    title: { type: 'string' },
    introduction: { type: 'string' },
    items: { type: 'array', items: { type: 'object', properties: {
      description: { type: 'string' }, quantity: { type: 'number' }, unitPrice: { type: 'number' },
    }, required: ['description', 'unitPrice'] } },
    currency: { type: 'string', enum: ['EUR', 'USD', 'CAD', 'XOF', 'XAF', 'MAD', 'TND', 'GNF', 'CHF'] },
    taxRate: { type: 'number' },
    dueDays: { type: 'number', description: "Délai de règlement en jours (15 par défaut)" },
  }, required: ['clientEmail', 'title', 'items'] } },
  { name: 'lister_factures', description: 'Lister les factures avec leur statut de règlement (brouillon, envoyee, consultee, partiellement_payee, payee, en_retard, annulee), le montant déjà payé et le reste à payer.', input_schema: { type: 'object', properties: { status: { type: 'string' } } } },
  { name: 'stats_revenus', description: "Obtenir la synthèse financière réelle : chiffre d'affaires encaissé, montants en attente de règlement, pipeline des devis, taux de conversion, factures en retard.", input_schema: { type: 'object', properties: {} } },
  { name: 'enregistrer_prospect', description: "Enregistrer un nouveau prospect dans le CRM (ou compléter une fiche existante repérée par son e-mail). À utiliser dès qu'un visiteur du site laisse son contact.", input_schema: { type: 'object', properties: {
    name: { type: 'string', description: "Nom du prospect EXACTEMENT tel qu'il l'a écrit, sans rien ajouter, corriger ni inventer. S'il n'a donné qu'un prénom, n'enregistre que ce prénom." },
    email: { type: 'string' },
    phone: { type: 'string', description: 'Téléphone ou WhatsApp (optionnel)' },
    company: { type: 'string', description: 'Entreprise (optionnel)' },
    service: { type: 'string', description: "Service qui l'intéresse (site web, SEO, IA, tunnel de vente...)" },
    message: { type: 'string', description: "Résumé du besoin exprimé, en une ou deux phrases fidèles à ce qu'a dit le visiteur" },
  }, required: ['name', 'email'] } },
  { name: 'creer_rendez_vous', description: "Enregistrer une demande de rendez-vous de cadrage. À n'appeler qu'une fois que le visiteur a donné son nom, son e-mail, un créneau souhaité et le motif.", input_schema: { type: 'object', properties: {
    name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' },
    preferredDate: { type: 'string', description: 'Date souhaitée au format AAAA-MM-JJ' },
    preferredTime: { type: 'string', description: 'Heure souhaitée, ex : 15:00' },
    channel: { type: 'string', enum: ['visio', 'telephone', 'whatsapp', 'presentiel'] },
    reason: { type: 'string', description: 'Motif du rendez-vous, fidèle au besoin exprimé' },
  }, required: ['name', 'email', 'reason'] } },
  { name: 'lister_rendez_vous', description: 'Lister les rendez-vous avec leur statut, date, heure et canal. Utilise-le avant toute modification pour obtenir les références exactes.', input_schema: { type: 'object', properties: { status: { type: 'string', enum: ['demande', 'confirme', 'effectue', 'annule', 'no_show'] } } } },

  // ---- Outils SENSIBLES : jamais exécutés directement, toujours soumis à confirmation ----
  { name: 'envoyer_devis', description: "Envoyer un devis au client par e-mail. ACTION SORTANTE : elle sera soumise à la confirmation du dirigeant avant tout envoi réel.", input_schema: { type: 'object', properties: {
    reference: { type: 'string', description: 'Référence du devis, ex : DEVIS-2026-1234' } }, required: ['reference'] } },
  { name: 'envoyer_facture', description: "Envoyer une facture au client par e-mail. ACTION SORTANTE : soumise à confirmation avant envoi réel.", input_schema: { type: 'object', properties: {
    reference: { type: 'string', description: 'Référence de la facture, ex : FACT-2026-1234' } }, required: ['reference'] } },
  { name: 'envoyer_email', description: "Envoyer un e-mail rédigé à un prospect ou client. ACTION SORTANTE : soumise à confirmation. Rédige un message complet, personnalisé et prêt à partir (sans formule d'appel, elle est ajoutée automatiquement).", input_schema: { type: 'object', properties: {
    email: { type: 'string', description: "E-mail du destinataire (doit exister dans le CRM)" },
    subject: { type: 'string' },
    message: { type: 'string', description: "Corps du message en texte simple, paragraphes séparés par une ligne vide. Ne commence pas par « Bonjour X », c'est ajouté automatiquement." },
  }, required: ['email', 'subject', 'message'] } },
  { name: 'supprimer_devis', description: "Supprimer définitivement un devis (erreur de saisie, doublon). ACTION IRRÉVERSIBLE : soumise à confirmation.", input_schema: { type: 'object', properties: {
    reference: { type: 'string' }, raison: { type: 'string', description: 'Pourquoi ce devis doit être supprimé' } }, required: ['reference'] } },
  { name: 'supprimer_facture', description: "Supprimer définitivement une facture (erreur, doublon). ACTION IRRÉVERSIBLE : soumise à confirmation. Le lien public déjà transmis au client cessera de fonctionner.", input_schema: { type: 'object', properties: {
    reference: { type: 'string' }, raison: { type: 'string' } }, required: ['reference'] } },
  { name: 'marquer_facture_payee', description: "Marquer une facture comme réglée. Soumis à confirmation.", input_schema: { type: 'object', properties: {
    reference: { type: 'string' }, paymentMethod: { type: 'string', description: 'Moyen de paiement : virement, Mobile Money, espèces…' } }, required: ['reference'] } },
  { name: 'modifier_rendez_vous', description: "Confirmer, déplacer ou annuler un rendez-vous. Soumis à confirmation. Utilise lister_rendez_vous d'abord pour obtenir l'identifiant.", input_schema: { type: 'object', properties: {
    rdvId: { type: 'string', description: "Identifiant du rendez-vous obtenu via lister_rendez_vous" },
    action: { type: 'string', enum: ['confirmer', 'deplacer', 'annuler'] },
    preferredDate: { type: 'string', description: 'Nouvelle date AAAA-MM-JJ (pour un déplacement)' },
    preferredTime: { type: 'string', description: 'Nouvelle heure, ex : 15:00' },
    raison: { type: 'string', description: 'Motif communiqué au client' },
  }, required: ['rdvId', 'action'] } },
  { name: 'publier_article', description: "Publier un article de blog actuellement en brouillon. ACTION PUBLIQUE : soumise à confirmation.", input_schema: { type: 'object', properties: {
    slug: { type: 'string', description: "Slug de l'article, obtenu via lister_articles" } }, required: ['slug'] } },
  { name: 'supprimer_rendez_vous', description: "Supprimer DÉFINITIVEMENT un rendez-vous de la base (doublon, test, erreur de saisie). Différent d'une annulation : ici la trace disparaît et le client n'est pas prévenu. Pour annuler un vrai rendez-vous en prévenant le client, utilise plutôt modifier_rendez_vous avec action='annuler'. ACTION IRRÉVERSIBLE : soumise à confirmation.", input_schema: { type: 'object', properties: {
    rdvId: { type: 'string', description: 'Identifiant obtenu via lister_rendez_vous' },
    raison: { type: 'string', description: 'Pourquoi cette suppression' } }, required: ['rdvId'] } },
  { name: 'supprimer_prospect', description: "Supprimer DÉFINITIVEMENT une fiche prospect du CRM (doublon, test, données erronées). Refusé si la fiche est rattachée à un devis ou une facture. ACTION IRRÉVERSIBLE : soumise à confirmation.", input_schema: { type: 'object', properties: {
    email: { type: 'string', description: 'E-mail exact de la fiche à supprimer' },
    raison: { type: 'string' } }, required: ['email'] } },
  { name: 'creer_projet', description: "Créer un projet client visible dans son espace, avec ses étapes de suivi. Utilise-le dès qu'un devis est accepté ou qu'une mission démarre. Propose des étapes réalistes et propres au service vendu.", input_schema: { type: 'object', properties: {
    clientEmail: { type: 'string', description: "E-mail du client (doit exister dans le CRM)" },
    title: { type: 'string', description: 'Intitulé du projet, ex : « Refonte du site vitrine »' },
    description: { type: 'string', description: "Résumé du périmètre, visible par le client" },
    service: { type: 'string', description: 'Type de prestation : site web, SEO, automatisation…' },
    dueDate: { type: 'string', description: 'Date de livraison prévue au format AAAA-MM-JJ' },
    steps: { type: 'array', description: "Étapes de suivi dans l'ordre chronologique", items: { type: 'object', properties: {
      label: { type: 'string', description: "Nom de l'étape, ex : « Maquettes validées »" },
      description: { type: 'string' },
      status: { type: 'string', enum: ['a_venir', 'en_cours', 'termine', 'bloque'] },
    }, required: ['label'] } },
  }, required: ['clientEmail', 'title'] } },
  { name: 'lister_projets', description: "Lister les projets clients avec leur avancement et leurs étapes. Utilise-le avant toute modification pour obtenir les identifiants.", input_schema: { type: 'object', properties: {
    status: { type: 'string', enum: ['cadrage', 'en_cours', 'en_revue', 'livre', 'suspendu'] } } } },
  { name: 'modifier_projet', description: "Faire avancer un projet : changer son statut, marquer une étape comme terminée ou en cours, renseigner les liens d'aperçu et de mise en ligne. Le client voit le changement immédiatement dans son espace.", input_schema: { type: 'object', properties: {
    projetId: { type: 'string', description: 'Identifiant obtenu via lister_projets' },
    status: { type: 'string', enum: ['cadrage', 'en_cours', 'en_revue', 'livre', 'suspendu'] },
    etapeIndex: { type: 'number', description: "Position de l'étape à modifier (0 pour la première)" },
    etapeStatus: { type: 'string', enum: ['a_venir', 'en_cours', 'termine', 'bloque'] },
    ajouterEtape: { type: 'string', description: "Libellé d'une nouvelle étape à ajouter à la fin" },
    previewUrl: { type: 'string' }, liveUrl: { type: 'string' },
    dueDate: { type: 'string', description: 'Nouvelle échéance AAAA-MM-JJ' },
  }, required: ['projetId'] } },
  { name: 'ouvrir_espace_client', description: "Activer l'accès à l'espace client pour un contact et lui envoyer son lien de connexion. ACTION SORTANTE : soumise à confirmation.", input_schema: { type: 'object', properties: {
    email: { type: 'string', description: 'E-mail du client' } }, required: ['email'] } },
  { name: 'bilan_comptable', description: "Obtenir la synthèse comptable complète : chiffre d'affaires encaissé, charges, résultat, marge, créances à recouvrer, pipeline des devis acceptés, répartition des charges par poste et évolution sur 12 mois. Utilise-le pour toute question sur la santé financière.", input_schema: { type: 'object', properties: {
    periode: { type: 'string', description: "Période au format AAAA-MM pour un mois, AAAA pour une année, ou vide pour tout l'historique" } } } },
  { name: 'enregistrer_depense', description: "Enregistrer une charge dans la comptabilité (abonnement, sous-traitance, hébergement, matériel…). Indispensable pour que le résultat soit juste : sans charges, seul le chiffre d'affaires est connu.", input_schema: { type: 'object', properties: {
    label: { type: 'string', description: 'Libellé de la dépense' },
    amount: { type: 'number', description: 'Montant' },
    category: { type: 'string', enum: ['outils', 'sous_traitance', 'salaires', 'marketing', 'hebergement', 'materiel', 'deplacement', 'banque', 'impots', 'autre'] },
    currency: { type: 'string', enum: ['EUR', 'USD', 'CAD', 'XOF', 'XAF', 'MAD', 'TND', 'GNF', 'CHF'] },
    supplier: { type: 'string', description: 'Fournisseur (optionnel)' },
    recurring: { type: 'boolean', description: 'Vrai si la charge revient chaque mois' },
    date: { type: 'string', description: "Date de l'opération au format AAAA-MM-JJ (aujourd'hui par défaut)" },
  }, required: ['label', 'amount'] } },
  { name: 'requalifier_factures_en_retard', description: "Passer automatiquement au statut « en_retard » toutes les factures envoyées, consultées ou partiellement payées dont la date d'échéance est dépassée. Fais-le toi-même au lieu de conseiller une vérification manuelle. Action interne et réversible : exécutée immédiatement.", input_schema: { type: 'object', properties: {} } },
  { name: 'relancer_facture', description: "Préparer et envoyer une relance de paiement au client pour une facture impayée. Rédige toi-même un message courtois et ferme, adapté au retard. ACTION SORTANTE : soumise à confirmation.", input_schema: { type: 'object', properties: {
    reference: { type: 'string', description: 'Référence de la facture, ex : FACT-2026-1234' },
    message: { type: 'string', description: "Corps de la relance en texte simple. Ne commence pas par « Bonjour X », c'est ajouté automatiquement." },
  }, required: ['reference', 'message'] } },
];

// Outils dont l'exécution est IRRÉVERSIBLE ou SORTANTE (vers un client / le public).
// Ils ne sont jamais exécutés directement par l'agent : ils passent par une confirmation.
const SENSITIVE_TOOLS = new Set([
  'envoyer_devis', 'envoyer_facture', 'envoyer_email',
  'supprimer_devis', 'supprimer_facture', 'marquer_facture_payee',
  'modifier_rendez_vous', 'publier_article',
  'supprimer_rendez_vous', 'supprimer_prospect', 'relancer_facture', 'ouvrir_espace_client',
]);
// Parmi elles, celles qui détruisent une donnée ou partent vers l'extérieur sans retour possible.
const HIGH_RISK_TOOLS = new Set(['supprimer_devis', 'supprimer_facture', 'envoyer_devis', 'envoyer_facture', 'envoyer_email', 'publier_article',
  'supprimer_rendez_vous', 'supprimer_prospect']);

// Consigne au journal des e-mails un envoi effectue par un agent. Sans cela, les
// messages partis par Ayaba n'apparaissaient nulle part dans l'administration.
async function journaliserEmail({ to, toName, subject, body, ok, leadId, agent }) {
  try {
    await SentEmail.create({
      type: 'individuel', to: String(to || '').slice(0, 200), toName: String(toName || '').slice(0, 120),
      subject: String(subject || '').slice(0, 300), body: String(body || '').slice(0, 20000),
      status: ok ? 'envoye' : 'echec', sentCount: ok ? 1 : 0, failedCount: ok ? 0 : 1,
      leadId: leadId || undefined,
      sentByName: 'Ayaba' + (agent ? ' · ' + agent : ''),
    });
  } catch (e) { console.error('[journal.email]', e.message); }
}

// Résumé lisible d'une action sensible, affiché sur la carte de confirmation.
function summarizeAction(name, input) {
  const r = input.reference || input.slug || '';
  switch (name) {
    case 'envoyer_devis': return `Envoyer le devis ${r} au client par e-mail`;
    case 'envoyer_facture': return `Envoyer la facture ${r} au client par e-mail`;
    case 'envoyer_email': return `Envoyer un e-mail à ${input.email} — objet : « ${String(input.subject || '').slice(0, 90)} »`;
    case 'supprimer_devis': return `SUPPRIMER définitivement le devis ${r}${input.raison ? ' — ' + input.raison : ''}`;
    case 'supprimer_facture': return `SUPPRIMER définitivement la facture ${r}${input.raison ? ' — ' + input.raison : ''}`;
    case 'marquer_facture_payee': return `Marquer la facture ${r} comme réglée${input.paymentMethod ? ' (' + input.paymentMethod + ')' : ''}`;
    case 'modifier_rendez_vous': return `Rendez-vous : ${input.action}${input.preferredDate ? ' au ' + input.preferredDate + ' ' + (input.preferredTime || '') : ''}`;
    case 'publier_article': return `PUBLIER l'article « ${r} » sur le blog (visible par tous)`;
    case 'supprimer_rendez_vous': return `SUPPRIMER définitivement un rendez-vous${input.raison ? ' — ' + input.raison : ''}`;
    case 'supprimer_prospect': return `SUPPRIMER définitivement la fiche ${input.email} du CRM${input.raison ? ' — ' + input.raison : ''}`;
    case 'relancer_facture': return `Envoyer une relance de paiement pour la facture ${r}`;
    case 'ouvrir_espace_client': return `Ouvrir l'espace client à ${input.email} et lui envoyer son lien de connexion`;
    default: return name;
  }
}

// `opts.allowSensitive` n'est vrai que lors d'une exécution confirmée par l'utilisateur.
async function executeAssistantTool(name, input, currentUser, opts) {
  opts = opts || {};
  try {
    // Interception : une action sensible est mise en attente au lieu d'être exécutée.
    if (SENSITIVE_TOOLS.has(name) && !opts.allowSensitive) {
      const pa = await PendingAction.create({
        userId: currentUser && currentUser._id ? currentUser._id : undefined,
        conversationId: opts.conversationId || undefined,
        agent: opts.agentId || '', tool: name, input: input || {},
        summary: summarizeAction(name, input || {}),
        risk: HIGH_RISK_TOOLS.has(name) ? 'eleve' : 'normal',
      });
      return { ok: true, pending: true, actionId: String(pa._id), summary: pa.summary,
        message: `Action préparée et EN ATTENTE de confirmation : ${pa.summary}. Explique à l'utilisateur ce que tu as préparé et invite-le à valider via le bouton de confirmation affiché.` };
    }
    if (name === 'creer_tache') {
      let assignedTo = null, assignedToName = '';
      if (input.assignedToEmail) {
        const u = await User.findOne({ email: sanitizeEmail(input.assignedToEmail), role: { $in: ['admin', 'employee'] } }).select('name').lean();
        if (u) { assignedTo = u._id; assignedToName = u.name; } else return { ok: false, message: `Aucun employé avec l'e-mail ${input.assignedToEmail}. Utilise lister_equipe pour voir les e-mails valides.` };
      }
      const t = new Task({ title: sanitize(input.title, 200), description: sanitize(input.description || '', 4000), assignedTo, assignedToName, createdBy: currentUser._id,
        priority: ['basse', 'normale', 'haute', 'urgente'].includes(input.priority) ? input.priority : 'normale', dueDate: input.dueDate ? new Date(input.dueDate) : undefined });
      await t.save();
      return { ok: true, message: `Tâche créée : « ${t.title} »${assignedToName ? ' → ' + assignedToName : ''}`, taskId: String(t._id) };
    }
    if (name === 'modifier_tache') {
      const t = await Task.findById(input.taskId); if (!t) return { ok: false, message: 'Tâche introuvable.' };
      if (input.status) t.status = input.status; if (input.priority) t.priority = input.priority;
      if (input.title) t.title = sanitize(input.title, 200); if (input.description != null) t.description = sanitize(input.description, 4000);
      if (input.assignedToEmail) { const u = await User.findOne({ email: sanitizeEmail(input.assignedToEmail) }).select('name').lean(); if (u) { t.assignedTo = u._id; t.assignedToName = u.name; } }
      await t.save();
      return { ok: true, message: `Tâche mise à jour : « ${t.title} » (statut: ${t.status})` };
    }
    if (name === 'lister_taches') {
      const f = {}; if (input.status) f.status = input.status;
      const tasks = await Task.find(f).sort({ dueDate: 1 }).limit(100).select('title status priority dueDate assignedToName').lean();
      return { ok: true, tasks: tasks.map(t => ({ id: String(t._id), titre: t.title, statut: t.status, priorite: t.priority, echeance: t.dueDate ? new Date(t.dueDate).toISOString().slice(0,10) : null, assigne: t.assignedToName || null })) };
    }
    if (name === 'lister_equipe') {
      const team = await User.find({ role: { $in: ['admin', 'employee'] }, isActive: true }).select('name email poste department role').lean();
      const load = await Task.aggregate([{ $match: { status: { $in: ['a_faire', 'en_cours', 'en_revue', 'bloque'] } } }, { $group: { _id: '$assignedTo', n: { $sum: 1 } } }]);
      const lm = {}; load.forEach(l => { if (l._id) lm[String(l._id)] = l.n; });
      return { ok: true, equipe: team.map(u => ({ nom: u.name, email: u.email, poste: u.poste || '', pole: u.department || '', role: u.role, taches_ouvertes: lm[String(u._id)] || 0 })) };
    }
    if (name === 'rechercher_prospects') {
      const f = {}; if (input.stage) f.stage = input.stage;
      if (input.query) { const rx = new RegExp(String(input.query).slice(0, 60).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); f.$or = [{ name: rx }, { company: rx }, { email: rx }]; }
      const leads = await Lead.find(f).sort({ createdAt: -1 }).limit(40).select('name email phone company service stage createdAt').lean();
      return { ok: true, prospects: leads.map(l => ({ nom: l.name, email: l.email, tel: l.phone || '', entreprise: l.company || '', service: l.service || '', stade: l.stage, le: new Date(l.createdAt).toISOString().slice(0,10) })) };
    }
    if (name === 'lister_devis') {
      const f = {}; if (input.status && input.status !== 'expire') f.status = input.status;
      const quotes = (await Quote.find(f).sort({ createdAt: -1 }).limit(input.status ? 200 : 40).select('reference clientName clientCompany total currency status validUntil').lean())
        .filter(q => !input.status || statutDevisEffectif(q) === input.status).slice(0, 40);
      return { ok: true, devis: quotes.map(q => ({ ref: q.reference, client: q.clientName, entreprise: q.clientCompany || '', montant: q.total, devise: q.currency, montant_formate: moneyFmt(q.total, q.currency), statut: statutDevisEffectif(q), valide_jusqu: q.validUntil ? new Date(q.validUntil).toISOString().slice(0,10) : null })) };
    }
    if (name === 'creer_brouillon_article') {
      const doc = new Article({ title: sanitize(input.title, 200), excerpt: sanitize(input.excerpt || '', 500), content: sanitizeSoft(input.content || '', 100000),
        category: sanitize(input.category || 'Marketing', 60) || 'Marketing', author: BLOG_TEAM, status: 'brouillon' });
      doc.slug = await uniqueSlug(input.title);
      await doc.save();
      return { ok: true, message: `Brouillon créé : « ${doc.title} » (catégorie ${doc.category}). Relis-le dans l'onglet Blog avant publication.`, slug: doc.slug };
    }
    if (name === 'lister_articles') {
      const f = {}; if (['brouillon', 'publie'].includes(input.status)) f.status = input.status;
      const arts = await Article.find(f).sort({ createdAt: -1 }).limit(60).select('title slug status category createdAt').lean();
      return { ok: true, articles: arts.map(a => ({ titre: a.title, slug: a.slug, statut: a.status, categorie: a.category || '', le: new Date(a.createdAt).toISOString().slice(0, 10) })) };
    }
    if (name === 'creer_devis' || name === 'creer_facture') {
      const isQuote = name === 'creer_devis';
      const lead = await Lead.findOne({ email: sanitizeEmail(input.clientEmail || '') });
      if (!lead) return { ok: false, message: `Aucun prospect avec l'e-mail ${input.clientEmail}. Utilise rechercher_prospects pour trouver le bon e-mail, ou enregistrer_prospect pour le créer d'abord.` };
      const rawItems = Array.isArray(input.items) ? input.items.filter(i => i && i.description && Number(i.unitPrice) >= 0) : [];
      if (!rawItems.length) return { ok: false, message: 'Au moins une ligne complète (description + prix unitaire) est requise.' };
      const errV = validerChampsDocument({ taxRate: input.taxRate, currency: input.currency });
      if (errV) return { ok: false, message: errV };
      const taxRate = pctOu(input.taxRate, 0);
      const currency = DEVISES.includes(input.currency) ? input.currency : 'EUR';
      const totals = recalcQuote(rawItems, taxRate, currency, 0);
      const common = {
        leadId: lead._id, clientName: lead.name, clientEmail: lead.email,
        clientCompany: lead.company || '', clientPhone: lead.phone || '', clientAddress: lead.clientData?.address || '',
        items: totals.items, subtotal: totals.subtotal, taxRate, taxAmount: totals.taxAmount, total: totals.total,
        currency, title: sanitize(input.title, 200), introduction: sanitize(input.introduction || '', 2000),
        terms: sanitize(input.terms || '', 5000), publicToken: generateToken(), createdBy: currentUser._id, status: 'brouillon',
      };
      if (isQuote) {
        const q = await creerAvecReference(Quote, 'DEVIS', Object.assign({}, common, {
          validUntil: new Date(Date.now() + 30 * 86400000),
        }));
        return { ok: true, message: `Devis ${q.reference} créé EN BROUILLON pour ${q.clientName} — ${moneyFmt(q.total, q.currency)}. Il attend ta validation dans l'onglet Devis avant tout envoi.`, reference: q.reference, total: q.total, devise: q.currency };
      }
      const inv = await creerAvecReference(Invoice, 'FACT', Object.assign({}, common, {
        issuerBrand: 'Pirabel Labs',
        dueDate: new Date(Date.now() + (Number(input.dueDays) || 15) * 86400000),
      }));
      return { ok: true, message: `Facture ${inv.reference} créée EN BROUILLON pour ${inv.clientName} — ${moneyFmt(inv.total, inv.currency)}. Elle attend ta validation dans l'onglet Factures avant tout envoi.`, reference: inv.reference, total: inv.total, devise: inv.currency };
    }
    if (name === 'lister_factures') {
      const f = {}; if (input.status && input.status !== 'en_retard') f.status = input.status;
      const list = (await Invoice.find(f).sort({ createdAt: -1 }).limit(input.status ? 200 : 40).select('reference clientName total currency status dueDate payments paidAt paymentMethod updatedAt issuedAt').lean())
        .filter(i => !input.status || Invoice.effectiveStatus(i) === input.status).slice(0, 40);
      return { ok: true, factures: list.map(i => ({ ref: i.reference, client: i.clientName, montant: i.total, devise: i.currency, paye: Invoice.amountPaidOf(i), reste: Invoice.balanceOf(i), statut: Invoice.effectiveStatus(i), echeance: i.dueDate ? new Date(i.dueDate).toISOString().slice(0, 10) : null })) };
    }
    if (name === 'stats_revenus') {
      const [quotesAll, invoicesAll, leadCount, clientCount] = await Promise.all([
        Quote.find({}).select('status currency total validUntil').lean(),
        Invoice.find({}).select('status currency total dueDate payments paidAt paymentMethod updatedAt issuedAt').lean(),
        Lead.countDocuments({}),
        Lead.countDocuments({ stage: 'client' }),
      ]);
      const now = new Date();
      // Tout est ventilé par devise : on n'additionne jamais des devises différentes.
      const qm = {}; quotesAll.forEach(q => {
        const k = statutDevisEffectif(q, now); qm[k] = qm[k] || { nombre: 0, montant: {} };
        qm[k].nombre++; qm[k].montant[q.currency] = arrondiDevise((qm[k].montant[q.currency] || 0) + (q.total || 0), q.currency);
      });
      const im = {}, encaisse = {}, enAttente = {};
      let enRetard = 0;
      invoicesAll.forEach(i => {
        const k = Invoice.effectiveStatus(i, now), c = i.currency || 'EUR';
        im[k] = im[k] || { nombre: 0, montant: {} };
        im[k].nombre++; im[k].montant[c] = arrondiDevise((im[k].montant[c] || 0) + (i.total || 0), c);
        if (k === 'annulee') return;
        encaisse[c] = arrondiDevise((encaisse[c] || 0) + Invoice.amountPaidOf(i), c);
        if (k !== 'brouillon') enAttente[c] = arrondiDevise((enAttente[c] || 0) + Invoice.balanceOf(i), c);
        if (k === 'en_retard') enRetard++;
      });
      const devisBase = quotesAll.length - ((qm.brouillon && qm.brouillon.nombre) || 0) - ((qm.annule && qm.annule.nombre) || 0);
      const devisAcceptes = (qm.accepte && qm.accepte.nombre) || 0;
      return { ok: true, revenus: {
        encaisse_par_devise: encaisse,
        en_attente_de_reglement_par_devise: enAttente,
        factures_par_statut: im,
        devis_par_statut: qm,
        taux_acceptation_devis_pct: devisBase > 0 ? Math.round((devisAcceptes / devisBase) * 100) : 0,
        factures_echues_non_payees: enRetard,
        prospects_total: leadCount,
        clients: clientCount,
        note: 'Encaissé = paiements réellement reçus (acomptes compris). Montants ventilés par devise : ne jamais additionner des devises différentes.',
      } };
    }
    if (name === 'enregistrer_prospect') {
      const email = sanitizeEmail(input.email || '');
      if (!isValidEmail(email)) return { ok: false, message: "E-mail invalide — redemande-le poliment au visiteur." };
      const existing = await Lead.findOne({ email });
      const note = sanitize(input.message || '', 3000);
      if (existing) {
        if (input.phone && !existing.phone) existing.phone = sanitize(input.phone, 30);
        if (input.company && !existing.company) existing.company = sanitize(input.company, 120);
        if (input.service && !existing.service) existing.service = sanitize(input.service, 120);
        if (note) existing.internalNotes = ((existing.internalNotes || '') + '\n[Chatbot IA] ' + note).slice(0, 5000);
        await existing.save();
        return { ok: true, message: `Fiche de ${existing.name} mise à jour dans le CRM.`, dejaConnu: true };
      }
      const lead = await Lead.create({
        name: sanitize(input.name || '', 120), email,
        phone: sanitize(input.phone || '', 30), company: sanitize(input.company || '', 120),
        service: sanitize(input.service || '', 120), message: note || 'Contact via l\'assistant IA du site',
        type: 'contact', stage: 'prospect', status: 'nouveau', source: 'chatbot_ia',
      });
      return { ok: true, message: `Prospect enregistré : ${lead.name} (${lead.email}).`, dejaConnu: false };
    }
    if (name === 'creer_rendez_vous') {
      const email = sanitizeEmail(input.email || '');
      if (!isValidEmail(email)) return { ok: false, message: "E-mail invalide — redemande-le au visiteur." };
      const reason = sanitize(input.reason || '', 3000);
      if (!reason || reason.length < 5) return { ok: false, message: 'Le motif du rendez-vous est obligatoire — demande au visiteur ce qu\'il souhaite aborder.' };
      const appt = await Appointment.create({
        name: sanitize(input.name || '', 120), email, phone: sanitize(input.phone || '', 30),
        preferredDate: sanitize(input.preferredDate || '', 20), preferredTime: sanitize(input.preferredTime || '', 10),
        channel: ['visio', 'telephone', 'whatsapp', 'presentiel'].includes(input.channel) ? input.channel : 'visio',
        subject: 'Rendez-vous de cadrage', message: reason,
        status: 'demande', publicToken: generateToken(), source: 'chatbot_ia',
      });
      // Notifie l'equipe (await obligatoire : sur Vercel la fonction gele apres la reponse)
      await sendEmail(
        process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
        `[Pirabel Labs] Nouveau RDV via l'assistant IA — ${appt.name}`,
        masterTemplate({
          title: 'Rendez-vous demandé via le chatbot',
          body: `<p><strong>${escapeHtml(appt.name)}</strong> (${escapeHtml(appt.email)}${appt.phone ? ' — ' + escapeHtml(appt.phone) : ''}) a demandé un rendez-vous depuis l'assistant IA du site.</p>` +
            `<p>Créneau souhaité : <strong>${escapeHtml((appt.preferredDate || 'non précisé') + ' ' + (appt.preferredTime || ''))}</strong> — canal : ${escapeHtml(appt.channel)}</p>` +
            `<div style="border-left:3px solid #FF5500;padding:12px 16px;background:#0e0e0e;"><div style="font-size:12px;color:rgba(229,226,225,0.5);text-transform:uppercase;margin-bottom:4px;">Motif</div><div style="color:#e5e2e1;white-space:pre-wrap;">${escapeHtml(reason)}</div></div>`,
          cta: 'Ouvrir les rendez-vous', ctaUrl: 'https://www.pirabellabs.com/admin/dashboard',
        })
      ).catch(e => console.error('[ai.rdv] mail admin:', e.message));
      return { ok: true, message: `Rendez-vous enregistré pour ${appt.name}. L'équipe confirme le créneau sous 24 h ouvrées.` };
    }
    if (name === 'lister_rendez_vous') {
      const f = {}; if (input.status) f.status = input.status;
      const list = await Appointment.find(f).sort({ createdAt: -1 }).limit(50).select('name email phone preferredDate preferredTime channel status message').lean();
      return { ok: true, rendez_vous: list.map(a => ({ id: String(a._id), nom: a.name, email: a.email, tel: a.phone || '', date: a.preferredDate || '', heure: a.preferredTime || '', canal: a.channel, statut: a.status, motif: (a.message || '').slice(0, 160) })) };
    }

    // ---------- Exécutions confirmées (opts.allowSensitive === true) ----------
    if (name === 'envoyer_devis' || name === 'envoyer_facture') {
      const isQuote = name === 'envoyer_devis';
      const Model = isQuote ? Quote : Invoice;
      const doc = await Model.findOne({ reference: sanitize(input.reference || '', 40) });
      if (!doc) return { ok: false, message: `${isQuote ? 'Devis' : 'Facture'} ${input.reference} introuvable.` };
      if (isQuote && ['accepte', 'refuse', 'annule'].includes(doc.status)) return { ok: false, message: `Le devis ${doc.reference} est ${LIBELLES_STATUT_DEVIS[doc.status].toLowerCase()} : il ne peut plus être envoyé.` };
      if (isQuote && statutDevisEffectif(doc) === 'expire') return { ok: false, message: `Le devis ${doc.reference} a expiré : prolonge sa validité avant de l’envoyer.` };
      if (!isQuote && doc.status === 'annulee') return { ok: false, message: `La facture ${doc.reference} est annulée : elle ne peut pas être envoyée.` };
      if (isQuote && doc.status === 'brouillon') reporterValiditeBrouillon(doc);
      const publicUrl = `https://www.pirabellabs.com/${isQuote ? 'devis' : 'facture'}/${isQuote ? (doc.publicSlug || doc.publicToken) : doc.publicToken}`;
      const html = isQuote ? emailDevisHtml(doc, publicUrl) : emailFactureHtml(doc, publicUrl);
      const sent = await sendEmail(doc.clientEmail, `${isQuote ? 'Votre devis' : 'Votre facture'} Pirabel Labs - ${doc.reference}`, html);
      if (!sent) return { ok: false, message: "Envoi refusé par le fournisseur d'e-mail." };
      await journaliserEmail({ to: doc.clientEmail, toName: doc.clientName, subject: (isQuote ? 'Devis ' : 'Facture ') + doc.reference, body: doc.title, ok: true, leadId: doc.leadId, agent: opts.agentId });
      const premierEnvoi = doc.status === 'brouillon';
      if (premierEnvoi) doc.status = isQuote ? 'envoye' : 'envoyee';
      doc.sentAt = new Date();
      await doc.save();
      if (isQuote && premierEnvoi) await Lead.findByIdAndUpdate(doc.leadId, { $inc: { quotesSent: 1 }, $set: { lastQuoteAt: new Date(), stage: 'devis_envoye' } });
      return { ok: true, message: `${isQuote ? 'Devis' : 'Facture'} ${doc.reference} envoyé${isQuote ? '' : 'e'} à ${doc.clientEmail}.` };
    }
    if (name === 'envoyer_email') {
      const email = sanitizeEmail(input.email || '');
      const lead = await Lead.findOne({ email });
      if (!lead) return { ok: false, message: `Aucun contact avec l'e-mail ${input.email} dans le CRM.` };
      const para = 'font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);margin:0 0 16px;';
      const bodyHtml = '<p style="' + para + '">' + escapeHtml(String(input.message || '')).replace(/\n\n+/g, '</p><p style="' + para + '">').replace(/\n/g, '<br>') + '</p>';
      const html = masterTemplate({ headerType: 'hero', preheader: sanitize(input.subject || '', 200),
        title: 'Bonjour ' + escapeHtml((lead.name || '').split(' ')[0]) + ',', body: bodyHtml,
        cta: 'Visiter pirabellabs.com', ctaUrl: 'https://www.pirabellabs.com' });
      const sent = await sendEmail(email, sanitize(input.subject || '', 200), html, { replyTo: process.env.ADMIN_EMAIL || 'contact@pirabellabs.com' });
      if (!sent) return { ok: false, message: "Envoi refusé par le fournisseur d'e-mail." };
      await journaliserEmail({ to: email, toName: lead.name, subject: input.subject, body: input.message, ok: true, leadId: lead._id, agent: opts.agentId });
      lead.lastEmailSentAt = new Date(); lead.emailsSentCount = (lead.emailsSentCount || 0) + 1;
      if (lead.status === 'nouveau') lead.status = 'lu';
      await lead.save();
      return { ok: true, message: `E-mail envoyé à ${lead.name} (${email}).` };
    }
    if (name === 'supprimer_devis' || name === 'supprimer_facture') {
      const isQuote = name === 'supprimer_devis';
      const Model = isQuote ? Quote : Invoice;
      const ref = sanitize(input.reference || '', 40);
      const existant = await Model.findOne({ reference: ref }).select('_id status').lean();
      if (!existant) return { ok: false, message: `Document ${input.reference} introuvable.` };
      if (!isQuote && existant.status !== 'brouillon') return { ok: false, message: 'Une facture émise ne peut pas être supprimée : annulez-la.' };
      if (isQuote && await Invoice.countDocuments({ quoteId: existant._id })) return { ok: false, message: 'Des factures sont rattachées à ce devis : il ne peut pas être supprimé. Annulez-le plutôt.' };
      const doc = await Model.findOneAndDelete(isQuote ? { _id: existant._id } : { _id: existant._id, status: 'brouillon' });
      if (!doc) return { ok: false, message: `Document ${input.reference} introuvable ou modifié entre-temps.` };
      return { ok: true, message: `${doc.reference} supprimé définitivement (${moneyFmt(doc.total, doc.currency)}).` };
    }
    if (name === 'marquer_facture_payee') {
      const inv = await Invoice.findOne({ reference: sanitize(input.reference || '', 40) });
      if (!inv) return { ok: false, message: `Facture ${input.reference} introuvable.` };
      if (inv.status === 'payee' || (inv.status !== 'annulee' && Invoice.balanceOf(inv) <= 0)) return { ok: false, message: `La facture ${inv.reference} est déjà réglée.` };
      const reste = Invoice.balanceOf(inv);
      const errP = enregistrerPaiement(inv, { amount: reste, method: input.paymentMethod || '' });
      if (errP) return { ok: false, message: errP };
      await inv.save();
      return { ok: true, message: `Facture ${inv.reference} marquée réglée (paiement de ${moneyFmt(reste, inv.currency)} enregistré).` };
    }
    if (name === 'modifier_rendez_vous') {
      if (!/^[a-f0-9]{24}$/i.test(input.rdvId || '')) return { ok: false, message: 'Identifiant de rendez-vous invalide — utilise lister_rendez_vous.' };
      const a = await Appointment.findById(input.rdvId);
      if (!a) return { ok: false, message: 'Rendez-vous introuvable.' };
      if (input.action === 'confirmer') a.status = 'confirme';
      else if (input.action === 'annuler') a.status = 'annule';
      else if (input.action === 'deplacer') {
        if (input.preferredDate) a.preferredDate = sanitize(input.preferredDate, 20);
        if (input.preferredTime) a.preferredTime = sanitize(input.preferredTime, 10);
        a.status = 'confirme';
      }
      if (input.raison) a.internalNotes = ((a.internalNotes || '') + '\n[Agent IA] ' + sanitize(input.raison, 800)).slice(0, 3000);
      await a.save();
      // Prévenir le client du changement
      const quand = (a.preferredDate || '') + (a.preferredTime ? ' à ' + a.preferredTime : '');
      await sendEmail(a.email, `Votre rendez-vous Pirabel Labs — ${input.action === 'annuler' ? 'annulation' : 'confirmation'}`,
        masterTemplate({ title: 'Bonjour ' + escapeHtml((a.name || '').split(' ')[0]) + ',',
          body: input.action === 'annuler'
            ? `<p>Votre rendez-vous a été annulé.${input.raison ? ' ' + escapeHtml(input.raison) : ''}</p><p>Vous pouvez en reprendre un quand vous le souhaitez.</p>`
            : `<p>Votre rendez-vous est confirmé pour le <strong>${escapeHtml(quand || 'créneau convenu')}</strong> (${escapeHtml(a.channel)}).</p>${input.raison ? '<p>' + escapeHtml(input.raison) + '</p>' : ''}`,
          cta: 'Prendre / gérer un rendez-vous', ctaUrl: 'https://www.pirabellabs.com/rdv' })
      ).catch(e => console.error('[ai.rdv.modif] mail:', e.message));
      return { ok: true, message: `Rendez-vous de ${a.name} : ${input.action}${quand ? ' — ' + quand : ''}. Le client a été prévenu par e-mail.` };
    }
    if (name === 'creer_projet') {
      const lead = await Lead.findOne({ email: sanitizeEmail(input.clientEmail || '') });
      if (!lead) return { ok: false, message: `Aucun contact avec l'e-mail ${input.clientEmail}. Utilise rechercher_prospects pour trouver le bon.` };
      const steps = (Array.isArray(input.steps) ? input.steps : []).filter(s => s && s.label).slice(0, 20).map(s => ({
        label: sanitize(s.label, 120), description: sanitize(s.description || '', 600),
        status: ['a_venir', 'en_cours', 'termine', 'bloque'].includes(s.status) ? s.status : 'a_venir',
        completedAt: s.status === 'termine' ? new Date() : undefined,
      }));
      const p = await Project.create({
        leadId: lead._id, clientName: lead.name, clientEmail: lead.email,
        title: sanitize(input.title, 200), description: sanitize(input.description || '', 4000),
        service: sanitize(input.service || lead.service || '', 120),
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        steps, status: steps.some(s => s.status === 'en_cours' || s.status === 'termine') ? 'en_cours' : 'cadrage',
      });
      // Ouvre automatiquement l'espace client : le projet n'a d'intérêt que s'il est consultable.
      if (!lead.portalEnabled) { lead.portalEnabled = true; await lead.save(); }
      return { ok: true, message: `Projet « ${p.title} » créé pour ${lead.name} avec ${steps.length} étape(s). Visible dans son espace client.`, projetId: String(p._id) };
    }
    if (name === 'lister_projets') {
      const f = {}; if (input.status) f.status = input.status;
      const list = await Project.find(f).sort({ createdAt: -1 }).limit(50).lean();
      return { ok: true, projets: list.map(p => ({
        id: String(p._id), titre: p.title, client: p.clientName, email: p.clientEmail,
        statut: p.status, service: p.service || '',
        echeance: p.dueDate ? new Date(p.dueDate).toISOString().slice(0, 10) : null,
        etapes: (p.steps || []).map((s, i) => ({ index: i, libelle: s.label, statut: s.status })),
        progression: p.steps && p.steps.length ? Math.round((p.steps.filter(s => s.status === 'termine').length / p.steps.length) * 100) : 0,
      })) };
    }
    if (name === 'modifier_projet') {
      if (!/^[a-f0-9]{24}$/i.test(input.projetId || '')) return { ok: false, message: 'Identifiant de projet invalide — utilise lister_projets.' };
      const p = await Project.findById(input.projetId);
      if (!p) return { ok: false, message: 'Projet introuvable.' };
      const faits = [];
      if (input.status) { p.status = input.status; faits.push(`statut → ${input.status}`); if (input.status === 'livre' && !p.deliveredAt) p.deliveredAt = new Date(); }
      if (typeof input.etapeIndex === 'number' && input.etapeStatus && p.steps[input.etapeIndex]) {
        p.steps[input.etapeIndex].status = input.etapeStatus;
        p.steps[input.etapeIndex].completedAt = input.etapeStatus === 'termine' ? new Date() : undefined;
        faits.push(`étape « ${p.steps[input.etapeIndex].label} » → ${input.etapeStatus}`);
      }
      if (input.ajouterEtape) { p.steps.push({ label: sanitize(input.ajouterEtape, 120), status: 'a_venir' }); faits.push(`étape ajoutée : « ${sanitize(input.ajouterEtape, 120)} »`); }
      if (input.previewUrl !== undefined) { p.previewUrl = sanitize(input.previewUrl, 500); faits.push('lien d\'aperçu mis à jour'); }
      if (input.liveUrl !== undefined) { p.liveUrl = sanitize(input.liveUrl, 500); faits.push('lien de mise en ligne mis à jour'); }
      if (input.dueDate) { p.dueDate = new Date(input.dueDate); faits.push(`échéance → ${input.dueDate}`); }
      if (!faits.length) return { ok: false, message: 'Aucune modification demandée.' };
      await p.save();
      const prog = p.steps.length ? Math.round((p.steps.filter(s => s.status === 'termine').length / p.steps.length) * 100) : 0;
      return { ok: true, message: `Projet « ${p.title} » mis à jour (${faits.join(', ')}). Avancement : ${prog} %.` };
    }
    if (name === 'ouvrir_espace_client') {
      const email = sanitizeEmail(input.email || '');
      const lead = await Lead.findOne({ email });
      if (!lead) return { ok: false, message: `Aucun contact avec l'e-mail ${input.email}.` };
      lead.portalEnabled = true;
      const tok = generateToken();
      lead.portalToken = tok;
      lead.portalTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
      await lead.save();
      const sent = await sendEmail(lead.email, 'Votre espace client Pirabel Labs est ouvert',
        masterTemplate({
          headerType: 'hero', preheader: 'Accédez à votre espace client',
          title: 'Bonjour ' + escapeHtml((lead.name || '').split(' ')[0]) + ',',
          subtitle: 'Votre espace client est prêt',
          body: "<p style=\"font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);\">Vous pouvez désormais suivre l'avancement de votre projet, consulter vos devis et factures, et échanger directement avec notre équipe depuis votre espace personnel.</p>" +
            "<p style=\"font-size:14px;color:rgba(229,226,225,0.6);\">Le lien ci-dessous vous connecte directement. Il est valable 30 minutes ; ensuite, demandez-en un nouveau depuis la page de connexion avec cette même adresse e-mail.</p>",
          cta: 'Ouvrir mon espace client', ctaUrl: `https://www.pirabellabs.com/espace-client/connexion/${tok}`,
        }));
      if (!sent) return { ok: false, message: "Espace activé mais l'e-mail n'a pas pu partir." };
      return { ok: true, message: `Espace client ouvert pour ${lead.name} et lien de connexion envoyé à ${email}.` };
    }
    if (name === 'bilan_comptable') {
      const b = await synthetiseComptabilite(input.periode);
      return { ok: true, comptabilite: b };
    }
    if (name === 'enregistrer_depense') {
      const montant = Number(input.amount);
      if (!(montant > 0)) return { ok: false, message: 'Montant invalide.' };
      const d = await Expense.create({
        label: sanitize(input.label || '', 200), amount: Math.round(montant * 100) / 100,
        category: CATEGORIES_CHARGES.includes(input.category) ? input.category : 'autre',
        currency: DEVISES.includes(input.currency) ? input.currency : 'EUR',
        supplier: sanitize(input.supplier || '', 160), recurring: !!input.recurring,
        date: input.date && !isNaN(new Date(input.date).getTime()) ? new Date(input.date) : new Date(),
        createdBy: currentUser && currentUser._id ? currentUser._id : undefined,
      });
      return { ok: true, message: `Charge enregistrée : ${d.label} — ${d.amount} ${d.currency}${d.recurring ? ' (récurrente)' : ''}.` };
    }
    if (name === 'requalifier_factures_en_retard') {
      const r = await Invoice.updateMany(
        { status: { $in: ['envoyee', 'consultee', 'partiellement_payee'] }, dueDate: { $lt: new Date() } },
        { $set: { status: 'en_retard', updatedAt: new Date() } }
      );
      const total = await Invoice.countDocuments({ status: 'en_retard' });
      return { ok: true, message: r.modifiedCount
        ? `${r.modifiedCount} facture(s) requalifiée(s) « en retard ». Total en retard : ${total}.`
        : `Aucune facture à requalifier — les échéances sont à jour. Total déjà en retard : ${total}.` };
    }
    if (name === 'relancer_facture') {
      const inv = await Invoice.findOne({ reference: sanitize(input.reference || '', 40) });
      if (!inv) return { ok: false, message: `Facture ${input.reference} introuvable.` };
      if (inv.status === 'annulee') return { ok: false, message: `La facture ${inv.reference} est annulée : aucune relance à envoyer.` };
      if (inv.status === 'payee' || Invoice.balanceOf(inv) <= 0) return { ok: false, message: `La facture ${inv.reference} est déjà réglée : aucune relance à envoyer.` };
      const resteDu = Invoice.balanceOf(inv);
      const jours = inv.dueDate ? Math.floor((Date.now() - new Date(inv.dueDate).getTime()) / 86400000) : 0;
      const para = 'font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);margin:0 0 16px;';
      const html = masterTemplate({
        headerType: 'hero', preheader: `Relance — facture ${inv.reference}`,
        title: 'Bonjour ' + escapeHtml((inv.clientName || '').split(' ')[0]) + ',',
        subtitle: `Facture ${inv.reference}`,
        body: '<p style="' + para + '">' + escapeHtml(String(input.message || '')).replace(/\n\n+/g, '</p><p style="' + para + '">').replace(/\n/g, '<br>') + '</p>' +
          `<div style="margin:20px 0;padding:18px;background:#0e0e0e;border:1px solid rgba(255,85,0,0.3);border-radius:10px;">` +
          `<div style="font-size:13px;color:rgba(229,226,225,0.6);">${resteDu < inv.total ? 'Reste à payer (sur ' + moneyFmt(inv.total, inv.currency) + ')' : 'Montant dû'}</div>` +
          `<div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:24px;color:#FF5500;">${moneyFmt(resteDu, inv.currency)}</div>` +
          (inv.dueDate ? `<div style="font-size:13px;color:rgba(229,226,225,0.6);margin-top:6px;">Échéance : ${new Date(inv.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}${jours > 0 ? ` (dépassée de ${jours} jour${jours > 1 ? 's' : ''})` : ''}</div>` : '') +
          `</div>`,
        cta: 'Consulter et régler la facture', ctaUrl: `https://www.pirabellabs.com/facture/${inv.publicToken}`,
      });
      const sent = await sendEmail(inv.clientEmail, `Relance — facture ${inv.reference}`, html);
      await journaliserEmail({ to: inv.clientEmail, toName: inv.clientName, subject: `Relance — facture ${inv.reference}`,
        body: input.message, ok: !!sent, leadId: inv.leadId, agent: opts.agentId });
      if (!sent) return { ok: false, message: "Envoi refusé par le fournisseur d'e-mail." };
      inv.internalNotes = ((inv.internalNotes || '') + `\n[Relance ${new Date().toISOString().slice(0, 10)}]`).slice(0, 5000);
      await inv.save();
      return { ok: true, message: `Relance envoyée à ${inv.clientEmail} pour ${inv.reference} (reste à payer : ${moneyFmt(resteDu, inv.currency)}).` };
    }
    if (name === 'supprimer_rendez_vous') {
      if (!/^[a-f0-9]{24}$/i.test(input.rdvId || '')) return { ok: false, message: 'Identifiant invalide — utilise lister_rendez_vous pour le récupérer.' };
      const a = await Appointment.findByIdAndDelete(input.rdvId);
      if (!a) return { ok: false, message: 'Rendez-vous introuvable (déjà supprimé ?).' };
      return { ok: true, message: `Rendez-vous de ${a.name} (${a.email}) supprimé définitivement.` };
    }
    if (name === 'supprimer_prospect') {
      const email = sanitizeEmail(input.email || '');
      const lead = await Lead.findOne({ email });
      if (!lead) return { ok: false, message: `Aucune fiche avec l'e-mail ${input.email}.` };
      // Refus si la fiche porte un historique commercial : on ne casse pas une piste comptable.
      const [nq, ni] = await Promise.all([Quote.countDocuments({ leadId: lead._id }), Invoice.countDocuments({ leadId: lead._id })]);
      if (nq || ni) return { ok: false, message: `Suppression refusée : ${lead.name} est rattaché à ${nq} devis et ${ni} facture(s). Supprimez d’abord ces documents si c’est vraiment voulu.` };
      await Lead.deleteOne({ _id: lead._id });
      return { ok: true, message: `Fiche de ${lead.name} (${email}) supprimée du CRM.` };
    }
    if (name === 'publier_article') {
      const art = await Article.findOne({ slug: sanitize(input.slug || '', 200) });
      if (!art) return { ok: false, message: `Article « ${input.slug} » introuvable.` };
      art.status = 'publie';
      if (!art.publishedAt) art.publishedAt = new Date();
      await art.save();
      return { ok: true, message: `Article « ${art.title} » publié : https://www.pirabellabs.com/blog/${art.slug}` };
    }
    return { ok: false, message: 'Outil inconnu.' };
  } catch (e) { console.error('[ai.tool]', name, e.message); return { ok: false, message: 'Erreur exécution : ' + e.message }; }
}

// Ancien découpage par « mode » → nouveau registre d'agents (rétrocompatibilité de l'UI).
const MODE_TO_AGENT = { redaction: 'redacteur', analyse: 'analyste', equipe: 'chef', libre: 'chef' };

app.post('/api/admin/assistant', auth, adminOnly, limitBody(80), async (req, res) => {
  try {
    const apiKey = await getOpenRouterKey();
    if (!apiKey) return res.status(503).json({ error: 'NO_KEY', message: "L'assistant IA n'est pas configuré (clé OpenRouter manquante)." });

    // Sélection de l'agent : paramètre `agent` explicite, sinon dérivé de l'ancien `mode`.
    const agentId = AI.AGENTS[req.body.agent] && AI.AGENTS[req.body.agent].scope === 'admin'
      ? req.body.agent
      : (MODE_TO_AGENT[req.body.mode] || 'chef');
    const agent = AI.AGENTS[agentId];

    // Historique borné : tout est renvoyé au modèle à chaque tour, donc chaque message
    // conservé se paie sur toute la suite de la conversation.
    const incoming = Array.isArray(req.body.messages) ? req.body.messages : [];
    const history = incoming
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-12)
      .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
    if (!history.length || history[history.length - 1].role !== 'user') return res.status(400).json({ error: 'Message utilisateur requis.' });

    const ctx = await gatherBusinessContext();
    const system = AI.buildSystemPrompt(agent, JSON.stringify(ctx));
    const model = process.env.OPENROUTER_MODEL || (await getSetting('openrouterModel')) || agent.model;
    // Les casquettes internes ont acces a TOUS les outils : la specialisation guide
    // le comportement via le prompt, elle ne doit pas brider ce que l'agent peut faire.
    const tools = assistantToolsOpenAI(ASSISTANT_TOOLS.map(t => t.name));
    const convo = [{ role: 'system', content: system }].concat(history);
    const actionsLog = [];
    const pendingList = [];
    let finalText = '';

    // Boucle d'agent : jusqu'à 6 tours d'outils (limite serverless 30 s)
    for (let turn = 0; turn < 6; turn++) {
      // Le délai doit rester sous la durée max de la fonction (60 s) tout en laissant
      // le temps aux générations longues : la rédaction d'un article dépasse 30 s.
      const { ok, status, data } = await AI.callOpenRouter({ apiKey, model, messages: convo, tools,
        maxTokens: agent.maxTokens || 4000, temperature: 0.5, timeoutMs: agent.timeoutMs || 45000 });
      if (!ok) {
        console.error('[ai.api]', status, JSON.stringify(data).slice(0, 300));
        if (status === 429) return res.status(429).json({ error: 'RATE_LIMIT', message: 'Limite de débit atteinte chez OpenRouter. Patiente quelques secondes et réessaie.' });
        if (status === 402) return res.status(402).json({ error: 'NO_CREDIT', message: 'Crédit OpenRouter épuisé. Recharge le compte pour continuer à utiliser les agents.' });
        return res.status(502).json({ error: 'API_ERROR', message: (data && data.error && data.error.message) || 'Erreur API IA.' });
      }
      const msg = (data.choices && data.choices[0] && data.choices[0].message) || {};
      if (msg.content) finalText = String(msg.content).trim();
      const toolCalls = msg.tool_calls || [];
      if (!toolCalls.length) break;
      // Rejouer le message assistant (avec ses tool_calls) puis exécuter chaque outil côté serveur
      convo.push(msg);
      for (const tc of toolCalls) {
        let input = {};
        try { input = JSON.parse((tc.function && tc.function.arguments) || '{}'); } catch (e) {}
        const result = await executeAssistantTool((tc.function && tc.function.name) || '', input, req.user,
          { agentId: agent.id, conversationId: /^[a-f0-9]{24}$/i.test(req.body.conversationId || '') ? req.body.conversationId : undefined });
        if (result && result.pending) pendingList.push({ id: result.actionId, summary: result.summary, tool: (tc.function && tc.function.name) || '', risk: HIGH_RISK_TOOLS.has((tc.function && tc.function.name) || '') ? 'eleve' : 'normal' });
        else if (result && result.message) actionsLog.push(result.message);
        convo.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
      }
    }
    res.json({ reply: finalText || '(action effectuée)', actions: actionsLog, pending: pendingList, agent: agent.id, agentName: agent.name });
  } catch (e) { console.error('[assistant]', e.message); res.status(500).json({ error: 'Erreur assistant.', message: e.message }); }
});

// Maintenance : supprime un index unique herite d'un ancien schema (champ disparu),
// qui bloque toute creation avec « E11000 duplicate key ... : null ».
app.post('/api/admin/_drop-legacy-index', auth, adminOnly, limitBody(5), async (req, res) => {
  const MODELES = { quotes: Quote, invoices: Invoice, leads: Lead, projects: Project };
  try {
    const M = MODELES[String(req.body.collection || '')];
    const idx = String(req.body.index || '').slice(0, 80);
    if (!M || !/^[a-zA-Z0-9_]+$/.test(idx)) return res.status(400).json({ error: 'Collection ou index invalide.' });
    await M.collection.dropIndex(idx);
    res.json({ success: true, message: `Index ${idx} supprimé.` });
  } catch (e) { res.json({ success: false, error: e.message }); }
});

// --- Recrutement : administration des offres et des candidatures ---
app.get('/api/admin/jobs', auth, adminOnly, async (req, res) => {
  try {
    const f = {}; if (['brouillon', 'publie', 'pourvu', 'archive'].includes(req.query.status)) f.status = req.query.status;
    const jobs = await Job.find(f).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ jobs });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

app.post('/api/admin/jobs', auth, adminOnly, limitBody(50), async (req, res) => {
  try {
    const title = sanitize(req.body.title || '', 160);
    if (!title || title.length < 3) return res.status(400).json({ error: 'Intitulé du poste requis.' });
    const base = title.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'poste';
    let slug = base, n = 1;
    while (await Job.findOne({ slug }).select('_id').lean()) slug = `${base}-${++n}`;

    const liste = (v) => Array.isArray(v) ? v.map(x => sanitize(String(x), 300)).filter(Boolean).slice(0, 20) : [];
    const job = await Job.create({
      title, slug,
      department: sanitize(req.body.department || '', 80),
      contract: ['cdi', 'cdd', 'stage', 'alternance', 'freelance'].includes(req.body.contract) ? req.body.contract : 'cdi',
      location: sanitize(req.body.location || 'Abomey-Calavi, Bénin', 120),
      remote: ['sur_site', 'hybride', 'full_remote'].includes(req.body.remote) ? req.body.remote : 'hybride',
      experience: sanitize(req.body.experience || '', 80),
      salary: sanitize(req.body.salary || '', 120),
      excerpt: sanitize(req.body.excerpt || '', 400),
      content: sanitizeSoft(req.body.content || '', 40000),
      missions: liste(req.body.missions), profile: liste(req.body.profile), advantages: liste(req.body.advantages),
      status: req.body.status === 'publie' ? 'publie' : 'brouillon',
      publishedAt: req.body.status === 'publie' ? new Date() : undefined,
    });
    res.json({ success: true, job });
  } catch (e) { console.error('[jobs.create]', e.message); res.status(500).json({ error: 'Erreur : ' + e.message }); }
});

app.patch('/api/admin/jobs/:id', auth, adminOnly, limitBody(50), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Offre introuvable.' });
    ['title', 'department', 'location', 'experience', 'salary', 'excerpt'].forEach(f => {
      if (req.body[f] !== undefined) job[f] = sanitize(String(req.body[f]), 400);
    });
    if (req.body.content !== undefined) job.content = sanitizeSoft(req.body.content, 40000);
    if (['cdi', 'cdd', 'stage', 'alternance', 'freelance'].includes(req.body.contract)) job.contract = req.body.contract;
    if (['sur_site', 'hybride', 'full_remote'].includes(req.body.remote)) job.remote = req.body.remote;
    ['missions', 'profile', 'advantages'].forEach(f => {
      if (Array.isArray(req.body[f])) job[f] = req.body[f].map(x => sanitize(String(x), 300)).filter(Boolean).slice(0, 20);
    });
    if (['brouillon', 'publie', 'pourvu', 'archive'].includes(req.body.status)) {
      job.status = req.body.status;
      if (req.body.status === 'publie' && !job.publishedAt) job.publishedAt = new Date();
    }
    await job.save();
    res.json({ success: true, job });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

app.delete('/api/admin/jobs/:id', auth, adminOnly, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Offre introuvable.' });
    await Application.deleteMany({ jobId: job._id });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

app.get('/api/admin/candidatures', auth, adminOnly, async (req, res) => {
  try {
    const f = {};
    if (['nouveau', 'en_revue', 'preselectionne', 'entretien', 'test', 'accepte', 'refuse'].includes(req.query.status)) f.status = req.query.status;
    if (/^[a-f0-9]{24}$/i.test(req.query.jobId || '')) f.jobId = req.query.jobId;
    const list = await Application.find(f).sort({ createdAt: -1 }).limit(200).lean();
    const stats = await Application.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
    const parStatut = {}; stats.forEach(s => { parStatut[s._id] = s.n; });
    res.json({
      candidatures: list.map(a => ({
        id: String(a._id), nom: a.name, email: a.email, tel: a.phone, ville: a.city,
        poste: a.jobTitle, statut: a.status, lu: a.lu,
        cv: a.cvUrl, linkedin: a.linkedin, portfolio: a.portfolio,
        motivation: a.coverLetter, resume: a.aiSummary, adequation: a.aiFit,
        pointsForts: a.aiStrengths, reserves: a.aiConcerns, le: a.createdAt,
      })),
      parStatut, nonLues: await Application.countDocuments({ lu: false }),
    });
  } catch (e) { console.error('[candidatures.list]', e.message); res.status(500).json({ error: 'Erreur.' }); }
});

// Changement d'etape : declenche l'e-mail correspondant au candidat.
app.post('/api/admin/candidatures/:id/statut', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const c = await Application.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Candidature introuvable.' });
    const statut = req.body.status;
    if (!['nouveau', 'en_revue', 'preselectionne', 'entretien', 'test', 'accepte', 'refuse'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide.' });
    }
    c.status = statut; c.lu = true;
    if (req.body.note) c.internalNotes = ((c.internalNotes || '') + '\n' + sanitize(req.body.note, 1000)).slice(0, 5000);
    await c.save();

    let prevenu = false;
    const cfg = STATUS_MESSAGES[statut];
    if (cfg && req.body.prevenirCandidat !== false) {
      prevenu = !!await sendEmail(c.email, cfg.subject + ' — Pirabel Labs',
        applicationStatusEmail(c.name, c.jobTitle, statut, sanitize(req.body.note || '', 1000))
      ).catch(e => { console.error('[candidature.statut] mail:', e.message); return false; });
    }
    res.json({ success: true, statut, candidatPrevenu: prevenu });
  } catch (e) { console.error('[candidature.statut]', e.message); res.status(500).json({ error: 'Erreur.' }); }
});

// ========================================================================
// === COMPTABILITÉ ===
// ========================================================================
// Principe retenu : le chiffre d'affaires est constaté à l'ENCAISSEMENT (date de
// chaque paiement reçu, acomptes compris), pas à l'émission. C'est la comptabilité de trésorerie, la
// plus juste pour une structure de cette taille. Les factures émises non réglées
// sont donc des créances, pas du chiffre d'affaires.
const CATEGORIES_CHARGES = ['outils', 'sous_traitance', 'salaires', 'marketing', 'hebergement',
  'materiel', 'deplacement', 'banque', 'impots', 'autre'];

// Bornes d'une période : « 2026-07 » (mois), « 2026 » (année), ou tout par défaut.
// Les bornes suivent le fuseau de l'agence (Africa/Porto-Novo, UTC+1) : un paiement
// reçu le 1er août à 0 h 30 à Cotonou appartient bien au mois d'août.
function debutMoisAgence(annee, moisIndex) {
  return new Date(Date.UTC(annee, moisIndex, 1) - DECALAGE_AGENCE_MS);
}
function bornesPeriode(p) {
  const s = String(p || '').trim();
  let m;
  if ((m = s.match(/^(\d{4})-(\d{2})$/))) {
    return { debut: debutMoisAgence(+m[1], +m[2] - 1), fin: debutMoisAgence(+m[1], +m[2]), libelle: s };
  }
  if ((m = s.match(/^(\d{4})$/))) {
    return { debut: debutMoisAgence(+m[1], 0), fin: debutMoisAgence(+m[1] + 1, 0), libelle: s };
  }
  return { debut: null, fin: null, libelle: 'depuis le début' };
}

// Paiements (réels ou « historiques ») d'une liste de factures, éventuellement
// filtrés sur une période — c'est la base du CA encaissé.
function paiementsDesFactures(factures, debut, fin) {
  const out = [];
  factures.forEach(i => {
    if (i.status === 'annulee') return;
    Invoice.paymentsOf(i).forEach(p => {
      const d = p.date ? new Date(p.date) : null;
      if (debut && (!d || d < debut || d >= fin)) return;
      out.push({ facture: i, montant: Number(p.amount) || 0, date: d, moyen: p.method || '' });
    });
  });
  return out;
}

async function synthetiseComptabilite(periode) {
  const { debut, fin, libelle } = bornesPeriode(periode);
  const dansPeriode = (champ) => (debut ? { [champ]: { $gte: debut, $lt: fin } } : {});
  const now = new Date();

  // Factures portant au moins un paiement (ou anciennes factures « payées » sans détail).
  const filtreEncaisse = debut
    ? { status: { $ne: 'annulee' }, $or: [{ 'payments.date': { $gte: debut, $lt: fin } }, { status: 'payee', 'payments.0': { $exists: false }, paidAt: { $gte: debut, $lt: fin } }] }
    : { status: { $ne: 'annulee' }, $or: [{ 'payments.0': { $exists: true } }, { status: 'payee' }] };

  const [avecPaiements, emises, devis, charges] = await Promise.all([
    Invoice.find(filtreEncaisse).select('reference clientName total currency status paidAt paymentMethod payments updatedAt issuedAt title').lean(),
    // Créances : émises et non soldées — encaissement attendu.
    Invoice.find({ status: { $in: ['envoyee', 'consultee', 'partiellement_payee', 'en_retard'] } })
      .select('reference clientName total currency dueDate status payments paidAt').sort({ dueDate: 1 }).lean(),
    // Pipeline : devis acceptés pas encore (entièrement) facturés.
    Quote.find({ status: 'accepte' }).select('reference clientName total currency acceptedAt').lean(),
    Expense.find(dansPeriode('date')).select('label category amount currency date supplier recurring').sort({ date: -1 }).lean(),
  ]);
  const facturesDevis = devis.length
    ? await Invoice.find({ quoteId: { $in: devis.map(q => q._id) }, status: { $ne: 'annulee' } }).select('quoteId kind total').lean()
    : [];

  const encaissements = paiementsDesFactures(avecPaiements, debut, fin).sort((a, b) => (b.date || 0) - (a.date || 0));

  // Les devises ne s'additionnent pas : on ventile.
  const parDevise = {};
  const init = (d) => (parDevise[d] = parDevise[d] || { ca: 0, charges: 0, resultat: 0, creances: 0, pipeline: 0 });
  encaissements.forEach(e => { init(e.facture.currency).ca += e.montant; });
  charges.forEach(c => { init(c.currency).charges += c.amount; });
  emises.forEach(i => { init(i.currency).creances += Invoice.balanceOf(i); });

  // Pipeline : un devis accepté déjà entièrement facturé (facture totale ou de solde)
  // en sort ; s'il n'a que des acomptes, seul le reste à facturer y figure.
  const parDevis = {};
  facturesDevis.forEach(i => { (parDevis[String(i.quoteId)] = parDevis[String(i.quoteId)] || []).push(i); });
  const pipelineDevis = [];
  devis.forEach(q => {
    const f = parDevis[String(q._id)] || [];
    if (f.some(i => (i.kind || 'totale') !== 'acompte')) return;
    const reste = arrondiDevise((q.total || 0) - f.reduce((s, i) => s + (i.total || 0), 0), q.currency);
    if (reste <= 0) return;
    init(q.currency).pipeline += reste;
    pipelineDevis.push(q);
  });
  Object.entries(parDevise).forEach(([d, v]) => {
    v.ca = arrondiDevise(v.ca, d);
    v.charges = arrondiDevise(v.charges, d);
    v.creances = arrondiDevise(v.creances, d);
    v.pipeline = arrondiDevise(v.pipeline, d);
    v.resultat = arrondiDevise(v.ca - v.charges, d);
    v.marge = v.ca > 0 ? Math.round((v.resultat / v.ca) * 100) : 0;
  });

  // Répartition des charges par poste ET par devise, pour voir où part l'argent.
  const parCategorie = {};
  charges.forEach(c => {
    const k = c.category + '|' + c.currency;
    parCategorie[k] = parCategorie[k] || { categorie: c.category, devise: c.currency, montant: 0, nombre: 0 };
    parCategorie[k].montant += c.amount;
    parCategorie[k].nombre++;
  });
  Object.values(parCategorie).forEach(v => { v.montant = arrondiDevise(v.montant, v.devise); });

  // Évolution mensuelle sur 12 mois, par devise (une série par devise).
  const moisCourant = new Intl.DateTimeFormat('en-CA', { timeZone: TZ_AGENCE, year: 'numeric', month: '2-digit' }).format(now).split('-');
  const ilYaUnAn = debutMoisAgence(+moisCourant[0], +moisCourant[1] - 1 - 11);
  const [caPaiements, caHistorique, chargesMois] = await Promise.all([
    Invoice.aggregate([
      { $match: { status: { $ne: 'annulee' }, 'payments.date': { $gte: ilYaUnAn } } },
      { $unwind: '$payments' },
      { $match: { 'payments.date': { $gte: ilYaUnAn } } },
      { $group: { _id: { mois: { $dateToString: { format: '%Y-%m', date: '$payments.date', timezone: TZ_AGENCE } }, devise: '$currency' }, total: { $sum: '$payments.amount' } } },
    ]),
    // Anciennes factures payées sans détail des paiements : un paiement du total à paidAt.
    Invoice.aggregate([
      { $match: { status: 'payee', 'payments.0': { $exists: false }, paidAt: { $gte: ilYaUnAn } } },
      { $group: { _id: { mois: { $dateToString: { format: '%Y-%m', date: '$paidAt', timezone: TZ_AGENCE } }, devise: '$currency' }, total: { $sum: '$total' } } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: ilYaUnAn } } },
      { $group: { _id: { mois: { $dateToString: { format: '%Y-%m', date: '$date', timezone: TZ_AGENCE } }, devise: '$currency' }, total: { $sum: '$amount' } } },
    ]),
  ]);
  const series = {};
  const cellule = (id) => {
    series[id.devise] = series[id.devise] || {};
    return (series[id.devise][id.mois] = series[id.devise][id.mois] || { ca: 0, charges: 0 });
  };
  caPaiements.concat(caHistorique).forEach(m => { cellule(m._id).ca += m.total; });
  chargesMois.forEach(m => { cellule(m._id).charges += m.total; });
  const evolution = {};
  Object.keys(series).forEach(dev => {
    evolution[dev] = Object.keys(series[dev]).sort().map(k => {
      const v = series[dev][k];
      const ca = arrondiDevise(v.ca, dev), ch = arrondiDevise(v.charges, dev);
      return { mois: k, ca, charges: ch, resultat: arrondiDevise(ca - ch, dev) };
    });
  });

  const enRetard = emises.filter(i => Invoice.effectiveStatus(i, now) === 'en_retard');
  const chargesRecurrentes = charges.filter(c => c.recurring);

  return {
    periode: libelle,
    parDevise,
    resume: {
      paiementsRecus: encaissements.length,
      facturesPayees: new Set(encaissements.map(e => String(e.facture._id))).size,
      creancesOuvertes: emises.length,
      creancesEnRetard: enRetard.length,
      devisAcceptes: pipelineDevis.length,
      nombreCharges: charges.length,
      chargesRecurrentes: chargesRecurrentes.length,
    },
    chargesParCategorie: parCategorie,
    evolution,
    encaissements: encaissements.slice(0, 40).map(e => ({
      ref: e.facture.reference, client: e.facture.clientName, montant: arrondiDevise(e.montant, e.facture.currency), devise: e.facture.currency,
      le: e.date, moyen: e.moyen,
    })),
    creances: emises.slice(0, 40).map(i => ({
      ref: i.reference, client: i.clientName, montant: Invoice.balanceOf(i), total: i.total, devise: i.currency,
      echeance: i.dueDate, statut: Invoice.effectiveStatus(i, now),
      retard: i.dueDate && new Date(i.dueDate) < now ? Math.floor((now - new Date(i.dueDate)) / 86400000) : 0,
    })),
    depenses: charges.slice(0, 40).map(c => ({
      id: String(c._id), libelle: c.label, categorie: c.category, montant: c.amount, devise: c.currency,
      le: c.date, fournisseur: c.supplier || '', recurrente: c.recurring,
    })),
    note: 'Chiffre d’affaires constaté à l’encaissement (date de chaque paiement, acomptes compris). Les montants ne sont jamais additionnés entre devises différentes.',
  };
}

app.get('/api/admin/comptabilite', auth, adminOnly, async (req, res) => {
  try { res.json(await synthetiseComptabilite(req.query.periode)); }
  catch (e) { console.error('[compta]', e.message); res.status(500).json({ error: messageErreur(e, 'Erreur lors du calcul de la comptabilité.') }); }
});

// --- Charges : saisie et suivi ---
app.get('/api/admin/depenses', auth, adminOnly, async (req, res) => {
  try {
    const f = {};
    if (CATEGORIES_CHARGES.includes(req.query.categorie)) f.category = req.query.categorie;
    const list = await Expense.find(f).sort({ date: -1 }).limit(200).lean();
    res.json({ depenses: list });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

app.post('/api/admin/depenses', auth, adminOnly, limitBody(20), async (req, res) => {
  try {
    const label = sanitize(req.body.label || '', 200);
    const amount = Number(req.body.amount);
    if (!label || label.length < 2) return res.status(400).json({ error: 'Libellé requis.' });
    if (!(amount > 0)) return res.status(400).json({ error: 'Montant invalide.' });
    if (req.body.currency && !DEVISES.includes(req.body.currency)) return res.status(400).json({ error: 'Devise non prise en charge.' });
    if (req.body.date && isNaN(new Date(req.body.date).getTime())) return res.status(400).json({ error: 'Date invalide.' });
    const currency = DEVISES.includes(req.body.currency) ? req.body.currency : 'EUR';
    const d = await Expense.create({
      label, amount: arrondiDevise(amount, currency),
      category: CATEGORIES_CHARGES.includes(req.body.category) ? req.body.category : 'autre',
      currency,
      recurring: !!req.body.recurring,
      supplier: sanitize(req.body.supplier || '', 160),
      paymentMethod: sanitize(req.body.paymentMethod || '', 80),
      reference: sanitize(req.body.reference || '', 80),
      notes: sanitize(req.body.notes || '', 2000),
      date: req.body.date ? new Date(req.body.date) : new Date(),
      createdBy: req.user._id,
    });
    res.json({ success: true, depense: d });
  } catch (e) { console.error('[depense.create]', e.message); res.status(500).json({ error: messageErreur(e, 'Erreur lors de l’enregistrement de la charge.') }); }
});

app.delete('/api/admin/depenses/:id', auth, adminOnly, async (req, res) => {
  try {
    const d = await Expense.findByIdAndDelete(req.params.id);
    if (!d) return res.status(404).json({ error: 'Charge introuvable.' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

// Export comptable : format ouvert, lisible par tout tableur ou expert-comptable.
// Une ligne de recette par PAIEMENT reçu (acomptes compris), datée du jour du paiement.
app.get('/api/admin/comptabilite/export', auth, adminOnly, async (req, res) => {
  try {
    const { debut, fin } = bornesPeriode(req.query.periode);
    const dans = (c) => (debut ? { [c]: { $gte: debut, $lt: fin } } : {});
    const filtreEncaisse = debut
      ? { status: { $ne: 'annulee' }, $or: [{ 'payments.date': { $gte: debut, $lt: fin } }, { status: 'payee', 'payments.0': { $exists: false }, paidAt: { $gte: debut, $lt: fin } }] }
      : { status: { $ne: 'annulee' }, $or: [{ 'payments.0': { $exists: true } }, { status: 'payee' }] };
    const [factures, charges] = await Promise.all([
      Invoice.find(filtreEncaisse).select('reference clientName total currency status paidAt paymentMethod payments updatedAt issuedAt title').lean(),
      Expense.find(dans('date')).select('label category amount currency date supplier reference').sort({ date: 1 }).lean(),
    ]);
    const jour = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ_AGENCE }).format(new Date(d));
    const esc = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const lignes = [['Date', 'Type', 'Catégorie', 'Libellé', 'Tiers', 'Référence', 'Recette', 'Dépense', 'Devise', 'Moyen'].join(';')];
    paiementsDesFactures(factures, debut, fin).sort((a, b) => (a.date || 0) - (b.date || 0)).forEach(e => lignes.push([
      e.date ? jour(e.date) : '', 'Recette', 'Prestation',
      esc(e.facture.title), esc(e.facture.clientName), esc(e.facture.reference), arrondiDevise(e.montant, e.facture.currency), '', e.facture.currency, esc(e.moyen),
    ].join(';')));
    charges.forEach(c => lignes.push([
      jour(c.date), 'Dépense', c.category,
      esc(c.label), esc(c.supplier), esc(c.reference), '', c.amount, c.currency, '',
    ].join(';')));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="comptabilite-${String(req.query.periode || 'complet').replace(/[^0-9a-z-]/gi, '')}.csv"`);
    res.send('﻿' + lignes.join('\n'));   // BOM : accents corrects dans Excel
  } catch (e) { console.error('[compta.export]', e.message); res.status(500).json({ error: 'Erreur export.' }); }
});

// --- Actions en attente de validation humaine ---
app.get('/api/admin/pending-actions', auth, adminOnly, async (req, res) => {
  try {
    const list = await PendingAction.find({ userId: req.user._id, status: 'en_attente', expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 }).limit(50).lean();
    res.json({ actions: list.map(a => ({ id: String(a._id), tool: a.tool, summary: a.summary, risk: a.risk, agent: a.agent, createdAt: a.createdAt })) });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

// Confirme (et exécute) ou refuse une action préparée par un agent.
app.post('/api/admin/pending-actions/:id', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const pa = await PendingAction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!pa) return res.status(404).json({ error: 'Action introuvable.' });
    if (pa.status !== 'en_attente') return res.status(409).json({ error: `Action déjà ${pa.status}.` });
    if (pa.expiresAt < new Date()) { pa.status = 'expiree'; await pa.save(); return res.status(410).json({ error: 'Action expirée (plus de 24 h). Redemandez-la à l\'agent.' }); }

    if (req.body && req.body.decision === 'refuser') {
      pa.status = 'refusee'; await pa.save();
      return res.json({ success: true, status: 'refusee', message: 'Action annulée, rien n\'a été exécuté.' });
    }
    // Exécution réelle, avec le drapeau qui lève l'interception.
    const result = await executeAssistantTool(pa.tool, pa.input, req.user, { allowSensitive: true });
    pa.status = result && result.ok ? 'confirmee' : 'en_attente';
    pa.result = (result && result.message) || '';
    if (result && result.ok) pa.executedAt = new Date();
    await pa.save();
    res.json({ success: !!(result && result.ok), status: pa.status, message: pa.result });
  } catch (e) { console.error('[pending.confirm]', e.message); res.status(500).json({ error: 'Erreur exécution : ' + e.message }); }
});

// Purge ciblée du CRM : supprime tous les prospects SAUF les identifiants conservés.
app.post('/api/admin/leads/purge', auth, adminOnly, limitBody(20), async (req, res) => {
  try {
    const keep = Array.isArray(req.body.keepIds) ? req.body.keepIds.filter(id => /^[a-f0-9]{24}$/i.test(id)) : [];
    if (!keep.length) return res.status(400).json({ error: 'Aucun identifiant à conserver : opération refusée par sécurité.' });
    // Filet de sécurité : ne jamais supprimer une fiche rattachée à un devis ou une facture.
    const [qLeads, iLeads] = await Promise.all([Quote.distinct('leadId'), Invoice.distinct('leadId')]);
    const protectedIds = [...new Set([...keep, ...qLeads.map(String), ...iLeads.map(String)].filter(Boolean))];
    const r = await Lead.deleteMany({ _id: { $nin: protectedIds } });
    const restants = await Lead.countDocuments({});
    res.json({ success: true, supprimes: r.deletedCount, conserves: restants, protegesParDocuments: protectedIds.length - keep.length });
  } catch (e) { console.error('[leads.purge]', e.message); res.status(500).json({ error: 'Erreur purge : ' + e.message }); }
});

// Liste des agents disponibles (pour l'interface d'administration).
app.get('/api/admin/agents', auth, adminOnly, (req, res) => {
  res.json({ agents: AI.ADMIN_AGENTS.map(a => ({ id: a.id, name: a.name, icon: a.icon, tagline: a.tagline, tools: a.tools })) });
});

// ========================================================================
// === RECRUTEMENT : offres publiques et candidatures ===
// ========================================================================
const CONTRATS = { cdi: 'CDI', cdd: 'CDD', stage: 'Stage', alternance: 'Alternance', freelance: 'Freelance' };
const PRESENCE = { sur_site: 'Sur site', hybride: 'Hybride', full_remote: 'Télétravail complet' };

const candidatureLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: 'Trop de candidatures envoyées. Réessayez dans une heure.',
  keyPrefix: 'candidature',
});

// --- Page publique : liste des offres ---
app.get('/carrieres', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'publie' }).sort({ publishedAt: -1 }).lean();
    const cartes = jobs.length ? jobs.map(j => `
      <a class="jb glass glass--flat spot" href="/carrieres/${escapeHtml(j.slug)}" data-reveal>
        <div class="jb__top">
          <span class="jb__tag">${escapeHtml(CONTRATS[j.contract] || j.contract)}</span>
          ${j.department ? `<span class="jb__dep">${escapeHtml(j.department)}</span>` : ''}
        </div>
        <h3 class="jb__t">${frt(j.title)}</h3>
        ${j.excerpt ? `<p class="jb__x">${frt(j.excerpt)}</p>` : ''}
        <div class="jb__meta">
          <span>${ic('pin', 15)}${escapeHtml(j.location)}</span>
          ${PRESENCE[j.remote] ? `<span>${ic('globe', 15)}${escapeHtml(PRESENCE[j.remote])}</span>` : ''}
          ${j.experience ? `<span>${ic('briefcase', 15)}${escapeHtml(j.experience)}</span>` : ''}
        </div>
        <span class="jb__go link-arrow">Voir l’offre ${ic('arrow-right', 16)}</span>
      </a>`).join('') : `
      <div class="jb-empty glass glass--flat">
        <span class="card__icon">${ic('briefcase', 22)}</span>
        <h3>Aucun poste ouvert pour le moment</h3>
        <p>Nous n’avons pas d’offre en cours, mais nous étudions toujours les candidatures spontanées.
        Écrivez-nous à <a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a> en présentant votre profil.</p>
      </div>`;
    const bc = crumbs([{ name: 'Carrières', path: '/carrieres' }]);
    const faq = [
      ['Le télétravail est-il possible&nbsp;?', 'Oui, selon le poste. Chaque offre précise le mode : sur site, hybride ou télétravail complet. Nous travaillons déjà avec des personnes réparties sur plusieurs pays.'],
      ['Acceptez-vous les profils juniors&nbsp;?', 'Oui, quand l’offre le mentionne. Nous regardons ce que vous avez réellement construit, pas seulement les diplômes. Un portfolio ou un dépôt de code vaut mieux qu’un long CV.'],
      ['Je n’ai pas de CV formel, puis-je postuler&nbsp;?', 'Un profil LinkedIn à jour, un portfolio ou un GitHub suffisent. L’important est que nous puissions voir votre travail.'],
      ['Combien de temps conservez-vous ma candidature&nbsp;?', 'Deux ans au maximum, uniquement pour traiter votre candidature et vous recontacter si un poste correspond. Vous pouvez demander sa suppression à tout moment en écrivant à contact@pirabellabs.com.'],
      ['Recevrai-je une réponse même si c’est non&nbsp;?', 'Oui, systématiquement. Rester sans nouvelle est la pire expérience pour un candidat, et nous nous y refusons.'],
    ];

    res.send(blogShell(
      `<title>Carrières — rejoindre Pirabel Labs</title>
       <meta name="description" content="Postes ouverts chez Pirabel Labs, agence web et marketing digital à Abomey-Calavi (Bénin). Développement, marketing, design, IA.">
       <link rel="canonical" href="https://www.pirabellabs.com/carrieres">
       <meta property="og:title" content="Carrières — rejoindre Pirabel Labs"><meta property="og:type" content="website"><meta property="og:url" content="https://www.pirabellabs.com/carrieres">
       <meta property="og:description" content="Postes ouverts chez Pirabel Labs : développement, marketing, design, IA. Abomey-Calavi (Bénin), télétravail possible.">
       ${bc.ld}
       <style>
       .jb-stats{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:28px;animation:px-rise .9s var(--ease-out) .22s both;}
       .jb-st{display:flex;flex-direction:column;align-items:flex-start;gap:2px;padding:12px 18px;border-radius:var(--r-md);text-align:left;}
       .jb-st strong{font-family:var(--font-ui);font-weight:600;font-size:1rem;color:var(--text);}
       .jb-st span{font-size:.82rem;color:var(--text-3);}
       .jb-sec{padding-block:clamp(36px,5vw,64px);}
       .jb-sec .section-head{margin-bottom:clamp(24px,3vw,36px);}
       .jb-list{display:grid;gap:14px;}
       .jb{display:block;padding:clamp(20px,2.6vw,28px);border-radius:var(--r-lg);color:var(--text);transition:transform .5s var(--ease-out);}
       .jb.is-in:hover{transform:translateY(-3px);}
       .jb__top{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:10px;}
       .jb__tag{padding:5px 12px;border-radius:999px;font-family:var(--font-ui);font-size:.72rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-3);background:var(--accent-soft);box-shadow:inset 0 0 0 1px rgba(255,140,80,.3);}
       .jb__dep{font-size:.84rem;color:var(--text-3);}
       .jb__t{font-size:clamp(1.2rem,1rem + .6vw,1.45rem);margin-bottom:8px;}
       .jb__x{color:var(--text-2);line-height:1.65;margin-bottom:14px;}
       .jb__meta{display:flex;flex-wrap:wrap;gap:8px 20px;margin-bottom:14px;font-size:.86rem;color:var(--text-3);}
       .jb__meta span{display:inline-flex;align-items:center;gap:6px;}
       .jb__meta .icon{color:var(--accent-2);}
       .jb-empty{display:flex;flex-direction:column;align-items:center;gap:12px;padding:clamp(36px,5vw,56px) 24px;border-radius:var(--r-lg);text-align:center;}
       .jb-empty h3{font-size:1.3rem;}
       .jb-empty p{max-width:36rem;color:var(--text-2);line-height:1.7;}
       .jb-empty a{color:var(--accent-3);text-decoration:underline;text-underline-offset:2px;}
       .jb-card{display:flex;flex-direction:column;gap:12px;padding:clamp(22px,2.4vw,30px);border-radius:var(--r-lg);}
       .jb-card h3{font-size:var(--fs-h3);}
       .jb-card p{color:var(--text-2);font-size:.96rem;line-height:1.65;}
       .jb-card .btn{align-self:flex-start;margin-top:auto;}
       .jb-steps{display:grid;gap:12px;max-width:820px;counter-reset:s;}
       .jb-steps li{position:relative;display:flex;gap:16px;padding:18px 20px;border-radius:var(--r-md);}
       .jb-num{display:grid;place-items:center;flex-shrink:0;width:38px;height:38px;border-radius:50%;font-family:var(--font-display);font-weight:800;color:var(--accent-2);background:var(--accent-soft);box-shadow:inset 0 0 0 1px rgba(255,140,80,.4);}
       .jb-steps strong{display:block;margin:6px 0 4px;font-family:var(--font-ui);font-weight:600;font-size:1.02rem;}
       .jb-steps p{color:var(--text-2);font-size:.94rem;line-height:1.65;}
       .jb-faq{display:grid;gap:10px;max-width:880px;}
       .jb-cta{position:relative;overflow:hidden;margin-top:clamp(24px,4vw,48px);padding:clamp(36px,5vw,64px) clamp(22px,5vw,64px);border-radius:var(--r-xl);text-align:center;}
       .jb-cta h2{font-size:var(--fs-h2);}
       .jb-cta p{margin:12px auto 26px;color:var(--text-2);font-size:var(--fs-lead);}
       .jb-cta__b{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;}
       @media(max-width:520px){.jb-cta__b .btn{width:100%;}}
       </style>`,
      `<div class="px-wrap">
       <header class="px-hero">
         <p class="eyebrow">Carrières</p>
         <h1>Construire des produits qui <span class="grad">servent vraiment</span></h1>
         <p class="px-hero__lead">Pirabel Labs conçoit des sites, des applications et des automatisations pour des entreprises
         d’Afrique de l’Ouest et d’Europe. Nous cherchons des personnes rigoureuses et autonomes, qui
         préfèrent livrer une chose solide plutôt que beaucoup de choses à moitié.</p>
         <div class="jb-stats">
           <div class="jb-st glass glass--flat"><strong>Abomey-Calavi</strong><span>Bénin, avec télétravail possible</span></div>
           <div class="jb-st glass glass--flat"><strong>Web, IA, marketing</strong><span>Nos trois domaines</span></div>
           <div class="jb-st glass glass--flat"><strong>7 jours ouvrés</strong><span>Notre délai de réponse</span></div>
         </div>
       </header>

       <section class="jb-sec" aria-labelledby="jbIci">
         <div class="section-head"><p class="eyebrow">Culture</p><h2 id="jbIci">Travailler ici</h2></div>
         <div class="grid grid--3" data-stagger>
           <div class="jb-card glass glass--flat spot" data-reveal>
             <span class="card__icon">${ic('target', 20)}</span>
             <h3>Vous voyez le résultat</h3>
             <p>Nous sommes une structure courte. Ce que vous produisez part en production et sert de vrais
             clients, souvent en quelques semaines. Pas de travail qui dort dans un tiroir.</p>
           </div>
           <div class="jb-card glass glass--flat spot" data-reveal>
             <span class="card__icon">${ic('book', 20)}</span>
             <h3>On apprend en construisant</h3>
             <p>Next.js, automatisation, agents IA, référencement : les sujets sont variés et les outils
             récents. Vous montez en compétence sur des projets réels, pas sur des exercices.</p>
           </div>
           <div class="jb-card glass glass--flat spot" data-reveal>
             <span class="card__icon">${ic('handshake', 20)}</span>
             <h3>Un cadre franc</h3>
             <p>Objectifs clairs, retours directs, pas de réunions inutiles. On dit ce qui va et ce qui ne va
             pas, dans les deux sens.</p>
           </div>
         </div>
       </section>

       <section class="jb-sec" id="offres" aria-labelledby="jbOffres">
         <div class="section-head"><p class="eyebrow">Recrutement</p><h2 id="jbOffres">Nos postes ouverts</h2></div>
         <div class="jb-list" data-stagger>${cartes}</div>
       </section>

       <section class="jb-sec" aria-labelledby="jbProcess">
         <div class="section-head"><p class="eyebrow">Processus</p><h2 id="jbProcess">Comment se passe le recrutement</h2>
         <p>Cinq étapes, sans zone d’ombre. Vous savez à chaque instant où vous en êtes,
         et vous recevez une réponse même en cas de refus.</p></div>
         <ol class="jb-steps" data-stagger>
           <li class="glass glass--flat" data-reveal><span class="jb-num">1</span><div><strong>Votre candidature</strong>
             <p>Vous remplissez le formulaire de l’offre avec le lien vers votre CV. Vous recevez
             immédiatement un accusé de réception par e-mail.</p></div></li>
           <li class="glass glass--flat" data-reveal><span class="jb-num">2</span><div><strong>Examen du dossier, sous 7 jours ouvrés</strong>
             <p>Nous lisons chaque candidature. Si votre profil correspond, nous passons à l’étape
             suivante ; sinon, vous recevez une réponse claire plutôt qu’un silence.</p></div></li>
           <li class="glass glass--flat" data-reveal><span class="jb-num">3</span><div><strong>Premier échange de 30 minutes</strong>
             <p>Une visio pour faire connaissance, comprendre votre parcours et répondre à vos questions
             sur le poste, le rythme et la rémunération.</p></div></li>
           <li class="glass glass--flat" data-reveal><span class="jb-num">4</span><div><strong>Mise en situation</strong>
             <p>Un exercice court et concret, proche de ce que vous feriez réellement. Il reste
             raisonnable en temps : nous ne demandons pas de travail gratuit déguisé.</p></div></li>
           <li class="glass glass--flat" data-reveal><span class="jb-num">5</span><div><strong>Décision et intégration</strong>
             <p>Retour sous 5 jours ouvrés. Si c’est un oui, nous convenons ensemble de la date de
             démarrage et des modalités.</p></div></li>
         </ol>
       </section>

       <section class="jb-sec" aria-labelledby="jbPostuler">
         <div class="section-head"><p class="eyebrow">Candidater</p><h2 id="jbPostuler">Postuler</h2></div>
         <div class="grid grid--2">
           <div class="jb-card glass glass--flat">
             <h3>À un poste ouvert</h3>
             <p>Ouvrez l’offre qui vous intéresse et remplissez le formulaire en bas de page. Prévoyez un
             lien vers votre CV : Google Drive, Dropbox, LinkedIn ou tout lien consultable.
             Nous ne stockons aucun fichier sur nos serveurs.</p>
             <a class="btn btn--primary" href="#offres">Voir les offres</a>
           </div>
           <div class="jb-card glass glass--flat">
             <h3>Candidature spontanée</h3>
             <p>Aucune offre ne correspond, mais vous pensez avoir votre place ici&nbsp;? Écrivez-nous en
             présentant ce que vous savez faire et ce que vous cherchez. Nous lisons tout, et nous
             gardons les profils qui nous marquent.</p>
             <a class="btn btn--glass" href="mailto:contact@pirabellabs.com?subject=Candidature%20spontan%C3%A9e">${ic('mail', 18)} Nous écrire</a>
           </div>
         </div>
       </section>

       <section class="jb-sec" aria-labelledby="jbFaq">
         <div class="section-head"><p class="eyebrow">FAQ</p><h2 id="jbFaq">Questions fréquentes</h2></div>
         <div class="jb-faq">
           ${faq.map(f => `<details class="faq__item glass glass--flat"><summary>${f[0]}<span class="faq__icon" aria-hidden="true">${ic('plus', 16)}</span></summary><p class="faq__a">${f[1]}</p></details>`).join('')}
         </div>
       </section>

       <section class="jb-cta glass glass--tint spot" data-reveal="scale" aria-labelledby="jbCta"><div class="sf-cta__glow" aria-hidden="true"></div>
         <p class="eyebrow">Réponse sous 24&nbsp;h ouvrées</p>
         <h2 id="jbCta">Une question avant de postuler&nbsp;?</h2>
         <p>Écrivez-nous, nous répondons sous 24&nbsp;h ouvrées.</p>
         <div class="jb-cta__b">
           <a class="btn btn--primary btn--lg" href="mailto:contact@pirabellabs.com">${ic('mail', 18)} contact@pirabellabs.com</a>
           <a class="btn btn--glass btn--lg" href="https://wa.me/33757751778" target="_blank" rel="noopener">${ic('whatsapp', 18)} WhatsApp</a>
         </div>
       </section>
       </div>`,
      { current: '/carrieres', showCta: false }
    ));
  } catch (e) { console.error('[carrieres]', e.message); res.status(500).send('Erreur serveur.'); }
});

// --- Page publique : detail d'une offre + formulaire ---
app.get('/carrieres/:slug', async (req, res) => {
  try {
    const j = await Job.findOne({ slug: sanitize(req.params.slug, 200), status: 'publie' }).lean();
    if (!j) return res.redirect('/carrieres');

    const liste = (titre, items) => (items && items.length) ? `
      <h2>${titre}</h2><ul class="jd-list">${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>` : '';
    const bc = crumbs([{ name: 'Carrières', path: '/carrieres' }, { name: j.title, path: '/carrieres/' + j.slug }]);

    res.send(blogShell(
      `<title>${escapeHtml(j.title)} — Carrières Pirabel Labs</title>
       <meta name="description" content="${escapeHtml((j.excerpt || j.title).slice(0, 155))}">
       <link rel="canonical" href="https://www.pirabellabs.com/carrieres/${escapeHtml(j.slug)}">
       <meta property="og:title" content="${escapeHtml(j.title)} — Carrières Pirabel Labs"><meta property="og:type" content="website"><meta property="og:url" content="https://www.pirabellabs.com/carrieres/${escapeHtml(j.slug)}">
       ${bc.ld}
       <style>
       .jd{max-width:820px;margin-inline:auto;}
       .jd h1{margin:14px 0 18px;font-family:var(--font-display);font-weight:800;font-size:clamp(1.85rem,1.1rem + 2.2vw,2.9rem);line-height:1.08;letter-spacing:-.03em;}
       .jd__meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:clamp(24px,3vw,36px);}
       .jd__m{padding:7px 14px;border-radius:999px;font-family:var(--font-ui);font-size:.84rem;color:var(--text-2);background:rgba(var(--ink),.05);box-shadow:inset 0 0 0 1px rgba(var(--ink),.12);}
       .jd__m--c{color:var(--accent-3);background:var(--accent-soft);box-shadow:inset 0 0 0 1px rgba(255,140,80,.3);font-weight:600;}
       .jd__body{font-size:1.05rem;line-height:1.75;color:rgba(var(--text-rgb),.86);}
       .jd__body h2{margin:2em 0 .7em;font-size:clamp(1.25rem,1.05rem + .7vw,1.5rem);color:var(--text);}
       .jd__body h3{margin:1.6em 0 .5em;font-size:1.15rem;color:var(--text);}
       .jd__body p{margin:0 0 1em;}
       .jd__body strong{color:var(--text);}
       .jd__body a{color:var(--accent-3);text-decoration:underline;text-underline-offset:3px;}
       .jd__body ul:not(.jd-list),.jd__body ol{margin:0 0 1em;padding-left:1.3em;list-style:disc;}
       .jd-list{display:grid;gap:8px;margin:0 0 1em;}
       .jd-list li{position:relative;padding-left:22px;}
       .jd-list li::before{content:"";position:absolute;left:2px;top:.72em;width:7px;height:7px;border-radius:50%;background:var(--accent);}
       .jf{display:grid;gap:16px;margin-top:clamp(36px,5vw,56px);padding:clamp(22px,3.5vw,36px);border-radius:var(--r-xl);background:var(--panel-bg);scroll-margin-top:96px;}
       .jf>h2{font-size:clamp(1.4rem,1.1rem + 1vw,1.85rem);}
       .jf form{display:grid;gap:16px;}
       .jf .btn{justify-self:start;}
       @media(max-width:520px){.jf .btn{width:100%;}}
       </style>`,
      `<div class="px-wrap">${bc.html}
      <article class="jd">
        <p class="eyebrow">Offre d’emploi</p>
        <h1>${frt(j.title)}</h1>
        <div class="jd__meta">
          <span class="jd__m jd__m--c">${escapeHtml(CONTRATS[j.contract] || j.contract)}</span>
          <span class="jd__m">${escapeHtml(j.location)}</span>
          ${PRESENCE[j.remote] ? `<span class="jd__m">${escapeHtml(PRESENCE[j.remote])}</span>` : ''}
          ${j.experience ? `<span class="jd__m">${escapeHtml(j.experience)}</span>` : ''}
          ${j.salary ? `<span class="jd__m">${escapeHtml(j.salary)}</span>` : ''}
        </div>
        <div class="jd__body">
        ${j.content ? themeContent(sanitizeSoft(j.content, 40000)) : (j.excerpt ? `<p>${escapeHtml(j.excerpt)}</p>` : '')}
        ${liste('Vos missions', j.missions)}
        ${liste('Le profil que nous cherchons', j.profile)}
        ${liste('Ce que nous offrons', j.advantages)}
        </div>

        <section class="jf glass" id="postuler" aria-labelledby="jfTitle">
          <h2 id="jfTitle">Postuler</h2>
          <div class="px-msg" id="jfMsg" role="status" aria-live="polite"></div>
          <form id="jfForm">
            <div class="px-grid2">
              <div class="px-field"><label for="nom">Nom complet <span aria-hidden="true">*</span></label><input id="nom" required maxlength="120" autocomplete="name"></div>
              <div class="px-field"><label for="mail">E-mail <span aria-hidden="true">*</span></label><input id="mail" type="email" required maxlength="200" autocomplete="email"></div>
            </div>
            <div class="px-grid2">
              <div class="px-field"><label for="tel">Téléphone ou WhatsApp</label><input id="tel" type="tel" maxlength="30" autocomplete="tel"></div>
              <div class="px-field"><label for="ville">Ville</label><input id="ville" maxlength="120" autocomplete="address-level2"></div>
            </div>
            <div class="px-field"><label for="cv">Lien vers votre CV <span aria-hidden="true">*</span></label>
              <input id="cv" required maxlength="500" placeholder="https://drive.google.com/…" aria-describedby="cvHint">
              <span class="px-hint" id="cvHint">Google Drive, Dropbox, LinkedIn ou tout lien consultable. Nous ne stockons aucun fichier.</span></div>
            <div class="px-grid2">
              <div class="px-field"><label for="li">LinkedIn</label><input id="li" maxlength="300" placeholder="https://linkedin.com/in/…"></div>
              <div class="px-field"><label for="pf">Portfolio ou GitHub</label><input id="pf" maxlength="300"></div>
            </div>
            <div class="px-field"><label for="lm">Pourquoi vous&nbsp;? <span aria-hidden="true">*</span></label>
              <textarea id="lm" required maxlength="6000" placeholder="Parlez-nous de votre parcours et de ce qui vous attire dans ce poste."></textarea></div>
            <button class="btn btn--primary btn--lg" type="submit" id="jfBtn">Envoyer ma candidature</button>
            <p class="px-hint">Vos données servent uniquement à traiter votre candidature et sont conservées 2&nbsp;ans maximum. Vous pouvez demander leur suppression à tout moment.</p>
          </form>
        </section>
      </article>
      </div>
      <script>
      document.getElementById('jfForm').addEventListener('submit', async function(e){
        e.preventDefault();
        var b=document.getElementById('jfBtn'), m=document.getElementById('jfMsg');
        b.disabled=true; b.textContent='Envoi…';
        try{
          var r=await fetch('/api/candidatures',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
            jobSlug:${jsStr(j.slug)},
            name:document.getElementById('nom').value, email:document.getElementById('mail').value,
            phone:document.getElementById('tel').value, city:document.getElementById('ville').value,
            cvUrl:document.getElementById('cv').value, linkedin:document.getElementById('li').value,
            portfolio:document.getElementById('pf').value, coverLetter:document.getElementById('lm').value
          })});
          var d=await r.json();
          if(!r.ok) throw new Error(d.error||'Erreur');
          m.className='px-msg is-ok'; m.textContent=d.message||'Candidature envoyée.';
          document.getElementById('jfForm').reset();
        }catch(err){ m.className='px-msg is-err'; m.textContent=(err&&err.message)||'Envoi impossible.'; }
        m.scrollIntoView({behavior:'smooth',block:'center'});
        b.disabled=false; b.textContent='Envoyer ma candidature';
      });
      </script>`,
      { current: '/carrieres', showCta: false }
    ));
  } catch (e) { console.error('[carrieres.detail]', e.message); res.status(500).send('Erreur serveur.'); }
});

// --- Depot d'une candidature ---
app.post('/api/candidatures', candidatureLimiter, limitBody(20), async (req, res) => {
  try {
    const job = await Job.findOne({ slug: sanitize(req.body.jobSlug || '', 200), status: 'publie' });
    if (!job) return res.status(404).json({ error: 'Cette offre n’est plus disponible.' });

    const name = sanitize(req.body.name || '', 120);
    const email = sanitizeEmail(req.body.email || '');
    const cvUrl = sanitize(req.body.cvUrl || '', 500);
    const coverLetter = sanitize(req.body.coverLetter || '', 6000);
    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom requis.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Adresse e-mail invalide.' });
    if (!/^https?:\/\//i.test(cvUrl)) return res.status(400).json({ error: 'Le lien vers votre CV doit commencer par http:// ou https://' });
    if (coverLetter.length < 30) return res.status(400).json({ error: 'Merci de détailler un peu votre motivation (30 caractères minimum).' });

    const dejaCandidat = await Application.findOne({ jobId: job._id, email });
    if (dejaCandidat) return res.status(409).json({ error: 'Vous avez déjà postulé à cette offre. Nous revenons vers vous rapidement.' });

    const app_ = await Application.create({
      jobId: job._id, jobTitle: job.title,
      name, email, cvUrl, coverLetter,
      phone: sanitize(req.body.phone || '', 30), city: sanitize(req.body.city || '', 120),
      linkedin: sanitize(req.body.linkedin || '', 300), portfolio: sanitize(req.body.portfolio || '', 300),
      ipHash: crypto.createHash('sha256').update((req.ip || '') + (process.env.JWT_SECRET || '')).digest('hex').slice(0, 32),
    });
    await Job.updateOne({ _id: job._id }, { $inc: { applicationsCount: 1 } });

    // Ayaba evalue la candidature avant que l'equipe ne la lise.
    await analyserCandidature(app_, job).catch(e => console.error('[candidature.ia]', e.message));

    await sendEmail(process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      `[Recrutement] ${name} — ${job.title}${app_.aiFit ? ` [${app_.aiFit}/100]` : ''}`,
      newApplicationAdminEmail({
        name, email, phone: app_.phone, linkedin: app_.linkedin, portfolio: app_.portfolio,
        cvUrl, cvFilename: 'Voir le CV',
        coverLetter: coverLetter + (app_.aiSummary ? `\n\n— Analyse d'Ayaba —\n${app_.aiSummary}` : ''),
      }, { title: job.title }), { replyTo: email }
    ).catch(e => console.error('[candidature] mail admin:', e.message));

    await sendEmail(email, `Candidature reçue — ${job.title} | Pirabel Labs`,
      applicationConfirmationEmail(name, job.title)
    ).catch(e => console.error('[candidature] mail candidat:', e.message));

    res.json({ success: true, message: 'Candidature envoyée. Nous revenons vers vous sous 7 jours ouvrés.' });
  } catch (e) { console.error('[candidatures]', e.message); res.status(500).json({ error: 'Erreur serveur.' }); }
});

// Evaluation d'une candidature par Ayaba : synthese et adequation au poste.
async function analyserCandidature(cand, job) {
  const apiKey = await getOpenRouterKey();
  if (!apiKey) return;
  const system = `Tu es Ayaba, assistante de Pirabel Labs (agence web et marketing, Benin).
Tu evalues une candidature. Reponds UNIQUEMENT par un objet JSON valide :
{"resume":"3 phrases : qui est ce candidat et ce qu'il apporte","adequation":0,
"points_forts":"ce qui correspond vraiment au poste","reserves":"ce qui manque ou interroge"}
adequation : entier de 0 a 100 mesurant la correspondance au poste decrit.
Sois honnete et exigeant : un candidat hors sujet doit avoir une note basse. N'invente
aucune experience non mentionnee. Francais impeccable, sans caractere de mise en forme.`;
  const contenu = `POSTE : ${job.title}\n${job.excerpt || ''}\n` +
    (job.profile && job.profile.length ? `Profil recherche : ${job.profile.join(' ; ')}\n` : '') +
    `\nCANDIDAT : ${cand.name}\nVille : ${cand.city || 'non précisée'}\n` +
    `CV : ${cand.cvUrl}\nLinkedIn : ${cand.linkedin || 'non fourni'}\nPortfolio : ${cand.portfolio || 'non fourni'}\n` +
    `\nMotivation :\n${cand.coverLetter}`;

  const { ok, data } = await AI.callOpenRouter({
    apiKey, model: AI.MODEL_FAST,
    messages: [{ role: 'system', content: system }, { role: 'user', content: contenu }],
    maxTokens: 600, temperature: 0.3, timeoutMs: 18000,
  });
  if (!ok) return;
  const raw = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return;
  let a; try { a = JSON.parse(m[0]); } catch (e) { return; }
  cand.aiSummary = sanitize(a.resume || '', 1500);
  cand.aiFit = Math.max(0, Math.min(100, parseInt(a.adequation, 10) || 0));
  cand.aiStrengths = sanitize(a.points_forts || '', 600);
  cand.aiConcerns = sanitize(a.reserves || '', 600);
  cand.aiProcessedAt = new Date();
  await cand.save();
}

// ========================================================================
// === ESPACE CLIENT (connexion par lien magique, sans mot de passe) ===
// ========================================================================
const CLIENT_COOKIE = 'pl_client';
const clientLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 8,
  message: 'Trop de demandes de connexion. Réessayez dans 15 minutes.',
  keyPrefix: 'client-login',
});

// Middleware : identifie le client à partir du cookie signé.
async function clientAuth(req, res, next) {
  try {
    const token = (req.cookies && req.cookies[CLIENT_COOKIE]) || '';
    if (!token) return res.status(401).json({ error: 'NON_CONNECTE' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || payload.kind !== 'client') return res.status(401).json({ error: 'NON_CONNECTE' });
    const lead = await Lead.findById(payload.sub);
    if (!lead) return res.status(401).json({ error: 'NON_CONNECTE' });
    req.client = lead;
    next();
  } catch (e) { return res.status(401).json({ error: 'NON_CONNECTE' }); }
}

// 1) Demande de lien magique. Réponse volontairement identique que le compte
//    existe ou non : on n'indique jamais si une adresse est cliente.
app.post('/api/client/login', clientLoginLimiter, limitBody(5), async (req, res) => {
  const generique = { success: true, message: "Si cette adresse correspond à un espace client, un lien de connexion vient d'être envoyé." };
  try {
    const email = sanitizeEmail(req.body && req.body.email || '');
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Adresse e-mail invalide.' });
    const lead = await Lead.findOne({ email });
    // Seuls les clients (ou les fiches explicitement autorisées) ont un espace.
    if (!lead || !(lead.stage === 'client' || lead.portalEnabled)) return res.json(generique);

    const token = generateToken();
    lead.portalToken = token;
    lead.portalTokenExpires = new Date(Date.now() + 30 * 60 * 1000);
    await lead.save();

    const url = `https://www.pirabellabs.com/espace-client/connexion/${token}`;
    await sendEmail(lead.email, 'Votre lien de connexion — Espace client Pirabel Labs',
      masterTemplate({
        headerType: 'hero', preheader: 'Votre lien de connexion sécurisé',
        title: 'Bonjour ' + escapeHtml((lead.name || '').split(' ')[0]) + ',',
        subtitle: 'Accès à votre espace client',
        body: "<p style=\"font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);\">Voici votre lien de connexion personnel. Il est valable <strong style=\"color:#e5e2e1;\">30 minutes</strong> et ne fonctionne qu'une seule fois.</p>" +
          "<p style=\"font-size:14px;color:rgba(229,226,225,0.5);\">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail : votre espace reste protégé.</p>",
        cta: 'Ouvrir mon espace client', ctaUrl: url,
      })
    ).catch(e => console.error('[client.login] mail:', e.message));
    res.json(generique);
  } catch (e) { console.error('[client.login]', e.message); res.json(generique); }
});

// 2) Validation du lien : consomme le jeton et pose le cookie de session (7 jours).
app.get('/espace-client/connexion/:token', async (req, res) => {
  try {
    const lead = await Lead.findOne({ portalToken: String(req.params.token || '').slice(0, 100) });
    if (!lead || !lead.portalTokenExpires || lead.portalTokenExpires < new Date()) {
      return res.redirect('/espace-client?erreur=lien_expire');
    }
    lead.portalToken = undefined;          // usage unique
    lead.portalTokenExpires = undefined;
    lead.portalLastLoginAt = new Date();
    await lead.save();

    const jwtToken = jwt.sign({ sub: String(lead._id), kind: 'client' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie(CLIENT_COOKIE, jwtToken, {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 3600 * 1000, path: '/',
    });
    res.redirect('/espace-client');
  } catch (e) { console.error('[client.auth]', e.message); res.redirect('/espace-client?erreur=technique'); }
});

app.post('/api/client/logout', (req, res) => {
  res.clearCookie(CLIENT_COOKIE, { path: '/' });
  res.json({ success: true });
});

// 3) Toutes les données de l'espace client en un appel.
app.get('/api/client/me', clientAuth, async (req, res) => {
  try {
    const lead = req.client;
    const [projects, quotes, invoices, messages, appointments] = await Promise.all([
      Project.find({ leadId: lead._id }).sort({ createdAt: -1 }).lean(),
      Quote.find({ leadId: lead._id, status: { $ne: 'brouillon' } }).sort({ createdAt: -1 })
        .select('reference title total currency status validUntil issuedAt publicToken publicSlug').lean(),
      Invoice.find({ leadId: lead._id, status: { $ne: 'brouillon' } }).sort({ createdAt: -1 })
        .select('reference title total currency status dueDate issuedAt paidAt paymentMethod payments updatedAt publicToken').lean(),
      ClientMessage.find({ leadId: lead._id }).sort({ createdAt: 1 }).limit(200).lean(),
      Appointment.find({ email: lead.email, status: { $in: ['demande', 'confirme'] } }).sort({ createdAt: -1 }).limit(10)
        .select('preferredDate preferredTime channel status subject').lean(),
    ]);

    // Comptabilite : synthese des montants, par devise (jamais additionner des devises differentes).
    // Les factures annulées ne sont ni dues ni facturées ; « payé » et « dû » viennent
    // des paiements réellement enregistrés (acomptes compris).
    const parDevise = {};
    invoices.forEach(i => {
      if (i.status === 'annulee') return;
      const d = i.currency || 'EUR';
      parDevise[d] = parDevise[d] || { facture: 0, paye: 0, du: 0, facturesDues: 0 };
      parDevise[d].facture += i.total;
      parDevise[d].paye += Invoice.amountPaidOf(i);
      const reste = Invoice.balanceOf(i);
      parDevise[d].du += reste;
      if (reste > 0) parDevise[d].facturesDues++;
    });
    Object.entries(parDevise).forEach(([d, v]) => {
      v.facture = arrondiDevise(v.facture, d);
      v.paye = arrondiDevise(v.paye, d);
      v.du = arrondiDevise(v.du, d);
    });

    // Marque les messages de l'equipe comme lus par le client.
    await ClientMessage.updateMany({ leadId: lead._id, from: 'equipe', readByClient: false }, { $set: { readByClient: true } });

    res.json({
      client: { nom: lead.name, email: lead.email, entreprise: lead.company || '', depuis: lead.clientData?.becameClientAt || lead.createdAt },
      projets: projects.map(p => ({
        id: String(p._id), titre: p.title, description: p.description, service: p.service,
        statut: p.status, etapes: p.steps, progression: p.progress,
        debut: p.startedAt, echeance: p.dueDate, livre: p.deliveredAt,
        previewUrl: p.previewUrl || '', liveUrl: p.liveUrl || '',
      })),
      devis: quotes.map(q => ({ ref: q.reference, titre: q.title, montant: q.total, devise: q.currency, statut: statutDevisEffectif(q), valideJusqu: q.validUntil, lien: '/devis/' + (q.publicSlug || q.publicToken) })),
      factures: invoices.map(i => ({
        ref: i.reference, titre: i.title, montant: i.total, devise: i.currency, statut: Invoice.effectiveStatus(i),
        paye: Invoice.amountPaidOf(i), reste: Invoice.balanceOf(i), echeance: i.dueDate, payeeLe: i.paidAt,
        paiements: i.status === 'annulee' ? [] : Invoice.paymentsOf(i).map(p => ({ montant: p.amount, le: p.date })),
        lien: '/facture/' + i.publicToken,
      })),
      messages: messages.map(m => ({ de: m.from, auteur: m.authorName, contenu: m.content, le: m.createdAt })),
      rendezVous: appointments.map(a => ({ date: a.preferredDate, heure: a.preferredTime, canal: a.channel, statut: a.status, objet: a.subject })),
      comptabilite: parDevise,
    });
  } catch (e) { console.error('[client.me]', e.message); res.status(500).json({ error: 'Erreur de chargement.' }); }
});

// 4) Le client écrit à l'équipe.
app.post('/api/client/message', clientAuth, limitBody(10), async (req, res) => {
  try {
    const content = sanitize(req.body && req.body.content || '', 5000);
    if (!content || content.trim().length < 2) return res.status(400).json({ error: 'Message vide.' });
    const lead = req.client;
    await ClientMessage.create({ leadId: lead._id, from: 'client', authorName: lead.name, content });
    await sendEmail(process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      `[Espace client] Nouveau message de ${lead.name}`,
      masterTemplate({
        title: 'Message depuis l\'espace client',
        body: `<p><strong>${escapeHtml(lead.name)}</strong> (${escapeHtml(lead.email)}) vous a écrit :</p>` +
          `<div style="border-left:3px solid #FF5500;padding:14px 18px;background:#0e0e0e;color:rgba(229,226,225,0.85);white-space:pre-wrap;">${escapeHtml(content)}</div>`,
        cta: 'Répondre dans l\'admin', ctaUrl: 'https://www.pirabellabs.com/admin/dashboard',
      })
    ).catch(e => console.error('[client.message] mail:', e.message));
    res.json({ success: true });
  } catch (e) { console.error('[client.message]', e.message); res.status(500).json({ error: 'Erreur envoi.' }); }
});

// 5) Page de l'espace client (login + tableau de bord dans une seule vue).
app.get('/espace-client', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app', 'views', 'client-portal.html'));
});

// ========================================================================
// === CHATBOT PUBLIC (agent « assistant client ») ===
// ========================================================================
// Sans authentification : limité en débit, sans accès aux données internes.
// L'agent ne dispose que de deux outils d'écriture (prospect + rendez-vous).
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, max: 40,
  message: 'Trop de messages. Merci de patienter quelques minutes ou de nous écrire à contact@pirabellabs.com.',
  keyPrefix: 'chat-public',
});

app.post('/api/chat', chatLimiter, limitBody(40), async (req, res) => {
  try {
    const apiKey = await getOpenRouterKey();
    const groqKey = process.env.GROQ_API_KEY || await getSetting('groqApiKey');
    if (!apiKey && !groqKey) return res.status(503).json({ error: 'NO_KEY', reply: "L'assistant n'est pas disponible pour le moment. Écrivez-nous à contact@pirabellabs.com, nous répondons vite." });

    const agent = AI.PUBLIC_AGENT;
    // Historique volontairement court : chaque message renvoie tout le contexte au modèle.
    const incoming = Array.isArray(req.body.messages) ? req.body.messages : [];
    const history = incoming
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content.slice(0, 1200) }));
    if (!history.length || history[history.length - 1].role !== 'user') return res.status(400).json({ error: 'Message requis.' });

    const model = process.env.OPENROUTER_MODEL_PUBLIC || agent.model;
    const tools = assistantToolsOpenAI(agent.tools);
    const convo = [{ role: 'system', content: AI.buildSystemPrompt(agent, null, { page: typeof req.body.page === 'string' ? req.body.page : '' }) }].concat(history);
    let finalText = '';
    let captured = false;

    // Boucle courte : le chatbot doit répondre vite (2 tours d'outils maximum).
    // Fournisseur : OpenRouter, puis Groq en relais si OpenRouter refuse (crédit épuisé, surcharge, panne).
    let useGroq = !apiKey;
    const groqModel = process.env.GROQ_MODEL || (await getSetting('groqModel')) || 'llama-3.3-70b-versatile';
    const ask = () => useGroq
      ? AI.callGroq({ apiKey: groqKey, model: groqModel, messages: convo, tools, maxTokens: 400, temperature: 0.6, timeoutMs: 15000 })
      : AI.callOpenRouter({ apiKey, model, messages: convo, tools, maxTokens: 400, temperature: 0.6, timeoutMs: 18000 });
    for (let turn = 0; turn < 3; turn++) {
      let { ok, status, data } = await ask().catch((e) => ({ ok: false, status: 0, data: { error: e.name } }));
      if (!ok && !useGroq && groqKey && [0, 402, 408, 429, 500, 502, 503, 504].includes(status)) {
        console.error('[chat.public] OpenRouter', status, '→ relais Groq');
        useGroq = true;
        ({ ok, status, data } = await ask().catch((e) => ({ ok: false, status: 0, data: { error: e.name } })));
      }
      if (!ok) {
        console.error('[chat.public]', status, JSON.stringify(data).slice(0, 200));
        return res.status(200).json({ reply: "Je rencontre un souci technique. Écrivez-nous directement à contact@pirabellabs.com ou sur WhatsApp, l'équipe vous répondra rapidement." });
      }
      const msg = (data.choices && data.choices[0] && data.choices[0].message) || {};
      if (msg.content) finalText = String(msg.content).trim();
      const toolCalls = msg.tool_calls || [];
      if (!toolCalls.length) break;
      convo.push(msg);
      for (const tc of toolCalls) {
        let input = {};
        try { input = JSON.parse((tc.function && tc.function.arguments) || '{}'); } catch (e) {}
        const toolName = (tc.function && tc.function.name) || '';
        if (!agent.tools.includes(toolName)) { convo.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify({ ok: false, message: 'Outil non autorisé.' }) }); continue; }
        const result = await executeAssistantTool(toolName, input, { _id: null });
        if (result && result.ok) captured = true;
        convo.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
      }
    }
    const reply = finalText || "Pouvez-vous préciser votre besoin ?";

    // Persiste la conversation pour que l'équipe la retrouve dans l'admin.
    try {
      const key = sanitize(req.body.sessionKey || '', 64);
      if (key) {
        const full = history.concat([{ role: 'assistant', content: reply }]);
        const session = await ChatSession.findOneAndUpdate(
          { sessionKey: key },
          {
            $set: {
              messages: full.map(m => ({ role: m.role, content: m.content })),
              pageOrigine: sanitize(req.body.page || '', 300),
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true, new: true }
        );
        if (captured && !session.capturedContact) {
          session.capturedContact = true;
          // Retrouve la fiche créée à l'instant par l'outil pour la relier.
          const recent = await Lead.findOne({ source: 'chatbot_ia' }).sort({ createdAt: -1 });
          if (recent) { session.leadId = recent._id; session.visitorName = recent.name; session.visitorEmail = recent.email; }
          await session.save();
        }
        // Analyse : au moment où le contact est capté, ou après un échange déjà nourri.
        if (!session.analyzedAt && (captured || full.length >= 6)) {
          await analyserConversation(session, apiKey).catch(e => console.error('[chat.analyse]', e.message));
        }
      }
    } catch (e) { console.error('[chat.persist]', e.message); }

    res.json({ reply, captured });
  } catch (e) {
    console.error('[chat.public]', e.message);
    res.status(200).json({ reply: "Je rencontre un souci technique. Écrivez-nous à contact@pirabellabs.com, l'équipe vous répondra rapidement." });
  }
});

// Traitement automatique d'une demande reçue par formulaire : Ayaba qualifie le
// prospect et prépare une réponse personnalisée, mise en attente de validation.
// Appel unique sur le modèle rapide pour ne pas ralentir l'envoi du formulaire.
async function traiterFormulaire(lead) {
  const apiKey = await getOpenRouterKey();
  if (!apiKey) return;

  const system = `Tu es Ayaba, assistante de Pirabel Labs (agence web et marketing digital, Abomey-Calavi, Benin).
Une demande vient d'arriver par le formulaire du site. Tu la qualifies et tu prepares la reponse.

Reponds UNIQUEMENT par un objet JSON valide, sans texte autour :
{"resume":"2 phrases : ce que veut ce prospect et ce qui compte pour lui",
"qualification":"chaud|tiede|froid","score":0,
"prochaine_action":"l'action concrete que l'equipe doit mener ensuite",
"objet":"objet de l'e-mail de réponse","reponse":"le corps de l'e-mail"}

Regles pour le corps de la reponse :
- Ne commence pas par « Bonjour X » : la formule d'appel est ajoutee automatiquement.
- Montre que tu as VRAIMENT lu sa demande : reprends son projet avec ses mots a lui.
- Apporte un element utile des maintenant (un conseil, une question de cadrage pertinente).
- N'annonce JAMAIS de prix. Le devis est gratuit et etabli sous 48 h apres un echange.
- Propose un rendez-vous avec le lien https://www.pirabellabs.com/rdv
- Termine par la signature : « Bien cordialement, L’équipe Pirabel Labs ». Ne nomme jamais une personne de l’agence ; si quelqu’un doit recontacter le prospect, écris « un membre de notre équipe ».
- Francais impeccable, ton professionnel et chaleureux, sans flatterie ni exageration.
- N'invente aucune reference client, aucun chiffre, aucun delai que tu ne peux tenir.

Qualification : chaud = projet precis avec budget ou echeance claire. tiede = besoin
identifiable mais flou. froid = demande vague, hors sujet, ou candidature spontanee.`;

  const demande = `Nom : ${lead.name}\nEntreprise : ${lead.company || 'non précisée'}\n` +
    `E-mail : ${lead.email}\nTéléphone : ${lead.phone || 'non précisé'}\n` +
    `Service demande : ${lead.service}\n\nMessage :\n${lead.message}`;

  const { ok, data } = await AI.callOpenRouter({
    apiKey, model: AI.MODEL_FAST,
    messages: [{ role: 'system', content: system }, { role: 'user', content: demande }],
    maxTokens: 1400, temperature: 0.4, timeoutMs: 20000,
  });
  if (!ok) return;
  const raw = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return;
  let a; try { a = JSON.parse(m[0]); } catch (e) { return; }

  lead.aiQualification = ['chaud', 'tiede', 'froid'].includes(a.qualification) ? a.qualification : 'non_evalue';
  lead.aiScore = Math.max(0, Math.min(100, parseInt(a.score, 10) || 0));
  lead.aiSummary = sanitize(a.resume || '', 1500);
  lead.aiNextAction = sanitize(a.prochaine_action || '', 400);
  lead.aiProcessedAt = new Date();
  await lead.save();

  // La réponse rédigée n'est jamais envoyée seule : elle attend la validation.
  // Le message du prospect est non fiable (injection de prompt possible) : on retire du
  // brouillon tout lien qui ne pointe pas vers nos propres domaines.
  if (a.reponse) {
    a.reponse = String(a.reponse).replace(/\bhttps?:\/\/[^\s<>"')]+/gi, (u) =>
      /^https?:\/\/((www\.)?pirabellabs\.com|wa\.me)(\/|$)/i.test(u) ? u : '[lien retiré]');
  }
  if (a.reponse && a.objet) {
    const admin = await User.findOne({ role: 'admin' }).select('_id').lean();
    if (admin) {
      await PendingAction.create({
        userId: admin._id, agent: 'commercial', tool: 'envoyer_email',
        input: { email: lead.email, subject: sanitize(a.objet, 200), message: sanitize(a.reponse, 5000) },
        summary: `Répondre à ${lead.name} (${lead.service}) — « ${sanitize(a.objet, 90)} »`,
        risk: 'eleve',
      });
    }
  }
}

// Analyse d'une conversation publique : résumé + qualification du prospect.
// Appel volontairement bref et sur le modèle économique : ce n'est pas de la rédaction.
async function analyserConversation(session, apiKey) {
  const transcript = (session.messages || []).slice(-16)
    .map(m => (m.role === 'user' ? 'VISITEUR' : 'ASSISTANT') + ' : ' + m.content).join('\n').slice(0, 6000);
  if (!transcript) return;

  const system = `Tu analyses une conversation entre un visiteur et l'assistant du site de Pirabel Labs (agence web et marketing).
Reponds UNIQUEMENT par un objet JSON valide, sans texte autour, avec exactement ces cles :
{"resume":"3 phrases maximum decrivant ce que veut le visiteur et ou en est l'echange",
"besoin":"le besoin en une phrase courte","service":"site web|e-commerce|SEO|automatisation|IA|community management|autre|indetermine",
"budget":"le budget evoque tel quel, ou vide si non aborde","echeance":"le délai évoqué, ou vide",
"qualification":"chaud|tiede|froid","score":0,"prochaine_action":"la prochaine action concrete que l'equipe doit mener"}

Regles de qualification :
- chaud : le visiteur a un projet precis ET a laisse ses coordonnees ou pris rendez-vous.
- tiede : interet reel et projet identifiable, mais pas encore de coordonnees.
- froid : simple curiosite, question generale, ou aucun projet exprime.
score : entier de 0 a 100 refletant la probabilite de conversion.
N'invente rien : si une information n'a pas ete dite, laisse la chaine vide.
Francais impeccable, sans aucun caractere de mise en forme.`;

  const { ok, data } = await AI.callOpenRouter({
    apiKey, model: AI.MODEL_FAST,
    messages: [{ role: 'system', content: system }, { role: 'user', content: transcript }],
    maxTokens: 500, temperature: 0.2, timeoutMs: 15000,
  });
  if (!ok) return;
  const raw = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return;
  let a; try { a = JSON.parse(m[0]); } catch (e) { return; }

  session.summary = sanitize(a.resume || '', 2000);
  session.besoin = sanitize(a.besoin || '', 500);
  session.service = sanitize(a.service || '', 120);
  session.budget = sanitize(a.budget || '', 120);
  session.echeance = sanitize(a.echeance || '', 120);
  session.qualification = ['chaud', 'tiede', 'froid'].includes(a.qualification) ? a.qualification : 'non_evalue';
  session.score = Math.max(0, Math.min(100, parseInt(a.score, 10) || 0));
  session.prochaineAction = sanitize(a.prochaine_action || '', 400);
  session.analyzedAt = new Date();
  await session.save();
}

// --- Conversations du chatbot : lecture côté administration ---
app.get('/api/admin/chat-sessions', auth, adminOnly, async (req, res) => {
  try {
    const f = {};
    if (['chaud', 'tiede', 'froid', 'non_evalue'].includes(req.query.qualification)) f.qualification = req.query.qualification;
    if (req.query.avecContact === '1') f.capturedContact = true;
    const list = await ChatSession.find(f).sort({ updatedAt: -1 }).limit(150).lean();
    const stats = await ChatSession.aggregate([{ $group: { _id: '$qualification', n: { $sum: 1 } } }]);
    const parQualif = {}; stats.forEach(s => { parQualif[s._id] = s.n; });
    res.json({
      sessions: list.map(s => ({
        id: String(s._id), nom: s.visitorName || '', email: s.visitorEmail || '',
        contactCapte: s.capturedContact, qualification: s.qualification, score: s.score,
        resume: s.summary, besoin: s.besoin, service: s.service, budget: s.budget, echeance: s.echeance,
        prochaineAction: s.prochaineAction, nbMessages: (s.messages || []).length,
        page: s.pageOrigine || '', lu: s.lu, le: s.createdAt, maj: s.updatedAt,
      })),
      parQualification: parQualif,
      total: list.length,
      nonLues: await ChatSession.countDocuments({ lu: false }),
    });
  } catch (e) { console.error('[chat.list]', e.message); res.status(500).json({ error: 'Erreur chargement.' }); }
});

app.get('/api/admin/chat-sessions/:id', auth, adminOnly, async (req, res) => {
  try {
    const s = await ChatSession.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Conversation introuvable.' });
    if (!s.lu) { s.lu = true; await s.save(); }
    res.json({ session: s });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

// Relance l'analyse à la demande (utile si la conversation s'est poursuivie).
app.post('/api/admin/chat-sessions/:id/analyser', auth, adminOnly, async (req, res) => {
  try {
    const s = await ChatSession.findById(req.params.id);
    if (!s) return res.status(404).json({ error: 'Conversation introuvable.' });
    const apiKey = await getOpenRouterKey();
    if (!apiKey) return res.status(503).json({ error: 'Clé OpenRouter manquante.' });
    s.analyzedAt = undefined;
    await analyserConversation(s, apiKey);
    res.json({ success: true, qualification: s.qualification, score: s.score, resume: s.summary, prochaineAction: s.prochaineAction });
  } catch (e) { console.error('[chat.analyse.manual]', e.message); res.status(500).json({ error: 'Erreur analyse : ' + e.message }); }
});

// Réglages IA — admin only. La valeur est stockée en base, jamais relue par le client.
const ALLOWED_SETTINGS = ['openrouterApiKey', 'openrouterModel', 'groqApiKey', 'groqModel', 'cronSecret'];
app.post('/api/admin/settings', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const key = String(req.body.key || '');
    if (!ALLOWED_SETTINGS.includes(key)) return res.status(400).json({ error: 'Réglage non autorisé.' });
    const value = String(req.body.value || '').trim().slice(0, 500);
    await Setting.updateOne({ key }, { $set: { value, updatedAt: new Date() } }, { upsert: true });
    res.json({ success: true, key, configured: !!value });
  } catch (e) { console.error('[settings.set]', e.message); res.status(500).json({ error: 'Erreur enregistrement.' }); }
});
// Statut des réglages (booléen uniquement, jamais la valeur secrète).
app.get('/api/admin/settings/status', auth, adminOnly, async (req, res) => {
  try {
    const groq = process.env.GROQ_API_KEY || await getSetting('groqApiKey');
    const openrouter = await getOpenRouterKey();
    res.json({
      openrouterConfigured: !!openrouter,
      openrouterSource: process.env.OPENROUTER_API_KEY ? 'env' : (openrouter ? 'db' : 'none'),
      openrouterModel: process.env.OPENROUTER_MODEL || (await getSetting('openrouterModel')) || AI.MODEL_PRO,
      groqConfigured: !!groq, source: process.env.GROQ_API_KEY ? 'env' : (groq ? 'db' : 'none'),
      groqModel: process.env.GROQ_MODEL || (await getSetting('groqModel')) || 'llama-3.3-70b-versatile',
    });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

// ============ RENDEZ-VOUS (admin) ============
app.get('/api/admin/appointments', auth, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (['demande', 'confirme', 'effectue', 'annule', 'no_show'].includes(req.query.status)) filter.status = req.query.status;
    const list = await Appointment.find(filter).sort({ createdAt: -1 }).limit(300).lean();
    const counts = await Appointment.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
    const countMap = {}; counts.forEach(c => { countMap[c._id] = c.n; });
    res.json({ appointments: list, counts: countMap });
  } catch (e) { console.error('[appts.list]', e.message); res.status(500).json({ error: 'Erreur chargement rendez-vous.' }); }
});
app.patch('/api/admin/appointments/:id', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const a = await Appointment.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
    if (['demande', 'confirme', 'effectue', 'annule', 'no_show'].includes(req.body.status)) a.status = req.body.status;
    if (req.body.preferredDate != null) a.preferredDate = sanitize(req.body.preferredDate, 10);
    if (req.body.preferredTime != null) a.preferredTime = sanitize(req.body.preferredTime, 10);
    if (req.body.internalNotes != null) a.internalNotes = sanitize(req.body.internalNotes, 3000);
    await a.save();
    res.json({ success: true, appointment: a });
  } catch (e) { console.error('[appts.update]', e.message); res.status(500).json({ error: 'Erreur.' }); }
});
app.delete('/api/admin/appointments/:id', auth, adminOnly, async (req, res) => {
  try { await Appointment.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: 'Erreur suppression.' }); }
});
// Envoyer un rappel / message au contact d'un RDV
app.post('/api/admin/appointments/:id/remind', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const a = await Appointment.findById(req.params.id);
    if (!a) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
    const subject = sanitize(req.body.subject || 'Rappel de votre rendez-vous — Pirabel Labs', 200);
    const message = String(req.body.message || '').slice(0, 8000);
    if (message.trim().length < 2) return res.status(400).json({ error: 'Message requis.' });
    const html = adminTextEmailHtml(message, String(a.name || '').split(' ')[0], subject);
    const ok = await sendEmail(a.email, subject, html, { replyTo: process.env.ADMIN_EMAIL || 'contact@pirabellabs.com' });
    if (!ok) return res.status(502).json({ error: "Envoi refusé (vérifiez la config e-mail)." });
    a.remindersSent = (a.remindersSent || 0) + 1; a.lastReminderAt = new Date(); await a.save();
    try { await SentEmail.create({ type: 'individuel', to: a.email, toName: a.name, subject, body: message, status: 'envoye', sentBy: req.user._id, sentByName: req.user.name || '' }); } catch (e) {}
    res.json({ success: true, message: 'Rappel envoyé à ' + a.email });
  } catch (e) { console.error('[appts.remind]', e.message); res.status(500).json({ error: 'Erreur envoi.' }); }
});

// ============ CRON : résumé hebdomadaire (lundi) ============
app.get('/api/cron/weekly-summary', async (req, res) => {
  try {
    // Sécurité : autorisé seulement pour Vercel Cron (User-Agent vercel-cron) ou avec le bon secret
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    const isVercelCron = ua.includes('vercel-cron') || !!req.headers['x-vercel-cron'];
    const secretEnv = process.env.CRON_SECRET || await getSetting('cronSecret');
    const secretOk = req.query.secret && secretEnv && req.query.secret === secretEnv;
    if (!isVercelCron && !secretOk) return res.status(401).json({ error: 'Non autorisé.' });

    const since = new Date(Date.now() - 7 * 86400000);
    const [newLeads, newAppts, newQuotes, openTasks, weekViews] = await Promise.all([
      Lead.countDocuments({ createdAt: { $gte: since } }),
      Appointment.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(20).lean(),
      Quote.countDocuments({ createdAt: { $gte: since } }),
      Task.countDocuments({ status: { $in: ['a_faire', 'en_cours', 'en_revue', 'bloque'] } }),
      Article.aggregate([{ $group: { _id: null, v: { $sum: '$views' } } }]),
    ]);
    const cell = 'padding:10px 14px;border-left:3px solid #FF5500;background:#0e0e0e;margin-bottom:8px;';
    const apptRows = newAppts.length ? newAppts.map(a => '<tr><td style="' + cell + '"><strong>' + escapeHtml(a.name) + '</strong> — ' + escapeHtml(a.preferredDate || '') + ' ' + escapeHtml(a.preferredTime || '') + ' (' + escapeHtml(a.status) + ')</td></tr>').join('') : '<tr><td style="' + cell + 'color:rgba(229,226,225,0.5);">Aucune demande de RDV cette semaine.</td></tr>';
    const html = masterTemplate({
      headerType: 'hero', preheader: 'Votre résumé Pirabel Labs de la semaine',
      title: 'Résumé hebdomadaire',
      body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Voici l\'activité des 7 derniers jours&nbsp;:</p>' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:15px;color:#e5e2e1;">' +
        '<tr><td style="' + cell + '"><strong>' + newLeads + '</strong> nouveaux prospects</td></tr>' +
        '<tr><td style="' + cell + '"><strong>' + newAppts.length + '</strong> demandes de rendez-vous</td></tr>' +
        '<tr><td style="' + cell + '"><strong>' + newQuotes + '</strong> nouveaux devis</td></tr>' +
        '<tr><td style="' + cell + '"><strong>' + openTasks + '</strong> tâches ouvertes</td></tr>' +
        '<tr><td style="' + cell + '"><strong>' + (((weekViews[0] || {}).v) || 0) + '</strong> vues blog cumulées</td></tr>' +
        '</table>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.6);margin-top:18px;">Demandes de RDV récentes&nbsp;:</p>' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">' + apptRows + '</table>',
      cta: 'Ouvrir le tableau de bord', ctaUrl: 'https://www.pirabellabs.com/admin/dashboard',
    });
    await sendEmail(process.env.CONTACT_EMAIL || 'contact@pirabellabs.com', '[Pirabel Labs] Résumé de la semaine', html);
    res.json({ success: true, sent: true, newLeads, newAppts: newAppts.length, newQuotes });
  } catch (e) { console.error('[cron.weekly]', e.message); res.status(500).json({ error: 'Erreur cron.' }); }
});

// --- Pilotage par Puter (IA côté navigateur, gratuit, sans clé) ---
// Convertit les outils du format Anthropic vers le format OpenAI attendu par puter.ai.chat.
// Convertit les outils au format OpenAI. `allowed` restreint la liste aux outils de l'agent courant.
function assistantToolsOpenAI(allowed) {
  const list = Array.isArray(allowed) && allowed.length
    ? ASSISTANT_TOOLS.filter(t => allowed.includes(t.name))
    : ASSISTANT_TOOLS;
  return list.map(t => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.input_schema } }));
}

// Vrai si la requete provient de l'equipe (session admin valide) plutot que du client.
// Sert a ne pas compter une previsualisation interne comme une consultation client.
function estRequeteInterne(req) {
  try {
    const token = (req.cookies && (req.cookies.token || req.cookies.pl_admin)) || '';
    if (!token) return false;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return !!(payload && payload.id);
  } catch (e) { return false; }
}

// Clé OpenRouter : variable d'environnement en priorité, sinon réglage en base.
async function getOpenRouterKey() {
  return process.env.OPENROUTER_API_KEY || await getSetting('openrouterApiKey');
}
// Contexte métier + invites système + définitions d'outils (pour la boucle d'agent dans le navigateur).
app.get('/api/admin/assistant/context', auth, adminOnly, async (req, res) => {
  try {
    const ctx = await gatherBusinessContext();
    res.json({ context: ctx, prompts: AI_SYSTEM_PROMPTS, tools: assistantToolsOpenAI() });
  } catch (e) { console.error('[assistant.context]', e.message); res.status(500).json({ error: 'Erreur contexte.' }); }
});
// Exécute un outil demandé par l'IA (création/maj tâche, lecture CRM, brouillon article…). Sécurisé serveur.
app.post('/api/admin/assistant/tool', auth, adminOnly, limitBody(40), async (req, res) => {
  try {
    const name = String(req.body.name || '');
    if (!ASSISTANT_TOOLS.some(t => t.name === name)) return res.status(400).json({ ok: false, message: 'Outil inconnu.' });
    const result = await executeAssistantTool(name, req.body.input || {}, req.user);
    res.json(result);
  } catch (e) { console.error('[assistant.tool]', e.message); res.status(500).json({ ok: false, message: 'Erreur exécution : ' + e.message }); }
});

// --- Conversations IA (mémoire / historique) ---
// Liste des conversations de l'utilisateur (sans le détail des messages), filtrable par mode.
app.get('/api/admin/conversations', auth, adminOnly, async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (['analyse', 'redaction', 'equipe', 'libre'].includes(req.query.mode)) filter.mode = req.query.mode;
    const convos = await Conversation.find(filter).sort({ updatedAt: -1 }).limit(200)
      .select('mode title updatedAt messages').lean();
    res.json({ conversations: convos.map(c => ({ _id: c._id, mode: c.mode, title: c.title, updatedAt: c.updatedAt, count: (c.messages || []).length })) });
  } catch (e) { console.error('[convos.list]', e.message); res.status(500).json({ error: 'Erreur chargement conversations.' }); }
});

// Détail d'une conversation (avec messages)
app.get('/api/admin/conversations/:id', auth, adminOnly, async (req, res) => {
  try {
    const c = await Conversation.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!c) return res.status(404).json({ error: 'Conversation introuvable.' });
    res.json({ conversation: c });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

// Créer une conversation (vide) dans un mode donné
app.post('/api/admin/conversations', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const mode = ['analyse', 'redaction', 'equipe', 'libre'].includes(req.body.mode) ? req.body.mode : 'analyse';
    const c = new Conversation({ userId: req.user._id, mode, messages: [] });
    await c.save();
    res.json({ conversation: { _id: c._id, mode: c.mode, title: c.title, updatedAt: c.updatedAt, count: 0 } });
  } catch (e) { console.error('[convos.create]', e.message); res.status(500).json({ error: 'Erreur création conversation.' }); }
});

// Enregistrer les messages d'une conversation (remplace le tableau ; titre auto)
app.patch('/api/admin/conversations/:id', auth, adminOnly, limitBody(400), async (req, res) => {
  try {
    const c = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!c) return res.status(404).json({ error: 'Conversation introuvable.' });
    if (Array.isArray(req.body.messages)) {
      c.messages = req.body.messages
        .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
        .slice(-120)
        .map(m => ({ role: m.role, content: m.content.slice(0, 16000), createdAt: m.createdAt ? new Date(m.createdAt) : new Date() }));
    }
    if (typeof req.body.title === 'string' && req.body.title.trim()) c.title = sanitize(req.body.title, 80);
    if (['analyse', 'redaction', 'equipe', 'libre'].includes(req.body.mode)) c.mode = req.body.mode;
    await c.save();
    res.json({ conversation: { _id: c._id, mode: c.mode, title: c.title, updatedAt: c.updatedAt, count: c.messages.length } });
  } catch (e) { console.error('[convos.update]', e.message); res.status(500).json({ error: 'Erreur sauvegarde.' }); }
});

// Supprimer une conversation
app.delete('/api/admin/conversations/:id', auth, adminOnly, async (req, res) => {
  try { await Conversation.deleteOne({ _id: req.params.id, userId: req.user._id }); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: 'Erreur suppression.' }); }
});

// --- Journal des e-mails envoyés ---
app.get('/api/admin/emails', auth, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (['individuel', 'masse'].includes(req.query.type)) filter.type = req.query.type;
    if (req.query.q) {
      const rx = new RegExp(String(req.query.q).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ to: rx }, { toName: rx }, { subject: rx }];
    }
    const list = await SentEmail.find(filter).sort({ createdAt: -1 }).limit(300)
      .select('type to toName subject recipientsCount sentCount failedCount status sentByName createdAt').lean();
    const counts = await SentEmail.aggregate([{ $group: { _id: null, total: { $sum: 1 }, totalSent: { $sum: '$sentCount' } } }]);
    res.json({ emails: list, total: (counts[0] || {}).total || 0, totalSent: (counts[0] || {}).totalSent || 0 });
  } catch (e) { console.error('[emails.list]', e.message); res.status(500).json({ error: 'Erreur chargement e-mails.' }); }
});

app.get('/api/admin/emails/:id', auth, adminOnly, async (req, res) => {
  try {
    const e = await SentEmail.findById(req.params.id).lean();
    if (!e) return res.status(404).json({ error: 'E-mail introuvable.' });
    res.json({ email: e });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

app.delete('/api/admin/emails/:id', auth, adminOnly, async (req, res) => {
  try { await SentEmail.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: 'Erreur suppression.' }); }
});

// ============ CMS LIVRES BLANCS ============
function applyLBBody(body, doc) {
  if (body.title != null) doc.title = sanitize(body.title, 200);
  if (body.description != null) doc.description = sanitize(body.description, 1500);
  if (body.pages != null) doc.pages = parseInt(body.pages, 10) || 0;
  if (body.pdfUrl != null) doc.pdfUrl = sanitize(body.pdfUrl, 2000);
  if (body.coverImage != null) doc.coverImage = sanitize(body.coverImage, 2000);
  if (body.icon != null) doc.icon = sanitize(body.icon, 60) || 'menu_book';
  if (body.category != null) doc.category = sanitize(body.category, 80) || 'Guide';
  if (Array.isArray(body.toc)) doc.toc = body.toc.map(t => sanitize(String(t), 200)).filter(Boolean).slice(0, 12);
  if (body.status != null && ['brouillon', 'publie'].includes(body.status)) {
    if (body.status === 'publie' && doc.status !== 'publie') doc.publishedAt = new Date();
    doc.status = body.status;
  }
}
app.get('/api/admin/livres-blancs', auth, adminOnly, async (req, res) => {
  try { const list = await LivreBlanc.find({}).sort({ updatedAt: -1 }).lean(); res.json({ livresBlancs: list }); }
  catch (e) { res.status(500).json({ error: 'Erreur chargement.' }); }
});
app.get('/api/admin/livres-blancs/:id', auth, adminOnly, async (req, res) => {
  try { const d = await LivreBlanc.findById(req.params.id).lean(); if (!d) return res.status(404).json({ error: 'Introuvable.' }); res.json({ livreBlanc: d }); }
  catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});
app.post('/api/admin/livres-blancs', auth, adminOnly, limitBody(20), async (req, res) => {
  try {
    const title = sanitize(req.body.title || '', 200);
    if (!title || title.length < 3) return res.status(400).json({ error: 'Titre requis (3 caracteres min).' });
    const doc = new LivreBlanc({ title });
    applyLBBody(req.body, doc);
    doc.slug = await uniqueSlug(req.body.slug || title);
    await doc.save();
    res.json({ success: true, livreBlanc: doc });
  } catch (e) { console.error('[lb.create]', e.message); res.status(500).json({ error: 'Erreur lors de la création.' }); }
});
app.patch('/api/admin/livres-blancs/:id', auth, adminOnly, limitBody(20), async (req, res) => {
  try {
    const doc = await LivreBlanc.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Introuvable.' });
    applyLBBody(req.body, doc);
    if (req.body.slug && slugify(req.body.slug) !== doc.slug) doc.slug = await uniqueSlug(req.body.slug, doc._id);
    await doc.save();
    res.json({ success: true, livreBlanc: doc });
  } catch (e) { console.error('[lb.update]', e.message); res.status(500).json({ error: 'Erreur de mise à jour.' }); }
});
app.delete('/api/admin/livres-blancs/:id', auth, adminOnly, async (req, res) => {
  try { await LivreBlanc.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: 'Erreur suppression.' }); }
});
// Importe une fois les livres blancs historiques en base (idempotent)
app.post('/api/admin/livres-blancs/seed', auth, adminOnly, async (req, res) => {
  try {
    const icons = { 'seo-pme-francophones-2026': 'search_insights', 'ia-pme-cas-usage-roi': 'smart_toy', 'tunnels-vente-cro-3x-conversion': 'conversion_path', 'ecommerce-afrique-paiement-mobile-money': 'shopping_cart', 'refonte-site-checklist-complete': 'checklist' };
    const cats = { 'seo-pme-francophones-2026': 'SEO', 'ia-pme-cas-usage-roi': 'Intelligence artificielle', 'tunnels-vente-cro-3x-conversion': 'Conversion', 'ecommerce-afrique-paiement-mobile-money': 'E-commerce', 'refonte-site-checklist-complete': 'Sites web' };
    let created = 0;
    for (const slug of Object.keys(LIVRES_BLANCS)) {
      if (await LivreBlanc.findOne({ slug })) continue;
      const lb = LIVRES_BLANCS[slug];
      await LivreBlanc.create({ title: lb.title, slug, description: lb.description, pages: lb.pages, pdfUrl: lb.pdfUrl, icon: icons[slug] || 'menu_book', category: cats[slug] || 'Guide', status: 'publie', publishedAt: new Date() });
      created++;
    }
    res.json({ success: true, created });
  } catch (e) { console.error('[lb.seed]', e.message); res.status(500).json({ error: 'Erreur seed.' }); }
});
// --- PUBLIC : livres blancs publiés (pour la page /livres-blancs) ---
app.get('/api/livres-blancs', async (req, res) => {
  try {
    const list = await LivreBlanc.find({ status: 'publie' }).sort({ publishedAt: -1, createdAt: -1 }).select('title slug description pages pdfUrl coverImage icon category toc downloads').lean();
    res.json({ livresBlancs: list });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

// --- PUBLIC : liste du blog ---
app.get('/blog', async (req, res) => {
  try {
    const PAGE = 9;
    const esc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cat = String(req.query.cat || '').trim().slice(0, 60);
    const q = String(req.query.q || '').trim().slice(0, 80);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const isFiltered = !!(cat || q);
    const baseFilter = { status: 'publie' };
    if (cat) baseFilter.category = new RegExp('^' + esc(cat) + '$', 'i');
    if (q) { const rx = new RegExp(esc(q), 'i'); baseFilter.$or = [{ title: rx }, { excerpt: rx }, { category: rx }]; }
    // catégories pour les filtres (dédupliquées, insensibles à la casse)
    const rawCats = await Article.distinct('category', { status: 'publie' });
    const seen = {}; const cats = [];
    rawCats.filter(Boolean).sort((a, b) => a.localeCompare(b, 'fr')).forEach(c => { const k = c.toLowerCase(); if (!seen[k]) { seen[k] = 1; cats.push(c); } });
    // article vedette = le plus lu (page 1 sans filtre uniquement)
    let featured = null, excludeId = null;
    if (!isFiltered) {
      featured = await Article.findOne({ status: 'publie' }).sort({ views: -1, publishedAt: -1 }).lean();
      if (featured) excludeId = featured._id;
    }
    const listFilter = Object.assign({}, baseFilter);
    if (excludeId) listFilter._id = { $ne: excludeId };
    const total = await Article.countDocuments(listFilter);
    const totalPages = Math.max(1, Math.ceil(total / PAGE));
    const safePage = Math.min(page, totalPages);
    const arts = await Article.find(listFilter).sort({ publishedAt: -1 }).skip((safePage - 1) * PAGE).limit(PAGE).lean();
    const cardImg = a => '<div class="bx-card__img">' + (a.featuredImage ? '<img src="' + escapeHtml(a.featuredImage) + '" alt="' + escapeHtml(a.imageAlt || a.title) + '" loading="lazy" decoding="async">' : coverSvg(a.title, a.category)) + '</div>';
    const card = a => '<a class="bx-card glass glass--flat spot" href="/blog/' + escapeHtml(a.slug) + '">' + cardImg(a) +
      '<div class="bx-card__b"><span class="bx-cat">' + escapeHtml(a.category || 'Marketing') + '</span>' +
      '<h2>' + frt(a.title) + '</h2><p>' + frt(a.excerpt || '') + '</p>' +
      '<div class="bx-card__meta">' + (a.readTime ? '<span class="bx-views">' + ic('clock', 15) + escapeHtml(a.readTime) + '&nbsp;min de lecture</span>' : '<span></span>') + ((a.views || 0) >= 100 ? '<span class="bx-views">' + ic('trending', 15) + fmtViews(a.views) + '&nbsp;vues</span>' : '<span></span>') + '</div></div></a>';
    const cards = arts.length ? arts.map(card).join('') : '<div class="px-note glass glass--flat" style="grid-column:1/-1">Aucun article ne correspond à votre recherche.</div>';
    // vedette
    const featHtml = (featured && safePage === 1) ?
      '<a class="bx-feat glass glass--flat spot" href="/blog/' + escapeHtml(featured.slug) + '"><div class="bx-feat__img">' +
        (featured.featuredImage ? '<img src="' + escapeHtml(featured.featuredImage) + '" alt="' + escapeHtml(featured.imageAlt || featured.title) + '" fetchpriority="high" decoding="async">' : coverSvg(featured.title, featured.category)) +
        '</div><div class="bx-feat__b"><span class="bx-feat__star">' + ic('star', 15) + 'Article le plus lu</span>' +
        '<h2>' + frt(featured.title) + '</h2><p>' + frt(featured.excerpt || '') + '</p>' +
        '<span class="link-arrow">Lire l’article ' + ic('arrow-right', 16) + '</span></div></a>' : '';
    // filtres + recherche
    const pills = '<nav class="bx-filters" aria-label="Catégories du blog"><a href="/blog"' + (!cat ? ' class="is-active" aria-current="page"' : '') + '>Tous</a>' +
      cats.map(c => '<a href="/blog?cat=' + encodeURIComponent(c) + '"' + (cat && cat.toLowerCase() === c.toLowerCase() ? ' class="is-active" aria-current="page"' : '') + '>' + escapeHtml(c) + '</a>').join('') + '</nav>';
    const search = '<form class="bx-search" action="/blog" method="get" role="search">' + (cat ? '<input type="hidden" name="cat" value="' + escapeHtml(cat) + '">' : '') +
      '<input type="search" name="q" value="' + escapeHtml(q) + '" placeholder="Rechercher un article…" aria-label="Rechercher un article"><button type="submit" aria-label="Lancer la recherche">' + ic('search', 17) + '</button></form>';
    const toolbar = '<div class="bx-toolbar">' + pills + search + '</div>';
    const note = isFiltered ? '<p class="bx-count">' + total + ' article' + (total > 1 ? 's' : '') + (cat ? ' dans « ' + escapeHtml(cat) + ' »' : '') + (q ? ' pour « ' + escapeHtml(q) + ' »' : '') + ' · <a href="/blog">tout afficher</a></p>' : '';
    // pagination (préserve cat + q)
    const qs = p => { const a = []; if (cat) a.push('cat=' + encodeURIComponent(cat)); if (q) a.push('q=' + encodeURIComponent(q)); if (p > 1) a.push('page=' + p); return a.length ? ('?' + a.join('&amp;')) : ''; };
    let pager = '';
    if (totalPages > 1) {
      let nums = '';
      for (let p = 1; p <= totalPages; p++) nums += (p === safePage) ? '<span class="is-active" aria-current="page">' + p + '</span>' : '<a href="/blog' + qs(p) + '">' + p + '</a>';
      pager = '<nav class="bx-pager" aria-label="Pagination">' +
        (safePage > 1 ? '<a href="/blog' + qs(safePage - 1) + '">‹ Précédent</a>' : '<span class="is-disabled">‹ Précédent</span>') + nums +
        (safePage < totalPages ? '<a href="/blog' + qs(safePage + 1) + '">Suivant ›</a>' : '<span class="is-disabled">Suivant ›</span>') + '</nav>';
    }
    const canon = SITE() + '/blog' + (safePage > 1 ? '?page=' + safePage : '');
    const bc = crumbs([{ name: 'Blog', path: '/blog' }]);
    const head = '<title>Blog Pirabel Labs — Marketing digital, SEO, sites web' + (safePage > 1 ? ' (page ' + safePage + ')' : '') + '</title>' +
      '<meta name="description" content="Conseils marketing digital, SEO, sites web et stratégie pour PME francophones — par Pirabel Labs.">' +
      '<link rel="canonical" href="' + canon + '">' +
      '<meta property="og:title" content="Blog Pirabel Labs"><meta property="og:type" content="website"><meta property="og:url" content="' + SITE() + '/blog">' +
      '<meta property="og:description" content="Conseils marketing digital, SEO, sites web et stratégie pour PME francophones — par Pirabel Labs.">' +
      bc.ld;
    const body = '<div class="px-wrap">' +
      '<header class="px-hero"><p class="eyebrow">Ressources</p><h1>Le blog <span class="grad">Pirabel Labs</span></h1>' +
      '<p class="px-hero__lead">Conseils marketing digital, SEO, sites web et stratégie pour PME francophones.</p></header>' +
      toolbar + note + featHtml + '<div class="bx-grid">' + cards + '</div>' + pager + '</div>';
    res.set('Content-Type', 'text/html; charset=utf-8').send(blogShell(head, body, { current: '/blog' }));
  } catch (e) { console.error('[blog]', e.message); res.status(500).send('Erreur'); }
});

// --- PUBLIC : article ---
app.get('/blog/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').toLowerCase().slice(0, 100);
    // Aperçu admin : ?preview=1 + cookie JWT valide -> on rend aussi les brouillons
    const previewAdmin = !!req.query.preview && (() => {
      try { jwt.verify((req.cookies || {}).token || '', process.env.JWT_SECRET, { algorithms: ['HS256'], issuer: 'pirabel-labs' }); return true; } catch (e) { return false; }
    })();
    const a = await Article.findOne(previewAdmin ? { slug } : { slug, status: 'publie' }).lean();
    if (!a) return res.status(404).send(blogShell('<title>Article introuvable — Pirabel Labs</title><meta name="robots" content="noindex">',
      '<section class="px-empty"><p class="eyebrow">Erreur 404</p><h1 class="px-title">Article introuvable</h1><p>Cet article n’existe pas ou n’est plus publié.</p>' +
      '<a class="btn btn--primary" href="/blog">' + ic('arrow-left', 18) + ' Retour au blog</a></section>', { current: '/blog' }));
    if (previewAdmin) res.set('Cache-Control', 'private, no-store'); // aperçu admin : jamais en cache partagé
    Article.updateOne({ _id: a._id }, { $inc: { views: 1 } }).catch(() => {});
    const metaTitle = escapeHtml(a.seoTitle || a.title);
    const metaDesc = escapeHtml(a.metaDescription || a.excerpt || '');
    const url = SITE() + '/blog/' + encodeURIComponent(a.slug);
    // Articles signés par l'agence (jamais au nom d'une personne de l'équipe).
    const byTeam = !a.author || /lissanon|gildas|pirabel/i.test(a.author);
    const ogImg = a.featuredImage ? (a.featuredImage.startsWith('http') ? a.featuredImage : SITE() + a.featuredImage) : (SITE() + '/img/og-image.png?v=elan');
    const bc = crumbs([{ name: 'Blog', path: '/blog' }, { name: a.title, path: '/blog/' + encodeURIComponent(a.slug) }]);
    const head = '<title>' + metaTitle + '</title>' +
      '<meta name="description" content="' + metaDesc + '">' +
      '<link rel="canonical" href="' + url + '">' +
      (a.status !== 'publie' ? '<meta name="robots" content="noindex, nofollow">' : '') +
      '<meta name="author" content="' + escapeHtml(byTeam ? 'Pirabel Labs' : a.author) + '">' +
      '<meta property="og:title" content="' + metaTitle + '"><meta property="og:description" content="' + metaDesc + '">' +
      '<meta property="og:type" content="article"><meta property="og:url" content="' + url + '"><meta property="og:image" content="' + escapeHtml(ogImg) + '">' +
      '<meta name="twitter:card" content="summary_large_image">' +
      ldJson({
        '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.title,
        description: a.metaDescription || a.excerpt || '', image: ogImg, datePublished: a.publishedAt,
        dateModified: a.updatedAt, author: byTeam ? { '@type': 'Organization', name: 'Pirabel Labs', url: SITE() } : { '@type': 'Person', name: a.author },
        publisher: { '@type': 'Organization', name: 'Pirabel Labs' }, mainEntityOfPage: url,
      }) + bc.ld;
    const authorName = escapeHtml(byTeam ? BLOG_TEAM : a.author);
    const catLabel = escapeHtml(a.category || 'Marketing');
    // Sommaire auto : injecte des id sur les H2 et collecte le sommaire
    const toc = [];
    const contentHtml = (a.content || ('<p>' + escapeHtml(a.excerpt || '') + '</p>')).replace(/<aside class="art-author[\s\S]*?<\/aside>/g, '').replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (m, attrs, inner) => {
      attrs = attrs || '';
      const idm = attrs.match(/id="([^"]+)"/);
      let id = idm ? idm[1] : '';
      const plain = inner.replace(/<[^>]+>/g, '');
      const txt = decodeEnt(plain).trim(); // libellé du sommaire
      const slugSrc = plain.replace(/&[a-z]+;/gi, ' ').trim(); // base des id (inchangée : liens profonds existants)
      if (!id) { id = (slugSrc.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48)) || ('s' + toc.length); attrs += ' id="' + id + '"'; }
      toc.push({ id, txt });
      return '<h2' + attrs + '>' + inner + '</h2>';
    });
    // Couverture : image fournie, sinon couverture SVG générée (légère, sur-mesure)
    const cover = '<figure class="bx-cover glass glass--flat">' + (a.featuredImage
      ? '<img src="' + escapeHtml(a.featuredImage) + '" alt="' + escapeHtml(a.imageAlt || a.title) + '" fetchpriority="high" decoding="async">'
      : coverSvg(a.title, a.category)) + '</figure>';
    const authorCard =
      '<aside class="art-author glass glass--flat"><div class="art-author__avatar">PL</div><div><div class="art-author__label">Article rédigé par</div><div class="art-author__name">' + authorName + '</div><div class="art-author__role">Agence web et marketing digital</div><p class="art-author__bio">Pirabel Labs conçoit des sites, des applications et des stratégies SEO, GEO et marketing pour les entreprises francophones d’Afrique et d’Europe.</p></div></aside>';
    const tocHtml = toc.length >= 2 ? '<nav class="bx-toc glass glass--flat" aria-label="Sommaire de l’article"><strong>Sommaire</strong>' + toc.map(t => '<a href="#' + escapeHtml(t.id) + '">' + frt(t.txt) + '</a>').join('') + '</nav>' : '';
    const side = '<aside class="bx-side">' + tocHtml +
      '<div class="bx-side__author glass glass--flat"><div class="art-author__avatar">PL</div><div><div class="bx-side__name">' + authorName + '</div><div class="bx-side__role">Agence web et marketing digital</div></div></div>' +
      '<div class="bx-side__cta glass glass--tint"><b>Un projet digital&nbsp;?</b><p>Audit gratuit, réponse sous 24&nbsp;h.</p><a class="btn btn--primary btn--sm" href="/contact">Demander un audit</a></div>' +
      '</aside>';
    // Articles similaires : même catégorie en priorité, complété par les plus récents
    const related = await Article.find({ status: 'publie', _id: { $ne: a._id }, category: a.category }).sort({ views: -1, publishedAt: -1 }).limit(3).lean();
    if (related.length < 3) {
      const have = related.map(r => r._id).concat(a._id);
      const extra = await Article.find({ status: 'publie', _id: { $nin: have } }).sort({ publishedAt: -1 }).limit(3 - related.length).lean();
      related.push(...extra);
    }
    const relCard = r => '<a class="bx-card glass glass--flat spot" href="/blog/' + escapeHtml(r.slug) + '"><div class="bx-card__img">' + (r.featuredImage ? '<img src="' + escapeHtml(r.featuredImage) + '" alt="' + escapeHtml(r.imageAlt || r.title) + '" loading="lazy" decoding="async">' : coverSvg(r.title, r.category)) + '</div><div class="bx-card__b"><span class="bx-cat">' + escapeHtml(r.category || 'Marketing') + '</span><h3>' + frt(r.title) + '</h3></div></a>';
    const relatedHtml = related.length ? '<section class="bx-related" aria-labelledby="relTitle"><h2 id="relTitle">Articles similaires</h2><div class="bx-related__grid">' + related.map(relCard).join('') + '</div></section>' : '';
    const meta = '<div class="bx-meta"><span>Par <strong>' + authorName + '</strong></span>' +
      '<span class="bx-views">' + ic('calendar', 15) + fmtFr(a.publishedAt || a.createdAt) + '</span>' +
      (a.readTime ? '<span class="bx-views">' + ic('clock', 15) + escapeHtml(a.readTime) + '&nbsp;min de lecture</span>' : '') +
      ((a.views || 0) >= 100 ? '<span class="bx-views">' + ic('trending', 15) + fmtViews(a.views) + '&nbsp;vues</span>' : '') + '</div>';
    const body = '<div class="px-wrap">' + bc.html + '<div class="bx-layout"><article class="bx-article">' +
      (a.status !== 'publie' ? '<div class="bx-preview" role="status"><b>Aperçu</b> Brouillon non publié, visible uniquement par vous (administrateur connecté).</div>' : '') +
      '<header class="bx-head"><span class="bx-cat">' + catLabel + '</span>' +
      '<h1>' + frt(a.title) + '</h1>' + meta + '</header>' +
      cover +
      '<div class="bx-content">' + themeContent(contentHtml) + '</div>' +
      authorCard +
      '<div class="bx-cta glass glass--tint spot"><p class="bx-cta__t">Un projet en tête&nbsp;?</p>' +
      '<p class="bx-cta__sub">On transforme votre idée en site, boutique ou application qui convertit : parlez-en à notre équipe.</p>' +
      '<div class="bx-cta__btns"><a class="btn btn--primary" href="/contact#rdv">Discutons de votre projet ' + ic('arrow-right', 18, 'icon--end') + '</a><a class="btn btn--glass" href="/realisations">Voir nos réalisations ' + ic('arrow-up-right', 18) + '</a></div></div>' +
      relatedHtml +
      '<section class="bx-comments" aria-labelledby="cmTitle"><h2 id="cmTitle">Commentaires</h2>' +
      '<div id="cmList" class="bx-cmlist" aria-live="polite"><p>Chargement…</p></div>' +
      '<form id="cmForm" class="bx-cmform glass"><h3>Laisser un commentaire</h3>' +
      '<p class="bx-cmnote">Votre commentaire sera publié après modération. L’adresse e-mail n’est jamais affichée.</p>' +
      '<div class="px-grid2"><div class="px-field"><label for="cmAuthor">Votre nom <span aria-hidden="true">*</span></label><input id="cmAuthor" name="author" required maxlength="80" autocomplete="name"></div>' +
      '<div class="px-field"><label for="cmEmail">E-mail <span class="px-opt">(facultatif, non publié)</span></label><input id="cmEmail" name="email" type="email" maxlength="200" autocomplete="email"></div></div>' +
      '<div class="px-field"><label for="cmContent">Votre commentaire <span aria-hidden="true">*</span></label><textarea id="cmContent" name="content" rows="4" required maxlength="3000"></textarea></div>' +
      '<input name="cm_check_hp" tabindex="-1" autocomplete="off" readonly aria-hidden="true" class="px-hp" style="display:none;">' +
      '<div id="cmMsg" class="bx-cmmsg" role="status"></div>' +
      '<button type="submit" class="btn btn--primary">Publier mon commentaire</button></form></section>' +
      '</article>' + side + '</div></div><script src="/js/comments.js?v=' + ASSET_V + '" defer></script>';
    res.set('Content-Type', 'text/html; charset=utf-8').send(blogShell(head, body, { current: '/blog' }));
  } catch (e) { console.error('[blog.slug]', e.message); res.status(500).send('Erreur'); }
});

// ========================================================================
// === ETUDES DE CAS / REALISATIONS ===
// ========================================================================
async function uniqueCaseSlug(base, excludeId) {
  let slug = slugify(base) || ('cas-' + Date.now().toString(36));
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const ex = await CaseStudy.findOne({ slug });
    if (!ex || (excludeId && String(ex._id) === String(excludeId))) return slug;
    n++; slug = slugify(base).slice(0, 76) + '-' + n;
  }
}
async function applyCaseBody(body, doc) {
  if (body.title != null) doc.title = sanitize(body.title, 200);
  if (body.sector != null) doc.sector = sanitize(body.sector, 100);
  if (body.location != null) doc.location = sanitize(body.location, 100);
  if (body.excerpt != null) doc.excerpt = sanitize(body.excerpt, 500);
  if (body.content != null) doc.content = sanitizeSoft(body.content, 100000);
  if (body.featuredImage != null) doc.featuredImage = sanitize(body.featuredImage, 2000);
  if (body.imageAlt != null) doc.imageAlt = sanitize(body.imageAlt, 200);
  if (Array.isArray(body.gallery)) doc.gallery = body.gallery.map(u => sanitize(String(u), 300).trim()).filter(Boolean).slice(0, 30);
  if (body.projectUrl != null) {
    let u = sanitize(body.projectUrl, 300).trim();
    if (u && !/^https?:\/\//i.test(u)) u = 'https://' + u;        // ajoute https:// si absent
    doc.projectUrl = /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : ''; // n'accepte qu'une URL http(s) propre
  }
  if (body.metric1Value != null) doc.metric1Value = sanitize(body.metric1Value, 40);
  if (body.metric1Label != null) doc.metric1Label = sanitize(body.metric1Label, 60);
  if (body.metric2Value != null) doc.metric2Value = sanitize(body.metric2Value, 40);
  if (body.metric2Label != null) doc.metric2Label = sanitize(body.metric2Label, 60);
  if (body.seoTitle != null) doc.seoTitle = sanitize(body.seoTitle, 200);
  if (body.metaDescription != null) doc.metaDescription = sanitize(body.metaDescription, 320);
  if (body.status != null && ['brouillon', 'publie'].includes(body.status)) doc.status = body.status;
  if (body.inProgress != null) doc.inProgress = !!body.inProgress;
  if (body.confidential != null) doc.confidential = !!body.confidential;
  if (body.featured != null) doc.featured = !!body.featured;
}
app.get('/api/admin/case-studies', auth, adminOnly, async (req, res) => {
  try { const list = await CaseStudy.find({}).select('title slug sector location status featuredImage updatedAt').sort({ updatedAt: -1 }).lean(); res.json({ cases: list }); }
  catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});
app.get('/api/admin/case-studies/:id', auth, adminOnly, async (req, res) => {
  try { const c = await CaseStudy.findById(req.params.id).lean(); if (!c) return res.status(404).json({ error: 'Introuvable.' }); res.json({ caseStudy: c }); }
  catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});
app.post('/api/admin/case-studies', auth, adminOnly, limitBody(20), async (req, res) => {
  try {
    const title = sanitize(req.body.title || '', 200);
    if (!title || title.length < 3) return res.status(400).json({ error: 'Titre requis.' });
    const doc = new CaseStudy({ title });
    await applyCaseBody(req.body, doc);
    doc.slug = await uniqueCaseSlug(req.body.slug || title);
    await doc.save();
    res.json({ success: true, caseStudy: doc });
  } catch (e) { console.error('[cases.create]', e.message); res.status(500).json({ error: 'Erreur lors de la création.' }); }
});
app.patch('/api/admin/case-studies/:id', auth, adminOnly, limitBody(20), async (req, res) => {
  try {
    const doc = await CaseStudy.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Introuvable.' });
    await applyCaseBody(req.body, doc);
    if (req.body.slug && slugify(req.body.slug) !== doc.slug) doc.slug = await uniqueCaseSlug(req.body.slug, doc._id);
    await doc.save();
    res.json({ success: true, caseStudy: doc });
  } catch (e) { console.error('[cases.update]', e.message); res.status(500).json({ error: 'Erreur.' }); }
});
app.delete('/api/admin/case-studies/:id', auth, adminOnly, async (req, res) => {
  try { await CaseStudy.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

// Placeholder SVG thématique quand une fiche n'a pas encore d'image à la une.
const RZ_PALETTES = [['#FF5500', '#7a1f00'], ['#FF7A00', '#3a1500'], ['#FF3D00', '#4a0f00'], ['#FF9500', '#2a1800'], ['#E64500', '#1a0800'], ['#FF6A2C', '#301100']];
function casePlaceholder(c, i) {
  const pal = RZ_PALETTES[i % RZ_PALETTES.length];
  const clean = String(c.title || 'Projet').replace(/[^A-Za-zÀ-ÿ0-9 ]/g, ' ').trim();
  const words = clean.split(/\s+/);
  const mono = ((words[0] || 'P')[0] + (words[1] ? words[1][0] : (words[0] || 'P').slice(1, 2))).toUpperCase();
  const tag = escapeHtml(String(c.sector || 'Projet').split('·')[0].trim().toUpperCase());
  return '<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + escapeHtml(c.title || '') + '">' +
    '<defs><linearGradient id="rzg' + i + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[1] + '"/></linearGradient></defs>' +
    '<rect width="640" height="360" fill="#0e0d0d"/><rect width="640" height="360" fill="url(#rzg' + i + ')" opacity="0.20"/>' +
    '<circle cx="545" cy="60" r="165" fill="' + pal[0] + '" opacity="0.10"/><circle cx="80" cy="330" r="120" fill="' + pal[0] + '" opacity="0.07"/>' +
    '<text x="44" y="225" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-size="168" fill="#ffffff" opacity="0.13">' + escapeHtml(mono) + '</text>' +
    '<text x="48" y="300" font-family="Space Grotesk,Arial,sans-serif" font-weight="700" font-size="21" letter-spacing="3" fill="#ffffff" opacity="0.82">' + tag + '</text>' +
    '<text x="596" y="334" text-anchor="end" font-family="Space Grotesk,Arial,sans-serif" font-weight="700" font-size="16" fill="#FF5500">Pirabel Labs</text></svg>';
}
// Flèches pointillées décoratives réutilisables (styles .dot-arrow dans la page de l’étude de cas).
const DOT_VARIANTS = [
  ['M14 20 C 150 20 90 94 208 94', 'M194 80 L212 95 L192 104'],
  ['M10 62 C 60 22 110 100 160 62 C 196 34 216 78 234 60', 'M222 48 L236 60 L222 72'],
  ['M14 18 Q 130 18 214 96', 'M200 82 L218 98 L198 106'],
  ['M12 74 C 80 8 160 8 228 74', 'M216 62 L232 78 L214 86'],
  ['M14 44 C 110 44 130 94 212 92', 'M200 80 L218 92 L200 104'],
];
function pageArrow(i) {
  const v = DOT_VARIANTS[i % DOT_VARIANTS.length];
  const mirror = (i % 2) ? ' dot-arrow--r' : '';
  return '<div class="dot-arrow' + mirror + '" aria-hidden="true"><svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path class="df" d="' + v[0] + '" stroke="#FF5500" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="0.1 15" opacity="0.55"/>' +
    '<path d="' + v[1] + '" stroke="#FF5500" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/></svg></div>';
}
// === PUBLIC : réalisations publiées en JSON (orbite de la page d'accueil) ===
// Lecture seule, champs publics uniquement, mis en cache au CDN 10 min.
app.get('/api/realisations', async (req, res) => {
  try {
    const limit = Math.min(24, Math.max(1, parseInt(req.query.limit, 10) || 16));
    const cs = await CaseStudy.find({ status: 'publie' })
      .select('title slug sector location excerpt featuredImage imageAlt metric1Value metric1Label inProgress featured publishedAt')
      .sort({ featured: -1, publishedAt: -1 }).limit(limit).lean();
    res.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
    res.json({
      items: cs.map(c => ({
        title: c.title, slug: c.slug, sector: c.sector || '', location: c.location || '',
        excerpt: String(c.excerpt || '').slice(0, 220),
        image: c.featuredImage ? pubImg(c.featuredImage) : '', imageAlt: c.imageAlt || c.title,
        metric: c.metric1Value ? (c.metric1Value + (c.metric1Label ? ' ' + c.metric1Label : '')) : '',
        inProgress: !!c.inProgress,
      })),
    });
  } catch (e) {
    res.status(500).json({ items: [] });
  }
});

app.get('/realisations', async (req, res) => {
  try {
    const cs = await CaseStudy.find({ status: 'publie' }).sort({ featured: -1, publishedAt: -1 }).limit(60).lean();
    // Catégories de filtre déduites du secteur + titre de chaque projet.
    const RZ_CATS = [
      ['web', 'Sites web', /site|vitrine|\bweb\b|wordpress|marque personnelle/i],
      ['ecommerce', 'E-commerce', /e-?commerce|\bcommerce\b|boutique|\bmode\b|lifestyle/i],
      ['saas', 'SaaS et applications', /\bsaas\b|application|plateforme|logiciel/i],
      ['ia', 'IA', /\bia\b|intelligence artificielle|\bai\b|vocal|\bvoix\b/i],
      ['fintech', 'Fintech et Web3', /fintech|crypto|web3|blockchain/i],
      ['marketing', 'Marketing et SEO', /marketing|\bseo\b|acquisition|publicit/i],
      ['graphisme', 'Graphisme', /graphisme|\bdesign\b|branding|identit[ée] visuelle|\blogo\b/i],
      ['automatisation', 'Automatisation', /automatisation|automation|workflow|no-?code/i],
      ['rh', 'RH et recrutement', /ressources humaines|recrutement|talent|emploi/i],
      ['immobilier', 'Immobilier', /immobilier|proptech/i],
    ];
    const catsOf = (c) => RZ_CATS.filter(k => k[2].test(String(c.sector || '') + ' ' + String(c.title || ''))).map(k => k[0]);
    const present = new Set();
    cs.forEach(c => catsOf(c).forEach(x => present.add(x)));
    const cards = cs.length ? cs.map((c, i) => {
      const img = c.featuredImage
        ? '<img src="' + escapeHtml(pubImg(c.featuredImage)) + '" alt="' + escapeHtml(c.imageAlt || c.title) + '" loading="lazy" decoding="async">'
        : casePlaceholder(c, i);
      const pill = (v, l) => v ? '<span class="rz-pill"><strong>' + escapeHtml(v) + '</strong>' + (l ? ' ' + escapeHtml(l) : '') + '</span>' : '';
      const metrics = (c.metric1Value || c.metric2Value) ? '<div class="rz-pills">' + pill(c.metric1Value, c.metric1Label) + pill(c.metric2Value, c.metric2Label) + '</div>' : '';
      const sub = escapeHtml([c.sector, c.location].filter(Boolean).join(' · '));
      const visit = c.confidential
        ? '<span class="rz-priv">' + ic('lock', 14) + ' Projet privé</span>'
        : ((c.projectUrl && /^https?:\/\//i.test(c.projectUrl))
          ? '<a class="rz-visit" href="' + escapeHtml(c.projectUrl) + '" target="_blank" rel="noopener nofollow">Visiter le site ' + ic('arrow-up-right', 14) + '</a>' : '');
      const wip = c.inProgress ? '<span class="rz-wip' + (c.featured ? ' rz-wip--low' : '') + '">' + ic('clock', 13) + ' En cours</span>' : '';
      const star = c.featured ? '<span class="rz-star" title="En vedette"><span class="sr-only">Projet en vedette</span>' + ic('star', 16) + '</span>' : '';
      return '<div class="rz-card glass glass--flat spot' + (c.featured ? ' rz-card--feat' : '') + '" data-cats="' + catsOf(c).join(' ') + '" data-reveal>' +
        '<div class="rz-card__img">' + img + star + wip + visit + '<span class="rz-card__eye" aria-hidden="true">' + ic('arrow-up-right', 18) + '</span></div>' +
        '<div class="rz-card__b">' + (sub ? '<span class="rz-cat">' + sub + '</span>' : '') +
        '<h3><a class="rz-stretch" href="/realisations/' + escapeHtml(c.slug) + '">' + frt(c.title) + '</a></h3><p>' + frt(c.excerpt || '') + '</p>' + metrics +
        '<span class="rz-more link-arrow" aria-hidden="true">Voir l’étude de cas ' + ic('arrow-right', 16) + '</span></div></div>';
    }).join('') : '<div class="px-note glass glass--flat" style="grid-column:1/-1">Études de cas à venir.</div>';
    const filterBar = present.size > 1
      ? '<div class="rz-filters" id="rzFilters" role="group" aria-label="Filtrer les projets"><button type="button" class="rz-fbtn is-active" data-cat="all" aria-pressed="true">Tous</button>' +
        RZ_CATS.filter(k => present.has(k[0])).map(k => '<button type="button" class="rz-fbtn" data-cat="' + k[0] + '" aria-pressed="false">' + escapeHtml(k[1]) + '</button>').join('') + '</div>' +
        '<p class="sr-only" id="rzCount" aria-live="polite"></p>'
      : '';
    const dotArrow = (mirror) => '<div class="rz-arrow' + (mirror ? ' rz-arrow--r' : '') + '" aria-hidden="true"><svg viewBox="0 0 240 110" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="rz-flow" d="M14 22 C 150 22 90 96 210 96" stroke="#FF5500" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="0.1 15" opacity="0.55"/><path d="M196 82 L214 97 L194 106" stroke="#FF5500" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/></svg></div>';
    const bc = crumbs([{ name: 'Réalisations', path: '/realisations' }]);

    const head = '<title>Réalisations & études de cas — Pirabel Labs</title>' +
      '<meta name="description" content="Nos réalisations : sites web, boutiques en ligne, plateformes SaaS, applications IA et SEO — des produits livrés et en production, au Bénin, en Afrique et en Europe.">' +
      '<link rel="canonical" href="' + SITE() + '/realisations">' +
      '<meta property="og:title" content="Réalisations & études de cas — Pirabel Labs"><meta property="og:type" content="website"><meta property="og:url" content="' + SITE() + '/realisations"><meta property="og:image" content="' + SITE() + '/img/og-image.png?v=elan">' +
      '<meta property="og:description" content="Sites web, boutiques en ligne, plateformes SaaS, applications IA et SEO : des produits livrés et en production.">' +
      bc.ld +
      '<style>' +
      '#projets{scroll-margin-top:96px;}' +
      '.rz-hero h1 em{font-style:normal;}' +
      '.rz-hero__lead strong{color:var(--text);font-weight:600;}' +
      '.rz-two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,64px);align-items:center;margin:clamp(48px,7vw,96px) 0;}' +
      '.rz-two__t h2{margin:14px 0 16px;font-size:clamp(1.65rem,1.1rem + 1.9vw,2.5rem);}' +
      '.rz-two__t p{margin:0 0 14px;color:var(--text-2);font-size:1.03rem;line-height:1.7;}' +
      '.rz-two__t .btn{margin-top:10px;}' +
      '.rz-deliver{display:grid;grid-template-columns:1fr 1fr;gap:12px;}' +
      '.rz-deliver>div{display:flex;flex-direction:column;gap:8px;padding:18px;border-radius:var(--r-md);transition:transform .5s var(--ease-out);}' +
      '.rz-deliver>div:hover{transform:translateY(-3px);}' +
      '.rz-deliver .card__icon{width:40px;height:40px;border-radius:12px;}' +
      '.rz-deliver b{font-family:var(--font-ui);font-weight:600;font-size:.98rem;}' +
      '.rz-deliver small{color:var(--text-2);font-size:.85rem;line-height:1.45;}' +
      '.rz-head{max-width:680px;margin:0 auto 28px;text-align:center;}' +
      '.rz-head .eyebrow{justify-content:center;}' +
      '.rz-head h2{font-size:var(--fs-h2);}' +
      '.rz-head p{margin-top:14px;color:var(--text-2);font-size:1.02rem;}' +
      '.rz-filters{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0 0 30px;}' +
      '.rz-fbtn{padding:9px 16px;border:0;border-radius:999px;font-family:var(--font-ui);font-size:.86rem;font-weight:500;color:var(--text-2);background:rgba(var(--ink),.05);box-shadow:inset 0 0 0 1px rgba(var(--ink),.1);transition:color var(--dur-fast),box-shadow var(--dur-fast),background-color var(--dur-fast);}' +
      '.rz-fbtn:hover{color:var(--text);box-shadow:inset 0 0 0 1px rgba(255,140,80,.45);}' +
      '.rz-fbtn.is-active{background:var(--accent);color:var(--on-accent);box-shadow:none;font-weight:600;}' +
      '.rz-arrow{display:flex;justify-content:center;margin:8px 0 -6px;pointer-events:none;}' +
      '.rz-arrow svg{width:min(230px,55%);height:auto;overflow:visible;}' +
      '.rz-arrow--r svg{transform:scaleX(-1);}' +
      '.rz-arrow .rz-flow{animation:rzFlow 1.4s linear infinite;}' +
      '@keyframes rzFlow{to{stroke-dashoffset:-30.4;}}' +
      '.rz-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(16px,2vw,26px);}' +
      '.rz-card{display:flex;flex-direction:column;overflow:hidden;border-radius:var(--r-lg);color:var(--text);}' +
      '.motion-ok .rz-card[data-reveal].is-in{transition:opacity var(--dur-reveal) var(--ease-out),transform .5s var(--ease-out);}' +
      '.rz-card.is-in:hover{transform:translateY(-6px);}' +
      '.rz-card--feat{box-shadow:var(--glass-shadow),0 0 0 1px rgba(255,110,40,.45);}' +
      '.rz-stretch{color:inherit;}' +
      '.rz-stretch::after{content:"";position:absolute;inset:0;z-index:1;}' +
      '.rz-stretch:focus-visible{outline:none;}' +
      '.rz-card:has(.rz-stretch:focus-visible){outline:2px solid var(--accent-2);outline-offset:3px;}' +
      '.rz-card__img{position:relative;aspect-ratio:16/9;overflow:hidden;background:var(--shade);}' +
      '.rz-card__img>img,.rz-card__img>svg{width:100%;height:100%;object-fit:cover;object-position:top center;display:block;transition:transform .7s var(--ease-out);}' +
      '.rz-card:hover .rz-card__img>img,.rz-card:hover .rz-card__img>svg{transform:scale(1.05);}' +
      '.rz-card__img::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.34),transparent 45%);pointer-events:none;}' +
      '.rz-visit,.rz-priv,.rz-wip{position:absolute;z-index:3;display:inline-flex;align-items:center;gap:6px;border-radius:999px;font-family:var(--font-ui);font-weight:600;white-space:nowrap;}' +
      '.rz-visit{left:12px;bottom:12px;padding:7px 13px;font-size:.8rem;color:var(--on-accent);background:var(--accent);box-shadow:0 8px 20px -8px rgba(255,85,0,.7);transition:transform var(--dur-base) var(--ease-out);}' +
      '.rz-visit:hover{transform:translateY(-2px);}' +
      '.rz-priv{left:12px;bottom:12px;z-index:2;padding:7px 12px;font-size:.76rem;color:var(--text);background:var(--bar-bg);box-shadow:inset 0 0 0 1px rgba(var(--ink),.14);}' +
      '.rz-wip{top:12px;left:12px;z-index:2;padding:5px 11px 5px 9px;font-size:.74rem;color:#1a1200;background:#fbbf24;}' +
      '.rz-wip--low{top:54px;}' +
      '.rz-star{position:absolute;top:12px;left:12px;z-index:2;display:grid;place-items:center;width:34px;height:34px;border-radius:50%;color:var(--on-accent);background:var(--accent);box-shadow:0 8px 20px -8px rgba(255,85,0,.8);}' +
      '.rz-card__eye{position:absolute;top:12px;right:12px;z-index:2;display:grid;place-items:center;width:38px;height:38px;border-radius:50%;color:var(--on-accent);background:var(--accent);opacity:0;transform:translateY(-6px);transition:opacity var(--dur-base),transform var(--dur-base) var(--ease-out);}' +
      '.rz-card:hover .rz-card__eye{opacity:1;transform:none;}' +
      '.rz-card__b{display:flex;flex-direction:column;flex:1;gap:8px;padding:20px 22px 22px;}' +
      '.rz-cat{font-family:var(--font-ui);font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-3);line-height:1.45;}' +
      '.rz-card h3{font-size:1.2rem;line-height:1.28;}' +
      '.rz-card p{flex:1;color:var(--text-2);font-size:.93rem;line-height:1.6;}' +
      '.rz-pills{display:flex;flex-wrap:wrap;gap:8px;}' +
      '.rz-pill{padding:6px 11px;border-radius:999px;font-size:.78rem;color:var(--text-2);background:rgba(var(--ink),.05);box-shadow:inset 0 0 0 1px rgba(var(--ink),.1);}' +
      '.rz-pill strong{color:var(--accent-3);font-weight:700;}' +
      '.rz-more{margin-top:6px;font-size:.9rem;}' +
      '.rz-steps{display:flex;flex-direction:column;gap:12px;}' +
      '.rz-step{display:flex;gap:16px;align-items:flex-start;padding:18px 20px;border-radius:var(--r-md);transition:transform .5s var(--ease-out);}' +
      '.rz-step:hover{transform:translateX(4px);}' +
      '.rz-step .n{min-width:2.2rem;font-family:var(--font-display);font-weight:800;font-size:1.5rem;line-height:1;color:transparent;-webkit-text-stroke:1px rgba(255,120,60,.75);}' +
      '.rz-step .t{display:block;margin-bottom:4px;font-family:var(--font-ui);font-weight:600;font-size:1.02rem;}' +
      '.rz-step small{color:var(--text-2);font-size:.9rem;line-height:1.55;}' +
      '.rz-final{position:relative;overflow:hidden;margin:clamp(48px,7vw,96px) 0 0;padding:clamp(40px,6vw,80px) clamp(22px,5vw,72px);border-radius:var(--r-xl);text-align:center;}' +
      '.rz-final h2{max-width:18ch;margin:0 auto;font-size:var(--fs-h2);}' +
      '.rz-final p{max-width:560px;margin:16px auto 28px;color:var(--text-2);font-size:var(--fs-lead);}' +
      '@media(max-width:860px){.rz-two{grid-template-columns:1fr;}}' +
      '@media(max-width:700px){.rz-grid{grid-template-columns:1fr;}}' +
      '@media(max-width:560px){.rz-arrow{display:none;}}' +
      '@media(max-width:520px){.rz-deliver{grid-template-columns:1fr;}.px-hero__ctas .btn{width:100%;}}' +
      '.motion-soft .rz-arrow .rz-flow{animation:none;}' +
      '</style>';

    const body = '<div class="px-wrap">' +
      '<header class="px-hero rz-hero">' +
        '<p class="eyebrow">Portfolio · Études de cas</p>' +
        '<h1>Des produits web qui <span class="grad">travaillent</span> vraiment</h1>' +
        '<p class="px-hero__lead rz-hero__lead">Sites vitrines, boutiques en ligne, plateformes SaaS, applications métier, agents IA… Voici des projets <strong>livrés et en production</strong>, conçus sur mesure pour des clients au Bénin, en Afrique et en Europe.</p>' +
        '<div class="px-hero__ctas"><a class="btn btn--primary btn--lg" href="/contact#rdv">Démarrer mon projet ' + ic('arrow-right', 18, 'icon--end') + '</a><a class="btn btn--glass btn--lg" href="#projets">Voir les projets</a></div>' +
      '</header>' +

      dotArrow(false) +

      '<section class="rz-two" aria-labelledby="rzSavoir">' +
        '<div class="rz-two__t"><p class="eyebrow">Notre savoir-faire</p>' +
          '<h2 id="rzSavoir">Un partenaire technique, du premier croquis à la mise en production</h2>' +
          '<p>Nous ne livrons pas des maquettes : nous concevons, développons et déployons des produits complets, pensés pour convertir et pour durer. Chaque projet est optimisé pour la vitesse, le référencement et les usages locaux (Mobile Money, multidevise, multilingue).</p>' +
          '<p>Une seule équipe, un seul interlocuteur, une exécution de bout en bout.</p></div>' +
        '<div class="rz-deliver" data-stagger>' +
          [['globe', 'Sites vitrines', 'Rapides, élégants, optimisés SEO.'],
            ['cart', 'E-commerce', 'Boutiques avec paiement local.'],
            ['layout', 'Plateformes SaaS', 'Produits web à abonnement.'],
            ['bot', 'IA et agents', 'Assistants et agents vocaux.'],
            ['briefcase', 'Applications métier', 'Outils de gestion sur mesure.'],
            ['trending', 'SEO et acquisition', 'Référencement et conversion.']]
            .map(d => '<div class="glass glass--flat" data-reveal><span class="card__icon">' + ic(d[0], 20) + '</span><b>' + d[1] + '</b><small>' + d[2] + '</small></div>').join('') +
        '</div>' +
      '</section>' +

      '<section id="projets" aria-labelledby="rzCases">' +
        '<div class="rz-head"><p class="eyebrow">Portfolio</p><h2 id="rzCases">Études de cas</h2><p>Filtrez par type de projet, puis cliquez pour lire l’étude complète : problématique, solution et stack technique.</p></div>' +
        filterBar +
        '<div class="rz-grid" data-stagger>' + cards + '</div>' +
      '</section>' +

      dotArrow(true) +

      '<section class="rz-two" aria-labelledby="rzMethode">' +
        '<div class="rz-steps" data-stagger>' +
          '<div class="rz-step glass glass--flat" data-reveal><span class="n">01</span><div><span class="t">Audit et cadrage</span><small>On comprend votre marché, vos objectifs et vos utilisateurs avant d’écrire la moindre ligne de code.</small></div></div>' +
          '<div class="rz-step glass glass--flat" data-reveal><span class="n">02</span><div><span class="t">Conception et design</span><small>Maquettes, parcours et identité : un produit clair, crédible et orienté conversion.</small></div></div>' +
          '<div class="rz-step glass glass--flat" data-reveal><span class="n">03</span><div><span class="t">Développement</span><small>Un code moderne, rapide et évolutif, testé et pensé pour le référencement.</small></div></div>' +
          '<div class="rz-step glass glass--flat" data-reveal><span class="n">04</span><div><span class="t">Lancement et suivi</span><small>Mise en ligne, mesure des résultats et accompagnement dans la durée.</small></div></div>' +
        '</div>' +
        '<div class="rz-two__t"><p class="eyebrow">Notre méthode</p>' +
          '<h2 id="rzMethode">Une exécution carrée, à chaque étape</h2>' +
          '<p>De l’idée au produit en ligne, nous suivons un processus éprouvé qui limite les mauvaises surprises et maximise l’impact. Vous savez toujours où en est votre projet.</p>' +
          '<a class="btn btn--glass" href="/contact#rdv">Discuter de votre projet ' + ic('arrow-right', 18, 'icon--end') + '</a></div>' +
      '</section>' +

      '<section class="rz-final glass glass--tint spot" data-reveal="scale" aria-labelledby="rzFinal"><div class="sf-cta__glow" aria-hidden="true"></div>' +
        '<p class="eyebrow">Réponse sous 24&nbsp;h</p>' +
        '<h2 id="rzFinal">Votre projet mérite la même exigence</h2>' +
        '<p>Parlez-en à notre équipe. Nous étudions votre besoin et on vous dit, franchement, ce qui est faisable et comment.</p>' +
        '<a class="btn btn--primary btn--lg" href="/contact#rdv">Discutons de votre projet ' + ic('arrow-right', 18, 'icon--end') + '</a>' +
      '</section></div>' +
      '<script>(function(){var bar=document.getElementById("rzFilters");if(!bar)return;var out=document.getElementById("rzCount");var cards=[].slice.call(document.querySelectorAll(".rz-grid .rz-card"));bar.addEventListener("click",function(e){var b=e.target.closest("[data-cat]");if(!b)return;bar.querySelectorAll("[data-cat]").forEach(function(x){var on=x===b;x.classList.toggle("is-active",on);x.setAttribute("aria-pressed",on?"true":"false");});var cat=b.getAttribute("data-cat"),n=0;cards.forEach(function(c){var ok=cat==="all"||((" "+(c.getAttribute("data-cats")||"")+" ").indexOf(" "+cat+" ")>-1);c.style.display=ok?"":"none";if(ok){n++;c.classList.add("is-in");}});if(out)out.textContent=n+(n>1?" projets affichés":" projet affiché");});})();</script>';
    res.set('Content-Type', 'text/html; charset=utf-8').send(blogShell(head, body, { current: '/realisations', showCta: false }));
  } catch (e) { console.error('[realisations]', e.message); res.status(500).send('Erreur'); }
});
app.get('/realisations/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').toLowerCase().slice(0, 100);
    const c = await CaseStudy.findOne({ slug, status: 'publie' }).lean();
    if (!c) return res.status(404).send(blogShell('<title>Réalisation introuvable — Pirabel Labs</title><meta name="robots" content="noindex">',
      '<section class="px-empty"><p class="eyebrow">Erreur 404</p><h1 class="px-title">Réalisation introuvable</h1><p>Cette réalisation n’existe pas ou n’est plus en ligne.</p>' +
      '<a class="btn btn--primary" href="/realisations">' + ic('arrow-left', 18) + ' Toutes les réalisations</a></section>', { current: '/realisations' }));
    const metaTitle = escapeHtml(c.seoTitle || c.title);
    const metaDesc = escapeHtml(c.metaDescription || c.excerpt || '');
    const url = SITE() + '/realisations/' + encodeURIComponent(c.slug);
    const ogImg = c.featuredImage ? (c.featuredImage.startsWith('http') ? c.featuredImage : SITE() + pubImg(c.featuredImage)) : (SITE() + '/img/og-image.png?v=elan');
    const sub = [c.sector, c.location].filter(Boolean).join(' · ');
    // Détecte les technologies citées dans le contenu -> badges (dot coloré + nom).
    // « var(--text) » : pastille neutre qui suit le thème (Next.js, Vercel…).
    const TECHS = [
      ['Next.js', 'var(--text)', /next\.?\s?js/i], ['React', '#61DAFB', /\breact\b/i], ['Astro', '#FF5D01', /\bastro\b/i],
      ['Vue.js', '#42B883', /\bvue\.?js\b|\bVue 3\b/i], ['Node.js', '#3C873A', /node\.?\s?js/i], ['TypeScript', '#3178C6', /typescript/i],
      ['JavaScript', '#F7DF1E', /javascript/i], ['HTML5', '#E34F26', /\bhtml5?\b/i], ['CSS3', '#1572B6', /\bcss3?\b/i],
      ['Tailwind CSS', '#38BDF8', /tailwind/i], ['WordPress', '#3aa0d6', /wordpress/i], ['Vite', '#646CFF', /\bVite(?:\.js|JS)?\b(?! ?[,.])/],
      ['Supabase', '#3ECF8E', /supabase/i], ['PostgreSQL', '#6a8fe0', /postgre/i], ['MongoDB', '#47A248', /mongodb/i],
      ['Vercel', 'var(--text)', /\bvercel\b/i], ['Cloudflare', '#F38020', /cloudflare/i], ['Cloudinary', '#5a6ff0', /cloudinary/i],
      ['Stripe', '#8b83ff', /\bstripe\b/i], ['CinetPay', '#00A95C', /cinetpay/i], ['PayPal', '#3b7bbf', /paypal/i],
      ['PWA', '#a06cf0', /\bpwa\b/i], ['Chart.js', '#FF6384', /chart\.?\s?js/i], ['Tesseract.js', 'var(--text)', /tesseract/i],
      ['jsPDF', 'var(--text)', /jspdf/i], ['Web3', '#F16822', /\bweb3\b/i], ['Mobile Money', '#FFCC00', /mobile\s?money/i],
      ['Google Analytics', '#E37400', /google analytics|analytics\s?4|\bga4\b/i], ['IA / LLM', '#10A37F', /\bllm\b|intelligence artificielle|mod[èe]les? de langage|\bgpt\b|assistant ia|agent vocal/i],
      ['SEO', '#4CAF50', /\bseo\b|r[ée]f[ée]rencement/i],
    ];
    const hay = String(c.content || '') + ' ' + String(c.sector || '');
    const foundTechs = TECHS.filter(t => t[2].test(hay)).slice(0, 14);
    const techSection = foundTechs.length ? '<section class="cd-tech glass glass--flat" aria-labelledby="cdTech"><h2 class="cd-tech__h" id="cdTech">Technologies utilisées</h2><ul class="cd-badges">' +
      foundTechs.map(t => '<li class="cd-badge"><i style="background:' + t[1] + '"></i>' + escapeHtml(t[0]) + '</li>').join('') + '</ul></section>' : '';

    const cdStyle = '<style>' +
      '.cd-head{max-width:860px;margin:0 auto clamp(28px,4vw,40px);text-align:center;}' +
      '.cd-head .eyebrow{justify-content:center;margin-bottom:14px;}' +
      '.cd-tags{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center;margin-bottom:18px;}' +
      '.cd-cat{font-family:var(--font-ui);font-size:.76rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-3);}' +
      '.cd-wip,.cd-priv{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-family:var(--font-ui);font-size:.72rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;}' +
      '.cd-wip{color:var(--warning);background:rgba(251,191,36,.12);box-shadow:inset 0 0 0 1px rgba(251,191,36,.42);}' +
      '.cd-priv{color:var(--text-2);background:rgba(var(--ink),.06);box-shadow:inset 0 0 0 1px rgba(var(--ink),.16);}' +
      '.cd-head h1{font-family:var(--font-display);font-weight:800;font-size:clamp(1.85rem,1.1rem + 2.2vw,2.9rem);line-height:1.08;letter-spacing:-.03em;}' +
      '.cd-lead{max-width:680px;margin:18px auto 0;color:var(--text-2);font-size:var(--fs-lead);line-height:1.6;}' +
      '.cd-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:26px;}' +
      '.cd-hero{max-width:1100px;margin:0 auto clamp(28px,4vw,44px);padding:6px;border-radius:var(--r-xl);}' +
      '.cd-hero__in{aspect-ratio:16/9;overflow:hidden;border-radius:calc(var(--r-xl) - 6px);background:var(--shade);}' +
      '.cd-hero__in>img,.cd-hero__in>svg{width:100%;height:100%;object-fit:cover;object-position:top center;display:block;}' +
      '.cd-hero--photo .cd-hero__in{aspect-ratio:auto;display:flex;justify-content:center;align-items:flex-start;}' +
      '.cd-hero--photo .cd-hero__in img{width:auto;height:auto;max-width:100%;max-height:80vh;object-fit:contain;}' +
      '.cd-metrics{display:flex;flex-wrap:wrap;gap:14px;max-width:1100px;margin:0 auto 18px;}' +
      '.cd-metric{flex:1;min-width:13rem;padding:22px 24px;border-radius:var(--r-lg);}' +
      '.cd-metric b{display:block;font-family:var(--font-display);font-weight:800;font-size:2.2rem;line-height:1;color:var(--accent-2);}' +
      '.cd-metric span{display:block;margin-top:8px;color:var(--text-2);font-size:.92rem;line-height:1.45;}' +
      '.cd-tech{max-width:1100px;margin:0 auto clamp(36px,5vw,56px);padding:20px 22px;border-radius:var(--r-lg);}' +
      '.cd-tech__h{margin:0 0 14px;font-family:var(--font-ui);font-size:.74rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--text-3);}' +
      '.cd-badges{display:flex;flex-wrap:wrap;gap:8px;}' +
      '.cd-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 13px;border-radius:12px;font-family:var(--font-ui);font-size:.86rem;font-weight:500;color:var(--text);background:rgba(var(--ink),.05);box-shadow:inset 0 0 0 1px rgba(var(--ink),.12);}' +
      '.cd-badge i{width:9px;height:9px;border-radius:50%;flex-shrink:0;}' +
      '.cd-body{max-width:72ch;margin:0 auto;font-size:1.06rem;line-height:1.8;color:rgba(var(--text-rgb),.86);}' +
      '.cd-body .cs-intro{margin:0 0 2.4em;padding-left:20px;border-left:3px solid var(--accent);font-size:1.2rem;line-height:1.7;color:var(--text);font-weight:500;}' +
      '.cd-body h2{display:flex;align-items:center;gap:12px;margin:2.4em 0 .9em;font-size:clamp(1.35rem,1.1rem + .8vw,1.65rem);line-height:1.2;color:var(--text);}' +
      '.cd-body h2::before{content:"";flex-shrink:0;width:8px;height:1.3em;border-radius:3px;background:linear-gradient(180deg,#ff7a33,var(--accent));}' +
      '.cd-body p{margin:0 0 1.1em;}' +
      '.cd-body strong{color:var(--text);font-weight:650;}' +
      '.cd-body a{color:var(--accent-3);text-decoration:underline;text-underline-offset:3px;}' +
      '.cd-body ul{display:grid;gap:10px;margin:.6em 0 1.4em;padding:0;list-style:none;}' +
      '.cd-body .cs-stack{grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));}' +
      '.cd-body li{position:relative;padding:14px 16px 14px 44px;border-radius:var(--r-sm);line-height:1.55;color:var(--text-2);background:var(--flat-bg);box-shadow:inset 0 0 0 1px rgba(var(--ink),.1);}' +
      '.cd-body li::before{content:"";position:absolute;left:16px;top:17px;width:16px;height:16px;border-radius:50%;background:var(--accent-soft);box-shadow:inset 0 0 0 1px rgba(255,140,80,.45);}' +
      '.cd-body li::after{content:"";position:absolute;left:21px;top:21px;width:6px;height:4px;border-left:2px solid var(--accent-2);border-bottom:2px solid var(--accent-2);transform:rotate(-45deg);}' +
      '.cd-body code{padding:.1em .4em;border-radius:6px;font-size:.9em;background:rgba(var(--ink),.08);}' +
      '.dot-arrow{display:flex;justify-content:center;align-items:center;margin:1.2rem 0;pointer-events:none;overflow:hidden;}' +
      '.dot-arrow svg{width:min(230px,52%);height:auto;overflow:visible;}' +
      '.dot-arrow--r svg{transform:scaleX(-1);}' +
      '.dot-arrow .df{animation:dotFlow 1.5s linear infinite;}' +
      '@keyframes dotFlow{to{stroke-dashoffset:-30.4;}}' +
      '.cd-gwrap{max-width:1100px;margin:clamp(40px,6vw,64px) auto 0;}' +
      '.cd-gwrap>h2{display:flex;align-items:center;gap:12px;font-size:clamp(1.35rem,1.1rem + .8vw,1.65rem);}' +
      '.cd-gwrap>h2::before{content:"";width:8px;height:1.3em;border-radius:3px;background:linear-gradient(180deg,#ff7a33,var(--accent));}' +
      '.cd-gwrap>p{margin:8px 0 20px;color:var(--text-2);font-size:.95rem;}' +
      '.cd-gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,21rem),1fr));gap:14px;}' +
      '.cd-shot{display:block;padding:5px;border-radius:var(--r-md);cursor:zoom-in;transition:transform .5s var(--ease-out);}' +
      '.cd-shot:hover{transform:translateY(-4px);}' +
      '.cd-shot img{display:block;width:100%;height:auto;border-radius:calc(var(--r-md) - 5px);}' +
      '.cd-lb{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:clamp(16px,4vw,48px);background:rgba(8,8,8,.9);cursor:zoom-out;}' +
      '.cd-lb.is-open{display:flex;}' +
      '.cd-lb img{max-width:100%;max-height:92vh;border-radius:10px;box-shadow:0 20px 60px rgba(0,0,0,.6);}' +
      '.cd-lb__x{position:absolute;top:14px;right:16px;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:50%;color:#fff;background:rgba(255,255,255,.12);font-size:1.8rem;line-height:1;}' +
      '.cd-cta{position:relative;overflow:hidden;max-width:1100px;margin:clamp(44px,6vw,72px) auto 0;padding:clamp(36px,5vw,64px) clamp(22px,5vw,64px);border-radius:var(--r-xl);text-align:center;}' +
      '.cd-cta h2{font-size:var(--fs-h2);}' +
      '.cd-cta p{max-width:560px;margin:14px auto 0;color:var(--text-2);font-size:var(--fs-lead);}' +
      '@media(max-width:560px){.cd-btns .btn{width:100%;}}' +
      '@media(max-width:600px){.cd-body{font-size:1rem;}.cd-metric b{font-size:1.85rem;}.dot-arrow{display:none;}}' +
      '.motion-soft .dot-arrow .df{animation:none;}' +
      '</style>';
    const bc = crumbs([{ name: 'Réalisations', path: '/realisations' }, { name: c.title, path: '/realisations/' + encodeURIComponent(c.slug) }]);
    const head = '<title>' + metaTitle + '</title><meta name="description" content="' + metaDesc + '">' +
      '<link rel="canonical" href="' + url + '">' +
      '<meta property="og:title" content="' + metaTitle + '"><meta property="og:description" content="' + metaDesc + '"><meta property="og:type" content="article"><meta property="og:url" content="' + url + '"><meta property="og:image" content="' + escapeHtml(ogImg) + '"><meta name="twitter:card" content="summary_large_image">' +
      bc.ld + cdStyle;
    const visitUrl = (!c.confidential && c.projectUrl && /^https?:\/\//i.test(c.projectUrl)) ? c.projectUrl : '';
    const visitBtn = visitUrl ? '<a class="btn btn--primary" href="' + escapeHtml(visitUrl) + '" target="_blank" rel="noopener nofollow">Visiter le site ' + ic('arrow-up-right', 18) + '</a>' : '';
    const visitBtnG = visitUrl ? '<a class="btn btn--glass btn--lg" href="' + escapeHtml(visitUrl) + '" target="_blank" rel="noopener nofollow">Visiter le site ' + ic('arrow-up-right', 18) + '</a>' : '';
    const heroInner = c.featuredImage ? '<img src="' + escapeHtml(pubImg(c.featuredImage)) + '" alt="' + escapeHtml(c.imageAlt || c.title) + '" fetchpriority="high" decoding="async">' : casePlaceholder(c, 0);
    const mb = (v, l) => v ? '<div class="cd-metric glass glass--tint"><b>' + escapeHtml(v) + '</b><span>' + escapeHtml(l) + '</span></div>' : '';
    const metrics = (c.metric1Value || c.metric2Value) ? '<div class="cd-metrics">' + mb(c.metric1Value, c.metric1Label) + mb(c.metric2Value, c.metric2Label) + '</div>' : '';
    // Met en valeur la liste de la stack technique (grille de puces)
    const contentHtml = themeContent(String(c.content || '').replace(/(<h2>[^<]*[Ss]tack[^<]*<\/h2>\s*)<ul>/, '$1<ul class="cs-stack">'));
    // Flèches décoratives entre les sections du contenu (avant chaque <h2> sauf le premier)
    let _sec = 0;
    const contentArrowed = contentHtml.replace(/<h2/g, function () { _sec++; return _sec === 1 ? '<h2' : pageArrow(_sec) + '<h2'; });
    const hasBody = !!contentHtml.trim();
    // Galerie de captures d'écran (études de cas SEO, aperçus)
    const gallery = Array.isArray(c.gallery) ? c.gallery.filter(Boolean) : [];
    const gallerySection = gallery.length
      ? '<section class="cd-gwrap" aria-labelledby="cdGal"><h2 id="cdGal">Aperçus du projet</h2><p>Cliquez sur une image pour l’agrandir.</p><div class="cd-gallery">' +
        gallery.map((g, i) => '<a class="cd-shot glass glass--flat" href="' + escapeHtml(pubImg(g)) + '" data-full="' + escapeHtml(pubImg(g)) + '"><img src="' + escapeHtml(pubImg(g)) + '" alt="Aperçu ' + (i + 1) + ' — ' + escapeHtml(c.title) + '" loading="lazy" decoding="async"></a>').join('') +
        '</div></section>'
      : '';
    const preCtaArrow = (hasBody || gallery.length) ? pageArrow(9) : '';
    const lightbox = gallery.length ? '<script>(function(){var s=document.querySelectorAll(".cd-shot");if(!s.length)return;var lb=document.createElement("div");lb.className="cd-lb";lb.setAttribute("role","dialog");lb.setAttribute("aria-modal","true");lb.setAttribute("aria-label","Aperçu agrandi");lb.innerHTML=\'<button type="button" class="cd-lb__x" aria-label="Fermer">&times;</button><img alt="">\';document.body.appendChild(lb);var im=lb.querySelector("img"),x=lb.querySelector(".cd-lb__x"),from=null;function op(a){from=a;im.src=a.getAttribute("data-full")||a.getAttribute("href");var t=a.querySelector("img");im.alt=t?t.alt:"";lb.classList.add("is-open");x.focus();}function cl(){if(!lb.classList.contains("is-open"))return;lb.classList.remove("is-open");im.src="";if(from)from.focus();}s.forEach(function(a){a.addEventListener("click",function(e){e.preventDefault();op(a);});});lb.addEventListener("click",function(e){if(e.target===lb||e.target===x)cl();});document.addEventListener("keydown",function(e){if(e.key==="Escape")cl();});})();</script>' : '';
    const body = '<div class="px-wrap">' + bc.html +
      '<header class="cd-head">' +
      '<p class="eyebrow">Étude de cas</p>' +
      '<div class="cd-tags">' + (sub ? '<span class="cd-cat">' + escapeHtml(sub) + '</span>' : '') + (c.inProgress ? '<span class="cd-wip">' + ic('clock', 14) + ' En cours</span>' : '') + (c.confidential ? '<span class="cd-priv">' + ic('lock', 14) + ' Projet confidentiel</span>' : '') + '</div>' +
      '<h1>' + frt(c.title) + '</h1>' + (c.excerpt ? '<p class="cd-lead">' + frt(c.excerpt) + '</p>' : '') +
      (visitBtn ? '<div class="cd-btns">' + visitBtn + '</div>' : '') + '</header>' +
      '<figure class="cd-hero glass glass--flat' + (c.featuredImage ? ' cd-hero--photo' : '') + '"><div class="cd-hero__in">' + heroInner + '</div></figure>' +
      metrics + techSection +
      (hasBody ? '<div class="cd-body">' + contentArrowed + '</div>' : '') +
      gallerySection +
      preCtaArrow +
      '<section class="cd-cta glass glass--tint spot" data-reveal="scale" aria-labelledby="cdCta"><div class="sf-cta__glow" aria-hidden="true"></div><p class="eyebrow">Réponse sous 24&nbsp;h</p><h2 id="cdCta">Un projet similaire&nbsp;?</h2><p>Parlez-nous de votre besoin : on étudie votre projet et on vous dit franchement ce qui est faisable, et comment.</p><div class="cd-btns"><a class="btn btn--primary btn--lg" href="/contact#rdv">Discutons de votre projet ' + ic('arrow-right', 18, 'icon--end') + '</a>' + visitBtnG + '</div></section>' +
      '</div>' + lightbox;
    res.set('Content-Type', 'text/html; charset=utf-8').send(blogShell(head, body, { current: '/realisations', showCta: false }));
  } catch (e) { console.error('[realisations.slug]', e.message); res.status(500).send('Erreur'); }
});

// --- PUBLIC : sert une image (media) en binaire, décodée depuis le data URL stocké ---
app.get('/media/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id).lean();
    if (!media || !media.data) return res.status(404).send('Not found');
    const m = /^data:([^;]+);base64,(.*)$/.exec(media.data);
    if (!m) return res.status(404).send('Not found');
    res.set('Content-Type', m[1]);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(Buffer.from(m[2], 'base64'));
  } catch (e) { return res.status(500).send('Erreur'); }
});

// --- AVIS : generer un lien de demande (sans passer par une fiche) ---
app.post('/api/admin/reviews/create-link', auth, adminOnly, limitBody(6), async (req, res) => {
  try {
    const name = sanitize(req.body.name || '', 120);
    const email = sanitizeEmail(req.body.email || '');
    const serviceUsed = sanitize(req.body.serviceUsed || '', 100);
    const wantMail = req.body.sendEmail !== false;
    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom du client requis.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email du client invalide.' });
    const review = await Review.create({
      clientName: name, clientEmail: email, rating: 5,
      comment: 'En attente de la soumission de l avis par le client.',
      serviceUsed, status: 'en_attente', requestToken: generateToken(), source: 'admin_request',
    });
    const publicUrl = SITE() + '/avis/' + review.requestToken;
    if (wantMail) {
      const html = masterTemplate({
        headerType: 'hero', preheader: 'Votre avis en 2 minutes',
        title: 'Bonjour ' + escapeHtml(name.split(' ')[0]) + ',',
        body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Merci pour votre confiance&nbsp;! Pourriez-vous partager votre avis sur notre collaboration&nbsp;? Cela prend 2 minutes et nous aide beaucoup.</p>',
        cta: 'Donner mon avis', ctaUrl: publicUrl,
      });
      sendEmail(email, 'Votre avis sur Pirabel Labs (2 min)', html).catch(() => {});
    }
    res.json({ success: true, publicUrl, emailSent: wantMail });
  } catch (e) { console.error('[reviews.create-link]', e.message); res.status(500).json({ error: 'Erreur lors de la création du lien.' }); }
});

// --- PUBLIC : page temoignages (avis publies, apres moderation) ---
// Uniquement des avis réels, vérifiés avant publication. Tant qu'aucun n'est publié,
// la page montre les projets livrés (études de cas publiques) : jamais d'avis inventé.
app.get('/temoignages', async (req, res) => {
  try {
    const reviews = await Review.find({ publishedOnSite: true }).sort({ rating: -1, publishedAt: -1 }).limit(80).lean();
    const cases = reviews.length ? [] : await CaseStudy.find({ status: 'publie', confidential: { $ne: true }, featuredImage: { $nin: ['', null] } })
      .select('title slug sector location excerpt featuredImage imageAlt').sort({ featured: -1, publishedAt: -1 }).limit(9).lean();
    const cards = reviews.length ? reviews.map(r => {
      const n = Math.max(1, Math.min(5, r.rating || 5));
      const stars = '<div class="tm-stars" role="img" aria-label="Note : ' + n + ' sur 5">' + '&#9733;'.repeat(n) + '<span>' + '&#9733;'.repeat(5 - n) + '</span></div>';
      const sub = [r.clientRole, r.clientCompany, r.clientCity].filter(Boolean).join(' · ');
      const initials = String(r.clientName || '?').replace(/[^\p{L} ]/gu, ' ').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
      return '<figure class="tm-card glass glass--flat spot" data-reveal>' + stars +
        '<blockquote class="tm-quote"><p>«&nbsp;' + frt(r.comment) + '&nbsp;»</p></blockquote>' +
        '<figcaption class="tm-who"><span class="tm-avatar" aria-hidden="true">' + escapeHtml(initials) + '</span><span><span class="tm-name">' + escapeHtml(r.clientName) + '</span>' +
        (sub || r.serviceUsed ? '<span class="tm-role">' + escapeHtml(sub) + (r.serviceUsed ? (sub ? ' — ' : '') + escapeHtml(r.serviceUsed) : '') + '</span>' : '') +
        '</span></figcaption></figure>';
    }).join('') : '';
    const caseCards = cases.map((c) => {
      const name = String(c.title || '').split(' — ')[0];
      const sub = [String(c.sector || '').split(' · ')[0], String(c.location || '').split(' · ')[0]].filter(Boolean).join(' · ');
      return '<a class="tm-case glass glass--flat spot" data-reveal href="/realisations/' + escapeHtml(c.slug) + '">' +
        '<span class="tm-case__img"><img src="' + escapeHtml(pubImg(c.featuredImage)) + '" alt="' + escapeHtml(c.imageAlt || name) + '" loading="lazy" decoding="async"></span>' +
        '<span class="tm-case__b">' + (sub ? '<span class="tm-role">' + escapeHtml(sub) + '</span>' : '') + '<span class="tm-name">' + frt(name) + '</span>' +
        '<span class="tm-case__t">' + frt(String(c.excerpt || '').slice(0, 180)) + '</span><span class="tm-case__more">Voir le projet ' + ic('arrow-right', 16) + '</span></span></a>';
    }).join('');
    const pending = reviews.length ? '' : '<div class="px-note glass glass--flat tm-note"><p><strong>Nos avis sont vérifiés avant publication.</strong> Nous les recueillons auprès de nos clients à la fin de chaque projet : les premiers seront publiés ici très bientôt. En attendant, voici des projets livrés, en ligne aujourd’hui.</p></div>';
    const bc = crumbs([{ name: 'Avis clients', path: '/temoignages' }]);
    const head = '<title>Avis clients — Pirabel Labs</title>' +
      '<meta name="description" content="Ce que disent nos clients : avis vérifiés sur les services de Pirabel Labs.">' +
      '<link rel="canonical" href="' + SITE() + '/temoignages"><meta property="og:title" content="Avis clients — Pirabel Labs"><meta property="og:type" content="website"><meta property="og:url" content="' + SITE() + '/temoignages">' +
      '<meta property="og:description" content="Ce que disent nos clients : avis vérifiés sur les services de Pirabel Labs.">' +
      bc.ld +
      '<style>' +
      '.tm-grid{columns:3 20rem;column-gap:clamp(16px,1.8vw,24px);}' +
      '.tm-card{display:flex;flex-direction:column;gap:16px;margin:0 0 clamp(16px,1.8vw,24px);padding:clamp(22px,2.4vw,30px);border-radius:var(--r-lg);break-inside:avoid;}' +
      '.tm-stars{color:var(--accent-2);font-size:1.1rem;letter-spacing:2px;line-height:1;}' +
      '.tm-stars span{color:rgba(var(--ink),.18);}' +
      '.tm-quote{margin:0;}' +
      '.tm-quote p{color:var(--text);font-size:1.02rem;line-height:1.65;}' +
      '.tm-who{display:flex;align-items:center;gap:12px;padding-top:14px;border-top:1px solid rgba(var(--ink),.08);}' +
      '.tm-avatar{display:grid;place-items:center;flex-shrink:0;width:42px;height:42px;border-radius:50%;font-family:var(--font-ui);font-weight:700;font-size:.9rem;color:var(--accent-2);background:var(--accent-soft);box-shadow:inset 0 0 0 1px rgba(255,140,80,.35);}' +
      '.tm-name{display:block;font-family:var(--font-ui);font-weight:600;}' +
      '.tm-role{display:block;color:var(--text-3);font-size:.84rem;line-height:1.4;}' +
      '.tm-note{margin:0 0 clamp(20px,2.4vw,32px);padding:18px 22px;border-radius:var(--r-lg);}' +
      '.tm-cases{display:grid;gap:clamp(16px,1.8vw,24px);grid-template-columns:repeat(auto-fill,minmax(min(100%,19rem),1fr));}' +
      '.tm-case{display:flex;flex-direction:column;border-radius:var(--r-lg);overflow:hidden;text-decoration:none;color:inherit;}' +
      '.tm-case__img{display:block;aspect-ratio:16/10;overflow:hidden;background:rgba(var(--ink),.06);}' +
      '.tm-case__img img{width:100%;height:100%;object-fit:cover;object-position:top;display:block;}' +
      '.tm-case__b{display:flex;flex-direction:column;gap:6px;padding:18px 20px 20px;}' +
      '.tm-case__t{color:var(--text-2);font-size:.95rem;line-height:1.55;}' +
      '.tm-case__more{display:inline-flex;align-items:center;gap:6px;margin-top:6px;color:var(--accent-3);font-family:var(--font-ui);font-weight:600;font-size:.92rem;}' +
      '</style>';
    const body = '<div class="px-wrap"><header class="px-hero"><p class="eyebrow">Avis clients</p><h1>Ils nous font <span class="grad">confiance</span></h1>' +
      '<p class="px-hero__lead">Des avis réels, vérifiés avant publication, et les projets que nous avons livrés.</p>' +
      '<div class="px-hero__ctas"><a class="btn btn--primary" href="/contact">Démarrer mon projet ' + ic('arrow-right', 18, 'icon--end') + '</a><a class="btn btn--glass" href="/realisations">Voir nos réalisations</a></div></header>' +
      pending + (reviews.length ? '<div class="tm-grid">' + cards + '</div>' : '<div class="tm-cases">' + caseCards + '</div>') + '</div>';
    res.set('Content-Type', 'text/html; charset=utf-8').send(blogShell(head, body, { current: '/temoignages' }));
  } catch (e) { console.error('[temoignages]', e.message); res.status(500).send('Erreur'); }
});

// === COMMENTAIRES DE BLOG (publics, modérés) ===
const commentLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 8, message: 'Trop de commentaires. Réessayez plus tard.', keyPrefix: 'comment' });

app.get('/api/blog/:slug/comments', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').toLowerCase().slice(0, 100);
    const comments = await Comment.find({ articleSlug: slug, status: 'approuve' }).sort({ createdAt: 1 }).select('author content createdAt').limit(200).lean();
    res.json({ comments });
  } catch (e) { res.json({ comments: [] }); }
});

app.post('/api/blog/:slug/comments', commentLimiter, honeypotCheck('cm_check_hp'), limitBody(6), async (req, res) => {
  try {
    const slug = String(req.params.slug || '').toLowerCase().slice(0, 100);
    const article = await Article.findOne({ slug, status: 'publie' }).select('title').lean();
    if (!article) return res.status(404).json({ error: 'Article introuvable.' });
    const author = sanitize(req.body.author || '', 80);
    const email = sanitizeEmail(req.body.email || '');
    const content = sanitize(req.body.content || '', 3000);
    if (!author || author.length < 2) return res.status(400).json({ error: 'Nom requis (2 caractères minimum).' });
    if (!content || content.trim().length < 2) return res.status(400).json({ error: 'Commentaire trop court.' });
    const ipHash = crypto.createHash('sha256').update((req.ip || '') + (process.env.JWT_SECRET || '')).digest('hex').slice(0, 32);
    await Comment.create({ articleSlug: slug, articleTitle: article.title, author, email, content, status: 'en_attente', ipHash });
    await sendEmail(process.env.CONTACT_EMAIL || 'contact@pirabellabs.com', '[Blog] Nouveau commentaire à modérer — ' + article.title,
      masterTemplate({ title: 'Nouveau commentaire', subtitle: article.title, body: '<p style="font-size:15px;color:rgba(229,226,225,0.8);"><strong>' + escapeHtml(author) + '</strong> a écrit&nbsp;:</p><div style="border-left:3px solid #FF5500;padding:12px 16px;background:#0e0e0e;color:rgba(229,226,225,0.7);">' + escapeHtml(content) + '</div>', cta: "Modérer dans l'admin", ctaUrl: SITE() + '/admin/dashboard' })).catch(() => {});
    res.json({ success: true, message: 'Merci\u00a0! Votre commentaire sera publié après modération.' });
  } catch (e) { console.error('[comment]', e.message); res.status(500).json({ error: 'Erreur serveur.' }); }
});

app.get('/api/admin/comments', auth, adminOnly, async (req, res) => {
  try {
    const status = sanitize(req.query.status || '', 20);
    const q = (status && ['en_attente', 'approuve', 'rejete'].includes(status)) ? { status } : {};
    const comments = await Comment.find(q).sort({ createdAt: -1 }).limit(500).lean();
    const counts = {
      en_attente: await Comment.countDocuments({ status: 'en_attente' }),
      approuve: await Comment.countDocuments({ status: 'approuve' }),
      total: await Comment.countDocuments({}),
    };
    res.json({ comments, counts });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});
app.patch('/api/admin/comments/:id', auth, adminOnly, limitBody(5), async (req, res) => {
  try {
    const status = sanitize(req.body.status || '', 20);
    if (!['en_attente', 'approuve', 'rejete'].includes(status)) return res.status(400).json({ error: 'Statut invalide.' });
    await Comment.updateOne({ _id: req.params.id }, { status });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});
app.delete('/api/admin/comments/:id', auth, adminOnly, async (req, res) => {
  try { await Comment.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: 'Erreur.' }); }
});

// --- SITEMAP dynamique (pages reelles + articles publies) ---
app.get('/sitemap.xml', async (req, res) => {
  try {
    const fs = require('fs');
    const root = path.join(__dirname, '..', 'public');
    let pages = [];
    try { pages = require('../app/sitemap-pages.json'); } catch (e) {}
    if (!pages || !pages.length) {
      try {
        pages = fs.readdirSync(root).filter(f => f.endsWith('.html') && !['404.html'].includes(f))
          .map(f => f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, ''));
      } catch (e2) {}
    }
    const arts = await Article.find({ status: 'publie' }).select('slug updatedAt').lean();
    const urls = [];
    urls.push({ loc: SITE() + '/blog', lastmod: new Date().toISOString().slice(0, 10) });
    pages.forEach(p => urls.push({ loc: SITE() + p, lastmod: null }));
    arts.forEach(a => urls.push({ loc: SITE() + '/blog/' + a.slug, lastmod: new Date(a.updatedAt).toISOString().slice(0, 10) }));
    const cases = await CaseStudy.find({ status: 'publie' }).select('slug updatedAt').lean();
    urls.push({ loc: SITE() + '/realisations', lastmod: new Date().toISOString().slice(0, 10) });
    cases.forEach(c => urls.push({ loc: SITE() + '/realisations/' + c.slug, lastmod: new Date(c.updatedAt).toISOString().slice(0, 10) }));
    urls.push({ loc: SITE() + '/temoignages', lastmod: new Date().toISOString().slice(0, 10) });
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map(u => '  <url><loc>' + u.loc + '</loc>' + (u.lastmod ? '<lastmod>' + u.lastmod + '</lastmod>' : '') + '</url>').join('\n') +
      '\n</urlset>';
    res.set('Content-Type', 'application/xml; charset=utf-8').send(xml);
  } catch (e) { res.status(500).send('Erreur sitemap'); }
});

// === HEALTH ===
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// === ADMIN STATIC VIEWS ===
const ADMIN_LOGIN_PATH = '/' + (process.env.ADMIN_SECRET_PATH || 'pirabel-admin-7x9k2m');
app.get(ADMIN_LOGIN_PATH, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app', 'views', 'admin-login.html'));
});
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app', 'views', 'admin-dashboard.html'));
});
app.get('/admin/leads', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app', 'views', 'admin-dashboard.html'));
});

// === ADMIN SETUP (one-time, gated by zero-admin check) ===
// GET /admin/setup : sert la page de creation initiale si aucun admin n'existe.
// Une fois un admin cree, retourne 404 et la page n'est plus accessible.
app.get('/admin/setup', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) return res.status(404).send('Not found');
    res.sendFile(path.join(__dirname, '..', 'app', 'views', 'admin-setup.html'));
  } catch (err) {
    console.error('[setup]', err.message);
    res.status(500).send('Erreur serveur.');
  }
});

// POST /api/admin/setup : cree le compte admin si aucun n'existe.
const setupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: 'Trop de tentatives. Réessayez dans 1 heure.',
  keyPrefix: 'setup',
});
app.post('/api/admin/setup', setupLimiter, limitBody(5), async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(403).json({ error: 'Un compte administrateur existe déjà.' });
    }
    const name = sanitize(req.body.name || '', 120);
    const email = sanitizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom requis (2 caracteres minimum).' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Adresse e-mail invalide.' });
    if (password.length < 12) return res.status(400).json({ error: 'Mot de passe trop court (12 caracteres minimum).' });

    const user = new User({ name, email, password, role: 'admin', isActive: true });
    await user.save();
    console.log(`[setup] admin created via web setup: ${email} (id: ${user._id})`);
    res.json({ success: true, message: 'Compte administrateur créé.' });
  } catch (err) {
    console.error('[setup]', err.message);
    res.status(500).json({ error: 'Erreur serveur. Réessayez.' });
  }
});

// Bloque URLs admin obvious
['/login', '/admin', '/admin-login', '/wp-admin', '/wp-login.php', '/administrator'].forEach(p => {
  app.get(p, (req, res) => res.status(404).send('Not found'));
});

// Anciennes pages anglaises /en/* (site EN retiré lors de la refonte FR).
// On renvoie un 410 Gone (Google les retire vite) avec une page de réorientation,
// au lieu de rediriger vers l'accueil (soft 404 + visiteur perdu).
app.get(['/en', '/en/*'], (req, res) => {
  const html = '<!doctype html><html lang="fr"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="robots" content="noindex,follow"><title>Page non disponible — Pirabel Labs</title>' +
    '<style>*{box-sizing:border-box;margin:0}body{background:#0e0e0e;color:#e5e2e1;font-family:Inter,system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;text-align:center}' +
    '.w{max-width:34rem}.b{display:inline-block;background:rgba(255,85,0,0.12);color:#FF5500;font-weight:700;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;padding:.35rem .8rem;border-radius:999px;margin-bottom:1.2rem}' +
    'h1{font-size:clamp(1.5rem,4vw,2.1rem);color:#fff;margin-bottom:.8rem;line-height:1.2}p{color:rgba(229,226,225,0.65);line-height:1.65;margin-bottom:1.8rem}' +
    '.g{display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center}a.btn{background:#FF5500;color:#fff;text-decoration:none;padding:.7rem 1.3rem;border-radius:999px;font-weight:700;font-size:.85rem}' +
    'a.gh{background:transparent;border:1px solid rgba(229,226,225,0.2);color:#e5e2e1}a.btn:hover{opacity:.9}</style></head><body><div class="w">' +
    '<span class="b">Pirabel Labs</span>' +
    '<h1>Cette page n\'est plus disponible</h1>' +
    '<p>Notre site est désormais entièrement en français. La version anglaise a été retirée, mais tout notre accompagnement (sites web, SEO, marketing digital, IA) reste disponible&nbsp;:</p>' +
    '<div class="g"><a class="btn" href="/">Accueil</a><a class="btn gh" href="/services">Nos services</a><a class="btn gh" href="/blog">Blog</a><a class="btn gh" href="/contact">Nous contacter</a></div>' +
    '</div></body></html>';
  res.status(410).set({ 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex' }).send(html);
});

// ========================================================================
// === MEDIA (image upload + galerie admin) ===
// ========================================================================

// Helper : valide une dataURL d'image
function validateImageDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:(image\/(jpeg|jpg|png|webp|gif|svg\+xml));base64,(.+)$/i);
  if (!match) return null;
  const mime = match[1];
  const base64 = match[3];
  const size = Math.floor(base64.length * 0.75); // approximate binary size
  if (size > 2 * 1024 * 1024) return null; // 2MB max
  return { mime, size, base64 };
}

// POST /api/admin/media : upload une image (base64)
app.post('/api/admin/media', auth, adminOnly, limitBody(3000), async (req, res) => {
  try {
    const { data, filename, alt, folder, tags, width, height } = req.body;
    const validated = validateImageDataUrl(data);
    if (!validated) return res.status(400).json({ error: 'Image invalide (formats acceptés : JPG, PNG, WEBP, GIF, SVG ; 2 Mo maximum).' });

    const VALID_FOLDERS = ['general', 'realisations', 'blog', 'team', 'logos', 'icones', 'autres'];

    const media = await Media.create({
      filename: sanitize(filename || 'image', 200),
      alt: sanitize(alt || '', 200),
      mimeType: validated.mime,
      size: validated.size,
      width: Math.max(0, parseInt(width) || 0),
      height: Math.max(0, parseInt(height) || 0),
      data,
      folder: VALID_FOLDERS.includes(folder) ? folder : 'general',
      tags: Array.isArray(tags) ? tags.slice(0, 10).map(t => sanitize(String(t), 50)) : [],
      uploadedBy: req.user._id
    });

    res.json({ success: true, media: { _id: media._id, filename: media.filename, alt: media.alt, folder: media.folder, size: media.size, mimeType: media.mimeType, createdAt: media.createdAt } });
  } catch (err) {
    console.error('[media] upload error:', err.message);
    res.status(500).json({ error: 'Erreur upload : ' + err.message });
  }
});

// GET /api/admin/media : liste (sans data, juste metadata + thumbnails)
app.get('/api/admin/media', auth, adminOnly, async (req, res) => {
  try {
    const folder = sanitize(req.query.folder || '', 50);
    const q = {};
    if (folder) q.folder = folder;
    const items = await Media.find(q, '-data').sort({ createdAt: -1 }).limit(200);
    const folders = await Media.aggregate([
      { $group: { _id: '$folder', count: { $sum: 1 }, totalSize: { $sum: '$size' } } }
    ]);
    res.json({ items, folders });
  } catch (err) {
    console.error('[media] list error:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/admin/media/:id : retourne le data URL complet
app.get('/api/admin/media/:id', auth, adminOnly, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media introuvable.' });
    res.json({ _id: media._id, filename: media.filename, alt: media.alt, mimeType: media.mimeType, data: media.data, size: media.size, width: media.width, height: media.height, folder: media.folder, tags: media.tags, createdAt: media.createdAt });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PATCH /api/admin/media/:id : update alt, tags, folder
app.patch('/api/admin/media/:id', auth, adminOnly, limitBody(5), async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media introuvable.' });
    if (req.body.alt !== undefined) media.alt = sanitize(req.body.alt, 200);
    if (req.body.filename !== undefined) media.filename = sanitize(req.body.filename, 200);
    if (req.body.folder !== undefined) {
      const VALID = ['general', 'realisations', 'blog', 'team', 'logos', 'icones', 'autres'];
      if (VALID.includes(req.body.folder)) media.folder = req.body.folder;
    }
    if (Array.isArray(req.body.tags)) media.tags = req.body.tags.slice(0, 10).map(t => sanitize(String(t), 50));
    await media.save();
    res.json({ success: true, media: { _id: media._id, filename: media.filename, alt: media.alt, folder: media.folder, tags: media.tags } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/admin/media/:id
app.delete('/api/admin/media/:id', auth, adminOnly, async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media introuvable.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ========================================================================
// === QUOTES (devis) ===
// ========================================================================

// Un devis est accessible par son jeton long (historique) ou par son alias court.
function refDevis(valeur) {
  const v = String(valeur || '').slice(0, 100);
  return { $or: [{ publicToken: v }, { publicSlug: v.toLowerCase() }] };
}

// Alias court : mots lisibles + suffixe aleatoire (4 caracteres) pour rester non devinable.
function genererAlias(base) {
  const mots = String(base || 'devis').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // retire les accents
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .split('-').filter(Boolean).slice(0, 2).join('-').slice(0, 24) || 'devis';
  const suffixe = crypto.randomBytes(3).toString('hex').slice(0, 4);
  return `${mots}-${suffixe}`;
}

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

// Pourcentage borné 0–100, avec valeur par défaut si absent ou illisible.
function pctOu(v, defaut) {
  const n = Number(v);
  if (v === undefined || v === null || v === '' || !Number.isFinite(n)) return defaut;
  return Math.min(100, Math.max(0, n));
}

// Nettoie les lignes et calcule les totaux (remise appliquée avant TVA, arrondi selon la devise).
function recalcQuote(items, taxRate, currency, discountPercent) {
  const cleaned = (Array.isArray(items) ? items : []).map(i => {
    const q = Number(i && i.quantity);
    const qty = Number.isFinite(q) ? Math.max(0, q) : 1;
    const p = Number(i && i.unitPrice);
    const price = arrondiDevise(Number.isFinite(p) ? Math.max(0, p) : 0, currency);
    return {
      description: sanitize(String((i && i.description) || ''), 500),
      quantity: qty,
      unitPrice: price,
      total: arrondiDevise(qty * price, currency)   // même calcul que le pre-save du modèle
    };
  }).filter(i => i.description);
  const subtotal = arrondiDevise(cleaned.reduce((s, i) => s + i.total, 0), currency);
  const discountAmount = arrondiDevise(subtotal * (discountPercent || 0) / 100, currency);
  const base = subtotal - discountAmount;
  const tax = arrondiDevise(base * (taxRate || 0) / 100, currency);
  return { items: cleaned, subtotal, discountAmount, taxAmount: tax, total: arrondiDevise(base + tax, currency) };
}

// Bloc HTML (e-mail) : lignes, remise, TVA, total — et, pour une facture, le déjà
// réglé et le reste à payer quand un paiement partiel existe.
function blocMontantsEmail(doc, opts) {
  opts = opts || {};
  const cur = doc.currency;
  const td = 'padding:8px 12px;border-bottom:1px solid #222;font-size:13px;';
  const th = 'padding:8px 12px;background:#1a1a1a;font-size:12px;color:rgba(229,226,225,0.6);';
  const rows = (doc.items || []).map(i =>
    `<tr><td style="${td}color:#e5e2e1;">${escapeHtml(i.description)}</td><td style="${td}color:rgba(229,226,225,0.7);text-align:right;">${i.quantity}</td><td style="${td}color:rgba(229,226,225,0.7);text-align:right;">${moneyFmt(i.unitPrice, cur)}</td><td style="${td}color:#e5e2e1;font-weight:600;text-align:right;">${moneyFmt(i.total, cur)}</td></tr>`
  ).join('');
  const ligne = (label, val) => `<div style="font-size:13px;color:rgba(229,226,225,0.7);margin-bottom:4px;">${label} : ${val}</div>`;
  let html = `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #333;border-bottom:1px solid #333;"><thead><tr><th style="${th}text-align:left;text-transform:uppercase;letter-spacing:0.08em;">Description</th><th style="${th}text-align:right;">Qté</th><th style="${th}text-align:right;">PU</th><th style="${th}text-align:right;">Total</th></tr></thead><tbody>${rows}</tbody></table>`;
  html += '<div style="margin-top:16px;text-align:right;">' + ligne('Sous-total', moneyFmt(doc.subtotal, cur));
  if (doc.discountAmount > 0) html += ligne(`Remise ${doc.discountPercent} %`, '− ' + moneyFmt(doc.discountAmount, cur));
  if (doc.taxRate > 0) html += ligne(`TVA ${doc.taxRate} %`, moneyFmt(doc.taxAmount, cur));
  html += `<div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:20px;color:#FF5500;margin-top:8px;">Total : ${moneyFmt(doc.total, cur)}</div>`;
  if (opts.facture) {
    const paye = Invoice.amountPaidOf(doc);
    if (paye > 0 && doc.status !== 'annulee') {
      html += ligne('Déjà réglé', moneyFmt(paye, cur));
      html += `<div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:18px;color:#e5e2e1;margin-top:6px;">Reste à payer : ${moneyFmt(Invoice.balanceOf(doc), cur)}</div>`;
    }
  }
  return html + '</div>';
}

function emailDevisHtml(quote, publicUrl) {
  return masterTemplate({
    headerType: 'hero',
    preheader: `Votre devis ${quote.reference} - ${quote.title}`,
    title: 'Bonjour ' + escapeHtml((quote.clientName || '').split(' ')[0]) + ',',
    subtitle: 'Votre devis est prêt',
    body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Comme convenu, voici votre devis personnalisé :</p>' +
      '<div style="margin:24px 0;padding:24px;background:#0e0e0e;border:1px solid rgba(255,85,0,0.3);border-radius:12px;">' +
      '<div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:12px;color:#FF5500;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">' + escapeHtml(quote.reference) + '</div>' +
      '<div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:20px;color:#e5e2e1;line-height:1.3;margin-bottom:16px;">' + escapeHtml(quote.title) + '</div>' +
      blocMontantsEmail(quote) +
      '</div>' +
      (quote.validUntil ? '<p style="font-size:14px;color:rgba(229,226,225,0.6);line-height:1.6;">Valable jusqu’au <strong style="color:#e5e2e1;">' + new Date(quote.validUntil).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ_AGENCE }) + '</strong>.</p>' : '') +
      '<p style="font-size:14px;color:rgba(229,226,225,0.5);">Cliquez ci-dessous pour consulter le détail, accepter ou refuser le devis directement en ligne.</p>',
    cta: 'Consulter et valider le devis',
    ctaUrl: publicUrl
  });
}

function emailFactureHtml(invoice, publicUrl) {
  const reste = Invoice.balanceOf(invoice);
  const partiel = Invoice.amountPaidOf(invoice) > 0;
  return masterTemplate({
    headerType: 'hero',
    preheader: `Votre facture ${invoice.reference} - ${invoice.title}`,
    title: 'Bonjour ' + escapeHtml((invoice.clientName || '').split(' ')[0]) + ',',
    subtitle: 'Votre facture est disponible',
    body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Voici votre facture :</p>' +
      '<div style="margin:24px 0;padding:24px;background:#0e0e0e;border:1px solid rgba(255,85,0,0.3);border-radius:12px;">' +
      '<div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:12px;color:#FF5500;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">' + escapeHtml(invoice.reference) + '</div>' +
      '<div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:20px;color:#e5e2e1;line-height:1.3;margin-bottom:16px;">' + escapeHtml(invoice.title) + '</div>' +
      blocMontantsEmail(invoice, { facture: true }) +
      '</div>' +
      (reste > 0 && invoice.dueDate ? '<p style="font-size:14px;color:rgba(229,226,225,0.6);line-height:1.6;">' + (partiel ? 'Reste de ' + moneyFmt(reste, invoice.currency) + ' à régler' : 'À régler') + ' avant le <strong style="color:#e5e2e1;">' + new Date(invoice.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ_AGENCE }) + '</strong>.</p>' : '') +
      '<p style="font-size:14px;color:rgba(229,226,225,0.5);">Cliquez ci-dessous pour consulter le détail et les modalités de paiement.</p>',
    cta: 'Consulter la facture',
    ctaUrl: publicUrl
  });
}

// État de facturation d'un devis à partir de ses factures (hors annulées).
// Une ancienne facture sans « kind » est une facture totale.
function etatFacturationDevis(quote, factures) {
  const actives = (factures || []).filter(i => i.status !== 'annulee');
  const complete = actives.find(i => (i.kind || 'totale') !== 'acompte') || null;
  const acomptes = actives.filter(i => i.kind === 'acompte');
  const montantAcomptes = arrondiDevise(acomptes.reduce((s, i) => s + (i.total || 0), 0), quote.currency);
  return {
    complete: !!complete,
    reference: complete ? complete.reference : '',
    acomptes: acomptes.length,
    montantAcomptes,
    peutTotale: !complete && !acomptes.length,
    peutAcompte: !complete && montantAcomptes < (quote.total || 0),
    peutSolde: !complete && acomptes.length > 0 && montantAcomptes < (quote.total || 0),
  };
}

// POST /api/admin/quotes : créer un devis (brouillon)
app.post('/api/admin/quotes', auth, adminOnly, limitBody(50), async (req, res) => {
  try {
    const b = req.body || {};
    const { leadId, title, items, taxRate, currency, introduction, terms, validDays } = b;
    if (!leadId || !/^[a-f0-9]{24}$/i.test(leadId)) return res.status(400).json({ error: 'Client invalide.' });
    if (!title || String(title).trim().length < 3) return res.status(400).json({ error: 'Titre requis (3 caractères minimum).' });
    const errV = validerChampsDocument(b);
    if (errV) return res.status(400).json({ error: errV });

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Client introuvable.' });

    const cur = DEVISES.includes(currency) ? currency : 'EUR';
    const tva = pctOu(taxRate, 0);
    const remise = pctOu(b.discountPercent, 0);
    const totals = recalcQuote(items, tva, cur, remise);

    const quote = await creerAvecReference(Quote, 'DEVIS', {
      leadId: lead._id,
      clientName: lead.name,
      clientEmail: lead.email,
      clientCompany: lead.company || '',
      clientPhone: lead.phone || '',
      clientAddress: lead.clientData?.address || '',
      items: totals.items,
      subtotal: totals.subtotal,
      discountPercent: remise,
      discountAmount: totals.discountAmount,
      taxRate: tva,
      taxAmount: totals.taxAmount,
      total: totals.total,
      currency: cur,
      depositPercent: pctOu(b.depositPercent, 30),
      title: sanitize(String(title), 200),
      introduction: sanitize(introduction || '', 2000),
      terms: sanitize(terms || '', 5000),
      validUntil: new Date(Date.now() + (Number(validDays) || 30) * 86400000),
      publicToken: generateToken(),
      publicSlug: genererAlias(sanitize(String(title), 200)),
      createdBy: req.user._id
    });

    res.json({ success: true, quote });
  } catch (err) {
    console.error('[quotes] create error:', err.message);
    res.status(500).json({ error: messageErreur(err, 'Erreur lors de la création du devis.') });
  }
});

// GET /api/admin/quotes : liste (+ factures liées) et statistiques par devise
app.get('/api/admin/quotes', auth, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const status = sanitize(req.query.status || '', 30);
    const leadId = sanitize(req.query.leadId || '', 30);
    const q = {};
    if (status === 'expire') q.$or = [{ status: 'expire' }, { status: { $in: ['envoye', 'consulte'] }, validUntil: { $lt: now } }];
    else if (['brouillon', 'envoye', 'consulte', 'accepte', 'refuse', 'annule'].includes(status)) q.status = status;
    if (/^[a-f0-9]{24}$/i.test(leadId)) q.leadId = leadId;
    const quotes = (await Quote.find(q).sort({ createdAt: -1 }).limit(300))
      .filter(x => !status || statutDevisEffectif(x, now) === status);

    const [liees, tous] = await Promise.all([
      Invoice.find({ quoteId: { $in: quotes.map(x => x._id) } })
        .select('reference kind status total currency quoteId publicToken dueDate payments paidAt').lean(),
      Quote.find({}).select('status currency total validUntil').lean(),
    ]);
    const parDevis = {};
    liees.forEach(i => {
      const k = String(i.quoteId);
      (parDevis[k] = parDevis[k] || []).push({
        _id: String(i._id), reference: i.reference, kind: i.kind || 'totale', status: Invoice.effectiveStatus(i, now),
        total: i.total, currency: i.currency, publicToken: i.publicToken,
      });
    });

    // Statistiques sur TOUS les devis (pas la liste plafonnée), ventilées par devise.
    const stats = { total: 0, byStatus: {}, acceptedByCurrency: {}, pendingByCurrency: {}, acceptanceRate: 0 };
    tous.forEach(d => {
      const s = statutDevisEffectif(d, now);
      const c = d.currency || 'EUR';
      stats.total++;
      stats.byStatus[s] = (stats.byStatus[s] || 0) + 1;
      if (s === 'accepte') stats.acceptedByCurrency[c] = arrondiDevise((stats.acceptedByCurrency[c] || 0) + (d.total || 0), c);
      if (s === 'envoye' || s === 'consulte') stats.pendingByCurrency[c] = arrondiDevise((stats.pendingByCurrency[c] || 0) + (d.total || 0), c);
    });
    const base = stats.total - (stats.byStatus.brouillon || 0) - (stats.byStatus.annule || 0);
    stats.acceptanceRate = base > 0 ? Math.round(((stats.byStatus.accepte || 0) / base) * 100) : 0;

    res.json({
      quotes: quotes.map(x => {
        const o = exposerDevis(x);
        o.invoices = parDevis[String(x._id)] || [];
        o.facturation = etatFacturationDevis(x, o.invoices);
        return o;
      }),
      stats
    });
  } catch (err) {
    console.error('[quotes] list error:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/admin/quotes/:id
app.get('/api/admin/quotes/:id', auth, adminOnly, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    res.json(exposerDevis(quote));
  } catch (err) {
    res.status(500).json({ error: messageErreur(err) });
  }
});

// PATCH /api/admin/quotes/:id : modification (impossible une fois accepté, refusé ou annulé)
app.patch('/api/admin/quotes/:id', auth, adminOnly, limitBody(50), async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    if (['accepte', 'refuse', 'annule'].includes(quote.status)) {
      return res.status(403).json({ error: 'Devis verrouillé : il a déjà été accepté, refusé ou annulé.' });
    }
    const b = req.body || {};
    const errV = validerChampsDocument(b, { dates: ['validUntil'] });
    if (errV) return res.status(400).json({ error: errV });

    if (b.title !== undefined) {
      const t = sanitize(String(b.title), 200);
      if (t.trim().length < 3) return res.status(400).json({ error: 'Titre requis (3 caractères minimum).' });
      quote.title = t;
    }
    if (b.introduction !== undefined) quote.introduction = sanitize(String(b.introduction), 2000);
    if (b.terms !== undefined) quote.terms = sanitize(String(b.terms), 5000);
    if (b.internalNotes !== undefined) quote.internalNotes = sanitize(String(b.internalNotes), 5000);
    if (b.currency !== undefined && DEVISES.includes(b.currency)) quote.currency = b.currency;
    if (b.taxRate !== undefined) quote.taxRate = pctOu(b.taxRate, 0);
    if (b.discountPercent !== undefined) quote.discountPercent = pctOu(b.discountPercent, 0);
    if (b.depositPercent !== undefined) quote.depositPercent = pctOu(b.depositPercent, 30);
    if (b.validUntil !== undefined && b.validUntil !== '') quote.validUntil = new Date(b.validUntil);
    else if (b.validDays !== undefined && b.validDays !== '') quote.validUntil = new Date(Date.now() + Number(b.validDays) * 86400000);

    // Alias court personnalise. Un suffixe aleatoire est ajoute s'il n'y en a pas,
    // pour qu'un lien reste non devinable : c'est la seule protection du devis.
    if (typeof b.publicSlug === 'string') {
      let slug = b.publicSlug.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
      if (slug.length < 3) return res.status(400).json({ error: 'Alias trop court (3 caractères minimum).' });
      // Le suffixe aleatoire est TOUJOURS ajoute : impossible de distinguer de maniere
      // fiable un vrai suffixe aleatoire d'un mot ordinaire, et un alias entierement
      // devinable exposerait le devis a qui tente sa chance.
      slug = slug.replace(/-[a-f0-9]{4}$/, '').slice(0, 34) + '-' + crypto.randomBytes(3).toString('hex').slice(0, 4);
      const pris = await Quote.findOne({ publicSlug: slug, _id: { $ne: quote._id } }).select('_id').lean();
      if (pris) return res.status(409).json({ error: 'Cet alias est déjà utilisé par un autre devis.' });
      quote.publicSlug = slug;
    }

    // Correction manuelle du statut (ex. consultation faussement enregistree).
    // Revenir a « envoye » efface la date de consultation, sinon elle resterait incoherente.
    if (['brouillon', 'envoye', 'consulte', 'expire'].includes(b.status)) {
      quote.status = b.status;
      if (b.status === 'envoye' || b.status === 'brouillon') quote.viewedAt = undefined;
    }
    // Validité prolongée : un devis marqué « expire » redevient consultable par le client
    // (sauf si l'équipe vient justement de le marquer expiré à la main).
    if (b.status === undefined && quote.status === 'expire' && quote.validUntil && quote.validUntil > new Date()) {
      quote.status = quote.viewedAt ? 'consulte' : (quote.sentAt ? 'envoye' : 'brouillon');
    }

    if (Array.isArray(b.items)) {
      quote.items = recalcQuote(b.items, quote.taxRate, quote.currency, quote.discountPercent).items;
    }

    await quote.save();   // le pre-save recalcule sous-total, remise, TVA et total
    res.json({ success: true, quote: exposerDevis(quote) });
  } catch (err) {
    console.error('[quotes] update error:', err.message);
    res.status(500).json({ error: messageErreur(err) });
  }
});

// POST /api/admin/quotes/:id/cancel : annuler un devis (sans le supprimer)
app.post('/api/admin/quotes/:id/cancel', auth, adminOnly, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    if (quote.status === 'annule') return res.status(409).json({ error: 'Ce devis est déjà annulé.' });
    if (quote.status === 'refuse') return res.status(409).json({ error: 'Ce devis a été refusé par le client : il est déjà clos.' });
    const actives = await Invoice.countDocuments({ quoteId: quote._id, status: { $ne: 'annulee' } });
    if (actives) return res.status(409).json({ error: 'Des factures sont rattachées à ce devis : annulez-les d’abord.' });
    quote.status = 'annule';
    quote.cancelledAt = new Date();
    await quote.save();
    res.json({ success: true, quote: exposerDevis(quote) });
  } catch (err) {
    res.status(500).json({ error: messageErreur(err) });
  }
});

// DELETE /api/admin/quotes/:id
app.delete('/api/admin/quotes/:id', auth, adminOnly, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id).select('_id').lean();
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    const liees = await Invoice.countDocuments({ quoteId: quote._id });
    if (liees) return res.status(409).json({ error: 'Des factures sont rattachées à ce devis : il ne peut pas être supprimé. Annulez-le plutôt.' });
    await Quote.deleteOne({ _id: quote._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: messageErreur(err) });
  }
});

// POST /api/admin/quotes/:id/send : envoyer par e-mail.
// { canal: 'whatsapp' } : le lien est partagé par WhatsApp, on marque le devis envoyé SANS e-mail.
app.post('/api/admin/quotes/:id/send', auth, adminOnly, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    if (['accepte', 'refuse', 'annule'].includes(quote.status)) {
      return res.status(409).json({ error: 'Ce devis est déjà accepté, refusé ou annulé : il ne peut plus être envoyé.' });
    }
    if (statutDevisEffectif(quote) === 'expire') {
      return res.status(409).json({ error: 'Ce devis a expiré : prolongez sa validité avant de l’envoyer.' });
    }
    // Un brouillon resté trop longtemps en préparation ne part pas déjà périmé :
    // sa durée de validité d'origine repart du jour d'envoi (appliqué avant l'e-mail).
    if (quote.status === 'brouillon') reporterValiditeBrouillon(quote);

    // On privilégie l'alias court dans le lien envoyé au client : plus lisible,
    // notamment quand le devis transite par WhatsApp.
    const publicUrl = `https://www.pirabellabs.com/devis/${quote.publicSlug || quote.publicToken}`;
    const viaWhatsApp = req.body && req.body.canal === 'whatsapp';

    if (!viaWhatsApp) {
      // Pièce jointe facultative (proposition détaillée en PDF, par exemple).
      const att = req.body && req.body.attachment;
      const attachments = (att && att.filename && att.content)
        ? [{ filename: String(att.filename).slice(0, 200), content: att.content }]
        : undefined;
      const envoye = await sendEmail(quote.clientEmail, `Votre devis Pirabel Labs - ${quote.reference}`, emailDevisHtml(quote, publicUrl), { attachments })
        .catch(e => { console.error('[quotes] send email error:', e.message); return false; });
      if (!envoye) return res.status(502).json({ error: "Envoi refusé par le fournisseur d'e-mail." });
    }

    const premierEnvoi = quote.status === 'brouillon';
    if (premierEnvoi) { reporterValiditeBrouillon(quote); quote.status = 'envoye'; }
    quote.sentAt = new Date();
    await quote.save();

    if (premierEnvoi) {
      await Lead.findByIdAndUpdate(quote.leadId, {
        $inc: { quotesSent: 1 },
        $set: { lastQuoteAt: new Date(), stage: 'devis_envoye' }
      });
    }

    res.json({ success: true, message: viaWhatsApp ? 'Devis marqué comme envoyé.' : 'Devis envoyé au client.', publicUrl });
  } catch (err) {
    console.error('[quotes] send error:', err.message);
    res.status(500).json({ error: messageErreur(err, 'Erreur lors de l’envoi du devis.') });
  }
});

// === PUBLIC quote view (no auth, by token) ===
app.get('/api/quotes/:token', async (req, res) => {
  try {
    const quote = await Quote.findOne(refDevis(req.params.token));
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });

    // Ne pas marquer « consulte » quand c'est l'equipe qui previsualise : sinon le statut
    // ne dit plus rien sur le comportement reel du client.
    if (!quote.viewedAt && !estRequeteInterne(req)) {
      quote.viewedAt = new Date();
      if (quote.status === 'envoye') quote.status = 'consulte';
      await Quote.updateOne({ _id: quote._id, viewedAt: null }, { $set: { viewedAt: quote.viewedAt, status: quote.status } });
    }

    const statut = statutDevisEffectif(quote);
    res.json({
      reference: quote.reference,
      title: quote.title,
      clientName: quote.clientName,
      clientCompany: quote.clientCompany,
      items: quote.items,
      subtotal: quote.subtotal,
      discountPercent: quote.discountPercent || 0,
      discountAmount: quote.discountAmount || 0,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      total: quote.total,
      currency: quote.currency,
      depositPercent: quote.depositPercent,
      introduction: quote.introduction,
      terms: quote.terms,
      validUntil: quote.validUntil,
      issuedAt: quote.issuedAt,
      status: statut,
      canAnswer: statut === 'envoye' || statut === 'consulte'
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

const MSG_DEVIS_EXPIRE = 'Ce devis a expiré, contactez-nous pour le mettre à jour.';

// Brouillon dont la validité est déjà dépassée au moment de l'envoi : on conserve la
// durée prévue à la création (30 jours par défaut) à partir d'aujourd'hui.
function reporterValiditeBrouillon(quote) {
  const now = Date.now();
  if (!quote.validUntil || new Date(quote.validUntil).getTime() >= now) return;
  const depart = new Date(quote.createdAt || quote.issuedAt || now).getTime();
  const duree = new Date(quote.validUntil).getTime() - depart;
  quote.validUntil = new Date(now + (duree > 86400000 ? duree : 30 * 86400000));
}

app.post('/api/quotes/:token/accept', async (req, res) => {
  try {
    const q0 = await Quote.findOne(refDevis(req.params.token));
    if (!q0) return res.status(404).json({ error: 'Devis introuvable.' });
    if (q0.status === 'accepte') return res.json({ success: true, message: 'Devis déjà accepté.' });
    if (q0.status === 'refuse') return res.status(403).json({ error: 'Devis déjà refusé.' });
    if (q0.status === 'annule') return res.status(410).json({ error: 'Ce devis a été annulé, contactez-nous pour en obtenir un nouveau.' });
    const now = new Date();
    if (q0.status === 'brouillon') return res.status(409).json({ error: 'Ce devis n’a pas encore été finalisé : contactez-nous.' });
    if (statutDevisEffectif(q0, now) === 'expire') return res.status(410).json({ error: MSG_DEVIS_EXPIRE });

    // Acceptation atomique : si deux clics arrivent en même temps, un seul « gagne »
    // et lui seul met à jour la fiche client et envoie les e-mails.
    const quote = await Quote.findOneAndUpdate(
      { _id: q0._id, status: { $in: ['envoye', 'consulte'] }, $or: [{ validUntil: { $gte: now } }, { validUntil: null }] },
      { $set: { status: 'accepte', acceptedAt: now, updatedAt: now } },
      { new: true }
    );
    if (!quote) {
      const actuel = await Quote.findById(q0._id).select('status').lean();
      if (actuel && actuel.status === 'accepte') return res.json({ success: true, message: 'Devis déjà accepté.' });
      return res.status(409).json({ error: 'Ce devis ne peut plus être accepté. Contactez-nous.' });
    }

    // Convertir le lead en client
    const lead = await Lead.findById(quote.leadId);
    if (lead) {
      lead.stage = 'client';
      lead.status = 'converti';
      lead.clientData = lead.clientData || {};
      if (!lead.clientData.becameClientAt) lead.clientData.becameClientAt = new Date();
      lead.clientData.totalContractValue = (lead.clientData.totalContractValue || 0) + quote.total;
      lead.clientData.quotesCount = (lead.clientData.quotesCount || 0) + 1;
      await lead.save();
    }

    // Email admin
    await sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      `[Pirabel Labs] Devis ACCEPTÉ — ${quote.reference} (${moneyFmt(quote.total, quote.currency)})`,
      masterTemplate({
        title: 'Devis accepté !',
        body: `<p>Le devis <strong>${escapeHtml(quote.reference)}</strong> (${escapeHtml(quote.title)}) vient d’être accepté par <strong>${escapeHtml(quote.clientName)}</strong> (${escapeHtml(quote.clientEmail)}).</p><p>Montant : <strong>${moneyFmt(quote.total, quote.currency)}</strong></p><p>Le prospect a été converti en client. Lancement du projet à planifier.</p>`,
        cta: 'Ouvrir le tableau de bord',
        ctaUrl: 'https://www.pirabellabs.com/admin/dashboard'
      })
    ).catch(e => console.error('[quotes] accept admin email:', e.message));

    // Email confirmation client
    await sendEmail(
      quote.clientEmail,
      `Devis accepté — ${quote.reference}`,
      masterTemplate({
        title: 'Merci ' + escapeHtml(quote.clientName.split(' ')[0]) + ' !',
        body: `<p>Nous avons bien reçu votre acceptation du devis <strong>${escapeHtml(quote.reference)}</strong> pour ${escapeHtml(quote.title)}.</p><p>Un membre de notre équipe vous contacte sous 24 h pour planifier le lancement du projet.</p><p>Bien cordialement,<br><strong>L’équipe Pirabel Labs</strong></p>`,
        cta: 'Visiter pirabellabs.com',
        ctaUrl: 'https://www.pirabellabs.com'
      })
    ).catch(e => console.error('[quotes] accept client email:', e.message));

    res.json({ success: true, message: 'Devis accepté. Nous vous recontactons sous 24 h.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.post('/api/quotes/:token/refuse', async (req, res) => {
  try {
    const q0 = await Quote.findOne(refDevis(req.params.token));
    if (!q0) return res.status(404).json({ error: 'Devis introuvable.' });
    if (q0.status === 'accepte') return res.status(403).json({ error: 'Devis déjà accepté.' });
    if (q0.status === 'refuse') return res.json({ success: true, message: 'Devis déjà refusé.' });
    if (q0.status === 'annule') return res.status(410).json({ error: 'Ce devis a été annulé.' });
    const now = new Date();
    if (q0.status === 'brouillon') return res.status(409).json({ error: 'Ce devis n’a pas encore été finalisé : contactez-nous.' });
    if (statutDevisEffectif(q0, now) === 'expire') return res.status(410).json({ error: MSG_DEVIS_EXPIRE });

    const raison = sanitize(req.body?.reason || 'Aucune raison fournie', 1000);
    const quote = await Quote.findOneAndUpdate(
      { _id: q0._id, status: { $in: ['envoye', 'consulte'] } },
      { $set: { status: 'refuse', refusedAt: now, updatedAt: now,
        internalNotes: ((q0.internalNotes || '') + '\n[Refus client] ' + raison).slice(0, 5000) } },
      { new: true }
    );
    if (!quote) return res.status(409).json({ error: 'Ce devis ne peut plus être refusé.' });

    await sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      `[Pirabel Labs] Devis REFUSÉ — ${quote.reference}`,
      masterTemplate({
        title: 'Devis refusé',
        body: `<p>Le devis <strong>${escapeHtml(quote.reference)}</strong> vient d’être refusé par <strong>${escapeHtml(quote.clientName)}</strong>.</p><p>Raison : ${escapeHtml(req.body?.reason || 'non précisée')}</p>`,
        cta: 'Ouvrir le tableau de bord',
        ctaUrl: 'https://www.pirabellabs.com/admin/dashboard'
      })
    ).catch(() => {});

    res.json({ success: true, message: 'Devis refusé. Merci pour votre retour.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Static : page publique devis
app.get('/devis/:token', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app', 'views', 'public-devis.html'));
});

// ========================================================================
// === INVOICES (factures) ===
// ========================================================================

// Recalcule statut et date de règlement après ajout / suppression d'un paiement.
function appliquerStatutReglement(inv) {
  const pays = inv.payments || [];
  if (!pays.length) {
    if (['payee', 'partiellement_payee'].includes(inv.status)) {
      inv.status = inv.viewedAt ? 'consultee' : (inv.sentAt ? 'envoyee' : 'brouillon');
    }
    inv.paidAt = undefined;
    return;
  }
  if (Invoice.balanceOf(inv) <= 0) {
    const dernier = pays.reduce((a, p) => (new Date(p.date) > new Date(a.date) ? p : a));
    inv.status = 'payee';
    inv.paidAt = dernier.date;
    if (dernier.method) inv.paymentMethod = dernier.method;
  } else {
    inv.status = 'partiellement_payee';
    inv.paidAt = undefined;
  }
}

// Ajoute un paiement après validation. Renvoie un message d'erreur, ou null.
function enregistrerPaiement(inv, p) {
  if (inv.status === 'annulee') return 'Facture annulée : aucun paiement ne peut être enregistré.';
  if (inv.status === 'brouillon') return 'Facture encore en brouillon : envoyez-la (e-mail ou WhatsApp) avant d’enregistrer un paiement.';
  const reste = Invoice.balanceOf(inv);
  if (inv.status === 'payee' || reste <= 0) return 'Cette facture est déjà entièrement réglée.';
  const brut = Number(p.amount);
  const montant = arrondiDevise(brut, inv.currency);
  if (!Number.isFinite(brut) || !(montant > 0)) return 'Montant invalide : il doit être supérieur à zéro.';
  if (montant > reste) return `Le montant dépasse le reste à payer (${moneyFmt(reste, inv.currency)}).`;
  let date = new Date();
  if (p.date) {
    date = new Date(p.date);
    if (isNaN(date.getTime())) return 'Date de paiement invalide.';
    if (date.getTime() > Date.now() + 86400000) return 'La date de paiement ne peut pas être dans le futur.';
  }
  inv.payments.push({
    amount: montant, date,
    method: sanitize(String(p.method || ''), 100),
    note: sanitize(String(p.note || ''), 500),
  });
  appliquerStatutReglement(inv);
  return null;
}

// Maintenance ponctuelle : supprime un index obsolete (invoiceNumber_1) laisse par une ancienne
// version de la collection, qui bloque toute creation avec une erreur de cle dupliquee (null).
app.post('/api/admin/invoices/_fix-index', auth, adminOnly, async (req, res) => {
  try {
    await Invoice.collection.dropIndex('invoiceNumber_1');
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: 'Index déjà supprimé ou introuvable.' });
  }
});

// POST /api/admin/invoices : créer une facture (brouillon), libre ou depuis un devis accepté.
// Depuis un devis : kind = 'totale' (par défaut), 'acompte' (depositPercent % du devis)
// ou 'solde' (devis − acomptes non annulés).
app.post('/api/admin/invoices', auth, adminOnly, limitBody(50), async (req, res) => {
  try {
    const b = req.body || {};
    const { leadId, quoteId, title, items, taxRate, currency, introduction, terms, dueDays, issuerBrand } = b;
    const errV = validerChampsDocument(b);
    if (errV) return res.status(400).json({ error: errV });

    let lead, sourceQuote = null, kind = 'totale', soldeTTC = null;
    const d = {
      items: Array.isArray(items) ? items : [], title, taxRate: pctOu(taxRate, 0),
      currency, introduction, terms, discountPercent: pctOu(b.discountPercent, 0),
    };

    if (quoteId) {
      if (!/^[a-f0-9]{24}$/i.test(quoteId)) return res.status(400).json({ error: 'Devis invalide.' });
      sourceQuote = await Quote.findById(quoteId);
      if (!sourceQuote) return res.status(404).json({ error: 'Devis introuvable.' });
      if (sourceQuote.status !== 'accepte') return res.status(409).json({ error: 'Seul un devis accepté peut être facturé.' });
      kind = ['totale', 'acompte', 'solde'].includes(b.kind) ? b.kind : 'totale';

      const liees = await Invoice.find({ quoteId: sourceQuote._id, status: { $ne: 'annulee' } }).lean();
      const complete = liees.find(i => (i.kind || 'totale') !== 'acompte');
      if (complete) return res.status(409).json({ error: `Ce devis est déjà entièrement facturé (${complete.reference}).` });
      const acomptes = liees.filter(i => i.kind === 'acompte');
      const cur = sourceQuote.currency;
      const baseHT = arrondiDevise((sourceQuote.subtotal || 0) - (sourceQuote.discountAmount || 0), cur);
      const acomptesHT = arrondiDevise(acomptes.reduce((s, i) => s + (i.subtotal || 0) - (i.discountAmount || 0), 0), cur);
      const acomptesTTC = arrondiDevise(acomptes.reduce((s, i) => s + (i.total || 0), 0), cur);

      d.currency = cur;
      d.taxRate = sourceQuote.taxRate || 0;
      d.terms = terms || sourceQuote.terms;
      if (kind === 'totale') {
        if (acomptes.length) return res.status(409).json({ error: 'Des factures d’acompte existent déjà pour ce devis : créez la facture de solde.' });
        d.title = title || sourceQuote.title;
        d.items = sourceQuote.items;
        d.discountPercent = sourceQuote.discountPercent || 0;
        d.introduction = introduction || sourceQuote.introduction;
      } else if (kind === 'acompte') {
        const pct = pctOu(b.depositPercent, sourceQuote.depositPercent || 30);
        if (!(pct > 0 && pct < 100)) return res.status(400).json({ error: 'Pourcentage d’acompte invalide : il doit être compris entre 1 et 99 %.' });
        const montantHT = arrondiDevise(baseHT * pct / 100, cur);
        if (acomptesHT + montantHT >= baseHT) return res.status(409).json({ error: 'Le cumul des acomptes atteindrait le montant du devis : créez plutôt la facture de solde.' });
        d.title = `Facture d’acompte (${pct} %) — devis ${sourceQuote.reference}`;
        d.items = [{ description: `Acompte de ${pct} % sur le devis ${sourceQuote.reference} — ${sourceQuote.title}`, quantity: 1, unitPrice: montantHT }];
        d.discountPercent = 0;
        d.introduction = introduction || `Acompte de ${pct} % à la commande, conformément au devis ${sourceQuote.reference} (montant total ${moneyFmt(sourceQuote.total, cur)}).`;
      } else {
        if (!acomptes.length) return res.status(409).json({ error: 'Aucune facture d’acompte pour ce devis : créez une facture totale.' });
        const resteHT = arrondiDevise(baseHT - acomptesHT, cur);
        if (!(resteHT > 0)) return res.status(409).json({ error: 'Les acomptes couvrent déjà la totalité du devis.' });
        soldeTTC = arrondiDevise((sourceQuote.total || 0) - acomptesTTC, cur);
        d.title = `Facture de solde — devis ${sourceQuote.reference}`;
        d.items = [{ description: `Solde du devis ${sourceQuote.reference} — ${sourceQuote.title}`, quantity: 1, unitPrice: resteHT }];
        d.discountPercent = 0;
        d.introduction = introduction || `Solde du devis ${sourceQuote.reference} (montant total ${moneyFmt(sourceQuote.total, cur)}), déduction faite des acomptes déjà facturés : ${acomptes.map(i => i.reference).join(', ')} (${moneyFmt(acomptesTTC, cur)}).`;
      }
      lead = await Lead.findById(sourceQuote.leadId);
    } else {
      if (!leadId || !/^[a-f0-9]{24}$/i.test(leadId)) return res.status(400).json({ error: 'Client invalide.' });
      lead = await Lead.findById(leadId);
    }
    if (!lead) return res.status(404).json({ error: 'Client introuvable.' });
    if (!d.title || String(d.title).trim().length < 3) return res.status(400).json({ error: 'Titre requis (3 caractères minimum).' });

    const cur = DEVISES.includes(d.currency) ? d.currency : 'EUR';
    const totals = recalcQuote(d.items, d.taxRate, cur, d.discountPercent);
    // Solde : acomptes + solde = exactement le total TTC du devis (TVA déduite par différence).
    if (soldeTTC != null && soldeTTC > 0) {
      totals.taxAmount = arrondiDevise(soldeTTC - (totals.subtotal - (totals.discountAmount || 0)), cur);
      totals.total = soldeTTC;
    }

    const invoice = await creerAvecReference(Invoice, 'FACT', {
      leadId: lead._id,
      quoteId: sourceQuote ? sourceQuote._id : undefined,
      kind,
      clientName: lead.name,
      clientEmail: lead.email,
      clientCompany: lead.company || '',
      clientPhone: lead.phone || '',
      clientAddress: lead.clientData?.address || '',
      items: totals.items,
      subtotal: totals.subtotal,
      discountPercent: d.discountPercent,
      discountAmount: totals.discountAmount,
      taxRate: d.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.total,
      currency: cur,
      title: sanitize(String(d.title), 200),
      introduction: sanitize(d.introduction || '', 2000),
      terms: sanitize(d.terms || '', 5000),
      issuerBrand: sanitize(issuerBrand || '', 100) || 'Pirabel Labs',
      dueDate: new Date(Date.now() + (Number(dueDays) || 15) * 86400000),
      publicToken: generateToken(),
      createdBy: req.user._id
    });

    res.json({ success: true, invoice: exposerFacture(invoice) });
  } catch (err) {
    console.error('[invoices] create error:', err.message);
    res.status(500).json({ error: messageErreur(err, 'Erreur lors de la création de la facture.') });
  }
});

// GET /api/admin/invoices : liste (statut effectif, payé / reste) et statistiques par devise
app.get('/api/admin/invoices', auth, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const status = sanitize(req.query.status || '', 30);
    const leadId = sanitize(req.query.leadId || '', 30);
    const q = {};
    if (status === 'en_retard') q.$or = [{ status: 'en_retard' }, { status: { $in: ['envoyee', 'consultee', 'partiellement_payee'] }, dueDate: { $lt: now } }];
    else if (['brouillon', 'envoyee', 'consultee', 'partiellement_payee', 'payee', 'annulee'].includes(status)) q.status = status;
    if (/^[a-f0-9]{24}$/i.test(leadId)) q.leadId = leadId;
    const invoices = (await Invoice.find(q).sort({ createdAt: -1 }).limit(300))
      .map(exposerFacture)
      .filter(i => !status || i.status === status);

    // Statistiques sur TOUTES les factures (pas la liste plafonnée), par devise.
    const toutes = await Invoice.find({}).select('status currency total dueDate payments paidAt paymentMethod updatedAt issuedAt').lean();
    const stats = { total: toutes.length, byStatus: {}, byCurrency: {} };
    toutes.forEach(i => {
      const s = Invoice.effectiveStatus(i, now);
      const c = i.currency || 'EUR';
      stats.byStatus[s] = (stats.byStatus[s] || 0) + 1;
      const v = stats.byCurrency[c] = stats.byCurrency[c] || { encaisse: 0, reste: 0, enRetard: 0, factures: 0, payees: 0 };
      if (s === 'annulee') return;
      v.factures++;
      v.encaisse = arrondiDevise(v.encaisse + Invoice.amountPaidOf(i), c);
      if (s === 'payee') v.payees++;
      // « En attente de paiement » : ni brouillon ni annulée.
      if (s !== 'brouillon') v.reste = arrondiDevise(v.reste + Invoice.balanceOf(i), c);
      if (s === 'en_retard') v.enRetard = arrondiDevise(v.enRetard + Invoice.balanceOf(i), c);
    });

    res.json({ invoices, stats });
  } catch (err) {
    console.error('[invoices] list error:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/admin/invoices/:id
app.get('/api/admin/invoices/:id', auth, adminOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Facture introuvable.' });
    res.json(exposerFacture(invoice));
  } catch (err) {
    res.status(500).json({ error: messageErreur(err) });
  }
});

// PATCH /api/admin/invoices/:id : le contenu n'est modifiable qu'en brouillon.
// Une facture émise n'accepte plus que l'échéance et les notes internes.
app.patch('/api/admin/invoices/:id', auth, adminOnly, limitBody(50), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Facture introuvable.' });
    const b = req.body || {};
    const errV = validerChampsDocument(b, { dates: ['dueDate'] });
    if (errV) return res.status(400).json({ error: errV });

    const CONTENU = ['title', 'introduction', 'terms', 'currency', 'taxRate', 'discountPercent', 'items', 'issuerBrand'];
    const toucheContenu = CONTENU.some(f => b[f] !== undefined);
    if (toucheContenu && invoice.status !== 'brouillon') {
      return res.status(403).json({ error: 'Facture émise : son contenu n’est plus modifiable. Annulez-la et créez-en une nouvelle (seules l’échéance et les notes internes restent modifiables).' });
    }
    if (b.dueDays !== undefined && b.dueDays !== '' && b.dueDate === undefined) {
      b.dueDate = new Date(new Date(invoice.issuedAt || Date.now()).getTime() + Number(b.dueDays) * 86400000);
    }
    if (b.dueDate !== undefined && ['payee', 'annulee'].includes(invoice.status)) {
      return res.status(403).json({ error: 'Facture réglée ou annulée : l’échéance n’est plus modifiable.' });
    }

    if (b.title !== undefined) {
      const t = sanitize(String(b.title), 200);
      if (t.trim().length < 3) return res.status(400).json({ error: 'Titre requis (3 caractères minimum).' });
      invoice.title = t;
    }
    if (b.introduction !== undefined) invoice.introduction = sanitize(String(b.introduction), 2000);
    if (b.terms !== undefined) invoice.terms = sanitize(String(b.terms), 5000);
    if (b.issuerBrand !== undefined) invoice.issuerBrand = sanitize(String(b.issuerBrand), 100) || 'Pirabel Labs';
    if (b.internalNotes !== undefined) invoice.internalNotes = sanitize(String(b.internalNotes), 5000);
    if (b.paymentMethod !== undefined) invoice.paymentMethod = sanitize(String(b.paymentMethod), 100);
    if (b.currency !== undefined && DEVISES.includes(b.currency)) invoice.currency = b.currency;
    if (b.taxRate !== undefined) invoice.taxRate = pctOu(b.taxRate, 0);
    if (b.discountPercent !== undefined) invoice.discountPercent = pctOu(b.discountPercent, 0);
    if (b.dueDate !== undefined && b.dueDate !== '') {
      invoice.dueDate = new Date(b.dueDate);
      // Échéance repoussée : la facture n'est plus en retard.
      if (invoice.status === 'en_retard' && invoice.dueDate > new Date()) {
        invoice.status = Invoice.amountPaidOf(invoice) > 0 ? 'partiellement_payee' : 'envoyee';
      }
    }
    if (Array.isArray(b.items)) {
      invoice.items = recalcQuote(b.items, invoice.taxRate, invoice.currency, invoice.discountPercent).items;
    }

    await invoice.save();
    res.json({ success: true, invoice: exposerFacture(invoice) });
  } catch (err) {
    console.error('[invoices] update error:', err.message);
    res.status(500).json({ error: messageErreur(err) });
  }
});

// DELETE /api/admin/invoices/:id : seul un brouillon peut être supprimé.
app.delete('/api/admin/invoices/:id', auth, adminOnly, async (req, res) => {
  try {
    const supprimee = await Invoice.findOneAndDelete({ _id: req.params.id, status: 'brouillon' });
    if (supprimee) return res.json({ success: true });
    const existe = await Invoice.findById(req.params.id).select('_id').lean();
    if (!existe) return res.status(404).json({ error: 'Facture introuvable.' });
    res.status(403).json({ error: 'Une facture émise ne peut pas être supprimée : annulez-la.' });
  } catch (err) {
    res.status(500).json({ error: messageErreur(err) });
  }
});

// POST /api/admin/invoices/:id/cancel : annulation (la pièce reste dans l'historique)
app.post('/api/admin/invoices/:id/cancel', auth, adminOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Facture introuvable.' });
    if (invoice.status === 'annulee') return res.status(409).json({ error: 'Cette facture est déjà annulée.' });
    const pays = Invoice.paymentsOf(invoice);
    if (pays.some(p => p.legacy)) return res.status(409).json({ error: 'Cette facture est réglée : elle ne peut pas être annulée.' });
    if (pays.length) return res.status(409).json({ error: 'Des paiements sont enregistrés sur cette facture : supprimez-les d’abord.' });
    invoice.status = 'annulee';
    invoice.cancelledAt = new Date();
    await invoice.save();
    res.json({ success: true, invoice: exposerFacture(invoice) });
  } catch (err) {
    res.status(500).json({ error: messageErreur(err) });
  }
});

// POST /api/admin/invoices/:id/payments : enregistrer un paiement (acompte, partiel, solde)
app.post('/api/admin/invoices/:id/payments', auth, adminOnly, limitBody(5), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Facture introuvable.' });
    const b = req.body || {};
    const err = enregistrerPaiement(invoice, { amount: b.amount, date: b.date, method: b.method, note: b.note });
    if (err) return res.status(400).json({ error: err });
    await invoice.save();   // verrou optimiste (__v) : deux saisies simultanées ne peuvent pas dépasser le total
    res.json({ success: true, invoice: exposerFacture(invoice) });
  } catch (err) {
    console.error('[invoices] payment error:', err.message);
    res.status(err && err.name === 'VersionError' ? 409 : 500).json({ error: messageErreur(err) });
  }
});

// DELETE /api/admin/invoices/:id/payments/:pid : retirer un paiement saisi par erreur
app.delete('/api/admin/invoices/:id/payments/:pid', auth, adminOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Facture introuvable.' });
    const p = /^[a-f0-9]{24}$/i.test(req.params.pid) ? invoice.payments.id(req.params.pid) : null;
    if (!p) return res.status(404).json({ error: 'Paiement introuvable.' });
    invoice.payments.pull(p._id);
    appliquerStatutReglement(invoice);
    await invoice.save();
    res.json({ success: true, invoice: exposerFacture(invoice) });
  } catch (err) {
    res.status(500).json({ error: messageErreur(err) });
  }
});

// POST /api/admin/invoices/:id/send : envoyer par e-mail.
// { canal: 'whatsapp' } : lien partagé par WhatsApp, facture marquée envoyée SANS e-mail.
app.post('/api/admin/invoices/:id/send', auth, adminOnly, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Facture introuvable.' });
    if (invoice.status === 'annulee') return res.status(409).json({ error: 'Facture annulée : elle ne peut pas être envoyée.' });

    const publicUrl = `https://www.pirabellabs.com/facture/${invoice.publicToken}`;
    const viaWhatsApp = req.body && req.body.canal === 'whatsapp';

    if (!viaWhatsApp) {
      const envoye = await sendEmail(invoice.clientEmail, `Votre facture Pirabel Labs - ${invoice.reference}`, emailFactureHtml(invoice, publicUrl))
        .catch(e => { console.error('[invoices] send email error:', e.message); return false; });
      // Aligné sur les devis : un échec d'envoi ne marque PAS la facture comme envoyée.
      if (!envoye) return res.status(502).json({ error: "Envoi refusé par le fournisseur d'e-mail." });
    }

    if (invoice.status === 'brouillon') invoice.status = 'envoyee';
    invoice.sentAt = new Date();
    await invoice.save();

    res.json({ success: true, message: viaWhatsApp ? 'Facture marquée comme envoyée.' : 'Facture envoyée au client.', publicUrl });
  } catch (err) {
    console.error('[invoices] send error:', err.message);
    res.status(500).json({ error: messageErreur(err, 'Erreur lors de l’envoi de la facture.') });
  }
});

// POST /api/admin/invoices/:id/mark-paid : solde la facture en enregistrant un paiement
// du reste à payer. Idempotent : refusé si déjà réglée ou annulée.
app.post('/api/admin/invoices/:id/mark-paid', auth, adminOnly, limitBody(5), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Facture introuvable.' });
    if (invoice.status === 'annulee') return res.status(403).json({ error: 'Facture annulée.' });
    if (invoice.status === 'payee' || Invoice.balanceOf(invoice) <= 0) return res.status(409).json({ error: 'Cette facture est déjà réglée.' });
    const paidAtAvant = invoice.paidAt;
    const err = enregistrerPaiement(invoice, {
      amount: Invoice.balanceOf(invoice), date: req.body?.date,
      method: req.body?.paymentMethod || req.body?.method || '', note: req.body?.note || '',
    });
    if (err) return res.status(400).json({ error: err });
    if (paidAtAvant) invoice.paidAt = paidAtAvant;   // ne jamais écraser une date de paiement existante
    await invoice.save();
    res.json({ success: true, invoice: exposerFacture(invoice) });
  } catch (err) {
    res.status(500).json({ error: messageErreur(err) });
  }
});

// === PUBLIC invoice view (no auth, by token) ===
app.get('/api/invoices/:token', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ publicToken: String(req.params.token || '').slice(0, 100) });
    if (!invoice) return res.status(404).json({ error: 'Facture introuvable.' });

    if (!invoice.viewedAt && !estRequeteInterne(req)) {
      invoice.viewedAt = new Date();
      if (invoice.status === 'envoyee') invoice.status = 'consultee';
      // Mise à jour ciblée : pas de conflit de version avec un paiement saisi au même moment.
      await Invoice.updateOne({ _id: invoice._id, viewedAt: null }, { $set: { viewedAt: invoice.viewedAt, status: invoice.status } });
    }

    res.json({
      reference: invoice.reference,
      title: invoice.title,
      kind: invoice.kind || 'totale',
      issuerBrand: invoice.issuerBrand || 'Pirabel Labs',
      clientName: invoice.clientName,
      clientCompany: invoice.clientCompany,
      clientEmail: invoice.clientEmail,
      clientAddress: invoice.clientAddress,
      items: invoice.items,
      subtotal: invoice.subtotal,
      discountPercent: invoice.discountPercent || 0,
      discountAmount: invoice.discountAmount || 0,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      currency: invoice.currency,
      introduction: invoice.introduction,
      terms: invoice.terms,
      dueDate: invoice.dueDate,
      issuedAt: invoice.issuedAt,
      status: Invoice.effectiveStatus(invoice),
      paidAt: invoice.paidAt,
      amountPaid: Invoice.amountPaidOf(invoice),
      balanceDue: Invoice.balanceOf(invoice),
      payments: Invoice.paymentsOf(invoice).map(p => ({ amount: p.amount, date: p.date }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Static : page publique facture
app.get('/facture/:token', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app', 'views', 'public-facture.html'));
});

// ========================================================================
// === REVIEWS (demandes d'avis client) ===
// ========================================================================

// POST /api/admin/reviews/request : envoie email demande d'avis a un lead
app.post('/api/admin/reviews/request', auth, adminOnly, limitBody(5), async (req, res) => {
  try {
    const { leadId, serviceUsed } = req.body;
    if (!leadId || !/^[a-f0-9]{24}$/i.test(leadId)) return res.status(400).json({ error: 'Lead invalide.' });

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead introuvable.' });

    const review = await Review.create({
      leadId: lead._id,
      clientName: lead.name,
      clientEmail: lead.email,
      clientCompany: lead.company || '',
      clientCity: lead.clientData?.city || '',
      rating: 5, // placeholder, sera ecrasé à la submission
      comment: 'En attente de soumission',
      serviceUsed: sanitize(serviceUsed || lead.service || '', 100),
      status: 'en_attente',
      requestToken: generateToken(),
      source: 'admin_request'
    });

    const publicUrl = `https://www.pirabellabs.com/avis/${review.requestToken}`;

    const html = masterTemplate({
      headerType: 'hero',
      preheader: 'Quelques minutes pour partager votre experience',
      title: 'Bonjour ' + escapeHtml(lead.name.split(' ')[0]) + ',',
      subtitle: 'Votre avis compte énormément',
      body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Après notre collaboration, nous aimerions beaucoup avoir votre retour honnête sur notre travail.</p>' +
        '<p style="font-size:15px;line-height:1.7;color:rgba(229,226,225,0.7);">Cela nous prend <strong style="color:#e5e2e1;">2 minutes</strong> et nous aide énormément à progresser et à rassurer les prochains clients qui hésitent.</p>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.5);">Merci infiniment,<br><strong style="color:#e5e2e1;">L&apos;équipe Pirabel Labs</strong></p>',
      cta: 'Laisser mon avis (2 min)',
      ctaUrl: publicUrl
    });

    await sendEmail(lead.email, 'Votre avis sur Pirabel Labs (2 min)', html)
      .catch(e => console.error('[reviews] request email error:', e.message));

    lead.reviewRequestedAt = new Date();
    await lead.save();

    res.json({ success: true, message: 'Demande d’avis envoyée.', publicUrl });
  } catch (err) {
    console.error('[reviews] request error:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/admin/reviews
app.get('/api/admin/reviews', auth, adminOnly, async (req, res) => {
  try {
    const status = sanitize(req.query.status || '', 30);
    const q = {};
    if (['en_attente', 'publie', 'rejete'].includes(status)) q.status = status;
    const reviews = await Review.find(q).sort({ createdAt: -1 }).limit(200);
    const stats = await Review.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    res.json({ reviews, stats });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PATCH /api/admin/reviews/:id : valider/rejeter/publier
app.patch('/api/admin/reviews/:id', auth, adminOnly, limitBody(5), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Avis introuvable.' });
    if (req.body.status && ['en_attente', 'publie', 'rejete'].includes(req.body.status)) {
      review.status = req.body.status;
    }
    if (typeof req.body.publishedOnSite === 'boolean') {
      review.publishedOnSite = req.body.publishedOnSite;
      if (req.body.publishedOnSite && !review.publishedAt) review.publishedAt = new Date();
    }
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.delete('/api/admin/reviews/:id', auth, adminOnly, async (req, res) => {
  try {
    const r = await Review.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: 'Avis introuvable.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUBLIC : récupère le formulaire d'avis par token
app.get('/api/reviews/:token', async (req, res) => {
  try {
    const review = await Review.findOne({ requestToken: req.params.token });
    if (!review) return res.status(404).json({ error: 'Lien invalide ou expiré.' });
    res.json({
      clientName: review.clientName,
      clientCompany: review.clientCompany,
      serviceUsed: review.serviceUsed,
      alreadySubmitted: !!review.submittedAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUBLIC : soumission avis
const reviewSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  keyPrefix: 'review-submit'
});

app.post('/api/reviews/:token', reviewSubmitLimiter, limitBody(5), async (req, res) => {
  try {
    const review = await Review.findOne({ requestToken: req.params.token });
    if (!review) return res.status(404).json({ error: 'Lien invalide ou expiré.' });
    if (review.submittedAt) return res.status(403).json({ error: 'Avis déjà envoyé.' });

    const rating = Math.max(1, Math.min(5, parseInt(req.body.rating) || 0));
    const comment = sanitize(req.body.comment || '', 2000);
    const role = sanitize(req.body.role || '', 100);
    const city = sanitize(req.body.city || '', 100);

    if (!rating) return res.status(400).json({ error: 'Note requise (1-5).' });
    if (!comment || comment.length < 30) return res.status(400).json({ error: 'Commentaire trop court (30 caracteres min).' });

    const ipHash = crypto.createHash('sha256')
      .update((req.ip || '') + (process.env.JWT_SECRET || ''))
      .digest('hex').slice(0, 32);

    review.rating = rating;
    review.comment = comment;
    if (role) review.clientRole = role;
    if (city) review.clientCity = city;
    review.submittedAt = new Date();
    review.status = 'en_attente'; // toujours moderé avant publication
    review.ipHash = ipHash;
    await review.save();

    // Update lead
    await Lead.findByIdAndUpdate(review.leadId, { $set: { reviewSubmittedAt: new Date() } });

    await sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      `[Pirabel Labs] Nouvel avis client - ${rating}/5 - ${review.clientName}`,
      masterTemplate({
        title: 'Nouvel avis client',
        body: `<p><strong>${escapeHtml(review.clientName)}</strong> (${escapeHtml(review.clientEmail)}) a laissé un avis :</p><p>Note : <strong>${rating}/5</strong></p><blockquote style="border-left:3px solid #FF5500;padding-left:16px;margin:16px 0;color:rgba(229,226,225,0.85);font-style:italic;">${escapeHtml(comment)}</blockquote><p>A moderer dans le dashboard avant publication sur le site.</p>`,
        cta: 'Modérer l’avis',
        ctaUrl: 'https://www.pirabellabs.com/admin/dashboard'
      })
    ).catch(() => {});

    res.json({ success: true, message: 'Merci pour votre avis ! Il sera publié après modération.' });
  } catch (err) {
    console.error('[reviews] submit error:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Static : page publique avis
app.get('/avis/:token', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app', 'views', 'public-avis.html'));
});

// === ADMIN : create lead manually (nouveau client) ===
app.post('/api/admin/leads-create', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const name = sanitize(req.body.name || '', 120);
    const email = sanitizeEmail(req.body.email);
    const phone = sanitize(req.body.phone || '', 30);
    const company = sanitize(req.body.company || '', 120);
    const stage = ['prospect', 'qualifie', 'client', 'inactif'].includes(req.body.stage) ? req.body.stage : 'prospect';
    const status = ['nouveau', 'lu', 'en_cours', 'converti', 'perdu'].includes(req.body.status) ? req.body.status : 'nouveau';

    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom requis.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide.' });

    const existing = await Lead.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Un contact avec cet e-mail existe déjà.', existing });

    const lead = await Lead.create({
      type: 'contact', stage, status,
      name, email, phone, company,
      service: '', message: 'Créé manuellement depuis le tableau de bord',
      source: 'admin_manual',
      clientData: stage === 'client' ? { becameClientAt: new Date() } : undefined,
      newsletterOptIn: false
    });
    res.json({ success: true, lead });
  } catch (err) {
    console.error('[leads-create] error:', err.message);
    res.status(500).json({ error: 'Erreur serveur : ' + err.message });
  }
});

// === PUBLIC : demander ajustements sur devis ===
app.post('/api/quotes/:token/adjust', limitBody(5), async (req, res) => {
  try {
    const quote = await Quote.findOne(refDevis(req.params.token));
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    if (['accepte', 'refuse', 'annule', 'brouillon'].includes(quote.status)) {
      return res.status(403).json({ error: 'Ce devis n’est plus modifiable (accepté, refusé ou annulé).' });
    }
    const message = sanitize(req.body.message || '', 2000);
    if (!message || message.length < 10) return res.status(400).json({ error: 'Message trop court (10 caractères minimum).' });

    quote.internalNotes = ((quote.internalNotes || '') + '\n[Ajustement demandé ' + new Date().toISOString() + '] ' + message).slice(0, 5000);
    await quote.save();

    await sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      `[Pirabel Labs] Ajustement demandé - Devis ${quote.reference}`,
      masterTemplate({
        title: 'Demande d\'ajustement client',
        body: `<p>Le client <strong>${escapeHtml(quote.clientName)}</strong> (${escapeHtml(quote.clientEmail)}) demande des ajustements sur le devis <strong>${escapeHtml(quote.reference)}</strong> (${escapeHtml(quote.title)}).</p><p><strong>Message :</strong></p><blockquote style="border-left:3px solid #FF5500;padding-left:16px;margin:16px 0;color:rgba(229,226,225,0.85);font-style:italic;">${escapeHtml(message)}</blockquote><p>Modifiez le devis dans le tableau de bord et renvoyez une version corrigée.</p>`,
        cta: 'Ouvrir le tableau de bord',
        ctaUrl: 'https://www.pirabellabs.com/admin/dashboard'
      })
    ).catch(() => {});

    res.json({ success: true, message: 'Demande envoyée. Nous revenons vers vous sous 48 h.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ========================================================================
// === EXTENDED LEAD STAGE UPDATE ===
// ========================================================================
app.patch('/api/admin/leads/:id/stage', auth, adminOnly, limitBody(10), async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead introuvable.' });

    const VALID_STAGES = ['prospect', 'qualifie', 'devis_envoye', 'client', 'inactif'];
    if (req.body.stage && VALID_STAGES.includes(req.body.stage)) {
      lead.stage = req.body.stage;
      if (req.body.stage === 'client' && !lead.clientData?.becameClientAt) {
        lead.clientData = lead.clientData || {};
        lead.clientData.becameClientAt = new Date();
      }
    }
    if (req.body.clientData && typeof req.body.clientData === 'object') {
      lead.clientData = lead.clientData || {};
      ['address', 'city', 'country', 'role', 'industry', 'teamSize', 'website', 'notes'].forEach(f => {
        if (req.body.clientData[f] !== undefined) lead.clientData[f] = sanitize(String(req.body.clientData[f]), 500);
      });
    }
    await lead.save();
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ========================================================================
// === EXTENDED STATS (avec devis + clients + reviews) ===
// ========================================================================
app.get('/api/admin/stats-extended', auth, adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 86400000);

    const [
      leadsTotal, prospects, clients, quotesTotal, quotesPending, quotesAccepted, quotesRevenue,
      reviewsPending, reviewsPublished, byStage, leadsLast30, conversionsLast30
    ] = await Promise.all([
      Lead.countDocuments({}),
      Lead.countDocuments({ stage: 'prospect' }),
      Lead.countDocuments({ stage: 'client' }),
      Quote.countDocuments({}),
      Quote.countDocuments({ status: { $in: ['envoye', 'consulte'] }, validUntil: { $gte: now } }),
      Quote.countDocuments({ status: 'accepte' }),
      Quote.aggregate([{ $match: { status: 'accepte' } }, { $group: { _id: '$currency', total: { $sum: '$total' } } }]),
      Review.countDocuments({ status: 'en_attente', submittedAt: { $ne: null } }),
      Review.countDocuments({ publishedOnSite: true }),
      Lead.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
      Lead.countDocuments({ createdAt: { $gte: d30 } }),
      Lead.countDocuments({ stage: 'client', 'clientData.becameClientAt': { $gte: d30 } })
    ]);

    res.json({
      leads: { total: leadsTotal, prospects, clients, last30: leadsLast30, conversionsLast30 },
      // Montants par devise : jamais d'addition de devises différentes.
      quotes: { total: quotesTotal, pending: quotesPending, accepted: quotesAccepted,
        revenueByCurrency: Object.fromEntries(quotesRevenue.map(r => [r._id || 'EUR', arrondiDevise(r.total, r._id)])) },
      reviews: { pending: reviewsPending, published: reviewsPublished },
      byStage
    });
  } catch (err) {
    console.error('[stats-extended] error:', err.message);
    res.status(500).json({ error: 'Erreur stats.' });
  }
});

// ========================================================================
// === DIAGNOSTIC EMAIL (admin) ===
// ========================================================================
// GET : etat de la config email (sans divulguer le secret)
app.get('/api/admin/email-status', auth, adminOnly, (req, res) => {
  const key = (process.env.RESEND_API_KEY || '').trim();
  res.json({
    resendKeyConfigured: !!key,
    resendKeyPreview: key ? key.slice(0, 6) + '...' : null,
    fromEmail: (process.env.FROM_EMAIL || '').trim() || 'contact@pirabellabs.com (defaut)',
    contactEmail: (process.env.CONTACT_EMAIL || '').trim() || 'contact@pirabellabs.com (defaut)',
    adminEmail: (process.env.ADMIN_EMAIL || '').trim() || null,
    note: !key ? 'RESEND_API_KEY manquante : aucun email ne peut partir. Ajoutez-la dans Vercel > Settings > Environment Variables.' : 'Clé présente. Si les e-mails ne partent pas, vérifiez que FROM_EMAIL utilise un domaine validé chez Resend.'
  });
});

// POST : envoie un email de test et renvoie la reponse REELLE de Resend (diagnostic)
app.post('/api/admin/test-email', auth, adminOnly, limitBody(5), async (req, res) => {
  try {
    const to = sanitizeEmail(req.body.to) || (req.user && req.user.email);
    if (!isValidEmail(to)) return res.status(400).json({ error: 'Adresse de test invalide.' });

    const key = (process.env.RESEND_API_KEY || '').trim();
    if (!key) {
      return res.status(503).json({ error: 'RESEND_API_KEY non configurée sur Vercel. Aucun e-mail ne peut partir tant qu’elle n’est pas ajoutée.' });
    }

    const from = '"Pirabel Labs" <' + ((process.env.FROM_EMAIL || '').trim() || 'contact@pirabellabs.com') + '>';
    const html = masterTemplate({
      title: 'Test email Pirabel Labs',
      body: '<p>Ceci est un e-mail de test envoyé depuis le tableau de bord à ' + new Date().toISOString() + '.</p><p>Si vous recevez ce message, la configuration Resend fonctionne.</p>',
    });

    let resp, body;
    try {
      resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], subject: 'Test email - Pirabel Labs', html }),
      });
      body = await resp.json().catch(() => ({}));
    } catch (e) {
      return res.status(502).json({ error: 'Échec réseau vers Resend : ' + e.message });
    }

    if (!resp.ok) {
      return res.status(200).json({
        success: false,
        resendStatus: resp.status,
        resendError: (body && (body.message || body.name)) || 'Erreur Resend inconnue',
        from,
        to,
        hint: resp.status === 403 || resp.status === 422
          ? 'Domaine probablement non vérifié OU FROM_EMAIL hors domaine vérifié. Vérifiez le domaine de FROM_EMAIL sur resend.com/domains.'
          : 'Vérifiez la clé API et le domaine sur resend.com.'
      });
    }

    res.json({ success: true, message: 'E-mail de test envoyé à ' + to + '. Vérifiez la boîte de réception (et les indésirables).', resendId: body.id, from });
  } catch (err) {
    console.error('[test-email]', err.message);
    res.status(500).json({ error: 'Erreur serveur : ' + err.message });
  }
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error('[unhandled]', err.message);
  res.status(500).json({ error: 'Erreur serveur.' });
});

module.exports = app;
