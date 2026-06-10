/**
 * WIPE DB - script destructif a executer 1 fois, manuellement.
 *
 * Drop toutes les collections SAUF :
 *   - users (role=admin) : conserves pour pouvoir se loguer
 *   - users (role autre) : supprimes
 *
 * USAGE (depuis local avec MONGODB_URI dans .env.local) :
 *   node scripts/WIPE_DB.js --dry          # preview
 *   node scripts/WIPE_DB.js --yes          # execute pour de vrai
 *
 * Apres execution : recreer admin si necessaire via CREATE_ADMIN.js
 */
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  const dry = process.argv.includes('--dry');
  const yes = process.argv.includes('--yes');
  if (!dry && !yes) {
    console.log('Usage: node scripts/WIPE_DB.js --dry | --yes');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI manquant. Configure .env.local');
    process.exit(1);
  }

  console.log('Connexion a MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('Collections trouvees :', collections.length);
  console.log(collections.map(c => '  - ' + c.name).join('\n'));
  console.log();

  // 1) Liste des admins actuels (avant wipe)
  const usersColl = db.collection('users');
  const admins = await usersColl.find({ role: 'admin' }).project({ _id: 1, email: 1, name: 1 }).toArray();
  console.log('Admins conserves :');
  admins.forEach(a => console.log('  - ' + a.email + ' (' + a._id + ')'));
  console.log();

  if (dry) {
    console.log('[DRY RUN] Aucune modification effectuee.');
    console.log('Actions qui seraient executees :');
    console.log('  - Drop ' + (collections.length - 1) + ' collections (toutes sauf users)');
    console.log('  - Delete users non-admin');
    await mongoose.disconnect();
    return;
  }

  // 2) Drop toutes les collections sauf "users"
  let dropped = 0;
  for (const c of collections) {
    if (c.name === 'users' || c.name.startsWith('system.')) continue;
    await db.collection(c.name).drop().catch(e => {
      console.warn('  ! drop ' + c.name + ' :', e.message);
    });
    dropped++;
    console.log('  - dropped ' + c.name);
  }

  // 3) Delete non-admin users
  const del = await usersColl.deleteMany({ role: { $ne: 'admin' } });
  console.log();
  console.log('Resultats :');
  console.log('  - ' + dropped + ' collections supprimees');
  console.log('  - ' + del.deletedCount + ' users non-admin supprimes');
  console.log('  - ' + admins.length + ' admins conserves');
  console.log();
  console.log('Base de donnees nettoyee. Prete pour le nouveau site.');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
