#!/usr/bin/env python3
"""Generate une meta description unique pour chaque guide qui partageait la meme
description social media generique."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DUP_DESC = 'Construisez une stratégie social media performante en 2026. Plateformes, contenus, planification et mesure des résultats.'

# Mapping topic-cle -> description unique sur mesure
MAPPING = {
    'articles-seo-rediger-guide.html': "Rédiger des articles SEO qui se classent en première page Google : structure, mots-cles, intention de recherche et optimisation on-page.",
    'branding-startup-guide-complet.html': "Construire le branding d'une startup : positionnement, identité visuelle, ton de voix, naming et déploiement multi-canal.",
    'calendrier-editorial-social-media.html': "Bâtir un calendrier éditorial social media efficace : cadence, thématiques, formats, outils et workflow d'approbation.",
    'charte-graphique-elements-essentiels.html': "Concevoir une charte graphique professionnelle : logo, palette, typographie, iconographie et règles d'usage indispensables.",
    'community-management-bonnes-pratiques.html': "Les bonnes pratiques du community management en 2026 : modération, engagement, gestion de crise et croissance organique.",
    'content-marketing-strategie-guide.html': "Stratégie de content marketing performante : audit, persona, piliers thématiques, calendrier et mesure du ROI éditorial.",
    'copywriting-techniques-conversion.html': "Techniques de copywriting qui convertissent : frameworks AIDA et PAS, hooks, preuves sociales et appels à l'action.",
    'crm-choisir-configurer-guide.html': "Choisir et configurer un CRM adapté à votre PME : comparatif HubSpot, Salesforce, Pipedrive, intégrations et automatisations clés.",
    'email-marketing-guide-complet.html': "Email marketing 2026 : segmentation, automation, délivrabilité, scoring de leads et benchmarks de taux d'ouverture par secteur.",
    'identite-visuelle-creer-guide.html': "Créer une identité visuelle forte et mémorable : recherche, moodboard, conception, déclinaison et règles de cohérence.",
    'influence-marketing-guide-complet.html': "Influence marketing : sélection de créateurs, briefs, contrats, mesure de performance et alternatives micro-influence.",
    'marketing-automation-sequences.html': "Sequences de marketing automation gagnantes : trigger emails, nurturing, scoring, segmentation comportementale et retargeting.",
    'montage-video-outils-techniques.html': "Montage vidéo professionnel : choix logiciel, workflow, étalonnage, sound design et exportation multi-plateforme.",
    'motion-design-marketing-guide.html': "Motion design pour le marketing : briefing, storyboard, animation, sound design et déclinaison sociale.",
    'strategie-editoriale-construire.html': "Construire une stratégie éditoriale alignée business : piliers, formats, calendrier, gouvernance et mesure d'impact.",
    'strategie-social-media-2026.html': "Stratégie social media 2026 : choix des plateformes, formats vidéo dominants, IA générative et mesure du ROI organique.",
    'taux-ouverture-email-ameliorer.html': "Améliorer le taux d'ouverture email : objets, preheaders, segmentation, expéditeur, délivrabilité et tests A/B.",
    'tendances-design-graphique-2026.html': "Tendances design graphique 2026 : maximalisme, brutalism, motion native, palettes et typographies variables.",
    'video-corporate-reussir.html': "Réussir votre vidéo corporate : message, formats, script, tournage, montage et diffusion multi-canal.",
    'video-reseaux-sociaux-formats.html': "Formats vidéo réseaux sociaux 2026 : ratios, durées, hooks, sous-titres et bonnes pratiques par plateforme.",
}

DESC_RE = re.compile(r'(<meta name="description" content=")[^"]+(")')
OG_RE = re.compile(r'(<meta property="og:description" content=")[^"]+(")')

changed = 0
for filename, new_desc in MAPPING.items():
    path = ROOT / 'guides' / filename
    if not path.exists():
        print(f"[MISS] {path}")
        continue
    text = path.read_text(encoding='utf-8', errors='ignore')
    if DUP_DESC not in text:
        continue  # idempotent
    text2 = DESC_RE.sub(rf'\g<1>{new_desc}\g<2>', text, count=1)
    text2 = OG_RE.sub(rf'\g<1>{new_desc}\g<2>', text2, count=1)
    if text2 != text:
        path.write_text(text2, encoding='utf-8')
        changed += 1
        print(f"OK  {filename}")

print(f"\nGuides mis a jour: {changed}")
