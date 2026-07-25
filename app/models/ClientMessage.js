const mongoose = require('mongoose');

// Message echange entre un client (depuis son espace) et l'equipe Pirabel Labs.
const clientMessageSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },

  // « client » = ecrit depuis l'espace client ; « equipe » = reponse de Pirabel Labs.
  from: { type: String, enum: ['client', 'equipe'], required: true },
  authorName: { type: String, default: '', maxlength: 120 },
  content: { type: String, required: true, maxlength: 5000 },

  readByTeam: { type: Boolean, default: false, index: true },
  readByClient: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now, index: true },
});

clientMessageSchema.index({ leadId: 1, createdAt: 1 });

module.exports = mongoose.model('ClientMessage', clientMessageSchema);
