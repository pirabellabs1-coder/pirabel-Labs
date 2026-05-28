const mongoose = require('mongoose');

const lessonCommentSchema = new mongoose.Schema({
  lesson: { type: String, required: true, trim: true, maxlength: 200, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200, select: false },
  comment: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['pending', 'approved', 'spam'], default: 'pending', index: true },
  ip: { type: String, default: '', select: false },
  createdAt: { type: Date, default: Date.now, index: true },
  approvedAt: { type: Date },
});


// --- Indexes (audit Tech Lead) ---
lessonCommentSchema.index({ formation: 1, createdAt: -1 });
lessonCommentSchema.index({ approved: 1, createdAt: -1 });

module.exports = mongoose.model('LessonComment', lessonCommentSchema);
