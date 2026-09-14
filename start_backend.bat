@echo off
title DineEase Backend Server
echo ====================================================
echo Starting DineEase Restaurant Backend (Port 3000)...
echo SQLite Database: restaurant.db
echo ====================================================
cd /d "%~dp0"
node server.js
pause
