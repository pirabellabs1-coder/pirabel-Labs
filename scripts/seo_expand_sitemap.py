"""
Expand sitemap.xml with all current EN blog and guide pages (winners after consolidation).

Replaces the existing "Premium Blog Strategy" and "Premium Guides" sections with the
complete list of files actually on disk in /en/blog/ and /en/guides/.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
SITEMAP = ROOT / "sitemap.xml"
ORIGIN = "https://www.pirabellabs.com"
LASTMOD = "2026-04-26"
BLOG_PRIORITY = "0.7"
GUIDE_PRIORITY = "0.7"
SECTION_ROOT_PRIORITY = "0.8"


def slugs(dir_path: Path):
    out = []
    for f in sorted(dir_path.glob("*.html")):
        slug = f.stem
        if slug == "index":
            continue
        out.append(slug)
    return out


def make_url(loc: str, priority: str) -> str:
    return f'  <url><loc>{loc}</loc><lastmod>{LASTMOD}</lastmod><priority>{priority}</priority></url>'


blog_slugs = slugs(ROOT / "en" / "blog")
guide_slugs = slugs(ROOT / "en" / "guides")
print(f"EN blog winners: {len(blog_slugs)}")
print(f"EN guide winners: {len(guide_slugs)}")

# Build new section content
lines = []
lines.append("  <!-- EN Blog (auto-generated) -->")
lines.append(make_url(f"{ORIGIN}/en/blog", SECTION_ROOT_PRIORITY))
for slug in blog_slugs:
    lines.append(make_url(f"{ORIGIN}/en/blog/{slug}", BLOG_PRIORITY))
lines.append("  <!-- EN Guides (auto-generated) -->")
lines.append(make_url(f"{ORIGIN}/en/guides", SECTION_ROOT_PRIORITY))
for slug in guide_slugs:
    lines.append(make_url(f"{ORIGIN}/en/guides/{slug}", GUIDE_PRIORITY))
new_section = "\n".join(lines)

raw = SITEMAP.read_text(encoding="utf-8")

# Find the existing "Premium Blog Strategy" comment and replace from there to "</urlset>"
# Preserve the /en/book-a-call URL by extracting it first
book_a_call_match = re.search(r'\s*<url><loc>[^<]*/en/book-a-call</loc>[^<]*</url>', raw)
book_a_call_block = book_a_call_match.group(0) if book_a_call_match else ""

# Replace the block from <!-- Premium Blog Strategy --> through </urlset>
pattern = re.compile(r'\s*<!-- Premium Blog Strategy -->.*?</urlset>', re.DOTALL)
replacement = "\n" + new_section
if book_a_call_block.strip():
    replacement += "\n" + book_a_call_block.strip().replace("  <url>", "  <url>")
    replacement = replacement.rstrip()
    replacement += "\n</urlset>"
else:
    replacement += "\n</urlset>"

new_raw = pattern.sub(replacement, raw, count=1)

if new_raw == raw:
    raise RuntimeError("No replacement made — section markers not found")

SITEMAP.write_text(new_raw, encoding="utf-8")

# Verify
import xml.etree.ElementTree as ET
tree = ET.parse(SITEMAP)
root = tree.getroot()
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
total = len(root.findall("sm:url", ns))
print(f"sitemap.xml: now contains {total} URLs (XML valid)")
