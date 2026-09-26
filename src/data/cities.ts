/**
 * Contenu local vérifié par ville (pages « agence-web-<ville> » et « <service>-<ville> »).
 * Remplace les témoignages génériques des anciens modèles par des preuves réelles :
 * projets livrés dans la ville ou la région (src/data/realisations.json), contexte local,
 * paiements, cadre légal et questions propres à la ville.
 * Règle : aucun chiffre, client ou témoignage inventé ; uniquement des faits vérifiables.
 */
import REALISATIONS from './realisations.json';

export interface CityLocal {
  name: string;
  /** Sur-titre du bloc local, ex. « Nice et la Côte d’Azur » */
  area: string;
  /** Titre du bloc local (HTML autorisé) */
  title: string;
  /** Contexte local : 2 paragraphes HTML */
  intro: string;
  zones: { title: string; icon: string; items: string[] }[];
  projects: { title: string; lead: string; slugs: string[] };
  faq: { q: string; a: string }[];
}

type Realisation = { slug: string; title: string; meta: string; excerpt: string; image: string; private: boolean };
const BY_SLUG = new Map((REALISATIONS as Realisation[]).map((r) => [r.slug, r]));

export const CITIES: Record<string, CityLocal> = {
  nice: {
    name: 'Nice',
    area: 'Nice et la Côte d’Azur',
    title: 'Travailler avec nous <span class="grad">depuis Nice</span>',
    intro:
      '<p>Nice vit en grande partie d’une clientèle venue d’ailleurs : touristes, résidents étrangers, couples qui viennent se marier sur la Côte d’Azur, équipes de la technopole de Sophia Antipolis. Un site niçois doit donc souvent parler plusieurs langues, être impeccable sur mobile et ressortir sur Google Maps dès qu’on cherche un prestataire « à Nice ».</p>' +
      '<p>C’est ce que nous avons construit pour <a href="/realisations/mickael-romero-photographe-de-mariage-a-nice">Mickael Romero</a>, photographe de mariage à Nice : un site bilingue français-anglais pensé pour des futurs mariés venus de toute l’Europe. Nous travaillons en visioconférence aux horaires français (même heure que notre siège au Bénin en hiver, une heure de décalage en été), avec des devis et des factures en euros.</p>',
    zones: [
      { title: 'Secteurs clés', icon: 'briefcase', items: ['Tourisme et hôtellerie', 'Mariage et événementiel', 'Immobilier', 'Santé et bien-être', 'Tech et Sophia Antipolis', 'Nautisme et yachting'] },
      { title: 'Où nous intervenons', icon: 'pin', items: ['Centre et Jean-Médecin', 'Vieux-Nice et le port', 'Nice Méridia, Grand Arénas', 'Cannes, Antibes, Menton', 'Sophia Antipolis'] },
      { title: 'Paiements intégrés', icon: 'card', items: ['Carte bancaire (Stripe)', 'Apple Pay et Google Pay', 'Virement SEPA', 'PayPal', 'Paiement fractionné'] },
      { title: 'Conformité', icon: 'shield', items: ['RGPD et cookies (CNIL)', 'Mentions légales et CGV', 'Accessibilité numérique', 'Français, anglais, italien'] },
    ],
    projects: {
      title: 'Nos projets livrés <span class="grad">à Nice et en Région Sud</span>',
      lead: 'Des sites en ligne, pour de vrais clients de la région : ouvrez-les, testez-les.',
      slugs: [
        'mickael-romero-photographe-de-mariage-a-nice',
        'romero-photography-plateforme-sur-mesure-pour-un-photographe-a-nice',
        'garage-boost-de-la-vitrine-seo-a-l-application-de-gestion-tout-en-un-pour-garage',
      ],
    },
    faq: [
      {
        q: 'Travaillez-vous avec des entreprises de Nice alors que votre siège est au Bénin ?',
        a: 'Oui. Nous accompagnons déjà des clients à Nice, comme le photographe de mariage Mickael Romero. Tout se fait en visioconférence aux horaires français, avec un interlocuteur unique, des devis et des factures en euros, et un paiement par virement SEPA ou carte bancaire.',
      },
      {
        q: 'Mon site doit-il être traduit pour la clientèle internationale de la Côte d’Azur ?',
        a: 'Si une partie de vos clients vient de l’étranger (tourisme, mariage, immobilier, nautisme), une version anglaise vous ouvre à ces demandes ; l’italien se justifie souvent près de la frontière et de Monaco. Nous construisons le site multilingue pour le référencement : une adresse par langue et des balises hreflang, pour que Google montre la bonne version à chaque visiteur.',
      },
      {
        q: 'Comment apparaître sur Google quand on cherche un prestataire à Nice ?',
        a: 'Trois leviers : une fiche Google Business Profile complète et active, des pages dédiées à vos prestations et aux communes que vous servez (Nice, Cannes, Antibes…), et des avis clients réguliers. Un site rapide sur mobile fait le reste : c’est là que se fait l’essentiel des recherches locales.',
      },
    ],
  },
};

/** Ville d'une page : « agence-web-nice », « creation-site-web-nice »… (la clé la plus longue gagne : porto-novo, abomey-calavi). */
export function cityOf(slug: string): CityLocal | undefined {
  const key = Object.keys(CITIES)
    .sort((a, b) => b.length - a.length)
    .find((c) => slug === c || slug.endsWith('-' + c));
  return key ? CITIES[key] : undefined;
}

/** Projets réels à afficher (seuls ceux présents dans le portfolio). */
export function cityProjects(city: CityLocal) {
  return city.projects.slugs
    .map((s) => BY_SLUG.get(s))
    .filter((r): r is Realisation => Boolean(r))
    .map((r) => ({
      title: r.title.split(' — ')[0],
      text: r.excerpt.length > 170 ? r.excerpt.slice(0, 167).replace(/\s+\S*$/, '') + '…' : r.excerpt,
      href: '/realisations/' + r.slug,
      image: r.image || undefined,
      tag: r.meta.split(' · ')[0],
    }));
}
