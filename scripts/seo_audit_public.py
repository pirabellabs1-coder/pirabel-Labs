"""Filter audit gaps to ONLY public sitemap'd pages."""
import re
import os
from pathlib import Path

sitemap = Path('sitemap.xml').read_text(encoding='utf-8')
locs = re.findall(r'<loc>https://www\.pirabellabs\.com([^<]*)</loc>', sitemap)


def url_to_files(url):
    rel = url.lstrip('/').rstrip('/')
    if rel == '':
        return ['index.html']
    return [rel + '.html', rel + '/index.html']


sitemap_files = set()
for url in locs:
    for cand in url_to_files(url):
        if Path(cand).exists():
            sitemap_files.add(cand.replace(os.sep, '/'))

print(f"Public files (in sitemap, exist on disk): {len(sitemap_files)}\n")

stats = {k: [] for k in ['no_canonical','no_hreflang','no_og','no_twitter','no_jsonld','no_meta_desc','short_desc','long_desc']}
desc_re = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.I)

for f in sitemap_files:
    p = Path(f)
    content = p.read_text(encoding='utf-8', errors='ignore')
    m = desc_re.search(content)
    if not m:
        stats['no_meta_desc'].append(f)
    else:
        l = len(m.group(1))
        if l < 50:
            stats['short_desc'].append((f, l))
        elif l > 165:
            stats['long_desc'].append((f, l))
    if 'rel="canonical"' not in content: stats['no_canonical'].append(f)
    if 'hreflang' not in content: stats['no_hreflang'].append(f)
    if 'og:title' not in content: stats['no_og'].append(f)
    if 'twitter:card' not in content: stats['no_twitter'].append(f)
    if 'application/ld+json' not in content: stats['no_jsonld'].append(f)

total = len(sitemap_files)
print(f"=== PUBLIC pages audit ({total} files) ===\n")
print(f"Canonical:        {total-len(stats['no_canonical'])}/{total} OK")
print(f"Hreflang:         {total-len(stats['no_hreflang'])}/{total} OK    ({len(stats['no_hreflang'])} missing)")
print(f"OpenGraph:        {total-len(stats['no_og'])}/{total} OK    ({len(stats['no_og'])} missing)")
print(f"Twitter Card:     {total-len(stats['no_twitter'])}/{total} OK    ({len(stats['no_twitter'])} missing)")
print(f"JSON-LD:          {total-len(stats['no_jsonld'])}/{total} OK    ({len(stats['no_jsonld'])} missing)")
print(f"Meta description: {total-len(stats['no_meta_desc'])}/{total} OK    ({len(stats['no_meta_desc'])} missing)")
print(f"  short <50:      {len(stats['short_desc'])}")
print(f"  long >165:      {len(stats['long_desc'])}")
print()

for label, items in [
    ("Public files missing canonical", stats['no_canonical']),
    ("Public files missing hreflang", stats['no_hreflang']),
    ("Public files missing OG", stats['no_og']),
    ("Public files missing Twitter Card", stats['no_twitter']),
    ("Public files missing JSON-LD", stats['no_jsonld']),
    ("Public files missing meta desc", stats['no_meta_desc']),
]:
    if items:
        print(f"--- {label} ({len(items)}):")
        for x in items[:10]:
            print(f"    {x}")
        if len(items) > 10:
            print(f"    ... and {len(items)-10} more")
        print()
