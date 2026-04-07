const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { auth, adminOrEmployee } = require('../middleware/auth');
const crypto = require('crypto');

// GET /api/reviews — Admin: all reviews
router.get('/', auth, async (req, res) => {
  try {
    const { isApproved, isPublic } = req.query;
    const query = {};
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    const reviews = await Review.find(query)
      .populate('client', 'company contactName')
      .populate('project', 'name')
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/public — Public testimonials
router.get('/public', async (req, res) => {
  try {
    const reviews = await Review.find({ isPublic: true, isApproved: true })
      .select('name company rating title comment service submittedAt')
      .sort({ rating: -1, submittedAt: -1 })
      .limit(20);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/submit/:token — Public review form
router.get('/submit/:token', async (req, res) => {
  try {
    const review = await Review.findOne({ token: req.params.token });
    if (!review) return res.status(404).json({ error: 'Lien invalide ou expiré' });
    if (review.rating > 0) return res.json({ alreadySubmitted: true });
    res.json({ name: review.name, company: review.company, service: review.service });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/submit/:token — Submit review
router.post('/submit/:token', async (req, res) => {
  try {
    const review = await Review.findOne({ token: req.params.token });
    if (!review) return res.status(404).json({ error: 'Lien invalide' });

    review.rating = req.body.rating;
    review.title = req.body.title || '';
    review.comment = req.body.comment;
    review.submittedAt = Date.now();
    await review.save();

    res.json({ success: true, message: 'Merci pour votre avis !' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews — Admin create review request
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const review = await Review.create({ ...req.body, token, rating: 0, comment: '' });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:id/send — Send review request email
router.post('/:id/send', auth, adminOrEmployee, async (req, res) => {
  try {
    const { sendEmail, masterTemplate } = require('../config/email');
    const review = await Review.findById(req.params.id);
    if (!review || !review.email) return res.status(400).json({ error: 'Pas d\'email' });

    const SITE = process.env.SITE_URL || 'https://www.pirabellabs.com';
    const html = masterTemplate({
      preheader: 'Votre avis nous intéresse',
      title: 'Comment s\'est passé votre projet ?',
      subtitle: 'Votre avis compte',
      body: `
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${review.name},</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Nous espérons que vous êtes satisfait(e) de notre collaboration. Votre retour d'expérience nous aide à nous améliorer.</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Cela ne prend que 2 minutes :</p>
      `,
      cta: 'Donner mon avis',
      ctaUrl: `${SITE}/avis?token=${review.token}`
    });

    const success = await sendEmail(review.email, 'Votre avis sur notre collaboration — Pirabel Labs', html);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/reviews/:id — Admin approve/publish
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!review) return res.status(404).json({ error: 'Avis non trouvé' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
