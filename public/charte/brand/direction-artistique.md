# Direction artistique — Pirabel Labs

## Principe
Sombre, précis, premium. Beaucoup de noir, des accents orange parcimonieux, de la géométrie. « Moins d'éléments, mais plus affirmés. »

## Iconographie
- Bibliothèque : **Material Symbols Outlined** (Google), style **linéaire** (outline), graisse régulière.
- Couleur : `--text` ou `--accent` ; sur fond `--accent-soft` dans les pastilles d'icône (carré 3 rem, cf. composant `.card__icon`).
- Taille : 1,25em en ligne, 1,5 rem en pastille.

## Motifs & éléments graphiques
- **Grille hero** : fines lignes orange très discrètes (`rgba(255,85,0,~.11)`) en fond de la section d'accueil — signature « blueprint / labo ».
- **Chevron** : motif récurrent issu du logo L'Élan — flèche d'accélération, puce, séparateur, indicateur de progression.
- **Pastilles / badges** : pilules (`--rayon-full`) à fond `--accent-soft`, texte orange, capitales, suivi large.
- **Chips flottantes** (hero) : fond `--bg-2`, bordure `--border-2`, ombre douce `--ombre-md`.

## Formes
- Angles : **14 px** (cartes), **20 px** (grands blocs), **999 px** (pilules, boutons).
- Traitement net, plein, **sans biseau ni effet 3D**, cohérent avec la géométrie du logo L'Élan.

## Imagerie / photographie
- Captures produit dans des **mockups navigateur** sombres (cf. `.hero-browser`).
- Photos : ambiances sombres, lumière chaude, sujets **locaux et authentiques** ; éviter les banques d'images génériques et froides.
- Toujours assez de contraste pour poser logo/texte (pastille sombre si nécessaire).

## Mise en page
- Conteneur max **80 rem**, marge de page **5 %**.
- Sections aérées : padding vertical fluide (4 rem → 6 rem).
- Hiérarchie : eyebrow (label orange en capitales) → titre → lead → contenu.
- Sous-titres **alignés à gauche** (jamais justifiés).

## Motion
- Transition standard : **220 ms** `cubic-bezier(.4, 0, .2, 1)`.
- Micro-interactions : survol = translation de -1 à -4 px + halo orange (`--ombre-lg`).
- Sobriété : des animations utiles, jamais décoratives à l'excès.
