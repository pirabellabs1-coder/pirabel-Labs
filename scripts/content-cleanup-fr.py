#!/usr/bin/env python3
"""Cleanup FR : franglais residuel + Google Optimize obsolete + dates 2024.

Findings audit Emilie (Content):
- 8 articles blog FR avec 'strategies' / 'automatisation marketing' au lieu de FR pur
- 3 articles avec 'Google Optimize' (deprecated sept 2023)
- 4 articles avec dates 2024/2023 dans contenu evergreen -> 2026
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', 'node_modules', 'scripts', 'app', 'en'}

# Replacements case-sensitive (FR uniquement)
REPLACEMENTS = [
    # Franglais
    (r'\bemail marketing strategies\b', 'strategies email marketing'),
    (r'\btiktok marketing strategies\b', 'strategies marketing TikTok'),
    (r'\bcontent marketing strategies\b', 'strategies de content marketing'),
    (r'\bdigital marketing strategies\b', 'strategies marketing digital'),
    (r'\bmarketing automation\b(?! \(ou)', "automatisation marketing"),
    # Google Optimize deprecated
    (r'\bGoogle Optimize\b', 'GA4 + VWO ou AB Tasty'),
    (r'\bgoogle\.com/optimize\b', 'analytics.google.com'),
    # Dates evergreen 2024/2023 -> 2026
    (r'(?<!\d)(?:en|depuis|de|pour|d[\'’])\s*2024\b', 'en 2026'),
    (r'(?<!\d)(?:tendances|guide|best practices)\s+2024\b', lambda m: m.group(0).replace('2024', '2026')),
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
    file_changes = 0
    for pat, rep in REPLACEMENTS:
        if isinstance(rep, str):
            new_text, n = re.subn(pat, rep, text, flags=re.IGNORECASE)
        else:
            new_text, n = re.subn(pat, rep, text, flags=re.IGNORECASE)
        if n > 0:
            text = new_text
            file_changes += n
    if text != orig:
        p.write_text(text, encoding='utf-8')
        count_files += 1
        count_replacements += file_changes

print(f"Fichiers FR nettoyes: {count_files}")
print(f"Replacements totaux : {count_replacements}")
