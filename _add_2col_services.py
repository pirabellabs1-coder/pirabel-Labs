"""
Etend le script aux 6 services parents + creation-saas + solutions-ia.
Total : 8 pages supplementaires.
"""
import os, sys

# Reuse logic from previous script
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.abspath(__file__))

# Re-define IMAGES and helpers locally to avoid import issue (the previous script may be deleted)
IMAGES = {
    "design": ["1545235617-9465d2a55698", "1559028012-481c04fa702d", "1561070791-2526d30994b8"],
    "code": ["1517694712202-14dd9538aa97", "1551288049-bebda4e38f71", "1555066931-4365d14bab8c"],
    "ecommerce": ["1556742049-0cfed4f6a45d", "1607082348824-0a96f2a4b9da", "1556742400-b5b7c5121f8a"],
    "automation": ["1518770660439-4636190af475", "1531297484001-80022131f5a1", "1535378620166-273708d44e4c"],
    "email_crm": ["1596526131083-e8c633c948d2", "1577563908411-5077b6dc7624", "1551836022-deb4988cc6c0"],
    "seo": ["1460925895917-afdab827c52f", "1542744173-8e7e53415bb0", "1556761175-5973dc0f32e7"],
    "social": ["1611162616475-46b635cb6868", "1611162617213-7d7a39e9b1d7", "1611605698335-8b1569810432"],
    "tunnels": ["1556761175-5973dc0f32e7", "1551288049-bebda4e38f71", "1543286386-713bdd548da4"],
    "ai": ["1620712943543-bcc4688e7485", "1677442136019-21780ecad995", "1485827404703-89b55fcc595e"],
    "saas": ["1555066931-4365d14bab8c", "1559028012-481c04fa702d", "1517694712202-14dd9538aa97"],
    "team": ["1522071820081-009f0129c71c", "1556761175-5973dc0f32e7", "1521737711867-e3b97375f902"],
    "google_local": ["1524661135-423995f22d0b", "1542744173-8e7e53415bb0", "1556761175-5973dc0f32e7"]
}

PAGES = {
    "creation-site-web": {
        "category": "code",
        "eyebrow": "Notre expertise web",
        "title": "Des sites web qui <em>convertissent</em>, pas juste qui exposent.",
        "lead": "Le site web n'est pas une plaquette en ligne. C'est votre meilleur commercial 24/7. Nous concevons des sites pensés pour la conversion, le SEO, la performance et l'autonomie de vos équipes.",
        "blocks": [
            ("Performance et Core Web Vitals 95+", "Lighthouse 95+ garanti. FCP < 1.5s, LCP < 2.5s, CLS < 0.1. Vos visiteurs voient votre site charger en une seconde, Google vous remercie.",
             ["Optimisation Core Web Vitals", "Images WebP + lazy loading", "CDN Cloudflare inclus"]),
            ("SEO intégré dès la conception", "Pas de SEO bricolé après. Architecture, balisage HTML5 sémantique, schema.org, sitemap auto, meta tags optimisés. Pour ranker dès la mise en ligne.",
             ["Architecture SEO-friendly", "Schema.org natif", "Sitemap + robots.txt auto"]),
            ("Stack moderne et future-proof", "WordPress, Webflow, Next.js selon votre projet. Hébergement Vercel, Cloudflare, AWS. Sécurité SSL, sauvegardes automatiques, monitoring 24/7.",
             ["WordPress / Webflow / Next.js", "Hébergement Vercel/AWS", "Monitoring + sauvegardes auto"])
        ],
        "related": [
            ("/agence-webflow", "web", "Agence Webflow", "Premium no-code"),
            ("/agence-elementor", "dashboard_customize", "Agence Elementor", "WordPress builder"),
            ("/agence-ecommerce", "shopping_cart", "Agence e-commerce", "Boutique en ligne"),
            ("/seo", "search_insights", "SEO & référencement", "Trafic organique"),
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "Conversion CRO"),
            ("/creation-saas", "rocket_launch", "Création SaaS", "MVP en 8-12 semaines")
        ]
    },
    "seo": {
        "category": "seo",
        "eyebrow": "Notre approche SEO",
        "title": "SEO qui <em>ramène des clients</em>, pas juste du trafic.",
        "lead": "Le SEO sérieux n'est pas un coup de baguette magique. C'est une méthodologie rigoureuse : audit technique, recherche de mots-clés, contenu profond, netlinking de qualité, monitoring continu. Résultats mesurables à 3-12 mois.",
        "blocks": [
            ("Audit technique 60+ points contrôlés", "Crawl complet, indexation, Core Web Vitals, schema.org, sitemap, robots.txt, redirections, contenu dupliqué. Rapport actionnable livré sous 7 jours.",
             ["Crawl Screaming Frog complet", "Audit Lighthouse + CrUX", "Plan d'action priorisé"]),
            ("Contenu SEO premium qui convertit", "Articles 1500+ mots, pages piliers, optimisation E-E-A-T, schema FAQ et HowTo. Pas de contenu generic IA : recherche utilisateur réelle.",
             ["Articles 1500+ mots premium", "Pages piliers thématiques", "Optimisation E-E-A-T"]),
            ("Netlinking de qualité, jamais de spam", "Backlinks DR 40+ uniquement, thématiques pertinentes, anchors variés. Approche white-hat 100%. Pas de PBN, pas de fermes de liens.",
             ["DR moyen 50+ garanti", "Anchors naturels variés", "Reporting transparent"])
        ],
        "related": [
            ("/agence-netlinking", "link", "Agence netlinking", "Backlinks premium"),
            ("/audit-seo", "analytics", "Audit SEO gratuit", "Diagnostic complet"),
            ("/fiche-google-business", "location_on", "Google Business Profile", "SEO local"),
            ("/creation-site-web", "code", "Création de site web", "Sites SEO-ready"),
            ("/blog", "article", "Blog Pirabel Labs", "Conseils SEO"),
            ("/agence-ia", "psychology", "Agence IA", "IA pour contenu SEO")
        ]
    },
    "community-management": {
        "category": "social",
        "eyebrow": "Notre approche social",
        "title": "Réseaux sociaux qui <em>convertissent</em>, pas juste qui likent.",
        "lead": "Beaucoup d'agences font de l'animation. Nous faisons du social qui ramène des clients. Stratégie éditoriale documentée, contenu qui transforme l'audience en pipeline, publicités optimisées CRO.",
        "blocks": [
            ("Stratégie éditoriale documentée", "Audit + benchmark concurrents, personas, ton de marque, formats, fréquence, hashtags, KPIs. Document partagé en interne, base pérenne.",
             ["Audit + benchmark concurrents", "Personas + tons documentés", "Calendrier éditorial mensuel"]),
            ("Création de contenu qui scrolle stop", "Visuels Figma sur mesure, vidéos verticales CapCut, captions optimisées hook + value + CTA. Format pensé pour chaque plateforme.",
             ["12 à 20 posts par mois", "Reels + Stories + vidéos", "Captions optimisées CRO"]),
            ("Publicités Meta + TikTok Ads pilotées", "Campagnes optimisées audiences, créas A/B testées, retargeting. ROAS moyen 3x à 6x sur nos clients.",
             ["Meta Ads + TikTok Ads", "A/B testing systématique", "ROAS 3x à 6x typique"])
        ],
        "related": [
            ("/community-instagram", "photo_camera", "Agence Instagram", "Spécialisation Instagram"),
            ("/community-tiktok", "music_video", "Agence TikTok", "Spécialisation TikTok"),
            ("/community-linkedin", "work", "Agence LinkedIn", "BtoB et thought leadership"),
            ("/montage-video", "movie", "Montage vidéo", "Reels + YouTube"),
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "Conversion CRO"),
            ("/automatisation-marketing", "smart_toy", "Automatisation", "Workflows DMs et leads")
        ]
    },
    "tunnels-de-vente": {
        "category": "tunnels",
        "eyebrow": "Notre approche tunnels",
        "title": "Tunnels qui <em>transforment</em> visiteurs en clients.",
        "lead": "1% à 5% de conversion n'est pas une question de chance. C'est une méthodologie : audit comportement, conception CRO, A/B testing, intégration paiement, sequences emails. Résultats immédiats.",
        "blocks": [
            ("Audit comportement utilisateur précis", "Hotjar et Microsoft Clarity pour observer où vos visiteurs abandonnent. Heatmaps, recordings, surveys. Identifier les frictions, pas deviner.",
             ["Hotjar + Microsoft Clarity", "Heatmaps + recordings", "Analyse parcours détaillée"]),
            ("Landing pages CRO haute conversion", "Hero clair en 3 secondes, social proof à proximité, FAQ qui rassure, urgence subtile, paiement en 1 clic. Patterns éprouvés.",
             ["Hero clair en 3 secondes", "Social proof intégré", "Paiement 1 clic"]),
            ("A/B testing data-driven, jamais au feeling", "Headlines, CTAs, formulaires, visuels, prix. Tout testé, tout mesuré. Décisions basées sur la data, pas l'opinion.",
             ["A/B testing systématique", "Outils Mixpanel/PostHog", "Décisions data-driven"])
        ],
        "related": [
            ("/agence-systeme-io", "conversion_path", "Agence Système.io", "Tout-en-un FR"),
            ("/creation-site-web", "code", "Création de site web", "Sites optimisés"),
            ("/email-marketing-crm", "send", "Email marketing CRM", "Nurturing"),
            ("/agence-hubspot", "hub", "Agence HubSpot", "CRM tout-en-un"),
            ("/agence-brevo", "mail", "Agence Brevo", "Email européen"),
            ("/automatisation-marketing", "smart_toy", "Automatisation", "Workflows ventes")
        ]
    },
    "fiche-google-business": {
        "category": "google_local",
        "eyebrow": "Notre approche pack local",
        "title": "Pack local Google : <em>50% des clics</em>, négligé par 90% des PME.",
        "lead": "Le pack local Google (3 fiches Google Maps en haut des résultats) capte plus de clics que le top 3 organique classique. Pourtant, 90% des PME ont une fiche mal optimisée. Opportunité massive.",
        "blocks": [
            ("Optimisation 30+ points de la fiche", "Catégorie principale + secondaires, description SEO 750 caractères, attributs, services listés, horaires, photos optimisées. Tout audité, tout optimisé.",
             ["Catégorie + secondaires optimales", "Description SEO 750 caractères", "30+ photos optimisées"]),
            ("Stratégie collecte d'avis (sans tricher)", "Email post-achat automatique, QR codes en boutique, demande personnalisée. Note moyenne 4.7+ atteignable en 90 jours.",
             ["Email post-achat automatique", "QR codes physiques", "Note 4.7+ en 90 jours"]),
            ("Posts hebdomadaires et FAQ activées", "1 à 2 posts par semaine (offres, événements, news). FAQ Q&R activée pour répondre aux questions fréquentes. Boost de visibilité Maps.",
             ["1-2 posts par semaine", "FAQ Q&R activée", "Boost visibilité Maps"])
        ],
        "related": [
            ("/seo", "search_insights", "SEO & référencement", "SEO complet"),
            ("/agence-netlinking", "link", "Agence netlinking", "Backlinks locaux"),
            ("/audit-seo", "analytics", "Audit SEO gratuit", "Diagnostic gratuit"),
            ("/creation-site-web", "code", "Création de site web", "Site SEO-ready"),
            ("/community-management", "forum", "Community management", "Présence sociale"),
            ("/agence-marketing-cotonou", "location_on", "Agence Cotonou", "Présence locale")
        ]
    },
    "automatisation-marketing": {
        "category": "automation",
        "eyebrow": "Notre expertise automatisation",
        "title": "Workflows qui <em>libèrent 15h/semaine</em> sans embaucher.",
        "lead": "Vos équipes perdent 15 à 20 heures par semaine sur des tâches répétitives : suivi leads, relances, reporting, mises à jour CRM. Nous automatisons tout, libérons leur temps pour la vente et le service.",
        "blocks": [
            ("Cartographie de vos process actuels", "Audit complet : trafic, leads, suivi, relance, vente, retention. Identification des fuites et des automatisations à fort ROI.",
             ["Audit 360 vos process", "Identification fuites ROI", "Plan d'action priorisé"]),
            ("Workflows Make + n8n + IA intégrés", "Make pour le SaaS, n8n pour le self-hosted, OpenAI/Claude pour l'intelligence. Combo puissant pour automatiser même les tâches complexes.",
             ["Make + n8n + OpenAI/Claude", "Workflows visuels", "Monitoring + retry auto"]),
            ("Intégration CRM, paiement, social, email", "HubSpot, Brevo, Pipedrive, Notion, Stripe, Mobile Money, WhatsApp, Instagram. Tous vos outils connectés.",
             ["50+ intégrations natives", "WhatsApp + Mobile Money", "Webhooks pour APIs custom"])
        ],
        "related": [
            ("/agence-make", "linked_services", "Agence Make", "Intégrations no-code"),
            ("/agence-n8n", "account_tree", "Agence n8n", "Self-hosted open source"),
            ("/agents-ia-chatbots", "smart_toy", "Agents IA & chatbots", "Bots IA WhatsApp"),
            ("/agence-ia", "psychology", "Agence IA", "Solutions IA complètes"),
            ("/agence-hubspot", "hub", "Agence HubSpot", "CRM tout-en-un"),
            ("/agence-brevo", "mail", "Agence Brevo", "Email marketing")
        ]
    },
    "creation-saas": {
        "category": "saas",
        "eyebrow": "Notre approche SaaS",
        "title": "Votre SaaS en <em>production</em>, pas un POC qui dort.",
        "lead": "Beaucoup d'agences livrent des MVP qui ressemblent à des démos. Nous livrons des SaaS prêts pour les premiers clients : auth solide, paiement Stripe intégré, scaling Vercel, monitoring Sentry. En production dès la livraison.",
        "blocks": [
            ("Stack moderne et scalable", "Next.js 14 + TypeScript + Tailwind + Supabase + Stripe + Vercel. Stack éprouvée qui scale de 0 à 1M d'utilisateurs sans refonte majeure.",
             ["Next.js 14 + TypeScript", "Supabase ou Node.js backend", "Vercel auto-scaling"]),
            ("Auth, billing, dashboard en standard", "Auth multi-fournisseurs (email, Google, GitHub), Stripe subscriptions avec free trial, dashboard utilisateur avec analytics, dashboard admin pour support.",
             ["Auth multi-fournisseurs", "Stripe avec subscriptions", "Dashboards user + admin"]),
            ("Documentation et autonomie après livraison", "Code remis, docs OpenAPI pour l'API, README détaillé, vidéos de prise en main. Vous pouvez reprendre la main avec n'importe quelle équipe.",
             ["Code 100% à vous", "Docs OpenAPI complete", "Vidéos de prise en main"])
        ],
        "related": [
            ("/agence-ia", "smart_toy", "Agence IA", "Intégrer IA dans SaaS"),
            ("/solutions-ia", "psychology", "Solutions IA sur mesure", "Features IA avancées"),
            ("/creation-site-web", "code", "Création de site web", "Landing page SaaS"),
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "Conversion utilisateurs"),
            ("/automatisation-marketing", "linked_services", "Automatisation", "Onboarding auto"),
            ("/seo", "search_insights", "SEO & référencement", "SEO pour SaaS")
        ]
    },
    "solutions-ia": {
        "category": "ai",
        "eyebrow": "Notre expertise IA avancée",
        "title": "L'IA <em>industrialisée</em>, au-delà des chatbots.",
        "lead": "Chatbots et agents IA sont le premier niveau. Les entreprises serieuses vont plus loin : RAG sur leur base de connaissances, fine-tuning de modèles sur leurs données, agents autonomes orchestrant des tâches complexes.",
        "blocks": [
            ("RAG sur votre base de connaissances", "Agents IA qui répondent à partir de vos documents internes (wikis, docs, code, FAQs). Vector DB Pinecone/Weaviate, embeddings OpenAI/Claude, hybrid search.",
             ["Vector DB Pinecone/Weaviate", "Embeddings OpenAI/Claude", "Hybrid search relevance"]),
            ("Fine-tuning de LLMs sur vos données", "Adaptation d'un modèle (Llama, Mistral, GPT) à votre domaine métier. Performance supérieure aux modèles génériques, coût d'inférence réduit.",
             ["Fine-tuning Llama 3, Mistral", "Optimisation prompts", "Coût d'inférence divisé par 3-5"]),
            ("Agents autonomes multi-step", "Agents qui orchestrent des tâches complexes : recherche web, analyse, redaction, validation, action. LangChain, CrewAI, AutoGPT en production.",
             ["LangChain + CrewAI", "Multi-step reasoning", "Tool use orchestration"])
        ],
        "related": [
            ("/agence-ia", "smart_toy", "Agence IA", "Service IA complet"),
            ("/creation-saas", "rocket_launch", "Création SaaS", "Intégrer IA dans SaaS"),
            ("/automatisation-marketing", "linked_services", "Automatisation", "Workflows IA"),
            ("/agents-ia-chatbots", "smart_toy", "Agents IA & chatbots", "Bots IA WhatsApp"),
            ("/agence-make", "linked_services", "Agence Make", "Make + OpenAI"),
            ("/agence-n8n", "account_tree", "Agence n8n", "n8n + IA")
        ]
    }
}


def render_2col_blocks(blocks, category, slug):
    imgs = IMAGES[category]
    out = []
    for i, (title, desc, bullets) in enumerate(blocks):
        img_url = f"https://images.unsplash.com/photo-{imgs[i % len(imgs)]}?auto=format&fit=crop&w=900&q=80"
        reverse_class = " alt-row--rev" if i % 2 == 1 else ""
        bullets_html = "".join(
            f'\n          <li><span class="material-symbols-outlined">check_circle</span> <span>{b}</span></li>'
            for b in bullets
        )
        if i % 2 == 0:
            block = f'''    <div class="alt-row{reverse_class}">
      <div class="alt-row__img">
        <img src="{img_url}" alt="{title} - Pirabel Labs" loading="lazy">
      </div>
      <div class="alt-row__txt">
        <h3 class="alt-row__title">{title}</h3>
        <p class="alt-row__desc">{desc}</p>
        <ul class="alt-row__bullets">{bullets_html}
        </ul>
      </div>
    </div>'''
        else:
            block = f'''    <div class="alt-row{reverse_class}">
      <div class="alt-row__txt">
        <h3 class="alt-row__title">{title}</h3>
        <p class="alt-row__desc">{desc}</p>
        <ul class="alt-row__bullets">{bullets_html}
        </ul>
      </div>
      <div class="alt-row__img">
        <img src="{img_url}" alt="{title} - Pirabel Labs" loading="lazy">
      </div>
    </div>'''
        out.append(block)
    return "\n\n".join(out)


def render_related(rel):
    out = []
    for url, icon, title, desc in rel:
        out.append(f'''      <a href="{url}" class="rel-card">
        <div class="rel-card__icon"><span class="material-symbols-outlined">{icon}</span></div>
        <div class="rel-card__title">{title}</div>
        <div class="rel-card__desc">{desc}</div>
        <div class="rel-card__cta">Voir <span class="material-symbols-outlined">arrow_forward</span></div>
      </a>''')
    return "\n".join(out)


def build_section(page_slug, data):
    blocks_html = render_2col_blocks(data["blocks"], data["category"], page_slug)
    related_html = render_related(data["related"])

    return f'''
<!-- ============= 2-COL IMAGE+TEXT SECTIONS (auto-added) ============= -->
<section class="alt-section" style="padding:clamp(3rem,6vw,5rem) var(--px-page);background:var(--bg-2);border-top:1px solid var(--border);">
  <style>
    .alt-section .alt-section__head {{ max-width: 50rem; margin: 0 0 3.5rem; }}
    .alt-section .alt-eyebrow {{ display: inline-block; font-family: var(--font-display); font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.18em; color: var(--accent); margin-bottom: 0.85rem; }}
    .alt-section .alt-h2 {{ font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: clamp(1.8rem, 3.4vw, 2.6rem); line-height: 1.1; letter-spacing: -0.025em; color: var(--text); text-align: left; max-width: 44rem; }}
    .alt-section .alt-h2 em {{ color: var(--accent); font-style: normal; }}
    .alt-section .alt-lead {{ font-size: 1.05rem; color: var(--text-muted); line-height: 1.65; max-width: 48rem; margin-top: 1rem; text-align: left; }}
    .alt-section .alt-row {{ display: grid; grid-template-columns: 1fr 1fr; gap: 3.5rem; align-items: center; margin-bottom: 4rem; max-width: 78rem; }}
    .alt-section .alt-row:last-child {{ margin-bottom: 0; }}
    .alt-section .alt-row__img {{ aspect-ratio: 4/3; border-radius: 18px; overflow: hidden; border: 1px solid var(--border); }}
    .alt-section .alt-row__img img {{ width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s ease; }}
    .alt-section .alt-row:hover .alt-row__img img {{ transform: scale(1.04); }}
    .alt-section .alt-row__title {{ font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: clamp(1.4rem, 2.4vw, 1.85rem); line-height: 1.2; letter-spacing: -0.02em; margin-bottom: 1rem; color: var(--text); text-align: left; }}
    .alt-section .alt-row__desc {{ font-size: 1rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 1.25rem; text-align: left; }}
    .alt-section .alt-row__bullets {{ list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.7rem; }}
    .alt-section .alt-row__bullets li {{ display: flex; gap: 0.6rem; align-items: flex-start; font-size: 0.95rem; color: var(--text); line-height: 1.55; }}
    .alt-section .alt-row__bullets li .material-symbols-outlined {{ color: var(--accent); font-size: 1.15rem; flex-shrink: 0; margin-top: 0.1rem; }}
    @media (max-width: 880px) {{
      .alt-section .alt-row {{ grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 2.5rem; }}
      .alt-section .alt-row--rev .alt-row__img {{ order: -1; }}
    }}
  </style>
  <div class="alt-section__head">
    <span class="alt-eyebrow">{data["eyebrow"]}</span>
    <h2 class="alt-h2">{data["title"]}</h2>
    <p class="alt-lead">{data["lead"]}</p>
  </div>
{blocks_html}
</section>

<!-- ============= RELATED SERVICES ============= -->
<section class="rel-section" style="padding:clamp(3rem,6vw,5rem) var(--px-page);">
  <style>
    .rel-section .rel-head {{ max-width: 50rem; margin: 0 0 2.5rem; }}
    .rel-section .rel-eyebrow {{ display: inline-block; font-family: var(--font-display); font-weight: 700; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.18em; color: var(--accent); margin-bottom: 0.85rem; }}
    .rel-section .rel-h2 {{ font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: clamp(1.6rem, 3vw, 2.2rem); line-height: 1.15; color: var(--text); text-align: left; }}
    .rel-section .rel-h2 em {{ color: var(--accent); font-style: normal; }}
    .rel-section .rel-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: 1rem; max-width: 78rem; }}
    .rel-section .rel-card {{ background: var(--bg-2); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem; text-decoration: none; color: var(--text); display: flex; flex-direction: column; gap: 0.5rem; transition: all 0.2s; }}
    .rel-section .rel-card:hover {{ border-color: var(--accent); transform: translateY(-3px); }}
    .rel-section .rel-card__icon {{ width: 2.5rem; height: 2.5rem; background: var(--accent-soft); color: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 0.4rem; }}
    .rel-section .rel-card__title {{ font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 1rem; color: var(--text); }}
    .rel-section .rel-card__desc {{ font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; flex: 1; }}
    .rel-section .rel-card__cta {{ font-family: var(--font-display); font-weight: 700; font-size: 0.8rem; color: var(--accent); display: inline-flex; align-items: center; gap: 0.25rem; margin-top: 0.5rem; }}
    .rel-section .rel-card__cta .material-symbols-outlined {{ font-size: 1rem; }}
  </style>
  <div class="rel-head">
    <span class="rel-eyebrow">Aussi a voir</span>
    <h2 class="rel-h2">Services <em>complementaires</em></h2>
  </div>
  <div class="rel-grid">
{related_html}
  </div>
</section>
'''


def inject_into_page(slug, data):
    fpath = os.path.join(ROOT, f"{slug}.html")
    if not os.path.exists(fpath):
        print(f"SKIP : {slug}.html (not found)")
        return False
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    if "2-COL IMAGE+TEXT SECTIONS (auto-added)" in content:
        print(f"SKIP : {slug}.html (already injected)")
        return False
    section = build_section(slug, data)
    if "</main>" in content:
        new_content = content.replace("</main>", section + "\n\n</main>", 1)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"OK : {slug}.html")
        return True
    return False


count = 0
for slug, data in PAGES.items():
    if inject_into_page(slug, data):
        count += 1
print(f"\nTotal: {count} services parents injectes")
