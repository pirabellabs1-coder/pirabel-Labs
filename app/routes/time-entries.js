const express = require('express');
const router = express.Router();
const TimeEntry = require('../models/TimeEntry');
const { auth, adminOrEmployee } = require('../middleware/auth');

// GET /api/time-entries?project=xxx
router.get('/', auth, async (req, res) => {
  try {
    const { project, user, from, to, page = 1, limit = 50 } = req.query;
    const query = {};
    if (project) query.project = project;
    if (user) query.user = user;
    if (from || to) {
      query.startTime = {};
      if (from) query.startTime.$gte = new Date(from);
      if (to) query.startTime.$lte = new Date(to);
    }

    const entries = await TimeEntry.find(query)
      .populate('project', 'name')
      .populate('employee', 'name')
      .populate('user', 'name')
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await TimeEntry.countDocuments(query);

    // Calculate totals
    const allEntries = await TimeEntry.find(query);
    const totalMinutes = allEntries.reduce((s, e) => s + (e.duration || 0), 0);
    const totalBillable = allEntries.filter(e => e.billable).reduce((s, e) => s + (e.duration || 0) * (e.hourlyRate || 0) / 60, 0);

    res.json({ entries, total, totalMinutes, totalHours: Math.round(totalMinutes / 60 * 10) / 10, totalBillable, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/time-entries — Create or start timer
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const entry = await TimeEntry.create({ ...req.body, user: req.user._id });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/time-entries/start — Start a running timer
router.post('/start', auth, adminOrEmployee, async (req, res) => {
  try {
    // Stop any running timer for this user first
    await TimeEntry.updateMany(
      { user: req.user._id, isRunning: true },
      { isRunning: false, endTime: new Date() }
    );

    const entry = await TimeEntry.create({
      project: req.body.project,
      description: req.body.description || '',
      startTime: new Date(),
      isRunning: true,
      billable: req.body.billable !== false,
      hourlyRate: req.body.hourlyRate || 0,
      user: req.user._id,
      employee: req.body.employee
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/time-entries/:id/stop — Stop a running timer
router.post('/:id/stop', auth, adminOrEmployee, async (req, res) => {
  try {
    const entry = await TimeEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entrée non trouvée' });
    entry.endTime = new Date();
    entry.isRunning = false;
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/time-entries/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const entry = await TimeEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entrée non trouvée' });
    Object.assign(entry, req.body);
    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/time-entries/summary — Project time summary
router.get('/summary', auth, async (req, res) => {
  try {
    const summary = await TimeEntry.aggregate([
      { $group: {
        _id: '$project',
        totalMinutes: { $sum: '$duration' },
        totalEntries: { $sum: 1 },
        billableMinutes: { $sum: { $cond: ['$billable', '$duration', 0] } }
      }},
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $sort: { totalMinutes: -1 } }
    ]);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/time-entries/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await TimeEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
