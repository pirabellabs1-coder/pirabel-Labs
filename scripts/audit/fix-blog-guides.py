"""
fix-blog-guides.py
Bulk-fix common French word fragments leaking into English blog/guide articles.
Targets the body text only (between <h1>/<h2>/<h3>/<p>/<li>/<blockquote>) — does NOT touch nav, scripts, styles, schema, head metadata.

Word-level replacements applied with word boundaries.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EN = ROOT / "en"

# Conservative replacements: only FR words that don't exist in English.
# Avoids accent-less ambiguous words like "plus", "sur", "des" that could appear in URLs/code.
# Format: (fr_word_with_accents, en_replacement). Word boundary applied (\b...\b).
WORD_FIXES = [
    # Phrases first (longer matches)
    (r"\baujourd'hui\b", "today"),
    (r"\bn'ont\s+jamais\s+été\b", "have never been"),
    (r"\bn'ont\s+pas\s+été\b", "have not been"),
    (r"\bn'a\s+jamais\s+été\b", "has never been"),
    (r"\bn'est\s+pas\b", "is not"),
    (r"\bne sont pas\b", "are not"),
    (r"\bil y a\b", "there is"),
    (r"\bil faut\b", "you need"),
    (r"\bil est\b", "it is"),
    (r"\bc'est\b", "it is"),
    (r"\bce qui\b", "what"),
    (r"\bce que\b", "what"),
    (r"\bpar exemple\b", "for example"),
    (r"\bpar contre\b", "however"),
    (r"\ben effet\b", "indeed"),
    (r"\ben fait\b", "in fact"),
    (r"\ben pleine mutation\b", "in full transformation"),
    (r"\bplus de\b", "over"),
    (r"\bmoins de\b", "less than"),
    (r"\bjusqu'à\b", "until"),
    (r"\bafin de\b", "in order to"),
    (r"\bafin que\b", "so that"),
    (r"\bgrâce à\b", "thanks to"),
    (r"\bsoit\b", "or"),

    # Single FR words with accents (unambiguous - never English)
    (r"\bdéjà\b", "already"),
    (r"\bd[ée]sormais\b", "from now on"),
    (r"\bdès\b", "from"),
    (r"\bd[ée]but\b", "beginning"),
    (r"\btrès\b", "very"),
    (r"\bplutôt\b", "rather"),
    (r"\bpresque\b", "almost"),
    (r"\bvoici\b", "here are"),
    (r"\bvoilà\b", "here is"),
    (r"\boù\b", "where"),
    (r"\bcependant\b", "however"),
    (r"\btoutefois\b", "however"),
    (r"\bn[ée]anmoins\b", "nevertheless"),
    (r"\bensuite\b", "then"),
    (r"\baussi\b", "also"),
    (r"\bdéjà\b", "already"),
    (r"\bvraiment\b", "really"),

    # FR articles/possessives without accent — context-dependent, use carefully
    (r"\bnotre\b", "our"),
    (r"\bnos\b", "our"),
    (r"\bvotre\b", "your"),
    (r"\bvos\b", "your"),
    (r"\bcette\b", "this"),
    (r"\baucune?\b", "no"),

    # Common FR verbs (likely safe)
    (r"\bdoivent\b", "must"),
    (r"\bdoit\b", "must"),
    (r"\bpermettent\b", "allow"),
    (r"\bpermet\b", "allows"),
    (r"\boffrent\b", "offer"),
    (r"\bproduisent\b", "produce"),
    (r"\bcontiennent\b", "contain"),
    (r"\bsouhaitez\b", "wish"),
    (r"\bcherchent\b", "seek"),
    (r"\bsouhaitent\b", "want"),
    (r"\bs'adaptent\b", "adapt"),
    (r"\bs'inscrit\b", "fits"),
    (r"\bse trouve\b", "is located"),
    (r"\bse base\b", "is based"),
    (r"\bn'avez\b", "do not have"),
    (r"\bn'avons\b", "do not have"),

    # Words with accents only (replace with EN equivalents)
    (r"\bg[ée]n[ée]rent\b", "generate"),
    (r"\bg[ée]n[ée]r[ée]?s?\b", "generated"),
    (r"\b[ée]tablir\b", "establish"),
    (r"\bma[iî]trisons?\b", "master"),
    (r"\bma[iî]triser\b", "master"),
    (r"\bma[iî]tris[ée]\b", "mastered"),
    (r"\bcompl[ée]ment(aires?|er)\b", "complementary"),
    (r"\bcompl[ée]tement\b", "completely"),
    (r"\bcoh[ée]rente?s?\b", "coherent"),
    (r"\bcoh[ée]rence\b", "coherence"),
    (r"\bsp[ée]cifique[s]?\b", "specific"),
    (r"\bsp[ée]cificit[ée][s]?\b", "specifics"),
    (r"\bperformante?s?\b", "high-performing"),
    (r"\bstrat[ée]gie[s]?\b", "strategy"),
    (r"\bstrat[ée]giques?\b", "strategic"),
    (r"\bd[ée]ploiement[s]?\b", "deployment"),
    (r"\bd[ée]ploy[ée]?s?\b", "deployed"),
    (r"\boptimis[ée]?s?\b", "optimized"),
    (r"\boptimiser\b", "optimize"),
    (r"\boptimisation[s]?\b", "optimization"),
    (r"\bautomatis[ée]?s?\b", "automated"),
    (r"\bautomatiser\b", "automate"),
    (r"\bautomatisation[s]?\b", "automation"),
    (r"\b[ée]ditorial[ee]s?\b", "editorial"),
    (r"\br[ée]seaux\b", "networks"),
    (r"\b[ée]cosyst[èe]mes?\b", "ecosystem"),
    (r"\b[ée]quipes?\b", "team"),
    (r"\b[ée]tat\b", "state"),
    (r"\b[ée]tudes?\b", "study"),
    (r"\b[ée]volutions?\b", "evolution"),
    (r"\bcr[ée]er\b", "create"),
    (r"\bcr[ée][ée]s?\b", "created"),
    (r"\bd[ée]velopp[ée]?s?\b", "developed"),
    (r"\bd[ée]veloppement\b", "development"),
    (r"\butilis[ée]es?\b", "used"),
    (r"\butilis[ée]s?\b", "used"),
    (r"\butilisateurs?\b", "users"),
    (r"\bentreprises?\b", "businesses"),
    (r"\brecherchent\b", "search for"),
    (r"\bint[ée]gr[ée]s?\b", "integrated"),
    (r"\bint[ée]gration\b", "integration"),
    (r"\bd[ée]coul[ée]\b", "result"),
    (r"\bcontenu[s]?\b", "content"),
    (r"\b[ée]l[ée]ment[s]?\b", "element"),
    (r"\bplate?[- ]?formes?\b", "platforms"),

    # Phrases additionnelles
    (r"\bétaient\b", "were"),
    (r"\béTtaient\b", "were"),
    (r"\bavaient\b", "had"),
    (r"\bavait\b", "had"),
    (r"\bavoir\b", "have"),
    (r"\bétait\b", "was"),
    (r"\bêtre\b", "be"),
    (r"\bêtes\b", "are"),
    (r"\bsommes\b", "are"),
    (r"\bsoyez\b", "be"),
    (r"\bsoient\b", "are"),
    (r"\bsuis\b", "am"),

    # FR conjugaisons courantes
    (r"\bn'ont\b", "do not have"),
    (r"\bn'a\b", "does not have"),
    (r"\bn'est\b", "is not"),
    (r"\bn'était\b", "was not"),
    (r"\bne sont\b", "are not"),

    # Mots avec accents fréquents
    (r"\bd[ée]finition\b", "definition"),
    (r"\bd[ée]finir\b", "define"),
    (r"\bd[ée]finit\b", "defines"),
    (r"\bd[ée]fini[ee]?s?\b", "defined"),
    (r"\br[ée]flex(ion|ions)\b", "thinking"),
    (r"\br[ée]flexion\b", "thinking"),
    (r"\br[ée]ussir\b", "succeed"),
    (r"\br[ée]ussite\b", "success"),
    (r"\br[ée]sultats?\b", "results"),
    (r"\bm[ée]thode[s]?\b", "method"),
    (r"\bm[ée]thodologie\b", "methodology"),
    (r"\bid[ée]al(e|es|aux)?\b", "ideal"),
    (r"\bid[ée]es?\b", "ideas"),
    (r"\bobjectifs?\b", "objectives"),
    (r"\bm[ée]trique[s]?\b", "metrics"),
    (r"\bex[ée]cut(er|ion)\b", "execution"),
    (r"\bex[ée]cut[ée]\b", "executed"),
    (r"\b[ée]volu(er|tion)\b", "evolve"),
    (r"\b[ée]l[ée]vation\b", "elevation"),
    (r"\bact[ie]vit[ée]s?\b", "activities"),
    (r"\bappliqu[ée]e?s?\b", "applied"),
    (r"\bappliquer\b", "apply"),
    (r"\bappliquent\b", "apply"),
    (r"\bappliqu[ée]\b", "applied"),
    (r"\bcaract[èe]ristique[s]?\b", "characteristics"),
    (r"\bcat[ée]gorie[s]?\b", "category"),
    (r"\bm[ée]canisme[s]?\b", "mechanism"),
    (r"\bautomatique[s]?\b", "automatic"),
    (r"\bautomatiquement\b", "automatically"),
    (r"\bvisibilit[ée]\b", "visibility"),
    (r"\bsensibili(t[ée]|s[ée])\b", "awareness"),
    (r"\bnotori[ée]t[ée]\b", "awareness"),
    (r"\bdiffusion\b", "distribution"),
    (r"\bproc[ée]dure[s]?\b", "procedure"),
    (r"\boutil[s]?\b", "tool"),
    (r"\bappel\b", "call"),
    (r"\bappelle?n?t?\b", "call"),
    (r"\bappel[ée]?e?s?\b", "called"),
    (r"\bd[ée]cisions?\b", "decision"),
    (r"\bd[ée]cisif[s]?\b", "decisive"),
    (r"\bma[iî]trise\b", "mastery"),
    (r"\bcontre\b", "against"),
    (r"\bcommencer\b", "start"),
    (r"\bcommenc[ée]?\b", "started"),
    (r"\bcommencent\b", "start"),
    (r"\btravailler\b", "work"),
    (r"\btravaillent\b", "work"),
    (r"\btravail\b", "work"),
    (r"\btravaill[ée]?\b", "worked"),
]

# Deduplicate (rare duplicates above)
_seen = set()
_unique = []
for pat, repl in WORD_FIXES:
    if pat not in _seen:
        _seen.add(pat)
        _unique.append((pat, repl))
WORD_FIXES = _unique

# Pre-compile patterns for performance
COMPILED = [(re.compile(p, re.IGNORECASE | re.UNICODE), r) for p, r in WORD_FIXES]

# Skip these regions: <head>, <script>, <style>, <nav>, <footer>, navigation comments
SKIP_REGIONS = re.compile(
    r"<head\b.*?</head>|<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>"
    r"|<nav\b[^>]*>.*?</nav>|<footer\b[^>]*>.*?</footer>|<!--.*?-->",
    re.IGNORECASE | re.DOTALL
)


def fix_content(html: str) -> tuple:
    """Apply WORD_FIXES only to body text outside skip regions."""
    parts = []
    last = 0
    count = 0
    for m in SKIP_REGIONS.finditer(html):
        # Region before skip: process
        body_chunk = html[last:m.start()]
        new_chunk, n = _process_chunk(body_chunk)
        parts.append(new_chunk)
        count += n
        # Skip region: keep as-is
        parts.append(m.group(0))
        last = m.end()
    # Trailing text
    body_chunk = html[last:]
    new_chunk, n = _process_chunk(body_chunk)
    parts.append(new_chunk)
    count += n
    return ("".join(parts), count)


def _process_chunk(chunk: str) -> tuple:
    """Apply word fixes to one chunk."""
    count = 0
    for pat, repl in COMPILED:
        new_chunk, n = pat.subn(repl, chunk)
        if n:
            count += n
            chunk = new_chunk
    return (chunk, count)


def fix_file(path: Path) -> int:
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return 0
    new_content, count = fix_content(content)
    if new_content != content:
        path.write_text(new_content, encoding="utf-8")
    return count


def main():
    targets = [
        EN / "blog",
        EN / "guides",
    ]
    grand_total = 0
    for d in targets:
        if not d.is_dir():
            continue
        files = sorted(d.glob("*.html"))
        section_total = 0
        for f in files:
            n = fix_file(f)
            if n:
                print(f"  {d.name}/{f.name}: {n}")
                section_total += n
        print(f"=== {d.name}: {section_total} replacements")
        grand_total += section_total
    print(f"\nGrand total: {grand_total} replacements")


if __name__ == "__main__":
    main()
