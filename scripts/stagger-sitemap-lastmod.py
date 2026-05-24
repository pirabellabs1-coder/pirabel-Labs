#!/usr/bin/env python3
"""
Mets a jour les <lastmod> du sitemap de maniere realiste:
- URLs cles (homepages, a-propos, abomey-calavi)         -> 2026-05-24 (auj)
- Toutes les URLs /en/agence-*                            -> 2026-05-23 (hier)
- Toutes les URLs /guides/*                               -> 2026-05-22
- URLs FR /agence-*                                       -> 2026-05-21
- Le reste                                                -> 2026-05-20

Resultat: signal de "update wave" sur 5 jours plutot qu'un seul.
Idempotent.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITEMAP = ROOT / 'sitemap.xml'

URL_BLOCK = re.compile(
    r'(<url>\s*<loc>([^<]+)</loc>.*?<lastmod>)([^<]+)(</lastmod>.*?</url>)',
    re.DOTALL,
)

CRITICAL_URLS = {
    'https://www.pirabellabs.com/',
    'https://www.pirabellabs.com/en/',
    'https://www.pirabellabs.com/a-propos',
    'https://www.pirabellabs.com/en/a-propos',
    'https://www.pirabellabs.com/agence-seo-referencement-naturel/abomey-calavi',
    'https://www.pirabellabs.com/en/agence-seo-referencement-naturel/abomey-calavi',
    'https://www.pirabellabs.com/agence-seo-referencement-naturel',
    'https://www.pirabellabs.com/en/agence-seo-referencement-naturel',
    'https://www.pirabellabs.com/contact',
    'https://www.pirabellabs.com/en/contact',
}

def pick_date(url: str) -> str:
    if url in CRITICAL_URLS:
        return '2026-05-24'
    if '/en/agence-' in url:
        return '2026-05-23'
    if '/guides/' in url:
        return '2026-05-22'
    if url.startswith('https://www.pirabellabs.com/agence-'):
        return '2026-05-21'
    return '2026-05-20'

text = SITEMAP.read_text(encoding='utf-8')

def repl(m):
    prefix, url, old_date, suffix = m.group(1), m.group(2), m.group(3), m.group(4)
    new_date = pick_date(url.strip())
    if new_date == old_date.strip():
        return m.group(0)
    return f'{prefix}{new_date}{suffix}'

new_text = URL_BLOCK.sub(repl, text)
SITEMAP.write_text(new_text, encoding='utf-8')

# Quick stats
from collections import Counter
dates = re.findall(r'<lastmod>([^<]+)</lastmod>', new_text)
counts = Counter(dates)
print("Distribution des lastmod apres patch:")
for d, n in sorted(counts.items(), reverse=True):
    print(f"  {d}: {n} URLs")
