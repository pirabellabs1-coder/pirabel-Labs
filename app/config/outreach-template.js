/**
 * Professional cold-outreach email template with CTA buttons.
 * Dark-theme, brand-aligned (Pirabel Labs), mobile-responsive.
 *
 * Usage:
 *   const { wrap } = require('./outreach-template');
 *   const html = wrap({
 *     body: '<p>Bonjour Sylvain,</p>...',
 *     primaryCta: { label: 'Réserver un appel de 15 min', url: 'https://.../calendly' },
 *     secondaryCta: { label: 'Voir nos résultats', url: 'https://www.pirabellabs.com/resultats' },
 *     lang: 'fr' // or 'en'
 *   });
 */

const SITE = () => (process.env.SITE_URL || 'https://www.pirabellabs.com').trim();
const SIGNATURE = {
  fr: {
    name: 'Gildas Lissanon',
    role: 'Fondateur · Pirabel Labs',
    tagline: 'Agence digitale 360° — SEO · IA · Web · Branding',
    email: 'contact@pirabellabs.com'
  },
  en: {
    name: 'Gildas Lissanon',
    role: 'Founder · Pirabel Labs',
    tagline: '360° Digital Agency — SEO · AI · Web · Branding',
    email: 'contact@pirabellabs.com'
  }
};

const UNSUB = {
  fr: 'Si vous ne souhaitez plus recevoir de message de notre part, répondez simplement "retirer" à cet email — nous vous retirerons immédiatement.',
  en: 'If you would rather not hear from us again, just reply with "remove" and we will take you off our list immediately.'
};

function wrap(opts = {}) {
  const lang = opts.lang === 'en' ? 'en' : 'fr';
  const sig = SIGNATURE[lang];
  const bodyHTML = opts.body || '';
  const primary = opts.primaryCta;
  const secondary = opts.secondaryCta;
  const preheader = opts.preheader || '';

  const ctaBlock = `
    ${primary ? `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:28px auto 8px;">
      <tr>
        <td align="center" bgcolor="#FF5500" style="background:#FF5500;padding:0;">
          <a href="${esc(primary.url)}" style="display:inline-block;padding:16px 36px;color:#111 !important;background:#FF5500;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:1px;text-transform:uppercase;line-height:1;">${esc(primary.label)}</a>
        </td>
      </tr>
    </table>` : ''}
    ${secondary ? `
    <p style="text-align:center;margin:8px 0 0;">
      <a href="${esc(secondary.url)}" style="color:#FF5500;font-size:13px;text-decoration:underline;font-family:'Helvetica Neue',Arial,sans-serif;">${esc(secondary.label)}</a>
    </p>` : ''}
  `;

  return `<!DOCTYPE html>
<html lang="${lang}"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Pirabel Labs</title>
${preheader ? `<span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;max-height:0;max-width:0;mso-hide:all;">${esc(preheader)}</span>` : ''}
<style>
  body { margin:0; padding:0; background:#141313; }
  a { color:#FF5500; }
  @media (max-width:600px) {
    .wrap { width:100% !important; }
    .px { padding-left:24px !important; padding-right:24px !important; }
    h1 { font-size:22px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#141313;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#141313;">
  <tr><td align="center" style="padding:36px 16px;">
    <table role="presentation" width="600" class="wrap" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#1a1a1a;border:1px solid rgba(255,85,0,0.15);">

      <!-- Header -->
      <tr><td class="px" style="padding:24px 40px;border-bottom:1px solid rgba(255,255,255,0.06);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-family:'Helvetica Neue',Arial,sans-serif;">
            <span style="display:inline-block;font-size:12px;font-weight:800;letter-spacing:3px;color:#FF5500;text-transform:uppercase;">PIRABEL&nbsp;LABS</span>
          </td>
          <td align="right" style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:1.5px;">
            ${lang === 'en' ? 'Premium Digital Agency' : 'Agence digitale premium'}
          </td>
        </tr></table>
      </td></tr>

      <!-- Body -->
      <tr><td class="px" style="padding:40px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.7;color:rgba(229,226,225,0.85);">
        ${bodyHTML}
        ${ctaBlock}
      </td></tr>

      <!-- Signature divider + signature -->
      <tr><td class="px" style="padding:0 40px 36px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;">
          <tr><td style="font-family:'Helvetica Neue',Arial,sans-serif;">
            <p style="margin:0;font-size:15px;color:#e5e2e1;font-weight:600;">${esc(sig.name)}</p>
            <p style="margin:2px 0 0;font-size:13px;color:rgba(229,226,225,0.6);">${esc(sig.role)}</p>
            <p style="margin:2px 0 0;font-size:12px;color:rgba(229,226,225,0.4);">${esc(sig.tagline)}</p>
            <p style="margin:10px 0 0;font-size:12px;">
              <a href="${SITE()}" style="color:#FF5500;text-decoration:none;">pirabellabs.com</a>
              <span style="color:rgba(229,226,225,0.3);"> · </span>
              <a href="mailto:${esc(sig.email)}" style="color:rgba(229,226,225,0.5);text-decoration:none;">${esc(sig.email)}</a>
            </p>
          </td></tr>
        </table>
      </td></tr>

      <!-- Footer / unsub -->
      <tr><td class="px" style="padding:18px 40px;background:#0e0e0e;">
        <p style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;line-height:1.5;color:rgba(229,226,225,0.35);">
          ${esc(UNSUB[lang])}
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { wrap };
