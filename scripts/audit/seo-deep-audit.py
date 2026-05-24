#!/usr/bin/env python3
"""Audit SEO approfondi - identifie tous les problemes residuels."""
import re
from pathlib import Path
from collections import defaultdict, Counter

ROOT = Path(__file__).resolve().parents[2]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

issues = defaultdict(list)
stats = Counter()

H1_RE = re.compile(r'<h1\b', re.IGNORECASE)
TITLE_RE = re.compile(r'<title>([^<]*)</title>')
DESC_RE = re.compile(r'<meta name="description" content="([^"]*)"', re.IGNORECASE)
CANON_RE = re.compile(r'<link rel="canonical" href="([^"]+)"', re.IGNORECASE)
OG_IMG_RE = re.compile(r'<meta property="og:image" content="([^"]+)"', re.IGNORECASE)
HREFLANG_RE = re.compile(r'<link rel="alternate" hreflang="[^"]+" href="([^"]+)"', re.IGNORECASE)
FAQ_DETAILS_RE = re.compile(r'<details class="faq-item', re.IGNORECASE)
FAQ_SCHEMA_RE = re.compile(r'"@type"\s*:\s*"FAQPage"', re.IGNORECASE)
NOINDEX_RE = re.compile(r'<meta name="robots"[^>]*noindex', re.IGNORECASE)
OG_IMG_DEFAULT = 'og-image.png'

# Build set of all existing relative pages for hreflang validation
all_pages = set()
for p in iter_html():
    rel = str(p.relative_to(ROOT)).replace('\\', '/').replace('.html', '')
    all_pages.add('/' + rel)
    if rel.endswith('/index'):
        all_pages.add('/' + rel[:-len('index')].rstrip('/'))
        if rel == 'index':
            all_pages.add('/')

def page_exists(url: str) -> bool:
    """Check if hreflang URL corresponds to an actual file."""
    if not url.startswith('https://www.pirabellabs.com'):
        return True  # External, skip
    path = url.replace('https://www.pirabellabs.com', '')
    if path == '' or path == '/':
        return '/' in all_pages or '/index' in all_pages
    return path in all_pages or path + '/index' in all_pages or path + '/' in all_pages

for p in iter_html():
    stats['total'] += 1
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    rel = str(p.relative_to(ROOT)).replace('\\', '/')

    if NOINDEX_RE.search(text):
        stats['noindex'] += 1
        continue  # Skip noindex pages from audit

    # 1. Multiple H1
    h1_count = len(H1_RE.findall(text))
    if h1_count == 0:
        issues['no_h1'].append(rel)
    elif h1_count > 1:
        issues['multiple_h1'].append(f"{rel} ({h1_count})")

    # 2. Title length
    m = TITLE_RE.search(text)
    if not m:
        issues['no_title'].append(rel)
    else:
        title = m.group(1)
        if len(title) < 30:
            issues['title_too_short'].append(f"{rel} ({len(title)} chars)")
        elif len(title) > 65:
            issues['title_too_long'].append(f"{rel} ({len(title)} chars)")

    # 3. Description
    m = DESC_RE.search(text)
    if not m:
        issues['no_description'].append(rel)
    else:
        desc = m.group(1)
        if len(desc) < 70:
            issues['desc_too_short'].append(f"{rel} ({len(desc)} chars)")
        elif len(desc) > 170:
            issues['desc_too_long'].append(f"{rel} ({len(desc)} chars)")

    # 4. Canonical
    if not CANON_RE.search(text):
        issues['no_canonical'].append(rel)

    # 5. Hreflang validation
    for url in HREFLANG_RE.findall(text):
        if not page_exists(url):
            issues['hreflang_404'].append(f"{rel} -> {url}")

    # 6. FAQ section without FAQPage schema
    if FAQ_DETAILS_RE.search(text) and not FAQ_SCHEMA_RE.search(text):
        issues['faq_no_schema'].append(rel)

    # 7. Generic OG image (every page using same default)
    og_imgs = OG_IMG_RE.findall(text)
    if og_imgs and all(OG_IMG_DEFAULT in i for i in og_imgs):
        stats['og_generic'] += 1

print("="*70)
print(f"PAGES SCANNEES: {stats['total']} (dont {stats['noindex']} noindex)")
print(f"Pages avec og:image generique (og-image.png): {stats['og_generic']}")
print("="*70)
for issue, items in sorted(issues.items()):
    print(f"\n[{issue.upper()}] {len(items)} pages")
    for x in items[:8]:
        print(f"  - {x}")
    if len(items) > 8:
        print(f"  ... +{len(items)-8} autres")
