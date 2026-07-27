const mongoose = require('mongoose');

// Candidature deposee depuis /carrieres. Le CV est fourni par LIEN (Drive, LinkedIn,
// portfolio) et non televerse : aucun document personnel n'est stocke sur le serveur.
const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  jobTitle: { type: String, default: '', maxlength: 160 },   // instantane, l'offre peut etre archivee

  name: { type: String, required: true, maxlength: 120 },
  email: { type: String, required: true, lowercase: true, maxlength: 200 },
  phone: { type: String, default: '', maxlength: 30 },
  city: { type: String, default: '', maxlength: 120 },

  cvUrl: { type: String, default: '', maxlength: 500 },        // lien vers le CV
  linkedin: { type: String, default: '', maxlength: 300 },
  portfolio: { type: String, default: '', maxlength: 300 },
  coverLetter: { type: String, default: '', maxlength: 6000 },

  // Etapes alignees sur les modeles d'e-mail deja presents dans app/config/email.js
  status: {
    type: String,
    enum: ['nouveau', 'en_revue', 'preselectionne', 'entretien', 'test', 'accepte', 'refuse'],
    default: 'nouveau', index: true,
  },

  // Analyse produite par Ayaba a la reception.
  aiSummary: { type: String, default: '', maxlength: 1500 },
  aiFit: { type: Number, default: 0, min: 0, max: 100 },       // adequation au poste
  aiStrengths: { type: String, default: '', maxlength: 600 },
  aiConcerns: { type: String, default: '', maxlength: 600 },
  aiProcessedAt: { type: Date },

  internalNotes: { type: String, default: '', maxlength: 5000 },
  lu: { type: Boolean, default: false, index: true },
  source: { type: String, default: 'site_carrieres', maxlength: 60 },
  ipHash: { type: String, default: '', maxlength: 64 },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

applicationSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });
applicationSchema.index({ status: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, createdAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
