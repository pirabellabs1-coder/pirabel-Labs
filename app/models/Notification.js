const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  forRole: { type: String, enum: ['admin', 'employee', 'all'], default: 'all' },
  type: {
    type: String,
    enum: ['order', 'application', 'message', 'project', 'invoice', 'lead', 'appointment', 'task', 'system'],
    default: 'system'
  },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  link: { type: String, default: '' },
  icon: { type: String, default: 'notifications' },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
