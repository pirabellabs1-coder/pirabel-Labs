// Inspecte / réinitialise l'admin sur une base dont l'URI vient d'un fichier .env.
// Usage: node scripts/reset-live-admin.js <envFilePath> [reset] [email]
const fs = require('fs'), crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../app/models/User');

function readKey(file, key) {
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (line.startsWith(key + '=')) {
      let v = line.slice(key.length + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      return v;
    }
  }
  return null;
}
function gen(len = 16) {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const b = crypto.randomBytes(len); let p = '';
  for (let i = 0; i < len; i++) p += a[b[i] % a.length];
  return p;
}

(async () => {
  const envFile = process.argv[2];
  const mode = (process.argv[3] || 'inspect').toLowerCase();
  const wantEmail = (process.argv[4] || '').trim().toLowerCase();
  let uri = readKey(envFile, 'MONGODB_URI');
  if (!uri) { console.error('NO_MONGODB_URI in', envFile); process.exit(1); }
  // sécurité : si la query contient un espace (corruption), on la retire
  if (/\?[^=]*\s/.test(uri)) uri = uri.split('?')[0];
  mongoose.set('bufferCommands', false);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 25000, socketTimeoutMS: 25000 });
  console.log('CONNECT_OK host=', mongoose.connection.host, 'db=', mongoose.connection.name);
  const all = await User.find({}).select('+password');
  const admins = all.filter(u => u.role === 'admin');
  console.log('TOTAL_USERS:', all.length, '| ADMINS:', admins.length);
  admins.forEach(a => console.log(`  - ${a.email} | name="${a.name}" | active=${a.isActive} | lastLogin=${a.lastLogin || 'jamais'}`));
  // compte aussi les autres collections pour montrer que les données sont là
  try {
    const cols = await mongoose.connection.db.listCollections().toArray();
    for (const c of cols) {
      const n = await mongoose.connection.db.collection(c.name).countDocuments();
      console.log(`  [collection] ${c.name}: ${n} doc(s)`);
    }
  } catch (e) { console.log('  (collections list err:', e.message, ')'); }

  if (mode === 'reset') {
    let target = wantEmail ? admins.find(a => a.email === wantEmail) : admins[0];
    if (!target) { console.error('AUCUN_ADMIN'); process.exit(1); }
    const pw = gen(16);
    target.password = pw; target.isActive = true;
    await target.save();
    console.log('\n==============================');
    console.log('RESET_OK email:', target.email);
    console.log('NEW_PASSWORD :', pw);
    console.log('==============================');
  }
  await mongoose.disconnect();
  process.exit(0);
})().catch(e => { console.error('ERR:', e.message); try { mongoose.disconnect(); } catch (_) {} process.exit(1); });
