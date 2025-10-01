#!/bin/bash

# BlueFleet Database Setup Helper Script

set -e

echo "🚢 BlueFleet Database Setup"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
fi

echo "Choose your database setup option:"
echo ""
echo "1) Neon (Cloud PostgreSQL - Recommended, Free)"
echo "2) Docker (Local PostgreSQL)"
echo "3) I already have a database URL"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📝 Setting up with Neon..."
        echo ""
        echo "Please follow these steps:"
        echo "1. Go to https://neon.tech"
        echo "2. Sign up (free, no credit card)"
        echo "3. Create a new project named 'bluefleet-dev'"
        echo "4. Copy the connection string"
        echo ""
        read -p "Paste your Neon connection string here: " db_url
        
        if [ -z "$db_url" ]; then
            echo "❌ No connection string provided"
            exit 1
        fi
        
        # Update .env file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
        else
            # Linux
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
        fi
        
        echo "✅ Database URL updated in .env"
        ;;
        
    2)
        echo ""
        echo "🐳 Setting up Docker PostgreSQL..."
        echo ""
        
        # Check if Docker is running
        if ! docker info > /dev/null 2>&1; then
            echo "❌ Docker is not running!"
            echo ""
            echo "Please start Docker Desktop and try again."
            echo "Or choose option 1 (Neon) which doesn't require Docker."
            exit 1
        fi
        
        # Check if container already exists
        if docker ps -a | grep -q bluefleet-db; then
            echo "⚠️  Container 'bluefleet-db' already exists"
            read -p "Remove and recreate? (y/n): " recreate
            if [ "$recreate" = "y" ]; then
                docker rm -f bluefleet-db
                echo "✅ Old container removed"
            else
                echo "Using existing container..."
            fi
        fi
        
        # Start PostgreSQL container
        if ! docker ps | grep -q bluefleet-db; then
            echo "Starting PostgreSQL container..."
            docker run --name bluefleet-db \
                -e POSTGRES_PASSWORD=bluefleet \
                -e POSTGRES_DB=bluefleet \
                -e POSTGRES_USER=bluefleet \
                -p 5432:5432 \
                -d postgres:15-alpine
            
            echo "⏳ Waiting for PostgreSQL to start..."
            sleep 5
        fi
        
        # Update .env file
        db_url="postgresql://bluefleet:bluefleet@localhost:5432/bluefleet"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
        else
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
        fi
        
        echo "✅ PostgreSQL container started"
        echo "✅ Database URL updated in .env"
        ;;
        
    3)
        echo ""
        read -p "Paste your database connection string: " db_url
        
        if [ -z "$db_url" ]; then
            echo "❌ No connection string provided"
            exit 1
        fi
        
        # Update .env file
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
        else
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
        fi
        
        echo "✅ Database URL updated in .env"
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🔄 Pushing database schema..."
pnpm db:push

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: pnpm seed (optional - adds demo data)"
echo "2. Run: pnpm dev"
echo "3. Visit: http://localhost:3000"
echo ""

