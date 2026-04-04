const mongoose = require('mongoose');

// ============================================================
// VISITOR — one record per unique browser/device
// ============================================================
const visitorSchema = new mongoose.Schema({
  visitorId:      { type: String, required: true, unique: true, index: true },
  firstSeen:      { type: Date, default: Date.now },
  lastSeen:       { type: Date, default: Date.now },
  totalVisits:    { type: Number, default: 1 },
  totalPageViews: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 }, // seconds
  totalAttentionTime: { type: Number, default: 0 }, // seconds (tab visible + active)
  device:         { type: String, default: 'desktop' },
  browser:        { type: String, default: '' },
  browserVersion: { type: String, default: '' },
  os:             { type: String, default: '' },
  osVersion:      { type: String, default: '' },
  language:       { type: String, default: '' },
  timezone:       { type: String, default: '' },
  screenResolution: { type: String, default: '' },
  connectionType: { type: String, default: '' },
  country:        { type: String, default: '' },
  city:           { type: String, default: '' },
  referrer:       { type: String, default: '' },
  referrerCategory: { type: String, enum: ['direct', 'organic', 'social', 'email', 'paid', 'referral', 'unknown'], default: 'unknown' },
  utmSource:      { type: String, default: '' },
  utmMedium:      { type: String, default: '' },
  utmCampaign:    { type: String, default: '' },
  utmTerm:        { type: String, default: '' },
  utmContent:     { type: String, default: '' },
  entryPage:      { type: String, default: '' },
  isReturning:    { type: Boolean, default: false },
  isBot:          { type: Boolean, default: false },
  searchQuery:    { type: String, default: '' }, // search query that led to the site
  engagementScore: { type: Number, default: 0 }
});
visitorSchema.index({ lastSeen: -1 });
visitorSchema.index({ firstSeen: -1 });
visitorSchema.index({ referrerCategory: 1 });

// ============================================================
// SESSION — one record per 30-min-timeout session
// ============================================================
const sessionSchema = new mongoose.Schema({
  sessionId:    { type: String, required: true, unique: true, index: true },
  visitorId:    { type: String, required: true, index: true },
  startedAt:    { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  duration:     { type: Number, default: 0 }, // seconds
  attentionTime:{ type: Number, default: 0 },
  pageCount:    { type: Number, default: 0 },
  entryPage:    { type: String, default: '' },
  exitPage:     { type: String, default: '' },
  device:       { type: String, default: '' },
  browser:      { type: String, default: '' },
  os:           { type: String, default: '' },
  referrer:     { type: String, default: '' },
  referrerCategory: { type: String, default: 'unknown' },
  utmSource:    { type: String, default: '' },
  utmMedium:    { type: String, default: '' },
  utmCampaign:  { type: String, default: '' },
  isBounce:     { type: Boolean, default: true },
  engagementScore: { type: Number, default: 0 },
  conversions:  [{ goal: String, timestamp: Date, value: Number }]
});
sessionSchema.index({ lastActivity: -1 });
sessionSchema.index({ startedAt: -1 });

// ============================================================
// PAGE VIEW — one record per page load
// ============================================================
const pageViewSchema = new mongoose.Schema({
  visitorId:   { type: String, required: true, index: true },
  sessionId:   { type: String, required: true, index: true },
  page:        { type: String, required: true },
  fullUrl:     { type: String, default: '' },
  title:       { type: String, default: '' },
  referrer:    { type: String, default: '' },
  timeOnPage:  { type: Number, default: 0 },
  attentionTime: { type: Number, default: 0 },
  scrollDepth: { type: Number, default: 0 },
  isEntry:     { type: Boolean, default: false },
  isExit:      { type: Boolean, default: false },
  isBounce:    { type: Boolean, default: false },
  // Web Vitals
  lcp:         { type: Number, default: 0 }, // Largest Contentful Paint (ms)
  fid:         { type: Number, default: 0 }, // First Input Delay (ms)
  cls:         { type: Number, default: 0 }, // Cumulative Layout Shift
  // Engagement
  scrollMilestones: [Number], // e.g. [10, 20, 30, ...]
  rageClicks:  { type: Number, default: 0 },
  deadClicks:  { type: Number, default: 0 },
  timestamp:   { type: Date, default: Date.now }
});
pageViewSchema.index({ timestamp: -1 });
pageViewSchema.index({ page: 1, timestamp: -1 });

// ============================================================
// ANALYTICS EVENT — clicks, forms, scrolls, custom events, etc.
// ============================================================
const eventSchema = new mongoose.Schema({
  visitorId:  { type: String, required: true, index: true },
  sessionId:  { type: String, required: true, index: true },
  page:       { type: String, default: '' },
  category:   { type: String, required: true }, // click, form, scroll, engagement, conversion, custom, error, print, copy, selection, keyboard, visibility, heatmap
  action:     { type: String, required: true },
  label:      { type: String, default: '' },
  value:      { type: Number, default: 0 },
  meta:       { type: mongoose.Schema.Types.Mixed, default: {} }, // additional context: position, element, etc.
  timestamp:  { type: Date, default: Date.now }
});
eventSchema.index({ timestamp: -1 });
eventSchema.index({ category: 1, action: 1 });
eventSchema.index({ category: 1, timestamp: -1 });

// ============================================================
// HEATMAP DATA — sampled mouse positions (stored in bulk)
// ============================================================
const heatmapSchema = new mongoose.Schema({
  visitorId: { type: String, required: true },
  sessionId: { type: String, required: true },
  page:      { type: String, required: true, index: true },
  points:    [{ x: Number, y: Number, ts: Number }], // relative coords, timestamp offset
  timestamp: { type: Date, default: Date.now }
});
heatmapSchema.index({ page: 1, timestamp: -1 });

// ============================================================
// CONVERSION — goal completions
// ============================================================
const conversionSchema = new mongoose.Schema({
  visitorId:  { type: String, required: true, index: true },
  sessionId:  { type: String, required: true },
  goal:       { type: String, required: true, index: true }, // form_submit, chat_open, cta_click, phone_click
  page:       { type: String, default: '' },
  referrer:   { type: String, default: '' },
  referrerCategory: { type: String, default: 'unknown' },
  utmSource:  { type: String, default: '' },
  utmMedium:  { type: String, default: '' },
  utmCampaign:{ type: String, default: '' },
  value:      { type: Number, default: 0 },
  timestamp:  { type: Date, default: Date.now }
});
conversionSchema.index({ goal: 1, timestamp: -1 });
conversionSchema.index({ timestamp: -1 });

// ============================================================
// DAILY STAT — pre-computed daily aggregates
// ============================================================
const dailyStatSchema = new mongoose.Schema({
  date:       { type: Date, required: true, unique: true },
  visitors:   { type: Number, default: 0 },
  newVisitors:      { type: Number, default: 0 },
  returningVisitors:{ type: Number, default: 0 },
  pageViews:        { type: Number, default: 0 },
  sessions:         { type: Number, default: 0 },
  avgTimeOnSite:    { type: Number, default: 0 },
  avgAttentionTime: { type: Number, default: 0 },
  avgPagesPerSession: { type: Number, default: 0 },
  bounceRate:       { type: Number, default: 0 },
  engagementRate:   { type: Number, default: 0 },
  topPages:     [{ page: String, views: Number }],
  topReferrers: [{ referrer: String, count: Number }],
  deviceBreakdown: {
    desktop: { type: Number, default: 0 },
    mobile:  { type: Number, default: 0 },
    tablet:  { type: Number, default: 0 }
  },
  conversions:  { type: Number, default: 0 },
  totalEvents:  { type: Number, default: 0 }
});

const Visitor       = mongoose.model('Visitor', visitorSchema);
const Session       = mongoose.model('Session', sessionSchema);
const PageView      = mongoose.model('PageView', pageViewSchema);
const AnalyticsEvent= mongoose.model('AnalyticsEvent', eventSchema);
const HeatmapData   = mongoose.model('HeatmapData', heatmapSchema);
const Conversion    = mongoose.model('Conversion', conversionSchema);
const DailyStat     = mongoose.model('DailyStat', dailyStatSchema);

module.exports = { Visitor, Session, PageView, AnalyticsEvent, HeatmapData, Conversion, DailyStat };
