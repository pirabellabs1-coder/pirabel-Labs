/**
 * Moteur des « projets en orbite » (voir Orbit.astro).
 * - Remplace la liste de repli par les réalisations publiées (GET /api/realisations).
 * - Fait graviter les écrans sur une ellipse inclinée (profondeur : taille, opacité, plan).
 * - Toutes les 5,5 s, le projet au premier plan quitte l'orbite et se pose dans le panneau
 *   « À la une » ; le précédent retourne en orbite. Survol / focus = choix du visiteur.
 * Transform + opacité uniquement ; pause hors écran, au survol et via le bouton (WCAG 2.2.2).
 * Mouvement réduit : grille statique, le panneau suit simplement le survol / focus.
 */
import { ORBIT_FEATURED_SLUGS } from '../data/orbit';

type Live = { title: string; slug: string; sector: string; excerpt: string; image: string; imageAlt: string };
type Item = { el: HTMLLIElement; base: number; docked: boolean; flying: boolean; x: number; y: number; s: number; z: number };

const TURN_MS = 52000; // un tour complet
const DOCK_EVERY = 5500;
const FLIGHT_MS = 950;
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

const hue = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const safeImage = (u: string) => (/^(\/media\/[\w-]+|\/img\/realisations\/[\w.-]+\.(webp|jpe?g|png|avif)|https:\/\/[^\s"'<>]+)$/.test(u) ? u : '');

async function loadLive(list: HTMLUListElement): Promise<void> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 4000);
  try {
    const res = await fetch('/api/realisations?limit=18', { signal: ctrl.signal, headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const data = await res.json();
    const items: Live[] = (Array.isArray(data?.items) ? data.items : [])
      .filter((c: Live) => c && typeof c.title === 'string' && typeof c.slug === 'string' && !ORBIT_FEATURED_SLUGS.includes(c.slug))
      .slice(0, 14);
    if (items.length < 4) return;
    // Construction par l'API DOM (jamais d'innerHTML avec des données distantes).
    const frag = document.createDocumentFragment();
    items.forEach((c) => {
      const li = document.createElement('li');
      li.className = 'orbit__item';
      li.dataset.title = c.title;
      li.dataset.sector = c.sector || '';
      li.dataset.text = c.excerpt || '';
      const a = document.createElement('a');
      a.className = 'orbit__screen';
      a.href = '/realisations/' + encodeURIComponent(c.slug);
      const shot = document.createElement('span');
      shot.className = 'orbit__shot';
      shot.style.setProperty('--h', String(hue(c.title)));
      const img = safeImage(String(c.image || ''));
      if (img) {
        const im = document.createElement('img');
        im.src = img; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async'; im.width = 320; im.height = 200;
        shot.appendChild(im);
      } else {
        const bar = document.createElement('span'); bar.className = 'orbit__bar'; bar.innerHTML = '<i></i><i></i><i></i>';
        const ini = document.createElement('span'); ini.className = 'orbit__initial'; ini.textContent = c.title.charAt(0);
        const lab = document.createElement('span'); lab.className = 'orbit__label';
        const b = document.createElement('b'); b.textContent = c.title.split(/\s[—–:-]\s/)[0].slice(0, 40);
        const sm = document.createElement('small'); sm.textContent = c.sector || '';
        lab.append(b, sm);
        shot.append(bar, ini, lab);
      }
      const name = document.createElement('span');
      name.className = 'orbit__name';
      name.textContent = c.title.split(/\s[—–:-]\s/)[0].slice(0, 40);
      a.append(shot, name);
      li.appendChild(a);
      frag.appendChild(li);
    });
    list.replaceChildren(frag);
  } catch { /* hors ligne ou API indisponible : on garde la liste de repli */ } finally {
    window.clearTimeout(timer);
  }
}

export async function initOrbit(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>('[data-orbit-stage]');
  const list = root.querySelector<HTMLUListElement>('[data-orbit-list]');
  const dockEl = root.querySelector<HTMLElement>('[data-orbit-dock]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-orbit-toggle]');
  const info = root.querySelector<HTMLElement>('[data-spot-info]');
  if (!stage || !list || !dockEl || !info) return;
  const f = {
    sector: info.querySelector<HTMLElement>('[data-spot-sector]'),
    title: info.querySelector<HTMLElement>('[data-spot-title]'),
    text: info.querySelector<HTMLElement>('[data-spot-text]'),
    link: info.querySelector<HTMLAnchorElement>('[data-spot-link]'),
  };

  await loadLive(list);

  // user = true : choix du visiteur (annoncé aux lecteurs d'écran) ; false : rotation automatique (silencieuse).
  const showInfo = (li: HTMLLIElement, user = false) => {
    info.setAttribute('aria-live', user ? 'polite' : 'off');
    const a = li.querySelector('a');
    info.classList.remove('is-swap');
    void info.offsetWidth; // relance l'animation de fondu
    info.classList.add('is-swap');
    if (f.sector) f.sector.textContent = li.dataset.sector || '';
    if (f.title) f.title.textContent = li.dataset.title || '';
    if (f.text) f.text.textContent = li.dataset.text || '';
    if (f.link && a) f.link.href = a.getAttribute('href') || '/realisations';
  };

  const soft = document.documentElement.classList.contains('motion-soft');
  const lis = () => Array.from(list.querySelectorAll<HTMLLIElement>('.orbit__item'));

  // Mode doux (système qui réduit les animations) : l'orbite tourne quand même, 1,6 fois plus lentement,
  // et reste suspendable par le bouton pause (WCAG 2.2.2).
  const turnMs = soft ? TURN_MS * 1.6 : TURN_MS;
  const dockEvery = soft ? DOCK_EVERY * 1.3 : DOCK_EVERY;

  root.classList.add('is-orbiting');
  const items: Item[] = lis().map((el, i, arr) => ({ el, base: (i / arr.length) * Math.PI * 2, docked: false, flying: false, x: 0, y: 0, s: 1, z: 0 }));
  let w0 = 300, h0 = 220, k = 0.5, cx = 0, cy = 0, rx = 300, ry = 90;
  let t = 0, last = performance.now(), sinceDock = 0;
  let paused = false, hovering = false, visible = false, raf = 0;
  let current: Item | null = null;

  // Les écrans ont la taille du panneau « À la une » et sont RÉDUITS en orbite :
  // ils ne sont jamais agrandis au-delà de 1, donc restent nets une fois posés.
  const measure = () => {
    const r = stage.getBoundingClientRect();
    const dr = dockEl.getBoundingClientRect();
    w0 = Math.round(dr.width) || 300;
    items.forEach((i) => { i.el.style.width = w0 + 'px'; });
    h0 = items[0]?.el.offsetHeight || w0 * 0.72;
    k = Math.min(172, Math.max(104, r.width * 0.14)) / w0;
    const vw = w0 * k, vh = h0 * k;
    cx = r.width / 2;
    cy = r.height / 2;
    rx = Math.max(110, r.width / 2 - vw * 0.62);
    ry = Math.max(44, Math.min(r.height / 2 - vh * 0.62, rx * 0.4));
    stage.style.setProperty('--rx', rx + 'px');
    stage.style.setProperty('--ry', ry + 'px');
  };

  const orbitPos = (it: Item, time: number) => {
    const a = it.base + (time / turnMs) * Math.PI * 2;
    const depth = (Math.sin(a) + 1) / 2; // 0 = derrière, 1 = devant
    return {
      x: cx + Math.cos(a) * rx - w0 / 2,
      y: cy + Math.sin(a) * ry - h0 / 2,
      s: k * (0.6 + depth * 0.52),
      o: 0.32 + depth * 0.68,
      z: Math.round(depth * 40) + (depth > 0.5 ? 60 : 0), // le cœur est au plan 50
      depth,
    };
  };
  const tf = (x: number, y: number, s: number) => `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;

  const dockPos = () => {
    const sr = stage.getBoundingClientRect();
    const dr = dockEl.getBoundingClientRect();
    const s = Math.min(dr.width / w0, dr.height / h0);
    return { x: dr.left - sr.left + dr.width / 2 - w0 / 2, y: dr.top - sr.top + dr.height / 2 - h0 / 2, s };
  };

  const fly = (it: Item, to: { x: number; y: number; s: number }, lift: number, done: () => void) => {
    it.flying = true;
    it.el.style.zIndex = '200';
    it.el.style.opacity = '1';
    const from = tf(it.x, it.y, it.s);
    const mx = (it.x + to.x) / 2, my = Math.min(it.y, to.y) - lift, ms = Math.max(it.s, to.s) * 1.06;
    const anim = it.el.animate(
      [{ transform: from }, { transform: tf(mx, my, ms), offset: 0.5 }, { transform: tf(to.x, to.y, to.s) }],
      { duration: FLIGHT_MS, easing: EASE, fill: 'forwards' },
    );
    anim.onfinish = () => {
      it.x = to.x; it.y = to.y; it.s = to.s;
      it.el.style.transform = tf(to.x, to.y, to.s);
      anim.cancel();
      it.flying = false;
      done();
    };
  };

  const dock = (it: Item, user = false) => {
    if (current === it || it.flying) return;
    const prev = current;
    current = it;
    it.docked = true;
    it.el.classList.add('is-docked');
    showInfo(it.el, user);
    fly(it, dockPos(), 60, () => { it.el.style.zIndex = '150'; });
    if (prev) {
      prev.el.classList.remove('is-docked');
      const target = orbitPos(prev, t + (running() ? FLIGHT_MS : 0));
      fly(prev, target, 40, () => { prev.docked = false; });
    }
    sinceDock = 0;
  };

  const running = () => !paused && !hovering && visible;

  const frame = (now: number) => {
    const dt = Math.min(64, now - last);
    last = now;
    if (running()) { t += dt; sinceDock += dt; }
    for (const it of items) {
      if (it.docked || it.flying) continue;
      const p = orbitPos(it, t);
      it.x = p.x; it.y = p.y; it.s = p.s;
      it.el.style.transform = tf(p.x, p.y, p.s);
      it.el.style.opacity = p.o.toFixed(2);
      if (p.z !== it.z) { it.z = p.z; it.el.style.zIndex = String(p.z); }
    }
    if (running() && sinceDock > dockEvery) {
      const front = items.filter((i) => !i.docked && !i.flying).sort((a, b) => orbitPos(b, t).depth - orbitPos(a, t).depth)[0];
      if (front) dock(front);
    }
    raf = visible ? requestAnimationFrame(frame) : 0;
  };

  measure();
  frame(performance.now());
  if (items[0]) dock(items.slice().sort((a, b) => orbitPos(b, 0).depth - orbitPos(a, 0).depth)[0]);

  // Interactions : survol / focus = choisir ; quitter = reprendre la rotation.
  const pick = (e: Event) => {
    const li = (e.target as HTMLElement).closest<HTMLLIElement>('.orbit__item');
    const it = items.find((i) => i.el === li);
    if (it) { hovering = true; dock(it, true); }
  };
  list.addEventListener('pointerover', (e) => { if ((e as PointerEvent).pointerType === 'mouse') pick(e); });
  list.addEventListener('focusin', pick);
  stage.addEventListener('pointerleave', () => { hovering = false; });
  stage.addEventListener('focusout', (e) => { if (!stage.contains(e.relatedTarget as Node)) hovering = false; });

  toggle?.addEventListener('click', () => {
    paused = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(paused));
    const label = toggle.querySelector('.sr-only');
    if (label) label.textContent = paused ? 'Relancer la rotation des projets' : 'Mettre en pause la rotation des projets';
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }).observe(root);

  new ResizeObserver(() => {
    measure();
    if (current && !current.flying) {
      const d = dockPos();
      current.x = d.x; current.y = d.y; current.s = d.s;
      current.el.style.transform = tf(d.x, d.y, d.s);
    }
  }).observe(stage);
}
