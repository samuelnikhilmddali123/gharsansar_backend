@echo off
title Ghar Sansar - Official Cloudflare Tunnel
color 0E

set "CF_EXE="
if exist "%~dp0bin\cloudflared.exe" set "CF_EXE=%~dp0bin\cloudflared.exe"
if not defined CF_EXE if exist "%LOCALAPPDATA%\cloudflared\cloudflared.exe" set "CF_EXE=%LOCALAPPDATA%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles(x86)%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "C:\Users\admin\Downloads\saibalaji_silverworks-main\cloudflared.exe" set "CF_EXE=C:\Users\admin\Downloads\saibalaji_silverworks-main\cloudflared.exe"
if not defined CF_EXE (
    where cloudflared >nul 2>&1
    if not errorlevel 1 set "CF_EXE=cloudflared"
)

if not defined CF_EXE (
    color 0C
    echo ================================================================
    echo [ERROR] cloudflared.exe was not found on your system!
    echo ================================================================
    echo To install Cloudflare Tunnel, run:
    echo   winget install Cloudflare.cloudflared
    echo Or download cloudflared.exe and place it in the bin\ directory.
    echo ================================================================
    echo.
    pause
    exit /b 1
)

:: Check if Ghar Sansar tunnel specifically is already active
powershell -NoProfile -ExecutionPolicy Bypass -Command "$t = Get-CimInstance Win32_Process -Filter \"Name='cloudflared.exe'\" | Where-Object { $_.CommandLine -like '*eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMi*' -or $_.CommandLine -like '*1ae0eab3-de49-415c-bd88-dd0c936fc589*' }; if ($t) { exit 0 } else { exit 1 }" >nul 2>&1
if not errorlevel 1 (
    color 0A
    echo ================================================================
    echo [OK] Ghar Sansar Official Tunnel is ALREADY running!
    echo ================================================================
    echo Website: https://gharsansar.website
    echo Backend: https://backend.gharsansar.website/api
    echo ================================================================
    echo.
    echo Press any key to close this window, or press Ctrl+C to stop the tunnel.
    pause >nul
    exit /b 0
)

echo ================================================================
echo Starting Official Cloudflare Tunnel for gharsansar.website...
echo Executable: %CF_EXE%
echo Mode:       HTTP2 (TCP 443 Reliable Protocol)
echo ================================================================
echo.

"%CF_EXE%" tunnel run --protocol http2 --token eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMiLCJ0IjoiMWFlMGVhYjMtZGU0OS00MTVjLWJkODgtZGQwYzkzNmZjNTg5IiwicyI6Ik1qVXdZemc1WWpFdE1EVTFaaTAwWldOaUxUa3lORGd0T0RCaVpXUm1OV0l4T1RZeiJ9

if errorlevel 1 (
    echo.
    echo [!] Attempting fallback without protocol flag...
    "%CF_EXE%" tunnel run --token eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMiLCJ0IjoiMWFlMGVhYjMtZGU0OS00MTVjLWJkODgtZGQwYzkzNmZjNTg5IiwicyI6Ik1qVXdZemc1WWpFdE1EVTFaaTAwWldOaUxUa3lORGd0T0RCaVpXUm1OV0l4T1RZeiJ9
)

echo.
echo Tunnel has stopped.
pause
