@echo off
title Ghar Sansar - Stop Services
color 0C

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

echo ================================================================
echo           GHAR SANSAR - STOPPING ALL SERVICES AND GUARDIAN
echo ================================================================
echo.

:: 1. Signal Guardian to stop
echo [*] Signaling Guardian watchdog to stop...
type nul > "%ROOT_DIR%\.guardian_stop"

:: 2. Terminate Guardian background process using PID file or search
echo [*] Stopping Guardian background processes...
if exist "%ROOT_DIR%\.guardian.pid" (
    set /p GPID=<"%ROOT_DIR%\.guardian.pid"
    if defined GPID taskkill /F /PID %GPID% >nul 2>&1
    del /f /q "%ROOT_DIR%\.guardian.pid" >nul 2>&1
)
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -Filter \"Name='powershell.exe'\" | Where-Object { $_.CommandLine -like '*guardian.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; exit 0" >nul 2>&1

:: 3. Terminate Ghar Sansar Cloudflare Tunnel specifically
echo [*] Stopping Ghar Sansar Cloudflare Tunnel...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -Filter \"Name='cloudflared.exe'\" | Where-Object { $_.CommandLine -like '*eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMi*' -or $_.CommandLine -like '*1ae0eab3-de49-415c-bd88-dd0c936fc589*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; exit 0" >nul 2>&1

:: 4. Terminate Backend and Frontend node processes
echo [*] Stopping Node.js processes on ports 5001, 5173, 5174, 5175...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5001,5173,5174,5175 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }; exit 0" >nul 2>&1

:: 5. Terminate server CMD windows
echo [*] Closing Ghar Sansar CMD windows...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -Filter \"Name='cmd.exe'\" | Where-Object { $_.CommandLine -like '*start-server.bat*' -or $_.CommandLine -like '*start-frontend.bat*' -or $_.CommandLine -like '*start-official-tunnel.bat*' -or ($_.CommandLine -like '*START_SERVERS.bat*' -and $_.ProcessId -ne $PID) } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; exit 0" >nul 2>&1

:: 6. Clean up stop signal file
del /f /q "%ROOT_DIR%\.guardian_stop" >nul 2>&1

echo.
echo ================================================================
echo [✓] All Ghar Sansar services and the Guardian watchdog have been
echo     successfully stopped.
echo.
echo     To start everything again anytime, simply run START_SERVERS.bat
echo ================================================================
echo.
pause
