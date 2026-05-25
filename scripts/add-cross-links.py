#!/usr/bin/env python3
"""Ajoute des sections de cross-linking pour eviter les pages orphelines:

A. Sur chaque page service categorie (/agence-X/index.html) :
   - "Cette expertise dans toutes les villes" -> grid de toutes les villes
   - "Approfondir avec nos guides" -> 4 guides en lien

B. Sur chaque page locale (/agence-X/<ville>.html) :
   - "Approfondir avec nos guides experts" -> 3 guides pertinents

C. Sur chaque guide (/guides/<slug>.html) :
   - "Besoin d'aide ?" -> CTA vers les pages services + rendez-vous

Idempotent (skip si sentinel deja present).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

CITIES = [
    ('abomey-calavi', 'Abomey-Calavi', 'Bénin · Siège'),
    ('cotonou',       'Cotonou',       'Bénin'),
    ('paris',         'Paris',         'France'),
    ('marseille',     'Marseille',     'France'),
    ('lyon',          'Lyon',          'France'),
    ('bruxelles',     'Bruxelles',     'Belgique'),
    ('montreal',      'Montréal',      'Canada'),
    ('casablanca',    'Casablanca',    'Maroc'),
    ('dakar',         'Dakar',         'Sénégal'),
    ('abidjan',       'Abidjan',       'Côte d\'Ivoire'),
    ('tunis',         'Tunis',         'Tunisie'),
]
CITIES_EN = [
    ('abomey-calavi', 'Abomey-Calavi', 'Benin · HQ'),
    ('cotonou',       'Cotonou',       'Benin'),
    ('paris',         'Paris',         'France'),
    ('marseille',     'Marseille',     'France'),
    ('lyon',          'Lyon',          'France'),
    ('bruxelles',     'Brussels',      'Belgium'),
    ('montreal',      'Montreal',      'Canada'),
    ('casablanca',    'Casablanca',    'Morocco'),
    ('dakar',         'Dakar',         'Senegal'),
    ('abidjan',       'Abidjan',       'Côte d\'Ivoire'),
    ('tunis',         'Tunis',         'Tunisia'),
]

# Map service category -> 4 most relevant guides
CATEGORY_GUIDES = {
    'agence-seo-referencement-naturel': [
        ('guide-complet-seo-debutant', 'Guide complet SEO pour débutants'),
        ('articles-seo-rediger-guide', 'Rédiger un article SEO qui ranke'),
        ('netlinking-backlinks-strategie-seo', 'Stratégie netlinking & backlinks'),
        ('audit-seo-checklist-complete', 'Checklist d\'audit SEO complète'),
    ],
    'agence-creation-sites-web': [
        ('comment-creer-site-web-performant-2026', 'Créer un site web performant 2026'),
        ('cout-creation-site-web-guide', 'Coût d\'un site web : guide tarifs'),
        ('wordpress-vs-shopify-comparatif-cms-2026', 'WordPress vs Shopify'),
        ('landing-page-parfaite-guide', 'La landing page parfaite'),
    ],
    'agence-ia-automatisation': [
        ('agents-ia-cas-usage-marketing', 'Agents IA : cas d\'usage marketing'),
        ('chatbot-ia-entreprise-guide', 'Chatbot IA en entreprise'),
        ('automatisation-marketing-ia-guide', 'Automatisation marketing par IA'),
        ('make-vs-zapier-comparatif', 'Make vs Zapier : comparatif'),
    ],
    'agence-design-branding': [
        ('branding-startup-guide-complet', 'Branding startup : guide complet'),
        ('identite-visuelle-creer-guide', 'Créer une identité visuelle forte'),
        ('charte-graphique-elements-essentiels', 'Charte graphique : essentiels'),
        ('tendances-design-graphique-2026', 'Tendances design graphique 2026'),
    ],
    'agence-publicite-payante-sea-ads': [
        ('google-ads-guide-debutant', 'Google Ads guide débutant'),
        ('budget-publicitaire-optimiser', 'Optimiser son budget publicitaire'),
        ('publicite-en-ligne-google-ads-meta-ads-guide', 'Publicité en ligne : guide'),
        ('ab-testing-guide-complet', 'A/B testing : guide complet'),
    ],
    'agence-social-media': [
        ('strategie-social-media-2026', 'Stratégie social media 2026'),
        ('calendrier-editorial-social-media', 'Calendrier éditorial social'),
        ('community-management-bonnes-pratiques', 'Community management'),
        ('video-reseaux-sociaux-formats', 'Formats vidéo réseaux sociaux'),
    ],
    'agence-redaction-content-marketing': [
        ('content-marketing-strategie-guide', 'Stratégie content marketing'),
        ('copywriting-techniques-conversion', 'Copywriting : techniques de conversion'),
        ('strategie-editoriale-construire', 'Construire une stratégie éditoriale'),
        ('articles-seo-rediger-guide', 'Rédiger un article SEO'),
    ],
    'agence-email-marketing-crm': [
        ('email-marketing-guide-complet', 'Email marketing : guide complet'),
        ('crm-choisir-configurer-guide', 'Choisir et configurer son CRM'),
        ('marketing-automation-sequences', 'Marketing automation : séquences'),
        ('taux-ouverture-email-ameliorer', 'Améliorer le taux d\'ouverture email'),
    ],
    'agence-sales-funnels-cro': [
        ('landing-page-parfaite-guide', 'Landing page parfaite'),
        ('optimisation-taux-conversion-cro-guide', 'CRO : optimiser le taux de conversion'),
        ('tunnels-de-vente-sales-funnel-guide', 'Tunnels de vente'),
        ('ab-testing-guide-complet', 'A/B testing'),
    ],
    'agence-video-motion-design': [
        ('motion-design-marketing-guide', 'Motion design pour le marketing'),
        ('montage-video-outils-techniques', 'Montage vidéo : outils & techniques'),
        ('video-corporate-reussir', 'Réussir sa vidéo corporate'),
        ('video-reseaux-sociaux-formats', 'Formats vidéo réseaux sociaux'),
    ],
}

SENTINEL_CITIES = '<!-- xlink-cities -->'
SENTINEL_GUIDES = '<!-- xlink-guides -->'
SENTINEL_SERVICES = '<!-- xlink-services -->'

def cities_block_fr(category: str) -> str:
    cards = ''
    for slug, name, country in CITIES:
        cards += (
            f'<a href="/{category}/{slug}" style="text-decoration:none;text-align:center;'
            f'padding:1.5rem 1rem;background:var(--surface-container-lowest);'
            f'border:1px solid rgba(92,64,55,0.1);transition:transform 0.3s,border-color 0.3s;">'
            f'<p style="font-weight:700;color:var(--on-surface);margin:0;">{name}</p>'
            f'<p class="text-muted text-small" style="margin:.25rem 0 0;">{country}</p></a>'
        )
    return (
        f'{SENTINEL_CITIES}\n'
        '<section class="section section--low">\n'
        '<div class="section-inner">\n'
        '<span class="text-label rv">Présence locale</span>\n'
        '<h2 class="text-h2 rv" style="margin:1rem 0 2.5rem;">CETTE EXPERTISE DANS NOS VILLES</h2>\n'
        '<div class="grid-4 rv" style="gap:1rem;">\n'
        f'{cards}\n'
        '</div>\n'
        '</div>\n'
        '</section>\n'
    )

def cities_block_en(category: str) -> str:
    cards = ''
    for slug, name, country in CITIES_EN:
        cards += (
            f'<a href="/en/{category}/{slug}" style="text-decoration:none;text-align:center;'
            f'padding:1.5rem 1rem;background:var(--surface-container-lowest);'
            f'border:1px solid rgba(92,64,55,0.1);transition:transform 0.3s,border-color 0.3s;">'
            f'<p style="font-weight:700;color:var(--on-surface);margin:0;">{name}</p>'
            f'<p class="text-muted text-small" style="margin:.25rem 0 0;">{country}</p></a>'
        )
    return (
        f'{SENTINEL_CITIES}\n'
        '<section class="section section--low">\n'
        '<div class="section-inner">\n'
        '<span class="text-label rv">Local presence</span>\n'
        '<h2 class="text-h2 rv" style="margin:1rem 0 2.5rem;">THIS EXPERTISE IN OUR CITIES</h2>\n'
        '<div class="grid-4 rv" style="gap:1rem;">\n'
        f'{cards}\n'
        '</div>\n'
        '</div>\n'
        '</section>\n'
    )

def guides_block_fr(category: str) -> str:
    guides = CATEGORY_GUIDES.get(category, [])
    if not guides:
        return ''
    cards = ''
    for slug, title in guides:
        cards += (
            f'<a href="/guides/{slug}" class="card card-hover-glow rv" '
            f'style="padding:1.75rem;text-decoration:none;">'
            f'<span class="text-label" style="color:var(--primary-container);'
            f'font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;">Guide expert</span>'
            f'<h3 class="text-h4" style="margin:0.75rem 0 0;color:var(--on-surface);">{title}</h3>'
            f'<p class="text-body text-small" style="margin:0.5rem 0 0;color:rgba(229,226,225,0.5);">Lire le guide →</p>'
            f'</a>'
        )
    return (
        f'{SENTINEL_GUIDES}\n'
        '<section class="section section--surface">\n'
        '<div class="section-inner">\n'
        '<span class="text-label rv">Ressources</span>\n'
        '<h2 class="text-h2 rv" style="margin:1rem 0 2.5rem;">APPROFONDIR AVEC NOS GUIDES</h2>\n'
        '<div class="grid-4 rv" style="gap:1.5rem;">\n'
        f'{cards}\n'
        '</div>\n'
        '</div>\n'
        '</section>\n'
    )

def guides_block_en(category: str) -> str:
    guides = CATEGORY_GUIDES.get(category, [])
    if not guides:
        return ''
    cards = ''
    for slug, title in guides:
        cards += (
            f'<a href="/en/guides/{slug}" class="card card-hover-glow rv" '
            f'style="padding:1.75rem;text-decoration:none;">'
            f'<span class="text-label" style="color:var(--primary-container);'
            f'font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;">Expert guide</span>'
            f'<h3 class="text-h4" style="margin:0.75rem 0 0;color:var(--on-surface);">{title}</h3>'
            f'<p class="text-body text-small" style="margin:0.5rem 0 0;color:rgba(229,226,225,0.5);">Read the guide →</p>'
            f'</a>'
        )
    return (
        f'{SENTINEL_GUIDES}\n'
        '<section class="section section--surface">\n'
        '<div class="section-inner">\n'
        '<span class="text-label rv">Resources</span>\n'
        '<h2 class="text-h2 rv" style="margin:1rem 0 2.5rem;">GO DEEPER WITH OUR GUIDES</h2>\n'
        '<div class="grid-4 rv" style="gap:1.5rem;">\n'
        f'{cards}\n'
        '</div>\n'
        '</div>\n'
        '</section>\n'
    )

def services_block_for_guide_fr() -> str:
    """Block to inject at the end of guides: link to all main service categories"""
    cards = ''
    for cat, _ in CATEGORY_GUIDES.items():
        name = cat.replace('agence-', '').replace('-', ' ').title()
        cards += (
            f'<a href="/{cat}/" class="card card-hover-glow rv" '
            f'style="padding:1.5rem;text-decoration:none;">'
            f'<h3 class="text-h4" style="margin:0;color:var(--on-surface);">{name}</h3>'
            f'</a>'
        )
    return (
        f'{SENTINEL_SERVICES}\n'
        '<section class="section section--low">\n'
        '<div class="section-inner">\n'
        '<span class="text-label rv">Besoin d\'aide ?</span>\n'
        '<h2 class="text-h2 rv" style="margin:1rem 0 1.5rem;">DÉLÉGUEZ À NOS EXPERTS</h2>\n'
        '<p class="text-body-lg rv" style="margin-bottom:2.5rem;max-width:48rem;">Lire un guide, c\'est bien. Le mettre en oeuvre, c\'est mieux. Découvrez nos services premium ou prenez rendez-vous pour un audit gratuit.</p>\n'
        '<div class="grid-4 rv" style="gap:1rem;margin-bottom:3rem;">\n'
        f'{cards}\n'
        '</div>\n'
        '<div class="cta-buttons rv">\n'
        '  <a href="/rendez-vous" class="btn btn--orange">Prendre rendez-vous <span class="material-symbols-outlined">calendar_today</span></a>\n'
        '  <a href="/contact" class="btn btn--ghost">Nous contacter <span class="material-symbols-outlined">arrow_forward</span></a>\n'
        '</div>\n'
        '</div>\n'
        '</section>\n'
    )

def services_block_for_guide_en() -> str:
    cards = ''
    for cat, _ in CATEGORY_GUIDES.items():
        name = cat.replace('agence-', '').replace('-', ' ').title()
        cards += (
            f'<a href="/en/{cat}/" class="card card-hover-glow rv" '
            f'style="padding:1.5rem;text-decoration:none;">'
            f'<h3 class="text-h4" style="margin:0;color:var(--on-surface);">{name}</h3>'
            f'</a>'
        )
    return (
        f'{SENTINEL_SERVICES}\n'
        '<section class="section section--low">\n'
        '<div class="section-inner">\n'
        '<span class="text-label rv">Need help?</span>\n'
        '<h2 class="text-h2 rv" style="margin:1rem 0 1.5rem;">DELEGATE TO OUR EXPERTS</h2>\n'
        '<p class="text-body-lg rv" style="margin-bottom:2.5rem;max-width:48rem;">Reading a guide is good. Implementing it is better. Discover our premium services or book a free audit.</p>\n'
        '<div class="grid-4 rv" style="gap:1rem;margin-bottom:3rem;">\n'
        f'{cards}\n'
        '</div>\n'
        '<div class="cta-buttons rv">\n'
        '  <a href="/en/rendez-vous" class="btn btn--orange">Book a meeting <span class="material-symbols-outlined">calendar_today</span></a>\n'
        '  <a href="/en/contact" class="btn btn--ghost">Contact us <span class="material-symbols-outlined">arrow_forward</span></a>\n'
        '</div>\n'
        '</div>\n'
        '</section>\n'
    )

def inject_before_footer(text: str, block: str) -> str:
    """Inject block right before <footer or NEWSLETTER comment."""
    return re.sub(
        r'(<!-- NEWSLETTER -->|<div class="newsletter">|<footer class="footer">)',
        block + '\n\\1',
        text, count=1,
    )

def is_english(path: Path) -> bool:
    return any(part == 'en' for part in path.parts)

count_cat = 0
count_local = 0
count_guide = 0

# A. Service category index pages : add cities block + guides block
for cat in CATEGORY_GUIDES:
    for base in (ROOT / cat, ROOT / 'en' / cat):
        idx = base / 'index.html'
        if not idx.exists():
            continue
        text = idx.read_text(encoding='utf-8', errors='ignore')
        if SENTINEL_CITIES in text and SENTINEL_GUIDES in text:
            continue
        en = is_english(idx)
        cities_b = cities_block_en(cat) if en else cities_block_fr(cat)
        guides_b = guides_block_en(cat) if en else guides_block_fr(cat)
        block = ''
        if SENTINEL_CITIES not in text:
            block += cities_b
        if SENTINEL_GUIDES not in text:
            block += guides_b
        if block:
            new_text = inject_before_footer(text, block)
            if new_text != text:
                idx.write_text(new_text, encoding='utf-8')
                count_cat += 1

# B. Local city pages : add guides block
for cat in CATEGORY_GUIDES:
    for base in (ROOT / cat, ROOT / 'en' / cat):
        if not base.exists():
            continue
        for p in base.glob('*.html'):
            if p.name == 'index.html':
                continue
            text = p.read_text(encoding='utf-8', errors='ignore')
            if SENTINEL_GUIDES in text:
                continue
            en = is_english(p)
            block = guides_block_en(cat) if en else guides_block_fr(cat)
            new_text = inject_before_footer(text, block)
            if new_text != text:
                p.write_text(new_text, encoding='utf-8')
                count_local += 1

# C. Guides : add services block at end
for d in (ROOT / 'guides', ROOT / 'en' / 'guides'):
    if not d.exists():
        continue
    for p in d.glob('*.html'):
        if p.name == 'index.html':
            continue
        text = p.read_text(encoding='utf-8', errors='ignore')
        if SENTINEL_SERVICES in text:
            continue
        en = is_english(p)
        block = services_block_for_guide_en() if en else services_block_for_guide_fr()
        new_text = inject_before_footer(text, block)
        if new_text != text:
            p.write_text(new_text, encoding='utf-8')
            count_guide += 1

print(f"Pages categorie services enrichies (cities + guides) : {count_cat}")
print(f"Pages locales enrichies (guides block) : {count_local}")
print(f"Guides enrichis (services block) : {count_guide}")
