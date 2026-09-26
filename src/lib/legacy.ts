/**
 * Conversion des pages HTML historiques (src/legacy/*.html) vers le gabarit Astro.
 *
 * Chaque ancienne page garde son contenu, son SEO (title, description, canonical,
 * Open Graph, JSON-LD) et ses scripts utiles, mais reçoit le nouvel en-tête / pied de
 * page, le thème clair / sombre, la typographie et le moteur d'animation.
 *
 * Styles historiques :
 *  - confinés sous `.lg` (le conteneur du contenu) pour ne pas toucher au nouveau design ;
 *  - couleurs converties en jetons de thème (--ink, --text, --bg…) pour que la
 *    « version blanche » fonctionne aussi sur ces pages ;
 *  - polices remappées sur les polices auto-hébergées.
 * Page par page, ces gabarits seront remplacés par des composants natifs.
 */
import fs from 'node:fs';
import path from 'node:path';
import postcss, { type Root, type Rule } from 'postcss';

const LEGACY_DIR = path.join(process.cwd(), 'src', 'legacy');
const LEGACY_GLOBAL_CSS = path.join(process.cwd(), 'public', 'css', 'global.css');

export type LegacyPage = {
  slug: string;
  title: string;
  description: string;
  path: string;
  robots: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  jsonLd: string[];
  hasBreadcrumbLd: boolean;
  css: string;
  iconFontCss: string;
  body: string;
  scripts: string;
};

/* ------------------------------------------------------------ Entités -- */
const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', eacute: 'é', egrave: 'è', ecirc: 'ê', euml: 'ë',
  agrave: 'à', acirc: 'â', auml: 'ä', ccedil: 'ç', ocirc: 'ô', ouml: 'ö', ucirc: 'û', ugrave: 'ù', uuml: 'ü', icirc: 'î', iuml: 'ï',
  Eacute: 'É', Egrave: 'È', Ecirc: 'Ê', Agrave: 'À', Acirc: 'Â', Ccedil: 'Ç', Ocirc: 'Ô', OElig: 'Œ', oelig: 'œ', aelig: 'æ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', laquo: '«', raquo: '»', hellip: '…', ndash: '–', mdash: '—', middot: '·',
  euro: '€', rarr: '→', larr: '←', rsaquo: '›', lsaquo: '‹', times: '×', copy: '©', reg: '®', trade: '™', deg: '°', bull: '•',
  check: '✓', minus: '−', harr: '↔', shy: '­', thinsp: ' ', ensp: ' ', emsp: ' ', uarr: '↑', darr: '↓', plusmn: '±', le: '≤', ge: '≥',
};
export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return NAMED[e] ?? m;
  });
}

/* ------------------------------------------------- Transformation CSS -- */
// Variables historiques de couleur / police : supprimées pour que les jetons du thème s'appliquent.
const DROP_VARS = new Set([
  '--bg', '--bg-2', '--surface', '--surface-2', '--border', '--border-2', '--text', '--text-muted', '--text-faint',
  '--accent', '--accent-2', '--accent-soft', '--accent-glow', '--success', '--warning', '--danger', '--font-display', '--font-body',
]);
const HEX_MAP: [RegExp, string][] = [
  [/#e5e2e1\b/gi, 'var(--text)'],
  [/#0e0e0e\b/gi, 'var(--bg)'],
  [/#(?:0f0f0f|111111|111|121212|131313|141414|151515|161515|161616)\b/gi, 'var(--bg-2)'],
  [/#(?:171717|181818|191919|1a1a1a|1b1b1b|1c1c1c|1d1d1d|1e1e1e)\b/gi, 'var(--surface)'],
  [/#(?:1f1f1f|202020|212121|222222|222|232323|242424|252525|262626|2a2a2a)\b/gi, 'var(--surface-2)'],
];

function tokenizeValue(prop: string, value: string): string {
  let v = value
    .replace(/rgba?\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([\d.]+)\s*\)/gi, 'rgba(var(--ink), $1)')
    .replace(/rgba?\(\s*229\s*,\s*226\s*,\s*225\s*,\s*([\d.]+)\s*\)/gi, 'rgba(var(--text-rgb), $1)')
    .replace(/var\(--font-display\)/g, 'var(--font-ui)')
    .replace(/(['"])Space Grotesk\1/g, "'Space Grotesk Variable'")
    .replace(/(['"])Inter\1/g, "'Inter Variable'")
    .replace(/(['"])Montserrat\1/g, "'Montserrat Variable'");
  for (const [re, to] of HEX_MAP) v = v.replace(re, to);
  if (!/shadow/.test(prop)) {
    // Tout gris très foncé restant (#0b0b0b, #1c1b1b…) : jeton de surface selon sa luminosité.
    v = v.replace(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi, (m, hex: string) => {
      const h = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
      const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
      const hi = Math.max(r, g, b);
      if (hi > 0x2c || hi - Math.min(r, g, b) > 8) return m;
      return hi <= 0x0f ? 'var(--bg)' : hi <= 0x16 ? 'var(--bg-2)' : hi <= 0x1e ? 'var(--surface)' : 'var(--surface-2)';
    });
    // Voiles sombres (fonds de pastilles, barres…) : suivent le fond du thème.
    v = v.replace(/rgba?\(\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*([\d.]+)\s*\)/gi, (m, r: string, g: string, b: string, a: string) =>
      Math.max(+r, +g, +b) <= 44 && Math.max(+r, +g, +b) - Math.min(+r, +g, +b) <= 8 && +r + +g + +b > 0 ? `rgba(var(--bg-rgb), ${a})` : m);
  }
  // Couleurs d'état : versions assombries en thème clair (contraste AA).
  v = v.replace(/#4ade80\b/gi, 'var(--success)').replace(/#fbbf24\b/gi, 'var(--warning)').replace(/#f87171\b/gi, 'var(--danger)');
  // Texte blanc : suit le thème (clair = texte foncé, meilleur contraste sur l'orange aussi).
  if (prop === 'color' && /^(#fff|#ffffff|white)(\s*!important)?$/i.test(v.trim())) v = v.replace(/#fff(?:fff)?|white/i, 'var(--text)');
  return v;
}

function scopeSelector(sel: string): string {
  return sel.split(',').map((part) => {
    // L'élément <main> historique est devenu <div class="lg-main">.
    const s = part.trim().replace(/(^|[\s>+~(])main(?=[.#:[\s>+~)]|$)/g, '$1.lg-main');
    if (!s) return s;
    if (/^(:root|html|body)$/.test(s)) return '.lg';
    const html = s.match(/^((?::root|html)(?:[.#\[:][^\s>+~]*)?)\s*(.*)$/);
    if (html && html[2]) return `${html[1]} .lg ${html[2].replace(/^body\b\s*/, '')}`.trim();
    if (/^body\b/.test(s)) return s.replace(/^body\b/, '.lg');
    return `.lg ${s}`;
  }).join(', ');
}

function transformCss(css: string): string {
  let root: Root;
  try { root = postcss.parse(css); } catch { return ''; }
  root.walkRules((rule: Rule) => {
    const parent = rule.parent as { type?: string; name?: string } | undefined;
    if (parent?.type === 'atrule' && /keyframes$/i.test(parent.name || '')) return;
    rule.selector = scopeSelector(rule.selector);
  });
  root.walkDecls((decl) => {
    if (decl.prop.startsWith('--') && DROP_VARS.has(decl.prop) && /(^|\s|,)\.lg$/.test((decl.parent as Rule)?.selector || '')) {
      decl.remove();
      return;
    }
    decl.value = tokenizeValue(decl.prop, decl.value);
  });
  // Les @font-face historiques (Google Fonts) sont inutiles : polices auto-hébergées.
  root.walkAtRules('font-face', (at) => { at.remove(); });
  root.walkRules((rule) => { if (!rule.nodes?.length) rule.remove(); });
  return root.toString();
}

let legacyGlobal = '';
function legacyGlobalCss(): string {
  if (!legacyGlobal) legacyGlobal = transformCss(fs.readFileSync(LEGACY_GLOBAL_CSS, 'utf8'));
  return legacyGlobal;
}

/* ------------------------------------------------------- Pages -- */
export function listLegacySlugs(): string[] {
  if (!fs.existsSync(LEGACY_DIR)) return [];
  // Une page native (src/pages/<slug>.astro) remplace sa version historique.
  const nativeDir = path.join(LEGACY_DIR, '..', 'pages');
  return fs.readdirSync(LEGACY_DIR).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5))
    .filter((slug) => !fs.existsSync(path.join(nativeDir, slug + '.astro'))).sort();
}

const attr = (html: string, re: RegExp) => { const m = html.match(re); return m ? decodeEntities(m[1]) : undefined; };

// Scripts historiques déjà assurés par le gabarit commun (analytics, cookies, traduction, suivi, chat, menu).
const DROP_SCRIPT = /googletagmanager|dataLayer|pirabelSetLang|translate_a\/element|pl_consent|track\.js|chat-widget\.js|MEGA MENU|pl-anim-on/;

export function loadLegacy(slug: string): LegacyPage {
  const html = fs.readFileSync(path.join(LEGACY_DIR, slug + '.html'), 'utf8');
  const head = html.slice(0, html.indexOf('</head>'));

  const canonical = attr(head, /<link rel="canonical" href="([^"]+)"/) || '';
  const pagePath = canonical ? canonical.replace(/^https?:\/\/[^/]+/, '') || '/' : '/' + slug;
  const jsonLd = [...head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1].trim());

  // Styles propres à la page (hors feuille globale historique et police d'icônes).
  const pageCss = [...html.matchAll(/<style(?:\s+id="([^"]*)")?[^>]*>([\s\S]*?)<\/style>/g)]
    .filter((m) => m[1] !== 'g-css' && m[1] !== 'ms-css' && !/goog-te-banner|\.lang-switch button/.test(m[2]))
    .map((m) => m[2]).join('\n');
  const iconFontCss = (html.match(/<style id="ms-css">([\s\S]*?)<\/style>/) || [])[1] || '';

  // Corps : tout ce qui se trouve entre l'ancien méga-menu et l'ancien pied de page.
  const navEnd = html.indexOf('</nav>', html.indexOf('class="nav-mega"')) + 6;
  const footStart = html.indexOf('<footer class="footer"');
  // <main> devient <div class="lg-main …"> (le gabarit fournit déjà <main id="main">) ;
  // ses classes de mise en page (ex. « tarifs-wrap ») sont conservées.
  let body = html.slice(navEnd, footStart)
    .replace(/<main\b([^>]*)>/, (_m, attrs: string) => {
      const cls = (attrs.match(/class="([^"]*)"/) || [])[1] || '';
      const rest = attrs.replace(/\s*(class|id)="[^"]*"/g, '');
      return `<div class="lg-main${cls ? ' ' + cls : ''}"${rest}>`;
    })
    .replace(/<\/main>/, '</div>');
  body = body.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  // Styles en ligne (style="…") : mêmes jetons de thème que les feuilles de style.
  body = body.replace(/style="([^"]*)"/g, (_m, css: string) => {
    const out = css.split(';').map((d) => {
      const i = d.indexOf(':');
      if (i < 0) return d;
      const prop = d.slice(0, i).trim().toLowerCase();
      return d.slice(0, i + 1) + tokenizeValue(prop, d.slice(i + 1));
    }).join(';');
    return `style="${out}"`;
  });

  const tail = html.slice(html.indexOf('</footer>', footStart));
  const scripts = [...tail.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((m) => !/application\/ld\+json/.test(m[1]) && !DROP_SCRIPT.test(m[1] + m[2]))
    .map((m) => m[0]).join('\n');

  const ogType = attr(head, /<meta property="og:type" content="([^"]+)"/);
  return {
    slug,
    title: attr(head, /<title>([\s\S]*?)<\/title>/)?.trim() || 'Pirabel Labs',
    description: attr(head, /<meta name="description" content="([^"]*)"/) || '',
    path: pagePath,
    robots: attr(head, /<meta name="robots" content="([^"]+)"/) || '',
    ogTitle: attr(head, /<meta property="og:title" content="([^"]*)"/),
    ogDescription: attr(head, /<meta property="og:description" content="([^"]*)"/),
    ogImage: attr(head, /<meta property="og:image" content="([^"]+)"/),
    ogType: ogType === 'article' ? 'article' : 'website',
    jsonLd,
    hasBreadcrumbLd: jsonLd.some((j) => j.includes('BreadcrumbList')),
    css: legacyGlobalCss() + '\n' + transformCss(pageCss),
    iconFontCss,
    body,
    scripts,
  };
}
