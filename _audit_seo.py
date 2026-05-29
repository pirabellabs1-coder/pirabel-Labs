import os, re

no_title = []
no_desc = []
no_canonical = []
no_lang = []
title_too_short = []
title_too_long = []
desc_too_short = []
desc_too_long = []
multi_h1 = []
no_h1 = []
no_og = []
no_hreflang = []
img_no_alt = []
total = 0

for root, dirs, files in os.walk('.'):
    skip = False
    for s in ['.git', 'node_modules', '\\api', '\\app\\', 'Projet A', '_audit']:
        if s in root:
            skip = True
            break
    if skip:
        continue
    for f in files:
        if not f.endswith('.html'):
            continue
        path = os.path.join(root, f)
        total += 1
        try:
            with open(path, 'r', encoding='utf-8') as fh:
                content = fh.read()
        except Exception:
            continue
        # title
        m = re.search(r'<title[^>]*>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
        if not m or not m.group(1).strip():
            no_title.append(path)
        else:
            t = m.group(1).strip()
            tlen = len(t)
            if tlen < 30:
                title_too_short.append((path, tlen, t))
            elif tlen > 65:
                title_too_long.append((path, tlen, t))
        # description
        m = re.search(r'<meta[^>]*?name=["\']description["\'][^>]*?content=["\']([^"\']*)["\']', content, re.IGNORECASE)
        if not m or not m.group(1).strip():
            no_desc.append(path)
        else:
            d = m.group(1).strip()
            dlen = len(d)
            if dlen < 120:
                desc_too_short.append((path, dlen, d[:80]))
            elif dlen > 165:
                desc_too_long.append((path, dlen, d[:80]))
        # canonical
        if not re.search(r'<link[^>]*?rel=["\']canonical["\']', content, re.IGNORECASE):
            no_canonical.append(path)
        # lang
        if not re.search(r'<html[^>]*?lang=', content, re.IGNORECASE):
            no_lang.append(path)
        # h1
        h1s = re.findall(r'<h1\b', content, re.IGNORECASE)
        if len(h1s) > 1:
            multi_h1.append((path, len(h1s)))
        elif len(h1s) == 0:
            no_h1.append(path)
        # og:title
        if not re.search(r'property=["\']og:title["\']', content, re.IGNORECASE):
            no_og.append(path)
        # hreflang
        if not re.search(r'hreflang=', content, re.IGNORECASE):
            no_hreflang.append(path)
        # img sans alt
        imgs = re.findall(r'<img[^>]*>', content, re.IGNORECASE)
        for img in imgs:
            if not re.search(r'\balt\s*=', img, re.IGNORECASE):
                img_no_alt.append((path, img[:200]))

print(f'TOTAL HTML files: {total}')
print(f'\n=== NO TITLE ({len(no_title)}) ===')
for p in no_title[:20]: print(' -', p)
print(f'\n=== NO DESCRIPTION ({len(no_desc)}) ===')
for p in no_desc[:20]: print(' -', p)
print(f'\n=== NO CANONICAL ({len(no_canonical)}) ===')
for p in no_canonical[:20]: print(' -', p)
print(f'\n=== NO LANG ATTR ({len(no_lang)}) ===')
for p in no_lang[:20]: print(' -', p)
print(f'\n=== TITLE TOO SHORT <30 ({len(title_too_short)}) ===')
for p,l,t in title_too_short[:20]: print(f' - {p} ({l}): {t}')
print(f'\n=== TITLE TOO LONG >65 ({len(title_too_long)}) ===')
for p,l,t in title_too_long[:20]: print(f' - {p} ({l}): {t}')
print(f'\n=== DESC TOO SHORT <120 ({len(desc_too_short)}) ===')
for p,l,t in desc_too_short[:20]: print(f' - {p} ({l}): {t}')
print(f'\n=== DESC TOO LONG >165 ({len(desc_too_long)}) ===')
for p,l,t in desc_too_long[:20]: print(f' - {p} ({l}): {t}')
print(f'\n=== MULTIPLE H1 ({len(multi_h1)}) ===')
for p,c in multi_h1[:20]: print(f' - {p} (x{c})')
print(f'\n=== NO H1 ({len(no_h1)}) ===')
for p in no_h1[:20]: print(' -', p)
print(f'\n=== NO OG:TITLE ({len(no_og)}) ===')
for p in no_og[:20]: print(' -', p)
print(f'\n=== NO HREFLANG ({len(no_hreflang)}) ===')
for p in no_hreflang[:20]: print(' -', p)
print(f'\n=== IMG WITHOUT ALT ({len(img_no_alt)}) ===')
for p,img in img_no_alt[:30]: print(f' - {p}: {img}')
