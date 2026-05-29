const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  formationSlug: { type: String, required: true, trim: true, maxlength: 100, index: true },
  moduleIdx: { type: Number, required: true, min: 1 },
  score: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 1 },
  passed: { type: Boolean, default: false },
  attemptedAt: { type: Date, default: Date.now },
}, { timestamps: true });

quizAttemptSchema.index({ user: 1, formationSlug: 1, moduleIdx: 1 });
quizAttemptSchema.index({ user: 1, passed: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
