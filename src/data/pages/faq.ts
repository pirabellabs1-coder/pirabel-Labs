import type { PageData } from '../../components/blocks/BlockPage.astro';

const WA = 'https://wa.me/16139273067?text=Bonjour%20Pirabel%20Labs%2C%20j%E2%80%99ai%20une%20question';

export const page: PageData = {
  path: '/faq',
  title: 'FAQ Pirabel Labs : services, tarifs, délais, paiements, garanties',
  description: 'Toutes les réponses avant de demander un devis : services, tarifs, méthodologie, délais, moyens de paiement, équipe, garanties et accompagnement international.',
  legacyLd: 'faq',
  footerCta: {
    title: 'Vous avez une autre question ?',
    text: 'Écrivez-nous : réponse garantie sous 24 h ouvrées par le fondateur. Pas de robot, pas de commercial, juste un humain qui connaît le sujet.',
    href: '/contact',
    label: 'Poser ma question',
  },
  blocks: [
    { kind: 'breadcrumb', items: [{ href: '/', label: 'Accueil' }, { label: 'FAQ' }] },
    {
      kind: 'hero',
      eyebrow: 'FAQ',
      eyebrowIcon: 'help',
      title: 'Questions <span class="grad">fréquentes</span>',
      lead: 'Toutes les réponses aux questions que vous vous posez avant de demander un devis, classées par thème : services, tarifs, méthodologie, délais, paiements et garanties.',
      ctas: [
        { href: '/contact', label: 'Demander un devis', primary: true },
        { href: WA, label: 'Poser une question sur WhatsApp', external: true },
      ],
      icons: ['help', 'message', 'check-circle'],
      caption: 'Réponse sous 24 h ouvrées',
      chips: [
        { icon: 'wallet', text: 'Tarifs transparents' },
        { icon: 'clock', text: 'Délais tenus' },
        { icon: 'shield', text: 'Garanties écrites' },
      ],
    },
    {
      kind: 'anchors', label: 'Thèmes de la FAQ',
      links: [
        { href: '#services', label: 'Nos services', icon: 'briefcase' },
        { href: '#tarifs-faq', label: 'Tarifs & devis', icon: 'wallet' },
        { href: '#methodologie-faq', label: 'Méthodologie', icon: 'route' },
        { href: '#delais', label: 'Délais', icon: 'clock' },
        { href: '#paiements', label: 'Paiements', icon: 'card' },
        { href: '#equipe', label: 'Équipe', icon: 'users' },
        { href: '#garanties', label: 'Garanties', icon: 'shield' },
        { href: '#international', label: 'International', icon: 'globe' },
      ],
    },
    {
      kind: 'faq', variant: 'main', id: 'services',
      head: { eyebrow: 'Nos services', title: 'Nos <span class="grad">services</span>', lead: 'Ce que fait exactement Pirabel Labs, et nos périmètres d’intervention.' },
      items: [
        { q: 'Quels services proposez-vous ?', a: '<p>Nous sommes une agence de marketing digital 360° :</p><ul><li>création de sites web (vitrine, e-commerce, sur mesure) ;</li><li>SEO et référencement ;</li><li>community management et réseaux sociaux ;</li><li>tunnels de vente et optimisation de la conversion ;</li><li>Google Business Profile et SEO local ;</li><li>automatisation marketing (Make, n8n, HubSpot, Brevo) ;</li><li>e-mail marketing ;</li><li>montage vidéo et motion design ;</li><li>publicité Meta Ads, TikTok Ads, Google Ads ;</li><li>consulting marketing stratégique.</li></ul><p>Voir la liste complète sur notre page <a href="/services">Services</a>.</p>' },
        { q: 'Pouvez-vous gérer toute ma présence digitale ?', a: 'Oui, c’est même notre force : une seule équipe gère le site web, le SEO, les réseaux sociaux, la publicité, l’e-mailing et l’automatisation. Vous évitez de jongler avec cinq prestataires qui ne se parlent pas : tout est aligné sur une seule stratégie, avec un seul point de contact.' },
        { q: 'Travaillez-vous avec des petites entreprises ?', a: 'Oui. Notre cible principale est la PME (de 5 à 100 salariés). Nous accompagnons aussi des indépendants, des consultants, des cabinets, des associations et des startups. Nos projets démarrent à partir de 200 000 FCFA en Afrique et de 1 200 € en Europe.' },
        { q: 'Travaillez-vous avec des grandes entreprises ?', a: 'Oui, pour des projets bien délimités (refonte de site, projet SEO, campagne publicitaire). Pour les grands comptes aux processus internes lourds (appels d’offres, validations juridiques longues), nous orientons souvent vers des partenaires plus structurés : nous restons une équipe agile.' },
        { q: 'Pouvez-vous reprendre un site existant ?', a: 'Oui : reprise, refonte, maintenance, ajout de fonctionnalités. Nous travaillons sur WordPress, Webflow, Shopify, Next.js et React. Un audit initial permet d’évaluer l’état du site et de chiffrer la reprise.' },
        { q: 'Faites-vous du SEO seul, sans créer de site ?', a: 'Oui. Si vous avez déjà un site, même imparfait, nous pouvons travailler son référencement. Si le site est trop ancien ou techniquement bloquant, nous recommandons une refonte avant. Mais le SEO seul est tout à fait possible.' },
      ],
    },
    {
      kind: 'faq', variant: 'main', id: 'tarifs-faq',
      head: { eyebrow: 'Tarifs & devis', title: 'Tarifs <span class="grad">& devis</span>', lead: 'Combien ça coûte, comment obtenir un devis, ce qui est inclus.' },
      items: [
        { q: 'Combien coûte un site web avec vous ?', a: '<ul><li>Site vitrine : à partir de 200 000 FCFA en Afrique, de 1 200 € en Europe ;</li><li>E-commerce : à partir de 600 000 FCFA en Afrique, de 2 500 € en Europe ;</li><li>Application sur mesure : devis personnalisé.</li></ul><p>Voir la grille complète sur notre page <a href="/tarifs">Tarifs</a>.</p>' },
        { q: 'Comment obtenir un devis ?', a: 'En trois étapes : (1) remplissez le <a href="/contact">formulaire de contact</a> ou écrivez-nous sur WhatsApp, (2) nous fixons un appel découverte gratuit de 30 minutes, (3) vous recevez un devis ferme sous 48 h. Sans engagement.' },
        { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le devis ferme comprend tout : design, développement, intégration, contenus, tests, mise en ligne, formation et suivi de 30 jours. Les seuls coûts supplémentaires, toujours mentionnés dès le devis, sont l’hébergement (30 à 200 € par an), le nom de domaine (10 à 30 € par an) et d’éventuelles licences (thèmes premium, extensions).' },
        { q: 'Vos tarifs sont-ils négociables ?', a: 'Le tarif est ferme une fois le devis établi. Le périmètre peut s’adapter (moins de pages, fonctionnalités différées) pour rester dans votre budget, et nous proposons des paiements échelonnés pour les projets importants.' },
        { q: 'Pourquoi vos tarifs varient-ils selon les pays ?', a: 'Nous adaptons nos tarifs au pouvoir d’achat de chaque marché. Un site web se vend 5 à 15 fois plus cher à Paris qu’à Cotonou, pour des coûts de production similaires. Notre implantation au Bénin nous permet de pratiquer des tarifs justes : accessibles en Afrique, 30 à 50 % sous les agences locales en Europe.' },
        { q: 'Faites-vous des réductions ?', a: 'Oui, dans certains cas : associations à but non lucratif (−20 % sur présentation des statuts), engagements annuels (un mois offert sur douze), recommandation (10 % de réduction sur le projet d’un client recommandé qui signe).' },
      ],
    },
    {
      kind: 'faq', variant: 'main', id: 'methodologie-faq',
      head: { eyebrow: 'Méthodologie', title: 'Notre <span class="grad">méthodologie</span>', lead: 'Comment nous travaillons concrètement, du brief à la livraison.' },
      items: [
        { q: 'Comment se déroule un projet avec vous ?', a: 'En cinq étapes : (1) découverte gratuite de 30 minutes, (2) cadrage et devis ferme sous 48 h, (3) design ou stratégie, (4) production en sprints hebdomadaires avec démonstrations régulières, (5) lancement et suivi de 30 jours. Le détail complet est sur notre page <a href="/methodologie">Méthodologie</a>.' },
        { q: 'Comment se passe la collaboration au quotidien ?', a: 'Visio hebdomadaire (Google Meet ou Zoom), Slack ou WhatsApp pour les échanges, Notion ou Trello pour le suivi des tâches, et des rapports mensuels structurés avec vos indicateurs clés.' },
        { q: 'Combien de personnes interviennent sur mon projet ?', a: 'Généralement 2 à 4 personnes selon le projet : un chef de projet (votre point de contact unique), un designer, un développeur et, si besoin, un spécialiste (SEO, vidéo, publicité, automatisation). Pour les engagements mensuels (SEO, community management), 2 personnes en moyenne.' },
        { q: 'Comment validez-vous les livrables ?', a: 'Nous présentons l’avancement lors de démonstrations hebdomadaires (visio de 30 minutes) : vous voyez le projet avancer en direct. Pour les maquettes, nous utilisons Figma en mode commentaire ; pour les sites, des liens de prévisualisation sont mis à jour en continu.' },
        { q: 'Que se passe-t-il si un livrable ne me satisfait pas ?', a: 'Nous intégrons systématiquement 2 cycles de révision par livrable majeur (design, fonctionnalité). Au-delà, les révisions sont facturées au temps passé. En pratique, les démonstrations hebdomadaires évitent les mauvaises surprises à la fin.' },
      ],
    },
    {
      kind: 'faq', variant: 'main', id: 'delais',
      head: { eyebrow: 'Délais', title: 'Nos <span class="grad">délais</span>', lead: 'Combien de temps pour livrer chaque type de projet.' },
      items: [
        { q: 'Combien de temps pour un site vitrine ?', a: '3 à 5 semaines en moyenne, selon le nombre de pages et la complexité du design. Répartition type : une semaine de cadrage et de design, deux semaines de développement, une semaine de révisions et de lancement.' },
        { q: 'Combien de temps pour un e-commerce ?', a: '6 à 10 semaines selon la taille du catalogue (jusqu’à 50 produits : 6 semaines ; de 50 à 500 : 8 semaines ; au-delà : 10 semaines ou plus) et les intégrations spécifiques (Mobile Money, transporteur, ERP).' },
        { q: 'Combien de temps pour voir des résultats SEO ?', a: 'Premiers signaux après 8 à 12 semaines (Google indexe et commence à positionner vos pages), résultats solides à 6 mois, résultats consolidés à 12 mois. Le SEO est un investissement de long terme : nous nous engageons sur 6 à 12 mois minimum.' },
        { q: 'Pouvez-vous travailler en urgence ?', a: 'Oui pour les petits projets (landing page, campagne publicitaire, ajustements de site). Pour les projets importants, la qualité demande du temps : nous évitons les promesses irréalistes, car un site bâclé coûte plus cher à moyen terme.' },
        { q: 'Quel est votre délai de réponse aux messages ?', a: '24 h ouvrées pour les e-mails et les formulaires, quelques heures sur WhatsApp aux heures de bureau (8 h – 20 h, heure de Cotonou). Pour les clients sous contrat, intervention rapide sous 4 h ouvrées.' },
      ],
    },
    { kind: 'cta', variant: 'inline', title: 'Un projet, une question ?', text: 'Devis gratuit et réponse sous 24 h — sans engagement.', ctas: [{ href: '/contact', label: 'Demander un devis' }, { href: WA, label: 'WhatsApp', external: true }] },
    {
      kind: 'faq', variant: 'main', id: 'paiements',
      head: { eyebrow: 'Paiements', title: 'Moyens de <span class="grad">paiement</span>', lead: 'Comment nous régler, en quelle monnaie, avec quelles facilités.' },
      items: [
        { q: 'Quels moyens de paiement acceptez-vous ?', a: '<ul><li>Virement SEPA (Europe) ;</li><li>carte bancaire via Stripe (Visa, Mastercard) ;</li><li>Bancontact (Belgique) ;</li><li>Mobile Money : MTN MoMo, Orange Money, Moov Money, Wave, SAMA Money ;</li><li>virement bancaire international en EUR ou en USD ;</li><li>virement bancaire local en FCFA (XOF, XAF) ou en GNF.</li></ul>' },
        { q: 'Acceptez-vous le paiement échelonné ?', a: 'Oui. Pour les projets à partir de 650 000 FCFA ou 1 000 € : 30 % d’acompte au lancement, 40 % à mi-projet (validation des maquettes), 30 % à la livraison. Pour les engagements mensuels : facturation au début de chaque mois.' },
        { q: 'En quelle monnaie facturez-vous ?', a: 'Selon votre région et votre préférence : EUR (Europe), USD (international), FCFA XOF (Bénin, Côte d’Ivoire, Sénégal, Togo, Mali, Burkina Faso, Niger, Guinée-Bissau), FCFA XAF (Cameroun, Gabon, Tchad, Centrafrique, Congo, Guinée équatoriale), GNF (Guinée), MAD (Maroc) et TND (Tunisie).' },
        { q: 'Facturez-vous la TVA ?', a: 'Nous sommes établis au Bénin. Nos factures sont légalisées et acceptées par les comptables français, belges, ivoiriens, etc. Aucune TVA n’est appliquée (régime de prestataire africain). Si votre comptable exige une TVA, nous pouvons facturer via une entité partenaire européenne, sur demande.' },
        { q: 'Que se passe-t-il en cas de retard de paiement ?', a: 'Première relance amicale à J+7, deuxième relance à J+14, suspension du projet ou des prestations à J+30, procédure de recouvrement à J+60. En réalité, cela n’arrive presque jamais : nos contrats sont clairs, nos factures aussi.' },
      ],
    },
    {
      kind: 'faq', variant: 'main', id: 'equipe',
      head: { eyebrow: 'Équipe & identité', title: 'Équipe <span class="grad">& identité</span>', lead: 'Qui nous sommes, où nous sommes, comment nous travaillons.' },
      items: [
        { q: 'Qui a fondé Pirabel Labs ?', a: 'Pirabel Labs a été fondée en 2020 par <strong>Lissanon Gildas</strong>, fondateur et CEO. Développeur web full stack, il conçoit et développe des sites, des applications et des SaaS, dessine leurs interfaces (UI/UX design) et construit les stratégies marketing, SEO et GEO qui les font connaître. Découvrez son parcours sur notre page <a href="/a-propos">À propos</a>.' },
        { q: 'Qui travaille sur mon projet ?', a: 'Une équipe interne resserrée (développement, design, SEO, contenu, vidéo, gestion de projet), au siège d’Abomey-Calavi, dirigée par le fondateur, Lissanon Gildas. Pour un besoin très ponctuel (traduction dans une langue rare, photographie sur place), nous vous le signalons dans le devis, avant tout engagement : jamais de sous-traitance cachée.' },
        { q: 'Où êtes-vous situés ?', a: 'Notre siège est à Abomey-Calavi, dans le département de l’Atlantique au Bénin, à côté de Cotonou. Nous accompagnons des clients sur quatre continents (Afrique, Europe, Amérique du Nord, Moyen-Orient francophone).' },
        { q: 'Pouvez-vous vous déplacer chez moi ?', a: 'Oui pour les projets stratégiques (lancement, ateliers, présentations aux parties prenantes), avec des frais de déplacement à la charge du client. Au quotidien, le travail à distance avec des visios hebdomadaires est notre standard.' },
        { q: 'Quelles langues parlez-vous ?', a: 'Le français (langue principale de tous les contrats et échanges) et l’anglais (production de contenus, gestion de projets internationaux). Pour le néerlandais et les autres langues européennes, nous collaborons avec des traducteurs natifs.' },
      ],
    },
    {
      kind: 'faq', variant: 'main', id: 'garanties',
      head: { eyebrow: 'Garanties', title: 'Nos <span class="grad">garanties</span>', lead: 'Ce sur quoi vous pouvez compter, ce que nous garantissons.' },
      items: [
        { q: 'Avez-vous une garantie de satisfaction ?', a: 'Oui. Pour les projets de site web, un suivi de 30 jours après le lancement est inclus pour corriger les bogues et ajuster ce qui doit l’être. Si une fonctionnalité ne marche pas comme prévu au devis, nous la corrigeons sans frais.' },
        { q: 'Garantissez-vous des résultats SEO ?', a: 'Aucune agence sérieuse ne garantit des positions sur Google : c’est l’algorithme qui décide. Nous garantissons en revanche une méthodologie rigoureuse, un reporting transparent et une amélioration mesurable du trafic et des positions dans les 6 mois. Sans amélioration après 6 mois, nous refondons gratuitement la stratégie.' },
        { q: 'Que se passe-t-il si le site tombe en panne ?', a: 'Pour les sites sous contrat de maintenance : intervention sous 4 h ouvrées. Pour les sites sans contrat : intervention possible (facturée au temps passé), avec un délai pouvant aller de 24 à 48 h selon la charge.' },
        { q: 'Êtes-vous conformes au RGPD ?', a: 'Oui : mentions légales, politique de confidentialité, bannière cookies conforme, registre des traitements, contrats de sous-traitance avec des hébergeurs européens. Nous livrons des sites prêts à passer un audit de la CNIL.' },
        { q: 'Que devient mon site si nous arrêtons de travailler ensemble ?', a: 'Le site et le code vous appartiennent. Nous vous transmettons tous les accès (administration, hébergement, nom de domaine s’il est chez nous) : vous pouvez reprendre la main avec une autre équipe sans rien perdre. Aucun verrou technique.' },
      ],
    },
    {
      kind: 'faq', variant: 'main', id: 'international',
      head: { eyebrow: 'International', title: 'Travailler avec nous <span class="grad">depuis l’étranger</span>', lead: 'Multilinguisme, fuseaux horaires, cadre légal : comment nous gérons la distance.' },
      items: [
        { q: 'Travaillez-vous avec des clients hors d’Afrique ?', a: 'Oui : plusieurs clients réguliers en France (Paris, Lyon), en Belgique (Bruxelles), en Suisse, au Canada et au Maroc. Notre méthodologie est pensée pour le travail à distance avec des fuseaux horaires différents.' },
        { q: 'Comment gérez-vous le décalage horaire ?', a: 'Notre fuseau est GMT+1 (heure de Cotonou). Il couvre confortablement l’Europe (GMT+1/+2), l’Afrique de l’Ouest (GMT et GMT+1), l’Afrique centrale (GMT+1) et le Maroc, et permet des créneaux le matin pour l’est du Canada (GMT−5). Les visios sont calées sur des heures de bureau communes.' },
        { q: 'Pouvez-vous gérer des sites multilingues ?', a: 'Oui. Nous gérons le français (langue native) et collaborons avec des traducteurs natifs pour les autres langues (EN, NL, DE, ES, IT, AR). L’intégration multilingue est propre : balises hreflang, URL distinctes, balises canonical correctes.' },
        { q: 'Connaissez-vous le RGPD européen ?', a: 'Oui. Plusieurs membres de l’équipe sont formés au RGPD. Nos sites destinés à l’Union européenne sont livrés conformes : mentions légales, politique de confidentialité, bannière cookies validée, registre des traitements, contrat de sous-traitance avec un hébergeur européen.' },
        { q: 'Comprenez-vous les marchés français, belge et suisse ?', a: 'Oui. Nous avons des clients réguliers sur ces marchés depuis 2020. Nous connaissons les habitudes de consommation, le cadre légal (RGPD, droit de la consommation, mentions obligatoires) et les attentes en matière de design et de ton. Nous référençons sur Google.fr, Google.be et Google.ch.' },
      ],
    },
  ],
};
