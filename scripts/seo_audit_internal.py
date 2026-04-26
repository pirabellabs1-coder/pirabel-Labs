"""Find internal links pointing to deleted (loser) pages."""
from pathlib import Path

DELETED_BLOG = [
    'ai-chatbot-customer-service-guide', 'ai-marketing-trends', 'branding-visual-identity-guide',
    'complete-seo-guide-2026', 'seo-guide-2026', 'content-strategy-2026', 'core-web-vitals-guide',
    'core-web-vitals-performance-optimization', 'cro-optimization-complete-guide', 'ecommerce-copywriting',
    'ecommerce-copywriting-techniques', 'email-marketing-guide', 'email-marketing-complete-guide',
    'ga4-guide-for-beginners', 'linkedin-marketing-b2b-complete-guide', 'local-seo-guide',
    'local-seo-guide-sme', 'sales-funnel-strategy-guide', 'social-strategy-2026', 'tiktok-marketing-2026',
    'ux-trends-2026', 'video-marketing-strategy-guide-2026', 'wordpress-vs-shopify-2026-comparison',
    'online-advertising-google-meta-guide', 'automation-tools-guide', 'netlinking-backlinks-seo-strategy',
    'professional-website-creation-steps'
]
DELETED_GUIDES = [
    'ab-testing-mastery', 'complete-ab-testing-guide', 'advanced-retargeting',
    'ai-chatbot-for-business-guide', 'ai-marketing-agents-use-cases', 'automation-sequences',
    'building-editorial-strategy', 'community-management-best-practices', 'copywriting-techniques',
    'core-web-vitals-optimization', 'core-web-vitals-performance', 'corporate-video-success-guide',
    'ecommerce-copywriting', 'e-commerce-copywriting-techniques', 'email-marketing-mastery',
    'complete-email-marketing-guide', 'email-open-rates-mastery', 'improve-email-open-rates',
    'ga4-mastery', 'ga4-guide-for-beginners', 'google-ads-guide-for-beginners',
    'how-to-create-high-performance-website', 'influence-marketing-complete-guide', 'landing-page-mastery',
    'perfect-landing-page-guide', 'local-seo-mastery', 'make-vs-zapier-comparison', 'motion-design-guide',
    'optimize-ad-budget', 'seo-guide-for-beginners', 'social-media-editorial-calendar-guide',
    'social-video-formats', 'ux-design-conversion-principles', 'ux-design-2026',
    'branding-startup-guide', 'video-tools-guide', 'core-elements-visual-identity',
    'visual-identity-core', 'website-cost-guide', 'webflow-vs-wordpress-comparison',
    'choosing-configuring-crm-guide', 'create-optimize-sales-funnels', 'social-media-strategy-2026',
]

SKIP = ('node_modules', 'admin', 'portal', 'client_portal', 'espace-client-4p8w1n',
        'projet claude', 'Projet A', 'scratch', 'pirabel-admin', 'temp_repo')

ROOT = Path('.')
hits = {}
for f in ROOT.rglob('*.html'):
    s = str(f).replace('\\', '/')
    if any(x in s for x in SKIP):
        continue
    content = f.read_text(encoding='utf-8', errors='ignore')
    found = []
    for slug in DELETED_BLOG:
        markers = [f'/en/blog/{slug}"', f'/en/blog/{slug}\'', f'/en/blog/{slug}<', f'"{slug}.html"']
        for m in markers:
            if m in content:
                found.append(f'blog/{slug}')
                break
    for slug in DELETED_GUIDES:
        markers = [f'/en/guides/{slug}"', f'/en/guides/{slug}\'', f'/en/guides/{slug}<', f'"{slug}.html"']
        for m in markers:
            if m in content:
                found.append(f'guides/{slug}')
                break
    if found:
        hits[s] = sorted(set(found))

print(f"Files containing links to deleted pages: {len(hits)}")
total_refs = sum(len(v) for v in hits.values())
print(f"Total broken internal references: {total_refs}")
print()
for path, slugs in list(hits.items())[:20]:
    print(f"  {path}: {len(slugs)} refs")
    for s in slugs[:5]:
        print(f"    - {s}")
    if len(slugs) > 5:
        print(f"    ... and {len(slugs)-5} more")
