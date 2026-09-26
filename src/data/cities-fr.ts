/** Contenu local des villes françaises (hors Nice, dans cities.ts). Voir les règles dans cities.ts. */
import type { CityLocal } from './cities';

const PAY_FR = ['Carte bancaire (Stripe)', 'Apple Pay et Google Pay', 'Virement SEPA', 'PayPal', 'Paiement fractionné'];
const LAW_FR = ['RGPD et cookies (CNIL)', 'Mentions légales et CGV', 'Accessibilité numérique', 'Hébergement en Europe'];
const P = {
  romero: 'mickael-romero-photographe-de-mariage-a-nice',
  romeroApp: 'romero-photography-plateforme-sur-mesure-pour-un-photographe-a-nice',
  garage: 'garage-boost-de-la-vitrine-seo-a-l-application-de-gestion-tout-en-un-pour-garage',
  christophe: 'guide-de-mariage-en-ligne-christophe-b-photographe',
  ultimauto: 'ultimauto-le-decalaminage-automobile-avec-une-vitrine-web-qui-convertit',
  voie: 'la-voie-2-la-conscience-une-presence-en-ligne-a-la-hauteur-d-un-accompagnement-d',
  evkha: 'evkha-accompagnement-et-formations-pour-creer-son-entreprise',
  remorque: 'louemaremorque-location-de-remorques-entre-particuliers',
  callpme: 'callpme-l-agent-vocal-ia-qui-repond-a-vos-appels-24h-24',
};
const REMOTE_FR = (city: string) => ({
  q: `Travaillez-vous avec des entreprises de ${city} alors que votre siège est au Bénin ?`,
  a: `Oui, et c’est le cas de la plupart de nos clients français. Tout se fait en visioconférence aux horaires français (même heure que notre siège en hiver, une heure de décalage en été), avec un interlocuteur unique, des devis et des factures en euros et un paiement par virement SEPA ou carte bancaire.`,
});

export const CITIES_FR: Record<string, CityLocal> = {
  paris: {
    name: 'Paris',
    area: 'Paris et l’Île-de-France',
    title: 'Travailler avec nous <span class="grad">depuis Paris</span>',
    intro:
      '<p>À Paris, la concurrence en ligne est la plus dense de France : sur une requête comme « avocat Paris » ou « restaurant Paris 11 », des centaines d’entreprises se disputent les mêmes premières places. La différence se fait sur la vitesse du site, la précision du référencement par arrondissement et la clarté de l’offre dès le premier écran.</p>' +
      '<p>Nous accompagnons des entreprises partout en France, comme <a href="/realisations/louemaremorque-location-de-remorques-entre-particuliers">LoueMaRemorque</a> ou <a href="/realisations/evkha-accompagnement-et-formations-pour-creer-son-entreprise">EVKHA</a>, entièrement à distance : visioconférence aux horaires français, un seul interlocuteur, devis et factures en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Startups et SaaS', 'Conseil et professions libérales', 'Mode, luxe et beauté', 'Restauration et commerce', 'Tourisme et hôtellerie'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Tous les arrondissements', 'La Défense', 'Le Sentier et Station F', 'Petite couronne', 'Toute l’Île-de-France'] },
      { title: 'Paiements intégrés', icon: 'card', items: PAY_FR },
      { title: 'Conformité', icon: 'shield', items: LAW_FR },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">en France</span>', lead: 'Des sites et des plateformes en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.remorque, P.evkha, P.callpme] },
    faq: [
      REMOTE_FR('Paris'),
      { q: 'Comment se démarquer sur Google à Paris, où la concurrence est très forte ?', a: 'En visant juste plutôt qu’en visant large : des pages par arrondissement ou par quartier servi, une fiche Google Business Profile complète, des contenus qui répondent aux vraies questions de vos clients et un site très rapide sur mobile. Les requêtes précises (« traiteur libanais Paris 15 ») convertissent mieux que les requêtes génériques.' },
      { q: 'Vos tarifs sont-ils adaptés au marché parisien ?', a: 'Nos prix de départ sont les mêmes pour toute l’Europe : site vitrine dès 1 200 €, e-commerce dès 2 500 €, SEO dès 590 € par mois. Notre organisation, avec un siège au Bénin, nous permet des tarifs accessibles sans rien céder sur l’exigence : le devis ferme, gratuit, est établi sous 48 h après un appel de cadrage.' },
    ],
  },

  lyon: {
    name: 'Lyon',
    area: 'Lyon et Auvergne-Rhône-Alpes',
    title: 'Travailler avec nous <span class="grad">depuis Lyon</span>',
    intro:
      '<p>Lyon réunit un tissu dense de PME industrielles, de laboratoires de santé, d’entreprises du numérique et une restauration réputée bien au-delà de la ville. Beaucoup de ces entreprises vendent en B2B : leur site doit rassurer un acheteur exigeant, présenter clairement une offre technique et générer des demandes de devis qualifiées.</p>' +
      '<p>Nous travaillons à distance avec des entreprises de toute la France, en visioconférence aux horaires français, avec un interlocuteur unique du cadrage à la mise en ligne, et des devis et factures en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Industrie et PME B2B', 'Santé et biotechnologies', 'Numérique', 'Gastronomie et restauration', 'BTP et immobilier'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Part-Dieu et Presqu’île', 'Confluence', 'Gerland et Vaise', 'Villeurbanne', 'Toute la métropole'] },
      { title: 'Paiements intégrés', icon: 'card', items: PAY_FR },
      { title: 'Conformité', icon: 'shield', items: LAW_FR },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">en France</span>', lead: 'Des sites et des plateformes en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.remorque, P.evkha, P.callpme] },
    faq: [
      REMOTE_FR('Lyon'),
      { q: 'Mon entreprise vend en B2B : que doit faire mon site en priorité ?', a: 'Rassurer et qualifier. Des pages par offre ou par secteur client, des références et des cas concrets, une demande de devis courte mais précise, et un suivi des demandes dans un CRM. Un acheteur B2B compare plusieurs fournisseurs : il doit comprendre en quelques secondes ce que vous faites et pour qui.' },
      { q: 'Pouvez-vous connecter le site à nos outils (CRM, ERP, facturation) ?', a: 'Oui. Nous relions régulièrement les formulaires et les commandes à HubSpot, Brevo ou à des outils métier via Make, n8n ou des API sur mesure, pour que chaque demande arrive au bon endroit sans ressaisie.' },
    ],
  },

  marseille: {
    name: 'Marseille',
    area: 'Marseille et la Région Sud',
    title: 'Travailler avec nous <span class="grad">depuis Marseille</span>',
    intro:
      '<p>Marseille vit de son port, du tourisme, de la santé et d’un tissu très dense de commerces et d’artisans de quartier. Pour beaucoup de ces entreprises, les clients arrivent par Google Maps et par le téléphone : une fiche Google bien tenue et un site qui donne envie d’appeler font directement la différence.</p>' +
      '<p>C’est exactement ce que nous avons construit pour <a href="/realisations/garage-boost-de-la-vitrine-seo-a-l-application-de-gestion-tout-en-un-pour-garage">Garage Boost</a>, garage automobile de Plan-de-Cuques : un site pensé pour le référencement local, puis une application de gestion de l’atelier. Nous travaillons en visioconférence aux horaires français, avec des devis et des factures en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Commerce et artisanat', 'Automobile et services', 'Tourisme et restauration', 'Santé', 'Logistique et maritime'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Euroméditerranée et la Joliette', 'Vieux-Port et Castellane', 'Prado', 'Plan-de-Cuques et Allauch', 'Aix-en-Provence'] },
      { title: 'Paiements intégrés', icon: 'card', items: PAY_FR },
      { title: 'Conformité', icon: 'shield', items: LAW_FR },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">en Région Sud</span>', lead: 'Des sites en ligne, pour de vrais clients de la région : ouvrez-les, testez-les.', slugs: [P.garage, P.romero, P.romeroApp] },
    faq: [
      { q: 'Avez-vous déjà travaillé avec des entreprises marseillaises ?', a: 'Oui : nous avons conçu le site et l’application de gestion de Garage Boost, garage automobile de Plan-de-Cuques, dans la métropole Aix-Marseille-Provence. Tout se fait en visioconférence aux horaires français, avec un interlocuteur unique et des factures en euros.' },
      { q: 'Je suis artisan ou commerçant : un site vaut-il vraiment le coup ?', a: 'Oui, s’il est pensé pour Google Maps et le téléphone : horaires, zone d’intervention, photos réelles, avis clients et bouton d’appel toujours visible. Associé à une fiche Google Business Profile complète, c’est souvent le premier canal de nouveaux clients pour un commerce de quartier.' },
      { q: 'Pouvez-vous aussi créer un outil de gestion pour mon activité ?', a: 'Oui. Pour Garage Boost, nous avons développé une application installable sur téléphone qui réunit devis, factures, rapports d’intervention et réponses aux avis Google. Nous construisons ce type d’outil sur mesure, à partir de votre façon de travailler.' },
    ],
  },

  toulouse: {
    name: 'Toulouse',
    area: 'Toulouse et l’Occitanie',
    title: 'Travailler avec nous <span class="grad">depuis Toulouse</span>',
    intro:
      '<p>Toulouse s’est construite autour de l’aéronautique et du spatial, mais la ville compte aussi un écosystème de startups, de laboratoires de santé et une population étudiante parmi les plus importantes de France. Les entreprises toulousaines ont souvent besoin de deux choses : un site qui explique clairement une offre technique, et une visibilité locale solide face à une concurrence qui grandit vite.</p>' +
      '<p>Nous travaillons à distance avec des entreprises de toute la France, en visioconférence aux horaires français, avec un interlocuteur unique et des devis et factures en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Aéronautique et spatial', 'Startups et numérique', 'Santé et recherche', 'Commerce et restauration', 'Formation et enseignement'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Capitole et centre-ville', 'Compans-Caffarelli', 'Saint-Cyprien', 'Montaudran et Labège', 'Blagnac'] },
      { title: 'Paiements intégrés', icon: 'card', items: PAY_FR },
      { title: 'Conformité', icon: 'shield', items: LAW_FR },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">en France</span>', lead: 'Des sites et des plateformes en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.remorque, P.evkha, P.callpme] },
    faq: [
      REMOTE_FR('Toulouse'),
      { q: 'Notre offre est technique : comment la rendre claire sur le site ?', a: 'En partant des problèmes de vos clients plutôt que de votre technologie : une page par cas d’usage, des schémas simples, des exemples concrets et une demande de contact adaptée à chaque profil. Nous rédigeons ou réécrivons ces contenus avec vous pour qu’un non-spécialiste comprenne en quelques secondes.' },
      { q: 'Lancez-vous aussi des produits SaaS pour des startups toulousaines ?', a: 'Oui : nous concevons des MVP SaaS à partir de 1 500 €, lancés en 8 à 12 semaines, avec comptes utilisateurs, abonnements et tableau de bord. Le code et les données vous appartiennent entièrement.' },
    ],
  },

  bordeaux: {
    name: 'Bordeaux',
    area: 'Bordeaux et la Nouvelle-Aquitaine',
    title: 'Travailler avec nous <span class="grad">depuis Bordeaux</span>',
    intro:
      '<p>Bordeaux attire des touristes du monde entier, des domaines viticoles tournés vers l’export et un tissu grandissant d’entreprises du numérique et de services. Beaucoup de prestataires bordelais, comme les photographes, les lieux de réception ou les caves, vivent de demandes qu’il faut capter en ligne bien avant le premier appel.</p>' +
      '<p>C’est ce que nous avons conçu pour <a href="/realisations/guide-de-mariage-en-ligne-christophe-b-photographe">Christophe B</a>, photographe de mariage en Gironde : un guide gratuit d’organisation du mariage qui recueille les coordonnées des futurs mariés et alimente son carnet de réservations. Nous travaillons en visioconférence aux horaires français, avec des devis et des factures en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Vin et œnotourisme', 'Tourisme et événementiel', 'Mariage et photographie', 'Numérique et services', 'Immobilier'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Mériadeck et centre-ville', 'Les Chartrons', 'La Bastide', 'Euratlantique', 'Mérignac et la métropole'] },
      { title: 'Paiements intégrés', icon: 'card', items: PAY_FR },
      { title: 'Conformité', icon: 'shield', items: LAW_FR },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">à Bordeaux et en France</span>', lead: 'Des sites en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.christophe, P.evkha, P.remorque] },
    faq: [
      { q: 'Avez-vous déjà travaillé avec des entreprises de Bordeaux et de la Gironde ?', a: 'Oui : nous avons conçu pour Christophe B, photographe de mariage girondin, un guide en ligne qui transforme les visiteurs en demandes de réservation. Tout se fait en visioconférence aux horaires français, avec un interlocuteur unique et des factures en euros.' },
      { q: 'Comment attirer des clients avant même qu’ils nous contactent ?', a: 'Avec un contenu utile en échange de leurs coordonnées : un guide, une checklist ou un simulateur. Le visiteur repart avec une vraie aide, vous récupérez un contact qualifié que vous pouvez relancer par e-mail. C’est particulièrement efficace pour les achats réfléchis comme un mariage, un voyage ou un projet immobilier.' },
      { q: 'Faites-vous des sites en anglais pour la clientèle internationale ?', a: 'Oui. Pour le tourisme, le vin ou l’événementiel, une version anglaise bien référencée (une adresse par langue, balises hreflang) ouvre le site aux visiteurs étrangers qui préparent leur séjour depuis chez eux.' },
    ],
  },

  nantes: {
    name: 'Nantes',
    area: 'Nantes et les Pays de la Loire',
    title: 'Travailler avec nous <span class="grad">depuis Nantes</span>',
    intro:
      '<p>Nantes et les Pays de la Loire réunissent un écosystème numérique dynamique, des industries fortes et beaucoup de PME et d’artisans qui vivent de leur clientèle locale. Pour ces entreprises, un site rapide et une fiche Google bien travaillée transforment les recherches du quartier en rendez-vous.</p>' +
      '<p>Nous accompagnons déjà des entreprises de la région : <a href="/realisations/ultimauto-le-decalaminage-automobile-avec-une-vitrine-web-qui-convertit">Ultimauto</a>, centre d’entretien automobile de Cholet, et <a href="/realisations/la-voie-2-la-conscience-une-presence-en-ligne-a-la-hauteur-d-un-accompagnement-d">La Voie 2 la Conscience</a>, dans la Sarthe. Nous travaillons en visioconférence aux horaires français, avec des devis et des factures en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Numérique et startups', 'Industrie', 'Artisanat et services auto', 'Bien-être et coaching', 'Tourisme et culture'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Centre-ville et Graslin', 'L’île de Nantes', 'Euronantes', 'Saint-Herblain', 'Cholet, Angers, Le Mans'] },
      { title: 'Paiements intégrés', icon: 'card', items: PAY_FR },
      { title: 'Conformité', icon: 'shield', items: LAW_FR },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">dans les Pays de la Loire</span>', lead: 'Des sites en ligne, pour de vrais clients de la région : ouvrez-les, testez-les.', slugs: [P.ultimauto, P.voie, P.remorque] },
    faq: [
      { q: 'Avez-vous des clients dans les Pays de la Loire ?', a: 'Oui : Ultimauto, centre d’entretien automobile de Cholet, et La Voie 2 la Conscience, dans la Sarthe. Tout se fait en visioconférence aux horaires français, avec un interlocuteur unique et des factures en euros.' },
      { q: 'Mon activité fonctionne sur rendez-vous : que peut faire le site ?', a: 'Prendre les rendez-vous à votre place : un bouton de réservation visible sur chaque page, un devis rapide en ligne, des rappels automatiques et une fiche Google Business Profile reliée au site. Pour Ultimauto, tout le site est pensé pour transformer une visite en rendez-vous.' },
      { q: 'Pouvez-vous aussi développer une application pour gérer l’activité ?', a: 'Oui. Nous avons par exemple conçu une application de facturation et de suivi des interventions pour un garage. Nous partons de votre façon de travailler pour remplacer les tableurs et les carnets par un outil simple, utilisable aussi sur téléphone.' },
    ],
  },

  lille: {
    name: 'Lille',
    area: 'Lille et les Hauts-de-France',
    title: 'Travailler avec nous <span class="grad">depuis Lille</span>',
    intro:
      '<p>Lille est l’un des berceaux de la vente à distance en France : la région compte de nombreux acteurs de la distribution, du e-commerce et de la logistique, ainsi que l’un des plus grands campus numériques d’Europe, EuraTechnologies. La proximité de la Belgique et du Royaume-Uni en fait aussi un marché naturellement tourné vers l’international.</p>' +
      '<p>Nous travaillons à distance avec des entreprises de toute la France et de Belgique, comme <a href="/realisations/travisum-traduction-juree-legalisation-et-visas-a-bruxelles">Travisum</a> à Bruxelles, en visioconférence aux horaires français, avec des devis et des factures en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['E-commerce et distribution', 'Logistique', 'Numérique et startups', 'Textile et mode', 'Santé'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Euralille et le centre', 'Le Vieux-Lille', 'EuraTechnologies', 'Villeneuve-d’Ascq', 'Roubaix et Tourcoing'] },
      { title: 'Paiements intégrés', icon: 'card', items: [...PAY_FR.slice(0, 4), 'Bancontact (clients belges)'] },
      { title: 'Conformité', icon: 'shield', items: LAW_FR },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">en France et en Belgique</span>', lead: 'Des sites et des plateformes en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: ['travisum-traduction-juree-legalisation-et-visas-a-bruxelles', P.remorque, P.evkha] },
    faq: [
      REMOTE_FR('Lille'),
      { q: 'Nous vendons aussi en Belgique : le site peut-il s’adapter ?', a: 'Oui : paiement par Bancontact en plus de la carte bancaire, version néerlandaise si besoin (nous avons livré un site trilingue français, néerlandais et anglais pour Travisum à Bruxelles) et référencement pensé pour chaque pays.' },
      { q: 'Pouvez-vous améliorer une boutique en ligne existante ?', a: 'Oui. Nous commençons par un audit : vitesse, parcours d’achat, fiches produits, paiement et référencement. Puis nous corrigeons par ordre d’impact sur les ventes, sans forcément tout reconstruire.' },
    ],
  },

  montpellier: {
    name: 'Montpellier',
    area: 'Montpellier et l’Occitanie',
    title: 'Travailler avec nous <span class="grad">depuis Montpellier</span>',
    intro:
      '<p>Montpellier est une ville jeune, portée par la santé, la recherche, le numérique et une population étudiante très nombreuse. Entre les startups de la métropole, les professions de santé et le tourisme du littoral, les entreprises montpelliéraines ont besoin d’être trouvées rapidement sur mobile, souvent par des clients qui comparent plusieurs prestataires en quelques minutes.</p>' +
      '<p>Nous travaillons à distance avec des entreprises de toute la France, en visioconférence aux horaires français, avec un interlocuteur unique et des devis et factures en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Santé et professions médicales', 'Numérique et startups', 'Recherche et enseignement', 'Tourisme et littoral', 'Viticulture'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['L’Écusson et Comédie', 'Antigone', 'Port Marianne', 'Odysseum et le Millénaire', 'Toute la métropole'] },
      { title: 'Paiements intégrés', icon: 'card', items: PAY_FR },
      { title: 'Conformité', icon: 'shield', items: LAW_FR },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">en France</span>', lead: 'Des sites et des plateformes en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.remorque, P.evkha, P.callpme] },
    faq: [
      REMOTE_FR('Montpellier'),
      { q: 'Je suis professionnel de santé : que puis-je mettre sur mon site ?', a: 'Des informations pratiques et claires : spécialités, horaires, accès, prise de rendez-vous en ligne et réponses aux questions fréquentes. Nous respectons les règles de communication de votre ordre professionnel, sans publicité interdite ni promesse de résultat.' },
      { q: 'Combien de temps faut-il pour être visible sur Google à Montpellier ?', a: 'Les premiers effets d’une fiche Google Business Profile bien tenue se voient souvent en quelques semaines. Pour le référencement du site lui-même, comptez généralement trois à six mois, selon la concurrence sur vos requêtes.' },
    ],
  },
};
