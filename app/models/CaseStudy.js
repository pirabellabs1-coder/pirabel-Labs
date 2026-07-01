const mongoose = require('mongoose');

// Étude de cas / réalisation — source de vérité unique (site rendu depuis ces données).
const caseStudySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  sector: { type: String, default: '' },             // ex: "Cabinet conseil"
  location: { type: String, default: '' },           // ex: "Cotonou"
  excerpt: { type: String, default: '' },            // description courte (carte)
  content: { type: String, default: '' },            // contenu HTML enrichi
  featuredImage: { type: String, default: '' },
  imageAlt: { type: String, default: '' },
  projectUrl: { type: String, default: '' },         // lien vers le projet en ligne (bouton "Visiter le site")
  // 2 métriques clés (résultats)
  metric1Value: { type: String, default: '' }, metric1Label: { type: String, default: '' },
  metric2Value: { type: String, default: '' }, metric2Label: { type: String, default: '' },
  // SEO
  seoTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  // Publication
  status: { type: String, enum: ['brouillon', 'publie'], default: 'brouillon', index: true },
  inProgress: { type: Boolean, default: false },     // affiche un badge « En cours » (projet en développement)
  publishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

caseStudySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (this.status === 'publie' && !this.publishedAt) this.publishedAt = new Date();
  next();
});

module.exports = mongoose.model('CaseStudy', caseStudySchema);
