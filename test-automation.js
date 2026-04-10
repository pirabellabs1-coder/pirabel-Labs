const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2 && !line.startsWith('#')) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key) process.env[key] = val;
    }
  });
} catch(e) { /* ignore */ }

const mongoose = require('mongoose');
const Order = require('./app/models/Order');
const { sendQuoteInteraction, sendOrderStatusUpdate } = require('./app/config/email');

async function testAutomation() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://pirabellabs:6CqKngWlU2Lq3A1D@cluster0.p713p.mongodb.net/pirabel?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connecté à la base de données.');

    // Répération de la dernière demande (Lead)
    const latestOrder = await Order.findOne().sort({ createdAt: -1 });
    
    if (!latestOrder) {
      console.log('Aucune demande trouvée dans la base de données.');
      process.exit(1);
    }

    console.log(`\n================================`);
    console.log(`Demande trouvée : ${latestOrder.name} - ${latestOrder.service}`);
    console.log(`Email de test : ${latestOrder.email}`);
    console.log(`================================\n`);

    console.log('1. Test Envoi "Devis Interactif"...');
    // On appelle la fonction telle que définie dans app/config/email.js
    const quoteSuccess = await sendQuoteInteraction(latestOrder);
    if (quoteSuccess) {
      console.log('✅ TEST REUSSI : Email du devis interactif envoyé avec succès !');
    } else {
      console.log('❌ TEST ECHOUE : Le mail de devis n\'a pas pu partir.');
    }

    console.log('\n2. Test Envoi "Statut Automatique" (ex: en traitement)...');
    const statusSuccess = await sendOrderStatusUpdate(latestOrder, 'en_traitement');
    if (statusSuccess) {
      console.log('✅ TEST REUSSI : Email de statut (En traitement) envoyé avec succès !');
    } else {
      console.log('❌ TEST ECHOUE : Le mail de statut automatique n\'a pas pu partir.');
    }
    
    console.log('\n🎉 Les tests de l\'automatisation sont terminés.');
    console.log('Veuillez vérifier la boîte mail ( ' + latestOrder.email + ' ) pour voir le rendu.');

  } catch (err) {
    console.error('Erreur durant les tests :', err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

testAutomation();
