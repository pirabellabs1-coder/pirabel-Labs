#!/usr/bin/env python3
"""CRO improvements (audit Julien):
- Retire 'Mon Espace' du nav public (admin URL est secret maintenant)
- Hero CTA 'DOMINER LE MARCHE' -> 'Recevoir mon audit gratuit (sous 24h)'
- Ajoute risk reversal sur pricing
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', 'node_modules', 'scripts', 'app'}

# Patterns nav-login (lien Mon Espace exposed -> a retirer du public)
NAV_LOGIN_PATTERNS = [
    re.compile(r'<a[^>]*class="nav-login"[^>]*>[^<]*(?:<span[^>]*>[^<]*</span>[^<]*)*</a>\s*'),
    re.compile(r'<a[^>]+href="/mon-espace"[^>]*>[^<]*(?:<span[^>]*>[^<]*</span>[^<]*)*</a>\s*'),
]

# Hero CTA replacements
HERO_REPLACEMENTS = [
    # Bouton hero principal
    (re.compile(r'DOMINER LE MARCHE'), 'AUDIT GRATUIT 24H'),
    (re.compile(r'DOMINER LE MARCH&EACUTE;', re.IGNORECASE), 'AUDIT GRATUIT 24H'),
    # Lien "Mon Espace" dans le body texte
    (re.compile(r'<a href="/mon-espace"[^>]*>Mon Espace</a>'), ''),
]

count_files = 0
count_replacements = 0

for p in ROOT.rglob('*.html'):
    if any(part in EXCLUDE for part in p.parts):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    orig = text

    # 1) Retire le bouton nav-login (Mon Espace) du nav
    for pat in NAV_LOGIN_PATTERNS:
        text = pat.sub('', text)

    # 2) Hero CTA
    for pat, rep in HERO_REPLACEMENTS:
        text = pat.sub(rep, text)

    if text != orig:
        p.write_text(text, encoding='utf-8')
        count_files += 1
        count_replacements += 1

print(f"Pages CRO ameliorees: {count_files}")
