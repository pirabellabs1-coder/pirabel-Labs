/* ============================================================
   PIRABEL LABS — Dashboard UI helpers
   Auto-injects a hamburger button + overlay so the sidebar
   can be opened/closed at will (desktop AND mobile).
   Loaded by every admin/client/employee view.
   ============================================================ */
(function () {
  if (window.__pbDashUI) return;
  window.__pbDashUI = true;

  function init() {
    var sidebar = document.querySelector('.sidebar') || document.querySelector('.portal-sidebar');
    if (!sidebar) return; // No sidebar on this page → nothing to do
    var main = document.querySelector('.main') || document.querySelector('.portal-main');

    var topbar = document.querySelector('.topbar') || document.querySelector('.portal-topbar');

    // ---- 1. Hamburger button ----
    var btn = document.querySelector('.pb-sidebar-toggle');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pb-sidebar-toggle';
      btn.setAttribute('aria-label', 'Ouvrir / fermer le menu');
      btn.innerHTML = '<span class="material-symbols-outlined">menu</span>';
      if (topbar) {
        // Insert as the very first child of the topbar so it sits on the left
        topbar.insertBefore(btn, topbar.firstChild);
      } else {
        document.body.appendChild(btn);
      }
    }

    // ---- 2. Overlay (mobile) ----
    var overlay = document.querySelector('.pb-sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'pb-sidebar-overlay';
      document.body.appendChild(overlay);
    }

    // ---- 3. Restore previous state ----
    // On desktop we use a "collapsed" body class.
    // On mobile we use the existing `.sidebar.open` toggle.
    var DESKTOP_BREAK = 900;
    var stored = localStorage.getItem('pb_sidebar_collapsed');
    if (stored === '1' && window.innerWidth > DESKTOP_BREAK) {
      document.body.classList.add('pb-sidebar-collapsed');
    }

    // ---- 4. Toggle handler ----
    function toggle() {
      var isMobile = window.innerWidth <= DESKTOP_BREAK;
      if (isMobile) {
        var open = sidebar.classList.toggle('open');
        overlay.classList.toggle('show', open);
      } else {
        var collapsed = document.body.classList.toggle('pb-sidebar-collapsed');
        localStorage.setItem('pb_sidebar_collapsed', collapsed ? '1' : '0');
      }
    }
    btn.addEventListener('click', toggle);

    // Click overlay → close (mobile)
    overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });

    // Esc → close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      }
    });

    // ---- 5. Reset state on resize across breakpoint ----
    var lastIsMobile = window.innerWidth <= DESKTOP_BREAK;
    window.addEventListener('resize', function () {
      var nowMobile = window.innerWidth <= DESKTOP_BREAK;
      if (nowMobile !== lastIsMobile) {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
        lastIsMobile = nowMobile;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
