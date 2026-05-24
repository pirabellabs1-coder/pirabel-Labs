#!/usr/bin/env python3
"""Fix 2 critical render-blocking issues:
1. <script src="/js/language-manager.js"> in head without defer -> add defer
2. <link rel="preload" as="style"> for Google Fonts without crossorigin -> add crossorigin

Both block FCP/LCP otherwise. Idempotent.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

LANGMGR_RE = re.compile(
    r'<script\s+src="/js/language-manager\.js"></script>',
    re.IGNORECASE,
)
LANGMGR_NEW = '<script src="/js/language-manager.js" defer></script>'

# Add crossorigin to preload as=style for fonts.gstatic.com (Google Fonts uses gstatic for actual font files)
# Specifically the preload of stylesheets needs crossorigin to match the actual stylesheet fetch
PRELOAD_FONT_RE = re.compile(
    r'<link rel="preload" as="style" href="(https://fonts\.googleapis\.com/[^"]+)">',
    re.IGNORECASE,
)

def fix(text: str) -> str:
    # 1. Defer language-manager
    text = LANGMGR_RE.sub(LANGMGR_NEW, text)
    # 2. Add crossorigin to font preloads
    text = PRELOAD_FONT_RE.sub(
        lambda m: f'<link rel="preload" as="style" crossorigin href="{m.group(1)}">',
        text,
    )
    return text

def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

count_lang = 0
count_preload = 0
for path in iter_html():
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    new = text
    before_lang = LANGMGR_RE.search(new)
    if before_lang:
        new = LANGMGR_RE.sub(LANGMGR_NEW, new)
        count_lang += 1
    before_preload_count = len(PRELOAD_FONT_RE.findall(new))
    if before_preload_count > 0:
        new = PRELOAD_FONT_RE.sub(
            lambda m: f'<link rel="preload" as="style" crossorigin href="{m.group(1)}">',
            new,
        )
        count_preload += 1
    if new != text:
        path.write_text(new, encoding='utf-8')

print(f"Pages language-manager.js -> defer: {count_lang}")
print(f"Pages preload font + crossorigin: {count_preload}")
