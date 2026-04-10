#!/usr/bin/env python3
"""Translate full body paragraphs and sections FR->EN in all /en/ pages.
Targets the common template blocks shared across service/city pages."""
import os, re

EN_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "en")

# Full paragraph/sentence translations (FR -> EN)
# Ordered from longest to shortest to avoid partial matches
BODY_TRANSLATIONS = [
    # ===== HERO HEADINGS =====
    ("VOUS MERITEZ<br>LA PREMIERE PAGE<br>DE", "YOU DESERVE<br>THE FIRST PAGE<br>OF"),
    ("VOUS MERITEZ<br>LA PREMIERE PAGE", "YOU DESERVE<br>THE FIRST PAGE"),
    ("VOUS MERITEZ", "YOU DESERVE"),
    ("LA PREMIERE PAGE", "THE FIRST PAGE"),

    # ===== BREADCRUMB =====
    (">Accueil</a>", ">Home</a>"),
    (">Services</a>", ">Services</a>"),

    # ===== PAIN POINTS SECTION =====
    ("Le probleme", "The problem"),
    ("EST-CE QUE CA VOUS PARLE ?", "DOES THIS SOUND FAMILIAR?"),
    ("EST-CE QUE CA VOUS PARLE", "DOES THIS SOUND FAMILIAR"),
    ("Si vous vous reconnaissez dans l'une de ces situations, vous êtes au bon endroit.", "If you recognize yourself in any of these situations, you're in the right place."),
    ("Si vous vous reconnaissez dans l'une de ces situations, vous are au bon endroit.", "If you recognize yourself in any of these situations, you're in the right place."),

    # Pain point cards - headings
    ("Votre site est introuvable sur Google", "Your website is invisible on Google"),
    ("Your website est introuvable sur Google", "Your website is invisible on Google"),
    ("Votre trafic stagne depuis des mois", "Your traffic has been stagnant for months"),
    ("Your traffic stagne depuis des mois", "Your traffic has been stagnant for months"),
    ("Votre traffic stagne depuis des mois", "Your traffic has been stagnant for months"),
    ("Vous dependez de la publicité payante", "You depend on paid advertising"),
    ("Vous dependez de la paid advertising", "You depend on paid advertising"),
    ("Votre agence precedente n'a rien donne", "Your previous agency delivered nothing"),
    ("Your agency precedente n'a rien donne", "Your previous agency delivered nothing"),
    ("Votre agency precedente n'a rien donne", "Your previous agency delivered nothing"),
    ("Vous ne comprenez pas le SEO", "You don't understand SEO"),
    ("Vous n'avez pas le temps", "You don't have the time"),

    # Pain point cards - bodies
    ("Vos concurrents apparaissent en premier quand vos clients potentiels cherchent vos services. Chaque jour qui passe, vous perdez des opportunites sans même le savoir. Votre site existe, mais personne ne le voit.",
     "Your competitors appear first when your potential clients search for your services. Every day that passes, you lose opportunities without even knowing it. Your website exists, but nobody sees it."),
    ("Vos competitors apparaissent en premier quand vos potential clients cherchent vos services. Chaque jour qui passe, vous perdez des opportunites sans same le savoir. Your website existe, mais personne ne le voit.",
     "Your competitors appear first when your potential clients search for your services. Every day that passes, you lose opportunities without even knowing it. Your website exists, but nobody sees it."),
    ("Vous avez investi dans un beau site, peut-être même dans du contenu, mais le compteur de visites reste désespérément plat. Vous vous demandez ce qui bloque et pourquoi rien ne decolle.",
     "You invested in a beautiful website, maybe even in content, but the visitor counter remains desperately flat. You wonder what's blocking and why nothing takes off."),
    ("Vous avez investi dans un beau site, peut-be same dans du contenu, mais le compteur de visites reste désespérément plat. Vous vous demandez ce qui bloque et pourquoi rien ne decolle.",
     "You invested in a beautiful website, maybe even in content, but the visitor counter remains desperately flat. You wonder what's blocking and why nothing takes off."),
    ("Chaque mois, vous remettez de l'argent dans Google Ads juste pour avoir des clients. Le jour où vous arrêtez de payer, le téléphone ne sonne plus. Vous êtes pris en otage par la pub.",
     "Every month, you pour money into Google Ads just to get clients. The day you stop paying, the phone stops ringing. You're held hostage by advertising."),
    ("Chaque mois, vous remettez de l'argent dans Google Ads juste pour avoir des clients. Le jour where vous arrêtez de payer, le téléphone ne sonne plus. Vous are pris en otage par la pub.",
     "Every month, you pour money into Google Ads just to get clients. The day you stop paying, the phone stops ringing. You're held hostage by advertising."),
    ("Vous avez deja paye une agence SEO. Six mois plus tard : aucun résultat concret, des rapports remplis de jargon que vous ne comprenez pas, et une confiance brisee. Ca ne se reproduira pas.",
     "You already paid an SEO agency. Six months later: no concrete results, reports filled with jargon you don't understand, and broken trust. That won't happen again."),
    ("Vous avez deja paye an agency SEO. Six mois plus tard : aucun result concret, des rapports remplis de jargon que vous ne comprenez pas, et une confiance brisee. Ca ne se reproduira pas.",
     "You already paid an SEO agency. Six months later: no concrete results, reports filled with jargon you don't understand, and broken trust. That won't happen again."),
    ("Le référencement vous semble technique et flou. Vous ne savez pas par où commencer, ni a qui faire confiance. On vous a parle de backlinks, de mots-clés, de Core Web Vitals — et vous êtes perdu.",
     "SEO seems technical and vague to you. You don't know where to start, or who to trust. You've been told about backlinks, keywords, Core Web Vitals — and you're lost."),
    ("Le SEO vous semble technique et flou. Vous ne savez pas par where commencer, ni a qui faire confiance. On vous a parle de backlinks, de keywords, de Core Web Vitals — et vous are perdu.",
     "SEO seems technical and vague to you. You don't know where to start, or who to trust. You've been told about backlinks, keywords, Core Web Vitals — and you're lost."),
    ("Vous savez que le SEO est important, mais entre la gestion quotidienne de votre entreprise, les clients et le reste, ca passe toujours en dernier. Vous avez besoin de quelqu'un qui s'en occupe pour vous.",
     "You know SEO is important, but between running your business daily, clients and everything else, it always comes last. You need someone to handle it for you."),
    ("Vous savez que le SEO est important, mais entre la gestion quotidienne de your business, les clients et le reste, ca passe toujours en dernier. Vous avez besoin de quelqu'un qui s'en occupe pour vous.",
     "You know SEO is important, but between running your business daily, clients and everything else, it always comes last. You need someone to handle it for you."),

    # ===== APPROACH SECTION =====
    ("Notre approche", "Our approach"),
    ("ON NE FAIT PAS DU SEO.<br><span class=\"text-accent\">ON CONSTRUIT VOTRE MACHINE A TRAFIC.</span>",
     "WE DON'T JUST DO SEO.<br><span class=\"text-accent\">WE BUILD YOUR TRAFFIC MACHINE.</span>"),
    ("ON NE FAIT PAS DU SEO.", "WE DON'T JUST DO SEO."),
    ("ON CONSTRUIT VOTRE MACHINE A TRAFIC.", "WE BUILD YOUR TRAFFIC MACHINE."),

    ("Chez Pirabel Labs, nous ne vendons pas des \"prestations SEO\". Nous construisons un système complet qui attire, qualifié et convertit des visiteurs en clients. Chaque action a un objectif précis, chaque résultat est mesurable.",
     "At Pirabel Labs, we don't sell \"SEO services\". We build a complete system that attracts, qualifies and converts visitors into clients. Every action has a clear objective, every result is measurable."),
    ("Notre méthode repose sur trois piliers : une optimisation technique irreprochable pour que Google comprenne parfaitement votre site, du contenu stratégique qui repond aux vraies questions de vos prospects, et une autorite de domaine qui se construit dans la duree.",
     "Our method is built on three pillars: flawless technical optimization so Google perfectly understands your site, strategic content that answers your prospects' real questions, and domain authority that builds over time."),
    ("Notre method repose sur trois piliers : une optimisation technique irreprochable pour que Google comprenne parfaitement your website, du contenu strategic qui repond aux vraies questions de vos prospects, et une autorite de domaine qui se construit dans la duree.",
     "Our method is built on three pillars: flawless technical optimization so Google perfectly understands your site, strategic content that answers your prospects' real questions, and domain authority that builds over time."),
    ("Nous ne promettons pas la lune. Nous vous montrons un plan d'action clair, des jalons précis, et des résultats que vous pouvez vérifier vous-meme. Pas de jargon, pas de rapports incomprehensibles — juste de la transparence et des chiffres.",
     "We don't promise the moon. We show you a clear action plan, precise milestones, and results you can verify yourself. No jargon, no incomprehensible reports — just transparency and numbers."),

    # Stats labels
    ("Trafic moyen genere", "Average traffic generated"),
    ("Traffic moyen genere", "Average traffic generated"),
    ("Mots-cles en top 3", "Keywords in top 3"),
    ("Keywords en top 3", "Keywords in top 3"),
    ("ROI moyen", "Average ROI"),
    ("Delai résultats visibles", "Time to visible results"),
    ("Delai results visibles", "Time to visible results"),

    # ===== SUB-SERVICES SECTION =====
    ("Nos expertises SEO", "Our SEO expertise"),
    ("DES SOLUTIONS POUR CHAQUE DIMENSION DE VOTRE REFERENCEMENT",
     "SOLUTIONS FOR EVERY DIMENSION OF YOUR SEO"),
    ("Chaque aspect du SEO demande une expertise spécifique. Nous les maîtrisons tous pour que votre stratégie soit complète et cohérente.",
     "Each aspect of SEO requires specific expertise. We master them all so your strategy is complete and consistent."),
    ("Chaque aspect du SEO demande une expertise spécifique. Nous les maîtrisons tous pour que your strategy soit complète et cohérente.",
     "Each aspect of SEO requires specific expertise. We master them all so your strategy is complete and consistent."),
    ("Expertise phare", "Key expertise"),

    # SEO Technique card
    ("La base invisible de votre visibilité. Nous auditons et corrigeons tout ce qui empeche Google de comprendre votre site : vitesse de chargement, architecture, indexation, balisage, Core Web Vitals. Un site techniquement parfait, c'est la fondation de tout le reste.",
     "The invisible foundation of your visibility. We audit and fix everything preventing Google from understanding your site: loading speed, architecture, indexing, markup, Core Web Vitals. A technically perfect site is the foundation for everything else."),
    ("Audit technique complet (250+ points)", "Complete technical audit (250+ points)"),
    ("Optimisation Core Web Vitals", "Core Web Vitals optimization"),
    ("Architecture et maillage interne", "Architecture and internal linking"),
    ("Balisage Schema.org", "Schema.org markup"),
    ("Correction erreurs d'indexation", "Indexing error fixes"),
    ("Migration SEO sans perte", "Loss-free SEO migration"),
    ("Découvrir le SEO Technique", "Discover Technical SEO"),

    # SEO Local card
    ("Dominez les recherches locales dans votre ville. Google Maps, fiche Google Business, avis clients, citations locales — on vous rend visible là où vos clients vous cherchent. Idéal pour les commerces, restaurants, cabinets et prestataires de services.",
     "Dominate local searches in your city. Google Maps, Google Business listing, client reviews, local citations — we make you visible where your clients are looking. Ideal for shops, restaurants, practices and service providers."),
    ("Dominate local searches dans your ville. Google Maps, fiche Google Business, avis clients, citations locales — on vous rend visible there where vos clients vous cherchent. Idéal pour les commerces, restaurants, cabinets et prestataires de services.",
     "Dominate local searches in your city. Google Maps, Google Business listing, client reviews, local citations — we make you visible where your clients are looking. Ideal for shops, restaurants, practices and service providers."),
    ("Optimisation Google Business Profile", "Google Business Profile optimization"),
    ("Gestion des avis et e-reputation", "Review management and e-reputation"),
    ("Citations locales et annuaires", "Local citations and directories"),
    ("Pages locales optimisées", "Optimized local pages"),
    ("Pages locales optimized", "Optimized local pages"),

    # Audit SEO card
    ("Un diagnostic complet de votre site en 50+ points. Vous recevez un plan d'action concret, priorise, avec des recommandations claires que vous comprenez sans être expert. C'est la première étape pour savoir exactement où vous en etes.",
     "A complete diagnostic of your site in 50+ points. You receive a concrete, prioritized action plan with clear recommendations you understand without being an expert. It's the first step to knowing exactly where you stand."),
    ("Analyse technique complete", "Complete technical analysis"),
    ("Etude de la concurrence", "Competition study"),
    ("Analyse des mots-clés", "Keyword analysis"),
    ("Analyse des keywords", "Keyword analysis"),
    ("Plan d'action priorise", "Prioritized action plan"),

    # Rédaction SEO card
    ("Du contenu qui plait a Google ET à vos lecteurs. Articles de blog, pages de service, guides — chaque texte est stratégiquement écrit pour attirer du trafic qualifié et convaincre vos visiteurs de passer a l'action.",
     "Content that pleases Google AND your readers. Blog posts, service pages, guides — each text is strategically written to attract qualified traffic and convince your visitors to take action."),
    ("Recherche de keywords strategiques", "Strategic keyword research"),
    ("Recherche de mots-clés strategiques", "Strategic keyword research"),
    ("Recherche de mots-clés stratégiques", "Strategic keyword research"),
    ("Articles de blog optimises", "Optimized blog posts"),
    ("Pages piliers et cocons sémantiques", "Pillar pages and semantic clusters"),
    ("Pages piliers et cocons semantiques", "Pillar pages and semantic clusters"),
    ("Calendrier editorial", "Editorial calendar"),
    ("Calendrier éditorial", "Editorial calendar"),

    # Netlinking card
    ("Des liens de quality qui renforcent votre autorite aux yeux de Google.", "Quality links that strengthen your authority in Google's eyes."),
    ("Des liens de qualité qui renforcent votre autorité aux yeux de Google.", "Quality links that strengthen your authority in Google's eyes."),
    ("Backlinks de quality", "Quality backlinks"),
    ("Backlinks de qualité", "Quality backlinks"),
    ("Partenariats strategiques", "Strategic partnerships"),
    ("Partenariats stratégiques", "Strategic partnerships"),
    ("Guest blogging", "Guest blogging"),
    ("Linkbaiting et contenus partageables", "Linkbaiting and shareable content"),

    # ===== PROCESS SECTION =====
    ("Notre processus", "Our process"),
    ("COMMENT ON VOUS EMMENE EN PREMIERE PAGE", "HOW WE GET YOU TO THE FIRST PAGE"),
    ("4 ETAPES CLAIRES, ZERO JARGON.", "4 CLEAR STEPS, ZERO JARGON."),
    ("4 ETAPES CLAIRES", "4 CLEAR STEPS"),
    ("ZERO JARGON.", "ZERO JARGON."),
    ("Étape", "Step"),
    ("Etape", "Step"),

    ("Audit & Diagnostic", "Audit & Diagnostic"),
    ("Nous analysons votre site en profondeur : technique, contenu, concurrence, mots-clés. Vous recevez un diagnostic complet et un plan d'action clair en 48h.",
     "We analyze your site in depth: technical, content, competition, keywords. You receive a complete diagnostic and a clear action plan within 48h."),
    ("Analyse technique, contenu et concurrence", "Technical, content and competition analysis"),
    ("Identification des opportunités rapides", "Quick opportunity identification"),
    ("Identification des opportunites rapides", "Quick opportunity identification"),
    ("Plan d'action priorisé", "Prioritized action plan"),
    ("Plan d'action priorise", "Prioritized action plan"),
    ("Baseline de vos positions actuelles", "Baseline of your current rankings"),

    ("Stratégie & Planning", "Strategy & Planning"),
    ("Strategy & Planning", "Strategy & Planning"),
    ("On construit votre stratégie SEO sur mesure : quels mots-clés viser, quel contenu créer, quels liens obtenir, dans quel ordre. Tout est priorise par impact.",
     "We build your custom SEO strategy: which keywords to target, what content to create, which links to get, in what order. Everything is prioritized by impact."),
    ("Selection de keywords a fort ROI", "High-ROI keyword selection"),
    ("Sélection de mots-clés à fort ROI", "High-ROI keyword selection"),
    ("Calendrier de contenu strategique", "Strategic content calendar"),
    ("Calendrier de contenu stratégique", "Strategic content calendar"),
    ("Stratégie de liens personnalisée", "Personalized link strategy"),
    ("Strategy de liens personalized", "Personalized link strategy"),
    ("Objectifs mensuels mesurables", "Measurable monthly goals"),

    ("Exécution & Optimisation", "Execution & Optimization"),
    ("Notre equipe execute le plan : corrections techniques, creation de contenu, acquisition de liens. Chaque mois, on ajuste en fonction des resultats.",
     "Our team executes the plan: technical fixes, content creation, link acquisition. Every month, we adjust based on results."),
    ("Corrections techniques en continu", "Continuous technical fixes"),
    ("Création de contenu optimisé", "Optimized content creation"),
    ("Creation de contenu optimisé", "Optimized content creation"),
    ("Creation de contenu optimise", "Optimized content creation"),
    ("Acquisition de backlinks qualitatifs", "Quality backlink acquisition"),
    ("Optimisation on-page permanente", "Permanent on-page optimization"),

    ("Résultats & Croissance", "Results & Growth"),
    ("Results & Growth", "Results & Growth"),
    ("Les résultats arrivent. Nous vous montrons exactement ce qui a change, quel traffic vous gagnez, et quels clients en decoulent. Puis on accelere.",
     "Results arrive. We show you exactly what changed, what traffic you're gaining, and what clients follow. Then we accelerate."),
    ("Rapports mensuels transparents", "Transparent monthly reports"),
    ("Suivi des positions en temps reel", "Real-time ranking tracking"),
    ("Suivi des positions en temps réel", "Real-time ranking tracking"),
    ("Analyse du ROI par canal", "ROI analysis by channel"),
    ("Recommandations d'acceleration", "Acceleration recommendations"),

    # ===== RESULTS SECTION =====
    ("Résultats concrets", "Concrete results"),
    ("NOS CLIENTS NE PARLENT PAS DE NOUS.<br>LEURS CHIFFRES LE FONT.", "OUR CLIENTS DON'T TALK ABOUT US.<br>THEIR NUMBERS DO."),
    ("NOS CLIENTS NE PARLENT PAS DE NOUS.", "OUR CLIENTS DON'T TALK ABOUT US."),
    ("LEURS CHIFFRES LE FONT.", "THEIR NUMBERS DO."),
    ("de trafic organique", "organic traffic"),
    ("de traffic organique", "organic traffic"),
    ("de position Google", "Google ranking"),
    ("de conversion", "conversion rate"),
    ("de leads qualifies", "qualified leads"),
    ("de leads qualifiés", "qualified leads"),
    ("en 6 mois", "in 6 months"),
    ("en 3 mois", "in 3 months"),
    ("en 12 mois", "in 12 months"),
    ("Startup SaaS B2B", "B2B SaaS Startup"),
    ("E-commerce mode", "Fashion E-commerce"),
    ("Cabinet d'avocats", "Law Firm"),
    ("Restaurant haut de gamme", "High-end Restaurant"),

    # ===== CTA SECTION =====
    ("PRET A DOMINER GOOGLE ?", "READY TO DOMINATE GOOGLE?"),
    ("PR&Ecirc;T A DOMINER GOOGLE ?", "READY TO DOMINATE GOOGLE?"),
    ("Réservez votre audit SEO gratuit. En 48h, vous saurez exactement où vous en êtes et comment arriver en première page.",
     "Book your free SEO audit. Within 48h, you'll know exactly where you stand and how to reach the first page."),
    ("Demander mon audit gratuit", "Request my free audit"),
    ("Demander un audit gratuit", "Request a free audit"),
    ("Voir nos résultats", "See our results"),
    ("Voir nos results", "See our results"),
    ("ou appelez-nous directement", "or call us directly"),

    # ===== FAQ SECTION =====
    ("Questions fréquentes", "Frequently Asked Questions"),
    ("QUESTIONS FREQUENTES", "FREQUENTLY ASKED QUESTIONS"),
    ("TOUT CE QUE VOUS DEVEZ SAVOIR SUR LE SEO.", "EVERYTHING YOU NEED TO KNOW ABOUT SEO."),
    ("TOUT CE QUE VOUS DEVEZ SAVOIR", "EVERYTHING YOU NEED TO KNOW"),

    # FAQ Q&A
    ("Combien de temps faut-il pour voir des résultats SEO ?", "How long does it take to see SEO results?"),
    ("Combien de temps faut-il pour voir des results SEO ?", "How long does it take to see SEO results?"),
    ("Les premiers gains techniques sont visibles sous 30 jours. Pour un positionnement solide en première page, comptez 3 a 6 mois selon la concurrence de votre secteur.",
     "First technical gains are visible within 30 days. For a solid first page ranking, expect 3 to 6 months depending on competition in your sector."),
    ("Quelle est la différence entre SEO et Google Ads ?", "What is the difference between SEO and Google Ads?"),
    ("What is the difference between SEO et Google Ads ?", "What is the difference between SEO and Google Ads?"),
    ("Google Ads vous apporte du trafic tant que vous payez. Le SEO construit un actif durable : une fois bien positionne, votre site attire du trafic gratuitement pendant des mois voire des annees.",
     "Google Ads brings you traffic as long as you pay. SEO builds a lasting asset: once well ranked, your site attracts traffic for free for months or even years."),
    ("Google Ads vous apporte du traffic tant que vous payez. SEO builds a lasting asset : une fois bien positionne, your website attire du traffic freeement pendant des mois voire des annees.",
     "Google Ads brings you traffic as long as you pay. SEO builds a lasting asset: once well ranked, your site attracts traffic for free for months or even years."),
    ("Est-ce que le SEO vaut vraiment l'investissement ?", "Is SEO really worth the investment?"),
    ("Le SEO offre le meilleur retour sur investissement de tous les canaux marketing digitaux. Un euro investi en SEO rapporte en moyenne 4 a 5 euros de chiffre d'affaires sur 12 mois.",
     "SEO offers the best return on investment of all digital marketing channels. One euro invested in SEO returns on average 4 to 5 euros in revenue over 12 months."),
    ("Le SEO offre le meilleur return on investment of all digital marketing channels. One euro invested in SEO returns on average 4 a 5 euros de revenue sur 12 mois.",
     "SEO offers the best return on investment of all digital marketing channels. One euro invested in SEO returns on average 4 to 5 euros in revenue over 12 months."),
    ("Comment savoir si mon site a besoin de SEO ?", "How do I know if my site needs SEO?"),
    ("Si votre site n'apparaît pas en première page de Google quand vous cherchez vos services, vous perdez des clients. Notre audit gratuit vous montre exactement où vous en etes.",
     "If your site doesn't appear on the first page of Google when you search for your services, you're losing clients. Our free audit shows you exactly where you stand."),
    ("Si your website n'appears pas en first page of Google when you search for your services, you're losing clients. Notre audit free vous montre exactement where vous en etes.",
     "If your site doesn't appear on the first page of Google when you search for your services, you're losing clients. Our free audit shows you exactly where you stand."),
    ("Que comprend votre audit SEO gratuit ?", "What does your free SEO audit include?"),
    ("What does your free SEO audit include ?", "What does your free SEO audit include?"),
    ("Notre audit comprend une analyse de votre visibilité actuelle, un diagnostic technique, une etude de vos concurrents et des recommandations concrètes avec un plan d'action prioritaire.",
     "Our audit includes an analysis of your current visibility, a technical diagnostic, a competitor study and concrete recommendations with a priority action plan."),
    ("Our audit includes une analysis of your current visibility, un technical diagnostic, une etude de vos competitors ands concrete recommendations avec un priority action plan.",
     "Our audit includes an analysis of your current visibility, a technical diagnostic, a competitor study and concrete recommendations with a priority action plan."),
    ("Travaillez-vous avec des entreprises de toutes tailles ?", "Do you work with businesses of all sizes?"),
    ("Do you work with businesses of all sizes ?", "Do you work with businesses of all sizes?"),
    ("Oui. Startups, PME et grandes entreprises. Nous adaptons notre stratégie à votre budget, votre marché et vos objectifs spécifiques.",
     "Yes. Startups, SMBs and large enterprises. We adapt our strategy to your budget, your market and your specific goals."),
    ("Yes. Startups, SMBs and large enterprises. We adapt our strategy to your budget, your market et your specific goals.",
     "Yes. Startups, SMBs and large enterprises. We adapt our strategy to your budget, your market and your specific goals."),

    # ===== COMPARISON TABLE =====
    ("POURQUOI PIRABEL LABS ET PAS UNE AUTRE AGENCE ?", "WHY PIRABEL LABS AND NOT ANOTHER AGENCY?"),
    ("POURQUOI PIRABEL LABS ET PAS UNE AUTRE AGENCY ?", "WHY PIRABEL LABS AND NOT ANOTHER AGENCY?"),
    ("Agence classique", "Traditional agency"),
    ("Traditional agency", "Traditional agency"),
    ("Freelance", "Freelancer"),
    ("Prix élevés, résultats incertains", "High prices, uncertain results"),
    ("Prix elevés, results incertains", "High prices, uncertain results"),
    ("Prix bas, qualité variable", "Low prices, variable quality"),
    ("Qualité premium, ROI prouvé", "Premium quality, proven ROI"),
    ("quality premium, ROI prouvé", "Premium quality, proven ROI"),
    ("Communication lente", "Slow communication"),
    ("Disponibilité limitée", "Limited availability"),
    ("Interlocuteur dédié 24/7", "Dedicated contact 24/7"),
    ("Interlocuteur dedicated 24/7", "Dedicated contact 24/7"),
    ("Rapports mensuels basiques", "Basic monthly reports"),
    ("Pas de reporting", "No reporting"),
    ("Dashboard temps réel", "Real-time dashboard"),
    ("Dashboard temps reel", "Real-time dashboard"),

    # ===== NEWSLETTER / FOOTER =====
    ("Restez informé des dernières tendances", "Stay informed about the latest trends"),
    ("Recevez nos conseils exclusifs", "Receive our exclusive tips"),
    ("Votre email", "Your email"),
    ("S'inscrire", "Subscribe"),
    ("Inscription réussie", "Successfully subscribed"),
    ("Tous droits réservés", "All rights reserved"),
    ("Tous droits reserves", "All rights reserved"),
    ("Mentions légales", "Legal Notice"),
    ("Mentions legales", "Legal Notice"),
    ("Politique de confidentialité", "Privacy Policy"),
    ("Politique de confidentialite", "Privacy Policy"),
    ("Liens rapides", "Quick links"),
    ("Nous suivre", "Follow us"),

    # ===== COMMON CITY PAGE PATTERNS =====
    ("Vous cherchez une agence", "Looking for an agency"),
    ("qui comprend votre marché", "that understands your market"),
    ("qui comprend your market", "that understands your market"),
    ("Notre equipe locale connait les specificites du marche", "Our local team knows the specifics of the market"),
    ("Notre local team connait les specificites du market", "Our local team knows the specifics of the market"),
    ("Contactez-nous pour un audit gratuit", "Contact us for a free audit"),
    ("Contactez nous pour un audit free", "Contact us for a free audit"),
    ("Prêt à développer votre présence", "Ready to grow your presence"),
    ("Pret a develop your presence", "Ready to grow your presence"),
    ("dans votre ville", "in your city"),

    # ===== MARQUEE =====
    ("REFERENCEMENT LOCAL", "LOCAL SEO"),
    ("REDACTION SEO", "SEO WRITING"),
    ("MOTS-CLES", "KEYWORDS"),
    ("BACKLINKS", "BACKLINKS"),
    ("GOOGLE BUSINESS", "GOOGLE BUSINESS"),

    # ===== GENERAL CONNECTORS (careful, last) =====
    (" et ", " and "),
    (" ou ", " or "),
    (" avec ", " with "),
    (" sur ", " on "),
    (" pour ", " for "),
    (" dans ", " in "),
    (" votre ", " your "),
    (" notre ", " our "),
    (" nous ", " we "),
    (" vous ", " you "),
    (" vos ", " your "),
    (" nos ", " our "),
    (" une ", " a "),
    (" des ", " "),
    (" est ", " is "),
    (" sont ", " are "),
    (" qui ", " that "),
    (" que ", " that "),
    (" pas ", " not "),
    (" plus ", " more "),
    (" sans ", " without "),
    (" mais ", " but "),
    (" aussi ", " also "),
    (" cette ", " this "),
    (" entre ", " between "),
    (" comme ", " like "),
    (" parce que ", " because "),
    (" chaque ", " each "),
    ("Chaque ", "Each "),
]

count = 0
for root, dirs, files in os.walk(EN_DIR):
    for f in files:
        if not f.endswith('.html'):
            continue
        path = os.path.join(root, f)
        with open(path, 'r', encoding='utf-8', errors='replace') as fh:
            content = fh.read()
        original = content
        for fr, en in BODY_TRANSLATIONS:
            content = content.replace(fr, en)
        if content != original:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(content)
            count += 1

print(f"Body translations applied to {count} EN files")
