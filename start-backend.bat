@echo off
echo ========================================================
echo Starting TalkBridge Spring Boot Backend...
echo ========================================================
cd /d "%~dp0backend"
call mvnw.cmd spring-boot:run
pause
