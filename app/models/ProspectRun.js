const mongoose = require('mongoose');

// Journal des cycles de l'agent de prospection (cron quotidien ou lancement manuel).
const prospectRunSchema = new mongoose.Schema({
  trigger: { type: String, enum: ['cron', 'manuel'], default: 'manuel' },
  startedAt: { type: Date, default: Date.now, index: true },
  durationMs: { type: Number, default: 0 },
  testMode: { type: Boolean, default: false },
  discovered: { type: Number, default: 0 },
  enriched: { type: Number, default: 0 },
  drafted: { type: Number, default: 0 },
  sent: { type: Number, default: 0 },
  skipped: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  budget: { type: Number, default: 0 },          // envois autorisés pour la journée au moment du cycle
  notes: { type: [String], default: [] },        // messages lisibles (raisons d'arrêt, erreurs)
});

module.exports = mongoose.model('ProspectRun', prospectRunSchema);
