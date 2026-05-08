"""Quick scan for residual French verb forms in /en/ pages."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EN_DIR = ROOT / "en"

FR_VERBS = re.compile(
    r"\b(?:utilisez|profitez|recevez|trouvez|d[ée]couvrez|cliquez|envoyez|partagez|"
    r"t[ée]l[ée]chargez|installez|configurez|sauvegardez|publiez|[ée]crivez|notez|"
    r"laissez|donnez|essayez|achetez|vendez|payez|investissez|gardez|prenez|venez|"
    r"allez|soyez|commencez|terminez|continuez|arr[êe]tez|[ée]vitez|comparez|"
    r"analysez|[ée]tudiez|apprenez|enseignez|montrez|cachez|r[ée]v[ée]lez|expliquez|"
    r"r[ée]sumez|d[ée]taillez|pr[ée]cisez|imaginez|esp[ée]rez|attendez|patientez|"
    r"h[ée]sitez|d[ée]cidez|s[ée]lectionnez|adoptez|abandonnez|quittez|restez)\b",
    re.IGNORECASE,
)
SCRIPT = re.compile(r"<script\b[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL)
STYLE = re.compile(r"<style\b[^>]*>.*?</style>", re.IGNORECASE | re.DOTALL)
TAG = re.compile(r"<[^>]+>")

hits = {}
for f in EN_DIR.rglob("*.html"):
    try:
        content = f.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    content = SCRIPT.sub(" ", content)
    content = STYLE.sub(" ", content)
    text = TAG.sub(" ", content)
    for m in FR_VERBS.finditer(text):
        hits.setdefault(m.group(0).lower(), []).append(
            str(f.relative_to(ROOT)).replace("\\", "/")
        )

for word, files in sorted(hits.items(), key=lambda x: -len(x[1])):
    print(f"  {len(files):>4}  {word!r}  (e.g. {files[0]})")
print(f"Total distinct FR verbs: {len(hits)}")
print(f"Total instances: {sum(len(v) for v in hits.values())}")
