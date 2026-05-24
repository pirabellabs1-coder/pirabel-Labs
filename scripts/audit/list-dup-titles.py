#!/usr/bin/env python3
"""Liste les titres HTML dupliques et les fichiers concernes."""
import re
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[2]
TITLE_RE = re.compile(r'<title>([^<]+)</title>', re.IGNORECASE)

EXCLUDE_DIRS = {'.git', 'node_modules', 'app'}

def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

groups = defaultdict(list)
for html in iter_html():
    try:
        text = html.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    m = TITLE_RE.search(text)
    if not m:
        continue
    title = m.group(1).strip()
    rel = html.relative_to(ROOT).as_posix()
    groups[title].append(rel)

dups = {t: paths for t, paths in groups.items() if len(paths) > 1}
total_pages = sum(len(v) for v in dups.values())
print(f"Titres dupliques: {len(dups)} (touchent {total_pages} pages)")
print("=" * 80)
for title, paths in sorted(dups.items(), key=lambda x: -len(x[1])):
    print(f"\n[{len(paths)}x] {title}")
    for p in paths:
        print(f"   - {p}")
