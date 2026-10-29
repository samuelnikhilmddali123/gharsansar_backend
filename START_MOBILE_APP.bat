@echo off
title Ghar Sansar - Mobile App (Expo)
color 0B

set "ROOT_DIR=%~dp0"
set "APP_DIR=%ROOT_DIR%..\ghar_sansar_mobile_app"

if not exist "%APP_DIR%\package.json" (
    echo [ERROR] Mobile app directory not found at "%APP_DIR%".
    pause
    exit /b 1
)

echo ================================================================
echo           GHAR SANSAR - MOBILE APP LAUNCHER (EXPO)
echo ================================================================
echo.
echo [*] Starting Expo Metro Bundler in %APP_DIR%...
cd /d "%APP_DIR%"
npm start
