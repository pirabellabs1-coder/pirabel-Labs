// Injecte le widget d'assistant IA public sur toutes les pages HTML statiques.
// Le widget est charge en differe (defer) juste avant </body> et retire lui-meme
// l'ancien bouton WhatsApp flottant. Relancer apres ajout de nouvelles pages.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const TAG = '<script src="/js/chat-widget.js?v=elan1" defer></script>';

let added = 0, already = 0, skipped = 0;
for (const f of fs.readdirSync(ROOT).filter(x => x.endsWith('.html'))) {
  const p = path.join(ROOT, f);
  const t = fs.readFileSync(p, 'utf8');
  if (t.includes('chat-widget.js')) { already++; continue; }
  if (!/<\/body>/i.test(t)) { skipped++; console.log('SKIP (pas de </body>) :', f); continue; }
  fs.writeFileSync(p, t.replace(/<\/body>/i, TAG + '\n</body>'));
  added++;
}
console.log('Widget ajoute sur', added, 'pages. Deja present :', already, '. Ignorees :', skipped);
