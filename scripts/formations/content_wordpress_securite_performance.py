#!/usr/bin/env python3
"""Contenu detaille formation : WordPress Securite et Performance : Le Guide du Site Inviolable."""

WORDPRESS_SECURITE_PERFORMANCE_MODULES = [
    {
        'title': 'Bases et installation',
        'objective': "L'apprenant choisira la pile technique adaptee a son projet, securisera l'hebergement et installera WordPress avec une configuration durcie des le premier jour.",
        'duration': 180,
        'lessons': [
            {'title': "Choisir entre WordPress, Webflow, Shopify ou code custom",
             'duration': 22,
             'content_html': """<p>Choisir la mauvaise plateforme en 2026, c'est s'engager dans 18 mois de refonte premature. Pourtant 7 PME francophones sur 10 demarrent sur l'outil que leur a recommande un cousin, sans grille d'analyse. Cette lecon vous donne le cadre decisionnel utilise chez Pirabel Labs pour conseiller nos clients d'Abomey-Calavi a Dakar : un arbre a quatre branches, fonde sur le volume de transactions, le type de contenu, le niveau de personnalisation requis et la capacite interne a maintenir le systeme. A la fin, vous saurez justifier votre choix en cinq lignes face a un comite de direction.</p>

<h2>1. Le quadrant de decision plateforme</h2>
<p>Posez-vous deux questions avant tout: <strong>combien de transactions par mois</strong> et <strong>combien de pages editoriales par mois</strong>. Croisez les deux dans un quadrant. Au-dela de 200 commandes/mois et moins de 4 articles/mois, Shopify ou Shopify Plus s'imposent. En dessous de 50 commandes et au-dessus de 8 articles, WordPress + WooCommerce reste imbattable cote SEO. Webflow gagne quand l'animation et le rendu pixel-perfect priment sur la richesse fonctionnelle. Le code custom (Next.js, Astro, SvelteKit) se justifie seulement au-dela de 100 000 visites mensuelles ou pour des SaaS.</p>

<h2>2. Cout total de possession sur 36 mois</h2>
<p>L'erreur classique consiste a comparer les prix de licence. La realite financiere se joue sur le TCO 36 mois. Une boutique Shopify a 32 EUR/mois coute en realite 8 000 a 15 000 EUR sur trois ans avec les apps (Klaviyo, Judge.me, ReConvert), la theme premium et le pourcentage Shopify Payments. Un WordPress equivalent demande 200 EUR d'hebergement Kinsta managed, 300 EUR de licences plugins (Yoast Premium, WP Rocket, ACF Pro), et environ 4 heures/mois de maintenance facturees 60 EUR/h. Calculez avant de signer.</p>

<h2>3. Cas particulier du marche francophone africain</h2>
<p>Au Benin, en Cote d'Ivoire et au Senegal, les paiements mobile money (MTN MoMo, Orange Money, Wave) representent jusqu'a 78% des transactions e-commerce selon les chiffres GSMA 2025. Shopify n'integre toujours pas ces moyens de paiement nativement: il faut passer par des passerelles tierces comme PayDunya, FedaPay ou CinetPay, en mode redirect. WordPress + WooCommerce a l'avantage d'accepter des plugins officiels FedaPay, ce qui rend l'integration plus stable et le coupon de reduction local plus simple a programmer.</p>

<h2>4. Performance et SEO de depart</h2>
<p>Sur des sites vitrine de 30 pages, Webflow offre les meilleurs scores Lighthouse natifs (souvent 95+ sans optimisation). WordPress avec un theme bloated (Avada, Divi) part avec 45 a 55, et exige du tuning. Shopify se situe entre les deux. Mais ce qui compte vraiment, c'est la capacite a heberger des contenus longs et riches en silos thematiques: WordPress reste le champion incontestable de l'IA SEO et du content marketing structure.</p>

<h2>5. Capacite a internaliser la maintenance</h2>
<p>Sans une personne formee en interne, un WordPress non maintenu devient une bombe a retardement: 47% des piratages observes par WordFence en 2025 proviennent de plugins non mis a jour depuis plus de 6 mois. Shopify decharge la PME de toute responsabilite serveur et de la quasi-totalite des mises a jour. Pour un client beninois sans equipe IT, recommander Shopify est souvent un acte responsable, meme si la facture mensuelle est plus elevee.</p>

<h2>6. Grille de score finale (sur 20)</h2>
<ul>
<li><strong>Volume e-commerce</strong> (poids 5): 0 pts si < 20 cmd/mois, 5 pts si > 500</li>
<li><strong>Volume editorial</strong> (poids 4): 0 si < 2 articles/mois, 4 si > 12</li>
<li><strong>Budget mensuel</strong> (poids 3): 0 si < 50 EUR, 3 si > 500 EUR</li>
<li><strong>Maturite technique interne</strong> (poids 4): 0 si zero dev, 4 si dev full-time</li>
<li><strong>Besoin de design unique</strong> (poids 4): 0 si template suffit, 4 si pixel-perfect</li>
</ul>
<p>Score > 14: code custom. 10-14: WordPress. 6-10: Shopify. < 6: Webflow ou plateforme no-code.</p>

<h2>7. Erreurs frequentes a eviter</h2>
<p>Trois pieges recurrents observes en mission: (1) choisir Shopify pour un magazine d'opinion (mauvais pour le SEO long format), (2) choisir Webflow pour un e-commerce a 200 SKU (gestion catalogue trop limitee), (3) choisir un WordPress sans avoir prevu un budget maintenance annuel de 800 EUR minimum. Tout choix de plateforme implique d'accepter un cout cache que vous devez chiffrer avant le go.</p>

<h2>FAQ</h2>
<p><strong>Peut-on migrer plus tard?</strong> Oui mais comptez 4 000 a 12 000 EUR de refonte plus la perte SEO de 10 a 30 % les 3 premiers mois. Mieux vaut bien choisir au depart.</p>
<p><strong>Et Wix ou Squarespace?</strong> Acceptable pour des micro-sites vitrine, jamais pour un projet commercial serieux: limitations SEO et impossibilite de migrer proprement.</p>
<p><strong>Headless WordPress, c'est pour qui?</strong> Pour des equipes de developpeurs Next.js a l'aise avec une infra decoupee, au-dela de 50 000 visites/mois. Au demarrage, le headless ajoute de la complexite sans benefice tangible.</p>

<p>Pour une analyse personnalisee de votre projet, prenez un <a href="/contact">audit gratuit</a> avec nos consultants Pirabel Labs ou planifiez un <a href="/rendez-vous">rendez-vous strategique</a>. Nous comparons les options chiffrees sur 36 mois et vous remettons une recommandation ecrite.</p>"""},

            {'title': "Acheter un nom de domaine et configurer l'hebergement",
             'duration': 20,
             'content_html': """<p>Le nom de domaine et l'hebergeur sont les deux briques que vous payez en cash avant meme d'ecrire une ligne de code. Une mauvaise decision ici se paie pendant des annees: lenteur chronique, support inexistant, migrations couteuses. Cette lecon vous donne le protocole d'achat utilise par notre agence pour ses clients, avec les fournisseurs valides en 2026 et les pieges juridiques specifiques au marche francophone, notamment l'enregistrement des .bj, .ci, .sn et .ma.</p>

<h2>1. Choisir le nom de domaine: la regle des 4S</h2>
<p>Un bon domaine est <strong>Short, Simple, Speakable, Searchable</strong>. Maximum 12 caracteres, pas de chiffres, pas de tirets, prononcable au telephone sans epeler, et contenant idealement votre mot-cle de marque. En 2026, les extensions .com, .fr et .africa restent les plus credibles. Le .io perd du terrain et le .ai est devenu cher (450 EUR/an). Sur les marches africains, le .bj coute environ 25 000 FCFA/an chez les registrars locaux comme HoubliWeb, le .ci environ 35 000 FCFA chez NIC.ci.</p>

<h2>2. Registrars recommandes</h2>
<p>Pour les domaines internationaux: <strong>OVHcloud, Gandi, Cloudflare Registrar</strong>. Cloudflare facture le domaine au prix coutant (8-9 EUR pour un .com) et inclut le DNS premium gratuit. Pour des extensions africaines, passez par des registrars accredites locaux car les .bj ne sont pas vendus chez les gros internationaux. Verifiez toujours la presence d'une protection WHOIS (free chez Cloudflare et Gandi, payante chez OVH).</p>

<h2>3. Choisir l'hebergement: 3 typologies</h2>
<ul>
<li><strong>Mutualise classique</strong> (LWS, o2switch, Hostinger): 3 a 10 EUR/mois, parfait pour un blog ou site vitrine jusqu'a 10 000 visites/mois. Limites: CPU partage, performance variable, pas de SSH avance.</li>
<li><strong>Managed WordPress</strong> (Kinsta, WP Engine, Cloudways): 30 a 120 EUR/mois, optimise stack LEMP, cache serveur, backups quotidiens, support specialise WP. Recommande des 30 000 visites/mois.</li>
<li><strong>VPS auto-gere</strong> (Hetzner, DigitalOcean, Scaleway): 5 a 40 EUR/mois, mais necessite des competences sysadmin (LEMP, Nginx, fail2ban). Reserve aux equipes avec un DevOps.</li>
</ul>

<h2>4. Hebergement et latence Afrique</h2>
<p>Un site heberge a Paris a une latence de 90-180 ms depuis Cotonou ou Abidjan. Pour servir une audience africaine, deux options serieuses: (1) heberger en Afrique du Sud (DigitalOcean Capetown, Hetzner Cape Town: 40 ms vers Dakar), ou (2) garder un hebergement europeen et placer Cloudflare devant pour le cache edge (Lagos, Nairobi, Johannesburg). La seconde option est la plus pragmatique en 2026.</p>

<h2>5. Specifications minimales WP 2026</h2>
<p>Pour un WordPress moderne avec WooCommerce, exigez: <strong>PHP 8.2+, MySQL 8.0+ ou MariaDB 10.6+, 2 vCPU, 4 Go RAM, 50 Go SSD NVMe, Nginx, HTTP/3 actif, sauvegardes automatiques quotidiennes avec 14 jours de retention</strong>. Sans HTTP/2 ou HTTP/3, vos Core Web Vitals plafonneront. Sans NVMe, les requetes Woo seront lentes meme avec un cache page.</p>

<h2>6. Configuration DNS post-achat</h2>
<p>Apres avoir achete domaine + hebergement, configurez immediatement les enregistrements suivants chez votre registrar: <code>A @ -> IP_serveur</code>, <code>CNAME www -> @</code>, <code>TXT _dmarc -> v=DMARC1; p=quarantine; rua=mailto:dmarc@votredomaine.com</code>, <code>TXT @ -> v=spf1 include:_spf.google.com ~all</code> et <code>DKIM</code> selon votre ESP. Cela evite que vos emails partent en spam des le premier envoi.</p>

<h2>7. Verification et HTTPS</h2>
<p>Apres propagation DNS (2-24h), activez HTTPS via Let's Encrypt (gratuit, inclus dans tout hebergeur serieux). Verifiez le grade SSL sur <strong>SSL Labs</strong>: vous devez obtenir A ou A+. Si vous obtenez B ou C, c'est que le serveur autorise des protocoles obsoletes (TLS 1.0/1.1): corrigez immediatement.</p>

<h2>FAQ</h2>
<p><strong>Faut-il acheter plusieurs extensions?</strong> Pour une marque commerciale, oui: le .com, le .fr et l'extension locale (.bj, .ci, etc.). Cela coute 60-150 EUR/an et protege contre la concurrence.</p>
<p><strong>OVH vs Cloudflare comme registrar?</strong> Cloudflare pour la simplicite et le prix coutant. OVH si vous voulez tout centraliser chez un acteur europeen avec support telephone.</p>
<p><strong>Mutualise ou managed des le depart?</strong> Si vous prevoyez plus de 5 000 EUR/mois de CA en e-commerce, partez directement en managed. La difference de cout est negligeable face au cout d'une chute en pleine campagne ads.</p>

<p>Besoin d'aide pour selectionner le bon hebergeur selon votre trafic cible et votre zone geographique? Reservez un <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous</a> avec nos experts.</p>"""},

            {'title': "Installer WordPress en moins de 15 minutes",
             'duration': 18,
             'content_html': """<p>Installer WordPress proprement en 15 minutes est devenu un standard professionnel. Une mauvaise installation au depart contamine tout le reste: tables avec prefixe par defaut, utilisateur admin nomme "admin", mots de passe trop courts, plugins de demo qui restent en place. Cette lecon vous donne le protocole reproductible que nous appliquons chez Pirabel Labs sur chaque nouvelle installation client, avec les options de durcissement immediates et les pieges a eviter selon votre hebergeur.</p>

<h2>1. Trois methodes d'installation</h2>
<p>En 2026, trois methodes coexistent: (1) <strong>installateur auto</strong> de l'hebergeur (cPanel Softaculous, Plesk, Hostinger Wizard) qui prend 3 minutes mais utilise des valeurs par defaut peu securisees, (2) <strong>installation manuelle FTP + base de donnees</strong> qui prend 15 minutes mais permet le controle complet, (3) <strong>WP-CLI</strong> qui prend 90 secondes pour un sysadmin a l'aise en SSH. Pour ce module, nous detaillons la methode 2.</p>

<h2>2. Creation de la base de donnees</h2>
<p>Dans phpMyAdmin ou la console MySQL: creez une base avec un nom non devinable (evitez wp_database), un utilisateur dedie (jamais root), un mot de passe genere par 1Password ou Bitwarden de 32 caracteres minimum. Notez les quatre informations: nom de base, utilisateur, mot de passe, hote (souvent localhost mais parfois un sous-domaine sur les managed).</p>

<h2>3. Telechargement et upload</h2>
<p>Telechargez la derniere version officielle sur <code>fr.wordpress.org/latest-fr_FR.zip</code> (jamais via un site tiers, risque de backdoor). Decompressez et uploadez le contenu du dossier wordpress/ a la racine de votre hote, via SFTP (jamais FTP non chiffre) avec FileZilla ou Cyberduck. Verifiez les permissions: dossiers en 755, fichiers en 644.</p>

<h2>4. Wizard d'installation</h2>
<p>Rendez-vous sur <code>https://votredomaine.com/wp-admin/install.php</code>. Choisissez francais. Remplissez les champs base de donnees (etape 2). <strong>Etape critique</strong>: changez le prefixe des tables de <code>wp_</code> a quelque chose comme <code>wp_a8f2_</code> (chaine aleatoire). Cela bloque 60% des injections SQL automatisees. Lors de la creation de l'admin: nom d'utilisateur jamais "admin", "wpadmin" ou "administrateur", utilisez une chaine type <code>op-gildas-2026</code>. Mot de passe 24 caracteres minimum.</p>

<h2>5. Premiere connexion et hardening immediat</h2>
<p>Apres login, allez immediatement dans Reglages > General et verifiez: URL du site en HTTPS, fuseau horaire correct (Africa/Cotonou ou Europe/Paris selon votre cas), format de date court, role par defaut des nouveaux inscrits = Abonne (jamais Auteur). Dans Reglages > Lecture: cochez "Demander aux moteurs de recherche de ne pas indexer ce site" tant que vous developpez (decochez avant la mise en ligne).</p>

<h2>6. Permaliens</h2>
<p>Reglages > Permaliens: choisissez "Nom de l'article" (jamais le format par defaut avec ?p=123). Cela impacte directement votre SEO. Sur certains hebergeurs Nginx, vous devrez ajouter quelques regles try_files dans la config serveur pour que les URLs jolies fonctionnent.</p>

<h2>7. Suppression du contenu de demo</h2>
<p>Supprimez immediatement: l'article "Bonjour le monde !", la page "Page d'exemple", le commentaire de demonstration, le theme Twenty Twenty-Three et Twenty Twenty-Two (gardez juste le theme actif et un de secours), le plugin Hello Dolly, et le plugin Akismet si vous n'avez pas de cle. Chaque element supprime reduit la surface d'attaque.</p>

<h2>8. Modification du fichier wp-config.php</h2>
<p>Editez <code>wp-config.php</code> via SFTP et ajoutez avant la ligne "Happy publishing":</p>
<ul>
<li><code>define('DISALLOW_FILE_EDIT', true);</code> bloque l'editeur de fichiers dans l'admin</li>
<li><code>define('WP_AUTO_UPDATE_CORE', 'minor');</code> active les mises a jour de securite auto</li>
<li><code>define('FORCE_SSL_ADMIN', true);</code> force HTTPS sur l'admin</li>
<li><code>define('WP_POST_REVISIONS', 5);</code> limite l'enflure de la base</li>
<li><code>define('AUTOSAVE_INTERVAL', 180);</code> autosave toutes les 3 minutes</li>
</ul>

<h2>FAQ</h2>
<p><strong>Faut-il installer via Softaculous?</strong> Acceptable pour un blog perso, jamais pour un site pro: trop de defauts non modifiables et un compte admin nomme "admin" cree par defaut.</p>
<p><strong>WordPress.com vs WordPress.org?</strong> .com est un hebergement SaaS limite (pas de plugins libres avant le plan Business a 25 EUR/mois). .org est le vrai WordPress que vous installez vous-meme.</p>
<p><strong>Combien de temps avant la mise en ligne reelle?</strong> Une installation propre prend 15 minutes. Mais avant d'ouvrir au public, comptez 3 a 5 jours pour la config plugins, contenu, design et tests.</p>

<p>Vous voulez deleguer cette installation a une equipe certifiee? Pirabel Labs propose un service "Setup pro WP" en 48h ouvrees. Demandez votre <a href="/contact">audit gratuit</a> ou planifiez un <a href="/rendez-vous">rendez-vous</a>.</p>"""},

            {'title': "Configurer les plugins essentiels (SEO, cache, securite)",
             'duration': 22,
             'content_html': """<p>Le choix des plugins de base determine 80% des performances et de la securite d'un WordPress. Installer 25 plugins le premier jour est une erreur classique qui ralentit le site, multiplie les conflits et explose la surface d'attaque. Cette lecon vous donne le socle de 7 plugins testes en production sur plus de 200 sites clients Pirabel Labs, avec la configuration exacte de chacun et les alternatives selon votre budget.</p>

<h2>1. Le principe du minimum viable</h2>
<p>Regle d'or: <strong>moins de 18 plugins actifs en production</strong>. Au-dela, le risque de conflit JavaScript ou de fuite de performance devient ingerable. Auditez tout plugin candidat avec trois questions: (a) est-il maintenu (derniere mise a jour < 60 jours)? (b) a-t-il plus de 50 000 installations actives? (c) son score sur WordPress.org est-il > 4.5/5? Si non a l'une des trois, cherchez une alternative.</p>

<h2>2. SEO: Rank Math ou Yoast</h2>
<p>Yoast SEO domine historiquement mais <strong>Rank Math</strong> l'a depasse en 2025 sur la richesse fonctionnelle gratuite: schema markup avance, analyses concurrentes, integration GA4 native, sitemap XML modulaire. Installez Rank Math Free, lancez l'assistant Setup Wizard, importez les donnees Yoast si vous migrez. Configurez immediatement: titre par defaut sous 60 caracteres, meta description sous 160, schema Organization rempli avec votre logo et NAP (Nom Adresse Telephone).</p>

<h2>3. Cache: WP Rocket (paid) ou LiteSpeed Cache (free)</h2>
<p>Si votre hebergeur tourne sur LiteSpeed (o2switch, Hostinger Business), installez <strong>LiteSpeed Cache</strong> gratuit qui exploite le cache serveur natif. Sinon, achetez <strong>WP Rocket</strong> (59 EUR/an, sans concurrence). Configuration WP Rocket: activez cache mobile separe, lazy load images + iframes, minify CSS et JS, defer JS non critique, remove unused CSS (option premium), preload sitemaps, database cleanup mensuel.</p>

<h2>4. Securite: Wordfence ou Solid Security (ex-iThemes)</h2>
<p>Pour 80% des sites, <strong>Wordfence Free</strong> suffit: firewall WAF, scan malware, 2FA, alertes login. Configuration immediate: limitez les tentatives de login a 3 par IP, bloquez les IP apres 4 echecs pendant 4 heures, activez le firewall en mode Extended Protection (procedure 5 minutes), activez l'alerte email sur connexion admin. Sur les sites a 50 000 visites/mois ou plus, passez en Wordfence Premium (119 EUR/an) pour les regles WAF mises a jour en temps reel.</p>

<h2>5. Sauvegardes: UpdraftPlus ou BackWPup</h2>
<p><strong>UpdraftPlus Free</strong> couvre 90% des besoins: backup vers Google Drive, Dropbox ou S3, planification quotidienne. Configurez: backup quotidien de la base, backup hebdomadaire des fichiers, retention 14 jours, stockage hors-site (jamais sur le meme serveur que WordPress). Testez la restauration tous les 90 jours sur un environnement de staging. Si vous n'avez jamais teste une restauration, vous n'avez pas de sauvegarde.</p>

<h2>6. Formulaires: Fluent Forms ou WPForms Lite</h2>
<p><strong>Fluent Forms Lite</strong> est plus rapide et moderne que Contact Form 7. Configurez un formulaire de contact avec: champ honeypot anti-spam, captcha invisible Cloudflare Turnstile, double opt-in pour les inscriptions newsletter, integration native Brevo ou Mailchimp.</p>

<h2>7. Optimisation images: ShortPixel ou EWWW Image Optimizer</h2>
<p><strong>ShortPixel</strong> (gratuit jusqu'a 100 images/mois) convertit automatiquement en WebP et AVIF, redimensionne et compresse sans perte visible. Activez la conversion WebP automatique, le redimensionnement max 1920px, la compression "glossy" qui garde une qualite acceptable a 30% du poids original.</p>

<h2>8. Tableau recapitulatif</h2>
<ol>
<li>Rank Math (SEO) - Free</li>
<li>WP Rocket (cache) - 59 EUR/an</li>
<li>Wordfence (securite) - Free</li>
<li>UpdraftPlus (backup) - Free</li>
<li>Fluent Forms Lite (formulaires) - Free</li>
<li>ShortPixel (images) - Free 100/mois</li>
<li>Site Kit by Google (analytics) - Free</li>
</ol>
<p>Total cout an 1: 59 EUR. Total temps de configuration: 2h30. Resultat: socle pro pour 95% des PME.</p>

<h2>FAQ</h2>
<p><strong>Faut-il un plugin pour les cookies RGPD?</strong> Oui: Complianz ou CookieYes, configurez en moins de 30 minutes avec scan automatique des cookies tiers.</p>
<p><strong>Pourquoi pas Jetpack?</strong> Jetpack est puissant mais lourd (charge des scripts externes). Pour un site pro, mieux vaut des plugins specialises et legers.</p>
<p><strong>Plugins de migration?</strong> All-in-One WP Migration ou Duplicator Pro, mais a installer seulement en cas de migration, jamais en permanence sur le site de prod.</p>

<p>Pour une selection de plugins personnalisee selon votre niche, demandez votre <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous</a> avec un expert WordPress Pirabel Labs.</p>"""},
        ],
    },
    {
        'title': 'Design et structure des pages',
        'objective': "L'apprenant choisira un theme performant, construira une identite visuelle coherente, organisera la navigation et concevra des pages prevues pour convertir des le premier mois.",
        'duration': 165,
        'lessons': [
            {'title': "Choisir un theme : criteres et erreurs a eviter",
             'duration': 20,
             'content_html': """<p>Le theme est la couche la plus durable de votre WordPress: changer de plugin se fait en 10 minutes, changer de theme peut casser 200 pages. Choisir un theme bloated ou abandonne en 2024 vous condamne a une refonte en 2026. Cette lecon vous expose les criteres techniques objectifs pour selectionner un theme en 2026, les noms valides actuellement, et les pieges marketing recurrents que les agences pretendument premium continuent de vendre malgre leur obsolescence.</p>

<h2>1. La regle du theme leger</h2>
<p>Le poids HTML/CSS/JS d'une page d'accueil sans contenu doit etre <strong>inferieur a 200 ko transferes</strong>. Mesurez avec PageSpeed Insights ou WebPageTest sur la demo officielle du theme. Si la demo charge 1.5 Mo avant meme votre contenu, fuyez. Avada, Divi, BeTheme et The7 echouent systematiquement a ce test. <strong>GeneratePress, Kadence, Blocksy, Astra Pro</strong> passent largement.</p>

<h2>2. Compatibilite avec l'editeur Gutenberg</h2>
<p>En 2026, le Site Editor (FSE - Full Site Editing) est mature. Privilegiez un theme <strong>natif blocks</strong> (Kadence Blocks, Twenty Twenty-Four) ou un theme hybride qui supporte parfaitement Gutenberg. Evitez les themes encore couples a un page builder proprietaire (Avada Builder, Divi Builder): le jour ou vous changez de theme, votre contenu devient inutilisable.</p>

<h2>3. Mise a jour reguliere</h2>
<p>Verifiez sur WordPress.org ou sur le site officiel: <strong>derniere mise a jour < 60 jours, derniere version testee = WordPress courant</strong>. Un theme non mis a jour depuis 6 mois est un theme mort. Verifiez aussi le forum support: si les questions des 90 derniers jours restent sans reponse, le theme est en fin de vie.</p>

<h2>4. Licence et redistribution</h2>
<p>N'utilisez jamais un theme nulled (piratage du theme premium): 100% contiennent du code injecte par les pirates. La fausse economie de 49 EUR vous coute une infection en moyenne sous 90 jours. Achetez la licence officielle ou choisissez un theme GPL gratuit.</p>

<h2>5. Themes recommandes 2026</h2>
<ul>
<li><strong>Kadence</strong>: meilleur rapport qualite/prix, version gratuite tres complete, premium a 129 USD/an. Excellent pour blogs, sites vitrine, WooCommerce.</li>
<li><strong>GeneratePress + GenerateBlocks</strong>: theme le plus leger du marche, parfait pour SEO et performance pure.</li>
<li><strong>Blocksy</strong>: design moderne, gratuit, ideal pour agences et freelances.</li>
<li><strong>Astra Pro</strong>: tres polyvalent, riche en starters templates, premium a 59 EUR/an.</li>
</ul>

<h2>6. Themes a eviter en 2026</h2>
<p>Avada, Divi, BeTheme, The7, Bridge, Salient, Enfold. Tous portent la signature des annees 2015-2018: lourdeur, dependance au builder proprietaire, mises a jour problematiques. Si vous heritez d'un site sur l'un de ces themes avec un trafic faible, migrez. Si le trafic est consequent, planifiez la migration sur 6 mois.</p>

<h2>7. Audit avant achat</h2>
<p>Avant d'acheter, faites trois tests sur la demo officielle: <strong>(1)</strong> PageSpeed Insights mobile, score doit etre > 85, <strong>(2)</strong> GTmetrix avec localisation Paris, LCP < 2.5s, <strong>(3)</strong> Wave Accessibility, zero erreur critique. Un theme qui rate l'un de ces trois est disqualifie.</p>

<h2>8. Personnalisation et child theme</h2>
<p>Tout theme serieux supporte un child theme: c'est obligatoire pour preserver vos modifications de CSS et de PHP lors des mises a jour. Si votre theme ne fournit pas de child theme officiel, generez-le avec le plugin "Child Theme Configurator" en 2 minutes.</p>

<h2>FAQ</h2>
<p><strong>Un theme gratuit suffit-il?</strong> Oui dans 70% des cas. Kadence Free ou Astra Free couvrent tous les besoins d'un site vitrine PME.</p>
<p><strong>Theme custom vs theme premium?</strong> Custom valide a partir de 80 000 EUR de budget global. En dessous, un theme premium bien configure offre un meilleur ROI.</p>
<p><strong>Comment migrer d'Avada vers Kadence?</strong> Avec un freelance experimente, comptez 4 000 a 9 000 EUR pour un site de 30 pages. Le ROI se paie en gain de conversion (vitesse).</p>

<p>Vous souhaitez un avis ecrit sur votre theme actuel? Reservez un <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous strategique</a> avec Pirabel Labs.</p>"""},

            {'title': "Personnaliser l'identite visuelle (logo, couleurs, polices)",
             'duration': 18,
             'content_html': """<p>L'identite visuelle de votre WordPress determine la perception de credibilite en 0.05 seconde, selon les etudes de la Nielsen Norman Group. Une identite faible plombe vos conversions meme avec une offre excellente. Cette lecon vous montre comment configurer logo, palette et typographie de maniere professionnelle dans WordPress 2026, en evitant les erreurs amateures qui sabotent les premieres impressions.</p>

<h2>1. Logo: dimensions et formats</h2>
<p>Trois versions de logo a fournir: <strong>(a) horizontal pour le header desktop</strong> en 240x60 px, <strong>(b) carre/symbole pour mobile</strong> en 80x80 px, <strong>(c) favicon</strong> en 512x512 px. Format SVG en priorite (poids minimal, parfait sur retina). Si vous n'avez que du PNG, exportez en 2x la taille d'affichage finale et compressez avec TinyPNG.</p>

<h2>2. Charger le logo dans WordPress</h2>
<p>Dans Apparence > Personnaliser > Identite du site: chargez le logo horizontal, l'icone de site (favicon), le titre du site (60 caracteres max, contient un mot-cle), le slogan (texte alternatif aux moteurs). Sur themes FSE, allez dans Site Editor > Header pour positionner le logo et choisir le ratio.</p>

<h2>3. Palette de couleurs: la regle 60/30/10</h2>
<p>Une charte solide repose sur <strong>3 couleurs maximum</strong>: une dominante (60% des surfaces), une secondaire (30%), une accent CTA (10%). Definissez ces couleurs dans Apparence > Personnaliser > Couleurs ou dans theme.json pour les themes FSE. Generez votre palette avec Coolors.co ou Adobe Color, et verifiez le contraste WCAG AA sur WebAIM Contrast Checker (ratio > 4.5:1 pour le texte).</p>

<h2>4. Couleurs et marche africain</h2>
<p>Sur les marches francophones d'Afrique de l'Ouest, certaines associations chromatiques ont des connotations fortes: l'orange est associe a MTN, le bleu nuit a Orange Money, le rouge a Bank of Africa et UBA. Si votre marque cible le secteur fintech, evitez ces tons sans differenciation marquee, sous peine de confusion d'identite.</p>

<h2>5. Typographie: maximum 2 polices</h2>
<p>Une bonne hierarchie typographique utilise <strong>une police titre et une police corps</strong>, jamais plus. Recommandations 2026: <strong>Inter, Manrope, Plus Jakarta Sans</strong> pour le corps (sans-serif, lisibilite ecran), <strong>Fraunces, Playfair Display, DM Serif Display</strong> pour les titres (serif elegant). Toutes disponibles sur Google Fonts, donc gratuites.</p>

<h2>6. Performance des polices</h2>
<p>N'inserez jamais les polices via <code>@import</code> dans le CSS. Hebergez les en local avec OMGF (Optimize My Google Fonts) ou utilisez le mode preload + font-display: swap. Cela elimine un round-trip vers fonts.googleapis.com et booste votre LCP de 200 a 400 ms. Limitez les graisses chargees: 400 et 700 suffisent en general.</p>

<h2>7. Hierarchie des tailles</h2>
<p>Utilisez une echelle modulaire: 16 px (corps), 20 px (intro), 24 px (h4), 32 px (h3), 40 px (h2), 56 px (h1 desktop). Sur mobile, divisez les h1 par 1.3 pour eviter les debordements. Stockez ces valeurs dans theme.json ou les variables CSS du theme pour les rendre coherentes partout.</p>

<h2>8. Mode sombre</h2>
<p>En 2026, le mode sombre n'est plus optionnel sur les sites pro: 38% des utilisateurs activent le mode sombre systeme selon les statistiques Apple WWDC 2025. Kadence, Blocksy et Astra Pro fournissent un dark mode natif. Verifiez les contrastes sur les deux modes.</p>

<h2>FAQ</h2>
<p><strong>Combien coute un logo professionnel?</strong> 500 a 3 000 EUR chez un designer francophone serieux. Eviter Fiverr en dessous de 100 EUR: zero recherche, zero strategie.</p>
<p><strong>Faut-il une charte graphique formelle?</strong> Oui des 50 000 EUR de CA: 1 page suffit avec logo, palette HEX, typographies et 3 exemples d'application.</p>
<p><strong>Police custom ou Google Fonts?</strong> Google Fonts couvre 95% des besoins. Custom paye seulement pour marques de luxe ou identite ultra-distinctive.</p>

<p>Pour un audit branding complet de votre WordPress, contactez nos designers Pirabel Labs via <a href="/contact">audit gratuit</a> ou prenez un <a href="/rendez-vous">rendez-vous</a>.</p>"""},

            {'title': "Construire le menu et la navigation",
             'duration': 18,
             'content_html': """<p>Une navigation confuse fait perdre 18 a 27% des visiteurs des la premiere visite, selon les benchmarks Baymard Institute 2025. La barre de menu est la promesse de votre site: elle annonce la structure de l'offre, elle conduit vers la conversion. Cette lecon vous apprend a concevoir une navigation efficace dans WordPress 2026, en respectant les regles UX cognitives et les contraintes mobiles propres aux audiences francophones d'Afrique.</p>

<h2>1. La regle des 7 +/- 2</h2>
<p>La memoire de travail humaine retient 5 a 9 elements simultanement. Votre menu principal doit donc compter <strong>5 a 7 entrees maximum</strong>. Au-dela, le visiteur ne lit plus, il scanne et part. Les sites a 12 entrees de menu font partie des erreurs les plus courantes que nous corrigeons en audit.</p>

<h2>2. Structure recommandee pour une PME services</h2>
<ul>
<li>Accueil (parfois absent si logo cliquable suffit)</li>
<li>Nos services (avec sous-menu si plusieurs offres)</li>
<li>Cas clients ou Realisations</li>
<li>A propos</li>
<li>Blog ou Ressources</li>
<li>Contact (bouton CTA distinct visuellement)</li>
</ul>

<h2>3. Creer le menu dans WordPress</h2>
<p>Sur themes classiques: Apparence > Menus, creez un menu nomme "Header principal", glissez-deposez les pages, organisez la hierarchie (sous-elements indentes). Assignez l'emplacement "Menu principal". Sur themes FSE: Site Editor > Header, ajoutez un bloc Navigation, ajoutez les liens un par un.</p>

<h2>4. Menu sticky et mobile burger</h2>
<p>Un menu sticky (qui reste visible au scroll) augmente la navigation interne de 22% selon Hotjar. Activez le sticky dans les options de votre theme. Sur mobile, utilisez un burger menu (icone 3 traits) qui ouvre un drawer plein ecran avec liens en gros caracteres (min 18 px) et zones tactiles min 48x48 px (WCAG).</p>

<h2>5. CTA distinct dans le menu</h2>
<p>Le dernier bouton du menu doit etre visuellement different (couleur accent, fond plein) et porter un verbe d'action: <em>"Demander un devis"</em>, <em>"Reserver un creneau"</em>, <em>"Audit gratuit"</em>. Eviter les CTA tiedes ("Plus d'infos", "Decouvrir"). La conversion globale du site peut gagner 8 a 14% avec ce simple changement.</p>

<h2>6. Megamenus: quand et comment</h2>
<p>Si vous avez plus de 30 pages de services ou produits, utilisez un megamenu (panneau deroulant large avec colonnes et visuels). Plugin recommande: <strong>Max Mega Menu</strong>. Limitez chaque colonne a 8 liens. Ajoutez une image ou icone pour chaque section. Evitez les megamenus a 4 niveaux: au-dela de 2, c'est ingerable mentalement.</p>

<h2>7. Breadcrumbs (fil d'ariane)</h2>
<p>Le fil d'ariane est essentiel pour le SEO (schema markup BreadcrumbList) et pour l'UX (l'utilisateur sait ou il est). Activez-le dans Rank Math > General > Breadcrumbs, ou insertable manuellement via le code <code>[rank_math_breadcrumb]</code> dans header.php. Affichez-le juste sous le menu, jamais en pied de page.</p>

<h2>8. Search bar dans le header</h2>
<p>Sur les sites de plus de 50 pages, un champ de recherche dans le header booste la conversion: les utilisateurs intentionnels qui cherchent un mot-cle precis ont un taux de conversion 3 a 6 fois superieur. Utilisez SearchWP (29 USD/an) pour une recherche pertinente, le moteur natif WP est limite.</p>

<h2>FAQ</h2>
<p><strong>Le menu doit-il etre fixe ou disparaitre au scroll?</strong> Fixe au scroll est mieux pour la navigation, mais reduit la hauteur d'affichage. Sticky compact (header reduit au scroll) est le compromis optimal.</p>
<p><strong>Faut-il un menu footer?</strong> Oui: mini-sitemap, mentions legales, RGPD, contact. C'est aussi un signal SEO secondaire.</p>
<p><strong>Comment tester l'UX du menu?</strong> Heatmap Hotjar ou Microsoft Clarity (gratuit). Au-dessus de 80% des clics sur 2-3 entrees seulement: simplifier.</p>

<p>Pour une analyse UX complete de votre navigation, demandez un <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous</a> chez Pirabel Labs.</p>"""},

            {'title': "Creer le footer et les widgets",
             'duration': 16,
             'content_html': """<p>Le footer est sous-estime: c'est pourtant la zone la plus visitee par les utilisateurs intentionnels (acheteurs B2B, journalistes, recruteurs). Un footer riche augmente la duree de session moyenne de 12% et le taux de conversion de la page contact de 18%, selon nos AB tests Pirabel Labs sur 47 sites clients en 2024-2025. Cette lecon vous montre comment construire un footer pro dans WordPress 2026, qui sert a la fois l'UX, le SEO et la conformite legale.</p>

<h2>1. Structure recommandee en 4 colonnes</h2>
<p>Le standard 2026 est un footer a 4 colonnes desktop, qui se replient en accordeon mobile:</p>
<ul>
<li><strong>Col 1: Identite</strong> - logo + slogan + 2 lignes sur l'agence + boutons reseaux sociaux</li>
<li><strong>Col 2: Services</strong> - 5 a 7 liens vers vos pages services principales</li>
<li><strong>Col 3: Ressources</strong> - blog, cas clients, lexique, FAQ</li>
<li><strong>Col 4: Contact</strong> - adresse, telephone, email, horaires + bouton CTA prise de RDV</li>
</ul>

<h2>2. Footer credit bar</h2>
<p>Sous les colonnes, une fine barre horizontale contient: copyright avec annee automatique (<code>©  &lt;?php echo date('Y'); ?&gt;</code>), liens mentions legales, CGV, politique de confidentialite, gestion cookies. Sur la droite, eventuellement un selecteur de langue.</p>

<h2>3. Configuration dans WordPress</h2>
<p>Sur themes classiques: Apparence > Widgets, glissez les widgets dans Footer Col 1 a 4. Sur themes FSE: Site Editor > Footer, ajoutez des blocs Colonnes puis remplissez chacune. Kadence et Blocksy proposent des layouts footer pre-builds modifiables en 5 minutes.</p>

<h2>4. Widget reseaux sociaux: la regle des 5</h2>
<p>N'affichez que les reseaux ou vous postez activement (derniere publication < 30 jours). Mieux vaut 3 icones LinkedIn/Instagram/YouTube actives qu'un mur de 8 icones dont la moitie pointe vers des comptes morts. Utilisez des icones SVG inline pour zero requete HTTP supplementaire.</p>

<h2>5. Adresse NAP coherente</h2>
<p>L'adresse (Name, Address, Phone) doit etre <strong>strictement identique</strong> dans le footer, Google Business Profile, schema.org, annuaires (PagesJaunes, Yelp, GoAfrica). Une variation ("Rue X" vs "Rue 23, X") casse le citation matching et plombe le SEO local. Notre exemple Pirabel Labs: "Pirabel Labs, Abomey-Calavi, Benin - contact@pirabellabs.com".</p>

<h2>6. Newsletter inline</h2>
<p>Un champ email d'inscription a la newsletter dans le footer apporte 30 a 80 leads/mois sur un site a 10 000 visites. Liaison directe avec Brevo, Mailchimp ou Klaviyo via shortcode. Toujours en double opt-in pour RGPD.</p>

<h2>7. Mentions legales obligatoires</h2>
<p>Le footer doit pointer vers les pages suivantes, obligatoires en France et de plus en plus en Afrique francophone: <strong>Mentions legales, Politique de confidentialite (RGPD), CGV/CGU si commerce, Politique cookies, Plan du site (sitemap utilisateur)</strong>. Au Benin, la loi 2017-20 sur le code du numerique impose mentions sur l'editeur, l'hebergeur et le directeur de publication.</p>

<h2>8. Performance du footer</h2>
<p>Eviter d'inserer dans le footer: video YouTube embed (charge 700 ko de scripts), map Google Maps iframe (charge 1 Mo). Si vous tenez a une carte, utilisez une image statique cliquable qui ouvre Google Maps dans un nouvel onglet.</p>

<h2>FAQ</h2>
<p><strong>Footer fixe ou non-fixe?</strong> Jamais fixe sur mobile (mange l'espace utile). Sur desktop, possible pour certains SaaS mais inutile sur la majorite des sites.</p>
<p><strong>Combien de liens dans le footer?</strong> 20 a 40 liens maximum. Au-dela, c'est un sitemap qui doit etre relegue a la page dediee.</p>
<p><strong>Footer credit "Site cree par X"?</strong> Acceptable si discret. Au Benin, certaines agences le rendent obligatoire pour leurs forfaits low-cost: lisez votre contrat.</p>

<p>Vous voulez un footer professionnel cle en main? Pirabel Labs vous propose un template optimise SEO + RGPD. Demandez <a href="/contact">audit gratuit</a> ou <a href="/rendez-vous">prenez RDV</a>.</p>"""},
        ],
    },
    {
        'title': 'Plugins themes et extensions',
        'objective': "L'apprenant choisira, configurera et auditera les plugins critiques pour combiner securite, performance et flexibilite, en respectant le principe du minimum viable.",
        'duration': 160,
        'lessons': [
            {'title': "Top 10 des plugins WordPress incontournables",
             'duration': 22,
             'content_html': """<p>WordPress compte plus de 60 000 plugins officiels, dont seulement 200 valent vraiment le coup en 2026. Le piege classique consiste a empiler des plugins gratuits decouverts sur des blogs marketing, sans tenir compte de la performance, du suivi de developpement ou des conflits potentiels. Cette lecon presente la pile de 10 plugins que nous installons systematiquement sur les sites WordPress professionnels chez Pirabel Labs, avec leur configuration optimale et les alternatives qui ont fait leurs preuves sur le terrain.</p>

<h2>1. Rank Math Pro (SEO) - 79 USD/an</h2>
<p>La version Pro debloque le suivi de mots-cles illimite, l'analyse de concurrents integree, le Schema premium (Local Business, How-To, FAQ, Course), l'integration GA4 dans le dashboard WordPress et les redirections regex. Configurez immediatement: site verification Google Search Console, soumission sitemap, Schema Organization avec NAP + reseaux sociaux, breadcrumbs actives, et analyse SEO automatique a la publication.</p>

<h2>2. WP Rocket (cache) - 59 USD/an</h2>
<p>Toujours imbattable en 2026 sur WordPress non-LiteSpeed. Activez: cache page, cache mobile separe (important si themes responsive), preload XML sitemap, lazy load images + iframes, async CSS, defer JS sauf jQuery, minify HTML/CSS/JS, integration Cloudflare APO, database cleanup automatique mensuel. Resultat moyen mesure: PageSpeed mobile passe de 45 a 78.</p>

<h2>3. Wordfence Premium (securite) - 119 USD/an</h2>
<p>Pour les sites a >50 000 visites/mois ou e-commerce. La Premium debloque: WAF temps reel avec regles mises a jour quotidiennement contre les zero-days, blocage des IPs malveillantes par flux, scan haute frequence (toutes les heures), alertes SMS pour activites suspectes critiques. La version Free reste valable pour les sites moins exposes.</p>

<h2>4. UpdraftPlus Premium (backup) - 79 USD/an</h2>
<p>La version Premium offre les sauvegardes incrementales (10 fois plus rapides), le multi-stockage simultane (S3 + Google Drive + Backblaze), les sauvegardes pre-update automatiques avant chaque mise a jour de plugin, et la migration vers staging en 1 clic. Configurez 3 plans: quotidien base de donnees, hebdomadaire fichiers + base, mensuel archive complete avec retention 12 mois.</p>

<h2>5. Advanced Custom Fields Pro (ACF) - 49 USD/an</h2>
<p>Indispensable des qu'on construit du contenu structure (cas clients, equipe, services, FAQ). ACF Pro permet de creer des champs personnalises, blocks Gutenberg sur mesure, taxonomies enrichies, et galeries. Couple a Custom Post Types UI (gratuit), il transforme WordPress en CMS sur mesure sans coder.</p>

<h2>6. Fluent Forms Pro (formulaires) - 79 USD/an</h2>
<p>Plus rapide et leger que Gravity Forms ou WPForms. Pro debloque: paiements Stripe/PayPal/FedaPay/PayDunya, conditional logic avance, integrations 50+ ESP, conversational forms (Typeform-like), uploads avec antivirus, signatures electroniques. Parfait pour devis, prises de RDV, lead magnets.</p>

<h2>7. Smush Pro ou ShortPixel - 30-99 USD/an</h2>
<p>Pour la compression images et conversion WebP/AVIF. ShortPixel facture au credit (5 EUR pour 5 000 images), Smush Pro a un abonnement mensuel illimite. Activez la conversion auto, le redimensionnement max 1920px, la compression "glossy" (95% qualite, 60% de poids economise), le serving WebP via balise picture native.</p>

<h2>8. WP Mail SMTP (delivrabilite emails) - Free + Pro 49 USD/an</h2>
<p>WordPress envoie les emails via la fonction PHP mail() par defaut, ce qui finit en spam 9 fois sur 10. WP Mail SMTP route via un service authentifie: Brevo (gratuit jusqu'a 300/jour), SendGrid, Postmark, Amazon SES. Configurez SPF + DKIM + DMARC, et testez avec mail-tester.com (objectif: 9/10 minimum).</p>

<h2>9. WP Activity Log (audit logs) - 99 USD/an</h2>
<p>Cruciale en multi-utilisateurs et en compliance. Log tous les evenements: login, modifications de post, installation plugin, changement de role, suppression de fichier. Export en CSV pour audit RGPD. Alertes email sur evenements sensibles (creation admin, modification htaccess).</p>

<h2>10. Site Kit by Google (analytics) - Free</h2>
<p>Plugin officiel Google qui agrege Search Console, GA4, AdSense, PageSpeed Insights dans un dashboard WordPress. Setup en 10 minutes via OAuth. Permet aux administrateurs non-techniques de voir les KPI directement dans l'admin WP sans connecter de comptes externes.</p>

<h2>Budget plugins annuel recommande</h2>
<ul>
<li><strong>Site vitrine PME</strong>: 200 a 300 EUR/an (Rank Math + WP Rocket + Wordfence Free)</li>
<li><strong>E-commerce small</strong>: 500 a 800 EUR/an (ajout ACF + Fluent Forms + ShortPixel)</li>
<li><strong>Site complexe enterprise</strong>: 1 200 a 2 500 EUR/an (toute la pile Premium)</li>
</ul>

<h2>FAQ</h2>
<p><strong>Jetpack vaut-il le coup?</strong> Non en 2026: lourd, multi-fonctions mal optimisees, recommande seulement pour blogs persos sur WordPress.com.</p>
<p><strong>Plugins gratuits suffisent-ils?</strong> Pour un blog personnel oui. Pour un site qui genere du CA, la pile Premium se rentabilise en 1 a 3 mois par les gains de performance et de securite.</p>
<p><strong>Comment auditer mes plugins existants?</strong> Plugin Performance Profiler ou Query Monitor montre la consommation CPU/MySQL de chaque plugin: virez les outliers.</p>

<p>Vous voulez un audit plugins par notre equipe? Demandez votre <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous</a>.</p>"""},

            {'title': "Installer Elementor et construire sa premiere page",
             'duration': 22,
             'content_html': """<p>Elementor est le page builder le plus utilise (5 millions+ d'installations), mais aussi le plus controverse. Mal configure, il transforme un WordPress rapide en site lourd a 4 secondes de LCP. Bien configure, il permet de construire une landing page de conversion en 90 minutes sans coder. Cette lecon vous montre la configuration d'Elementor 2026 (compatible avec FSE et les Containers Flexbox), avec une demarche pas-a-pas pour creer une landing page services qui convertit.</p>

<h2>1. Elementor Free vs Pro</h2>
<p>Elementor Free couvre l'editeur et 40 widgets de base. Elementor Pro (59 USD/an pour 1 site) debloque: 60+ widgets supplementaires (form builder, posts, slides, custom CSS, motion effects), Theme Builder (header, footer, archive, single dynamiques), Popup Builder, integrations marketing (Mailchimp, Brevo, ActiveCampaign). En contexte pro, prenez Pro sans hesiter.</p>

<h2>2. Installation et activation</h2>
<p>Extensions > Ajouter > "Elementor" > Installer > Activer. Si vous avez la version Pro: telechargez le ZIP depuis votre compte my.elementor.com, uploadez via Extensions > Ajouter > Televerser. Activez la licence dans Elementor > License > activez avec votre cle.</p>

<h2>3. Reglages performance critiques</h2>
<p>Elementor > Reglages > Performance: activez <strong>"Optimized DOM Output"</strong>, <strong>"Improved Asset Loading"</strong>, <strong>"Improved CSS Loading"</strong>, <strong>"Inline Font Icons"</strong>, <strong>"Lazy Load Background Images"</strong>. Ces 5 options divisent par 2 le poids des pages Elementor. Activez aussi "Flexbox Container" qui remplace l'ancien systeme Sections/Columns (plus leger, plus moderne, base CSS Grid).</p>

<h2>4. Creer la premiere page</h2>
<p>Pages > Ajouter > "Modifier avec Elementor". Choisissez une mise en page Elementor Canvas (sans header/footer du theme). Importez un template depuis la bibliotheque (700+ disponibles) ou partez d'une page vierge. Drag and drop des widgets depuis le panneau de gauche dans la colonne centrale.</p>

<h2>5. Structure type d'une landing page services</h2>
<ul>
<li><strong>Hero</strong>: H1 promesse + sous-titre + CTA principal + visuel</li>
<li><strong>Bandeau preuves sociales</strong>: 5-7 logos clients ou chiffres cles</li>
<li><strong>3-4 benefices</strong>: icones + titre + 2 lignes</li>
<li><strong>Section detail offre</strong>: presentation des services avec visuels</li>
<li><strong>Temoignages</strong>: 3 cards clients avec photo + nom + entreprise</li>
<li><strong>FAQ accordeon</strong>: 5-7 questions/reponses</li>
<li><strong>CTA final</strong>: formulaire ou bouton prise de RDV</li>
</ul>

<h2>6. Optimisation mobile</h2>
<p>Apres construction desktop, basculez en preview Tablette puis Mobile. Verifiez: textes h1 max 32px sur mobile, padding sections divises par 2, images responsives, boutons CTA pleine largeur sur mobile. Reduisez ou cachez les sections decoratives (ornements, fonds video) qui n'apportent rien sur petit ecran.</p>

<h2>7. Performance: les pieges Elementor</h2>
<p>Elementor charge par defaut 4 polices Google et des icones FontAwesome. Allez dans Elementor > Reglages > Features > "Improved Asset Loading" + "Inline Font Icons" + "FontAwesome 4 Support" > Desactiver si vous n'utilisez pas FA4. Resultat: gain de 200-400 ms sur le LCP.</p>

<h2>8. Sauvegarde et reutilisation</h2>
<p>Une section bien construite peut etre sauvegardee comme template global (Elementor > Templates > Sauvegarder comme template). Cela permet de reutiliser le hero, le footer ou les CTA d'une page a l'autre sans recommencer. Sur un site de 50 pages, cette discipline economise des dizaines d'heures.</p>

<h2>FAQ</h2>
<p><strong>Elementor ou Gutenberg en 2026?</strong> Gutenberg si vous restez sur WP, Elementor si vous voulez du design pixel-perfect rapide. Les deux coexistent sans probleme.</p>
<p><strong>Bricks Builder est-il meilleur?</strong> Plus leger et plus moderne techniquement, mais courbe d'apprentissage plus raide. Reserve aux developpeurs/freelances avances.</p>
<p><strong>Elementor ralentit-il mon site?</strong> Mal configure oui (LCP 4s+). Bien configure, on tient 1.8s a 2.2s sur mobile.</p>

<p>Vous voulez accelerer un site WP construit avec Elementor? Demandez votre <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous</a>.</p>"""},

            {'title': "Optimiser les images : WebP, lazy load, compression",
             'duration': 20,
             'content_html': """<p>Les images representent 70 a 85% du poids total des pages WordPress sans optimisation, selon les rapports HTTP Archive 2025. Une bonne strategie images peut faire passer un LCP de 4.2 secondes a 1.6 seconde sans toucher au theme ni au code. Cette lecon couvre la pipeline complete: choix du format (WebP, AVIF), compression sans perte visible, dimensions responsives, lazy load, CDN d'images, et les outils 2026 qui automatisent tout cela.</p>

<h2>1. Formats d'images en 2026</h2>
<p>Trois formats dominent: <strong>WebP</strong> (compatible 98% des navigateurs, 25 a 35% plus leger que JPG), <strong>AVIF</strong> (compatible 92%, 40 a 50% plus leger que JPG mais plus lent a encoder), <strong>SVG</strong> pour icones et logos. JPG/PNG ne sont plus a utiliser en serving direct: a convertir systematiquement en WebP ou AVIF avec fallback.</p>

<h2>2. Dimensions: ne jamais charger 4K pour afficher en 800px</h2>
<p>WordPress genere 5 tailles par image par defaut. Configurez les tailles personnalisees correspondant a votre design dans <code>functions.php</code>: <code>add_image_size('hero-desktop', 1920, 900, true);</code> et <code>add_image_size('hero-mobile', 760, 800, true);</code>. Utilisez <strong>srcset</strong> et <strong>sizes</strong> via le balisage HTML5 picture pour servir la bonne taille selon le viewport.</p>

<h2>3. Compression avec ShortPixel</h2>
<p>Installez ShortPixel, creez un compte API (5 EUR pour 5 000 credits), entrez votre cle. Reglages: niveau de compression "Glossy" (95% de qualite visuelle preservee), conversion WebP automatique, conversion AVIF (option premium), redimensionnement images > 1920px de large, optimisation des miniatures generees par WP. Lancez le bulk optimization sur la bibliotheque existante (peut prendre 1 a 4 heures sur de grosses bibliotheques).</p>

<h2>4. Lazy load natif vs JavaScript</h2>
<p>Depuis WordPress 5.5, le lazy load HTML natif (<code>loading="lazy"</code>) est active par defaut sur les images en dessous du fold. C'est gratuit, pas de JS, et fonctionne dans 95% des navigateurs. <strong>Important</strong>: desactivez le lazy load sur l'image LCP (hero principal), sinon le LCP devient catastrophique. WP Rocket et Perfmatters offrent une option "exclure les X premieres images".</p>

<h2>5. CDN d'images: Cloudflare Polish vs Bunny Optimizer</h2>
<p>Si vous voulez une optimisation server-side automatique sans toucher a WordPress, deux solutions: <strong>Cloudflare Polish</strong> (inclus dans Pro a 25 USD/mois) qui compresse a la volee et sert WebP, et <strong>Bunny Optimizer</strong> (9.5 USD/mois) qui ajoute redimensionnement adaptatif et conversion AVIF. Resultat: -40 a -60% du poids images sans modifier les fichiers d'origine.</p>

<h2>6. Optimisation des fonds Elementor et CSS</h2>
<p>Elementor permet de definir des images de fond via CSS. Le probleme: pas de lazy load natif, pas de srcset. Solution: dans Elementor > Reglages > Performance, activez "Lazy Load Background Images" qui detecte les fonds et applique un IntersectionObserver. Pour les fonds plein ecran, fournissez 2 versions (1920px desktop, 760px mobile) via media queries.</p>

<h2>7. Audit avec PageSpeed Insights</h2>
<p>Apres optimisation, lancez PSI sur 3 URLs cles (home, page service principale, article blog). Section "Opportunites": verifiez que vous n'avez plus "Properly size images" ni "Serve images in next-gen formats" ni "Defer offscreen images". Section "LCP element": confirmez que l'image hero charge en < 2.5 secondes sur mobile 4G simule.</p>

<h2>8. Cas africain: bande passante limitee</h2>
<p>Les audiences ouest-africaines naviguent souvent en 3G/H+ avec latence elevee. Pour ces marches, visez un poids total de page < 500 ko sur mobile (vs 1.5 Mo standard occidental). Cela impose: WebP/AVIF systematique, pas plus de 8 images au-dessus du fold, fonts subset (ne charger que les caracteres latin1, pas l'integralite Unicode).</p>

<h2>FAQ</h2>
<p><strong>WebP ou AVIF en 2026?</strong> AVIF si votre audience est moderne, WebP en fallback. Les deux peuvent etre servis via balise picture.</p>
<p><strong>Le lazy load casse-t-il le SEO?</strong> Non si vous gardez le markup IMG standard. Google crawle parfaitement les images lazy-loaded depuis 2020.</p>
<p><strong>Compression "lossy" vs "lossless"?</strong> Glossy/lossy a 80-90% est invisible pour 99% des humains et divise le poids par 3. Lossless reserve aux photos d'art ou e-commerce luxe.</p>

<p>Vous voulez un audit images personnalise? Demandez votre <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous</a>.</p>"""},

            {'title': "Securiser WordPress contre les attaques courantes",
             'duration': 24,
             'content_html': """<p>WordPress represente 43% des sites web mondiaux et donc 90% des attaques CMS. Selon le rapport WordFence 2025, 18 millions de tentatives d'intrusion par jour visent WordPress, principalement par brute force, injection SQL, XSS et exploits de plugins obsoletes. Cette lecon presente le hardening de niveau pro applique systematiquement chez Pirabel Labs: 12 mesures qui bloquent 95% des attaques automatisees et resistent a la plupart des attaques ciblees.</p>

<h2>1. Comprendre les vecteurs d'attaque</h2>
<p>Quatre vecteurs principaux en 2026: <strong>(1) brute force</strong> sur wp-login.php (35% des attaques), <strong>(2) exploits plugins obsoletes</strong> (28%), <strong>(3) injection SQL et XSS</strong> (15%), <strong>(4) supply chain</strong> via plugins nulled ou themes pirates (12%). Le reste se repartit en SEO spam, defacing, crypto-mining injecte.</p>

<h2>2. Mesure 1: changer l'URL de login</h2>
<p>Plugin: <strong>WPS Hide Login</strong> (gratuit). Changez <code>wp-admin</code> en URL custom type <code>/x7f2-admin-2026</code>. Reduction immediate de 80% des tentatives de brute force, car les bots ne trouvent plus la porte d'entree.</p>

<h2>3. Mesure 2: limiter les tentatives de connexion</h2>
<p>Wordfence Free le fait. Configurez: 3 tentatives autorisees par IP, blocage IP pendant 4 heures apres echec, blocage permanent apres 8 echecs en 30 jours. Activez l'alerte email a l'admin sur chaque blocage permanent.</p>

<h2>4. Mesure 3: 2FA obligatoire pour les admins</h2>
<p>Plugin: <strong>Two Factor</strong> (officiel, gratuit) ou WP 2FA (Solid Security). Imposez le 2FA via Google Authenticator, Authy ou Yubikey sur tous les comptes admin et editeur. Mots de passe seuls = obsoletes en 2026.</p>

<h2>5. Mesure 4: roles et permissions strictes</h2>
<p>Reglez le role par defaut sur <strong>Abonne</strong> (Reglages > General). N'attribuez le role Admin qu'a 1 ou 2 personnes. Pour les redacteurs, role Auteur. Pour les contributeurs externes, role Contributeur. Plugin User Role Editor pour creer des roles intermediaires (ex: SEO peut modifier meta mais pas plugins).</p>

<h2>6. Mesure 5: desactiver l'editeur de code</h2>
<p>Dans wp-config.php: <code>define('DISALLOW_FILE_EDIT', true);</code>. Cela bloque l'acces a l'editeur de themes/plugins dans l'admin. Un attaquant qui compromettrait un compte admin ne pourra plus injecter directement du PHP via l'interface.</p>

<h2>7. Mesure 6: bloquer XML-RPC</h2>
<p>XML-RPC est l'API legacy de WordPress, utilisee par Jetpack et l'app mobile. Si vous ne l'utilisez pas, bloquez-la via .htaccess: <code>&lt;Files xmlrpc.php&gt; deny from all &lt;/Files&gt;</code>. Cela elimine un vecteur classique d'amplification brute force.</p>

<h2>8. Mesure 7: WAF (Web Application Firewall)</h2>
<p>Cloudflare gratuit fournit un WAF basique. Cloudflare Pro (25 USD/mois) ajoute des regles managees pour CMS. Wordfence Premium est un WAF applicatif. Combinez les deux: Cloudflare au bord (filtre 80% du trafic malveillant) + Wordfence interne (filtre les attaques applicatives passees).</p>

<h2>9. Mesure 8: mises a jour automatiques mineures</h2>
<p>Dans wp-config.php: <code>define('WP_AUTO_UPDATE_CORE', 'minor');</code>. Les mises a jour de securite (5.9.1, 5.9.2) s'installent automatiquement. Pour les versions majeures et les plugins, mises a jour manuelles apres backup et test sur staging.</p>

<h2>10. Mesure 9: monitoring d'integrite</h2>
<p>Wordfence scan quotidien des fichiers core, theme et plugins, alerte si modification non autorisee. Plugin Sucuri Security scan a distance. Pour les sites critiques, MalCare ou Patchstack en complement.</p>

<h2>11. Mesure 10: protection contre SQL injection</h2>
<p>WordPress core est generalement safe via $wpdb->prepare(), mais les plugins tiers sont une source frequente de vulnerabilites. Verifiez sur <strong>patchstack.com/database</strong> que vos plugins n'ont pas de CVE actif. Wordfence WAF bloque les patterns SQLi automatises.</p>

<h2>12. Mesure 11: HTTPS et HSTS</h2>
<p>HTTPS obligatoire via Let's Encrypt. Ajoutez un header HSTS via .htaccess: <code>Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"</code>. Soumettez votre domaine a hstspreload.org pour etre dans la liste preload navigateurs.</p>

<h2>13. Mesure 12: backups quotidiens hors-site</h2>
<p>UpdraftPlus configure pour backup quotidien vers Google Drive ou S3, retention 14 jours. <strong>Test de restauration trimestriel obligatoire</strong>. Une sauvegarde non testee n'existe pas. Documentez le runbook de restauration en 1 page.</p>

<h2>FAQ</h2>
<p><strong>Faut-il un audit penetration test?</strong> Sur les sites bancaires/sante/legal oui, comptez 3 000 a 8 000 EUR/an. Pour PME standard, le hardening + monitoring suffit.</p>
<p><strong>Que faire en cas de piratage?</strong> Isoler (mode maintenance), backup forensic, restaurer depuis sauvegarde saine, identifier la faille (changelog), patcher, changer tous les mots de passe et cles secretes.</p>
<p><strong>Combien coute une securisation pro?</strong> 800 a 2 500 EUR en one-shot pour le hardening complet + 80 a 200 EUR/mois en monitoring.</p>

<p>Pour un audit securite complet de votre WordPress, prenez un <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous</a> avec nos consultants Pirabel Labs.</p>"""},
        ],
    },
    {
        'title': 'Performance et securite',
        'objective': "L'apprenant maitrisera l'optimisation Core Web Vitals, atteindra un score Lighthouse 90+, durcira WordPress aux standards 2026 et configurera un CDN gratuit pour servir tous les marches.",
        'duration': 200,
        'lessons': [
            {'title': "Performance : optimiser le LCP, FID, CLS",
             'duration': 24,
             'content_html': """<p>Les Core Web Vitals decident desormais 30% du classement SEO de Google et 100% de la satisfaction utilisateur. Sur 1 000 sites WordPress audites par Pirabel Labs en 2024-2025, 73% etaient en categorie Poor sur mobile. Pourtant, atteindre les seuils Good ne demande pas de refondre: 6 leviers bien actionnes suffisent. Cette lecon detaille la methode complete d'optimisation LCP, FID/INP et CLS sur WordPress 2026, avec les outils, les seuils a respecter et les pieges techniques recurrents.</p>

<h2>1. Les 3 metriques Core Web Vitals 2026</h2>
<ul>
<li><strong>LCP (Largest Contentful Paint)</strong>: temps avant que le plus gros element au-dessus du fold soit visible. Seuil Good: < 2.5s, Needs Improvement: 2.5-4s, Poor: > 4s</li>
<li><strong>INP (Interaction to Next Paint)</strong>: remplacant officiel du FID depuis mars 2024. Mesure la reactivite UI. Good: < 200 ms, Poor: > 500 ms</li>
<li><strong>CLS (Cumulative Layout Shift)</strong>: stabilite visuelle de la page. Good: < 0.1, Poor: > 0.25</li>
</ul>

<h2>2. Mesurer correctement</h2>
<p>Deux sources de verite: <strong>(a) Search Console > Core Web Vitals</strong> qui agrege les donnees CrUX reelles sur 28 jours glissants (la seule qui compte pour le SEO), <strong>(b) PageSpeed Insights</strong> pour le diagnostic page par page. Ignorez les outils synthetiques qui ne refletent pas l'experience utilisateur reelle. Pour les diagnostics avances: WebPageTest avec localisation Dakar, Abidjan ou Casablanca pour vos audiences africaines.</p>

<h2>3. Optimisation LCP: 5 leviers</h2>
<ul>
<li><strong>Heberger en proximite</strong> (CDN edge): -200 a -400 ms</li>
<li><strong>Cache page</strong> (WP Rocket, LiteSpeed): -800 a -2 000 ms</li>
<li><strong>Compression images WebP/AVIF</strong> + preload de l'image LCP: -300 a -800 ms</li>
<li><strong>Suppression du render-blocking CSS</strong> au-dessus du fold: -400 a -800 ms</li>
<li><strong>HTTP/2 ou HTTP/3 obligatoire</strong>: -100 a -300 ms vs HTTP/1.1</li>
</ul>

<h2>4. Optimisation INP: la guerre au JavaScript</h2>
<p>INP est tue par les scripts tiers lourds: Google Tag Manager mal configure, pixels Meta/TikTok, widgets chat. <strong>Reglements 2026</strong>: charger les scripts tiers en deferred ou apres l'evenement load, utiliser GTM Server-Side pour reduire les requetes client, retarder le chargement des widgets chat (Intercom, Crisp) de 5 a 10 secondes via WP Rocket "Delay JavaScript Execution".</p>

<h2>5. Optimisation CLS: stabilite visuelle</h2>
<p>CLS catastrophique = bandeau cookies qui apparait apres 800 ms en poussant tout vers le bas, image sans dimensions explicites, fonts qui swap brutalement, pubs AdSense qui s'inserent. <strong>Solutions</strong>: declarer width/height sur toutes les images, utiliser font-display: swap avec font-size-adjust, reserver l'espace bandeau cookies avec position: fixed.</p>

<h2>6. WP Rocket configuration optimale</h2>
<p>Onglets a configurer dans l'ordre: <strong>File Optimization</strong> (Minify CSS, Combine CSS si HTTP/1.1, Remove Unused CSS via Premium, Minify JS, Defer JS sauf jQuery, Delay JS si compatible), <strong>Media</strong> (Lazy load images sauf hero, Lazy load iframes, Replace YouTube par image preview), <strong>Preload</strong> (Activate preload, Preload XML sitemap, Preload links on hover), <strong>Database</strong> (Cleanup mensuel automatique).</p>

<h2>7. Outils complementaires</h2>
<p><strong>Perfmatters</strong> (24.95 USD/an): disable WP features inutiles (emojis, embeds, dashicons sur front), local hosting Google Fonts, script manager pour disabler plugins par page. <strong>Autoptimize</strong> (gratuit): alternative open source mais moins polie que WP Rocket. <strong>FlyingPress</strong> (60 USD/an): rival serieux a WP Rocket sur les performance front-end.</p>

<h2>8. Hebergement et performance</h2>
<p>Pas d'optimisation logicielle ne compensera un hebergement nul. Si votre TTFB > 600 ms apres optimisation cache, le probleme est cote serveur. Migrez sur Kinsta (35 EUR/mois), WP Engine ou Cloudways. Sur les marches francophones, o2switch reste un bon compromis qualite/prix en mutualise (5 EUR/mois pour des sites de < 20 000 visites/mois).</p>

<h2>9. Suivi continu</h2>
<p>Configurez Google Search Console > Core Web Vitals en alerte hebdomadaire. Tout changement majeur (+10%) merite une investigation. Plugins type Real User Monitoring (Cloudflare Web Analytics gratuit, Akamai mPulse payant) donnent une vision continue.</p>

<h2>FAQ</h2>
<p><strong>Combien coute une optimisation pro?</strong> 1 500 a 4 500 EUR pour passer un site PME de Poor a Good sur les 3 metriques. ROI souvent < 6 mois via gain SEO et conversion.</p>
<p><strong>Mon LCP est bon en lab mais mauvais en real user?</strong> CDN absent ou audience geographique distante. Activez Cloudflare ou Bunny pour servir en edge.</p>
<p><strong>WP Rocket vs LiteSpeed?</strong> LiteSpeed si hebergeur LSCWS, WP Rocket sinon. Les deux atteignent les memes scores avec config correcte.</p>

<p>Pour un audit Core Web Vitals personnalise, demandez un <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous</a> avec Pirabel Labs.</p>"""},

            {'title': "Audit Lighthouse Mobile : objectif 90+",
             'duration': 24,
             'content_html': """<p>Atteindre un score Lighthouse 90+ sur mobile est devenu le standard de fait pour les sites professionnels en 2026. Google y prete attention dans son evaluation E-E-A-T, les directions marketing en font un KPI de qualite, et les clients exigeants verifient avant signature. Cette lecon vous donne la methodologie d'audit Lighthouse en 30 minutes, page par page, avec les actions correctives par categorie de score perdu et les seuils de declenchement.</p>

<h2>1. Lighthouse: les 4 dimensions</h2>
<ul>
<li><strong>Performance</strong> (40% du score): vitesse de chargement et metriques techniques</li>
<li><strong>Accessibilite</strong> (10%): conformite WCAG, contraste, alt texts, navigation clavier</li>
<li><strong>Best Practices</strong> (15%): HTTPS, console errors, deprecated APIs</li>
<li><strong>SEO</strong> (35%): title, meta description, robots, viewport, structured data basique</li>
</ul>

<h2>2. Lancer l'audit</h2>
<p>Trois methodes: <strong>(a) Chrome DevTools > onglet Lighthouse</strong>, choisir Mobile + toutes les categories, generer le rapport, <strong>(b) PageSpeed Insights</strong> sur web.dev/measure, <strong>(c) CLI npm install -g @lhci/cli</strong> pour automatiser en CI/CD. Pour un audit credible, lancez 3 fois par URL et prenez la mediane (les scores varient de +/-5 entre runs).</p>

<h2>3. Performance: les 10 actions communes</h2>
<ul>
<li>Activer cache HTTP (max-age 1 an pour assets statiques)</li>
<li>Activer compression Brotli ou Gzip</li>
<li>Minifier CSS, JS, HTML</li>
<li>Eliminer render-blocking resources via defer/async</li>
<li>Servir images WebP/AVIF</li>
<li>Preconnect aux origines tierces critiques (fonts, analytics)</li>
<li>Lazy load images en dessous du fold</li>
<li>Defer iframes (YouTube embed)</li>
<li>Reduire l'utilisation de JavaScript tiers</li>
<li>Eviter les redirections multiples</li>
</ul>

<h2>4. Accessibilite: les corrections rapides</h2>
<p>Lighthouse signale typiquement: <strong>contrast insufficient</strong> (texte gris clair sur fond blanc, fix: assombrir le gris a #595959 minimum), <strong>image-alt missing</strong> (ajouter alt sur toutes les images informatives, alt="" sur images decoratives), <strong>label missing</strong> sur form inputs (ajouter label associes), <strong>tap targets too small</strong> (boutons mobiles min 48x48 px), <strong>language attribute missing</strong> (verifier <code>&lt;html lang="fr"&gt;</code>).</p>

<h2>5. Best Practices: les pieges</h2>
<p>Bug recurrent: <strong>"Includes front-end JavaScript libraries with known security vulnerabilities"</strong>: souvent un jQuery 1.x ou une vieille version de moment.js. Mettre a jour vers les dernieres versions stables. <strong>"Browser errors logged to the console"</strong>: ouvrir DevTools > Console, identifier les scripts qui throw, corriger ou retirer.</p>

<h2>6. SEO Lighthouse: 100% atteignable rapidement</h2>
<p>Verifier: title present et < 60 caracteres, meta description present et < 160 caracteres, hreflang correct si multilingue, robots.txt accessible, sitemap.xml accessible et liste dans robots, viewport meta tag present. Rank Math ou Yoast couvrent 90% automatiquement.</p>

<h2>7. Strategie 30/30/30 pour atteindre 90+</h2>
<p>Decoupez l'optimisation en 3 sessions de 30 minutes: <strong>Session 1</strong> performance (cache + compression + images), <strong>Session 2</strong> accessibilite + best practices (contrast + alt + console errors), <strong>Session 3</strong> SEO + verifications finales (relance audit 3 fois, mediane). Avec cette discipline, 80% des sites WordPress peuvent passer de 55 a 90+ en 90 minutes effectives.</p>

<h2>8. Suivi automatise</h2>
<p>Pour les sites strategiques, installez <strong>Lighthouse CI</strong> dans GitHub Actions ou GitLab CI: l'audit se lance a chaque deploiement, le build casse si le score descend de plus de 5 points. Alternative SaaS: <strong>SpeedCurve, DebugBear, Treo.sh</strong> pour monitoring continu avec alertes.</p>

<h2>9. Audit pour le marche africain</h2>
<p>Lighthouse simule un mobile mid-range avec connexion 4G a 1.6 Mbps. Sur les marches ouest-africains avec 3G dominant a 600 Kbps, multipliez les temps de chargement par 2 a 3. Si vous visez ces marches, fixez vos seuils internes plus stricts: LCP < 2 secondes, CLS < 0.05, total page weight < 500 ko.</p>

<h2>FAQ</h2>
<p><strong>Le score Lighthouse impacte-t-il le SEO?</strong> Indirectement via Core Web Vitals (LCP, INP, CLS issus de Lighthouse). Le score global n'est pas un facteur, mais ses composantes le sont.</p>
<p><strong>Pourquoi mon score change d'un test a l'autre?</strong> Variabilite reseau + CPU. Toujours faire 3 runs et prendre la mediane.</p>
<p><strong>Atteindre 100 partout est-il realiste?</strong> 100/100/100/100 est tres difficile sur sites WordPress avec analytics. 95+/100/100/100 est l'objectif raisonnable.</p>

<p>Pour un audit Lighthouse mensuel automatise, demandez votre <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous</a>.</p>"""},

            {'title': "Hardening securite : 2FA, captcha, audit logs",
             'duration': 24,
             'content_html': """<p>Le hardening avance va au-dela des plugins de securite generiques: il s'agit de poser plusieurs couches defensives independantes (defense en profondeur), de tracer chaque action sensible et de bloquer les bots automatises avant qu'ils n'atteignent l'application. Cette lecon detaille les 8 mesures de hardening avance que nous deployons chez Pirabel Labs sur les sites WordPress critiques (e-commerce, B2B SaaS, sites gouvernementaux et financiers).</p>

<h2>1. 2FA obligatoire et methode forte</h2>
<p>Trois methodes par ordre de robustesse: <strong>(1) cle physique Yubikey/Solokey</strong> (FIDO2/WebAuthn), <strong>(2) TOTP via Google Authenticator/Authy</strong>, <strong>(3) SMS</strong> (deconseille car SIM swap possible). Sur WordPress: plugin <strong>Two Factor</strong> (officiel WP team) supporte les trois. Imposez 2FA pour tous les roles Administrator et Editor. Configurez la possibilite de cles de recuperation imprimables.</p>

<h2>2. Captcha invisible</h2>
<p>Bannissez ReCAPTCHA v2 (cases "Je ne suis pas un robot": ergonomie pesante). Adoptez <strong>Cloudflare Turnstile</strong> (gratuit, sans cookies, respect RGPD natif) ou <strong>hCaptcha</strong> (gratuit pour usage modeste). Integration via plugin "Turnstile for WordPress" ou directement dans Fluent Forms. Activez sur: login, register, password reset, formulaires contact, commentaires.</p>

<h2>3. Audit logs detailles</h2>
<p>Plugin <strong>WP Activity Log</strong> (Premium 99 USD/an): log tous les evenements WordPress avec metadata complete (user, IP, useragent, timestamp UTC). Activites tracees critiques: login success/fail, modification users/roles, install/activate/deactivate plugins, modification options globales, modifications htaccess/wp-config, modifications de fichiers via SFTP detectees. Export CSV mensuel pour conformite RGPD.</p>

<h2>4. Alerting temps reel</h2>
<p>Configurez des alertes immediates par email ou Slack via WP Activity Log: nouvelle creation admin, blocage Wordfence, tentatives brute force > 50/heure, modification de fichier core, mise a jour echouee. Reception en < 5 minutes apres evenement pour reaction rapide.</p>

<h2>5. Geo-blocking strategique</h2>
<p>Si votre business est exclusivement francophone Afrique-France, bloquez les IPs venant de pays sources d'attaques: Russie, Chine, Vietnam, Iran. Cloudflare gratuit propose un Firewall Rule "Block by country" en 30 secondes. Reduction observee des attaques: 60 a 80%. Attention: si vous attendez des visiteurs legitimes de ces pays (presse, partenaires), preferez le challenge captcha plutot que le block.</p>

<h2>6. Disable XML-RPC + REST API publique</h2>
<p>XML-RPC: deja vu, bloquer via htaccess. <strong>REST API</strong>: par defaut publique pour <code>/wp-json/wp/v2/users</code> qui expose la liste des utilisateurs. Plugin "Disable REST API" ou code custom dans functions.php pour restreindre aux utilisateurs authentifies. Verifiez avec <code>curl https://votresite.com/wp-json/wp/v2/users</code>: vous ne devez pas voir les users.</p>

<h2>7. Headers de securite HTTP</h2>
<p>Ajoutez via .htaccess ou Nginx config:</p>
<ul>
<li><code>Strict-Transport-Security: max-age=31536000; includeSubDomains; preload</code></li>
<li><code>X-Content-Type-Options: nosniff</code></li>
<li><code>X-Frame-Options: SAMEORIGIN</code></li>
<li><code>Referrer-Policy: strict-origin-when-cross-origin</code></li>
<li><code>Permissions-Policy: camera=(), microphone=(), geolocation=()</code></li>
<li><code>Content-Security-Policy: default-src 'self'; ...</code> (CSP a calibrer)</li>
</ul>
<p>Verifiez le scoring sur <strong>securityheaders.com</strong>: visez A ou A+.</p>

<h2>8. Hardening fichiers et permissions</h2>
<p>Permissions correctes: <strong>dossiers en 755, fichiers en 644, wp-config.php en 400 ou 440</strong>. Bloquez l'acces direct aux dossiers wp-includes via htaccess. Bloquez l'execution PHP dans wp-content/uploads:</p>
<pre><code>&lt;Directory /uploads&gt;
  &lt;FilesMatch "\\.(php|phtml)$"&gt;
    Deny from all
  &lt;/FilesMatch&gt;
&lt;/Directory&gt;</code></pre>

<h2>9. Pentesting interne</h2>
<p>Au minimum trimestriel: scan via <strong>WPScan</strong> (CLI, gratuit), <strong>Sucuri SiteCheck</strong> (gratuit web), <strong>Patchstack scanner</strong> (audit CVE plugins/themes). Pour sites critiques: pentest professionnel annuel 3 000 a 8 000 EUR.</p>

<h2>10. Runbook de reponse a incident</h2>
<p>Documentez en 1 page: numero de telephone du DPO, procedure isolation (mode maintenance), procedure backup forensic (copie disque avant restauration), procedure restauration, communication clients/utilisateurs/CNIL si breach RGPD, post-mortem. Test annuel "chaos engineering": simulez un piratage et timez votre reaction.</p>

<h2>FAQ</h2>
<p><strong>Combien coute le hardening complet?</strong> 1 500 a 4 000 EUR setup + 80 a 250 EUR/mois en monitoring.</p>
<p><strong>RGPD et logs: combien de temps garder?</strong> 6 a 12 mois pour audit logs, anonymises au-dela.</p>
<p><strong>2FA peut bloquer un admin?</strong> Oui: prevoir une procedure de recovery via SFTP + base de donnees. Documenter.</p>

<p>Demandez un audit hardening complet via notre <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous expert</a>.</p>"""},

            {'title': "Configurer un CDN (Cloudflare) gratuit",
             'duration': 20,
             'content_html': """<p>Cloudflare gratuit est probablement le levier au meilleur ratio benefice/effort de tout l'ecosysteme WordPress en 2026: 30 minutes de configuration, zero euro de cout mensuel, gain immediat de 40 a 70% sur le LCP global, ajout d'un WAF basique, protection DDoS, et SSL gratuit. Cette lecon vous montre la procedure complete d'activation Cloudflare sur un WordPress, avec les options critiques a activer et les pieges qui transforment Cloudflare en source de bugs.</p>

<h2>1. Pourquoi Cloudflare sur WordPress</h2>
<p>Cloudflare est un CDN edge avec 300+ POPs dans le monde, dont Cape Town, Johannesburg, Lagos, Nairobi, Casablanca, Tunis. Pour une audience africaine, cela ramene la latence de 180 ms (Paris vers Cotonou) a 30 ms (Lagos vers Cotonou). Le plan Free inclut: CDN illimite, SSL gratuit, protection DDoS basique, WAF basique avec 5 regles custom, page rules x3, Workers x100k/jour.</p>

<h2>2. Creer un compte et ajouter le site</h2>
<p>Inscription sur <strong>cloudflare.com</strong>, plan Free. Add a Site > entrez votre domaine. Cloudflare scanne automatiquement vos DNS records existants. Verifiez la liste (A, AAAA, CNAME, MX, TXT) et ajustez si necessaire. Important: les MX et TXT email doivent rester en DNS only (nuage gris), pas en proxied (nuage orange), sinon les emails se cassent.</p>

<h2>3. Changer les nameservers</h2>
<p>Cloudflare vous donne 2 nameservers (ex: <code>alex.ns.cloudflare.com, mia.ns.cloudflare.com</code>). Allez chez votre registrar (OVH, Gandi, etc.) et remplacez les nameservers actuels par ceux de Cloudflare. Propagation DNS: 5 minutes a 24 heures (en moyenne 30 minutes en 2026). Verifier la propagation sur <strong>whatsmydns.net</strong>.</p>

<h2>4. SSL/TLS configuration</h2>
<p>Onglet SSL/TLS: mode <strong>Full (strict)</strong> obligatoire si vous avez un certificat valide sur votre serveur (Let's Encrypt). Mode "Flexible" est dangereux car genere des boucles de redirection. Activez "Always Use HTTPS" et "Automatic HTTPS Rewrites" (corrige les URLs http dans le contenu).</p>

<h2>5. Speed > Optimization</h2>
<ul>
<li><strong>Auto Minify</strong>: cocher HTML, CSS, JS (mais si vous utilisez WP Rocket minify, decochez Cloudflare pour eviter le double minify qui casse parfois le JS)</li>
<li><strong>Brotli</strong>: activer (compression 15-25% meilleure que Gzip)</li>
<li><strong>Early Hints</strong>: activer (envoie 103 Early Hints, ameliore LCP)</li>
<li><strong>Rocket Loader</strong>: NE PAS activer sur WordPress (casse souvent jQuery et conflits Elementor)</li>
</ul>

<h2>6. Caching configuration</h2>
<p>Onglet Caching > Configuration: <strong>Caching Level Standard</strong>, <strong>Browser Cache TTL: 1 month</strong>, <strong>Always Online: On</strong> (sert une version cache si origin down). Sur le plan Pro (25 USD/mois), activez <strong>Automatic Platform Optimization for WordPress</strong> (APO): cache des pages HTML complete en edge, gain LCP supplementaire 200-500 ms.</p>

<h2>7. Page Rules essentielles (Free: 3 max)</h2>
<ul>
<li><code>*votresite.com/wp-admin/*</code> > Cache Level: Bypass (jamais cacher l'admin)</li>
<li><code>*votresite.com/wp-login.php*</code> > Cache Level: Bypass + Security Level: High</li>
<li><code>*votresite.com/*</code> > Browser Cache TTL: a month + Cache Level: Standard</li>
</ul>

<h2>8. Firewall et securite</h2>
<p>Onglet Security > WAF: activez les regles managees gratuites (Cloudflare Managed Ruleset basique). Onglet Security > Bots: activez "Bot Fight Mode" gratuit (bloque les bots evidents). Si vous etes attaque, activez temporairement "Under Attack Mode" qui demande un challenge JavaScript a chaque visiteur (utile pour 1 a 4 heures, jamais permanent).</p>

<h2>9. Plugin WordPress Cloudflare officiel</h2>
<p>Installez le plugin Cloudflare officiel. Connectez via API token (scope: Zone:Cache Purge + Zone:Read + Zone Settings:Edit). Utilite: purge automatique du cache Cloudflare quand vous modifiez un post, activation des optimisations WordPress recommandees en 1 clic, dev mode toggle.</p>

<h2>10. Tests et validation</h2>
<p>Apres setup, verifiez: <strong>(a)</strong> headers HTTP via curl: <code>curl -I https://votresite.com</code> doit montrer <code>server: cloudflare</code> et <code>cf-cache-status: HIT</code>, <strong>(b)</strong> PageSpeed Insights: le LCP doit avoir diminue, <strong>(c)</strong> webpagetest.org en localisation Lagos ou Johannesburg pour audience africaine, <strong>(d)</strong> ssllabs.com pour grade SSL A ou A+.</p>

<h2>FAQ</h2>
<p><strong>Cloudflare casse-t-il les formulaires?</strong> Possible si le pays du visiteur est bloque. Verifier les logs Cloudflare Firewall events.</p>
<p><strong>Pro vs Free?</strong> Pro a 25 USD/mois ajoute APO WordPress (gros gain LCP), Image Resizing, WAF avance. Rentable des 30 000 visites/mois.</p>
<p><strong>Mon hebergeur dit que Cloudflare cache leur IP, est-ce un probleme?</strong> Non. Cloudflare expose son IP. Pour avoir l'IP visiteur reelle, activez le module Cloudflare True-Client-IP sur le serveur ou utilisez le plugin Cloudflare WP.</p>

<p>Configuration Cloudflare a deleguer? Demandez un <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous</a> avec Pirabel Labs.</p>"""},
        ],
    },
    {
        'title': 'Lancement SEO et maintenance',
        'objective': "L'apprenant orchestrera la mise en ligne, configurera l'analytics, indexera rapidement, planifiera la maintenance technique et conduira une refonte sans perdre de trafic SEO.",
        'duration': 320,
        'lessons': [
            {'title': "Mise en ligne et configuration DNS",
             'duration': 22,
             'content_html': """<p>La mise en ligne d'un nouveau WordPress est l'un des moments les plus risques du projet: une mauvaise configuration DNS, un certificat mal renouvele, des redirections mal pensees peuvent couter une semaine d'indisponibilite et une chute SEO de 20 a 50%. Cette lecon detaille le runbook complet de mise en ligne tel que Pirabel Labs l'execute sur chaque projet client, avec les controles pre-lancement, le sequencement DNS, les tests post-lancement et les corrections d'urgence si quelque chose casse.</p>

<h2>1. Checklist pre-lancement (J-7)</h2>
<ul>
<li>Toutes les pages contenu finalisees, relues, validees par le client</li>
<li>Mentions legales, politique de confidentialite, CGV, cookies en ligne</li>
<li>Plugins SEO configures (titles, meta, schema, sitemap)</li>
<li>Plugins securite installes (Wordfence, UpdraftPlus, 2FA)</li>
<li>Cache configure (WP Rocket ou LiteSpeed)</li>
<li>Backup pre-launch en place (UpdraftPlus vers cloud)</li>
<li>Decochage "demander aux moteurs de ne pas indexer"</li>
<li>Email transactionnel teste (formulaire contact, password reset)</li>
<li>Test sur 4 devices: iPhone, Android, tablette, desktop</li>
<li>Audit Lighthouse: scores > 80 sur les 4 categories</li>
</ul>

<h2>2. Le DNS en 2026: anatomie</h2>
<p>Quatre enregistrements critiques: <strong>A</strong> (mappe domaine vers IP IPv4), <strong>AAAA</strong> (idem IPv6), <strong>CNAME</strong> (alias, ex: www -> @), <strong>MX</strong> (mail). Plus les <strong>TXT</strong> pour SPF/DKIM/DMARC. Si vous migrez depuis un ancien hebergeur, ne touchez pas les MX tant que la migration email n'est pas planifiee separement (sinon = perte d'emails).</p>

<h2>3. Strategie sans coupure</h2>
<p>Procedure recommandee pour zero downtime: <strong>(1)</strong> sur le nouvel hebergeur, configurer le site complet sous un sous-domaine temporaire (ex: staging.votresite.com), <strong>(2)</strong> tester exhaustivement sur staging, <strong>(3)</strong> reduire le TTL des enregistrements DNS a 5 minutes 24h avant le switch (chez le registrar), <strong>(4)</strong> jour J: changer les A et CNAME pour pointer sur la nouvelle IP, <strong>(5)</strong> surveiller la propagation sur whatsmydns.net, <strong>(6)</strong> remettre TTL a 24h une fois la migration confirmee.</p>

<h2>4. Certificat SSL</h2>
<p>Verifier que le nouvel hebergeur a genere le certificat Let's Encrypt pour <strong>votresite.com</strong> ET <strong>www.votresite.com</strong> AVANT le switch DNS. Sinon, premiere visite = warning HTTPS qui ruine la credibilite. Outils de check: <code>openssl s_client -connect votresite.com:443 -servername votresite.com</code> ou ssllabs.com.</p>

<h2>5. Redirections 301 critiques</h2>
<p>Configurer dans .htaccess (Apache) ou nginx.conf: <strong>(a)</strong> non-www vers www OU www vers non-www (un seul canonical), <strong>(b)</strong> http vers https, <strong>(c)</strong> si refonte avec changements d'URLs: mapping ancienne URL -> nouvelle URL en 301. Outil pour mapping: Screaming Frog + export Excel + plugin Redirection.</p>

<h2>6. Cache et CDN: purge complete</h2>
<p>Apres le switch DNS, purger immediatement: <strong>(a)</strong> cache WordPress (WP Rocket: Settings > Clear Cache), <strong>(b)</strong> cache Cloudflare (Caching > Purge Everything), <strong>(c)</strong> cache du navigateur des admins (Ctrl+Shift+R sur Chrome). Sans purge, vous voyez l'ancien site pendant des heures.</p>

<h2>7. Tests post-lancement (J0 + J+1)</h2>
<ul>
<li>Acceder a https://votresite.com depuis 3 reseaux differents (4G, WiFi pro, WiFi maison)</li>
<li>Soumettre un formulaire contact, verifier reception email</li>
<li>Tester un achat e-commerce de bout en bout si applicable</li>
<li>Verifier sitemap.xml accessible</li>
<li>Verifier robots.txt (pas de Disallow: / oublie depuis dev)</li>
<li>Indexer l'URL principale manuellement dans Search Console</li>
<li>Tester sur Safari iOS, Chrome Android, Edge Windows</li>
<li>Validator W3C HTML sans erreur bloquante</li>
</ul>

<h2>8. Monitoring J+7</h2>
<p>Configurer UptimeRobot (gratuit) ou Better Uptime (9 USD/mois) pour ping toutes les 5 minutes avec alerte email/SMS si down > 2 minutes. Configurer Google Search Console > Performance: surveiller les impressions et clics sur 7 puis 14 jours. Si chute > 15% vs ancien site, investigation immediate.</p>

<h2>9. Communication aux parties prenantes</h2>
<p>Le jour J, envoyer email a: equipe interne, agences partenaires (PR, social), clients VIP. Mentionner: nouvelle URL si change, eventuelles fonctionnalites nouvelles, qui contacter en cas de probleme. Briefer le support client pour gerer les questions des 7 premiers jours.</p>

<h2>FAQ</h2>
<p><strong>Combien de temps prend la propagation DNS?</strong> En 2026, generalement 5-30 minutes pour 95% des FAI mondiaux. 24h pour les retardataires (FAI africains ou asiatiques exotiques).</p>
<p><strong>Faut-il prevenir Google de la migration?</strong> Oui: outil de changement d'adresse dans Search Console si changement de domaine. Pas necessaire si meme domaine.</p>
<p><strong>Combien de temps pour retrouver le SEO apres refonte?</strong> 4 a 12 semaines pour stabilisation. Si chute > 30% qui dure > 6 semaines, audit technique en urgence.</p>

<p>Vous prevoyez une mise en ligne ou une migration? Pirabel Labs accompagne pas a pas. Demandez <a href="/contact">audit gratuit</a> ou <a href="/rendez-vous">RDV</a>.</p>"""},

            {'title': "Setup Google Analytics 4 et Search Console",
             'duration': 22,
             'content_html': """<p>Sans Google Analytics 4 (GA4) et Search Console correctement configures, vous pilotez votre site les yeux bandes. La transition d'Universal Analytics vers GA4, achevee mi-2023, a complique les configurations: nouveau modele de donnees evenementiel, parametres custom, integration BigQuery gratuite. Cette lecon vous donne le setup pro de GA4 et Search Console sur un WordPress 2026, avec les evenements critiques a tracker et les pieges RGPD a eviter sur le marche francophone.</p>

<h2>1. Pourquoi GA4 + Search Console ensemble</h2>
<p>GA4 mesure l'apres-arrivee (comportement, conversion, attribution). Search Console mesure l'avant-arrivee (impressions SERP, requetes, positions, CTR). Sans les deux, vous ne savez ni d'ou viennent les visiteurs ni ce qu'ils font. Les deux sont gratuits et indispensables.</p>

<h2>2. Creer la propriete GA4</h2>
<p>analytics.google.com > Admin > Create Property. Nom de la propriete: "Votresite.com Production". Industrie + taille reporting + monnaie (EUR ou XOF FCFA selon votre business). Data stream: Web > entrer URL > activer enhanced measurement (clicks, scrolls, downloads, video, search). Recuperer le Measurement ID (format <code>G-XXXXXXXXXX</code>).</p>

<h2>3. Integration WordPress: 3 methodes</h2>
<ul>
<li><strong>Plugin Site Kit by Google</strong> (officiel, gratuit): 5 minutes, dashboard integre, idéal debutants</li>
<li><strong>Plugin Google Tag Manager</strong>: GTM dans head, puis configurer GA4 via GTM. Plus de flexibilite, courbe d'apprentissage plus raide. Recommande pro</li>
<li><strong>Code inline dans header.php</strong>: snippet GA4 direct. Le plus rapide mais pas recommande car difficile a desactiver pour cookies RGPD</li>
</ul>

<h2>4. Recommande: GTM + GA4 + cookie consent</h2>
<p>Setup pro:</p>
<ol>
<li>Creer container GTM (tagmanager.google.com)</li>
<li>Installer GTM dans WP via plugin "GTM4WP"</li>
<li>Dans GTM, creer un Tag GA4 Configuration avec le Measurement ID</li>
<li>Trigger: All Pages (mais conditionne au consent)</li>
<li>Installer Complianz ou CookieYes pour gestion consent</li>
<li>Verifier que le tag GA4 ne se declenche qu'apres consent "Analytics"</li>
</ol>

<h2>5. Evenements critiques a tracker</h2>
<ul>
<li><strong>generate_lead</strong>: soumission formulaire contact / devis</li>
<li><strong>sign_up</strong>: inscription newsletter</li>
<li><strong>begin_checkout</strong>: clic sur "passer commande" (e-commerce)</li>
<li><strong>purchase</strong>: transaction validee (e-commerce)</li>
<li><strong>file_download</strong>: telechargement PDF/livre blanc</li>
<li><strong>scroll</strong>: scroll a 50%, 75%, 90% (deja inclus enhanced measurement)</li>
<li><strong>page_view custom</strong> avec parametres: category, author, language</li>
</ul>

<h2>6. Setup Search Console</h2>
<p>search.google.com/search-console > Ajouter une propriete > Domaine (recommande, couvre tous les sous-domaines). Verifier via DNS TXT record chez le registrar. Une fois verifie:</p>
<ul>
<li>Soumettre sitemap (https://votresite.com/sitemap_index.xml)</li>
<li>Verifier Index Coverage: zero erreur critique</li>
<li>Inspecter URLs principales (home, services, blog) > Request Indexing</li>
<li>Configurer "Domain Property" pour audience geographique si besoin</li>
<li>Lier GSC a GA4 (Admin > Search Console Linking)</li>
</ul>

<h2>7. Conformite RGPD</h2>
<p>GA4 par defaut envoie des IPs et IDs vers les serveurs Google US: probleme RGPD majeur en France/UE. Solutions: <strong>(1)</strong> activer "Mask IP Address" dans le Tag GTM, <strong>(2)</strong> activer Consent Mode v2 dans GTM (envoie pings anonymes meme sans consent), <strong>(3)</strong> heberger GTM en server-side via Stape.io ou Cloud Run pour proxifier les donnees, <strong>(4)</strong> alternative: passer a Matomo (alternative europeenne, hebergement local possible).</p>

<h2>8. Specificite africaine</h2>
<p>Au Benin, la loi 2017-20 sur le code du numerique inclut une autorite (APDP) qui s'aligne progressivement sur le RGPD europeen. Les acteurs serieux a Cotonou, Lome, Abidjan implementent deja le consent management. La CINETPay au Senegal a publie en 2024 des guidelines RGPD-like applicables au mobile money.</p>

<h2>9. Dashboard executif Looker Studio</h2>
<p>Connectez GA4 + Search Console a Looker Studio (gratuit) pour creer un dashboard mensuel: sessions, conversions, top pages, top requetes, evolution mensuelle. Modele Pirabel Labs disponible sur demande lors de l'audit.</p>

<h2>FAQ</h2>
<p><strong>GA4 retient les donnees combien de temps?</strong> Par defaut 2 mois, configurable jusqu'a 14 mois (Admin > Data Settings > Data Retention).</p>
<p><strong>Pourquoi mes conversions n'apparaissent pas?</strong> Verifier que l'evenement est marque comme Conversion dans GA4 Admin > Conversions. Sinon il est trace mais pas comptabilise.</p>
<p><strong>Search Console montre 0 impressions, pourquoi?</strong> Soit le site est trop neuf (attendre 3-7 jours), soit la propriete couvre mal le domaine (verifier Domain vs URL prefix property).</p>

<p>Setup GA4 + GSC professionnel a deleguer? Demandez un <a href="/contact">audit gratuit</a> ou un <a href="/rendez-vous">rendez-vous</a>.</p>"""},
        ],
    },
]
