const mongoose = require('mongoose');

// Commentaire d'article de blog — modéré avant publication.
const commentSchema = new mongoose.Schema({
  articleSlug: { type: String, required: true, index: true },
  articleTitle: { type: String, default: '' }, // snapshot pour l'admin
  author: { type: String, required: true, maxlength: 80 },
  email: { type: String, default: '', lowercase: true, maxlength: 200 }, // optionnel, jamais affiché
  content: { type: String, required: true, minlength: 2, maxlength: 3000 },
  status: { type: String, enum: ['en_attente', 'approuve', 'rejete'], default: 'en_attente', index: true },
  ipHash: { type: String, default: '', maxlength: 64 },
  createdAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

commentSchema.index({ articleSlug: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
