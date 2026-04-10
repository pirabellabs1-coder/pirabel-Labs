const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  key: { type: String, required: true, unique: true }, // Clé hashée
  prefix: { type: String, required: true }, // Les 4 premiers caractères pour identification (ex: pb_a1)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  lastUsed: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Méthode statique pour générer une clé brute et son hash
apiKeySchema.statics.generate = function() {
  const rawKey = 'pb_live_' + crypto.randomBytes(24).toString('hex');
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const prefix = rawKey.substring(0, 7); // pb_live
  return { rawKey, hash, prefix };
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
