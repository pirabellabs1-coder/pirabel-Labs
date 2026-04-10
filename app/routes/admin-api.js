const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Client = require('../models/Client');
const Employee = require('../models/Employee');
const Prospect = require('../models/Prospect');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');

// Middleware de sécurité global pour cette route
router.use(auth, adminOnly);

/**
 * @route   GET /api/v2/admin/keys
 * @desc    Lister toutes les clés API de l'admin
 */
router.get('/keys', async (req, res) => {
  try {
    const keys = await ApiKey.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, keys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/v2/admin/keys
 * @desc    Générer une nouvelle clé API
 */
router.post('/keys', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Le nom de la clé est requis' });

    const { rawKey, hash, prefix } = ApiKey.generate();
    
    const newKey = new ApiKey({
      name,
      key: hash,
      prefix,
      user: req.user._id
    });

    await newKey.save();

    // On renvoie la clé BRUTE une seule fois
    res.json({ 
      success: true, 
      message: 'Clé générée avec succès. Gardez-la précieusement !',
      key: rawKey,
      data: newKey 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   DELETE /api/v2/admin/keys/:id
 * @desc    Supprimer (révoquer) une clé API
 */
router.delete('/keys/:id', async (req, res) => {
  try {
    await ApiKey.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Clé API révoquée' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/v2/admin/stats
 * @desc    Récupérer les statistiques globales
 */
router.get('/stats', async (req, res) => {
  try {
    const counts = {
      clients: await Client.countDocuments(),
      employees: await Employee.countDocuments(),
      prospects: await Prospect.countDocuments(),
      appointments: await Appointment.countDocuments(),
      users: await User.countDocuments()
    };
    res.json({ success: true, stats: counts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/v2/admin/clients
 * @desc    Récupérer tous les clients
 */
router.get('/clients', async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json({ success: true, count: clients.length, data: clients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/v2/admin/employees
 * @desc    Récupérer tous les employés
 */
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ lastName: 1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/v2/admin/prospects
 * @desc    Récupérer tous les prospects
 */
router.get('/prospects', async (req, res) => {
  try {
    const prospects = await Prospect.find().sort({ createdAt: -1 });
    res.json({ success: true, count: prospects.length, data: prospects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/v2/admin/appointments
 * @desc    Récupérer tous les rendez-vous
 */
router.get('/appointments', async (req, res) => {
  try {
    const apps = await Appointment.find().sort({ start: -1 }).limit(100);
    res.json({ success: true, count: apps.length, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/v2/admin/invoices
 * @desc    Récupérer les factures (Finance)
 */
router.get('/invoices', async (req, res) => {
  try {
    const Invoice = require('../models/Invoice');
    const invoices = await Invoice.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/v2/admin/projects
 * @desc    Récupérer les projets en cours
 */
router.get('/projects', async (req, res) => {
  try {
    const Project = require('../models/Project');
    const projects = await Project.find().sort({ updatedAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/v2/admin/revenue
 * @desc    Récupérer les données financières (Analytique)
 */
router.get('/revenue', async (req, res) => {
  try {
    const Revenue = require('../models/Revenue');
    const data = await Revenue.find().sort({ month: -1 }).limit(12);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
