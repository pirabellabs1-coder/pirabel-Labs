const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const Activity = require('../models/Activity');
const { auth, adminOrEmployee } = require('../middleware/auth');

// GET /api/quotes
router.get('/', auth, async (req, res) => {
  try {
    const { status, client, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (client) query.client = client;

    const quotes = await Quote.find(query)
      .populate('client', 'company contactName email')
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Quote.countDocuments(query);

    res.json({ quotes, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quotes/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('client')
      .populate('project', 'name');
    if (!quote) return res.status(404).json({ error: 'Devis non trouvé' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quotes
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { items, taxRate = 20, discount = 0 } = req.body;
    const rawSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const subtotal = rawSubtotal - discount;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const fixedItems = items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    }));

    const quote = await Quote.create({
      ...req.body,
      items: fixedItems,
      subtotal: rawSubtotal,
      discount,
      taxRate,
      taxAmount,
      total,
      createdBy: req.user._id
    });

    await Activity.create({
      type: 'quote',
      description: `Devis ${quote.quoteNumber} créé (${total.toLocaleString('fr-FR')} EUR)`,
      user: req.user._id,
      relatedModel: 'Quote',
      relatedId: quote._id
    });

    res.status(201).json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/quotes/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Devis non trouvé' });

    Object.assign(quote, req.body);

    if (req.body.items) {
      quote.subtotal = quote.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      quote.taxAmount = (quote.subtotal - (quote.discount || 0)) * (quote.taxRate / 100);
      quote.total = quote.subtotal - (quote.discount || 0) + quote.taxAmount;
    }

    if (req.body.status === 'envoye' && !quote.sentAt) {
      quote.sentAt = Date.now();
    }
    if (['accepte', 'refuse'].includes(req.body.status) && !quote.respondedAt) {
      quote.respondedAt = Date.now();
    }

    await quote.save();
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/quotes/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quotes/:id/send - Send quote by email to client
router.post('/:id/send', auth, adminOrEmployee, async (req, res) => {
  try {
    const { sendEmail, masterTemplate } = require('../config/email');
    const Settings = require('../models/Settings');
    const quote = await Quote.findById(req.params.id).populate('client');
    if (!quote) return res.status(404).json({ error: 'Devis non trouvé' });

    const email = quote.clientEmail || (quote.client && quote.client.email);
    if (!email) return res.status(400).json({ error: 'Pas d\'email client' });

    const settings = await Settings.findOne({ key: 'main' }) || {};
    const SITE = process.env.SITE_URL || 'https://www.pirabellabs.com';

    const itemsHTML = quote.items.map(item => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);color:rgba(229,226,225,0.7);">${item.description}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);text-align:center;color:rgba(229,226,225,0.7);">${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);text-align:right;color:rgba(229,226,225,0.7);">${item.unitPrice.toLocaleString('fr-FR')} &euro;</td>
        <td style="padding:10px;border-bottom:1px solid rgba(92,64,55,0.15);text-align:right;font-weight:600;">${(item.quantity * item.unitPrice).toLocaleString('fr-FR')} &euro;</td>
      </tr>
    `).join('');

    const paymentBlock = quote.paymentLink ? `
      <div style="margin:24px 0;text-align:center;">
        <a href="${quote.paymentLink}" style="background:#FF5500;color:#fff;padding:12px 32px;text-decoration:none;font-weight:700;text-transform:uppercase;letter-spacing:1px;font-size:14px;">Procéder au paiement</a>
      </div>
    ` : '';

    const html = masterTemplate({
      preheader: `Devis ${quote.quoteNumber} - ${quote.total.toLocaleString('fr-FR')} EUR`,
      title: 'Proposition commerciale',
      subtitle: quote.quoteNumber,
      body: `
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Bonjour ${quote.clientName || (quote.client && quote.client.contactName) || ''},</p>
        <p style="font-size:16px;line-height:1.7;color:rgba(229,226,225,0.7);">Veuillez trouver ci-dessous notre proposition :</p>
        <h3 style="color:#e5e2e1;margin:16px 0 8px;">${quote.title}</h3>
        <div style="background:#0e0e0e;border:1px solid rgba(92,64,55,0.15);padding:24px;margin:24px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <thead>
              <tr style="background:rgba(255,85,0,0.05);">
                <th style="padding:10px;text-align:left;font-size:11px;color:rgba(229,226,225,0.4);text-transform:uppercase;">Description</th>
                <th style="padding:10px;text-align:center;font-size:11px;color:rgba(229,226,225,0.4);text-transform:uppercase;">Qte</th>
                <th style="padding:10px;text-align:right;font-size:11px;color:rgba(229,226,225,0.4);text-transform:uppercase;">P.U.</th>
                <th style="padding:10px;text-align:right;font-size:11px;color:rgba(229,226,225,0.4);text-transform:uppercase;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsHTML}</tbody>
          </table>
          <table width="100%" style="margin-top:20px;">
            <tr><td style="text-align:right;padding:4px 10px;color:rgba(229,226,225,0.5);font-size:13px;">Sous-total HT</td><td style="text-align:right;padding:4px 10px;width:120px;font-weight:600;">${quote.subtotal.toLocaleString('fr-FR')} &euro;</td></tr>
            ${quote.discount ? `<tr><td style="text-align:right;padding:4px 10px;color:#2ecc71;font-size:13px;">Remise</td><td style="text-align:right;padding:4px 10px;width:120px;color:#2ecc71;">-${quote.discount.toLocaleString('fr-FR')} &euro;</td></tr>` : ''}
            <tr><td style="text-align:right;padding:4px 10px;color:rgba(229,226,225,0.5);font-size:13px;">TVA (${quote.taxRate}%)</td><td style="text-align:right;padding:4px 10px;width:120px;">${quote.taxAmount.toLocaleString('fr-FR')} &euro;</td></tr>
            <tr><td style="text-align:right;padding:8px 10px;font-size:18px;font-weight:700;color:#FF5500;">TOTAL TTC</td><td style="text-align:right;padding:8px 10px;width:120px;font-size:18px;font-weight:700;color:#FF5500;">${quote.total.toLocaleString('fr-FR')} &euro;</td></tr>
          </table>
        </div>
        ${quote.conditions ? `<p style="font-size:12px;color:rgba(229,226,225,0.4);font-style:italic;">${quote.conditions}</p>` : ''}
        ${quote.validUntil ? `<p style="font-size:13px;color:rgba(229,226,225,0.5);">Valable jusqu'au ${new Date(quote.validUntil).toLocaleDateString('fr-FR')}</p>` : ''}
        ${paymentBlock}
      `,
      cta: 'Voir dans mon espace',
      ctaUrl: `${SITE}/espace-client-4p8w1n`
    });

    const success = await sendEmail(email, `Devis ${quote.quoteNumber} — ${quote.total.toLocaleString('fr-FR')} EUR`, html);

    if (success) {
      quote.status = 'envoye';
      quote.sentAt = Date.now();
      await quote.save();
    }

    res.json({ success, message: success ? 'Devis envoyé' : 'Echec envoi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quotes/generate-ai — AI-powered proposal generation
router.post('/generate-ai', auth, adminOrEmployee, async (req, res) => {
  try {
    const { brief, clientName, service, budget } = req.body;
    if (!brief) return res.status(400).json({ error: 'Brief requis' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.json({
        success: false,
        error: 'ANTHROPIC_API_KEY non configurée. Ajoutez-la dans vos variables d\'environnement Vercel.'
      });
    }

    const prompt = `Tu es un expert en marketing digital chez Pirabel Labs, agence premium.
Génère une proposition commerciale structurée en JSON basée sur ce brief client:

Client: ${clientName || 'Non spécifié'}
Service: ${service || 'Non spécifié'}
Budget indicatif: ${budget || 'Non spécifié'}
Brief: ${brief}

Réponds UNIQUEMENT en JSON valide avec cette structure:
{
  "title": "Titre du devis",
  "items": [
    {"description": "Ligne de service", "quantity": 1, "unitPrice": 0}
  ],
  "notes": "Notes pour le client",
  "conditions": "Conditions",
  "validDays": 30
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const aiData = await response.json();
    const text = aiData.content?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.json({ success: false, error: 'Réponse IA invalide' });

    const proposal = JSON.parse(jsonMatch[0]);
    res.json({ success: true, proposal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
