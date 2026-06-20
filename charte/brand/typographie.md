# Typographie — Pirabel Labs

Trois familles, un rôle chacune. Toutes sur Google Fonts, **licence SIL Open Font 1.1** (gratuites, auto-hébergeables, print autorisé).

## Familles
| Rôle | Police | Usage | Graisses |
|---|---|---|---|
| **Affichage** | **Montserrat** | Hero, très grands titres | 800 / 900 |
| **Titre / UI** | **Space Grotesk** | Titres de sections, labels, boutons, eyebrows, chiffres-clés | 500–700 |
| **Corps** | **Inter** | Paragraphes, textes longs, formulaires | 400–600 |
| Mono | `ui-monospace` (système) | Code, données | 400 |

Repli système : `system-ui, -apple-system, 'Segoe UI', sans-serif`.

## Échelle modulaire (ratio ~1,25 — fluide via `clamp`)
| Niveau | Token | Taille | Police | Graisse | Interligne | Suivi |
|---|---|---|---|---|---|---|
| Display (hero) | `--taille-display` | 34 → 56 px | Montserrat | 800 | 1,15 | -0,02em |
| H1 | `--taille-h1` | 36 → 64 px | Space Grotesk | 800 | 1,2 | -0,03em |
| H2 | `--taille-h2` | 28 → 40 px | Space Grotesk | 700 | 1,2 | -0,02em |
| H3 | `--taille-h3` | 20 → 24 px | Space Grotesk | 700 | 1,2 | -0,02em |
| H4 | `--taille-h4` | 17,6 px | Space Grotesk | 700 | 1,3 | — |
| Corps | `--taille-body` | 16 px | Inter | 400 | 1,7 | — |
| Petit | `--taille-sm` | 14 px | Inter | 400–500 | 1,6 | — |
| Légende | `--taille-caption` | 12 px | Inter | 500 | 1,5 | — |
| Eyebrow / label | — | 12 px | Space Grotesk | 700 | 1 | 0,14em · CAPITALES |

## Usages
- **Titres hero** : Montserrat 800, suivi serré.
- **Titres de section, boutons, labels, eyebrows, chiffres-clés** : Space Grotesk.
- **Tout texte courant** : Inter, interligne 1,7.
- **Boutons** : Space Grotesk 700, capitales, suivi 0,08em.

## Web — chargement & performance
- `font-display: swap` + `preconnect` + `preload` de la feuille Google Fonts (déjà en place sur le site).
- Sous-ensembles **latin + latin-ext** (accents français : é, è, ç, œ…).
- Ne charger que les graisses utilisées : Montserrat 700–900, Space Grotesk 400–800, Inter 400–700.
