"""Audit hreflang URLs for incorrect FR↔EN mappings."""
from pathlib import Path
import re
import os

ROOT = Path('.')

# Authoritative FR↔EN page pairs (matches language-manager.js URL_MAP)
PAIRS = {
    '/agence-seo-referencement-naturel': '/en/seo-agency',
    '/agence-creation-sites-web':         '/en/web-design-agency',
    '/agence-ia-automatisation':          '/en/ai-automation-agency',
    '/agence-design-branding':            '/en/branding-agency',
    '/agence-publicite-payante-sea-ads':  '/en/paid-advertising-agency',
    '/agence-social-media':               '/en/social-media-agency',
    '/agence-email-marketing-crm':        '/en/email-marketing-agency',
    '/agence-video-motion-design':        '/en/video-production-agency',
    '/agence-sales-funnels-cro':          '/en/conversion-funnels-agency',
    '/agence-redaction-content-marketing':'/en/content-marketing-agency',
    '/services':         '/en/services',
    '/contact':          '/en/contact',
    '/a-propos':         '/en/about',
    '/resultats':        '/en/results',
    '/avis':             '/en/reviews',
    '/carrieres':        '/en/careers',
    '/mentions-legales': '/en/legal-mentions',
    '/blog':             '/en/blog',
    '/guides':           '/en/guides',
    '/rendez-vous':      '/en/book-a-call',
}

def file_to_path(rel: str) -> str:
    """Convert filesystem rel to URL path."""
    p = rel.replace(os.sep, '/').replace('\\', '/')
    if p.endswith('/index.html'):
        return '/' + p[:-len('/index.html')]
    if p.endswith('.html'):
        return '/' + p[:-5]
    return '/' + p

ALT_RE = re.compile(r'<link\s+rel=["\']alternate["\']\s+hreflang=["\']([^"\']+)["\']\s+href=["\']([^"\']+)["\']\s*/?>', re.I)
ORIGIN = "https://www.pirabellabs.com"

issues = []
for f in Path('.').rglob('*.html'):
    s = str(f).replace(os.sep, '/')
    if any(x in s for x in ['node_modules', 'admin', 'portal', 'client_portal', 'Projet A', 'pirabel-admin', 'app/views', 'scratch']):
        continue
    if '\\' in s and '\\app\\' in s:
        continue
    content = f.read_text(encoding='utf-8', errors='ignore')
    file_url_path = file_to_path(s)

    # Determine expected pair
    expected_fr = None
    expected_en = None
    if file_url_path in PAIRS:
        expected_fr = file_url_path
        expected_en = PAIRS[file_url_path]
    else:
        for fr, en in PAIRS.items():
            if file_url_path == en:
                expected_fr = fr
                expected_en = en
                break

    if not expected_fr:
        continue  # no known pair, skip

    # Read declared hreflang
    declared = {}
    for m in ALT_RE.finditer(content):
        lang = m.group(1).lower()
        url = m.group(2)
        # Strip origin if present
        if url.startswith(ORIGIN):
            url = url[len(ORIGIN):]
        # Normalize
        url = url.rstrip('/')
        if url.endswith('.html'):
            url = url[:-5]
        declared[lang] = url

    # Check if declared FR/EN match expected
    err = []
    if 'fr' in declared and declared['fr'] != expected_fr:
        err.append(f"hreflang=fr is {declared['fr']!r}, expected {expected_fr!r}")
    if 'en' in declared and declared['en'] != expected_en:
        err.append(f"hreflang=en is {declared['en']!r}, expected {expected_en!r}")
    if err:
        issues.append((s, err))

print(f"Files with incorrect hreflang URLs: {len(issues)}\n")
for f, errs in issues[:30]:
    print(f"  {f}")
    for e in errs:
        print(f"    - {e}")
if len(issues) > 30:
    print(f"  ... and {len(issues)-30} more")
