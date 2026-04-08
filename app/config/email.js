const nodemailer = require('nodemailer');

// Strip stray whitespace/newlines from env vars (Vercel sometimes keeps them)
const clean = (v) => (v || '').toString().replace(/[\s\r\n]+$/g, '').replace(/^[\s\r\n]+/, '');

const SMTP_HOST = clean(process.env.SMTP_HOST) || 'smtp-relay.brevo.com';
const SMTP_PORT = parseInt(clean(process.env.SMTP_PORT)) || 587;
const SMTP_USER = clean(process.env.SMTP_USER);
const SMTP_PASS = clean(process.env.SMTP_PASS);

// Build transporter — single instance, optimized for Vercel serverless cold-starts
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  // Vercel serverless: use short timeouts so we never block beyond 10s
  connectionTimeout: 8000,
  greetingTimeout: 5000,
  socketTimeout: 8000,
  // No pooling on serverless — each invocation is fresh
  pool: false,
  // TLS — Brevo accepts STARTTLS on 587
  tls: { rejectUnauthorized: false }
});

// Log config once at module load (helps debugging in Vercel logs)
console.log(`[email] SMTP host=${SMTP_HOST} port=${SMTP_PORT} user=${SMTP_USER ? SMTP_USER.substring(0, 6) + '...' : 'MISSING'}`);

const FROM = () => `"Pirabel Labs" <${clean(process.env.FROM_EMAIL) || 'contact@pirabellabs.com'}>`;
const ADMIN_EMAIL = () => clean(process.env.ADMIN_EMAIL) || clean(process.env.FROM_EMAIL) || 'contact@pirabellabs.com';
const SITE = () => clean(process.env.SITE_URL) || 'https://www.pirabellabs.com';

// ========================================
// MASTER TEMPLATE — Premium Dark Theme
// ========================================
function masterTemplate(options = {}) {
  const { preheader, headerType, title, subtitle, body, cta, ctaUrl, ctaSecondary, ctaSecondaryUrl, stats, testimonial, footer_extra } = options;

  const statsHTML = stats ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>${stats.map(s => `
        <td style="text-align:center;padding:16px;background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);">
          <div style="font-size:28px;font-weight:800;color:#FF5500;letter-spacing:-1px;">${s.value}</div>
          <div style="font-size:11px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:1px;margin-top:6px;">${s.label}</div>
        </td>`).join('')}
      </tr>
    </table>` : '';

  const testimonialHTML = testimonial ? `
    <div style="border-left:3px solid #FF5500;padding:16px 20px;margin:28px 0;background:rgba(255,85,0,0.03);">
      <p style="font-style:italic;color:rgba(229,226,225,0.7);margin:0 0 8px;font-size:15px;">"${testimonial.quote}"</p>
      <p style="font-size:12px;color:#FF5500;font-weight:700;margin:0;">${testimonial.author} — ${testimonial.role}</p>
    </div>` : '';

  const ctaHTML = cta ? `
    <div style="text-align:center;margin:32px 0 16px;">
      <a href="${ctaUrl || SITE()}" style="display:inline-block;background:#FF5500;color:#5c1900;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:1.5px;padding:16px 40px;text-decoration:none;mso-padding-alt:0;">${cta}</a>
    </div>
    ${ctaSecondary ? `<div style="text-align:center;margin:8px 0 24px;"><a href="${ctaSecondaryUrl || SITE()}" style="color:#FF5500;font-size:13px;text-decoration:underline;">${ctaSecondary}</a></div>` : ''}` : '';

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">
${preheader ? `<span style="display:none;font-size:1px;color:#141313;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
<style>
body{margin:0;padding:0;background:#141313;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;}
a{color:#FF5500;}
@media(max-width:600px){
  .wrap{width:100%!important;}
  .body-cell{padding:28px 20px!important;}
  .header-cell{padding:24px 20px!important;}
  .footer-cell{padding:24px 20px!important;}
  .stat-cell{display:block!important;width:100%!important;margin-bottom:8px;}
  h1{font-size:22px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background:#141313;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#141313;">
<tr><td align="center" style="padding:20px 16px;">
<table class="wrap" width="600" cellpadding="0" cellspacing="0" style="background:#1c1b1b;max-width:600px;">

<!-- HEADER -->
<tr><td class="header-cell" style="padding:32px 40px;background:#0e0e0e;border-bottom:2px solid #FF5500;text-align:center;">
  <div style="font-size:26px;font-weight:900;color:#FF5500;letter-spacing:-1px;font-family:Georgia,serif;">PIRABEL LABS</div>
  ${headerType === 'banner' ? '<div style="font-size:10px;color:rgba(229,226,225,0.3);text-transform:uppercase;letter-spacing:3px;margin-top:8px;">Agence Marketing Digital Premium</div>' : ''}
</td></tr>

${headerType === 'hero' ? `
<!-- HERO BANNER -->
<tr><td style="padding:0;">
  <div style="background:linear-gradient(135deg,#FF5500,#FF7700);padding:48px 40px;text-align:center;">
    <h1 style="margin:0;font-size:28px;font-weight:800;color:#5c1900;letter-spacing:-0.5px;">${title || ''}</h1>
    ${subtitle ? `<p style="margin:12px 0 0;font-size:16px;color:rgba(92,25,0,0.7);">${subtitle}</p>` : ''}
  </div>
</td></tr>
<!-- BODY -->
<tr><td class="body-cell" style="padding:40px;color:#e5e2e1;">
${body || ''}
${statsHTML}
${testimonialHTML}
${ctaHTML}
</td></tr>
` : `
<!-- BODY -->
<tr><td class="body-cell" style="padding:40px;color:#e5e2e1;">
${title ? `<h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#e5e2e1;letter-spacing:-0.5px;">${title}</h1>` : ''}
${subtitle ? `<p style="margin:0 0 24px;font-size:14px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:1px;">${subtitle}</p>` : ''}
${body || ''}
${statsHTML}
${testimonialHTML}
${ctaHTML}
</td></tr>
`}

<!-- FOOTER -->
<tr><td class="footer-cell" style="padding:32px 40px;background:#0e0e0e;border-top:1px solid rgba(92,64,55,0.15);">
  ${footer_extra || ''}
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="text-align:center;padding-bottom:16px;">
        <a href="${SITE()}" style="color:#FF5500;text-decoration:none;font-size:12px;margin:0 8px;">Site web</a>
        <span style="color:rgba(229,226,225,0.15);">|</span>
        <a href="${SITE()}/agence-seo-referencement-naturel/" style="color:rgba(229,226,225,0.3);text-decoration:none;font-size:12px;margin:0 8px;">SEO</a>
        <span style="color:rgba(229,226,225,0.15);">|</span>
        <a href="${SITE()}/agence-creation-sites-web/" style="color:rgba(229,226,225,0.3);text-decoration:none;font-size:12px;margin:0 8px;">Sites Web</a>
        <span style="color:rgba(229,226,225,0.15);">|</span>
        <a href="${SITE()}/agence-ia-automatisation/" style="color:rgba(229,226,225,0.3);text-decoration:none;font-size:12px;margin:0 8px;">IA</a>
      </td>
    </tr>
    <tr><td style="text-align:center;">
      <p style="margin:0;font-size:11px;color:rgba(229,226,225,0.25);line-height:1.6;">
        &copy; 2026 Pirabel Labs &mdash; Agence Marketing Digital Premium<br>
        Paris &bull; Cotonou &bull; Casablanca &bull; Dakar &bull; Montr&eacute;al<br>
        <a href="mailto:contact@pirabellabs.com" style="color:rgba(229,226,225,0.3);">contact@pirabellabs.com</a>
      </p>
    </td></tr>
  </table>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}


// ========================================
// EMAIL TYPES
// ========================================

// --- OTP CODE ---
function otpEmail(code) {
  return masterTemplate({
    preheader: `Votre code : ${code}`,
    title: 'Code de V\u00e9rification',
    subtitle: 'S\u00e9curit\u00e9 de votre compte',
    body: `
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Voici votre code de v\u00e9rification :</p>
      <div style="text-align:center;margin:28px 0;">
        <div style="display:inline-block;background:#0e0e0e;border:2px solid rgba(255,85,0,0.4);padding:20px 40px;font-size:40px;font-weight:900;color:#FF5500;letter-spacing:12px;font-family:monospace;">${code}</div>
      </div>
      <p style="font-size:14px;color:rgba(229,226,225,0.5);text-align:center;">Ce code expire dans <strong style="color:#e5e2e1;">5 minutes</strong>.</p>
      <div style="height:1px;background:rgba(92,64,55,0.2);margin:28px 0;"></div>
      <p style="font-size:13px;color:rgba(229,226,225,0.3);">Si vous n'avez pas demand\u00e9 ce code, ignorez cet email. Votre compte est en s\u00e9curit\u00e9.</p>
    `
  });
}

// --- WELCOME NEW CLIENT ---
function welcomeEmail(name) {
  return masterTemplate({
    headerType: 'hero',
    preheader: `Bienvenue chez Pirabel Labs, ${name} !`,
    title: `Bienvenue, ${name} !`,
    subtitle: 'Votre espace client est pr\u00eat.',
    body: `
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Votre compte Pirabel Labs est maintenant actif. Voici ce que vous pouvez faire depuis votre espace client :</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr><td style="padding:12px 16px;border-left:3px solid #FF5500;background:#0e0e0e;margin-bottom:8px;">
          <strong style="color:#e5e2e1;">Suivre vos projets</strong><br><span style="font-size:13px;color:rgba(229,226,225,0.5);">Progression, \u00e9tapes, livrables — tout en temps r\u00e9el</span>
        </td></tr>
        <tr><td style="height:8px;"></td></tr>
        <tr><td style="padding:12px 16px;border-left:3px solid #41e4c0;background:#0e0e0e;">
          <strong style="color:#e5e2e1;">Consulter vos factures</strong><br><span style="font-size:13px;color:rgba(229,226,225,0.5);">Historique, statuts de paiement, t\u00e9l\u00e9chargement</span>
        </td></tr>
        <tr><td style="height:8px;"></td></tr>
        <tr><td style="padding:12px 16px;border-left:3px solid rgba(229,226,225,0.2);background:#0e0e0e;">
          <strong style="color:#e5e2e1;">\u00c9changer avec votre \u00e9quipe</strong><br><span style="font-size:13px;color:rgba(229,226,225,0.5);">Messagerie directe avec votre chef de projet</span>
        </td></tr>
      </table>
    `,
    cta: 'Acc\u00e9der \u00e0 mon espace',
    ctaUrl: `${SITE()}/espace-client-4p8w1n`
  });
}

// --- NEW ORDER NOTIFICATION (admin) ---
function newOrderEmail(order) {
  return masterTemplate({
    preheader: `Nouvelle demande de ${order.name}`,
    title: 'Nouvelle Demande',
    subtitle: `Via le formulaire contact &mdash; ${new Date().toLocaleDateString('fr-FR')}`,
    body: `
      <div style="background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);padding:24px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Nom</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;font-weight:600;">${order.name}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;"><a href="mailto:${order.email}" style="color:#FF5500;">${order.email}</a></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">T\u00e9l\u00e9phone</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;">${order.phone || 'Non renseign\u00e9'}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Service</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;"><span style="background:rgba(255,85,0,0.15);color:#FF5500;padding:3px 10px;font-size:12px;font-weight:700;">${order.service}</span></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Budget</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;">${order.budget || 'Non renseign\u00e9'}</td></tr>
        </table>
      </div>
      ${order.message ? `<div style="border-left:3px solid #FF5500;padding:16px 20px;background:rgba(255,85,0,0.03);"><p style="margin:0;font-size:14px;color:rgba(229,226,225,0.6);line-height:1.6;"><strong style="color:#e5e2e1;">Message :</strong><br>${order.message}</p></div>` : ''}
    `,
    cta: 'Voir dans l\'admin',
    ctaUrl: `${SITE()}/orders`,
    ctaSecondary: 'R\u00e9pondre directement',
    ctaSecondaryUrl: `mailto:${order.email}?subject=Re: Votre demande Pirabel Labs`
  });
}

// --- PROJECT UPDATE (client) ---
function projectUpdateEmail(clientName, projectName, update, progress) {
  return masterTemplate({
    preheader: `Mise \u00e0 jour : ${projectName}`,
    title: `Mise \u00e0 Jour Projet`,
    subtitle: projectName,
    body: `
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${clientName},</p>
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Votre projet a \u00e9t\u00e9 mis \u00e0 jour :</p>
      <div style="border-left:3px solid #FF5500;padding:16px 20px;background:#0e0e0e;margin:20px 0;">
        <p style="margin:0;font-size:15px;color:rgba(229,226,225,0.8);line-height:1.6;">${update}</p>
      </div>
      ${progress !== undefined ? `
      <div style="margin:24px 0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:12px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:1px;">Progression</span>
          <span style="font-size:14px;font-weight:700;color:#FF5500;">${progress}%</span>
        </div>
        <div style="background:#0e0e0e;height:8px;border-radius:4px;overflow:hidden;">
          <div style="background:linear-gradient(to right,#FF5500,#FF7700);height:100%;width:${progress}%;border-radius:4px;"></div>
        </div>
      </div>` : ''}
    `,
    cta: 'Voir mon projet',
    ctaUrl: `${SITE()}/espace-client-4p8w1n`
  });
}

// --- INVOICE SENT (client) ---
function invoiceEmail(clientName, invoiceNumber, amount, dueDate) {
  return masterTemplate({
    preheader: `Facture ${invoiceNumber} - ${amount}`,
    title: 'Nouvelle Facture',
    body: `
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${clientName},</p>
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Veuillez trouver votre facture :</p>
      <div style="background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);padding:28px;margin:24px 0;text-align:center;">
        <div style="font-size:12px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Facture</div>
        <div style="font-size:20px;font-weight:700;color:#e5e2e1;margin-bottom:16px;">${invoiceNumber}</div>
        <div style="font-size:36px;font-weight:900;color:#FF5500;letter-spacing:-1px;">${amount}</div>
        ${dueDate ? `<div style="font-size:13px;color:rgba(229,226,225,0.4);margin-top:12px;">\u00c9ch\u00e9ance : ${dueDate}</div>` : ''}
      </div>
    `,
    cta: 'Voir ma facture',
    ctaUrl: `${SITE()}/espace-client-4p8w1n`
  });
}

// --- PROSPECTION / CAMPAIGN ---
function prospectionEmail(recipientName, options = {}) {
  const { headline, intro, services, offer, urgency } = options;

  const servicesHTML = services ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      ${services.map(s => `
      <tr><td style="padding:12px 16px;border-left:3px solid #FF5500;background:#0e0e0e;margin-bottom:8px;">
        <strong style="color:#e5e2e1;font-size:15px;">${s.name}</strong><br>
        <span style="font-size:13px;color:rgba(229,226,225,0.5);">${s.desc}</span>
      </td></tr>
      <tr><td style="height:6px;"></td></tr>`).join('')}
    </table>` : '';

  return masterTemplate({
    headerType: 'hero',
    preheader: headline || 'Une opportunit\u00e9 pour votre croissance digitale',
    title: headline || 'Boostez Votre Croissance Digitale',
    subtitle: offer || null,
    body: `
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${recipientName || 'cher client'},</p>
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">${intro || 'Nous avons analys\u00e9 les tendances du march\u00e9 et identifi\u00e9 des opportunit\u00e9s concr\u00e8tes pour votre entreprise. Voici ce que nous pouvons faire ensemble :'}</p>
      ${servicesHTML}
      ${urgency ? `<div style="background:rgba(255,85,0,0.08);border:1px solid rgba(255,85,0,0.2);padding:16px 20px;margin:24px 0;text-align:center;"><p style="margin:0;color:#FF5500;font-weight:700;font-size:14px;">${urgency}</p></div>` : ''}
    `,
    cta: 'Demander un audit gratuit',
    ctaUrl: `${SITE()}/contact.html`,
    ctaSecondary: 'D\u00e9couvrir nos services',
    ctaSecondaryUrl: `${SITE()}/services.html`,
    stats: [
      { value: '+347%', label: 'Trafic moyen' },
      { value: '150+', label: 'Projets' },
      { value: '98%', label: 'Satisfaction' }
    ],
    testimonial: {
      quote: 'Pirabel Labs a transform\u00e9 notre visibilit\u00e9. En 6 mois, notre trafic a d\u00e9pass\u00e9 nos campagnes payantes.',
      author: 'Jean D.',
      role: 'CEO, InnovaCorp'
    }
  });
}

// --- NEWSLETTER ---
function newsletterEmail(recipientName, options = {}) {
  const { subject_line, articles } = options;

  const articlesHTML = articles ? articles.map(a => `
    <div style="border-bottom:1px solid rgba(92,64,55,0.15);padding:20px 0;">
      <span style="background:rgba(255,85,0,0.15);color:#FF5500;padding:2px 8px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">${a.tag}</span>
      <h3 style="margin:10px 0 6px;font-size:18px;font-weight:700;color:#e5e2e1;">${a.title}</h3>
      <p style="margin:0 0 10px;font-size:14px;color:rgba(229,226,225,0.6);line-height:1.5;">${a.excerpt}</p>
      <a href="${a.url || SITE() + '/guides/'}" style="color:#FF5500;font-size:13px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.5px;">Lire &rarr;</a>
    </div>`).join('') : '';

  return masterTemplate({
    headerType: 'banner',
    preheader: subject_line || 'Les derni\u00e8res tendances du digital',
    title: subject_line || 'Les Tendances du Mois',
    body: `
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${recipientName || 'cher abonn\u00e9'},</p>
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Voici notre s\u00e9lection de ressources pour booster votre croissance ce mois-ci :</p>
      ${articlesHTML}
    `,
    cta: 'Voir tous nos guides',
    ctaUrl: `${SITE()}/guides/`
  });
}


// ========================================
// SEND FUNCTIONS
// ========================================

async function sendEmail(to, subject, html) {
  if (!SMTP_USER || !SMTP_PASS) {
    console.error('[email] MISSING SMTP_USER/SMTP_PASS env vars - cannot send email to', to);
    return false;
  }
  if (!to) {
    console.error('[email] missing recipient (to) for subject:', subject);
    return false;
  }
  try {
    const info = await transporter.sendMail({ from: FROM(), to, subject, html });
    console.log(`[email] OK to=${to} subject="${subject}" messageId=${info.messageId} accepted=${(info.accepted || []).length} rejected=${(info.rejected || []).length}`);
    return true;
  } catch (err) {
    console.error(`[email] FAIL to=${to} subject="${subject}" code=${err.code} responseCode=${err.responseCode} message=${err.message}`);
    return false;
  }
}

async function sendOTP(email, code) {
  return sendEmail(email, `Votre code Pirabel Labs : ${code}`, otpEmail(code));
}

async function notifyNewOrder(order) {
  return sendEmail(
    ADMIN_EMAIL(),
    `Nouvelle demande : ${order.name} - ${order.service}`,
    newOrderEmail(order)
  );
}

async function notifyProjectUpdate(clientEmail, clientName, projectName, update, progress) {
  return sendEmail(clientEmail, `Mise \u00e0 jour : ${projectName}`, projectUpdateEmail(clientName, projectName, update, progress));
}

async function sendInvoiceNotification(clientEmail, clientName, invoiceNumber, amount, dueDate) {
  return sendEmail(clientEmail, `Facture ${invoiceNumber}`, invoiceEmail(clientName, invoiceNumber, amount, dueDate));
}

async function sendWelcome(email, name) {
  return sendEmail(email, `Bienvenue chez Pirabel Labs, ${name} !`, welcomeEmail(name));
}

async function sendProspection(email, name, options) {
  return sendEmail(email, options.headline || 'Boostez votre croissance digitale', prospectionEmail(name, options));
}

async function sendNewsletter(email, name, options) {
  return sendEmail(email, options.subject_line || 'Pirabel Labs — Les tendances du mois', newsletterEmail(name, options));
}

// --- RECRUITMENT: NEW APPLICATION (admin notification) ---
function newApplicationAdminEmail(app, job) {
  return masterTemplate({
    preheader: `Nouvelle candidature de ${app.name} pour ${job.title}`,
    title: 'Nouvelle Candidature',
    subtitle: `Poste : ${job.title} — ${new Date().toLocaleDateString('fr-FR')}`,
    body: `
      <div style="background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);padding:24px;margin:0 0 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Candidat</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;font-weight:700;color:#e5e2e1;">${app.name}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;"><a href="mailto:${app.email}" style="color:#FF5500;">${app.email}</a></td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Téléphone</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;">${app.phone || 'Non renseigné'}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">LinkedIn</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;">${app.linkedin ? `<a href="${app.linkedin}" style="color:#FF5500;">Voir profil</a>` : '-'}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Portfolio</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;">${app.portfolio ? `<a href="${app.portfolio}" style="color:#FF5500;">Voir portfolio</a>` : '-'}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">CV</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;">${app.cvUrl ? `<a href="${app.cvUrl}" style="color:#FF5500;">${app.cvFilename || 'Télécharger'}</a>` : 'Non fourni'}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);"><span style="color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Poste</span></td><td style="padding:8px 0;border-bottom:1px solid rgba(92,64,55,0.1);text-align:right;"><span style="background:rgba(255,85,0,0.15);color:#FF5500;padding:3px 10px;font-size:12px;font-weight:700;">${job.title}</span></td></tr>
        </table>
      </div>
      ${app.coverLetter ? `<div style="border-left:3px solid #FF5500;padding:16px 20px;background:rgba(255,85,0,0.03);margin-bottom:24px;"><p style="margin:0 0 8px;font-size:12px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:1px;">Lettre de motivation</p><p style="margin:0;font-size:14px;color:rgba(229,226,225,0.7);line-height:1.7;">${app.coverLetter.replace(/\n/g, '<br>')}</p></div>` : ''}
    `,
    cta: 'Voir dans l\'admin',
    ctaUrl: `${SITE()}/candidates`,
    ctaSecondary: 'Répondre au candidat',
    ctaSecondaryUrl: `mailto:${app.email}?subject=Re: Votre candidature - ${job.title}`
  });
}

// --- RECRUITMENT: APPLICATION CONFIRMATION (to candidate) ---
function applicationConfirmationEmail(candidateName, jobTitle) {
  return masterTemplate({
    headerType: 'hero',
    preheader: `Candidature reçue pour ${jobTitle}`,
    title: 'Candidature enregistrée !',
    subtitle: `Poste : ${jobTitle}`,
    body: `
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${candidateName},</p>
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Nous avons bien reçu votre candidature pour le poste de <strong style="color:#e5e2e1;">${jobTitle}</strong>. Merci de l'intérêt que vous portez à Pirabel Labs !</p>
      <div style="background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);padding:24px;margin:24px 0;">
        <div style="font-size:12px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;">Prochaines étapes</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(92,64,55,0.1);">
            <div style="display:inline-block;width:24px;height:24px;background:rgba(255,85,0,0.15);color:#FF5500;text-align:center;line-height:24px;font-weight:700;font-size:12px;margin-right:12px;">1</div>
            <span style="font-size:14px;color:rgba(229,226,225,0.7);">Examen de votre dossier par notre équipe RH</span>
          </td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid rgba(92,64,55,0.1);">
            <div style="display:inline-block;width:24px;height:24px;background:rgba(255,85,0,0.15);color:#FF5500;text-align:center;line-height:24px;font-weight:700;font-size:12px;margin-right:12px;">2</div>
            <span style="font-size:14px;color:rgba(229,226,225,0.7);">Présélection et retour sous 7 jours ouvrés</span>
          </td></tr>
          <tr><td style="padding:10px 0;">
            <div style="display:inline-block;width:24px;height:24px;background:rgba(255,85,0,0.15);color:#FF5500;text-align:center;line-height:24px;font-weight:700;font-size:12px;margin-right:12px;">3</div>
            <span style="font-size:14px;color:rgba(229,226,225,0.7);">Entretien avec notre équipe si votre profil est retenu</span>
          </td></tr>
        </table>
      </div>
      <p style="font-size:14px;color:rgba(229,226,225,0.5);">Pour toute question, vous pouvez nous contacter directement à <a href="mailto:contact@pirabellabs.com" style="color:#FF5500;">contact@pirabellabs.com</a></p>
    `,
    cta: 'Découvrir Pirabel Labs',
    ctaUrl: `${SITE()}/a-propos.html`
  });
}

// --- RECRUITMENT: STATUS CHANGE (to candidate) ---
const STATUS_MESSAGES = {
  en_revue: {
    subject: 'Votre candidature est en cours d\'examen',
    headline: 'En cours d\'examen',
    color: '#9b59b6',
    message: 'Bonne nouvelle ! Notre équipe RH examine actuellement votre candidature avec attention. Vous recevrez une réponse dans les prochains jours.'
  },
  preselectionne: {
    subject: 'Vous êtes présélectionné(e) !',
    headline: 'Félicitations — Présélectionné(e) !',
    color: '#e67e22',
    message: 'Excellente nouvelle ! Votre profil a été présélectionné parmi de nombreux candidats. Notre équipe vous contactera très prochainement pour la suite du processus.'
  },
  entretien: {
    subject: 'Invitation à un entretien — Pirabel Labs',
    headline: 'Invitation à un entretien',
    color: '#FF5500',
    message: 'Nous avons le plaisir de vous inviter à un entretien avec notre équipe. Vous serez contacté(e) dans les 24h pour convenir d\'un créneau.'
  },
  test: {
    subject: 'Exercice technique — Pirabel Labs',
    headline: 'Phase de test technique',
    color: '#1abc9c',
    message: 'Votre candidature progresse ! Nous vous envoyons un exercice technique pour évaluer vos compétences. Consultez votre boîte mail pour les instructions détaillées.'
  },
  accepte: {
    subject: '🎉 Votre candidature est acceptée !',
    headline: 'Bienvenue dans l\'équipe !',
    color: '#2ecc71',
    message: 'Félicitations ! Nous avons le grand plaisir de vous informer que votre candidature a été sélectionnée. Notre équipe RH vous contactera dans les prochaines 24h pour finaliser les modalités d\'intégration.'
  },
  refuse: {
    subject: 'Suite de votre candidature — Pirabel Labs',
    headline: 'Réponse à votre candidature',
    color: 'rgba(229,226,225,0.5)',
    message: 'Nous vous remercions sincèrement pour l\'intérêt que vous portez à Pirabel Labs et pour le temps consacré à votre candidature. Après examen attentif de votre dossier, nous ne sommes malheureusement pas en mesure de donner une suite favorable à votre candidature pour ce poste. Nous conservons votre profil et reviendrons vers vous pour de futures opportunités.'
  }
};

function applicationStatusEmail(candidateName, jobTitle, status, customNote) {
  const cfg = STATUS_MESSAGES[status] || {
    subject: 'Mise à jour de votre candidature',
    headline: 'Mise à jour',
    color: '#FF5500',
    message: 'Votre candidature a été mise à jour.'
  };

  return masterTemplate({
    preheader: cfg.subject,
    title: cfg.headline,
    subtitle: `Poste : ${jobTitle}`,
    body: `
      <div style="border-left:4px solid ${cfg.color};padding:16px 20px;background:rgba(0,0,0,0.2);margin:0 0 24px;">
        <p style="margin:0;font-size:12px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Mise à jour candidature</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#e5e2e1;">${cfg.headline}</p>
      </div>
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${candidateName},</p>
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">${cfg.message}</p>
      ${customNote ? `<div style="border-left:3px solid #FF5500;padding:16px 20px;background:rgba(255,85,0,0.03);margin:20px 0;"><p style="margin:0;font-size:14px;color:rgba(229,226,225,0.8);line-height:1.6;"><strong style="color:#e5e2e1;">Note de notre équipe :</strong><br>${customNote.replace(/\n/g, '<br>')}</p></div>` : ''}
      <p style="font-size:14px;color:rgba(229,226,225,0.5);">Pour toute question, contactez-nous à <a href="mailto:contact@pirabellabs.com" style="color:#FF5500;">contact@pirabellabs.com</a></p>
    `,
    cta: status === 'accepte' ? 'Commencer l\'aventure' : 'Voir nos autres offres',
    ctaUrl: status === 'accepte' ? `${SITE()}/carrieres.html` : `${SITE()}/carrieres.html`,
    footer_extra: `<div style="background:rgba(255,85,0,0.05);border:1px solid rgba(255,85,0,0.1);padding:12px 16px;margin-bottom:16px;text-align:center;"><span style="font-size:11px;color:rgba(229,226,225,0.4);">Candidature • ${jobTitle} • Pirabel Labs</span></div>`
  });
}

// Send functions for recruitment
async function notifyNewApplication(app, job) {
  const adminEmail = ADMIN_EMAIL();
  return sendEmail(
    adminEmail,
    `🔔 Nouvelle candidature : ${app.name} — ${job.title}`,
    newApplicationAdminEmail(app, job)
  );
}

async function sendApplicationConfirmation(candidateEmail, candidateName, jobTitle) {
  return sendEmail(
    candidateEmail,
    `Candidature reçue — ${jobTitle} | Pirabel Labs`,
    applicationConfirmationEmail(candidateName, jobTitle)
  );
}

async function sendApplicationStatusUpdate(candidateEmail, candidateName, jobTitle, status, note) {
  const cfg = STATUS_MESSAGES[status];
  if (!cfg) return false; // Don't send for 'nouveau' status (initial)
  return sendEmail(
    candidateEmail,
    cfg.subject + ` — Pirabel Labs`,
    applicationStatusEmail(candidateName, jobTitle, status, note)
  );
}

// --- ORDERS: ADVANCED AUTOMATION ---
async function sendOrderStatusUpdate(order, newStatus) {
  let subject = "Mise à jour concernant votre demande — Pirabel Labs";
  let content = "Le statut de votre demande a évolué.";
  
  if (newStatus === 'en_traitement') {
    subject = "Votre demande est en cours d'analyse — Pirabel Labs";
    content = `Nous vous confirmons la bonne réception de votre demande concernant <strong>${order.service}</strong>.<br><br>Notre équipe étudie actuellement vos besoins avec une grande attention et reviendra vers vous très prochainement avec une proposition adaptée.`;
  } else if (newStatus === 'acceptee') {
    subject = "Bienvenue chez Pirabel Labs !";
    content = `Nous sommes ravis de vous compter parmi nos clients ! Votre demande pour <strong>${order.service}</strong> est officiellement validée.<br><br>Un expert va prendre contact avec vous rapidement pour organiser le lancement stratégique du projet.`;
  } else if (newStatus === 'refusee') {
    subject = "Suite à votre demande — Pirabel Labs";
    content = `Après étude approfondie de votre demande pour <strong>${order.service}</strong>, nous sommes au regret de vous informer que nous ne pourrons pas y donner suite actuellement, car notre charge de travail ou l'adéquation du projet ne nous permet pas de vous garantir le niveau d'excellence exigé par Pirabel Labs.<br><br>Nous vous remercions sincèrement pour l'intérêt que vous nous avez porté et vous souhaitons de belles réussites.`;
  } else {
    return false;
  }
  
  const html = masterTemplate({
    title: subject,
    body: `<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${order.name},</p><p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">${content}</p>`,
    cta: 'Voir le site',
    ctaUrl: SITE()
  });
  
  return sendEmail(order.email, subject, html);
}

async function sendQuoteInteraction(order) {
  const subject = `Votre devis pour ${order.service} est prêt !`;
  const urlRdv = `${SITE()}/rendez-vous`;
  const urlModif = `${SITE()}/modifier-devis.html?id=${order._id}`;
  
  const html = masterTemplate({
    headerType: 'hero',
    preheader: "Proposition commerciale Pirabel Labs",
    title: "Votre Devis Sur-Mesure",
    subtitle: `Projet : ${order.service}`,
    body: `
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${order.name},</p>
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Suite à notre analyse de votre besoin pour la prestation <strong>${order.service}</strong>, nous avons le plaisir de vous faire parvenir notre proposition détaillée.</p>
      
      <div style="background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);padding:24px;margin:24px 0;text-align:center;">
        <h3 style="color:#e5e2e1;font-size:18px;margin-top:0;">Comment souhaitez-vous procéder ?</h3>
        <p style="color:rgba(229,226,225,0.5);font-size:14px;margin-bottom:20px;">Choisissez l'option qui vous convient le mieux :</p>
        
        <a href="${urlRdv}" style="display:inline-block;padding:12px 24px;background:#FF5500;color:#000;text-decoration:none;font-weight:700;font-size:14px;border-radius:2px;margin:0 10px 10px 0;white-space:nowrap;">📅 Planifier un Appel (Validation)</a>
        
        <a href="${urlModif}" style="display:inline-block;padding:12px 24px;background:rgba(255,255,255,0.05);color:#e5e2e1;text-decoration:none;font-weight:700;font-size:14px;border:1px solid rgba(229,226,225,0.2);margin:0 10px 10px 0;white-space:nowrap;">✏️ Demander une modification</a>
      </div>
      
      <p style="font-size:14px;color:rgba(229,226,225,0.5);">Vous trouverez en PJ (ou prochainement envoyé par un conseiller) le détail financier exact.</p>
    `,
    cta: 'Planifier un Appel',
    ctaUrl: urlRdv,
    ctaSecondary: 'Demander une modification',
    ctaSecondaryUrl: urlModif
  });
  
  return sendEmail(order.email, subject, html);
}

async function sendMeetingReminder(appointment) {
  const subject = `Rappel : Appel Pirabel Labs dans 30 minutes`;
  const html = masterTemplate({
    title: "Votre RDV approche",
    subtitle: `Sujet : ${appointment.title}`,
    body: `
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${appointment.with.name || ''},</p>
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Ceci est un simple rappel de notre appel prévu dans 30 minutes.</p>
      <div style="border-left:3px solid #FF5500;padding:16px 20px;background:rgba(255,85,0,0.03);margin:20px 0;">
        <p style="margin:0;font-size:14px;color:#e5e2e1;"><strong>Lien / Lieu :</strong> ${appointment.meetingLink || appointment.location || 'Voir agenda'}</p>
      </div>
      <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">À tout de suite !</p>
    `,
    cta: 'Rejoindre la réunion',
    ctaUrl: appointment.meetingLink || SITE()
  });
  return sendEmail(appointment.with.email, subject, html);
}

// Legacy wrapper for campaigns
function emailTemplate(title, content, ctaText, ctaUrl) {
  return masterTemplate({ title, body: content, cta: ctaText, ctaUrl });
}

module.exports = {
  sendEmail, sendOTP, notifyNewOrder, notifyProjectUpdate,
  sendInvoiceNotification, sendWelcome, sendProspection, sendNewsletter,
  notifyNewApplication, sendApplicationConfirmation, sendApplicationStatusUpdate,
  sendOrderStatusUpdate, sendQuoteInteraction, sendMeetingReminder,
  emailTemplate, masterTemplate,
  prospectionEmail, newsletterEmail, welcomeEmail,
  applicationStatusEmail, applicationConfirmationEmail, newApplicationAdminEmail,
  STATUS_MESSAGES
};

