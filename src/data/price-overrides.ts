/**
 * Grille tarifaire révisée à la baisse (septembre 2026) : remplace les prix des blocs « tarifs »
 * extraits des anciennes pages de service, pour rester cohérents avec /tarifs et les pages villes.
 * Clé = slug de la page ; valeurs = HTML du prix, dans l'ordre des cartes.
 * Chaque prix porte sa version Europe (euros, affichée par défaut) et sa version Afrique (FCFA,
 * affichée aux visiteurs de la zone franc) : voir src/lib/px.mjs.
 */
import { pxHtml } from '../lib/px.mjs';

const P = (eur: string, xof: string, extra = '') => `<small>à partir de</small><strong>${pxHtml(eur, xof)}</strong>${extra ? `<em>${extra}</em>` : ''}`;

export const PRICE_OVERRIDES: Record<string, string[]> = {
  'creation-site-web': [
    P('1 200 €', '200 000 FCFA'),
    P('2 500 €', '600 000 FCFA'),
    '<strong>Sur devis</strong><em>selon le périmètre</em>',
  ],
  'agence-ecommerce': [
    P('2 500 €', '600 000 FCFA', 'livraison en 3 à 5 semaines'),
    P('4 900 €', '1 200 000 FCFA', 'livraison en 5 à 8 semaines'),
    P('9 000 €', '2 500 000 FCFA', 'livraison en 8 à 16 semaines'),
  ],
  'audit-seo': [
    P('490 €', '150 000 FCFA'),
    P('990 €', '350 000 FCFA'),
    P('1 900 €', '700 000 FCFA'),
  ],
  'creation-saas': [
    P('1 500 €', '≈ 985 000 FCFA'),
    P('3 500 €', '≈ 2 300 000 FCFA'),
    `<strong>Sur devis</strong><em>à partir de ${pxHtml('7 500 €', '≈ 4 920 000 FCFA')}</em>`,
  ],
};
