const express = require('express');
const router = express.Router();
const { Visitor, PageView, AnalyticsEvent, DailyStat } = require('../models/Analytics');
const { auth, adminOnly } = require('../middleware/auth');

// ========================================
// PUBLIC ENDPOINTS (called by tracker.js)
// ========================================

// POST /api/analytics/track - Track page view
router.post('/track', async (req, res) => {
  try {
    const { visitorId, sessionId, page, title, referrer, device, browser, os, language, timeOnPage, scrollDepth, utmSource, utmMedium, utmCampaign } = req.body;
    if (!visitorId || !page) return res.status(400).json({ error: 'visitorId and page required' });

    // Upsert visitor
    const existing = await Visitor.findOne({ visitorId });
    if (existing) {
      existing.lastSeen = Date.now();
      existing.totalPageViews += 1;
      existing.totalVisits = existing.totalVisits; // Updated on new session
      existing.isReturning = true;
      if (timeOnPage) existing.totalTimeSpent += timeOnPage;
      await existing.save();
    } else {
      await Visitor.create({
        visitorId, device: device || 'desktop', browser, os, language,
        referrer: referrer || '', utmSource, utmMedium, utmCampaign,
        totalPageViews: 1
      });
    }

    // Record page view
    await PageView.create({ visitorId, sessionId: sessionId || visitorId, page, title, referrer, timeOnPage: timeOnPage || 0, scrollDepth: scrollDepth || 0 });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analytics/event - Track custom event
router.post('/event', async (req, res) => {
  try {
    const { visitorId, sessionId, page, category, action, label, value } = req.body;
    if (!visitorId || !category || !action) return res.status(400).json({ error: 'Missing fields' });

    await AnalyticsEvent.create({ visitorId, sessionId: sessionId || visitorId, page, category, action, label, value });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analytics/heartbeat - Update time on page
router.post('/heartbeat', async (req, res) => {
  try {
    const { visitorId, sessionId, page, timeOnPage, scrollDepth } = req.body;
    // Update latest pageview for this visitor+page
    await PageView.findOneAndUpdate(
      { visitorId, page, sessionId },
      { timeOnPage, scrollDepth },
      { sort: { timestamp: -1 } }
    );
    // Update visitor total time
    if (timeOnPage) {
      await Visitor.findOneAndUpdate({ visitorId }, { $inc: { totalTimeSpent: 5 }, lastSeen: Date.now() });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: true }); // Don't fail silently
  }
});

// POST /api/analytics/session - New session
router.post('/session', async (req, res) => {
  try {
    const { visitorId } = req.body;
    await Visitor.findOneAndUpdate({ visitorId }, { $inc: { totalVisits: 1 }, lastSeen: Date.now() });
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: true });
  }
});

// ========================================
// ADMIN ENDPOINTS (dashboard)
// ========================================

// GET /api/analytics/realtime - Active visitors right now
router.get('/realtime', auth, adminOnly, async (req, res) => {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeVisitors = await Visitor.countDocuments({ lastSeen: { $gte: fiveMinAgo } });
    const recentPages = await PageView.find({ timestamp: { $gte: fiveMinAgo } })
      .sort({ timestamp: -1 }).limit(20).select('page visitorId timestamp');
    res.json({ activeVisitors, recentPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/overview - Overview stats
router.get('/overview', auth, adminOnly, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalVisitors, newVisitors, totalPageViews, totalEvents] = await Promise.all([
      Visitor.countDocuments({ lastSeen: { $gte: startDate } }),
      Visitor.countDocuments({ firstSeen: { $gte: startDate } }),
      PageView.countDocuments({ timestamp: { $gte: startDate } }),
      AnalyticsEvent.countDocuments({ timestamp: { $gte: startDate } })
    ]);

    // Avg time on site
    const avgTime = await PageView.aggregate([
      { $match: { timestamp: { $gte: startDate }, timeOnPage: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$timeOnPage' } } }
    ]);

    // Avg pages per visitor
    const avgPages = totalVisitors > 0 ? (totalPageViews / totalVisitors).toFixed(1) : 0;

    // Bounce rate (visitors with only 1 pageview)
    const singlePageVisitors = await PageView.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$visitorId', count: { $sum: 1 } } },
      { $match: { count: 1 } },
      { $count: 'total' }
    ]);
    const bounceRate = totalVisitors > 0 ? ((singlePageVisitors[0]?.total || 0) / totalVisitors * 100).toFixed(1) : 0;

    res.json({
      totalVisitors, newVisitors, returningVisitors: totalVisitors - newVisitors,
      totalPageViews, totalEvents,
      avgTimeOnSite: Math.round(avgTime[0]?.avg || 0),
      avgPagesPerVisitor: parseFloat(avgPages),
      bounceRate: parseFloat(bounceRate)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/visitors-chart - Visitors per day
router.get('/visitors-chart', auth, adminOnly, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const start = new Date(); start.setDate(start.getDate() - i); start.setHours(0,0,0,0);
      const end = new Date(start); end.setDate(end.getDate() + 1);

      const [visitors, pageViews] = await Promise.all([
        Visitor.countDocuments({ lastSeen: { $gte: start, $lt: end } }),
        PageView.countDocuments({ timestamp: { $gte: start, $lt: end } })
      ]);

      data.push({
        date: start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        visitors, pageViews
      });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/top-pages - Most viewed pages
router.get('/top-pages', auth, adminOnly, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const pages = await PageView.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: '$page', views: { $sum: 1 }, avgTime: { $avg: '$timeOnPage' }, avgScroll: { $avg: '$scrollDepth' } } },
      { $sort: { views: -1 } },
      { $limit: 20 }
    ]);
    res.json(pages.map(p => ({ page: p._id, views: p.views, avgTime: Math.round(p.avgTime || 0), avgScroll: Math.round(p.avgScroll || 0) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/top-referrers
router.get('/top-referrers', auth, adminOnly, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const referrers = await PageView.aggregate([
      { $match: { timestamp: { $gte: startDate }, referrer: { $ne: '' } } },
      { $group: { _id: '$referrer', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json(referrers.map(r => ({ referrer: r._id, count: r.count })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/devices
router.get('/devices', auth, adminOnly, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const devices = await Visitor.aggregate([
      { $match: { lastSeen: { $gte: startDate } } },
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);

    const browsers = await Visitor.aggregate([
      { $match: { lastSeen: { $gte: startDate }, browser: { $ne: '' } } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      devices: devices.map(d => ({ device: d._id, count: d.count })),
      browsers: browsers.map(b => ({ browser: b._id, count: b.count }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/events-summary
router.get('/events-summary', auth, adminOnly, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const startDate = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    const events = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      { $group: { _id: { category: '$category', action: '$action' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    res.json(events.map(e => ({ category: e._id.category, action: e._id.action, count: e.count })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
