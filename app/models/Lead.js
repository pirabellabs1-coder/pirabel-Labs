const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Type de lead : contact classique ou téléchargement livre blanc
  type: {
    type: String,
    enum: ['contact', 'livre-blanc'],
    default: 'contact',
    index: true
  },

  // Stade dans le funnel commercial
  stage: {
    type: String,
    enum: ['prospect', 'qualifie', 'devis_envoye', 'client', 'inactif'],
    default: 'prospect',
    index: true
  },

  // Pour les leads de type livre-blanc : slug du livre téléchargé
  livreBlancSlug: { type: String, default: '', maxlength: 100, index: true },
  livreBlancTitle: { type: String, default: '', maxlength: 200 },

  // Données soumises (communes contact + livre-blanc)
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
  phone: { type: String, default: '', trim: true, maxlength: 30 },
  company: { type: String, default: '', trim: true, maxlength: 120 },

  // Champs spécifiques au formulaire contact (optionnels pour livre-blanc)
  service: {
    type: String,
    enum: ['site-web', 'application', 'automatisation', 'seo', 'autre', 'livre-blanc', ''],
    default: ''
  },
  message: { type: String, default: '', maxlength: 5000 },

  // Données client (remplies après conversion prospect -> client)
  clientData: {
    address: { type: String, default: '', maxlength: 500 },
    city: { type: String, default: '', maxlength: 100 },
    country: { type: String, default: '', maxlength: 100 },
    role: { type: String, default: '', maxlength: 100 }, // ex: "CMO"
    industry: { type: String, default: '', maxlength: 100 },
    teamSize: { type: String, default: '', maxlength: 50 },
    website: { type: String, default: '', maxlength: 300 },
    notes: { type: String, default: '', maxlength: 5000 },
    becameClientAt: { type: Date },
    totalContractValue: { type: Number, default: 0 }, // total en EUR des devis acceptes
    quotesCount: { type: Number, default: 0 }
  },

  // Workflow admin (ancien status, maintenu pour compat)
  status: {
    type: String,
    enum: ['nouveau', 'lu', 'en_cours', 'converti', 'perdu', 'newsletter_ok'],
    default: 'nouveau',
    index: true
  },
  internalNotes: { type: String, default: '', maxlength: 5000 },

  // Opt-in newsletter (collecte des leads pour relance email)
  newsletterOptIn: { type: Boolean, default: true, index: true },

  // Tracking emails envoyés à ce lead (pour éviter doublons)
  lastEmailSentAt: { type: Date },
  emailsSentCount: { type: Number, default: 0 },

  // Tracking devis
  quotesSent: { type: Number, default: 0 },
  lastQuoteAt: { type: Date },

  // Tracking demandes d'avis
  reviewRequestedAt: { type: Date },
  reviewSubmittedAt: { type: Date },

  // Meta
  source: { type: String, default: 'site_contact', maxlength: 60 },
  userAgent: { type: String, default: '', maxlength: 500 },
  ipHash: { type: String, default: '', maxlength: 64 },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

leadSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });
leadSchema.pre('findOneAndUpdate', function(next) { this.set({ updatedAt: Date.now() }); next(); });

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ stage: 1, createdAt: -1 });
leadSchema.index({ type: 1, createdAt: -1 });
leadSchema.index({ email: 1 });
leadSchema.index({ livreBlancSlug: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
