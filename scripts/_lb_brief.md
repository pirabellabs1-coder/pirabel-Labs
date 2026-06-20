# BRIEF — Contenu d'un LIVRE BLANC Pirabel Labs (PDF)

Tu rédiges le contenu d'UN livre blanc (guide PDF téléchargeable) pour **Pirabel Labs**, agence digitale francophone (siège Abomey-Calavi, Bénin ; marché Afrique de l'Ouest + international). Le PDF est généré automatiquement à partir d'un fichier JSON — tu produis donc UN fichier JSON valide.

## EXIGENCES
- Contenu RÉEL, riche, concret, actionnable — c'est un vrai guide de 12 à 20 pages, pas un teaser.
- **7 à 10 sections**, chacune avec **2 à 4 paragraphes** (3-5 phrases chacun) + souvent une liste à puces (3-6 puces). Profondeur réelle : méthodes, étapes, chiffres, exemples.
- Français IMPECCABLE (accents y compris majuscules À/É, ç, œ, ponctuation soignée). PAS de HTML ni de Markdown dans les textes (texte brut ; le générateur gère la mise en forme). N'utilise pas de caractères `<`, `>`, `&` inutiles.
- Angle PME francophone / Afrique de l'Ouest quand pertinent (Bénin, Cotonou, Mobile Money), sans perdre l'utilité universelle. Utilise WebSearch pour des chiffres/faits à jour (2026) si utile.
- Ton expert, pédagogue, orienté résultats.

## SORTIE : un seul fichier JSON (chemin donné dans ta tâche), structure EXACTE :
{
  "title": "Titre du livre blanc",
  "subtitle": "Sous-titre d'une ligne",
  "slug": "slug-exact-fourni",
  "category": "Catégorie",
  "icon": "nom_icone_material_symbols",
  "year": 2026,
  "pages": 18,
  "description": "Résumé de 25-35 mots pour la carte sur le site.",
  "intro": "Paragraphe d'introduction (3-5 phrases) qui pose le problème et la promesse du guide.",
  "sections": [
    { "heading": "Titre de section", "paragraphs": ["…","…"], "bullets": ["…","…"] },
    ...
  ],
  "cta": "Phrase d'appel à l'action finale (1-2 phrases) invitant à contacter Pirabel Labs."
}

Règles JSON : échappe correctement les guillemets, pas de virgule finale, "bullets" optionnel par section. "pages" = estimation cohérente (12-22). Renvoie un résumé COURT (titre, slug, nb de sections) — PAS le JSON.