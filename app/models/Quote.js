const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, default: 0 }
}, { _id: false });

const quoteSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true, index: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  clientName: String,
  clientEmail: String,
  clientCompany: String,
  clientAddress: String,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  description: String,
  items: [quoteItemSchema],
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 20 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  currency: { type: String, default: 'EUR' },
  validUntil: Date,
  status: { type: String, enum: ['brouillon', 'envoye', 'accepte', 'refuse', 'expire'], default: 'brouillon' },
  paymentLink: { type: String, default: '' }, // Manual payment link (Stripe checkout, PayPal me, bank transfer instructions URL, etc.)
  notes: String,
  terms: String,
  sentAt: Date,
  acceptedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

quoteSchema.pre('save', function (next) {
  if (this.items && this.items.length) {
    this.items.forEach(it => { it.total = (it.quantity || 1) * (it.unitPrice || 0); });
    this.subtotal = this.items.reduce((s, it) => s + (it.total || 0), 0);
    this.tax = Math.round(this.subtotal * (this.taxRate || 0)) / 100;
    this.total = this.subtotal + this.tax;
  }
  next();
});

module.exports = mongoose.models.Quote || mongoose.model('Quote', quoteSchema);
