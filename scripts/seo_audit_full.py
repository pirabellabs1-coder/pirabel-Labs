"""Comprehensive SEO audit of all public HTML files."""
from pathlib import Path
import re
import os

SKIP = ('node_modules', 'admin', 'portal', 'client_portal', 'espace-client-4p8w1n',
        'projet claude', 'Projet A', 'scratch', 'pirabel-admin', 'temp_repo')

stats = {
    'no_meta_desc': [],
    'short_meta_desc': [],
    'long_meta_desc': [],
    'no_h1': [],
    'multiple_h1': [],
    'no_og': [],
    'no_jsonld': [],
    'no_twitter': [],
    'no_hreflang': [],
    'no_canonical': [],
    'total': 0,
}
images_no_alt = 0

desc_re = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.I)
h1_re = re.compile(r'<h1[\s>]', re.I)
img_no_alt_re = re.compile(r'<img\s+(?![^>]*\salt=)[^>]*>', re.I)


def normalize(p: Path) -> str:
    return str(p).replace(os.sep, '/')


for f in Path('.').rglob('*.html'):
    s = normalize(f)
    if any(x in s for x in SKIP):
        continue
    stats['total'] += 1
    content = f.read_text(encoding='utf-8', errors='ignore')

    m = desc_re.search(content)
    if not m:
        stats['no_meta_desc'].append(s)
    else:
        l = len(m.group(1))
        if l < 50:
            stats['short_meta_desc'].append((s, l))
        elif l > 165:
            stats['long_meta_desc'].append((s, l))

    h1s = h1_re.findall(content)
    if len(h1s) == 0:
        stats['no_h1'].append(s)
    elif len(h1s) > 1:
        stats['multiple_h1'].append((s, len(h1s)))

    if 'og:title' not in content:
        stats['no_og'].append(s)
    if 'application/ld+json' not in content:
        stats['no_jsonld'].append(s)
    if 'twitter:card' not in content:
        stats['no_twitter'].append(s)
    if 'hreflang' not in content:
        stats['no_hreflang'].append(s)
    if 'rel="canonical"' not in content:
        stats['no_canonical'].append(s)

    images_no_alt += len(img_no_alt_re.findall(content))


print(f"=== SEO Audit — {stats['total']} HTML files ===\n")
print(f"Canonical:           {stats['total'] - len(stats['no_canonical'])}/{stats['total']} OK    ({len(stats['no_canonical'])} missing)")
print(f"Hreflang:            {stats['total'] - len(stats['no_hreflang'])}/{stats['total']} OK    ({len(stats['no_hreflang'])} missing)")
print(f"Meta description:    {stats['total'] - len(stats['no_meta_desc'])}/{stats['total']} OK    ({len(stats['no_meta_desc'])} missing)")
print(f"  too short <50:     {len(stats['short_meta_desc'])}")
print(f"  too long >165:     {len(stats['long_meta_desc'])}")
print(f"H1:                  {stats['total'] - len(stats['no_h1']) - len(stats['multiple_h1'])}/{stats['total']} OK")
print(f"  no H1:             {len(stats['no_h1'])}")
print(f"  multiple H1:       {len(stats['multiple_h1'])}")
print(f"OpenGraph:           {stats['total'] - len(stats['no_og'])}/{stats['total']} OK    ({len(stats['no_og'])} missing)")
print(f"Twitter Card:        {stats['total'] - len(stats['no_twitter'])}/{stats['total']} OK    ({len(stats['no_twitter'])} missing)")
print(f"JSON-LD schema:      {stats['total'] - len(stats['no_jsonld'])}/{stats['total']} OK    ({len(stats['no_jsonld'])} missing)")
print(f"Images without alt:  {images_no_alt}")
print()

def show(label, items, n=5):
    print(f"--- {label} ({len(items)}):")
    for x in items[:n]:
        print(f"    {x}")
    if len(items) > n:
        print(f"    ... and {len(items) - n} more")

show("Sample missing hreflang", stats['no_hreflang'])
show("Sample missing JSON-LD", stats['no_jsonld'])
show("Sample missing meta desc", stats['no_meta_desc'])
show("Sample missing H1", stats['no_h1'])
show("Sample multiple H1", stats['multiple_h1'])
