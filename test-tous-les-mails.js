require('dotenv').config();
const { 
  notifyNewApplication, 
  sendApplicationConfirmation, 
  sendApplicationStatusUpdate,
  notifyNewOrder,
  sendEmail,
  masterTemplate
} = require('./app/config/email');

const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || 'contact@pirabellabs.com';

async function testEmails() {
  console.log('🔄 Envoi des emails de test en cours...');
  
  try {
    // 1. Test Newsletter Notification (Simulation)
    console.log('1️⃣ Envoi notification Newsletter...');
    await sendEmail(
      adminEmail,
      `Nouvel inscrit : newsletter — test@exemple.com`,
      masterTemplate({
        title: 'Nouvel Inscrit',
        subtitle: `Type : newsletter`,
        body: `
          <p><strong>Email :</strong> <a href="mailto:test@exemple.com" style="color:#FF5500;">test@exemple.com</a></p>
          <p><strong>Nom :</strong> Contact Test</p>
          <p><strong>Source :</strong> script-test</p>
          <p><strong>Type :</strong> newsletter</p>
        `,
        cta: 'Voir dans l\'admin',
        ctaUrl: `https://www.pirabellabs.com/subscribers`
      })
    );

    // 2. Test Notification Nouvelle Commande / Contact
    console.log('2️⃣ Envoi notification Formulaire Contact...');
    const fakeOrder = {
      name: 'Client Test',
      email: 'client@test.com',
      phone: '06 12 34 56 78',
      service: 'Création Site Web',
      budget: '5000€',
      message: 'Ceci est un message de test envoyé depuis le script pour vérifier que contact@pirabellabs.com fonctionne !'
    };
    await notifyNewOrder(fakeOrder);

    // 3. Test Notification Candidature (Admin)
    console.log('3️⃣ Envoi notification Nouvelle Candidature...');
    const fakeApp = {
      name: 'John Doe',
      email: 'john.doe@test.com',
      phone: '07 88 99 66 55',
      linkedin: 'https://linkedin.com/in/johndoe',
      portfolio: 'https://johndoe.design',
      coverLetter: 'Bonjour, je suis très intéressé par ce poste car je suis passionné par le web et votre agence me plaît beaucoup.'
    };
    const fakeJob = { title: 'Développeur Fullstack NodeJS' };
    await notifyNewApplication(fakeApp, fakeJob);

    // 4. Test Accusé de réception (Candidat)
    console.log('4️⃣ Envoi accusé réception (Simulé sur contact@pirabellabs.com pour le test)...');
    await sendApplicationConfirmation(adminEmail, fakeApp.name, fakeJob.title);

    // 5. Test Changement de statut de candidature
    console.log('5️⃣ Envoi changement de statut candidature (Simulé vers contact@pirabellabs.com)...');
    await sendApplicationStatusUpdate(adminEmail, fakeApp.name, fakeJob.title, 'entretien', 'Vous recevrez un lien Calendly d\'ici 1h.');

    console.log('\\n✅ TOUS LES TESTS SONT TERMINÉS ! Veuillez vérifier la boîte mail (', adminEmail, ').');

  } catch (error) {
    console.error('❌ Une erreur est survenue :', error);
  }
}

testEmails();
