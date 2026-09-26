/* ========================================================================
   PIRABEL LABS — Tracking léger (visites + visiteurs uniques + clics WhatsApp)
   Envoie un "beacon" vers /api/track. Échoue silencieusement, ne casse jamais la page.
   Aucune donnée personnelle : un id visiteur aléatoire stocké en localStorage.
   ======================================================================== */
(function () {
  try {
    // Ne pas tracker les pages admin
    var p = location.pathname || '';
    if (p.indexOf('/admin') === 0 || p.indexOf('/pirabel-admin') === 0) return;

    var KEY = 'pl_vid';
    var vid = '';
    try { vid = localStorage.getItem(KEY) || ''; } catch (e) {}
    if (!vid) {
      vid = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      try { localStorage.setItem(KEY, vid); } catch (e) {}
    }

    function beacon(type) {
      try {
        var body = JSON.stringify({ type: type, vid: vid });
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
        } else {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body,
            keepalive: true,
          }).catch(function () {});
        }
      } catch (e) {}
    }

    // Vue de page (une fois par chargement)
    beacon('pageview');

    // Clics sur tout lien WhatsApp (flottant, footer, CTA, etc.)
    document.addEventListener('click', function (e) {
      try {
        var t = e.target;
        var a = t && t.closest ? t.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href*="whatsapp://"], a[href*="web.whatsapp.com"]') : null;
        if (a) beacon('whatsapp');
      } catch (err) {}
    }, true);
  } catch (e) {}
})();
