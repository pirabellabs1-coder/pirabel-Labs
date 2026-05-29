#!/usr/bin/env python3
"""SEO Linking Lens
=================

Detecte pages orphelines + faiblement liees + cross-link manquant
(services <-> villes). Ajoute des liens contextuels manquants en
respectant l'idempotence (sentinels HTML).

Exclusions :
  - node_modules, .git, app, scripts, projet claude B, scratch, audit
  - pages noindex
  - pages techniques (mentions-legales, politique-confidentialite, status, etc.)
  - formations (volume enorme, deja maille nav interne)

Sortie :
  - Rapport console : orphelines + sous-liees
  - Patch HTML : "liens utiles" injectes avant <footer
"""
from __future__ import annotations
import re
import sys
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]

# ------- Exclusions -------
EXCLUDE_DIRS = {
    'node_modules', '.git', 'app', 'scripts',
    'projet claude B', 'scratch', 'audit', 'img', 'css', 'js', 'api',
    'formations',  # 1000+ lessons, mailing interne via nav module
}

TECH_PAGES = {
    'mentions-legales.html', 'politique-confidentialite.html', 'status.html',
    'test-cs.html', 'gerer-rendez-vous.html', 'modifier-devis.html',
    'add-avis.js', 'fix-avis.js', 'avis.html',
    'candidature.html', 'rendez-vous.html', 'resultats.html',
}

SERVICE_CATEGORIES = [
    'agence-creation-sites-web',
    'agence-design-branding',
    'agence-email-marketing-crm',
    'agence-ia-automatisation',
    'agence-publicite-payante-sea-ads',
    'agence-redaction-content-marketing',
    'agence-sales-funnels-cro',
    'agence-seo-referencement-naturel',
    'agence-social-media',
    'agence-video-motion-design',
    'consulting-digital',
    'formation-digitale',
    'outils-digitaux',
]

CITIES_FR = [
    ('abomey-calavi', 'Abomey-Calavi'),
    ('cotonou', 'Cotonou'),
    ('porto-novo', 'Porto-Novo'),
    ('parakou', 'Parakou'),
    ('paris', 'Paris'),
    ('marseille', 'Marseille'),
    ('lyon', 'Lyon'),
    ('bruxelles', 'Bruxelles'),
    ('montreal', 'Montreal'),
    ('casablanca', 'Casablanca'),
    ('dakar', 'Dakar'),
    ('abidjan', 'Abidjan'),
    ('tunis', 'Tunis'),
]
CITIES_EN = [
    ('abomey-calavi', 'Abomey-Calavi'),
    ('cotonou', 'Cotonou'),
    ('porto-novo', 'Porto-Novo'),
    ('parakou', 'Parakou'),
    ('paris', 'Paris'),
    ('marseille', 'Marseille'),
    ('lyon', 'Lyon'),
    ('bruxelles', 'Brussels'),
    ('montreal', 'Montreal'),
    ('casablanca', 'Casablanca'),
    ('dakar', 'Dakar'),
    ('abidjan', 'Abidjan'),
    ('tunis', 'Tunis'),
]

SENTINEL = '<!-- xlink-orphan-fix -->'

# --------- Helpers ---------

def iter_html_files():
    for p in ROOT.rglob('*.html'):
        rel = p.relative_to(ROOT)
        if any(part in EXCLUDE_DIRS for part in rel.parts):
            continue
        if p.name in TECH_PAGES:
            continue
        yield p


def has_noindex(text: str) -> bool:
    return bool(re.search(r'<meta[^>]+name=["\']robots["\'][^>]+noindex', text, re.I))


def path_to_url(p: Path) -> str:
    """Map filesystem path -> canonical URL path (no trailing slash for index)."""
    rel = p.relative_to(ROOT).as_posix()
    if rel.endswith('/index.html'):
        rel = rel[:-len('/index.html')]
    elif rel.endswith('.html'):
        rel = rel[:-len('.html')]
    if not rel.startswith('/'):
        rel = '/' + rel
    return rel


def normalize_url(href: str, lang_en: bool) -> str | None:
    """Normalize a href to its canonical URL or None if external/anchor."""
    if not href:
        return None
    href = href.strip()
    if href.startswith(('#', 'mailto:', 'tel:', 'javascript:')):
        return None
    parsed = urlparse(href)
    if parsed.netloc and 'pirabellabs' not in parsed.netloc:
        return None
    path = unquote(parsed.path or '')
    if not path:
        return None
    # strip trailing slash, strip .html
    if path != '/' and path.endswith('/'):
        path = path[:-1]
    if path.endswith('/index.html'):
        path = path[:-len('/index.html')]
    elif path.endswith('.html'):
        path = path[:-len('.html')]
    if not path.startswith('/'):
        path = '/' + path
    return path


LINK_RE = re.compile(r'<a\s+[^>]*href=["\']([^"\']+)["\']', re.I)


def extract_links(text: str, lang_en: bool) -> set[str]:
    out = set()
    for m in LINK_RE.finditer(text):
        u = normalize_url(m.group(1), lang_en)
        if u:
            out.add(u)
    return out


# --------- Build graph ---------
print('[lens=linking] scanning HTML files...', file=sys.stderr)

pages = {}  # url -> Path
texts = {}  # url -> str
noindex_urls = set()

for p in iter_html_files():
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    url = path_to_url(p)
    pages[url] = p
    texts[url] = text
    if has_noindex(text):
        noindex_urls.add(url)

print(f'[lens=linking] {len(pages)} indexable pages tracked', file=sys.stderr)

inbound = defaultdict(set)  # url -> set(source urls)
for url, text in texts.items():
    is_en = url.startswith('/en/')
    for target in extract_links(text, is_en):
        if target in pages and target != url:
            inbound[target].add(url)

# --------- Detect issues ---------
indexable = [u for u in pages if u not in noindex_urls]

orphans = sorted(u for u in indexable if not inbound[u])

# Only consider "service category index" or "local city" pages for low-link check
def is_service_or_local(url: str) -> bool:
    parts = [p for p in url.split('/') if p]
    if not parts:
        return False
    if parts[0] == 'en':
        if len(parts) < 2:
            return False
        base = parts[1]
    else:
        base = parts[0]
    return base in SERVICE_CATEGORIES

weakly_linked = sorted(
    u for u in indexable
    if is_service_or_local(u) and 0 < len(inbound[u]) < 3
)

# Cross-link check: each service category index should link to all its cities
cross_missing = []  # tuples (source_url, missing_targets)

for cat in SERVICE_CATEGORIES:
    for prefix, city_list in [('', CITIES_FR), ('/en', CITIES_EN)]:
        cat_index = f'{prefix}/{cat}'
        if cat_index not in pages:
            continue
        src_text = texts[cat_index]
        is_en = bool(prefix)
        src_links = extract_links(src_text, is_en)
        missing = []
        for slug, _name in city_list:
            target = f'{prefix}/{cat}/{slug}'
            if target in pages and target not in src_links:
                missing.append(target)
        if missing:
            cross_missing.append((cat_index, missing))

# --------- Report ---------
print()
print('==== ORPHELINES (0 lien entrant) ====')
for u in orphans[:40]:
    print(f'  - {u}')
if len(orphans) > 40:
    print(f'  ... +{len(orphans) - 40} more')

print()
print('==== FAIBLEMENT LIEES service/locale (<3 entrants) ====')
for u in weakly_linked[:40]:
    print(f'  - {u} ({len(inbound[u])} entrants)')
if len(weakly_linked) > 40:
    print(f'  ... +{len(weakly_linked) - 40} more')

print()
print('==== CROSS-LINK MANQUANT service -> ville ====')
for src, missing in cross_missing[:15]:
    print(f'  {src} (missing {len(missing)})')
if len(cross_missing) > 15:
    print(f'  ... +{len(cross_missing) - 15} more')


# --------- Fix: inject "Liens utiles" block on weak/orphan pages ---------

def related_links_for(url: str) -> list[tuple[str, str]]:
    """Pick 4-6 contextual related links for an under-linked page."""
    parts = [p for p in url.split('/') if p]
    is_en = bool(parts) and parts[0] == 'en'
    prefix = '/en' if is_en else ''
    base_parts = parts[1:] if is_en else parts
    out: list[tuple[str, str]] = []
    cat = base_parts[0] if base_parts else None

    if cat in SERVICE_CATEGORIES:
        # weak service page (category or city)
        # Add: parent index + 4 sister cities + home
        cat_index = f'{prefix}/{cat}'
        if cat_index in pages and cat_index != url:
            label = 'Service category' if is_en else 'Categorie service'
            out.append((cat_index, label))
        city_list = CITIES_EN if is_en else CITIES_FR
        added = 0
        for slug, name in city_list:
            t = f'{prefix}/{cat}/{slug}'
            if t in pages and t != url and added < 4:
                out.append((t, name))
                added += 1
    elif cat == 'guides':
        # weak guide: link to home + 3 other guides + services
        # find guides folder
        guides_dir = ROOT / ('en/guides' if is_en else 'guides')
        siblings = []
        for sib in guides_dir.glob('*.html'):
            if sib.name == 'index.html':
                continue
            sib_url = path_to_url(sib)
            if sib_url != url:
                siblings.append(sib_url)
        for s in siblings[:4]:
            slug = s.rsplit('/', 1)[-1]
            label = slug.replace('-', ' ').title()
            out.append((s, label))
    elif cat == 'blog':
        # weak blog post: 4 other blog posts
        blog_dir = ROOT / ('en/blog' if is_en else 'blog')
        for sib in blog_dir.glob('*.html'):
            if sib.name == 'index.html':
                continue
            sib_url = path_to_url(sib)
            if sib_url != url and len(out) < 4:
                slug = sib_url.rsplit('/', 1)[-1]
                out.append((sib_url, slug.replace('-', ' ').title()))
    else:
        # Generic: link to home + services hub + contact
        home = '/en' if is_en else '/'
        services_hub = '/en/services' if is_en else '/services'
        if home in pages or home == '/':
            out.append((home, 'Accueil' if not is_en else 'Home'))
        if services_hub in pages:
            out.append((services_hub, 'Services'))
        for cat in SERVICE_CATEGORIES[:3]:
            t = f'{prefix}/{cat}'
            if t in pages:
                label = cat.replace('agence-', '').replace('-', ' ').title()
                out.append((t, label))
    return out[:6]


def make_block(url: str) -> str | None:
    links = related_links_for(url)
    if len(links) < 2:
        return None
    is_en = url.startswith('/en/')
    label = 'Related pages' if is_en else 'Liens utiles'
    title = 'EXPLORE NEXT' if is_en else 'POURSUIVRE LA VISITE'
    items = ''.join(
        f'<a href="{href}" class="card card-hover-glow rv" '
        f'style="padding:1.25rem 1.5rem;text-decoration:none;display:block;">'
        f'<h3 class="text-h4" style="margin:0;color:var(--on-surface);font-size:1rem;">{name}</h3>'
        f'</a>'
        for href, name in links
    )
    return (
        f'{SENTINEL}\n'
        '<section class="section section--low" aria-label="' + label + '">\n'
        '<div class="section-inner">\n'
        f'<span class="text-label rv">{label}</span>\n'
        f'<h2 class="text-h2 rv" style="margin:1rem 0 2rem;">{title}</h2>\n'
        '<div class="grid-4 rv" style="gap:1rem;">\n'
        f'{items}\n'
        '</div>\n'
        '</div>\n'
        '</section>\n'
    )


FOOTER_RE = re.compile(
    r'(<!-- NEWSLETTER -->|<div class="newsletter"|<footer\b)', re.I)


def inject_before_footer(text: str, block: str) -> str:
    return FOOTER_RE.sub(block + '\n\\1', text, count=1)


# Apply fixes to: orphans + weakly-linked
to_fix = set(orphans) | set(weakly_linked)
fixed_count = 0
fixed_examples = []

for url in to_fix:
    if url not in pages:
        continue
    p = pages[url]
    text = texts[url]
    if SENTINEL in text:
        continue
    block = make_block(url)
    if not block:
        continue
    new_text = inject_before_footer(text, block)
    if new_text != text:
        try:
            p.write_text(new_text, encoding='utf-8')
            fixed_count += 1
            if len(fixed_examples) < 10:
                fixed_examples.append(url)
        except Exception as e:
            print(f'  ! write failed {p}: {e}', file=sys.stderr)

# --------- Cross-link fix: enforce service-index -> all cities ---------
# add-cross-links.py already covers that. We only PATCH missing ones if the
# main script's sentinel <!-- xlink-cities --> is absent. Otherwise skip.
XLINK_CITIES_SENTINEL = '<!-- xlink-cities -->'
xfix_count = 0
for src, missing in cross_missing:
    p = pages[src]
    text = texts[src]
    if XLINK_CITIES_SENTINEL in text or SENTINEL in text:
        continue
    block = make_block(src)
    if not block:
        continue
    new_text = inject_before_footer(text, block)
    if new_text != text:
        try:
            p.write_text(new_text, encoding='utf-8')
            xfix_count += 1
        except Exception:
            pass

print()
print('==== RESUME ====')
print(f'  Pages scannees           : {len(pages)}')
print(f'  Indexables               : {len(indexable)}')
print(f'  Orphelines               : {len(orphans)}')
print(f'  Faiblement liees         : {len(weakly_linked)}')
print(f'  Cross-link manquants     : {len(cross_missing)}')
print(f'  Patchs orphan/weak       : {fixed_count}')
print(f'  Patchs cross-link        : {xfix_count}')
print()
print('Exemples patches :')
for u in fixed_examples:
    print(f'  + {u}')
