"""Scan FR pages (root + non-/en/) for English residues (anglicism leak)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKIP_DIRS = ("node_modules", ".git", ".vercel", "scratch", "en",
             "admin_x9k2m7v4p8w1n_secure_access_2026", "client_portal_v4p8w1n7x9k2m_access_secure",
             "espace-client-4p8w1n", "pirabel-admin-7x9k2m", "app", "api")

# English-only words / phrases that almost-always indicate residue in FR pages.
# Avoid anything that doubles as a French word (e.g. "actions", "client").
EN_PATTERNS = re.compile(
    r"\b(?:we|our|your|with|without|for|the|and|but|because|free|click|here|"
    r"download|read more|learn more|get started|sign up|book now|try|today|"
    r"website|business|customers|company|team|services|results|features|"
    r"strategy|marketing|advertising|search|engine|ranking|content|"
    r"however|therefore|nevertheless|moreover|whereas|whilst|achieve|"
    r"increase|improve|optimize|optimise|generate|leverage|deliver|"
    r"enable|empower|drive|boost|grow|scale|measurable|guaranteed|"
    r"premium|tailored|custom|bespoke|insights|analytics|conversion|"
    r"campaign|funnel|landing page|call to action|testimonials|reviews|"
    r"case study|case studies|pricing|plans|trial|demo|signup)\b",
    re.IGNORECASE,
)
SCRIPT = re.compile(r"<script\b[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL)
STYLE = re.compile(r"<style\b[^>]*>.*?</style>", re.IGNORECASE | re.DOTALL)
TAG = re.compile(r"<[^>]+>")


def should_skip(p: Path) -> bool:
    parts = set(p.relative_to(ROOT).parts)
    return any(d in parts for d in SKIP_DIRS)


hits = {}
file_hits = {}
for f in ROOT.rglob("*.html"):
    if should_skip(f):
        continue
    try:
        content = f.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    content = SCRIPT.sub(" ", content)
    content = STYLE.sub(" ", content)
    text = TAG.sub(" ", content)
    found_words = set()
    for m in EN_PATTERNS.finditer(text):
        word = m.group(0).lower()
        hits.setdefault(word, 0)
        hits[word] += 1
        found_words.add(word)
    if found_words:
        rel = str(f.relative_to(ROOT)).replace("\\", "/")
        file_hits[rel] = found_words

print(f"FR files scanned with EN residues: {len(file_hits)}")
print(f"Total EN word instances: {sum(hits.values())}")
print()
print("TOP 30 EN words leaking in FR pages:")
for word, cnt in sorted(hits.items(), key=lambda x: -x[1])[:30]:
    print(f"  {cnt:>5}  {word!r}")
print()
print("TOP 20 FR files with most EN residues:")
top_files = sorted(file_hits.items(), key=lambda x: -len(x[1]))[:20]
for path, words in top_files:
    print(f"  {len(words):>3}  {path}")
