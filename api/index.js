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
const Media = require('../app/models/Media');
const Quote = require('../app/models/Quote');
const Review = require('../app/models/Review');

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
    if (!validated) return res.status(400).json({ error: 'Image invalide (formats acceptes : JPG, PNG, WEBP, GIF, SVG ; max 2MB).' });

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

function generateQuoteReference() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `DEVIS-${year}-${random}`;
}

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

function recalcQuote(items, taxRate) {
  const cleaned = items.map(i => {
    const qty = Math.max(0, Number(i.quantity) || 1);
    const price = Math.max(0, Number(i.unitPrice) || 0);
    return {
      description: sanitize(String(i.description || ''), 500),
      quantity: qty,
      unitPrice: Math.round(price * 100) / 100,
      total: Math.round(qty * price * 100) / 100
    };
  });
  const subtotal = cleaned.reduce((s, i) => s + i.total, 0);
  const tax = Math.round((subtotal * (taxRate || 0) / 100) * 100) / 100;
  return { items: cleaned, subtotal: Math.round(subtotal * 100) / 100, taxAmount: tax, total: Math.round((subtotal + tax) * 100) / 100 };
}

// POST /api/admin/quotes : créer un devis (brouillon)
app.post('/api/admin/quotes', auth, adminOnly, limitBody(50), async (req, res) => {
  try {
    const { leadId, title, items, taxRate, currency, introduction, terms, validDays } = req.body;
    if (!leadId || !/^[a-f0-9]{24}$/i.test(leadId)) return res.status(400).json({ error: 'Lead invalide.' });
    if (!title || title.length < 3) return res.status(400).json({ error: 'Titre requis (3 caracteres min).' });

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead introuvable.' });

    const totals = recalcQuote(Array.isArray(items) ? items : [], Number(taxRate) || 0);

    const quote = await Quote.create({
      reference: generateQuoteReference(),
      leadId: lead._id,
      clientName: lead.name,
      clientEmail: lead.email,
      clientCompany: lead.company || '',
      clientPhone: lead.phone || '',
      clientAddress: lead.clientData?.address || '',
      items: totals.items,
      subtotal: totals.subtotal,
      taxRate: Math.max(0, Number(taxRate) || 0),
      taxAmount: totals.taxAmount,
      total: totals.total,
      currency: ['EUR', 'USD', 'CAD', 'XOF', 'XAF', 'MAD', 'TND', 'GNF', 'CHF'].includes(currency) ? currency : 'EUR',
      title: sanitize(title, 200),
      introduction: sanitize(introduction || '', 2000),
      terms: sanitize(terms || '', 5000),
      validUntil: new Date(Date.now() + (Number(validDays) || 30) * 86400000),
      publicToken: generateToken(),
      createdBy: req.user._id
    });

    res.json({ success: true, quote });
  } catch (err) {
    console.error('[quotes] create error:', err.message);
    res.status(500).json({ error: 'Erreur serveur : ' + err.message });
  }
});

// GET /api/admin/quotes : liste
app.get('/api/admin/quotes', auth, adminOnly, async (req, res) => {
  try {
    const status = sanitize(req.query.status || '', 30);
    const leadId = sanitize(req.query.leadId || '', 30);
    const q = {};
    if (['brouillon', 'envoye', 'consulte', 'accepte', 'refuse', 'expire'].includes(status)) q.status = status;
    if (/^[a-f0-9]{24}$/i.test(leadId)) q.leadId = leadId;
    const quotes = await Quote.find(q).sort({ createdAt: -1 }).limit(300);
    const stats = await Quote.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } }
    ]);
    res.json({ quotes, stats });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET /api/admin/quotes/:id
app.get('/api/admin/quotes/:id', auth, adminOnly, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PATCH /api/admin/quotes/:id : update
app.patch('/api/admin/quotes/:id', auth, adminOnly, limitBody(50), async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    if (quote.status === 'accepte' || quote.status === 'refuse') {
      return res.status(403).json({ error: 'Devis verrouille (deja accepte/refuse).' });
    }

    const fields = ['title', 'introduction', 'terms', 'internalNotes', 'currency', 'taxRate', 'validUntil'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === 'taxRate') quote.taxRate = Math.max(0, Number(req.body.taxRate) || 0);
        else if (f === 'validUntil') quote.validUntil = new Date(req.body.validUntil);
        else quote[f] = sanitize(String(req.body[f]), f === 'terms' ? 5000 : 2000);
      }
    });

    if (Array.isArray(req.body.items)) {
      const totals = recalcQuote(req.body.items, quote.taxRate);
      quote.items = totals.items;
    }

    await quote.save();
    res.json({ success: true, quote });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// DELETE /api/admin/quotes/:id
app.delete('/api/admin/quotes/:id', auth, adminOnly, async (req, res) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST /api/admin/quotes/:id/send : envoyer par email
app.post('/api/admin/quotes/:id/send', auth, adminOnly, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });

    const publicUrl = `https://www.pirabellabs.com/devis/${quote.publicToken}`;

    const itemsRows = quote.items.map(i =>
      `<tr><td style="padding:8px 12px;border-bottom:1px solid #222;color:#e5e2e1;font-size:13px;">${escapeHtml(i.description)}</td><td style="padding:8px 12px;border-bottom:1px solid #222;color:rgba(229,226,225,0.7);font-size:13px;text-align:right;">${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #222;color:rgba(229,226,225,0.7);font-size:13px;text-align:right;">${i.unitPrice.toFixed(2)} ${quote.currency}</td><td style="padding:8px 12px;border-bottom:1px solid #222;color:#e5e2e1;font-weight:600;font-size:13px;text-align:right;">${i.total.toFixed(2)} ${quote.currency}</td></tr>`
    ).join('');

    const html = masterTemplate({
      headerType: 'hero',
      preheader: `Votre devis ${quote.reference} - ${quote.title}`,
      title: 'Bonjour ' + escapeHtml(quote.clientName.split(' ')[0]) + ',',
      subtitle: 'Votre devis est prêt',
      body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Comme convenu, voici votre devis personnalise :</p>' +
        '<div style="margin:24px 0;padding:24px;background:#0e0e0e;border:1px solid rgba(255,85,0,0.3);border-radius:12px;">' +
        '<div style="font-family:Montserrat,sans-serif;font-weight:700;font-size:12px;color:#FF5500;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">' + escapeHtml(quote.reference) + '</div>' +
        '<div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:20px;color:#e5e2e1;line-height:1.3;margin-bottom:16px;">' + escapeHtml(quote.title) + '</div>' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:1px solid #333;border-bottom:1px solid #333;"><thead><tr><th style="padding:8px 12px;background:#1a1a1a;font-size:12px;color:rgba(229,226,225,0.6);text-align:left;text-transform:uppercase;letter-spacing:0.08em;">Description</th><th style="padding:8px 12px;background:#1a1a1a;font-size:12px;color:rgba(229,226,225,0.6);text-align:right;">Qte</th><th style="padding:8px 12px;background:#1a1a1a;font-size:12px;color:rgba(229,226,225,0.6);text-align:right;">PU</th><th style="padding:8px 12px;background:#1a1a1a;font-size:12px;color:rgba(229,226,225,0.6);text-align:right;">Total</th></tr></thead><tbody>' + itemsRows + '</tbody></table>' +
        '<div style="margin-top:16px;text-align:right;"><div style="font-size:13px;color:rgba(229,226,225,0.7);margin-bottom:4px;">Sous-total : ' + quote.subtotal.toFixed(2) + ' ' + quote.currency + '</div>' +
        (quote.taxRate > 0 ? '<div style="font-size:13px;color:rgba(229,226,225,0.7);margin-bottom:4px;">TVA ' + quote.taxRate + '% : ' + quote.taxAmount.toFixed(2) + ' ' + quote.currency + '</div>' : '') +
        '<div style="font-family:Montserrat,sans-serif;font-weight:800;font-size:20px;color:#FF5500;margin-top:8px;">Total : ' + quote.total.toFixed(2) + ' ' + quote.currency + '</div></div>' +
        '</div>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.6);line-height:1.6;">Valide jusqu&apos;au <strong style="color:#e5e2e1;">' + quote.validUntil.toLocaleDateString('fr-FR', {day:'numeric',month:'long',year:'numeric'}) + '</strong>.</p>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.5);">Cliquez ci-dessous pour consulter le detail, accepter ou refuser le devis directement en ligne.</p>',
      cta: 'Consulter et valider le devis',
      ctaUrl: publicUrl
    });

    sendEmail(quote.clientEmail, `Votre devis Pirabel Labs - ${quote.reference}`, html)
      .catch(e => console.error('[quotes] send email error:', e.message));

    quote.status = 'envoye';
    quote.sentAt = new Date();
    await quote.save();

    // Update lead
    await Lead.findByIdAndUpdate(quote.leadId, {
      $inc: { quotesSent: 1 },
      $set: { lastQuoteAt: new Date(), stage: 'devis_envoye' }
    });

    res.json({ success: true, message: 'Devis envoye au client.', publicUrl });
  } catch (err) {
    console.error('[quotes] send error:', err.message);
    res.status(500).json({ error: 'Erreur envoi : ' + err.message });
  }
});

// === PUBLIC quote view (no auth, by token) ===
app.get('/api/quotes/:token', async (req, res) => {
  try {
    const quote = await Quote.findOne({ publicToken: req.params.token });
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });

    if (!quote.viewedAt) {
      quote.viewedAt = new Date();
      if (quote.status === 'envoye') quote.status = 'consulte';
      await quote.save();
    }

    res.json({
      reference: quote.reference,
      title: quote.title,
      clientName: quote.clientName,
      clientCompany: quote.clientCompany,
      items: quote.items,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      total: quote.total,
      currency: quote.currency,
      introduction: quote.introduction,
      terms: quote.terms,
      validUntil: quote.validUntil,
      issuedAt: quote.issuedAt,
      status: quote.status
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.post('/api/quotes/:token/accept', async (req, res) => {
  try {
    const quote = await Quote.findOne({ publicToken: req.params.token });
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    if (quote.status === 'accepte') return res.json({ success: true, message: 'Devis deja accepte.' });
    if (quote.status === 'refuse') return res.status(403).json({ error: 'Devis deja refuse.' });

    quote.status = 'accepte';
    quote.acceptedAt = new Date();
    await quote.save();

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
    sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      `[Pirabel Labs] Devis ACCEPTE - ${quote.reference} (${quote.total} ${quote.currency})`,
      masterTemplate({
        title: 'Devis accepte !',
        body: `<p>Le devis <strong>${escapeHtml(quote.reference)}</strong> (${escapeHtml(quote.title)}) vient d'etre accepte par <strong>${escapeHtml(quote.clientName)}</strong> (${escapeHtml(quote.clientEmail)}).</p><p>Montant : <strong>${quote.total} ${quote.currency}</strong></p><p>Le lead a ete converti en client. Lancement du projet a planifier.</p>`,
        cta: 'Ouvrir le dashboard',
        ctaUrl: 'https://www.pirabellabs.com/admin/dashboard'
      })
    ).catch(e => console.error('[quotes] accept admin email:', e.message));

    // Email confirmation client
    sendEmail(
      quote.clientEmail,
      `Devis accepte - ${quote.reference}`,
      masterTemplate({
        title: 'Merci ' + escapeHtml(quote.clientName.split(' ')[0]) + ' !',
        body: `<p>Nous avons bien recu votre acceptation du devis <strong>${escapeHtml(quote.reference)}</strong> pour ${escapeHtml(quote.title)}.</p><p>Un cofondateur (Lissanon Gildas ou Fidah Imorou) vous contactera sous 24h pour planifier le kick-off.</p><p>A tres vite,<br><strong>L'equipe Pirabel Labs</strong></p>`,
        cta: 'Visiter pirabellabs.com',
        ctaUrl: 'https://www.pirabellabs.com'
      })
    ).catch(e => console.error('[quotes] accept client email:', e.message));

    res.json({ success: true, message: 'Devis accepte. Nous vous recontactons sous 24h.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.post('/api/quotes/:token/refuse', async (req, res) => {
  try {
    const quote = await Quote.findOne({ publicToken: req.params.token });
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    if (quote.status === 'accepte') return res.status(403).json({ error: 'Devis deja accepte.' });

    quote.status = 'refuse';
    quote.refusedAt = new Date();
    quote.internalNotes = (quote.internalNotes || '') + '\n[Refus client] ' + sanitize(req.body?.reason || 'Aucune raison fournie', 1000);
    await quote.save();

    sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      `[Pirabel Labs] Devis REFUSE - ${quote.reference}`,
      masterTemplate({
        title: 'Devis refuse',
        body: `<p>Le devis <strong>${escapeHtml(quote.reference)}</strong> vient d'etre refuse par <strong>${escapeHtml(quote.clientName)}</strong>.</p><p>Raison : ${escapeHtml(req.body?.reason || 'non precisee')}</p>`,
        cta: 'Ouvrir le dashboard',
        ctaUrl: 'https://www.pirabellabs.com/admin/dashboard'
      })
    ).catch(() => {});

    res.json({ success: true, message: 'Devis refuse. Merci pour votre retour.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Static : page publique devis
app.get('/devis/:token', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'app', 'views', 'public-devis.html'));
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
      subtitle: 'Votre avis compte enormement',
      body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Apres notre collaboration, nous aimerions beaucoup avoir votre retour honnete sur notre travail.</p>' +
        '<p style="font-size:15px;line-height:1.7;color:rgba(229,226,225,0.7);">Cela nous prend <strong style="color:#e5e2e1;">2 minutes</strong> et nous aide enormement a progresser et a rassurer les prochains clients qui hesitent.</p>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.5);">Merci infiniment,<br><strong style="color:#e5e2e1;">L&apos;equipe Pirabel Labs</strong></p>',
      cta: 'Laisser mon avis (2 min)',
      ctaUrl: publicUrl
    });

    sendEmail(lead.email, 'Votre avis sur Pirabel Labs (2 min)', html)
      .catch(e => console.error('[reviews] request email error:', e.message));

    lead.reviewRequestedAt = new Date();
    await lead.save();

    res.json({ success: true, message: 'Demande d&apos;avis envoyee.', publicUrl });
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
    if (!review) return res.status(404).json({ error: 'Lien invalide ou expire.' });
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
    if (!review) return res.status(404).json({ error: 'Lien invalide ou expire.' });
    if (review.submittedAt) return res.status(403).json({ error: 'Avis deja soumis.' });

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

    sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      `[Pirabel Labs] Nouvel avis client - ${rating}/5 - ${review.clientName}`,
      masterTemplate({
        title: 'Nouvel avis client',
        body: `<p><strong>${escapeHtml(review.clientName)}</strong> (${escapeHtml(review.clientEmail)}) a laisse un avis :</p><p>Note : <strong>${rating}/5</strong></p><blockquote style="border-left:3px solid #FF5500;padding-left:16px;margin:16px 0;color:rgba(229,226,225,0.85);font-style:italic;">${escapeHtml(comment)}</blockquote><p>A moderer dans le dashboard avant publication sur le site.</p>`,
        cta: 'Moderer l\'avis',
        ctaUrl: 'https://www.pirabellabs.com/admin/dashboard'
      })
    ).catch(() => {});

    res.json({ success: true, message: 'Merci pour votre avis ! Il sera publie apres moderation.' });
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
    if (existing) return res.status(409).json({ error: 'Un lead avec cet email existe deja.', existing });

    const lead = await Lead.create({
      type: 'contact', stage, status,
      name, email, phone, company,
      service: '', message: 'Cree manuellement depuis le dashboard admin',
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
    const quote = await Quote.findOne({ publicToken: req.params.token });
    if (!quote) return res.status(404).json({ error: 'Devis introuvable.' });
    if (quote.status === 'accepte' || quote.status === 'refuse') {
      return res.status(403).json({ error: 'Devis deja accepte ou refuse.' });
    }
    const message = sanitize(req.body.message || '', 2000);
    if (!message || message.length < 10) return res.status(400).json({ error: 'Message trop court (10 caracteres min).' });

    quote.internalNotes = (quote.internalNotes || '') + '\n[Ajustement demande ' + new Date().toISOString() + '] ' + message;
    await quote.save();

    sendEmail(
      process.env.CONTACT_EMAIL || 'contact@pirabellabs.com',
      `[Pirabel Labs] Ajustement demande - Devis ${quote.reference}`,
      masterTemplate({
        title: 'Demande d\'ajustement client',
        body: `<p>Le client <strong>${escapeHtml(quote.clientName)}</strong> (${escapeHtml(quote.clientEmail)}) demande des ajustements sur le devis <strong>${escapeHtml(quote.reference)}</strong> (${escapeHtml(quote.title)}).</p><p><strong>Message :</strong></p><blockquote style="border-left:3px solid #FF5500;padding-left:16px;margin:16px 0;color:rgba(229,226,225,0.85);font-style:italic;">${escapeHtml(message)}</blockquote><p>Modifiez le devis dans le dashboard et renvoyez une version corrigee.</p>`,
        cta: 'Ouvrir le dashboard',
        ctaUrl: 'https://www.pirabellabs.com/admin/dashboard'
      })
    ).catch(() => {});

    res.json({ success: true, message: 'Demande envoyee. Nous revenons vers vous sous 48h.' });
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
      Quote.countDocuments({ status: { $in: ['envoye', 'consulte'] } }),
      Quote.countDocuments({ status: 'accepte' }),
      Quote.aggregate([{ $match: { status: 'accepte' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Review.countDocuments({ status: 'en_attente', submittedAt: { $ne: null } }),
      Review.countDocuments({ publishedOnSite: true }),
      Lead.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
      Lead.countDocuments({ createdAt: { $gte: d30 } }),
      Lead.countDocuments({ stage: 'client', 'clientData.becameClientAt': { $gte: d30 } })
    ]);

    res.json({
      leads: { total: leadsTotal, prospects, clients, last30: leadsLast30, conversionsLast30 },
      quotes: { total: quotesTotal, pending: quotesPending, accepted: quotesAccepted, revenue: quotesRevenue[0]?.total || 0 },
      reviews: { pending: reviewsPending, published: reviewsPublished },
      byStage
    });
  } catch (err) {
    console.error('[stats-extended] error:', err.message);
    res.status(500).json({ error: 'Erreur stats.' });
  }
});

// === ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error('[unhandled]', err.message);
  res.status(500).json({ error: 'Erreur serveur.' });
});

module.exports = app;
