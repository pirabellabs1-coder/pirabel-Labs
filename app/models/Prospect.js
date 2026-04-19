const mongoose = require('mongoose');

// Timeline event for one prospect — every outbound email, every reply,
// every status change. Gives a complete picture in the admin UI.
const timelineEventSchema = new mongoose.Schema({
  type: { type: String, enum: ['email_sent', 'email_opened', 'email_replied', 'status_change', 'note', 'meeting_booked'], required: true },
  at: { type: Date, default: Date.now },
  subject: { type: String, default: '' },
  body: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: true });

const prospectSchema = new mongoose.Schema({
  // Identity
  company: { type: String, default: '' },
  contactName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, index: true },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  sector: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },

  // Qualification
  status: { type: String, enum: ['nouveau', 'contacte', 'intéressé', 'rdv_pris', 'negociation', 'converti', 'perdu', 'no_reply'], default: 'nouveau', index: true },
  temperature: { type: String, enum: ['chaud', 'tiede', 'froid'], default: 'froid' },
  score: { type: Number, default: 0, min: 0, max: 100 },

  // Opportunity context
  problem: { type: String, default: '' },
  opportunity: { type: String, default: '' },
  serviceInterest: [{ type: String }], // e.g. ['seo', 'web', 'ia']
  estimatedValue: { type: Number, default: 0 }, // € potential revenue
  notes: { type: String, default: '' },

  // Campaign / Outreach metadata
  source: { type: String, default: 'manual' }, // 'cold_outreach', 'chatbot', 'form', etc
  campaign: { type: String, default: '' },     // grouping identifier
  emailsSent: { type: Number, default: 0 },
  lastContactedAt: { type: Date },
  lastRepliedAt: { type: Date },
  nextFollowUpAt: { type: Date },
  timeline: [timelineEventSchema],

  // Relations
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  convertedToClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

prospectSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

// Helper to add timeline events from code (non-breaking)
prospectSchema.methods.addEvent = function(type, fields = {}) {
  this.timeline = this.timeline || [];
  this.timeline.push({ type, at: new Date(), ...fields });
};

module.exports = mongoose.model('Prospect', prospectSchema);
