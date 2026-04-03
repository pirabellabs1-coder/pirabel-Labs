const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  audience: { type: String, enum: ['all', 'clients', 'prospects', 'guide_downloads'], default: 'all' },
  status: { type: String, enum: ['draft', 'scheduled', 'sent', 'failed'], default: 'draft' },
  sentCount: { type: Number, default: 0 },
  openCount: { type: Number, default: 0 },
  scheduledAt: Date,
  sentAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Campaign', campaignSchema);
