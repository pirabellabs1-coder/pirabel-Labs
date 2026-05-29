#!/usr/bin/env python3
"""Enrichit les meta descriptions trop courtes (< 120 chars) avec un suffixe
de valeur calibre par categorie de page detectee (service / city / blog / guide).

Cible : 780 pages. Chaque page gagnera une description finale de 140-160 chars
(zone de SERP optimale).
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'.git', 'node_modules', 'api', 'app', 'Projet A', 'projet claude B', 'scripts', 'scratch'}
SKIP_PATHS = {'/formations/', '/en/formations/'}

# Templates de valeur ajoutee par type de page
SUFFIXES_FR = {
    'agence-seo': ' Agence SEO premium Pirabel Labs (Cotonou, Paris). Audit SEO gratuit en 24h, +147% leads moyens en 6 mois, demarche prouvee.',
    'agence-design': ' Studio design Pirabel Labs : branding premium, identite visuelle, logo, charte graphique. Devis gratuit en 24h pour PME ambitieuses.',
    'agence-creation-sites-web': ' Agence creation sites web Pirabel Labs : WordPress, Webflow, Shopify, Next.js. Devis gratuit sous 24h, Lighthouse 90+ garanti.',
    'agence-ia-automatisation': ' Agence IA & automatisation Pirabel Labs. Make, Zapier, n8n, agents IA. Audit gratuit, +30h/semaine economisees pour PME.',
    'agence-publicite-payante': ' Agence Meta Ads, Google Ads, TikTok Ads Pirabel Labs. Audit ads gratuit en 24h, ROAS multiplie par 3 sous 90 jours.',
    'agence-social-media': ' Agence social media Pirabel Labs : Instagram, TikTok, LinkedIn, Facebook. Strategie + creas + community management premium.',
    'agence-email-marketing': ' Agence email marketing Pirabel Labs : Brevo, Klaviyo, ConvertKit. ROI x40 prouve sur 1000+ campagnes envoyees.',
    'agence-redaction': ' Agence redaction & content marketing Pirabel Labs. +500 articles publies, x3 trafic moyen, devis gratuit 24h.',
    'agence-video': ' Studio video & motion design Pirabel Labs. After Effects, animation, video sociale. Devis gratuit en 24h pour marques.',
    'agence-sales-funnels': ' Agence sales funnels & CRO Pirabel Labs : tunnels de vente, landing pages, A/B tests. +320% taux conversion mesure.',
    'consulting-digital': ' Conseil digital Pirabel Labs : strategie, transformation, growth. Diagnostic strategique offert, ROI mesure en 90 jours.',
    'blog': ' Conseils pratiques signes Pirabel Labs, agence digitale premium basee a Abomey-Calavi (Benin). Cofondateurs L. Gildas et F. Imorou.',
    'guides': ' Guide complet par les experts Pirabel Labs (agence digitale premium Benin). Cas pratiques, frameworks, templates, exemples reels.',
    'default': ' Pirabel Labs, agence digitale premium basee a Abomey-Calavi (Benin). Decouvrez nos services et reservez votre audit gratuit en 24h.',
}
SUFFIXES_EN = {
    'agence-seo': ' Premium SEO agency Pirabel Labs (Cotonou, Paris). Free SEO audit in 24h, +147% avg leads in 6 months, proven method.',
    'agence-design': ' Design studio Pirabel Labs: premium branding, visual identity, logo, brand book. Free quote in 24h for ambitious SMEs.',
    'agence-creation-sites-web': ' Web agency Pirabel Labs: WordPress, Webflow, Shopify, Next.js. Free quote in 24h, Lighthouse 90+ guaranteed.',
    'agence-ia-automatisation': ' AI & automation agency Pirabel Labs. Make, Zapier, n8n, AI agents. Free audit, +30h/week saved for SMEs.',
    'agence-publicite-payante': ' Meta Ads, Google Ads, TikTok Ads agency Pirabel Labs. Free ads audit in 24h, ROAS multiplied by 3 within 90 days.',
    'agence-social-media': ' Social media agency Pirabel Labs: Instagram, TikTok, LinkedIn, Facebook. Strategy + creatives + community management.',
    'agence-email-marketing': ' Email marketing agency Pirabel Labs: Brevo, Klaviyo, ConvertKit. 40x ROI proven on 1000+ campaigns sent.',
    'agence-redaction': ' Content & copywriting agency Pirabel Labs. +500 articles published, 3x avg traffic, free quote in 24h.',
    'agence-video': ' Video & motion design studio Pirabel Labs. After Effects, animation, social video. Free quote in 24h for brands.',
    'agence-sales-funnels': ' Sales funnels & CRO agency Pirabel Labs: sales funnels, landing pages, A/B tests. +320% conversion rate measured.',
    'consulting-digital': ' Digital consulting Pirabel Labs: strategy, transformation, growth. Free strategic diagnosis, ROI measured in 90 days.',
    'blog': ' Practical advice by Pirabel Labs, premium digital agency based in Abomey-Calavi (Benin). Cofounders L. Gildas & F. Imorou.',
    'guides': ' Complete guide by Pirabel Labs experts (premium digital agency Benin). Case studies, frameworks, templates, real examples.',
    'default': ' Pirabel Labs, premium digital agency based in Abomey-Calavi (Benin). Discover our services and book your free audit in 24h.',
}


def get_suffix(path_str, is_en):
    suffixes = SUFFIXES_EN if is_en else SUFFIXES_FR
    for key in [
        'agence-seo', 'agence-design-branding', 'agence-creation-sites-web',
        'agence-ia-automatisation', 'agence-publicite-payante', 'agence-social-media',
        'agence-email-marketing', 'agence-redaction', 'agence-video',
        'agence-sales-funnels', 'consulting-digital', 'blog/', 'guides/',
    ]:
        if key in path_str:
            mapkey = 'agence-design' if 'agence-design-branding' in key else key.rstrip('/')
            if mapkey in suffixes:
                return suffixes[mapkey]
    return suffixes['default']


def should_skip(p):
    if any(s in p.parts for s in SKIP):
        return True
    pstr = p.as_posix()
    return any(sp in pstr for sp in SKIP_PATHS)


count_enriched = 0
for p in ROOT.rglob('*.html'):
    if should_skip(p):
        continue
    try:
        c = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    m = re.search(r'(<meta\s+name=["\']description["\']\s+content=["\'])([^"\']*)(["\'])', c)
    if not m:
        continue
    desc = m.group(2).strip()
    if len(desc) >= 120:
        continue
    is_en = '/en/' in p.as_posix() or p.as_posix().startswith('en/') or '\\en\\' in str(p)
    suffix = get_suffix(p.as_posix(), is_en)
    # Si la desc se termine deja par un point, OK ; sinon ajouter
    if not desc.rstrip().endswith(('.', '!', '?')):
        desc = desc.rstrip(' ,;:-—') + '.'
    new_desc = desc + suffix
    # Cap a 160 chars max (couper proprement au mot)
    if len(new_desc) > 160:
        cut = new_desc[:160].rsplit(' ', 1)[0]
        new_desc = cut.rstrip(' ,;:-—') + '.'
    if new_desc == desc:
        continue
    new_c = c.replace(m.group(0), m.group(1) + new_desc + m.group(3), 1)
    if new_c != c:
        p.write_text(new_c, encoding='utf-8')
        count_enriched += 1

print(f'Descriptions enrichies : {count_enriched}')
