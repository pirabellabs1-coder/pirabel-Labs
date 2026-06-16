const mongoose = require('mongoose');

// Modèle Media : stockage d'images en base64 dans MongoDB.
// Limité à ~2MB par image (limite MongoDB doc = 16MB, on garde marge).
// Pour des volumes plus larges, migrer vers Cloudinary / Vercel Blob.

const mediaSchema = new mongoose.Schema({
  filename: { type: String, required: true, trim: true, maxlength: 200 },
  alt: { type: String, default: '', trim: true, maxlength: 200 },
  mimeType: { type: String, required: true, maxlength: 100 },
  size: { type: Number, required: true }, // bytes
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },

  // Data : base64 encoded image
  // ATTENTION : limit pratique ~2MB en base64 (= 1.5MB binary)
  data: { type: String, required: true }, // data:image/jpeg;base64,...

  // Catégorisation
  folder: {
    type: String,
    default: 'general',
    enum: ['general', 'realisations', 'blog', 'team', 'logos', 'icones', 'autres'],
    index: true
  },
  tags: { type: [String], default: [], index: true },

  // Métadonnées
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usageCount: { type: Number, default: 0 }, // tracking d'usage

  createdAt: { type: Date, default: Date.now, index: true },
});

mediaSchema.index({ folder: 1, createdAt: -1 });

// Méthode helper : retourne juste l'URL data sans charger toute la doc
mediaSchema.virtual('dataUrl').get(function() {
  return this.data;
});

module.exports = mongoose.model('Media', mediaSchema);
