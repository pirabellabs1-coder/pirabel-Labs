const mongoose = require('mongoose');

// Offre d'emploi publiee sur /carrieres.
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 160 },
  slug: { type: String, required: true, unique: true, index: true },

  department: { type: String, default: '', maxlength: 80 },   // Developpement, Marketing, Design...
  contract: { type: String, enum: ['cdi', 'cdd', 'stage', 'alternance', 'freelance'], default: 'cdi' },
  location: { type: String, default: 'Abomey-Calavi, Benin', maxlength: 120 },
  remote: { type: String, enum: ['sur_site', 'hybride', 'full_remote'], default: 'hybride' },
  experience: { type: String, default: '', maxlength: 80 },   // « 2 a 4 ans »
  salary: { type: String, default: '', maxlength: 120 },      // libre, ou vide si non communique

  excerpt: { type: String, default: '', maxlength: 400 },     // accroche affichee dans la liste
  content: { type: String, default: '', maxlength: 40000 },   // description HTML complete
  missions: { type: [String], default: [] },
  profile: { type: [String], default: [] },                   // profil recherche
  advantages: { type: [String], default: [] },

  status: { type: String, enum: ['brouillon', 'publie', 'pourvu', 'archive'], default: 'brouillon', index: true },
  applicationsCount: { type: Number, default: 0 },

  publishedAt: { type: Date },
  closesAt: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

jobSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });
jobSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
