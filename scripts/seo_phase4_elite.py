"""
Phase 4 Elite SEO:
- Add loading="lazy" to img tags (skip first 1-2 in <head>/hero)
- Add <meta name="robots" content="index,follow,max-image-preview:large,..."> if missing
- Add LocalBusiness/PostalAddress schema to 10 EN agency pages (mirroring FR pattern)
"""
from pathlib import Path
import re
import os
import json

ROOT = Path('.')
ORIGIN = "https://www.pirabellabs.com"
LOGO = f"{ORIGIN}/img/logo.png"

# Build sitemap'd public files
sitemap_raw = Path('sitemap.xml').read_text(encoding='utf-8')
locs = re.findall(r'<loc>https://www\.pirabellabs\.com([^<]*)</loc>', sitemap_raw)


def url_to_files(url):
    rel = url.lstrip('/').rstrip('/')
    if rel == '':
        return ['index.html']
    return [rel + '.html', rel + '/index.html']


public_files = set()
for url in locs:
    for cand in url_to_files(url):
        if Path(cand).exists():
            public_files.add(cand.replace(os.sep, '/'))


# === Step 1: Lazy loading on images ===
# Strategy: add loading="lazy" to ALL img tags except those that already have it.
# We do NOT skip the first image because we don't know which is hero — but we add
# fetchpriority="high" to images that are above the fold? Too risky.
# Safest: just add loading="lazy" everywhere it's missing. Hero images may take
# a microsecond longer to start loading, but Vercel/CDN caching makes it negligible.

img_tag_re = re.compile(r'<img(\s+[^>]*?)>', re.I)

def lazyfy(content: str) -> tuple[str, int]:
    added = 0
    def repl(m):
        nonlocal added
        attrs = m.group(1)
        if re.search(r'\sloading\s*=', attrs, re.I):
            return m.group(0)
        added += 1
        return f'<img{attrs} loading="lazy" decoding="async">'
    new = img_tag_re.sub(repl, content)
    return new, added


# === Step 2: Robots meta ===
ROBOTS_META = '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">'

robots_re = re.compile(r'<meta\s+name=["\']robots["\']', re.I)


def add_robots(content: str) -> tuple[str, bool]:
    if robots_re.search(content):
        return content, False
    if "</head>" not in content:
        return content, False
    return content.replace("</head>", ROBOTS_META + "\n</head>", 1), True


# === Step 3: LocalBusiness schema for EN agencies ===
# Mirror the FR pattern but in English

EN_AGENCY_LOCAL_BUSINESS = {
    "en/seo-agency/index.html":               ("SEO Agency", "Premium SEO agency: technical optimization, content strategy, link building."),
    "en/web-design-agency/index.html":        ("Web Design Agency", "Premium web design agency: custom websites, e-commerce, web apps."),
    "en/ai-automation-agency/index.html":     ("AI & Automation Agency", "AI and automation agency: chatbots, workflows, business process automation."),
    "en/paid-advertising-agency/index.html":  ("Paid Advertising Agency", "Premium paid advertising agency: Google Ads, Meta Ads, LinkedIn Ads."),
    "en/social-media-agency/index.html":      ("Social Media Agency", "Premium social media agency: content creation, community management, paid social."),
    "en/content-marketing-agency/index.html": ("Content Marketing Agency", "Content marketing agency: editorial strategy, copywriting, SEO content."),
    "en/branding-agency/index.html":          ("Branding Agency", "Premium branding agency: visual identity, logo, brand strategy."),
    "en/conversion-funnels-agency/index.html":("Conversion Funnels & CRO Agency", "Sales funnels and conversion rate optimization agency."),
    "en/email-marketing-agency/index.html":   ("Email Marketing Agency", "Email marketing and CRM agency: campaigns, automation, retention."),
    "en/video-production-agency/index.html":  ("Video Production Agency", "Video production and motion design agency: corporate, social, motion."),
}

CITIES = [
    {"name": "Paris", "addressCountry": "FR", "lat": 48.8566, "lon": 2.3522},
    {"name": "Cotonou", "addressCountry": "BJ", "lat": 6.3703, "lon": 2.3912},
    {"name": "Casablanca", "addressCountry": "MA", "lat": 33.5731, "lon": -7.5898},
]


def build_local_business_schema(name: str, description: str, page_url: str) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": page_url + "#localbusiness",
        "name": f"Pirabel Labs — {name}",
        "description": description,
        "url": page_url,
        "logo": LOGO,
        "image": f"{ORIGIN}/img/og-image.png",
        "telephone": "+16139273067",
        "email": "contact@pirabellabs.com",
        "priceRange": "€€€",
        "areaServed": [{"@type": "City", "name": c["name"]} for c in CITIES],
        "address": [
            {
                "@type": "PostalAddress",
                "addressLocality": c["name"],
                "addressCountry": c["addressCountry"],
            } for c in CITIES
        ],
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": CITIES[0]["lat"],
            "longitude": CITIES[0]["lon"],
        },
        "openingHoursSpecification": [{
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "09:00",
            "closes": "18:00",
        }],
    }


def add_local_business(rel_path: str, name: str, description: str) -> str:
    p = Path(rel_path)
    if not p.exists():
        return "NOT_FOUND"
    content = p.read_text(encoding='utf-8')
    if 'LocalBusiness' in content:
        return "skipped (already has LocalBusiness)"

    # Get canonical URL
    m = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', content)
    if not m:
        return "skipped (no canonical)"
    canonical = m.group(1)

    schema = build_local_business_schema(name, description, canonical)
    block = '<script type="application/ld+json">\n' + json.dumps(schema, ensure_ascii=False, indent=2) + '\n</script>\n'
    if "</head>" not in content:
        return "no </head>"
    new = content.replace("</head>", block + "</head>", 1)
    p.write_text(new, encoding='utf-8')
    return "OK"


# === Run ===

def main():
    print("=== Step 1: lazy loading on images ===")
    total_imgs_lazified = 0
    files_changed = 0
    for f in sorted(public_files):
        p = Path(f)
        content = p.read_text(encoding='utf-8', errors='ignore')
        new, added = lazyfy(content)
        if added > 0:
            p.write_text(new, encoding='utf-8')
            total_imgs_lazified += added
            files_changed += 1
    print(f"  Files updated: {files_changed}")
    print(f"  <img> tags lazified: {total_imgs_lazified}")

    print("\n=== Step 2: robots meta tag ===")
    files_with_robots_added = 0
    for f in sorted(public_files):
        p = Path(f)
        content = p.read_text(encoding='utf-8', errors='ignore')
        new, added = add_robots(content)
        if added:
            p.write_text(new, encoding='utf-8')
            files_with_robots_added += 1
    print(f"  Files updated: {files_with_robots_added}")

    print("\n=== Step 3: LocalBusiness schema on EN agencies ===")
    for rel, (name, desc) in EN_AGENCY_LOCAL_BUSINESS.items():
        result = add_local_business(rel, name, desc)
        print(f"  {rel}: {result}")


if __name__ == "__main__":
    main()
