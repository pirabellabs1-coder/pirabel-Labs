const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { auth, adminOrEmployee } = require('../middleware/auth');

// PUBLIC: current status + recent incidents
router.get('/public', async (req, res) => {
  try {
    const active = await Incident.find({ status: { $ne: 'resolved' } }).sort({ startedAt: -1 });
    const recent = await Incident.find({ status: 'resolved' }).sort({ resolvedAt: -1 }).limit(10);
    let overallStatus = 'operational';
    if (active.some(i => i.severity === 'critical')) overallStatus = 'major_outage';
    else if (active.some(i => i.severity === 'major')) overallStatus = 'partial_outage';
    else if (active.length > 0) overallStatus = 'degraded';
    res.json({ overallStatus, active, recent });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ADMIN routes
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ startedAt: -1 }).limit(100);
    res.json({ incidents });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const incident = await Incident.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(incident);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/update', auth, adminOrEmployee, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) return res.status(404).json({ error: 'Incident non trouve' });
    incident.updates.push({ message: req.body.message, status: req.body.status });
    if (req.body.status) incident.status = req.body.status;
    if (req.body.status === 'resolved' && !incident.resolvedAt) incident.resolvedAt = new Date();
    await incident.save();
    res.json(incident);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(incident);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Incident.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
