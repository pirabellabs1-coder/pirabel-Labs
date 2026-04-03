const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Project = require('../models/Project');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Revenue = require('../models/Revenue');
const Employee = require('../models/Employee');
const { auth, adminOrEmployee } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', auth, adminOrEmployee, async (req, res) => {
  try {
    const [
      totalClients,
      activeClients,
      totalProjects,
      activeProjects,
      newOrders,
      totalEmployees,
      paidInvoices,
      pendingInvoices
    ] = await Promise.all([
      Client.countDocuments(),
      Client.countDocuments({ status: 'actif' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'en_cours' }),
      Order.countDocuments({ status: 'nouvelle' }),
      Employee.countDocuments({ status: 'actif' }),
      Invoice.countDocuments({ status: 'payee' }),
      Invoice.countDocuments({ status: { $in: ['envoyee', 'en_retard'] } })
    ]);

    // Revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthRevenue = await Revenue.aggregate([
      { $match: { type: 'income', date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalRevenue = await Revenue.aggregate([
      { $match: { type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      clients: { total: totalClients, active: activeClients },
      projects: { total: totalProjects, active: activeProjects },
      orders: { new: newOrders },
      employees: { total: totalEmployees },
      invoices: { paid: paidInvoices, pending: pendingInvoices },
      revenue: {
        thisMonth: monthRevenue[0]?.total || 0,
        total: totalRevenue[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/revenue-chart
router.get('/revenue-chart', auth, adminOrEmployee, async (req, res) => {
  try {
    const months = 12;
    const data = [];
    for (let i = months - 1; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const income = await Revenue.aggregate([
        { $match: { type: 'income', date: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const expenses = await Revenue.aggregate([
        { $match: { type: 'expense', date: { $gte: start, $lt: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      data.push({
        month: start.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        income: income[0]?.total || 0,
        expenses: expenses[0]?.total || 0,
        net: (income[0]?.total || 0) - (expenses[0]?.total || 0)
      });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/recent
router.get('/recent', auth, adminOrEmployee, async (req, res) => {
  try {
    const [recentOrders, recentProjects] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).limit(5),
      Project.find().populate('client', 'company').sort({ updatedAt: -1 }).limit(5)
    ]);
    res.json({ recentOrders, recentProjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/projects-by-service - Pie chart data
router.get('/projects-by-service', auth, adminOrEmployee, async (req, res) => {
  try {
    const data = await Project.aggregate([
      { $group: { _id: '$service', count: { $sum: 1 }, revenue: { $sum: '$budget' } } },
      { $sort: { count: -1 } }
    ]);
    res.json(data.map(d => ({ service: d._id, count: d.count, revenue: d.revenue })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/clients-growth - Clients per month (12 months)
router.get('/clients-growth', auth, adminOrEmployee, async (req, res) => {
  try {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      const count = await Client.countDocuments({ createdAt: { $gte: start, $lt: end } });
      data.push({ month: start.toLocaleDateString('fr-FR', { month: 'short' }), count });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/top-services - Top 5 services by revenue
router.get('/top-services', auth, adminOrEmployee, async (req, res) => {
  try {
    const data = await Project.aggregate([
      { $group: { _id: '$service', totalRevenue: { $sum: '$budget' }, count: { $sum: 1 } } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/activity - Recent activity timeline
router.get('/activity', auth, adminOrEmployee, async (req, res) => {
  try {
    const Activity = require('../models/Activity');
    const activities = await Activity.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/search - Global search
router.get('/search', auth, adminOrEmployee, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ results: [] });

    const regex = new RegExp(q, 'i');
    const [clients, projects, orders, articles] = await Promise.all([
      Client.find({ $or: [{ company: regex }, { contactName: regex }, { email: regex }] }).limit(5).select('company contactName email'),
      Project.find({ name: regex }).limit(5).select('name status'),
      Order.find({ $or: [{ name: regex }, { email: regex }] }).limit(5).select('name email service'),
      require('../models/Article').find({ $or: [{ title: regex }, { tags: regex }] }).limit(5).select('title slug status')
    ]);

    res.json({
      results: [
        ...clients.map(c => ({ type: 'client', label: c.company || c.contactName, sub: c.email, id: c._id })),
        ...projects.map(p => ({ type: 'project', label: p.name, sub: p.status, id: p._id })),
        ...orders.map(o => ({ type: 'order', label: o.name, sub: o.service, id: o._id })),
        ...articles.map(a => ({ type: 'article', label: a.title, sub: a.status, id: a._id }))
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
