"""
Generic orphan-fixer: for a given parent index, append a 'Complete services'
section linking to all sibling .html files not already linked.
"""
from pathlib import Path
import re
import os
import html

ROOT = Path('.')
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


def build_card(slug: str, title: str, desc: str, base_path: str) -> str:
    title_h = html.escape(title)
    if len(desc) > 140:
        desc = desc[:137].rstrip() + "…"
    desc_h = html.escape(desc)
    href = f"{base_path}/{slug}"
    return f"""      <a href="{href}" class="card card--interactive" style="text-decoration:none;">
        <h3 class="text-h4" style="margin-bottom:1rem;">{title_h}</h3>
        <p style="color:var(--on-surface-variant); font-size:0.95rem;">{desc_h}</p>
        <div style="margin-top:1.5rem; display:flex; align-items:center; gap:0.5rem; color:#FF5500;">
          Découvrir <span class="material-symbols-outlined">arrow_forward</span>
        </div>
      </a>"""


def get_existing_internal_links(content: str, base_path: str) -> set:
    """All slugs already linked from this page in form base_path/<slug> or <slug>.html."""
    slugs = set()
    # Absolute path: /consulting-digital/audit-digital
    pattern1 = rf'href="{re.escape(base_path)}/([a-z0-9-]+)(?:\.html)?"'
    for m in re.finditer(pattern1, content):
        slugs.add(m.group(1))
    # Relative: audit-digital.html
    pattern2 = r'href="([a-z0-9-]+)\.html"'
    for m in re.finditer(pattern2, content):
        slugs.add(m.group(1))
    return slugs


def insert_before_footer(content: str, new_section: str) -> str:
    markers = ['<!-- FOOTER -->', '<!-- CTA -->', '<!-- NEWSLETTER -->', '<footer']
    for marker in markers:
        idx = content.find(marker)
        if idx > 0:
            return content[:idx] + new_section + "\n" + content[idx:]
    return content.replace("</body>", new_section + "\n</body>", 1)


def fix_parent_index(parent_dir: str, label_fr: str = "Tous nos services"):
    parent_index = Path(parent_dir) / "index.html"
    if not parent_index.exists():
        return f"NO_INDEX: {parent_dir}"

    content = parent_index.read_text(encoding='utf-8')
    if "COMPLETE_LIBRARY_AUTO" in content:
        return f"already extended"

    base_path = "/" + parent_dir
    existing = get_existing_internal_links(content, base_path)

    siblings = []
    for f in sorted(Path(parent_dir).glob("*.html")):
        if f.stem == "index":
            continue
        if f.stem in existing:
            continue
        title, desc = get_meta(f)
        siblings.append((f.stem, title, desc))

    if not siblings:
        return "no orphan siblings"

    cards = [build_card(s, t, d, base_path) for s, t, d in siblings]
    section = f"""

<!-- COMPLETE_LIBRARY_AUTO -->
<section class="section section--low" id="all-services">
  <div class="section-inner">
    <span class="pill">CATALOGUE COMPLET</span>
    <h2 class="text-h2" style="margin-top:1rem; margin-bottom:1rem;">{label_fr}</h2>
    <p class="text-body-lg" style="max-width:600px; margin-bottom:3rem; color:var(--on-surface-variant);">{len(siblings)} ressources et services pour vous accompagner.</p>
    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:2rem;">
{chr(10).join(cards)}
    </div>
  </div>
</section>
"""

    new_content = insert_before_footer(content, section)
    parent_index.write_text(new_content, encoding='utf-8')
    return f"added {len(siblings)} links"


def main():
    targets = [
        ("consulting-digital", "Tous nos services consulting"),
        ("formation-digitale", "Toutes nos formations"),
        ("outils-digitaux", "Tous nos outils digitaux"),
        ("agence-email-marketing-crm", "Toutes nos solutions email & CRM"),
        ("agence-ia-automatisation", "Toutes nos solutions IA & automatisation"),
        ("agence-seo-referencement-naturel", "Tous nos services SEO"),
        ("agence-video-motion-design", "Tous nos services vidéo"),
        ("guides", "Tous nos guides"),
    ]
    for parent, label in targets:
        result = fix_parent_index(parent, label)
        print(f"  {parent}/index.html: {result}")


if __name__ == "__main__":
    main()
