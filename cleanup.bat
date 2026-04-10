@echo off
echo ========================================================
echo RESTAURATION COMPLETE DU SITE AVANT LE SPRINT SEO
echo ========================================================
echo.
echo 1. Suppression du dossier /villes/ et index...
rmdir /s /q "villes"
del "zones-intervention.html" 2>nul
del "scripts\generate-seo-pages.js" 2>nul
del "scripts\generate-hub.js" 2>nul

echo 2. Nettoyage de l'historique Git...
git rm -r --cached villes 2>nul
git rm --cached zones-intervention.html 2>nul
git rm --cached scripts/generate-hub.js 2>nul

echo 3. Restauration des fichiers originaux (index, services, sitemap, llms)...
git checkout HEAD~2 index.html services.html sitemap.xml llms.txt llms-full.txt vercel.json deploy.bat

echo 4. Commit d'annulation des modifications...
git commit -m "Revert: Nettoyage total du sprint de generation SEO (pages villes supprimees et fichiers restaures)"

echo 5. Deploiement vers Vercel pour corriger le site en ligne...
git push

echo.
echo ========================================================
echo NETTOYAGE TERMINE ET ENVOYE A VERCEL
echo ========================================================
pause
