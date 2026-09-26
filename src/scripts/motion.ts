/**
 * Moteur d'animation — cœur léger (chargé sur toutes les pages Astro, sans GSAP).
 *
 * API par attributs, pour que les pages restent du HTML simple :
 *   data-reveal[="fade|scale|left|right|title"]  apparition au défilement (CSS + IntersectionObserver)
 *   data-stagger                                 décale les enfants [data-reveal] (--i)
 *   data-inview                                  ajoute .is-in à l'apparition, sans rien masquer
 *   data-marquee-toggle="id"                     bouton pause / lecture d'un bandeau défilant
 *   .spot                                        reflet de verre qui suit le pointeur
 *
 * Les scènes lourdes (défilement fluide, parallaxe, sections épinglées, compteurs,
 * boutons aimantés) sont dans scenes.ts, chargé en différé : au premier geste de
 * l'utilisateur ou quand le navigateur est inactif. Le chargement de la page n'est
 * donc jamais bloqué par GSAP.
 *
 * Garde-fous : tout le contenu est dans le HTML ; sans JS, avec mouvement réduit ou
 * si ce script échoue, rien ne reste masqué (script de tête dans BaseLayout).
 * Le H1 / élément LCP n'est jamais animé.
 */

export {};

declare global {
  interface Window {
    __motionReady?: boolean;
    __lenis?: { scrollTo: (target: number | string | HTMLElement, opts?: object) => void; stop: () => void; start: () => void };
  }
}

const root = document.documentElement;
window.__motionReady = true;
// Démarrage tardif (onglet ouvert en arrière-plan, réseau lent) : le filet de sécurité a retiré
// motion-ok ; on le remet, en marquant d'abord comme « vu » tout ce qui est déjà à l'écran (aucun clignotement).
if (!root.classList.contains('motion-ok') && 'IntersectionObserver' in window) {
  document.querySelectorAll<HTMLElement>('[data-reveal], [data-inview]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
  });
  root.classList.add('motion-ok');
}
const motionOk = root.classList.contains('motion-ok');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Apparitions au défilement ---------- */
function initReveals() {
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      if (child instanceof HTMLElement && child.hasAttribute('data-reveal')) child.style.setProperty('--i', String(i % 8));
    });
  });
  const els = document.querySelectorAll<HTMLElement>('[data-reveal], [data-inview]');
  if (!motionOk || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- Pause des bandeaux défilants (WCAG 2.2.2) ---------- */
function initMarqueeToggles() {
  document.querySelectorAll<HTMLButtonElement>('[data-marquee-toggle]').forEach((btn) => {
    const target = document.getElementById(btn.dataset.marqueeToggle || '');
    if (!target) return;
    const label = btn.querySelector('.sr-only');
    const base = label?.textContent || '';
    btn.addEventListener('click', () => {
      const paused = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(paused));
      target.toggleAttribute('data-paused', paused);
      if (label) label.textContent = paused ? base.replace('Mettre en pause', 'Relancer') : base;
    });
  });
}

/* ---------- Bandeaux défilants : en pause hors de l'écran (économie de batterie) ---------- */
function initMarqueeVisibility() {
  const els = document.querySelectorAll<HTMLElement>('[data-marquee]');
  if (!els.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    (e.target as HTMLElement).toggleAttribute('data-offscreen', !e.isIntersecting);
  }));
  els.forEach((el) => io.observe(el));
}

/* ---------- Reflet de verre qui suit le pointeur ---------- */
function initSpotlight() {
  if (!finePointer) return;
  let frame = 0;
  let last: PointerEvent | null = null;
  document.addEventListener('pointermove', (e) => {
    last = e;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const target = (last?.target as HTMLElement | null)?.closest?.<HTMLElement>('.spot');
      if (!target || !last) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${last.clientX - r.left}px`);
      target.style.setProperty('--my', `${last.clientY - r.top}px`);
    });
  }, { passive: true });
}

/* ---------- Projets en orbite (accueil) : moteur chargé à l'approche de la section ---------- */
function initOrbitLazy() {
  const root = document.querySelector<HTMLElement>('[data-orbit]');
  if (!root || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    import('./orbit').then((m) => m.initOrbit(root)).catch(() => { /* la grille statique reste */ });
  }, { rootMargin: '500px 0px' });
  io.observe(root);
}

/* ---------- Scènes GSAP, chargées en différé ---------- */
function loadScenes() {
  if (!motionOk) return;
  const events = ['scroll', 'pointermove', 'touchstart', 'keydown', 'wheel'];
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    events.forEach((ev) => window.removeEventListener(ev, start));
    import('./scenes').then((m) => m.initScenes()).catch(() => { /* les apparitions CSS suffisent */ });
  };
  events.forEach((ev) => window.addEventListener(ev, start, { once: true, passive: true }));
  const idle = (window as any).requestIdleCallback as ((cb: () => void, o?: { timeout: number }) => number) | undefined;
  if (idle) idle(start, { timeout: 2500 });
  else window.setTimeout(start, 1500);
}

initReveals();
initMarqueeToggles();
initMarqueeVisibility();
initSpotlight();
initOrbitLazy();
loadScenes();
