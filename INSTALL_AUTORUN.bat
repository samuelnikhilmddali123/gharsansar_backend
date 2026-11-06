@echo off
title Install Ghar Sansar Auto-Run on Boot
color 0A

set "ROOT_DIR=%~dp0"
if "%ROOT_DIR:~-1%"=="\" set "ROOT_DIR=%ROOT_DIR:~0,-1%"

echo ================================================================
echo     INSTALLING GHAR SANSAR AUTO-RUN ^& SLEEP-BLOCKER
echo ================================================================
echo.

:: 1. Disable Windows Sleep & Hibernate
echo [*] Disabling Windows Sleep, Standby, and Hibernation permanently...
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
powercfg /change hibernate-timeout-ac 0
powercfg /change hibernate-timeout-dc 0
powercfg /change disk-timeout-ac 0
powercfg /change disk-timeout-dc 0
powercfg /change monitor-timeout-dc 0

:: 2. Set Registry Run Key for Automatic Startup on Boot/Logon
echo [*] Configuring Registry Auto-Run on logon...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "GharSansarGuardian" /t REG_SZ /d "wscript.exe \"%ROOT_DIR%\guardian_launcher.vbs\"" /f >nul

:: 3. Create Windows Startup Folder Shortcut
echo [*] Creating Windows Startup Folder shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut(\"$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\GharSansar_Guardian.lnk\"); $s.TargetPath = 'wscript.exe'; $s.Arguments = '\"%ROOT_DIR%\guardian_launcher.vbs\"'; $s.WorkingDirectory = '%ROOT_DIR%'; $s.Description = 'Ghar Sansar 24/7 Always-On Guardian Watchdog'; $s.Save()"

:: 4. Start Guardian immediately
echo [*] Launching Guardian Watchdog now...
start "" wscript.exe "%ROOT_DIR%\guardian_launcher.vbs"

echo.
echo ================================================================
echo [✓] Installation complete!
echo.
echo   - Windows Sleep Mode has been permanently DISABLED.
echo   - Automatic startup on boot/logon is CONFIGURED.
echo   - Auto-healing Guardian Watchdog is ACTIVE.
echo   - If START_SERVERS.bat is closed, Guardian will restart it.
echo ================================================================
echo.
pause
