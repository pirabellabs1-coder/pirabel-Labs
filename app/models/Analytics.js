const mongoose = require('mongoose');

// Track each unique visitor session
const visitorSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, index: true }, // Unique cookie ID
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  totalVisits: { type: Number, default: 1 },
  totalPageViews: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 }, // seconds
  device: { type: String, enum: ['desktop', 'tablet', 'mobile'], default: 'desktop' },
  browser: { type: String, default: '' },
  os: { type: String, default: '' },
  language: { type: String, default: '' },
  country: { type: String, default: '' },
  city: { type: String, default: '' },
  referrer: { type: String, default: '' },
  utmSource: { type: String, default: '' },
  utmMedium: { type: String, default: '' },
  utmCampaign: { type: String, default: '' },
  isReturning: { type: Boolean, default: false }
});
visitorSchema.index({ lastSeen: -1 });
visitorSchema.index({ firstSeen: -1 });

// Track each page view
const pageViewSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  page: { type: String, required: true },
  title: { type: String, default: '' },
  referrer: { type: String, default: '' },
  timeOnPage: { type: Number, default: 0 }, // seconds
  scrollDepth: { type: Number, default: 0 }, // percentage 0-100
  timestamp: { type: Date, default: Date.now }
});
pageViewSchema.index({ timestamp: -1 });
pageViewSchema.index({ page: 1 });

// Track specific events (clicks, form submissions, etc.)
const eventSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  sessionId: { type: String, required: true },
  page: { type: String, default: '' },
  category: { type: String, required: true }, // 'click', 'form', 'scroll', 'cta', 'chat', 'newsletter'
  action: { type: String, required: true }, // 'submit', 'click_cta', 'open_chat', etc.
  label: { type: String, default: '' }, // Additional context
  value: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});
eventSchema.index({ timestamp: -1 });
eventSchema.index({ category: 1 });

// Daily aggregated stats (pre-computed for fast dashboard)
const dailyStatSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  visitors: { type: Number, default: 0 },
  newVisitors: { type: Number, default: 0 },
  returningVisitors: { type: Number, default: 0 },
  pageViews: { type: Number, default: 0 },
  sessions: { type: Number, default: 0 },
  avgTimeOnSite: { type: Number, default: 0 },
  avgPagesPerSession: { type: Number, default: 0 },
  bounceRate: { type: Number, default: 0 },
  topPages: [{ page: String, views: Number }],
  topReferrers: [{ referrer: String, count: Number }],
  deviceBreakdown: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 }
  }
});

const Visitor = mongoose.model('Visitor', visitorSchema);
const PageView = mongoose.model('PageView', pageViewSchema);
const AnalyticsEvent = mongoose.model('AnalyticsEvent', eventSchema);
const DailyStat = mongoose.model('DailyStat', dailyStatSchema);

module.exports = { Visitor, PageView, AnalyticsEvent, DailyStat };
