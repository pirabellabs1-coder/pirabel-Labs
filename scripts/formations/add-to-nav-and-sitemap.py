#!/usr/bin/env python3
"""Ajoute 'FORMATIONS' au menu nav sur toutes les pages + ajoute les URLs au sitemap."""
import sys, re
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from catalog import FORMATIONS

ROOT = Path(__file__).resolve().parents[2]
EXCLUDE = {'.git', 'node_modules', 'app', 'scripts'}

# Add link "FORMATIONS" after "GUIDES" in nav
PATTERNS_FR = [
    (r'(<a href="/guides/?"[^>]*>GUIDES</a>|<a href="guides/?"[^>]*>GUIDES</a>)', r'\1<a href="/formations/">FORMATIONS</a>'),
    (r'(<a href="\.\./guides/?"[^>]*>GUIDES</a>)', r'\1<a href="/formations/">FORMATIONS</a>'),
]
PATTERNS_EN = [
    (r'(<a href="/en/guides/?"[^>]*>GUIDES</a>|<a href="\.\.\/guides/?"[^>]*>GUIDES</a>)', r'\1<a href="/en/formations/">TRAININGS</a>'),
]

# Mobile nav too
MOB_PATTERNS_FR = [
    (r'(<a href="/guides/?"[^>]*>Guides</a>|<a href="guides/?"[^>]*>Guides</a>)', r'\1<a href="/formations/">Formations</a>'),
]
MOB_PATTERNS_EN = [
    (r'(<a href="/en/guides/?"[^>]*>Guides</a>|<a href="\.\.\/guides/?"[^>]*>Guides</a>)', r'\1<a href="/en/formations/">Trainings</a>'),
]


def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE for part in p.parts):
            continue
        # Skip formation pages themselves (already have FORMATIONS in nav)
        if '/formations/' in str(p).replace('\\', '/'):
            continue
        yield p


def is_english(path: Path):
    return any(part == 'en' for part in path.parts)


count_nav = 0
for p in iter_html():
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if '>FORMATIONS<' in text or '>TRAININGS<' in text:
        continue  # already updated
    new = text
    if is_english(p):
        for pat, repl in PATTERNS_EN:
            new = re.sub(pat, repl, new)
        for pat, repl in MOB_PATTERNS_EN:
            new = re.sub(pat, repl, new)
    else:
        for pat, repl in PATTERNS_FR:
            new = re.sub(pat, repl, new)
        for pat, repl in MOB_PATTERNS_FR:
            new = re.sub(pat, repl, new)
    if new != text:
        p.write_text(new, encoding='utf-8')
        count_nav += 1

print(f"Pages avec FORMATIONS ajoute au nav: {count_nav}")


# Sitemap : add 62 URLs
sitemap = ROOT / 'sitemap.xml'
text = sitemap.read_text(encoding='utf-8')
new_urls = []

def entry(loc, prio='0.85', lastmod='2026-05-24'):
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

# Catalog
for loc in [
    'https://www.pirabellabs.com/formations/',
    'https://www.pirabellabs.com/en/formations/',
]:
    if loc not in text:
        new_urls.append(entry(loc, prio='0.9'))

# 30 formations FR + EN
for f in FORMATIONS:
    for loc in [
        f"https://www.pirabellabs.com/formations/{f['slug']}",
        f"https://www.pirabellabs.com/en/formations/{f['slug']}",
    ]:
        if loc not in text:
            new_urls.append(entry(loc))

if new_urls:
    text = text.replace('</urlset>', ''.join(new_urls) + '</urlset>')
    sitemap.write_text(text, encoding='utf-8')

print(f"URLs ajoutees au sitemap: {len(new_urls)}")
