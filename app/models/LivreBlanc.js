const mongoose = require('mongoose');

// Livre blanc / guide PDF téléchargeable — géré depuis l'admin (CMS).
const livreBlancSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 200 },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '', maxlength: 1500 },
  pages: { type: Number, default: 0 },
  pdfUrl: { type: String, default: '', maxlength: 2000 }, // URL du PDF (ex: /downloads/xxx.pdf ou lien externe)
  coverImage: { type: String, default: '', maxlength: 2000 },
  icon: { type: String, default: 'menu_book', maxlength: 60 }, // icône Material Symbols (fallback si pas de coverImage)
  category: { type: String, default: 'Guide', maxlength: 80 },
  toc: { type: [String], default: [] }, // sommaire : liste de points
  status: { type: String, enum: ['brouillon', 'publie'], default: 'brouillon', index: true },
  downloads: { type: Number, default: 0 },
  publishedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('LivreBlanc', livreBlancSchema);
