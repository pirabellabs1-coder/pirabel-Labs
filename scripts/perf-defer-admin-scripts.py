#!/usr/bin/env python3
"""Defer les scripts render-blocking sur les pages admin (sidebar.js, Chart.js)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ADMIN = ROOT / 'app' / 'views'

PATTERNS = [
    # sidebar.js sans defer
    (re.compile(r'<script\s+src="/js/sidebar\.js([^"]*)"\s*>\s*</script>'),
     r'<script src="/js/sidebar.js\1" defer></script>'),
    (re.compile(r'<script\s+src="js/sidebar\.js([^"]*)"\s*>\s*</script>'),
     r'<script src="js/sidebar.js\1" defer></script>'),
    # Chart.js CDN sans defer
    (re.compile(r'<script\s+src="(https://cdn\.jsdelivr\.net/npm/chart\.js[^"]+)"\s*>\s*</script>'),
     r'<script src="\1" defer></script>'),
]

count = 0
for p in ADMIN.glob('*.html'):
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    orig = text
    for pat, rep in PATTERNS:
        text = pat.sub(rep, text)
    if text != orig:
        p.write_text(text, encoding='utf-8')
        count += 1

print(f"Pages admin defer-ees: {count}")
