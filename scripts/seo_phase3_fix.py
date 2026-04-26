"""
Phase 3 SEO: fix remaining canonical/OG/JSON-LD/Twitter Card gaps on public pages.

- Adds canonical to 11 public pages missing it (derived from URL pattern)
- Enriches 6 main EN pages (blog index, guides index, services, careers, reviews, book-a-call)
- Adds Twitter Card to all pages that have OG but no Twitter (mirror og:* -> twitter:*)
- Reports H1 issues for manual review
"""
from pathlib import Path
import re
import os
import html
import json

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = "https://www.pirabellabs.com"
OG_IMAGE = f"{ORIGIN}/img/og-image.png"
LOGO = f"{ORIGIN}/img/logo.png"
TODAY = "2026-04-26"
os.chdir(ROOT)

TITLE_RE = re.compile(r"<title>([^<]*)</title>", re.I)
DESC_RE = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.I)
CANON_RE = re.compile(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', re.I)
OG_TITLE_RE = re.compile(r'<meta\s+property=["\']og:title["\']\s+content=["\']([^"\']*)["\']', re.I)
OG_DESC_RE = re.compile(r'<meta\s+property=["\']og:description["\']\s+content=["\']([^"\']*)["\']', re.I)
OG_IMG_RE = re.compile(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']*)["\']', re.I)
H1_RE = re.compile(r"<h1[\s>]", re.I)


# ---------- Step 1: missing canonicals ----------

CANONICAL_FIXES = {
    "agence-video-motion-design/index.html": f"{ORIGIN}/agence-video-motion-design/",
    "agence-redaction-content-marketing/index.html": f"{ORIGIN}/agence-redaction-content-marketing/",
    "agence-sales-funnels-cro/index.html": f"{ORIGIN}/agence-sales-funnels-cro/",
    "agence-social-media/index.html": f"{ORIGIN}/agence-social-media/",
    "agence-publicite-payante-sea-ads/index.html": f"{ORIGIN}/agence-publicite-payante-sea-ads/",
    "agence-email-marketing-crm/index.html": f"{ORIGIN}/agence-email-marketing-crm/",
    "agence-design-branding/index.html": f"{ORIGIN}/agence-design-branding/",
    "agence-creation-sites-web/index.html": f"{ORIGIN}/agence-creation-sites-web/",
    "agence-ia-automatisation/index.html": f"{ORIGIN}/agence-ia-automatisation/",
    "agence-seo-referencement-naturel/index.html": f"{ORIGIN}/agence-seo-referencement-naturel/",
    "resultats.html": f"{ORIGIN}/resultats",
    "en/book-a-call.html": f"{ORIGIN}/en/book-a-call",
    "en/results.html": f"{ORIGIN}/en/results",
    "en/careers.html": f"{ORIGIN}/en/careers",
    "en/reviews.html": f"{ORIGIN}/en/reviews",
}


def add_canonical(rel_path: str, canonical: str) -> str:
    p = Path(rel_path)
    if not p.exists():
        return f"NOT_FOUND: {rel_path}"
    content = p.read_text(encoding="utf-8")
    if CANON_RE.search(content):
        return "skipped (already has canonical)"
    if "</head>" not in content:
        return "no </head>"
    tag = f'<link rel="canonical" href="{canonical}">\n'
    new = content.replace("</head>", tag + "</head>", 1)
    p.write_text(new, encoding="utf-8")
    return "OK"


# ---------- Step 2: enrich 6 main EN pages ----------

EN_MAIN_PAGES = {
    "en/blog/index.html":   {"section": "Blog", "url": f"{ORIGIN}/en/blog",       "fr_alt": f"{ORIGIN}/blog"},
    "en/guides/index.html": {"section": "Guides", "url": f"{ORIGIN}/en/guides",   "fr_alt": None},
    "en/services.html":     {"section": "Services", "url": f"{ORIGIN}/en/services", "fr_alt": f"{ORIGIN}/services"},
    "en/careers.html":      {"section": "Careers", "url": f"{ORIGIN}/en/careers",   "fr_alt": f"{ORIGIN}/carrieres"},
    "en/reviews.html":      {"section": "Reviews", "url": f"{ORIGIN}/en/reviews",   "fr_alt": f"{ORIGIN}/avis"},
    "en/book-a-call.html":  {"section": "Book a Call", "url": f"{ORIGIN}/en/book-a-call", "fr_alt": f"{ORIGIN}/rendez-vous"},
}


def enrich_main_page(rel_path: str, meta: dict) -> str:
    p = Path(rel_path)
    if not p.exists():
        return "NOT_FOUND"
    content = p.read_text(encoding="utf-8")

    title_m = TITLE_RE.search(content)
    desc_m = DESC_RE.search(content)
    if not title_m or not desc_m:
        return f"missing title/desc (title={bool(title_m)}, desc={bool(desc_m)})"

    title = html.unescape(title_m.group(1)).strip()
    desc = html.unescape(desc_m.group(1)).strip()
    canonical = meta["url"]
    fr_alt = meta["fr_alt"]

    fragments = []

    if not CANON_RE.search(content):
        fragments.append(f'<link rel="canonical" href="{canonical}">')
    if "hreflang" not in content:
        fragments.append(f'<link rel="alternate" hreflang="en" href="{canonical}">')
        if fr_alt:
            fragments.append(f'<link rel="alternate" hreflang="fr" href="{fr_alt}">')
        fragments.append(f'<link rel="alternate" hreflang="x-default" href="{canonical}">')
    if "og:title" not in content:
        fragments.append("<!-- SEO: OpenGraph -->")
        fragments.append(f'<meta property="og:title" content="{html.escape(title, quote=True)}">')
        fragments.append(f'<meta property="og:description" content="{html.escape(desc, quote=True)}">')
        fragments.append('<meta property="og:type" content="website">')
        fragments.append(f'<meta property="og:url" content="{canonical}">')
        fragments.append('<meta property="og:site_name" content="Pirabel Labs">')
        fragments.append(f'<meta property="og:image" content="{OG_IMAGE}">')
        fragments.append('<meta property="og:locale" content="en_US">')
    if "twitter:card" not in content:
        fragments.append('<meta name="twitter:card" content="summary_large_image">')
        fragments.append(f'<meta name="twitter:title" content="{html.escape(title, quote=True)}">')
        fragments.append(f'<meta name="twitter:description" content="{html.escape(desc, quote=True)}">')
        fragments.append(f'<meta name="twitter:image" content="{OG_IMAGE}">')
    if "application/ld+json" not in content:
        schema = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": title,
            "description": desc,
            "url": canonical,
            "inLanguage": "en",
            "isPartOf": {
                "@type": "WebSite",
                "name": "Pirabel Labs",
                "url": ORIGIN,
            },
            "publisher": {
                "@type": "Organization",
                "name": "Pirabel Labs",
                "url": ORIGIN,
                "logo": {"@type": "ImageObject", "url": LOGO},
            },
        }
        fragments.append("<script type=\"application/ld+json\">")
        fragments.append(json.dumps(schema, ensure_ascii=False, indent=2))
        fragments.append("</script>")

    if not fragments:
        return "skipped (already complete)"

    block = "\n".join(fragments) + "\n"
    if "</head>" not in content:
        return "no </head>"
    new = content.replace("</head>", block + "</head>", 1)
    p.write_text(new, encoding="utf-8")
    return "OK"


# ---------- Step 3: Twitter Card mirror ----------

def add_twitter_card(rel_path: str) -> str:
    p = Path(rel_path)
    content = p.read_text(encoding="utf-8")
    if "twitter:card" in content:
        return "skipped (already has)"
    og_t = OG_TITLE_RE.search(content)
    og_d = OG_DESC_RE.search(content)
    og_i = OG_IMG_RE.search(content)
    if not og_t:
        return "skipped (no og:title)"

    title = og_t.group(1)
    desc = og_d.group(1) if og_d else ""
    img = og_i.group(1) if og_i else OG_IMAGE

    fragments = [
        '<meta name="twitter:card" content="summary_large_image">',
        f'<meta name="twitter:title" content="{title}">',
    ]
    if desc:
        fragments.append(f'<meta name="twitter:description" content="{desc}">')
    fragments.append(f'<meta name="twitter:image" content="{img}">')
    block = "\n".join(fragments) + "\n"

    if "</head>" not in content:
        return "no </head>"
    new = content.replace("</head>", block + "</head>", 1)
    p.write_text(new, encoding="utf-8")
    return "OK"


# ---------- Step 4: detect H1 issues (report only) ----------

def report_h1_issues(rel_paths):
    for rp in rel_paths:
        p = Path(rp)
        if not p.exists():
            continue
        n = len(H1_RE.findall(p.read_text(encoding="utf-8")))
        print(f"  {rp}: {n} H1 tags")


# ---------- Run ----------

def main():
    print("=== Step 1: missing canonicals ===")
    for rel, can in CANONICAL_FIXES.items():
        result = add_canonical(rel, can)
        if result != "OK":
            print(f"  {rel}: {result}")
    print(f"  Total files attempted: {sum(1 for r,c in CANONICAL_FIXES.items() if Path(r).exists())}")

    print("\n=== Step 2: enrich 6 main EN pages ===")
    for rel, meta in EN_MAIN_PAGES.items():
        result = enrich_main_page(rel, meta)
        print(f"  {rel}: {result}")

    print("\n=== Step 3: Twitter Card mirror (site-wide) ===")
    SKIP = ('node_modules', 'admin', 'portal', 'client_portal', 'espace-client-4p8w1n',
            'projet claude', 'Projet A', 'scratch', 'pirabel-admin', 'temp_repo')
    counts = {"OK": 0, "skipped": 0, "no_og": 0, "fail": 0}
    for f in Path('.').rglob('*.html'):
        s = str(f).replace(os.sep, '/')
        if any(x in s for x in SKIP):
            continue
        result = add_twitter_card(s)
        if result == "OK":
            counts["OK"] += 1
        elif "no og" in result:
            counts["no_og"] += 1
        elif result.startswith("skipped"):
            counts["skipped"] += 1
        else:
            counts["fail"] += 1
            print(f"  FAIL {s}: {result}")
    print(f"  Twitter Card: OK={counts['OK']} skipped={counts['skipped']} no_og={counts['no_og']} fail={counts['fail']}")

    print("\n=== Step 4: H1 issues report ===")
    report_h1_issues(["avis.html", "en/reviews.html"])


if __name__ == "__main__":
    main()
