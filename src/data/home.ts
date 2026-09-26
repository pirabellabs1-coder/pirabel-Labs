// Contenus de la page d'accueil (repris du site actuel, relus et corrigés).

export const HERO_PROOF = [
  { icon: 'check', text: '150+ projets livrés' },
  { icon: 'trending', text: '+187 % de leads en moyenne' },
  { icon: 'clock', text: 'Réponse sous 24 h' },
  { icon: 'sparkles', text: 'SEO · IA · Web' },
];

export const TOOLS = [
  'Next.js', 'React', 'Node.js', 'WordPress', 'Elementor Pro', 'Webflow', 'Supabase',
  'Make', 'n8n', 'Zapier', 'OpenAI', 'Claude', 'Voiceflow', 'Systeme.io', 'ClickFunnels',
  'Brevo', 'HubSpot', 'Mailchimp', 'Klaviyo', 'Stripe', 'Search Console', 'Google Analytics 4',
  'Ahrefs', 'Semrush', 'Meta Ads', 'Google Ads', 'TikTok Ads',
];

// Passerelle vers le formulaire de qualification (/contact?projet=…)
export const QUICK_START = [
  { id: 'site', icon: 'code', label: 'Un site web', hint: 'Vitrine, WordPress, sur mesure' },
  { id: 'ecommerce', icon: 'cart', label: 'Une boutique en ligne', hint: 'Paiement carte et Mobile Money' },
  { id: 'app', icon: 'rocket', label: 'Une application ou un SaaS', hint: 'MVP en quelques semaines' },
  { id: 'seo', icon: 'search', label: 'Être trouvé sur Google', hint: 'SEO, SEO local, fiche Google' },
  { id: 'ads', icon: 'megaphone', label: 'De la publicité en ligne', hint: 'Google, Meta, TikTok Ads' },
  { id: 'social', icon: 'message', label: 'Des réseaux sociaux qui vendent', hint: 'Contenus et animation' },
  { id: 'automation', icon: 'workflow', label: 'Automatiser avec l’IA', hint: 'Make, n8n, agents IA' },
  { id: 'video', icon: 'video', label: 'Des vidéos qui captent', hint: 'Réels, TikTok, YouTube' },
];

export const EXPERTISES = [
  {
    kicker: 'Pirabel Sites',
    title: 'Des sites pensés pour convertir, rapides et bien référencés.',
    text: 'Sites vitrines, e-commerce et applications web sur mesure : nous transformons votre vision en plateforme rapide, optimisée pour le SEO et taillée pour vos objectifs business.',
    combo: 'Design unique, code propre, ROI mesurable.',
    href: '/creation-site-web',
    cta: 'Découvrir la création de sites',
    visual: 'site',
  },
  {
    kicker: 'Pirabel SEO',
    title: 'Le référencement qui vise la première page de Google.',
    text: 'Audit technique, recherche de mots-clés, contenu éditorial et netlinking éthique : nous positionnons votre marque sur les requêtes qui transforment vos visiteurs en clients.',
    combo: 'Technique, contenu et autorité.',
    href: '/seo',
    cta: 'Explorer notre méthode SEO',
    visual: 'seo',
  },
  {
    kicker: 'Pirabel Ads',
    title: 'Une acquisition payante où chaque euro investi est suivi.',
    text: 'Campagnes Google Ads, Meta Ads et TikTok Ads, tunnels de vente, landing pages et automatisation : nous orchestrons votre acquisition pour transformer le budget publicitaire en chiffre d’affaires.',
    combo: 'Tunnels, publicité et automatisation.',
    href: '/tunnels-de-vente',
    cta: 'Explorer nos tunnels de vente',
    visual: 'ads',
  },
  {
    kicker: 'Pirabel Social',
    title: 'Des réseaux sociaux qui deviennent de vrais leviers business.',
    text: 'Instagram, TikTok, LinkedIn, Facebook : ligne éditoriale forte, calendrier maîtrisé, création, animation et reporting pour faire grandir votre audience et générer du trafic qualifié.',
    combo: 'Contenu créatif, animation, reporting.',
    href: '/community-management',
    cta: 'Voir le community management',
    visual: 'social',
  },
];

export const SERVICES = [
  { icon: 'code', title: 'Sites web sur mesure', text: 'Sites institutionnels et e-commerce développés en code (Next.js, React). Performance maximale, design unique, évolutif.', href: '/creation-site-web' },
  { icon: 'rocket', title: 'Applications web', text: 'Web apps, SaaS et MVP en 6 semaines. Stack moderne Next.js, Node et Postgres. Code documenté et évolutif.', href: '/creation-application-web' },
  { icon: 'search', title: 'SEO et référencement', text: 'Audit technique, stratégie de contenu, netlinking éthique. Du trafic qualifié qui convertit, mesurable mois après mois.', href: '/seo' },
  { icon: 'message', title: 'Community management', text: 'Stratégie, contenus et animation sur Facebook, Instagram, LinkedIn et TikTok. Ligne éditoriale, calendrier, reporting.', href: '/community-management' },
  { icon: 'workflow', title: 'Automatisation marketing', text: 'Make, n8n, Zapier, agents IA, chatbots. Vos équipes économisent 10 à 30 h par semaine sur les tâches répétitives.', href: '/automatisation-marketing' },
  { icon: 'funnel', title: 'Tunnels de vente', text: 'Landing pages à haute conversion, tunnels de génération de leads, optimisation et tests A/B. Plus de ventes mesurées.', href: '/tunnels-de-vente' },
  { icon: 'globe', title: 'Sites WordPress', text: 'Sites vitrines, WooCommerce et blogs avec WordPress et Elementor Pro, pour les PME qui veulent gérer leur contenu.', href: '/creation-site-wordpress' },
  { icon: 'pin', title: 'Fiche Google Business', text: 'Création et optimisation de votre fiche Google : top 3 du pack local, gestion des avis, citations NAP.', href: '/fiche-google-business' },
  { icon: 'video', title: 'Montage vidéo', text: 'Réels, TikTok, YouTube, films d’entreprise. Tournage sur place ou montage seul. Sous-titrage, motion design, habillage.', href: '/montage-video' },
  { icon: 'mail', title: 'E-mail marketing et CRM', text: 'Brevo, Mailchimp, HubSpot. Séquences de nurturing, segmentation, tests A/B. Mise en place du CRM et intégrations.', href: '/email-marketing-crm' },
  { icon: 'compass', title: 'Conseil marketing', text: 'Audit, stratégie, accompagnement. Sessions ponctuelles ou suivi mensuel pour piloter votre croissance.', href: '/consulting-marketing' },
];

export const AUDIT_POINTS = [
  'Audit SEO technique et éditorial de votre site actuel',
  'Analyse de vos canaux d’acquisition (organique, publicité, réseaux sociaux)',
  'Plan d’action sur 90 jours, priorisé et chiffré en EUR ou en FCFA',
  'Actions rapides applicables sans nous',
];

export const CASES = [
  {
    tag: 'PropTech · Immobilier',
    title: 'Kaabo — plateforme immobilière',
    text: 'Plateforme immobilière Next.js et Supabase pour l’Afrique de l’Ouest : annonces vérifiées, paiements sécurisés par séquestre et contrats numériques.',
    stats: [{ k: 'Séquestre', v: 'paiements protégés' }, { k: '3 profils', v: 'propriétaires, locataires, étudiants' }],
    href: '/realisations/kaza-la-plateforme-immobiliere-qui-securise-la-location-en-afrique-de-l-ouest',
    image: '/media/6a4536c88a05af5e91c7ff69',
    hue: 18,
  },
  {
    tag: 'Marketplace · SaaS',
    title: 'FreelanceHigh — marketplace freelance',
    text: 'Place de marché bilingue et multidevise : profils vérifiés, messagerie en temps réel et paiement sous séquestre (Stripe, Mobile Money, crypto).',
    stats: [{ k: 'Séquestre', v: 'transactions protégées' }, { k: 'Multidevise', v: 'EUR · FCFA · USD · GBP' }],
    href: '/realisations/freelancehigh-la-marketplace-freelance-qui-securise-chaque-transaction',
    image: '/media/6a4539c5c3cc3ca6d4457bb8',
    hue: 32,
  },
  {
    tag: 'EdTech · E-commerce',
    title: 'Novakou — produits digitaux',
    text: 'Marketplace no-code pour les créateurs d’Afrique francophone : formations, e-books et coachings, paiement Mobile Money et assistant IA intégré.',
    stats: [{ k: '10 %', v: 'de commission, zéro abonnement' }, { k: 'Mobile Money', v: 'Wave · Orange · MTN' }],
    href: '/realisations/novakou-vendre-ses-formations-et-produits-digitaux-en-afrique-francophone',
    image: '/media/6a452a9022a010ccdcf037d3',
    hue: 8,
  },
];

export const COMMITMENTS = [
  {
    n: '01', kicker: 'Contrat', icon: 'file',
    title: 'Devis ferme sous 48 h, contrat écrit clair',
    text: 'Pas de « selon devis » en cours de route. Prix fixe, périmètre défini, planning de livraison documenté. Tout est écrit dès le départ.',
    points: ['Périmètre détaillé : inclus et exclu', 'Planning par sprint hebdomadaire', 'Conditions d’évolution écrites à l’avance'],
  },
  {
    n: '02', kicker: 'Réactivité', icon: 'zap',
    title: 'Réponse sous 4 h en jours ouvrés',
    text: 'Vous n’attendez pas trois jours pour un retour. Fondateur dédié, ligne WhatsApp directe pour les questions courtes, démo en visio chaque vendredi pendant les sprints.',
    points: ['Le fondateur est joignable, pas un commercial', 'WhatsApp, e-mail et Notion partagé', 'Démo visio hebdomadaire'],
  },
  {
    n: '03', kicker: 'Propriété', icon: 'lock',
    title: 'Le code et les designs vous appartiennent',
    text: 'Une fois la facture réglée, tout est à vous : code source, maquettes Figma, éléments graphiques, documentation, accès administrateur et hébergement. Aucun verrou.',
    points: ['Code source remis sur votre dépôt Git', 'Maquettes Figma intégralement transférées', 'Accès administrateur sous votre seul contrôle'],
  },
  {
    n: '04', kicker: 'Garantie', icon: 'shield',
    title: 'Garantie de 30 jours après la livraison',
    text: 'Tout bug imputable à notre travail est corrigé gratuitement pendant 30 jours après la mise en production. Sans condition, sans facturation supplémentaire.',
    points: ['Bugs corrigés sous 48 h ouvrées', 'Aucune condition, aucun coût caché', 'Documentation de prise en main remise'],
  },
];

export const STEPS = [
  { n: '01', title: 'Appel découverte', text: '30 minutes en visio avec le fondateur. Vous exposez vos besoins, votre contexte et vos objectifs. Sans engagement, sans script de vente.', meta: '30 minutes, gratuit' },
  { n: '02', title: 'Cadrage et devis ferme', text: 'Sous 48 h, vous recevez un plan détaillé : périmètre, planning, budget fixe et évolutions possibles. Pas de « selon devis » en cours de route.', meta: 'Sous 48 h' },
  { n: '03', title: 'Sprints hebdomadaires', text: 'Lancement puis sprints d’une semaine. Démo chaque vendredi en visio, ajustements intégrés en continu. Vous voyez l’avancement réel chaque semaine.', meta: '1 à 12 semaines selon le périmètre' },
  { n: '04', title: 'Mise en ligne et formation', text: 'Mise en production accompagnée, formation de votre équipe à la prise en main, documentation écrite remise. Garantie de 30 jours incluse.', meta: 'Garantie 30 jours' },
];

export const RESULTS = [
  { prefix: '+', value: 147, decimals: 0, suffix: ' %', label: 'de leads entrants en moyenne sur 6 mois' },
  { prefix: '', value: 95, decimals: 0, suffix: '+', label: 'de score Lighthouse sur les sites livrés' },
  { prefix: '', value: 22, decimals: 0, suffix: ' h', label: 'économisées par semaine grâce aux automatisations' },
  { prefix: '×', value: 3.2, decimals: 1, suffix: '', label: 'de trafic SEO en moyenne à 12 mois' },
];

export const PRICING = [
  {
    name: 'Projet ponctuel', price: '200 000 FCFA', alt: '1 200 € en Europe', unit: 'à partir de',
    period: '', featured: false,
    points: ['Devis ferme sous 48 h, périmètre défini', '3 réunions de 30 min incluses', 'Documentation et formation à la livraison', 'Garantie 30 jours après la mise en ligne', 'Paiement échelonné 30 / 30 / 40'],
    cta: 'Demander un devis', href: '/contact',
  },
  {
    name: 'Forfait mensuel', price: '150 000 FCFA', alt: '690 € / mois en Europe', unit: 'à partir de',
    period: '/ mois', featured: true,
    points: ['Demandes illimitées sur tous nos services', 'Pause ou arrêt à tout moment', 'Fondateur dédié, réactif sous 4 h', 'Conseil hebdomadaire de 45 min inclus', 'Tableau Notion partagé pour prioriser', 'Reporting mensuel détaillé'],
    cta: 'Choisir cette formule', href: '/contact',
  },
  {
    name: 'Pilotage stratégique', price: '400 000 FCFA', alt: '1 900 € / mois en Europe', unit: 'à partir de',
    period: '/ mois', featured: false,
    points: ['Directeur marketing externalisé dédié', 'Stratégie marketing complète', 'Tous les services du forfait inclus', '2 réunions stratégiques par mois', 'Reporting hebdomadaire et tableaux de bord', 'Accès direct WhatsApp 6 jours sur 7'],
    cta: 'En savoir plus', href: '/contact',
  },
];

export const COMPARISON = {
  cols: ['Freelance', 'Recrutement', 'Autres agences', 'Pirabel Labs'],
  rows: [
    { label: 'Coût mensuel', values: ['4 000 € et plus', '8 000 € et plus', '8 000 € et plus', '30 à 70 % d’économies'] },
    { label: 'Couverture', values: ['1 à 2 spécialités', '1 par poste', 'Variable', 'Toutes au même endroit'] },
    { label: 'Démarrage', values: ['Jours ou semaines', 'Mois', 'Semaines ou mois', 'Quelques heures'] },
    { label: 'Première livraison', values: ['Plusieurs semaines', 'Plusieurs semaines', 'Plusieurs semaines', '1 à 2 semaines'] },
    { label: 'Résiliation', values: ['Complexe', 'Préavis et indemnités', 'Contractuelle', 'À tout moment'] },
  ],
};

// Clients réels (études de cas publiées sur /realisations) : ce que nous avons livré, sans citation ni note inventée.
export const CLIENTS = [
  { name: 'Mickael Romero', role: 'Photographe de mariage · Nice', text: 'Site vitrine bilingue, portfolio de mariages complets et prise de contact pensée pour les futurs mariés.', href: '/realisations/mickael-romero-photographe-de-mariage-a-nice' },
  { name: 'Travisum', role: 'Traduction jurée · Bruxelles', text: 'Site trilingue (FR, NL, EN) avec un assistant qui identifie la démarche en une phrase.', href: '/realisations/travisum-traduction-juree-legalisation-et-visas-a-bruxelles' },
  { name: 'Pirabel — Maison de Cotonou', role: 'Mode et lifestyle · Cotonou', text: 'Boutique en ligne complète : catalogue, compte client, suivi de commande et paiement Mobile Money.', href: '/realisations/pirabel-one-la-boutique-en-ligne-d-une-maison-de-mode-beninoise' },
  { name: 'Kaabo', role: 'Immobilier · Cotonou', text: 'Plateforme de location avec annonces vérifiées, paiement sous séquestre et contrats numériques.', href: '/realisations/kaza-la-plateforme-immobiliere-qui-securise-la-location-en-afrique-de-l-ouest' },
  { name: 'LoueMaRemorque', role: 'Place de marché · France', text: 'Location de remorques entre particuliers : réservation, paiement en ligne et état des lieux photo.', href: '/realisations/louemaremorque-location-de-remorques-entre-particuliers' },
  { name: 'EVKHA', role: 'Formation · France', text: 'Site et tunnels de vente pour accompagner les entrepreneurs à chaque étape de leur création.', href: '/realisations/evkha-accompagnement-et-formations-pour-creer-son-entreprise' },
  { name: 'Callpme', role: 'Agents vocaux IA · France', text: 'Plateforme d’agents vocaux IA qui répondent au téléphone et prennent des rendez-vous, jour et nuit.', href: '/realisations/callpme-l-agent-vocal-ia-qui-repond-a-vos-appels-24h-24' },
  { name: 'Garage Boost', role: 'Garage automobile · Marseille', text: 'Site optimisé pour le référencement local et application de gestion de l’atelier.', href: '/realisations/garage-boost-de-la-vitrine-seo-a-l-application-de-gestion-tout-en-un-pour-garage' },
  { name: 'Novakou', role: 'EdTech · Afrique francophone', text: 'Marketplace pour vendre formations et produits digitaux, avec paiement Mobile Money.', href: '/realisations/novakou-vendre-ses-formations-et-produits-digitaux-en-afrique-francophone' },
  { name: 'Ultimauto', role: 'Entretien automobile · Cholet', text: 'Vitrine web rapide et écosystème en ligne pensés pour transformer les visites en rendez-vous.', href: '/realisations/ultimauto-le-decalaminage-automobile-avec-une-vitrine-web-qui-convertit' },
];

export const SECTORS = ['E-commerce', 'B2B et SaaS', 'Restauration', 'Santé et médical', 'Immobilier', 'Éducation', 'Avocats et conseil', 'Beauté et cosmétique'];

export const CITIES = [
  { href: '/agence-marketing-abomey-calavi', city: 'Abomey-Calavi', meta: 'Bénin · notre siège', hq: true },
  { href: '/agence-marketing-cotonou', city: 'Cotonou', meta: 'Bénin · capitale économique' },
  { href: '/agence-marketing-porto-novo', city: 'Porto-Novo', meta: 'Bénin · capitale politique' },
  { href: '/agence-web-abidjan', city: 'Abidjan', meta: 'Côte d’Ivoire' },
  { href: '/agence-web-dakar', city: 'Dakar', meta: 'Sénégal' },
  { href: '/agence-web-lome', city: 'Lomé', meta: 'Togo' },
  { href: '/agence-web-paris', city: 'Paris', meta: 'France' },
  { href: '/agence-web-lyon', city: 'Lyon', meta: 'France' },
];

export const INSIGHTS = [
  { tag: 'SEO local', title: 'Fiche Google Business : guide complet pour le pack local', text: 'Comment optimiser votre fiche Google Business Profile pour dominer le pack local en moins de 90 jours.', read: '10 min de lecture', href: '/blog/google-business-profile-guide-complet' },
  { tag: 'Sites web', title: 'WordPress, Webflow ou Next.js : quel CMS choisir en 2026 ?', text: 'Comparatif détaillé des trois solutions pour PME et startups francophones : coûts, performances, évolutivité.', read: '12 min de lecture', href: '/blog/wordpress-vs-webflow-vs-nextjs-2026' },
  { tag: 'Automatisation', title: 'Make, n8n ou Zapier : quel outil d’automatisation choisir ?', text: 'Tour d’horizon des scénarios les plus rentables pour une PME et comparatif des trois plateformes leaders.', read: '8 min de lecture', href: '/blog/outils-automatisation-marketing-make-n8n-zapier' },
];

export const FAQ = [
  { q: 'L’externalisation de mon marketing est-elle faite pour moi ?', a: 'Si vous dirigez une PME en croissance et que vous n’avez ni le temps ni l’envie de recruter une équipe marketing complète, oui. Nous le déterminons ensemble lors d’un appel gratuit de 30 minutes : nous regardons votre contexte, votre cible et vos objectifs, et nous vous disons franchement si nous sommes la bonne équipe.' },
  { q: 'Quels résultats attendre concrètement ?', a: 'Pour un site web : mise en ligne en 3 à 6 semaines, score Lighthouse de 95 et plus. Pour l’automatisation : 10 à 30 h économisées par semaine, mesurables en 60 jours. Pour le SEO : premiers signes à 30-60 jours, progression des positions à 3-6 mois. Pour le community management : 5 à 15 % d’engagement en plus par mois si l’on part de zéro.' },
  { q: 'Comment communiquons-nous au quotidien ?', a: 'Un tableau Notion partagé (avancement, priorités, décisions), WhatsApp pour les échanges courts et des démos en visio chaque semaine pendant les sprints. Tous les rendez-vous se font sur Google Meet ou Zoom : pas besoin de vous déplacer.' },
  { q: 'Que signifie « garantie 100 % satisfait » ?', a: 'Avant signature : aucun engagement, l’appel découverte est gratuit. Pendant le projet : si l’on s’éloigne de la cible, nous rectifions lors des sprints hebdomadaires, sans surcoût. Après livraison : garantie de 30 jours sur les bugs imputables à notre travail. Et si vous n’êtes vraiment pas satisfait, nous remboursons les phases non livrées.' },
  { q: 'Pourquoi Pirabel Labs plutôt que recruter en interne ?', a: 'Recruter un développeur senior, un spécialiste SEO, un community manager et un monteur vidéo représente plus de 200 000 € par an de salaires, charges, management et outils. Avec nous, vous accédez à toutes ces expertises pour 1 800 à 4 500 € par mois, sans recruter ni manager.' },
  { q: 'Travaillez-vous avec des clients en France ?', a: 'Oui. Nous accompagnons des PME en France, en Belgique, en Suisse, en Côte d’Ivoire, au Sénégal, au Cameroun, au Maroc, au Canada et bien sûr au Bénin. Le travail se fait entièrement à distance : Zoom ou Google Meet, Notion partagé, démos hebdomadaires.' },
  { q: 'Faites-vous aussi du community management ?', a: 'Oui. Notre force, c’est justement la cohérence : si nous faisons votre site, nous pouvons aussi animer votre communauté avec les mêmes valeurs, la même ligne éditoriale et la même identité visuelle. Pas besoin de réexpliquer quatre fois qui vous êtes.' },
  { q: 'Quels formats vidéo produisez-vous ?', a: 'Réels Instagram et TikTok, YouTube (formats courts et longs), capsules d’entreprise, motion design, tutoriels. Tournage sur place en Afrique de l’Ouest ou montage seul à partir de vos rushes. Sous-titrage et habillage à vos couleurs inclus.' },
  { q: 'Le code et les designs m’appartiennent-ils ?', a: 'Oui, intégralement. Une fois la facture finale réglée, le code, les maquettes Figma, les éléments graphiques, la documentation et les accès administrateur sont entièrement à vous. Aucune licence, aucun verrou.' },
  { q: 'Acceptez-vous le FCFA et le Mobile Money ?', a: 'Oui. Virement, MTN Mobile Money, Moov Money et Wave pour l’Afrique ; virement SEPA et carte bancaire (Stripe) pour l’Europe. Paiement échelonné possible : 30 % au démarrage, 30 % à mi-parcours, 40 % à la livraison.' },
  { q: 'Faut-il des compétences techniques de votre côté ?', a: 'Non. Nous parlons votre langage business, pas le nôtre. Après la livraison, votre équipe utilise le site, l’application ou l’automatisation sans connaissance technique. La formation est incluse.' },
  { q: 'Quelles plateformes et technologies utilisez-vous ?', a: 'Sites : WordPress et Elementor, Webflow, Next.js. Applications : Next.js, React, Node.js, Postgres, Supabase. Automatisation : Make, n8n, Zapier, OpenAI, Claude. E-mail : Brevo, HubSpot, Mailchimp. Tunnels : Systeme.io, ClickFunnels. SEO : Ahrefs, Semrush, Search Console. Vidéo : Premiere Pro, After Effects, CapCut.' },
];
