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

const connectDB = require('../app/config/db');
const { sendEmail, masterTemplate, newOrderEmail } = require('../app/config/email');
const {
  rateLimit, sanitize, sanitizeSoft, sanitizeEmail, honeypotCheck, limitBody,
  isValidEmail, securityHeaders, globalSanitize,
} = require('../app/middleware/security');
const { auth, adminOnly } = require('../app/middleware/auth');
const siteNav = require('../app/nav'); // en-tête de site partagé (mega menu) pour blog/réalisations/témoignages
const User = require('../app/models/User');
const Lead = require('../app/models/Lead');
const Media = require('../app/models/Media');
const Quote = require('../app/models/Quote');
const Review = require('../app/models/Review');
const TrafficStat = require('../app/models/TrafficStat');
const Article = require('../app/models/Article');
const CaseStudy = require('../app/models/CaseStudy');
const LivreBlanc = require('../app/models/LivreBlanc');
const Comment = require('../app/models/Comment');
const Task = require('../app/models/Task');
const Conversation = require('../app/models/Conversation');
const SentEmail = require('../app/models/SentEmail');
const Setting = require('../app/models/Setting');
const Appointment = require('../app/models/Appointment');

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
        '<p style="font-size:15px;line-height:1.7;color:rgba(229,226,225,0.7);">Un membre de notre equipe (souvent le fondateur) vous repond sous <strong style="color:#e5e2e1;">24h ouvrees</strong> avec :</p>' +
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
        '<p style="font-size:14px;color:rgba(229,226,225,0.5);margin-top:24px;">A tres vite,<br><strong style="color:#e5e2e1;">L&apos;equipe Pirabel Labs</strong><br>Lissanon Gildas, cofondateurs</p>',
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
    console.error('[contact] error:', err && err.message, err && err.name);
    // Toujours renvoyer une CHAINE (jamais l'objet d'erreur) pour eviter "[object Object]" cote client
    var msg = 'Erreur serveur. Reessayez ou ecrivez a contact@pirabellabs.com';
    if (err && err.name === 'ValidationError') {
      msg = 'Donnees invalides. Verifiez les champs et reessayez.';
    }
    res.status(500).json({ error: msg });
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
    // E-mail admin
    sendEmail(
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

    // Confirmation client
    sendEmail(
      email, 'Pirabel Labs — votre demande de rendez-vous est bien reçue',
      masterTemplate({
        headerType: 'hero', preheader: 'Demande de rendez-vous reçue',
        title: 'Bonjour ' + escapeHtml(name.split(' ')[0]) + ',',
        body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Merci&nbsp;! Votre demande de rendez-vous (' + escapeHtml(chanLabel) + ') pour le <strong style="color:#FF5500;">' + escapeHtml(when) + '</strong> est bien enregistrée.</p>' +
          '<p style="font-size:15px;line-height:1.7;color:rgba(229,226,225,0.7);">Lissanon Gildas vous confirme le créneau (ou vous en propose un proche) sous 24&nbsp;h ouvrées.</p>' +
          '<div style="border-left:3px solid rgba(255,85,0,0.3);padding:14px 18px;background:rgba(255,85,0,0.03);margin:20px 0;"><p style="margin:0;font-size:14px;color:rgba(229,226,225,0.7);line-height:1.6;">Besoin de <strong style="color:#e5e2e1;">changer de créneau ou d\'annuler</strong>&nbsp;? Vous pouvez le faire vous-même en un clic, à tout moment&nbsp;:<br><a href="' + escapeHtml(manageUrl) + '" style="color:#FF5500;font-weight:600;">Gérer mon rendez-vous &rarr;</a></p></div>' +
          '<p style="font-size:14px;line-height:1.7;color:rgba(229,226,225,0.6);">Une urgence&nbsp;? Écrivez-nous sur <a href="https://wa.me/16139273067" style="color:#FF5500;">WhatsApp</a>.</p>',
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
app.get('/rdv/:token', async (req, res) => {
  try {
    const token = String(req.params.token || '').slice(0, 80);
    const a = await Appointment.findOne({ publicToken: token }).lean();
    const page = (inner) => '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined&display=swap">' +
      '<title>Mon rendez-vous — Pirabel Labs</title><style>*{box-sizing:border-box;margin:0}body{background:#0e0e0e;color:#e5e2e1;font-family:Inter,system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem}' +
      '.card{background:#161616;border:1px solid rgba(229,226,225,.1);border-radius:16px;padding:2rem;max-width:34rem;width:100%}.b{display:inline-block;background:rgba(255,85,0,.12);color:#FF5500;font-weight:700;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;padding:.35rem .8rem;border-radius:999px;margin-bottom:1rem}' +
      'h1{font-family:Space Grotesk,sans-serif;font-size:1.5rem;margin-bottom:.4rem}p{color:rgba(229,226,225,.65);line-height:1.6}label{display:block;font-size:.78rem;font-weight:600;color:rgba(229,226,225,.6);margin:1rem 0 .35rem}' +
      'input,select{width:100%;background:#1a1a1a;border:1px solid rgba(229,226,225,.18);color:#e5e2e1;padding:.7rem .85rem;border-radius:9px;font-size:.95rem;font-family:inherit}' +
      '.row{display:flex;gap:.8rem;flex-wrap:wrap}.row>div{flex:1;min-width:9rem}.btn{display:inline-flex;align-items:center;justify-content:center;gap:.4rem;border:0;border-radius:999px;padding:.8rem 1.4rem;font-weight:700;font-size:.85rem;cursor:pointer;font-family:Space Grotesk,sans-serif}' +
      '.btn--p{background:#FF5500;color:#fff}.btn--g{background:transparent;border:1px solid rgba(229,226,225,.2);color:#e5e2e1}.msg{margin:1rem 0 0;padding:.9rem 1.1rem;border-radius:10px;font-size:.9rem;display:none}' +
      '.material-symbols-outlined{font-size:1.1rem;vertical-align:middle}</style></head><body><div class="card">' + inner + '</div></body></html>';
    if (!a) return res.status(404).set('Content-Type', 'text/html; charset=utf-8').send(page('<span class="b">Pirabel Labs</span><h1>Lien introuvable</h1><p>Ce rendez-vous n\'existe pas ou le lien a expiré. Écrivez-nous à <a href="mailto:contact@pirabellabs.com" style="color:#FF5500">contact@pirabellabs.com</a>.</p>'));
    if (a.status === 'annule') return res.set('Content-Type', 'text/html; charset=utf-8').send(page('<span class="b">Pirabel Labs</span><h1>Rendez-vous annulé</h1><p>Ce rendez-vous a été annulé. Pour en reprendre un, <a href="/contact#rdv" style="color:#FF5500">cliquez ici</a>.</p>'));
    const opt = (v, sel) => '<option' + (v === sel ? ' selected' : '') + '>' + v + '</option>';
    const chanOpt = (k) => '<option value="' + k + '"' + (a.channel === k ? ' selected' : '') + '>' + RDV_CHAN[k] + '</option>';
    const inner = '<span class="b">Pirabel Labs</span><h1>Votre rendez-vous</h1>' +
      '<p>Bonjour ' + escapeHtml(a.name.split(' ')[0]) + ', vous pouvez déplacer ce rendez-vous ou l\'annuler. Lissanon Gildas est prévenu automatiquement.</p>' +
      '<div id="msg" class="msg"></div>' +
      '<div id="form">' +
      '<label>Date souhaitée</label><input id="d" type="date" value="' + escapeHtml(a.preferredDate || '') + '">' +
      '<div class="row"><div><label>Heure</label><select id="t">' + ['', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(v => '<option' + (v === a.preferredTime ? ' selected' : '') + '>' + (v || 'Indifférent') + '</option>').join('') + '</select></div>' +
      '<div><label>Comment&nbsp;?</label><select id="c">' + ['visio', 'whatsapp', 'telephone', 'presentiel'].map(chanOpt).join('') + '</select></div></div>' +
      '<label>Motif <span style="color:#FF5500">*</span> <span style="font-weight:400;color:rgba(229,226,225,.45)">(obligatoire pour déplacer ou annuler)</span></label>' +
      '<textarea id="r" rows="2" placeholder="Ex. imprévu, conflit d\'agenda, besoin d\'un autre créneau…" style="width:100%;background:#1a1a1a;border:1px solid rgba(229,226,225,.18);color:#e5e2e1;padding:.7rem .85rem;border-radius:9px;font-size:.95rem;font-family:inherit;resize:vertical"></textarea>' +
      '<div style="display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1.4rem"><button class="btn btn--p" id="save"><span class="material-symbols-outlined">event_available</span> Enregistrer le changement</button>' +
      '<button class="btn btn--g" id="cancel" style="color:#f87171;border-color:rgba(248,113,113,.4)"><span class="material-symbols-outlined">cancel</span> Annuler le rendez-vous</button></div>' +
      // Bloc de confirmation d'annulation (inline, masqué) — pas de pop-up navigateur
      '<div id="cancelBox" style="display:none;margin-top:1.2rem;padding:1.1rem 1.2rem;border:1px solid rgba(248,113,113,.35);background:rgba(248,113,113,.08);border-radius:12px;">' +
        '<div style="font-weight:700;color:#f87171;margin-bottom:.4rem;">Confirmer l\'annulation&nbsp;?</div>' +
        '<p style="margin:0 0 .6rem;font-size:.88rem;">Indiquez le motif ci-dessus, puis confirmez. Cette action est définitive.</p>' +
        '<div style="display:flex;gap:.6rem;flex-wrap:wrap;"><button class="btn btn--g" id="cancelBack">Garder le rendez-vous</button>' +
        '<button class="btn" id="cancelYes" style="background:#f87171;color:#0e0e0e"><span class="material-symbols-outlined">delete</span> Oui, annuler</button></div>' +
      '</div>' +
      '</div>' +
      '<script>var T="' + token + '";function show(ok,t){var m=document.getElementById("msg");m.style.display="block";m.style.cssText="margin:1rem 0 0;padding:.9rem 1.1rem;border-radius:10px;font-size:.9rem;display:block;"+(ok?"background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.35);color:#4ade80":"background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.35);color:#f87171");m.innerHTML=t;m.scrollIntoView({behavior:"smooth",block:"center"});}' +
      'function reason(){return (document.getElementById("r").value||"").trim();}' +
      'async function post(b){return (await fetch("/api/rdv/"+T,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(b)})).json();}' +
      'document.getElementById("save").onclick=async function(){if(reason().length<3){show(false,"Merci d\\u0027indiquer un motif (au moins quelques mots) pour ce changement.");return;}this.disabled=true;try{var r=await post({action:"reschedule",date:document.getElementById("d").value,time:document.getElementById("t").value==="Indifférent"?"":document.getElementById("t").value,channel:document.getElementById("c").value,reason:reason()});if(r.success)show(true,"<strong>C\\u0027est noté&nbsp;!</strong> Votre nouveau créneau a été enregistré et transmis à Pirabel Labs.");else show(false,r.error||"Erreur.");}catch(e){show(false,"Erreur réseau.");}this.disabled=false;};' +
      'document.getElementById("cancel").onclick=function(){document.getElementById("cancelBox").style.display="block";document.getElementById("cancelBox").scrollIntoView({behavior:"smooth",block:"center"});};' +
      'document.getElementById("cancelBack").onclick=function(){document.getElementById("cancelBox").style.display="none";};' +
      'document.getElementById("cancelYes").onclick=async function(){if(reason().length<3){show(false,"Merci d\\u0027indiquer le motif de l\\u0027annulation dans le champ ci-dessus.");return;}this.disabled=true;try{var r=await post({action:"cancel",reason:reason()});if(r.success){document.getElementById("form").style.display="none";show(true,"<strong>Rendez-vous annulé.</strong> Merci de nous avoir prévenus. Vous pouvez en reprendre un quand vous le souhaitez sur pirabellabs.com/contact.");}else{show(false,r.error||"Erreur.");this.disabled=false;}}catch(e){show(false,"Erreur réseau.");this.disabled=false;}};<\/script>';
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
    sendEmail(
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

app.post('/api/livre-blanc/request', livreBlancLimiter, honeypotCheck('lb_check_hp'), limitBody(10), async (req, res) => {
  try {
    const name = sanitize(req.body.name, 120);
    const email = sanitizeEmail(req.body.email);
    const company = sanitize(req.body.company || '', 120);
    const phone = sanitize(req.body.phone || '', 30);
    const slug = sanitize(req.body.slug || '', 100);
    const newsletterOptIn = req.body.newsletter !== false; // default true

    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom requis.' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide.' });
    // Cherche d'abord en base (CMS), repli sur les livres blancs historiques codés.
    let lb = await LivreBlanc.findOne({ slug, status: 'publie' }).lean();
    if (!lb) lb = LIVRES_BLANCS[slug];
    if (!lb) return res.status(400).json({ error: 'Livre blanc inconnu.' });
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
    res.json({ leads, stats, byType, byLivreBlanc });
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

// === REPONDRE / ECRIRE A UN CLIENT OU PROSPECT (envoi email individuel) ===
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

    // Texte libre -> HTML (paragraphes + retours ligne), echappe
    const para = 'font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);margin:0 0 16px;';
    const bodyHtml = '<p style="' + para + '">' +
      escapeHtml(message).replace(/\n\n+/g, '</p><p style="' + para + '">').replace(/\n/g, '<br>') +
      '</p>';
    const greeting = (lead && lead.name) ? ('Bonjour ' + escapeHtml(lead.name.split(' ')[0]) + ',') : 'Bonjour,';
    const html = masterTemplate({
      headerType: 'hero',
      preheader: subject,
      title: greeting,
      body: bodyHtml,
      cta: 'Visiter pirabellabs.com',
      ctaUrl: 'https://www.pirabellabs.com',
    });

    const ok = await sendEmail(to, subject, html, { replyTo: process.env.ADMIN_EMAIL || 'contact@pirabellabs.com' });
    if (!ok) return res.status(502).json({ error: "Envoi refuse. Verifiez que le domaine pirabellabs.com est verifie sur Resend (resend.com/domains)." });

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
    res.json({ success: true, message: 'Email envoye a ' + to });
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

// Coquille HTML a la charte Pirabel Labs (reutilise /css/global.css)
function blogShell(headExtra, bodyHtml) {
  return '<!doctype html><html lang="fr"><head>' +
    '<script async src="https://www.googletagmanager.com/gtag/js?id=G-H0ZTTRYBQ7"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","G-H0ZTTRYBQ7");</script>' +
    '<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<link rel="icon" type="image/png" href="/img/favicon.png?v=elan">' +
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Montserrat:wght@700;800;900&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap">' +
    '<link rel="stylesheet" href="/css/global.css?v=elan3">' + (headExtra || '') +
    '<style>' +
    '.bx-top{display:flex;align-items:center;justify-content:space-between;padding:1rem clamp(1.25rem,4vw,3rem);border-bottom:1px solid rgba(229,226,225,0.1);position:sticky;top:0;background:rgba(10,10,10,0.92);backdrop-filter:blur(10px);z-index:20;}' +
    '.bx-top a.bx-logo{font-family:"Space Grotesk",sans-serif;font-weight:800;font-size:1.15rem;color:#e5e2e1;text-decoration:none;letter-spacing:-.02em;}' +
    '.bx-top a.bx-logo span{color:#FF5500;}' +
    '.bx-top nav a{margin-left:1.4rem;font-size:.9rem;font-weight:600;color:rgba(229,226,225,0.65);text-decoration:none;}' +
    '.bx-top nav a:hover{color:#FF5500;}' +
    '.bx-wrap{max-width:74rem;margin:0 auto;padding:clamp(2.5rem,5vw,4rem) clamp(1.25rem,4vw,3rem) 4rem;}' +
    '.bx-hero{text-align:center;max-width:48rem;margin:0 auto 3rem;}' +
    '.bx-hero h1{font-family:"Montserrat",sans-serif;font-weight:900;font-size:clamp(2rem,5vw,3.4rem);line-height:1.06;letter-spacing:-.035em;margin:0 0 1rem;color:#fff;}' +
    '.bx-hero p{color:rgba(229,226,225,0.65);font-size:1.05rem;line-height:1.6;}' +
    '.bx-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,19rem),1fr));gap:1.5rem;}' +
    '.bx-card{background:#161616;border:1px solid rgba(229,226,225,0.1);border-radius:14px;overflow:hidden;text-decoration:none;color:#e5e2e1;display:flex;flex-direction:column;transition:transform .2s,border-color .2s;}' +
    '.bx-card:hover{transform:translateY(-4px);border-color:#FF5500;}' +
    '.bx-card__img{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;background:linear-gradient(135deg,rgba(255,85,0,0.2),rgba(14,14,14,1));}' +
    '.bx-card__b{padding:1.1rem 1.2rem 1.4rem;}' +
    '.bx-cat{color:#FF5500;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;}' +
    '.bx-card h2{font-family:"Space Grotesk",sans-serif;font-size:1.15rem;margin:.5rem 0;line-height:1.25;color:#fff;}' +
    '.bx-card p{color:rgba(229,226,225,0.6);font-size:.9rem;line-height:1.5;margin:0;}' +
    '.bx-article{max-width:none;margin:0;min-width:0;}.bx-layout{display:grid;grid-template-columns:minmax(0,1fr) 16rem;gap:2.5rem;align-items:start;}.bx-side{position:sticky;top:1.5rem;display:flex;flex-direction:column;gap:1.1rem;}.bx-toc{background:#161616;border:1px solid rgba(229,226,225,0.1);border-radius:12px;padding:1rem 1.1rem;max-height:72vh;overflow:auto;}.bx-toc strong{display:block;color:#fff;font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem;}.bx-toc a{display:block;color:rgba(229,226,225,0.6);text-decoration:none;font-size:.84rem;line-height:1.3;padding:.32rem 0 .32rem .6rem;border-left:2px solid rgba(229,226,225,0.12);}.bx-toc a:hover{color:#FF5500;border-left-color:#FF5500;}.bx-side__author{display:flex;gap:.7rem;align-items:center;background:#161616;border:1px solid rgba(229,226,225,0.1);border-radius:12px;padding:1rem;}.bx-side__cta{background:linear-gradient(135deg,rgba(255,85,0,0.14),#161616);border:1px solid rgba(255,85,0,0.3);border-radius:12px;padding:1.1rem;text-align:center;}.bx-side__cta a{display:inline-block;background:#FF5500;color:#190800;font-weight:700;padding:.55rem 1.1rem;border-radius:999px;text-decoration:none;font-size:.82rem;margin-top:.6rem;}.bx-cover{margin:0 0 2rem;border-radius:16px;overflow:hidden;border:1px solid rgba(229,226,225,0.08);}.bx-cover svg{display:block;width:100%;height:auto;}.bx-comments{margin-top:3rem;padding-top:2rem;border-top:1px solid rgba(229,226,225,0.12);}.bx-comments h2{font-size:1.5rem;margin-bottom:1.4rem;}.bx-cmlist{display:flex;flex-direction:column;gap:1rem;margin-bottom:2.5rem;}.bx-cm{background:#161616;border:1px solid rgba(229,226,225,0.08);border-radius:12px;padding:1rem 1.2rem;}.bx-cm__h{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;margin-bottom:.4rem;}.bx-cm__h strong{color:#fff;font-size:.95rem;}.bx-cm__h span{color:rgba(229,226,225,0.4);font-size:.78rem;white-space:nowrap;}.bx-cm p{margin:0;color:rgba(229,226,225,0.75);font-size:.95rem;line-height:1.6;white-space:pre-wrap;}.bx-cmform{background:#141313;border:1px solid rgba(229,226,225,0.1);border-radius:14px;padding:1.5rem;}.bx-cmform h3{font-size:1.15rem;margin:0 0 .2rem;color:#fff;}.bx-cmnote{color:rgba(229,226,225,0.5);font-size:.85rem;margin:.2rem 0 1.1rem;}.bx-cmform input,.bx-cmform textarea{width:100%;background:#0e0e0e;border:1px solid rgba(229,226,225,0.15);border-radius:8px;padding:.7rem .9rem;color:#fff;font-family:inherit;font-size:.95rem;margin-bottom:.8rem;box-sizing:border-box;}.bx-cmform input:focus,.bx-cmform textarea:focus{outline:none;border-color:#FF5500;}.bx-cmform textarea{resize:vertical;}.bx-hp{position:absolute!important;left:-9999px!important;height:0!important;width:0!important;opacity:0!important;}.bx-cmmsg{font-size:.88rem;margin:.2rem 0 .6rem;}.bx-cmbtn{background:#FF5500;color:#190800;font-weight:700;border:none;border-radius:999px;padding:.7rem 1.6rem;font-size:.92rem;cursor:pointer;font-family:inherit;}.bx-cmbtn:disabled{opacity:.6;cursor:default;}@media(max-width:900px){.bx-layout{grid-template-columns:1fr;}.bx-side{display:none;}}' +
    '.bx-article .bx-cat{display:inline-block;margin-bottom:.6rem;}' +
    '.bx-article h1{font-family:"Montserrat",sans-serif;font-weight:900;font-size:clamp(1.9rem,4.5vw,2.9rem);line-height:1.1;letter-spacing:-.03em;margin:.3rem 0 1rem;color:#fff;}' +
    '.bx-meta{color:rgba(229,226,225,0.4);font-size:.85rem;margin-bottom:1.6rem;}' +
    '.bx-heroimg{width:100%;border-radius:16px;margin:0 0 2rem;display:block;}' +
    '.bx-content{font-size:1.13rem;line-height:1.85;color:rgba(229,226,225,0.92);}' +
    '.bx-content h2{font-family:"Space Grotesk",sans-serif;color:#fff;font-size:1.55rem;margin:2.2rem 0 .8rem;}' +
    '.bx-content h3{font-family:"Space Grotesk",sans-serif;color:#fff;font-size:1.25rem;margin:1.6rem 0 .5rem;}' +
    '.bx-content p{margin:0 0 1.1rem;}.bx-content img{max-width:100%;border-radius:12px;margin:1rem 0;}' +
    '.bx-content a{color:#FF5500;}.bx-content ul,.bx-content ol{padding-left:1.3rem;margin:0 0 1.1rem;}.bx-content li{margin:.3rem 0;}' +
    '.bx-back{display:inline-flex;align-items:center;gap:.4rem;color:rgba(229,226,225,0.6);text-decoration:none;font-size:.9rem;margin-bottom:1.5rem;}' +
    '.bx-cta{margin-top:3rem;text-align:center;background:#161616;border:1px solid rgba(255,85,0,0.3);border-radius:16px;padding:2rem;}' +
    '.bx-cta a{display:inline-block;background:#FF5500;color:#190800;font-weight:700;padding:.9rem 2rem;border-radius:999px;text-decoration:none;margin-top:1rem;}' +
    '.bx-foot{text-align:center;padding:2.5rem 1rem;border-top:1px solid rgba(229,226,225,0.1);color:rgba(229,226,225,0.5);font-size:.85rem;}.bx-foot a{color:#FF5500;text-decoration:none;}' +
    '.art-pullquote{border-left:3px solid #FF5500;background:rgba(255,85,0,0.05);padding:1.2rem 1.4rem;margin:1.8rem 0;display:flex;gap:1rem;align-items:flex-start;border-radius:0 10px 10px 0;}' +
    '.art-pullquote__icon{color:#FF5500;font-size:1.8rem;flex-shrink:0;}.art-pullquote__text{font-style:italic;color:#fff;font-size:1.1rem;line-height:1.6;}' +
    '.art-stat-box{display:flex;gap:1.2rem;align-items:center;background:#161616;border:1px solid rgba(229,226,225,0.1);border-radius:12px;padding:1.4rem;margin:1.8rem 0;}' +
    '.art-stat-box__num{font-family:"Montserrat",sans-serif;font-weight:900;font-size:2.4rem;color:#FF5500;line-height:1;flex-shrink:0;}' +
    '.art-stat-box__label{color:#fff;font-weight:700;margin-bottom:.3rem;}.art-stat-box__desc{color:rgba(229,226,225,0.6);font-size:.92rem;line-height:1.5;}' +
    '.art-author{display:flex;gap:1rem;align-items:flex-start;background:#161616;border:1px solid rgba(229,226,225,0.1);border-radius:12px;padding:1.4rem;margin:2.5rem 0 0;}' +
    '.art-author__avatar{width:54px;height:54px;border-radius:50%;background:#FF5500;color:#190800;display:flex;align-items:center;justify-content:center;font-family:"Space Grotesk",sans-serif;font-weight:800;font-size:1.2rem;flex-shrink:0;}' +
    '.art-author__label{font-size:.72rem;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:.1em;}.art-author__name{font-family:"Space Grotesk",sans-serif;font-weight:700;color:#fff;font-size:1.05rem;}.art-author__role{color:#FF5500;font-size:.85rem;margin-bottom:.4rem;}.art-author__bio{color:rgba(229,226,225,0.6);font-size:.88rem;line-height:1.5;margin:0;}' +
    '.bx-empty{text-align:center;color:rgba(229,226,225,0.5);padding:4rem 1rem;}' +
    // --- menu mobile (hamburger via case à cocher, sans JS) ---
    '.bx-navtoggle{position:absolute;left:-9999px;opacity:0;}' +
    '.bx-burger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:8px;margin-left:auto;}' +
    '.bx-burger span{display:block;width:24px;height:2px;background:#e5e2e1;border-radius:2px;}' +
    // --- conteneur d\'image des cartes (img réelle OU svg) ---
    '.bx-card__img img,.bx-card__img svg{width:100%;height:100%;object-fit:cover;display:block;}' +
    // --- barre filtres + recherche ---
    '.bx-toolbar{display:flex;gap:1rem;align-items:center;margin:0 0 2.2rem;}' +
    '.bx-filters{display:flex;flex-wrap:nowrap;gap:.5rem;overflow-x:auto;flex:1;min-width:0;padding:.15rem .1rem .55rem;scrollbar-width:none;-ms-overflow-style:none;}' +
    '.bx-filters::-webkit-scrollbar{display:none;height:0;}' +
    '.bx-filters a{font-size:.8rem;font-weight:600;color:rgba(229,226,225,0.7);background:#161616;border:1px solid rgba(229,226,225,0.12);padding:.42rem .9rem;border-radius:999px;text-decoration:none;white-space:nowrap;transition:.15s;}' +
    '.bx-filters a:hover{border-color:#FF5500;color:#fff;}.bx-filters a.is-active{background:#FF5500;color:#190800;border-color:#FF5500;}' +
    '.bx-search{display:flex;gap:.4rem;flex-shrink:0;}' +
    '.bx-search input{background:#161616;border:1px solid rgba(229,226,225,0.15);border-radius:999px;padding:.5rem 1rem;color:#fff;font-family:inherit;font-size:.85rem;min-width:11rem;}' +
    '.bx-search input:focus{outline:none;border-color:#FF5500;}' +
    '.bx-search button{background:#FF5500;color:#190800;border:none;border-radius:999px;width:2.5rem;cursor:pointer;display:flex;align-items:center;justify-content:center;}' +
    '.bx-search button .material-symbols-outlined{font-size:1.2rem;}' +
    // --- article vedette (le plus lu) ---
    '.bx-feat{display:grid;grid-template-columns:1.1fr 1fr;gap:0;background:#161616;border:1px solid rgba(229,226,225,0.12);border-radius:18px;overflow:hidden;text-decoration:none;color:#e5e2e1;margin:0 0 2.6rem;transition:border-color .2s;}' +
    '.bx-feat:hover{border-color:#FF5500;}' +
    '.bx-feat__img{position:relative;min-height:280px;overflow:hidden;background:linear-gradient(135deg,rgba(255,85,0,0.2),#0e0e0e);}' +
    '.bx-feat__img img,.bx-feat__img svg{width:100%;height:100%;object-fit:cover;display:block;}' +
    '.bx-feat__b{padding:clamp(1.4rem,3vw,2.4rem);display:flex;flex-direction:column;justify-content:center;}' +
    '.bx-feat__star{display:inline-flex;align-items:center;gap:.35rem;color:#FF5500;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin-bottom:.5rem;}' +
    '.bx-feat__star .material-symbols-outlined{font-size:1rem;}' +
    '.bx-feat h2{font-family:"Montserrat",sans-serif;font-weight:800;font-size:clamp(1.4rem,2.8vw,2.05rem);line-height:1.13;color:#fff;margin:.2rem 0 .7rem;}' +
    '.bx-feat p{color:rgba(229,226,225,0.65);font-size:.98rem;line-height:1.6;margin:0 0 1rem;}' +
    '.bx-feat__more{display:inline-flex;align-items:center;gap:.4rem;color:#FF5500;font-weight:700;font-size:.9rem;}' +
    '.bx-feat__more .material-symbols-outlined{font-size:1.1rem;}' +
    // --- compteur de vues ---
    '.bx-views{display:inline-flex;align-items:center;gap:.3rem;color:rgba(229,226,225,0.45);font-size:.78rem;}' +
    '.bx-views .material-symbols-outlined{font-size:1rem;}' +
    '.bx-card__meta{display:flex;justify-content:space-between;align-items:center;margin-top:.8rem;}' +
    // --- pagination ---
    '.bx-pager{display:flex;justify-content:center;align-items:center;gap:.4rem;flex-wrap:wrap;margin:3rem 0 0;}' +
    '.bx-pager a,.bx-pager span{min-width:2.4rem;height:2.4rem;display:inline-flex;align-items:center;justify-content:center;padding:0 .7rem;border-radius:10px;font-size:.9rem;font-weight:600;text-decoration:none;border:1px solid rgba(229,226,225,0.14);color:rgba(229,226,225,0.75);}' +
    '.bx-pager a:hover{border-color:#FF5500;color:#fff;}.bx-pager .is-active{background:#FF5500;color:#190800;border-color:#FF5500;}.bx-pager .is-disabled{opacity:.35;}' +
    // --- articles similaires ---
    '.bx-related{margin-top:3.5rem;}.bx-related h2{font-size:1.4rem;color:#fff;margin:0 0 1.2rem;}' +
    '.bx-related__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:1.1rem;}' +
    // --- responsive ---
    '@media(max-width:760px){.bx-burger{display:flex;}.bx-top{flex-wrap:wrap;}.bx-top .bx-nav{display:none;flex-basis:100%;flex-direction:column;margin-top:.4rem;}.bx-top .bx-nav a{margin:0;padding:.75rem .2rem;border-top:1px solid rgba(229,226,225,0.08);font-size:.95rem;}.bx-navtoggle:checked~.bx-nav{display:flex;}.bx-feat{grid-template-columns:1fr;}.bx-feat__img{min-height:190px;}.bx-toolbar{flex-direction:column;align-items:stretch;gap:.8rem;}.bx-search{flex:1;order:-1;}.bx-search input{min-width:0;width:100%;flex:1;}}' +
    '@media(max-width:600px){.bx-content{font-size:1rem;line-height:1.72;}.bx-content h2{font-size:1.28rem;}.bx-content h3{font-size:1.08rem;}.bx-article h1{font-size:1.55rem;line-height:1.18;}.bx-hero h1{font-size:1.85rem;}.bx-hero p{font-size:.95rem;}.art-pullquote{padding:1rem 1.1rem;}.art-pullquote__text{font-size:1rem;}.art-stat-box{flex-direction:column;align-items:flex-start;gap:.6rem;padding:1.1rem;}.art-stat-box__num{font-size:2rem;}.bx-content ul,.bx-content ol{padding-left:1.1rem;}}' +
    '</style></head><body style="background:#0a0a0a;color:#e5e2e1;font-family:Inter,sans-serif;margin:0;">' +
    siteNav.html +
    bodyHtml +
    '<footer class="bx-foot">&copy; ' + new Date().getFullYear() + ' Pirabel Labs &middot; <a href="/">pirabellabs.com</a> &middot; <a href="https://wa.me/16139273067">WhatsApp</a></footer>' +
    siteNav.js +
    '<a href="https://wa.me/16139273067?text=Bonjour%20Pirabel%20Labs%2C%20je%20souhaite%20discuter%20de%20mon%20projet" class="wa-float" target="_blank" rel="noopener" aria-label="Discuter sur WhatsApp" translate="no"><svg viewBox="0 0 32 32" fill="#fff" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16 .6C7.5.6.6 7.5.6 16c0 2.8.7 5.4 2.1 7.8L.5 31.5l7.9-2.1c2.3 1.3 4.9 1.9 7.6 1.9 8.5 0 15.4-6.9 15.4-15.4S24.5.6 16 .6zm0 28.2c-2.5 0-4.8-.7-6.9-1.9l-.5-.3-4.7 1.2 1.3-4.5-.3-.5c-1.3-2.1-2-4.6-2-7.1C2.8 8.6 8.7 2.8 16 2.8S29.2 8.6 29.2 16 23.3 28.8 16 28.8zm8.3-9.9c-.5-.2-2.7-1.3-3.1-1.5-.4-.1-.7-.2-1 .2-.3.5-1.1 1.5-1.4 1.7-.3.2-.5.3-.9.1-.5-.2-1.9-.7-3.7-2.3-1.4-1.2-2.3-2.7-2.5-3.2-.3-.5 0-.7.2-.9.2-.2.5-.5.7-.8.2-.3.3-.5.4-.8.1-.3.1-.6 0-.8-.1-.2-1-2.4-1.4-3.3-.4-.9-.7-.7-1-.8h-.8c-.3 0-.7.1-1.1.5-.4.4-1.5 1.4-1.5 3.4s1.5 4 1.7 4.3c.2.3 3 4.6 7.3 6.4 1 .4 1.8.7 2.4.9 1 .3 1.9.3 2.6.2.8-.1 2.7-1.1 3-2.1.4-1 .4-1.9.3-2.1-.1-.2-.4-.3-.9-.5z"/></svg></a>' +
    '<script defer src="/js/track.js"></script></body></html>';
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
  } catch (e) { console.error('[articles.create]', e.message); res.status(500).json({ error: 'Erreur creation.' }); }
});
app.patch('/api/admin/articles/:id', auth, adminOnly, limitBody(20), async (req, res) => {
  try {
    const doc = await Article.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Article introuvable.' });
    await applyArticleBody(req.body, doc);
    if (req.body.slug && slugify(req.body.slug) !== doc.slug) doc.slug = await uniqueSlug(req.body.slug, doc._id);
    await doc.save();
    res.json({ success: true, article: doc });
  } catch (e) { console.error('[articles.update]', e.message); res.status(500).json({ error: 'Erreur mise a jour.' }); }
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
      Quote.aggregate([{ $group: { _id: '$status', n: { $sum: 1 }, montant: { $sum: '$total' } } }]),
      Task.find({ status: { $in: ['a_faire', 'en_cours', 'en_revue', 'bloque'] } }).sort({ dueDate: 1 }).limit(15).select('title status priority dueDate assignedToName').lean(),
      User.find({ role: { $in: ['admin', 'employee'] }, isActive: true }).select('name role poste department').lean(),
      Article.countDocuments({ status: 'publie' }),
    ]);
    const stageMap = {}; byStage.forEach(s => { stageMap[s._id] = s.n; });
    const quoteMap = {}; quoteByStatus.forEach(s => { quoteMap[s._id] = { nombre: s.n, montant: Math.round(s.montant || 0) }; });
    return {
      date: new Date().toISOString().slice(0, 10),
      prospects: { total: leadCount, par_stade: stageMap, recents: recentLeads.map(l => ({ nom: l.name, entreprise: l.company || '', service: l.service || '', stade: l.stage, tel: l.phone || '', email: l.email, le: new Date(l.createdAt).toISOString().slice(0, 10) })) },
      devis: { par_statut: quoteMap, recents: quotes.map(q => ({ ref: q.reference, client: q.clientName, entreprise: q.clientCompany || '', montant: q.total, devise: q.currency, statut: q.status, valide_jusqu: q.validUntil ? new Date(q.validUntil).toISOString().slice(0, 10) : '' })) },
      taches_ouvertes: openTasks.map(t => ({ titre: t.title, statut: t.status, priorite: t.priority, echeance: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : '', assigne: t.assignedToName || '(non assigné)' })),
      equipe: team.map(u => ({ nom: u.name, role: u.role, poste: u.poste || '', pole: u.department || '' })),
      blog: { articles_publies: articleCount },
    };
  } catch (e) { console.error('[ai.context]', e.message); return { erreur: 'contexte indisponible' }; }
}

const AI_SYSTEM_PROMPTS = {
  redaction: "Tu es l'assistant de rédaction de Pirabel Labs, agence web et marketing digital basée à Abomey-Calavi (Bénin), fondée par Lissanon Gildas (Fondateur & CEO). Tu rédiges en français impeccable (accents sur les majuscules, ç, œ, guillemets « », espaces insécables avant : ; ! ?). Tu écris des e-mails de prospection, réponses clients, propositions, posts réseaux sociaux et contenus selon les consignes. Ton professionnel, chaleureux et orienté résultat. Ne jamais inventer de chiffres ni de références. Ne jamais mentionner d'autre fondateur que Lissanon Gildas.",
  analyse: "Tu es le directeur commercial de Pirabel Labs (agence web/marketing à Abomey-Calavi, Bénin, fondée par Lissanon Gildas). Tu analyses le pipeline commercial réel fourni dans le contexte (prospects, devis, tâches) et donnes des recommandations concrètes, priorisées et actionnables : qui relancer en priorité, quels devis suivre, risques, opportunités, plan de la semaine. Sois direct, chiffré quand les données le permettent, et ne jamais inventer de données absentes du contexte. Français impeccable.",
  equipe: "Tu es le bras droit RH et opérationnel du dirigeant de Pirabel Labs (Lissanon Gildas), agence web/marketing à Abomey-Calavi (Bénin). Tu aides à répartir les tâches entre les employés selon leur pôle et leur charge actuelle, à rédiger des consignes claires, des comptes-rendus et des objectifs. Tu t'appuies sur la liste d'équipe et les tâches ouvertes du contexte. Pragmatique, bienveillant, structuré. Français impeccable.",
  libre: "Tu es l'assistant IA de Pirabel Labs, agence web et marketing digital à Abomey-Calavi (Bénin), fondée par Lissanon Gildas (Fondateur & CEO). Tu réponds à toute question business, marketing, SEO, technique ou stratégique pour aider à développer l'agence. Précis, honnête, jamais d'invention de chiffres. Français impeccable. Tu peux t'appuyer sur les données réelles de l'entreprise fournies dans le contexte.",
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
];

async function executeAssistantTool(name, input, currentUser) {
  try {
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
      const f = {}; if (input.status) f.status = input.status;
      const quotes = await Quote.find(f).sort({ createdAt: -1 }).limit(40).select('reference clientName clientCompany total currency status validUntil').lean();
      return { ok: true, devis: quotes.map(q => ({ ref: q.reference, client: q.clientName, entreprise: q.clientCompany || '', montant: q.total, devise: q.currency, statut: q.status, valide_jusqu: q.validUntil ? new Date(q.validUntil).toISOString().slice(0,10) : null })) };
    }
    if (name === 'creer_brouillon_article') {
      const doc = new Article({ title: sanitize(input.title, 200), excerpt: sanitize(input.excerpt || '', 500), content: sanitizeSoft(input.content || '', 100000),
        category: sanitize(input.category || 'Marketing', 60) || 'Marketing', author: 'Lissanon Gildas', status: 'brouillon' });
      doc.slug = await uniqueSlug(input.title);
      await doc.save();
      return { ok: true, message: `Brouillon créé : « ${doc.title} » (catégorie ${doc.category}). Relis-le dans l'onglet Blog avant publication.`, slug: doc.slug };
    }
    return { ok: false, message: 'Outil inconnu.' };
  } catch (e) { console.error('[ai.tool]', name, e.message); return { ok: false, message: 'Erreur exécution : ' + e.message }; }
}

app.post('/api/admin/assistant', auth, adminOnly, limitBody(80), async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY || await getSetting('groqApiKey');
    if (!apiKey) return res.status(503).json({ error: 'NO_KEY', message: "L'assistant IA n'est pas encore configuré (clé Groq manquante)." });
    const mode = ['redaction', 'analyse', 'equipe', 'libre'].includes(req.body.mode) ? req.body.mode : 'libre';
    const incoming = Array.isArray(req.body.messages) ? req.body.messages : [];
    const history = incoming
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-20)
      .map(m => ({ role: m.role, content: m.content.slice(0, 8000) }));
    if (!history.length || history[history.length - 1].role !== 'user') return res.status(400).json({ error: 'Message utilisateur requis.' });

    const ctx = await gatherBusinessContext();
    const system = AI_SYSTEM_PROMPTS[mode] +
      "\n\nTu n'es pas un simple chatbot : tu peux AGIR. Tu disposes d'outils pour créer et modifier des tâches, consulter prospects/devis/équipe, et créer des brouillons d'articles. " +
      "Quand l'utilisateur demande une action concrète (« crée une tâche », « assigne à… », « prépare un article », « qui dois-je relancer »), UTILISE les outils pour l'exécuter réellement, puis confirme ce que tu as fait. " +
      "N'invente jamais d'identifiants : appelle lister_taches ou lister_equipe pour obtenir les vrais IDs et e-mails. Les articles sont toujours créés en BROUILLON (jamais publiés sans relecture). " +
      "Pour l'envoi d'e-mails à des clients : rédige le texte et propose-le, mais NE l'envoie pas toi-même (l'envoi reste validé manuellement par le dirigeant). " +
      "\n\nQUALITÉ — RÈGLES STRICTES :\n" +
      "- INTERDICTION ABSOLUE des placeholders ou exemples bidons : jamais « Agence XYZ », « Entreprise ABC », « exemple1 », « Lorem ipsum », « [à compléter] », « etc. » à la place de vrai contenu. Si tu cites des marques/concurrents, donne de VRAIS noms ; sinon reformule sans inventer.\n" +
      "- Tu produis du contenu COMPLET et fini, jamais un squelette. Un article de blog fait au minimum 900 mots, structuré (introduction, plusieurs <h2> avec id, <h3>, listes, et un <table> dès qu'une comparaison s'y prête), et se termine par une conclusion + appel à l'action vers Pirabel Labs.\n" +
      "- Pour un RAPPORT ou une analyse : utilise de vrais tableaux Markdown (| col | col |) avec des données réelles tirées du contexte ci-dessous, pas des cases vides.\n" +
      "- Français impeccable : accents sur les majuscules (É, À), ç, œ, guillemets « », espaces insécables avant : ; ! ?. Aucune faute.\n" +
      "- Ne jamais mentionner d'autre fondateur que Lissanon Gildas.\n" +
      "\n\nDONNÉES RÉELLES de Pirabel Labs (instantané) :\n```json\n" + JSON.stringify(ctx) + "\n```\n" +
      "Appuie-toi sur ces données réelles. Réponds en français impeccable, concret et orienté action.";

    const model = process.env.GROQ_MODEL || (await getSetting('groqModel')) || 'llama-3.3-70b-versatile';
    const tools = assistantToolsOpenAI();
    // Format OpenAI/Groq : message système en tête de la conversation
    const convo = [{ role: 'system', content: system }].concat(history);
    const actionsLog = [];
    let finalText = '';
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    // Boucle d'agent : jusqu'à 6 tours d'outils (limite serverless 30s)
    for (let turn = 0; turn < 6; turn++) {
      // Appel Groq avec 1 réessai sur 429 (limite de débit gratuite : 12000 tokens/min)
      let data, r;
      for (let attempt = 0; attempt < 2; attempt++) {
        r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
          body: JSON.stringify({ model, max_tokens: 4000, temperature: 0.55, tools, tool_choice: 'auto', messages: convo }),
        });
        data = await r.json().catch(() => ({}));
        if (r.status === 429 && attempt === 0) {
          const m = JSON.stringify(data).match(/try again in ([0-9.]+)s/);
          const wait = Math.min(8000, Math.round((m ? parseFloat(m[1]) : 4) * 1000) + 400);
          await sleep(wait);
          continue;
        }
        break;
      }
      if (!r.ok) {
        console.error('[ai.api]', r.status, JSON.stringify(data).slice(0, 300));
        if (r.status === 429) return res.status(429).json({ error: 'RATE_LIMIT', message: "Limite gratuite Groq atteinte (12 000 tokens/min). Patiente quelques secondes et réessaie, ou raccourcis ta demande." });
        return res.status(502).json({ error: 'API_ERROR', message: (data && data.error && data.error.message) || 'Erreur API IA.' });
      }
      const msg = (data.choices && data.choices[0] && data.choices[0].message) || {};
      if (msg.content) finalText = String(msg.content).trim();
      const toolCalls = msg.tool_calls || [];
      if (!toolCalls.length) break;
      // Rejouer le message assistant (avec tool_calls) puis exécuter chaque outil côté serveur
      convo.push(msg);
      for (const tc of toolCalls) {
        let input = {};
        try { input = JSON.parse((tc.function && tc.function.arguments) || '{}'); } catch (e) {}
        const result = await executeAssistantTool((tc.function && tc.function.name) || '', input, req.user);
        if (result && result.message) actionsLog.push(result.message);
        convo.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
      }
    }
    res.json({ reply: finalText || '(action effectuée)', actions: actionsLog });
  } catch (e) { console.error('[assistant]', e.message); res.status(500).json({ error: 'Erreur assistant.', message: e.message }); }
});

// Réglages IA (clé Groq, modèle) — admin only. La valeur est stockée en base, jamais relue par le client.
const ALLOWED_SETTINGS = ['groqApiKey', 'groqModel', 'cronSecret'];
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
    res.json({ groqConfigured: !!groq, source: process.env.GROQ_API_KEY ? 'env' : (groq ? 'db' : 'none'), groqModel: process.env.GROQ_MODEL || (await getSetting('groqModel')) || 'llama-3.3-70b-versatile' });
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
    const para = 'font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);margin:0 0 16px;';
    const html = masterTemplate({
      headerType: 'hero', preheader: subject,
      title: 'Bonjour ' + escapeHtml(a.name.split(' ')[0]) + ',',
      body: '<p style="' + para + '">' + escapeHtml(message).replace(/\n\n+/g, '</p><p style="' + para + '">').replace(/\n/g, '<br>') + '</p>',
      cta: 'Visiter pirabellabs.com', ctaUrl: 'https://www.pirabellabs.com',
    });
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
function assistantToolsOpenAI() {
  return ASSISTANT_TOOLS.map(t => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.input_schema } }));
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
  } catch (e) { console.error('[lb.create]', e.message); res.status(500).json({ error: 'Erreur creation.' }); }
});
app.patch('/api/admin/livres-blancs/:id', auth, adminOnly, limitBody(20), async (req, res) => {
  try {
    const doc = await LivreBlanc.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Introuvable.' });
    applyLBBody(req.body, doc);
    if (req.body.slug && slugify(req.body.slug) !== doc.slug) doc.slug = await uniqueSlug(req.body.slug, doc._id);
    await doc.save();
    res.json({ success: true, livreBlanc: doc });
  } catch (e) { console.error('[lb.update]', e.message); res.status(500).json({ error: 'Erreur mise a jour.' }); }
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
    const cardImg = a => '<div class="bx-card__img">' + (a.featuredImage ? '<img src="' + escapeHtml(a.featuredImage) + '" alt="' + escapeHtml(a.imageAlt || a.title) + '" loading="lazy">' : coverSvg(a.title, a.category)) + '</div>';
    const card = a => '<a class="bx-card" href="/blog/' + escapeHtml(a.slug) + '">' + cardImg(a) +
      '<div class="bx-card__b"><span class="bx-cat">' + escapeHtml(a.category || 'Marketing') + '</span>' +
      '<h2>' + escapeHtml(a.title) + '</h2><p>' + escapeHtml(a.excerpt || '') + '</p>' +
      '<div class="bx-card__meta">' + (a.readTime ? '<span class="bx-views"><span class="material-symbols-outlined">schedule</span>' + a.readTime + ' min</span>' : '<span></span>') + '<span class="bx-views"><span class="material-symbols-outlined">visibility</span>' + fmtViews(a.views) + ' vues</span></div></div></a>';
    const cards = arts.length ? arts.map(card).join('') : '<div class="bx-empty">Aucun article ne correspond à votre recherche.</div>';
    // vedette
    const featHtml = (featured && safePage === 1) ?
      '<a class="bx-feat" href="/blog/' + escapeHtml(featured.slug) + '"><div class="bx-feat__img">' +
        (featured.featuredImage ? '<img src="' + escapeHtml(featured.featuredImage) + '" alt="' + escapeHtml(featured.imageAlt || featured.title) + '">' : coverSvg(featured.title, featured.category)) +
        '</div><div class="bx-feat__b"><span class="bx-feat__star"><span class="material-symbols-outlined">local_fire_department</span>Article le plus lu</span>' +
        '<h2>' + escapeHtml(featured.title) + '</h2><p>' + escapeHtml(featured.excerpt || '') + '</p>' +
        '<span class="bx-feat__more">Lire l\'article <span class="material-symbols-outlined">arrow_forward</span></span></div></a>' : '';
    // filtres + recherche
    const pills = '<div class="bx-filters"><a href="/blog"' + (!cat ? ' class="is-active"' : '') + '>Tous</a>' +
      cats.map(c => '<a href="/blog?cat=' + encodeURIComponent(c) + '"' + (cat && cat.toLowerCase() === c.toLowerCase() ? ' class="is-active"' : '') + '>' + escapeHtml(c) + '</a>').join('') + '</div>';
    const search = '<form class="bx-search" action="/blog" method="get">' + (cat ? '<input type="hidden" name="cat" value="' + escapeHtml(cat) + '">' : '') +
      '<input type="search" name="q" value="' + escapeHtml(q) + '" placeholder="Rechercher un article…" aria-label="Rechercher"><button type="submit" aria-label="Rechercher"><span class="material-symbols-outlined">search</span></button></form>';
    const toolbar = '<div class="bx-toolbar">' + pills + search + '</div>';
    const note = isFiltered ? '<p style="text-align:center;color:rgba(229,226,225,0.5);font-size:.9rem;margin:-.4rem 0 1.6rem;">' + total + ' article' + (total > 1 ? 's' : '') + (cat ? ' dans « ' + escapeHtml(cat) + ' »' : '') + (q ? ' pour « ' + escapeHtml(q) + ' »' : '') + ' &middot; <a href="/blog" style="color:#FF5500;">tout afficher</a></p>' : '';
    // pagination (préserve cat + q)
    const qs = p => { const a = []; if (cat) a.push('cat=' + encodeURIComponent(cat)); if (q) a.push('q=' + encodeURIComponent(q)); if (p > 1) a.push('page=' + p); return a.length ? ('?' + a.join('&')) : ''; };
    let pager = '';
    if (totalPages > 1) {
      let nums = '';
      for (let p = 1; p <= totalPages; p++) nums += (p === safePage) ? '<span class="is-active">' + p + '</span>' : '<a href="/blog' + qs(p) + '">' + p + '</a>';
      pager = '<nav class="bx-pager" aria-label="Pagination">' +
        (safePage > 1 ? '<a href="/blog' + qs(safePage - 1) + '">‹ Précédent</a>' : '<span class="is-disabled">‹ Précédent</span>') + nums +
        (safePage < totalPages ? '<a href="/blog' + qs(safePage + 1) + '">Suivant ›</a>' : '<span class="is-disabled">Suivant ›</span>') + '</nav>';
    }
    const canon = SITE() + '/blog' + (safePage > 1 ? '?page=' + safePage : '');
    const head = '<title>Blog Pirabel Labs — Marketing digital, SEO, sites web' + (safePage > 1 ? ' (page ' + safePage + ')' : '') + '</title>' +
      '<meta name="description" content="Conseils marketing digital, SEO, sites web et stratégie pour PME francophones — par Pirabel Labs.">' +
      '<link rel="canonical" href="' + canon + '">' +
      '<meta property="og:title" content="Blog Pirabel Labs"><meta property="og:type" content="website"><meta property="og:url" content="' + SITE() + '/blog">';
    const body = '<main class="bx-wrap"><div class="bx-hero"><h1>Le Blog Pirabel Labs</h1>' +
      '<p>Conseils marketing digital, SEO, sites web et stratégie pour PME francophones.</p></div>' +
      toolbar + note + featHtml + '<div class="bx-grid">' + cards + '</div>' + pager + '</main>';
    res.set('Content-Type', 'text/html; charset=utf-8').send(blogShell(head, body));
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
    if (!a) return res.status(404).send(blogShell('<title>Article introuvable</title>',
      '<main class="bx-wrap"><div class="bx-empty"><h1 style="color:#fff;">404</h1><p>Cet article n\'existe pas ou n\'est plus publié.</p><a class="bx-back" href="/blog">&larr; Retour au blog</a></div></main>'));
    Article.updateOne({ _id: a._id }, { $inc: { views: 1 } }).catch(() => {});
    const metaTitle = escapeHtml(a.seoTitle || a.title);
    const metaDesc = escapeHtml(a.metaDescription || a.excerpt || '');
    const url = SITE() + '/blog/' + encodeURIComponent(a.slug);
    const ogImg = a.featuredImage ? (a.featuredImage.startsWith('http') ? a.featuredImage : SITE() + a.featuredImage) : (SITE() + '/img/og-blog.jpg');
    const head = '<title>' + metaTitle + '</title>' +
      '<meta name="description" content="' + metaDesc + '">' +
      '<link rel="canonical" href="' + url + '">' +
      '<meta name="author" content="' + escapeHtml(a.author || 'Pirabel Labs') + '">' +
      '<meta property="og:title" content="' + metaTitle + '"><meta property="og:description" content="' + metaDesc + '">' +
      '<meta property="og:type" content="article"><meta property="og:url" content="' + url + '"><meta property="og:image" content="' + escapeHtml(ogImg) + '">' +
      '<meta name="twitter:card" content="summary_large_image">' +
      '<script type="application/ld+json">' + JSON.stringify({
        '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.title,
        description: a.metaDescription || a.excerpt || '', image: ogImg, datePublished: a.publishedAt,
        dateModified: a.updatedAt, author: { '@type': 'Person', name: a.author || 'Lissanon Gildas' },
        publisher: { '@type': 'Organization', name: 'Pirabel Labs' }, mainEntityOfPage: url,
      }) + '</script>';
    const authorName = escapeHtml(a.author || 'Lissanon Gildas');
    const catLabel = escapeHtml(a.category || 'Marketing');
    // Sommaire auto : injecte des id sur les H2 et collecte le sommaire
    const toc = [];
    const contentHtml = (a.content || ('<p>' + escapeHtml(a.excerpt || '') + '</p>')).replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (m, attrs, inner) => {
      attrs = attrs || '';
      const idm = attrs.match(/id="([^"]+)"/);
      let id = idm ? idm[1] : '';
      const txt = inner.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
      if (!id) { id = (txt.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48)) || ('s' + toc.length); attrs += ' id="' + id + '"'; }
      toc.push({ id, txt });
      return '<h2' + attrs + '>' + inner + '</h2>';
    });
    // Couverture : image fournie, sinon couverture SVG générée (légère, sur-mesure)
    const cover = a.featuredImage
      ? '<img class="bx-heroimg" src="' + escapeHtml(a.featuredImage) + '" alt="' + escapeHtml(a.imageAlt || a.title) + '">'
      : '<div class="bx-cover">' + coverSvg(a.title, a.category) + '</div>';
    const authorCard = (a.content || '').includes('art-author') ? '' :
      '<aside class="art-author"><div class="art-author__avatar">LG</div><div><div class="art-author__label">Article rédigé par</div><div class="art-author__name">' + authorName + '</div><div class="art-author__role">Fondateur &amp; CEO, Pirabel Labs</div><p class="art-author__bio">Expert produit et stratégie digitale, passionné par la croissance des PME francophones grâce au web, au SEO et à l\'IA.</p></div></aside>';
    const tocHtml = toc.length >= 2 ? '<nav class="bx-toc"><strong>Sommaire</strong>' + toc.map(t => '<a href="#' + t.id + '">' + escapeHtml(t.txt) + '</a>').join('') + '</nav>' : '';
    const side = '<aside class="bx-side">' + tocHtml +
      '<div class="bx-side__author"><div class="art-author__avatar" style="width:46px;height:46px;font-size:1rem;">LG</div><div><div style="font-weight:700;color:#fff;font-size:.92rem;">' + authorName + '</div><div style="color:#FF5500;font-size:.78rem;">Fondateur &amp; CEO, Pirabel Labs</div></div></div>' +
      '<div class="bx-side__cta"><div style="font-family:Space Grotesk,sans-serif;font-weight:700;color:#fff;font-size:.98rem;">Un projet digital&nbsp;?</div><div style="color:rgba(229,226,225,0.6);font-size:.82rem;margin:.3rem 0 0;">Audit gratuit, réponse sous 24&nbsp;h.</div><a href="/contact">Demander un audit</a></div>' +
      '</aside>';
    // Articles similaires : même catégorie en priorité, complété par les plus récents
    const related = await Article.find({ status: 'publie', _id: { $ne: a._id }, category: a.category }).sort({ views: -1, publishedAt: -1 }).limit(3).lean();
    if (related.length < 3) {
      const have = related.map(r => r._id).concat(a._id);
      const extra = await Article.find({ status: 'publie', _id: { $nin: have } }).sort({ publishedAt: -1 }).limit(3 - related.length).lean();
      related.push(...extra);
    }
    const relCard = r => '<a class="bx-card" href="/blog/' + escapeHtml(r.slug) + '"><div class="bx-card__img">' + (r.featuredImage ? '<img src="' + escapeHtml(r.featuredImage) + '" alt="' + escapeHtml(r.imageAlt || r.title) + '" loading="lazy">' : coverSvg(r.title, r.category)) + '</div><div class="bx-card__b"><span class="bx-cat">' + escapeHtml(r.category || 'Marketing') + '</span><h2>' + escapeHtml(r.title) + '</h2></div></a>';
    const relatedHtml = related.length ? '<section class="bx-related"><h2>Articles similaires</h2><div class="bx-related__grid">' + related.map(relCard).join('') + '</div></section>' : '';
    const body = '<main class="bx-wrap"><div class="bx-layout"><article class="bx-article">' +
      (a.status !== 'publie' ? '<div style="background:#fbbf24;color:#190800;padding:.6rem 1rem;border-radius:8px;margin-bottom:1.2rem;font-weight:700;">⚠ APERÇU — brouillon non publié (visible uniquement par vous, admin connecté)</div>' : '') +
      '<a class="bx-back" href="/blog"><span class="material-symbols-outlined">arrow_back</span> Retour au blog</a>' +
      '<span class="bx-cat">' + catLabel + '</span>' +
      '<h1>' + escapeHtml(a.title) + '</h1>' +
      '<div class="bx-meta">Par ' + authorName + ' &middot; ' + fmtFr(a.publishedAt || a.createdAt) + (a.readTime ? ' &middot; <span class="bx-views"><span class="material-symbols-outlined">schedule</span>' + a.readTime + ' min de lecture</span>' : '') + ' &middot; <span class="bx-views"><span class="material-symbols-outlined">visibility</span>' + fmtViews(a.views) + ' vues</span></div>' +
      cover +
      '<div class="bx-content">' + contentHtml + '</div>' +
      authorCard +
      '<div class="bx-cta"><div style="font-family:Space Grotesk,sans-serif;font-weight:700;font-size:1.2rem;color:#fff;">Un projet en tête ?</div>' +
      '<a href="/contact">Parler au fondateur</a></div>' +
      relatedHtml +
      '<section class="bx-comments"><h2 id="cmTitle">Commentaires</h2>' +
      '<div id="cmList" class="bx-cmlist"><p style="color:rgba(229,226,225,0.45);">Chargement…</p></div>' +
      '<form id="cmForm" class="bx-cmform"><h3>Laisser un commentaire</h3>' +
      '<p class="bx-cmnote">Votre commentaire sera publié après modération. L\'email n\'est jamais affiché.</p>' +
      '<input name="author" placeholder="Votre nom *" required maxlength="80">' +
      '<input name="email" type="email" placeholder="Email (non publié, optionnel)" maxlength="200">' +
      '<textarea name="content" rows="4" placeholder="Votre commentaire *" required maxlength="3000"></textarea>' +
      '<input name="cm_check_hp" tabindex="-1" autocomplete="off" readonly aria-hidden="true" class="bx-hp" style="display:none;">' +
      '<div id="cmMsg" class="bx-cmmsg"></div>' +
      '<button type="submit" class="bx-cmbtn">Publier mon commentaire</button></form></section>' +
      '</article>' + side + '</div></main><script src="/js/comments.js" defer></script>';
    res.set('Content-Type', 'text/html; charset=utf-8').send(blogShell(head, body));
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
  if (body.metric1Value != null) doc.metric1Value = sanitize(body.metric1Value, 40);
  if (body.metric1Label != null) doc.metric1Label = sanitize(body.metric1Label, 60);
  if (body.metric2Value != null) doc.metric2Value = sanitize(body.metric2Value, 40);
  if (body.metric2Label != null) doc.metric2Label = sanitize(body.metric2Label, 60);
  if (body.seoTitle != null) doc.seoTitle = sanitize(body.seoTitle, 200);
  if (body.metaDescription != null) doc.metaDescription = sanitize(body.metaDescription, 320);
  if (body.status != null && ['brouillon', 'publie'].includes(body.status)) doc.status = body.status;
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
  } catch (e) { console.error('[cases.create]', e.message); res.status(500).json({ error: 'Erreur creation.' }); }
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
  return '<svg viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + escapeHtml(c.title || '') + '">' +
    '<defs><linearGradient id="rzg' + i + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[1] + '"/></linearGradient></defs>' +
    '<rect width="640" height="400" fill="#0e0d0d"/><rect width="640" height="400" fill="url(#rzg' + i + ')" opacity="0.20"/>' +
    '<circle cx="540" cy="70" r="170" fill="' + pal[0] + '" opacity="0.10"/><circle cx="90" cy="360" r="120" fill="' + pal[0] + '" opacity="0.07"/>' +
    '<text x="44" y="250" font-family="Montserrat,Arial,sans-serif" font-weight="900" font-size="185" fill="#ffffff" opacity="0.13">' + escapeHtml(mono) + '</text>' +
    '<text x="48" y="330" font-family="Space Grotesk,Arial,sans-serif" font-weight="700" font-size="21" letter-spacing="3" fill="#ffffff" opacity="0.82">' + tag + '</text>' +
    '<text x="596" y="366" text-anchor="end" font-family="Space Grotesk,Arial,sans-serif" font-weight="700" font-size="16" fill="#FF5500">Pirabel Labs</text></svg>';
}
app.get('/realisations', async (req, res) => {
  try {
    const cs = await CaseStudy.find({ status: 'publie' }).sort({ publishedAt: -1 }).limit(60).lean();
    const cards = cs.length ? cs.map((c, i) => {
      const img = c.featuredImage
        ? '<img src="' + escapeHtml(pubImg(c.featuredImage)) + '" alt="' + escapeHtml(c.imageAlt || c.title) + '" loading="lazy">'
        : casePlaceholder(c, i);
      const pill = (v, l) => v ? '<span class="rz-pill"><strong>' + escapeHtml(v) + '</strong>' + (l ? ' ' + escapeHtml(l) : '') + '</span>' : '';
      const metrics = (c.metric1Value || c.metric2Value) ? '<div class="rz-pills">' + pill(c.metric1Value, c.metric1Label) + pill(c.metric2Value, c.metric2Label) + '</div>' : '';
      const sub = escapeHtml([c.sector, c.location].filter(Boolean).join(' · '));
      return '<a class="rz-card" style="animation-delay:' + ((i % 9) * 70) + 'ms" href="/realisations/' + escapeHtml(c.slug) + '">' +
        '<div class="rz-card__img">' + img + '<span class="rz-card__eye"><span class="material-symbols-outlined">arrow_outward</span></span></div>' +
        '<div class="rz-card__b">' + (sub ? '<span class="rz-cat">' + sub + '</span>' : '') +
        '<h3>' + escapeHtml(c.title) + '</h3><p>' + escapeHtml(c.excerpt || '') + '</p>' + metrics +
        '<span class="rz-more">Voir l\'étude de cas <span class="material-symbols-outlined">arrow_forward</span></span></div></a>';
    }).join('') : '<div class="bx-empty">Études de cas à venir.</div>';

    const head = '<title>Réalisations & études de cas — Pirabel Labs</title>' +
      '<meta name="description" content="Nos réalisations : sites web, boutiques en ligne, plateformes SaaS, applications IA et SEO — des produits livrés et en production, au Bénin, en Afrique et en Europe.">' +
      '<link rel="canonical" href="' + SITE() + '/realisations">' +
      '<meta property="og:title" content="Réalisations & études de cas — Pirabel Labs"><meta property="og:type" content="website"><meta property="og:url" content="' + SITE() + '/realisations"><meta property="og:image" content="' + SITE() + '/img/og-blog.jpg">' +
      '<style>' +
      'html{scroll-behavior:smooth;}#projets{scroll-margin-top:5rem;}' +
      '.rz-wrap{max-width:78rem;margin:0 auto;padding:0 clamp(1.25rem,4vw,3rem) 4rem;}' +
      '.rz-hero{text-align:center;max-width:52rem;margin:0 auto;padding:clamp(2.5rem,6vw,4.5rem) 0 2.6rem;}' +
      '.rz-eyebrow{display:inline-flex;align-items:center;gap:.45rem;color:#FF5500;font-weight:700;font-size:.74rem;letter-spacing:.16em;text-transform:uppercase;border:1px solid rgba(255,85,0,.3);background:rgba(255,85,0,.07);padding:.42rem .95rem;border-radius:999px;margin-bottom:1.4rem;}' +
      '.rz-hero h1{font-family:"Montserrat",sans-serif;font-weight:900;font-size:clamp(2.2rem,6vw,4rem);line-height:1.03;letter-spacing:-.04em;margin:0 0 1.1rem;color:#fff;}' +
      '.rz-hero h1 em{font-style:normal;color:#FF5500;}' +
      '.rz-lead{color:rgba(229,226,225,.72);font-size:clamp(1rem,2vw,1.18rem);line-height:1.65;max-width:44rem;margin:0 auto 1.9rem;}' +
      '.rz-lead strong{color:#fff;font-weight:600;}' +
      '.rz-ctas{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;}' +
      '.rz-btn{display:inline-flex;align-items:center;gap:.5rem;font-weight:700;font-size:.95rem;padding:.85rem 1.7rem;border-radius:999px;text-decoration:none;transition:transform .15s,box-shadow .2s,background .2s,border-color .2s,color .2s;}' +
      '.rz-btn .material-symbols-outlined{font-size:1.15rem;transition:transform .2s;}' +
      '.rz-btn:hover .material-symbols-outlined{transform:translateX(4px);}' +
      '.rz-btn--p{background:#FF5500;color:#190800;box-shadow:0 10px 32px rgba(255,85,0,.28);}' +
      '.rz-btn--p:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(255,85,0,.45);}' +
      '.rz-btn--g{background:transparent;color:#e5e2e1;border:1px solid rgba(229,226,225,.22);}' +
      '.rz-btn--g:hover{border-color:#FF5500;color:#fff;}' +
      '.rz-stats{display:flex;flex-wrap:wrap;justify-content:center;gap:1.4rem 2.6rem;margin:2.7rem auto 0;padding-top:2rem;border-top:1px solid rgba(229,226,225,.1);max-width:46rem;}' +
      '.rz-stat b{display:block;font-family:"Montserrat",sans-serif;font-weight:900;font-size:1.8rem;color:#fff;line-height:1;}' +
      '.rz-stat span{color:rgba(229,226,225,.55);font-size:.82rem;}' +
      '.rz-two{display:grid;grid-template-columns:1fr 1fr;gap:clamp(1.5rem,4vw,3.5rem);align-items:center;margin:clamp(3rem,7vw,5.5rem) 0;}' +
      '.rz-kick{color:#FF5500;font-weight:700;font-size:.76rem;letter-spacing:.15em;text-transform:uppercase;}' +
      '.rz-two__t h2{font-family:"Montserrat",sans-serif;font-weight:800;font-size:clamp(1.6rem,3.5vw,2.4rem);line-height:1.12;color:#fff;margin:.6rem 0 1rem;letter-spacing:-.02em;}' +
      '.rz-two__t p{color:rgba(229,226,225,.68);font-size:1.02rem;line-height:1.7;margin:0 0 1rem;}' +
      '.rz-deliver{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;}' +
      '.rz-deliver div{background:#141313;border:1px solid rgba(229,226,225,.1);border-radius:14px;padding:1.1rem;transition:border-color .2s,transform .2s;}' +
      '.rz-deliver div:hover{border-color:#FF5500;transform:translateY(-3px);}' +
      '.rz-deliver .material-symbols-outlined{color:#FF5500;font-size:1.55rem;}' +
      '.rz-deliver b{display:block;color:#fff;font-size:.98rem;margin:.4rem 0 .2rem;}' +
      '.rz-deliver small{color:rgba(229,226,225,.55);font-size:.82rem;line-height:1.4;}' +
      '.rz-head{text-align:center;max-width:42rem;margin:0 auto 2.4rem;}' +
      '.rz-head h2{font-family:"Montserrat",sans-serif;font-weight:800;font-size:clamp(1.7rem,4vw,2.6rem);color:#fff;margin:0 0 .6rem;letter-spacing:-.025em;}' +
      '.rz-head p{color:rgba(229,226,225,.6);font-size:1rem;line-height:1.6;margin:0;}' +
      '.rz-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,20.5rem),1fr));gap:1.6rem;}' +
      '.rz-card{position:relative;background:#151414;border:1px solid rgba(229,226,225,.1);border-radius:18px;overflow:hidden;text-decoration:none;color:#e5e2e1;display:flex;flex-direction:column;transition:transform .25s cubic-bezier(.2,.7,.3,1),border-color .25s,box-shadow .25s;opacity:0;transform:translateY(18px);animation:rzUp .55s forwards;}' +
      '@keyframes rzUp{to{opacity:1;transform:translateY(0);}}' +
      '.rz-card:hover{transform:translateY(-8px);border-color:rgba(255,85,0,.55);box-shadow:0 22px 50px rgba(0,0,0,.5),0 0 0 1px rgba(255,85,0,.22);}' +
      '.rz-card__img{position:relative;aspect-ratio:16/10;overflow:hidden;background:#0e0e0e;}' +
      '.rz-card__img img,.rz-card__img svg{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s cubic-bezier(.2,.7,.3,1);}' +
      '.rz-card:hover .rz-card__img img,.rz-card:hover .rz-card__img svg{transform:scale(1.07);}' +
      '.rz-card__img::after{content:"";position:absolute;inset:0;background:linear-gradient(to top,rgba(21,20,20,.85),transparent 55%);pointer-events:none;}' +
      '.rz-card__eye{position:absolute;top:.8rem;right:.8rem;z-index:2;width:2.2rem;height:2.2rem;border-radius:50%;background:#FF5500;color:#190800;display:flex;align-items:center;justify-content:center;opacity:0;transform:translateY(-6px);transition:.25s;}' +
      '.rz-card:hover .rz-card__eye{opacity:1;transform:translateY(0);}' +
      '.rz-card__eye .material-symbols-outlined{font-size:1.2rem;}' +
      '.rz-card__b{padding:1.2rem 1.3rem 1.4rem;display:flex;flex-direction:column;flex:1;}' +
      '.rz-cat{color:#FF5500;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.09em;line-height:1.45;}' +
      '.rz-card h3{font-family:"Space Grotesk",sans-serif;font-size:1.18rem;line-height:1.25;color:#fff;margin:.5rem 0;}' +
      '.rz-card p{color:rgba(229,226,225,.6);font-size:.9rem;line-height:1.55;margin:0 0 .95rem;flex:1;}' +
      '.rz-pills{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem;}' +
      '.rz-pill{font-size:.75rem;color:rgba(229,226,225,.62);background:#0e0e0e;border:1px solid rgba(229,226,225,.1);border-radius:999px;padding:.35rem .7rem;}' +
      '.rz-pill strong{color:#FF5500;font-weight:700;}' +
      '.rz-more{display:inline-flex;align-items:center;gap:.35rem;color:#fff;font-weight:700;font-size:.85rem;margin-top:auto;}' +
      '.rz-more .material-symbols-outlined{font-size:1.05rem;color:#FF5500;transition:transform .25s;}' +
      '.rz-card:hover .rz-more .material-symbols-outlined{transform:translateX(5px);}' +
      '.rz-steps{display:flex;flex-direction:column;gap:.9rem;}' +
      '.rz-step{display:flex;gap:1rem;align-items:flex-start;background:#141313;border:1px solid rgba(229,226,225,.1);border-radius:14px;padding:1.1rem 1.2rem;transition:border-color .2s,transform .2s;}' +
      '.rz-step:hover{border-color:#FF5500;transform:translateX(4px);}' +
      '.rz-step .n{font-family:"Montserrat",sans-serif;font-weight:900;font-size:1.35rem;color:#FF5500;line-height:1;min-width:2rem;}' +
      '.rz-step .t{display:block;color:#fff;font-size:1rem;margin-bottom:.2rem;font-weight:700;}' +
      '.rz-step small{color:rgba(229,226,225,.6);font-size:.88rem;line-height:1.5;}' +
      '.rz-final{text-align:center;background:linear-gradient(135deg,rgba(255,85,0,.16),#151414);border:1px solid rgba(255,85,0,.3);border-radius:22px;padding:clamp(2.4rem,5vw,3.6rem);margin:clamp(3rem,6vw,5rem) 0 0;}' +
      '.rz-final h2{font-family:"Montserrat",sans-serif;font-weight:900;font-size:clamp(1.7rem,4vw,2.6rem);color:#fff;margin:0 0 .8rem;letter-spacing:-.025em;}' +
      '.rz-final p{color:rgba(229,226,225,.72);font-size:1.05rem;line-height:1.6;max-width:38rem;margin:0 auto 1.6rem;}' +
      '@media(max-width:820px){.rz-two{grid-template-columns:1fr;}}' +
      '@media(max-width:520px){.rz-deliver{grid-template-columns:1fr;}.rz-stats{gap:1.2rem 1.8rem;}.rz-stat b{font-size:1.5rem;}}' +
      '@media(prefers-reduced-motion:reduce){.rz-card{animation:none;opacity:1;transform:none;}html{scroll-behavior:auto;}}' +
      '</style>';

    const body = '<main class="rz-wrap">' +
      '<section class="rz-hero">' +
        '<span class="rz-eyebrow"><span class="material-symbols-outlined" style="font-size:1rem;">workspace_premium</span> Portfolio · Études de cas</span>' +
        '<h1>Des produits web qui <em>travaillent</em> vraiment</h1>' +
        '<p class="rz-lead">Sites vitrines, boutiques en ligne, plateformes SaaS, applications métier, agents IA… Voici des projets <strong>livrés et en production</strong>, conçus sur mesure pour des clients au Bénin, en Afrique et en Europe.</p>' +
        '<div class="rz-ctas"><a class="rz-btn rz-btn--p" href="/contact#rdv">Démarrer mon projet <span class="material-symbols-outlined">arrow_forward</span></a><a class="rz-btn rz-btn--g" href="#projets">Voir les projets</a></div>' +
        '<div class="rz-stats">' +
          '<div class="rz-stat"><b>' + cs.length + '</b><span>projets livrés</span></div>' +
          '<div class="rz-stat"><b>3</b><span>continents</span></div>' +
          '<div class="rz-stat"><b>100%</b><span>sur mesure</span></div>' +
          '<div class="rz-stat"><b>24/7</b><span>support & suivi</span></div>' +
        '</div>' +
      '</section>' +

      '<section class="rz-two">' +
        '<div class="rz-two__t"><span class="rz-kick">Notre savoir-faire</span>' +
          '<h2>Un partenaire technique, du premier croquis à la mise en production</h2>' +
          '<p>Nous ne livrons pas des maquettes : nous concevons, développons et déployons des produits complets, pensés pour convertir et pour durer. Chaque projet est optimisé pour la vitesse, le référencement et les usages locaux — Mobile Money, multidevise, multilingue.</p>' +
          '<p>Une seule équipe, un seul interlocuteur, une exécution de bout en bout.</p></div>' +
        '<div class="rz-deliver">' +
          '<div><span class="material-symbols-outlined">language</span><b>Sites vitrines</b><small>Rapides, élégants, optimisés SEO.</small></div>' +
          '<div><span class="material-symbols-outlined">shopping_bag</span><b>E-commerce</b><small>Boutiques avec paiement local.</small></div>' +
          '<div><span class="material-symbols-outlined">dashboard</span><b>Plateformes SaaS</b><small>Produits web à abonnement.</small></div>' +
          '<div><span class="material-symbols-outlined">smart_toy</span><b>IA & agents</b><small>Assistants et agents vocaux.</small></div>' +
          '<div><span class="material-symbols-outlined">build</span><b>Applications métier</b><small>Outils de gestion sur mesure.</small></div>' +
          '<div><span class="material-symbols-outlined">trending_up</span><b>SEO & acquisition</b><small>Référencement et conversion.</small></div>' +
        '</div>' +
      '</section>' +

      '<section id="projets">' +
        '<div class="rz-head"><h2>Études de cas</h2><p>Chaque projet, avec sa problématique, notre solution et la stack technique employée. Cliquez pour lire l\'étude complète.</p></div>' +
        '<div class="rz-grid">' + cards + '</div>' +
      '</section>' +

      '<section class="rz-two">' +
        '<div class="rz-steps">' +
          '<div class="rz-step"><span class="n">01</span><div><span class="t">Audit & cadrage</span><small>On comprend votre marché, vos objectifs et vos utilisateurs avant d\'écrire la moindre ligne de code.</small></div></div>' +
          '<div class="rz-step"><span class="n">02</span><div><span class="t">Conception & design</span><small>Maquettes, parcours et identité : un produit clair, crédible et orienté conversion.</small></div></div>' +
          '<div class="rz-step"><span class="n">03</span><div><span class="t">Développement</span><small>Un code moderne, rapide et évolutif, testé et pensé pour le référencement.</small></div></div>' +
          '<div class="rz-step"><span class="n">04</span><div><span class="t">Lancement & suivi</span><small>Mise en ligne, mesure des résultats et accompagnement dans la durée.</small></div></div>' +
        '</div>' +
        '<div class="rz-two__t"><span class="rz-kick">Notre méthode</span>' +
          '<h2>Une exécution carrée, à chaque étape</h2>' +
          '<p>De l\'idée au produit en ligne, nous suivons un processus éprouvé qui limite les mauvaises surprises et maximise l\'impact. Vous savez toujours où en est votre projet.</p>' +
          '<a class="rz-btn rz-btn--g" href="/contact#rdv">Discuter de votre projet <span class="material-symbols-outlined">arrow_forward</span></a></div>' +
      '</section>' +

      '<section class="rz-final">' +
        '<h2>Votre projet mérite la même exigence</h2>' +
        '<p>Parlez directement au fondateur. On étudie votre besoin et on vous dit, franchement, ce qui est faisable — et comment.</p>' +
        '<a class="rz-btn rz-btn--p" href="/contact#rdv">Parler au fondateur <span class="material-symbols-outlined">arrow_forward</span></a>' +
      '</section>' +
      '</main>';
    res.set('Content-Type', 'text/html; charset=utf-8').send(blogShell(head, body));
  } catch (e) { console.error('[realisations]', e.message); res.status(500).send('Erreur'); }
});
app.get('/realisations/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').toLowerCase().slice(0, 100);
    const c = await CaseStudy.findOne({ slug, status: 'publie' }).lean();
    if (!c) return res.status(404).send(blogShell('<title>Réalisation introuvable</title>', '<main class="bx-wrap"><div class="bx-empty"><h1 style="color:#fff;">404</h1><p>Cette réalisation n\'existe pas.</p><a class="bx-back" href="/realisations">&larr; Toutes les réalisations</a></div></main>'));
    const metaTitle = escapeHtml(c.seoTitle || c.title);
    const metaDesc = escapeHtml(c.metaDescription || c.excerpt || '');
    const url = SITE() + '/realisations/' + encodeURIComponent(c.slug);
    const ogImg = c.featuredImage ? (c.featuredImage.startsWith('http') ? c.featuredImage : SITE() + pubImg(c.featuredImage)) : (SITE() + '/img/og-blog.jpg');
    const sub = [c.sector, c.location].filter(Boolean).join(' · ');
    const csStyle = '<style>' +
      '.cs-page .bx-meta{font-size:1.18rem;color:rgba(229,226,225,.78);line-height:1.65;margin:.2rem 0 2.4rem;}' +
      '.cs-metrics{display:flex;gap:1rem;flex-wrap:wrap;margin:0 0 2.8rem;}' +
      '.cs-metric{flex:1;min-width:13rem;background:linear-gradient(135deg,rgba(255,85,0,.10),rgba(255,85,0,.02));border:1px solid rgba(255,85,0,.28);border-radius:16px;padding:1.35rem 1.6rem;}' +
      '.cs-metric__num{font-family:"Space Grotesk",sans-serif;font-weight:800;font-size:2rem;color:#FF5500;line-height:1;}' +
      '.cs-metric__label{color:rgba(229,226,225,.72);font-size:.9rem;margin-top:.45rem;line-height:1.45;}' +
      '.cs-page .cs-intro{font-size:1.2rem;line-height:1.72;color:#fff;font-weight:500;border-left:3px solid #FF5500;padding-left:1.25rem;margin:0 0 2.6rem;}' +
      '.cs-page .bx-content h2{font-family:"Space Grotesk",sans-serif;font-size:1.5rem;color:#fff;margin:2.8rem 0 1.1rem;display:flex;align-items:center;gap:.65rem;}' +
      '.cs-page .bx-content h2::before{content:"";width:.5rem;height:1.35rem;background:#FF5500;border-radius:3px;flex-shrink:0;}' +
      '.cs-page .bx-content>p{color:rgba(229,226,225,.82);line-height:1.78;margin:0 0 1rem;font-size:1.02rem;}' +
      '.cs-page .bx-content ul{list-style:none;padding:0;margin:.5rem 0 1.2rem;display:grid;gap:.65rem;}' +
      '.cs-page .bx-content .cs-stack{grid-template-columns:repeat(auto-fill,minmax(16rem,1fr));}' +
      '.cs-page .bx-content li{position:relative;padding:.9rem 1.1rem .9rem 2.55rem;background:#141313;border:1px solid rgba(229,226,225,.1);border-radius:12px;line-height:1.55;color:rgba(229,226,225,.85);}' +
      '.cs-page .bx-content li::before{content:"\\2713";position:absolute;left:.9rem;top:.85rem;color:#FF5500;font-weight:800;}' +
      '.cs-page .bx-content li strong{color:#fff;font-weight:700;}' +
      '</style>';
    const head = '<title>' + metaTitle + '</title><meta name="description" content="' + metaDesc + '">' +
      '<link rel="canonical" href="' + url + '">' +
      '<meta property="og:title" content="' + metaTitle + '"><meta property="og:description" content="' + metaDesc + '"><meta property="og:type" content="article"><meta property="og:url" content="' + url + '"><meta property="og:image" content="' + escapeHtml(ogImg) + '"><meta name="twitter:card" content="summary_large_image">' + csStyle;
    const hero = c.featuredImage ? '<img class="bx-heroimg" src="' + escapeHtml(pubImg(c.featuredImage)) + '" alt="' + escapeHtml(c.imageAlt || c.title) + '">' : '';
    const mb = (v, l) => v ? '<div class="cs-metric"><div class="cs-metric__num">' + escapeHtml(v) + '</div><div class="cs-metric__label">' + escapeHtml(l) + '</div></div>' : '';
    const metrics = (c.metric1Value || c.metric2Value) ? '<div class="cs-metrics">' + mb(c.metric1Value, c.metric1Label) + mb(c.metric2Value, c.metric2Label) + '</div>' : '';
    // Met en valeur la liste de la stack technique (grille de puces)
    const contentHtml = String(c.content || '').replace(/(<h2>[^<]*[Ss]tack[^<]*<\/h2>\s*)<ul>/, '$1<ul class="cs-stack">');
    const body = '<main class="bx-wrap"><article class="bx-article cs-page">' +
      '<a class="bx-back" href="/realisations"><span class="material-symbols-outlined">arrow_back</span> Toutes les réalisations</a>' +
      (sub ? '<span class="bx-cat">' + escapeHtml(sub) + '</span>' : '') +
      '<h1>' + escapeHtml(c.title) + '</h1>' +
      (c.excerpt ? '<div class="bx-meta">' + escapeHtml(c.excerpt) + '</div>' : '') +
      hero + metrics +
      '<div class="bx-content">' + contentHtml + '</div>' +
      '<div class="bx-cta"><div style="font-family:Space Grotesk,sans-serif;font-weight:700;font-size:1.2rem;color:#fff;">Un projet similaire ?</div><a href="/contact">Parler au fondateur</a></div>' +
      '</article></main>';
    res.set('Content-Type', 'text/html; charset=utf-8').send(blogShell(head, body));
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
  } catch (e) { console.error('[reviews.create-link]', e.message); res.status(500).json({ error: 'Erreur creation du lien.' }); }
});

// --- PUBLIC : page temoignages (avis publies, apres moderation) ---
app.get('/temoignages', async (req, res) => {
  try {
    const reviews = await Review.find({ publishedOnSite: true }).sort({ rating: -1, publishedAt: -1 }).limit(80).lean();
    const cards = reviews.length ? reviews.map(r => {
      const stars = '&#9733;'.repeat(Math.max(1, Math.min(5, r.rating || 5))) + '<span style="color:rgba(229,226,225,0.2);">' + '&#9733;'.repeat(5 - Math.max(1, Math.min(5, r.rating || 5))) + '</span>';
      const sub = [r.clientRole, r.clientCompany, r.clientCity].filter(Boolean).join(' · ');
      return '<div class="bx-card" style="cursor:default;"><div class="bx-card__b">' +
        '<div style="color:#FF5500;font-size:1.15rem;margin-bottom:.6rem;">' + stars + '</div>' +
        '<p style="color:#e5e2e1;font-style:italic;line-height:1.6;margin:0 0 1rem;">&laquo;&nbsp;' + escapeHtml(r.comment) + '&nbsp;&raquo;</p>' +
        '<div style="font-family:Space Grotesk,sans-serif;font-weight:700;color:#fff;">' + escapeHtml(r.clientName) + '</div>' +
        (sub || r.serviceUsed ? '<div style="color:rgba(229,226,225,0.5);font-size:.82rem;">' + escapeHtml(sub) + (r.serviceUsed ? (sub ? ' — ' : '') + escapeHtml(r.serviceUsed) : '') + '</div>' : '') +
        '</div></div>';
    }).join('') : '<div class="bx-empty">Les premiers avis clients arrivent bientôt.</div>';
    const head = '<title>Avis clients — Pirabel Labs</title>' +
      '<meta name="description" content="Ce que disent nos clients : avis vérifiés sur les services de Pirabel Labs.">' +
      '<link rel="canonical" href="' + SITE() + '/temoignages"><meta property="og:title" content="Avis clients — Pirabel Labs"><meta property="og:type" content="website"><meta property="og:url" content="' + SITE() + '/temoignages">';
    const body = '<main class="bx-wrap"><div class="bx-hero"><h1>Ils nous font confiance</h1><p>Les avis de nos clients sur leur collaboration avec Pirabel Labs.</p></div><div class="bx-grid">' + cards + '</div></main>';
    res.set('Content-Type', 'text/html; charset=utf-8').send(blogShell(head, body));
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
    sendEmail(process.env.CONTACT_EMAIL || 'contact@pirabellabs.com', '[Blog] Nouveau commentaire à modérer — ' + article.title,
      masterTemplate({ title: 'Nouveau commentaire', subtitle: article.title, body: '<p style="font-size:15px;color:rgba(229,226,225,0.8);"><strong>' + escapeHtml(author) + '</strong> a écrit&nbsp;:</p><div style="border-left:3px solid #FF5500;padding:12px 16px;background:#0e0e0e;color:rgba(229,226,225,0.7);">' + escapeHtml(content) + '</div>', cta: "Modérer dans l'admin", ctaUrl: SITE() + '/admin/dashboard' })).catch(() => {});
    res.json({ success: true, message: 'Merci ! Votre commentaire sera publié après modération.' });
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
    const root = path.join(__dirname, '..');
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
        body: `<p>Nous avons bien recu votre acceptation du devis <strong>${escapeHtml(quote.reference)}</strong> pour ${escapeHtml(quote.title)}.</p><p>Lissanon Gildas vous contactera sous 24h pour planifier le kick-off.</p><p>A tres vite,<br><strong>L'equipe Pirabel Labs</strong></p>`,
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
      subtitle: 'Votre avis compte énormément',
      body: '<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.85);">Après notre collaboration, nous aimerions beaucoup avoir votre retour honnête sur notre travail.</p>' +
        '<p style="font-size:15px;line-height:1.7;color:rgba(229,226,225,0.7);">Cela nous prend <strong style="color:#e5e2e1;">2 minutes</strong> et nous aide énormément à progresser et à rassurer les prochains clients qui hésitent.</p>' +
        '<p style="font-size:14px;color:rgba(229,226,225,0.5);">Merci infiniment,<br><strong style="color:#e5e2e1;">L&apos;équipe Pirabel Labs</strong></p>',
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
    note: !key ? 'RESEND_API_KEY manquante : aucun email ne peut partir. Ajoutez-la dans Vercel > Settings > Environment Variables.' : 'Cle presente. Si les emails ne partent pas, verifiez que FROM_EMAIL est sur un domaine verifie chez Resend.'
  });
});

// POST : envoie un email de test et renvoie la reponse REELLE de Resend (diagnostic)
app.post('/api/admin/test-email', auth, adminOnly, limitBody(5), async (req, res) => {
  try {
    const to = sanitizeEmail(req.body.to) || (req.user && req.user.email);
    if (!isValidEmail(to)) return res.status(400).json({ error: 'Adresse de test invalide.' });

    const key = (process.env.RESEND_API_KEY || '').trim();
    if (!key) {
      return res.status(503).json({ error: 'RESEND_API_KEY non configuree sur Vercel. Aucun email ne peut partir tant qu\'elle n\'est pas ajoutee.' });
    }

    const from = '"Pirabel Labs" <' + ((process.env.FROM_EMAIL || '').trim() || 'contact@pirabellabs.com') + '>';
    const html = masterTemplate({
      title: 'Test email Pirabel Labs',
      body: '<p>Ceci est un email de test envoye depuis le dashboard admin a ' + new Date().toISOString() + '.</p><p>Si vous recevez ce message, la configuration Resend fonctionne.</p>',
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
      return res.status(502).json({ error: 'Echec reseau vers Resend : ' + e.message });
    }

    if (!resp.ok) {
      return res.status(200).json({
        success: false,
        resendStatus: resp.status,
        resendError: (body && (body.message || body.name)) || 'Erreur Resend inconnue',
        from,
        to,
        hint: resp.status === 403 || resp.status === 422
          ? 'Domaine probablement non verifie OU FROM_EMAIL hors domaine verifie. Verifiez le domaine de FROM_EMAIL sur resend.com/domains.'
          : 'Verifiez la cle API et le domaine sur resend.com.'
      });
    }

    res.json({ success: true, message: 'Email de test envoye a ' + to + '. Verifiez la boite (et les spams).', resendId: body.id, from });
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
