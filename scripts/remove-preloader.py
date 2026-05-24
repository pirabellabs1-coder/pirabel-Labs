#!/usr/bin/env python3
"""Supprime le preloader HTML de toutes les pages.

Le preloader bloque le FCP/LCP de ~2s (fausse barre de progression JS).
Apres suppression: FCP/LCP devraient passer de ~9-12s a ~2-4s.

CSS et JS du preloader sont laisses en place (dead code, mais pas dangereux).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

# Pattern: preloader block, on one or multiple lines
PRELOADER_RE = re.compile(
    r'<div id="preloader">.*?</div>\s*</div>\s*<div class="pre-pct">[^<]*</div>\s*</div>',
    re.DOTALL,
)

# Alternative: pattern catching the full block as it appears in most files
PRELOADER_RE2 = re.compile(
    r'<div id="preloader"><div class="pre-logo">[^<]*</div><div class="pre-bar"><div class="pre-bar-fill"></div></div><div class="pre-pct">[^<]*</div></div>\s*',
)

# Even more flexible: anything starting with <div id="preloader"> until first </div></div></div>
PRELOADER_RE3 = re.compile(
    r'<div id="preloader">.*?</div></div></div>\s*',
    re.DOTALL,
)

def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

count = 0
for path in iter_html():
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if '<div id="preloader"' not in text:
        continue
    new = PRELOADER_RE3.sub('', text)
    if new == text:
        # Try other patterns
        new = PRELOADER_RE2.sub('', text)
    if new == text:
        new = PRELOADER_RE.sub('', text)
    if new != text:
        path.write_text(new, encoding='utf-8')
        count += 1

print(f"Pages avec preloader retire: {count}")
