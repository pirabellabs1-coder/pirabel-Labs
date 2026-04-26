"""
Topical interlinking audit:
- Do city pages link to other cities of same service?
- Do articles in same section cross-link?
- Do FR pages link to their EN equivalents?
- Are 'sub-service' pages cross-linked to siblings?
"""
from pathlib import Path
import re
import os
from collections import defaultdict

ROOT = Path('.')
sitemap_raw = Path('sitemap.xml').read_text(encoding='utf-8')
locs = re.findall(r'<loc>https://www\.pirabellabs\.com([^<]*)</loc>', sitemap_raw)


def url_to_files(url):
    rel = url.lstrip('/').rstrip('/')
    return [rel + '.html', rel + '/index.html'] if rel else ['index.html']


public_files = set()
for url in locs:
    for cand in url_to_files(url):
        if Path(cand).exists():
            public_files.add(cand.replace(os.sep, '/'))


def get_links(p: Path) -> set:
    """Get all internal href targets from a file (resolved)."""
    src_dir = str(p.parent).replace(os.sep, '/')
    if src_dir == '.':
        src_dir = ''
    content = p.read_text(encoding='utf-8', errors='ignore')
    targets = set()
    for m in re.finditer(r'href=["\']([^"\'#?]+)["\']', content):
        href = m.group(1).strip()
        if href.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:')):
            continue
        if href.startswith('/'):
            target = href.lstrip('/')
        else:
            target = (src_dir + '/' + href) if src_dir else href
            parts = []
            for x in target.split('/'):
                if x == '..':
                    if parts: parts.pop()
                elif x and x != '.':
                    parts.append(x)
            target = '/'.join(parts)
        target = target.rstrip('/')
        for c in [target + '.html', target + '/index.html', target]:
            c2 = c.replace(os.sep, '/')
            if c2 in public_files:
                targets.add(c2)
                break
    return targets


# === TEST 1: City pages cross-linking ===
# An "agency city page" is something like: agence-X/<city>.html
# These should link to other agence-X/<other-city>.html
print("=== Test 1: City pages cross-link to siblings? ===")
city_groups = defaultdict(list)
for f in public_files:
    parts = f.split('/')
    if len(parts) == 2 and parts[0].startswith('agence-') and parts[1].endswith('.html') and parts[1] != 'index.html':
        # e.g. agence-creation-sites-web/paris.html
        city_groups[parts[0]].append(f)

issues = []
for parent, cities in city_groups.items():
    if len(cities) < 2:
        continue
    # For each city page in this parent, check if it links to other city pages
    for city_file in cities:
        links = get_links(Path(city_file))
        sibling_links = links & set(cities) - {city_file}
        if not sibling_links:
            issues.append(city_file)

print(f"  City pages NOT linking to sibling cities: {len(issues)}")
for x in issues[:5]:
    print(f"    {x}")
if len(issues) > 5:
    print(f"    ... and {len(issues)-5} more")

# === TEST 2: Service sub-pages cross-linking (deep paths) ===
# e.g. agence-creation-sites-web/wordpress/paris.html
# Should link to other cities of same service: agence-creation-sites-web/wordpress/<other>.html
print("\n=== Test 2: Deep sub-service city pages cross-link? ===")
deep_groups = defaultdict(list)
for f in public_files:
    parts = f.split('/')
    if len(parts) == 3 and parts[0].startswith('agence-') and parts[2].endswith('.html'):
        key = '/'.join(parts[:2])  # agence-X/sub-service
        deep_groups[key].append(f)

deep_issues = []
for parent, items in deep_groups.items():
    if len(items) < 2:
        continue
    for f in items:
        links = get_links(Path(f))
        sib = links & set(items) - {f}
        if not sib:
            deep_issues.append(f)

print(f"  Deep sub-service pages NOT cross-linking: {len(deep_issues)}")
for x in deep_issues[:5]:
    print(f"    {x}")
if len(deep_issues) > 5:
    print(f"    ... and {len(deep_issues)-5} more")

# === TEST 3: Blog articles cross-link to other articles in same blog? ===
print("\n=== Test 3: Blog articles cross-link? ===")
fr_blog = [f for f in public_files if f.startswith('blog/') and f != 'blog/index.html']
en_blog = [f for f in public_files if f.startswith('en/blog/') and not f.endswith('index.html')]
fr_blog_no_xlink = [f for f in fr_blog if not (get_links(Path(f)) & set(fr_blog) - {f})]
en_blog_no_xlink = [f for f in en_blog if not (get_links(Path(f)) & set(en_blog) - {f})]
print(f"  FR blog articles NOT cross-linking other FR blog: {len(fr_blog_no_xlink)} / {len(fr_blog)}")
print(f"  EN blog articles NOT cross-linking other EN blog: {len(en_blog_no_xlink)} / {len(en_blog)}")

# === TEST 4: Guides cross-link? ===
print("\n=== Test 4: Guides cross-link? ===")
fr_guides = [f for f in public_files if f.startswith('guides/') and f != 'guides/index.html']
en_guides = [f for f in public_files if f.startswith('en/guides/') and not f.endswith('index.html')]
fr_guides_no_xlink = [f for f in fr_guides if not (get_links(Path(f)) & set(fr_guides) - {f})]
en_guides_no_xlink = [f for f in en_guides if not (get_links(Path(f)) & set(en_guides) - {f})]
print(f"  FR guides NOT cross-linking other FR guides: {len(fr_guides_no_xlink)} / {len(fr_guides)}")
print(f"  EN guides NOT cross-linking other EN guides: {len(en_guides_no_xlink)} / {len(en_guides)}")

# === TEST 5: FR ↔ EN equivalent linking via hreflang ===
# Each page should declare alternate hreflang to its EN/FR equivalent if exists
print("\n=== Test 5: FR pages link to EN equivalent (and vice versa)? ===")
# Already verified at 100% via Phase 2/3. But let's check if the alternate URLs actually exist on disk.
hreflang_re = re.compile(r'<link\s+rel=["\']alternate["\']\s+hreflang=["\'](en|fr)["\']\s+href=["\']([^"\']+)["\']', re.I)
broken_alt = []
for f in public_files:
    p = Path(f)
    content = p.read_text(encoding='utf-8', errors='ignore')
    for lang, url in hreflang_re.findall(content):
        # Resolve URL → file
        if 'pirabellabs.com' not in url:
            continue
        path = url.split('pirabellabs.com')[1].rstrip('/')
        if not path:
            continue  # root
        rel = path.lstrip('/')
        candidates = [rel + '.html', rel + '/index.html']
        if not any(Path(c).exists() for c in candidates):
            broken_alt.append((f, lang, url))

print(f"  Broken hreflang alternates (target file does not exist): {len(broken_alt)}")
for f, lang, url in broken_alt[:8]:
    print(f"    {f} → hreflang={lang} → {url}")

# === Summary of poorly-linked sections ===
print("\n=== Summary of topical interlinking gaps ===")
print(f"  T1: agency parent-level cities not linking siblings: {len(issues)}")
print(f"  T2: deep sub-service cities not linking siblings: {len(deep_issues)}")
print(f"  T3: blog articles not cross-linking: FR={len(fr_blog_no_xlink)}, EN={len(en_blog_no_xlink)}")
print(f"  T4: guides not cross-linking: FR={len(fr_guides_no_xlink)}, EN={len(en_guides_no_xlink)}")
print(f"  T5: broken hreflang alternates: {len(broken_alt)}")
