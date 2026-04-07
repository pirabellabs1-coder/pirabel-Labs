const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth, adminOrEmployee } = require('../middleware/auth');

// GET /api/notifications — list (50 most recent)
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const role = req.user.role;
    const query = { $or: [{ user: req.user._id }, { forRole: role }, { forRole: 'all' }] };
    const notifs = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ ...query, read: false });
    res.json({ notifications: notifs, unread });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/notifications/unread-count
router.get('/unread-count', auth, adminOrEmployee, async (req, res) => {
  try {
    const role = req.user.role;
    const unread = await Notification.countDocuments({
      $or: [{ user: req.user._id }, { forRole: role }, { forRole: 'all' }],
      read: false
    });
    res.json({ unread });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', auth, adminOrEmployee, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true, readAt: Date.now() });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/notifications/read-all
router.put('/read-all', auth, adminOrEmployee, async (req, res) => {
  try {
    const role = req.user.role;
    await Notification.updateMany(
      { $or: [{ user: req.user._id }, { forRole: role }, { forRole: 'all' }], read: false },
      { read: true, readAt: Date.now() }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/notifications/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
