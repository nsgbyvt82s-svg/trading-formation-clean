@echo off
title Lancement du site et du bot
echo Démarrage du site Next.js...
start "Site Next.js" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 5 /nobreak >nul
echo Démarrage du bot Discord...
echo ===================================
echo Le site est en cours d'exécution dans une autre fenêtre.
echo Site: http://localhost:3000
echo ===================================
echo.
python bot.py
