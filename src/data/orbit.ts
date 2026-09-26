// Projets affichés en orbite sous les 3 réalisations vedettes de l'accueil.
// Liste de repli (rendue dans le HTML, donc visible sans JavaScript et par les moteurs) :
// au chargement, le script remplace ces entrées par les réalisations publiées en base
// (GET /api/realisations : vrais visuels + liens vers chaque étude de cas).
export type OrbitProject = { title: string; sector: string; text: string; href: string; image?: string; imageAlt?: string };

export const ORBIT_FEATURED_SLUGS = [
  'kaza-la-plateforme-immobiliere-qui-securise-la-location-en-afrique-de-l-ouest',
  'freelancehigh-la-marketplace-freelance-qui-securise-chaque-transaction',
  'novakou-vendre-ses-formations-et-produits-digitaux-en-afrique-francophone',
];

export const ORBIT_PROJECTS: OrbitProject[] = [
  { title: 'Novakou AI', sector: 'Intelligence artificielle · SaaS', text: 'Un assistant IA autonome qui déploie des actions pour ses utilisateurs.', href: '/realisations' },
  { title: 'GoScale Studio', sector: 'Automatisation · IA', text: 'L’automatisation et l’IA au service des entreprises, du site aux flux internes.', href: '/realisations' },
  { title: 'Garage Boost', sector: 'Automobile · SaaS', text: 'De la vitrine optimisée pour le SEO à l’application de gestion du garage.', href: '/realisations' },
  { title: 'Pirabel Academy', sector: 'EdTech · Plateforme', text: 'Une plateforme de formation à l’automatisation, pensée pour apprendre en faisant.', href: '/realisations' },
  { title: 'Afblock', sector: 'Fintech · Web3', text: 'Un écosystème Web3 pensé pour l’Afrique.', href: '/realisations' },
  { title: 'Orinka', sector: 'RH · Recrutement', text: 'La plateforme qui révèle les talents africains.', href: '/realisations' },
  { title: 'GoScale Finance', sector: 'Finance · SaaS', text: 'Une application de gestion financière claire et rapide.', href: '/realisations' },
  { title: 'Pirabel One', sector: 'E-commerce · Mode', text: 'La boutique en ligne d’une maison de mode et de lifestyle.', href: '/realisations' },
  { title: 'Ultimauto', sector: 'Automobile · Services', text: 'Le décalaminage automobile avec une vitrine et une application métier.', href: '/realisations' },
  { title: 'EopsAI', sector: 'IA · Agence', text: 'Le site vitrine d’une agence d’intelligence artificielle.', href: '/realisations' },
  { title: 'La Voie 2 la Conscience', sector: 'Bien-être · Coaching', text: 'Une présence en ligne haut de gamme pour un accompagnement spirituel.', href: '/realisations' },
  { title: 'Axel Tenguey', sector: 'Marketing · Meta Ads', text: 'Transformer chaque euro investi en publicité Facebook en clients.', href: '/realisations' },
];
