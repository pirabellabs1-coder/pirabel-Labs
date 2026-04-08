@echo off
echo ========================================================
echo Déploiement des nouveaux templates email vers Vercel
echo ========================================================
git add .
git commit -m "Mise en place templates email recruitment premium et correctif admin notification"
git push
echo.
echo Deploiement lance ! Vercel mettra le site a jour dans 1 minute.
pause
