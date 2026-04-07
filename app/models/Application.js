const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobOffer: { type: mongoose.Schema.Types.ObjectId, ref: 'JobOffer', required: true },
  jobTitle: { type: String, default: '' },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  coverLetter: { type: String, default: '' },
  cvUrl: { type: String, default: '' },
  cvFilename: { type: String, default: '' },
  status: {
    type: String,
    enum: ['nouveau', 'en_revue', 'preselectionne', 'entretien', 'test', 'accepte', 'refuse', 'retire'],
    default: 'nouveau'
  },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  notes: { type: String, default: '' },
  interviewDate: { type: Date },
  interviewLocation: { type: String, default: '' },
  source: { type: String, default: 'site' },
  history: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

applicationSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Application', applicationSchema);
