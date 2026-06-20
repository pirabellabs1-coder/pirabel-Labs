// Configure le reset admin (bootstrapAdmin + ADMIN_FORCE_RESET) sur un projet Vercel via l'API (upsert).
const crypto = require('crypto'), https = require('https');
const TEAM = process.env.TEAMID, TOKEN = process.env.TOKEN, PROJ = process.env.PROJ || 'pirabel-labs';
const FORCE = process.env.FORCE || 'true';
const PWD = process.env.PWD_OVERRIDE || '';

function gen(len = 16) {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const b = crypto.randomBytes(len); let p = '';
  for (let i = 0; i < len; i++) p += a[b[i] % a.length];
  return p;
}
function put(key, value) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ key, value, type: 'encrypted', target: ['production', 'preview', 'development'] });
    const req = https.request({
      hostname: 'api.vercel.com', path: `/v10/projects/${PROJ}/env?teamId=${TEAM}&upsert=true`, method: 'POST',
      headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => resolve({ status: r.statusCode, d })); });
    req.on('error', reject); req.write(body); req.end();
  });
}
(async () => {
  const email = 'contact@pirabellabs.com';
  const password = PWD || gen(16);
  const vars = [
    ['INITIAL_ADMIN_EMAIL', email],
    ['INITIAL_ADMIN_PASSWORD', password],
    ['INITIAL_ADMIN_NAME', 'Pirabel Labs'],
    ['ADMIN_FORCE_RESET', FORCE],
  ];
  for (const [k, v] of vars) {
    const r = await put(k, v);
    let msg = ''; try { const j = JSON.parse(r.d); msg = j.error ? j.error.message || j.error.code : 'ok'; } catch (e) { msg = r.d.slice(0, 80); }
    console.log(String(r.status).padEnd(4), k.padEnd(24), '->', msg);
  }
  console.log('\n==============================');
  console.log('  LOGIN EMAIL :', email);
  console.log('  PASSWORD    :', password);
  console.log('  FORCE_RESET :', FORCE);
  console.log('==============================');
})();
