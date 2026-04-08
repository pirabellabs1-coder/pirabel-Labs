// sidebar.js — Injecte la sidebar Admin complète dans toutes les pages
// Remplace tout contenu hardcodé dans .sidebar-nav

(function() {
  const path = window.location.pathname;
  // Don't inject admin sidebar on the client portal
  if (path === '/portal' || path === '/portal-login' || path.startsWith('/espace-client')) return;
  const current = path.replace(/^\//, '').replace(/\.html$/, '') || 'dashboard';

  const sections = [
    { title: 'Principal', links: [
      { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { href: '/orders', icon: 'inbox', label: 'Demandes' },
      { href: '/calendar', icon: 'event', label: 'Calendrier' },
      { href: '/tasks', icon: 'task_alt', label: 'Tâches' }
    ]},
    { title: 'Commercial', links: [
      { href: '/quotes', icon: 'description', label: 'Devis' },
      { href: '/pipeline', icon: 'view_kanban', label: 'Pipeline CRM' },
      { href: '/email-templates', icon: 'mail', label: 'Templates Email' }
    ]},
    { title: 'Gestion', links: [
      { href: '/clients', icon: 'people', label: 'Clients' },
      { href: '/projects', icon: 'folder', label: 'Projets' },
      { href: '/employees', icon: 'badge', label: 'Employés' },
      { href: '/time-tracking', icon: 'timer', label: 'Time Tracking' },
      { href: '/recruitment', icon: 'work', label: 'Recrutement' }
    ]},
    { title: 'Marketing', links: [
      { href: '/campaigns', icon: 'campaign', label: 'Campagnes' },
      { href: '/prospects', icon: 'person_search', label: 'Prospection' },
      { href: '/leads', icon: 'group_add', label: 'Leads' },
      { href: '/articles', icon: 'article', label: 'Articles' },
      { href: '/analytics', icon: 'analytics', label: 'Analytics' },
      { href: '/reviews-admin', icon: 'star', label: 'Avis clients' }
    ]},
    { title: 'Finance', links: [
      { href: '/invoices', icon: 'receipt_long', label: 'Factures' },
      { href: '/revenue', icon: 'monitoring', label: 'Revenue' }
    ]},
    { title: 'Système', links: [
      { href: '/notes', icon: 'sticky_note_2', label: 'Notes' },
      { href: '/logs', icon: 'history', label: 'Logs' },
      { href: '/settings', icon: 'settings', label: 'Paramètres' }
    ]}
  ];

  function buildHTML() {
    let html = '';
    sections.forEach(sec => {
      html += `<div class="sidebar-section">${sec.title}</div>`;
      sec.links.forEach(link => {
        const linkPath = link.href.replace(/^\//, '');
        const isActive = linkPath === current;
        html += `<a href="${link.href}" class="sidebar-link${isActive ? ' active' : ''}"><span class="material-symbols-outlined">${link.icon}</span> ${link.label}</a>`;
      });
    });
    return html;
  }

  function inject() {
    // Replace all sidebar-nav elements (including those with hardcoded content)
    const navEls = document.querySelectorAll('.sidebar-nav, #sidebar-nav, aside .sidebar-nav, aside nav');
    navEls.forEach(el => { el.innerHTML = buildHTML(); });
  }

  // Try immediately and after DOM ready
  inject();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  }
  // One final pass after all deferred scripts
  window.addEventListener('load', () => {
    inject();
    // Extra delayed pass to survive any late-loading scripts
    setTimeout(inject, 500);
    setTimeout(inject, 1500);
  });

  // Watch for any scripts that try to overwrite the sidebar
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.target.classList && m.target.classList.contains('sidebar-nav')) {
        const hasCommercial = m.target.innerHTML.includes('Commercial');
        if (!hasCommercial) {
          inject();
          break;
        }
      }
    }
  });
  const sidebar = document.querySelector('.sidebar-nav');
  if (sidebar) observer.observe(sidebar, { childList: true, subtree: true });
  else document.addEventListener('DOMContentLoaded', () => {
    const s = document.querySelector('.sidebar-nav');
    if (s) observer.observe(s, { childList: true, subtree: true });
  });
})();
