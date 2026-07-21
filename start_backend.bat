@echo off
REM ============================================================
REM  start_backend.bat — Start the FastAPI backend server
REM  MUST be run from the PROJECT ROOT directory
REM ============================================================

echo.
echo  [Forgery.ai] Starting FastAPI Backend...
echo  API Docs:   http://localhost:8000/api/docs
echo  Health:     http://localhost:8000/api/health
echo.

REM Auto-create venv with python3 if it doesn't exist
IF NOT EXIST "backend\venv\Scripts\activate.bat" (
    echo  [SETUP] Virtual environment not found. Creating with Python 3...
    python3 -m venv backend\venv
    IF ERRORLEVEL 1 (
        echo  [ERROR] python3 not found. Please install Python 3.10+ and add to PATH.
        pause
        exit /b 1
    )
    echo  [SETUP] Installing dependencies (this may take a few minutes)...
    backend\venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel -q
    backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt -q
    echo  [SETUP] Done!
    echo.
)

REM Copy .env if missing
IF NOT EXIST "backend\.env" (
    IF EXIST "backend\.env.example" (
        echo  [INFO] Copying backend\.env.example to backend\.env ...
        copy "backend\.env.example" "backend\.env" >nul
    )
)

echo  [INFO] Starting Uvicorn (run from project root as backend.main:app)...
echo  Press Ctrl+C to stop.
echo.

REM IMPORTANT: Run from project root so relative imports work
backend\venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
