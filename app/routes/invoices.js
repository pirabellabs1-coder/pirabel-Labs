const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Revenue = require('../models/Revenue');
const Settings = require('../models/Settings');
const Activity = require('../models/Activity');
const { auth, adminOrEmployee } = require('../middleware/auth');
const { sendEmail, masterTemplate } = require('../config/email');

router.get('/', auth, async (req, res) => {
  try {
    const { status, client, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (client) query.client = client;

    // Clients see only their invoices
    if (req.user.role === 'client') {
      const Client = require('../models/Client');
      const clientDoc = await Client.findOne({ user: req.user._id });
      if (clientDoc) query.client = clientDoc._id;
      else return res.json({ invoices: [], total: 0 });
    }

    const invoices = await Invoice.find(query)
      .populate('client', 'company contactName email')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Invoice.countDocuments(query);

    res.json({ invoices, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('client')
      .populate('project', 'name');
    if (!invoice) return res.status(404).json({ error: 'Facture non trouvee' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { items, taxRate = 20 } = req.body;
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    // Fix items totals
    const fixedItems = items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    }));

    const invoice = await Invoice.create({
      ...req.body,
      items: fixedItems,
      subtotal,
      taxRate,
      taxAmount,
      total
    });

    await Activity.create({
      type: 'invoice_paid',
      description: `Facture ${invoice.invoiceNumber} creee (${total.toLocaleString('fr-FR')} EUR)`,
      user: req.user._id,
      relatedModel: 'Invoice',
      relatedId: invoice._id
    });

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Facture non trouvee' });

    const oldStatus = invoice.status;
    Object.assign(invoice, req.body);

    // Recalculate totals if items changed
    if (req.body.items) {
      invoice.subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      invoice.taxAmount = invoice.subtotal * (invoice.taxRate / 100);
      invoice.total = invoice.subtotal + invoice.taxAmount;
    }

    // If marking as paid, record revenue
    if (req.body.status === 'payee' && oldStatus !== 'payee') {
      invoice.paidDate = Date.now();
      await Revenue.create({
        type: 'income',
        category: 'facture',
        description: `Facture ${invoice.invoiceNumber} payee`,
        amount: invoice.total,
        client: invoice.client,
        project: invoice.project,
        invoice: invoice._id
      });
    }

    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices/:id/send — Send invoice by email to client
router.post('/:id/send', auth, adminOrEmployee, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('client');
    if (!invoice) return res.status(404).json({ error: 'Facture non trouvee' });
    if (!invoice.client || !invoice.client.email) return res.status(400).json({ error: 'Client sans email' });

    const settings = await Settings.findOne({ key: 'main' }) || {};
    const SITE = process.env.SITE_URL || 'https://www.pirabellabs.com';

    const itemsHTML = invoice.items.map(item => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);color:rgba(229,226,225,0.7);font-size:14px;">${item.description}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);text-align:center;color:rgba(229,226,225,0.7);">${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);text-align:right;color:rgba(229,226,225,0.7);">${item.unitPrice.toLocaleString('fr-FR')} &euro;</td>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);text-align:right;font-weight:600;">${(item.quantity * item.unitPrice).toLocaleString('fr-FR')} &euro;</td>
      </tr>
    `).join('');

    const html = masterTemplate({
      preheader: `Facture ${invoice.invoiceNumber} - ${invoice.total.toLocaleString('fr-FR')} EUR`,
      title: 'Facture',
      subtitle: invoice.invoiceNumber,
      body: `
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${invoice.client.contactName || invoice.client.company},</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Veuillez trouver ci-dessous votre facture :</p>

        <div style="background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);padding:24px;margin:24px 0;">
          <table width="100%" style="font-size:11px;color:rgba(229,226,225,0.4);margin-bottom:20px;">
            <tr>
              <td><strong style="color:#e5e2e1;">${settings.agencyName || 'Pirabel Labs'}</strong><br>${settings.agencyAddress || ''}<br>${settings.agencyCity || ''} ${settings.agencyCountry || ''}<br>${settings.agencySiret ? 'SIRET: ' + settings.agencySiret : ''}</td>
              <td style="text-align:right;"><strong style="color:#FF5500;font-size:14px;">${invoice.invoiceNumber}</strong><br>Date: ${new Date(invoice.issueDate).toLocaleDateString('fr-FR')}<br>${invoice.dueDate ? 'Échéance: ' + new Date(invoice.dueDate).toLocaleDateString('fr-FR') : ''}</td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0">
            <thead>
              <tr style="background:rgba(255,85,0,0.05);">
                <th style="padding:10px;text-align:left;font-size:11px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:1px;">Description</th>
                <th style="padding:10px;text-align:center;font-size:11px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:1px;">Qte</th>
                <th style="padding:10px;text-align:right;font-size:11px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:1px;">P.U.</th>
                <th style="padding:10px;text-align:right;font-size:11px;color:rgba(229,226,225,0.4);text-transform:uppercase;letter-spacing:1px;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
          </table>

          <table width="100%" style="margin-top:20px;">
            <tr><td style="text-align:right;padding:4px 10px;color:rgba(229,226,225,0.5);font-size:13px;">Sous-total HT</td><td style="text-align:right;padding:4px 10px;width:120px;font-weight:600;">${invoice.subtotal.toLocaleString('fr-FR')} &euro;</td></tr>
            <tr><td style="text-align:right;padding:4px 10px;color:rgba(229,226,225,0.5);font-size:13px;">TVA (${invoice.taxRate}%)</td><td style="text-align:right;padding:4px 10px;width:120px;">${invoice.taxAmount.toLocaleString('fr-FR')} &euro;</td></tr>
            <tr><td style="text-align:right;padding:8px 10px;font-size:18px;font-weight:700;color:#FF5500;">TOTAL TTC</td><td style="text-align:right;padding:8px 10px;width:120px;font-size:18px;font-weight:700;color:#FF5500;">${invoice.total.toLocaleString('fr-FR')} &euro;</td></tr>
          </table>
        </div>
        ${invoice.notes ? `<p style="font-size:13px;color:rgba(229,226,225,0.4);font-style:italic;">${invoice.notes}</p>` : ''}
      `,
      cta: 'Voir dans mon espace',
      ctaUrl: `${SITE}/espace-client-4p8w1n`
    });

    const success = await sendEmail(invoice.client.email, `Facture ${invoice.invoiceNumber} — ${invoice.total.toLocaleString('fr-FR')} EUR`, html);

    if (success) {
      if (invoice.status === 'brouillon') {
        invoice.status = 'envoyee';
        await invoice.save();
      }
      await Activity.create({
        type: 'email_sent',
        description: `Facture ${invoice.invoiceNumber} envoyee a ${invoice.client.email}`,
        user: req.user._id,
        relatedModel: 'Invoice',
        relatedId: invoice._id
      });
    }

    res.json({ success, message: success ? 'Facture envoyee par email' : 'Echec envoi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/invoices/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
