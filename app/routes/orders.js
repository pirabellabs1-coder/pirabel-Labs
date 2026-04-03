const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Subscriber = require('../models/Subscriber');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { notifyNewOrder } = require('../config/email');

// POST /api/orders - Public endpoint (from website contact form)
router.post('/', async (req, res) => {
  try {
    const order = await Order.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone || '',
      website: req.body.website || '',
      service: req.body.service,
      budget: req.body.budget || '',
      message: req.body.message || '',
      source: 'site'
    });

    // Send email notification to admin
    notifyNewOrder(order).catch(err => console.error('Email notification error:', err));

    // Auto-add to subscribers as prospect
    Subscriber.findOneAndUpdate(
      { email: req.body.email },
      { email: req.body.email, name: req.body.name, type: 'prospect', source: 'contact_form' },
      { upsert: true }
    ).catch(() => {});

    // Notify via socket.io
    if (req.app.get('io')) {
      req.app.get('io').emit('new-order', { id: order._id, name: order.name, service: order.service });
    }

    res.status(201).json({ success: true, message: 'Demande recue. Nous vous recontactons sous 24h.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders - List orders (admin/employee)
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(query);

    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ error: 'Commande non trouvee' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/convert - Convert order to client + project
router.post('/:id/convert', auth, adminOrEmployee, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Commande non trouvee' });

    // Create client
    const client = await Client.create({
      company: req.body.company || order.name,
      contactName: order.name,
      email: order.email,
      phone: order.phone,
      website: order.website,
      status: 'actif',
      source: 'site'
    });

    // Create project
    const project = await Project.create({
      name: req.body.projectName || `Projet ${order.service} - ${order.name}`,
      client: client._id,
      service: req.body.service || 'autre',
      description: order.message,
      budget: req.body.budget || 0,
      status: 'en_attente'
    });

    order.status = 'acceptee';
    order.convertedToClient = client._id;
    order.convertedToProject = project._id;
    await order.save();

    res.json({ success: true, client, project, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
