const express = require('express');
const router = express.Router();
const TimeEntry = require('../models/TimeEntry');
const { auth, adminOrEmployee } = require('../middleware/auth');

// LIST entries
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { project, user, status } = req.query;
    const q = {};
    if (project) q.project = project;
    if (user) q.user = user;
    if (status) q.status = status;
    // Employees see only own
    if (req.user.role === 'employee') q.user = req.user._id;
    const entries = await TimeEntry.find(q).populate('user', 'name email').populate('project', 'name').sort({ startedAt: -1 }).limit(500);
    res.json({ entries });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// STATS
router.get('/stats', auth, adminOrEmployee, async (req, res) => {
  try {
    const q = req.user.role === 'employee' ? { user: req.user._id } : {};
    const entries = await TimeEntry.find({ ...q, status: 'stopped' });
    const totalMinutes = entries.reduce((s, e) => s + (e.durationMinutes || 0), 0);
    const billableMinutes = entries.filter(e => e.billable).reduce((s, e) => s + (e.durationMinutes || 0), 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayMinutes = entries.filter(e => e.startedAt >= today).reduce((s, e) => s + (e.durationMinutes || 0), 0);
    const running = await TimeEntry.countDocuments({ ...q, status: 'running' });
    res.json({
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      billableHours: Math.round(billableMinutes / 60 * 10) / 10,
      todayHours: Math.round(todayMinutes / 60 * 10) / 10,
      running
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// START timer
router.post('/start', auth, adminOrEmployee, async (req, res) => {
  try {
    // Auto-stop any running entries for this user
    await TimeEntry.updateMany({ user: req.user._id, status: 'running' }, {
      endedAt: new Date(),
      status: 'stopped',
      $set: { durationMinutes: 0 }
    });
    const entry = await TimeEntry.create({
      user: req.user._id,
      project: req.body.project,
      task: req.body.task,
      client: req.body.client,
      description: req.body.description,
      startedAt: new Date(),
      billable: req.body.billable !== false,
      hourlyRate: req.body.hourlyRate,
      status: 'running'
    });
    res.status(201).json(entry);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// STOP timer
router.post('/:id/stop', auth, adminOrEmployee, async (req, res) => {
  try {
    const entry = await TimeEntry.findById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Entree non trouvee' });
    entry.endedAt = new Date();
    entry.durationMinutes = Math.round((entry.endedAt - entry.startedAt) / 60000);
    entry.status = 'stopped';
    await entry.save();
    res.json(entry);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE manual entry
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const data = { ...req.body, user: req.user._id };
    if (data.startedAt && data.endedAt) {
      data.durationMinutes = Math.round((new Date(data.endedAt) - new Date(data.startedAt)) / 60000);
      data.status = 'stopped';
    }
    const entry = await TimeEntry.create(data);
    res.status(201).json(entry);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const entry = await TimeEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(entry);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await TimeEntry.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
