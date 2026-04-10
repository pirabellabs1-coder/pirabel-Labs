const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  category: { type: String, enum: ['welcome', 'relance', 'devis', 'refus', 'suivi', 'rappel', 'autre'], default: 'autre' },
  variables: [{ type: String }],
  isDefault: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

emailTemplateSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
