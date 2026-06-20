// Normalise tous les articles : auteur = Lissanon Gildas + statut = publie (les "published" cachés réapparaissent).
const BASE = process.env.BASE || 'https://www.pirabellabs.com';
const PASS = process.env.ADMIN_PW;
(async () => {
  if (!PASS) { console.error('ADMIN_PW manquant'); process.exit(1); }
  const login = await fetch(BASE + '/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'contact@pirabellabs.com', password: PASS }),
  });
  const cookie = ((login.headers.get('set-cookie') || '').match(/token=[^;]+/) || [''])[0];
  if (!cookie) { console.error('login échoué'); process.exit(1); }
  const list = await (await fetch(BASE + '/api/admin/articles', { headers: { Cookie: cookie } })).json();
  const arts = list.articles || [];
  let ok = 0, fail = 0;
  for (const a of arts) {
    const r = await fetch(BASE + '/api/admin/articles/' + a._id, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ author: 'Lissanon Gildas', status: 'publie' }),
    });
    if (r.ok) ok++; else { fail++; console.log('FAIL', a.slug, r.status); }
  }
  console.log('normalisés:', ok, '| échecs:', fail, '| total:', arts.length);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
