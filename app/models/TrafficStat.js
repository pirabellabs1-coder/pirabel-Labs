const mongoose = require('mongoose');

// Agrégat journalier de trafic (1 document par jour) — compact, pas de bloat.
// pageviews = nombre de pages vues ; visitors = identifiants visiteurs uniques du jour
// (id aléatoire stocké en localStorage côté client) ; whatsappClicks = clics sur les liens WhatsApp.
const trafficStatSchema = new mongoose.Schema({
  day: { type: String, required: true, unique: true, index: true }, // 'YYYY-MM-DD' (UTC)
  pageviews: { type: Number, default: 0 },
  whatsappClicks: { type: Number, default: 0 },
  visitors: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('TrafficStat', trafficStatSchema);
