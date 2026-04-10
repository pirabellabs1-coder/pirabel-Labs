@echo off
echo ========================================================
echo RESOLUTION DU BLOCAGE GITHUB (SECRET SCANNING)
echo ========================================================
echo.
echo 1. Suppression des fichiers de tests contenant la cle API Brevo...
del test-brevo.js 2>nul
del test-brevo-noreply.js 2>nul

echo 2. Nettoyage de l'historique Git local (Git rm)...
git rm --cached test-brevo.js 2>nul
git rm --cached test-brevo-noreply.js 2>nul

echo 3. Mise a jour du commit precedent sans les secrets...
git commit --amend --no-edit

echo 4. Nouveau deploiement vers Vercel (Push)...
git push

echo.
echo Deploiement lance et corrige ! 
pause
