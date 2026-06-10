const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Donnees soumises via formulaire contact
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
  phone: { type: String, default: '', trim: true, maxlength: 30 },
  company: { type: String, default: '', trim: true, maxlength: 120 },
  service: {
    type: String,
    enum: ['site-web', 'application', 'automatisation', 'seo', 'autre'],
    required: true
  },
  message: { type: String, required: true, maxlength: 5000 },

  // Workflow admin
  status: {
    type: String,
    enum: ['nouveau', 'lu', 'en_cours', 'converti', 'perdu'],
    default: 'nouveau',
    index: true
  },
  internalNotes: { type: String, default: '', maxlength: 5000 },

  // Meta
  source: { type: String, default: 'site_contact', maxlength: 60 },
  userAgent: { type: String, default: '', maxlength: 500 },
  ipHash: { type: String, default: '', maxlength: 64 },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

leadSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });
leadSchema.pre('findOneAndUpdate', function(next) { this.set({ updatedAt: Date.now() }); next(); });

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ email: 1 });

module.exports = mongoose.model('Lead', leadSchema);
