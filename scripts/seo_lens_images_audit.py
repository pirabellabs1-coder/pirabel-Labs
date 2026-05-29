#!/usr/bin/env python3
"""
AUDIT-ONLY script (no writes). Scans <img> tags across the site and
classifies issues: missing alt, empty alt (non-decorative), generic alt.

Excludes dirs: node_modules, .git, app, scripts, projet claude B,
               formations, formation-digitale, Projet A
Also skips: pages with <meta name="robots" content="noindex">
"""

import os
import re
import json
from pathlib import Path

ROOT = Path("C:/Pirabel Labs/temp_repo")
EXCLUDE_DIRS = {
    "node_modules", ".git", "app", "scripts",
    "projet claude B", "formations", "formation-digitale",
}

GENERIC_ALTS = {
    "image", "img", "photo", "picture", "icon", "logo",
    "icone", "illustration", "banner", "thumbnail",
    "placeholder", "default", "untitled", "unknown",
    "screenshot", "graphic", "visuel", "visual", "alt", "pic",
}

IMG_RE = re.compile(r"<img\b[^>]*>", re.IGNORECASE | re.DOTALL)
ALT_RE = re.compile(r"""\salt\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)
SRC_RE = re.compile(r"""\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)
NOINDEX_RE = re.compile(
    r"""<meta\s+name\s*=\s*["']robots["']\s+content\s*=\s*["'][^"']*noindex""",
    re.IGNORECASE,
)


def classify_alt(alt_value, src):
    if alt_value is None:
        return "missing"
    a = alt_value.strip()
    if a == "":
        decorative_hints = ("logo", "favicon", "icon", "bg", "background",
                            "decor", "divider", "separator", "shape",
                            "spacer", "pixel", "transparent")
        sl = src.lower()
        if any(h in sl for h in decorative_hints):
            return None
        return "empty"
    al = a.lower()
    if al in GENERIC_ALTS:
        return "generic"
    if len(a) < 4:
        return "too_short"
    if re.fullmatch(r"[\W_\d\s]+", a):
        return "non_descriptive"
    return None


def audit_file(path: Path, skip_noindex=True):
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return [], False
    is_noindex = bool(NOINDEX_RE.search(text))
    if skip_noindex and is_noindex:
        return [], True
    findings = []
    for m in IMG_RE.finditer(text):
        tag = m.group(0)
        alt_m = ALT_RE.search(tag)
        src_m = SRC_RE.search(tag)
        alt_val = (alt_m.group(1) if alt_m and alt_m.group(1) is not None
                   else (alt_m.group(2) if alt_m else None))
        src_val = (src_m.group(1) if src_m and src_m.group(1) is not None
                   else (src_m.group(2) if src_m else "")) or ""
        # skip runtime-templated images (alt or src includes variables)
        if "${" in tag or "{{" in tag or "<%" in tag:
            continue
        if not src_val or src_val.startswith("data:"):
            continue
        kind = classify_alt(alt_val, src_val)
        if kind:
            findings.append({
                "file": str(path),
                "tag": tag,
                "alt": alt_val,
                "src": src_val,
                "kind": kind,
            })
    return findings, is_noindex


def walk_targets():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel_dir = Path(dirpath).relative_to(ROOT)
        if any(part in EXCLUDE_DIRS for part in rel_dir.parts):
            dirnames[:] = []
            continue
        if any(part.lower().startswith("projet ") for part in rel_dir.parts):
            dirnames[:] = []
            continue
        dirnames[:] = [
            d for d in dirnames
            if d not in EXCLUDE_DIRS and not d.lower().startswith("projet ")
        ]
        for fn in filenames:
            if fn.lower().endswith(".html"):
                yield Path(dirpath) / fn


def main():
    all_findings = []
    file_count = 0
    noindex_count = 0
    for p in walk_targets():
        file_count += 1
        findings, is_noindex = audit_file(p, skip_noindex=True)
        if is_noindex:
            noindex_count += 1
        all_findings.extend(findings)

    by_kind = {}
    by_src = {}
    by_file = {}
    by_alt = {}
    for f in all_findings:
        by_kind[f["kind"]] = by_kind.get(f["kind"], 0) + 1
        by_src[f["src"]] = by_src.get(f["src"], 0) + 1
        by_file[f["file"]] = by_file.get(f["file"], 0) + 1
        key = (f["kind"], (f["alt"] or "<none>"))
        by_alt[key] = by_alt.get(key, 0) + 1

    print(f"Files scanned: {file_count}")
    print(f"Noindex pages skipped: {noindex_count}")
    print(f"Total findings: {len(all_findings)}")
    print("By kind:")
    for k, v in sorted(by_kind.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    print("Top problematic alt values:")
    for (k, a), v in sorted(by_alt.items(), key=lambda x: -x[1])[:20]:
        print(f"  [{k}] {v:5d}  alt={a!r}")
    print("Top src values among findings:")
    for s, v in sorted(by_src.items(), key=lambda x: -x[1])[:20]:
        print(f"  {v:5d}  {s}")
    print("Top files (most findings):")
    for fp, v in sorted(by_file.items(), key=lambda x: -x[1])[:15]:
        print(f"  {v:4d}  {fp}")

    out = {
        "files_scanned": file_count,
        "noindex_skipped": noindex_count,
        "findings_count": len(all_findings),
        "by_kind": by_kind,
        "by_src_top": dict(sorted(by_src.items(), key=lambda x: -x[1])[:50]),
        "by_alt_top": [
            {"kind": k, "alt": a, "count": v}
            for (k, a), v in sorted(by_alt.items(), key=lambda x: -x[1])[:50]
        ],
        "findings_sample": all_findings[:200],
    }
    out_path = ROOT / "scripts" / "audit" / "images_audit_report.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2),
                        encoding="utf-8")
    print(f"\nReport: {out_path}")


if __name__ == "__main__":
    main()
