const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['transactional', 'marketing', 'follow_up', 'onboarding', 'support', 'autre'], default: 'transactional' },
  subject: { type: String, required: true },
  body: { type: String, required: true }, // HTML content
  variables: [String], // e.g., ['name','company','project']
  description: String,
  isDefault: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', emailTemplateSchema);
