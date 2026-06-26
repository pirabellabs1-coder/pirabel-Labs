const mongoose = require('mongoose');

// Tâche interne assignée à un employé — pilotage de l'équipe Pirabel Labs.
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // employé responsable
  assignedToName: { type: String, default: '' },  // dénormalisé pour affichage rapide
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['a_faire', 'en_cours', 'en_revue', 'termine', 'bloque'], default: 'a_faire', index: true },
  priority: { type: String, enum: ['basse', 'normale', 'haute', 'urgente'], default: 'normale' },
  dueDate: { type: Date },
  // Lien optionnel vers un objet métier (prospect, devis, client…)
  relatedType: { type: String, enum: ['', 'lead', 'quote', 'client', 'article', 'autre'], default: '' },
  relatedId: { type: String, default: '' },
  relatedLabel: { type: String, default: '' },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

taskSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (this.status === 'termine' && !this.completedAt) this.completedAt = new Date();
  if (this.status !== 'termine') this.completedAt = undefined;
  next();
});

module.exports = mongoose.model('Task', taskSchema);
