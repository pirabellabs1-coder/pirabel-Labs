// Habillage « liquid glass » partagé par les pages rendues côté serveur (Express) :
// blog, réalisations, témoignages, carrières, prise de rendez-vous.
// Produit EXACTEMENT le même balisage que src/components/layout/Header.astro,
// Footer.astro et src/layouts/BaseLayout.astro (mêmes classes, mêmes scripts de tête).
// Source unique des données : app/site-nav.json (aussi lue par les pages Astro).
// Styles : /css/site.css (généré au build Astro depuis src/styles/global.css + chrome.css).
'use strict';

const data = require('./site-nav.json');

const SITE = data.SITE;
const NAV = data.NAV || [];
const FOOTER_COLS = data.FOOTER_COLS || [];

// Version des ressources statiques (/css, /js, /img servis avec un cache d'un an) :
// empreinte du commit ET du déploiement (un redéploiement en ligne de commande, sans
// commit, change aussi la version), sinon « dev » en local.
const VER_SRC = [process.env.VERCEL_GIT_COMMIT_SHA, process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_URL].filter(Boolean).join(':');
const VER = VER_SRC ? require('crypto').createHash('sha256').update(VER_SRC).digest('hex').slice(0, 10) : 'dev';

// Polices auto-hébergées : /css/site.css les déclare en font-display: optional avec des noms
// hachés par Vite (/_astro/inter-….woff2). Sans préchargement, une première visite garde les
// polices de repli. On lit donc leurs URL dans la feuille publiée, sans rien coder en dur :
// d'abord sur le disque (dev local, dist/ présent), sinon auprès du déploiement en cours.
// Tant que les URL ne sont pas connues, la page est simplement rendue sans préchargement.
let FONT_URLS = [];
const parseFonts = (css) => [...new Set(String(css).match(/\/_astro\/[\w.-]+\.woff2/g) || [])].slice(0, 3);
(function discoverFonts() {
  try {
    FONT_URLS = parseFonts(require('fs').readFileSync(require('path').join(__dirname, '..', 'dist', 'css', 'site.css'), 'utf8'));
    if (FONT_URLS.length) return;
  } catch (e) { /* pas de dist/ dans la fonction serverless */ }
  const host = process.env.VERCEL_ENV === 'production'
    ? (process.env.SITE_URL || SITE.url)
    : (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : '');
  if (!host || typeof fetch !== 'function') return;
  fetch(String(host).replace(/\/$/, '') + '/css/site.css?v=' + VER, { signal: AbortSignal.timeout(4000) })
    .then((r) => (r.ok ? r.text() : ''))
    .then((css) => { const u = parseFonts(css); if (u.length) FONT_URLS = u; })
    .catch(() => { /* sans préchargement : rendu identique, polices de repli à la 1re visite */ });
})();

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Icône du sprite public /img/icons.svg (décorative, aria-hidden). Noms : clés de src/data/icons.ts. */
function icon(name, size = 18, cls = '', ver = VER) {
  const id = String(name || 'sparkles').replace(/[^a-z0-9-]/gi, '');
  return '<svg class="icon' + (cls ? ' ' + esc(cls) : '') + '" width="' + (+size || 18) + '" height="' + (+size || 18) +
    '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="/img/icons.svg?v=' + esc(ver) + '#i-' + id + '"/></svg>';
}

const LOGO_MARK = '<svg class="logomark" width="34" height="34" viewBox="0 0 120 120" aria-hidden="true" focusable="false">' +
  '<g fill="none" stroke="#FF5500" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M30 78 L48 60 L30 42" opacity="0.42"/><path d="M52 84 L74 62 L52 40" opacity="0.72"/><path d="M76 90 L102 64 L76 38"/></g></svg>';

/**
 * Découpe un titre en mots (équivalent de src/components/ui/Split.astro) pour la
 * révélation mot par mot en CSS. `html` est du balisage de confiance (constante).
 */
function split(html) {
  const tokens = String(html).match(/<([a-z0-9]+)\b[^>]*>[\s\S]*?<\/\1>|<[^>]+>|[^<]+/gi) || [];
  let i = 0;
  const w = (t) => '<span class="w"><span class="wi" style="--wi:' + (i++) + '">' + t + '</span></span>';
  return tokens.map((t) => {
    if (t.startsWith('<')) return w(t);
    return t.split(/( +)/).map((part) => (!part ? '' : /^ +$/.test(part) ? ' ' : w(part))).join('');
  }).join('');
}

// ---------------------------------------------------------------------------
// <head> commun : thème avant affichage, drapeau d'animation, feuille de style,
// Google Analytics 4 (consentement refusé par défaut, bibliothèque différée).
// Les balises propres à la page (title, description, canonical, OG, JSON-LD)
// sont ajoutées par l'appelant.
// opts.tracking === false : ni Google Analytics ni bandeau cookies (pages dont l'URL porte un
// jeton secret, ex. /rdv/:token — l'adresse ne doit pas partir chez un tiers).
// ---------------------------------------------------------------------------
function head(ver = VER, opts) {
  const v = esc(ver);
  const tracking = !opts || opts.tracking !== false;
  return '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' +
    '<meta name="theme-color" content="#0E0E0E">' +
    // Thème appliqué avant le premier affichage (pas de flash) : choix mémorisé, sinon préférence du système.
    '<script>(function(){var d=document.documentElement,t=null;try{t=localStorage.getItem("pl_theme")}catch(e){}if(t!=="light"&&t!=="dark"){t="dark"}d.setAttribute("data-theme",t);var m=document.querySelector(\'meta[name="theme-color"]\');if(m)m.content=t==="light"?"#F6F3EF":"#0E0E0E"})();</script>' +
    // Devise des prix : euro par défaut, franc CFA en zone franc (mémorisé par site-chrome.js).
    '<script>(function(){try{if(localStorage.getItem("pl_cur")==="xof")document.documentElement.setAttribute("data-cur","xof")}catch(e){}})();</script>' +
    // Animations complètes par défaut ; mode doux seulement sur choix du visiteur (pl_motion = soft) ; filet de sécurité à 3,5 s.
    '<script>(function(){var d=document.documentElement;try{var f=null;try{f=localStorage.getItem("pl_motion")}catch(e){}if(f==="soft"){d.classList.add("motion-soft")}if("IntersectionObserver" in window){d.classList.add("motion-ok");setTimeout(function(){if(!window.__motionReady){d.classList.remove("motion-ok")}},3500)}}catch(e){}})();</script>' +
    '<link rel="icon" type="image/png" href="' + esc(SITE.logo) + '">' +
    '<link rel="apple-touch-icon" href="' + esc(SITE.logo) + '">' +
    '<meta property="og:site_name" content="Pirabel Labs">' +
    '<meta property="og:locale" content="fr_FR">' +
    FONT_URLS.map((u) => '<link rel="preload" as="font" type="font/woff2" href="' + esc(u) + '" crossorigin>').join('') +
    '<link rel="stylesheet" href="/css/site.css?v=' + v + '">' +
    (!tracking ? '' : '<script>(function(){var done=false,ev=["scroll","pointerdown","keydown","touchstart"];function f(){if(done)return;done=true;ev.forEach(function(e){removeEventListener(e,f)});var s=document.createElement("script");s.async=true;s.src="https://www.googletagmanager.com/gtag/js?id=' + esc(SITE.gaId) + '";document.head.appendChild(s)}ev.forEach(function(e){addEventListener(e,f,{once:true,passive:true})});addEventListener("load",function(){setTimeout(f,5000)})})();</script>' +
    '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("consent","default",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied",wait_for_update:500});try{if(localStorage.getItem("pl_consent")==="granted"){gtag("consent","update",{analytics_storage:"granted"});}}catch(e){}gtag("js",new Date());gtag("config","' + esc(SITE.gaId) + '");</script>');
}

// ---------------------------------------------------------------------------
// Début du <body> : lien d'évitement, fond ambiant, barre de progression.
// ---------------------------------------------------------------------------
function bodyStart() {
  return '<a class="skip-link" href="#main">Aller au contenu</a>' +
    '<div class="ambient" aria-hidden="true"><div class="ambient__grid"></div><div class="ambient__orb ambient__orb--a"></div><div class="ambient__orb ambient__orb--b"></div><div class="ambient__grain"></div></div>' +
    '<div class="scroll-progress" aria-hidden="true"></div>';
}

// ---------------------------------------------------------------------------
// En-tête flottant : méga-menus (desktop) + tiroir en accordéon (mobile).
// ---------------------------------------------------------------------------
function header(opts) {
  const current = (opts && opts.current) || '';
  const ver = (opts && opts.ver) || VER;
  const ic = (n, s, c) => icon(n, s, c, ver);

  const megas = NAV.map((item) => {
    const groups = (item.groups || []).map((g) =>
      '<div class="mega__group">' + (g.title ? '<p class="mega__title">' + esc(g.title) + '</p>' : '') +
      '<ul class="mega__links">' + (g.links || []).map((l) =>
        '<li><a href="' + esc(l.href) + '" class="mega__link"' + (current && current === l.href ? ' aria-current="page"' : '') + '>' +
        (l.icon ? '<span class="mega__icon">' + ic(l.icon, 17) + '</span>' : '') +
        '<span class="mega__text"><span class="mega__label">' + esc(l.label) + '</span>' +
        (l.desc ? '<span class="mega__desc">' + esc(l.desc) + '</span>' : '') + '</span></a></li>').join('') +
      '</ul></div>').join('');
    const foot = item.footer
      ? '<a href="' + esc(item.footer.href) + '" class="mega__footer link-arrow">' + esc(item.footer.label) + ' ' + ic('arrow-right', 16) + '</a>' : '';
    return '<li class="mnav__item" data-mnav-item>' +
      '<button class="mnav__trigger" type="button" aria-expanded="false" aria-controls="mega-' + esc(item.id) + '" data-mnav-trigger>' +
      esc(item.label) + ' ' + ic('chevron-down', 15, 'mnav__chev') + '</button>' +
      '<div class="mega mega--' + esc(item.layout) + ' glass glass--strong glass--keep" id="mega-' + esc(item.id) + '" data-mnav-panel>' +
      '<div class="mega__grid">' + groups + '</div>' + foot + '</div></li>';
  }).join('');

  const drawerGroups = NAV.map((item) => {
    const links = [].concat(...(item.groups || []).map((g) => g.links || []));
    return '<details class="drawer__group"><summary>' + esc(item.label) + ic('chevron-down', 18) + '</summary>' +
      '<ul class="drawer__links">' + links.map((l) => '<li><a href="' + esc(l.href) + '">' + esc(l.label) + '</a></li>').join('') +
      (item.footer ? '<li><a href="' + esc(item.footer.href) + '" class="drawer__all">' + esc(item.footer.label) + ' →</a></li>' : '') +
      '</ul></details>';
  }).join('');

  return '<header class="site-header" data-header><div class="site-header__bar">' +
    // Couche de verre séparée : un parent avec backdrop-filter empêcherait le flou des méga-menus.
    '<span class="site-header__glass glass glass--strong glass--keep" aria-hidden="true"></span>' +
    '<a href="/" class="brand" aria-label="Pirabel Labs, retour à l’accueil">' + LOGO_MARK + '<span class="brand__name">Pirabel Labs</span></a>' +
    '<nav class="mnav" aria-label="Navigation principale"><ul class="mnav__list">' + megas + '</ul></nav>' +
    '<div class="site-header__actions">' +
    '<div class="lang-switch notranslate" translate="no" role="group" aria-label="Langue du site"><button type="button" data-l="fr" aria-pressed="true">FR</button><button type="button" data-l="en" aria-pressed="false">EN</button></div>' +
    '<button class="theme-toggle" type="button" data-theme-toggle aria-label="Passer en thème clair" title="Changer de thème">' +
    ic('sun', 18, 'theme-toggle__sun') + ic('moon', 18, 'theme-toggle__moon') + '</button>' +
    '<a href="/contact" class="btn btn--primary btn--sm site-header__cta">Démarrer un projet</a>' +
    '<button class="burger" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Ouvrir le menu" data-burger><span></span><span></span></button>' +
    '</div></div>' +
    '<div class="drawer" id="mobile-menu" data-drawer hidden><div class="drawer__panel glass glass--strong glass--keep" data-lenis-prevent>' +
    '<nav aria-label="Navigation mobile">' + drawerGroups + '</nav>' +
    '<div class="lang-switch lang-switch--drawer notranslate" translate="no" role="group" aria-label="Langue du site"><button type="button" data-l="fr" aria-pressed="true">Français</button><button type="button" data-l="en" aria-pressed="false">English</button></div>' +
    '<a href="/contact" class="btn btn--primary btn--lg drawer__cta">Démarrer un projet ' + ic('arrow-right', 18, 'icon--end') + '</a>' +
    '<div class="drawer__contact">' +
    '<a href="' + esc(SITE.whatsapp) + '" target="_blank" rel="noopener">' + ic('whatsapp', 18) + ' WhatsApp</a>' +
    '<a href="mailto:' + esc(SITE.email) + '">' + ic('mail', 18) + ' ' + esc(SITE.email) + '</a>' +
    '</div></div></div></header>';
}

// ---------------------------------------------------------------------------
// Pied de page : bloc d'appel à l'action (optionnel), colonnes, mot géant, mentions.
// ---------------------------------------------------------------------------
function footer(opts) {
  const showCta = !opts || opts.showCta !== false;
  const ver = (opts && opts.ver) || VER;
  const ic = (n, s, c) => icon(n, s, c, ver);
  const year = new Date().getFullYear();
  const cta = showCta
    ? '<section class="site-footer__cta container" aria-labelledby="footer-cta-title">' +
      '<div class="sf-cta glass glass--tint spot" data-reveal="scale" data-spot><div class="sf-cta__glow" aria-hidden="true"></div>' +
      '<p class="eyebrow">Réponse sous 24&nbsp;h</p>' +
      '<h2 id="footer-cta-title" class="sf-cta__title" data-reveal="title">' + split('Prêt à lancer votre&nbsp;projet&nbsp;?') + '</h2>' +
      '<p class="sf-cta__text">Deux minutes pour décrire votre besoin, un devis ferme sous 48&nbsp;h après notre échange. Sans engagement.</p>' +
      '<div class="sf-cta__actions">' +
      '<a href="/contact" class="btn btn--primary btn--lg">Démarrer mon projet ' + ic('arrow-right', 18, 'icon--end') + '</a>' +
      '<a href="' + esc(SITE.whatsapp) + '" class="btn btn--glass btn--lg" target="_blank" rel="noopener">' + ic('whatsapp', 18) + ' Écrire sur WhatsApp</a>' +
      '</div></div></section>'
    : '';
  const cols = FOOTER_COLS.map((col) =>
    '<nav class="site-footer__col" aria-label="' + esc(col.title) + '"><p class="site-footer__title">' + esc(col.title) + '</p><ul>' +
    (col.links || []).map((l) => '<li><a href="' + esc(l.href) + '">' + esc(l.label) + '</a></li>').join('') + '</ul></nav>').join('');

  return '<footer class="site-footer">' + cta +
    '<div class="container site-footer__main"><div class="site-footer__brand">' +
    '<a href="/" class="brand" aria-label="Pirabel Labs, retour à l’accueil">' + LOGO_MARK + '<span class="brand__name">Pirabel Labs</span></a>' +
    '<p>Agence marketing digital francophone pour PME ambitieuses. Sites web, SEO, réseaux sociaux, vidéo, automatisation, IA et SaaS, sous le même toit.</p>' +
    '<ul class="site-footer__social" aria-label="Réseaux et contact">' +
    '<li><a href="' + esc(SITE.whatsapp) + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + ic('whatsapp', 18) + '</a></li>' +
    '<li><a href="' + esc(SITE.facebook) + '" target="_blank" rel="noopener" aria-label="Facebook">' + ic('facebook', 18) + '</a></li>' +
    '<li><a href="' + esc(SITE.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram">' + ic('instagram', 17) + '</a></li>' +
    '<li><a href="' + esc(SITE.linkedin) + '" target="_blank" rel="noopener" aria-label="LinkedIn">' + ic('linkedin', 17) + '</a></li>' +
    '<li><a href="mailto:' + esc(SITE.email) + '" aria-label="E-mail">' + ic('mail', 18) + '</a></li>' +
    '<li><a href="' + esc(SITE.phoneHref) + '" aria-label="Téléphone ' + esc(SITE.phone) + '">' + ic('phone', 17) + '</a></li>' +
    '<li><a href="' + esc(SITE.phoneBJHref) + '" aria-label="Téléphone Bénin ' + esc(SITE.phoneBJ) + '">' + ic('phone', 17) + '</a></li>' +
    '</ul></div>' + cols + '</div>' +
    '<div class="site-footer__word" aria-hidden="true">PIRABEL LABS</div>' +
    '<div class="container site-footer__bottom"><span>© ' + year + ' Pirabel Labs · Tous droits réservés · <a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + '</a> · ' + esc(SITE.city) + '</span>' +
    '<span class="site-footer__links"><a href="/mentions-legales">Mentions légales</a><a href="/politique-confidentialite">Confidentialité</a><button type="button" class="motion-switch" data-motion-switch hidden>Réduire les animations</button></span></div>' +
    '</footer>';
}

// ---------------------------------------------------------------------------
// Fin du <body> : bandeau cookies, traduction FR/EN, apparitions au défilement,
// comportements de l'en-tête, suivi maison et assistant.
// ---------------------------------------------------------------------------
function end(ver = VER, opts) {
  const v = esc(ver);
  const tracking = !opts || opts.tracking !== false;
  return (!tracking ? '' : '<div id="pl-ck" class="pl-ck glass glass--strong glass--keep" hidden role="dialog" aria-label="Gestion des cookies">' +
    '<p>Nous utilisons des cookies de mesure d’audience (Google Analytics) pour améliorer le site. <a href="/politique-confidentialite">En savoir plus</a></p>' +
    '<div class="pl-ck__btns"><button type="button" id="plcA" class="btn btn--primary btn--sm">Accepter</button><button type="button" id="plcR" class="btn btn--glass btn--sm">Refuser</button></div></div>' +
    '<script>(function(){var c=null;try{c=localStorage.getItem("pl_consent")}catch(e){}if(c)return;var b=document.getElementById("pl-ck");if(!b)return;b.hidden=false;function set(v){try{localStorage.setItem("pl_consent",v)}catch(e){}if(v==="granted"&&window.gtag){gtag("consent","update",{analytics_storage:"granted"});}b.hidden=true;}document.getElementById("plcA").addEventListener("click",function(){set("granted")});document.getElementById("plcR").addEventListener("click",function(){set("denied")});})();</script>') +
    '<div id="google_translate_element" style="display:none"></div>' +
    '<script>function pirabelSetLang(l){var hn=location.hostname,reg=hn.split(".").slice(-2).join(".");function del(){var e="; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";["","; domain="+hn,"; domain=."+hn,"; domain="+reg,"; domain=."+reg].forEach(function(d){document.cookie="googtrans="+e+d;});}del();if(l!=="fr"){document.cookie="googtrans=/fr/"+l+"; path=/";document.cookie="googtrans=/fr/"+l+"; path=/; domain=."+reg;}location.reload();}function googleTranslateElementInit(){new google.translate.TranslateElement({pageLanguage:"fr",includedLanguages:"en,fr",autoDisplay:false},"google_translate_element");}(function(){var en=document.cookie.indexOf("/fr/en")>-1;if(en){var s=document.createElement("style");s.id="gtflash";s.textContent="body{opacity:0!important}";(document.head||document.documentElement).appendChild(s);var rv=function(){var x=document.getElementById("gtflash");if(x)x.remove();};var iv=setInterval(function(){if(/translated/.test(document.documentElement.className)){clearInterval(iv);setTimeout(rv,120);}},80);setTimeout(function(){clearInterval(iv);rv();},2500);var g=document.createElement("script");g.src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";g.defer=true;document.head.appendChild(g);}document.querySelectorAll(".lang-switch button").forEach(function(b){b.setAttribute("aria-pressed",((b.getAttribute("data-l")==="en")===en)?"true":"false");b.addEventListener("click",function(){pirabelSetLang(b.getAttribute("data-l"))});});})();</script>' +
    // Cœur du moteur d'animation (équivalent léger de src/scripts/motion.ts, sans GSAP) :
    // apparitions [data-reveal] / [data-inview], décalage [data-stagger], reflet .spot.
    '<script>(function(){window.__motionReady=true;var d=document.documentElement,ok=d.classList.contains("motion-ok");document.querySelectorAll("[data-stagger]").forEach(function(g){[].forEach.call(g.children,function(c,i){if(c.hasAttribute("data-reveal"))c.style.setProperty("--i",String(i%8))})});var els=document.querySelectorAll("[data-reveal],[data-inview]");if(!ok||!("IntersectionObserver" in window)){els.forEach(function(e){e.classList.add("is-in")})}else{var io=new IntersectionObserver(function(en){en.forEach(function(x){if(!x.isIntersecting)return;x.target.classList.add("is-in");io.unobserve(x.target)})},{rootMargin:"0px 0px -8% 0px",threshold:0});els.forEach(function(e){io.observe(e)})}if(!matchMedia("(hover: hover) and (pointer: fine)").matches)return;var fr=0,last=null;document.addEventListener("pointermove",function(e){last=e;if(fr)return;fr=requestAnimationFrame(function(){fr=0;var t=last&&last.target&&last.target.closest?last.target.closest(".spot"):null;if(!t)return;var r=t.getBoundingClientRect();t.style.setProperty("--mx",(last.clientX-r.left)+"px");t.style.setProperty("--my",(last.clientY-r.top)+"px")})},{passive:true})})();</script>' +
    '<script defer src="/js/site-chrome.js?v=' + v + '"></script>' +
    (!tracking ? '' : '<script defer src="/js/track.js?v=' + v + '"></script>' +
    '<script defer src="/js/chat-widget.js?v=' + v + '"></script>');
}

/**
 * Page complète. `headExtra` = balises propres à la page (title, meta, canonical, JSON-LD, <style>),
 * `bodyHtml` = contenu placé dans <main id="main">.
 * opts : { current: '/blog', showCta: true, tracking: true, ver }
 */
function page(headExtra, bodyHtml, opts) {
  const o = opts || {};
  const ver = o.ver || VER;
  return '<!doctype html><html lang="fr"><head>' + head(ver, o) + (headExtra || '') + '</head><body>' +
    bodyStart() + header({ current: o.current, ver }) +
    '<main id="main">' + (bodyHtml || '') + '</main>' +
    footer({ showCta: o.showCta, ver }) + end(ver, o) + '</body></html>';
}

module.exports = {
  VER, SITE, NAV, FOOTER_COLS,
  esc, icon, split, head, bodyStart, header, footer, end, page,
  // Compatibilité avec l'ancienne forme { html, js } (en-tête seul / scripts de fin).
  get html() { return header({}); },
  get js() { return end(VER); },
};
