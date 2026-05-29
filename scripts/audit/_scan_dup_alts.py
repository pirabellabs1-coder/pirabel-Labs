import os, re
from pathlib import Path

ROOT = Path('C:/Pirabel Labs/temp_repo')
EXCLUDE_DIRS = {'node_modules', '.git', 'app', 'scripts',
                'projet claude B', 'formations', 'formation-digitale'}

IMG_RE = re.compile(r'<img\b[^>]*>', re.IGNORECASE | re.DOTALL)
ALT_RE = re.compile(r"""\salt\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)
SRC_RE = re.compile(r"""\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)

dup_per_file = []
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
        alts_in_file = {}
        for m in IMG_RE.finditer(text):
            tag = m.group(0)
            am = ALT_RE.search(tag)
            sm = SRC_RE.search(tag)
            if not am or not sm:
                continue
            alt = (am.group(1) if am.group(1) is not None
                   else am.group(2)).strip()
            src = (sm.group(1) if sm.group(1) is not None else sm.group(2))
            if 'logo' in src.lower():
                continue
            if '${' in alt or '+(' in alt:
                continue
            alts_in_file.setdefault(alt.lower(), []).append((alt, src))
        dups = {k: v for k, v in alts_in_file.items() if len(v) > 1}
        if dups:
            dup_per_file.append((str(p), dups))

print(f'Files with duplicate alts (same alt used twice+): {len(dup_per_file)}')
for f, d in dup_per_file[:25]:
    print(f'  {f}')
    for k, v in d.items():
        print(f'    x{len(v)}  alt={v[0][0]!r}')
        for vv in v:
            print(f'        src={vv[1][:90]}')
