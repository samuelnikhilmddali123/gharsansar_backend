@echo off
title GitHub Authentication - Ghar Sansar
color 0B

cd /d "%~dp0"

echo ================================================================
echo        GHAR SANSAR - GITHUB BROWSER AUTHENTICATION
echo ================================================================
echo.
echo  Opening Chrome to authorize your GitHub account:
echo  Target: https://github.com/samuelnikhilmddali123/gharsansar_backend.git
echo.
echo  1. Chrome will open the GitHub authorization page.
echo  2. Click "Authorize GitCredentialManager" (or sign in if prompted).
echo  3. Once authorized, return to this window and your code will push.
echo ================================================================
echo.

:: Trigger Git Credential Manager web browser authentication flow
git credential-manager github login --browser

echo.
if errorlevel 1 (
    color 0C
    echo [!] Authentication was not completed or was cancelled.
    echo     You can re-run this script anytime to try again.
) else (
    color 0A
    echo [✓] GitHub authentication successful!
    echo.
    echo [*] Pushing latest commits to GitHub (main branch)...
    git push -u origin main
    if not errorlevel 1 (
        echo.
        echo [✓] Code successfully pushed to:
        echo     https://github.com/samuelnikhilmddali123/gharsansar_backend.git
    )
)

echo.
echo ================================================================
echo Press any key to exit...
pause >nul
