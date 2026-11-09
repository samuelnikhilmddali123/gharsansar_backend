@echo off
title Ghar Sansar Frontend (Port 5173)
color 0A

cd /d "%~dp0"

:: Kill any existing process holding port 5173 before binding
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1
timeout /t 1 /nobreak >nul

if exist "dist\index.html" (
    echo ================================================================
    echo    Starting Optimized Production Server on Port 5173
    echo    (Bundled & code-split for sub-second page loads over tunnel)
    echo ================================================================
    call npm.cmd run preview
) else (
    echo ================================================================
    echo    Building Optimized Production Frontend...
    echo ================================================================
    call npm.cmd run build
    call npm.cmd run preview
)
pause
