import os, re

SKIP = ['.git', 'node_modules', os.sep+'api'+os.sep, os.sep+'app'+os.sep, 'Projet A', '_audit']
def walk():
    for root, dirs, files in os.walk('.'):
        if any(s in root for s in SKIP):
            continue
        for f in files:
            if f.endswith('.html'):
                yield os.path.join(root, f)

orphan_titles = []
ent_titles = []
canon_og_mismatch = []
canon_relative = []
canon_html_in_url = []
hreflang_self_missing = []
hreflang_missing_xdef = []
double_canonical = []
empty_alt_lots = 0
img_alt_empty = []
no_robots_meta = []

for p in walk():
    try:
        with open(p, 'r', encoding='utf-8') as fh:
            c = fh.read()
    except:
        continue

    # Title checks
    m = re.search(r'<title[^>]*>(.*?)</title>', c, re.DOTALL)
    if m:
        t = m.group(1).strip()
        # Orphan separator at end
        if re.search(r'(—|–|-|\||:)\s*$', t):
            orphan_titles.append((p, t))
        # HTML entities still encoded
        if re.search(r'&(?:mdash|eacute|amp|quot|apos|nbsp|#x?[0-9a-fA-F]+);', t):
            ent_titles.append((p, t[:120]))

    # Canonical
    canons = re.findall(r'<link[^>]*?rel=["\']canonical["\'][^>]*?href=["\']([^"\']*)["\']', c, re.I)
    if len(canons) > 1:
        double_canonical.append((p, canons))
    elif len(canons) == 1:
        u = canons[0]
        if not u.startswith('http'):
            canon_relative.append((p, u))
        if u.endswith('.html'):
            canon_html_in_url.append((p, u))

    # og:url vs canonical mismatch
    ogu = re.search(r'property=["\']og:url["\'][^>]*content=["\']([^"\']*)["\']', c)
    if canons and ogu and canons[0] != ogu.group(1):
        canon_og_mismatch.append((p, canons[0], ogu.group(1)))

    # hreflang has x-default?
    hl = re.findall(r'hreflang=["\']([^"\']+)["\']', c)
    if hl and 'x-default' not in hl:
        hreflang_missing_xdef.append(p)

    # img alt=""
    for img in re.findall(r'<img[^>]*>', c, re.I):
        am = re.search(r'\balt\s*=\s*["\']([^"\']*)["\']', img)
        if am and am.group(1).strip() == '':
            img_alt_empty.append((p, img[:200]))
            empty_alt_lots += 1

print(f'=== TITLES ORPHAN SEPARATOR ({len(orphan_titles)}) ===')
for p,t in orphan_titles[:30]: print(f' - {p}: "{t}"')
print(f'\n=== TITLES WITH HTML ENTITIES ({len(ent_titles)}) ===')
for p,t in ent_titles[:30]: print(f' - {p}: {t}')
print(f'\n=== CANONICAL vs OG:URL MISMATCH ({len(canon_og_mismatch)}) ===')
for p,c1,o in canon_og_mismatch[:30]: print(f' - {p}\n     canonical: {c1}\n     og:url:    {o}')
print(f'\n=== RELATIVE CANONICAL ({len(canon_relative)}) ===')
for p,u in canon_relative[:15]: print(f' - {p}: {u}')
print(f'\n=== CANONICAL WITH .html ({len(canon_html_in_url)}) ===')
for p,u in canon_html_in_url[:15]: print(f' - {p}: {u}')
print(f'\n=== MULTIPLE CANONICAL ({len(double_canonical)}) ===')
for p,u in double_canonical[:15]: print(f' - {p}: {u}')
print(f'\n=== HREFLANG MISSING X-DEFAULT ({len(hreflang_missing_xdef)}) ===')
for p in hreflang_missing_xdef[:30]: print(f' - {p}')
print(f'\n=== IMG WITH EMPTY ALT (decorative or bug?) total={len(img_alt_empty)} ===')
for p,img in img_alt_empty[:15]: print(f' - {p}: {img}')
