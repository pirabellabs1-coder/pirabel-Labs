"""
Injecte sur chaque page : 3 sections 2-col image+texte + 1 section services similaires.
Cible :
- 12 sous-services agence-* (Webflow, Elementor, Make, n8n, Brevo, HubSpot, etc.)
- 6 services parents (creation-site-web, seo, community-management, etc.)
- 3 nouveaux services premium (agence-ia est deja fait, on cible creation-saas, solutions-ia)
"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))

# Unsplash photo IDs grouped by category for contextual relevance
IMAGES = {
    "design": [
        "1545235617-9465d2a55698",  # designer at work
        "1559028012-481c04fa702d",  # web design mockup
        "1561070791-2526d30994b8"   # tablet with design
    ],
    "code": [
        "1517694712202-14dd9538aa97",  # code on laptop
        "1551288049-bebda4e38f71",     # code screen
        "1555066931-4365d14bab8c"      # programming
    ],
    "ecommerce": [
        "1556742049-0cfed4f6a45d",  # shopping cart screen
        "1607082348824-0a96f2a4b9da",  # ecommerce dashboard
        "1556742400-b5b7c5121f8a"  # online shopping
    ],
    "automation": [
        "1518770660439-4636190af475",  # cyber connections
        "1531297484001-80022131f5a1",  # circuit
        "1535378620166-273708d44e4c"  # workflow
    ],
    "email_crm": [
        "1596526131083-e8c633c948d2",  # email inbox
        "1577563908411-5077b6dc7624",  # crm dashboard
        "1551836022-deb4988cc6c0"   # email envelope
    ],
    "seo": [
        "1460925895917-afdab827c52f",  # analytics laptop
        "1542744173-8e7e53415bb0",     # data analysis
        "1556761175-5973dc0f32e7"      # analytics dashboard
    ],
    "social": [
        "1611162616475-46b635cb6868",  # phone video
        "1611162617213-7d7a39e9b1d7",  # instagram phone
        "1611605698335-8b1569810432"   # social media
    ],
    "tunnels": [
        "1556761175-5973dc0f32e7",  # dashboard
        "1551288049-bebda4e38f71",  # screen data
        "1543286386-713bdd548da4"   # conversion funnel
    ],
    "ai": [
        "1620712943543-bcc4688e7485",  # ai brain
        "1677442136019-21780ecad995",  # ai interface
        "1485827404703-89b55fcc595e"   # robot
    ],
    "saas": [
        "1555066931-4365d14bab8c",  # programming
        "1559028012-481c04fa702d",  # design web
        "1517694712202-14dd9538aa97"  # code laptop
    ],
    "team": [
        "1522071820081-009f0129c71c",  # team
        "1556761175-5973dc0f32e7",     # office
        "1521737711867-e3b97375f902"   # collab
    ]
}

# Content blocks per page slug
PAGES = {
    "agence-webflow": {
        "category": "design",
        "eyebrow": "Pourquoi Webflow",
        "title": "Webflow, l'outil <em>premium</em> pour un site moderne sans compromis.",
        "lead": "Webflow combine la liberté de Webflow Designer (CSS pixel-perfect, animations natives) avec un CMS robuste et un hébergement edge-network. Pour les marques qui veulent un site impeccable, rapide, et facile à maintenir.",
        "blocks": [
            ("Design pixel-perfect", "Avec Webflow Designer, nous codons votre site visuel : chaque element, chaque animation, chaque interaction est defini avec precision. Plus de bricolage CSS.",
             ["Animations natives sans plugin", "Responsive natif sans dette technique", "CMS Webflow intégré et flexible"]),
            ("Performance Core Web Vitals 95+", "Webflow génère un code propre et léger. Hébergement edge AWS CloudFront. Vos visiteurs voient votre site charger en moins de 1 seconde.",
             ["LCP < 2.5s sur mobile et desktop", "CLS < 0.1 (zero layout shift)", "Score Lighthouse 95+ garanti"]),
            ("Autonomie complète post-livraison", "Vos équipes éditent le contenu directement via l'interface Editor de Webflow. Pas besoin de developpeur pour ajouter un article, modifier un texte, changer une image.",
             ["Editor visuel intuitif", "Workflow de validation intégré", "Sauvegardes auto chaque jour"])
        ],
        "related": [
            ("/agence-elementor", "dashboard_customize", "Agence Elementor", "Alternative WordPress drag and drop"),
            ("/agence-site-vitrine", "window", "Agence site vitrine", "Sites professionnels clé en main"),
            ("/creation-site-web", "code", "Création de site web", "Tous types de sites sur mesure"),
            ("/seo", "search_insights", "SEO & référencement", "Trafic organique qualifié"),
            ("/agence-ecommerce", "shopping_cart", "Agence e-commerce", "Boutique en ligne complète"),
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "Landing pages CRO")
        ]
    },
    "agence-elementor": {
        "category": "design",
        "eyebrow": "Pourquoi Elementor",
        "title": "Elementor, le builder <em>WordPress</em> le plus puissant et flexible.",
        "lead": "Elementor combine la puissance de WordPress (10M+ sites web, écosystème de plugins infini) avec un builder visuel drag and drop. Idéal pour les PME qui veulent autonomie et performance.",
        "blocks": [
            ("Design sur mesure sans coder", "Avec Elementor Pro, nous construisons votre site bloc par bloc. Animations, popups, formulaires avancés, theme builder pour personnaliser chaque template WordPress.",
             ["Templates premium illimités", "Theme builder pour headers/footers", "Popup builder pour conversion"]),
            ("Écosystème WordPress complet", "WooCommerce pour e-commerce, RankMath pour le SEO, WPForms pour les formulaires. 50 000+ plugins disponibles pour étendre votre site.",
             ["WooCommerce intégré nativement", "Plugins SEO de niveau pro", "Backups et sécurité solides"]),
            ("Maintenance et évolutivité long terme", "WordPress est utilisé par 43% des sites web mondiaux. Solidité éprouvée, support communautaire massif, evolutions garanties pendant des années.",
             ["43% des sites web mondiaux", "Support communautaire massif", "Mises à jour régulières gratuites"])
        ],
        "related": [
            ("/agence-webflow", "web", "Agence Webflow", "Alternative no-code premium"),
            ("/creation-site-wordpress", "edit_document", "Création site WordPress", "Sites WordPress sur mesure"),
            ("/agence-woocommerce", "shopping_cart", "Agence WooCommerce", "E-commerce WordPress"),
            ("/agence-site-vitrine", "window", "Agence site vitrine", "Sites professionnels"),
            ("/seo", "search_insights", "SEO & référencement", "Trafic organique qualifié"),
            ("/creation-site-web", "code", "Création de site web", "Tous types de sites")
        ]
    },
    "agence-woocommerce": {
        "category": "ecommerce",
        "eyebrow": "Pourquoi WooCommerce",
        "title": "WooCommerce, l'e-commerce <em>WordPress</em> sans limites.",
        "lead": "WooCommerce propulse 28% des boutiques en ligne mondiales. Flexibilité maximale, controle total du code, intégration native WordPress et de centaines d'extensions e-commerce.",
        "blocks": [
            ("Catalogue produit illimité", "Gérez 10 ou 10 000 produits avec attributs, variations, stocks, promotions. Import/export CSV, synchronisation ERP. Pas de limite technique.",
             ["Variations produits illimitées", "Gestion stocks multi-entrepôts", "Import/export bulk CSV"]),
            ("Paiements internationaux", "Stripe, PayPal, virement, Mobile Money (MTN, Orange) via plugins dédiés. Multi-devise, multi-langue. Adapté Afrique et Europe.",
             ["Stripe + PayPal natifs", "Mobile Money Africain", "Multi-devise (EUR, FCFA, USD)"]),
            ("Évolutivité long terme", "Architecture solide, ecosysteme massif (15 000+ extensions), communauté active. Votre boutique grandit avec vos ambitions.",
             ["15 000+ extensions disponibles", "Hébergement scalable", "API REST pour intégrations"])
        ],
        "related": [
            ("/agence-prestashop", "storefront", "Agence PrestaShop", "Alternative open source FR"),
            ("/agence-ecommerce", "shopping_cart", "Agence e-commerce", "Tous CMS e-commerce"),
            ("/agence-elementor", "dashboard_customize", "Agence Elementor", "Builder WordPress"),
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "Landing pages CRO"),
            ("/seo", "search_insights", "SEO & référencement", "SEO produits e-commerce"),
            ("/automatisation-marketing", "smart_toy", "Automatisation", "Workflows commande")
        ]
    },
    "agence-prestashop": {
        "category": "ecommerce",
        "eyebrow": "Pourquoi PrestaShop",
        "title": "PrestaShop, l'alternative <em>open source européenne</em>.",
        "lead": "PrestaShop est la solution e-commerce open source la plus utilisée en Europe francophone. Hébergement libre, code source ouvert, communauté active de modules et de templates.",
        "blocks": [
            ("Souveraineté de vos données", "Code open source, hébergement chez votre fournisseur, données entierement sous votre controle. Idéal RGPD, audit interne facile.",
             ["Hébergement libre (OVH, Infomaniak)", "Code source 100% ouvert", "Conformité RGPD facilitée"]),
            ("Modules métier français", "Plus de 5 000 modules : transporteurs FR (Mondial Relay, Chronopost), comptabilité française, gestion TVA EU, marketplaces (Amazon, Cdiscount).",
             ["5 000+ modules disponibles", "Transporteurs FR natifs", "Comptabilité française complète"]),
            ("Multi-boutique natif", "Gérez plusieurs boutiques (par marque, par langue, par pays) depuis un seul back-office. Catalogue partagé, configurations distinctes.",
             ["Multi-boutique sans plugin", "Multi-langue 60+ langues", "Marketplaces françaises"])
        ],
        "related": [
            ("/agence-woocommerce", "shopping_cart", "Agence WooCommerce", "Alternative WordPress"),
            ("/agence-ecommerce", "shopping_cart", "Agence e-commerce", "Tous CMS e-commerce"),
            ("/agence-elementor", "dashboard_customize", "Agence Elementor", "Builder WordPress"),
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "Landing pages CRO"),
            ("/seo", "search_insights", "SEO & référencement", "SEO produits"),
            ("/automatisation-marketing", "smart_toy", "Automatisation", "Workflows commande")
        ]
    },
    "agence-ecommerce": {
        "category": "ecommerce",
        "eyebrow": "Notre expertise e-commerce",
        "title": "Boutiques en ligne <em>qui convertissent</em>, pas juste qui exposent.",
        "lead": "E-commerce n'est pas qu'un catalogue produit. C'est une expérience d'achat optimisée, un tunnel de paiement fluide, une stratégie SEO produit, une fidelisation client. Nous orchestrons tout.",
        "blocks": [
            ("Conception centrée conversion", "Tunnel d'achat optimise CRO : page produit irresistible, panier sans friction, paiement 1-clic. Taux conversion typique passe de 1% a 3-5%.",
             ["UX panier minimaliste", "Paiement 1-clic mobile", "A/B testing sur prix et CTA"]),
            ("Multi-plateformes selon vos besoins", "WooCommerce (WordPress), PrestaShop (open source FR), Shopify (SaaS premium), solutions sur mesure Next.js. Nous choisissons selon votre projet.",
             ["WooCommerce, PrestaShop, Shopify", "Solutions sur mesure Next.js", "Migration entre plateformes"]),
            ("Marketing après-vente automatisé", "Email post-achat, programme fidélité, panier abandonné, recommandations produits. Augmentation LTV de 30 à 80%.",
             ["Email panier abandonné", "Programme fidelite intégré", "Recommandations IA produits"])
        ],
        "related": [
            ("/agence-woocommerce", "shopping_cart", "Agence WooCommerce", "E-commerce WordPress"),
            ("/agence-prestashop", "storefront", "Agence PrestaShop", "E-commerce open source"),
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "Landing pages CRO"),
            ("/seo", "search_insights", "SEO & référencement", "SEO produits"),
            ("/community-management", "forum", "Community management", "Promotion sociale"),
            ("/automatisation-marketing", "smart_toy", "Automatisation", "Workflows ventes")
        ]
    },
    "agence-site-vitrine": {
        "category": "design",
        "eyebrow": "Site vitrine professionnel",
        "title": "Votre site vitrine, <em>votre meilleure carte de visite</em>.",
        "lead": "Le site vitrine est souvent le premier contact entre votre marque et vos prospects. Il doit incarner votre professionnalisme, être rapide, mobile-first, et SEO-ready.",
        "blocks": [
            ("Design qui marque l'esprit", "Identité visuelle forte, typographies premium, animations subtiles. Votre site doit donner envie de vous contacter dès les 5 premières secondes.",
             ["Charte graphique sur mesure", "Photos professionnelles incluses", "Animations subtiles et fluides"]),
            ("SEO local et national", "Optimisation pour vos mots-clés business, schéma.org LocalBusiness, intégration Google Business Profile. Apparaitre quand vos clients cherchent.",
             ["Schema.org structured data", "Optimisation pack local Google", "Méta tags optimisés H1-H6"]),
            ("Prise de RDV et conversion", "Formulaire de contact intelligent, calendrier de RDV en ligne (Calendly intégré), WhatsApp click-to-chat. Convertir les visiteurs en leads.",
             ["Calendly intégré natif", "Formulaire smart conditionnel", "WhatsApp click-to-chat"])
        ],
        "related": [
            ("/agence-webflow", "web", "Agence Webflow", "Premium no-code"),
            ("/agence-elementor", "dashboard_customize", "Agence Elementor", "Builder WordPress"),
            ("/creation-site-web", "code", "Création de site web", "Tous types"),
            ("/seo", "search_insights", "SEO & référencement", "Trafic organique"),
            ("/fiche-google-business", "location_on", "Google Business Profile", "Pack local"),
            ("/community-management", "forum", "Community management", "Présence sociale")
        ]
    },
    "agence-make": {
        "category": "automation",
        "eyebrow": "Pourquoi Make",
        "title": "Make (ex-Integromat), l'automation <em>visuelle et puissante</em>.",
        "lead": "Make est la plateforme d'automatisation no-code la plus visuelle du marché. Drag and drop, plus de 1000 intégrations natives, gestion avancée des erreurs et conditions. Pour les PME qui veulent automatiser sans coder.",
        "blocks": [
            ("Workflows visuels sans code", "Make permet de dessiner vos automatisations comme un schéma. Vous voyez exactement ce qui se passe à chaque étape. Debug facile, modification rapide.",
             ["Builder visuel drag-and-drop", "1000+ apps intégrées nativement", "Debugger pas-à-pas intégré"]),
            ("Intégrations puissantes et flexibles", "WhatsApp, HubSpot, Brevo, Notion, Airtable, Google Sheets, Stripe, OpenAI, Slack. Connectez tous vos outils en quelques clics.",
             ["WhatsApp + Mobile Money", "OpenAI + Claude integrations", "Webhooks pour APIs custom"]),
            ("Gestion d'erreurs et monitoring", "Retry automatique, alertes en cas d'echec, logs détaillés, rollback si nécessaire. Workflows fiables en production.",
             ["Retry automatique configurable", "Alertes Slack/email natives", "Logs détaillés 30 jours"])
        ],
        "related": [
            ("/agence-n8n", "account_tree", "Agence n8n", "Alternative open source"),
            ("/automatisation-marketing", "smart_toy", "Automatisation marketing", "Service complet"),
            ("/agents-ia-chatbots", "smart_toy", "Agents IA & chatbots", "Bots intelligents"),
            ("/agence-ia", "psychology", "Agence IA", "Solutions IA complètes"),
            ("/agence-hubspot", "hub", "Agence HubSpot", "CRM et marketing auto"),
            ("/agence-brevo", "mail", "Agence Brevo", "Email marketing")
        ]
    },
    "agence-n8n": {
        "category": "automation",
        "eyebrow": "Pourquoi n8n",
        "title": "n8n, l'automation <em>open source et self-hosted</em>.",
        "lead": "n8n est l'alternative open source à Make et Zapier. Auto-hébergeable, sans limite d'opérations, code modifiable. Pour les entreprises qui veulent garder le contrôle de leurs workflows et données.",
        "blocks": [
            ("Self-hosted ou cloud, vous choisissez", "n8n peut tourner sur votre propre serveur (Docker, Kubernetes) ou sur le cloud n8n. Données entièrement chez vous si souveraineté nécessaire.",
             ["Self-hosted (Docker, K8s)", "Cloud n8n disponible", "Souveraineté des données"]),
            ("Sans limite d'opérations", "Contrairement à Make/Zapier qui facturent à l'opération, n8n self-hosted n'a aucune limite. Idéal pour les workflows haut volume.",
             ["Aucune limite ops self-hosted", "Coût fixe prévisible", "Scaling illimité"]),
            ("Personnalisation totale du code", "Code source ouvert, nodes personnalisés en JavaScript, intégrations sur mesure. Pour les besoins très spécifiques.",
             ["Code 100% open source", "Custom nodes JS", "Intégrations sur mesure"])
        ],
        "related": [
            ("/agence-make", "linked_services", "Agence Make", "Alternative SaaS"),
            ("/automatisation-marketing", "smart_toy", "Automatisation marketing", "Service complet"),
            ("/agents-ia-chatbots", "smart_toy", "Agents IA & chatbots", "Bots IA"),
            ("/agence-ia", "psychology", "Agence IA", "Solutions IA"),
            ("/agence-brevo", "mail", "Agence Brevo", "Email marketing"),
            ("/creation-saas", "rocket_launch", "Création SaaS", "MVP SaaS")
        ]
    },
    "agence-systeme-io": {
        "category": "tunnels",
        "eyebrow": "Pourquoi Système.io",
        "title": "Système.io, le <em>tout-en-un français</em> pour entrepreneurs.",
        "lead": "Système.io combine landing pages, email marketing, tunnels de vente, espaces membres et automatisations dans une seule plateforme. Tarif unique, francophone, idéal pour formateurs et solopreneurs.",
        "blocks": [
            ("Tunnels de vente clé en main", "Templates de tunnels éprouvés (webinaire, formation, services). Drag and drop, optimisés CRO. Mise en ligne en quelques heures.",
             ["50+ templates de tunnels", "Drag and drop intuitif", "A/B testing intégré"]),
            ("Email + automation natif", "Sequences emails illimités, segmentation automatique, scoring leads. Tout intégré sans connecter d'outil tiers.",
             ["Emails illimités inclus", "Workflows visuels", "Segmentation auto leads"]),
            ("Espace membres et formations", "Hébergez vos formations en ligne (vidéo, PDF, quiz). Restrictions d'accès, drip content, certificats. Plateforme LMS native.",
             ["Hébergement vidéo illimité", "Drip content automatique", "Certificats personnalisés"])
        ],
        "related": [
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "Service complet CRO"),
            ("/agence-brevo", "mail", "Agence Brevo", "Email marketing avancé"),
            ("/agence-hubspot", "hub", "Agence HubSpot", "CRM complet"),
            ("/automatisation-marketing", "smart_toy", "Automatisation", "Make, n8n"),
            ("/email-marketing-crm", "send", "Email marketing CRM", "Service complet"),
            ("/creation-site-web", "code", "Création de site web", "Site vitrine moderne")
        ]
    },
    "agence-hubspot": {
        "category": "email_crm",
        "eyebrow": "Pourquoi HubSpot",
        "title": "HubSpot, le <em>CRM tout-en-un</em> qui scale avec vous.",
        "lead": "HubSpot combine CRM gratuit, marketing automation, sales pipeline, service client et CMS dans une plateforme unifiée. Plus de 200 000 entreprises l'utilisent dans le monde.",
        "blocks": [
            ("CRM puissant et gratuit", "Stockage illimité de contacts, suivi automatique des interactions (emails, appels, RDV), pipeline visuel des deals. Le tout sans frais cachés.",
             ["Contacts illimités gratuits", "Email tracking automatique", "Pipeline visuel des deals"]),
            ("Marketing automation puissant", "Sequences emails, workflows behavioral, scoring leads, segmentation dynamique. Tout pilotable depuis une interface unique.",
             ["Workflows visuels avancés", "Scoring leads automatique", "Segmentation dynamique"]),
            ("Sales hub pour fermer plus", "Sequences sales pour relancer, templates emails, calendrier intégré, devis personnalisés, intégration LinkedIn Sales Navigator.",
             ["Sequences sales auto", "Devis personnalisés intégrés", "Calendrier dans HubSpot"])
        ],
        "related": [
            ("/agence-brevo", "mail", "Agence Brevo", "Alternative européenne"),
            ("/automatisation-marketing", "smart_toy", "Automatisation marketing", "Make, n8n"),
            ("/agence-make", "linked_services", "Agence Make", "Intégrations avancées"),
            ("/email-marketing-crm", "send", "Email marketing CRM", "Service complet"),
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "Landing pages CRO"),
            ("/agence-ia", "psychology", "Agence IA", "Agents IA pour ventes")
        ]
    },
    "agence-brevo": {
        "category": "email_crm",
        "eyebrow": "Pourquoi Brevo",
        "title": "Brevo (ex-Sendinblue), l'<em>email marketing français</em> qui scale.",
        "lead": "Brevo (anciennement Sendinblue) est leader européen de l'email marketing. Plateforme française, RGPD natif, prix accessibles, fonctionnalités équivalentes à Mailchimp à coût réduit.",
        "blocks": [
            ("Email + SMS + WhatsApp", "Envoyez emails marketing, transactionnels, SMS et WhatsApp Business depuis une seule plateforme. Multi-canal sans connecter 5 outils.",
             ["Email transactionnel natif", "SMS marketing intégré", "WhatsApp Business API"]),
            ("Automation et scénarios visuels", "Workflows comportementaux (abandon panier, anniversaire, réengagement), scoring leads, segmentation dynamique. Tout visuel.",
             ["Workflows visuels avancés", "Scoring leads intégré", "Segmentation conditionnelle"]),
            ("Conformité RGPD et hébergement EU", "Société française, hébergement européen, conformité RGPD totale. Pas de transfert de données aux USA, pas de Schrems II.",
             ["Hébergement 100% Europe", "RGPD compliance native", "DPA fourni signé"])
        ],
        "related": [
            ("/agence-hubspot", "hub", "Agence HubSpot", "CRM tout-en-un"),
            ("/email-marketing-crm", "send", "Email marketing CRM", "Service complet"),
            ("/automatisation-marketing", "smart_toy", "Automatisation marketing", "Make, n8n"),
            ("/agence-make", "linked_services", "Agence Make", "Intégrations Brevo"),
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "Landing pages"),
            ("/agence-ia", "psychology", "Agence IA", "Personnalisation IA emails")
        ]
    },
    "agence-netlinking": {
        "category": "seo",
        "eyebrow": "Notre expertise netlinking",
        "title": "Backlinks <em>de qualité</em>, pas du spam de masse.",
        "lead": "Le netlinking reste le facteur #1 du SEO en 2026. Mais Google pénalise sévèrement les liens artificiels. Notre approche : peu de liens, mais des liens premium thématiques sur des sites à fort DR.",
        "blocks": [
            ("Backlinks DR 40+ uniquement", "Nous travaillons exclusivement avec des sites premium (DR 40+) dans votre thématique. Pas de PBN, pas de fermes de liens, pas de risque de penalité.",
             ["DR moyen 50+ garanti", "Sites thematiques pertinents", "Approche white-hat 100%"]),
            ("Anchor texts variés et naturels", "Profil de liens naturel : 40% brand, 30% URL nue, 20% partiel, 10% exact match. Pour passer sous le radar des algos Google.",
             ["Profil ancres naturel", "40% brand mentions", "Variations stratégiques"]),
            ("Reporting mensuel transparent", "Liste complète des liens obtenus, DR, traffic estimé, positions impactées. Pas de fausses promesses, des résultats mesurables.",
             ["Reporting Looker Studio", "DR et positions tracking", "ROI net mesuré"])
        ],
        "related": [
            ("/seo", "search_insights", "SEO & référencement", "Service SEO complet"),
            ("/audit-seo", "analytics", "Audit SEO gratuit", "Diagnostic gratuit"),
            ("/creation-site-web", "code", "Création de site web", "Site optimisé SEO"),
            ("/fiche-google-business", "location_on", "Google Business Profile", "SEO local"),
            ("/community-management", "forum", "Community management", "Présence sociale"),
            ("/blog", "article", "Blog Pirabel Labs", "Conseils SEO actuels")
        ]
    }
}


def render_2col_blocks(blocks, category, slug):
    """Render 3 alternating 2-col image+text blocks."""
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
            # Image left, text right
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
            # Text left, image right
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

    # Skip if already injected
    if "2-COL IMAGE+TEXT SECTIONS (auto-added)" in content:
        print(f"SKIP : {slug}.html (already injected)")
        return False

    section = build_section(slug, data)

    # Insert before </main>
    if "</main>" in content:
        new_content = content.replace("</main>", section + "\n\n</main>", 1)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"OK : {slug}.html")
        return True
    else:
        print(f"FAIL : {slug}.html (no </main>)")
        return False


count = 0
for slug, data in PAGES.items():
    if inject_into_page(slug, data):
        count += 1

print(f"\nTotal: {count} pages injectees")
