const express = require('express');
const router = express.Router();
const User = require('../models/User');
const StudentEnrollment = require('../models/StudentEnrollment');
const LessonProgress = require('../models/LessonProgress');
const LessonComment = require('../models/LessonComment');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { sanitize, sanitizeEmail } = require('../middleware/security');

// ========================================
// PUBLIC : registration as student
// POST /api/lms/register
// Body: { name, email, password, formationSlug?, formationTitle?, language? }
// ========================================
router.post('/register', async (req, res) => {
  try {
    const name = sanitize(req.body.name, 100);
    const email = sanitizeEmail(req.body.email);
    const password = (req.body.password || '').toString();
    const formationSlug = sanitize(req.body.formationSlug || '', 100);
    const formationTitle = sanitize(req.body.formationTitle || '', 250);
    const language = req.body.language === 'en' ? 'en' : 'fr';

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe requis.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Mot de passe trop court (6 caracteres min).' });
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, password, role: 'client' });
    } else {
      // existing user: do not change password silently, just enroll
    }

    // Auto-enroll if formationSlug provided
    let enrollment = null;
    if (formationSlug) {
      enrollment = await StudentEnrollment.findOneAndUpdate(
        { user: user._id, formationSlug },
        { $setOnInsert: { formationTitle, language, source: 'web-register' }, $set: { lastAccessedAt: new Date() } },
        { upsert: true, new: true }
      );
    }

    const token = user.generateToken();
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      enrollment,
      token
    });
  } catch (err) {
    console.error('[lms] register error:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ========================================
// AUTH : enroll current user
// POST /api/lms/enroll
// Body: { formationSlug, formationTitle, language? }
// ========================================
router.post('/enroll', auth, async (req, res) => {
  try {
    const formationSlug = sanitize(req.body.formationSlug || '', 100);
    const formationTitle = sanitize(req.body.formationTitle || '', 250);
    const language = req.body.language === 'en' ? 'en' : 'fr';
    if (!formationSlug) return res.status(400).json({ error: 'formationSlug requis.' });

    const enrollment = await StudentEnrollment.findOneAndUpdate(
      { user: req.user._id, formationSlug },
      { $setOnInsert: { formationTitle, language, source: 'web-enroll' }, $set: { lastAccessedAt: new Date() } },
      { upsert: true, new: true }
    );
    res.json({ success: true, enrollment });
  } catch (err) {
    console.error('[lms] enroll error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// AUTH : mark lesson progress
// POST /api/lms/progress
// Body: { formationSlug, moduleIdx, lessonIdx, completed?, timeSpentSec? }
// ========================================
router.post('/progress', auth, async (req, res) => {
  try {
    const formationSlug = sanitize(req.body.formationSlug || '', 100);
    const moduleIdx = parseInt(req.body.moduleIdx);
    const lessonIdx = parseInt(req.body.lessonIdx);
    const completed = Boolean(req.body.completed);
    const timeSpentSec = Math.min(parseInt(req.body.timeSpentSec) || 0, 7200);

    if (!formationSlug || !moduleIdx || !lessonIdx) {
      return res.status(400).json({ error: 'formationSlug, moduleIdx, lessonIdx requis.' });
    }

    const update = { lastVisitedAt: new Date() };
    if (completed) {
      update.completed = true;
      update.completedAt = new Date();
    }
    const inc = timeSpentSec > 0 ? { $inc: { timeSpentSec } } : {};

    const progress = await LessonProgress.findOneAndUpdate(
      { user: req.user._id, formationSlug, moduleIdx, lessonIdx },
      { $set: update, ...inc },
      { upsert: true, new: true }
    );

    // Touch enrollment lastAccessedAt
    await StudentEnrollment.findOneAndUpdate(
      { user: req.user._id, formationSlug },
      { $set: { lastAccessedAt: new Date() } }
    );

    res.json({ success: true, progress });
  } catch (err) {
    console.error('[lms] progress error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// AUTH : get my progress for a formation
// GET /api/lms/my-progress?formation=slug
// ========================================
router.get('/my-progress', auth, async (req, res) => {
  try {
    const formationSlug = sanitize(req.query.formation || '', 100);
    if (!formationSlug) return res.status(400).json({ error: 'formation param requis.' });

    const enrollment = await StudentEnrollment.findOne({
      user: req.user._id,
      formationSlug
    });
    const lessons = await LessonProgress.find({
      user: req.user._id,
      formationSlug
    }).select('moduleIdx lessonIdx completed completedAt timeSpentSec lastVisitedAt');

    res.json({
      enrolled: !!enrollment,
      enrollment,
      lessons,
      completedCount: lessons.filter(l => l.completed).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// AUTH : check enrollment status for current user
// GET /api/lms/me
// ========================================
router.get('/me', auth, async (req, res) => {
  try {
    const enrollments = await StudentEnrollment.find({ user: req.user._id })
      .sort({ lastAccessedAt: -1 });
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      enrollments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// ADMIN : list all enrollments
// GET /api/lms/admin/enrollments?formation=slug&q=search&limit=200
// ========================================
router.get('/admin/enrollments', auth, adminOrEmployee, async (req, res) => {
  try {
    const { formation, q, limit } = req.query;
    const query = {};
    if (formation) query.formationSlug = formation;
    const max = Math.min(parseInt(limit) || 200, 1000);

    let enrollments = await StudentEnrollment.find(query)
      .populate('user', 'name email role lastLogin createdAt')
      .sort({ lastAccessedAt: -1 })
      .limit(max);

    if (q) {
      const lower = q.toLowerCase();
      enrollments = enrollments.filter(e =>
        (e.user && (e.user.name?.toLowerCase().includes(lower) || e.user.email?.toLowerCase().includes(lower))) ||
        e.formationSlug.toLowerCase().includes(lower) ||
        (e.formationTitle || '').toLowerCase().includes(lower)
      );
    }

    res.json({ enrollments, count: enrollments.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// ADMIN : detailed view of a student
// GET /api/lms/admin/student/:userId
// ========================================
router.get('/admin/student/:userId', auth, adminOrEmployee, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name email role lastLogin createdAt');
    if (!user) return res.status(404).json({ error: 'Etudiant non trouve.' });
    const enrollments = await StudentEnrollment.find({ user: user._id }).sort({ lastAccessedAt: -1 });
    const progress = await LessonProgress.find({ user: user._id }).sort({ lastVisitedAt: -1 });
    const comments = await LessonComment.find({ email: user.email })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ user, enrollments, progress, comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// ADMIN : global stats
// GET /api/lms/admin/stats
// ========================================
router.get('/admin/stats', auth, adminOrEmployee, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'client' });
    const totalEnrollments = await StudentEnrollment.countDocuments();
    const totalLessonsCompleted = await LessonProgress.countDocuments({ completed: true });
    const totalComments = await LessonComment.countDocuments();
    const pendingComments = await LessonComment.countDocuments({ status: 'pending' });

    // Top 10 formations
    const topFormations = await StudentEnrollment.aggregate([
      { $group: { _id: '$formationSlug', count: { $sum: 1 }, title: { $first: '$formationTitle' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Last 30 days enrollments
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEnrollments = await StudentEnrollment.countDocuments({ enrolledAt: { $gte: since } });

    res.json({
      totalStudents,
      totalEnrollments,
      totalLessonsCompleted,
      totalComments,
      pendingComments,
      recentEnrollments,
      topFormations
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
