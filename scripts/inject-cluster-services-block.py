#!/usr/bin/env python3
"""Injecte sur chaque page abomey-calavi.html un bloc 'Tous nos services a
Abomey-Calavi' qui linke vers les 9 autres pages services AC = silo SEO cluster."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SERVICES = [
    ('agence-seo-referencement-naturel',  'SEO & Référencement naturel',      'SEO & Organic Search'),
    ('agence-creation-sites-web',         'Création de sites web',             'Website Creation'),
    ('agence-ia-automatisation',          'IA & Automatisation',               'AI & Automation'),
    ('agence-design-branding',            'Design & Branding',                 'Design & Branding'),
    ('agence-publicite-payante-sea-ads',  'Publicité payante (SEA)',          'Paid Advertising'),
    ('agence-social-media',               'Social Media',                       'Social Media'),
    ('agence-redaction-content-marketing','Rédaction & Content Marketing',     'Content Marketing'),
    ('agence-email-marketing-crm',        'Email Marketing & CRM',              'Email Marketing & CRM'),
    ('agence-sales-funnels-cro',          'Sales Funnels & CRO',                'Sales Funnels & CRO'),
    ('agence-video-motion-design',        'Vidéo & Motion Design',             'Video & Motion Design'),
]

SENTINEL = '<!-- cluster-services-ac -->'

def build_block(current_cat: str, is_en: bool) -> str:
    prefix = '/en/' if is_en else '/'
    title_fr = "Tous nos services à Abomey-Calavi"
    title_en = "All our services in Abomey-Calavi"
    intro_fr = "Notre siège à Abomey-Calavi couvre l'intégralité de la chaîne de valeur digitale. Explorez les autres services disponibles localement."
    intro_en = "Our Abomey-Calavi headquarters covers the entire digital value chain. Explore the other services available locally."
    label = "Pôles d'expertise"
    if is_en:
        label = "Expertise teams"

    cards = []
    for cat, name_fr, name_en in SERVICES:
        if cat == current_cat:
            continue
        name = name_en if is_en else name_fr
        href = f'{prefix}{cat}/abomey-calavi'
        cards.append(
            f'<a href="{href}" class="card card-hover-glow rv" style="padding:1.5rem;text-decoration:none;">'
            f'<h3 class="text-h4" style="margin-bottom:0.5rem;color:var(--primary-container);">{name}</h3>'
            f'<p class="text-body text-small">À Abomey-Calavi & au Bénin</p>'
            f'</a>' if not is_en else
            f'<a href="{href}" class="card card-hover-glow rv" style="padding:1.5rem;text-decoration:none;">'
            f'<h3 class="text-h4" style="margin-bottom:0.5rem;color:var(--primary-container);">{name}</h3>'
            f'<p class="text-body text-small">In Abomey-Calavi & Benin</p>'
            f'</a>'
        )

    title = title_en if is_en else title_fr
    intro = intro_en if is_en else intro_fr

    return f'''
{SENTINEL}
<section class="section section--low">
<div class="section-inner">
<span class="text-label rv">{label}</span>
<h2 class="text-h2 rv" style="margin:1rem 0 1.5rem;">{title.upper()}</h2>
<p class="text-body-lg rv" style="max-width:48rem;margin-bottom:3rem;">{intro}</p>
<div class="grid-3">
{''.join(cards)}
</div>
</div>
</section>
'''

count = 0
for cat, _, _ in SERVICES:
    for is_en in (False, True):
        base = ROOT / ('en/' + cat if is_en else cat)
        page = base / 'abomey-calavi.html'
        if not page.exists():
            continue
        text = page.read_text(encoding='utf-8', errors='ignore')
        if SENTINEL in text:
            continue  # idempotent
        block = build_block(cat, is_en)
        # Insert just before the newsletter block (which starts with <div class="newsletter">)
        new_text = re.sub(
            r'(<!-- NEWSLETTER -->|<div class="newsletter">)',
            block + '\n\\1',
            text,
            count=1,
        )
        if new_text != text:
            page.write_text(new_text, encoding='utf-8')
            count += 1
            print(f"OK {page.relative_to(ROOT)}")

print(f"\nTotal pages enrichies avec cluster: {count}")
