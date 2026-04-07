const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Subscriber = require('../models/Subscriber');
const Client = require('../models/Client');
const { auth, adminOnly } = require('../middleware/auth');
const { sendEmail, masterTemplate } = require('../config/email');
const { rateLimit, sanitize, sanitizeEmail, isValidEmail, honeypotCheck, limitBody } = require('../middleware/security');

// GET /api/campaigns - List campaigns
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 }).populate('createdBy', 'name');
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/campaigns - Create campaign
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const campaign = await Campaign.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/campaigns/:id
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!campaign) return res.status(404).json({ error: 'Campagne non trouvee' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/campaigns/:id/send - Send campaign
router.post('/:id/send', auth, adminOnly, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campagne non trouvee' });
    if (campaign.status === 'sent') return res.status(400).json({ error: 'Campagne deja envoyee' });

    // Get recipients based on audience
    let recipients = [];
    switch (campaign.audience) {
      case 'clients':
        const clients = await Client.find({ status: 'actif' });
        recipients = clients.map(c => ({ email: c.email, name: c.contactName }));
        break;
      case 'prospects':
        recipients = await Subscriber.find({ type: 'prospect', isActive: true });
        break;
      case 'guide_downloads':
        recipients = await Subscriber.find({ type: 'guide_download', isActive: true });
        break;
      default: // all
        const allSubs = await Subscriber.find({ isActive: true });
        const allClients = await Client.find({ status: { $in: ['actif', 'prospect'] } });
        const emailSet = new Set();
        recipients = [];
        allSubs.forEach(s => { if (!emailSet.has(s.email)) { emailSet.add(s.email); recipients.push({ email: s.email, name: s.name }); } });
        allClients.forEach(c => { if (!emailSet.has(c.email)) { emailSet.add(c.email); recipients.push({ email: c.email, name: c.contactName }); } });
    }

    // Send to each recipient
    let sentCount = 0;
    for (const r of recipients) {
      const personalizedContent = campaign.content.replace(/\{\{name\}\}/g, r.name || 'Cher client');
      const html = masterTemplate({
        title: campaign.subject,
        body: `<div style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">${personalizedContent}</div>`,
        cta: 'Visiter notre site',
        ctaUrl: process.env.SITE_URL || 'https://www.pirabellabs.com'
      });
      const success = await sendEmail(r.email, campaign.subject, html);
      if (success) sentCount++;
    }

    campaign.status = 'sent';
    campaign.sentCount = sentCount;
    campaign.sentAt = Date.now();
    await campaign.save();

    res.json({ success: true, sentCount, totalRecipients: recipients.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/campaigns/:id
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await Campaign.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUBSCRIBERS ---

// GET /api/campaigns/subscribers
router.get('/subscribers', auth, adminOnly, async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    if (type) query.type = type;
    const subscribers = await Subscriber.find(query).sort({ createdAt: -1 });
    res.json({ subscribers, total: subscribers.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rate limit: max 5 subscribe requests per 15 minutes per IP
const subscribeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de requetes. Reessayez plus tard.', keyPrefix: 'sub' });

// POST /api/campaigns/subscribers (public - for guide downloads, newsletter)
router.post('/subscribers', subscribeLimiter, honeypotCheck('website_url'), limitBody(6), async (req, res) => {
  try {
    const email = sanitizeEmail(req.body.email);
    const name = sanitize(req.body.name || '', 100);
    const type = ['newsletter', 'guide_download', 'prospect'].includes(req.body.type) ? req.body.type : 'newsletter';
    const source = sanitize(req.body.source || 'site', 50);

    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email invalide' });

    await Subscriber.findOneAndUpdate(
      { email },
      { email, name, type, source, isActive: true },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EMAIL TRACKING ---

// GET /api/campaigns/track/open/:campaignId — Tracking pixel (1x1 transparent GIF)
router.get('/track/open/:campaignId', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (campaign) {
      campaign.openCount = (campaign.openCount || 0) + 1;
      campaign.lastOpenedAt = Date.now();
      await campaign.save();
    }
  } catch (e) { /* silent */ }

  // Return 1x1 transparent GIF
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': pixel.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(pixel);
});

// GET /api/campaigns/track/click/:campaignId — Click redirect tracker
router.get('/track/click/:campaignId', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    if (campaign) {
      campaign.clickCount = (campaign.clickCount || 0) + 1;
      campaign.lastClickedAt = Date.now();
      await campaign.save();
    }
  } catch (e) { /* silent */ }

  const url = req.query.url || process.env.SITE_URL || 'https://www.pirabellabs.com';
  res.redirect(302, url);
});

module.exports = router;
