#!/usr/bin/env python3
"""Remplace toutes les occurrences de 'completeeee' (4+ e) -> 'complete'.

Cible: 24 guides EN + vercel.json (canonicals casses).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', 'node_modules', 'scripts'}

# Regex: complete + 2 ou plus 'e' supplementaires (donc completeee, completeeee, ...)
PATTERN = re.compile(r'complete(ee+)')

count_files = 0
count_replacements = 0

for p in list(ROOT.rglob('*.html')) + [ROOT / 'vercel.json']:
    if not p.exists() or any(part in EXCLUDE for part in p.parts):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if 'complete' not in text:
        continue
    new_text, n = PATTERN.subn('complete', text)
    if n > 0:
        p.write_text(new_text, encoding='utf-8')
        count_files += 1
        count_replacements += n
        print(f"  {p.relative_to(ROOT)}: {n} fix")

print(f"\nTotal: {count_files} fichiers, {count_replacements} replacements")
