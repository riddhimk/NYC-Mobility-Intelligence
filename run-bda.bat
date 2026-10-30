@echo off
setlocal EnableDelayedExpansion
title NYC Mobility Intelligence - One-Click Auto Launcher
color 0b

echo ==============================================================================
echo            NYC MOBILITY INTELLIGENCE - ONE-CLICK AUTO LAUNCHER
echo ==============================================================================
echo.

set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
set "FRONTEND_DIR=%PROJECT_DIR%\frontend"
set "PYTHON_EXE=python"
if exist "%PROJECT_DIR%\venv\Scripts\python.exe" (
    set "PYTHON_EXE=%PROJECT_DIR%\venv\Scripts\python.exe"
)
set "DOCKER_EXE=C:\Program Files\Docker\Docker\Docker Desktop.exe"

:: -----------------------------------------------------------------------------
:: Step 1: Ensure Docker Desktop App is Running Automatically
:: -----------------------------------------------------------------------------
echo [1/4] Checking Docker status...
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo       Docker is not running. Launching Docker Desktop app automatically...
    if exist "%DOCKER_EXE%" (
        start "" "%DOCKER_EXE%"
    ) else if exist "%LOCALAPPDATA%\Programs\Docker\Docker Desktop.exe" (
        start "" "%LOCALAPPDATA%\Programs\Docker\Docker Desktop.exe"
    ) else (
        start "" "Docker Desktop"
    )
    echo       Waiting for Docker engine to initialize...
    call :WAIT_FOR_DOCKER
) else (
    echo       Docker Desktop is active and ready.
)

:: -----------------------------------------------------------------------------
:: Step 2: Start 4-Node Spark Cluster (Master + 3 Workers)
:: -----------------------------------------------------------------------------
echo.
echo [2/4] Starting 4-Node Spark Cluster in Docker...
cd /d "%PROJECT_DIR%"
docker compose -f docker-compose.spark.yml up -d
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start Spark containers. Make sure Docker is running.
) else (
    echo       Spark Master and 3 Worker nodes are up and running!
)

:: -----------------------------------------------------------------------------
:: Step 3: Free any stale ports & Launch Backend API
:: -----------------------------------------------------------------------------
echo.
echo [3/4] Launching FastAPI Backend on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 "') do taskkill /F /PID %%a >nul 2>&1
start "BDA Backend (Port 8000)" /min cmd /c "cd /d "%PROJECT_DIR%" && "%PYTHON_EXE%" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"
echo       Backend API launching in background (http://localhost:8000)

:: -----------------------------------------------------------------------------
:: Step 4: Free any stale ports & Launch Frontend
:: -----------------------------------------------------------------------------
echo.
echo [4/4] Launching Vite Frontend on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 "') do taskkill /F /PID %%a >nul 2>&1
start "BDA Frontend (Port 5173)" /min cmd /c "cd /d "%FRONTEND_DIR%" && npm run dev"
echo       Frontend launching in background (http://localhost:5173)

:: -----------------------------------------------------------------------------
:: Step 5: Directly Open Frontend and Apache Cluster (8080 & 4040)
:: -----------------------------------------------------------------------------
echo.
echo Opening Frontend and Apache Cluster UIs in Browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173
start http://localhost:8080

:: Background delayed opener for Spark Active Application UI (port 4040) once driver initializes
start "" /min cmd /c "timeout /t 6 /nobreak >nul && start http://localhost:4040"

:: -----------------------------------------------------------------------------
:: Step 6: Auto-Run Spark Cluster Demo on Bootup (No User Input Required)
:: -----------------------------------------------------------------------------
echo.
echo ==============================================================================
echo   AUTO-RUNNING SPARK DISTRIBUTED COMPUTATION DEMO
echo   Cluster: Master (7077) + 3 Workers (worker-node-1, worker-node-2, worker-node-3)
echo   Live DAG, Stages and Shuffle metrics: http://localhost:4040
echo ==============================================================================
echo.

docker exec -it -e PYTHONPATH=/opt/spark/python:/opt/spark/python/lib/py4j-0.10.9.9-src.zip spark-master python3 /opt/spark/scripts/spark_cluster_demo.py spark://spark-master:7077 /opt/spark/data/curated/trips

echo.
echo ==============================================================================
echo   DEMO EXECUTION FINISHED!
echo     - Frontend Dashboard:    http://localhost:5173
echo     - Spark Master UI:       http://localhost:8080
echo     - Active Job UI / DAG:   http://localhost:4040
echo.
echo   All services will remain running in background for your presentation.
echo   Press any key to shutdown all services, or close this window to keep them.
echo ==============================================================================
pause >nul

echo Stopping Backend and Frontend background processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000 "') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 "') do taskkill /F /PID %%a >nul 2>&1

echo Stopping Spark Docker Containers...
cd /d "%PROJECT_DIR%"
docker compose -f docker-compose.spark.yml stop >nul 2>&1
echo All services stopped cleanly. Goodbye!
timeout /t 2 /nobreak >nul
exit /b 0

:: -----------------------------------------------------------------------------
:: Helper: Wait for Docker Engine
:: -----------------------------------------------------------------------------
:WAIT_FOR_DOCKER
set DOCKER_RETRY=0
:DOCKER_LOOP
timeout /t 3 /nobreak >nul
docker info >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo       Docker engine is online and ready!
    goto :EOF
)
set /a DOCKER_RETRY+=1
echo       Waiting for Docker daemon to respond... (!DOCKER_RETRY!/30)
if !DOCKER_RETRY! GEQ 30 (
    echo       [WARN] Timed out waiting for Docker. Proceeding...
    goto :EOF
)
goto :DOCKER_LOOP

