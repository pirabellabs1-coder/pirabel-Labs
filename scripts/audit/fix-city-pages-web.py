"""
fix-city-pages-web.py
Bulk-fix recurring franglais patterns in all en/agence-creation-sites-web/*.html city pages.
Targets the EXACT recurring strings that appear identically across every city page.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HUB = ROOT / "en" / "agence-creation-sites-web"

# (old, new) replacement pairs - exact strings from the city template
FIXES = [
    # H1 hero
    ("UN SITE QUI CONVERTIT", "A WEBSITE THAT CONVERTS"),
    # Pain points cards
    ("challownges", "challenges"),
    ("Your website ne represente not your quality", "Your website doesn't reflect your quality"),
    ("Your website is lent and not mobile-friendly", "Your website is slow and not mobile-friendly"),
    ("Impossible de modify without developpeur", "Impossible to update without a developer"),
    (
        "Our team prend en charge your strategy Websites so that you puissiez you concentrer on your coeur de metier",
        "Our team handles your Website strategy so you can focus on your core business"
    ),
    # Services card typo
    ("Automate your processeseses.", "Automate your processes."),

    # City-specific FR descriptions (Abidjan)
    ("Abidjan, capitale economique, marché en expansion",
     "Abidjan, the economic capital and a fast-growing market"),
    ("Abidjan is capitale economique, marché en expansion",
     "Abidjan is the economic capital and a fast-growing market"),
    # Encoding fallback (file may have replacement char)
    ("Abidjan, capitale economique, march� en expansion",
     "Abidjan, the economic capital and a fast-growing market"),
    ("Abidjan is capitale economique, march� en expansion",
     "Abidjan is the economic capital and a fast-growing market"),

    # Cotonou
    ("Cotonou, capitale economique du Benin",
     "Cotonou, the economic capital of Benin"),
    ("Cotonou is capitale economique du Benin",
     "Cotonou is the economic capital of Benin"),

    # Lyon
    ("capitale de la gastronomie and pole economique majeur",
     "France's gastronomic capital and a major economic hub"),

    # Common French descriptors that may appear elsewhere
    ("capitale economique", "economic capital"),
    ("capitale politique", "political capital"),
    ("pole economique", "economic hub"),
    ("pôle économique", "economic hub"),
    ("marché en expansion", "fast-growing market"),
    ("specificites economiques", "economic specifics"),
    ("spécificités économiques", "economic specifics"),
    ("coeur de metier", "core business"),
    ("cœur de métier", "core business"),
    ("processesesus", "processes"),
]


def fix_file(path: Path) -> tuple:
    try:
        content = path.read_text(encoding="utf-8")
    except Exception as e:
        return (str(path), 0, str(e))

    original = content
    count = 0
    for old, new in FIXES:
        n = content.count(old)
        if n:
            content = content.replace(old, new)
            count += n

    if content != original:
        path.write_text(content, encoding="utf-8")
    return (path.name, count, None)


def main():
    files = sorted(HUB.glob("*.html"))
    files = [f for f in files if f.name not in ("index.html",)]
    print(f"Processing {len(files)} city pages in {HUB.name}/")
    total = 0
    for f in files:
        name, count, err = fix_file(f)
        if err:
            print(f"  ! {name}: ERROR {err}")
        else:
            print(f"  {name}: {count} replacements")
            total += count
    print(f"\nTotal replacements: {total}")


if __name__ == "__main__":
    main()
