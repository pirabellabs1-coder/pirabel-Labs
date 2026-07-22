// Soumet toutes les URLs du sitemap a IndexNow (Bing, Yandex, Naver, Seznam).
// Usage : node scripts/submit-indexnow.js
// A relancer apres toute mise a jour significative du site (nouvelles pages,
// gros changements de contenu). IndexNow ne remplace pas le crawl normal,
// il accelere juste la decouverte des changements.
const HOST = 'www.pirabellabs.com';
const KEY = '0e27c5d120a2fcce5535edebb5f5ad95';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function main() {
  console.log('Lecture du sitemap :', SITEMAP_URL);
  const xml = await fetch(SITEMAP_URL).then(r => {
    if (!r.ok) throw new Error('sitemap.xml a repondu ' + r.status);
    return r.text();
  });
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  if (!urls.length) throw new Error('Aucune URL trouvee dans le sitemap.');
  console.log(urls.length, 'URLs trouvees.');

  // IndexNow accepte jusqu'a 10 000 URLs par requete ; on decoupe par prudence par lots de 1000.
  const BATCH = 1000;
  for (let i = 0; i < urls.length; i += BATCH) {
    const chunk = urls.slice(i, i + BATCH);
    const payload = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: chunk };
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const text = await res.text().catch(() => '');
    console.log(`Lot ${i / BATCH + 1} (${chunk.length} URLs) -> HTTP ${res.status} ${text ? '- ' + text.slice(0, 200) : ''}`);
    if (res.status === 400 && /SiteVerificationNotCompleted/i.test(text)) {
      console.log('  -> Cle publiee trop recemment, Bing n\'a pas encore recrawle le fichier de cle. Reessayer dans quelques minutes.');
    }
  }
}

main().catch(err => { console.error('Erreur IndexNow :', err.message); process.exit(1); });
