// Ajoute la balise de verification Bing Webmaster Tools (msvalidate.01) sur toutes les
// pages HTML statiques a la racine (ne re-ajoute pas si deja presente).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const TAG = '<meta name="msvalidate.01" content="EB6FCB92F9E0D2E3264DE2FFBE2EEA94" />';
const rxCharset = /<meta charset="utf-8">/i;

let added = 0, alreadyPresent = 0, skippedNoCharset = 0;
for (const f of fs.readdirSync(ROOT).filter(x => x.endsWith('.html'))) {
  const p = path.join(ROOT, f);
  const t = fs.readFileSync(p, 'utf8');
  if (t.includes('msvalidate.01')) { alreadyPresent++; continue; }
  if (!rxCharset.test(t)) { skippedNoCharset++; console.log('SKIP (pas de <meta charset>) :', f); continue; }
  const nt = t.replace(rxCharset, m => m + '\n' + TAG);
  fs.writeFileSync(p, nt);
  added++;
}
console.log('Balise Bing ajoutee sur', added, 'pages. Deja presente sur', alreadyPresent, '. Ignorees (pas de charset) :', skippedNoCharset);
