// Normalise les catégories d'articles (casse/libellés propres). ADMIN_TOKEN=.. node scripts/normalize-cats.js
const BASE = process.env.BASE || 'https://www.pirabellabs.com';
const TOKEN = process.env.ADMIN_TOKEN;
const PASS = process.env.ADMIN_PW;
const MAP = {
  'seo': 'SEO',
  'ia': 'IA', 'ia marketing': 'IA', 'claude': 'IA',
  'content': 'Contenu', 'contenu': 'Contenu',
  'ads': 'Publicité', 'publicité': 'Publicité', 'publicite': 'Publicité',
  'cro': 'Conversion', 'conversion': 'Conversion',
  'video': 'Vidéo', 'vidéo': 'Vidéo',
  'design': 'Design',
  'email': 'E-mail', 'e-mail': 'E-mail',
  'social media': 'Réseaux sociaux', 'réseaux sociaux': 'Réseaux sociaux',
  'sites web': 'Sites web',
  'automatisation': 'Automatisation',
  'stratégie': 'Stratégie', 'strategie': 'Stratégie',
};
(async () => {
  let cookie;
  if (TOKEN) cookie = 'token=' + TOKEN;
  else {
    const login = await fetch(BASE + '/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'contact@pirabellabs.com', password: PASS }) });
    cookie = ((login.headers.get('set-cookie') || '').match(/token=[^;]+/) || [''])[0];
  }
  const list = await (await fetch(BASE + '/api/admin/articles', { headers: { Cookie: cookie } })).json();
  let changed = 0;
  for (const a of (list.articles || [])) {
    const cur = a.category || '';
    const target = MAP[cur.toLowerCase().trim()];
    if (target && target !== cur) {
      const r = await fetch(BASE + '/api/admin/articles/' + a._id, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify({ category: target }) });
      console.log((r.ok ? 'OK  ' : 'FAIL ') + a.slug + ' : "' + cur + '" -> "' + target + '"');
      changed++;
    }
  }
  console.log('--- ' + changed + ' catégorie(s) normalisée(s) ---');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
