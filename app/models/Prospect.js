const mongoose = require('mongoose');

const prospectSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  contactName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  sector: { type: String, default: '' },
  status: { type: String, enum: ['nouveau', 'contacte', 'intéressé', 'converti', 'perdu'], default: 'nouveau' },
  problem: { type: String, default: '' },
  notes: { type: String, default: '' },
  lastContactedAt: { type: Date },
  emailsSent: { type: Number, default: 0 },
  convertedToClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

prospectSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Prospect', prospectSchema);
