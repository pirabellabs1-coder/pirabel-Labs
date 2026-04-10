const mongoose = require('mongoose');

const incidentUpdateSchema = new mongoose.Schema({
  message: String,
  status: { type: String, enum: ['investigating', 'identified', 'monitoring', 'resolved'], default: 'investigating' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  service: { type: String, default: 'Site web' }, // e.g., 'Site web', 'API', 'Espace client'
  severity: { type: String, enum: ['minor', 'major', 'critical'], default: 'minor' },
  status: { type: String, enum: ['investigating', 'identified', 'monitoring', 'resolved'], default: 'investigating', index: true },
  startedAt: { type: Date, default: Date.now },
  resolvedAt: Date,
  updates: [incidentUpdateSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.models.Incident || mongoose.model('Incident', incidentSchema);
