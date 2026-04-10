const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String, default: '' },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number, default: 0 },
  billable: { type: Boolean, default: true },
  hourlyRate: { type: Number, default: 0 },
  isRunning: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

timeEntrySchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 60000);
    this.isRunning = false;
  }
  next();
});

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
