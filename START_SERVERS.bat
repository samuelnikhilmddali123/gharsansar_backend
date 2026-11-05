@echo off
setlocal EnableDelayedExpansion
title Ghar Sansar Services Launcher
color 0A

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

echo ================================================================
echo           GHAR SANSAR - ONE-CLICK SYSTEM LAUNCHER
echo ================================================================
echo.

:: 1. Pre-flight check for Node.js
where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo [ERROR] Node.js is not found in your system PATH!
    echo Please install Node.js from https://nodejs.org and try again.
    echo.
    pause
    exit /b 1
)

:: 2. Free busy ports (5001, 5173, 5174, 5175) to prevent EADDRINUSE
echo [*] Checking and freeing ports 5001, 5173, 5174, 5175 if busy...
taskkill /F /IM cloudflared.exe >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5001,5173,5174,5175 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }; exit 0" >nul 2>&1

:: 3. Launch Backend Server FIRST
echo [*] Starting Backend Server on port 5001...
start "Ghar Sansar - Backend (5001)" cmd /c "%ROOT_DIR%\backend\start-server.bat"

:: Give backend 3 seconds to bind port 5001 before starting frontend
echo [*] Waiting for Backend to bind port 5001...
ping 127.0.0.1 -n 4 >nul

:: 4. Launch Frontend Dev Server
echo [*] Starting Frontend Server on port 5173...
start "Ghar Sansar - Frontend (5173)" cmd /c "%ROOT_DIR%\ghar_sansar_frontend\start-frontend.bat"

:: Give frontend 3 seconds to bind port 5173
echo [*] Waiting for Frontend to bind port 5173...
ping 127.0.0.1 -n 4 >nul

:: 5. Locate Cloudflare Tunnel executable (optional for public domain)
echo [*] Checking Cloudflare Tunnel status...
set "CF_EXE="
if exist "%ROOT_DIR%\bin\cloudflared.exe" set "CF_EXE=%ROOT_DIR%\bin\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles(x86)%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%LOCALAPPDATA%\cloudflared\cloudflared.exe" set "CF_EXE=%LOCALAPPDATA%\cloudflared\cloudflared.exe"
if not defined CF_EXE (
    where cloudflared >nul 2>&1
    if not errorlevel 1 set "CF_EXE=cloudflared"
)

set "TUNNEL_STARTED=0"
if defined CF_EXE (
    echo [*] Starting Official Cloudflare Tunnel for gharsansar.website...
    start "Ghar Sansar - Cloudflare Tunnel" cmd /c "%ROOT_DIR%\start-official-tunnel.bat"
    set "TUNNEL_STARTED=1"
) else (
    echo [i] Cloudflare Tunnel [cloudflared.exe] not found.
    echo     Local development is fully ready without it!
    echo     To enable public domain gharsansar.website, install cloudflared or place it in bin\cloudflared.exe
)

echo.
echo ================================================================
echo               SERVICES STATUS ^& QUICK ACCESS
echo ================================================================
echo.
echo   - Local Frontend:   http://localhost:5173
echo   - Local Backend:    http://localhost:5001
echo   - Swagger API Docs: http://localhost:5001/api-docs
if "%TUNNEL_STARTED%"=="1" (
    echo   - Public Domain:    https://gharsansar.website
    echo   - Public API:       https://backend.gharsansar.website/api
)
if exist "%ROOT_DIR%\..\ghar_sansar_mobile_app\package.json" (
    echo.
    echo   - Mobile App:       Run START_MOBILE_APP.bat to start Expo bundler
)
echo.
echo ================================================================
echo.
echo Quick Actions:
echo   [1] Open Local Frontend (http://localhost:5173) - Default
if "%TUNNEL_STARTED%"=="1" echo   [2] Open Public Website (https://gharsansar.website)
echo   [3] Open Swagger API Docs (http://localhost:5001/api-docs)
echo   [4] Exit launcher (services keep running in background)
echo.

set "CHOICE=1"
set /p "CHOICE=Enter choice 1-4 [Default: 1]: "

if "%CHOICE%"=="2" (
    if "%TUNNEL_STARTED%"=="1" (
        start https://gharsansar.website
    ) else (
        start http://localhost:5173
    )
) else if "%CHOICE%"=="3" (
    start http://localhost:5001/api-docs
) else if "%CHOICE%"=="4" (
    exit /b 0
) else (
    start http://localhost:5173
)
