#!/usr/bin/env python3
"""Injecte Schema FAQPage sur toutes les pages qui ont des <details class="faq-item">.
Boost massif pour les rich snippets Google."""
import re
import json
from pathlib import Path
import html as html_lib

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

# Pattern to find faq items - flexible, captures summary text and answer div content
FAQ_ITEM_RE = re.compile(
    r'<details[^>]*class="faq-item[^"]*"[^>]*>\s*'
    r'<summary[^>]*>(.*?)</summary>\s*'
    r'<div[^>]*class="faq-answer"[^>]*>(.*?)</div>\s*'
    r'</details>',
    re.DOTALL | re.IGNORECASE,
)

# Strip HTML tags from inner content
TAG_RE = re.compile(r'<[^>]+>')
WS_RE = re.compile(r'\s+')

ICON_WORDS = ('expand_more', 'expand_less', 'chevron_right', 'chevron_down',
              'arrow_forward', 'check', 'star', 'help', 'add', 'remove')

def clean(text: str) -> str:
    text = TAG_RE.sub(' ', text)
    text = html_lib.unescape(text)
    # Strip Material Symbol words used as icon names
    for w in ICON_WORDS:
        text = re.sub(r'\b' + w + r'\b', '', text)
    text = WS_RE.sub(' ', text)
    return text.strip()

def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

count_done = 0
count_skipped = 0

for path in iter_html():
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue

    # Already has FAQPage schema?
    if '"@type":"FAQPage"' in text or '"@type": "FAQPage"' in text:
        continue

    matches = FAQ_ITEM_RE.findall(text)
    if not matches:
        continue

    items = []
    for raw_q, raw_a in matches:
        q = clean(raw_q)
        a = clean(raw_a)
        if not q or not a:
            continue
        items.append({
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": a,
            },
        })

    if not items:
        count_skipped += 1
        continue

    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items,
    }
    schema_block = (
        '<script type="application/ld+json">'
        + json.dumps(schema, ensure_ascii=False, separators=(',', ':'))
        + '</script>'
    )

    # Insert just before </head>
    new_text = re.sub(
        r'(</head>)',
        schema_block + '\n\\1',
        text,
        count=1,
    )

    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        count_done += 1

print(f"Pages avec FAQPage Schema injecte: {count_done}")
print(f"Pages avec FAQ malformee (skip): {count_skipped}")
