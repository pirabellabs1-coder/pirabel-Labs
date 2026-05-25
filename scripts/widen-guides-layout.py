#!/usr/bin/env python3
"""Elargit le layout des guides : max-width 48rem -> 72rem (768px -> 1152px).
Ameliore aussi l'espacement (padding lateral + typography pour grand format)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDES_DIRS = [ROOT / 'guides', ROOT / 'en' / 'guides']

# Old narrow + new wide
OLD = 'max-width:48rem;margin:0 auto;padding:0 var(--px-page) 4rem;'
NEW = ('max-width:72rem;margin:0 auto;padding:0 var(--px-page) 4rem;'
       'display:grid;grid-template-columns:minmax(0,1fr);gap:0;')

# Slight tweaks for readability at wider width
OLD_P = '.article-body p{color:rgba(229,226,225,0.75);line-height:1.85;margin-bottom:1.25rem;font-size:1.0625rem;}'
NEW_P = '.article-body p{color:rgba(229,226,225,0.75);line-height:1.85;margin-bottom:1.25rem;font-size:1.0625rem;max-width:60rem;}'

OLD_LIST = '.article-body ul,.article-body ol{color:rgba(229,226,225,0.75);line-height:1.85;margin-bottom:1.25rem;padding-left:1.5rem;font-size:1.0625rem;}'
NEW_LIST = '.article-body ul,.article-body ol{color:rgba(229,226,225,0.75);line-height:1.85;margin-bottom:1.25rem;padding-left:1.5rem;font-size:1.0625rem;max-width:60rem;}'

# H2 slightly larger for wider canvas
OLD_H2 = '.article-body h2{font-family:var(--font-headline);font-size:1.75rem;font-weight:700;color:var(--on-surface);margin:3rem 0 1rem;padding-top:1rem;}'
NEW_H2 = '.article-body h2{font-family:var(--font-headline);font-size:2.125rem;font-weight:700;color:var(--on-surface);margin:3.5rem 0 1.25rem;padding-top:1rem;letter-spacing:-0.02em;}'

# Inline CTA full-width within wider container
OLD_CTA = '.inline-cta{background:linear-gradient(135deg,rgba(255,87,8,0.08),rgba(255,87,8,0.03));border:1px solid rgba(255,87,8,0.2);padding:2rem;margin:2.5rem 0;text-align:center;}'
NEW_CTA = '.inline-cta{background:linear-gradient(135deg,rgba(255,87,8,0.08),rgba(255,87,8,0.03));border:1px solid rgba(255,87,8,0.2);padding:2.5rem 3rem;margin:3rem 0;text-align:center;max-width:60rem;}'

# TOC sticky on wide screens
OLD_TOC = '.toc{background:var(--surface-container-lowest);border:1px solid rgba(92,64,55,0.12);padding:2rem;margin-bottom:3rem;}'
NEW_TOC = '.toc{background:var(--surface-container-lowest);border:1px solid rgba(92,64,55,0.12);padding:2rem;margin-bottom:3rem;max-width:60rem;}'

REPLACEMENTS = [
    (OLD, NEW),
    (OLD_P, NEW_P),
    (OLD_LIST, NEW_LIST),
    (OLD_H2, NEW_H2),
    (OLD_CTA, NEW_CTA),
    (OLD_TOC, NEW_TOC),
]

count = 0
for d in GUIDES_DIRS:
    if not d.exists():
        continue
    for p in d.glob('*.html'):
        if p.name == 'index.html':
            continue
        try:
            text = p.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        new = text
        for old, new_val in REPLACEMENTS:
            if old in new:
                new = new.replace(old, new_val)
        if new != text:
            p.write_text(new, encoding='utf-8')
            count += 1

print(f"Guides elargis : {count}")
