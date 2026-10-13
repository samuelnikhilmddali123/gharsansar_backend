@echo off
title Ghar Sansar Services
color 0A

echo ================================================================
echo           GHAR SANSAR - ONE-CLICK SYSTEM LAUNCHER
echo ================================================================
echo.

:: 1. Launch Backend Server
echo [*] Starting Backend Server on port 5001...
start "Ghar Sansar - Backend (5001)" cmd /k "cd /d "%~dp0backend" && node server.js"

:: 2. Launch Frontend Dev Server
echo [*] Starting Frontend Server on port 5173...
start "Ghar Sansar - Frontend (5173)" cmd /k "cd /d "%~dp0ghar_sansar_frontend" && npm run dev"

:: 3. Launch Official Cloudflare Tunnel
echo [*] Starting Cloudflare Tunnel (gharsansar.website)...
start "Ghar Sansar - Cloudflare Tunnel" cmd /k ""C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel run --token eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMiLCJ0IjoiMWFlMGVhYjMtZGU0OS00MTVjLWJkODgtZGQwYzkzNmZjNTg5IiwicyI6Ik1qVXdZemc1WWpFdE1EVTFaaTAwWldOaUxUa3lORGd0T0RCaVpXUm1OV0l4T1RZeiJ9"

echo.
echo ================================================================
echo  All 3 services are running in background terminal windows:
echo.
echo  - Frontend Web:     https://gharsansar.website
echo  - Backend API:      https://backend.gharsansar.website/api
echo  - Local Frontend:   http://localhost:5173
echo  - Local Backend:    http://localhost:5001
echo ================================================================
echo.
echo Press any key to close this launcher window (services keep running)...
pause >nul
