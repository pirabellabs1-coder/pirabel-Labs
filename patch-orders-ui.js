const fs = require('fs');

let file = './app/views/orders.html';
let content = fs.readFileSync(file, 'utf8');

// 1. REPLACING THE HTML IN DETAIL MODAL
const newDetailSection = `    <!-- Notes section -->
    <div style="margin-top:1.5rem;border-top:1px solid var(--border);padding-top:1rem;">
      <div class="detail-label">Notes internes</div>
      <textarea class="notes-area" id="detail-notes" placeholder="Ajoutez des notes sur cette demande..."></textarea>
      <button class="btn btn-sm btn-ghost" style="margin-top:0.5rem;" onclick="saveNotes()">
        <span class="material-symbols-outlined" style="font-size:0.875rem;">save</span> Sauvegarder notes
      </button>
    </div>

    <!-- Email Editor -->
    <div style="margin-top:1.5rem; padding-top:1rem; border-top:1px solid var(--border);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
        <h4 style="font-size:1rem; display:flex; align-items:center; gap:0.5rem; margin:0;"><span class="material-symbols-outlined" style="font-size:1.1rem;color:var(--accent);">mail</span> Rédaction Email au Prospect</h4>
        <button class="btn btn-sm btn-secondary" onclick="emailOrder()">Envoyer Email</button>
      </div>
      <div class="form-group" style="margin-bottom:0.5rem;"><input type="text" id="m-email-subject" placeholder="Sujet" style="width:100%;background:var(--bg);border:1px solid var(--border);padding:0.5rem;color:var(--text);font-family:var(--font-b);outline:none;"></div>
      <div class="form-group"><textarea id="m-email-body" rows="6" style="width:100%;background:var(--bg);border:1px solid var(--border);padding:0.5rem;color:var(--text);font-family:var(--font-b);outline:none;resize:vertical;" placeholder="Contenu de l'email..."></textarea></div>
    </div>

    <!-- Actions -->
    <div style="display:flex;gap:1.5rem;margin-top:1.5rem;border-top:1px solid var(--border);padding-top:1rem;flex-wrap:wrap;align-items:center;">
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <select id="detail-status-select" onchange="updateDefaultOrderEmail()" style="background:var(--bg);border:1px solid var(--border);padding:0.5rem 1rem;color:var(--text);font-size:0.8125rem;font-family:var(--font-b);outline:none;">
          <option value="nouvelle">Nouvelle</option>
          <option value="en_traitement">En traitement</option>
          <option value="devis_envoye">Devis envoyé</option>
          <option value="acceptee">Acceptée</option>
          <option value="refusee">Refusée</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="updateDetailStatus()">Enregistrer Statut</button>
      </div>
      <button class="btn btn-ghost btn-sm" onclick="openConvertModal()" style="color:#1abc9c;border:1px solid #1abc9c;">
        <span class="material-symbols-outlined" style="font-size:0.875rem;">rocket_launch</span> Transformer en Client
      </button>
    </div>`;

content = content.replace(/    <!-- Notes section -->[\s\S]*?(?=<\/div>\s*<\/div>\s*<!-- Convert to Client Modal -->)/, newDetailSection + '\n  ');

// 2. ADDING THE JAVASCRIPT FUNCTIONS (updateDefaultOrderEmail, emailOrder, overriding viewOrder to call updateEmail)
// We need to inject these functions before `loadOrders();` at the bottom.

const jsScripts = `
async function emailOrder() {
  if (!currentOrder) return;
  const subject = document.getElementById('m-email-subject').value;
  const body = document.getElementById('m-email-body').value;
  
  if (!subject || !body) return toast('Sujet et contenu requis', 'error');
  
  const r = await fetch('/api/orders/' + currentOrder._id + '/email', { method: 'POST', headers, body: JSON.stringify({ subject, body }) });
  if (!r.ok) { const err = await r.json().catch(()=>({})); return toast(err.error || 'Erreur', 'error'); }
  toast('Email expédié avec succès au prospect !');
}

function updateDefaultOrderEmail() {
  if (!currentOrder) return;
  const status = document.getElementById('detail-status-select').value;
  const name = currentOrder.name || '';
  const service = currentOrder.service || 'notre service';
  
  let subject = "Votre demande Pirabel Labs";
  let body = \`Bonjour \${name},\\n\\n\`;
  
  switch(status) {
    case 'en_traitement':
      subject = "Votre demande est en cours d'analyse — Pirabel Labs";
      body += \`Nous vous confirmons la bonne réception de votre demande concernant \${service}.\\nNotre équipe étudie actuellement vos besoins avec une grande attention.\\n\\nNous reviendrons vers vous très prochainement pour vous proposer la meilleure approche.\`;
      break;
    case 'devis_envoye':
      subject = "Votre devis Pirabel Labs est prêt !";
      body += \`Suite à notre échange concernant votre projet de \${service}, j'ai le plaisir de vous faire parvenir notre devis.\\n\\n[Insérez le lien vers le devis de votre outil de facturation ici]\\n\\nNous restons à votre entière disposition pour répondre à toutes vos questions et espérons pouvoir démarrer cette belle collaboration ensemble.\`;
      break;
    case 'acceptee':
      subject = "Bienvenue chez Pirabel Labs !";
      body += \`Nous sommes ravis de vous compter parmi nos nouveaux clients ! Votre demande pour \${service} est officiellement validée.\\n\\nNotre équipe va rapidement prendre contact avec vous pour le lancement stratégique (Kick-off) du projet. D'ici là, nous préparons tout en coulisses.\`;
      break;
    case 'refusee':
      subject = "Suite à votre demande — Pirabel Labs";
      body += \`Nous vous remercions sincèrement pour l'intérêt que vous portez à Pirabel Labs.\\n\\nCependant, après étude de votre demande pour \${service}, nous sommes au regret de vous informer que nous ne pourrons pas y donner suite actuellement, car [Préciser la raison: agendas complets / projet hors scope].\\n\\nNous vous souhaitons pleine réussite dans vos projets.\`;
      break;
    default:
      subject = "Nous avons reçu votre demande — Pirabel Labs";
      body += \`Merci de nous avoir contactés pour votre besoin en \${service}.\\nUn expert va prendre en charge votre demande rapidement et vous contactera.\`;
  }
  
  document.getElementById('m-email-subject').value = subject;
  document.getElementById('m-email-body').value = body;
}

// Intercept status change for "acceptee" to trigger client conversion
const originalUpdateDetailStatus = updateDetailStatus;
updateDetailStatus = async function() {
  const newStatus = document.getElementById('detail-status-select').value;
  if (newStatus === 'acceptee') {
    // Check if it's already converted to prevent duplicating
    if(currentOrder.convertedToClient || currentOrder.convertedToProject) {
        toast('Cette commande est déjà convertie en projet/client.', 'info');
        return originalUpdateDetailStatus();
    }
    // Offer to automatically convert it
    toast('La validation lance la conversion automatique en Client...', 'info');
    openConvertModal();
    return;
  }
  return originalUpdateDetailStatus();
};

const originalViewOrder = viewOrder;
viewOrder = async function(id) {
  await originalViewOrder(id);
  updateDefaultOrderEmail(); // Pre-fill email body when modal opens
};

`;

content = content.replace(/loadOrders\(\);\s*<\/script>/, jsScripts + '\nloadOrders();\n</script>');

fs.writeFileSync(file, content, 'utf8');
console.log('orders.html ENTIÈREMENT patché (Emails pour Devis + Conversion automatique) !');
