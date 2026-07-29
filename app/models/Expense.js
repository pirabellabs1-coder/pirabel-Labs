const mongoose = require('mongoose');

// Charge / depense de l'agence. Sans ces ecritures, seul le chiffre d'affaires est
// connu : impossible de calculer un resultat.
const expenseSchema = new mongoose.Schema({
  label: { type: String, required: true, maxlength: 200 },
  category: {
    type: String,
    enum: ['outils', 'sous_traitance', 'salaires', 'marketing', 'hebergement',
           'materiel', 'deplacement', 'banque', 'impots', 'autre'],
    default: 'autre', index: true,
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'EUR', enum: ['EUR', 'USD', 'CAD', 'XOF', 'XAF', 'MAD', 'TND', 'GNF', 'CHF'] },

  // Une charge peut revenir chaque mois (abonnement) : utile pour projeter.
  recurring: { type: Boolean, default: false, index: true },
  supplier: { type: String, default: '', maxlength: 160 },
  paymentMethod: { type: String, default: '', maxlength: 80 },
  reference: { type: String, default: '', maxlength: 80 },   // n° de facture fournisseur

  // Date de l'operation : c'est elle qui rattache la charge a une periode comptable,
  // pas la date de saisie.
  date: { type: Date, default: Date.now, index: true },
  notes: { type: String, default: '', maxlength: 2000 },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

expenseSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });
expenseSchema.index({ date: -1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
