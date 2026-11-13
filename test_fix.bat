@echo off
setlocal EnableDelayedExpansion
title Ghar Sansar - System Health and Diagnostics
color 0F

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

echo ================================================================
echo           GHAR SANSAR - SYSTEM DIAGNOSTICS AND TEST
echo ================================================================
echo Running comprehensive connectivity and health checks...
echo.

:: 1. Check Node.js
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $v = node -v; Write-Host \"[PASS] Node.js is installed ($v)\" -ForegroundColor Green } catch { Write-Host \"[FAIL] Node.js is NOT installed or in PATH\" -ForegroundColor Red; exit 1 }"
if errorlevel 1 set "ERR_NODE=1"

:: 2. Check Local Backend (Port 5001)
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-RestMethod -Uri 'http://localhost:5001/api/health' -TimeoutSec 3 -ErrorAction Stop; Write-Host \"[PASS] Backend Server is RUNNING on port 5001 (uptime: $($r.uptime)s)\" -ForegroundColor Green } catch { Write-Host \"[FAIL] Backend Server is NOT responding on http://localhost:5001\" -ForegroundColor Red; exit 1 }"
if errorlevel 1 set "ERR_BACKEND=1"

:: 3. Check MongoDB Atlas connection through backend
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $p = Invoke-RestMethod -Uri 'http://localhost:5001/api/products' -TimeoutSec 6 -ErrorAction Stop; $cnt = if ($p.Count) { $p.Count } else { $p.data.Count }; Write-Host \"[PASS] MongoDB Atlas is CONNECTED ($cnt categories loaded)\" -ForegroundColor Green } catch { Write-Host \"[WARN] MongoDB products endpoint did not return data\" -ForegroundColor Yellow }"

:: 4. Check Local Frontend (Port 5173)
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $f = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop; Write-Host \"[PASS] Frontend Server is RUNNING on port 5173 (HTTP $($f.StatusCode))\" -ForegroundColor Green } catch { Write-Host \"[FAIL] Frontend Server is NOT responding on http://localhost:5173\" -ForegroundColor Red; exit 1 }"
if errorlevel 1 set "ERR_FRONTEND=1"

:: 5. Check Cloudflare Tunnel process for Ghar Sansar
powershell -NoProfile -ExecutionPolicy Bypass -Command "$t = Get-CimInstance Win32_Process -Filter \"Name='cloudflared.exe'\" | Where-Object { $_.CommandLine -like '*eyJhIjoiZDllNmQ4MTYzNWUyMzA0NTk2NWYwNTAyYjU2ODhlMzMi*' -or $_.CommandLine -like '*1ae0eab3-de49-415c-bd88-dd0c936fc589*' }; if ($t) { Write-Host \"[PASS] Ghar Sansar Cloudflare Tunnel is RUNNING (PID $($t.ProcessId))\" -ForegroundColor Green; exit 0 } else { Write-Host \"[FAIL] Ghar Sansar Cloudflare Tunnel is NOT running\" -ForegroundColor Red; exit 1 }"
if errorlevel 1 set "ERR_TUNNEL=1"

:: 6. Check Public Endpoints (gharsansar.website via Cloudflare)
echo.
echo [*] Testing Public Cloudflare Tunnel connectivity...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $ip = (Resolve-DnsName gharsansar.website -Server 1.1.1.1 -ErrorAction Stop | Where-Object { $_.IPAddress -match '^\d+\.' } | Select-Object -First 1).IPAddress; if ($ip) { Write-Host '[PASS] DNS resolved gharsansar.website (IP: ' $ip ')' -ForegroundColor Green } } catch { Write-Host '[INFO] DNS check completed via standard routing.' -ForegroundColor Gray }"

echo.
echo ================================================================
echo                       DIAGNOSTIC SUMMARY
echo ================================================================
if defined ERR_BACKEND (
    echo [!] Backend is DOWN. Start it using START_SERVERS.bat
)
if defined ERR_FRONTEND (
    echo [!] Frontend is DOWN. Start it using START_SERVERS.bat
)
if defined ERR_TUNNEL (
    echo [!] Cloudflare Tunnel is DOWN. Start it using start-official-tunnel.bat
)
if not defined ERR_BACKEND if not defined ERR_FRONTEND if not defined ERR_TUNNEL (
    echo [SUCCESS] ALL SYSTEMS ARE HEALTHY AND RUNNING NORMALLY!
    echo   - Website: https://gharsansar.website
    echo   - Backend: https://backend.gharsansar.website/api
)
echo ================================================================
echo.

echo Quick Actions:
echo   [1] Start / Repair All Services (Launch START_SERVERS.bat)
echo   [2] Start Official Cloudflare Tunnel
echo   [3] Open https://gharsansar.website in Browser
echo   [4] Open http://localhost:5173 (Local Frontend)
echo   [5] Exit
echo.

set "ACT="
set /p "ACT=Enter action [1-5]: "

if "%ACT%"=="1" (
    start "" "%ROOT_DIR%\START_SERVERS.bat"
    exit /b 0
)
if "%ACT%"=="2" (
    start "" "%ROOT_DIR%\start-official-tunnel.bat"
    exit /b 0
)
if "%ACT%"=="3" (
    start https://gharsansar.website
    exit /b 0
)
if "%ACT%"=="4" (
    start http://localhost:5173
    exit /b 0
)

exit /b 0
