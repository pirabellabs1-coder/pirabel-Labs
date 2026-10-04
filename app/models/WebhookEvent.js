const mongoose = require('mongoose');

// Identifiants svix-id déjà traités (webhooks Resend) : empêche le rejeu d'un événement.
// Expiration automatique au bout de 10 minutes (index TTL), au-delà la signature est de toute façon refusée.
const webhookEventSchema = new mongoose.Schema({
  _id: { type: String, maxlength: 200 },
  createdAt: { type: Date, default: Date.now, expires: 600 },
});

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
