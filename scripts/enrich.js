// Remplace le contenu d'un article (par slug) par le HTML d'un fichier. node scripts/enrich.js <slug> <fichier.html>
const fs = require('fs');
const BASE = process.env.BASE || 'https://www.pirabellabs.com';
const PASS = process.env.ADMIN_PW;
(async () => {
  const [slug, file] = process.argv.slice(2);
  if (!slug || !file || !PASS) { console.error('usage: ADMIN_PW=.. node scripts/enrich.js <slug> <file>'); process.exit(1); }
  const content = fs.readFileSync(file, 'utf8');
  const login = await fetch(BASE + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'contact@pirabellabs.com', password: PASS }) });
  const cookie = ((login.headers.get('set-cookie') || '').match(/token=[^;]+/) || [''])[0];
  const list = await (await fetch(BASE + '/api/admin/articles', { headers: { Cookie: cookie } })).json();
  const a = (list.articles || []).find(x => x.slug === slug);
  if (!a) { console.error('article introuvable:', slug); process.exit(1); }
  const r = await fetch(BASE + '/api/admin/articles/' + a._id, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify({ content, status: 'publie', author: 'Lissanon Gildas' }) });
  const j = await r.json().catch(() => ({}));
  console.log(slug, '->', r.ok ? 'OK (' + content.length + ' car.)' : ('FAIL ' + (j.error || r.status)));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
