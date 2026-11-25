@echo off
echo ========================================================
echo Starting TalkBridge Spring Boot Backend...
echo ========================================================
cd /d "%~dp0backend"

echo Checking MySQL connectivity on port 3306...
powershell -NoProfile -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('127.0.0.1', 3306); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] MySQL is running! Starting with MySQL profile...
    call mvnw.cmd spring-boot:run
) else (
    echo [INFO] MySQL not detected on port 3306.
    echo [INFO] Automatically starting with In-Memory H2 Database profile...
    call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2
)
pause
