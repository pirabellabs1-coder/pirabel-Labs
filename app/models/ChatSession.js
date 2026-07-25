const mongoose = require('mongoose');

// Conversation tenue par un visiteur avec l'assistant IA public.
// Conservee pour que l'equipe voie ce qui s'est dit, avec un resume et une
// qualification produits automatiquement par un agent.
const msgSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, default: '', maxlength: 4000 },
  at: { type: Date, default: Date.now },
}, { _id: false });

const chatSessionSchema = new mongoose.Schema({
  // Identifiant genere cote navigateur, stable le temps de la visite.
  sessionKey: { type: String, required: true, unique: true, index: true },
  messages: { type: [msgSchema], default: [] },

  // Rattachement au CRM des que le visiteur laisse ses coordonnees.
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },
  visitorName: { type: String, default: '', maxlength: 120 },
  visitorEmail: { type: String, default: '', lowercase: true, maxlength: 200 },
  capturedContact: { type: Boolean, default: false, index: true },
  bookedAppointment: { type: Boolean, default: false },

  // Analyse produite par l'agent (voir outil resumer_conversation).
  summary: { type: String, default: '', maxlength: 2000 },
  besoin: { type: String, default: '', maxlength: 500 },      // ce que veut le visiteur
  service: { type: String, default: '', maxlength: 120 },     // service concerne
  budget: { type: String, default: '', maxlength: 120 },      // budget evoque, tel quel
  echeance: { type: String, default: '', maxlength: 120 },    // delai evoque
  // Chaud : contact laisse + projet precis. Tiede : interet reel, sans contact.
  // Froid : simple curiosite. Non evalue : pas encore analyse.
  qualification: { type: String, enum: ['non_evalue', 'froid', 'tiede', 'chaud'], default: 'non_evalue', index: true },
  score: { type: Number, default: 0, min: 0, max: 100 },
  prochaineAction: { type: String, default: '', maxlength: 400 },
  analyzedAt: { type: Date },

  lu: { type: Boolean, default: false, index: true },
  pageOrigine: { type: String, default: '', maxlength: 300 },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now, index: true },
});

chatSessionSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
