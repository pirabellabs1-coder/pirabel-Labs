const mongoose = require('mongoose');

// Article de blog — source de vérité unique (le site public est rendu depuis ces données).
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  excerpt: { type: String, default: '' },          // chapô / résumé court (cartes + meta fallback)
  content: { type: String, default: '' },           // contenu HTML enrichi
  featuredImage: { type: String, default: '' },      // URL ou /api/admin/media/<id>
  imageAlt: { type: String, default: '' },
  category: { type: String, default: 'Marketing' },
  author: { type: String, default: 'Pirabel Labs' },
  // SEO
  seoTitle: { type: String, default: '' },           // <title> + og:title (fallback: title)
  metaDescription: { type: String, default: '' },    // meta description + og:description (fallback: excerpt)
  // Publication
  status: { type: String, enum: ['brouillon', 'publie'], default: 'brouillon', index: true },
  publishedAt: { type: Date },
  views: { type: Number, default: 0 },
  readTime: { type: Number, default: 0 },  // minutes de lecture (calculé auto au save)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

articleSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (this.status === 'publie' && !this.publishedAt) this.publishedAt = new Date();
  // Calcul auto readTime : ~200 mots/min, balises HTML retirées
  if (this.isModified('content') || !this.readTime) {
    const words = (this.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean).length;
    this.readTime = Math.max(1, Math.round(words / 200));
  }
  next();
});

module.exports = mongoose.model('Article', articleSchema);
