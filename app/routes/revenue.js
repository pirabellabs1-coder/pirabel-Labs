const express = require('express');
const router = express.Router();
const Revenue = require('../models/Revenue');
const { auth, adminOrEmployee } = require('../middleware/auth');

// GET /api/revenue
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await Revenue.find(query)
      .populate('client', 'company contactName')
      .populate('project', 'name')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Revenue.countDocuments(query);

    // Totals
    const totals = await Revenue.aggregate([
      { $match: query },
      { $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }}
    ]);

    const totalIncome = totals.find(t => t._id === 'income')?.total || 0;
    const totalExpenses = totals.find(t => t._id === 'expense')?.total || 0;

    res.json({
      entries, total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      summary: { income: totalIncome, expenses: totalExpenses, net: totalIncome - totalExpenses }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/revenue
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const entry = await Revenue.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/revenue/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const entry = await Revenue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!entry) return res.status(404).json({ error: 'Entree non trouvee' });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/revenue/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Revenue.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/revenue/export — Export CSV
router.get('/export', auth, adminOrEmployee, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const query = {};
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await Revenue.find(query)
      .populate('client', 'company')
      .populate('project', 'name')
      .sort({ date: -1 });

    let csv = 'Date,Type,Categorie,Description,Montant,Client,Projet\n';
    entries.forEach(e => {
      csv += `${new Date(e.date).toLocaleDateString('fr-FR')},${e.type},${e.category},"${e.description}",${e.amount},${e.client?.company || ''},${e.project?.name || ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=revenue_${Date.now()}.csv`);
    res.send('\uFEFF' + csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
