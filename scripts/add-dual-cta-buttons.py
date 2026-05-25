#!/usr/bin/env python3
"""Transforme tous les CTA single-button (/contact uniquement) en dual-button
(/rendez-vous primaire + /contact secondaire) dans les sections .section--cta.

Pattern detecte:
  <a href="/contact" class="btn btn--white rv">...</a>
ou
  <a href="/contact" class="btn btn--white">...</a>
a l'interieur d'une <section ... section--cta ...>

Devient:
  <div class="cta-buttons rv">
    <a href="/rendez-vous" class="btn btn--white">Prendre rendez-vous <icon/></a>
    <a href="/contact" class="btn btn--ghost-white">Nous contacter <icon/></a>
  </div>

Idempotent: skip si .cta-buttons deja present dans la section.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

# Pattern : section--cta block
CTA_SECTION = re.compile(
    r'(<section[^>]*section--cta[^>]*>.*?</section>)',
    re.DOTALL,
)

# Pattern : single anchor to /contact in CTA section (variants)
# Catches multiple text variations: "Demander mon audit", "Demander mon devis", etc.
SINGLE_CTA = re.compile(
    r'<a\s+href="/contact"[^>]*class="btn[^"]*btn--white[^"]*"[^>]*>'
    r'([^<]*?)'
    r'(?:<span class="material-symbols-outlined">[^<]+</span>)?'
    r'</a>',
    re.IGNORECASE,
)

# EN equivalent
SINGLE_CTA_EN = re.compile(
    r'<a\s+href="/en/contact"[^>]*class="btn[^"]*btn--white[^"]*"[^>]*>'
    r'([^<]*?)'
    r'(?:<span class="material-symbols-outlined">[^<]+</span>)?'
    r'</a>',
    re.IGNORECASE,
)

def build_dual_fr():
    return (
        '<div class="cta-buttons rv">'
        '<a href="/rendez-vous" class="btn btn--white">Prendre rendez-vous '
        '<span class="material-symbols-outlined">calendar_today</span></a>'
        '<a href="/contact" class="btn btn--ghost-white">Nous contacter '
        '<span class="material-symbols-outlined">arrow_forward</span></a>'
        '</div>'
    )

def build_dual_en():
    return (
        '<div class="cta-buttons rv">'
        '<a href="/en/rendez-vous" class="btn btn--white">Book a meeting '
        '<span class="material-symbols-outlined">calendar_today</span></a>'
        '<a href="/en/contact" class="btn btn--ghost-white">Contact us '
        '<span class="material-symbols-outlined">arrow_forward</span></a>'
        '</div>'
    )

def is_english(path: Path) -> bool:
    return any(part == 'en' for part in path.parts)

def transform_section(section_html: str, is_en: bool) -> str:
    if 'cta-buttons' in section_html:
        return section_html  # already done
    pattern = SINGLE_CTA_EN if is_en else SINGLE_CTA
    dual = build_dual_en() if is_en else build_dual_fr()
    return pattern.sub(dual, section_html, count=1)

def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

count = 0
for path in iter_html():
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if 'section--cta' not in text:
        continue
    new = CTA_SECTION.sub(
        lambda m: transform_section(m.group(1), is_english(path)),
        text,
    )
    if new != text:
        path.write_text(new, encoding='utf-8')
        count += 1

print(f"Pages avec CTA dual-button installe: {count}")
