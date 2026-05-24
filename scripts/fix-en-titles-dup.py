#!/usr/bin/env python3
"""
Differencie les titres EN qui sont identiques a leur version FR.
Patron principal: "Service [Ville] | Pirabel Labs" -> "Service in [City] | Pirabel Labs"
Plus cas particuliers (Portail Client, Connexion, Article...).

Met aussi a jour:
- <meta property="og:title">
- <meta name="twitter:title">

Idempotent: ne touche que les pages dont le titre actuel matche un titre FR.
"""
import re
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

CITIES = {
    "Paris": "Paris", "Marseille": "Marseille", "Lyon": "Lyon",
    "Bruxelles": "Brussels", "Montreal": "Montreal", "Cotonou": "Cotonou",
    "Casablanca": "Casablanca", "Dakar": "Dakar", "Abidjan": "Abidjan",
    "Tunis": "Tunis", "Abomey-Calavi": "Abomey-Calavi",
}

# Specific titles that need bespoke EN replacement
SPECIAL_REPLACEMENTS = {
    "Portail Client | Pirabel Labs":              "Client Portal | Pirabel Labs",
    "Connexion | Pirabel Labs Admin":             "Admin Sign-In | Pirabel Labs",
    "Article | Pirabel Labs Blog":                "Blog Post | Pirabel Labs",
    "Design UI/UX Figma | Pirabel Labs":          "UI/UX Figma Design Studio | Pirabel Labs",
    "Packaging Design | Pirabel Labs":            "Packaging Design Studio | Pirabel Labs",
    "CRM Setup & Configuration | Pirabel Labs":   "CRM Setup & Implementation | Pirabel Labs",
    "Marketing Automation | Pirabel Labs":        "Marketing Automation Agency | Pirabel Labs",
}

TITLE_RE = re.compile(r'<title>([^<]+)</title>', re.IGNORECASE)
OGTITLE_RE = re.compile(r'(<meta property="og:title" content=")([^"]+)(")', re.IGNORECASE)
TWTITLE_RE = re.compile(r'(<meta name="twitter:title" content=")([^"]+)(")', re.IGNORECASE)

def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

def is_english(path: Path) -> bool:
    return any(part == 'en' for part in path.parts)

def collect_titles():
    """Returns {title: [(path, is_en), ...]}"""
    titles = defaultdict(list)
    for p in iter_html():
        try:
            text = p.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        m = TITLE_RE.search(text)
        if not m:
            continue
        titles[m.group(1).strip()].append((p, is_english(p)))
    return titles

def generate_new_title(old_title: str) -> str | None:
    """Return a differentiated EN title, or None if not applicable."""
    # Special whole-title mapping first
    if old_title in SPECIAL_REPLACEMENTS:
        return SPECIAL_REPLACEMENTS[old_title]

    # Generic "Service City | Pirabel Labs" -> "Service in City | Pirabel Labs"
    # Use case-sensitive city name (cities are capitalised in titles)
    m = re.match(r'^(.+?)\s+([A-ZÀ-Ý][\w\-]*)\s*\|\s*Pirabel Labs\s*$', old_title)
    if m:
        service = m.group(1).strip()
        city_raw = m.group(2).strip()
        if city_raw in CITIES:
            city_en = CITIES[city_raw]
            return f"{service} in {city_en} | Pirabel Labs"

    # Fallback: append " Agency" before " | Pirabel Labs" if no city
    m = re.match(r'^(.+?)\s*\|\s*Pirabel Labs\s*$', old_title)
    if m:
        service = m.group(1).strip()
        # Avoid double "Agency"
        if "Agency" not in service and "Studio" not in service:
            return f"{service} Agency | Pirabel Labs"

    return None

def main():
    titles = collect_titles()
    duplicates = {t: paths for t, paths in titles.items() if len(paths) > 1}

    print(f"Titres dupliques detectes: {len(duplicates)}")

    changed = 0
    skipped = 0
    for title, occurrences in duplicates.items():
        en_pages = [p for p, en in occurrences if en]
        if not en_pages:
            skipped += 1
            continue

        new_title = generate_new_title(title)
        if not new_title or new_title == title:
            print(f"  [SKIP] Pas de mapping pour: {title!r}")
            skipped += 1
            continue

        for path in en_pages:
            try:
                text = path.read_text(encoding='utf-8', errors='ignore')
            except Exception:
                continue
            new_text = TITLE_RE.sub(f'<title>{new_title}</title>', text, count=1)
            new_text = OGTITLE_RE.sub(rf'\g<1>{new_title}\g<3>', new_text)
            new_text = TWTITLE_RE.sub(rf'\g<1>{new_title}\g<3>', new_text)
            if new_text != text:
                path.write_text(new_text, encoding='utf-8')
                changed += 1

    print(f"\nPages EN modifiees: {changed}")
    print(f"Titres ignores (pas de mapping ou EN deja distinct): {skipped}")

if __name__ == '__main__':
    main()
