# Livres blancs Pirabel Labs

Dossier des PDFs téléchargeables servis par les emails de capture lead.

## Fichiers actuels (placeholders)

Les 5 fichiers PDF dans ce dossier sont des **placeholders minimaux** générés automatiquement.
Vous devez les **remplacer par les vrais livres blancs PDF** que vous avez rédigés ou fait rédiger.

| Slug | Fichier | Titre |
|---|---|---|
| seo-pme-francophones-2026 | livre-blanc-seo-pme-francophones-2026.pdf | Guide SEO PME francophones 2026 (62 pages) |
| ia-pme-cas-usage-roi | livre-blanc-ia-pme-cas-usage-roi.pdf | Intégrer l'IA dans votre PME (78 pages) |
| tunnels-vente-cro-3x-conversion | livre-blanc-tunnels-vente-cro-3x-conversion.pdf | Tunnels de vente 1% à 5% (54 pages) |
| ecommerce-afrique-paiement-mobile-money | livre-blanc-ecommerce-afrique-paiement-mobile-money.pdf | E-commerce Afrique Mobile Money (68 pages) |
| refonte-site-checklist-complete | livre-blanc-refonte-site-checklist-complete.pdf | Refonte site checklist 60 points (48 pages) |

## Comment remplacer les placeholders

1. Créez ou faites créer vos vrais livres blancs au format PDF
2. Conservez les **noms de fichiers exacts** ci-dessus (sinon les emails enverront un lien cassé)
3. Uploadez les nouveaux PDFs dans ce dossier (`downloads/`)
4. Commitez et redéployez sur Vercel

## URL d'accès

Chaque PDF est accessible publiquement à : `https://www.pirabellabs.com/downloads/<nom-du-fichier>.pdf`

## Workflow de capture

1. Le visiteur clique sur une card livre blanc sur `/livres-blancs`
2. Une modal s'ouvre avec un formulaire (nom, email, entreprise, téléphone, opt-in newsletter)
3. À la soumission, l'API `/api/livre-blanc/request` :
   - Stocke le lead dans MongoDB (collection `leads`, type `livre-blanc`)
   - Envoie un email admin à `contact@pirabellabs.com` avec les infos
   - Envoie un email au client avec le lien de téléchargement du PDF
4. Le client clique sur le bouton "Télécharger le PDF" dans l'email
5. Le PDF est servi depuis `/downloads/<slug>.pdf`

## Voir les leads dans l'admin

Connectez-vous au dashboard admin (`/pirabel-admin-7x9k2m`) puis filtrez par type "Livre blanc" pour voir tous les téléchargements.

Vous pouvez aussi :
- Envoyer des emails de relance/newsletter à une sélection de leads (uniquement ceux opt-in)
- Exporter la liste
- Marquer un lead comme "converti" ou "newsletter_ok"
