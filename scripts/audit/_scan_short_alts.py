"""Scan for short, generic or low-quality alts (excluding logos)."""
import os, re, json
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

GENERIC_ALTS = {
    "image", "img", "photo", "picture", "icon", "icone",
    "illustration", "banner", "thumbnail", "placeholder",
    "default", "untitled", "unknown", "screenshot", "graphic",
    "visuel", "visual", "alt", "pic", "logo",
}

# Words considered "low SEO value" when they are the ENTIRE alt
LOW_VALUE_WORDS = {
    "pirabel labs", "pirabellabs", "logo pirabel", "agence",
    "marketing", "digital", "seo", "web",
}

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
            sm = SRC_RE.search(tag)
            if not am or not sm:
                continue
            alt = (am.group(1) if am.group(1) is not None
                   else am.group(2))
            src = (sm.group(1) if sm.group(1) is not None
                   else sm.group(2)) or ""
            if "${" in tag or "+(" in tag:
                continue
            if not src or src.startswith("data:"):
                continue
            # skip logo of agency (acceptable as alt="Pirabel Labs")
            if 'logo' in src.lower():
                continue
            al = alt.strip().lower()
            if al in GENERIC_ALTS or len(alt.strip()) < 4:
                findings.append({
                    "file": str(p),
                    "alt": alt,
                    "src": src,
                    "tag": tag[:200],
                })
print(f"Findings (non-logo low-quality): {len(findings)}")
for f in findings[:20]:
    print(f"  {f['file']}")
    print(f"      alt={f['alt']!r}  src={f['src'][:80]}")
