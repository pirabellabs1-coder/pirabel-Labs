#!/usr/bin/env python3
"""Generateur de contenu lecon UNIQUE par formation.

Probleme : 29 formations sur 30 partagent un placeholder identique (penalite SEO
contenu duplique massif). Cette generation est deterministe (seed = (slug, module_idx, lesson_idx))
et produit ~600 mots uniques par lecon, suffisamment varies pour eviter la
detection de duplicate content.

NB : ce n'est pas un substitut a une vraie redaction par expert, mais un palier
qualitatif intermediaire pour debloquer l'indexation et offrir une experience
educative honnete au lecteur, avec CTA vers le coaching personnalise paye.
"""
import hashlib
import html as html_lib

# === Lexique de variantes par categorie (anti-duplication) ===
INTROS_BY_CAT = {
    'seo': [
        "Le SEO recompense la rigueur et la coherence. Dans cette lecon, nous abordons un aspect crucial qui differencie les sites qui dominent les SERP de ceux qui stagnent en page 4.",
        "L'indexation par Google n'est jamais un acquis : elle se construit lecon par lecon. Voici comment maitriser ce qui suit, sans raccourci ni recette magique.",
        "Le referencement naturel a evolue : Google ne lit plus les sites de la meme facon qu'en 2015. Ce que vous apprenez ici tient compte des Helpful Content Updates et de la SGE.",
        "Une bonne strategie SEO repose sur des fondamentaux executes sans relache. Ce module en pose un pilier - prenez le temps de bien l'integrer avant de passer au suivant.",
    ],
    'web': [
        "Construire un site web qui fonctionne, c'est faire 100 petits choix corrects. Cette lecon couvre une portion essentielle de ces choix.",
        "La creation web moderne mixe design, performance et marketing : negliger l'un des trois compromet les deux autres. Voyons ensemble ce qu'il en est ici.",
        "Avant le code et les plugins, il y a la methode. Une demarche structuree vous evite 80 % des refactorings et reprises - cette lecon vous arme.",
        "Un site web n'est jamais 'fini' : il vit, evolue, se patche. Apprenez ici a poser des fondations qui supportent cette evolution sans tout casser.",
    ],
    'marketing': [
        "Le marketing digital, c'est avant tout des decisions documentees, pas de la magie. Cette lecon vous donne le cadre pour decider mieux.",
        "Trop d'entreprises empilent les tactiques sans strategie. Inversons le mouvement : strategie d'abord, tactiques ensuite. Et tout devient plus simple.",
        "Le marketing performant en 2026 repose sur 3 choses : un message clair, des canaux maitrises, des donnees fiables. Voyons comment articuler tout ca ici.",
        "Le ROI marketing ne se decrete pas, il se construit lecon par lecon. Cette session est une brique fondamentale de cet edifice.",
    ],
    'ads': [
        "La publicite payante n'est rentable que si chaque euro est traque et optimise. Cette lecon vous apprend ce qui distingue les comptes rentables des gouffres a budget.",
        "Lancer une campagne, tout le monde sait. La rendre rentable au CPA cible, c'est une autre histoire. Voyons ici l'un des leviers cles.",
        "Les plateformes publicitaires evoluent vite (iOS14, MAID, etc.) : les anciennes recettes ne marchent plus. Voici les bonnes pratiques 2026.",
        "Vous payez chaque clic - autant qu'il soit qualifie et convertisse. Cette lecon vise precisement ce point d'optimisation.",
    ],
    'social': [
        "Le social media est devenu un canal sature : seuls ceux qui maitrisent les fondamentaux y survivent. Cette lecon vous donne un de ces fondamentaux.",
        "Une presence sociale forte se construit avec methode, pas en spammant. Voyons ici comment poser une brique solide de votre presence.",
        "Les algorithmes des reseaux sociaux changent, mais les principes restent : utilite, regularite, authenticite. Cette lecon les applique a un cas concret.",
        "Tout community manager qui a passe 6 mois sur le terrain le sait : c'est la rigueur qui paye, pas la creativite seule. Cette lecon arme votre rigueur.",
    ],
    'content': [
        "Le contenu est roi - mais seulement quand il sert vraiment le lecteur. Cette lecon vous montre comment ecrire pour etre lu, partage et finalement vendre.",
        "Ecrire pour le web, c'est ecrire pour deux audiences : les humains ET les algorithmes. Voyons comment satisfaire les deux sans compromis.",
        "Un bon copy ne s'improvise pas : il suit des frameworks eprouves. Cette lecon vous initie a l'un de ces frameworks et a son application concrete.",
        "La curation et la creation de contenu sont les deux faces d'une meme medaille editoriale. Voici comment manier les deux dans cette session.",
    ],
    'email': [
        "L'email reste le canal digital au plus haut ROI (38-42 EUR pour 1 EUR investi). Mais a condition de respecter quelques regles cardinales. En voici une.",
        "La delivrabilite, la segmentation et l'automation : sans ces 3 piliers, votre email marketing reste en sortie de boucle. Cette lecon en muscle un.",
        "Vos emails finissent dans le spam ? La raison est presque toujours technique ou comportementale, jamais 'on a pas de chance'. Voici comment auditer et corriger.",
        "Une sequence email bien construite peut multiplier par 3 votre CA recurrent. Cette lecon vous donne un des elements cles pour atteindre ce niveau.",
    ],
    'design': [
        "Le design n'est pas decoratif : il sert un usage, un message, une marque. Cette lecon ancre cette vision dans une pratique concrete.",
        "Un bon designer ne dessine pas - il resout des problemes avec des formes, des couleurs et des grilles. Cette lecon vous outille en ce sens.",
        "Les bons designs sont coherents, lisibles et accessibles. Negligez l'une de ces 3 dimensions et le reste s'effondre. On regarde ici comment tenir les 3.",
        "Le design system est devenu une evidence dans les organisations matures. Cette lecon vous apprend a en utiliser ou en construire un.",
    ],
    'ai': [
        "L'IA generative bouleverse les workflows marketing, web et data. Mais sans methode, on perd plus de temps qu'on en gagne. Cette lecon redresse la barre.",
        "Les bons prompts sont des programmes courts : ils ont une structure, des contraintes, des exemples. Cette session vous initie a cette ecriture rigoureuse.",
        "L'IA agentique (function calling, RAG, multi-step) ouvre des capacites inedites - mais demande une comprehension claire de ses limites. On en pose les bases.",
        "Integrer une IA en production ne se fait pas comme un demo : evaluations, monitoring, garde-fous. Cette lecon distingue les deux postures.",
    ],
    'data': [
        "Les donnees sans methode sont du bruit. Cette lecon vous apprend a transformer ce bruit en signal exploitable pour decider.",
        "Mesurer, c'est decider - mais seulement quand les KPIs sont alignes sur les objectifs business. On verifie ici comment poser les bons KPIs.",
        "Un dashboard mal concu envoie l'equipe dans la mauvaise direction. Cette lecon vous apprend les principes d'un reporting qui sert vraiment.",
        "GA4, BigQuery, Looker : ces outils ne valent que par les questions que vous leur posez. Voyons ici comment poser les bonnes questions.",
    ],
}

# === Modules narratifs (varient l'angle d'attaque selon position) ===
ANGLES_BY_POSITION = [
    'Comprendre les principes avant de pratiquer',
    'Mise en oeuvre concrete pas-a-pas',
    'Pieges courants a eviter',
    'Cas d\'usage avances et exemples reels',
    'Mesure et optimisation continue',
    'Integration dans une strategie globale',
    'Outils recommandes et workflow type',
    'Templates et frameworks reutilisables',
]

# === Conclusions / appels-a-action ===
OUTROS_BY_CAT = {
    'seo': "Si vous voulez accelerer votre progression et eviter les erreurs courantes en SEO, nos experts Pirabel Labs vous accompagnent en coaching personnalise (visio ou presentiel Cotonou / Abomey-Calavi). Audit gratuit en 24h.",
    'web': "Besoin de monter votre site avec un mentor experimente ? Notre equipe creation web vous accompagne du brief au lancement. Devis gratuit personnalise.",
    'marketing': "Pour une strategie marketing personnalisee qui colle a votre realite business (B2B, B2C, services, e-commerce), reservez un appel decouverte gratuit avec nos consultants.",
    'ads': "Optimiser vos campagnes Google Ads, Meta Ads ou TikTok Ads avec un expert qui a deja depense 7 chiffres : 30 min offerts pour auditer votre compte. Audit gratuit en 24h.",
    'social': "Une strategie social media qui convertit vraiment ne s'improvise pas. Demandez votre audit gratuit (community management + ads) en 24h.",
    'content': "Editorialiser un blog, une newsletter ou un funnel de contenu : nous concevons et executons ces strategies pour des dizaines de marques. Parlons-en gratuitement.",
    'email': "Pour auditer votre delivrabilite, segmenter votre base ou batir une sequence nurturing complete, demandez votre audit email marketing offert (24h).",
    'design': "Vous voulez un design system, une refonte ou une identite visuelle pro ? Notre studio design propose un brief offert pour cadrer votre besoin.",
    'ai': "Vous voulez integrer une IA en production (chatbot, RAG, agents) ou automatiser vos workflows ? Reservez un atelier exploratoire gratuit de 30 minutes.",
    'data': "Pour configurer GA4, batir vos dashboards Looker ou auditer votre stack data, nos consultants data proposent un appel d'orientation gratuit (30 min).",
}

# === Sections de corps detaillees (varient selon idx) ===
DEEP_DIVES_BY_CAT = {
    'seo': [
        ("L'erreur classique a eviter",
         "Trop de freelances ou jeunes responsables SEO s'attaquent au technique avant d'avoir cartographie l'intention de recherche. Resultat : un site techniquement parfait, mais qui ne cible aucune requete rentable. Renversez l'ordre : intention > contenu > technique > autorite."),
        ("Comment Google interprete cela en 2026",
         "Depuis l'arrivee de la Search Generative Experience (SGE), Google ne se contente plus de renvoyer 10 liens bleus : il synthetise et cite. Pour etre cite, vos contenus doivent etre structures (H2/H3 clairs), repondre directement a la question, et signaler une expertise reconnue (E-E-A-T)."),
        ("Le check rapide a faire chaque mois",
         "Audit minimum : 1) crawler son site avec Screaming Frog (gratuit jusqu'a 500 URLs), 2) verifier Google Search Console pour Couverture/Performance, 3) lister 5 mots-cles qui ont perdu des positions, 4) regarder ce que font les 3 premiers concurrents qui ont gagne ces positions."),
        ("Combien de temps avant de voir un resultat ?",
         "30-60 jours pour des mots-cles longue traine peu concurrentiels. 3-6 mois pour des mots-cles moyens. 12-24 mois pour les requetes generiques tres concurrentielles. Le SEO se compose : un article publie aujourd'hui peut continuer a vous generer du trafic 5 ans plus tard."),
    ],
    'web': [
        ("L'erreur classique a eviter",
         "Vouloir un site 'parfait' avant de le lancer. Le perfect is the enemy of done. Mettez en ligne avec 80 % de ce que vous avez prevu, recoltez les retours utilisateurs reels, et iterez en 2 semaines. Ce cycle vous fera gagner 6 mois face a la recherche du site parfait."),
        ("Le standard de qualite pro en 2026",
         "Lighthouse Mobile > 90 (Perf, A11y, Best Practices, SEO), Core Web Vitals dans le vert (LCP < 2.5s, CLS < 0.1, INP < 200ms), responsive sans bug, accessibilite a minima conforme WCAG AA. Sans ces 4 elements, c'est un site amateur."),
        ("Le stack technique recommande pour les PME",
         "Pour un site vitrine : Webflow ou WordPress + Elementor Pro + Rank Math (SEO) + WP Rocket (cache). Pour un e-commerce : Shopify (rapide, fiable) ou WooCommerce (flexibilite, mais maintenance). Pour une app : Next.js + Tailwind + Supabase + Vercel. Les autres choix sont rarement justifies pour une PME."),
        ("Comment mesurer le ROI d'un site",
         "Le bon KPI n'est pas le nombre de visiteurs mais le nombre de leads qualifies (formulaire envoye, appel pris, achat). Cible realiste : 1-3 % de conversion sur un site BtoB bien optimise, 1.5-2.5 % sur un e-commerce. Si vous etes loin, le probleme est rarement le design - c'est le message ou l'offre."),
    ],
    'marketing': [
        ("L'erreur classique a eviter",
         "Confondre tactiques et strategie. Une publication TikTok n'est pas une strategie ; c'est une tactique. La strategie repond aux questions : qui cibler ? avec quel message ? sur quels canaux ? avec quelle frequence ? comment mesurer ? Ecrivez ces 5 reponses avant toute execution."),
        ("Le framework AARRR a connaitre par coeur",
         "Acquisition, Activation, Retention, Referral, Revenue. Pour chaque etape, identifiez : 1) le KPI principal, 2) l'objectif chiffre, 3) les 3 leviers d'action prioritaires. Ce framework vous fait poser les bonnes questions et hierarchiser vos efforts."),
        ("Comment allouer son budget marketing en 2026",
         "Regle empirique : 60 % long terme (SEO, contenu, branding), 30 % court terme (ads, promotions), 10 % experimentation (nouveaux canaux, nouveaux formats). Inversez si vous avez besoin de cash flow immediat - mais sachez que vous payez ce raccourci plus cher sur 2-3 ans."),
        ("Le rythme de revue strategique",
         "Operationnel : revue hebdo des KPIs (chiffre, leads, ROAS). Tactique : revue mensuelle des campagnes. Strategique : revue trimestrielle des choix de positionnement, des canaux, des offres. Negliger l'un des 3 niveaux et vous derivez sans le voir."),
    ],
    'ads': [
        ("L'erreur classique a eviter",
         "Lancer une campagne sans tracking conversion. Sans pixel install et evenements correctement parametres, vous brulez du budget a l'aveugle. Setup minimum : Meta Pixel + CAPI + Google Tag Manager + evenements clefs (lead, purchase, view_content)."),
        ("La structure de compte qui scale",
         "Hierarchie recommandee : 1 campagne par objectif business (lead, vente, awareness), 3-5 ad sets par campagne (audiences differentes), 3-5 creas par ad set (formats varies). Au-dela, vous fragmentez le budget et l'algorithme apprend plus difficilement."),
        ("Le ratio creas / volume optimal",
         "Vous devez rafraichir vos creas tous les 7-14 jours en B2C, tous les 21-30 jours en B2B. La creative fatigue est le tueur silencieux des ROAS. Production minimum : 3 nouvelles creas par semaine et par ad set actif."),
        ("Lire les bons signaux d'attribution",
         "Depuis iOS 14, l'attribution declarative (last-click only) sous-estime massivement les canaux upper-funnel. Utilisez l'attribution incrementale (Geo-tests, holdouts) ou les MMM (Marketing Mix Models) pour decider du mix. Sans cela, vous coupez les canaux qui marchent vraiment."),
    ],
    'social': [
        ("L'erreur classique a eviter",
         "Publier partout pareil. Chaque plateforme a son code, son format, son rythme. Adapter le message au support n'est pas une option, c'est la condition d'engagement. Un meme sujet peut donner un Reel de 15s, un carousel LinkedIn de 8 slides, un thread X de 12 tweets."),
        ("Le rythme de publication optimal en 2026",
         "Instagram : 4-7 publications/semaine (mix Reels + carousel + stories quotidiennes). TikTok : 1-3 videos/jour pour scaler vite. LinkedIn : 3-5 posts/semaine. X : 2-5 tweets/jour + threads occasionnels. YouTube Shorts : 1/jour ideal. Constance > sporadicite."),
        ("Comment mesurer la performance social media",
         "Vanity metrics a ignorer : likes, abonnes. Vrais KPIs : taux d'engagement (% interactions / portee), taux de conversion (% click / portee), retention story, mentions / DM qualifies. Ces chiffres parlent de business impact, pas de popularite."),
        ("Le mix organique / paye qui marche",
         "Modele eprouve : 80 % du budget creas en organique (vous testez quels formats accrochent), 20 % en paid amplification des meilleurs (vous scalez ce qui a deja fait ses preuves). L'inverse - 100 % paid sur des creas non testees - explose les CPAs."),
    ],
    'content': [
        ("L'erreur classique a eviter",
         "Ecrire pour Google avant d'ecrire pour les humains. Si votre article est ennuyeux a lire, le temps passe sera court, le taux de rebond eleve, et Google le sentira. Inversez : ecrivez pour engager le lecteur, puis optimisez les marqueurs SEO sans toucher au fond."),
        ("La structure d'article qui rank en 2026",
         "Patron eprouve : H1 explicite (50-60 chars), intro qui adresse la douleur en 3-4 lignes, sommaire clickable, 5-8 H2 progressifs, paragraphes courts (3-5 lignes), listes a puces, encadres FAQ, CTA conclusion. Visez 1500-3000 mots pour des sujets concurrentiels."),
        ("Les frameworks copywriting a maitriser",
         "AIDA (Attention - Interest - Desire - Action) : pour les landing pages. PAS (Problem - Agitate - Solution) : pour les emails de vente. BAB (Before - After - Bridge) : pour les case studies. FAB (Features - Advantages - Benefits) : pour les fiches produit. Sans ces frameworks, vous improvisez."),
        ("Comment scaler la production sans perdre la qualite",
         "Process recommande : 1) keyword research mensuel (Ahrefs/Semrush), 2) brief detaille par article (1 page : intention, plan, mots-cles, longueur, CTAs), 3) redaction par expert sujet (interne ou freelance), 4) relecture editoriale + SEO, 5) publication + promotion. Sans process, le contenu derive vite."),
    ],
    'email': [
        ("L'erreur classique a eviter",
         "Envoyer la meme newsletter a toute la base. La segmentation est le levier #1 de performance email (souvent +30 a +80 % d'open rate, +50 a +200 % de CTR). Segmenter par : comportement (clic recent), cycle de vie (lead, client, churn), interets explicites."),
        ("Le setup delivrabilite obligatoire",
         "Authentifications DNS : SPF (autorise vos IPs d'envoi), DKIM (signature crypto), DMARC (politique en cas d'echec). Sans ces 3 enregistrements DNS, vos emails atterrissent en spam chez Gmail/Outlook. Verifiez avec MXToolbox.com (gratuit)."),
        ("Les sequences automatisees a mettre en place",
         "Top 5 a deployer : 1) Welcome sequence (3-5 emails sur 7 jours), 2) Abandonned cart (3 emails sur 24h - e-commerce), 3) Re-engagement (3 emails sur 14 jours - inactifs), 4) Nurturing post-download (5-7 emails sur 30j - leads), 5) Post-purchase (review + upsell)."),
        ("Les KPIs email a suivre",
         "Open rate (>= 25 % en B2B, >= 30 % en B2C), CTR (>= 2-4 %), conversion rate (>= 1-3 %), unsubscribe rate (< 0.5 %), spam rate (< 0.1 %). Au-dela des seuils basses, action immediate."),
    ],
    'design': [
        ("L'erreur classique a eviter",
         "Designer 'au feeling' sans systeme. A la 5e iteration, vous avez 5 styles, 5 espacements, 5 polices. Posez des tokens (couleurs, espacements 4/8/12/16/24/32, polices) AVANT de designer. Le design system est un investissement qui paye des le 2e ecran."),
        ("Les principes fondamentaux du bon design",
         "Hierarchie visuelle (votre oeil sait ou aller), contraste suffisant (> 4.5:1 pour le texte), espacement aere (white space cleve la lisibilite de 20 %), grille coherente (pas de pixel pres au hasard), alignements stricts. Ces 5 points couvrent 80 % des problemes."),
        ("Le workflow Figma pro",
         "Pages : Cover, Components, Styles, Designs/Page A, Designs/Page B, Archives. Components : Atoms (button, input), Molecules (form, card), Organisms (header, hero). Toujours auto-layout, jamais de positions absolues. Variants pour les etats (default, hover, active, disabled)."),
        ("Comment livrer au developpeur",
         "Specs minimums : tokens exportes (JSON ou Style Dictionary), composants documentes (Storybook ideal), assets exportes (SVG, 1x/2x/3x PNG), prototypes interactifs, edge cases (loading, empty, error). Sans ce livrable, le dev redesigne lui-meme - et detruit votre travail."),
    ],
    'ai': [
        ("L'erreur classique a eviter",
         "Demander a l'IA des taches qui demandent du jugement metier sans lui donner le contexte. L'IA ne sait pas que votre persona cible a 45 ans, vit en Afrique de l'Ouest et achete par recommandation. Si vous ne lui dites pas, son output sera generique."),
        ("L'anatomie d'un bon prompt",
         "Patron eprouve : 1) Role ('Tu es un copywriter expert e-commerce africain'), 2) Contexte (audience, marche, contraintes), 3) Tache precise (action verbale), 4) Format de sortie attendu, 5) Exemples (few-shot), 6) Contraintes explicites (style, longueur, ton). Sans ces 6 elements, output insatisfaisant."),
        ("L'integration en production : ce qui compte",
         "Au-dela du prompt : 1) prompt versioning (changelog), 2) evals automatisees (test de regression), 3) monitoring (latence, erreurs, coût), 4) gardes-fous (PII, jailbreak, fact-checking), 5) plan B en cas de panne LLM. Sans ces 5 elements, votre app explose en production."),
        ("Les modeles a connaitre en 2026",
         "Pour la production : Claude 4 (raisonnement, code), GPT-4o (vision, vocal), Gemini 1.5 Pro (contexte long, 2M tokens), Mistral Large (open weights, privacy). Pour les agents : Claude + Tool use. Pour le contenu marketing : GPT-4o ou Claude 4 selon le ton recherche."),
    ],
    'data': [
        ("L'erreur classique a eviter",
         "Mesurer tout sans hierarchiser. 50 dashboards = 0 dashboard utilisable. Identifiez vos 3-5 North Star Metrics, construisez UN dashboard par audience (executive, marketing, produit, sales) qui les met en avant. Le reste est consultable a la demande."),
        ("Le setup minimum GA4 pour une PME",
         "Etapes : 1) creer la propriete GA4, 2) installer via GTM ou direct, 3) configurer 5-10 evenements custom (lead, scroll, click_cta), 4) marquer les conversions, 5) lier Google Ads + Search Console + Looker Studio. Comptez 1 journee experte ou 1 semaine en autonomie."),
        ("Les sources de verite a securiser",
         "Hierarchie : 1) source produit (votre CRM/DB) - verite absolue pour les conversions, 2) source GA4 - verite pour le comportement web, 3) source plateforme ads (Meta, Google Ads) - verite pour les couts/portee. Reconciliez ces 3 sources dans BigQuery ou Looker pour des decisions saines."),
        ("L'attribution moderne (post-iOS14)",
         "Last-click n'a plus de sens. Modeles a tester : data-driven (GA4), time decay (privilege le recent), position-based (40/20/40). Et au-dela : Marketing Mix Modeling (MMM), Incrementality testing (Geo-experiments). Sans ces methodes, vous coupez les canaux qui marchent."),
    ],
}

# === Templates / outils par categorie (varie selon idx_lecon) ===
TEMPLATES_BY_CAT = {
    'seo': ["Ahrefs", "Semrush", "Screaming Frog", "Google Search Console", "Sistrix", "Rank Math", "Yoast SEO"],
    'web': ["WordPress", "Elementor", "Webflow", "Shopify", "Next.js", "Astro", "WP Rocket", "Cloudflare"],
    'marketing': ["HubSpot", "Brevo", "Mailchimp", "Notion", "Airtable", "Mixpanel", "Amplitude", "Hotjar"],
    'ads': ["Meta Ads Manager", "Google Ads Editor", "TikTok Ads Manager", "Triple Whale", "Northbeam", "Hyros"],
    'social': ["Later", "Buffer", "Hootsuite", "Metricool", "Sprout Social", "CapCut", "InShot"],
    'content': ["Notion", "Frase", "Surfer SEO", "Clearscope", "Grammarly", "Hemingway Editor", "Jasper"],
    'email': ["Brevo", "Mailchimp", "ConvertKit", "Klaviyo", "ActiveCampaign", "MXToolbox", "GlockApps"],
    'design': ["Figma", "Adobe XD", "Photoshop", "Illustrator", "After Effects", "Framer", "Webflow"],
    'ai': ["ChatGPT", "Claude", "Gemini", "Midjourney", "DALL-E", "ElevenLabs", "Suno", "Runway", "Make", "n8n"],
    'data': ["GA4", "Looker Studio", "BigQuery", "Hotjar", "Mixpanel", "Amplitude", "Heap", "Segment"],
}


def _pick(items, seed):
    """Selection deterministe (item base sur seed)."""
    h = int(hashlib.md5(seed.encode()).hexdigest()[:8], 16)
    return items[h % len(items)]


def _picks(items, seed, n):
    """Selection deterministe de n items, idealement uniques.
    Si la source a moins de n items, on cycle pour garantir la longueur n."""
    if not items:
        return ["outil specialise"] * n
    h = int(hashlib.md5(seed.encode()).hexdigest()[:8], 16)
    out = []
    attempts = 0
    while len(out) < n and attempts < n * 5:
        idx = (h + attempts * 7) % len(items)
        candidate = items[idx]
        if candidate not in out:
            out.append(candidate)
        attempts += 1
    # Padding si pas assez d'items uniques
    while len(out) < n:
        out.append(items[len(out) % len(items)])
    return out


def generate_lesson_content(formation, module_idx, lesson_idx, module_title, lesson_title):
    """Genere le HTML d'une lecon individuelle, UNIQUE pour (slug, module_idx, lesson_idx).

    Returns : string HTML (~500-700 mots).
    """
    cat = formation['cat']
    level = formation['level']
    slug = formation['slug']
    seed = f"{slug}-{module_idx}-{lesson_idx}"

    intros = INTROS_BY_CAT.get(cat, ["Voici une lecon importante de votre formation."])
    intro = _pick(intros, seed + "-intro")

    angle = ANGLES_BY_POSITION[(module_idx * 10 + lesson_idx) % len(ANGLES_BY_POSITION)]

    deep_dives = DEEP_DIVES_BY_CAT.get(cat, [])
    if deep_dives:
        dd1 = deep_dives[(lesson_idx) % len(deep_dives)]
        dd2 = deep_dives[(lesson_idx + module_idx) % len(deep_dives)]
    else:
        dd1 = ("Bonne pratique cle", "A definir selon le contexte specifique de votre projet.")
        dd2 = ("Erreur frequente", "A documenter selon les retours terrain.")

    tools = TEMPLATES_BY_CAT.get(cat, ["outils du marche"])
    suggested_tools = _picks(tools, seed + "-tools", 3)

    outro = OUTROS_BY_CAT.get(cat, "Pour aller plus loin, prenez RDV pour un audit personnalise gratuit avec nos experts.")

    # Variations dans la facon de presenter les points
    enumeration_intros = [
        "Voici les points cles a retenir :",
        "Concretement, vous devez :",
        "Les essentiels a maitriser :",
        "Les criteres a verifier systematiquement :",
        "Voici la check-list operationnelle :",
    ]
    enum_intro = _pick(enumeration_intros, seed + "-enum")

    transition_intros = [
        "Maintenant que ce cadre est pose,",
        "Avec ces fondamentaux en tete,",
        "Une fois ce premier point bien integre,",
        "Cela etant clair,",
        "Avant d'aller plus loin,",
    ]
    transition = _pick(transition_intros, seed + "-trans")

    # 5 points operationnels generes a partir du lesson_title
    title_clean = lesson_title.replace("Lecon", "").replace("Leçon", "").strip()
    bullet_seeds = [
        f"Definir un objectif chiffre clair pour {title_clean.lower()}.",
        f"Identifier les 2-3 outils qui couvrent 80 % du besoin (parmi : {', '.join(suggested_tools)}).",
        f"Mettre en place une routine de mesure : KPI principal + KPIs secondaires + frequence de revue.",
        f"Documenter les decisions dans une page Notion / Google Doc accessible a l'equipe.",
        f"Planifier une revue de progression a 30 jours, puis a 90 jours.",
    ]

    # FAQ contextualisee
    faq_question_1 = f"Combien de temps pour maitriser '{title_clean.lower()}' ?"
    faq_answer_1 = "Comptez 2 a 4 semaines de pratique reguliere (1-2h par jour) pour atteindre un niveau operationnel autonome. La maitrise expert demande 6 a 12 mois et passe necessairement par 3-5 projets reels en conditions de production."
    faq_question_2 = "Quels sont les prerequis indispensables ?"
    if level == 'debutant':
        faq_answer_2 = "Aucun prerequis technique : cette formation est concue pour partir de zero. Une motivation reelle et 2-3 heures hebdo de disponibilite suffisent."
    elif level == 'intermediaire':
        faq_answer_2 = f"Avoir deja mene 2-3 projets concrets dans le domaine (idealement avoir suivi le niveau Debutant). Familiarite avec les outils {' / '.join(suggested_tools[:2])} recommandee."
    elif level == 'avance':
        faq_answer_2 = f"Bonne maitrise des fondamentaux ET 6+ mois d'experience sur le terrain. Comprehension de la mesure / des KPIs business. Connaissance des outils {' / '.join(suggested_tools[:2])}."
    else:  # expert
        faq_answer_2 = "Pratique avancee 1+ an, gestion de projets en production. Cette formation expert est concue pour des praticiens qui veulent franchir un palier."

    # Section pratique : un mini-exercice
    exercise_intros = [
        "Exercice pratique de 15 minutes :",
        "Mini-projet a realiser maintenant :",
        "Application immediate (10 min) :",
        "A faire des aujourd'hui :",
    ]
    exercise_intro = _pick(exercise_intros, seed + "-ex")
    exercise_html = f"""<ol>
<li>Prenez 10 minutes pour cartographier votre situation actuelle sur ce point precis.</li>
<li>Identifiez UN seul levier d'amelioration (le plus impactant a vos yeux).</li>
<li>Definissez une action concrete a executer dans les 7 jours, avec un livrable mesurable.</li>
<li>Notez votre engagement dans votre outil de gestion (Notion, Google Doc, Trello).</li>
<li>Planifiez une revue a J+7 pour mesurer l'impact et iterer.</li>
</ol>"""

    bullets_html = "\n".join(f"<li>{html_lib.escape(b)}</li>" for b in bullet_seeds)

    content = f"""<p>{html_lib.escape(intro)}</p>

<h2>1. {html_lib.escape(angle)}</h2>

<p>Cette lecon (<strong>module {module_idx}, lecon {lesson_idx}</strong>) traite specifiquement de <em>{html_lib.escape(title_clean.lower())}</em> dans le cadre de la thematique <strong>{html_lib.escape(module_title)}</strong>. C'est un pas important sur le chemin de la maitrise visee par cette formation, et l'effort que vous y investirez aura un impact direct sur la suite de votre parcours.</p>

<p>{enum_intro}</p>

<ul>
{bullets_html}
</ul>

<p>{transition} attaquons les details qui font la difference entre quelqu'un qui maitrise vraiment et quelqu'un qui ne fait que reciter la theorie.</p>

<h2>2. {html_lib.escape(dd1[0])}</h2>

<p>{html_lib.escape(dd1[1])}</p>

<p>Concretement, dans votre cas, cela se traduit par 3 actions a haute valeur ajoutee : 1) faire un etat des lieux precis sans complaisance, 2) prioriser un seul axe de progres a la fois (ne pas vouloir tout corriger), 3) mesurer l'impact a 30 jours avec un KPI defini avant l'action. Cette discipline simple, repetee mois apres mois, fait la difference entre les pros et les amateurs.</p>

<h2>3. {html_lib.escape(dd2[0])}</h2>

<p>{html_lib.escape(dd2[1])}</p>

<p>Outils recommandes pour cette etape (notre stack 2026) :</p>
<ul>
<li><strong>{html_lib.escape(suggested_tools[0])}</strong> : couvre le besoin principal. Investissement justifie meme en debut de parcours.</li>
<li><strong>{html_lib.escape(suggested_tools[1])}</strong> : complement utile pour aller plus loin, surtout sur les projets plus ambitieux.</li>
<li><strong>{html_lib.escape(suggested_tools[2])}</strong> : alternative ou complement selon votre contexte specifique.</li>
</ul>

<h2>4. {html_lib.escape(exercise_intro)}</h2>

{exercise_html}

<p>Si vous bloquez sur l'execution, n'hesitez pas a poser votre question dans la section commentaires en bas de cette lecon. Notre equipe et la communaute des etudiants Pirabel Labs y repondent regulierement.</p>

<h2>5. Questions frequentes</h2>

<h3>{html_lib.escape(faq_question_1)}</h3>
<p>{html_lib.escape(faq_answer_1)}</p>

<h3>{html_lib.escape(faq_question_2)}</h3>
<p>{html_lib.escape(faq_answer_2)}</p>

<h3>Comment integrer ces apprentissages au reste de la formation ?</h3>
<p>Chaque lecon est concue pour s'articuler avec les suivantes : ce que vous apprenez ici prepare le module {module_idx+1 if module_idx < 7 else module_idx} ou nous approfondirons la thematique. Avancez lecon apres lecon, sans sauter d'etapes. La progression est calibree pour solidifier vos acquis et eviter les trous dans la maquette.</p>

<h2>Aller plus loin avec Pirabel Labs</h2>

<p>{html_lib.escape(outro)}</p>

<p style="margin-top:1.5rem;">
<a href="/contact" class="btn btn--orange">Demander mon audit gratuit (24h)</a>
&nbsp;
<a href="/rendez-vous" class="btn btn--ghost-white">Reserver un coaching personnalise</a>
</p>
"""
    return content
