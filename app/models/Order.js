const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  website: { type: String, default: '' },
  service: { type: String, required: true },
  budget: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, enum: ['nouvelle', 'en_traitement', 'devis_envoye', 'acceptee', 'refusee'], default: 'nouvelle' },
  source: { type: String, default: 'site' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  convertedToClient: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  convertedToProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

orderSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Order', orderSchema);
