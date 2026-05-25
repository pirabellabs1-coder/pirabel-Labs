#!/usr/bin/env python3
"""Contenu structure des formations SEO."""

SEO_DEBUTANT_MODULES = [
    {
        'title': 'Comprendre le SEO et le fonctionnement de Google',
        'objective': "Maitriser les bases conceptuelles : qu'est-ce que le SEO, comment fonctionne Google, et pourquoi le referencement reste crucial en 2026.",
        'duration': 90,
        'lessons': [
            {'title': "Qu'est-ce que le SEO et pourquoi c'est vital pour votre business", 'duration': 20,
             'content_html': """
<p>Le <strong>SEO</strong> (Search Engine Optimization, ou referencement naturel en francais) regroupe l'ensemble des techniques utilisees pour positionner un site internet dans les premieres places des resultats de recherche organiques (non payants) sur Google et les autres moteurs.</p>

<p>En 2026, le SEO represente la source d'acquisition n&deg;1 pour 68% des PME B2B et 53% des e-commerces. Pourquoi cette domination ? Trois raisons fondamentales :</p>

<h4>1. Le trafic SEO est qualifie et a forte intention</h4>
<p>Quelqu'un qui cherche "agence SEO Cotonou" ou "comment optimiser mon site WordPress" exprime un besoin precis. C'est l'inverse de la publicite ou vous interrompez quelqu'un qui ne demandait rien. Le visiteur SEO est dej&agrave; dans une dynamique d'achat ou de recherche d'expertise.</p>

<h4>2. Le trafic SEO est gratuit et cumulatif</h4>
<p>Un article bien positionne sur Google continue de generer du trafic 3, 5, 10 ans apres sa publication. Contrairement aux Meta Ads ou Google Ads qui s'arretent des que vous coupez le budget, le SEO fonctionne comme un actif qui s'apprecie avec le temps.</p>

<h4>3. Le SEO construit votre autorite de marque</h4>
<p>Apparaitre en premier sur des requ&ecirc;tes strategiques de votre marche envoie un signal fort : vous &ecirc;tes la reference. Cette perception se transfere automatiquement &agrave; votre marque, vos services, vos prix.</p>

<h4>Mais le SEO a aussi ses contraintes</h4>
<p>C'est un investissement long terme. Comptez :</p>
<ul>
<li>30 &agrave; 60 jours pour les premiers signaux de positionnement (longue traine, requ&ecirc;tes peu concurrentielles)</li>
<li>3 &agrave; 6 mois pour des resultats significatifs sur des requ&ecirc;tes moyennes</li>
<li>12 &agrave; 24 mois pour dominer des requ&ecirc;tes concurrentielles ("agence marketing digital", "creation site web Paris")</li>
</ul>

<p>Si vous lancez votre activite et avez besoin de cash flow immediat, demarrez en parallele avec Meta Ads ou Google Ads pour generer du trafic instantanement, et investissez en SEO pour basculer progressivement vers ce canal moins co&ucirc;teux et plus durable.</p>

<h4>Le SEO en chiffres pour 2026</h4>
<ul>
<li><strong>92,3%</strong> des recherches mondiales passent par Google</li>
<li><strong>75%</strong> des clics se concentrent sur les 5 premiers resultats organiques</li>
<li><strong>53%</strong> du trafic web mondial provient du SEO (vs 27% pour le paid)</li>
<li><strong>Co&ucirc;t moyen par lead SEO :</strong> 3 &agrave; 8&euro; (vs 15-50&euro; en publicite payante)</li>
</ul>

<p>Le ROI moyen du SEO pour une PME est de <strong>22:1</strong> sur 24 mois. Pour 1&euro; investi, vous recuperez 22&euro; de chiffre d'affaires attribuable.</p>
"""},
            {'title': "Comment Google fonctionne : crawl, index, ranking", 'duration': 20,
             'content_html': """
<p>Pour comprendre comment apparaitre sur Google, il faut d'abord comprendre comment Google decouvre et classe les sites web. Le processus se decompose en trois etapes fondamentales : <strong>crawl</strong>, <strong>indexation</strong> et <strong>ranking</strong>.</p>

<h4>Etape 1 : le crawl (l'exploration)</h4>
<p>Google envoie des programmes appeles <em>Googlebot</em> qui parcourent le web en suivant les liens. Imaginez des bibliothecaires qui visitent chaque jour des millions de sites pour decouvrir de nouveaux contenus et verifier que les anciens existent toujours.</p>

<p>Pour qu'un site soit crawle efficacement, il faut :</p>
<ul>
<li>Un <strong>sitemap.xml</strong> qui liste toutes vos URLs &agrave; explorer</li>
<li>Un fichier <strong>robots.txt</strong> qui guide ou bloque le bot sur certaines zones</li>
<li>Une structure de liens internes propre (chaque page est accessible en max 3 clics depuis l'accueil)</li>
<li>Pas trop de pages "orphelines" (sans aucun lien entrant interne)</li>
</ul>

<p>Verification pratique : tapez <code>site:votredomaine.com</code> dans Google. Vous voyez le nombre approximatif de pages indexees. Si vous avez 500 pages reelles et que Google en montre 50, vous avez un probleme de crawlabilite.</p>

<h4>Etape 2 : l'indexation (l'archivage)</h4>
<p>Apres avoir crawle une page, Google decide si elle merite d'etre ajoutee &agrave; son index (sa giga-base de donnees de pages web). Une page indexee = une page potentiellement affichable en resultat de recherche.</p>

<p>Google n'indexe PAS toutes les pages qu'il crawle. Il filtre selon plusieurs criteres :</p>
<ul>
<li><strong>Qualite du contenu :</strong> texte original, utile, suffisamment long (300+ mots minimum)</li>
<li><strong>Pas de contenu duplique :</strong> Google ignore les pages copiees d'autres sites</li>
<li><strong>Indexable techniquement :</strong> pas de meta noindex, pas de protection password</li>
<li><strong>Reputation du domaine :</strong> les nouveaux sites sont indexes plus lentement</li>
</ul>

<p>Pour verifier qu'une page est indexee : Google Search Console &rarr; Inspection d'URL &rarr; saisir l'URL. Vous obtenez le statut exact.</p>

<h4>Etape 3 : le ranking (le classement)</h4>
<p>C'est l&agrave; que tout se joue. Quand un internaute tape une requ&ecirc;te ("agence SEO Cotonou", par exemple), Google calcule en moins de 0,3 seconde quelle est la meilleure reponse parmi les milliards de pages indexees.</p>

<p>L'algorithme prend en compte <strong>plus de 200 facteurs</strong> de classement, mais on peut les regrouper en 4 grandes familles :</p>
<ol>
<li><strong>Pertinence du contenu :</strong> votre page repond-elle exactement &agrave; ce que cherche l'internaute ?</li>
<li><strong>Autorite du domaine :</strong> quels sites populaires vous citent (backlinks) ?</li>
<li><strong>Experience utilisateur :</strong> vitesse, mobile, securite (HTTPS), Core Web Vitals</li>
<li><strong>Signaux de comportement :</strong> taux de clic depuis Google, temps passe sur la page</li>
</ol>

<h4>Le cas particulier des "Featured Snippets" et SGE</h4>
<p>Google affiche desormais souvent des reponses directes en haut de page (encadres, listes, paragraphes mis en avant). En 2026 avec <strong>SGE</strong> (Search Generative Experience) et les reponses IA, etre cite par Google AI comme source devient un nouvel objectif strategique.</p>

<p>Le secret pour decrocher ces positions zero : redigez des reponses courtes (40-60 mots) directement sous votre H2 qui repondent &agrave; la question exacte de la requ&ecirc;te.</p>
"""},
            {'title': "Les 3 piliers du SEO : technique, contenu, autorite", 'duration': 18,
             'content_html': """
<p>Le SEO moderne repose sur trois piliers indissociables. Negliger l'un d'eux compromet tous les autres. Voici comment les comprendre et les equilibrer.</p>

<h4>Pilier 1 : le SEO technique (la fondation)</h4>
<p>Le SEO technique garantit que Google peut crawler, indexer et comprendre votre site. C'est invisible pour vos visiteurs mais critique pour les moteurs.</p>

<p>Les essentiels :</p>
<ul>
<li><strong>Vitesse :</strong> LCP &lt; 2,5s, FID &lt; 100ms, CLS &lt; 0,1 (Core Web Vitals)</li>
<li><strong>Mobile-first :</strong> votre site est-il parfaitement responsive ?</li>
<li><strong>HTTPS :</strong> certificat SSL obligatoire</li>
<li><strong>Sitemap.xml et robots.txt</strong> &agrave; jour</li>
<li><strong>Pas d'erreurs 404, redirects propres, canonical corrects</strong></li>
<li><strong>Schema.org</strong> (donnees structurees) sur les pages strategiques</li>
</ul>

<p>Si votre site charge en plus de 4 secondes sur mobile, vous perdez 53% des visiteurs avant qu'ils ne voient le contenu. Le meilleur contenu du monde ne servira &agrave; rien si votre site est lent ou cass&eacute; techniquement.</p>

<h4>Pilier 2 : le contenu (la valeur)</h4>
<p>Le contenu est la raison pour laquelle un internaute vient sur votre site. Sans contenu utile, Google n'a aucune raison de vous positionner.</p>

<p>Les regles d'or :</p>
<ul>
<li><strong>Repondez &agrave; une intention precise :</strong> chaque page = 1 requ&ecirc;te cible + ses variantes</li>
<li><strong>Profondeur :</strong> visez 1500-3000 mots pour les requ&ecirc;tes informationnelles concurrentielles</li>
<li><strong>Originalite :</strong> apportez une perspective, des donnees, des exemples uniques</li>
<li><strong>Structure :</strong> H1, H2, H3 hierarchises, paragraphes courts, listes, visuels</li>
<li><strong>Frais :</strong> mettez &agrave; jour vos articles populaires tous les 6-12 mois</li>
<li><strong>EEAT :</strong> Experience, Expertise, Authoritativeness, Trustworthiness (criteres Google 2026)</li>
</ul>

<p>Une regle simple : si votre article est meilleur que les 10 premiers resultats actuels pour la requ&ecirc;te ciblee, vous avez une chance reelle de les depasser.</p>

<h4>Pilier 3 : l'autorite (le off-page)</h4>
<p>L'autorite mesure la confiance que Google accorde &agrave; votre domaine. Elle se construit principalement via les <strong>backlinks</strong> : liens entrants depuis d'autres sites web reconnus.</p>

<p>Le principe : chaque backlink est un vote de confiance. Mais 10 backlinks de sites obscurs valent moins qu'1 backlink du Monde, de Forbes ou d'une universite.</p>

<p>Strategies legitimes pour acquerir des backlinks :</p>
<ul>
<li><strong>Guest posting :</strong> ecrire des articles sur d'autres blogs avec lien retour</li>
<li><strong>Linkable assets :</strong> creer des contenus tellement utiles qu'on vous cite naturellement (etudes, outils, infographies)</li>
<li><strong>PR digital :</strong> relations presse, citations dans des articles</li>
<li><strong>Partenariats :</strong> echanges avec partenaires de votre ecosysteme</li>
<li><strong>Citations locales :</strong> pour le SEO local, presence sur les annuaires de qualite</li>
</ul>

<p>A eviter absolument : achat de backlinks low-cost, PBN (Private Blog Networks), echanges de liens massifs. Google les detecte et penalise severement.</p>

<h4>L'equilibre des piliers</h4>
<p>Un site moyen alloue typiquement :</p>
<ul>
<li>20% du budget en SEO technique (audits, corrections, optimisations vitesse)</li>
<li>50% en contenu (creation, mise &agrave; jour, optimisation on-page)</li>
<li>30% en off-page (backlinks, PR digital, partenariats)</li>
</ul>

<p>Pour un nouveau site, inversez : 40% technique pendant les 3 premiers mois (vous batissez la fondation), puis 60% contenu, et enfin 30% off-page une fois que vous avez 30+ articles publies.</p>
"""},
            {'title': "SEO White Hat vs Black Hat : les pratiques &agrave; risque", 'duration': 16,
             'content_html': """
<p>Dans le monde du SEO, il existe deux ecoles : le <strong>White Hat</strong> (chapeau blanc, ethique) et le <strong>Black Hat</strong> (chapeau noir, manipulateur). Comprendre la difference vous evitera des desastres co&ucirc;teux.</p>

<h4>Le SEO White Hat : la voie durable</h4>
<p>Le White Hat respecte les <strong>guidelines Google Search Quality</strong>. Toutes les techniques visent &agrave; ameliorer reellement l'experience utilisateur. Resultats plus lents (3-12 mois) mais durables.</p>

<p>Exemples White Hat :</p>
<ul>
<li>Ecrire des contenus originaux de qualite</li>
<li>Optimiser la vitesse et l'experience mobile</li>
<li>Obtenir des backlinks par merite (linkable assets, PR)</li>
<li>Utiliser les donnees structurees correctement</li>
<li>Maillage interne logique et utile</li>
</ul>

<p>Un site White Hat resiste &agrave; tous les algorithmes Google (Panda, Penguin, Helpful Content Update, Core Updates). Il prospere annee apres annee.</p>

<h4>Le SEO Black Hat : la voie risquee</h4>
<p>Le Black Hat manipule les signaux de Google pour ranker sans meriter le positionnement. Resultats rapides (semaines) mais penalites quasi-certaines &agrave; terme.</p>

<p>Exemples Black Hat &agrave; eviter absolument :</p>
<ul>
<li><strong>Keyword stuffing :</strong> bourrer artificiellement les mots-cles dans le texte ("agence SEO agence SEO agence SEO Cotonou")</li>
<li><strong>Cloaking :</strong> montrer un contenu &agrave; Google et un autre aux humains</li>
<li><strong>PBN (Private Blog Networks) :</strong> reseaux de faux blogs pour fabriquer des backlinks</li>
<li><strong>Achat de backlinks low-cost :</strong> Fiverr, sites russes/indiens &agrave; 50&euro; les 1000 liens</li>
<li><strong>Contenu duplique massif :</strong> spinner / re-ecrire du contenu d'autres sites</li>
<li><strong>Doorway pages :</strong> pages de spam pour rediriger vers le vrai site</li>
<li><strong>Liens cach&eacute;s (CSS hidden) :</strong> liens invisibles aux humains mais visibles au bot</li>
</ul>

<h4>Les penalites Google</h4>
<p>Google detecte les Black Hat de deux fa&ccedil;ons :</p>
<ol>
<li><strong>Algorithmiques :</strong> chaque Core Update penalise automatiquement les sites manipulateurs</li>
<li><strong>Manuelles :</strong> un quality rater humain analyse votre site et applique une action manuelle dans Search Console</li>
</ol>

<p>Les penalites se traduisent par :</p>
<ul>
<li>Chute de 50 &agrave; 90% du trafic organique en quelques jours</li>
<li>Desindexation totale dans les cas extr&ecirc;mes</li>
<li>Temps de recuperation : 6 mois &agrave; 2 ans, voire jamais</li>
</ul>

<h4>Le Grey Hat : la zone grise</h4>
<p>Entre les deux, le Grey Hat utilise des techniques aux marges des guidelines. Risque modere. Exemples :</p>
<ul>
<li>Echanges de backlinks moderes entre sites partenaires</li>
<li>Achat de domaines expir&eacute;s avec backlinks pour rediriger 301</li>
<li>Contenu IA edite mais sans verification humaine approfondie</li>
</ul>

<p>Le Grey Hat fonctionne... jusqu'au prochain Core Update qui fait souvent disparaitre ces gains. Notre recommandation : 100% White Hat. Un site qui dure 10 ans vaut bien mieux qu'un site qui ranke 6 mois puis disparait.</p>

<h4>Le cas particulier des IA</h4>
<p>Le contenu genere &agrave; 100% par IA sans revision humaine est consider&eacute; comme contenu de faible qualite par Google. Mais l'IA <strong>assistee</strong> (brief humain &rarr; draft IA &rarr; relecture/correction humaine) est totalement acceptable. La distinction n'est pas l'outil mais l'investissement editorial.</p>
"""},
            {'title': "Mythes et realites du SEO en 2026", 'duration': 16,
             'content_html': """
<p>Le SEO est un domaine ou circulent enormement d'idees re&ccedil;ues. Voici les mythes les plus tenaces, dementi par les faits.</p>

<h4>Mythe 1 : "Le SEO est mort &agrave; cause de ChatGPT"</h4>
<p><strong>Faux.</strong> Le trafic SEO mondial a augmente de 12% en 2025 vs 2024. Google conserve 92% des parts de marche moteur. Les Search Generative Experiences (SGE) integrent les LLMs <em>au-dessus</em> des resultats classiques, mais ne les remplacent pas. Et 60% des clics se font toujours sur les resultats organiques traditionnels en 2026.</p>

<p>Ce qui change : la longue traine "facile" disparait au profit des AI Overviews. Strategie 2026 : viser les requ&ecirc;tes &agrave; forte intention commerciale (acheter, comparer, choisir) que l'IA ne resout pas directement.</p>

<h4>Mythe 2 : "Plus la page est longue, mieux elle ranke"</h4>
<p><strong>Faux.</strong> La longueur optimale depend de l'intention de recherche. Une recette de cuisine n'a pas besoin de 3000 mots. Une page produit e-commerce ranke souvent &agrave; 250-400 mots. Un guide expert necessite 2000-4000 mots.</p>

<p>Regle pratique : analysez les 10 premieres positions actuelles pour votre requ&ecirc;te. La moyenne de longueur indique le format que Google considere comme la bonne reponse.</p>

<h4>Mythe 3 : "Il faut publier tous les jours pour ranker"</h4>
<p><strong>Faux.</strong> Qualite &gt; frequence. Un site avec 30 articles &eacute;piques bat un site avec 200 articles mediocres. Privilegiez 4-8 articles approfondis par mois plut&ocirc;t que 30 articles de surface.</p>

<p>Cela dit, la consistance compte : publier 4 articles mensuels pendant 24 mois est plus impactant que 50 articles en 1 mois puis rien pendant 23 mois.</p>

<h4>Mythe 4 : "Le SEO local n'a besoin que de Google Business Profile"</h4>
<p><strong>Faux.</strong> GBP est indispensable mais insuffisant. Le SEO local performant combine :</p>
<ul>
<li>Fiche Google Business Profile optimisee (100% remplie, photos, posts hebdomadaires)</li>
<li>Citations NAP (Name, Address, Phone) coherentes sur 20+ annuaires</li>
<li>30+ avis Google authentiques avec reponses du proprietaire</li>
<li>Pages locales sur le site (1 par ville/quartier majeur)</li>
<li>Backlinks locaux (chambre de commerce, partenaires locaux, presse locale)</li>
</ul>

<h4>Mythe 5 : "Les mots-cles meta keywords sont importants"</h4>
<p><strong>Faux.</strong> Google ignore la balise meta keywords depuis 2009. C'est de l'effort gaspille. Les meta tags qui comptent en 2026 : <code>title</code>, <code>description</code>, <code>robots</code>, <code>canonical</code>, et les <code>OpenGraph</code> pour le partage social.</p>

<h4>Mythe 6 : "Il faut soumettre son site &agrave; 1000 annuaires"</h4>
<p><strong>Faux.</strong> Cette technique des annees 2000 est aujourd'hui contre-productive. La plupart des annuaires sont consider&eacute;s comme spam. Privilegiez 10-20 annuaires de tres haute qualite, alignes avec votre secteur et votre geographie.</p>

<h4>Mythe 7 : "Plus de mots-cles dans le titre = meilleur ranking"</h4>
<p><strong>Faux.</strong> Le keyword stuffing dans les titres declenche des penalites. Un bon titre contient le mot-cle principal une fois, naturellement, dans les 60 premiers caracteres. Exemple : "Comment optimiser son site WordPress en 2026 | Pirabel Labs" plut&ocirc;t que "Optimiser WordPress optimisation WordPress site WordPress 2026".</p>

<h4>Mythe 8 : "Le SEO est gratuit"</h4>
<p><strong>Faux.</strong> Le SEO n'est pas gratuit. Il necessite du temps (votre cout opportunite), des outils (Google Search Console gratuit + Ahrefs/Semrush payants), du contenu (interne ou externalise), et souvent un expert. Budget realiste : 1500&euro;/mois minimum pour une PME, 5000-15000&euro;/mois pour un site &agrave; fort trafic.</p>

<p>Mais le SEO bien gere a le meilleur ROI long terme de tous les canaux digitaux. C'est un investissement, pas une depense.</p>
"""}
        ]
    },

    {
        'title': 'Recherche de mots-cles : la fondation strategique',
        'objective': "Apprendre &agrave; identifier les mots-cles qui generent du trafic qualifie et &agrave; construire une cartographie de mots-cles alignee avec votre business.",
        'duration': 100,
        'lessons': [
            {'title': "Pourquoi la recherche de mots-cles est la fondation de tout SEO", 'duration': 18,
             'content_html': """
<p>Avant de rediger une seule ligne de contenu, vous devez savoir ce que cherchent vos prospects sur Google. Sans recherche de mots-cles serieuse, vous ecrivez dans le vide. Vous produisez du contenu qui interesse peut-etre vous, mais que personne ne tape jamais dans Google.</p>

<h4>Le pire scenario : 6 mois de travail pour zero trafic</h4>
<p>Un cas reel rencontre regulierement : une agence publie 30 articles de blog en 6 mois. Resultat ? 47 visiteurs SEO/mois cumules. Pourquoi ? Aucun de ces articles ne cible une requ&ecirc;te reellement recherchee. Ils traitent de sujets que l'agence trouvait interessants, sans verifier le volume de recherche.</p>

<p>La recherche de mots-cles evite ce piege. Elle vous dit :</p>
<ul>
<li><strong>Combien de personnes</strong> tapent telle requ&ecirc;te chaque mois</li>
<li><strong>Quel est leur intention</strong> (informationnelle, commerciale, transactionnelle, navigationnelle)</li>
<li><strong>Quelle est la concurrence</strong> sur cette requ&ecirc;te</li>
<li><strong>Quels mots-cles connexes</strong> chercher en m&ecirc;me temps</li>
</ul>

<h4>Volumes de recherche : la base</h4>
<p>Le volume de recherche mensuel (monthly search volume, MSV) est la m&eacute;trique de base. Quelques reperes :</p>
<table>
<tr><th>Volume mensuel</th><th>Classification</th><th>Strategie</th></tr>
<tr><td>0-100</td><td>Tres faible</td><td>A eviter sauf si tres haute valeur (B2B niche)</td></tr>
<tr><td>100-1000</td><td>Faible</td><td>Ideale pour debuter / longue traine</td></tr>
<tr><td>1000-10000</td><td>Moyenne</td><td>Coeur de strategie SEO PME</td></tr>
<tr><td>10000-100000</td><td>Elevee</td><td>Tres concurrentiel, 12+ mois pour ranker</td></tr>
<tr><td>100000+</td><td>Massive</td><td>Reserve aux grosses marques etablies</td></tr>
</table>

<h4>Volume ne fait pas tout : l'intention de recherche</h4>
<p>Une requ&ecirc;te &agrave; 10000 recherches/mois peut etre inutile si l'intention ne correspond pas &agrave; votre offre. Exemple : "agence SEO" (40k recherches/mois) attire des freelances qui cherchent du travail, pas des clients potentiels.</p>

<p>Mieux vaut viser "agence SEO Cotonou tarifs" (250 recherches/mois) ou l'intention transactionnelle est claire : ce visiteur est en phase d'achat.</p>

<h4>La regle des 80/20 en mots-cles</h4>
<p>80% du trafic vient de 20% des mots-cles. Mais aussi : 80% du chiffre d'affaires vient souvent de 20% (parfois 5%) des requ&ecirc;tes. Identifiez ces requ&ecirc;tes high-value et concentrez 60% de votre effort dessus.</p>

<h4>L'erreur des debutants</h4>
<p>Cibler uniquement les mots-cles avec gros volumes. Resultat : on tente "agence SEO" sur un blog de 6 mois face &agrave; des sites etablis depuis 10 ans. Aucune chance de ranker.</p>

<p>Strategie gagnante : commencer par la <strong>longue traine</strong>. Des requ&ecirc;tes precises (4+ mots) avec petits volumes (50-500/mois) mais faible concurrence. Vous y rankez vite (1-3 mois), gagnez du trafic et de l'autorite, puis montez progressivement vers des requ&ecirc;tes plus competitives.</p>
"""},
            {'title': "Types de mots-cles : informationnel, commercial, transactionnel", 'duration': 18,
             'content_html': """
<p>Tous les mots-cles ne sont pas egaux. Comprendre leur intention vous permet de creer le bon type de contenu pour chacun, et de structurer votre funnel d'acquisition.</p>

<h4>1. Mots-cles informationnels (haut de funnel)</h4>
<p>L'internaute cherche &agrave; <strong>apprendre</strong>. Il n'est pas pr&ecirc;t &agrave; acheter.</p>

<p>Exemples :</p>
<ul>
<li>"comment faire du SEO"</li>
<li>"qu'est-ce que le marketing digital"</li>
<li>"definition CRM"</li>
<li>"tutoriel WordPress debutant"</li>
</ul>

<p><strong>Format ideal :</strong> articles de blog, guides longs (2000-4000 mots), videos explicatives, infographies.</p>
<p><strong>Objectif :</strong> attirer du trafic, gagner de l'autorite, capturer des emails via lead magnets. Conversion directe rare.</p>

<h4>2. Mots-cles de navigation (milieu de funnel)</h4>
<p>L'internaute connait dej&agrave; un produit ou une marque et cherche le site officiel.</p>

<p>Exemples :</p>
<ul>
<li>"hubspot CRM"</li>
<li>"Pirabel Labs blog"</li>
<li>"login Shopify"</li>
</ul>

<p><strong>Format ideal :</strong> pages institutionnelles, login pages, pages "&Agrave; propos".</p>
<p><strong>Objectif :</strong> assurer que votre marque est trouvable. Difficile de ranker sur les marques d'autres sauf si vous offrez une alternative ou comparaison.</p>

<h4>3. Mots-cles commerciaux d'investigation (milieu/bas de funnel)</h4>
<p>L'internaute est en phase de recherche active pour acheter. Il compare, evalue, lit des avis.</p>

<p>Exemples :</p>
<ul>
<li>"meilleur CRM pour PME 2026"</li>
<li>"comparatif WordPress vs Shopify"</li>
<li>"avis HubSpot"</li>
<li>"agence SEO Cotonou comparatif"</li>
<li>"X vs Y"</li>
</ul>

<p><strong>Format ideal :</strong> comparatifs detailles, listes "best of", avis structures, cas clients.</p>
<p><strong>Objectif :</strong> capturer un trafic &agrave; tres forte intention d'achat. Taux de conversion 5-15% sur ce type de contenu si bien fait.</p>

<h4>4. Mots-cles transactionnels (bas de funnel)</h4>
<p>L'internaute veut acheter MAINTENANT. C'est le graal du SEO.</p>

<p>Exemples :</p>
<ul>
<li>"acheter site WordPress sur mesure"</li>
<li>"agence SEO Cotonou tarifs"</li>
<li>"devis creation site e-commerce"</li>
<li>"creer compte Shopify"</li>
<li>"telecharger app X"</li>
</ul>

<p><strong>Format ideal :</strong> landing pages produit/service, pages tarifs, pages contact/devis.</p>
<p><strong>Objectif :</strong> conversion directe. Taux 10-30% sur du trafic bien qualifie.</p>

<h4>Repartition strategique du contenu</h4>
<p>Une strategie SEO equilibree distribue le contenu sur les 4 types :</p>
<ul>
<li><strong>60% informationnel</strong> (gros volumes, construction d'autorite, top of funnel)</li>
<li><strong>20% commercial</strong> (comparatifs, listes, avis - middle of funnel)</li>
<li><strong>15% transactionnel</strong> (pages produit/service - bottom of funnel)</li>
<li><strong>5% navigationnel</strong> (about, contact, login - utilite operationnelle)</li>
</ul>

<h4>Detecter l'intention : les indices</h4>
<p>Tapez la requ&ecirc;te dans Google et observez les SERP (Search Engine Results Pages) :</p>
<ul>
<li><strong>Resultats Google Shopping ?</strong> &rarr; transactionnel</li>
<li><strong>Featured snippet en haut ?</strong> &rarr; informationnel</li>
<li><strong>Articles "best of", "top 10" ?</strong> &rarr; commercial</li>
<li><strong>Resultats institutionnels (Wikipedia, .gov) ?</strong> &rarr; informationnel/educatif</li>
<li><strong>Pack local Maps ?</strong> &rarr; intention locale + transactionnelle</li>
</ul>

<p>Google interprete l'intention de chaque requ&ecirc;te avec son IA depuis 2019 (RankBrain) puis BERT, MUM en 2024. Aligner votre contenu sur l'intention reelle est devenu non-negociable.</p>

<h4>Le piege classique : viser le mauvais type</h4>
<p>Erreur frequente : creer une page produit pour "comment choisir un CRM" (intention informationnelle). Vous ne rankerez jamais : Google montrera des guides, pas des pages commerciales. Solution : creez d'abord un guide complet "comment choisir un CRM en 10 etapes", positionnez votre produit en exemple naturel, capturez l'email du lecteur, puis nurturez-le vers une conversion.</p>
"""},
            {'title': "Outils gratuits et payants pour trouver vos mots-cles", 'duration': 22,
             'content_html': """
<p>Vous n'avez pas besoin de Semrush &agrave; 450&euro;/mois pour faire une bonne recherche de mots-cles. Voici l'arsenal pour debuter, puis monter en gamme.</p>

<h4>Outils 100% gratuits</h4>

<p><strong>1. Google Search Console (indispensable)</strong></p>
<p>Donnees reelles de votre site : sur quelles requ&ecirc;tes vous apparaissez, combien d'impressions, de clics, votre position moyenne. C'est l'outil n&deg;1, et il est gratuit.</p>
<p>Onglet "Performance" &rarr; "Requ&ecirc;tes" : decouvrez des opportunites cachees (pages qui rankent en 11-20e position et qu'on peut booster facilement vers la top 10).</p>

<p><strong>2. Google Keyword Planner (compte Google Ads requis)</strong></p>
<p>Acces aux volumes de recherche approximatifs et suggestions de mots-cles. Gratuit, mais avec compte Google Ads actif (pas obligatoire de payer pour avoir le compte).</p>
<p>Limite : volumes en "fourchettes" (1k-10k) sans precision. Pour avoir les vrais chiffres, faut payer.</p>

<p><strong>3. Google Trends</strong></p>
<p>Tendances de recherche sur 5 ans, comparaisons geographiques, saisonnalite. Excellent pour comprendre l'evolution d'un sujet et anticiper les pics saisonniers.</p>

<p><strong>4. AnswerThePublic (3 recherches/jour gratuites)</strong></p>
<p>Visualise toutes les questions que les gens posent autour d'un mot-cle. Ideal pour structurer un guide complet ou trouver des sujets de blog.</p>

<p><strong>5. AlsoAsked.com (gratuit jusqu'&agrave; certaines limites)</strong></p>
<p>Cartographie les "People Also Ask" de Google. Excellent pour identifier les sous-thematiques d'un sujet.</p>

<p><strong>6. Keyword Surfer (extension Chrome gratuite)</strong></p>
<p>Affiche les volumes de recherche directement dans Google. Idees connexes en sidebar. Limite mais utile en debut de strategie.</p>

<h4>Outils freemium (gratuits avec limites)</h4>

<p><strong>7. Ubersuggest (Neil Patel)</strong></p>
<p>3 recherches/jour gratuites. Volumes, difficulte, idees connexes, backlinks de la concurrence. Plan paye &agrave; 30&euro;/mois pour 1 site, suffisant pour PME.</p>

<p><strong>8. SE Ranking</strong></p>
<p>Essai gratuit 14 jours. Excellent rapport qualite/prix &agrave; 49&euro;/mois (vs 100+&euro; pour Ahrefs). Audit SEO, rank tracking, recherche mots-cles, analyse concurrents.</p>

<h4>Outils premium (300-500&euro;/mois)</h4>

<p><strong>9. Ahrefs (le plus puissant)</strong></p>
<p>129-1499&euro;/mois. Database de 22 milliards de mots-cles, crawl du web le plus complet apres Google. Indispensable pour les agences SEO et grands sites.</p>
<p>Fonctionnalites cles : Site Explorer (analyse concurrent), Keyword Explorer (recherche + difficulte), Content Explorer (trouver les meilleurs contenus sur un sujet), Backlink Analysis.</p>

<p><strong>10. Semrush (alternative &agrave; Ahrefs)</strong></p>
<p>139-499&euro;/mois. Concurrent direct d'Ahrefs. Plus oriente marketing global (SEO + PPC + Social). Excellent pour les equipes marketing complete.</p>

<h4>Outils specialises</h4>

<p><strong>11. Surfer SEO (89-179&euro;/mois)</strong></p>
<p>Optimisation on-page basee sur l'analyse des 10 premieres pages Google pour votre requ&ecirc;te. Vous dit exactement combien de mots, de H2, de mots-cles secondaires utiliser.</p>

<p><strong>12. Frase (45-115&euro;/mois)</strong></p>
<p>Recherche de mots-cles + brief IA + optimisation contenu. Plus economique que Surfer pour des fonctionnalites similaires.</p>

<p><strong>13. Keyword Tool (89-199&euro;/mois)</strong></p>
<p>Specialise dans les suggestions de mots-cles depuis Google Autocomplete, YouTube, Amazon, App Store, Bing. Pour ceux qui veulent depasser Google.</p>

<h4>Strategie outils par taille d'entreprise</h4>

<p><strong>Solo entrepreneur / freelance :</strong> Google Search Console + Google Trends + Ubersuggest (30&euro;/mois) = couvre 90% des besoins.</p>

<p><strong>PME (10-50 employes) :</strong> Ajoutez SE Ranking (49&euro;/mois) ou Mangools (39&euro;/mois). Total budget : ~80-100&euro;/mois.</p>

<p><strong>Scale-up / agence :</strong> Ahrefs (199&euro;/mois) + Surfer SEO (89&euro;/mois) = 288&euro;/mois indispensables.</p>

<p><strong>Grosse marque / e-commerce 1000+ produits :</strong> Ahrefs Advanced + Semrush Business + Screaming Frog SEO Spider + DeepCrawl. Budget 1000+&euro;/mois.</p>

<h4>Le piege de l'outil-itis</h4>
<p>Beaucoup de debutants s'abonnent &agrave; 5 outils SEO et utilisent 10% des fonctionnalites. Demarrez avec 1 outil paye + les gratuits. Maitrisez-le avant d'en ajouter d'autres. 90% des gains SEO viennent de l'execution, pas des outils.</p>
"""},
            {'title': "Analyser la concurrence et la difficulte d'une requ&ecirc;te", 'duration': 20,
             'content_html': """
<p>Trouver des mots-cles avec gros volumes est facile. Identifier ceux ou vous avez une chance reelle de ranker dans les 6-12 prochains mois est l'art veritable du SEO. Voici comment evaluer la difficulte d'une requ&ecirc;te.</p>

<h4>Le Keyword Difficulty Score (KD)</h4>
<p>Tous les outils SEO calculent un score de difficulte, generalement sur une echelle 0-100. Approximations :</p>
<table>
<tr><th>Score KD</th><th>Difficulte</th><th>Domaine ideal pour ranker</th></tr>
<tr><td>0-15</td><td>Tres facile</td><td>Nouveau site (3-6 mois)</td></tr>
<tr><td>15-30</td><td>Facile</td><td>Site avec DR 20-30 (6-12 mois)</td></tr>
<tr><td>30-50</td><td>Moyenne</td><td>Site avec DR 30-50 (12-18 mois)</td></tr>
<tr><td>50-70</td><td>Difficile</td><td>Site avec DR 50+ (18-24 mois)</td></tr>
<tr><td>70-100</td><td>Tres difficile</td><td>Marques etablies uniquement (24+ mois)</td></tr>
</table>

<p>DR = Domain Rating Ahrefs (similaire DA Moz, AS Semrush) = autorite globale de votre domaine sur 100.</p>

<h4>Analyse manuelle de la SERP (la methode pro)</h4>
<p>Le KD automatique est une approximation. Pour une analyse precise, etudiez manuellement les 10 premieres positions sur Google :</p>

<p><strong>Etape 1 : verifiez les types de sites qui rankent</strong></p>
<ul>
<li><strong>Sites institutionnels (Wikipedia, gov, edu)</strong> &rarr; quasi-impossible &agrave; depasser</li>
<li><strong>Marques majeures (Forbes, Amazon, HubSpot)</strong> &rarr; tres difficile</li>
<li><strong>Sites specialises (vs gen&eacute;ralistes)</strong> &rarr; opportunite si vous etes plus specialise</li>
<li><strong>Petits blogs / sites recents</strong> &rarr; bonne opportunite</li>
</ul>

<p><strong>Etape 2 : analysez la qualite du contenu</strong></p>
<p>Cliquez sur les 5 premiers resultats. Demandez-vous :</p>
<ul>
<li>Le contenu est-il vraiment excellent ? Long, structure, exemples, visuels ?</li>
<li>Ou bien superficiel (500 mots, peu structure, datant de 2020) ?</li>
<li>Y a-t-il des contenus que vous pourriez clairement battre ?</li>
</ul>

<p>Si vous pouvez creer mieux que les 10 premiers (plus complet, plus &agrave; jour, mieux structure, avec des donnees uniques), vous avez une chance. Sinon, changez de cible.</p>

<p><strong>Etape 3 : verifiez les backlinks de la concurrence</strong></p>
<p>Dans Ahrefs / Semrush / Ubersuggest, analysez les backlinks des 3 premiers resultats. Combien de domaines referents (RD) chacun a-t-il ?</p>
<ul>
<li>Si les top 3 ont 100+ RD : tres difficile</li>
<li>Si les top 3 ont 10-30 RD : possible avec un bon contenu et 6 mois de travail</li>
<li>Si les top 3 ont &lt; 10 RD : opportunite forte</li>
</ul>

<h4>Le facteur "User intent match"</h4>
<p>Au-del&agrave; de la difficulte technique, evaluez si VOUS pouvez vraiment satisfaire l'intention de l'utilisateur. Exemple : pour "comment choisir un CRM", attendez-vous &agrave; produire un comparatif avec 8-12 CRM evalues objectivement. Si vous ne pouvez offrir que votre propre CRM, vous echouez l'intention.</p>

<h4>Les fameux "gaps" d'opportunite</h4>
<p>Cherchez les requ&ecirc;tes ou :</p>
<ul>
<li>Le volume est correct (500-3000/mois)</li>
<li>La concurrence est moyenne (KD 25-45)</li>
<li>Les top 10 actuels ont 2-3 ans, sont depasses</li>
<li>Aucun contenu vraiment complet n'existe</li>
<li>Vous avez une expertise reelle &agrave; partager</li>
</ul>

<p>Ces gaps sont des mines d'or. En agence, on les decouvre via une analyse "topic gap" : on compare 3 concurrents principaux et on identifie les requ&ecirc;tes ou aucun ne ranke encore correctement.</p>

<h4>Cas pratique : SEO Cotonou Benin</h4>
<p>Pour "agence SEO Cotonou" (volume estime 250/mois, KD 18) :</p>
<ul>
<li>Top 10 actuels : 3 sites generalistes (top 3 places), 2 sites tres anciens datant de 2019, 5 sites avec moins de 5 RD chacun</li>
<li>Aucun contenu vraiment "guide complet pour choisir une agence SEO &agrave; Cotonou"</li>
<li>Diagnostic : opportunite forte. Un contenu 2500+ mots, &agrave; jour, avec 10+ criteres de selection, comparatif local, et 5-10 backlinks locaux peut ranker en top 3 sous 6-9 mois.</li>
</ul>

<h4>Erreurs typiques</h4>
<ul>
<li>Croire le KD aveuglement sans verifier la SERP manuellement</li>
<li>Cibler "agence SEO Paris" (KD 65) depuis Cotonou : suicide strategique</li>
<li>Ignorer les "search results features" (Featured Snippets, Local Pack, Video Carousels) qui reduisent les clics organiques traditionnels</li>
<li>Ne pas evaluer si l'intention de la requ&ecirc;te correspond &agrave; votre offre</li>
</ul>
"""},
            {'title': "Cartographier votre strategie de mots-cles (keyword mapping)", 'duration': 22,
             'content_html': """
<p>Une fois vos mots-cles identifies et evalues, l'etape critique : les organiser en strategie coherente. C'est le <strong>keyword mapping</strong>. Sans cette etape, vous risquez le pire pi&egrave;ge SEO : le <em>keyword cannibalization</em> ou plusieurs pages de votre site se concurrencent sur les m&ecirc;mes mots-cles.</p>

<h4>Principe : 1 page = 1 mot-cle principal + ses variantes</h4>
<p>Chaque page de votre site doit cibler 1 mot-cle principal unique et ses variations naturelles. Exemple :</p>
<ul>
<li>Page A cible "agence SEO Cotonou" + "agence referencement Cotonou" + "consultant SEO Cotonou"</li>
<li>Page B cible "agence SEO Abomey-Calavi" + ses variantes</li>
<li>Page C cible "tarifs SEO Benin" + variantes</li>
</ul>

<p>Jamais deux pages sur la m&ecirc;me requ&ecirc;te exacte. Google se demande laquelle ranker et finit par n'en ranker aucune correctement.</p>

<h4>La structure pillar-cluster (recommandee)</h4>
<p>Methodologie HubSpot devenue standard : organisez vos pages autour de <strong>pages piliers</strong> et de <strong>clusters thematiques</strong>.</p>

<p><strong>Page pilier :</strong> contenu long (3000+ mots) sur un sujet large. Exemple : "Guide complet SEO 2026"</p>
<p><strong>Clusters :</strong> 8-15 articles plus pointus qui approfondissent des sous-aspects et linkent tous vers la page pilier.</p>
<ul>
<li>Article cluster 1 : "Audit SEO technique : checklist 2026"</li>
<li>Article cluster 2 : "Recherche de mots-cles : methodologie complete"</li>
<li>Article cluster 3 : "Backlinks : strategies legitimes 2026"</li>
<li>... etc</li>
</ul>

<p>Chaque cluster linke vers la page pilier (signal d'autorite interne). La page pilier linke vers chaque cluster. Cette structure renforce massivement le SEO du sujet entier.</p>

<h4>Construire votre keyword map (template)</h4>
<p>Creez un Google Sheet ou Notion avec les colonnes :</p>
<table>
<tr><th>Mot-cle</th><th>Volume</th><th>KD</th><th>Intention</th><th>URL cible</th><th>Statut</th><th>Position actuelle</th></tr>
<tr><td>agence SEO Cotonou</td><td>250</td><td>18</td><td>Transactionnel</td><td>/agence-seo/cotonou</td><td>Live</td><td>4</td></tr>
<tr><td>tarifs SEO Cotonou</td><td>90</td><td>12</td><td>Transactionnel</td><td>/agence-seo/cotonou/tarifs</td><td>&Agrave; creer</td><td>N/A</td></tr>
<tr><td>comment choisir agence SEO</td><td>320</td><td>22</td><td>Commercial</td><td>/guides/choisir-agence-seo</td><td>En cours</td><td>15</td></tr>
</table>

<h4>L'audit anti-cannibalisation</h4>
<p>Pour les sites existants, identifiez les cannibalisations en cours :</p>

<p><strong>Methode 1 : recherche manuelle</strong></p>
<p>Tapez <code>site:votresite.com "votre requ&ecirc;te cible"</code> dans Google. Si plusieurs pages s'affichent, vous avez possiblement une cannibalisation.</p>

<p><strong>Methode 2 : Search Console</strong></p>
<p>Onglet Performance &rarr; filtrez par requ&ecirc;te &rarr; cliquez "Pages". Si plusieurs URLs apparaissent en alternance sur la m&ecirc;me requ&ecirc;te, c'est de la cannibalisation.</p>

<p><strong>Methode 3 : outils dedies</strong></p>
<p>Ahrefs Site Audit, Semrush Position Tracking, ou Screaming Frog ont des rapports de cannibalisation automatises.</p>

<h4>Resoudre une cannibalisation</h4>
<ol>
<li><strong>Identifiez la page la plus forte</strong> (backlinks, anciennete, qualite contenu)</li>
<li><strong>Fusionnez le contenu</strong> des autres pages dans cette page principale</li>
<li><strong>Redirigez les autres URLs en 301</strong> vers la page principale</li>
<li><strong>Mettez &agrave; jour les liens internes</strong> qui pointaient vers les anciennes URLs</li>
<li><strong>Soumettez la page renforcee &agrave; Google</strong> via Search Console pour re-indexation</li>
</ol>

<h4>Le cas particulier du SEO local multi-villes</h4>
<p>Si vous avez des pages par ville (Cotonou, Calavi, Porto-Novo, Parakou...), assurez-vous que chacune cible une requ&ecirc;te geo-specifique <strong>different</strong> :</p>
<ul>
<li>/agence-seo/cotonou cible "agence SEO Cotonou"</li>
<li>/agence-seo/calavi cible "agence SEO Abomey-Calavi" (PAS "agence SEO Cotonou")</li>
</ul>

<p>Chaque page doit avoir 70%+ de contenu unique &agrave; la ville (entreprises locales mentionnees, quartiers, partenaires, etudes de cas locales). Sinon Google les considere comme du contenu duplique et n'en ranke qu'une seule.</p>

<h4>Outils pour le keyword mapping</h4>
<ul>
<li><strong>Google Sheets / Excel :</strong> gratuit, suffisant pour 200-500 mots-cles</li>
<li><strong>Airtable :</strong> meilleur pour gros volumes (1000+), avec vues filtrables</li>
<li><strong>Notion :</strong> excellent pour collaborer en equipe</li>
<li><strong>Surfer Topical Map :</strong> genere automatiquement des cartes de mots-cles thematiques</li>
<li><strong>MarketMuse :</strong> outil specialise (mais cher, 250&euro;+/mois)</li>
</ul>

<h4>Rythme de publication aligne sur la strategie</h4>
<p>Si vous identifiez 50 mots-cles strategiques, ne publiez pas tout en 1 mois. Etalez sur 6-12 mois :</p>
<ul>
<li>Mois 1-2 : pages piliers principales (les sujets larges)</li>
<li>Mois 3-6 : 60% des clusters</li>
<li>Mois 7-12 : restants + mises &agrave; jour des piliers</li>
</ul>

<p>Cela permet &agrave; Google de digerer progressivement, &agrave; vous de mesurer ce qui marche, et d'optimiser la suite avec les enseignements des premiers mois.</p>
"""},
        ],
    },
    # Modules 3, 4, 5 - structure complete mais lessons en placeholder pour cette session
    {
        'title': 'SEO On-Page : optimiser chaque page de votre site',
        'objective': "Maitriser l'optimisation interne de chaque page : title, meta, URL, H1/H2/H3, contenu, images, maillage interne.",
        'duration': 90,
        'lessons': [
            {'title': "Title et meta description : votre vitrine sur Google", 'duration': 20,
             'content_html': "<p>En attendant, retenez les essentiels :</p><ul><li>Title : 50-60 caractères, mot-clé principal en début, marque à la fin</li><li>Description : 140-160 caractères, contient un CTA, complete (et n'imite pas) le title</li><li>1 title unique par page (jamais de duplication)</li><li>OG title + Twitter title peuvent différer du title HTML pour optimiser le partage social</li></ul>"},
            {'title': "Structure H1/H2/H3 et hierarchie semantique", 'duration': 18,
             'content_html': "<p>Règles clés :</p><ul><li>1 seul H1 par page, contenant le mot-clé principal</li><li>H2 pour les sections majeures, H3 pour les sous-sections</li><li>Jamais sauter de niveau (pas de H4 directement après un H2)</li><li>Chaque H2/H3 doit pouvoir être lu indépendamment et donner du sens</li></ul>"},
            {'title': "Optimisation du contenu (longueur, NLP, EEAT, intent)", 'duration': 22,
             'content_html': "<p>Points essentiels :</p><ul><li>Longueur optimale = moyenne des top 10 actuels +20%</li><li>EEAT : citer ses sources, biographie auteur, expertise prouvée</li><li>Originalité : data unique, opinion forte, perspective non couverte</li><li>Multimedia : images, vidéos, infographies augmentent le dwell time</li></ul>"},
            {'title': "Images SEO : alt, compression, lazy loading", 'duration': 15,
             'content_html': "<p><em>Leçon à enrichir : ~2000 mots sur l'optimisation des images (formats WebP/AVIF, dimensions explicites pour éviter le CLS, alt text descriptif, lazy loading, srcset responsive, image SEO ranking, Google Images comme source de trafic).</em></p><p>À retenir :</p><ul><li>Format moderne : WebP par défaut, AVIF pour les browsers compatibles</li><li>Alt text : description concrète de l'image (pas du keyword stuffing)</li><li>Dimensions explicites width/height pour éviter Cumulative Layout Shift</li><li>Lazy loading sur toutes les images sous le fold</li><li>Nom de fichier descriptif : agence-seo-cotonou-team.webp pas IMG-3847.jpg</li></ul>"},
            {'title': "Maillage interne strategique : la structure en piliers", 'duration': 15,
             'content_html': "<p>Principes clés :</p><ul><li>Chaque page accessible en max 3 clics depuis l'accueil</li><li>Anchor text descriptif (jamais 'cliquez ici')</li><li>Pages piliers reçoivent le plus de liens internes</li><li>Cluster pages linkent vers la page pilier de leur thématique</li><li>Audit régulier : Screaming Frog pour identifier les pages orphelines</li></ul>"},
        ],
    },
    {
        'title': "SEO Technique de base : les fondations qu'il faut maitriser",
        'objective': "Comprendre et mettre en place les bases techniques indispensables : sitemap, robots.txt, vitesse, mobile, schema.",
        'duration': 80,
        'lessons': [
            {'title': "Sitemap XML et robots.txt : guider Google", 'duration': 16,
             'content_html': "<ul><li>sitemap.xml liste TOUTES les URLs indexables</li><li>robots.txt = directives pour les bots (autoriser/bloquer)</li><li>Soumettre les 2 dans Google Search Console</li><li>Mettre à jour sitemap automatiquement à chaque publication</li></ul>"},
            {'title': "HTTPS, vitesse, Core Web Vitals : facteurs critiques", 'duration': 22,
             'content_html': "<ul><li>HTTPS obligatoire (Chrome marque les sites HTTP comme non sécurisés)</li><li>LCP cible : &lt; 2.5s (Largest Contentful Paint)</li><li>INP cible : &lt; 200ms (Interaction to Next Paint, remplace FID en 2024)</li><li>CLS cible : &lt; 0.1 (Cumulative Layout Shift)</li></ul>"},
            {'title': "Mobile-first indexing : votre site doit etre mobile-perfect", 'duration': 15,
             'content_html': "<ul><li>Google indexe la version mobile en priorité (depuis 2019)</li><li>Si votre version mobile est inférieure à la desktop, vous perdez en ranking</li><li>Test : https://search.google.com/test/mobile-friendly</li><li>Performance critique sur 3G/4G dans les pays émergents (Bénin)</li></ul>"},
            {'title': "Erreurs 404, redirects 301, canonical : eviter les pieges", 'duration': 14,
             'content_html': "<ul><li>404 occasionnels OK, 404 massives = pénalité</li><li>Redirect 301 = permanent, transfère le PageRank</li><li>Redirect 302 = temporaire, ne transfère pas</li><li>Canonical pointe vers la version 'officielle' d'un contenu</li></ul>"},
            {'title': "Schema.org pour debutants : enrichir vos resultats Google", 'duration': 13,
             'content_html': "<ul><li>Schema = données structurées qui aident Google à comprendre votre page</li><li>JSON-LD est le format recommandé (vs Microdata, RDFa)</li><li>FAQPage Schema = featured snippets avec questions/réponses</li><li>LocalBusiness Schema = pack local + Google Maps</li><li>Test : https://search.google.com/test/rich-results</li></ul>"},
        ],
    },
    {
        'title': "Construire l'autorite : SEO off-page et plan d'action",
        'objective': "Apprendre &agrave; obtenir des backlinks de qualite, dominer en local, mesurer ses resultats et batir un plan d'action 90 jours.",
        'duration': 95,
        'lessons': [
            {'title': "Backlinks : pourquoi et comment ils impactent votre ranking", 'duration': 20,
             'content_html': "<ul><li>Backlink = lien d'un autre site vers le vôtre</li><li>Vote de confiance qui transfère du PageRank</li><li>10 backlinks d'autorité &gt;&gt; 1000 backlinks low-quality</li><li>Variété d'anchor text essentielle (pas tous 'agence SEO Cotonou')</li></ul>"},
            {'title': "Strategies pour obtenir vos premiers 30 backlinks", 'duration': 22,
             'content_html': "<ul><li>Guest post : écrire 1 article/mois sur un blog complémentaire (lien retour)</li><li>Linkable assets : créer 1 contenu 'épique' (étude 50 pages, outil gratuit)</li><li>HARO (Help A Reporter Out) : journalistes cherchent des sources, vous répondez</li><li>Citations locales : Yelp, Google Business, Pages Jaunes, annuaires sectoriels</li></ul>"},
            {'title': "SEO local : dominer Google Business Profile et le pack local", 'duration': 20,
             'content_html': "<ul><li>Fiche GBP 100% remplie (catégories, services, photos, descriptions)</li><li>30+ avis Google authentiques avec réponses du propriétaire</li><li>NAP (Name, Address, Phone) IDENTIQUE sur tous les annuaires</li><li>Posts GBP hebdomadaires (nouvelles, offres, événements)</li><li>Photos ajoutées chaque semaine (+12% impressions en moyenne)</li></ul>"},
            {'title': "Mesurer ses progres : Google Search Console + Analytics", 'duration': 18,
             'content_html': "<ul><li>Search Console = données Google (impressions, position, clics)</li><li>GA4 = données comportement (sessions, conversion, attribution)</li><li>KPIs principaux : trafic SEO, ranking moyen top 100, conversions attribuées</li><li>Reporting mensuel : tableau standard + 3 insights clés</li><li>Dashboard Looker Studio gratuit avec template prêt à l'emploi</li></ul>"},
            {'title': "Plan d'action SEO 90 jours pour demarrer", 'duration': 15,
             'content_html': "<p><strong>Le plan en synthèse :</strong></p><ul><li><strong>Semaines 1-2 :</strong> Audit complet + setup tracking (GSC, GA4)</li><li><strong>Semaines 3-4 :</strong> Recherche mots-clés (50 cibles) + keyword mapping</li><li><strong>Semaines 5-8 :</strong> Optimisation on-page de 10 pages existantes + création 4 pages piliers</li><li><strong>Semaines 9-12 :</strong> Création 8 articles cluster + premières actions backlinks + mesure</li></ul><p>Resultats attendus à M+3 : +25-40% trafic organique sur les pages optimisées, premiers rankings sur 10-15 mots-clés longue traîne.</p>"},
        ],
    },
]
