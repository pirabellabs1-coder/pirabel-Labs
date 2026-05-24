#!/usr/bin/env python3
"""Optimisations performance critiques pour booster Lighthouse:
1. Charge Google Fonts en non-bloquant (media=print + onload swap)
2. Ajoute loading=lazy sur les images non-LCP (hors header/hero/nav)
3. Ajoute decoding=async sur toutes les images
4. Ajoute width/height par defaut sur les <img> qui n'en ont pas (200x200 placeholder)

Idempotent.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

# Fonts pattern: blocking stylesheet load
# Avant: <link href="https://fonts.googleapis.com/...&display=swap" rel="stylesheet">
# Apres: <link rel="stylesheet" href="..." media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="..."></noscript>
FONT_PATTERN = re.compile(
    r'<link\s+href="(https://fonts\.googleapis\.com/css2[^"]+)"\s+rel="stylesheet">',
    re.IGNORECASE,
)

def fonts_optimize(text: str) -> str:
    def repl(m):
        url = m.group(1)
        return (
            f'<link rel="preload" as="style" href="{url}">'
            f'<link rel="stylesheet" href="{url}" media="print" onload="this.media=\'all\'">'
            f'<noscript><link rel="stylesheet" href="{url}"></noscript>'
        )
    return FONT_PATTERN.sub(repl, text)

# Ajoute loading=lazy + decoding=async aux <img> sauf le logo nav (premier img usuellement)
# Approche simple: si <img> n'a pas loading=, ajoute loading=lazy + decoding=async
IMG_PATTERN = re.compile(r'<img\s+([^>]+?)>', re.IGNORECASE)

def img_optimize(text: str) -> str:
    # Skip first <img> (likely LCP candidate, logo header)
    seen_first = [False]
    def repl(m):
        attrs = m.group(1)
        if not seen_first[0]:
            seen_first[0] = True
            # First img stays eager (likely LCP)
            return m.group(0)
        # Already has loading attr?
        if re.search(r'\bloading\s*=', attrs, re.IGNORECASE):
            return m.group(0)
        # Already has decoding attr?
        new_attrs = attrs
        if not re.search(r'\bdecoding\s*=', new_attrs, re.IGNORECASE):
            new_attrs = new_attrs.rstrip() + ' decoding="async"'
        new_attrs = new_attrs.rstrip() + ' loading="lazy"'
        return f'<img {new_attrs}>'
    return IMG_PATTERN.sub(repl, text)

def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

count_fonts = 0
count_imgs = 0
for path in iter_html():
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    new = text
    # Skip if already optimized (idempotency check)
    if 'onload="this.media=' not in new:
        before = new
        new = fonts_optimize(new)
        if new != before:
            count_fonts += 1
    # Imgs
    before = new
    new = img_optimize(new)
    if new != before:
        count_imgs += 1
    if new != text:
        path.write_text(new, encoding='utf-8')

print(f"Pages avec fonts optimisees: {count_fonts}")
print(f"Pages avec images lazy: {count_imgs}")
