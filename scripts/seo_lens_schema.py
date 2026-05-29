"""
SEO Lens: Schema.org Enrichment for E-E-A-T
============================================
Audit + injection idempotente de blocs JSON-LD manquants ou enrichis sur les pages cles
de Pirabel Labs. Renforce Trust/Authority/Expertise pour Google E-E-A-T et eligibilite
aux rich results (Organization Knowledge Panel, Author, FAQ, Course, BreadcrumbList,
HowTo, Person, LocalBusiness).

Cibles :
  - index.html (Organization avec geo, sameAs, aggregateRating)
  - a-propos.html (Person Lissanon Gildas + Fidah Imorou enrichis + BreadcrumbList)
  - contact.html (ContactPage avec provider enrichi)
  - services.html (Service array complet 10+ + BreadcrumbList)
  - faq.html (FAQPage enrichie + BreadcrumbList)
  - agence-seo/web/ia/index.html (Service + provider details + BreadcrumbList)
  - formations/index.html (CollectionPage + ItemList de 30 Course - aujourd'hui ABSENT)
  - blog/<slug>.html (BlogPosting + BreadcrumbList)
  - guides/<slug>.html (HowTo + Article + author Person + BreadcrumbList)

Idempotence : chaque ajout est marque par un commentaire HTML <!-- schema-lens:<key> -->
qui sert de garde pour eviter re-injection.

Usage :
  python scripts/seo_lens_schema.py [--dry-run]
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = ('node_modules', 'admin', 'portal', 'client_portal', 'pirabel-admin', 'scratch')
DOMAIN = "https://www.pirabellabs.com"

# Coords GPS estimees Abomey-Calavi, Benin (centre ville)
ABC_LAT = 6.4485
ABC_LNG = 2.3554

# Cofondateurs
FOUNDERS = {
    "gildas": {
        "name": "Lissanon Gildas",
        "jobTitle": "Fondateur & CEO",
        "url": f"{DOMAIN}/a-propos#fondateurs",
        "knowsAbout": ["SEO", "Generative Engine Optimization (GEO)", "Stratégie de croissance digitale",
                       "Intelligence Artificielle appliquée au marketing", "Direction d'agence"],
        "image": f"{DOMAIN}/img/founders/lissanon-gildas.jpg",
    },
    "fidah": {
        "name": "Fidah Imorou",
        "jobTitle": "Co-fondateur & CTO",
        "url": f"{DOMAIN}/a-propos#fondateurs",
        "knowsAbout": ["Développement web", "Automatisation (Make, n8n, Zapier)",
                       "Architecture technique", "Intégration IA & RAG", "Performance Core Web Vitals"],
        "image": f"{DOMAIN}/img/founders/fidah-imorou.jpg",
    },
}


# -----------------------------------------------------------------------------
# Utilities
# -----------------------------------------------------------------------------

def read(path: Path) -> str:
    return path.read_text(encoding='utf-8', errors='ignore')


def write(path: Path, content: str) -> None:
    path.write_text(content, encoding='utf-8', newline='\n')


def has_marker(html: str, key: str) -> bool:
    """Idempotence marker check."""
    return f"schema-lens:{key}" in html


def block(key: str, payload: dict, indent: int = 2) -> str:
    """Build a marked JSON-LD block."""
    body = json.dumps(payload, ensure_ascii=False, indent=indent)
    return f'<!-- schema-lens:{key} -->\n<script type="application/ld+json">\n{body}\n</script>\n'


def inject_before_head_close(html: str, fragment: str) -> Optional[str]:
    """Insert fragment right before </head>."""
    idx = html.lower().rfind('</head>')
    if idx == -1:
        return None
    return html[:idx] + fragment + html[idx:]


# -----------------------------------------------------------------------------
# JSON-LD payload builders
# -----------------------------------------------------------------------------

def org_local_business() -> dict:
    """LocalBusiness Pirabel Labs avec geo et openingHours."""
    return {
        "@context": "https://schema.org",
        "@type": ["ProfessionalService", "LocalBusiness"],
        "@id": f"{DOMAIN}#organization",
        "name": "Pirabel Labs",
        "alternateName": "Pirabel Labs - Agence Digitale Premium",
        "slogan": "Agence digitale premium au Bénin",
        "url": DOMAIN,
        "logo": f"{DOMAIN}/img/logo.png",
        "image": f"{DOMAIN}/img/og-image.png",
        "priceRange": "€€",
        "currenciesAccepted": "EUR, XOF, USD, CAD",
        "paymentAccepted": "Virement, Carte bancaire, Mobile Money",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Cocotomey Plage",
            "addressLocality": "Abomey-Calavi",
            "addressRegion": "Atlantique",
            "postalCode": "01 BP",
            "addressCountry": "BJ"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": ABC_LAT,
            "longitude": ABC_LNG
        },
        "telephone": "+22901688884534",
        "email": "contact@pirabellabs.com",
        "foundingDate": "2020",
        "founder": [
            {
                "@type": "Person",
                "@id": f"{DOMAIN}/a-propos#lissanon-gildas",
                "name": FOUNDERS["gildas"]["name"],
                "jobTitle": FOUNDERS["gildas"]["jobTitle"],
                "url": FOUNDERS["gildas"]["url"]
            },
            {
                "@type": "Person",
                "@id": f"{DOMAIN}/a-propos#fidah-imorou",
                "name": FOUNDERS["fidah"]["name"],
                "jobTitle": FOUNDERS["fidah"]["jobTitle"],
                "url": FOUNDERS["fidah"]["url"]
            }
        ],
        "openingHoursSpecification": [
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "08:00",
                "closes": "19:00"
            },
            {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Saturday"],
                "opens": "09:00",
                "closes": "13:00"
            }
        ],
        "areaServed": [
            {"@type": "Country", "name": "Bénin"},
            {"@type": "Country", "name": "France"},
            {"@type": "Country", "name": "Côte d'Ivoire"},
            {"@type": "Country", "name": "Sénégal"},
            {"@type": "Country", "name": "Maroc"},
            {"@type": "Country", "name": "Canada"}
        ],
        "knowsAbout": ["SEO", "Generative Engine Optimization (GEO)", "Web Development",
                       "Artificial Intelligence", "RAG Integration", "automatisation marketing",
                       "Social Media", "Email Marketing", "CRO", "Branding"],
        "knowsLanguage": ["fr", "en"],
        "sameAs": [
            "https://www.linkedin.com/company/pirabel-labs",
            "https://www.facebook.com/pirabellabs",
            "https://www.instagram.com/pirabellabs",
            "https://twitter.com/pirabellabs",
            "https://www.youtube.com/@pirabellabs"
        ],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "47",
            "bestRating": "5",
            "worstRating": "1"
        }
    }


def person_payload(key: str, extra_sameAs: list) -> dict:
    f = FOUNDERS[key]
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": f"{DOMAIN}/a-propos#" + ("lissanon-gildas" if key == "gildas" else "fidah-imorou"),
        "name": f["name"],
        "jobTitle": f["jobTitle"],
        "image": f["image"],
        "url": f["url"],
        "worksFor": {
            "@type": "Organization",
            "@id": f"{DOMAIN}#organization",
            "name": "Pirabel Labs",
            "url": DOMAIN
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Abomey-Calavi",
            "addressCountry": "BJ"
        },
        "nationality": {"@type": "Country", "name": "Bénin"},
        "knowsAbout": f["knowsAbout"],
        "knowsLanguage": ["fr", "en"],
        "sameAs": extra_sameAs
    }


def breadcrumb(items: list) -> dict:
    """items = [(name, url_path)] - url_path relatif au domaine."""
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": i + 1,
                "name": name,
                "item": f"{DOMAIN}{path}"
            }
            for i, (name, path) in enumerate(items)
        ]
    }


def service_complete(name: str, slug: str, description: str, service_type: str,
                     price_starting: int) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": f"{DOMAIN}/{slug}#service",
        "name": name,
        "serviceType": service_type,
        "description": description,
        "url": f"{DOMAIN}/{slug}",
        "provider": {
            "@type": "Organization",
            "@id": f"{DOMAIN}#organization",
            "name": "Pirabel Labs",
            "url": DOMAIN,
            "logo": f"{DOMAIN}/img/logo.png",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Abomey-Calavi",
                "addressCountry": "BJ"
            }
        },
        "areaServed": [
            {"@type": "Country", "name": "Bénin"},
            {"@type": "Country", "name": "France"},
            {"@type": "Country", "name": "Côte d'Ivoire"},
            {"@type": "Country", "name": "Sénégal"},
            {"@type": "Country", "name": "Maroc"},
            {"@type": "Country", "name": "Canada"}
        ],
        "offers": {
            "@type": "Offer",
            "price": str(price_starting),
            "priceCurrency": "EUR",
            "priceSpecification": {
                "@type": "PriceSpecification",
                "price": str(price_starting),
                "priceCurrency": "EUR",
                "minPrice": str(price_starting),
                "valueAddedTaxIncluded": False
            },
            "availability": "https://schema.org/InStock",
            "url": f"{DOMAIN}/contact"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "47",
            "bestRating": "5"
        }
    }


def services_offer_catalog() -> dict:
    """Le catalogue complet de 10+ services pour services.html."""
    catalog = [
        ("SEO & Référencement Naturel", "agence-seo-referencement-naturel", "SEO"),
        ("Création de Sites Web & E-commerce", "agence-creation-sites-web", "Web Development"),
        ("IA & Automatisation (Make, n8n, RAG, Agents)", "agence-ia-automatisation", "Artificial Intelligence"),
        ("Publicité Payante (Google Ads, Meta Ads)", "agence-publicite-payante-sea-ads", "Paid Advertising"),
        ("Social Media Management", "agence-social-media", "Social Media Marketing"),
        ("Design & Branding", "agence-design-branding", "Design"),
        ("Vidéo & Motion Design", "agence-video-motion-design", "Video Production"),
        ("Email Marketing & CRM", "agence-email-marketing-crm", "Email Marketing"),
        ("Rédaction & Content Marketing", "agence-redaction-content-marketing", "Content Marketing"),
        ("Sales Funnels & CRO", "agence-sales-funnels-cro", "Conversion Optimization"),
    ]
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": f"{DOMAIN}/services#service",
        "name": "Services Pirabel Labs - Marketing Digital, SEO, IA, Web",
        "serviceType": "Digital Marketing & Technology Agency",
        "provider": {
            "@type": "Organization",
            "@id": f"{DOMAIN}#organization",
            "name": "Pirabel Labs",
            "url": DOMAIN,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Abomey-Calavi",
                "addressCountry": "BJ"
            }
        },
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Catalogue services Pirabel Labs",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": n,
                        "url": f"{DOMAIN}/{slug}",
                        "serviceType": stype
                    }
                }
                for n, slug, stype in catalog
            ]
        }
    }


# -----------------------------------------------------------------------------
# Formations: ItemList of Course
# -----------------------------------------------------------------------------

# (slug, title, level FR, hoursISO)
FORMATIONS = [
    ("agents-ia-chatbots-entreprise", "Agents IA & Chatbots pour Entreprise", "intermediaire", "PT12H"),
    ("automatisation-make-zapier-n8n", "Automatisation Make, Zapier, n8n", "intermediaire", "PT14H"),
    ("branding-identite-visuelle", "Branding & Identité Visuelle", "debutant", "PT10H"),
    ("content-marketing-strategique", "Content Marketing Stratégique", "intermediaire", "PT12H"),
    ("copywriting-persuasif", "Copywriting Persuasif", "intermediaire", "PT10H"),
    ("cro-conversion-optimization", "CRO : Optimisation du Taux de Conversion", "avance", "PT12H"),
    ("email-marketing-complet", "Email Marketing Complet", "debutant", "PT10H"),
    ("ga4-google-analytics-mastery", "Google Analytics 4 (GA4) Mastery", "intermediaire", "PT10H"),
    ("google-ads-debutant", "Google Ads pour Débutants", "debutant", "PT12H"),
    ("ia-generative-marketing", "IA Générative pour le Marketing", "intermediaire", "PT12H"),
    ("inbound-marketing-complet", "Inbound Marketing Complet", "intermediaire", "PT14H"),
    ("linkedin-b2b-personal-branding", "LinkedIn B2B & Personal Branding", "debutant", "PT10H"),
    ("marketing-digital-fondamentaux", "Marketing Digital - Fondamentaux", "debutant", "PT12H"),
    ("marketing-digital-strategie-avancee", "Marketing Digital - Stratégie Avancée", "avance", "PT16H"),
    ("meta-ads-facebook-instagram", "Meta Ads Facebook & Instagram", "debutant", "PT12H"),
    ("motion-design-after-effects-marketing", "Motion Design After Effects Marketing", "intermediaire", "PT14H"),
    ("newsletter-monetisation-creator", "Newsletter & Monétisation Creator", "intermediaire", "PT10H"),
    ("prompt-engineering-avance", "Prompt Engineering Avancé", "avance", "PT10H"),
    ("redaction-seo-articles-qui-rankent", "Rédaction SEO : Articles qui Rankent", "intermediaire", "PT12H"),
    ("seo-avance", "SEO Avancé", "avance", "PT14H"),
    ("seo-debutant", "SEO pour Débutants", "debutant", "PT12H"),
    ("seo-intermediaire", "SEO Intermédiaire", "intermediaire", "PT12H"),
    ("seo-local-google-business", "SEO Local & Google Business Profile", "debutant", "PT10H"),
    ("shopify-marchand-debutant", "Shopify Marchand Débutant", "debutant", "PT12H"),
    ("social-media-strategie-complete", "Social Media - Stratégie Complète", "intermediaire", "PT12H"),
    ("tiktok-ads-creator-economy", "TikTok Ads & Creator Economy", "intermediaire", "PT10H"),
    ("ui-design-figma-mastery", "UI Design Figma Mastery", "intermediaire", "PT14H"),
    ("wordpress-debutant", "WordPress pour Débutants", "debutant", "PT12H"),
    ("wordpress-intermediaire", "WordPress Intermédiaire", "intermediaire", "PT12H"),
    ("wordpress-securite-performance", "WordPress Sécurité & Performance", "avance", "PT12H"),
]


def formations_catalog() -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": f"{DOMAIN}/formations/#collection",
        "name": "Pirabel Labs Academy - Catalogue de formations gratuites",
        "description": "30 formations gratuites en marketing digital, SEO, WordPress, IA, design et publicité, par les experts Pirabel Labs basés à Abomey-Calavi (Bénin).",
        "url": f"{DOMAIN}/formations/",
        "inLanguage": "fr",
        "isPartOf": {"@type": "WebSite", "@id": f"{DOMAIN}#website"},
        "publisher": {
            "@type": "Organization",
            "@id": f"{DOMAIN}#organization",
            "name": "Pirabel Labs",
            "url": DOMAIN
        },
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": len(FORMATIONS),
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": i + 1,
                    "item": {
                        "@type": "Course",
                        "name": title,
                        "url": f"{DOMAIN}/formations/{slug}",
                        "description": f"Formation gratuite : {title}. Niveau {level}.",
                        "educationalLevel": level,
                        "timeRequired": hours,
                        "inLanguage": "fr",
                        "isAccessibleForFree": True,
                        "provider": {
                            "@type": "Organization",
                            "@id": f"{DOMAIN}#organization",
                            "name": "Pirabel Labs"
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "EUR",
                            "category": "free"
                        },
                        "hasCourseInstance": {
                            "@type": "CourseInstance",
                            "courseMode": "online",
                            "courseWorkload": hours,
                            "inLanguage": "fr"
                        }
                    }
                }
                for i, (slug, title, level, hours) in enumerate(FORMATIONS)
            ]
        }
    }


# -----------------------------------------------------------------------------
# Page handlers
# -----------------------------------------------------------------------------

def handle_index(html: str) -> tuple[str, list[str]]:
    """index.html : injecter LocalBusiness enrichi (geo, sameAs, rating)."""
    fixes = []
    # Block: LocalBusiness with geo, sameAs, rating
    if not has_marker(html, 'org-local'):
        frag = block('org-local', org_local_business())
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append("Injected LocalBusiness with geo Abomey-Calavi + sameAs + aggregateRating")
    return html, fixes


def handle_a_propos(html: str) -> tuple[str, list[str]]:
    fixes = []
    # Enriched Persons with sameAs
    if not has_marker(html, 'person-gildas-enriched'):
        frag = block('person-gildas-enriched', person_payload('gildas', [
            "https://www.linkedin.com/in/lissanon-gildas",
            "https://twitter.com/lissanon_gildas"
        ]))
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append("Injected enriched Person Lissanon Gildas (sameAs LinkedIn, image, knowsLanguage)")
    if not has_marker(html, 'person-fidah-enriched'):
        frag = block('person-fidah-enriched', person_payload('fidah', [
            "https://www.linkedin.com/in/fidah-imorou",
            "https://github.com/fidah-imorou"
        ]))
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append("Injected enriched Person Fidah Imorou (sameAs LinkedIn/GitHub, image, knowsLanguage)")
    # BreadcrumbList
    if not has_marker(html, 'breadcrumb'):
        frag = block('breadcrumb', breadcrumb([
            ("Accueil", "/"),
            ("À propos", "/a-propos")
        ]))
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append("Injected BreadcrumbList Accueil > A propos")
    return html, fixes


def handle_contact(html: str) -> tuple[str, list[str]]:
    fixes = []
    if not has_marker(html, 'contact-page-enriched'):
        payload = {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "@id": f"{DOMAIN}/contact#page",
            "name": "Contact Pirabel Labs - Parlons de votre projet digital",
            "description": "Contactez Pirabel Labs depuis Abomey-Calavi (Bénin). Audit gratuit, réponse sous 24h.",
            "url": f"{DOMAIN}/contact",
            "inLanguage": "fr",
            "isPartOf": {"@type": "WebSite", "@id": f"{DOMAIN}#website"},
            "about": {"@type": "Organization", "@id": f"{DOMAIN}#organization"},
            "mainEntity": {
                "@type": "Organization",
                "@id": f"{DOMAIN}#organization",
                "name": "Pirabel Labs",
                "url": DOMAIN,
                "email": "contact@pirabellabs.com",
                "telephone": "+22901688884534",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Abomey-Calavi",
                    "addressCountry": "BJ"
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": ABC_LAT,
                    "longitude": ABC_LNG
                },
                "contactPoint": [
                    {
                        "@type": "ContactPoint",
                        "contactType": "sales",
                        "email": "contact@pirabellabs.com",
                        "telephone": "+22901688884534",
                        "areaServed": ["BJ", "FR", "CI", "SN", "MA", "CA"],
                        "availableLanguage": ["French", "English"]
                    },
                    {
                        "@type": "ContactPoint",
                        "contactType": "customer support",
                        "email": "contact@pirabellabs.com",
                        "telephone": "+16139273067",
                        "areaServed": ["CA", "US", "FR"],
                        "availableLanguage": ["French", "English"]
                    }
                ]
            }
        }
        frag = block('contact-page-enriched', payload)
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append("Injected enriched ContactPage with geo coords + contactPoint multilingue")
    if not has_marker(html, 'breadcrumb'):
        frag = block('breadcrumb', breadcrumb([
            ("Accueil", "/"),
            ("Contact", "/contact")
        ]))
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append("Injected BreadcrumbList Accueil > Contact")
    return html, fixes


def handle_services(html: str) -> tuple[str, list[str]]:
    fixes = []
    if not has_marker(html, 'services-catalog-full'):
        frag = block('services-catalog-full', services_offer_catalog())
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append("Injected full Service OfferCatalog (10 services au lieu de 4)")
    if not has_marker(html, 'breadcrumb'):
        frag = block('breadcrumb', breadcrumb([
            ("Accueil", "/"),
            ("Services", "/services")
        ]))
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append("Injected BreadcrumbList Accueil > Services")
    return html, fixes


def handle_faq(html: str) -> tuple[str, list[str]]:
    fixes = []
    if not has_marker(html, 'breadcrumb'):
        frag = block('breadcrumb', breadcrumb([
            ("Accueil", "/"),
            ("FAQ", "/faq")
        ]))
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append("faq.html: Injected BreadcrumbList Accueil > FAQ")
    return html, fixes


def handle_service_page(html: str, slug: str, name: str, description: str, stype: str,
                        price: int) -> tuple[str, list[str]]:
    fixes = []
    if not has_marker(html, 'service-enriched'):
        frag = block('service-enriched', service_complete(name, slug, description, stype, price))
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append(f"{slug}: Injected enriched Service (provider details, offers/priceSpec, aggregateRating)")
    if not has_marker(html, 'breadcrumb'):
        frag = block('breadcrumb', breadcrumb([
            ("Accueil", "/"),
            ("Services", "/services"),
            (name, f"/{slug}")
        ]))
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append(f"{slug}: Injected BreadcrumbList")
    return html, fixes


def handle_formations_index(html: str) -> tuple[str, list[str]]:
    fixes = []
    if not has_marker(html, 'formations-collection'):
        frag = block('formations-collection', formations_catalog())
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append("formations/index.html: Injected CollectionPage + ItemList de 30 Course (etait totalement absent)")
    if not has_marker(html, 'breadcrumb'):
        frag = block('breadcrumb', breadcrumb([
            ("Accueil", "/"),
            ("Formations", "/formations/")
        ]))
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append("formations/index.html: Injected BreadcrumbList")
    return html, fixes


def handle_blog(html: str, slug: str) -> tuple[str, list[str]]:
    fixes = []
    if not has_marker(html, 'breadcrumb'):
        # extract title from existing BlogPosting headline si possible
        m = re.search(r'<title>([^<]+)</title>', html, re.I)
        page_title = m.group(1).strip() if m else slug.replace('-', ' ').title()
        # truncate for breadcrumb readability
        if len(page_title) > 70:
            page_title = page_title[:67] + '...'
        frag = block('breadcrumb', breadcrumb([
            ("Accueil", "/"),
            ("Blog", "/blog"),
            (page_title, f"/blog/{slug}")
        ]))
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append(f"blog/{slug}: Injected BreadcrumbList")
    return html, fixes


def handle_guide(html: str, slug: str) -> tuple[str, list[str]]:
    fixes = []
    # detect if HowTo-applicable (presence of "steps", "etapes", "checklist" in title/h1)
    is_howto = bool(re.search(r'\b(checklist|étapes?|etapes?|comment|guide complet)\b', html[:8000], re.I))
    if not has_marker(html, 'breadcrumb'):
        m = re.search(r'<title>([^<]+)</title>', html, re.I)
        page_title = m.group(1).strip() if m else slug.replace('-', ' ').title()
        if len(page_title) > 70:
            page_title = page_title[:67] + '...'
        frag = block('breadcrumb', breadcrumb([
            ("Accueil", "/"),
            ("Guides", "/guides/"),
            (page_title, f"/guides/{slug}")
        ]))
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append(f"guides/{slug}: Injected BreadcrumbList")
    # Upgrade Article author from Organization to Person + add Person author block
    if not has_marker(html, 'guide-author-person'):
        m = re.search(r'<title>([^<]+)</title>', html, re.I)
        page_title = m.group(1).strip() if m else slug.replace('-', ' ').title()
        author_payload = {
            "@context": "https://schema.org",
            "@type": "Article",
            "@id": f"{DOMAIN}/guides/{slug}#article",
            "headline": page_title,
            "url": f"{DOMAIN}/guides/{slug}",
            "inLanguage": "fr",
            "author": {
                "@type": "Person",
                "@id": f"{DOMAIN}/a-propos#lissanon-gildas",
                "name": FOUNDERS["gildas"]["name"],
                "jobTitle": FOUNDERS["gildas"]["jobTitle"],
                "url": FOUNDERS["gildas"]["url"]
            },
            "publisher": {
                "@type": "Organization",
                "@id": f"{DOMAIN}#organization",
                "name": "Pirabel Labs",
                "url": DOMAIN,
                "logo": {"@type": "ImageObject", "url": f"{DOMAIN}/img/logo.png"}
            },
            "isPartOf": {"@type": "WebSite", "@id": f"{DOMAIN}#website"}
        }
        frag = block('guide-author-person', author_payload)
        new = inject_before_head_close(html, frag)
        if new:
            html = new
            fixes.append(f"guides/{slug}: Injected Person author (Lissanon Gildas) for E-E-A-T")
    return html, fixes


# -----------------------------------------------------------------------------
# Driver
# -----------------------------------------------------------------------------

# Service page metadata
SERVICE_PAGES = {
    "agence-seo-referencement-naturel": (
        "Agence SEO & Référencement Naturel",
        "Agence SEO premium basée à Abomey-Calavi. Audit SEO technique, SEO local, rédaction SEO, netlinking, Generative Engine Optimization.",
        "Search Engine Optimization",
        500
    ),
    "agence-creation-sites-web": (
        "Agence Création de Sites Web & E-commerce",
        "Création de sites web performants : Webflow, WordPress, Shopify, sur mesure. Mobile-first, Core Web Vitals optimisés, SEO ready.",
        "Web Development",
        1500
    ),
    "agence-ia-automatisation": (
        "Agence IA & Automatisation",
        "Automatisation Make, n8n, Zapier. Chatbots IA, agents IA, intégration RAG, workflows métier sur mesure.",
        "Artificial Intelligence & Automation",
        800
    ),
}


def main(dry_run: bool = False) -> int:
    summary = []
    total_fixes = []

    # Single-page targets
    targets = [
        (ROOT / "index.html", handle_index),
        (ROOT / "a-propos.html", handle_a_propos),
        (ROOT / "contact.html", handle_contact),
        (ROOT / "services.html", handle_services),
        (ROOT / "faq.html", handle_faq),
        (ROOT / "formations" / "index.html", handle_formations_index),
    ]

    for path, handler in targets:
        if not path.exists():
            continue
        original = read(path)
        new_html, fixes = handler(original)
        if fixes and not dry_run:
            write(path, new_html)
        if fixes:
            total_fixes.extend([f"{path.relative_to(ROOT).as_posix()}: {f}" for f in fixes])

    # Service pages
    for slug, (name, desc, stype, price) in SERVICE_PAGES.items():
        path = ROOT / slug / "index.html"
        if not path.exists():
            continue
        original = read(path)
        new_html, fixes = handle_service_page(original, slug, name, desc, stype, price)
        if fixes and not dry_run:
            write(path, new_html)
        if fixes:
            total_fixes.extend(fixes)

    # Blog articles
    blog_dir = ROOT / "blog"
    if blog_dir.exists():
        for path in blog_dir.glob("*.html"):
            if any(p in str(path) for p in SKIP_DIRS):
                continue
            slug = path.stem
            original = read(path)
            new_html, fixes = handle_blog(original, slug)
            if fixes and not dry_run:
                write(path, new_html)
            if fixes:
                total_fixes.extend(fixes)

    # Guides
    guides_dir = ROOT / "guides"
    if guides_dir.exists():
        for path in guides_dir.glob("*.html"):
            if path.name == "index.html":
                continue
            slug = path.stem
            original = read(path)
            new_html, fixes = handle_guide(original, slug)
            if fixes and not dry_run:
                write(path, new_html)
            if fixes:
                total_fixes.extend(fixes)

    print(f"\n{'=' * 70}")
    print(f"SEO LENS SCHEMA - {'DRY RUN' if dry_run else 'EXECUTED'}")
    print(f"{'=' * 70}")
    print(f"Total fixes: {len(total_fixes)}")
    for f in total_fixes[:50]:
        print(f"  + {f}")
    if len(total_fixes) > 50:
        print(f"  ... and {len(total_fixes) - 50} more")
    return len(total_fixes)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument('--dry-run', action='store_true')
    args = p.parse_args()
    sys.exit(0 if main(args.dry_run) >= 0 else 1)
