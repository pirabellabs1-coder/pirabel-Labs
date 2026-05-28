#!/usr/bin/env python3
"""Performance: ajoute 'defer' a js/global.js + loading='lazy' aux <img> hors fold."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', 'node_modules', 'scripts', 'app'}

# 1) Patterns global.js sans defer
SCRIPT_PATTERNS = [
    (re.compile(r'<script src="js/global\.js([^"]*)"></script>'),
     r'<script src="js/global.js\1" defer></script>'),
    (re.compile(r'<script src="/js/global\.js([^"]*)"></script>'),
     r'<script src="/js/global.js\1" defer></script>'),
    (re.compile(r'<script src="\.\./js/global\.js([^"]*)"></script>'),
     r'<script src="../js/global.js\1" defer></script>'),
    (re.compile(r'<script src="\.\./\.\./js/global\.js([^"]*)"></script>'),
     r'<script src="../../js/global.js\1" defer></script>'),
]

# 2) <img ... > sans loading=
# - On evite la 1ere image (souvent logo/hero)
# - On ajoute loading="lazy" + decoding="async"
IMG_PATTERN = re.compile(r'<img\b([^>]*?)>', re.IGNORECASE)

def add_lazy_to_img(match, is_first=False):
    attrs = match.group(1)
    if 'loading=' in attrs.lower() or 'fetchpriority=' in attrs.lower():
        return match.group(0)
    if is_first:
        return match.group(0)  # skip first image
    # Add loading + decoding
    return f'<img{attrs} loading="lazy" decoding="async">'

defer_count = 0
img_count = 0
img_replacements = 0

for p in ROOT.rglob('*.html'):
    if any(part in EXCLUDE for part in p.parts):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue

    orig = text
    # Defer global.js
    for pat, rep in SCRIPT_PATTERNS:
        text = pat.sub(rep, text)

    # Lazy-load images (skip 1st)
    found_first = [False]
    def img_repl(m):
        is_first = not found_first[0]
        found_first[0] = True
        result = add_lazy_to_img(m, is_first=is_first)
        return result
    new_text, n_img = IMG_PATTERN.subn(img_repl, text)

    if new_text != orig:
        p.write_text(new_text, encoding='utf-8')
        if 'defer></script>' in new_text and 'defer></script>' not in orig:
            defer_count += 1
        # Count net replacements (those that actually added loading)
        added = new_text.count(' loading="lazy"') - orig.count(' loading="lazy"')
        if added > 0:
            img_count += 1
            img_replacements += added

print(f"Defer global.js  : {defer_count} pages")
print(f"Lazy-load images : {img_count} pages, {img_replacements} img total")
