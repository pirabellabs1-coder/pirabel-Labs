#!/usr/bin/env python3
"""Genere les pages locales Porto-Novo et Parakou pour les 10 categories
services (FR + EN). Reuse du generator Abomey-Calavi avec content adapte."""
import re
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

CATEGORIES = [
    'agence-seo-referencement-naturel',
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

CITIES = {
    'porto-novo': {
        'name_fr': 'Porto-Novo',
        'name_en': 'Porto-Novo',
        'lat': 6.4969, 'lng': 2.6283,
        'region': 'Ouémé',
        'context_fr': ("Porto-Novo, capitale politique du Bénin et siège du gouvernement, "
                       "concentre les institutions publiques, les ambassades, les ONG "
                       "internationales et un tissu de PME en pleine modernisation digitale. "
                       "Pirabel Labs intervient depuis Abomey-Calavi pour accompagner les "
                       "acteurs économiques et institutionnels de Porto-Novo dans leur "
                       "transformation digitale."),
        'context_en': ("Porto-Novo, political capital of Benin and seat of the government, "
                       "concentrates public institutions, embassies, international NGOs and "
                       "a network of SMEs undergoing rapid digital modernization. "
                       "Pirabel Labs supports Porto-Novo's economic and institutional players "
                       "from its Abomey-Calavi headquarters."),
    },
    'parakou': {
        'name_fr': 'Parakou',
        'name_en': 'Parakou',
        'lat': 9.3372, 'lng': 2.6303,
        'region': 'Borgou',
        'context_fr': ("Parakou, troisième ville du Bénin et capitale économique du nord, "
                       "est un carrefour commercial majeur entre le Bénin, le Niger et le "
                       "Burkina Faso. Son tissu de PME agroalimentaires, transporteurs et "
                       "commerces de gros représente un marché digital en forte croissance "
                       "que Pirabel Labs accompagne avec une expertise terrain sahélienne."),
        'context_en': ("Parakou, Benin's third city and economic capital of the north, is a "
                       "major commercial crossroads between Benin, Niger and Burkina Faso. "
                       "Its network of agribusiness SMEs, transport operators and wholesale "
                       "trade represents a fast-growing digital market that Pirabel Labs "
                       "supports with Sahelian ground expertise."),
    },
}

SERVICE_LABELS = {
    'agence-seo-referencement-naturel': ('Agence SEO', 'SEO Agency', 'SEO & référencement naturel', 'SEO and organic search'),
    'agence-creation-sites-web': ('Création de sites web', 'Website creation', 'Sites web & e-commerce', 'Websites & e-commerce'),
    'agence-design-branding': ('Design & Branding', 'Design & Branding', 'Identité visuelle premium', 'Premium visual identity'),
    'agence-email-marketing-crm': ('Email Marketing & CRM', 'Email Marketing & CRM', 'Automation & CRM', 'Automation & CRM'),
    'agence-ia-automatisation': ('IA & Automatisation', 'AI & Automation', 'Intelligence artificielle', 'Artificial intelligence'),
    'agence-publicite-payante-sea-ads': ('Publicité payante', 'Paid advertising', 'Meta & Google Ads', 'Meta & Google Ads'),
    'agence-redaction-content-marketing': ('Rédaction & Content', 'Content Marketing', 'Content premium', 'Premium content'),
    'agence-sales-funnels-cro': ('Sales Funnels & CRO', 'Sales Funnels & CRO', 'Tunnels de vente', 'Sales funnels'),
    'agence-social-media': ('Social Media', 'Social Media', 'Réseaux sociaux', 'Social networks'),
    'agence-video-motion-design': ('Vidéo & Motion Design', 'Video & Motion Design', 'Production audiovisuelle', 'Audiovisual production'),
}

def build_page(category: str, city_slug: str, is_en: bool) -> str:
    city = CITIES[city_slug]
    city_name = city['name_en'] if is_en else city['name_fr']
    cat_short_fr, cat_short_en, cat_long_fr, cat_long_en = SERVICE_LABELS[category]
    cat_short = cat_short_en if is_en else cat_short_fr
    cat_long = cat_long_en if is_en else cat_long_fr
    context = city['context_en'] if is_en else city['context_fr']

    lang = 'en' if is_en else 'fr'
    css_prefix = '../../' if is_en else '../'
    base_url_prefix = '/en' if is_en else ''

    title_fr = f"{cat_short} à {city_name} · Pirabel Labs"
    title_en = f"{cat_short} in {city_name} · Pirabel Labs"
    title = title_en if is_en else title_fr

    desc_fr = f"{cat_short} à {city_name}, au Bénin. {cat_long} sur mesure pour PME, startups et institutions. Audit gratuit. Pirabel Labs, agence basée à Abomey-Calavi."
    desc_en = f"{cat_short} in {city_name}, Benin. {cat_long} for SMEs, startups and institutions. Free audit. Pirabel Labs, agency based in Abomey-Calavi."
    desc = desc_en if is_en else desc_fr

    canonical = f"https://www.pirabellabs.com{base_url_prefix}/{category}/{city_slug}"
    href_fr = f"https://www.pirabellabs.com/{category}/{city_slug}"
    href_en = f"https://www.pirabellabs.com/en/{category}/{city_slug}"

    schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": f"{canonical}#business",
        "name": f"Pirabel Labs — {city_name}",
        "description": f"{cat_short} {city_name}. {cat_long}. Agence basée à Abomey-Calavi (Bénin).",
        "url": canonical,
        "telephone": "+22901688884534",
        "email": "contact@pirabellabs.com",
        "image": "https://www.pirabellabs.com/img/logo.png",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": city_name,
            "addressRegion": city['region'],
            "addressCountry": "BJ",
        },
        "geo": {"@type": "GeoCoordinates", "latitude": city['lat'], "longitude": city['lng']},
        "openingHoursSpecification": [{
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "08:30", "closes": "18:30",
        }],
        "priceRange": "$$",
        "areaServed": [
            {"@type": "City", "name": city_name},
            {"@type": "AdministrativeArea", "name": city['region']},
        ],
        "serviceType": cat_long,
        "availableLanguage": ["French", "English"],
        "founder": [
            {"@type": "Person", "name": "Lissanon Gildas",
             "jobTitle": "Founder & CEO" if is_en else "Fondateur & CEO"},
            {"@type": "Person", "name": "Fidah Imorou",
             "jobTitle": "Co-founder" if is_en else "Co-fondateur"},
        ],
    }
    schema_str = json.dumps(schema, ensure_ascii=False, separators=(',', ':'))

    breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1,
             "name": "Home" if is_en else "Accueil",
             "item": f"https://www.pirabellabs.com{base_url_prefix}/"},
            {"@type": "ListItem", "position": 2,
             "name": cat_long,
             "item": f"https://www.pirabellabs.com{base_url_prefix}/{category}"},
            {"@type": "ListItem", "position": 3,
             "name": city_name, "item": canonical},
        ],
    }
    bc_str = json.dumps(breadcrumb, ensure_ascii=False, separators=(',', ':'))

    nav_links_fr = '<a href="/">ACCUEIL</a><a href="/services">SERVICES</a><a href="/blog">BLOG</a><a href="../guides/">GUIDES</a><a href="/resultats">RÉSULTATS</a><a href="/avis" class="link-underline">AVIS</a><a href="/a-propos">À PROPOS</a>'
    nav_links_en = '<a href="/en/">HOME</a><a href="/en/services">SERVICES</a><a href="/en/blog">BLOG</a><a href="../guides/">GUIDES</a><a href="/en/resultats">RESULTS</a><a href="/en/avis" class="link-underline">REVIEWS</a><a href="/en/a-propos">ABOUT</a>'

    cta_buttons_fr = '<div class="cta-buttons rv"><a href="/rendez-vous" class="btn btn--white">Prendre rendez-vous <span class="material-symbols-outlined">calendar_today</span></a><a href="/contact" class="btn btn--ghost-white">Nous contacter <span class="material-symbols-outlined">arrow_forward</span></a></div>'
    cta_buttons_en = '<div class="cta-buttons rv"><a href="/en/rendez-vous" class="btn btn--white">Book a meeting <span class="material-symbols-outlined">calendar_today</span></a><a href="/en/contact" class="btn btn--ghost-white">Contact us <span class="material-symbols-outlined">arrow_forward</span></a></div>'

    hero_h1_fr = f"{cat_short.upper()}<br>À <span style=\"color:var(--on-surface);font-style:italic;\">{city_name}.</span>"
    hero_h1_en = f"{cat_short.upper()}<br>IN <span style=\"color:var(--on-surface);font-style:italic;\">{city_name}.</span>"

    if is_en:
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="geo.position" content="{city['lat']};{city['lng']}">
<meta name="geo.placename" content="{city_name}, Benin">
<meta name="geo.region" content="BJ">
<title>{title}</title>
<meta name="description" content="{desc}">
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
<link rel="stylesheet" href="{css_prefix}css/illustrations.css">
<script type="application/ld+json">{schema_str}</script>
<script type="application/ld+json">{bc_str}</script>
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="Pirabel Labs">
<meta property="og:image" content="https://www.pirabellabs.com/img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@pirabellabs">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-H0ZTTRYBQ7"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-H0ZTTRYBQ7');</script>
</head>
<body>
<div id="progress-bar"></div>
<nav class="nav"><div class="nav-inner">
<a href="/en/" class="nav-logo"><img src="{css_prefix}img/logo.png" alt="Pirabel Labs" class="nav-logo-img" width="80" height="80" fetchpriority="high"></a>
<div class="nav-links">{nav_links_en}</div>
<a class="nav-login" href="/en/espace-client-4p8w1n"><span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;">person</span> My Account</a>
<a href="/en/contact" class="nav-cta">Free Audit</a>
<div class="nav-hamburger"><span></span><span></span><span></span></div>
</div></nav>

<main>
<header class="section" style="min-height:80vh;display:flex;align-items:center;padding-top:8rem;">
<div class="bg-text" style="top:15%;right:0;">{city_name}</div>
<div class="section-inner" style="width:100%;">
<div class="breadcrumb rv"><a href="/en/">Home</a><span class="sep">/</span><a href="index.html">{cat_long}</a><span class="sep">/</span><span>{city_name}</span></div>
<span class="pill rv">{cat_short} · {city_name}, Benin</span>
<h1 class="text-hero rv" style="color:#FF5500;margin:1.5rem 0 2rem;">{hero_h1_en}</h1>
<p class="text-body-lg rv" style="max-width:42rem;margin-bottom:2rem;">{context}</p>
<div style="display:flex;flex-wrap:wrap;gap:1.5rem;" class="rv">
<a href="/en/contact" class="btn btn--orange">Free audit in {city_name} <span class="material-symbols-outlined">arrow_forward</span></a>
<a href="index.html" class="btn btn--ghost">Our {cat_short} services</a>
</div>
</div>
</header>

<section class="section section--low">
<div class="section-inner">
<span class="text-label rv">Local context</span>
<h2 class="text-h2 rv" style="margin:1rem 0 1.5rem;">{cat_short.upper()} ADAPTED TO {city_name.upper()}</h2>
<p class="text-body-lg rv" style="max-width:60rem;margin-bottom:3rem;">{context} Our team designs strategies that account for local language patterns, mobile-first behavior, MTN and Moov Money payment integrations, and the WhatsApp Business-first culture of Beninese customer service.</p>
<div class="grid-3">
<div class="card rv rv-d1"><h3 class="text-h4" style="margin-bottom:1rem;color:var(--primary-container);">Local market understanding</h3><p class="text-body">We know the {city_name} ecosystem: institutions, SMEs, retailers and the specific challenges of operating in the {city['region']} region.</p></div>
<div class="card rv rv-d2"><h3 class="text-h4" style="margin-bottom:1rem;color:var(--primary-container);">Bilingual delivery</h3><p class="text-body">All deliverables in French and English, ready for both local market and international export communications.</p></div>
<div class="card rv rv-d3"><h3 class="text-h4" style="margin-bottom:1rem;color:var(--primary-container);">FCFA pricing</h3><p class="text-body">Pricing in West African CFA Franc, payment by Mobile Money MTN/Moov or international transfer. Transparent quotes.</p></div>
</div>
</div>
</section>

<section class="section section--cta" style="padding:6rem var(--px-page);text-align:center;">
<div class="section-inner">
<h2 class="text-h2 rv" style="color:var(--on-primary);margin-bottom:1.5rem;">READY TO DOMINATE IN {city_name.upper()}?</h2>
<p class="rv" style="color:rgba(92,25,0,0.8);margin-bottom:2rem;">Free audit — we analyse your situation and show you the path forward.</p>
{cta_buttons_en}
</div>
</section>
</main>

<footer class="footer">
<div class="footer-grid">
<div><div class="footer-logo">PIRABEL LABS</div><p class="footer-desc">Premium digital agency. Headquartered in Abomey-Calavi, Benin.</p></div>
<div><div class="footer-title">Services</div><ul class="footer-links"><li><a href="../agence-seo-referencement-naturel/">SEO</a></li><li><a href="../agence-creation-sites-web/">Websites</a></li><li><a href="../agence-ia-automatisation/">AI</a></li><li><a href="../agence-design-branding/">Branding</a></li></ul></div>
<div><div class="footer-title">Cities</div><ul class="footer-links"><li><a href="abomey-calavi.html">Abomey-Calavi</a></li><li><a href="cotonou.html">Cotonou</a></li><li><a href="porto-novo.html">Porto-Novo</a></li><li><a href="parakou.html">Parakou</a></li></ul></div>
</div>
<div class="footer-bottom"><span>&copy; 2026 Pirabel Labs.</span><div style="display:flex;gap:2rem;"><a href="/en/mentions-legales">Legal notice</a></div></div>
</footer>
<script src="{css_prefix}js/global.js?v=5"></script>
<script src="{css_prefix}js/cookie-consent.js?v=1" defer></script>
<div class="lang-switch"><a href="/{category}/{city_slug}">FR</a><a href="#" class="active">EN</a></div>
</body>
</html>
"""
    # FR
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="geo.position" content="{city['lat']};{city['lng']}">
<meta name="geo.placename" content="{city_name}, Bénin">
<meta name="geo.region" content="BJ">
<title>{title}</title>
<meta name="description" content="{desc}">
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
<link rel="stylesheet" href="{css_prefix}css/illustrations.css">
<script type="application/ld+json">{schema_str}</script>
<script type="application/ld+json">{bc_str}</script>
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<meta property="og:site_name" content="Pirabel Labs">
<meta property="og:image" content="https://www.pirabellabs.com/img/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@pirabellabs">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-H0ZTTRYBQ7"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-H0ZTTRYBQ7');</script>
</head>
<body>
<div id="progress-bar"></div>
<nav class="nav"><div class="nav-inner">
<a href="/" class="nav-logo"><img src="{css_prefix}img/logo.png" alt="Pirabel Labs" class="nav-logo-img" width="80" height="80" fetchpriority="high"></a>
<div class="nav-links">{nav_links_fr}</div>
<a class="nav-login" href="/espace-client-4p8w1n"><span class="material-symbols-outlined" style="font-size:1rem;vertical-align:middle;">person</span> Mon Espace</a>
<a href="/contact" class="nav-cta">Audit Gratuit</a>
<div class="nav-hamburger"><span></span><span></span><span></span></div>
</div></nav>

<main>
<header class="section" style="min-height:80vh;display:flex;align-items:center;padding-top:8rem;">
<div class="bg-text" style="top:15%;right:0;">{city_name}</div>
<div class="section-inner" style="width:100%;">
<div class="breadcrumb rv"><a href="/">Accueil</a><span class="sep">/</span><a href="index.html">{cat_long}</a><span class="sep">/</span><span>{city_name}</span></div>
<span class="pill rv">{cat_short} · {city_name}, Bénin</span>
<h1 class="text-hero rv" style="color:#FF5500;margin:1.5rem 0 2rem;">{hero_h1_fr}</h1>
<p class="text-body-lg rv" style="max-width:42rem;margin-bottom:2rem;">{context}</p>
<div style="display:flex;flex-wrap:wrap;gap:1.5rem;" class="rv">
<a href="/contact" class="btn btn--orange">Audit gratuit à {city_name} <span class="material-symbols-outlined">arrow_forward</span></a>
<a href="index.html" class="btn btn--ghost">Nos services {cat_short.lower()}</a>
</div>
</div>
</header>

<section class="section section--low">
<div class="section-inner">
<span class="text-label rv">Contexte local</span>
<h2 class="text-h2 rv" style="margin:1rem 0 1.5rem;">{cat_short.upper()} ADAPTÉ À {city_name.upper()}</h2>
<p class="text-body-lg rv" style="max-width:60rem;margin-bottom:3rem;">{context} Nos équipes conçoivent des stratégies qui tiennent compte des particularités linguistiques locales, du comportement mobile-first, des intégrations de paiement Mobile Money MTN et Moov, et de la culture WhatsApp Business qui domine la relation client béninoise.</p>
<div class="grid-3">
<div class="card rv rv-d1"><h3 class="text-h4" style="margin-bottom:1rem;color:var(--primary-container);">Connaissance du marché local</h3><p class="text-body">Nous connaissons l'écosystème {city_name} : institutions, PME, commerces et les défis spécifiques d'opérer dans la région {city['region']}.</p></div>
<div class="card rv rv-d2"><h3 class="text-h4" style="margin-bottom:1rem;color:var(--primary-container);">Livraison bilingue</h3><p class="text-body">Tous les livrables en français et en anglais, prêts à la fois pour le marché local et pour vos communications d'export.</p></div>
<div class="card rv rv-d3"><h3 class="text-h4" style="margin-bottom:1rem;color:var(--primary-container);">Tarifs en FCFA</h3><p class="text-body">Facturation en franc CFA, paiement par Mobile Money MTN/Moov ou virement international. Devis transparents.</p></div>
</div>
</div>
</section>

<section class="section section--cta" style="padding:6rem var(--px-page);text-align:center;">
<div class="section-inner">
<h2 class="text-h2 rv" style="color:var(--on-primary);margin-bottom:1.5rem;">PRÊT À DOMINER À {city_name.upper()} ?</h2>
<p class="rv" style="color:rgba(92,25,0,0.8);margin-bottom:2rem;">Audit gratuit — on analyse votre situation et on vous montre comment accélérer.</p>
{cta_buttons_fr}
</div>
</section>
</main>

<footer class="footer">
<div class="footer-grid">
<div><div class="footer-logo">PIRABEL LABS</div><p class="footer-desc">Agence digitale premium. Siège : Abomey-Calavi, Bénin.</p></div>
<div><div class="footer-title">Services</div><ul class="footer-links"><li><a href="../agence-seo-referencement-naturel/">SEO</a></li><li><a href="../agence-creation-sites-web/">Sites Web</a></li><li><a href="../agence-ia-automatisation/">IA</a></li><li><a href="../agence-design-branding/">Branding</a></li></ul></div>
<div><div class="footer-title">Villes</div><ul class="footer-links"><li><a href="abomey-calavi.html">Abomey-Calavi</a></li><li><a href="cotonou.html">Cotonou</a></li><li><a href="porto-novo.html">Porto-Novo</a></li><li><a href="parakou.html">Parakou</a></li></ul></div>
</div>
<div class="footer-bottom"><span>&copy; 2026 Pirabel Labs.</span><div style="display:flex;gap:2rem;"><a href="/mentions-legales">Mentions légales</a></div></div>
</footer>
<script src="{css_prefix}js/global.js?v=5"></script>
<script src="{css_prefix}js/cookie-consent.js?v=1" defer></script>
<div class="lang-switch"><a href="#" class="active">FR</a><a href="/en/{category}/{city_slug}.html">EN</a></div>
</body>
</html>
"""

count = 0
for cat in CATEGORIES:
    for city in CITIES:
        for is_en in (False, True):
            base = ROOT / ('en/' + cat if is_en else cat)
            if not base.exists():
                continue
            target = base / f'{city}.html'
            if target.exists():
                continue
            target.write_text(build_page(cat, city, is_en), encoding='utf-8')
            count += 1

print(f"Pages locales Benin++ creees : {count}")
