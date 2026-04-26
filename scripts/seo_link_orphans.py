"""
Fix 84 EN article orphans by adding a 'Complete Library' section to en/blog/index.html
and en/guides/index.html that links to ALL articles in the section.

Inserted as a NEW section AFTER the existing curated grid, BEFORE the footer.
Preserves the existing curated cards and design.
"""
from pathlib import Path
import re
import os
import html

ROOT = Path('.')
ORIGIN = "https://www.pirabellabs.com"

TITLE_RE = re.compile(r"<title>([^<]*)</title>", re.I)
DESC_RE = re.compile(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)["\']', re.I)


def clean_title(title: str) -> str:
    for sep in [" — Pirabel Labs", " | Pirabel Labs", " - Pirabel Labs", " – Pirabel Labs"]:
        idx = title.rfind(sep)
        if idx > 0:
            return title[:idx].strip()
    return title.strip()


def get_meta(p: Path):
    content = p.read_text(encoding='utf-8', errors='ignore')
    title_m = TITLE_RE.search(content)
    desc_m = DESC_RE.search(content)
    title = html.unescape(title_m.group(1).strip()) if title_m else p.stem
    desc = html.unescape(desc_m.group(1).strip()) if desc_m else ""
    return clean_title(title), desc


def build_card(slug: str, title: str, desc: str, base_url: str) -> str:
    title_h = html.escape(title)
    # Truncate desc smartly
    if len(desc) > 140:
        desc = desc[:137].rstrip() + "…"
    desc_h = html.escape(desc)
    href = f"{base_url}/{slug}"
    return f"""      <a href="{href}" class="card card--interactive">
        <h3 class="text-h4" style="margin-bottom:1rem;">{title_h}</h3>
        <p style="color:var(--on-surface-variant); font-size:0.95rem;">{desc_h}</p>
        <div style="margin-top:1.5rem; display:flex; align-items:center; gap:0.5rem; color:#FF5500;">
          Read article <span class="material-symbols-outlined">arrow_forward</span>
        </div>
      </a>"""


def build_section(label: str, slug_dir: str, base_url: str, exclude_slugs: set) -> str:
    cards = []
    for f in sorted(Path(slug_dir).glob("*.html")):
        if f.stem == "index":
            continue
        if f.stem in exclude_slugs:
            continue
        title, desc = get_meta(f)
        cards.append(build_card(f.stem, title, desc, base_url))

    if not cards:
        return ""

    return f"""

<!-- COMPLETE {label.upper()} LIBRARY (auto-generated for SEO) -->
<section class="section section--low" id="all-{label.lower()}">
  <div class="section-inner">
    <span class="pill">COMPLETE LIBRARY</span>
    <h2 class="text-h2" style="margin-top:1rem; margin-bottom:1rem;">Browse all {label}</h2>
    <p class="text-body-lg" style="max-width:600px; margin-bottom:3rem; color:var(--on-surface-variant);">{len(cards)} in-depth resources to master your strategy.</p>
    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:2rem;">
{chr(10).join(cards)}
    </div>
  </div>
</section>
"""


def get_existing_links(p: Path, base_path: str) -> set:
    """Extract slugs already linked from the index page so we don't duplicate."""
    content = p.read_text(encoding='utf-8', errors='ignore')
    slugs = set()
    pattern = rf'href="{re.escape(base_path)}/([a-z0-9-]+)(?:\.html)?"'
    for m in re.finditer(pattern, content):
        slugs.add(m.group(1))
    return slugs


def insert_before_footer(content: str, new_section: str) -> str:
    """Insert new section before the footer/CTA section. Falls back to before </body>."""
    # Try to insert before <footer> or before the newsletter / CTA section
    markers = [
        '<!-- FOOTER -->',
        '<!-- CTA -->',
        '<!-- NEWSLETTER -->',
        '<footer',
    ]
    for marker in markers:
        idx = content.find(marker)
        if idx > 0:
            return content[:idx] + new_section + "\n" + content[idx:]
    # Fallback: before </body>
    return content.replace("</body>", new_section + "\n</body>", 1)


def fix_index(index_path: str, label: str, slug_dir: str, base_url: str, base_href: str):
    p = Path(index_path)
    content = p.read_text(encoding='utf-8')

    if "COMPLETE LIBRARY" in content:
        print(f"  {index_path}: already has Complete Library section, skipping")
        return

    existing = get_existing_links(p, base_href)
    section = build_section(label, slug_dir, base_url, existing)
    if not section:
        print(f"  {index_path}: no articles to add")
        return

    new_content = insert_before_footer(content, section)
    p.write_text(new_content, encoding='utf-8')
    n = section.count('<a href="')
    print(f"  {index_path}: added {n} article links (excluded {len(existing)} already-linked)")


def main():
    print("=== Fix EN blog/guides orphans by extending index pages ===\n")
    fix_index("en/blog/index.html", "Articles", "en/blog", f"{ORIGIN}/en/blog", "/en/blog")
    fix_index("en/guides/index.html", "Guides", "en/guides", f"{ORIGIN}/en/guides", "/en/guides")


if __name__ == "__main__":
    main()
