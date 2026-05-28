#!/usr/bin/env python3
"""Remplace Schema.org author Organization -> Person (Lissanon Gildas) sur blog FR + EN.

Critique E-E-A-T : Google priorise les articles avec un auteur identifiable.
Distribue 50/50 Lissanon Gildas (CEO) et Fidah Imorou (CTO).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'.git', 'node_modules', 'scripts', 'app'}

AUTHORS = [
    {
        '@type': 'Person',
        'name': 'Lissanon Gildas',
        'jobTitle': 'Fondateur & CEO',
        'url': 'https://www.pirabellabs.com/a-propos',
        'worksFor': {'@type': 'Organization', 'name': 'Pirabel Labs'},
    },
    {
        '@type': 'Person',
        'name': 'Fidah Imorou',
        'jobTitle': 'Co-fondateur & CTO',
        'url': 'https://www.pirabellabs.com/a-propos',
        'worksFor': {'@type': 'Organization', 'name': 'Pirabel Labs'},
    },
]

# Pattern de l'auteur Organization actuel (avec indentation 2 espaces)
# "author": {
#   "@type": "Organization",
#   "name": "Pirabel Labs",
#   "url": "https://www.pirabellabs.com"
# }
AUTHOR_ORG_PATTERN = re.compile(
    r'"author"\s*:\s*\{\s*"@type"\s*:\s*"Organization"\s*,\s*'
    r'"name"\s*:\s*"Pirabel Labs"\s*,\s*'
    r'"url"\s*:\s*"https://www\.pirabellabs\.com"\s*\}',
    re.DOTALL,
)

import json

def build_author_json(idx, indent=2):
    author = AUTHORS[idx % 2]
    # Produit un JSON inline propre
    out = json.dumps(author, indent=indent, ensure_ascii=False)
    # Re-indenter pour aligner avec le contexte (offset +4 chars pour s'aligner dans le ld+json bloc)
    lines = out.split('\n')
    # On veut: "author": {<json>}
    return out

count = 0
idx = 0
for p in (list(ROOT.rglob('blog/*.html')) + list(ROOT.rglob('en/blog/*.html'))):
    if any(part in EXCLUDE for part in p.parts):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if 'BlogPosting' not in text:
        continue
    if '"@type": "Person"' in text and 'Lissanon' in text:
        continue  # deja fait
    # On utilise idx pour alterner les auteurs (Lissanon/Fidah)
    author_json = '"author": ' + build_author_json(idx)
    new_text, n = AUTHOR_ORG_PATTERN.subn(author_json, text, count=1)
    if n > 0:
        p.write_text(new_text, encoding='utf-8')
        count += 1
        idx += 1

print(f"Articles avec Schema.org Person auteur ajoute: {count}")
