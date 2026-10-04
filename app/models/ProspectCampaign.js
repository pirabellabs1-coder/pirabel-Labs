const mongoose = require('mongoose');

// Campagne de prospection automatique (agent « Prospection IA »).
// Une campagne = un secteur recherché sur Google Maps dans une ou plusieurs villes,
// avec un angle d'approche et une limite d'envois quotidienne.
const prospectCampaignSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  sector: { type: String, default: '', trim: true, maxlength: 120 },     // mots-clés recherchés (ex. « restaurant »)
  cities: { type: [String], default: [] },
  country: { type: String, default: 'Bénin', trim: true, maxlength: 60 },
  language: { type: String, default: 'fr', enum: ['fr'] },
  offer: { type: String, default: '', maxlength: 1000 },                  // angle / offre mis en avant
  status: { type: String, enum: ['brouillon', 'active', 'en_pause', 'terminee'], default: 'brouillon', index: true },
  dailyLimit: { type: Number, default: 20, min: 1, max: 100 },
  maxProspects: { type: Number, default: 200, min: 1, max: 5000 },
  followUps: { type: [Number], default: [3, 7] },                         // relances : jours après le premier e-mail
  isTest: { type: Boolean, default: false },                              // campagne « Tests » (prospects de test)
  // Curseurs de recherche Google Places par ville : { [ville]: { pageToken, exhausted, pages } }
  discovery: { type: mongoose.Schema.Types.Mixed, default: {} },
  stats: {
    found: { type: Number, default: 0 },
    withEmail: { type: Number, default: 0 },
    contacted: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    replied: { type: Number, default: 0 },
    interested: { type: Number, default: 0 },
    converted: { type: Number, default: 0 },
    updatedAt: { type: Date },
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

prospectCampaignSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });

module.exports = mongoose.model('ProspectCampaign', prospectCampaignSchema);
