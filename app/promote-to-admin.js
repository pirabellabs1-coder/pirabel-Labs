/**
 * Promeut un utilisateur existant au role 'admin' sans toucher au mot de passe.
 * Usage: node promote-to-admin.js <email>
 */
const path = require('path');
const fs = require('fs');

const envCandidates = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', '.env.local'),
];
const envFile = envCandidates.find(p => fs.existsSync(p));
if (envFile) {
  require('dotenv').config({ path: envFile });
  console.log(`Env charge depuis: ${envFile}`);
}

const mongoose = require('mongoose');
const User = require('./models/User');

const email = (process.argv[2] || '').toLowerCase();
if (!email) {
  console.error('Usage: node promote-to-admin.js <email>');
  process.exit(1);
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`Aucun utilisateur trouve pour ${email}`);
    process.exit(1);
  }
  const oldRole = user.role;
  user.role = 'admin';
  user.isActive = true;
  await user.save();
  console.log(`\nOK ${email}: role ${oldRole} -> admin (mot de passe inchange)`);
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
