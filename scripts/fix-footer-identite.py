#!/usr/bin/env python3
"""
Patch le footer de toutes les pages HTML:
1. Reecrit le bloc "Villes" / "Cities" (liens villes auparavant casses href="#")
   - Ajoute Abomey-Calavi en premier
   - Pointe chaque lien vers /agence-seo-referencement-naturel/{slug} (page SEO ville)
2. Enrichit footer-desc pour mentionner "Siege : Abomey-Calavi, Benin"
3. Idempotent: peut etre relance sans creer de duplicat.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

CITIES_FR = [
    ("Abomey-Calavi", "abomey-calavi", "Bénin"),
    ("Cotonou",       "cotonou",       "Bénin"),
    ("Paris",         "paris",         "France"),
    ("Marseille",     "marseille",     "France"),
    ("Lyon",          "lyon",          "France"),
    ("Bruxelles",     "bruxelles",     "Belgique"),
    ("Montréal",      "montreal",      "Canada"),
    ("Casablanca",    "casablanca",    "Maroc"),
    ("Dakar",         "dakar",         "Sénégal"),
    ("Abidjan",       "abidjan",       "Côte d'Ivoire"),
    ("Tunis",         "tunis",         "Tunisie"),
]
CITIES_EN = [
    ("Abomey-Calavi", "abomey-calavi", "Benin"),
    ("Cotonou",       "cotonou",       "Benin"),
    ("Paris",         "paris",         "France"),
    ("Marseille",     "marseille",     "France"),
    ("Lyon",          "lyon",          "France"),
    ("Brussels",      "bruxelles",     "Belgium"),
    ("Montreal",      "montreal",      "Canada"),
    ("Casablanca",    "casablanca",    "Morocco"),
    ("Dakar",         "dakar",         "Senegal"),
    ("Abidjan",       "abidjan",       "Côte d'Ivoire"),
    ("Tunis",         "tunis",         "Tunisia"),
]

def build_links(cities, prefix):
    """prefix is '/' (FR) or '/en/' (EN)."""
    return "".join(
        f'<li><a href="{prefix}agence-seo-referencement-naturel/{slug}">{name}</a></li>'
        for name, slug, _country in cities
    )

LINKS_FR = build_links(CITIES_FR, "/")
LINKS_EN = build_links(CITIES_EN, "/en/")

# Patterns FR: detects the "Villes" block (any indentation style, any list content)
PAT_FR = re.compile(
    r'(<div class="footer-title">\s*Villes\s*</div>\s*<ul class="footer-links">)'
    r'.*?'
    r'(</ul>)',
    re.DOTALL,
)
PAT_EN = re.compile(
    r'(<div class="footer-title">\s*Cities\s*</div>\s*<ul class="footer-links">)'
    r'.*?'
    r'(</ul>)',
    re.DOTALL,
)

# Footer-desc patches: only if not already mentioning the HQ
PAT_DESC_FR = re.compile(
    r'<p class="footer-desc">(Agence digitale premium\.?)</p>'
)
PAT_DESC_EN = re.compile(
    r'<p class="footer-desc">(Premium digital agency\.?)</p>'
)

def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

def is_english(path: Path) -> bool:
    return any(part == 'en' for part in path.parts)

def process(path: Path):
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        return False
    original = text

    if is_english(path):
        text = PAT_EN.sub(rf'\1{LINKS_EN}\2', text)
        text = PAT_DESC_EN.sub(
            '<p class="footer-desc">Premium digital agency. Headquartered in Abomey-Calavi, Benin.</p>',
            text,
        )
    else:
        text = PAT_FR.sub(rf'\1{LINKS_FR}\2', text)
        text = PAT_DESC_FR.sub(
            '<p class="footer-desc">Agence digitale premium. Siège : Abomey-Calavi, Bénin.</p>',
            text,
        )

    if text != original:
        path.write_text(text, encoding='utf-8')
        return True
    return False

def main():
    files = list(iter_html())
    changed = 0
    for f in files:
        if process(f):
            changed += 1
    print(f"Fichiers traites: {len(files)}")
    print(f"Fichiers modifies: {changed}")

if __name__ == '__main__':
    main()
