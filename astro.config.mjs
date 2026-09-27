// Configuration Astro — site Pirabel Labs.
// Sortie 100 % statique (HTML pré-rendu = SEO), déployée sur Vercel à côté de la
// fonction Express `api/index.js` (rewrites dans vercel.json). Pas d'adapter :
// il désactiverait le dossier `api/`.
// Les pages non encore migrées vivent telles quelles dans `public/*.html`.
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { localizePrices } from './src/lib/px.mjs';

// Prix localisés (euro par défaut, franc CFA en zone franc) : chaque prix des pages construites
// reçoit ses deux versions (voir src/lib/px.mjs). Les pages publiques /public/*.html ne sont pas concernées.
const priceLocalizer = {
  name: 'pirabel-price-localizer',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const root = fileURLToPath(dir);
      let files = 0, changed = 0;
      const walk = async (d) => {
        for (const e of await readdir(d, { withFileTypes: true })) {
          const p = join(d, e.name);
          if (e.isDirectory()) await walk(p);
          else if (e.name.endsWith('.html')) {
            files++;
            const html = await readFile(p, 'utf8');
            // Seules les pages du nouveau site portent la règle CSS de bascule (.px-x) : les autres restent intactes.
            if (!html.includes('.px-x')) continue;
            const next = localizePrices(html);
            if (next !== html) { changed++; await writeFile(p, next); }
          }
        }
      };
      await walk(root);
      logger.info(`prix localisés : ${changed} page(s) sur ${files}`);
    },
  },
};

export default defineConfig({
  site: 'https://www.pirabellabs.com',
  // `/contact` → `contact.html` : mêmes URLs que l'ancien site (cleanUrls Vercel).
  trailingSlash: 'never',
  build: {
    format: 'file',
    // Tout le CSS en ligne : zéro requête bloquante (même stratégie que l'ancien site).
    inlineStylesheets: 'always',
  },
  compressHTML: true,
  integrations: [react(), priceLocalizer],
  devToolbar: { enabled: false },
});
