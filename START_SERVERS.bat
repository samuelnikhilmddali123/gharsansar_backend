@echo off
title Ghar Sansar Services
color 0A

set "ROOT_DIR=%~dp0"

echo ================================================================
echo           GHAR SANSAR - ONE-CLICK SYSTEM LAUNCHER
echo ================================================================
echo.

:: 0. Free busy ports to avoid EADDRINUSE or Vite shifting to port 5174
echo [*] Checking and freeing ports 5001 and 5173 if busy...
powershell -NoProfile -Command "Get-Process -Id (Get-NetTCPConnection -LocalPort 5001, 5173 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" >nul 2>&1

:: 1. Locate Cloudflare Tunnel executable (bin\cloudflared.exe, AppData, Program Files, or PATH)
echo [*] Locating Cloudflare Tunnel executable...
set "CF_EXE="
if exist "%ROOT_DIR%bin\cloudflared.exe" set "CF_EXE=%ROOT_DIR%bin\cloudflared.exe"
if not defined CF_EXE if exist "%LOCALAPPDATA%\cloudflared\cloudflared.exe" set "CF_EXE=%LOCALAPPDATA%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles(x86)%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles%\cloudflared\cloudflared.exe"
if not defined CF_EXE (
    where cloudflared >nul 2>&1
    if not errorlevel 1 set "CF_EXE=cloudflared"
)

:: If cloudflared is still missing, auto-download standalone binary
if not defined CF_EXE (
    echo [*] cloudflared.exe not found. Downloading standalone binary to bin\cloudflared.exe...
    if not exist "%ROOT_DIR%bin" mkdir "%ROOT_DIR%bin"
    curl -L -o "%ROOT_DIR%bin\cloudflared.exe" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    if exist "%ROOT_DIR%bin\cloudflared.exe" set "CF_EXE=%ROOT_DIR%bin\cloudflared.exe"
)

:: 2. Launch Backend Server
echo [*] Starting Backend Server on port 5001...
start "Ghar Sansar - Backend (5001)" /D "%ROOT_DIR%backend" cmd /k "node server.js"

:: 3. Launch Frontend Dev Server
echo [*] Starting Frontend Server on port 5173...
start "Ghar Sansar - Frontend (5173)" /D "%ROOT_DIR%ghar_sansar_frontend" cmd /k "npm run dev"

:: 4. Launch Official Cloudflare Tunnel
if defined CF_EXE (
    echo [*] Starting Cloudflare Tunnel using "%CF_EXE%"...
    start "Ghar Sansar - Cloudflare Tunnel" cmd /k ""%CF_EXE%" tunnel run --token eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMiLCJ0IjoiMWFlMGVhYjMtZGU0OS00MTVjLWJkODgtZGQwYzkzNmZjNTg5IiwicyI6Ik1qVXdZemc1WWpFdE1EVTFaaTAwWldOaUxUa3lORGd0T0RCaVpXUm1OV0l4T1RZeiJ9"
) else (
    echo [!] WARNING: cloudflared could not be found or downloaded. Tunnel was skipped.
)

echo.
echo ================================================================
echo  All services are running in background terminal windows:
echo.
echo  - Frontend Web:     https://gharsansar.website
echo  - Backend API:      https://backend.gharsansar.website/api
echo  - Local Frontend:   http://localhost:5173
echo  - Local Backend:    http://localhost:5001
echo  - Swagger API Docs: http://localhost:5001/api-docs
if exist "%ROOT_DIR%..\ghar_sansar_mobile_app\package.json" (
echo.
echo  [Mobile App]: Run START_MOBILE_APP.bat to start Expo bundler
)
echo ================================================================
echo.
echo Press any key to close this launcher window (services keep running)...
pause >nul
