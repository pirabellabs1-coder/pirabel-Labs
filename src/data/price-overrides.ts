/**
 * Grille tarifaire révisée à la baisse (septembre 2026) : remplace les prix des blocs « tarifs »
 * extraits des anciennes pages de service, pour rester cohérents avec /tarifs et les pages villes.
 * Clé = slug de la page ; valeurs = HTML du prix, dans l'ordre des cartes.
 */
const P = (amount: string, extra = '') => `<small>à partir de</small><strong>${amount}</strong>${extra ? `<em>${extra}</em>` : ''}`;

export const PRICE_OVERRIDES: Record<string, string[]> = {
  'creation-site-web': [
    P('200 000 FCFA', '1 200 € HT en Europe'),
    P('600 000 FCFA', '2 500 € HT en Europe'),
    '<strong>Sur devis</strong><em>selon le périmètre</em>',
  ],
  'agence-ecommerce': [
    P('600 000 FCFA', '2 500 € HT en Europe · livraison en 3 à 5 semaines'),
    P('1 200 000 FCFA', '4 900 € HT en Europe · livraison en 5 à 8 semaines'),
    P('2 500 000 FCFA', '9 000 € HT en Europe · livraison en 8 à 16 semaines'),
  ],
  'audit-seo': [
    P('150 000 FCFA', '490 € HT en Europe'),
    P('350 000 FCFA', '990 € HT en Europe'),
    P('700 000 FCFA', '1 900 € HT en Europe'),
  ],
  'creation-saas': [
    P('1 500 €', 'soit environ 985 000 FCFA'),
    P('3 500 €', 'soit environ 2 300 000 FCFA'),
    '<strong>Sur devis</strong><em>à partir de 7 500 €</em>',
  ],
};
