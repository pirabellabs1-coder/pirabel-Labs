const mongoose = require('mongoose');

// Liste d'exclusion de la prospection : aucune adresse présente ici ne reçoit d'e-mail.
const suppressionSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  reason: { type: String, enum: ['desinscription', 'bounce', 'plainte', 'manuel'], default: 'manuel' },
  note: { type: String, default: '', maxlength: 300 },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Suppression', suppressionSchema);
