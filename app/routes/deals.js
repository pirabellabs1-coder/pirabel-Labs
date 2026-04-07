const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');
const { auth, adminOrEmployee } = require('../middleware/auth');

// GET /api/deals
router.get('/', auth, async (req, res) => {
  try {
    const { stage, assignedTo } = req.query;
    const query = {};
    if (stage) query.stage = stage;
    if (assignedTo) query.assignedTo = assignedTo;

    const deals = await Deal.find(query)
      .populate('client', 'company contactName')
      .populate('assignedTo', 'name')
      .populate('quote', 'quoteNumber total')
      .sort({ order: 1, updatedAt: -1 });

    // Group by stage for Kanban
    const stages = ['lead', 'contacte', 'devis', 'negociation', 'gagne', 'perdu'];
    const pipeline = {};
    stages.forEach(s => {
      pipeline[s] = deals.filter(d => d.stage === s);
    });

    // Summary stats
    const totalValue = deals.filter(d => !['perdu'].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0);
    const weightedValue = deals.filter(d => !['perdu'].includes(d.stage)).reduce((s, d) => s + ((d.value || 0) * (d.probability || 0) / 100), 0);
    const wonValue = deals.filter(d => d.stage === 'gagne').reduce((s, d) => s + (d.value || 0), 0);

    res.json({ deals, pipeline, stats: { totalValue, weightedValue, wonValue, count: deals.length } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/deals/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('client')
      .populate('assignedTo', 'name')
      .populate('quote');
    if (!deal) return res.status(404).json({ error: 'Deal non trouvé' });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/deals
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const deal = await Deal.create(req.body);

    await Activity.create({
      type: 'deal',
      description: `Nouveau deal: ${deal.title} (${(deal.value || 0).toLocaleString('fr-FR')} EUR)`,
      user: req.user._id,
      relatedModel: 'Deal',
      relatedId: deal._id
    });

    res.status(201).json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/deals/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal non trouvé' });

    const oldStage = deal.stage;
    Object.assign(deal, req.body);

    // If stage changed, log it
    if (req.body.stage && req.body.stage !== oldStage) {
      deal.activities.push({
        type: 'stage_change',
        message: `Stade changé de "${oldStage}" à "${req.body.stage}"`,
        date: Date.now()
      });
      if (req.body.stage === 'gagne') deal.closedAt = Date.now();
      if (req.body.stage === 'perdu') deal.closedAt = Date.now();
    }

    await deal.save();
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/deals/:id/stage — Quick stage update (drag & drop)
router.patch('/:id/stage', auth, adminOrEmployee, async (req, res) => {
  try {
    const { stage, order } = req.body;
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal non trouvé' });

    const oldStage = deal.stage;
    deal.stage = stage;
    if (typeof order === 'number') deal.order = order;

    deal.activities.push({
      type: 'stage_change',
      message: `Déplacé de "${oldStage}" vers "${stage}"`,
      date: Date.now()
    });

    if (stage === 'gagne') deal.closedAt = Date.now();
    if (stage === 'perdu') deal.closedAt = Date.now();

    await deal.save();
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/deals/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Deal.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
