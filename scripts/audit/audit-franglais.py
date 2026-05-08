"""
audit-franglais.py
Scans /en/**/*.html and detects French content leaks (franglais).
Outputs CSV with: path, fr_score, fr_tokens_found, word_count, has_fr_in_h1
Usage:
  python scripts/audit/audit-franglais.py            # scan all en/, write CSV
  python scripts/audit/audit-franglais.py <path>     # scan one file, print details
  python scripts/audit/audit-franglais.py --strict <path>   # exit 1 if any FR found
"""
import csv
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EN_DIR = ROOT / "en"
REPORT = ROOT / "scripts" / "audit" / "reports" / "franglais.csv"

SKIP_DIRS = (
    "node_modules", "admin_x9k2m7v4p8w1n", "client_portal_v4p8w1n", "pirabel-admin",
    "espace-client-4p8w1n", "Projet A", ".git", ".vercel"
)

# French tokens that should NEVER appear in English pages.
# Includes function words, accented chars, common verbs, articles.
FR_TOKENS = [
    # Articles, pronouns, function words
    # NOTE: "pour", "par", "plus", "creation", "service" are excluded — they
    # are valid English words and produced too many false positives.
    r"\bnotre\b", r"\bnos\b", r"\bvotre\b", r"\bvos\b", r"\bnous\b", r"\bvous\b",
    r"\bavec\b", r"\bsans\b", r"\bdans\b",
    r"\bdes\b", r"\bdu\b", r"\bune\b", r"\bune\s", r"\bune,",
    r"\bcette\b", r"\bces\b", r"\bson\b", r"\bsa\b", r"\bses\b", r"\bleur\b", r"\bleurs\b",
    r"\bque\b", r"\bqui\b", r"\bdont\b", r"\boù\b",
    r"\best\b", r"\bsont\b", r"\bétait\b", r"\bétaient\b", r"\bsera\b",
    r"\bmoins\b", r"\btrès\b", r"\btrop\b", r"\bdéjà\b",
    r"\baussi\b", r"\bencore\b", r"\bjamais\b", r"\btoujours\b", r"\bsouvent\b",
    r"\bmieux\b",

    # Common French verbs / phrases
    r"\bprend\s+en\s+charge\b", r"\bcoeur\s+de\s+m[ée]tier\b", r"\bsur[\s-]?mesure\b",
    r"\bpuissiez\b", r"\bn['e]\s+represente\b", r"\bpas\s+les\b",
    r"\bdéveloppeur\b", r"\bdeveloppeur\b", r"\bentreprise[s]?\b",
    r"\bsoci[ée]t[ée]\b", r"\bréalisations?\b", r"\bréussite\b",
    r"\bdécouvrir\b", r"\bdécouvrez\b", r"\bcontactez\b", r"\bcommencer\b",
    r"\bfaire\b", r"\bfait\b", r"\bfaites\b",
    r"\bgrâce\b", r"\bafin\b", r"\bdès\b",
    r"\bréf[ée]rencement\b", r"\bréseaux\b", r"\brésultats?\b",
    r"\bstrat[ée]gique\b", r"\bgestion\b",
    # creation kept out: valid EN word; only the accented form should fail
    r"\bcréation\b",

    # Geo / business specific FR phrases that leaked
    r"\bcapitale\s+[ée]conomique\b", r"\bmarch[ée]\s+en\s+expansion\b",
    r"\bcapitale\s+politique\b", r"\bp[ôo]le\s+[ée]conomique\b",
    r"\bsp[ée]cificit[ée]s?\b", r"\bobjectifs?\b(?!\sof)",

    # Mixed franglais constructs
    r"\bne\s+\w+\s+not\b", r"\bne\s+represente\b",
    r"\bImpossible\s+de\s+\w+\b", r"\bnotre\s+[éée]quipe\b",
    r"\bvotre\s+strat[ée]gie\b",
]

# Standalone accented words (any token containing these accents inside an EN page is suspect)
ACCENT_PATTERN = re.compile(r"\b\w*[éèêëàâäîïôöùûüç]\w*\b", re.IGNORECASE | re.UNICODE)

# Allowed exceptions (proper nouns, brand names, city names)
ALLOWED = {
    "Pirabel", "Pirabel Labs", "Cote d'Ivoire", "Côte d'Ivoire",
    "Île-de-France", "Ile-de-France", "Île", "Montréal", "Montreal",
    "Quebec", "Québec", "Yaoundé", "Yaounde", "Lomé", "Lome",
    "Libreville", "Sénégal", "Senegal", "Bénin", "Benin",
    "Café", "Façade",  # rarely needed but accepted
    "Beyoncé", "Pelé",  # any name
    "Naïve", "Café", "Résumé",
    "Etat", "État",  # state
    "Émilie", "Émile",
    "À propos",  # only if in nav comment
    # Geographic place names
    "Presqu'île", "Presqu'ile",
    "Île-de-France", "Ile-de-France",
}

FR_PATTERNS = [re.compile(p, re.IGNORECASE | re.UNICODE) for p in FR_TOKENS]

H1_RE = re.compile(r"<h1[^>]*>(.*?)</h1>", re.IGNORECASE | re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")
SCRIPT_RE = re.compile(r"<script\b[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL)
STYLE_RE = re.compile(r"<style\b[^>]*>.*?</style>", re.IGNORECASE | re.DOTALL)
COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)


def visible_text(html: str) -> str:
    """Strip HTML, keep only visible text content."""
    s = SCRIPT_RE.sub(" ", html)
    s = STYLE_RE.sub(" ", s)
    s = COMMENT_RE.sub(" ", s)
    s = TAG_RE.sub(" ", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def is_allowed(token: str) -> bool:
    t = token.strip().strip(".,;:!?()[]{}").lower()
    allowed_lower = [a.lower() for a in ALLOWED]
    return any(t == a or t in a or a in t for a in allowed_lower)


def find_fr_tokens(text: str) -> list:
    found = []
    for pat in FR_PATTERNS:
        for m in pat.finditer(text):
            tok = m.group(0)
            if not is_allowed(tok):
                found.append(tok.lower())
    # Accent-based catch (anything that has French accents)
    for m in ACCENT_PATTERN.finditer(text):
        tok = m.group(0)
        if not is_allowed(tok):
            found.append(tok.lower())
    return found


def audit_file(path: Path) -> dict:
    try:
        html = path.read_text(encoding="utf-8", errors="ignore")
    except Exception as e:
        return {"path": str(path), "error": str(e)}

    text = visible_text(html)
    word_count = len(text.split())
    fr_found = find_fr_tokens(text)

    # H1 specific check
    h1_match = H1_RE.search(html)
    h1_text = ""
    h1_has_fr = False
    if h1_match:
        h1_text = visible_text(h1_match.group(1))
        h1_has_fr = bool(find_fr_tokens(h1_text))

    return {
        "path": str(path.relative_to(ROOT)).replace("\\", "/"),
        "fr_score": len(fr_found),
        "fr_tokens_found": "|".join(sorted(set(fr_found))[:20]),
        "word_count": word_count,
        "h1_text": h1_text[:80],
        "h1_has_fr": h1_has_fr,
    }


def should_skip(p: Path) -> bool:
    s = str(p).replace(os.sep, "/")
    return any(x in s for x in SKIP_DIRS)


def scan_all() -> list:
    results = []
    for f in EN_DIR.rglob("*.html"):
        if should_skip(f):
            continue
        results.append(audit_file(f))
    return results


def write_csv(rows: list, out: Path):
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=[
            "path", "fr_score", "fr_tokens_found", "word_count", "h1_text", "h1_has_fr"
        ])
        w.writeheader()
        for r in rows:
            if "error" in r:
                continue
            w.writerow(r)


def main():
    args = sys.argv[1:]
    strict = "--strict" in args
    if strict:
        args.remove("--strict")

    if args:
        # Single file mode
        target = Path(args[0])
        if not target.is_absolute():
            target = ROOT / target
        if not target.exists():
            print(f"NOT FOUND: {target}")
            sys.exit(2)
        r = audit_file(target)
        print(f"PATH: {r['path']}")
        print(f"WORDS: {r['word_count']}")
        print(f"FR_SCORE: {r['fr_score']}")
        print(f"H1: {r['h1_text']}")
        print(f"H1_HAS_FR: {r['h1_has_fr']}")
        if r["fr_tokens_found"]:
            print(f"FR TOKENS: {r['fr_tokens_found']}")
        if strict and (r["fr_score"] > 0 or r["h1_has_fr"]):
            sys.exit(1)
        return

    # Full scan
    rows = scan_all()
    write_csv(rows, REPORT)

    total = len(rows)
    with_fr = sum(1 for r in rows if r.get("fr_score", 0) > 0)
    h1_fr = sum(1 for r in rows if r.get("h1_has_fr"))
    avg_words = sum(r.get("word_count", 0) for r in rows) // max(total, 1)
    under_2000 = sum(1 for r in rows if r.get("word_count", 0) < 2000)

    print(f"Scanned: {total} files")
    print(f"With franglais: {with_fr} ({with_fr*100//max(total,1)}%)")
    print(f"H1 contains FR: {h1_fr}")
    print(f"Avg word count: {avg_words}")
    print(f"Under 2000 words: {under_2000} ({under_2000*100//max(total,1)}%)")
    print(f"Report: {REPORT}")

    if strict and (with_fr > 0 or h1_fr > 0):
        sys.exit(1)


if __name__ == "__main__":
    main()
