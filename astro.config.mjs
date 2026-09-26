// Configuration Astro — site Pirabel Labs.
// Sortie 100 % statique (HTML pré-rendu = SEO), déployée sur Vercel à côté de la
// fonction Express `api/index.js` (rewrites dans vercel.json). Pas d'adapter :
// il désactiverait le dossier `api/`.
// Les pages non encore migrées vivent telles quelles dans `public/*.html`.
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

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
  integrations: [react()],
  devToolbar: { enabled: false },
});
