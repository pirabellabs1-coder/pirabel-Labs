// ============================================================================
// PROSPECTION IA — accès réseau
// ----------------------------------------------------------------------------
// safeFetch : récupère une page d'un site de prospect sans jamais atteindre une
// adresse privée / locale (anti-SSRF) : http/https uniquement, ports 80/443,
// résolution DNS contrôlée AU MOMENT de la connexion (pas de contournement par
// re-résolution), 3 redirections maximum (revérifiées), 1,5 Mo maximum, délai
// borné. searchPlaces : Google Places API (New) — Text Search.
// ============================================================================
const http = require('http');
const https = require('https');
const dns = require('dns');
const zlib = require('zlib');
const { isPrivateIp } = require('./core');

const UA = 'PirabelLabsBot/1.0 (+https://www.pirabellabs.com)';
const MAX_BYTES = 1.5 * 1024 * 1024;

// Résolution DNS qui refuse toute adresse privée : utilisée par le socket lui-même.
function safeLookup(hostname, options, cb) {
  if (typeof options === 'function') { cb = options; options = {}; }
  dns.lookup(hostname, { all: true }, (err, addrs) => {
    if (err) return cb(err);
    const list = Array.isArray(addrs) ? addrs : [];
    if (!list.length) return cb(new Error('DNS vide'));
    if (list.some((a) => isPrivateIp(a.address))) {
      const e = new Error('Adresse privée refusée'); e.code = 'EBLOCKED'; return cb(e);
    }
    if (options && options.all) return cb(null, list);
    return cb(null, list[0].address, list[0].family);
  });
}

function checkUrl(raw) {
  let u;
  try { u = new URL(raw); } catch (e) { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (u.username || u.password) return null;
  if (u.port && !['80', '443'].includes(u.port)) return null;
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return null;
  // IP littérale : vérifiée directement
  if (/^[\d.]+$/.test(host) || host.includes(':')) { if (isPrivateIp(host)) return null; }
  return u;
}

function requestOnce(u, timeoutMs) {
  return new Promise((resolve, reject) => {
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.request(u, {
      method: 'GET',
      lookup: safeLookup,
      timeout: timeoutMs,
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
        'Accept-Language': 'fr,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    }, (res) => {
      const status = res.statusCode || 0;
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume();
        return resolve({ status, location: res.headers.location });
      }
      const type = String(res.headers['content-type'] || '');
      if (type && !/text\/html|application\/xhtml|text\/plain/i.test(type)) {
        res.destroy();
        return resolve({ status, body: '', type });
      }
      const enc = String(res.headers['content-encoding'] || '').toLowerCase();
      let stream = res;
      if (enc === 'gzip' || enc === 'x-gzip') stream = res.pipe(zlib.createGunzip());
      else if (enc === 'deflate') stream = res.pipe(zlib.createInflate());
      else if (enc === 'br') stream = res.pipe(zlib.createBrotliDecompress());
      const chunks = [];
      let size = 0;
      let done = false;
      const finish = () => { if (done) return; done = true; resolve({ status, body: Buffer.concat(chunks).toString('utf8'), type }); };
      stream.on('data', (c) => {
        size += c.length;
        if (size > MAX_BYTES) { chunks.push(c.slice(0, Math.max(0, c.length - (size - MAX_BYTES)))); res.destroy(); finish(); return; }
        chunks.push(c);
      });
      stream.on('end', finish);
      stream.on('error', (e) => { if (!done) { done = true; chunks.length ? finish() : reject(e); } });
      res.on('aborted', finish);
    });
    req.on('timeout', () => req.destroy(new Error('Délai dépassé')));
    req.on('error', reject);
    req.end();
  });
}

// Renvoie { ok, status, body, finalUrl, loadMs, error }.
async function safeFetch(rawUrl, opts) {
  const o = opts || {};
  const deadline = Date.now() + (o.timeoutMs || 6000);
  const t0 = Date.now();
  let current = rawUrl;
  for (let hop = 0; hop <= 3; hop++) {
    const u = checkUrl(current);
    if (!u) return { ok: false, error: 'URL refusée', finalUrl: current };
    const left = deadline - Date.now();
    if (left <= 200) return { ok: false, error: 'Délai dépassé', finalUrl: current };
    let r;
    try {
      r = await Promise.race([
        requestOnce(u, left),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Délai dépassé')), left + 50)),
      ]);
    } catch (e) {
      return { ok: false, error: e && e.code === 'EBLOCKED' ? 'Adresse privée refusée' : ((e && e.message) || 'Erreur réseau'), finalUrl: u.toString() };
    }
    if (r.location) {
      try { current = new URL(r.location, u).toString(); } catch (e) { return { ok: false, error: 'Redirection invalide', finalUrl: u.toString() }; }
      continue;
    }
    return { ok: r.status >= 200 && r.status < 400, status: r.status, body: r.body || '', finalUrl: u.toString(), loadMs: Date.now() - t0 };
  }
  return { ok: false, error: 'Trop de redirections', finalUrl: current };
}

// ---------------------------------------------------------------------------
// Google Places API (New) — Text Search
// ---------------------------------------------------------------------------
const PLACES_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.nationalPhoneNumber',
  'places.internationalPhoneNumber', 'places.websiteUri', 'places.rating', 'places.userRatingCount',
  'places.googleMapsUri', 'places.businessStatus', 'nextPageToken',
].join(',');
const REGION_CODES = {
  'bénin': 'BJ', 'benin': 'BJ', 'togo': 'TG', 'sénégal': 'SN', 'senegal': 'SN', "côte d'ivoire": 'CI', 'côte d’ivoire': 'CI',
  'cote d\'ivoire': 'CI', 'burkina faso': 'BF', 'mali': 'ML', 'niger': 'NE', 'guinée': 'GN', 'guinee': 'GN', 'cameroun': 'CM',
  'gabon': 'GA', 'congo': 'CG', 'france': 'FR', 'belgique': 'BE', 'suisse': 'CH', 'canada': 'CA', 'maroc': 'MA', 'tunisie': 'TN',
};
function regionCode(country) { return REGION_CODES[String(country || '').trim().toLowerCase()] || ''; }

async function searchPlaces({ apiKey, query, country, pageToken, timeoutMs }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs || 6000);
  try {
    const body = { textQuery: String(query).slice(0, 200), languageCode: 'fr', pageSize: 20 };
    const rc = regionCode(country);
    if (rc) body.regionCode = rc;
    if (pageToken) body.pageToken = pageToken;
    const r = await fetch(PLACES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': FIELD_MASK },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (data && data.error && (data.error.status || data.error.message)) || ('HTTP ' + r.status);
      return { ok: false, error: 'Google Places : ' + String(msg).slice(0, 160), places: [] };
    }
    return { ok: true, places: Array.isArray(data.places) ? data.places : [], nextPageToken: data.nextPageToken || '' };
  } catch (e) {
    return { ok: false, error: e && e.name === 'AbortError' ? 'Google Places : délai dépassé' : 'Google Places : erreur réseau', places: [] };
  } finally { clearTimeout(timer); }
}

module.exports = { safeFetch, searchPlaces, regionCode, UA, checkUrl };
