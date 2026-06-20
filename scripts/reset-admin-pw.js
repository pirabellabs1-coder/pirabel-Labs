// Outil ponctuel : inspecter / réinitialiser le mot de passe admin.
// Usage:
//   node scripts/reset-admin-pw.js            -> inspecte (aucune modif)
//   node scripts/reset-admin-pw.js reset       -> réinitialise le mot de passe admin
//   node scripts/reset-admin-pw.js reset <email> -> cible un admin précis
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../app/models/User');

function genPassword(len = 16) {
  // alphabet sans caractères ambigus (0/O, 1/l/I)
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.randomBytes(len);
  let p = '';
  for (let i = 0; i < len; i++) p += alphabet[bytes[i] % alphabet.length];
  return p;
}

(async () => {
  const mode = (process.argv[2] || 'inspect').toLowerCase();
  const wantEmail = (process.argv[3] || '').trim().toLowerCase();
  if (!process.env.MONGODB_URI) { console.error('ERR: MONGODB_URI absent'); process.exit(1); }
  // L'URI stockée dans Vercel a une query string corrompue ("?pirabel =Cluster0").
  // On la nettoie pour le test local : on retire tout ce qui suit le '?'.
  let uri = process.env.MONGODB_URI;
  const q = uri.indexOf('?');
  if (q !== -1) uri = uri.slice(0, q);
  await mongoose.connect(uri);

  const all = await User.find({}).select('+password');
  const admins = all.filter(u => u.role === 'admin');
  console.log('TOTAL_USERS:', all.length, '| ADMINS:', admins.length);
  admins.forEach(a => console.log(`  - ${a.email} | name="${a.name}" | active=${a.isActive} | lastLogin=${a.lastLogin || 'jamais'} | hasHash=${!!a.password}`));

  if (mode === 'reset') {
    let target = wantEmail ? admins.find(a => a.email === wantEmail) : null;
    if (!target) {
      const envEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      target = admins.find(a => a.email === envEmail) || admins[0];
    }
    if (!target) { console.error('AUCUN_ADMIN_A_RESET'); process.exit(1); }
    const newPw = genPassword(16);
    target.password = newPw; // le hook pre-save (bcrypt cost 12) hache automatiquement
    target.isActive = true;
    await target.save();
    console.log('RESET_OK_EMAIL:', target.email);
    console.log('NEW_PASSWORD:', newPw);
  }

  await mongoose.disconnect();
  process.exit(0);
})().catch(e => { console.error('ERR:', e.message); try { mongoose.disconnect(); } catch (_) {} process.exit(1); });
