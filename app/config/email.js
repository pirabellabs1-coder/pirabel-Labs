// ========================================
// PROVIDER: Resend (HTTP API, no SMTP)
// Migrated 2026-05-24 from Brevo SMTP (deliverability issues).
// ========================================

// Strip stray whitespace/newlines from env vars (Vercel sometimes keeps them)
const clean = (v) => (v || '').toString().replace(/[\s\r\n]+$/g, '').replace(/^[\s\r\n]+/, '');

const RESEND_API_KEY = clean(process.env.RESEND_API_KEY);
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

// Log config once at module load (helps debugging in Vercel logs)
console.log(`[email] provider=Resend key=${RESEND_API_KEY ? RESEND_API_KEY.substring(0, 8) + '...' : 'MISSING'}`);

const FROM = () => `"Pirabel Labs" <${clean(process.env.FROM_EMAIL) || 'contact@pirabellabs.com'}>`;
const ADMIN_EMAIL = () => clean(process.env.ADMIN_EMAIL) || clean(process.env.FROM_EMAIL) || 'contact@pirabellabs.com';
const SITE = () => clean(process.env.SITE_URL) || 'https://www.pirabellabs.com';
const WHATSAPP = 'https://wa.me/33757751778';

// ========================================
// CHARTE E-MAIL — version claire du site (« version blanche »)
// Contrastes vérifiés (WCAG AA) : texte #17120f / #4a413b sur blanc, liens #B83A00 (5,8:1),
// boutons orange #FF5500 avec texte #140700 (6,2:1), comme les boutons du site.
// ========================================
const C = {
  page: '#f6f3ef', card: '#ffffff', line: '#ece5de', lineSoft: '#f3eee9',
  text: '#17120f', text2: '#4a413b', muted: '#6b605a', faint: '#8a7f78',
  accent: '#FF5500', accentText: '#B83A00', onAccent: '#140700',
  soft: '#fff4ec', softLine: '#ffd9c2', box: '#faf7f4',
};
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

// Styles réutilisables pour le contenu des e-mails (à utiliser dans les nouveaux modèles).
const S = {
  p: `margin:0 0 16px;font-size:16px;line-height:1.65;color:${C.text2};`,
  small: `margin:0 0 12px;font-size:14px;line-height:1.6;color:${C.muted};`,
  strong: `color:${C.text};`,
  link: `color:${C.accentText};font-weight:600;`,
  box: `background:${C.box};border:1px solid ${C.line};border-radius:14px;padding:20px 22px;margin:0 0 22px;`,
  note: `background:${C.soft};border-left:4px solid ${C.accent};border-radius:0 12px 12px 0;padding:16px 20px;margin:0 0 22px;`,
  label: `font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${C.muted};`,
  badge: `display:inline-block;background:${C.soft};border:1px solid ${C.softLine};color:${C.accentText};border-radius:999px;padding:3px 12px;font-size:13px;font-weight:700;`,
};

// Les anciens corps d'e-mail (écrits pour le thème sombre) sont convertis vers la charte claire :
// texte clair → texte foncé, encadrés noirs → encadrés crème, orange texte → orange lisible sur blanc.
function toLight(html) {
  if (!html) return '';
  const grey = (a) => {
    const x = parseFloat(a);
    if (x >= 0.78) return C.text;
    if (x >= 0.62) return C.text2;
    if (x >= 0.45) return C.muted;
    return C.faint;
  };
  return String(html)
    .replace(/(^|[;"'\s])color:\s*rgba\(\s*229\s*,\s*226\s*,\s*225\s*,\s*([0-9.]+)\s*\)/gi, (m, pre, a) => `${pre}color:${grey(a)}`)
    .replace(/(^|[;"'\s])color:\s*#e5e2e1/gi, `$1color:${C.text}`)
    .replace(/(^|[;"'\s])color:\s*#ff5500/gi, `$1color:${C.accentText}`)
    .replace(/(^|[;"'\s])color:\s*#5c1900/gi, `$1color:${C.onAccent}`)
    .replace(/background:\s*#0e0e0e/gi, `background:${C.box};border-radius:12px`)
    .replace(/background:\s*#1c1b1b/gi, `background:${C.card}`)
    .replace(/background:\s*#141313/gi, `background:${C.page}`)
    .replace(/background:\s*rgba\(0,\s*0,\s*0,\s*0\.2\)/gi, `background:${C.box}`)
    .replace(/background:\s*rgba\(255,\s*255,\s*255,\s*0\.05\)/gi, `background:${C.card}`)
    .replace(/background:\s*rgba\(255,\s*85,\s*0,\s*0\.0[0-9]\)/gi, `background:${C.soft}`)
    .replace(/rgba\(\s*92\s*,\s*64\s*,\s*55\s*,\s*0?\.\d+\s*\)/gi, C.line)
    .replace(/(border[a-z-]*:\s*[^;"]*?)rgba\(\s*229\s*,\s*226\s*,\s*225\s*,\s*[0-9.]+\s*\)/gi, `$1${C.line}`)
    .replace(/background:\s*rgba\(\s*229\s*,\s*226\s*,\s*225\s*,\s*[0-9.]+\s*\)/gi, `background:${C.line}`);
}

// ========================================
// GABARIT PRINCIPAL — clair, coloré, large (720 px), aligné à gauche
// ========================================
function masterTemplate(options = {}) {
  const { preheader, headerType, title, subtitle, cta, ctaUrl, ctaSecondary, ctaSecondaryUrl, stats, testimonial } = options;
  const body = toLight(options.body);
  const footerExtra = toLight(options.footer_extra);
  const site = SITE();
  const year = new Date().getFullYear();

  const statsHTML = stats && stats.length ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;border-collapse:separate;border-spacing:8px 0;">
      <tr>${stats.map((s) => `
        <td class="stat-cell" style="text-align:left;padding:16px 18px;background:${C.soft};border:1px solid ${C.softLine};border-radius:14px;">
          <div style="font-size:26px;font-weight:800;color:${C.accentText};letter-spacing:-0.5px;">${s.value}</div>
          <div style="font-size:12px;color:${C.muted};text-transform:uppercase;letter-spacing:.06em;margin-top:4px;">${s.label}</div>
        </td>`).join('')}
      </tr>
    </table>` : '';

  const testimonialHTML = testimonial ? `
    <div style="${S.note}">
      <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:${C.text};font-style:italic;">« ${testimonial.quote} »</p>
      <p style="margin:0;font-size:13px;color:${C.accentText};font-weight:700;">${testimonial.author}${testimonial.role ? ' — ' + testimonial.role : ''}</p>
    </div>` : '';

  const ctaHTML = cta ? `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
      <tr><td style="border-radius:12px;background:${C.accent};background-image:linear-gradient(120deg,#ff6a1a,${C.accent} 45%,#ff7a33);">
        <a href="${ctaUrl || site}" style="display:inline-block;padding:15px 30px;font-size:16px;font-weight:700;color:${C.onAccent};text-decoration:none;border-radius:12px;">${cta}&nbsp;&rarr;</a>
      </td></tr>
    </table>
    ${ctaSecondary ? `<p style="margin:14px 0 0;font-size:15px;"><a href="${ctaSecondaryUrl || site}" style="${S.link}text-decoration:underline;">${ctaSecondary}</a></p>` : ''}` : '';

  const hero = headerType === 'hero';
  const heading = hero ? `
<tr><td class="hero-cell" style="padding:40px 44px;background:${C.accent};background-image:linear-gradient(135deg,#FF5500 0%,#FF7A33 55%,#FFB088 100%);">
  <h1 style="margin:0;font-size:30px;line-height:1.2;font-weight:800;color:${C.onAccent};letter-spacing:-0.5px;">${title || ''}</h1>
  ${subtitle ? `<p style="margin:10px 0 0;font-size:18px;line-height:1.5;font-weight:600;color:#3a1600;">${subtitle}</p>` : ''}
</td></tr>` : (title || subtitle) ? `
<tr><td class="body-cell" style="padding:36px 44px 0;">
  ${subtitle ? `<p style="margin:0 0 10px;"><span style="${S.badge}">${subtitle}</span></p>` : ''}
  ${title ? `<h1 style="margin:0;font-size:28px;line-height:1.25;font-weight:800;color:${C.text};letter-spacing:-0.5px;">${title}</h1>` : ''}
</td></tr>` : '';

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<title>${String(title || 'Pirabel Labs').replace(/<[^>]+>/g, '')}</title>
<style>
body{margin:0;padding:0;background:${C.page};font-family:${FONT};-webkit-font-smoothing:antialiased;}
a{color:${C.accentText};}
@media (max-width:640px){
  .outer{padding:12px 0!important;}
  .wrap{width:100%!important;border-radius:0!important;}
  .body-cell,.hero-cell,.header-cell,.footer-cell{padding-left:22px!important;padding-right:22px!important;}
  .stat-cell{display:block!important;width:auto!important;margin-bottom:8px;}
  h1{font-size:24px!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
${preheader ? `<div style="display:none;font-size:1px;color:${C.page};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};">
<tr><td class="outer" align="center" style="padding:28px 12px;">
<table role="presentation" class="wrap" width="720" cellpadding="0" cellspacing="0" style="width:100%;max-width:720px;background:${C.card};border:1px solid ${C.line};border-radius:18px;overflow:hidden;font-family:${FONT};">

<!-- Bandeau de couleur -->
<tr><td style="height:6px;line-height:6px;font-size:0;background:${C.accent};background-image:linear-gradient(90deg,#FF5500,#FF7A33 50%,#FFB088);">&nbsp;</td></tr>

<!-- En-tête -->
<tr><td class="header-cell" style="padding:22px 44px;border-bottom:1px solid ${C.lineSoft};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="vertical-align:middle;">
      <a href="${site}" style="text-decoration:none;">
        <img src="${site}/img/logo.png" width="34" height="34" alt="" style="display:inline-block;vertical-align:middle;border:0;">
        <span style="display:inline-block;vertical-align:middle;margin-left:10px;font-size:20px;font-weight:800;color:${C.text};letter-spacing:-0.3px;">Pirabel Labs</span>
      </a>
    </td>
    <td align="right" style="vertical-align:middle;font-size:13px;color:${C.muted};">Sites web · SEO · IA</td>
  </tr></table>
</td></tr>
${heading}
<!-- Contenu -->
<tr><td class="body-cell" style="padding:32px 44px 40px;font-size:16px;line-height:1.65;color:${C.text2};">
${body || ''}
${statsHTML}
${testimonialHTML}
${ctaHTML}
</td></tr>

<!-- Pied de page -->
<tr><td class="footer-cell" style="padding:28px 44px 32px;background:${C.box};border-top:1px solid ${C.line};">
  ${footerExtra || ''}
  <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:${C.text2};"><strong style="color:${C.text};">Pirabel Labs</strong> — agence web, SEO et IA basée à Abomey-Calavi (Bénin), au service des entreprises francophones d’Afrique, d’Europe et du Canada.</p>
  <p style="margin:0 0 14px;font-size:14px;line-height:1.8;">
    <a href="${site}/services" style="${S.link}text-decoration:none;">Nos services</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${site}/realisations" style="${S.link}text-decoration:none;">Réalisations</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${site}/blog" style="${S.link}text-decoration:none;">Blog</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${site}/contact" style="${S.link}text-decoration:none;">Contact</a>
  </p>
  <p style="margin:0;font-size:13px;line-height:1.6;color:${C.muted};">
    <a href="mailto:contact@pirabellabs.com" style="color:${C.muted};">contact@pirabellabs.com</a> · <a href="${WHATSAPP}" style="color:${C.muted};">WhatsApp +33 7 57 75 17 78</a> · <a href="tel:+2290168884534" style="color:${C.muted};">Bénin +229 01 68 88 45 34</a><br>
    © ${year} Pirabel Labs. Vous recevez cet e-mail suite à un échange avec Pirabel Labs ; répondez simplement pour nous écrire.
  </p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}

// Tableau « libellé → valeur » (valeurs déjà échappées par l'appelant).
function infoTable(rows) {
  const r = rows.filter((x) => x && x[1] !== undefined && x[1] !== null && String(x[1]).trim() !== '');
  if (!r.length) return '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${S.box}border-collapse:separate;">
    ${r.map(([k, v], i) => `<tr>
      <td style="padding:10px 0;${i < r.length - 1 ? `border-bottom:1px solid ${C.line};` : ''}vertical-align:top;width:34%;${S.label}">${k}</td>
      <td style="padding:10px 0 10px 16px;${i < r.length - 1 ? `border-bottom:1px solid ${C.line};` : ''}vertical-align:top;font-size:15px;line-height:1.55;color:${C.text};">${v}</td>
    </tr>`).join('')}
  </table>`;
}


// ========================================
// MODÈLES
// ========================================

// --- CODE DE VÉRIFICATION ---
function otpEmail(code) {
  return masterTemplate({
    preheader: `Votre code : ${code}`,
    title: 'Votre code de vérification',
    subtitle: 'Sécurité du compte',
    body: `
      <p style="${S.p}">Voici votre code de vérification :</p>
      <p style="margin:8px 0 22px;"><span style="display:inline-block;background:${C.soft};border:2px solid ${C.softLine};border-radius:14px;padding:16px 28px;font-size:36px;font-weight:800;color:${C.accentText};letter-spacing:10px;font-family:Consolas,Menlo,monospace;">${code}</span></p>
      <p style="${S.p}">Ce code expire dans <strong style="${S.strong}">5 minutes</strong>.</p>
      <p style="${S.small}">Si vous n’avez pas demandé ce code, ignorez cet e-mail : votre compte reste protégé.</p>`,
  });
}

// --- BIENVENUE (espace client) ---
function welcomeEmail(name) {
  return masterTemplate({
    headerType: 'hero',
    preheader: `Bienvenue chez Pirabel Labs, ${name} !`,
    title: `Bienvenue, ${name} !`,
    subtitle: 'Votre espace client est prêt.',
    body: `
      <p style="${S.p}">Votre compte Pirabel Labs est actif. Depuis votre espace client, vous pouvez :</p>
      <div style="${S.note}"><strong style="${S.strong}">Suivre vos projets</strong><br><span style="font-size:14px;color:${C.muted};">Progression, étapes et livrables, en temps réel.</span></div>
      <div style="${S.note}"><strong style="${S.strong}">Consulter vos factures</strong><br><span style="font-size:14px;color:${C.muted};">Historique, statut des paiements et téléchargement.</span></div>
      <div style="${S.note}"><strong style="${S.strong}">Échanger avec nous</strong><br><span style="font-size:14px;color:${C.muted};">Une messagerie directe avec votre interlocuteur.</span></div>`,
    cta: 'Accéder à mon espace',
    ctaUrl: `${SITE()}/espace-client`,
  });
}

// --- NOUVELLE DEMANDE (admin) ---
// Les valeurs reçues sont déjà échappées par l'appelant (api/index.js).
function newOrderEmail(order) {
  const rows = [
    ['Nom', `<strong>${order.name}</strong>`],
    ['E-mail', `<a href="mailto:${order.email}" style="${S.link}">${order.email}</a>`],
    ['Téléphone', order.phone || 'Non renseigné'],
    order.company ? ['Entreprise', order.company] : null,
    ['Service', `<span style="${S.badge}">${order.service}</span>`],
    ['Budget', order.budget || 'Non renseigné'],
  ];
  return masterTemplate({
    preheader: `Nouvelle demande de ${order.name}`,
    title: 'Nouvelle demande',
    subtitle: `Formulaire du site · ${new Date().toLocaleDateString('fr-FR')}`,
    body: `
      ${order.intro || ''}
      ${infoTable(rows)}
      ${order.extraHtml || ''}
      ${order.message ? `<div style="${S.note}"><p style="margin:0 0 6px;${S.label}">Message</p><p style="margin:0;font-size:15px;line-height:1.65;color:${C.text};">${order.message}</p></div>` : ''}`,
    cta: 'Ouvrir le tableau de bord',
    ctaUrl: `${SITE()}/admin/dashboard`,
    ctaSecondary: 'Répondre directement',
    ctaSecondaryUrl: `mailto:${order.email}?subject=${encodeURIComponent('Re: Votre demande Pirabel Labs')}`,
  });
}

// --- MISE À JOUR DE PROJET (client) ---
function projectUpdateEmail(clientName, projectName, update, progress) {
  const pct = Math.max(0, Math.min(100, Number(progress) || 0));
  return masterTemplate({
    preheader: `Mise à jour : ${projectName}`,
    title: 'Votre projet avance',
    subtitle: projectName,
    body: `
      <p style="${S.p}">Bonjour ${clientName},</p>
      <p style="${S.p}">Voici la dernière mise à jour de votre projet :</p>
      <div style="${S.note}"><p style="margin:0;font-size:15px;line-height:1.65;color:${C.text};">${update}</p></div>
      ${progress !== undefined ? `
      <p style="margin:0 0 8px;${S.label}">Progression · <span style="color:${C.accentText};">${pct}&nbsp;%</span></p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;"><tr>
        <td style="height:10px;background:${C.accent};border-radius:10px 0 0 10px;width:${pct}%;font-size:0;">&nbsp;</td>
        <td style="height:10px;background:${C.lineSoft};border-radius:0 10px 10px 0;font-size:0;">&nbsp;</td>
      </tr></table>` : ''}`,
    cta: 'Voir mon projet',
    ctaUrl: `${SITE()}/espace-client`,
  });
}

// --- FACTURE (client) ---
function invoiceEmail(clientName, invoiceNumber, amount, dueDate) {
  return masterTemplate({
    preheader: `Facture ${invoiceNumber} — ${amount}`,
    title: 'Votre facture',
    subtitle: invoiceNumber,
    body: `
      <p style="${S.p}">Bonjour ${clientName},</p>
      <p style="${S.p}">Votre facture est disponible :</p>
      ${infoTable([['Facture', invoiceNumber], ['Montant', `<strong style="font-size:20px;color:${C.accentText};">${amount}</strong>`], dueDate ? ['Échéance', dueDate] : null])}`,
    cta: 'Voir ma facture',
    ctaUrl: `${SITE()}/espace-client`,
  });
}

// --- PROSPECTION / CAMPAGNE ---
// Aucun chiffre ni témoignage générique : seuls ceux fournis explicitement (et vérifiables) sont affichés.
function prospectionEmail(recipientName, options = {}) {
  const { headline, intro, services, offer, urgency, stats, testimonial } = options;
  const servicesHTML = services ? services.map((s) => `<div style="${S.note}"><strong style="${S.strong}">${s.name}</strong><br><span style="font-size:14px;color:${C.muted};">${s.desc}</span></div>`).join('') : '';
  return masterTemplate({
    headerType: 'hero',
    preheader: headline || 'Une opportunité pour votre croissance digitale',
    title: headline || 'Faisons grandir votre activité en ligne',
    subtitle: offer || null,
    body: `
      <p style="${S.p}">Bonjour ${recipientName || ''},</p>
      <p style="${S.p}">${intro || 'Voici ce que nous pouvons faire ensemble, concrètement :'}</p>
      ${servicesHTML}
      ${urgency ? `<div style="${S.box}"><p style="margin:0;color:${C.accentText};font-weight:700;font-size:15px;">${urgency}</p></div>` : ''}`,
    cta: 'Demander un audit gratuit',
    ctaUrl: `${SITE()}/contact`,
    ctaSecondary: 'Voir nos réalisations',
    ctaSecondaryUrl: `${SITE()}/realisations`,
    stats: stats || null,
    testimonial: testimonial || null,
  });
}

// --- NEWSLETTER ---
function newsletterEmail(recipientName, options = {}) {
  const { subject_line, articles } = options;
  const articlesHTML = articles ? articles.map((a) => `
    <div style="border-bottom:1px solid ${C.line};padding:18px 0;">
      <span style="${S.badge}font-size:11px;text-transform:uppercase;letter-spacing:.06em;">${a.tag}</span>
      <h3 style="margin:10px 0 6px;font-size:19px;line-height:1.35;font-weight:700;color:${C.text};">${a.title}</h3>
      <p style="margin:0 0 10px;font-size:15px;color:${C.text2};line-height:1.6;">${a.excerpt}</p>
      <a href="${a.url || SITE() + '/blog'}" style="${S.link}text-decoration:none;">Lire l’article &rarr;</a>
    </div>`).join('') : '';
  return masterTemplate({
    preheader: subject_line || 'Nos derniers conseils pour votre croissance en ligne',
    title: subject_line || 'Les nouveautés du mois',
    subtitle: 'Newsletter Pirabel Labs',
    body: `
      <p style="${S.p}">Bonjour ${recipientName || ''},</p>
      <p style="${S.p}">Voici notre sélection de ressources pour faire grandir votre activité ce mois-ci :</p>
      ${articlesHTML}`,
    cta: 'Voir tous nos articles',
    ctaUrl: `${SITE()}/blog`,
  });
}

// ========================================
// SEND FUNCTIONS
// ========================================

async function sendEmail(to, subject, html, opts = {}) {
  if (!RESEND_API_KEY) {
    console.error('[email] MISSING RESEND_API_KEY env var - cannot send email to', to);
    return false;
  }
  if (!to) {
    console.error('[email] missing recipient (to) for subject:', subject);
    return false;
  }
  try {
    // Resend expects "to" as array
    const toArray = Array.isArray(to) ? to : [to];
    const payload = {
      from: opts.from || FROM(),
      to: toArray,
      subject,
      html,
    };
    if (opts.replyTo) payload.reply_to = opts.replyTo;
    // Pieces jointes (format Resend) : [{ filename, content }] ou content est en base64.
    if (Array.isArray(opts.attachments) && opts.attachments.length) {
      payload.attachments = opts.attachments
        .filter(a => a && a.filename && a.content)
        .map(a => ({ filename: String(a.filename).slice(0, 200), content: a.content }));
    }
    if (opts.cc) payload.cc = Array.isArray(opts.cc) ? opts.cc : [opts.cc];
    if (opts.bcc) payload.bcc = Array.isArray(opts.bcc) ? opts.bcc : [opts.bcc];
    // Délivrabilité (exigences Gmail/Yahoo) : en-têtes de désabonnement + Reply-To par défaut
    payload.headers = Object.assign({
      'List-Unsubscribe': '<mailto:contact@pirabellabs.com?subject=desabonnement>, <' + SITE() + '/contact>',
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    }, opts.headers || {});
    if (!payload.reply_to) payload.reply_to = clean(process.env.FROM_EMAIL) || 'contact@pirabellabs.com';
    // Version texte (multipart) : meilleur placement en boîte de réception (moins de spam)
    payload.text = opts.text || String(html)
      .replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n').replace(/<br\s*\/?\>/gi, '\n')
      .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
      .replace(/&[a-z]+;/gi, ' ').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, 6000);

    // Vercel serverless: AbortController for 9s timeout
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    let resp, body;
    try {
      resp = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      body = await resp.json().catch(() => ({}));
    } finally {
      clearTimeout(timer);
    }

    if (!resp.ok) {
      console.error(`[email] FAIL to=${to} subject="${subject}" status=${resp.status} name=${body.name} msg=${body.message}`);
      return false;
    }

    // Journal sans données personnelles : adresse masquée, pas d'objet (il peut contenir un nom).
    const masked = String(to).replace(/^(.).*?(@.*)$/, '$1***$2');
    console.log(`[email] OK to=${masked} id=${body.id}`);
    return opts.returnInfo
      ? { messageId: body.id, accepted: toArray, rejected: [], resend: body }
      : true;
  } catch (err) {
    console.error(`[email] FAIL to=${to} subject="${subject}" error=${err.name} message=${err.message}`);
    return false;
  }
}

async function sendOTP(email, code) {
  return sendEmail(email, `Votre code Pirabel Labs : ${code}`, otpEmail(code));
}

async function notifyNewOrder(order) {
  return sendEmail(ADMIN_EMAIL(), `Nouvelle demande : ${order.name} — ${order.service}`, newOrderEmail(order));
}

async function notifyProjectUpdate(clientEmail, clientName, projectName, update, progress) {
  return sendEmail(clientEmail, `Mise à jour : ${projectName}`, projectUpdateEmail(clientName, projectName, update, progress));
}

async function sendInvoiceNotification(clientEmail, clientName, invoiceNumber, amount, dueDate) {
  return sendEmail(clientEmail, `Facture ${invoiceNumber}`, invoiceEmail(clientName, invoiceNumber, amount, dueDate));
}

async function sendWelcome(email, name) {
  return sendEmail(email, `Bienvenue chez Pirabel Labs, ${name} !`, welcomeEmail(name));
}

async function sendProspection(email, name, options) {
  return sendEmail(email, options.headline || 'Faisons grandir votre activité en ligne', prospectionEmail(name, options));
}

async function sendNewsletter(email, name, options) {
  return sendEmail(email, options.subject_line || 'Pirabel Labs — Les nouveautés du mois', newsletterEmail(name, options));
}

// --- RECRUTEMENT : NOUVELLE CANDIDATURE (admin) ---
function newApplicationAdminEmail(app, job) {
  const link = (url, label) => (url ? `<a href="${url}" style="${S.link}">${label}</a>` : '—');
  return masterTemplate({
    preheader: `Nouvelle candidature de ${app.name} pour ${job.title}`,
    title: 'Nouvelle candidature',
    subtitle: `${job.title} · ${new Date().toLocaleDateString('fr-FR')}`,
    body: `
      ${infoTable([
        ['Candidat', `<strong>${app.name}</strong>`],
        ['E-mail', `<a href="mailto:${app.email}" style="${S.link}">${app.email}</a>`],
        ['Téléphone', app.phone || 'Non renseigné'],
        ['LinkedIn', link(app.linkedin, 'Voir le profil')],
        ['Portfolio', link(app.portfolio, 'Voir le portfolio')],
        ['CV', app.cvUrl ? link(app.cvUrl, app.cvFilename || 'Télécharger') : 'Non fourni'],
        ['Poste', `<span style="${S.badge}">${job.title}</span>`],
      ])}
      ${app.coverLetter ? `<div style="${S.note}"><p style="margin:0 0 8px;${S.label}">Lettre de motivation</p><p style="margin:0;font-size:15px;line-height:1.7;color:${C.text};">${app.coverLetter.replace(/\n/g, '<br>')}</p></div>` : ''}`,
    cta: 'Ouvrir le tableau de bord',
    ctaUrl: `${SITE()}/admin/dashboard`,
    ctaSecondary: 'Répondre au candidat',
    ctaSecondaryUrl: `mailto:${app.email}?subject=${encodeURIComponent('Re: Votre candidature — ' + job.title)}`,
  });
}

// --- RECRUTEMENT : ACCUSÉ DE RÉCEPTION (candidat) ---
function applicationConfirmationEmail(candidateName, jobTitle) {
  const step = (n, t) => `<tr><td style="padding:10px 0;vertical-align:top;width:40px;"><span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;background:${C.soft};border:1px solid ${C.softLine};color:${C.accentText};font-weight:800;font-size:13px;">${n}</span></td><td style="padding:10px 0;font-size:15px;line-height:1.55;color:${C.text2};">${t}</td></tr>`;
  return masterTemplate({
    headerType: 'hero',
    preheader: `Candidature reçue pour ${jobTitle}`,
    title: 'Candidature bien reçue !',
    subtitle: `Poste : ${jobTitle}`,
    body: `
      <p style="${S.p}">Bonjour ${candidateName},</p>
      <p style="${S.p}">Nous avons bien reçu votre candidature pour le poste de <strong style="${S.strong}">${jobTitle}</strong>. Merci de l’intérêt que vous portez à Pirabel Labs !</p>
      <p style="margin:0 0 6px;${S.label}">Prochaines étapes</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        ${step(1, 'Examen de votre dossier par notre équipe')}
        ${step(2, 'Présélection et réponse sous 7 jours ouvrés')}
        ${step(3, 'Entretien si votre profil est retenu')}
      </table>
      <p style="${S.small}">Une question ? Écrivez-nous à <a href="mailto:contact@pirabellabs.com" style="${S.link}">contact@pirabellabs.com</a>.</p>`,
    cta: 'Découvrir Pirabel Labs',
    ctaUrl: `${SITE()}/a-propos`,
  });
}

// --- RECRUTEMENT : CHANGEMENT DE STATUT (candidat) ---
const STATUS_MESSAGES = {
  en_revue: {
    subject: 'Votre candidature est en cours d’examen',
    headline: 'En cours d’examen',
    color: '#7c3aed',
    message: 'Bonne nouvelle : notre équipe examine actuellement votre candidature avec attention. Vous recevrez une réponse dans les prochains jours.',
  },
  preselectionne: {
    subject: 'Vous êtes présélectionné(e) !',
    headline: 'Félicitations, vous êtes présélectionné(e) !',
    color: '#c2410c',
    message: 'Excellente nouvelle : votre profil a été présélectionné. Nous vous contacterons très prochainement pour la suite du processus.',
  },
  entretien: {
    subject: 'Invitation à un entretien — Pirabel Labs',
    headline: 'Invitation à un entretien',
    color: '#FF5500',
    message: 'Nous avons le plaisir de vous inviter à un entretien. Nous vous contacterons sous 24 h pour convenir d’un créneau.',
  },
  test: {
    subject: 'Exercice technique — Pirabel Labs',
    headline: 'Phase de test technique',
    color: '#0f766e',
    message: 'Votre candidature progresse ! Nous vous envoyons un exercice technique pour évaluer vos compétences : les instructions détaillées suivent par e-mail.',
  },
  accepte: {
    subject: '🎉 Votre candidature est acceptée !',
    headline: 'Bienvenue dans l’équipe !',
    color: '#15803d',
    message: 'Félicitations ! Votre candidature a été retenue. Nous vous contacterons dans les prochaines 24 h pour organiser votre arrivée.',
  },
  refuse: {
    subject: 'Suite de votre candidature — Pirabel Labs',
    headline: 'Réponse à votre candidature',
    color: '#8a7f78',
    message: 'Merci sincèrement pour l’intérêt que vous portez à Pirabel Labs et pour le temps consacré à votre candidature. Après examen attentif, nous ne pouvons malheureusement pas y donner une suite favorable pour ce poste. Nous conservons votre profil et reviendrons vers vous pour de futures opportunités.',
  },
};

function applicationStatusEmail(candidateName, jobTitle, status, customNote) {
  const cfg = STATUS_MESSAGES[status] || { subject: 'Mise à jour de votre candidature', headline: 'Mise à jour', color: '#FF5500', message: 'Votre candidature a été mise à jour.' };
  return masterTemplate({
    preheader: cfg.subject,
    title: cfg.headline,
    subtitle: `Poste : ${jobTitle}`,
    body: `
      <div style="border-left:4px solid ${cfg.color};background:${C.box};border-radius:0 12px 12px 0;padding:14px 20px;margin:0 0 22px;">
        <p style="margin:0 0 4px;${S.label}">Mise à jour de votre candidature</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:${C.text};">${cfg.headline}</p>
      </div>
      <p style="${S.p}">Bonjour ${candidateName},</p>
      <p style="${S.p}">${cfg.message}</p>
      ${customNote ? `<div style="${S.note}"><p style="margin:0 0 6px;${S.label}">Note de notre équipe</p><p style="margin:0;font-size:15px;line-height:1.65;color:${C.text};">${customNote.replace(/\n/g, '<br>')}</p></div>` : ''}
      <p style="${S.small}">Une question ? Écrivez-nous à <a href="mailto:contact@pirabellabs.com" style="${S.link}">contact@pirabellabs.com</a>.</p>`,
    cta: status === 'accepte' ? 'Découvrir l’équipe' : 'Voir nos autres offres',
    ctaUrl: status === 'accepte' ? `${SITE()}/a-propos` : `${SITE()}/carrieres`,
    footer_extra: `<p style="margin:0 0 14px;"><span style="${S.badge}">Candidature · ${jobTitle}</span></p>`,
  });
}

async function notifyNewApplication(app, job) {
  return sendEmail(ADMIN_EMAIL(), `🔔 Nouvelle candidature : ${app.name} — ${job.title}`, newApplicationAdminEmail(app, job));
}

async function sendApplicationConfirmation(candidateEmail, candidateName, jobTitle) {
  return sendEmail(candidateEmail, `Candidature reçue — ${jobTitle} | Pirabel Labs`, applicationConfirmationEmail(candidateName, jobTitle));
}

async function sendApplicationStatusUpdate(candidateEmail, candidateName, jobTitle, status, note) {
  const cfg = STATUS_MESSAGES[status];
  if (!cfg) return false; // pas d'envoi pour le statut initial « nouveau »
  return sendEmail(candidateEmail, cfg.subject + ' — Pirabel Labs', applicationStatusEmail(candidateName, jobTitle, status, note));
}

// --- DEMANDES : SUIVI AUTOMATIQUE ---
async function sendOrderStatusUpdate(order, newStatus) {
  let subject; let content;
  if (newStatus === 'en_traitement') {
    subject = 'Votre demande est en cours d’analyse — Pirabel Labs';
    content = `Nous avons bien reçu votre demande concernant <strong style="${S.strong}">${order.service}</strong>. Nous étudions vos besoins avec attention et revenons vers vous très vite avec une proposition adaptée.`;
  } else if (newStatus === 'acceptee') {
    subject = 'Bienvenue chez Pirabel Labs !';
    content = `Nous sommes ravis de vous compter parmi nos clients ! Votre demande pour <strong style="${S.strong}">${order.service}</strong> est validée : nous vous contactons rapidement pour organiser le lancement du projet.`;
  } else if (newStatus === 'refusee') {
    subject = 'Suite à votre demande — Pirabel Labs';
    content = `Après étude de votre demande pour <strong style="${S.strong}">${order.service}</strong>, nous ne pouvons malheureusement pas y donner suite pour le moment : notre planning ne nous permet pas de vous garantir le niveau de qualité que vous méritez. Merci sincèrement pour votre confiance, et belle réussite pour votre projet.`;
  } else {
    return false;
  }
  const html = masterTemplate({
    title: subject.replace(/ — Pirabel Labs$/, ''),
    body: `<p style="${S.p}">Bonjour ${order.name},</p><p style="${S.p}">${content}</p>`,
    cta: 'Voir nos réalisations',
    ctaUrl: `${SITE()}/realisations`,
  });
  return sendEmail(order.email, subject, html);
}

async function sendQuoteInteraction(order) {
  const subject = `Votre devis pour ${order.service} est prêt`;
  const urlRdv = `${SITE()}/rdv`;
  const urlModif = `mailto:contact@pirabellabs.com?subject=${encodeURIComponent('Modification de mon devis — ' + order.service)}`;
  const html = masterTemplate({
    headerType: 'hero',
    preheader: 'Votre proposition Pirabel Labs',
    title: 'Votre devis sur mesure',
    subtitle: `Projet : ${order.service}`,
    body: `
      <p style="${S.p}">Bonjour ${order.name},</p>
      <p style="${S.p}">Suite à l’analyse de votre besoin pour <strong style="${S.strong}">${order.service}</strong>, voici notre proposition détaillée.</p>
      <div style="${S.box}">
        <p style="margin:0 0 6px;font-size:17px;font-weight:700;color:${C.text};">Comment souhaitez-vous continuer ?</p>
        <p style="margin:0;font-size:15px;color:${C.text2};">Planifiez un appel pour valider ensemble, ou demandez une modification.</p>
      </div>
      <p style="${S.small}">Le détail financier est joint à cet e-mail ou vous sera envoyé par votre interlocuteur.</p>`,
    cta: 'Planifier un appel',
    ctaUrl: urlRdv,
    ctaSecondary: 'Demander une modification',
    ctaSecondaryUrl: urlModif,
  });
  return sendEmail(order.email, subject, html);
}

async function sendMeetingReminder(appointment) {
  const where = appointment.meetingLink || appointment.location || 'voir votre agenda';
  const html = masterTemplate({
    title: 'Votre rendez-vous approche',
    subtitle: appointment.title ? `Sujet : ${appointment.title}` : null,
    body: `
      <p style="${S.p}">Bonjour ${(appointment.with && appointment.with.name) || ''},</p>
      <p style="${S.p}">Petit rappel : notre appel commence dans 30 minutes.</p>
      ${infoTable([['Lien ou lieu', where]])}
      <p style="${S.p}">À tout de suite !</p>`,
    cta: appointment.meetingLink ? 'Rejoindre la réunion' : null,
    ctaUrl: appointment.meetingLink || SITE(),
  });
  return sendEmail(appointment.with && appointment.with.email, 'Rappel : notre appel dans 30 minutes', html);
}

// --- RENDEZ-VOUS : CONFIRMATION ---
function appointmentConfirmationEmail(appt) {
  const token = appt.publicToken || appt.secretToken || '';
  const manageUrl = token ? `${SITE()}/rdv/${encodeURIComponent(token)}` : `${SITE()}/contact#rdv`;
  const dateStr = new Date(appt.date).toLocaleString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris',
  });
  return masterTemplate({
    headerType: 'hero',
    preheader: 'Votre rendez-vous avec Pirabel Labs est confirmé',
    title: 'Rendez-vous confirmé',
    subtitle: appt.title,
    body: `
      <p style="${S.p}">Bonjour <strong style="${S.strong}">${(appt.with && appt.with.name) || ''}</strong>,</p>
      <p style="${S.p}">Votre rendez-vous est bien enregistré. Nous avons hâte d’échanger avec vous sur votre projet.</p>
      ${infoTable([['Date et heure', `<span style="text-transform:capitalize;">${dateStr}</span> (heure de Paris)`], ['Format', appt.location || 'Visioconférence'], appt.notes ? ['Notes', appt.notes] : null])}
      <p style="${S.small}">Un empêchement ? Vous pouvez déplacer ou annuler votre rendez-vous à tout moment.</p>`,
    cta: 'Gérer mon rendez-vous',
    ctaUrl: manageUrl,
  });
}

async function sendAppointmentConfirmation(email, appt) {
  return sendEmail(email, 'Confirmation de votre rendez-vous — Pirabel Labs', appointmentConfirmationEmail(appt));
}

// Ancien raccourci pour les campagnes
function emailTemplate(title, content, ctaText, ctaUrl) {
  return masterTemplate({ title, body: content, cta: ctaText, ctaUrl });
}

module.exports = {
  sendEmail, sendOTP, notifyNewOrder, notifyProjectUpdate,
  sendInvoiceNotification, sendWelcome, sendProspection, sendNewsletter,
  notifyNewApplication, sendApplicationConfirmation, sendApplicationStatusUpdate,
  sendAppointmentConfirmation,
  sendOrderStatusUpdate, sendQuoteInteraction, sendMeetingReminder,
  emailTemplate, masterTemplate, newOrderEmail, infoTable, EMAIL_STYLES: S, EMAIL_COLORS: C,
  prospectionEmail, newsletterEmail, welcomeEmail,
  applicationStatusEmail, applicationConfirmationEmail, newApplicationAdminEmail,
  STATUS_MESSAGES,
};
