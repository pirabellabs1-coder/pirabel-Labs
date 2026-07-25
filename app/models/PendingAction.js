const mongoose = require('mongoose');

// Action SENSIBLE preparee par un agent IA et mise en attente de validation humaine.
// L'agent ne l'execute jamais lui-meme : il la depose ici, l'interface affiche une carte
// « Confirmer / Annuler », et l'execution reelle n'a lieu qu'apres accord explicite.
const pendingActionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', index: true },
  agent: { type: String, default: '' },              // agent qui a propose l'action
  tool: { type: String, required: true },            // nom de l'outil a executer
  input: { type: mongoose.Schema.Types.Mixed, default: {} },
  summary: { type: String, default: '', maxlength: 800 },   // resume lisible affiche a l'utilisateur
  risk: { type: String, enum: ['normal', 'eleve'], default: 'normal' }, // eleve = irreversible / sortant

  status: { type: String, enum: ['en_attente', 'confirmee', 'refusee', 'expiree'], default: 'en_attente', index: true },
  result: { type: String, default: '', maxlength: 2000 },   // message renvoye par l'execution
  executedAt: { type: Date },

  createdAt: { type: Date, default: Date.now, index: true },
  // Une action non confirmee expire au bout de 24 h (evite d'executer un ordre oublie).
  expiresAt: { type: Date, default: function () { return new Date(Date.now() + 24 * 3600 * 1000); } },
});

pendingActionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('PendingAction', pendingActionSchema);
