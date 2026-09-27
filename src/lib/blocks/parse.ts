/**
 * Extracteur de blocs : transforme une ancienne page (gabarit « agence », 369 pages)
 * en une liste de blocs typés, rendus ensuite par des composants natifs (Blocks.astro).
 * Tout le contenu est conservé ; ce qui n'est pas reconnu devient un bloc « raw »
 * (rendu à l'identique, styles historiques confinés).
 */
import { parse, type HTMLElement } from 'node-html-parser';
import { mapIcon } from './icon-map';
import { fixHtml, fixText } from './fr';
import { decodeEntities } from '../legacy';

export type Cta = { href: string; label: string; primary?: boolean; external?: boolean; icon?: string };
export type Head = { eyebrow?: string; title?: string; lead?: string };
export type Item = {
  icon?: string; title?: string; text?: string; href?: string; tag?: string; meta?: string; num?: string;
  stat?: string; cta?: string; featured?: boolean; badge?: string; price?: string; features?: string[]; author?: string; role?: string;
};
export type Block =
  | { kind: 'breadcrumb'; items: { href?: string; label: string }[] }
  | { kind: 'hero'; eyebrow?: string; eyebrowIcon?: string; title: string; tagline?: string; lead?: string; ctas: Cta[]; icons: string[]; caption?: string; chips: { icon: string; text: string }[] }
  | { kind: 'cards'; variant: 'reasons' | 'services' | 'synergies' | 'related' | 'insights' | 'expertises' | 'pillars' | 'tools' | 'stats' | 'promises' | 'features'; head: Head; items: Item[]; id?: string }
  | { kind: 'compare'; head: Head; headers: string[]; featured: number; rows: string[][]; id?: string }
  | { kind: 'steps'; variant: 'detailed' | 'compact'; head: Head; items: Item[]; id?: string }
  | { kind: 'pricing'; head: Head; items: Item[]; id?: string }
  | { kind: 'testimonials'; head: Head; items: Item[] }
  | { kind: 'faq'; variant: 'main' | 'secondary' | 'advantages'; head: Head; items: { q: string; a: string }[]; id?: string; icon?: string }
  | { kind: 'cta'; title: string; text: string; ctas: Cta[]; variant: 'band' | 'inline' | 'feature' | 'parent'; icon?: string }
  | { kind: 'quote'; text: string; author?: string; role?: string; icon?: string }
  | { kind: 'split'; eyebrow?: string; title: string; html: string; image?: { src: string; alt: string }; visual?: 'brand' | 'growth'; points: string[]; reverse: boolean }
  | { kind: 'prose'; id?: string; title?: string; lead?: string; html: string }
  | { kind: 'links'; head: Head; links: { href: string; label: string }[] }
  | { kind: 'final'; title: string; text: string; ctas: Cta[] }
  | { kind: 'sticky'; text: string; cta: Cta }
  | { kind: 'raw'; html: string }
  // Pages uniques (données écrites à la main, src/data/pages/*)
  | { kind: 'profile'; head: Head; name: string; role: string; bio: string; tags: string[]; facts: { icon: string; text: string }[]; photo?: { src: string; jpg?: string; alt: string; width: number; height: number } }
  | { kind: 'zones'; head: Head; html: string; zones: { title: string; icon: string; items: string[] }[] }
  | { kind: 'anchors'; label: string; links: { href: string; label: string; icon?: string }[]; sticky?: boolean }
  | { kind: 'legal'; updated?: string; sections: { id: string; title: string; html: string }[] }
  | { kind: 'gantt'; head: Head; weeks: number; rows: { label: string; icon: string; from: number; to: number }[]; note?: string }
  // Restructuration (src/lib/blocks/restructure.ts) : réponse directe sous le hero, contenus longs repliés.
  | { kind: 'brief'; title: string; html: string; points: string[]; cta?: Cta; id?: string }
  | { kind: 'more'; head: Head; sections: { title: string; block: Block }[]; id?: string }
  | { kind: 'showcase'; head: Head; items: { title: string; text: string; href: string; image?: string; tag?: string }[]; cta?: Cta; id?: string };

/* ---------------------------------------------------------------- Aides -- */
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
// Texte visible sans les noms d'icônes (« location_on », « payments »…) ni les balises.
const ICON_SPAN = /<span class="material-symbols-outlined[^"]*"[^>]*>[^<]*<\/span>/g;
const T = (el: HTMLElement | null | undefined) =>
  el ? fixText(norm(decodeEntities(el.innerHTML.replace(ICON_SPAN, '').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '')))) : '';
// Icône « de contenu » : jamais les chevrons ni les flèches d'interface.
const UI_ICONS = new Set(['expand_more', 'expand_less', 'arrow_forward', 'arrow_outward', 'arrow_back', 'chevron_right', 'north_east', 'add', 'remove']);
const iconOf = (el: HTMLElement | null | undefined) => {
  const i = (el?.querySelectorAll('.material-symbols-outlined') as HTMLElement[] | undefined)?.find((n) => !UI_ICONS.has(norm(n.text)));
  return i ? mapIcon(norm(i.text)) : undefined;
};

/** HTML de contenu nettoyé : icônes → sprite, styles en ligne retirés, français corrigé. */
function H(el: HTMLElement | null | undefined): string {
  if (!el) return '';
  let html = el.innerHTML;
  html = html.replace(/<span class="material-symbols-outlined"[^>]*>([a-z_0-9]+)<\/span>/g, (_m, n: string) =>
    `<svg class="icon" width="18" height="18" aria-hidden="true"><use href="#i-${mapIcon(n)}"/></svg>`);
  html = html.replace(/\sstyle="[^"]*"/g, '');
  return fixHtml(norm(html));
}
/** Titre : <em> devient le dégradé orange du nouveau design. */
const TITLE = (el: HTMLElement | null | undefined) =>
  H(el).replace(/<em>/g, '<span class="grad">').replace(/<\/em>/g, '</span>').replace(/<br\s*\/?>/g, ' ');

const cls = (el: HTMLElement, c: string) => el.classList?.contains(c);
const find = (el: HTMLElement, sel: string) => el.querySelector(sel) as HTMLElement | null;
const all = (el: HTMLElement, sel: string) => el.querySelectorAll(sel) as HTMLElement[];
const byEnd = (el: HTMLElement, suffix: string) => all(el, `[class*="${suffix}"]`).find((e) => e.classNames.split(' ').some((c) => c.endsWith(suffix))) ?? null;

function cta(a: HTMLElement | null, primary = false): Cta | null {
  if (!a) return null;
  const href = a.getAttribute('href') || '#';
  const iconEl = find(a, '.material-symbols-outlined');
  const label = T(a);
  return { href, label, primary, external: /^https?:/.test(href) && !href.includes('pirabellabs.com'), icon: iconEl ? mapIcon(norm(iconEl.text)) : undefined };
}

function head(section: HTMLElement): Head {
  const sh = find(section, '.sec-h') ?? find(section, '.ns-head');
  if (!sh) {
    const h2 = find(section, 'h2');
    return { title: h2 ? TITLE(h2) : undefined };
  }
  return {
    eyebrow: T(find(sh, '.ns-eyebrow')) || undefined,
    title: TITLE(find(sh, 'h2')) || undefined,
    lead: H(find(sh, '.sec-h__sub') ?? find(sh, '.ns-lead') ?? find(sh, 'p')) || undefined,
  };
}

/** Carte générique : icône, titre, texte, lien, étiquettes et puces, quel que soit le préfixe BEM. */
function card(el: HTMLElement): Item {
  const title = byEnd(el, '__title') ?? byEnd(el, '__name') ?? find(el, 'h3') ?? find(el, 'h4');
  const desc = byEnd(el, '__desc') ?? byEnd(el, '__l') ?? find(el, 'p');
  const link = el.tagName === 'A' ? el : find(el, 'a[href]');
  const ctaEl = byEnd(el, '__cta') ?? byEnd(el, '__feat') ?? byEnd(el, '__link');
  const feats = all(el, 'li').map((li) => T(li)).filter(Boolean);
  return {
    icon: iconOf(byEnd(el, '__icon') ?? el),
    num: T(byEnd(el, '__num')) || undefined,
    tag: T(byEnd(el, '__tag') ?? byEnd(el, '__type')) || undefined,
    stat: T(byEnd(el, '__stat') ?? byEnd(el, '__v')) || undefined,
    title: title ? TITLE(title) : undefined,
    text: desc ? H(desc) : undefined,
    href: link?.getAttribute('href') || undefined,
    cta: ctaEl ? T(ctaEl) || undefined : undefined,
    meta: T(byEnd(el, '__time')) || undefined,
    features: feats.length ? feats : undefined,
  };
}

/* ------------------------------------------------------------ Sections -- */
function heroBlock(s: HTMLElement): Block {
  const eb = find(s, '.s-hero__eyebrow');
  const ctas = all(s, '.s-hero__cta a').map((a, i) => cta(a, i === 0)!).filter(Boolean);
  return {
    kind: 'hero',
    eyebrow: T(eb) || undefined,
    eyebrowIcon: iconOf(eb),
    title: TITLE(find(s, 'h1')),
    tagline: T(find(s, '.s-hero__tagline')) || undefined,
    lead: H(find(s, '.s-hero__lead')) || undefined,
    ctas,
    icons: all(s, '.hero-photo__av').map((a) => iconOf(a) ?? 'sparkles'),
    caption: T(find(s, '.hero-photo__caption')) || undefined,
    chips: all(s, '.s-hero__chip').map((c) => ({ icon: iconOf(c) ?? 'sparkles', text: T(c) })),
  };
}

function faqItems(root: HTMLElement, itemSel: string, qSel: string, aSel: string) {
  return all(root, itemSel).map((it) => ({ q: T(find(it, qSel)), a: H(find(it, aSel)) })).filter((x) => x.q);
}

/** Une <section> peut contenir un ou plusieurs blocs (ex. services + synergies). */
function sectionBlocks(s: HTMLElement): Block[] {
  const c = s.classNames;
  if (cls(s, 's-hero')) return [heroBlock(s)];
  if (cls(s, 'cta-finale-pirabel')) {
    return [{ kind: 'final', title: TITLE(find(s, 'h2')), text: H(find(s, 'p')), ctas: all(s, '.ctaf__btns a').map((a, i) => cta(a, i === 0)!) }];
  }
  if (c.includes('ns-section')) {
    const split = find(s, '.ns-split');
    if (split) {
      const txt = find(split, '.ns-split__text')!;
      const img = find(split, 'img');
      const paras = all(txt, ':scope > p, :scope > ul, :scope > ol').map((p) => `<${p.tagName.toLowerCase()}>${H(p)}</${p.tagName.toLowerCase()}>`).join('');
      const src = img?.getAttribute('src') || '';
      // Les anciennes illustrations génériques (illus-a / illus-c) deviennent un visuel natif, thémé,
      // nourri des mots-clés mis en gras dans le texte de la section.
      const visual = /illus-a\.svg$/.test(src) ? 'brand' as const : /illus-c\.svg$/.test(src) ? 'growth' as const : undefined;
      const points = [...new Set(all(txt, 'strong, b').map((x) => T(x).replace(/[\s:：.,;]+$/, '').trim()))]
        .filter((x) => x.length >= 3 && x.length <= 46).slice(0, 4);
      return [{
        kind: 'split', eyebrow: T(find(txt, '.ns-eyebrow')) || undefined, title: TITLE(find(txt, 'h2')), html: paras,
        // Certains alt historiques sont cassés (« Qu'est-ce qu'une <em width=… ») : repli sur le titre de la section.
        image: img ? { src, alt: ((a) => (/[<>=]/.test(a) || !a ? T(find(txt, 'h2')) : a))(fixText(decodeEntities(img.getAttribute('alt') || ''))) } : undefined,
        visual, points, reverse: cls(split, 'ns-split--rev'),
      }];
    }
    if (find(s, '.ns-acc-grid')) return [{ kind: 'cards', variant: 'insights', head: head(s), items: all(s, '.ns-acc').map(card) }];
    if (find(s, '.ns-faq-grid')) return [{ kind: 'faq', variant: 'secondary', head: head(s), items: faqItems(s, '.ns-faq', '.ns-faq__q', '.ns-faq__a') }];
    if (find(s, '.ns-rel-grid')) return [{ kind: 'cards', variant: 'related', head: head(s), items: all(s, '.ns-rel-card').map(card) }];
  }

  const h = head(s);
  const out: Block[] = [];
  let used = false;
  const H1 = () => { const r = used ? { title: undefined } as Head : h; used = true; return r; };

  const fcta = find(s, '.fcta');
  if (fcta) {
    return [{ kind: 'cta', variant: 'band', title: TITLE(find(fcta, 'h2')), text: H(find(fcta, 'p')), ctas: all(fcta, ':scope > a, .fcta__cta').map((a) => cta(a, true)!).slice(0, 1) }];
  }
  const midcta = find(s, '.midcta');
  if (midcta) {
    return [{ kind: 'cta', variant: 'feature', title: TITLE(find(midcta, 'h3')), text: H(find(midcta, 'p')), ctas: [cta(find(midcta, 'a'), true)!].filter(Boolean) }];
  }
  const quote = find(s, '.quote-card');
  if (quote) {
    return [{ kind: 'quote', text: H(find(quote, 'blockquote')), author: T(find(quote, '.quote-card__author')) || undefined, role: T(find(quote, '.quote-card__role')) || undefined, icon: iconOf(quote) }];
  }

  const rows = find(s, '.reasons-row') ?? find(s, '.reasons-grid');
  if (rows) out.push({ kind: 'cards', variant: 'reasons', head: H1(), items: all(rows, '.reason').map(card) });
  const exp = find(s, '.expertises-row');
  if (exp) out.push({ kind: 'cards', variant: 'expertises', head: H1(), items: all(exp, '.expertise').map(card) });
  const cmp = find(s, 'table.compare') ?? find(s, '.compare-wrap table') ?? find(s, 'table');
  if (cmp) {
    const headers = all(cmp, 'thead th').map((th) => T(th));
    const featured = all(cmp, 'thead th').findIndex((th) => /featured|feature/.test(th.classNames));
    const rws = all(cmp, 'tbody tr').map((tr) => all(tr, 'td, th').map((td) => {
      const kind = find(td, '.compare__check') ? 'yes' : find(td, '.compare__partial') ? 'partial' : find(td, '.compare__cross, .compare__no') ? 'no' : '';
      return (kind ? `<span class="cmp cmp--${kind}">` : '') + H(td) + (kind ? '</span>' : '');
    }));
    out.push({ kind: 'compare', head: H1(), headers, featured, rows: rws });
  }
  const grid34 = find(s, '.cards-3') ?? find(s, '.cards-4') ?? find(s, '.cards-2');
  if (grid34) out.push({ kind: 'cards', variant: 'features', head: H1(), items: all(grid34, '.card').map(card) });
  const tarifs = find(s, '.tarif-grid');
  if (tarifs) {
    out.push({
      kind: 'pricing', head: H1(), items: all(tarifs, '.tarif').map((p) => ({
        title: TITLE(byEnd(p, '__title')), price: H(byEnd(p, '__price')) || undefined, text: H(byEnd(p, '__desc') ?? byEnd(p, '__lead')) || undefined,
        features: all(p, 'li').map((li) => T(li)), featured: p.classNames.includes('--featured'), badge: T(byEnd(p, '__badge')) || undefined,
        cta: T(find(p, 'a')) || 'Demander un devis', href: find(p, 'a')?.getAttribute('href') || '/contact',
      })),
    });
  }
  const tools = find(s, '.tools-grid');
  if (tools) out.push({ kind: 'cards', variant: 'tools', head: H1(), items: all(tools, '.tool').map(card) });
  const parent = find(s, '.parent-card');
  if (parent && !out.length) {
    const wrapA = parent.closest('a') as HTMLElement | null;
    const a = wrapA ?? find(parent, 'a');
    const t = find(parent, 'h3') ?? byEnd(parent, '__title');
    out.push({
      kind: 'cta', variant: 'parent', icon: iconOf(byEnd(parent, '__icon')),
      title: t ? TITLE(t) : (h.title || ''), text: H(find(parent, 'p') ?? byEnd(parent, '__desc')) || (h.lead || ''),
      ctas: a ? [{ href: a.getAttribute('href') || '/services', label: fixText(norm(decodeEntities((find(parent, 'a') ?? a).text.replace(/arrow_forward|arrow_outward/g, '')))) || 'Découvrir', primary: true }] : [],
    });
    used = true;
  }
  const types = find(s, '.types-grid');
  if (types) out.push({ kind: 'cards', variant: 'services', head: H1(), items: all(types, '.type-card').map(card) });
  const zz = find(s, '.zigzag');
  if (zz) out.push({ kind: 'steps', variant: 'detailed', head: H1(), items: all(zz, '.zz-step').map(card) });
  const prest = find(s, '.prest-grid');
  if (prest) {
    out.push({
      kind: 'pricing', head: H1(), items: all(prest, '.prest').map((p) => ({
        ...card(p),
        text: H(find(p, '.prest__lead')) || undefined,
        price: H(find(p, '.prest__price')) || undefined,
        featured: cls(p, 'prest--featured'),
        badge: T(find(p, '.prest__badge')) || undefined,
        cta: T(find(p, '.prest__cta')) || 'Demander un devis',
        href: find(p, '.prest__cta')?.getAttribute('href') || '/contact',
      })),
    });
  }
  const mc = find(s, '.method-compact');
  if (mc) out.push({ kind: 'steps', variant: 'compact', head: H1(), items: all(mc, '.method-step').map(card) });
  const pil = find(s, '.piliers-grid');
  if (pil) out.push({ kind: 'cards', variant: 'pillars', head: H1(), items: all(pil, '.pilier').map(card) });
  const pd = find(s, '.pd-grid');
  if (pd) out.push({ kind: 'cards', variant: 'promises', head: H1(), items: all(pd, '.pd').map((x) => ({ ...card(x), title: TITLE(find(x, '.pd__h-title')), features: all(x, 'li').map((li) => T(li)) })) });
  const roi = find(s, '.roi');
  if (roi) out.push({ kind: 'cards', variant: 'stats', head: H1(), items: [{ stat: T(find(roi, '.roi__big')), text: H(find(roi, '.roi__small')) }] });
  const stats = find(s, '.stats-grid');
  if (stats) out.push({ kind: 'cards', variant: 'stats', head: H1(), items: all(stats, '.stat-c, .stat').map(card) });
  const tech = find(s, '.tech-row');
  if (tech) out.push({ kind: 'cards', variant: 'tools', head: H1(), items: all(tech, '.tech').map(card) });
  const adv = find(s, '.adv-list');
  if (adv) out.push({ kind: 'faq', variant: 'advantages', head: H1(), items: faqItems(adv, '.adv-i', '.adv-i__q', '.adv-i__a-inner') });
  const syn = find(s, '.syn-grid');
  if (syn) {
    const items = all(syn, '.syn');
    const isReview = items.some((x) => /★|&#9733;/.test(x.innerHTML) || find(x, '.syn__icon')?.text.includes('format_quote'));
    if (isReview) {
      out.push({ kind: 'testimonials', head: H1(), items: items.map((x) => {
        const who = T(find(x, '.syn__link'));
        const [author, ...rest] = who.split(' · ');
        return { text: H(find(x, '.syn__desc')).replace(/^«\s*|\s*»$/g, ''), author, role: rest.join(' · ') };
      }) });
    } else {
      out.push({ kind: 'cards', variant: 'synergies', head: H1(), items: items.map(card) });
    }
  }
  const faq = find(s, '.faq-list');
  if (faq) out.push({ kind: 'faq', variant: 'main', head: H1(), items: faqItems(faq, '.faq-i', '.faq-i__q span', '.faq-i__a-inner') });

  // Maillage local (bloc injecté : titre + grille de liens).
  if (!out.length && !c && s.getAttribute('style')?.includes('max-width')) {
    const links = all(s, 'a[href]').map((a) => ({ href: a.getAttribute('href')!, label: T(find(a, 'span') ?? a) }));
    if (links.length) out.push({ kind: 'links', head: { title: TITLE(find(s, 'h2')), lead: H(find(s, 'p')) || undefined }, links });
  }
  // Sections de texte (ex. sous-services « Stratégie SEO », « WordPress multilingue » : h2 + paragraphes).
  const box = find(s, '.pourquoi') ?? find(s, '.container') ?? s;
  if (!out.length && find(box, 'h2') && all(box, ':scope > p').length) {
    const body = all(box, ':scope > p, :scope > ul, :scope > ol, :scope > h3').map((p) => `<${p.tagName.toLowerCase()}>${H(p)}</${p.tagName.toLowerCase()}>`).join('');
    if (body) out.push({ kind: 'prose', id: s.getAttribute('id') || undefined, title: TITLE(find(box, 'h2')) || undefined, html: body });
  }
  // Repli générique : toute grille d'éléments répétés (même classe) → cartes ou étapes ;
  // sinon, bloc de texte (paragraphes, listes, intertitres) avec son en-tête.
  if (!out.length) {
    const container = find(s, '.container') ?? s;
    const kidsOf = (g: HTMLElement) => g.childNodes.filter((n) => n.nodeType === 1) as HTMLElement[];
    const grid = all(container, '*').find((g) => {
      const kids = kidsOf(g);
      if (kids.length < 2 || cls(g, 'sec-h')) return false;
      const c0 = (kids[0].classNames || '').split(' ')[0];
      return !!c0 && !c0.includes('__') && kids.filter((k) => (k.classNames || '').split(' ')[0] === c0).length >= Math.max(2, kids.length - 1);
    });
    if (grid) {
      const kids = kidsOf(grid).filter((k) => norm(k.text));
      const stepLike = kids.every((k) => byEnd(k, '__num') || byEnd(k, '__step'));
      out.push(stepLike
        ? { kind: 'steps', variant: 'compact', head: H1(), items: kids.map((k) => ({ ...card(k), num: T(byEnd(k, '__num') ?? byEnd(k, '__step')) || undefined })) }
        : { kind: 'cards', variant: 'features', head: H1(), items: kids.map(card) });
    } else {
      const parts = all(container, 'p, ul, ol, h3, blockquote')
        .filter((e) => !e.closest('.sec-h') && !['LI'].includes(e.parentNode?.tagName ?? '') && !e.parentNode?.closest('ul, ol, blockquote'))
        .map((e) => { const t = e.tagName.toLowerCase(); return `<${t}>${H(e)}</${t}>`; }).join('');
      if (parts) out.push({ kind: 'prose', id: s.getAttribute('id') || undefined, title: h.title, lead: h.lead, html: parts } as Block);
    }
  }
  return out.length ? out : [{ kind: 'raw', html: s.outerHTML }];
}

/* -------------------------------------------------------------- Page -- */
export function parseBlocks(bodyHtml: string): Block[] {
  const root = parse(bodyHtml, { comment: false, blockTextElements: { script: true, style: true } });
  const blocks: Block[] = [];
  const walk = (nodes: HTMLElement[]) => {
    for (const el of nodes) {
      if (el.nodeType !== 1) continue;
      const tag = el.tagName;
      const c = el.classNames || '';
      if (tag === 'SCRIPT' || tag === 'STYLE' || c.includes('dot-arrow')) continue;
      if (c.includes('lg-main')) { walk(el.childNodes as HTMLElement[]); continue; }
      if (cls(el, 'bc')) {
        const items = el.childNodes.filter((n) => n.nodeType === 1 && !(n as HTMLElement).classNames.includes('bc__sep'))
          .map((n) => ({ href: (n as HTMLElement).getAttribute('href') || undefined, label: T(n as HTMLElement) }));
        blocks.push({ kind: 'breadcrumb', items });
        continue;
      }
      if (tag === 'NAV' && cls(el, 'breadcrumb')) {
        blocks.push({ kind: 'breadcrumb', items: all(el, 'li').filter((li) => li.getAttribute('aria-hidden') !== 'true').map((li) => ({ href: find(li, 'a')?.getAttribute('href') || undefined, label: T(li) })) });
        continue;
      }
      if (cls(el, 'sticky-cta')) {
        const a = find(el, 'a');
        if (a) blocks.push({ kind: 'sticky', text: H(find(el, '.sticky-cta__txt')), cta: cta(a, true)! });
        continue;
      }
      if (cls(el, 'cta-mid-pirabel')) {
        blocks.push({ kind: 'cta', variant: 'inline', title: T(find(el, '.ctam__t')), text: H(find(el, '.ctam__p')), ctas: all(el, '.ctam__btns a').map((a, i) => cta(a, i === 0)!) });
        continue;
      }
      if (cls(el, 'inline-cta-band')) {
        blocks.push({ kind: 'cta', variant: 'inline', title: TITLE(find(el, 'strong')), text: H(find(el, '.inline-cta-band__text span')), ctas: all(el, '.inline-cta-band__btns a').map((a, i) => cta(a, i === 0)!) });
        continue;
      }
      if (tag === 'SECTION') { blocks.push(...sectionBlocks(el)); continue; }
      if (tag === 'A' && /wa\.me/.test(el.getAttribute('href') || '')) continue; // bouton WhatsApp flottant : remplacé par le chat
      const inner = el.querySelectorAll('section');
      if (inner.length) { walk(el.childNodes as HTMLElement[]); continue; }
      if (norm(el.text)) blocks.push({ kind: 'raw', html: el.outerHTML });
    }
  };
  walk(root.childNodes as HTMLElement[]);
  return blocks;
}
