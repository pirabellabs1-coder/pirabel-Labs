#!/usr/bin/env python3
"""Rebuild ALL English pages from current French pages.
1. Copy each FR .html to /en/ equivalent
2. Fix relative paths (add ../  for the extra /en/ depth)
3. Translate visible text FR->EN
4. Set lang="en", fix canonical/hreflang/og URLs
"""
import os, re, shutil

BASE = os.path.dirname(os.path.abspath(__file__))
EN_DIR = os.path.join(BASE, 'en')
DOMAIN = "https://www.pirabellabs.com"

SKIP_DIRS = {'app', 'en', 'node_modules', '.git', 'espace-client-4p8w1n',
             'pirabel-admin-7x9k2m', 'api', 'Projet A', 'projet claude B',
             'public', 'css', 'img', 'fonts', '.well-known'}
SKIP_FILES = {'Projet A.html', 'status.html'}

# ============================================================
# TRANSLATION PAIRS (FR -> EN) — ordered longest first to avoid partial matches
# ============================================================
TRANSLATIONS = [
    # ---- NAV ----
    ("Accueil", "Home"),
    ("Services", "Services"),
    ("Blog", "Blog"),
    ("Guides", "Guides"),
    (">Résultats<", ">Results<"),
    (">R&eacute;sultats<", ">Results<"),
    ("Résultats", "Results"),
    ("R&eacute;sultats", "Results"),
    ("À propos", "About"),
    ("&Agrave; propos", "About"),
    ("A propos", "About"),
    ("Mon Espace", "My Account"),
    ("Mon espace", "My Account"),
    ("Audit SEO Gratuit", "Free SEO Audit"),
    ("Audit SEO gratuit", "Free SEO audit"),
    ("Audit gratuit", "Free audit"),

    # ---- FOOTER / NEWSLETTER ----
    ("Tous droits réservés", "All rights reserved"),
    ("Tous droits r&eacute;serv&eacute;s", "All rights reserved"),
    ("Mentions légales", "Legal Notice"),
    ("Mentions l&eacute;gales", "Legal Notice"),
    ("Politique de confidentialité", "Privacy Policy"),
    ("Politique de confidentialit&eacute;", "Privacy Policy"),
    ("Restez informé des dernières tendances", "Stay informed about the latest trends"),
    ("Restez inform&eacute; des derni&egrave;res tendances", "Stay informed about the latest trends"),
    ("Votre email", "Your email"),
    ("S'inscrire", "Subscribe"),
    ("S&#39;inscrire", "Subscribe"),
    ("Inscription réussie", "Successfully subscribed"),
    ("Recevez nos conseils exclusifs", "Receive our exclusive tips"),
    ("Newsletter", "Newsletter"),
    ("Nous contacter", "Contact us"),
    ("Nos services", "Our services"),
    ("Liens rapides", "Quick links"),
    ("Contactez-nous", "Contact us"),
    ("Contactez nous", "Contact us"),
    ("Nous suivre", "Follow us"),

    # ---- CTA BUTTONS ----
    ("Demander un devis gratuit", "Request a free quote"),
    ("Demander un devis", "Request a quote"),
    ("Obtenir mon audit gratuit", "Get my free audit"),
    ("Obtenir un devis gratuit", "Get a free quote"),
    ("Obtenir un devis", "Get a quote"),
    ("Réserver un appel stratégique", "Book a strategy call"),
    ("R&eacute;server un appel strat&eacute;gique", "Book a strategy call"),
    ("Réserver un appel", "Book a call"),
    ("R&eacute;server un appel", "Book a call"),
    ("Voir nos résultats", "See our results"),
    ("Voir nos r&eacute;sultats", "See our results"),
    ("Voir nos services", "See our services"),
    ("Voir les résultats", "See the results"),
    ("Découvrir nos services", "Discover our services"),
    ("D&eacute;couvrir nos services", "Discover our services"),
    ("Découvrir nos guides", "Discover our guides"),
    ("Découvrir", "Discover"),
    ("D&eacute;couvrir", "Discover"),
    ("En savoir plus", "Learn more"),
    ("Lire la suite", "Read more"),
    ("Lire l'article", "Read the article"),
    ("Lire l&#39;article", "Read the article"),
    ("Commencer maintenant", "Get started now"),
    ("Démarrer mon projet", "Start my project"),
    ("D&eacute;marrer mon projet", "Start my project"),
    ("Parlez-nous de votre projet", "Tell us about your project"),
    ("Lancez votre projet", "Launch your project"),
    ("Prendre rendez-vous", "Book an appointment"),
    ("Planifier un appel", "Schedule a call"),
    ("Télécharger", "Download"),
    ("T&eacute;l&eacute;charger", "Download"),

    # ---- HERO / HEADINGS ----
    ("VOUS MÉRITEZ", "YOU DESERVE"),
    ("VOUS M&Eacute;RITEZ", "YOU DESERVE"),
    ("LA PREMIÈRE PAGE", "THE FIRST PAGE"),
    ("LA PREMI&Egrave;RE PAGE", "THE FIRST PAGE"),
    ("DE GOOGLE.", "OF GOOGLE."),
    ("DE GOOGLE", "OF GOOGLE"),
    ("Agence digitale premium", "Premium digital agency"),
    ("AGENCE DIGITALE PREMIUM", "PREMIUM DIGITAL AGENCY"),
    ("UNE AGENCE QUI COMPREND", "AN AGENCY THAT UNDERSTANDS"),
    ("UNE AGENCE QUI CONNAIT", "AN AGENCY THAT KNOWS"),
    ("UNE AGENCE QUI CONNA&Icirc;T", "AN AGENCY THAT KNOWS"),
    ("VOTRE MARCHÉ", "YOUR MARKET"),
    ("VOTRE MARCH&Eacute;", "YOUR MARKET"),
    ("Pourquoi nous choisir", "Why choose us"),
    ("POURQUOI NOUS CHOISIR", "WHY CHOOSE US"),
    ("Notre expertise", "Our expertise"),
    ("NOTRE EXPERTISE", "OUR EXPERTISE"),
    ("Notre processus", "Our process"),
    ("NOTRE PROCESSUS", "OUR PROCESS"),
    ("Nos résultats", "Our results"),
    ("NOS RÉSULTATS", "OUR RESULTS"),
    ("NOS R&Eacute;SULTATS", "OUR RESULTS"),
    ("Questions fréquentes", "Frequently Asked Questions"),
    ("QUESTIONS FRÉQUENTES", "FREQUENTLY ASKED QUESTIONS"),
    ("QUESTIONS FR&Eacute;QUENTES", "FREQUENTLY ASKED QUESTIONS"),
    ("QUESTIONS FREQUENTES", "FREQUENTLY ASKED QUESTIONS"),
    ("Témoignages", "Testimonials"),
    ("T&eacute;moignages", "Testimonials"),
    ("TÉMOIGNAGES", "TESTIMONIALS"),

    # ---- PAIN POINTS ----
    ("Votre site est invisible sur Google", "Your website is invisible on Google"),
    ("Vous investissez sans retour mesurable", "You invest without measurable return"),
    ("Vos concurrents vous dépassent en ligne", "Your competitors outperform you online"),
    ("Vos concurrents vous d&eacute;passent en ligne", "Your competitors outperform you online"),
    ("Vous perdez des clients chaque jour", "You lose clients every day"),
    ("Votre présence digitale ne reflète pas votre expertise", "Your digital presence doesn't reflect your expertise"),
    ("Votre pr&eacute;sence digitale ne refl&egrave;te pas votre expertise", "Your digital presence doesn't reflect your expertise"),

    # ---- VALUE PROPOSITIONS ----
    ("Résultats mesurables", "Measurable results"),
    ("R&eacute;sultats mesurables", "Measurable results"),
    ("Expertise certifiée", "Certified expertise"),
    ("Expertise certifi&eacute;e", "Certified expertise"),
    ("Accompagnement premium", "Premium support"),
    ("Approche sur mesure", "Tailored approach"),
    ("Stratégie personnalisée", "Personalized strategy"),
    ("Strat&eacute;gie personnalis&eacute;e", "Personalized strategy"),
    ("ROI garanti", "Guaranteed ROI"),
    ("Transparence totale", "Total transparency"),
    ("Support dédié", "Dedicated support"),
    ("Support d&eacute;di&eacute;", "Dedicated support"),

    # ---- PROCESS STEPS ----
    ("Audit & Diagnostic", "Audit & Diagnostic"),
    ("Stratégie sur mesure", "Custom strategy"),
    ("Strat&eacute;gie sur mesure", "Custom strategy"),
    ("Exécution & Optimisation", "Execution & Optimization"),
    ("Ex&eacute;cution &amp; Optimisation", "Execution & Optimization"),
    ("Résultats & Croissance", "Results & Growth"),
    ("R&eacute;sultats &amp; Croissance", "Results & Growth"),
    ("Analyse approfondie", "In-depth analysis"),
    ("Plan d'action détaillé", "Detailed action plan"),
    ("Plan d&#39;action d&eacute;taill&eacute;", "Detailed action plan"),
    ("Mise en œuvre experte", "Expert implementation"),
    ("Mise en oeuvre experte", "Expert implementation"),
    ("Suivi et amélioration continue", "Continuous monitoring and improvement"),
    ("Suivi et am&eacute;lioration continue", "Continuous monitoring and improvement"),

    # ---- SERVICES ----
    ("Création de Sites Web", "Website Creation"),
    ("Cr&eacute;ation de Sites Web", "Website Creation"),
    ("Création de sites web", "Website creation"),
    ("SEO & Référencement Naturel", "SEO & Organic Search"),
    ("SEO &amp; R&eacute;f&eacute;rencement Naturel", "SEO & Organic Search"),
    ("SEO & Référencement naturel", "SEO & Organic search"),
    ("Référencement Naturel", "Organic Search"),
    ("R&eacute;f&eacute;rencement Naturel", "Organic Search"),
    ("Référencement naturel", "Organic search"),
    ("R&eacute;f&eacute;rencement naturel", "Organic search"),
    ("référencement naturel", "organic search"),
    ("Design & Branding", "Design & Branding"),
    ("Social Media", "Social Media"),
    ("Publicité Payante (SEA)", "Paid Advertising (SEA)"),
    ("Publicit&eacute; Payante (SEA)", "Paid Advertising (SEA)"),
    ("Publicité payante", "Paid advertising"),
    ("Publicit&eacute; payante", "Paid advertising"),
    ("Email Marketing & CRM", "Email Marketing & CRM"),
    ("IA & Automatisation", "AI & Automation"),
    ("Intelligence Artificielle", "Artificial Intelligence"),
    ("Rédaction & Content Marketing", "Content Writing & Marketing"),
    ("R&eacute;daction &amp; Content Marketing", "Content Writing & Marketing"),
    ("Rédaction & Content", "Content Writing"),
    ("R&eacute;daction &amp; Content", "Content Writing"),
    ("Sales Funnels & CRO", "Sales Funnels & CRO"),
    ("Vidéo & Motion Design", "Video & Motion Design"),
    ("Vid&eacute;o &amp; Motion Design", "Video & Motion Design"),
    ("Vidéo & Motion", "Video & Motion"),

    # ---- COMPARISON TABLE ----
    ("Agence classique", "Traditional agency"),
    ("Freelance", "Freelancer"),
    ("Pirabel Labs", "Pirabel Labs"),
    ("Prix élevés, résultats incertains", "High prices, uncertain results"),
    ("Prix bas, qualité variable", "Low prices, variable quality"),
    ("Qualité premium, ROI prouvé", "Premium quality, proven ROI"),
    ("Qualit&eacute; premium, ROI prouv&eacute;", "Premium quality, proven ROI"),
    ("Communication lente", "Slow communication"),
    ("Disponibilité limitée", "Limited availability"),
    ("Disponibilit&eacute; limit&eacute;e", "Limited availability"),
    ("Interlocuteur dédié", "Dedicated contact"),
    ("Interlocuteur d&eacute;di&eacute;", "Dedicated contact"),
    ("Rapports mensuels basiques", "Basic monthly reports"),
    ("Pas de reporting", "No reporting"),
    ("Dashboard temps réel", "Real-time dashboard"),
    ("Dashboard temps r&eacute;el", "Real-time dashboard"),

    # ---- CONTACT ----
    ("Votre nom", "Your name"),
    ("Votre email", "Your email"),
    ("Votre téléphone", "Your phone"),
    ("Votre t&eacute;l&eacute;phone", "Your phone"),
    ("Votre message", "Your message"),
    ("Sujet", "Subject"),
    ("Envoyer le message", "Send message"),
    ("Envoyer", "Send"),
    ("Message envoyé avec succès", "Message sent successfully"),
    ("Message envoy&eacute; avec succ&egrave;s", "Message sent successfully"),
    ("Nom complet", "Full name"),
    ("Adresse email", "Email address"),
    ("Numéro de téléphone", "Phone number"),
    ("Num&eacute;ro de t&eacute;l&eacute;phone", "Phone number"),
    ("Décrivez votre projet", "Describe your project"),
    ("D&eacute;crivez votre projet", "Describe your project"),
    ("Budget estimé", "Estimated budget"),
    ("Budget estim&eacute;", "Estimated budget"),

    # ---- ABOUT ----
    ("Notre histoire", "Our story"),
    ("Notre équipe", "Our team"),
    ("Notre &eacute;quipe", "Our team"),
    ("Notre mission", "Our mission"),
    ("Nos valeurs", "Our values"),
    ("Notre vision", "Our vision"),
    ("Qui sommes-nous", "Who we are"),
    ("années d'expérience", "years of experience"),
    ("ann&eacute;es d&#39;exp&eacute;rience", "years of experience"),
    ("clients satisfaits", "satisfied clients"),
    ("projets livrés", "projects delivered"),
    ("projets livr&eacute;s", "projects delivered"),
    ("pays couverts", "countries covered"),

    # ---- CITY PAGES ----
    ("Vous cherchez une agence", "Looking for an agency"),
    ("qui comprend votre marché", "that understands your market"),
    ("qui comprend votre march&eacute;", "that understands your market"),
    ("à Paris", "in Paris"),
    ("&agrave; Paris", "in Paris"),
    ("a Paris", "in Paris"),
    ("à Lyon", "in Lyon"),
    ("&agrave; Lyon", "in Lyon"),
    ("a Lyon", "in Lyon"),
    ("à Marseille", "in Marseille"),
    ("&agrave; Marseille", "in Marseille"),
    ("a Marseille", "in Marseille"),
    ("à Cotonou", "in Cotonou"),
    ("&agrave; Cotonou", "in Cotonou"),
    ("a Cotonou", "in Cotonou"),
    ("à Casablanca", "in Casablanca"),
    ("&agrave; Casablanca", "in Casablanca"),
    ("a Casablanca", "in Casablanca"),
    ("à Dakar", "in Dakar"),
    ("&agrave; Dakar", "in Dakar"),
    ("a Dakar", "in Dakar"),
    ("à Abidjan", "in Abidjan"),
    ("&agrave; Abidjan", "in Abidjan"),
    ("a Abidjan", "in Abidjan"),
    ("à Tunis", "in Tunis"),
    ("&agrave; Tunis", "in Tunis"),
    ("a Tunis", "in Tunis"),
    ("à Bruxelles", "in Brussels"),
    ("&agrave; Bruxelles", "in Brussels"),
    ("a Bruxelles", "in Brussels"),
    ("à Montréal", "in Montreal"),
    ("&agrave; Montr&eacute;al", "in Montreal"),
    ("a Montréal", "in Montreal"),
    ("a Montreal", "in Montreal"),

    # ---- FAQ ----
    ("Combien de temps faut-il pour voir des résultats", "How long does it take to see results"),
    ("Combien de temps faut-il pour voir des r&eacute;sultats", "How long does it take to see results"),
    ("Quelle est la différence entre", "What is the difference between"),
    ("Quelle est la diff&eacute;rence entre", "What is the difference between"),
    ("Est-ce que le SEO vaut vraiment l'investissement", "Is SEO really worth the investment"),
    ("Est-ce que le SEO vaut vraiment l&#39;investissement", "Is SEO really worth the investment"),
    ("Comment savoir si mon site a besoin de SEO", "How do I know if my site needs SEO"),
    ("Que comprend votre audit SEO gratuit", "What does your free SEO audit include"),
    ("Travaillez-vous avec des entreprises de toutes tailles", "Do you work with businesses of all sizes"),
    ("Quel est votre processus de travail", "What is your work process"),
    ("Combien coûte", "How much does"),
    ("Combien co&ucirc;te", "How much does"),
    ("Quels sont vos tarifs", "What are your rates"),
    ("Proposez-vous un accompagnement", "Do you offer support"),
    ("Comment mesurer les résultats", "How to measure results"),
    ("Comment mesurer les r&eacute;sultats", "How to measure results"),

    # ---- FAQ ANSWERS (common fragments) ----
    ("Les premiers résultats sont visibles sous", "First results are visible within"),
    ("Les premiers r&eacute;sultats sont visibles sous", "First results are visible within"),
    ("selon la concurrence de votre secteur", "depending on your industry competition"),
    ("comptez 3 à 6 mois", "expect 3 to 6 months"),
    ("comptez 3 &agrave; 6 mois", "expect 3 to 6 months"),
    ("Notre audit comprend", "Our audit includes"),
    ("analyse de votre visibilité actuelle", "analysis of your current visibility"),
    ("analyse de votre visibilit&eacute; actuelle", "analysis of your current visibility"),
    ("diagnostic technique", "technical diagnostic"),
    ("étude de vos concurrents", "competitor analysis"),
    ("&eacute;tude de vos concurrents", "competitor analysis"),
    ("recommandations concrètes", "concrete recommendations"),
    ("plan d'action prioritaire", "priority action plan"),
    ("plan d&#39;action prioritaire", "priority action plan"),
    ("Oui. Startups, PME et grandes entreprises", "Yes. Startups, SMBs and large enterprises"),
    ("Nous adaptons notre stratégie", "We adapt our strategy"),
    ("Nous adaptons notre strat&eacute;gie", "We adapt our strategy"),
    ("à votre budget", "to your budget"),
    ("&agrave; votre budget", "to your budget"),
    ("vos objectifs spécifiques", "your specific goals"),
    ("vos objectifs sp&eacute;cifiques", "your specific goals"),
    ("retour sur investissement", "return on investment"),

    # ---- PRICING ----
    ("À partir de", "Starting from"),
    ("&Agrave; partir de", "Starting from"),
    ("à partir de", "starting from"),
    ("&agrave; partir de", "starting from"),
    ("par mois", "per month"),
    ("par projet", "per project"),
    ("Inclus dans tous les forfaits", "Included in all plans"),
    ("Sur mesure", "Custom"),

    # ---- CAREERS ----
    ("Carrières", "Careers"),
    ("Carri&egrave;res", "Careers"),
    ("Rejoignez notre équipe", "Join our team"),
    ("Rejoignez notre &eacute;quipe", "Join our team"),
    ("Postuler", "Apply"),
    ("Candidature", "Application"),
    ("Envoyer ma candidature", "Submit my application"),

    # ---- MISC ----
    ("Chargement...", "Loading..."),
    ("Fermer", "Close"),
    ("Suivant", "Next"),
    ("Précédent", "Previous"),
    ("Pr&eacute;c&eacute;dent", "Previous"),
    ("Voir tout", "See all"),
    ("Voir plus", "See more"),
    ("Retour", "Back"),
    ("Rechercher", "Search"),
    ("Aucun résultat", "No results"),
    ("Aucun r&eacute;sultat", "No results"),
    ("Erreur", "Error"),
    ("Succès", "Success"),
    ("Succ&egrave;s", "Success"),
    ("Partager", "Share"),
    ("Copier le lien", "Copy link"),
    ("Lien copié", "Link copied"),
    ("Lien copi&eacute;", "Link copied"),
    ("min de lecture", "min read"),
    ("Publié le", "Published on"),
    ("Publi&eacute; le", "Published on"),
    ("Mis à jour le", "Updated on"),
    ("Mis &agrave; jour le", "Updated on"),
    ("Articles récents", "Recent articles"),
    ("Articles r&eacute;cents", "Recent articles"),
    ("Articles populaires", "Popular articles"),
    ("Catégories", "Categories"),
    ("Cat&eacute;gories", "Categories"),

    # ---- RENDEZ-VOUS ----
    ("Rendez-vous", "Appointment"),
    ("Prendre un rendez-vous", "Book an appointment"),
    ("Choisissez votre créneau", "Choose your time slot"),
    ("Choisissez votre cr&eacute;neau", "Choose your time slot"),
    ("Confirmez votre rendez-vous", "Confirm your appointment"),

    # ---- TESTIMONIALS COMMON ----
    ("PDG", "CEO"),
    ("Directeur Marketing", "Marketing Director"),
    ("Directeur Général", "General Manager"),
    ("Directeur G&eacute;n&eacute;ral", "General Manager"),
    ("Fondateur", "Founder"),
    ("Fondatrice", "Founder"),

    # ---- BLOG ----
    ("Tous les articles", "All articles"),
    ("Articles", "Articles"),
    ("Lire", "Read"),

    # ---- GUIDES ----
    ("Tous les guides", "All guides"),
    ("Guide complet", "Complete guide"),

    # ---- FORMATIONS ----
    ("Formation", "Training"),
    ("Formations", "Trainings"),
    ("formation digitale", "digital training"),
    ("formation-digitale", "formation-digitale"),

    # ---- OUTILS ----
    ("Outils digitaux", "Digital tools"),
    ("outils digitaux", "digital tools"),
    ("outils-digitaux", "outils-digitaux"),

    # ---- CONSULTING ----
    ("Consulting digital", "Digital consulting"),
    ("consulting digital", "digital consulting"),
    ("consulting-digital", "consulting-digital"),
]

# Additional longer sentence translations
SENTENCE_TRANSLATIONS = [
    ("Nous analysons votre situation et définissons une stratégie adaptée", "We analyze your situation and define a tailored strategy"),
    ("Nous analysons votre situation et d&eacute;finissons une strat&eacute;gie adapt&eacute;e", "We analyze your situation and define a tailored strategy"),
    ("Notre équipe implémente les solutions avec précision", "Our team implements solutions with precision"),
    ("Notre &eacute;quipe impl&eacute;mente les solutions avec pr&eacute;cision", "Our team implements solutions with precision"),
    ("Nous suivons les performances et optimisons en continu", "We track performance and continuously optimize"),
    ("Des résultats concrets et mesurables pour votre entreprise", "Concrete and measurable results for your business"),
    ("Des r&eacute;sultats concrets et mesurables pour votre entreprise", "Concrete and measurable results for your business"),
    ("Prêt à dominer votre marché", "Ready to dominate your market"),
    ("Pr&ecirc;t &agrave; dominer votre march&eacute;", "Ready to dominate your market"),
    ("Parlons de votre projet", "Let's talk about your project"),
    ("Discutons de votre projet", "Let's discuss your project"),
    ("Chaque projet est unique", "Every project is unique"),
    ("Nous créons des solutions sur mesure", "We create custom solutions"),
    ("Nous cr&eacute;ons des solutions sur mesure", "We create custom solutions"),
    ("Pas de solutions génériques", "No generic solutions"),
    ("Pas de solutions g&eacute;n&eacute;riques", "No generic solutions"),
    ("Votre réussite est notre priorité", "Your success is our priority"),
    ("Votre r&eacute;ussite est notre priorit&eacute;", "Your success is our priority"),
    ("première page de Google", "first page of Google"),
    ("premi&egrave;re page de Google", "first page of Google"),
    ("Vous méritez d'être trouvé sur Google", "You deserve to be found on Google"),
    ("Vous m&eacute;ritez d&#39;&ecirc;tre trouv&eacute; sur Google", "You deserve to be found on Google"),
    ("résultats mesurables", "measurable results"),
    ("r&eacute;sultats mesurables", "measurable results"),
    ("Pas de promesses vides, des résultats", "No empty promises, results"),
    ("Pas de promesses vides, des r&eacute;sultats", "No empty promises, results"),
    ("entreprises nous font confiance", "businesses trust us"),
    ("de trafic organique en moyenne", "organic traffic on average"),
    ("de retour sur investissement", "return on investment"),
    ("taux de satisfaction client", "client satisfaction rate"),
]

def get_depth(rel_path):
    """Get directory depth of a file path."""
    parts = rel_path.replace('\\', '/').split('/')
    return len(parts) - 1  # subtract filename

def fix_relative_paths(content, extra_depth):
    """Add extra ../ to relative paths for EN nesting."""
    if extra_depth == 0:
        return content
    prefix = '../' * extra_depth
    # Fix href="../ and src="../ patterns
    content = re.sub(r'(href|src|content)="\.\./', rf'\1="{prefix}../', content)
    # Fix href="img/ src="img/ (root-relative without ../)
    # These are for files at depth 0 in FR that go to depth 1 in EN
    content = content.replace('href="img/', f'href="{prefix}img/')
    content = content.replace('src="img/', f'src="{prefix}img/')
    content = content.replace('href="css/', f'href="{prefix}css/')
    content = content.replace('src="css/', f'src="{prefix}css/')
    return content

def translate_content(content):
    """Apply all text translations."""
    # Apply sentence translations first (longer strings)
    for fr, en in SENTENCE_TRANSLATIONS:
        content = content.replace(fr, en)
    # Then word/phrase translations
    for fr, en in TRANSLATIONS:
        content = content.replace(fr, en)
    return content

def fix_meta_and_lang(content, rel_path):
    """Fix lang, canonical, hreflang, og:url for EN version."""
    url_path = rel_path.replace('\\', '/').replace('.html', '').replace('/index', '')
    if url_path == 'index':
        url_path = ''

    # Set lang="en"
    content = content.replace('lang="fr"', 'lang="en"')
    content = content.replace("lang='fr'", "lang='en'")

    # Fix og:locale
    content = content.replace('"og:locale" content="fr_FR"', '"og:locale" content="en_US"')
    content = content.replace("'og:locale' content='fr_FR'", "'og:locale' content='en_US'")

    # Fix canonical to point to EN version
    fr_canonical = f'{DOMAIN}/{url_path}'
    en_canonical = f'{DOMAIN}/en/{url_path}'
    content = content.replace(f'href="{fr_canonical}"', f'href="{en_canonical}"')

    return content

def fix_internal_links(content):
    """Fix navigation links to point to /en/ versions."""
    # Nav links
    content = content.replace('href="/"', 'href="/en/"')
    content = content.replace("href='/'", "href='/en/'")
    content = content.replace('href="/services"', 'href="/en/services"')
    content = content.replace('href="/blog"', 'href="/en/blog"')
    content = content.replace('href="/guides"', 'href="/en/guides"')
    content = content.replace('href="/resultats"', 'href="/en/resultats"')
    content = content.replace('href="/a-propos"', 'href="/en/a-propos"')
    content = content.replace('href="/contact"', 'href="/en/contact"')
    content = content.replace('href="/faq"', 'href="/en/faq"')
    content = content.replace('href="/carrieres"', 'href="/en/carrieres"')
    content = content.replace('href="/candidature"', 'href="/en/candidature"')
    content = content.replace('href="/rendez-vous"', 'href="/en/rendez-vous"')
    content = content.replace('href="/mentions-legales"', 'href="/en/mentions-legales"')
    content = content.replace('href="/politique-confidentialite"', 'href="/en/politique-confidentialite"')
    content = content.replace('href="/blog-article"', 'href="/en/blog-article"')

    # Agence links
    for prefix in ['agence-creation-sites-web', 'agence-seo-referencement-naturel',
                    'agence-design-branding', 'agence-social-media',
                    'agence-publicite-payante-sea-ads', 'agence-email-marketing-crm',
                    'agence-ia-automatisation', 'agence-redaction-content-marketing',
                    'agence-sales-funnels-cro', 'agence-video-motion-design']:
        content = content.replace(f'href="/{prefix}', f'href="/en/{prefix}')

    # Category links
    for prefix in ['consulting-digital', 'formation-digitale', 'outils-digitaux']:
        content = content.replace(f'href="/{prefix}', f'href="/en/{prefix}')

    return content

def add_lang_switcher(content, fr_url):
    """Add FR/EN language switcher."""
    if 'lang-switch' in content:
        return content

    switcher_css = """
<style>
.lang-switch{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;gap:0;border:1px solid rgba(255,85,0,.4);background:rgba(10,10,10,.9);backdrop-filter:blur(10px);font-family:'Space Grotesk',sans-serif;}
.lang-switch a{padding:.5rem .85rem;font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;color:rgba(255,255,255,.5);transition:all .2s;}
.lang-switch a:hover{color:#fff;}
.lang-switch a.active{background:#FF5500;color:#fff;}
</style>
"""
    switcher_html = f'\n<div class="lang-switch"><a href="{fr_url}">FR</a><a href="#" class="active">EN</a></div>\n'

    content = content.replace('</head>', switcher_css + '</head>', 1)
    content = content.replace('</body>', switcher_html + '</body>', 1)

    return content

def main():
    count = 0

    for root, dirs, files in os.walk(BASE):
        rel_root = os.path.relpath(root, BASE)

        # Skip directories
        if rel_root != '.' and rel_root.split(os.sep)[0] in SKIP_DIRS:
            continue
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for f in files:
            if not f.endswith('.html') or f in SKIP_FILES:
                continue

            fr_path = os.path.join(root, f)
            rel_path = os.path.relpath(fr_path, BASE)

            # Build EN destination
            en_path = os.path.join(EN_DIR, rel_path)
            en_dir = os.path.dirname(en_path)
            os.makedirs(en_dir, exist_ok=True)

            # Read FR source
            with open(fr_path, 'r', encoding='utf-8', errors='replace') as fh:
                content = fh.read()

            # 1. Fix relative paths (EN is 1 level deeper)
            depth = get_depth(rel_path)
            if depth == 0:
                # Root files like index.html -> en/index.html
                # img/x -> ../img/x
                content = content.replace('href="img/', 'href="../img/')
                content = content.replace('src="img/', 'src="../img/')
                content = content.replace('href="css/', 'href="../css/')
                content = content.replace('src="css/', 'src="../css/')
            else:
                # Files already have ../ — add one more
                content = fix_relative_paths(content, 1)

            # 2. Translate text
            content = translate_content(content)

            # 3. Fix meta/lang
            content = fix_meta_and_lang(content, rel_path)

            # 4. Fix internal links
            content = fix_internal_links(content)

            # 5. Add language switcher
            fr_url = '/' + rel_path.replace('\\', '/').replace('/index.html', '').replace('.html', '')
            if fr_url == '/index':
                fr_url = '/'
            content = add_lang_switcher(content, fr_url)

            # Write EN file
            with open(en_path, 'w', encoding='utf-8') as fh:
                fh.write(content)
            count += 1

    print(f"Rebuilt {count} EN pages from FR sources")

if __name__ == '__main__':
    main()
