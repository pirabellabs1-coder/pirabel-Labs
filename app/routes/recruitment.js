const express = require('express');
const router = express.Router();
const JobOffer = require('../models/JobOffer');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const { auth, adminOrEmployee, adminOnly } = require('../middleware/auth');
const { sendEmail, notifyNewApplication, sendApplicationConfirmation, sendApplicationStatusUpdate } = require('../config/email');
const { rateLimit, sanitize, sanitizeEmail, isValidEmail, honeypotCheck, limitBody } = require('../middleware/security');

const applyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de candidatures. Reessayez dans 15 minutes.', keyPrefix: 'apply' });

function slugify(str) {
  return (str || '').toString().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

// ============ JOB OFFERS ============

// GET /api/recruitment/jobs/public — public list
router.get('/jobs/public', async (req, res) => {
  try {
    const jobs = await JobOffer.find({ status: 'ouvert' })
      .sort({ publishedAt: -1 })
      .select('-__v');
    res.json({ jobs });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/recruitment/jobs/public/:slug — public detail
router.get('/jobs/public/:slug', async (req, res) => {
  try {
    const job = await JobOffer.findOne({ slug: req.params.slug, status: 'ouvert' });
    if (!job) return res.status(404).json({ error: 'Offre introuvable' });
    job.views = (job.views || 0) + 1;
    job.save().catch(() => {});
    res.json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/recruitment/jobs — admin list
router.get('/jobs', auth, adminOrEmployee, async (req, res) => {
  try {
    const jobs = await JobOffer.find().sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/recruitment/jobs — create job
router.post('/jobs', auth, adminOnly, limitBody(20), async (req, res) => {
  try {
    const title = sanitize(req.body.title, 200);
    if (!title) return res.status(400).json({ error: 'Titre requis' });
    let slug = slugify(req.body.slug || title);
    let counter = 1;
    while (await JobOffer.findOne({ slug })) { slug = slugify(title) + '-' + counter++; }
    const job = await JobOffer.create({
      title,
      slug,
      department: sanitize(req.body.department || '', 100),
      location: sanitize(req.body.location || 'Remote', 100),
      type: req.body.type || 'CDI',
      description: sanitize(req.body.description || '', 5000),
      requirements: Array.isArray(req.body.requirements) ? req.body.requirements.slice(0, 20).map(r => sanitize(r, 200)) : [],
      benefits: Array.isArray(req.body.benefits) ? req.body.benefits.slice(0, 20).map(b => sanitize(b, 200)) : [],
      salary: sanitize(req.body.salary || '', 100),
      experience: sanitize(req.body.experience || '', 100),
      status: ['ouvert', 'ferme', 'brouillon'].includes(req.body.status) ? req.body.status : 'ouvert'
    });
    res.status(201).json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/recruitment/jobs/:id
router.put('/jobs/:id', auth, adminOnly, async (req, res) => {
  try {
    const job = await JobOffer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) return res.status(404).json({ error: 'Offre introuvable' });
    res.json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/recruitment/jobs/:id
router.delete('/jobs/:id', auth, adminOnly, async (req, res) => {
  try {
    await Application.deleteMany({ jobOffer: req.params.id });
    const job = await JobOffer.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Offre introuvable' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============ APPLICATIONS ============

// POST /api/recruitment/jobs/:slug/apply — public apply
router.post('/jobs/:slug/apply', applyLimiter, honeypotCheck('website_url'), limitBody(20), async (req, res) => {
  try {
    const job = await JobOffer.findOne({ slug: req.params.slug, status: 'ouvert' });
    if (!job) return res.status(404).json({ error: 'Offre introuvable ou fermee' });

    const name = sanitize(req.body.name, 100);
    const email = sanitizeEmail(req.body.email);
    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom requis' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide' });

    const app = await Application.create({
      jobOffer: job._id,
      jobTitle: job.title,
      name,
      email,
      phone: sanitize(req.body.phone || '', 30),
      linkedin: sanitize(req.body.linkedin || '', 300),
      portfolio: sanitize(req.body.portfolio || '', 300),
      coverLetter: sanitize(req.body.coverLetter || '', 5000),
      cvUrl: sanitize(req.body.cvUrl || '', 500000),
      cvFilename: sanitize(req.body.cvFilename || '', 200),
      source: sanitize(req.body.source || 'site', 50)
    });

    job.applicationCount = (job.applicationCount || 0) + 1;
    await job.save();

    Notification.create({
      forRole: 'admin',
      type: 'application',
      title: `Nouvelle candidature : ${name}`,
      message: `Pour le poste ${job.title}`,
      link: `/candidates?job=${job._id}`,
      icon: 'person_add'
    }).catch(() => {});

    // Send rich template emails (await to ensure delivery on Vercel serverless)
    try {
      // Admin notification with full template
      await notifyNewApplication(app, job);
      // Candidate confirmation with hero template
      await sendApplicationConfirmation(email, name, job.title);
    } catch (err) { console.error('Recruitment email error:', err.message); }

    if (req.app.get('io')) {
      req.app.get('io').emit('new-application', { id: app._id, name, jobTitle: job.title });
    }

    res.status(201).json({ success: true, message: 'Candidature envoyee. Nous vous recontactons sous 7 jours.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/recruitment/applications — list (admin)
router.get('/applications', auth, adminOrEmployee, async (req, res) => {
  try {
    const { jobOffer, status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (jobOffer) query.jobOffer = jobOffer;
    if (status) query.status = status;
    const apps = await Application.find(query)
      .populate('jobOffer', 'title slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Application.countDocuments(query);
    res.json({ applications: apps, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/recruitment/applications/:id
router.get('/applications/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id).populate('jobOffer', 'title slug');
    if (!app) return res.status(404).json({ error: 'Candidature introuvable' });
    res.json(app);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/recruitment/applications/:id
router.put('/applications/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Candidature introuvable' });

    const previousStatus = app.status;
    const newStatus = req.body.status;

    if (newStatus && newStatus !== previousStatus) {
      app.history.push({ status: newStatus, changedBy: req.user._id, note: req.body.note || '' });
    }
    Object.assign(app, req.body);
    await app.save();

    // Send automatic status update email to candidate
    if (newStatus && newStatus !== previousStatus && app.email) {
      try {
        await sendApplicationStatusUpdate(
          app.email,
          app.name,
          app.jobTitle || 'Poste Pirabel Labs',
          newStatus,
          req.body.note || null
        );
        console.log(`[recruitment] Status email sent to ${app.email} for status: ${newStatus}`);
      } catch (err) {
        console.error('[recruitment] Status email error:', err.message);
      }
    }

    res.json(app);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/recruitment/applications/:id/email — send manual email to candidate
router.post('/applications/:id/email', auth, adminOrEmployee, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Candidature introuvable' });
    const subject = sanitize(req.body.subject || '', 200);
    const body = req.body.body || '';
    if (!subject || !body) return res.status(400).json({ error: 'Sujet et contenu requis' });
    // Use masterTemplate for custom emails too
    const { masterTemplate } = require('../config/email');
    const html = masterTemplate({
      title: subject,
      body: `<p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">${body.replace(/\n/g, '<br>')}</p>`
    });
    await sendEmail(app.email, subject, html);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/recruitment/applications/:id
router.delete('/applications/:id', auth, adminOnly, async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/recruitment/stats
router.get('/stats', auth, adminOrEmployee, async (req, res) => {
  try {
    const [openJobs, totalJobs, totalApps, byStatus] = await Promise.all([
      JobOffer.countDocuments({ status: 'ouvert' }),
      JobOffer.countDocuments(),
      Application.countDocuments(),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);
    res.json({ openJobs, totalJobs, totalApps, byStatus });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
