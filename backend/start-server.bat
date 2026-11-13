@echo off
title Ghar Sansar Backend (Port 5001)
color 0B
echo Starting Ghar Sansar Backend Server on Port 5001...
cd /d "%~dp0"

:: Release port 5001 if occupied by a stale zombie process
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5001 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1
timeout /t 1 /nobreak >nul

node server.js
if errorlevel 1 (
    echo.
    echo ================================================================
    echo [ERROR] Backend exited with error code %errorlevel%.
    echo Check the error message above for details.
    echo ================================================================
)
pause
