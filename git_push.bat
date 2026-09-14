@echo off
title Push to GitHub (MounikaS08)
echo ====================================================
echo Pushing DineEase Project to GitHub (MounikaS08)...
echo ====================================================
cd /d "%~dp0"
git push -u origin main
echo.
if %ERRORLEVEL% equ 0 (
    echo ====================================================
    echo [SUCCESS] Project successfully uploaded to GitHub!
    echo URL: https://github.com/MounikaS08/RESTAURANT-TABLE-RESERVATION
    echo ====================================================
) else (
    echo ====================================================
    echo [ERROR] Push failed. Make sure you have created the
    echo repository on GitHub: https://github.com/new
    echo with Repository Name: RESTAURANT-TABLE-RESERVATION
    echo ====================================================
)
pause
