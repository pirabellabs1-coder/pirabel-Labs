const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  description: { type: String, required: true, maxlength: 500 },
  quantity: { type: Number, default: 1, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 }, // en EUR
  total: { type: Number, required: true, min: 0 }
}, { _id: false });

const quoteSchema = new mongoose.Schema({
  // Reference numerique unique (DEVIS-2026-001)
  reference: { type: String, required: true, unique: true, index: true },

  // Lien vers le prospect/client
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },

  // Données client (snapshot au moment du devis)
  clientName: { type: String, required: true, maxlength: 200 },
  clientEmail: { type: String, required: true, lowercase: true, maxlength: 200 },
  clientCompany: { type: String, default: '', maxlength: 200 },
  clientPhone: { type: String, default: '', maxlength: 30 },
  clientAddress: { type: String, default: '', maxlength: 500 },

  // Lignes du devis
  items: { type: [quoteItemSchema], default: [] },

  // Totaux
  subtotal: { type: Number, default: 0, min: 0 },
  taxRate: { type: Number, default: 0, min: 0 }, // en % (ex: 18 pour 18%)
  taxAmount: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'EUR', enum: ['EUR', 'USD', 'CAD', 'XOF', 'XAF', 'MAD', 'TND', 'GNF', 'CHF'] },

  // Texte libre
  title: { type: String, required: true, maxlength: 200 }, // ex: "Création site web vitrine"
  introduction: { type: String, default: '', maxlength: 2000 },
  terms: { type: String, default: '', maxlength: 5000 }, // conditions générales

  // Statut
  status: {
    type: String,
    enum: ['brouillon', 'envoye', 'consulte', 'accepte', 'refuse', 'expire'],
    default: 'brouillon',
    index: true
  },

  // Dates clés
  issuedAt: { type: Date, default: Date.now },
  validUntil: { type: Date, default: function() { return new Date(Date.now() + 30 * 86400000); } },
  sentAt: { type: Date },
  viewedAt: { type: Date },
  acceptedAt: { type: Date },
  refusedAt: { type: Date },

  // Token publique d'accès (URL sécurisée pour le client)
  publicToken: { type: String, required: true, unique: true, index: true },

  // Notes internes (non visibles client)
  internalNotes: { type: String, default: '', maxlength: 5000 },

  // Auteur
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

quoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Recalcul auto des totaux à chaque save
  this.subtotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);
  this.taxAmount = Math.round((this.subtotal * (this.taxRate || 0) / 100) * 100) / 100;
  this.total = Math.round((this.subtotal + this.taxAmount) * 100) / 100;

  next();
});

quoteSchema.index({ status: 1, createdAt: -1 });
quoteSchema.index({ leadId: 1, createdAt: -1 });

module.exports = mongoose.model('Quote', quoteSchema);
