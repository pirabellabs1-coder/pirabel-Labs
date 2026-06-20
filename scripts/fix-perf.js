// Perf : favicon 258Ko -> logo.png 16Ko + préchargement prioritaire du logo. Idempotent.
const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
let fav = 0, pre = 0;
for (const f of files) {
  let h = fs.readFileSync(f, 'utf8');
  const orig = h;
  // 1) favicon/apple-touch : 258Ko -> 16Ko
  if (h.includes('/img/favicon.png?v=elan')) { h = h.replace(/\/img\/favicon\.png/g, '/img/logo.png?v=elan'); fav++; }
  // 2) préchargement prioritaire du logo (LCP) — une seule fois, juste avant </head>
  if (!h.includes('rel="preload" as="image" href="/img/logo.png?v=elan"') && h.includes('</head>')) {
    h = h.replace('</head>', '<link rel="preload" as="image" href="/img/logo.png?v=elan" fetchpriority="high">\n</head>');
    pre++;
  }
  if (h !== orig) fs.writeFileSync(f, h, 'utf8');
}
console.log('favicon corrigé:', fav, '| preload logo ajouté:', pre, '| total fichiers:', files.length);
