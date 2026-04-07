const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { sanitize, limitBody } = require('../middleware/security');

// GET /api/tasks
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { status, assignedTo, project, priority } = req.query;
    const query = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (project) query.project = project;
    if (priority) query.priority = priority;
    if (req.user.role === 'employee') query.assignedTo = req.user._id;
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('client', 'company')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/tasks/stats
router.get('/stats', auth, adminOrEmployee, async (req, res) => {
  try {
    const filter = req.user.role === 'employee' ? { assignedTo: req.user._id } : {};
    const [todo, inProgress, review, done, overdue] = await Promise.all([
      Task.countDocuments({ ...filter, status: 'todo' }),
      Task.countDocuments({ ...filter, status: 'in_progress' }),
      Task.countDocuments({ ...filter, status: 'review' }),
      Task.countDocuments({ ...filter, status: 'done' }),
      Task.countDocuments({ ...filter, status: { $ne: 'done' }, dueDate: { $lt: new Date() } })
    ]);
    res.json({ todo, inProgress, review, done, overdue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/tasks
router.post('/', auth, adminOrEmployee, limitBody(20), async (req, res) => {
  try {
    const title = sanitize(req.body.title, 200);
    if (!title) return res.status(400).json({ error: 'Titre requis' });
    const task = await Task.create({
      title,
      description: sanitize(req.body.description || '', 5000),
      status: ['todo', 'in_progress', 'review', 'done'].includes(req.body.status) ? req.body.status : 'todo',
      priority: ['low', 'medium', 'high', 'urgent'].includes(req.body.priority) ? req.body.priority : 'medium',
      assignedTo: req.body.assignedTo || null,
      project: req.body.project || null,
      client: req.body.client || null,
      dueDate: req.body.dueDate || null,
      tags: Array.isArray(req.body.tags) ? req.body.tags.slice(0, 10) : [],
      checklist: Array.isArray(req.body.checklist) ? req.body.checklist.slice(0, 30) : [],
      createdBy: req.user._id
    });

    if (req.body.assignedTo && String(req.body.assignedTo) !== String(req.user._id)) {
      Notification.create({
        user: req.body.assignedTo,
        type: 'task',
        title: 'Nouvelle tache assignee',
        message: title,
        link: `/tasks?id=${task._id}`,
        icon: 'task_alt'
      }).catch(() => {});
    }

    res.status(201).json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/tasks/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Tache introuvable' });
    res.json(task);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
