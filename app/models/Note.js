const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relatedModel: { type: String, enum: ['Client', 'Project', 'Employee', 'Order', 'General'], default: 'General' },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  priority: { type: String, enum: ['basse', 'normale', 'haute', 'urgente'], default: 'normale' },
  isResolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

noteSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });
noteSchema.index({ relatedModel: 1, relatedId: 1 });
noteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
