const mongoose = require('mongoose');

const quoteItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true }
});

const quoteSchema = new mongoose.Schema({
  quoteNumber: { type: String, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  clientName: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  clientCompany: { type: String, default: '' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  items: [quoteItemSchema],
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 20 },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  status: { type: String, enum: ['brouillon', 'envoye', 'accepte', 'refuse', 'expire'], default: 'brouillon' },
  validUntil: { type: Date },
  sentAt: { type: Date },
  respondedAt: { type: Date },
  paymentLink: { type: String, default: '' },
  notes: { type: String, default: '' },
  conditions: { type: String, default: 'Conditions de paiement : 30 jours à réception de facture.' },
  reminderSent: { type: Boolean, default: false },
  reminderSentAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

quoteSchema.pre('validate', async function(next) {
  if (!this.quoteNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.quoteNumber = `DEV-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

quoteSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Quote', quoteSchema);
