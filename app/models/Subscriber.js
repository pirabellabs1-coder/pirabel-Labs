const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, default: '' },
  type: { type: String, enum: ['client', 'prospect', 'guide_download', 'newsletter'], default: 'prospect' },
  source: { type: String, default: 'site' },
  tags: [String],
  isActive: { type: Boolean, default: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscriber', subscriberSchema);
