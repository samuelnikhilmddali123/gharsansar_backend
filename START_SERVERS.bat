@echo off
setlocal EnableDelayedExpansion
title Ghar Sansar Services Launcher
color 0A

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

:: Remove any leftover stop signal
if exist "%ROOT_DIR%\.guardian_stop" del /f /q "%ROOT_DIR%\.guardian_stop" >nul 2>&1

:: 1. Pre-flight check for Node.js
where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ================================================================
    echo [ERROR] Node.js is not found in your system PATH!
    echo Please install Node.js from https://nodejs.org and try again.
    echo ================================================================
    pause
    exit /b 1
)

:: 2. Ensure Windows Sleep Mode is Disabled Permanently
powercfg /change standby-timeout-ac 0 >nul 2>&1
powercfg /change standby-timeout-dc 0 >nul 2>&1
powercfg /change hibernate-timeout-ac 0 >nul 2>&1
powercfg /change hibernate-timeout-dc 0 >nul 2>&1
powercfg /change disk-timeout-ac 0 >nul 2>&1
powercfg /change disk-timeout-dc 0 >nul 2>&1

:: 3. Ensure 24/7 Guardian Watchdog is Running in Background
powershell -NoProfile -ExecutionPolicy Bypass -Command "$f = '%ROOT_DIR%\.guardian.pid'; if (Test-Path $f) { $p = Get-Content $f -ErrorAction SilentlyContinue; if ($p -and (Get-Process -Id $p -ErrorAction SilentlyContinue)) { exit 0 } }; exit 1" >nul 2>&1
if errorlevel 1 (
    echo [*] Starting 24/7 Guardian Watchdog in background...
    start "" wscript.exe "%ROOT_DIR%\guardian_launcher.vbs"
)

:: 4. Check & Start Backend Server (Port 5001)
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort 5001 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo [*] Starting Backend Server on port 5001...
    start "Ghar Sansar - Backend (5001)" cmd /k "%ROOT_DIR%\backend\start-server.bat"
    echo [*] Waiting for Backend to bind port 5001...
    ping 127.0.0.1 -n 4 >nul
) else (
    echo [OK] Backend Server already running on port 5001.
)

:: 5. Check & Start Frontend Dev Server (Port 5173)
powershell -NoProfile -ExecutionPolicy Bypass -Command "if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 (
    echo [*] Starting Frontend Server on port 5173...
    start "Ghar Sansar - Frontend (5173)" cmd /k "%ROOT_DIR%\ghar_sansar_frontend\start-frontend.bat"
    echo [*] Waiting for Frontend to bind port 5173...
    ping 127.0.0.1 -n 4 >nul
) else (
    echo [OK] Frontend Server already running on port 5173.
)

:: 6. Locate Cloudflare Tunnel executable & Check Status specifically for Ghar Sansar
set "CF_EXE="
if exist "%ROOT_DIR%\bin\cloudflared.exe" set "CF_EXE=%ROOT_DIR%\bin\cloudflared.exe"
if not defined CF_EXE if exist "%LOCALAPPDATA%\cloudflared\cloudflared.exe" set "CF_EXE=%LOCALAPPDATA%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles(x86)%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "%ProgramFiles%\cloudflared\cloudflared.exe" set "CF_EXE=%ProgramFiles%\cloudflared\cloudflared.exe"
if not defined CF_EXE if exist "C:\Users\admin\Downloads\saibalaji_silverworks-main\cloudflared.exe" set "CF_EXE=C:\Users\admin\Downloads\saibalaji_silverworks-main\cloudflared.exe"
if not defined CF_EXE (
    where cloudflared >nul 2>&1
    if not errorlevel 1 set "CF_EXE=cloudflared"
)

set "TUNNEL_STARTED=0"
if defined CF_EXE (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$t = Get-CimInstance Win32_Process -Filter \"Name='cloudflared.exe'\" | Where-Object { $_.CommandLine -like '*eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMi*' -or $_.CommandLine -like '*1ae0eab3-de49-415c-bd88-dd0c936fc589*' }; if ($t) { exit 0 } else { exit 1 }" >nul 2>&1
    if errorlevel 1 (
        echo [*] Starting Official Cloudflare Tunnel for gharsansar.website...
        start "Ghar Sansar - Cloudflare Tunnel" cmd /k "%ROOT_DIR%\start-official-tunnel.bat"
        set "TUNNEL_STARTED=1"
        ping 127.0.0.1 -n 3 >nul
    ) else (
        echo [OK] Ghar Sansar Cloudflare Tunnel already running.
        set "TUNNEL_STARTED=1"
    )
) else (
    echo [i] Cloudflare Tunnel executable not found.
)

:MENU_LOOP
cls
echo ================================================================
echo           GHAR SANSAR - 24/7 ALWAYS-ON SERVER CONSOLE
echo ================================================================
echo.
echo   System Sleep Mode  : NEVER (Sleep and Hibernate Disabled)
echo   Auto-Restart Guard : ACTIVE (Window and Services Protected)
echo   Directory          : %ROOT_DIR%
echo.
echo ================================================================
echo               SERVICES STATUS AND ACCESS
echo ================================================================
echo.
echo   - Local Frontend:   http://localhost:5173
echo   - Local Backend:    http://localhost:5001
echo   - Swagger API Docs: http://localhost:5001/api-docs
if "%TUNNEL_STARTED%"=="1" (
    echo   - Public Website:   https://gharsansar.website
    echo   - Public API:       https://backend.gharsansar.website/api
)
echo.
echo ================================================================
echo   [!] KEEP THIS WINDOW OPEN FOR 24/7 HOSTING.
echo ================================================================
echo.
echo Quick Actions:
echo   [1] Open Local Frontend (http://localhost:5173)
if "%TUNNEL_STARTED%"=="1" echo   [2] Open Public Website (https://gharsansar.website)
echo   [3] Open Swagger API Docs (http://localhost:5001/api-docs)
echo   [T] Run Diagnostics & Connection Health Check (test_fix.bat)
echo   [R] Restart all Ghar Sansar services (Backend, Frontend, Tunnel)
echo   [Q] Stop and Exit (Maintenance mode)
echo.

set "CHOICE="
set /p "CHOICE=Enter choice [1-3, T, R, Q, or Enter to Refresh]: "

if not defined CHOICE (
    ping 127.0.0.1 -n 6 >nul
    goto MENU_LOOP
)

if /i "%CHOICE%"=="1" (
    start http://localhost:5173
    goto MENU_LOOP
)
if /i "%CHOICE%"=="2" (
    if "%TUNNEL_STARTED%"=="1" (
        start https://gharsansar.website
    ) else (
        start http://localhost:5173
    )
    goto MENU_LOOP
)
if /i "%CHOICE%"=="3" (
    start http://localhost:5001/api-docs
    goto MENU_LOOP
)
if /i "%CHOICE%"=="T" (
    call "%ROOT_DIR%\test_fix.bat"
    goto MENU_LOOP
)
if /i "%CHOICE%"=="R" (
    goto RESTART_SERVICES
)
if /i "%CHOICE%"=="Q" (
    goto CLEAN_SHUTDOWN
)
ping 127.0.0.1 -n 2 >nul
goto MENU_LOOP

:RESTART_SERVICES
echo.
echo [*] Restarting all Ghar Sansar services...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -Filter \"Name='cloudflared.exe'\" | Where-Object { $_.CommandLine -like '*eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMi*' -or $_.CommandLine -like '*1ae0eab3-de49-415c-bd88-dd0c936fc589*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; exit 0" >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5001,5173,5174,5175 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }; exit 0" >nul 2>&1
ping 127.0.0.1 -n 2 >nul
echo [*] Starting Backend...
start "Ghar Sansar - Backend (5001)" cmd /k "%ROOT_DIR%\backend\start-server.bat"
ping 127.0.0.1 -n 4 >nul
echo [*] Starting Frontend...
start "Ghar Sansar - Frontend (5173)" cmd /k "%ROOT_DIR%\ghar_sansar_frontend\start-frontend.bat"
ping 127.0.0.1 -n 4 >nul
if defined CF_EXE (
    echo [*] Starting Tunnel...
    start "Ghar Sansar - Cloudflare Tunnel" cmd /k "%ROOT_DIR%\start-official-tunnel.bat"
)
goto MENU_LOOP

:CLEAN_SHUTDOWN
echo.
set /p "CONFIRM=Are you sure you want to stop all services and guardian? [Y/N]: "
if /i "%CONFIRM%"=="Y" (
    call "%ROOT_DIR%\STOP_SERVERS.bat"
    exit /b 0
)
goto MENU_LOOP
