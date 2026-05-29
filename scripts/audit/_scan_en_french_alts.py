"""Find <img alt="..."> in /en/* pages where alt is in French."""
import os, re, json
from pathlib import Path

ROOT = Path('C:/Pirabel Labs/temp_repo')
EN_ROOT = ROOT / 'en'

IMG_RE = re.compile(r'<img\b[^>]*>', re.IGNORECASE | re.DOTALL)
ALT_RE = re.compile(r"""\salt\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)
SRC_RE = re.compile(r"""\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)')""", re.IGNORECASE)
NOINDEX_RE = re.compile(
    r"""<meta\s+name\s*=\s*["']robots["']\s+content\s*=\s*["'][^"']*noindex""",
    re.IGNORECASE,
)

# French-specific tokens that should NOT appear in EN alts
FR_TOKENS = re.compile(
    r"\b("
    r"identit[eé]|strat[eé]gie|cr[eé]ation|"
    r"r[eé]f[eé]rencement|naturel|r[eé]daction|"
    r"vid[eé]o|recrut(ement|er)|optimisation|"
    r"d[eé]marrage|gestion|d[eé]veloppement|"
    r"intelligence artificielle|automation marketing|"
    r"and tendances|tendances|"
    r"contenu marketing|"
    r"clients?|m[eé]morable|"
    r"d[eé]couvrez|"
    r"\bd['e]\b|\bdu\b|\ble\b|\bla\b|\bles\b|\bune\b|\bun\b|"
    r"avec|pour|chez|sans|notre|votre"
    r")\b",
    re.IGNORECASE,
)

# tokens that are obvious EN to keep "fr looking" false positives down
EN_OK_TOKENS = re.compile(
    r"\b(marketing|automation|design|business|video|guide|"
    r"strategy|content|service|client|customer|tools|platform|"
    r"web|website|seo|ai|crm|ux|cro|api|ads?|email|"
    r"and|the|of|for|with|how|why|what)\b",
    re.IGNORECASE,
)

findings = []
for dirpath, dirnames, filenames in os.walk(EN_ROOT):
    rel = Path(dirpath).relative_to(EN_ROOT)
    if any(p in {'formations'} for p in rel.parts):
        dirnames[:] = []
        continue
    dirnames[:] = [d for d in dirnames if d != 'formations']
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
            if 'logo' in src.lower() or not src:
                continue
            if alt.strip().lower() == 'pirabel labs':
                continue
            if FR_TOKENS.search(alt):
                findings.append({
                    "file": str(p),
                    "alt": alt,
                    "src": src,
                })

print(f"EN pages with French alt: {len(findings)}")
seen_alts = {}
for f in findings:
    seen_alts[f['alt']] = seen_alts.get(f['alt'], 0) + 1
print("Distinct alts:")
for a, c in sorted(seen_alts.items(), key=lambda x: -x[1]):
    print(f"  x{c}  {a!r}")
print("Sample files:")
for f in findings[:15]:
    print(f"  {f['file']}")
    print(f"      alt={f['alt']!r}")
