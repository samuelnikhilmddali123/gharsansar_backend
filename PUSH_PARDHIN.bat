@echo off
title Push to Pardhin Branch
cd /d "%~dp0"
echo ===================================================
echo   Pushing to Ghar Sansar Repository
echo   Target remote: origin
echo   Target branch: pardhin
echo ===================================================
echo.
git push origin HEAD:pardhin
echo.
if %errorlevel% equ 0 (
    echo [SUCCESS] Pushed to branch pardhin successfully!
) else (
    echo [ERROR] Push failed. If prompted, please complete GitHub sign-in.
)
echo.
pause
