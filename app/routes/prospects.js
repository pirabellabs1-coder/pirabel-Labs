const express = require('express');
const router = express.Router();
const Prospect = require('../models/Prospect');
const Client = require('../models/Client');
const Subscriber = require('../models/Subscriber');
const Activity = require('../models/Activity');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { sendEmail, prospectionEmail, masterTemplate } = require('../config/email');

// GET /api/prospects
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.$or = [
      { contactName: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
    const prospects = await Prospect.find(query).sort({ createdAt: -1 });
    res.json({ prospects, total: prospects.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prospects
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const prospect = await Prospect.create(req.body);

    // Auto-add as subscriber
    await Subscriber.findOneAndUpdate(
      { email: prospect.email },
      { email: prospect.email, name: prospect.contactName, type: 'prospect', source: 'prospection' },
      { upsert: true }
    );

    res.status(201).json(prospect);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/prospects/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const prospect = await Prospect.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prospect) return res.status(404).json({ error: 'Prospect non trouve' });
    res.json(prospect);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/prospects/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Prospect.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prospects/:id/email — Send prospection email
router.post('/:id/email', auth, adminOrEmployee, async (req, res) => {
  try {
    const prospect = await Prospect.findById(req.params.id);
    if (!prospect) return res.status(404).json({ error: 'Prospect non trouve' });

    const { subject, content, headline } = req.body;

    const html = masterTemplate({
      headerType: 'hero',
      preheader: headline || subject || 'Une opportunite pour votre croissance',
      title: headline || subject,
      body: `
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${prospect.contactName},</p>
        <div style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">${content || prospect.problem || 'Nous avons identifie des opportunites pour votre entreprise.'}</div>
      `,
      cta: 'Demander un audit gratuit',
      ctaUrl: (process.env.SITE_URL || 'https://pirabellabs.com') + '/contact',
      stats: [
        { value: '+347%', label: 'Trafic moyen' },
        { value: '150+', label: 'Projets' },
        { value: '98%', label: 'Satisfaction' }
      ]
    });

    const success = await sendEmail(prospect.email, subject || 'Boostez votre croissance digitale', html);

    if (success) {
      prospect.emailsSent += 1;
      prospect.lastContactedAt = Date.now();
      if (prospect.status === 'nouveau') prospect.status = 'contacte';
      await prospect.save();

      await Activity.create({
        type: 'email_sent',
        description: `Email de prospection envoye a ${prospect.contactName} (${prospect.email})`,
        user: req.user._id,
        relatedModel: 'Prospect',
        relatedId: prospect._id
      });
    }

    res.json({ success, message: success ? 'Email envoye' : 'Echec envoi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prospects/:id/convert — Convert prospect to client
router.post('/:id/convert', auth, adminOrEmployee, async (req, res) => {
  try {
    const prospect = await Prospect.findById(req.params.id);
    if (!prospect) return res.status(404).json({ error: 'Prospect non trouve' });

    const client = await Client.create({
      company: prospect.company || prospect.contactName,
      contactName: prospect.contactName,
      email: prospect.email,
      phone: prospect.phone,
      website: prospect.website,
      sector: prospect.sector,
      status: 'actif',
      source: 'prospection',
      notes: prospect.notes
    });

    prospect.status = 'converti';
    prospect.convertedToClient = client._id;
    await prospect.save();

    res.json({ success: true, client, prospect });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
