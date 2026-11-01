<#
.SYNOPSIS
  Déploie le site Pirabel Labs sur AWS (front Astro -> S3 + CloudFront, API Express -> Lambda).

.DESCRIPTION
  Sans option : front ET API. -Front ou -Api pour n'en déployer qu'un.
  -DryRun : construit tout (build Astro, paquet Lambda, zip) sans rien envoyer ;
            si la session AWS est valide, affiche aussi ce que « s3 sync » enverrait.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\deploy-aws\deploy.ps1 -DryRun
  powershell -ExecutionPolicy Bypass -File scripts\deploy-aws\deploy.ps1 -Api
#>
param(
  [switch]$Front,
  [switch]$Api,
  [switch]$DryRun,
  [switch]$SkipBuild   # réutilise dist/ tel quel (front uniquement)
)

$ErrorActionPreference = 'Stop'

# --- Configuration (contrainte SCP : toute ressource régionale en eu-north-1) ---
$Profile_     = 'axi'
$Region       = 'eu-north-1'
$Bucket       = 'pirabel-labs-144115242691-eun1'
$Distribution = 'E2JIG1ASYJQFUE'
$Function     = 'pirabel-api'
$HealthUrl    = 'https://www.pirabellabs.com/api/health'

if (-not $Front -and -not $Api) { $Front = $true; $Api = $true }

$Here    = $PSScriptRoot
$Repo    = (Resolve-Path (Join-Path $Here '..\..')).Path
$WorkDir = Join-Path $env:TEMP 'pirabel-deploy'
$Stage   = Join-Path $WorkDir 'lambda'
$Zip     = Join-Path $WorkDir 'pirabel-lambda.zip'

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Fail($msg) { Write-Host "ERREUR : $msg" -ForegroundColor Red; exit 1 }
function Check($what) { if ($LASTEXITCODE -ne 0) { Fail "$what (code $LASTEXITCODE)" } }

# Les commandes natives écrivent sur stderr sans que ce soit une erreur : on ne laisse pas PowerShell les transformer en exceptions.
# Exécutable résolu explicitement : une fonction nommée « Aws » masquerait « aws » (PowerShell ignore la casse).
$AwsExe = (Get-Command aws -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
function Invoke-Aws { $ErrorActionPreference = 'Continue'; & $AwsExe @args --profile $Profile_ --region $Region; }

# --- 0. Session AWS ---
Step 'Vérification de la session AWS (profil axi)'
$ErrorActionPreference = 'Continue'
$ident = & $AwsExe sts get-caller-identity --profile $Profile_ --region $Region --output text --query Arn 2>$null
$awsOk = ($LASTEXITCODE -eq 0)
$ErrorActionPreference = 'Stop'
if ($awsOk) {
  Write-Host "Connecté : $ident"
} elseif ($DryRun) {
  Write-Host 'Session AWS absente ou expirée : le dry-run continue sans aucun appel AWS.' -ForegroundColor Yellow
} else {
  Write-Host 'Session AWS absente ou expirée. Reconnecte-toi puis relance :' -ForegroundColor Yellow
  Write-Host '  aws login --profile axi --remote   (ouvre l''URL affichée sur ton téléphone)'
  exit 1
}

# Avertit si on déploie des modifications non commitées (le déploiement part du dossier de travail).
$ErrorActionPreference = 'Continue'
$dirty = & git -C $Repo status --porcelain -- api app src public 2>$null
$ErrorActionPreference = 'Stop'
if ($dirty) {
  Write-Host "`nAttention : modifications non commitées qui partiront avec ce déploiement :" -ForegroundColor Yellow
  $dirty | ForEach-Object { Write-Host "  $_" }
}

# --- 1. Front : Astro -> S3 -> CloudFront ---
if ($Front) {
  $dist = Join-Path $Repo 'dist'
  if (-not $SkipBuild) {
    Step 'Build Astro (npm run build)'
    Push-Location $Repo
    try { & npm run build; Check 'Build Astro' } finally { Pop-Location }
  }
  if (-not (Test-Path (Join-Path $dist 'index.html'))) { Fail "dist\index.html introuvable : build incomplet." }
  $count = (Get-ChildItem $dist -Recurse -File | Measure-Object).Count
  Write-Host "dist/ : $count fichiers"

  $s3 = "s3://$Bucket"
  $dry = @(); if ($DryRun) { $dry = @('--dryrun') }
  if ($DryRun -and -not $awsOk) {
    Write-Host '(dry-run hors ligne : envoi S3 et invalidation CloudFront sautés)'
  } else {
    # Ordre : d'abord les assets hachés (cache 1 an), puis le HTML et le reste (toujours revalidé),
    # enfin un sync --delete qui retire les pages supprimées. Les anciens /_astro/* sont gardés
    # pour ne pas casser une page HTML encore en cache chez un visiteur.
    Step 'Envoi des assets /_astro (cache immuable)'
    Invoke-Aws s3 sync (Join-Path $dist '_astro') "$s3/_astro" --cache-control 'public,max-age=31536000,immutable' --only-show-errors @dry
    Check 's3 sync _astro'
    Step 'Envoi du HTML et des fichiers publics (revalidation à chaque visite)'
    Invoke-Aws s3 sync $dist $s3 --exclude '_astro/*' --cache-control 'public,max-age=0,must-revalidate' --only-show-errors @dry
    Check 's3 sync site'
    Step 'Suppression des fichiers retirés du site'
    Invoke-Aws s3 sync $dist $s3 --delete --exclude '_astro/*' @dry
    Check 's3 sync --delete'

    if ($DryRun) {
      Write-Host '(dry-run : invalidation CloudFront sautée)'
    } else {
      Step "Invalidation CloudFront $Distribution (/*)"
      $inv = Invoke-Aws cloudfront create-invalidation --distribution-id $Distribution --paths '/*' --query Invalidation.Id --output text
      Check 'Invalidation CloudFront'
      Write-Host "Invalidation $inv lancée (propagation ~1 à 5 min)."
    }
  }
}

# --- 2. API : Express -> Lambda ---
if ($Api) {
  Step "Assemblage du paquet Lambda dans $Stage"
  if (Test-Path $WorkDir) { Remove-Item $WorkDir -Recurse -Force }
  New-Item -ItemType Directory -Force $Stage | Out-Null

  # robocopy : codes de sortie < 8 = succès.
  & robocopy (Join-Path $Repo 'api') (Join-Path $Stage 'api') /E /NFL /NDL /NJH /NJS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { Fail 'Copie de api/' }
  & robocopy (Join-Path $Repo 'app') (Join-Path $Stage 'app') /E /NFL /NDL /NJH /NJS /NP `
      /XD (Join-Path $Repo 'app\node_modules') (Join-Path $Repo 'app\public\uploads') | Out-Null
  if ($LASTEXITCODE -ge 8) { Fail 'Copie de app/' }
  $global:LASTEXITCODE = 0

  Copy-Item (Join-Path $Here 'lambda.js') $Stage
  Copy-Item (Join-Path $Here 'lambda-package.json') (Join-Path $Stage 'package.json')
  Copy-Item (Join-Path $Here 'lambda-package-lock.json') (Join-Path $Stage 'package-lock.json')

  # PIÈGE Linux : le code fait require('../models/Article') mais le fichier suivi s'appelle article.js.
  # Sous Windows, Rename-Item ne change pas la casse en une étape : on passe par un nom temporaire.
  $models = Join-Path $Stage 'app\models'
  Get-ChildItem $models -File | Where-Object { $_.Name -ceq 'article.js' } | ForEach-Object {
    Rename-Item $_.FullName 'Article.tmp.js'
    Rename-Item (Join-Path $models 'Article.tmp.js') 'Article.js'
    Write-Host 'app/models/article.js renommé en Article.js'
  }

  Step 'Installation des dépendances de production (npm ci --omit=dev)'
  Push-Location $Stage
  try { & npm ci --omit=dev --no-audit --no-fund; Check 'npm ci' } finally { Pop-Location }

  Step 'Vérification du paquet (dépendances, casse, modules natifs)'
  & node (Join-Path $Here 'check-deps.js') $Stage
  Check 'Vérification du paquet'

  Step 'Création du zip'
  # tar.exe de Windows (bsdtar) écrit des chemins avec « / » : indispensable pour Lambda (Compress-Archive de PS 5.1 met des « \ »).
  $tar = Join-Path $env:SystemRoot 'System32\tar.exe'
  & $tar -a -c -f $Zip -C $Stage lambda.js package.json api app node_modules
  Check 'Création du zip'
  $mb = [math]::Round((Get-Item $Zip).Length / 1MB, 1)
  Write-Host "Zip : $Zip ($mb Mo)"
  if ($mb -ge 50) { Fail 'Zip > 50 Mo : envoi direct impossible, passer par S3.' }

  if ($DryRun) {
    Write-Host '(dry-run : mise à jour de la Lambda sautée)'
  } else {
    Step "Mise à jour du code de la Lambda $Function"
    Invoke-Aws lambda update-function-code --function-name $Function --zip-file "fileb://$Zip" --query LastUpdateStatus --output text
    Check 'update-function-code'
    Invoke-Aws lambda wait function-updated-v2 --function-name $Function
    Check 'Attente de la mise à jour'
    Write-Host 'Lambda à jour.'

    Step "Test de santé : $HealthUrl"
    $ok = $false
    for ($i = 1; $i -le 5 -and -not $ok; $i++) {
      try {
        $r = Invoke-WebRequest $HealthUrl -UseBasicParsing -TimeoutSec 30
        if ($r.StatusCode -eq 200) { $ok = $true; Write-Host "OK (HTTP 200) : $($r.Content)" }
      } catch { Write-Host "Essai $i : $($_.Exception.Message)"; Start-Sleep -Seconds 5 }
    }
    if (-not $ok) { Fail "L'API ne répond pas correctement. Voir les journaux : aws logs tail /aws/lambda/$Function --profile axi --region eu-north-1 --since 10m" }
  }
}

Step $(if ($DryRun) { 'Dry-run terminé : rien n''a été envoyé.' } else { 'Déploiement terminé.' })
