const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Revenue = require('../models/Revenue');
const { auth, adminOrEmployee } = require('../middleware/auth');

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
      .populate('client', 'company contactName')
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
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const invoice = await Invoice.create({
      ...req.body,
      subtotal,
      taxRate,
      taxAmount,
      total
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

    Object.assign(invoice, req.body);

    // If marking as paid, record revenue
    if (req.body.status === 'payee' && invoice.status !== 'payee') {
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

module.exports = router;
