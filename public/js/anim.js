/* =============================================================================
   Pirabel Labs - anim.js (elan6)
   Couche d'animation premium, vanilla, sans dependance.
   - Reveal au scroll (IntersectionObserver) avec stagger.
   - Barre de progression de lecture.
   - Etat "scrolle" du menu.
   - Compteurs de stats animes.
   Ne s'execute QUE si <html> porte .anim-on (pose en <head> quand IO dispo et
   prefers-reduced-motion = no-preference). => zero contenu masque sans JS ni en
   mouvement reduit ; l'ensemble reste invisible pour Googlebot cote contenu.
   ============================================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  if (!root.classList.contains('anim-on')) return;          // reduced-motion / pas d'IO
  if (!('IntersectionObserver' in window)) return;

  var rAF = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* ---------------------------------------------------------------------------
     1) REVEAL AU SCROLL
     On auto-tague des elements structurels (aucune edition du HTML des pages).
     --------------------------------------------------------------------------- */
  // NB : on n'anime JAMAIS le hero ni le H1 (element LCP) — le contenu au-dessus
  // de la ligne de flottaison doit peindre instantanement (Core Web Vitals / SEO).
  var REVEAL_SELECTORS = [
    '.sec-h',
    '.card', '.service-card', '.prest', '.type-card', '.reason',
    '.stat', '.stat-c', '.city-stat', '.bigr', '.diff', '.trust-c',
    '.zz-step', '.method-step', '.faq-i',
    '.inline-cta-band', '.ctaf__box', '.ctam__box', '.dot-arrow',
    '.expertise', '.expertises-2col > *',
    '[data-reveal]'
  ].join(',');

  var nodes;
  try { nodes = document.querySelectorAll(REVEAL_SELECTORS); }
  catch (e) { return; }

  // Stagger : index de l'element parmi ses freres deja tagues (plafonne).
  var perParent = new Map ? new Map() : null;
  var parentCount = function (p) {
    if (perParent) { var v = perParent.get(p) || 0; perParent.set(p, v + 1); return v; }
    p.__rc = (p.__rc || 0) + 1; return p.__rc - 1;
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      observer.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  var i, el;
  for (i = 0; i < nodes.length; i++) {
    el = nodes[i];
    if (el.__revealReady) continue;
    el.__revealReady = true;
    if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
    var idx = el.parentElement ? parentCount(el.parentElement) : 0;
    el.style.setProperty('--i', Math.min(idx, 8));
    observer.observe(el);
  }

  // Filet : au cas ou un element resterait non declenche (au-dessus du viewport
  // ou observer en retard), on revele apres 1.4s tout ce qui est deja visible.
  setTimeout(function () {
    document.querySelectorAll('[data-reveal]:not(.is-in)').forEach(function (n) {
      var r = n.getBoundingClientRect();
      if (r.top < (window.innerHeight || 0) * 0.98) {
        n.classList.add('is-in');
        observer.unobserve(n);
      }
    });
  }, 1400);

  /* ---------------------------------------------------------------------------
     2) BARRE DE PROGRESSION DE LECTURE
     --------------------------------------------------------------------------- */
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  /* ---------------------------------------------------------------------------
     3) ETAT SCROLLE DU MENU
     --------------------------------------------------------------------------- */
  var nav = document.getElementById('nav');

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    rAF(function () {
      var st = window.pageYOffset || root.scrollTop || 0;
      var h = root.scrollHeight - root.clientHeight;
      bar.style.setProperty('--sp', h > 0 ? (st / h).toFixed(4) : 0);
      if (nav) nav.classList.toggle('is-scrolled', st > 10);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------------
     4) COMPTEURS DE STATS
     On anime UNIQUEMENT les nombres surs (entier eventuellement suffixe de
     % + x k). On restaure toujours le texte exact d'origine a la fin.
     --------------------------------------------------------------------------- */
  var COUNTER_SEL = '.stat__val, .city-stat__num, .stat-c__v, .hero-stats strong, [data-count]';
  var counters = document.querySelectorAll(COUNTER_SEL);

  function animateCount(node) {
    if (node.children.length) return;                // seulement les noeuds texte purs (pas de <em> a casser)
    var original = node.textContent.trim();
    // Format accepte : prefixe(+/~) chiffres(avec espaces/points milliers) suffixe(%,+,x,k,h...)
    var m = original.match(/^([^\d]*)([\d][\d\s . ]*)([^\d]*)$/);
    if (!m) return;                                  // valeurs type "4,9/5" -> on ne touche pas
    var prefix = m[1] || '', suffix = m[3] || '';
    var digits = m[2].replace(/[\s. ]/g, '');
    var target = parseInt(digits, 10);
    if (!isFinite(target) || target <= 0 || target > 100000000) return;
    var grouped = /[\s. ]/.test(m[2]);          // le nombre d'origine a des separateurs de milliers
    var dur = 1200, start = null;

    function fmt(v) {
      var s = String(v);
      if (grouped) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return prefix + s + suffix;
    }
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);            // easeOutCubic
      node.textContent = fmt(Math.round(eased * target));
      if (p < 1) rAF(step); else node.textContent = original;  // texte exact restaure
    }
    node.setAttribute('data-count', '');
    rAF(step);
  }

  if (counters.length) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        animateCount(en.target);
        cObs.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cObs.observe(c); });
  }
})();
