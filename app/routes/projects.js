const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Client = require('../models/Client');
const Activity = require('../models/Activity');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { notifyProjectUpdate, sendEmail, masterTemplate } = require('../config/email');

// GET /api/projects
router.get('/', auth, async (req, res) => {
  try {
    const { status, client, assignedTo, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (client) query.client = client;
    if (assignedTo) query.assignedTo = assignedTo;

    // Clients can only see their own projects
    if (req.user.role === 'client') {
      const Client = require('../models/Client');
      const clientDoc = await Client.findOne({ user: req.user._id });
      if (clientDoc) query.client = clientDoc._id;
      else return res.json({ projects: [], total: 0 });
    }

    const projects = await Project.find(query)
      .populate('client', 'company contactName')
      .populate('assignedTo', 'name')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Project.countDocuments(query);

    res.json({ projects, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client')
      .populate('assignedTo', 'name email')
      .populate('updates.author', 'name');
    if (!project) return res.status(404).json({ error: 'Projet non trouve' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Projet non trouve' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/update - Add project update + notify client
router.post('/:id/update', auth, adminOrEmployee, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('client');
    if (!project) return res.status(404).json({ error: 'Projet non trouve' });
    project.updates.push({ message: req.body.message, author: req.user._id });
    if (req.body.progress) project.progress = req.body.progress;
    if (req.body.status) project.status = req.body.status;
    await project.save();

    // Notify client by email
    if (project.client && project.client.email) {
      notifyProjectUpdate(
        project.client.email,
        project.client.contactName || project.client.company,
        project.name,
        req.body.message,
        project.progress
      ).catch(() => {});
    }

    // Log activity
    await Activity.create({
      type: 'project_updated',
      description: `Projet "${project.name}" mis a jour : ${req.body.message.substring(0, 100)}`,
      user: req.user._id,
      relatedModel: 'Project',
      relatedId: project._id
    });

    // Notify via socket
    if (req.app.get('io')) {
      req.app.get('io').emit('project-update', { projectId: project._id, name: project.name, progress: project.progress });
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
