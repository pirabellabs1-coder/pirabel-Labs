#!/usr/bin/env python3
"""Repare les titres et descriptions tronques des articles de blog FR + EN."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Mapping {filename: {title, desc}} — uniquement les fichiers detectes tronques
FIXES = {
    'automatisation-marketing-guide-outils-strategies.html': {
        'title': "Automatisation Marketing : Guide Complet des Outils et Stratégies | Pirabel Labs",
        'desc': "Guide complet de l'automatisation marketing : outils (Make, Zapier, n8n, HubSpot), email automation, CRM, chatbots et workflows avancés pour scaler vos ventes.",
    },
    'branding-identite-visuelle-construire-marque-forte.html': {
        'title': "Branding et Identité Visuelle : Comment Construire une Marque Forte | Pirabel Labs",
        'desc': "Guide branding et identité visuelle : stratégie de marque, positionnement, logo, couleurs, typographie, charte graphique et ton de voix pour bâtir une marque mémorable.",
    },
    'email-marketing-strategies-guide-complet.html': {
        'title': "Email Marketing : Stratégies et Guide Complet 2026 | Pirabel Labs",
        'desc': "Guide email marketing 2026 : segmentation, automation, A/B testing, délivrabilité et outils comme Brevo, Mailchimp et ActiveCampaign pour transformer vos abonnés en clients.",
    },
    'marketing-automation-guide-entreprises.html': {
        'title': "Marketing Automation : Guide pour Entreprises B2B et B2C | Pirabel Labs",
        'desc': "Marketing automation pour entreprises : workflows (Make, Zapier, n8n), intégration CRM et KPIs pour automatiser nurturing, scoring et ventes à grande échelle.",
    },
    'netlinking-backlinks-strategie-seo.html': {
        'title': "Netlinking : Comment Obtenir des Backlinks de Qualité pour le SEO | Pirabel Labs",
        'desc': "Guide netlinking 2026 : stratégies pour acquérir des backlinks de qualité, outreach, guest posting, link baiting et critères Google pour booster votre autorité de domaine.",
    },
    'optimisation-taux-conversion-cro-guide.html': {
        'title': "CRO : Comment Optimiser Votre Taux de Conversion (Guide Complet) | Pirabel Labs",
        'desc': "Guide CRO : tests A/B, UX, heatmaps, psychologie de conversion et bonnes pratiques pour transformer plus de visiteurs en acheteurs sur votre site web.",
    },
    'publicite-en-ligne-google-ads-meta-ads-guide.html': {
        'title': "Publicité en Ligne : Google Ads & Meta Ads — Guide Complet | Pirabel Labs",
        'desc': "Publicité en ligne 2026 : structure de campagne, ciblage, budget, créatives et tracking pour Google Ads, Meta Ads et TikTok Ads avec ROI mesurable.",
    },
    'tunnels-de-vente-sales-funnel-guide.html': {
        'title': "Tunnels de Vente : Construire un Sales Funnel Performant | Pirabel Labs",
        'desc': "Guide tunnels de vente : landing pages, séquences email et stratégies d'upsell pour transformer vos prospects en clients fidèles avec un funnel optimisé.",
    },
    'wordpress-vs-shopify-comparatif-cms-2026.html': {
        'title': "WordPress vs Shopify : Quel CMS Choisir pour Votre Projet en 2026 | Pirabel Labs",
        'desc': "Comparatif WordPress vs Shopify 2026 : fonctionnalités, tarifs, SEO, facilité d'usage, personnalisation et performance pour choisir la bonne plateforme.",
    },
    'chatbot-ia-service-client-guide.html': {
        'title': "Chatbot IA : Révolutionner Votre Service Client et Booster les Ventes | Pirabel Labs",
        'desc': "Guide chatbot IA 2026 : types de chatbots, IA conversationnelle, intégration site web, qualification leads, automatisation support client et impact ROI mesurable.",
    },
    'content-marketing-strategie-contenu-2026.html': {
        'title': "Content Marketing : Stratégie de Contenu 2026 pour Marques Ambitieuses | Pirabel Labs",
        'desc': "Stratégie content marketing 2026 : audit, persona, piliers thématiques, calendrier éditorial et mesure ROI pour transformer votre contenu en moteur de croissance.",
    },
    'copywriting-techniques-vente-en-ligne.html': {
        'title': "Copywriting : Techniques de Vente en Ligne qui Convertissent | Pirabel Labs",
        'desc': "Techniques copywriting qui convertissent : frameworks AIDA et PAS, hooks émotionnels, preuves sociales et appels à l'action pour booster vos ventes en ligne.",
    },
}

TITLE_RE = re.compile(r'<title>[^<]*</title>')
DESC_RE = re.compile(r'<meta name="description" content="[^"]*"')
OG_TITLE_RE = re.compile(r'<meta property="og:title" content="[^"]*"')
OG_DESC_RE = re.compile(r'<meta property="og:description" content="[^"]*"')
TW_TITLE_RE = re.compile(r'<meta name="twitter:title" content="[^"]*"')
TW_DESC_RE = re.compile(r'<meta name="twitter:description" content="[^"]*"')

changed = 0
for filename, fix in FIXES.items():
    path = ROOT / 'blog' / filename
    if not path.exists():
        print(f"[MISS] {path}")
        continue
    text = path.read_text(encoding='utf-8', errors='ignore')
    new = text
    new = TITLE_RE.sub(f'<title>{fix["title"]}</title>', new, count=1)
    new = DESC_RE.sub(f'<meta name="description" content="{fix["desc"]}"', new, count=1)
    new = OG_TITLE_RE.sub(f'<meta property="og:title" content="{fix["title"]}"', new, count=1)
    new = OG_DESC_RE.sub(f'<meta property="og:description" content="{fix["desc"]}"', new, count=1)
    new = TW_TITLE_RE.sub(f'<meta name="twitter:title" content="{fix["title"]}"', new, count=1)
    new = TW_DESC_RE.sub(f'<meta name="twitter:description" content="{fix["desc"]}"', new, count=1)
    if new != text:
        path.write_text(new, encoding='utf-8')
        changed += 1
        print(f"[OK] {filename}")

print(f"\nArticles corriges: {changed}")

# Aussi: fix la description tronquee du blog index
idx = ROOT / 'blog.html'
if idx.exists():
    t = idx.read_text(encoding='utf-8', errors='ignore')
    OLD = 'Découvrez nos articles sur le SEO, la création de sites web, l\'IA, le marketing digital et la croissance en ligne. Guides, conseils et.'
    NEW = 'Articles experts sur le SEO, la création de sites web, l\'IA, le marketing digital et la croissance en ligne — guides pratiques et études de cas Pirabel Labs.'
    # Try both raw and entity-encoded
    OLD_E = OLD.replace("'", '&rsquo;').replace('é', '&eacute;').replace('è', '&egrave;').replace('â', '&acirc;').replace('ê', '&ecirc;').replace('à', '&agrave;').replace('î', '&icirc;').replace('ô', '&ocirc;').replace('ç', '&ccedil;').replace('"', '&quot;').replace('—', '&mdash;')
    for old in (OLD, OLD_E):
        if old in t:
            t = t.replace(old, NEW)
            idx.write_text(t, encoding='utf-8')
            print(f"\n[OK] blog.html description fixe")
            break
    else:
        # Try a more flexible regex on the current description
        m = re.search(r'<meta name="description" content="([^"]*?Guides, conseils et[^"]*?)"', t)
        if m:
            t = t.replace(m.group(1), NEW)
            idx.write_text(t, encoding='utf-8')
            print(f"\n[OK] blog.html description fixe (via regex)")
