const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['todo', 'in_progress', 'review', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  dueDate: { type: Date },
  completedAt: { type: Date },
  tags: [String],
  checklist: [{
    text: String,
    done: { type: Boolean, default: false }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.status === 'done' && !this.completedAt) this.completedAt = Date.now();
  next();
});

module.exports = mongoose.model('Task', taskSchema);
