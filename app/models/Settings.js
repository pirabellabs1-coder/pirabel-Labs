const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  agencyName: { type: String, default: 'Pirabel Labs' },
  agencyEmail: { type: String, default: 'pirabellabs@gmail.com' },
  agencyPhone: { type: String, default: '' },
  agencyAddress: { type: String, default: '' },
  agencyCity: { type: String, default: '' },
  agencyCountry: { type: String, default: '' },
  agencyWebsite: { type: String, default: 'https://pirabellabs.com' },
  agencySiret: { type: String, default: '' },
  agencyTva: { type: String, default: '' },
  agencyLogo: { type: String, default: '' },
  defaultTaxRate: { type: Number, default: 20 },
  defaultCurrency: { type: String, default: 'EUR' },
  invoicePrefix: { type: String, default: 'PL' },
  invoiceFooter: { type: String, default: '' },
  emailSignature: { type: String, default: '' },
  salaryPayDay: { type: Number, default: 5 },
  salaryReminderDays: { type: Number, default: 2 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', settingsSchema);
