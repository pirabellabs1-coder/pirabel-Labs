const express = require('express');
const router = express.Router();
const EmailTemplate = require('../models/EmailTemplate');
const { auth, adminOrEmployee } = require('../middleware/auth');

router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { category } = req.query;
    const q = category ? { category } : {};
    const templates = await EmailTemplate.find(q).sort({ category: 1, name: 1 });
    res.json({ templates });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const t = await EmailTemplate.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Template non trouve' });
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const t = await EmailTemplate.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const t = await EmailTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await EmailTemplate.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Render template with variables
router.post('/:id/render', auth, adminOrEmployee, async (req, res) => {
  try {
    const t = await EmailTemplate.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Template non trouve' });
    const vars = req.body.variables || {};
    let body = t.body;
    let subject = t.subject;
    Object.keys(vars).forEach(k => {
      const re = new RegExp('{{\\s*' + k + '\\s*}}', 'g');
      body = body.replace(re, vars[k]);
      subject = subject.replace(re, vars[k]);
    });
    res.json({ subject, body });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
