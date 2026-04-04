/**
 * PIRABEL LABS — Comprehensive Analytics Tracker v2.0
 *
 * Tracks: page views, time-on-page, attention time, scroll depth (10% milestones),
 * Web Vitals (LCP / FID / CLS), all clicks (with element info & position),
 * mouse-movement heatmap, form interactions, text selection, copy/paste,
 * right-click, keyboard shortcuts, rage clicks, dead clicks, error clicks,
 * scroll velocity, tab visibility, print events, bot detection,
 * conversion goals, referrer categorisation, search-query extraction,
 * session engagement scoring, and a public custom-event API.
 *
 * Transport: sendBeacon with batched payloads every 5 s, offline queue,
 * requestIdleCallback scheduling, DNT respect.
 */
(function () {
  'use strict';

  // ================================================================
  // CONFIGURATION
  // ================================================================
  var API           = window.PIRABEL_API || 'http://localhost:3000';
  var BATCH_INTERVAL = 5000;      // flush queue every 5 s
  var HEATMAP_SAMPLE = 500;       // mouse-position sample interval (ms)
  var SESSION_TTL    = 30 * 60 * 1000; // 30 min session timeout
  var MAX_BATCH      = 50;        // max events per batch
  var MAX_PAYLOAD    = 64000;     // ~64 KB cap per beacon
  var SCROLL_MILESTONE_STEP = 10; // fire every 10 %

  // ================================================================
  // DO-NOT-TRACK / BOT GUARD
  // ================================================================
  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  if (dnt) return; // respect DNT

  // ================================================================
  // HELPERS
  // ================================================================
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  function now() { return Date.now(); }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function truncate(s, n) {
    if (typeof s !== 'string') return '';
    return s.length > n ? s.substring(0, n) : s;
  }

  function safeJSON(obj) {
    try { return JSON.stringify(obj); } catch (e) { return '{}'; }
  }

  // schedule work in idle time; fall back to setTimeout
  var idle = window.requestIdleCallback
    ? function (fn) { requestIdleCallback(fn, { timeout: 2000 }); }
    : function (fn) { setTimeout(fn, 0); };

  // ================================================================
  // VISITOR & SESSION
  // ================================================================
  function getVisitorId() {
    var id = null;
    try { id = localStorage.getItem('_pl_vid'); } catch (e) {}
    if (!id) {
      id = 'v_' + uid();
      try { localStorage.setItem('_pl_vid', id); } catch (e) {}
    }
    return id;
  }

  function getVisitCount() {
    var c = 0;
    try { c = parseInt(localStorage.getItem('_pl_vc') || '0', 10); } catch (e) {}
    return c;
  }
  function incrVisitCount() {
    var c = getVisitCount() + 1;
    try { localStorage.setItem('_pl_vc', String(c)); } catch (e) {}
    return c;
  }

  function getSessionId() {
    var t = now();
    var sid = null;
    var last = 0;
    try {
      sid  = sessionStorage.getItem('_pl_sid');
      last = parseInt(sessionStorage.getItem('_pl_last') || '0', 10);
    } catch (e) {}

    if (!sid || (t - last) > SESSION_TTL) {
      sid = 's_' + uid();
      try {
        sessionStorage.setItem('_pl_sid', sid);
        sessionStorage.setItem('_pl_new', '1');
      } catch (e) {}
      isNewSession = true;
    }
    try { sessionStorage.setItem('_pl_last', String(t)); } catch (e) {}
    return sid;
  }

  function isFirstVisit() {
    return getVisitCount() <= 1;
  }

  var visitorId    = getVisitorId();
  var visitCount   = incrVisitCount();
  var isNewSession = false;
  var sessionId    = getSessionId();
  var pageStart    = now();
  var firstInteractionTime = 0;

  // ================================================================
  // DEVICE / BROWSER / OS DETECTION
  // ================================================================
  function parseUA() {
    var ua = navigator.userAgent || '';
    var browser = 'Other', bv = '', os = 'Other', osv = '', device = 'desktop';
    var m;

    // Browser
    if ((m = ua.match(/Edg(?:e|A|iOS)?\/(\S+)/)))         { browser = 'Edge'; bv = m[1]; }
    else if ((m = ua.match(/OPR\/(\S+)/)))                  { browser = 'Opera'; bv = m[1]; }
    else if ((m = ua.match(/Chrome\/(\S+)/)))                { browser = 'Chrome'; bv = m[1]; }
    else if ((m = ua.match(/Firefox\/(\S+)/)))               { browser = 'Firefox'; bv = m[1]; }
    else if ((m = ua.match(/Version\/(\S+).*Safari/)))       { browser = 'Safari'; bv = m[1]; }
    else if ((m = ua.match(/MSIE\s(\S+)/)))                  { browser = 'IE'; bv = m[1]; }
    else if ((m = ua.match(/Trident.*rv:(\S+)/)))            { browser = 'IE'; bv = m[1]; }

    // OS
    if ((m = ua.match(/Windows NT (\d+\.\d+)/)))            { os = 'Windows'; osv = m[1]; }
    else if ((m = ua.match(/Mac OS X ([\d_.]+)/)))           { os = 'macOS'; osv = m[1].replace(/_/g, '.'); }
    else if (/Android/.test(ua))                              { os = 'Android'; m = ua.match(/Android ([\d.]+)/); osv = m ? m[1] : ''; }
    else if (/iPhone|iPad|iPod/.test(ua))                     { os = 'iOS'; m = ua.match(/OS ([\d_]+)/); osv = m ? m[1].replace(/_/g, '.') : ''; }
    else if (/Linux/.test(ua))                                { os = 'Linux'; }
    else if (/CrOS/.test(ua))                                 { os = 'ChromeOS'; }

    // Device
    if (/Mobi|Android.*Mobile|iPhone|iPod/.test(ua))          device = 'mobile';
    else if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua))      device = 'tablet';

    return { browser: browser, browserVersion: bv.split('.')[0], os: os, osVersion: osv, device: device };
  }

  var uaInfo = parseUA();

  function getScreenRes() {
    return screen.width + 'x' + screen.height;
  }

  function getConnectionType() {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return c ? (c.effectiveType || c.type || '') : '';
  }

  function getTimezone() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; }
  }

  // ================================================================
  // REFERRER CATEGORISATION & SEARCH QUERY
  // ================================================================
  var SOCIAL_DOMAINS  = ['facebook.com','fb.com','t.co','twitter.com','x.com','linkedin.com','instagram.com','pinterest.com','reddit.com','youtube.com','tiktok.com','snapchat.com','threads.net'];
  var SEARCH_ENGINES  = { 'google': 'q', 'bing': 'q', 'yahoo': 'p', 'duckduckgo': 'q', 'baidu': 'wd', 'yandex': 'text', 'ecosia': 'q', 'qwant': 'q' };
  var EMAIL_DOMAINS   = ['mail.google.com','outlook.live.com','mail.yahoo.com'];

  function categoriseReferrer(ref) {
    if (!ref) return { category: 'direct', searchQuery: '' };
    var host = '';
    try { host = new URL(ref).hostname.replace(/^www\./, ''); } catch (e) { return { category: 'referral', searchQuery: '' }; }

    // Same-site
    if (host === location.hostname.replace(/^www\./, '')) return { category: 'direct', searchQuery: '' };

    // Paid (utm_medium contains cpc/ppc/paid)
    var urlMedium = getParam('utm_medium');
    if (/cpc|ppc|paid|paidsocial|display/i.test(urlMedium)) return { category: 'paid', searchQuery: '' };

    // Email
    if (EMAIL_DOMAINS.some(function (d) { return host.indexOf(d) !== -1; }) || /email|newsletter/i.test(urlMedium)) {
      return { category: 'email', searchQuery: '' };
    }

    // Social
    if (SOCIAL_DOMAINS.some(function (d) { return host.indexOf(d) !== -1; })) return { category: 'social', searchQuery: '' };

    // Organic search
    var searchQuery = '';
    for (var engine in SEARCH_ENGINES) {
      if (host.indexOf(engine) !== -1) {
        try { searchQuery = new URL(ref).searchParams.get(SEARCH_ENGINES[engine]) || ''; } catch (e) {}
        return { category: 'organic', searchQuery: searchQuery };
      }
    }

    return { category: 'referral', searchQuery: '' };
  }

  // ================================================================
  // URL PARAMETERS
  // ================================================================
  function getParam(name) {
    try { return new URL(location.href).searchParams.get(name) || ''; } catch (e) { return ''; }
  }

  function getAllParams() {
    var params = {};
    try {
      new URL(location.href).searchParams.forEach(function (v, k) { params[k] = v; });
    } catch (e) {}
    return params;
  }

  function getPage() { return location.pathname + location.search; }

  // ================================================================
  // BOT DETECTION
  // ================================================================
  function detectBot() {
    var ua = navigator.userAgent || '';
    // Only block automation tools, NOT search engine crawlers
    // Allow: Googlebot, Bingbot, bingpreview, Yandexbot, Baiduspider,
    //        DuckDuckBot, Slurp, facebookexternalhit, mediapartners, lighthouse, etc.
    if (/headless|phantomjs|puppeteer|selenium|webdriver|playwright/i.test(ua)) return true;
    if (navigator.webdriver) return true;
    if (/HeadlessChrome/.test(ua)) return true;
    return false;
  }

  var isBot = detectBot();

  // ================================================================
  // EVENT QUEUE & TRANSPORT
  // ================================================================
  var queue = [];
  var offlineQueue = [];

  function enqueue(type, data) {
    if (isBot) return; // silently drop bot events
    queue.push({
      vid: visitorId,
      sid: sessionId,
      ts:  now(),
      type: type,
      data: data
    });
  }

  function flush() {
    if (queue.length === 0) return;

    // Take up to MAX_BATCH
    var batch = queue.splice(0, MAX_BATCH);
    var payload = safeJSON(batch);

    // Enforce max payload size
    if (payload.length > MAX_PAYLOAD) {
      // Split in half and re-queue remainder
      var half = Math.floor(batch.length / 2);
      queue = batch.slice(half).concat(queue);
      batch = batch.slice(0, half);
      payload = safeJSON(batch);
    }

    if (!navigator.onLine) {
      offlineQueue = offlineQueue.concat(batch);
      return;
    }

    sendPayload(payload);
  }

  function sendPayload(payload) {
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'application/json' });
        var ok = navigator.sendBeacon(API + '/api/analytics/batch', blob);
        if (!ok) fetchFallback(payload);
      } else {
        fetchFallback(payload);
      }
    } catch (e) {
      // swallow — analytics should never break the page
    }
  }

  function fetchFallback(payload) {
    try {
      fetch(API + '/api/analytics/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  // Legacy single-event send (used for session init for backwards compat)
  function sendLegacy(endpoint, data) {
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([safeJSON(data)], { type: 'application/json' });
        navigator.sendBeacon(API + endpoint, blob);
      } else {
        fetch(API + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: safeJSON(data),
          keepalive: true
        }).catch(function () {});
      }
    } catch (e) {}
  }

  // Online/offline handling
  window.addEventListener('online', function () {
    if (offlineQueue.length > 0) {
      queue = offlineQueue.concat(queue);
      offlineQueue = [];
      flush();
    }
  });

  // Periodic flush
  var flushTimer = setInterval(function () {
    idle(flush);
  }, BATCH_INTERVAL);

  // ================================================================
  // WEB VITALS (LCP, FID, CLS) via PerformanceObserver
  // ================================================================
  var webVitals = { lcp: 0, fid: 0, cls: 0 };

  function observeVitals() {
    try {
      // LCP
      if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.indexOf('largest-contentful-paint') !== -1) {
        var lcpObs = new PerformanceObserver(function (list) {
          var entries = list.getEntries();
          if (entries.length) webVitals.lcp = Math.round(entries[entries.length - 1].startTime);
        });
        lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
      }

      // FID
      if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.indexOf('first-input') !== -1) {
        var fidObs = new PerformanceObserver(function (list) {
          var entries = list.getEntries();
          if (entries.length) webVitals.fid = Math.round(entries[0].processingStart - entries[0].startTime);
        });
        fidObs.observe({ type: 'first-input', buffered: true });
      }

      // CLS
      if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.indexOf('layout-shift') !== -1) {
        var clsVal = 0;
        var clsObs = new PerformanceObserver(function (list) {
          list.getEntries().forEach(function (entry) {
            if (!entry.hadRecentInput) clsVal += entry.value;
          });
          webVitals.cls = parseFloat(clsVal.toFixed(4));
        });
        clsObs.observe({ type: 'layout-shift', buffered: true });
      }
    } catch (e) {}
  }
  observeVitals();

  // ================================================================
  // PAGE VIEW TRACKING
  // ================================================================
  var refInfo = categoriseReferrer(document.referrer);

  function trackPageView() {
    var allParams = getAllParams();

    enqueue('pageview', {
      p:    getPage(),
      url:  location.href,
      t:    truncate(document.title, 200),
      ref:  truncate(document.referrer, 500),
      rc:   refInfo.category,
      sq:   refInfo.searchQuery,
      dv:   uaInfo.device,
      br:   uaInfo.browser,
      bv:   uaInfo.browserVersion,
      os:   uaInfo.os,
      ov:   uaInfo.osVersion,
      lang: navigator.language || '',
      tz:   getTimezone(),
      sr:   getScreenRes(),
      ct:   getConnectionType(),
      us:   getParam('utm_source'),
      um:   getParam('utm_medium'),
      uc:   getParam('utm_campaign'),
      ut:   getParam('utm_term'),
      uco:  getParam('utm_content'),
      qp:   allParams,
      new:  isFirstVisit() ? 1 : 0,
      vc:   visitCount,
      ns:   isNewSession ? 1 : 0,
      bot:  isBot ? 1 : 0
    });

    // Legacy endpoint for backwards compat
    sendLegacy('/api/analytics/track', {
      visitorId: visitorId,
      sessionId: sessionId,
      page: getPage(),
      title: document.title,
      referrer: document.referrer,
      device: uaInfo.device,
      browser: uaInfo.browser,
      browserVersion: uaInfo.browserVersion,
      os: uaInfo.os,
      osVersion: uaInfo.osVersion,
      language: navigator.language || '',
      timezone: getTimezone(),
      screenResolution: getScreenRes(),
      connectionType: getConnectionType(),
      referrerCategory: refInfo.category,
      searchQuery: refInfo.searchQuery,
      utmSource: getParam('utm_source'),
      utmMedium: getParam('utm_medium'),
      utmCampaign: getParam('utm_campaign'),
      utmTerm: getParam('utm_term'),
      utmContent: getParam('utm_content'),
      isNewVisitor: isFirstVisit(),
      visitCount: visitCount,
      isBot: isBot
    });

    // New session legacy call
    if (isNewSession) {
      sendLegacy('/api/analytics/session', { visitorId: visitorId });
    }
  }

  idle(trackPageView);

  // ================================================================
  // TIME ON PAGE — precise (visibility-aware)
  // ================================================================
  var timeVisible   = 0;
  var lastVisible   = document.hidden ? 0 : now();
  var tabVisible    = !document.hidden;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (lastVisible) timeVisible += now() - lastVisible;
      lastVisible = 0;
      tabVisible = false;
      enqueue('engagement', { a: 'tab_hidden', p: getPage() });
    } else {
      lastVisible = now();
      tabVisible = true;
      enqueue('engagement', { a: 'tab_visible', p: getPage() });
    }
  });

  function getPreciseTime() {
    var t = timeVisible;
    if (tabVisible && lastVisible) t += now() - lastVisible;
    return Math.round(t / 1000);
  }

  // ================================================================
  // ATTENTION TIME — tab visible AND mouse/keyboard active within 30 s
  // ================================================================
  var attentionTime   = 0;
  var lastAttention   = now();
  var lastInputTime   = now();
  var ATTENTION_IDLE  = 30000; // 30 s without input = inattentive
  var attentionTick   = setInterval(function () {
    var t = now();
    if (tabVisible && (t - lastInputTime) < ATTENTION_IDLE) {
      attentionTime += 1; // seconds
    }
  }, 1000);

  function touchInput() { lastInputTime = now(); }
  document.addEventListener('mousemove', touchInput, { passive: true });
  document.addEventListener('keydown', touchInput, { passive: true });
  document.addEventListener('scroll', touchInput, { passive: true });
  document.addEventListener('touchstart', touchInput, { passive: true });

  // ================================================================
  // SCROLL DEPTH — every 10 % milestone
  // ================================================================
  var maxScroll = 0;
  var scrollMilestones = {};
  var lastScrollY = 0;
  var lastScrollTime = now();
  var scrollDirectionChanges = 0;
  var lastScrollDir = 0; // 1 = down, -1 = up

  function getScrollPercent() {
    var docH = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight
    );
    var winH = window.innerHeight;
    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (docH <= winH) return 100;
    return Math.round((scrollTop / (docH - winH)) * 100);
  }

  window.addEventListener('scroll', function () {
    var pct = getScrollPercent();
    var curY = window.scrollY || 0;
    var t = now();

    // Direction changes
    var dir = curY > lastScrollY ? 1 : (curY < lastScrollY ? -1 : 0);
    if (dir !== 0 && dir !== lastScrollDir) {
      if (lastScrollDir !== 0) scrollDirectionChanges++;
      lastScrollDir = dir;
    }

    // Scroll velocity (px/ms)
    var dt = t - lastScrollTime;
    var vel = dt > 0 ? Math.abs(curY - lastScrollY) / dt : 0;

    lastScrollY = curY;
    lastScrollTime = t;

    if (pct > maxScroll) maxScroll = pct;

    // Fire milestone every 10 %
    for (var m = SCROLL_MILESTONE_STEP; m <= 100; m += SCROLL_MILESTONE_STEP) {
      if (pct >= m && !scrollMilestones[m]) {
        scrollMilestones[m] = true;
        enqueue('scroll', { m: m, p: getPage(), v: parseFloat(vel.toFixed(3)) });
      }
    }
  }, { passive: true });

  // ================================================================
  // VIEWPORT VISIBILITY TRACKING (IntersectionObserver)
  // ================================================================
  function trackViewportVisibility() {
    try {
      var sections = document.querySelectorAll('section, [data-track-view]');
      if (!sections.length || !window.IntersectionObserver) return;

      var seenSections = {};
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id || entry.target.dataset.trackView || entry.target.tagName + '_' + Array.prototype.indexOf.call(entry.target.parentNode.children, entry.target);
            if (!seenSections[id]) {
              seenSections[id] = true;
              enqueue('engagement', { a: 'section_view', l: id, p: getPage() });
            }
          }
        });
      }, { threshold: 0.5 });

      sections.forEach(function (s) { observer.observe(s); });
    } catch (e) {}
  }
  idle(trackViewportVisibility);

  // ================================================================
  // CLICK TRACKING — ALL clicks
  // ================================================================
  var clickTimes = []; // for rage-click detection
  var RAGE_THRESHOLD = 3;
  var RAGE_WINDOW    = 1500; // ms
  var rageClickCount = 0;
  var deadClickCount = 0;

  document.addEventListener('click', function (e) {
    var t = now();

    // First interaction
    if (!firstInteractionTime) firstInteractionTime = t - pageStart;

    var el = e.target;
    var tag = (el.tagName || '').toLowerCase();
    var text = truncate((el.textContent || '').trim(), 100);
    var href = '';
    var classes = truncate(el.className || '', 200);
    if (typeof classes !== 'string') classes = '';
    var closest = el.closest ? (el.closest('a') || el.closest('button')) : null;

    if (closest) {
      tag = closest.tagName.toLowerCase();
      href = truncate(closest.href || closest.getAttribute('href') || '', 500);
      text = truncate((closest.textContent || '').trim(), 100);
      classes = truncate(closest.className || '', 200);
      if (typeof classes !== 'string') classes = '';
    }

    // Click event
    enqueue('click', {
      tag: tag,
      txt: text,
      hr:  href,
      cls: classes,
      x:   Math.round(e.pageX),
      y:   Math.round(e.pageY),
      cx:  Math.round(e.clientX),
      cy:  Math.round(e.clientY),
      p:   getPage()
    });

    // Rage click detection
    clickTimes.push({ t: t, x: e.pageX, y: e.pageY });
    clickTimes = clickTimes.filter(function (c) { return t - c.t < RAGE_WINDOW; });
    if (clickTimes.length >= RAGE_THRESHOLD) {
      // Check proximity — within 30 px
      var first = clickTimes[0];
      var allClose = clickTimes.every(function (c) {
        return Math.abs(c.x - first.x) < 30 && Math.abs(c.y - first.y) < 30;
      });
      if (allClose) {
        rageClickCount++;
        enqueue('engagement', {
          a: 'rage_click',
          x: Math.round(e.pageX),
          y: Math.round(e.pageY),
          tag: tag,
          txt: text,
          p: getPage()
        });
        clickTimes = []; // reset after detecting
      }
    }

    // Dead click detection — click on element that is not interactive
    var isInteractive = el.closest ? !!(el.closest('a, button, input, select, textarea, label, [role="button"], [onclick], [tabindex]')) : false;
    if (!isInteractive && tag !== 'a' && tag !== 'button') {
      deadClickCount++;
      enqueue('engagement', {
        a: 'dead_click',
        tag: (el.tagName || '').toLowerCase(),
        txt: truncate((el.textContent || '').trim(), 60),
        x: Math.round(e.pageX),
        y: Math.round(e.pageY),
        p: getPage()
      });
    }

    // Conversion checks
    checkClickConversion(e, closest || el);

  }, { capture: true });

  // ================================================================
  // RIGHT-CLICK TRACKING
  // ================================================================
  document.addEventListener('contextmenu', function (e) {
    enqueue('click', {
      a:   'right_click',
      tag: (e.target.tagName || '').toLowerCase(),
      x:   Math.round(e.pageX),
      y:   Math.round(e.pageY),
      p:   getPage()
    });
  });

  // ================================================================
  // MOUSE MOVEMENT HEATMAP
  // ================================================================
  var heatmapPoints = [];
  var heatmapInterval = setInterval(function () {
    // Sampling is done via the mousemove listener updating lastMousePos
  }, HEATMAP_SAMPLE);

  var lastMousePos = null;
  document.addEventListener('mousemove', function (e) {
    lastMousePos = { x: e.pageX, y: e.pageY };
  }, { passive: true });

  // Sample mouse position every HEATMAP_SAMPLE ms
  setInterval(function () {
    if (lastMousePos && tabVisible) {
      heatmapPoints.push({
        x: Math.round(lastMousePos.x),
        y: Math.round(lastMousePos.y),
        ts: now() - pageStart
      });
      // Cap at 500 points per flush, then send
      if (heatmapPoints.length >= 500) {
        flushHeatmap();
      }
    }
  }, HEATMAP_SAMPLE);

  function flushHeatmap() {
    if (heatmapPoints.length === 0) return;
    var pts = heatmapPoints.splice(0, 500);
    enqueue('heatmap', { pts: pts, p: getPage() });
  }

  // ================================================================
  // FORM INTERACTION TRACKING
  // ================================================================
  var formFieldTimers = {};

  document.addEventListener('focusin', function (e) {
    var el = e.target;
    if (!el || !el.tagName) return;
    var tag = el.tagName.toLowerCase();
    if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') return;

    var fieldId = el.id || el.name || tag + '_' + (el.type || '');
    formFieldTimers[fieldId] = now();

    enqueue('form', {
      a:    'focus',
      f:    fieldId,
      type: el.type || tag,
      form: el.form ? (el.form.id || el.form.action || '') : '',
      p:    getPage()
    });
  }, { passive: true });

  document.addEventListener('focusout', function (e) {
    var el = e.target;
    if (!el || !el.tagName) return;
    var tag = el.tagName.toLowerCase();
    if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') return;

    var fieldId = el.id || el.name || tag + '_' + (el.type || '');
    var timeSpent = 0;
    if (formFieldTimers[fieldId]) {
      timeSpent = Math.round((now() - formFieldTimers[fieldId]) / 1000);
      delete formFieldTimers[fieldId];
    }

    enqueue('form', {
      a:    'blur',
      f:    fieldId,
      type: el.type || tag,
      dur:  timeSpent,
      filled: el.value ? 1 : 0,
      form: el.form ? (el.form.id || el.form.action || '') : '',
      p:    getPage()
    });
  }, { passive: true });

  document.addEventListener('submit', function (e) {
    var form = e.target;
    var formId = form.id || form.action || 'unknown';

    enqueue('form', {
      a:    'submit',
      form: formId,
      p:    getPage()
    });

    // Conversion
    trackConversion('form_submit', getPage(), formId);
  }, { capture: true });

  // ================================================================
  // TEXT SELECTION
  // ================================================================
  document.addEventListener('mouseup', function () {
    var sel = (window.getSelection ? window.getSelection().toString() : '').trim();
    if (sel.length > 2 && sel.length < 500) {
      enqueue('engagement', {
        a: 'text_select',
        txt: truncate(sel, 200),
        p: getPage()
      });
    }
  });

  // ================================================================
  // COPY / PASTE
  // ================================================================
  document.addEventListener('copy', function () {
    var sel = (window.getSelection ? window.getSelection().toString() : '').trim();
    enqueue('engagement', {
      a: 'copy',
      txt: truncate(sel, 200),
      p: getPage()
    });
  });

  document.addEventListener('paste', function (e) {
    enqueue('engagement', {
      a: 'paste',
      p: getPage()
    });
  });

  // ================================================================
  // KEYBOARD SHORTCUTS
  // ================================================================
  document.addEventListener('keydown', function (e) {
    if (!firstInteractionTime) firstInteractionTime = now() - pageStart;

    if (e.ctrlKey || e.metaKey) {
      var key = (e.key || '').toLowerCase();
      var shortcutMap = { 'c': 'Ctrl+C', 'v': 'Ctrl+V', 'a': 'Ctrl+A', 'p': 'Ctrl+P', 'f': 'Ctrl+F', 's': 'Ctrl+S', 'z': 'Ctrl+Z' };
      if (shortcutMap[key]) {
        enqueue('engagement', {
          a: 'keyboard_shortcut',
          l: shortcutMap[key],
          p: getPage()
        });
      }
    }
  });

  // ================================================================
  // PRINT EVENTS
  // ================================================================
  if (window.matchMedia) {
    try {
      var printMQ = window.matchMedia('print');
      var onPrint = function (mql) {
        if (mql.matches) {
          enqueue('engagement', { a: 'print', p: getPage() });
        }
      };
      if (printMQ.addEventListener) {
        printMQ.addEventListener('change', onPrint);
      } else if (printMQ.addListener) {
        printMQ.addListener(onPrint);
      }
    } catch (e) {}
  }
  window.addEventListener('beforeprint', function () {
    enqueue('engagement', { a: 'print', p: getPage() });
  });

  // ================================================================
  // CONVERSION TRACKING
  // ================================================================
  var conversions = {};

  function trackConversion(goal, page, label) {
    var key = goal + '|' + sessionId;
    if (conversions[key]) return; // dedupe per session
    conversions[key] = true;

    enqueue('conversion', {
      g:    goal,
      p:    page || getPage(),
      l:    label || '',
      ref:  document.referrer,
      rc:   refInfo.category,
      us:   getParam('utm_source'),
      um:   getParam('utm_medium'),
      uc:   getParam('utm_campaign')
    });
  }

  function checkClickConversion(e, el) {
    if (!el) return;
    var tag = (el.tagName || '').toLowerCase();
    var href = el.href || el.getAttribute('href') || '';
    var classes = (typeof el.className === 'string') ? el.className : '';
    var text = (el.textContent || '').trim().toLowerCase();

    // CTA click
    if (/btn--primary|btn--orange|nav-cta|cta-btn|hero-cta/.test(classes)) {
      trackConversion('cta_click', getPage(), truncate(el.textContent || '', 80));
    }

    // Phone click
    if (href.indexOf('tel:') === 0) {
      trackConversion('phone_click', getPage(), href);
    }

    // Email click
    if (href.indexOf('mailto:') === 0) {
      trackConversion('email_click', getPage(), href);
    }

    // Chat open
    if (el.id === 'chat-toggle' || /chat-toggle|chat-open/.test(classes)) {
      trackConversion('chat_open', getPage(), '');
    }
  }

  // ================================================================
  // ENGAGEMENT SCORE
  // ================================================================
  function calculateEngagementScore() {
    var score = 0;
    var time = getPreciseTime();

    // Time: up to 30 points (1 pt per 10s, max 300s)
    score += Math.min(30, Math.floor(time / 10));

    // Scroll depth: up to 20 points
    score += Math.min(20, Math.floor(maxScroll / 5));

    // Attention ratio: up to 15 points
    var attnRatio = time > 0 ? (attentionTime / time) : 0;
    score += Math.round(attnRatio * 15);

    // Clicks: up to 10 points (1 per click, max 10)
    // (estimate from queue)
    var clickCount = queue.filter(function (e) { return e.type === 'click'; }).length;
    score += Math.min(10, clickCount);

    // Form interactions: 10 points if any
    var formEvents = queue.filter(function (e) { return e.type === 'form'; }).length;
    if (formEvents > 0) score += 10;

    // Conversions: 15 points if any
    if (Object.keys(conversions).length > 0) score += 15;

    // Penalties
    score -= rageClickCount * 2;
    score -= deadClickCount;

    return clamp(Math.round(score), 0, 100);
  }

  // ================================================================
  // HEARTBEAT — update time / scroll / vitals every 5 s
  // ================================================================
  setInterval(function () {
    var timeOnPage = Math.round((now() - pageStart) / 1000);
    var preciseTime = getPreciseTime();

    enqueue('heartbeat', {
      p:    getPage(),
      top:  timeOnPage,
      pt:   preciseTime,
      at:   attentionTime,
      sd:   maxScroll,
      lcp:  webVitals.lcp,
      fid:  webVitals.fid,
      cls:  webVitals.cls,
      rc:   rageClickCount,
      dc:   deadClickCount,
      sdc:  scrollDirectionChanges,
      fi:   firstInteractionTime,
      es:   calculateEngagementScore()
    });

    // Also send legacy heartbeat for backwards compat
    sendLegacy('/api/analytics/heartbeat', {
      visitorId: visitorId,
      sessionId: sessionId,
      page: getPage(),
      timeOnPage: timeOnPage,
      preciseTime: preciseTime,
      attentionTime: attentionTime,
      scrollDepth: maxScroll,
      lcp: webVitals.lcp,
      fid: webVitals.fid,
      cls: webVitals.cls,
      engagementScore: calculateEngagementScore()
    });

    // Update session activity
    try { sessionStorage.setItem('_pl_last', String(now())); } catch (e) {}
  }, BATCH_INTERVAL);

  // ================================================================
  // PAGE UNLOAD — final flush
  // ================================================================
  function onUnload() {
    clearInterval(flushTimer);
    clearInterval(attentionTick);

    var timeOnPage = Math.round((now() - pageStart) / 1000);

    // Final heatmap flush
    flushHeatmap();

    // Final engagement event
    enqueue('engagement', {
      a:   'page_exit',
      p:   getPage(),
      top: timeOnPage,
      pt:  getPreciseTime(),
      at:  attentionTime,
      sd:  maxScroll,
      es:  calculateEngagementScore(),
      lcp: webVitals.lcp,
      fid: webVitals.fid,
      cls: webVitals.cls,
      rc:  rageClickCount,
      dc:  deadClickCount,
      sdc: scrollDirectionChanges,
      fi:  firstInteractionTime
    });

    // Final legacy heartbeat
    sendLegacy('/api/analytics/heartbeat', {
      visitorId: visitorId,
      sessionId: sessionId,
      page: getPage(),
      timeOnPage: timeOnPage,
      preciseTime: getPreciseTime(),
      attentionTime: attentionTime,
      scrollDepth: maxScroll,
      lcp: webVitals.lcp,
      fid: webVitals.fid,
      cls: webVitals.cls,
      engagementScore: calculateEngagementScore()
    });

    // Force-flush entire queue synchronously via sendBeacon
    while (queue.length > 0) {
      var batch = queue.splice(0, MAX_BATCH);
      var payload = safeJSON(batch);
      try {
        if (navigator.sendBeacon) {
          var blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(API + '/api/analytics/batch', blob);
        }
      } catch (e) {}
    }
  }

  window.addEventListener('beforeunload', onUnload);
  window.addEventListener('pagehide', onUnload);

  // ================================================================
  // ERROR TRACKING (JS errors on the page)
  // ================================================================
  window.addEventListener('error', function (e) {
    enqueue('error', {
      msg: truncate(e.message || '', 200),
      src: truncate(e.filename || '', 200),
      ln:  e.lineno || 0,
      col: e.colno || 0,
      p:   getPage()
    });
  });

  window.addEventListener('unhandledrejection', function (e) {
    enqueue('error', {
      msg: truncate(String(e.reason || ''), 200),
      type: 'promise',
      p:   getPage()
    });
  });

  // ================================================================
  // PUBLIC API: window.plTrack(category, action, label, value)
  // ================================================================
  window.plTrack = function (category, action, label, value) {
    if (!category || !action) return;
    enqueue('custom', {
      cat: truncate(String(category), 50),
      act: truncate(String(action), 100),
      lbl: truncate(String(label || ''), 200),
      val: typeof value === 'number' ? value : 0,
      p:   getPage()
    });

    // Also send via legacy endpoint for backwards compat
    sendLegacy('/api/analytics/event', {
      visitorId: visitorId,
      sessionId: sessionId,
      page: getPage(),
      category: category,
      action: action,
      label: label || '',
      value: value || 0
    });
  };

  // ================================================================
  // DONE — log tracker init (dev only)
  // ================================================================
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('[PL Tracker v2.0] Loaded — vid:', visitorId, 'sid:', sessionId, 'bot:', isBot);
  }

})();
