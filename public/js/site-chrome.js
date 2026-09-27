/* Pirabel Labs — comportements de l'en-tête (méga-menus, tiroir mobile, thème,
   masquage au défilement). Partagé par les pages Astro et les pages Express. */
(function () {
  const header = document.querySelector('[data-header]');
  if (header) {
    const items = Array.from(header.querySelectorAll('[data-mnav-item]'));
    let openItem = null;
    let hoverTimer = 0;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

    const setOpen = (item, open) => {
      const trigger = item.querySelector('[data-mnav-trigger]');
      if (open) {
        if (openItem && openItem !== item) setOpen(openItem, false);
        item.setAttribute('data-open', '');
        trigger?.setAttribute('aria-expanded', 'true');
        openItem = item;
      } else {
        item.removeAttribute('data-open');
        trigger?.setAttribute('aria-expanded', 'false');
        if (openItem === item) openItem = null;
      }
    };

    items.forEach((item) => {
      const trigger = item.querySelector('[data-mnav-trigger]');
      trigger?.addEventListener('click', () => setOpen(item, !item.hasAttribute('data-open')));
      item.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse' || !fine.matches) return;
        window.clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(() => setOpen(item, true), openItem ? 0 : 70);
      });
      item.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse' || !fine.matches) return;
        window.clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(() => setOpen(item, false), 180);
      });
      item.addEventListener('focusout', (e) => {
        const next = e.relatedTarget ;
        if (!next || !item.contains(next)) setOpen(item, false);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (openItem) {
        const trigger = openItem.querySelector('[data-mnav-trigger]');
        setOpen(openItem, false);
        trigger?.focus();
      }
      if (drawer && !drawer.hidden) toggleDrawer(false, true);
    });
    document.addEventListener('pointerdown', (e) => {
      if (openItem && !openItem.contains(e.target )) setOpen(openItem, false);
    });

    // Tiroir mobile
    const burger = header.querySelector('[data-burger]');
    const drawer = header.querySelector('[data-drawer]');
    const toggleDrawer = (open, returnFocus = false) => {
      if (!burger || !drawer) return;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      document.documentElement.classList.toggle('is-locked', open);
      // Tiroir ouvert : le reste de la page devient inerte (le focus clavier reste dans le menu).
      document.querySelectorAll('main, footer, .skip-link').forEach((el) => el.toggleAttribute('inert', open));
      window.__lenis?.[open ? 'stop' : 'start']();
      if (open) {
        drawer.hidden = false;
        requestAnimationFrame(() => {
          drawer.classList.add('is-open');
          drawer.querySelector('summary')?.focus();
        });
      } else {
        drawer.classList.remove('is-open');
        window.setTimeout(() => { if (!drawer.classList.contains('is-open')) drawer.hidden = true; }, 380);
        if (returnFocus) burger.focus();
      }
    };
    burger?.addEventListener('click', () => toggleDrawer(burger.getAttribute('aria-expanded') !== 'true'));
    drawer?.addEventListener('click', (e) => {
      const t = e.target ;
      if (t === drawer || t.closest('a')) toggleDrawer(false);
    });

    // Thème clair / sombre (mémorisé). Révélation circulaire si le navigateur le permet.
    const themeBtn = header.querySelector('[data-theme-toggle]');
    const root = document.documentElement;
    const syncThemeBtn = () => {
      const light = root.getAttribute('data-theme') === 'light';
      themeBtn?.setAttribute('aria-label', light ? 'Passer en thème sombre' : 'Passer en thème clair');
    };
    syncThemeBtn();
    themeBtn?.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      const apply = () => {
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('pl_theme', next); } catch (e) { /* navigation privée */ }
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = next === 'light' ? '#F6F3EF' : '#0E0E0E';
        syncThemeBtn();
      };
      const reduce = root.classList.contains('motion-soft');
      const doc = document ;
      if (!doc.startViewTransition || reduce) { apply(); return; }
      const r = themeBtn.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.classList.add('theme-vt');
      const vt = doc.startViewTransition(apply);
      vt.ready.then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
        );
      }).catch(() => {});
      vt.finished.finally(() => root.classList.remove('theme-vt'));
    });

    // État au défilement : compacte après 24 px, se masque en descendant, revient en remontant.
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 24);
      const goingDown = y > lastY + 4;
      const goingUp = y < lastY - 4;
      if (goingDown && y > 420 && !openItem && drawer?.hidden !== false) header.classList.add('is-hidden');
      else if (goingUp || y < 420) header.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    onScroll();
  }

  // Devise des prix : euro par défaut ; franc CFA pour les visiteurs de la zone franc (UEMOA et CEMAC).
  // Le pays vient de /api/geo (en-tête de géolocalisation de l'hébergeur), mémorisé 7 jours.
  const FCFA = ['BJ', 'CI', 'SN', 'TG', 'ML', 'BF', 'NE', 'GW', 'CM', 'GA', 'CG', 'TD', 'CF', 'GQ'];
  const applyCur = (cur, cc) => {
    if (cur === 'xof') document.documentElement.setAttribute('data-cur', 'xof');
    else document.documentElement.removeAttribute('data-cur');
    document.dispatchEvent(new CustomEvent('pl:currency', { detail: { cur, country: cc } }));
  };
  if (document.querySelector('.px, [data-ptabs]')) {
    let fresh = false;
    try { fresh = Date.now() - Number(localStorage.getItem('pl_cur_t') || 0) < 7 * 864e5 && !!localStorage.getItem('pl_cur'); } catch (e) { /* navigation privée */ }
    if (!fresh) {
      fetch('/api/geo', { cache: 'no-store' }).then((r) => r.json()).then((d) => {
        const cc = String((d && d.country) || '').toUpperCase();
        const cur = FCFA.includes(cc) ? 'xof' : 'eur';
        try { localStorage.setItem('pl_cur', cur); localStorage.setItem('pl_cc', cc); localStorage.setItem('pl_cur_t', String(Date.now())); } catch (e) { /* navigation privée */ }
        applyCur(cur, cc);
      }).catch(() => { /* euro par défaut */ });
    }
  }

  // Interrupteur d'animations (pied de page), toujours disponible : les animations sont complètes
  // par défaut ; « Réduire » mémorise le mode doux (pl_motion = soft), « Réactiver » l'annule.
  const motionBtn = document.querySelector('[data-motion-switch]');
  if (motionBtn) {
    const soft = document.documentElement.classList.contains('motion-soft');
    motionBtn.textContent = soft ? 'Réactiver les animations' : 'Réduire les animations';
    motionBtn.setAttribute('aria-pressed', String(soft));
    motionBtn.hidden = false;
    motionBtn.addEventListener('click', () => {
      try { if (soft) localStorage.removeItem('pl_motion'); else localStorage.setItem('pl_motion', 'soft'); } catch (e) { /* navigation privée */ }
      location.reload();
    });
  }
})();
