@echo off
setlocal enabledelayedexpansion

rem Clean and sanitize JAVA_HOME (remove quotes)
if defined JAVA_HOME (
    set "JAVA_HOME=%JAVA_HOME:"=%"
) else (
    set "JAVA_HOME=C:\Program Files\Java\jdk-21"
)
rem Remove trailing \bin if present
if "%JAVA_HOME:~-4%"=="\bin" set "JAVA_HOME=%JAVA_HOME:~0,-4%"
if "%JAVA_HOME:~-4%"=="/bin" set "JAVA_HOME=%JAVA_HOME:~0,-4%"

set "PATH=%JAVA_HOME%\bin;%PATH%"

rem Try cached maven in user .m2 folder
set "MVN_CMD="
if exist "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.16\56ba1f9f\bin\mvn.cmd" (
    set "MVN_CMD=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.16\56ba1f9f\bin\mvn.cmd"
) else (
    for /d %%i in ("%USERPROFILE%\.m2\wrapper\dists\apache-maven-*") do (
        for /d %%j in ("%%i\*") do (
            if exist "%%j\bin\mvn.cmd" set "MVN_CMD=%%j\bin\mvn.cmd"
        )
    )
)

if not defined MVN_CMD (
    if exist "%APPDATA%\Code\User\globalStorage\pleiades.java-extension-pack-jdk\maven\latest\bin\mvn.cmd" (
        set "MVN_CMD=%APPDATA%\Code\User\globalStorage\pleiades.java-extension-pack-jdk\maven\latest\bin\mvn.cmd"
    )
)

if not defined MVN_CMD (
    where mvn >nul 2>nul
    if %ERRORLEVEL% equ 0 set "MVN_CMD=mvn"
)

if defined MVN_CMD (
    call "%MVN_CMD%" %*
    exit /b %ERRORLEVEL%
)

echo [ERROR] Maven not found. Please install Maven or add it to PATH.
exit /b 1
