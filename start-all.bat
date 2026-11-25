@echo off
echo ========================================================
echo Launching TalkBridge Full Stack Platform...
echo ========================================================

REM 1. Start Backend (will use MySQL if running, or auto fallback to H2)
echo [1/2] Starting Spring Boot Backend (Port 8080)...
start "TalkBridge-Backend" cmd /c "%~dp0start-backend.bat"

REM 2. Start Frontend
echo [2/2] Starting React Frontend (Port 5173)...
start "TalkBridge-Frontend" cmd /c "%~dp0start-frontend.bat"

echo ========================================================
echo TalkBridge is launching!
echo Backend API:  http://localhost:8080
echo Frontend Web: http://localhost:5173
echo ========================================================
pause
