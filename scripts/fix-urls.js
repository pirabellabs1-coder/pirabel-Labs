// Désaccentue UNIQUEMENT les URLs dans href/src/action (les slugs/valeurs doivent être ASCII).
// Ne touche jamais au texte visible (qui garde ses accents).
const fs = require('fs');
const MAP = { 'à':'a','â':'a','ä':'a','é':'e','è':'e','ê':'e','ë':'e','î':'i','ï':'i','ô':'o','ö':'o','û':'u','ü':'u','ù':'u','ç':'c','œ':'oe',
  'À':'A','Â':'A','É':'E','È':'E','Ê':'E','Ë':'E','Î':'I','Ï':'I','Ô':'O','Ö':'O','Û':'U','Ü':'U','Ù':'U','Ç':'C','Œ':'OE' };
const ACC = /[àâäéèêëîïôöûüùçœÀÂÉÈÊËÎÏÔÖÛÜÙÇŒ]/;
const ACCG = /[àâäéèêëîïôöûüùçœÀÂÉÈÊËÎÏÔÖÛÜÙÇŒ]/g;
function deaccent(s){ return s.replace(ACCG, c => MAP[c] || c); }

const mode = process.argv[2] || 'dry';
const files = process.argv.slice(3);
let total = 0;
for (const f of files) {
  let html = fs.readFileSync(f, 'utf8'), n = 0;
  html = html.replace(/\b(href|src|action)="([^"]*)"/g, (m, attr, val) => {
    if (val.startsWith('#') || val.startsWith('mailto:') || val.startsWith('tel:')) return m; // ancres/mailto inchangés
    if (ACC.test(val)) { const d = deaccent(val); if (d !== val) { n++; if (mode === 'dry') console.log('  ' + val + '  ->  ' + d); return attr + '="' + d + '"'; } }
    return m;
  });
  if (n > 0) { console.log(n + '\t' + f); total += n; if (mode === 'apply') fs.writeFileSync(f, html, 'utf8'); }
}
console.log('\n' + mode + ' : ' + total + ' URL(s) désaccentuée(s).');
