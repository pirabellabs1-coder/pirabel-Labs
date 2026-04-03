const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { type: String, enum: ['client_created', 'project_created', 'project_updated', 'order_received', 'invoice_paid', 'email_sent', 'employee_invited', 'article_published', 'campaign_sent', 'login'], required: true },
  description: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  relatedModel: { type: String },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  ip: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
