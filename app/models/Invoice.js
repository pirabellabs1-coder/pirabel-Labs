const mongoose = require('mongoose');

// Devises sans subdivision en usage courant : les montants sont arrondis a l'unite.
const DEVISES_SANS_DECIMALES = ['XOF', 'XAF', 'GNF'];
function arrondiDevise(v, devise) {
  const f = DEVISES_SANS_DECIMALES.includes(devise) ? 1 : 100;
  return Math.round((Number(v) || 0) * f) / f;
}

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true, maxlength: 500 },
  quantity: { type: Number, default: 1, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
}, { _id: false });

// Un reglement (acompte, paiement partiel ou solde). Chaque paiement garde son _id
// pour pouvoir supprimer une saisie erronee.
const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true, default: Date.now },
  method: { type: String, default: '', maxlength: 100 },
  note: { type: String, default: '', maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

const invoiceSchema = new mongoose.Schema({
  // Reference sequentielle unique (FACT-2026-0001), attribuee via le modele Counter
  reference: { type: String, required: true, unique: true, index: true },

  // Lien vers le prospect/client et, le cas echeant, le devis d'origine
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true, index: true },
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', index: true },
  // Nature de la facture issue d'un devis : totale, acompte ou solde
  kind: { type: String, enum: ['totale', 'acompte', 'solde'], default: 'totale' },

  // Donnees client (snapshot au moment de la facture)
  clientName: { type: String, required: true, maxlength: 200 },
  clientEmail: { type: String, required: true, lowercase: true, maxlength: 200 },
  clientCompany: { type: String, default: '', maxlength: 200 },
  clientPhone: { type: String, default: '', maxlength: 30 },
  clientAddress: { type: String, default: '', maxlength: 500 },

  // Lignes de la facture
  items: { type: [invoiceItemSchema], default: [] },

  // Totaux (la remise s'applique avant la TVA)
  subtotal: { type: Number, default: 0, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  discountAmount: { type: Number, default: 0, min: 0 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  taxAmount: { type: Number, default: 0, min: 0 },
  total: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'EUR', enum: ['EUR', 'USD', 'CAD', 'XOF', 'XAF', 'MAD', 'TND', 'GNF', 'CHF'] },

  // Texte libre
  title: { type: String, required: true, maxlength: 200 },
  introduction: { type: String, default: '', maxlength: 2000 },
  terms: { type: String, default: '', maxlength: 5000 }, // modalites de paiement

  // Marque commerciale affichee comme emetteur (l'entite legale reste toujours Pirabel Labs)
  issuerBrand: { type: String, default: 'Pirabel Labs', maxlength: 100 },

  // Statut. « en_retard » est aussi calcule a la lecture (echeance depassee, solde du).
  status: {
    type: String,
    enum: ['brouillon', 'envoyee', 'consultee', 'partiellement_payee', 'payee', 'en_retard', 'annulee'],
    default: 'brouillon',
    index: true
  },

  // Reglements recus (le CA encaisse se calcule a partir d'eux, par date de paiement)
  payments: { type: [paymentSchema], default: [] },

  // Dates cles
  issuedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, default: function() { return new Date(Date.now() + 15 * 86400000); } },
  sentAt: { type: Date },
  viewedAt: { type: Date },
  paidAt: { type: Date },           // date du dernier paiement quand la facture est soldee
  cancelledAt: { type: Date },
  paymentMethod: { type: String, default: '', maxlength: 100 },

  // Token public d'acces (URL securisee pour le client)
  publicToken: { type: String, required: true, unique: true, index: true },

  // Notes internes (non visibles client)
  internalNotes: { type: String, default: '', maxlength: 5000 },

  // Auteur
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
}, {
  toJSON: { virtuals: true }, toObject: { virtuals: true },
  // Verrou optimiste : deux paiements saisis en même temps ne peuvent pas être tous
  // deux acceptés (le second échoue avec VersionError au lieu de dépasser le total).
  optimisticConcurrency: true,
});

// ---------------------------------------------------------------------------
// Reglements : fonctions pures, utilisables sur un document Mongoose comme sur un
// objet .lean(). Compatibilite ascendante : une facture « payee » creee avant
// l'introduction de payments[] compte comme UN paiement de son total a paidAt.
// ---------------------------------------------------------------------------
function paymentsOf(inv) {
  if (!inv) return [];
  const list = Array.isArray(inv.payments) ? inv.payments : [];
  if (list.length) return list;
  if (inv.status === 'payee') {
    return [{ amount: inv.total || 0, date: inv.paidAt || inv.updatedAt || inv.issuedAt, method: inv.paymentMethod || '', note: '', legacy: true }];
  }
  return [];
}
function amountPaidOf(inv) {
  return arrondiDevise(paymentsOf(inv).reduce((s, p) => s + (Number(p.amount) || 0), 0), inv && inv.currency);
}
function balanceOf(inv) {
  if (!inv || inv.status === 'annulee') return 0;
  return Math.max(0, arrondiDevise((inv.total || 0) - amountPaidOf(inv), inv.currency));
}
// Statut reel a l'instant T : « en_retard » quand l'echeance est depassee et qu'un
// solde reste du ; un ancien « en_retard » dont l'echeance a ete repoussee redevient
// « envoyee » (ou « partiellement_payee »).
function effectiveStatus(inv, now) {
  if (!inv) return '';
  const s = inv.status;
  if (['envoyee', 'consultee', 'partiellement_payee', 'en_retard'].includes(s)) {
    const t = now || new Date();
    if (inv.dueDate && new Date(inv.dueDate) < t && balanceOf(inv) > 0) return 'en_retard';
    if (s === 'en_retard') return amountPaidOf(inv) > 0 ? 'partiellement_payee' : 'envoyee';
  }
  return s;
}

invoiceSchema.statics.paymentsOf = paymentsOf;
invoiceSchema.statics.amountPaidOf = amountPaidOf;
invoiceSchema.statics.balanceOf = balanceOf;
invoiceSchema.statics.effectiveStatus = effectiveStatus;
invoiceSchema.statics.arrondiDevise = arrondiDevise;

invoiceSchema.virtual('amountPaid').get(function () { return amountPaidOf(this); });
invoiceSchema.virtual('balanceDue').get(function () { return balanceOf(this); });

invoiceSchema.pre('save', function(next) {
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

invoiceSchema.index({ status: 1, createdAt: -1 });
invoiceSchema.index({ leadId: 1, createdAt: -1 });
invoiceSchema.index({ 'payments.date': 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
