// Resynchronise le CSS inline des pages statiques depuis css/global.css.
// IMPORTANT : global.css est INLINÉ dans chaque page HTML (<style id="g-css">…</style>)
// pour la performance (zéro requête CSS bloquante). Après TOUTE modification de
// css/global.css, relancer :  node scripts/sync-inline-css.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(ROOT, 'css', 'global.css'), 'utf8');
if (/<\/style/i.test(css)) { console.error('ABORT: "</style" présent dans global.css'); process.exit(1); }
const inline = '<style id="g-css">' + css + '</style>';
const rx = /<style id="g-css">[\s\S]*?<\/style>/;
let n = 0;
for (const f of fs.readdirSync(ROOT).filter(x => x.endsWith('.html'))) {
  const p = path.join(ROOT, f);
  const t = fs.readFileSync(p, 'utf8');
  if (rx.test(t)) {
    const nt = t.replace(rx, inline);
    if (nt !== t) { fs.writeFileSync(p, nt); n++; }
  }
}
console.log('CSS inline resynchronisé sur', n, 'pages');
