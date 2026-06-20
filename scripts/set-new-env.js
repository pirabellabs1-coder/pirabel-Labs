// Configure les variables d'env du nouveau projet Vercel via l'API. Ne logge aucun secret.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), https = require('https');
const TEAM = process.env.T2, TOKEN = process.env.VT2, PROJ = 'pirabel-labs';

function readEnv() {
  const o = {};
  const txt = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    v = v.replace(/\\n$/, '').trim();
    o[m[1]] = v;
  }
  return o;
}

const src = readEnv();
const jwt = crypto.randomBytes(48).toString('hex');
const vars = [
  ['JWT_SECRET', jwt],
  ['ADMIN_SECRET_PATH', src.ADMIN_SECRET_PATH || 'pirabel-admin-7x9k2m'],
  ['CLIENT_SECRET_PATH', src.CLIENT_SECRET_PATH || 'espace-client-4p8w1n'],
  ['RESEND_API_KEY', src.RESEND_API_KEY || ''],
  ['FROM_EMAIL', src.FROM_EMAIL || 'contact@pirabellabs.com'],
  ['ADMIN_EMAIL', src.ADMIN_EMAIL || 'contact@pirabellabs.com'],
  ['CONTACT_EMAIL', src.ADMIN_EMAIL || 'contact@pirabellabs.com'],
  ['SMTP_HOST', src.SMTP_HOST || ''],
  ['SMTP_PORT', src.SMTP_PORT || ''],
  ['SMTP_USER', src.SMTP_USER || ''],
  ['SMTP_PASS', src.SMTP_PASS || ''],
  ['JWT_EXPIRE', src.JWT_EXPIRE || '7d'],
  ['SITE_URL', 'https://www.pirabellabs.com'],
].filter(([k, v]) => v !== '' && v != null);

function post(key, value) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ key, value, type: 'encrypted', target: ['production', 'preview', 'development'] });
    const req = https.request({
      hostname: 'api.vercel.com', path: `/v10/projects/${PROJ}/env?teamId=${TEAM}`, method: 'POST',
      headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => resolve({ status: r.statusCode, d })); });
    req.on('error', reject); req.write(body); req.end();
  });
}

(async () => {
  for (const [k, v] of vars) {
    const r = await post(k, v);
    let msg = '';
    try { const j = JSON.parse(r.d); msg = j.error ? j.error.message : 'ok'; } catch (e) { msg = r.d.slice(0, 80); }
    console.log(String(r.status).padEnd(4), k.padEnd(20), '->', msg);
  }
  console.log('DONE (', vars.length, 'vars ). JWT_SECRET genere (non affiche).');
})();
