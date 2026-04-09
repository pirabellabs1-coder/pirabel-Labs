const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Client = require('../models/Client');
const Employee = require('../models/Employee');
const Prospect = require('../models/Prospect');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Middleware de sécurité global pour cette route
router.use(auth, adminOnly);

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
 * @route   GET /api/v2/admin/users
 * @desc    Récupérer les utilisateurs du système (sans les mots de passe)
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
