#!/usr/bin/env python3
"""Builder principal : genere les 30 pages formations + catalog."""
import sys
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from catalog import FORMATIONS, LEVELS, CATEGORIES
from template import render_page
from content_seo import SEO_DEBUTANT_MODULES

ROOT = Path(__file__).resolve().parents[2]

# Cap des contenus detailles par slug
DETAILED_CONTENT = {
    'seo-debutant': SEO_DEBUTANT_MODULES,
}


def make_skeleton_modules(formation):
    """Genere les modules+lecons en skeleton pour formations non encore detaillees."""
    title = formation['title_fr']
    short = formation['short_fr']
    n_modules = formation['modules']
    n_lessons_total = formation['lessons']
    # Repartition equilibree
    lessons_per_module = max(3, n_lessons_total // n_modules)

    cat_intros = {
        'seo': "Comprendre les fondamentaux,Pratique : audit complet,Construire l'autorite,Optimisation continue,Cas d'usage avances",
        'web': "Bases & installation,Design & structure,Plugins & extensions,Performance & securite,Lancement & maintenance",
        'marketing': "Strategie globale,Acquisition,Conversion & retention,Mesure & analytics,Optimisation continue",
        'ads': "Setup & comptes,Creation campagnes,Optimisation,Mesure & attribution,Scaling avance",
        'social': "Strategie & plateformes,Contenu & engagement,Community management,Mesure de performance,Publicite payante",
        'content': "Strategie editoriale,Techniques de redaction,Distribution multi-canal,Mesure ROI,Optimisation continue",
        'email': "Setup infrastructure,Segmentation & listes,Sequences automatisees,Delivrabilite,KPIs & optimisation",
        'design': "Fondamentaux design,Outils & workflow,Identite & system,Application multi-supports,Livraison professionnelle",
        'ai': "Comprendre l'IA,Prompts & cas usage,Integration outils,Workflows avances,Production & monitoring",
        'data': "Setup & tracking,Collecte donnees,Analyse & insights,Reporting,Optimisation data-driven",
    }
    module_titles = cat_intros.get(formation['cat'], "Module 1,Module 2,Module 3,Module 4,Module 5").split(',')
    while len(module_titles) < n_modules:
        module_titles.append(f"Module avance {len(module_titles)+1}")

    placeholder_html = f"""<p><em>Cette le&ccedil;on sera enrichie prochainement avec un contenu detaille (2000-3000 mots) couvrant la theorie, des exemples concrets, des etapes pas-a-pas, des erreurs &agrave; eviter, des outils recommandes et des exercices pratiques.</em></p>

<p>En attendant, voici les <strong>points cles &agrave; retenir</strong> sur ce sujet :</p>
<ul>
<li>Comprendre les principes fondamentaux avant de passer aux techniques avancees</li>
<li>Appliquer immediatement sur un projet pilote pour valider les acquis</li>
<li>Mesurer les resultats avec des KPIs precis</li>
<li>Iterer et ameliorer en continu sur la base des donnees collectees</li>
<li>Documenter les apprentissages pour l'equipe et les futures iterations</li>
</ul>

<p>Pour aller plus vite et beneficier d'un accompagnement personnalise sur ce sujet, prenez rendez-vous avec nos experts. Nous proposons des sessions de coaching individuel ou en equipe, en visio ou en presentiel &agrave; Abomey-Calavi et Cotonou.</p>
"""

    modules = []
    lesson_idx = 1
    for i in range(n_modules):
        module_title = module_titles[i] if i < len(module_titles) else f"Module {i+1}"
        lessons = []
        # Distribuer les lecons sur tous les modules de facon equilibree
        n_this_module = lessons_per_module
        if i == n_modules - 1:
            n_this_module = n_lessons_total - lesson_idx + 1
        for j in range(n_this_module):
            lesson_title = f"Le&ccedil;on {i+1}.{j+1} : aspect {j+1} de '{module_title.lower()}'"
            lessons.append({
                'title': lesson_title,
                'duration': 18,
                'content_html': placeholder_html,
            })
            lesson_idx += 1
            if lesson_idx > n_lessons_total:
                break
        modules.append({
            'title': module_title,
            'objective': f"Maitriser tous les aspects de '{module_title.lower()}' dans le cadre de '{title}'.",
            'duration': n_this_module * 18,
            'lessons': lessons,
        })
        if lesson_idx > n_lessons_total:
            break
    return modules


def build_catalog_page(is_en=False):
    """Genere la page catalog /formations/."""
    lang = 'en' if is_en else 'fr'
    lang_path = 'en' if is_en else ''  # path prefix ('' for FR root)
    css_prefix = '../'
    base = '/en' if is_en else ''
    title = "Pirabel Labs Academy - Free Trainings on Digital Marketing, SEO, AI, Web" if is_en else "Pirabel Labs Academy - Formations gratuites Marketing Digital, SEO, IA, Web"
    desc = "Free, comprehensive, hands-on online trainings. SEO, WordPress, Ads, AI, Design and more. By Pirabel Labs experts." if is_en else "Formations gratuites, completes et pratiques. SEO, WordPress, Publicite, IA, Design et plus. Par les experts de Pirabel Labs."

    # Group by category
    cards_by_cat = {}
    for f in FORMATIONS:
        cards_by_cat.setdefault(f['cat'], []).append(f)

    # Filter pills (all categories + levels)
    filter_pills = '<button class="filter-pill active" data-filter="all">' + ("All" if is_en else "Toutes") + '</button>'
    for cat_key in cards_by_cat:
        cat_name = CATEGORIES[cat_key][1 if is_en else 0]
        filter_pills += f'<button class="filter-pill" data-filter="cat-{cat_key}">{cat_name}</button>'
    for level_key, (level_fr, level_en, _color) in LEVELS.items():
        level = level_en if is_en else level_fr
        filter_pills += f'<button class="filter-pill" data-filter="level-{level_key}">{level}</button>'

    sections_html = ''
    for cat_key, cat_formations in cards_by_cat.items():
        cat_name = CATEGORIES[cat_key][1 if is_en else 0]
        cards = ''
        for f in cat_formations:
            slug = f['slug']
            f_title = f['title_en' if is_en else 'title_fr']
            f_short = f['short_en' if is_en else 'short_fr']
            level_label, level_label_en, level_color = LEVELS[f['level']]
            level = level_label_en if is_en else level_label
            # data attrs for filter + search
            search_text = (f_title + ' ' + f_short).lower().replace('"', '')
            cards += f'''
<a href="{base}/formations/{slug}" class="formation-card" data-cat="cat-{f['cat']}" data-level="level-{f['level']}" data-search="{search_text}">
  <div class="formation-card-meta">
    <span class="formation-card-level" style="background:{level_color};color:#0e0e0e;">{level}</span>
    <span class="formation-card-stats">{f['duration_h']}h &middot; {f['lessons']} {"lessons" if is_en else "lecons"}</span>
  </div>
  <h3 class="formation-card-title">{f_title}</h3>
  <p class="formation-card-short">{f_short}</p>
  <span class="formation-card-cta">{"Start the training" if is_en else "Commencer la formation"} &rarr;</span>
</a>'''
        sections_html += f'''
<section class="catalog-section" data-cat-section="cat-{cat_key}">
<h2 class="catalog-cat-title">{cat_name}</h2>
<div class="catalog-grid">{cards}</div>
</section>
'''

    # No-results message
    no_results = "No training matches your search." if is_en else "Aucune formation ne correspond a votre recherche."
    search_ph = "Search a training, a topic, a tool..." if is_en else "Rechercher une formation, un sujet, un outil..."

    nav_links = ('<a href="/en/">HOME</a><a href="/en/services">SERVICES</a><a href="/en/blog">BLOG</a><a href="/en/guides/">GUIDES</a><a href="/en/formations/" class="active">TRAININGS</a><a href="/en/resultats">RESULTS</a><a href="/en/a-propos">ABOUT</a>'
        if is_en else
        '<a href="/">ACCUEIL</a><a href="/services">SERVICES</a><a href="/blog">BLOG</a><a href="/guides/">GUIDES</a><a href="/formations/" class="active">FORMATIONS</a><a href="/resultats">RESULTATS</a><a href="/a-propos">A PROPOS</a>')

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://www.pirabellabs.com{base}/formations/">
<link rel="alternate" hreflang="fr" href="https://www.pirabellabs.com/formations/">
<link rel="alternate" hreflang="en" href="https://www.pirabellabs.com/en/formations/">
<link rel="alternate" hreflang="x-default" href="https://www.pirabellabs.com/formations/">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"></noscript>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"></noscript>
<link rel="stylesheet" href="{css_prefix}css/global.css">
<style>
.catalog-hero{{padding:9rem var(--px-page) 4rem;text-align:center;}}
.catalog-hero h1{{font-family:var(--font-headline);font-size:clamp(2.5rem,5vw,4rem);font-weight:800;letter-spacing:-0.03em;margin-bottom:1.5rem;}}
.catalog-hero p{{max-width:48rem;margin:0 auto;font-size:1.15rem;line-height:1.7;color:rgba(229,226,225,0.75);}}
.catalog-stats{{display:flex;justify-content:center;gap:3rem;flex-wrap:wrap;margin-top:2.5rem;padding:1.5rem 0;border-top:1px solid rgba(92,64,55,0.15);border-bottom:1px solid rgba(92,64,55,0.15);max-width:48rem;margin-left:auto;margin-right:auto;}}
.catalog-stat .val{{font-family:var(--font-headline);font-size:2rem;font-weight:800;color:var(--primary-container);}}
.catalog-stat .lbl{{font-size:0.8rem;color:rgba(229,226,225,0.5);text-transform:uppercase;letter-spacing:0.1em;}}
.catalog-section{{max-width:80rem;margin:0 auto;padding:3rem var(--px-page);}}
.catalog-cat-title{{font-family:var(--font-headline);font-size:1.5rem;font-weight:700;color:var(--primary-container);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:1.5rem;padding-bottom:0.75rem;border-bottom:1px solid rgba(92,64,55,0.15);}}
.catalog-grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1.5rem;}}
.formation-card{{display:block;padding:2rem;background:var(--surface-container-lowest);border:1px solid rgba(92,64,55,0.12);text-decoration:none;color:inherit;transition:transform 0.3s,border-color 0.3s;}}
.formation-card:hover{{transform:translateY(-3px);border-color:var(--primary-container);}}
.formation-card-meta{{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;font-size:0.75rem;}}
.formation-card-level{{padding:0.25rem 0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;font-family:var(--font-headline);}}
.formation-card-stats{{color:rgba(229,226,225,0.5);}}
.formation-card-title{{font-family:var(--font-headline);font-size:1.15rem;font-weight:700;line-height:1.3;margin:0 0 0.75rem;color:var(--on-surface);}}
.formation-card-short{{font-size:0.9rem;line-height:1.65;color:rgba(229,226,225,0.7);margin-bottom:1.5rem;}}
.formation-card-cta{{display:inline-block;font-size:0.85rem;font-weight:700;color:var(--primary-container);text-transform:uppercase;letter-spacing:0.05em;font-family:var(--font-headline);}}

/* Filter + Search bar */
.catalog-controls{{max-width:80rem;margin:0 auto 2rem;padding:0 var(--px-page);}}
.catalog-search-wrap{{position:relative;margin-bottom:1.5rem;}}
.catalog-search{{width:100%;padding:1rem 1.25rem 1rem 3rem;background:var(--surface-container-lowest);border:1px solid rgba(92,64,55,0.2);color:var(--on-surface);font-family:var(--font-body);font-size:1rem;outline:none;transition:border-color 0.3s;}}
.catalog-search:focus{{border-color:var(--primary-container);}}
.catalog-search-icon{{position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:rgba(229,226,225,0.4);pointer-events:none;}}
.catalog-filters{{display:flex;flex-wrap:wrap;gap:0.5rem;}}
.filter-pill{{padding:0.5rem 1rem;background:var(--surface-container-lowest);border:1px solid rgba(92,64,55,0.2);color:rgba(229,226,225,0.7);font-family:var(--font-headline);font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;cursor:pointer;transition:all 0.25s;}}
.filter-pill:hover{{color:var(--on-surface);border-color:rgba(92,64,55,0.4);}}
.filter-pill.active{{background:var(--primary-container);color:#0e0e0e;border-color:var(--primary-container);}}
.no-results{{text-align:center;padding:4rem 2rem;color:rgba(229,226,225,0.5);font-size:1.1rem;display:none;}}
.no-results.visible{{display:block;}}
.catalog-results-count{{font-size:0.85rem;color:rgba(229,226,225,0.5);margin-top:1rem;}}
</style>
</head>
<body>
<div id="progress-bar"></div>
<nav class="nav"><div class="nav-inner">
<a href="{base}/" class="nav-logo"><img src="{css_prefix}img/logo.png" alt="Pirabel Labs" class="nav-logo-img" width="80" height="80" fetchpriority="high"></a>
<div class="nav-links">{nav_links}</div>
<a class="nav-login" href="{base}/espace-client-4p8w1n"><span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;">person</span> {"My Account" if is_en else "Mon Espace"}</a>
<a href="{base}/contact" class="nav-cta">{"Free Audit" if is_en else "Audit Gratuit"}</a>
<div class="nav-hamburger"><span></span><span></span><span></span></div>
</div></nav>

<main>
<header class="catalog-hero">
<h1>Pirabel Labs Academy</h1>
<p>{"Free, comprehensive trainings to master digital marketing, SEO, web creation, AI and more. From beginner to expert, built by our team of practitioners. New trainings added regularly." if is_en else "Formations gratuites et completes pour maitriser le marketing digital, le SEO, la creation web, l'IA et bien plus. Du debutant a l'expert, batties par notre equipe de praticiens. De nouvelles formations sont ajoutees regulierement."}</p>
<div class="catalog-stats">
<div class="catalog-stat"><div class="val">{sum(f['lessons'] for f in FORMATIONS)}+</div><div class="lbl">{"Lessons" if is_en else "Lecons"}</div></div>
<div class="catalog-stat"><div class="val">{sum(f['duration_h'] for f in FORMATIONS)}h+</div><div class="lbl">{"Total duration" if is_en else "Duree totale"}</div></div>
<div class="catalog-stat"><div class="val">{len(CATEGORIES)}</div><div class="lbl">{"Categories" if is_en else "Categories"}</div></div>
<div class="catalog-stat"><div class="val">100%</div><div class="lbl">{"Free" if is_en else "Gratuit"}</div></div>
</div>
</header>

<div class="catalog-controls">
<div class="catalog-search-wrap">
<span class="catalog-search-icon material-symbols-outlined">search</span>
<input type="search" class="catalog-search" id="formations-search" placeholder="{search_ph}" aria-label="{search_ph}">
</div>
<div class="catalog-filters" id="formations-filters">{filter_pills}</div>
<div class="catalog-results-count" id="formations-count"></div>
</div>

<div id="formations-list">
{sections_html}
</div>

<div class="no-results" id="formations-no-results">{no_results}</div>

<script>
(function(){{
  const search = document.getElementById('formations-search');
  const filters = document.querySelectorAll('#formations-filters .filter-pill');
  const cards = document.querySelectorAll('.formation-card');
  const sections = document.querySelectorAll('.catalog-section');
  const noResults = document.getElementById('formations-no-results');
  const countEl = document.getElementById('formations-count');
  let activeFilter = 'all';
  let query = '';

  function applyFilters(){{
    let visibleCount = 0;
    cards.forEach(card => {{
      const cat = card.dataset.cat;
      const level = card.dataset.level;
      const text = card.dataset.search;
      const matchFilter = activeFilter === 'all' || cat === activeFilter || level === activeFilter;
      const matchSearch = !query || text.indexOf(query) !== -1;
      const visible = matchFilter && matchSearch;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    }});
    // Hide empty sections
    sections.forEach(section => {{
      const visibleCards = section.querySelectorAll('.formation-card:not([style*="display: none"])');
      section.style.display = visibleCards.length > 0 ? '' : 'none';
    }});
    noResults.classList.toggle('visible', visibleCount === 0);
    countEl.textContent = visibleCount + ' ' + ({"'training' + (visibleCount !== 1 ? 's' : '')" if is_en else "'formation' + (visibleCount > 1 ? 's' : '')"});
  }}

  search.addEventListener('input', e => {{
    query = e.target.value.toLowerCase().trim();
    applyFilters();
  }});
  filters.forEach(pill => pill.addEventListener('click', () => {{
    filters.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeFilter = pill.dataset.filter;
    applyFilters();
  }}));
  applyFilters();
}})();
</script>

</main>

<footer class="footer">
<div class="footer-grid">
<div><div class="footer-logo">PIRABEL LABS</div><p class="footer-desc">{"Premium digital agency. Headquartered in Abomey-Calavi, Benin." if is_en else "Agence digitale premium. Siege : Abomey-Calavi, Benin."}</p></div>
<div><div class="footer-title">Formations</div><ul class="footer-links"><li><a href="{base}/formations/seo-debutant">SEO Debutant</a></li><li><a href="{base}/formations/wordpress-debutant">WordPress</a></li><li><a href="{base}/formations/marketing-digital-fondamentaux">Marketing Digital</a></li><li><a href="{base}/formations/">{"All trainings" if is_en else "Toutes les formations"}</a></li></ul></div>
<div><div class="footer-title">{"Cities" if is_en else "Villes"}</div><ul class="footer-links"><li><a href="{base}/agence-seo-referencement-naturel/abomey-calavi">Abomey-Calavi</a></li><li><a href="{base}/agence-seo-referencement-naturel/cotonou">Cotonou</a></li></ul></div>
</div>
<div class="footer-bottom"><span>&copy; 2026 Pirabel Labs.</span></div>
</footer>
<script src="{css_prefix}js/global.js?v=5"></script>
<script src="{css_prefix}js/cookie-consent.js?v=1" defer></script>
</body>
</html>
"""


def main():
    formations_dir = ROOT / 'formations'
    formations_en_dir = ROOT / 'en' / 'formations'
    formations_dir.mkdir(parents=True, exist_ok=True)
    formations_en_dir.mkdir(parents=True, exist_ok=True)

    # Catalog pages
    (formations_dir / 'index.html').write_text(build_catalog_page(is_en=False), encoding='utf-8')
    (formations_en_dir / 'index.html').write_text(build_catalog_page(is_en=True), encoding='utf-8')

    # Formation pages
    count = 0
    for f in FORMATIONS:
        slug = f['slug']
        modules = DETAILED_CONTENT.get(slug) or make_skeleton_modules(f)
        # FR
        page_fr = render_page(f, modules, is_en=False, css_prefix='../')
        (formations_dir / f'{slug}.html').write_text(page_fr, encoding='utf-8')
        # EN
        page_en = render_page(f, modules, is_en=True, css_prefix='../../')
        (formations_en_dir / f'{slug}.html').write_text(page_en, encoding='utf-8')
        count += 2

    print(f"Catalog pages: 2 (FR + EN)")
    print(f"Formations pages: {count}")
    print(f"Total: {count + 2}")


if __name__ == '__main__':
    main()
