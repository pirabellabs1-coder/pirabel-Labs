/**
 * Restructuration des pages historiques (parcours de conversion + SEO/GEO) :
 *  1. hero → « L'essentiel » (réponse directe, reprise de la définition de la page) → sommaire
 *  2. offre → pourquoi nous → preuves (chiffres, avis) → méthode → tarifs → FAQ unique
 *  3. « Pour aller plus loin » : les contenus longs restent dans la page (SEO) mais repliés
 *  4. maillage interne → appel final
 * Rien n'est supprimé du contenu utile : les doublons (2e méthode, 2e FAQ) sont fusionnés ou repliés.
 */
import type { Block, Head } from './parse';

type B<K extends Block['kind']> = Extract<Block, { kind: K }>;
const strip = (s = '') => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const titleOf = (b: Block): string => {
  const x = b as { head?: Head; title?: string };
  return strip(x.head?.title || x.title || '');
};

const OFFER = new Set(['services', 'expertises', 'features']);
const WHY = new Set(['reasons', 'promises']);
const PROOF = new Set(['stats']);

/** Contenu local vérifié (pages villes) : remplace les témoignages génériques par des preuves réelles. */
export type LocalInsert = {
  label: string; zones: Block; projects?: Block; faq: { q: string; a: string }[];
  /** Page hub de la ville : « L'essentiel » propre à la ville, sections génériques du modèle retirées. */
  hub?: { brief: { title: string; html: string; points: string[] } };
  /** Question tarifs régénérée depuis la grille : remplace la question tarifs du modèle (anciens prix). */
  priceFaq?: { q: string; a: string };
};

export function restructure(blocks: Block[], local?: LocalInsert): Block[] {
  const pool = [...blocks];
  const take = <K extends Block['kind']>(pred: (b: Block) => boolean): B<K> | undefined => {
    const i = pool.findIndex(pred);
    return i >= 0 ? (pool.splice(i, 1)[0] as B<K>) : undefined;
  };
  const takeAll = (pred: (b: Block) => boolean): Block[] => {
    const out: Block[] = [];
    for (let i = pool.length - 1; i >= 0; i--) if (pred(pool[i])) out.unshift(pool.splice(i, 1)[0]);
    return out;
  };
  const isCards = (b: Block, set: Set<string>) => b.kind === 'cards' && set.has(b.variant);

  const crumbs = take((b) => b.kind === 'breadcrumb');
  const hero = take((b) => b.kind === 'hero');
  const sticky = take((b) => b.kind === 'sticky');
  const final = take((b) => b.kind === 'final');

  // « L'essentiel » : la définition (« Qu'est-ce qu'une agence X ? ») remonte sous le hero.
  const def = take<'split'>((b) => b.kind === 'split' && /qu['’]est-ce|en quoi (ça|cela) consiste|c['’]est quoi/i.test(titleOf(b)))
    ?? take<'split'>((b) => b.kind === 'split');
  let brief: Block | undefined = def ? { kind: 'brief', title: def.title, html: def.html, points: def.points, cta: hero && (hero as B<'hero'>).ctas[0] } : undefined;
  if (local?.hub) brief = { kind: 'brief', ...local.hub.brief, cta: hero && (hero as B<'hero'>).ctas[0] };
  // Repli : les 2 premiers paragraphes de « Pourquoi choisir Pirabel Labs… » (sans doublon : retirés de la section d'origine),
  // avec les chiffres clés de la page comme points.
  if (!brief) {
    const i = pool.findIndex((b) => b.kind === 'prose' && /pourquoi (choisir|pirabel)/i.test(titleOf(b)));
    if (i >= 0) {
      const pr = pool[i] as B<'prose'>;
      const paras = pr.html.match(/<p[\s>][\s\S]*?<\/p>/g) ?? [];
      if (paras.length) {
        const head = paras.slice(0, 2).join('');
        const restHtml = pr.html.replace(paras[0], '').replace(paras[1] ?? '\u0000', '').trim();
        if (strip(restHtml).length > 80) pool[i] = { ...pr, html: restHtml }; else pool.splice(i, 1);
        const statsBlock = pool.find((b) => isCards(b, PROOF)) as B<'cards'> | undefined;
        const points = (statsBlock?.items ?? []).slice(0, 4).map((it) => strip(`${it.stat || it.title || ''} ${it.text || ''}`)).filter(Boolean);
        brief = { kind: 'brief', title: pr.title || titleOf(pr), html: head, points, cta: hero && (hero as B<'hero'>).ctas[0] };
      }
    }
  }
  // Second repli : la question de définition de la FAQ (« Qu'est-ce que… ? », « Pourquoi… ? »), avec les prestations comme points.
  if (!brief) {
    const q = pool.flatMap((b) => (b.kind === 'faq' ? (b as B<'faq'>).items : []))
      .find((it) => /^(qu['’]est-ce|c['’]est quoi|pourquoi|comment fonctionne|à quoi sert|en quoi)/i.test(strip(it.q)));
    if (q) {
      const offerBlock = pool.find((b) => isCards(b, OFFER)) as B<'cards'> | undefined;
      const points = (offerBlock?.items ?? []).slice(0, 5).map((it) => strip(it.title || '')).filter(Boolean);
      brief = { kind: 'brief', title: q.q, html: /<p[\s>]/.test(q.a) ? q.a : `<p>${q.a}</p>`, points, cta: hero && (hero as B<'hero'>).ctas[0] };
    }
  }

  // Offre : la première grille de services ; les autres grilles « features » restent dans l'ordre d'origine.
  const offer = take((b) => isCards(b, OFFER));
  const offer2 = take((b) => isCards(b, OFFER) && (b as B<'cards'>).items.length >= 3);
  const whyAny = take((b) => isCards(b, WHY) && (b as B<'cards'>).variant === 'reasons') ?? take((b) => isCards(b, WHY));
  // Hubs villes : « Pourquoi une agence digitale à… » était identique d'une ville à l'autre (et parfois faux) :
  // le bloc local et les projets réels le remplacent.
  const why = local?.hub ? undefined : whyAny;
  const stats = take((b) => isCards(b, PROOF));
  const oldTestimonials = take((b) => b.kind === 'testimonials');
  // Pages villes : témoignages de modèle (non vérifiables) remplacés par les projets réellement livrés.
  const testimonials = local ? undefined : oldTestimonials;
  const projects = local?.projects;
  const localZones = local?.zones;
  const method = take((b) => b.kind === 'steps' && (b as B<'steps'>).variant === 'detailed')
    ?? take((b) => b.kind === 'cards' && (b as B<'cards'>).variant === 'pillars')
    ?? take((b) => b.kind === 'steps');
  const pricing = take((b) => b.kind === 'pricing');
  const compareAny = take((b) => b.kind === 'compare');
  const compare = local?.hub ? undefined : compareAny; // tableau « X en chiffres » générique retiré des hubs

  // FAQ unique : questions principales puis secondaires, sans doublon (toutes gardées : elles figurent dans les données structurées).
  const faqs = takeAll((b) => b.kind === 'faq' && (b as B<'faq'>).variant !== 'advantages') as B<'faq'>[];
  const seen = new Set<string>();
  // Pages villes : les questions locales d'abord, puis 6 questions du modèle au plus (le reste est identique d'une ville à l'autre),
  // sans la question « à distance » déjà traitée par la FAQ locale.
  const legacyFaq = faqs.flatMap((f) => f.items);
  const PRICE_Q = /tarif|prix|co[uû]t|combien/i;
  const keptLegacy = local
    ? legacyFaq.filter((it) => !/distance/i.test(strip(it.q)) && !(local.priceFaq && PRICE_Q.test(strip(it.q)))).slice(0, local.hub ? 3 : 6)
    : legacyFaq;
  const localPrice = local?.priceFaq && !(local.faq ?? []).some((f) => PRICE_Q.test(f.q)) ? [local.priceFaq] : [];
  const faqItems = [...(local?.faq ?? []), ...localPrice, ...keptLegacy].filter((it) => {
    const k = strip(it.q).toLowerCase().replace(/[^a-zà-ÿ0-9]+/g, ' ').trim();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const faq: Block | undefined = faqItems.length
    ? { ...(faqs[0] ?? { kind: 'faq', head: { eyebrow: 'FAQ', title: 'Questions <span class="grad">fréquentes</span>' } }), variant: 'main', items: faqItems, id: 'faq' } as Block
    : undefined;

  // Appels à l'action : le plus fort (audit gratuit, bandeau) + un bandeau court après les tarifs.
  const ctaFeature = take((b) => b.kind === 'cta' && ((b as B<'cta'>).variant === 'feature' || (b as B<'cta'>).variant === 'band'));
  const ctaInline = take((b) => b.kind === 'cta' && (b as B<'cta'>).variant === 'inline');
  takeAll((b) => b.kind === 'cta' && (b as B<'cta'>).variant === 'inline'); // doublons retirés
  const parent = take((b) => b.kind === 'cta' && (b as B<'cta'>).variant === 'parent');
  const related = take((b) => b.kind === 'cards' && ((b as B<'cards'>).variant === 'related'));
  const links = take((b) => b.kind === 'links');

  // Le reste (textes longs, piliers, outils, avantages, citations…) : « Pour aller plus loin », replié.
  // Les bandeaux d'appel restants ne sont pas du contenu : ils sont retirés (l'appel final reste en pied de page).
  // Pages villes : « Comment travailler avec nous depuis… » et la 2e méthode doublonnent le bloc local et la méthode principale.
  const DUP_CITY = /^(comment travailler avec nous|notre méthode orientée résultats)/i;
  const rest = pool.filter((b) => b.kind !== 'cta' && (b.kind !== 'raw' || strip((b as B<'raw'>).html).length > 0)
    && !(local && DUP_CITY.test(titleOf(b)))
    && !(local?.hub && /^pourquoi le digital est incontournable/i.test(titleOf(b))));
  const label = (b: Block) => titleOf(b) || (b.kind === 'quote' ? 'Notre conviction' : b.kind === 'prose' ? 'Le détail de notre approche' : 'En savoir plus');
  const more: Block | undefined = rest.length ? { kind: 'more', head: { eyebrow: 'Pour aller plus loin', title: 'Tout savoir, <span class="grad">en détail</span>', lead: 'Nos réponses détaillées, section par section : ouvrez celles qui vous intéressent.' }, sections: rest.map((b) => ({ title: label(b), block: b })) } : undefined;

  // Sommaire : uniquement les sections présentes.
  const ids: [Block | undefined, string, string][] = [
    [offer, 'offre', 'Notre offre'], [why, 'pourquoi', 'Pourquoi nous'], [localZones, 'local', local?.label ?? 'Près de chez vous'], [method, 'methode', 'Méthode'],
    [pricing, 'tarifs', 'Tarifs'], [testimonials, 'avis', 'Avis'], [projects, 'projets', 'Projets'], [faq, 'faq', 'FAQ'], [more, 'details', 'En détail'],
  ];
  for (const [b, id] of ids) if (b) (b as { id?: string }).id = id;
  const present = ids.filter(([b]) => b);
  const toc: Block | undefined = present.length >= 3
    ? { kind: 'anchors', label: 'Sur cette page', sticky: false, links: present.map(([, id, name]) => ({ href: `#${id}`, label: name })) }
    : undefined;

  const out: (Block | undefined)[] = [
    crumbs, hero, brief, toc,
    offer, why, stats, localZones, offer2, ctaFeature,
    method, compare, pricing, ctaInline, testimonials, projects, faq,
    parent, more, related, links, sticky, final,
  ];
  return out.filter((b): b is Block => Boolean(b));
}
