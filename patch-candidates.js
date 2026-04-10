const fs = require('fs');

let file = './app/views/candidates.html';
let content = fs.readFileSync(file, 'utf8');

const replacement = `async function emailApp() {
  if (!currentApp) return;

  const statusEl = document.getElementById('m-status');
  const currentStatus = statusEl ? statusEl.value : currentApp.status;

  let prefilledBody = \`Bonjour \${currentApp.name},\\n\\n\`;

  switch(currentStatus) {
    case 'entretien':
      prefilledBody += "Suite à l'examen de votre candidature, nous avons le plaisir de vous informer que votre profil a retenu notre attention. Nous souhaitons vous inviter à un entretien pour discuter plus en détail de votre parcours.\\n\\nMerci de nous faire part de vos disponibilités pour les prochains jours.";
      break;
    case 'test':
      prefilledBody += "Votre candidature est toujours en cours d'évaluation. Pour passer à l'étape suivante, nous souhaiterions vous proposer un exercice technique pratique.\\n\\nVous trouverez les détails très prochainement par email.";
      break;
    case 'accepte':
      prefilledBody += "Nous avons l'immense plaisir de vous annoncer que votre candidature a été retenue ! Félicitations et bienvenue chez Pirabel Labs.\\n\\nNous vous enverrons rapidement les prochaines étapes.";
      break;
    case 'refuse':
      prefilledBody += "Nous vous remercions pour l'intérêt que vous avez porté à Pirabel Labs. Après étude attentive de votre profil, nous avons cependant décidé de ne pas y donner une suite favorable pour le moment.\\n\\nNous vous souhaitons une excellente continuation dans vos recherches.";
      break;
    case 'en_revue':
    case 'preselectionne':
      prefilledBody += "Votre candidature est actuellement en cours d'examen par notre équipe de recrutement. Nous l'analysons avec attention et reviendrons vers vous d'ici peu.";
      break;
    default:
      prefilledBody += "Nous avons bien reçu votre candidature et vous en remercions.\\n\\nL'équipe RH.";
  }

  const subject = prompt("Sujet de l'email :", \`Votre candidature - \${currentApp.jobTitle || 'Pirabel Labs'}\`);
  if (!subject) return;

  const body = prompt("Voici l'email généré (vous pouvez le modifier librement avant l'envoi) :", prefilledBody);
  if (!body) return;

  const r = await api('/recruitment/applications/' + currentApp._id + '/email', { method: 'POST', body: JSON.stringify({ subject, body }) });
  if (r.error) toast(r.error, 'error'); else toast('Email expédié avec succès !!');
}
`;

content = content.replace(/async function emailApp\(\) \{[\s\S]*?toast\('Email envoyé'\);\r?\n\}/, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log('candidates.html patché !');
