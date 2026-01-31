#!/bin/bash

# Setup script for Supabase local development
# Prerequisites: Docker Desktop must be installed and running

echo "🚀 Setting up Supabase local development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    echo "📖 Install Docker Desktop: https://docs.docker.com/desktop"
    exit 1
fi

# Start Supabase local development
echo "📦 Starting Supabase services..."
npx supabase start

if [ $? -eq 0 ]; then
    echo "✅ Supabase is running!"
    echo ""
    echo "🔗 Local URLs:"
    echo "   API URL: http://127.0.0.1:54321"
    echo "   Studio: http://127.0.0.1:54323"
    echo "   Inbucket (Email): http://127.0.0.1:54324"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update your .env.local file with the local Supabase credentials"
    echo "   2. Run 'npm run dev' to start the Next.js development server"
    echo ""
    echo "🛑 To stop Supabase: npx supabase stop"
else
    echo "❌ Failed to start Supabase. Check the error messages above."
    exit 1
fi