@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js not found. Please install Node.js 22 or newer from https://nodejs.org/
  pause
  exit /b 1
)
echo Starting Study Buddy at http://localhost:3000
echo Close this window to stop the server.
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:3000'"
node server.js
pause
