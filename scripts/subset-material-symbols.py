#!/usr/bin/env python3
"""Subset Material Symbols : collecte les icones utilisees + remplace l'URL par version subset.

Avant : charge tout Material Symbols (~150KB)
Apres : charge seulement les icones utilisees (~10-15KB)

Gain FCP : 300-500ms.
"""
import re
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', 'node_modules', 'scripts'}

# Pattern: <... material-symbols-outlined">icon_name<
ICON_PATTERN = re.compile(r'material-symbols-outlined">([a-z_0-9]+)<')

# 1. Collecter tous les icones utilises
counter = Counter()
for p in ROOT.rglob('*.html'):
    if any(part in EXCLUDE for part in p.parts):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    for match in ICON_PATTERN.findall(text):
        counter[match] += 1

icons = sorted(counter.keys())
print(f"Icones uniques: {len(icons)}")
print(f"Total occurrences: {sum(counter.values())}")
print()
print("Top 20:")
for icon, count in counter.most_common(20):
    print(f"  {icon}: {count}")

# 2. Construire l'URL Google Fonts subset
# Format: ?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=icon1,icon2,...
icon_names = ','.join(icons)
new_url = (
    f"https://fonts.googleapis.com/css2?"
    f"family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    f"&icon_names={icon_names}"
    f"&display=swap"
)

# 3. Remplacer dans les HTML
# Pattern de l'ancienne URL (variante avec preload + stylesheet)
OLD_URL_PATTERN = re.compile(
    r'https://fonts\.googleapis\.com/css2\?family=Material\+Symbols\+Outlined[^"\']*'
)

# Limite Google Fonts URL : ~2000 chars. Si trop d'icones, on garde l'URL complete.
print(f"\nNouvelle URL: {len(new_url)} chars")
if len(new_url) > 2000:
    print(f"!!! URL trop longue ({len(new_url)} > 2000). Fallback: pas de subset.")
    print(f"Solution: heberger Material Symbols en local (WOFF2) ou splitter icones.")
else:
    count = 0
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE for part in p.parts):
            continue
        try:
            text = p.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        if 'Material+Symbols+Outlined' not in text:
            continue
        new_text = OLD_URL_PATTERN.sub(new_url, text)
        if new_text != text:
            p.write_text(new_text, encoding='utf-8')
            count += 1

    print(f"\nPages mises a jour: {count}")
    # Sauvegarde la liste d'icones pour reference
    (ROOT / 'scripts' / 'material-icons-used.txt').write_text(
        '\n'.join(icons), encoding='utf-8'
    )
    print(f"Liste icones: scripts/material-icons-used.txt")
