// Injecte <script defer src="/js/track.js"></script> avant </body> dans toutes les pages HTML racine.
// Idempotent : saute les fichiers déjà injectés. N'écrit que si modification.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const TAG = '<script defer src="/js/track.js"></script>';

const files = fs.readdirSync(root).filter(f => f.endsWith('.html'));
let injected = 0, skipped = 0, noBody = 0;
for (const f of files) {
  const fp = path.join(root, f);
  let html = fs.readFileSync(fp, 'utf8');
  if (html.includes('/js/track.js')) { skipped++; continue; }
  const idx = html.lastIndexOf('</body>');
  if (idx === -1) { noBody++; continue; }
  html = html.slice(0, idx) + '  ' + TAG + '\n' + html.slice(idx);
  fs.writeFileSync(fp, html, 'utf8');
  injected++;
}
console.log(`HTML total: ${files.length} | injectés: ${injected} | déjà présents: ${skipped} | sans </body>: ${noBody}`);
