#!/usr/bin/env python3
"""
fix-en-homepage.py
------------------
Fixes the broken Franglais in en/index.html by replacing every French or
half-translated string with proper, natural English.

Only visible text content is touched (between HTML tags, meta attributes,
structured data strings). HTML structure, CSS, and JavaScript are NOT modified.
"""

import re

INPUT  = "en/index.html"
OUTPUT = "en/index.html"

# --- Read the file ---
with open(INPUT, "r", encoding="utf-8") as f:
    html = f.read()

# =========================================================================
# REPLACEMENTS
# Each tuple is (old_string, new_string).  We use EXACT substrings from the
# file so that a simple str.replace() works without risking HTML breakage.
# =========================================================================

replacements = [
    # ---------------------------------------------------------------
    #  <title> and meta
    # ---------------------------------------------------------------
    (
        "Pirabel Labs | Digital Agencye Premium — SEO, Web, AI & Automation",
        "Pirabel Labs | Premium Digital Agency — SEO, Web, AI & Automation",
    ),
    (
        'content="Pirabel Labs, your agency digitale premium in Paris, Cotonou and Casablanca. SEO, creation de sites web, IA, automation, branding. Results mesurables. Free audit."',
        'content="Pirabel Labs, your premium digital agency in Paris, Cotonou and Casablanca. SEO, website design, AI, automation, branding. Measurable results. Free audit."',
    ),

    # ---------------------------------------------------------------
    #  Open Graph
    # ---------------------------------------------------------------
    (
        'content="Pirabel Labs | Digital Agencye Premium — SEO, Web, AI & Automation"',
        'content="Pirabel Labs | Premium Digital Agency — SEO, Web, AI & Automation"',
    ),
    (
        'content="Premium digital agency in Paris, Cotonou and Casablanca. SEO, creation de sites web, IA, automation, branding. Resultats mesurables."',
        'content="Premium digital agency in Paris, Cotonou and Casablanca. SEO, website design, AI, automation, branding. Measurable results."',
    ),

    # ---------------------------------------------------------------
    #  Twitter Card
    # ---------------------------------------------------------------
    (
        'content="Pirabel Labs | Digital Agencye Premium"',
        'content="Pirabel Labs | Premium Digital Agency"',
    ),
    (
        'content="SEO, Web, IA, Automation, Branding. Resultats mesurables. Free audit."',
        'content="SEO, Web, AI, Automation, Branding. Measurable results. Free audit."',
    ),

    # ---------------------------------------------------------------
    #  AI & Bing Discovery meta
    # ---------------------------------------------------------------
    (
        'content="Pirabel Labs: Digital agency (SEO, IA, Web) - Data Optimization"',
        'content="Pirabel Labs: Digital agency (SEO, AI, Web) - Data Optimization"',
    ),

    # ---------------------------------------------------------------
    #  Schema.org / JSON-LD  (only the description string)
    # ---------------------------------------------------------------
    (
        '"Agency for digital marketing and technologie bas\u00e9e in Paris, Cotonou and Casablanca. Dominez le digital par le SEO, l\'Artificial Intelligence and le Marketing."',
        '"Digital marketing and technology agency based in Paris, Cotonou and Casablanca. Dominate the digital landscape through SEO, Artificial Intelligence and Marketing."',
    ),
    (
        '"Premium digital agency - SEO, Web, IA, Automation, Branding"',
        '"Premium digital agency - SEO, Web, AI, Automation, Branding"',
    ),

    # ---------------------------------------------------------------
    #  Navigation  (already partially done but some items still French)
    # ---------------------------------------------------------------
    (
        '>AVIS</a>',
        '>REVIEWS</a>',
    ),
    (
        '>CARRI\u00c8RES</a>',
        '>CAREERS</a>',
    ),

    # ---------------------------------------------------------------
    #  HERO section
    # ---------------------------------------------------------------
    (
        "Agency Digital Marketing Premium",
        "Premium Digital Marketing Agency",
    ),
    (
        "<span>L'AGENCE</span>",
        "<span>THE DIGITAL</span>",
    ),
    (
        "<span>DIGITALE</span>",
        "<span>AGENCY</span>",
    ),
    (
        "<span>QUI</span>",
        "<span>THAT</span>",
    ),
    (
        "<span>PROPULSE</span>",
        "<span>PROPELS</span>",
    ),
    (
        "<span>VOTRE</span>",
        "<span>YOUR</span>",
    ),
    (
        '<span style="color:var(--on-surface);">GROWTH.</span>',
        '<span style="color:var(--on-surface);">GROWTH.</span>',
    ),
    # Hero paragraph
    (
        "SEO, creation de sites web, automation IA, advertising digitale, branding — we accompagnons les businesss ambitieuses with solutions custom that g&eacute;n&egrave;rent concrete results and mesurables. De Paris in Cotonou, de Casablanca in Montreal.",
        "SEO, website design, AI automation, digital advertising, branding — we support ambitious businesses with tailor-made solutions that deliver concrete, measurable results. From Paris to Cotonou, from Casablanca to Montreal.",
    ),
    # Hero CTA buttons
    (
        "DOMINER LE MARCHE",
        "DOMINATE THE MARKET",
    ),
    (
        "DECOUVRIR NOS SERVICES",
        "DISCOVER OUR SERVICES",
    ),

    # ---------------------------------------------------------------
    #  MARQUEE TICKER
    # ---------------------------------------------------------------
    (
        "SEO STRATEGIQUE",
        "STRATEGIC SEO",
    ),
    (
        "CREATION DE SITES",
        "WEBSITE DESIGN",
    ),
    (
        "IA & AUTOMATISATION",
        "AI & AUTOMATION",
    ),
    (
        "PUBLICITE DIGITALE",
        "DIGITAL ADVERTISING",
    ),
    (
        "VIDEO & MOTION",
        "VIDEO & MOTION",
    ),

    # ---------------------------------------------------------------
    #  PAIN POINTS section heading
    # ---------------------------------------------------------------
    (
        "POURQUOI VOTRE BUSINESS <span class=\"text-primary glitch-hover\" style=\"font-style:italic;\">STAGNE ?</span>",
        "WHY IS YOUR BUSINESS <span class=\"text-primary glitch-hover\" style=\"font-style:italic;\">STALLING?</span>",
    ),
    # Pain card 1
    (
        "Your website is invisible",
        "Your website is invisible",
    ),
    (
        "Vos competitors apparaissent en premier on Google and you're losing clients each jour. Your website existe, but personne ne le trouve quand il cherche your services.",
        "Your competitors appear first on Google and you lose clients every day. Your website exists, but no one finds it when they search for your services.",
    ),
    # Pain card 2
    (
        "Votre traffic ne bouge plus",
        "Your traffic has flatlined",
    ),
    (
        "Vous avez investi in un beau site, but les visiteurs ne viennent pas. Le compteur de visites reste d\u00e9sesp\u00e9r\u00e9ment plat malgre your efforts.",
        "You invested in a great-looking website, but visitors simply aren't coming. The visitor counter stays desperately flat despite all your efforts.",
    ),
    # Pain card 3
    (
        "Vous brulez du budget pub",
        "You're burning through ad budget",
    ),
    (
        "Each mois, you remettez de l'argent in Google Ads for avoir clients. Sans budget pub, more rien ne rentre. Vous etes pris en otage.",
        "Every month you pour more money into Google Ads just to get clients. Without ad spend, nothing comes in. You're held hostage.",
    ),
    # Pain card 4
    (
        "Votre ancienne agency a \u00e9chou\u00e9",
        "Your previous agency failed you",
    ),
    (
        "Vous avez deja paye an agency. 6 mois more tard : aucun resultat concret, rapports incomprehensibles, and a confiance brisee.",
        "You already paid an agency. 6 months later: no concrete results, incomprehensible reports, and broken trust.",
    ),
    # Pain card 5
    (
        "Vous perdez du temps",
        "You're wasting time",
    ),
    (
        "Vous g\u00e9rez tout vous-meme \u2014 r\u00e9seaux sociaux, site, emails \u2014 without strategy claire. Vos journees are pleines but les results ne suivent pas.",
        "You handle everything yourself \u2014 social media, website, emails \u2014 without a clear strategy. Your days are packed but the results don't follow.",
    ),
    # Pain card 6
    (
        "Vos donnees are inexploit\u00e9es",
        "Your data is untapped",
    ),
    (
        "Vous ne savez not d'ou viennent your clients, quelles pages fonctionnent, nor pourquoi certains visiteurs n'achetent pas. Vous naviguez a vue.",
        "You don't know where your clients come from, which pages perform, or why some visitors never buy. You're flying blind.",
    ),

    # ---------------------------------------------------------------
    #  VALUE PROPOSITION + STATS
    # ---------------------------------------------------------------
    (
        "NOUS NE SOMMES PAS UNE AGENCE CLASSIQUE.<br><span class=\"text-primary\">NOUS SOMMES VOTRE PARTENAIRE DE GROWTH.</span>",
        "WE'RE NOT A TYPICAL AGENCY.<br><span class=\"text-primary\">WE'RE YOUR GROWTH PARTNER.</span>",
    ),
    (
        "Depuis our creation, we avons propulse more de 150 businesss vers la reussite digitale. Our approach is strategic, transparente and orientee results. Pas de jargon, not de promesses in the air \u2014 chiffres that parlent.",
        "Since our founding, we have propelled over 150 businesses to digital success. Our approach is strategic, transparent and results-driven. No jargon, no empty promises \u2014 just numbers that speak for themselves.",
    ),
    # Stat labels
    (
        "Trafic organique moyen",
        "Average organic traffic",
    ),
    (
        "Projets livres",
        "Projects delivered",
    ),
    # Value prop sub-headings and descriptions
    (
        "SEO & Organic Search",
        "SEO & Organic Search",
    ),
    (
        "Vous apparaissez en premier on Google quand your clients cherchent your services. Plus de traffic qualifie, moins de d\u00e9pendance a la pub.",
        "You appear first on Google when your clients search for your services. More qualified traffic, less dependence on ads.",
    ),
    (
        "Website Creation",
        "Website Design",
    ),
    (
        "Des sites rapides, beaux and that convertissent your visiteurs en clients. Webflow, WordPress, Shopify \u2014 on maitrise each plateforme.",
        "Fast, beautiful websites that convert your visitors into clients. Webflow, WordPress, Shopify \u2014 we master every platform.",
    ),
    (
        "AI & Automation",
        "AI & Automation",
    ),
    (
        "Gagnez heures each semaine grace a l'automation intelligente. Chatbots, workflows Make/N8N, agents IA custom for your business.",
        "Save hours every week with intelligent automation. Chatbots, Make/N8N workflows, custom AI agents tailored to your business.",
    ),

    # ---------------------------------------------------------------
    #  SERVICES section
    # ---------------------------------------------------------------
    (
        "NOS EXPERTISES",
        "OUR EXPERTISE",
    ),
    # Service 1
    (
        "SEO & ORGANIC SEO",
        "SEO & ORGANIC SEARCH",
    ),
    (
        "You deserve d'be trouv&eacute; on Google. We get you to the first page with a custom strategy, without raccourcis.",
        "You deserve to be found on Google. We get you to the first page with a tailored strategy, no shortcuts.",
    ),
    # Service 2
    (
        "CREATION DE SITES WEB",
        "WEBSITE DESIGN",
    ),
    (
        "Des sites performants that convertissent. Webflow, WordPress, Shopify or custom \u2014 each projet is unique, like your business.",
        "High-performance websites that convert. Webflow, WordPress, Shopify or custom \u2014 every project is unique, just like your business.",
    ),
    # Service 3
    (
        "IA & AUTOMATISATION",
        "AI & AUTOMATION",
    ),
    (
        "Gagnez du temps and l'argent. On automatise your processus repetitifs with Make, N8N, Zapier ands agents IA custom.",
        "Save time and money. We automate your repetitive processes with Make, N8N, Zapier and custom AI agents.",
    ),
    # Service 4
    (
        "PUBLICITE PAYANTE (SEA & ADS)",
        "PAID ADVERTISING (SEA & ADS)",
    ),
    (
        "Des campagnes Google Ads, Meta Ads, TikTok and LinkedIn that rapportent more qu'elles ne coutent. Each euro investi is mesure.",
        "Google Ads, Meta Ads, TikTok and LinkedIn campaigns that bring back more than they cost. Every dollar invested is tracked.",
    ),
    # Service 5  (heading "SOCIAL MEDIA" is already English)
    (
        "Construisez a communaut\u00e9 engag\u00e9e autour de your marque. Strategy, contenu, community management and influence marketing.",
        "Build an engaged community around your brand. Strategy, content, community management and influencer marketing.",
    ),
    # Service 6  (heading "DESIGN & BRANDING" already English)
    (
        "Une visual identity forte that you diff\u00e9rencie. Logo, brand guidelines, direction artistique \u2014 on donne vie a your vision.",
        "A strong visual identity that sets you apart. Logo, brand guidelines, art direction \u2014 we bring your vision to life.",
    ),
    # "See all services" button
    (
        "Voir tous our services",
        "View all our services",
    ),

    # ---------------------------------------------------------------
    #  PROCESS section
    # ---------------------------------------------------------------
    (
        "LE PROCESSUS <span class=\"text-accent\">PIRABEL</span>",
        "THE <span class=\"text-accent\">PIRABEL</span> PROCESS",
    ),
    # Step 1
    (
        ">Immersion</h5>",
        ">Immersion</h5>",
    ),
    (
        "On apprend your metier, your objectifs and your competition for comprendre your realite.",
        "We learn your business, your goals and your competition to understand your reality.",
    ),
    # Step 2
    (
        "Audit compland your presence digitale and identification opportunites immediates.",
        "Full audit of your digital presence and identification of immediate opportunities.",
    ),
    # Step 3
    (
        ">Strategy</h5>",
        ">Strategy</h5>",
    ),
    (
        "On construit your plan d'action personnalis\u00e9 with objectifs clairs and mesurables.",
        "We build your personalized action plan with clear, measurable objectives.",
    ),
    # Step 4
    (
        "Deploiement m\u00e9thodique de each action. Vous etes informe a each \u00e9tape.",
        "Methodical deployment of every action. You're kept informed at every step.",
    ),
    # Step 5
    (
        ">Croissance</h5>",
        ">Growth</h5>",
    ),
    (
        "Suivi continu, optimisation and expansion. Your growth is our obsession.",
        "Continuous monitoring, optimization and expansion. Your growth is our obsession.",
    ),

    # ---------------------------------------------------------------
    #  RESULTS / CASE STUDIES
    # ---------------------------------------------------------------
    (
        "PREUVES<br><span class=\"text-primary\" style=\"font-style:italic;\">CONCRETES</span>",
        "PROVEN<br><span class=\"text-primary\" style=\"font-style:italic;\">RESULTS</span>",
    ),
    (
        "Selection 2025",
        "Selection 2025",
    ),
    # Case study 1
    (
        "E-COMMERCE MODE",
        "FASHION E-COMMERCE",
    ),
    (
        "+310% qualified leads in 6 months",
        "+310% qualified leads in 6 months",
    ),
    (
        "Refonte complete de l'architecture de contenu and strategy de cocon s\u00e9mantique. Le client a pu reduire son budget pub de 40%.",
        "Complete overhaul of the content architecture and topic cluster strategy. The client was able to reduce their ad budget by 40%.",
    ),
    # Case study 2
    (
        "CABINET IMMOBILIER",
        "REAL ESTATE FIRM",
    ),
    (
        "Position #1 on 45 mots-cles locaux",
        "Position #1 on 45 local keywords",
    ),
    (
        "Strategy SEO local and Google Business optimise. Les demandes de visites ont triple en 4 mois.",
        "Local SEO strategy and optimized Google Business profile. Property viewing requests tripled in 4 months.",
    ),
    # Case study 3
    (
        "Top 3 mondial on 150+ keywords",
        "Top 3 worldwide on 150+ keywords",
    ),
    (
        "Optimisation SEO technique avancee and strategy de contenu expert. Le cout d'acquisition client divise par 3.",
        "Advanced technical SEO optimization and expert content strategy. Customer acquisition cost cut by a factor of 3.",
    ),

    # ---------------------------------------------------------------
    #  TESTIMONIALS
    # ---------------------------------------------------------------
    (
        '"Pirabel Labs a transforme our online visibility. En 6 mois, our organic traffic a depasse our campagnes payantes."',
        '"Pirabel Labs transformed our online visibility. In 6 months, our organic traffic surpassed our paid campaigns."',
    ),
    (
        '"On avait tout essaye avant. Deux agences, un freelance. Pirabel Labs a ete les premiers a tenir leurs promesses."',
        '"We had tried everything before. Two agencies, a freelancer. Pirabel Labs was the first to keep their promises."',
    ),
    (
        "Directrice Marketing, Zenly",
        "Marketing Director, Zenly",
    ),
    (
        "\"Le meilleur investissement marketing qu'on ait fait. Notre cout d'acquisition divise par 3.\"",
        '"The best marketing investment we ever made. Our acquisition cost cut by a factor of 3."',
    ),

    # ---------------------------------------------------------------
    #  COMPARISON TABLE
    # ---------------------------------------------------------------
    (
        "PIRABEL <span class=\"text-primary\">VS</span> LES AUTRES",
        "PIRABEL <span class=\"text-primary\">VS</span> THE REST",
    ),
    (
        "FONCTIONNALITE",
        "FEATURE",
    ),
    (
        "AGENCE CLASSIQUE",
        "TYPICAL AGENCY",
    ),
    (
        "Garantie de results",
        "Results guarantee",
    ),
    (
        "Contractuelle",
        "Contractual",
    ),
    (
        "Aucune",
        "None",
    ),
    (
        "Rapports comprehensibles",
        "Understandable reports",
    ),
    (
        "En langage clair",
        "In plain language",
    ),
    (
        "Jargon technique",
        "Technical jargon",
    ),
    (
        "Contenu expert",
        "Expert content",
    ),
    (
        "IA non corrigee",
        "Unreviewed AI",
    ),
    (
        "Support reactif",
        "Responsive support",
    ),
    (
        "Response within 24h",
        "Response within 24h",
    ),
    (
        "Delais variables",
        "Variable delays",
    ),

    # ---------------------------------------------------------------
    #  PRICING
    # ---------------------------------------------------------------
    (
        "INVESTISSEZ DANS VOTRE <span class=\"text-primary\">EMPIRE.</span>",
        "INVEST IN YOUR <span class=\"text-primary\">EMPIRE.</span>",
    ),
    # Foundation tier
    (
        ">Fondation</h4>",
        ">Foundation</h4>",
    ),
    (
        "Audit technique initial",
        "Initial technical audit",
    ),
    (
        "Optimisation on-page",
        "On-page optimization",
    ),
    (
        "4 articles / mois",
        "4 articles / month",
    ),
    (
        "Reporting mensuel",
        "Monthly reporting",
    ),
    (
        "Choisir ce plan",
        "Choose this plan",
    ),
    # Growth tier
    (
        "Le more demande",
        "Most popular",
    ),
    (
        ">Croissance</h4>",
        ">Growth</h4>",
    ),
    (
        "Strategy complete",
        "Full strategy",
    ),
    (
        "8 articles / mois",
        "8 articles / month",
    ),
    (
        "ROI tracking avance",
        "Advanced ROI tracking",
    ),
    (
        "Chef de projet dedicated",
        "Dedicated project manager",
    ),
    (
        "Prendre le controle",
        "Take control",
    ),
    # Enterprise tier
    (
        "Sur Mesure",
        "Custom",
    ),
    (
        "SEO multi-langue",
        "Multi-language SEO",
    ),
    (
        "Migration accompagnee",
        "Guided migration",
    ),
    (
        "Account manager dedicated",
        "Dedicated account manager",
    ),
    (
        "Strategy 360",
        "360 strategy",
    ),
    (
        ">Contact us</a>",
        ">Contact us</a>",
    ),

    # ---------------------------------------------------------------
    #  GUIDES
    # ---------------------------------------------------------------
    (
        "NOS GUIDES <span class=\"text-muted\">/ SAVOIR</span>",
        "OUR GUIDES <span class=\"text-muted\">/ KNOWLEDGE</span>",
    ),
    (
        "Le guide complet du SEO for debutants",
        "The complete SEO guide for beginners",
    ),
    (
        "Guide free",
        "Free guide",
    ),
    (
        "Automation marketing with l'IA",
        "Marketing automation with AI",
    ),
    (
        "Webflow vs WordPress : quel CMS ?",
        "Webflow vs WordPress: which CMS?",
    ),
    (
        "Comparatif",
        "Comparison",
    ),
    (
        "Anatomie d'une landing page parfaite",
        "Anatomy of the perfect landing page",
    ),

    # ---------------------------------------------------------------
    #  FAQ
    # ---------------------------------------------------------------
    (
        "QUESTIONS<br><span class=\"text-primary\" style=\"font-style:italic;\">FREQUENTES</span>",
        "FREQUENTLY<br><span class=\"text-primary\" style=\"font-style:italic;\">ASKED QUESTIONS</span>",
    ),
    # FAQ Q1
    (
        "Combien de temps avant de voir results ?",
        "How long before we see results?",
    ),
    (
        "Les premiers gains are souvent visibles sous 30 jours for les optimisations techniques. Pour un positionnement solide en first page, comptez 3 a 6 mois depending on your industry competition.",
        "The first gains are often visible within 30 days for technical optimizations. For a solid first-page ranking, expect 3 to 6 months depending on the competition in your industry.",
    ),
    # FAQ Q2
    (
        "Est-ce that you travaillez with tous types d'businesss ?",
        "Do you work with all types of businesses?",
    ),
    (
        "Oui. Startup, PME or grande business, we adaptons our approach. Nous travaillons with clients in Paris, Cotonou, Casablanca, Dakar, Bruxelles and Montreal.",
        "Yes. Startup, SME or large corporation, we adapt our approach. We work with clients in Paris, Cotonou, Casablanca, Dakar, Brussels and Montreal.",
    ),
    # FAQ Q3
    (
        "Quelle diff\u00e9rence between SEO and paid advertising ?",
        "What is the difference between SEO and paid advertising?",
    ),
    (
        "La advertising you apporte du traffic tant that you payez. SEO builds a lasting asset : a fois bien positionne, your website attire du traffic freeement pendant mois voire annees.",
        "Paid advertising brings you traffic as long as you pay. SEO builds a lasting asset: once well ranked, your website attracts traffic for free for months or even years.",
    ),
    # FAQ Q4
    (
        "Que comprend your audit free ?",
        "What does your free audit include?",
    ),
    (
        "Analyse de your visibility actuelle, technical diagnostic, etude de your competitors and recommandations concretes. Vous recevez un document clair with actions prioritaires.",
        "Analysis of your current visibility, technical diagnostic, competitor study and concrete recommendations. You receive a clear document with prioritized action items.",
    ),

    # ---------------------------------------------------------------
    #  CTA FINAL
    # ---------------------------------------------------------------
    (
        "PRET A DEVENIR<br>INCONTOURNABLE ?",
        "READY TO BECOME<br>UNSTOPPABLE?",
    ),
    (
        "Reservez your audit strategic free with un de our experts. C'est offert, without engagement.",
        "Book your free strategic audit with one of our experts. It's complimentary, no strings attached.",
    ),
    (
        'placeholder="Your email professionnel"',
        'placeholder="Your business email"',
    ),
    (
        "Lancer l'audit",
        "Start the audit",
    ),

    # ---------------------------------------------------------------
    #  NEWSLETTER
    # ---------------------------------------------------------------
    # "Stay informed" is already good
    (
        "Recevez our guides, conseils and actualit&eacute;s directement in your bo&icirc;te mail. No spam, only value.",
        "Receive our guides, tips and news straight to your inbox. No spam, only value.",
    ),
    (
        '&check; Inscription r&eacute;ussie !',
        '&check; Successfully subscribed!',
    ),

    # ---------------------------------------------------------------
    #  FOOTER
    # ---------------------------------------------------------------
    (
        "The premium digital agency for your growth. Nous construisons les standards de demain for les businesss les more ambitieuses.",
        "The premium digital agency powering your growth. We build tomorrow's standards for the most ambitious businesses.",
    ),
    # Footer service links
    (
        ">SEO & SEO</a>",
        ">SEO & Organic Search</a>",
    ),
    (
        ">Creation de Sites</a>",
        ">Website Design</a>",
    ),
    (
        ">AI & Automation</a>",
        ">AI & Automation</a>",
    ),
    (
        ">Advertising Payante</a>",
        ">Paid Advertising</a>",
    ),
    # Footer bottom
    (
        "Confidentialit&eacute;",
        "Privacy Policy",
    ),

    # ---------------------------------------------------------------
    #  Currency: keep EUR but translate /mois
    # ---------------------------------------------------------------
    (
        "/mois",
        "/mo",
    ),
]

# =========================================================================
# Apply every replacement
# =========================================================================
count = 0
for old, new in replacements:
    if old == new:
        continue  # skip identity replacements
    if old in html:
        html = html.replace(old, new)
        count += 1
    else:
        print(f"  [WARN] Not found: {old[:80]}...")

# =========================================================================
# Write output
# =========================================================================
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(html)

print(f"\nDone. Applied {count} replacements to {OUTPUT}.")
