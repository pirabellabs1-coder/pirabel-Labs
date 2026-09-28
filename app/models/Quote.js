const mongoose = require('mongoose');

// Devises sans subdivision en usage courant : les montants sont arrondis a l'unite.
const DEVISES_SANS_DECIMALES = ['XOF', 'XAF', 'GNF'];
function arrondiDevise(v, devise) {
  const f = DEVISES_SANS_DECIMALES.includes(devise) ? 1 : 100;
  return Math.round((Number(v) || 0) * f) / f;
}

const quoteItemSchema = new mongoose.Schema({
  description: { type: String, required: true, maxlength: 500 },
  quantity: { type: Number, default: 1, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 }, // dans la devise du devis (champ currency)
  total: { type: Number, required: true, min: 0 }
}, { _id: false });

const quoteSchema = new mongoose.Schema({
  // Reference sequentielle unique (DEVIS-2026-0001), attribuee via le modele Counter
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

  // Totaux (la remise s'applique avant la TVA)
  subtotal: { type: Number, default: 0, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  discountAmount: { type: Number, default: 0, min: 0 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 }, // en % (ex: 18 pour 18%)
  taxAmount: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'EUR', enum: ['EUR', 'USD', 'CAD', 'XOF', 'XAF', 'MAD', 'TND', 'GNF', 'CHF'] },

  // Acompte demande a la commande (en % du total), utilise pour la facture d'acompte
  depositPercent: { type: Number, default: 30, min: 0, max: 100 },

  // Texte libre
  title: { type: String, required: true, maxlength: 200 }, // ex: "Création site web vitrine"
  introduction: { type: String, default: '', maxlength: 2000 },
  terms: { type: String, default: '', maxlength: 5000 }, // conditions générales

  // Statut. « expire » est aussi calcule a la lecture (validUntil depassee).
  status: {
    type: String,
    enum: ['brouillon', 'envoye', 'consulte', 'accepte', 'refuse', 'expire', 'annule'],
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
  cancelledAt: { type: Date },

  // Token publique d'accès (URL sécurisée pour le client)
  publicToken: { type: String, required: true, unique: true, index: true },
  // Alias court et lisible pour l'URL (ex. « remorques-k7m2 »). Reste aleatoire sur
  // sa partie finale : un slug entierement devinable exposerait le devis a n'importe qui.
  publicSlug: { type: String, unique: true, sparse: true, index: true },

  // Notes internes (non visibles client)
  internalNotes: { type: String, default: '', maxlength: 5000 },

  // Auteur
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

quoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Recalcul des totaux seulement à la création ou si le contenu chiffré change :
  // une pièce déjà émise ne voit jamais son total réécrit par un simple save().
  if (!(this.isNew || this.isModified('items') || this.isModified('taxRate') || this.isModified('discountPercent') || this.isModified('currency'))) return next();
  const cur = this.currency;
  this.items.forEach(item => { item.total = arrondiDevise((item.quantity || 0) * (item.unitPrice || 0), cur); });
  this.subtotal = arrondiDevise(this.items.reduce((sum, item) => sum + (item.total || 0), 0), cur);
  this.discountAmount = arrondiDevise(this.subtotal * (this.discountPercent || 0) / 100, cur);
  const base = this.subtotal - this.discountAmount;
  this.taxAmount = arrondiDevise(base * (this.taxRate || 0) / 100, cur);
  this.total = arrondiDevise(base + this.taxAmount, cur);

  next();
});

quoteSchema.index({ status: 1, createdAt: -1 });
quoteSchema.index({ leadId: 1, createdAt: -1 });

module.exports = mongoose.model('Quote', quoteSchema);
