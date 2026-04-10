const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  company: String,
  role: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  content: { type: String, required: true },
  service: { type: String, enum: ['seo', 'web', 'ia', 'ads', 'social', 'design', 'video', 'email', 'content', 'cro', 'autre', ''], default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  featured: { type: Boolean, default: false },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  approvedAt: Date,
  source: { type: String, default: 'site' }
}, { timestamps: true });

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
