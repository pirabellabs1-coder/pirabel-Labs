#!/usr/bin/env python3
"""Ajoute au sitemap toutes les pages lecons individuelles (FR + EN).

Les lecons ont desormais ~2400 mots de contenu unique chacune : il faut les
indexer pour qu'elles rankent sur leurs requetes longue traine.

Quiz et certificat pages sont exclus (noindex).
"""
import sys
import re
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from catalog import FORMATIONS

ROOT = Path(__file__).resolve().parents[2]
SITEMAP = ROOT / 'sitemap.xml'

text = SITEMAP.read_text(encoding='utf-8')

new_urls = []


def entry(loc, prio='0.6', lastmod='2026-05-29'):
    fr = loc if '/en/' not in loc else loc.replace('/en/', '/')
    en = loc if '/en/' in loc else loc.replace('https://www.pirabellabs.com/', 'https://www.pirabellabs.com/en/')
    return f'''  <url>
    <loc>{loc}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="{fr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="{en}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="{fr}"/>
    <lastmod>{lastmod}</lastmod>
    <priority>{prio}</priority>
  </url>
'''


for f in FORMATIONS:
    slug = f['slug']
    n_modules = f['modules']
    n_lessons_total = f['lessons']
    lessons_per_module = max(3, n_lessons_total // n_modules)

    lesson_count = 0
    for m_i in range(1, n_modules + 1):
        n_this = lessons_per_module if m_i < n_modules else (n_lessons_total - lesson_count)
        for l_i in range(1, n_this + 1):
            for loc in [
                f"https://www.pirabellabs.com/formations/{slug}/m{m_i}-l{l_i}",
                f"https://www.pirabellabs.com/en/formations/{slug}/m{m_i}-l{l_i}",
            ]:
                if loc not in text:
                    new_urls.append(entry(loc, prio='0.6'))
            lesson_count += 1
            if lesson_count >= n_lessons_total:
                break

if new_urls:
    text = text.replace('</urlset>', ''.join(new_urls) + '</urlset>')
    SITEMAP.write_text(text, encoding='utf-8')

print(f"URLs lecons ajoutees au sitemap: {len(new_urls)}")
