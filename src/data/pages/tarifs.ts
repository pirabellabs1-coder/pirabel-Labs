import type { PageData } from '../../components/blocks/BlockPage.astro';
import type { Region } from '../../components/blocks/PricingTabs.astro';

const WA = 'https://wa.me/16139273067?text=Bonjour%20Pirabel%20Labs%2C%20j%E2%80%99ai%20un%20projet';

// Grille indicative (prix « à partir de ») révisée à la baisse en septembre 2026, alignée sur les prix
// annoncés sur les pages villes. Zones FCFA : montants en FCFA (équivalent en euros calculé).
export const regions: Region[] = [
  {
    id: 'afrique-ouest', short: 'Afrique de l’Ouest', label: 'Bénin et Afrique de l’Ouest (zone UEMOA)', currency: 'XOF',
    note: 'Prix en FCFA (XOF). Paiement par Mobile Money, virement ou carte.',
    offers: [
      { icon: 'code', title: 'Site vitrine', text: 'Site professionnel de 5 à 12 pages, design sur mesure, SEO de base, formulaire de contact.', fcfa: 200000, meta: 'Forfait projet, livré en 3 à 5 semaines', service: 'creation-site-web', features: ['Design Figma sur mesure', 'WordPress ou Webflow', '5 à 12 pages incluses', 'Pensé mobile d’abord, rapide', 'SEO on-page de base', 'Formation à la prise en main'] },
      { icon: 'cart', title: 'E-commerce', text: 'Boutique en ligne complète, Mobile Money, gestion des stocks, livraison.', fcfa: 600000, meta: 'Forfait projet, livré en 6 à 10 semaines', service: 'creation-site-web', badge: 'Le plus demandé', features: ['WooCommerce, Shopify ou sur mesure', 'Catalogue jusqu’à 200 produits', 'Paiement Mobile Money et carte', 'Tunnel d’achat optimisé', 'E-mails de confirmation et suivi de commande', 'Formation complète'] },
      { icon: 'search', title: 'SEO mensuel', text: 'Stratégie SEO complète : audit, mots-clés, contenu, netlinking, reporting.', fcfa: 120000, monthly: true, meta: 'Engagement de 6 à 12 mois minimum', service: 'seo', features: ['Audit SEO complet initial', 'Recherche de 50+ mots-clés', '4 articles SEO par mois', 'Optimisation technique continue', 'Netlinking éthique', 'Reporting mensuel chiffré'] },
      { icon: 'message', title: 'Community management', text: 'Gestion de 2 à 4 réseaux : stratégie, création de contenus, animation, publicités.', fcfa: 100000, monthly: true, meta: 'Engagement de 3 mois minimum', service: 'community-management', features: ['Stratégie éditoriale sur mesure', '12 à 20 publications par mois', 'Stories, Reels, vidéos courtes', 'Animation de la communauté', 'Publicités Meta et TikTok Ads', 'Reporting mensuel'] },
      { icon: 'funnel', title: 'Tunnel de vente', text: 'Landing pages optimisées, tests A/B, paiement simplifié, intégration CRM.', fcfa: 350000, meta: 'Forfait projet, livré en 2 à 4 semaines', service: 'tunnels-de-vente', features: ['Audit du tunnel actuel', 'Conception des nouvelles landing pages', 'Paiement Mobile Money optimisé', 'Tests A/B systématiques', 'Intégration CRM (HubSpot, Brevo)', 'Reporting hebdomadaire'] },
      { icon: 'workflow', title: 'Automatisation', text: 'Make, n8n, Brevo, HubSpot : des workflows automatisés pour gagner du temps.', fcfa: 250000, meta: 'Forfait projet, livré en 2 à 6 semaines', service: 'automatisation-marketing', features: ['Audit des processus actuels', 'Workflows Make ou n8n', 'Intégration CRM (HubSpot, Brevo)', 'Séquences d’e-mails automatisées', 'Chatbots WhatsApp et agents IA', 'Formation de l’équipe et documentation'] },
    ],
  },
  {
    id: 'afrique-centrale', short: 'Afrique centrale', label: 'Cameroun et Afrique centrale (zone CEMAC)', currency: 'XAF',
    note: 'Prix en FCFA (XAF). Paiement par MTN MoMo, Orange Money ou virement.',
    offers: [
      { icon: 'code', title: 'Site vitrine', text: 'Site professionnel de 5 à 12 pages, design sur mesure, SEO de base.', fcfa: 200000, meta: 'Forfait projet, livré en 3 à 5 semaines', service: 'creation-site-web', features: ['Design Figma sur mesure', 'WordPress ou Webflow', 'Pensé mobile d’abord, rapide', 'SEO on-page intégré', 'Hébergement européen et formation'] },
      { icon: 'cart', title: 'E-commerce', text: 'Boutique en ligne complète, Mobile Money MTN et Orange, gestion des stocks.', fcfa: 600000, meta: 'Forfait projet, livré en 6 à 10 semaines', service: 'creation-site-web', badge: 'Recommandé', features: ['WooCommerce ou Shopify', 'Paiement MTN MoMo et Orange Money', 'Tunnel d’achat optimisé', 'Notifications WhatsApp'] },
      { icon: 'search', title: 'SEO mensuel', text: 'Stratégie SEO Yaoundé et Douala : audit, contenu, netlinking, reporting.', fcfa: 120000, monthly: true, meta: 'Engagement de 6 mois minimum', service: 'seo', features: ['Audit SEO complet', 'Mots-clés locaux Yaoundé et Douala', '4 articles SEO par mois', 'Reporting mensuel'] },
    ],
  },
  {
    id: 'guinee', short: 'Guinée', label: 'Guinée', currency: 'GNF',
    note: 'Facturation en francs guinéens (GNF) au taux du jour, ou en euros. Paiement par Orange Money, MTN MoMo ou virement.',
    offers: [
      { icon: 'code', title: 'Site vitrine', text: 'Site professionnel de 5 à 12 pages, pensé pour le marché guinéen.', eur: 350, meta: 'Forfait projet, livré en 3 à 5 semaines', service: 'creation-site-web', features: ['Design Figma sur mesure', 'WordPress ou Webflow', 'Optimisé pour la 3G/4G', 'SEO local Conakry', 'Hébergement européen et formation'] },
      { icon: 'cart', title: 'E-commerce', text: 'Boutique en ligne, Orange Money Guinée, MTN MoMo.', eur: 950, meta: 'Forfait projet, livré en 6 à 10 semaines', service: 'creation-site-web', badge: 'Recommandé', features: ['WooCommerce et paiements locaux', 'Tunnel d’achat optimisé et WhatsApp', 'Catalogue et suivi de commande'] },
      { icon: 'search', title: 'SEO mensuel', text: 'SEO Conakry : audit, contenu, mots-clés encore peu disputés.', eur: 200, monthly: true, meta: 'Engagement de 6 mois minimum', service: 'seo', features: ['Audit SEO et concurrence locale', '3 articles SEO par mois', 'Optimisation technique', 'Reporting mensuel'] },
    ],
  },
  {
    id: 'europe', short: 'Europe', label: 'France, Belgique, Suisse et Europe', currency: 'EUR',
    note: 'Facturation en euros. Paiement par virement SEPA, carte bancaire ou Bancontact.',
    offers: [
      { icon: 'code', title: 'Site vitrine', text: 'Site professionnel conforme au RGPD, hébergé en Europe, optimisé Core Web Vitals.', eur: 1200, meta: 'Forfait projet, livré en 3 à 5 semaines', service: 'creation-site-web', features: ['Design Figma sur mesure', 'WordPress, Webflow ou Next.js', 'Core Web Vitals optimisés', 'RGPD : bannière cookies et mentions', 'SEO on-page intégré', 'Hébergement européen et formation'] },
      { icon: 'cart', title: 'E-commerce', text: 'Boutique en ligne moderne, Stripe, Shopify ou WooCommerce, conforme au RGPD.', eur: 2500, meta: 'Forfait projet, livré en 6 à 10 semaines', service: 'creation-site-web', badge: 'Le plus demandé', features: ['Shopify, WooCommerce ou Next.js', 'Paiement Stripe et Bancontact', 'Tunnel d’achat optimisé', 'Multilingue FR/NL/EN possible', 'Formation et suivi de 30 jours'] },
      { icon: 'search', title: 'SEO mensuel', text: 'SEO Paris, Lyon, Bruxelles : audit, contenu, netlinking premium.', eur: 590, monthly: true, meta: 'Engagement de 6 mois minimum', service: 'seo', features: ['Audit SEO complet et concurrence', '4 articles SEO premium par mois', 'Netlinking thématisé européen', 'Optimisation technique continue', 'Reporting mensuel détaillé'] },
      { icon: 'message', title: 'Community management', text: 'Gestion des réseaux sociaux, contenus premium, publicités Meta et TikTok.', eur: 450, monthly: true, meta: 'Engagement de 3 mois minimum', service: 'community-management', features: ['Stratégie éditoriale', '12 à 20 publications par mois', 'Reels, stories, vidéos courtes', 'Meta Ads et TikTok Ads', 'Reporting mensuel'] },
    ],
  },
];

export const page: PageData = {
  path: '/tarifs',
  title: 'Tarifs : site web, SEO, réseaux sociaux | Pirabel Labs',
  description: 'Nos tarifs en clair, par région (FCFA, GNF, EUR) : site vitrine, e-commerce, SEO, community management, automatisation. Devis ferme sous 48 h.',
  legacyLd: 'tarifs',
  footerCta: {
    title: 'Prêt à recevoir votre devis ferme ?',
    text: 'Demandez un appel découverte gratuit de 30 minutes : vous repartez avec un devis ferme sous 48 h, sans engagement. Réponse garantie du fondateur.',
    href: '/contact',
    label: 'Demander un devis ferme',
  },
  blocks: [
    { kind: 'breadcrumb', items: [{ href: '/', label: 'Accueil' }, { label: 'Tarifs' }] },
    {
      kind: 'hero',
      eyebrow: 'Tarifs transparents',
      eyebrowIcon: 'wallet',
      title: 'Nos <span class="grad">tarifs</span>, en clair et sans surprise',
      lead: 'Une grille indicative pour chaque service, adaptée à chaque région : FCFA pour l’Afrique de l’Ouest et centrale, GNF pour la Guinée, euros pour l’Europe. Devis ferme sous 48 h après un appel découverte de 30 minutes.',
      ctas: [
        { href: '/contact', label: 'Demander un devis ferme', primary: true },
        { href: WA, label: 'Discuter sur WhatsApp', external: true },
      ],
      icons: ['card', 'wallet', 'chart'],
      caption: 'Aucun frais caché',
      chips: [
        { icon: 'badge-check', text: 'Devis ferme sous 48 h' },
        { icon: 'calendar', text: 'Paiement échelonné' },
        { icon: 'smartphone', text: 'Mobile Money accepté' },
      ],
    },
  ],
  after: [
    { kind: 'cta', variant: 'inline', title: 'Votre projet ne rentre dans aucune case ?', text: 'Nous chiffrons chaque projet sur mesure — devis gratuit, réponse sous 24 h.', ctas: [{ href: '/contact', label: 'Demander un devis' }, { href: WA, label: 'WhatsApp', external: true }] },
    {
      kind: 'cards', variant: 'features',
      head: { eyebrow: 'Paiement', title: 'Moyens de <span class="grad">paiement acceptés</span>', lead: 'Nous facturons en monnaie locale selon votre région, avec des moyens de paiement adaptés à chaque marché.' },
      items: [
        { icon: 'card', title: 'Virement SEPA', text: 'Europe (France, Belgique, Luxembourg). Réception sous 24 à 72 h.' },
        { icon: 'wallet', title: 'Carte bancaire', text: 'Visa, Mastercard et Bancontact via Stripe. Paiement immédiat.' },
        { icon: 'smartphone', title: 'Mobile Money', text: 'MTN MoMo, Orange Money, Moov Money, Wave, SAMA Money.' },
        { icon: 'building', title: 'Virement bancaire', text: 'XOF (UEMOA), XAF (CEMAC), GNF, EUR, USD. Factures légalisées.' },
      ],
    },
    {
      kind: 'faq', variant: 'main',
      head: { eyebrow: 'FAQ tarifs', title: 'Questions <span class="grad">tarifs</span>', lead: 'Les questions les plus posées sur nos tarifs et notre facturation.' },
      items: [
        { q: 'Pourquoi les tarifs varient-ils selon les régions ?', a: 'Nous adaptons nos tarifs au pouvoir d’achat de chaque marché. Un site web se vend 5 à 15 fois plus cher à Paris qu’à Cotonou, pour des coûts de production similaires. Notre implantation au Bénin nous permet de pratiquer des tarifs justes : accessibles en Afrique, compétitifs en Europe (30 à 50 % sous les agences locales).' },
        { q: 'Vos tarifs sont-ils négociables ?', a: 'Nos tarifs sont fermes une fois le devis établi (sous 48 h). Le périmètre peut s’adapter (moins de pages, fonctionnalités différées) pour rester dans votre budget. Nous proposons aussi des paiements échelonnés pour les projets importants.' },
        { q: 'Y a-t-il des frais cachés ?', a: 'Non. Le devis ferme comprend tout : design, développement, intégration, formation et suivi de 30 jours. Les seuls coûts supplémentaires, toujours mentionnés dès le devis, sont l’hébergement (30 à 200 € par an), le nom de domaine (10 à 30 € par an) et d’éventuelles licences (thèmes premium, extensions).' },
        { q: 'Acceptez-vous le paiement échelonné ?', a: 'Oui. Pour les projets à partir de 650 000 FCFA ou 1 000 €, nous proposons 30 % d’acompte au lancement, 40 % à mi-projet et 30 % à la livraison. Pour les engagements mensuels (SEO, community management, automatisation), la facturation intervient au début de chaque mois.' },
        { q: 'Que comprend exactement un forfait projet ?', a: 'Tout ce qui est mentionné dans le devis : design, développement, intégration, contenus, tests, mise en ligne et formation, plus un suivi de 30 jours après le lancement pour ajuster ce qui doit l’être. Au-delà, les évolutions sont facturées au temps passé ou au forfait.' },
        { q: 'Facturez-vous la TVA ?', a: 'Nous sommes établis au Bénin (zone UEMOA). Nos factures sont légales et acceptées par les comptables français, belges, ivoiriens, etc. Aucune TVA n’est appliquée (régime de prestataire africain). Si votre comptable exige une TVA, nous pouvons facturer via une entité partenaire européenne, sur demande.' },
        { q: 'Faites-vous des réductions pour les associations et les ONG ?', a: 'Oui : 20 % de réduction pour les associations à but non lucratif, les ONG et les structures d’intérêt général, sur présentation des statuts. Nous accompagnons notamment plusieurs ONG en Afrique de l’Ouest.' },
      ],
    },
  ],
};
