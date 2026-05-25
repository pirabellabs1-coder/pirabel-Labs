const express = require('express');
const router = express.Router();
const LessonComment = require('../models/LessonComment');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { sanitize, sanitizeEmail } = require('../middleware/security');

// Rate limit memory
const recentSubmits = new Map(); // ip -> timestamp[]
const MAX_PER_HOUR = 5;
const HOUR = 60 * 60 * 1000;

function rateLimit(ip) {
  const now = Date.now();
  const list = recentSubmits.get(ip) || [];
  const recent = list.filter(t => now - t < HOUR);
  if (recent.length >= MAX_PER_HOUR) return false;
  recent.push(now);
  recentSubmits.set(ip, recent);
  return true;
}

// POST /api/lesson-comments - public, submit a comment
router.post('/', async (req, res) => {
  try {
    const ip = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim();
    if (!rateLimit(ip)) {
      return res.status(429).json({ error: 'Trop de commentaires. Reessayez dans 1h.' });
    }

    const { lesson, name, email, comment } = req.body || {};
    if (!lesson || !name || !email || !comment) {
      return res.status(400).json({ error: 'Champs requis manquants.' });
    }

    const lessonClean = sanitize(lesson, 200);
    const nameClean = sanitize(name, 100);
    const emailClean = sanitizeEmail(email);
    const commentClean = sanitize(comment, 3000);

    if (!emailClean) return res.status(400).json({ error: 'Email invalide.' });
    if (commentClean.length < 10) return res.status(400).json({ error: 'Commentaire trop court (10 caracteres min).' });

    // Basic spam check
    const lower = commentClean.toLowerCase();
    const spamWords = ['viagra', 'casino', 'porn', 'buy now', 'click here', 'free money', 'bitcoin'];
    if (spamWords.some(w => lower.includes(w))) {
      // Save as spam directly
      await LessonComment.create({
        lesson: lessonClean, name: nameClean, email: emailClean,
        comment: commentClean, ip, status: 'spam',
      });
      return res.json({ success: true });
    }

    await LessonComment.create({
      lesson: lessonClean, name: nameClean, email: emailClean,
      comment: commentClean, ip, status: 'pending',
    });
    res.json({ success: true });
  } catch (err) {
    console.error('[lesson-comments] POST error:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/lesson-comments?lesson=<slug> - public, list approved comments
router.get('/', async (req, res) => {
  try {
    const { lesson } = req.query;
    if (!lesson) return res.status(400).json({ error: 'lesson param required' });
    const lessonClean = sanitize(lesson, 200);
    const comments = await LessonComment.find({ lesson: lessonClean, status: 'approved' })
      .select('name comment createdAt')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ comments });
  } catch (err) {
    console.error('[lesson-comments] GET error:', err.message);
    res.status(500).json({ error: 'Erreur serveur', comments: [] });
  }
});

// === ADMIN ROUTES ===

// GET /api/lesson-comments/admin - all comments (admin only)
router.get('/admin', auth, adminOrEmployee, async (req, res) => {
  try {
    const { status, lesson } = req.query;
    const query = {};
    if (status) query.status = status;
    if (lesson) query.lesson = lesson;
    const comments = await LessonComment.find(query)
      .sort({ createdAt: -1 })
      .limit(500);
    res.json({ comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/lesson-comments/:id/approve
router.patch('/:id/approve', auth, adminOrEmployee, async (req, res) => {
  try {
    const c = await LessonComment.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedAt: new Date() },
      { new: true }
    );
    res.json({ success: true, comment: c });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/lesson-comments/:id/spam
router.patch('/:id/spam', auth, adminOrEmployee, async (req, res) => {
  try {
    const c = await LessonComment.findByIdAndUpdate(
      req.params.id, { status: 'spam' }, { new: true }
    );
    res.json({ success: true, comment: c });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/lesson-comments/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await LessonComment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
