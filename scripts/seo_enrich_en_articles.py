"""
Enrich EN blog/guide articles with hreflang, OpenGraph, Twitter Card, JSON-LD Article + Breadcrumb.

Reads existing <title>, <meta name="description">, and <link rel="canonical"> from each file,
then injects additional metadata before </head>. Skips blocks that already exist (idempotent).
"""
from pathlib import Path
import re
import json
import html
from datetime import date

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = "https://www.pirabellabs.com"
TODAY = "2026-04-26"
OG_IMAGE = f"{ORIGIN}/img/og-image.png"
LOGO = f"{ORIGIN}/img/logo.png"

TITLE_RE = re.compile(r"<title>([^<]*)</title>", re.I)
DESC_RE = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.I)
CANON_RE = re.compile(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']', re.I)


def clean_headline(title: str) -> str:
    """Strip site suffix from title for use in schema headline."""
    # Common patterns:  "Foo | Pirabel Labs", "Foo — Pirabel Labs Blog", "Foo - Pirabel Labs"
    for sep in [" — Pirabel Labs", " | Pirabel Labs", " - Pirabel Labs", " – Pirabel Labs"]:
        idx = title.rfind(sep)
        if idx > 0:
            return title[:idx].strip()
    return title.strip()


def html_attr(s: str) -> str:
    return html.escape(s, quote=True)


def build_block(file_path: Path, section: str, title: str, desc: str, canonical: str) -> str:
    """Generate the metadata block for a given article."""
    headline = clean_headline(title)
    schema_type = "BlogPosting" if section == "blog" else "Article"
    section_label = "Blog" if section == "blog" else "Guides"
    section_url = f"{ORIGIN}/en/{section}"

    # JSON-LD Article
    article_schema = {
        "@context": "https://schema.org",
        "@type": schema_type,
        "headline": headline,
        "description": desc,
        "author": {
            "@type": "Organization",
            "name": "Pirabel Labs",
            "url": ORIGIN,
        },
        "publisher": {
            "@type": "Organization",
            "name": "Pirabel Labs",
            "url": ORIGIN,
            "logo": {"@type": "ImageObject", "url": LOGO},
        },
        "datePublished": TODAY,
        "dateModified": TODAY,
        "image": OG_IMAGE,
        "url": canonical,
        "inLanguage": "en",
        "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
    }

    breadcrumb_schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{ORIGIN}/en"},
            {"@type": "ListItem", "position": 2, "name": section_label, "item": section_url},
            {"@type": "ListItem", "position": 3, "name": headline, "item": canonical},
        ],
    }

    article_json = json.dumps(article_schema, ensure_ascii=False, indent=2)
    breadcrumb_json = json.dumps(breadcrumb_schema, ensure_ascii=False)

    title_attr = html_attr(title)
    desc_attr = html_attr(desc)

    block = f"""<!-- SEO: hreflang -->
<link rel="alternate" hreflang="en" href="{canonical}">
<link rel="alternate" hreflang="x-default" href="{canonical}">
<!-- SEO: OpenGraph -->
<meta property="og:title" content="{title_attr}">
<meta property="og:description" content="{desc_attr}">
<meta property="og:type" content="article">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="Pirabel Labs">
<meta property="og:image" content="{OG_IMAGE}">
<meta property="og:locale" content="en_US">
<!-- SEO: Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title_attr}">
<meta name="twitter:description" content="{desc_attr}">
<meta name="twitter:image" content="{OG_IMAGE}">
<!-- SEO: JSON-LD Article -->
<script type="application/ld+json">
{article_json}
</script>
<!-- SEO: JSON-LD BreadcrumbList -->
<script type="application/ld+json">
{breadcrumb_json}
</script>
"""
    return block


def process_file(f: Path, section: str) -> str:
    content = f.read_text(encoding="utf-8")

    # Skip if already enriched (look for the marker)
    if "og:title" in content and "BlogPosting" in content:
        return "skipped (already has og + BlogPosting)"
    if "og:title" in content and "TechArticle" in content:
        return "skipped (already enriched)"

    # Skip blog/guides index.html (different schema type needed)
    if f.stem == "index":
        return "skipped (index page)"

    title_m = TITLE_RE.search(content)
    desc_m = DESC_RE.search(content)
    canon_m = CANON_RE.search(content)

    if not title_m or not desc_m or not canon_m:
        return f"SKIPPED — missing title/desc/canonical (title={bool(title_m)}, desc={bool(desc_m)}, canon={bool(canon_m)})"

    title = html.unescape(title_m.group(1)).strip()
    desc = html.unescape(desc_m.group(1)).strip()
    canonical = canon_m.group(1).strip()

    block = build_block(f, section, title, desc, canonical)

    if "</head>" not in content:
        return "SKIPPED — no </head>"

    new_content = content.replace("</head>", block + "</head>", 1)
    f.write_text(new_content, encoding="utf-8")
    return "OK"


def main():
    summary = {"blog": {"OK": 0, "skipped": 0, "fail": 0},
               "guides": {"OK": 0, "skipped": 0, "fail": 0}}

    for section in ("blog", "guides"):
        for f in sorted((ROOT / "en" / section).glob("*.html")):
            result = process_file(f, section)
            if result == "OK":
                summary[section]["OK"] += 1
            elif result.startswith("skipped"):
                summary[section]["skipped"] += 1
                print(f"  {f.relative_to(ROOT)}: {result}")
            else:
                summary[section]["fail"] += 1
                print(f"  FAIL {f.relative_to(ROOT)}: {result}")

    print("\n=== Summary ===")
    for section, counts in summary.items():
        print(f"  /en/{section}/: OK={counts['OK']} skipped={counts['skipped']} fail={counts['fail']}")


if __name__ == "__main__":
    main()
