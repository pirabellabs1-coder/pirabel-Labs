const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const User = require('../models/User');
const StudentEnrollment = require('../models/StudentEnrollment');
const LessonProgress = require('../models/LessonProgress');
const LessonComment = require('../models/LessonComment');
const QuizAttempt = require('../models/QuizAttempt');
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

// ========================================
// AUTH : student dashboard (1-shot aggregate)
// GET /api/lms/student-dashboard
// Renvoie : user + enrollments enrichies (progress %, quiz scores, certificate state)
// ========================================
router.get('/student-dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Catalog metadata (lessons/modules count per formation)
    // Mirror exactly catalog.py
    const CATALOG = {
      'seo-debutant': { lessons: 25, modules: 5 },
      'seo-intermediaire': { lessons: 30, modules: 6 },
      'seo-avance': { lessons: 32, modules: 7 },
      'seo-local-google-business': { lessons: 22, modules: 5 },
      'wordpress-debutant': { lessons: 28, modules: 5 },
      'wordpress-intermediaire': { lessons: 30, modules: 6 },
      'wordpress-securite-performance': { lessons: 24, modules: 5 },
      'shopify-marchand-debutant': { lessons: 26, modules: 5 },
      'marketing-digital-fondamentaux': { lessons: 28, modules: 6 },
      'marketing-digital-strategie-avancee': { lessons: 30, modules: 6 },
      'inbound-marketing-complet': { lessons: 28, modules: 5 },
      'google-ads-debutant': { lessons: 26, modules: 5 },
      'meta-ads-facebook-instagram': { lessons: 28, modules: 6 },
      'tiktok-ads-creator-economy': { lessons: 22, modules: 5 },
      'social-media-strategie-complete': { lessons: 28, modules: 6 },
      'linkedin-b2b-personal-branding': { lessons: 20, modules: 5 },
      'copywriting-persuasif': { lessons: 26, modules: 5 },
      'content-marketing-strategique': { lessons: 26, modules: 5 },
      'redaction-seo-articles-qui-rankent': { lessons: 24, modules: 5 },
      'email-marketing-complet': { lessons: 26, modules: 5 },
      'newsletter-monetisation-creator': { lessons: 22, modules: 5 },
      'branding-identite-visuelle': { lessons: 26, modules: 6 },
      'ui-design-figma-mastery': { lessons: 30, modules: 6 },
      'motion-design-after-effects-marketing': { lessons: 28, modules: 5 },
      'ia-generative-marketing': { lessons: 24, modules: 5 },
      'agents-ia-chatbots-entreprise': { lessons: 32, modules: 7 },
      'automatisation-make-zapier-n8n': { lessons: 28, modules: 6 },
      'prompt-engineering-avance': { lessons: 24, modules: 5 },
      'ga4-google-analytics-mastery': { lessons: 26, modules: 5 },
      'cro-conversion-optimization': { lessons: 26, modules: 5 },
    };

    const [enrollments, allProgress, allQuizzes] = await Promise.all([
      StudentEnrollment.find({ user: userId }).sort({ lastAccessedAt: -1 }),
      LessonProgress.find({ user: userId }),
      QuizAttempt.find({ user: userId }),
    ]);

    const formations = enrollments.map(e => {
      const lessons = allProgress.filter(p => p.formationSlug === e.formationSlug);
      const completed = lessons.filter(l => l.completed).length;
      const quizzes = allQuizzes.filter(q => q.formationSlug === e.formationSlug);
      const bestByModule = {};
      for (const q of quizzes) {
        if (!bestByModule[q.moduleIdx] || q.score > bestByModule[q.moduleIdx].score) {
          bestByModule[q.moduleIdx] = q;
        }
      }
      const passedQuizzes = Object.values(bestByModule).filter(q => q.passed).length;
      const meta = CATALOG[e.formationSlug] || { lessons: 25, modules: 5 };
      const progressPct = Math.min(100, Math.round((completed / meta.lessons) * 100));
      const eligibleCertificate = completed >= 5 && passedQuizzes >= 1;

      return {
        slug: e.formationSlug,
        title: e.formationTitle,
        language: e.language,
        enrolledAt: e.enrolledAt,
        lastAccessedAt: e.lastAccessedAt,
        completedAt: e.completedAt,
        totalLessons: meta.lessons,
        totalModules: meta.modules,
        completedLessons: completed,
        progressPct,
        passedQuizzes,
        bestQuizScores: Object.values(bestByModule).map(q => ({
          moduleIdx: q.moduleIdx,
          score: q.score,
          total: q.total,
          passed: q.passed,
          attemptedAt: q.attemptedAt,
        })),
        eligibleCertificate,
        certificateUrl: eligibleCertificate ? `/formations/${e.formationSlug}/certificat` : null,
        resumeUrl: `/formations/${e.formationSlug}/m1-l1`,
      };
    });

    // Aggregate stats
    const totalLessonsAll = formations.reduce((s, f) => s + f.totalLessons, 0);
    const completedAll = formations.reduce((s, f) => s + f.completedLessons, 0);
    const certificatesEarned = formations.filter(f => f.eligibleCertificate).length;
    const totalQuizPassed = formations.reduce((s, f) => s + f.passedQuizzes, 0);

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        memberSince: req.user.createdAt,
      },
      stats: {
        formationsEnrolled: formations.length,
        totalLessons: totalLessonsAll,
        lessonsCompleted: completedAll,
        completionRate: totalLessonsAll ? Math.round((completedAll / totalLessonsAll) * 100) : 0,
        quizzesPassed: totalQuizPassed,
        certificatesEarned,
      },
      formations,
    });
  } catch (err) {
    console.error('[lms] student-dashboard error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// AUTH : submit a quiz attempt
// POST /api/lms/quiz/submit
// Body: { formationSlug, moduleIdx, score, total, passed }
// ========================================
router.post('/quiz/submit', auth, async (req, res) => {
  try {
    const formationSlug = sanitize(req.body.formationSlug || '', 100);
    const moduleIdx = parseInt(req.body.moduleIdx);
    const score = parseInt(req.body.score);
    const total = parseInt(req.body.total);
    const passed = Boolean(req.body.passed);

    if (!formationSlug || !moduleIdx || isNaN(score) || isNaN(total) || total < 1) {
      return res.status(400).json({ error: 'formationSlug, moduleIdx, score, total requis.' });
    }

    const attempt = await QuizAttempt.create({
      user: req.user._id,
      formationSlug,
      moduleIdx,
      score: Math.max(0, Math.min(score, total)),
      total,
      passed
    });

    // Touch enrollment lastAccessedAt
    await StudentEnrollment.findOneAndUpdate(
      { user: req.user._id, formationSlug },
      { $set: { lastAccessedAt: new Date() } }
    );

    res.json({ success: true, attempt });
  } catch (err) {
    console.error('[lms] quiz submit error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// AUTH : get my quiz results for a formation
// GET /api/lms/quiz/results?formation=slug
// ========================================
router.get('/quiz/results', auth, async (req, res) => {
  try {
    const formationSlug = sanitize(req.query.formation || '', 100);
    if (!formationSlug) return res.status(400).json({ error: 'formation requis.' });

    // Best attempt per module
    const attempts = await QuizAttempt.find({
      user: req.user._id,
      formationSlug
    }).sort({ moduleIdx: 1, score: -1 });

    const bestByModule = {};
    for (const a of attempts) {
      if (!bestByModule[a.moduleIdx] || a.score > bestByModule[a.moduleIdx].score) {
        bestByModule[a.moduleIdx] = a;
      }
    }

    res.json({
      attempts: Object.values(bestByModule),
      totalAttempts: attempts.length,
      modulesPassed: Object.values(bestByModule).filter(a => a.passed).length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// AUTH : certificate eligibility + data
// GET /api/lms/certificate-data?formation=slug
// Eligible if : enrolled + N lessons completed >= total - 2 + all modules quiz passed (or modulesPassed >= n_modules)
// ========================================
router.get('/certificate-data', auth, async (req, res) => {
  try {
    const formationSlug = sanitize(req.query.formation || '', 100);
    if (!formationSlug) return res.status(400).json({ error: 'formation requis.' });

    const enrollment = await StudentEnrollment.findOne({
      user: req.user._id,
      formationSlug
    });
    if (!enrollment) {
      return res.status(403).json({ eligible: false, error: 'Non inscrit.', lessonsCompleted: 0, modulesPassed: 0 });
    }

    const lessons = await LessonProgress.find({
      user: req.user._id,
      formationSlug,
      completed: true
    });

    const quizAttempts = await QuizAttempt.find({
      user: req.user._id,
      formationSlug
    });
    const bestByModule = {};
    for (const a of quizAttempts) {
      if (!bestByModule[a.moduleIdx] || a.score > bestByModule[a.moduleIdx].score) {
        bestByModule[a.moduleIdx] = a;
      }
    }
    const modulesPassed = Object.values(bestByModule).filter(a => a.passed).length;

    // Heuristique : eligible si modulesPassed > 0 ET lessons >= modules_count
    // (l'admin pourra ajuster les seuils dans une iteration future)
    // On utilise lesson count comme indicateur, sans connaitre le total exact ici
    // -> on demande au moins 1 quiz passe et 5 lecons completes
    const lessonsCompleted = lessons.length;
    const eligible = lessonsCompleted >= 5 && modulesPassed >= 1;

    // Certificate ID deterministe (sha1 stable)
    const certificateId = 'PL-' + crypto.createHash('sha1')
      .update(`${req.user._id}-${formationSlug}`)
      .digest('hex')
      .slice(0, 16)
      .toUpperCase();

    // Marquer la completion si eligible + pas deja marque
    if (eligible && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
      await enrollment.save();
    }

    res.json({
      eligible,
      lessonsCompleted,
      modulesPassed,
      studentName: req.user.name,
      studentEmail: req.user.email,
      issuedAt: enrollment.completedAt || new Date(),
      certificateId
    });
  } catch (err) {
    console.error('[lms] certificate-data error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========================================
// PUBLIC : verify a certificate by ID
// GET /api/lms/verify/:certificateId
// ========================================
router.get('/verify/:certificateId', async (req, res) => {
  try {
    const certificateId = sanitize(req.params.certificateId, 32);
    if (!certificateId || !/^PL-[A-F0-9]{16}$/.test(certificateId)) {
      return res.status(400).json({ valid: false, error: 'Format ID invalide.' });
    }
    // Cross-check : sha1(userId-formationSlug) = certificateId.replace('PL-', '')
    // Scan recent eligible enrollments
    const recentCompleted = await StudentEnrollment.find({
      completedAt: { $ne: null }
    }).populate('user', 'name email').limit(5000);

    for (const e of recentCompleted) {
      if (!e.user) continue;
      const id = 'PL-' + crypto.createHash('sha1')
        .update(`${e.user._id}-${e.formationSlug}`)
        .digest('hex')
        .slice(0, 16)
        .toUpperCase();
      if (id === certificateId) {
        return res.json({
          valid: true,
          studentName: e.user.name,
          formationTitle: e.formationTitle,
          formationSlug: e.formationSlug,
          issuedAt: e.completedAt
        });
      }
    }
    res.status(404).json({ valid: false, error: 'Certificat introuvable.' });
  } catch (err) {
    res.status(500).json({ valid: false, error: err.message });
  }
});

module.exports = router;
