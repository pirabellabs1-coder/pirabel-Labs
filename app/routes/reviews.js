const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { sanitize, sanitizeEmail, isValidEmail, honeypotCheck, rateLimit } = require('../middleware/security');

const submitLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3, message: 'Trop de soumissions', keyPrefix: 'review' });

// PUBLIC: list approved reviews
router.get('/public', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const featured = req.query.featured === '1';
    const q = { status: 'approved' };
    if (featured) q.featured = true;
    const reviews = await Review.find(q).sort({ featured: -1, createdAt: -1 }).limit(limit).select('-email -approvedAt');
    const stats = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json({ reviews, stats: stats[0] || { avg: 0, count: 0 } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUBLIC: submit
router.post('/submit', submitLimiter, honeypotCheck('website_url'), async (req, res) => {
  try {
    const name = sanitize(req.body.name, 100);
    const email = sanitizeEmail(req.body.email);
    const company = sanitize(req.body.company || '', 100);
    const role = sanitize(req.body.role || '', 100);
    const rating = parseInt(req.body.rating);
    const title = sanitize(req.body.title || '', 200);
    const content = sanitize(req.body.content, 2000);
    const service = sanitize(req.body.service || '', 30);

    if (!name) return res.status(400).json({ error: 'Nom requis' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Note 1-5 requise' });
    if (!content || content.length < 10) return res.status(400).json({ error: 'Avis trop court (min 10 caracteres)' });

    const r = await Review.create({ name, email, company, role, rating, title, content, service });
    res.status(201).json({ success: true, message: 'Merci ! Votre avis sera publie apres moderation.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ADMIN: list all
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { status } = req.query;
    const q = status ? { status } : {};
    const reviews = await Review.find(q).sort({ createdAt: -1 }).limit(200);
    res.json({ reviews });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const r = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (req.body.status === 'approved' && !r.approvedAt) {
      r.approvedAt = new Date();
      await r.save();
    }
    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
