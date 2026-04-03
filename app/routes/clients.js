const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Activity = require('../models/Activity');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { sendEmail, masterTemplate } = require('../config/email');

// GET /api/clients - List all clients
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { company: { $regex: search, $options: 'i' } },
      { contactName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Client.countDocuments(query);

    res.json({ clients, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/:id
router.get('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('user');
    if (!client) return res.status(404).json({ error: 'Client non trouve' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clients/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ error: 'Client non trouve' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Client.findByIdAndUpdate(req.params.id, { status: 'archive' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients/:id/email - Send email to client from admin
router.post('/:id/email', auth, adminOrEmployee, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client non trouve' });

    const { subject, content } = req.body;
    if (!subject || !content) return res.status(400).json({ error: 'Sujet et contenu requis' });

    const html = masterTemplate({
      title: subject,
      body: `
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${client.contactName || client.company},</p>
        <div style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">${content}</div>
      `,
      cta: 'Acceder a mon espace',
      ctaUrl: `${process.env.SITE_URL || 'https://pirabellabs.com'}/espace-client-4p8w1n`
    });

    await sendEmail(client.email, subject, html);

    await Activity.create({
      type: 'email_sent',
      description: `Email envoye a ${client.contactName} : ${subject}`,
      user: req.user._id,
      relatedModel: 'Client',
      relatedId: client._id
    });

    res.json({ success: true, message: `Email envoye a ${client.email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
