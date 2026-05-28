#!/usr/bin/env node
/**
 * Reset admin password directement sur MongoDB (raw, sans modele).
 *
 * Usage:
 *   node scripts/reset-admin-password.js <email> <new-password>
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const [, , emailArg, newPasswordArg] = process.argv;
if (!emailArg || !newPasswordArg) {
  console.error('Usage: node scripts/reset-admin-password.js <email> <new-password>');
  process.exit(1);
}
if (newPasswordArg.length < 8) {
  console.error('ERREUR: nouveau mot de passe min 8 caracteres.');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERREUR: MONGODB_URI absent dans .env.local');
  process.exit(1);
}

const email = emailArg.toLowerCase().trim();

(async () => {
  try {
    console.log('Connexion a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 30000,
    });
    console.log('  -> Connecte');

    // Bypass model : utilise la collection raw
    const db = mongoose.connection.db;
    const users = db.collection('users');

    const hash = await bcrypt.hash(newPasswordArg, 12);
    const user = await users.findOne({ email });

    if (!user) {
      console.log(`Compte "${email}" introuvable -> creation comme admin.`);
      const newUser = {
        name: 'Admin Pirabel Labs',
        email,
        password: hash,
        role: 'admin',
        phone: '',
        avatar: '',
        isActive: true,
        totpEnabled: false,
        totpSecret: '',
        createdAt: new Date(),
      };
      const ins = await users.insertOne(newUser);
      console.log('\n[OK] Compte admin CREE.');
      console.log(`     Email   : ${email}`);
      console.log(`     Role    : admin`);
      console.log(`     ID      : ${ins.insertedId}`);
      console.log('\nConnexion: https://www.pirabellabs.com/login');
    } else {
      const update = { password: hash, isActive: true };
      if (user.role !== 'admin') {
        console.warn(`!! Compte non-admin (${user.role}) -> promotion en admin.`);
        update.role = 'admin';
      }
      await users.updateOne({ _id: user._id }, { $set: update });
      console.log('\n[OK] Mot de passe admin REINITIALISE.');
      console.log(`     Email   : ${user.email}`);
      console.log(`     Role    : ${update.role || user.role}`);
      console.log(`     ID      : ${user._id}`);
      console.log('\nConnexion: https://www.pirabellabs.com/login');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('ERREUR:', err.message);
    try { await mongoose.disconnect(); } catch {}
    process.exit(3);
  }
})();
