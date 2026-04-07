const express = require('express');
const router = express.Router();
const { Visitor, Session, PageView, AnalyticsEvent, HeatmapData, Conversion, DailyStat } = require('../models/Analytics');
const { auth, adminOnly } = require('../middleware/auth');

// ============================================================
// RATE LIMITER — simple in-memory per-IP (60 req/min)
// ============================================================
const rateLimitMap = new Map();
const RATE_LIMIT = 60;
const RATE_WINDOW = 60 * 1000;

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    entry = { start: now, count: 0 };
    rateLimitMap.set(ip, entry);
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  next();
}

// Clean rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.start > RATE_WINDOW) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000);

// ============================================================
// HELPERS
// ============================================================

/** Build a date range filter from query params */
function getDateRange(query) {
  const { period = '30', from, to } = query;
  if (from && to) {
    return { start: new Date(from), end: new Date(to) };
  }
  const days = parseInt(period, 10) || 30;
  return { start: new Date(Date.now() - days * 24 * 60 * 60 * 1000), end: new Date() };
}

/** Referrer categorisation (server side) */
const SOCIAL_DOMAINS = ['facebook.com','fb.com','t.co','twitter.com','x.com','linkedin.com','instagram.com','pinterest.com','reddit.com','youtube.com','tiktok.com'];
const SEARCH_DOMAINS = ['google.','bing.com','yahoo.','duckduckgo.com','baidu.com','yandex.','ecosia.org','qwant.com'];
const EMAIL_DOMAINS  = ['mail.google.com','outlook.live.com','mail.yahoo.com'];

function categoriseReferrer(ref) {
  if (!ref) return 'direct';
  try {
    const host = new URL(ref).hostname.replace(/^www\./, '');
    if (SOCIAL_DOMAINS.some(d => host.includes(d))) return 'social';
    if (SEARCH_DOMAINS.some(d => host.includes(d))) return 'organic';
    if (EMAIL_DOMAINS.some(d => host.includes(d))) return 'email';
    return 'referral';
  } catch {
    return 'referral';
  }
}

// ========================================================================
//  PUBLIC ENDPOINTS  (called by tracker.js — no auth, rate limited)
// ========================================================================

// ---------------------------------------------------------------
// 1) POST /api/analytics/batch — receive batched events
// ---------------------------------------------------------------
router.post('/batch', rateLimit, async (req, res) => {
  try {
    let events = req.body;
    if (!Array.isArray(events)) {
      // Could be a single event wrapped
      if (events && events.vid) events = [events];
      else return res.status(400).json({ error: 'Expected array of events' });
    }
    if (events.length > 50) events = events.slice(0, 50);

    // Process each event by type
    const ops = events.map(evt => processEvent(evt, req));
    await Promise.allSettled(ops);

    res.json({ ok: true, processed: events.length });
  } catch (err) {
    console.error('[analytics/batch]', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
});

/** Route a single batched event to the right handler */
async function processEvent(evt, req) {
  if (!evt || !evt.vid || !evt.sid || !evt.type) return;

  const vid = String(evt.vid);
  const sid = String(evt.sid);
  const ts  = evt.ts || Date.now();
  const d   = evt.data || {};

  switch (evt.type) {
    case 'pageview':
      return processPageView(vid, sid, ts, d, req);
    case 'click':
      return processClick(vid, sid, ts, d);
    case 'scroll':
      return processScroll(vid, sid, ts, d);
    case 'form':
      return processForm(vid, sid, ts, d);
    case 'heartbeat':
      return processHeartbeat(vid, sid, ts, d);
    case 'engagement':
      return processEngagement(vid, sid, ts, d);
    case 'heatmap':
      return processHeatmap(vid, sid, ts, d);
    case 'conversion':
      return processConversion(vid, sid, ts, d);
    case 'custom':
      return processCustom(vid, sid, ts, d);
    case 'error':
      return processError(vid, sid, ts, d);
    default:
      // Store as generic event
      await AnalyticsEvent.create({
        visitorId: vid, sessionId: sid, page: d.p || '',
        category: evt.type, action: 'unknown',
        label: '', value: 0, meta: d, timestamp: new Date(ts)
      });
  }
}

async function processPageView(vid, sid, ts, d, req) {
  // Upsert visitor
  const isNew = d.new === 1;
  const refCat = d.rc || categoriseReferrer(d.ref);

  const visitorUpdate = {
    $set: {
      lastSeen: new Date(ts),
      device: d.dv || 'desktop',
      browser: d.br || '',
      browserVersion: d.bv || '',
      os: d.os || '',
      osVersion: d.ov || '',
      language: d.lang || '',
      timezone: d.tz || '',
      screenResolution: d.sr || '',
      connectionType: d.ct || '',
      referrerCategory: refCat,
      utmSource: d.us || '',
      utmMedium: d.um || '',
      utmCampaign: d.uc || '',
      utmTerm: d.ut || '',
      utmContent: d.uco || '',
      isBot: d.bot === 1,
      searchQuery: d.sq || ''
    },
    $inc: { totalPageViews: 1 },
    $setOnInsert: {
      visitorId: vid,
      firstSeen: new Date(ts),
      entryPage: d.p || '',
      totalVisits: 1,
      totalTimeSpent: 0,
      totalAttentionTime: 0,
      isReturning: false,
      engagementScore: 0
    }
  };

  const visitor = await Visitor.findOneAndUpdate(
    { visitorId: vid },
    visitorUpdate,
    { upsert: true, new: true }
  );

  // Mark returning
  if (visitor && visitor.totalVisits > 1 && !visitor.isReturning) {
    await Visitor.updateOne({ visitorId: vid }, { $set: { isReturning: true } });
  }

  // Upsert session
  await Session.findOneAndUpdate(
    { sessionId: sid },
    {
      $set: {
        lastActivity: new Date(ts),
        device: d.dv || 'desktop',
        browser: d.br || '',
        os: d.os || '',
        referrer: d.ref || '',
        referrerCategory: refCat,
        utmSource: d.us || '',
        utmMedium: d.um || '',
        utmCampaign: d.uc || ''
      },
      $inc: { pageCount: 1 },
      $setOnInsert: {
        sessionId: sid,
        visitorId: vid,
        startedAt: new Date(ts),
        duration: 0,
        attentionTime: 0,
        entryPage: d.p || '',
        exitPage: d.p || '',
        isBounce: true,
        engagementScore: 0,
        conversions: []
      }
    },
    { upsert: true, new: true }
  );

  // Mark not-bounce if this is 2nd+ pageview
  await Session.updateOne(
    { sessionId: sid, pageCount: { $gt: 1 } },
    { $set: { isBounce: false } }
  );

  // Update exit page
  await Session.updateOne({ sessionId: sid }, { $set: { exitPage: d.p || '' } });

  // Record page view
  await PageView.create({
    visitorId: vid,
    sessionId: sid,
    page: d.p || '',
    fullUrl: d.url || '',
    title: d.t || '',
    referrer: d.ref || '',
    isEntry: d.ns === 1,
    timestamp: new Date(ts)
  });
}

async function processClick(vid, sid, ts, d) {
  await AnalyticsEvent.create({
    visitorId: vid, sessionId: sid,
    page: d.p || '',
    category: 'click',
    action: d.a || 'click',
    label: d.txt || '',
    value: 0,
    meta: { tag: d.tag, href: d.hr, cls: d.cls, x: d.x, y: d.y, cx: d.cx, cy: d.cy },
    timestamp: new Date(ts)
  });
}

async function processScroll(vid, sid, ts, d) {
  await AnalyticsEvent.create({
    visitorId: vid, sessionId: sid,
    page: d.p || '',
    category: 'scroll',
    action: 'milestone_' + (d.m || 0),
    label: '',
    value: d.m || 0,
    meta: { velocity: d.v || 0 },
    timestamp: new Date(ts)
  });

  // Update pageview scroll milestones
  await PageView.findOneAndUpdate(
    { visitorId: vid, sessionId: sid, page: d.p || '' },
    { $addToSet: { scrollMilestones: d.m }, $max: { scrollDepth: d.m } },
    { sort: { timestamp: -1 } }
  );
}

async function processForm(vid, sid, ts, d) {
  await AnalyticsEvent.create({
    visitorId: vid, sessionId: sid,
    page: d.p || '',
    category: 'form',
    action: d.a || 'interaction',
    label: d.f || d.form || '',
    value: d.dur || 0,
    meta: { field: d.f, type: d.type, formId: d.form, filled: d.filled },
    timestamp: new Date(ts)
  });
}

async function processHeartbeat(vid, sid, ts, d) {
  // Update the latest page view with time / scroll / vitals
  await PageView.findOneAndUpdate(
    { visitorId: vid, sessionId: sid, page: d.p || '' },
    {
      $set: {
        timeOnPage: d.top || 0,
        attentionTime: d.at || 0,
        scrollDepth: d.sd || 0,
        lcp: d.lcp || 0,
        fid: d.fid || 0,
        cls: d.cls || 0,
        rageClicks: d.rc || 0,
        deadClicks: d.dc || 0
      }
    },
    { sort: { timestamp: -1 } }
  );

  // Update session duration & engagement
  await Session.findOneAndUpdate(
    { sessionId: sid },
    {
      $set: {
        lastActivity: new Date(ts),
        exitPage: d.p || '',
        engagementScore: d.es || 0
      },
      $max: {
        duration: d.top || 0,
        attentionTime: d.at || 0
      }
    }
  );

  // Update visitor time
  await Visitor.findOneAndUpdate(
    { visitorId: vid },
    {
      $set: { lastSeen: new Date(ts), engagementScore: d.es || 0 },
      $max: { totalTimeSpent: d.top || 0, totalAttentionTime: d.at || 0 }
    }
  );
}

async function processEngagement(vid, sid, ts, d) {
  await AnalyticsEvent.create({
    visitorId: vid, sessionId: sid,
    page: d.p || '',
    category: 'engagement',
    action: d.a || 'unknown',
    label: d.l || d.txt || '',
    value: d.val || 0,
    meta: { x: d.x, y: d.y, tag: d.tag, txt: d.txt,
            top: d.top, pt: d.pt, at: d.at, sd: d.sd,
            es: d.es, lcp: d.lcp, fid: d.fid, cls: d.cls,
            rc: d.rc, dc: d.dc, sdc: d.sdc, fi: d.fi },
    timestamp: new Date(ts)
  });

  // If page_exit, finalize session/pageview
  if (d.a === 'page_exit') {
    await PageView.findOneAndUpdate(
      { visitorId: vid, sessionId: sid, page: d.p || '' },
      {
        $set: {
          isExit: true,
          timeOnPage: d.top || 0,
          attentionTime: d.at || 0,
          scrollDepth: d.sd || 0,
          lcp: d.lcp || 0,
          fid: d.fid || 0,
          cls: d.cls || 0,
          rageClicks: d.rc || 0,
          deadClicks: d.dc || 0
        }
      },
      { sort: { timestamp: -1 } }
    );
  }
}

async function processHeatmap(vid, sid, ts, d) {
  if (!d.pts || !Array.isArray(d.pts) || d.pts.length === 0) return;
  await HeatmapData.create({
    visitorId: vid,
    sessionId: sid,
    page: d.p || '',
    points: d.pts.slice(0, 500), // cap at 500 points
    timestamp: new Date(ts)
  });
}

async function processConversion(vid, sid, ts, d) {
  await Conversion.create({
    visitorId: vid,
    sessionId: sid,
    goal: d.g || 'unknown',
    page: d.p || '',
    referrer: d.ref || '',
    referrerCategory: d.rc || 'unknown',
    utmSource: d.us || '',
    utmMedium: d.um || '',
    utmCampaign: d.uc || '',
    value: d.val || 0,
    timestamp: new Date(ts)
  });

  // Also add to session conversions array
  await Session.findOneAndUpdate(
    { sessionId: sid },
    { $push: { conversions: { goal: d.g, timestamp: new Date(ts), value: d.val || 0 } } }
  );
}

async function processCustom(vid, sid, ts, d) {
  await AnalyticsEvent.create({
    visitorId: vid, sessionId: sid,
    page: d.p || '',
    category: d.cat || 'custom',
    action: d.act || 'custom',
    label: d.lbl || '',
    value: d.val || 0,
    meta: {},
    timestamp: new Date(ts)
  });
}

async function processError(vid, sid, ts, d) {
  await AnalyticsEvent.create({
    visitorId: vid, sessionId: sid,
    page: d.p || '',
    category: 'error',
    action: d.type || 'js_error',
    label: d.msg || '',
    value: d.ln || 0,
    meta: { source: d.src, line: d.ln, col: d.col },
    timestamp: new Date(ts)
  });
}

// ---------------------------------------------------------------
// 2) POST /api/analytics/track — single page view (backwards compat)
// ---------------------------------------------------------------
router.post('/track', rateLimit, async (req, res) => {
  try {
    const b = req.body;
    if (!b.visitorId || !b.page) return res.status(400).json({ error: 'visitorId and page required' });

    const refCat = b.referrerCategory || categoriseReferrer(b.referrer);

    // Upsert visitor
    await Visitor.findOneAndUpdate(
      { visitorId: b.visitorId },
      {
        $set: {
          lastSeen: new Date(),
          device: b.device || 'desktop',
          browser: b.browser || '',
          browserVersion: b.browserVersion || '',
          os: b.os || '',
          osVersion: b.osVersion || '',
          language: b.language || '',
          timezone: b.timezone || '',
          screenResolution: b.screenResolution || '',
          connectionType: b.connectionType || '',
          referrer: b.referrer || '',
          referrerCategory: refCat,
          utmSource: b.utmSource || '',
          utmMedium: b.utmMedium || '',
          utmCampaign: b.utmCampaign || '',
          utmTerm: b.utmTerm || '',
          utmContent: b.utmContent || '',
          isBot: b.isBot || false,
          searchQuery: b.searchQuery || ''
        },
        $inc: { totalPageViews: 1 },
        $setOnInsert: {
          visitorId: b.visitorId,
          firstSeen: new Date(),
          entryPage: b.page,
          totalVisits: 1,
          totalTimeSpent: 0,
          isReturning: false
        }
      },
      { upsert: true, new: true }
    );

    // Mark returning if > 1 visit
    if (b.visitCount > 1 || !b.isNewVisitor) {
      await Visitor.updateOne({ visitorId: b.visitorId }, { $set: { isReturning: true } });
    }

    // Record page view
    await PageView.create({
      visitorId: b.visitorId,
      sessionId: b.sessionId || b.visitorId,
      page: b.page,
      title: b.title || '',
      referrer: b.referrer || '',
      timestamp: new Date()
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[analytics/track]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 3) POST /api/analytics/event — single event (backwards compat)
// ---------------------------------------------------------------
router.post('/event', rateLimit, async (req, res) => {
  try {
    const { visitorId, sessionId, page, category, action, label, value } = req.body;
    if (!visitorId || !category || !action) return res.status(400).json({ error: 'Missing fields' });

    await AnalyticsEvent.create({
      visitorId,
      sessionId: sessionId || visitorId,
      page: page || '',
      category,
      action,
      label: label || '',
      value: value || 0,
      timestamp: new Date()
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[analytics/event]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 4) POST /api/analytics/heartbeat — time tracking (backwards compat)
// ---------------------------------------------------------------
router.post('/heartbeat', rateLimit, async (req, res) => {
  try {
    const b = req.body;
    if (!b.visitorId) return res.json({ ok: true });

    // Update latest page view
    const updateFields = {
      timeOnPage: b.timeOnPage || 0,
      scrollDepth: b.scrollDepth || 0
    };
    if (b.preciseTime !== undefined) updateFields.attentionTime = b.preciseTime;
    if (b.attentionTime !== undefined) updateFields.attentionTime = b.attentionTime;
    if (b.lcp) updateFields.lcp = b.lcp;
    if (b.fid) updateFields.fid = b.fid;
    if (b.cls !== undefined) updateFields.cls = b.cls;

    await PageView.findOneAndUpdate(
      { visitorId: b.visitorId, page: b.page, sessionId: b.sessionId || b.visitorId },
      { $set: updateFields },
      { sort: { timestamp: -1 } }
    );

    // Update visitor
    await Visitor.findOneAndUpdate(
      { visitorId: b.visitorId },
      {
        $set: { lastSeen: new Date(), engagementScore: b.engagementScore || 0 },
        $max: { totalTimeSpent: b.timeOnPage || 0, totalAttentionTime: b.attentionTime || 0 }
      }
    );

    // Update session
    if (b.sessionId) {
      await Session.findOneAndUpdate(
        { sessionId: b.sessionId },
        {
          $set: { lastActivity: new Date(), exitPage: b.page || '', engagementScore: b.engagementScore || 0 },
          $max: { duration: b.timeOnPage || 0, attentionTime: b.attentionTime || 0 }
        }
      );
    }

    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: true }); // never fail on heartbeat
  }
});

// ---------------------------------------------------------------
// 5) POST /api/analytics/session — new session (backwards compat)
// ---------------------------------------------------------------
router.post('/session', rateLimit, async (req, res) => {
  try {
    const { visitorId } = req.body;
    if (visitorId) {
      await Visitor.findOneAndUpdate(
        { visitorId },
        { $inc: { totalVisits: 1 }, $set: { lastSeen: new Date(), isReturning: true } }
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: true });
  }
});


// ========================================================================
//  ADMIN ENDPOINTS  (auth + adminOnly)
// ========================================================================

// ---------------------------------------------------------------
// 6) GET /api/analytics/realtime — active visitors right now
// ---------------------------------------------------------------
router.get('/realtime', auth, adminOnly, async (req, res) => {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    const [activeCount, recentPages, deviceBreakdown] = await Promise.all([
      Visitor.countDocuments({ lastSeen: { $gte: fiveMinAgo }, isBot: { $ne: true } }),

      PageView.find({ timestamp: { $gte: fiveMinAgo } })
        .sort({ timestamp: -1 }).limit(30)
        .select('page visitorId title timestamp'),

      Visitor.aggregate([
        { $match: { lastSeen: { $gte: fiveMinAgo }, isBot: { $ne: true } } },
        { $group: { _id: '$device', count: { $sum: 1 } } }
      ])
    ]);

    // Current pages being viewed (dedupe)
    const pageMap = {};
    recentPages.forEach(pv => {
      if (!pageMap[pv.page]) pageMap[pv.page] = { page: pv.page, title: pv.title || pv.page, activeVisitors: new Set() };
      pageMap[pv.page].activeVisitors.add(pv.visitorId);
    });
    const currentPages = Object.values(pageMap).map(p => ({
      page: p.page,
      path: p.page,
      title: p.title,
      activeVisitors: p.activeVisitors.size,
      visitors: p.activeVisitors.size,
      count: p.activeVisitors.size
    })).sort((a, b) => b.activeVisitors - a.activeVisitors);

    // Recent page views (raw stream, dedupe by visitor+page)
    const seen = new Set();
    const recentPageViews = [];
    for (const pv of recentPages) {
      const k = pv.visitorId + '|' + pv.page;
      if (seen.has(k)) continue;
      seen.add(k);
      recentPageViews.push({
        page: pv.page,
        path: pv.page,
        title: pv.title || pv.page,
        time: pv.timestamp
      });
      if (recentPageViews.length >= 20) break;
    }

    res.json({
      activeVisitors: activeCount,
      visitors: activeCount,
      currentPages,
      activePages: currentPages,
      recentPageViews,
      recentViews: recentPageViews,
      deviceBreakdown: deviceBreakdown.map(d => ({ device: d._id || 'unknown', count: d.count }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 7) GET /api/analytics/overview — overview stats
// ---------------------------------------------------------------
router.get('/overview', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);

    // Same-length previous period for trend deltas
    const periodMs = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodMs);
    const prevEnd = new Date(start.getTime());

    const [totalVisitors, newVisitors, totalPageViews, totalEvents, totalSessions, totalConversions,
           prevVisitors, prevPageViews, prevNewVisitors] = await Promise.all([
      Visitor.countDocuments({ lastSeen: { $gte: start, $lte: end }, isBot: { $ne: true } }),
      Visitor.countDocuments({ firstSeen: { $gte: start, $lte: end }, isBot: { $ne: true } }),
      PageView.countDocuments({ timestamp: { $gte: start, $lte: end } }),
      AnalyticsEvent.countDocuments({ timestamp: { $gte: start, $lte: end } }),
      Session.countDocuments({ startedAt: { $gte: start, $lte: end } }),
      Conversion.countDocuments({ timestamp: { $gte: start, $lte: end } }),
      Visitor.countDocuments({ lastSeen: { $gte: prevStart, $lte: prevEnd }, isBot: { $ne: true } }),
      PageView.countDocuments({ timestamp: { $gte: prevStart, $lte: prevEnd } }),
      Visitor.countDocuments({ firstSeen: { $gte: prevStart, $lte: prevEnd }, isBot: { $ne: true } })
    ]);

    // Avg session duration
    const avgDuration = await Session.aggregate([
      { $match: { startedAt: { $gte: start, $lte: end }, duration: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$duration' } } }
    ]);

    // Avg pages per session
    const avgPagesPerSession = await Session.aggregate([
      { $match: { startedAt: { $gte: start, $lte: end }, pageCount: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$pageCount' } } }
    ]);

    // Bounce rate
    const bounceSessions = await Session.countDocuments({
      startedAt: { $gte: start, $lte: end }, isBounce: true
    });
    const bounceRate = totalSessions > 0 ? ((bounceSessions / totalSessions) * 100) : 0;

    // Engagement rate (sessions with engagementScore > 30)
    const engagedSessions = await Session.countDocuments({
      startedAt: { $gte: start, $lte: end }, engagementScore: { $gt: 30 }
    });
    const engagementRate = totalSessions > 0 ? ((engagedSessions / totalSessions) * 100) : 0;

    // Top conversions
    const topConversions = await Conversion.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      { $group: { _id: '$goal', count: { $sum: 1 }, totalValue: { $sum: '$value' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Avg time on page
    const avgTimeOnPage = await PageView.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end }, timeOnPage: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$timeOnPage' } } }
    ]);

    // Daily sparkline series (real data, not random)
    const dailySeries = await PageView.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          pageViews: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const dailyVisitors  = dailySeries.map(d => d.visitors.length);
    const dailyPageViews = dailySeries.map(d => d.pageViews);

    // Daily new visitors series
    const dailyNewSeries = await Visitor.aggregate([
      { $match: { firstSeen: { $gte: start, $lte: end }, isBot: { $ne: true } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$firstSeen' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const dailyNewVisitors = dailyNewSeries.map(d => d.count);

    // Helper: percent delta vs previous period
    const pct = (cur, prev) => {
      if (!prev) return cur > 0 ? 100 : 0;
      return parseFloat((((cur - prev) / prev) * 100).toFixed(1));
    };

    const avgTimeVal = Math.round(avgTimeOnPage[0]?.avg || 0);
    const avgDurationVal = Math.round(avgDuration[0]?.avg || 0);

    res.json({
      // Original keys
      totalVisitors,
      uniqueVisitors: totalVisitors,
      newVisitors,
      returningVisitors: totalVisitors - newVisitors,
      totalPageViews,
      totalEvents,
      totalSessions,
      avgSessionDuration: avgDurationVal,
      avgPagesPerSession: parseFloat((avgPagesPerSession[0]?.avg || 0).toFixed(1)),
      avgTimeOnPage: avgTimeVal,
      bounceRate: parseFloat(bounceRate.toFixed(1)),
      engagementRate: parseFloat(engagementRate.toFixed(1)),
      totalConversions,
      topConversions: topConversions.map(c => ({ goal: c._id, count: c.count, value: c.totalValue })),
      // Aliases expected by frontend
      pageViews: totalPageViews,
      avgTime: avgTimeVal,
      visitors: totalVisitors,
      // Real sparklines (frontend was generating random fillers)
      dailyVisitors,
      dailyPageViews,
      dailyNewVisitors,
      sparklines: {
        visitors: dailyVisitors,
        pageViews: dailyPageViews,
        newVisitors: dailyNewVisitors
      },
      // Trend deltas
      trends: {
        visitors: pct(totalVisitors, prevVisitors),
        pageViews: pct(totalPageViews, prevPageViews),
        newVisitors: pct(newVisitors, prevNewVisitors)
      },
      visitorsTrend: pct(totalVisitors, prevVisitors),
      pageViewsTrend: pct(totalPageViews, prevPageViews),
      newVisitorsTrend: pct(newVisitors, prevNewVisitors)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 8) GET /api/analytics/visitors-chart — daily visitors for chart
// ---------------------------------------------------------------
router.get('/visitors-chart', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);

    const data = await PageView.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          pageViews: { $sum: 1 },
          visitors: { $addToSet: '$visitorId' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          pageViews: 1,
          visitors: { $size: '$visitors' }
        }
      }
    ]);

    // Calculate simple trend line (linear regression)
    const n = data.length;
    if (n > 1) {
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      data.forEach((d, i) => {
        sumX += i; sumY += d.visitors; sumXY += i * d.visitors; sumXX += i * i;
      });
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      data.forEach((d, i) => { d.trend = Math.round(intercept + slope * i); });
    }

    // Provide both formats: array (legacy) AND keyed object (new frontend)
    const labels = data.map(d => d.date);
    const visitorsArr = data.map(d => d.visitors);
    const pageViewsArr = data.map(d => d.pageViews);

    // Attach the keyed properties on the array itself so both
    // `data.map(...)` AND `data.labels` work in the frontend.
    Object.defineProperty(data, 'labels', { value: labels, enumerable: false });
    Object.defineProperty(data, 'visitors', { value: visitorsArr, enumerable: false });
    Object.defineProperty(data, 'pageViews', { value: pageViewsArr, enumerable: false });

    // But JSON.stringify won't serialize non-enumerable props, so wrap:
    res.json({ labels, visitors: visitorsArr, pageViews: pageViewsArr, days: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 9) GET /api/analytics/top-pages — most viewed pages
// ---------------------------------------------------------------
router.get('/top-pages', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const limit = parseInt(req.query.limit, 10) || 20;

    const pages = await PageView.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$page',
          title: { $first: '$title' },
          views: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          avgTime: { $avg: { $cond: [{ $gt: ['$timeOnPage', 0] }, '$timeOnPage', null] } },
          avgScroll: { $avg: { $cond: [{ $gt: ['$scrollDepth', 0] }, '$scrollDepth', null] } },
          avgAttention: { $avg: { $cond: [{ $gt: ['$attentionTime', 0] }, '$attentionTime', null] } },
          entryCount: { $sum: { $cond: ['$isEntry', 1, 0] } },
          exitCount: { $sum: { $cond: ['$isExit', 1, 0] } },
          bounceCount: { $sum: { $cond: ['$isBounce', 1, 0] } },
          avgLCP: { $avg: { $cond: [{ $gt: ['$lcp', 0] }, '$lcp', null] } },
          avgCLS: { $avg: { $cond: [{ $gt: ['$cls', 0] }, '$cls', null] } }
        }
      },
      { $sort: { views: -1 } },
      { $limit: limit },
      {
        $project: {
          page: '$_id',
          title: 1,
          views: 1,
          uniqueViews: { $size: '$uniqueVisitors' },
          avgTime: { $round: [{ $ifNull: ['$avgTime', 0] }, 0] },
          avgScroll: { $round: [{ $ifNull: ['$avgScroll', 0] }, 0] },
          avgAttention: { $round: [{ $ifNull: ['$avgAttention', 0] }, 0] },
          entryCount: 1,
          exitCount: 1,
          bounceRate: {
            $cond: [
              { $gt: ['$views', 0] },
              { $round: [{ $multiply: [{ $divide: ['$bounceCount', '$views'] }, 100] }, 1] },
              0
            ]
          },
          avgLCP: { $round: [{ $ifNull: ['$avgLCP', 0] }, 0] },
          avgCLS: { $round: [{ $ifNull: ['$avgCLS', 0] }, 4] }
        }
      }
    ]);

    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 10) GET /api/analytics/top-referrers
// ---------------------------------------------------------------
router.get('/top-referrers', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const limit = parseInt(req.query.limit, 10) || 20;

    // Build a regex that excludes self-referrals (internal navigation).
    // Hosts are read from env so the same code works in dev and prod.
    const selfHosts = [];
    try {
      if (process.env.SITE_URL) selfHosts.push(new URL(process.env.SITE_URL).hostname.replace(/^www\./, ''));
    } catch (_) {}
    selfHosts.push('pirabellabs.com', 'localhost', '127.0.0.1');
    const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const selfHostRegex = new RegExp(selfHosts.map(escapeRe).join('|'), 'i');

    const grouped = await Session.aggregate([
      { $match: { startedAt: { $gte: start, $lte: end }, referrer: { $nin: [null, ''] } } },
      {
        $group: {
          _id: '$referrer',
          category: { $first: '$referrerCategory' },
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' },
          bounces: { $sum: { $cond: ['$isBounce', 1, 0] } },
          totalDuration: { $sum: '$duration' }
        }
      },
      { $sort: { visits: -1 } }
    ]);

    // Filter out self-referrals + aggregate by host (so all paths from
    // a single domain are merged into one bucket).
    const byHost = new Map();
    for (const row of grouped) {
      let host = '';
      try { host = new URL(row._id).hostname.replace(/^www\./, ''); } catch (_) { host = row._id; }
      if (selfHostRegex.test(host)) continue; // skip internal navigation
      if (!byHost.has(host)) {
        byHost.set(host, {
          source: host,
          referrer: host,
          category: row.category || categoriseReferrer(row._id),
          visits: 0,
          visitors: 0,
          uniqueVisitorsSet: new Set(),
          bounces: 0,
          totalDuration: 0
        });
      }
      const agg = byHost.get(host);
      agg.visits += row.visits;
      agg.bounces += row.bounces;
      agg.totalDuration += row.totalDuration;
      (row.uniqueVisitors || []).forEach(v => agg.uniqueVisitorsSet.add(v));
    }

    const referrers = Array.from(byHost.values())
      .map(r => ({
        source: r.source,
        referrer: r.referrer,
        category: r.category,
        visits: r.visits,
        visitors: r.uniqueVisitorsSet.size, // alias for the doughnut chart
        count: r.uniqueVisitorsSet.size,
        bounceRate: r.visits > 0 ? parseFloat(((r.bounces / r.visits) * 100).toFixed(1)) : 0,
        avgDuration: r.visits > 0 ? Math.round(r.totalDuration / r.visits) : 0
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, limit);

    // The frontend reads either `data.referrers` or the array directly,
    // so wrap to support both.
    res.json({ referrers, sources: referrers, list: referrers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 11) GET /api/analytics/devices
// ---------------------------------------------------------------
router.get('/devices', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const match = { lastSeen: { $gte: start, $lte: end }, isBot: { $ne: true } };

    const [devices, browsers, operatingSystems, screenResolutions] = await Promise.all([
      Visitor.aggregate([
        { $match: match },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Visitor.aggregate([
        { $match: { ...match, browser: { $ne: '' } } },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Visitor.aggregate([
        { $match: { ...match, os: { $ne: '' } } },
        { $group: { _id: '$os', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Visitor.aggregate([
        { $match: { ...match, screenResolution: { $ne: '' } } },
        { $group: { _id: '$screenResolution', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      devices: devices.map(d => ({ device: d._id || 'unknown', count: d.count })),
      browsers: browsers.map(b => ({ browser: b._id, count: b.count })),
      operatingSystems: operatingSystems.map(o => ({ os: o._id, count: o.count })),
      screenResolutions: screenResolutions.map(s => ({ resolution: s._id, count: s.count }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 12) GET /api/analytics/events-summary
// ---------------------------------------------------------------
router.get('/events-summary', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const match = { timestamp: { $gte: start, $lte: end } };

    const [eventsByCategory, clickHeatmap, conversionEvents, engagementMetrics] = await Promise.all([
      // Events grouped by category+action
      AnalyticsEvent.aggregate([
        { $match: match },
        { $group: { _id: { category: '$category', action: '$action' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 30 }
      ]),

      // Click heatmap data (top clicked positions)
      AnalyticsEvent.aggregate([
        { $match: { ...match, category: 'click' } },
        {
          $group: {
            _id: '$page',
            clicks: {
              $push: {
                x: '$meta.x', y: '$meta.y',
                tag: '$meta.tag', text: '$label'
              }
            },
            total: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 10 }
      ]),

      // Conversion events
      Conversion.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end } } },
        { $group: { _id: '$goal', count: { $sum: 1 }, totalValue: { $sum: '$value' } } },
        { $sort: { count: -1 } }
      ]),

      // Engagement metrics summary
      AnalyticsEvent.aggregate([
        { $match: { ...match, category: 'engagement' } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    const eventsList = eventsByCategory.map(e => ({
      category: e._id.category, action: e._id.action, count: e.count
    }));
    res.json({
      // Alias `events` consumed by analytics.html (loadEvents)
      events: eventsList,
      eventsByCategory: eventsList,
      clickHeatmap: clickHeatmap.map(p => ({
        page: p._id, totalClicks: p.total,
        clicks: (p.clicks || []).slice(0, 200) // limit points sent
      })),
      conversions: conversionEvents.map(c => ({
        goal: c._id, count: c.count, value: c.totalValue
      })),
      engagementMetrics: engagementMetrics.map(e => ({
        action: e._id, count: e.count
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 13) GET /api/analytics/engagement
// ---------------------------------------------------------------
router.get('/engagement', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);

    const [attentionDistribution, rageClickHotspots, scrollDistribution, engagementScores] = await Promise.all([
      // Attention time distribution (buckets)
      PageView.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end }, attentionTime: { $gt: 0 } } },
        {
          $bucket: {
            groupBy: '$attentionTime',
            boundaries: [0, 10, 30, 60, 120, 300, 600, Infinity],
            default: 'other',
            output: { count: { $sum: 1 } }
          }
        }
      ]),

      // Rage click hotspots
      AnalyticsEvent.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end }, category: 'engagement', action: 'rage_click' } },
        {
          $group: {
            _id: { page: '$page', tag: '$meta.tag' },
            count: { $sum: 1 },
            sampleX: { $first: '$meta.x' },
            sampleY: { $first: '$meta.y' },
            sampleText: { $first: '$meta.txt' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]),

      // Scroll depth distribution
      PageView.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end }, scrollDepth: { $gt: 0 } } },
        {
          $bucket: {
            groupBy: '$scrollDepth',
            boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, Infinity],
            default: 'other',
            output: { count: { $sum: 1 } }
          }
        }
      ]),

      // Session engagement score distribution
      Session.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end }, engagementScore: { $gt: 0 } } },
        {
          $bucket: {
            groupBy: '$engagementScore',
            boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, Infinity],
            default: 'other',
            output: { count: { $sum: 1 }, avgDuration: { $avg: '$duration' } }
          }
        }
      ])
    ]);

    // Dead click summary
    const deadClicks = await AnalyticsEvent.aggregate([
      { $match: { timestamp: { $gte: start, $lte: end }, category: 'engagement', action: 'dead_click' } },
      {
        $group: {
          _id: { page: '$page', tag: '$meta.tag' },
          count: { $sum: 1 },
          sampleText: { $first: '$meta.txt' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // ---- 5-axis radar metrics (0-100 each) ----
    const [avgTimeAgg, avgScrollAgg, totalClicksAgg, avgPagesAgg, returningCount, totalVisitorsCount] = await Promise.all([
      Session.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end }, duration: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$duration' } } }
      ]),
      PageView.aggregate([
        { $match: { timestamp: { $gte: start, $lte: end }, scrollDepth: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$scrollDepth' } } }
      ]),
      AnalyticsEvent.countDocuments({ timestamp: { $gte: start, $lte: end }, category: 'click' }),
      Session.aggregate([
        { $match: { startedAt: { $gte: start, $lte: end }, pageCount: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$pageCount' } } }
      ]),
      Visitor.countDocuments({ lastSeen: { $gte: start, $lte: end }, isReturning: true, isBot: { $ne: true } }),
      Visitor.countDocuments({ lastSeen: { $gte: start, $lte: end }, isBot: { $ne: true } })
    ]);

    const sessionsCount = await Session.countDocuments({ startedAt: { $gte: start, $lte: end } });
    const avgTimeSec = Math.round(avgTimeAgg[0]?.avg || 0);
    const avgScrollPct = Math.round(avgScrollAgg[0]?.avg || 0);
    const avgClicksPerSession = sessionsCount > 0 ? totalClicksAgg / sessionsCount : 0;
    const avgPages = avgPagesAgg[0]?.avg || 0;

    // Score everything 0-100
    const tempsScore  = Math.min(100, Math.round((avgTimeSec / 300) * 100));   // 5 min = 100
    const scrollScore = Math.min(100, avgScrollPct);                            // already %
    const clicsScore  = Math.min(100, Math.round((avgClicksPerSession / 10) * 100)); // 10 clicks/session = 100
    const pagesScore  = Math.min(100, Math.round((avgPages / 5) * 100));        // 5 pages = 100
    const retourScore = totalVisitorsCount > 0
      ? Math.round((returningCount / totalVisitorsCount) * 100)
      : 0;

    res.json({
      // Radar metrics (consumed by renderEngagementRadar)
      temps: tempsScore,
      scroll: scrollScore,
      clics: clicsScore,
      pagesSession: pagesScore,
      retour: retourScore,
      // Raw values for tooltips/cards
      raw: {
        avgTimeSec,
        avgScrollPct,
        avgClicksPerSession: parseFloat(avgClicksPerSession.toFixed(1)),
        avgPagesPerSession: parseFloat(avgPages.toFixed(1)),
        returningPercent: retourScore
      },
      // Existing detailed distributions
      attentionDistribution: attentionDistribution.map(b => ({
        bucket: b._id === 'other' ? '600+' : `${b._id}s`,
        count: b.count
      })),
      rageClickHotspots: rageClickHotspots.map(r => ({
        page: r._id.page, element: r._id.tag,
        count: r.count, x: r.sampleX, y: r.sampleY, text: r.sampleText
      })),
      deadClicks: deadClicks.map(d => ({
        page: d._id.page, element: d._id.tag,
        count: d.count, text: d.sampleText
      })),
      scrollDistribution: scrollDistribution.map(b => ({
        bucket: b._id === 'other' ? '100%' : `${b._id}%`,
        count: b.count
      })),
      engagementScores: engagementScores.map(b => ({
        bucket: b._id === 'other' ? '100' : b._id,
        count: b.count,
        avgDuration: Math.round(b.avgDuration || 0)
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 14) GET /api/analytics/conversions
// ---------------------------------------------------------------
router.get('/conversions', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const match = { timestamp: { $gte: start, $lte: end } };

    const [goalCompletions, totalSessions, attributionBySource] = await Promise.all([
      Conversion.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$goal',
            completions: { $sum: 1 },
            totalValue: { $sum: '$value' },
            uniqueVisitors: { $addToSet: '$visitorId' }
          }
        },
        { $sort: { completions: -1 } }
      ]),

      Session.countDocuments({ startedAt: { $gte: start, $lte: end } }),

      Conversion.aggregate([
        { $match: match },
        {
          $group: {
            _id: { goal: '$goal', source: '$referrerCategory' },
            count: { $sum: 1 },
            value: { $sum: '$value' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    // Build attribution map
    const attribution = {};
    attributionBySource.forEach(a => {
      if (!attribution[a._id.goal]) attribution[a._id.goal] = [];
      attribution[a._id.goal].push({
        source: a._id.source, conversions: a.count, value: a.value
      });
    });

    res.json({
      goals: goalCompletions.map(g => ({
        goal: g._id,
        completions: g.completions,
        totalValue: g.totalValue,
        uniqueVisitors: g.uniqueVisitors.length,
        conversionRate: totalSessions > 0
          ? parseFloat(((g.completions / totalSessions) * 100).toFixed(2))
          : 0,
        attribution: attribution[g._id] || []
      })),
      totalSessions,
      totalConversions: goalCompletions.reduce((s, g) => s + g.completions, 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 15) GET /api/analytics/visitor/:id — full visitor profile
// ---------------------------------------------------------------
router.get('/visitor/:id', auth, adminOnly, async (req, res) => {
  try {
    const vid = req.params.id;

    const [visitor, sessions, pageViews, events, conversions] = await Promise.all([
      Visitor.findOne({ visitorId: vid }).lean(),
      Session.find({ visitorId: vid }).sort({ startedAt: -1 }).limit(50).lean(),
      PageView.find({ visitorId: vid }).sort({ timestamp: -1 }).limit(200).lean(),
      AnalyticsEvent.find({ visitorId: vid }).sort({ timestamp: -1 }).limit(200).lean(),
      Conversion.find({ visitorId: vid }).sort({ timestamp: -1 }).limit(50).lean()
    ]);

    if (!visitor) return res.status(404).json({ error: 'Visitor not found' });

    // Build timeline (interleave all events chronologically)
    const timeline = [];
    pageViews.forEach(pv => timeline.push({ type: 'pageview', ts: pv.timestamp, data: { page: pv.page, title: pv.title, timeOnPage: pv.timeOnPage, scrollDepth: pv.scrollDepth } }));
    events.forEach(ev => timeline.push({ type: 'event', ts: ev.timestamp, data: { category: ev.category, action: ev.action, label: ev.label, page: ev.page } }));
    conversions.forEach(cv => timeline.push({ type: 'conversion', ts: cv.timestamp, data: { goal: cv.goal, page: cv.page, value: cv.value } }));
    timeline.sort((a, b) => new Date(b.ts) - new Date(a.ts));

    res.json({
      visitor,
      sessions,
      pageViews: pageViews.slice(0, 100),
      events: events.slice(0, 100),
      conversions,
      timeline: timeline.slice(0, 200)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// 16) GET /api/analytics/export — export as CSV
// ---------------------------------------------------------------
router.get('/export', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const format = req.query.format || 'csv';
    const type = req.query.type || 'pageviews'; // pageviews, events, sessions, visitors, conversions

    let rows = [];
    let headers = [];

    switch (type) {
      case 'visitors': {
        headers = ['visitorId','firstSeen','lastSeen','totalVisits','totalPageViews','totalTimeSpent','device','browser','os','language','referrer','referrerCategory','utmSource','utmMedium','utmCampaign','isReturning','isBot','engagementScore'];
        const visitors = await Visitor.find({ lastSeen: { $gte: start, $lte: end } }).lean();
        rows = visitors.map(v => headers.map(h => csvEscape(v[h])));
        break;
      }
      case 'sessions': {
        headers = ['sessionId','visitorId','startedAt','lastActivity','duration','attentionTime','pageCount','entryPage','exitPage','device','browser','os','referrer','referrerCategory','isBounce','engagementScore'];
        const sessions = await Session.find({ startedAt: { $gte: start, $lte: end } }).lean();
        rows = sessions.map(s => headers.map(h => csvEscape(s[h])));
        break;
      }
      case 'events': {
        headers = ['visitorId','sessionId','page','category','action','label','value','timestamp'];
        const events = await AnalyticsEvent.find({ timestamp: { $gte: start, $lte: end } }).sort({ timestamp: -1 }).limit(10000).lean();
        rows = events.map(e => headers.map(h => csvEscape(e[h])));
        break;
      }
      case 'conversions': {
        headers = ['visitorId','sessionId','goal','page','referrer','referrerCategory','utmSource','utmMedium','utmCampaign','value','timestamp'];
        const convs = await Conversion.find({ timestamp: { $gte: start, $lte: end } }).sort({ timestamp: -1 }).lean();
        rows = convs.map(c => headers.map(h => csvEscape(c[h])));
        break;
      }
      default: { // pageviews
        headers = ['visitorId','sessionId','page','title','referrer','timeOnPage','attentionTime','scrollDepth','lcp','fid','cls','rageClicks','deadClicks','isEntry','isExit','timestamp'];
        const pvs = await PageView.find({ timestamp: { $gte: start, $lte: end } }).sort({ timestamp: -1 }).limit(10000).lean();
        rows = pvs.map(pv => headers.map(h => csvEscape(pv[h])));
      }
    }

    if (format === 'csv') {
      const csv = [headers.join(',')].concat(rows.map(r => r.join(','))).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=pirabel_analytics_${type}_${new Date().toISOString().slice(0,10)}.csv`);
      return res.send(csv);
    }

    // JSON fallback
    res.json({ headers, rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function csvEscape(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// ============================================================
// GET /api/analytics/browsers — browser breakdown (standalone)
// ============================================================
router.get('/browsers', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const browsers = await Visitor.aggregate([
      { $match: { lastSeen: { $gte: start, $lte: end }, isBot: { $ne: true }, browser: { $exists: true, $ne: '' } } },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    res.json({ browsers: browsers.map(b => ({ browser: b._id || 'unknown', name: b._id || 'unknown', count: b.count })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// GET /api/analytics/funnel — conversion funnel
// ============================================================
router.get('/funnel', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const visitMatch = { lastSeen: { $gte: start, $lte: end }, isBot: { $ne: true } };
    const eventMatch = { timestamp: { $gte: start, $lte: end } };

    const [totalVisitors, engagedVisitors, interactions, leadEvents, conversions] = await Promise.all([
      Visitor.countDocuments(visitMatch),
      Visitor.countDocuments({ ...visitMatch, totalTimeSpent: { $gte: 10 } }),
      AnalyticsEvent.distinct('visitorId', { ...eventMatch, category: { $in: ['click', 'scroll', 'engagement'] } }).then(a => a.length),
      AnalyticsEvent.distinct('visitorId', { ...eventMatch, category: 'form' }).then(a => a.length),
      Conversion.countDocuments({ timestamp: { $gte: start, $lte: end } }).catch(() => 0)
    ]);

    const steps = [
      { label: 'Visiteurs', value: totalVisitors },
      { label: 'Engagement', value: engagedVisitors },
      { label: 'Interaction', value: interactions },
      { label: 'Lead', value: leadEvents },
      { label: 'Conversion', value: conversions }
    ];
    res.json({ steps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// GET /api/analytics/scroll-depth — scroll depth histogram
// ============================================================
router.get('/scroll-depth', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const views = await PageView.find({
      timestamp: { $gte: start, $lte: end },
      scrollDepth: { $gt: 0 }
    }).select('scrollDepth').lean();

    const buckets = [
      { depth: '0-10%', users: 0, min: 0, max: 10 },
      { depth: '10-20%', users: 0, min: 10, max: 20 },
      { depth: '20-30%', users: 0, min: 20, max: 30 },
      { depth: '30-40%', users: 0, min: 30, max: 40 },
      { depth: '40-50%', users: 0, min: 40, max: 50 },
      { depth: '50-60%', users: 0, min: 50, max: 60 },
      { depth: '60-70%', users: 0, min: 60, max: 70 },
      { depth: '70-80%', users: 0, min: 70, max: 80 },
      { depth: '80-90%', users: 0, min: 80, max: 90 },
      { depth: '90-100%', users: 0, min: 90, max: 101 }
    ];

    for (const v of views) {
      const d = v.scrollDepth || 0;
      // Count this user in every bucket up to their max depth (cumulative histogram)
      for (const b of buckets) {
        if (d >= b.min) b.users++;
      }
    }

    res.json({ depths: buckets.map(b => ({ depth: b.depth, users: b.users })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// GET /api/analytics/behavior — aggregate click / rage / scroll stats
// ============================================================
router.get('/behavior', auth, adminOnly, async (req, res) => {
  try {
    const { start, end } = getDateRange(req.query);
    const pageMatch = { timestamp: { $gte: start, $lte: end } };
    const evtMatch = { timestamp: { $gte: start, $lte: end } };

    const [clickAgg, rageAgg, deadAgg, scrollAgg] = await Promise.all([
      AnalyticsEvent.countDocuments({ ...evtMatch, category: 'click' }),
      PageView.aggregate([{ $match: pageMatch }, { $group: { _id: null, total: { $sum: '$rageClicks' } } }]),
      PageView.aggregate([{ $match: pageMatch }, { $group: { _id: null, total: { $sum: '$deadClicks' } } }]),
      PageView.aggregate([{ $match: { ...pageMatch, scrollDepth: { $gt: 0 } } }, { $group: { _id: null, avg: { $avg: '$scrollDepth' } } }])
    ]);

    res.json({
      totalClicks: clickAgg || 0,
      rageClicks: rageAgg[0]?.total || 0,
      deadClicks: deadAgg[0]?.total || 0,
      avgScroll: Math.round(scrollAgg[0]?.avg || 0)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
