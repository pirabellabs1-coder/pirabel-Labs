#!/usr/bin/env python3
"""Ajoute loading='lazy' + decoding='async' aux <img> hors above-the-fold.

Skippe la 1ere img (souvent logo/hero) + skippe celles avec fetchpriority='high'.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', 'node_modules', 'scripts', 'app'}

# Match TOUTE balise <img...> avec ses attributs
IMG_RE = re.compile(r'<img\b([^>]*?)/?>', re.IGNORECASE)

count_files = 0
count_imgs = 0

for p in ROOT.rglob('*.html'):
    if any(part in EXCLUDE for part in p.parts):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if '<img' not in text.lower():
        continue

    found_first = [False]
    modifs = [0]

    def repl(m):
        attrs = m.group(1)
        # Si deja loading=... ou fetchpriority=high, skip
        if re.search(r'\bloading\s*=', attrs, re.IGNORECASE):
            return m.group(0)
        if re.search(r'fetchpriority\s*=\s*[\'"]high[\'"]', attrs, re.IGNORECASE):
            return m.group(0)
        # Skip premiere img de la page (probable logo/hero LCP)
        if not found_first[0]:
            found_first[0] = True
            return m.group(0)
        # Ajout loading=lazy + decoding=async
        modifs[0] += 1
        new_attrs = attrs.rstrip()
        return f'<img{new_attrs} loading="lazy" decoding="async">'

    new_text = IMG_RE.sub(repl, text)
    if modifs[0] > 0:
        p.write_text(new_text, encoding='utf-8')
        count_files += 1
        count_imgs += modifs[0]

print(f"Pages modifiees : {count_files}")
print(f"Images lazy-loaded: {count_imgs}")
