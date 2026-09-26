/**
 * Correction du français dans le texte visible extrait des anciennes pages :
 * accents manquants (dictionnaire SÛR : uniquement des formes sans accent qui
 * n'existent pas en français), points de suspension, espaces insécables avant ! ? : ;
 * Ne touche jamais aux balises, attributs, URL ou slugs.
 * Complété par fr-fixes.json : ~2 600 corrections en contexte issues d'une relecture complète
 * (accents ajoutés à tort par d'anciens scripts, conjugaisons, accords, noms de marques).
 */
import dict from './fr-dict.json';
import fixes from './fr-fixes.json';
import { decodeEntities } from '../legacy';

const ENTRIES = Object.entries(dict as Record<string, string>).filter(([a]) => a !== 'accuse');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// Une seule expression (alternance, plus longues d'abord) + table de correspondance : un passage par texte.
const MAP = new Map<string, string>();
for (const [a, b] of ENTRIES) { MAP.set(a, b); MAP.set(cap(a), cap(b)); }
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ALL = new RegExp(`(?<![-/.\\wÀ-ÿ])(${[...MAP.keys()].sort((x, y) => y.length - x.length).map(escapeRe).join('|')})(?![-/\\wÀ-ÿ])`, 'g');

// Corrections en contexte : correspondance exacte (casse comprise), espaces normales ou insécables
// indifférentes, bornes de mot seulement quand l'extrait commence/finit par une lettre ou un chiffre.
// Index par premier mot : pour un texte donné, seules les règles dont le premier mot y figure sont testées.
const WS = /[   ]+/g;
const WORD = /[\p{L}\p{N}]+/gu;
type Fix = { re: RegExp; to: string; len: number };
const FIX_INDEX = new Map<string, Fix[]>();
for (const [from, to] of fixes as [string, string][]) {
  const f = from.replace(WS, ' ');
  const key = f.match(/[\p{L}\p{N}]+/u)?.[0].toLowerCase();
  if (!key) continue;
  // Bornes : jamais au milieu d'un mot, d'un slug ou d'une URL (« /hebergement-web » reste intact).
  const src = (/^[\p{L}\p{N}]/u.test(f) ? '(?<![-/.@\\p{L}\\p{N}])' : '') +
    f.split(' ').map(escapeRe).join('[ \\u00a0\\u202f]+') +
    (/[\p{L}\p{N}]$/u.test(f) ? '(?![-/\\p{L}\\p{N}])' : '');
  const list = FIX_INDEX.get(key) ?? [];
  list.push({ re: new RegExp(src, 'gu'), to, len: f.length });
  FIX_INDEX.set(key, list);
}
for (const list of FIX_INDEX.values()) list.sort((a, b) => b.len - a.len);
function applyFixes(s: string): string {
  const words = new Set((s.match(WORD) ?? []).map((w) => w.toLowerCase()));
  for (const w of words) {
    const list = FIX_INDEX.get(w);
    if (list) for (const fx of list) s = s.replace(fx.re, () => fx.to);
  }
  return s;
}

export function fixText(t: string): string {
  // Apostrophes échappées par erreur dans l'ancien HTML (« l\'accueil »).
  let s = t.replace(/\\(['’])/g, '$1').replace(ALL, (m) => MAP.get(m) ?? m);
  s = applyFixes(s);
  s = s.replace(/\.\.\.+/g, '…');
  // Espace insécable avant ; ! ? et avant : (pas dans les heures « 14:30 » ni les URL,
  // ni avant le « ; » d'une entité HTML non décodée comme « &check; »).
  s = s.replace(/(&[a-zA-Z]+|&#\w+)?([\wÀ-ÿ)»"'’%€])[   ]*([!?;])(?=\s|$|<)/g,
    (m, ent: string | undefined, a: string, p: string) => (ent && p === ';' ? m : `${ent ?? ''}${a} ${p}`));
  s = s.replace(/([\wÀ-ÿ)»"'’%€])[   ]+:(?=\s|$)/g, '$1 :');
  s = s.replace(/«[  ]*/g, '« ').replace(/[  ]*»/g, ' »');
  return s;
}

const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Applique fixText au texte visible d'un fragment HTML (entre les balises) ; entités décodées puis ré-échappées. */
export function fixHtml(html: string): string {
  return html.replace(/(^|>)([^<]+)(?=<|$)/g, (_m, lead: string, text: string) => lead + escapeText(fixText(decodeEntities(text))));
}
