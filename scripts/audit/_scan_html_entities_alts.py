"""Find alts with raw HTML entities like &eacute; that are not rendered."""
import os, re
from pathlib import Path

ROOT = Path('C:/Pirabel Labs/temp_repo')
EXCLUDE_DIRS = {'node_modules', '.git', 'app', 'scripts',
                'projet claude B', 'formations', 'formation-digitale'}

IMG_RE = re.compile(r'<img\b[^>]*>', re.IGNORECASE | re.DOTALL)
ALT_RE = re.compile(r"""\salt\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)
SRC_RE = re.compile(r"""\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)
NOINDEX_RE = re.compile(
    r"""<meta\s+name\s*=\s*["']robots["']\s+content\s*=\s*["'][^"']*noindex""",
    re.IGNORECASE,
)

entity_re = re.compile(r"&\w+;")
findings = []
for dirpath, dirnames, filenames in os.walk(ROOT):
    rel = Path(dirpath).relative_to(ROOT)
    if any(p in EXCLUDE_DIRS for p in rel.parts):
        dirnames[:] = []
        continue
    if any(p.lower().startswith('projet ') for p in rel.parts):
        dirnames[:] = []
        continue
    dirnames[:] = [d for d in dirnames
                   if d not in EXCLUDE_DIRS
                   and not d.lower().startswith('projet ')]
    for fn in filenames:
        if not fn.lower().endswith('.html'):
            continue
        p = Path(dirpath) / fn
        try:
            text = p.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        if NOINDEX_RE.search(text):
            continue
        for m in IMG_RE.finditer(text):
            tag = m.group(0)
            am = ALT_RE.search(tag)
            if not am:
                continue
            alt = (am.group(1) if am.group(1) is not None
                   else am.group(2))
            if entity_re.search(alt):
                findings.append((str(p), alt))

print(f"Alts with HTML entities: {len(findings)}")
seen = {}
for _, a in findings:
    seen[a] = seen.get(a, 0) + 1
for a, c in sorted(seen.items(), key=lambda x: -x[1])[:15]:
    print(f"  x{c}  {a!r}")
