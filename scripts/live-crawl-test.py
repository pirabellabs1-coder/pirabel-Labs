#!/usr/bin/env python3
"""Crawl live un echantillon representatif de pages et reporte les codes HTTP
non-2xx (404, 500, etc.). Test sur production."""
import urllib.request
import urllib.error
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.pirabellabs.com'
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}
EXCLUDE_FILES = {'404.html', '500.html'}

# Collect all html pages
all_pages = []
for p in ROOT.rglob('*.html'):
    if any(part in EXCLUDE_DIRS for part in p.parts):
        continue
    if p.name in EXCLUDE_FILES:
        continue
    rel = str(p.relative_to(ROOT)).replace('\\', '/')
    # Strip .html and /index
    url_path = '/' + rel
    if url_path.endswith('/index.html'):
        url_path = url_path[:-len('/index.html')] or '/'
    elif url_path.endswith('.html'):
        url_path = url_path[:-5]
    all_pages.append(url_path)

# Strategic sample:
# - All cluster Abomey-Calavi pages
# - All institutional pages
# - All blog pages
# - Sample of city/service pages
strategic = [p for p in all_pages if '/abomey-calavi' in p]
institutional = [p for p in all_pages if p in (
    '/', '/en', '/a-propos', '/en/a-propos', '/contact', '/en/contact',
    '/services', '/en/services', '/blog', '/en/blog',
    '/avis', '/en/avis', '/resultats', '/en/resultats',
    '/carrieres', '/en/carrieres', '/faq', '/en/faq',
    '/mentions-legales', '/en/mentions-legales',
    '/politique-confidentialite', '/en/politique-confidentialite',
)]
blog = [p for p in all_pages if p.startswith('/blog/') or p.startswith('/en/blog/')]
guides = [p for p in all_pages if p.startswith('/guides/') or p.startswith('/en/guides/')]

# Random sample of city pages
city_pages = [p for p in all_pages if any(c in p for c in ('/paris', '/cotonou', '/dakar', '/casablanca', '/abidjan')) and '/abomey-calavi' not in p]
random.seed(42)
city_sample = random.sample(city_pages, min(20, len(city_pages)))

# Combine + dedupe
sample = list(set(strategic + institutional + blog[:15] + guides[:10] + city_sample))
sample.sort()

print(f"Total pages site: {len(all_pages)}")
print(f"Echantillon tested: {len(sample)}")
print("="*70)

errors = []
for path in sample:
    url = BASE + path
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Audit Bot)'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            code = resp.status
    except urllib.error.HTTPError as e:
        code = e.code
    except Exception as e:
        code = 'ERR'
    if code != 200:
        errors.append((code, path))
        print(f"  {code}  {path}")

print("="*70)
print(f"Erreurs detectees: {len(errors)} / {len(sample)} ({100*len(errors)/len(sample):.1f}%)")
