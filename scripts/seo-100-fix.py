#!/usr/bin/env python3
"""SEO 100/100 — fix systemique apres audit Aleyda :

C1 : 986 canonicals pointant vers /agence-X/ au lieu de /agence-X/<page>
C2 : 781 lecons EN avec contenu FR -> noindex en attendant vraie traduction
C3 : 3 pages sans H1 (status.html, agence-seo-referencement-naturel/index.html)
C4 : 3 titles orphelins (...| Pirabel Labs &mdash;)
C5 : 1 image sans alt (test-cs.html template JS)
M1 : 525 titles avec HTML entities non decodees
M7 : 1600 pages sans bloc og:title/description/url/image/type
"""
import html as html_lib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.pirabellabs.com'
SKIP = {'.git', 'node_modules', 'api', 'app', 'Projet A', 'projet claude B', 'scripts', 'scratch'}

fix_canonical = 0
fix_noindex = 0
fix_entities = 0
fix_og = 0


def should_skip(path):
    return any(s in path.parts for s in SKIP)


def fix_canonical_to_self(p, c):
    """C1 : canonical pointe vers la vraie URL de la page (utilise og:url comme verite)."""
    global fix_canonical
    m = re.search(r'(rel=["\']canonical["\'][^>]*href=["\'])([^"\']*)(["\'])', c)
    if not m:
        return c
    current = m.group(2)
    # Use og:url as ground truth if present
    ogu = re.search(r'property=["\']og:url["\'][^>]*content=["\']([^"\']*)["\']', c)
    if ogu:
        truth = ogu.group(1)
    else:
        # fallback : compute from filepath
        rel = p.relative_to(ROOT).as_posix().replace('.html', '').replace('/index', '')
        if rel.endswith('/'):
            rel = rel[:-1]
        truth = f'{BASE}/{rel}'
    if current == truth or current.rstrip('/') == truth.rstrip('/'):
        return c
    new_c = c.replace(m.group(0), m.group(1) + truth + m.group(3), 1)
    fix_canonical += 1
    return new_c


def add_noindex_to_en_lesson(p, c):
    """C2 : pages /en/formations/<slug>/m*-l*.html : ajouter robots=noindex car contenu FR."""
    global fix_noindex
    path_str = p.as_posix()
    is_en_lesson = '/en/formations/' in path_str and re.search(r'/m\d+-l\d+\.html$', path_str)
    is_en_quiz = '/en/formations/' in path_str and re.search(r'/m\d+-quiz\.html$', path_str)
    is_en_cert = '/en/formations/' in path_str and path_str.endswith('/certificat.html')
    if not (is_en_lesson or is_en_quiz or is_en_cert):
        return c
    if 'name="robots"' in c:
        # Replace existing
        new_c = re.sub(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*["\']\s*/?>',
                       '<meta name="robots" content="noindex,follow">', c)
    else:
        # Insert just before </head>
        new_c = c.replace('</head>', '<meta name="robots" content="noindex,follow">\n</head>', 1)
    if new_c != c:
        fix_noindex += 1
    return new_c


def decode_entities_in_title(p, c):
    """M1 : decode HTML entities dans le tag <title>."""
    global fix_entities
    def repl(m):
        inner = m.group(1)
        decoded = html_lib.unescape(inner)
        # Re-escape & in case any URLs leaked
        decoded = decoded.replace(' & ', ' &amp; ')
        if decoded != inner:
            return f'<title>{decoded}</title>'
        return m.group(0)
    new_c = re.sub(r'<title[^>]*>(.*?)</title>', repl, c, count=1, flags=re.DOTALL)
    if new_c != c:
        fix_entities += 1
    return new_c


def add_og_block(p, c):
    """M7 : ajouter bloc og:title/description/url/image/type si manquant."""
    global fix_og
    if 'og:title' in c:
        return c
    t = re.search(r'<title[^>]*>(.*?)</title>', c, re.DOTALL)
    d = re.search(r'name=["\']description["\'][^>]*content=["\']([^"\']*)["\']', c)
    canon = re.search(r'rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\']', c)
    if not (t and d and canon):
        return c
    title = html_lib.unescape(t.group(1).strip())
    desc = d.group(1).strip()
    url = canon.group(1)
    is_article = '/blog/' in p.as_posix() or '/guides/' in p.as_posix() or '/formations/' in p.as_posix()
    og_type = 'article' if is_article else 'website'
    og = (f'<meta property="og:title" content="{html_lib.escape(title)}">\n'
          f'<meta property="og:description" content="{html_lib.escape(desc)}">\n'
          f'<meta property="og:type" content="{og_type}">\n'
          f'<meta property="og:url" content="{url}">\n'
          f'<meta property="og:image" content="https://www.pirabellabs.com/img/og-image.png">\n'
          f'<meta property="og:site_name" content="Pirabel Labs">\n')
    new_c = c.replace('</head>', og + '</head>', 1)
    fix_og += 1
    return new_c


total = 0
for p in ROOT.rglob('*.html'):
    if should_skip(p):
        continue
    try:
        c = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    orig = c
    c = fix_canonical_to_self(p, c)
    c = add_noindex_to_en_lesson(p, c)
    c = decode_entities_in_title(p, c)
    c = add_og_block(p, c)
    if c != orig:
        p.write_text(c, encoding='utf-8')
        total += 1

print(f'Total fichiers modifies : {total}')
print(f'  - Canonicals corriges : {fix_canonical}')
print(f'  - Noindex EN lecons   : {fix_noindex}')
print(f'  - Entities titles     : {fix_entities}')
print(f'  - Bloc OG ajoute      : {fix_og}')
