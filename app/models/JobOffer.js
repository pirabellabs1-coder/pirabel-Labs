const mongoose = require('mongoose');

const jobOfferSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  department: { type: String, default: '' },
  location: { type: String, default: 'Remote' },
  type: { type: String, enum: ['CDI', 'CDD', 'Stage', 'Freelance', 'Alternance'], default: 'CDI' },
  description: { type: String, default: '' },
  requirements: [String],
  benefits: [String],
  salary: { type: String, default: '' },
  experience: { type: String, default: '' },
  status: { type: String, enum: ['ouvert', 'ferme', 'brouillon'], default: 'ouvert' },
  applicationCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  publishedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

jobOfferSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('JobOffer', jobOfferSchema);
