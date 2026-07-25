const mongoose = require('mongoose');

// Etape de suivi affichee au client dans son espace (barre de progression).
const stepSchema = new mongoose.Schema({
  label: { type: String, required: true, maxlength: 120 },   // ex. « Maquettes validees »
  description: { type: String, default: '', maxlength: 600 },
  status: { type: String, enum: ['a_venir', 'en_cours', 'termine', 'bloque'], default: 'a_venir' },
  completedAt: { type: Date },
}, { _id: false });

// Projet client : le fil conducteur de l'espace client (suivi, livrables, echeances).
const projectSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  clientName: { type: String, default: '', maxlength: 200 },
  clientEmail: { type: String, default: '', lowercase: true, maxlength: 200 },

  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, default: '', maxlength: 4000 },
  service: { type: String, default: '', maxlength: 120 },   // site web, SEO, automatisation...

  status: { type: String, enum: ['cadrage', 'en_cours', 'en_revue', 'livre', 'suspendu'], default: 'cadrage', index: true },
  steps: { type: [stepSchema], default: [] },

  startedAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
  deliveredAt: { type: Date },

  // Lien vers le projet en ligne une fois livre (prevision / recette)
  previewUrl: { type: String, default: '', maxlength: 500 },
  liveUrl: { type: String, default: '', maxlength: 500 },

  internalNotes: { type: String, default: '', maxlength: 5000 },   // jamais expose au client
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

// Progression calculee : part des etapes terminees.
projectSchema.virtual('progress').get(function () {
  if (!this.steps.length) return 0;
  return Math.round((this.steps.filter(s => s.status === 'termine').length / this.steps.length) * 100);
});
projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

projectSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('Project', projectSchema);
