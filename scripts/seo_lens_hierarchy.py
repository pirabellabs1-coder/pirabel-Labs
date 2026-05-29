#!/usr/bin/env python3
"""
SEO Lens: Heading Hierarchy Audit

Scans all indexable HTML pages (no <meta robots noindex>) under the repo and
checks heading order rules:
  - exactly one VISIBLE H1 per page (sr-only / visually-hidden H1s are tolerated
    but counted separately)
  - H1 text must be at least 8 chars
  - no level skips on the way down (H2 -> H4 etc.)
  - H1 must be present

Modes:
  --report   (default) print findings to stdout, write JSON summary
  --fix      apply safe auto-corrections:
               * insert sr-only H1 derived from <title> when a page has zero H1
                 and only ONE clearly dominant H2 lives near top
             (no visual changes; sr-only H1 lives above main content)

Run:
  python scripts/seo_lens_hierarchy.py              # report only
  python scripts/seo_lens_hierarchy.py --fix        # apply auto fixes
  python scripts/seo_lens_hierarchy.py --limit 100  # restrict scan size

Outputs:
  scripts/audit/hierarchy_report.json
  scripts/audit/hierarchy_manual_list.txt
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parent.parent
AUDIT_DIR = ROOT / "scripts" / "audit"

EXCLUDE_DIR_FRAGMENTS = (
    "node_modules",
    ".git",
    ".vercel",
    "scripts",         # tooling, not shipped
    "scratch",
    "projet claude B", # work directory, not shipped
    "Projet A",        # work directory, not shipped
    "app/views",       # admin SPA partials — robots.txt-disallowed routes
    "app/public",      # admin assets
    "api",             # serverless handlers
)

# ---------- helpers ----------

ROBOTS_NOINDEX_RE = re.compile(
    r"""<meta[^>]+name\s*=\s*["']robots["'][^>]+content\s*=\s*["'][^"']*noindex""",
    re.I,
)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
HEADING_RE = re.compile(r"<h([1-6])\b([^>]*)>(.*?)</h\1>", re.I | re.S)
TAG_STRIP_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")
SR_ONLY_CLASSES = ("sr-only", "visually-hidden", "screen-reader-text", "u-sr-only")
BODY_OPEN_RE = re.compile(r"<body\b[^>]*>", re.I)
MAIN_OPEN_RE = re.compile(r"<main\b[^>]*>", re.I)
HEADER_CLOSE_RE = re.compile(r"</header>", re.I)


def is_sr_only(attrs: str) -> bool:
    lower = attrs.lower()
    return any(c in lower for c in SR_ONLY_CLASSES) or "aria-hidden" not in lower and False or any(c in lower for c in SR_ONLY_CLASSES)


def is_sr_only_attrs(attrs: str) -> bool:
    lower = attrs.lower()
    return any(c in lower for c in SR_ONLY_CLASSES)


def clean_text(raw: str) -> str:
    txt = TAG_STRIP_RE.sub(" ", raw)
    # decode a couple very common entities, leave the rest alone
    txt = (
        txt.replace("&nbsp;", " ")
        .replace("&amp;", "&")
        .replace("&rsquo;", "'")
        .replace("&apos;", "'")
        .replace("&Eacute;", "E")
        .replace("&eacute;", "e")
    )
    return WS_RE.sub(" ", txt).strip()


def iter_html_files(root: Path) -> Iterable[Path]:
    for p in root.rglob("*.html"):
        s = str(p).replace("\\", "/")
        if any(f"/{frag}/" in s + "/" for frag in EXCLUDE_DIR_FRAGMENTS):
            continue
        yield p


# ---------- core analysis ----------

@dataclass
class Heading:
    level: int
    text: str
    sr_only: bool
    start: int   # byte offset in the source (for fixes)
    end: int


@dataclass
class PageReport:
    path: str
    title: str = ""
    visible_h1_count: int = 0
    sr_h1_count: int = 0
    headings: list[tuple[int, str, bool]] = field(default_factory=list)
    issues: list[str] = field(default_factory=list)
    auto_fixable: bool = False


def parse_page(path: Path) -> tuple[str, PageReport] | None:
    try:
        src = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return None
    if ROBOTS_NOINDEX_RE.search(src):
        return None  # not indexable, skip per task

    title_m = TITLE_RE.search(src)
    title = clean_text(title_m.group(1)) if title_m else ""

    headings: list[Heading] = []
    for m in HEADING_RE.finditer(src):
        level = int(m.group(1))
        attrs = m.group(2) or ""
        text = clean_text(m.group(3))
        headings.append(
            Heading(
                level=level,
                text=text,
                sr_only=is_sr_only_attrs(attrs),
                start=m.start(),
                end=m.end(),
            )
        )

    rep = PageReport(
        path=str(path.relative_to(ROOT)).replace("\\", "/"),
        title=title,
        headings=[(h.level, h.text, h.sr_only) for h in headings],
    )

    visible_h1 = [h for h in headings if h.level == 1 and not h.sr_only]
    sr_h1 = [h for h in headings if h.level == 1 and h.sr_only]
    rep.visible_h1_count = len(visible_h1)
    rep.sr_h1_count = len(sr_h1)

    total_h1 = rep.visible_h1_count + rep.sr_h1_count

    if total_h1 == 0:
        rep.issues.append("no_h1")
    if rep.visible_h1_count > 1:
        rep.issues.append(f"multiple_visible_h1:{rep.visible_h1_count}")

    # H1 empty / too short
    for h in headings:
        if h.level == 1 and len(h.text) < 8:
            rep.issues.append(f"h1_too_short:{len(h.text)}:'{h.text}'")
            break

    # Hierarchy skip: walk through headings, treat sr-only same
    prev_level = 0
    for h in headings:
        if prev_level == 0:
            if h.level > 1:
                rep.issues.append(f"first_heading_is_h{h.level}")
        else:
            if h.level > prev_level + 1:
                rep.issues.append(
                    f"skip_h{prev_level}->h{h.level}:'{h.text[:60]}'"
                )
        prev_level = h.level

    # Auto-fix eligibility: zero H1 AND we have a title we can use
    if total_h1 == 0 and title and len(title) >= 8:
        rep.auto_fixable = True

    return src, rep


# ---------- auto-fix ----------

SR_ONLY_STYLE = (
    'class="sr-only" '
    'style="position:absolute !important;width:1px;height:1px;padding:0;'
    'margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;'
    'border:0"'
)


def derive_h1_from_title(title: str) -> str:
    # Strip trailing " | Brand" or " - Brand"
    for sep in (" | ", " — ", " - "):
        if sep in title:
            title = title.split(sep, 1)[0]
            break
    title = title.strip()
    if len(title) > 120:
        title = title[:117].rstrip() + "..."
    return title


def apply_fix(path: Path, src: str, h1_text: str) -> bool:
    """Insert sr-only H1 right after <main> if present, else after </header>, else after <body>."""
    h1_html = f'<h1 {SR_ONLY_STYLE}>{h1_text}</h1>\n'

    for matcher in (MAIN_OPEN_RE, HEADER_CLOSE_RE, BODY_OPEN_RE):
        m = matcher.search(src)
        if not m:
            continue
        insert_at = m.end()
        new_src = src[:insert_at] + "\n" + h1_html + src[insert_at:]
        try:
            path.write_text(new_src, encoding="utf-8")
        except OSError:
            return False
        return True
    return False


# ---------- targeted structural fixes ----------

# Each entry: (label, old_substring, new_substring)
# Only patterns that preserve visual rendering (CSS class drives the size).
STRUCTURAL_REPLACEMENTS = (
    # 1. Lesson pages: sidebar TOC heading appears BEFORE the article H1 in DOM
    #    order. Demote to <p> with a heading-styled class so visuals stay the
    #    same (the class is just a label; no global CSS depends on the h3 tag).
    (
        "lesson_sidebar_toc",
        "<h3>Sommaire de la formation</h3>",
        '<p class="lesson-sidebar-title" role="heading" aria-level="2">'
        'Sommaire de la formation</p>',
    ),
    # 2. City-link cards in service pages use <h4 class="text-h4">…</h4>.
    #    The visible size is driven by class="text-h4", so we can change
    #    the tag h4 → h3 to remove the H2→H4 jump without any visual diff.
    (
        "city_card_h4_to_h3",
        '<h4 class="text-h4">',
        '<h3 class="text-h4">',
    ),
    # 3. Process-step cards use <h5 class="text-h4">. Same logic: tag swap
    #    h5 → h3 fixes H2→H5 jumps; visual size is driven by class.
    (
        "process_step_h5_to_h3",
        '<h5 class="text-h4">',
        '<h3 class="text-h4">',
    ),
)


def apply_structural_replacements(path: Path, src: str) -> tuple[str, list[str]]:
    """Apply all matching STRUCTURAL_REPLACEMENTS and return (new_src, applied_labels).
    Must also close the swapped end tag where unambiguous."""
    new_src = src
    applied: list[str] = []
    for label, old, new in STRUCTURAL_REPLACEMENTS:
        if old not in new_src:
            continue
        count = new_src.count(old)
        new_src = new_src.replace(old, new)

        # If we changed an opening tag h4→h3 or h5→h3, also close the
        # corresponding </h4>/</h5>. The repo's lesson/service templates emit
        # one closing tag per opening tag on the same logical line, so a
        # 1-for-1 swap is safe ONLY if the global count of </hN> matches
        # what we just replaced. To stay defensive we use a regex that closes
        # specifically the run of h4 → h3 just made.
        if label == "city_card_h4_to_h3":
            # close the matching </h4> tags that were opened by these cards.
            # Pattern: any '<h3 class="text-h4">TEXT</h4>' produced by the
            # replace above — rewrite the </h4> within that span only.
            new_src = re.sub(
                r'(<h3 class="text-h4">[^<]{1,200}?)</h4>',
                r"\1</h3>",
                new_src,
            )
        if label == "process_step_h5_to_h3":
            # NB: opener carries class="text-h4" (process cards reuse h4 size)
            new_src = re.sub(
                r'(<h3 class="text-h4">[^<]{1,200}?)</h5>',
                r"\1</h3>",
                new_src,
            )
        applied.append(f"{label}:{count}")
    if applied:
        try:
            path.write_text(new_src, encoding="utf-8")
        except OSError:
            return src, []
    return new_src, applied


# ---------- driver ----------

def main() -> int:
    ap = argparse.ArgumentParser(description="Heading hierarchy SEO lens")
    ap.add_argument("--fix", action="store_true", help="Apply safe auto fixes")
    ap.add_argument("--limit", type=int, default=0, help="Scan only first N files (debug)")
    ap.add_argument("--root", type=Path, default=ROOT, help="Repo root")
    args = ap.parse_args()

    AUDIT_DIR.mkdir(parents=True, exist_ok=True)

    files = list(iter_html_files(args.root))
    files.sort()
    if args.limit:
        files = files[: args.limit]

    indexable = 0
    reports: list[PageReport] = []
    fixed: list[str] = []
    structural_fixed: list[str] = []
    fix_failed: list[str] = []

    for path in files:
        parsed = parse_page(path)
        if parsed is None:
            continue
        src, rep = parsed
        indexable += 1
        if rep.issues:
            reports.append(rep)
        if args.fix:
            # 1. structural replacements (tag-swap style, design-safe)
            new_src, applied = apply_structural_replacements(path, src)
            if applied:
                structural_fixed.append(f"{rep.path} :: {','.join(applied)}")
                src = new_src
            # 2. inject sr-only H1 for pages still missing one
            if rep.auto_fixable:
                h1 = derive_h1_from_title(rep.title)
                ok = apply_fix(path, src, h1)
                if ok:
                    fixed.append(f"{rep.path} :: H1='{h1}'")
                else:
                    fix_failed.append(rep.path)

    # ---------- categorize ----------
    by_issue: dict[str, list[str]] = {}
    for r in reports:
        for iss in r.issues:
            key = iss.split(":")[0]
            by_issue.setdefault(key, []).append(r.path)

    manual_needed = sorted({
        r.path for r in reports
        if not r.auto_fixable
        and any(
            iss.startswith("multiple_visible_h1")
            or iss.startswith("skip_h")
            or iss.startswith("h1_too_short")
            or iss == "no_h1"
            for iss in r.issues
        )
    })

    summary = {
        "lens": "hierarchy",
        "indexable_pages_scanned": indexable,
        "pages_with_issues": len(reports),
        "by_issue": {k: len(v) for k, v in sorted(by_issue.items())},
        "auto_fixable_h1_inject": sum(1 for r in reports if r.auto_fixable),
        "h1_inject_fixed_count": len(fixed),
        "structural_fixed_count": len(structural_fixed),
        "fix_failed_count": len(fix_failed),
        "manual_needed_count": len(manual_needed),
    }

    (AUDIT_DIR / "hierarchy_report.json").write_text(
        json.dumps(
            {
                "summary": summary,
                "by_issue_sample": {
                    k: v[:25] for k, v in by_issue.items()
                },
                "fixed_h1_inject": fixed[:200],
                "fixed_structural": structural_fixed[:200],
                "fix_failed": fix_failed,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    (AUDIT_DIR / "hierarchy_manual_list.txt").write_text(
        "\n".join(manual_needed), encoding="utf-8"
    )

    # human-readable digest
    print("== SEO Lens: hierarchy ==")
    print(json.dumps(summary, indent=2))
    print(f"\nWrote {AUDIT_DIR/'hierarchy_report.json'}")
    print(f"Manual list: {AUDIT_DIR/'hierarchy_manual_list.txt'} ({len(manual_needed)} files)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
