#!/usr/bin/env python3
"""SEO Lens : descriptions enrichies pour les 54 pages formations qui restaient
avec une meta description trop courte (<120 chars).

Strategie :
- Chaque page formation a une description sur-mesure (130-160 chars)
- Cite "Pirabel Labs" (E-E-A-T + brand)
- Reformule la promesse de la formation (lecture title/h1/short)
- Inclut un CTA implicite : "formation gratuite", "certification", "inscription"
- FR et EN traites separement avec leurs propres copies

Idempotent : reexecution = no-op si la description courante est deja la nouvelle.

Usage :
    python scripts/seo_lens_descs.py            # applique les fixes
    python scripts/seo_lens_descs.py --dry-run  # affiche AVANT/APRES sans ecrire
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP = {'.git', 'node_modules', 'api', 'app', 'Projet A', 'projet claude B', 'scripts', 'scratch'}

# Descriptions enrichies FR : 130-160 chars, reformulent la promesse + CTA implicite
DESCS_FR: dict[str, str] = {
    'agents-ia-chatbots-entreprise': "Formation gratuite Pirabel Labs : maitrisez agents IA, chatbots RAG, OpenAI/Claude API, Make/n8n. Certification + projet pratique. Inscription en 30s.",
    'branding-identite-visuelle': "Formation branding gratuite Pirabel Labs : positionnement, naming, logo, charte, declinaisons. Construisez une marque memorable. Certification incluse.",
    'copywriting-persuasif': "Formation copywriting gratuite Pirabel Labs : frameworks AIDA, PAS, BAB, FAB, headlines, CTAs, landing pages, emails de vente. Certification offerte.",
    'cro-conversion-optimization': "Formation CRO gratuite Pirabel Labs : hypotheses, A/B tests, VWO, heatmaps, user testing, psychologie. Multipliez vos conversions. Inscription gratuite.",
    'email-marketing-complet': "Formation email marketing gratuite Pirabel Labs : SPF/DKIM/DMARC, segmentation RFM, nurturing, design, A/B tests, KPIs. Certification incluse.",
    'ga4-google-analytics-mastery': "Formation GA4 gratuite Pirabel Labs : setup, events, conversions, audiences, attribution, BigQuery, Looker Studio. Devenez expert analytics. Certificat.",
    'google-ads-debutant': "Formation Google Ads gratuite Pirabel Labs : Search, Display, YouTube, Shopping. Structure compte, mots-cles, creas, budget, tracking. Certificat offert.",
    'ia-generative-marketing': "Formation IA generative gratuite Pirabel Labs : prompting avance, contenu, visuels, voix, video, workflows. Productivite x10. Certification offerte.",
    'inbound-marketing-complet': "Formation inbound marketing gratuite Pirabel Labs (methode HubSpot) : lead magnets, nurturing, marketing automation, scoring. Certificat inclus.",
    'linkedin-b2b-personal-branding': "Formation LinkedIn B2B gratuite Pirabel Labs : profil, contenu viral, inbound B2B, networking, Sales Navigator, Lead Gen. Devenez expert. Certificat.",
    'marketing-digital-fondamentaux': "Formation marketing digital gratuite Pirabel Labs : persona, funnel, SEO, ads, social, email, analytics. Vue globale + execution. Certificat inclus.",
    'marketing-digital-strategie-avancee': "Formation marketing avance gratuite Pirabel Labs : AARRR, ICE, RICE, North Star, growth loops, attribution. Devenez strategiste. Certificat offert.",
    'meta-ads-facebook-instagram': "Formation Meta Ads gratuite Pirabel Labs : Pixel, audiences, UGC, retargeting, CBO, Catalog Ads, post-iOS14. Scalez Facebook & Instagram. Certificat.",
    'motion-design-after-effects-marketing': "Formation motion design gratuite Pirabel Labs : After Effects, animation logo, explainer videos, social, transitions, sound design. Certificat inclus.",
    'newsletter-monetisation-creator': "Formation newsletter gratuite Pirabel Labs : Beehiiv, Substack, ConvertKit. Growth, sponsoring, abonnements payants, communaute. Certificat offert.",
    'prompt-engineering-avance': "Formation prompt engineering gratuite Pirabel Labs : few-shot, chain-of-thought, role prompting, structured outputs, eval. Devenez expert. Certificat.",
    'seo-avance': "Formation SEO avancee gratuite Pirabel Labs : crawl, JavaScript rendering, hreflang, structured data, Core Web Vitals, SEO LLM. Certification offerte.",
    'seo-local-google-business': "Formation SEO local gratuite Pirabel Labs : optimisez Google Business, gerez avis, citations locales, dominez le pack local. Certificat inclus.",
    'shopify-marchand-debutant': "Formation Shopify gratuite Pirabel Labs : theme, produits, paiements Mobile Money + Stripe, livraison. De zero a vos premieres ventes. Certificat.",
    'social-media-strategie-complete': "Formation social media gratuite Pirabel Labs : Facebook, Instagram, TikTok, LinkedIn, X. Strategie, calendrier, creas, community, KPIs. Certificat.",
    'tiktok-ads-creator-economy': "Formation TikTok Ads gratuite Pirabel Labs : Ads Manager, creas video natives, Spark Ads, partenariats createurs, mesure. Certification offerte.",
    'ui-design-figma-mastery': "Formation Figma gratuite Pirabel Labs : Auto Layout, components, variants, design system, prototyping, handoff dev. Devenez expert UI. Certificat.",
    'wordpress-intermediaire': "Formation WordPress intermediaire gratuite Pirabel Labs : page builders, ACF, CPT, child themes, performance, securite. Devenez autonome. Certificat.",
    'wordpress-securite-performance': "Formation WordPress securite gratuite Pirabel Labs : bloquez 99% des attaques, optimisez Core Web Vitals, 95+ Lighthouse Mobile. Certificat offert.",
}

# Descriptions enrichies EN : 130-160 chars
DESCS_EN: dict[str, str] = {
    'agents-ia-chatbots-entreprise': "Free Pirabel Labs training: build enterprise AI agents, RAG chatbots, OpenAI/Claude API, Make/n8n. Certificate + hands-on project. Sign up in 30s.",
    'automatisation-make-zapier-n8n': "Free automation training by Pirabel Labs: Make vs Zapier vs n8n, advanced scenarios, integrations, error handling, scaling. Certificate included.",
    'branding-identite-visuelle': "Free branding course by Pirabel Labs: positioning, naming, logo, brand book, multi-format variations. Build a memorable brand. Certificate included.",
    'content-marketing-strategique': "Free content marketing course by Pirabel Labs: personas, pillars, calendar, briefs, production, multi-channel distribution, measurement. Certificate.",
    'copywriting-persuasif': "Free copywriting course by Pirabel Labs: AIDA, PAS, BAB, FAB frameworks, headlines, hooks, CTAs, landing pages, sales emails. Certificate included.",
    'cro-conversion-optimization': "Free CRO training by Pirabel Labs: hypotheses, A/B tests, VWO, heatmaps, user testing, behavioral psychology. Boost conversions. Certificate included.",
    'email-marketing-complet': "Free email marketing course by Pirabel Labs: SPF/DKIM/DMARC, RFM segmentation, nurturing, design, A/B tests, KPIs. Certificate awarded on completion.",
    'ga4-google-analytics-mastery': "Free GA4 training by Pirabel Labs: setup, events, conversions, audiences, attribution, BigQuery, Looker Studio. Master analytics. Certificate included.",
    'google-ads-debutant': "Free Google Ads training by Pirabel Labs: Search, Display, YouTube, Shopping. Account structure, keywords, creatives, budget, tracking. Certificate.",
    'ia-generative-marketing': "Free generative AI training by Pirabel Labs: advanced prompting, content, visuals, voice, video, workflows. Productivity x10. Certificate included.",
    'inbound-marketing-complet': "Free inbound marketing course by Pirabel Labs (HubSpot method): lead magnets, nurturing, marketing automation, scoring. Certificate included.",
    'index': "Pirabel Labs Academy: 30+ free online trainings on SEO, WordPress, Ads, AI, Design, Analytics. Certificates included, real cases, expert mentors.",
    'linkedin-b2b-personal-branding': "Free LinkedIn B2B course by Pirabel Labs: optimized profile, viral content, inbound, networking, Sales Navigator, Lead Gen Forms. Certificate.",
    'marketing-digital-fondamentaux': "Free digital marketing course by Pirabel Labs: persona, funnel, SEO, ads, social, email, analytics. Strategy + execution. Certificate awarded.",
    'marketing-digital-strategie-avancee': "Free advanced marketing course by Pirabel Labs: AARRR, ICE, RICE, North Star, growth loops, attribution. Become a strategist. Certificate included.",
    'meta-ads-facebook-instagram': "Free Meta Ads training by Pirabel Labs: Pixel, audiences, UGC creatives, retargeting, CBO, Catalog Ads, post-iOS14. Scale FB & IG. Certificate.",
    'motion-design-after-effects-marketing': "Free motion design course by Pirabel Labs: After Effects, logo animation, explainer videos, social, transitions, sound design. Certificate awarded.",
    'newsletter-monetisation-creator': "Free newsletter course by Pirabel Labs: Beehiiv, Substack, ConvertKit. Growth, sponsoring, paid subscriptions, community. Certificate included.",
    'prompt-engineering-avance': "Free prompt engineering course by Pirabel Labs: few-shot, chain-of-thought, role prompting, structured outputs, eval. Become expert. Certificate.",
    'redaction-seo-articles-qui-rankent': "Free SEO writing course by Pirabel Labs: intent research, H2/H3 structure, on-page, ideal length, NLP, EEAT. Write articles that rank. Certificate.",
    'seo-avance': "Free advanced SEO course by Pirabel Labs: crawl, JavaScript rendering, hreflang, structured data, Core Web Vitals, SEO for LLMs. Certificate included.",
    'seo-intermediaire': "Free intermediate SEO course by Pirabel Labs: technical audit, advanced on-page, content cluster strategy, link building. Certificate awarded.",
    'seo-local-google-business': "Free local SEO course by Pirabel Labs: optimize Google Business, manage reviews, build citations, dominate the local pack. Certificate included.",
    'shopify-marchand-debutant': "Free Shopify course by Pirabel Labs: theme, products, payments (Mobile Money + Stripe), shipping. From zero to first sales. Certificate included.",
    'social-media-strategie-complete': "Free social media course by Pirabel Labs: Facebook, Instagram, TikTok, LinkedIn, X. Strategy, calendar, creatives, community, KPIs. Certificate.",
    'tiktok-ads-creator-economy': "Free TikTok Ads course by Pirabel Labs: Ads Manager, native video creatives, Spark Ads, creator partnerships, measurement. Certificate included.",
    'ui-design-figma-mastery': "Free Figma UI course by Pirabel Labs: Auto Layout, components, variants, design system, prototyping, dev handoff. Become UI expert. Certificate.",
    'wordpress-debutant': "Free WordPress beginner course by Pirabel Labs: from domain to live site, hosting, theme, essential plugins. Build your first pro site. Certificate.",
    'wordpress-intermediaire': "Free intermediate WordPress course by Pirabel Labs: advanced page builders, ACF, CPT, child themes, performance, security. Certificate included.",
    'wordpress-securite-performance': "Free WordPress security course by Pirabel Labs: stop 99% of attacks, optimize Core Web Vitals, hit 95+ Lighthouse Mobile. Certificate included.",
}

DESC_RE = re.compile(
    r'(<meta\s+name=["\']description["\']\s+content=)(["\'])([^"\']*)\2',
    re.IGNORECASE,
)


def should_skip(p: Path) -> bool:
    return any(s in p.parts for s in SKIP)


def is_en(p: Path) -> bool:
    return 'en' in p.parts


def find_new_desc(p: Path) -> str | None:
    slug = p.stem
    table = DESCS_EN if is_en(p) else DESCS_FR
    return table.get(slug)


def process(dry_run: bool = False) -> list[dict]:
    """Apply fix and return list of {file, before, after, action} dicts."""
    results: list[dict] = []
    for p in ROOT.rglob('*.html'):
        if should_skip(p):
            continue
        try:
            c = p.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            continue
        # Skip noindex pages
        if re.search(r'<meta\s+name=["\']robots["\']\s+content=["\'][^"\']*noindex', c, re.IGNORECASE):
            continue
        m = DESC_RE.search(c)
        if not m:
            continue
        current = m.group(3).strip()
        if len(current) >= 120:
            continue
        new_desc = find_new_desc(p)
        if not new_desc:
            continue
        if new_desc == current:
            continue
        rel = p.relative_to(ROOT).as_posix()
        results.append({
            'file': rel,
            'before': current,
            'before_len': len(current),
            'after': new_desc,
            'after_len': len(new_desc),
        })
        if not dry_run:
            new_c = c.replace(
                m.group(0),
                f'{m.group(1)}{m.group(2)}{new_desc}{m.group(2)}',
                1,
            )
            if new_c != c:
                p.write_text(new_c, encoding='utf-8')
    return results


def main() -> int:
    dry_run = '--dry-run' in sys.argv
    results = process(dry_run=dry_run)
    print(f"[seo_lens_descs] {'DRY RUN ' if dry_run else ''}fixed {len(results)} files")
    print()
    for r in results:
        print(f"--- {r['file']}")
        print(f"  AVANT ({r['before_len']:3}): {r['before']}")
        print(f"  APRES ({r['after_len']:3}): {r['after']}")
        print()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
