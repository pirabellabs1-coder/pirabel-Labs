// Configure la création auto de l'admin au boot (bootstrapAdmin). Affiche le mot de passe choisi.
const crypto = require('crypto'), https = require('https');
const TEAM = process.env.T2, TOKEN = process.env.VT2, PROJ = 'pirabel-labs';

function genPassword(len = 16) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const b = crypto.randomBytes(len);
  let p = '';
  for (let i = 0; i < len; i++) p += alphabet[b[i] % alphabet.length];
  return p;
}

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
  const email = 'contact@pirabellabs.com';
  const password = genPassword(16);
  const vars = [
    ['INITIAL_ADMIN_EMAIL', email],
    ['INITIAL_ADMIN_PASSWORD', password],
    ['INITIAL_ADMIN_NAME', 'Pirabel Labs'],
  ];
  for (const [k, v] of vars) {
    const r = await post(k, v);
    let msg = ''; try { const j = JSON.parse(r.d); msg = j.error ? j.error.message : 'ok'; } catch (e) { msg = r.d.slice(0, 80); }
    console.log(String(r.status).padEnd(4), k.padEnd(24), '->', msg);
  }
  console.log('\n=========================================');
  console.log('  LOGIN EMAIL :', email);
  console.log('  PASSWORD    :', password);
  console.log('=========================================');
})();
