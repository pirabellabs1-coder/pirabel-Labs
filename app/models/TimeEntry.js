const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', index: true },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  description: String,
  startedAt: { type: Date, required: true },
  endedAt: Date,
  durationMinutes: { type: Number, default: 0 }, // Computed
  billable: { type: Boolean, default: true },
  hourlyRate: Number,
  status: { type: String, enum: ['running', 'stopped'], default: 'running', index: true }
}, { timestamps: true });

timeEntrySchema.pre('save', function (next) {
  if (this.endedAt && this.startedAt) {
    this.durationMinutes = Math.round((this.endedAt - this.startedAt) / 60000);
    this.status = 'stopped';
  }
  next();
});

module.exports = mongoose.models.TimeEntry || mongoose.model('TimeEntry', timeEntrySchema);
