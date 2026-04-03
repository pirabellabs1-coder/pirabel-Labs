/**
 * PIRABEL LABS — Analytics Tracker
 * Tracks: page views, time on page, scroll depth, clicks, events
 * Sends data to /api/analytics/ endpoints
 */
(function() {
  'use strict';

  const API = window.PIRABEL_API || 'http://localhost:3000';
  const HEARTBEAT_INTERVAL = 5000; // 5 seconds

  // Generate or retrieve visitor ID
  function getVisitorId() {
    let id = localStorage.getItem('_pl_vid');
    if (!id) {
      id = 'v_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
      localStorage.setItem('_pl_vid', id);
    }
    return id;
  }

  // Generate session ID (expires after 30 min inactivity)
  function getSessionId() {
    const now = Date.now();
    let sid = sessionStorage.getItem('_pl_sid');
    let lastActivity = parseInt(sessionStorage.getItem('_pl_last') || '0');

    if (!sid || (now - lastActivity) > 30 * 60 * 1000) {
      sid = 's_' + now.toString(36) + Math.random().toString(36).substr(2, 5);
      sessionStorage.setItem('_pl_sid', sid);
      // Track new session
      send('/api/analytics/session', { visitorId: getVisitorId() });
    }

    sessionStorage.setItem('_pl_last', now.toString());
    return sid;
  }

  // Detect device type
  function getDevice() {
    const w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  }

  // Detect browser
  function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Other';
  }

  // Detect OS
  function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Other';
  }

  // Get UTM parameters
  function getUTM(param) {
    const url = new URL(window.location.href);
    return url.searchParams.get(param) || '';
  }

  // Get clean page path
  function getPage() {
    return window.location.pathname + window.location.search;
  }

  // Send data to API (non-blocking)
  function send(endpoint, data) {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(API + endpoint, JSON.stringify(data));
      } else {
        fetch(API + endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {}
  }

  // Track scroll depth
  let maxScroll = 0;
  function trackScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      const percent = Math.round((scrollTop / docHeight) * 100);
      if (percent > maxScroll) maxScroll = percent;
    }
  }

  // ========================================
  // INIT
  // ========================================
  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const pageStartTime = Date.now();

  // Track page view
  send('/api/analytics/track', {
    visitorId,
    sessionId,
    page: getPage(),
    title: document.title,
    referrer: document.referrer,
    device: getDevice(),
    browser: getBrowser(),
    os: getOS(),
    language: navigator.language || '',
    utmSource: getUTM('utm_source'),
    utmMedium: getUTM('utm_medium'),
    utmCampaign: getUTM('utm_campaign')
  });

  // Scroll tracking
  window.addEventListener('scroll', trackScroll, { passive: true });

  // Heartbeat: update time on page every 5 seconds
  const heartbeatTimer = setInterval(() => {
    const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
    send('/api/analytics/heartbeat', {
      visitorId, sessionId,
      page: getPage(),
      timeOnPage,
      scrollDepth: maxScroll
    });
  }, HEARTBEAT_INTERVAL);

  // Track page unload (final time + scroll)
  window.addEventListener('beforeunload', () => {
    clearInterval(heartbeatTimer);
    const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
    send('/api/analytics/heartbeat', {
      visitorId, sessionId,
      page: getPage(),
      timeOnPage,
      scrollDepth: maxScroll
    });
  });

  // ========================================
  // EVENT TRACKING
  // ========================================

  // Track CTA button clicks
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button');
    if (!target) return;

    // CTA clicks
    if (target.classList.contains('btn--primary') || target.classList.contains('btn--orange') || target.classList.contains('nav-cta')) {
      send('/api/analytics/event', {
        visitorId, sessionId, page: getPage(),
        category: 'cta', action: 'click',
        label: target.textContent.trim().substring(0, 80)
      });
    }

    // Nav clicks
    if (target.closest('.nav-links') || target.closest('.mobile-nav')) {
      send('/api/analytics/event', {
        visitorId, sessionId, page: getPage(),
        category: 'navigation', action: 'click',
        label: target.textContent.trim()
      });
    }

    // Service clicks
    if (target.closest('.srv-row') || target.classList.contains('sc-link')) {
      send('/api/analytics/event', {
        visitorId, sessionId, page: getPage(),
        category: 'service', action: 'click',
        label: target.textContent.trim().substring(0, 80)
      });
    }

    // Guide/blog clicks
    if (target.closest('.guide-card') || target.closest('.blog-card')) {
      send('/api/analytics/event', {
        visitorId, sessionId, page: getPage(),
        category: 'content', action: 'click',
        label: target.textContent.trim().substring(0, 80)
      });
    }

    // Mon Espace click
    if (target.classList.contains('nav-login')) {
      send('/api/analytics/event', {
        visitorId, sessionId, page: getPage(),
        category: 'login', action: 'click', label: 'Mon Espace'
      });
    }
  });

  // Track form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target;
    let category = 'form';
    let action = 'submit';

    if (form.id === 'contact-form') { category = 'contact'; action = 'submit_contact'; }
    else if (form.id === 'newsletter-form' || form.closest('.newsletter')) { category = 'newsletter'; action = 'subscribe'; }

    send('/api/analytics/event', {
      visitorId, sessionId, page: getPage(),
      category, action, label: form.id || 'unknown'
    });
  });

  // Track chat widget open
  const chatToggle = document.getElementById('chat-toggle');
  if (chatToggle) {
    chatToggle.addEventListener('click', () => {
      send('/api/analytics/event', {
        visitorId, sessionId, page: getPage(),
        category: 'chat', action: 'open', label: 'chat_widget'
      });
    });
  }

  // Track scroll milestones (25%, 50%, 75%, 100%)
  let scrollMilestones = { 25: false, 50: false, 75: false, 100: false };
  window.addEventListener('scroll', () => {
    [25, 50, 75, 100].forEach(milestone => {
      if (maxScroll >= milestone && !scrollMilestones[milestone]) {
        scrollMilestones[milestone] = true;
        send('/api/analytics/event', {
          visitorId, sessionId, page: getPage(),
          category: 'scroll', action: `reached_${milestone}`, value: milestone
        });
      }
    });
  }, { passive: true });

  // Expose for manual tracking
  window.plTrack = function(category, action, label, value) {
    send('/api/analytics/event', { visitorId, sessionId, page: getPage(), category, action, label, value });
  };

})();
