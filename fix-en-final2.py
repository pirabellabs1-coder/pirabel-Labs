#!/usr/bin/env python3
"""Final fix: repair Franglais artifacts and translate remaining FR paragraphs."""
import os, re

EN_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "en")

FIXES = [
    # ===== FIX FRANGLAIS ARTIFACTS from word-level translations =====
    ("parce that", "because"),
    ("parce que", "because"),
    (" ni ", " nor "),
    ("d'experts", "of experts"),
    ("d'expert", "of expert"),
    ("en l'air", "in the air"),
    (" ca ", " that "),
    (" ca.", " that."),

    # ===== HERO PARAGRAPHS (SEO page) =====
    ("You lose clients every day parce that your website is invisible on Google ? Nous corrigeons ca. Our team d'experts SEO construit your visibility durablement, without raccourci nor promesse en l'air. Vous savez exactement ce qu'on fait, pourquoi on le fait, and quels results you obtenez.",
     "You lose clients every day because your website is invisible on Google. We fix that. Our team of SEO experts builds your visibility sustainably, with no shortcuts or empty promises. You know exactly what we do, why we do it, and what results you get."),

    # Various partially translated versions of the same paragraph
    ("You lose clients each jour because your site is invisible on Google",
     "You lose clients every day because your website is invisible on Google"),
    ("Nous corrigeons ca.", "We fix that."),
    ("Nous corrigeons that.", "We fix that."),
    ("construit your visibility durablement", "builds your visibility sustainably"),
    ("without raccourci nor promesse", "with no shortcuts or empty promises"),
    ("without raccourci ni promesse", "with no shortcuts or empty promises"),
    ("Vous savez exactement ce qu'on fait", "You know exactly what we do"),
    ("pourquoi on le fait", "why we do it"),
    ("quels results you obtenez", "what results you get"),
    ("quels résultats vous obtenez", "what results you get"),

    # ===== CTA BUTTON FIXES =====
    ("Demander mon audit free", "Request my free audit"),
    ("Demander mon audit gratuit", "Request my free audit"),
    ("Réserver un appel stratégique", "Book a strategy call"),
    ("Reserver un appel strategique", "Book a strategy call"),
    ("Obtenir mon audit free", "Get my free audit"),
    ("Obtenir mon audit gratuit", "Get my free audit"),

    # ===== APPROACH SECTION FIXES =====
    ("Chez Pirabel Labs, we ne vendons not  \"prestations SEO\".",
     "At Pirabel Labs, we don't sell \"SEO services\"."),
    ("Chez Pirabel Labs, nous ne vendons pas des \"prestations SEO\".",
     "At Pirabel Labs, we don't sell \"SEO services\"."),
    ("Nous construisons un système complet that attire, qualifié and convertit des visiteurs en clients.",
     "We build a complete system that attracts, qualifies and converts visitors into clients."),
    ("Nous construisons un système complet qui attire, qualifié et convertit des visiteurs en clients.",
     "We build a complete system that attracts, qualifies and converts visitors into clients."),
    ("Each action a un objectif précis, each résultat is mesurable.",
     "Every action has a clear objective, every result is measurable."),
    ("Chaque action a un objectif précis, chaque résultat est mesurable.",
     "Every action has a clear objective, every result is measurable."),

    ("Our method repose on trois piliers",
     "Our method is built on three pillars"),
    ("Notre méthode repose sur trois piliers",
     "Our method is built on three pillars"),
    ("une optimisation technique irreprochable for that Google comprenne parfaitement your website",
     "flawless technical optimization so Google perfectly understands your site"),
    ("une optimisation technique irreprochable pour que Google comprenne parfaitement votre site",
     "flawless technical optimization so Google perfectly understands your site"),
    ("du contenu stratégique that repond aux vraies questions de your prospects",
     "strategic content that answers your prospects' real questions"),
    ("du contenu stratégique qui repond aux vraies questions de vos prospects",
     "strategic content that answers your prospects' real questions"),
    ("and a autorite de domaine that se construit in la duree",
     "and domain authority that builds over time"),
    ("et une autorite de domaine qui se construit dans la duree",
     "and domain authority that builds over time"),

    ("Nous ne promettons not la lune.",
     "We don't promise the moon."),
    ("Nous ne promettons pas la lune.",
     "We don't promise the moon."),
    ("Nous you montrons un plan d'action clair",
     "We show you a clear action plan"),
    ("Nous vous montrons un plan d'action clair",
     "We show you a clear action plan"),
    ("des jalons précis", "precise milestones"),
    ("and  results that you pouvez vérifier vous-meme",
     "and results you can verify yourself"),
    ("et des résultats que vous pouvez vérifier vous-meme",
     "and results you can verify yourself"),
    ("Not de jargon, not de rapports incomprehensibles — juste de la transparence and des chiffres.",
     "No jargon, no incomprehensible reports — just transparency and numbers."),
    ("Pas de jargon, pas de rapports incomprehensibles — juste de la transparence et des chiffres.",
     "No jargon, no incomprehensible reports — just transparency and numbers."),

    # ===== SUB-SERVICE DESCRIPTIONS =====
    ("La base invisible de your visibility.",
     "The invisible foundation of your visibility."),
    ("La base invisible de votre visibilité.",
     "The invisible foundation of your visibility."),
    ("Nous auditons and corrigeons tout ce that empeche Google de comprendre your website",
     "We audit and fix everything preventing Google from understanding your site"),
    ("Nous auditons et corrigeons tout ce qui empeche Google de comprendre votre site",
     "We audit and fix everything preventing Google from understanding your site"),
    ("vitesse de chargement, architecture, indexation, balisage, Core Web Vitals",
     "loading speed, architecture, indexing, markup, Core Web Vitals"),
    ("Un site techniquement parfait, c'is la fondation de tout le reste.",
     "A technically perfect site is the foundation for everything else."),
    ("Un site techniquement parfait, c'est la fondation de tout le reste.",
     "A technically perfect site is the foundation for everything else."),

    ("Dominate local searches in your ville.",
     "Dominate local searches in your city."),
    ("Google Maps, fiche Google Business, avis clients, citations locales",
     "Google Maps, Google Business listing, client reviews, local citations"),
    ("on you rend visible there where your clients you cherchent",
     "we make you visible where your clients are looking"),
    ("on vous rend visible là où vos clients vous cherchent",
     "we make you visible where your clients are looking"),
    ("Idéal for les commerces, restaurants, cabinets and prestataires de services.",
     "Ideal for shops, restaurants, practices and service providers."),
    ("Idéal pour les commerces, restaurants, cabinets et prestataires de services.",
     "Ideal for shops, restaurants, practices and service providers."),

    ("Un diagnostic complet de your site en 50+ points.",
     "A complete diagnostic of your site in 50+ points."),
    ("Un diagnostic complet de votre site en 50+ points.",
     "A complete diagnostic of your site in 50+ points."),
    ("You recevez un plan d'action concret, priorise, with des recommandations claires that you comprenez without être expert.",
     "You receive a concrete, prioritized action plan with clear recommendations you understand without being an expert."),
    ("Vous recevez un plan d'action concret, priorise, avec des recommandations claires que vous comprenez sans être expert.",
     "You receive a concrete, prioritized action plan with clear recommendations you understand without being an expert."),
    ("C'is la première étape for savoir exactement where you en etes.",
     "It's the first step to knowing exactly where you stand."),
    ("C'est la première étape pour savoir exactement où vous en etes.",
     "It's the first step to knowing exactly where you stand."),

    ("Du contenu that plait a Google ET à your lecteurs.",
     "Content that pleases Google AND your readers."),
    ("Du contenu qui plait a Google ET à vos lecteurs.",
     "Content that pleases Google AND your readers."),
    ("Articles de blog, pages de service, guides — each texte is stratégiquement écrit for attirer du traffic qualified and convaincre your visiteurs de passer a l'action.",
     "Blog posts, service pages, guides — each text is strategically written to attract qualified traffic and convince your visitors to take action."),
    ("Articles de blog, pages de service, guides — chaque texte est stratégiquement écrit pour attirer du trafic qualifié et convaincre vos visiteurs de passer a l'action.",
     "Blog posts, service pages, guides — each text is strategically written to attract qualified traffic and convince your visitors to take action."),

    # ===== PROCESS SECTION =====
    ("Nous analysons your site en profondeur : technique, contenu, competition, keywords.",
     "We analyze your site in depth: technical, content, competition, keywords."),
    ("Nous analysons votre site en profondeur : technique, contenu, concurrence, mots-clés.",
     "We analyze your site in depth: technical, content, competition, keywords."),
    ("You recevez un diagnostic complet and un plan d'action clair en 48h.",
     "You receive a complete diagnostic and a clear action plan within 48h."),
    ("Vous recevez un diagnostic complet et un plan d'action clair en 48h.",
     "You receive a complete diagnostic and a clear action plan within 48h."),

    ("On construit your strategy SEO on mesure",
     "We build your custom SEO strategy"),
    ("On construit votre stratégie SEO sur mesure",
     "We build your custom SEO strategy"),
    ("quels keywords viser, quel contenu créer, quels liens obtenir, in quel ordre",
     "which keywords to target, what content to create, which links to get, in what order"),
    ("quels mots-clés viser, quel contenu créer, quels liens obtenir, dans quel ordre",
     "which keywords to target, what content to create, which links to get, in what order"),
    ("Tout is priorise par impact.", "Everything is prioritized by impact."),
    ("Tout est priorise par impact.", "Everything is prioritized by impact."),

    ("Our team execute le plan : corrections techniques, creation de contenu, acquisition de liens.",
     "Our team executes the plan: technical fixes, content creation, link acquisition."),
    ("Notre equipe execute le plan : corrections techniques, creation de contenu, acquisition de liens.",
     "Our team executes the plan: technical fixes, content creation, link acquisition."),
    ("Each mois, on ajuste en fonction results.",
     "Every month, we adjust based on results."),
    ("Chaque mois, on ajuste en fonction des resultats.",
     "Every month, we adjust based on results."),

    ("Les results arrivent. Nous you montrons exactement ce that a change",
     "Results arrive. We show you exactly what changed"),
    ("Les résultats arrivent. Nous vous montrons exactement ce qui a change",
     "Results arrive. We show you exactly what changed"),
    ("quel traffic you gagnez, and quels clients en decoulent.",
     "what traffic you're gaining, and what clients follow."),
    ("quel trafic vous gagnez, et quels clients en decoulent.",
     "what traffic you're gaining, and what clients follow."),
    ("Puis on accelere.", "Then we accelerate."),

    # ===== RESULTS SECTION =====
    ("OUR CLIENTS NE PARLENT NOT DE NOUS.", "OUR CLIENTS DON'T TALK ABOUT US."),
    ("OUR CLIENTS NE PARLENT PAS DE NOUS.", "OUR CLIENTS DON'T TALK ABOUT US."),
    ("LEURS CHIFFRES LE FONT.", "THEIR NUMBERS DO."),

    # ===== COMPARISON TABLE =====
    ("WHY PIRABEL LABS AND NOT A AUTRE AGENCY ?", "WHY PIRABEL LABS AND NOT ANOTHER AGENCY?"),
    ("WHY PIRABEL LABS AND NOT UNE AUTRE AGENCY ?", "WHY PIRABEL LABS AND NOT ANOTHER AGENCY?"),
    ("POURQUOI PIRABEL LABS ET PAS UNE AUTRE AGENCE ?", "WHY PIRABEL LABS AND NOT ANOTHER AGENCY?"),

    # ===== CTA SECTION =====
    ("PRET A DOMINER GOOGLE ?", "READY TO DOMINATE GOOGLE?"),
    ("READY TO DOMINATE GOOGLE ?", "READY TO DOMINATE GOOGLE?"),
    ("Réservez your audit SEO free. En 48h, you saurez exactement where you en are and comment arriver en first page.",
     "Book your free SEO audit. Within 48h, you'll know exactly where you stand and how to reach the first page."),
    ("Réservez votre audit SEO gratuit. En 48h, vous saurez exactement où vous en êtes et comment arriver en première page.",
     "Book your free SEO audit. Within 48h, you'll know exactly where you stand and how to reach the first page."),
    (" or appelez-nous directement", " or call us directly"),
    (" ou appelez-nous directement", " or call us directly"),

    # ===== REMAINING COMMON FRENCH FRAGMENTS =====
    ("Every month, you for money", "Every month, you pour money"),  # fix "pour" -> "for" artifact
    (" in  ", " in "),  # fix double spaces
    ("  ", " "),  # generic double space fix
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
        for old, new in FIXES:
            content = content.replace(old, new)
        if content != original:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(content)
            count += 1

print(f"Final Franglais fixes applied to {count} files")
