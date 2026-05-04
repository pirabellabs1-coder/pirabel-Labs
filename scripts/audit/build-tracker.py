"""
build-tracker.py
Reads franglais.csv + density.csv and produces TRANSLATION_TRACKER.md.
Each row: path | sprint | status | fr_score | word_count | keyword_hits
Status is derived from gates:
  DONE     = fr_score == 0 AND word_count >= 2000 AND keyword_hits >= 30
  REVIEW   = fr_score == 0 AND word_count >= 1500
  WIP      = fr_score < 5 OR word_count >= 1000
  TODO     = otherwise
Sprint is derived from path prefix.
"""
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPORTS = ROOT / "scripts" / "audit" / "reports"
FRANGLAIS_CSV = REPORTS / "franglais.csv"
DENSITY_CSV = REPORTS / "density.csv"
OUT = ROOT / "TRANSLATION_TRACKER.md"


def load_csv(path: Path) -> list:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def detect_sprint(path: str) -> str:
    p = path.lower()
    if not p.startswith("en/"):
        return "S5-FR"
    rest = p[3:]
    # Pages racines EN
    root_pages = ("index.html", "services.html", "a-propos.html", "contact.html",
                  "carrieres.html", "resultats.html", "avis.html", "faq.html",
                  "blog.html", "candidature.html", "rendez-vous.html",
                  "mentions-legales.html", "politique-confidentialite.html")
    if rest in root_pages:
        return "S1-Roots"
    # Hub indexes
    if rest.endswith("/index.html") and rest.count("/") <= 2:
        return "S2-Hubs"
    # Guides / Blog
    if rest.startswith("guides/"):
        return "S4-Guides"
    if rest.startswith("blog/"):
        return "S4-Blog"
    # Sub-hubs (deeper index.html under hubs)
    if rest.endswith("/index.html"):
        return "S2-SubHubs"
    # City pages: agence-*/<city>.html
    if rest.startswith("agence-") or rest.startswith("consulting-") or rest.startswith("formation-") or rest.startswith("outils-"):
        return "S3-Cities"
    return "S2-Hubs"


def derive_status(fr_score: int, word_count: int, kw_hits: int) -> str:
    if fr_score == 0 and word_count >= 2000 and kw_hits >= 30:
        return "DONE"
    if fr_score == 0 and word_count >= 1500:
        return "REVIEW"
    if fr_score < 5 or word_count >= 1000:
        return "WIP"
    return "TODO"


def main():
    fr = load_csv(FRANGLAIS_CSV)
    de = load_csv(DENSITY_CSV)
    by_path = {}
    for r in fr:
        p = r["path"]
        by_path.setdefault(p, {})["fr_score"] = int(r.get("fr_score", 0) or 0)
        by_path[p]["h1_has_fr"] = r.get("h1_has_fr") == "True"
    for r in de:
        p = r["path"]
        by_path.setdefault(p, {})["word_count"] = int(r.get("word_count", 0) or 0)
        by_path[p]["keyword_hits"] = int(r.get("keyword_hits", 0) or 0)
        by_path[p]["lang"] = r.get("lang", "?")
        by_path[p]["hub"] = r.get("hub", "?")
        by_path[p]["title_len"] = int(r.get("title_len", 0) or 0)

    rows = []
    for path, data in by_path.items():
        fr_score = data.get("fr_score", 0)
        wc = data.get("word_count", 0)
        kh = data.get("keyword_hits", 0)
        status = derive_status(fr_score, wc, kh)
        sprint = detect_sprint(path)
        rows.append({
            "path": path,
            "sprint": sprint,
            "status": status,
            "lang": data.get("lang", "?"),
            "hub": data.get("hub", "?"),
            "fr_score": fr_score,
            "word_count": wc,
            "kw_hits": kh,
            "h1_fr": data.get("h1_has_fr", False),
        })

    # Stats
    total = len(rows)
    by_sprint = {}
    by_status = {"DONE": 0, "REVIEW": 0, "WIP": 0, "TODO": 0}
    for r in rows:
        by_sprint.setdefault(r["sprint"], {"DONE": 0, "REVIEW": 0, "WIP": 0, "TODO": 0, "total": 0})
        by_sprint[r["sprint"]][r["status"]] += 1
        by_sprint[r["sprint"]]["total"] += 1
        by_status[r["status"]] += 1

    # Build markdown
    lines = []
    lines.append("# Translation & SEO Tracker — Pirabel Labs")
    lines.append("")
    lines.append("Auto-generated from `scripts/audit/reports/*.csv`. Run `python scripts/audit/build-tracker.py` to refresh.")
    lines.append("")
    lines.append("## Global progress")
    lines.append("")
    lines.append(f"- Total pages: **{total}**")
    for s, c in by_status.items():
        pct = c * 100 // max(total, 1)
        lines.append(f"- {s}: {c} ({pct}%)")
    lines.append("")
    lines.append("## By sprint")
    lines.append("")
    lines.append("| Sprint | Total | DONE | REVIEW | WIP | TODO | Progress |")
    lines.append("|--------|-------|------|--------|-----|------|----------|")
    for s in sorted(by_sprint.keys()):
        d = by_sprint[s]
        pct = d["DONE"] * 100 // max(d["total"], 1)
        lines.append(f"| {s} | {d['total']} | {d['DONE']} | {d['REVIEW']} | {d['WIP']} | {d['TODO']} | {pct}% |")

    lines.append("")
    lines.append("## Pages")
    lines.append("")
    lines.append("| Path | Sprint | Status | Lang | Hub | FR | Words | KW |")
    lines.append("|------|--------|--------|------|-----|-----|-------|-----|")
    rows.sort(key=lambda r: (r["sprint"], r["status"] != "TODO", r["path"]))
    for r in rows:
        lines.append(
            f"| `{r['path']}` | {r['sprint']} | {r['status']} | {r['lang']} | {r['hub']} | "
            f"{r['fr_score']} | {r['word_count']} | {r['kw_hits']} |"
        )

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Tracker written: {OUT}")
    print(f"Total: {total} pages")
    for s, c in by_status.items():
        print(f"  {s}: {c}")


if __name__ == "__main__":
    main()
