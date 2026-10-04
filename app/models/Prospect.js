const mongoose = require('mongoose');

// Entreprise trouvée sur Google Maps par l'agent de prospection.
const STATUTS_PROSPECT = ['nouveau', 'qualifie', 'sans_email', 'contacte', 'relance_1', 'relance_2', 'repondu',
  'interesse', 'pas_interesse', 'desinscrit', 'erreur', 'converti'];

const prospectEmailSchema = new mongoose.Schema({
  step: { type: Number, min: 0, max: 2, required: true },  // 0 = premier e-mail, 1-2 = relances
  subject: { type: String, default: '', maxlength: 200 },
  text: { type: String, default: '', maxlength: 4000 },
  source: { type: String, default: 'modele', enum: ['ia', 'modele'] },
  to: { type: String, default: '', maxlength: 254 },       // destinataire effectif (adresse de test en mode test)
  sentAt: { type: Date },
  resendId: { type: String, default: '', maxlength: 100 },
  delivered: { type: Boolean, default: false },
  opened: { type: Boolean, default: false },
  openedAt: { type: Date },
  test: { type: Boolean, default: false },                  // envoi de test : exclu des quotas et des statistiques
  error: { type: String, default: '', maxlength: 300 },
}, { _id: false });

const prospectSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProspectCampaign', index: true },
  placeId: { type: String, required: true, unique: true, maxlength: 200 },
  isTest: { type: Boolean, default: false, index: true },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  address: { type: String, default: '', maxlength: 300 },
  city: { type: String, default: '', maxlength: 100 },
  phone: { type: String, default: '', maxlength: 40 },
  website: { type: String, default: '', maxlength: 500 },
  mapsUrl: { type: String, default: '', maxlength: 500 },
  rating: { type: Number, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0, min: 0 },
  email: { type: String, default: '', lowercase: true, trim: true, maxlength: 254 },
  emailSource: { type: String, default: '', maxlength: 300 },   // page où l'adresse a été trouvée, ou « manuel »
  audit: {
    done: { type: Boolean, default: false },
    hasWebsite: { type: Boolean, default: false },
    reachable: { type: Boolean, default: false },
    https: { type: Boolean, default: false },
    mobileViewport: { type: Boolean, default: false },
    loadMs: { type: Number, default: 0 },
    title: { type: String, default: '', maxlength: 300 },
    metaDescription: { type: String, default: '', maxlength: 500 },
    hasWhatsApp: { type: Boolean, default: false },
    issues: { type: [String], default: [] },
    checkedAt: { type: Date },
  },
  score: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: STATUTS_PROSPECT, default: 'nouveau', index: true },
  emails: { type: [prospectEmailSchema], default: [] },
  // Brouillon préparé à l'avance (IA ou modèle) pour la prochaine étape : l'envoi reste rapide.
  draft: {
    step: { type: Number },
    subject: { type: String, default: '', maxlength: 200 },
    text: { type: String, default: '', maxlength: 4000 },
    source: { type: String, default: 'modele' },
    createdAt: { type: Date },
  },
  firstContactAt: { type: Date },
  lastActionAt: { type: Date },
  nextActionAt: { type: Date },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  replyText: { type: String, default: '', maxlength: 5000 },
  notes: { type: String, default: '', maxlength: 5000 },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

prospectSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });
prospectSchema.index({ status: 1, nextActionAt: 1 });
prospectSchema.index({ campaignId: 1, status: 1 });
prospectSchema.index({ email: 1 });
prospectSchema.index({ 'emails.resendId': 1 });
prospectSchema.index({ 'emails.sentAt': 1 });

prospectSchema.statics.STATUTS = STATUTS_PROSPECT;

module.exports = mongoose.model('Prospect', prospectSchema);
