/**
 * Prix de départ par service et par zone, pour les pages « <service>-<ville> ».
 * Chaque service garde son propre prix d'entrée (pas un « dès 1 200 € » unique) : aligné sur la grille
 * validée de /tarifs quand elle existe (site vitrine, SEO, community management, tunnels, automatisation),
 * sinon sur le bas des fourchettes déjà publiées. La devise affichée suit ensuite le visiteur (src/lib/px.mjs).
 */
export type Zone = 'eur' | 'xof' | 'gn';
type Price = { eur: string; xof: string; gn: string; per?: string; basis: string };

export const SERVICE_GRID: Record<string, { label: string; price: Price }> = {
  'creation-site-web': { label: 'la création d’un site web', price: { eur: '1 200 €', xof: '200 000 FCFA', gn: '350 €', basis: 'pour un site vitrine ; boutique en ligne et sur mesure sur devis' } },
  'creation-site-wordpress': { label: 'un site WordPress', price: { eur: '1 200 €', xof: '200 000 FCFA', gn: '350 €', basis: 'pour un site vitrine WordPress, thème sur mesure compris' } },
  'creation-application-web': { label: 'une application web', price: { eur: '3 500 €', xof: '1 200 000 FCFA', gn: '1 800 €', basis: 'pour une première version avec comptes utilisateurs et tableau de bord' } },
  'seo': { label: 'le référencement (SEO)', price: { eur: '590 €', xof: '120 000 FCFA', gn: '200 €', per: 'par mois', basis: 'engagement de 6 mois conseillé' } },
  'seo-local': { label: 'le SEO local', price: { eur: '390 €', xof: '90 000 FCFA', gn: '140 €', per: 'par mois', basis: 'fiche Google, pages locales et avis compris' } },
  'fiche-google-business': { label: 'l’optimisation de votre fiche Google Business', price: { eur: '290 €', xof: '60 000 FCFA', gn: '90 €', basis: 'pour l’optimisation complète de la fiche ; suivi mensuel en option' } },
  'community-management': { label: 'le community management', price: { eur: '450 €', xof: '100 000 FCFA', gn: '150 €', per: 'par mois', basis: 'pour 2 réseaux sociaux, contenus compris' } },
  'automatisation-marketing': { label: 'l’automatisation marketing', price: { eur: '600 €', xof: '250 000 FCFA', gn: '380 €', basis: 'pour une première série de scénarios (Make, n8n, CRM)' } },
  'email-marketing-crm': { label: 'l’e-mail marketing et le CRM', price: { eur: '490 €', xof: '90 000 FCFA', gn: '140 €', basis: 'pour la mise en place du CRM et de vos premières séquences ; suivi mensuel en option' } },
  'tunnels-de-vente': { label: 'un tunnel de vente', price: { eur: '990 €', xof: '350 000 FCFA', gn: '530 €', basis: 'pour un tunnel complet : page de vente, paiement et relances' } },
  'montage-video': { label: 'le montage vidéo', price: { eur: '250 €', xof: '35 000 FCFA', gn: '60 €', per: 'par mois', basis: 'pour un premier forfait de vidéos courtes' } },
  'agents-ia-chatbots': { label: 'un agent IA ou un chatbot', price: { eur: '1 500 €', xof: '450 000 FCFA', gn: '690 €', basis: 'pour un premier assistant connecté à votre site ou WhatsApp' } },
};

export function serviceOf(slug: string, cityKey: string): string | undefined {
  const s = slug.slice(0, -(cityKey.length + 1));
  return SERVICE_GRID[s] ? s : undefined;
}
