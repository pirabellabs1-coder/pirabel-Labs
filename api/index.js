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

const connectDB = require('../app/config/db');
const { sendEmail, masterTemplate, newOrderEmail } = require('../app/config/email');
const {
  rateLimit, sanitize, sanitizeEmail, honeypotCheck, limitBody,
  isValidEmail, securityHeaders, globalSanitize,
} = require('../app/middleware/security');
const { auth, adminOnly } = require('../app/middleware/auth');
const User = require('../app/models/User');
const Lead = require('../app/models/Lead');

const app = express();

// === Middlewares ===
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));
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
    });
  }
  return dbReady;
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
  const count = await User.countDocuments({ role: 'admin' });
  if (count > 0) return; // admin already exists
  const name = (process.env.INITIAL_ADMIN_NAME || 'Admin').trim();
  const user = new User({ name, email, password, role: 'admin', isActive: true });
  await user.save();
  console.log(`[bootstrap] admin created: ${email} (id: ${user._id})`);
}
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
  message: 'Trop de demandes. Reessayez dans 15 minutes.',
  keyPrefix: 'contact',
});

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

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
      'fiche-google-business','gestion-avis-google',
      'community-management','community','community-instagram','community-tiktok','community-linkedin',
      'montage-video','video',
      'automatisation','automatisation-marketing','make','n8n','agents-ia',
      'email-marketing-crm','email','hubspot','brevo','mailchimp',
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

    // Email admin (beau template avec details lead)
    sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      '[Pirabel Labs] Nouvelle demande - ' + service,
      newOrderEmail({ name, email, phone, company, service, message }),
      { replyTo: email }
    ).catch(e => console.error('[contact] admin email error:', e.message));

    // Email confirmation client (beau template Pirabel Labs)
    const confirmHtml = masterTemplate({
      headerType: 'hero',
      preheader: 'Demande recue, reponse sous 24h',
      title: 'Bonjour ' + escapeHtml(name.split(' ')[0]) + ',',
      subtitle: 'Votre demande est entre nos mains',
      body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Merci de nous avoir contactes&nbsp;! Nous avons bien recu votre demande concernant <strong style="color:#FF5500;">' + escapeHtml(service) + '</strong>.</p>' +
        '<p style="font-size:15px;line-height:1.7;color:rgba(229,226,225,0.7);">Un membre de notre equipe (souvent un cofondateur) vous repond sous <strong style="color:#e5e2e1;">24h ouvrees</strong> avec :</p>' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">' +
        '<tr><td style="padding:12px 16px;border-left:3px solid #FF5500;background:#0e0e0e;"><strong style="color:#e5e2e1;font-size:14px;">Une premiere estimation</strong><br><span style="font-size:13px;color:rgba(229,226,225,0.5);">Budget realiste et planning indicatif</span></td></tr>' +
        '<tr><td style="height:8px;"></td></tr>' +
        '<tr><td style="padding:12px 16px;border-left:3px solid #FF5500;background:#0e0e0e;"><strong style="color:#e5e2e1;font-size:14px;">Une proposition d&apos;etape suivante</strong><br><span style="font-size:13px;color:rgba(229,226,225,0.5);">Appel decouverte gratuit de 30 min ou devis ferme sous 48h</span></td></tr>' +
        '<tr><td style="height:8px;"></td></tr>' +
        '<tr><td style="padding:12px 16px;border-left:3px solid #FF5500;background:#0e0e0e;"><strong style="color:#e5e2e1;font-size:14px;">Aucune relance commerciale</strong><br><span style="font-size:13px;color:rgba(229,226,225,0.5);">On vous repond une fois, vous prenez le temps de reflechir</span></td></tr>' +
        '</table>' +
        '<div style="border-left:3px solid rgba(255,85,0,0.3);padding:16px 20px;background:rgba(255,85,0,0.03);margin:24px 0;">' +
        '<p style="margin:0;font-size:14px;color:rgba(229,226,225,0.6);line-height:1.6;"><strong style="color:#e5e2e1;">Une urgence ?</strong> Joignez-nous directement sur <a href="https://wa.me/16139273067" style="color:#FF5500;">WhatsApp</a> ou repondez a cet email.</p>' +
        '</div>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.5);margin-top:24px;">A tres vite,<br><strong style="color:#e5e2e1;">L&apos;equipe Pirabel Labs</strong><br>Lissanon Gildas &amp; Fidah Imorou, cofondateurs</p>',
      cta: 'Visiter notre site',
      ctaUrl: 'https://www.pirabellabs.com',
      ctaSecondary: 'Voir nos realisations',
      ctaSecondaryUrl: 'https://www.pirabellabs.com/realisations',
    });

    sendEmail(
      email,
      'Pirabel Labs - Demande recue, reponse sous 24h',
      confirmHtml
    ).catch(e => console.error('[contact] confirm email error:', e.message));

    res.json({ success: true, message: 'Demande envoyee. Reponse sous 24h ouvres.' });
  } catch (err) {
    console.error('[contact] error:', err.message);
    res.status(500).json({ error: 'Erreur serveur. Reessayez ou ecrivez a contact@pirabellabs.com' });
  }
});

// === PUBLIC : Demande de livre blanc ===
const livreBlancLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: 'Trop de demandes. Reessayez dans 15 minutes.',
  keyPrefix: 'livre-blanc',
});

const LIVRES_BLANCS = {
  'seo-pme-francophones-2026': {
    title: 'Le guide complet du SEO pour PME francophones en 2026',
    pages: 62,
    pdfUrl: '/downloads/livre-blanc-seo-pme-francophones-2026.pdf',
    description: 'Methodologie complete SEO : audit technique 60 points, recherche mots-cles, contenu E-E-A-T, netlinking white-hat.'
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
    description: 'Methodologie CRO complete : audit comportement, conception landing pages, A/B testing, paiements optimises.'
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

app.post('/api/livre-blanc/request', livreBlancLimiter, honeypotCheck('website_url'), limitBody(10), async (req, res) => {
  try {
    const name = sanitize(req.body.name, 120);
    const email = sanitizeEmail(req.body.email);
    const company = sanitize(req.body.company || '', 120);
    const phone = sanitize(req.body.phone || '', 30);
    const slug = sanitize(req.body.slug || '', 100);
    const newsletterOptIn = req.body.newsletter !== false; // default true

    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom requis.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide.' });
    if (!LIVRES_BLANCS[slug]) return res.status(400).json({ error: 'Livre blanc inconnu.' });

    const lb = LIVRES_BLANCS[slug];

    const ipHash = crypto.createHash('sha256')
      .update((req.ip || '') + (process.env.JWT_SECRET || ''))
      .digest('hex').slice(0, 32);

    const lead = await Lead.create({
      type: 'livre-blanc',
      livreBlancSlug: slug,
      livreBlancTitle: lb.title,
      name, email, phone, company,
      service: 'livre-blanc',
      message: `Telechargement livre blanc : ${lb.title}`,
      newsletterOptIn,
      source: 'site_livre_blanc',
      userAgent: (req.headers['user-agent'] || '').slice(0, 500),
      ipHash,
    });

    const pdfFullUrl = 'https://www.pirabellabs.com' + lb.pdfUrl;

    // Email admin
    sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      '[Pirabel Labs] Nouveau telechargement livre blanc - ' + lb.title,
      newOrderEmail({ name, email, phone, company, service: 'Livre blanc : ' + lb.title, message: `Lead : ${name} <${email}>\nLivre blanc telecharge : ${lb.title}\nNewsletter opt-in : ${newsletterOptIn ? 'OUI' : 'NON'}` }),
      { replyTo: email }
    ).catch(e => console.error('[livre-blanc] admin email error:', e.message));

    // Email client avec lien de telechargement
    const downloadHtml = masterTemplate({
      headerType: 'hero',
      preheader: 'Votre livre blanc est pret a telecharger',
      title: 'Bonjour ' + escapeHtml(name.split(' ')[0]) + ',',
      subtitle: 'Voici votre livre blanc Pirabel Labs',
      body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Merci d&apos;avoir telecharge notre livre blanc :</p>' +
        '<div style="margin:24px 0;padding:24px;background:#0e0e0e;border:1px solid rgba(255,85,0,0.3);border-radius:12px;">' +
        '<div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:13px;color:#FF5500;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">Livre blanc &middot; ' + lb.pages + ' pages</div>' +
        '<div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:20px;color:#e5e2e1;line-height:1.3;margin-bottom:12px;">' + escapeHtml(lb.title) + '</div>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.7);line-height:1.6;margin:0;">' + escapeHtml(lb.description) + '</p>' +
        '</div>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.6);line-height:1.6;">Vous pouvez le telecharger en cliquant sur le bouton ci-dessous. Conservez cet email pour y revenir plus tard si besoin.</p>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.5);margin-top:24px;">Si vous avez des questions apres lecture, ecrivez-nous directement : <a href="mailto:contact@pirabellabs.com" style="color:#FF5500;">contact@pirabellabs.com</a> ou WhatsApp : <a href="https://wa.me/16139273067" style="color:#FF5500;">+1 (613) 927-3067</a>.</p>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.5);margin-top:24px;">Bonne lecture,<br><strong style="color:#e5e2e1;">L&apos;equipe Pirabel Labs</strong></p>',
      cta: 'Telecharger le PDF',
      ctaUrl: pdfFullUrl,
      ctaSecondary: 'Voir tous nos livres blancs',
      ctaSecondaryUrl: 'https://www.pirabellabs.com/livres-blancs',
    });

    sendEmail(
      email,
      'Votre livre blanc : ' + lb.title,
      downloadHtml
    ).catch(e => console.error('[livre-blanc] client email error:', e.message));

    res.json({
      success: true,
      message: 'Livre blanc envoye par email !',
      pdfUrl: lb.pdfUrl
    });
  } catch (err) {
    console.error('[livre-blanc] error:', err.message);
    res.status(500).json({ error: 'Erreur serveur. Reessayez ou ecrivez a contact@pirabellabs.com' });
  }
});

// === ADMIN AUTH ===
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: 'Trop de tentatives. Reessayez dans 15 minutes.',
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

app.get('/api/admin/me', auth, adminOnly, (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

// === ADMIN : LEADS ===
app.get('/api/admin/leads', auth, adminOnly, async (req, res) => {
  try {
    const status = sanitize(req.query.status || '', 30);
    const type = sanitize(req.query.type || '', 30);
    const livreBlanc = sanitize(req.query.livreBlanc || '', 100);
    const q = {};
    if (['nouveau', 'lu', 'en_cours', 'converti', 'perdu', 'newsletter_ok'].includes(status)) q.status = status;
    if (['contact', 'livre-blanc'].includes(type)) q.type = type;
    if (livreBlanc) q.livreBlancSlug = livreBlanc;
    const leads = await Lead.find(q).sort({ createdAt: -1 }).limit(500);
    const stats = await Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byType = await Lead.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);
    const byLivreBlanc = await Lead.aggregate([
      { $match: { type: 'livre-blanc' } },
      { $group: { _id: '$livreBlancSlug', count: { $sum: 1 }, title: { $first: '$livreBlancTitle' } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ leads, stats, byType, byLivreBlanc });
  } catch (err) {
    console.error('[leads] list error:', err.message);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Bulk email aux leads (newsletter / relance / annonce)
const bulkEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  message: 'Trop d\'envois bulk. Reessayez dans 1 heure.',
  keyPrefix: 'bulk-email',
});

app.post('/api/admin/leads/bulk-email', auth, adminOnly, bulkEmailLimiter, limitBody(50), async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.filter(id => /^[a-f0-9]{24}$/i.test(id)) : [];
    const subject = sanitize(req.body.subject || '', 200);
    const bodyHtml = String(req.body.bodyHtml || '').slice(0, 50000);
    const onlyOptIn = req.body.onlyOptIn !== false;

    if (!ids.length) return res.status(400).json({ error: 'Aucun lead selectionne.' });
    if (!subject || subject.length < 3) return res.status(400).json({ error: 'Sujet requis (3 caracteres min).' });
    if (!bodyHtml || bodyHtml.length < 20) return res.status(400).json({ error: 'Corps email requis (20 caracteres min).' });

    const query = { _id: { $in: ids } };
    if (onlyOptIn) query.newsletterOptIn = true;

    const leads = await Lead.find(query);
    if (!leads.length) return res.status(404).json({ error: 'Aucun lead valide trouve (opt-in ?).' });

    let sent = 0, failed = 0;
    const errors = [];

    // Send sequentially to avoid Resend rate limits (1 email = ~150ms minimum)
    for (const lead of leads) {
      const personalizedHtml = bodyHtml
        .replace(/\{\{name\}\}/g, escapeHtml(lead.name))
        .replace(/\{\{firstName\}\}/g, escapeHtml(lead.name.split(' ')[0]))
        .replace(/\{\{company\}\}/g, escapeHtml(lead.company || ''));

      const fullEmail = masterTemplate({
        headerType: 'hero',
        title: 'Bonjour ' + escapeHtml(lead.name.split(' ')[0]) + ',',
        body: personalizedHtml +
          '<p style="margin-top:32px;font-size:12px;color:rgba(229,226,225,0.4);line-height:1.5;">Vous recevez cet email car vous avez interagi avec Pirabel Labs. Pour vous desinscrire, repondez avec "DESABONNEMENT".</p>',
        cta: 'Visiter pirabellabs.com',
        ctaUrl: 'https://www.pirabellabs.com',
      });

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

    res.json({
      success: true,
      message: `${sent} email(s) envoye(s), ${failed} echec(s) sur ${leads.length} leads.`,
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
    res.json(lead);
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

    const converted = await Lead.countDocuments({ status: 'won' });
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
  message: 'Trop de tentatives. Reessayez dans 1 heure.',
  keyPrefix: 'setup',
});
app.post('/api/admin/setup', setupLimiter, limitBody(5), async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(403).json({ error: 'Un compte administrateur existe deja.' });
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
    res.json({ success: true, message: 'Compte administrateur cree.' });
  } catch (err) {
    console.error('[setup]', err.message);
    res.status(500).json({ error: 'Erreur serveur. Reessayez.' });
  }
});

// Bloque URLs admin obvious
['/login', '/admin', '/admin-login', '/wp-admin', '/wp-login.php', '/administrator'].forEach(p => {
  app.get(p, (req, res) => res.status(404).send('Not found'));
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error('[unhandled]', err.message);
  res.status(500).json({ error: 'Erreur serveur.' });
});

module.exports = app;
