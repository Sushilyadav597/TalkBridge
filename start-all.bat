@echo off
echo ========================================================
echo Launching TalkBridge Full Stack Platform...
echo ========================================================

REM 1. Ensure MySQL daemon is started
echo [1/3] Checking MySQL Server 8.0...
start /min "TalkBridge-MySQL" "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --datadir="%LOCALAPPDATA%\TalkBridgeMySQL" --port=3306

REM 2. Start Backend
echo [2/3] Starting Spring Boot Backend (Port 8080)...
start "TalkBridge-Backend" cmd /c "%~dp0start-backend.bat"

REM 3. Start Frontend
echo [3/3] Starting React Frontend (Port 5173)...
start "TalkBridge-Frontend" cmd /c "%~dp0start-frontend.bat"

echo ========================================================
echo TalkBridge is launching!
echo Backend API:  http://localhost:8080
echo Frontend Web: http://localhost:5173
echo ========================================================
pause
