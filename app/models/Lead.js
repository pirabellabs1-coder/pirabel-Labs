const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  visitor: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    sector: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  qualification: {
    score: { type: Number, default: 0 },
    level: { type: String, enum: ['Chaud', 'Tiede', 'Froid'], default: 'Froid' },
    budget: { type: String, default: '' },
    timeline: { type: String, default: '' },
    decisionMaker: { type: Boolean, default: false }
  },
  problems: [String],
  interests: [String],
  services: [{
    name: { type: String, default: '' },
    estimatedBudget: { type: String, default: '' }
  }],
  conversationSummary: { type: String, default: '' },
  offer: {
    services: [String],
    totalEstimate: { type: String, default: '' },
    timeline: { type: String, default: '' },
    objectives: [String]
  },
  offerSent: { type: Boolean, default: false },
  offerSentAt: { type: Date },
  messageCount: { type: Number, default: 0 },
  topicsDiscussed: [String],
  duration: { type: String, default: '' },
  source: { type: String, default: '' },
  status: { type: String, enum: ['nouveau', 'contacte', 'en_cours', 'converti', 'perdu'], default: 'nouveau' },
  notes: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  followUpSent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

leadSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });
leadSchema.pre('findOneAndUpdate', function(next) { this.set({ updatedAt: Date.now() }); next(); });

module.exports = mongoose.model('Lead', leadSchema);
