@echo off
title Push to Pardhin Branch
cd /d "%~dp0"
echo ===================================================
echo   Pushing to https://github.com/Pardhin/Gharsansar.git
echo   Target branch: pardhin (master branch untouched)
echo ===================================================
echo.
git push --force origin pardhin
echo.
if %errorlevel% equ 0 (
    echo [SUCCESS] Pushed to branch pardhin successfully!
) else (
    echo [ERROR] Push failed. If prompted, please complete GitHub sign-in.
)
echo.
pause
