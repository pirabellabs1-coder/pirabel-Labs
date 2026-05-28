#!/usr/bin/env python3
"""De-duplique les meta og:description identiques dans en/guides/.

Strategie : extrait le sujet du nom de fichier + genere description specifique.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDES_EN = ROOT / 'en' / 'guides'

# Map slug -> specific description (50-160 chars idéalement)
SPECIFIC_DESC = {
    'email-marketing-guide-complet': 'Master email marketing in 2026 : segmentation, deliverability, automation, KPIs and conversion tactics that actually work.',
    'seo-referencement-naturel-guide-complet-2026': 'Complete 2026 SEO guide : keyword research, on-page, technical SEO, link building and AI-era search optimization.',
    'audit-seo-checklist-complete': 'Step-by-step SEO audit checklist : crawl, indexation, Core Web Vitals, content gaps, backlinks and quick wins.',
    'branding-startup-guide-complet': 'Build your startup brand : positioning, naming, visual identity, voice and brand consistency from day one.',
    'influence-marketing-guide-complet': 'Influencer marketing playbook : creator selection, contracts, briefs, ROI tracking and FTC compliance.',
    'guide-complet-seo-debutant': 'SEO 101 for beginners : core concepts, first audit, on-page basics, keyword research and content optimization.',
    'ab-testing-guide-complet': 'A/B testing playbook : hypothesis, statistical significance, common biases and how to run trustworthy experiments.',
    'articles-seo-rediger-guide': 'How to write SEO articles that rank : search intent, structure, EEAT, internal linking and AI-assisted drafting.',
    'budget-publicitaire-optimiser': 'Optimize your ad budget : attribution models, CAC vs LTV, bid strategies and channel mix for ROI maximization.',
    'calendrier-editorial-social-media': 'Build a social media editorial calendar : content pillars, batching, tools, posting cadence by platform.',
    'charte-graphique-elements-essentiels': 'Essential brand guidelines : logo system, color palette, typography, spacing, voice and brand applications.',
    'chatbot-ia-entreprise-guide': 'AI chatbot deployment for business : use cases, RAG, fine-tuning, integration patterns and ROI measurement.',
    'community-management-bonnes-pratiques': 'Community management best practices : response time, tone, crisis handling, KPIs and platform-specific tactics.',
    'content-marketing-strategie-guide': 'Content marketing strategy : audience research, content pillars, distribution, repurposing and performance KPIs.',
    'copywriting-techniques-conversion': 'Conversion copywriting techniques : headlines, hooks, CTAs, objection handling and proven frameworks (PAS, AIDA).',
    'crm-choisir-configurer-guide': 'Choose and configure your CRM : HubSpot vs Salesforce vs Pipedrive, automation, integrations and team adoption.',
    'identite-visuelle-creer-guide': 'Create a strong visual identity : moodboard, logo iteration, color systems, typography and brand guidelines.',
    'marketing-automation-sequences': 'Marketing automation sequences that convert : welcome flows, abandoned cart, lead nurture and re-engagement.',
    'montage-video-outils-techniques': 'Video editing tools and techniques : Premiere vs DaVinci vs CapCut, color grading, sound design and pacing.',
    'motion-design-marketing-guide': 'Motion design for marketing : Lottie, After Effects basics, ad creatives, social motion and CRO impact.',
    'strategie-editoriale-construire': 'Build an editorial strategy : audience pillars, content matrix, SEO mapping and team workflow.',
    'strategie-social-media-2026': '2026 social media strategy : platform priorities, short-form video, AI tools, community and conversion tactics.',
    'taux-ouverture-email-ameliorer': 'Improve email open rates : subject lines, preview text, sender reputation, list hygiene and timing.',
    'tendances-design-graphique-2026': '2026 graphic design trends : bento layouts, neo-brutalism, AI imagery, motion-first and accessibility.',
    'ux-design-principes-conversion': 'UX design principles for conversion : visual hierarchy, friction reduction, forms UX and mobile-first.',
    'video-corporate-reussir': 'Corporate video done right : scripting, pre-production, B-roll, interview lighting and post-production workflow.',
    'video-reseaux-sociaux-formats': 'Social video formats : 9:16 vs 1:1 vs 16:9, platform specs, hooks, captions and retention tactics.',
    'comment-creer-site-web-performant-2026': 'Build a high-performance website in 2026 : Core Web Vitals, frameworks comparison, SEO foundations.',
    'automatisation-marketing-ia-guide': 'AI marketing automation guide : tool stack, prompt engineering, workflow design and measurable ROI.',
    'taux-conversion-ameliorer': 'Improve your conversion rate : friction audit, A/B testing, social proof, urgency and CRO frameworks.',
    'strategie-netlinking-ethique': 'Ethical link building strategy : guest posting, broken link, digital PR and avoiding Google penalties.',
    'meta-ads-roi-maximiser': 'Maximize Meta Ads ROI : audience targeting, creative testing, attribution, CBO and AAA campaigns.',
    'make-vs-zapier-comparatif': 'Make vs Zapier comparison : pricing, complexity, integrations and which workflow tool suits you.',
    'landing-page-parfaite-guide': 'Build the perfect landing page : above-the-fold, social proof, CTA design and A/B testing checklist.',
}

META_OG_PATTERN = re.compile(
    r'(<meta\s+property="og:description"\s+content=")([^"]+)(")',
    re.IGNORECASE,
)
META_DESC_PATTERN = re.compile(
    r'(<meta\s+name="description"\s+content=")([^"]+)(")',
    re.IGNORECASE,
)
META_TWITTER_PATTERN = re.compile(
    r'(<meta\s+name="twitter:description"\s+content=")([^"]+)(")',
    re.IGNORECASE,
)

count = 0
for slug, desc in SPECIFIC_DESC.items():
    p = GUIDES_EN / f'{slug}.html'
    if not p.exists():
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    new_text = META_OG_PATTERN.sub(rf'\1{desc}\3', text)
    new_text = META_DESC_PATTERN.sub(rf'\1{desc}\3', new_text)
    new_text = META_TWITTER_PATTERN.sub(rf'\1{desc}\3', new_text)
    if new_text != text:
        p.write_text(new_text, encoding='utf-8')
        count += 1

print(f"Guides EN avec meta de-dupliquees: {count}")
