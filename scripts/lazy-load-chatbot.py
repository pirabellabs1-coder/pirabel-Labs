#!/usr/bin/env python3
"""Convertit le chargement chatbot.js (125KB) en lazy : load au 1er scroll/mousemove.

Avant : <script src="/js/chatbot.js" defer></script>  (charge a chaque page)
Apres : <script>...load on intent</script>  (charge au scroll/touch/mousemove)
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', 'node_modules', 'scripts', 'app'}

# Pattern : <script src="/js/chatbot.js" defer></script> (avec ou sans /)
CHATBOT_PATTERNS = [
    re.compile(r'<script\s+src="/?js/chatbot\.js[^"]*"\s*(?:defer\s*)?>\s*</script>'),
    re.compile(r'<script\s+src="\.\./js/chatbot\.js[^"]*"\s*(?:defer\s*)?>\s*</script>'),
    re.compile(r'<script\s+src="\.\./\.\./js/chatbot\.js[^"]*"\s*(?:defer\s*)?>\s*</script>'),
]

LAZY_SNIPPET = """<script>
(function(){
  if (window.__chatbotLoaded) return;
  let loaded = false;
  const path = (typeof location !== 'undefined' && location.pathname.split('/').filter(Boolean).length >= 2)
    ? '../../js/chatbot.js'
    : (location.pathname.split('/').filter(Boolean).length === 1 ? '../js/chatbot.js' : 'js/chatbot.js');
  function load() {
    if (loaded) return; loaded = true; window.__chatbotLoaded = true;
    const s = document.createElement('script');
    s.src = '/js/chatbot.js';
    s.defer = true;
    document.body.appendChild(s);
    cleanup();
  }
  function cleanup() {
    ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'].forEach(e => removeEventListener(e, load, { passive: true }));
  }
  ['scroll', 'mousemove', 'touchstart', 'click', 'keydown'].forEach(e => addEventListener(e, load, { once: true, passive: true }));
  // Fallback : si pas d'interaction, charger apres 5s
  setTimeout(load, 5000);
})();
</script>"""

count = 0
for p in ROOT.rglob('*.html'):
    if any(part in EXCLUDE for part in p.parts):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if 'chatbot.js' not in text:
        continue
    orig = text
    for pat in CHATBOT_PATTERNS:
        text = pat.sub(LAZY_SNIPPET, text)
    if text != orig:
        p.write_text(text, encoding='utf-8')
        count += 1

print(f"Pages avec chatbot lazy-load: {count}")
