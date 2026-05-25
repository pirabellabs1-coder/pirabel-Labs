#!/usr/bin/env python3
"""Template HTML pour les pages formations."""
import json
import html as html_lib


def render_page(formation, modules, is_en=False, css_prefix='../'):
    """Rend la page HTML complete d'une formation.

    formation : dict du catalogue
    modules : liste de modules avec leurs lecons
        [{'title': '...', 'duration': 60, 'lessons': [{'title': '...', 'duration': 15, 'content_html': '<p>...</p>'}]}]
    """
    lang = 'en' if is_en else 'fr'
    slug = formation['slug']
    title = formation['title_en' if is_en else 'title_fr']
    short = formation['short_en' if is_en else 'short_fr']
    base_url_prefix = '/en' if is_en else ''
    canonical = f"https://www.pirabellabs.com{base_url_prefix}/formations/{slug}"
    href_fr = f"https://www.pirabellabs.com/formations/{slug}"
    href_en = f"https://www.pirabellabs.com/en/formations/{slug}"

    from catalog import LEVELS, CATEGORIES
    level_label = LEVELS[formation['level']][1 if is_en else 0]
    level_color = LEVELS[formation['level']][2]
    cat_label = CATEGORIES[formation['cat']][1 if is_en else 0]

    # Word count
    total_words = sum(
        len(l.get('content_html', '').split())
        for m in modules
        for l in m.get('lessons', [])
    )

    # Schema.org Course
    schema_course = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": title,
        "description": short,
        "url": canonical,
        "provider": {
            "@type": "Organization",
            "name": "Pirabel Labs",
            "sameAs": "https://www.pirabellabs.com"
        },
        "educationalLevel": formation['level'],
        "timeRequired": f"PT{formation['duration_h']}H",
        "inLanguage": lang,
        "isAccessibleForFree": True,
        "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "online",
            "courseWorkload": f"PT{formation['duration_h']}H"
        }
    }

    bc = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home" if is_en else "Accueil",
             "item": f"https://www.pirabellabs.com{base_url_prefix}/"},
            {"@type": "ListItem", "position": 2, "name": "Formations" if not is_en else "Trainings",
             "item": f"https://www.pirabellabs.com{base_url_prefix}/formations/"},
            {"@type": "ListItem", "position": 3, "name": title, "item": canonical},
        ]
    }

    # Table of Contents
    toc_items = ''
    for i, m in enumerate(modules, 1):
        toc_items += f'<li><a href="#module-{i}">{m["title"]}</a> <span style="color:rgba(229,226,225,0.4);font-size:0.85rem;">({len(m.get("lessons", []))} {"lessons" if is_en else "leçons"})</span></li>'

    # Modules HTML : sommaire avec liens vers les pages lecons individuelles
    modules_html = ''
    for i, m in enumerate(modules, 1):
        lessons_html = ''
        for j, lesson in enumerate(m.get('lessons', []), 1):
            duration = lesson.get('duration', 15)
            lesson_url = f"{base_url_prefix}/formations/{slug}/m{i}-l{j}"
            lessons_html += f'''
<a href="{lesson_url}" class="lesson-link">
<span class="lesson-num">{i}.{j}</span>
<span class="lesson-title">{html_lib.escape(lesson["title"])}</span>
<span class="lesson-duration">{duration} min</span>
</a>'''

        first_lesson_url = f"{base_url_prefix}/formations/{slug}/m{i}-l1" if m.get('lessons') else '#'
        start_label = "Start the module" if is_en else "Commencer le module"
        modules_html += f'''
<section class="module" id="module-{i}">
<header class="module-header">
<span class="module-num">{"Module" if is_en else "Module"} {i}</span>
<h2 class="module-title">{html_lib.escape(m["title"])}</h2>
{f'<p class="module-objective">{m["objective"]}</p>' if m.get('objective') else ''}
<div class="module-meta">
<span>{len(m.get("lessons", []))} {"lessons" if is_en else "lecons"}</span>
<span>~{m.get("duration", 60)} min</span>
</div>
</header>
<div class="module-lessons">
{lessons_html}
</div>
<a href="{first_lesson_url}" class="btn btn--orange module-start-btn">{start_label} &rarr;</a>
</section>
'''

    # Navigation links
    nav_links_fr = '<a href="/">ACCUEIL</a><a href="/services">SERVICES</a><a href="/blog">BLOG</a><a href="/guides/">GUIDES</a><a href="/formations/" class="active">FORMATIONS</a><a href="/resultats">RÉSULTATS</a><a href="/a-propos">À PROPOS</a>'
    nav_links_en = '<a href="/en/">HOME</a><a href="/en/services">SERVICES</a><a href="/en/blog">BLOG</a><a href="/en/guides/">GUIDES</a><a href="/en/formations/" class="active">TRAININGS</a><a href="/en/resultats">RESULTS</a><a href="/en/a-propos">ABOUT</a>'
    nav_links = nav_links_en if is_en else nav_links_fr

    # CTA buttons
    cta_fr = '<div class="cta-buttons"><a href="/rendez-vous" class="btn btn--white">Formation personnalisée <span class="material-symbols-outlined">calendar_today</span></a><a href="/contact" class="btn btn--ghost-white">Nous contacter <span class="material-symbols-outlined">arrow_forward</span></a></div>'
    cta_en = '<div class="cta-buttons"><a href="/en/rendez-vous" class="btn btn--white">Personalized training <span class="material-symbols-outlined">calendar_today</span></a><a href="/en/contact" class="btn btn--ghost-white">Contact us <span class="material-symbols-outlined">arrow_forward</span></a></div>'

    label_audience = "Pour qui ?" if not is_en else "Who is this for?"
    label_objectives = "Vous apprendrez à" if not is_en else "You will learn to"
    label_toc = "Sommaire" if not is_en else "Table of contents"
    label_modules = "Programme détaillé" if not is_en else "Detailed program"
    label_cta_title = "Prêt à monter en compétences ?" if not is_en else "Ready to upskill?"
    label_cta_desc = "Cette formation gratuite est complète, mais pour aller plus vite avec un coaching personnalisé, nos experts vous accompagnent en visio." if not is_en else "This free training is comprehensive, but to go faster with personalized coaching, our experts support you live online."

    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} | Pirabel Labs</title>
<meta name="description" content="{short[:160]}">
<link rel="icon" type="image/png" href="{css_prefix}img/favicon.png">
<link rel="canonical" href="{canonical}">
<link rel="alternate" hreflang="fr" href="{href_fr}">
<link rel="alternate" hreflang="x-default" href="{href_fr}">
<link rel="alternate" hreflang="en" href="{href_en}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"></noscript>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"></noscript>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" media="print" onload="this.media='all'"><noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"></noscript>
<link rel="stylesheet" href="{css_prefix}css/global.css">
<script type="application/ld+json">{json.dumps(schema_course, ensure_ascii=False, separators=(',', ':'))}</script>
<script type="application/ld+json">{json.dumps(bc, ensure_ascii=False, separators=(',', ':'))}</script>
<meta property="og:title" content="{title} | Pirabel Labs">
<meta property="og:description" content="{short[:160]}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="https://www.pirabellabs.com/img/og-image.png">
<style>
:root{{--formation-accent:{level_color};}}
.formation-hero{{padding:9rem var(--px-page) 4rem;border-bottom:1px solid rgba(92,64,55,0.15);}}
.formation-hero-inner{{max-width:72rem;margin:0 auto;}}
.formation-meta{{display:flex;flex-wrap:wrap;gap:0.75rem;margin-bottom:1.5rem;}}
.formation-badge{{display:inline-flex;align-items:center;gap:0.4rem;padding:0.4rem 0.85rem;font-size:0.7rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border:1px solid rgba(92,64,55,0.25);}}
.formation-badge.level{{background:var(--formation-accent);color:#0e0e0e;border-color:var(--formation-accent);}}
.formation-title{{font-family:var(--font-headline);font-size:clamp(2rem,4.5vw,3.5rem);font-weight:800;line-height:1.1;margin:1rem 0 1.5rem;letter-spacing:-0.02em;}}
.formation-short{{font-size:1.15rem;line-height:1.7;color:rgba(229,226,225,0.75);max-width:48rem;margin-bottom:2rem;}}
.formation-stats{{display:flex;flex-wrap:wrap;gap:2rem;padding:1.5rem 0;border-top:1px solid rgba(92,64,55,0.15);border-bottom:1px solid rgba(92,64,55,0.15);}}
.formation-stat .val{{font-family:var(--font-headline);font-size:1.5rem;font-weight:800;color:var(--formation-accent);}}
.formation-stat .lbl{{font-size:0.75rem;color:rgba(229,226,225,0.5);text-transform:uppercase;letter-spacing:0.1em;margin-top:0.25rem;}}
.formation-body{{max-width:72rem;margin:0 auto;padding:3rem var(--px-page);}}
.formation-section{{margin-bottom:4rem;}}
.formation-section h2.section-title{{font-family:var(--font-headline);font-size:1.75rem;font-weight:700;margin-bottom:1.5rem;letter-spacing:-0.02em;}}
.toc{{background:var(--surface-container-lowest);border-left:3px solid var(--formation-accent);padding:2rem;margin-bottom:3rem;}}
.toc ol{{padding-left:1.5rem;margin:0;}}
.toc ol li{{margin-bottom:0.75rem;line-height:1.5;}}
.toc ol li a{{color:var(--on-surface);text-decoration:none;font-weight:600;}}
.toc ol li a:hover{{color:var(--formation-accent);}}
.module{{margin-bottom:4rem;padding:2.5rem;background:var(--surface-container-lowest);border:1px solid rgba(92,64,55,0.12);}}
.module-header{{margin-bottom:2rem;padding-bottom:1.5rem;border-bottom:1px solid rgba(92,64,55,0.15);}}
.module-num{{display:inline-block;font-size:0.75rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--formation-accent);margin-bottom:0.5rem;}}
.module-title{{font-family:var(--font-headline);font-size:1.5rem;font-weight:700;margin:0 0 0.75rem;letter-spacing:-0.02em;}}
.module-objective{{color:rgba(229,226,225,0.6);font-style:italic;margin-bottom:1rem;}}
.module-meta{{display:flex;gap:1.5rem;font-size:0.85rem;color:rgba(229,226,225,0.5);}}
.module-lessons{{margin-bottom:1.5rem;}}

/* Enrollment banner + modal */
.formation-enroll-banner{{margin-bottom:2.5rem;padding:1.75rem 2rem;background:linear-gradient(135deg,rgba(255,87,0,0.12),rgba(255,87,0,0.04));border:1px solid rgba(255,87,0,0.3);border-radius:4px;}}
.formation-enroll-content{{display:flex;flex-wrap:wrap;align-items:center;gap:1.5rem;justify-content:space-between;}}
.formation-enroll-content strong{{color:var(--on-surface);font-size:1.1rem;display:block;}}
@media(max-width:640px){{.formation-enroll-content{{flex-direction:column;align-items:flex-start;}}}}
.enroll-modal{{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:1rem;}}
.enroll-modal-overlay{{position:absolute;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);}}
.enroll-modal-card{{position:relative;z-index:1;background:var(--surface-container);border:1px solid rgba(92,64,55,0.25);max-width:480px;width:100%;padding:2.5rem;box-shadow:0 20px 60px rgba(0,0,0,0.6);}}
.enroll-modal-close{{position:absolute;top:0.75rem;right:1rem;background:none;border:none;color:rgba(229,226,225,0.5);font-size:1.75rem;cursor:pointer;line-height:1;}}
.enroll-modal-close:hover{{color:var(--on-surface);}}
.enroll-modal-card h2{{font-family:var(--font-headline);font-size:1.5rem;font-weight:700;margin:0 0 1rem;}}
.enroll-modal-card p{{color:rgba(229,226,225,0.7);line-height:1.6;margin-bottom:1.5rem;}}
.enroll-form{{display:grid;gap:0.75rem;}}
.enroll-form input{{padding:0.85rem 1rem;background:var(--surface-container-low);border:1px solid rgba(92,64,55,0.2);color:var(--on-surface);font-family:var(--font-body);font-size:0.95rem;outline:none;transition:border-color 0.3s;}}
.enroll-form input:focus{{border-color:var(--formation-accent);}}
.enroll-submit{{margin-top:0.5rem;}}
.enroll-form-status{{margin:0.5rem 0 0;font-size:0.85rem;color:#888;text-align:center;}}
.lesson-link{{display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem;background:var(--surface-container-low);margin-bottom:0.5rem;text-decoration:none;color:var(--on-surface);transition:transform 0.2s,background 0.2s;}}
.lesson-link:hover{{background:var(--surface-container);transform:translateX(4px);}}
.lesson-link .lesson-num{{flex-shrink:0;display:inline-block;padding:0.3rem 0.7rem;background:var(--formation-accent);color:#0e0e0e;font-weight:800;font-size:0.85rem;font-family:var(--font-headline);}}
.lesson-link .lesson-title{{flex:1;font-weight:500;font-size:0.95rem;}}
.lesson-link .lesson-duration{{color:rgba(229,226,225,0.45);font-size:0.85rem;flex-shrink:0;}}
.module-start-btn{{margin-top:1rem;}}
@media(max-width:640px){{
  .module{{padding:1.5rem;}}
  .formation-stats{{gap:1rem;}}
}}
</style>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-H0ZTTRYBQ7"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-H0ZTTRYBQ7');</script>
</head>
<body>
<div id="progress-bar"></div>
<nav class="nav"><div class="nav-inner">
<a href="{base_url_prefix}/" class="nav-logo"><img src="{css_prefix}img/logo.png" alt="Pirabel Labs" class="nav-logo-img" width="80" height="80" fetchpriority="high"></a>
<div class="nav-links">{nav_links}</div>
<a class="nav-login" href="{base_url_prefix}/espace-client-4p8w1n"><span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;">person</span> {"My Account" if is_en else "Mon Espace"}</a>
<a href="{base_url_prefix}/contact" class="nav-cta">{"Free Audit" if is_en else "Audit Gratuit"}</a>
<div class="nav-hamburger"><span></span><span></span><span></span></div>
</div></nav>

<main>
<header class="formation-hero">
<div class="formation-hero-inner">
<div class="formation-meta">
<span class="formation-badge level">{level_label}</span>
<span class="formation-badge">{cat_label}</span>
<span class="formation-badge">📚 {formation['lessons']} {"lessons" if is_en else "leçons"}</span>
<span class="formation-badge">⏱ {formation['duration_h']}h</span>
</div>
<h1 class="formation-title">{title}</h1>
<p class="formation-short">{short}</p>
<div class="formation-stats">
<div class="formation-stat"><div class="val">{formation['modules']}</div><div class="lbl">{"Modules" if is_en else "Modules"}</div></div>
<div class="formation-stat"><div class="val">{formation['lessons']}</div><div class="lbl">{"Lessons" if is_en else "Leçons"}</div></div>
<div class="formation-stat"><div class="val">{formation['duration_h']}h</div><div class="lbl">{"Total duration" if is_en else "Durée totale"}</div></div>
<div class="formation-stat"><div class="val">100%</div><div class="lbl">{"Free" if is_en else "Gratuit"}</div></div>
</div>
</div>
</header>

<div class="formation-body">

<!-- Enrollment banner -->
<div class="formation-enroll-banner" id="enroll-banner-summary">
<div class="formation-enroll-content">
<div>
<strong>{"Free registration required to follow this training" if is_en else "Inscription gratuite requise pour suivre cette formation"}</strong>
<p style="margin:0.5rem 0 0;color:rgba(229,226,225,0.7);font-size:0.95rem;">{"Track your progress, get your certificate and join the community. Takes 30 seconds." if is_en else "Suivez votre progression, obtenez votre certificat et rejoignez la communaute. 30 secondes."}</p>
</div>
<button class="btn btn--orange" id="open-enroll-modal" style="white-space:nowrap;padding:0.85rem 1.5rem;">{"Register for free" if is_en else "S'inscrire gratuitement"} &rarr;</button>
</div>
</div>

<!-- Enrollment modal -->
<div class="enroll-modal" id="enroll-modal" style="display:none;">
<div class="enroll-modal-overlay" onclick="document.getElementById('enroll-modal').style.display='none'"></div>
<div class="enroll-modal-card">
<button class="enroll-modal-close" onclick="document.getElementById('enroll-modal').style.display='none'" aria-label="Close">&times;</button>
<h2>{"Free registration required" if is_en else "Inscription gratuite requise"}</h2>
<p>{"Create your free account in 30 seconds to access the entire training, track your progress and earn your certificate." if is_en else "Creez votre compte gratuit en 30 secondes pour acceder a toute la formation, suivre votre progression et obtenir votre certificat."}</p>
<form id="enroll-form-summary" class="enroll-form">
<input type="text" name="name" placeholder="{"Your name" if is_en else "Votre nom"}" required maxlength="80">
<input type="email" name="email" placeholder="{"Your email" if is_en else "Votre email"}" required maxlength="160">
<input type="password" name="password" placeholder="{"Choose a password (6+ chars)" if is_en else "Choisissez un mot de passe (6+ caracteres)"}" required minlength="6" maxlength="120">
<button type="submit" class="btn btn--orange enroll-submit">{"Start the training" if is_en else "Commencer la formation"}</button>
<p class="enroll-form-status" id="enroll-status-summary"></p>
</form>
</div>
</div>

<script>
(function(){{
  const FORMATION_SLUG = "{slug}";
  const FORMATION_TITLE = {json.dumps(title[:200])};
  const LANG = "{lang}";
  const banner = document.getElementById('enroll-banner-summary');
  const modal = document.getElementById('enroll-modal');
  const openBtn = document.getElementById('open-enroll-modal');
  const form = document.getElementById('enroll-form-summary');
  const status = document.getElementById('enroll-status-summary');

  // Check session
  fetch('/api/lms/me', {{ credentials: 'include' }})
    .then(r => r.ok ? r.json() : null)
    .then(data => {{
      if (data && data.enrollments) {{
        const isEnrolled = data.enrollments.some(e => e.formationSlug === FORMATION_SLUG);
        if (isEnrolled) {{
          // Hide banner if already enrolled
          banner.style.display = 'none';
        }}
      }}
    }})
    .catch(() => {{}});

  if (openBtn) openBtn.addEventListener('click', () => modal.style.display = 'flex');

  if (form) form.addEventListener('submit', async (e) => {{
    e.preventDefault();
    status.textContent = "{'Creating your account...' if is_en else 'Creation du compte...'}";
    status.style.color = '#888';
    const fd = new FormData(form);
    try {{
      const r = await fetch('/api/lms/register', {{
        method: 'POST', credentials: 'include',
        headers: {{'Content-Type': 'application/json'}},
        body: JSON.stringify({{
          name: fd.get('name'),
          email: fd.get('email'),
          password: fd.get('password'),
          formationSlug: FORMATION_SLUG,
          formationTitle: FORMATION_TITLE,
          language: LANG
        }})
      }});
      const data = await r.json();
      if (r.ok && data.success) {{
        status.textContent = "{'Welcome! Redirecting to lesson 1...' if is_en else 'Bienvenue ! Redirection vers la lecon 1...'}";
        status.style.color = '#4ade80';
        setTimeout(() => window.location.href = "{base_url_prefix}/formations/" + FORMATION_SLUG + "/m1-l1", 1000);
      }} else {{
        status.textContent = data.error || "{'Error. Try with a different email.' if is_en else 'Erreur. Essayez avec un autre email.'}";
        status.style.color = '#f97316';
      }}
    }} catch(err) {{
      status.textContent = "{'Network error.' if is_en else 'Erreur reseau.'}";
      status.style.color = '#f97316';
    }}
  }});
}})();
</script>

<section class="formation-section">
<h2 class="section-title">{label_toc}</h2>
<div class="toc">
<ol>
{toc_items}
</ol>
</div>
</section>

<section class="formation-section">
<h2 class="section-title">{label_modules}</h2>
{modules_html}
</section>

<section class="formation-section" style="text-align:center;padding:3rem 2rem;background:linear-gradient(135deg,rgba(255,87,0,0.08),rgba(255,87,0,0.02));border:1px solid rgba(255,87,0,0.2);">
<h2 class="section-title" style="margin-bottom:1rem;">{label_cta_title}</h2>
<p style="max-width:42rem;margin:0 auto 2rem;color:rgba(229,226,225,0.7);">{label_cta_desc}</p>
{cta_fr if not is_en else cta_en}
</section>

</div>
</main>

<footer class="footer">
<div class="footer-grid">
<div><div class="footer-logo">PIRABEL LABS</div><p class="footer-desc">{"Premium digital agency. Headquartered in Abomey-Calavi, Benin." if is_en else "Agence digitale premium. Siège : Abomey-Calavi, Bénin."}</p></div>
<div><div class="footer-title">Formations</div><ul class="footer-links"><li><a href="{base_url_prefix}/formations/seo-debutant">SEO Débutant</a></li><li><a href="{base_url_prefix}/formations/wordpress-debutant">WordPress</a></li><li><a href="{base_url_prefix}/formations/marketing-digital-fondamentaux">Marketing Digital</a></li><li><a href="{base_url_prefix}/formations/">{"All trainings" if is_en else "Toutes les formations"}</a></li></ul></div>
<div><div class="footer-title">{"Cities" if is_en else "Villes"}</div><ul class="footer-links"><li><a href="{base_url_prefix}/agence-seo-referencement-naturel/abomey-calavi">Abomey-Calavi</a></li><li><a href="{base_url_prefix}/agence-seo-referencement-naturel/cotonou">Cotonou</a></li><li><a href="{base_url_prefix}/agence-seo-referencement-naturel/porto-novo">Porto-Novo</a></li><li><a href="{base_url_prefix}/agence-seo-referencement-naturel/parakou">Parakou</a></li></ul></div>
</div>
<div class="footer-bottom"><span>&copy; 2026 Pirabel Labs.</span><div style="display:flex;gap:2rem;"><a href="{base_url_prefix}/mentions-legales">{"Legal notice" if is_en else "Mentions légales"}</a></div></div>
</footer>
<script src="{css_prefix}js/global.js?v=5"></script>
<script src="{css_prefix}js/cookie-consent.js?v=1" defer></script>
<div class="lang-switch"><a href="/formations/{slug}"{' class="active"' if not is_en else ''}>FR</a><a href="/en/formations/{slug}"{' class="active"' if is_en else ''}>EN</a></div>
</body>
</html>
"""
