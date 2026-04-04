const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  company: { type: String, required: true, trim: true },
  contactName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  sector: { type: String, default: '' },
  status: { type: String, enum: ['prospect', 'actif', 'inactif', 'archive'], default: 'prospect' },
  source: { type: String, default: 'site' },
  notes: { type: String, default: '' },
  totalRevenue: { type: Number, default: 0 },
  totalExpenses: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

clientSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Client', clientSchema);
