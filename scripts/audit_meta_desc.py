"""Properly audit meta description lengths (handles apostrophes inside)."""
import re, os
from pathlib import Path

# Match content with EITHER " or ', and only stop on the SAME quote.
DESC_RE = re.compile(r'<meta\s+name=["\']description["\']\s+content=("([^"]*)"|\'([^\']*)\')', re.I)

sitemap_raw = Path('sitemap.xml').read_text(encoding='utf-8')
locs = re.findall(r'<loc>https://www\.pirabellabs\.com([^<]*)</loc>', sitemap_raw)
public_files = set()
for u in locs:
    rel = u.lstrip('/').rstrip('/')
    for c in ([rel + '.html', rel + '/index.html'] if rel else ['index.html']):
        if Path(c).exists():
            public_files.add(c.replace(os.sep, '/'))

short = []
long_ = []
ok = 0
for f in public_files:
    content = Path(f).read_text(encoding='utf-8', errors='ignore')
    m = DESC_RE.search(content)
    if not m: continue
    desc = m.group(2) if m.group(2) is not None else m.group(3)
    n = len(desc)
    if n < 50: short.append((f, n, desc))
    elif n > 160: long_.append((f, n, desc))
    else: ok += 1

print(f"Total checked: {ok + len(short) + len(long_)}")
print(f"In optimal range (50-160): {ok}")
print(f"Short (<50 chars): {len(short)}")
for f, n, d in short:
    print(f"  {f} ({n}): {d}")
print()
print(f"Long (>160 chars): {len(long_)}")
for f, n, d in long_[:15]:
    print(f"  {f} ({n}): {d[:120]}...")
if len(long_) > 15:
    print(f"  ... and {len(long_)-15} more")
