const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Lien vers le client (ancien lead converti)
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', index: true },

  // Données client (snapshot)
  clientName: { type: String, required: true, maxlength: 200 },
  clientEmail: { type: String, required: true, lowercase: true, maxlength: 200 },
  clientCompany: { type: String, default: '', maxlength: 200 },
  clientRole: { type: String, default: '', maxlength: 100 }, // ex: "Directrice marketing"
  clientCity: { type: String, default: '', maxlength: 100 },

  // Avis
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, minlength: 30, maxlength: 2000 },
  serviceUsed: { type: String, default: '', maxlength: 100 }, // ex: "Création site web"

  // Statut modération
  status: {
    type: String,
    enum: ['en_attente', 'publie', 'rejete'],
    default: 'en_attente',
    index: true
  },

  // Affichage publique
  publishedOnSite: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date },

  // Token public (pour soumission via URL email)
  requestToken: { type: String, required: true, unique: true, index: true },
  requestSentAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },

  // Méta
  source: { type: String, default: 'admin_request', enum: ['admin_request', 'spontane', 'import'] },
  ipHash: { type: String, default: '', maxlength: 64 },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

reviewSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ publishedOnSite: 1, rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);
