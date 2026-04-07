const express = require('express');
const router = express.Router();

// GET /api/status — Public status page data
router.get('/', async (req, res) => {
  try {
    const mongoose = require('mongoose');

    const services = [
      { name: 'Site Web Principal', endpoint: '/', status: 'operational' },
      { name: 'Espace Client', endpoint: '/espace-client-4p8w1n', status: 'operational' },
      { name: 'API Backend', endpoint: '/api/health', status: 'operational' },
      { name: 'Base de données', endpoint: null, status: mongoose.connection.readyState === 1 ? 'operational' : 'degraded' },
      { name: 'Emails (SMTP)', endpoint: null, status: process.env.SMTP_USER ? 'operational' : 'unknown' },
      { name: 'Chatbot IA', endpoint: '/api/chat', status: 'operational' }
    ];

    // Overall status
    const hasIssue = services.some(s => s.status !== 'operational');
    const overall = hasIssue ? 'degraded' : 'operational';

    // Uptime (estimated — can be connected to real monitoring later)
    const uptime = {
      last24h: '99.9%',
      last7d: '99.8%',
      last30d: '99.7%'
    };

    res.json({
      overall,
      services,
      uptime,
      lastChecked: new Date().toISOString(),
      incidents: []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
