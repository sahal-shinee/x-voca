@echo off
title X-VOCA Backend Server
color 0b
echo ========================================================
echo       X-VOCA BACKEND LAUNCHER AND AUTO-FIX PORT
echo ========================================================
echo.

echo [1/3] Membersihkan proses lama di port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo Menutup proses PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] Mengaktifkan jalur ADB Reverse untuk HP Android via USB...
adb reverse tcp:3001 tcp:3001 >nul 2>&1
if %errorlevel% neq 0 (
    "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:3001 tcp:3001 >nul 2>&1
)
echo ADB Reverse siap! HP bisa akses via USB dan Wi-Fi

echo.
echo [3/3] Menjalankan Server Backend Express...
echo ========================================================
cd /d "%~dp0web\backend"
node server.js
pause
