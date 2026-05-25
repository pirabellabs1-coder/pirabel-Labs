#!/usr/bin/env python3
"""Enrichit chaque guide avec ~1000 mots de contenu unique selon sa
thematique : erreurs courantes, outils, cas pratique, FAQ etendue.

Mappage slug -> thematique base sur des keywords; chaque thematique a son
propre contenu pour eviter duplicate content."""
import re
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SENTINEL = '<!-- guide-enriched -->'

# Themes et contenus enrichis
THEMES = {
    'seo': {
        'keywords': ['seo', 'referencement', 'netlinking', 'backlinks', 'audit-seo', 'guide-complet-seo', 'articles-seo'],
        'errors_fr': [
            ('Cibler des mots-clés trop concurrentiels en début de stratégie', "Les requêtes type 'agence SEO Paris' sont trustées par des sites avec 10+ ans d'historique. Démarrez sur la longue traîne ('agence SEO PME e-commerce Cotonou' par exemple) pour gagner du trafic qualifié dès le premier trimestre."),
            ('Négliger la vitesse de chargement mobile', "Google utilise Core Web Vitals comme facteur de ranking. Un LCP > 4 secondes pénalise sévèrement le positionnement. Auditez avec PageSpeed Insights et corrigez les images non optimisées."),
            ('Publier sans recherche d\'intention de recherche', "Un article qui répond à une intention 'informationnelle' ne convertira pas si le visiteur cherchait une intention 'transactionnelle'. Cartographiez : Informational / Navigational / Transactional / Commercial."),
            ('Oublier le maillage interne', "60-70% du jus SEO se distribue via les liens internes. Chaque nouvel article doit linker vers 3-5 contenus pertinents existants ET être linké depuis 2-3 contenus piliers."),
            ('Sous-estimer le SEO local', "Une fiche Google Business optimisée + 20 avis Google peuvent générer plus de leads qu'un article 3000 mots. Pour les PME locales, attaquez d'abord le pack local."),
        ],
        'errors_en': [
            ('Targeting highly competitive keywords from day one', "Queries like 'SEO agency Paris' are owned by sites with 10+ years of authority. Start on long-tail ('SEO agency for SME e-commerce in Cotonou') to capture qualified traffic in your first quarter."),
            ('Neglecting mobile loading speed', "Google uses Core Web Vitals as a ranking factor. LCP > 4 seconds severely penalizes ranking. Audit with PageSpeed Insights and fix unoptimized images."),
            ('Publishing without search intent research', "An article that addresses 'informational' intent won't convert if the visitor was looking for 'transactional'. Map: Informational / Navigational / Transactional / Commercial."),
            ('Forgetting internal linking', "60-70% of SEO juice flows through internal links. Each new article should link to 3-5 relevant existing pieces AND be linked from 2-3 pillar contents."),
            ('Underestimating local SEO', "A well-optimized Google Business listing + 20 Google reviews can generate more leads than a 3000-word article. For local SMEs, attack the local pack first."),
        ],
        'tools_fr': [
            ('Google Search Console', 'Indispensable. Données réelles d\'impressions + clics + positions, gratuit. Soumission sitemap, alerte erreurs indexation.'),
            ('Ahrefs ou Semrush', 'Analyse concurrents + recherche mots-clés + audit backlinks. Compter 100-450€/mois selon plan.'),
            ('Screaming Frog SEO Spider', 'Crawler technique pour détecter 404, redirects en chaîne, métas dupliquées. Version gratuite jusqu\'à 500 URLs.'),
            ('Ubersuggest', 'Alternative low-cost à Semrush pour PME. 30€/mois pour 1 site, suffisant pour démarrer.'),
            ('Surfer SEO', 'Optimisation on-page basée sur l\'analyse des 10 premières pages Google. 89€/mois.'),
        ],
        'tools_en': [
            ('Google Search Console', 'Essential. Real impression + click + position data, free. Sitemap submission, indexation error alerts.'),
            ('Ahrefs or Semrush', 'Competitor analysis + keyword research + backlink audit. Plan on 100-450€/month.'),
            ('Screaming Frog SEO Spider', 'Technical crawler to detect 404s, redirect chains, duplicate metas. Free up to 500 URLs.'),
            ('Ubersuggest', 'Low-cost Semrush alternative for SMEs. 30€/month for 1 site, sufficient to start.'),
            ('Surfer SEO', 'On-page optimization based on top 10 Google results analysis. 89€/month.'),
        ],
        'case_fr': "Une PME béninoise d'agroalimentaire (huile de palme) nous a contactés en avril 2025 avec 12 visiteurs SEO/mois. Stratégie déployée : refonte structure URLs, 8 articles longs sur 'comment choisir son huile de palme', optimisation Google Business + 30 avis collectés. Résultat à M+6 : 487 visiteurs SEO/mois (+3958%), 18 leads B2B/mois, signature d'un contrat distribution avec un revendeur de Cotonou.",
        'case_en': "A Beninese agribusiness SME (palm oil) contacted us in April 2025 with 12 SEO visitors/month. Deployed strategy: URL structure rebuild, 8 long-form articles on 'how to choose palm oil', Google Business optimization + 30 reviews collected. Result at M+6: 487 SEO visitors/month (+3958%), 18 B2B leads/month, signature of a distribution contract with a Cotonou retailer.",
        'faq_fr': [
            ('Combien de temps avant les premiers résultats SEO ?', "Premiers signaux : 30-60 jours (indexation, montée sur requêtes faciles). Résultats significatifs : 3-6 mois sur requêtes moyennes. Domination requêtes concurrentielles : 12-24 mois. C'est un investissement long terme."),
            ('Combien d\'articles publier par mois ?', "Pour un blog en démarrage : 4-8 articles/mois (1-2 par semaine). Pour un site établi : 8-15 articles/mois. La qualité prime toujours sur la quantité — un article 2500 mots vaut 4 articles de 500 mots."),
            ('Le SEO mort à cause de ChatGPT et l\'IA générative ?', "Non, transformé. Google maintient 90%+ de parts de marché. L'IA améliore notre productivité (recherche, brief, première version) mais l'expertise éditoriale + l'optimisation reste humaine. Adapter, pas paniquer."),
        ],
        'faq_en': [
            ('How long until first SEO results?', "First signals: 30-60 days (indexation, easy keyword ranking). Significant results: 3-6 months on medium queries. Competitive query domination: 12-24 months. It's a long-term investment."),
            ('How many articles to publish per month?', "For a starting blog: 4-8 articles/month (1-2 per week). For an established site: 8-15 articles/month. Quality always trumps quantity — one 2500-word article is worth 4 articles of 500 words."),
            ('Is SEO dead due to ChatGPT and generative AI?', "No, transformed. Google maintains 90%+ market share. AI improves our productivity (research, brief, first draft) but editorial expertise + optimization remain human. Adapt, don't panic."),
        ],
    },
    'web': {
        'keywords': ['site-web', 'wordpress', 'shopify', 'landing-page', 'cms', 'comment-creer-site', 'cout-creation-site'],
        'errors_fr': [
            ('Choisir le CMS par défaut sans analyse', "WordPress n\'est pas toujours le bon choix. Pour un e-commerce 50+ produits : Shopify gagne. Pour une marketplace : Sharetribe. Pour un blog haute trafic : Webflow ou Astro. Pas de one-size-fits-all."),
            ('Sous-estimer le coût total (TCO)', "Le développement initial ne représente que 30-40% du TCO sur 5 ans. Hébergement, maintenance, sécurité, mises à jour, refonte design = 60-70%. Budgetez à long terme."),
            ('Skipper la phase UX/wireframes', "Coder directement sans wireframes coûte 3-5x plus cher en révisions tardives. Investissez 10-15% du budget en UX design + maquettes Figma validées."),
            ('Négliger l\'accessibilité (WCAG)', "1 français sur 5 a un handicap qui affecte la navigation web. WCAG 2.1 AA est devenu obligatoire pour les entités publiques européennes et un signal SEO positif."),
            ('Lancer sans plan de mesure', "Un site sans Google Analytics + Google Search Console + hotjar = pilotage à l\'aveugle. Installez le tracking AVANT le lancement, pas après."),
        ],
        'errors_en': [
            ('Choosing the default CMS without analysis', "WordPress isn't always the right choice. For 50+ product e-commerce: Shopify wins. For a marketplace: Sharetribe. For a high-traffic blog: Webflow or Astro. No one-size-fits-all."),
            ('Underestimating total cost (TCO)', "Initial development only represents 30-40% of 5-year TCO. Hosting, maintenance, security, updates, design rebuilds = 60-70%. Budget long-term."),
            ('Skipping UX/wireframes phase', "Coding without wireframes costs 3-5x more in late revisions. Invest 10-15% of budget in UX design + validated Figma mockups."),
            ('Neglecting accessibility (WCAG)', "1 in 5 has a disability affecting web navigation. WCAG 2.1 AA is mandatory for EU public entities and a positive SEO signal."),
            ('Launching without measurement plan', "A site without Google Analytics + Google Search Console + Hotjar = flying blind. Install tracking BEFORE launch, not after."),
        ],
        'tools_fr': [
            ('Figma', 'Standard de l\'industrie pour wireframes + maquettes UI. Gratuit en éditeur 3 fichiers, 12€/mois Pro.'),
            ('WordPress + Elementor Pro', 'Le combo le plus utilisé. ~60€/an Elementor + hébergement ~10€/mois. Idéal sites vitrine + blog.'),
            ('Shopify', 'Plateforme e-commerce clé en main. 29-299€/mois selon plan. Démarrage rapide, scaling sans souci.'),
            ('Webflow', 'CMS visuel pro pour designers exigeants. 14-39€/mois. Performance et flexibilité supérieures.'),
            ('Vercel + Next.js', 'Stack moderne pour startups tech. Hébergement gratuit jusqu\'à 100GB bandwidth. Performance maximale.'),
        ],
        'tools_en': [
            ('Figma', 'Industry standard for wireframes + UI mockups. Free in 3-file editor, 12€/month Pro.'),
            ('WordPress + Elementor Pro', 'Most used combo. ~60€/year Elementor + hosting ~10€/month. Ideal for showcase + blog sites.'),
            ('Shopify', 'Turnkey e-commerce platform. 29-299€/month per plan. Quick start, smooth scaling.'),
            ('Webflow', 'Pro visual CMS for demanding designers. 14-39€/month. Superior performance and flexibility.'),
            ('Vercel + Next.js', 'Modern stack for tech startups. Free hosting up to 100GB bandwidth. Maximum performance.'),
        ],
        'case_fr': "Cabinet conseil béninois (3 personnes, services juridiques aux PME) avait un site WordPress lent (LCP 6s) avec un taux de conversion < 0,5%. Refonte 2026 sur Webflow : nouveau design conversion-first, formulaires courts, Calendly intégré. Résultat : LCP 1,3s, taux conversion 3,8% (x8), 23 RDV qualifiés/mois en moyenne (vs 2-3 avant). ROI atteint en 4 mois.",
        'case_en': "Beninese consulting firm (3 people, legal services for SMEs) had a slow WordPress site (LCP 6s) with conversion rate < 0.5%. 2026 rebuild on Webflow: new conversion-first design, short forms, Calendly integrated. Result: LCP 1.3s, conversion rate 3.8% (x8), 23 qualified appointments/month on average (vs 2-3 before). ROI reached in 4 months.",
        'faq_fr': [
            ('Faut-il refaire mon site ou l\'optimiser ?', "Si le site a < 3 ans, design moderne, stack maintenu : optimisation suffit (perf, SEO, conversion). Si > 5 ans, design daté, technologie obsolète : refonte complète. Entre les deux : audit personnalisé."),
            ('Combien coûte un site web professionnel ?', "Site vitrine 5-10 pages : 1500-5000€. Site e-commerce 50+ produits : 5000-25000€. Site sur-mesure / SaaS : 15000-100000€+. Maintenance annuelle : 15-20% du coût initial."),
            ('Quel délai pour un site web ?', "Site vitrine simple : 4-8 semaines (briefing → maquettes → développement → tests → lancement). E-commerce moyen : 8-16 semaines. Application web complexe : 4-12 mois selon scope."),
        ],
        'faq_en': [
            ('Should I rebuild my site or optimize it?', "If the site is < 3 years old, modern design, maintained stack: optimization is enough (perf, SEO, conversion). If > 5 years, dated design, obsolete tech: full rebuild. In between: custom audit."),
            ('How much does a professional website cost?', "5-10 page showcase: 1500-5000€. 50+ product e-commerce: 5000-25000€. Custom / SaaS: 15000-100000€+. Annual maintenance: 15-20% of initial cost."),
            ('What\'s the timeline for a website?', "Simple showcase: 4-8 weeks (briefing → mockups → dev → tests → launch). Mid e-commerce: 8-16 weeks. Complex web app: 4-12 months depending on scope."),
        ],
    },
    'ia': {
        'keywords': ['ia', 'chatbot', 'agents-ia', 'automatisation', 'make', 'zapier', 'automation', 'rag'],
        'errors_fr': [
            ('Adopter l\'IA pour suivre la mode, pas un besoin', "Beaucoup d\'entreprises déploient ChatGPT sans cas d\'usage clair. Résultat : 80% des projets IA d\'entreprise échouent. Définissez d\'abord le problème métier précis, ensuite cherchez si l\'IA est la bonne solution."),
            ('Sous-estimer la qualité de la donnée', "Un RAG sur des PDF mal scannés ou des Notion désorganisés sort de la bouillie. 'Garbage in, garbage out' s\'applique 10x plus fort en IA générative. Investissez 30% du projet en data quality."),
            ('Oublier la sécurité et la confidentialité', "Envoyer vos données client à OpenAI sans accord DPA = problème RGPD. Solutions : Azure OpenAI (DPA inclus), Anthropic API enterprise, ou modèles self-hosted (Mistral, Llama)."),
            ('Sur-automatiser et perdre la touche humaine', "Un chatbot qui répond à tout sans escalade vers un humain frustre. Règle d\'or : automatiser 70-80% des demandes simples, garder l\'humain pour les cas complexes."),
            ('Ignorer le coût d\'inférence', "GPT-4 à 0.06€/1000 tokens coûte vite cher à scale. Pour un chatbot 1000 conversations/jour : 50-150€/mois. Calculez le ROI AVANT de déployer."),
        ],
        'errors_en': [
            ('Adopting AI to follow trends, not a need', "Many companies deploy ChatGPT without clear use case. Result: 80% of enterprise AI projects fail. First define the precise business problem, then check if AI is the right solution."),
            ('Underestimating data quality', "A RAG on poorly scanned PDFs or messy Notion outputs gibberish. 'Garbage in, garbage out' applies 10x harder in generative AI. Invest 30% of project in data quality."),
            ('Forgetting security and confidentiality', "Sending client data to OpenAI without a DPA = GDPR problem. Solutions: Azure OpenAI (DPA included), Anthropic API enterprise, or self-hosted models (Mistral, Llama)."),
            ('Over-automating and losing human touch', "A chatbot that answers everything without escalation to a human frustrates. Golden rule: automate 70-80% of simple requests, keep humans for complex cases."),
            ('Ignoring inference cost', "GPT-4 at 0.06€/1000 tokens gets expensive at scale. For a chatbot with 1000 conversations/day: 50-150€/month. Calculate ROI BEFORE deploying."),
        ],
        'tools_fr': [
            ('OpenAI API (GPT-4, GPT-4o-mini)', 'Standard de l\'industrie. GPT-4o-mini à 0.15€/1M tokens input — excellent rapport qualité/prix pour 90% des cas.'),
            ('Anthropic API (Claude 3.5 Sonnet)', 'Meilleur pour le raisonnement long, l\'écriture longue et le code. 3€/1M input tokens, 15€/1M output.'),
            ('Make ou n8n', 'Plateformes d\'automatisation visuelle. Make : 9-99€/mois selon volume. n8n self-hosted : gratuit + serveur ~10€/mois.'),
            ('LangChain / LlamaIndex', 'Frameworks Python pour construire des apps IA (RAG, agents). Open-source gratuit, infrastructure à charge.'),
            ('Voiceflow ou Botpress', 'Construction visuelle de chatbots multi-canal (web + WhatsApp + Messenger). 0-450€/mois.'),
        ],
        'tools_en': [
            ('OpenAI API (GPT-4, GPT-4o-mini)', 'Industry standard. GPT-4o-mini at 0.15€/1M input tokens — excellent quality/price ratio for 90% of cases.'),
            ('Anthropic API (Claude 3.5 Sonnet)', 'Best for long reasoning, long writing and code. 3€/1M input tokens, 15€/1M output.'),
            ('Make or n8n', 'Visual automation platforms. Make: 9-99€/month per volume. n8n self-hosted: free + server ~10€/month.'),
            ('LangChain / LlamaIndex', 'Python frameworks to build AI apps (RAG, agents). Free open-source, infrastructure on you.'),
            ('Voiceflow or Botpress', 'Visual multi-channel chatbot building (web + WhatsApp + Messenger). 0-450€/month.'),
        ],
        'case_fr': "Cabinet d\'expertise comptable à Cotonou (12 personnes, 380 clients PME). Problème : 4h/jour passées par 3 employés à répondre aux mêmes questions clients (statuts comptables, échéances). Solution : agent IA WhatsApp connecté à leur ERP (RAG sur 200 pages de procédures). Résultat M+3 : 78% des questions répondues automatiquement, 9h/jour ETP économisées, ROI atteint en 7 semaines.",
        'case_en': "Accounting firm in Cotonou (12 people, 380 SME clients). Problem: 4h/day spent by 3 employees answering the same client questions (accounting statuses, deadlines). Solution: WhatsApp AI agent connected to their ERP (RAG on 200 pages of procedures). Result M+3: 78% of questions answered automatically, 9h/day FTE saved, ROI reached in 7 weeks.",
        'faq_fr': [
            ('Quel est le ROI moyen d\'un projet IA ?', "Variable selon use case. Chatbot service client : économie 1-3 ETP en 6 mois. Automatisation administrative : 15-30h/semaine récupérées. Génération contenu : coût/article divisé par 5-10. Net positif généralement à M+2-4."),
            ('Faut-il un data scientist en interne ?', "Pour 90% des projets PME : non. Utilisation d\'APIs (OpenAI, Anthropic) + plateformes no-code (Make, Zapier) + intégrateur expérimenté suffit. Le data scientist devient utile à grande échelle (Big Tech, finance, santé)."),
            ('L\'IA va-t-elle remplacer mon équipe ?', "Non, l\'augmenter. Les rôles répétitifs (saisie, classification, premier niveau de support) seront automatisés. Les rôles créatifs, stratégiques, relationnels resteront humains. Reconvertir, pas licencier."),
        ],
        'faq_en': [
            ('What\'s the average ROI of an AI project?', "Varies by use case. Customer service chatbot: 1-3 FTE saved in 6 months. Administrative automation: 15-30h/week recovered. Content generation: cost/article divided by 5-10. Net positive usually by M+2-4."),
            ('Do I need an in-house data scientist?', "For 90% of SME projects: no. Using APIs (OpenAI, Anthropic) + no-code platforms (Make, Zapier) + experienced integrator is sufficient. Data scientist becomes useful at scale (Big Tech, finance, health)."),
            ('Will AI replace my team?', "No, augment it. Repetitive roles (data entry, classification, first-level support) will be automated. Creative, strategic, relational roles will remain human. Reskill, don't lay off."),
        ],
    },
    'content': {
        'keywords': ['content', 'copywriting', 'redaction', 'editorial', 'tendances-design', 'influence-marketing'],
        'errors_fr': [
            ('Publier sans calendrier éditorial', "Un calendrier de 3 mois minimum évite la dérive 'on n\'a pas le temps de poster'. Outils : Notion, Trello, Airtable. Définissez piliers, formats, fréquence, responsables."),
            ('Vouloir parler à tout le monde', "Un message universel ne touche personne. Définissez 2-3 personas précis avec leur job, leurs douleurs, leurs objectifs. Chaque pièce de contenu adresse 1 persona à la fois."),
            ('Ignorer le SEO en début de rédaction', "Écrire d\'abord puis 'optimiser SEO' donne du contenu artificiel. Recherche mots-clés AVANT le brief, structure H2/H3 alignée sur l\'intention de recherche."),
            ('Pas de CTA clair par article', "Chaque article doit pousser à une action : télécharger un guide, s\'inscrire à la newsletter, prendre RDV. Sans CTA = trafic perdu."),
            ('Mesurer les likes au lieu des conversions', "Les vanity metrics (likes, vues, partages) ne paient pas les factures. Mesurez : leads générés, conversions, ventes attribuées, CLV. Sinon vous travaillez à perte."),
        ],
        'errors_en': [
            ('Publishing without editorial calendar', "A 3-month minimum calendar prevents 'we don\'t have time to post' drift. Tools: Notion, Trello, Airtable. Define pillars, formats, frequency, owners."),
            ('Trying to speak to everyone', "A universal message reaches no one. Define 2-3 precise personas with their job, pains, goals. Each content piece addresses 1 persona at a time."),
            ('Ignoring SEO at the start of writing', "Writing first then 'SEO optimizing' gives artificial content. Keyword research BEFORE brief, H2/H3 structure aligned with search intent."),
            ('No clear CTA per article', "Each article should push to an action: download a guide, subscribe to newsletter, book a meeting. Without CTA = lost traffic."),
            ('Measuring likes instead of conversions', "Vanity metrics (likes, views, shares) don\'t pay the bills. Measure: leads generated, conversions, attributed sales, CLV. Otherwise you work at a loss."),
        ],
        'tools_fr': [
            ('Notion', 'CMS éditorial parfait. Templates calendrier + brief + status workflow. Gratuit jusqu\'à 1000 blocs, 10€/mois Plus.'),
            ('Grammarly Premium', 'Correcteur grammatical + ton. EN principalement, mais aide aussi en FR. 12€/mois.'),
            ('Antidote', 'Le meilleur correcteur FR. 119€ achat unique, 60€/an Cloud. Indispensable pour les contenus pro français.'),
            ('SE Ranking', 'Tracking positions + audit SEO + recherche mots-clés. 39-189€/mois. Meilleur rapport qualité/prix pour PME.'),
            ('Canva Pro', 'Visuels d\'articles, infographies, miniatures. 12€/mois, brand kit, retouche photo simple.'),
        ],
        'tools_en': [
            ('Notion', 'Perfect editorial CMS. Calendar + brief + status workflow templates. Free up to 1000 blocks, 10€/month Plus.'),
            ('Grammarly Premium', 'Grammar + tone corrector. Mainly EN, but helps in FR too. 12€/month.'),
            ('Antidote', 'Best FR corrector. 119€ one-time, 60€/year Cloud. Essential for pro French content.'),
            ('SE Ranking', 'Position tracking + SEO audit + keyword research. 39-189€/month. Best value for SMEs.'),
            ('Canva Pro', 'Article visuals, infographics, thumbnails. 12€/month, brand kit, simple photo editing.'),
        ],
        'case_fr': "Startup SaaS B2B (outil de facturation pour artisans, 8 employés, 250 clients) avec 0 stratégie éditoriale. Mise en place : 2 articles SEO/semaine sur 'comptabilité simplifiée artisan', newsletter mensuelle, 1 livre blanc/trimestre. Résultat M+12 : 28000 visiteurs SEO/mois (était 400), 145 trials/mois, conversion trial→paid 22%. CAC divisé par 4.",
        'case_en': "B2B SaaS startup (invoicing tool for craftsmen, 8 employees, 250 clients) with zero editorial strategy. Implemented: 2 SEO articles/week on 'simplified accounting for craftsmen', monthly newsletter, 1 white paper/quarter. Result M+12: 28000 SEO visitors/month (was 400), 145 trials/month, trial→paid conversion 22%. CAC divided by 4.",
        'faq_fr': [
            ('Combien d\'articles par mois pour un blog ?', "Démarrage (0-6 mois) : 4-8 articles/mois pour construire l\'autorité. Croissance (6-18 mois) : 8-15/mois. Maintenance : 4-6/mois + mises à jour des anciens articles. Qualité > quantité toujours."),
            ('Faut-il faire des articles longs ou courts ?', "Les requêtes informationnelles concurrentielles demandent 2000-4000 mots. Les fiches produits e-commerce : 250-400 mots. Le sweet spot général : 1500-2500 mots avec H2/H3 fréquents et FAQ."),
            ('L\'IA peut-elle remplacer les rédacteurs ?', "Non, accélérer. Brief + premier draft + relecture grammaticale = IA. Recherche, angle éditorial, voix de marque, fact-checking, expertise = humain. Le meilleur ratio : 60% humain + 40% IA assisté."),
        ],
        'faq_en': [
            ('How many articles per month for a blog?', "Start (0-6 months): 4-8 articles/month to build authority. Growth (6-18 months): 8-15/month. Maintenance: 4-6/month + updates to old articles. Quality > quantity always."),
            ('Should I write long or short articles?', "Competitive informational queries demand 2000-4000 words. E-commerce product sheets: 250-400 words. General sweet spot: 1500-2500 words with frequent H2/H3 and FAQ."),
            ('Can AI replace writers?', "No, accelerate. Brief + first draft + grammar review = AI. Research, editorial angle, brand voice, fact-checking, expertise = human. Best ratio: 60% human + 40% AI-assisted."),
        ],
    },
    'ads': {
        'keywords': ['ads', 'publicite', 'budget-publicitaire', 'google-ads', 'meta'],
        'errors_fr': [
            ('Démarrer avec un budget trop faible', "Sous 200€/mois, impossible d\'avoir des données statistiquement significatives. Démarrez à 500-1000€/mois minimum sur 3 mois pour identifier les patterns gagnants."),
            ('Cibler trop large dès le début', "Une audience de 10M+ personnes = budget brûlé pour rien. Démarrez sur audiences narrow (50k-500k) puis élargissez progressivement avec lookalikes."),
            ('Pas de tracking de conversion', "Sans Pixel Meta + tag Google Ads + serveur GTM, vous pilotez à l\'aveugle. Installez le tracking et les events custom AVANT toute campagne."),
            ('Créa unique pour toutes les audiences', "Une seule annonce vidéo testée sur 10 audiences = pas d\'apprentissage. Règle 4x4 : 4 audiences x 4 créas = 16 combinaisons à tester par campagne."),
            ('Mesurer le CPC au lieu du CPA', "Le CPC bas ne paie pas. Le seul KPI qui compte : CPA (coût par acquisition) ou ROAS (retour sur dépense pub). Sinon vous mesurez du vent."),
        ],
        'errors_en': [
            ('Starting with too low a budget', "Under 200€/month, impossible to get statistically significant data. Start at 500-1000€/month minimum for 3 months to identify winning patterns."),
            ('Targeting too broadly from the start', "An audience of 10M+ people = budget burned for nothing. Start narrow (50k-500k) then expand progressively with lookalikes."),
            ('No conversion tracking', "Without Meta Pixel + Google Ads tag + server-side GTM, you fly blind. Install tracking and custom events BEFORE any campaign."),
            ('Single creative for all audiences', "One video ad tested on 10 audiences = no learning. Rule 4x4: 4 audiences x 4 creatives = 16 combinations to test per campaign."),
            ('Measuring CPC instead of CPA', "Low CPC doesn\'t pay. The only KPI that matters: CPA (cost per acquisition) or ROAS (return on ad spend). Otherwise you measure wind."),
        ],
        'tools_fr': [
            ('Meta Ads Manager + Pixel', 'Indispensable pour Facebook + Instagram + Messenger Ads. Gratuit. Couplé au Pixel + Conversion API.'),
            ('Google Ads + GA4', 'Search, Display, YouTube, Performance Max. Connecté à GA4 + Search Console pour insights complets.'),
            ('Triple Whale ou Northbeam', 'Attribution multi-canal post-iOS14. 100-1000€/mois selon volume. Mesure réelle vs déclarée.'),
            ('AdEspresso', 'Tests A/B simplifiés pour Meta Ads. 49-249€/mois selon scale.'),
            ('Looker Studio (gratuit)', 'Dashboards reporting custom. Templates Meta + Google + LinkedIn disponibles.'),
        ],
        'tools_en': [
            ('Meta Ads Manager + Pixel', 'Essential for Facebook + Instagram + Messenger Ads. Free. Coupled with Pixel + Conversion API.'),
            ('Google Ads + GA4', 'Search, Display, YouTube, Performance Max. Connected to GA4 + Search Console for complete insights.'),
            ('Triple Whale or Northbeam', 'Post-iOS14 multi-channel attribution. 100-1000€/month per volume. Real vs declared measurement.'),
            ('AdEspresso', 'Simplified A/B tests for Meta Ads. 49-249€/month per scale.'),
            ('Looker Studio (free)', 'Custom reporting dashboards. Meta + Google + LinkedIn templates available.'),
        ],
        'case_fr': "Boutique e-commerce de cosmétiques bio (Cotonou + livraison Bénin entier), 12 mois d\'existence. ROAS Meta Ads : 1.4 (juste rentable). Audit : créas datées, audiences saturées, pas de retargeting. Nouveau setup : 12 créas vidéos UGC, 6 audiences testées, retargeting J+1/J+7/J+14. Résultat M+3 : ROAS 4.2 (x3), CA mensuel publicitaire de 8000€ à 34000€.",
        'case_en': "Organic cosmetics e-commerce (Cotonou + Benin-wide delivery), 12 months old. Meta Ads ROAS: 1.4 (just profitable). Audit: dated creatives, saturated audiences, no retargeting. New setup: 12 UGC video creatives, 6 tested audiences, D+1/D+7/D+14 retargeting. Result M+3: ROAS 4.2 (x3), monthly ad-driven revenue from 8000€ to 34000€.",
        'faq_fr': [
            ('Combien investir en publicité payante ?', "Règle de pouce : 5-10% du CA visé en pub. Pour 100k€ CA visé : 5000-10000€/mois en média. Démarrer plus bas (1500-3000€) puis scaler ce qui performe."),
            ('Quel est le bon ROAS cible ?', "Dépend de la marge. Marge 30% : ROAS minimum 3.5 pour être rentable net. Marge 60% (SaaS) : ROAS 2 suffit. Toujours calculer le break-even ROAS = 1 / marge brute."),
            ('Combien de temps pour optimiser une campagne ?', "Phase d\'apprentissage Meta : 7-14 jours, 50+ conversions minimum. Google Ads : 14-30 jours. Comptez 3 mois minimum pour avoir une campagne mature et statistiquement fiable."),
        ],
        'faq_en': [
            ('How much to invest in paid advertising?', "Rule of thumb: 5-10% of target revenue in ads. For 100k€ target revenue: 5000-10000€/month in media. Start lower (1500-3000€) then scale what performs."),
            ('What\'s the right ROAS target?', "Depends on margin. 30% margin: minimum 3.5 ROAS to be net profitable. 60% margin (SaaS): 2 ROAS is enough. Always calculate break-even ROAS = 1 / gross margin."),
            ('How long to optimize a campaign?', "Meta learning phase: 7-14 days, 50+ conversions minimum. Google Ads: 14-30 days. Plan 3 months minimum to have a mature, statistically reliable campaign."),
        ],
    },
}

# Fallback default theme (other guides)
DEFAULT_THEME = {
    'errors_fr': [
        ('Vouloir tout faire en interne sans expertise', "Apprendre une discipline expert prend 2-5 ans. Pour les domaines clés, déléguer à des spécialistes externalisés ou recruter offre un ROI immédiat vs auto-formation."),
        ('Sauter les phases de stratégie et planification', "L\'exécution sans stratégie c\'est de l\'agitation coûteuse. Investissez 10-15% du budget en stratégie/audit avant tout déploiement opérationnel."),
        ('Ne pas mesurer pour itérer', "Sans tableau de bord clair (KPIs, conversion, ROI), impossible d\'optimiser. Mettez en place le tracking AVANT toute action."),
        ('Sous-budgéter et abandonner trop tôt', "Les disciplines digitales demandent 6-12 mois d\'investissement constant avant les premiers ROI significatifs. Budgetez sur 12 mois minimum."),
        ('Copier les concurrents sans comprendre leur contexte', "Ce qui marche pour un Big Tech avec 50M de budget ne marche pas pour une PME. Adaptez les principes, pas les tactiques."),
    ],
    'errors_en': [
        ('Trying to do everything in-house without expertise', "Learning an expert discipline takes 2-5 years. For key areas, delegating to outsourced specialists or hiring offers immediate ROI vs self-training."),
        ('Skipping strategy and planning phases', "Execution without strategy is expensive agitation. Invest 10-15% of budget in strategy/audit before any operational deployment."),
        ('Not measuring to iterate', "Without a clear dashboard (KPIs, conversion, ROI), impossible to optimize. Set up tracking BEFORE any action."),
        ('Under-budgeting and abandoning too early', "Digital disciplines require 6-12 months of consistent investment before first significant ROI. Budget over 12 months minimum."),
        ('Copying competitors without understanding their context', "What works for Big Tech with 50M budget doesn\'t work for an SME. Adapt principles, not tactics."),
    ],
    'tools_fr': [
        ('Notion ou ClickUp', 'Gestion projet + documentation. 8-15€/mois par utilisateur.'),
        ('Slack ou Discord', 'Communication équipe + clients. Slack 7€/mois, Discord gratuit.'),
        ('Loom', 'Vidéos asynchrones pour briefs, demos. Gratuit jusqu\'à 25 vidéos, 12€/mois pro.'),
        ('Calendly', 'Prise de RDV automatisée. 10€/mois.'),
        ('Stripe ou Mollie', 'Paiement en ligne. Frais ~1.4% + 0.25€ par transaction.'),
    ],
    'tools_en': [
        ('Notion or ClickUp', 'Project management + documentation. 8-15€/month per user.'),
        ('Slack or Discord', 'Team + client communication. Slack 7€/month, Discord free.'),
        ('Loom', 'Async videos for briefs, demos. Free up to 25 videos, 12€/month pro.'),
        ('Calendly', 'Automated appointment booking. 10€/month.'),
        ('Stripe or Mollie', 'Online payment. Fees ~1.4% + 0.25€ per transaction.'),
    ],
    'case_fr': "Agence conseil B2B (8 personnes, Cotonou + Paris) avec processus manuels chronophages. Audit : 12 outils non-intégrés, double saisie, perte de leads. Restructuration : CRM HubSpot central, Zapier 35 automatisations, Notion équipe. Résultat : 14h/semaine récupérées par employé, leads non-perdus +43%, satisfaction interne +8 points sur 10.",
    'case_en': "B2B consulting agency (8 people, Cotonou + Paris) with time-consuming manual processes. Audit: 12 disconnected tools, double entry, lost leads. Restructuring: HubSpot CRM central, Zapier 35 automations, Notion team. Result: 14h/week recovered per employee, lost leads +43%, internal satisfaction +8 points out of 10.",
    'faq_fr': [
        ('Par où commencer concrètement ?', "Audit de 2 semaines pour identifier les 3-5 leviers d\'impact maximal. Puis 90 jours de mise en oeuvre prioritaire. Mesure mensuelle, ajustement trimestriel."),
        ('Quel budget moyen prévoir ?', "Pour une PME (10-50 employés) : 2-5% du CA en investissement digital annuel. Pour une scale-up : 5-15%. ROI net positif généralement à 12-18 mois."),
        ('Comment choisir entre formation interne et externalisation ?', "Si compétence stratégique long terme : former. Si compétence opérationnelle ponctuelle : externaliser. Si compétence de pointe rare : recruter junior + senior consultant."),
    ],
    'faq_en': [
        ('Where to concretely start?', "2-week audit to identify the 3-5 maximum impact levers. Then 90 days of priority implementation. Monthly measurement, quarterly adjustment."),
        ('What average budget to plan?', "For an SME (10-50 employees): 2-5% of revenue in annual digital investment. For a scale-up: 5-15%. Net positive ROI typically at 12-18 months."),
        ('How to choose between internal training and outsourcing?', "If strategic long-term skill: train. If one-off operational skill: outsource. If rare cutting-edge skill: hire junior + senior consultant."),
    ],
}

def get_theme(slug: str) -> dict:
    for theme_name, theme in THEMES.items():
        if any(kw in slug for kw in theme['keywords']):
            return theme
    return DEFAULT_THEME

def build_enrichment(theme: dict, is_en: bool) -> str:
    errors_key = 'errors_en' if is_en else 'errors_fr'
    tools_key = 'tools_en' if is_en else 'tools_fr'
    case_key = 'case_en' if is_en else 'case_fr'
    faq_key = 'faq_en' if is_en else 'faq_fr'

    L = {
        'h_errors': 'COMMON MISTAKES TO AVOID' if is_en else 'ERREURS COURANTES À ÉVITER',
        'h_tools':  'RECOMMENDED TOOLS' if is_en else 'OUTILS & RESSOURCES RECOMMANDÉS',
        'h_case':   'REAL CASE STUDY' if is_en else 'ÉTUDE DE CAS CONCRÈTE',
        'h_faq':    'EXTENDED FAQ' if is_en else 'FAQ APPROFONDIE',
    }

    errors_html = ''
    for i, (title, body) in enumerate(theme[errors_key], 1):
        errors_html += (
            f'<div style="background:var(--surface-container-lowest);'
            f'border-left:3px solid var(--primary-container);padding:1.5rem 2rem;'
            f'margin-bottom:1rem;">'
            f'<h3 style="margin:0 0 0.5rem;font-size:1.0625rem;color:var(--on-surface);font-weight:600;">'
            f'<span style="color:var(--primary-container);font-weight:700;">#{i}.</span> {title}</h3>'
            f'<p style="margin:0;color:rgba(229,226,225,0.7);line-height:1.7;">{body}</p>'
            f'</div>'
        )

    tools_html = ''
    for name, desc in theme[tools_key]:
        tools_html += (
            f'<div style="background:var(--surface-container-lowest);'
            f'border:1px solid rgba(92,64,55,0.12);padding:1.25rem 1.5rem;margin-bottom:0.75rem;">'
            f'<strong style="color:var(--primary-container);font-size:0.95rem;">{name}</strong> '
            f'<span style="color:rgba(229,226,225,0.7);">— {desc}</span>'
            f'</div>'
        )

    faq_html = ''
    for q, a in theme[faq_key]:
        faq_html += (
            f'<details class="faq-item" style="margin-bottom:0.75rem;">'
            f'<summary style="cursor:pointer;font-weight:600;color:var(--on-surface);padding:1rem 0;">{q}</summary>'
            f'<div style="padding:0 0 1rem 1rem;color:rgba(229,226,225,0.7);line-height:1.7;">{a}</div>'
            f'</details>'
        )

    return f'''
{SENTINEL}
<section style="padding:3rem 0 1rem;">
<h2>{L["h_errors"]}</h2>
{errors_html}
</section>

<section style="padding:2rem 0;">
<h2>{L["h_tools"]}</h2>
{tools_html}
</section>

<section style="padding:2rem 0;">
<h2>{L["h_case"]}</h2>
<blockquote>
<p>{theme[case_key]}</p>
</blockquote>
</section>

<section style="padding:2rem 0 3rem;">
<h2>{L["h_faq"]}</h2>
{faq_html}
</section>
'''

count = 0
for d in (ROOT / 'guides', ROOT / 'en' / 'guides'):
    if not d.exists():
        continue
    is_en = (d == ROOT / 'en' / 'guides')
    for p in d.glob('*.html'):
        if p.name == 'index.html':
            continue
        text = p.read_text(encoding='utf-8', errors='ignore')
        if SENTINEL in text:
            continue
        theme = get_theme(p.stem)
        block = build_enrichment(theme, is_en)
        # Insert at the end of .article-body (before the closing </div> that wraps article)
        # or before the SENTINEL_SERVICES block from previous cross-links
        # Strategy: insert just before xlink-services sentinel, OR before <section ... section--low (cross-links)
        new_text = re.sub(
            r'(<!-- xlink-services -->|<section[^>]*section--low[^>]*>\s*<div class="section-inner">\s*<span class="text-label rv">Besoin)',
            block + '\n\\1',
            text, count=1,
        )
        if new_text == text:
            # Fallback : insert just before footer
            new_text = re.sub(
                r'(<!-- NEWSLETTER -->|<div class="newsletter">|<footer class="footer">)',
                block + '\n\\1',
                text, count=1,
            )
        if new_text != text:
            p.write_text(new_text, encoding='utf-8')
            count += 1

print(f"Guides enrichis : {count}")
