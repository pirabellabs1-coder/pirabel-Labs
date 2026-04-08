require('dotenv').config();
const { sendEmail, masterTemplate } = require('./app/config/email');

async function test() {
  console.log('Testing email directly to contact@pirabellabs.com');
  const success = await sendEmail(
    'contact@pirabellabs.com',
    'Test Email Automatique Pirabel Labs',
    masterTemplate({
      title: 'Email de Test',
      body: '<p>Ceci est un test pour vérifier que les formulaires envoient bien à contact@pirabellabs.com</p>',
      cta: 'Aller sur le site',
      ctaUrl: 'https://pirabellabs.com'
    })
  );
  if (success) {
    console.log('✅ Email envoyé avec succès à contact@pirabellabs.com');
  } else {
    console.log('❌ Echec lors de l\'envoi');
  }
}

test();
