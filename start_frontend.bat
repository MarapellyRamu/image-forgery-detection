@echo off
REM ============================================================
REM  start_frontend.bat — Start the Next.js frontend dev server
REM  Run this from the PROJECT ROOT directory
REM ============================================================

echo.
echo  ^[Forgery.ai^] Starting Next.js Frontend...
echo  App will be at: http://localhost:3000
echo.

IF NOT EXIST "frontend\node_modules" (
    echo  ^[INFO^] node_modules not found. Running npm install...
    cd frontend
    npm install
    cd ..
)

IF NOT EXIST "frontend\.env.local" (
    echo  ^[INFO^] Copying .env.local.example to frontend\.env.local ...
    copy "frontend\.env.local.example" "frontend\.env.local"
)

cd frontend
npm run dev
cd ..
