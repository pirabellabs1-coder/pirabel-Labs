#!/usr/bin/env python3
"""Fix: wrap les sections enrichies (<!-- guide-enriched -->) dans un
container responsive pour qu'elles respectent le layout du guide.

Probleme: l'enrichissement avait insere des <section> a plat sans wrapper,
donc elles s'etendaient sur toute la largeur de l'ecran.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Container wrapper styles (cohérent avec .article-body elargie a 72rem)
OPEN_WRAP = (
    '<div class="article-body article-enriched" '
    'style="max-width:72rem;margin:0 auto;padding:0 var(--px-page) 3rem;">'
)
CLOSE_WRAP = '</div>'

# Pattern: capture from <!-- guide-enriched --> until next sentinel or end-of-article
# We'll match the full block injected by enrich-guides-content.py
BLOCK_PATTERN = re.compile(
    r'(<!-- guide-enriched -->)'
    r'(.*?)'
    r'(?=<!-- xlink-services -->|<!-- NEWSLETTER -->|<div class="newsletter">|<footer class="footer">)',
    re.DOTALL,
)

count = 0
for d in (ROOT / 'guides', ROOT / 'en' / 'guides'):
    if not d.exists():
        continue
    for p in d.glob('*.html'):
        if p.name == 'index.html':
            continue
        text = p.read_text(encoding='utf-8', errors='ignore')
        if '<!-- guide-enriched -->' not in text:
            continue
        # Skip if already wrapped (idempotent)
        if 'article-enriched' in text:
            continue
        def replace(m):
            sentinel = m.group(1)
            content = m.group(2)
            return f'{sentinel}\n{OPEN_WRAP}\n{content}\n{CLOSE_WRAP}\n'
        new_text = BLOCK_PATTERN.sub(replace, text, count=1)
        if new_text != text:
            p.write_text(new_text, encoding='utf-8')
            count += 1

print(f"Guides wrappes : {count}")
