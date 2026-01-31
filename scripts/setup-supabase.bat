@echo off
REM Setup script for Supabase local development on Windows
REM Prerequisites: Docker Desktop must be installed and running

echo 🚀 Setting up Supabase local development environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    echo 📖 Install Docker Desktop: https://docs.docker.com/desktop
    exit /b 1
)

REM Start Supabase local development
echo 📦 Starting Supabase services...
npx supabase start

if %errorlevel% equ 0 (
    echo ✅ Supabase is running!
    echo.
    echo 🔗 Local URLs:
    echo    API URL: http://127.0.0.1:54321
    echo    Studio: http://127.0.0.1:54323
    echo    Inbucket (Email): http://127.0.0.1:54324
    echo.
    echo 📝 Next steps:
    echo    1. Update your .env.local file with the local Supabase credentials
    echo    2. Run 'npm run dev' to start the Next.js development server
    echo.
    echo 🛑 To stop Supabase: npx supabase stop
) else (
    echo ❌ Failed to start Supabase. Check the error messages above.
    exit /b 1
)