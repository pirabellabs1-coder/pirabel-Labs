// Importe les articles statiques article-*.html dans le CMS (POST /api/admin/articles).
// Lit chaque fichier, extrait titre/catégorie/intro/contenu/image, et publie.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const BASE = process.env.BASE || 'https://www.pirabellabs.com';
const EMAIL = process.env.ADMIN_LOGIN || 'contact@pirabellabs.com';
const PASS = process.env.ADMIN_PW;

function pick(re, html, g) { const m = html.match(re); return m ? (m[g || 1] || '').trim() : ''; }
function stripTags(s) { return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(); }

function extract(file, html) {
  const wrapM = html.match(/<main class="article-wrap">([\s\S]*?)<\/main>/i);
  const wrap = wrapM ? wrapM[1] : html;
  const title = stripTags(pick(/<h1[^>]*>([\s\S]*?)<\/h1>/i, wrap)) ||
    pick(/<title>([^<]*)<\/title>/i, html).replace(/\s*[-|–].*$/, '').trim();
  const category = stripTags(pick(/article-meta__pill"[^>]*>\s*(?:<span[^>]*>[^<]*<\/span>)?\s*([^<]+)</i, wrap)) || 'Marketing';
  const intro = stripTags(pick(/<p class="article-intro">([\s\S]*?)<\/p>/i, wrap));
  const metaDesc = pick(/<meta name="description" content="([^"]*)"/i, html);
  let ogImage = pick(/<meta property="og:image" content="([^"]*)"/i, html);
  if (/og-(default|blog|home)/i.test(ogImage)) ogImage = ''; // ignore images génériques
  // contenu : après l'intro jusqu'au CTA
  let body = wrap;
  const ai = body.indexOf('article-intro');
  if (ai > -1) { const e = body.indexOf('</p>', ai); if (e > -1) body = body.slice(e + 4); }
  const cta = body.indexOf('<div class="article-cta">');
  if (cta > -1) body = body.slice(0, cta);
  body = body.replace(/<!--[\s\S]*?-->/g, '').trim();
  const slug = file.replace(/^article-/, '').replace(/\.html$/, '');
  return {
    title, slug, category, excerpt: (intro || metaDesc).slice(0, 480),
    metaDescription: metaDesc || intro.slice(0, 300),
    seoTitle: pick(/<title>([^<]*)<\/title>/i, html),
    featuredImage: ogImage, content: body, status: 'publie',
  };
}

async function main() {
  if (!PASS) { console.error('ADMIN_PW manquant'); process.exit(1); }
  const login = await fetch(BASE + '/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const setCookie = login.headers.get('set-cookie') || '';
  const cookie = (setCookie.match(/token=[^;]+/) || [''])[0];
  if (!cookie) { console.error('Login échoué'); process.exit(1); }
  console.log('Login OK');

  const files = fs.readdirSync(root).filter(f => /^article-.*\.html$/.test(f));
  let ok = 0, fail = 0;
  for (const f of files) {
    const data = extract(f, fs.readFileSync(path.join(root, f), 'utf8'));
    if (!data.title || data.title.length < 3) { console.log('SKIP (pas de titre):', f); fail++; continue; }
    const r = await fetch(BASE + '/api/admin/articles', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify(data),
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.success) { console.log('OK  ', data.slug, '|', data.title.slice(0, 50)); ok++; }
    else { console.log('FAIL', f, '->', j.error || r.status); fail++; }
  }
  console.log(`\nImport terminé : ${ok} publiés, ${fail} échecs.`);
}
main().catch(e => { console.error('ERR', e.message); process.exit(1); });
