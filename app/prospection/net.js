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
        return settle(null, { status, location: res.headers.location });
      }
      const type = String(res.headers['content-type'] || '');
      if (type && !/text\/html|application\/xhtml|text\/plain/i.test(type)) {
        res.destroy();
        return settle(null, { status, body: '', type });
      }
      // Taille annoncée trop grande : refus immédiat, sans rien télécharger.
      const announced = Number(res.headers['content-length']);
      if (Number.isFinite(announced) && announced > MAX_BYTES) {
        res.destroy();
        return settle(null, { status, body: '', type, tooLarge: true });
      }
      const enc = String(res.headers['content-encoding'] || '').toLowerCase();
      let stream = res;
      if (enc === 'gzip' || enc === 'x-gzip') stream = res.pipe(zlib.createGunzip());
      else if (enc === 'deflate') stream = res.pipe(zlib.createInflate());
      else if (enc === 'br') stream = res.pipe(zlib.createBrotliDecompress());
      const chunks = [];
      let size = 0;
      const stop = () => { // arrête la décompression ET la réception (anti-bombe de décompression)
        if (stream !== res) { try { res.unpipe(stream); } catch (e) { /* déjà détaché */ } stream.destroy(); }
        res.destroy();
      };
      const finish = () => settle(null, { status, body: Buffer.concat(chunks).toString('utf8'), type });
      stream.on('data', (c) => {
        if (done) return;
        size += c.length;
        if (size > MAX_BYTES) { chunks.push(c.subarray(0, Math.max(0, c.length - (size - MAX_BYTES)))); stop(); finish(); return; }
        chunks.push(c);
      });
      stream.on('end', finish);
      stream.on('error', (e) => { stop(); if (chunks.length) finish(); else settle(e); });
      res.on('aborted', finish);
      res.on('error', (e) => { if (chunks.length) finish(); else settle(e); });
    });
    let done = false;
    const timer = setTimeout(() => { req.destroy(new Error('Délai dépassé')); }, timeoutMs);
    function settle(err, value) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (err) reject(err); else resolve(value);
    }
    req.on('timeout', () => req.destroy(new Error('Délai dépassé')));
    req.on('error', (e) => settle(e));
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
      r = await requestOnce(u, left); // délai interne : la requête est détruite à l'échéance
    } catch (e) {
      return { ok: false, error: e && e.code === 'EBLOCKED' ? 'Adresse privée refusée' : ((e && e.message) || 'Erreur réseau'), finalUrl: u.toString() };
    }
    if (r.location) {
      try { current = new URL(r.location, u).toString(); } catch (e) { return { ok: false, error: 'Redirection invalide', finalUrl: u.toString() }; }
      continue;
    }
    if (r.tooLarge) return { ok: false, error: 'Page trop volumineuse', finalUrl: u.toString() };
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

// ============================================================================
// Découverte GRATUITE via OpenStreetMap (Nominatim + Overpass) — sans clé ni carte.
// Alternative automatique à Google Places quand GOOGLE_PLACES_API_KEY est absente.
// ============================================================================
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const OVERPASS = 'https://overpass-api.de/api/interpreter';

// Secteur (FR, sans accent) -> filtres de tags OSM (fragments Overpass).
const OSM_SECTOR = {
  restaurant: ['["amenity"~"restaurant|fast_food|cafe"]'], 'fast food': ['["amenity"="fast_food"]'],
  hotel: ['["tourism"~"hotel|guest_house|hostel"]'], bar: ['["amenity"~"bar|pub|nightclub"]'],
  garage: ['["shop"~"car_repair|car"]'], mecanicien: ['["shop"="car_repair"]'],
  clinique: ['["amenity"~"clinic|doctors|hospital"]', '["healthcare"]'], medecin: ['["amenity"="doctors"]', '["healthcare"="doctor"]'],
  sante: ['["amenity"~"clinic|doctors|hospital|pharmacy|dentist"]', '["healthcare"]'],
  pharmacie: ['["amenity"="pharmacy"]'], dentiste: ['["amenity"="dentist"]'], opticien: ['["shop"="optician"]'],
  coiffure: ['["shop"~"hairdresser|beauty"]'], salon: ['["shop"~"hairdresser|beauty"]'], beaute: ['["shop"="beauty"]'],
  immobilier: ['["office"="estate_agent"]'], avocat: ['["office"="lawyer"]'], notaire: ['["office"="notary"]'],
  assurance: ['["office"="insurance"]'], comptable: ['["office"="accountant"]'], banque: ['["amenity"="bank"]'],
  boulangerie: ['["shop"="bakery"]'], patisserie: ['["shop"~"bakery|pastry|confectionery"]'],
  supermarche: ['["shop"~"supermarket|convenience"]'], epicerie: ['["shop"~"convenience|grocery"]'],
  boutique: ['["shop"~"clothes|shoes|fashion"]'], magasin: ['["shop"]'], commerce: ['["shop"]'],
  ecole: ['["amenity"~"school|college"]'], formation: ['["amenity"~"college|language_school"]', '["office"="educational_institution"]'],
  gym: ['["leisure"="fitness_centre"]'], sport: ['["leisure"~"fitness_centre|sports_centre"]'],
  entreprise: ['["office"]'], bureau: ['["office"]'], agence: ['["office"]'], hotellerie: ['["tourism"~"hotel|guest_house"]'],
};
const stripAccents = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

function osmFilters(sector) {
  const s = stripAccents(sector);
  // Cumule TOUS les secteurs reconnus dans la chaîne (une campagne peut en viser plusieurs).
  const matched = [];
  for (const key of Object.keys(OSM_SECTOR)) { if (s.includes(key)) OSM_SECTOR[key].forEach((f) => { if (!matched.includes(f)) matched.push(f); }); }
  if (matched.length) return { filters: matched, word: null };
  // Secteur inconnu : large (commerces + bureaux + services), filtré ensuite par le nom.
  return { filters: ['["shop"]', '["office"]', '["amenity"~"restaurant|cafe|bar|pharmacy|clinic|bank"]'], word: s.split(/\s+/)[0] };
}

async function geocodeCity(city, country, timeoutMs) {
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), timeoutMs || 12000);
  try {
    const q = encodeURIComponent([city, country].filter(Boolean).join(', '));
    const r = await fetch(`${NOMINATIM}?q=${q}&format=json&limit=1&addressdetails=0`, { headers: { 'User-Agent': UA, 'Accept-Language': 'fr' }, signal: ctrl.signal });
    const d = await r.json().catch(() => []);
    if (!Array.isArray(d) || !d[0] || !d[0].boundingbox) return null;
    const b = d[0].boundingbox.map(Number); // [south, north, west, east]
    if (b.some((x) => !isFinite(x))) return null;
    return { south: b[0], north: b[1], west: b[2], east: b[3] };
  } catch (e) { return null; } finally { clearTimeout(timer); }
}

async function searchOverpass({ sector, city, country, limit, timeoutMs, bbox: cachedBox }) {
  // bbox mise en cache (campaign.discovery) pour éviter de re-géocoder à chaque cycle.
  const box = cachedBox || await geocodeCity(city, country, Math.min(12000, timeoutMs || 90000));
  if (!box) return { ok: false, error: 'OpenStreetMap : ville introuvable (' + city + ')', places: [] };
  const { filters, word } = osmFilters(sector);
  const bbox = `${box.south},${box.west},${box.north},${box.east}`;
  const union = filters.map((f) => `nwr${f}["name"](${bbox});`).join('');
  // Délai serveur Overpass généreux : les instances publiques mettent souvent plusieurs dizaines de secondes.
  const query = `[out:json][timeout:90];(${union});out tags center ${Math.min(limit || 50, 120)};`;
  const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), timeoutMs || 90000);
  try {
    const r = await fetch(OVERPASS, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA }, body: 'data=' + encodeURIComponent(query), signal: ctrl.signal });
    if (!r.ok) return { ok: false, error: 'OpenStreetMap : HTTP ' + r.status, places: [] };
    const d = await r.json().catch(() => ({}));
    const els = Array.isArray(d.elements) ? d.elements : [];
    let places = els.map((el) => {
      const t = el.tags || {};
      return {
        id: (el.type || 'n') + '/' + el.id,
        name: t.name || '',
        website: t.website || t['contact:website'] || t.url || '',
        email: t.email || t['contact:email'] || '',
        phone: t.phone || t['contact:phone'] || t['contact:mobile'] || '',
        address: [t['addr:housenumber'], t['addr:street'], t['addr:city']].filter(Boolean).join(' '),
        lat: el.lat || (el.center && el.center.lat), lon: el.lon || (el.center && el.center.lon),
      };
    }).filter((p) => p.name);
    if (word) places = places.filter((p) => stripAccents(p.name).includes(word));
    // Priorité aux entreprises joignables (site ou e-mail), puis le reste.
    places.sort((a, b) => ((b.website || b.email ? 1 : 0) - (a.website || a.email ? 1 : 0)));
    return { ok: true, places, bbox: box };
  } catch (e) { return { ok: false, error: e && e.name === 'AbortError' ? 'OpenStreetMap : délai dépassé' : 'OpenStreetMap : erreur réseau', places: [] }; }
  finally { clearTimeout(timer); }
}

module.exports = { safeFetch, searchPlaces, searchOverpass, regionCode, UA, checkUrl };
