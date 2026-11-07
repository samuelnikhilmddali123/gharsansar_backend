@echo off
title Ghar Sansar - Official Cloudflare Tunnel
color 0E

set "CF_EXE="
if exist "%~dp0bin\cloudflared.exe" set "CF_EXE=%~dp0bin\cloudflared.exe"
if not defined CF_EXE if exist "%LOCALAPPDATA%\cloudflared\cloudflared.exe" set "CF_EXE=%LOCALAPPDATA%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles(x86)%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles%\cloudflared\cloudflared.exe"
if not defined CF_EXE (
    where cloudflared >nul 2>&1
    if not errorlevel 1 set "CF_EXE=cloudflared"
)

if not defined CF_EXE (
    echo [ERROR] cloudflared.exe not found!
    echo Run START_SERVERS.bat to auto-download or place cloudflared.exe in bin\
    pause
    exit /b 1
)

echo Starting Official Cloudflare Tunnel for gharsansar.website using "%CF_EXE%"...
"%CF_EXE%" tunnel run --token eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMiLCJ0IjoiMWFlMGVhYjMtZGU0OS00MTVjLWJkODgtZGQwYzkzNmZjNTg5IiwicyI6Ik1qVXdZemc1WWpFdE1EVTFaaTAwWldOaUxUa3lORGd0T0RCaVpXUm1OV0l4T1RZeiJ9
pause
