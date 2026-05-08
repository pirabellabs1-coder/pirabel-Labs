"""
check-404.py
Crawl every HTML file under temp_repo and verify that internal href/src
targets resolve to an existing file.

Outputs CSV with columns: source_file, link, resolved_path, reason
"""
import csv
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / "scripts" / "audit" / "reports" / "broken-links.csv"

SKIP_DIRS = (
    "node_modules", ".git", ".vercel", "scratch",
)


def load_vercel_routes():
    """Load route patterns from vercel.json so we don't flag valid server
    routes (reviews → avis, espace-client-4p8w1n, calendar, etc.)."""
    routes = []
    vercel = ROOT / "vercel.json"
    if not vercel.exists():
        return routes
    try:
        cfg = json.loads(vercel.read_text(encoding="utf-8"))
    except Exception:
        return routes
    for r in cfg.get("routes", []):
        src = r.get("src")
        if not src:
            continue
        # Only keep routes matching paths that look like URL patterns
        # (skip internal handlers / filesystem entries)
        if r.get("handle"):
            continue
        # Anchor & strip trailing $ so we can do a simple regex match
        try:
            routes.append(re.compile("^" + src.rstrip("$") + "$" if src.startswith("^") or "(" in src or "[" in src
                                     else "^" + re.escape(src.rstrip("$")) + "$"))
        except re.error:
            # fall back: treat as literal exact match
            routes.append(re.compile("^" + re.escape(src.rstrip("$")) + "$"))
    return routes


VERCEL_ROUTES = load_vercel_routes()

SERVER_PREFIXES = (
    "/api/", "/admin/", "/pirabel-admin",
    "/admin_x9k2m7v4p8w1n_secure_access_2026",
    "/client_portal_v4p8w1n7x9k2m_access_secure",
    "/espace-client-4p8w1n",
    "/.well-known/",
)

# File extensions that imply a static asset under temp_repo
STATIC_EXTS = {".html", ".css", ".js", ".png", ".jpg", ".jpeg", ".webp",
               ".svg", ".gif", ".ico", ".pdf", ".txt", ".xml", ".json",
               ".woff", ".woff2", ".mp4", ".webm"}


def normalize_link(raw: str) -> str:
    """Strip fragment and query, decode percent-encoding, normalize separators."""
    if not raw:
        return ""
    raw = raw.strip()
    # remove fragment + query
    raw = raw.split("#", 1)[0]
    raw = raw.split("?", 1)[0]
    raw = unquote(raw)
    return raw


def is_external(link: str) -> bool:
    if not link:
        return True
    if link.startswith(("http://", "https://", "//")):
        return True
    if link.startswith(("mailto:", "tel:", "javascript:", "data:", "blob:", "wa.me")):
        return True
    return False


def is_server_route(link: str) -> bool:
    """True if link looks like a route handled by middleware/api, not static."""
    # prefix match for clearly server-handled paths
    if any(link.startswith(p) for p in SERVER_PREFIXES):
        return True
    # match against any route declared in vercel.json
    for pat in VERCEL_ROUTES:
        if pat.match(link):
            return True
    return False


def candidate_paths(target: Path):
    """Yield possible files to check for a given filesystem target."""
    yield target
    if target.suffix == "":
        # Directory or extensionless — check index.html and {target}.html
        yield target / "index.html"
        yield target.with_suffix(".html")


def resolve_link(source_file: Path, link: str) -> tuple[bool, str, str]:
    """Resolve a link against the source file's location.
    Returns (ok, resolved_path_str, reason_if_broken)."""
    # Absolute (from site root)
    if link.startswith("/"):
        target = ROOT / link.lstrip("/")
    else:
        target = (source_file.parent / link).resolve()

    # Bring back inside ROOT — if escape, treat as broken
    try:
        target.relative_to(ROOT)
    except ValueError:
        return (False, str(target), "outside repository root")

    for cand in candidate_paths(target):
        if cand.exists() and cand.is_file():
            return (True, str(cand.relative_to(ROOT)).replace("\\", "/"), "")
    # Not found — see if it points to a directory only
    if target.is_dir():
        return (False, str(target.relative_to(ROOT)).replace("\\", "/"), "directory has no index.html")
    return (False, str(target.relative_to(ROOT)).replace("\\", "/") if target.exists() else link, "file not found")


HREF_RE = re.compile(r'\b(?:href|src)\s*=\s*"([^"]+)"', re.IGNORECASE)


SCRIPT_RE = re.compile(r"<script\b[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL)
DYNAMIC_RE = re.compile(r"(\$\{|\bescape\(|\bencodeURI|\+url\+)")


def scan_file(html_path: Path):
    """Yield (link, resolved, reason) for each broken link in this file."""
    try:
        html = html_path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return
    # Strip <script> blocks so JS template literals (`${var}`) don't leak in.
    stripped = SCRIPT_RE.sub("", html)
    for m in HREF_RE.finditer(stripped):
        raw = m.group(1)
        link = normalize_link(raw)
        if not link or link == "#":
            continue
        # Dynamic href — JS-generated, skip.
        if DYNAMIC_RE.search(raw):
            continue
        if is_external(link):
            continue
        if is_server_route(link):
            continue
        ok, resolved, reason = resolve_link(html_path, link)
        if not ok:
            yield (raw, resolved, reason)


def should_skip(p: Path) -> bool:
    s = str(p).replace("\\", "/")
    return any(("/" + x + "/") in ("/" + s + "/") for x in SKIP_DIRS)


def main():
    rows = []
    counts = {"files_scanned": 0, "broken_links": 0, "files_with_broken": 0}
    for f in ROOT.rglob("*.html"):
        if should_skip(f):
            continue
        counts["files_scanned"] += 1
        broken = list(scan_file(f))
        if broken:
            counts["files_with_broken"] += 1
            counts["broken_links"] += len(broken)
            for link, resolved, reason in broken:
                rows.append({
                    "source": str(f.relative_to(ROOT)).replace("\\", "/"),
                    "link": link,
                    "resolved": resolved,
                    "reason": reason,
                })

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    with REPORT.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["source", "link", "resolved", "reason"])
        w.writeheader()
        for r in rows:
            w.writerow(r)

    print(f"Scanned {counts['files_scanned']} files")
    print(f"Files with broken links: {counts['files_with_broken']}")
    print(f"Total broken links: {counts['broken_links']}")
    print(f"Report: {REPORT}")


if __name__ == "__main__":
    main()
