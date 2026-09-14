@echo off
title Culinary Connect CRM System - SE2030 Demo
echo =======================================================
echo   CULINARY CONNECT - CATERING CRM & INQUIRY BOARD
echo   SE2030 Software Engineering - Progress Evaluation
echo =======================================================
echo.

set MAVEN_CMD="C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2025.2.6.1\plugins\maven\lib\maven3\bin\mvn.cmd"

if exist %MAVEN_CMD% (
    echo [INFO] Compiling and starting application with Maven...
    %MAVEN_CMD% compile exec:java
) else (
    echo [INFO] Compiling directly with Java compiler...
    if not exist "bin" mkdir bin
    javac -d bin src/main/java/com/catering/crm/model/*.java src/main/java/com/catering/crm/dao/*.java src/main/java/com/catering/crm/service/*.java src/main/java/com/catering/crm/controller/*.java src/main/java/com/catering/crm/*.java
    echo [INFO] Starting CRM Web Server...
    java -cp bin com.catering.crm.Main
)

pause
