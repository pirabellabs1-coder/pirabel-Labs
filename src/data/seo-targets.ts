/**
 * Carte des mots-clés prioritaires : une page cible par intention de recherche.
 * Titre (mot-clé en tête, ≤ 62 caractères), description (≤ 160) et H1 remplacent ceux du modèle.
 * Demande observée (suggestions Google, sept. 2026) : « agence web / agence digitale / agence de communication
 * digitale + ville », « création site web Côte d'Ivoire », « agence de création de site web Abidjan »,
 * « développeur web Cotonou », « site e-commerce Bénin ».
 */
export interface SeoTarget { title: string; description: string; h1: string; keywords: string[] }

const hub = (city: string, country: string, extra: string): SeoTarget => ({
  title: `Agence web et digitale à ${city}${country ? ` (${country})` : ''} | Pirabel Labs`,
  description: `Agence web et digitale à ${city} : sites web, SEO, réseaux sociaux et communication digitale${extra}. Devis sous 48 h.`,
  h1: `Agence web et digitale à <span class="grad">${city}</span>`,
  keywords: [`agence web ${city}`, `agence digitale ${city}`, `agence de communication digitale ${city}`],
});

export const SEO_TARGETS: Record<string, SeoTarget> = {
  // --- Bénin (marché local, priorité 1) ---
  'agence-marketing-cotonou': {
    title: 'Agence web et digitale à Cotonou (Bénin) | Pirabel Labs',
    description: 'Agence web, digitale et de communication digitale au Bénin : sites web, e-commerce Mobile Money, SEO et réseaux sociaux à Cotonou. Devis sous 48 h.',
    h1: 'Agence web et digitale à <span class="grad">Cotonou</span>',
    keywords: ['agence web Cotonou', 'agence web Bénin', 'agence digitale Cotonou', 'agence digitale Bénin', 'agence de communication digitale au Bénin'],
  },
  'agence-marketing-abomey-calavi': { ...hub('Abomey-Calavi', 'Bénin', ', avec rendez-vous à notre siège'), title: 'Agence web et digitale à Abomey-Calavi | Pirabel Labs' },
  'agence-marketing-porto-novo': hub('Porto-Novo', 'Bénin', ' et paiement Mobile Money'),
  'creation-site-web-cotonou': {
    title: 'Création de site web à Cotonou, au Bénin | Pirabel Labs',
    description: 'Création de site web au Bénin : sites vitrines, e-commerce Mobile Money et sur mesure, par nos développeurs web à Cotonou. Dès 200 000 FCFA.',
    h1: 'Création de site web à <span class="grad">Cotonou</span>, au Bénin',
    keywords: ['création site web Cotonou', 'création site web Bénin', 'site e-commerce Bénin', 'développeur web Cotonou'],
  },
  'seo-cotonou': {
    title: 'Agence SEO au Bénin : référencement à Cotonou | Pirabel Labs',
    description: 'Agence SEO à Cotonou : référencement naturel, SEO local, fiche Google et visibilité dans les moteurs IA pour les entreprises du Bénin. Dès 120 000 FCFA par mois.',
    h1: 'Agence SEO à <span class="grad">Cotonou</span> : référencement Google au Bénin',
    keywords: ['agence SEO Bénin', 'référencement Cotonou', 'référencement Google Bénin'],
  },
  // --- Afrique de l'Ouest et centrale (priorité 2) ---
  'agence-web-abidjan': {
    ...hub('Abidjan', 'Côte d’Ivoire', ', avec Orange Money, MTN et Wave'),
    title: 'Agence web et digitale à Abidjan, Côte d’Ivoire | Pirabel Labs',
    keywords: ['agence web Abidjan', 'agence web Côte d’Ivoire', 'agence digitale Abidjan', 'agence de communication digitale Abidjan', 'agence marketing digital Abidjan'],
  },
  'creation-site-web-abidjan': {
    title: 'Création de site web à Abidjan, Côte d’Ivoire | Pirabel Labs',
    description: 'Agence de création de site web à Abidjan : sites vitrines, e-commerce et sur mesure en Côte d’Ivoire, avec Mobile Money. Dès 200 000 FCFA.',
    h1: 'Création de site web à <span class="grad">Abidjan</span>, en Côte d’Ivoire',
    keywords: ['création site web Côte d’Ivoire', 'agence de création de site web Abidjan'],
  },
  'seo-abidjan': {
    title: 'Agence SEO à Abidjan : référencement Google | Pirabel Labs',
    description: 'Agence SEO à Abidjan : référencement naturel, SEO local, fiche Google et visibilité dans les moteurs IA pour la Côte d’Ivoire. Devis sous 48 h.',
    h1: 'Agence SEO à <span class="grad">Abidjan</span> : référencement Google',
    keywords: ['agence SEO Abidjan', 'référencement Côte d’Ivoire'],
  },
  'agence-web-dakar': {
    ...hub('Dakar', 'Sénégal', ', avec Wave et Orange Money'),
    keywords: ['agence web Dakar', 'agence digitale Dakar', 'agence de communication digitale Dakar', 'agence marketing digital Dakar'],
  },
  'creation-site-web-dakar': {
    title: 'Création de site web à Dakar, Sénégal | Pirabel Labs',
    description: 'Création de site web au Sénégal : vitrines, e-commerce et sur mesure à Dakar, rapides sur mobile, avec Wave et Orange Money. Devis sous 48 h.',
    h1: 'Création de site web à <span class="grad">Dakar</span>, au Sénégal',
    keywords: ['création site web Dakar', 'création site web Sénégal'],
  },
  'seo-dakar': {
    title: 'Agence SEO à Dakar : référencement Google | Pirabel Labs',
    description: 'Agence SEO à Dakar : référencement naturel, SEO local, fiche Google et visibilité dans les moteurs IA pour le Sénégal. Devis sous 48 h.',
    h1: 'Agence SEO à <span class="grad">Dakar</span> : référencement Google',
    keywords: ['agence SEO Dakar', 'référencement Sénégal'],
  },
  'agence-web-lome': hub('Lomé', 'Togo', ' et paiement Mobile Money'),
  'agence-web-douala': hub('Douala', 'Cameroun', ', avec MTN MoMo et Orange Money'),
  'agence-web-yaounde': hub('Yaoundé', 'Cameroun', ', bilingues français-anglais'),
  'agence-web-bamako': hub('Bamako', 'Mali', ', légers même en 3G'),
  'agence-web-ouagadougou': { ...hub('Ouagadougou', 'Burkina Faso', ' et paiement Mobile Money'), title: 'Agence web et digitale à Ouagadougou | Pirabel Labs' },
  'agence-web-conakry': hub('Conakry', 'Guinée', ', en francs guinéens ou en euros'),
  // --- Maghreb (la demande y parle d'« agence digitale » et d'« agence marketing digital ») ---
  'agence-web-casablanca': {
    title: 'Agence digitale et web à Casablanca | Pirabel Labs',
    description: 'Agence digitale et de marketing digital à Casablanca : sites web en français, arabe et anglais, SEO, réseaux sociaux et paiement CMI. Devis gratuit sous 48 h.',
    h1: 'Agence digitale et web à <span class="grad">Casablanca</span>',
    keywords: ['agence digitale Casablanca', 'agence marketing digital Casablanca', 'agence web Maroc'],
  },
  'agence-web-tunis': hub('Tunis', 'Tunisie', ' en français, anglais et arabe'),
};
