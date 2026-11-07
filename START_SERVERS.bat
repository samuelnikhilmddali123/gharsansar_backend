@echo off
setlocal EnableDelayedExpansion
title Ghar Sansar Services
color 0A

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

echo ================================================================
echo           GHAR SANSAR - ONE-CLICK SYSTEM LAUNCHER
echo ================================================================
echo.

:: 0. Free busy ports and stop lingering tunnel to avoid EADDRINUSE or Vite shifting ports
echo [*] Checking and freeing ports 5001, 5173, 5174, 5175 if busy...
taskkill /F /IM cloudflared.exe >nul 2>&1
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5001,5173,5174,5175 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }; exit 0" >nul 2>&1

:: 1. Locate Cloudflare Tunnel executable (bin\cloudflared.exe, AppData, Program Files, or PATH)
echo [*] Locating Cloudflare Tunnel executable...
set "CF_EXE="
if exist "%ROOT_DIR%\bin\cloudflared.exe" set "CF_EXE=%ROOT_DIR%\bin\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles(x86)%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%LOCALAPPDATA%\cloudflared\cloudflared.exe" set "CF_EXE=%LOCALAPPDATA%\cloudflared\cloudflared.exe"
if not defined CF_EXE (
    where cloudflared >nul 2>&1
    if not errorlevel 1 set "CF_EXE=cloudflared"
)

:: If cloudflared is still missing, auto-download standalone binary
if defined CF_EXE goto :cf_found
echo [*] cloudflared.exe not found. Downloading standalone binary to bin\cloudflared.exe...
if not exist "%ROOT_DIR%\bin" mkdir "%ROOT_DIR%\bin"
curl -L -o "%ROOT_DIR%\bin\cloudflared.exe" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
if exist "%ROOT_DIR%\bin\cloudflared.exe" set "CF_EXE=%ROOT_DIR%\bin\cloudflared.exe"

:cf_found

:: 2. Launch Backend Server
echo [*] Starting Backend Server on port 5001...
start "Ghar Sansar - Backend (5001)" /D "%ROOT_DIR%\backend" cmd /k "title Ghar Sansar - Backend (5001) && node server.js"

:: Give backend 2 seconds to bind port 5001 before starting frontend
echo [*] Waiting for Backend to bind port 5001...
ping 127.0.0.1 -n 3 >nul

:: 3. Launch Frontend Dev Server
echo [*] Starting Frontend Server on port 5173...
start "Ghar Sansar - Frontend (5173)" /D "%ROOT_DIR%\ghar_sansar_frontend" cmd /k "title Ghar Sansar - Frontend (5173) && npm run dev"

:: Give frontend 2 seconds to bind port 5173 before starting tunnel
echo [*] Waiting for Frontend to bind port 5173...
ping 127.0.0.1 -n 3 >nul


:: 4. Launch Official Cloudflare Tunnel
if not defined CF_EXE (
    echo [!] WARNING: cloudflared could not be found or downloaded. Tunnel was skipped.
    goto :after_tunnel
)

echo [*] Starting Official Cloudflare Tunnel for gharsansar.website...
start "Ghar Sansar - Cloudflare Tunnel" /D "%ROOT_DIR%" cmd /k "title Ghar Sansar - Cloudflare Tunnel && "%CF_EXE%" tunnel run --token eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMiLCJ0IjoiMWFlMGVhYjMtZGU0OS00MTVjLWJkODgtZGQwYzkzNmZjNTg5IiwicyI6Ik1qVXdZemc1WWpFdE1EVTFaaTAwWldOaUxUa3lORGd0T0RCaVpXUm1OV0l4T1RZeiJ9"

:after_tunnel

echo.
echo ================================================================
echo  All services are running in background terminal windows:
echo.
echo  - Frontend Web:     https://gharsansar.website
echo    [Note: Official domain is .website, NOT .website.com]
echo  - Backend API:      https://backend.gharsansar.website/api
echo  - Local Frontend:   http://localhost:5173
echo  - Local Backend:    http://localhost:5001
echo  - Swagger API Docs: http://localhost:5001/api-docs
if not exist "%ROOT_DIR%\..\ghar_sansar_mobile_app\package.json" goto :skip_mobile
echo.
echo  [Mobile App]: Run START_MOBILE_APP.bat to start Expo bundler
:skip_mobile
echo ================================================================
echo.
echo Press any key to open https://gharsansar.website in browser and close this window...
pause >nul
start https://gharsansar.website


