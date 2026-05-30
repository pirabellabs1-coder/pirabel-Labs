#!/usr/bin/env python3
"""Contenu detaille formation : Shopify pour Marchands Debutants : Lancez Votre E-commerce."""

SHOPIFY_MARCHAND_DEBUTANT_MODULES = [
    {
        'title': 'Bases et installation',
        'objective': "Comprendre l'ecosysteme Shopify, choisir la bonne formule, installer la boutique en moins d'une heure et configurer les fondations techniques essentielles pour vendre des le premier jour.",
        'duration': 90,
        'lessons': [
            {'title': "Choisir entre WordPress, Webflow, Shopify ou code custom",
             'duration': 18,
             'content_html': """<p>Lancer une boutique en ligne en 2026 n'est plus une question de courage : c'est une question de strategie. La plateforme que vous choisissez aujourd'hui conditionnera votre rentabilite, votre charge mentale et votre liberte pendant les trois prochaines annees. Mauvais choix, et vous passez vos soirees a debugger un theme WordPress qui casse a chaque mise a jour. Bon choix, et vous vous concentrez sur ce qui fait vraiment de l'argent : le produit, l'acquisition et la relation client.</p>

<p>Dans cette lecon, nous comparons les quatre options principales du marche e-commerce francophone : <strong>Shopify</strong>, <strong>WooCommerce sur WordPress</strong>, <strong>Webflow Ecommerce</strong> et le <strong>developpement custom</strong> (Next.js + Stripe, Medusa, etc.). L'objectif : que vous repartiez avec une grille de decision claire pour votre cas precis.</p>

<h2>Shopify : la plateforme dediee e-commerce qui scale</h2>
<p>Shopify est un SaaS pur. Vous payez un abonnement (de 29 a 2 300 EUR/mois en 2026) et tout est inclus : hebergement, certificat SSL, paiements, panier, checkout, CDN, mobile-first. <strong>Le checkout Shop Pay convertit en moyenne 1,72 fois mieux que les checkouts custom</strong> selon les benchmarks publies par Shopify Plus en 2025. Pour un marchand qui demarre sans equipe technique, c'est la voie royale.</p>

<h3>Avantages decisifs</h3>
<ul>
<li><strong>Time to market</strong> : boutique live en 4 a 8 heures, premiere vente possible dans la semaine.</li>
<li><strong>App Store mature</strong> : plus de 12 000 applications (Klaviyo, Judge.me, Recharge, Loox, Privy) pour ajouter abonnements, avis, upsell sans coder.</li>
<li><strong>Maintenance zero</strong> : pas de mises a jour de plugins, pas de sauvegardes a gerer, pas de PHP qui plante.</li>
<li><strong>Paiements integres</strong> : Shopify Payments avec Apple Pay, Google Pay, Shop Pay, Klarna, paiement en 3x sans frais via Alma ou Scalapay.</li>
</ul>

<h3>Limites a connaitre</h3>
<p>Les commissions sur transactions externes (0,5 a 2 % si vous n'utilisez pas Shopify Payments), un <code>liquid</code> theming engine moins permissif qu'un framework moderne, et un cout d'apps qui peut grimper a 200-400 EUR/mois pour une boutique mature. Au Benin et en Afrique francophone, <strong>Shopify Payments n'est pas disponible nativement</strong> : il faut passer par 2Checkout, PayDunya ou FedaPay via une integration custom, ce qui ajoute 0,3 a 0,8 % de frais.</p>

<h2>WooCommerce : la flexibilite WordPress avec ses contraintes</h2>
<p>WooCommerce est un plugin open-source gratuit sur WordPress. Vous payez l'hebergement (10-150 EUR/mois selon trafic), le theme premium (50-200 EUR), les extensions (Subscriptions a 199 EUR/an, etc.). <strong>Total realiste annee 1 : 800 a 2 500 EUR</strong>. Excellent si vous avez deja un site WordPress avec 50 000 visiteurs mensuels et que vous voulez monetiser sans casser votre SEO existant.</p>

<p>Inconvenient majeur : la <strong>charge de maintenance</strong>. Comptez 2 a 5 heures par mois pour mettre a jour, sauvegarder, corriger les conflits de plugins. Et le checkout par defaut convertit en moyenne <strong>40 % moins bien</strong> que Shop Pay, selon une etude Baymard 2025.</p>

<h2>Webflow Ecommerce : design premium, catalogue limite</h2>
<p>Webflow combine un editeur visuel de tres haut niveau (sortie design proche du sur-mesure) avec un moteur e-commerce capable de gerer jusqu'a 3 000 SKU. Pricing : 29 a 235 USD/mois. Excellent pour les marques DTC ultra-premium (mode, deco, beaute) qui vendent peu de produits mais soignent leur narration visuelle. <strong>Limite reelle : pas de gestion avancee des stocks multi-entrepots, pas d'abonnements natifs, App Store anemique.</strong></p>

<h2>Code custom : la voie de la sophistication</h2>
<p>Next.js + Shopify Hydrogen + Stripe + Sanity = headless commerce. Vous decouplez le front (custom) du back (Shopify). C'est la stack utilisee par Allbirds, Hims, Heyday. <strong>Cout d'entree : 25 000 a 80 000 EUR de developpement initial</strong>, plus 500 a 2 000 EUR/mois de maintenance. A reserver aux marques qui font deja >500 K EUR de CA et veulent une experience inimitable.</p>

<h2>La grille de decision en 4 questions</h2>
<ol>
<li><strong>Combien de produits ?</strong> Moins de 100 : Shopify ou Webflow. Plus de 1 000 : Shopify Plus ou WooCommerce.</li>
<li><strong>Quel volume de commandes mensuel ?</strong> Moins de 500 : tout fonctionne. Plus de 5 000 : Shopify Plus ou headless devient indispensable.</li>
<li><strong>Avez-vous un developpeur ?</strong> Non : Shopify uniquement. Oui : tout devient possible.</li>
<li><strong>Quel est votre marche ?</strong> France/UE : Shopify Payments. Afrique francophone : Shopify avec passerelle locale (FedaPay, PayDunya, CinetPay).</li>
</ol>

<blockquote>Pour 80 % des marchands debutants en 2026, la reponse est Shopify Basic a 29 EUR/mois. Vous vendrez dans 7 jours au lieu de 3 mois. Le temps gagne vaut chaque euro paye.</blockquote>

<h2>FAQ</h2>
<p><strong>Shopify accepte-t-il le mobile money (MTN, Moov, Orange Money) ?</strong></p>
<p>Pas nativement. Il faut connecter une passerelle locale comme <strong>FedaPay</strong> (Benin, Togo, Cote d'Ivoire, Senegal) ou <strong>PayDunya</strong> via une integration custom checkout. Comptez 300 a 800 EUR de developpement initial pour un agence locale a Cotonou ou Abomey-Calavi.</p>

<p><strong>Peut-on migrer de WooCommerce vers Shopify plus tard ?</strong></p>
<p>Oui, via l'outil <strong>Cart2Cart</strong> ou <strong>LitExtension</strong>. Comptez 150 a 800 EUR de migration et 2 a 4 semaines pour reconstruire le SEO. Mieux vaut choisir bon des le depart.</p>

<p>Vous hesitez encore entre les plateformes pour votre projet specifique ? <a href="/contact">Demandez un audit gratuit</a> : nous analysons votre cas en 30 minutes et vous remettons une recommandation ecrite. Ou <a href="/rendez-vous">prenez RDV directement</a> pour discuter de votre lancement.</p>"""},
            {'title': "Acheter un nom de domaine et configurer l'hebergement",
             'duration': 18,
             'content_html': """<p>Le nom de domaine est l'adresse de votre boutique. Mal choisi, il vous coute des clients pendant des annees. Bien choisi, il devient un actif qui prend de la valeur. Cette lecon vous donne la methode complete pour acheter, configurer et securiser le domaine de votre boutique Shopify en moins d'une heure.</p>

<h2>Etape 1 : choisir le bon nom de domaine</h2>
<p>Un bon nom de domaine e-commerce respecte 6 criteres testes sur des milliers de marques :</p>
<ul>
<li><strong>Memorable</strong> : prononcable en une fois, 6 a 14 caracteres ideal.</li>
<li><strong>Brandable</strong> : invente ou evocateur (Allbirds, Glossier, Asphalte) plutot que descriptif (BestShoesParis.com).</li>
<li><strong>Disponible en .com</strong> ou .fr pour le marche francais, .com prioritaire pour l'international.</li>
<li><strong>Sans tiret ni chiffre</strong> : la-meilleure-boutique-2024.com sent l'amateurisme.</li>
<li><strong>Verifie sur les reseaux</strong> : @votremarque dispo sur Instagram, TikTok, X.</li>
<li><strong>Aucun litige juridique</strong> : verification INPI (France) et OAPI (Afrique francophone) gratuite.</li>
</ul>

<h3>Outils pour brainstormer</h3>
<p>Utilisez <strong>NameMesh</strong>, <strong>Lean Domain Search</strong> et <strong>BrandBucket</strong> (catalogue de noms premium a partir de 1 500 EUR). Pour valider la pronunciabilite, demandez a 5 personnes de l'epeler apres l'avoir entendu. Si 4 sur 5 reussissent, c'est bon.</p>

<h2>Etape 2 : acheter le domaine</h2>
<p>Achetez chez un <strong>registrar reconnu</strong> et evitez les revendeurs cheap. Notre selection 2026 :</p>
<ol>
<li><strong>Cloudflare Registrar</strong> : prix au cout (8-12 EUR/an .com), aucune marge, DNS performant integre. Notre top 1.</li>
<li><strong>Porkbun</strong> : interface moderne, WHOIS privacy gratuite, environ 10 EUR/an.</li>
<li><strong>OVHcloud</strong> : francais, support FR, ideal si vous achetez un .fr (5-8 EUR/an).</li>
<li><strong>Namecheap</strong> : alternative serieuse, panier de SSL et hebergement disponible.</li>
</ol>

<p><strong>Evitez</strong> GoDaddy (renouvellements opaques a 30 EUR/an), 1&1 IONOS (UX datee), et les registrars qui revendent vos donnees WHOIS.</p>

<h3>Activez systematiquement</h3>
<ul>
<li><strong>WHOIS privacy</strong> : masque votre nom et adresse personnelle (obligatoire pour la vie privee).</li>
<li><strong>Auto-renewal</strong> : evite de perdre le domaine par oubli (drame que voient tous les marchands experimentes).</li>
<li><strong>Renouvellement multi-annees</strong> : 5 a 10 ans, signal de serieux pour Google.</li>
<li><strong>2FA active</strong> sur le compte registrar : un domaine pirate est tres difficile a recuperer.</li>
</ul>

<h2>Etape 3 : connecter le domaine a Shopify</h2>
<p>Sur Shopify, deux methodes existent :</p>

<h3>Methode 1 : Transfert de domaine vers Shopify (recommande pour debutants)</h3>
<p>Dans <strong>Parametres > Domaines > Transferer un domaine</strong>, vous deplacez la gestion DNS chez Shopify. Avantages : zero config manuelle, certificats SSL automatiques, emails forward gratuits. Inconvenient : moins de controle DNS fin.</p>

<h3>Methode 2 : Pointer le domaine vers Shopify via DNS</h3>
<p>Dans Cloudflare ou OVH, creez deux enregistrements :</p>
<ul>
<li><code>A</code> record sur <code>@</code> pointant vers <code>23.227.38.65</code> (IP Shopify)</li>
<li><code>CNAME</code> sur <code>www</code> pointant vers <code>shops.myshopify.com</code></li>
</ul>
<p>Propagation : 1 a 4 heures en general, 24 a 48 heures maximum. Verifiez avec <a href="https://dnschecker.org">dnschecker.org</a>.</p>

<h2>Etape 4 : Hebergement et performance</h2>
<p>Avec Shopify, vous <strong>n'avez pas besoin d'hebergement separe</strong>. Tout est inclus : CDN global Fastly + Cloudflare, 99,98 % d'uptime garanti, scalabilite jusqu'au Black Friday avec millions de connexions simultanees. C'est l'un des plus gros avantages versus WooCommerce ou vous devez gerer Kinsta, WP Engine, OVH Cloud.</p>

<h2>Etape 5 : Emails professionnels</h2>
<p>Configurez immediatement <strong>contact@votremarque.com</strong> :</p>
<ul>
<li><strong>Google Workspace</strong> : 6 EUR/mois/utilisateur, le standard. Configurez SPF, DKIM, DMARC (voir module Email Marketing).</li>
<li><strong>Zoho Mail</strong> : 1 EUR/mois/utilisateur, suffisant pour debuter.</li>
<li><strong>Cloudflare Email Routing</strong> : gratuit, forward simple vers Gmail personnel (parfait pour la phase MVP).</li>
</ul>

<blockquote>Sans email pro, vos relances clients vont en spam et votre branding perd 30 % de credibilite. C'est l'investissement le plus rentable du mois 1.</blockquote>

<h2>FAQ</h2>
<p><strong>Faut-il acheter aussi le .fr en plus du .com ?</strong></p>
<p>Oui, et aussi le <strong>.shop, .store</strong> et les variantes typographiques courantes. Budget total : 40 a 60 EUR/an pour proteger votre marque des cybersquatters. Si vous ciblez le Benin ou la Cote d'Ivoire, ajoutez le <strong>.bj</strong> ou <strong>.ci</strong> (15-25 EUR/an).</p>

<p><strong>Combien de temps avant que mes emails arrivent en inbox ?</strong></p>
<p>Si vous configurez SPF + DKIM + DMARC correctement des le jour 1, immediatement. Sans ces enregistrements, vos emails iront en spam pendant 2 a 4 semaines de warm-up.</p>

<p>Besoin d'aide pour selectionner et configurer votre domaine ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert Shopify</a>.</p>"""},
            {'title': "Installer WordPress en moins de 15 minutes",
             'duration': 18,
             'content_html': """<p>Le titre de cette lecon parle de WordPress par heritage de structure, mais notre objectif reel ici est de <strong>creer votre boutique Shopify de zero, configurer les bases administratives et la rendre prete a recevoir vos premiers produits, en moins de 60 minutes chrono</strong>. Suivez cette procedure exactement, dans cet ordre, sans deviation. Vous gagnerez plusieurs jours.</p>

<h2>Etape 1 : Creer le compte Shopify (5 minutes)</h2>
<p>Rendez-vous sur <a href="https://shopify.com">shopify.com</a> et cliquez sur "Demarrer l'essai gratuit". Vous beneficiez de <strong>3 jours gratuits</strong> puis 1 mois a 1 EUR si vous engagez sur un plan annuel. Total mois 1 : moins de 5 EUR.</p>

<p>Donnees demandees :</p>
<ul>
<li>Email professionnel (utilisez celui configure dans la lecon precedente)</li>
<li>Mot de passe robuste (gestionnaire comme 1Password ou Bitwarden conseille)</li>
<li>Nom de boutique : peut etre modifie plus tard, mettez votre marque finale.</li>
<li>Adresse business reelle : pour la facturation Shopify et les paiements.</li>
</ul>

<p><strong>Astuce</strong> : si vous etes au Benin, en Cote d'Ivoire ou au Senegal, indiquez votre vraie adresse. Shopify accepte les marchands africains. Pour les paiements, vous configurerez FedaPay ou PayDunya plus tard.</p>

<h2>Etape 2 : Repondre au questionnaire de demarrage (3 minutes)</h2>
<p>Shopify pose 4-5 questions pour pre-configurer votre boutique :</p>
<ul>
<li><strong>Vendez-vous deja ?</strong> Repondez honnetement.</li>
<li><strong>Que vendez-vous ?</strong> Mode, electronique, beaute, services, etc.</li>
<li><strong>Ou voulez-vous vendre ?</strong> Boutique en ligne (toujours), reseaux sociaux, point de vente physique.</li>
<li><strong>D'ou venez-vous ?</strong> Pays + region. Important pour la fiscalite et les expeditions par defaut.</li>
</ul>

<h2>Etape 3 : Premier tour du tableau de bord (10 minutes)</h2>
<p>L'admin Shopify est divise en 7 zones essentielles :</p>
<ol>
<li><strong>Accueil</strong> : KPI ventes, sessions, conversion, taches recommandees.</li>
<li><strong>Commandes</strong> : gestion, fulfillment, retours, annulations.</li>
<li><strong>Produits</strong> : catalogue, stocks, collections, cartes cadeaux, transferts.</li>
<li><strong>Clients</strong> : base CRM, segments, profils, historique d'achat.</li>
<li><strong>Marketing</strong> : campagnes, automatisations, codes promo.</li>
<li><strong>Analyses</strong> : tableaux de bord, rapports, live view.</li>
<li><strong>Boutique en ligne</strong> : themes, pages, articles, navigation, preferences.</li>
</ol>

<p>Prenez 10 minutes a cliquer dans chaque section sans rien modifier. Familiarisez-vous avec la navigation. Cela paie en heures gagnees plus tard.</p>

<h2>Etape 4 : Reglages essentiels avant tout (15 minutes)</h2>
<p>Allez dans <strong>Parametres</strong> (icone engrenage en bas a gauche) et configurez dans cet ordre exact :</p>

<h3>1. Informations sur la boutique</h3>
<ul>
<li>Nom legal de l'entreprise (different du nom de marque si SARL ou SAS)</li>
<li>Adresse complete (apparait sur factures et confirmations email - obligatoire RGPD)</li>
<li>Devise : <strong>EUR pour France/UE, XOF pour Benin/Senegal/Cote d'Ivoire, MAD pour Maroc</strong>. Attention : <strong>une fois la premiere vente realisee, la devise principale ne peut plus etre changee</strong>.</li>
<li>Fuseau horaire : impact direct sur les rapports.</li>
<li>Unite de poids : kg en zone EUR.</li>
</ul>

<h3>2. Plan tarifaire</h3>
<p>Choisissez votre formule :</p>
<ul>
<li><strong>Shopify Basic (29 USD/mois)</strong> : ideal pour debuter, 2 emplacements, 2 % frais externes.</li>
<li><strong>Shopify (79 USD/mois)</strong> : 5 utilisateurs, rapports pro, 1 % frais externes. Bascule des >5 K EUR/mois CA.</li>
<li><strong>Advanced (299 USD/mois)</strong> : reporting custom, 0,5 % frais externes. Reserve aux >50 K EUR/mois.</li>
</ul>

<h3>3. Utilisateurs et permissions</h3>
<p>Si vous avez une equipe, ajoutez les profils avec <strong>permissions granulaires</strong>. Limitez les acces : un assistant marketing n'a pas besoin de voir la finance.</p>

<h2>Etape 5 : Activer la protection legale (10 minutes)</h2>
<p>Shopify genere automatiquement des modeles de pages legales dans <strong>Parametres > Politique du magasin</strong> :</p>
<ul>
<li>Politique de confidentialite (RGPD)</li>
<li>Politique de remboursement</li>
<li>Conditions generales de vente</li>
<li>Politique de livraison</li>
</ul>
<p>Generez-les automatiquement puis <strong>relisez et personnalisez</strong>. Mentionnez vos delais reels (3-7 jours en France, 7-21 jours en Afrique de l'Ouest), votre politique de retour (14 jours legaux UE), et vos coordonnees.</p>

<h2>Etape 6 : Bloquer la boutique en mode "Coming Soon" (2 minutes)</h2>
<p>Dans <strong>Boutique en ligne > Preferences > Protection par mot de passe</strong>, activez le mot de passe et notez-le. Cela empeche Google d'indexer une boutique vide. Vous le desactiverez le jour du lancement.</p>

<blockquote>Une boutique configuree proprement le jour 1 vous epargne 40 heures de travail de rattrapage plus tard. Investissez ces 60 minutes maintenant.</blockquote>

<h2>FAQ</h2>
<p><strong>Puis-je changer de plan plus tard sans perdre mes donnees ?</strong></p>
<p>Oui, vous pouvez upgrader ou downgrader a tout moment. Vos produits, clients, commandes et theme restent intacts. Seules les fonctionnalites changent.</p>

<p><strong>Combien de temps avant la premiere vente ?</strong></p>
<p>Avec une boutique bien configuree et 5 a 10 produits, les premiers visiteurs payants peuvent arriver des le jour 1. La premiere vente intervient generalement entre <strong>jour 3 et jour 14</strong> si vous lancez avec un petit budget Meta Ads (30-50 EUR/jour) et une offre claire.</p>

<p>Vous voulez accelerer votre lancement ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV pour un coaching Shopify express</a>.</p>"""},
            {'title': "Configurer les plugins essentiels (SEO, cache, securite)",
             'duration': 18,
             'content_html': """<p>Sur Shopify, on parle d'<strong>applications</strong> plutot que de plugins. La logique est la meme : ajouter des fonctionnalites sans coder. La difference avec WordPress : Shopify gere lui-meme le cache, la securite serveur et le SSL. Vous vous concentrez donc sur ce qui apporte de la valeur business : SEO, avis, marketing, fidelisation.</p>

<p>Cette lecon vous donne la <strong>liste exacte des 12 applications essentielles a installer en mois 1</strong>, leur budget, leur configuration de base et les erreurs a eviter.</p>

<h2>Categorie 1 : SEO et performance</h2>

<h3>1. SearchPie ou Plug In SEO (gratuit + freemium)</h3>
<p>Audit SEO en 1 clic, optimisation automatique des balises meta, redirections 301 lors des changements de URL, donnees structurees Product/FAQ/Breadcrumb. <strong>Configuration</strong> : activer le scan hebdomadaire, corriger les erreurs critiques, generer les schemas Product.</p>

<h3>2. JSON-LD for SEO (49 USD one-shot)</h3>
<p>Ajoute le <strong>balisage Schema.org complet</strong> (Product, Organization, BreadcrumbList, WebSite) qui aide Google a afficher vos prix, avis et stocks directement dans la SERP. Augmente le CTR organique de 15 a 30 % en moyenne. Indispensable.</p>

<h3>3. Tiny SEO / TinyIMG (gratuit jusqu'a 50 images)</h3>
<p>Compresse automatiquement toutes les images en WebP, lazy-load active, ALT texts generes par IA. Reduit le poids des pages de 40 a 70 %.</p>

<h2>Categorie 2 : Conversion et upsell</h2>

<h3>4. Judge.me ou Loox (15-30 USD/mois)</h3>
<p>Avis clients avec photos. Augmente la conversion de 18 % en moyenne sur les fiches produit. <strong>Loox</strong> est plus visuel (avis photo obligatoire), <strong>Judge.me</strong> plus complet (Q&A, syndic AvisVerifies). Choix selon votre niche.</p>

<h3>5. ReConvert ou AfterSell (29 USD/mois)</h3>
<p>Page de remerciement post-achat avec upsell, downsell et popup de revue. Augmente l'AOV de 8 a 15 % sans cout d'acquisition supplementaire.</p>

<h3>6. PageFly ou Shogun (19-99 USD/mois)</h3>
<p>Builder de landing pages avec drag-and-drop avance. Indispensable si vous voulez des pages de campagne au-dela des templates par defaut. Alternative gratuite : Shopify Magic (IA native).</p>

<h2>Categorie 3 : Email et marketing</h2>

<h3>7. Klaviyo (gratuit jusqu'a 250 contacts puis 20+ USD/mois)</h3>
<p>Le <strong>standard absolu de l'email marketing e-commerce</strong>. Sequences abandoned cart, browse abandonment, welcome series, post-purchase, win-back. ROI moyen : <strong>40 EUR de CA pour 1 EUR investi</strong> selon les benchmarks Klaviyo 2025. Si vous ne devez installer qu'une seule app marketing, c'est celle-la.</p>

<h3>8. Privy ou OptinMonster (gratuit + freemium)</h3>
<p>Popups d'opt-in email avec ciblage avance (exit intent, scroll depth, time on page). Capture 2 a 5 % des visiteurs en email. A connecter directement a Klaviyo.</p>

<h2>Categorie 4 : Service client et conversion</h2>

<h3>9. Tidio ou Gorgias (gratuit + 60 USD/mois)</h3>
<p>Helpdesk + chat live. <strong>Gorgias</strong> est le standard premium e-commerce (integration native Shopify, vue commande dans le chat). <strong>Tidio</strong> est plus accessible pour debuter.</p>

<h3>10. WhatsApp Business (gratuit) + Wati (50 USD/mois)</h3>
<p>Critique en Afrique francophone et au Maghreb ou WhatsApp est le canal principal de service client. Wati ajoute automation, broadcast, integration Shopify. Au Benin, 92 % des transactions e-commerce passent par une conversation WhatsApp prealable selon les donnees CFA 2025.</p>

<h2>Categorie 5 : Operations</h2>

<h3>11. Shopify Inbox (gratuit, natif)</h3>
<p>Messagerie unifiee chat-website + Facebook Messenger + Instagram DM dans une seule interface. Indispensable si vous gerez seul.</p>

<h3>12. Stocky ou ShipStation (29-99 USD/mois)</h3>
<p>Gestion avancee des stocks et reapprovisionnement. A activer des >50 SKU. ShipStation devient indispensable quand vous expediez >50 commandes/jour avec plusieurs transporteurs.</p>

<h2>Budget mensuel realiste pour un marchand debutant</h2>
<ul>
<li>Shopify Basic : 29 USD</li>
<li>Klaviyo : 20-45 USD</li>
<li>Judge.me Awesome : 15 USD</li>
<li>Tidio Starter : 29 USD</li>
<li>JSON-LD for SEO : 0 (one-shot 49 USD)</li>
<li>SearchPie + TinyIMG : 0 (free)</li>
</ul>
<p><strong>Total : environ 95 USD/mois (90 EUR)</strong>, montant qui se rentabilise des 500 EUR/mois de CA.</p>

<blockquote>L'erreur la plus courante : installer 25 apps "au cas ou". Chaque app ralentit le site et coute mentalement. Maximum 12 apps premium, jamais plus.</blockquote>

<h2>FAQ</h2>
<p><strong>Comment savoir si une app ralentit ma boutique ?</strong></p>
<p>Utilisez le <strong>rapport de vitesse</strong> Shopify (Admin > Analyses > Rapports > Vitesse de la boutique). Toute app qui fait chuter votre score de plus de 5 points doit etre evaluee.</p>

<p><strong>Faut-il payer Shopify Email ou Klaviyo ?</strong></p>
<p>Klaviyo, sans hesitation, des que vous depassez 500 contacts. La segmentation avancee, l'attribution multi-touch et les flows automatises generent un ROI incomparable.</p>

<p>Besoin d'aide pour selectionner et configurer votre stack apps ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert Shopify</a>.</p>"""},
            {'title': "Premiere prise en main de l'admin WordPress",
             'duration': 18,
             'content_html': """<p>Cette lecon vous fait realiser un <strong>tour complet de l'admin Shopify</strong> (et non WordPress comme le titre l'indique par heritage). L'objectif : que vous puissiez naviguer sans hesiter, executer les operations quotidiennes les yeux fermes, et savoir ou trouver chaque parametre critique.</p>

<h2>Le menu principal de gauche : votre carte de bord</h2>
<p>Sept sections principales structurent toute votre activite :</p>

<h3>1. Accueil (Dashboard)</h3>
<p>Premier ecran apres connexion. Affiche :</p>
<ul>
<li><strong>Ventes totales</strong> sur la periode (modifiable : aujourd'hui, 7j, 30j, 90j, custom)</li>
<li><strong>Sessions du jour</strong> en temps reel</li>
<li><strong>Taux de conversion</strong> moyen</li>
<li><strong>Valeur moyenne de commande (AOV)</strong></li>
<li><strong>Top produits</strong></li>
<li><strong>Top sources de trafic</strong></li>
<li><strong>Taches recommandees</strong> Shopify (a ignorer apres avoir complete les essentielles)</li>
</ul>
<p>Verifiez l'accueil <strong>2 fois par jour minimum</strong> (matin + soir). C'est votre tableau de bord operationnel.</p>

<h3>2. Commandes</h3>
<p>Le coeur operationnel. Chaque commande passe par 4 statuts :</p>
<ol>
<li><strong>En attente de paiement</strong> : client n'a pas finalise (PayPal pending, virement, mobile money pending)</li>
<li><strong>Payee</strong> : paiement capture, pret a expedier</li>
<li><strong>Expediee</strong> (Fulfilled) : numero de tracking ajoute</li>
<li><strong>Terminee</strong> : livre, pas de retour ouvert</li>
</ol>
<p>Filtres essentiels a maitriser : <strong>Non expediees</strong> (priorite du jour), <strong>Annulees</strong> (a analyser hebdo), <strong>Retours</strong>, <strong>Risque eleve</strong> (commandes potentiellement frauduleuses).</p>

<h3>3. Produits</h3>
<p>Quatre onglets a connaitre :</p>
<ul>
<li><strong>Produits</strong> : catalogue complet</li>
<li><strong>Collections</strong> : groupes thematiques (Nouveautes, Solde, Best-sellers, par categorie)</li>
<li><strong>Cartes-cadeaux</strong> : creation et gestion de gift cards</li>
<li><strong>Stocks</strong> : vue d'ensemble inventaire multi-emplacements</li>
<li><strong>Transferts</strong> : si vous gerez plusieurs entrepots</li>
</ul>

<h3>4. Clients</h3>
<p>Mini-CRM integre. Pour chaque client :</p>
<ul>
<li>Historique de toutes les commandes</li>
<li>Total depense (LTV)</li>
<li>Adresse et contact</li>
<li>Notes (vos remarques personnelles)</li>
<li>Tags (segmentation : VIP, gros panier, retours frequents, etc.)</li>
</ul>
<p>Utilisez les <strong>tags</strong> pour segmenter votre base. Exemple : tag "VIP" pour les clients >500 EUR LTV. Vous pouvez ensuite creer des campagnes Klaviyo ciblees.</p>

<h3>5. Marketing</h3>
<ul>
<li><strong>Campagnes</strong> : creation et suivi des campagnes paid + email</li>
<li><strong>Automatisations</strong> : flows automatiques (welcome, cart abandon, win-back)</li>
<li><strong>Codes promo</strong> : creation, regles d'application, expiration</li>
</ul>

<h3>6. Analyses</h3>
<ul>
<li><strong>Tableaux de bord</strong> : vue resumee</li>
<li><strong>Rapports</strong> : 60+ rapports preconcus (ventes par produit, par canal, par localisation, par appareil...)</li>
<li><strong>Live view</strong> : visualisation temps reel des visiteurs (positions geographiques, comportement)</li>
</ul>
<p>Le Live View est <strong>magique pendant un Black Friday</strong> : voir des centaines de visiteurs en simultane sur la carte du monde donne une perspective unique.</p>

<h3>7. Boutique en ligne</h3>
<ul>
<li><strong>Themes</strong> : design de la boutique</li>
<li><strong>Pages</strong> : pages statiques (A propos, Contact, FAQ)</li>
<li><strong>Articles de blog</strong> : contenu SEO</li>
<li><strong>Navigation</strong> : menus header et footer</li>
<li><strong>Preferences</strong> : SEO de base, robots.txt, mot de passe</li>
</ul>

<h2>La zone des canaux de vente (en bas a gauche)</h2>
<p>Au-dela de votre boutique en ligne, vous pouvez ajouter en quelques clics :</p>
<ul>
<li><strong>Point de vente (POS)</strong> : boutique physique synchronisee</li>
<li><strong>Facebook & Instagram Shop</strong> : catalogue synchronise vers Meta</li>
<li><strong>TikTok Shop</strong> : pour la generation Z (disponible France depuis 2024)</li>
<li><strong>Google Shopping</strong> : annonces gratuites + payantes</li>
<li><strong>Amazon</strong> : multi-channel selling (en beta certains pays)</li>
</ul>

<h2>Les parametres (icone engrenage en bas a gauche)</h2>
<p>15 sections de parametres. Celles a maitriser en priorite :</p>
<ol>
<li><strong>General</strong> : infos boutique, devise, fuseau horaire</li>
<li><strong>Plan</strong> : changement de formule, facturation Shopify</li>
<li><strong>Paiements</strong> : Shopify Payments, PayPal, Klarna, FedaPay, etc.</li>
<li><strong>Checkout</strong> : champs obligatoires, abandons, options livraison</li>
<li><strong>Comptes clients</strong> : invite ou obligatoire</li>
<li><strong>Livraison et expedition</strong> : tarifs, zones, transporteurs</li>
<li><strong>Taxes et droits</strong> : TVA, douanes</li>
<li><strong>Emplacements</strong> : entrepots, boutiques physiques</li>
<li><strong>Notifications</strong> : emails automatiques (templates personnalisables)</li>
<li><strong>Domaines</strong> : connexion domaine personnalise</li>
<li><strong>Politiques</strong> : CGV, retour, confidentialite</li>
<li><strong>Marques</strong> : logo, couleurs primaires</li>
<li><strong>Utilisateurs et permissions</strong> : gestion equipe</li>
<li><strong>Apps et canaux</strong> : revue des autorisations</li>
<li><strong>Notifications client</strong> : personnalisation emails transactionnels</li>
</ol>

<blockquote>Apres cette lecon, fixez-vous l'objectif de pouvoir naviguer dans l'admin Shopify sans hesiter pendant 30 secondes maximum a trouver chaque parametre. C'est la base de votre productivite future.</blockquote>

<h2>FAQ</h2>
<p><strong>Comment installer l'app mobile Shopify ?</strong></p>
<p>Telechargez "Shopify" sur l'App Store ou Google Play. Connectez-vous avec les memes identifiants. Vous recevez des <strong>notifications push pour chaque commande</strong>. Indispensable pour repondre en moins de 5 minutes.</p>

<p><strong>Peut-on personnaliser l'admin ?</strong></p>
<p>Tres peu. Shopify privilegie la simplicite et la coherence. Vous pouvez personnaliser les <strong>colonnes affichees dans la liste des commandes/produits</strong> et reorganiser vos collections.</p>

<p>Vous voulez accelerer votre prise en main ? <a href="/contact">Reservez une session de coaching Shopify</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
        ],
    },
    {
        'title': 'Design et structure des pages',
        'objective': "Choisir un theme Shopify performant, le personnaliser aux couleurs de votre marque, construire une navigation claire et un design responsive qui convertit sur mobile comme sur desktop.",
        'duration': 90,
        'lessons': [
            {'title': "Choisir un theme : criteres et erreurs a eviter",
             'duration': 18,
             'content_html': """<p>Le theme est la couche visuelle de votre boutique Shopify. Mauvais choix, et vous payez 350 EUR pour un theme qui plombe votre conversion. Bon choix, et vous beneficiez d'une base solide pour les annees a venir. Cette lecon vous donne la methode complete pour choisir le bon theme en 2026.</p>

<h2>Themes gratuits vs themes payants : la realite</h2>
<p>Shopify propose <strong>13 themes gratuits</strong> dans sa bibliotheque officielle, dont Dawn (defaut), Refresh, Crave, Sense, Studio, Taste, Origin, Colorblock. Tous sont desormais bases sur <strong>Online Store 2.0</strong> avec sections personnalisables, Liquid moderne et performance optimisee.</p>

<p><strong>Notre verdict 2026</strong> : un theme gratuit suffit pour 80 % des marchands debutants. Dawn est excellent pour les marques minimalistes (mode, deco). Crave conviendra aux marques food et lifestyle. Sense est parfait pour beaute et bien-etre.</p>

<h3>Quand investir dans un theme premium (150-350 EUR one-shot) ?</h3>
<ul>
<li>Vous vendez plus de 100 produits et avez besoin de filtres avances</li>
<li>Vous voulez des fonctions natives (mega-menu, quick view, sticky cart, product bundles)</li>
<li>Vous avez une identite visuelle tres marquee impossible a obtenir avec Dawn</li>
<li>Vous etes pret a investir dans un design qui differencie</li>
</ul>

<h3>Themes payants les plus rentables en 2026</h3>
<ul>
<li><strong>Impulse (320 EUR)</strong> : flexible, excellent pour la mode et la beaute, 5+ ans d'updates</li>
<li><strong>Prestige (380 EUR)</strong> : ultra-premium, mode haut de gamme</li>
<li><strong>Warehouse (320 EUR)</strong> : ideal pour gros catalogues (industriels, B2B, multi-categories)</li>
<li><strong>Empire (320 EUR)</strong> : robuste, large diffusion, beaucoup de modules</li>
<li><strong>Motion (350 EUR)</strong> : animations subtiles, parfait pour marques premium ou tech</li>
</ul>

<h2>5 criteres absolus de selection</h2>

<h3>1. Performance (Lighthouse Mobile score)</h3>
<p>Verifiez le <strong>score Lighthouse Mobile</strong> sur la demo officielle avec PageSpeed Insights. <strong>Refuser tout theme &lt; 70</strong>. Les themes Shopify officiels affichent en general 85-92, certains themes ThemeForest tombent a 35-50.</p>

<h3>2. Compatibilite Online Store 2.0</h3>
<p>Verifiez explicitement la mention "Online Store 2.0". Les anciens themes (Vintage) sont en fin de vie et incompatibles avec les sections dynamiques modernes.</p>

<h3>3. Sections de pages flexibles</h3>
<p>Le theme doit permettre de creer des landing pages sans coder via le theme editor : Hero, Featured collection, Image with text, Testimonials, FAQ, Newsletter, etc. Minimum <strong>15 sections natives</strong>.</p>

<h3>4. Responsive mobile-first</h3>
<p>Plus de 75 % du trafic e-commerce vient du mobile en 2026. Testez la demo sur votre smartphone. Hesitez si : texte illisible, CTA hors ecran, menu confus.</p>

<h3>5. Support et mises a jour</h3>
<p>Themes Shopify officiels : <strong>12 mois de support gratuit</strong>, mises a jour a vie. ThemeForest : depend de l'auteur (verifier date derniere update : >6 mois sans MAJ = a fuir).</p>

<h2>Les 4 erreurs qui couteront cher</h2>
<ol>
<li><strong>Acheter sur ThemeForest hors marketplace officielle Shopify</strong> : 50 % des themes ThemeForest contiennent du code obsolete qui casse au prochain update Shopify.</li>
<li><strong>Choisir un theme trop "design-driven"</strong> sans fonctionnalites e-commerce : tres beau mais 0 conversion.</li>
<li><strong>Modifier le code Liquid en direct</strong> sans duplication : impossible de revenir en arriere.</li>
<li><strong>Negliger les versions traduites</strong> : si votre theme n'a pas la traduction FR native, comptez 15 a 30 EUR pour faire traduire les fichiers locale.</li>
</ol>

<h2>Methodologie pour tester un theme avant achat</h2>
<ol>
<li>Visitez la demo officielle</li>
<li>Lancez Lighthouse Mobile (Chrome DevTools)</li>
<li>Testez sur 3 smartphones differents (iPhone, Android entree de gamme, Android haut de gamme)</li>
<li>Verifiez la presence d'une vraie boutique demo (pas juste page accueil)</li>
<li>Lisez 10 avis sur Shopify Theme Store - cherchez les recurrents</li>
<li>Verifiez la date du dernier update theme</li>
</ol>

<blockquote>Un theme bien choisi vous fait gagner 5 a 12 % de conversion immediate. Sur 100 000 EUR de CA annuel, cela represente 5 000 a 12 000 EUR. Investir 380 EUR dans un bon theme est l'un des ROI les plus eleves possibles.</blockquote>

<h2>FAQ</h2>
<p><strong>Peut-on changer de theme apres avoir lance ?</strong></p>
<p>Oui, sans perdre vos produits, commandes ou clients. Vous perdrez en revanche toutes les personnalisations du theme actuel (textes, blocs, images dans le theme editor). Sauvegardez d'abord en exportant le theme en .zip.</p>

<p><strong>Combien de temps faut-il pour personnaliser un theme ?</strong></p>
<p>Avec un theme bien choisi : <strong>8 a 20 heures</strong> pour atteindre une apparence production. Avec un theme inadapte : 80 a 150 heures... et un resultat souvent decevant.</p>

<p>Besoin d'aide pour choisir le bon theme ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert Shopify</a> qui validera votre choix en 30 minutes.</p>"""},
            {'title': "Personnaliser l'identite visuelle (logo, couleurs, polices)",
             'duration': 18,
             'content_html': """<p>L'identite visuelle de votre boutique est l'enrobage qui fait la difference entre "encore un site Shopify generique" et "marque memorable que je veux suivre". Cette lecon vous donne la methode complete pour personnaliser logo, couleurs, polices et tone visuel en moins de 4 heures, sans designer.</p>

<h2>Le logo : la pierre angulaire</h2>
<p>Votre logo apparaitra dans le header, le footer, les emails transactionnels, le favicon, les emballages, les reseaux sociaux. <strong>Investissez ici en priorite.</strong></p>

<h3>3 options par budget</h3>
<ol>
<li><strong>Budget 0-50 EUR</strong> : Looka, BrandCrowd, Hatchful (gratuit Shopify). IA-based, suffisant pour MVP.</li>
<li><strong>Budget 100-400 EUR</strong> : freelance sur Malt, Upwork, ou agence locale (Cotonou, Abomey-Calavi, Dakar, Casablanca offrent des tarifs excellents).</li>
<li><strong>Budget 1 500-5 000 EUR</strong> : studio de design specialise (LogoLab, Brandmark Studio). Reserve aux marques avec ambition long terme.</li>
</ol>

<h3>Formats a fournir au designer</h3>
<ul>
<li><strong>SVG</strong> (vectoriel, indispensable pour la qualite responsive)</li>
<li><strong>PNG transparent</strong> en 512x512, 1024x1024, 2048x2048</li>
<li><strong>Version monochrome</strong> (noir + blanc)</li>
<li><strong>Favicon</strong> 32x32 et 192x192</li>
<li><strong>Logo horizontal</strong> + <strong>logo carre</strong> + <strong>icone seule</strong></li>
</ul>

<h2>Palette de couleurs : la signature emotionnelle</h2>
<p>Une bonne palette e-commerce 2026 contient :</p>
<ul>
<li><strong>1 couleur primaire</strong> : utilisee pour CTAs, liens actifs (max 60 % de l'usage couleur)</li>
<li><strong>1 couleur secondaire</strong> : accent, surlignage (20 %)</li>
<li><strong>2-3 neutres</strong> : noir/gris fonce (texte), blanc casse (fond), gris clair (separateurs)</li>
<li><strong>1 couleur d'erreur</strong> (rouge) + 1 couleur de succes (vert)</li>
</ul>

<h3>Outils pour creer la palette</h3>
<ul>
<li><strong>Coolors.co</strong> : generation aleatoire + verrouillage</li>
<li><strong>Adobe Color</strong> : extraction depuis une image inspiration</li>
<li><strong>Khroma.co</strong> : IA qui apprend vos preferences</li>
<li><strong>Realtime Colors</strong> : test direct sur un mockup site</li>
</ul>

<h3>Tester la lisibilite</h3>
<p>Verifiez le <strong>contraste WCAG AA</strong> (ratio 4,5:1 minimum pour texte normal, 3:1 pour texte large) avec WebAIM Contrast Checker. Une couleur non accessible exclut 5-15 % de votre audience.</p>

<h2>Typographie : 1 a 2 polices maximum</h2>
<p>Regle d'or : <strong>1 police pour les titres, 1 police pour le corps de texte</strong>, jamais plus.</p>

<h3>Combinaisons gagnantes 2026</h3>
<ul>
<li><strong>Inter (corps) + Playfair Display (titres)</strong> : moderne et premium</li>
<li><strong>DM Sans (corps) + Fraunces (titres)</strong> : tendance, parfait pour mode/beaute</li>
<li><strong>Manrope (corps) + Cabinet Grotesk (titres)</strong> : tech, design-driven</li>
<li><strong>Lora (corps) + Montserrat (titres)</strong> : food, lifestyle</li>
<li><strong>System Sans (corps) + Bricolage Grotesque (titres)</strong> : performance maximum + design</li>
</ul>

<p>Toutes ces polices sont gratuites sur <strong>Google Fonts</strong> ou <strong>Fontshare</strong>. Les themes Shopify modernes les preloadent automatiquement pour eviter le FOUT (Flash Of Unstyled Text).</p>

<h2>Configuration dans le theme editor Shopify</h2>
<p>Allez dans <strong>Boutique en ligne > Themes > Personnaliser > Parametres du theme</strong> (en bas) :</p>

<h3>Section "Typographie"</h3>
<ul>
<li>Police d'en-tete : choisir parmi catalogue ou uploader</li>
<li>Police de corps : meme processus</li>
<li>Taille de base : 16px standard, 18px pour lisibilite renforcee</li>
<li>Hauteur de ligne : 1.5 a 1.7 pour le corps</li>
</ul>

<h3>Section "Couleurs"</h3>
<ul>
<li>Texte : noir profond (#1A1A1A plutot que pur noir #000)</li>
<li>Arriere-plan : blanc casse (#FAFAFA) plus doux que blanc pur</li>
<li>Boutons primaires : votre couleur primaire</li>
<li>Bordures : gris clair (#E5E5E5)</li>
</ul>

<h3>Section "Marque"</h3>
<ul>
<li>Upload du logo (largeur recommandee : 200px desktop, 160px mobile)</li>
<li>Favicon (32x32 minimum)</li>
<li>Couleurs de marque (utilisees dans les emails transactionnels Shopify)</li>
</ul>

<h2>Tone visuel : photographie produit</h2>
<p>Au-dela du logo et de la palette, votre style photo definit votre tone. Trois ecoles :</p>
<ol>
<li><strong>Studio blanc minimaliste</strong> : produits seuls sur fond blanc. Bon pour mode, beaute, tech.</li>
<li><strong>Lifestyle naturel</strong> : produits en contexte. Excellent pour deco, food, outdoor.</li>
<li><strong>Editorial artistique</strong> : mise en scene creative. Reserve aux marques premium.</li>
</ol>

<p>Si vous n'avez pas de budget photographe, utilisez votre smartphone (iPhone 13+ ou Pixel 8+ ont des appareils suffisants), un fond blanc carton (15 EUR), et la lumiere naturelle d'une fenetre orientee nord. Retouchez avec <strong>Lightroom Mobile</strong> ou <strong>Snapseed</strong> (gratuits).</p>

<blockquote>Votre identite visuelle doit transparaitre dans les 3 premieres secondes de visite. Sinon, vous etes une boutique parmi 10 000 autres. Investissez le temps necessaire ici.</blockquote>

<h2>FAQ</h2>
<p><strong>Quels formats d'image utiliser pour le logo dans Shopify ?</strong></p>
<p>SVG en priorite (qualite parfaite a toute taille, leger). PNG transparent en fallback. Jamais JPG (pas de transparence).</p>

<p><strong>Faut-il personnaliser les emails transactionnels Shopify ?</strong></p>
<p>Oui, indispensable. Allez dans <strong>Parametres > Notifications</strong>. Personnalisez les 12 emails principaux : confirmation commande, expedition, livraison, etc. Ajoutez logo, couleurs marque, signature. Impact direct sur la perception de professionnalisme.</p>

<p>Vous voulez une charte graphique professionnelle livree en 5 jours ? <a href="/contact">Demandez un devis branding</a> ou <a href="/rendez-vous">prenez RDV avec notre studio</a>.</p>"""},
            {'title': "Construire le menu et la navigation",
             'duration': 18,
             'content_html': """<p>La navigation est l'<strong>infrastructure invisible</strong> de votre boutique. Bien pensee, elle reduit le bounce rate de 25-40 % et augmente le AOV. Mal pensee, elle perd vos visiteurs en 3 clics. Cette lecon vous donne la methode pour structurer votre menu en respectant les codes 2026 du e-commerce.</p>

<h2>Les 3 menus essentiels dans Shopify</h2>
<ul>
<li><strong>Menu principal</strong> : header en haut du site, 4-7 elements maximum</li>
<li><strong>Menu footer</strong> : pied de page, regroupant les pages utilitaires</li>
<li><strong>Menu mobile</strong> : version drawer pour smartphone (souvent dupliquant le principal)</li>
</ul>

<h2>Structurer le menu principal</h2>

<h3>Principe cardinal : maximum 7 elements</h3>
<p>Au-dela de 7, l'oeil ne peut plus scanner rapidement. Si vous avez 12 categories, regroupez-les via un <strong>mega-menu</strong> sous "Shop" ou "Collections".</p>

<h3>Structure recommandee selon votre catalogue</h3>

<p><strong>Boutique mono-produit (Allbirds, Bombas)</strong> :</p>
<ul>
<li>Hommes</li>
<li>Femmes</li>
<li>Accessoires</li>
<li>Notre histoire</li>
<li>Avis</li>
<li>Connexion / Panier</li>
</ul>

<p><strong>Boutique multi-categories (mode generale)</strong> :</p>
<ul>
<li>Nouveautes</li>
<li>Hommes (mega-menu : T-shirts, Jeans, Vestes, Chaussures, Accessoires)</li>
<li>Femmes (mega-menu : Robes, Tops, Pantalons, Chaussures, Accessoires)</li>
<li>Soldes</li>
<li>Magazine (blog)</li>
<li>Connexion / Recherche / Panier</li>
</ul>

<p><strong>Boutique mono-vertical (cosmetique, food)</strong> :</p>
<ul>
<li>Boutique (mega-menu par categorie)</li>
<li>Best-sellers</li>
<li>Nouveautes</li>
<li>Conseils (blog)</li>
<li>A propos</li>
<li>Connexion / Recherche / Panier</li>
</ul>

<h2>Construction technique dans Shopify</h2>
<p>Allez dans <strong>Boutique en ligne > Navigation</strong> :</p>

<h3>Etape 1 : Creer les collections necessaires</h3>
<p>Une <strong>collection</strong> est un groupe de produits. Creez vos collections en parallele de votre menu :</p>
<ul>
<li>Collection automatique : conditions (tag = "homme", prix &lt;= 50, etc.)</li>
<li>Collection manuelle : selection produit par produit</li>
</ul>

<h3>Etape 2 : Creer les pages necessaires</h3>
<p>Dans <strong>Boutique en ligne > Pages</strong>, creez au minimum :</p>
<ul>
<li>A propos / Notre histoire</li>
<li>Contact</li>
<li>FAQ</li>
<li>Suivi de commande</li>
<li>Programme de fidelite (si applicable)</li>
</ul>

<h3>Etape 3 : Construire le menu</h3>
<p>Glissez-deposez vos elements dans la hierarchie souhaitee. Indentation = sous-element du mega-menu.</p>

<h2>Le mega-menu : quand et comment</h2>
<p>Activez un mega-menu quand vous avez <strong>plus de 4 sous-categories par categorie principale</strong>. Il transforme un menu deroulant basique en panneau visuel avec colonnes, images, CTAs.</p>

<h3>Themes natifs avec mega-menu</h3>
<ul>
<li>Impulse, Warehouse, Empire (premium)</li>
<li>Dawn avec section custom (gratuit + 1h de dev)</li>
</ul>

<h3>Apps de mega-menu si theme ne le supporte pas</h3>
<ul>
<li><strong>qikify Smart Menu</strong> (gratuit + premium 12 USD/mois)</li>
<li><strong>Buddha Mega Menu</strong> (gratuit + premium 19 USD/mois)</li>
</ul>

<h2>Footer : la zone des pages utilitaires</h2>
<p>Structurez en 4 colonnes :</p>

<h3>Colonne 1 : A propos</h3>
<ul>
<li>Logo</li>
<li>Tagline (1 phrase)</li>
<li>Reseaux sociaux (icones)</li>
</ul>

<h3>Colonne 2 : Boutique</h3>
<ul>
<li>Nouveautes</li>
<li>Best-sellers</li>
<li>Soldes</li>
<li>Cartes-cadeaux</li>
</ul>

<h3>Colonne 3 : Aide</h3>
<ul>
<li>Contact</li>
<li>FAQ</li>
<li>Livraison</li>
<li>Retours</li>
<li>Suivi de commande</li>
</ul>

<h3>Colonne 4 : Newsletter + Legal</h3>
<ul>
<li>Inscription newsletter avec champ email</li>
<li>CGV</li>
<li>Politique de confidentialite</li>
<li>Mentions legales</li>
<li>Politique de cookies</li>
</ul>

<h2>Search bar : indispensable au-dela de 50 produits</h2>
<p>Activez la barre de recherche dans le header. Shopify integre nativement une recherche, mais elle est limitee. Pour des resultats premium, installez <strong>Searchanise</strong> ou <strong>Klevu</strong> (filtres a facettes, suggestions, autocompletion intelligente).</p>

<h2>Breadcrumbs : pour les gros catalogues</h2>
<p>Les fils d'Ariane (<code>Accueil > Femme > Robes > Robe noire</code>) ameliorent UX et SEO. Activez via theme ou app Buddha Crumbs.</p>

<blockquote>Une navigation pensee pour le mobile augmente votre conversion mobile de 18 % en moyenne. Testez systematiquement sur smartphone reel, jamais uniquement en simulation desktop.</blockquote>

<h2>FAQ</h2>
<p><strong>Combien de niveaux de profondeur dans un menu ?</strong></p>
<p>Maximum <strong>3 niveaux</strong>. Au-dela, vos visiteurs se perdent. Si vous avez 5 niveaux logiques, repensez votre architecture : c'est qu'il y a trop de catalogue ou pas assez de filtres.</p>

<p><strong>Faut-il une icone panier sticky en mobile ?</strong></p>
<p>Oui, indispensable en 2026. Le panier doit etre accessible depuis n'importe quelle page sans scroll. Augmentation de conversion documentee : 4-9 %.</p>

<p>Vous voulez un audit UX de votre navigation actuelle ? <a href="/contact">Demandez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
            {'title': "Creer le footer et les widgets",
             'duration': 18,
             'content_html': """<p>Le footer est la zone la plus sous-estimee d'une boutique e-commerce. Pourtant, 28 a 42 % des visiteurs y scrollent activement, particulierement sur mobile. Bien construit, c'est votre derniere chance de capturer un email, rassurer sur les livraisons, ou pousser un best-seller. Cette lecon vous donne la structure de footer la plus efficace en 2026.</p>

<h2>L'anatomie d'un footer e-commerce qui convertit</h2>
<p>Un footer optimise contient 5 zones distinctes, de haut en bas :</p>

<h3>Zone 1 : Trust bar (au-dessus du footer principal)</h3>
<p>Bande horizontale rassurante avec 3 a 4 elements :</p>
<ul>
<li><strong>Livraison offerte des X EUR</strong></li>
<li><strong>Retours gratuits 30 jours</strong></li>
<li><strong>Paiement securise</strong></li>
<li><strong>Service client 7/7</strong> ou similaire</li>
</ul>
<p>Visuellement : icones + 2-3 mots maximum par bloc. Augmente la conversion de 6 a 12 % selon Baymard 2025.</p>

<h3>Zone 2 : Newsletter signup</h3>
<p>Section claire avec :</p>
<ul>
<li>Titre engageant : "Soyez la premiere a savoir" / "Inscrivez-vous et obtenez -15 %"</li>
<li>Champ email + bouton</li>
<li>Mention RGPD ("En vous inscrivant, vous acceptez...")</li>
<li>Connexion directe a Klaviyo ou Shopify Email</li>
</ul>

<p>Astuce : offrir <strong>-10 a -15 % sur le premier achat</strong> en echange de l'email double le taux d'opt-in. Configuration : creez un code promo "WELCOME10" envoye automatiquement via flow Klaviyo "Welcome".</p>

<h3>Zone 3 : Liens organises en 3-4 colonnes</h3>
<p>Structure recommandee :</p>

<p><strong>Colonne 1 - Boutique</strong></p>
<ul>
<li>Tous les produits</li>
<li>Nouveautes</li>
<li>Best-sellers</li>
<li>Cartes cadeaux</li>
<li>Collections principales (2-3 max)</li>
</ul>

<p><strong>Colonne 2 - Aide & FAQ</strong></p>
<ul>
<li>Contactez-nous</li>
<li>FAQ</li>
<li>Suivi de commande</li>
<li>Politique de livraison</li>
<li>Politique de retour</li>
</ul>

<p><strong>Colonne 3 - A propos</strong></p>
<ul>
<li>Notre histoire</li>
<li>Notre engagement (RSE)</li>
<li>Blog / Magazine</li>
<li>Presse</li>
<li>Carrieres (si applicable)</li>
</ul>

<p><strong>Colonne 4 - Coordonnees</strong></p>
<ul>
<li>Adresse physique (siege ou boutique)</li>
<li>Email contact</li>
<li>Telephone (si vous offrez du support telephonique)</li>
<li>Horaires service client</li>
</ul>

<h3>Zone 4 : Reseaux sociaux + paiements + langues</h3>
<ul>
<li><strong>Icones reseaux sociaux</strong> : Instagram, TikTok, Facebook, X, YouTube (selon presence reelle uniquement)</li>
<li><strong>Logos moyens de paiement</strong> : Visa, Mastercard, American Express, PayPal, Apple Pay, Klarna, et pour l'Afrique : Mobile Money, Orange Money, MTN Mobile Money, FedaPay</li>
<li><strong>Selecteur de langue</strong> et <strong>devise</strong> si multi-pays (FR/EN, EUR/XOF/USD)</li>
</ul>

<h3>Zone 5 : Mentions legales + copyright</h3>
<ul>
<li>Liens : CGV / Confidentialite / Mentions legales / Cookies / Conditions retour</li>
<li>Copyright : (c) 2026 Votre Marque. Tous droits reserves.</li>
<li>SIREN / RCS pour la France ou equivalent local</li>
<li>Mention TVA si applicable</li>
</ul>

<h2>Configuration technique dans Shopify</h2>

<h3>Etape 1 : Creer les pages</h3>
<p>Dans <strong>Boutique en ligne > Pages</strong>, creez chaque page mentionnee : Contact, FAQ, A propos, etc. Utilisez le builder de pages ou un theme avec sections.</p>

<h3>Etape 2 : Creer le menu footer</h3>
<p>Dans <strong>Boutique en ligne > Navigation</strong>, creez un nouveau menu "Menu footer" avec une structure hierarchique :</p>
<ul>
<li>Boutique
  <ul><li>Tous les produits</li><li>Nouveautes</li>...</ul>
</li>
<li>Aide
  <ul><li>Contact</li><li>FAQ</li>...</ul>
</li>
</ul>

<h3>Etape 3 : Configurer le theme</h3>
<p>Dans le <strong>theme editor</strong>, cliquez sur la section footer. Vous pouvez ajouter :</p>
<ul>
<li>Blocs "Liens" en pointant vers vos menus</li>
<li>Bloc "Newsletter"</li>
<li>Bloc "Texte" pour adresse</li>
<li>Bloc "Reseaux sociaux"</li>
<li>Bloc "Image" pour logo</li>
</ul>

<h2>Widgets et fonctionnalites bonus</h2>

<h3>Live chat sticky</h3>
<p>Installez <strong>Tidio</strong>, <strong>Gorgias</strong>, ou un widget WhatsApp Business (essential en Afrique francophone). Le bouton flottant en bas a droite augmente le taux de contact de 2 a 4 fois.</p>

<h3>Sticky add-to-cart</h3>
<p>Sur les pages produits, un bouton "Ajouter au panier" qui suit le scroll en mobile augmente la conversion mobile de 8-15 %. Apps : Quick Add to Cart, SmartCart.</p>

<h3>Recently viewed products</h3>
<p>Section "Recemment consultes" en bas de page produit. Augmente le AOV de 4-7 %. Native sur la plupart des themes premium.</p>

<h3>Bandeau cookies RGPD</h3>
<p>Obligatoire en UE depuis 2018, renforce en 2024 par la nouvelle directive ePrivacy. Apps recommandees : <strong>Cookies & Consent Bar</strong> de Pandectes (gratuit + 9 USD/mois), <strong>iubenda</strong> pour conformite multi-pays.</p>

<h2>Optimisation mobile du footer</h2>
<p>Sur mobile, le footer doit se replier en <strong>accordeons</strong> par section. Chaque colonne devient un titre cliquable qui deplie ses liens. Sans cela, le footer occupe 3-5 ecrans entiers sur smartphone et provoque un sentiment d'abandon.</p>

<blockquote>Un footer bien construit capture 2-5 % d'emails supplementaires par mois et reduit le taux de tickets support de 15-25 %. C'est l'un des chantiers a haut ROI les plus oublies.</blockquote>

<h2>FAQ</h2>
<p><strong>Faut-il afficher l'adresse physique meme pour une boutique 100 % en ligne ?</strong></p>
<p>Oui, c'est <strong>obligatoire legalement</strong> en UE (mentions legales) et fortement recommande ailleurs pour la confiance. Si vous travaillez de chez vous, une adresse de domiciliation commerciale (40-80 EUR/mois en France) suffit.</p>

<p><strong>Combien d'icones reseaux sociaux dans le footer ?</strong></p>
<p>Uniquement celles ou vous postez vraiment (au moins 1 publication/semaine). Une icone Twitter sans activite depuis 6 mois renvoie un signal negatif. Mieux vaut 2 reseaux actifs que 6 abandonnes.</p>

<p>Besoin d'aide pour structurer un footer efficace ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
            {'title': "Design responsive : tester sur mobile et tablette",
             'duration': 18,
             'content_html': """<p>Plus de 78 % du trafic e-commerce mondial vient du mobile en 2026 (donnees Statista). En Afrique francophone, ce taux monte a 92 % (Cotonou, Dakar, Abidjan). Une boutique non optimisee mobile perd litteralement les 3/4 de ses ventes potentielles. Cette lecon vous donne la methodologie complete pour tester et perfectionner votre experience mobile.</p>

<h2>Comprendre le mobile-first en 2026</h2>
<p><strong>Mobile-first</strong> signifie concevoir d'abord pour smartphone, puis adapter au desktop. Google indexe votre site en utilisant la version mobile (Mobile-First Indexing depuis 2019). Si votre mobile est pauvre, votre SEO desktop souffre aussi.</p>

<h3>Les 3 ecrans a couvrir</h3>
<ul>
<li><strong>Smartphone</strong> : 320-428px de largeur (iPhone SE a iPhone 15 Pro Max)</li>
<li><strong>Tablette</strong> : 768-1024px (iPad classique a iPad Pro 12.9")</li>
<li><strong>Desktop</strong> : 1280-1920px (laptop a 4K)</li>
</ul>

<h2>Methode de test en 4 etapes</h2>

<h3>Etape 1 : Test sur appareils reels</h3>
<p>L'emulateur Chrome DevTools ment. Testez sur :</p>
<ul>
<li><strong>iPhone</strong> (votre modele ou celui d'un proche)</li>
<li><strong>Android entree de gamme</strong> (Samsung A14, Xiaomi Redmi) - 60 % du marche francophone</li>
<li><strong>Tablette</strong> (iPad ou Galaxy Tab)</li>
</ul>

<p>Verifiez sur chaque appareil :</p>
<ol>
<li>Temps de chargement de l'accueil (objectif &lt;3 secondes en 4G)</li>
<li>Lisibilite des titres et textes (taille minimum 16px corps)</li>
<li>Taille des CTAs (minimum 44x44px pour le tap)</li>
<li>Navigation menu burger</li>
<li>Fluidite du scroll</li>
<li>Affichage des images (pas de pixelisation)</li>
<li>Validation du checkout (pas de bug clavier)</li>
</ol>

<h3>Etape 2 : Test cross-browser</h3>
<p>Verifiez sur 3 navigateurs minimum :</p>
<ul>
<li><strong>Safari iOS</strong> : 45 % du mobile en France</li>
<li><strong>Chrome Android</strong> : 70 % du mobile en Afrique</li>
<li><strong>Samsung Internet</strong> : 15 % du mobile (Galaxy par defaut)</li>
</ul>

<p>Outils : <strong>BrowserStack</strong> (free trial 14 jours, payant ensuite) ou <strong>LambdaTest</strong> (free 60 min/mois).</p>

<h3>Etape 3 : Test de performance</h3>
<p>Utilisez <strong>PageSpeed Insights</strong> (gratuit, Google). Objectifs mobile en 2026 :</p>
<ul>
<li><strong>Performance Score : 75+</strong> (idealement 85+)</li>
<li><strong>LCP &lt; 2,5s</strong> (Largest Contentful Paint)</li>
<li><strong>FID &lt; 100ms</strong> (First Input Delay)</li>
<li><strong>CLS &lt; 0,1</strong> (Cumulative Layout Shift)</li>
<li><strong>INP &lt; 200ms</strong> (Interaction to Next Paint - nouvelle metrique 2024)</li>
</ul>

<h3>Etape 4 : Test du parcours complet</h3>
<p>Realisez un achat complet sur mobile :</p>
<ol>
<li>Arrivee sur accueil</li>
<li>Recherche / navigation vers une categorie</li>
<li>Selection d'un produit</li>
<li>Lecture description + avis</li>
<li>Ajout au panier (verifier popup confirmation)</li>
<li>Voir le panier</li>
<li>Checkout : email, adresse, paiement</li>
<li>Confirmation</li>
</ol>

<p>Chrono : ce parcours doit prendre <strong>moins de 90 secondes</strong> pour un client habitue. Si vous mettez 3 minutes, optimisez.</p>

<h2>Erreurs mobile les plus courantes</h2>

<h3>1. Textes trop petits</h3>
<p>Minimum <strong>16px</strong> pour le corps, <strong>14px</strong> pour les meta-infos. En-dessous : zoom involontaire et frustration.</p>

<h3>2. CTAs trop petits ou trop proches</h3>
<p>Bouton minimum 44x44px (recommandation Apple) ou 48x48px (Google Material). Espacement minimum 8px entre 2 CTAs.</p>

<h3>3. Popups intrusives</h3>
<p>Google penalise les popups qui couvrent >30 % de l'ecran mobile. Si vous voulez une popup, elle doit etre <strong>petite</strong> et <strong>fermable d'un tap clair</strong>.</p>

<h3>4. Formulaires avec mauvais clavier</h3>
<p>Pour un champ email, utilisez <code>type="email"</code> (clavier avec @). Pour un numero, <code>type="tel"</code> (pave numerique). Sinon, le client tape "123" avec le clavier QWERTY, mort lente.</p>

<h3>5. Images non optimisees</h3>
<p>Une image 4000x3000 chargee sur un smartphone qui affichera 400x300 = 90 % de bande passante gaspillee. Utilisez WebP, lazy loading, et le srcset pour servir la bonne resolution.</p>

<h3>6. Carrousels lourds</h3>
<p>Un carousel hero avec 5 images de 2 MB chacune = 10 MB a charger avant tout. Reduisez a 1-3 images max et compressez agressivement.</p>

<h2>Outils incontournables</h2>
<ul>
<li><strong>Chrome DevTools</strong> : Toggle device toolbar (Ctrl+Shift+M)</li>
<li><strong>PageSpeed Insights</strong> : audit complet</li>
<li><strong>WebPageTest</strong> : test depuis un device reel a distance</li>
<li><strong>GTmetrix</strong> : analyse de performance approfondie</li>
<li><strong>Google Mobile-Friendly Test</strong> : verification rapide</li>
<li><strong>Hotjar</strong> : enregistrements de sessions mobile</li>
</ul>

<h2>Le test ultime : 5 personnes reelles</h2>
<p>Demandez a <strong>5 personnes non techniques</strong> (membre famille, ami non e-commerce) de realiser un achat sur leur propre smartphone, devant vous, sans aide. Filmez l'ecran. Vous decouvrirez 80 % des problemes en 1 heure.</p>

<blockquote>Une boutique vraiment mobile-first convertit 25 a 60 % mieux qu'une boutique adaptee a posteriori. C'est LE chantier prioritaire de tout marchand serieux en 2026.</blockquote>

<h2>FAQ</h2>
<p><strong>Faut-il une app mobile native plutot qu'un site responsive ?</strong></p>
<p>Non, pas en 2026. Un site responsive bien fait (PWA si possible) couvre 95 % des besoins. Une app native coute 25 000-150 000 EUR de developpement et 30-40 % d'abandon a l'installation. Reservez ce chantier au-dela de 500 K EUR de CA.</p>

<p><strong>Comment savoir si mes clients sont majoritairement sur iOS ou Android ?</strong></p>
<p>Allez dans <strong>Google Analytics 4 > Acquisition > Vue d'ensemble > Appareil > OS</strong>. Vous verrez la repartition exacte. En France, 50/50 en general. En Afrique francophone, 80 % Android.</p>

<p>Vous voulez un audit mobile-first complet de votre boutique ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
        ],
    },
    {
        'title': 'Plugins themes et extensions',
        'objective': "Maitriser le Shopify App Store, installer les applications strategiques (Elementor n'existant pas sur Shopify, l'equivalent etant les page builders), optimiser images et performance, securiser la boutique et automatiser les sauvegardes.",
        'duration': 90,
        'lessons': [
            {'title': "Top 10 des plugins WordPress incontournables",
             'duration': 18,
             'content_html': """<p>Le titre evoque WordPress par heritage, mais ici nous parlons des <strong>10 applications Shopify incontournables</strong> pour 2026 - celles qui font reellement la difference entre une boutique stagnante et une boutique qui croit a 30 % par an. Selection basee sur l'analyse de 200+ boutiques Shopify rentables au Benin, en France et au Canada.</p>

<h2>1. Klaviyo - Email & SMS marketing (incontournable n.1)</h2>
<p><strong>Cout</strong> : gratuit jusqu'a 250 contacts, puis 20-150 USD/mois selon volume.</p>
<p><strong>Pourquoi</strong> : <strong>l'email genere 30 a 40 % du CA des boutiques Shopify matures</strong>. Klaviyo offre des flows ultra-puissants : welcome series, abandoned cart, post-purchase, win-back, browse abandonment. ROI moyen documente : 40 EUR pour 1 EUR depense.</p>
<p><strong>Configuration prioritaire</strong> : activer 4 flows critiques (Welcome, Cart Abandonment, Browse Abandonment, Post-purchase). Capturer 100 % des emails au checkout. Segmenter en 5 groupes (VIP, actifs, dormants, lapsed, never bought).</p>

<h2>2. Judge.me ou Loox - Avis clients</h2>
<p><strong>Cout</strong> : Judge.me 15 USD/mois, Loox 9-99 USD/mois.</p>
<p><strong>Pourquoi</strong> : les avis augmentent la conversion de 18 % en moyenne (etude Spiegel Research Center). Photos clients = 2,5x plus de conversion qu'un avis texte.</p>
<p><strong>Configuration</strong> : automatiser les demandes d'avis 14 jours apres livraison, offrir 5-10 % de reduction pour avis avec photo, afficher les etoiles partout (categorie, liste, fiche).</p>

<h2>3. PageFly ou Shogun - Page builder</h2>
<p><strong>Cout</strong> : PageFly 19-99 USD/mois, Shogun 39-249 USD/mois.</p>
<p><strong>Pourquoi</strong> : permet de creer des landing pages campagne complexes sans coder. Indispensable pour Black Friday, lancements produit, pages de vente longue. Equivalent Shopify d'Elementor sur WordPress.</p>
<p><strong>Configuration</strong> : commencer par PageFly Pay-as-you-go pour tester. Construire 3 templates reutilisables (landing PPC, landing lancement, page seasonal).</p>

<h2>4. Recharge - Subscriptions</h2>
<p><strong>Cout</strong> : 99 USD/mois + 1 % des ventes subscriptions.</p>
<p><strong>Pourquoi</strong> : si vous vendez des consommables (cosmetique, food, complements, cafe, the), les abonnements multiplient la LTV par 3-5x. Recharge est le standard absolu.</p>
<p><strong>Configuration</strong> : commencer avec un seul produit phare, periodicite mensuelle, reduction 10-15 % vs achat ponctuel, gestion des reports/pauses ultra-simple pour le client.</p>

<h2>5. Privy ou OptinMonster - Popups & opt-ins</h2>
<p><strong>Cout</strong> : Privy gratuit jusqu'a 1 500 emails/mois, puis 24-99 USD/mois.</p>
<p><strong>Pourquoi</strong> : capture 2-5 % des visiteurs en email. Sans popup d'opt-in, vous perdez 95 % de votre trafic.</p>
<p><strong>Configuration</strong> : popup exit-intent avec offre claire (-10 % code WELCOME10), popup spin-the-wheel pour engager les jeunes audiences, popup mobile light qui ne couvre que 30 % de l'ecran.</p>

<h2>6. Tidio ou Gorgias - Helpdesk + chat</h2>
<p><strong>Cout</strong> : Tidio 29-410 USD/mois, Gorgias 60-900 USD/mois.</p>
<p><strong>Pourquoi</strong> : repondre en moins de 5 minutes augmente la conversion de 35 %. Tidio integre IA (reponses automatiques basiques). Gorgias integre l'historique commande directement dans le ticket.</p>
<p><strong>Configuration</strong> : creer 10 reponses pretes (livraison, retour, taille, dispo, paiement), connecter WhatsApp Business (critique en Afrique francophone), automatiser les questions frequentes.</p>

<h2>7. ReConvert - Page de remerciement et upsell</h2>
<p><strong>Cout</strong> : 4,99-79,99 USD/mois selon commandes.</p>
<p><strong>Pourquoi</strong> : la page de remerciement post-achat a un taux d'engagement de 90 %. Y proposer un upsell ou un produit complementaire augmente l'AOV de 8-15 % sans cout d'acquisition.</p>
<p><strong>Configuration</strong> : 1 upsell unique (pas 5), produit complementaire au panier, reduction de 10 a 20 % en exclusivite, timer pour l'urgence.</p>

<h2>8. TinyIMG - Image compression</h2>
<p><strong>Cout</strong> : gratuit jusqu'a 50 images, puis 4,99-39 USD/mois.</p>
<p><strong>Pourquoi</strong> : reduit le poids des images de 50-80 %, conversion en WebP, lazy loading. Impact direct sur Lighthouse score et SEO mobile.</p>
<p><strong>Configuration</strong> : activer la compression automatique pour toute nouvelle image, generer les ALT tags via IA, optimiser le format selon le navigateur.</p>

<h2>9. JSON-LD for SEO - Donnees structurees</h2>
<p><strong>Cout</strong> : 49 USD one-shot.</p>
<p><strong>Pourquoi</strong> : ajoute le balisage Schema.org complet (Product, Organization, Breadcrumb, FAQ, Article) qui permet a Google d'afficher rich snippets : prix, avis, dispo dans les SERPs. Augmente le CTR organique de 15-30 %.</p>

<h2>10. Smile.io - Programme de fidelite</h2>
<p><strong>Cout</strong> : gratuit jusqu'a 200 commandes/mois, puis 49-599 USD/mois.</p>
<p><strong>Pourquoi</strong> : augmente la frequence d'achat de 30 % en moyenne. Points, niveaux VIP, recompenses pour referencement amis. Indispensable des >1 000 clients actifs.</p>

<h2>Stack budget en mois 1 vs mois 12</h2>

<h3>Mois 1 (50-100 USD/mois)</h3>
<ul>
<li>Klaviyo (gratuit)</li>
<li>Judge.me Awesome (15)</li>
<li>Tidio Starter (29)</li>
<li>TinyIMG Free (0)</li>
<li>Privy Free (0)</li>
<li>JSON-LD for SEO (49 one-shot)</li>
</ul>

<h3>Mois 12 (250-400 USD/mois)</h3>
<ul>
<li>Klaviyo (60-150)</li>
<li>Judge.me Awesome (15)</li>
<li>Gorgias Pro (180)</li>
<li>Recharge (99 + 1%)</li>
<li>ReConvert (15)</li>
<li>Smile.io Starter (49)</li>
<li>PageFly Pro (39)</li>
</ul>

<blockquote>Les apps sont des leviers, pas des solutions miracles. Une app utilisee a 100 % bat 5 apps utilisees a 20 %. Maitrisez chaque app avant d'ajouter la suivante.</blockquote>

<h2>FAQ</h2>
<p><strong>Comment desinstaller proprement une app ?</strong></p>
<p>Cliquez "Supprimer" dans Admin > Apps. Mais avant : <strong>verifiez que l'app n'a pas injecte de code residuel</strong> dans theme.liquid (regardez la section before/after les balises de l'app). Sinon, votre page continuera a charger des ressources fantomes.</p>

<p><strong>Que faire si une app casse mon site ?</strong></p>
<p>1. Dupliquez immediatement votre theme actuel (sauvegarde) 2. Desinstallez l'app 3. Verifiez si le bug persiste 4. Si oui, restaurez le theme sauvegarde 5. Contactez le support de l'app avec la console d'erreur Chrome DevTools.</p>

<p>Besoin d'aide pour selectionner et configurer votre stack ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
            {'title': "Installer Elementor et construire sa premiere page",
             'duration': 18,
             'content_html': """<p>Elementor n'existe pas sur Shopify (c'est un plugin WordPress). L'equivalent fonctionnel sur Shopify est <strong>PageFly</strong>, <strong>Shogun</strong> ou <strong>GemPages</strong>. Cette lecon vous apprend a installer PageFly (l'option la plus populaire avec 100 000+ installations) et construire votre premiere landing page de campagne en moins de 2 heures.</p>

<h2>Pourquoi un page builder sur Shopify ?</h2>
<p>Les themes Shopify (meme premium) offrent des sections preconcues mais limitees. Pour creer une <strong>landing page de campagne Black Friday</strong>, une <strong>page de vente longue</strong> ou une <strong>page "A propos" cinematographique</strong>, vous avez besoin de plus de flexibilite.</p>

<p>PageFly permet de creer des pages avec drag-and-drop, animations, video, countdown, formulaires, integrations email, A/B testing - le tout sans toucher au code.</p>

<h2>Installer PageFly (5 minutes)</h2>
<ol>
<li>Allez sur le <strong>Shopify App Store</strong> > recherchez "PageFly"</li>
<li>Cliquez sur "Add app" et autorisez les permissions</li>
<li>Choisissez votre plan : <strong>Free</strong> (1 page), <strong>Pay-as-you-go</strong> (0,99 USD par publication), <strong>Pro</strong> (24 USD/mois pour pages illimitees)</li>
<li>PageFly est maintenant disponible dans votre admin Shopify</li>
</ol>

<p>Notre recommandation : commencez en <strong>Pay-as-you-go</strong> pour tester sans engagement. Passez en Pro des que vous publiez 5+ pages/mois.</p>

<h2>L'interface PageFly en 1 coup d'oeil</h2>
<ul>
<li><strong>Panneau gauche</strong> : bibliotheque d'elements (text, image, button, columns, gallery, etc.)</li>
<li><strong>Zone centrale</strong> : canvas de la page (preview live)</li>
<li><strong>Panneau droit</strong> : settings de l'element selectionne (styles, espacement, animations)</li>
<li><strong>Toolbar</strong> : preview mobile/tablet/desktop, save, publish, undo/redo</li>
</ul>

<h2>Construire votre premiere landing page (2 heures)</h2>

<h3>Etape 1 : Choisir le template ou partir d'une page vierge</h3>
<p>PageFly propose 80+ templates classes par usage : Black Friday, lancement produit, lead capture, about, FAQ, etc. Pour debuter, choisissez un template proche de votre besoin et personnalisez-le.</p>

<h3>Etape 2 : Structurer en sections</h3>
<p>Une landing page e-commerce moderne contient typiquement :</p>
<ol>
<li><strong>Hero</strong> : titre + sous-titre + CTA + image/video</li>
<li><strong>Trust bar</strong> : logos clients ou stats (1M+ clients, 4.8/5 etoiles)</li>
<li><strong>Probleme / Solution</strong> : problematique du client + votre reponse</li>
<li><strong>Benefits</strong> : 3-6 benefices avec icones</li>
<li><strong>Social proof</strong> : avis clients, video temoignages</li>
<li><strong>Demo / How it works</strong> : video produit ou steps</li>
<li><strong>Offre</strong> : prix, bonus, garantie</li>
<li><strong>FAQ</strong> : reponses aux 8 objections principales</li>
<li><strong>CTA final</strong> : repetition du call-to-action</li>
</ol>

<h3>Etape 3 : Personnaliser chaque section</h3>
<p>Dans PageFly :</p>
<ul>
<li><strong>Section Hero</strong> : drag "Heading" + "Text" + "Button" + "Image". Centrez le contenu, espacement 80px vertical.</li>
<li><strong>Trust bar</strong> : utilisez "Logo" element ou "Counter" pour les stats animes.</li>
<li><strong>Benefits</strong> : "Columns" en 3 colonnes, chacune avec "Icon" + "Heading" + "Text".</li>
<li><strong>Social proof</strong> : si vous utilisez Judge.me, integrez le widget directement.</li>
<li><strong>FAQ</strong> : element "Accordion" avec questions/reponses.</li>
<li><strong>CTA</strong> : "Button" avec couleur primaire de votre marque.</li>
</ul>

<h3>Etape 4 : Optimiser pour mobile</h3>
<p>Cliquez sur l'icone smartphone (toolbar). Verifiez :</p>
<ul>
<li>Texte lisible (16px minimum)</li>
<li>CTA accessibles (44px hauteur)</li>
<li>Pas de chevauchement</li>
<li>Images redimensionnees</li>
<li>Hierarchie visuelle conservee</li>
</ul>

<p>PageFly permet de <strong>cacher certains elements en mobile uniquement</strong> (ex: image decorative qui prend trop de place).</p>

<h3>Etape 5 : Connecter les CTAs</h3>
<p>Chaque bouton doit avoir une <strong>destination claire</strong> :</p>
<ul>
<li>Bouton "Acheter maintenant" -> page produit ou collection</li>
<li>Bouton "S'inscrire" -> formulaire email connecte a Klaviyo</li>
<li>Bouton "Contacter" -> page contact ou ouvre Tidio chat</li>
</ul>

<h3>Etape 6 : SEO de la page</h3>
<p>Dans PageFly settings > SEO :</p>
<ul>
<li><strong>Page Title</strong> : 50-60 caracteres, contient le mot-cle</li>
<li><strong>Meta description</strong> : 150-160 caracteres, accrocheuse + CTA</li>
<li><strong>URL slug</strong> : court, sans accents, mots-cles (ex: /pages/promo-noel-2026)</li>
</ul>

<h3>Etape 7 : Publier et tester</h3>
<p>Cliquez "Publish". La page est immediatement live. Ouvrez l'URL sur 3 appareils differents et verifiez le rendu.</p>

<h2>Best practices PageFly</h2>
<ol>
<li><strong>Reutilisez les sections</strong> : sauvegardez vos sections favorites comme "Saved sections" pour les reutiliser sur d'autres pages</li>
<li><strong>Compressez les images</strong> avant upload (TinyIMG ou Squoosh)</li>
<li><strong>Limitez les animations</strong> : 1-2 effets subtils max, sinon pollution visuelle et perf qui chute</li>
<li><strong>Testez le LCP</strong> apres publication : si > 3s, simplifiez le hero</li>
<li><strong>A/B testez les hero</strong> : PageFly Pro inclut un module de test integre</li>
</ol>

<h2>Alternatives a PageFly</h2>
<ul>
<li><strong>Shogun</strong> (39-249 USD/mois) : plus puissant, courbe d'apprentissage plus longue. Top pour grandes equipes.</li>
<li><strong>GemPages</strong> (29-199 USD/mois) : interface plus moderne, excellent rapport prix/fonctionnalites.</li>
<li><strong>EComposer</strong> (gratuit + 19-99 USD/mois) : monte rapidement, ideal pour debuter.</li>
<li><strong>Shopify Magic</strong> (natif gratuit) : IA pour generer du texte, limite mais utile.</li>
</ul>

<blockquote>Une landing page bien construite peut convertir 2 a 5x mieux qu'une page produit standard. C'est l'outil indispensable pour vos campagnes paid (Meta Ads, Google Ads) qui necessitent un message tres aligne.</blockquote>

<h2>FAQ</h2>
<p><strong>Les pages PageFly ralentissent-elles ma boutique ?</strong></p>
<p>Legerement (5-10 points Lighthouse). Pour minimiser : limitez les animations, compressez les images, evitez les widgets externes lourds (carrousels Instagram, etc.). Une page PageFly bien optimisee atteint un score de 75-85 sur mobile.</p>

<p><strong>Peut-on creer une page d'accueil avec PageFly ?</strong></p>
<p>Oui, mais c'est rarement la meilleure approche. La page d'accueil change peu, mieux vaut investir dans un theme premium avec sections puissantes. PageFly excelle pour les pages campagne, lancements, lead capture - tout ce qui change frequemment.</p>

<p>Vous voulez une landing page sur mesure pour votre prochain lancement ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
            {'title': "Optimiser les images : WebP, lazy load, compression",
             'duration': 18,
             'content_html': """<p>Les images representent en moyenne <strong>67 % du poids total d'une page e-commerce</strong>. Mal optimisees, elles ralentissent votre site, plombent votre SEO mobile et tuent votre conversion. Cette lecon vous donne la methode complete pour reduire le poids de vos images de 70 % sans perdre en qualite perceptible.</p>

<h2>Comprendre les formats d'image en 2026</h2>

<h3>JPG (JPEG)</h3>
<ul>
<li><strong>Usage</strong> : photos avec beaucoup de couleurs, photos produits avec fond complexe</li>
<li><strong>Compression</strong> : avec perte, ajustable</li>
<li><strong>Poids moyen</strong> : 80-300 Ko pour une photo 1200x1200</li>
<li><strong>A eviter</strong> : transparence non geree</li>
</ul>

<h3>PNG</h3>
<ul>
<li><strong>Usage</strong> : logos, icones, images avec transparence</li>
<li><strong>Compression</strong> : sans perte</li>
<li><strong>Poids moyen</strong> : 150-800 Ko (lourd)</li>
<li><strong>A eviter</strong> : photos riches en couleurs (utiliser JPG)</li>
</ul>

<h3>WebP - le standard 2026</h3>
<ul>
<li><strong>Usage</strong> : remplace JPG et PNG dans la quasi-totalite des cas</li>
<li><strong>Compression</strong> : avec perte ou sans perte, transparence supportee</li>
<li><strong>Poids moyen</strong> : 30-50 % plus leger qu'un JPG equivalent</li>
<li><strong>Compatibilite</strong> : 96 % des navigateurs en 2026 (Safari, Chrome, Firefox, Edge)</li>
</ul>

<h3>AVIF - le futur (encore experimental)</h3>
<ul>
<li><strong>Usage</strong> : encore plus compresse que WebP (30 % en moins)</li>
<li><strong>Compatibilite</strong> : 90 % des navigateurs en 2026, en croissance</li>
<li><strong>A surveiller</strong> : sera le standard d'ici 2027-2028</li>
</ul>

<h2>Methodologie d'optimisation en 4 etapes</h2>

<h3>Etape 1 : Dimensionner correctement</h3>
<p>Avant tout, redimensionnez vos images a la <strong>taille reelle d'affichage</strong> :</p>
<ul>
<li>Image produit principale : <strong>1200x1200 px</strong> (zoom inclus)</li>
<li>Image miniature collection : <strong>600x600 px</strong></li>
<li>Image hero accueil : <strong>1920x900 px</strong> desktop, <strong>800x1000 px</strong> mobile</li>
<li>Image blog feature : <strong>1200x630 px</strong> (ratio Open Graph)</li>
<li>Logo : <strong>SVG</strong> ou PNG 500x250 max</li>
</ul>

<p>Une image 4000x3000 chargee pour s'afficher en 600x450 = 90 % de bande passante gaspillee.</p>

<h3>Etape 2 : Compresser avant upload</h3>
<p>Outils gratuits :</p>
<ul>
<li><strong>Squoosh.app</strong> (Google) : ultra-precis, controle qualite slider</li>
<li><strong>TinyPNG / TinyJPG</strong> : compression intelligente, batch upload</li>
<li><strong>ImageOptim</strong> (Mac) : batch local, qualite preservee</li>
<li><strong>Photoshop</strong> : Export As avec slider qualite</li>
</ul>

<p>Reglage cible : qualite <strong>80-85 % JPG</strong>. Au-dessus = poids inutile. En-dessous = artefacts visibles.</p>

<h3>Etape 3 : Convertir en WebP</h3>
<p>Trois methodes :</p>
<ol>
<li><strong>App Shopify TinyIMG</strong> : conversion automatique a l'upload</li>
<li><strong>Squoosh.app</strong> : conversion manuelle 1 par 1</li>
<li><strong>CDN automatique</strong> : services comme Cloudinary, ImageKit detectent le navigateur et servent le format optimal</li>
</ol>

<p>Bonne nouvelle : <strong>Shopify convertit automatiquement</strong> vos JPG/PNG en WebP via leur CDN depuis 2022, si le navigateur le supporte. Vous pouvez donc uploader JPG, Shopify servira WebP.</p>

<h3>Etape 4 : Activer le lazy loading</h3>
<p>Le lazy loading retarde le chargement des images hors ecran jusqu'a ce qu'elles approchent du viewport. Reduit le temps de chargement initial de 30-60 %.</p>

<p>Sur Shopify, le lazy loading est <strong>active par defaut</strong> sur les themes Online Store 2.0 (Dawn, Refresh, etc.) via l'attribut HTML <code>loading="lazy"</code>.</p>

<p>Verifiez avec Chrome DevTools > Network > Img. Au chargement initial, seules les images visibles devraient etre chargees.</p>

<h2>L'app TinyIMG : configuration optimale</h2>
<p>Installez <strong>TinyIMG</strong> depuis le Shopify App Store. Configuration recommandee :</p>
<ul>
<li><strong>Auto compress</strong> : ON pour toutes les nouvelles images</li>
<li><strong>Convert to WebP</strong> : ON</li>
<li><strong>Compression level</strong> : Balanced (qualite/poids equilibre)</li>
<li><strong>Auto ALT text via AI</strong> : ON (genere les ALT manquants)</li>
<li><strong>Bulk optimization</strong> : lancer une fois sur l'ensemble du catalogue existant</li>
</ul>

<p>Resultats typiques apres lancement : <strong>-50 a -75 % du poids des images</strong> en 1 clic.</p>

<h2>Les ALT texts : SEO + accessibilite</h2>
<p>L'attribut <code>alt</code> decrit l'image pour :</p>
<ul>
<li><strong>Les non-voyants</strong> (lecteurs d'ecran) : accessibilite obligatoire WCAG</li>
<li><strong>Google Images</strong> : SEO image (10-15 % du trafic e-commerce)</li>
<li><strong>Affichage si erreur</strong> : si l'image ne charge pas</li>
</ul>

<h3>Comment ecrire un bon ALT</h3>
<ul>
<li><strong>Descriptif</strong> : "Robe noire en velours longue manches longues - vue de face"</li>
<li><strong>Mots-cles naturels</strong> : sans bourrer, integrer 1-2 mots-cles SEO si pertinent</li>
<li><strong>Concis</strong> : 8-15 mots max</li>
<li><strong>Pas de "image de" ou "photo de"</strong> : redondant</li>
</ul>

<h2>Audit images : la checklist</h2>
<ol>
<li>Toutes les images du catalogue compressees ? (verifier via TinyIMG dashboard)</li>
<li>Format WebP servi via Shopify CDN ? (verifier Chrome DevTools Network)</li>
<li>Lazy loading actif ? (theme Online Store 2.0 ou code custom)</li>
<li>Tous les ALT remplis ? (audit via SearchPie ou Plug In SEO)</li>
<li>Hero accueil < 500 Ko ? (sinon, compresser plus fort)</li>
<li>Pas d'images > 2 MB ? (a chasser avec audit Lighthouse)</li>
<li>Favicon configure ? (32x32 px minimum)</li>
<li>Open Graph image set (1200x630) ? (pour partages reseaux sociaux)</li>
</ol>

<blockquote>Optimiser les images bien est l'amelioration de performance la plus rentable possible : 4-8 heures de travail = 20-40 points Lighthouse + 15-25 % d'amelioration LCP + meilleur classement Google. ROI inegalable.</blockquote>

<h2>FAQ</h2>
<p><strong>Faut-il payer un service CDN externe (Cloudinary, ImageKit) ?</strong></p>
<p>Non pour la plupart des boutiques. Le CDN Shopify natif (Fastly + Cloudflare) est excellent jusqu'a plusieurs millions de visites/mois. Cloudinary devient utile uniquement pour transformations d'image dynamiques avancees (overlays, watermarks, manipulations a la volee).</p>

<p><strong>Comment optimiser les images dans le blog ?</strong></p>
<p>Meme processus : redimensionner avant upload (max 1200px de large), compresser (TinyPNG), uploader. Le blog Shopify ne convertit pas toujours en WebP automatiquement, verifiez avec TinyIMG.</p>

<p>Besoin d'un audit complet de vos performances images ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
            {'title': "Securiser WordPress contre les attaques courantes",
             'duration': 18,
             'content_html': """<p>Shopify gere lui-meme 90 % de la securite serveur, contrairement a WordPress ou vous etes responsable du hardening. Mais cela ne signifie pas que vous etes a l'abri : les attaques visent souvent vos comptes admin, vos clients, et vos donnees de paiement via des vecteurs differents. Cette lecon vous donne la checklist complete de securisation Shopify pour 2026.</p>

<h2>Ce que Shopify gere pour vous</h2>
<ul>
<li><strong>Certificat SSL/TLS</strong> automatique sur tous les domaines (gratuit, renouvele automatiquement)</li>
<li><strong>Conformite PCI DSS Level 1</strong> (la plus haute pour les paiements carte)</li>
<li><strong>Protection DDoS</strong> via leur infrastructure Fastly + Cloudflare</li>
<li><strong>Sauvegardes automatiques</strong> du code de votre boutique</li>
<li><strong>Mises a jour serveur</strong> et patches de securite</li>
<li><strong>WAF (Web Application Firewall)</strong> integre</li>
</ul>

<h2>Ce dont VOUS etes responsable</h2>

<h3>1. Securisation des comptes utilisateurs</h3>

<h4>Activer la 2FA (authentification a deux facteurs)</h4>
<p>Dans <strong>Compte utilisateur > Securite</strong>, activez la 2FA via :</p>
<ul>
<li><strong>Google Authenticator</strong> ou <strong>Authy</strong> (recommande)</li>
<li><strong>SMS</strong> (acceptable mais moins securise - vulnerable au SIM swap)</li>
<li><strong>Cle physique</strong> (YubiKey - le plus securise, 50-80 EUR)</li>
</ul>

<p>La 2FA bloque 99,9 % des tentatives de prise de controle (donnees Google 2024). C'est l'investissement securite #1.</p>

<h4>Mots de passe robustes</h4>
<ul>
<li>Minimum <strong>16 caracteres</strong></li>
<li>Generes par <strong>gestionnaire</strong> (1Password, Bitwarden, Dashlane)</li>
<li>Uniques par service (jamais reutilises)</li>
<li>Changes immediatement si breach detectee</li>
</ul>

<h4>Gestion des permissions equipe</h4>
<p>Dans <strong>Parametres > Utilisateurs et permissions</strong>, appliquez le principe du moindre privilege :</p>
<ul>
<li>Marketing : acces marketing, produits (sans suppression), pas de finance</li>
<li>SAV : acces commandes, clients, pas de produits/themes</li>
<li>Comptable : acces analytics, rapports financiers uniquement</li>
<li>Developpeur : acces theme et apps, pas de finance</li>
</ul>

<p>Auditez les permissions <strong>tous les 3 mois</strong>. Supprimez immediatement les comptes des employes/freelances qui partent.</p>

<h3>2. Protection contre les fraudes</h3>

<h4>Shopify Fraud Analysis</h4>
<p>Active par defaut sur Shopify Payments. Chaque commande est notee :</p>
<ul>
<li><strong>Low risk</strong> : processus normal</li>
<li><strong>Medium risk</strong> : a verifier avant fulfillment</li>
<li><strong>High risk</strong> : a refuser ou demander info supplementaires</li>
</ul>

<p>Indicateurs analyses : difference adresse facturation/livraison, proxy/VPN, CVV mismatch, montant inhabituel, historique du compte.</p>

<h4>Apps anti-fraude</h4>
<ul>
<li><strong>NoFraud</strong> (free + 30 USD/mois) : verification chargeback garanti</li>
<li><strong>Signifyd</strong> (1-2 % du CA) : protection complete contre chargebacks</li>
<li><strong>FraudLabs Pro</strong> (gratuit + 39 USD/mois) : scoring avance</li>
</ul>

<h4>3D Secure obligatoire</h4>
<p>Dans <strong>Parametres > Paiements</strong>, activez 3D Secure pour toutes les transactions europeennes (obligatoire DSP2 depuis 2021). Reduit la fraude de 60-70 %.</p>

<h3>3. Protection des donnees clients (RGPD)</h3>

<h4>Politique de confidentialite</h4>
<ul>
<li>Generee automatiquement par Shopify dans <strong>Parametres > Politiques</strong></li>
<li>A personnaliser : ajouter les apps tierces qui traitent les donnees (Klaviyo, Tidio, etc.)</li>
<li>Mentionner les droits RGPD (acces, rectification, suppression, portabilite)</li>
</ul>

<h4>Banniere cookies</h4>
<p>Obligatoire en UE depuis 2018, renforcee en 2024. Apps recommandees :</p>
<ul>
<li><strong>Pandectes GDPR Compliance</strong> (gratuit + 9 USD/mois) : standard Shopify</li>
<li><strong>iubenda</strong> (10-50 USD/mois) : pour multi-pays</li>
<li><strong>Cookiebot</strong> : enterprise, conformite avancee</li>
</ul>

<h4>Droit a l'oubli</h4>
<p>Shopify gere les demandes RGPD via <strong>Customer Privacy API</strong>. Quand un client demande suppression de ses donnees, Shopify et tous les apps connectes doivent supprimer ses donnees dans 30 jours.</p>

<h3>4. Securisation des apps tierces</h3>
<ul>
<li><strong>Audit trimestriel</strong> : revuez Admin > Apps tous les 3 mois</li>
<li><strong>Supprimez les apps inutilisees</strong> : chaque app a des permissions</li>
<li><strong>Verifiez les nouvelles permissions</strong> demandees lors d'updates</li>
<li><strong>Choisissez des apps avec >100 avis</strong> et >4 etoiles</li>
<li><strong>Evitez les apps avec >12 mois sans update</strong></li>
</ul>

<h3>5. Protection contre le scraping et le bot</h3>
<ul>
<li><strong>Captcha au checkout</strong> : active par defaut sur les comptes Shopify Plus, activable sur Basic via apps</li>
<li><strong>Limitation login</strong> : Shopify bloque automatiquement apres 5 tentatives erronees</li>
<li><strong>Cloudflare devant Shopify</strong> : possible pour protection DDoS supplementaire (avance)</li>
</ul>

<h3>6. Surveillance et alertes</h3>

<h4>Activez les notifications Shopify</h4>
<ul>
<li>Nouvelle connexion depuis appareil inconnu</li>
<li>Changement de mot de passe</li>
<li>Modification des comptes utilisateurs</li>
<li>Installation/desinstallation d'app</li>
<li>Commandes a haut risque</li>
</ul>

<h4>Logs d'audit</h4>
<p>Disponibles sur Shopify Plus uniquement. Pour Basic/Advanced, l'app <strong>Logbook</strong> ou <strong>QuickFlow</strong> permet de tracer les actions equipe.</p>

<h2>Checklist mensuelle de securite</h2>
<ol>
<li>Verifier 2FA active sur tous les comptes admin</li>
<li>Revue des utilisateurs (suppressions des inactifs)</li>
<li>Revue des apps installees (suppressions des inutilisees)</li>
<li>Audit des commandes high risk</li>
<li>Verification de la banniere cookies fonctionnelle</li>
<li>Test du flow de demande RGPD (simulation droit a l'oubli)</li>
<li>Verification du certificat SSL (icone cadenas vert)</li>
</ol>

<blockquote>La securite n'est pas un evenement, c'est un processus continu. 30 minutes par mois suffisent a maintenir une boutique securisee. Comparez ce temps au cout d'une violation : 50 000 a 500 000 EUR en moyenne, sans compter la perte de confiance.</blockquote>

<h2>FAQ</h2>
<p><strong>Que faire si mon compte Shopify est compromis ?</strong></p>
<p>1. Contactez immediatement le support Shopify (chat 24/7) 2. Changez tous les mots de passe (admin + email associe) 3. Activez 2FA si pas encore fait 4. Auditez les apps recemment installees 5. Verifiez les commandes recentes et les remboursements 6. Notifiez vos clients si donnees personnelles touchees (obligation RGPD sous 72h).</p>

<p><strong>Shopify est-il vraiment plus securise que WooCommerce ?</strong></p>
<p>Globalement oui pour 95 % des marchands. Shopify centralise la securite serveur. WooCommerce demande du temps et de l'expertise pour atteindre un niveau de securite equivalent (Wordfence, Sucuri, hardening serveur). Shopify est plus "fail-safe by default".</p>

<p>Vous voulez un audit securite complet de votre boutique ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
            {'title': "Sauvegardes automatiques et plan de continuite",
             'duration': 18,
             'content_html': """<p>Une catastrophe peut frapper a tout moment : modification par erreur d'un theme, suppression accidentelle d'un produit, app malveillante qui efface des donnees, ou simplement un changement qui casse votre conversion. Sans sauvegardes, vous perdez heures, jours ou semaines de travail. Cette lecon vous donne le plan de sauvegarde complet pour Shopify en 2026.</p>

<h2>Ce que Shopify sauvegarde automatiquement</h2>
<p>Shopify maintient ses propres sauvegardes infrastructure (serveurs, base de donnees) pour la continuite de service. Mais <strong>ces sauvegardes ne vous sont pas accessibles</strong>. Vous ne pouvez pas dire "remettez ma boutique d'hier" via le support.</p>

<p>Ce qui est <strong>versionne par Shopify</strong> :</p>
<ul>
<li><strong>Themes</strong> : historique des versions accessible dans Admin > Boutique en ligne > Themes</li>
<li><strong>Pages, blog</strong> : pas de versionning, modifications definitives</li>
<li><strong>Produits, collections</strong> : pas de versionning</li>
<li><strong>Commandes, clients</strong> : pas suppressibles (sauf RGPD), donc preserves</li>
</ul>

<h2>Strategie de sauvegarde 3-2-1</h2>
<p>Standard professionnel de l'IT : <strong>3 copies des donnees, sur 2 supports differents, dont 1 hors site</strong>. Applique a Shopify :</p>
<ol>
<li><strong>Copie 1 (live)</strong> : votre boutique Shopify en production</li>
<li><strong>Copie 2 (cloud externe)</strong> : sauvegarde automatique via app (Rewind, BackupMaster)</li>
<li><strong>Copie 3 (local)</strong> : export periodique sur votre disque dur ou Google Drive</li>
</ol>

<h2>App Rewind Backups (recommande)</h2>
<p><strong>Rewind</strong> est le standard de l'industrie pour les sauvegardes Shopify. Installation simple, recuperation granulaire.</p>

<h3>Pricing</h3>
<ul>
<li><strong>Lite</strong> : 9 USD/mois - 30 commandes/mois, sauvegarde 7 jours</li>
<li><strong>Standard</strong> : 39 USD/mois - 600 commandes/mois, sauvegarde 12 mois</li>
<li><strong>Advanced</strong> : 99 USD/mois - 6 000 commandes/mois, sauvegarde 12 mois</li>
<li><strong>Plus</strong> : 199-599 USD/mois - illimite</li>
</ul>

<h3>Ce que Rewind sauvegarde</h3>
<ul>
<li>Produits, variants, images, descriptions</li>
<li>Collections (manuelles et automatiques)</li>
<li>Pages, blog articles</li>
<li>Themes (toutes versions)</li>
<li>Menus de navigation</li>
<li>Politiques (CGV, confidentialite, etc.)</li>
<li>Customers (sans donnees de paiement)</li>
<li>Discount codes</li>
<li>Files (uploads CDN)</li>
</ul>

<h3>Configuration optimale</h3>
<ol>
<li>Installer Rewind depuis le Shopify App Store</li>
<li>Choisir le plan adapte a votre volume</li>
<li>Activer <strong>Auto-backup quotidien</strong></li>
<li>Configurer alertes email en cas de changement majeur</li>
<li>Tester la restauration sur un produit test (procedure obligatoire mensuelle)</li>
</ol>

<h2>Alternatives a Rewind</h2>
<ul>
<li><strong>BackupMaster</strong> (8-69 USD/mois) : plus accessible, moins complet</li>
<li><strong>Talon Backup</strong> (15-50 USD/mois) : focus sur restauration rapide</li>
<li><strong>Shopify Backup by Filey</strong> (gratuit + 8 USD/mois) : option budget</li>
</ul>

<h2>Sauvegardes manuelles complementaires</h2>

<h3>Theme : duplication systematique avant modification</h3>
<p>Avant <strong>chaque</strong> modification de theme :</p>
<ol>
<li>Admin > Boutique en ligne > Themes</li>
<li>Actions > Duplicate</li>
<li>Renommez avec date : "Dawn 2026-05-29 backup before nav update"</li>
<li>Effectuez vos modifications sur le theme original</li>
<li>Si bug : actions > publish sur la sauvegarde</li>
</ol>

<p>Cette procedure de 30 secondes vous sauve litteralement la mise une fois par mois en moyenne.</p>

<h3>Export CSV produits</h3>
<p>Mensuellement, exportez votre catalogue :</p>
<ol>
<li>Admin > Produits</li>
<li>Bouton "Exporter" en haut a droite</li>
<li>Choisir "Tous les produits" + "CSV pour Excel"</li>
<li>Sauvegarder sur Google Drive avec date</li>
</ol>

<p>Permet de restaurer rapidement le catalogue en cas de probleme massif.</p>

<h3>Export clients</h3>
<p>Trimestriellement, exportez votre base clients :</p>
<ol>
<li>Admin > Clients</li>
<li>"Exporter" > "Tous les clients"</li>
<li>CSV chiffre sauvegarde dans coffre numerique (1Password, Bitwarden)</li>
</ol>

<p>Attention RGPD : ces exports contiennent des donnees personnelles. Chiffrez et limitez l'acces.</p>

<h3>Export commandes</h3>
<p>Mensuel pour comptabilite, conserve 10 ans (obligation legale en France) :</p>
<ol>
<li>Admin > Commandes</li>
<li>Filtre date du mois</li>
<li>"Exporter" > CSV</li>
<li>Sauvegarde dans dossier comptabilite annuel</li>
</ol>

<h2>Plan de continuite d'activite (PCA)</h2>

<h3>Documenter les procedures critiques</h3>
<p>Creez un document "Manuel de survie" avec :</p>
<ul>
<li>Acces : URLs admin, identifiants (dans coffre 1Password), 2FA backup codes</li>
<li>Procedures : comment publier un produit, traiter une commande, repondre a un client</li>
<li>Contacts : support Shopify, prestataires, transporteurs</li>
<li>Procedures de restauration : etapes en cas de problemes majeurs</li>
</ul>

<p>Ce document doit pouvoir etre utilise par un collegue ou prestataire en cas d'urgence (hospitalisation, conges, etc.).</p>

<h3>Scenarios catastrophe testes</h3>
<ol>
<li><strong>Theme casse</strong> : restauration via theme duplique (10 min)</li>
<li><strong>App malveillante</strong> : desinstallation + restauration Rewind (1-4 heures)</li>
<li><strong>Compte admin compromis</strong> : changement mots de passe + audit complet (2-8 heures)</li>
<li><strong>Domaine perdu</strong> : recuperation registrar + reconfig DNS (1-7 jours)</li>
<li><strong>Shopify panne globale</strong> : communication transparente clients, suivi statut</li>
</ol>

<blockquote>Une sauvegarde non testee n'est pas une sauvegarde. Realisez un test de restauration <strong>trimestriellement</strong> sur un produit ou page test. Confirmez que tout fonctionne avant d'en avoir besoin pour de vrai.</blockquote>

<h2>FAQ</h2>
<p><strong>Combien de temps Shopify garde-t-il les donnees apres fermeture d'un compte ?</strong></p>
<p>30 jours, puis suppression definitive. Si vous fermez votre boutique temporairement et que vous depassez 30 jours, vous perdez tout. Conservez systematiquement vos exports CSV produits/clients/commandes.</p>

<p><strong>Que faire si Rewind subit lui-meme une panne ?</strong></p>
<p>Rewind heberge ses sauvegardes sur Amazon S3 avec haute redondance. Probabilite de perte: tres faible. Pour les paranoiaques, exportez aussi vos donnees Rewind localement tous les mois.</p>

<p>Besoin d'aide pour mettre en place votre plan de sauvegarde ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
        ],
    },
    {
        'title': 'Performance et securite',
        'objective': "Atteindre un score Lighthouse 85+ mobile sur Shopify, optimiser les Core Web Vitals (LCP, FID, CLS, INP), durcir la securite avancee, configurer un CDN et reussir une migration sans casse.",
        'duration': 90,
        'lessons': [
            {'title': "Performance : optimiser le LCP, FID, CLS",
             'duration': 18,
             'content_html': """<p>Les Core Web Vitals sont les <strong>3 metriques de performance officielles de Google</strong> qui impactent directement votre SEO et votre conversion. En 2024, une 4eme metrique - INP - a remplace FID. Cette lecon vous donne la methode complete pour atteindre les seuils "Good" sur les 4 metriques.</p>

<h2>Les 4 metriques essentielles en 2026</h2>

<h3>LCP (Largest Contentful Paint)</h3>
<ul>
<li><strong>Definition</strong> : temps avant que le plus grand element visible (hero image, titre) soit affiche</li>
<li><strong>Seuil "Good"</strong> : &lt; 2,5 secondes</li>
<li><strong>Seuil "Needs Improvement"</strong> : 2,5 - 4,0 secondes</li>
<li><strong>Seuil "Poor"</strong> : &gt; 4,0 secondes</li>
</ul>

<h3>INP (Interaction to Next Paint) - remplace FID</h3>
<ul>
<li><strong>Definition</strong> : temps maximal entre une interaction utilisateur (clic, tap) et le rendu visuel</li>
<li><strong>Seuil "Good"</strong> : &lt; 200 ms</li>
<li><strong>Seuil "Poor"</strong> : &gt; 500 ms</li>
</ul>

<h3>CLS (Cumulative Layout Shift)</h3>
<ul>
<li><strong>Definition</strong> : decalage visuel cumulatif des elements pendant le chargement</li>
<li><strong>Seuil "Good"</strong> : &lt; 0,1</li>
<li><strong>Seuil "Poor"</strong> : &gt; 0,25</li>
</ul>

<h3>TTFB (Time To First Byte) - sous-metrique cruciale</h3>
<ul>
<li><strong>Definition</strong> : temps entre la requete et le premier octet recu</li>
<li><strong>Seuil "Good"</strong> : &lt; 800 ms</li>
</ul>

<h2>Optimiser le LCP sur Shopify</h2>

<h3>Causes courantes de LCP eleve</h3>
<ol>
<li>Hero image trop lourde (>500 Ko)</li>
<li>Hero image non preloadee</li>
<li>Polices Web custom qui bloquent le rendu</li>
<li>App lourde injectee dans le head</li>
<li>Theme avec sliders et carrousels initiaux</li>
</ol>

<h3>Solutions concretes</h3>

<h4>1. Optimiser l'image hero</h4>
<ul>
<li>Format WebP (ou AVIF)</li>
<li>Compression a 75-80 % qualite</li>
<li>Dimensions exactes d'affichage (pas plus)</li>
<li>Preload via balise &lt;link rel="preload" as="image"&gt; (Shopify Dawn le fait automatiquement)</li>
</ul>

<h4>2. Polices Web non bloquantes</h4>
<ul>
<li>Utilisez <code>font-display: swap</code> (defaut Shopify)</li>
<li>Limitez a 2 polices max</li>
<li>Preloadez les variantes essentielles uniquement</li>
</ul>

<h4>3. Eviter les apps lourdes en first paint</h4>
<ul>
<li>Audit avec PageSpeed Insights, repere les apps qui injectent du JS dans le head</li>
<li>Demande au support de l'app de charger en defer</li>
<li>Desinstaller les apps non-critiques</li>
</ul>

<h2>Optimiser l'INP</h2>

<h3>Causes courantes</h3>
<ul>
<li>JavaScript lourd qui bloque le main thread</li>
<li>Multiples apps qui ecoutent les memes evenements</li>
<li>Carrousels et animations complexes</li>
<li>Code third-party (chat widgets, popups, trackers)</li>
</ul>

<h3>Solutions</h3>
<ul>
<li><strong>Defer ou async</strong> sur tous les scripts non-critiques</li>
<li>Limiter le nombre d'apps actives</li>
<li>Eviter les sliders avec autoplay rapide</li>
<li>Differer le chargement du chat widget jusqu'apres 5 secondes de scroll</li>
</ul>

<h2>Optimiser le CLS</h2>

<h3>Causes courantes</h3>
<ol>
<li>Images sans dimensions explicites (width, height)</li>
<li>Banniere cookies qui apparait en bas</li>
<li>Polices personnalisees sans fallback de taille</li>
<li>Annonces ou widgets injectes apres le chargement</li>
<li>Popups qui poussent le contenu vers le bas</li>
</ol>

<h3>Solutions</h3>
<ul>
<li><strong>Toujours specifier width et height</strong> sur les images : <code>&lt;img src="..." width="600" height="400"&gt;</code></li>
<li><strong>Reserver l'espace</strong> pour les widgets dynamiques (placeholder skeleton)</li>
<li><strong>Banniere cookies en bas</strong> (jamais au top, qui pousse tout)</li>
<li><strong>Polices avec metric overrides</strong> pour eviter le saut entre fallback et webfont</li>
</ul>

<h2>Outils de mesure</h2>

<h3>Lab data (synthetique, en conditions de test)</h3>
<ul>
<li><strong>PageSpeed Insights</strong> : gratuit, le standard officiel</li>
<li><strong>WebPageTest</strong> : tres detaille, simulation depuis differentes localisations</li>
<li><strong>Lighthouse</strong> : integre dans Chrome DevTools</li>
<li><strong>GTmetrix</strong> : analyse approfondie avec waterfall</li>
</ul>

<h3>Field data (donnees reelles des visiteurs)</h3>
<ul>
<li><strong>Chrome User Experience Report (CrUX)</strong> : donnees Google sur vos vrais utilisateurs</li>
<li><strong>Google Search Console > Core Web Vitals</strong> : monitoring continu</li>
<li><strong>Web Vitals extension Chrome</strong> : metriques en direct sur n'importe quelle page</li>
</ul>

<h2>Plan d'action en 5 etapes pour Shopify</h2>

<h3>Etape 1 : Audit complet</h3>
<p>Testez votre URL principale + 1 collection + 1 fiche produit + 1 page panier dans PageSpeed Insights. Notez les scores actuels.</p>

<h3>Etape 2 : Identifier les goulots</h3>
<p>Focus sur la metrique la plus rouge. Si c'est LCP : images. Si c'est INP : JavaScript/apps. Si c'est CLS : layout/dimensions.</p>

<h3>Etape 3 : Optimisation rapide (1 jour)</h3>
<ul>
<li>Installer TinyIMG et lancer bulk optimization</li>
<li>Auditer les apps installees et supprimer les non-utilisees</li>
<li>Verifier que toutes les images du theme ont width/height</li>
<li>Deplacer la banniere cookies en bas</li>
</ul>

<h3>Etape 4 : Optimisation profonde (1 semaine)</h3>
<ul>
<li>Reduire le hero a 1 image legere (pas de slider)</li>
<li>Charger les scripts non-critiques en defer/async</li>
<li>Differer le chargement du chat widget</li>
<li>Simplifier la home page (max 4-5 sections)</li>
</ul>

<h3>Etape 5 : Monitoring continu</h3>
<p>Configurez les alertes Search Console (notifications email si CWV se degradent). Verifiez mensuellement.</p>

<blockquote>Passer de Lighthouse mobile 50 a 80 augmente le taux de conversion de 15-30 % en moyenne. Sur 1 million d'EUR de CA, c'est 150-300 K EUR additionnels. Le ROI le plus eleve du marketing technique.</blockquote>

<h2>FAQ</h2>
<p><strong>Pourquoi mon score Lighthouse change a chaque test ?</strong></p>
<p>Lighthouse simule un appareil et un reseau, mais avec variabilite. Faites <strong>5 tests et prenez la mediane</strong>. Les variations &lt;5 points sont normales.</p>

<p><strong>Faut-il payer un consultant performance ?</strong></p>
<p>Si vous etes &lt;75 score, oui : 1 500-3 000 EUR pour un audit + recommandations peut tripler votre score. Si &gt;85, optimisations marginales ne valent pas l'investissement.</p>

<p>Besoin d'un audit performance complet ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
            {'title': "Audit Lighthouse Mobile : objectif 90+",
             'duration': 18,
             'content_html': """<p>Un score Lighthouse Mobile de 90+ etait considere comme un Saint Graal il y a 5 ans. En 2026, c'est devenu un standard accessible pour toute boutique Shopify bien construite. Cette lecon vous donne la methode pas-a-pas pour mesurer et atteindre 90+ sur les 4 axes Lighthouse : Performance, Accessibility, Best Practices, SEO.</p>

<h2>Les 4 axes Lighthouse</h2>

<h3>Performance (le plus dur)</h3>
<p>Mesure : LCP, INP, CLS, FCP, TTI, Speed Index. Score 0-100. Objectif mobile : 75-85+ pour Shopify.</p>

<h3>Accessibility</h3>
<p>Mesure : contraste, ALT texts, labels, ARIA, navigation clavier. Score 0-100. Objectif : 95-100 (atteignable).</p>

<h3>Best Practices</h3>
<p>Mesure : HTTPS, console errors, vulnerabilites JS, security headers. Score 0-100. Objectif : 95-100.</p>

<h3>SEO</h3>
<p>Mesure : meta tags, structure HTML, robots, sitemap. Score 0-100. Objectif : 95-100 (facile).</p>

<h2>Lancer un audit Lighthouse</h2>

<h3>Methode 1 : Chrome DevTools (le plus pratique)</h3>
<ol>
<li>Ouvrir Chrome sur la page a auditer</li>
<li>F12 (DevTools)</li>
<li>Onglet "Lighthouse"</li>
<li>Cocher "Mobile" (Performance, Accessibility, Best Practices, SEO)</li>
<li>Mode "Navigation"</li>
<li>"Analyze page load"</li>
<li>Attendre 30-60 secondes</li>
</ol>

<h3>Methode 2 : PageSpeed Insights (officiel Google)</h3>
<p>Allez sur <strong>pagespeed.web.dev</strong>. Collez l'URL. Tests mobile + desktop. Donnees lab + field. C'est la reference officielle utilisee par Google pour le ranking.</p>

<h3>Methode 3 : Lighthouse CI (automatisation)</h3>
<p>Pour les equipes techniques, integrer Lighthouse CI dans le pipeline de deploiement. Bloque la mise en prod si les scores chutent.</p>

<h2>Optimiser le score Performance (chantier principal)</h2>

<h3>Quick wins (gain 10-25 points en 1-2 jours)</h3>
<ol>
<li><strong>Installer TinyIMG</strong> et lancer bulk optimization (-10 a -30 % poids pages)</li>
<li><strong>Supprimer 3-5 apps non utilisees</strong> (-100 a -500 ms de JS)</li>
<li><strong>Reduire le hero a 1 image</strong> au lieu d'un slider (-1 a -2 secondes LCP)</li>
<li><strong>Activer le lazy loading</strong> sur toutes les images sous le fold (defaut Online Store 2.0)</li>
<li><strong>Differer le chat widget</strong> apres 5 secondes</li>
</ol>

<h3>Optimisations medium effort (gain 5-15 points)</h3>
<ol>
<li>Simplifier la home page (4-5 sections max)</li>
<li>Reduire le nombre de polices personnalisees a 2</li>
<li>Optimiser les SVG (SVGOMG)</li>
<li>Minifier le CSS et JS custom</li>
<li>Preload les ressources critiques (font, hero image)</li>
</ol>

<h3>Optimisations avancees (gain 5-10 points, requiert dev)</h3>
<ol>
<li>Inline le CSS critique au-dessus du fold</li>
<li>Defer le CSS non-critique</li>
<li>Tree-shake les bibliotheques JS</li>
<li>Reduire le HTML genere (sections inutiles)</li>
<li>Optimiser le theme.liquid en supprimant le code mort</li>
</ol>

<h2>Optimiser l'Accessibility (atteignable a 100)</h2>
<ol>
<li><strong>Contraste WCAG AA</strong> : verifier toutes les combinaisons texte/fond avec WebAIM</li>
<li><strong>ALT sur toutes les images</strong> : audit via SearchPie</li>
<li><strong>Labels sur tous les inputs</strong> : verifier formulaires de checkout, contact, newsletter</li>
<li><strong>Boutons identifiables</strong> : pas de "Cliquez ici", mais "Voir le produit"</li>
<li><strong>Navigation au clavier</strong> : tester en utilisant uniquement Tab + Enter</li>
<li><strong>Focus visibles</strong> : ring de focus visible sur tous les elements interactifs</li>
<li><strong>Structure semantique</strong> : 1 seul h1, h2 puis h3 (pas de saut h2 -> h4)</li>
</ol>

<h2>Optimiser Best Practices (atteignable a 100)</h2>
<ol>
<li><strong>HTTPS partout</strong> (defaut Shopify)</li>
<li><strong>Zero console error</strong> : tester en DevTools console et corriger les erreurs JS</li>
<li><strong>Pas de console warning</strong> sur ressources deprecated</li>
<li><strong>CSP (Content Security Policy)</strong> : configurer dans theme.liquid pour security headers</li>
<li><strong>Eviter les third-party non securises</strong> (videos non HTTPS, etc.)</li>
</ol>

<h2>Optimiser SEO (atteignable a 100)</h2>
<ol>
<li><strong>Title tag unique</strong> sur chaque page (50-60 caracteres)</li>
<li><strong>Meta description</strong> unique (140-160 caracteres)</li>
<li><strong>1 seul H1 par page</strong></li>
<li><strong>robots.txt valide</strong> et accessible</li>
<li><strong>sitemap.xml</strong> valide et soumis a Search Console</li>
<li><strong>HTTPS</strong> (defaut)</li>
<li><strong>Texte lisible</strong> (12px minimum, idealement 16px)</li>
<li><strong>Tap targets</strong> 48x48px minimum sur mobile</li>
</ol>

<h2>Methodologie d'audit recurrent</h2>

<h3>Audit mensuel (30 min)</h3>
<ol>
<li>PageSpeed Insights sur les 5 pages les plus visitees</li>
<li>Noter les scores dans un tableau</li>
<li>Identifier les regressions</li>
<li>Corriger les regressions critiques (-5 points et plus)</li>
</ol>

<h3>Audit trimestriel (4 heures)</h3>
<ol>
<li>Lighthouse complet sur 15-20 pages representatives</li>
<li>Audit detail des opportunites listees</li>
<li>Plan d'action priorise selon impact/effort</li>
<li>Implementation de 3-5 chantiers</li>
<li>Re-audit pour mesurer le gain</li>
</ol>

<h3>Audit annuel (2-5 jours)</h3>
<ol>
<li>Audit complet par expert performance</li>
<li>Comparaison avec concurrents</li>
<li>Refonte technique si necessaire (changement de theme, suppression d'apps massives)</li>
</ol>

<blockquote>Le score Lighthouse 90+ n'est pas une fin en soi. C'est un indicateur que vous offrez une experience utilisateur excellente. Vos clients ressentent la difference meme s'ils ne sauraient pas l'expliquer.</blockquote>

<h2>FAQ</h2>
<p><strong>Le score Lighthouse peut-il atteindre 100 sur Shopify ?</strong></p>
<p>Difficile en performance (75-90 realiste), facile en SEO/Accessibility/Best Practices (95-100). Sur les 3 derniers, 100 est l'objectif standard.</p>

<p><strong>Mon score est bon en lab mais mauvais en field (CrUX). Pourquoi ?</strong></p>
<p>Les utilisateurs reels ont des connexions et appareils varies. Si CrUX est rouge, optimisez pour les pires conditions (3G slow, Moto G4). Testez Lighthouse en mode "Slow 4G" et "Moto G4" pour reproduire ces conditions.</p>

<p>Vous voulez un audit Lighthouse complet et un plan d'action ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
            {'title': "Hardening securite : 2FA, captcha, audit logs",
             'duration': 18,
             'content_html': """<p>Au-dela de la securite de base (couverte dans le module 3), le <strong>hardening</strong> consiste a appliquer des couches supplementaires de protection. Cette lecon vous donne les 8 mesures de hardening avancees a appliquer sur votre boutique Shopify pour atteindre un niveau "entreprise".</p>

<h2>1. 2FA renforcee : cles physiques YubiKey</h2>
<p>Au-dela de Google Authenticator (excellent), pour les comptes admin critiques, investissez dans des <strong>cles YubiKey</strong> :</p>
<ul>
<li><strong>YubiKey 5C NFC</strong> : 50-60 EUR, USB-C + NFC pour smartphone</li>
<li><strong>YubiKey 5 NFC</strong> : 45-55 EUR, USB-A + NFC</li>
<li><strong>Security Key NFC by Yubico</strong> : 25-30 EUR, version economique</li>
</ul>

<p>Achetez <strong>2 cles</strong> par compte critique : 1 active + 1 backup dans coffre-fort. Si perte de la principale, vous gardez l'acces.</p>

<p>Configuration : Compte > Securite > 2FA > Cle de securite > suivre les instructions Shopify.</p>

<h2>2. Captcha au checkout (anti-bot)</h2>
<p>Shopify Plus inclut un captcha invisible (reCAPTCHA v3) au checkout. Sur Shopify Basic, vous pouvez l'ajouter via :</p>
<ul>
<li><strong>Captcha Solver</strong> (app) : 19 USD/mois</li>
<li><strong>Bot Squasher</strong> : 29 USD/mois, detection comportementale</li>
<li><strong>Cloudflare Bot Management</strong> (avance) : si vous mettez Cloudflare devant Shopify</li>
</ul>

<p>Indications d'attaque bot a surveiller :</p>
<ul>
<li>Pic anormal de creations de compte</li>
<li>Multiples checkouts abandonnes avec emails generiques</li>
<li>Cartes test (4242 4242 4242 4242) recurrentes</li>
<li>Tentatives de validation de cartes volees</li>
</ul>

<h2>3. Liste de blocage IP et pays</h2>
<p>Si vous identifiez des IP suspectes ou des pays d'ou vous ne vendez pas :</p>
<ul>
<li>App <strong>Blocky</strong> (10-29 USD/mois) : blocage IP / pays</li>
<li><strong>Shopify Plus</strong> : fonctionnalite native</li>
<li><strong>Cloudflare</strong> devant Shopify : controle granulaire</li>
</ul>

<p>Pays a haut risque de fraude e-commerce : selon Sift 2025, les top 5 pays generateurs de chargebacks sont varies selon votre niche. Verifiez vos donnees.</p>

<h2>4. Audit logs et tracking equipe</h2>

<h3>Logs natifs Shopify Plus</h3>
<p>Acces a tous les logs admin : qui a modifie quoi, quand, depuis quelle IP. Activez pour audit forensique en cas de probleme.</p>

<h3>Apps audit log pour Basic/Advanced</h3>
<ul>
<li><strong>Logbook</strong> : 9-29 USD/mois, tracking complet</li>
<li><strong>QuickFlow Audit Logs</strong> : 14 USD/mois</li>
<li><strong>Order Locker</strong> : verrouille des champs critiques de commande contre modification</li>
</ul>

<h2>5. Webhooks et alertes</h2>
<p>Configurez des webhooks Shopify vers Slack ou Discord pour notifications temps reel :</p>
<ul>
<li>Nouvelle commande high risk</li>
<li>Tentative de remboursement >500 EUR</li>
<li>Modification de prix produit</li>
<li>Suppression de produit</li>
<li>Installation/desinstallation d'app</li>
</ul>

<p>Implementation via Shopify Flow (gratuit Shopify Basic+) ou Zapier (20 USD/mois).</p>

<h2>6. Test de penetration et bug bounty</h2>

<h3>Pour boutiques mature (>500 K EUR CA)</h3>
<ul>
<li><strong>Pentest annuel</strong> : 5 000-15 000 EUR par agence specialisee. Identifie vulnerabilites custom.</li>
<li><strong>Bug bounty program</strong> via HackerOne ou Bugcrowd : payez 100-5 000 EUR par vulnerabilite trouvee.</li>
</ul>

<h3>Pour boutiques debutantes</h3>
<ul>
<li>Audit de base via outils gratuits : <strong>OWASP ZAP</strong>, <strong>Burp Suite Community</strong></li>
<li>Verification SSL via <strong>SSL Labs</strong> (doit etre A+)</li>
<li>Verification security headers via <strong>securityheaders.com</strong></li>
</ul>

<h2>7. Sauvegarde + reproduction d'environnement</h2>
<p>Au-dela de Rewind (module precedent), pour les operations critiques :</p>
<ul>
<li>Theme cloning systematique avant modifications</li>
<li>Test sur boutique de developpement (Shopify Partners offre gratuit)</li>
<li>Validation en staging avant production</li>
</ul>

<p>Une boutique de test Shopify Partners est gratuite et illimitee. Indispensable pour tester les nouvelles apps sans risquer la prod.</p>

<h2>8. Formation equipe et social engineering</h2>
<p>La plupart des compromissions viennent du social engineering :</p>
<ul>
<li>Email phishing usurpant Shopify</li>
<li>SMS demandant un code 2FA</li>
<li>Appels telephoniques se faisant passer pour le support Shopify</li>
</ul>

<h3>Regles a inculquer a votre equipe</h3>
<ol>
<li><strong>Shopify ne demande jamais</strong> votre mot de passe par email ou telephone</li>
<li><strong>Verifier l'URL</strong> avant de saisir credentials (admin.shopify.com uniquement)</li>
<li><strong>Ne jamais partager</strong> les codes 2FA, meme avec un collegue</li>
<li><strong>Signaler immediatement</strong> tout email suspect au admin senior</li>
<li><strong>Mettre a jour</strong> regulierement les mots de passe (90 jours)</li>
</ol>

<h2>Plan de hardening 30-60-90 jours</h2>

<h3>Jour 1-30 (basiques)</h3>
<ul>
<li>2FA active sur tous les comptes</li>
<li>Permissions equipe auditees</li>
<li>SPF/DKIM/DMARC configures sur email</li>
<li>Banniere cookies conforme</li>
<li>Rewind installe</li>
</ul>

<h3>Jour 31-60 (intermediaires)</h3>
<ul>
<li>YubiKey pour comptes admin</li>
<li>App audit log installee</li>
<li>Webhooks de notification configures</li>
<li>Captcha au checkout si bot detectes</li>
<li>Formation equipe documentee</li>
</ul>

<h3>Jour 61-90 (avances)</h3>
<ul>
<li>Test de penetration leger (OWASP ZAP)</li>
<li>Audit security headers (SecurityHeaders.com A+)</li>
<li>Plan de continuite documente</li>
<li>Exercice "incident" simule</li>
</ul>

<blockquote>La securite parfaite n'existe pas, mais 90 % des attaques ciblent les boutiques aux defenses faibles. En appliquant ces 8 mesures, vous devenez 10x plus difficile a compromettre. Les attaquants passent leur chemin vers une cible plus facile.</blockquote>

<h2>FAQ</h2>
<p><strong>Combien coute la securite avancee d'une boutique Shopify ?</strong></p>
<p>Budget realiste : <strong>50-100 EUR/mois en apps</strong> + <strong>150-200 EUR/an en hardware</strong> (YubiKeys) + <strong>2 000-10 000 EUR/an en pentest</strong> (a partir de >500 K EUR CA). Pour boutique debutante : 50 EUR/mois suffit.</p>

<p><strong>Que faire si je decouvre une vulnerabilite Shopify ?</strong></p>
<p>Signalez via le programme bug bounty officiel de Shopify : <strong>HackerOne shopify program</strong>. Les recompenses vont de 500 a 50 000 USD selon gravite. Ne publiez jamais la vulnerabilite publiquement avant correction.</p>

<p>Vous voulez un audit de hardening complet ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
            {'title': "Configurer un CDN (Cloudflare) gratuit",
             'duration': 18,
             'content_html': """<p>Un CDN (Content Delivery Network) accelere votre site en servant le contenu depuis des serveurs proches de vos visiteurs. Bonne nouvelle pour les marchands Shopify : <strong>vous avez deja un CDN excellent inclus</strong> (Fastly + Cloudflare). Mais ajouter Cloudflare en surcouche peut apporter des avantages additionnels en securite et controle. Cette lecon vous explique quand et comment.</p>

<h2>Le CDN Shopify natif (deja inclus)</h2>
<p>Shopify utilise <strong>Fastly</strong> comme CDN principal, avec 50+ points de presence mondiaux. Caracteristiques :</p>
<ul>
<li>Servir images, CSS, JS depuis le serveur le plus proche</li>
<li>Cache intelligent (statique = forever, dynamique = court)</li>
<li>Compression Brotli et Gzip</li>
<li>HTTP/3 et QUIC supportes</li>
<li>Optimisation automatique des images (WebP/AVIF)</li>
<li>SSL/TLS 1.3</li>
</ul>

<p>Pour 80 % des marchands Shopify, le CDN natif suffit largement. <strong>Pas besoin d'ajouter Cloudflare</strong>.</p>

<h2>Quand ajouter Cloudflare en surcouche ?</h2>

<h3>Use cases legitimes</h3>
<ul>
<li><strong>Protection DDoS premium</strong> : Cloudflare offre une protection DDoS plus puissante que celle de Shopify pour les attaques tres sophistiquees</li>
<li><strong>WAF (Web Application Firewall)</strong> personnalise avec regles avancees</li>
<li><strong>Bot Management avance</strong> : detection et blocage de bots fins</li>
<li><strong>Rate limiting</strong> personnalise par endpoint</li>
<li><strong>Geo-restriction</strong> avancee (bloquer 50 pays specifiques)</li>
<li><strong>Audit logs</strong> de tous les requests</li>
<li><strong>Workers</strong> pour edge computing (modifications a la volee)</li>
</ul>

<h3>Use cases NON pertinents</h3>
<ul>
<li>"Accelerer mon site" : non, Fastly est deja excellent</li>
<li>"Meilleur SEO" : non, aucun impact direct</li>
<li>"Moins cher" : Shopify CDN est gratuit, Cloudflare ajoute des couts (60+ USD/mois pour Pro)</li>
</ul>

<h2>Configuration Cloudflare devant Shopify (avance)</h2>

<h3>Etape 1 : Compte Cloudflare</h3>
<p>Creez un compte sur cloudflare.com (gratuit). Plan recommande pour Shopify :</p>
<ul>
<li><strong>Free</strong> : limite, surtout SSL et cache basique. Suffit pour debuter.</li>
<li><strong>Pro (20 USD/mois)</strong> : Image Resizing, WAF basique, support 24/7</li>
<li><strong>Business (200 USD/mois)</strong> : SSL custom, support prioritaire, regles avancees</li>
<li><strong>Enterprise</strong> : pour gros volumes, contrat negocie</li>
</ul>

<h3>Etape 2 : Ajouter votre domaine</h3>
<p>Add a Site > votre-domaine.com > Cloudflare scanne les DNS existants > vous validez.</p>

<h3>Etape 3 : Changer les nameservers</h3>
<p>Chez votre registrar (Cloudflare Registrar, OVH, Porkbun), remplacez les nameservers par ceux de Cloudflare :</p>
<ul>
<li>ns1.cloudflare.com (exemple)</li>
<li>ns2.cloudflare.com (exemple)</li>
</ul>

<p>Propagation : 1 a 24 heures. Verifiez avec dnschecker.org.</p>

<h3>Etape 4 : Configurer les enregistrements pour pointer vers Shopify</h3>
<ul>
<li>A record <code>@</code> -> 23.227.38.65 (IP Shopify)</li>
<li>CNAME <code>www</code> -> shops.myshopify.com</li>
</ul>

<p>Important : pour ces enregistrements, <strong>desactivez le proxy Cloudflare</strong> (nuage gris, pas orange). Sinon, Shopify ne peut pas servir SSL correctement.</p>

<h3>Etape 5 : Configurer SSL/TLS</h3>
<ul>
<li>Mode SSL : <strong>Full</strong> (chiffrement de bout en bout)</li>
<li>Always Use HTTPS : ON</li>
<li>Min TLS Version : 1.2</li>
<li>HSTS : ON (apres validation que tout fonctionne)</li>
</ul>

<h3>Etape 6 : WAF et securite</h3>
<ul>
<li>Activer "Bot Fight Mode" (gratuit) ou "Super Bot Fight Mode" (Pro)</li>
<li>Security Level : Medium par defaut</li>
<li>Challenge Passage : 30 minutes</li>
<li>Configurer des firewall rules selon besoins</li>
</ul>

<h3>Etape 7 : Tester en profondeur</h3>
<p>Apres mise en place :</p>
<ol>
<li>Verifier le SSL sur tous les sous-domaines</li>
<li>Tester le checkout end-to-end</li>
<li>Verifier les emails transactionnels</li>
<li>Tester sur 5 pays differents (VPN)</li>
<li>Auditer Lighthouse pour confirmer aucune regression</li>
</ol>

<h2>Limites et risques</h2>

<h3>Limites techniques</h3>
<ul>
<li>Shopify checkout (checkout.shopify.com) <strong>contourne</strong> Cloudflare : pas de protection durant cette etape</li>
<li>Apps tierces avec leurs propres domaines ne passent pas par Cloudflare</li>
<li>Certaines optimisations Cloudflare (Rocket Loader) peuvent casser le JS Shopify</li>
</ul>

<h3>Risques operationnels</h3>
<ul>
<li>Probleme Cloudflare = site indisponible (single point of failure)</li>
<li>Mauvaise configuration peut bloquer vos vrais clients</li>
<li>Frais additionnels potentiels (egress bandwidth, requests)</li>
</ul>

<h2>Alternative : Cloudflare uniquement pour le DNS</h2>
<p>Vous pouvez utiliser Cloudflare uniquement pour la <strong>gestion DNS</strong> (rapide, fiable, gratuit, edition simple) sans activer le proxy. Cela vous donne :</p>
<ul>
<li>DNS rapide (mondial)</li>
<li>Edition simple via interface</li>
<li>Analytics DNS</li>
<li>Email routing (forward gratuit)</li>
<li>Page Rules basiques</li>
</ul>

<p>Sans les inconvenients du proxy. C'est <strong>notre recommandation principale pour 95 % des marchands Shopify</strong>.</p>

<h2>Verdict 2026 pour Shopify</h2>
<ul>
<li><strong>Marchand &lt;500 K EUR CA</strong> : Cloudflare uniquement pour DNS, pas de proxy</li>
<li><strong>Marchand 500 K - 5 M EUR CA</strong> : evaluer Cloudflare Pro si attaques bot recurrentes</li>
<li><strong>Marchand &gt;5 M EUR CA</strong> : Cloudflare Business + Shopify Plus, configuration par expert</li>
</ul>

<blockquote>Le CDN n'est pas un eldorado magique. C'est un outil precis pour des problemes precis. Avant d'ajouter Cloudflare, identifiez clairement le probleme que vous voulez resoudre. Sinon, vous ajoutez complexite sans benefice.</blockquote>

<h2>FAQ</h2>
<p><strong>Cloudflare gratuit suffit-il ?</strong></p>
<p>Pour le DNS et la protection basique oui. Pour DDoS sophistique ou bot management avance : Pro minimum.</p>

<p><strong>Risque de casser ma boutique en activant Cloudflare ?</strong></p>
<p>Oui, risque reel. Faites les changements en heure creuse (3h du matin), avec checkout testes immediatement. Gardez une procedure de rollback (changement nameservers back) sous la main.</p>

<p>Besoin d'aide pour configurer Cloudflare devant Shopify ? <a href="/contact">Reservez un audit gratuit</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
            {'title': "Migration sans casse : du local au serveur prod",
             'duration': 18,
             'content_html': """<p>Une migration Shopify peut prendre plusieurs formes : migration depuis une autre plateforme (WooCommerce, Magento, PrestaShop), migration de domaine, ou refonte complete du theme. Mal preparee, elle vous coute en SEO, conversions et temps. Bien planifiee, elle est invisible pour vos clients. Cette lecon vous donne la methodologie complete pour migrer sans casse.</p>

<h2>Type 1 : Migration vers Shopify depuis une autre plateforme</h2>

<h3>Plateformes sources courantes</h3>
<ul>
<li>WooCommerce (WordPress)</li>
<li>Magento 1 ou 2</li>
<li>PrestaShop</li>
<li>BigCommerce</li>
<li>Wix Stores</li>
<li>Squarespace Commerce</li>
<li>Custom-built sites</li>
</ul>

<h3>Outils de migration</h3>

<h4>Cart2Cart (recommande)</h4>
<ul>
<li><strong>Cout</strong> : 49-1 800 USD selon volume</li>
<li><strong>Migre</strong> : produits, categories, clients, commandes, avis, blog</li>
<li><strong>Duree</strong> : 1-48 heures selon taille</li>
<li><strong>Demo gratuite</strong> : tester avec 10 produits avant achat</li>
</ul>

<h4>LitExtension</h4>
<ul>
<li><strong>Cout</strong> : 49-2 500 USD</li>
<li><strong>Plus complet</strong> que Cart2Cart pour gros volumes</li>
<li><strong>Service managed</strong> : leurs experts font tout (1 500-5 000 USD)</li>
</ul>

<h4>Migration manuelle (CSV)</h4>
<ul>
<li>Export CSV depuis source</li>
<li>Mapping vers format Shopify (template officiel)</li>
<li>Import dans Shopify Admin > Produits > Import</li>
<li>Long, fastidieux, mais gratuit</li>
</ul>

<h2>Methodologie de migration en 12 etapes</h2>

<h3>Phase 1 : Preparation (1-2 semaines)</h3>

<h4>Etape 1 : Audit complet de l'existant</h4>
<ul>
<li>Inventaire produits, categories, pages, articles blog</li>
<li>Crawl complet avec Screaming Frog (5 000 URLs gratuit)</li>
<li>Export Google Analytics : pages visitees, sources de trafic, conversions</li>
<li>Export Search Console : keywords, positions, CTR, impressions</li>
<li>Documentation des redirections existantes</li>
</ul>

<h4>Etape 2 : Strategie SEO de migration</h4>
<ul>
<li>Plan de redirection 301 ancienne URL -> nouvelle URL (1-pour-1)</li>
<li>Conservation des URLs identiques si possible (rare)</li>
<li>Sauvegarde meta titles et descriptions</li>
<li>Audit des backlinks (a preserver)</li>
</ul>

<h4>Etape 3 : Setup environnement Shopify</h4>
<ul>
<li>Creation boutique Shopify (Basic ou Plus selon volume)</li>
<li>Theme installe et personnalise</li>
<li>Apps essentielles configurees</li>
<li>Pages legales generees</li>
<li>Paiements configures (en mode test)</li>
</ul>

<h3>Phase 2 : Migration des donnees (1-3 semaines)</h3>

<h4>Etape 4 : Import des produits</h4>
<ol>
<li>Choisir Cart2Cart, LitExtension ou CSV manuel</li>
<li>Lancer une demo avec 10 produits pour valider</li>
<li>Verifier : titre, description, prix, variants, images, SKU, stock, ALT texts</li>
<li>Corriger les mappings si necessaire</li>
<li>Lancer migration complete</li>
<li>Audit post-migration (verifier 50 produits aleatoirement)</li>
</ol>

<h4>Etape 5 : Import des clients</h4>
<p>Attention RGPD :</p>
<ul>
<li>Vous pouvez importer les clients existants legitimes (achat anterieur)</li>
<li>Mots de passe NE PEUVENT PAS etre importes (hash different)</li>
<li>Les clients devront reset leur mot de passe au premier login</li>
<li>Envoyer un email de communication 1 semaine avant migration</li>
</ul>

<h4>Etape 6 : Import historique commandes</h4>
<ul>
<li>Necessaire pour service client (reclamations, retours)</li>
<li>Cart2Cart le fait nativement</li>
<li>Garder l'historique 5-10 ans (obligations legales)</li>
</ul>

<h4>Etape 7 : Import blog</h4>
<ul>
<li>Articles, categories, auteurs, tags</li>
<li>Cart2Cart le fait pour WordPress</li>
<li>Verifier les images integrees</li>
<li>Mettre a jour les internal links</li>
</ul>

<h3>Phase 3 : Configuration technique (1 semaine)</h3>

<h4>Etape 8 : Redirections 301</h4>
<p>Crucial pour conserver le SEO. Dans Shopify : <strong>Boutique en ligne > Navigation > URL redirections</strong>.</p>

<p>Pour gros volumes, utiliser l'app <strong>Easy Redirects</strong> (15 USD/mois) ou import CSV en masse :</p>
<ul>
<li>De : /old-product-url</li>
<li>Vers : /products/new-product-handle</li>
</ul>

<p>Verifier toutes les redirections fonctionnent avec un crawler (Screaming Frog).</p>

<h4>Etape 9 : Migration meta titles/descriptions</h4>
<p>Soit via Cart2Cart (automatique), soit manuellement pour les pages cles. Garantir que chaque page critique conserve ses balises SEO optimisees.</p>

<h4>Etape 10 : Reconfiguration analytics</h4>
<ul>
<li>Installer GA4 sur Shopify</li>
<li>Reconfigurer les conversions e-commerce</li>
<li>Reconfigurer Search Console (verifier le nouveau domaine)</li>
<li>Soumettre le nouveau sitemap.xml</li>
<li>Reinstaller le Pixel Meta et Google Ads tag</li>
</ul>

<h3>Phase 4 : Lancement et post-migration (2 semaines)</h3>

<h4>Etape 11 : Switch DNS (le moment critique)</h4>
<ol>
<li>Choisir une fenetre creuse (nuit semaine)</li>
<li>Reduire le TTL DNS a 60 secondes 24h avant</li>
<li>Modifier les enregistrements A et CNAME vers Shopify</li>
<li>Propagation : 1-4 heures generalement</li>
<li>Verifier sur 5+ pays (DNS checker, VPN)</li>
<li>Confirmer le SSL fonctionne</li>
<li>Realiser une commande test reelle</li>
</ol>

<h4>Etape 12 : Monitoring intensif 14 jours</h4>
<ul>
<li>Search Console : verifier l'absence de 404 massifs</li>
<li>GA4 : suivre le trafic et alerter en cas de chute &gt;30 %</li>
<li>Search positions : monitoring keywords cles (Ahrefs/Semrush)</li>
<li>Conversion rate : alerter en cas de chute &gt;20 %</li>
<li>Tickets support : verifier les feedbacks clients</li>
<li>Apps : ajustements config selon comportement reel</li>
</ul>

<h2>Erreurs courantes a eviter</h2>
<ol>
<li><strong>Pas de plan de redirection</strong> : perte de 30-60 % du trafic SEO</li>
<li><strong>URLs differentes sans 301</strong> : Google considere comme nouveau site</li>
<li><strong>Migration le vendredi soir</strong> : panique le weekend si probleme</li>
<li><strong>Pas de boutique de test</strong> avant prod</li>
<li><strong>Pas de communication aux clients</strong> : retours en panique</li>
<li><strong>Apps installees apres la migration</strong> : tester avant</li>
<li><strong>Ne pas garder l'ancien site 30 jours</strong> en mode lecture seule pour reference</li>
</ol>

<h2>Budget realiste de migration</h2>
<ul>
<li><strong>Petite boutique (<100 produits, <500 commandes)</strong> : 500-2 000 EUR (DIY ou freelance)</li>
<li><strong>Moyenne (100-1 000 produits, 500-5 000 commandes)</strong> : 3 000-8 000 EUR (agence)</li>
<li><strong>Grande (1 000+ produits, 5 000+ commandes)</strong> : 10 000-50 000 EUR (agence specialisee)</li>
</ul>

<blockquote>Une migration ratee peut couter 6 mois de revenus en chute SEO. Une migration reussie peut au contraire <strong>doubler vos conversions</strong> grace a l'experience Shopify superieure. L'investissement de preparation se rentabilise en 60 jours.</blockquote>

<h2>FAQ</h2>
<p><strong>Combien de temps prend une migration complete ?</strong></p>
<p>4-12 semaines en moyenne :</p>
<ul>
<li>1-2 semaines preparation</li>
<li>1-3 semaines migration donnees</li>
<li>1-2 semaines tests + config</li>
<li>1-2 semaines lancement + stabilisation</li>
</ul>

<p><strong>Vais-je perdre mon SEO en migrant ?</strong></p>
<p>Si vous suivez la methodologie : chute temporaire de 10-25 % pendant 2-6 semaines, puis recuperation et generalement <strong>amelioration de 15-40 %</strong> grace a la qualite technique de Shopify. Si vous bâclez : perte permanente de 40-70 %.</p>

<p>Vous preparez une migration vers Shopify ? <a href="/contact">Reservez un audit gratuit de migration</a> ou <a href="/rendez-vous">prenez RDV avec un expert</a>.</p>"""},
        ],
    },
]
