const express = require('express');
const router = express.Router();
const EmailTemplate = require('../models/EmailTemplate');
const { auth, adminOrEmployee } = require('../middleware/auth');

// GET /api/email-templates
router.get('/', auth, async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category) query.category = category;
    const templates = await EmailTemplate.find(query).sort({ usageCount: -1, createdAt: -1 });
    res.json({ templates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/email-templates/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template non trouvé' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/email-templates
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const template = await EmailTemplate.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/email-templates/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) return res.status(404).json({ error: 'Template non trouvé' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/email-templates/:id/use — Increment usage counter
router.post('/:id/use', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(req.params.id, { $inc: { usageCount: 1 } }, { new: true });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/email-templates/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await EmailTemplate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
