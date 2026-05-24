#!/usr/bin/env python3
"""Allonge les titres trop courts et raccourcit les desc trop longues."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE_DIRS = {'.git', 'node_modules', 'app', 'scripts'}

NOINDEX_RE = re.compile(r'<meta name="robots"[^>]*noindex', re.IGNORECASE)
TITLE_RE = re.compile(r'<title>([^<]*)</title>')
DESC_RE = re.compile(r'<meta name="description" content="([^"]*)"')
OG_TITLE_RE = re.compile(r'<meta property="og:title" content="([^"]*)"')
OG_DESC_RE = re.compile(r'<meta property="og:description" content="([^"]*)"')
TW_DESC_RE = re.compile(r'<meta name="twitter:description" content="([^"]*)"')

# Custom title enrichments for short titles
TITLE_FIXES = {
    # FR — current actual titles (using em-dash —)
    'Avis clients — Pirabel Labs': 'Avis clients · Témoignages authentiques | Pirabel Labs',
    'Article | Pirabel Labs Blog': 'Article du blog · Marketing digital & SEO | Pirabel Labs',
    'Candidature — Pirabel Labs': 'Candidature spontanée · Rejoignez l\'équipe Pirabel Labs',
    'Carrières — Pirabel Labs': 'Carrières · Offres d\'emploi marketing digital | Pirabel Labs',
    'Étude de cas | Pirabel Labs': 'Études de cas · Résultats clients réels | Pirabel Labs',
    'Services – Pirabel Labs': 'Services digitaux premium · SEO, Web, IA, Branding | Pirabel Labs',
    # FR too long
    'À propos · Pirabel Labs — Fondée par Lissanon Gildas & Fidah Imorou à Abomey-Calavi':
        'À propos · Fondée par Lissanon Gildas & Fidah Imorou | Pirabel Labs',
    # EN — current actual titles
    'Application — Pirabel Labs': 'Application · Join the Pirabel Labs team | Careers',
    'Study de cas | Pirabel Labs': 'Case Studies · Real client results | Pirabel Labs',
    # EN too long
    'About Us · Pirabel Labs — Founded by Lissanon Gildas & Fidah Imorou in Abomey-Calavi':
        'About Us · Founded by Lissanon Gildas & Fidah Imorou | Pirabel Labs',
    'Careers at Pirabel Labs | Digital Marketing Jobs in Paris, Casablanca, Dakar':
        'Careers · Digital Marketing Jobs in West Africa | Pirabel Labs',
    # Short city/sub-service titles (Lyon, Dakar, Paris, Tunis...)
    'CRM Setup Lyon | Pirabel Labs':       'CRM Setup & Configuration à Lyon · Pirabel Labs',
    'Agents IA Lyon | Pirabel Labs':       'Agents IA & Chatbots à Lyon · Pirabel Labs',
    'Agence IA Lyon | Pirabel Labs':       'Agence IA & Automatisation à Lyon · Pirabel Labs',
    'Meta Ads Dakar | Pirabel Labs':       'Meta Ads Facebook & Instagram à Dakar · Pirabel Labs',
    'Meta Ads Lyon | Pirabel Labs':        'Meta Ads Facebook & Instagram à Lyon · Pirabel Labs',
    'Meta Ads Paris | Pirabel Labs':       'Meta Ads Facebook & Instagram à Paris · Pirabel Labs',
    'Meta Ads Tunis | Pirabel Labs':       'Meta Ads Facebook & Instagram à Tunis · Pirabel Labs',
    'Audit SEO Lyon | Pirabel Labs':       'Audit SEO & Plan d\'action à Lyon · Pirabel Labs',
    'SEO Local Lyon | Pirabel Labs':       'SEO Local & Google My Business à Lyon · Pirabel Labs',
    'Montage Vidéo | Pirabel Labs':       'Montage vidéo professionnel · Studio | Pirabel Labs',
    # EN city/sub-service
    'AI Agents Lyon | Pirabel Labs':       'AI Agents & Chatbots in Lyon · Pirabel Labs',
    'Agency IA Lyon | Pirabel Labs':       'AI & Automation Agency in Lyon · Pirabel Labs',
    'Sales Funnels | Pirabel Labs':        'Sales Funnels & Conversion Optimization · Pirabel Labs',
    'SEO Audit Lyon | Pirabel Labs':       'SEO Audit & Action Plan in Lyon · Pirabel Labs',
    'Local SEO Lyon | Pirabel Labs':       'Local SEO & Google Business Profile in Lyon · Pirabel Labs',
    'Video Editing | Pirabel Labs':        'Professional Video Editing · Studio | Pirabel Labs',
    'Art Direction | Pirabel Labs':        'Creative Art Direction & Brand Identity | Pirabel Labs',
    'Legal Notice | Pirabel Labs':         'Legal Notice & Terms of Use | Pirabel Labs',
    'Privacy Policy | Pirabel Labs':       'Privacy Policy & Data Protection | Pirabel Labs',
    # Specific NO_TITLE/short titles for admin/portal (will be noindex)
    'Portail Client | Pirabel Labs':       'Portail Client · Espace Sécurisé | Pirabel Labs',
}

# Specific description shortening overrides for >170 chars
DESC_FIXES = {
    # FR
    'Pirabel Labs, agence digitale premium basée à Abomey-Calavi (Bénin), avec une présence à Paris, Cotonou et Casablanca. SEO, sites web, IA, automatisation, branding. Audit gratuit.':
        'Agence digitale premium basée à Abomey-Calavi (Bénin). SEO, sites web, IA, automatisation, branding. Audit gratuit pour entreprises ambitieuses.',
    'Pirabel Labs, agence SEO basée à Abomey-Calavi, au Bénin. Stratégies de référencement naturel sur mesure pour PME, startups et grandes entreprises de l\'Atlantique. Audit gratuit.':
        'Agence SEO basée à Abomey-Calavi (Bénin). Référencement naturel sur mesure pour PME, startups et grandes entreprises. Audit gratuit.',
    # EN
    'Pirabel Labs, premium digital agency headquartered in Abomey-Calavi (Benin), with offices in Paris, Cotonou and Casablanca. SEO, websites, AI, automation, branding. Free audit.':
        'Premium digital agency headquartered in Abomey-Calavi (Benin). SEO, websites, AI, automation, branding. Free audit for ambitious businesses.',
    'Pirabel Labs, SEO agency headquartered in Abomey-Calavi, Benin. Custom organic search strategies for SMEs, startups and enterprises across the Atlantic region. Free audit.':
        'SEO agency headquartered in Abomey-Calavi (Benin). Custom organic search for SMEs, startups and enterprises. Free audit.',
}

def iter_html():
    for p in ROOT.rglob('*.html'):
        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue
        yield p

def fix_title(text: str) -> tuple[str, bool]:
    changed = False
    m = TITLE_RE.search(text)
    if not m:
        return text, False
    old = m.group(1)
    if old in TITLE_FIXES:
        new = TITLE_FIXES[old]
        text = text.replace(f'<title>{old}</title>', f'<title>{new}</title>', 1)
        # Also update og:title if it matches
        m_og = OG_TITLE_RE.search(text)
        if m_og and m_og.group(1) == old:
            text = text.replace(
                f'<meta property="og:title" content="{old}"',
                f'<meta property="og:title" content="{new}"',
                1,
            )
        changed = True
    return text, changed

def fix_desc(text: str) -> tuple[str, bool]:
    changed = False
    for old, new in DESC_FIXES.items():
        if old in text:
            text = text.replace(old, new)
            changed = True
    return text, changed

count_t = count_d = 0
for path in iter_html():
    try:
        text = path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    if NOINDEX_RE.search(text):
        continue

    new_text = text
    new_text, t_changed = fix_title(new_text)
    new_text, d_changed = fix_desc(new_text)

    if new_text != text:
        path.write_text(new_text, encoding='utf-8')
        if t_changed: count_t += 1
        if d_changed: count_d += 1

print(f"Titres allonges: {count_t}")
print(f"Descriptions raccourcies: {count_d}")
