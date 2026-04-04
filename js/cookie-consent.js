/* ========================================================================
   PIRABEL LABS — Cookie Consent Banner (RGPD)
   ======================================================================== */
(function() {
  'use strict';

  // Skip if already consented
  var consent = localStorage.getItem('pl_cookie_consent');
  if (consent) {
    if (consent === 'all' || consent === 'analytics') loadAnalytics();
    return;
  }

  // Inject CSS
  var style = document.createElement('style');
  style.textContent = [
    '#cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#111;border-top:2px solid #FF5500;padding:1.25rem 1.5rem;font-family:"Inter",sans-serif;display:flex;align-items:center;justify-content:space-between;gap:1.5rem;flex-wrap:wrap;animation:cbSlide .4s ease;}',
    '@keyframes cbSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}',
    '#cookie-banner p{color:rgba(229,226,225,0.8);font-size:0.8125rem;line-height:1.6;margin:0;max-width:700px;}',
    '#cookie-banner a{color:#FF5500;text-decoration:underline;}',
    '.cb-buttons{display:flex;gap:0.75rem;flex-shrink:0;flex-wrap:wrap;}',
    '.cb-btn{padding:0.6rem 1.25rem;border:none;border-radius:4px;font-size:0.8125rem;font-weight:600;cursor:pointer;font-family:"Inter",sans-serif;transition:opacity .2s;}',
    '.cb-btn:hover{opacity:0.85;}',
    '.cb-accept{background:#FF5500;color:#fff;}',
    '.cb-reject{background:transparent;color:rgba(229,226,225,0.6);border:1px solid rgba(229,226,225,0.2);}',
    '.cb-prefs{background:transparent;color:rgba(229,226,225,0.6);border:1px solid rgba(229,226,225,0.2);}',
    '#cookie-prefs-panel{position:fixed;bottom:0;left:0;right:0;z-index:100000;background:#1a1a1a;border-top:2px solid #FF5500;padding:2rem;font-family:"Inter",sans-serif;display:none;animation:cbSlide .3s ease;}',
    '#cookie-prefs-panel h3{color:#fff;font-size:1rem;margin:0 0 1rem;font-family:"Space Grotesk",sans-serif;}',
    '.cp-item{display:flex;align-items:center;justify-content:space-between;padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.05);}',
    '.cp-item label{color:rgba(229,226,225,0.8);font-size:0.8125rem;}',
    '.cp-item small{color:rgba(229,226,225,0.4);font-size:0.6875rem;display:block;margin-top:0.25rem;}',
    '.cp-toggle{width:44px;height:24px;background:rgba(255,255,255,0.1);border-radius:12px;position:relative;cursor:pointer;border:none;transition:background .2s;}',
    '.cp-toggle.on{background:#FF5500;}',
    '.cp-toggle::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s;}',
    '.cp-toggle.on::after{transform:translateX(20px);}',
    '.cp-toggle.locked{opacity:0.5;cursor:not-allowed;}',
    '.cp-save{margin-top:1.25rem;padding:0.6rem 2rem;background:#FF5500;color:#fff;border:none;border-radius:4px;font-size:0.8125rem;font-weight:600;cursor:pointer;font-family:"Inter",sans-serif;}',
    '@media(max-width:600px){#cookie-banner{flex-direction:column;align-items:stretch;text-align:center;padding:1rem;}.cb-buttons{justify-content:center;}}'
  ].join('\n');
  document.head.appendChild(style);

  function createBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.innerHTML = '<p>Nous utilisons des cookies pour analyser le trafic et am\u00e9liorer votre exp\u00e9rience. <a href="/politique-confidentialite.html">En savoir plus</a></p>' +
      '<div class="cb-buttons">' +
      '<button class="cb-btn cb-accept" id="cb-accept">Tout accepter</button>' +
      '<button class="cb-btn cb-prefs" id="cb-prefs">Pr\u00e9f\u00e9rences</button>' +
      '<button class="cb-btn cb-reject" id="cb-reject">Refuser</button>' +
      '</div>';
    document.body.appendChild(banner);

    document.getElementById('cb-accept').addEventListener('click', function() {
      setConsent('all');
      banner.remove();
      if (document.getElementById('cookie-prefs-panel')) document.getElementById('cookie-prefs-panel').remove();
    });

    document.getElementById('cb-reject').addEventListener('click', function() {
      setConsent('essential');
      banner.remove();
      if (document.getElementById('cookie-prefs-panel')) document.getElementById('cookie-prefs-panel').remove();
    });

    document.getElementById('cb-prefs').addEventListener('click', function() {
      showPreferences();
    });
  }

  function showPreferences() {
    if (document.getElementById('cookie-prefs-panel')) {
      document.getElementById('cookie-prefs-panel').style.display = 'block';
      document.getElementById('cookie-banner').style.display = 'none';
      return;
    }
    var panel = document.createElement('div');
    panel.id = 'cookie-prefs-panel';
    panel.innerHTML = '<h3>Pr\u00e9f\u00e9rences de cookies</h3>' +
      '<div class="cp-item"><div><label>Cookies essentiels</label><small>N\u00e9cessaires au fonctionnement du site. Ne peuvent pas \u00eatre d\u00e9sactiv\u00e9s.</small></div><button class="cp-toggle on locked" disabled></button></div>' +
      '<div class="cp-item"><div><label>Cookies analytiques</label><small>Google Analytics — nous aident \u00e0 comprendre comment vous utilisez le site.</small></div><button class="cp-toggle" id="cp-analytics"></button></div>' +
      '<div class="cp-item"><div><label>Cookies marketing</label><small>Utilis\u00e9s pour le suivi publicitaire et le remarketing.</small></div><button class="cp-toggle" id="cp-marketing"></button></div>' +
      '<button class="cp-save" id="cp-save">Enregistrer mes pr\u00e9f\u00e9rences</button>';
    document.body.appendChild(panel);
    document.getElementById('cookie-banner').style.display = 'none';

    // Toggle handlers
    document.querySelectorAll('.cp-toggle:not(.locked)').forEach(function(btn) {
      btn.addEventListener('click', function() {
        this.classList.toggle('on');
      });
    });

    document.getElementById('cp-save').addEventListener('click', function() {
      var analytics = document.getElementById('cp-analytics').classList.contains('on');
      var marketing = document.getElementById('cp-marketing').classList.contains('on');
      if (analytics && marketing) setConsent('all');
      else if (analytics) setConsent('analytics');
      else setConsent('essential');
      panel.remove();
      document.getElementById('cookie-banner').remove();
    });
  }

  function setConsent(level) {
    localStorage.setItem('pl_cookie_consent', level);
    if (level === 'all' || level === 'analytics') {
      loadAnalytics();
    } else {
      // Remove GA cookies if rejecting
      document.cookie.split(';').forEach(function(c) {
        var name = c.trim().split('=')[0];
        if (name.startsWith('_ga')) {
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.' + location.hostname;
        }
      });
    }
  }

  function loadAnalytics() {
    // GA4 is already in the HTML — just ensure it runs
    // If we wanted conditional loading, we'd inject the script here
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBanner);
  } else {
    createBanner();
  }
})();
