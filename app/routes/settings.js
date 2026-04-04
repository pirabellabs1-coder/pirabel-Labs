const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { auth, adminOnly } = require('../middleware/auth');

// GET /api/settings
router.get('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'main' });
    if (!settings) settings = await Settings.create({ key: 'main' });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings
router.put('/', auth, adminOnly, async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      { key: 'main' },
      { ...req.body, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/public — non-auth for PDF/emails
router.get('/public', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'main' });
    if (!settings) settings = await Settings.create({ key: 'main' });
    res.json({
      agencyName: settings.agencyName,
      agencyEmail: settings.agencyEmail,
      agencyPhone: settings.agencyPhone,
      agencyAddress: settings.agencyAddress,
      agencyCity: settings.agencyCity,
      agencyCountry: settings.agencyCountry,
      agencyWebsite: settings.agencyWebsite,
      agencySiret: settings.agencySiret,
      agencyTva: settings.agencyTva,
      agencyLogo: settings.agencyLogo
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
