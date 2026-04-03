const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  visitorName: { type: String, default: 'Visiteur' },
  visitorEmail: { type: String, default: '' },
  sender: { type: String, enum: ['visitor', 'admin'], required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
