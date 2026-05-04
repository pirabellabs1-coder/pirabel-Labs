const mongoose = require('mongoose');

const caseStudySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  client: { type: String, default: '' },
  industry: { type: String, default: '' },
  category: {
    type: String,
    enum: ['seo', 'web', 'ia', 'ads', 'social', 'design', 'video', 'email', 'content', 'cro', 'general'],
    default: 'general'
  },
  servicesProvided: [{ type: String }],
  description: { type: String, required: true },
  challenge: { type: String, default: '' },
  solution: { type: String, default: '' },
  results: { type: String, default: '' },
  metric: { type: String, default: '' },
  metricLabel: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  galleryImages: [{ type: String }],
  projectUrl: { type: String, default: '' },
  projectType: {
    type: String,
    enum: ['website', 'funnel', 'app', 'campaign', 'branding', 'video', 'automation', 'other'],
    default: 'other'
  },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  duration: { type: String, default: '' },
  language: { type: String, enum: ['fr', 'en', 'both'], default: 'both' },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date },
  views: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

caseStudySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

caseStudySchema.index({ status: 1, order: -1, publishedAt: -1 });
caseStudySchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('CaseStudy', caseStudySchema);
