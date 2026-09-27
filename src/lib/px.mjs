/**
 * Prix localisés : l'euro par défaut, le franc CFA pour les visiteurs de la zone franc
 * (pays détecté par /api/geo, mémorisé dans localStorage « pl_cur » → <html data-cur="xof">).
 *
 * Chaque prix est rendu en deux versions dans le HTML ; le CSS n'en affiche qu'une :
 *   <span class="px" data-px><span class="px-e">1 200 €</span><span class="px-x">200 000 FCFA</span></span>
 *
 * - pxHtml(eur, xof) : prix régional explicite (grille Europe / grille Afrique), balisé à la source.
 * - localizePrices(html) : après la construction, convertit les prix restés dans une seule devise
 *   (parité fixe 1 € = 655,957 FCFA, montant arrondi et précédé de « ≈ ») et les paires « X FCFA soit ≈ Y € ».
 */
export const XOF_PER_EUR = 655.957;
const NB = ' ';

export function pxHtml(eur, xof) {
  return `<span class="px" data-px><span class="px-e">${eur}</span><span class="px-x">${xof}</span></span>`;
}

const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
const roundEur = (v) => (v < 100 ? Math.round(v) : v < 1000 ? Math.round(v / 5) * 5 : v < 10000 ? Math.round(v / 10) * 10 : Math.round(v / 100) * 100);
const roundXof = (v) => (v < 100000 ? Math.round(v / 500) * 500 : v < 500000 ? Math.round(v / 1000) * 1000 : Math.round(v / 5000) * 5000);
const toEur = (xof) => fmt(roundEur(xof / XOF_PER_EUR));
const toXof = (eur) => fmt(roundXof(eur * XOF_PER_EUR));

// Séparateurs de milliers et espaces possibles dans le HTML produit.
const S = '(?:[ \\u00a0\\u202f]|&nbsp;|&#160;|&#x202f;|&#8239;)';
const AMT = `(?<![\\d.,])(?:\\d{1,3}(?:${S}\\d{3})+|\\d+)(?:,\\d{1,2})?`;
const CUR = `(FCFA|F${S}?CFA|€|EUR(?![A-Za-z]))`;
const PER = `((?:${S}*\\/${S}*mois)|(?:${S}+par${S}+mois))?`;
const num = (s) => parseFloat(s.replace(/(?:[   ]|&nbsp;|&#160;|&#x202f;|&#8239;)/g, '').replace(',', '.'));
const isEur = (c) => c === '€' || c === 'EUR';
const per = (p) => (p ? (/par/.test(p) ? `${NB}par mois` : `${NB}/${NB}mois`) : '');

const RE_PAIR = new RegExp(`(${AMT})${S}*${CUR}${PER}((?:${S}*,)?${S}*(?:soit${S}+)?(?:≈|environ|env\\.)${S}*|${S}*,?${S}*soit${S}+|${S}*\\(${S}*(?:≈|environ)?${S}*|${S}+\\/${S}+)(${AMT})${S}*${CUR}${PER}(\\))?`, 'g');
const RE_RANGE = new RegExp(`(${AMT})(${S}*(?:à|et|-|–)${S}*)(${AMT})${S}*${CUR}${PER}`, 'g');
const RE_ONE = new RegExp(`(${AMT})${S}*${CUR}${PER}`, 'g');

function convertText(t) {
  if (!/FCFA|F.?CFA|€|\d\s?EUR/.test(t)) return t;
  const parts = [];
  const keep = (s) => { parts.push(s); return `\u0000${parts.length - 1}\u0000`; };
  // 1) Paires : « 200 000 FCFA soit ≈ 305 € », « 1 500 € (≈ 985 000 FCFA) », « 200 000 FCFA / 1 200 € ».
  t = t.replace(RE_PAIR, (m, a1, c1, p1, conn, a2, c2, p2, close) => {
    if (isEur(c1) === isEur(c2)) return m;
    const opened = conn.includes('(');
    if (opened && !close) return m;
    const approx = /≈|environ|env\./.test(conn);
    const s1 = `${fmt(num(a1))}${NB}${isEur(c1) ? '€' : 'FCFA'}${per(p1 || p2)}`;
    const s2 = `${approx ? `≈${NB}` : ''}${fmt(num(a2))}${NB}${isEur(c2) ? '€' : 'FCFA'}${per(p2 || p1)}`;
    const [eur, xof] = isEur(c1) ? [s1, s2] : [s2, s1];
    return keep(pxHtml(eur, xof)) + (close && !opened ? close : '');
  });
  // 2) Fourchettes : « de 150 000 à 300 000 FCFA », « entre 1 500 et 3 000 € ».
  t = t.replace(RE_RANGE, (m, a1, conn, a2, c, p) => {
    const w = conn.replace(/(?:[   ]|&nbsp;|&#160;|&#x202f;|&#8239;)+/g, ' ').trim();
    const sep = w === '-' || w === '–' ? '–' : `${NB}${w}${NB}`;
    const orig = `${fmt(num(a1))}${sep}${fmt(num(a2))}${NB}${isEur(c) ? '€' : 'FCFA'}${per(p)}`;
    const conv = isEur(c)
      ? `≈${NB}${toXof(num(a1))}${sep}${toXof(num(a2))}${NB}FCFA${per(p)}`
      : `≈${NB}${toEur(num(a1))}${sep}${toEur(num(a2))}${NB}€${per(p)}`;
    return keep(isEur(c) ? pxHtml(orig, conv) : pxHtml(conv, orig));
  });
  // 3) Montants seuls.
  t = t.replace(RE_ONE, (m, a, c, p) => {
    const v = num(a);
    const orig = `${fmt(v)}${NB}${isEur(c) ? '€' : 'FCFA'}${per(p)}`;
    if (!v) return keep(pxHtml(`0${NB}€${per(p)}`, `0${NB}FCFA${per(p)}`)); // « gratuit » dans les deux devises
    return keep(isEur(c) ? pxHtml(orig, `≈${NB}${toXof(v)}${NB}FCFA${per(p)}`) : pxHtml(`≈${NB}${toEur(v)}${NB}€${per(p)}`, orig));
  });
  return t.replace(/\u0000(\d+)\u0000/g, (m, i) => parts[+i]);
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea', 'title', 'head', 'noscript', 'svg', 'code', 'pre', 'option']);

/** Localise les prix du texte visible d'une page HTML complète (hors head, scripts, attributs, zones data-px-skip). */
export function localizePrices(html) {
  const out = [];
  const stack = []; // { name, skip }
  let skipDepth = 0;
  let inBody = false;
  const re = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^>]*>|[^<]+|</g;
  let m;
  while ((m = re.exec(html))) {
    const tok = m[0];
    if (tok[0] === '<' && tok.length > 1 && tok[1] !== '!') {
      const close = tok[1] === '/';
      const name = (tok.match(/^<\/?([a-zA-Z0-9-]+)/) || [])[1]?.toLowerCase() || '';
      if (name === 'body') inBody = !close;
      if (close) {
        // Dépile jusqu'à la balise correspondante (HTML tolérant).
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i].name === name) {
            for (let j = stack.length - 1; j >= i; j--) if (stack[j].skip) skipDepth--;
            stack.length = i;
            break;
          }
        }
      } else if (!VOID.has(name) && !/\/>$/.test(tok)) {
        const skip = RAW.has(name) || /\sdata-px(?:-skip)?[\s=>]/.test(tok) || /\sdata-px(?:-skip)?$/.test(tok.slice(0, -1));
        stack.push({ name, skip });
        if (skip) skipDepth++;
      }
      out.push(tok);
    } else {
      out.push(inBody && skipDepth === 0 && tok[0] !== '<' ? convertText(tok) : tok);
    }
  }
  return out.join('');
}
