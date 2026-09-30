import type { PageData } from '../../components/blocks/BlockPage.astro';
import type { Block } from '../../lib/blocks/parse';
import { SITE } from '../site';
import { pxHtml } from '../../lib/px.mjs';

const WA = 'https://wa.me/33757751778?text=Bonjour%20Pirabel%20Labs%2C%20je%20souhaite%20cr%C3%A9er%20un%20SaaS';
const prose = (html: string): Block => ({ kind: 'prose', html });

export const page: PageData = {
  path: '/creation-saas',
  title: 'Création de SaaS sur mesure : MVP dès 1 500 € | Pirabel Labs',
  description: 'Création de SaaS sur mesure : cadrage, design, développement, abonnements Stripe et Mobile Money, IA intégrée. MVP dès 1 500 €, lancé en 8 à 12 semaines.',
  footerCta: {
    title: 'Votre idée de SaaS mérite un vrai plan',
    text: 'Un appel de 30 minutes pour cadrer votre projet, puis un devis ferme sous 48 h : périmètre du MVP, planning, budget. Sans engagement.',
    href: '/contact?service=creation-saas',
    label: 'Estimer mon projet SaaS',
  },
  jsonLd: [{
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Création de SaaS sur mesure',
    serviceType: 'Développement de logiciels SaaS',
    url: SITE.url + '/creation-saas',
    provider: { '@type': 'Organization', name: 'Pirabel Labs', url: SITE.url },
    areaServed: ['BJ', 'CI', 'SN', 'TG', 'BF', 'ML', 'CM', 'FR', 'BE', 'CH', 'CA'],
    description: 'Conception et développement de logiciels SaaS sur mesure : cadrage produit, design UX/UI, développement Next.js, abonnements, paiements Stripe et Mobile Money, intégration de l’IA, mise à l’échelle.',
    offers: [
      { '@type': 'Offer', name: 'MVP SaaS', price: '1500', priceCurrency: 'EUR', description: 'Premier produit commercialisable en 8 à 12 semaines.' },
      { '@type': 'Offer', name: 'SaaS de croissance', price: '3500', priceCurrency: 'EUR', description: 'Produit complet : abonnements, espace admin, intégrations.' },
      { '@type': 'Offer', name: 'Plateforme sur mesure', price: '7500', priceCurrency: 'EUR', description: 'Plateforme multi-profils, marketplace ou produit à forte charge.' },
    ],
  }],
  blocks: [
    { kind: 'breadcrumb', items: [{ href: '/', label: 'Accueil' }, { href: '/services', label: 'Services' }, { label: 'Création de SaaS' }] },
    {
      kind: 'hero',
      eyebrow: 'Création de SaaS',
      eyebrowIcon: 'layers',
      title: 'Création de SaaS sur mesure : de l’idée au <span class="grad">logiciel rentable</span>',
      lead: 'Nous concevons, développons et lançons votre logiciel en abonnement : cadrage produit, design, développement, paiements et mise à l’échelle. Un seul partenaire, un MVP entre les mains de vos premiers clients en 8 à 12 semaines.',
      ctas: [
        { href: '/contact?service=creation-saas', label: 'Estimer mon projet SaaS', primary: true },
        { href: '#realisations', label: 'Voir nos SaaS livrés' },
      ],
      icons: ['code', 'rocket', 'layers'],
      caption: 'Code 100 % à vous',
      chips: [
        { icon: 'clock', text: 'MVP en 8 à 12 semaines' },
        { icon: 'wallet', text: 'Dès 1 500 €' },
        { icon: 'smartphone', text: 'Stripe et Mobile Money' },
      ],
    },
    {
      kind: 'brief',
      title: 'Créer un SaaS avec Pirabel Labs, <span class="grad">en bref</span>',
      html: '<p>Un <strong>SaaS</strong> (logiciel en tant que service) est une application web vendue par abonnement : vos clients s’inscrivent, paient chaque mois ou chaque année et utilisent le logiciel depuis leur navigateur ou leur téléphone.</p><p>Pirabel Labs conçoit des SaaS sur mesure pour les startups et les PME francophones : nous partons de votre métier, nous livrons un <strong>MVP commercialisable en 8 à 12 semaines</strong>, puis nous faisons grandir le produit avec vos premiers utilisateurs. Le code, les données et les comptes vous appartiennent.</p>',
      points: ['MVP dès 1 500 € (≈ 985 000 FCFA)', 'Premier lancement en 8 à 12 semaines', 'Next.js, Node.js, PostgreSQL, Stripe', 'Paiements par carte et par Mobile Money', 'Code et données 100 % à vous'],
      cta: { href: '/contact?service=creation-saas', label: 'Parler de mon projet' },
    },
    {
      kind: 'anchors', label: 'Sur cette page', sticky: false,
      links: [
        { href: '#offre', label: 'Ce que nous construisons' }, { href: '#realisations', label: 'Réalisations' }, { href: '#methode', label: 'Méthode' },
        { href: '#tarifs', label: 'Tarifs' }, { href: '#faq', label: 'FAQ' }, { href: '#details', label: 'L’essentiel à savoir' }, { href: '#guides', label: 'Guides' },
      ],
    },
    {
      kind: 'cards', variant: 'services', id: 'offre',
      head: { eyebrow: 'Ce que nous construisons', title: 'Toutes les briques d’un <span class="grad">SaaS professionnel</span>', lead: 'Conçues pour fonctionner ensemble dès le premier jour, et pour évoluer sans tout réécrire.' },
      items: [
        { icon: 'key', title: 'Comptes et équipes', text: 'Inscription, connexion par e-mail ou Google, mot de passe oublié, rôles et permissions, espaces multi-utilisateurs pour les équipes de vos clients.' },
        { icon: 'card', title: 'Abonnements et paiements', text: 'Formules mensuelles et annuelles, période d’essai, changements de formule, factures automatiques. Stripe pour les cartes, Mobile Money pour l’Afrique francophone.' },
        { icon: 'gauge', title: 'Tableau de bord et administration', text: 'Un espace client clair (statistiques, actions, historique) et une console d’administration pour piloter comptes, support et facturation.' },
        { icon: 'sparkles', title: 'IA intégrée', text: 'Assistants, résumés automatiques, recherche dans vos documents, recommandations : l’IA là où elle apporte une vraie valeur à vos utilisateurs.' },
        { icon: 'link', title: 'API et intégrations', text: 'API documentée, webhooks, connexions avec vos outils (CRM, e-mailing, comptabilité, WhatsApp) et automatisations avec Make ou n8n.' },
        { icon: 'globe', title: 'Multilingue et multidevise', text: 'Interface en français, en anglais ou dans d’autres langues, prix en euros, en FCFA ou en dollars : un produit pensé pour vendre au-delà d’un seul pays.' },
      ],
    },
    {
      kind: 'showcase', id: 'realisations',
      head: { eyebrow: 'Réalisations', title: 'Des SaaS et des plateformes <span class="grad">déjà en ligne</span>', lead: 'Place de marché, IA, immobilier, location entre particuliers : quelques produits conçus et développés par Pirabel Labs.' },
      cta: { href: '/realisations', label: 'Toutes nos réalisations' },
      items: [
        { title: 'FreelanceHigh', tag: 'Place de marché · SaaS', text: 'Marketplace freelance bilingue et multidevise : profils vérifiés, messagerie en temps réel et paiement sous séquestre.', href: '/realisations/freelancehigh-la-marketplace-freelance-qui-securise-chaque-transaction', image: '/media/6a4539c5c3cc3ca6d4457bb8' },
        { title: 'Novakou AI', tag: 'Intelligence artificielle · SaaS', text: 'Assistant IA autonome qui déploie des agents métier pour les entreprises.', href: '/realisations/novakou-ai-l-assistant-ia-autonome-qui-deploie-des-agents-metier', image: '/media/6a4536628a05af5e91c7ff57' },
        { title: 'Kaabo', tag: 'PropTech · Plateforme', text: 'Plateforme immobilière pour l’Afrique de l’Ouest : annonces vérifiées, paiements sécurisés et contrats numériques.', href: '/realisations/kaza-la-plateforme-immobiliere-qui-securise-la-location-en-afrique-de-l-ouest', image: '/media/6a4536c88a05af5e91c7ff69' },
        { title: 'LoueMaRemorque', tag: 'Place de marché · Location', text: 'Location de remorques entre particuliers et professionnels : réservation, paiement en ligne et état des lieux photographique.', href: '/realisations/louemaremorque-location-de-remorques-entre-particuliers', image: '/img/realisations/louemaremorque-1.webp' },
      ],
    },
    {
      kind: 'cards', variant: 'reasons', id: 'pourquoi',
      head: { eyebrow: 'Pourquoi Pirabel Labs', title: 'Un partenaire produit, <span class="grad">pas seulement des développeurs</span>' },
      items: [
        { icon: 'target', title: 'On part de votre marché', text: 'Avant la moindre ligne de code, nous validons avec vous le problème, la cible et ce que vos premiers clients paieront. Le MVP ne contient que ce qui sert à vendre.' },
        { icon: 'zap', title: 'Rapide sans être bâclé', text: 'Sprints hebdomadaires, démonstration chaque semaine, environnement de test accessible en permanence : vous voyez le produit avancer et vous décidez en connaissance de cause.' },
        { icon: 'smartphone', title: 'Pensé pour l’Afrique et l’Europe', text: 'Mobile Money, connexions lentes, usage sur smartphone, plusieurs devises : nous connaissons les réalités des marchés francophones.' },
        { icon: 'key', title: 'Vous restez propriétaire', text: 'Code source, base de données, comptes d’hébergement et de paiement à votre nom. Aucune dépendance cachée à notre agence.' },
        { icon: 'shield', title: 'Sécurité et RGPD dès le départ', text: 'Authentification solide, données chiffrées, sauvegardes quotidiennes, journaux d’accès et conformité RGPD intégrés à l’architecture.' },
        { icon: 'trending', title: 'On reste après le lancement', text: 'Maintenance, nouvelles fonctionnalités, suivi des indicateurs (inscriptions, conversion, rétention) : nous faisons grandir le produit avec vous.' },
      ],
    },
    {
      kind: 'steps', variant: 'detailed', id: 'methode',
      head: { eyebrow: 'Méthode', title: 'De l’idée au SaaS en ligne, <span class="grad">en 5 étapes</span>', lead: 'Un cadre éprouvé, avec un devis ferme et un planning clair dès la deuxième semaine.' },
      items: [
        { num: '01', tag: 'Cadrage produit', title: 'Valider avant de construire', meta: '1 à 2 semaines', text: '<p>Atelier sur votre marché, vos utilisateurs et votre modèle d’abonnement. Nous priorisons les fonctionnalités du MVP et livrons un devis ferme et un planning sprint par sprint.</p>' },
        { num: '02', tag: 'Design', title: 'Maquettes et prototype cliquable', meta: '2 semaines', text: '<p>Parcours utilisateur, maquettes Figma et prototype que vous pouvez montrer à de futurs clients ou à des investisseurs avant le développement.</p>' },
        { num: '03', tag: 'Développement', title: 'Le MVP en sprints hebdomadaires', meta: '6 à 8 semaines', text: '<p>Comptes, abonnements, fonctionnalités cœur et tableau de bord. Démonstration chaque semaine, tests automatisés et environnement de préproduction en continu.</p>' },
        { num: '04', tag: 'Lancement', title: 'Mise en ligne et premiers clients', meta: '1 semaine', text: '<p>Hébergement, nom de domaine, paiements en production, suivi des indicateurs, pages de vente et e-mails automatiques pour accueillir vos premiers abonnés.</p>' },
        { num: '05', tag: 'Croissance', title: 'Itérer avec les vrais utilisateurs', meta: 'Mensuel', text: '<p>Nouvelles fonctionnalités guidées par l’usage réel, optimisation de la conversion et de la rétention, montée en charge de l’infrastructure.</p>' },
      ],
    },
    {
      kind: 'cards', variant: 'tools',
      head: { eyebrow: 'Stack technique', title: 'Des technologies <span class="grad">modernes et éprouvées</span>', lead: 'Choisies pour la vitesse, la sécurité et la facilité de reprise par n’importe quelle équipe.' },
      items: [
        { icon: 'code', title: 'Next.js et React', tag: 'Interface et rendu' },
        { icon: 'terminal', title: 'Node.js', tag: 'Serveur et API' },
        { icon: 'database', title: 'PostgreSQL et Supabase', tag: 'Base de données' },
        { icon: 'card', title: 'Stripe', tag: 'Abonnements et cartes' },
        { icon: 'smartphone', title: 'Mobile Money', tag: 'Wave, MTN, Orange Money' },
        { icon: 'cloud', title: 'Vercel', tag: 'Hébergement mondial' },
        { icon: 'brain', title: 'OpenAI et Claude', tag: 'Fonctionnalités IA' },
        { icon: 'workflow', title: 'Make et n8n', tag: 'Automatisations' },
      ],
    },
    {
      kind: 'compare',
      head: { eyebrow: 'Comparatif', title: 'SaaS sur mesure ou <span class="grad">outil no-code</span> ?', lead: 'Le no-code suffit pour tester une idée ; un vrai produit différenciant demande du sur-mesure.' },
      headers: ['Critère', 'SaaS sur mesure (Pirabel Labs)', 'No-code ou modèle', 'Freelance isolé'],
      featured: 1,
      rows: [
        ['Liberté du produit', 'Totale', 'Limitée par l’outil', 'Selon la personne'],
        ['Propriété du code', '100 % à vous', 'Aucune', 'Selon le contrat'],
        ['Montée en charge', 'Prévue dès l’architecture', 'Coûteuse, parfois impossible', 'Variable'],
        ['Coûts mensuels à long terme', 'Maîtrisés', 'Augmentent avec les utilisateurs', 'Maîtrisés'],
        ['Suivi et pérennité', 'Équipe et documentation', 'Dépend de l’éditeur', 'Risque si indisponibilité'],
        ['Délai de mise en marché', '8 à 12 semaines', '2 à 6 semaines', 'Variable'],
      ],
    },
    {
      kind: 'pricing', id: 'tarifs',
      head: { eyebrow: 'Tarifs', title: 'Tarifs de création <span class="grad">de SaaS</span>', lead: 'Prix « à partir de », confirmés par un devis ferme sous 48 h. Paiement échelonné possible.' },
      items: [
        { icon: 'rocket', title: 'MVP SaaS', text: 'Le premier produit commercialisable, centré sur l’essentiel.', price: `<small>à partir de</small><strong>${pxHtml('1 500 €', '≈ 985 000 FCFA')}</strong>`, features: ['Cadrage produit et maquettes', 'Comptes utilisateurs', 'Abonnements (Stripe ou Mobile Money)', '1 à 3 fonctionnalités cœur', 'Mise en ligne en 8 à 12 semaines'], href: '/contact?service=creation-saas', cta: 'Estimer mon MVP' },
        { icon: 'trending', title: 'SaaS de croissance', text: 'Un produit complet pour vendre et gérer des centaines de clients.', price: `<small>à partir de</small><strong>${pxHtml('3 500 €', '≈ 2 300 000 FCFA')}</strong>`, features: ['Tout le MVP', 'Espace d’administration', 'Équipes, rôles et permissions', 'API, intégrations et e-mails automatiques', 'Tableau de bord d’indicateurs'], href: '/contact?service=creation-saas', featured: true, badge: 'Le plus choisi', cta: 'Demander un devis' },
        { icon: 'layers', title: 'Plateforme sur mesure', text: 'Marketplace, multi-profils, IA avancée ou forte charge.', price: `<small>sur devis, à partir de</small><strong>${pxHtml('7 500 €', '≈ 4 920 000 FCFA')}</strong>`, features: ['Architecture évolutive', 'Plusieurs types d’utilisateurs', 'Paiements sous séquestre', 'IA et automatisations avancées', 'Accompagnement continu'], href: '/contact?service=creation-saas', cta: 'Parler de mon projet' },
      ],
    },
    {
      kind: 'faq', variant: 'main', id: 'faq',
      head: { eyebrow: 'FAQ', title: 'Vos questions sur la <span class="grad">création de SaaS</span>' },
      items: [
        { q: 'Combien coûte la création d’un SaaS ?', a: 'Chez Pirabel Labs, un MVP SaaS démarre à 1 500 € (environ 985 000 FCFA), un SaaS complet à 3 500 € (environ 2 300 000 FCFA) et une plateforme sur mesure (marketplace, multi-profils, IA avancée) à partir de 7 500 €. Le prix dépend du nombre de fonctionnalités, des types d’utilisateurs et des intégrations. Vous recevez un devis ferme sous 48 h après un appel de cadrage gratuit.' },
        { q: 'Combien de temps faut-il pour lancer un SaaS ?', a: 'Comptez 8 à 12 semaines pour un MVP : une à deux semaines de cadrage, deux semaines de design, six à huit semaines de développement en sprints hebdomadaires, puis une semaine de lancement. Un produit plus complet demande généralement de 3 à 6 mois.' },
        { q: 'Quelles technologies utilisez-vous pour développer un SaaS ?', a: 'Nous utilisons principalement Next.js et React pour l’interface, Node.js pour le serveur, PostgreSQL (souvent via Supabase) pour la base de données, Stripe pour les abonnements et Vercel pour l’hébergement. Ce sont des technologies répandues : n’importe quelle équipe peut reprendre le code.' },
        { q: 'Peut-on encaisser les abonnements par Mobile Money ?', a: 'Oui. Nous combinons Stripe pour les cartes bancaires et l’international avec des agrégateurs de paiement locaux pour Wave, MTN Mobile Money ou Orange Money. Vos clients d’Afrique francophone paient comme ils en ont l’habitude.' },
        { q: 'Le code et les données m’appartiennent-ils ?', a: 'Oui, à 100 %. Le code source, la base de données, les comptes d’hébergement et de paiement sont à votre nom. C’est un engagement écrit dans nos devis : aucune dépendance à notre agence.' },
        { q: 'Faut-il un associé technique (CTO) pour créer un SaaS ?', a: 'Non. Pirabel Labs joue ce rôle : choix techniques, architecture, sécurité, développement et documentation. Si vous recrutez plus tard une équipe interne, nous assurons la passation.' },
        { q: 'Comment valider mon idée de SaaS avant de la développer ?', a: 'Nous commençons par un atelier de cadrage, puis un prototype cliquable que vous pouvez présenter à de futurs clients. Une page de pré-inscription permet aussi de mesurer l’intérêt réel avant d’investir dans le développement complet.' },
        { q: 'Pouvez-vous intégrer de l’intelligence artificielle dans mon SaaS ?', a: 'Oui : assistants conversationnels, résumés automatiques, recherche dans vos documents, classement ou recommandations. Nous intégrons les modèles d’OpenAI, d’Anthropic ou des modèles ouverts selon vos contraintes de coût et de confidentialité. Voir aussi nos <a href="/solutions-ia">solutions IA sur mesure</a>.' },
        { q: 'Qui héberge et maintient le SaaS après le lancement ?', a: 'Votre SaaS est hébergé sur une infrastructure cloud moderne (Vercel, bases de données managées) à votre nom. Nous proposons une maintenance mensuelle : mises à jour, sécurité, sauvegardes, surveillance et évolutions. Vous pouvez aussi confier la maintenance à votre propre équipe.' },
        { q: 'Mon SaaS sera-t-il conforme au RGPD ?', a: 'Oui. Authentification sécurisée, chiffrement des données, sauvegardes, gestion des consentements, export et suppression des données à la demande : la conformité est prévue dès l’architecture, avec un hébergement en Europe si nécessaire.' },
      ],
    },
    {
      kind: 'more', id: 'details',
      head: { eyebrow: 'Guide complet', title: 'Créer un SaaS en 2026 : <span class="grad">ce qu’il faut savoir</span>', lead: 'Nos conseils détaillés, issus des produits que nous avons lancés. Ouvrez les sections qui vous intéressent.' },
      sections: [
        { title: 'Pourquoi créer un SaaS plutôt qu’un logiciel vendu une fois ?', block: prose('<p>Un SaaS facture chaque mois ou chaque année : vous bâtissez un <strong>revenu récurrent</strong> (MRR) qui s’accumule, chaque nouveau client s’ajoutant aux précédents. Le même logiciel sert dix ou dix mille clients avec une équipe à peine plus grande, ce qui crée des marges élevées.</p><p>C’est aussi un <strong>actif</strong> : une entreprise SaaS se valorise sur ses revenus récurrents, bien au-delà d’une activité de services. Enfin, de nombreuses PME d’Afrique francophone et d’Europe gèrent encore leur métier sur des tableurs et des messages WhatsApp : le besoin d’outils simples, en français et adaptés aux réalités locales, reste immense.</p>') },
        { title: 'Que mettre dans un MVP (et que laisser pour plus tard) ?', block: prose('<p>Un bon MVP résout <strong>un seul problème, très bien</strong>, pour un type d’utilisateur précis. Il contient : l’inscription et la connexion, la fonctionnalité cœur qui justifie le paiement, l’abonnement, et un minimum d’administration pour vous.</p><p>Tout le reste attend les retours des premiers clients : applications mobiles natives, intégrations secondaires, tableaux de bord avancés, personnalisation poussée. Cette discipline divise souvent le budget initial par deux et permet de lancer en 8 à 12 semaines.</p>') },
        { title: 'Choisir son modèle d’abonnement', block: prose('<p>Trois modèles dominent : le <strong>prix par utilisateur</strong> (simple à comprendre, idéal pour les outils d’équipe), le <strong>prix par formule</strong> (Essentiel, Pro, Entreprise, selon les fonctionnalités) et le <strong>prix à l’usage</strong> (par transaction, par document, par message).</p><p>Nous vous aidons à choisir selon votre marché : en Afrique francophone, des formules mensuelles modestes payables par Mobile Money convertissent souvent mieux qu’un abonnement annuel ; en Europe, une remise sur l’annuel améliore la trésorerie et la rétention.</p>') },
        { title: 'Architecture, sécurité et montée en charge', block: prose('<p>La plupart des SaaS sont <strong>multi-locataires</strong> : une seule application sert tous vos clients, chacun ne voyant que ses propres données. Cette isolation est conçue dès le départ, avec des contrôles d’accès testés automatiquement.</p><p>Côté sécurité : mots de passe chiffrés, authentification à deux facteurs possible, données chiffrées en transit et au repos, sauvegardes quotidiennes et journaux d’activité. L’infrastructure cloud absorbe la croissance : on passe de cent à dix mille utilisateurs sans réécrire le produit.</p>') },
        { title: 'Les coûts d’exploitation d’un SaaS', block: prose('<p>Au lancement, un SaaS coûte généralement quelques dizaines d’euros par mois : hébergement, base de données, envoi d’e-mails, nom de domaine. Les frais de paiement (Stripe, agrégateurs Mobile Money) sont prélevés sur chaque transaction.</p><p>Les fonctionnalités d’IA ajoutent un coût à l’usage, que nous maîtrisons par la mise en cache et le choix du bon modèle. Nous chiffrons ces coûts dès le cadrage pour que votre prix d’abonnement reste rentable.</p>') },
        { title: 'Lancer un SaaS en Afrique francophone', block: prose('<p>Trois réalités changent la conception du produit : le <strong>paiement</strong> (Mobile Money avant la carte bancaire), la <strong>connectivité</strong> (pages légères, fonctionnement correct en 3G) et l’<strong>usage mobile</strong> (la majorité des utilisateurs sur smartphone, souvent via une application installable).</p><p>La relation client passe aussi beaucoup par <strong>WhatsApp</strong> : notifications, support et relances y sont intégrés. Nos produits pour le Bénin, la Côte d’Ivoire, le Sénégal ou le Cameroun sont pensés ainsi dès la première maquette.</p>') },
      ],
    },
    {
      kind: 'cards', variant: 'insights', id: 'guides',
      head: { eyebrow: 'Guides gratuits', title: 'Nos guides pour <span class="grad">réussir votre SaaS</span>', lead: 'Douze articles détaillés, de l’idée au pilotage : lisez-les avant de nous parler, vous gagnerez du temps.' },
      items: [
        { icon: 'rocket', tag: 'Guide pilier', title: 'Créer un SaaS : le guide complet', text: 'De l’idée au premier client payant, étape par étape.', href: '/blog/creer-un-saas-guide-complet-2026', cta: 'Lire le guide' },
        { icon: 'wallet', tag: 'Budget', title: 'Combien coûte un SaaS ?', text: 'Développement, hébergement, paiement, IA : le budget réel.', href: '/blog/cout-developpement-saas-prix-2026', cta: 'Lire le guide' },
        { icon: 'layers', tag: 'MVP', title: 'Que mettre dans un MVP ?', text: 'Les briques indispensables pour lancer en 8 semaines.', href: '/blog/mvp-saas-que-mettre-dedans', cta: 'Lire le guide' },
        { icon: 'sliders', tag: 'Choix technique', title: 'Sur mesure ou no-code ?', text: 'Bubble, Softr, Glide ou code : comment choisir et quand migrer.', href: '/blog/saas-sur-mesure-ou-no-code', cta: 'Lire le guide' },
        { icon: 'smartphone', tag: 'Paiement', title: 'Abonnements et Mobile Money', text: 'Récurrence, relances et formules adaptées au Mobile Money.', href: '/blog/abonnements-saas-mobile-money', cta: 'Lire le guide' },
        { icon: 'card', tag: 'Paiement', title: 'Quel paiement en Afrique ?', text: 'Stripe, CinetPay, FedaPay, PayDunya : le comparatif.', href: '/blog/paiement-saas-afrique-stripe-cinetpay-fedapay', cta: 'Lire le guide' },
        { icon: 'lightbulb', tag: 'Idée', title: 'Valider une idée de SaaS B2B', text: 'Prouver que des entreprises paieront avant de coder.', href: '/blog/trouver-valider-idee-saas-b2b', cta: 'Lire le guide' },
        { icon: 'trending', tag: 'Prix', title: 'Fixer le prix de son SaaS', text: 'Modèles d’abonnement, méthode et erreurs à éviter.', href: '/blog/prix-saas-modeles-abonnement', cta: 'Lire le guide' },
        { icon: 'shield', tag: 'Sécurité', title: 'Sécurité et RGPD', text: 'Isolation des données, conformité et architecture fiable.', href: '/blog/securite-rgpd-saas-multi-tenant', cta: 'Lire le guide' },
        { icon: 'brain', tag: 'IA', title: 'Intégrer l’IA dans un SaaS', text: 'Cas d’usage rentables, coûts et choix des modèles.', href: '/blog/integrer-ia-dans-un-saas', cta: 'Lire le guide' },
        { icon: 'users', tag: 'Acquisition', title: 'Trouver ses premiers clients', text: 'La méthode canal par canal pour les 100 premiers.', href: '/blog/premiers-clients-saas-acquisition', cta: 'Lire le guide' },
        { icon: 'gauge', tag: 'Pilotage', title: 'MRR, churn, CAC, LTV', text: 'Les indicateurs d’un SaaS expliqués simplement.', href: '/blog/indicateurs-saas-mrr-churn-cac-ltv', cta: 'Lire le guide' },
      ],
    },
    {
      kind: 'cards', variant: 'related',
      head: { eyebrow: 'Aussi à voir', title: 'Services <span class="grad">complémentaires</span>' },
      items: [
        { icon: 'terminal', title: 'Applications web métier', text: 'Outils internes et portails clients', href: '/creation-application-web' },
        { icon: 'brain', title: 'Solutions IA sur mesure', text: 'IA intégrée à vos processus', href: '/solutions-ia' },
        { icon: 'bot', title: 'Agents IA et chatbots', text: 'Assistants WhatsApp et web', href: '/agents-ia-chatbots' },
        { icon: 'workflow', title: 'Automatisation', text: 'Make, n8n, Zapier', href: '/automatisation-marketing' },
        { icon: 'funnel', title: 'Tunnels de vente', text: 'Transformer les visiteurs en abonnés', href: '/tunnels-de-vente' },
        { icon: 'search', title: 'SEO', text: 'Faire connaître votre SaaS', href: '/seo' },
      ],
    },
  ],
};
