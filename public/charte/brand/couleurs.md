# Couleurs — Pirabel Labs

Palette hiérarchisée, pensée pour un thème sombre. Référence technique : `tokens/tokens.css`.

## Primaire — orange signature
| Token | HEX | RGB | CMYK approx. | Pantone approx. | Usage |
|---|---|---|---|---|---|
| `--accent` | **#FF5500** | 255, 85, 0 | 0 / 67 / 100 / 0 | 165 C / Orange 021 C [À VALIDER] | Couleur signature : CTA, liens, accents, logo |
| `--accent-2` | #FF7A33 | 255, 122, 51 | 0 / 52 / 80 / 0 | — | Survol, états, transitions |
| `--accent-soft` | rgba(255,85,0,.12) | — | — | — | Fonds d'icônes, badges, surbrillances |

## Fonds (neutres sombres)
| Token | HEX | RGB | Usage |
|---|---|---|---|
| `--bg` | #0E0E0E | 14, 14, 14 | Fond principal |
| `--bg-2` | #161616 | 22, 22, 22 | Sections alternées |
| `--surface` | #1A1A1A | 26, 26, 26 | Cartes, panneaux |
| `--surface-2` | #202020 | 32, 32, 32 | Survol, champs |

## Texte
| Token | Valeur | Usage |
|---|---|---|
| `--text` | #E5E2E1 | Texte principal |
| `--text-bright` | #F5F4F1 | Titres hero |
| `--text-muted` | rgba(229,226,225,.62) | Texte secondaire |
| `--text-faint` | rgba(229,226,225,.40) | Légendes, mentions |

## Sémantiques
| Token | HEX | Usage |
|---|---|---|
| `--success` | #4ADE80 | Succès, validation |
| `--warning` | #FBBF24 | Alerte |
| `--danger` | #F87171 | Erreur |

## Contrastes (WCAG 2.1)
Paires vérifiées sur fond `#0E0E0E` (sauf indication) :

| Paire | Ratio | Verdict |
|---|---|---|
| #E5E2E1 sur #0E0E0E (texte courant) | ~15,8 : 1 | ✅ AAA |
| texte atténué (62 %) sur #0E0E0E | ~7,9 : 1 | ✅ AAA |
| #FF5500 sur #0E0E0E (accent en texte) | ~6,0 : 1 | ✅ AA (AAA grand texte) |
| **#FFFFFF sur #FF5500** (bouton blanc) | **~3,2 : 1** | ⚠️ échoue AA en texte courant |
| **#0E0E0E sur #FF5500** (bouton sombre) | **~6,6 : 1** | ✅ AA |

> ⚠️ **Recommandation d'accessibilité** : le texte posé sur l'orange doit être **sombre (#0E0E0E)**, pas blanc, pour passer WCAG AA. Le site utilise aujourd'hui du blanc sur les boutons orange (ratio 3,2 : 1, insuffisant pour le texte courant). Le token `--on-accent` (#0E0E0E) est prévu pour cela ; réserver le blanc-sur-orange au très grand texte.

## Cohérence — dérives à réconcilier
*(Recommandations ; le site n'est pas modifié dans le cadre de cette charte.)*
- **Orange** : `#FF5500` (officiel) vs `#FF6B00` employé dans le hero → unifier sur **#FF5500**.
- **Blanc** : `#E5E2E1` (texte courant) et `#F5F4F1` (hero) → garder les deux rôles distincts (`--text` / `--text-bright`), mais documentés.
