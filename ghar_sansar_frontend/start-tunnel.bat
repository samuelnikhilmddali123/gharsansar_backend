@echo off
title Ghar Sansar - Frontend Tunnel (5173)
color 0E

set "CF_EXE="
if exist "%~dp0..\bin\cloudflared.exe" set "CF_EXE=%~dp0..\bin\cloudflared.exe"
if not defined CF_EXE if exist "%LOCALAPPDATA%\cloudflared\cloudflared.exe" set "CF_EXE=%LOCALAPPDATA%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles(x86)%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles%\cloudflared\cloudflared.exe"
if not defined CF_EXE (
    where cloudflared >nul 2>&1
    if not errorlevel 1 set "CF_EXE=cloudflared"
)

if not defined CF_EXE (
    echo [ERROR] cloudflared.exe not found!
    pause
    exit /b 1
)

echo Starting Cloudflare Tunnel for Ghar Sansar Frontend (Port 5173)...
"%CF_EXE%" tunnel --url http://localhost:5173
pause
