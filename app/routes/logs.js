const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const { auth, adminOnly } = require('../middleware/auth');

// Helper to create a log entry
async function createLog(data) {
  try {
    await Log.create(data);
  } catch (e) {
    console.error('Log creation error:', e.message);
  }
}

// GET /api/logs — list logs with filters
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { category, level, user, action, from, to, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (user) filter.user = user;
    if (action) filter.action = new RegExp(action, 'i');
    if (search) filter.description = new RegExp(search, 'i');
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      Log.find(filter).populate('user', 'name').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Log.countDocuments(filter)
    ]);

    res.json({ logs, total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/logs/stats — log statistics
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [total, byCategory, byLevel, recentErrors] = await Promise.all([
      Log.countDocuments(),
      Log.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Log.aggregate([{ $group: { _id: '$level', count: { $sum: 1 } } }]),
      Log.find({ level: { $in: ['error', 'critical'] } }).sort({ createdAt: -1 }).limit(10)
    ]);
    res.json({ total, byCategory, byLevel, recentErrors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/logs/clear — clear old logs (keep last 30 days)
router.delete('/clear', auth, adminOnly, async (req, res) => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const result = await Log.deleteMany({ createdAt: { $lt: cutoff } });
    res.json({ message: `${result.deletedCount} logs supprimes` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.createLog = createLog;
