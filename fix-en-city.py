#!/usr/bin/env python3
"""Fix remaining French text in /en/ city and service pages."""
import os

EN_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "en")

# All remaining FR->EN replacements found in city/service pages
FIXES = [
    # Double-translation artifacts
    ("Website Creation Web", "Website Creation"),
    ("Sites Web", "Websites"),

    # Meta tags
    ("agence Sites Web a", "web agency in"),
    ("agence SEO a", "SEO agency in"),
    ("agence Design a", "design agency in"),
    ("agence IA a", "AI agency in"),
    ("agence Social Media a", "social media agency in"),
    ("agence Video a", "video agency in"),
    ("agence Email a", "email agency in"),

    # City page body text - templated phrases
    ("Vous cherchez une agence", "Looking for an agency"),
    ("qui comprend votre march&eacute; ?", "that understands your market?"),
    ("qui comprend votre marché ?", "that understands your market?"),
    ("Pirabel Labs accompagn&eacute; businesses in", "Pirabel Labs supports businesses in"),
    ("Pirabel Labs accompagné businesses in", "Pirabel Labs supports businesses in"),
    ("Pirabel Labs accompagne les entreprises de", "Pirabel Labs supports businesses in"),
    ("Pirabel Labs accompagne les entreprises", "Pirabel Labs supports businesses"),
    ("la capitale francaise, hub europeen du business", "the French capital, European business hub"),
    ("la capitale fran&ccedil;aise, hub europ&eacute;en du business", "the French capital, European business hub"),
    ("capitale economique du", "economic capital of"),
    ("capitale &eacute;conomique du", "economic capital of"),
    ("Nous connaissons les specificites du marché local et adaptons notre stratégie à votre realite.",
     "We understand the specifics of the local market and adapt our strategy to your reality."),
    ("Nous connaissons les sp&eacute;cificit&eacute;s du march&eacute; local et adaptons notre strat&eacute;gie &agrave; votre r&eacute;alit&eacute;.",
     "We understand the specifics of the local market and adapt our strategy to your reality."),
    ("Que vous soyez une startup, une PME ou une grande entreprise a", "Whether you're a startup, SME or large enterprise in"),
    ("Que vous soyez une startup, une PME ou une grande entreprise &agrave;", "Whether you're a startup, SME or large enterprise in"),
    ("nous avons l expertise pour atteindre vos objectifs digitaux.", "we have the expertise to achieve your digital goals."),
    ("nous avons l&rsquo;expertise pour atteindre vos objectifs digitaux.", "we have the expertise to achieve your digital goals."),
    ("Our results sont mesurables et notre accompagnement est personnalisé.",
     "Our results are measurable and our support is personalized."),
    ("Our results sont mesurables et notre accompagnement est personnalis&eacute;.",
     "Our results are measurable and our support is personalized."),
    ("Nos résultats sont mesurables et notre accompagnement est personnalisé.",
     "Our results are measurable and our support is personalized."),

    # City CTA
    ("Free audit a ", "Free audit in "),
    ("Free audit &agrave; ", "Free audit in "),
    ("Audit gratuit a ", "Free audit in "),
    ("Our services Sites Web", "Our website services"),
    ("Our services SEO", "Our SEO services"),
    ("Nos services Sites Web", "Our website services"),
    ("Nos services SEO", "Our SEO services"),
    ("Nos services Design", "Our design services"),
    ("Nos services IA", "Our AI services"),

    # Marquee
    ("AGENCE ", "AGENCY "),
    ("Sites Web ", "Websites "),

    # Pain points section
    ("The problem a ", "The problem in "),
    ("Le probl&egrave;me a ", "The problem in "),
    ("Le problème a ", "The problem in "),
    ("POURQUOI LES ENTREPRISES DE", "WHY BUSINESSES IN"),
    ("NOUS FONT CONFIANCE", "TRUST US"),
    ("Le marché de", "The market of"),
    ("Le march&eacute; de", "The market of"),
    ("a ses propres defis.", "has its own challenges."),
    ("a ses propres d&eacute;fis.", "has its own challenges."),
    ("Voici les problèmes que nous resolvons pour nos clients locaux.",
     "Here are the problems we solve for our local clients."),
    ("Voici les probl&egrave;mes que nous r&eacute;solvons pour nos clients locaux.",
     "Here are the problems we solve for our local clients."),
    ("Votre site ne represente pas votre qualité", "Your website doesn't represent your quality"),
    ("Votre site ne repr&eacute;sente pas votre qualit&eacute;", "Your website doesn't represent your quality"),
    ("La concurrence a", "Competition in"),
    ("La concurrence &agrave;", "Competition in"),
    ("est forte. Sans stratégie adaptée, vous restez invisible.",
     "is fierce. Without an adapted strategy, you stay invisible."),
    ("est forte. Sans strat&eacute;gie adapt&eacute;e, vous restez invisible.",
     "is fierce. Without an adapted strategy, you stay invisible."),
    ("Nous analysons votre marché local et mettons en place les actions qui vous font sortir du lot.",
     "We analyze your local market and implement actions that make you stand out."),
    ("Nous analysons votre march&eacute; local et mettons en place les actions qui vous font sortir du lot.",
     "We analyze your local market and implement actions that make you stand out."),
    ("Votre site est lent et pas mobile-friendly", "Your website is slow and not mobile-friendly"),
    ("Nous identifions les vrais leviers de croissance pour votre secteur a",
     "We identify the real growth levers for your sector in"),
    ("Nous identifions les vrais leviers de croissance pour votre secteur &agrave;",
     "We identify the real growth levers for your sector in"),
    ("et deployons une stratégie qui genere des résultats concrets et mesurables.",
     "and deploy a strategy that generates concrete and measurable results."),
    ("et d&eacute;ployons une strat&eacute;gie qui g&eacute;n&egrave;re des r&eacute;sultats concrets et mesurables.",
     "and deploy a strategy that generates concrete and measurable results."),
    ("Impossible de modifier sans developpeur", "Impossible to modify without a developer"),
    ("Impossible de modifier sans d&eacute;veloppeur", "Impossible to modify without a developer"),
    ("Our team prend en charge votre stratégie", "Our team takes charge of your"),
    ("Our team prend en charge votre strat&eacute;gie", "Our team takes charge of your"),
    ("Notre équipe prend en charge votre stratégie", "Our team takes charge of your"),
    ("pour que vous puissiez vous concentrer sur votre coeur de metier a",
     "strategy so you can focus on your core business in"),
    ("pour que vous puissiez vous concentrer sur votre c&oelig;ur de m&eacute;tier &agrave;",
     "strategy so you can focus on your core business in"),

    # Expertise section
    ("Notre expertise a ", "Our expertise in "),
    ("Notre expertise &agrave; ", "Our expertise in "),
    ("UNE AGENCE QUI CONNAIT", "AN AGENCY THAT KNOWS"),
    ("UNE AGENCE QUI CONNA&Icirc;T", "AN AGENCY THAT KNOWS"),
    ("Nous connaissons le marché de", "We understand the market of"),
    ("Nous connaissons le march&eacute; de", "We understand the market of"),
    ("ses specificites economiques et ses habitudes de consommation.",
     "its economic specificities and consumer habits."),
    ("ses sp&eacute;cificit&eacute;s &eacute;conomiques et ses habitudes de consommation.",
     "its economic specificities and consumer habits."),
    ("Les entreprises locales ont besoin d un partenaire digital qui comprend ces realites.",
     "Local businesses need a digital partner who understands these realities."),
    ("Les entreprises locales ont besoin d&rsquo;un partenaire digital qui comprend ces r&eacute;alit&eacute;s.",
     "Local businesses need a digital partner who understands these realities."),
    ("Our approach combine expertise technique et connaissance du terrain.",
     "Our approach combines technical expertise and on-the-ground knowledge."),
    ("Nous travaillons avec des entreprises de", "We work with businesses in"),
    ("dans divers secteurs : commerce, services, industrie, tech, restauration, immobilier et bien d autres.",
     "across sectors: retail, services, industry, tech, restaurants, real estate and more."),
    ("dans divers secteurs : commerce, services, industrie, tech, restauration, immobilier et bien d&rsquo;autres.",
     "across sectors: retail, services, industry, tech, restaurants, real estate and more."),
    ("Chaque stratégie est construite tailored pour votre entreprise, votre secteur et votre marché local. Pas de formule toute faite.",
     "Each strategy is custom-built for your business, your sector, and your local market. No cookie-cutter formulas."),
    ("Chaque strat&eacute;gie est construite tailored pour votre entreprise, votre secteur et votre march&eacute; local. Pas de formule toute faite.",
     "Each strategy is custom-built for your business, your sector, and your local market. No cookie-cutter formulas."),

    # Stats
    ("Clients a ", "Clients in "),
    ("Clients &agrave; ", "Clients in "),

    # Cross-links
    ("NOS SERVICES A ", "OUR SERVICES IN "),
    ("NOS SERVICES &Agrave; ", "OUR SERVICES IN "),
    ("First page of Google a ", "First page of Google in "),
    ("First page of Google &agrave; ", "First page of Google in "),
    ("Communaute engagee.", "Engaged community."),
    ("Communaut&eacute; engag&eacute;e.", "Engaged community."),
    (">Sites Web</h3>", ">Web</h3>"),
    (">IA &amp; Auto</h3>", ">AI &amp; Auto</h3>"),
    (">IA & Auto</h3>", ">AI & Auto</h3>"),
    (">Publicité</h3>", ">Advertising</h3>"),
    (">Publicit&eacute;</h3>", ">Advertising</h3>"),

    # FAQ section
    ("FREQUENTLY FREQUENTES", "FREQUENTLY ASKED QUESTIONS"),
    ("QUESTIONS FREQUENTES", "FREQUENTLY ASKED QUESTIONS"),
    ("Pourquoi choisir Pirabel Labs a ", "Why choose Pirabel Labs in "),
    ("Pourquoi choisir Pirabel Labs &agrave; ", "Why choose Pirabel Labs in "),
    ("We combine technical expertise and knowledge of the market de", "We combine technical expertise and knowledge of the"),
    ("Our results sont mesurables et nous nous engageons sur des objectifs précis.",
     "Our results are measurable and we commit to specific goals."),
    ("Avez-vous des équipes a ", "Do you have teams in "),
    ("Avez-vous des &eacute;quipes &agrave; ", "Do you have teams in "),
    ("Nous couvrons", "We cover"),
    ("et toute la region", "and the entire"),
    ("et toute la r&eacute;gion", "and the entire"),
    ("Nos équipes sont disponibles en presentiel et en visio.",
     "Our teams are available in person and via video call."),
    ("Nos &eacute;quipes sont disponibles en pr&eacute;sentiel et en visio.",
     "Our teams are available in person and via video call."),
    ("Combien coute une prestation a ", "How much does a service cost in "),
    ("Combien co&ucirc;te une prestation &agrave; ", "How much does a service cost in "),
    ("Combien de temps pour voir des résultats ?", "How long to see results?"),

    # CTA
    ("PRET A DOMINER LE DIGITAL A ", "READY TO DOMINATE DIGITAL IN "),
    ("PR&Ecirc;T &Agrave; DOMINER LE DIGITAL &Agrave; ", "READY TO DOMINATE DIGITAL IN "),
    ("PRET A DOMINER LE DIGITAL A", "READY TO DOMINATE DIGITAL IN"),

    # Remaining common French
    ("Nos clients", "Our clients"),
    ("Nos services", "Our services"),
    ("Nos expertises", "Our expertise"),
    ("nos experts", "our experts"),
    ("Des experts passionnés", "Passionate experts"),
    ("Des experts passion&eacute;s", "Passionate experts"),
    ("Chaque service est personnalisé", "Each service is customized"),
    ("Chaque service est personnalis&eacute;", "Each service is customized"),
    ("Voir ce service", "View this service"),

    # Sub-service page patterns (e.g. agence-creation-sites-web/wordpress/)
    ("Création de sites", "Website creation"),
    ("Cr&eacute;ation de sites", "Website creation"),
    ("Référencement naturel", "Organic search"),
    ("R&eacute;f&eacute;rencement naturel", "Organic search"),
    ("Publicité payante", "Paid advertising"),
    ("Publicit&eacute; payante", "Paid advertising"),
    ("Vidéo et motion design", "Video and motion design"),
    ("Vid&eacute;o et motion design", "Video and motion design"),
    ("Rédaction et content", "Writing and content"),
    ("R&eacute;daction et content", "Writing and content"),
    ("Marketing par email", "Email marketing"),
    ("Entonnoirs de vente", "Sales funnels"),
    ("Intelligence artificielle", "Artificial intelligence"),

    # Remaining island words
    (" a Paris", " in Paris"),
    (" a Lyon", " in Lyon"),
    (" a Marseille", " in Marseille"),
    (" a Cotonou", " in Cotonou"),
    (" a Casablanca", " in Casablanca"),
    (" a Dakar", " in Dakar"),
    (" a Abidjan", " in Abidjan"),
    (" a Tunis", " in Tunis"),
    (" a Bruxelles", " in Brussels"),
    (" a Montréal", " in Montreal"),
    (" a Montr&eacute;al", " in Montreal"),
    (" a Montreal", " in Montreal"),
    (" &agrave; Paris", " in Paris"),
    (" &agrave; Lyon", " in Lyon"),
    (" &agrave; Marseille", " in Marseille"),
    (" &agrave; Cotonou", " in Cotonou"),
    (" &agrave; Casablanca", " in Casablanca"),
    (" &agrave; Dakar", " in Dakar"),
    (" &agrave; Abidjan", " in Abidjan"),
    (" &agrave; Tunis", " in Tunis"),
    (" &agrave; Bruxelles", " in Brussels"),
    (" &agrave; Montr&eacute;al", " in Montreal"),
    ("de France", "region. France"),
    ("du Bénin", "region. Benin"),
    ("du B&eacute;nin", "region. Benin"),
    ("du Maroc", "region. Morocco"),
    ("du Sénégal", "region. Senegal"),
    ("du S&eacute;n&eacute;gal", "region. Senegal"),
    ("de Côte d'Ivoire", "region. Ivory Coast"),
    ("de C&ocirc;te d&#39;Ivoire", "region. Ivory Coast"),
    ("de Tunisie", "region. Tunisia"),
    ("de Belgique", "region. Belgium"),
    ("du Canada", "region. Canada"),
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
        for fr, en in FIXES:
            content = content.replace(fr, en)

        if content != original:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(content)
            count += 1

print(f"Fixed {count} files")
