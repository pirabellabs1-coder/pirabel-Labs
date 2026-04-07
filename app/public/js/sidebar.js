// sidebar.js — Injecte la sidebar Admin complète dans toutes les pages
// Usage: Mettre <nav class="sidebar-nav" id="sidebar-nav"></nav> dans l'aside
// et inclure cette script dans le document

(function() {
  const path = window.location.pathname;
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

  let html = '';
  sections.forEach(sec => {
    html += `<div class="sidebar-section">${sec.title}</div>`;
    sec.links.forEach(link => {
      const linkPath = link.href.replace(/^\//, '');
      const isActive = linkPath === current;
      html += `<a href="${link.href}" class="sidebar-link${isActive ? ' active' : ''}"><span class="material-symbols-outlined">${link.icon}</span> ${link.label}</a>`;
    });
  });

  // Inject into any sidebar-nav element
  document.addEventListener('DOMContentLoaded', function() {
    const navEls = document.querySelectorAll('.sidebar-nav, #sidebar-nav');
    navEls.forEach(el => { el.innerHTML = html; });
  });

  // Also try immediately (for scripts loaded after DOM)
  const navEls = document.querySelectorAll('.sidebar-nav, #sidebar-nav');
  navEls.forEach(el => { el.innerHTML = html; });
})();
