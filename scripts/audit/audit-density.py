"""
audit-density.py
Measures keyword density and content depth per page (FR and EN).
Outputs CSV with: path, lang, word_count, title_len, meta_len, h1_count, keyword_hits
Usage:
  python scripts/audit/audit-density.py
  python scripts/audit/audit-density.py <path>
"""
import csv
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GLOSSARY_DIR = Path(__file__).resolve().parent / "glossary"
REPORT = ROOT / "scripts" / "audit" / "reports" / "density.csv"

SKIP_DIRS = (
    "node_modules", "admin_x9k2m7v4p8w1n", "client_portal_v4p8w1n", "pirabel-admin",
    "espace-client-4p8w1n", "Projet A", ".git", ".vercel", "scripts", "img", "css", "js"
)

TITLE_RE = re.compile(r"<title>([^<]*)</title>", re.IGNORECASE)
META_RE = re.compile(
    r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.IGNORECASE
)
H1_RE = re.compile(r"<h1\b", re.IGNORECASE)
LANG_RE = re.compile(r'<html[^>]+lang=["\']([a-z]{2})', re.IGNORECASE)

TAG_RE = re.compile(r"<[^>]+>")
SCRIPT_RE = re.compile(r"<script\b[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL)
STYLE_RE = re.compile(r"<style\b[^>]*>.*?</style>", re.IGNORECASE | re.DOTALL)
COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)


def visible_text(html: str) -> str:
    s = SCRIPT_RE.sub(" ", html)
    s = STYLE_RE.sub(" ", s)
    s = COMMENT_RE.sub(" ", s)
    s = TAG_RE.sub(" ", s)
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def load_glossaries() -> dict:
    """Return {hub_name: [keywords]} for all JSON files in glossary/."""
    out = {}
    if not GLOSSARY_DIR.exists():
        return out
    for f in GLOSSARY_DIR.glob("*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            continue
        kws = []
        for key in ("primary", "lsi", "long_tail"):
            if key in data and isinstance(data[key], list):
                kws.extend(data[key])
        if "geo" in data and isinstance(data["geo"], dict):
            for city_kws in data["geo"].values():
                if isinstance(city_kws, list):
                    kws.extend(city_kws)
        out[f.stem] = list(set(kws))
    return out


def detect_hub(rel_path: str) -> str:
    """Map a file path to a hub key (matches glossary filenames)."""
    p = rel_path.lower()
    if "seo" in p:
        return "seo"
    if "creation-sites-web" in p or "web-design" in p or "wordpress" in p:
        return "web"
    if "ia-automatisation" in p or "ai-automation" in p or "automation" in p:
        return "ai"
    if "design-branding" in p or "branding" in p:
        return "design"
    if "publicite-payante" in p or "ads" in p or "sea-ads" in p:
        return "ads"
    if "social-media" in p:
        return "social"
    if "email-marketing" in p or "email" in p:
        return "email"
    if "video-motion" in p or "video" in p:
        return "video"
    if "sales-funnels" in p or "funnels" in p or "cro" in p:
        return "funnels"
    if "redaction-content" in p or "content-marketing" in p or "copywriting" in p:
        return "content"
    return "general"


def count_keywords(text: str, keywords: list) -> int:
    if not keywords:
        return 0
    lower = text.lower()
    n = 0
    for kw in keywords:
        if not kw:
            continue
        n += lower.count(kw.lower())
    return n


def audit_file(path: Path, glossaries: dict) -> dict:
    try:
        html = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return None

    rel = str(path.relative_to(ROOT)).replace("\\", "/")
    lang_m = LANG_RE.search(html[:500])
    lang = lang_m.group(1).lower() if lang_m else ("en" if rel.startswith("en/") else "fr")

    text = visible_text(html)
    word_count = len(text.split())

    title = ""
    tm = TITLE_RE.search(html)
    if tm:
        title = tm.group(1).strip()
    meta = ""
    mm = META_RE.search(html)
    if mm:
        meta = mm.group(1).strip()
    h1_count = len(H1_RE.findall(html))

    hub = detect_hub(rel)
    kws = glossaries.get(hub, [])
    kw_hits = count_keywords(text, kws)

    return {
        "path": rel,
        "lang": lang,
        "hub": hub,
        "word_count": word_count,
        "title_len": len(title),
        "meta_len": len(meta),
        "h1_count": h1_count,
        "keyword_hits": kw_hits,
        "title": title[:80],
    }


def should_skip(p: Path) -> bool:
    s = str(p).replace(os.sep, "/")
    return any(x in s for x in SKIP_DIRS)


def scan_all() -> list:
    glossaries = load_glossaries()
    results = []
    for f in ROOT.rglob("*.html"):
        if should_skip(f):
            continue
        r = audit_file(f, glossaries)
        if r:
            results.append(r)
    return results


def write_csv(rows: list, out: Path):
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=[
            "path", "lang", "hub", "word_count", "title_len", "meta_len",
            "h1_count", "keyword_hits", "title"
        ])
        w.writeheader()
        for r in rows:
            w.writerow(r)


def main():
    args = sys.argv[1:]
    glossaries = load_glossaries()

    if args:
        target = Path(args[0])
        if not target.is_absolute():
            target = ROOT / target
        if not target.exists():
            print(f"NOT FOUND: {target}")
            sys.exit(2)
        r = audit_file(target, glossaries)
        print(f"PATH: {r['path']}")
        print(f"LANG: {r['lang']}  HUB: {r['hub']}")
        print(f"WORDS: {r['word_count']}")
        print(f"TITLE_LEN: {r['title_len']}  META_LEN: {r['meta_len']}")
        print(f"H1_COUNT: {r['h1_count']}")
        print(f"KEYWORD_HITS: {r['keyword_hits']}")
        return

    rows = scan_all()
    write_csv(rows, REPORT)

    total = len(rows)
    en = [r for r in rows if r["lang"] == "en"]
    fr = [r for r in rows if r["lang"] == "fr"]
    avg_en = sum(r["word_count"] for r in en) // max(len(en), 1)
    avg_fr = sum(r["word_count"] for r in fr) // max(len(fr), 1)
    under_2000 = sum(1 for r in rows if r["word_count"] < 2000)
    print(f"Scanned: {total} files (FR: {len(fr)}, EN: {len(en)})")
    print(f"Avg words FR: {avg_fr}")
    print(f"Avg words EN: {avg_en}")
    print(f"Under 2000 words: {under_2000} ({under_2000*100//max(total,1)}%)")
    print(f"Report: {REPORT}")


if __name__ == "__main__":
    main()
