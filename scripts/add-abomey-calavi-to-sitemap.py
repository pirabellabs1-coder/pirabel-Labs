#!/usr/bin/env python3
"""Ajoute les 18 URLs des pages abomey-calavi service au sitemap si absentes."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITEMAP = ROOT / 'sitemap.xml'

CATEGORIES = [
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

def entry(loc, lastmod='2026-05-24', priority='0.9'):
    return f'''  <url>
    <loc>{loc}</loc>
    <xhtml:link rel="alternate" hreflang="fr" href="{loc.replace('/en/','/')}"/>
    <xhtml:link rel="alternate" hreflang="en" href="{loc.replace('https://www.pirabellabs.com/agence-','https://www.pirabellabs.com/en/agence-') if '/en/' not in loc else loc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="{loc.replace('/en/','/')}"/>
    <lastmod>{lastmod}</lastmod>
    <priority>{priority}</priority>
  </url>
'''

text = SITEMAP.read_text(encoding='utf-8')

new_entries = []
for cat in CATEGORIES:
    fr_url = f'https://www.pirabellabs.com/{cat}/abomey-calavi'
    en_url = f'https://www.pirabellabs.com/en/{cat}/abomey-calavi'
    if fr_url not in text:
        new_entries.append(entry(fr_url))
    if en_url not in text:
        new_entries.append(entry(en_url))

if new_entries:
    block = ''.join(new_entries)
    # Insert right before </urlset>
    text = text.replace('</urlset>', block + '</urlset>')
    SITEMAP.write_text(text, encoding='utf-8')

print(f"Entrees ajoutees: {len(new_entries)}")
