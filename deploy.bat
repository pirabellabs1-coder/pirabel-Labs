@echo off
echo ========================================================
echo Déploiement des nouveaux templates email vers Vercel
echo ========================================================
git add .
git commit -m "Fix: Vercel routing rules for SEO and Hub pages"
git push
echo.
echo Deploiement lance ! Vercel mettra le site a jour dans 1 minute.
pause
