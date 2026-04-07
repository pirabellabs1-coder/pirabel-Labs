const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, enum: ['consultation', 'demo', 'kickoff', 'review', 'entretien', 'autre'], default: 'consultation' },
  date: { type: Date, required: true },
  duration: { type: Number, default: 30 },
  with: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    company: { type: String, default: '' }
  },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: String, default: 'Visioconférence' },
  meetingLink: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['planifie', 'confirme', 'en_cours', 'termine', 'annule', 'no_show'], default: 'planifie' },
  reminderSent: { type: Boolean, default: false },
  source: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

appointmentSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });
appointmentSchema.index({ date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
