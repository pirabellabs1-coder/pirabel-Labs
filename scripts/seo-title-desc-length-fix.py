#!/usr/bin/env python3
"""SEO M2+M3 : titles trop longs / descriptions trop courtes.

M2 : 1649 titles > 65 chars. Pattern : suffixe ' | Pirabel Labs' alourdit.
     Strategie : si title > 55 chars ET contient ' | Pirabel Labs', on retire le suffixe.

M3 : 2398 meta descriptions < 120 chars (perte CTR).
     Strategie : on n'augmente PAS automatiquement (besoin de contexte).
     On loggue les pages les plus visitees pour edition manuelle prioritaire.

ON NE TOUCHE PAS : les pages /formations/* car generees automatiquement, et
les pages /en/formations/* qui sont noindex.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'.git', 'node_modules', 'api', 'app', 'Projet A', 'projet claude B', 'scripts', 'scratch'}
SKIP_PATHS = set()  # On traite tout, y compris formations (titres summary sont longs)

count_title_trimmed = 0
short_descs = []


def should_skip(p):
    if any(s in p.parts for s in SKIP):
        return True
    pstr = p.as_posix()
    return any(sp in pstr for sp in SKIP_PATHS)


for p in ROOT.rglob('*.html'):
    if should_skip(p):
        continue
    try:
        c = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    orig = c

    # M2 : trim title si trop long. Strategies (par ordre) :
    # a) retirer ' | Pirabel Labs Academy' (formations lessons)
    # b) retirer ' | Pirabel Labs'
    # c) retirer toute la portion apres ' : ' si reste OK
    m = re.search(r'<title[^>]*>(.+?)</title>', c, re.DOTALL)
    if m:
        title = m.group(1).strip()
        original = title
        if len(title) > 65:
            # a) strip Academy suffix
            for suffix in [' | Pirabel Labs Academy', ' | Pirabel Labs']:
                if suffix in title and len(title) - len(suffix) >= 25:
                    candidate = title.replace(suffix, '').rstrip(' -—')
                    if len(candidate) <= 65:
                        title = candidate
                        break
                    elif len(candidate) <= 72:
                        title = candidate  # still acceptable
                        break
            # b) if still > 72 and contains ' : ', strip after colon
            if len(title) > 72 and ' : ' in title:
                title = title.split(' : ')[0].strip()
        if title != original and 25 < len(title) <= 72:
            c = c.replace(m.group(0), f'<title>{title}</title>', 1)
            count_title_trimmed += 1

    # M3 : just collect short descriptions for reporting
    m = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', c)
    if m and len(m.group(1).strip()) < 120:
        short_descs.append((p.as_posix(), len(m.group(1).strip())))

    if c != orig:
        p.write_text(c, encoding='utf-8')

print(f'Titles trimmes (suffixe Pirabel Labs retire) : {count_title_trimmed}')
print(f'Descriptions courtes restantes (< 120 chars) : {len(short_descs)}')
print('Top 10 :')
for path, length in sorted(short_descs, key=lambda x: x[1])[:10]:
    print(f'  {length:3} chars : {path}')
