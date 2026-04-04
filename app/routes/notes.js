const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { auth, adminOrEmployee } = require('../middleware/auth');

// GET /api/notes
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const { relatedModel, relatedId, priority } = req.query;
    const query = {};
    if (relatedModel) query.relatedModel = relatedModel;
    if (relatedId) query.relatedId = relatedId;
    if (priority) query.priority = priority;

    const notes = await Note.find(query)
      .populate('author', 'name role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notes
router.post('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, author: req.user._id });
    const populated = await Note.findById(note._id).populate('author', 'name role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notes/:id
router.put('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('author', 'name role');
    if (!note) return res.status(404).json({ error: 'Note non trouvee' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', auth, adminOrEmployee, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
