/**
 * CREATE_ADMIN - cree ou reset un compte admin.
 *
 * USAGE (avec MONGODB_URI dans .env.local) :
 *   node scripts/CREATE_ADMIN.js <email> <password> [name]
 *
 * Exemple :
 *   node scripts/CREATE_ADMIN.js contact@pirabellabs.com MyStrongPass123! "Lissanon Gildas"
 *
 * Si l'email existe deja : reset le mot de passe + role=admin.
 * Sinon : cree un nouveau compte admin.
 */
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function main() {
  const [, , email, password, ...nameParts] = process.argv;
  if (!email || !password) {
    console.log('Usage: node scripts/CREATE_ADMIN.js <email> <password> [name]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Mot de passe trop court (8 chars minimum).');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('FATAL: MONGODB_URI manquant.');
    process.exit(1);
  }

  const name = nameParts.join(' ').trim() || email.split('@')[0];
  await mongoose.connect(process.env.MONGODB_URI);
  const users = mongoose.connection.db.collection('users');
  const hash = await bcrypt.hash(password, 12);

  const existing = await users.findOne({ email: email.toLowerCase() });
  if (existing) {
    await users.updateOne(
      { _id: existing._id },
      { $set: { password: hash, role: 'admin', isActive: true, name } }
    );
    console.log('Admin reset :', email, '(id:', existing._id + ')');
  } else {
    const r = await users.insertOne({
      name, email: email.toLowerCase(), password: hash,
      role: 'admin', isActive: true,
      createdAt: new Date(),
    });
    console.log('Admin cree :', email, '(id:', r.insertedId + ')');
  }
  await mongoose.disconnect();
}

main().catch(err => { console.error('Erreur:', err); process.exit(1); });
