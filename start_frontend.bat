@echo off
title X-VOCA Frontend Web
color 0a
echo ========================================================
echo             X-VOCA FRONTEND LAUNCHER
echo ========================================================
echo.
echo Menjalankan Frontend Vite React...
echo Buka di browser: http://localhost:5173
echo ========================================================
echo.
cd /d "%~dp0web\frontend"
npm run dev
pause
