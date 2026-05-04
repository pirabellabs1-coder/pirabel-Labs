const express = require('express');
const router = express.Router();
const CaseStudy = require('../models/CaseStudy');
const Activity = require('../models/Activity');
const { auth, adminOnly } = require('../middleware/auth');

// GET /api/case-studies - Public: list published case studies
router.get('/', async (req, res) => {
  try {
    const { category, language, featured, page = 1, limit = 24 } = req.query;
    const query = { status: 'published' };
    if (category && category !== 'all') query.category = category;
    if (language && language !== 'all') {
      query.language = { $in: [language, 'both'] };
    }
    if (featured === 'true') query.featured = true;

    const caseStudies = await CaseStudy.find(query)
      .sort({ order: -1, publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await CaseStudy.countDocuments(query);

    res.json({ caseStudies, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/case-studies/admin - Admin: list all (draft + published)
router.get('/admin', auth, adminOnly, async (req, res) => {
  try {
    const caseStudies = await CaseStudy.find().sort({ updatedAt: -1 });
    res.json({ caseStudies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/case-studies/:slug - Public: get single case study
router.get('/:slug', async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findOne({ slug: req.params.slug, status: 'published' });
    if (!caseStudy) return res.status(404).json({ error: 'Case study not found' });

    caseStudy.views += 1;
    await caseStudy.save();

    const related = await CaseStudy.find({
      _id: { $ne: caseStudy._id },
      status: 'published',
      category: caseStudy.category
    }).limit(3).select('title slug coverImage metric metricLabel category');

    res.json({ caseStudy, related });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/case-studies - Admin: create
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.status === 'published' && !data.publishedAt) {
      data.publishedAt = Date.now();
    }
    const caseStudy = await CaseStudy.create(data);

    if (caseStudy.status === 'published') {
      await Activity.create({
        type: 'case_study_published',
        description: `Case study published: ${caseStudy.title}`,
        user: req.user._id,
        relatedModel: 'CaseStudy',
        relatedId: caseStudy._id
      });
    }

    res.status(201).json(caseStudy);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A case study with this slug already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/case-studies/:id - Admin: update
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const caseStudy = await CaseStudy.findById(req.params.id);
    if (!caseStudy) return res.status(404).json({ error: 'Case study not found' });

    const wasNotPublished = caseStudy.status !== 'published';
    Object.assign(caseStudy, req.body);

    if (wasNotPublished && req.body.status === 'published') {
      caseStudy.publishedAt = Date.now();
      await caseStudy.save();

      await Activity.create({
        type: 'case_study_published',
        description: `Case study published: ${caseStudy.title}`,
        user: req.user._id,
        relatedModel: 'CaseStudy',
        relatedId: caseStudy._id
      });
    } else {
      await caseStudy.save();
    }

    res.json(caseStudy);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A case study with this slug already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/case-studies/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await CaseStudy.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/case-studies/:id/reorder - Admin: change order
router.post('/:id/reorder', auth, adminOnly, async (req, res) => {
  try {
    const { order } = req.body;
    const caseStudy = await CaseStudy.findByIdAndUpdate(
      req.params.id,
      { order: parseInt(order) || 0 },
      { new: true }
    );
    res.json(caseStudy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
