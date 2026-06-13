#!/usr/bin/env python3
"""Build static pages for Pirabel Labs site.

Source of truth pour header/nav/footer + sections reusables.
Re-executer apres edition : python scripts/build_pages.py
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

# ============== HEAD / NAV / FOOTER ==============

NAV_LINKS = [
    ('creation-site-web', 'Sites web'),
    ('creation-application', 'Applications'),
    ('automatisation', 'Automatisation'),
    ('seo', 'SEO'),
]

EXTRA_CSS = """
/* Service page styles */
.svc-hero { padding-top:clamp(7rem,14vw,10rem); padding-bottom:clamp(4rem,10vw,7rem); position:relative; overflow:hidden; }
.svc-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 80% 50% at 50% 0%, var(--accent-soft) 0%, transparent 50%); pointer-events:none; z-index:0; }
.svc-hero__inner { position:relative; z-index:1; max-width:48rem; }
.svc-hero h1 { margin-bottom:1rem; }
.svc-hero p { font-size:clamp(1.05rem,1.5vw,1.2rem); color:var(--text-muted); margin-bottom:2rem; max-width:42rem; }

.sub-services-grid { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap:1rem; }
.sub-service-card { background:var(--bg-2); border:1px solid var(--border); padding:1.75rem 1.5rem; transition:border-color var(--t); }
.sub-service-card:hover { border-color:var(--accent); }
.sub-service-card__icon { width:2.5rem; height:2.5rem; display:inline-flex; align-items:center; justify-content:center; background:var(--accent-soft); color:var(--accent); margin-bottom:1rem; }
.sub-service-card__icon .material-symbols-outlined { font-size:1.4rem; }
.sub-service-card__title { font-family:var(--font-display); font-weight:700; font-size:1rem; margin-bottom:.5rem; }
.sub-service-card__desc { font-size:.85rem; color:var(--text-muted); line-height:1.6; }

.process-list { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap:1.5rem; }
.process-step { padding:1.5rem; background:var(--bg-2); border:1px solid var(--border); }
.process-step__num { display:inline-block; padding:.3rem .65rem; background:var(--accent); color:#fff; font-family:var(--font-display); font-weight:700; font-size:.7rem; text-transform:uppercase; letter-spacing:.1em; margin-bottom:.85rem; }
.process-step__title { font-family:var(--font-display); font-weight:700; font-size:1rem; margin-bottom:.5rem; }
.process-step__desc { font-size:.85rem; color:var(--text-muted); line-height:1.55; }

.benefit-list { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap:1rem; }
.benefit { display:flex; gap:.85rem; padding:1.25rem; background:var(--bg-2); border:1px solid var(--border); }
.benefit__icon { color:var(--accent); font-size:1.5rem; flex-shrink:0; line-height:1; }
.benefit__title { font-family:var(--font-display); font-weight:700; font-size:.95rem; margin-bottom:.25rem; }
.benefit__desc { font-size:.82rem; color:var(--text-muted); line-height:1.5; }

.faq { display:flex; flex-direction:column; gap:.5rem; max-width:48rem; margin:0 auto; }
.faq__item { background:var(--bg-2); border:1px solid var(--border); }
.faq__item[open] { border-color:var(--accent); }
.faq__q { padding:1.15rem 1.5rem; cursor:pointer; font-family:var(--font-display); font-weight:600; font-size:.95rem; list-style:none; display:flex; justify-content:space-between; align-items:center; gap:1rem; }
.faq__q::-webkit-details-marker { display:none; }
.faq__q::after { content:'+'; font-size:1.5rem; color:var(--accent); transition:transform var(--t); line-height:1; flex-shrink:0; }
.faq__item[open] .faq__q::after { transform:rotate(45deg); }
.faq__a { padding:0 1.5rem 1.15rem; color:var(--text-muted); line-height:1.7; font-size:.9rem; }

.use-cases { display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap:1rem; }
.use-case { padding:1.5rem; background:var(--bg-2); border:1px solid var(--border); border-left:3px solid var(--accent); }
.use-case__title { font-family:var(--font-display); font-weight:700; font-size:.95rem; margin-bottom:.5rem; }
.use-case__desc { font-size:.85rem; color:var(--text-muted); line-height:1.55; }
"""

def head(title, description, path, schema_jsonld=None, robots='index, follow, max-image-preview:large, max-snippet:-1', extra_styles=''):
    schema_block = ''
    if schema_jsonld:
        schema_block = '<script type="application/ld+json">' + json.dumps(schema_jsonld, ensure_ascii=False) + '</script>'
    extra_style_block = ('<style>' + extra_styles + '</style>') if extra_styles else ''
    return ('<!doctype html>\n<html lang="fr">\n<head>\n'
            '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>' + title + '</title>\n'
            '<meta name="description" content="' + description + '">\n'
            '<link rel="canonical" href="https://www.pirabellabs.com' + path + '">\n'
            '<link rel="alternate" hreflang="fr" href="https://www.pirabellabs.com' + path + '">\n'
            '<link rel="alternate" hreflang="x-default" href="https://www.pirabellabs.com' + path + '">\n'
            '<link rel="icon" type="image/png" href="/img/favicon.png">\n'
            '<link rel="apple-touch-icon" href="/img/favicon.png">\n'
            '<meta property="og:type" content="website">\n'
            '<meta property="og:title" content="' + title + '">\n'
            '<meta property="og:description" content="' + description + '">\n'
            '<meta property="og:url" content="https://www.pirabellabs.com' + path + '">\n'
            '<meta property="og:image" content="https://www.pirabellabs.com/img/og-image.png">\n'
            '<meta property="og:site_name" content="Pirabel Labs">\n'
            '<meta property="og:locale" content="fr_FR">\n'
            '<meta name="twitter:card" content="summary_large_image">\n'
            '<meta name="robots" content="' + robots + '">\n'
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
            '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap">\n'
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" media="print" onload="this.media=\'all\'">\n'
            '<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"></noscript>\n'
            '<link rel="stylesheet" href="/css/global.css">\n'
            + extra_style_block + schema_block +
            '</head>\n<body>')


def nav(active_slug=''):
    links = ''
    for slug, label in NAV_LINKS:
        cls = 'nav__link nav__link--active' if slug == active_slug else 'nav__link'
        links += '<a href="/' + slug + '" class="' + cls + '">' + label + '</a>'
    return ('<nav class="nav" id="nav">\n'
            '<div class="nav__inner">\n'
            '<a href="/" class="nav__logo" aria-label="Pirabel Labs - accueil">\n'
            '<img src="/img/logo.png" alt="Pirabel Labs" width="36" height="36">\n'
            '<span>Pirabel Labs</span>\n'
            '</a>\n'
            '<div class="nav__links" id="navLinks">' + links +
            '<a href="/a-propos" class="nav__link">Qui sommes-nous</a>'
            '<a href="/contact" class="nav__cta">Reserver un appel</a></div>\n'
            '<button class="nav__burger" id="navBurger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>\n'
            '</div>\n</nav>')


FOOTER = ('<footer class="footer"><div class="container"><div class="footer__grid">'
          '<div><div class="footer__brand">Pirabel Labs</div>'
          '<p class="footer__tagline">Studio tech specialise creation de sites, applications, automatisation et SEO. Base a Abomey-Calavi, Benin.</p></div>'
          '<div><div class="footer__title">Services</div><ul class="footer__list">'
          '<li><a href="/creation-site-web">Creation de sites</a></li>'
          '<li><a href="/creation-application">Applications</a></li>'
          '<li><a href="/automatisation">Automatisation</a></li>'
          '<li><a href="/seo">SEO</a></li></ul></div>'
          '<div><div class="footer__title">Studio</div><ul class="footer__list">'
          '<li><a href="/a-propos">A propos</a></li>'
          '<li><a href="/#methodologie">Methodologie</a></li>'
          '<li><a href="/#tarifs">Tarifs</a></li>'
          '<li><a href="/contact">Contact</a></li></ul></div>'
          '<div><div class="footer__title">Contact</div><ul class="footer__list">'
          '<li><a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a></li>'
          '<li><span style="color:var(--text-faint);">Abomey-Calavi, Benin</span></li></ul></div>'
          '</div><div class="footer__bottom">'
          '<span>&copy; 2026 Pirabel Labs. Tous droits reserves.</span>'
          '<div class="flex" style="gap:1.25rem;"><a href="/mentions-legales">Mentions legales</a><a href="/politique-confidentialite">Confidentialite</a></div>'
          '</div></div></footer>')

SCRIPT = ('<script>(function(){var b=document.getElementById("navBurger"),l=document.getElementById("navLinks");'
          'if(!b||!l)return;b.addEventListener("click",function(){var o=l.classList.toggle("open");'
          'b.classList.toggle("open",o);b.setAttribute("aria-expanded",o);});'
          'l.addEventListener("click",function(e){if(e.target.tagName==="A"&&window.innerWidth<880){'
          'l.classList.remove("open");b.classList.remove("open");}});})();</script></body></html>')


def render(title, description, path, body_html, schema=None, active='', robots='index, follow, max-image-preview:large, max-snippet:-1', extra_styles=''):
    return head(title, description, path, schema, robots, extra_styles) + nav(active) + body_html + FOOTER + SCRIPT


# ============== SCHEMA ==============

ORG_SCHEMA = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "name": "Pirabel Labs",
    "url": "https://www.pirabellabs.com",
    "logo": "https://www.pirabellabs.com/img/logo.png",
    "address": {"@type": "PostalAddress", "addressLocality": "Abomey-Calavi", "addressCountry": "BJ"},
    "email": "contact@pirabellabs.com",
    "founder": [
        {"@type": "Person", "name": "Lissanon Gildas", "jobTitle": "Cofondateur"},
        {"@type": "Person", "name": "Fidah Imorou", "jobTitle": "Cofondateur"}
    ],
    "areaServed": ["BJ", "FR", "CI", "SN", "CM", "TG", "BF", "ML"],
    "knowsLanguage": "fr"
}

def service_schema(name, description, url):
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": name,
        "description": description,
        "url": url,
        "provider": ORG_SCHEMA,
        "areaServed": ["BJ", "FR", "CI", "SN", "CM", "TG", "BF", "ML"]
    }


# ============== SECTIONS REUSABLES ==============

def svc_hero(badge, title, lead):
    return ('<section class="svc-hero"><div class="container svc-hero__inner">'
            '<span class="badge mb-3"><span class="material-symbols-outlined">bolt</span> ' + badge + '</span>'
            '<h1>' + title + '</h1><p>' + lead + '</p>'
            '<div class="hero__actions">'
            '<a href="/contact" class="btn btn--primary btn--lg">Reserver un appel <span class="material-symbols-outlined">arrow_forward</span></a>'
            '<a href="#process" class="btn btn--ghost btn--lg">Comment on travaille</a>'
            '</div></div></section>')


def sub_services(eyebrow, h2, intro, items):
    """items : list of (icon, title, desc)"""
    cards = ''
    for icon, t, d in items:
        cards += ('<div class="sub-service-card">'
                  '<div class="sub-service-card__icon"><span class="material-symbols-outlined">' + icon + '</span></div>'
                  '<h3 class="sub-service-card__title">' + t + '</h3>'
                  '<p class="sub-service-card__desc">' + d + '</p></div>')
    return ('<section class="section"><div class="container">'
            '<div class="mb-5"><span class="eyebrow">' + eyebrow + '</span><h2>' + h2 + '</h2>'
            '<p class="lead mt-3">' + intro + '</p></div>'
            '<div class="sub-services-grid">' + cards + '</div></div></section>')


def benefits_section(eyebrow, h2, items, bg=False):
    """items : list of (icon, title, desc)"""
    cards = ''
    for icon, t, d in items:
        cards += ('<div class="benefit">'
                  '<span class="material-symbols-outlined benefit__icon">' + icon + '</span>'
                  '<div><div class="benefit__title">' + t + '</div>'
                  '<div class="benefit__desc">' + d + '</div></div></div>')
    bg_style = ' style="background:var(--bg-2);"' if bg else ''
    return ('<section class="section"' + bg_style + '><div class="container">'
            '<div class="mb-5"><span class="eyebrow">' + eyebrow + '</span><h2>' + h2 + '</h2></div>'
            '<div class="benefit-list">' + cards + '</div></div></section>')


def use_cases_section(eyebrow, h2, items):
    """items : list of (title, desc)"""
    cards = ''
    for t, d in items:
        cards += ('<div class="use-case"><div class="use-case__title">' + t + '</div>'
                  '<div class="use-case__desc">' + d + '</div></div>')
    return ('<section class="section" style="background:var(--bg-2);"><div class="container">'
            '<div class="mb-5"><span class="eyebrow">' + eyebrow + '</span><h2>' + h2 + '</h2></div>'
            '<div class="use-cases">' + cards + '</div></div></section>')


def process_section(steps):
    """steps : list of (num, title, desc)"""
    cards = ''
    for num, t, d in steps:
        cards += ('<div class="process-step">'
                  '<span class="process-step__num">' + num + '</span>'
                  '<div class="process-step__title">' + t + '</div>'
                  '<p class="process-step__desc">' + d + '</p></div>')
    return ('<section class="section" id="process"><div class="container">'
            '<div class="mb-5"><span class="eyebrow">Comment on travaille</span>'
            '<h2>Notre methodologie en 4 etapes.</h2></div>'
            '<div class="process-list">' + cards + '</div></div></section>')


def faq_section(items, bg=True):
    """items : list of (question, answer)"""
    details = ''
    for q, a in items:
        details += '<details class="faq__item"><summary class="faq__q">' + q + '</summary><div class="faq__a">' + a + '</div></details>'
    bg_style = ' style="background:var(--bg-2);"' if bg else ''
    return ('<section class="section"' + bg_style + '><div class="container">'
            '<div class="mb-5 text-center"><span class="eyebrow">Questions frequentes</span>'
            '<h2>Ce qu\'on nous demande souvent.</h2></div>'
            '<div class="faq">' + details + '</div></div></section>')


def cta_final(title='Pret a discuter de votre projet ?', subtitle='Echange decouverte de 30 minutes, gratuit et sans engagement.'):
    return ('<section class="section"><div class="container">'
            '<div class="card" style="padding:3rem 2rem;text-align:center;border-color:var(--accent);background:linear-gradient(135deg,var(--accent-soft),transparent);">'
            '<h2 style="margin-bottom:1rem;">' + title + '</h2>'
            '<p class="lead" style="margin:0 auto 2rem;">' + subtitle + '</p>'
            '<div class="flex flex--center flex--wrap">'
            '<a href="/contact" class="btn btn--primary btn--lg">Reserver un appel <span class="material-symbols-outlined">arrow_forward</span></a>'
            '<a href="mailto:contact@pirabellabs.com" class="btn btn--ghost btn--lg">contact@pirabellabs.com</a>'
            '</div></div></div></section>')


# =================== PAGES SERVICES ===================

def page_creation_site_web():
    body = svc_hero(
        'Sites vitrine, e-commerce, landing pages',
        'Des sites web qui retiennent l\'attention. Et qui convertissent.',
        'Plus de 7 secondes pour charger, votre visiteur est parti. Plus de 3 clics pour comprendre votre offre, votre visiteur est parti. On construit des sites qui transforment visiteurs en clients.'
    )
    body += sub_services(
        'Ce que nous livrons', 'Trois types de sites, un seul niveau d\'exigence.',
        'On choisit la technologie en fonction de votre projet, pas l\'inverse. Si WordPress suffit, on fait WordPress. Si Webflow est mieux, on fait Webflow. Si vous avez besoin de code sur mesure, on code.',
        [
            ('language', 'Sites vitrine premium', 'Site institutionnel haut de gamme pour PME, cabinets de conseil, professions liberales. WordPress optimise ou code sur mesure. Lighthouse 95+ garanti.'),
            ('shopping_cart', 'E-commerce performant', 'Shopify ou WooCommerce selon votre volume. Tunnel de vente optimise, paiements locaux (Mobile Money, Stripe), SEO produit, gestion logistique.'),
            ('rocket_launch', 'Landing pages haute conversion', 'Pages dediees pour vos campagnes Ads, lancements produit, lead magnets. Conception orientee conversion, A/B test inclus sur les CTAs principaux.'),
            ('redeem', 'Refonte de site existant', 'Vous avez un site mais il ne convertit pas, charge mal, ou n\'est pas indexable. On refond intelligemment sans perdre votre SEO existant.'),
            ('connect_without_contact', 'Headless / Jamstack', 'Sites Next.js + CMS (Strapi, Sanity, Contentful) pour les marques avec ambitions multi-canal et besoin de performance maximale.'),
            ('integration_instructions', 'Migration CMS', 'Vous voulez quitter WordPress pour Webflow ? Ou l\'inverse ? On migre votre contenu sans perte SEO ni downtime.'),
        ]
    )
    body += benefits_section(
        'Inclus dans chaque projet', 'Plus qu\'un site : une fondation digitale.',
        [
            ('speed', 'Performance native', 'Core Web Vitals dans le vert. Images WebP/AVIF, CDN global, lazy load, code minifie.'),
            ('search', 'SEO on-page complet', 'Structure HTML semantique, schema.org, sitemap, meta optimises. Indexable des le jour 1.'),
            ('phone_iphone', 'Mobile-first', 'Pense pour le mobile d\'abord (60-80% du trafic en Afrique). Tests sur appareils reels.'),
            ('security', 'Securite & hebergement', 'HTTPS, headers de securite, backup automatique quotidien. Hebergement 1ere annee inclus.'),
            ('accessibility', 'Accessibilite WCAG AA', 'Contraste, navigation clavier, screen reader, alt text. Conformite legale incluse.'),
            ('school', 'Formation a l\'admin', 'Session 1h en visio pour vous rendre autonome sur les mises a jour de contenu courantes.'),
        ],
        bg=True
    )
    body += use_cases_section(
        'Pour qui c\'est fait', 'Quelques exemples de projets que nous menons.',
        [
            ('PME B2B 5-50 salaries', 'Cabinet de conseil, agence locale, prestataire de service qui veut une presence digitale credible et bien indexee.'),
            ('Marques DTC en lancement', 'Site Shopify avec branding fort, tunnel de vente optimise, integration Mobile Money et Stripe.'),
            ('Cabinets professionnels', 'Avocats, experts-comptables, medecins specialistes. Site institutionnel premium avec prise de RDV en ligne.'),
            ('Lancement de produit', 'Landing page haute conversion pour une campagne d\'acquisition Meta Ads ou Google Ads.'),
            ('Marketplaces', 'Plateforme bilateres (vendeurs/acheteurs) avec gestion utilisateurs, paiements, modlation. WordPress ou Next.js custom.'),
            ('Refonte SaaS', 'Site marketing d\'un SaaS B2B existant : home, pricing, blog SEO, integrations. Stack Next.js + Sanity.'),
        ]
    )
    body += process_section([
        ('Etape 01', 'Atelier brief', 'Echange 1-2h pour cadrer scope, audience, ton, references inspirantes. Document de cadrage livre.'),
        ('Etape 02', 'Maquette Figma', 'Design des pages cles sous 1-2 semaines. Validation visuelle avant de coder, iterations incluses.'),
        ('Etape 03', 'Developpement', 'Integration et developpement en sprints. Vous avez acces a un environnement de preview en temps reel.'),
        ('Etape 04', 'Mise en ligne', 'Tests cross-browser, SEO check, configuration DNS, formation. Suivi garantie 30 jours.'),
    ])
    body += faq_section([
        ('Quel CMS choisir entre WordPress, Webflow et code sur mesure ?',
         'WordPress : si votre equipe ajoutera souvent du contenu (blog actif, fiches produit) et qu\'on veut un cout d\'evolution maitrise. Webflow : si le design est tres pousse et l\'equipe de contenu reduite. Code sur mesure (Next.js) : si vous avez des besoins specifiques (animations, performance, integration complexe). On vous conseille selon votre contexte reel.'),
        ('Combien coute un site vitrine en moyenne ?',
         'Pour une PME francophone : 2 500-6 000 EUR pour un site vitrine 5-10 pages complet (design + dev + SEO + hebergement 1ere annee). E-commerce : 4 000-15 000 EUR selon nombre de produits et complexite logistique. Devis ferme sous 48h apres l\'appel decouverte.'),
        ('Vous garantissez le SEO ?',
         'On garantit l\'optimisation SEO ON-PAGE (structure, meta, vitesse, schema, contenu indexable). Les positions dans Google ne se garantissent jamais car elles dependent aussi de votre autorite (backlinks, contenu, anciennete). On vous donne par contre des positions cibles realistes et une roadmap pour les atteindre.'),
        ('Qui herberge le site apres livraison ?',
         'On hebergement chez Vercel (sites Next.js), WP Engine ou Kinsta (WordPress), Webflow (Webflow). Hebergement 1ere annee inclus dans le prix. Apres : entre 12 et 60 EUR/mois selon technologie, factures directement par l\'hebergeur (vous gardez le controle).'),
        ('Vous integrez Mobile Money pour les paiements ?',
         'Oui. MTN Mobile Money, Moov Money, Wave (Senegal/Cote d\'Ivoire), Orange Money, ainsi que les solutions multi-operateur (Yannel, CinetPay, KKiaPay, Hub2). Pour les paiements internationaux : Stripe, PayPal. Selon votre clientele.'),
        ('Vous gerez la maintenance ensuite ?',
         'En option, jamais en obligation. Pack heures (5/10/20h a consommer), forfait mensuel (350-1 500 EUR/mois selon scope) ou intervention ponctuelle. Vous etes libre de partir vers un autre prestataire, le code et la doc sont a vous.'),
    ])
    body += cta_final()
    body = '<main>' + body + '</main>'
    schema = service_schema(
        'Creation de sites web',
        'Sites vitrine, e-commerce, landing pages et refontes performants. Lighthouse 95+, SEO inclus, hebergement 1ere annee. Devis ferme sous 48h.',
        'https://www.pirabellabs.com/creation-site-web'
    )
    return render(
        'Creation de sites web | Pirabel Labs - Studio tech Benin',
        'Pirabel Labs cree des sites web performants pour PME francophones : vitrine, e-commerce, landing pages, refonte. Lighthouse 95+ garanti, SEO inclus, devis ferme 48h.',
        '/creation-site-web', body, schema, active='creation-site-web', extra_styles=EXTRA_CSS
    )


def page_creation_application():
    body = svc_hero(
        'Web apps, SaaS, mobile, MVP',
        'Des applications qui scalent, sans dette technique.',
        'Vous avez une idee ou un produit existant qui plafonne. On construit la prochaine etape : architecture moderne, code testable, scalable des le jour 1. Du MVP en 6 semaines au SaaS multi-clients.'
    )
    body += sub_services(
        'Trois angles d\'intervention', 'On prend le relais ou demarre from scratch.',
        'Que vous partiez d\'une page blanche, d\'un produit existant qui souffre, ou que vous ayez besoin d\'une equipe externe pour appuyer l\'interne, on adapte le mode d\'engagement.',
        [
            ('flag', 'MVP en 6-10 semaines', 'Vous avez une idee validee mais pas de produit. On construit la version la plus simple qui prouve le concept, mesurable.'),
            ('expand', 'Refonte / scale-up', 'Votre app existe mais souffre (lenteur, bugs, dette). On audite, on planifie une refonte progressive sans tout casser.'),
            ('engineering', 'Equipe embedded', 'Vous avez besoin de capacite tech additionnelle. On rejoint votre equipe, sprints partages, livraison continue.'),
            ('dashboard', 'Dashboard interne', 'Vous voulez un tableau de bord pour visualiser vos donnees metier. Custom React + connexion a vos sources (Postgres, Airtable, Notion, etc.).'),
            ('phone_android', 'App mobile (React Native)', 'Application iOS + Android publiable sur les stores, partageant 90% du code. Notification push, offline-first, integration paiements.'),
            ('admin_panel_settings', 'Back-office sur mesure', 'Interface admin pour gerer vos donnees metier (commandes, clients, stocks, utilisateurs) si vous avez deja un front-end.'),
        ]
    )
    body += benefits_section(
        'Nos garanties techniques', 'Une app qui durera plus que 6 mois.',
        [
            ('code', 'Code testable', 'Tests unitaires et d\'integration sur la logique metier. Couverture realiste, pas du 100% theorique.'),
            ('description', 'Documentation complete', 'README, architecture, deploiement, runbook ops. Un autre dev peut reprendre le projet sans nous.'),
            ('lock', 'Securite incluse', 'OWASP Top 10, validation des inputs, authentification robuste, secrets dans .env. Pas d\'oublis de base.'),
            ('cloud_sync', 'CI/CD setup', 'Deploiement automatique sur push, environnement staging, rollback en 1 clic. Pas de deploiement manuel risque.'),
            ('analytics', 'Observabilite', 'Logs structures (Vercel/Sentry), monitoring uptime, alertes sur erreurs critiques. Vous voyez ce qui se passe en prod.'),
            ('open_in_new', 'Vous etes proprietaire', 'Code source, designs, infra : tout vous appartient. Pas de prison technologique, pas de licence verrouillee.'),
        ],
        bg=True
    )
    body += use_cases_section(
        'Types de projets que nous menons', 'Quelques exemples concrets.',
        [
            ('SaaS B2B en lancement', 'Startup qui veut son MVP fonctionnel avec auth, paiement (Stripe), dashboard et API publique. 6-10 semaines de demarrage.'),
            ('Plateforme metier', 'PME qui veut une appli interne pour gerer sa specificite (logistique, RH, planning, etc.). Remplace Excel.'),
            ('Marketplace 2-sided', 'Plateforme vendeurs/acheteurs avec gestion des transactions, evaluations, paiements multipartites.'),
            ('App mobile native-feel', 'Application accessible iOS + Android avec experience proche d\'une app native (offline, notifs push).'),
            ('Migration legacy', 'Refonte d\'une app PHP/MySQL vieille de 10 ans vers Next.js + Postgres sans interruption de service.'),
            ('Dashboard analytics', 'Visualisation de KPI metier provenant de plusieurs sources (Stripe, GA4, CRM, base interne).'),
        ]
    )
    body += process_section([
        ('Etape 01', 'Specification', 'Atelier 2-3h pour cadrer scope, parcours utilisateur, schema de donnees. Document de specification livre.'),
        ('Etape 02', 'Sprint 0', 'Setup technique (repo, CI/CD, infra) + maquettes Figma + schema BDD. 1-2 semaines.'),
        ('Etape 03', 'Sprints dev', 'Sprints de 1 semaine. Demo hebdo. Feedback continu, ajustements rapides.'),
        ('Etape 04', 'Mise en prod', 'Tests E2E, formation utilisateurs, runbook ops, garantie 30 jours.'),
    ])
    body += faq_section([
        ('Quelle est la difference entre MVP et v1 ?',
         'MVP = Minimum Viable Product. Version la plus simple qui prouve que les utilisateurs veulent payer pour votre solution. Souvent on enleve 50% des fonctionnalites pretendues necessaires. v1 = MVP enrichi des fonctionnalites validees par les premiers utilisateurs. Strategie : MVP en 6-10 semaines, puis iteration tous les 2-3 mois.'),
        ('Combien coute une web app sur mesure ?',
         'MVP simple (auth, CRUD basique, paiement Stripe) : 8 000-15 000 EUR. Application complexe (multi-roles, integrations, mobile) : 18 000-40 000 EUR. SaaS multi-tenant complet : 35 000-100 000+ EUR. Devis ferme apres scoping precis.'),
        ('Vous travaillez sur quelle stack ?',
         'Front : Next.js, React, Tailwind CSS, TanStack Query. Mobile : React Native (Expo). Back : Node.js (NestJS ou Express), Postgres ou Supabase, Prisma ORM. Infra : Vercel pour Next.js, Railway pour APIs, AWS si besoins specifiques. Choix mature, ecosysteme massif, recrutement facile.'),
        ('Vous gerez les paiements (Stripe, Mobile Money) ?',
         'Oui. Stripe (carte, abonnement, marketplaces multipartites), Mobile Money (CinetPay, KKiaPay, Hub2 pour multi-operateur), PayPal, Wise pour internationaux. Integration complete avec webhooks securises et reconciliation.'),
        ('Et apres la livraison, qui maintient ?',
         'A votre choix. Trois options : (1) On continue en regie au TJM, (2) On forme votre dev interne et on quitte, (3) On vous accompagne en mode part-time sur la roadmap a venir. Aucun verrou, code documente, transmission propre.'),
        ('Vous gardez le code source ?',
         'Non, vous le gardez integralement. Le repo Git est sur votre organisation GitHub des le sprint 0. Vous avez tous les droits. On a juste un acces collaborateur pendant le projet.'),
    ])
    body += cta_final()
    body = '<main>' + body + '</main>'
    schema = service_schema(
        'Creation d\'applications web et mobiles',
        'Applications web, SaaS et mobile sur mesure. Stack Next.js + Node + Postgres. MVP en 6 semaines, refonte ou equipe externe dediee.',
        'https://www.pirabellabs.com/creation-application'
    )
    return render(
        'Creation d\'applications web et mobiles | Pirabel Labs',
        'Pirabel Labs developpe applications web, SaaS et mobile pour PME francophones. Next.js + Node + Postgres. MVP en 6 semaines, code documente, devis ferme 48h.',
        '/creation-application', body, schema, active='creation-application', extra_styles=EXTRA_CSS
    )


def page_automatisation():
    body = svc_hero(
        'Make, n8n, Zapier, agents IA',
        'Vos equipes economisent 10 a 30 heures par semaine.',
        'Saisie manuelle, copier-coller entre outils, suivi Excel : autant de taches qui empechent vos equipes de creer de la valeur. On les automatise. Du simple workflow Make au chatbot IA pour le support client.'
    )
    body += sub_services(
        'Cas d\'usage frequents', 'Choisis parce qu\'ils paient toujours en quelques mois.',
        'On commence par 1-2 workflows a fort ROI, mis en production en 2-3 semaines. Premiers benefices mesurables vite, puis on etend a d\'autres process.',
        [
            ('autorenew', 'Synchronisation d\'outils', 'CRM <-> compta, devis <-> facture, leads <-> campagne email. Plus de double saisie, plus d\'oubli, tracabilite complete.'),
            ('chat', 'Chatbots IA support', 'Repondre 24/7 aux 50-70% de questions repetitives. Integration WhatsApp, site web, Messenger. Escalade automatique vers humain si besoin.'),
            ('mail', 'Sequences nurturing', 'Email + SMS + WhatsApp coordonnes selon le comportement. Lead score qui declenche un appel commercial au bon moment.'),
            ('description', 'Generation de documents', 'Devis, factures, contrats automatiquement crees depuis vos formulaires. PDF prerempli, signature electronique, archivage Drive/OneDrive.'),
            ('insights', 'Reporting automatique', 'Dashboard hebdo envoye aux dirigeants. Donnees consolidees depuis vos outils, alertes sur les KPIs critiques.'),
            ('smart_toy', 'Agents IA metier', 'IA qualifie les leads entrants, route les messages, redige les premiers brouillons d\'email, analyse les avis clients. Sur mesure pour votre process.'),
        ]
    )
    body += benefits_section(
        'Approche pragmatique', 'On ne fait pas de la tech pour la tech.',
        [
            ('savings', 'ROI mesure en heures', 'Avant : combien d\'heures par semaine sur cette tache. Apres : combien d\'heures liberees. On chiffre l\'economie reelle.'),
            ('schedule', 'Quick wins d\'abord', 'On demarre par 1-2 automatisations a fort ROI, livrees en 2-3 semaines. Pas 6 mois d\'audit theorique.'),
            ('handyman', 'Outils standards', 'Make, n8n, Zapier : pas de dependance a un dev custom. Votre equipe peut comprendre et ajuster apres notre depart.'),
            ('error', 'Monitoring inclus', 'Surveillance des workflows, alertes en cas d\'erreur, logs accessibles. Pas de surprise silencieuse.'),
            ('school', 'Formation incluse', 'Session 2h pour rendre votre equipe autonome sur les ajustements simples. Documentation Notion partagee.'),
            ('integration_instructions', 'Connecteurs prets', 'Salesforce, HubSpot, Pipedrive, Brevo, Mailchimp, Notion, Airtable, Sheets, Slack, Stripe... Quasi tout outil moderne se branche.'),
        ],
        bg=True
    )
    body += use_cases_section(
        'Exemples concrets', 'Ce qu\'on a deja automatise.',
        [
            ('Lead inbound qualifie', 'Formulaire site -> qualification IA -> creation CRM -> assignation commercial -> notification Slack -> premier email auto. 5 minutes au lieu de 30.'),
            ('Devis -> contrat', 'Devis signe -> creation client compta -> generation contrat PDF -> envoi DocuSign -> archive cloud + notification interne.'),
            ('Support client 24/7', 'Chatbot WhatsApp + site avec base de connaissance interne. 50-70% des questions resolues sans humain. Escalade au support pour le reste.'),
            ('Onboarding utilisateur SaaS', 'Inscription -> creation tenant -> seed donnees demo -> email bienvenue -> sequence nurturing 7 jours -> NPS J+30.'),
            ('Reporting hebdo automatique', 'Donnees Stripe + GA4 + CRM -> consolidation Sheets -> generation PDF -> envoi Slack/email dirigeants chaque lundi 8h.'),
            ('Recrutement assiste IA', 'CV recu -> parsing IA -> scoring vs criteres -> notification RH si match -> reponse automatique candidat selon score.'),
        ]
    )
    body += process_section([
        ('Etape 01', 'Audit process', 'Cartographie de vos workflows actuels. Identification des taches a fort potentiel d\'automatisation.'),
        ('Etape 02', 'Roadmap priorisee', 'Liste des automatisations classees par impact / effort. On valide ensemble les 2-3 premieres.'),
        ('Etape 03', 'Implementation', 'Quick wins mis en prod en 2-3 semaines. Tests en parallele de l\'existant avant bascule.'),
        ('Etape 04', 'Industrialisation', 'Extension aux autres process, formation equipe, monitoring continu.'),
    ])
    body += faq_section([
        ('Quelle est la difference entre Make, n8n et Zapier ?',
         'Zapier : ecosysteme le plus complet (5000+ integrations), interface ultra-simple, plus cher en volume. Make : visuellement plus puissant, meilleur rapport qualite-prix, courbe d\'apprentissage moyenne. n8n : self-hosted possible (donnees chez vous), open-source, plus technique mais sans limite. On choisit selon votre volume, criticite et besoins de confidentialite.'),
        ('Combien coute un projet automatisation ?',
         'Quick wins (1-3 workflows simples) : 1 500-3 500 EUR. Projet moyen (5-10 workflows + chatbot IA basique) : 4 000-9 000 EUR. Industrialisation (10+ workflows, agents IA complexes, dashboards) : 12 000-30 000 EUR. Plus abonnement outils (Make/n8n : 30-150 EUR/mois selon volume).'),
        ('Vos automatisations utilisent l\'IA ?',
         'Oui, quand pertinent. OpenAI (GPT-4o), Claude, Mistral selon le cas. Use cases courants : qualification de leads, redaction d\'emails, classification de tickets support, synthese de documents. On vous accompagne sur le prompt engineering et les garde-fous.'),
        ('Mes donnees passent ou ?',
         'Cela depend de l\'outil. Zapier/Make : leurs serveurs (US/EU). n8n self-hosted : vos serveurs (controle total). On vous explique exactement le flux et les implications RGPD pour chaque integration. Pour les donnees sensibles, on privilegie n8n.'),
        ('Vous formez mes equipes ?',
         'Oui, c\'est inclus. Session 2h avec votre equipe pour rendre autonome sur les ajustements simples : modifier un texte, ajouter un destinataire, monitorer les erreurs. Documentation Notion partagee avec captures et videos.'),
        ('Que se passe-t-il si un workflow plante ?',
         'Make/n8n/Zapier proposent du monitoring natif (alertes par email/Slack). On configure les alertes au sprint 1. Pour les workflows critiques, on ajoute un canal d\'escalade. Et on documente les playbooks de resolution.'),
    ])
    body += cta_final('Quelles taches voulez-vous arreter de faire a la main ?', 'Echange decouverte gratuit pour identifier les 2-3 automatisations a fort ROI dans votre business.')
    body = '<main>' + body + '</main>'
    schema = service_schema(
        'Automatisation et agents IA',
        'Automatisation de workflows (Make, n8n, Zapier), agents IA, chatbots. Vos equipes economisent 10 a 30h par semaine, ROI mesurable en 60 jours.',
        'https://www.pirabellabs.com/automatisation'
    )
    return render(
        'Automatisation et agents IA | Pirabel Labs - Studio tech Benin',
        'Pirabel Labs automatise vos workflows : Make, n8n, Zapier, agents IA, chatbots. Vos equipes economisent 10 a 30h/semaine. ROI mesurable, devis ferme 48h.',
        '/automatisation', body, schema, active='automatisation', extra_styles=EXTRA_CSS
    )


def page_seo():
    body = svc_hero(
        'Audit, contenu, technique, netlinking',
        'Du trafic qualifie qui convertit, mois apres mois.',
        'Le SEO mal fait coute cher pour rien. Bien fait, c\'est l\'investissement digital le plus rentable a 18-24 mois. On audite, on planifie, on execute - sur des KPI mesurables.'
    )
    body += sub_services(
        'Nos prestations SEO', 'Du diagnostic ponctuel a l\'accompagnement long terme.',
        'On adapte le format a votre besoin. Audit unique pour une roadmap autonome, accompagnement mensuel pour une progression continue, ou mission specifique pour un objectif precis.',
        [
            ('search_check', 'Audit SEO complet', 'Diagnostic technique + on-page + concurrence + opportunites. Document 40-60 pages avec roadmap priorisee. Livrable autonome.'),
            ('build', 'SEO technique', 'Crawl, indexation, Core Web Vitals, schema.org, structure URL. La fondation invisible mais critique.'),
            ('article', 'Strategie de contenu', 'Recherche d\'intentions, briefs, calendrier editorial, optimisation on-page. Articles qui rankent ET convertissent.'),
            ('link', 'Netlinking ethique', 'Identification d\'opportunites, prise de contact, guest posting, citations locales. White hat exclusivement, pas de PBN.'),
            ('location_on', 'SEO local', 'Google Business Profile, citations NAP, avis Google, schema LocalBusiness. Pack local + Maps.'),
            ('handshake', 'Accompagnement mensuel', 'Suivi de positions, reporting mensuel, optimisations continues. Engagement court terme renouvelable.'),
        ]
    )
    body += benefits_section(
        'Notre approche', 'Pas de promesses fantaisistes, des resultats mesures.',
        [
            ('flag', 'KPI business, pas vanity metrics', 'On suit le trafic qualifie et les conversions, pas juste les positions theoriques sur des mots-cles sans volume.'),
            ('verified', 'White hat exclusif', 'Pas de PBN, pas de spam, pas d\'achat de liens douteux. Strategies durables qui survivent aux Core Updates.'),
            ('description', 'Reporting transparent', 'Dashboard Looker Studio partage, mise a jour automatique. Vous voyez les KPIs en temps reel, pas un PDF mensuel.'),
            ('schedule', 'Resultats mesures sous 90 jours', 'Premiers gains visibles entre 60 et 120 jours selon votre marche. On ajuste si l\'execution ne donne pas les resultats attendus.'),
            ('school', 'Transfert de competence', 'Sessions de formation regulieres pour rendre votre equipe autonome. Pas de dependance perpetuelle au prestataire.'),
            ('insights', 'Outils pro inclus', 'Ahrefs, Semrush, Search Console, GA4, Looker Studio configures et partages. Vous gardez l\'acces apres notre depart.'),
        ],
        bg=True
    )
    body += use_cases_section(
        'Pour qui on intervient', 'Profils d\'entreprises qu\'on accompagne.',
        [
            ('PME francophones avec site existant', 'Site en place mais trafic SEO faible. Audit + roadmap + execution sur 6-12 mois. Croissance progressive du trafic qualifie.'),
            ('Lancement de site / refonte', 'Nouveau site ou refonte majeure. Architecture SEO des le depart pour eviter de tout reprendre dans 12 mois.'),
            ('E-commerce qui stagne', 'Site marchand avec produits mais peu de trafic produit ou categorie. Optimisation des fiches, contenu satellite, schema Product.'),
            ('Activite locale (1-5 villes)', 'Cabinet, restaurant, prestataire local. Focus Google Business Profile + pages locales + avis Google + citations NAP.'),
            ('SaaS B2B', 'Strategie de contenu pour generer des leads qualifies. Articles guides longs + landing pages produit + comparatifs.'),
            ('Site frappe par une penalite', 'Chute de trafic suite a un Core Update ou penalite manuelle. Diagnostic + plan de remediation + suivi de la recuperation.'),
        ]
    )
    body += process_section([
        ('Etape 01', 'Audit & diagnostic', 'Crawl complet, analyse concurrence, identification des opportunites. Document de 30-60 pages livre.'),
        ('Etape 02', 'Roadmap 6 mois', 'Plan d\'action priorise par impact / effort. Quick wins en 1-2 mois, fondamentaux en 3-6 mois.'),
        ('Etape 03', 'Execution', 'Implementation technique, redaction contenus, prise de contact backlinks. Reporting mensuel transparent.'),
        ('Etape 04', 'Mesure & iteration', 'Suivi positions, trafic, conversions. Ajustements continus.'),
    ])
    body += faq_section([
        ('Combien de temps avant de voir des resultats SEO ?',
         'Premiers signaux (impressions) : 30-60 jours. Premiers clics qualifies : 60-120 jours. Resultats significatifs (trafic mesurable, leads) : 4-9 mois selon votre marche et la concurrence. Le SEO est un investissement moyen-long terme, pas un canal d\'urgence. Pour le court terme, on recommande Google Ads en parallele.'),
        ('Combien coute un accompagnement SEO ?',
         'Audit ponctuel : 1 500-4 000 EUR selon taille du site. Accompagnement mensuel : 800-2 500 EUR/mois (PME), 3 000-8 000 EUR/mois (mid-market). Mission specifique (migration, recuperation penalite) : 2 500-10 000 EUR au forfait. On adapte au scope reel.'),
        ('Pourquoi vous ne garantissez pas le top 3 Google ?',
         'Parce que personne ne peut le garantir honnetement. Le ranking depend de facteurs hors de notre controle : evolutions des algorithmes Google, actions des concurrents, autorite historique de votre domaine. On garantit l\'execution white hat et la qualite du travail. On vous donne des positions cibles realistes basees sur l\'analyse de votre marche.'),
        ('Vous utilisez l\'IA pour generer du contenu ?',
         'Pas pour le contenu de fond (Google penalise depuis 2024 les contenus IA non edites). On utilise l\'IA pour : recherche de mots-cles, brief redactionnel, premieres versions a editer par un humain expert, traduction. Le contenu publie est toujours edite et valide par un humain.'),
        ('Mes anciens backlinks sont importants ?',
         'Oui, ils representent une partie de votre autorite. On audite votre profil de liens existant avec Ahrefs : on identifie les liens toxiques (a desavouer via Search Console) et les bons liens (a renforcer). C\'est inclus dans l\'audit initial.'),
        ('Vous travaillez avec quels outils ?',
         'Audit : Ahrefs, Semrush, Screaming Frog, Search Console. Tracking : Search Console, GA4, Looker Studio. Contenu : Surfer SEO, Frase, Grammarly. Backlinks : Ahrefs, BuzzStream pour l\'outreach. Tout standard, ce qui veut dire compatible avec votre equipe future.'),
    ])
    body += cta_final('Vous voulez savoir ou en est votre SEO ?', 'Audit flash gratuit de votre site : top 5 problemes a regler en priorite, opportunites de mots-cles, etat de la concurrence.')
    body = '<main>' + body + '</main>'
    schema = service_schema(
        'Conseil et accompagnement SEO',
        'Audit SEO complet, strategie de contenu, netlinking ethique, SEO local. Trafic qualifie mesurable mois apres mois.',
        'https://www.pirabellabs.com/seo'
    )
    return render(
        'Agence SEO et referencement | Pirabel Labs - Audit gratuit',
        'Pirabel Labs ameliore votre referencement Google : audit, contenu, netlinking, SEO local. Du trafic qualifie qui convertit, KPI business mesurables. Devis ferme 48h.',
        '/seo', body, schema, active='seo', extra_styles=EXTRA_CSS
    )


# ============== PAGES SECONDAIRES ==============

def page_a_propos():
    body = ('<section class="hero"><div class="container hero__inner">'
            '<span class="badge mb-3"><span class="material-symbols-outlined">groups</span> Le studio</span>'
            '<h1>Un studio tech ancre au Benin, ouvert sur le monde francophone.</h1>'
            '<p>Pirabel Labs a ete fonde en 2020 a Abomey-Calavi par Lissanon Gildas et Fidah Imorou. Notre conviction : la qualite premium n\'a pas de geographie. On construit pour des PME au Benin, en France, en Cote d\'Ivoire et au-dela, avec le meme niveau d\'exigence.</p>'
            '</div></section>'

            '<section class="section"><div class="container">'
            '<div class="mb-5"><span class="eyebrow">Les fondateurs</span><h2>Deux profils complementaires.</h2></div>'
            '<div class="grid grid--2">'
            '<div class="card"><h3 class="card__title">Lissanon Gildas <span style="color:var(--text-faint);font-weight:400;font-size:.9em;">Cofondateur</span></h3>'
            '<p class="card__desc">Expert technique, en charge du developpement, des architectures et de la qualite code. 10+ annees d\'experience sur des projets web, applications et automatisation pour des clients en Afrique de l\'Ouest et en Europe.</p></div>'
            '<div class="card"><h3 class="card__title">Fidah Imorou <span style="color:var(--text-faint);font-weight:400;font-size:.9em;">Cofondateur</span></h3>'
            '<p class="card__desc">Expert SEO et strategie digitale, en charge du contenu, du referencement et de la croissance organique. 8+ annees d\'experience SEO pour des marques francophones.</p></div>'
            '</div></div></section>'

            '<section class="section" style="background:var(--bg-2);"><div class="container">'
            '<div class="mb-5"><span class="eyebrow">Nos valeurs</span><h2>Travailler bien, livrer juste.</h2></div>'
            '<div class="grid grid--3 grid--3-tablet">'
            '<div class="card"><div class="card__icon"><span class="material-symbols-outlined">target</span></div>'
            '<h3 class="card__title">Exigence sur le livrable</h3>'
            '<p class="card__desc">Pas de "ca passe". Ce qu\'on livre, on le mettrait sur notre propre site. Si on ne le ferait pas pour nous, on ne le fait pas pour vous.</p></div>'
            '<div class="card"><div class="card__icon"><span class="material-symbols-outlined">chat</span></div>'
            '<h3 class="card__title">Transparence radicale</h3>'
            '<p class="card__desc">Vous savez ou en est le projet, ce qui prend du temps et pourquoi. Pas de jargon pour faire savant, pas de cachoterie sur la difficulte.</p></div>'
            '<div class="card"><div class="card__icon"><span class="material-symbols-outlined">trending_up</span></div>'
            '<h3 class="card__title">Le long terme avant le court</h3>'
            '<p class="card__desc">On prefere un client qui revient dans 2 ans avec un autre projet plutot que vous facturer un truc dont vous n\'avez pas besoin maintenant.</p></div>'
            '</div></div></section>'

            '<section class="section"><div class="container">'
            '<div class="mb-5"><span class="eyebrow">Ou nous trouver</span><h2>Bases au Benin, joignables partout.</h2></div>'
            '<div class="grid grid--2">'
            '<div><h3 style="font-size:1.1rem;margin-bottom:.75rem;">Siege</h3><p>Abomey-Calavi, Benin<br>(Departement de l\'Atlantique)</p></div>'
            '<div><h3 style="font-size:1.1rem;margin-bottom:.75rem;">Contact</h3><p><a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a><br>Reponse sous 24h ouvres.</p></div>'
            '</div></div></section>'
            ) + cta_final()
    body = '<main>' + body + '</main>'
    return render(
        'A propos - Studio tech au Benin | Pirabel Labs',
        'Pirabel Labs est un studio tech fonde en 2020 a Abomey-Calavi (Benin) par Lissanon Gildas et Fidah Imorou. Sites, applications, automatisation, SEO pour PME francophones.',
        '/a-propos', body, ORG_SCHEMA, active=''
    )


def page_contact():
    body = ('<section class="hero"><div class="container hero__inner">'
            '<span class="badge mb-3"><span class="material-symbols-outlined">mail</span> Contact</span>'
            '<h1>Parlons de votre projet.</h1>'
            '<p>Decrivez en quelques mots votre besoin, on vous repond sous 24h ouvres avec une premiere estimation et la prochaine etape proposee.</p>'
            '</div></section>'

            '<section class="section section--tight"><div class="container">'
            '<div class="grid" style="grid-template-columns:1.4fr 1fr;gap:3rem;">'
            '<form id="contactForm" class="form" style="max-width:none;">'
            '<input type="text" name="website_url" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">'
            '<div class="field--row">'
            '<div class="field"><label class="field__label" for="cf-name">Votre nom *</label><input id="cf-name" class="field__input" type="text" name="name" required maxlength="100" autocomplete="name"></div>'
            '<div class="field"><label class="field__label" for="cf-email">Email *</label><input id="cf-email" class="field__input" type="email" name="email" required maxlength="200" autocomplete="email"></div>'
            '</div>'
            '<div class="field--row">'
            '<div class="field"><label class="field__label" for="cf-company">Entreprise</label><input id="cf-company" class="field__input" type="text" name="company" maxlength="120" autocomplete="organization"></div>'
            '<div class="field"><label class="field__label" for="cf-phone">Telephone</label><input id="cf-phone" class="field__input" type="tel" name="phone" maxlength="30" autocomplete="tel"></div>'
            '</div>'
            '<div class="field">'
            '<label class="field__label" for="cf-service">Quel service vous interesse ? *</label>'
            '<select id="cf-service" class="field__select" name="service" required>'
            '<option value="">Selectionnez...</option>'
            '<option value="site-web">Creation de site web</option>'
            '<option value="application">Creation d\'application</option>'
            '<option value="automatisation">Automatisation / Agents IA</option>'
            '<option value="seo">SEO et referencement</option>'
            '<option value="autre">Autre / Plusieurs</option>'
            '</select>'
            '</div>'
            '<div class="field">'
            '<label class="field__label" for="cf-message">Decrivez votre projet *</label>'
            '<textarea id="cf-message" class="field__textarea" name="message" required maxlength="3000" placeholder="Contexte, besoin, contrainte de delai, budget si vous l\'avez deja en tete..."></textarea>'
            '<span class="field__hint">Plus c\'est precis, plus on peut etre utile dans la reponse.</span>'
            '</div>'
            '<div id="cf-alert" style="display:none;padding:1rem 1.25rem;font-size:.92rem;line-height:1.5;"></div>'
            '<button type="submit" class="btn btn--primary btn--lg" id="cf-submit">Envoyer ma demande <span class="material-symbols-outlined">send</span></button>'
            '</form>'

            '<aside style="border:1px solid var(--border);padding:2rem;background:var(--bg-2);height:fit-content;">'
            '<h3 style="font-size:1rem;margin-bottom:.75rem;">Reponse rapide</h3>'
            '<p style="font-size:.9rem;margin-bottom:1.5rem;">On repond a toutes les demandes serieuses sous 24h ouvres. Premiere estimation gratuite et sans engagement.</p>'
            '<h3 style="font-size:1rem;margin-bottom:.75rem;">Email direct</h3>'
            '<p style="margin-bottom:1.5rem;"><a href="mailto:contact@pirabellabs.com" style="font-size:.95rem;">contact@pirabellabs.com</a></p>'
            '<h3 style="font-size:1rem;margin-bottom:.75rem;">Localisation</h3>'
            '<p style="font-size:.9rem;color:var(--text-muted);">Abomey-Calavi, Benin<br>Travail en distance avec clients en France, Cote d\'Ivoire, Senegal, Cameroun.</p>'
            '</aside>'
            '</div></div></section>')
    body = '<main>' + body + '</main>'
    body += ('<script>'
             '(function(){var form=document.getElementById("contactForm"),btn=document.getElementById("cf-submit"),alertEl=document.getElementById("cf-alert");'
             'if(!form)return;function showAlert(msg,type){alertEl.style.display="block";'
             'alertEl.style.background=type==="success"?"rgba(74,222,128,.1)":"rgba(248,113,113,.1)";'
             'alertEl.style.color=type==="success"?"#4ade80":"#f87171";'
             'alertEl.style.border="1px solid "+(type==="success"?"rgba(74,222,128,.3)":"rgba(248,113,113,.3)");'
             'alertEl.textContent=msg;}'
             'form.addEventListener("submit",function(e){e.preventDefault();btn.disabled=true;btn.textContent="Envoi en cours...";'
             'var data=Object.fromEntries(new FormData(form));'
             'fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)})'
             '.then(function(r){return r.json();}).then(function(res){'
             'if(res&&res.success){showAlert(res.message||"Demande envoyee. Reponse sous 24h ouvres.","success");form.reset();btn.textContent="Envoyee";}'
             'else{showAlert((res&&res.error)||"Erreur, reessayez ou ecrivez a contact@pirabellabs.com","error");btn.disabled=false;btn.innerHTML="Envoyer ma demande";}'
             '}).catch(function(){showAlert("Erreur reseau. Reessayez ou ecrivez directement a contact@pirabellabs.com","error");btn.disabled=false;btn.innerHTML="Envoyer ma demande";});'
             '});})();'
             '</script>')
    return render(
        'Contact - Pirabel Labs | Reponse sous 24h',
        'Contactez Pirabel Labs pour un devis. Sites web, applications, automatisation, SEO. Reponse sous 24h ouvres, premiere estimation gratuite et sans engagement.',
        '/contact', body, None, active=''
    )


def page_realisations():
    body = ('<section class="hero"><div class="container hero__inner">'
            '<span class="badge mb-3"><span class="material-symbols-outlined">photo_library</span> Realisations</span>'
            '<h1>Nos projets recents.</h1>'
            '<p>Cette section est en cours de mise a jour. Nous selectionnons les projets les plus representatifs de notre travail pour les presenter ici.</p>'
            '<div class="hero__actions"><a href="/contact" class="btn btn--primary btn--lg">Demander des references <span class="material-symbols-outlined">arrow_forward</span></a></div>'
            '</div></section>'
            '<section class="section"><div class="container text-center">'
            '<div style="max-width:36rem;margin:0 auto;padding:3rem 0;">'
            '<div style="font-size:4rem;color:var(--accent);margin-bottom:1.5rem;"><span class="material-symbols-outlined" style="font-size:4rem;">construction</span></div>'
            '<h2 style="margin-bottom:1rem;">Cas clients en preparation</h2>'
            '<p class="lead" style="margin:0 auto 2rem;">Nous travaillons avec des clients qui nous demandent souvent la confidentialite. Pour vous donner des references concretes adaptees a votre secteur, contactez-nous.</p>'
            '<a href="/contact" class="btn btn--primary btn--lg">Demander des references precises <span class="material-symbols-outlined">arrow_forward</span></a>'
            '</div></div></section>')
    body = '<main>' + body + '</main>'
    return render(
        'Realisations - Cas clients | Pirabel Labs',
        'Decouvrez les realisations Pirabel Labs : sites web, applications, automatisations, projets SEO. Contactez-nous pour des references precises a votre secteur.',
        '/realisations', body, None, active=''
    )


def page_blog():
    body = ('<section class="hero"><div class="container hero__inner">'
            '<span class="badge mb-3"><span class="material-symbols-outlined">article</span> Blog</span>'
            '<h1>Notre carnet de bord.</h1>'
            '<p>Articles d\'autorite sur la creation de sites, le developpement d\'applications, l\'automatisation et le SEO. Pratique, sans bullshit, base sur ce qu\'on voit sur le terrain.</p>'
            '</div></section>'
            '<section class="section"><div class="container text-center">'
            '<div style="max-width:36rem;margin:0 auto;padding:3rem 0;">'
            '<div style="font-size:4rem;color:var(--accent);margin-bottom:1.5rem;"><span class="material-symbols-outlined" style="font-size:4rem;">edit_note</span></div>'
            '<h2 style="margin-bottom:1rem;">Premiers articles bientot</h2>'
            '<p class="lead" style="margin:0 auto 2rem;">On prepare une selection d\'articles longs et substantiels sur les sujets qui comptent : combien coute un site pro, par ou commencer son SEO, etc.</p>'
            '<a href="/contact" class="btn btn--primary btn--lg">Recevoir l\'avis d\'un expert <span class="material-symbols-outlined">arrow_forward</span></a>'
            '</div></div></section>')
    body = '<main>' + body + '</main>'
    return render(
        'Blog - Conseils pratiques | Pirabel Labs',
        'Articles d\'autorite Pirabel Labs sur la creation de sites web, le developpement d\'applications, l\'automatisation et le SEO. Pratique, sans bullshit.',
        '/blog', body, None, active=''
    )


def page_mentions():
    body = ('<section class="section--hero"><div class="container">'
            '<span class="badge mb-3">Informations legales</span>'
            '<h1 style="font-size:clamp(2rem,4vw,3rem);">Mentions legales</h1>'
            '<p class="lead" style="margin-top:1rem;">Informations relatives a l\'editeur du site et a son hebergement.</p>'
            '</div></section>'
            '<section class="section"><div class="container" style="max-width:48rem;">'
            '<h2>Editeur</h2><p><strong>Pirabel Labs</strong><br>Studio tech<br>Abomey-Calavi, Benin<br>Email : <a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a></p>'
            '<h2 class="mt-5">Cofondateurs</h2><p>Lissanon Gildas et Fidah Imorou.</p>'
            '<h2 class="mt-5">Hebergeur</h2><p><strong>Vercel Inc.</strong><br>340 S Lemon Ave #4133<br>Walnut, CA 91789, USA<br>Site : <a href="https://vercel.com" rel="noopener" target="_blank">vercel.com</a></p>'
            '<h2 class="mt-5">Propriete intellectuelle</h2><p>L\'ensemble des contenus presents sur ce site est la propriete exclusive de Pirabel Labs, sauf mention contraire. Toute reproduction, meme partielle, sans autorisation prealable ecrite, est interdite.</p>'
            '<h2 class="mt-5">Responsabilite</h2><p>Pirabel Labs s\'efforce d\'assurer l\'exactitude des informations diffusees mais ne peut etre tenu responsable des erreurs eventuelles.</p>'
            '<h2 class="mt-5">Contact</h2><p>Pour toute question relative aux mentions legales : <a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a></p>'
            '</div></section>')
    body = '<main>' + body + '</main>'
    return render(
        'Mentions legales | Pirabel Labs',
        'Mentions legales de Pirabel Labs - studio tech base a Abomey-Calavi (Benin). Editeur, hebergeur, propriete intellectuelle.',
        '/mentions-legales', body, None, active='', robots='index, follow'
    )


def page_privacy():
    body = ('<section class="section--hero"><div class="container">'
            '<span class="badge mb-3">Vie privee</span>'
            '<h1 style="font-size:clamp(2rem,4vw,3rem);">Politique de confidentialite</h1>'
            '<p class="lead" style="margin-top:1rem;">Comment nous collectons, utilisons et protegons vos donnees.</p>'
            '</div></section>'
            '<section class="section"><div class="container" style="max-width:48rem;">'
            '<h2>Donnees collectees</h2><p>Nous collectons uniquement les donnees que vous nous fournissez via notre formulaire de contact : nom, email, telephone (optionnel), entreprise (optionnel), service d\'interet et description de votre projet.</p>'
            '<h2 class="mt-5">Finalite</h2><p>Ces donnees servent uniquement a vous repondre, a comprendre votre besoin et a vous proposer un devis. Aucune cession a un tiers.</p>'
            '<h2 class="mt-5">Duree de conservation</h2>'
            '<ul style="list-style:disc;margin-left:1.5rem;color:var(--text-muted);line-height:1.8;">'
            '<li>Demandes sans suite : conservees 12 mois puis supprimees</li>'
            '<li>Clients actifs : conservees pendant la duree de la relation + 3 ans</li>'
            '<li>Vos donnees ne sont jamais vendues ni partagees a des fins marketing</li>'
            '</ul>'
            '<h2 class="mt-5">Vos droits (RGPD)</h2><p>Vous disposez d\'un droit d\'acces, de rectification, d\'effacement, de portabilite et d\'opposition. Exercez ces droits a <a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a>. Nous repondons sous 30 jours.</p>'
            '<h2 class="mt-5">Cookies</h2><p>Cookies techniques strictement necessaires (session, securite). Aucun cookie tiers, aucun tracker publicitaire.</p>'
            '<h2 class="mt-5">Securite</h2><p>Donnees en HTTPS, stockage chiffre au repos, acces administratif protege par MFA.</p>'
            '<h2 class="mt-5">Contact</h2><p>Question, reclamation ou exercice d\'un droit : <a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a></p>'
            '</div></section>')
    body = '<main>' + body + '</main>'
    return render(
        'Politique de confidentialite | Pirabel Labs',
        'Politique de confidentialite Pirabel Labs : donnees collectees, finalite, conservation, droits RGPD, cookies, securite.',
        '/politique-confidentialite', body, None, active='', robots='index, follow'
    )


def page_404():
    body = ('<section class="hero"><div class="container hero__inner text-center">'
            '<div style="font-size:5rem;font-family:var(--font-display);font-weight:800;color:var(--accent);line-height:1;margin-bottom:1.5rem;">404</div>'
            '<h1>Cette page n\'existe pas.</h1>'
            '<p style="margin-left:auto;margin-right:auto;">Le lien que vous avez suivi est peut-etre obsolete. Voici quelques pistes pour vous y retrouver.</p>'
            '<div class="hero__actions" style="justify-content:center;">'
            '<a href="/" class="btn btn--primary btn--lg">Retour a l\'accueil <span class="material-symbols-outlined">arrow_forward</span></a>'
            '<a href="/contact" class="btn btn--ghost btn--lg">Nous contacter</a>'
            '</div></div></section>'
            '<section class="section"><div class="container">'
            '<div class="services-grid">'
            '<a href="/creation-site-web" class="service-card"><div class="service-card__icon"><span class="material-symbols-outlined">web</span></div><h3 class="service-card__title">Sites web</h3><span class="service-card__link">Voir <span class="material-symbols-outlined">arrow_forward</span></span></a>'
            '<a href="/creation-application" class="service-card"><div class="service-card__icon"><span class="material-symbols-outlined">terminal</span></div><h3 class="service-card__title">Applications</h3><span class="service-card__link">Voir <span class="material-symbols-outlined">arrow_forward</span></span></a>'
            '<a href="/automatisation" class="service-card"><div class="service-card__icon"><span class="material-symbols-outlined">smart_toy</span></div><h3 class="service-card__title">Automatisation</h3><span class="service-card__link">Voir <span class="material-symbols-outlined">arrow_forward</span></span></a>'
            '<a href="/seo" class="service-card"><div class="service-card__icon"><span class="material-symbols-outlined">search_insights</span></div><h3 class="service-card__title">SEO</h3><span class="service-card__link">Voir <span class="material-symbols-outlined">arrow_forward</span></span></a>'
            '</div></div></section>')
    body = '<main>' + body + '</main>'
    return render(
        'Page introuvable | Pirabel Labs',
        'Cette page n\'existe pas. Decouvrez les services Pirabel Labs : creation de sites, applications, automatisation et SEO.',
        '/404', body, None, active='', robots='noindex, follow'
    )


# =================== BUILD ===================

PAGES = [
    ('creation-site-web.html', page_creation_site_web),
    ('creation-application.html', page_creation_application),
    ('automatisation.html', page_automatisation),
    ('seo.html', page_seo),
    ('a-propos.html', page_a_propos),
    ('contact.html', page_contact),
    ('realisations.html', page_realisations),
    ('blog.html', page_blog),
    ('mentions-legales.html', page_mentions),
    ('politique-confidentialite.html', page_privacy),
    ('404.html', page_404),
]


def main():
    count = 0; total = 0
    for filename, fn in PAGES:
        html = fn()
        path = ROOT / filename
        path.write_text(html, encoding='utf-8')
        total += len(html); count += 1
        print('  +', filename.ljust(35), len(html), 'bytes')
    print('\nBuild OK :', count, 'pages,', total, 'bytes total')


if __name__ == '__main__':
    main()
