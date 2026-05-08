"""
fix-franglais-en.py
Apply curated phrase-level replacements to /en/**/*.html files.
Replacements only happen inside visible text (between > and <), never inside
attributes, scripts or styles. Idempotent.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EN_DIR = ROOT / "en"

SKIP_DIRS = ("node_modules", "admin_x9k2m7v4p8w1n", "client_portal_v4p8w1n",
             "pirabel-admin", "espace-client-4p8w1n", ".git", ".vercel")

# (pattern, replacement) — applied with re.IGNORECASE on the regex side,
# but the replacement preserves the case-pattern of the source via a callback.
# We use plain (case-sensitive) replacements where capitalization matters
# explicitly (the phrase appears with that exact casing).

# === EXACT-CASE REPLACEMENTS ===
# Triplet: ALL-CAPS form, Title Case, lower case — listed individually so the
# replacement preserves the visible casing.
PHRASE_PAIRS = [
    # Geographic / business descriptors
    ("MARCHÉ EN EXPANSION", "EXPANDING MARKET"),
    ("Marché en expansion", "Expanding market"),
    ("marché en expansion", "an expanding market"),
    ("MARCHE EN EXPANSION", "EXPANDING MARKET"),
    ("Marche en expansion", "Expanding market"),
    ("marche en expansion", "an expanding market"),

    ("PÔLE ÉCONOMIQUE", "ECONOMIC HUB"),
    ("Pôle économique", "Economic hub"),
    ("pôle économique", "economic hub"),
    ("POLE ECONOMIQUE", "ECONOMIC HUB"),
    ("Pole economique", "Economic hub"),
    ("pole economique", "economic hub"),

    ("CAPITALE ÉCONOMIQUE", "ECONOMIC CAPITAL"),
    ("Capitale économique", "Economic capital"),
    ("capitale économique", "economic capital"),
    ("CAPITALE POLITIQUE", "POLITICAL CAPITAL"),
    ("Capitale politique", "Political capital"),
    ("capitale politique", "political capital"),

    # Action verbs / CTAs
    ("CONVERTISSEZ PLUS", "CONVERT MORE"),
    ("Convertissez plus", "Convert more"),
    ("convertissez plus", "convert more"),
    ("DÉCOUVREZ", "DISCOVER"),
    ("Découvrez", "Discover"),
    ("découvrez", "discover"),
    ("CONTACTEZ-NOUS", "CONTACT US"),
    ("Contactez-nous", "Contact us"),
    ("contactez-nous", "contact us"),

    # Common compound nouns (French)
    ("STRATÉGIE ÉDITORIALE", "EDITORIAL STRATEGY"),
    ("Stratégie éditoriale", "Editorial strategy"),
    ("stratégie éditoriale", "editorial strategy"),
    ("CRÉATION DE CONTENU", "CONTENT CREATION"),
    ("Création de contenu", "Content creation"),
    ("création de contenu", "content creation"),
    ("CRÉATION CONTENU SOCIAL", "SOCIAL CONTENT CREATION"),
    ("Création contenu social", "Social content creation"),
    ("création contenu social", "social content creation"),
    ("RÉSEAUX SOCIAUX", "SOCIAL NETWORKS"),
    ("Réseaux sociaux", "Social networks"),
    ("réseaux sociaux", "social networks"),
    ("TÂCHES RÉPÉTITIVES", "REPETITIVE TASKS"),
    ("Tâches répétitives", "Repetitive tasks"),
    ("tâches répétitives", "repetitive tasks"),
    ("RÉFÉRENCEMENT NATUREL", "ORGANIC SEO"),
    ("Référencement naturel", "Organic SEO"),
    ("référencement naturel", "organic SEO"),
    ("PUBLICITÉ PAYANTE", "PAID ADVERTISING"),
    ("Publicité payante", "Paid advertising"),
    ("publicité payante", "paid advertising"),
    ("MOTION DESIGN", "MOTION DESIGN"),  # noop, kept for context

    # Single-word French residues — these only appear in EN files as franglais
    ("VIDÉO", "VIDEO"),
    ("Vidéo", "Video"),
    ("vidéo", "video"),
    ("GÉRER", "MANAGE"),
    ("Gérer", "Manage"),
    ("gérer", "manage"),
    ("RÉFLÈTE", "REFLECTS"),
    ("Réflète", "Reflects"),
    ("réflète", "reflects"),
    ("REFLÈTE", "REFLECTS"),
    ("Reflète", "Reflects"),
    ("reflète", "reflects"),
    ("GÉNÈRENT", "GENERATE"),
    ("Génèrent", "Generate"),
    ("génèrent", "generate"),
    ("RÉPÉTITIVES", "REPETITIVE"),
    ("Répétitives", "Repetitive"),
    ("répétitives", "repetitive"),
    ("TÂCHES", "TASKS"),
    ("Tâches", "Tasks"),
    ("tâches", "tasks"),
    ("RÉSEAUX", "NETWORKS"),
    ("Réseaux", "Networks"),
    ("réseaux", "networks"),
    ("ÉDITORIALE", "EDITORIAL"),
    ("Éditoriale", "Editorial"),
    ("éditoriale", "editorial"),
    ("ÉDITORIAL", "EDITORIAL"),
    ("Éditorial", "Editorial"),
    ("éditorial", "editorial"),
    ("DÉVELOPPEUR", "DEVELOPER"),
    ("Développeur", "Developer"),
    ("développeur", "developer"),
    ("DEVELOPPEUR", "DEVELOPER"),
    ("Developpeur", "Developer"),
    ("developpeur", "developer"),
    ("DÉVELOPPEMENT", "DEVELOPMENT"),
    ("Développement", "Development"),
    ("développement", "development"),
    ("ÉTUDE", "STUDY"),
    ("Étude", "Study"),
    ("étude", "study"),
    ("ÉTUDIER", "STUDY"),
    ("Étudier", "Study"),
    ("étudier", "study"),
    ("ÉTÉ", "BEEN"),  # only in past-participle context — risk: also means "summer"
    ("ANNULÉ", "CANCELLED"),
    ("Annulé", "Cancelled"),
    ("annulé", "cancelled"),
    ("ENVOYÉE", "SENT"),
    ("Envoyée", "Sent"),
    ("envoyée", "sent"),
    ("ENVOYÉ", "SENT"),
    ("Envoyé", "Sent"),
    ("envoyé", "sent"),
    ("NUMÉRO", "NUMBER"),
    ("Numéro", "Number"),
    ("numéro", "number"),
    ("ENTREPRISE", "COMPANY"),
    ("Entreprise", "Company"),
    ("entreprise", "company"),
    ("ENTREPRISES", "COMPANIES"),
    ("Entreprises", "Companies"),
    ("entreprises", "companies"),
    ("RÉALISATION", "PROJECT"),
    ("Réalisation", "Project"),
    ("réalisation", "project"),
    ("RÉALISATIONS", "PROJECTS"),
    ("Réalisations", "Projects"),
    ("réalisations", "projects"),
    ("RÉSULTATS", "RESULTS"),
    ("Résultats", "Results"),
    ("résultats", "results"),
    ("RÉSULTAT", "RESULT"),
    ("Résultat", "Result"),
    ("résultat", "result"),
    ("CRÉATION", "CREATION"),
    ("Création", "Creation"),
    ("création", "creation"),
    ("STRATÉGIQUE", "STRATEGIC"),
    ("Stratégique", "Strategic"),
    ("stratégique", "strategic"),
    ("STRATÉGIE", "STRATEGY"),
    ("Stratégie", "Strategy"),
    ("stratégie", "strategy"),
    ("STRATÉGIES", "STRATEGIES"),
    ("Stratégies", "Strategies"),
    ("stratégies", "strategies"),
    ("RÉFÉRENCEMENT", "SEO"),
    ("Référencement", "SEO"),
    ("référencement", "SEO"),
    ("SOCIÉTÉ", "COMPANY"),
    ("Société", "Company"),
    ("société", "company"),
    ("SOCIÉTÉS", "COMPANIES"),
    ("Sociétés", "Companies"),
    ("sociétés", "companies"),
    ("SPÉCIFICITÉS", "SPECIFICS"),
    ("Spécificités", "Specifics"),
    ("spécificités", "specifics"),
    ("SPÉCIFICITÉ", "SPECIFICITY"),
    ("Spécificité", "Specificity"),
    ("spécificité", "specificity"),
    ("SPÉCIALEMENT", "SPECIFICALLY"),
    ("Spécialement", "Specifically"),
    ("spécialement", "specifically"),
    ("SPÉCIALISÉ", "SPECIALIZED"),
    ("Spécialisé", "Specialized"),
    ("spécialisé", "specialized"),
    ("SPÉCIALISÉE", "SPECIALIZED"),
    ("Spécialisée", "Specialized"),
    ("spécialisée", "specialized"),
    ("CONÇUES", "DESIGNED"),
    ("Conçues", "Designed"),
    ("conçues", "designed"),
    ("CONÇUE", "DESIGNED"),
    ("Conçue", "Designed"),
    ("conçue", "designed"),
    ("CONÇU", "DESIGNED"),
    ("Conçu", "Designed"),
    ("conçu", "designed"),
    ("AMÉLIORÉ", "IMPROVED"),
    ("Amélioré", "Improved"),
    ("amélioré", "improved"),
    ("AMÉLIORÉE", "IMPROVED"),
    ("Améliorée", "Improved"),
    ("améliorée", "improved"),
    ("ENRICHIR", "ENRICH"),
    ("Enrichir", "Enrich"),
    ("enrichir", "enrich"),
    ("RÉSERVATIONS", "BOOKINGS"),
    ("Réservations", "Bookings"),
    ("réservations", "bookings"),
    ("ILLIMITÉE", "UNLIMITED"),
    ("Illimitée", "Unlimited"),
    ("illimitée", "unlimited"),
    ("ILLIMITÉ", "UNLIMITED"),
    ("Illimité", "Unlimited"),
    ("illimité", "unlimited"),
    ("FLEXIBILITÉ", "FLEXIBILITY"),
    ("Flexibilité", "Flexibility"),
    ("flexibilité", "flexibility"),
    ("CAPACITÉS", "CAPABILITIES"),
    ("Capacités", "Capabilities"),
    ("capacités", "capabilities"),
    ("CAPACITÉ", "CAPABILITY"),
    ("Capacité", "Capability"),
    ("capacité", "capability"),
    ("CONFIGUREZ-LE", "CONFIGURE IT"),
    ("Configurez-le", "Configure it"),
    ("configurez-le", "configure it"),
    ("CONFIGUREZ", "CONFIGURE"),
    ("Configurez", "Configure"),
    ("configurez", "configure"),
    ("MONDIAL", "WORLDWIDE"),
    ("Mondial", "Worldwide"),
    ("mondial", "worldwide"),

    # Mixed franglais (auto-translation glitches)
    ("ne represente pas", "does not represent"),
    ("Ne represente pas", "Does not represent"),
    ("n'e represente pas", "does not represent"),
    ("ne are not", "are not"),
    ("Ne are not", "Are not"),
    ("ne have not", "do not have"),
    ("Ne have not", "Do not have"),
    ("ne communiquent not", "do not communicate"),
    ("Ne communiquent not", "Do not communicate"),
    ("ne connaissent not", "do not know"),
    ("Ne connaissent not", "Do not know"),
    ("ne souffre pas", "does not suffer"),
    ("Ne souffre pas", "Does not suffer"),
    ("par excellence", "par excellence"),  # accepted English idiom — noop
    ("plus de", "more than"),
    ("Plus de", "More than"),

    # Common French phrases
    ("grâce à", "thanks to"),
    ("Grâce à", "Thanks to"),
    ("GRÂCE À", "THANKS TO"),
    ("dès que", "as soon as"),
    ("Dès que", "As soon as"),
    ("dès le", "from the"),
    ("Dès le", "From the"),
    ("afin de", "in order to"),
    ("Afin de", "In order to"),
    ("afin d'", "in order to "),
    ("Afin d'", "In order to "),
    ("au fil des", "over the"),
    ("Au fil des", "Over the"),
    ("au fil du", "over the"),
    ("Au fil du", "Over the"),
    ("au sein de", "within"),
    ("Au sein de", "Within"),
    ("ainsi que", "as well as"),
    ("Ainsi que", "As well as"),

    # Word-order franglais (adjective-noun reversed)
    ("Strategy Editorial", "Editorial Strategy"),
    ("STRATEGY EDITORIAL", "EDITORIAL STRATEGY"),
    ("strategy editorial", "editorial strategy"),
    ("Creation Content", "Content Creation"),
    ("CREATION CONTENT", "CONTENT CREATION"),
    ("creation content", "content creation"),
    ("Solutions Social", "Social Solutions"),
    ("solutions Social", "Social Solutions"),
    ("approach Social", "Social approach"),
    ("approach social", "social approach"),

    # Geographic / location phrases
    ("capitale du Sénégal", "capital of Senegal"),
    ("Capitale du Sénégal", "Capital of Senegal"),
    ("capitale du Senegal", "capital of Senegal"),
    ("Capitale du Senegal", "Capital of Senegal"),
    ("capitale du Bénin", "capital of Benin"),
    ("capitale du Benin", "capital of Benin"),
    ("Amérique du Nord", "North America"),
    ("Amerique du Nord", "North America"),
    ("d'Amérique du Nord", "of North America"),
    ("d'Amerique du Nord", "of North America"),
    ("métropole francophone", "French-speaking metropolis"),
    ("metropole francophone", "French-speaking metropolis"),
    ("francophone d'Afrique", "French-speaking Africa"),
    ("francophone of Africa", "French-speaking Africa"),
    ("francophone Africa", "French-speaking Africa"),

    # Mixed franglais (more glitches)
    ("ne remplace not", "does not replace"),
    ("Ne remplace not", "Does not replace"),
    ("ne requiert not", "does not require"),
    ("Ne requiert not", "Does not require"),
    ("ne tentez not", "do not try"),
    ("Ne tentez not", "Do not try"),
    ("more of", "more than"),
    ("plus de", "more than"),
    ("Plus de", "More than"),

    # Word-by-word translation glitches
    ("of the year", "of the year"),  # noop
    ("au fil years", "over the years"),
    ("au fil des années", "over the years"),
    ("Au fil des années", "Over the years"),
    ("d'extensions", "of extensions"),
    ("D'extensions", "Of extensions"),
    ("d'évolution", "of evolution"),
    ("D'évolution", "Of evolution"),
    ("d'optimisation", "of optimization"),
    ("D'optimisation", "Of optimization"),
    ("d'optimization", "of optimization"),
    ("D'optimization", "Of optimization"),
    ("d'automation", "of automation"),
    ("D'automation", "Of automation"),
    ("d'extensions", "of extensions"),
    ("d'intérêt", "of interest"),
    ("d'interet", "of interest"),
    ("d'étapes", "of steps"),
    ("d'etapes", "of steps"),
    ("centres d'intérêt", "interests"),
    ("centres d'interet", "interests"),

    # Common French connectors that slipped through
    ("quasi illimitée", "nearly unlimited"),
    ("Quasi illimitée", "Nearly unlimited"),
    ("quasi illimitee", "nearly unlimited"),

    # Brand-specific
    ("son App Store", "its App Store"),
    ("son code", "its code"),
    ("son ecosystem", "its ecosystem"),
    ("son écosystème", "its ecosystem"),
    ("son écosysteme", "its ecosystem"),
    ("son impact", "its impact"),
    ("Son advantage", "Its advantage"),
    ("son advantage", "its advantage"),
    ("Sa force", "Its strength"),
    ("sa force", "its strength"),
    ("Sa flexibility", "Its flexibility"),
    ("sa flexibility", "its flexibility"),
    ("Sa nature", "Its nature"),
    ("sa nature", "its nature"),
    ("Sa conception", "Its design"),
    ("sa conception", "its design"),
    ("Sa première", "Its first"),
    ("sa première", "its first"),
    ("Sa premiere", "Its first"),
    ("sa premiere", "its first"),
    ("Ses capacités", "Its capabilities"),
    ("ses capacités", "its capabilities"),
    ("ses capacites", "its capabilities"),
    ("Ses centres", "Its interests"),
    ("ses centres", "its interests"),
    ("ses forces", "its strengths"),
    ("ses limites", "its limits"),
    ("Ses connaissances", "Its knowledge"),
    ("ses connaissances", "its knowledge"),

    # Compound French residues
    ("s'est imposé", "established itself"),
    ("s'est impose", "established itself"),
    ("s'est imposée", "established itself"),
    ("s'est imposee", "established itself"),
    ("S'est imposé", "Established itself"),
    ("S'est impose", "Established itself"),
    ("considerablement", "considerably"),
    ("Considerablement", "Considerably"),
    ("considérablement", "considerably"),
    ("Considérablement", "Considerably"),

    # FAQ / form residues
    ("plugin fait quoi", "what each plugin does"),
    ("quel plugin fait", "which plugin does"),
    ("Une notification a été", "A notification has been"),
    ("Une notification a ete", "A notification has been"),
    ("a été", "has been"),
    ("A été", "Has been"),
    ("a ete", "has been"),
    ("À notre", "To our"),
    ("à notre", "to our"),
    ("a notre", "to our"),
    ("à votre", "at your"),
    ("À votre", "At your"),
    ("à l'", "to "),
    ("À l'", "To "),

    # Specific repeated H1/CTA fragments
    ("DU CONTENT WHICH ATTIRE", "CONTENT THAT ATTRACTS"),
    ("Du Content Which Attire", "Content That Attracts"),
    ("du content which attire", "content that attracts"),
    ("DU CONTENU QUI ATTIRE", "CONTENT THAT ATTRACTS"),
    ("Du contenu qui attire", "Content that attracts"),

    # IA city template specifics
    ("Des erreurs par manque of automation", "Errors due to lack of automation"),
    ("Des erreurs par manque", "Errors due to lack"),
    ("Des hours perdues on repetitive tasks", "Lost hours on repetitive tasks"),
    ("Des hours perdues", "Lost hours"),
    ("Des heures perdues", "Lost hours"),
    ("par manque of", "due to lack of"),
    ("par manque d'", "due to lack of "),

    # Ne X pas / not patterns common in guides
    ("ne suffit not", "is not enough"),
    ("Ne suffit not", "Is not enough"),
    ("ne recherche not", "is not searching"),
    ("Ne recherche not", "Is not searching"),
    ("ne reviennent not", "do not come back"),
    ("Ne reviennent not", "Do not come back"),
    ("ne repond not", "does not respond"),
    ("Ne repond not", "Does not respond"),
    ("ne réponde not", "does not respond"),
    ("ne convertissent not", "do not convert"),
    ("ne montrez not", "do not show"),
    ("ne limitez not", "do not limit"),
    ("ne transitent not", "do not transit"),
    ("ne seek not", "do not seek"),
    ("ne means not", "does not mean"),
    ("ne not bloquer", "not block"),
    ("ne rien forget", "to not forget anything"),
    ("ne passant not", "not going"),

    # par + EN word patterns
    ("Cout par click", "Cost per click"),
    ("cout par click", "cost per click"),
    ("Cout par acquisition", "Cost per acquisition"),
    ("cout par acquisition", "cost per acquisition"),
    ("Cout par", "Cost per"),
    ("cout par", "cost per"),
    ("CPC (Cout par click)", "CPC (Cost per click)"),
    ("CPA (Cout par acquisition)", "CPA (Cost per acquisition)"),

    ("par the search engines", "by search engines"),
    ("par the organic traffic", "by organic traffic"),
    ("par the traffic", "by traffic"),
    ("par les", "by the"),
    ("Par les", "By the"),
    ("par theme", "by theme"),
    ("par service", "by service"),
    ("par ad group", "per ad group"),
    ("par week", "per week"),
    ("par click", "per click"),
    ("par mois", "per month"),
    ("par jour", "per day"),
    ("par an", "per year"),
    ("par erreur", "by mistake"),
    ("Par erreur", "By mistake"),
    ("par la suite", "later on"),
    ("Par la suite", "Later on"),
    ("par exemple", "for example"),
    ("Par exemple", "For example"),
    ("par contre", "on the other hand"),
    ("Par contre", "On the other hand"),
    ("par rapport", "compared"),
    ("Par rapport", "Compared"),
    ("par défaut", "by default"),
    ("Par défaut", "By default"),
    ("par defaut", "by default"),
    ("Par defaut", "By default"),
    ("par manque", "due to lack"),
    ("Par manque", "Due to lack"),
    ("par a ", "by a "),
    ("par the ", "by the "),
    ("Par the ", "By the "),

    # plus / moins comparison
    ("Plus you receive of", "The more you receive of"),
    ("plus you receive of", "the more you receive of"),
    ("Plus of ", "More than "),
    ("plus of ", "more than "),
    ("plus de ", "more than "),
    ("Plus de ", "More than "),

    # Generic phrase residues
    ("la plupart of", "most of"),
    ("La plupart of", "Most of"),
    ("la plupart des", "most of the"),
    ("La plupart des", "Most of the"),
    ("certaines limitations", "some limitations"),
    ("Certaines limitations", "Some limitations"),
    ("certaines features", "some features"),
    ("certaines pages", "some pages"),
    ("certaines limites", "some limits"),
    ("particulierement", "particularly"),
    ("Particulierement", "Particularly"),
    ("particulièrement", "particularly"),
    ("Particulièrement", "Particularly"),
    ("convient particulierement", "is particularly suitable"),
    ("convient particulièrement", "is particularly suitable"),

    # FAQ helper
    ("Bien that", "Although"),
    ("bien that", "although"),

    # specific common
    ("on laquelle", "on which"),
    ("of laquelle", "of which"),
    ("on lesquelles", "on which"),
    ("of lesquelles", "of which"),
    ("on lequel", "on which"),

    # SEO guide specific
    ("itself valent pas", "are not all the same"),
    ("ne itself valent pas", "are not all worth the same"),
    ("backlinks ne itself valent pas", "backlinks are not all worth the same"),

    # Make sure of ne not
    ("Make sure of ne not bloquer", "Make sure not to block"),
    ("make sure of ne not bloquer", "make sure not to block"),
    ("Make sure of ne not", "Make sure not to"),
    ("make sure of ne not", "make sure not to"),

    # Sales funnels city template
    ("Du traffic but personne ne converts", "Traffic but nobody converts"),
    ("Du traffic mais personne ne convertit", "Traffic but nobody converts"),
    ("personne ne converts", "nobody converts"),
    ("personne ne convertit", "nobody converts"),
    ("personne ne", "nobody "),
    ("Personne ne", "Nobody "),

    # Retargeting guide
    ("Ne limitez not your retargeting", "Don't limit your retargeting"),
    ("ne limitez not", "don't limit"),
    ("Ne limitez not", "Don't limit"),
    ("Ne montrez not your ads", "Don't show your ads"),
    ("ne montrez not", "don't show"),
    ("Ne montrez not", "Don't show"),

    # Conversion guide
    ("you puissiez do", "you can make"),
    ("you puissiez", "you can"),
    ("que vous puissiez", "that you can"),
    ("Que vous puissiez", "That you can"),
    ("vous puissiez", "you can"),
    ("Vous puissiez", "You can"),

    # SEO guide
    ("ne are not all the same", "are not all equal"),
    ("backlinks ne are not", "backlinks are not"),
    ("ne are not", "are not"),
    ("Ne are not", "Are not"),

    # WordPress page
    ("Chacun ajoute du poids", "Each adds weight"),
    ("ajoute du poids", "adds weight"),
    ("soigneusement sélectionnés", "carefully selected"),
    ("soigneusement sélectionnées", "carefully selected"),
    ("soigneusement selectionnes", "carefully selected"),
    ("soigneusement selectionnees", "carefully selected"),
    ("plugins empiles", "stacked plugins"),
    ("plugins empilés", "stacked plugins"),
    ("La sécurité", "Security"),
    ("la sécurité", "security"),
    ("Le système", "The system"),
    ("le système", "the system"),
    ("la cohérence", "consistency"),
    ("La cohérence", "Consistency"),
    ("la référence", "the benchmark"),
    ("La référence", "The benchmark"),

    # Misc accented residues (single-shot replacements)
    ("Étapes", "Steps"),
    ("étapes", "steps"),
    ("Communauté", "Community"),
    ("communauté", "community"),
    ("Île", "Island"),  # context-specific override may be needed
    ("Bénéficier", "Benefit"),
    ("bénéficier", "benefit"),
    ("Bénéficiez", "Benefit"),
    ("bénéficiez", "benefit"),
    ("Configuré", "Configured"),
    ("configuré", "configured"),
    ("Configurée", "Configured"),
    ("configurée", "configured"),
    ("Cohérent", "Consistent"),
    ("cohérent", "consistent"),
    ("Cohérente", "Consistent"),
    ("cohérente", "consistent"),
    ("Système", "System"),
    ("système", "system"),
    ("Référence", "Benchmark"),
    ("référence", "benchmark"),
    ("Créer", "Create"),
    ("créer", "create"),
    ("Créateurs", "Creators"),
    ("créateurs", "creators"),
    ("Créateur", "Creator"),
    ("créateur", "creator"),
    ("Sécurité", "Security"),
    ("sécurité", "security"),
    ("Sélectionnés", "Selected"),
    ("sélectionnés", "selected"),
    ("Sélectionnées", "Selected"),
    ("sélectionnées", "selected"),
    ("Sélectionne", "Selects"),
    ("sélectionne", "selects"),
    ("Sélectionnes", "Selected"),
    ("sélectionnes", "selected"),
    ("Avancé", "Advanced"),
    ("avancé", "advanced"),
    ("Avancée", "Advanced"),
    ("avancée", "advanced"),
    ("Avancées", "Advanced"),
    ("avancées", "advanced"),
    ("Accompagné", "Supported"),
    ("accompagné", "supported"),
    ("Accompagnée", "Supported"),
    ("accompagnée", "supported"),
    ("Adéquation", "Alignment"),
    ("adéquation", "alignment"),
    ("Compétence", "Skill"),
    ("compétence", "skill"),
    ("Compétences", "Skills"),
    ("compétences", "skills"),
    ("Connaître", "Know"),
    ("connaître", "know"),
    ("Contrôle", "Control"),
    ("contrôle", "control"),
    ("Contrôler", "Control"),
    ("contrôler", "control"),
    ("Dupliqué", "Duplicate"),
    ("dupliqué", "duplicate"),
    ("Dédié", "Dedicated"),
    ("dédié", "dedicated"),
    ("Dédiée", "Dedicated"),
    ("dédiée", "dedicated"),
    ("Départ", "Start"),
    ("départ", "start"),
    ("Dépasse", "Exceeds"),
    ("dépasse", "exceeds"),
    ("Dépend", "Depends"),
    ("dépend", "depends"),
    ("Détaillé", "Detailed"),
    ("détaillé", "detailed"),
    ("Détaillée", "Detailed"),
    ("détaillée", "detailed"),
    ("Expéditions", "Shipments"),
    ("expéditions", "shipments"),
    ("Facilité", "Ease"),
    ("facilité", "ease"),
    ("Fonctionnalités", "Features"),
    ("fonctionnalités", "features"),
    ("Fonctionnalité", "Feature"),
    ("fonctionnalité", "feature"),
    ("Guidé", "Guided"),
    ("guidé", "guided"),
    ("Guidée", "Guided"),
    ("guidée", "guided"),
    ("Complexité", "Complexity"),
    ("complexité", "complexity"),
    ("Mondial", "Global"),
    ("mondial", "global"),
    ("Mondiale", "Global"),
    ("mondiale", "global"),

    # à preposition residues
    ("sent à our", "sent to our"),
    ("Sent à our", "Sent to our"),
    ("à our team", "to our team"),
    ("à your team", "to your team"),
    ("à your service", "at your service"),
    ("is à your", "is at your"),
    ("Pirabel Labs team is à your", "The Pirabel Labs team is at your"),
    ("de la conception à la distribution", "from concept to distribution"),
    ("conception à la distribution", "concept to distribution"),
    ("à la distribution", "to distribution"),
    ("à la conception", "to design"),
    ("à la création", "to creation"),
    ("à la fois", "both"),
    ("À la fois", "Both"),
    ("à la une", "front and center"),
    ("à votre disposition", "at your disposal"),
    ("À votre disposition", "At your disposal"),
    ("à propos", "about"),
    ("À propos", "About"),

    # Des at start of phrase in EN context
    ("Des emballages that attract", "Packaging that attracts"),
    ("Des emballages", "Packaging"),
    ("Des chatbots intelligents qualifient", "Intelligent chatbots qualify"),
    ("Des chatbots intelligents", "Intelligent chatbots"),
    ("Des chatbots", "Chatbots"),
    ("Des platforms", "Platforms"),
    ("Des platforms like", "Platforms like"),
    ("Des plateformes", "Platforms"),
    ("Des solutions", "Solutions"),
    ("Des outils", "Tools"),
    ("Des entreprises", "Businesses"),

    # WordPress-specific repair
    ("plugins soigneusement selectss", "carefully selected plugins"),
    ("plugins soigneusement sélectionnés", "carefully selected plugins"),
    ("du code custom for the rest", "custom code for the rest"),
    ("du code custom", "custom code"),
    ("du code propre", "clean code"),
    ("plugins maintenus", "well-maintained plugins"),
    ("Security is a passoire", "Security is a sieve"),
    ("security is a passoire", "security is a sieve"),
    ("is a passoire", "is full of holes"),
    ("Your website is a invitation", "Your website becomes an invitation"),
    ("a invitation aux hackers", "an invitation to hackers"),
    ("invitation aux hackers", "invitation to hackers"),

    # FR imperative verbs (-EZ endings) appearing in H1s and CTAs.
    # Replace with the natural English imperative.
    ("AUTOMATISEZ", "AUTOMATE"),
    ("Automatisez", "Automate"),
    ("automatisez", "automate"),
    ("MAXIMISEZ", "MAXIMIZE"),
    ("Maximisez", "Maximize"),
    ("maximisez", "maximize"),
    ("OPTIMISEZ", "OPTIMIZE"),
    ("Optimisez", "Optimize"),
    ("optimisez", "optimize"),
    ("BOOSTEZ", "BOOST"),
    ("Boostez", "Boost"),
    ("boostez", "boost"),
    ("CRÉEZ", "CREATE"),
    ("CREEZ", "CREATE"),
    ("Créez", "Create"),
    ("Creez", "Create"),
    ("créez", "create"),
    ("creez", "create"),
    ("DESIGNEZ", "DESIGN"),
    ("Designez", "Design"),
    ("designez", "design"),
    ("LANCEZ", "LAUNCH"),
    ("Lancez", "Launch"),
    ("lancez", "launch"),
    ("TRANSFORMEZ", "TRANSFORM"),
    ("Transformez", "Transform"),
    ("transformez", "transform"),
    ("ATTIREZ", "ATTRACT"),
    ("Attirez", "Attract"),
    ("attirez", "attract"),
    ("GAGNEZ", "WIN"),
    ("Gagnez", "Win"),
    ("gagnez", "win"),
    ("DEVELOPPEZ", "DEVELOP"),
    ("Developpez", "Develop"),
    ("developpez", "develop"),
    ("DÉVELOPPEZ", "DEVELOP"),
    ("Développez", "Develop"),
    ("développez", "develop"),
    ("AUGMENTEZ", "INCREASE"),
    ("Augmentez", "Increase"),
    ("augmentez", "increase"),
    ("AMÉLIOREZ", "IMPROVE"),
    ("AMELIOREZ", "IMPROVE"),
    ("Améliorez", "Improve"),
    ("Ameliorez", "Improve"),
    ("améliorez", "improve"),
    ("ameliorez", "improve"),
    ("PROFITEZ", "BENEFIT"),
    ("Profitez", "Benefit"),
    ("profitez", "benefit"),
    ("CHOISISSEZ", "CHOOSE"),
    ("Choisissez", "Choose"),
    ("choisissez", "choose"),
    ("RÉSERVEZ", "BOOK"),
    ("RESERVEZ", "BOOK"),
    ("Réservez", "Book"),
    ("Reservez", "Book"),
    ("réservez", "book"),
    ("reservez", "book"),
    ("INSCRIVEZ-VOUS", "SIGN UP"),
    ("Inscrivez-vous", "Sign up"),
    ("inscrivez-vous", "sign up"),
    ("CLIQUEZ", "CLICK"),
    ("Cliquez", "Click"),
    ("cliquez", "click"),
    ("APPELEZ-NOUS", "CALL US"),
    ("Appelez-nous", "Call us"),
    ("appelez-nous", "call us"),
    ("REJOIGNEZ-NOUS", "JOIN US"),
    ("Rejoignez-nous", "Join us"),
    ("rejoignez-nous", "join us"),
    ("ÉCRIVEZ-NOUS", "WRITE TO US"),
    ("Écrivez-nous", "Write to us"),
    ("écrivez-nous", "write to us"),

    # Additional FR -ez imperatives still found
    ("payez", "pay"), ("Payez", "Pay"), ("PAYEZ", "PAY"),
    ("evitez", "avoid"), ("Evitez", "Avoid"), ("EVITEZ", "AVOID"),
    ("évitez", "avoid"), ("Évitez", "Avoid"), ("ÉVITEZ", "AVOID"),
    ("montrez", "show"), ("Montrez", "Show"), ("MONTREZ", "SHOW"),
    ("gardez", "keep"), ("Gardez", "Keep"), ("GARDEZ", "KEEP"),
    ("vendez", "sell"), ("Vendez", "Sell"), ("VENDEZ", "SELL"),
    ("laissez", "let"), ("Laissez", "Let"), ("LAISSEZ", "LET"),
    ("arretez", "stop"), ("Arretez", "Stop"), ("ARRETEZ", "STOP"),
    ("arrêtez", "stop"), ("Arrêtez", "Stop"), ("ARRÊTEZ", "STOP"),
    ("essayez", "try"), ("Essayez", "Try"), ("ESSAYEZ", "TRY"),
    ("achetez", "buy"), ("Achetez", "Buy"), ("ACHETEZ", "BUY"),
    ("hesitez", "hesitate"), ("Hesitez", "Hesitate"),
    ("hésitez", "hesitate"), ("Hésitez", "Hesitate"),
    ("attendez", "wait"), ("Attendez", "Wait"), ("ATTENDEZ", "WAIT"),
    ("utilisez", "use"), ("Utilisez", "Use"), ("UTILISEZ", "USE"),
    ("recevez", "receive"), ("Recevez", "Receive"), ("RECEVEZ", "RECEIVE"),
    ("trouvez", "find"), ("Trouvez", "Find"), ("TROUVEZ", "FIND"),
    ("partagez", "share"), ("Partagez", "Share"), ("PARTAGEZ", "SHARE"),
    ("téléchargez", "download"), ("Téléchargez", "Download"),
    ("telechargez", "download"), ("Telechargez", "Download"),
    ("installez", "install"), ("Installez", "Install"),
    ("sauvegardez", "save"), ("Sauvegardez", "Save"),
    ("publiez", "publish"), ("Publiez", "Publish"),
    ("écrivez", "write"), ("Écrivez", "Write"), ("ECRIVEZ", "WRITE"),
    ("ecrivez", "write"), ("Ecrivez", "Write"),
    ("notez", "note"), ("Notez", "Note"),
    ("donnez", "give"), ("Donnez", "Give"),
    ("investissez", "invest"), ("Investissez", "Invest"),
    ("prenez", "take"), ("Prenez", "Take"),
    ("venez", "come"), ("Venez", "Come"),
    ("soyez", "be"), ("Soyez", "Be"),
    ("commencez", "start"), ("Commencez", "Start"), ("COMMENCEZ", "START"),
    ("terminez", "finish"), ("Terminez", "Finish"),
    ("continuez", "continue"), ("Continuez", "Continue"),
    ("comparez", "compare"), ("Comparez", "Compare"),
    ("analysez", "analyze"), ("Analysez", "Analyze"),
    ("étudiez", "study"), ("Étudiez", "Study"),
    ("etudiez", "study"), ("Etudiez", "Study"),
    ("apprenez", "learn"), ("Apprenez", "Learn"),
    ("enseignez", "teach"), ("Enseignez", "Teach"),
    ("expliquez", "explain"), ("Expliquez", "Explain"),
    ("résumez", "summarize"), ("Résumez", "Summarize"),
    ("resumez", "summarize"), ("Resumez", "Summarize"),
    ("précisez", "specify"), ("Précisez", "Specify"),
    ("imaginez", "imagine"), ("Imaginez", "Imagine"),
    ("espérez", "hope"), ("Espérez", "Hope"),
    ("patientez", "be patient"), ("Patientez", "Be patient"),
    ("décidez", "decide"), ("Décidez", "Decide"),
    ("sélectionnez", "select"), ("Sélectionnez", "Select"),
    ("selectionnez", "select"), ("Selectionnez", "Select"),
    ("adoptez", "adopt"), ("Adoptez", "Adopt"),
    ("abandonnez", "abandon"), ("Abandonnez", "Abandon"),
    ("quittez", "leave"), ("Quittez", "Leave"),
    ("restez", "stay"), ("Restez", "Stay"),
    ("envoyez", "send"), ("Envoyez", "Send"),
    ("cachez", "hide"), ("Cachez", "Hide"),
    ("révélez", "reveal"), ("Révélez", "Reveal"),
    ("revelez", "reveal"), ("Revelez", "Reveal"),
    ("détaillez", "detail"), ("Détaillez", "Detail"),
    ("detaillez", "detail"), ("Detaillez", "Detail"),

    # Standalone single FR words (more risky — only when surrounded by spaces)
    # Handled later via regex word-boundary form
]

# Word-boundary single-word replacements (visible text only).
# Format: (pattern_str, replacement). pattern_str is matched as \bPATTERN\b
# case-insensitively, replacement preserves casing.
WORD_REPLACEMENTS = [
    # French determiners/pronouns that almost-always indicate untranslated text
    ("notre", "our"), ("nos", "our"), ("votre", "your"), ("vos", "your"),
    ("leur", "their"), ("leurs", "their"),
    ("avec", "with"), ("sans", "without"),
    ("dans", "in"), ("sur", "on"),
    ("très", "very"), ("trop", "too"),
    ("aussi", "also"), ("encore", "still"), ("jamais", "never"),
    ("toujours", "always"), ("souvent", "often"),
    ("mieux", "better"),
    ("ainsi", "thus"),
    ("alors", "then"),
    ("depuis", "since"),
    ("pendant", "during"),
    ("entre", "between"),
    ("contre", "against"),
    ("vers", "toward"),
    # Single-word residues now fairly safe in EN files
    ("vous", "you"),
    ("nous", "we"),
    ("est", "is"),
    ("sera", "will be"),
    ("son", "its"),
    ("sa", "its"),
    ("ses", "its"),
    ("une", "a"),
    ("qui", "which"),
    ("dont", "whose"),
    ("faire", "do"),
    ("fait", "does"),
    ("aux", "to"),
]


CASE_PRESERVE = {
    "upper": str.upper,
    "title": str.capitalize,
    "lower": str.lower,
}


def case_match(src: str) -> str:
    """Return mode of input casing: upper, title, lower, mixed."""
    if src.isupper():
        return "upper"
    if src[0].isupper() and src[1:].islower():
        return "title"
    if src.islower():
        return "lower"
    return "mixed"


def replace_word(text: str, fr: str, en: str) -> str:
    """Replace whole word fr → en, preserving casing of each occurrence.
    Only applies inside visible text (between > and <)."""
    pat = re.compile(rf"(?<![A-Za-zÀ-ÿ]){re.escape(fr)}(?![A-Za-zÀ-ÿ])", re.IGNORECASE)

    def sub(m):
        src = m.group(0)
        mode = case_match(src)
        if mode == "upper":
            return en.upper()
        if mode == "title":
            return en[:1].upper() + en[1:]
        return en
    return pat.sub(sub, text)


# Regex to walk through HTML, applying replacements only in text-content slices
TEXT_SLICE_RE = re.compile(r">([^<]+)<")
# We'll also touch alt= and placeholder= attribute values:
ATTR_RE = re.compile(r'(\b(?:alt|placeholder|title|aria-label)\s*=\s*")([^"]*)(")', re.IGNORECASE)
# And the contents of <title>...</title> (already covered by TEXT_SLICE_RE)


def apply_phrase(text: str, fr: str, en: str) -> str:
    if fr == en:
        return text
    return text.replace(fr, en)


def fix_text_chunk(chunk: str) -> str:
    out = chunk
    for fr, en in PHRASE_PAIRS:
        out = apply_phrase(out, fr, en)
    for fr, en in WORD_REPLACEMENTS:
        out = replace_word(out, fr, en)
    return out


def fix_html(html: str) -> str:
    # Skip <script> and <style> blocks: temporarily replace them.
    placeholders = []

    def stash(m):
        placeholders.append(m.group(0))
        return f"\x00PLACEHOLDER{len(placeholders) - 1}\x00"

    s = re.sub(r"<script\b.*?</script>", stash, html, flags=re.DOTALL | re.IGNORECASE)
    s = re.sub(r"<style\b.*?</style>", stash, s, flags=re.DOTALL | re.IGNORECASE)

    # Apply on text between tags.
    def text_repl(m):
        return ">" + fix_text_chunk(m.group(1)) + "<"
    s = TEXT_SLICE_RE.sub(text_repl, s)

    # Apply on attribute text-like values.
    def attr_repl(m):
        return m.group(1) + fix_text_chunk(m.group(2)) + m.group(3)
    s = ATTR_RE.sub(attr_repl, s)

    # Restore placeholders.
    def restore(m):
        idx = int(m.group(1))
        return placeholders[idx]
    s = re.sub(r"\x00PLACEHOLDER(\d+)\x00", restore, s)

    return s


def should_skip(p: Path) -> bool:
    s = str(p).replace("\\", "/")
    return any(x in s for x in SKIP_DIRS)


def main():
    target_args = sys.argv[1:]
    if target_args:
        files = [Path(a) if Path(a).is_absolute() else (ROOT / a) for a in target_args]
    else:
        files = [f for f in EN_DIR.rglob("*.html") if not should_skip(f)]

    changed = 0
    same = 0
    errors = 0
    for f in files:
        try:
            html = f.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            errors += 1
            continue
        new_html = fix_html(html)
        if new_html != html:
            f.write_text(new_html, encoding="utf-8", newline="")
            changed += 1
        else:
            same += 1

    print(f"changed: {changed}")
    print(f"unchanged: {same}")
    print(f"errors: {errors}")


if __name__ == "__main__":
    main()
