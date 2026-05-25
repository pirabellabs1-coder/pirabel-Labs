const mongoose = require('mongoose');

const studentEnrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  formationSlug: { type: String, required: true, trim: true, maxlength: 100, index: true },
  formationTitle: { type: String, trim: true, maxlength: 250 },
  language: { type: String, enum: ['fr', 'en'], default: 'fr' },
  enrolledAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  source: { type: String, default: 'web', maxlength: 50 },
}, { timestamps: true });

studentEnrollmentSchema.index({ user: 1, formationSlug: 1 }, { unique: true });

module.exports = mongoose.model('StudentEnrollment', studentEnrollmentSchema);
