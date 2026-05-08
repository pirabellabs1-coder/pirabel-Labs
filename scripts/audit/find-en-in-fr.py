"""Find pure English connector words leaking in FR pages."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SKIP = ("en", "node_modules", ".git", ".vercel", "scratch",
        "admin_x9k2m7v4p8w1n_secure_access_2026",
        "client_portal_v4p8w1n7x9k2m_access_secure",
        "espace-client-4p8w1n", "pirabel-admin-7x9k2m", "app", "api")

# Words almost-never used in French marketing copy
EN_ONLY = ["the", "and", "but", "with", "without", "because", "however",
           "we", "our", "your", "free", "click", "here", "today",
           "ranking", "engine", "case studies", "case study",
           "trial", "team", "reviews", "advertising", "strategy"]

SCRIPT = re.compile(r"<script\b[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL)
STYLE = re.compile(r"<style\b[^>]*>.*?</style>", re.IGNORECASE | re.DOTALL)
TAG = re.compile(r"<[^>]+>")

results = {}
for f in ROOT.rglob("*.html"):
    parts = set(f.relative_to(ROOT).parts)
    if any(s in parts for s in SKIP):
        continue
    try:
        content = f.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    content = SCRIPT.sub(" ", content)
    content = STYLE.sub(" ", content)
    text = TAG.sub(" ", content)
    for w in EN_ONLY:
        pat = re.compile(rf"\b{w}\b", re.IGNORECASE)
        for m in pat.finditer(text):
            ctx = " ".join(text[max(0, m.start() - 50): m.end() + 60].split())
            results.setdefault(w, []).append(
                (str(f.relative_to(ROOT)).replace("\\", "/"), ctx)
            )

for w in EN_ONLY:
    if w in results:
        print(f"=== {w!r}: {len(results[w])} occurrences ===")
        for path, ctx in results[w][:3]:
            print(f"  {path}: ...{ctx}...")
