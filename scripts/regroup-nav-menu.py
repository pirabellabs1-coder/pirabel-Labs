#!/usr/bin/env python3
"""Regroupe les liens du menu nav en dropdowns:
  ACCUEIL / SERVICES / RESSOURCES (Blog,Guides,Formations) / AGENCE (À propos,Résultats,Avis,Carrières) / CONTACT

Conserve l'ordre + ajoute structure dropdown CSS-only.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', 'node_modules', 'app', 'scripts'}

# Build new nav HTML for FR (and EN equivalents)
NEW_NAV_FR = '''<div class="nav-links"><a href="/">ACCUEIL</a><a href="/services">SERVICES</a><div class="nav-group"><a href="/blog">RESSOURCES</a><div class="nav-dropdown"><a href="/blog">Blog</a><a href="/guides/">Guides</a><a href="/formations/">Formations</a></div></div><div class="nav-group"><a href="/a-propos">AGENCE</a><div class="nav-dropdown"><a href="/a-propos">A propos</a><a href="/resultats">Resultats</a><a href="/avis">Avis</a><a href="/carrieres">Carrieres</a></div></div><a href="/contact">CONTACT</a></div>'''

NEW_NAV_EN = '''<div class="nav-links"><a href="/en/">HOME</a><a href="/en/services">SERVICES</a><div class="nav-group"><a href="/en/blog">RESOURCES</a><div class="nav-dropdown"><a href="/en/blog">Blog</a><a href="/en/guides/">Guides</a><a href="/en/formations/">Trainings</a></div></div><div class="nav-group"><a href="/en/a-propos">AGENCY</a><div class="nav-dropdown"><a href="/en/a-propos">About</a><a href="/en/resultats">Results</a><a href="/en/avis">Reviews</a><a href="/en/carrieres">Careers</a></div></div><a href="/en/contact">CONTACT</a></div>'''

# Detect the current nav block (everything inside <div class="nav-links">...</div>)
# This regex is greedy on close to handle dropdowns that may already be present
NAV_PATTERN = re.compile(
    r'<div class="nav-links">.*?</div>(?=\s*(?:<a class="nav-login"|<a class="nav-cta"|\s*</div></nav>))',
    re.DOTALL,
)


def is_english(path: Path):
    return any(part == 'en' for part in path.parts)


def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE for part in p.parts):
            continue
        yield p


count = 0
already = 0
for p in iter_html():
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if 'nav-group' in text:
        already += 1
        continue  # already regrouped
    en = is_english(p)
    new_nav = NEW_NAV_EN if en else NEW_NAV_FR
    new_text, n = NAV_PATTERN.subn(new_nav, text, count=1)
    if n > 0:
        p.write_text(new_text, encoding='utf-8')
        count += 1

print(f"Pages regroupees: {count}")
print(f"Pages deja regroupees: {already}")
