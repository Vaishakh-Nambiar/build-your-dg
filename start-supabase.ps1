#!/usr/bin/env pwsh

Write-Host "Starting Supabase local development environment..." -ForegroundColor Green
Write-Host ""
Write-Host "Prerequisites:" -ForegroundColor Yellow
Write-Host "- Docker Desktop must be installed and running"
Write-Host "- If Docker Desktop is not running, please start it first"
Write-Host ""

# Check if Docker is running
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "✅ Docker is running. Starting Supabase..." -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Docker Desktop is not running or not installed." -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://docs.docker.com/desktop" -ForegroundColor Yellow
    Write-Host "Make sure Docker Desktop is running before continuing." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Start Supabase
try {
    npx supabase start
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Supabase started successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your local Supabase is now running at:" -ForegroundColor Cyan
        Write-Host "- API: http://127.0.0.1:54321" -ForegroundColor White
        Write-Host "- Studio: http://127.0.0.1:54323" -ForegroundColor White
        Write-Host "- Inbucket (Email): http://127.0.0.1:54324" -ForegroundColor White
        Write-Host ""
        Write-Host "The .env.local file has been configured with the correct local development values." -ForegroundColor Green
        Write-Host "You can now start your Next.js development server with: npm run dev" -ForegroundColor Cyan
        Write-Host ""
    } else {
        throw "Supabase start failed"
    }
} catch {
    Write-Host ""
    Write-Host "❌ Failed to start Supabase. Please check the error messages above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "1. Make sure Docker Desktop is running"
    Write-Host "2. Try restarting Docker Desktop"
    Write-Host "3. Run: npx supabase stop and then try again"
    Write-Host ""
}

Read-Host "Press Enter to exit"