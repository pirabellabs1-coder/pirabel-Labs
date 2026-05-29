#!/usr/bin/env python3
"""Contenu detaille formation : SEO Intermediaire : Audit, Optimisation et Strategies de Croissance."""

SEO_INTERMEDIAIRE_MODULES = [
    {
        'title': 'Comprendre les fondamentaux du SEO',
        'objective': "A l'issue de ce module, vous saurez expliquer le fonctionnement de Google en 2026, identifier les trois piliers d'une strategie SEO durable et choisir l'approche adaptee a votre business modele.",
        'duration': 90,
        'lessons': [
            {'title': "Qu'est-ce que le SEO en 2026 : fondamentaux a connaitre",
             'duration': 18,
             'content_html': """<h2>Une discipline qui a profondement mute</h2>
<p>Le SEO en 2026 ne ressemble plus du tout au SEO de 2015. La generalisation de la <strong>Search Generative Experience (SGE)</strong> de Google, l'integration native de Gemini dans la SERP, l'explosion des assistants conversationnels (ChatGPT Search, Perplexity, Claude) et la sophistication des algorithmes de comprehension semantique ont transforme la discipline. Selon les donnees Ahrefs publiees en mars 2026, <strong>63 % des recherches en France se terminent desormais sans clic vers un site externe</strong>, contre 49 % en 2022. Ce phenomene, appele zero-click search, oblige les referenceurs a repenser leur metier.</p>
<p>Cela ne signifie pas la mort du SEO, mais sa redefinition. Les marques qui dominent leur secteur en 2026 ne se contentent plus de viser la premiere position d'une SERP traditionnelle : elles cherchent a etre citees dans les reponses generatives, a apparaitre dans les featured snippets, dans le People Also Ask, dans Google Discover et dans les knowledge panels. Le trafic organique reste vital, mais il se diversifie.</p>
<h2>Definition operationnelle du SEO en 2026</h2>
<p>Le SEO designe l'ensemble des techniques visant a <strong>maximiser la visibilite organique d'une entite (marque, produit, personne)</strong> sur les surfaces de recherche, qu'elles soient classiques (Google Search, Bing) ou generatives (ChatGPT, Perplexity, Gemini). Cette definition elargie integre trois nouveaux objectifs par rapport au SEO historique :</p>
<ul>
<li><strong>Etre indexe et compris</strong> par les modeles de langage qui alimentent les moteurs generatifs.</li>
<li><strong>Etre cite comme source</strong> dans les reponses produites par ces moteurs.</li>
<li><strong>Generer du trafic qualifie</strong> a partir des clics qui restent, avec une intention d'achat ou de conversion plus marquee.</li>
</ul>
<h2>Pourquoi le SEO reste un investissement prioritaire</h2>
<p>Malgre les bouleversements, le canal organique conserve un avantage decisif sur les canaux payants : le <strong>cout d'acquisition marginal tend vers zero une fois la position acquise</strong>. Une etude HubSpot 2026 montre que le ROI moyen du SEO sur 18 mois s'eleve a 5,3x l'investissement initial, contre 2,1x pour Google Ads. Pour une PME beninoise qui investit 800 000 FCFA en SEO, l'esperance de retour cumule sur deux ans depasse souvent 4 millions de FCFA en trafic equivalent ads.</p>
<p>Au-dela du ROI, le SEO construit un actif de marque difficile a copier. Contrairement a une campagne Meta Ads qui s'arrete des qu'on coupe le budget, un article positionne en page 1 sur une requete strategique continue de generer du trafic pendant des annees. C'est ce que Rand Fishkin appelle <em>l'effet flywheel</em> du contenu evergreen.</p>
<blockquote>"Le SEO n'est pas mort, il est devenu plus exigeant. Les marques qui produisent du contenu mediocre disparaissent. Celles qui investissent dans l'expertise reelle prosperent." Aleyda Solis, consultante internationale SEO, conference BrightonSEO 2026.</blockquote>
<h2>Les nouvelles competences du referenceur 2026</h2>
<p>Le profil du SEO a evolue. Un consultant complet en 2026 maitrise desormais cinq blocs de competences :</p>
<ol>
<li><strong>Technique</strong> : crawl, indexation, rendering JavaScript, Core Web Vitals, schema.org.</li>
<li><strong>Editorial</strong> : recherche d'intention, briefs, EEAT, optimisation pour la SGE.</li>
<li><strong>Data</strong> : Search Console, GA4, BigQuery, Looker Studio, analyses de logs serveur.</li>
<li><strong>IA generative</strong> : utilisation de Claude et GPT-4o pour scaler la production sans penalite.</li>
<li><strong>Strategie business</strong> : alignement avec les objectifs commerciaux, modeles d'attribution multi-touch.</li>
</ol>
<h2>Comment se former en continu</h2>
<p>Le SEO change vite. Pour rester a jour, abonnez-vous a trois ou quatre sources de reference : <strong>Search Engine Journal</strong>, <strong>Ahrefs Blog</strong>, <strong>Semrush Blog</strong> et le compte X de Lily Ray pour les Core Updates. Rejoignez aussi une communaute (Twitter SEO francophone, slack ContentKing, Discord SEO France) pour echanger des observations terrain.</p>
<h2>FAQ</h2>
<p><strong>Combien de temps pour voir des resultats SEO ?</strong> Comptez 4 a 6 mois pour un site neuf, 2 a 3 mois pour optimiser un site existant avec une autorite deja etablie.</p>
<p><strong>Le SEO est-il mort avec ChatGPT ?</strong> Non. Les moteurs generatifs s'appuient sur des sources web indexees. Plus votre contenu est qualitatif, plus il est cite comme source.</p>
<p><strong>Quel budget mensuel prevoir ?</strong> Pour une PME, comptez 500 a 2 000 EUR/mois pour un freelance senior, 2 500 a 6 000 EUR/mois pour une agence. En Afrique francophone, comptez 300 000 a 1 500 000 FCFA mensuels pour un accompagnement serieux.</p>
<p>Pirabel Labs accompagne les marques francophones (France, Benin, Cote d'Ivoire, Senegal, Maroc) dans la construction de leur strategie SEO 2026. <a href="/contact">Discutons de votre projet</a> ou <a href="/rendez-vous">reservez un audit gratuit</a>.</p>"""},
            {'title': "Comment Google fonctionne : crawl, index, ranking",
             'duration': 18,
             'content_html': """<h2>Le pipeline en trois etapes de Google</h2>
<p>Pour optimiser un site, il faut comprendre comment Google le decouvre, le comprend et le classe. Le moteur fonctionne selon un pipeline tres bien documente : <strong>crawl, indexation, ranking</strong>. Chaque etape obeit a des regles precises qu'un referenceur intermediaire doit maitriser.</p>
<h2>Etape 1 : le crawl</h2>
<p>Googlebot est un robot qui parcourt le web en suivant les liens. Il commence par les URLs deja connues (presentes dans son index), puis decouvre de nouvelles pages via les liens internes et externes, les sitemaps XML et les soumissions manuelles via Search Console. Selon Gary Illyes (Google Search Relations), Googlebot effectue environ <strong>50 milliards de requetes par jour</strong> dans le monde.</p>
<p>Trois facteurs influencent la frequence de crawl de votre site :</p>
<ul>
<li><strong>L'autorite</strong> : un site avec un Domain Rating eleve est crawle plusieurs fois par jour.</li>
<li><strong>La frequence de mise a jour</strong> : un site qui publie quotidiennement est visite plus souvent.</li>
<li><strong>La sante technique</strong> : un site rapide et sans erreurs serveur recoit plus de visites de Googlebot.</li>
</ul>
<p>Pour mesurer votre budget de crawl, ouvrez Search Console > Parametres > Statistiques sur l'exploration. Vous y verrez le nombre de requetes quotidiennes et le temps de telechargement moyen. Si vous depassez 5 000 URLs et que Googlebot ne crawl qu'une partie de votre site, vous avez un probleme d'allocation a resoudre via le maillage et le robots.txt.</p>
<h2>Etape 2 : l'indexation</h2>
<p>Apres le crawl, Google decide si la page merite d'etre indexee. Cette decision repose sur plusieurs criteres : qualite percue du contenu, duplication interne ou externe, instructions noindex, canonicalisation. En 2026, Google indexe moins qu'avant. Une etude Onely de janvier 2026 montre que <strong>seulement 78 % des pages crawlees sont effectivement indexees</strong>, contre 92 % en 2020.</p>
<p>Pour verifier l'etat d'indexation d'une page : Search Console > Inspection de l'URL. Vous obtenez la date du dernier crawl, le statut d'indexation, les eventuels problemes detectes. Pour un site entier, le rapport <em>Couverture</em> liste les pages valides, exclues et en erreur.</p>
<h2>Etape 3 : le ranking</h2>
<p>Quand un utilisateur tape une requete, Google parcourt son index et applique plus de <strong>200 signaux de classement</strong> pour selectionner et ordonner les resultats. Les principaux facteurs publics sont :</p>
<ol>
<li><strong>Pertinence semantique</strong> entre la requete et le contenu (couverture du sujet, entites mentionnees).</li>
<li><strong>Autorite</strong> du domaine et de la page (backlinks de qualite, ancrage).</li>
<li><strong>Experience utilisateur</strong> : Core Web Vitals, mobile-friendliness, HTTPS, intrusivite des interstitiels.</li>
<li><strong>EEAT</strong> (Experience, Expertise, Authoritativeness, Trustworthiness) particulierement critique pour YMYL.</li>
<li><strong>Signaux comportementaux</strong> : taux de clic dans la SERP, dwell time, pogo-sticking.</li>
</ol>
<h2>Le role de la SGE dans le ranking 2026</h2>
<p>La Search Generative Experience ajoute une couche supplementaire. Pour figurer dans une reponse generative, votre contenu doit etre <strong>structure, factuel, recent et clairement attribue</strong>. Google privilegie les pages qui repondent directement a la sous-intention de la requete avec un paragraphe synthetique de 40 a 60 mots, souvent place en debut d'article ou dans un encadre type "TL;DR".</p>
<blockquote>"En 2026, optimiser pour la SGE ne remplace pas le SEO classique, c'est une couche supplementaire qui demande de structurer son contenu pour qu'il soit citable par les LLM." Lily Ray, VP SEO chez Amsive.</blockquote>
<h2>Cas pratique : diagnostic en 15 minutes</h2>
<p>Prenons l'exemple d'un site beninois de services juridiques, juridique-cotonou.bj. Les symptomes : trafic en baisse de 35 % sur trois mois. La verification en trois etapes :</p>
<ol>
<li><strong>Crawl</strong> : Search Console montre une chute du nombre de pages explorees. Verifier le robots.txt et les erreurs 5xx.</li>
<li><strong>Indexation</strong> : rapport Couverture liste 120 pages exclues "Duplication, l'utilisateur n'a pas selectionne de canonique". Probleme de canonical mal configure.</li>
<li><strong>Ranking</strong> : les pages encore indexees ont perdu en moyenne 8 positions sur les requetes principales. Coincidence avec la Core Update de fevrier 2026 : probleme EEAT a creuser.</li>
</ol>
<h2>FAQ</h2>
<p><strong>Comment forcer Google a indexer une page ?</strong> Soumettez-la via Search Console > Inspection de l'URL > Demander l'indexation. Limite a 10 demandes par jour. Pour des volumes plus eleves, utilisez l'API d'indexation (limitee a JobPosting et BroadcastEvent officiellement).</p>
<p><strong>Pourquoi mes pages restent en "Detectee, actuellement non indexee" ?</strong> Google estime le contenu insuffisamment qualitatif ou trop similaire a d'autres pages. Reecrivez en apportant de la valeur unique et ajoutez des liens internes depuis des pages a forte autorite.</p>
<p>Besoin d'un audit complet de votre site ? <a href="/contact">Contactez les experts Pirabel Labs</a> ou <a href="/rendez-vous">reservez un creneau de 30 minutes</a>.</p>"""},
            {'title': "Les 3 piliers du SEO : technique, contenu, autorite",
             'duration': 18,
             'content_html': """<h2>Le triangle indispensable</h2>
<p>Toute strategie SEO durable repose sur trois piliers complementaires : la <strong>technique</strong>, le <strong>contenu</strong> et l'<strong>autorite</strong>. Negliger un seul de ces piliers fragilise l'ensemble. Une etude Ahrefs portant sur 10 millions de pages en 2025 montre que les sites combinant les trois axes avec un score equilibre captent 4,7 fois plus de trafic organique que ceux qui se specialisent sur un seul pilier.</p>
<h2>Pilier 1 : la technique</h2>
<p>Le pilier technique garantit que votre site est <strong>crawlable, indexable et performant</strong>. Sans cette base, ni le contenu ni les backlinks ne produisent leurs effets. Les elements critiques a auditer :</p>
<ul>
<li><strong>Architecture des URLs</strong> : structure logique, profondeur maximum de 3 clics depuis la home.</li>
<li><strong>Fichier robots.txt et sitemap XML</strong> a jour, soumis a Search Console.</li>
<li><strong>Balises canoniques</strong> coherentes, evitant la duplication interne.</li>
<li><strong>Vitesse de chargement</strong> : LCP sous 2,5 secondes, INP sous 200 ms, CLS sous 0,1.</li>
<li><strong>Donnees structurees</strong> schema.org pour les pages cles (Article, FAQPage, Product, LocalBusiness, BreadcrumbList).</li>
<li><strong>HTTPS</strong> obligatoire, certificat valide, redirections HTTP propres.</li>
<li><strong>Compatibilite mobile</strong> avec mobile-first indexing actif depuis 2021.</li>
</ul>
<p>Pour auditer ce pilier, utilisez <strong>Screaming Frog</strong> (149 GBP/an, version gratuite limitee a 500 URLs), <strong>Sitebulb</strong> ou la version cloud d'Ahrefs Site Audit. Comptez 4 a 8 heures pour un audit complet d'un site PME, 2 a 5 jours pour un grand site e-commerce.</p>
<h2>Pilier 2 : le contenu</h2>
<p>Le contenu est le carburant du SEO. Google et les moteurs generatifs ont besoin de pages qui repondent <strong>de maniere experte, complete et originale</strong> aux intentions de recherche. En 2026, les criteres ont durci :</p>
<ol>
<li><strong>Couverture exhaustive</strong> : un article qui rank doit traiter le sujet sous tous ses angles. Outils : Ahrefs Content Gap, Surfer SEO, MarketMuse.</li>
<li><strong>Originalite</strong> : Google detecte le contenu purement genere par IA non edite. Les Core Updates 2025-2026 ont penalise les sites publiant en masse du contenu LLM sans intervention humaine.</li>
<li><strong>EEAT explicite</strong> : page auteur detaillee, biographie, credentials, liens sociaux verifies, mention des experiences directes.</li>
<li><strong>Frequence et fraicheur</strong> : les pages mises a jour tous les 6 a 12 mois conservent mieux leurs positions.</li>
</ol>
<p>Un benchmark publie par Brian Dean (Backlinko) en 2026 indique que la longueur moyenne d'un article positionne en top 3 sur une requete commerciale est de <strong>1 890 mots</strong>, avec 9 H2 et 14 H3 en moyenne. Pour les requetes informationnelles, on monte facilement a 2 500-3 500 mots.</p>
<h2>Pilier 3 : l'autorite</h2>
<p>L'autorite, c'est la <strong>confiance que les autres sites accordent au votre</strong>. Elle se mesure principalement par les backlinks : qui pointe vers vous, depuis quels domaines, avec quelle ancre et dans quel contexte ?</p>
<p>Les metriques cles a suivre :</p>
<ul>
<li><strong>Domain Rating (Ahrefs)</strong> ou <strong>Authority Score (Semrush)</strong> : de 0 a 100, mesure agregee de l'autorite.</li>
<li><strong>Referring domains</strong> : nombre de domaines uniques qui linkent vers vous. Plus important que le nombre total de backlinks.</li>
<li><strong>Profil d'ancres</strong> : repartition naturelle entre ancres exact-match, semantiques, brand et URLs nues.</li>
<li><strong>Topical authority</strong> : nombre de pages thematiquement liees qui pointent vers vous.</li>
</ul>
<p>Pour les PME francophones africaines, l'objectif raisonnable est d'atteindre un DR de 20 a 35 en 18 mois via 3 a 5 backlinks qualitatifs par mois, obtenus par guest posting, digital PR et linkable assets (etudes, infographies).</p>
<h2>L'equilibre des trois piliers</h2>
<p>L'erreur classique des PME est de surinvestir un pilier au detriment des autres. Exemple frequent : une marque publie 50 articles de blog (pilier contenu) mais neglige la vitesse mobile (pilier technique) et ne fait aucun outreach (pilier autorite). Resultat : du contenu non crawle correctement, sans backlinks, qui n'atteint jamais la page 1.</p>
<p>La regle d'or : <strong>40 % du budget technique au demarrage</strong> (assainissement), puis 50 % contenu et 10 % autorite. Apres 6 mois, on bascule sur 20 % technique (maintenance), 50 % contenu, 30 % autorite.</p>
<h2>FAQ</h2>
<p><strong>Peut-on ranker sans backlinks ?</strong> Oui sur des niches peu concurrentielles (longue traine locale, B2B niche). Non sur des requetes commerciales generiques.</p>
<p><strong>Faut-il un developpeur en interne ?</strong> Pas obligatoirement. Un consultant SEO senior pilote la technique avec votre prestataire web. Mais pour un site e-commerce ou un SaaS, un dev SEO interne devient rapidement rentable.</p>
<p><strong>Pirabel Labs</strong> realise des audits 360 (technique + contenu + autorite) avec roadmap priorisee sur 90 jours. <a href="/contact">Demandez votre audit</a> ou <a href="/rendez-vous">reservez un call decouverte</a>.</p>"""},
            {'title': "Choisir son strategie SEO selon son business",
             'duration': 18,
             'content_html': """<h2>Pourquoi adapter la strategie au modele economique</h2>
<p>Il n'existe pas une seule strategie SEO universelle. Les leviers a actionner, le rythme, le budget et les KPIs varient enormement selon que vous gerez un <strong>e-commerce</strong>, un <strong>SaaS B2B</strong>, un <strong>site de services local</strong>, un <strong>media</strong> ou une <strong>marketplace</strong>. Une PME qui copie la strategie d'une grande marque echoue dans 9 cas sur 10 par incompatibilite de ressources et d'objectifs.</p>
<h2>Cartographie des 5 profils business</h2>
<h3>1. E-commerce</h3>
<p>L'enjeu principal : optimiser des milliers de pages produits et categories. Strategie type : <strong>pyramide</strong> avec pages categories optimisees pour les requetes head (fort volume), pages sous-categories pour les middle-tail et pages produits pour la longue traine. Budget mensuel typique : 1 500 a 8 000 EUR (PME), 15 000 a 80 000 EUR (mid-market).</p>
<ul>
<li>KPIs : trafic organique converti, ROAS organique, AOV organique.</li>
<li>Leviers prioritaires : architecture, schema Product, contenu categorie, internal linking.</li>
<li>Outils : Ahrefs (concurrence), Screaming Frog (crawl), Search Console (filtres par categorie).</li>
</ul>
<h3>2. SaaS B2B</h3>
<p>L'enjeu : capturer une audience B2B avec un cycle d'achat long (3 a 9 mois). Strategie type : <strong>top of funnel + bottom of funnel</strong>. Top : articles guides longs (3 000-5 000 mots) sur les douleurs du persona. Bottom : pages comparatifs ("alternatives a Salesforce"), pages cas d'usage et integrations.</p>
<p>Budget : 3 000 a 15 000 EUR/mois. KPIs : MQL organiques, SQL organiques, ARR attribue. Exemple reference : Ahrefs lui-meme genere 40 % de ses leads via le SEO de son blog.</p>
<h3>3. Site de services local</h3>
<p>Pour un cabinet d'avocat a Abomey-Calavi ou un dentiste a Cotonou, la strategie est <strong>locale</strong>. Priorite absolue : Google Business Profile (GBP) optimise, citations NAP (Name Address Phone) coherentes sur 30+ annuaires (PagesJaunes, Yelp, Mappy, annuaires africains comme AfriquaPages), reviews Google (objectif 30+ avis 4,5/5), et pages services locales avec schema LocalBusiness.</p>
<p>Budget : 300 a 1 200 EUR/mois (400 000 a 1 600 000 FCFA). KPIs : appels GBP, demandes de RDV, formulaires locaux. ROI souvent rapide : 3 a 5 mois pour atteindre le pack local de Google Maps.</p>
<h3>4. Media et editeurs</h3>
<p>Strategie volume : publier 5 a 20 articles par jour, vivre du programmatique et de l'affiliation. Leviers cles : <strong>Google News, Discover, AMP</strong> (en 2026 toujours utile pour les editeurs malgre son declin general), schema NewsArticle, taggage editorial precis. Budget redactionnel souvent superieur au budget SEO pur.</p>
<h3>5. Marketplaces</h3>
<p>Defis specifiques : duplication massive, contenu genere par les utilisateurs, gestion des pages categories thinning. Strategie : <strong>programmatic SEO</strong> avec generation automatique de pages combinant categories et localisations (par exemple "plomberie Cotonou", "plomberie Abomey-Calavi"). Outils : Webflow CMS, Strapi headless, scripts Python pour templates dynamiques.</p>
<h2>Matrice de decision strategique</h2>
<p>Pour choisir, croisez trois variables :</p>
<ol>
<li><strong>Concurrence sur vos mots-cles</strong> (mesuree par le KD Ahrefs ou Difficulty Semrush).</li>
<li><strong>Vitesse attendue de ROI</strong> (3 mois, 6 mois, 12 mois ou plus).</li>
<li><strong>Ressources disponibles</strong> (interne, agence, freelances).</li>
</ol>
<p>Si concurrence forte + ROI rapide attendu + petites ressources : commencez par la longue traine et le SEO local. Si concurrence moderee + ROI moyen terme + ressources moyennes : strategie topic cluster avec pillar pages. Si grosses ressources + ROI long terme : programmatic SEO + digital PR a grande echelle.</p>
<h2>Cas concret : choisir entre 3 strategies pour un cabinet conseil a Cotonou</h2>
<p>Un cabinet conseil RH de 8 personnes basee a Cotonou souhaite acquerir 20 clients PME par an via le digital. Trois options envisagees :</p>
<ul>
<li><strong>Option A : SEO local + Google Ads</strong>. Budget mensuel 500 000 FCFA. Vise les requetes "consultant RH Cotonou", "audit social Benin". Resultat attendu : 8-12 leads/mois en 6 mois.</li>
<li><strong>Option B : Blog expert B2B</strong>. Publication de 2 articles/mois (3 000 mots chacun) sur les problematiques RH des PME ouest-africaines. Resultat attendu : 4-6 leads/mois mais avec valeur LTV superieure (gros contrats).</li>
<li><strong>Option C : LinkedIn organique + retargeting</strong>. Pas du SEO classique mais une visibilite de proximite. Resultat : 3-5 leads/mois mais notoriete dirigeants accrue.</li>
</ul>
<p>La recommandation Pirabel Labs : combiner A et B pour un budget total de 800 000 FCFA/mois, avec resultats cumulatifs a 9 mois.</p>
<h2>FAQ</h2>
<p><strong>Combien de temps consacrer au SEO chaque semaine en tant que dirigeant ?</strong> 2 a 4 heures par semaine pour valider les briefs, relire les contenus strategiques, suivre les KPIs et echanger avec votre prestataire.</p>
<p><strong>Faut-il choisir SEO ou Google Ads ?</strong> Les deux. Google Ads pour les requetes commerciales immediates, SEO pour construire l'actif long terme. Ratio classique au demarrage : 60 % Ads, 40 % SEO. Apres 12 mois : 40 % Ads, 60 % SEO.</p>
<p><a href="/contact">Echangez avec un strategiste Pirabel Labs</a> pour identifier la strategie adaptee a votre modele. <a href="/rendez-vous">Reservez un call</a> de 30 minutes offert.</p>"""},
            {'title': "Concepts cles : SERP, SGE, position 0, EEAT",
             'duration': 18,
             'content_html': """<h2>Le vocabulaire indispensable du SEO 2026</h2>
<p>Pour dialoguer efficacement avec un prestataire SEO, suivre une formation avancee ou simplement comprendre les rapports techniques, vous devez maitriser une trentaine de termes specialises. Cette lecon couvre les quatre concepts les plus structurants en 2026.</p>
<h2>1. SERP (Search Engine Results Page)</h2>
<p>La SERP designe la <strong>page de resultats affichee par Google</strong> apres une requete. Elle a profondement evolue : en 2026, une SERP type contient en moyenne <strong>11 elements differents</strong> selon Mozcast :</p>
<ul>
<li>Reponse generative SGE (en haut, 1 a 3 paragraphes avec sources).</li>
<li>People Also Ask (PAA) - 4 questions liees.</li>
<li>Featured snippet (position 0) si applicable.</li>
<li>Pack local Google Maps (3 etablissements + carte) pour requetes locales.</li>
<li>Knowledge panel a droite pour entites connues.</li>
<li>Top stories (carousel d'articles recents).</li>
<li>Images (carousel ou pack).</li>
<li>Videos YouTube et autres plateformes.</li>
<li>Resultats organiques classiques (5 a 7 sur la page 1).</li>
<li>Recherches associees en bas de page.</li>
<li>Annonces Google Ads (Shopping, Search) en haut et en bas.</li>
</ul>
<p>L'enjeu strategique : chaque element est une opportunite d'occuper plusieurs surfaces simultanement. Un site bien optimise peut apparaitre dans la SGE, le featured snippet, les top stories et le pack local pour la meme requete, decuplant sa visibilite.</p>
<h2>2. SGE (Search Generative Experience)</h2>
<p>Lancee en preview en 2023 et generalisee en 2024-2025, la SGE est la <strong>reponse generative de Google</strong> qui apparait en haut de la SERP pour la plupart des requetes informationnelles. Elle synthese plusieurs sources et propose des liens "Pour aller plus loin".</p>
<p>Pour figurer dans la SGE :</p>
<ol>
<li><strong>Structurez votre contenu</strong> avec des H2 explicites et des paragraphes synthetiques (40-80 mots) qui repondent directement a une sous-intention.</li>
<li><strong>Citez des donnees factuelles</strong> avec sources et dates.</li>
<li><strong>Utilisez des listes</strong> ordonnees ou non quand approprie.</li>
<li><strong>Ajoutez des donnees structurees</strong> (FAQPage, HowTo, Article).</li>
<li><strong>Affichez clairement les auteurs</strong> avec page biographique credible.</li>
</ol>
<p>Selon une etude SE Ranking de fevrier 2026, 51 % des reponses SGE citent au moins une source qui ne figurait pas dans le top 10 organique classique. Cela cree une opportunite pour les sites a autorite moyenne mais a contenu tres pertinent.</p>
<h2>3. Position 0 (Featured Snippet)</h2>
<p>Le featured snippet est un <strong>extrait optimise place au-dessus des resultats organiques</strong> classiques. Il existe quatre formats : paragraphe (60 % des cas), liste (20 %), tableau (15 %), video (5 %). Pour le decrocher :</p>
<ul>
<li>Identifiez les requetes deja en featured snippet sur Ahrefs (filtre "SERP features").</li>
<li>Reformulez la requete en question dans votre H2 ou H3.</li>
<li>Repondez immediatement apres en 40 a 60 mots avec un paragraphe synthetique.</li>
<li>Pour les listes, utilisez ol ou ul avec phrases courtes (8-12 mots).</li>
</ul>
<p>Le CTR moyen d'une position 0 oscille entre 8 % et 12 % en 2026, contre 18-25 % avant l'arrivee de la SGE. Le featured snippet reste tres utile mais a perdu son monopole d'attention.</p>
<h2>4. EEAT (Experience, Expertise, Authoritativeness, Trustworthiness)</h2>
<p>EEAT est devenu en 2026 le cadre central des Search Quality Rater Guidelines de Google. Le E pour <strong>Experience</strong> a ete ajoute en decembre 2022 et renforce a chaque Core Update depuis.</p>
<ul>
<li><strong>Experience</strong> : avez-vous une experience directe et personnelle du sujet ? Un article sur "comment ouvrir un restaurant a Cotonou" doit etre redige par quelqu'un qui l'a vraiment fait.</li>
<li><strong>Expertise</strong> : avez-vous les credentials academiques ou professionnels pour traiter le sujet ?</li>
<li><strong>Authoritativeness</strong> : etes-vous reconnu par votre industrie (citations, conferences, publications) ?</li>
<li><strong>Trustworthiness</strong> : votre site est-il fiable techniquement (HTTPS), transparent (mentions legales, About Us) et editorialement (sources, dates, corrections) ?</li>
</ul>
<p>Pour booster votre EEAT operationnellement : creez des pages auteurs detaillees, ajoutez des photos reelles, mentionnez les diplomes et certifications, liez vers les profils LinkedIn verifies, citez vos publications et conferences, demandez des reviews Google.</p>
<h2>Concepts complementaires a connaitre</h2>
<p><strong>Crawl budget</strong> : nombre de pages que Googlebot accepte de crawler sur votre site par periode. <strong>Index bloat</strong> : indexation excessive de pages a faible valeur. <strong>Cannibalisation</strong> : deux pages de votre site qui ciblent la meme requete et se concurrencent. <strong>Topical authority</strong> : autorite thematique sur un sujet. <strong>Entities</strong> : entites identifiees par Google (lieux, personnes, marques) qui structurent sa comprehension semantique. <strong>NLP (Natural Language Processing)</strong> : algorithmes de comprehension du langage (BERT, MUM, Gemini chez Google).</p>
<h2>FAQ</h2>
<p><strong>Comment savoir si je suis dans la SGE ?</strong> Utilisez l'outil gratuit ZipTie (ziptie.dev) ou la fonction SERP Preview d'Ahrefs/Semrush. Sinon, faites des recherches manuelles sur vos requetes cibles depuis un compte Google US ou avec un VPN.</p>
<p><strong>L'EEAT est-il un score chiffre ?</strong> Non. C'est un cadre conceptuel utilise par les quality raters de Google. Aucun score public n'existe. Plusieurs outils (Surfer, Marketmuse) proposent des scores EEAT proprietaires utiles comme indicateur.</p>
<p>Pirabel Labs vous accompagne dans l'optimisation SGE et EEAT de vos contenus. <a href="/contact">Demandez un audit</a> ou <a href="/rendez-vous">prenez RDV</a>.</p>"""},
        ],
    },
    {
        'title': 'Audit technique et on-page',
        'objective': "Vous saurez auditer techniquement un site, identifier les optimisations on-page prioritaires et batir une architecture interne qui transmet correctement le PageRank.",
        'duration': 90,
        'lessons': [
            {'title': "Outils SEO essentiels : Ahrefs, Semrush, Search Console",
             'duration': 18,
             'content_html': """<h2>La trousse a outils du SEO professionnel 2026</h2>
<p>Faire du SEO serieux sans outils, c'est comme construire une maison sans niveau ni metre. Les trois outils incontournables en 2026 sont <strong>Ahrefs</strong>, <strong>Semrush</strong> et <strong>Google Search Console</strong>. Chacun a son role specifique. Le bon SEO ne choisit pas l'un contre les autres, il combine leurs forces.</p>
<h2>Google Search Console (GSC)</h2>
<p>Gratuit, indispensable, fourni par Google lui-meme. GSC vous donne acces a la <strong>vraie data de votre site dans l'index Google</strong> : requetes qui amenent du trafic, positions moyennes, CTR, impressions, pages indexees, problemes techniques detectes par Googlebot.</p>
<p>Les 5 rapports a consulter chaque semaine :</p>
<ol>
<li><strong>Performance > Resultats de recherche</strong> : suivez l'evolution des clics et impressions sur 28 jours. Filtrez par requete, page, pays, device.</li>
<li><strong>Couverture > Pages indexees</strong> : identifiez les exclusions (redirections, 404, dupliquees, noindex).</li>
<li><strong>Sitemaps</strong> : verifiez que vos sitemaps sont soumis et lus correctement.</li>
<li><strong>Core Web Vitals</strong> : suivez LCP, INP, CLS sur mobile et desktop.</li>
<li><strong>Inspection de l'URL</strong> : verifiez l'etat d'une page specifique, forcez son indexation si necessaire.</li>
</ol>
<p>Couplez GSC avec Looker Studio (gratuit aussi) pour creer des dashboards personnalises. Une connexion native existe depuis 2024.</p>
<h2>Ahrefs</h2>
<p>Tarifs 2026 : 99 USD/mois pour le plan Lite, 199 USD pour Standard, 399 USD pour Advanced, 999 USD pour Enterprise. Le standard de l'industrie pour l'analyse de backlinks. Sa base de donnees compte plus de <strong>14 trillions de backlinks</strong> et est rafraichie en continu.</p>
<p>Modules principaux :</p>
<ul>
<li><strong>Site Explorer</strong> : analyse n'importe quel domaine ou URL (backlinks, mots-cles organiques, trafic estime, top pages).</li>
<li><strong>Keywords Explorer</strong> : recherche de mots-cles avec metriques (volume, difficulte KD, intention, CPC).</li>
<li><strong>Site Audit</strong> : crawl complet de votre site avec 100+ controles techniques.</li>
<li><strong>Rank Tracker</strong> : suivi de positions sur les mots-cles que vous suivez.</li>
<li><strong>Content Explorer</strong> : decouvrez les articles les plus partages et linkes sur un sujet.</li>
</ul>
<p>Ahrefs excelle pour : analyser la concurrence, identifier les opportunites de backlinks, faire de la keyword research approfondie. Ses faiblesses : moins precis sur le SEO local, interface dense pour debutants.</p>
<h2>Semrush</h2>
<p>Tarifs 2026 : 139 USD/mois pour Pro, 249 USD pour Guru, 499 USD pour Business. Plus genealiste qu'Ahrefs, Semrush couvre SEO, Ads, social media et content marketing dans une meme plateforme.</p>
<p>Modules differenciants :</p>
<ul>
<li><strong>Domain Overview</strong> avec analyse de la concurrence payante (Google Ads).</li>
<li><strong>Position Tracking</strong> avec alertes par email/Slack.</li>
<li><strong>On-Page SEO Checker</strong> qui propose des ameliorations concretes par page.</li>
<li><strong>Topic Research</strong> et <strong>SEO Content Template</strong> pour briefer les redacteurs.</li>
<li><strong>Listing Management</strong> pour le SEO local (citations NAP).</li>
</ul>
<p>Semrush est superieur pour : le SEO local, les analyses competitives multi-canaux (organique + paid), le pilotage agence avec plusieurs clients. Sa base de mots-cles francais et africains est plus profonde qu'Ahrefs dans certaines verticales.</p>
<h2>Comment choisir entre Ahrefs et Semrush</h2>
<p>Si vous devez choisir un seul outil :</p>
<ul>
<li><strong>Choisissez Ahrefs si</strong> : vous faites beaucoup de netlinking, vous analysez la concurrence internationale, vous avez besoin de la meilleure base de backlinks.</li>
<li><strong>Choisissez Semrush si</strong> : vous gerez plusieurs clients, vous combinez SEO et Google Ads, vous faites du SEO local intensif.</li>
</ul>
<p>L'ideal pour une agence : avoir les deux. Pour un freelance ou une PME, commencez par Ahrefs Lite ou Semrush Pro, et complementez avec GSC, Ubersuggest (alternative low cost) et Keywords Everywhere.</p>
<h2>Outils complementaires indispensables</h2>
<ul>
<li><strong>Screaming Frog SEO Spider</strong> (149 GBP/an) : crawler desktop incontournable pour les audits techniques.</li>
<li><strong>Sitebulb</strong> (35 USD/mois) : crawler avec visualisations remarquables.</li>
<li><strong>PageSpeed Insights</strong> (gratuit) : audit Core Web Vitals.</li>
<li><strong>Google Trends</strong> (gratuit) : tendances de recherche dans le temps et par geographie.</li>
<li><strong>Surfer SEO</strong> (89 USD/mois) : optimisation on-page assistee par IA.</li>
<li><strong>ContentKing</strong> ou <strong>Oncrawl</strong> pour les sites avec 10 000+ URLs : monitoring SEO temps reel.</li>
</ul>
<h2>Budget mensuel realiste</h2>
<p>Pour un freelance SEO francophone debutant : <strong>200 a 350 EUR/mois</strong> d'outils (Ahrefs Lite 99 + Surfer Essential 89 + divers gratuits). Pour une PME beninoise serieuse : <strong>400 a 700 EUR/mois</strong> (Semrush Pro + Screaming Frog + Looker Studio + Keywords Everywhere). Pour une agence : 1 200 a 3 500 EUR/mois selon nombre de clients.</p>
<h2>FAQ</h2>
<p><strong>Peut-on faire du SEO uniquement avec GSC et des outils gratuits ?</strong> Oui pour debuter ou pour un petit site local. Non pour du SEO competitif : il manque l'analyse concurrentielle et la profondeur de keyword research.</p>
<p><strong>Quel outil pour les sites en wolof, fon, swahili ?</strong> Aucun n'est specialement optimise. Combinez Ahrefs/Semrush (bases globales) avec Google Trends regionalise et Google Keyword Planner.</p>
<p>Pirabel Labs forme vos equipes a ces outils. <a href="/contact">Demandez un programme</a> ou <a href="/rendez-vous">reservez une demo</a>.</p>"""},
            {'title': "Recherche de mots-cles : intention et volume",
             'duration': 18,
             'content_html': """<h2>Le coeur strategique de toute campagne SEO</h2>
<p>Une mauvaise recherche de mots-cles condamne une strategie SEO des le depart. Cibler des termes a fort volume mais sans intention commerciale, c'est gaspiller des mois de production de contenu. A l'inverse, decouvrir les bonnes requetes a moyen volume mais forte conversion peut multiplier votre ROI par 5 ou 10.</p>
<h2>Les 4 types d'intention de recherche</h2>
<p>Google classe chaque requete dans une intention dominante. La maitriser est plus important que le volume.</p>
<ol>
<li><strong>Navigationnelle</strong> : l'utilisateur cherche un site specifique ("youtube", "facebook login", "ahrefs"). Inutile de cibler sauf si c'est votre marque.</li>
<li><strong>Informationnelle</strong> : l'utilisateur veut s'informer ("qu'est-ce que le SEO", "comment installer WordPress"). Format : guides, tutoriels, articles long format.</li>
<li><strong>Commerciale (investigation)</strong> : l'utilisateur compare avant achat ("meilleur CRM PME", "Ahrefs vs Semrush"). Format : comparatifs, top X, reviews.</li>
<li><strong>Transactionnelle</strong> : l'utilisateur veut acheter ("acheter formation SEO", "consultant SEO Cotonou"). Format : page service, page produit, landing page.</li>
</ol>
<p>Une requete peut etre <strong>hybride</strong>. Exemple : "logiciel comptabilite gratuit" combine commerciale (compare) et transactionnelle (gratuit = telecharge). Pour identifier l'intention reelle, analysez la SERP : si elle affiche surtout des comparatifs, c'est commerciale ; si des pages produits, c'est transactionnelle.</p>
<h2>Comment evaluer le volume de recherche</h2>
<p>Le volume mensuel moyen vous indique le potentiel maximum. Sources fiables :</p>
<ul>
<li><strong>Ahrefs Keywords Explorer</strong> : volume mensuel moyen, par pays, avec historique 24 mois.</li>
<li><strong>Google Keyword Planner</strong> (gratuit avec compte Google Ads) : volumes officiels mais en fourchettes (1 000-10 000).</li>
<li><strong>Semrush Keyword Magic Tool</strong> : volume mensuel et trend.</li>
<li><strong>Google Trends</strong> : tendance relative dans le temps.</li>
</ul>
<p>Attention aux pieges : un volume affiche de 10 000 peut etre tres saisonnier (cadeaux Noel) ou domine par une marque ("nutella" appartient a Nutella). Verifiez toujours la SERP.</p>
<h2>La difficulte de positionnement (KD/DS)</h2>
<p>Le <strong>Keyword Difficulty</strong> (KD chez Ahrefs, KD% chez Semrush) note de 0 a 100 la difficulte estimee a se positionner en page 1. Methodologie : agregation du DR moyen des sites en top 10, du nombre de backlinks, de la qualite du contenu.</p>
<p>Reperes :</p>
<ul>
<li>KD 0-10 : tres facile, accessible meme pour un site neuf.</li>
<li>KD 11-30 : modere, atteignable en 4-8 mois avec contenu de qualite.</li>
<li>KD 31-60 : difficile, necessite backlinks et autorite etablie.</li>
<li>KD 61-100 : tres difficile, reserve aux gros sites avec strategies longues.</li>
</ul>
<p>Pour une PME africaine debutante, ciblez initialement le KD 0-25. Apres 6 mois d'autorite, montez progressivement vers 30-50.</p>
<h2>Methode complete en 6 etapes</h2>
<ol>
<li><strong>Brainstorming initial</strong> : listez 20-30 themes generaux lies a votre business. Demandez aux commerciaux les questions clients frequentes.</li>
<li><strong>Expansion automatisee</strong> : utilisez Ahrefs Keywords Explorer ou Semrush sur chaque theme. Filtrez par volume, KD et intention.</li>
<li><strong>Etude de la concurrence</strong> : analysez les mots-cles de 5 concurrents directs via Ahrefs Site Explorer > Organic keywords. Decouvrez les opportunites non couvertes par vous (Content Gap).</li>
<li><strong>Analyse SERP</strong> : pour chaque mot-cle prometteur, ouvrez la SERP en navigation privee. Verifiez les formats dominants, la SGE, le pack local, les featured snippets.</li>
<li><strong>Priorisation</strong> : creez une matrice volume x KD x intention x business value. Ciblez en priorite les requetes a forte intention transactionnelle, KD <30, volume >100.</li>
<li><strong>Mapping</strong> : assignez chaque mot-cle a une page existante (a optimiser) ou a creer.</li>
</ol>
<h2>Cas pratique : recherche de mots-cles pour un cabinet d'expertise comptable a Cotonou</h2>
<p>Themes initiaux : "expertise comptable", "comptable PME", "fiscalite Benin", "audit financier", "creation entreprise Cotonou".</p>
<p>Apres expansion Ahrefs, 47 mots-cles pertinents identifies. Top 10 prioritaires :</p>
<ul>
<li>"comptable Cotonou" - 320 vol/mois - KD 12 - transactionnelle.</li>
<li>"creation SARL Benin" - 240 vol/mois - KD 8 - transactionnelle.</li>
<li>"declaration fiscale PME Benin" - 110 vol/mois - KD 15 - informationnelle + transactionnelle.</li>
<li>"audit financier Cotonou" - 85 vol/mois - KD 6 - transactionnelle.</li>
<li>"taux IS Benin 2026" - 270 vol/mois - KD 4 - informationnelle.</li>
<li>"expert comptable agree Benin" - 95 vol/mois - KD 18 - transactionnelle.</li>
<li>"logiciel comptabilite Benin" - 180 vol/mois - KD 22 - commerciale.</li>
<li>"obligations comptables SARL" - 145 vol/mois - KD 10 - informationnelle.</li>
<li>"ouvrir entreprise Cotonou cout" - 220 vol/mois - KD 14 - informationnelle + transactionnelle.</li>
<li>"plan comptable SYSCOHADA" - 410 vol/mois - KD 19 - informationnelle.</li>
</ul>
<p>Strategie : pages services pour les 5 transactionnelles, articles guides pour les informationnelles, comparatif pour la commerciale.</p>
<h2>FAQ</h2>
<p><strong>Combien de mots-cles cibler par page ?</strong> Un mot-cle principal et 5 a 15 variantes semantiques. Pas de page "fourre-tout" qui cible 50 termes differents.</p>
<p><strong>Que faire si tous les mots-cles ont un KD eleve ?</strong> Pivoter vers la longue traine (3-5 mots) ou la localisation ("agence digital Cotonou" au lieu de "agence digital").</p>
<p>Pirabel Labs realise des keyword research approfondies pour vous. <a href="/contact">Demandez une etude</a> ou <a href="/rendez-vous">reservez 30 min</a>.</p>"""},
            {'title': "Audit technique : crawler son site avec Screaming Frog",
             'duration': 18,
             'content_html': """<h2>L'outil de reference de l'audit technique</h2>
<p>Screaming Frog SEO Spider est depuis 15 ans le crawler de reference des agences SEO. Pour 149 GBP par an (environ 170 EUR), vous obtenez un outil desktop capable de crawler jusqu'a 500 URLs gratuitement et illimite en version payante. Pour les sites jusqu'a 100 000 URLs, c'est l'outil le plus efficace du marche.</p>
<h2>Installation et configuration initiale</h2>
<p>Telechargez depuis screamingfrog.co.uk pour Windows, macOS ou Linux. Installez et activez la licence si payante. Configuration recommandee avant premier crawl :</p>
<ul>
<li><strong>Configuration > User-Agent</strong> : selectionnez Googlebot Smartphone pour simuler le mobile-first.</li>
<li><strong>Configuration > Spider > Crawl</strong> : cochez "Check Links Outside of Start Folder" si vous voulez limiter au sous-domaine.</li>
<li><strong>Configuration > Robots.txt</strong> : respectez le robots.txt ou ignorez-le selon l'analyse souhaitee.</li>
<li><strong>Configuration > Rendering</strong> : pour les sites React/Vue/Angular, activez "JavaScript" pour le rendering complet.</li>
<li><strong>Configuration > Speed</strong> : limitez a 5 threads et 5 URLs/s pour eviter de surcharger des petits serveurs.</li>
</ul>
<h2>Lancer le premier crawl</h2>
<p>Entrez l'URL de votre site dans le champ en haut, cliquez "Start". Le crawl dure de quelques minutes (petit site) a plusieurs heures (gros e-commerce). Pendant le crawl, naviguez dans les onglets pour analyser en temps reel.</p>
<h2>Les 10 verifications critiques</h2>
<ol>
<li><strong>Codes reponse HTTP</strong> : onglet "Response Codes". Verifiez le ratio 200/3xx/4xx/5xx. Objectif : 95 %+ en 200, moins de 1 % en 4xx, 0 % en 5xx.</li>
<li><strong>Titres de page (Title)</strong> : onglet "Page Titles". Verifiez longueur (50-60 caracteres), unicite, presence du mot-cle principal en debut.</li>
<li><strong>Meta descriptions</strong> : longueur 150-160 caracteres, unicite, attractivite. 30 % des sites audites n'ont pas de meta description sur leurs pages cles.</li>
<li><strong>Balises Hn</strong> : un seul H1 par page, hierarchie logique H1 > H2 > H3, presence du mot-cle dans H1.</li>
<li><strong>Images</strong> : onglet "Images". Verifiez les alt text manquants (typiquement 40-60 % des images sur un site non optimise) et les images >100 Ko.</li>
<li><strong>Canonical</strong> : onglet "Canonical". Verifiez que chaque page a une canonical self-referente ou pointe vers la version preferentielle.</li>
<li><strong>Robots et meta robots</strong> : detectez les pages noindex involontaires.</li>
<li><strong>Liens internes</strong> : onglet "Links". Identifiez les pages orphelines (sans liens entrants), les liens casses internes (404), la profondeur moyenne.</li>
<li><strong>Liens externes</strong> : verifiez les liens sortants casses et les domaines suspects.</li>
<li><strong>Donnees structurees</strong> : onglet "Structured Data" (necessite activation). Detecte les erreurs de schema.org.</li>
</ol>
<h2>Exports et reporting</h2>
<p>Pour chaque onglet, exportez en CSV ou Excel. Combinez plusieurs exports dans un dashboard Google Sheets ou Looker Studio. Les exports indispensables pour un rapport client :</p>
<ul>
<li>Liste des URLs avec status code, title, meta, H1, longueur de contenu.</li>
<li>Liste des erreurs 404 avec page d'origine pour redirections.</li>
<li>Liste des images sans alt avec recommandations.</li>
<li>Liste des pages avec title manquant ou duplique.</li>
<li>Graphique de profondeur (crawl depth) avec heatmap.</li>
</ul>
<h2>Connexion aux APIs : Google Analytics, Search Console, PageSpeed</h2>
<p>Screaming Frog peut se connecter aux APIs Google pour enrichir vos donnees :</p>
<ul>
<li>Connection a GSC : trafic et impressions par URL.</li>
<li>Connection a GA4 : sessions, taux de rebond, conversions.</li>
<li>Connection a PageSpeed Insights : Core Web Vitals par URL.</li>
<li>Connection a Ahrefs/Majestic : nombre de backlinks par URL.</li>
</ul>
<p>Une fois enrichi, vous identifiez par exemple les pages avec beaucoup d'impressions mais faible CTR (probleme de title/meta), ou les pages a fort trafic mais LCP degrade (priorite performance).</p>
<h2>Cas pratique : audit d'un site WordPress de 850 pages</h2>
<p>Resultats typiques d'un premier audit :</p>
<ul>
<li>847 URLs crawlees, 12 erreurs 404, 4 redirections en chaine, 0 erreur 5xx.</li>
<li>73 pages avec title duplique (categories WooCommerce mal configurees).</li>
<li>120 pages sans meta description.</li>
<li>320 images sans alt text.</li>
<li>15 pages orphelines (anciennes pages produits non maillees).</li>
<li>Profondeur moyenne : 4,2 clics (objectif : <3,5).</li>
<li>Schema.org : Product manquant sur 87 fiches produits.</li>
</ul>
<p>Plan d'action priorise : (1) corriger les 404 et redirections, (2) reecrire les titles dupliques, (3) ajouter les meta descriptions manquantes, (4) batch-tag les alt text via plugin SEO, (5) remailler les pages orphelines, (6) implementer le schema Product.</p>
<h2>FAQ</h2>
<p><strong>Combien de temps pour un audit complet ?</strong> 4 a 8 heures pour un site de 1 000 pages, 2 a 5 jours pour un site de 10 000+ pages.</p>
<p><strong>Alternatives a Screaming Frog ?</strong> Sitebulb (interface plus moderne), Oncrawl (cloud, gros sites), Botify (entreprise).</p>
<p>Pirabel Labs realise des audits Screaming Frog avec rapport prioritise. <a href="/contact">Demandez votre audit</a> ou <a href="/rendez-vous">prenez RDV</a>.</p>"""},
            {'title': "Optimisation on-page : title, meta, Hn, structure",
             'duration': 18,
             'content_html': """<h2>L'optimisation on-page : le travail qui paye le mieux</h2>
<p>L'optimisation on-page reste en 2026 le meilleur rapport effort/resultat du SEO. Une simple amelioration de titles et meta descriptions peut augmenter le CTR de 15 a 30 %, donc le trafic. Et c'est entierement sous votre controle, contrairement aux backlinks ou aux algorithmes.</p>
<h2>1. Optimisation du Title (balise meta title)</h2>
<p>Le title est la balise HTML la plus importante pour le SEO et le CTR. Affiche dans l'onglet du navigateur, dans la SERP et dans les partages sociaux par defaut.</p>
<p>Regles 2026 :</p>
<ul>
<li><strong>Longueur</strong> : 50 a 60 caracteres pour eviter la troncature. Google affiche 580 pixels environ.</li>
<li><strong>Position du mot-cle</strong> : au debut quand possible. Test eye-tracking confirment que les utilisateurs lisent les 3-4 premiers mots.</li>
<li><strong>Marque a la fin</strong> separee par un pipe "|" ou un tiret "-".</li>
<li><strong>Unicite</strong> : chaque page un title unique. Google peut reecrire vos titles s'il les juge inadaptes.</li>
<li><strong>Click-bait raisonne</strong> : ajoutez chiffres, parentheses, dates ("Guide 2026", "(en 5 minutes)", "[Tutoriel]").</li>
</ul>
<p>Exemples : "Guide SEO 2026 : Strategies Avancees | Pirabel Labs" (52 caracteres), "Agence SEO Cotonou - Audit Gratuit en 48h" (43 caracteres).</p>
<h2>2. Meta description</h2>
<p>Ne contribue pas directement au classement mais influence enormement le CTR. Une etude HubSpot 2026 montre qu'une meta description optimisee booste le CTR de 24 % en moyenne.</p>
<p>Regles :</p>
<ul>
<li><strong>Longueur</strong> : 150 a 160 caracteres maximum.</li>
<li><strong>Repetition du mot-cle</strong> : au moins une fois, mis en gras automatiquement par Google quand il matche la requete.</li>
<li><strong>Promesse de valeur claire</strong> : qu'est-ce que l'utilisateur va trouver ? Pourquoi cliquer ?</li>
<li><strong>Call-to-action</strong> : "Decouvrez", "Comparez", "Telechargez", "Demandez un devis gratuit".</li>
</ul>
<h2>3. Hierarchie des Hn</h2>
<p>La structure semantique Hn aide Google a comprendre la hierarchie de votre contenu et permet aux utilisateurs (et lecteurs d'ecran) de naviguer.</p>
<ul>
<li><strong>H1</strong> : un seul par page, idealement identique ou tres proche du title.</li>
<li><strong>H2</strong> : sections principales (4 a 8 par article long).</li>
<li><strong>H3</strong> : sous-sections (sous chaque H2).</li>
<li><strong>H4-H6</strong> : rarement necessaires sauf documents tres longs.</li>
</ul>
<p>Erreurs courantes : sauter des niveaux (H1 puis H4), utiliser Hn pour le design (taille de police) au lieu de la hierarchie semantique, oublier le mot-cle dans le H1.</p>
<h2>4. URLs propres</h2>
<p>Une bonne URL est <strong>courte, descriptive et sans parametres inutiles</strong>. Exemples :</p>
<ul>
<li>Bon : /blog/seo-local-cotonou-guide</li>
<li>Mauvais : /index.php?id=1234&cat=12&utm_source=google</li>
</ul>
<p>Privilegiez les tirets aux underscores, separez les mots, evitez les majuscules et accents. Pour un site WordPress, configurez la permaliens en "Nom de l'article".</p>
<h2>5. Optimisation du contenu</h2>
<p>Au-dela des balises, le corps de texte doit etre optimise :</p>
<ul>
<li><strong>Premier paragraphe</strong> : contient le mot-cle principal et donne une reponse synthetique.</li>
<li><strong>Densite</strong> : 1 a 2 % de densite du mot-cle principal. Pas plus pour eviter le keyword stuffing.</li>
<li><strong>Variantes semantiques</strong> : utilisez Surfer SEO ou MarketMuse pour identifier les termes lies a inclure.</li>
<li><strong>Liens internes</strong> : 3 a 8 liens vers d'autres pages pertinentes de votre site.</li>
<li><strong>Liens externes</strong> : 1 a 3 liens vers des sources autoritaires (.gov, .edu, presse).</li>
<li><strong>Multimedia</strong> : images optimisees, videos integrees, infographies.</li>
</ul>
<h2>6. Optimisation des images</h2>
<ul>
<li><strong>Format</strong> : WebP en priorite, fallback JPEG. AVIF pour les sites modernes.</li>
<li><strong>Compression</strong> : utilisez TinyPNG, Squoosh ou plugins WordPress (Smush, Imagify, ShortPixel).</li>
<li><strong>Dimensions</strong> : adaptez a l'usage. Pas de 4K pour un thumbnail 200px.</li>
<li><strong>Alt text</strong> : descriptif et incluant le mot-cle quand pertinent.</li>
<li><strong>Lazy loading</strong> : natif avec loading="lazy" depuis 2020.</li>
<li><strong>Nom de fichier</strong> : descriptif (consultant-seo-cotonou.webp et non IMG_4837.jpg).</li>
</ul>
<h2>7. Donnees structurees (schema.org)</h2>
<p>Les schemas indispensables :</p>
<ul>
<li><strong>Article</strong> ou <strong>BlogPosting</strong> pour les articles de blog.</li>
<li><strong>BreadcrumbList</strong> pour le fil d'Ariane.</li>
<li><strong>FAQPage</strong> pour les sections FAQ (booste les rich results).</li>
<li><strong>LocalBusiness</strong> pour les commerces et services locaux.</li>
<li><strong>Product</strong> pour les fiches produits e-commerce.</li>
<li><strong>Review</strong> et <strong>AggregateRating</strong> pour les avis.</li>
<li><strong>HowTo</strong> pour les tutoriels etape par etape.</li>
</ul>
<p>Implementez via plugin Yoast/RankMath ou JSON-LD personnalise. Verifiez avec l'outil de test Google Rich Results.</p>
<h2>Cas pratique : optimiser un article de blog existant</h2>
<p>Avant optimisation : article "Comment optimiser son site web", title "Bienvenue sur notre blog", H1 "Article", 0 image alt, 1 lien interne, pas de schema. Trafic mensuel : 12 visites.</p>
<p>Apres optimisation : title "Comment Optimiser un Site Web : Guide Complet 2026 | Pirabel Labs", meta description engageante avec CTA, H1 reformule, 5 H2 structurants, 12 H3, 7 images optimisees avec alt, 8 liens internes, schema Article + FAQ. Trafic mensuel apres 90 jours : 380 visites.</p>
<h2>FAQ</h2>
<p><strong>Combien de temps pour optimiser une page ?</strong> 2 a 4 heures pour une page existante, 6 a 10 heures pour creer une page optimisee from scratch.</p>
<p><strong>Faut-il optimiser toutes les pages ?</strong> Priorisez les pages qui ont du trafic ou du potentiel (top 30 pages par impressions GSC). Negligez les pages legales et utilitaires.</p>
<p>Pirabel Labs realise des optimisations on-page rapides et mesurables. <a href="/contact">Discutons</a> ou <a href="/rendez-vous">reservez un audit</a>.</p>"""},
            {'title': "Maillage interne : architecture et silos thematiques",
             'duration': 18,
             'content_html': """<h2>Pourquoi le maillage interne est sous-estime</h2>
<p>Le maillage interne (internal linking) est le pilier le plus negligc des optimisations on-page. Pourtant, il influence directement trois facteurs critiques : la <strong>distribution du PageRank interne</strong>, la <strong>decouverte des pages</strong> par Googlebot et la <strong>comprehension thematique</strong> de votre site. Une etude Onely 2026 montre que les sites avec un maillage optimise rankent 38 % plus haut sur leurs requetes cibles que ceux avec un maillage chaotique.</p>
<h2>Le concept de PageRank interne</h2>
<p>PageRank est le nom de l'algorithme historique de Google qui mesure l'autorite d'une page selon les liens entrants. Bien qu'il ait evolue, le principe reste valide en interne : <strong>une page recoit du "jus" via les liens qui pointent vers elle</strong>, et le redistribue via les liens qu'elle envoie.</p>
<p>Consequences pratiques :</p>
<ul>
<li>Votre <strong>homepage</strong> a generalement le PageRank le plus eleve (plus de backlinks externes).</li>
<li>Les pages a 1 clic de la home heritent d'une grande partie de ce jus.</li>
<li>Les pages a 4-5 clics de profondeur ne recoivent quasi rien.</li>
<li>Une page qui envoie 100 liens dilue plus son jus qu'une page qui en envoie 10.</li>
</ul>
<p>Strategie : maillez intelligemment vos pages business critiques (services, produits phares, pillar pages) depuis votre homepage et vos articles a fort trafic.</p>
<h2>Les 3 architectures classiques</h2>
<h3>Architecture en silo (silos thematiques)</h3>
<p>Structure pyramidale ou chaque grande thematique forme un silo etanche. Exemple pour un site de marketing digital :</p>
<ul>
<li>Home > SEO > {Audit SEO, Backlinks, Contenu SEO, SEO local}</li>
<li>Home > Ads > {Google Ads, Meta Ads, TikTok Ads}</li>
<li>Home > Email > {Brevo, Mailchimp, Klaviyo}</li>
</ul>
<p>Avantages : clarte thematique forte, transmission de l'autorite optimale au sein d'un sujet. Inconvenients : peut limiter la decouverte inter-thematiques.</p>
<h3>Architecture topique (topic clusters)</h3>
<p>Popularisee par HubSpot, basee sur une <strong>pillar page</strong> (page chapeau, 3 000-5 000 mots) et des <strong>cluster pages</strong> (5-15 articles satellites de 1 500-2 500 mots) qui linkent toutes vers la pillar et vice-versa.</p>
<p>Exemple : Pillar "Guide Complet du SEO en 2026" + clusters "EEAT explique", "SGE et SEO", "Audit technique SEO", "Backlinks 2026", etc.</p>
<p>C'est aujourd'hui l'architecture la plus recommandee pour les blogs B2B et les sites a contenu editorial.</p>
<h3>Architecture plate</h3>
<p>Toutes les pages sont a 1-2 clics de la home. Convient aux petits sites (moins de 100 pages) et e-commerces.</p>
<h2>Les regles d'or du maillage</h2>
<ol>
<li><strong>Profondeur maximale 3 clics</strong> depuis la home pour les pages strategiques.</li>
<li><strong>Liens contextuels</strong> dans le corps de texte plutot que dans les footers/sidebars (poids plus eleve).</li>
<li><strong>Ancres descriptives</strong> avec mot-cle naturel ("guide complet du SEO local" plutot que "cliquez ici").</li>
<li><strong>Variation des ancres</strong> : evitez de toujours utiliser la meme ancre vers une meme page (signal sur-optimisation).</li>
<li><strong>3 a 8 liens internes par article</strong> long format.</li>
<li><strong>Pas de liens entre pages cannibales</strong> (qui ciblent le meme mot-cle).</li>
</ol>
<h2>Detecter les pages orphelines</h2>
<p>Une page orpheline est une page indexable sans aucun lien interne entrant. Elles sont quasi invisibles pour Google. Comment les detecter :</p>
<ul>
<li>Crawl Screaming Frog : onglet "Internal" > filtre Inlinks = 0.</li>
<li>Comparaison sitemap XML vs crawl interne : les URLs presentes dans le sitemap mais absentes du crawl sont orphelines.</li>
<li>Ahrefs Site Audit > Issues > Orphan pages.</li>
</ul>
<p>Action : ajoutez des liens internes depuis des pages a forte autorite et a sujet proche.</p>
<h2>Liens depuis le menu, footer, sidebar</h2>
<p>Tous les liens n'ont pas le meme poids :</p>
<ul>
<li><strong>Menu principal</strong> : poids tres eleve, visible sur toutes les pages. Reserve aux 5-7 pages strategiques.</li>
<li><strong>Footer</strong> : poids modere. Utile pour pages legales et secondaires.</li>
<li><strong>Sidebar</strong> : poids moyen. Bon pour articles connexes.</li>
<li><strong>Corps de texte</strong> : poids maximal, surtout en debut d'article.</li>
<li><strong>Breadcrumb</strong> : poids modere, ameliore l'UX et signale la hierarchie.</li>
</ul>
<h2>Outils pour analyser et optimiser</h2>
<ul>
<li><strong>Screaming Frog</strong> > onglet Internal > export pour visualiser les inlinks/outlinks.</li>
<li><strong>Sitebulb</strong> > Crawl Map : visualisation graphique de l'architecture.</li>
<li><strong>Plugin Link Whisper</strong> (WordPress, 77 USD) : suggestions automatiques de liens internes.</li>
<li><strong>Plugin Internal Link Juicer</strong> (WordPress) : auto-mapping de mots-cles vers URLs.</li>
<li><strong>Yoast Premium</strong> : suggestions de liens internes basees sur similarite contenu.</li>
</ul>
<h2>Cas pratique : optimisation du maillage pour un blog de 80 articles</h2>
<p>Audit initial : 22 articles orphelins, profondeur moyenne 5,1 clics, articles cles a 4 clics, ratio inlinks moyens : 1,2 par article.</p>
<p>Actions :</p>
<ol>
<li>Creation de 3 pillar pages (SEO, Ads, Email) maillees depuis la home et le menu.</li>
<li>Attribution de chaque article a un cluster.</li>
<li>Ajout de 4-6 liens contextuels dans chaque article vers pillar + autres cluster.</li>
<li>Footer enrichi avec liens vers articles cles.</li>
<li>Remaillage des articles orphelins depuis 2-3 articles thematiquement proches.</li>
</ol>
<p>Resultats apres 60 jours : profondeur moyenne reduite a 2,8 clics, articles cles a 2 clics, ratio inlinks moyen 4,7, trafic organique +42 %.</p>
<h2>FAQ</h2>
<p><strong>Trop de liens internes nuisent-ils ?</strong> Oui si exces (>30 liens par page) ou non pertinents. Restez naturel et utile pour l'utilisateur.</p>
<p><strong>Faut-il mettre nofollow sur les liens internes ?</strong> Non, sauf cas particuliers (login, panier, pages de remerciement). Le PageRank Sculpting est inefficace depuis 2009.</p>
<p>Pirabel Labs audite et optimise votre maillage interne. <a href="/contact">Demandez votre audit</a> ou <a href="/rendez-vous">prenez RDV 30 min</a>.</p>"""},
        ],
    },
]
