# Déploiement AWS

Depuis la migration (octobre 2026), un `git push` ne déploie plus le site : il faut lancer ce script.

| Partie | Destination |
| --- | --- |
| Front Astro (`dist/`) | S3 `pirabel-labs-144115242691-eun1` → CloudFront `E2JIG1ASYJQFUE` |
| API Express (`api/` + `app/`) | Lambda `pirabel-api` (nodejs22.x, arm64), via API Gateway `vnnwwb6oz9` |

Tout est en région `eu-north-1` (imposé par la SCP de l'organisation), profil CLI `axi`.

## 1. Se connecter (à chaque séance de travail)

```bash
aws login --profile axi --remote
```

Ouvre l'URL affichée sur le téléphone et valide le code. Le script vérifie la session et rappelle cette commande si elle a expiré.

## 2. Déployer

Depuis la racine du dépôt :

```bash
powershell -ExecutionPolicy Bypass -File scripts/deploy-aws/deploy.ps1 -DryRun
```

```bash
powershell -ExecutionPolicy Bypass -File scripts/deploy-aws/deploy.ps1
```

| Option | Effet |
| --- | --- |
| *(aucune)* | front + API |
| `-Front` | front seulement : `npm run build`, envoi S3, invalidation CloudFront `/*` |
| `-Api` | API seulement : paquet Lambda, mise à jour du code, test de `/api/health` |
| `-DryRun` | construit tout (build, paquet, zip) sans rien envoyer ; avec une session valide, liste aussi ce que S3 recevrait |
| `-SkipBuild` | réutilise `dist/` sans relancer le build |

Le déploiement part **du dossier de travail**, pas du dernier commit : le script liste les modifications non commitées de `api/`, `app/`, `src/` et `public/` qui partiront avec.

## Ce que fait le script

**Front.** Les assets hachés `/_astro/*` sont envoyés avec un cache d'un an (`immutable`), le reste avec `max-age=0, must-revalidate`. Les pages supprimées du site sont retirées du bucket ; les anciens `/_astro/*` sont gardés pour ne pas casser une page encore en cache.

**API.** Le paquet est assemblé dans `%TEMP%\pirabel-deploy\lambda` :

- `api/`, `app/` (sans `app/node_modules` ni `app/public/uploads`) ;
- `lambda.js` : l'enveloppe `serverless-http`. Au démarrage à froid, elle charge les variables d'environnement depuis Secrets Manager `pirabel-api-env` (la limite de 4 Ko des variables Lambda ne suffit pas). Elle gère aussi les invocations directes `adminSeed` / `adminAction` protégées par `CRON_SECRET` ;
- les dépendances de production figées par `lambda-package.json` + `lambda-package-lock.json` (`npm ci --omit=dev`). Le SDK AWS v3 est fourni par le runtime, il n'est pas embarqué.

Avant le zip, `check-deps.js` bloque le déploiement si un module requis manque, si un `require` relatif n'a pas la casse exacte du fichier, ou si un module natif compilé sous Windows s'est glissé dans le paquet.

> **Piège Linux** : le modèle est suivi par git sous le nom `app/models/article.js` alors que le code fait `require('../models/Article')`. Sous Windows ça passe, sous Linux la Lambda plante. Le script renomme le fichier en `Article.js` dans le paquet.

## Ajouter une dépendance à l'API

Ajoute-la dans `package.json` (racine) **et** dans `lambda-package.json`, puis régénère le verrou :

```bash
cd scripts/deploy-aws && cp lambda-package.json package.json && npm install --package-lock-only && mv package-lock.json lambda-package-lock.json && rm package.json
```

Elle doit être en pur JavaScript (la Lambda tourne sous Linux arm64).

## En cas de problème

- Journaux de l'API : `aws logs tail /aws/lambda/pirabel-api --profile axi --region eu-north-1 --since 10m`
- Revenir à la version précédente de l'API : relancer `-Api` depuis une copie du dépôt au commit précédent (par exemple `git worktree add ../pirabel-rollback <commit>`), sans toucher au dossier de travail courant.
- Les crons (EventBridge `pirabel-cron-inbox`, `pirabel-cron-prospection`, `pirabel-cron-weekly`) appellent la même Lambda : ils profitent du nouveau code sans autre action.

## Fonction CloudFront (redirections + URL propres)

Le code de la fonction `pirabel-labs-rewrite` est versionné dans `cf-rewrite.js`. Pour la mettre à jour :

```bash
E=$(aws cloudfront describe-function --name pirabel-labs-rewrite --profile axi --query ETag --output text)
E2=$(aws cloudfront update-function --name pirabel-labs-rewrite --if-match $E --function-config Comment="clean urls + redirects pirabel",Runtime=cloudfront-js-2.0 --function-code fileb://scripts/deploy-aws/cf-rewrite.js --profile axi --query ETag --output text)
aws cloudfront publish-function --name pirabel-labs-rewrite --if-match $E2 --profile axi
```

Les redirections d'articles du blog (`/blog/...`) sont gérées par l'API : `app/blog-redirects.json`.
