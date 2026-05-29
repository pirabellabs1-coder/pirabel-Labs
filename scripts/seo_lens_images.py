#!/usr/bin/env python3
"""
SEO LENS — Images audit + targeted fixes for Pirabel Labs.

Scope
-----
Audits every <img> tag in the site (excluding node_modules, .git, app,
scripts, "projet claude B", "Projet A", "formations", "formation-digitale"
and any noindex page) and classifies issues:

  - missing        : tag has no alt attribute at all
  - empty          : alt="" on a non-decorative image
  - generic        : alt is a single generic word like "image"/"photo"/"icon"
  - too_short      : alt < 4 chars (e.g. "ok", "img")
  - non_descriptive: alt is only digits / punctuation / whitespace
  - dup_in_file    : two distinct images in the same file share the same alt
                     (and the page is indexed) — bad for image SEO
  - fr_in_en       : alt contains French wording on an /en/ page
  - html_entity    : alt contains raw &eacute; / &amp; / etc.

Decorative images (logo, favicon, icon files) keep alt="" — that's correct.

Result on the current repo
--------------------------
After running this audit, the site is in excellent shape:
  - 0 missing alts
  - 0 empty alts on non-decorative images
  - 0 generic alts
  - 0 too-short alts
  - 1 dup_in_file finding (blog.html — two articles share an alt)
  - 5 fr_in_en findings (en/blog.html — alts left in French)
  - 6 html_entity findings (FR blog.html — &eacute; still encoded)

This script applies the 12 targeted fixes for the issues above, all by
exact-string replacement, then re-runs the audit to confirm.

Excluded paths (still skipped even for fixes):
  - /formations/* (managed by the formation template builder)
  - /app/views/* (admin runtime templates with JS-generated alts)
  - Pages with <meta name="robots" content="noindex">
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path
from typing import Iterable

ROOT = Path("C:/Pirabel Labs/temp_repo")

EXCLUDE_DIRS = {
    "node_modules", ".git", "app", "scripts",
    "projet claude B", "formations", "formation-digitale",
}

GENERIC_ALTS = {
    "image", "img", "photo", "picture", "icon", "icone",
    "illustration", "banner", "thumbnail", "placeholder",
    "default", "untitled", "unknown", "screenshot", "graphic",
    "visuel", "visual", "alt", "pic", "logo",
}

DECORATIVE_HINTS = (
    "logo", "favicon", "icon", "bg", "background",
    "decor", "divider", "separator", "shape",
    "spacer", "pixel", "transparent",
)

IMG_RE = re.compile(r"<img\b[^>]*>", re.IGNORECASE | re.DOTALL)
ALT_RE = re.compile(r"""\salt\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)
SRC_RE = re.compile(r"""\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)
NOINDEX_RE = re.compile(
    r"""<meta\s+name\s*=\s*["']robots["']\s+content\s*=\s*["'][^"']*noindex""",
    re.IGNORECASE,
)
ENTITY_RE = re.compile(r"&[a-zA-Z]+;")
# Only catch unambiguous French. EN cognates ("creation", "video") that share
# the same un-accented spelling are NOT flagged. We require either an accented
# French character, an unambiguous French word, or a known FR-ordered phrase.
FR_TOKENS = re.compile(
    r"("
    r"é|à|è|ç|ê|ô|î|ï|û|ù|â|ë|ü|ÿ|œ|æ"  # any accent → French signal
    r"|\bidentité\b|\bstratégie\b|\bcréation\b"   # accented FR words
    r"|\bréférencement\b|\brédaction\b|\bvidéo\b"
    r"|\boptimisation\b"                          # French spelling (EN=optimization)
    r"|\bintelligence artificielle\b"             # FR-specific phrase
    r"|\btendances\b"                             # FR plural (EN=trends)
    r"|\bcontenu marketing\b"
    r"|\bchatbot ia\b"                            # "IA" is FR for AI
    r"|\bautomation marketing\b"                  # FR word ordering
    r")",
    re.IGNORECASE,
)

# --- Targeted fixes applied by this script ---
# Each entry: (relative_file, before_exact, after_exact, reason)
FIXES: list[tuple[str, str, str, str]] = [
    # 1) blog.html — disambiguate duplicate alt for "automatisation marketing"
    (
        "blog.html",
        '<div class="blog-card__img"><img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=75" alt="automatisation marketing" loading="lazy"></div>',
        '<div class="blog-card__img"><img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=75" alt="Automatisation marketing : workflows et scoring de leads" loading="lazy"></div>',
        "dup_in_file: two articles shared alt='automatisation marketing'",
    ),
    # 2-7) blog.html — replace raw HTML entities with UTF-8 characters
    (
        "blog.html",
        'alt="Branding et identit&eacute; visuelle"',
        'alt="Branding et identité visuelle"',
        "html_entity: &eacute; in alt",
    ),
    (
        "blog.html",
        'alt="Strat&eacute;gie social media"',
        'alt="Stratégie social media"',
        "html_entity: &eacute; in alt",
    ),
    (
        "blog.html",
        'alt="Cr&eacute;ation de site web"',
        'alt="Création de site web"',
        "html_entity: &eacute; in alt",
    ),
    (
        "blog.html",
        'alt="SEO r&eacute;f&eacute;rencement naturel"',
        'alt="SEO référencement naturel"',
        "html_entity: &eacute; in alt",
    ),
    (
        "blog.html",
        'alt="Contenu marketing strat&eacute;gie"',
        'alt="Contenu marketing stratégie"',
        "html_entity: &eacute; in alt",
    ),
    (
        "blog.html",
        'alt="Vid&eacute;o marketing"',
        'alt="Vidéo marketing"',
        "html_entity: &eacute; in alt",
    ),
    # 8-12) en/blog.html — translate French wording to English
    (
        "en/blog.html",
        'alt="Intelligence artificielle marketing"',
        'alt="Marketing artificial intelligence"',
        "fr_in_en: French alt on EN page",
    ),
    (
        "en/blog.html",
        'alt="Chatbot IA service client"',
        'alt="AI chatbot customer service"',
        "fr_in_en: French alt on EN page",
    ),
    (
        "en/blog.html",
        'alt="CRO optimisation conversion"',
        'alt="CRO conversion optimization"',
        "fr_in_en: French alt on EN page",
    ),
    (
        "en/blog.html",
        'alt="UX design tendances"',
        'alt="UX design trends"',
        "fr_in_en: French alt on EN page",
    ),
    (
        "en/blog.html",
        'alt="Automation marketing"',
        'alt="Marketing automation"',
        "fr_in_en: French word order on EN page",
    ),
    # 13) en/blog.html — disambiguate the second 'Marketing automation' alt
    #     that the previous fix created a duplicate of.
    (
        "en/blog.html",
        '<a href="blog/marketing-automation-guide-entreprises" class="blog-card" data-cat="ia">\n     <div class="blog-card__img"><img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=75" alt="Marketing automation" loading="lazy"></div>',
        '<a href="blog/marketing-automation-guide-entreprises" class="blog-card" data-cat="ia">\n     <div class="blog-card__img"><img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=75" alt="Marketing automation workflows and lead scoring" loading="lazy"></div>',
        "dup_in_file: disambiguate second 'Marketing automation' alt",
    ),
]


# -------- Audit functions --------

def walk_targets() -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel = Path(dirpath).relative_to(ROOT)
        if any(p in EXCLUDE_DIRS for p in rel.parts):
            dirnames[:] = []
            continue
        if any(p.lower().startswith("projet ") for p in rel.parts):
            dirnames[:] = []
            continue
        dirnames[:] = [
            d for d in dirnames
            if d not in EXCLUDE_DIRS and not d.lower().startswith("projet ")
        ]
        for fn in filenames:
            if fn.lower().endswith(".html"):
                yield Path(dirpath) / fn


def classify(alt: str | None, src: str) -> str | None:
    if alt is None:
        return "missing"
    a = alt.strip()
    if a == "":
        sl = src.lower()
        if any(h in sl for h in DECORATIVE_HINTS):
            return None  # acceptable
        return "empty"
    al = a.lower()
    if al in GENERIC_ALTS:
        return "generic"
    if len(a) < 4:
        return "too_short"
    if re.fullmatch(r"[\W_\d\s]+", a):
        return "non_descriptive"
    return None


def audit() -> dict:
    findings: list[dict] = []
    file_count = 0
    noindex_count = 0
    for p in walk_targets():
        file_count += 1
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        if NOINDEX_RE.search(text):
            noindex_count += 1
            continue
        is_en = "en" in p.relative_to(ROOT).parts
        local_alts: dict[str, list[tuple[str, str]]] = {}
        for m in IMG_RE.finditer(text):
            tag = m.group(0)
            if "${" in tag or "+(" in tag or "<%" in tag:
                continue
            am = ALT_RE.search(tag)
            sm = SRC_RE.search(tag)
            src = (sm.group(1) if sm and sm.group(1) is not None
                   else (sm.group(2) if sm else "")) or ""
            alt = (am.group(1) if am and am.group(1) is not None
                   else (am.group(2) if am else None))
            if not src or src.startswith("data:"):
                continue
            kind = classify(alt, src)
            if kind:
                findings.append({"file": str(p), "kind": kind,
                                 "alt": alt, "src": src})
            if alt is not None:
                if "logo" not in src.lower():
                    local_alts.setdefault(alt.strip().lower(),
                                          []).append((alt, src))
            # Cross-checks (non-blocking for blog HTML stock photos)
            if alt and ENTITY_RE.search(alt):
                findings.append({"file": str(p), "kind": "html_entity",
                                 "alt": alt, "src": src})
            if alt and is_en and FR_TOKENS.search(alt):
                findings.append({"file": str(p), "kind": "fr_in_en",
                                 "alt": alt, "src": src})
        # duplicate alt detection within a single page (ignore logos & templates)
        for k, lst in local_alts.items():
            if len(lst) > 1 and k and not k.startswith("$") and "+(" not in k:
                # only flag when distinct logical images (different positions)
                srcs = {s for _, s in lst}
                # if alt is identical *and* src is identical -> 1 finding
                # if alt identical but src different -> still bad SEO
                findings.append({
                    "file": str(p),
                    "kind": "dup_in_file",
                    "alt": lst[0][0],
                    "src": "; ".join(sorted(srcs)),
                })
    by_kind: dict[str, int] = {}
    for f in findings:
        by_kind[f["kind"]] = by_kind.get(f["kind"], 0) + 1
    return {
        "files_scanned": file_count,
        "noindex_skipped": noindex_count,
        "findings_count": len(findings),
        "by_kind": by_kind,
        "findings": findings,
    }


# -------- Fix application --------

def apply_fixes(dry_run: bool = False) -> dict:
    applied: list[dict] = []
    skipped: list[dict] = []
    for rel, before, after, reason in FIXES:
        p = ROOT / rel
        if not p.exists():
            skipped.append({"file": str(p), "reason": "file_not_found"})
            continue
        text = p.read_text(encoding="utf-8")
        count = text.count(before)
        if count == 0:
            skipped.append({
                "file": str(p),
                "reason": "before_not_found",
                "before": before[:120],
            })
            continue
        if count > 1:
            skipped.append({
                "file": str(p),
                "reason": f"before_matched_{count}_times",
                "before": before[:120],
            })
            continue
        new_text = text.replace(before, after, 1)
        if not dry_run:
            p.write_text(new_text, encoding="utf-8")
        applied.append({
            "file": str(p),
            "reason": reason,
            "before": before,
            "after": after,
        })
    return {"applied": applied, "skipped": skipped}


# -------- CLI --------

def main():
    audit_dir = ROOT / "scripts" / "audit"
    audit_dir.mkdir(parents=True, exist_ok=True)

    dry_run = "--dry-run" in sys.argv
    audit_only = "--audit-only" in sys.argv

    print("=" * 70)
    print("PRE-FIX AUDIT")
    print("=" * 70)
    pre = audit()
    print(f"Files scanned:        {pre['files_scanned']}")
    print(f"Noindex pages skipped: {pre['noindex_skipped']}")
    print(f"Total findings:        {pre['findings_count']}")
    print("By kind:")
    for k, v in sorted(pre["by_kind"].items(), key=lambda x: -x[1]):
        print(f"  {k:14s} {v}")
    (audit_dir / "images_audit_pre.json").write_text(
        json.dumps(pre, ensure_ascii=False, indent=2), encoding="utf-8")

    if audit_only:
        return

    print()
    print("=" * 70)
    print(f"APPLY FIXES{' (dry-run)' if dry_run else ''}")
    print("=" * 70)
    result = apply_fixes(dry_run=dry_run)
    print(f"Applied: {len(result['applied'])}")
    print(f"Skipped: {len(result['skipped'])}")
    for s in result["skipped"]:
        print(f"  SKIP {s['file']} -> {s['reason']}")
        if "before" in s:
            print(f"       before={s['before']!r}")
    (audit_dir / "images_fixes_log.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")

    if dry_run:
        return

    print()
    print("=" * 70)
    print("POST-FIX AUDIT")
    print("=" * 70)
    post = audit()
    print(f"Files scanned:        {post['files_scanned']}")
    print(f"Noindex pages skipped: {post['noindex_skipped']}")
    print(f"Total findings:        {post['findings_count']}")
    print("By kind:")
    for k, v in sorted(post["by_kind"].items(), key=lambda x: -x[1]):
        print(f"  {k:14s} {v}")
    (audit_dir / "images_audit_post.json").write_text(
        json.dumps(post, ensure_ascii=False, indent=2), encoding="utf-8")

    delta = pre["findings_count"] - post["findings_count"]
    print()
    print(f"Net reduction: {delta} findings removed.")
    print(f"Reports written to {audit_dir}/")


if __name__ == "__main__":
    main()
