const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  role: { type: String, required: true },
  department: { type: String, enum: ['seo', 'web', 'design', 'marketing', 'commercial', 'direction', 'support'], required: true },
  status: { type: String, enum: ['actif', 'inactif'], default: 'actif' },
  salary: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  skills: [String],
  activeProjects: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', employeeSchema);
