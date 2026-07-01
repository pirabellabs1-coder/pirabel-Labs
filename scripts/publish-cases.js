// Publie (ou met à jour) des études de cas depuis un fichier JSON (tableau).
// usage: (ADMIN_PW=.. | ADMIN_TOKEN=..) node scripts/publish-cases.js <cases.json>
// Chaque objet doit contenir au moins { title, content }. status par défaut: publie.
const fs = require('fs');
const BASE = process.env.BASE || 'https://www.pirabellabs.com';
const PASS = process.env.ADMIN_PW;

(async () => {
  const file = process.argv[2] || 'scripts/_cases-batch2.json';
  if (!fs.existsSync(file) || (!PASS && !process.env.ADMIN_TOKEN)) {
    console.error('usage: (ADMIN_PW=.. | ADMIN_TOKEN=..) node scripts/publish-cases.js <cases.json>');
    process.exit(1);
  }
  const cases = JSON.parse(fs.readFileSync(file, 'utf8'));
  let cookie;
  if (process.env.ADMIN_TOKEN) {
    cookie = 'token=' + process.env.ADMIN_TOKEN;
  } else {
    const login = await fetch(BASE + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'contact@pirabellabs.com', password: PASS }) });
    cookie = ((login.headers.get('set-cookie') || '').match(/token=[^;]+/) || [''])[0];
    if (!cookie) { console.error('Login échoué (mauvais mot de passe ?).'); process.exit(1); }
  }
  // liste existante pour éviter les doublons (match par slug OU titre)
  const list = await (await fetch(BASE + '/api/admin/case-studies', { headers: { Cookie: cookie } })).json();
  const existingList = list.cases || [];
  let ok = 0, fail = 0;
  for (const c of cases) {
    const payload = Object.assign({ status: 'publie' }, c);
    const existing = existingList.find(x => (payload.slug && x.slug === payload.slug) || x.title === payload.title);
    let r;
    if (existing) r = await fetch(BASE + '/api/admin/case-studies/' + existing._id, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(payload) });
    else r = await fetch(BASE + '/api/admin/case-studies', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify(payload) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) { ok++; console.log((existing ? 'MAJ ' : 'CRÉÉ') + ' → ' + (j.caseStudy ? j.caseStudy.slug : payload.title)); }
    else { fail++; console.log('FAIL → ' + payload.title + ' : ' + (j.error || r.status)); }
  }
  console.log('\nTerminé : ' + ok + ' publiée(s), ' + fail + ' échec(s).');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
