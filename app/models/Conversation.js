const mongoose = require('mongoose');

// Conversation avec l'assistant IA — persistée par utilisateur pour garder la mémoire.
const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mode: { type: String, enum: ['analyse', 'redaction', 'equipe', 'libre'], default: 'analyse' },
  title: { type: String, default: 'Nouvelle conversation' },
  messages: { type: [messageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now, index: true },
});

conversationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  // Titre auto à partir du premier message utilisateur si encore par défaut
  if ((!this.title || this.title === 'Nouvelle conversation') && this.messages.length) {
    const firstUser = this.messages.find(m => m.role === 'user');
    if (firstUser && firstUser.content) this.title = firstUser.content.replace(/\s+/g, ' ').trim().slice(0, 60);
  }
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
