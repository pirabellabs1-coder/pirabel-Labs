/** Contenu local : Belgique, Suisse, Québec, Maroc, Tunisie. Voir les règles dans cities.ts. */
import type { CityLocal } from './cities';

const P = {
  travisum: 'travisum-traduction-juree-legalisation-et-visas-a-bruxelles',
  romero: 'mickael-romero-photographe-de-mariage-a-nice',
  evkha: 'evkha-accompagnement-et-formations-pour-creer-son-entreprise',
  callpme: 'callpme-l-agent-vocal-ia-qui-repond-a-vos-appels-24h-24',
  omonlola: 'omonlola-agossou-media-buyer-meta-ads',
  freelancehigh: 'freelancehigh-la-marketplace-freelance-qui-securise-chaque-transaction',
  novakou: 'novakou-vendre-ses-formations-et-produits-digitaux-en-afrique-francophone',
  afblock: 'afblock-l-ecosysteme-web3-pense-pour-l-afrique',
  orinka: 'orinka-la-plateforme-qui-revele-les-talents-africains-au-monde',
};

export const CITIES_INTL: Record<string, CityLocal> = {
  bruxelles: {
    name: 'Bruxelles',
    area: 'Bruxelles et la Belgique',
    title: 'Travailler avec nous <span class="grad">depuis Bruxelles</span>',
    intro:
      '<p>À Bruxelles, un site professionnel parle rarement une seule langue : la ville est officiellement bilingue, accueille les institutions européennes et une clientèle internationale nombreuse. Un site bruxellois doit donc gérer plusieurs langues proprement, pour les visiteurs comme pour Google, et accepter les moyens de paiement belges.</p>' +
      '<p>Nous l’avons fait pour <a href="/realisations/travisum-traduction-juree-legalisation-et-visas-a-bruxelles">Travisum</a>, bureau de traduction jurée à Bruxelles : un site en français, néerlandais et anglais, avec un assistant qui identifie la démarche en une phrase. Nous travaillons en visioconférence aux horaires belges, avec des devis et des factures en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Institutions et affaires publiques', 'Conseil et services juridiques', 'Traduction et services aux expatriés', 'Commerce et restauration', 'Startups et numérique'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Quartier européen', 'Avenue Louise et Ixelles', 'Centre et Sablon', 'Tour & Taxis', 'Toute la Belgique francophone'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['Bancontact', 'Carte bancaire (Stripe)', 'Virement SEPA', 'Apple Pay et Google Pay', 'PayPal'] },
      { title: 'Conformité', icon: 'shield', items: ['RGPD (Autorité de protection des données)', 'Mentions légales et CGV', 'Accessibilité numérique', 'Français, néerlandais, anglais'] },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">à Bruxelles et en Europe</span>', lead: 'Des sites en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.travisum, P.romero, P.evkha] },
    faq: [
      { q: 'Avez-vous déjà travaillé avec des entreprises bruxelloises ?', a: 'Oui : nous avons conçu le site trilingue de Travisum, bureau de traduction jurée à Bruxelles. Tout se fait en visioconférence aux horaires belges, avec un interlocuteur unique, des devis et des factures en euros.' },
      { q: 'Faut-il un site en français et en néerlandais ?', a: 'Si vous visez toute la région bruxelloise ou la Flandre, oui : c’est un signal de sérieux pour vos clients et un levier de référencement. Nous construisons chaque langue avec sa propre adresse et des balises hreflang, pour que Google montre la bonne version à chaque visiteur.' },
      { q: 'Le paiement par Bancontact est-il possible sur mon site ?', a: 'Oui. Nous intégrons Bancontact en plus de la carte bancaire, d’Apple Pay et de Google Pay, via Stripe : c’est souvent le moyen de paiement préféré des clients belges.' },
    ],
  },

  geneve: {
    name: 'Genève',
    area: 'Genève et la Suisse romande',
    title: 'Travailler avec nous <span class="grad">depuis Genève</span>',
    intro:
      '<p>Genève concentre des banques privées, des sociétés de négoce, des organisations internationales et une clientèle habituée au haut de gamme. Le niveau d’exigence sur un site y est élevé : une image soignée, un contenu précis en plusieurs langues et une conformité irréprochable à la nouvelle loi suisse sur la protection des données.</p>' +
      '<p>Nous concevons des sites premium pour des clients francophones exigeants, comme <a href="/realisations/travisum-traduction-juree-legalisation-et-visas-a-bruxelles">Travisum</a> à Bruxelles ou le photographe <a href="/realisations/mickael-romero-photographe-de-mariage-a-nice">Mickael Romero</a> à Nice. Nous travaillons en visioconférence aux horaires suisses, avec des devis en francs suisses ou en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Finance et gestion de fortune', 'Négoce et entreprises internationales', 'Organisations internationales et ONG', 'Horlogerie et luxe', 'Santé et bien-être'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Centre et Rive droite', 'Eaux-Vives', 'Plainpalais et Carouge', 'Quartier des Nations', 'Lausanne et l’arc lémanique'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['TWINT', 'Carte bancaire (Stripe)', 'Virement bancaire', 'Apple Pay et Google Pay', 'Facturation en CHF ou en EUR'] },
      { title: 'Conformité', icon: 'shield', items: ['nLPD (loi suisse sur la protection des données)', 'RGPD pour vos clients européens', 'Mentions légales', 'Français, anglais, allemand'] },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">en Europe francophone</span>', lead: 'Des sites premium en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.travisum, P.romero, P.evkha] },
    faq: [
      { q: 'Facturez-vous en francs suisses ?', a: 'Oui, sur demande : nous établissons le devis et les factures en francs suisses ou en euros. Le paiement se fait par virement bancaire ou par carte.' },
      { q: 'Mon site doit-il respecter la nouvelle loi suisse sur la protection des données ?', a: 'Oui. Depuis septembre 2023, la nLPD impose notamment une information claire sur les données collectées et leur usage. Nous rédigeons avec vous la politique de confidentialité, paramétrons la mesure d’audience en conséquence et respectons aussi le RGPD si vous servez des clients européens.' },
      { q: 'Pouvez-vous intégrer TWINT à ma boutique en ligne ?', a: 'Oui, via les prestataires de paiement qui le proposent. TWINT est très utilisé en Suisse : l’ajouter à côté de la carte bancaire lève un frein à l’achat pour vos clients suisses.' },
    ],
  },

  montreal: {
    name: 'Montréal',
    area: 'Montréal et le Québec',
    title: 'Travailler avec nous <span class="grad">depuis Montréal</span>',
    intro:
      '<p>Montréal est l’une des grandes villes francophones du monde et un pôle reconnu de l’intelligence artificielle et du jeu vidéo. Les entreprises québécoises doivent composer avec un marché bilingue, une concurrence nord-américaine et des règles propres : la Loi 25 sur les renseignements personnels et la place obligatoire du français.</p>' +
      '<p>Nous travaillons pour des clients francophones des deux côtés de l’Atlantique, comme <a href="/realisations/omonlola-agossou-media-buyer-meta-ads">Omonlola Agossou</a>, dont le site s’adresse à la France, à l’Afrique et au Canada. Les échanges se font en visioconférence : notre siège au Bénin a six heures d’avance sur Montréal en hiver, cinq en été, et nous nous calons sur votre matinée.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Intelligence artificielle et SaaS', 'Jeu vidéo et créatif', 'Commerce de détail', 'Services professionnels', 'Formation et coaching'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Vieux-Montréal', 'Quartier international', 'Mile End et Plateau', 'Laval et Longueuil', 'Tout le Québec'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['Carte de crédit (Stripe)', 'Interac', 'Apple Pay et Google Pay', 'PayPal', 'Facturation en CAD'] },
      { title: 'Conformité', icon: 'shield', items: ['Loi 25 (renseignements personnels)', 'Charte de la langue française', 'Consentement aux témoins (cookies)', 'Français et anglais'] },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">pour des clients francophones</span>', lead: 'Des sites et des plateformes en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.omonlola, P.freelancehigh, P.callpme] },
    faq: [
      { q: 'Comment gérez-vous le décalage horaire avec Montréal ?', a: 'Notre siège au Bénin a six heures d’avance sur Montréal en hiver et cinq en été. Nous plaçons les rendez-vous sur votre matinée et vous recevez les livrables à votre réveil, ce qui accélère souvent les allers-retours.' },
      { q: 'Mon site doit-il respecter la Loi 25 ?', a: 'Oui, dès que vous collectez des renseignements personnels (formulaire, infolettre, mesure d’audience). Nous mettons en place une politique de confidentialité claire, le consentement aux témoins et une collecte limitée au nécessaire.' },
      { q: 'Faites-vous des sites en français et en anglais ?', a: 'Oui : une version française au moins équivalente à la version anglaise, comme l’exige la Charte de la langue française, et une version anglaise bien référencée pour le reste du Canada et les États-Unis.' },
    ],
  },

  casablanca: {
    name: 'Casablanca',
    area: 'Casablanca et le Maroc',
    title: 'Travailler avec nous <span class="grad">depuis Casablanca</span>',
    intro:
      '<p>Casablanca est la capitale économique du Maroc : sièges de banques et d’assurances, industrie, centres de relation client, commerce et une scène de startups en croissance. Les entreprises casablancaises visent souvent à la fois le marché marocain et des clients en Europe ou en Afrique de l’Ouest : leur site doit fonctionner en français, souvent en arabe, et accepter les cartes marocaines.</p>' +
      '<p>Nous accompagnons des entreprises francophones au Maghreb, en Afrique de l’Ouest et en Europe, entièrement à distance : même heure que notre siège au Bénin la plus grande partie de l’année, un interlocuteur unique, des devis en dirhams ou en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Finance et assurance', 'Industrie et exportation', 'Centres de relation client', 'Commerce et distribution', 'Immobilier'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Casablanca Finance City', 'Maârif et Gauthier', 'Sidi Maârouf et Casanearshore', 'Aïn Diab', 'Rabat et Tanger'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['Carte bancaire marocaine (CMI)', 'Carte internationale (Stripe)', 'Virement bancaire', 'Paiement à la livraison', 'Facturation en MAD ou en EUR'] },
      { title: 'Conformité', icon: 'shield', items: ['Loi 09-08 et déclarations CNDP', 'Mentions légales', 'RGPD pour vos clients européens', 'Français, arabe, anglais'] },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">en Afrique francophone</span>', lead: 'Des plateformes en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.novakou, P.freelancehigh, P.orinka] },
    faq: [
      { q: 'Pouvez-vous intégrer le paiement par carte marocaine ?', a: 'Oui, via le Centre monétique interbancaire (CMI), la solution utilisée par la plupart des commerçants marocains, et en complément une passerelle internationale pour les clients étrangers. Le paiement à la livraison reste possible pour le e-commerce.' },
      { q: 'Quelles obligations pour les données personnelles au Maroc ?', a: 'La loi 09-08 encadre la collecte de données personnelles et prévoit, selon les cas, une déclaration ou une autorisation auprès de la CNDP. Nous concevons les formulaires et la politique de confidentialité en conséquence, et appliquons aussi le RGPD si vous servez des clients européens.' },
      { q: 'Faites-vous des sites en arabe ?', a: 'Oui : une version arabe s’affiche de droite à gauche, avec sa propre mise en page et sa propre adresse, pour être correctement référencée à côté de la version française.' },
    ],
  },

  tunis: {
    name: 'Tunis',
    area: 'Tunis et la Tunisie',
    title: 'Travailler avec nous <span class="grad">depuis Tunis</span>',
    intro:
      '<p>Tunis réunit des entreprises de services informatiques et de centres de relation client travaillant pour l’Europe, des cliniques qui accueillent des patients étrangers, des acteurs du tourisme et un commerce local très actif. Beaucoup de ces entreprises vendent à l’export : leur site doit être irréprochable en français, souvent en anglais, et inspirer confiance à un client qui ne les a jamais rencontrées.</p>' +
      '<p>Nous accompagnons des entreprises francophones au Maghreb, en Afrique de l’Ouest et en Europe, entièrement à distance : même heure que notre siège au Bénin toute l’année, un interlocuteur unique, des devis en dinars ou en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Services informatiques et offshoring', 'Santé et tourisme médical', 'Tourisme', 'Industrie et textile', 'Commerce'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Les Berges du Lac', 'Centre-ville', 'La Marsa et Gammarth', 'Technopole El Ghazala', 'Sousse et Sfax'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['Carte bancaire locale (Clictopay)', 'e-Dinar', 'Carte internationale (Stripe)', 'Virement bancaire', 'Facturation en TND ou en EUR'] },
      { title: 'Conformité', icon: 'shield', items: ['Loi organique 2004-63 (INPDP)', 'Mentions légales', 'RGPD pour vos clients européens', 'Français, arabe, anglais'] },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">en Afrique francophone</span>', lead: 'Des plateformes en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.novakou, P.freelancehigh, P.orinka] },
    faq: [
      { q: 'Pouvez-vous intégrer les moyens de paiement tunisiens ?', a: 'Oui : paiement par carte locale via Clictopay et par e-Dinar, et une passerelle internationale en complément pour vos clients étrangers. Le choix dépend de votre banque et de votre clientèle ; nous vous conseillons dès le cadrage.' },
      { q: 'Notre clientèle est surtout européenne : que faut-il prévoir ?', a: 'Un site qui inspire confiance à un acheteur qui ne vous connaît pas : références, contenus précis, délais et engagements clairs, formulaire de contact efficace et respect du RGPD, en plus de la loi tunisienne sur les données personnelles.' },
      { q: 'Faites-vous des sites multilingues ?', a: 'Oui : français, anglais et arabe, avec une adresse par langue et des balises hreflang pour que Google montre la bonne version à chaque visiteur.' },
    ],
  },
};
