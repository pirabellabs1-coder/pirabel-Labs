#!/usr/bin/env python3
"""Wrap le contenu principal de chaque page dans <main> (entre </nav> + <footer>)
pour l'accessibilite (lecteurs d'ecran + Lighthouse landmark check).

Idempotent.
Aussi: nettoie les liens '#' cassés du footer (social) en les neutralisant
avec aria-label + rel.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

# Insert <main> right after the mobile-nav div closes, just before the first <header> or <section>
# Detect <footer> opening and insert </main> just before
def add_main(text: str) -> tuple[str, bool]:
    if '<main' in text or '</main>' in text:
        return text, False
    # Find first <header class="section"> OR <section ...> after the nav block
    # Anchor: closing tag of mobile-nav div (which always comes after <nav>)
    # Use first <header class="section" ...> as the start of main
    open_match = re.search(r'(<header\s+class="section)', text)
    if not open_match:
        # Fallback: first <section class= after </nav>
        open_match = re.search(r'(</nav>\s*(?:<div[^>]*mobile-nav[^>]*>.*?</div>\s*)?)(<section)', text, re.DOTALL)
        if not open_match:
            return text, False
        idx = open_match.end(1)
    else:
        idx = open_match.start()

    # End anchor: <footer class="footer"> or <!-- NEWSLETTER --> or <div class="newsletter">
    close_match = re.search(r'(<footer\s+class="footer")', text)
    if not close_match:
        close_match = re.search(r'(<!-- NEWSLETTER -->|<div class="newsletter">)', text)
        if not close_match:
            return text, False

    close_idx = close_match.start()
    if close_idx <= idx:
        return text, False

    new_text = text[:idx] + '<main>\n' + text[idx:close_idx] + '</main>\n' + text[close_idx:]
    return new_text, True

# Fix dead '#' links in footer (Instagram, LinkedIn, Twitter placeholders)
# Replace with proper rel="noopener" + aria-label + remove href to avoid broken link
def fix_dead_social_links(text: str) -> tuple[str, bool]:
    pattern = re.compile(
        r'<a href="#" class="link-underline" style="color:rgba\(255,255,255,0\.4\);font-size:0\.875rem;">(Instagram|LinkedIn|Twitter|Facebook)</a>',
        re.IGNORECASE,
    )
    if not pattern.search(text):
        return text, False
    new_text = pattern.sub(
        lambda m: f'<span class="link-underline" style="color:rgba(255,255,255,0.4);font-size:0.875rem;" aria-label="{m.group(1)} (coming soon)">{m.group(1)}</span>',
        text,
    )
    return new_text, (new_text != text)

def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

count_main = 0
count_social = 0
for path in iter_html():
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    new, m_changed = add_main(text)
    new, s_changed = fix_dead_social_links(new)
    if new != text:
        path.write_text(new, encoding='utf-8')
        if m_changed: count_main += 1
        if s_changed: count_social += 1

print(f"Pages avec <main> ajoute: {count_main}")
print(f"Pages avec liens social # neutralises: {count_social}")
