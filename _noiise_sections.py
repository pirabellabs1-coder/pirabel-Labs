"""
Refonte complete des sections injectees style NOIISE :
- Section A : 2-col editorial avec vraie photo de personne (text gauche, photo droite)
- Section B : 2-col accordion grid 4-6 items avec stat + chevron
- Section C : 2-col editorial reversed (photo gauche, text droite)
- Section D : 2-col accordion FAQ 8 items
- Section E : Related services cards

Backgrounds alternes bg / bg-2 pour visual breaks propres.
Photos reelles de personnes/equipes Unsplash.
"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))

# Real photos of people at work (Unsplash verified IDs)
PHOTOS = {
    "person_laptop": "1573497019940-1c28c88b4f3e",
    "team_meeting": "1521737711867-e3b97375f902",
    "person_desk": "1556761175-4b46a572b786",
    "business_meeting": "1521791136064-7986c2920216",
    "hands_keyboard": "1517048676732-d65bc937f952",
    "office_collab": "1551836022-d5d88e9218df",
    "man_laptop": "1531545514256-b1400bc00f31",
    "team_smiling": "1664575196412-ed801e8333a1",
    "dashboard": "1556761175-5973dc0f32e7",
    "brainstorm": "1543269865-cbf427effbad",
    "designer": "1559028012-481c04fa702d",
    "code_screen": "1517694712202-14dd9538aa97",
    "ecommerce": "1556742049-0cfed4f6a45d",
    "automation_chip": "1518770660439-4636190af475",
    "seo_chart": "1460925895917-afdab827c52f",
    "ai_visual": "1620712943543-bcc4688e7485",
    "email": "1596526131083-e8c633c948d2",
    "phone_video": "1611162616475-46b635cb6868",
    "instagram": "1611162617213-7d7a39e9b1d7",
    "saas_code": "1555066931-4365d14bab8c",
    "analytics": "1556761175-5973dc0f32e7",
    "team_office": "1556745753-b2904692b3cd",
    "smile_pro": "1573164713988-8665fc963095"
}


def photo(key, w=900):
    pid = PHOTOS[key]
    return f"https://images.unsplash.com/photo-{pid}?auto=format&fit=crop&w={w}&q=80"


# Per-page content
PAGES = {
    # ============= AGENCE SUB-SERVICES =============
    "agence-webflow": {
        "label": "Webflow",
        "category": "Web design",
        "section_a": {
            "eyebrow": "Définition",
            "title": "Qu'est-ce qu'une <em>agence Webflow</em> ?",
            "paragraphs": [
                "Une agence Webflow est une équipe spécialisée dans la conception et le développement de sites web premium sur la plateforme <strong>Webflow</strong>, un constructeur de sites no-code de nouvelle génération qui combine la liberté visuelle d'un éditeur Figma avec la puissance d'un CMS moderne et d'un hébergement edge global.",
                "Chez Pirabel Labs, nos designers et développeurs maîtrisent Webflow depuis 2020. Nous concevons des sites <strong>pixel-perfect, ultra-rapides et SEO-ready</strong>, adaptés aux marques exigeantes qui refusent les compromis sur le design ou la performance.",
                "Contrairement à WordPress qui nécessite du code et des plugins multiples, Webflow vous offre une autonomie totale post-livraison : vos équipes éditent les contenus directement via l'interface Editor, sans dépendance technique."
            ],
            "photo": "designer"
        },
        "section_b": {
            "eyebrow": "Pourquoi Webflow",
            "title": "Pourquoi choisir <em>Webflow</em> comme stack ?",
            "lead": "Webflow est devenu en 2026 LE choix premium pour les sites vitrines, landing pages SaaS et boutiques exigeantes. Voici les 5 raisons techniques qui font la différence.",
            "items": [
                ("Design pixel-perfect sans code", "100%",
                 "Webflow Designer reproduit fidèlement vos maquettes Figma. Chaque pixel, chaque animation, chaque interaction est défini avec précision. Plus de bricolage CSS ni de plugins qui cassent le design."),
                ("Performance Core Web Vitals 95+", "< 2.5s",
                 "Code généré propre et léger, hébergement edge AWS CloudFront. LCP < 2.5s, CLS < 0.1, FCP < 1.5s. Score Lighthouse 95+ garanti, Google vous récompense au ranking."),
                ("Hébergement edge mondial inclus", "180+",
                 "Le forfait Webflow inclut un hébergement sur 180+ points de présence mondiaux. Votre site charge en moins d'une seconde depuis n'importe où en Afrique, Europe ou Amérique du Nord."),
                ("CMS Webflow intégré et flexible", "Illimité",
                 "Collections dynamiques, références entre items, multi-langue natif. Vos équipes éditent le contenu via l'Editor sans toucher au design. Workflow de validation intégré."),
                ("SEO technique natif et complet", "100/100",
                 "Schema.org, balisage HTML5 sémantique, sitemap auto, robots.txt, méta tags par page, OG tags Open Graph. Tout est prêt dès la mise en ligne, pas de plugin SEO à installer."),
                ("Animations Webflow Interactions natives", "0 lib JS",
                 "Animations au scroll, hover effects, micro-interactions sans aucune librairie JavaScript externe (GSAP, Framer Motion). Performances préservées, expérience premium.")
            ]
        },
        "section_c": {
            "eyebrow": "Notre approche",
            "title": "Notre <em>méthode</em> Webflow éprouvée.",
            "paragraphs": [
                "Nous concevons votre site Webflow comme un <strong>produit</strong>, pas comme un livrable. Découverte business 30 min, maquettes Figma validées en mode commentaire, développement Webflow en sprints hebdomadaires avec démo live.",
                "Notre design system Webflow vous garantit cohérence visuelle, vitesse de développement et maintenance facilitée. <strong>Composants réutilisables</strong>, variables CSS globales, classes structurées BEM-like.",
                "Post-livraison : formation 1h à votre équipe sur l'Editor Webflow, documentation Notion partagée, garantie 30 jours sur les bugs, suivi gratuit le premier mois. Vous restez autonome ensuite."
            ],
            "photo": "person_laptop"
        },
        "section_d": {
            "eyebrow": "FAQ",
            "title": "Questions <em>fréquentes</em> sur Webflow",
            "faqs": [
                ("Webflow est-il vraiment sans code ?",
                 "Oui, à 100% côté éditeur. Vous concevez visuellement, Webflow génère le code HTML/CSS/JS propre en coulisses. Pour des cas avancés (intégration API, animations custom), nous pouvons ajouter du code custom dans les Embed blocks."),
                ("Combien coûte un site Webflow professionnel ?",
                 "Site vitrine 5-10 pages : 4 000 à 8 000 EUR. Site corporate avec CMS : 8 000 à 15 000 EUR. E-commerce Webflow : 10 000 à 25 000 EUR. Hébergement Webflow CMS Hosting : 23 à 49 USD/mois en plus."),
                ("Webflow est-il SEO-friendly ?",
                 "Oui, parmi les meilleurs du marché. Schema.org natif, balisage sémantique, sitemap auto, OG tags, robots.txt. Nos sites Webflow rankent souvent mieux que WordPress équivalent grâce à la performance Core Web Vitals."),
                ("Peut-on faire un e-commerce avec Webflow ?",
                 "Oui via Webflow Ecommerce : jusqu'à 3 000 produits, panier, paiement Stripe, gestion stock. Idéal pour les boutiques premium 50-500 produits. Pour des catalogues plus larges, nous recommandons Shopify ou WooCommerce."),
                ("Faut-il un développeur pour maintenir un site Webflow ?",
                 "Non. L'Editor Webflow permet à vos équipes marketing d'ajouter des articles, modifier des textes, changer des images, créer de nouvelles pages depuis un template. Pas besoin de toucher au design ni au code."),
                ("Webflow est-il sécurisé ?",
                 "Oui. SSL automatique, sauvegardes automatiques, protection DDoS Cloudflare, hébergement AWS. Score sécurité parmi les meilleurs du marché des CMS. Pas de mises à jour à gérer comme WordPress."),
                ("Combien de temps pour livrer un site Webflow ?",
                 "Site vitrine simple : 3 à 5 semaines. Site corporate avec CMS : 6 à 10 semaines. E-commerce : 8 à 12 semaines. Sprints hebdomadaires avec démo live, vous voyez le projet avancer en temps réel."),
                ("Webflow ou WordPress, lequel choisir ?",
                 "Webflow pour les sites vitrines premium, landing pages, sites corporate avec design fort. WordPress pour les blogs très publiés, e-commerce > 500 produits, besoin de plugins très spécifiques. Nous vous conseillons selon votre cas.")
            ]
        },
        "related": [
            ("/agence-elementor", "dashboard_customize", "Agence Elementor", "Alternative WordPress no-code"),
            ("/agence-site-vitrine", "window", "Agence site vitrine", "Sites premium clé en main"),
            ("/creation-site-web", "code", "Création de site web", "Tous types de sites"),
            ("/seo", "search_insights", "SEO & référencement", "Trafic organique qualifié"),
            ("/agence-ecommerce", "shopping_cart", "Agence e-commerce", "Boutiques en ligne"),
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "Landing pages CRO")
        ]
    },

    "agence-elementor": {
        "label": "Elementor",
        "category": "Web design",
        "section_a": {
            "eyebrow": "Définition",
            "title": "Qu'est-ce qu'une <em>agence Elementor</em> ?",
            "paragraphs": [
                "Une agence Elementor est une équipe spécialisée dans la conception de sites <strong>WordPress avec le builder visuel Elementor Pro</strong>, qui propulse plus de 16 millions de sites web mondiaux. Elementor combine la flexibilité de WordPress avec un drag-and-drop puissant.",
                "Chez Pirabel Labs, nous maîtrisons Elementor depuis 2021 sur tout types de projets : sites vitrines, corporate, blogs experts, e-commerce WooCommerce. Notre approche : <strong>design Figma d'abord, intégration Elementor ensuite</strong>, jamais l'inverse.",
                "Elementor est idéal pour les PME qui veulent autonomie post-livraison et accès au gigantesque écosystème WordPress (50 000+ plugins, communauté mondiale, hébergeurs spécialisés)."
            ],
            "photo": "team_office"
        },
        "section_b": {
            "eyebrow": "Pourquoi Elementor",
            "title": "Pourquoi choisir <em>Elementor Pro</em> ?",
            "lead": "Elementor Pro est devenu le standard pour les sites WordPress modernes. Voici les 6 raisons concrètes qui justifient ce choix.",
            "items": [
                ("Builder visuel drag-and-drop", "Illimité",
                 "Construisez chaque page visuellement, sans coder. Widgets infinis, templates premium, blocs réutilisables. Vos équipes peuvent ajouter de nouvelles pages sans toucher au design global."),
                ("Theme Builder pour personnalisation totale", "100%",
                 "Personnalisez header, footer, pages d'archives, single posts, 404, page de connexion. Tout devient drag-and-drop, plus besoin de coder le theme PHP."),
                ("Popup Builder pour la conversion", "+30%",
                 "Popups exit-intent, scroll-trigger, time-based. Capture lead, promotions, upsell. Augmentation typique de 20-40% du taux de conversion sur les sites e-commerce."),
                ("Écosystème WordPress massif", "50 000+",
                 "WooCommerce pour e-commerce, RankMath pour SEO, WPForms pour formulaires avancés, Wordfence pour sécurité. Pour chaque besoin, un plugin éprouvé existe."),
                ("Performance optimisable", "90+",
                 "Avec un hébergement de qualité (Hostinger, OVH cloud, WP Engine) et nos optimisations (caching, lazy load, WebP), Elementor atteint des Lighthouse 90+."),
                ("Multilingue et multi-pays", "60+",
                 "Avec WPML ou Polylang : sites multilingues professionnels (FR/EN/AR/ES). Optimisation hreflang, contenu spécifique par langue, SEO multi-pays géré.")
            ]
        },
        "section_c": {
            "eyebrow": "Notre approche",
            "title": "Notre <em>méthode</em> Elementor structurée.",
            "paragraphs": [
                "Nous concevons votre site Elementor selon une méthodologie rigoureuse : <strong>design Figma validé d'abord</strong>, puis intégration Elementor en respectant pixel-perfect les maquettes. Pas de bricolage 'live design' qui produit des sites incohérents.",
                "Notre design system Elementor utilise des <strong>global widgets, théme styling, et CSS variables</strong> pour garantir cohérence visuelle, vitesse de développement, et maintenance simple post-livraison.",
                "Formation complète à vos équipes (2h de prise en main Elementor + documentation Notion), garantie 30 jours sur les bugs, suivi gratuit premier mois. Mises à jour WordPress + Elementor + plugins gérées sur notre forfait maintenance."
            ],
            "photo": "hands_keyboard"
        },
        "section_d": {
            "eyebrow": "FAQ",
            "title": "Questions <em>fréquentes</em> sur Elementor",
            "faqs": [
                ("Elementor Pro est-il payant ?",
                 "Elementor a une version gratuite limitée et une version Pro payante (59 USD/an pour 1 site). La version Pro est obligatoire pour Theme Builder, Popup Builder, WooCommerce Builder. Coût inclus dans nos forfaits."),
                ("Combien coûte un site Elementor avec vous ?",
                 "Site vitrine 5-10 pages : 3 000 à 6 000 EUR. Site corporate avec custom WooCommerce : 6 000 à 12 000 EUR. Sites complexes (multi-langue, intégrations) : sur devis. Tarifs 30-50% sous les agences parisiennes."),
                ("Elementor est-il SEO-friendly ?",
                 "Oui, surtout avec le plugin RankMath ou Yoast SEO en complément. Schema.org, sitemap, méta tags. Performance Lighthouse 80-95 selon hébergement. Nous optimisons tous nos sites pour le SEO technique."),
                ("Peut-on migrer un site existant vers Elementor ?",
                 "Oui. Nous migrons depuis WordPress classique, Wix, Squarespace, Joomla, Drupal. Audit initial gratuit pour estimer la complexité et chiffrer la migration. Conservation SEO garantie."),
                ("Faut-il un développeur pour maintenir un site Elementor ?",
                 "Non pour les modifications courantes (textes, images, ajout pages). Oui pour les évolutions structurelles, intégrations API, optimisations performances. Nous proposons des forfaits maintenance mensuels."),
                ("Elementor est-il sécurisé ?",
                 "WordPress + Elementor + plugins demandent une vigilance : mises à jour régulières, hébergement de qualité, sauvegardes auto, pare-feu (Wordfence, Sucuri). Inclus dans nos forfaits maintenance."),
                ("Combien de temps pour livrer un site Elementor ?",
                 "Site vitrine simple : 3 à 5 semaines. Site corporate avec CMS : 6 à 10 semaines. E-commerce WooCommerce : 8 à 14 semaines. Sprints hebdomadaires avec démos live."),
                ("Elementor ou Webflow, lequel choisir ?",
                 "Elementor si vous voulez l'écosystème WordPress complet, e-commerce avancé, blog très publié. Webflow pour sites premium avec design fort, vitesse maximale, simplicité. Nous vous conseillons selon votre cas.")
            ]
        },
        "related": [
            ("/agence-webflow", "web", "Agence Webflow", "Alternative no-code premium"),
            ("/creation-site-wordpress", "edit_document", "Création site WordPress", "Sites WordPress custom"),
            ("/agence-woocommerce", "shopping_cart", "Agence WooCommerce", "E-commerce WordPress"),
            ("/agence-site-vitrine", "window", "Agence site vitrine", "Sites professionnels"),
            ("/seo", "search_insights", "SEO & référencement", "Trafic organique"),
            ("/creation-site-web", "code", "Création de site web", "Tous types")
        ]
    },

    "agence-make": {
        "label": "Make",
        "category": "Automatisation",
        "section_a": {
            "eyebrow": "Définition",
            "title": "Qu'est-ce qu'une <em>agence Make</em> ?",
            "paragraphs": [
                "Une agence Make est une équipe spécialisée dans l'automatisation de workflows avec <strong>Make (anciennement Integromat)</strong>, la plateforme no-code la plus visuelle du marché. Make permet de connecter +1700 applications et d'orchestrer des processus complexes sans coder.",
                "Chez Pirabel Labs, nous automatisons les processus marketing, commerciaux et opérationnels de PME francophones depuis 2022. Notre expertise Make couvre <strong>les connecteurs avancés</strong> (HubSpot, Brevo, Stripe, WhatsApp Business, OpenAI, Notion).",
                "Notre approche est ROI-first : nous identifions les 3-5 workflows à fort impact business avant de coder. Résultat typique : <strong>15 à 30 heures économisées par semaine</strong> pour une PME de 10-30 personnes."
            ],
            "photo": "automation_chip"
        },
        "section_b": {
            "eyebrow": "Pourquoi Make",
            "title": "Pourquoi choisir <em>Make</em> pour automatiser ?",
            "lead": "Make s'est imposé comme l'alternative supérieure à Zapier pour les workflows complexes. Voici les 6 raisons techniques.",
            "items": [
                ("Builder visuel ultra-intuitif", "100%",
                 "Make visualise vos workflows comme des schémas. Vous voyez exactement ce qui se passe à chaque étape, comment les données circulent. Debug 10x plus rapide qu'avec Zapier."),
                ("Tarification à l'opération, pas au workflow", "70%",
                 "Make facture à l'opération (chaque action dans un workflow). Pour les workflows complexes multi-étapes, c'est 70% moins cher que Zapier qui facture à la 'task'."),
                ("Gestion d'erreurs avancée", "Auto",
                 "Retry automatique configurable, branches d'erreur (Error Handler), rollback transactionnel, alertes Slack/email en cas d'échec. Workflows robustes en production."),
                ("Routeurs et filtres natifs", "Illimité",
                 "Logique conditionnelle complexe sans coder : 'Si X et (Y ou Z), alors action A, sinon action B'. Make gère les structures de données nested, arrays, dates avec précision."),
                ("Intégrations IA natives", "OpenAI",
                 "Modules OpenAI, Claude, Gemini natifs : génération de texte, analyse sentiment, classification, traduction, extraction de données. IA dans vos workflows sans coder."),
                ("Webhooks et HTTP custom illimités", "0 limite",
                 "Pour les APIs non supportées nativement : modules HTTP custom, webhooks entrants/sortants, parsing JSON/XML/CSV. Pas de limite technique.")
            ]
        },
        "section_c": {
            "eyebrow": "Notre approche",
            "title": "Notre <em>méthode</em> Make orientée ROI.",
            "paragraphs": [
                "Avant de coder le moindre workflow, nous <strong>cartographions vos processus actuels</strong> : trafic, leads, suivi, relances, ventes, retention. Identification précise des fuites de temps et opportunités d'automatisation à fort ROI.",
                "Nos workflows Make sont conçus pour la <strong>fiabilité production</strong> : gestion d'erreurs systématique, monitoring continu, alertes proactives, documentation des branches conditionnelles, tests avant déploiement.",
                "Formation de votre équipe Make (2h hands-on + documentation Notion), support post-livraison, optimisations continues. Vous restez autonome ou nous gérons en mensuel selon votre préférence."
            ],
            "photo": "dashboard"
        },
        "section_d": {
            "eyebrow": "FAQ",
            "title": "Questions <em>fréquentes</em> sur Make",
            "faqs": [
                ("Make vs Zapier, lequel choisir ?",
                 "Make pour workflows complexes (5+ étapes), logique conditionnelle, équipes techniques. Zapier pour workflows simples, équipes non-tech, intégrations exotiques. Make est 50-70% moins cher pour des volumes équivalents."),
                ("Combien coûte Make ?",
                 "Plan gratuit : 1000 opérations/mois. Core : 9 USD/mois (10K ops). Pro : 16 USD/mois (10K ops + features). Teams : 29 USD/utilisateur/mois. Nos clients PME sont typiquement sur Pro ou Teams."),
                ("Mes données passent-elles par Make ?",
                 "Oui, transitoirement. Make traite les données entre vos apps. Hébergement EU (RGPD compliant). Pour données ultra-sensibles, nous recommandons n8n self-hosted comme alternative."),
                ("Quels types de workflows automatisez-vous ?",
                 "Lead qualification, suivi commercial, relances email, synchro CRM, post social automatique, reporting auto, paiements et facturation, onboarding client, support niveau 1 chatbot IA."),
                ("Make peut-il s'intégrer à WhatsApp Business ?",
                 "Oui, via 360dialog ou WhatsApp Cloud API. Workflows : notifications client, qualification lead WhatsApp, alertes admin, chatbot WhatsApp orchestré par Make + OpenAI."),
                ("Combien de temps pour automatiser un process ?",
                 "Workflow simple (3-5 étapes) : 2 à 5 jours. Workflow complexe (10+ étapes, branches, IA) : 1 à 3 semaines. Audit + roadmap 5 workflows : 1 à 2 semaines."),
                ("Et si Make ou un de mes outils tombe en panne ?",
                 "Make a une uptime 99.9%. Pour vos outils tiers, nous configurons des alertes monitoring (Better Uptime, Uptime Robot) + workflows de fallback. Pour les cas critiques : redondance n8n self-hosted."),
                ("Pouvez-vous migrer mes workflows Zapier vers Make ?",
                 "Oui. Audit gratuit de vos Zaps existants, estimation du gain de coût et de fiabilité, migration progressive workflow par workflow. ROI typique de la migration : 3-6 mois.")
            ]
        },
        "related": [
            ("/agence-n8n", "account_tree", "Agence n8n", "Alternative open source"),
            ("/automatisation-marketing", "smart_toy", "Automatisation marketing", "Service complet"),
            ("/agents-ia-chatbots", "smart_toy", "Agents IA & chatbots", "Bots intelligents"),
            ("/agence-ia", "psychology", "Agence IA", "Solutions IA complètes"),
            ("/agence-hubspot", "hub", "Agence HubSpot", "CRM et marketing"),
            ("/agence-brevo", "mail", "Agence Brevo", "Email marketing")
        ]
    },

    "agence-ia": {
        "label": "IA",
        "category": "Intelligence artificielle",
        "section_a": {
            "eyebrow": "Définition",
            "title": "Qu'est-ce qu'une <em>agence IA</em> ?",
            "paragraphs": [
                "Une agence IA est une équipe spécialisée dans l'intégration concrète de <strong>l'intelligence artificielle</strong> au sein des processus métier d'entreprises. Loin du marketing creux, nous déployons des solutions IA mesurables : chatbots, agents autonomes, génération de contenu, vision par ordinateur.",
                "Chez Pirabel Labs, nous accompagnons les PME et startups francophones depuis 2023 sur des projets IA <strong>en production, pas des POC qui dorment</strong>. Notre expertise : ChatGPT, Claude, Gemini, Llama, LangChain, RAG, fine-tuning.",
                "Notre conviction : l'IA est devenue en 2026 un <strong>standard concurrentiel</strong>. Vos concurrents qui ont commencé en 2024 ont 2 ans d'avance en productivité. Il est urgent de rattraper et dépasser."
            ],
            "photo": "ai_visual"
        },
        "section_b": {
            "eyebrow": "Pourquoi maintenant",
            "title": "Pourquoi intégrer <em>l'IA</em> dans votre PME ?",
            "lead": "L'IA bien intégrée n'est pas un gadget : c'est un levier de productivité et de croissance mesurable. Voici les 6 raisons business.",
            "items": [
                ("Gain de temps massif", "15h/sem",
                 "Une PME de 10-30 personnes économise typiquement 15 heures par semaine grâce à l'IA bien intégrée : génération de contenu, qualification leads, support niveau 1, reporting automatique."),
                ("Conversion x2 à x5", "x3",
                 "Un chatbot WhatsApp bien conçu qui répond 24/7 multiplie le taux de conversion par 2 à 5. Pas de prospects perdus la nuit ou le weekend, qualification immédiate."),
                ("Coût par lead divisé", "-60%",
                 "L'IA automatise les phases répétitives du commercial : qualification, relance, nurturing. Coût d'acquisition client baisse de 40 à 60% sur les flux automatisés."),
                ("ROI rapide et mesurable", "3 mois",
                 "Contrairement aux campagnes marketing dont le ROI prend 6-12 mois, l'IA produit des résultats des le mois 1. ROI typique sur projet 5K-10K EUR : 3 à 6 mois."),
                ("Avantage concurrentiel durable", "Moat",
                 "Une IA bien intégrée dans vos processus métier devient un 'moat' (douve concurrentielle) que vos concurrents ne peuvent pas copier en quelques mois."),
                ("Réduction des erreurs humaines", "-80%",
                 "Sur les tâches répétitives (saisie données, classification, conformité), l'IA réduit les erreurs de 50 à 90%. Qualité opérationnelle améliorée, moins de SAV.")
            ]
        },
        "section_c": {
            "eyebrow": "Notre méthode",
            "title": "Une <em>méthode</em> rigoureuse, focus ROI.",
            "paragraphs": [
                "Notre approche IA est <strong>data-driven, jamais hype-driven</strong>. Nous démarrons par un audit de vos processus pour identifier les 3-5 cas d'usage IA à fort ROI, pas pour faire de l'IA partout sans raison.",
                "Pour chaque projet, un <strong>prototype fonctionnel en 72 heures</strong> pour valider l'approche sur du réel. Puis industrialisation en 4 à 8 semaines avec monitoring continu, A/B testing, optimisations modèles.",
                "Formation hands-on de vos équipes sur ChatGPT, Claude, prompt engineering, Make AI. Documentation complète. Votre équipe devient autonome rapidement, vous gardez la maîtrise de votre stack IA."
            ],
            "photo": "person_laptop"
        },
        "section_d": {
            "eyebrow": "FAQ",
            "title": "Questions <em>fréquentes</em> sur l'IA",
            "faqs": [
                ("L'IA est-elle vraiment accessible pour une PME ?",
                 "Oui, plus que jamais en 2026. Des projets IA puissants sont livrés pour 2 000 à 10 000 EUR. Plus besoin d'être un grand groupe ou d'avoir une équipe data interne. Bon partenaire + cas d'usage clair = ROI rapide."),
                ("Mes données sont-elles vraiment sécurisées ?",
                 "Oui. APIs entreprise OpenAI, Anthropic, Google : zéro retention de données, hébergement EU disponible, conformité SOC 2. Pour les contextes ultra-sensibles : déploiement open source on-premise (Llama, Mistral)."),
                ("Quel ROI puis-je attendre concrètement ?",
                 "Chatbot WhatsApp : 50-80% des questions traitées sans humain, 15h/sem économisées. Agent IA qualification : conversion x2-x3. Génération contenu : 5-10x plus rapide. ROI typique 3-6 mois."),
                ("Combien de temps pour un projet IA ?",
                 "Prototype fonctionnel : 72h pour valider. Chatbot simple : 3-4 semaines. Agent IA personnalisé : 4-6 semaines. Solution complète multi-cas : 2-4 mois avec déploiement progressif."),
                ("Faites-vous de la formation IA pour mon équipe ?",
                 "Oui. Formations ChatGPT, Claude, prompt engineering, Make AI, n8n AI, intégration IA dans CRM. Sessions live 2-4h + documentation Notion + vidéos tuto. Votre équipe autonome après 1 semaine."),
                ("Utilisez-vous ChatGPT ou Claude ?",
                 "Les deux selon le cas d'usage. ChatGPT-4 pour la versatilité, Claude pour les longs contextes et le raisonnement, Llama pour le on-premise. Nous benchmarkons pour chaque projet."),
                ("Et si l'IA donne une mauvaise réponse ?",
                 "Toujours humain dans la boucle pour cas sensibles. Workflows d'escalade clairs : confidence score faible → humain. Monitoring continu de la qualité (Langfuse, Helicone). Iterations sur les prompts."),
                ("L'IA va-t-elle remplacer mon équipe ?",
                 "Non, mais elle va transformer leur travail. L'IA prend en charge le répétitif (qualification, saisie, génération brute). Votre équipe se concentre sur la valeur ajoutée : conseil, négociation, créativité, stratégie.")
            ]
        },
        "related": [
            ("/solutions-ia", "psychology", "Solutions IA sur mesure", "RAG, fine-tuning"),
            ("/agents-ia-chatbots", "smart_toy", "Agents IA & chatbots", "Bots WhatsApp & web"),
            ("/automatisation-marketing", "linked_services", "Automatisation marketing", "Make, n8n"),
            ("/agence-make", "linked_services", "Agence Make", "Workflows IA"),
            ("/agence-n8n", "account_tree", "Agence n8n", "n8n + IA"),
            ("/creation-saas", "rocket_launch", "Création SaaS", "SaaS IA")
        ]
    },

    "seo": {
        "label": "SEO",
        "category": "Référencement",
        "section_a": {
            "eyebrow": "Définition",
            "title": "Qu'est-ce qu'une <em>agence SEO</em> ?",
            "paragraphs": [
                "Une agence SEO est une équipe spécialisée dans l'optimisation pour les moteurs de recherche (<strong>Search Engine Optimization</strong>). Son rôle : faire ranker votre site dans les premiers résultats Google sur les requêtes business stratégiques de votre marché.",
                "Chez Pirabel Labs, nos consultants SEO maîtrisent les 3 piliers : <strong>SEO technique</strong> (Core Web Vitals, indexation, schema.org), <strong>SEO contenu</strong> (recherche mots-clés, articles 1500+ mots, pages piliers), <strong>SEO off-site</strong> (netlinking white-hat DR 40+).",
                "Notre conviction : le SEO sérieux n'est pas un coup de baguette magique. C'est une méthodologie rigoureuse qui produit des résultats <strong>mesurables à 6-12 mois</strong>. Pas de promesses de positions garanties (Google n'aime pas ça), mais des engagements sur la méthode."
            ],
            "photo": "seo_chart"
        },
        "section_b": {
            "eyebrow": "Pourquoi le SEO",
            "title": "Pourquoi investir dans le <em>SEO</em> en 2026 ?",
            "lead": "Le SEO reste le levier d'acquisition le plus rentable sur le long terme. Voici les 6 raisons business indiscutables.",
            "items": [
                ("ROI long terme imbattable", "10x",
                 "Le SEO continue de générer du trafic 6, 12, 24 mois après l'investissement initial. ROI typique sur 3 ans : 10x supérieur aux Ads. Capital qui compose, contrairement au PPC qui s'arrête dès qu'on coupe le budget."),
                ("75% des clics organiques", "Top 3",
                 "Le top 3 organique capte 75% des clics. Les positions 4-10 partagent les 25% restants. Être en page 2 = invisibilité. Notre méthode vise systématiquement le top 3 sur les requêtes business."),
                ("Coûts par lead décroissants", "-60%",
                 "Un lead SEO coûte en moyenne 60% moins cher qu'un lead Google Ads, et sa qualité est généralement supérieure (intention de recherche plus forte). Sur 12 mois, l'écart se creuse."),
                ("Confiance utilisateur supérieure", "x3",
                 "Les utilisateurs cliquent 3x plus sur les résultats organiques que sur les Ads (qu'ils identifient comme publicités). Confiance et conversion supérieures."),
                ("Voice search et IA search prêts", "+40%",
                 "ChatGPT Search, Perplexity, Gemini : les nouveaux moteurs IA citent les sites bien optimisés SEO. Investir maintenant prépare votre marque pour la révolution search IA."),
                ("Avantage concurrentiel durable", "Moat",
                 "Un domaine avec autorité (DR 40+) et contenu profond devient un 'moat' SEO que vos concurrents mettront 2-3 ans à rattraper. Investissement défensif puissant.")
            ]
        },
        "section_c": {
            "eyebrow": "Notre méthode",
            "title": "Notre <em>méthode SEO</em> en 4 piliers.",
            "paragraphs": [
                "<strong>Audit complet 60+ points</strong> : crawl Screaming Frog, indexation Google Search Console, Core Web Vitals CrUX, schema.org, contenu dupliqué, redirections, sitemaps, robots.txt. Rapport actionnable livré sous 7 jours.",
                "<strong>Recherche mots-clés stratégique</strong> : 50+ mots-clés cibles par projet avec intention, volume, difficulté, opportunité. Mapping aux pages existantes ou à créer. Priorisation par ROI.",
                "<strong>Production contenu premium + netlinking white-hat</strong> : articles 1500+ mots optimisés E-E-A-T, pages piliers thématiques, schema FAQ/HowTo. Backlinks DR 40+ uniquement, thématiques pertinentes. Reporting mensuel chiffré."
            ],
            "photo": "person_desk"
        },
        "section_d": {
            "eyebrow": "FAQ",
            "title": "Questions <em>fréquentes</em> sur le SEO",
            "faqs": [
                ("Combien de temps avant de voir des résultats SEO ?",
                 "Premiers signaux à 8-12 semaines (Google indexe et commence à positionner). Résultats solides à 6 mois. Résultats consolidés à 12 mois. Pour les marchés ultra-compétitifs, prévoyez 18-24 mois pour dominer."),
                ("Combien coûte le SEO ?",
                 "Forfaits mensuels : 1 500 à 12 000 EUR/mois selon ambition et taille du site. Setup initial (audit + stratégie) : 2 500 à 8 000 EUR one-shot. Engagement minimum 6 mois pour produire des résultats."),
                ("Garantissez-vous des positions Google ?",
                 "Non. Aucune agence sérieuse ne le fait : c'est l'algorithme Google qui décide, basé sur 200+ facteurs dont la concurrence. Nous garantissons par contre méthodologie rigoureuse, reporting transparent, amélioration mesurable."),
                ("Pourquoi le SEO est-il un engagement minimum 6 mois ?",
                 "Le SEO nécessite du temps : produire du contenu (4-8 articles/mois), obtenir des backlinks (3-10/mois), que Google les indexe et les prenne en compte. Moins de 6 mois = budget gaspillé."),
                ("Travaillez-vous le SEO international (multi-langue) ?",
                 "Oui. SEO FR (Google.fr, Google.be, Google.ch, Google.ca), EN (Google.com, Google.co.uk), AR (Google.ma, Google.tn). Implémentation hreflang propre, contenu localisé natif, recherche mots-clés par marché."),
                ("Faites-vous du SEO local (Google Maps) ?",
                 "Oui. Optimisation Google Business Profile, citations locales, avis clients, schéma LocalBusiness. Pack local top 3 atteignable en 3-6 mois sur la plupart des marchés."),
                ("Et si Google change son algorithme ?",
                 "Notre méthode SEO suit les fondamentaux qui ne changent pas : contenu utile, expertise, autorité, performance technique. Nous surveillons les updates (Helpful Content, Core Updates) et ajustons en continu."),
                ("Quelle différence entre SEO et SEA ?",
                 "SEO = référencement naturel (organique), gratuit en clic mais investissement contenu/netlinking. SEA = Search Engine Advertising (Google Ads), payant au clic. Stratégie idéale : combiner les deux pour cover full funnel.")
            ]
        },
        "related": [
            ("/agence-netlinking", "link", "Agence netlinking", "Backlinks DR 40+"),
            ("/audit-seo", "analytics", "Audit SEO gratuit", "Diagnostic 60 points"),
            ("/fiche-google-business", "location_on", "Google Business Profile", "SEO local pack 3"),
            ("/creation-site-web", "code", "Création de site web", "Sites SEO-ready"),
            ("/blog", "article", "Blog Pirabel Labs", "12 articles SEO"),
            ("/agence-ia", "psychology", "Agence IA", "IA pour contenu SEO")
        ]
    },

    "creation-site-web": {
        "label": "Site web",
        "category": "Web",
        "section_a": {
            "eyebrow": "Définition",
            "title": "Qu'est-ce qu'une <em>agence de création de site web</em> ?",
            "paragraphs": [
                "Une agence de création de site web conçoit et développe des sites web sur mesure : <strong>sites vitrines, sites corporate, e-commerce, plateformes SaaS, landing pages</strong>. Notre rôle : transformer votre brief business en un site qui convertit, performe et scale.",
                "Chez Pirabel Labs, nous maîtrisons 3 stacks complémentaires selon vos besoins : <strong>WordPress + Elementor</strong> (autonomie, écosystème, e-commerce), <strong>Webflow</strong> (design premium, no-code, vitesse), <strong>Next.js + Supabase</strong> (SaaS, sur-mesure, scale).",
                "Notre conviction : un bon site web n'est pas une plaquette en ligne. C'est votre <strong>meilleur commercial 24/7</strong>. Il doit charger en < 2.5s, ranker SEO dès la mise en ligne, convertir mieux que vos concurrents, et donner autonomie à vos équipes."
            ],
            "photo": "code_screen"
        },
        "section_b": {
            "eyebrow": "Pourquoi nous",
            "title": "Pourquoi nous confier votre <em>site web</em> ?",
            "lead": "6 raisons techniques et business qui font la différence entre un site qui dort et un site qui rapporte.",
            "items": [
                ("Performance Core Web Vitals 95+", "< 2.5s",
                 "Lighthouse 95+ garanti contractuellement. FCP < 1.5s, LCP < 2.5s, CLS < 0.1. Vos visiteurs voient votre site charger en une seconde, Google vous récompense au ranking."),
                ("SEO intégré dès la conception", "100%",
                 "Pas de SEO bricolé après. Architecture sémantique, schema.org natif, sitemap auto, méta tags optimisés, OG tags. Site prêt à ranker dès le J+1 post-livraison."),
                ("Tarifs 30-50% sous les agences parisiennes", "-40%",
                 "Notre implantation au Bénin nous permet d'offrir des tarifs accessibles sans compromis qualité. Site vitrine premium : 2 000-5 000 EUR vs 5 000-15 000 EUR en agence parisienne."),
                ("Stack moderne et future-proof", "+10 ans",
                 "Nous choisissons des stacks éprouvées : WordPress (43% des sites web mondiaux), Webflow (croissance 50%/an), Next.js (utilisé par Stripe, Notion, TikTok). Pas de tech bleeding-edge risquée."),
                ("Autonomie post-livraison garantie", "100%",
                 "Vos équipes éditent contenu, ajoutent articles, créent nouvelles pages sans dépendre de nous. Formation incluse, documentation Notion, vidéos tuto. Code 100% à vous."),
                ("Suivi 30 jours + garantie bugs", "0 surprise",
                 "30 jours post-livraison : corrections de bugs gratuites, ajustements UX inclus, conseils SEO. Au-delà : forfaits maintenance mensuels à 200-800 EUR/mois selon scope.")
            ]
        },
        "section_c": {
            "eyebrow": "Notre méthode",
            "title": "Notre <em>méthode</em> en 5 sprints.",
            "paragraphs": [
                "<strong>Sprint 1 (Découverte)</strong> : appel gratuit 30 min pour comprendre votre business, vos objectifs, votre cible. Audit de l'existant (site actuel, concurrents, SEO). Brief créatif structuré.",
                "<strong>Sprints 2-3 (Design & Dev)</strong> : maquettes Figma validées en 2 cycles de revision. Développement WordPress/Webflow/Next.js en sprints hebdomadaires avec démos live, vous voyez le projet avancer en temps réel.",
                "<strong>Sprints 4-5 (Tests, lancement, formation)</strong> : tests cross-device, optimisations Core Web Vitals, mise en ligne progressive, formation équipe 1h, garantie 30 jours, intervention rapide sous 4h ouvrées."
            ],
            "photo": "team_meeting"
        },
        "section_d": {
            "eyebrow": "FAQ",
            "title": "Questions <em>fréquentes</em> création site web",
            "faqs": [
                ("Combien coûte un site web avec vous ?",
                 "Site vitrine 5-10 pages : 2 000 à 5 000 EUR. E-commerce 50-200 produits : 4 000 à 12 000 EUR. Application web custom : sur devis (à partir de 8 000 EUR). Devis ferme sous 48h après appel découverte gratuit."),
                ("Combien de temps pour livrer un site ?",
                 "Site vitrine : 3 à 5 semaines. E-commerce : 6 à 10 semaines. Application web : 8 à 16 semaines. Nous travaillons en sprints hebdomadaires avec démos live, vous voyez le projet avancer."),
                ("Quel CMS choisir : WordPress, Webflow, Next.js ?",
                 "WordPress pour autonomie max + écosystème (e-commerce, blog très publié). Webflow pour design premium + vitesse. Next.js pour SaaS, sur-mesure, scale. Nous conseillons selon votre cas en 30 min."),
                ("Le code et les designs m'appartiennent ?",
                 "Oui, 100%. Code source remis, repository GitHub à votre nom, fichiers Figma partagés, documentation complète. Aucun verrou technique, vous pouvez reprendre avec n'importe quelle équipe."),
                ("Hébergez-vous le site après livraison ?",
                 "Au choix. Vercel/Cloudflare pour Next.js (auto-scaling 30-200 EUR/mois). OVH/Hostinger pour WordPress (8-30 EUR/mois). Webflow Cloud inclus dans plan Webflow (23-49 USD/mois)."),
                ("Faites-vous le SEO en plus ?",
                 "SEO on-page intégré nativement (titres, méta, schema). Pour SEO continu (articles, netlinking, optimisations), forfait mensuel séparé (1 500-12 000 EUR/mois). Voir page <a href='/seo'>SEO</a>."),
                ("Et si je veux des modifications après livraison ?",
                 "30 jours post-livraison : corrections bugs gratuites. Après : forfait maintenance mensuel (200-800 EUR) ou facturation à la demande (60-100 EUR/h). Pas de mauvaise surprise."),
                ("Acceptez-vous le paiement échelonné ?",
                 "Oui. 30% acompte au lancement, 40% à la validation des maquettes, 30% à la livraison. Pour les projets > 5K EUR : possible 25/25/25/25 sur 4 jalons. Virement SEPA, Mobile Money, Stripe.")
            ]
        },
        "related": [
            ("/agence-webflow", "web", "Agence Webflow", "Premium no-code"),
            ("/agence-elementor", "dashboard_customize", "Agence Elementor", "WordPress builder"),
            ("/agence-ecommerce", "shopping_cart", "Agence e-commerce", "Boutique en ligne"),
            ("/seo", "search_insights", "SEO & référencement", "Trafic organique"),
            ("/tunnels-de-vente", "conversion_path", "Tunnels de vente", "CRO premium"),
            ("/creation-saas", "rocket_launch", "Création SaaS", "MVP 8-12 semaines")
        ]
    }
}


# ============================ RENDER FUNCTIONS ============================

def render_section_a(data):
    """Section A : Editorial 2-col, photo a droite."""
    paragraphs = "\n        ".join(f"<p>{p}</p>" for p in data["paragraphs"])
    return f'''
<!-- === NOIISE-STYLE SECTION A: Editorial 2-col === -->
<section class="ns-section ns-section--a">
  <div class="ns-container">
    <div class="ns-split">
      <div class="ns-split__text">
        <span class="ns-eyebrow">{data["eyebrow"]}</span>
        <h2 class="ns-h2">{data["title"]}</h2>
        {paragraphs}
      </div>
      <div class="ns-split__media">
        <img src="{photo(data["photo"])}" alt="{data["title"]}" loading="lazy" />
      </div>
    </div>
  </div>
</section>'''


def render_section_b(data):
    """Section B : 2-col accordion grid avec stat."""
    items = []
    for i, (title, stat, desc) in enumerate(data["items"]):
        open_attr = " open" if i == 0 else ""
        items.append(f'''      <details class="ns-acc"{open_attr}>
        <summary class="ns-acc__sum">
          <span class="ns-acc__title">{title}</span>
          <span class="material-symbols-outlined ns-acc__chev">expand_more</span>
        </summary>
        <div class="ns-acc__body">
          <div class="ns-acc__stat">{stat}</div>
          <p class="ns-acc__desc">{desc}</p>
        </div>
      </details>''')
    items_html = "\n".join(items)
    return f'''
<!-- === NOIISE-STYLE SECTION B: Accordion grid === -->
<section class="ns-section ns-section--b">
  <div class="ns-container">
    <div class="ns-head">
      <span class="ns-eyebrow">{data["eyebrow"]}</span>
      <h2 class="ns-h2 ns-h2--center">{data["title"]}</h2>
      <p class="ns-lead ns-lead--center">{data["lead"]}</p>
    </div>
    <div class="ns-acc-grid">
{items_html}
    </div>
  </div>
</section>'''


def render_section_c(data):
    """Section C : Editorial 2-col reversed, photo a gauche."""
    paragraphs = "\n        ".join(f"<p>{p}</p>" for p in data["paragraphs"])
    return f'''
<!-- === NOIISE-STYLE SECTION C: Editorial 2-col reversed === -->
<section class="ns-section ns-section--c">
  <div class="ns-container">
    <div class="ns-split ns-split--rev">
      <div class="ns-split__media">
        <img src="{photo(data["photo"])}" alt="{data["title"]}" loading="lazy" />
      </div>
      <div class="ns-split__text">
        <span class="ns-eyebrow">{data["eyebrow"]}</span>
        <h2 class="ns-h2">{data["title"]}</h2>
        {paragraphs}
      </div>
    </div>
  </div>
</section>'''


def render_section_d(data):
    """Section D : 2-col FAQ accordion."""
    faqs = []
    for q, a in data["faqs"]:
        faqs.append(f'''      <details class="ns-faq">
        <summary class="ns-faq__sum">
          <span class="ns-faq__q">{q}</span>
          <span class="material-symbols-outlined ns-faq__chev">expand_more</span>
        </summary>
        <div class="ns-faq__a">{a}</div>
      </details>''')
    faqs_html = "\n".join(faqs)
    return f'''
<!-- === NOIISE-STYLE SECTION D: FAQ 2-col === -->
<section class="ns-section ns-section--d">
  <div class="ns-container">
    <div class="ns-head">
      <span class="ns-eyebrow">{data["eyebrow"]}</span>
      <h2 class="ns-h2 ns-h2--center">{data["title"]}</h2>
    </div>
    <div class="ns-faq-grid">
{faqs_html}
    </div>
  </div>
</section>'''


def render_section_e(related):
    """Section E : Related services cards."""
    cards = []
    for url, icon, title, desc in related:
        cards.append(f'''      <a href="{url}" class="ns-rel-card">
        <div class="ns-rel-card__icon"><span class="material-symbols-outlined">{icon}</span></div>
        <div class="ns-rel-card__title">{title}</div>
        <div class="ns-rel-card__desc">{desc}</div>
        <div class="ns-rel-card__cta">Voir <span class="material-symbols-outlined">arrow_forward</span></div>
      </a>''')
    cards_html = "\n".join(cards)
    return f'''
<!-- === NOIISE-STYLE SECTION E: Related services === -->
<section class="ns-section ns-section--e">
  <div class="ns-container">
    <div class="ns-head">
      <span class="ns-eyebrow">Aussi à voir</span>
      <h2 class="ns-h2">Services <em>complémentaires</em></h2>
    </div>
    <div class="ns-rel-grid">
{cards_html}
    </div>
  </div>
</section>'''


CSS_BLOCK = '''
<style>
/* ============= NOIISE-STYLE SECTIONS ============= */
.ns-section { padding: clamp(3.5rem, 7vw, 6rem) var(--px-page); }
.ns-section--a { background: var(--bg); }
.ns-section--b { background: var(--bg-2); border-top: 1px solid var(--border); }
.ns-section--c { background: var(--bg); border-top: 1px solid var(--border); }
.ns-section--d { background: var(--bg-2); border-top: 1px solid var(--border); }
.ns-section--e { background: var(--bg); border-top: 1px solid var(--border); }
.ns-container { max-width: 78rem; margin: 0 auto; }

.ns-eyebrow { display: inline-block; font-family: var(--font-display); font-weight: 700; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.18em; color: var(--accent); margin-bottom: 1rem; }
.ns-h2 { font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: clamp(1.85rem, 3.6vw, 2.75rem); line-height: 1.1; letter-spacing: -0.025em; color: var(--text); text-align: left; margin: 0 0 1.5rem; }
.ns-h2 em { color: var(--accent); font-style: normal; }
.ns-h2--center { text-align: center; max-width: 44rem; margin-left: auto; margin-right: auto; }
.ns-lead { font-size: 1.05rem; color: var(--text-muted); line-height: 1.65; max-width: 50rem; }
.ns-lead--center { text-align: center; margin-left: auto; margin-right: auto; }
.ns-head { margin-bottom: 3.5rem; }

/* Split 2-col editorial */
.ns-split { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
.ns-split__text p { font-size: 1.02rem; color: var(--text-muted); line-height: 1.75; margin: 0 0 1.1rem; }
.ns-split__text p:last-child { margin-bottom: 0; }
.ns-split__text p strong { color: var(--text); font-weight: 600; }
.ns-split__media { aspect-ratio: 4/3; border-radius: 22px; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 20px 60px rgba(0,0,0,0.18); }
.ns-split__media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s ease; }
.ns-split:hover .ns-split__media img { transform: scale(1.04); }

/* Accordion grid */
.ns-acc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.ns-acc { background: var(--bg); border: 1px solid var(--border); border-radius: 14px; transition: all 0.2s; }
.ns-acc[open] { border-color: var(--accent); }
.ns-acc__sum { list-style: none; cursor: pointer; padding: 1.4rem 1.6rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.ns-acc__sum::-webkit-details-marker { display: none; }
.ns-acc__title { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 1rem; color: var(--text); line-height: 1.3; }
.ns-acc__chev { color: var(--accent); transition: transform 0.2s; flex-shrink: 0; }
.ns-acc[open] .ns-acc__chev { transform: rotate(180deg); }
.ns-acc__body { padding: 0 1.6rem 1.6rem; }
.ns-acc__stat { font-family: 'Montserrat', sans-serif; font-weight: 900; font-size: 2.2rem; color: var(--accent); line-height: 1; margin-bottom: 0.75rem; letter-spacing: -0.02em; }
.ns-acc__desc { font-size: 0.92rem; color: var(--text-muted); line-height: 1.65; margin: 0; }

/* FAQ grid */
.ns-faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1.25rem; }
.ns-faq { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; }
.ns-faq[open] { border-color: var(--accent); }
.ns-faq__sum { list-style: none; cursor: pointer; padding: 1.2rem 1.4rem; display: flex; justify-content: space-between; align-items: center; gap: 0.8rem; }
.ns-faq__sum::-webkit-details-marker { display: none; }
.ns-faq__q { font-family: var(--font-display); font-weight: 700; font-size: 0.95rem; color: var(--text); line-height: 1.35; }
.ns-faq__chev { color: var(--accent); transition: transform 0.2s; flex-shrink: 0; }
.ns-faq[open] .ns-faq__chev { transform: rotate(180deg); }
.ns-faq__a { padding: 0 1.4rem 1.4rem; font-size: 0.9rem; color: var(--text-muted); line-height: 1.7; }
.ns-faq__a a { color: var(--accent); }

/* Related grid */
.ns-rel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); gap: 1rem; }
.ns-rel-card { background: var(--bg-2); border: 1px solid var(--border); border-radius: 14px; padding: 1.5rem; text-decoration: none; color: var(--text); display: flex; flex-direction: column; gap: 0.5rem; transition: all 0.2s; }
.ns-rel-card:hover { border-color: var(--accent); transform: translateY(-3px); }
.ns-rel-card__icon { width: 2.5rem; height: 2.5rem; background: var(--accent-soft); color: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; margin-bottom: 0.4rem; }
.ns-rel-card__title { font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 1rem; color: var(--text); }
.ns-rel-card__desc { font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; flex: 1; }
.ns-rel-card__cta { font-family: var(--font-display); font-weight: 700; font-size: 0.8rem; color: var(--accent); display: inline-flex; align-items: center; gap: 0.25rem; margin-top: 0.5rem; }
.ns-rel-card__cta .material-symbols-outlined { font-size: 1rem; }

/* Mobile responsive */
@media (max-width: 880px) {
  .ns-split { grid-template-columns: 1fr; gap: 2rem; }
  .ns-split--rev .ns-split__media { order: -1; }
  .ns-acc-grid, .ns-faq-grid { grid-template-columns: 1fr; }
  .ns-h2 { font-size: 1.7rem; }
}
</style>'''


def build_full_block(slug, data):
    """Build the full Noiise-style block for one page."""
    return (CSS_BLOCK +
            "\n<!-- ============= NOIISE-STYLE BLOCK (auto-injected) ============= -->" +
            render_section_a(data["section_a"]) +
            render_section_b(data["section_b"]) +
            render_section_c(data["section_c"]) +
            render_section_d(data["section_d"]) +
            render_section_e(data["related"]) +
            "\n<!-- ============= END NOIISE-STYLE BLOCK ============= -->\n")


def inject_or_replace(slug, data):
    fpath = os.path.join(ROOT, f"{slug}.html")
    if not os.path.exists(fpath):
        print(f"SKIP : {slug}.html (not found)")
        return False

    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    new_block = build_full_block(slug, data)

    # Remove old auto-injected blocks (multiple possible markers)
    # 1. Old "2-COL IMAGE+TEXT SECTIONS (auto-added)" block
    pattern1 = re.compile(
        r"\n<!-- =+ 2-COL IMAGE\+TEXT SECTIONS \(auto-added\) =+ -->.*?(?=<footer|</main>)",
        re.DOTALL
    )
    content = pattern1.sub("", content)

    # 2. Old NOIISE-STYLE block (in case we re-run)
    pattern2 = re.compile(
        r"\n<style>\n/\* =+ NOIISE-STYLE SECTIONS =+ \*/.*?<!-- =+ END NOIISE-STYLE BLOCK =+ -->\n",
        re.DOTALL
    )
    content = pattern2.sub("", content)

    # Insert before </main>
    if "</main>" not in content:
        print(f"FAIL : {slug}.html (no </main>)")
        return False
    new_content = content.replace("</main>", new_block + "\n</main>", 1)

    with open(fpath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"OK : {slug}.html")
    return True


count = 0
for slug, data in PAGES.items():
    if inject_or_replace(slug, data):
        count += 1
print(f"\nTotal: {count} pages refondues style NOIISE")
