/**
 * Script utilitaire pour mettre à jour le mot de passe d'un utilisateur existant
 * Usage: node scripts/update-password.js <email> <nouveau_mot_de_passe>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const email = process.argv[2];
const newPassword = process.argv[3];
const mongoUri = process.argv[4] || process.env.MONGODB_URI;

if (!email || !newPassword) {
  console.log('Usage: node scripts/update-password.js <email> <nouveau_mot_de_passe> [MONGODB_URI]');
  process.exit(1);
}

if (!mongoUri) {
  console.error('Erreur: MONGODB_URI non trouvée. Veuillez la définir dans un fichier .env ou la passer en 3ème argument.');
  process.exit(1);
}

async function update() {
  try {
    console.log(`Connexion à MongoDB...`);
    await mongoose.connect(mongoUri);
    
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
