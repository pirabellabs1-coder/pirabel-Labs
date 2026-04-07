const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Project = require('../models/Project');
const Order = require('../models/Order');
const Application = require('../models/Application');
const JobOffer = require('../models/JobOffer');
const Article = require('../models/Article');
const Lead = require('../models/Lead');
const Invoice = require('../models/Invoice');
const { auth, adminOrEmployee } = require('../middleware/auth');

// GET /api/search?q=...
router.get('/', auth, adminOrEmployee, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) return res.json({ results: [] });
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [clients, projects, orders, apps, jobs, articles, leads, invoices] = await Promise.all([
      Client.find({ $or: [{ company: regex }, { contactName: regex }, { email: regex }] }).limit(5).select('company contactName email'),
      Project.find({ $or: [{ name: regex }, { description: regex }] }).limit(5).select('name status').populate('client', 'company'),
      Order.find({ $or: [{ name: regex }, { email: regex }, { service: regex }] }).limit(5).select('name email service status'),
      Application.find({ $or: [{ name: regex }, { email: regex }, { jobTitle: regex }] }).limit(5).select('name email jobTitle status'),
      JobOffer.find({ $or: [{ title: regex }, { department: regex }] }).limit(5).select('title slug status'),
      Article.find({ $or: [{ title: regex }, { excerpt: regex }] }).limit(5).select('title slug status'),
      Lead.find({ $or: [{ 'visitor.name': regex }, { 'visitor.email': regex }, { 'visitor.company': regex }] }).limit(5).select('visitor qualification.score'),
      Invoice.find({ $or: [{ number: regex } ]}).limit(5).select('number total status').populate('client', 'company')
    ]);

    const results = [
      ...clients.map(c => ({ type: 'client', icon: 'business', title: c.company || c.contactName, subtitle: c.email, link: `/clients?id=${c._id}` })),
      ...projects.map(p => ({ type: 'project', icon: 'rocket_launch', title: p.name, subtitle: p.client ? p.client.company : p.status, link: `/projects?id=${p._id}` })),
      ...orders.map(o => ({ type: 'order', icon: 'shopping_cart', title: o.name, subtitle: `${o.service} - ${o.status}`, link: `/orders?id=${o._id}` })),
      ...apps.map(a => ({ type: 'application', icon: 'person_add', title: a.name, subtitle: a.jobTitle, link: `/candidates?id=${a._id}` })),
      ...jobs.map(j => ({ type: 'job', icon: 'work', title: j.title, subtitle: j.status, link: `/recruitment?id=${j._id}` })),
      ...articles.map(a => ({ type: 'article', icon: 'article', title: a.title, subtitle: a.status, link: `/articles?slug=${a.slug}` })),
      ...leads.map(l => ({ type: 'lead', icon: 'local_fire_department', title: l.visitor?.name || l.visitor?.email || 'Lead', subtitle: `Score: ${l.qualification?.score || 0}`, link: `/leads?id=${l._id}` })),
      ...invoices.map(i => ({ type: 'invoice', icon: 'receipt_long', title: `Facture ${i.number}`, subtitle: `${i.total}€ - ${i.status}`, link: `/invoices?id=${i._id}` }))
    ];

    res.json({ results, query: q, total: results.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
