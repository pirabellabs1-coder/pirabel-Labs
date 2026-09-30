import type { PageData } from '../../components/blocks/BlockPage.astro';

const WA = 'https://wa.me/33757751778?text=Bonjour%20Pirabel%20Labs%2C%20j%E2%80%99ai%20un%20projet';
const URL = 'https://www.pirabellabs.com';

// Fiche du CEO pour Google et les moteurs IA : mêmes faits que le bloc « Notre CEO » visible.
const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${URL}/a-propos#ceo`,
  name: 'Lissanon Gildas',
  givenName: 'Gildas',
  familyName: 'Lissanon',
  jobTitle: ['CEO de Pirabel Labs', 'Développeur web full stack'],
  description: 'Lissanon Gildas est le CEO de Pirabel Labs, agence digitale née en 2022 à Abomey-Calavi (Bénin). Développeur web full stack, il intervient sur le développement de sites, d’applications et de logiciels, la conception UI/UX, la stratégie marketing, le SEO et le GEO.',
  image: [`${URL}/img/equipe/lissanon-gildas-carre.jpg`, `${URL}/img/equipe/lissanon-gildas.jpg`],
  url: `${URL}/a-propos`,
  email: 'contact@pirabellabs.com',
  nationality: { '@type': 'Country', name: 'Bénin' },
  homeLocation: { '@type': 'Place', name: 'Abomey-Calavi, Bénin' },
  worksFor: { '@type': 'Organization', name: 'Pirabel Labs', url: URL },
  knowsLanguage: ['fr', 'en'],
  knowsAbout: [
    'Développement web full stack', 'Développement d’applications web', 'Logiciels sur mesure', 'SaaS',
    'TypeScript', 'JavaScript', 'Node.js', 'React', 'Next.js', 'Astro', 'MongoDB', 'WordPress',
    'UI design', 'UX design', 'Stratégie marketing digital', 'SEO', 'SEO local',
    'GEO (Generative Engine Optimization)', 'Automatisation marketing', 'Agents IA',
  ],
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Développeur web full stack',
    occupationLocation: { '@type': 'City', name: 'Abomey-Calavi' },
    skills: 'Développement front-end et back-end, applications web, SaaS, UI/UX design, stratégie marketing, SEO, GEO',
  },
};


export const page: PageData = {
  path: '/a-propos',
  title: 'À propos de Pirabel Labs et de son CEO, Lissanon Gildas',
  description: 'Pirabel Labs, agence web et marketing d’Abomey-Calavi (Bénin), dirigée par Lissanon Gildas : sites, applications, SaaS, UI/UX, SEO et GEO.',
  ogImage: '/img/equipe/lissanon-gildas-og.jpg',
  legacyLd: 'a-propos',
  jsonLd: [PERSON],
  footerCta: {
    title: 'Envie de nous rencontrer ?',
    text: 'Un café virtuel de 15 minutes pour faire connaissance, comprendre vos enjeux et voir si l’on peut vraiment vous être utile. Pas de pitch commercial : une conversation honnête entre dirigeants.',
    href: '/contact',
    label: 'Réserver un audit gratuit',
  },
  blocks: [
    { kind: 'breadcrumb', items: [{ href: '/', label: 'Accueil' }, { label: 'À propos' }] },
    {
      kind: 'hero',
      eyebrow: 'À propos de Pirabel Labs',
      eyebrowIcon: 'users',
      title: 'Une agence francophone, pensée pour les <span class="grad">PME ambitieuses</span>',
      lead: 'Née en 2022 à Abomey-Calavi et dirigée par Lissanon Gildas, Pirabel Labs aide les entreprises francophones d’Afrique de l’Ouest et d’Europe à transformer leur présence digitale en moteur de croissance. Un seul interlocuteur, du devis à la livraison : pas d’agence absente, pas de sous-traitance cachée, pas de jargon — juste du travail solide, mesurable et livré.',
      ctas: [
        { href: '/contact', label: 'Réserver un audit gratuit', primary: true },
        { href: '/services', label: 'Voir nos services' },
      ],
      icons: ['users', 'rocket', 'globe'],
      caption: 'Née en 2022',
      chips: [
        { icon: 'pin', text: 'Abomey-Calavi, Bénin' },
        { icon: 'globe', text: '8 pays servis' },
        { icon: 'star', text: '4,9/5 de moyenne' },
      ],
    },
    {
      kind: 'cards', variant: 'stats',
      head: { eyebrow: 'Pirabel Labs en chiffres', title: 'Quatre ans, <span class="grad">jamais sans nos clients</span>', lead: 'Quelques chiffres pour donner la mesure du travail accompli depuis 2022.' },
      items: [
        { stat: '150+', text: 'projets livrés' },
        { stat: '50+', text: 'clients actifs' },
        { stat: '8', text: 'pays servis' },
        { stat: '4', text: 'années d’expérience' },
        { stat: '1', text: 'interlocuteur unique' },
        { stat: '11', text: 'expertises couvertes' },
        { stat: '4,9/5', text: 'note clients moyenne' },
        { stat: '< 4 h', text: 'délai de réponse moyen' },
      ],
    },
    {
      kind: 'profile',
      head: { eyebrow: 'Direction', title: 'Notre <span class="grad">CEO</span>' },
      name: 'Lissanon Gildas',
      role: 'CEO de Pirabel Labs',
      photo: { src: '/img/equipe/lissanon-gildas.webp', jpg: '/img/equipe/lissanon-gildas.jpg', alt: 'Lissanon Gildas, CEO de Pirabel Labs', width: 720, height: 900 },
      bio: '<p>Lissanon Gildas est le CEO de Pirabel Labs, agence digitale née en 2022 à Abomey-Calavi, au Bénin. Développeur web full stack, il porte une ambition : donner aux entreprises francophones un partenaire capable de concevoir, de construire et de faire grandir leurs projets numériques.</p><p>Il dirige la stratégie de l’agence et intervient personnellement sur les projets de ses clients, du développement de sites, d’applications et de logiciels à la conception des interfaces (UI/UX), en passant par la stratégie marketing, le référencement naturel (SEO) et la visibilité dans les moteurs de réponse IA (GEO).</p><p>Sous sa direction, Pirabel Labs accompagne des entreprises en Afrique de l’Ouest, en Europe et au Canada.</p>',
      tags: ['Développement web full stack', 'UI/UX design', 'Stratégie marketing', 'SEO et GEO'],
      facts: [],
    },
    {
      kind: 'steps', variant: 'detailed',
      head: { eyebrow: 'Notre parcours', title: 'D’une intuition à une <span class="grad">agence 360°</span>', lead: 'Quatre ans à apprendre, à corriger, à monter en compétences. Voici les étapes clés qui ont façonné Pirabel Labs.' },
      items: [
        { num: '2022', tag: 'Le démarrage', title: 'Naissance de Pirabel Labs à Abomey-Calavi', text: '<p>L’agence démarre à Abomey-Calavi avec ses premiers clients locaux et une première offre de création de sites et de référencement (SEO). Objectif : prouver qu’on peut faire du digital de qualité depuis le Bénin, pour toute la francophonie.</p>' },
        { num: '2023', tag: 'Ouverture et automatisation', title: 'Premiers clients en Europe, premiers agents IA', text: '<p>Premiers clients en France et en Belgique, servis à distance avec des processus de gestion de projet rigoureux. L’agence lance aussi son offre d’automatisation (Make, n8n) et ses premiers agents conversationnels IA.</p>' },
        { num: '2024', tag: 'Reconnaissance et certifications', title: 'Partenariat Brevo, certifications Google et HubSpot', text: '<p>Pirabel Labs devient partenaire officiel Brevo ; son CEO obtient les certifications Google Ads, Google Analytics 4 et HubSpot Marketing. Cinquante clients actifs répartis sur huit pays, accompagnés sans intermédiaire.</p>' },
        { num: '2025', tag: 'Année charnière', title: 'Refonte de marque et montée en gamme de l’offre vidéo', text: '<p>Nouveau logo, nouvelle identité visuelle, nouveau site. L’offre vidéo et motion design se renforce, le cap des 130 projets livrés est franchi, et le blog comme la newsletter destinée aux dirigeants de PME francophones voient le jour.</p>' },
        { num: '2026', tag: 'Aujourd’hui', title: 'Une agence 360° au service des PME francophones', text: '<p>Plus de 150 projets livrés, 50 clients actifs dans 8 pays. Onze expertises couvertes en interne : web, SEO, social, vidéo, automatisation, IA, e-mail, tunnels, consulting, hébergement et maintenance. Et toujours la même obsession : être le partenaire sur qui les patrons de PME peuvent compter.</p>' },
      ],
    },
    {
      kind: 'cards', variant: 'reasons',
      head: { eyebrow: 'Mission & valeurs', title: 'Faire du marketing <span class="grad">utile</span>, pas du marketing décoratif', lead: 'Notre mission : permettre à chaque PME francophone de bâtir une présence digitale solide, sans dépendre d’agences absentes ni de prestataires qui ne comprennent ni le marché ni la langue.' },
      items: [
        { icon: 'eye', title: 'Transparence radicale', text: 'Devis détaillés, reporting hebdomadaire, accès direct à votre interlocuteur. Pas de boîte noire, pas de jargon pour masquer le travail. Si une stratégie ne marche pas, nous le disons et nous corrigeons.' },
        { icon: 'chart', title: 'Mesurable, toujours', text: 'Chaque action a un objectif chiffré : trafic, leads, ventes, taux de conversion. Pas de vanité sur les « j’aime » : on parle ROI, coût par lead et chiffre d’affaires généré.' },
        { icon: 'globe', title: 'Francophone par conviction', text: 'Nous écrivons, parlons et pensons en français. Nous connaissons les codes culturels d’Abidjan, de Dakar, de Cotonou, de Paris ou de Bruxelles. Pas de traduction automatique mal calibrée.' },
        { icon: 'wrench', title: 'Excellence technique', text: 'Sites rapides, code propre, sécurité sérieuse, SEO impeccable. Une veille continue sur les évolutions techniques pour livrer des produits durables.' },
        { icon: 'users', title: 'Interlocuteur constant', text: 'Pas de turnover, pas de sous-traitance : la personne qui démarre votre projet est celle qui le termine. Vous parlez au même interlocuteur pendant des années, pas à des inconnus.' },
        { icon: 'handshake', title: 'Proximité réelle', text: 'Réponse en moins de 4 heures en semaine. Visites sur site possibles en Afrique de l’Ouest. Visios hebdomadaires, WhatsApp direct, Slack partagé : on est joignables, vraiment.' },
      ],
    },
    { kind: 'cta', variant: 'inline', title: 'Un projet, une question ?', text: 'Devis gratuit et réponse sous 24 h — sans engagement.', ctas: [{ href: '/contact', label: 'Demander un devis' }, { href: WA, label: 'WhatsApp', external: true }] },
    {
      kind: 'cards', variant: 'expertises',
      head: { eyebrow: 'L’expertise', title: 'Toutes les expertises, <span class="grad">un seul interlocuteur</span>', lead: 'Design, développement, SEO, contenu, réseaux sociaux, automatisation : toute la chaîne de valeur du marketing digital, réalisée par notre équipe interne, sans intermédiaire.' },
      items: [
        { icon: 'palette', tag: 'Figma · Design system', title: 'Design UI/UX', text: 'Maquettes Figma, charte graphique, design system. Des interfaces élégantes pensées pour la conversion.', href: '/creation-site-web', cta: 'Création de site web' },
        { icon: 'code', tag: 'Next.js · WordPress · Shopify', title: 'Développement web', text: 'Next.js, WordPress, Webflow, Shopify. Des sites rapides, sécurisés et au code propre.', href: '/creation-site-web', cta: 'Création de site web' },
        { icon: 'rocket', tag: 'Full stack · SaaS', title: 'Applications et logiciels', text: 'Applications web, logiciels métier et SaaS développés de bout en bout : interface, serveur, base de données, paiements.', href: '/creation-application-web', cta: 'Application web' },
        { icon: 'search', tag: 'SEO · GEO', title: 'SEO et GEO', text: 'Audits techniques, stratégie de contenu, netlinking éthique, et visibilité dans les réponses de ChatGPT, Gemini ou Perplexity.', href: '/seo', cta: 'SEO et référencement' },
        { icon: 'message', tag: 'Instagram · TikTok · LinkedIn', title: 'Community management', text: 'Instagram, TikTok, LinkedIn, Facebook. Stratégie éditoriale, animation et reporting.', href: '/community-management', cta: 'Community management' },
        { icon: 'video', tag: 'Réels · Motion design', title: 'Montage vidéo', text: 'Réels, TikTok, capsules longues. Motion design, sous-titres et sound design soignés.', href: '/montage-video', cta: 'Montage vidéo' },
        { icon: 'bot', tag: 'Make · n8n · Agents IA', title: 'Automatisation & IA', text: 'Make, n8n, Zapier, agents IA. Des workflows complets pour le CRM, le support et les opérations.', href: '/automatisation-marketing', cta: 'Automatisation' },
        { icon: 'mail', tag: 'HubSpot · Brevo', title: 'E-mail & CRM', text: 'HubSpot, Brevo, Mailchimp. Séquences automatisées, lead scoring et délivrabilité.', href: '/email-marketing-crm', cta: 'E-mail marketing' },
        { icon: 'pen', tag: 'SEO · Français natif', title: 'Rédaction & contenu', text: 'Articles SEO, pages produit, scripts vidéo, newsletters. Français natif, plume affûtée.', href: '/seo', cta: 'SEO et contenu' },
      ],
    },
    {
      kind: 'zones',
      head: { eyebrow: 'Pourquoi le Bénin ?', title: 'Abomey-Calavi, <span class="grad">au cœur de la francophonie</span>' },
      html: '<p>Le Bénin est francophone, central en Afrique de l’Ouest, relié aux câbles internationaux et à une heure de décalage au plus avec Paris. C’est un point d’ancrage naturel pour servir une clientèle francophone dispersée sur trois continents.</p><p>Notre siège à Abomey-Calavi, à 18 km de Cotonou, offre la sérénité d’un campus urbain et un accès rapide à l’aéroport. C’est ici que nous accueillons nos clients et nos partenaires.</p><p>Plus important encore : nous comprenons les codes des marchés que nous servons. Quand un client d’Abidjan, de Dakar ou de Lomé nous parle de son secteur, nous parlons la même langue, au sens propre comme au sens culturel.</p>',
      zones: [
        { title: 'Afrique de l’Ouest et centrale', icon: 'pin', items: ['Bénin', 'Côte d’Ivoire', 'Sénégal', 'Togo', 'Burkina Faso', 'Mali', 'Cameroun'] },
        { title: 'Europe et Amérique du Nord', icon: 'globe', items: ['France', 'Belgique', 'Suisse', 'Luxembourg', 'Canada (Québec)'] },
      ],
    },
    {
      kind: 'faq', variant: 'main',
      head: { eyebrow: 'Questions fréquentes', title: 'Tout ce que vous voulez <span class="grad">savoir avant de nous appeler</span>', lead: 'Tarifs, contrats, méthodes, langues, facturation : nos réponses claires aux questions qu’on nous pose le plus.' },
      items: [
        { q: 'Qui dirige Pirabel Labs ?', a: 'Pirabel Labs est dirigée par Lissanon Gildas, son CEO. L’agence est née en 2022 à Abomey-Calavi (Bénin). Développeur web full stack, Lissanon Gildas intervient personnellement sur les projets : développement de sites, d’applications et de logiciels, conception UI/UX, stratégie marketing, SEO et GEO.' },
        { q: 'Comment fixez-vous vos tarifs ?', a: 'Nos tarifs sont transparents et adaptés à la taille du projet. Trois formats au choix : un forfait pour un livrable précis (un site, une campagne, un audit), un abonnement mensuel pour un accompagnement récurrent (SEO, community management, automatisation), ou des jours-homme pour des missions ponctuelles. Avant tout démarrage, vous recevez un devis chiffré ligne par ligne, sans surprise et sans frais cachés. Une grille indicative est publiée sur notre page <a href="/tarifs">Tarifs</a> pour donner des ordres de grandeur.' },
        { q: 'Travaillez-vous à distance avec des clients à l’étranger ?', a: 'Oui, près de 70 % de notre activité est réalisée à distance avec des clients en Côte d’Ivoire, au Sénégal, au Togo, en France, en Belgique et au Canada. Nous travaillons avec Notion pour la documentation, Slack pour les échanges quotidiens, Loom pour les démonstrations vidéo et Zoom ou Google Meet pour les points hebdomadaires. Notre fuseau horaire (GMT+1) est celui d’une grande partie de l’Europe et de l’Afrique francophone, ce qui rend les échanges fluides.' },
        { q: 'Dans quelles langues travaillez-vous ?', a: 'Notre langue principale est le français. Nous produisons aussi du contenu en anglais pour les clients européens qui ciblent une audience internationale. Pour les campagnes très locales en Afrique de l’Ouest, nous pouvons également travailler en fon (Bénin), en yoruba (Bénin, Nigeria), en wolof (Sénégal) ou en lingala selon les besoins. Le français est notre langue maternelle : nos textes n’ont jamais le ton mécanique des traductions automatiques.' },
        { q: 'Quels types de contrats proposez-vous ?', a: 'Trois formats principaux : une mission ponctuelle avec livrables fixes et date de fin, un abonnement mensuel (3 ou 6 mois minimum selon les services), ou un contrat annuel avec engagement long terme et tarifs préférentiels. Nos contrats sont rédigés en français, conformes au droit OHADA pour les clients d’Afrique de l’Ouest et au droit français ou belge pour les clients européens. Pas de clause cachée : résiliation possible avec un préavis de 30 jours sur tous les abonnements.' },
        { q: 'Faites-vous appel à des sous-traitants ?', a: 'Non. Le travail facturé est réalisé en interne, depuis Abomey-Calavi. Cela vous garantit trois choses : un interlocuteur unique qui connaît votre dossier de bout en bout, une qualité maîtrisée sans intermédiaire qui ralentit ou dilue, et une transparence totale sur qui fait quoi. Si une compétence très pointue et ponctuelle s’avérait nécessaire, nous vous le dirions clairement en amont, avant tout engagement.' },
        { q: 'Comment se passe la facturation à l’international ?', a: 'Nous facturons dans la devise qui vous convient le mieux : euro pour la France, la Belgique, la Suisse et le Luxembourg ; franc CFA (XOF) pour la zone UEMOA (Bénin, Côte d’Ivoire, Sénégal, Togo, Burkina Faso, Mali) ; dollar canadien pour le Canada. Les modes de paiement acceptés sont le virement bancaire international (SWIFT), Wise et le Mobile Money (Wave, MTN, Orange Money) pour l’Afrique de l’Ouest. Les factures sont conformes aux normes comptables locales et la TVA est gérée selon votre pays de résidence fiscale.' },
      ],
    },
  ],
};
