/* ============================================================
   PIRABEL LABS — Admin Topbar enhancements
   Auto-injects: global search (Cmd+K) + notifications bell
   Loaded by every admin/employee view
   ============================================================ */
(function () {
  if (window.__pbAdminTopbar) return;
  window.__pbAdminTopbar = true;

  function init() {
    var topbar = document.querySelector('.topbar') || document.querySelector('.portal-topbar');
    if (!topbar) return;

    var actions = topbar.querySelector('.topbar-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'topbar-actions';
      topbar.appendChild(actions);
    }

    if (!document.getElementById('pb-topbar-style')) {
      var style = document.createElement('style');
      style.id = 'pb-topbar-style';
      style.textContent = `
        .pb-search-btn{display:inline-flex;align-items:center;gap:.5rem;background:var(--card,#1a1a1a);border:1px solid var(--border,#2a2a2a);color:var(--muted,#888);padding:.5rem .85rem;cursor:pointer;font-family:inherit;font-size:.75rem;min-width:200px;transition:border-color .2s,color .2s;}
        .pb-search-btn:hover{border-color:var(--accent,#FF5500);color:var(--text,#fff);}
        .pb-search-btn .pb-kbd{margin-left:auto;background:rgba(255,255,255,.06);padding:.1rem .4rem;font-size:.65rem;color:var(--muted,#888);}
        .pb-bell{position:relative;background:transparent;border:1px solid var(--border,#2a2a2a);color:var(--text,#fff);width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;}
        .pb-bell:hover{border-color:var(--accent,#FF5500);}
        .pb-bell-badge{position:absolute;top:-5px;right:-5px;background:#e74c3c;color:#fff;font-size:.6rem;font-weight:700;min-width:16px;height:16px;display:flex;align-items:center;justify-content:center;border-radius:50%;padding:0 3px;}
        .pb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:flex-start;justify-content:center;z-index:9999;padding:10vh 1rem 1rem;}
        .pb-overlay.show{display:flex;}
        .pb-search-modal{background:var(--card,#1a1a1a);border:1px solid var(--border,#2a2a2a);width:100%;max-width:600px;}
        .pb-search-input{width:100%;background:transparent;border:none;border-bottom:1px solid var(--border,#2a2a2a);color:var(--text,#fff);padding:1rem 1.25rem;font-size:1rem;outline:none;font-family:inherit;}
        .pb-search-results{max-height:60vh;overflow-y:auto;}
        .pb-result{display:flex;align-items:center;gap:.75rem;padding:.75rem 1.25rem;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;text-decoration:none;color:var(--text,#fff);}
        .pb-result:hover,.pb-result.active{background:rgba(255,85,0,.08);}
        .pb-result-icon{width:32px;height:32px;background:var(--bg,#0e0e0e);display:flex;align-items:center;justify-content:center;color:var(--accent,#FF5500);}
        .pb-result-info{flex:1;min-width:0;}
        .pb-result-title{font-size:.85rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .pb-result-sub{font-size:.7rem;color:var(--muted,#888);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .pb-result-type{font-size:.6rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted,#888);background:var(--bg,#0e0e0e);padding:.2rem .4rem;}
        .pb-empty{padding:2rem;text-align:center;color:var(--muted,#888);font-size:.85rem;}
        .pb-notif-panel{position:fixed;top:60px;right:1rem;background:var(--card,#1a1a1a);border:1px solid var(--border,#2a2a2a);width:380px;max-width:calc(100vw - 2rem);max-height:70vh;display:none;flex-direction:column;z-index:9998;}
        .pb-notif-panel.show{display:flex;}
        .pb-notif-head{padding:.85rem 1rem;border-bottom:1px solid var(--border,#2a2a2a);display:flex;justify-content:space-between;align-items:center;}
        .pb-notif-head h3{margin:0;font-size:.85rem;font-weight:700;}
        .pb-notif-head button{background:transparent;border:none;color:var(--accent,#FF5500);font-size:.7rem;cursor:pointer;text-transform:uppercase;letter-spacing:.06em;}
        .pb-notif-list{flex:1;overflow-y:auto;}
        .pb-notif-item{padding:.75rem 1rem;border-bottom:1px solid rgba(255,255,255,.04);cursor:pointer;display:flex;gap:.75rem;align-items:flex-start;}
        .pb-notif-item:hover{background:rgba(255,85,0,.04);}
        .pb-notif-item.unread{background:rgba(255,85,0,.06);}
        .pb-notif-item.unread::before{content:'';width:6px;height:6px;background:var(--accent,#FF5500);border-radius:50%;margin-top:.4rem;flex-shrink:0;}
        .pb-notif-icon{width:32px;height:32px;background:var(--bg,#0e0e0e);display:flex;align-items:center;justify-content:center;color:var(--accent,#FF5500);flex-shrink:0;}
        .pb-notif-text{flex:1;min-width:0;}
        .pb-notif-title{font-size:.8rem;font-weight:600;}
        .pb-notif-msg{font-size:.7rem;color:var(--muted,#888);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .pb-notif-time{font-size:.65rem;color:var(--muted,#888);margin-top:.2rem;}
      `;
      document.head.appendChild(style);
    }

    var searchBtn = document.createElement('button');
    searchBtn.className = 'pb-search-btn';
    searchBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:1rem;">search</span><span>Rechercher...</span><span class="pb-kbd">Ctrl K</span>';
    searchBtn.addEventListener('click', openSearch);

    var bell = document.createElement('button');
    bell.className = 'pb-bell';
    bell.innerHTML = '<span class="material-symbols-outlined" style="font-size:1.1rem;">notifications</span><span class="pb-bell-badge" id="pb-bell-badge" style="display:none;">0</span>';
    bell.addEventListener('click', toggleNotifs);

    actions.insertBefore(bell, actions.firstChild);
    actions.insertBefore(searchBtn, actions.firstChild);

    var overlay = document.createElement('div');
    overlay.className = 'pb-overlay';
    overlay.id = 'pb-search-overlay';
    overlay.innerHTML = `
      <div class="pb-search-modal">
        <input type="text" class="pb-search-input" id="pb-search-input" placeholder="Rechercher clients, projets, candidats, articles...">
        <div class="pb-search-results" id="pb-search-results"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeSearch(); });

    var notifPanel = document.createElement('div');
    notifPanel.className = 'pb-notif-panel';
    notifPanel.id = 'pb-notif-panel';
    notifPanel.innerHTML = `
      <div class="pb-notif-head">
        <h3>Notifications</h3>
        <button onclick="window.__pbMarkAllRead()">Tout marquer lu</button>
      </div>
      <div class="pb-notif-list" id="pb-notif-list"></div>
    `;
    document.body.appendChild(notifPanel);

    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
      if (e.key === 'Escape') { closeSearch(); document.getElementById('pb-notif-panel').classList.remove('show'); }
    });

    document.addEventListener('click', function (e) {
      if (!notifPanel.contains(e.target) && !bell.contains(e.target)) {
        notifPanel.classList.remove('show');
      }
    });

    var searchTimer = null;
    document.getElementById('pb-search-input').addEventListener('input', function (e) {
      clearTimeout(searchTimer);
      var q = e.target.value.trim();
      if (q.length < 2) {
        document.getElementById('pb-search-results').innerHTML = '<div class="pb-empty">Tapez au moins 2 caractères</div>';
        return;
      }
      searchTimer = setTimeout(function () { runSearch(q); }, 200);
    });

    loadNotifCount();
    setInterval(loadNotifCount, 30000);
  }

  function openSearch() {
    var ov = document.getElementById('pb-search-overlay');
    ov.classList.add('show');
    setTimeout(function () { document.getElementById('pb-search-input').focus(); }, 50);
  }

  function closeSearch() {
    document.getElementById('pb-search-overlay').classList.remove('show');
  }

  function runSearch(q) {
    fetch('/api/search?q=' + encodeURIComponent(q), { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var box = document.getElementById('pb-search-results');
        if (!data.results || !data.results.length) {
          box.innerHTML = '<div class="pb-empty">Aucun résultat pour "' + q + '"</div>';
          return;
        }
        box.innerHTML = data.results.map(function (r) {
          return '<a href="' + r.link + '" class="pb-result">' +
            '<div class="pb-result-icon"><span class="material-symbols-outlined" style="font-size:1rem;">' + (r.icon || 'search') + '</span></div>' +
            '<div class="pb-result-info">' +
              '<div class="pb-result-title">' + esc(r.title) + '</div>' +
              '<div class="pb-result-sub">' + esc(r.subtitle || '') + '</div>' +
            '</div>' +
            '<span class="pb-result-type">' + esc(r.type) + '</span>' +
          '</a>';
        }).join('');
      })
      .catch(function () {});
  }

  function toggleNotifs() {
    var p = document.getElementById('pb-notif-panel');
    p.classList.toggle('show');
    if (p.classList.contains('show')) loadNotifs();
  }

  function loadNotifCount() {
    fetch('/api/notifications/unread-count', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var badge = document.getElementById('pb-bell-badge');
        if (!badge) return;
        if (data.unread > 0) {
          badge.textContent = data.unread > 99 ? '99+' : data.unread;
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      })
      .catch(function () {});
  }

  function loadNotifs() {
    fetch('/api/notifications', { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var list = document.getElementById('pb-notif-list');
        if (!data.notifications || !data.notifications.length) {
          list.innerHTML = '<div class="pb-empty">Aucune notification</div>';
          return;
        }
        list.innerHTML = data.notifications.map(function (n) {
          var time = timeAgo(new Date(n.createdAt));
          return '<div class="pb-notif-item ' + (n.read ? '' : 'unread') + '" onclick="window.__pbOpenNotif(\'' + n._id + '\',\'' + (n.link || '') + '\')">' +
            '<div class="pb-notif-icon"><span class="material-symbols-outlined" style="font-size:1rem;">' + (n.icon || 'notifications') + '</span></div>' +
            '<div class="pb-notif-text">' +
              '<div class="pb-notif-title">' + esc(n.title) + '</div>' +
              '<div class="pb-notif-msg">' + esc(n.message || '') + '</div>' +
              '<div class="pb-notif-time">' + time + '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      })
      .catch(function () {});
  }

  window.__pbOpenNotif = function (id, link) {
    fetch('/api/notifications/' + id + '/read', { method: 'PUT', credentials: 'include' });
    if (link) window.location.href = link;
  };

  window.__pbMarkAllRead = function () {
    fetch('/api/notifications/read-all', { method: 'PUT', credentials: 'include' })
      .then(function () { loadNotifCount(); loadNotifs(); });
  };

  function timeAgo(d) {
    var s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return 'à l\'instant';
    if (s < 3600) return Math.floor(s / 60) + ' min';
    if (s < 86400) return Math.floor(s / 3600) + ' h';
    if (s < 604800) return Math.floor(s / 86400) + ' j';
    return d.toLocaleDateString('fr-FR');
  }

  function esc(s) {
    return (s || '').toString().replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
