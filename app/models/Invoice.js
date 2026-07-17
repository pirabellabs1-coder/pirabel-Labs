const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true, maxlength: 500 },
  quantity: { type: Number, default: 1, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  // Reference numerique unique (FACT-2026-001)
  reference: { type: String, required: true, unique: true, index: true },

  // Lien vers le prospect/client et, le cas echeant, le devis d'origine
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', index: true },

  // Donnees client (snapshot au moment de la facture)
  clientName: { type: String, required: true, maxlength: 200 },
  clientEmail: { type: String, required: true, lowercase: true, maxlength: 200 },
  clientCompany: { type: String, default: '', maxlength: 200 },
  clientPhone: { type: String, default: '', maxlength: 30 },
  clientAddress: { type: String, default: '', maxlength: 500 },

  // Lignes de la facture
  items: { type: [invoiceItemSchema], default: [] },

  // Totaux
  subtotal: { type: Number, default: 0, min: 0 },
  taxRate: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'EUR', enum: ['EUR', 'USD', 'CAD', 'XOF', 'XAF', 'MAD', 'TND', 'GNF', 'CHF'] },

  // Texte libre
  title: { type: String, required: true, maxlength: 200 },
  introduction: { type: String, default: '', maxlength: 2000 },
  terms: { type: String, default: '', maxlength: 5000 }, // modalites de paiement

  // Marque commerciale affichee comme emetteur (l'entite legale reste toujours Pirabel Labs)
  issuerBrand: { type: String, default: 'Pirabel Labs', maxlength: 100 },

  // Statut
  status: {
    type: String,
    enum: ['brouillon', 'envoyee', 'consultee', 'payee', 'en_retard', 'annulee'],
    default: 'brouillon',
    index: true
  },

  // Dates cles
  issuedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, default: function() { return new Date(Date.now() + 15 * 86400000); } },
  sentAt: { type: Date },
  viewedAt: { type: Date },
  paidAt: { type: Date },
  paymentMethod: { type: String, default: '', maxlength: 100 },

  // Token public d'acces (URL securisee pour le client)
  publicToken: { type: String, required: true, unique: true, index: true },

  // Notes internes (non visibles client)
  internalNotes: { type: String, default: '', maxlength: 5000 },

  // Auteur
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

invoiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  this.subtotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);
  this.taxAmount = Math.round((this.subtotal * (this.taxRate || 0) / 100) * 100) / 100;
  this.total = Math.round((this.subtotal + this.taxAmount) * 100) / 100;

  next();
});

invoiceSchema.index({ status: 1, createdAt: -1 });
invoiceSchema.index({ leadId: 1, createdAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
