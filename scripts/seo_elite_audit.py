"""Elite SEO audit: structured data depth, images, internal linking, robots meta."""
from pathlib import Path
import re
import os
from collections import Counter, defaultdict

ROOT = Path('.')
SKIP = ('node_modules', 'admin', 'portal', 'client_portal', 'espace-client-4p8w1n',
        'projet claude', 'Projet A', 'scratch', 'pirabel-admin', 'temp_repo')

# Build sitemap'd public files
sitemap_raw = Path('sitemap.xml').read_text(encoding='utf-8')
locs = re.findall(r'<loc>https://www\.pirabellabs\.com([^<]*)</loc>', sitemap_raw)
def url_to_files(url):
    rel = url.lstrip('/').rstrip('/')
    if rel == '':
        return ['index.html']
    return [rel + '.html', rel + '/index.html']
public_files = set()
for url in locs:
    for cand in url_to_files(url):
        if Path(cand).exists():
            public_files.add(cand.replace(os.sep, '/'))


# === Schema types found ===
schema_re = re.compile(r'"@type"\s*:\s*"([^"]+)"', re.I)
schema_re_arr = re.compile(r'"@type"\s*:\s*\[([^\]]+)\]', re.I)
schema_counts = Counter()
schemas_per_section = defaultdict(Counter)


def section_of(path):
    if path.startswith('en/blog/'):
        return 'en/blog'
    if path.startswith('en/guides/'):
        return 'en/guides'
    if path.startswith('en/'):
        if 'agency' in path:
            return 'en/agency'
        return 'en/main'
    if path.startswith('agence-'):
        return 'fr/agency'
    if path.startswith('blog/'):
        return 'fr/blog'
    if path.startswith('guides/'):
        return 'fr/guides'
    return 'fr/main'


for f in public_files:
    content = Path(f).read_text(encoding='utf-8', errors='ignore')
    sec = section_of(f)
    types_found = set()
    for m in schema_re.finditer(content):
        types_found.add(m.group(1))
    for m in schema_re_arr.finditer(content):
        for t in re.findall(r'"([^"]+)"', m.group(1)):
            types_found.add(t)
    for t in types_found:
        schema_counts[t] += 1
        schemas_per_section[sec][t] += 1


# === Image audit ===
img_re = re.compile(r'<img\s+([^>]*)>', re.I)
alt_re = re.compile(r'\salt=["\']([^"\']*)["\']', re.I)
loading_re = re.compile(r'\sloading=["\']lazy["\']', re.I)
src_re = re.compile(r'\ssrc=["\']([^"\']*)["\']', re.I)

img_total = 0
img_missing_alt = 0
img_empty_alt = 0
img_no_lazy = 0
img_external = 0
generic_alts = Counter()
GENERIC_ALT_WORDS = {'image', 'img', 'photo', 'picture', 'logo', '', 'icon', 'placeholder'}

for f in public_files:
    content = Path(f).read_text(encoding='utf-8', errors='ignore')
    for m in img_re.finditer(content):
        img_total += 1
        attrs = m.group(1)
        alt_m = alt_re.search(attrs)
        src_m = src_re.search(attrs)
        if not alt_m:
            img_missing_alt += 1
        else:
            alt = alt_m.group(1).strip().lower()
            if alt == '':
                img_empty_alt += 1
            elif alt in GENERIC_ALT_WORDS or len(alt) < 3:
                generic_alts[alt] += 1
        if not loading_re.search(attrs):
            img_no_lazy += 1
        if src_m and src_m.group(1).startswith('http') and 'pirabellabs.com' not in src_m.group(1):
            img_external += 1


# === Internal linking ===
# Build: who links to whom?
links_to = defaultdict(set)  # target_path -> set of source files
all_internal_paths = set()
for f in public_files:
    content = Path(f).read_text(encoding='utf-8', errors='ignore')
    for m in re.finditer(r'href=["\'](/[^"\'#]*)["\']', content):
        target = m.group(1).rstrip('/')
        if target == '':
            target = '/'
        # Map to file
        clean = target.lstrip('/').rstrip('/')
        candidates = [clean + '.html', clean + '/index.html', clean]
        for c in candidates:
            if c.replace(os.sep, '/') in public_files:
                links_to[c.replace(os.sep, '/')].add(f)
                break

orphans = []  # public files with 0 incoming internal links
for f in public_files:
    if f.endswith('index.html') and f.count('/') <= 1:
        continue  # skip root indexes
    if f not in links_to:
        orphans.append(f)


# === Robots meta ===
robots_re = re.compile(r'<meta\s+name=["\']robots["\']\s+content=["\']([^"\']*)["\']', re.I)
robots_no_max_image = 0
robots_no_meta = 0
for f in public_files:
    content = Path(f).read_text(encoding='utf-8', errors='ignore')
    m = robots_re.search(content)
    if not m:
        robots_no_meta += 1
    elif 'max-image-preview' not in m.group(1):
        robots_no_max_image += 1


# === Output ===
print("=" * 60)
print("ELITE SEO AUDIT — public pages only (818)")
print("=" * 60)

print("\n--- Structured data types found across public pages ---")
for t, c in schema_counts.most_common():
    print(f"  {c:4d}  {t}")

print("\n--- Schema coverage by section ---")
for sec, types in sorted(schemas_per_section.items()):
    type_list = ", ".join(sorted(types.keys()))
    n_files = sum(1 for f in public_files if section_of(f) == sec)
    print(f"  {sec:18s} ({n_files} files): {type_list}")

print("\n--- Image SEO ---")
print(f"  Total <img> tags: {img_total}")
print(f"  Missing alt:      {img_missing_alt}")
print(f"  Empty alt='':     {img_empty_alt}")
print(f"  Generic alt:      {sum(generic_alts.values())} (samples: {dict(generic_alts.most_common(5))})")
print(f"  Without loading=lazy: {img_no_lazy} ({100*img_no_lazy//max(1,img_total)}%)")
print(f"  External images:  {img_external}")

print("\n--- Internal linking ---")
print(f"  Pages with 0 incoming internal links (orphans): {len(orphans)}")
for o in orphans[:15]:
    print(f"    {o}")
if len(orphans) > 15:
    print(f"    ... and {len(orphans)-15} more")

print("\n--- Robots meta ---")
print(f"  Pages without <meta name=\"robots\">: {robots_no_meta}")
print(f"  Pages with robots but no max-image-preview: {robots_no_max_image}")
