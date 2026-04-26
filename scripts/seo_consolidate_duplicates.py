"""
SEO consolidation: remove duplicate EN blog/guide pages, add 301 redirects, clean sitemap.

One-shot script. Idempotent-ish: file deletions are not reversible from this script,
but vercel.json mutations skip already-present rules.
"""
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)

# loser_path (URL path) -> final_winner_url (URL path, no chain)
REDIRECTS = {
    # --- EN BLOG losers ---
    "/en/blog/ai-chatbot-customer-service-guide": "/en/blog/ai-chatbot-customer-service",
    "/en/blog/ai-marketing-trends": "/en/blog/ai-marketing-trends-2026",
    "/en/blog/branding-visual-identity-guide": "/en/blog/branding-visual-identity",
    "/en/blog/complete-seo-guide-2026": "/en/blog/complete-seo-guide",
    "/en/blog/seo-guide-2026": "/en/blog/complete-seo-guide",
    "/en/blog/content-strategy-2026": "/en/blog/content-marketing-strategy-2026",
    "/en/blog/core-web-vitals-guide": "/en/guides/core-web-vitals-guide",
    "/en/blog/core-web-vitals-performance-optimization": "/en/guides/core-web-vitals-guide",
    "/en/blog/cro-optimization-complete-guide": "/en/blog/cro-guide",
    "/en/blog/ecommerce-copywriting": "/en/guides/ecommerce-copywriting-guide",
    "/en/blog/ecommerce-copywriting-techniques": "/en/guides/ecommerce-copywriting-guide",
    "/en/blog/email-marketing-guide": "/en/guides/email-marketing-guide",
    "/en/blog/email-marketing-complete-guide": "/en/guides/email-marketing-guide",
    "/en/blog/ga4-guide-for-beginners": "/en/blog/ga4-basics",
    "/en/blog/linkedin-marketing-b2b-complete-guide": "/en/blog/linkedin-b2b-marketing",
    "/en/blog/local-seo-guide": "/en/guides/local-seo-guide",
    "/en/blog/local-seo-guide-sme": "/en/guides/local-seo-guide",
    "/en/blog/sales-funnel-strategy-guide": "/en/blog/sales-funnel-strategy",
    "/en/blog/social-strategy-2026": "/en/blog/social-media-strategy-2026",
    "/en/blog/tiktok-marketing-2026": "/en/blog/tiktok-marketing-strategies-2026",
    "/en/blog/ux-trends-2026": "/en/blog/ux-design-trends-2026",
    "/en/blog/video-marketing-strategy-guide-2026": "/en/blog/video-marketing-strategy",
    "/en/blog/wordpress-vs-shopify-2026-comparison": "/en/blog/wordpress-vs-shopify",
    "/en/blog/online-advertising-google-meta-guide": "/en/blog/ads-google-meta-guide",
    "/en/blog/automation-tools-guide": "/en/blog/marketing-automation-tools-guide",
    "/en/blog/netlinking-backlinks-seo-strategy": "/en/blog/link-building-strategy",
    "/en/blog/professional-website-creation-steps": "/en/blog/website-creation-guide",

    # --- EN GUIDES losers (intra-section) ---
    "/en/guides/ab-testing-mastery": "/en/guides/ab-testing-guide",
    "/en/guides/complete-ab-testing-guide": "/en/guides/ab-testing-guide",
    "/en/guides/advanced-retargeting": "/en/guides/advanced-retargeting-strategies",
    "/en/guides/ai-chatbot-for-business-guide": "/en/guides/ai-chatbot-guide",
    "/en/guides/ai-marketing-agents-use-cases": "/en/guides/ai-marketing-agents",
    "/en/guides/automation-sequences": "/en/guides/marketing-automation-sequences",
    "/en/guides/building-editorial-strategy": "/en/guides/editorial-strategy",
    "/en/guides/community-management-best-practices": "/en/guides/community-management",
    "/en/guides/copywriting-techniques": "/en/guides/copywriting-guide",
    "/en/guides/core-web-vitals-optimization": "/en/guides/core-web-vitals-guide",
    "/en/guides/core-web-vitals-performance": "/en/guides/core-web-vitals-guide",
    "/en/guides/corporate-video-success-guide": "/en/guides/corporate-video-guide",
    "/en/guides/ecommerce-copywriting": "/en/guides/ecommerce-copywriting-guide",
    "/en/guides/e-commerce-copywriting-techniques": "/en/guides/ecommerce-copywriting-guide",
    "/en/guides/email-marketing-mastery": "/en/guides/email-marketing-guide",
    "/en/guides/complete-email-marketing-guide": "/en/guides/email-marketing-guide",
    "/en/guides/email-open-rates-mastery": "/en/guides/email-open-rates-guide",
    "/en/guides/improve-email-open-rates": "/en/guides/email-open-rates-guide",
    "/en/guides/ga4-mastery": "/en/guides/ga4-guide",
    "/en/guides/ga4-guide-for-beginners": "/en/guides/ga4-guide",
    "/en/guides/google-ads-guide-for-beginners": "/en/guides/google-ads-guide",
    "/en/guides/how-to-create-high-performance-website": "/en/guides/high-performance-website",
    "/en/guides/influence-marketing-complete-guide": "/en/guides/influencer-marketing-guide",
    "/en/guides/landing-page-mastery": "/en/guides/landing-page-guide",
    "/en/guides/perfect-landing-page-guide": "/en/guides/landing-page-guide",
    "/en/guides/local-seo-mastery": "/en/guides/local-seo-guide",
    "/en/guides/make-vs-zapier-comparison": "/en/guides/make-vs-zapier",
    "/en/guides/motion-design-guide": "/en/guides/motion-design-marketing-guide",
    "/en/guides/optimize-ad-budget": "/en/guides/ad-budget-optimization",
    "/en/guides/seo-guide-for-beginners": "/en/guides/seo-basics",
    "/en/guides/social-media-editorial-calendar-guide": "/en/guides/social-media-calendar",
    "/en/guides/social-video-formats": "/en/guides/social-media-video-formats-guide",
    "/en/guides/ux-design-conversion-principles": "/en/guides/ux-conversion-guide",
    "/en/guides/ux-design-2026": "/en/blog/ux-design-trends-2026",
    "/en/guides/ux-design-trends-2026": "/en/blog/ux-design-trends-2026",
    "/en/guides/ux-trends-2026": "/en/blog/ux-design-trends-2026",
    "/en/guides/branding-startup-guide": "/en/guides/startup-branding",
    "/en/guides/video-tools-guide": "/en/guides/video-editing-tools-guide",
    "/en/guides/core-elements-visual-identity": "/en/guides/visual-identity-guide",
    "/en/guides/visual-identity-core": "/en/guides/visual-identity-guide",
    "/en/guides/website-cost-guide": "/en/guides/website-pricing-guide",
    "/en/guides/webflow-vs-wordpress-comparison": "/en/guides/webflow-vs-wordpress",
    "/en/guides/choosing-configuring-crm-guide": "/en/guides/crm-guide",
    "/en/guides/create-optimize-sales-funnels": "/en/guides/sales-funnel-guide",
    "/en/guides/social-media-strategy-2026": "/en/blog/social-media-strategy-2026",
}

ORIGIN = "https://www.pirabellabs.com"


def loser_to_filepath(url_path: str) -> Path:
    rel = url_path.lstrip("/") + ".html"
    return ROOT / rel


def update_vercel_json():
    p = ROOT / "vercel.json"
    raw = p.read_text(encoding="utf-8")
    cfg = json.loads(raw)
    routes = cfg["routes"]

    # Build new redirect rules, skip ones already present
    existing_srcs = {r.get("src") for r in routes}
    new_rules = []
    for src_path, dest_path in REDIRECTS.items():
        if src_path in existing_srcs:
            continue
        new_rules.append({
            "src": src_path,
            "headers": {"Location": dest_path},
            "status": 301,
        })

    if not new_rules:
        print("vercel.json: all redirects already present")
        return 0

    # Insertion point: just before the first /en/blog or /en/guides catch-all dest route
    insert_idx = None
    for i, r in enumerate(routes):
        src = r.get("src", "")
        if src.startswith("/en/guides/([^/]+)") or src.startswith("/en/blog/([^/]+)"):
            insert_idx = i
            break
    if insert_idx is None:
        # fallback: before "filesystem" handler
        for i, r in enumerate(routes):
            if r.get("handle") == "filesystem":
                insert_idx = i
                break
    if insert_idx is None:
        raise RuntimeError("Could not find insertion point in vercel.json routes")

    cfg["routes"] = routes[:insert_idx] + new_rules + routes[insert_idx:]
    p.write_text(json.dumps(cfg, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"vercel.json: inserted {len(new_rules)} redirects at index {insert_idx}")
    return len(new_rules)


def delete_loser_files():
    deleted = []
    missing = []
    for src_path in REDIRECTS:
        f = loser_to_filepath(src_path)
        if f.exists():
            f.unlink()
            deleted.append(str(f.relative_to(ROOT)))
        else:
            missing.append(str(f.relative_to(ROOT)))
    print(f"Deleted {len(deleted)} files, {len(missing)} already absent")
    if missing:
        for m in missing:
            print(f"  missing: {m}")
    return deleted, missing


def clean_sitemap():
    p = ROOT / "sitemap.xml"
    raw = p.read_text(encoding="utf-8")

    loser_urls = {ORIGIN + path for path in REDIRECTS}
    # Match a <url>...</url> block (multiline), check if it contains any loser URL
    pattern = re.compile(r"\s*<url>.*?</url>", re.DOTALL)
    removed = 0
    def repl(m):
        nonlocal removed
        block = m.group(0)
        for u in loser_urls:
            if f"<loc>{u}</loc>" in block:
                removed += 1
                return ""
        return block
    new_raw = pattern.sub(repl, raw)
    p.write_text(new_raw, encoding="utf-8")
    print(f"sitemap.xml: removed {removed} URL entries")
    return removed


def main():
    print(f"Total redirects to apply: {len(REDIRECTS)}")
    update_vercel_json()
    delete_loser_files()
    clean_sitemap()
    print("Done.")


if __name__ == "__main__":
    main()
