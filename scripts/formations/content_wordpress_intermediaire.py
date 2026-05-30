#!/usr/bin/env python3
"""Contenu detaille formation : WordPress Intermediaire : Elementor, ACF, Custom Post Types."""

WORDPRESS_INTERMEDIAIRE_MODULES = [
    {
        'title': 'Bases et installation',
        'objective': 'Maitriser le choix de la stack, l achat du domaine, l installation WordPress, la configuration des plugins essentiels et la prise en main de l admin.',
        'duration': 240,
        'lessons': [
            {'title': "Choisir entre WordPress, Webflow, Shopify ou code custom",
             'duration': 22,
             'content_html': """<p>Choisir le mauvais CMS au demarrage, c est se condamner a migrer dans 18 mois en perdant du trafic SEO et 3 a 8 000 EUR de refonte. Cette lecon vous donne le cadre de decision qu utilisent les agences web serieuses (Pirabel Labs inclus) pour rediger un audit technique en moins de 90 minutes avant de pousser un client vers WordPress, Webflow, Shopify ou du sur-mesure Next.js.</p>
<p>Le piege le plus courant en 2026 : choisir une plateforme parce qu un influenceur l a recommande sur TikTok. Or chaque outil a un <strong>angle mort</strong> qui se paie cash a 24 mois. Voici la grille de decision a appliquer froidement avant de toucher au moindre fichier.</p>
<h2>1. Les 4 contenders et leur ADN</h2>
<p><strong>WordPress (open source)</strong> represente encore 43,2 % de tous les sites du web et 62 % des CMS en 2026 (source W3Techs). Il est gratuit, extremement flexible grace a 60 000+ plugins, mais il vous engage a maintenir vous-meme la securite et les mises a jour. C est le bon choix des qu il faut un site de plus de 10 pages, un blog SEO, un espace membre, du multilingue ou de la facturation custom.</p>
<p><strong>Webflow</strong> est un constructeur visuel SaaS (29 a 39 USD/mois). Il brille pour les sites vitrine ultra-designes, les landing pages corporate et les startups SaaS. Sa faiblesse : un blog limite, un ecommerce faible et un cout qui explose sur les gros catalogues.</p>
<p><strong>Shopify</strong> reste la reference ecommerce mondiale (32 a 399 USD/mois selon le plan + commissions). Choisissez-le des que vous avez plus de 50 references produits, un volume mensuel superieur a 5 000 EUR ou un besoin de connecter Stripe, mobile money africain (Orange Money, MTN MoMo via Flouci, FedaPay) et un POS physique.</p>
<p><strong>Code custom (Next.js, Astro, Laravel)</strong> n est justifie qu en presence d une logique metier specifique (marketplace, SaaS, app temps reel). Comptez 25 000 a 150 000 EUR de developpement initial et 18 000 EUR/an de maintenance. Aucun PME independante n a besoin de ca avant 2 millions EUR de CA.</p>
<h2>2. La grille de scoring en 7 criteres</h2>
<ol>
<li><strong>Cout total a 3 ans (TCO)</strong> : additionnez licences, hebergement, plugins payants, agence. Pour un site vitrine WordPress, comptez 1 200 a 3 500 EUR. Webflow grimpe a 1 600 a 4 000 EUR. Shopify pour ecommerce serieux : 4 200 a 14 000 EUR.</li>
<li><strong>Autonomie editoriale</strong> : qui mettra a jour le contenu une fois en ligne ? WordPress demande un mini-onboarding de 2h. Webflow Editor est plus intuitif mais limite a 3 editeurs sur le plan CMS.</li>
<li><strong>SEO technique</strong> : WordPress avec Rank Math ou Yoast donne le controle le plus fin sur les balises schema, les hreflang et les redirections. Shopify a longtemps souffert d URLs /collections/.../products/... rigides.</li>
<li><strong>Performance</strong> : Webflow sert via Cloudflare avec LCP < 1,5 s par defaut. WordPress demande une configuration cache (LiteSpeed Cache ou WP Rocket) pour atteindre les memes scores Lighthouse mobile > 90.</li>
<li><strong>Securite</strong> : Webflow et Shopify mutualisent le risque. WordPress vous oblige a installer Wordfence ou Solid Security, plus des sauvegardes UpdraftPlus quotidiennes.</li>
<li><strong>Ecosysteme local</strong> : au Benin, en Cote d Ivoire, au Senegal, trouver un developpeur WordPress senior coute 18 000 a 35 000 FCFA/jour. Trouver un dev Next.js senior coute 80 000 a 150 000 FCFA/jour.</li>
<li><strong>Vendor lock-in</strong> : sortir de WordPress prend 2 jours d export. Sortir de Webflow ou Shopify prend des semaines et casse vos URLs.</li>
</ol>
<h2>3. Trois scenarios concrets pour decider</h2>
<p><strong>Scenario A : avocat en cabinet a Cotonou</strong>. Site vitrine, blog SEO, formulaire de prise de RDV. Verdict : WordPress + Astra + RankMath + WP Forms. TCO 3 ans : 2 100 EUR.</p>
<p><strong>Scenario B : marque de cosmetiques bio a Dakar</strong> qui veut vendre 80 references avec retrait en boutique. Verdict : Shopify plan Basic + theme Sense + apps Judge.me, Klaviyo, FedaPay. TCO 3 ans : 6 800 EUR. Pas WordPress + WooCommerce car la maintenance ecommerce sur WP demande 6h/mois de tracking de bugs.</p>
<p><strong>Scenario C : SaaS B2B francais de gestion RH</strong>. Verdict : Webflow pour le marketing + Next.js pour le produit. Pas de WordPress car les designers du studio bossent en Figma et veulent pixel-perfect, et Webflow est ideal pour le SEO programmatique 80 pages metiers.</p>
<h2>FAQ</h2>
<p><strong>Faut-il choisir Wix ou Squarespace ?</strong></p>
<p>Non, sauf cas freelance creatif avec moins de 5 pages. Wix a un SEO encore en retard de 18 mois sur WordPress en 2026 et Squarespace facture 23 a 65 EUR/mois sans la flexibilite necessaire des qu un client veut un blog avec 200 articles.</p>
<p><strong>Peut-on commencer en WordPress puis passer a Shopify pour l ecommerce ?</strong></p>
<p>Oui, c est meme un pattern recommande : blog WordPress sur le domaine racine + sous-domaine shop.votremarque.com sur Shopify. Vous gardez votre autorite SEO et evitez la dette technique de WooCommerce sur de gros catalogues.</p>
<p><strong>Combien de temps prend la decision initiale ?</strong></p>
<p>90 minutes d audit + 30 minutes de presentation client. Si vous voulez un audit professionnel a froid, reservez un <a href="/rendez-vous">rendez-vous decouverte gratuit</a> avec Pirabel Labs.</p>
<blockquote>Regle d or : choisissez la plateforme la moins exotique qui resout votre probleme. La dette technique se paie en visiteurs perdus, pas en facture immediate.</blockquote>
<p>Pour aller plus loin, demandez votre <a href="/contact">audit gratuit de stack</a>. Nous vous remettrons une recommandation chiffree en 72 heures.</p>
<h2>Annexe : grille de scoring pour decider en 30 minutes</h2>
<p>Imprimez cette grille et notez chaque plateforme de 1 a 5 sur chaque critere, multipliez par le coefficient (en gras). La plus haute note totale gagne.</p>
<ul>
<li><strong>Coefficient 5</strong> : adequation au cas d usage primaire.</li>
<li><strong>Coefficient 4</strong> : autonomie editoriale de l equipe.</li>
<li><strong>Coefficient 3</strong> : TCO 3 ans.</li>
<li><strong>Coefficient 3</strong> : qualite du SEO technique.</li>
<li><strong>Coefficient 2</strong> : ecosysteme local de developpeurs disponibles.</li>
<li><strong>Coefficient 2</strong> : performance par defaut (LCP, INP).</li>
<li><strong>Coefficient 2</strong> : maturite securite.</li>
<li><strong>Coefficient 1</strong> : risque de lock-in vendor.</li>
</ul>
<p>Cette grille vous aide a sortir des choix emotionnels (j adore Webflow car j ai vu une video TikTok) pour basculer sur du factuel. Pirabel Labs l applique systematiquement avant tout devis de creation de site.</p>"""},
            {'title': "Acheter un nom de domaine et configurer l'hebergement",
             'duration': 20,
             'content_html': """<p>Le choix du nom de domaine et de l hebergeur conditionne 18 mois de vitesse, de securite et de positionnement SEO. Une mauvaise decision ici coute en moyenne 700 EUR de migration plus 4 a 12 semaines de perte de trafic organique. Cette lecon vous guide pas a pas, du Whois au DNS, en passant par les criteres techniques que la majorite des freelances ignorent.</p>
<h2>1. Choisir un nom de domaine qui ne vous trahira pas</h2>
<p>En 2026, les six criteres a respecter sont les suivants. <strong>Courtaure</strong> : 6 a 14 caracteres maximum, prononcable a l oral. <strong>Memorabilite</strong> : pas de tirets, pas de chiffres a la place des lettres (le fameux "2" pour "to"). <strong>Extension</strong> : .com en priorite mondiale, .fr pour la France, .bj pour le Benin, .ci pour la Cote d Ivoire, .africa pour une presence continentale. <strong>Trademark check</strong> via INPI (France), OAPI (Afrique francophone) ou USPTO (US) avant d acheter. <strong>Disponibilite sociale</strong> : verifiez Instagram, TikTok, LinkedIn avec Namechk.com. <strong>Historique</strong> : ouvrez Wayback Machine et Ahrefs Site Explorer pour eviter de racheter un domaine penalise Google.</p>
<p>Tarifs reels en mai 2026 chez les bons registrars : .com 11 EUR/an chez OVH, 12 EUR chez Gandi, 13 EUR chez Porkbun. Evitez GoDaddy dont les renouvellements grimpent a 22 EUR apres la premiere annee et qui pratique l upselling agressif.</p>
<h2>2. Activer le DNSSEC et la confidentialite Whois</h2>
<p>Le DNSSEC signe vos enregistrements DNS et empeche un attaquant de detourner le trafic vers un faux site. Activable en un clic chez OVH (DNSSEC > Activer dans la console). La confidentialite Whois (gratuite chez Gandi et OVH, payante 8 EUR/an chez d autres) masque vos coordonnees personnelles dans la base publique pour eviter le spam et le doxing.</p>
<h2>3. Choisir l hebergement en 2026 selon la charge prevue</h2>
<p>Trois cas de figure dominent.</p>
<ol>
<li><strong>Site vitrine ou petit blog (moins de 10 000 visiteurs/mois)</strong> : Hostinger Premium (3,99 EUR/mois en promo, 11,99 EUR ensuite) ou IONOS Business (1 EUR le premier mois, 9 EUR ensuite). Stockage 100 Go SSD, LiteSpeed, certificat SSL gratuit. Suffisant pour 95 % des cas PME.</li>
<li><strong>Site moyen (10 000 a 80 000 visiteurs/mois)</strong> : O2switch (7 EUR/mois) ou WP Engine Startup (24 USD/mois) ou Kinsta Starter (35 USD/mois). Vous payez la stack managee : sauvegardes automatiques, staging integre, cache serveur, support 24/7 specialise WordPress.</li>
<li><strong>Site lourd (plus de 100 000 visiteurs/mois) ou ecommerce</strong> : Kinsta Pro (60-115 USD/mois), Cloudways DigitalOcean (28-50 USD/mois) ou serveur VPS dedie OVH Performance (40-80 EUR/mois) avec stack Cloudpanel ou RunCloud.</li>
</ol>
<p>Pour l Afrique francophone, ajoutez systematiquement Cloudflare gratuit en front : la latence depuis Cotonou, Abidjan ou Yaounde vers Paris passe de 350 ms a 60 ms grace au POP de Lagos.</p>
<h2>4. Pointer le domaine vers l hebergeur en 4 etapes</h2>
<ol>
<li>Recuperez les nameservers (NS) de votre hebergeur, generalement de la forme ns1.hebergeur.com et ns2.hebergeur.com.</li>
<li>Dans la console de votre registrar (OVH, Gandi), allez dans la section DNS > Serveurs DNS.</li>
<li>Remplacez les NS par defaut par ceux de l hebergeur. Sauvegardez.</li>
<li>Patientez 2 a 24 heures pour la propagation DNS mondiale. Verifiez avec <code>dig votredomaine.com</code> ou whatsmydns.net.</li>
</ol>
<p>Astuce : si vous gardez vos emails ailleurs (Google Workspace, Zoho), n oubliez surtout pas de recopier vos enregistrements MX, SPF, DKIM et DMARC avant de changer les NS. Sinon vos emails s arretent immediatement et vous le decouvrirez le lendemain par un client furieux.</p>
<h2>5. Activer le SSL et forcer le HTTPS</h2>
<p>Tous les hebergeurs serieux fournissent Let s Encrypt gratuit en un clic. Une fois actif, allez dans WordPress > Reglages > General et changez l URL en https://. Installez Really Simple SSL ou ajoutez la regle de redirection 301 dans le .htaccess pour forcer tout le trafic HTTP vers HTTPS.</p>
<h2>FAQ</h2>
<p><strong>Faut-il un .com ou un .fr / .bj quand on cible la France et le Benin ?</strong></p>
<p>Si votre clientele est exclusivement nationale, prenez le ccTLD national : Google donne un signal local fort. Si vous visez plusieurs pays francophones ou l international, prenez le .com et utilisez hreflang pour les versions linguistiques.</p>
<p><strong>Vaut-il mieux un hebergement mutualise ou un VPS pour debuter ?</strong></p>
<p>Mutualise sans hesitation jusqu a 30 000 visiteurs/mois. Le VPS demande des competences sysadmin (mises a jour OS, securisation SSH, fail2ban) que vous n avez pas envie de gerer la premiere annee.</p>
<p><strong>Comment migrer d un hebergeur a un autre sans coupure ?</strong></p>
<p>Plugin All-in-One WP Migration pour exporter, deployez la copie chez le nouveau hebergeur sur un sous-domaine de test, validez tout, baissez le TTL DNS a 300 secondes 48h avant, basculez les NS le matin tot. Coupure utilisateur : 5 a 30 minutes.</p>
<blockquote>L hebergeur le moins cher coute toujours plus cher que l hebergeur le mieux choisi. Ne choisissez pas a 2 EUR pres.</blockquote>
<p>Besoin d aide pour choisir et migrer ? Reservez un <a href="/rendez-vous">audit infra gratuit</a> avec un expert Pirabel Labs.</p>
<h2>Annexe : check-list complete domaine + hebergement</h2>
<ol>
<li>Choix nom de domaine : 6-14 chars, prononcable, .com ou ccTLD national.</li>
<li>Verification trademark (INPI / OAPI / USPTO).</li>
<li>Verification historique (Wayback + Ahrefs).</li>
<li>Achat chez registrar serieux (OVH, Gandi, Porkbun).</li>
<li>Activation DNSSEC.</li>
<li>Activation Whois Privacy.</li>
<li>Choix hebergement adapte (mutualise / managed / VPS).</li>
<li>Activation SSL Let s Encrypt.</li>
<li>Configuration des enregistrements DNS (A, MX, TXT, CNAME).</li>
<li>Test propagation DNS (dig + whatsmydns.net).</li>
<li>Force HTTPS via .htaccess ou Cloudflare.</li>
<li>Recopier les MX emails AVANT bascule NS.</li>
<li>Tester l envoi/reception email apres bascule.</li>
<li>Monitor uptime via UptimeRobot.</li>
<li>Documenter tous les credentials dans Bitwarden.</li>
</ol>
<p>Cette checklist suit la methodologie ITIL adaptee aux PME africaines et francaises. Elle evite 90 % des incidents domaine/DNS lors d un lancement de site.</p>"""},
            {'title': "Installer WordPress en moins de 15 minutes",
             'duration': 18,
             'content_html': """<p>L installation WordPress n a jamais ete aussi rapide qu en 2026 : 12 a 15 minutes chrono d un domaine vierge a un site accessible en ligne avec un theme propre. Encore faut-il suivre la bonne procedure, sans installer des plugins parasites des le depart, et en posant les bons reglages techniques qui vous epargneront 6 mois de bugs SEO et de failles de securite.</p>
<h2>1. Verifier les pre-requis serveur</h2>
<p>WordPress 6.7 (la version courante mi-2026) exige PHP 8.2 ou 8.3, MySQL 8.0 ou MariaDB 10.6, HTTPS actif, memoire PHP de 256 Mo minimum et la fonction <code>opcache</code> activee. Connectez-vous a votre cPanel ou tableau de bord d hebergement (Hostinger hPanel, IONOS, Kinsta MyKinsta) et verifiez ces parametres. Sur cPanel : MultiPHP Manager pour la version PHP, PHP Selector pour les modules.</p>
<p>Astuce 2026 : exigez explicitement PHP 8.3 plutot que 8.1. La performance par requete est 12 a 17 % superieure sur WordPress + WooCommerce selon les benchmarks Kinsta.</p>
<h2>2. Deux methodes d installation</h2>
<p><strong>Methode A : auto-installer one-click</strong>. Tous les hebergeurs mutualises proposent Softaculous ou un installeur maison. Cherchez WordPress, cliquez Install, remplissez : URL https://votredomaine.com (sans /wp), nom du site, identifiant admin <em>different de "admin"</em> (genre "gildas-admin-2026"), mot de passe genere par Bitwarden ou 1Password (24 caracteres minimum), email admin sur un domaine que vous controlez (pas Gmail).</p>
<p><strong>Methode B : installation manuelle</strong>. Telechargez wordpress.org/latest.zip, decompressez, uploadez via FTP (FileZilla) ou SSH (commande <code>scp</code>) dans le dossier <code>public_html</code> ou <code>www</code> de votre hebergeur. Creez une base de donnees MySQL via phpMyAdmin avec un nom, un utilisateur et un mot de passe forts. Lancez l URL https://votredomaine.com/wp-admin/install.php et remplissez le formulaire.</p>
<p>La methode manuelle prend 18 a 25 minutes mais vous permet de modifier <code>wp-config.php</code> avant la premiere connexion pour ajouter les cles de securite (Salts), forcer SSL admin et changer le prefixe de table SQL de <code>wp_</code> vers <code>wp_x7k2_</code> qui bloque automatiquement 80 % des bots SQL injection.</p>
<h2>3. Les 8 reglages a faire dans les 5 minutes apres installation</h2>
<ol>
<li><strong>Reglages > General</strong> : verifiez langue francaise, fuseau horaire (Africa/Porto-Novo pour le Benin), format date jour/mois/annee.</li>
<li><strong>Reglages > Lecture</strong> : decochez "demander aux moteurs de recherche de ne pas indexer ce site" (cocher temporairement si vous bossez encore sur le site).</li>
<li><strong>Reglages > Permaliens</strong> : choisissez "Nom de l article" (URL en /mon-article/). Ne changez plus jamais ce reglage apres lancement sans rediriger les anciennes URLs.</li>
<li><strong>Reglages > Discussion</strong> : decochez "Autoriser les notifications de liens depuis d autres blogs" pour bloquer le spam de pingbacks.</li>
<li><strong>Utilisateurs > Profil</strong> : ajoutez votre nom complet, votre bio, un Gravatar pour l auteur des articles.</li>
<li><strong>Outils > Sante du site</strong> : verifiez qu il n y a aucune alerte critique.</li>
<li>Supprimez les themes par defaut inutilises (gardez seulement Twenty Twenty-Four en backup et votre theme actif).</li>
<li>Supprimez les plugins Hello Dolly et Akismet si vous n utilisez pas Akismet.</li>
</ol>
<h2>4. Premier login et changement immediat du mot de passe</h2>
<p>Si vous avez utilise une auto-install, le mot de passe genere est probablement faible. Allez dans Utilisateurs > Tous, modifier votre profil, generer un nouveau mot de passe via le bouton WordPress + sauvegarder dans Bitwarden. Activez ensuite la 2FA via WP 2FA ou Wordfence Login Security : authenticator (Authy, Google Authenticator) plutot que SMS.</p>
<h2>5. Activer les sauvegardes des le jour 1</h2>
<p>Installez UpdraftPlus (gratuit), configurez une sauvegarde quotidienne fichiers + base de donnees vers Google Drive ou Backblaze B2 (5 USD/mois pour 1 To). Sans sauvegarde, une seule attaque ou un seul plugin foireux peut vous couter le site entier le mois 2.</p>
<h2>FAQ</h2>
<p><strong>Faut-il installer WordPress.com ou WordPress.org ?</strong></p>
<p>WordPress.org auto-heberge dans 95 % des cas. WordPress.com (l offre payante de Automattic) n a de sens que pour les blogueurs solo qui veulent zero technique et acceptent les limitations plugins et theme.</p>
<p><strong>Doit-on installer en sous-dossier /wp/ ou a la racine ?</strong></p>
<p>A la racine du domaine pour 99 % des cas. Le sous-dossier ne se justifie que si vous avez une appli custom qui vit deja sur le domaine racine.</p>
<p><strong>Quel est le piege classique de la premiere installation ?</strong></p>
<p>Garder "admin" comme identifiant et un mot de passe faible. Resultat : 200 a 800 tentatives de brute force par jour des la premiere semaine. Wordfence vous alertera mais le site rame inutilement.</p>
<blockquote>Une installation WordPress propre evite 80 % des problemes qui surgissent au mois 3. Ne brulez pas les etapes.</blockquote>
<p>Vous voulez une installation WordPress professionnelle livree cle en main ? <a href="/contact">Demandez un devis</a> ou prenez un <a href="/rendez-vous">RDV decouverte gratuit</a>.</p>
<h2>Annexe : 15 erreurs frequentes lors de la 1ere installation</h2>
<ol>
<li>Garder l identifiant "admin" par defaut.</li>
<li>Mot de passe faible (12345, motdepasse, prenom123).</li>
<li>Email admin sur Gmail au lieu d un domaine controle.</li>
<li>Oublier de cocher SSL durant l auto-install.</li>
<li>Garder le prefixe DB wp_ par defaut (vulnerabilite SQL injection).</li>
<li>Oublier d activer les sauvegardes des le jour 1.</li>
<li>Cocher "decourager les moteurs de recherche" et oublier de decocher.</li>
<li>Garder les permaliens "Default" (?p=123) au lieu de "Nom de l article".</li>
<li>Installer 30 plugins inutiles des la premiere semaine.</li>
<li>Activer Wordfence apres avoir deja ete hacke.</li>
<li>Negliger la configuration du fuseau horaire (Africa/Porto-Novo, Europe/Paris).</li>
<li>Ne pas creer de child theme et modifier directement le parent.</li>
<li>Oublier de configurer le Gravatar pour l auteur des articles.</li>
<li>Ne pas activer 2FA des le jour 1.</li>
<li>Ne pas tester un envoi email via WP Mail SMTP (formulaires casses).</li>
</ol>
<p>Eviter ces 15 erreurs vous fait gagner 30 a 60 jours de bugs et de support technique sur la duree de vie du site.</p>"""},
            {'title': "Configurer les plugins essentiels (SEO, cache, securite)",
             'duration': 22,
             'content_html': """<p>Apres installation, la qualite de votre site WordPress se joue dans les 10 a 15 plugins que vous choisissez. Mauvais choix : site lent, faille de securite, conflit de plugins, perte de trafic SEO. Bon choix : site rapide, indexe correctement, blinde contre les attaques. Cette lecon vous donne la stack 2026 que Pirabel Labs deploie sur les 220+ sites WordPress que nous maintenons en Afrique francophone et Europe.</p>
<h2>1. La regle d or : maximum 18 plugins actifs</h2>
<p>Chaque plugin ajoute du code PHP execute a chaque requete. Au-dela de 25 plugins, le TTFB (Time To First Byte) commence a depasser 600 ms meme sur un bon hebergement. La cible : 12 a 18 plugins actifs en production. Les sites sains que nous auditons ont en moyenne 14,2 plugins selon notre benchmark interne 2026.</p>
<h2>2. La stack SEO</h2>
<p><strong>Rank Math Pro (59 USD/an)</strong> ou <strong>Yoast SEO Premium (99 USD/an)</strong>. Rank Math gagne en 2026 sur la richesse des schemas (Article, FAQ, HowTo, Product, LocalBusiness automatiquement), l analyse des mots-cles secondaires et l integration Google Search Console native. Yoast reste leader sur l ergonomie pour debutants et les readability scores.</p>
<p>Configuration prioritaire de Rank Math : Setup Wizard complet, connexion a Search Console et Analytics, activation du module Schema, activation du module 404 Monitor, activation du module Redirections. Important : desactivez le module Image SEO si vous utilisez ShortPixel ou Imagify.</p>
<h2>3. La stack performance</h2>
<p><strong>WP Rocket (59 USD/an)</strong> reste le cache plugin numero 1. Alternative gratuite credible : <strong>LiteSpeed Cache</strong> si votre hebergeur tourne sur LiteSpeed Web Server (Hostinger, NameHero, ChemiCloud). Sinon, WP Super Cache (gratuit) ou W3 Total Cache (gratuit, complexe).</p>
<p>Pour les images : <strong>ShortPixel (5 USD pour 5 000 credits)</strong> ou <strong>Imagify (10 USD/mois illimite)</strong>. Convertissez tout en WebP, gardez le JPG en fallback. Sur un blog 200 articles, vous passez de 1,8 Go a 380 Mo d images, LCP descend de 3,8 s a 1,9 s.</p>
<p>Pour le lazy load avance : <strong>a3 Lazy Load (gratuit)</strong> ou le module natif WordPress. Pour les CSS/JS : <strong>FlyingPress (60 USD/an)</strong> en alternative challenger a WP Rocket avec un meilleur score Core Web Vitals dans 68 % des tests Pirabel Labs.</p>
<h2>4. La stack securite</h2>
<p><strong>Wordfence Security (gratuit, 119 USD/an Premium)</strong> ou <strong>Solid Security Pro (89 USD/an, ex iThemes)</strong>. Wordfence excelle pour le pare-feu applicatif (WAF) et le scan malware quotidien. Solid Security est plus leger et meilleur sur le hardening (forcer SSL admin, masquer wp-admin, 2FA).</p>
<p>Stack recommandee Pirabel Labs : Wordfence gratuit + WP 2FA + Limit Login Attempts Reloaded + WPS Hide Login (changer /wp-admin en /entree-secrete-xyz). Cette combinaison bloque 99,4 % des bots brute force pour 0 EUR de plugins payants.</p>
<h2>5. La stack sauvegarde et migration</h2>
<p><strong>UpdraftPlus Premium (70 USD/an)</strong> ou <strong>WPVivid Pro (49 USD/an)</strong>. UpdraftPlus est la reference en sauvegarde planifiee vers cloud (Google Drive, Dropbox, S3, Backblaze). WPVivid gagne en migration / clonage de site.</p>
<h2>6. La stack formulaires et contact</h2>
<p><strong>WPForms Pro (199 USD/an)</strong> ou <strong>Fluent Forms Pro (79 USD/an)</strong>. Fluent Forms offre 90 % des fonctionnalites de WPForms pour 40 % du prix. Pour la prise de RDV : <strong>Amelia (49 USD/an)</strong> ou <strong>FluentBooking (49 USD/an)</strong>.</p>
<h2>7. La stack analytique</h2>
<p><strong>Site Kit by Google (gratuit)</strong> regroupe Search Console + Analytics 4 + AdSense + PageSpeed Insights dans une seule interface admin. Alternative payante : <strong>MonsterInsights (99 USD/an)</strong> avec des dashboards plus jolis et un tracking ecommerce avance.</p>
<h2>8. La stack bonus selon les besoins</h2>
<ul>
<li><strong>Cookie consent RGPD</strong> : Complianz (99 EUR/an, fait pour l Europe).</li>
<li><strong>Email transactionnel</strong> : Brevo plugin (gratuit, branche Brevo SMTP).</li>
<li><strong>Multilingue</strong> : Polylang Pro (139 EUR/an) ou WPML (99 USD/an). TranslatePress (89 EUR/an) pour la traduction front-end visuelle.</li>
<li><strong>Membership</strong> : Restrict Content Pro ou MemberPress.</li>
<li><strong>Ecommerce light</strong> : WooCommerce + WooPayments / FedaPay pour le mobile money africain.</li>
</ul>
<h2>9. L ordre d installation et de configuration en 60 minutes</h2>
<ol>
<li>UpdraftPlus + premiere sauvegarde manuelle (10 min).</li>
<li>Wordfence + scan complet + activation WAF (15 min).</li>
<li>Rank Math + Setup Wizard + connexion Search Console (15 min).</li>
<li>WP Rocket ou LiteSpeed Cache + preset Safe (10 min).</li>
<li>ShortPixel + bulk optimization arriere-plan (5 min de setup).</li>
<li>Site Kit by Google + connexion proprietes (5 min).</li>
</ol>
<h2>FAQ</h2>
<p><strong>Faut-il payer Rank Math ou Yoast premium ?</strong></p>
<p>Pour un site avec moins de 50 articles, la version gratuite suffit. Au-dela de 100 articles ou pour un ecommerce, la version Pro paie en moins d 1 mois grace au schema Product, FAQ et au monitoring 404 automatique.</p>
<p><strong>WP Rocket vs LiteSpeed Cache : lequel choisir ?</strong></p>
<p>LiteSpeed Cache si votre hebergeur tourne sur LiteSpeed Web Server (Hostinger, NameHero, ChemiCloud). WP Rocket sur tous les autres serveurs Apache/Nginx classiques. Les scores Lighthouse sont equivalents en 2026.</p>
<p><strong>Combien de plugins payants pour un site PME ?</strong></p>
<p>Comptez 200 a 450 EUR/an pour la stack Pro complete (Rank Math Pro + WP Rocket + UpdraftPlus Premium + ShortPixel + Wordfence Premium). Bon ROI vs 6h de developpement custom mensuel.</p>
<blockquote>Un plugin paye 50 EUR qui economise 4h de dev a 80 EUR/h, c est 270 EUR de marge nette. Ne soyez pas radin sur les plugins essentiels.</blockquote>
<p>Vous voulez une stack de plugins personnalisee pour votre business ? <a href="/contact">Demandez un audit gratuit</a> avec un expert WordPress Pirabel Labs.</p>
<h2>Annexe : matrice budgetaire plugins par taille de business</h2>
<ul>
<li><strong>Solo / micro-entreprise (CA &lt; 50k EUR/an)</strong> : budget 0-150 EUR/an. Tout en versions gratuites + WP Rocket annuel 59 USD.</li>
<li><strong>TPE 5 personnes (CA 50-200k EUR/an)</strong> : budget 250-450 EUR/an. Rank Math Pro + WP Rocket + ShortPixel + UpdraftPlus Premium.</li>
<li><strong>PME 20 personnes (CA 200k-2M EUR/an)</strong> : budget 600-1 200 EUR/an. Stack complete + ACF Pro + WPForms Pro + Wordfence Premium + Complianz.</li>
<li><strong>Mid-market 50 personnes ou ecommerce 1M+ CA</strong> : budget 1 500-3 500 EUR/an. Stack premium + Solid Backups + Jetpack + plugins specialises secteur.</li>
<li><strong>Grand compte ou agence (50+ sites en gestion)</strong> : budget 5 000-15 000 EUR/an. Licences agence (Rank Math Agency, WP Rocket+, Imagify Pro) + plateforme de maintenance (WP Umbrella, ManageWP).</li>
</ul>
<p>Cette matrice budgetaire est basee sur le benchmark Pirabel Labs 2026 portant sur 220+ sites en gestion. Elle vous evite de sur-investir ou sous-investir dans votre stack technique.</p>"""},
            {'title': "Premiere prise en main de l'admin WordPress",
             'duration': 16,
             'content_html': """<p>L admin WordPress, c est 35 menus dans la sidebar, 60+ ecrans differents et 4 generations de UI superposees. Apres une heure de tatonnement, beaucoup d entrepreneurs renoncent et delegguent inutilement. Cette lecon vous donne le tour proprietaire en 25 minutes pour devenir autonome sur 90 % des actions courantes : creer une page, publier un article, gerer les medias, moderer les commentaires, mettre a jour le site sans tout casser.</p>
<h2>1. La barre laterale gauche : carte complete</h2>
<p>De haut en bas : <strong>Tableau de bord</strong> (vue d ensemble), <strong>Articles</strong> (blog), <strong>Medias</strong> (bibliotheque), <strong>Pages</strong> (pages statiques), <strong>Commentaires</strong>, puis <strong>Apparence</strong> (themes, menus, customizer), <strong>Extensions</strong> (plugins), <strong>Utilisateurs</strong>, <strong>Outils</strong>, <strong>Reglages</strong>. Plus les menus ajoutes par vos plugins (Rank Math, WP Rocket, Wordfence, etc.).</p>
<p>Astuce : cliquez sur l icone "Vue d ecran" en haut a droite pour reorganiser les colonnes de listing (par exemple cacher la colonne "Etiquettes" si vous ne l utilisez pas).</p>
<h2>2. Creer sa premiere page</h2>
<ol>
<li>Pages > Ajouter. L editeur Gutenberg s ouvre.</li>
<li>Tapez votre titre (qui deviendra le slug d URL).</li>
<li>Cliquez "+" pour ajouter un bloc : Paragraphe, Titre, Image, Bouton, Colonnes.</li>
<li>Dans la sidebar droite : choisissez le modele (Default Template, Page Pleine Largeur), l image mise en avant, l ordre.</li>
<li>Cliquez "Publier". Validez deux fois (verification de visibilite).</li>
</ol>
<p>Pour creer une homepage personnalisee : Reglages > Lecture > "Une page statique" > choisissez votre page d accueil.</p>
<h2>3. Publier un article de blog</h2>
<p>Articles > Ajouter. Meme principe que Pages, mais avec : Categories (taxonomie principale, hierarchique), Etiquettes (taxonomie secondaire, non hierarchique), Auteur, Image mise en avant (cle pour le SEO et le partage social), Extrait (manuel pour Open Graph et la liste blog).</p>
<p>Bonne pratique 2026 : 1 article = 1 categorie principale + 3 a 5 etiquettes max. Pas plus, sinon vous creez du contenu duplique sur les pages d archive.</p>
<h2>4. Gerer les medias</h2>
<p>Medias > Bibliotheque. Tous les fichiers uploads, classes par date. En 2026, WordPress accepte JPG, PNG, WebP, AVIF, SVG (avec plugin SVG Support), MP4, MP3, PDF. Limite par defaut : 2 Mo (modifiable dans le php.ini ou via plugin Increase Maximum Upload File Size).</p>
<p>Workflow recommande : optimisez vos images dans Squoosh.app ou TinyPNG <em>avant</em> upload. Renommez les fichiers en kebab-case descriptif (genre <code>boulangerie-cotonou-vitrine.webp</code> plutot que <code>IMG_4582.jpg</code>) pour le SEO image.</p>
<h2>5. Moderer les commentaires</h2>
<p>Commentaires > vue listing avec filtres (En attente, Approuves, Spam, Corbeille). Plus tous les commentaires sont approuves manuellement, plus votre temps explose. Solution : combinez Akismet (gratuit pour blogs perso, 10 USD/mois en commercial) + Antispam Bee + activation du double opt-in dans Reglages > Discussion.</p>
<h2>6. Mettre a jour le site en securite</h2>
<p>Tableau de bord > Mises a jour montre toutes les MAJ disponibles : core WordPress, themes, plugins, traductions. <strong>Procedure de mise a jour pro</strong> :</p>
<ol>
<li>Lancez une sauvegarde manuelle UpdraftPlus.</li>
<li>Verifiez les changelogs des plugins (chercher "breaking changes").</li>
<li>Si vous avez un staging (WP Engine, Kinsta), testez la-bas d abord.</li>
<li>Mettez a jour le core WordPress en premier, puis les plugins un par un, puis le theme.</li>
<li>Testez immediatement la home + 3 pages cles + un article + un formulaire.</li>
</ol>
<p>Pour automatiser : WP Umbrella, ManageWP ou MainWP centralisent les mises a jour de plusieurs sites avec snapshot Lighthouse avant/apres.</p>
<h2>7. Utilisateurs et roles</h2>
<p>WordPress propose 5 roles natifs : Administrateur, Editeur, Auteur, Contributeur, Abonne. Bonne pratique : creez 1 seul compte Admin pour vous, et donnez le role Editeur a votre redactrice ou marketing manager. N attribuez Admin a personne d autre, jamais.</p>
<h2>FAQ</h2>
<p><strong>Quelle difference entre Pages et Articles ?</strong></p>
<p>Les Pages sont statiques (Accueil, A propos, Contact, Mentions legales). Les Articles sont dates et categorises (blog). Les Articles apparaissent dans les flux RSS et les archives, pas les Pages.</p>
<p><strong>Peut-on traduire l interface admin ?</strong></p>
<p>Oui, Reglages > General > Langue du site. Tous les plugins serieux sont disponibles en francais. Si un plugin est en anglais, contribuez la traduction sur translate.wordpress.org.</p>
<p><strong>Comment retrouver un article supprime par erreur ?</strong></p>
<p>Articles > Corbeille (conservation 30 jours par defaut). Au-dela, restauration via sauvegarde UpdraftPlus.</p>
<blockquote>Maitriser l admin en 1 heure vous fait gagner 8 heures par mois pendant 2 ans. Investissez le temps.</blockquote>
<p>Besoin d une formation personnalisee a l admin WordPress pour vos equipes ? <a href="/rendez-vous">Prenez un RDV gratuit</a> avec un formateur Pirabel Labs.</p>
<h2>Annexe : raccourcis clavier admin WordPress 2026</h2>
<p>Voici les raccourcis qui vous font gagner 30 % de temps quotidiennement dans l admin :</p>
<ul>
<li><strong>Ctrl+S (Cmd+S sur Mac)</strong> : sauvegarder le brouillon en cours.</li>
<li><strong>Ctrl+Shift+S</strong> : publier directement (sans la confirmation).</li>
<li><strong>Ctrl+B</strong> : gras.</li>
<li><strong>Ctrl+I</strong> : italique.</li>
<li><strong>Ctrl+K</strong> : ajouter un lien.</li>
<li><strong>Ctrl+Alt+1 a 6</strong> : transformer en H1 a H6.</li>
<li><strong>Ctrl+Alt+T</strong> : insertion balise &lt;more&gt; (read more).</li>
<li><strong>Ctrl+Z / Ctrl+Y</strong> : annuler / refaire.</li>
<li><strong>/</strong> dans Gutenberg : ouvrir le selecteur de blocs.</li>
<li><strong>Ctrl+Shift+D</strong> : dupliquer un bloc Gutenberg.</li>
<li><strong>Ctrl+Shift+Backspace</strong> : supprimer le bloc Gutenberg actif.</li>
</ul>
<p>Astuce : dans Gutenberg, tapez "/" puis le nom du bloc (paragraphe, titre, image, bouton) pour l inserer instantanement sans passer par le menu.</p>
<h2>Annexe : roadmap d apprentissage admin WordPress en 14 jours</h2>
<ol>
<li><strong>Jour 1</strong> : installation + setup initial (cette lecon + lecon 1.3).</li>
<li><strong>Jour 2-3</strong> : creation de 5 pages + 1 article test.</li>
<li><strong>Jour 4</strong> : configuration Customizer + identite visuelle.</li>
<li><strong>Jour 5</strong> : menu, navigation, footer.</li>
<li><strong>Jour 6-7</strong> : ajout de plugins essentiels + configuration.</li>
<li><strong>Jour 8</strong> : test responsive + corrections.</li>
<li><strong>Jour 9</strong> : connexion Analytics + Search Console.</li>
<li><strong>Jour 10</strong> : premiere campagne de contenu (2 articles).</li>
<li><strong>Jour 11-12</strong> : SEO on-page (titles, descriptions, schemas).</li>
<li><strong>Jour 13</strong> : sauvegardes + securite review.</li>
<li><strong>Jour 14</strong> : lancement et soumission au Search Console.</li>
</ol>
<p>Suivre cette roadmap vous garantit un site WordPress operationnel et autonome en 2 semaines, meme sans experience prealable.</p>"""},
        ],
    },
    {
        'title': 'Design et structure des pages',
        'objective': 'Choisir un theme premium adapte, personnaliser l identite visuelle, batir une navigation efficace, des widgets utiles et un design responsive teste sur tous les devices.',
        'duration': 230,
        'lessons': [
            {'title': "Choisir un theme : criteres et erreurs a eviter",
             'duration': 20,
             'content_html': """<p>Le theme WordPress que vous choisissez aujourd hui va vous accompagner 3 a 5 ans. Changer de theme apres 18 mois en production casse vos shortcodes, vos blocs Gutenberg, votre design system et coute en moyenne 4 800 EUR de refonte. Cette lecon vous donne les 9 criteres de selection qu utilisent les agences en 2026 et les 6 erreurs qui ruinent 70 % des projets WordPress.</p>
<h2>1. Les 5 grandes familles de themes en 2026</h2>
<ol>
<li><strong>Themes multifonctions premium</strong> : Astra Pro, GeneratePress Premium, Kadence Theme Pro, Blocksy Pro. Tarif : 49 a 89 EUR/an. Polyvalents, legers (moins de 20 Ko de CSS), compatibles avec tous les builders.</li>
<li><strong>Themes blocks-only natifs FSE (Full Site Editing)</strong> : Twenty Twenty-Four, Frost, Ollie. Gratuits, ultra rapides, mais courbe d apprentissage Gutenberg pure.</li>
<li><strong>Themes axes Elementor / Beaver Builder</strong> : Hello Elementor, Page Builder Framework. Conçus pour etre vides et laisser le builder construire tout.</li>
<li><strong>Themes verticaux specialises</strong> : Avada (ecommerce), Divi (creatifs), Salient (agence creative), Soledad (magazine). Tarif : 59 a 99 EUR licence unique.</li>
<li><strong>Themes ecommerce</strong> : Flatsome (pour WooCommerce), Shoptimizer, Woodmart. Optimises catalogue produit + checkout.</li>
</ol>
<h2>2. Les 9 criteres de selection professionnels</h2>
<ol>
<li><strong>Score Lighthouse mobile a la demo</strong> : doit etre superieur a 85. Testez sur PageSpeed Insights l URL de la demo officielle.</li>
<li><strong>Poids CSS/JS total</strong> : moins de 100 Ko gzippe pour un theme leger. Astra et GeneratePress sont sous 35 Ko.</li>
<li><strong>Compatibilite plugins</strong> : verifiez ACF, WooCommerce, Yoast, Rank Math, Elementor, Brevo.</li>
<li><strong>Frequence de mise a jour</strong> : au moins une release tous les 60 jours. Themeforest regorge de themes abandonnes depuis 18 mois.</li>
<li><strong>Support et documentation</strong> : ticket de support repondu en moins de 24h ouvrees, doc en francais ou anglais clair.</li>
<li><strong>Conformite RGPD</strong> : pas de fonts Google Fonts charges en CDN externe par defaut (probleme legal en Allemagne et France).</li>
<li><strong>Accessibilite WCAG 2.1 AA</strong> : focus visible, contrastes 4,5:1, navigation clavier. Critique pour les sites publics ou institutionnels.</li>
<li><strong>Multilingue</strong> : compatibilite Polylang + WPML out-of-the-box.</li>
<li><strong>Licence GPL et redistribution</strong> : pas de DRM bloquant qui vous empeche de migrer le site.</li>
</ol>
<h2>3. Les 6 erreurs fatales a eviter</h2>
<p><strong>Erreur 1 : choisir un theme avec 200 demos importables</strong>. Plus la demo est lourde, plus le theme est lourd. Avada importe 1,8 Go d images et 18 plugins associes. Resultat : LCP 5,2 s, 220 plugins detectes par Wordfence comme deja vulnerables.</p>
<p><strong>Erreur 2 : acheter une licence unique Themeforest a 59 USD</strong>. Le prix d appel cache souvent 89 USD/an pour les mises a jour au-dela de la premiere annee. Comparez le TCO 3 ans.</p>
<p><strong>Erreur 3 : oublier de tester sur mobile reel</strong>. Ouvrez la demo sur votre smartphone Android moyen de gamme (pas un iPhone 15 Pro Max). 60 % des themes premiums craquent sur mobile a 320 px de largeur.</p>
<p><strong>Erreur 4 : ne pas verifier la compatibilite WooCommerce HPOS</strong> (High Performance Order Storage), obligatoire depuis WooCommerce 8.2. Sans HPOS, vos commandes plantent au-dela de 50 000 lignes.</p>
<p><strong>Erreur 5 : choisir un theme qui charge jQuery</strong>. WordPress 6.7+ pousse vers le vanilla JS. Un theme qui force jQuery ajoute 90 Ko + 200 ms de blocking time inutile.</p>
<p><strong>Erreur 6 : oublier le child theme</strong>. Toute modification CSS / PHP doit passer par un child theme, sinon la prochaine mise a jour ecrase vos changements. Generateurs : Child Theme Configurator (plugin) ou code manuel (4 fichiers : style.css, functions.php, screenshot.png, child theme info).</p>
<h2>4. Notre top 5 themes 2026 selon le cas d usage</h2>
<ul>
<li><strong>Site vitrine PME francaise ou africaine</strong> : Astra Pro + Astra Starter Templates. Stable, rapide, multilingue.</li>
<li><strong>Blog SEO 200+ articles</strong> : GeneratePress Premium + GenerateBlocks. Le couple le plus rapide du marche, LCP 0,9 s.</li>
<li><strong>Agence creative / portfolio</strong> : Blocksy Pro ou Kadence Theme. Tres customisable, bel ecosysteme de blocs.</li>
<li><strong>Ecommerce WooCommerce</strong> : Flatsome ou Botiga Pro. Optimises checkout + variantes produit.</li>
<li><strong>Magazine / media</strong> : Newspaper (TagDiv) ou Soledad. Riches en layouts blog.</li>
</ul>
<h2>5. Processus de selection en 90 minutes</h2>
<ol>
<li>Listez 5 themes candidats (filtres : Astra, GeneratePress, Kadence, Blocksy, Twenty Twenty-Four).</li>
<li>Ouvrez les demos sur PageSpeed Insights mobile.</li>
<li>Verifiez le poids total avec GTmetrix.</li>
<li>Lisez 10 avis recents (filtre 2025 + 2026) sur WordPress.org ou Themeforest.</li>
<li>Verifiez la derniere mise a jour (moins de 60 jours).</li>
<li>Installez le theme finaliste sur un staging, importez la demo qui se rapproche le plus, mesurez le LCP reel.</li>
<li>Validez la decision avec votre developpeur ou agence.</li>
</ol>
<h2>FAQ</h2>
<p><strong>Astra Pro ou GeneratePress Premium : lequel choisir ?</strong></p>
<p>Astra Pro pour la richesse des Starter Templates (300+ designs). GeneratePress Premium si la vitesse pure est votre priorite absolue (35 Ko CSS total).</p>
<p><strong>Faut-il un theme premium ou gratuit ?</strong></p>
<p>La version gratuite d Astra ou GeneratePress couvre 80 % des besoins d un site vitrine. Le passage en Pro (49-89 EUR/an) se justifie des que vous voulez le header / footer builder visuel, le mega menu ou les hooks avances.</p>
<p><strong>Combien de temps prend la selection d un theme ?</strong></p>
<p>90 minutes si vous suivez la methode ci-dessus. 2 jours si vous lisez des avis sans methode.</p>
<blockquote>Un mauvais theme se paie en 3 ans de frustration. Une heure d audit serieux vaut 30 heures de bricolage futur.</blockquote>
<p>Vous hesitez entre 3 themes pour votre projet ? <a href="/contact">Demandez l avis d un expert</a> Pirabel Labs en 24h.</p>"""},
            {'title': "Personnaliser l'identite visuelle (logo, couleurs, polices)",
             'duration': 18,
             'content_html': """<p>L identite visuelle de votre site WordPress fait la difference entre un site qui inspire confiance des la premiere seconde et un site qui sent l amateur. Logo flou, palette de 7 couleurs incoherentes, 4 polices differentes : voici ce qui tue 40 % des conversions. Cette lecon vous donne la methode et les outils pour personnaliser professionnellement votre identite visuelle WordPress, meme sans designer en interne.</p>
<h2>1. Le logo : format et tailles a uploader</h2>
<p>Format ideal : SVG (vectoriel, rest net a toutes les tailles, 4 a 8 Ko). Si vous n avez pas de SVG, exigez de votre designer un PNG transparent 800 x 200 px en haute resolution (Retina-ready). Format favicon : ICO ou PNG 512 x 512 px (WordPress le redimensionne automatiquement aux 16, 32, 192, 512 px requis pour les browsers et iOS / Android home screen).</p>
<p>Si vous n avez pas encore de logo, deux options. Option A : Designer freelance sur Malt, 5euros ou Fiverr (150 a 800 EUR pour un logo + brandbook simple). Option B : outils IA en 2026 (Looka 65 USD, Logoai 49 USD, Brandmark 25 USD). Pour un budget zero : Canva avec template adapte, le rendu sera moyen mais utilisable pour un MVP.</p>
<h2>2. Uploader le logo dans WordPress</h2>
<p>Apparence > Personnaliser (Customizer) > Identite du site. Cliquez "Selectionner un logo", uploadez votre SVG ou PNG. La hauteur de logo dans le header : 32 a 60 px desktop, 28 a 40 px mobile. Au-dela, le header devient massif et casse l UX.</p>
<p>Pour le favicon : Customizer > Identite du site > Icone du site. Carre 512 x 512 px minimum.</p>
<h2>3. Construire une palette de couleurs coherente</h2>
<p>Regle d or 2026 : maximum 5 couleurs dans toute votre identite : 1 primaire (marque), 1 secondaire (CTA), 1 neutre fonce (texte), 1 neutre clair (fonds), 1 accent (alertes / promo). Pas 12 nuances de bleu.</p>
<p>Outils pour generer une palette pro : <strong>Coolors.co</strong> (gratuit, generation infinie), <strong>Adobe Color</strong> (gratuit, analyse harmonique), <strong>Realtime Colors</strong> (preview UI live). Verifiez le contraste WCAG AA (4,5:1 minimum pour le texte normal) avec WebAIM Contrast Checker.</p>
<p>Exemple de palette Pirabel Labs en 2026 : primaire #6366F1 (indigo electrique), secondaire #F59E0B (ambre CTA), neutre fonce #0F172A, neutre clair #F8FAFC, accent #EF4444 (rouge urgence).</p>
<h2>4. Choisir et installer les polices</h2>
<p>Maximum 2 polices : 1 pour les titres (font de personnalite, Display), 1 pour le corps de texte (Sans Serif lisible). Eventuellement une 3e pour les accents (Mono pour le code, par exemple).</p>
<p><strong>Top combinaisons 2026</strong> : Inter (corps) + Cal Sans (titre), Geist (corps) + Geist Mono (code), Manrope (corps) + Plus Jakarta Sans (titre), Outfit (corps) + Bricolage Grotesque (titre).</p>
<p>Plugin recommande pour eviter le chargement Google Fonts externe (probleme RGPD) : <strong>OMGF (Optimize My Google Fonts)</strong>. Telecharge les fichiers font localement, sert depuis votre domaine, gain de 200 a 400 ms LCP.</p>
<h2>5. Personnaliser via Customizer ou Theme Settings</h2>
<p>Sur Astra ou Kadence, allez dans Apparence > Personnaliser. Les sections cles : Global > Couleurs (definir la palette globale), Global > Typographie (assigner les polices), Global > Bordures et Conteneur (rayons d arrondi, ombre), Header Builder, Footer Builder.</p>
<p>Bonne pratique : definissez d abord vos design tokens globaux (couleurs, polices, espacements), puis utilisez ces tokens partout dans les pages. Si vous changez une couleur, elle se met a jour partout en un clic.</p>
<h2>6. Cas particulier : sites multilingues ou Africains</h2>
<p>Pour les sites bilingues francais/anglais ou multilingues francais/wolof/yoruba, verifiez que vos polices supportent les caracteres etendus (a, c, e, etc., apostrophes typographiques, guillemets francais). Inter, Manrope et Geist couvrent l intégralité de Latin Extended-A et B.</p>
<p>Pour les marques africaines, n hesitez pas a integrer des motifs ou couleurs symboliques (bogolan, wax, indigo Tuareg) dans des sections specifiques sans en faire le squelette de la marque. Ca renforce l identite sans tomber dans le folklore.</p>
<h2>7. Validation finale en 4 controles</h2>
<ol>
<li>Le logo est-il lisible a 32 px de hauteur sur mobile ?</li>
<li>La palette respecte-t-elle le ratio de contraste 4,5:1 pour le texte ?</li>
<li>Les 2 polices se chargent-elles en moins de 300 ms (verifier dans GTmetrix Waterfall) ?</li>
<li>L identite est-elle coherente sur 10 pages differentes du site ?</li>
</ol>
<h2>FAQ</h2>
<p><strong>Faut-il payer Adobe Fonts ou Google Fonts suffit ?</strong></p>
<p>Google Fonts gratuit + serve local via OMGF couvre 95 % des besoins. Adobe Fonts (inclus dans Creative Cloud 23 EUR/mois) ouvre acces a Helvetica Now, Adobe Garamond, etc., utiles pour les marques premium.</p>
<p><strong>Combien de couleurs maximum dans une palette ?</strong></p>
<p>5 couleurs principales + 3 nuances tonales chacune. Au-dela, vous perdez la coherence visuelle.</p>
<p><strong>Comment exporter mon design system vers Figma ?</strong></p>
<p>Plugin gratuit "Theme Junkie Design System" ou export manuel des tokens en JSON via le panneau Customizer.</p>
<blockquote>Une identite visuelle coherente double la perception de credibilite et reduit le bounce rate de 22 % en moyenne.</blockquote>
<p>Vous voulez un brandbook professionnel pour votre site ? <a href="/contact">Pirabel Labs livre votre identite</a> en 7 a 14 jours ouvres.</p>"""},
            {'title': "Construire le menu et la navigation",
             'duration': 16,
             'content_html': """<p>La navigation est le 2e levier UX le plus important apres la vitesse de chargement. Un menu confus, c est 35 % de bounce rate en plus et un SEO penalise (Google detecte la confusion via le pogo-sticking). Cette lecon vous montre comment construire un menu WordPress clair, hierarchise, optimise mobile et compatible mega menus.</p>
<h2>1. Definir la structure avant de cliquer</h2>
<p>Sortez un papier ou Whimsical.com. Listez tous les contenus du site. Regroupez-les en 5 a 7 categories principales maximum. Au-dela, l UX se degrade. Notre methode Pirabel Labs : Accueil, Services, Tarifs, Blog, A propos, Contact (6 items) + CTA (Demander un devis ou Reserver).</p>
<p>Si vous avez 20+ services, regroupez-les en 4 a 6 sous-categories avec un mega menu, pas en liste plate.</p>
<h2>2. Creer le menu dans WordPress</h2>
<ol>
<li>Apparence > Menus.</li>
<li>Cliquez "Creer un nouveau menu", nommez-le "Menu Principal".</li>
<li>Dans la colonne de gauche : Pages > cochez vos pages principales > Ajouter au menu.</li>
<li>Glissez-deposez pour reorganiser l ordre.</li>
<li>Pour creer une sous-menu : decalez l item vers la droite.</li>
<li>En bas : "Emplacement" > cochez "Primary Menu" (ou l emplacement de votre theme).</li>
<li>Enregistrer le menu.</li>
</ol>
<p>WordPress 6.5+ propose aussi le Site Editor (Apparence > Editeur) pour les themes FSE avec un bloc Navigation drag-and-drop visuel.</p>
<h2>3. Optimiser le menu mobile (hamburger)</h2>
<p>Sur mobile, le menu se transforme en icone hamburger (3 lignes). Verifiez :</p>
<ul>
<li>Icone visible (24 a 32 px), contraste suffisant.</li>
<li>Click target zone 44 x 44 px minimum (recommandation Apple).</li>
<li>Animation d ouverture fluide (300 ms max).</li>
<li>Menu plein ecran ou off-canvas (selon theme), avec CTA visible en bas.</li>
<li>Bouton de fermeture (X) en haut a droite.</li>
</ul>
<p>Plugin recommande pour un mega menu mobile pro : <strong>Max Mega Menu (gratuit)</strong> ou natif Astra Pro / Kadence Pro.</p>
<h2>4. Ajouter des elements speciaux au menu</h2>
<ul>
<li><strong>Liens externes</strong> : Liens > URL personnalisee.</li>
<li><strong>Categories de blog</strong> : Categories > cocher.</li>
<li><strong>Ancres internes</strong> : URL avec #section-id.</li>
<li><strong>Boutons CTA</strong> : ajoutez une classe CSS personnalisee "menu-cta" (visible dans Options de l ecran > Classes CSS).</li>
<li><strong>Icones</strong> : utilisez Astra Pro ou plugin Menu Icons pour ajouter des icones devant chaque item.</li>
</ul>
<h2>5. Mega menu : quand l utiliser</h2>
<p>Le mega menu (large panneau qui s ouvre au survol avec plusieurs colonnes, images, descriptions) est utile pour les sites avec 30+ pages categories. Pour un site vitrine de 8 pages, c est de la surenchere.</p>
<p>Outils recommandes : <strong>Max Mega Menu</strong> (gratuit, robuste), <strong>UberMenu</strong> (CodeCanyon 25 USD), ou natif Elementor Pro / Kadence Pro.</p>
<h2>6. Footer menu et menu legal</h2>
<p>Creez un 2e menu "Footer Menu" avec les liens legaux : Mentions legales, Politique de confidentialite, CGV, CGU, Cookies. Obligatoire RGPD en Europe et bonne pratique partout.</p>
<p>Un 3e menu "Quick Links" peut regrouper : Carrieres, Presse, Blog, Newsletter.</p>
<h2>7. SEO et accessibilite du menu</h2>
<p>Verifiez que les liens du menu sont des balises <code>&lt;a href&gt;</code> reelles, pas des onclick JS (penalite SEO + accessibilite cassee). Verifiez que la navigation est traversable au clavier (Tab + Enter). Verifiez les attributs ARIA (role="navigation", aria-label="Menu principal").</p>
<h2>FAQ</h2>
<p><strong>Combien d items maximum dans le menu principal ?</strong></p>
<p>7 maximum (regle de Miller, capacite de memoire court terme). Au-dela, regroupez en sous-menus ou mega menus.</p>
<p><strong>Faut-il un sticky header (menu collant) au scroll ?</strong></p>
<p>Oui pour les sites longs (blog, ecommerce), non pour les landing pages. Le sticky augmente la conversion CTA de 12 a 18 % en moyenne.</p>
<p><strong>Comment ajouter un selecteur de langue dans le menu ?</strong></p>
<p>Avec Polylang ou WPML, ajoutez le widget "Language Switcher" dans le menu via Apparence > Menus > Language Switcher.</p>
<blockquote>Un menu clair vaut mille pages parfaitement designees. Si vos utilisateurs se perdent au menu, ils ne verront jamais le reste.</blockquote>
<p>Audit gratuit de votre navigation : <a href="/contact">demandez-le ici</a> a un UX designer Pirabel Labs.</p>"""},
            {'title': "Creer le footer et les widgets",
             'duration': 14,
             'content_html': """<p>Le footer WordPress est souvent traite comme un cimetiere d informations. Pourtant, c est la 3e zone la plus regardee apres le header et le contenu principal selon les eye-tracking studies. Un footer bien construit augmente la duree de session de 18 %, ameliore l indexation SEO via le maillage interne et rassure sur la legitimite de votre business.</p>
<h2>1. Anatomie d un footer professionnel en 2026</h2>
<p>4 zones standard :</p>
<ol>
<li><strong>Zone 1 (haut)</strong> : 4 a 5 colonnes : a propos rapide + logo, navigation secondaire, contact, newsletter.</li>
<li><strong>Zone 2 (badges)</strong> : moyens de paiement acceptes, certifications, prix gagnes (Trustpilot, Capterra, G2).</li>
<li><strong>Zone 3 (legal)</strong> : copyright, mentions legales, politique de confidentialite, CGV, liens reseaux sociaux.</li>
<li><strong>Zone 4 (bonus)</strong> : back-to-top, support chat, newsletter sticky (selon contexte).</li>
</ol>
<h2>2. Construire le footer dans WordPress</h2>
<p>Selon votre theme :</p>
<ul>
<li><strong>Astra Pro / Kadence Pro</strong> : Apparence > Personnaliser > Footer Builder > drag-and-drop visuel avec lignes et colonnes.</li>
<li><strong>Themes FSE (Twenty Twenty-Four)</strong> : Apparence > Editeur > Patterns > Footer.</li>
<li><strong>Themes classiques (anciens)</strong> : Apparence > Widgets > zones de widget Footer-1, Footer-2, etc.</li>
<li><strong>Elementor Pro</strong> : Modeles > Theme Builder > Footer > nouveau.</li>
</ul>
<h2>3. Les widgets WordPress essentiels en 2026</h2>
<p>Avec Gutenberg, les widgets classiques sont remplaces par des blocs. Les indispensables :</p>
<ul>
<li><strong>Bloc Paragraphe + Image (logo)</strong> pour la zone About.</li>
<li><strong>Bloc Menu Navigation</strong> pour les liens.</li>
<li><strong>Bloc Liste de Liens Sociaux</strong> pour Facebook, LinkedIn, Twitter, Instagram, YouTube, TikTok.</li>
<li><strong>Bloc Formulaire</strong> (via WPForms ou Fluent Forms) pour la newsletter.</li>
<li><strong>Bloc HTML personnalise</strong> pour les badges paiement.</li>
<li><strong>Bloc Texte enrichi</strong> pour le copyright dynamique : <code>&copy; 2024-{{current_year}} Votre Marque. Tous droits reserves.</code></li>
</ul>
<h2>4. Newsletter dans le footer : pratique CRO</h2>
<p>Une newsletter dans le footer convertit en moyenne 0,8 % des visiteurs vs 2,4 % en popup (selon notre benchmark Pirabel Labs 220 sites). Mais elle ne sature pas le visiteur. Combinaison gagnante : popup exit-intent + newsletter footer permanent.</p>
<p>Plugin recommande : Brevo (ex Sendinblue) plugin officiel + Brevo Forms ou Fluent Forms avec integration Brevo native.</p>
<h2>5. Liens reseaux sociaux : choisir et lier</h2>
<p>Listez UNIQUEMENT les reseaux que vous animez activement (publication dans les 30 derniers jours). Un lien vers un Twitter abandonne en 2022 tue la credibilite. Format : icones SVG monochromes alignees, 24-32 px, hover effect leger.</p>
<h2>6. Conformite RGPD du footer</h2>
<p>Le footer doit imperativement contenir :</p>
<ul>
<li>Lien Mentions legales (obligatoire en France, recommande partout).</li>
<li>Lien Politique de confidentialite (RGPD article 13).</li>
<li>Lien CGV / CGU si vous vendez.</li>
<li>Lien Politique cookies (RGPD ePrivacy).</li>
<li>Adresse postale physique de la societe.</li>
<li>Numero SIRET / RCS / equivalent local (RCCM au Benin, par exemple).</li>
</ul>
<h2>7. SEO du footer : maillage interne</h2>
<p>Le footer est une zone de maillage interne pas chere. Bonne pratique : 10 a 15 liens internes vers vos pages cles (pages services, blog, ressources). Ne mettez pas 80 liens, Google detecte le footer-spam.</p>
<h2>FAQ</h2>
<p><strong>Le footer doit-il etre identique sur toutes les pages ?</strong></p>
<p>95 % du temps, oui (coherence + maintenance). Exceptions : landing pages publicitaires (footer ultra-light), checkout ecommerce (footer minimal sans liens distractifs).</p>
<p><strong>Quelle hauteur ideale pour un footer ?</strong></p>
<p>250 a 400 px desktop, 350 a 600 px mobile. Au-dela, le visiteur perd patience.</p>
<p><strong>Faut-il afficher l annee dynamiquement ?</strong></p>
<p>Oui imperativement. Code PHP dans functions.php : <code>echo date("Y");</code> ou avec Gutenberg, utilisez le shortcode <code>[year]</code> via plugin Shortcode Year.</p>
<blockquote>Le footer professionnel est invisible : on ne le remarque que quand il manque ou qu il est rate.</blockquote>
<p>Vous voulez un footer optimise CRO + SEO pour votre site ? <a href="/rendez-vous">RDV gratuit avec Pirabel Labs</a>.</p>"""},
            {'title': "Design responsive : tester sur mobile et tablette",
             'duration': 18,
             'content_html': """<p>En 2026, 67 % du trafic web mondial vient du mobile, et 78 % en Afrique francophone selon StatCounter. Un site qui craque sur smartphone, c est 60 % de vos clients perdus avant meme qu ils aient lu votre titre. Cette lecon vous donne la methode et les outils pour tester, debugger et corriger le responsive design de votre site WordPress.</p>
<h2>1. Les 4 breakpoints de reference en 2026</h2>
<ul>
<li><strong>320 - 480 px</strong> : smartphones petit ecran (iPhone SE, Android d entree de gamme tres present en Afrique).</li>
<li><strong>481 - 768 px</strong> : smartphones grand ecran (iPhone 15 Plus, Samsung Galaxy S24 Ultra).</li>
<li><strong>769 - 1024 px</strong> : tablettes portrait + iPad mini.</li>
<li><strong>1025 - 1440 px+</strong> : desktop standard + grand ecran.</li>
</ul>
<p>Astra, GeneratePress et Kadence gerent ces breakpoints nativement via le Customizer.</p>
<h2>2. Tester avec Chrome DevTools</h2>
<ol>
<li>Ouvrez votre site dans Chrome.</li>
<li>F12 pour ouvrir DevTools.</li>
<li>Cliquez sur l icone smartphone/tablette en haut a gauche (Toggle device toolbar) ou Ctrl+Shift+M.</li>
<li>Selectionnez un device dans le menu deroulant (iPhone 14, Galaxy S20, iPad).</li>
<li>Naviguez votre site, testez tous les CTA, formulaires, menus.</li>
</ol>
<p>Astuce : ajoutez "Responsive" dans le menu deroulant pour tester des largeurs arbitraires (240 px, 360 px, 414 px).</p>
<h2>3. Tester sur appareils reels</h2>
<p>DevTools est utile mais ne remplace pas le test sur smartphone reel. Investissez 200 EUR dans 2 smartphones de test :</p>
<ul>
<li>1 iPhone reconditionne (iPhone XR ou 11) pour iOS Safari.</li>
<li>1 Android milieu de gamme (Samsung Galaxy A33 ou Redmi Note 12) pour Chrome Android.</li>
</ul>
<p>Connectez votre smartphone en USB a votre PC, activez le debug Chrome (chrome://inspect/#devices) pour debugger en temps reel.</p>
<h2>4. Tester avec BrowserStack ou LambdaTest</h2>
<p>Pour les agences ou les projets serieux : <strong>BrowserStack (39 USD/mois)</strong> ou <strong>LambdaTest (29 USD/mois)</strong> vous donnent acces a 3 000+ combinaisons device + navigateur reelles dans le cloud.</p>
<h2>5. Les 8 elements a tester systematiquement</h2>
<ol>
<li><strong>Logo et header</strong> : visible, non coupe, click target 44x44 px min.</li>
<li><strong>Menu hamburger</strong> : ouverture fluide, fermeture facile.</li>
<li><strong>Hero section</strong> : texte lisible, CTA visible above the fold mobile.</li>
<li><strong>Images</strong> : pas de scroll horizontal, ratio respecte.</li>
<li><strong>Formulaires</strong> : champs assez larges, clavier mobile adapte (type="email", type="tel", inputmode).</li>
<li><strong>Boutons</strong> : 44x44 px min, espace suffisant entre 2 boutons.</li>
<li><strong>Tableaux</strong> : scroll horizontal ou stack vertical en mobile.</li>
<li><strong>Footer</strong> : pas de chevauchement, colonnes stack proprement.</li>
</ol>
<h2>6. Corriger les bugs responsive avec Customizer</h2>
<p>La plupart des themes premium vous laissent definir des valeurs differentes par breakpoint. Exemple Astra : Personnaliser > Typographie > Title H1 > 3 onglets desktop / tablette / mobile. Reglez la taille de police a 56 px desktop, 40 px tablette, 30 px mobile.</p>
<h2>7. CSS personnalise pour ajustements fins</h2>
<p>Apparence > Personnaliser > CSS additionnel. Exemple :</p>
<p><code>@media (max-width: 768px) { .hero-title { font-size: 28px !important; line-height: 1.2; } }</code></p>
<p>Toujours utiliser !important uniquement en derniere extremite, sinon vous creez un cascade nightmare.</p>
<h2>8. Verifier les Core Web Vitals mobile</h2>
<p>PageSpeed Insights > onglet Mobile. Objectifs 2026 :</p>
<ul>
<li>LCP < 2,5 s.</li>
<li>INP < 200 ms.</li>
<li>CLS < 0,1.</li>
<li>Score Lighthouse mobile > 90.</li>
</ul>
<p>Si vous etes en dessous, optimisations classiques : compresser images, lazy load, defer JS non critique, prefetch DNS, font-display swap.</p>
<h2>FAQ</h2>
<p><strong>Le responsive Elementor est-il fiable ?</strong></p>
<p>Oui en 2026 avec Elementor 3.20+. Les breakpoints sont reglables par section, colonne et widget. Attention aux paddings qui s additionnent et explosent en mobile : utilisez l onglet device-specific.</p>
<p><strong>Faut-il un menu hamburger sur tablette ?</strong></p>
<p>Tablette portrait (< 900 px) : oui. Tablette paysage (1024 px+) : non, gardez le menu horizontal complet.</p>
<p><strong>Comment tester rapidement le responsive sans device ?</strong></p>
<p>Chrome DevTools (Ctrl+Shift+M) + Firefox Responsive Design Mode (Ctrl+Shift+M) suffisent pour 80 % des cas.</p>
<blockquote>Un site non responsive en 2026 perd 60 % de son trafic potentiel et 95 % de sa credibilite. Aucune excuse.</blockquote>
<p>Vous voulez un audit responsive et Core Web Vitals complet ? <a href="/contact">Pirabel Labs vous livre un rapport detaille</a> en 48h.</p>"""},
        ],
    },
    {
        'title': 'Plugins themes et extensions',
        'objective': 'Selectionner les meilleurs plugins WordPress, prendre en main Elementor pour construire des pages, optimiser les images, securiser le site et automatiser les sauvegardes.',
        'duration': 240,
        'lessons': [
            {'title': "Top 10 des plugins WordPress incontournables",
             'duration': 18,
             'content_html': """<p>L ecosysteme WordPress compte plus de 60 000 plugins en 2026. 90 % sont mediocres ou abandonnes. Cette lecon vous donne les 10 plugins veritablement incontournables que Pirabel Labs deploie sur tous ses projets professionnels, avec leurs cas d usage, leurs alternatives et leurs pieges.</p>
<h2>1. Rank Math SEO Free ou Pro</h2>
<p>Le plugin SEO le plus complet en 2026. Gere les meta titres / descriptions, les balises Open Graph, les schemas Article / FAQ / Product / LocalBusiness, le sitemap XML, les redirections, le monitoring 404. Version Pro a 59 USD/an pour Schema avance, mot-cles secondaires, integration Search Console approfondie. Alternative : Yoast SEO Premium (99 USD/an).</p>
<h2>2. WP Rocket</h2>
<p>Le cache plugin premium reference. 59 USD/an. Active automatiquement page caching, browser caching, GZIP, lazy load images, defer JS, optimize CSS. Gain LCP moyen sur nos audits : 1,8 s a 0,9 s. Alternative gratuite : LiteSpeed Cache (si hebergeur LiteSpeed) ou WP Super Cache.</p>
<h2>3. UpdraftPlus</h2>
<p>Sauvegarde automatique de fichiers + base de donnees vers Google Drive, Dropbox, S3, Backblaze. Version gratuite suffit pour 80 % des cas. Version Premium 70 USD/an pour la migration de site et le clonage.</p>
<h2>4. Wordfence Security</h2>
<p>Pare-feu applicatif (WAF) + scan malware + monitoring tentatives de connexion. Version gratuite suffisante pour la majorite des sites. Premium 119 USD/an pour les sites a fort trafic ou ecommerce.</p>
<h2>5. ShortPixel ou Imagify</h2>
<p>Compression d images automatique en WebP et AVIF. ShortPixel : 5 USD pour 5 000 credits one-shot. Imagify : 10 USD/mois illimite. Gain de taille image moyen : 65 a 80 %, gain LCP 0,8 a 1,5 s.</p>
<h2>6. Fluent Forms ou WPForms</h2>
<p>Constructeur de formulaires drag-and-drop. Fluent Forms Pro 79 USD/an offre 90 % des fonctionnalites de WPForms Pro (199 USD/an) pour moins cher. Integration native Brevo, Mailchimp, HubSpot, Zapier, Make, n8n.</p>
<h2>7. Advanced Custom Fields (ACF)</h2>
<p>Permet d ajouter des champs personnalises aux pages, articles et Custom Post Types. Version gratuite suffit pour 90 % des cas. Pro 49 USD/an pour les Repeater Fields et Flexible Content. Indispensable des qu il faut depasser le couple "titre + contenu" classique.</p>
<h2>8. Site Kit by Google</h2>
<p>Gratuit. Regroupe Google Analytics 4, Search Console, AdSense, PageSpeed Insights dans une seule interface admin WordPress. Ideal pour les non-techniques qui veulent suivre leurs KPIs sans ouvrir 5 interfaces.</p>
<h2>9. WP-Optimize</h2>
<p>Nettoyage de la base de donnees : revisions d articles obsoletes, transients expires, tables non utilisees. Gratuit, lance manuellement ou planifie. Reduction moyenne du poids de la DB : 30 a 60 %.</p>
<h2>10. Limit Login Attempts Reloaded</h2>
<p>Gratuit. Bloque les IPs apres N tentatives de connexion echouees. Complement essentiel a Wordfence pour bloquer 99 % des brute force. Configuration recommandee : 4 tentatives, lockout 20 min, lockout cumule 24h apres 3 lockouts.</p>
<h2>Bonus : 5 plugins selon contexte</h2>
<ul>
<li><strong>WooCommerce</strong> : ecommerce.</li>
<li><strong>Polylang Pro / WPML</strong> : multilingue.</li>
<li><strong>Elementor Pro</strong> : page builder visuel.</li>
<li><strong>Complianz</strong> : RGPD cookies banner.</li>
<li><strong>WP Mail SMTP</strong> : delivrabilite emails transactionnels.</li>
</ul>
<h2>FAQ</h2>
<p><strong>Combien de plugins payants pour un site PME ?</strong></p>
<p>250 a 500 EUR/an pour la stack Pro complete (Rank Math Pro + WP Rocket + ShortPixel + Wordfence Premium + ACF Pro + Fluent Forms Pro). Excellent ROI vs la valeur economisee.</p>
<p><strong>Faut-il prendre les versions Pro ou Free ?</strong></p>
<p>Free suffit pour site vitrine moins de 20 pages. Pro a partir de blog 50+ articles ou ecommerce.</p>
<p><strong>Comment savoir si un plugin est fiable ?</strong></p>
<p>4 criteres : note > 4,5/5 sur WordPress.org, derniere mise a jour < 60 jours, support actif sur le forum, compatibilite avec la derniere version WP.</p>
<blockquote>Un bon plugin paye se rentabilise en 1 mois grace aux heures economisees. Ne soyez pas radin sur les outils essentiels.</blockquote>
<p>Vous voulez la stack complete adaptee a votre projet ? <a href="/contact">Demandez un devis Pirabel Labs</a>.</p>"""},
            {'title': "Installer Elementor et construire sa premiere page",
             'duration': 22,
             'content_html': """<p>Elementor est utilise sur plus de 14 millions de sites WordPress en 2026. C est le page builder visuel le plus populaire, avec une version gratuite robuste et une version Pro (99 USD/an) qui ajoute 90+ widgets, le Theme Builder, le Form Builder, le Popup Builder et l ecommerce builder. Cette lecon vous fait construire votre premiere page Elementor en 25 minutes chrono.</p>
<h2>1. Installer Elementor + theme compatible</h2>
<p>Etape 1 : Extensions > Ajouter > recherchez "Elementor" > Installer > Activer. Etape 2 : changez de theme pour un theme leger compatible : "Hello Elementor" (gratuit, fait par l equipe Elementor, 6 Ko de CSS) ou Astra ou GeneratePress.</p>
<p>Si vous voulez Elementor Pro, achetez la licence sur elementor.com (99 USD/an Pro, 199 USD/an Expert, 399 USD/an Studio), puis Extensions > Ajouter > Televerser le ZIP > Activer.</p>
<h2>2. Creer une nouvelle page Elementor</h2>
<ol>
<li>Pages > Ajouter.</li>
<li>Titre : "Acceuil v2" ou "Landing Service X".</li>
<li>Selectionnez le modele : "Elementor Canvas" (page vide sans header/footer) ou "Elementor Full Width" (page avec header/footer du theme).</li>
<li>Cliquez le bouton bleu "Modifier avec Elementor".</li>
<li>L editeur visuel s ouvre en plein ecran.</li>
</ol>
<h2>3. Anatomie de l editeur Elementor</h2>
<ul>
<li><strong>Sidebar gauche</strong> : 90+ widgets a glisser (Heading, Image, Button, Video, Form, Tabs, Accordion, etc.).</li>
<li><strong>Zone centrale</strong> : preview live de votre page.</li>
<li><strong>Bas a gauche</strong> : icones device (desktop / tablette / mobile) pour switch breakpoint.</li>
<li><strong>Bouton Publier (en bas)</strong> : sauvegarder + publier.</li>
<li><strong>Hamburger (en haut a gauche)</strong> : reglages globaux, historique, finder, kit du site.</li>
</ul>
<h2>4. Construire une section Hero en 8 etapes</h2>
<ol>
<li>Cliquez "+" pour ajouter une nouvelle section.</li>
<li>Choisissez la structure 2 colonnes (50/50 ou 60/40).</li>
<li>Dans la colonne gauche, glissez le widget Heading. Tapez "Boostez votre business avec Pirabel Labs".</li>
<li>Glissez widget Text Editor en dessous : 2 lignes de sous-titre.</li>
<li>Glissez widget Button : texte "Demander un devis", lien /contact, couleur primaire.</li>
<li>Dans la colonne droite, glissez widget Image > selectionnez une image hero 1200x900 px.</li>
<li>Reglez les paddings de section : Section > Avance > Padding 80 px haut/bas, 24 px lateraux.</li>
<li>Cliquez Publier.</li>
</ol>
<h2>5. Maitriser les 12 widgets les plus utilises</h2>
<ul>
<li><strong>Heading</strong> : titres H1 a H6.</li>
<li><strong>Text Editor</strong> : paragraphes riches.</li>
<li><strong>Image</strong> : photo simple ou hover effects.</li>
<li><strong>Button</strong> : CTA stylise.</li>
<li><strong>Icon Box</strong> : icone + titre + texte (services, features).</li>
<li><strong>Tabs / Accordion</strong> : FAQ, contenu structure.</li>
<li><strong>Image Carousel / Slider</strong> : galerie ou banniere.</li>
<li><strong>Video</strong> : YouTube ou self-hosted.</li>
<li><strong>Form (Pro)</strong> : formulaires custom.</li>
<li><strong>Pricing Table (Pro)</strong> : tableaux de prix.</li>
<li><strong>Posts (Pro)</strong> : grille d articles dynamique.</li>
<li><strong>Testimonial / Reviews</strong> : preuve sociale.</li>
</ul>
<h2>6. Reglages globaux (Kit du Site)</h2>
<p>Hamburger > Reglages du Kit du Site. Definissez vos couleurs globales (Primary, Secondary, Text, Accent), vos polices globales (Primary Headings, Secondary Headings, Body). Tous les widgets heriteront automatiquement. Si vous changez Primary Color, toutes les pages se mettent a jour.</p>
<h2>7. Performance : eviter le piege Elementor lent</h2>
<p>Reputation tenace : Elementor serait lent. Faux en 2026 si vous suivez ces 6 regles :</p>
<ol>
<li>Theme Hello Elementor ou Astra (pas un theme lourd type Avada).</li>
<li>Elementor 3.20+ avec Optimized DOM activated.</li>
<li>Pas plus de 20 widgets par page.</li>
<li>Compresser toutes les images avec ShortPixel WebP.</li>
<li>WP Rocket actif + lazy load + defer JS.</li>
<li>Hebergement decent (Hostinger Premium minimum).</li>
</ol>
<p>Resultat attendu : LCP < 2,5 s, Lighthouse mobile > 88.</p>
<h2>8. Templates et bibliotheque</h2>
<p>Elementor offre 300+ templates de page gratuits et 1 000+ en Pro. Cliquez "+" > icone "Dossier" > parcourez Library > Insert. Vous obtenez une page pre-faite que vous adaptez en 30 minutes.</p>
<h2>FAQ</h2>
<p><strong>Elementor gratuit suffit-il pour un site PME ?</strong></p>
<p>Oui pour site vitrine 5-10 pages simples. Pro indispensable des que vous voulez Theme Builder (header, footer, archive blog), Form Builder, Popup Builder.</p>
<p><strong>Faut-il choisir Elementor ou Gutenberg en 2026 ?</strong></p>
<p>Gutenberg si vous etes 100% blog SEO et que la vitesse pure est critique. Elementor si vous etes agence ou marketer et que vous voulez la flexibilite design.</p>
<p><strong>Comment former mon equipe a Elementor ?</strong></p>
<p>Formation interne 1 jour suffit pour les bases. Cours complet : academie Elementor (gratuit) + 10h de pratique.</p>
<blockquote>Elementor democratise le web design. En 2 semaines, un non-developpeur livre des pages dignes d une agence.</blockquote>
<p>Vous voulez une formation Elementor pour votre equipe ? <a href="/rendez-vous">Reservez un atelier Pirabel Labs</a>.</p>
<h2>Annexe : 20 widgets Elementor Pro avances</h2>
<ul>
<li><strong>Posts</strong> : grille dynamique d articles avec filtres categories.</li>
<li><strong>Portfolio</strong> : grille CPT projets avec masonry.</li>
<li><strong>Slides</strong> : slider full screen avec parallax.</li>
<li><strong>Form</strong> : formulaire avec actions multiples (envoi email, redirection, webhook, Brevo).</li>
<li><strong>Login</strong> : formulaire de connexion stylise.</li>
<li><strong>Lottie</strong> : animations Lottie pour micro-interactions.</li>
<li><strong>Nav Menu</strong> : menu horizontal ou vertical custom.</li>
<li><strong>Search Form</strong> : barre de recherche WordPress stylise.</li>
<li><strong>Theme Builder Header/Footer</strong> : header et footer globaux.</li>
<li><strong>Popup Builder</strong> : popups exit-intent, scroll, time-based.</li>
<li><strong>WooCommerce Products</strong> : grille produits.</li>
<li><strong>Add to Cart</strong> : bouton ajout panier custom.</li>
<li><strong>Cart</strong> : page panier custom.</li>
<li><strong>Checkout</strong> : page checkout custom.</li>
<li><strong>My Account</strong> : page compte client custom.</li>
<li><strong>Mega Menu</strong> : menu deroulant riche.</li>
<li><strong>Off-Canvas</strong> : panneau lateral coulissant (filtre, cart, menu mobile).</li>
<li><strong>Loop Builder</strong> : custom queries WP_Query visuelles.</li>
<li><strong>Hover Box</strong> : effet hover avec contenu reveal.</li>
<li><strong>Code Embed</strong> : insertion HTML/JS custom.</li>
</ul>
<h2>Annexe : Elementor vs Bricks vs Breakdance vs Cwicly en 2026</h2>
<p>L ecosysteme page builders WordPress s est densifie en 2026. Voici la comparaison rapide :</p>
<ul>
<li><strong>Elementor</strong> : leader, ecosysteme massif, 14M sites, parfois lourd.</li>
<li><strong>Bricks Builder</strong> : challenger 2024-2026, plus rapide, courbe d apprentissage plus raide. Licence one-shot 80-249 USD.</li>
<li><strong>Breakdance</strong> : par les makers d Oxygen, drag-and-drop fluide, focus performance. 149 USD/an.</li>
<li><strong>Cwicly</strong> : 100 % blocks Gutenberg, ultra-leger, pour developpeurs. 99 USD/an.</li>
</ul>
<p>Pirabel Labs recommande Elementor pour 80 % des projets PME (ecosysteme + plugins + formation). Bricks pour les projets ou la performance pure est non-negociable.</p>"""},
            {'title': "Optimiser les images : WebP, lazy load, compression",
             'duration': 16,
             'content_html': """<p>Les images representent en moyenne 60 % du poids total d une page web en 2026. Mal optimisees, elles font exploser le LCP, ruinent les Core Web Vitals et consomment inutilement la bande passante mobile de vos visiteurs (critique en Afrique ou les forfaits 4G coutent 5 a 15 EUR/Go). Cette lecon vous donne la methode complete pour optimiser vos images WordPress en 5 etapes.</p>
<h2>1. Choisir le bon format en 2026</h2>
<ul>
<li><strong>WebP</strong> : format de reference 2026. Compression 25 a 35 % superieure au JPG, qualite equivalente. Supporte par 98 % des navigateurs.</li>
<li><strong>AVIF</strong> : prochaine generation. Compression 50 % superieure au JPG. Support 92 % en 2026. Encore limite par les outils d edition.</li>
<li><strong>SVG</strong> : pour les logos, icones, illustrations geometriques. Vectoriel, leger.</li>
<li><strong>JPG</strong> : fallback pour les vieux navigateurs. Photo classique.</li>
<li><strong>PNG</strong> : seulement si vous avez besoin de transparence et pas de SVG.</li>
</ul>
<p>Strategie recommandee : convertir tout en WebP avec fallback JPG automatique. ShortPixel ou Imagify le font en un clic.</p>
<h2>2. Dimensionner correctement les images</h2>
<p>Avant d uploader, redimensionnez :</p>
<ul>
<li><strong>Hero / banniere full width</strong> : 1920 x 1080 px max.</li>
<li><strong>Image article blog</strong> : 1200 x 800 px.</li>
<li><strong>Vignette grille</strong> : 600 x 400 px.</li>
<li><strong>Avatar / profil</strong> : 200 x 200 px.</li>
<li><strong>Logo</strong> : 400 x 100 px (ou SVG).</li>
</ul>
<p>Ne uploadez JAMAIS l image 6000 x 4000 px directe de votre Reflex. Resize d abord avec Squoosh.app, TinyPNG ou Photoshop.</p>
<h2>3. Activer la compression automatique</h2>
<p>Plugin ShortPixel ou Imagify : Settings > Options > Compression Level = "Glossy" (90 % qualite visuelle, 70 % gain poids). Activez : WebP delivery + AVIF delivery + Backup originals + Resize too large images.</p>
<p>Lancez bulk optimization pour compresser toutes les images deja uploadees. Comptez 1 a 4 heures selon la quantite.</p>
<h2>4. Activer le lazy load natif WordPress</h2>
<p>Depuis WordPress 5.5, le lazy load est natif via l attribut <code>loading="lazy"</code>. Verifiez dans le HTML qu il est present sur vos images. Pour les videos et iframes, plugin a3 Lazy Load (gratuit) ou WP Rocket.</p>
<p>Exception : NE PAS lazy-loader l image hero above the fold (penalite LCP). Marquez-la <code>loading="eager"</code> et idealement avec <code>fetchpriority="high"</code>.</p>
<h2>5. Utiliser srcset pour le responsive</h2>
<p>WordPress genere automatiquement plusieurs tailles d image (thumbnail, medium, medium_large, large, full) et les sert via <code>srcset</code> selon le viewport du visiteur. Verifiez que votre theme respecte bien <code>the_post_thumbnail()</code> avec le bon size attribute.</p>
<h2>6. CDN pour les images</h2>
<p>Servir les images via un CDN reduit la latence mondiale de 200 a 600 ms. Solutions :</p>
<ul>
<li><strong>Cloudflare gratuit</strong> : CDN global de base.</li>
<li><strong>BunnyCDN</strong> : 1 USD/mois pour 100 Go, le meilleur ratio prix/performance.</li>
<li><strong>Cloudflare Images</strong> : 5 USD/mois, optimisation et delivery automatique.</li>
<li><strong>ImageKit</strong> : free tier 20 Go/mois.</li>
</ul>
<h2>7. Alt text : SEO et accessibilite</h2>
<p>Chaque image doit avoir un attribut <code>alt</code> descriptif (5 a 15 mots) : utile pour les non-voyants (lecteurs d ecran) et le SEO image (positionnement Google Images). Bad : "image1.jpg". Good : "Boulangerie artisanale a Cotonou specialisee en pain au levain bio".</p>
<h2>8. Verifier le resultat</h2>
<p>Lancez PageSpeed Insights sur votre page. Section "Images" : verifiez que tous les warnings sont resolus : "Encode images efficiently", "Serve images in next-gen formats", "Properly size images", "Defer offscreen images".</p>
<h2>FAQ</h2>
<p><strong>WebP ou AVIF en 2026 ?</strong></p>
<p>WebP pour la compatibilite (98 %). AVIF si votre audience est majoritairement Chrome / Edge moderne (gain 30 % supplementaire).</p>
<p><strong>Faut-il payer ShortPixel ou Imagify ?</strong></p>
<p>ShortPixel 5 USD pour 5 000 credits one-shot rentabilise des le premier mois pour 99 % des sites. Imagify 10 USD/mois si plus de 5 000 images / mois.</p>
<p><strong>Pourquoi mon Lighthouse Image score reste faible ?</strong></p>
<p>Verifiez : compression activee, WebP delivere, lazy load OK, dimensions correctes. Si rien ne marche, c est probablement votre theme qui ignore <code>the_post_thumbnail</code>.</p>
<blockquote>Une image WebP correctement compressee fait gagner 0,8 a 2 s de LCP. C est la plus grosse marge de progression sur 95 % des sites.</blockquote>
<p>Audit images gratuit : <a href="/contact">Pirabel Labs vous remet un rapport personnalise</a> en 48h.</p>"""},
            {'title': "Securiser WordPress contre les attaques courantes",
             'duration': 20,
             'content_html': """<p>WordPress represente 43 % des sites web mondiaux en 2026 et concentre 90 % des attaques CMS selon Sucuri Annual Report 2025. Site non securise = 2 a 8 mois de vie avant la premiere infection. Cette lecon vous donne le plan de securisation Pirabel Labs en 12 etapes que nous deployons sur 100 % de nos sites clients.</p>
<h2>1. Maintenir le core, themes et plugins a jour</h2>
<p>80 % des hacks viennent de plugins / themes non mis a jour. Activez les mises a jour automatiques mineures du core WordPress (deja par defaut depuis WP 5.6). Pour les plugins critiques, activez aussi : Extensions > clic sur "Activer les mises a jour automatiques" pour chaque plugin.</p>
<h2>2. Supprimer les utilisateurs admin par defaut</h2>
<p>Si vous avez un user "admin", creez un nouvel utilisateur avec un identifiant non devinable (genre "g-lissanon-2026"), puis supprimez "admin" en attribuant ses contenus au nouvel user.</p>
<h2>3. Mots de passe forts + 2FA</h2>
<p>Tous les utilisateurs admin doivent avoir un mot de passe 16+ caracteres genere par Bitwarden / 1Password + 2FA active. Plugin : WP 2FA (gratuit) ou Wordfence Login Security. Methode 2FA recommandee : authenticator app (Authy, Google Authenticator), pas SMS (intercepte par SIM swap).</p>
<h2>4. Limit Login Attempts</h2>
<p>Plugin Limit Login Attempts Reloaded (gratuit). Reglage : 4 tentatives, lockout 20 min, cumul 3 lockouts > 24h ban. Bloque 99 % des bots brute force.</p>
<h2>5. Masquer l URL admin</h2>
<p>Plugin WPS Hide Login (gratuit). Changez /wp-admin et /wp-login.php en /entree-secrete-xyz-2026. Reduction de 95 % des tentatives de connexion automatisees.</p>
<h2>6. Installer Wordfence ou Solid Security</h2>
<p>Wordfence Free : pare-feu applicatif (WAF), scan malware quotidien, monitoring login. Activez le mode Extended Protection (Wordfence > All Options > Firewall > Optimization). Solid Security alternative : meilleur sur le hardening.</p>
<h2>7. Disable XML-RPC et REST API publics</h2>
<p>XML-RPC est un point d entree historique pour les attaques. Si vous n utilisez pas Jetpack ou app mobile WordPress, desactivez-le : plugin Disable XML-RPC ou ligne <code>add_filter('xmlrpc_enabled', '__return_false');</code> dans functions.php.</p>
<p>REST API : limitez les endpoints publics. Plugin Disable REST API ou code custom pour bloquer /users endpoint qui leak les usernames.</p>
<h2>8. SSL HTTPS partout</h2>
<p>Let s Encrypt gratuit chez tous les hebergeurs serieux. Forcez HTTPS via Reglages > General > URL en https://, ou plugin Really Simple SSL, ou regle .htaccess.</p>
<h2>9. Hardening wp-config.php</h2>
<p>Editez wp-config.php :</p>
<ul>
<li>Generer de nouvelles cles de securite (Salts) sur api.wordpress.org/secret-key/1.1/salt/.</li>
<li><code>define('DISALLOW_FILE_EDIT', true);</code> : empeche l edition de fichiers depuis l admin (utile en cas de hack).</li>
<li><code>define('FORCE_SSL_ADMIN', true);</code> : force SSL pour la connexion admin.</li>
<li><code>define('WP_AUTO_UPDATE_CORE', 'minor');</code> : mises a jour mineures automatiques.</li>
</ul>
<h2>10. Permissions de fichiers correctes</h2>
<p>SSH ou FTP, verifiez : fichiers en 644, dossiers en 755, wp-config.php en 600. Commandes :</p>
<p><code>find . -type f -exec chmod 644 {} \\;</code><br/>
<code>find . -type d -exec chmod 755 {} \\;</code><br/>
<code>chmod 600 wp-config.php</code></p>
<h2>11. Sauvegardes externes</h2>
<p>UpdraftPlus + Google Drive / Backblaze. Sauvegarde quotidienne fichiers + DB, retention 30 jours. La sauvegarde stockee uniquement sur le meme serveur que le site est inutile (perdue en cas de hack du serveur).</p>
<h2>12. Monitoring et alertes</h2>
<p>Wordfence envoie email a chaque tentative login admin reussie / echouee. UptimeRobot (gratuit) pour monitoring uptime / downtime. Sucuri SiteCheck (gratuit) pour scan malware mensuel externe.</p>
<h2>FAQ</h2>
<p><strong>Wordfence gratuit suffit-il ?</strong></p>
<p>Oui pour 90 % des sites PME. Premium 119 USD/an si vous etes ecommerce a fort trafic ou cible recurrente.</p>
<p><strong>Que faire si mon site est hacke ?</strong></p>
<p>1) Mettre en maintenance, 2) Restaurer la derniere sauvegarde clean, 3) Mettre a jour core + plugins + themes, 4) Changer tous les mots de passe + cles, 5) Scanner avec Wordfence + Sucuri, 6) Soumettre au Google Search Console pour re-crawl.</p>
<p><strong>Faut-il payer un service comme Sucuri ou WP Engine pour la securite ?</strong></p>
<p>Si vous gerez plus de 10 sites ou un ecommerce a CA elevee, oui. Sucuri 199 USD/an. WP Engine inclut la securite managee dans son hebergement.</p>
<blockquote>La securite WordPress c est 90 % de discipline (mises a jour, mots de passe forts, 2FA) et 10 % de plugins. Ne negligez ni l un ni l autre.</blockquote>
<p>Audit securite gratuit en 60 minutes : <a href="/rendez-vous">reservez avec un expert Pirabel Labs</a>.</p>
<h2>Annexe : protocole de reponse a incident hack WordPress</h2>
<p>Si votre site est compromis, voici la procedure Pirabel Labs en 12 etapes :</p>
<ol>
<li><strong>0-30 min</strong> : detecter l incident (alerte Wordfence, Google Search Console, signalement client).</li>
<li><strong>30-60 min</strong> : passer le site en maintenance mode (plugin LightStart ou .htaccess).</li>
<li><strong>1h</strong> : prevenir l hebergeur (souvent il a deja detecte et bloque).</li>
<li><strong>1-2h</strong> : sauvegarder l etat hacke pour analyse forensic.</li>
<li><strong>2-3h</strong> : changer TOUS les mots de passe : admin WP, FTP, SSH, MySQL, cPanel.</li>
<li><strong>3-4h</strong> : regenerer les cles wp-config.php (Salts).</li>
<li><strong>4-6h</strong> : scanner avec Wordfence + Sucuri Scanner + MalCare.</li>
<li><strong>6-12h</strong> : restaurer la derniere sauvegarde clean (avant infection).</li>
<li><strong>12-18h</strong> : mettre a jour core + tous plugins + tous themes.</li>
<li><strong>18-24h</strong> : analyser logs serveur pour identifier la faille originale.</li>
<li><strong>24-48h</strong> : soumettre le site a Google Search Console pour le re-crawl.</li>
<li><strong>48h+</strong> : post-mortem ecrit + plan de durcissement pour eviter la recidive.</li>
</ol>
<h2>Annexe : couts moyens d un hack WordPress en 2026</h2>
<ul>
<li><strong>Reparation simple (defacement, redirection malveillante)</strong> : 400-1 200 EUR.</li>
<li><strong>Reparation complexe (backdoor, malware injecte)</strong> : 1 500-4 500 EUR.</li>
<li><strong>Reparation tres complexe (DB compromise, donnees clients exfiltrees)</strong> : 5 000-25 000 EUR + notification CNIL (RGPD).</li>
<li><strong>Perte de CA durant la reparation</strong> : variable, jusqu a 5 a 30 jours de downtime.</li>
<li><strong>Perte SEO si Google blacklist</strong> : 30 a 90 jours de trafic perdus.</li>
<li><strong>Perte de reputation</strong> : intangible mais significative (clients qui ne reviennent pas).</li>
</ul>
<p>L investissement dans la prevention (200-500 EUR/an de plugins securite + 1-2h/mois de maintenance) est sans commune mesure avec le cout d un hack non gere.</p>"""},
            {'title': "Sauvegardes automatiques et plan de continuite",
             'duration': 14,
             'content_html': """<p>Une sauvegarde mal configuree, c est l illusion de securite la plus dangereuse en 2026. 70 % des PME pensent etre sauvegardees mais ne le sont pas vraiment lors du test de restauration. Cette lecon vous donne le plan de sauvegarde et de continuite d activite (BCP) que Pirabel Labs deploie sur 100 % des sites clients.</p>
<h2>1. La regle 3-2-1 des sauvegardes</h2>
<ul>
<li><strong>3 copies</strong> de vos donnees.</li>
<li><strong>2 supports</strong> differents (disque local + cloud).</li>
<li><strong>1 copie offsite</strong> (geographiquement separee du serveur principal).</li>
</ul>
<p>Exemple Pirabel Labs : 1) site production + 2) sauvegarde Google Drive + 3) sauvegarde Backblaze B2 (offsite Europe). En cas de catastrophe (hack, hebergeur down, erreur humaine), vous restaurez en 30 min.</p>
<h2>2. Configurer UpdraftPlus en 10 minutes</h2>
<ol>
<li>Installez UpdraftPlus (gratuit ou Premium 70 USD/an).</li>
<li>Reglages > Settings.</li>
<li>Sauvegarde fichiers : Daily, garder 7 dernieres.</li>
<li>Sauvegarde base de donnees : Daily, garder 14 dernieres.</li>
<li>Stockage distant : connectez Google Drive et Backblaze B2.</li>
<li>Cliquez "Save Changes" puis "Backup Now" pour la premiere sauvegarde manuelle.</li>
<li>Verifiez que la sauvegarde apparait dans Google Drive et Backblaze.</li>
</ol>
<h2>3. Alternatives a UpdraftPlus</h2>
<ul>
<li><strong>WPVivid Backup Pro</strong> (49 USD/an) : plus rapide, meilleure migration.</li>
<li><strong>BackupBuddy / Solid Backups</strong> (99 USD/an).</li>
<li><strong>Jetpack Backup</strong> (49 USD/an) : sauvegarde temps reel, ideal ecommerce.</li>
<li><strong>BlogVault</strong> (89 USD/an) : sauvegarde managee + staging + restore 1 clic.</li>
<li><strong>Sauvegarde hebergeur</strong> : Kinsta, WP Engine, Cloudways incluent sauvegardes daily auto. Bon complement, jamais en substitut.</li>
</ul>
<h2>4. Tester la restauration tous les 90 jours</h2>
<p>Sauvegarde non testee = sauvegarde inutile. Tous les 3 mois :</p>
<ol>
<li>Telechargez la derniere sauvegarde sur votre ordinateur.</li>
<li>Creez un site de test sur sous-domaine (test.votremarque.com).</li>
<li>Restaurez la sauvegarde sur ce site test.</li>
<li>Verifiez que toutes les pages, articles, plugins, theme fonctionnent.</li>
<li>Documentez le temps de restauration (RTO).</li>
</ol>
<h2>5. RTO et RPO : les 2 metriques cles</h2>
<ul>
<li><strong>RTO (Recovery Time Objective)</strong> : combien de temps pour restaurer ? Cible 2026 : moins de 2h.</li>
<li><strong>RPO (Recovery Point Objective)</strong> : combien de donnees perdues acceptable ? Cible : moins de 24h pour blog vitrine, moins de 1h pour ecommerce.</li>
</ul>
<h2>6. Plan de continuite d activite (BCP)</h2>
<p>Document de 1 a 3 pages qui couvre :</p>
<ol>
<li>Inventaire des actifs critiques (site, base de donnees, emails, comptes admin).</li>
<li>Procedure de restauration etape par etape.</li>
<li>Contacts d urgence (hebergeur, registrar, agence).</li>
<li>Acces de secours (cle SSH backup, code 2FA backup).</li>
<li>Communication crise (template email client + reseaux sociaux).</li>
</ol>
<p>Stockez ce document sur Google Drive partage avec au moins 2 personnes de confiance (cofondateur, agence).</p>
<h2>7. Sauvegardes ecommerce : cas particulier</h2>
<p>WooCommerce : commandes, paiements, clients changent en temps reel. Sauvegarde quotidienne insuffisante. Solution : Jetpack Backup ou BlogVault avec sauvegarde temps reel (chaque action loggee).</p>
<h2>FAQ</h2>
<p><strong>Combien de temps garder les sauvegardes ?</strong></p>
<p>Minimum 30 jours, ideal 90 jours. Au-dela, archivez sur stockage froid (Backblaze B2 Cold Storage 0,004 USD/Go/mois).</p>
<p><strong>Sauvegarde fichiers et DB separees ou combinees ?</strong></p>
<p>Combinees pour simplicite, separees pour granularite (restaurer seulement la DB sans toucher aux fichiers).</p>
<p><strong>Que sauvegarder en plus du site WordPress ?</strong></p>
<p>Emails (Google Workspace ou Microsoft 365), comptes admin (Bitwarden export), documentation technique (Notion / Confluence export), assets bruts (Figma, Drive).</p>
<blockquote>Le jour ou vous restaurerez une sauvegarde sera le jour ou vous saurez si vous avez vraiment fait votre travail.</blockquote>
<p>Pirabel Labs met en place votre plan de sauvegarde et continuite. <a href="/contact">Devis gratuit en 24h</a>.</p>"""},
        ],
    },
    {
        'title': 'Performance et securite',
        'objective': 'Optimiser les Core Web Vitals, atteindre un score Lighthouse 90+, hardener la securite avancee, deployer un CDN et migrer le site sans casse.',
        'duration': 240,
        'lessons': [
            {'title': "Performance : optimiser le LCP, FID, CLS",
             'duration': 22,
             'content_html': """<p>Les Core Web Vitals (LCP, INP qui remplace FID, CLS) sont passes en 2026 au rang de signal de classement Google majeur. Un site qui rate les CWV perd 18 a 35 % de visibilite Search vs un site qui les valide. Cette lecon vous donne le playbook complet pour passer un site WordPress de Lighthouse mobile 45 a 90+, methode appliquee sur 380+ sites Pirabel Labs.</p>
<h2>1. Comprendre les 3 Core Web Vitals</h2>
<ul>
<li><strong>LCP (Largest Contentful Paint)</strong> : temps avant que le plus grand element visible (image hero, titre H1, video poster) s affiche. Cible : moins de 2,5 s. Acceptable : 2,5 a 4 s. Mauvais : plus de 4 s.</li>
<li><strong>INP (Interaction to Next Paint)</strong> : remplacant de FID depuis mars 2024. Temps de reponse aux interactions (clic, tap, keypress). Cible : moins de 200 ms. Mauvais : plus de 500 ms.</li>
<li><strong>CLS (Cumulative Layout Shift)</strong> : decalage visuel cumule durant le chargement. Cible : moins de 0,1. Mauvais : plus de 0,25.</li>
</ul>
<h2>2. Diagnostiquer avec PageSpeed Insights</h2>
<p>Allez sur pagespeed.web.dev, collez votre URL. Analysez les 2 sections :</p>
<ul>
<li><strong>Donnees de terrain (CrUX)</strong> : ce que vivent reellement vos utilisateurs Chrome. Source de verite pour Google.</li>
<li><strong>Donnees de laboratoire</strong> : test Lighthouse simule.</li>
</ul>
<p>Si la section CrUX est absente, votre site n a pas assez de trafic Chrome (moins de 1 000 visiteurs/mois). Concentrez-vous sur Lighthouse en attendant.</p>
<h2>3. Optimiser le LCP en 6 actions</h2>
<ol>
<li><strong>Compresser l image hero en WebP/AVIF</strong> (gain 0,5 a 1,5 s).</li>
<li><strong>Pre-charger l image hero</strong> : <code>&lt;link rel="preload" as="image" href="hero.webp" fetchpriority="high"&gt;</code>.</li>
<li><strong>Eviter le lazy load sur le hero</strong> : <code>loading="eager" fetchpriority="high"</code>.</li>
<li><strong>Reduire le TTFB</strong> : cache page (WP Rocket), CDN Cloudflare, hebergement decent.</li>
<li><strong>Defer les fonts</strong> : <code>font-display: swap</code> + preload fonts critiques.</li>
<li><strong>Critical CSS inline</strong> : extraire le CSS above-the-fold et l inliner dans le head (WP Rocket le fait automatiquement).</li>
</ol>
<h2>4. Optimiser l INP en 5 actions</h2>
<ol>
<li><strong>Reduire le JS non critique</strong> : audit avec Coverage tab DevTools, supprimer les plugins lourds.</li>
<li><strong>Defer JS</strong> : tous les scripts non critiques en <code>defer</code> ou <code>async</code>.</li>
<li><strong>Code splitting</strong> : ne charger que le JS necessaire par page (Elementor le fait nativement).</li>
<li><strong>Web Workers</strong> : pour les calculs lourds, deleguer a un worker hors thread main.</li>
<li><strong>Eviter les event listeners gourmands</strong> : debounce / throttle sur scroll, resize, input.</li>
</ol>
<h2>5. Optimiser le CLS en 4 actions</h2>
<ol>
<li><strong>Specifier width et height sur toutes les images</strong>.</li>
<li><strong>Reserver l espace pour les iframes</strong> (YouTube, ads) avec aspect-ratio CSS.</li>
<li><strong>Eviter les injections dynamiques above-the-fold</strong> (cookie banner trop volumineux, popup en haut).</li>
<li><strong>Font swap propre</strong> : font-display: swap + fallback font dimensionne comme la font finale (avec font-size-adjust).</li>
</ol>
<h2>6. Stack technique recommandee 2026</h2>
<ul>
<li><strong>Hebergeur</strong> : Hostinger Premium, Kinsta, WP Engine, Cloudways DigitalOcean.</li>
<li><strong>Theme</strong> : Astra Pro, GeneratePress Premium, Kadence (< 35 Ko CSS).</li>
<li><strong>Cache</strong> : WP Rocket ou LiteSpeed Cache.</li>
<li><strong>Images</strong> : ShortPixel ou Imagify, WebP / AVIF.</li>
<li><strong>CDN</strong> : Cloudflare gratuit ou BunnyCDN 1 USD/mois.</li>
<li><strong>JS / CSS optim</strong> : WP Rocket Concatenate / Minify / Defer.</li>
<li><strong>Plugins limites</strong> : 12 a 18 max actifs.</li>
</ul>
<h2>7. Cas d etude reel : restaurant Cotonou</h2>
<p>Avant : LCP 4,8 s, INP 420 ms, CLS 0,28, Lighthouse mobile 38. Apres 4h d optimisation : LCP 1,9 s, INP 180 ms, CLS 0,05, Lighthouse mobile 92. Trafic organique +47 % en 90 jours.</p>
<p>Actions appliquees : migration vers Hostinger Premium, theme GeneratePress, ShortPixel WebP, WP Rocket, suppression de 8 plugins inutiles, Cloudflare CDN.</p>
<h2>FAQ</h2>
<p><strong>Combien coute une optimisation Lighthouse 45 a 90 ?</strong></p>
<p>4 a 12h de travail expert (selon le site). Tarif Pirabel Labs : 480 a 1 440 EUR. ROI moyen : trafic organique +35 % en 90 jours, conversions +18 %.</p>
<p><strong>WP Rocket vaut-il vraiment 59 USD/an ?</strong></p>
<p>Oui dans 95 % des cas. Le temps gagne sur la configuration (vs LiteSpeed Cache qui demande 4h de setup) le rentabilise des le mois 1.</p>
<p><strong>Comment monitorer les CWV au quotidien ?</strong></p>
<p>Google Search Console > Experience > Core Web Vitals. Plus precis : Speedlify (open source) ou DebugBear (29 USD/mois).</p>
<blockquote>Performance = SEO = conversion = CA. Un site lent en 2026 c est un site qui meurt en 18 mois.</blockquote>
<p>Audit performance Pirabel Labs : <a href="/rendez-vous">RDV gratuit en 60 min</a> avec rapport detaille remis.</p>
<h2>Annexe : checklist d audit CWV en 12 etapes</h2>
<ol>
<li>Lancer PageSpeed Insights sur 5 URLs cles (mobile + desktop).</li>
<li>Capturer les scores CrUX et Lighthouse de chaque URL.</li>
<li>Identifier le LCP element (image hero, titre H1, video, etc.).</li>
<li>Verifier la presence d un preload sur le LCP.</li>
<li>Verifier l absence de lazy load sur le LCP.</li>
<li>Identifier les ressources render-blocking (CSS, JS critiques non defer).</li>
<li>Auditer le poids total page (cible &lt; 1,6 Mo).</li>
<li>Auditer le nombre de requetes HTTP (cible &lt; 80).</li>
<li>Verifier le TTFB serveur (cible &lt; 600 ms).</li>
<li>Identifier les images non WebP/AVIF restantes.</li>
<li>Verifier la presence de width/height sur images (CLS).</li>
<li>Generer le rapport synthese pour le client.</li>
</ol>
<p>Cette checklist est appliquee a chaque audit Pirabel Labs et garantit une couverture exhaustive des points de friction Core Web Vitals.</p>
<h2>Annexe : tableau de correspondance Lighthouse > business impact</h2>
<ul>
<li><strong>Lighthouse 90+</strong> : trafic SEO maximal, conversion 100 %, UX premium.</li>
<li><strong>Lighthouse 70-89</strong> : penalite legere CWV, conversion -8 a -12 %.</li>
<li><strong>Lighthouse 50-69</strong> : penalite SEO moderee, conversion -20 a -30 %.</li>
<li><strong>Lighthouse 0-49</strong> : penalite SEO severe, conversion -40 a -55 %, image de marque degradee.</li>
</ul>
<p>Ces chiffres proviennent de l etude Akamai 2024 confirmee par Google Web.dev. Un site Lighthouse 45 perd litteralement la moitie de ses conversions vs un site Lighthouse 90.</p>"""},
            {'title': "Audit Lighthouse Mobile : objectif 90+",
             'duration': 18,
             'content_html': """<p>Lighthouse est l outil d audit web automatise de Google. Il evalue Performance, Accessibilite, Best Practices et SEO de 0 a 100. Un score mobile 90+ sur les 4 categories est le standard pro 2026. Cette lecon vous donne la methode pour auditer puis atteindre 90+ sur n importe quel site WordPress.</p>
<h2>1. Lancer un audit Lighthouse</h2>
<p>3 methodes :</p>
<ul>
<li><strong>Chrome DevTools</strong> (gratuit, local) : F12 > onglet Lighthouse > Mobile + Performance/Accessibility/Best Practices/SEO > Generate Report.</li>
<li><strong>PageSpeed Insights</strong> (gratuit, en ligne) : pagespeed.web.dev > collez URL.</li>
<li><strong>web.dev/measure</strong> (gratuit) : autre interface Google.</li>
</ul>
<p>Toujours auditer en mode Mobile (cible Google) et en navigation privee (sans extensions qui polluent les metriques).</p>
<h2>2. Interpreter les 4 scores</h2>
<ul>
<li><strong>Performance</strong> : Core Web Vitals + autres metriques techniques. Le plus dur a atteindre.</li>
<li><strong>Accessibilite</strong> : contraste, alt text, labels formulaires, ARIA. Atteint 90+ avec quelques heures de travail.</li>
<li><strong>Best Practices</strong> : HTTPS, console errors, deprecations, securite. Quasi automatique.</li>
<li><strong>SEO</strong> : meta titles, descriptions, mobile-friendly, structured data. Atteint 100 facilement avec Rank Math.</li>
</ul>
<h2>3. Plan d action Performance 90+</h2>
<p>Suivez l ordre dans Lighthouse Opportunities :</p>
<ol>
<li><strong>Properly size images</strong> : redimensionner aux dimensions affichees.</li>
<li><strong>Serve images in next-gen formats</strong> : WebP / AVIF via ShortPixel.</li>
<li><strong>Defer offscreen images</strong> : lazy load native ou a3 Lazy Load.</li>
<li><strong>Minify CSS / JS</strong> : WP Rocket actif.</li>
<li><strong>Remove unused CSS</strong> : WP Rocket Remove Unused CSS ou Asset CleanUp.</li>
<li><strong>Eliminate render-blocking resources</strong> : Critical CSS + Defer JS.</li>
<li><strong>Preload key requests</strong> : preload hero image + fonts critiques.</li>
<li><strong>Avoid enormous network payloads</strong> : viser moins de 1,6 Mo total page.</li>
</ol>
<h2>4. Plan d action Accessibility 90+</h2>
<ol>
<li>Verifier contraste 4,5:1 minimum (utiliser Coolors Contrast Checker).</li>
<li>Ajouter alt text descriptifs sur toutes les images.</li>
<li>Labels associes aux inputs formulaires.</li>
<li>Heading order respecte (H1 unique, H2 puis H3, pas de saut).</li>
<li>aria-label sur les icones interactives sans texte.</li>
<li>tabindex coherent pour navigation clavier.</li>
</ol>
<h2>5. Plan d action SEO 90+</h2>
<ol>
<li>Meta title 50-60 caracteres unique par page.</li>
<li>Meta description 140-160 caracteres unique par page.</li>
<li>Balise viewport mobile presente (auto via theme).</li>
<li>HTTPS et lien canonical.</li>
<li>Robots.txt valide (sitemap.xml reference).</li>
<li>Pas de noindex sur les pages a indexer.</li>
</ol>
<h2>6. Best Practices 90+</h2>
<ol>
<li>HTTPS partout.</li>
<li>Aucune erreur console dans la page.</li>
<li>Aucune dependence JS deprecated.</li>
<li>Cookies SameSite + Secure flags.</li>
<li>CSP headers (Content Security Policy) configures.</li>
</ol>
<h2>7. Tester sur plusieurs pages</h2>
<p>N auditez pas que la home. Lancez Lighthouse sur 5 pages cles : home, page service, article blog long, page contact, page checkout. Souvent la home est OK mais une page interne plombe le score global Search Console.</p>
<h2>FAQ</h2>
<p><strong>Lighthouse 90 ou 100 ?</strong></p>
<p>90+ est l objectif pro realiste. Atteindre 100 demande des compromis (pas d analytics, pas de chat widget) souvent incompatibles avec un site business.</p>
<p><strong>Pourquoi mon score varie entre 2 audits ?</strong></p>
<p>Lighthouse est sensible a la latence reseau, charge serveur, etat du cache. Lancez 3 audits et prenez la mediane.</p>
<p><strong>Mon hebergement est-il le probleme ?</strong></p>
<p>Si le TTFB est > 800 ms en local de l hebergeur (Paris pour OVH France), oui. Considerez Hostinger, Kinsta, Cloudways.</p>
<blockquote>Lighthouse 90+ n est plus optionnel en 2026. C est la baseline d un site qui veut etre pris au serieux.</blockquote>
<p>Audit Lighthouse complet en 60 minutes : <a href="/contact">Pirabel Labs vous remet le rapport detaille</a>.</p>"""},
            {'title': "Hardening securite : 2FA, captcha, audit logs",
             'duration': 16,
             'content_html': """<p>Au-dela de la securite basique (Wordfence + 2FA + sauvegardes), un hardening avance fait passer la barriere d entree d un attaquant de 5 minutes a plusieurs heures. Cette lecon couvre les techniques pro pour blinder un site WordPress sensible (ecommerce, espace membre, donnees clients).</p>
<h2>1. 2FA pour TOUS les utilisateurs admin et editeur</h2>
<p>Plugin WP 2FA (gratuit) ou Wordfence Login Security. Forcez 2FA via :</p>
<ul>
<li>WP 2FA > Settings > Force 2FA for these roles : Administrator + Editor + Shop Manager.</li>
<li>Methodes autorisees : TOTP (Google Authenticator, Authy) + Backup Codes. <strong>Pas SMS</strong> (SIM swap).</li>
<li>Grace period : 7 jours max pour les nouveaux users.</li>
</ul>
<h2>2. CAPTCHA invisible sur tous les formulaires</h2>
<p>Google reCAPTCHA v3 (gratuit jusqu a 1M requetes/mois) ou Cloudflare Turnstile (gratuit, sans tracking). Activer sur :</p>
<ul>
<li>Page de connexion WP (plugin reCAPTCHA Login).</li>
<li>Formulaire contact (Fluent Forms reCAPTCHA module).</li>
<li>Page d inscription (User Registration plugin).</li>
<li>Formulaires WooCommerce checkout / register.</li>
</ul>
<h2>3. Audit logs : tracer toutes les actions</h2>
<p>Plugin WP Activity Log (gratuit ou Premium 49 USD/an). Loggue : connexions, modifs articles/pages, modifs utilisateurs, installations plugins/themes, modifs reglages. Indispensable pour :</p>
<ul>
<li>Detecter un compte admin compromis.</li>
<li>Auditer qui a fait quoi en cas de bug ou incident.</li>
<li>Conformite RGPD (article 32 : tracabilite acces).</li>
<li>Compliance ISO 27001 ou SOC 2.</li>
</ul>
<h2>4. Hardening server-level</h2>
<p>Fichier .htaccess (Apache) ou nginx.conf (Nginx) :</p>
<ul>
<li>Bloquer acces direct a wp-config.php : <code>&lt;Files wp-config.php&gt;Require all denied&lt;/Files&gt;</code>.</li>
<li>Bloquer execution PHP dans uploads : <code>&lt;Directory /wp-content/uploads/&gt;&lt;FilesMatch \"\\.(php|phtml)$\"&gt;Require all denied&lt;/FilesMatch&gt;&lt;/Directory&gt;</code>.</li>
<li>Bloquer xmlrpc.php si pas utilise : <code>&lt;Files xmlrpc.php&gt;Require all denied&lt;/Files&gt;</code>.</li>
<li>Bloquer enumeration users : <code>RewriteRule ^/?author=([0-9]*) - [F,L]</code>.</li>
</ul>
<h2>5. Headers HTTP securises</h2>
<p>Plugin HTTP Headers ou via .htaccess :</p>
<ul>
<li><code>Strict-Transport-Security: max-age=31536000; includeSubDomains</code></li>
<li><code>X-Frame-Options: SAMEORIGIN</code></li>
<li><code>X-Content-Type-Options: nosniff</code></li>
<li><code>Referrer-Policy: strict-origin-when-cross-origin</code></li>
<li><code>Content-Security-Policy</code> (CSP) configure selon vos scripts externes.</li>
<li><code>Permissions-Policy</code> pour restreindre camera/microphone/geolocation.</li>
</ul>
<p>Verifiez le score sur securityheaders.com. Objectif : A+ minimum.</p>
<h2>6. WAF Cloudflare ou Sucuri</h2>
<p>Pare-feu applicatif niveau DNS, bloque avant que la requete touche WordPress. Cloudflare gratuit suffit pour 80 % des cas. Cloudflare Pro 20 USD/mois pour les regles avancees. Sucuri Firewall 199 USD/an pour ecommerce.</p>
<h2>7. Disable file editing depuis l admin</h2>
<p>Dans wp-config.php :</p>
<p><code>define('DISALLOW_FILE_EDIT', true);<br/>
define('DISALLOW_FILE_MODS', true);</code></p>
<p>Empeche un attaquant ayant pris le compte admin d injecter du code via Apparence > Editeur.</p>
<h2>8. Permissions de fichiers strictes</h2>
<p>SSH dans le serveur :</p>
<ul>
<li>Fichiers : 644 (lecture par tous, ecriture proprietaire).</li>
<li>Dossiers : 755.</li>
<li>wp-config.php : 600 (lecture proprietaire seulement).</li>
<li>.htaccess : 644.</li>
</ul>
<h2>FAQ</h2>
<p><strong>2FA est-il vraiment necessaire pour un blog perso ?</strong></p>
<p>Pour un blog perso sans monetisation : optionnel. Pour tout site pro / ecommerce / avec donnees clients : obligatoire.</p>
<p><strong>reCAPTCHA v3 ou v2 ?</strong></p>
<p>v3 (invisible) pour ne pas degrader UX. v2 (checkbox "I am not a robot") en fallback pour les visiteurs detectes suspects.</p>
<p><strong>Que faire en cas de detection d intrusion ?</strong></p>
<p>1) Site en maintenance, 2) Logs WP Activity Log pour comprendre, 3) Changer tous les mots de passe + cles wp-config, 4) Scan complet Wordfence + Sucuri, 5) Restaurer sauvegarde si compromission profonde.</p>
<blockquote>Le hardening avance n est pas paranoia, c est responsabilite professionnelle envers vos clients.</blockquote>
<p>Securisation avancee pour votre site critique : <a href="/contact">audit Pirabel Labs en 48h</a>.</p>"""},
            {'title': "Configurer un CDN (Cloudflare) gratuit",
             'duration': 14,
             'content_html': """<p>Un CDN (Content Delivery Network) sert votre site depuis des serveurs proches geographiquement de vos visiteurs. Resultat : latence reduite de 200 a 600 ms, bande passante economisee, protection DDoS, cache supplementaire. Cloudflare offre tout cela gratuitement et c est la stack indispensable pour tout site WordPress en 2026, surtout en Afrique francophone.</p>
<h2>1. Pourquoi Cloudflare</h2>
<ul>
<li>POPs (Points of Presence) dans 300+ villes mondiales, dont Lagos, Nairobi, Casablanca, Le Caire, Johannesburg en Afrique.</li>
<li>Cache HTML, CSS, JS, images automatique.</li>
<li>Protection DDoS niveau 3-4 incluse.</li>
<li>SSL Universal gratuit.</li>
<li>WAF (pare-feu applicatif) de base inclus.</li>
<li>HTTP/3 et QUIC pour la performance reseau.</li>
<li>Brotli compression activable.</li>
</ul>
<h2>2. Creer un compte Cloudflare</h2>
<ol>
<li>Inscription sur cloudflare.com (gratuit).</li>
<li>Add Site > entrez votre domaine.</li>
<li>Choisissez le plan Free.</li>
<li>Cloudflare scanne vos enregistrements DNS existants.</li>
<li>Verifiez la liste, ajoutez ce qui manque (MX emails, sous-domaines).</li>
<li>Cloudflare vous donne 2 nameservers (ex: clara.ns.cloudflare.com et bob.ns.cloudflare.com).</li>
</ol>
<h2>3. Pointer le domaine vers Cloudflare</h2>
<p>Dans votre registrar (OVH, Gandi, Namecheap) : DNS > Serveurs DNS > remplacer par les NS Cloudflare. Propagation 2 a 24h. Verification dans Cloudflare : statut "Active" en vert.</p>
<h2>4. Reglages essentiels apres activation</h2>
<ul>
<li><strong>SSL/TLS > Overview</strong> : selectionnez "Full (Strict)" pour HTTPS de bout en bout.</li>
<li><strong>SSL/TLS > Edge Certificates</strong> : Always Use HTTPS ON, HSTS ON, TLS 1.3 ON.</li>
<li><strong>Speed > Optimization</strong> : Auto Minify CSS / JS / HTML ON, Brotli ON, Rocket Loader OFF (souvent casse Elementor).</li>
<li><strong>Caching > Configuration</strong> : Caching Level Standard, Browser Cache TTL 4 hours.</li>
<li><strong>Network</strong> : HTTP/3 ON, 0-RTT ON, Onion Routing OFF.</li>
<li><strong>Page Rules (free : 3 max)</strong> : 1) /wp-admin/* : Cache Level Bypass + Disable Performance. 2) /wp-login.php : Security Level High. 3) /*.css|/*.js : Cache Level Cache Everything + Edge Cache TTL 1 month.</li>
</ul>
<h2>5. Plugin Cloudflare WordPress</h2>
<p>Installez le plugin officiel Cloudflare. Il vous permet de purger le cache depuis l admin WP, integrer Cloudflare Analytics, activer Automatic Platform Optimization (APO) si vous payez l add-on 5 USD/mois.</p>
<h2>6. Tester l effet CDN</h2>
<p>Avant Cloudflare : votre site sert depuis Paris en 350 ms vers Cotonou. Apres Cloudflare : 60 ms depuis Lagos. Verifiez avec <code>curl -o /dev/null -w "%{time_total}" https://votre-site.com</code> ou GTmetrix en changeant le serveur de test (selectionnez London puis Sao Paulo puis Mumbai).</p>
<h2>7. APO (Automatic Platform Optimization)</h2>
<p>Add-on payant 5 USD/mois exclusif WordPress. Cache TOUT le HTML edge-side, gain LCP 1 a 2 s supplementaire. ROI excellent pour site a fort trafic.</p>
<h2>8. Securite Cloudflare basique</h2>
<ul>
<li><strong>Security > WAF > Managed Rules</strong> : OWASP Core Ruleset ON, Cloudflare Managed Ruleset ON.</li>
<li><strong>Security > Bots</strong> : Bot Fight Mode ON (gratuit).</li>
<li><strong>Security > Settings</strong> : Security Level Medium, Challenge Passage 30 min.</li>
</ul>
<h2>FAQ</h2>
<p><strong>Cloudflare gratuit suffit-il ?</strong></p>
<p>Oui pour 95 % des sites. Pro 20 USD/mois pour les regles WAF avancees et le support 24/7.</p>
<p><strong>Cloudflare et WP Rocket en meme temps ?</strong></p>
<p>Oui, parfaitement compatibles. Cloudflare cache niveau edge, WP Rocket niveau serveur. Reglages Cloudflare > Speed > Auto Minify OFF (WP Rocket s en charge mieux).</p>
<p><strong>Mes emails arrivent-ils encore apres bascule DNS ?</strong></p>
<p>Oui SI vous avez bien recopie vos MX dans Cloudflare DNS. Verifiez avec mxtoolbox.com avant et apres.</p>
<blockquote>Cloudflare gratuit, c est 30 minutes de setup et l equivalent de 200 EUR/mois de stack pro. Aucune raison de s en priver.</blockquote>
<p>Setup Cloudflare professionnel : <a href="/contact">Pirabel Labs deploie en 90 minutes</a>.</p>"""},
            {'title': "Migration sans casse : du local au serveur prod",
             'duration': 16,
             'content_html': """<p>La migration d un site WordPress du local (XAMPP, Local by Flywheel) vers le serveur de production est l etape ou se cassent 40 % des projets. Liens internes casses, images manquantes, base de donnees incomplete, URLs non rewriteees : le piege est partout. Cette lecon vous donne la methode Pirabel Labs en 8 etapes pour migrer sans aucune casse.</p>
<h2>1. Preparation : checklist pre-migration</h2>
<ul>
<li>Hebergeur prod choisi et accessible.</li>
<li>Domaine pointe vers l hebergeur (DNS).</li>
<li>SSL active sur le domaine prod.</li>
<li>Acces FTP / SSH au serveur prod.</li>
<li>Acces phpMyAdmin ou CLI MySQL au serveur prod.</li>
<li>Sauvegarde complete du site local + base de donnees.</li>
<li>Liste des plugins payants avec licences (a re-activer apres migration).</li>
</ul>
<h2>2. Methode A : plugin All-in-One WP Migration (le plus simple)</h2>
<ol>
<li>Local : installer All-in-One WP Migration + extension Unlimited Upload Size (gratuite via lien officiel).</li>
<li>All-in-One > Export > To File.</li>
<li>Telechargez le fichier .wpress.</li>
<li>Prod : installer WordPress vierge + plugin All-in-One WP Migration.</li>
<li>All-in-One > Import > From File > selectionnez le .wpress.</li>
<li>Patientez 5 a 30 minutes selon la taille.</li>
<li>Connectez-vous a /wp-admin et verifiez tout.</li>
</ol>
<p>Limite : fichier .wpress max 512 Mo gratuit, illimite avec l extension officielle. Au-dela de 2 Go, methode B preferable.</p>
<h2>3. Methode B : Duplicator (gestion de gros sites)</h2>
<ol>
<li>Local : installer Duplicator (gratuit) ou Duplicator Pro (39 USD/an).</li>
<li>Duplicator > Packages > Create New > Build.</li>
<li>Telechargez 2 fichiers : archive.zip + installer.php.</li>
<li>Prod : uploadez ces 2 fichiers a la racine (public_html) via FTP.</li>
<li>Lancez https://votre-site.com/installer.php.</li>
<li>Suivez le wizard : entrez les credentials DB prod, configurez les URLs.</li>
<li>Duplicator extrait, importe la DB, met a jour les URLs.</li>
</ol>
<h2>4. Methode C : migration manuelle (controle total)</h2>
<ol>
<li>Local : exporter la DB via phpMyAdmin (SQL gzip).</li>
<li>Local : compresser le dossier WordPress complet (ZIP).</li>
<li>Prod : creer une nouvelle DB MySQL + user.</li>
<li>Prod : importer le SQL via phpMyAdmin.</li>
<li>Prod : uploader le ZIP et decompresser via cPanel File Manager.</li>
<li>Prod : editer wp-config.php avec les credentials DB prod.</li>
<li>Prod : faire un Search & Replace dans la DB pour remplacer les URLs (de http://localhost a https://votre-site.com). Outil : plugin Better Search Replace ou commande CLI wp search-replace.</li>
<li>Prod : tester le site, regenerer les permaliens, vider le cache.</li>
</ol>
<h2>5. Verifications post-migration (60 minutes obligatoires)</h2>
<ol>
<li>Home + 5 pages cles s affichent correctement.</li>
<li>Toutes les images chargent (pas de placeholders 404).</li>
<li>Menu de navigation fonctionne.</li>
<li>Formulaire contact envoie un email test.</li>
<li>Sauvegardes automatiques activees.</li>
<li>Plugins actives avec leurs licences (Rank Math, WP Rocket, Wordfence).</li>
<li>Search Console : changer la propriete vers le nouveau domaine ou re-soumettre sitemap.</li>
<li>Google Analytics : verifier que les hits arrivent.</li>
<li>SSL valide (verifiez avec ssllabs.com/ssltest).</li>
<li>Redirections 301 mises en place si l URL a change.</li>
</ol>
<h2>6. Cas particulier : migration ecommerce WooCommerce</h2>
<p>Etapes supplementaires :</p>
<ul>
<li>Verifier que les commandes en cours ne se cassent pas (mettre WooCommerce en maintenance mode).</li>
<li>Tester un achat test bout-en-bout post-migration.</li>
<li>Reconfigurer les passerelles de paiement (Stripe, FedaPay, PayPal) avec les nouvelles URLs webhook.</li>
<li>Verifier les emails transactionnels (commande, confirmation, expedition).</li>
</ul>
<h2>7. Switch DNS final</h2>
<p>Si vous migrez d un hebergeur a un autre : 48h avant le D-day, baissez le TTL DNS a 300 secondes. Le jour J, changez les NS vers le nouvel hebergeur. Coupure utilisateur : 5 a 30 minutes selon propagation.</p>
<h2>8. Plan de rollback</h2>
<p>Gardez la sauvegarde complete pre-migration accessible pendant 30 jours. Si bug critique post-migration impossible a corriger en 2h, restaurez et investiguez sans pression.</p>
<h2>FAQ</h2>
<p><strong>Quelle methode pour debutant ?</strong></p>
<p>All-in-One WP Migration. Le plus simple, gratuit jusqu a 512 Mo.</p>
<p><strong>Combien de temps prend une migration complete ?</strong></p>
<p>2 a 6 heures pour un site vitrine + checks. 1 a 2 jours pour un ecommerce complexe.</p>
<p><strong>Que faire si le site est casse apres migration ?</strong></p>
<p>1) Activer debug.log dans wp-config, 2) Regenerer les permaliens, 3) Verifier wp-config.php DB credentials, 4) Search & replace URLs, 5) Si rien ne marche, restaurer la sauvegarde et recommencer.</p>
<blockquote>Une migration ratee coute 5 a 20 fois plus cher qu une migration bien preparee. Investissez 4h de checklist.</blockquote>
<p>Pirabel Labs migre votre site avec garantie zero downtime : <a href="/contact">devis gratuit</a>.</p>
<h2>Annexe : checklist post-migration en 30 points</h2>
<ol>
<li>Site accessible sur HTTPS.</li>
<li>Redirection automatique HTTP > HTTPS.</li>
<li>Redirection www vs non-www unifiee.</li>
<li>SSL valide et A+ sur SSL Labs.</li>
<li>Toutes les pages s affichent correctement.</li>
<li>Toutes les images chargent (pas de 404).</li>
<li>Tous les CSS et JS chargent.</li>
<li>Menu de navigation fonctionne.</li>
<li>Formulaire contact envoie un email test reussi.</li>
<li>Newsletter inscription fonctionne.</li>
<li>Search interne renvoie des resultats.</li>
<li>Pagination blog fonctionne.</li>
<li>Permaliens regeneres (Reglages > Permaliens > Save).</li>
<li>Plugins payants reactivees avec leurs licences.</li>
<li>Sauvegardes automatiques planifiees.</li>
<li>Wordfence actif et scan complete.</li>
<li>Robots.txt accessible et valide.</li>
<li>Sitemap.xml accessible et valide.</li>
<li>Search Console : changement de propriete ou re-soumission sitemap.</li>
<li>Google Analytics : hits arrivent correctement.</li>
<li>GTM ou tags marketing actifs.</li>
<li>Pixel Meta / Google Ads actifs.</li>
<li>Lighthouse mobile score 85+.</li>
<li>Lighthouse desktop score 90+.</li>
<li>Test responsive sur 3 devices reels.</li>
<li>Test cross-browser (Chrome, Safari, Firefox, Edge).</li>
<li>Cron jobs WordPress executes.</li>
<li>Cache pages purges et reconstruit.</li>
<li>CDN actif et opérationnel.</li>
<li>Monitoring UptimeRobot configure.</li>
</ol>
<p>Cette checklist 30 points est appliquee a chaque migration Pirabel Labs et garantit zero regression post-bascule.</p>"""},
        ],
    },
    {
        'title': 'Lancement SEO et maintenance',
        'objective': 'Mettre le site en ligne sans coupure, configurer Analytics et Search Console, accelerer l indexation, planifier la maintenance recurrente et gerer les refontes sans perdre du trafic.',
        'duration': 220,
        'lessons': [
            {'title': "Mise en ligne et configuration DNS",
             'duration': 16,
             'content_html': """<p>La mise en ligne d un site WordPress, c est le jour J ou tout doit etre nickel. Une erreur DNS, un mauvais .htaccess, un robots.txt oublie : votre site reste invisible ou casse en bouche pendant 48h. Cette lecon vous donne la sequence parfaite de mise en ligne en moins de 90 minutes.</p>
<h2>1. J-7 : preparation finale</h2>
<ul>
<li>Site de staging valide et approuve par le client.</li>
<li>Tous les contenus en place (pages, blog, formulaires, images, videos).</li>
<li>Plugins SEO configures (Rank Math + sitemap genere).</li>
<li>Plugins performance actifs (WP Rocket).</li>
<li>Plugins securite actifs (Wordfence + 2FA).</li>
<li>Sauvegardes automatiques planifiees (UpdraftPlus).</li>
<li>SSL valide (Let s Encrypt active).</li>
<li>Google Analytics 4 + Search Console preconfigures (proprietes creees).</li>
</ul>
<h2>2. J-1 : bascule DNS preparation</h2>
<p>Si vous migrez depuis un ancien hebergeur :</p>
<ol>
<li>Baisser le TTL DNS a 300 secondes (5 min) chez votre registrar.</li>
<li>Attendre la propagation de la baisse TTL (jusqu a l ancien TTL, souvent 24h).</li>
<li>Communiquer au client le creneau de bascule (idealement nuit ou week-end).</li>
</ol>
<h2>3. Jour J : sequence en 8 etapes</h2>
<ol>
<li><strong>09h00</strong> : derniere sauvegarde site de prod actuel.</li>
<li><strong>09h15</strong> : derniere sauvegarde site staging.</li>
<li><strong>09h30</strong> : changer les nameservers DNS vers le nouvel hebergeur (ou changer le A record si meme hebergeur, autre serveur).</li>
<li><strong>09h45</strong> : verifier propagation avec dnschecker.org et whatsmydns.net.</li>
<li><strong>10h00</strong> : tester le site sur le nouveau serveur en utilisant l URL temporaire (souvent server-IP/~user) ou en modifiant son fichier /etc/hosts local.</li>
<li><strong>10h30</strong> : DNS propage globalement (5 a 60 min en general avec TTL 300).</li>
<li><strong>11h00</strong> : verifier le site sur 5 navigateurs differents + mobile + 3 zones geographiques (utiliser un VPN).</li>
<li><strong>11h30</strong> : soumettre le sitemap au Search Console + ping Google.</li>
</ol>
<h2>4. Reglages DNS essentiels</h2>
<p>Enregistrements a verifier dans Cloudflare ou votre DNS provider :</p>
<ul>
<li><strong>A</strong> : @ pointe vers l IP du serveur web.</li>
<li><strong>A</strong> : www pointe vers la meme IP (ou CNAME).</li>
<li><strong>CNAME</strong> : sous-domaines (staging, dev, app).</li>
<li><strong>MX</strong> : votre fournisseur email (Google Workspace, Microsoft 365, Zoho, Brevo).</li>
<li><strong>TXT</strong> : SPF, DKIM, DMARC, Google verification, Search Console verification.</li>
<li><strong>CAA</strong> : autoriser uniquement Let s Encrypt a emettre des certificats SSL.</li>
</ul>
<h2>5. Forcer HTTPS et www / non-www</h2>
<p>Choisissez UNE seule version canonique : soit www.votre-site.com soit votre-site.com. Redirigez l autre en 301.</p>
<p>Dans .htaccess (Apache) pour forcer HTTPS non-www :</p>
<p><code>RewriteEngine On<br/>
RewriteCond %{HTTPS} off [OR]<br/>
RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]<br/>
RewriteRule ^ https://%1%{REQUEST_URI} [R=301,L]</code></p>
<h2>6. Verifier le robots.txt</h2>
<p>Allez sur https://votre-site.com/robots.txt. Doit contenir :</p>
<p><code>User-agent: *<br/>
Allow: /<br/>
Disallow: /wp-admin/<br/>
Allow: /wp-admin/admin-ajax.php<br/><br/>
Sitemap: https://votre-site.com/sitemap_index.xml</code></p>
<p>NE PAS bloquer toute l indexation. C est l erreur n 1 lors d une mise en ligne (oubli du noindex de developpement).</p>
<h2>7. Decocher "decourager les moteurs de recherche"</h2>
<p>Reglages > Lecture > decochez "Demander aux moteurs de recherche de ne pas indexer ce site". Erreur ultra-courante qui maintient le noindex meme en prod.</p>
<h2>8. Post-mise en ligne (J+1 a J+7)</h2>
<ul>
<li>Verifier indexation : <code>site:votre-site.com</code> dans Google.</li>
<li>Soumettre URLs prioritaires au Search Console (Inspect > Request indexing).</li>
<li>Monitorer Uptime via UptimeRobot.</li>
<li>Verifier les erreurs 404 dans Search Console + Rank Math.</li>
<li>Verifier les Core Web Vitals dans Search Console > Experience.</li>
</ul>
<h2>FAQ</h2>
<p><strong>Combien de temps pour que Google indexe le nouveau site ?</strong></p>
<p>Premieres pages indexees en 24-72h si vous soumettez le sitemap. Indexation complete : 2 a 4 semaines pour un site 100 pages.</p>
<p><strong>Que faire si le site est inaccessible 1h apres bascule DNS ?</strong></p>
<p>1) Verifier propagation DNS sur dnschecker.org, 2) Verifier que le serveur prod repond (curl ou ping), 3) Verifier wp-config.php DB, 4) Restaurer si besoin.</p>
<p><strong>Faut-il rediriger toutes les anciennes URLs si refonte ?</strong></p>
<p>OUI imperativement. Sinon, perte de 30 a 80 % du trafic organique en 30 jours. Plugin Redirection ou Rank Math Redirections.</p>
<blockquote>La mise en ligne, c est 80 % de preparation et 20 % de bascule. Ne jamais brulent les etapes.</blockquote>
<p>Pirabel Labs met en ligne votre site avec zero downtime : <a href="/contact">devis et planning</a>.</p>"""},
            {'title': "Setup Google Analytics 4 et Search Console",
             'duration': 16,
             'content_html': """<p>Sans Google Analytics 4 et Search Console, vous pilotez votre site en aveugle. Combien de visiteurs ? D ou viennent-ils ? Quels mots-cles vous amenent du trafic ? Quel article performe ? Cette lecon vous monte une stack analytique complete en 30 minutes, calibree pour le SEO et la conversion.</p>
<h2>1. Creer une propriete Google Analytics 4</h2>
<ol>
<li>analytics.google.com > Connexion avec compte Google business (pas perso).</li>
<li>Admin > Creer une propriete > nom "Mon Site Web".</li>
<li>Pays France ou Benin, devise EUR ou FCFA.</li>
<li>Categorie d activite (selon votre secteur).</li>
<li>Taille (1-10 employes, 11-100, etc.).</li>
<li>Objectifs business : Generer des leads, Augmenter conversions, etc.</li>
<li>Ajouter le flux de donnees Web > URL https://votre-site.com.</li>
<li>Cocher "Mesure ameliorée" (clics sortants, scroll, formulaires, video, telechargement automatiquement traques).</li>
<li>Recuperer l ID de mesure G-XXXXXXXXXX.</li>
</ol>
<h2>2. Installer GA4 sur WordPress</h2>
<p>3 methodes :</p>
<ul>
<li><strong>Site Kit by Google</strong> (gratuit, plugin officiel) : connecte GA4 + Search Console + AdSense + PageSpeed.</li>
<li><strong>MonsterInsights</strong> (gratuit ou Pro 99 USD/an) : dashboards plus jolis + tracking ecommerce + scroll depth.</li>
<li><strong>Google Tag Manager (GTM)</strong> : pour les marketers avances qui veulent gerer plusieurs tags.</li>
</ul>
<p>Pour debutant : Site Kit by Google.</p>
<h2>3. Creer une propriete Search Console</h2>
<ol>
<li>search.google.com/search-console > Connexion.</li>
<li>Ajouter une propriete > choisir "Prefixe d URL" > entrer https://votre-site.com.</li>
<li>Methode de verification : balise HTML, fichier HTML, DNS TXT, ou Google Analytics.</li>
<li>Plus simple : si vous avez deja GA4 ou Site Kit installe, verification automatique en 1 clic.</li>
<li>Une fois verifie, soumettez votre sitemap : Sitemaps > entrez sitemap_index.xml.</li>
</ol>
<h2>4. Configurer les conversions GA4</h2>
<p>Definissez 3 a 5 evenements de conversion : formulaire envoye, achat, telechargement lead magnet, inscription newsletter, click WhatsApp.</p>
<p>Avec Site Kit : Settings > Connect GA4 > Enable goal events. Avec MonsterInsights : Conversions tab > activer Forms tracking + Outbound clicks.</p>
<p>Avec GTM (avance) : creez un Tag GA4 Event > parametrez le trigger (clic CSS selector, page view URL, formulaire submit). Verifiez avec Google Tag Assistant ou DebugView GA4.</p>
<h2>5. Connecter GA4 et Search Console</h2>
<p>GA4 > Admin > Liens des produits > Search Console > Lier > selectionnez votre propriete SC.</p>
<p>Resultat : dans GA4 > Rapports > Acquisition > Sources Search Console : vous voyez les mots-cles qui amenent du trafic vers chaque page.</p>
<h2>6. KPIs essentiels a suivre</h2>
<ul>
<li><strong>Trafic organique mensuel</strong> : courbe de progression mois par mois.</li>
<li><strong>Top 20 mots-cles</strong> : volume, position moyenne, CTR.</li>
<li><strong>Top 20 pages</strong> : sessions, conversions, taux de rebond.</li>
<li><strong>Sources d acquisition</strong> : Organic Search, Direct, Social, Referral, Paid.</li>
<li><strong>Taux de conversion global</strong> : conversions / sessions.</li>
<li><strong>Core Web Vitals</strong> : Search Console > Experience.</li>
<li><strong>Erreurs d indexation</strong> : Search Console > Pages > Pourquoi pages non indexees.</li>
</ul>
<h2>7. RGPD et consentement</h2>
<p>En Europe, GA4 ne doit pas tracker les visiteurs avant consentement explicite. Plugin Complianz ou CookieYes integrent le mode "Consent Mode v2" qui delaye GA4 jusqu au clic "Accepter".</p>
<p>Alternative privacy-first : Plausible, Fathom, Simple Analytics (9 a 19 USD/mois, no cookies).</p>
<h2>8. Reporting mensuel simple</h2>
<p>Modele Looker Studio gratuit : creez un rapport 1-pager mensuel pour client avec : sessions, utilisateurs, conversions, top 10 pages, top 10 mots-cles, evolution mois M vs M-1. Connectez Looker Studio a GA4 et Search Console en 5 minutes.</p>
<h2>FAQ</h2>
<p><strong>GA4 ou Universal Analytics ?</strong></p>
<p>Universal Analytics est mort depuis le 1er juillet 2024. GA4 est le seul choix en 2026.</p>
<p><strong>Combien de temps avant d avoir des donnees fiables ?</strong></p>
<p>GA4 : donnees en temps reel des activation. Donnees historiques utiles : 30 jours minimum. Pour les patterns SEO : 90 jours.</p>
<p><strong>Faut-il payer MonsterInsights Pro ?</strong></p>
<p>Pour PME / ecommerce : oui, le tracking automatique des formulaires et ecommerce paie en 1 mois. Pour blog perso : Site Kit gratuit suffit.</p>
<blockquote>Sans tracking analytique, vous pilotez a vue. Sans Search Console, vous etes aveugle SEO. Ces 2 outils sont gratuits, aucune excuse pour les sauter.</blockquote>
<p>Pirabel Labs configure votre stack analytique : <a href="/contact">devis gratuit en 24h</a>.</p>"""},
            {'title': "Indexation rapide : sitemap et ping Google",
             'duration': 14,
             'content_html': """<p>Soumettre votre sitemap a Google n est plus suffisant en 2026 : Google met 2 a 4 semaines pour crawler un nouveau site standard. Cette lecon vous donne les techniques pro pour accelerer l indexation a 24-72h sur les pages prioritaires.</p>
<h2>1. Generer un sitemap XML propre</h2>
<p>Plugin Rank Math (gratuit) ou Yoast SEO. Configuration :</p>
<ul>
<li>Activer Sitemap module.</li>
<li>Inclure : Pages + Articles + Categories + Pages de balises (selon strategie).</li>
<li>Exclure : 404, archives auteur, archives dates, formulaires.</li>
<li>Verifier que sitemap_index.xml affiche bien vos sous-sitemaps (post-sitemap.xml, page-sitemap.xml, etc.).</li>
</ul>
<p>URL standard : https://votre-site.com/sitemap_index.xml ou /sitemap.xml.</p>
<h2>2. Soumettre au Search Console</h2>
<p>Search Console > Sitemaps > entrez "sitemap_index.xml" > Soumettre. Statut "Reussite" en quelques heures. Si "Couldn t fetch", verifiez le robots.txt et l accessibilite publique du fichier.</p>
<h2>3. Demander l indexation des pages prioritaires</h2>
<p>Search Console > Inspection d URL > collez l URL > Demander une indexation. Quota : 10-12 URLs/jour. Pour les pages cibles (top services, top articles), utilisez ce quota chaque jour pendant la premiere semaine.</p>
<h2>4. IndexNow : ping multi-moteurs en temps reel</h2>
<p>Protocole open source soutenu par Bing, Yandex, Naver. Plugin Rank Math (gratuit) integre IndexNow nativement. A chaque nouvel article publie, un ping est envoye aux moteurs en moins de 1 seconde. Indexation Bing en 1-6h.</p>
<p>Activation Rank Math : Tableau de bord > Modules > IndexNow > Activer > generer une cle API.</p>
<h2>5. Ping Google via Search Console API</h2>
<p>Pour les sites a forte publication (10+ articles/jour), automatisez via Google Indexing API + Cloud Console. Setup technique 60 min mais limite officielle : reserve aux JobPostings et LiveStream. Pour le reste, IndexNow et soumission manuelle restent les voies legitimes.</p>
<h2>6. Maillage interne agressif</h2>
<p>Liez vos nouvelles pages depuis des pages deja indexees a forte autorite (home, articles populaires). Google decouvre ainsi les nouvelles pages via le crawl de l existant. Plugin Internal Link Juicer (gratuit ou 79 USD/an) automatise les liens internes selon des mots-cles cibles.</p>
<h2>7. Backlinks externes</h2>
<p>Un seul backlink depuis un site indexe rapidement (presse, partenaire, agregateur) declenche un crawl Google quasi-immediat. Publier un communique sur Newswire ou un guest post sur un media.</p>
<h2>8. Signaux sociaux</h2>
<p>Partager l URL sur Twitter / X, LinkedIn, Facebook, Reddit. Google crawl ces plateformes en temps reel et decouvre les URLs partagees rapidement (meme si les liens sont nofollow).</p>
<h2>9. Pinger via plugin WordPress</h2>
<p>Reglages > Ecriture > Services de mise a jour. Liste de pings WordPress :</p>
<p><code>http://rpc.pingomatic.com/<br/>
http://blogsearch.google.com/ping/RPC2<br/>
http://api.feedster.com/ping<br/>
http://api.my.yahoo.com/RPC2</code></p>
<p>Effet limite en 2026 (la plupart sont obsoletes) mais aucun cout.</p>
<h2>10. Mesurer l indexation</h2>
<p>Search Console > Pages : suivez nombre de pages indexees vs non indexees. Objectif : 90 % de vos pages indexees apres 30 jours.</p>
<p>Recherche manuelle : <code>site:votre-site.com</code> dans Google. Indique le nombre approximatif de pages indexees.</p>
<h2>FAQ</h2>
<p><strong>Pourquoi mes pages ne sont-elles pas indexees ?</strong></p>
<p>Causes : robots.txt bloque, balise noindex, contenu duplique, qualite faible, site nouveau (sandbox). Search Console > Pages > section "Pourquoi non indexees" detaille.</p>
<p><strong>Combien de temps pour indexer 1000 pages ?</strong></p>
<p>3 a 8 semaines selon l autorite du site et la qualite des contenus. Plus rapide avec IndexNow et soumissions strategiques.</p>
<p><strong>L indexation rapide a-t-elle un cout ?</strong></p>
<p>Gratuit pour les methodes legitimes (Search Console, IndexNow, maillage). Mefiance des services "indexation 24h garantie" payants : souvent black hat avec risque de penalite.</p>
<blockquote>Indexer vite, c est convertir vite. 30 jours d attente, c est 30 jours de CA perdu.</blockquote>
<p>Pirabel Labs accelere votre indexation : <a href="/contact">strategie SEO sur-mesure</a>.</p>"""},
            {'title': "Maintenance : routines hebdo, mensuelles, annuelles",
             'duration': 16,
             'content_html': """<p>Un site WordPress non maintenu, c est une bombe a retardement. Plugins obsoletes = failles. DB qui gonfle = lenteur. Backups defaillants = catastrophe au moindre incident. Cette lecon vous donne le calendrier de maintenance pro Pirabel Labs, deploye sur 220+ sites en gestion.</p>
<h2>1. Routine hebdomadaire (15 minutes)</h2>
<ul>
<li>Verifier les sauvegardes : derniere sauvegarde reussie cette semaine ?</li>
<li>Verifier le scan securite Wordfence : aucune alerte critique ?</li>
<li>Mettre a jour les plugins : appliquer les mises a jour mineures.</li>
<li>Verifier les commentaires en attente : moderer le spam.</li>
<li>Verifier l uptime UptimeRobot : aucun downtime > 5 min ?</li>
</ul>
<h2>2. Routine mensuelle (60 minutes)</h2>
<ul>
<li>Mettre a jour le core WordPress + themes + plugins (apres sauvegarde manuelle).</li>
<li>Tester apres MAJ : 5 pages cles + formulaire contact + checkout (si ecommerce).</li>
<li>Lancer Lighthouse audit sur 3 pages : score maintenu 90+ ?</li>
<li>Verifier Core Web Vitals Search Console : aucune degradation ?</li>
<li>Audit images : nouvelles uploads compressees (ShortPixel bulk) ?</li>
<li>Nettoyer la base de donnees : WP-Optimize > Database > clean transients + revisions.</li>
<li>Verifier les erreurs 404 : Rank Math 404 Monitor ou Search Console.</li>
<li>Verifier les liens casses : Broken Link Checker (en lancement ponctuel, le plugin actif permanent ralentit le site).</li>
<li>Reviewer les logs Wordfence : tentatives bloquees, IPs suspectes.</li>
</ul>
<h2>3. Routine trimestrielle (3 heures)</h2>
<ul>
<li>Tester la restauration d une sauvegarde sur un sous-domaine staging.</li>
<li>Audit complet Lighthouse sur 10 pages.</li>
<li>Audit complet securite : Sucuri SiteCheck + Wordfence scan profond.</li>
<li>Audit SEO complet : Rank Math Site Analysis ou Ahrefs Site Audit.</li>
<li>Verifier les certificats SSL : expiration dans plus de 30 jours ?</li>
<li>Auditer les acces utilisateurs : supprimer les comptes inactifs.</li>
<li>Reviewer les plugins installes : desinstaller ceux non utilises depuis 3 mois.</li>
</ul>
<h2>4. Routine annuelle (1 journee)</h2>
<ul>
<li>Audit complet du site : architecture, contenu, SEO, performance, securite.</li>
<li>Renouvellement domaine + hebergement + plugins payants.</li>
<li>Mise a jour PHP vers la derniere version stable (PHP 8.3 en 2026).</li>
<li>Mise a jour MySQL / MariaDB si besoin.</li>
<li>Refresh visuel : verifier que le design reste contemporain (refonte tous les 3-4 ans).</li>
<li>Audit RGPD : politique de confidentialite a jour, cookies banner conforme.</li>
<li>Backup archivee dans cold storage long terme (Backblaze B2).</li>
</ul>
<h2>5. Automatiser via plateforme de maintenance</h2>
<p>Pour gerer 5+ sites WordPress :</p>
<ul>
<li><strong>WP Umbrella</strong> : 1,99 EUR/site/mois. Lighthouse weekly + uptime + maj + sauvegarde.</li>
<li><strong>ManageWP</strong> : 1 a 10 USD/site/mois. Reference du marche.</li>
<li><strong>MainWP</strong> : self-hosted gratuit (auto-heberge sur 1 WordPress dedie).</li>
</ul>
<p>Gain de temps : 1h/site/mois au lieu de 3h/site/mois.</p>
<h2>6. Documentation et passation</h2>
<p>Documentez dans Notion ou Google Doc : credentials hebergeur, registrar, plugins payants, comptes Analytics / Search Console, contacts d urgence. Stockez les credentials sensibles dans Bitwarden / 1Password partage avec au moins 2 personnes.</p>
<h2>7. Outils de maintenance pro</h2>
<ul>
<li><strong>UptimeRobot</strong> (gratuit) : monitoring uptime 5 min.</li>
<li><strong>Pingdom</strong> ou <strong>StatusCake</strong> : alternatives premium.</li>
<li><strong>Sucuri SiteCheck</strong> (gratuit) : scan malware externe.</li>
<li><strong>Lighthouse CI</strong> : automatiser audit Lighthouse a chaque deploiement.</li>
<li><strong>Slack + WP Umbrella integration</strong> : alertes downtime / failed update / security alert dans votre canal Slack.</li>
</ul>
<h2>FAQ</h2>
<p><strong>Combien de temps pour maintenir un site WordPress ?</strong></p>
<p>2 a 6h/mois pour un site PME. 8 a 20h/mois pour un ecommerce complexe.</p>
<p><strong>Faut-il deleguer la maintenance ?</strong></p>
<p>Oui des que vous avez 3+ sites ou que votre CA depasse 200 EUR/jour. Pirabel Labs propose des forfaits maintenance a partir de 99 EUR/mois.</p>
<p><strong>Quel est le risque de ne pas maintenir ?</strong></p>
<p>Hack en 6 a 18 mois (90 % de probabilite). Cout reparation : 800 a 8 000 EUR + perte de reputation.</p>
<blockquote>La maintenance n est pas un cout, c est une assurance vie pour votre site et votre CA.</blockquote>
<p>Forfait maintenance Pirabel Labs : <a href="/contact">devis personnalise selon vos besoins</a>.</p>"""},
            {'title': "Refonte sans perdre du trafic SEO : checklist",
             'duration': 18,
             'content_html': """<p>Une refonte WordPress mal preparee, c est en moyenne 35 % de trafic organique perdu en 90 jours et 6 mois pour revenir au niveau d avant. Cette lecon vous donne la checklist complete Pirabel Labs en 22 points, deployee sur 80+ refontes reussies sans aucune perte de trafic.</p>
<h2>1. Phase pre-refonte (J-30)</h2>
<ol>
<li><strong>Crawler le site existant</strong> avec Screaming Frog : exporter toutes les URLs.</li>
<li><strong>Lister les pages a fort trafic</strong> via Search Console > Performance > top 100 pages.</li>
<li><strong>Lister les top backlinks</strong> via Ahrefs ou Google Search Console > Liens.</li>
<li><strong>Sauvegarder les contenus textuels</strong> dans un Google Sheets (URL + title + meta + H1 + corps).</li>
<li><strong>Sauvegarder les images</strong> haute resolution (souvent perdues a la refonte).</li>
<li><strong>Documenter les CTA et conversions</strong> : ne pas perdre les events GA4.</li>
</ol>
<h2>2. Phase planification (J-21)</h2>
<ol>
<li><strong>Cartographier l ancienne arborescence vs la nouvelle</strong> : Mindmeister, Whimsical, Excalidraw.</li>
<li><strong>Decider de la strategie URLs</strong> : garder identiques (ideal) ou changer (necessite redirections 301).</li>
<li><strong>Lister toutes les redirections 301 necessaires</strong> dans un Sheets ancien-URL > nouvelle-URL.</li>
<li><strong>Verifier les pages legales</strong> (mentions, CGV) : copies a jour disponibles.</li>
</ol>
<h2>3. Phase developpement (J-21 a J-7)</h2>
<ol>
<li><strong>Construire le nouveau site sur staging</strong> (sous-domaine staging.votre-site.com avec noindex).</li>
<li><strong>Re-importer les contenus prioritaires</strong> : top 50 pages SEO.</li>
<li><strong>Reproduire les meta titles et meta descriptions</strong> a l identique pour les pages indexees.</li>
<li><strong>Verifier la coherence structurelle</strong> : H1 unique, hierarchie Hn correcte.</li>
<li><strong>Implementer le sitemap.xml et le robots.txt nouvel</strong>.</li>
<li><strong>Installer le plugin Redirection</strong> et importer la liste 301.</li>
</ol>
<h2>4. Phase test (J-7 a J-1)</h2>
<ol>
<li><strong>Tester les redirections 301</strong> : aucune chaine 301 > 301 > 301 (perte de jus SEO).</li>
<li><strong>Auditer le nouveau site avec Screaming Frog</strong> : aucune URL en 404 interne.</li>
<li><strong>Lancer Lighthouse</strong> sur 10 pages : score 90+ confirme.</li>
<li><strong>Test fonctionnel</strong> : formulaires, CTA, checkout, recherche interne.</li>
</ol>
<h2>5. Phase mise en ligne (J-Day)</h2>
<ol>
<li><strong>Sauvegarde complete</strong> de l ancien site (a garder 90 jours minimum).</li>
<li><strong>Bascule du nouveau site en production</strong> (deploy, DNS, ou rename de sous-domaine).</li>
<li><strong>Activer les redirections 301</strong> immediatement.</li>
<li><strong>Verifier 50 URLs aleatoires</strong> : redirection fonctionne, page affichee correcte.</li>
<li><strong>Soumettre le nouveau sitemap</strong> a Google Search Console.</li>
<li><strong>Inspecter les top 20 URLs</strong> et demander reindexation.</li>
</ol>
<h2>6. Phase post-refonte (J+1 a J+90)</h2>
<ol>
<li><strong>Monitorer le trafic GA4 quotidien</strong> : alerte si baisse > 15 %.</li>
<li><strong>Monitorer Search Console</strong> : nouvelles 404, indexation, Core Web Vitals.</li>
<li><strong>Corriger les 404 detectees</strong> en ajoutant des redirections.</li>
<li><strong>Suivre les positions des top mots-cles</strong> via Rank Math Analytics ou Ahrefs.</li>
<li><strong>Reviewer le rapport SEO a J+30 et J+90</strong>.</li>
</ol>
<h2>7. Les 5 erreurs fatales a eviter</h2>
<ol>
<li>Ne pas faire de redirections 301 (perte instant 50-80 % trafic).</li>
<li>Garder le noindex de developpement actif (catastrophe : site invisible).</li>
<li>Casser les URLs sans logique (slug-fr/article > article-en-francais aleatoire).</li>
<li>Perdre les meta titles optimises au profit de meta par defaut.</li>
<li>Pas de monitoring post-refonte pendant 90 jours.</li>
</ol>
<h2>8. Cas reel : refonte boutique mode Cotonou</h2>
<p>Avant refonte : 8 500 visiteurs/mois organique. Apres refonte mal preparee (sans 301) : 1 200/mois en 60 jours. Apres restauration 301 en urgence : 9 100/mois en 90 jours (gain car nouveau design + CWV ameliores). Lecon : la refonte bien faite est un boost SEO.</p>
<h2>FAQ</h2>
<p><strong>Combien de temps pour une refonte ?</strong></p>
<p>6 a 12 semaines pour un site vitrine PME. 12 a 24 semaines pour un ecommerce complexe.</p>
<p><strong>Doit-on garder l ancien design pendant la refonte ?</strong></p>
<p>Oui imperativement. Site staging + nouveau design. Site prod reste en ligne tant que la refonte n est pas livree.</p>
<p><strong>Comment recuperer si on perd 50 % de trafic apres refonte ?</strong></p>
<p>1) Audit Screaming Frog immediate, 2) Ajouter toutes les redirections manquantes, 3) Soumettre URLs a Search Console, 4) Patienter 60-90 jours. Si rien ne s ameliore, restaurer l ancien site.</p>
<blockquote>Une refonte sans checklist SEO, c est un suicide commercial. Investissez 40h de preparation pour eviter 6 mois de catastrophe.</blockquote>
<p>Pirabel Labs realise vos refontes avec garantie zero perte SEO : <a href="/contact">devis et audit gratuit</a>.</p>"""},
        ],
    },
    {
        'title': 'Approfondissement et bonnes pratiques pro',
        'objective': 'Maitriser les Custom Post Types et ACF, creer des child themes, exploiter les hooks WordPress, automatiser via WP-CLI et configurer un multisite pour les besoins avances.',
        'duration': 280,
        'lessons': [
            {'title': "Custom Post Types et Advanced Custom Fields",
             'duration': 24,
             'content_html': """<p>Custom Post Types (CPT) et Advanced Custom Fields (ACF) sont les 2 leviers qui font passer WordPress du statut de "blog avec quelques pages" a celui de veritable CMS sur-mesure. Avec eux, vous structurez vos donnees, creez des entites metier (Projets, Realisations, Equipe, Evenements, Formations, Produits...) et offrez une UX d edition impeccable a vos clients. Cette lecon vous donne le code et les workflows pour devenir autonome.</p>
<h2>1. Pourquoi des Custom Post Types ?</h2>
<p>Par defaut WordPress propose 2 types de contenus : Pages et Articles. Insuffisant des qu il faut afficher :</p>
<ul>
<li>Un portfolio de projets/realisations.</li>
<li>Un annuaire d equipe (membres avec photo + role + bio).</li>
<li>Un agenda d evenements (date + lieu + speakers).</li>
<li>Un catalogue de services structures.</li>
<li>Des temoignages clients (avec note + photo + entreprise).</li>
<li>Des etudes de cas multi-sections.</li>
<li>Des FAQ classees par categories metier.</li>
</ul>
<p>Plutot que de bricoler avec des Articles + categories, on cree un CPT dedie. Bonus : URL propre (/projets/villa-mer/ au lieu de /category/projets/villa-mer/).</p>
<h2>2. Creer un CPT en code (functions.php)</h2>
<p>Dans le fichier <code>functions.php</code> de votre child theme :</p>
<p><code>function register_cpt_projet() {<br/>
&nbsp;&nbsp;register_post_type('projet', [<br/>
&nbsp;&nbsp;&nbsp;&nbsp;'label' =&gt; 'Projets',<br/>
&nbsp;&nbsp;&nbsp;&nbsp;'public' =&gt; true,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;'has_archive' =&gt; true,<br/>
&nbsp;&nbsp;&nbsp;&nbsp;'rewrite' =&gt; ['slug' =&gt; 'projets'],<br/>
&nbsp;&nbsp;&nbsp;&nbsp;'supports' =&gt; ['title', 'editor', 'thumbnail', 'excerpt'],<br/>
&nbsp;&nbsp;&nbsp;&nbsp;'menu_icon' =&gt; 'dashicons-portfolio',<br/>
&nbsp;&nbsp;&nbsp;&nbsp;'show_in_rest' =&gt; true,<br/>
&nbsp;&nbsp;]);<br/>
}<br/>
add_action('init', 'register_cpt_projet');</code></p>
<p>Apres ajout, Reglages > Permaliens > Enregistrer (pour rafraichir les URLs).</p>
<h2>3. Creer un CPT sans coder : Custom Post Type UI</h2>
<p>Plugin Custom Post Type UI (gratuit, 1M installations). Interface visuelle pour creer CPT et taxonomies sans toucher au code. Recommande pour debutants. Export en code PHP disponible quand vous voulez migrer vers une approche developpeur.</p>
<h2>4. Installer Advanced Custom Fields (ACF)</h2>
<p>Plugin ACF (gratuit, ACF Pro 49 USD/an pour Repeater + Flexible Content + Gallery + Gutenberg blocks). Installation classique.</p>
<h2>5. Creer un groupe de champs pour le CPT Projet</h2>
<ol>
<li>ACF > Field Groups > Add New.</li>
<li>Title : "Details Projet".</li>
<li>Add Field : Field Label "Client", Field Name "client", Field Type "Text".</li>
<li>Add Field : "Annee", number.</li>
<li>Add Field : "Categorie", select avec options (Web, Mobile, Branding).</li>
<li>Add Field : "Galerie images", Gallery (ACF Pro).</li>
<li>Add Field : "URL projet live", URL.</li>
<li>Add Field : "Testimonial client", Textarea.</li>
<li>Location Rules : Post Type is equal to Projet.</li>
<li>Save.</li>
</ol>
<p>Resultat : en editant un Projet, vous avez l editeur Gutenberg + un panneau ACF avec tous vos champs structures.</p>
<h2>6. Afficher les champs ACF dans le template</h2>
<p>Dans <code>single-projet.php</code> (template specifique du CPT) :</p>
<p><code>&lt;?php $client = get_field('client'); ?&gt;<br/>
&lt;?php $annee = get_field('annee'); ?&gt;<br/>
&lt;p&gt;&lt;strong&gt;Client :&lt;/strong&gt; &lt;?= esc_html($client) ?&gt;&lt;/p&gt;<br/>
&lt;p&gt;&lt;strong&gt;Annee :&lt;/strong&gt; &lt;?= esc_html($annee) ?&gt;&lt;/p&gt;</code></p>
<p>Pour la galerie ACF Pro :</p>
<p><code>&lt;?php $images = get_field('galerie_images'); ?&gt;<br/>
&lt;?php if ($images): foreach ($images as $img): ?&gt;<br/>
&nbsp;&nbsp;&lt;img src="&lt;?= esc_url($img['sizes']['large']) ?&gt;" alt="&lt;?= esc_attr($img['alt']) ?&gt;" /&gt;<br/>
&lt;?php endforeach; endif; ?&gt;</code></p>
<h2>7. ACF Repeater : repeter une structure</h2>
<p>Cas typique : equipe avec N membres ayant chacun nom + photo + role + bio. ACF Repeater (Pro uniquement) :</p>
<ol>
<li>Field Type : Repeater.</li>
<li>Sub Fields : Nom (Text), Photo (Image), Role (Text), Bio (Textarea), LinkedIn (URL).</li>
<li>Layout : Block ou Row selon UX souhaitee.</li>
</ol>
<p>Affichage :</p>
<p><code>&lt;?php if (have_rows('equipe')): while (have_rows('equipe')): the_row(); ?&gt;<br/>
&nbsp;&nbsp;&lt;div class="member"&gt;<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&lt;img src="&lt;?= esc_url(get_sub_field('photo')['url']) ?&gt;" /&gt;<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&lt;h3&gt;&lt;?php the_sub_field('nom'); ?&gt;&lt;/h3&gt;<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&lt;p&gt;&lt;?php the_sub_field('bio'); ?&gt;&lt;/p&gt;<br/>
&nbsp;&nbsp;&lt;/div&gt;<br/>
&lt;?php endwhile; endif; ?&gt;</code></p>
<h2>8. ACF Flexible Content : page builder simplifie</h2>
<p>Permet de creer des sections modulaires (Hero, Features, CTA, Testimonials) que le client peut empiler / reordonner / supprimer. Excellent compromis entre Elementor (lourd) et Gutenberg pur (technique).</p>
<h2>9. Cas reel : site immobilier au Senegal</h2>
<p>CPT : Bien Immobilier. Champs ACF : prix, surface, chambres, salles de bain, statut (vente/location), ville, quartier, galerie, plan PDF, video YouTube, agent referent. Page liste avec filtres dynamiques en AJAX. Resultat : 200+ biens geres facilement par l agence sans developpeur.</p>
<h2>FAQ</h2>
<p><strong>Combien de CPT maximum sur un site ?</strong></p>
<p>Pas de limite technique. Pratiquement, 3 a 8 CPT pour rester comprehensible. Au-dela, regroupez en taxonomies.</p>
<p><strong>ACF Pro vaut-il 49 USD/an ?</strong></p>
<p>Oui des que vous depassez les besoins de base : Repeater, Flexible Content, Gallery, Options Page, Gutenberg blocks custom.</p>
<p><strong>Alternative gratuite a ACF Pro ?</strong></p>
<p>Meta Box (avec extensions premium), CMB2 (open source mais sans GUI), Carbon Fields (developpeur). ACF reste le plus complet en 2026.</p>
<blockquote>CPT + ACF, c est la combinaison qui transforme WordPress en CMS sur-mesure sans coder un seul modele de donnees from scratch.</blockquote>
<p>Vous voulez un site WordPress structure avec CPT et ACF ? <a href="/contact">Devis Pirabel Labs en 48h</a>.</p>"""},
            {'title': "Child themes : personnaliser sans casser l'update",
             'duration': 18,
             'content_html': """<p>Modifier directement un theme parent, c est se condamner a perdre toutes ses modifications a la prochaine mise a jour. La solution professionnelle : le child theme. Cette lecon vous montre comment creer, structurer et exploiter un child theme WordPress en 30 minutes, avec les meilleures pratiques 2026.</p>
<h2>1. Qu est-ce qu un child theme ?</h2>
<p>Un theme enfant herite de toutes les fonctionnalites de son parent (templates, CSS, fonctions) mais permet de les surcharger sans modifier les fichiers parent. Quand le parent est mis a jour, vos personnalisations restent intactes.</p>
<h2>2. Structure minimale d un child theme</h2>
<p>4 fichiers dans le dossier <code>/wp-content/themes/mon-child-theme/</code> :</p>
<ul>
<li><strong>style.css</strong> : meta-donnees du theme + CSS custom.</li>
<li><strong>functions.php</strong> : enqueue du CSS parent + fonctions custom.</li>
<li><strong>screenshot.png</strong> : visuel du theme (1200x900 px recommande).</li>
<li><strong>(optionnel)</strong> templates surchargeants : header.php, footer.php, etc.</li>
</ul>
<h2>3. Le fichier style.css</h2>
<p><code>/*<br/>
Theme Name: Mon Child Astra<br/>
Theme URI: https://votre-site.com/<br/>
Description: Child theme d Astra avec personnalisations Pirabel Labs.<br/>
Author: Votre Nom<br/>
Author URI: https://votre-site.com/<br/>
Template: astra<br/>
Version: 1.0.0<br/>
Text Domain: mon-child-astra<br/>
*/</code></p>
<p>Important : "Template" doit etre exactement le slug du dossier du theme parent (astra, generatepress, hello-elementor, etc.).</p>
<h2>4. Le fichier functions.php</h2>
<p><code>&lt;?php<br/>
function mon_child_enqueue_styles() {<br/>
&nbsp;&nbsp;wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');<br/>
&nbsp;&nbsp;wp_enqueue_style('child-style', get_stylesheet_uri(), ['parent-style']);<br/>
}<br/>
add_action('wp_enqueue_scripts', 'mon_child_enqueue_styles');</code></p>
<p>Cela charge le CSS parent puis le CSS enfant en dependance, garantissant que vos surcharges CSS s appliquent en cascade.</p>
<h2>5. Activer le child theme</h2>
<p>Apparence > Themes > Mon Child Astra > Activer. Le site continue de s afficher comme avant (il herite tout du parent) mais vous pouvez maintenant le personnaliser.</p>
<h2>6. Generer un child theme sans coder</h2>
<p>Plugin Child Theme Configurator (gratuit). 3 etapes :</p>
<ol>
<li>Choisir le parent.</li>
<li>Cliquer "Analyze" puis "Create New Child Theme".</li>
<li>Activer le child theme.</li>
</ol>
<p>Bonus : copie automatique des templates parent dans le child + import des reglages Customizer.</p>
<h2>7. Surcharger un template parent</h2>
<p>Copiez n importe quel fichier .php du parent dans le child (meme nom, meme chemin) et modifiez. Exemple : surcharger header.php pour ajouter un banner promo.</p>
<p>Pour les templates dans des sous-dossiers (page-templates/), respectez la meme arborescence dans le child.</p>
<h2>8. Surcharger CSS sans !important</h2>
<p>Comme votre CSS enfant est charge APRES le parent, vos selecteurs gagnent par specificite egale + ordre. Evitez !important sauf en derniere extremite.</p>
<p>Exemple : surcharger la couleur des liens.</p>
<p><code>a { color: #6366F1; transition: color 0.2s ease; }<br/>
a:hover { color: #4F46E5; }</code></p>
<h2>9. Ajouter du JS custom</h2>
<p><code>function mon_child_enqueue_scripts() {<br/>
&nbsp;&nbsp;wp_enqueue_script('mon-script', get_stylesheet_directory_uri() . '/js/custom.js', ['jquery'], '1.0', true);<br/>
}<br/>
add_action('wp_enqueue_scripts', 'mon_child_enqueue_scripts');</code></p>
<h2>10. Cas reels d usage</h2>
<ul>
<li>Modifier le header Astra pour ajouter un selecteur de langue custom.</li>
<li>Modifier le footer pour ajouter un widget de chatbot.</li>
<li>Surcharger single.php pour modifier l affichage des articles.</li>
<li>Ajouter une fonction PHP qui modifie le permalink des CPT.</li>
<li>Charger un CSS / JS conditionnel sur certaines pages uniquement.</li>
</ul>
<h2>FAQ</h2>
<p><strong>Faut-il un child theme meme si on ne customise pas ?</strong></p>
<p>Recommande oui. Cela vous laisse l option de personnaliser plus tard sans risque.</p>
<p><strong>Le child theme ralentit-il le site ?</strong></p>
<p>Non, gain de 5 a 15 ms negligeable. Le benefice de maintenance compense largement.</p>
<p><strong>Que se passe-t-il si je supprime le parent ?</strong></p>
<p>Le child cesse de fonctionner (le child a besoin du parent). Gardez toujours les 2 themes installes.</p>
<blockquote>Personnaliser sans child theme, c est ecrire son livre sur un manuel scolaire de la mediatheque municipale. Au prochain reemprunt, tout disparait.</blockquote>
<p>Pirabel Labs vous livre votre child theme pret a personnaliser : <a href="/contact">devis sur-mesure</a>.</p>"""},
            {'title': "Hooks WordPress : actions et filtres essentiels",
             'duration': 20,
             'content_html': """<p>Les hooks (actions et filtres) sont le mecanisme central de WordPress qui vous permet de modifier ou etendre n importe quel comportement sans toucher au core. Maitriser les hooks, c est passer de simple utilisateur a developpeur WordPress. Cette lecon couvre les 20 hooks les plus utiles avec des exemples concrets.</p>
<h2>1. Difference entre actions et filtres</h2>
<ul>
<li><strong>Action</strong> : declenche du code a un moment precis du cycle de vie. Pas de valeur a retourner.</li>
<li><strong>Filtre</strong> : modifie une valeur passee en parametre et la retourne. Doit toujours retourner.</li>
</ul>
<p>Syntaxe action : <code>add_action('hook_name', 'ma_fonction', priority, accepted_args);</code></p>
<p>Syntaxe filtre : <code>add_filter('hook_name', 'ma_fonction', priority, accepted_args);</code></p>
<h2>2. Les 8 actions les plus utiles</h2>
<ol>
<li><strong>init</strong> : tout setup initial (CPT, taxonomies, sessions).</li>
<li><strong>wp_enqueue_scripts</strong> : charger CSS et JS frontend.</li>
<li><strong>admin_enqueue_scripts</strong> : charger CSS et JS admin.</li>
<li><strong>wp_head</strong> : injecter du code dans la balise &lt;head&gt;.</li>
<li><strong>wp_footer</strong> : injecter du code juste avant &lt;/body&gt;.</li>
<li><strong>save_post</strong> : declencher action quand un article/page est sauvegarde.</li>
<li><strong>user_register</strong> : declencher action a la creation d un nouvel utilisateur.</li>
<li><strong>woocommerce_thankyou</strong> : action apres une commande WooCommerce reussie.</li>
</ol>
<h2>3. Les 8 filtres les plus utiles</h2>
<ol>
<li><strong>the_content</strong> : modifier le contenu d un article avant affichage.</li>
<li><strong>the_title</strong> : modifier le titre.</li>
<li><strong>excerpt_length</strong> : changer la longueur de l extrait.</li>
<li><strong>excerpt_more</strong> : changer le texte "[...]" de fin d extrait.</li>
<li><strong>wp_mail_from</strong> : modifier l email expediteur des emails WordPress.</li>
<li><strong>wp_mail_from_name</strong> : modifier le nom expediteur.</li>
<li><strong>upload_mimes</strong> : autoriser des formats de fichiers supplementaires (SVG, WEBP).</li>
<li><strong>login_redirect</strong> : rediriger l utilisateur apres login selon son role.</li>
</ol>
<h2>4. Exemple 1 : modifier l email expediteur</h2>
<p><code>function pirabel_change_email_from($email) {<br/>
&nbsp;&nbsp;return 'contact@pirabellabs.com';<br/>
}<br/>
add_filter('wp_mail_from', 'pirabel_change_email_from');<br/><br/>
function pirabel_change_email_from_name($name) {<br/>
&nbsp;&nbsp;return 'Pirabel Labs';<br/>
}<br/>
add_filter('wp_mail_from_name', 'pirabel_change_email_from_name');</code></p>
<p>Resultat : tous les emails WordPress (notifications, mot de passe oublie) partent de "Pirabel Labs &lt;contact@pirabellabs.com&gt;".</p>
<h2>5. Exemple 2 : autoriser l upload SVG</h2>
<p><code>function pirabel_allow_svg_upload($mimes) {<br/>
&nbsp;&nbsp;$mimes['svg'] = 'image/svg+xml';<br/>
&nbsp;&nbsp;return $mimes;<br/>
}<br/>
add_filter('upload_mimes', 'pirabel_allow_svg_upload');</code></p>
<p>Securite : combinez avec le plugin Safe SVG pour scanner les SVG uploades (eviter XSS).</p>
<h2>6. Exemple 3 : rediriger apres login selon role</h2>
<p><code>function pirabel_login_redirect($redirect_to, $request, $user) {<br/>
&nbsp;&nbsp;if (isset($user-&gt;roles) &amp;&amp; in_array('shop_manager', $user-&gt;roles)) {<br/>
&nbsp;&nbsp;&nbsp;&nbsp;return admin_url('edit.php?post_type=shop_order');<br/>
&nbsp;&nbsp;}<br/>
&nbsp;&nbsp;return $redirect_to;<br/>
}<br/>
add_filter('login_redirect', 'pirabel_login_redirect', 10, 3);</code></p>
<h2>7. Exemple 4 : ajouter du JS dans le footer</h2>
<p><code>function pirabel_add_chat_script() { ?&gt;<br/>
&lt;script&gt;<br/>
// Chat widget Brevo<br/>
window.BrevoConversationsID = 'XXXXX';<br/>
&lt;/script&gt;<br/>
&lt;?php }<br/>
add_action('wp_footer', 'pirabel_add_chat_script');</code></p>
<h2>8. Trouver le bon hook : QueryMonitor</h2>
<p>Plugin Query Monitor (gratuit). Vous montre tous les hooks executes sur la page courante, avec leur ordre et leurs callbacks. Indispensable pour le debugging et apprendre.</p>
<h2>9. Priorite et arguments</h2>
<p>La priorite (defaut 10) determine l ordre d execution. Plus le nombre est petit, plus tot. Pour s executer apres tout le monde, mettez 999.</p>
<p>accepted_args : nombre d arguments que votre fonction recoit. Par defaut 1.</p>
<h2>10. Hooks plugins : Rank Math, WooCommerce, Elementor</h2>
<p>Chaque grand plugin expose ses propres hooks. WooCommerce a 800+ hooks documentes. Exemple : <code>woocommerce_before_main_content</code>, <code>woocommerce_after_add_to_cart_button</code>, <code>woocommerce_email_subject_processing_order</code>.</p>
<h2>FAQ</h2>
<p><strong>Ou ajouter mes hooks ?</strong></p>
<p>Dans functions.php du child theme, ou dans un plugin custom dedie. Jamais dans le theme parent.</p>
<p><strong>Combien de hooks WordPress existent ?</strong></p>
<p>1 200+ dans le core, plus ceux des plugins. Inutile de tous les connaitre, maitrisez les 20 essentiels.</p>
<p><strong>Comment debugger un hook qui ne fonctionne pas ?</strong></p>
<p>1) Query Monitor pour verifier qu il s execute, 2) error_log pour logger, 3) wp_die() pour stopper et inspecter.</p>
<blockquote>Comprendre les hooks WordPress, c est passer de la conduite automatique a la conduite manuelle. Plus de controle, plus de plaisir, plus de puissance.</blockquote>
<p>Vous voulez automatiser des comportements WordPress sur-mesure ? <a href="/contact">Pirabel Labs developpe vos hooks</a>.</p>"""},
            {'title': "WP-CLI : automatiser les taches d'admin",
             'duration': 18,
             'content_html': """<p>WP-CLI est l outil en ligne de commande officiel WordPress. Il vous permet de gerer votre site sans passer par l interface admin : creer un utilisateur, installer / mettre a jour des plugins, faire un search & replace, regenerer les thumbnails, exporter / importer la DB. Cette lecon vous apprend les 25 commandes WP-CLI les plus utiles pour 90 % des cas pro.</p>
<h2>1. Pre-requis et installation</h2>
<p>WP-CLI requiert SSH ou WP-CLI Terminal plugin. Acces SSH dispo chez : Hostinger, Kinsta, WP Engine, Cloudways, SiteGround, IONOS.</p>
<p>Installation manuelle (Linux/macOS) :</p>
<p><code>curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar<br/>
chmod +x wp-cli.phar<br/>
sudo mv wp-cli.phar /usr/local/bin/wp</code></p>
<p>Verification : <code>wp --info</code>.</p>
<h2>2. Premieres commandes : verifier l etat</h2>
<ul>
<li><code>wp core version</code> : version WordPress installee.</li>
<li><code>wp option get siteurl</code> : URL du site.</li>
<li><code>wp option get admin_email</code> : email admin.</li>
<li><code>wp user list</code> : liste tous les users.</li>
<li><code>wp plugin list</code> : liste plugins + status (active/inactive).</li>
<li><code>wp theme list</code> : liste themes + status.</li>
</ul>
<h2>3. Gerer le core WordPress</h2>
<ul>
<li><code>wp core download</code> : telecharger le core.</li>
<li><code>wp core install --url=site.com --title="Mon Site" --admin_user=admin --admin_password=xxx --admin_email=admin@site.com</code> : installer.</li>
<li><code>wp core update</code> : mettre a jour le core.</li>
<li><code>wp core update-db</code> : MAJ schema DB apres update core.</li>
<li><code>wp core verify-checksums</code> : verifier integrite fichiers core (detecter hack).</li>
</ul>
<h2>4. Gerer les plugins</h2>
<ul>
<li><code>wp plugin install rank-math --activate</code> : installer + activer.</li>
<li><code>wp plugin update --all</code> : mettre a jour tous les plugins.</li>
<li><code>wp plugin deactivate wordfence</code> : desactiver.</li>
<li><code>wp plugin delete hello-dolly</code> : supprimer.</li>
<li><code>wp plugin search seo</code> : chercher plugins dans le repo.</li>
</ul>
<h2>5. Gerer les utilisateurs</h2>
<ul>
<li><code>wp user create gildas gildas@pirabellabs.com --role=editor --send-email</code></li>
<li><code>wp user update 5 --user_pass=NouveauMotDePasse</code></li>
<li><code>wp user delete 7 --reassign=1</code> : supprimer user 7, reassigner contenus a user 1.</li>
<li><code>wp user list --role=administrator</code> : lister admins.</li>
</ul>
<h2>6. Search & Replace (migration)</h2>
<p>Le killer feature de WP-CLI : <code>wp search-replace 'http://localhost/site' 'https://votre-site.com'</code></p>
<p>Options utiles :</p>
<ul>
<li><code>--dry-run</code> : simuler sans modifier.</li>
<li><code>--all-tables</code> : inclure les tables non standard.</li>
<li><code>--export=updated.sql</code> : exporter le SQL avec les replacements.</li>
</ul>
<h2>7. Gerer la base de donnees</h2>
<ul>
<li><code>wp db export backup.sql</code> : exporter la DB.</li>
<li><code>wp db import backup.sql</code> : importer.</li>
<li><code>wp db optimize</code> : optimiser tables.</li>
<li><code>wp db repair</code> : reparer tables corrompues.</li>
<li><code>wp db query "SELECT * FROM wp_users LIMIT 10"</code> : executer SQL custom.</li>
</ul>
<h2>8. Gerer les options et meta</h2>
<ul>
<li><code>wp option update blogname "Nouveau Nom"</code></li>
<li><code>wp option delete custom_option</code></li>
<li><code>wp post meta get 123 _custom_field</code></li>
<li><code>wp post meta update 123 _custom_field "nouvelle valeur"</code></li>
</ul>
<h2>9. Cron et taches planifiees</h2>
<ul>
<li><code>wp cron event list</code> : voir taches cron WordPress planifiees.</li>
<li><code>wp cron event run wp_scheduled_delete</code> : forcer execution.</li>
<li><code>wp cron schedule list</code> : voir schedules dispo.</li>
</ul>
<h2>10. Regenerer thumbnails</h2>
<p><code>wp media regenerate --yes</code> : regenere toutes les tailles d images. Utile apres avoir change les dimensions thumbnails dans le theme.</p>
<h2>11. Automatiser via cron Linux</h2>
<p>Crontab pour sauvegardes nightly :</p>
<p><code>0 3 * * * cd /var/www/site &amp;&amp; wp db export /backups/$(date +\\%Y-\\%m-\\%d).sql --quiet</code></p>
<h2>12. Cas reel : maintenance 50 sites</h2>
<p>Script Bash avec WP-CLI pour mettre a jour 50 sites WordPress en 5 minutes :</p>
<p><code>for site in /var/www/*/; do<br/>
&nbsp;&nbsp;wp --path="$site" plugin update --all<br/>
&nbsp;&nbsp;wp --path="$site" theme update --all<br/>
&nbsp;&nbsp;wp --path="$site" core update<br/>
done</code></p>
<h2>FAQ</h2>
<p><strong>WP-CLI fonctionne-t-il sur hebergement mutualise sans SSH ?</strong></p>
<p>Non, SSH obligatoire. Alternative : plugin "WP-CLI Terminal" qui simule un terminal dans l admin.</p>
<p><strong>WP-CLI vs interface admin : laquelle utiliser ?</strong></p>
<p>Admin pour les actions ponctuelles. WP-CLI pour les bulk operations, automatisations, scripts.</p>
<p><strong>WP-CLI est-il dangereux ?</strong></p>
<p>Comme tout outil ligne de commande : oui si mal utilise. Toujours sauvegarder avant operations destructives. Tester avec <code>--dry-run</code> si dispo.</p>
<blockquote>WP-CLI transforme 3 heures de clics admin en 3 minutes de terminal. Indispensable pour tout serieux qui gere plus de 3 sites.</blockquote>
<p>Pirabel Labs automatise vos taches WP via WP-CLI : <a href="/contact">scripts sur-mesure</a>.</p>"""},
            {'title': "Multisite WordPress : quand et comment l'utiliser",
             'duration': 22,
             'content_html': """<p>WordPress Multisite (anciennement WordPress MU) permet de gerer plusieurs sites depuis une seule installation WordPress. Utilise par des reseaux comme TechCrunch (TechCrunch.com + sous-domaines internationaux), Harvard.edu, BBC America, Universal Music. Cette lecon vous explique quand l utiliser, comment l installer et comment l administrer.</p>
<h2>1. Quand utiliser Multisite</h2>
<p><strong>Bons cas d usage</strong> :</p>
<ul>
<li>Reseau de sites partageant des plugins, themes, utilisateurs (groupe d ecoles, franchise).</li>
<li>Site multilingue avec une instance par langue (alternative a Polylang/WPML).</li>
<li>Plateforme SaaS qui propose un site WordPress par client (WordPress.com lui-meme).</li>
<li>Groupe presse / media avec plusieurs publications.</li>
<li>Universite avec un site par departement.</li>
<li>Mairie ou collectivite avec un site par service.</li>
</ul>
<p><strong>Mauvais cas d usage</strong> :</p>
<ul>
<li>2-3 sites independants sans rien en commun (autant faire 3 installs separees).</li>
<li>Site ecommerce unique avec multi-langues (WPML ou Polylang sont mieux).</li>
<li>Sites avec besoins techniques tres differents (plugins incompatibles entre sites).</li>
</ul>
<h2>2. Pre-requis techniques</h2>
<ul>
<li>WordPress 6.0+.</li>
<li>PHP 8.0+.</li>
<li>Acces wp-config.php et .htaccess.</li>
<li>Hebergeur compatible : Kinsta, WP Engine, Cloudways, OVH, IONOS. Eviter hebergements mutualises trop limites.</li>
<li>DNS prepare : wildcard DNS si vous utilisez les sous-domaines (*.votre-site.com).</li>
</ul>
<h2>3. Choisir entre sous-domaines et sous-dossiers</h2>
<ul>
<li><strong>Sous-domaines (site1.exemple.com, site2.exemple.com)</strong> : SEO independant (chaque sous-domaine est traite comme un site distinct par Google). Necessite wildcard DNS. Recommande pour reseaux multilingues ou multi-marques.</li>
<li><strong>Sous-dossiers (exemple.com/site1, exemple.com/site2)</strong> : SEO partage avec le domaine racine. Plus simple a configurer DNS. Recommande pour publications internes ou departements.</li>
</ul>
<h2>4. Activer Multisite</h2>
<ol>
<li>Sauvegarde complete avant tout.</li>
<li>Editer wp-config.php, ajouter avant "/* That s all, stop editing! */" :</li>
</ol>
<p><code>define('WP_ALLOW_MULTISITE', true);</code></p>
<ol start="3">
<li>Reconnectez-vous a /wp-admin.</li>
<li>Outils > Reseau Setup.</li>
<li>Choisir sous-domaines ou sous-dossiers.</li>
<li>Cliquez "Installer".</li>
<li>WordPress vous donne 2 blocs de code a copier dans wp-config.php et .htaccess.</li>
<li>Sauvegardez, reconnectez-vous, vous avez maintenant un Network admin (Mes Sites > Administration du Reseau).</li>
</ol>
<h2>5. Creer un nouveau site dans le reseau</h2>
<p>Network Admin > Sites > Add New > entrez slug, titre, email admin. Le site est cree instantanement et accessible.</p>
<h2>6. Gestion des plugins en Multisite</h2>
<ul>
<li><strong>Network Activate</strong> : active le plugin sur TOUS les sites du reseau.</li>
<li><strong>Per-site activation</strong> : chaque site admin peut activer/desactiver lui-meme.</li>
<li><strong>Restriction</strong> : Network Admin peut interdire aux site admin d installer des plugins.</li>
</ul>
<h2>7. Themes en Multisite</h2>
<p>Les themes sont installes au niveau reseau, mais doivent etre Network Enabled avant que les sites puissent les activer individuellement.</p>
<h2>8. Utilisateurs partages</h2>
<p>Un utilisateur unique a un seul compte sur l ensemble du reseau. Mais ses roles peuvent differer par site (Admin sur Site A, Editor sur Site B).</p>
<p>Super Admin : role supreme qui gere le reseau entier. Limitez a 1-2 personnes.</p>
<h2>9. Mapping de domaines</h2>
<p>Depuis WordPress 4.5, le mapping de domaines est natif. Vous pouvez mapper site1.exemple.com vers monsite-externe.com en quelques clics. Plus besoin du plugin "WordPress MU Domain Mapping".</p>
<h2>10. Limitations et pieges</h2>
<ul>
<li>Tous les sites partagent la meme installation : un plugin buggy peut casser tout le reseau.</li>
<li>Migration d un sous-site vers une install standalone est complexe.</li>
<li>WooCommerce en Multisite : possible mais delicat, eviter pour de gros catalogues.</li>
<li>Performance : si un site explose en trafic, il impacte les autres (meme DB, meme serveur).</li>
</ul>
<h2>11. Alternatives a Multisite</h2>
<ul>
<li><strong>Polylang ou WPML</strong> : pour multilingue, plus simple a maintenir.</li>
<li><strong>InstaWP ou Cloudways Multisite</strong> : managed solutions.</li>
<li><strong>WordPress Headless + Next.js</strong> : pour gros reseaux SaaS.</li>
</ul>
<h2>12. Cas reel : reseau d ecoles privees en Cote d Ivoire</h2>
<p>12 ecoles, 1 site par ecole. Setup Multisite sous-dossiers (ecole-abidjan.exemple.com, ecole-bouake.exemple.com, etc.). Plugins partages : Rank Math, WP Rocket, Wordfence. Themes : 1 theme parent + child themes par ecole pour personnaliser couleurs / logos. Resultat : maintenance centralisee, mises a jour en 5 min pour les 12 sites, economies d hebergement.</p>
<h2>FAQ</h2>
<p><strong>Multisite pour ecommerce ?</strong></p>
<p>Possible pour 2-3 boutiques avec catalogues partages. Au-dela, faire des installs WooCommerce separees est plus stable.</p>
<p><strong>Combien de sites max dans un reseau ?</strong></p>
<p>Pas de limite technique. WordPress.com gere des millions. En pratique pour PME : 5 a 50 sites.</p>
<p><strong>Comment passer d un site standard a Multisite ?</strong></p>
<p>Sauvegarde, activation WP_ALLOW_MULTISITE, Network Setup. Le site existant devient le "site principal" du reseau.</p>
<blockquote>Multisite est puissant mais pas universel. Reflechissez 3 fois avant d activer : la migration vers/depuis Multisite est tres couteuse.</blockquote>
<p>Vous hesitez entre Multisite ou installations separees ? <a href="/rendez-vous">RDV gratuit avec un architecte Pirabel Labs</a>.</p>"""},
        ],
    },
]


if __name__ == '__main__':
    total = sum(len(m['lessons']) for m in WORDPRESS_INTERMEDIAIRE_MODULES)
    print(f"Modules: {len(WORDPRESS_INTERMEDIAIRE_MODULES)}, Lessons: {total}")
