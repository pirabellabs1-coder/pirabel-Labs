// Injecte la couche d'animation (elan6) dans toutes les pages HTML statiques :
//   1) un snippet en <head> qui pose .anim-on sur <html> (anti-FOUC) uniquement
//      si IntersectionObserver dispo ET prefers-reduced-motion = no-preference ;
//   2) <script defer src="/js/anim.js"> juste avant </body>.
// Idempotent : relancable sans dupliquer. Aucune edition manuelle des pages.
//   node scripts/inject-anim.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const VER = 'elan6';

const HEAD_MARK = 'pl-anim-on';
const HEAD_SNIPPET =
  '<script data-pl="' + HEAD_MARK + '">(function(){try{if(("IntersectionObserver" in window)&&' +
  '!window.matchMedia("(prefers-reduced-motion: reduce)").matches){' +
  'document.documentElement.classList.add("anim-on");}}catch(e){}})();</script>';

const BODY_MARK = '/js/anim.js';
const BODY_SNIPPET = '<script defer src="/js/anim.js?v=' + VER + '"></script>';

let injected = 0, skipped = 0;
for (const f of fs.readdirSync(ROOT).filter(x => x.endsWith('.html'))) {
  const p = path.join(ROOT, f);
  let t = fs.readFileSync(p, 'utf8');
  let changed = false;

  // 1) head snippet
  if (t.indexOf(HEAD_MARK) === -1) {
    if (/<head[^>]*>/i.test(t)) {
      t = t.replace(/<head[^>]*>/i, m => m + '\n' + HEAD_SNIPPET);
      changed = true;
    }
  }
  // 2) bottom script
  if (t.indexOf(BODY_MARK) === -1) {
    if (/<\/body>/i.test(t)) {
      t = t.replace(/<\/body>/i, BODY_SNIPPET + '\n</body>');
      changed = true;
    }
  }

  if (changed) { fs.writeFileSync(p, t); injected++; }
  else skipped++;
}
console.log('anim.js injecte sur', injected, 'pages ( ' + skipped + ' deja a jour / sans balise )');
