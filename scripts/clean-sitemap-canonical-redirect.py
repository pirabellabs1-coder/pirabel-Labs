#!/usr/bin/env python3
"""Retire du sitemap.xml les URLs dont le canonical pointe ailleurs
(consolide en consequence apres fix-duplicate-canonical.py)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sitemap = ROOT / 'sitemap.xml'

INTERNATIONAL_CITIES = ['paris', 'marseille', 'lyon', 'bruxelles', 'montreal',
                        'casablanca', 'dakar', 'abidjan', 'tunis']
CATEGORIES = [
    'agence-seo-referencement-naturel',
    'agence-creation-sites-web',
    'agence-design-branding',
    'agence-email-marketing-crm',
    'agence-ia-automatisation',
    'agence-publicite-payante-sea-ads',
    'agence-redaction-content-marketing',
    'agence-sales-funnels-cro',
    'agence-social-media',
    'agence-video-motion-design',
]

text = sitemap.read_text(encoding='utf-8')

# Pattern: <url>...<loc>X</loc>...</url> bloc
URL_BLOCK_RE = re.compile(
    r'  <url>\s*<loc>([^<]+)</loc>.*?</url>\s*',
    re.DOTALL,
)

def should_remove(loc: str) -> bool:
    """Vrai si l'URL pointe vers une page ville internationale (canonical ailleurs)."""
    if 'pirabellabs.com' not in loc:
        return False
    path = loc.replace('https://www.pirabellabs.com', '').replace('/en', '', 1).strip('/')
    parts = path.split('/')
    if len(parts) < 2:
        return False
    cat = parts[0]
    if cat not in CATEGORIES:
        return False
    last = parts[-1].rstrip('/')
    return last in INTERNATIONAL_CITIES

removed = 0
def repl(m):
    global removed
    loc = m.group(1).strip()
    if should_remove(loc):
        removed += 1
        return ''
    return m.group(0)

new_text = URL_BLOCK_RE.sub(repl, text)
sitemap.write_text(new_text, encoding='utf-8')

print(f"Entrees retirees du sitemap : {removed}")
print(f"Sitemap final : {new_text.count('<loc>')} URLs")
