const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: Date
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  service: { type: String, enum: ['seo', 'web', 'ia', 'ads', 'social', 'cro', 'email', 'content', 'video', 'design', 'formation', 'consulting', 'autre'], required: true },
  status: { type: String, enum: ['en_attente', 'en_cours', 'en_pause', 'termine', 'annule'], default: 'en_attente' },
  priority: { type: String, enum: ['basse', 'normale', 'haute', 'urgente'], default: 'normale' },
  description: { type: String, default: '' },
  budget: { type: Number, default: 0 },
  startDate: { type: Date },
  deadline: { type: Date },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  tasks: [taskSchema],
  updates: [{
    message: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

projectSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Project', projectSchema);
