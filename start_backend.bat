@echo off
title X-VOCA Backend Server
color 0b
echo ========================================================
echo       X-VOCA BACKEND LAUNCHER AND AUTO-FIX PORT
echo ========================================================
echo.

echo [1/4] Memeriksa database MySQL lokal...
netstat -ano | findstr :3306 >nul 2>&1
if %errorlevel% neq 0 (
    echo Menyalakan MySQL XAMPP lokal...
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start "" /B "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
        timeout /t 2 /nobreak >nul
    )
)
echo MySQL aktif di port 3306!
echo.

echo [2/4] Membersihkan proses lama di port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo Menutup proses PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [3/4] Mengaktifkan jalur ADB Reverse untuk HP Android via USB...
adb reverse tcp:3001 tcp:3001 >nul 2>&1
if %errorlevel% neq 0 (
    "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" reverse tcp:3001 tcp:3001 >nul 2>&1
)
echo ADB Reverse siap! HP bisa akses via USB dan Wi-Fi

echo.
echo [4/4] Menjalankan Server Backend Express...
echo ========================================================
cd /d "%~dp0web\backend"
node server.js
pause
