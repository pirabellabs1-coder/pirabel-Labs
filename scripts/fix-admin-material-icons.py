#!/usr/bin/env python3
"""Restaure Material Symbols COMPLET sur les pages admin (app/views/).

Le subset etait casse car beaucoup d'icones admin (search, notifications, logout,
flag, etc) avaient ete oubliees a cause d'un regex defaillant. Solution: charger
le font complet sur l'admin (pas critique SEO) et garder le subset sur le public.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ADMIN_VIEWS = ROOT / 'app' / 'views'

# URL Material Symbols COMPLETE (toutes les icones)
FULL_URL = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"

# Pattern : matche TOUTE URL Material+Symbols+Outlined (subset ou full)
URL_PATTERN = re.compile(
    r'https://fonts\.googleapis\.com/css2\?family=Material\+Symbols\+Outlined[^"\']*'
)

count = 0
for p in ADMIN_VIEWS.glob('*.html'):
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if 'Material+Symbols+Outlined' not in text:
        continue
    new_text = URL_PATTERN.sub(FULL_URL, text)
    if new_text != text:
        p.write_text(new_text, encoding='utf-8')
        count += 1
        print(f"  {p.name}")

print(f"\nPages admin avec Material Symbols complet: {count}")
