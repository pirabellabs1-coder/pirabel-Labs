const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  formationSlug: { type: String, required: true, trim: true, index: true },
  moduleIdx: { type: Number, required: true, min: 1 },
  lessonIdx: { type: Number, required: true, min: 1 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  timeSpentSec: { type: Number, default: 0 },
  lastVisitedAt: { type: Date, default: Date.now },
}, { timestamps: true });

lessonProgressSchema.index(
  { user: 1, formationSlug: 1, moduleIdx: 1, lessonIdx: 1 },
  { unique: true }
);

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
