/**
 * Scènes animées au défilement (GSAP + ScrollTrigger + Lenis), chargées en différé
 * par motion.ts. En mode doux (html.motion-soft : le système demande moins de mouvement),
 * seuls les compteurs et le fil de progression restent ; ni défilement fluide, ni parallaxe,
 * ni section épinglée, ni effet aimanté.
 *
 *   data-parallax="-0.12"                 parallaxe verticale liée au défilement
 *   data-count="147" data-decimals="1"    compteur animé (texte final déjà dans le HTML)
 *   data-magnetic                         bouton aimanté (souris uniquement)
 *   data-hscroll / data-hscroll-track     section épinglée à défilement horizontal (desktop)
 *   data-stack / data-stack-card          cartes empilées qui reculent
 *   data-steps / data-steps-line / data-step   fil de progression d'une méthode
 *   data-hero-scene / data-depth          cartes du hero qui suivent la souris
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const soft = document.documentElement.classList.contains('motion-soft');

function initLenis() {
  if (soft || !finePointer()) return;
  const lenis = new Lenis({
    lerp: 0.11,
    anchors: { offset: -100 },
    allowNestedScroll: true,
    prevent: (node: HTMLElement) => node.closest?.('[data-lenis-prevent], .mega, dialog') != null,
  });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function initCounters() {
  const fmt = (v: number, decimals: number) =>
    v.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).replace(/ /g, ' ');
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count || '0');
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const final = el.textContent;
    if (Number.isNaN(target)) return;
    // Déjà vu avant le chargement des scènes : on n'anime pas (pas de retour à zéro sous les yeux).
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        const state = { v: 0 };
        gsap.to(state, {
          v: target, duration: 1.8, ease: 'power3.out',
          onUpdate: () => { el.textContent = fmt(state.v, decimals); },
          onComplete: () => { el.textContent = final; },
        });
      },
    });
  });
}

function initMagnetic() {
  if (soft || !finePointer()) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.28);
      y((e.clientY - (r.top + r.height / 2)) * 0.36);
    });
    el.addEventListener('pointerleave', () => { x(0); y(0); });
  });
}

function initScrollScenes() {
  const mm = gsap.matchMedia();

  mm.add('all', () => {
    if (!soft) document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
      const f = parseFloat(el.dataset.parallax || '0');
      if (!f) return;
      if (el.closest('.ambient')) {
        gsap.fromTo(el, { yPercent: 0 }, { yPercent: f * 100, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
        return;
      }
      // Plage symétrique : décalage nul au milieu du parcours, donc aucun saut à l'initialisation.
      gsap.fromTo(el, { yPercent: -f * 50 }, {
        yPercent: f * 50, ease: 'none',
        scrollTrigger: { trigger: el.closest('section, footer') || el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    document.querySelectorAll<HTMLElement>('[data-steps]').forEach((wrap) => {
      const line = wrap.querySelector<HTMLElement>('[data-steps-line]');
      if (line) {
        gsap.fromTo(line, { scaleY: 0 }, {
          scaleY: 1, ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top 65%', end: 'bottom 60%', scrub: true },
        });
      }
      wrap.querySelectorAll<HTMLElement>('[data-step]').forEach((step) => {
        ScrollTrigger.create({
          trigger: step, start: 'top 62%', end: 'bottom 38%',
          onToggle: (self) => step.classList.toggle('is-active', self.isActive),
          onEnter: () => step.classList.add('is-done'),
        });
      });
    });
  });

  if (!soft) mm.add('(min-width: 1024px)', () => {
    document.querySelectorAll<HTMLElement>('[data-hscroll]').forEach((section) => {
      const track = section.querySelector<HTMLElement>('[data-hscroll-track]');
      if (!track) return;
      section.classList.add('is-pinned');
      const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top top', end: () => '+=' + distance(),
          pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
        },
      });
      return () => { section.classList.remove('is-pinned'); tween.kill(); };
    });

    document.querySelectorAll<HTMLElement>('[data-stack]').forEach((stack) => {
      const cards = Array.from(stack.querySelectorAll<HTMLElement>('[data-stack-card]'));
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        // La carte reste opaque : on assombrit un voile (opacité, composité) au lieu de la carte.
        const st = { trigger: next, start: 'top 85%', end: 'top 20%', scrub: true };
        gsap.to(card, { scale: 0.94, ease: 'none', scrollTrigger: st });
        const shade = card.querySelector('[data-stack-shade]');
        if (shade) gsap.fromTo(shade, { opacity: 0 }, { opacity: 0.62, ease: 'none', scrollTrigger: { ...st } });
      });
    });
  });

  if (!soft) mm.add('(hover: hover) and (pointer: fine)', () => {
    const scene = document.querySelector<HTMLElement>('[data-hero-scene]');
    if (!scene) return;
    const layers = Array.from(scene.querySelectorAll<HTMLElement>('[data-depth]')).map((el) => ({
      d: parseFloat(el.dataset.depth || '0'),
      x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' }),
    }));
    const onMove = (e: PointerEvent) => {
      const r = scene.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((l) => { l.x(nx * l.d * 60); l.y(ny * l.d * 40); });
    };
    scene.addEventListener('pointermove', onMove);
    return () => scene.removeEventListener('pointermove', onMove);
  });
}

export function initScenes() {
  initLenis();
  initCounters();
  initScrollScenes();
  initMagnetic();
  ScrollTrigger.refresh();
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  if (document.readyState !== 'complete') window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
