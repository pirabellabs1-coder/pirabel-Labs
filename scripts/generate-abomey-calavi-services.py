#!/usr/bin/env python3
"""
Genere les pages /agence-{categorie}/abomey-calavi.html (FR + EN) en se basant
sur les templates cotonou.html existants. Substitutions ciblees:

- City name Cotonou -> Abomey-Calavi
- geo.position, geo.placename, telephone, addressLocality
- Canonical / hreflang / breadcrumb URLs
- Context paragraphs (Abomey-Calavi != Cotonou, contexte specifique)
- Adds "(siege)" / "(HQ)" marker in title + h1
- Adds founder mention in LocalBusiness Schema
- Adds Abomey-Calavi to "Autres villes" section of all OTHER existing
  cotonou.html / paris.html / etc. files (cross-linking)

Idempotent: si abomey-calavi.html existe deja, skip.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CATEGORIES = [
    'agence-creation-sites-web',
    'agence-design-branding',
    'agence-email-marketing-crm',
    'agence-ia-automatisation',
    'agence-publicite-payante-sea-ads',
    'agence-redaction-content-marketing',
    'agence-sales-funnels-cro',
    'agence-social-media',
    'agence-video-motion-design',
]

# Sub-categories (deeper nesting like /agence-X/sub-Y/cotonou.html)
SKIP_CATEGORIES_IN_CROSSLINK = set()

OTHER_CITIES_FR = ['cotonou', 'paris', 'marseille', 'lyon', 'bruxelles',
                   'montreal', 'casablanca', 'dakar', 'abidjan', 'tunis']

# Contextual block to inject for Abomey-Calavi specifics
# (replaces the "Cotonou est capitale economique du Benin" sentence)
CONTEXT_FR = ("Abomey-Calavi accueille notre siege social et concentre une part "
              "croissante de l'activite economique du Benin: commerces, services "
              "aux entreprises, education, immobilier, agro-industrie et fintech. "
              "Avec l'Universite d'Abomey-Calavi a proximite, un vivier de "
              "talents techniques alimente une scene startup parmi les plus "
              "dynamiques d'Afrique francophone.")
CONTEXT_EN = ("Abomey-Calavi is home to our headquarters and concentrates a "
              "growing share of Benin's economic activity: retail, B2B services, "
              "education, real estate, agribusiness and fintech. With the "
              "University of Abomey-Calavi nearby, a strong pipeline of technical "
              "talent fuels one of the most dynamic startup scenes in "
              "French-speaking Africa.")

def transform(text: str, is_en: bool) -> str:
    """Apply Cotonou -> Abomey-Calavi substitutions to template content."""
    out = text

    # URL slugs (do these first before generic "Cotonou" -> "Abomey-Calavi" wipes paths)
    out = out.replace('/cotonou#', '/abomey-calavi#')
    out = out.replace('/cotonou"', '/abomey-calavi"')
    out = out.replace('/cotonou.html', '/abomey-calavi.html')

    # Geo + address
    out = out.replace('6.3703;2.3912', '6.4486;2.3556')
    out = out.replace('"latitude":6.3703,"longitude":2.3912',
                      '"latitude":6.4486,"longitude":2.3556')
    if is_en:
        out = out.replace('"Cotonou, Benin"', '"Abomey-Calavi, Benin"')
    else:
        out = out.replace('"Cotonou, Benin"', '"Abomey-Calavi, Bénin"')
        # FR file may also have "Cotonou, Bénin"
        out = out.replace('Cotonou, Bénin', 'Abomey-Calavi, Bénin')
    out = out.replace('"addressLocality":"Cotonou"',
                      '"addressLocality":"Abomey-Calavi","addressRegion":"Atlantique"')
    # areaServed: let the generic Cotonou->Abomey-Calavi pass at the end do its job;
    # no need to manipulate the shape here.

    # Telephone -> Benin number
    out = out.replace('"telephone":"+16139273067"', '"telephone":"+22901688884534"')

    # Schema name: "Pirabel Labs Cotonou" -> "Pirabel Labs - Siege Abomey-Calavi"
    if is_en:
        out = out.replace('"name":"Pirabel Labs Cotonou"',
                          '"name":"Pirabel Labs - Headquarters Abomey-Calavi"')
    else:
        out = out.replace('"name":"Pirabel Labs Cotonou"',
                          '"name":"Pirabel Labs — Siege Abomey-Calavi"')

    # Inject founder array right before the closing "}" of LocalBusiness Schema
    # if not already present
    if '"founder"' not in out:
        out = out.replace(
            '"serviceType":',
            '"founder":[{"@type":"Person","name":"Lissanon Gildas","jobTitle":'
            + ('"Founder & CEO"' if is_en else '"Fondateur & CEO"')
            + '},{"@type":"Person","name":"Fidah Imorou","jobTitle":'
            + ('"Co-founder"' if is_en else '"Co-fondateur"')
            + '}],"serviceType":',
            1,
        )

    # Replace city-specific context sentence (only the FR/EN version of "capitale economique")
    out = out.replace(
        "Cotonou est capitale economique du Benin, moteur de l'Afrique de l'Ouest.",
        CONTEXT_FR,
    )
    out = out.replace(
        "Cotonou is Benin's economic capital, a driver of West Africa.",
        CONTEXT_EN,
    )
    out = out.replace(
        "Cotonou, capitale économique du Bénin, moteur de l'Afrique de l'Ouest.",
        CONTEXT_FR,
    )

    # Add "(siege)" / "(HQ)" hint in <title> if not already
    if is_en:
        out = re.sub(
            r'<title>([^<]*?)Cotonou([^<]*?)</title>',
            r'<title>\1Abomey-Calavi\2 · Pirabel Labs HQ</title>',
            out, count=1,
        )
    else:
        out = re.sub(
            r'<title>([^<]*?)Cotonou([^<]*?)</title>',
            r'<title>\1Abomey-Calavi\2 · Pirabel Labs (siège)</title>',
            out, count=1,
        )
    # Avoid double "| Pirabel Labs" appended by old + new
    out = re.sub(r'\| Pirabel Labs · Pirabel Labs', '| Pirabel Labs', out)
    out = re.sub(r'Pirabel Labs · Pirabel Labs', 'Pirabel Labs', out)
    out = re.sub(r'\| Pirabel Labs · Pirabel Labs HQ', '· Pirabel Labs HQ', out)
    out = re.sub(r'\| Pirabel Labs · Pirabel Labs \(siège\)', '· Pirabel Labs (siège)', out)

    # Generic last pass: any remaining "Cotonou" word in user-visible text -> "Abomey-Calavi"
    # Preserve URL paths (followed by .html or /) — only swap standalone words.
    out = re.sub(r'\bCotonou\b(?![\w\-/])', 'Abomey-Calavi', out)

    # Pronoun fix: ONLY isolated 'a' / 'A' (word boundary on both sides)
    # to avoid corrupting "IA Abomey-Calavi" -> "Ià Abomey-Calavi".
    out = re.sub(r'(?<![A-Za-z])a Abomey-Calavi', 'à Abomey-Calavi', out)
    out = re.sub(r'(?<![A-Za-z])A Abomey-Calavi', 'À Abomey-Calavi', out)

    return out

def patch_cross_links(category: str, is_en: bool):
    """Add Abomey-Calavi card to the 'Autres villes' grid of all OTHER city pages."""
    base = ROOT / ('en/' + category if is_en else category)
    if not base.exists():
        return 0
    count = 0
    for city in OTHER_CITIES_FR:
        page = base / f'{city}.html'
        if not page.exists():
            continue
        text = page.read_text(encoding='utf-8', errors='ignore')
        if 'abomey-calavi.html' in text:
            continue  # already linked
        # Add Abomey-Calavi card at the start of the grid
        card_fr = ('<a href="abomey-calavi.html" style="text-decoration:none;'
                   'text-align:center;padding:1rem;background:var(--surface-container-lowest);'
                   'border:1px solid rgba(92,64,55,0.1);">'
                   '<p style="font-weight:700;">Abomey-Calavi</p>'
                   '<p class="text-muted text-small">Bénin · Siège</p></a>')
        card_en = ('<a href="abomey-calavi.html" style="text-decoration:none;'
                   'text-align:center;padding:1rem;background:var(--surface-container-lowest);'
                   'border:1px solid rgba(92,64,55,0.1);">'
                   '<p style="font-weight:700;">Abomey-Calavi</p>'
                   '<p class="text-muted text-small">Benin · HQ</p></a>')
        card = card_en if is_en else card_fr
        # Insert right after the opening of grid-5/grid-4 inside the "Autres villes" section
        new_text, n = re.subn(
            r'(<div class="grid-5 rv">|<div class="grid-4 rv">)',
            r'\1' + card,
            text, count=1,
        )
        if n:
            page.write_text(new_text, encoding='utf-8')
            count += 1
    return count

def main():
    created = 0
    cross = 0
    for cat in CATEGORIES:
        for is_en in (False, True):
            base = ROOT / ('en/' + cat if is_en else cat)
            template = base / 'cotonou.html'
            target = base / 'abomey-calavi.html'
            if not template.exists():
                print(f"[MISS template] {template}")
                continue
            if target.exists():
                print(f"[EXIST] {target}")
                continue
            text = template.read_text(encoding='utf-8', errors='ignore')
            new_text = transform(text, is_en)
            target.write_text(new_text, encoding='utf-8')
            created += 1
            print(f"[NEW] {target}")
        # Cross-link this category's other city pages to point to abomey-calavi.html
        cross += patch_cross_links(cat, is_en=False)
        cross += patch_cross_links(cat, is_en=True)

    print(f"\nPages creees: {created}")
    print(f"Pages cross-linkees: {cross}")

if __name__ == '__main__':
    main()
