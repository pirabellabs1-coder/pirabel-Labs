const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Revenue', revenueSchema);
