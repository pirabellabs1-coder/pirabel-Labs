"""
Phase 5a: Add regional hreflang variants (fr-FR, fr-CA, en-US, etc.) to the
20 paired FR↔EN main pages. Also fix the 2 known incorrect hreflang URLs.
"""
from pathlib import Path
import re
import os

ROOT = Path('.')
ORIGIN = "https://www.pirabellabs.com"

# Paired FR↔EN main pages (URL paths without trailing slash)
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
    '/':                 '/en',
}

# Regional codes to declare. Each maps to the same URL (one URL serves all regions of same language).
FR_LOCALES = ['fr', 'fr-FR', 'fr-CA', 'fr-BE', 'fr-CH', 'fr-MA', 'fr-SN', 'fr-CI', 'fr-BJ', 'fr-CM', 'fr-TN']
EN_LOCALES = ['en', 'en-US', 'en-GB', 'en-CA']
# x-default points to FR (primary market: Paris-based agency)


def url_path_to_files(url_path: str):
    """Map URL path to candidate file paths on disk."""
    rel = url_path.lstrip('/').rstrip('/')
    if not rel:
        return ['index.html']
    return [rel + '.html', rel + '/index.html']


def find_existing_file(url_path: str):
    for c in url_path_to_files(url_path):
        if Path(c).exists():
            return Path(c)
    return None


def build_block(fr_url: str, en_url: str) -> str:
    """Build the regional hreflang block for a paired page."""
    lines = ['<!-- SEO: hreflang regional -->']
    for lc in FR_LOCALES:
        lines.append(f'<link rel="alternate" hreflang="{lc}" href="{ORIGIN}{fr_url}">')
    for lc in EN_LOCALES:
        lines.append(f'<link rel="alternate" hreflang="{lc}" href="{ORIGIN}{en_url}">')
    lines.append(f'<link rel="alternate" hreflang="x-default" href="{ORIGIN}{fr_url}">')
    return '\n'.join(lines) + '\n'


# Remove ALL existing alternate hreflang lines. We'll inject the fresh block.
ALT_LINE_RE = re.compile(
    r'(?:[ \t]*<!--\s*SEO:\s*hreflang[^>]*-->\s*\n?)?'
    r'[ \t]*<link\s+rel=["\']alternate["\']\s+hreflang=["\'][^"\']+["\']\s+href=["\'][^"\']+["\']\s*/?>\s*\n?',
    re.I
)


def process(file_path: Path, fr_url: str, en_url: str):
    content = file_path.read_text(encoding='utf-8')
    # Strip existing alternate links + their preceding hreflang comment
    new_content = ALT_LINE_RE.sub('', content)
    # Build new block
    block = build_block(fr_url, en_url)
    # Insert before </head>
    if '</head>' not in new_content:
        return 'no </head>'
    new_content = new_content.replace('</head>', block + '</head>', 1)
    if new_content == content:
        return 'no change'
    file_path.write_text(new_content, encoding='utf-8')
    return 'OK'


def main():
    processed = 0
    skipped = 0
    for fr_url, en_url in PAIRS.items():
        fr_file = find_existing_file(fr_url)
        en_file = find_existing_file(en_url)
        if not fr_file or not en_file:
            print(f"  skip {fr_url} ↔ {en_url} (file missing: fr={bool(fr_file)}, en={bool(en_file)})")
            skipped += 1
            continue
        for f in (fr_file, en_file):
            r = process(f, fr_url, en_url)
            print(f"  {f}: {r}")
            if r == 'OK':
                processed += 1
    print(f"\nProcessed: {processed} files, skipped pairs: {skipped}")


if __name__ == '__main__':
    main()
