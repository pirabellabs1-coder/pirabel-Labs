#!/usr/bin/env python3
"""Analyse les 107 URLs 404 de GSC et propose des redirects 301."""
import csv
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
GSC_CSV = ROOT / "gsc-404.csv"


def find_match_in_repo(slug: str) -> str | None:
    """Cherche un fichier HTML qui pourrait correspondre au slug."""
    candidates = list(ROOT.rglob(f"{slug}.html"))
    candidates = [c for c in candidates if 'node_modules' not in str(c) and 'app' not in c.parts]
    if candidates:
        rel = candidates[0].relative_to(ROOT)
        return '/' + str(rel).replace('\\', '/').replace('.html', '')
    return None


# Manual mapping for known patterns (heuristic-based + visual analysis of the CSV)
MANUAL_REDIRECTS = {
    # Slug typos
    '/en/blog/email-marketing-strategies-guide-complete': '/en/blog/email-marketing-strategies-guide-complet',
    '/en/guides/articles-seo-writtenr-guide': '/en/guides/articles-seo-rediger-guide',
    '/guides/tunnel-vente-creer-optimize': '/guides/tunnels-de-vente-sales-funnel-guide',
    '/guides/wordion-design-marketing-guide': '/guides/motion-design-marketing-guide',
    '/guides/audit-seo-checklist-completeeeee': '/guides/audit-seo-checklist-complete',
    '/guides/video-networks-sociaux-formats': '/guides/video-reseaux-sociaux-formats',
    '/guides/charte-graphique-element-essentials': '/guides/charte-graphique-elements-essentiels',
    '/guides/guide-complete-seo-debutant.html': '/guides/guide-complet-seo-debutant',
    '/guides/budget-publicitaire-optimize': '/guides/budget-publicitaire-optimiser',
    '/en/guides/montage-video-tools-technicals': '/en/guides/montage-video-outils-techniques',
    '/en/guides/retargeting-strategys-advanced.html': '/en/guides/retargeting-strategies-avancees',
    '/en/guides/influence-marketing-guide-complete.html': '/en/guides/influence-marketing-guide-complet',
    '/en/guides/trends-design-graphique-2026': '/en/guides/tendances-design-graphique-2026',
    '/en/guideallys/landing-page-parfaite-guideally.html': '/en/guides/landing-page-parfaite-guide',
    '/guideallys/landing-page-parfaite-guideally': '/guides/landing-page-parfaite-guide',
    '/blog/seo-referencement-naturel-guide-complete-2026': '/blog/seo-referencement-naturel-guide-complet-2026',
    '/en/blog/seo-referencement-naturel-guide-complete-2026': '/en/blog/seo-referencement-naturel-guide-complet-2026',
    '/en/blog/branding-visual-identity': '/en/blog/branding-identite-visuelle-construire-marque-forte',

    # 'agency' typo for 'agence'
    '/agency-ia-automatisation': '/agence-ia-automatisation',
    '/agency-ia-automatisation/': '/agence-ia-automatisation/',
    '/en/agency-ia-automatisation': '/en/agence-ia-automatisation',
    '/en/agency-ia-automatisation/': '/en/agence-ia-automatisation/',

    # 'about' EN
    '/en/about': '/en/a-propos',

    # 'seo-agency'
    '/en/seo-agency/': '/en/agence-seo-referencement-naturel/',
    '/en/seo-agency': '/en/agence-seo-referencement-naturel/',

    # campaigns-emailing -> campagnes-emailing (likely typo, point to category)
    '/agence-email-marketing-crm/campaigns-emailing': '/agence-email-marketing-crm/',
    '/agence-email-marketing-crm/campaigns-emailing/casablanca': '/agence-email-marketing-crm/',
    '/agence-email-marketing-crm/campaigns-emailing/lyon': '/agence-email-marketing-crm/',
    '/agence-email-marketing-crm/campaigns-emailing/tunis': '/agence-email-marketing-crm/',
    '/en/agence-email-marketing-crm/campaigns-emailing/casablanca': '/en/agence-email-marketing-crm/',
    '/en/agence-email-marketing-crm/campaigns-emailing/lyon': '/en/agence-email-marketing-crm/',
    '/en/agence-email-marketing-crm/campaigns-emailing/tunis': '/en/agence-email-marketing-crm/',

    # strategie-editorial -> strategie-editoriale (or category)
    '/agence-redaction-content-marketing/strategie-editorial': '/agence-redaction-content-marketing/',
    '/agence-redaction-content-marketing/strategie-editorial/lyon': '/agence-redaction-content-marketing/',
    '/en/agence-redaction-content-marketing/strategie-editorial/paris': '/en/agence-redaction-content-marketing/',

    # make-automation -> automatisation-make
    '/agence-ia-automatisation/make-automation/dakar': '/agence-ia-automatisation/',
    '/agence-ia-automatisation/make-automation/paris': '/agence-ia-automatisation/',

    # video-wordion -> video-motion
    '/en/agence-video-wordion-design/': '/en/agence-video-motion-design/',

    # request-modification -> modifier-devis
    '/request-modification': '/modifier-devis',

    # Projet A (file with space)
    '/Projet A': '/',

    # EN .html anciennes pages -> nouvelles routes ou page principale
    '/en/n8n-automation.html': '/en/agence-ia-automatisation/',
    '/en/casablanca.html': '/en/agence-seo-referencement-naturel/casablanca',
    '/en/zapier-automatisation.html': '/en/agence-ia-automatisation/',
    '/en/video-reseaux-sociaux.html': '/en/agence-video-motion-design/',
    '/en/google-ads-guide-debutant.html': '/en/guides/google-ads-guide-debutant',
    '/en/automatisation-marketing-ia-guide.html': '/en/guides/automatisation-marketing-ia-guide',
    '/en/agents-ia.html': '/en/agence-ia-automatisation/',
    '/en/agents-ia-cas-usage-marketing.html': '/en/guides/agents-ia-cas-usage-marketing',
    '/en/wordpress.html': '/en/agence-creation-sites-web/',
    '/en/content-marketing-strategie-guide.html': '/en/guides/content-marketing-strategie-guide',
    '/en/charte-graphique.html': '/en/guides/charte-graphique-elements-essentiels',
    '/en/landing-pages.html': '/en/guides/landing-page-parfaite-guide',
    '/en/seo-local.html': '/en/agence-seo-referencement-naturel/',
    '/en/netlinking.html': '/en/guides/netlinking-backlinks-strategie-seo',
    '/en/webflow.html': '/en/agence-creation-sites-web/',
    '/en/identite-visuelle.html': '/en/agence-design-branding/',
    '/en/packaging-design.html': '/en/agence-design-branding/',
    '/en/seo-technique.html': '/en/agence-seo-referencement-naturel/',
    '/en/google-ads.html': '/en/agence-publicite-payante-sea-ads/',

    # Internal routes leakees - redirect vers home
    '/app/views/reviews-admin': '/',
    '/app/views/prospects': '/',
    '/app/views/campaigns': '/',
    '/app/views/clients': '/',
    '/app/views/reviews': '/avis',

    # Additional typos
    '/guides/trends-design-graphique-2026': '/guides/tendances-design-graphique-2026',
    '/guides/branding-startup-guide-completeeee': '/guides/branding-startup-guide-complet',
    '/en/guides/branding-startup-guide-completeeee': '/en/guides/branding-startup-guide-complet',
    '/en/guides/email-marketing-guide-completeeee': '/en/guides/email-marketing-guide-complet',
    '/guides/email-marketing-guide-completeeee': '/guides/email-marketing-guide-complet',
    '/guides/influence-marketing-guide-completeeee': '/guides/influence-marketing-guide-complet',
    '/en/guides/influence-marketing-guide-completeeee': '/en/guides/influence-marketing-guide-complet',
    '/guides/strategy-netlinking-ethique': '/guides/netlinking-backlinks-strategie-seo',
    '/guides/montage-video-tools-technicals': '/guides/montage-video-outils-techniques',
    '/guides/how-creer-site-web-performant-2026': '/guides/comment-creer-site-web-performant-2026',
    '/en/guides/how-creer-site-web-performant-2026': '/en/guides/comment-creer-site-web-performant-2026',
    '/guides/how-create-site-web-high-performing-2026': '/guides/comment-creer-site-web-performant-2026',
    '/guides/content-marketing-strategy-guide': '/guides/content-marketing-strategie-guide',
    '/agence-ia-automatisation/chatgpt-business': '/agence-ia-automatisation/',
    '/en/guides/chatbot-ia-business-guide.html': '/en/guides/chatbot-ia-entreprise-guide',
    '/en/agence-email-marketing-crm/campaigns-emailing': '/en/agence-email-marketing-crm/',
    '/en/guides/budget-publicitaire-optimize': '/en/guides/budget-publicitaire-optimiser',
    '/blog/video-marketing-strategy-guide-2026': '/blog/',
    '/guides/automation-marketing-ia-guide.html': '/guides/automatisation-marketing-ia-guide',
    '/agency-ia-automation/': '/agence-ia-automatisation/',
}


# Read GSC CSV
urls_404 = []
with open(GSC_CSV, encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        url = row['URL']
        path = url.replace('https://www.pirabellabs.com', '')
        urls_404.append(path)

print(f"Total 404 URLs : {len(urls_404)}")

# Categorize
mapped = []
unmapped = []
for path in urls_404:
    if path in MANUAL_REDIRECTS:
        mapped.append((path, MANUAL_REDIRECTS[path]))
    else:
        # Try to find via slug heuristic
        slug = path.rsplit('/', 1)[-1].replace('.html', '')
        match = find_match_in_repo(slug)
        if match:
            mapped.append((path, match))
        else:
            unmapped.append(path)

print(f"Mappes : {len(mapped)}")
print(f"Non-mappes : {len(unmapped)}")
print()
if unmapped:
    print("=== UNMAPPED (a verifier manuellement) ===")
    for p in unmapped:
        print(f"  {p}")

# Generate Vercel redirects (skip self-redirects, dedupe, escape only dots)
print()
print("=== Vercel routes 301 a ajouter ===")
seen = set()
for src, dest in mapped:
    if src == dest or src.rstrip('/') == dest.rstrip('/'):
        continue
    if src in seen:
        continue
    seen.add(src)
    # Vercel routes use minimal regex; escape only . in URLs (no backslash on -)
    escaped_src = src.replace('.', '\\\\.')
    # Escape JSON strings
    src_json = escaped_src.replace('"', '\\"')
    dest_json = dest.replace('"', '\\"')
    print(f'    {{ "src": "{src_json}$", "status": 301, "headers": {{ "Location": "{dest_json}" }} }},')
