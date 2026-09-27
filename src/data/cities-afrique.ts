/** Contenu local : Bénin, Afrique de l'Ouest et Cameroun. Voir les règles dans cities.ts. */
import type { CityLocal } from './cities';

const P = {
  kaabo: 'kaza-la-plateforme-immobiliere-qui-securise-la-location-en-afrique-de-l-ouest',
  pirabelOne: 'pirabel-one-la-boutique-en-ligne-d-une-maison-de-mode-beninoise',
  goscale: 'goscale-studio-l-automatisation-et-l-ia-au-service-de-la-croissance-des-entrepri',
  pirabelLabs: 'pirabel-labs-notre-propre-plateforme-vitrine-blog-crm-et-assistant-ia-sur-mesure',
  novakou: 'novakou-vendre-ses-formations-et-produits-digitaux-en-afrique-francophone',
  afblock: 'afblock-l-ecosysteme-web3-pense-pour-l-afrique',
  orinka: 'orinka-la-plateforme-qui-revele-les-talents-africains-au-monde',
};
const WEST = { title: 'Nos projets livrés <span class="grad">en Afrique de l’Ouest</span>', lead: 'Des plateformes en ligne, avec paiement Mobile Money, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.kaabo, P.novakou, P.afblock] };
const BENIN = (where: string) => ({ title: `Nos projets livrés <span class="grad">${where}</span>`, lead: 'Des sites et des plateformes en ligne, pour de vrais clients béninois : ouvrez-les, testez-les.', slugs: [P.kaabo, P.pirabelOne, P.goscale] });
const PRICES_FCFA = 'Nos prix de départ pour l’Afrique de l’Ouest : site vitrine dès 200 000 FCFA, boutique en ligne dès 600 000 FCFA, référencement dès 120 000 FCFA par mois. Le devis ferme, gratuit, est établi sous 48 h après un appel de cadrage.';
const REMOTE_WEST = (city: string, pays: string) => ({
  q: `Comment travaillez-vous avec une entreprise de ${city} depuis le Bénin ?`,
  a: `À distance, simplement : visioconférence ou appel WhatsApp, un interlocuteur unique du cadrage à la mise en ligne, et des points réguliers. ${pays} a une heure de moins que le Bénin, ce qui laisse de longues plages communes. Devis et factures en FCFA, paiement par Mobile Money ou virement.`,
});

export const CITIES_AFRIQUE: Record<string, CityLocal> = {
  cotonou: {
    name: 'Cotonou',
    area: 'Cotonou et le Littoral',
    title: 'Travailler avec nous <span class="grad">à Cotonou</span>',
    intro:
      '<p>Cotonou est la capitale économique du Bénin : son port, ses marchés et ses commerces font vivre toute la région. Ici, les clients cherchent sur leur téléphone, écrivent sur WhatsApp et paient par Mobile Money : un site cotonois doit être léger, rapide même sur une connexion moyenne, et relié à ces usages.</p>' +
      '<p>Nous y avons livré la boutique en ligne de <a href="/realisations/pirabel-one-la-boutique-en-ligne-d-une-maison-de-mode-beninoise">Pirabel — Maison de Cotonou</a> et la plateforme immobilière <a href="/realisations/kaza-la-plateforme-immobiliere-qui-securise-la-location-en-afrique-de-l-ouest">Kaabo</a>. Notre siège d’Abomey-Calavi est à quelques kilomètres : les rendez-vous peuvent se faire sur place.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Commerce et import-export', 'Mode et e-commerce', 'Immobilier', 'Restauration et hôtellerie', 'Services et conseil'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Ganhi et le centre', 'Haie Vive et Cadjèhoun', 'Fidjrossè', 'Akpakpa', 'Tout le Grand Cotonou'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['MTN MoMo', 'Moov Money', 'Celtiis Cash', 'Carte Visa et Mastercard', 'Paiement à la livraison'] },
      { title: 'Conformité', icon: 'shield', items: ['Code du numérique du Bénin (APDP)', 'Mentions légales et CGV', 'Factures en FCFA', 'Français et anglais'] },
    ],
    projects: BENIN('à Cotonou'),
    faq: [
      { q: 'Peut-on vous rencontrer à Cotonou ?', a: 'Oui. Notre siège est à Abomey-Calavi, à quelques kilomètres : nous pouvons vous recevoir ou venir vous voir, en plus des échanges en visioconférence et sur WhatsApp.' },
      { q: 'Combien coûte un site à Cotonou ?', a: PRICES_FCFA },
      { q: 'Mon site peut-il encaisser par Mobile Money ?', a: 'Oui : MTN MoMo, Moov Money et Celtiis Cash, en plus de la carte bancaire et du paiement à la livraison. C’est ce que nous avons mis en place pour la boutique de Pirabel — Maison de Cotonou.' },
    ],
  },

  'abomey-calavi': {
    name: 'Abomey-Calavi',
    area: 'Abomey-Calavi, notre siège',
    title: 'Notre agence <span class="grad">à Abomey-Calavi</span>',
    intro:
      '<p>Abomey-Calavi est l’une des communes qui grandissent le plus vite au Bénin : ville universitaire, nouveaux quartiers résidentiels, commerces et services qui s’installent chaque année. C’est aussi là que se trouve le siège de Pirabel Labs : vous pouvez nous rencontrer, suivre votre projet de près et être formé sur place.</p>' +
      '<p>Nous avons construit ici notre propre plateforme, <a href="/realisations/pirabel-labs-notre-propre-plateforme-vitrine-blog-crm-et-assistant-ia-sur-mesure">site, blog, CRM et assistant IA</a>, et nous accompagnons des entreprises de tout le Grand Cotonou, comme <a href="/realisations/kaza-la-plateforme-immobiliere-qui-securise-la-location-en-afrique-de-l-ouest">Kaabo</a>.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Éducation et formation', 'Immobilier', 'Commerce de proximité', 'Santé', 'Services aux étudiants'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Calavi centre', 'Godomey', 'Autour de l’université (UAC)', 'Togba et Hêvié', 'Cotonou et Ouidah'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['MTN MoMo', 'Moov Money', 'Celtiis Cash', 'Carte Visa et Mastercard', 'Virement bancaire'] },
      { title: 'Conformité', icon: 'shield', items: ['Code du numérique du Bénin (APDP)', 'Mentions légales et CGV', 'Factures en FCFA', 'Français et anglais'] },
    ],
    projects: { ...BENIN('au Bénin'), slugs: [P.pirabelLabs, P.kaabo, P.pirabelOne] },
    faq: [
      { q: 'Où se trouve votre agence ?', a: 'Notre siège est à Abomey-Calavi. Vous pouvez nous rencontrer sur rendez-vous, et nous nous déplaçons aussi à Godomey, à Cotonou et dans les environs.' },
      { q: 'Combien coûte un site à Abomey-Calavi ?', a: PRICES_FCFA },
      { q: 'Pouvez-vous former mon équipe à utiliser le site ?', a: 'Oui. Chaque projet se termine par une formation à la prise en main ; pour nos clients d’Abomey-Calavi et du Grand Cotonou, elle peut se faire en présentiel.' },
    ],
  },

  'porto-novo': {
    name: 'Porto-Novo',
    area: 'Porto-Novo et l’Ouémé',
    title: 'Travailler avec nous <span class="grad">à Porto-Novo</span>',
    intro:
      '<p>Porto-Novo est la capitale officielle du Bénin : Assemblée nationale, administrations, écoles, artisans et un riche patrimoine culturel. Sa proximité avec le Nigeria en fait aussi une ville d’échanges : beaucoup d’entreprises de l’Ouémé vendent des deux côtés de la frontière et ont besoin d’un site en français et en anglais.</p>' +
      '<p>Notre siège d’Abomey-Calavi est à environ une heure de route : les rendez-vous peuvent se faire sur place, en plus de la visioconférence et de WhatsApp. Nous avons livré au Bénin des projets comme la boutique <a href="/realisations/pirabel-one-la-boutique-en-ligne-d-une-maison-de-mode-beninoise">Pirabel — Maison de Cotonou</a>.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Institutions et administrations', 'Culture et patrimoine', 'Artisanat', 'Commerce avec le Nigeria', 'Éducation'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Centre-ville', 'Ouando', 'Sèmè-Podji et Sèmè City', 'Adjarra et Avrankou', 'Tout l’Ouémé'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['MTN MoMo', 'Moov Money', 'Celtiis Cash', 'Carte Visa et Mastercard', 'Virement bancaire'] },
      { title: 'Conformité', icon: 'shield', items: ['Code du numérique du Bénin (APDP)', 'Mentions légales et CGV', 'Factures en FCFA', 'Français et anglais'] },
    ],
    projects: BENIN('au Bénin'),
    faq: [
      { q: 'Peut-on vous rencontrer à Porto-Novo ?', a: 'Oui, sur rendez-vous : notre siège d’Abomey-Calavi est à environ une heure de route. Le reste du projet se suit en visioconférence et sur WhatsApp.' },
      { q: 'Nous travaillons aussi avec le Nigeria : faut-il un site bilingue ?', a: 'C’est souvent utile : une version anglaise bien référencée vous rend visible auprès des clients et partenaires nigérians. Nous construisons chaque langue avec sa propre adresse, pour que Google montre la bonne version.' },
      { q: 'Combien coûte un site à Porto-Novo ?', a: PRICES_FCFA },
    ],
  },

  abidjan: {
    name: 'Abidjan',
    area: 'Abidjan et la Côte d’Ivoire',
    title: 'Travailler avec nous <span class="grad">depuis Abidjan</span>',
    intro:
      '<p>Abidjan est la locomotive économique de l’Afrique de l’Ouest francophone : banques, fintech, agro-industrie, commerce et une concurrence en ligne qui s’intensifie chaque année. Les clients abidjanais comparent sur mobile, paient par Orange Money, MTN MoMo, Moov Money ou Wave, et attendent une réponse rapide, souvent sur WhatsApp.</p>' +
      '<p>Nous concevons des plateformes pensées pour ces usages, comme <a href="/realisations/novakou-vendre-ses-formations-et-produits-digitaux-en-afrique-francophone">Novakou</a>, qui permet de vendre des formations en Afrique francophone avec paiement Mobile Money. Nous travaillons à distance, en visioconférence et sur WhatsApp, avec des devis et des factures en FCFA.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Banque, assurance et fintech', 'Agro-industrie', 'Commerce et distribution', 'BTP et immobilier', 'Santé'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Le Plateau', 'Cocody et Riviera', 'Marcory et Zone 4', 'Treichville', 'Yopougon'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['Orange Money', 'MTN MoMo', 'Moov Money', 'Wave', 'Carte Visa et Mastercard'] },
      { title: 'Conformité', icon: 'shield', items: ['Loi n° 2013-450 (ARTCI)', 'Mentions légales et CGV', 'Factures en FCFA', 'Français et anglais'] },
    ],
    projects: WEST,
    faq: [
      REMOTE_WEST('Abidjan', 'La Côte d’Ivoire'),
      { q: 'Pouvez-vous intégrer Wave et Orange Money ?', a: 'Oui : Orange Money, MTN MoMo, Moov Money et Wave, via un agrégateur de paiement comme CinetPay, en plus de la carte bancaire. Le client paie avec le moyen qu’il utilise déjà au quotidien.' },
      { q: 'Combien coûte un site à Abidjan ?', a: PRICES_FCFA },
    ],
  },

  dakar: {
    name: 'Dakar',
    area: 'Dakar et le Sénégal',
    title: 'Travailler avec nous <span class="grad">depuis Dakar</span>',
    intro:
      '<p>Dakar est l’un des pôles numériques les plus actifs d’Afrique de l’Ouest : c’est au Sénégal qu’est née Wave, qui a changé la façon de payer de millions de personnes. Les entreprises dakaroises, des startups aux commerces du Plateau, ont besoin d’un site rapide sur mobile, relié à WhatsApp et au paiement mobile.</p>' +
      '<p>Nous concevons des plateformes pensées pour ces usages, comme <a href="/realisations/novakou-vendre-ses-formations-et-produits-digitaux-en-afrique-francophone">Novakou</a>, avec paiement Mobile Money. Nous travaillons à distance, en visioconférence et sur WhatsApp, avec des devis et des factures en FCFA.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Startups et fintech', 'Services et conseil', 'Tourisme et hôtellerie', 'Commerce', 'BTP et immobilier'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Le Plateau', 'Almadies et Ngor', 'Point E et Mermoz', 'Sicap et Liberté', 'Diamniadio'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['Wave', 'Orange Money', 'Autres portefeuilles mobiles', 'Carte Visa et Mastercard', 'Virement bancaire'] },
      { title: 'Conformité', icon: 'shield', items: ['Loi n° 2008-12 (CDP)', 'Mentions légales et CGV', 'Factures en FCFA', 'Français et anglais'] },
    ],
    projects: WEST,
    faq: [
      REMOTE_WEST('Dakar', 'Le Sénégal'),
      { q: 'Mon site peut-il accepter Wave ?', a: 'Oui : Wave, Orange Money et les autres portefeuilles mobiles, via des agrégateurs de paiement, en plus de la carte bancaire. C’est souvent ce qui fait passer un visiteur sénégalais à l’achat.' },
      { q: 'Combien coûte un site à Dakar ?', a: PRICES_FCFA },
    ],
  },

  lome: {
    name: 'Lomé',
    area: 'Lomé et le Togo',
    title: 'Travailler avec nous <span class="grad">depuis Lomé</span>',
    intro:
      '<p>Lomé est une plaque tournante de la logistique en Afrique de l’Ouest, grâce à son port en eau profonde, et accueille les sièges d’Ecobank et de la Banque ouest-africaine de développement. Autour, un commerce très actif, souvent transfrontalier, vit du téléphone, de WhatsApp et du paiement mobile.</p>' +
      '<p>Nous concevons des sites et des plateformes pensés pour ces usages, comme <a href="/realisations/kaza-la-plateforme-immobiliere-qui-securise-la-location-en-afrique-de-l-ouest">Kaabo</a>, avec paiement sécurisé. Nous travaillons à distance, en visioconférence et sur WhatsApp, avec des devis et des factures en FCFA.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Port et logistique', 'Banque et finance', 'Commerce et distribution', 'Transport', 'Hôtellerie'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Centre-ville et Grand Marché', 'Zone portuaire', 'Tokoin', 'Bè', 'Agoè'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['Flooz', 'T-Money', 'Carte Visa et Mastercard', 'Virement bancaire', 'Paiement à la livraison'] },
      { title: 'Conformité', icon: 'shield', items: ['Loi n° 2019-014 (IPDCP)', 'Mentions légales et CGV', 'Factures en FCFA', 'Français et anglais'] },
    ],
    projects: WEST,
    faq: [
      REMOTE_WEST('Lomé', 'Le Togo'),
      { q: 'Notre entreprise travaille dans la logistique : que peut apporter le site ?', a: 'Des demandes de devis qualifiées plutôt que des appels à trier : un formulaire qui recueille d’emblée le type de marchandise, le volume et la destination, relié à votre messagerie ou à un CRM, et des pages par service pour être trouvé sur Google.' },
      { q: 'Combien coûte un site à Lomé ?', a: PRICES_FCFA },
    ],
  },

  bamako: {
    name: 'Bamako',
    area: 'Bamako et le Mali',
    title: 'Travailler avec nous <span class="grad">depuis Bamako</span>',
    intro:
      '<p>À Bamako, le commerce, les services et un grand nombre d’organisations internationales et d’ONG font vivre l’économie. La connexion peut être irrégulière et beaucoup de visiteurs naviguent sur mobile avec un forfait limité : un site bamakois doit être très léger, s’afficher vite et aller droit au but.</p>' +
      '<p>Nous concevons des sites sobres et rapides, reliés à WhatsApp et au paiement mobile, et des plateformes comme <a href="/realisations/novakou-vendre-ses-formations-et-produits-digitaux-en-afrique-francophone">Novakou</a>. Nous travaillons à distance, en visioconférence et sur WhatsApp, avec des devis et des factures en FCFA.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Commerce', 'ONG et organisations internationales', 'Mines et énergie', 'Agriculture', 'Éducation et formation'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['ACI 2000', 'Hamdallaye', 'Badalabougou', 'Hippodrome', 'Kalaban Coura'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['Orange Money', 'Moov Money', 'Carte Visa et Mastercard', 'Virement bancaire', 'Paiement à la livraison'] },
      { title: 'Conformité', icon: 'shield', items: ['Loi n° 2013-015 (APDP)', 'Mentions légales', 'Factures en FCFA', 'Site léger, adapté aux petits forfaits'] },
    ],
    projects: WEST,
    faq: [
      REMOTE_WEST('Bamako', 'Le Mali'),
      { q: 'Mes clients ont souvent une connexion lente : que faites-vous ?', a: 'Nous allégeons tout : images compressées, peu de scripts, pages qui s’affichent en quelques secondes même en 3G, et un bouton WhatsApp toujours visible pour ceux qui préfèrent écrire directement.' },
      { q: 'Travaillez-vous avec des ONG ?', a: 'Oui : sites de présentation, collecte de dons, publication de rapports et de projets. Associations et ONG bénéficient de 20 % de réduction sur présentation des statuts.' },
    ],
  },

  ouagadougou: {
    name: 'Ouagadougou',
    area: 'Ouagadougou et le Burkina Faso',
    title: 'Travailler avec nous <span class="grad">depuis Ouagadougou</span>',
    intro:
      '<p>Ouagadougou est une capitale culturelle reconnue dans toute l’Afrique, avec le FESPACO et le Salon international de l’artisanat (SIAO), et un pôle important pour les ONG, le commerce et l’artisanat. Beaucoup de ces acteurs veulent se faire connaître au-delà du pays : leur site doit raconter leur histoire, montrer leur travail et rester léger pour les connexions mobiles.</p>' +
      '<p>Nous concevons des sites sobres et rapides, reliés à WhatsApp et au paiement mobile, et des plateformes comme <a href="/realisations/novakou-vendre-ses-formations-et-produits-digitaux-en-afrique-francophone">Novakou</a>. Nous travaillons à distance, en visioconférence et sur WhatsApp, avec des devis et des factures en FCFA.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Artisanat et culture', 'ONG et coopération', 'Commerce', 'Mines', 'Éducation'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Centre-ville et Koulouba', 'Ouaga 2000', 'Zone du Bois', 'Gounghin', 'Toute la ville'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['Orange Money', 'Moov Money', 'Carte Visa et Mastercard', 'Virement bancaire', 'Paiement à la livraison'] },
      { title: 'Conformité', icon: 'shield', items: ['Loi n° 001-2021 (CIL)', 'Mentions légales', 'Factures en FCFA', 'Site léger, adapté aux petits forfaits'] },
    ],
    projects: WEST,
    faq: [
      REMOTE_WEST('Ouagadougou', 'Le Burkina Faso'),
      { q: 'Je suis artisan : puis-je vendre en ligne à l’étranger ?', a: 'Oui : une boutique avec de belles photos de vos créations, le paiement par carte pour la clientèle internationale et par Mobile Money pour la clientèle locale, et des frais de livraison clairs par destination.' },
      { q: 'Combien coûte un site à Ouagadougou ?', a: PRICES_FCFA },
    ],
  },

  conakry: {
    name: 'Conakry',
    area: 'Conakry et la Guinée',
    title: 'Travailler avec nous <span class="grad">depuis Conakry</span>',
    intro:
      '<p>Conakry est le cœur économique de la Guinée, portée par les mines, le port, le commerce et les télécoms. Les entreprises guinéennes veulent de plus en plus être trouvées en ligne par leurs clients comme par leurs partenaires étrangers, avec un site sérieux, rapide sur mobile et relié à WhatsApp.</p>' +
      '<p>Nous concevons des sites et des plateformes pensés pour l’Afrique de l’Ouest, comme <a href="/realisations/kaza-la-plateforme-immobiliere-qui-securise-la-location-en-afrique-de-l-ouest">Kaabo</a> ou <a href="/realisations/novakou-vendre-ses-formations-et-produits-digitaux-en-afrique-francophone">Novakou</a>. Nous travaillons à distance, en visioconférence et sur WhatsApp, avec une facturation en francs guinéens ou en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Mines et énergie', 'Commerce et import', 'BTP', 'Télécoms et services', 'ONG'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Kaloum', 'Dixinn', 'Ratoma et Kipé', 'Matam', 'Toute la ville'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['Orange Money', 'MTN MoMo', 'Carte Visa et Mastercard', 'Virement bancaire', 'Facturation en GNF ou en EUR'] },
      { title: 'Conformité', icon: 'shield', items: ['Loi guinéenne sur les données personnelles', 'Mentions légales', 'Factures en GNF ou en EUR', 'Français et anglais'] },
    ],
    projects: WEST,
    faq: [
      REMOTE_WEST('Conakry', 'La Guinée'),
      { q: 'Facturez-vous en francs guinéens ?', a: 'Oui : en francs guinéens au taux du jour, ou en euros. Le paiement se fait par Orange Money, MTN MoMo ou virement. Nos prix de départ pour la Guinée : site vitrine dès 350 €, boutique en ligne dès 950 €.' },
      { q: 'Notre entreprise travaille avec des partenaires étrangers : que doit montrer le site ?', a: 'Votre sérieux : références, certifications, équipe, zones d’intervention et un contact rapide. Une version anglaise est souvent utile pour les partenaires internationaux, notamment dans les mines et le BTP.' },
    ],
  },

  douala: {
    name: 'Douala',
    area: 'Douala et le Cameroun',
    title: 'Travailler avec nous <span class="grad">depuis Douala</span>',
    intro:
      '<p>Douala est la capitale économique du Cameroun et le principal port de la sous-région : commerce, industrie, banques et logistique y sont concentrés. Les clients doualais comparent sur mobile, écrivent sur WhatsApp et paient par MTN MoMo ou Orange Money : un site efficace doit suivre ces usages.</p>' +
      '<p>Nous concevons des plateformes pensées pour l’Afrique francophone, comme <a href="/realisations/novakou-vendre-ses-formations-et-produits-digitaux-en-afrique-francophone">Novakou</a> ou <a href="/realisations/orinka-la-plateforme-qui-revele-les-talents-africains-au-monde">Orinka</a>. Nous travaillons à distance, à la même heure que notre siège au Bénin, avec des devis et des factures en FCFA (XAF).</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Commerce et import-export', 'Port et logistique', 'Industrie', 'Banque et assurance', 'Mode et e-commerce'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Akwa', 'Bonanjo', 'Bonapriso', 'Bonamoussadi', 'Zone portuaire'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['MTN MoMo', 'Orange Money', 'Carte Visa et Mastercard', 'Virement bancaire', 'Paiement à la livraison'] },
      { title: 'Conformité', icon: 'shield', items: ['Protection des données personnelles', 'Mentions légales et CGV', 'Factures en FCFA (XAF)', 'Français et anglais'] },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">en Afrique francophone</span>', lead: 'Des plateformes en ligne, avec paiement Mobile Money, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.novakou, P.orinka, P.kaabo] },
    faq: [
      { q: 'Comment travaillez-vous avec une entreprise de Douala depuis le Bénin ?', a: 'À distance, et à la même heure : visioconférence ou WhatsApp, un interlocuteur unique du cadrage à la mise en ligne. Devis et factures en FCFA (XAF), paiement par MTN MoMo, Orange Money ou virement.' },
      { q: 'Faut-il un site en français et en anglais au Cameroun ?', a: 'Souvent oui : le pays est bilingue, et une version anglaise vous ouvre aux régions anglophones et aux partenaires internationaux. Chaque langue a sa propre adresse pour être correctement référencée.' },
      { q: 'Combien coûte un site à Douala ?', a: 'Nos prix de départ pour l’Afrique centrale : site vitrine dès 200 000 FCFA, boutique en ligne dès 600 000 FCFA, référencement dès 120 000 FCFA par mois. Le devis ferme, gratuit, est établi sous 48 h après un appel de cadrage.' },
    ],
  },

  yaounde: {
    name: 'Yaoundé',
    area: 'Yaoundé et le Cameroun',
    title: 'Travailler avec nous <span class="grad">depuis Yaoundé</span>',
    intro:
      '<p>Yaoundé est la capitale politique du Cameroun : administrations, universités, organisations internationales, ONG et un tissu de services et de commerces qui grandit avec la ville. Pour ces structures, le site est souvent la première source d’information : il doit être clair, à jour, bilingue et facile à consulter sur mobile.</p>' +
      '<p>Nous concevons des plateformes pensées pour l’Afrique francophone, comme <a href="/realisations/orinka-la-plateforme-qui-revele-les-talents-africains-au-monde">Orinka</a>, qui connecte les talents africains à des opportunités professionnelles. Nous travaillons à distance, à la même heure que notre siège au Bénin, avec des devis et des factures en FCFA (XAF).</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Administration et institutions', 'Éducation et universités', 'ONG et coopération', 'Services et conseil', 'Commerce'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Centre administratif', 'Bastos', 'Omnisports et Essos', 'Biyem-Assi', 'Toute la ville'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['MTN MoMo', 'Orange Money', 'Carte Visa et Mastercard', 'Virement bancaire', 'Facturation en FCFA (XAF)'] },
      { title: 'Conformité', icon: 'shield', items: ['Protection des données personnelles', 'Mentions légales', 'Accessibilité des contenus', 'Français et anglais'] },
    ],
    projects: { title: 'Nos projets livrés <span class="grad">en Afrique francophone</span>', lead: 'Des plateformes en ligne, pour de vrais clients : ouvrez-les, testez-les.', slugs: [P.orinka, P.novakou, P.kaabo] },
    faq: [
      { q: 'Comment travaillez-vous avec une structure de Yaoundé depuis le Bénin ?', a: 'À distance, et à la même heure : visioconférence ou WhatsApp, un interlocuteur unique du cadrage à la mise en ligne. Devis et factures en FCFA (XAF), paiement par MTN MoMo, Orange Money ou virement.' },
      { q: 'Travaillez-vous avec des institutions, des écoles ou des ONG ?', a: 'Oui : sites institutionnels, publication d’actualités et de documents, inscriptions et formulaires en ligne. Associations et ONG bénéficient de 20 % de réduction sur présentation des statuts.' },
      { q: 'Combien coûte un site à Yaoundé ?', a: 'Nos prix de départ pour l’Afrique centrale : site vitrine dès 200 000 FCFA, boutique en ligne dès 600 000 FCFA, référencement dès 120 000 FCFA par mois. Le devis ferme, gratuit, est établi sous 48 h après un appel de cadrage.' },
    ],
  },
};
