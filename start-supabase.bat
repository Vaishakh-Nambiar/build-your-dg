@echo off
echo Starting Supabase local development environment...
echo.
echo Prerequisites:
echo - Docker Desktop must be installed and running
echo - If Docker Desktop is not running, please start it first
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Desktop is not running or not installed.
    echo Please install Docker Desktop from: https://docs.docker.com/desktop
    echo Make sure Docker Desktop is running before continuing.
    pause
    exit /b 1
)

echo Docker is running. Starting Supabase...
echo.

REM Start Supabase
npx supabase start

if %errorlevel% equ 0 (
    echo.
    echo ✅ Supabase started successfully!
    echo.
    echo Your local Supabase is now running at:
    echo - API: http://127.0.0.1:54321
    echo - Studio: http://127.0.0.1:54323
    echo - Inbucket (Email): http://127.0.0.1:54324
    echo.
    echo The .env.local file has been configured with the correct local development values.
    echo You can now start your Next.js development server with: npm run dev
    echo.
) else (
    echo.
    echo ❌ Failed to start Supabase. Please check the error messages above.
    echo.
    echo Common solutions:
    echo 1. Make sure Docker Desktop is running
    echo 2. Try restarting Docker Desktop
    echo 3. Run: npx supabase stop and then try again
    echo.
)

pause