/**
 * Carte des mots-clés prioritaires : une page cible par intention de recherche.
 * Titre (mot-clé en tête, ≤ 62 caractères), description (≤ 160) et H1 remplacent ceux du modèle.
 * Demande observée (suggestions Google, sept. 2026) : « agence web / agence digitale / agence de communication
 * digitale + ville », « création site web Côte d'Ivoire », « agence de création de site web Abidjan »,
 * « développeur web Cotonou », « site e-commerce Bénin ».
 */
export interface SeoTarget { title: string; description: string; h1?: string; lead?: string; keywords: string[] }

// « au Bénin », « en Côte d’Ivoire »… pour la phrase d'introduction (mot-clé dans les 100 premiers mots).
const IN: Record<string, string> = {
  'Bénin': 'au Bénin', 'Côte d’Ivoire': 'en Côte d’Ivoire', 'Sénégal': 'au Sénégal', 'Togo': 'au Togo', 'Cameroun': 'au Cameroun',
  'Mali': 'au Mali', 'Burkina Faso': 'au Burkina Faso', 'Guinée': 'en Guinée', 'Tunisie': 'en Tunisie', 'Maroc': 'au Maroc',
};
const hubLead = (city: string, country: string) =>
  `<strong>Pirabel Labs est une agence web et digitale à ${city}</strong> : création de sites web et de boutiques en ligne, référencement SEO, réseaux sociaux et communication digitale pour les entreprises ${IN[country] ?? ''}.`;

const hub = (city: string, country: string, extra: string): SeoTarget => ({
  title: `Agence web et digitale à ${city}${country ? ` (${country})` : ''} | Pirabel Labs`,
  description: `Agence web et digitale à ${city} : sites web, SEO, réseaux sociaux et communication digitale${extra}. Devis sous 48 h.`,
  h1: `Agence web et digitale à <span class="grad">${city}</span>`,
  lead: hubLead(city, country),
  keywords: [`agence web ${city}`, `agence digitale ${city}`, `agence de communication digitale ${city}`],
});

export const SEO_TARGETS: Record<string, SeoTarget> = {

  // --- Pages de service (mots-clés génériques) ---
  'creation-site-web': { title: 'Création de site web professionnel sur mesure | Pirabel Labs', description: 'Création de site web professionnel : site vitrine, e-commerce ou sur mesure, rapide, optimisé SEO et mobile. Dès 1 200 € ou 200 000 FCFA, devis sous 48 h.', keywords: ['création site web', 'création site internet', 'agence création site web'] },
  'agence-site-vitrine': { title: 'Création de site vitrine professionnel | Pirabel Labs', description: 'Création de site vitrine : un site clair, rapide et bien référencé qui transforme vos visiteurs en clients. Dès 1 200 € ou 200 000 FCFA.', keywords: ['création site vitrine', 'site vitrine professionnel'] },
  'agence-ecommerce': { title: 'Création de site e-commerce sur mesure | Pirabel Labs', description: 'Création de site e-commerce : boutique en ligne rapide, paiement par carte ou Mobile Money, livraison et SEO. Dès 2 500 € ou 600 000 FCFA.', keywords: ['création site e-commerce', 'créer une boutique en ligne', 'agence e-commerce'] },
  'creation-site-wordpress': { title: 'Création de site WordPress sur mesure | Pirabel Labs', description: 'Création de site WordPress sur mesure : thème personnalisé, administration simple, SEO, sécurité et maintenance. Dès 1 200 € ou 200 000 FCFA, devis sous 48 h.', keywords: ['création site WordPress', 'agence WordPress'] },
  'creation-application-web': { title: 'Développement d’application web sur mesure | Pirabel Labs', description: 'Développement d’application web sur mesure : plateformes, outils métier, espaces clients et SaaS, du cadrage à la mise en ligne. Dès 3 500 € ou 1 200 000 FCFA.', keywords: ['développement application web', 'création application web'] },
  'seo': { title: 'Agence SEO : référencement naturel Google et IA | Pirabel Labs', description: 'Agence SEO : audit, SEO technique, contenus, netlinking et GEO pour apparaître sur Google et dans les réponses des IA. Dès 590 € ou 120 000 FCFA par mois.', keywords: ['agence SEO', 'référencement naturel', 'agence référencement'] },
  'seo-local': { title: 'SEO local : être premier sur Google Maps | Pirabel Labs', description: 'SEO local : fiche Google optimisée, avis clients, pages locales et citations pour apparaître dans le pack local de Google Maps. Dès 390 € ou 90 000 FCFA par mois.', keywords: ['SEO local', 'référencement local'] },
  'fiche-google-business': { title: 'Optimisation de fiche Google Business Profile | Pirabel Labs', description: 'Optimisation de fiche Google Business Profile : catégories, photos, posts, avis et suivi pour gagner des appels et des visites. Dès 290 € ou 60 000 FCFA.', keywords: ['fiche Google Business', 'Google Business Profile'] },
  'community-management': { title: 'Agence community management et réseaux sociaux | Pirabel Labs', description: 'Agence community management : stratégie, contenus, publication et animation sur Facebook, Instagram, TikTok et LinkedIn. Dès 450 € ou 100 000 FCFA/mois.', keywords: ['agence community management', 'community manager', 'gestion réseaux sociaux'] },
  'automatisation-marketing': { title: 'Agence automatisation marketing (Make, n8n) | Pirabel Labs', description: 'Automatisation marketing : scénarios Make, n8n et Zapier, CRM, relances et agents IA pour gagner du temps et convertir plus. Dès 600 € ou 250 000 FCFA.', keywords: ['automatisation marketing', 'agence Make', 'agence n8n'] },
  'agents-ia-chatbots': { title: 'Création d’agents IA et de chatbots sur mesure | Pirabel Labs', description: 'Création d’agents IA et de chatbots pour votre site et WhatsApp : réponses 24 h/24, rendez-vous et qualification des prospects. Dès 1 500 € ou 450 000 FCFA.', keywords: ['création chatbot IA', 'agent IA entreprise'] },
  'email-marketing-crm': { title: 'Agence e-mail marketing et CRM (Brevo, HubSpot) | Pirabel Labs', description: 'Agence e-mail marketing et CRM : mise en place de Brevo ou HubSpot, séquences automatisées, segmentation et délivrabilité. Dès 490 € ou 90 000 FCFA.', keywords: ['agence emailing', 'e-mail marketing', 'CRM'] },
  'tunnels-de-vente': { title: 'Création de tunnel de vente qui convertit | Pirabel Labs', description: 'Création de tunnel de vente : page de vente, paiement, relances e-mail et WhatsApp pour transformer votre trafic en clients. Dès 990 € ou 350 000 FCFA.', keywords: ['tunnel de vente', 'création tunnel de vente'] },
  'montage-video': { title: 'Montage vidéo Reels, TikTok et YouTube | Pirabel Labs', description: 'Montage vidéo pour les réseaux sociaux : Reels, TikTok, YouTube Shorts et vidéos d’entreprise, sous-titres et motion design. Dès 250 € ou 35 000 FCFA par mois.', keywords: ['montage vidéo', 'monteur vidéo réseaux sociaux'] },
  'refonte-site-web': { title: 'Refonte de site web sans perte de SEO | Pirabel Labs', description: 'Refonte de site web : audit, nouveau design, migration et redirections 301 pour moderniser votre site sans perdre votre trafic Google. Devis gratuit sous 48 h.', keywords: ['refonte site web', 'refonte site internet'] },
  // --- Bénin (marché local, priorité 1) ---
  'agence-marketing-cotonou': {
    title: 'Agence web et digitale à Cotonou (Bénin) | Pirabel Labs',
    description: 'Agence web, digitale et de communication digitale au Bénin : sites web, e-commerce Mobile Money, SEO et réseaux sociaux à Cotonou. Devis sous 48 h.',
    h1: 'Agence web et digitale à <span class="grad">Cotonou</span>',
    lead: '<strong>Pirabel Labs est une agence web et digitale à Cotonou</strong>, avec son siège à Abomey-Calavi : création de sites web et de sites e-commerce, référencement SEO, réseaux sociaux et communication digitale pour les entreprises du Bénin.',
    keywords: ['agence web Cotonou', 'agence web Bénin', 'agence digitale Cotonou', 'agence digitale Bénin', 'agence de communication digitale au Bénin'],
  },
  'agence-marketing-abomey-calavi': { ...hub('Abomey-Calavi', 'Bénin', ', avec rendez-vous à notre siège'), title: 'Agence web et digitale à Abomey-Calavi | Pirabel Labs' },
  'agence-marketing-porto-novo': hub('Porto-Novo', 'Bénin', ' et paiement Mobile Money'),
  'creation-site-web-cotonou': {
    title: 'Création de site web à Cotonou, au Bénin | Pirabel Labs',
    description: 'Création de site web au Bénin : sites vitrines, e-commerce Mobile Money et sur mesure, par nos développeurs web à Cotonou. Dès 200 000 FCFA.',
    h1: 'Création de site web à <span class="grad">Cotonou</span>, au Bénin',
    lead: '<strong>Création de site web au Bénin</strong> : nos développeurs web conçoivent à Cotonou des sites vitrines, des sites e-commerce avec paiement Mobile Money et des plateformes sur mesure, rapides sur mobile et optimisés pour Google.',
    keywords: ['création site web Cotonou', 'création site web Bénin', 'site e-commerce Bénin', 'développeur web Cotonou'],
  },
  'seo-cotonou': {
    title: 'Agence SEO au Bénin : référencement à Cotonou | Pirabel Labs',
    description: 'Agence SEO à Cotonou : référencement naturel, SEO local, fiche Google et visibilité dans les moteurs IA pour les entreprises du Bénin. Dès 120 000 FCFA par mois.',
    h1: 'Agence SEO à <span class="grad">Cotonou</span> : référencement Google au Bénin',
    lead: '<strong>Agence SEO au Bénin</strong>, nous améliorons le référencement Google de votre entreprise à Cotonou : SEO technique, contenus, SEO local et fiche Google, et visibilité dans les moteurs de réponse IA.',
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
    lead: '<strong>Agence de création de site web à Abidjan</strong>, nous concevons pour les entreprises de Côte d’Ivoire des sites vitrines, des boutiques en ligne avec Mobile Money et des plateformes sur mesure, rapides sur mobile.',
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
    lead: '<strong>Création de site web au Sénégal</strong> : nous concevons à Dakar des sites vitrines, des boutiques en ligne reliées à Wave et Orange Money et des plateformes sur mesure, rapides même en 3G.',
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
