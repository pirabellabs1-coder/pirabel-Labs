#!/usr/bin/env python3
"""Remplace 'technicals' -> 'techniques' (mot invente, devrait etre 'techniques')."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', 'node_modules', 'scripts'}

# Match 'technicals' as standalone word (not part of bigger word)
PATTERN = re.compile(r'\btechnicals\b')

count_files = 0
count_replacements = 0

for p in ROOT.rglob('*.html'):
    if any(part in EXCLUDE for part in p.parts):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if 'technicals' not in text:
        continue
    new_text, n = PATTERN.subn('techniques', text)
    if n > 0:
        p.write_text(new_text, encoding='utf-8')
        count_files += 1
        count_replacements += n

print(f"Total: {count_files} fichiers, {count_replacements} replacements")
