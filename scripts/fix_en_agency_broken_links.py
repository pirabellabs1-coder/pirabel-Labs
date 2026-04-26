"""
Fix broken cross-section links on EN agency pages.

The 10 EN agency landing pages reference slugs that were either renamed,
consolidated, or never created. For each broken link, find the closest
real EN guide by slug-word similarity and update the link.

Also: replace /en/privacy-policy.html (doesn't exist) with /en/legal-mentions.
"""
from pathlib import Path
import re
import os
from difflib import get_close_matches

ROOT = Path('.')

# Build catalog of real EN guides
en_guides = {f.stem for f in Path('en/guides').glob('*.html') if f.stem != 'index'}
en_blog = {f.stem for f in Path('en/blog').glob('*.html') if f.stem != 'index'}

# EN agency files
agency_files = list(Path('en').glob('*-agency/index.html')) + list(Path('en').glob('*-consultancy/index.html'))

STOPWORDS = {
    'the', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'with',
    'guide', 'complete', 'best', 'how', 'why', 'tips',
}


def keywords(slug: str) -> set:
    return {w.lower() for w in slug.split('-') if w.lower() not in STOPWORDS and len(w) > 2}


def best_match(broken_slug: str, candidates: set) -> str | None:
    target_kw = keywords(broken_slug)
    if not target_kw:
        return None
    scored = []
    for c in candidates:
        c_kw = keywords(c)
        sim = len(target_kw & c_kw)
        if sim > 0:
            scored.append((sim, -abs(len(c) - len(broken_slug)), c))
    if not scored:
        # Fallback: difflib
        m = get_close_matches(broken_slug, candidates, n=1, cutoff=0.5)
        return m[0] if m else None
    scored.sort(reverse=True)
    return scored[0][2]


# Step 1: handle /en/privacy-policy.html → /en/legal-mentions
print("=== Step 1: Replace /en/privacy-policy.html with /en/legal-mentions ===")
files_changed = 0
for f in Path('en').rglob('*.html'):
    s = str(f).replace(os.sep, '/')
    content = f.read_text(encoding='utf-8')
    new = content.replace('/en/privacy-policy.html', '/en/legal-mentions')
    if new != content:
        f.write_text(new, encoding='utf-8')
        files_changed += 1
print(f"  Updated {files_changed} files")

# Step 2: fix broken EN guide references in agency pages
print("\n=== Step 2: Fix broken guide refs in EN agency pages ===")
href_re = re.compile(r'href="(\.\./guides/([a-z0-9-]+)\.html|/en/guides/([a-z0-9-]+)\.html|/en/guides/([a-z0-9-]+))"')

mapping_log = {}
for f in agency_files:
    content = f.read_text(encoding='utf-8')
    original = content

    # Find each broken guide reference
    for m in href_re.finditer(original):
        full_match = m.group(0)
        slug = m.group(2) or m.group(3) or m.group(4)
        if slug in en_guides:
            continue  # already valid
        match = best_match(slug, en_guides)
        if not match:
            continue
        new_link = f'href="/en/guides/{match}"'
        content = content.replace(full_match, new_link)
        mapping_log[(str(f), slug)] = match

    if content != original:
        f.write_text(content, encoding='utf-8')

# Also update sub-service hrefs (ai-agents.html, seo-audit.html, etc.) — these are
# relative to the agency page (e.g., ai-agents.html means /en/<agency>/ai-agents).
# Most don't exist. Just remove them or point to a fallback.
# Strategy: for each broken relative .html link in an agency page, link to the
# agency's services anchor on the SAME page (#services) instead.
print("\n=== Step 3: Replace broken sub-service slug links with #services anchor ===")
sub_html_re = re.compile(r'href="([a-z][a-z0-9-]+)\.html"')
for f in agency_files:
    content = f.read_text(encoding='utf-8')
    original = content
    parent_dir = f.parent.name  # e.g., "ai-automation-agency"
    for m in sub_html_re.finditer(original):
        slug = m.group(1)
        # Does the file exist in this dir or as a sibling?
        target_file = f.parent / f'{slug}.html'
        if target_file.exists():
            continue
        # Replace with #services anchor (or remove the link entirely)
        old = f'href="{slug}.html"'
        new = 'href="#services"'
        content = content.replace(old, new)
    if content != original:
        f.write_text(content, encoding='utf-8')

# Report
print(f"\nGuide-link remappings: {len(mapping_log)}")
for (file, slug), match in list(mapping_log.items())[:15]:
    file_short = str(file).replace(os.sep, '/').split('/', 2)[-1]
    print(f"  {file_short}: {slug} -> {match}")
if len(mapping_log) > 15:
    print(f"  ... and {len(mapping_log)-15} more")
