const mongoose = require('mongoose');

// Réglages serveur (clé/valeur) — ex. clé API Groq stockée hors du code, jamais exposée au client.
const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Setting', settingSchema);
