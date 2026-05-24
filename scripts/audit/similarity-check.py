#!/usr/bin/env python3
"""Compare la similarite textuelle entre paires de pages (ex: cotonou.html vs
abomey-calavi.html du meme service) pour detecter le risque de duplicate
content / penalisation Google."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

TAG_RE = re.compile(r'<[^>]+>')
SCRIPT_RE = re.compile(r'<script\b[^>]*>.*?</script>', re.DOTALL | re.IGNORECASE)
STYLE_RE = re.compile(r'<style\b[^>]*>.*?</style>', re.DOTALL | re.IGNORECASE)
WS_RE = re.compile(r'\s+')

def extract_text(path: Path) -> str:
    text = path.read_text(encoding='utf-8', errors='ignore')
    text = SCRIPT_RE.sub(' ', text)
    text = STYLE_RE.sub(' ', text)
    text = TAG_RE.sub(' ', text)
    text = WS_RE.sub(' ', text).lower()
    return text.strip()

def tokens(text: str) -> set[str]:
    # Words 4+ chars only (skip stopwords noise)
    return {w for w in re.findall(r'[a-zàâäéèêëîïôöùûüç]{4,}', text)}

def jaccard(a: set, b: set) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)

# Compare each abomey-calavi.html vs its sibling cotonou.html (FR + EN)
CATEGORIES = [
    'agence-creation-sites-web',
    'agence-design-branding',
    'agence-email-marketing-crm',
    'agence-ia-automatisation',
    'agence-publicite-payante-sea-ads',
    'agence-redaction-content-marketing',
    'agence-sales-funnels-cro',
    'agence-seo-referencement-naturel',
    'agence-social-media',
    'agence-video-motion-design',
]

print(f"{'CATEGORIE':45} {'LANG':4} {'JACCARD':10}")
print("="*70)
high_risk = []
for cat in CATEGORIES:
    for lang_dir in ('', 'en/'):
        base = ROOT / (lang_dir + cat)
        cot = base / 'cotonou.html'
        ac = base / 'abomey-calavi.html'
        if not (cot.exists() and ac.exists()):
            continue
        sim = jaccard(tokens(extract_text(cot)), tokens(extract_text(ac)))
        status = ''
        if sim > 0.85:
            status = '  RISQUE DUPLICATE'
            high_risk.append((cat, lang_dir, sim))
        elif sim > 0.70:
            status = '  warn'
        print(f"{cat:45} {(lang_dir or 'fr'):4} {sim:.3f}     {status}")

print()
print(f"Pages a haut risque duplicate (>85% mots communs): {len(high_risk)}")
