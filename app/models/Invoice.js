const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  items: [lineItemSchema],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 20 },
  taxAmount: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ['brouillon', 'envoyee', 'payee', 'en_retard', 'annulee'], default: 'brouillon' },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  paidDate: { type: Date },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

// Auto-generate invoice number
invoiceSchema.pre('validate', async function(next) {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.invoiceNumber = `PL-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
