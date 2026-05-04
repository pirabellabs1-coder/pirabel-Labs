"""
fix-all-city-pages.py
Bulk-fix recurring franglais patterns across ALL en/agence-*/{city}.html files.
Applies the same template fixes used for the web hub city pages.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EN = ROOT / "en"

HUBS = [
    "agence-seo-referencement-naturel",
    "agence-creation-sites-web",
    "agence-ia-automatisation",
    "agence-design-branding",
    "agence-publicite-payante-sea-ads",
    "agence-social-media",
    "agence-email-marketing-crm",
    "agence-video-motion-design",
    "agence-sales-funnels-cro",
    "agence-redaction-content-marketing",
]

# Universal recurring franglais fixes
FIXES = [
    # H1 patterns
    ("UN SITE QUI CONVERTIT", "A WEBSITE THAT CONVERTS"),

    # Hero pain phrases
    ("challownges", "challenges"),
    ("Your website ne represente not your quality", "Your website doesn't reflect your quality"),
    ("Your website is lent and not mobile-friendly", "Your website is slow and not mobile-friendly"),
    ("Impossible de modify without developpeur", "Impossible to update without a developer"),
    (
        "Our team prend en charge your strategy Websites so that you puissiez you concentrer on your coeur de metier",
        "Our team handles your Website strategy so you can focus on your core business"
    ),
    (
        "Our team prend en charge your strategy",
        "Our team handles your strategy"
    ),
    ("you puissiez you concentrer on your coeur de metier", "you can focus on your core business"),
    ("on your coeur de metier", "on your core business"),

    # Services typo
    ("Automate your processeseses.", "Automate your processes."),
    ("processesesus", "processes"),

    # City-specific descriptors (encoding-safe variants)
    ("capitale economique, marché en expansion", "the economic capital and a fast-growing market"),
    ("capitale economique, march\xe9 en expansion", "the economic capital and a fast-growing market"),
    ("capitale economique, march� en expansion", "the economic capital and a fast-growing market"),
    ("capitale economique du Benin", "the economic capital of Benin"),
    ("capitale de la gastronomie and pole economique majeur",
     "France's gastronomic capital and a major economic hub"),
    ("capitale economique", "economic capital"),
    ("capitale politique", "political capital"),
    ("pole economique", "economic hub"),
    ("p\xf4le \xe9conomique", "economic hub"),
    ("pôle économique", "economic hub"),
    ("march\xe9 en expansion", "fast-growing market"),
    ("marché en expansion", "fast-growing market"),
    ("specificites economiques", "economic specifics"),
    ("spécificités économiques", "economic specifics"),
    ("coeur de metier", "core business"),
    ("cœur de métier", "core business"),

    # Other recurring fragments
    ("ne represente not", "doesn't reflect"),
    ("prend en charge", "handles"),
    ("you puissiez", "you can"),
    ("vous puissiez", "you can"),

    # Common headings franglais
    ("OUR SERVICES IN ", "OUR SERVICES IN "),  # no-op (placeholder for clarity)
    ("FREQUENTLY ASKED QUESTIONS — ", "FREQUENTLY ASKED QUESTIONS — "),  # no-op

    # Other typos
    ("Cote d’Ivoire", "Cote d'Ivoire"),
]


def fix_file(path: Path) -> int:
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return 0
    original = content
    count = 0
    for old, new in FIXES:
        if old == new:
            continue
        n = content.count(old)
        if n:
            content = content.replace(old, new)
            count += n
    if content != original:
        path.write_text(content, encoding="utf-8")
    return count


def main():
    grand_total = 0
    for hub in HUBS:
        hub_dir = EN / hub
        if not hub_dir.is_dir():
            continue
        files = sorted([f for f in hub_dir.glob("*.html") if f.name != "index.html"])
        hub_total = 0
        for f in files:
            n = fix_file(f)
            if n:
                print(f"  {hub}/{f.name}: {n}")
            hub_total += n
        if hub_total:
            print(f"=== {hub}: {hub_total} replacements")
        grand_total += hub_total
    print(f"\nGrand total: {grand_total} replacements across all hubs")


if __name__ == "__main__":
    main()
