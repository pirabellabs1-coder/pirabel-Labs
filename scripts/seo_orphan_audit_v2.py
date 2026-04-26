"""Proper orphan audit: resolves both absolute AND relative href= paths."""
from pathlib import Path
import re
import os
from collections import defaultdict

ROOT = Path('.')
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

# Build incoming-links map
incoming = defaultdict(set)
href_re = re.compile(r'href=["\']([^"\'#?]+)["\']')

for src in public_files:
    src_path = Path(src)
    src_dir = str(src_path.parent).replace(os.sep, '/')
    if src_dir == '.':
        src_dir = ''
    content = src_path.read_text(encoding='utf-8', errors='ignore')

    for m in href_re.finditer(content):
        href = m.group(1).strip()
        if href.startswith(('http://', 'https://', 'mailto:', 'tel:', 'javascript:')):
            continue
        # Resolve absolute or relative
        if href.startswith('/'):
            target = href.lstrip('/')
        else:
            # Resolve relative to src_dir
            if src_dir:
                target = src_dir + '/' + href
            else:
                target = href
            # Normalize . and ..
            parts = []
            for p in target.split('/'):
                if p == '..':
                    if parts:
                        parts.pop()
                elif p and p != '.':
                    parts.append(p)
            target = '/'.join(parts)

        target = target.rstrip('/')
        # Try matching to a public file
        candidates = [target + '.html', target + '/index.html', target]
        for c in candidates:
            c2 = c.replace(os.sep, '/')
            if c2 in public_files:
                if c2 != src:
                    incoming[c2].add(src)
                break

orphans = sorted([f for f in public_files if f not in incoming])
poorly_linked = sorted([(f, len(incoming[f])) for f in public_files if 0 < len(incoming[f]) <= 2 and not f.endswith('index.html')], key=lambda x: x[1])

print(f"Public files: {len(public_files)}")
print(f"Pages with 0 incoming internal links: {len(orphans)}")
print(f"Pages with 1-2 incoming links (poorly linked): {len(poorly_linked)}")
print()
print("--- Sample orphans by section ---")
sections = defaultdict(list)
for o in orphans:
    if o.startswith('en/blog/'): sections['en/blog'].append(o)
    elif o.startswith('en/guides/'): sections['en/guides'].append(o)
    elif o.startswith('en/'): sections['en/main'].append(o)
    elif o.startswith('agence-'): sections['fr/agency'].append(o)
    elif o.startswith('blog/'): sections['fr/blog'].append(o)
    elif o.startswith('guides/'): sections['fr/guides'].append(o)
    else: sections['fr/main'].append(o)

for sec, items in sorted(sections.items()):
    print(f"  {sec:15s}: {len(items)} orphans")
    for x in items[:3]:
        print(f"      {x}")
