@echo off
title Ghar Sansar Frontend (Port 5173)
color 0A

cd /d "%~dp0"

if exist "%~dp0dist\index.html" (
    echo ================================================================
    echo    Starting Optimized Production Server on Port 5173
    echo    (Bundled & code-split for sub-second page loads over tunnel)
    echo ================================================================
    call npm.cmd run preview
) else (
    echo ================================================================
    echo    Starting Frontend Dev Server on Port 5173...
    echo ================================================================
    call npm.cmd run dev
)
pause
