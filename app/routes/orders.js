const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Subscriber = require('../models/Subscriber');
const { auth, adminOrEmployee } = require('../middleware/auth');
const Activity = require('../models/Activity');
const { notifyNewOrder, sendWelcome } = require('../config/email');
const { rateLimit, sanitize, sanitizeEmail, isValidEmail, honeypotCheck, limitBody } = require('../middleware/security');

// Rate limit: max 5 orders per 15 minutes per IP
const orderLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de demandes. Reessayez dans 15 minutes.', keyPrefix: 'order' });

// POST /api/orders - Public endpoint (from website contact form)
router.post('/', orderLimiter, honeypotCheck('website_url'), limitBody(10), async (req, res) => {
  try {
    // Validate required fields
    const name = sanitize(req.body.name, 100);
    const email = sanitizeEmail(req.body.email);
    const phone = sanitize(req.body.phone || '', 30);
    const website = sanitize(req.body.website || '', 200);
    const service = sanitize(req.body.service, 100);
    const budget = sanitize(req.body.budget || '', 50);
    const message = sanitize(req.body.message || '', 2000);

    if (!name || name.length < 2) return res.status(400).json({ error: 'Nom requis (min 2 caracteres)' });
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide' });
    if (!service) return res.status(400).json({ error: 'Service requis' });

    const order = await Order.create({
      name,
      email,
      phone,
      website,
      service,
      budget,
      message,
      source: req.body.source === 'cta_form' ? 'cta_form' : 'site'
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

    // Auto-convert to client when status changes to "acceptee"
    if (req.body.status === 'acceptee') {
      let client = await Client.findOne({ email: order.email });
      if (!client) {
        client = await Client.create({
          company: order.name,
          contactName: order.name,
          email: order.email,
          phone: order.phone,
          website: order.website,
          status: 'actif',
          source: 'site'
        });
      }

      order.convertedToClient = client._id;
      await order.save();

      // Log activity
      await Activity.create({
        type: 'client_created',
        description: `Client auto-cree depuis commande acceptee: ${order.name}`,
        user: req.user._id,
        relatedModel: 'Client',
        relatedId: client._id
      });

      // Send welcome email
      sendWelcome(client.email, client.contactName).catch(err => console.error('Welcome email error:', err));

      return res.json({ order, client });
    }

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
