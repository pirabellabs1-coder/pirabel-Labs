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

// GET /api/recruitment/jobs/public — public list (ouvert + ferme, jamais brouillon)
router.get('/jobs/public', async (req, res) => {
  try {
    const jobs = await JobOffer.find({ status: { $in: ['ouvert', 'ferme', 'pause'] } })
      // Ouvertes d'abord (featured first), puis fermees (recentes en premier)
      .sort({ status: 1, featured: -1, publishedAt: -1 })
      .select('-__v -createdBy -updatedBy');
    res.json({ jobs });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/recruitment/jobs/public/:slug — public detail (closed jobs viewable)
router.get('/jobs/public/:slug', async (req, res) => {
  try {
    const job = await JobOffer.findOne({
      slug: req.params.slug,
      status: { $in: ['ouvert', 'ferme', 'pause'] }
    });
    if (!job) return res.status(404).json({ error: 'Offre introuvable' });
    // Track views only for live offers
    if (job.status === 'ouvert') {
      job.views = (job.views || 0) + 1;
      job.save().catch(() => {});
    }
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

// Helper : sanitize array of strings
function cleanList(arr, max = 30, itemMax = 500) {
  if (!Array.isArray(arr)) return [];
  return arr.map(v => sanitize(String(v || ''), itemMax)).filter(Boolean).slice(0, max);
}

// Helper : extract clean fields from req.body (used by POST/PUT)
function extractJobFields(body) {
  const fields = {};
  if (body.title !== undefined) fields.title = sanitize(body.title, 200);
  if (body.department !== undefined) fields.department = sanitize(body.department || '', 100);
  if (body.remoteMode !== undefined && ['on-site', 'remote', 'hybrid'].includes(body.remoteMode)) fields.remoteMode = body.remoteMode;
  if (body.location !== undefined) fields.location = sanitize(body.location || '', 200);
  if (body.type !== undefined && ['CDI', 'CDD', 'Stage', 'Freelance', 'Alternance', 'Mission'].includes(body.type)) fields.type = body.type;
  if (body.experienceLevel !== undefined && ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Indifferent'].includes(body.experienceLevel)) fields.experienceLevel = body.experienceLevel;
  if (body.experience !== undefined) fields.experience = sanitize(body.experience || '', 100);
  if (body.shortDescription !== undefined) fields.shortDescription = sanitize(body.shortDescription || '', 280);
  if (body.description !== undefined) fields.description = sanitize(body.description || '', 10000);
  if (body.missions !== undefined) fields.missions = cleanList(body.missions, 20, 500);
  if (body.requirements !== undefined) fields.requirements = cleanList(body.requirements, 20, 300);
  if (body.niceToHave !== undefined) fields.niceToHave = cleanList(body.niceToHave, 20, 300);
  if (body.benefits !== undefined) fields.benefits = cleanList(body.benefits, 20, 300);
  if (body.process !== undefined) fields.process = cleanList(body.process, 10, 300);
  if (body.tools !== undefined) fields.tools = cleanList(body.tools, 30, 60);
  if (body.salaryMin !== undefined) fields.salaryMin = Math.max(0, parseInt(body.salaryMin) || 0);
  if (body.salaryMax !== undefined) fields.salaryMax = Math.max(0, parseInt(body.salaryMax) || 0);
  if (body.salaryCurrency !== undefined && ['EUR', 'FCFA', 'USD', 'GBP', 'MAD', 'CAD'].includes(body.salaryCurrency)) fields.salaryCurrency = body.salaryCurrency;
  if (body.salaryPeriod !== undefined && ['month', 'year', 'day', 'project'].includes(body.salaryPeriod)) fields.salaryPeriod = body.salaryPeriod;
  if (body.salaryHidden !== undefined) fields.salaryHidden = Boolean(body.salaryHidden);
  if (body.salary !== undefined) fields.salary = sanitize(body.salary || '', 100);
  if (body.status !== undefined && ['ouvert', 'ferme', 'brouillon', 'pause'].includes(body.status)) fields.status = body.status;
  if (body.closedReason !== undefined && ['filled', 'cancelled', 'paused', 'expired', ''].includes(body.closedReason)) fields.closedReason = body.closedReason;
  if (body.hiredCount !== undefined) fields.hiredCount = Math.max(0, parseInt(body.hiredCount) || 0);
  if (body.featured !== undefined) fields.featured = Boolean(body.featured);
  if (body.urgent !== undefined) fields.urgent = Boolean(body.urgent);
  if (body.applicationDeadline !== undefined) fields.applicationDeadline = body.applicationDeadline ? new Date(body.applicationDeadline) : null;
  if (body.startDate !== undefined) fields.startDate = body.startDate ? new Date(body.startDate) : null;
  if (body.seoTitle !== undefined) fields.seoTitle = sanitize(body.seoTitle || '', 80);
  if (body.seoDescription !== undefined) fields.seoDescription = sanitize(body.seoDescription || '', 200);
  return fields;
}

// POST /api/recruitment/jobs — create job
router.post('/jobs', auth, adminOnly, limitBody(50), async (req, res) => {
  try {
    const fields = extractJobFields(req.body);
    if (!fields.title) return res.status(400).json({ error: 'Titre requis' });
    let slug = slugify(req.body.slug || fields.title);
    let counter = 1;
    while (await JobOffer.findOne({ slug })) { slug = slugify(fields.title) + '-' + counter++; }
    fields.slug = slug;
    fields.createdBy = req.user._id;
    fields.updatedBy = req.user._id;
    // Default status = brouillon if unspecified
    if (!fields.status) fields.status = 'brouillon';
    const job = await JobOffer.create(fields);
    res.status(201).json(job);
  } catch (err) {
    console.error('[recruitment] create error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/recruitment/jobs/:id
router.put('/jobs/:id', auth, adminOnly, limitBody(50), async (req, res) => {
  try {
    const fields = extractJobFields(req.body);
    fields.updatedBy = req.user._id;
    // If slug provided manually, allow changing it (with collision check)
    if (req.body.slug !== undefined) {
      const newSlug = slugify(req.body.slug);
      if (newSlug) {
        const collision = await JobOffer.findOne({ slug: newSlug, _id: { $ne: req.params.id } });
        if (!collision) fields.slug = newSlug;
      }
    }
    const job = await JobOffer.findByIdAndUpdate(req.params.id, fields, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ error: 'Offre introuvable' });
    res.json(job);
  } catch (err) {
    console.error('[recruitment] update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recruitment/jobs/:id/duplicate — duplique une offre existante
router.post('/jobs/:id/duplicate', auth, adminOnly, async (req, res) => {
  try {
    const original = await JobOffer.findById(req.params.id).lean();
    if (!original) return res.status(404).json({ error: 'Offre introuvable' });
    delete original._id;
    delete original.createdAt;
    delete original.updatedAt;
    delete original.applicationCount;
    delete original.views;
    delete original.closedAt;
    original.title = original.title + ' (copie)';
    let slug = slugify(original.title);
    let counter = 1;
    while (await JobOffer.findOne({ slug })) { slug = slugify(original.title) + '-' + counter++; }
    original.slug = slug;
    original.status = 'brouillon';
    original.createdBy = req.user._id;
    original.updatedBy = req.user._id;
    const job = await JobOffer.create(original);
    res.status(201).json(job);
  } catch (err) {
    console.error('[recruitment] duplicate error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recruitment/jobs/:id/close — ferme une offre avec raison
router.post('/jobs/:id/close', auth, adminOrEmployee, async (req, res) => {
  try {
    const reason = ['filled', 'cancelled', 'paused', 'expired'].includes(req.body.reason) ? req.body.reason : 'filled';
    const hiredCount = Math.max(0, parseInt(req.body.hiredCount) || 0);
    const job = await JobOffer.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Offre introuvable' });
    job.status = reason === 'paused' ? 'pause' : 'ferme';
    job.closedReason = reason;
    job.hiredCount = hiredCount;
    job.closedAt = new Date();
    job.updatedBy = req.user._id;
    await job.save();
    res.json(job);
  } catch (err) {
    console.error('[recruitment] close error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recruitment/jobs/:id/reopen — re-ouvre une offre fermee
router.post('/jobs/:id/reopen', auth, adminOnly, async (req, res) => {
  try {
    const job = await JobOffer.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Offre introuvable' });
    job.status = 'ouvert';
    job.closedReason = '';
    job.closedAt = null;
    job.publishedAt = new Date();
    job.updatedBy = req.user._id;
    await job.save();
    res.json(job);
  } catch (err) {
    console.error('[recruitment] reopen error:', err.message);
    res.status(500).json({ error: err.message });
  }
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

    // Security check: If base64 CV is provided, ensure it's a PDF
    let cvUrl = req.body.cvUrl || '';
    if (cvUrl.startsWith('data:')) {
      if (!cvUrl.startsWith('data:application/pdf;base64,')) {
        return res.status(400).json({ error: 'Seuls les fichiers PDF sont acceptés pour le CV.' });
      }
      // Content length check (base64 is ~33% larger than binary)
      if (cvUrl.length > 7 * 1024 * 1024) { // ~5MB max binary
        return res.status(400).json({ error: 'Le fichier est trop volumineux (5Mo max).' });
      }
    }

    const app = await Application.create({
      jobOffer: job._id,
      jobTitle: job.title,
      name,
      email,
      phone: sanitize(req.body.phone || '', 30),
      linkedin: sanitize(req.body.linkedin || '', 300),
      portfolio: sanitize(req.body.portfolio || '', 300),
      coverLetter: sanitize(req.body.coverLetter || '', 5000),
      cvUrl: sanitize(cvUrl, 8000000),
      cvFilename: sanitize(req.body.cvFilename || 'cv.pdf', 200),
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
