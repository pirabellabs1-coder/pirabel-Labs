const fs = require('fs');
let file = './app/views/candidates.html';
let content = fs.readFileSync(file, 'utf8');

const updatedModalHtml = `    <div class="field" style="margin-top:1rem;"><label>Lettre de motivation</label><div style="background:var(--bg);padding:.75rem;border:1px solid var(--border);font-size:.8rem;white-space:pre-wrap;">\${escapeHtml(app.coverLetter || 'Aucune')}</div></div>
    <div class="field"><label>Statut</label>
      <select id="m-status" onchange="updateEmailBody()">\${STATUSES.map(s => \`<option value="\${s.key}" \${app.status === s.key ? 'selected' : ''}>\${s.label}</option>\`).join('')}</select>
    </div>
    <div class="field"><label>Note (1-5 étoiles)</label>
      <select id="m-rating">\${[0, 1, 2, 3, 4, 5].map(n => \`<option value="\${n}" \${app.rating === n ? 'selected' : ''}>\${n} étoile\${n > 1 ? 's' : ''}</option>\`).join('')}</select>
    </div>
    <div class="field"><label>Notes internes</label><textarea id="m-notes">\${escapeHtml(app.notes || '')}</textarea></div>
    
    <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--border);">
      <h4 style="margin-bottom:0.75rem; font-size:1rem; display:flex; align-items:center; gap:0.5rem;"><span class="material-symbols-outlined" style="font-size:1.1rem;color:var(--accent);">mail</span> Rédaction Email (Manuel)</h4>
      <div class="field" style="margin-bottom:0.5rem;"><label style="font-size:0.75rem;">Sujet</label><input type="text" id="m-email-subject" value="Votre candidature - \${escapeHtml(app.jobTitle || 'Pirabel Labs')}"></div>
      <div class="field"><label style="font-size:0.75rem;">Contenu (Pré-rempli selon le statut)</label><textarea id="m-email-body" rows="6"></textarea></div>
    </div>
    
    <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem;">
      <button class="btn-primary" onclick="saveApp()">Enregistrer les modifications</button>
      <button class="btn-secondary" onclick="emailApp()">Envoyer cet email</button>
      <button class="btn-danger" onclick="deleteApp()" style="margin-left:auto;">Supprimer</button>
    </div>
  \`;
  document.getElementById('modal').classList.add('show');
  updateEmailBody();
}

function updateEmailBody() {
  if (!currentApp) return;
  const status = document.getElementById('m-status').value;
  let body = \`Bonjour \${currentApp.name},\\n\\n\`;
  
  switch(status) {
    case 'entretien':
      body += "Suite à l'examen de votre candidature, nous avons le plaisir de vous informer que votre profil a retenu notre attention. Nous souhaitons vous inviter à un entretien pour discuter plus en détail de votre parcours.\\n\\nMerci de nous faire part de vos disponibilités pour les prochains jours.";
      break;
    case 'test':
      body += "Votre candidature est toujours en cours d'évaluation. Pour passer à l'étape suivante, nous souhaiterions vous proposer un exercice technique pratique.\\n\\nVous trouverez les détails très prochainement par email.";
      break;
    case 'accepte':
      body += "Nous avons l'immense plaisir de vous annoncer que votre candidature a été retenue ! Félicitations et bienvenue chez Pirabel Labs.\\n\\nNous vous enverrons rapidement les prochaines étapes.";
      break;
    case 'refuse':
      body += "Nous vous remercions pour l'intérêt que vous avez porté à Pirabel Labs. Après étude attentive de votre profil, nous avons cependant décidé de ne pas y donner une suite favorable pour le moment.\\n\\nNous vous souhaitons une excellente continuation dans vos recherches.";
      break;
    case 'en_revue':
    case 'preselectionne':
      body += "Votre candidature est actuellement en cours d'examen par notre équipe de recrutement. Nous l'analysons avec attention et reviendrons vers vous d'ici peu.";
      break;
    default:
      body += "Nous avons bien reçu votre candidature et vous en remercions.\\n\\nL'équipe RH.";
  }
  document.getElementById('m-email-body').value = body;
}

function closeModal() {`;

// Replace HTML injection and add update function
content = content.replace(/    <div class="field" style="margin-top:1rem;"><label>Lettre de motivation[\s\S]*?function closeModal\(\) \{/, updatedModalHtml);

// Replace emailApp
const newEmailApp = `async function emailApp() {
  if (!currentApp) return;
  const subject = document.getElementById('m-email-subject').value;
  const body = document.getElementById('m-email-body').value;
  
  if (!subject || !body) return toast('Sujet et contenu requis', 'error');
  
  const r = await api('/recruitment/applications/' + currentApp._id + '/email', { method: 'POST', body: JSON.stringify({ subject, body }) });
  if (r.error) toast(r.error, 'error'); else toast('Email expédié au candidat !');
}`;

content = content.replace(/async function emailApp\(\) \{[\s\S]*?toast\('Email envoyé'\);\r?\n\}/, newEmailApp);

fs.writeFileSync(file, content, 'utf8');
console.log('candidates.html ENTIÈREMENT patché (NO PROMPT) !');
