const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  content: { type: String, required: true },
  excerpt: { type: String, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, enum: ['seo', 'web', 'ia', 'ads', 'social', 'design', 'video', 'email', 'content', 'cro', 'general'], default: 'general' },
  tags: [String],
  coverImage: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date },
  views: { type: Number, default: 0 },
  readingTime: { type: Number, default: 5 },
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

articleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (!this.slug) this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!this.excerpt && this.content) this.excerpt = this.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
  if (!this.readingTime && this.content) this.readingTime = Math.ceil(this.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200);
  next();
});

module.exports = mongoose.model('Article', articleSchema);
