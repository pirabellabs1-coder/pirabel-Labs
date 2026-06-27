const mongoose = require('mongoose');

// Demande de rendez-vous prise depuis la page contact.
const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
  phone: { type: String, default: '', trim: true, maxlength: 30 },
  company: { type: String, default: '', trim: true, maxlength: 120 },
  // Créneau souhaité (le rendez-vous est confirmé/ajusté ensuite par l'admin)
  preferredDate: { type: String, default: '' },   // AAAA-MM-JJ (saisi au format date)
  preferredTime: { type: String, default: '' },   // ex. « 10:00 »
  channel: { type: String, enum: ['visio', 'telephone', 'whatsapp', 'presentiel'], default: 'visio' },
  subject: { type: String, default: '', maxlength: 200 },   // objet du RDV
  message: { type: String, default: '', maxlength: 3000 },
  status: { type: String, enum: ['demande', 'confirme', 'effectue', 'annule', 'no_show'], default: 'demande', index: true },
  publicToken: { type: String, index: true },   // jeton du lien client (modifier / annuler)
  modifiedByClientAt: { type: Date },           // dernière modification faite par le client
  clientReason: { type: String, default: '', maxlength: 1000 },  // motif du dernier changement/annulation par le client
  remindersSent: { type: Number, default: 0 },
  lastReminderAt: { type: Date },
  internalNotes: { type: String, default: '', maxlength: 3000 },
  source: { type: String, default: 'site_contact' },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

appointmentSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('Appointment', appointmentSchema);
