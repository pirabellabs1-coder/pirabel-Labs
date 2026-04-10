const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const Client = require('../models/Client');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { sendEmail, masterTemplate } = require('../config/email');

const SITE = () => process.env.SITE_URL || 'https://www.pirabellabs.com';

// Generate quote number: Q-YYYY-NNNN
async function nextNumber() {
  const year = new Date().getFullYear();
  const last = await Quote.findOne({ number: new RegExp(`^Q-${year}-`) }).sort({ createdAt: -1 });
  let n = 1;
  if (last && last.number) {
    const m = last.number.match(/Q-\d{4}-(\d+)/);
    if (m) n = parseInt(m[1]) + 1;
  }
  return `Q-${year}-${String(n).padStart(4, '0')}`;
}

// LIST
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { status, client } = req.query;
    const q = {};
    if (status) q.status = status;
    if (client) q.client = client;
    const quotes = await Quote.find(q).populate('client', 'company contactName email').sort({ createdAt: -1 }).limit(200);
    res.json({ quotes });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// STATS
router.get('/stats', auth, adminOrEmployee, async (req, res) => {
  try {
    const total = await Quote.countDocuments();
    const draft = await Quote.countDocuments({ status: 'brouillon' });
    const sent = await Quote.countDocuments({ status: 'envoye' });
    const accepted = await Quote.countDocuments({ status: 'accepte' });
    const refused = await Quote.countDocuments({ status: 'refuse' });
    const sumAccepted = await Quote.aggregate([
      { $match: { status: 'accepte' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    res.json({
      total, draft, sent, accepted, refused,
      acceptedValue: sumAccepted[0]?.total || 0,
      conversionRate: sent > 0 ? Math.round((accepted / sent) * 100) : 0
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET ONE
router.get('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const q = await Quote.findById(req.params.id).populate('client');
    if (!q) return res.status(404).json({ error: 'Devis non trouve' });
    res.json(q);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const number = await nextNumber();
    const data = { ...req.body, number, createdBy: req.user._id };
    if (data.client) {
      const c = await Client.findById(data.client);
      if (c) {
        data.clientName = c.contactName || c.company;
        data.clientEmail = c.email;
        data.clientCompany = c.company;
      }
    }
    const q = await Quote.create(data);
    res.status(201).json(q);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const q = await Quote.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Devis non trouve' });
    Object.assign(q, req.body);
    if (req.body.status === 'accepte' && !q.acceptedAt) q.acceptedAt = new Date();
    if (req.body.status === 'envoye' && !q.sentAt) q.sentAt = new Date();
    await q.save();
    res.json(q);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SEND BY EMAIL (with paymentLink if provided)
router.post('/:id/send', auth, adminOrEmployee, async (req, res) => {
  try {
    const q = await Quote.findById(req.params.id).populate('client');
    if (!q) return res.status(404).json({ error: 'Devis non trouve' });
    const to = q.clientEmail || q.client?.email;
    if (!to) return res.status(400).json({ error: 'Email client manquant' });

    const itemsHTML = (q.items || []).map(it => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);color:#e5e2e1;">${it.description}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);text-align:center;color:#e5e2e1;">${it.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);text-align:right;color:#e5e2e1;">${(it.unitPrice || 0).toLocaleString('fr-FR')} ${q.currency}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);text-align:right;color:#FF5500;font-weight:700;">${(it.total || 0).toLocaleString('fr-FR')} ${q.currency}</td>
      </tr>`).join('');

    const html = masterTemplate({
      preheader: `Votre devis ${q.number}`,
      title: 'Votre Devis',
      subtitle: q.number,
      body: `
        <p style="font-size:16px;color:rgba(229,226,225,0.7);">Bonjour ${q.clientName || ''},</p>
        <p style="font-size:16px;color:rgba(229,226,225,0.7);">Veuillez trouver ci-dessous votre devis pour <strong>${q.title}</strong> :</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid rgba(92,64,55,0.15);background:#0e0e0e;">
          <thead><tr>
            <th style="padding:10px;text-align:left;color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;border-bottom:2px solid rgba(255,85,0,0.4);">Description</th>
            <th style="padding:10px;text-align:center;color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;border-bottom:2px solid rgba(255,85,0,0.4);">Qte</th>
            <th style="padding:10px;text-align:right;color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;border-bottom:2px solid rgba(255,85,0,0.4);">PU</th>
            <th style="padding:10px;text-align:right;color:rgba(229,226,225,0.4);font-size:12px;text-transform:uppercase;border-bottom:2px solid rgba(255,85,0,0.4);">Total</th>
          </tr></thead>
          <tbody>${itemsHTML}</tbody>
          <tfoot>
            <tr><td colspan="3" style="padding:10px;text-align:right;color:rgba(229,226,225,0.6);">Sous-total HT</td><td style="padding:10px;text-align:right;color:#e5e2e1;">${q.subtotal.toLocaleString('fr-FR')} ${q.currency}</td></tr>
            <tr><td colspan="3" style="padding:10px;text-align:right;color:rgba(229,226,225,0.6);">TVA ${q.taxRate}%</td><td style="padding:10px;text-align:right;color:#e5e2e1;">${q.tax.toLocaleString('fr-FR')} ${q.currency}</td></tr>
            <tr><td colspan="3" style="padding:14px 10px;text-align:right;color:#FF5500;font-weight:700;font-size:18px;border-top:2px solid rgba(255,85,0,0.4);">TOTAL TTC</td><td style="padding:14px 10px;text-align:right;color:#FF5500;font-weight:900;font-size:18px;border-top:2px solid rgba(255,85,0,0.4);">${q.total.toLocaleString('fr-FR')} ${q.currency}</td></tr>
          </tfoot>
        </table>
        ${q.notes ? `<p style="font-size:14px;color:rgba(229,226,225,0.6);"><strong>Notes :</strong><br>${q.notes}</p>` : ''}
        ${q.validUntil ? `<p style="font-size:13px;color:rgba(229,226,225,0.4);">Devis valable jusqu'au ${new Date(q.validUntil).toLocaleDateString('fr-FR')}</p>` : ''}
      `,
      cta: q.paymentLink ? 'Payer maintenant' : 'Voir mon espace',
      ctaUrl: q.paymentLink || `${SITE()}/espace-client-4p8w1n`
    });

    const ok = await sendEmail(to, `Devis ${q.number} - ${q.title}`, html);
    if (ok) {
      q.status = 'envoye';
      q.sentAt = new Date();
      await q.save();
    }
    res.json({ success: ok });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
