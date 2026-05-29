#!/usr/bin/env python3
"""Generateur d'intitules de lecons SEO-friendly par formation.

Remplace les titres "Lecon 1.1 : aspect 1 de 'X'" genres par defaut, qui sont
mauvais pour le SEO (duplication) et pour l'UX (peu descriptifs).
"""

# === Patterns d'intitules par categorie x position dans le module ===
# Chaque pattern utilise {topic} = titre du module, {n} = numero de la lecon dans le module

LESSON_PATTERNS = {
    'seo': {
        1: [
            "Qu'est-ce que le SEO en 2026 : fondamentaux a connaitre",
            "Comment Google fonctionne : crawl, index, ranking",
            "Les 3 piliers du SEO : technique, contenu, autorite",
            "Choisir son strategie SEO selon son business",
            "Concepts cles : SERP, SGE, position 0, EEAT",
        ],
        2: [
            "Outils SEO essentiels : Ahrefs, Semrush, Search Console",
            "Recherche de mots-cles : intention et volume",
            "Audit technique : crawler son site avec Screaming Frog",
            "Optimisation on-page : title, meta, Hn, structure",
            "Maillage interne : architecture et silos thematiques",
        ],
        3: [
            "Strategie de contenu : cluster topic et content gap",
            "Rediger pour ranker : structure et longueur ideale",
            "Featured Snippets et position 0 : comment les decrocher",
            "Optimisation pour la SGE (Search Generative Experience)",
            "Content refresh : remettre a jour pour regagner des positions",
        ],
        4: [
            "Netlinking 2026 : strategies White Hat qui marchent",
            "Guest posting : comment obtenir des backlinks de qualite",
            "Digital PR et linkable assets : la methode Skyscraper",
            "Outreach par email : templates et taux de reponse",
            "Eviter les penalites Google : Black Hat a fuir",
        ],
        5: [
            "Mesurer le SEO : KPIs Search Console et GA4",
            "Diagnostic des chutes de positions",
            "Reporting SEO mensuel : modele type pour client",
            "Suivi de positions : outils et frequence",
            "SEO international : hreflang et multi-pays",
        ],
        6: [
            "SEO JavaScript : crawl et rendering",
            "SEO e-commerce : produits, categories, pagination",
            "SEO local : Google Business Profile et citations",
            "SEO mobile et Core Web Vitals",
            "SEO + IA : utiliser ChatGPT/Claude sans penalite",
        ],
        7: [
            "Approfondissement : Core Updates et leur impact",
            "Strategie de migration SEO sans perdre du trafic",
            "Schema.org avance : Article, Product, FAQ, HowTo",
            "Cas d'etude : passage de page 5 a page 1 en 6 mois",
            "Veille SEO en 2026 : sources et methodologie",
        ],
    },
    'web': {
        1: [
            "Choisir entre WordPress, Webflow, Shopify ou code custom",
            "Acheter un nom de domaine et configurer l'hebergement",
            "Installer WordPress en moins de 15 minutes",
            "Configurer les plugins essentiels (SEO, cache, securite)",
            "Premiere prise en main de l'admin WordPress",
        ],
        2: [
            "Choisir un theme : criteres et erreurs a eviter",
            "Personnaliser l'identite visuelle (logo, couleurs, polices)",
            "Construire le menu et la navigation",
            "Creer le footer et les widgets",
            "Design responsive : tester sur mobile et tablette",
        ],
        3: [
            "Top 10 des plugins WordPress incontournables",
            "Installer Elementor et construire sa premiere page",
            "Optimiser les images : WebP, lazy load, compression",
            "Securiser WordPress contre les attaques courantes",
            "Sauvegardes automatiques et plan de continuite",
        ],
        4: [
            "Performance : optimiser le LCP, FID, CLS",
            "Audit Lighthouse Mobile : objectif 90+",
            "Hardening securite : 2FA, captcha, audit logs",
            "Configurer un CDN (Cloudflare) gratuit",
            "Migration sans casse : du local au serveur prod",
        ],
        5: [
            "Mise en ligne et configuration DNS",
            "Setup Google Analytics 4 et Search Console",
            "Indexation rapide : sitemap et ping Google",
            "Maintenance : routines hebdo, mensuelles, annuelles",
            "Refonte sans perdre du trafic SEO : checklist",
        ],
        6: [
            "Custom Post Types et Advanced Custom Fields",
            "Child themes : personnaliser sans casser l'update",
            "Hooks WordPress : actions et filtres essentiels",
            "WP-CLI : automatiser les taches d'admin",
            "Multisite WordPress : quand et comment l'utiliser",
        ],
        7: [
            "Headless WordPress avec Next.js : architecture",
            "API REST et GraphQL pour decoupler le front",
            "PWA WordPress : transformer un site en app mobile",
            "Tests automatises avec Playwright",
            "CI/CD WordPress : deploiement continu",
        ],
    },
    'marketing': {
        1: [
            "Strategie marketing 2026 : framework AARRR",
            "Definir ses personas avec methode (interviews + data)",
            "Cartographier le buyer journey en 5 etapes",
            "Choisir ses canaux d'acquisition prioritaires",
            "Positionnement et proposition de valeur unique (UVP)",
        ],
        2: [
            "SEO : levier d'acquisition long terme",
            "Publicite payante : Meta Ads, Google Ads, TikTok",
            "Social organique : strategies par plateforme",
            "Partenariats et affiliation : pilier sous-exploite",
            "Email opt-in : construire sa liste de zero",
        ],
        3: [
            "Conception de landing pages qui convertissent",
            "CRO : framework PIE pour prioriser les tests",
            "Email nurturing : sequences pour leads tiedes",
            "Marketing automation : Brevo, HubSpot, ConvertKit",
            "Lead scoring : prioriser les commerciaux",
        ],
        4: [
            "Programmes de fidelite et retention",
            "NPS et CSAT : mesurer et ameliorer la satisfaction",
            "Marketing de reactivation : reveiller la base dormante",
            "Programme ambassadeurs et UGC",
            "Customer Lifetime Value (CLV) : modelisation",
        ],
        5: [
            "GA4 : setup et evenements customs",
            "Attribution multi-touch : choisir son modele",
            "Dashboards Looker Studio : modeles pour PME",
            "ROAS, CAC, LTV : ratios cles a maitriser",
            "Reporting executif : modele 1-pager",
        ],
        6: [
            "Growth loops vs funnels : difference et applications",
            "North Star Metric : choisir la sienne",
            "Roadmap d'experimentations : ICE et RICE",
            "A/B testing statistiquement significatif",
            "OKR marketing : poser des objectifs ambitieux",
        ],
        7: [
            "Org marketing : roles et stack tech",
            "Brief agence vs in-house : criteres de choix",
            "Budget marketing : repartition 60/30/10",
            "Marketing internationnal : adapter sans dupliquer",
            "Cas d'etude : croissance x10 en 18 mois",
        ],
    },
    'ads': {
        1: [
            "Creer son compte Meta Ads / Google Ads pas-a-pas",
            "Installer le Pixel Meta et le tag Google Ads",
            "Configurer les conversions avec GTM",
            "Structurer ses campagnes : CBO vs ABO",
            "Premier budget : combien investir pour tester",
        ],
        2: [
            "Recherche d'audience : interests, lookalike, custom",
            "Recherche de mots-cles : Search Terms et negatifs",
            "Audiences retargeting : visiteurs, panier, clients",
            "Audiences exclues : eviter de spam ses clients",
            "Tester 5 audiences en parallele : methodologie",
        ],
        3: [
            "Anatomie d'une crea qui convertit (hook, body, CTA)",
            "Formats videos qui marchent en 2026",
            "Carousels et catalog ads : best practices",
            "User Generated Content : sourcing et activation",
            "A/B test creas : framework et taille d'echantillon",
        ],
        4: [
            "Optimisation des bid strategies : Manual vs Auto",
            "Budget caps et placements : quand intervenir",
            "Diagnostic d'une campagne en perte",
            "Frequency capping : eviter la creative fatigue",
            "Day-parting et geo-targeting avances",
        ],
        5: [
            "Attribution post-iOS14 : modeles et limites",
            "MTA, MMM, incrementalite : quand utiliser quoi",
            "Reporting CMO : modele 1-pager hebdo",
            "ROAS vs CPA vs Profit : choisir le bon KPI",
            "Tableau de bord Triple Whale / Northbeam",
        ],
        6: [
            "Scaling avance : passer de 1k a 100k EUR/mois",
            "Campaign Budget Optimization (CBO) en profondeur",
            "Automated rules et scripts : automation Meta Ads",
            "Whitelisting createurs : Spark Ads et reused content",
            "Strategies omnicanal (FB + IG + WhatsApp + Messenger)",
        ],
        7: [
            "Strategies post-iOS14 : SKAdNetwork et Aggregated Events",
            "CAPI server-side : amelioration majeure du tracking",
            "Privacy Sandbox : preparer la fin des cookies",
            "Audit complet d'un compte ads en 1h",
            "Cas d'etude : passage de 1x a 4x ROAS en 90 jours",
        ],
    },
    'social': {
        1: [
            "Audit social media : etat des lieux honnete",
            "Choisir ses plateformes : 2 a 3 max au demarrage",
            "Definir sa ligne editoriale en 1 page",
            "Calendrier editorial : outil et rythme",
            "KPIs de pilotage social media",
        ],
        2: [
            "Reels Instagram : anatomie d'une video virale",
            "TikTok : hooks 3 secondes et retention",
            "Carrousels LinkedIn : structure et design",
            "Threads X : framework pour scaler",
            "Stories Instagram : engagement quotidien",
        ],
        3: [
            "Repondre aux commentaires : tone of voice",
            "Gerer les avis negatifs et bad buzz",
            "DM marketing : conversations qui vendent",
            "Animer une communaute Discord ou WhatsApp",
            "Process de moderation et escalation",
        ],
        4: [
            "Metriques vanity vs metriques business",
            "Reach vs Impressions : interpretation",
            "Engagement rate : benchmarks par plateforme",
            "Social listening : outils et processus",
            "Reporting social media : modele 1-pager",
        ],
        5: [
            "Boost vs Ads Manager : quand utiliser quoi",
            "Spark Ads (TikTok) et Branded Content (IG)",
            "Audiences sauvegardees et lookalikes social",
            "Budget paid : repartition par plateforme",
            "Mesure organique vs paye : attribution",
        ],
        6: [
            "Sourcing influenceurs : nano, micro, macro",
            "Contrats partenariats : clauses essentielles",
            "Brief createur : ce qu'il faut absolument inclure",
            "Mesurer le ROI d'un partenariat influence",
            "Programme ambassadeurs long terme",
        ],
        7: [
            "Industrialiser la production de contenu",
            "Equipe sociale : roles et taille selon volume",
            "Stack outils : Later, Metricool, Sprout Social",
            "Repurposing : 1 source -> 10 contenus",
            "Audit annuel et pivot strategique",
        ],
    },
    'content': {
        1: [
            "Strategie editoriale : 1 page qui guide tout",
            "Persona contentmarketing : different du persona ads",
            "Piliers thematiques et content gap",
            "Calendrier editorial : process et outils",
            "Lignes editoriales : ton, style, vocabulary",
        ],
        2: [
            "Recherche de mots-cles intention informationnelle",
            "Brief redactionnel : modele 1-pager",
            "Topic cluster : pillar page + content satellites",
            "Veille concurrentielle : analyse des SERPs",
            "Choisir entre redaction interne et freelance",
        ],
        3: [
            "Framework AIDA pour les landing pages",
            "PAS, BAB, FAB : quand utiliser chacun",
            "Headlines qui accrochent en 5 secondes",
            "Storytelling B2B : structurer son recit",
            "CTAs qui convertissent : design et copy",
        ],
        4: [
            "Distribution : email, social, syndication",
            "Optimisation SEO on-page d'un article",
            "Repurposing : 1 article -> 5 formats",
            "Newsletter editoriale : modele de structure",
            "Featured Snippets : optimiser pour P0",
        ],
        5: [
            "KPIs editoriaux : trafic, conversion, brand",
            "Modeles d'attribution pour le contenu",
            "Reporting editorial : modele mensuel",
            "Cohort analysis : comment le contenu retient",
            "ROI du contenu sur 12-24 mois",
        ],
        6: [
            "Content refresh : remettre a jour pour regagner du trafic",
            "Article-feeding : ecrire pour LLM cite (SGE)",
            "International : adapter sans traduire mot a mot",
            "Audio et video : extension du contenu ecrit",
            "Contenus interactifs : quizz, calculators, tools",
        ],
        7: [
            "Stack outils content : Notion, Frase, Surfer SEO",
            "Workflow scalable : 20 articles/mois sans casse",
            "Team editoriale : roles et hierarchie",
            "Brand voice et style guide : 1 document de reference",
            "Veille content marketing : sources et outils",
        ],
    },
    'email': {
        1: [
            "Choisir son ESP : Brevo, Mailchimp, Klaviyo, ConvertKit",
            "Configurer SPF, DKIM, DMARC pas-a-pas",
            "Authentifier son domaine d'envoi",
            "IP dediee vs IP partagee : criteres de choix",
            "Warm-up de domaine : etapes obligatoires",
        ],
        2: [
            "Strategie d'opt-in : double opt-in obligatoire en 2026",
            "Segmentation RFM : Recence, Frequence, Montant",
            "Tags vs Listes : modele a privilegier",
            "Importation de base : RGPD et nettoyage",
            "Custom fields : structurer pour mieux personnaliser",
        ],
        3: [
            "Welcome sequence : 5 emails sur 7 jours",
            "Abandoned cart : 3 emails sur 24h",
            "Re-engagement : reveiller les inactifs",
            "Post-purchase : avis, upsell, fidelite",
            "Lead nurturing B2B : 8 emails sur 30 jours",
        ],
        4: [
            "Design email responsive : framework MJML",
            "Personnalisation dynamique : tokens et contenu conditional",
            "A/B test emails : sujet, hero, CTA",
            "Send time optimization : horaires optimaux",
            "Templates types : promotional, transactional, newsletter",
        ],
        5: [
            "KPIs email : open rate, CTR, conversion, unsubscribe",
            "Diagnostic d'une chute d'open rate",
            "Heatmaps email : ou cliquent vraiment les gens",
            "Reporting email mensuel : modele",
            "Benchmarks par secteur en 2026",
        ],
        6: [
            "Outils de delivrabilite : GlockApps, MXToolbox, Litmus",
            "Diagnostic spam : pourquoi vos emails finissent en spam",
            "Reputation IP et domaine : monitoring",
            "Bounce management : hard vs soft bounce",
            "Plaintes spam : seuils critiques a surveiller",
        ],
        7: [
            "Automation conditionnelle avancee (if/then)",
            "Triggers comportementaux : events sur le site",
            "Cross-channel : email + SMS + WhatsApp coordonnes",
            "Personnalisation IA : OpenAI dans Brevo/Klaviyo",
            "Audit email marketing 360 : checklist 50 points",
        ],
    },
    'design': {
        1: [
            "Principes fondamentaux : contraste, hierarchie, white space",
            "Theorie des couleurs : palettes qui fonctionnent",
            "Typographie : choisir et combiner les polices",
            "Grille et alignement : la base invisible",
            "Accessibilite WCAG AA : criteres essentiels",
        ],
        2: [
            "Figma : tour d'horizon de l'interface",
            "Auto Layout : la fonction qui change tout",
            "Components et variants : design system de base",
            "Plugins indispensables (Iconify, Unsplash, etc.)",
            "Workflow collaboratif : pages, branches, libraries",
        ],
        3: [
            "Brand identity : du brief au logo final",
            "Naming : process et frameworks (Brandinglab)",
            "Palette de marque : primary, secondary, neutrals",
            "Typographie de marque : choix et licences",
            "Charte graphique : modele 1-pager",
        ],
        4: [
            "Web vs print : adapter sans denaturer",
            "Reseaux sociaux : templates par plateforme",
            "Email design : contraintes specifiques",
            "Presentations Keynote/Slides : design pro",
            "Goodies et merchandising : production locale Benin",
        ],
        5: [
            "Specs developpeur : tokens, assets, prototypes",
            "Storybook et design system documente",
            "Handoff : Figma Dev Mode et Zeplin",
            "QA design en recette : check-list",
            "Maintenance design system : versioning",
        ],
        6: [
            "Motion design : principes Disney revisites",
            "After Effects : workflow type",
            "Microinteractions : Lottie et JSON exports",
            "3D design : Blender pour le marketing",
            "Veille design : sources et workflows",
        ],
        7: [
            "Process equipe : briefing, revue, validation",
            "Critique design : framework feedback constructif",
            "Outils tickets : Linear, Jira, Trello pour design",
            "OKR design : poser des objectifs mesurables",
            "Carriere designer : seniorisation et specialisation",
        ],
    },
    'ai': {
        1: [
            "IA generative en 2026 : panorama et acteurs",
            "Comprendre les LLMs : tokens, context, parametres",
            "Modeles cles : Claude 4, GPT-4o, Gemini 1.5 Pro, Mistral",
            "Limites et risques : hallucinations, biais, privacy",
            "Reglementation IA : AI Act EU et bonnes pratiques",
        ],
        2: [
            "Prompts efficaces : 6 elements indispensables",
            "Role prompting : assigner un personnage a l'IA",
            "Few-shot prompting : apprendre par l'exemple",
            "Chain-of-Thought : raisonnement explicite",
            "Structured outputs : JSON et schemas pour APIs",
        ],
        3: [
            "ChatGPT pour le marketing : 10 use cases",
            "Claude pour la redaction longue forme",
            "Midjourney pour les visuels marque",
            "ElevenLabs pour la voix : intros, presentations",
            "Suno et Runway : musique et video IA",
        ],
        4: [
            "Make, Zapier et n8n : comparatif",
            "Premier workflow : envoyer un mail enrichi par IA",
            "Function calling et tools : agents qui agissent",
            "RAG (Retrieval Augmented Generation) : explication",
            "Agents multi-step : architectures et patterns",
        ],
        5: [
            "Evals : tester ses prompts comme du code",
            "Versioning de prompts : changelog et rollback",
            "Monitoring : latence, cout, erreurs, qualite",
            "Garde-fous : moderation, PII, jailbreak protection",
            "Plan B : fallback si LLM down ou rate limite",
        ],
        6: [
            "Vector databases : Pinecone, Weaviate, pgvector",
            "Fine-tuning vs RAG : quand choisir quoi",
            "Multimodal : image, audio, video dans le meme flow",
            "Privacy et on-premise : LLMs auto-heberges",
            "Veille IA : sources et outils a suivre quotidiennement",
        ],
        7: [
            "Strategie IA d'entreprise : roadmap 12 mois",
            "Cas d'usage prioritaires : ROI rapide",
            "Change management : adoption interne",
            "Compliance et IT : valider en interne",
            "Cas d'etude : automation x10 productivite marketing",
        ],
    },
    'data': {
        1: [
            "GA4 vs Universal Analytics : ce qui change",
            "Setup GA4 en 1h : compte, propriete, flux",
            "Installation via GTM ou direct : avantages/inconvenients",
            "Events GA4 : automatiques et customs",
            "Conversions : marquer ce qui compte vraiment",
        ],
        2: [
            "Collecte server-side : GTM Server, CAPI Meta",
            "Cookies first-party : strategie post-Chrome 2026",
            "Consent Mode v2 : RGPD-compliant",
            "Data quality : tests et audits reguliers",
            "ETL : Segment, Stape, Fivetran",
        ],
        3: [
            "Looker Studio : modeles pour PME",
            "BigQuery : connect GA4 et requetes SQL",
            "Cohort analysis : retention par cohorte",
            "Funnels : drop-off et points de friction",
            "Segments d'audience custom",
        ],
        4: [
            "Dashboards par audience : CEO, CMO, ops",
            "Frequence de revue : quotidien, hebdo, mensuel",
            "Alertes automatiques : seuils a definir",
            "Storytelling avec la data : narrer les chiffres",
            "1-pager executif : modele",
        ],
        5: [
            "A/B test : design statistique et taille echantillon",
            "Sequential testing : raccourcir la duree des tests",
            "Multi-armed bandit : optimisation continue",
            "Holdout groups : mesurer l'incrementalite",
            "Test learning : capitaliser sur les echecs",
        ],
        6: [
            "Modeles d'attribution : last-click, linear, data-driven",
            "Marketing Mix Modeling : intro et outils",
            "Incrementalite par geo-experiments",
            "MTA (Multi-Touch Attribution) : limites",
            "Choisir son modele en fonction du business",
        ],
        7: [
            "Org data : data eng, analyst, scientist",
            "Stack moderne : dbt, Airbyte, Looker, Hex",
            "Data governance : qualite et acces",
            "Documentation : Notion, data catalog",
            "Cas d'etude : passage de excel a dashboards en 90 jours",
        ],
    },
}


def generate_lesson_titles(formation, module_titles, n_modules, n_lessons_total):
    """Retourne un dict {(module_idx, lesson_idx): title}."""
    cat = formation['cat']
    patterns = LESSON_PATTERNS.get(cat, {})
    lessons_per_module = max(3, n_lessons_total // n_modules)

    out = {}
    lesson_count = 0
    for m_i in range(1, n_modules + 1):
        n_this = lessons_per_module if m_i < n_modules else (n_lessons_total - lesson_count)
        cat_lessons = patterns.get(m_i, [])
        module_title = module_titles[m_i - 1].strip() if m_i - 1 < len(module_titles) else f"Module {m_i}"
        for l_i in range(1, n_this + 1):
            if cat_lessons and l_i - 1 < len(cat_lessons):
                title = cat_lessons[l_i - 1]
            else:
                # fallback genere si la position de lecon depasse les patterns disponibles
                # (formations avec plus de 5 lecons par module)
                topic = module_title.lower()
                generic_patterns = [
                    f"Approfondissement {topic}",
                    f"Cas pratique : {topic}",
                    f"Erreurs courantes en {topic}",
                    f"Outils pour {topic}",
                    f"Checklist {topic} en production",
                    f"Mesurer la performance en {topic}",
                ]
                title = generic_patterns[(l_i - 1) % len(generic_patterns)]
            out[(m_i, l_i)] = title
            lesson_count += 1
            if lesson_count >= n_lessons_total:
                return out
    return out
