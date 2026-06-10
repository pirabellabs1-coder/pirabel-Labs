#!/usr/bin/env python3
"""Build static pages for Pirabel Labs site.

Source of truth pour header/nav/footer + variables communes.
Chaque page = {title, description, path, body_html, schema_jsonld, active_nav}.

Re-executer apres edition des pages : python scripts/build_pages.py
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

# === SOURCE OF TRUTH : nav + footer + head ===

NAV_LINKS = [
    ('creation-site-web', 'Sites web'),
    ('creation-application', 'Applications'),
    ('automatisation', 'Automatisation'),
    ('seo', 'SEO'),
    ('realisations', 'Realisations'),
    ('a-propos', 'A propos'),
]

def head(title, description, path, schema_jsonld=None, robots='index, follow, max-image-preview:large, max-snippet:-1'):
    schema_block = ''
    if schema_jsonld:
        schema_block = f'<script type="application/ld+json">{json.dumps(schema_jsonld, ensure_ascii=False)}</script>'
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="canonical" href="https://www.pirabellabs.com{path}">
<link rel="alternate" hreflang="fr" href="https://www.pirabellabs.com{path}">
<link rel="alternate" hreflang="x-default" href="https://www.pirabellabs.com{path}">
<link rel="icon" type="image/png" href="/img/favicon.png">
<link rel="apple-touch-icon" href="/img/favicon.png">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="https://www.pirabellabs.com{path}">
<meta property="og:image" content="https://www.pirabellabs.com/img/og-image.png">
<meta property="og:site_name" content="Pirabel Labs">
<meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="{robots}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"></noscript>
<link rel="stylesheet" href="/css/global.css">
{schema_block}
</head>
<body>'''


def nav(active_slug=''):
    links = ''
    for slug, label in NAV_LINKS:
        cls = 'nav__link nav__link--active' if slug == active_slug else 'nav__link'
        links += f'<a href="/{slug}" class="{cls}">{label}</a>'
    return f'''<nav class="nav" id="nav">
<div class="nav__inner">
<a href="/" class="nav__logo" aria-label="Pirabel Labs - accueil">
<img src="/img/logo.png" alt="Pirabel Labs" width="36" height="36" fetchpriority="high">
<span>Pirabel Labs</span>
</a>
<div class="nav__links" id="navLinks">
{links}
<a href="/contact" class="nav__cta">Demander un devis</a>
</div>
<button class="nav__burger" id="navBurger" aria-label="Menu" aria-expanded="false">
<span></span><span></span><span></span>
</button>
</div>
</nav>'''


FOOTER = '''<footer class="footer">
<div class="container">
<div class="footer__grid">
<div>
<div class="footer__brand">Pirabel Labs</div>
<p class="footer__tagline">Studio tech premium specialise creation de sites, applications, automatisation et SEO. Base a Abomey-Calavi, Benin.</p>
</div>
<div>
<div class="footer__title">Services</div>
<ul class="footer__list">
<li><a href="/creation-site-web">Creation de sites</a></li>
<li><a href="/creation-application">Applications</a></li>
<li><a href="/automatisation">Automatisation</a></li>
<li><a href="/seo">SEO</a></li>
</ul>
</div>
<div>
<div class="footer__title">Studio</div>
<ul class="footer__list">
<li><a href="/a-propos">A propos</a></li>
<li><a href="/realisations">Realisations</a></li>
<li><a href="/blog">Blog</a></li>
<li><a href="/contact">Contact</a></li>
</ul>
</div>
<div>
<div class="footer__title">Contact</div>
<ul class="footer__list">
<li><a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a></li>
<li><span style="color:var(--text-faint);">Abomey-Calavi, Benin</span></li>
</ul>
</div>
</div>
<div class="footer__bottom">
<span>&copy; 2026 Pirabel Labs. Tous droits reserves.</span>
<div class="flex" style="gap:1.25rem;">
<a href="/mentions-legales">Mentions legales</a>
<a href="/politique-confidentialite">Confidentialite</a>
</div>
</div>
</div>
</footer>'''

SCRIPT = '''<script>
(function(){
  var burger=document.getElementById('navBurger');
  var links=document.getElementById('navLinks');
  if(!burger||!links) return;
  burger.addEventListener('click',function(){
    var open=links.classList.toggle('open');
    burger.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',open);
  });
})();
</script>
</body>
</html>'''


def render(title, description, path, body_html, schema_jsonld=None, active='', robots='index, follow, max-image-preview:large, max-snippet:-1'):
    return head(title, description, path, schema_jsonld, robots) + nav(active) + body_html + FOOTER + SCRIPT


# =============== SCHEMAS REUSED ===============

ORG_SCHEMA = {
    "@context": "https://schema.org",
    "@type": ["Organization", "ProfessionalService"],
    "name": "Pirabel Labs",
    "url": "https://www.pirabellabs.com",
    "logo": "https://www.pirabellabs.com/img/logo.png",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Abomey-Calavi",
        "addressCountry": "BJ"
    },
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


# =============== CONTENU DES PAGES ===============

# Service page : section reusable
def service_hero(badge, title, lead):
    return f'''<section class="hero">
<div class="container hero__inner">
<span class="badge mb-3"><span class="material-symbols-outlined">bolt</span> {badge}</span>
<h1>{title}</h1>
<p>{lead}</p>
<div class="hero__actions">
<a href="/contact" class="btn btn--primary btn--lg">Demander un devis <span class="material-symbols-outlined">arrow_forward</span></a>
<a href="#process" class="btn btn--ghost btn--lg">Comment on travaille</a>
</div>
</div>
</section>'''


def service_offer_grid(eyebrow, h2, items):
    """items : list of (icon, title, desc)"""
    cards = ''
    for icon, t, d in items:
        cards += f'''<div class="card">
<div class="card__icon"><span class="material-symbols-outlined">{icon}</span></div>
<h3 class="card__title">{t}</h3>
<p class="card__desc">{d}</p>
</div>'''
    return f'''<section class="section">
<div class="container">
<div class="mb-5">
<span class="eyebrow">{eyebrow}</span>
<h2>{h2}</h2>
</div>
<div class="grid grid--3 grid--3-tablet">{cards}</div>
</div>
</section>'''


def process_section(steps):
    """steps : list of (num, title, desc)"""
    cards = ''
    for num, t, d in steps:
        cards += f'''<div>
<div class="text-accent" style="font-family:var(--font-display);font-weight:800;font-size:2.5rem;line-height:1;margin-bottom:1rem;">{num}</div>
<h3 style="font-size:1.05rem;margin-bottom:.5rem;">{t}</h3>
<p style="font-size:.9rem;">{d}</p>
</div>'''
    return f'''<section class="section" id="process" style="background:var(--bg-2);">
<div class="container">
<div class="mb-5"><span class="eyebrow">Comment on travaille</span><h2>Notre process en 4 etapes.</h2></div>
<div class="grid grid--4">{cards}</div>
</div>
</section>'''


def final_cta(title='Pret a discuter de votre projet ?', subtitle='Un echange decouverte de 30 minutes, sans engagement, pour comprendre votre besoin et estimer ce qui est realiste.'):
    return f'''<section class="section">
<div class="container">
<div class="card" style="padding:3rem 2rem;text-align:center;border-color:var(--accent);background:linear-gradient(135deg,var(--accent-soft),transparent);">
<h2 style="margin-bottom:1rem;">{title}</h2>
<p class="lead" style="margin:0 auto 2rem;">{subtitle}</p>
<div class="flex flex--center flex--wrap">
<a href="/contact" class="btn btn--primary btn--lg">Demarrer la conversation <span class="material-symbols-outlined">arrow_forward</span></a>
<a href="mailto:contact@pirabellabs.com" class="btn btn--ghost btn--lg">contact@pirabellabs.com</a>
</div>
</div>
</div>
</section>'''


# =================== PAGES ===================

def page_creation_site_web():
    body = service_hero(
        'Sites vitrine, e-commerce, landing pages',
        'Des sites web qui ne vous font pas honte. Et qui convertissent.',
        'Plus de 7 secondes pour charger, votre visiteur est parti. Plus de 3 clics pour comprendre votre offre, votre visiteur est parti. On construit des sites qui retiennent l\'attention et transforment.'
    )
    body += service_offer_grid('Ce que nous livrons', 'Trois types de sites, un seul niveau d\'exigence.', [
        ('language', 'Sites vitrine premium', 'Site institutionnel haut de gamme pour PME, cabinets de conseil, professions liberales. WordPress optimise ou code sur mesure. Lighthouse 95+ garanti.'),
        ('shopping_cart', 'E-commerce performant', 'Shopify ou WooCommerce selon votre volume. Tunnel de vente optimise, paiements locaux (Mobile Money, Stripe), SEO produit, gestion logistique.'),
        ('rocket_launch', 'Landing pages haute conversion', 'Pages dediees pour vos campagnes Ads, lancements produit, lead magnets. Conception orientee conversion, A/B test inclus sur les CTAs principaux.')
    ])
    body += service_offer_grid('Inclus dans chaque projet', 'Plus qu\'un site : une fondation digitale.', [
        ('speed', 'Performance native', 'Core Web Vitals dans le vert. Images WebP/AVIF compressees, CDN global, lazy load, code minifie. Site rapide sur 3G a 4G.'),
        ('search', 'SEO on-page complet', 'Structure HTML semantique, schema.org, sitemap, robots.txt, meta optimises. Indexable correctement par Google des le premier jour.'),
        ('security', 'Securite & hebergement pro', 'HTTPS, headers de securite, sauvegarde automatique quotidienne, monitoring uptime 24/7. Hebergement inclus la premiere annee.')
    ])
    body += process_section([
        ('01', 'Brief & maquette', 'Atelier de cadrage 1h, maquette Figma sous 1 semaine, validation visuelle ensemble avant de coder.'),
        ('02', 'Developpement', 'Integration et developpement en sprints. Vous avez acces a un environnement de preview en temps reel.'),
        ('03', 'Recette & SEO', 'Phase de test (cross-browser, mobile, performance), optimisation SEO finale, formation a l\'admin.'),
        ('04', 'Mise en ligne', 'Deploiement, configuration DNS, validation Google Search Console, sauvegardes. Site live + suivi 30 jours.')
    ])
    body += final_cta('Un site qui mertie votre business.', 'Devis sous 48h. Tarif clair, perimetre defini, planning realiste.')
    body = '<main>' + body + '</main>'
    schema = service_schema(
        'Creation de sites web',
        'Sites vitrine, e-commerce et landing pages performants. Lighthouse 95+, SEO inclus, hebergement la premiere annee.',
        'https://www.pirabellabs.com/creation-site-web'
    )
    return render(
        'Creation de sites web | Pirabel Labs - Studio tech Benin',
        'Sites vitrine, e-commerce et landing pages performants par Pirabel Labs. WordPress, Webflow ou code sur mesure. Devis sous 48h, Lighthouse 95+ garanti.',
        '/creation-site-web', body, schema, active='creation-site-web'
    )


def page_creation_application():
    body = service_hero(
        'Web apps, SaaS, mobile, MVP',
        'Des applications qui scalent, sans dette technique.',
        'Vous avez une idee ou un produit existant qui plafonne. On construit la prochaine etape : architecture moderne, code testable, scalable des le jour 1. Du MVP en 6 semaines au SaaS multi-clients.'
    )
    body += service_offer_grid('Trois angles d\'intervention', 'On peut prendre le relais ou demarrer from scratch.', [
        ('flag', 'MVP en 6-10 semaines', 'Vous avez une idee validee mais pas de produit. On construit la version la plus simple qui prouve le concept, livre rapidement, mesurable.'),
        ('expand', 'Refonte ou scale-up', 'Votre app existe mais souffre (lenteur, bugs, dette technique). On audite, on planifie une refonte progressive sans tout casser.'),
        ('engineering', 'Equipe externe dediee', 'Vous avez besoin de capacite tech additionnelle. On rejoint votre equipe en mode embedded, sprints partages, livraison continue.')
    ])
    body += service_offer_grid('Notre stack en 2026', 'Choisi pour scaler, maintenir, recruter.', [
        ('javascript', 'Front : Next.js, React, Tailwind', 'Frameworks modernes pour SPA et SSR. SEO friendly, perf native, ecosysteme massif. Recrutement facile.'),
        ('dns', 'Back : Node, Postgres, Supabase', 'API REST/GraphQL, base relationnelle robuste. Supabase pour les MVP rapides, Postgres dedie pour les apps scalables.'),
        ('cloud_sync', 'Infra : Vercel, Railway, AWS', 'Deploiement continu, monitoring inclus, scaling automatique. Couts maitrises de 50 EUR/mois pour MVP a quelques milliers en production.')
    ])
    body += process_section([
        ('01', 'Specification', 'Atelier produit 2-3h pour cadrer scope, parcours utilisateur, schema de donnees. Document de specification livre.'),
        ('02', 'Sprint 0 : design + archi', '1-2 semaines pour les maquettes, le schema de base de donnees, le squelette technique du projet.'),
        ('03', 'Sprints de developpement', 'Sprints de 1 semaine. Demo hebdo, feedback en continu, ajustements quotidiens si besoin.'),
        ('04', 'Lancement & suivi', 'Mise en production, formation utilisateurs, runbook ops. Garantie 30 jours puis option maintenance mensuelle.')
    ])
    body += final_cta()
    body = '<main>' + body + '</main>'
    schema = service_schema(
        'Creation d\'applications web et mobiles',
        'Applications web et mobiles sur mesure. Stack moderne Next.js + Node + Postgres. MVP en 6 semaines, ou scale-up d\'une app existante.',
        'https://www.pirabellabs.com/creation-application'
    )
    return render(
        'Creation d\'applications web et mobiles | Pirabel Labs',
        'Pirabel Labs developpe vos applications web, mobiles et SaaS. Stack Next.js + Node + Postgres. MVP en 6 semaines ou refonte technique d\'une app existante.',
        '/creation-application', body, schema, active='creation-application'
    )


def page_automatisation():
    body = service_hero(
        'Make, n8n, Zapier, agents IA',
        'Vos equipes economisent 10 a 30 heures par semaine.',
        'Saisie manuelle, copier-coller entre outils, suivi Excel : autant de taches qui empechent vos equipes de creer de la valeur. On les automatise. Du simple workflow Make au chatbot IA pour le support client.'
    )
    body += service_offer_grid('Quatre cas d\'usage frequents', 'Choisis parce qu\'ils paient toujours en quelques mois.', [
        ('autorenew', 'Synchronisation d\'outils', 'CRM <-> compta, devis <-> facture, leads <-> campagne email. Plus de double saisie, plus d\'oubli, traçabilite complete.'),
        ('chat', 'Chatbots IA support', 'Repondre 24/7 aux 50-70% de questions repetitives. Integration WhatsApp, site web, Messenger. Escalade automatique vers humain si besoin.'),
        ('mail', 'Sequences nurturing', 'Email + SMS + WhatsApp coordonnes selon le comportement. Lead score qui declenche un appel commercial au bon moment.'),
        ('description', 'Generation de documents', 'Devis, factures, contrats genere automatiquement depuis vos formulaires. PDF prerempli, signature electronique, archivage Drive ou OneDrive.'),
        ('insights', 'Reporting automatique', 'Dashboard hebdo envoye automatiquement aux dirigeants. Donnees consolidees depuis vos outils, alertes sur les KPIs critiques.'),
        ('smart_toy', 'Agents IA metier', 'IA qualifie les leads entrants, route les messages, redige les premiers brouillons d\'email, analyse les avis clients. Sur mesure pour votre process.')
    ])
    body += process_section([
        ('01', 'Audit process', 'Cartographie de vos workflows actuels : ou est le temps perdu, ou sont les erreurs, ou serait le gain immediat.'),
        ('02', 'Quick wins', 'On commence par 1-2 workflows a fort ROI. Mis en production en 2-3 semaines. Premiers benefices mesurables vite.'),
        ('03', 'Industrialisation', 'On etend progressivement aux autres process. Documentation, formation, transmission de la maintenance si souhaite.'),
        ('04', 'Monitoring continu', 'Surveillance des workflows, alertes en cas d\'erreur, optimisation continue. Maintenance mensuelle si souhaite.')
    ])
    body += final_cta('Quelles taches voulez-vous arreter de faire a la main ?', 'Echange decouverte gratuit pour identifier les 2-3 automatisations a fort ROI dans votre business.')
    body = '<main>' + body + '</main>'
    schema = service_schema(
        'Automatisation et agents IA',
        'Automatisation de workflows (Make, n8n, Zapier), agents IA, chatbots, integrations CRM/ERP. Vos equipes economisent 10 a 30h par semaine.',
        'https://www.pirabellabs.com/automatisation'
    )
    return render(
        'Automatisation et agents IA | Pirabel Labs - Studio tech Benin',
        'Pirabel Labs automatise vos workflows avec Make, n8n, Zapier et agents IA. Vos equipes economisent 10 a 30h/semaine. Audit gratuit, premiers gains en 2-3 semaines.',
        '/automatisation', body, schema, active='automatisation'
    )


def page_seo():
    body = service_hero(
        'Audit, contenu, technique, netlinking',
        'Du trafic qualifie qui convertit, mois apres mois.',
        'Le SEO mal fait coute cher pour rien. Bien fait, c\'est l\'investissement digital le plus rentable a 18-24 mois. On audite, on planifie, on execute - sur des KPI mesurables.'
    )
    body += service_offer_grid('Quatre piliers, une seule strategie', 'Le SEO se joue sur tous les fronts a la fois.', [
        ('build', 'SEO technique', 'Crawl, indexation, Core Web Vitals, schema.org, structure URL, redirections, sitemap. La fondation invisible mais critique.'),
        ('article', 'Strategie de contenu', 'Recherche d\'intentions, briefs, calendrier editorial, optimisation on-page. Articles qui rankent ET convertissent.'),
        ('link', 'Netlinking ethique', 'Identification d\'opportunites, prise de contact, guest posting, citations locales. White hat exclusivement, pas de PBN.'),
        ('location_on', 'SEO local', 'Google Business Profile, citations NAP, avis Google, schema LocalBusiness. Visibilite dans le pack local Maps.')
    ])
    body += service_offer_grid('Trois formats d\'accompagnement', 'Selon votre besoin et votre budget.', [
        ('search_check', 'Audit ponctuel', 'Etat des lieux complet, roadmap priorisee, livrables actionnables. Vous executez avec ou sans nous derriere.'),
        ('handshake', 'Accompagnement mensuel', 'Suivi de positions, reporting mensuel, optimisations continues. Pour les marques qui veulent une progression durable.'),
        ('engineering', 'Mission specifique', 'Migration de site sans perdre du trafic, rattrapage d\'une penalite, lancement d\'un nouveau site. Sur livrable defini.')
    ])
    body += process_section([
        ('01', 'Audit & diagnostic', 'Crawl complet, analyse de la concurrence, identification des opportunites. Document de 30-60 pages avec priorites.'),
        ('02', 'Roadmap 6 mois', 'Plan d\'action priorise par impact / effort. Quick wins en 1-2 mois, fondamentaux en 3-6 mois.'),
        ('03', 'Execution', 'Implementation technique, redaction de contenus, prise de contact pour backlinks. Reporting mensuel transparent.'),
        ('04', 'Mesure & iteration', 'Suivi de positions, trafic, conversions. Ajustements continus sur ce qui marche, abandon de ce qui ne marche pas.')
    ])
    body += final_cta('Vous voulez savoir ou en est votre SEO ?', 'Audit flash gratuit de votre site : top 5 problemes a regler en priorite, opportunites de mots-cles, etat de la concurrence.')
    body = '<main>' + body + '</main>'
    schema = service_schema(
        'Conseil et accompagnement SEO',
        'Audit SEO, strategie de contenu, netlinking, SEO local. Du trafic qualifie qui convertit, mesurable mois apres mois.',
        'https://www.pirabellabs.com/seo'
    )
    return render(
        'Agence SEO et referencement | Pirabel Labs - Audit gratuit',
        'Pirabel Labs ameliore votre referencement Google : audit technique, contenu, netlinking, SEO local. Trafic qualifie qui convertit, mesure en KPIs business.',
        '/seo', body, schema, active='seo'
    )


def page_a_propos():
    body = '''<section class="hero"><div class="container hero__inner">
<span class="badge mb-3"><span class="material-symbols-outlined">groups</span> Le studio</span>
<h1>Un studio tech ancre au Benin, ouvert sur le monde francophone.</h1>
<p>Pirabel Labs a ete fonde en 2020 a Abomey-Calavi par Lissanon Gildas et Fidah Imorou. Notre conviction : la qualite premium n\'a pas de geographie. On construit pour des PME au Benin, en France, en Cote d\'Ivoire et au-dela, avec le meme niveau d\'exigence.</p>
</div></section>

<section class="section"><div class="container">
<div class="mb-5"><span class="eyebrow">Les fondateurs</span><h2>Deux profils complementaires.</h2></div>
<div class="grid grid--2">
<div class="card">
<h3 class="card__title">Lissanon Gildas <span style="color:var(--text-faint);font-weight:400;font-size:.9em;">Cofondateur</span></h3>
<p class="card__desc">Expert technique, en charge du developpement, des architectures et de la qualite code. Cumule 10+ annees d\'experience sur des projets web, applications et automatisation pour des clients en Afrique de l\'Ouest et en Europe.</p>
</div>
<div class="card">
<h3 class="card__title">Fidah Imorou <span style="color:var(--text-faint);font-weight:400;font-size:.9em;">Cofondateur</span></h3>
<p class="card__desc">Expert SEO et strategie digitale, en charge des sujets contenu, referencement et croissance organique. Accompagne des marques francophones sur des problematiques SEO complexes depuis 8+ ans.</p>
</div>
</div>
</div></section>

<section class="section" style="background:var(--bg-2);"><div class="container">
<div class="mb-5"><span class="eyebrow">Nos valeurs</span><h2>Travailler bien, livrer juste.</h2></div>
<div class="grid grid--3 grid--3-tablet">
<div class="card">
<div class="card__icon"><span class="material-symbols-outlined">target</span></div>
<h3 class="card__title">Exigence sur le livrable</h3>
<p class="card__desc">Pas de "ca passe". Ce qu\'on livre, on le mettrait sur notre propre site. Si on ne le ferait pas pour nous, on ne le fait pas pour vous.</p>
</div>
<div class="card">
<div class="card__icon"><span class="material-symbols-outlined">chat</span></div>
<h3 class="card__title">Transparence radicale</h3>
<p class="card__desc">Vous savez ou en est le projet, ce qui prend du temps et pourquoi. Pas de jargon pour faire savant, pas de cachoterie sur la difficulte.</p>
</div>
<div class="card">
<div class="card__icon"><span class="material-symbols-outlined">trending_up</span></div>
<h3 class="card__title">Le long terme avant le court</h3>
<p class="card__desc">On prefere un client qui revient dans 2 ans avec un autre projet plutot que vous facturer un truc dont vous n\'avez pas besoin maintenant.</p>
</div>
</div>
</div></section>

<section class="section"><div class="container">
<div class="mb-5"><span class="eyebrow">Ou nous trouver</span><h2>Bases au Benin, joignables partout.</h2></div>
<div class="grid grid--2">
<div>
<h3 style="font-size:1.1rem;margin-bottom:.75rem;">Siege</h3>
<p>Abomey-Calavi, Benin<br>(Departement de l\'Atlantique)</p>
</div>
<div>
<h3 style="font-size:1.1rem;margin-bottom:.75rem;">Contact</h3>
<p><a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a><br>Reponse sous 24h ouvres.</p>
</div>
</div>
</div></section>
'''
    body += final_cta()
    body = '<main>' + body + '</main>'
    return render(
        'A propos - Studio tech au Benin | Pirabel Labs',
        'Pirabel Labs est un studio tech fonde en 2020 a Abomey-Calavi (Benin) par Lissanon Gildas et Fidah Imorou. Specialise sites web, applications, automatisation et SEO.',
        '/a-propos', body, ORG_SCHEMA, active='a-propos'
    )


def page_contact():
    body = '''<section class="hero"><div class="container hero__inner">
<span class="badge mb-3"><span class="material-symbols-outlined">mail</span> Contact</span>
<h1>Parlons de votre projet.</h1>
<p>Decrivez en quelques mots votre besoin, on vous repond sous 24h ouvres avec une premiere estimation et la prochaine etape proposee.</p>
</div></section>

<section class="section section--tight"><div class="container">
<div class="grid" style="grid-template-columns:1.4fr 1fr;gap:3rem;">
<form id="contactForm" class="form" style="max-width:none;">
<input type="text" name="website_url" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="field--row">
<div class="field"><label class="field__label" for="cf-name">Votre nom *</label><input id="cf-name" class="field__input" type="text" name="name" required maxlength="100" autocomplete="name"></div>
<div class="field"><label class="field__label" for="cf-email">Email *</label><input id="cf-email" class="field__input" type="email" name="email" required maxlength="200" autocomplete="email"></div>
</div>
<div class="field--row">
<div class="field"><label class="field__label" for="cf-company">Entreprise</label><input id="cf-company" class="field__input" type="text" name="company" maxlength="120" autocomplete="organization"></div>
<div class="field"><label class="field__label" for="cf-phone">Telephone</label><input id="cf-phone" class="field__input" type="tel" name="phone" maxlength="30" autocomplete="tel"></div>
</div>
<div class="field">
<label class="field__label" for="cf-service">Quel service vous interesse ? *</label>
<select id="cf-service" class="field__select" name="service" required>
<option value="">Selectionnez...</option>
<option value="site-web">Creation de site web</option>
<option value="application">Creation d\'application</option>
<option value="automatisation">Automatisation / Agents IA</option>
<option value="seo">SEO et referencement</option>
<option value="autre">Autre / Plusieurs</option>
</select>
</div>
<div class="field">
<label class="field__label" for="cf-message">Decrivez votre projet *</label>
<textarea id="cf-message" class="field__textarea" name="message" required maxlength="3000" placeholder="Contexte, besoin, contrainte de delai, budget si vous l\'avez deja en tete..."></textarea>
<span class="field__hint">Plus c\'est precis, plus on peut etre utile dans la reponse.</span>
</div>
<div id="cf-alert" style="display:none;padding:1rem 1.25rem;font-size:.92rem;line-height:1.5;"></div>
<button type="submit" class="btn btn--primary btn--lg" id="cf-submit">Envoyer ma demande <span class="material-symbols-outlined">send</span></button>
</form>

<aside style="border:1px solid var(--border);padding:2rem;background:var(--bg-2);height:fit-content;">
<h3 style="font-size:1rem;margin-bottom:.75rem;">Reponse rapide</h3>
<p style="font-size:.9rem;margin-bottom:1.5rem;">On repond a toutes les demandes serieuses sous 24h ouvres. Premiere estimation gratuite et sans engagement.</p>
<h3 style="font-size:1rem;margin-bottom:.75rem;">Email direct</h3>
<p style="margin-bottom:1.5rem;"><a href="mailto:contact@pirabellabs.com" style="font-size:.95rem;">contact@pirabellabs.com</a></p>
<h3 style="font-size:1rem;margin-bottom:.75rem;">Localisation</h3>
<p style="font-size:.9rem;color:var(--text-muted);">Abomey-Calavi, Benin<br>Travail en distance avec clients en France, Cote d\'Ivoire, Senegal, Cameroun.</p>
</aside>
</div>
</div></section>
'''
    body = '<main>' + body + '</main>'
    body += '''<script>
(function(){
  var form=document.getElementById('contactForm');
  var btn=document.getElementById('cf-submit');
  var alertEl=document.getElementById('cf-alert');
  if(!form) return;
  function showAlert(msg, type){
    alertEl.style.display='block';
    alertEl.style.background = type==='success' ? 'rgba(74,222,128,.1)' : 'rgba(248,113,113,.1)';
    alertEl.style.color = type==='success' ? '#4ade80' : '#f87171';
    alertEl.style.border = '1px solid ' + (type==='success' ? 'rgba(74,222,128,.3)' : 'rgba(248,113,113,.3)');
    alertEl.textContent = msg;
  }
  form.addEventListener('submit', function(e){
    e.preventDefault();
    btn.disabled=true; btn.textContent='Envoi en cours...';
    var data = Object.fromEntries(new FormData(form));
    fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
      .then(function(r){ return r.json(); })
      .then(function(res){
        if(res && res.success){
          showAlert(res.message || 'Demande envoyee. Reponse sous 24h ouvres.', 'success');
          form.reset();
          btn.textContent = 'Envoyee ✓';
        } else {
          showAlert((res && res.error) || 'Erreur, reessayez ou ecrivez a contact@pirabellabs.com', 'error');
          btn.disabled=false; btn.innerHTML = 'Envoyer ma demande <span class="material-symbols-outlined">send</span>';
        }
      })
      .catch(function(){
        showAlert('Erreur reseau. Reessayez ou ecrivez directement a contact@pirabellabs.com', 'error');
        btn.disabled=false; btn.innerHTML = 'Envoyer ma demande <span class="material-symbols-outlined">send</span>';
      });
  });
})();
</script>'''
    return render(
        'Contact - Pirabel Labs | Reponse sous 24h',
        'Contactez Pirabel Labs pour un devis. Sites web, applications, automatisation, SEO. Reponse sous 24h ouvres, premiere estimation gratuite et sans engagement.',
        '/contact', body, None, active=''
    )


def page_realisations():
    body = '''<section class="hero"><div class="container hero__inner">
<span class="badge mb-3"><span class="material-symbols-outlined">photo_library</span> Realisations</span>
<h1>Nos projets recents.</h1>
<p>Cette section est en cours de mise a jour. Nous selectionnons les projets les plus representatifs de notre travail pour les presenter ici. Disponible tres bientot.</p>
<div class="hero__actions">
<a href="/contact" class="btn btn--primary btn--lg">Demander des references <span class="material-symbols-outlined">arrow_forward</span></a>
</div>
</div></section>

<section class="section"><div class="container text-center">
<div style="max-width:36rem;margin:0 auto;padding:3rem 0;">
<div style="font-size:4rem;color:var(--accent);margin-bottom:1.5rem;">
<span class="material-symbols-outlined" style="font-size:4rem;">construction</span>
</div>
<h2 style="margin-bottom:1rem;">Cas clients en preparation</h2>
<p class="lead" style="margin:0 auto 2rem;">Nous travaillons avec des clients qui nous demandent souvent la confidentialite. Pour vous donner des references concretes adaptees a votre secteur, contactez-nous : nous partagerons les cas pertinents.</p>
<a href="/contact" class="btn btn--primary btn--lg">Demander des references precises <span class="material-symbols-outlined">arrow_forward</span></a>
</div>
</div></section>
'''
    body = '<main>' + body + '</main>'
    return render(
        'Realisations - Cas clients | Pirabel Labs',
        'Decouvrez les realisations Pirabel Labs : sites web, applications, automatisations, projets SEO. Section en cours de mise a jour - contactez-nous pour des references precises.',
        '/realisations', body, None, active='realisations'
    )


def page_blog():
    body = '''<section class="hero"><div class="container hero__inner">
<span class="badge mb-3"><span class="material-symbols-outlined">article</span> Blog</span>
<h1>Notre carnet de bord.</h1>
<p>Articles d\'autorite sur la creation de sites, le developpement d\'applications, l\'automatisation et le SEO. Pratique, sans bullshit, base sur ce que nous voyons sur le terrain.</p>
</div></section>

<section class="section"><div class="container text-center">
<div style="max-width:36rem;margin:0 auto;padding:3rem 0;">
<div style="font-size:4rem;color:var(--accent);margin-bottom:1.5rem;">
<span class="material-symbols-outlined" style="font-size:4rem;">edit_note</span>
</div>
<h2 style="margin-bottom:1rem;">Premiers articles bientot</h2>
<p class="lead" style="margin:0 auto 2rem;">On prepare une selection d\'articles longs et substantiels sur les sujets qui comptent : combien coute un site pro, comment choisir entre app native et web, par ou commencer son SEO, etc.</p>
<a href="/contact" class="btn btn--primary btn--lg">Recevoir l\'avis d\'un expert <span class="material-symbols-outlined">arrow_forward</span></a>
</div>
</div></section>
'''
    body = '<main>' + body + '</main>'
    return render(
        'Blog - Conseils pratiques | Pirabel Labs',
        'Articles d\'autorite Pirabel Labs sur la creation de sites web, le developpement d\'applications, l\'automatisation et le SEO. Pratique, sans bullshit.',
        '/blog', body, None, active=''
    )


def page_mentions():
    body = '''<section class="section--hero"><div class="container">
<span class="badge mb-3">Informations legales</span>
<h1 style="font-size:clamp(2rem,4vw,3rem);">Mentions legales</h1>
<p class="lead" style="margin-top:1rem;">Informations relatives a l\'editeur du site et a son hebergement.</p>
</div></section>

<section class="section"><div class="container" style="max-width:48rem;">
<h2>Editeur</h2>
<p><strong>Pirabel Labs</strong><br>
Studio tech<br>
Abomey-Calavi, Benin<br>
Email : <a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a></p>

<h2 class="mt-5">Cofondateurs</h2>
<p>Lissanon Gildas et Fidah Imorou.</p>

<h2 class="mt-5">Hebergeur</h2>
<p><strong>Vercel Inc.</strong><br>
340 S Lemon Ave #4133<br>
Walnut, CA 91789, USA<br>
Site : <a href="https://vercel.com" rel="noopener" target="_blank">vercel.com</a></p>

<h2 class="mt-5">Propriete intellectuelle</h2>
<p>L\'ensemble des contenus presents sur ce site (textes, images, logos, code) est la propriete exclusive de Pirabel Labs, sauf mention contraire. Toute reproduction, meme partielle, sans autorisation prealable ecrite, est interdite.</p>

<h2 class="mt-5">Responsabilite</h2>
<p>Pirabel Labs s\'efforce d\'assurer l\'exactitude des informations diffusees sur ce site mais ne peut etre tenu responsable des erreurs eventuelles, ni des consequences de leur utilisation.</p>

<h2 class="mt-5">Contact</h2>
<p>Pour toute question relative aux mentions legales : <a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a></p>
</div></section>
'''
    body = '<main>' + body + '</main>'
    return render(
        'Mentions legales | Pirabel Labs',
        'Mentions legales de Pirabel Labs - studio tech base a Abomey-Calavi (Benin). Editeur, hebergeur, propriete intellectuelle.',
        '/mentions-legales', body, None, active='', robots='index, follow'
    )


def page_privacy():
    body = '''<section class="section--hero"><div class="container">
<span class="badge mb-3">Vie privee</span>
<h1 style="font-size:clamp(2rem,4vw,3rem);">Politique de confidentialite</h1>
<p class="lead" style="margin-top:1rem;">Comment nous collectons, utilisons et protegons vos donnees.</p>
</div></section>

<section class="section"><div class="container" style="max-width:48rem;">
<h2>Donnees collectees</h2>
<p>Nous collectons uniquement les donnees que vous nous fournissez volontairement via notre formulaire de contact : nom, email, telephone (optionnel), entreprise (optionnel), service d\'interet et description de votre projet.</p>

<h2 class="mt-5">Finalite</h2>
<p>Ces donnees servent uniquement a vous repondre, a comprendre votre besoin et a vous proposer un devis ou une estimation. Aucune cession a un tiers.</p>

<h2 class="mt-5">Duree de conservation</h2>
<ul style="list-style:disc;margin-left:1.5rem;color:var(--text-muted);line-height:1.8;">
<li>Demandes sans suite : conservees 12 mois puis supprimees automatiquement</li>
<li>Clients actifs : conservees pendant la duree de la relation commerciale + 3 ans</li>
<li>Vos donnees ne sont jamais vendues ni partagees a des fins marketing</li>
</ul>

<h2 class="mt-5">Vos droits (RGPD)</h2>
<p>Vous disposez d\'un droit d\'acces, de rectification, d\'effacement, de portabilite et d\'opposition sur vos donnees. Exercez ces droits a tout moment en ecrivant a <a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a>. Nous repondons sous 30 jours.</p>

<h2 class="mt-5">Cookies</h2>
<p>Ce site utilise des cookies techniques strictement necessaires a son fonctionnement (session, securite). Aucun cookie tiers, aucun tracker publicitaire, aucune mesure d\'audience invasive.</p>

<h2 class="mt-5">Securite</h2>
<p>Toutes les donnees transitent en HTTPS. Le stockage est chiffre au repos. L\'acces administratif est protege par authentification multifacteur.</p>

<h2 class="mt-5">Contact</h2>
<p>Question, reclamation ou exercice d\'un droit : <a href="mailto:contact@pirabellabs.com">contact@pirabellabs.com</a></p>
</div></section>
'''
    body = '<main>' + body + '</main>'
    return render(
        'Politique de confidentialite | Pirabel Labs',
        'Politique de confidentialite Pirabel Labs : donnees collectees, finalite, conservation, droits RGPD, cookies, securite.',
        '/politique-confidentialite', body, None, active='', robots='index, follow'
    )


def page_404():
    body = '''<section class="hero"><div class="container hero__inner text-center">
<div style="font-size:5rem;font-family:var(--font-display);font-weight:800;color:var(--accent);line-height:1;margin-bottom:1.5rem;">404</div>
<h1>Cette page n\'existe pas.</h1>
<p style="margin-left:auto;margin-right:auto;">Le lien que vous avez suivi est peut-etre obsolete, ou la page a ete deplacee. Voici quelques pistes pour vous y retrouver.</p>
<div class="hero__actions flex--center" style="justify-content:center;">
<a href="/" class="btn btn--primary btn--lg">Retour a l\'accueil <span class="material-symbols-outlined">arrow_forward</span></a>
<a href="/contact" class="btn btn--ghost btn--lg">Nous contacter</a>
</div>
</div></section>

<section class="section"><div class="container">
<div class="services-grid">
<a href="/creation-site-web" class="service-card"><div class="service-card__icon"><span class="material-symbols-outlined">web</span></div><h3 class="service-card__title">Sites web</h3><span class="service-card__link">Voir <span class="material-symbols-outlined">arrow_forward</span></span></a>
<a href="/creation-application" class="service-card"><div class="service-card__icon"><span class="material-symbols-outlined">terminal</span></div><h3 class="service-card__title">Applications</h3><span class="service-card__link">Voir <span class="material-symbols-outlined">arrow_forward</span></span></a>
<a href="/automatisation" class="service-card"><div class="service-card__icon"><span class="material-symbols-outlined">smart_toy</span></div><h3 class="service-card__title">Automatisation</h3><span class="service-card__link">Voir <span class="material-symbols-outlined">arrow_forward</span></span></a>
<a href="/seo" class="service-card"><div class="service-card__icon"><span class="material-symbols-outlined">search_insights</span></div><h3 class="service-card__title">SEO</h3><span class="service-card__link">Voir <span class="material-symbols-outlined">arrow_forward</span></span></a>
</div>
</div></section>
'''
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
    count = 0
    total_bytes = 0
    for filename, fn in PAGES:
        html = fn()
        path = ROOT / filename
        path.write_text(html, encoding='utf-8')
        size = len(html)
        total_bytes += size
        count += 1
        print(f'  + {filename:35} {size:>6} bytes')
    print(f'\nBuild OK : {count} pages, {total_bytes:,} bytes')


if __name__ == '__main__':
    main()
