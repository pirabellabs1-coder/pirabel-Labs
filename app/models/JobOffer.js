const mongoose = require('mongoose');

const jobOfferSchema = new mongoose.Schema({
  // === IDENTITE ===
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, lowercase: true, maxlength: 100 },
  department: { type: String, default: '', maxlength: 100 },
  // Localisation : type + ville
  remoteMode: { type: String, enum: ['on-site', 'remote', 'hybrid'], default: 'hybrid' },
  location: { type: String, default: 'Abomey-Calavi, Benin', maxlength: 200 },
  type: { type: String, enum: ['CDI', 'CDD', 'Stage', 'Freelance', 'Alternance', 'Mission'], default: 'CDI' },
  experienceLevel: { type: String, enum: ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Indifferent'], default: 'Mid' },
  experience: { type: String, default: '', maxlength: 100 },

  // === CONTENU ===
  shortDescription: { type: String, default: '', maxlength: 280 },
  description: { type: String, default: '', maxlength: 10000 },
  missions: [{ type: String, maxlength: 500 }],
  requirements: [{ type: String, maxlength: 300 }],
  niceToHave: [{ type: String, maxlength: 300 }],
  benefits: [{ type: String, maxlength: 300 }],
  process: [{ type: String, maxlength: 300 }],
  tools: [{ type: String, maxlength: 60 }],

  // === REMUNERATION ===
  salaryMin: { type: Number, default: 0 },
  salaryMax: { type: Number, default: 0 },
  salaryCurrency: { type: String, enum: ['EUR', 'FCFA', 'USD', 'GBP', 'MAD', 'CAD'], default: 'EUR' },
  salaryPeriod: { type: String, enum: ['month', 'year', 'day', 'project'], default: 'month' },
  salaryHidden: { type: Boolean, default: false },
  salary: { type: String, default: '', maxlength: 100 }, // legacy display string

  // === ETAT ===
  status: { type: String, enum: ['ouvert', 'ferme', 'brouillon', 'pause'], default: 'brouillon', index: true },
  closedReason: { type: String, enum: ['filled', 'cancelled', 'paused', 'expired', ''], default: '' },
  hiredCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  urgent: { type: Boolean, default: false },

  // === DATES ===
  publishedAt: { type: Date, default: Date.now },
  applicationDeadline: { type: Date },
  startDate: { type: Date },
  closedAt: { type: Date },

  // === SEO / META ===
  seoTitle: { type: String, default: '', maxlength: 80 },
  seoDescription: { type: String, default: '', maxlength: 200 },

  // === STATS ===
  applicationCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },

  // === AUDIT ===
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

jobOfferSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Auto-set closedAt when status flips to ferme
  if (this.isModified('status')) {
    if (this.status === 'ferme' && !this.closedAt) this.closedAt = new Date();
    if (this.status === 'ouvert') this.closedAt = null;
  }
  next();
});

// Indexes pour performance (slug unique deja defini via `unique: true` ci-dessus)
jobOfferSchema.index({ status: 1, publishedAt: -1 });
jobOfferSchema.index({ status: 1, featured: -1, publishedAt: -1 });

module.exports = mongoose.model('JobOffer', jobOfferSchema);
