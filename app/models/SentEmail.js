const mongoose = require('mongoose');

// Journal des e-mails envoyés depuis l'admin (trace consultable).
const sentEmailSchema = new mongoose.Schema({
  type: { type: String, enum: ['individuel', 'masse'], default: 'individuel', index: true },
  to: { type: String, default: '' },              // destinataire (vide/global pour un envoi de masse)
  toName: { type: String, default: '' },
  subject: { type: String, default: '' },
  body: { type: String, default: '' },             // message rédigé (texte ou HTML du corps)
  recipientsCount: { type: Number, default: 1 },    // nb destinataires (envoi de masse)
  sentCount: { type: Number, default: 1 },          // nb réellement partis
  failedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['envoye', 'partiel', 'echec'], default: 'envoye', index: true },
  errorMessage: { type: String, default: '' },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sentByName: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('SentEmail', sentEmailSchema);
