#!/usr/bin/env node
/**
 * Génère app/seo-noindex.json : pages « service × ville » sorties de l'index Google.
 *
 * Pourquoi : ~300 pages quasi identiques (même trame, seul le nom de ville change) sont
 * traitées par Google comme des pages satellites et font baisser la confiance dans tout le site.
 *
 * Règle :
 *   - restent indexées : la page « agence » de chaque ville (agence-web-*, agence-marketing-*),
 *     et toutes les pages des villes où l'agence est réellement implantée (KEEP_CITIES) ;
 *   - toutes les autres pages « service × ville » passent en « noindex, follow »
 *     (elles restent accessibles aux visiteurs) et sortent du sitemap.
 *
 * Lu par src/pages/[slug].astro (balise robots) et api/index.js (sitemap.xml).
 * Usage : node scripts/gen-seo-noindex.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const KEEP_CITIES = ['cotonou', 'abomey-calavi', 'porto-novo'];

// Clés de ville : les objets exportés par src/data/cities*.ts (clés de premier niveau « nom: { »).
const cityKeys = new Set();
for (const f of ['cities.ts', 'cities-fr.ts', 'cities-intl.ts', 'cities-afrique.ts']) {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'data', f), 'utf8');
  for (const m of src.matchAll(/^ {2}'?([a-z][a-z-]*)'?: \{/gm)) cityKeys.add(m[1]);
}
const keys = [...cityKeys].sort((a, b) => b.length - a.length);
const cityOf = (slug) => keys.find((c) => slug === c || slug.endsWith('-' + c));

const slugs = fs.readdirSync(path.join(ROOT, 'src', 'legacy'))
  .filter((f) => f.endsWith('.html') && !f.startsWith('_'))
  .map((f) => f.slice(0, -5));

const noindex = slugs.filter((slug) => {
  const city = cityOf(slug);
  if (!city || slug === city) return false;
  if (/^agence-(web|marketing)-/.test(slug)) return false;
  return !KEEP_CITIES.includes(city);
}).sort();

fs.writeFileSync(path.join(ROOT, 'app', 'seo-noindex.json'), JSON.stringify(noindex, null, 0) + '\n');
console.log('villes connues :', keys.length, '| pages en noindex :', noindex.length);
