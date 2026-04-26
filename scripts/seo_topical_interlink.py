"""
Add topical 'Related articles/guides' sections to blog and guide articles.

For each article, select the 4 most topically-similar siblings based on
slug-word overlap (shared keywords). Insert before the footer/CTA.

Also: deduplicate hreflang tags (some files have pre-existing .html-suffixed
ones plus our newer clean ones).
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


# Common stopwords to ignore when computing slug similarity
STOPWORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'for', 'to', 'of', 'in', 'on', 'with',
    'guide', 'complete', 'best', 'how', 'why', 'what', 'tips', '2026', '2025',
    'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'au', 'aux', 'et', 'ou',
    'pour', 'avec', 'sans', 'sur', 'dans', 'par', 'votre', 'vos', 'notre', 'nos',
    'ce', 'cette', 'ces', 'qui', 'que', 'comment', 'pourquoi', 'guide-complet',
    'meilleurs', 'meilleur', 'meilleure',
}


def slug_keywords(slug: str) -> set:
    parts = slug.split('-')
    return {p.lower() for p in parts if p.lower() not in STOPWORDS and len(p) > 2}


def similarity(slug_a: str, slug_b: str) -> int:
    """Number of shared meaningful words between two slugs."""
    return len(slug_keywords(slug_a) & slug_keywords(slug_b))


def find_related(target_slug: str, all_slugs: list, n: int = 4) -> list:
    """Pick n most topically-similar slugs (excluding self)."""
    scored = []
    for s in all_slugs:
        if s == target_slug:
            continue
        sim = similarity(target_slug, s)
        scored.append((sim, s))
    # Sort: higher similarity first, then alphabetical for stability
    scored.sort(key=lambda x: (-x[0], x[1]))
    return [s for sim, s in scored[:n]]


def build_card(slug: str, title: str, desc: str, base_path: str, label_read: str) -> str:
    title_h = html.escape(title)
    if len(desc) > 130:
        desc = desc[:127].rstrip() + "…"
    desc_h = html.escape(desc)
    return f"""      <a href="{base_path}/{slug}" class="card card--interactive" style="text-decoration:none;">
        <h3 class="text-h4" style="margin-bottom:1rem;">{title_h}</h3>
        <p style="color:var(--on-surface-variant); font-size:0.95rem;">{desc_h}</p>
        <div style="margin-top:1.5rem; display:flex; align-items:center; gap:0.5rem; color:#FF5500;">
          {label_read} <span class="material-symbols-outlined">arrow_forward</span>
        </div>
      </a>"""


def insert_before_footer(content: str, new_section: str) -> str:
    markers = ['<!-- FOOTER -->', '<!-- CTA -->', '<!-- NEWSLETTER -->', '<footer']
    for marker in markers:
        idx = content.find(marker)
        if idx > 0:
            return content[:idx] + new_section + "\n" + content[idx:]
    return content.replace("</body>", new_section + "\n</body>", 1)


def add_related_section(folder: str, base_path: str, lang: str = "en") -> int:
    """Add 'Related' section to each article in folder. Returns count of files modified."""
    files = sorted([f for f in Path(folder).glob("*.html") if f.stem != "index"])
    if len(files) < 5:
        return 0

    slugs = [f.stem for f in files]
    metas = {f.stem: get_meta(f) for f in files}

    if lang == "fr":
        section_title = "Articles similaires"
        intro = "Continuez votre exploration avec ces ressources."
        label_read = "Lire l'article"
        pill = "À LIRE AUSSI"
    else:
        section_title = "Related articles"
        intro = "Continue your exploration with these resources."
        label_read = "Read article"
        pill = "READ ALSO"

    modified = 0
    for f in files:
        content = f.read_text(encoding='utf-8')
        if "RELATED_AUTO" in content:
            continue
        related = find_related(f.stem, slugs, n=4)
        cards = []
        for slug in related:
            t, d = metas[slug]
            cards.append(build_card(slug, t, d, base_path, label_read))
        if not cards:
            continue
        section = f"""

<!-- RELATED_AUTO -->
<section class="section section--low" style="background:rgba(255,255,255,0.02); border-top:1px solid var(--outline-variant);">
  <div class="section-inner">
    <span class="pill">{pill}</span>
    <h2 class="text-h3" style="margin-top:1rem; margin-bottom:1rem;">{section_title}</h2>
    <p style="margin-bottom:3rem; color:var(--on-surface-variant);">{intro}</p>
    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:1.5rem;">
{chr(10).join(cards)}
    </div>
  </div>
</section>
"""
        new_content = insert_before_footer(content, section)
        f.write_text(new_content, encoding='utf-8')
        modified += 1
    return modified


# === Hreflang dedup ===
ALT_RE = re.compile(r'<link\s+rel=["\']alternate["\']\s+hreflang=["\']([^"\']+)["\']\s+href=["\']([^"\']+)["\']\s*/?>', re.I)


def dedupe_hreflang(folder: str) -> int:
    """For each file in folder, deduplicate hreflang alternate tags by (lang, normalized_url).
    Prefer URL without .html suffix (cleaner)."""
    modified = 0
    for f in Path(folder).rglob("*.html"):
        content = f.read_text(encoding='utf-8', errors='ignore')
        matches = list(ALT_RE.finditer(content))
        if len(matches) <= 1:
            continue

        # Group by language; for each lang keep cleanest URL
        seen = {}  # lang -> (url, match)
        for m in matches:
            lang = m.group(1).lower()
            url = m.group(2).strip()
            # Prefer URL without .html suffix
            if lang not in seen:
                seen[lang] = (url, m)
            else:
                cur_url, cur_m = seen[lang]
                if url.endswith('.html') and not cur_url.endswith('.html'):
                    pass  # keep current
                elif not url.endswith('.html') and cur_url.endswith('.html'):
                    seen[lang] = (url, m)
                else:
                    pass  # keep first

        # If no duplicates per lang, skip
        if len(seen) == len(matches):
            continue

        # Remove all alternate tags, then re-insert deduped ones
        kept_matches = {id(m): True for url, m in seen.values()}
        # Remove non-kept matches (in reverse order to preserve indices)
        new_content = content
        for m in reversed(matches):
            if id(m) not in kept_matches:
                new_content = new_content[:m.start()] + new_content[m.end():]
                # Also strip trailing newline if it's now orphaned
                if new_content[m.start():m.start()+1] == '\n':
                    new_content = new_content[:m.start()] + new_content[m.start()+1:]

        if new_content != content:
            f.write_text(new_content, encoding='utf-8')
            modified += 1
    return modified


def main():
    print("=== Step 1: Add 'Related articles' to blog (FR + EN) ===")
    n = add_related_section("blog", "/blog", lang="fr")
    print(f"  blog/ (FR): {n} articles enriched")
    n = add_related_section("en/blog", "/en/blog", lang="en")
    print(f"  en/blog/ (EN): {n} articles enriched")

    print("\n=== Step 2: Add 'Related guides' to EN guides ===")
    n = add_related_section("en/guides", "/en/guides", lang="en")
    print(f"  en/guides/ (EN): {n} guides enriched")

    print("\n=== Step 3: Deduplicate hreflang in EN section ===")
    n = dedupe_hreflang("en")
    print(f"  Files deduped: {n}")


if __name__ == "__main__":
    main()
