/**
 * Script de creation du compte admin par defaut
 * Usage: node seed.js
 *
 * Identifiants par defaut:
 *   Email:    admin@pirabel-labs.com
 *   Mot de passe: PirabelAdmin2026!
 *   Role:     admin
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connecte');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@pirabel-labs.com' });
    if (existing) {
      console.log('Le compte admin existe deja.');
      console.log('Email: admin@pirabel-labs.com');
      console.log('(mot de passe inchange)');
      process.exit(0);
    }

    // Create admin account
    const admin = await User.create({
      name: 'Admin Pirabel',
      email: 'admin@pirabel-labs.com',
      password: 'PirabelAdmin2026!',
      role: 'admin',
      isActive: true
    });

    console.log('\n================================');
    console.log('  COMPTE ADMIN CREE AVEC SUCCES');
    console.log('================================');
    console.log('  Email:      admin@pirabel-labs.com');
    console.log('  Mot de passe: PirabelAdmin2026!');
    console.log('  Role:       admin');
    console.log('  ID:         ' + admin._id);
    console.log('================================');
    console.log('\n  URL de connexion admin:');
    console.log('  http://localhost:' + (process.env.PORT || 3000) + '/' + (process.env.ADMIN_SECRET_PATH || 'pirabel-admin-7x9k2m'));
    console.log('\n  URL espace client:');
    console.log('  http://localhost:' + (process.env.PORT || 3000) + '/' + (process.env.CLIENT_SECRET_PATH || 'espace-client-4p8w1n'));
    console.log('\n  IMPORTANT: Changez le mot de passe apres la premiere connexion!');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
}

seed();
