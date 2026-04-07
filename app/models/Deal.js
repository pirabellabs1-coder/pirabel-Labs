const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  contact: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    company: { type: String, default: '' }
  },
  stage: { type: String, enum: ['lead', 'contacte', 'devis', 'negociation', 'gagne', 'perdu'], default: 'lead' },
  value: { type: Number, default: 0 },
  currency: { type: String, default: 'EUR' },
  probability: { type: Number, default: 20, min: 0, max: 100 },
  service: { type: String, default: '' },
  source: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  quote: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },
  expectedCloseDate: { type: Date },
  closedAt: { type: Date },
  lostReason: { type: String, default: '' },
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 },
  activities: [{
    type: { type: String, default: 'note' },
    message: { type: String, default: '' },
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

dealSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  const probMap = { lead: 10, contacte: 25, devis: 50, negociation: 70, gagne: 100, perdu: 0 };
  if (!this.isModified('probability')) this.probability = probMap[this.stage] || 20;
  next();
});

module.exports = mongoose.model('Deal', dealSchema);
