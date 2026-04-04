const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. 'create', 'update', 'delete', 'login', 'email_sent', 'export'
  category: { type: String, enum: ['auth', 'client', 'project', 'order', 'invoice', 'employee', 'article', 'campaign', 'settings', 'system'], default: 'system' },
  description: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  details: mongoose.Schema.Types.Mixed, // additional data (before/after state, IDs, etc.)
  ip: String,
  userAgent: String,
  level: { type: String, enum: ['info', 'warning', 'error', 'critical'], default: 'info' },
  relatedModel: String, // 'Client', 'Project', etc.
  relatedId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

logSchema.index({ createdAt: -1 });
logSchema.index({ category: 1, createdAt: -1 });
logSchema.index({ user: 1, createdAt: -1 });
logSchema.index({ level: 1 });

module.exports = mongoose.model('Log', logSchema);
