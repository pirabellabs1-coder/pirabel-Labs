#!/usr/bin/env python3
"""Fix CRITICAL : 259 icones Material Symbols utilisees mais subset URL n'en
inclut que 84 -> icones affichees comme texte literal (CODE, SMART_TOY, etc.).

Solution : passer en font COMPLETE sur toutes les pages publiques. Le subset
ne peut plus suivre vu le nombre d'icones (URL > 4000 chars).

Impact : font file ~580KB cached 1 fois, display:swap conserve = pas de FOIT.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'node_modules', '.git', 'app', 'scripts', 'projet claude B', 'Projet A', 'scratch'}

# Pattern : URL Material Symbols avec icon_names=
# Replace : meme URL SANS icon_names
SUBSET_PATTERN = re.compile(
    r'(https://fonts\.googleapis\.com/css2\?family=Material\+Symbols\+Outlined[^"\'\s]*?)&icon_names=[^&"\'\s]+([^"\'\s]*)'
)


def fix_url(match):
    """Retire le parametre icon_names pour utiliser la font complete."""
    return match.group(1) + match.group(2)


count = 0
for p in ROOT.rglob('*.html'):
    if any(part in p.parts for part in EXCLUDE):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if 'icon_names=' not in text:
        continue
    new_text = SUBSET_PATTERN.sub(fix_url, text)
    if new_text != text:
        p.write_text(new_text, encoding='utf-8')
        count += 1

print(f'Fichiers passes en font complete : {count}')
