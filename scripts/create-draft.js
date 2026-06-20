// Crée un article en BROUILLON. node scripts/create-draft.js <metaJson> <contentHtml>
const fs = require('fs');
const BASE = process.env.BASE || 'https://www.pirabellabs.com';
const PASS = process.env.ADMIN_PW;
(async () => {
  const [metaFile, contentFile] = process.argv.slice(2);
  if (!metaFile || !contentFile || (!PASS && !process.env.ADMIN_TOKEN)) { console.error('usage: (ADMIN_PW=.. | ADMIN_TOKEN=..) node scripts/create-draft.js <meta.json> <content.html>'); process.exit(1); }
  const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  const content = fs.readFileSync(contentFile, 'utf8');
  let cookie;
  if (process.env.ADMIN_TOKEN) {
    cookie = 'token=' + process.env.ADMIN_TOKEN; // réutilise un token => évite N connexions
  } else {
    const login = await fetch(BASE + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'contact@pirabellabs.com', password: PASS }) });
    cookie = ((login.headers.get('set-cookie') || '').match(/token=[^;]+/) || [''])[0];
  }
  // éviter les doublons : si le slug existe déjà, on met à jour (PATCH) au lieu de recréer
  const list = await (await fetch(BASE + '/api/admin/articles', { headers: { Cookie: cookie } })).json();
  const existing = (list.articles || []).find(a => a.slug === meta.slug);
  // Nouveau => brouillon (relu/publié par l'humain). Existant => on PRÉSERVE son statut (un publié reste publié, amélioré en place).
  const status = process.env.FORCE_STATUS || (existing ? (existing.status || 'brouillon') : 'brouillon');
  const payload = Object.assign({}, meta, { content, author: 'Lissanon Gildas', status });
  let r;
  if (existing) r = await fetch(BASE + '/api/admin/articles/' + existing._id, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(payload) });
  else r = await fetch(BASE + '/api/admin/articles', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(payload) });
  const j = await r.json().catch(() => ({}));
  console.log(meta.slug, '->', r.ok ? ((existing ? 'MAJ' : 'CRÉÉ') + ' [' + status + '] (' + content.length + ' car.)') : ('FAIL ' + (j.error || r.status)));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
