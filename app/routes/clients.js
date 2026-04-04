const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Client = require('../models/Client');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { sendEmail, masterTemplate, sendWelcome } = require('../config/email');

// GET /api/clients
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
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
    const client = await Client.findById(req.params.id).populate('user', 'name email lastLogin');
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

    await Activity.create({
      type: 'client_created',
      description: `Client ajoute : ${client.company || client.contactName}`,
      user: req.user._id,
      relatedModel: 'Client',
      relatedId: client._id
    });

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

// POST /api/clients/:id/credentials — Create login for client
router.post('/:id/credentials', auth, adminOrEmployee, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client non trouve' });

    // Check if user already exists
    let user = await User.findOne({ email: client.email });
    if (user) {
      client.user = user._id;
      await client.save();
      return res.json({ success: true, message: 'Compte deja existant, lie au client', alreadyExists: true });
    }

    // Generate password
    const tempPassword = crypto.randomBytes(6).toString('hex');

    user = await User.create({
      name: client.contactName || client.company,
      email: client.email,
      password: tempPassword,
      role: 'client',
      isActive: true
    });

    client.user = user._id;
    await client.save();

    const SITE = process.env.SITE_URL || 'https://pirabellabs.com';

    // Send credentials email
    const html = masterTemplate({
      headerType: 'hero',
      preheader: 'Vos identifiants Pirabel Labs',
      title: 'Votre Espace Client',
      subtitle: 'Pirabel Labs',
      body: `
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${client.contactName || client.company},</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Votre espace client est pret. Voici vos identifiants :</p>
        <div style="background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);padding:20px;margin:20px 0;">
          <table width="100%">
            <tr><td style="padding:8px 0;color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Email</td><td style="padding:8px 0;text-align:right;font-weight:600;">${client.email}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;letter-spacing:1px;">Mot de passe</td><td style="padding:8px 0;text-align:right;font-weight:600;color:#FF5500;">${tempPassword}</td></tr>
          </table>
        </div>
        <p style="font-size:14px;color:rgba(255,180,171,0.8);"><strong>Important :</strong> Changez votre mot de passe apres votre première connexion.</p>
      `,
      cta: 'Acceder a mon espace',
      ctaUrl: `${SITE}/espace-client-4p8w1n`
    });

    await sendEmail(client.email, 'Vos identifiants Pirabel Labs — Espace Client', html);

    await Activity.create({
      type: 'email_sent',
      description: `Identifiants client envoyes a ${client.contactName} (${client.email})`,
      user: req.user._id,
      relatedModel: 'Client',
      relatedId: client._id
    });

    res.json({ success: true, message: `Identifiants envoyes a ${client.email}`, password: tempPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients/:id/email — Send email to client
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

    const success = await sendEmail(client.email, subject, html);

    await Activity.create({
      type: 'email_sent',
      description: `Email envoye a ${client.contactName} : ${subject}`,
      user: req.user._id,
      relatedModel: 'Client',
      relatedId: client._id
    });

    res.json({ success, message: success ? `Email envoye a ${client.email}` : 'Echec envoi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients/bulk-email — Send email to multiple clients
router.post('/bulk-email', auth, adminOrEmployee, async (req, res) => {
  try {
    const { clientIds, subject, content } = req.body;
    if (!clientIds?.length || !subject || !content) return res.status(400).json({ error: 'Clients, sujet et contenu requis' });

    const clients = await Client.find({ _id: { $in: clientIds } });
    let sentCount = 0;

    for (const client of clients) {
      const personalizedContent = content.replace(/\{\{name\}\}/g, client.contactName || client.company);
      const html = masterTemplate({
        title: subject,
        body: `
          <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${client.contactName || client.company},</p>
          <div style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">${personalizedContent}</div>
        `,
        cta: 'Visiter notre site',
        ctaUrl: process.env.SITE_URL || 'https://pirabellabs.com'
      });
      const ok = await sendEmail(client.email, subject, html);
      if (ok) sentCount++;
    }

    res.json({ success: true, sentCount, totalRecipients: clients.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
