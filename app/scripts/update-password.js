/**
 * Script utilitaire pour mettre à jour le mot de passe d'un utilisateur existant
 * Usage: node scripts/update-password.js <email> <nouveau_mot_de_passe>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node scripts/update-password.js <email> <nouveau_mot_de_passe>');
  process.exit(1);
}

async function update() {
  try {
    console.log(`Connexion à MongoDB...`);
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.error(`Erreur: Utilisateur avec l'email ${email} non trouvé.`);
      process.exit(1);
    }

    user.password = newPassword;
    await user.save();

    console.log('============================================');
    console.log('  MOT DE PASSE MIS À JOUR AVEC SUCCÈS');
    console.log('============================================');
    console.log(`  Utilisateur : ${user.name} (${user.email})`);
    console.log(`  Nouveau MDP : ${newPassword}`);
    console.log('============================================');

    process.exit(0);
  } catch (err) {
    console.error('Erreur:', err.message);
    process.exit(1);
  }
}

update();
