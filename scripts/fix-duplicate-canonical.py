#!/usr/bin/env python3
"""Resout les doublons canonical detectes par Google Search Console.

Strategie C : preserve les 4 villes Benin (contenu unique investi),
les 9 villes internationales pointent leur canonical vers la page service
principale pour consolider le signal SEO et eliminer les doublons.

Effet : Google n'indexera plus que la page service principale et les 4
villes Benin. Les pages villes internationales restent accessibles aux
utilisateurs mais Google les traite comme variantes de la page principale.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

# Villes Benin : conservent leur canonical self
BENIN_CITIES = {'abomey-calavi', 'cotonou', 'porto-novo', 'parakou'}

# Categories de services
CATEGORIES = {
    'agence-seo-referencement-naturel',
    'agence-creation-sites-web',
    'agence-design-branding',
    'agence-email-marketing-crm',
    'agence-ia-automatisation',
    'agence-publicite-payante-sea-ads',
    'agence-redaction-content-marketing',
    'agence-sales-funnels-cro',
    'agence-social-media',
    'agence-video-motion-design',
}

CANONICAL_RE = re.compile(r'<link rel="canonical" href="([^"]+)"', re.IGNORECASE)


def get_target_url(rel_path: str) -> str | None:
    """Determine si la page doit pointer canonical vers la page service principale.

    Retourne l'URL canonical cible OU None si la page doit garder son canonical self.
    """
    parts = rel_path.replace('\\', '/').split('/')
    # /en/agence-X/<ville>.html  OR  /agence-X/<ville>.html  OR
    # /en/agence-X/<sub>/<ville>.html  OR  /agence-X/<sub>/<ville>.html
    is_en = parts[0] == 'en'
    if is_en:
        parts = parts[1:]

    if len(parts) < 2:
        return None
    cat = parts[0]
    if cat not in CATEGORIES:
        return None
    last = parts[-1].replace('.html', '')
    if last == 'index':
        return None
    if last in BENIN_CITIES:
        return None  # garde canonical self

    # Check : last segment is a city (simple heuristic - city names listed)
    international_cities = {
        'paris', 'marseille', 'lyon', 'bruxelles', 'montreal',
        'casablanca', 'dakar', 'abidjan', 'tunis',
    }
    if last not in international_cities:
        return None  # ce n'est pas une page ville

    # Build target = page service principale
    base = 'https://www.pirabellabs.com'
    if is_en:
        base += '/en'
    return f"{base}/{cat}/"


count = 0
for p in ROOT.rglob('*.html'):
    if any(part in EXCLUDE_DIRS for part in p.parts):
        continue
    rel = str(p.relative_to(ROOT))
    target = get_target_url(rel)
    if not target:
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    m = CANONICAL_RE.search(text)
    if not m:
        continue
    current = m.group(1)
    if current == target:
        continue  # deja correct
    new_text = text.replace(
        f'<link rel="canonical" href="{current}"',
        f'<link rel="canonical" href="{target}"',
        1
    )
    if new_text != text:
        p.write_text(new_text, encoding='utf-8')
        count += 1

print(f"Pages avec canonical redirige vers page service principale: {count}")
