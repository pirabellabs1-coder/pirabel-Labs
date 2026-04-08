@echo off
echo ========================================================
echo Déploiement des nouveaux templates email vers Vercel
echo ========================================================
git add .
git commit -m "Fix: portal sidebar, public quote routes, modifier-devis routing"
git push
echo.
echo Deploiement lance ! Vercel mettra le site a jour dans 1 minute.
pause
