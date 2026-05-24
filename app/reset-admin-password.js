/**
 * Reset du mot de passe d'un compte admin.
 *
 * Usage:
 *   cd app && node reset-admin-password.js
 *
 * Cible par defaut: contact@pirabellabs.com
 * Pour cibler un autre email: node reset-admin-password.js autre@email.com
 *
 * Le mot de passe genere est affiche UNE SEULE FOIS. Notez-le et changez-le
 * apres la premiere connexion via /settings.
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const envCandidates = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', '.env.local'),
];
const envFile = envCandidates.find(p => fs.existsSync(p));
if (envFile) {
  require('dotenv').config({ path: envFile });
  console.log(`Env charge depuis: ${envFile}`);
} else {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const User = require('./models/User');

const TARGET_EMAIL = (process.argv[2] || 'contact@pirabellabs.com').toLowerCase();

function generateStrongPassword(length = 24) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*-_=+?';
  const all = upper + lower + digits + symbols;

  const pick = (set) => set[crypto.randomInt(0, set.length)];

  const required = [pick(upper), pick(lower), pick(digits), pick(symbols)];
  const rest = Array.from({ length: length - required.length }, () => pick(all));
  const chars = [...required, ...rest];

  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('ERREUR: MONGODB_URI manquant. Lancez depuis le dossier app/ avec un .env charge,');
    console.error('ou exportez MONGODB_URI dans votre shell avant de relancer.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connecte.');

  const user = await User.findOne({ email: TARGET_EMAIL });

  if (!user) {
    console.log(`\nAucun compte trouve pour ${TARGET_EMAIL}.`);
    console.log('Comptes admin/employee existants:');
    const accounts = await User.find({ role: { $in: ['admin', 'employee'] } })
      .select('email role isActive lastLogin');
    if (accounts.length === 0) {
      console.log('  (aucun)');
      console.log('\nLancez "node seed.js" pour creer le compte admin par defaut.');
    } else {
      accounts.forEach(a => {
        console.log(`  - ${a.email}  [${a.role}]  active=${a.isActive}  lastLogin=${a.lastLogin || 'jamais'}`);
      });
    }
    await mongoose.disconnect();
    process.exit(1);
  }

  const newPassword = generateStrongPassword(24);
  user.password = newPassword;
  user.isActive = true;
  await user.save();

  console.log('\n========================================');
  console.log('  MOT DE PASSE REINITIALISE');
  console.log('========================================');
  console.log(`  Email:        ${user.email}`);
  console.log(`  Role:         ${user.role}`);
  console.log(`  Nouveau MDP:  ${newPassword}`);
  console.log('========================================');
  console.log('  URL de connexion (production):');
  console.log(`  https://www.pirabellabs.com/${process.env.ADMIN_SECRET_PATH || 'pirabel-admin-7x9k2m'}`);
  console.log('========================================');
  console.log('  IMPORTANT:');
  console.log('  1. Notez ce mot de passe MAINTENANT — il ne sera plus affiche.');
  console.log('  2. Changez-le immediatement apres la premiere connexion.');
  console.log('  3. Supprimez ce script si vous l\'avez stocke quelque part.');
  console.log('');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Erreur:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
