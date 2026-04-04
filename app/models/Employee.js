const mongoose = require('mongoose');

const salaryPaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  month: { type: String, required: true },
  paidDate: { type: Date },
  status: { type: String, enum: ['en_attente', 'paye', 'en_retard'], default: 'en_attente' },
  notes: { type: String, default: '' }
});

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  role: { type: String, required: true },
  department: { type: String, enum: ['seo', 'web', 'design', 'marketing', 'commercial', 'direction', 'support', 'ia', 'video', 'content', 'ads', 'rh', 'finance', 'technique'], required: true },
  status: { type: String, enum: ['actif', 'inactif'], default: 'actif' },
  salary: { type: Number, default: 0 },
  salaryPayments: [salaryPaymentSchema],
  payDay: { type: Number, default: 5 },
  startDate: { type: Date, default: Date.now },
  skills: [String],
  activeProjects: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', employeeSchema);
