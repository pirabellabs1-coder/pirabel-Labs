// Crée/met à jour les livres blancs en base depuis les JSON _lbNN.json.
// Usage: (ADMIN_TOKEN=.. | ADMIN_PW=..) node scripts/push-lb.js
const fs = require('fs');
const path = require('path');
const BASE = process.env.BASE || 'https://www.pirabellabs.com';
const TOKEN = process.env.ADMIN_TOKEN;
const PASS = process.env.ADMIN_PW;
(async () => {
  let cookie;
  if (TOKEN) cookie = 'token=' + TOKEN;
  else {
    const login = await fetch(BASE + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'contact@pirabellabs.com', password: PASS }) });
    cookie = ((login.headers.get('set-cookie') || '').match(/token=[^;]+/) || [''])[0];
  }
  const list = await (await fetch(BASE + '/api/admin/livres-blancs', { headers: { Cookie: cookie } })).json();
  const bySlug = {}; (list.livresBlancs || []).forEach(l => { bySlug[l.slug] = l._id; });
  const dir = path.join(__dirname);
  const files = fs.readdirSync(dir).filter(f => /^_lb\d+\.json$/.test(f)).sort();
  let created = 0, updated = 0;
  for (const file of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const slug = j.slug;
    const payload = {
      title: j.title, slug,
      description: j.description || (j.subtitle || ''),
      pages: j.pages || 0,
      pdfUrl: '/downloads/livre-blanc-' + slug + '.pdf',
      icon: j.icon || 'menu_book',
      category: j.category || 'Guide',
      toc: (j.sections || []).map(s => s.heading).filter(Boolean),
      status: 'publie',
    };
    let r;
    if (bySlug[slug]) { r = await fetch(BASE + '/api/admin/livres-blancs/' + bySlug[slug], { method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(payload) }); updated++; }
    else { r = await fetch(BASE + '/api/admin/livres-blancs', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(payload) }); created++; }
    const ok = r.ok ? 'OK' : ('FAIL ' + r.status);
    console.log(ok, (bySlug[slug] ? 'MAJ' : 'NEW'), slug, '(' + payload.pages + 'p, ' + payload.toc.length + ' sections)');
  }
  console.log('--- ' + created + ' créés, ' + updated + ' mis à jour ---');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
