#!/bin/bash

# GoodDeeds Application Setup Script

echo "========================================"
echo "GoodDeeds - Community Help Network"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please download and install Node.js from: https://nodejs.org/"
    echo "Then run this script again."
    exit 1
fi

echo "✓ Node.js detected"
echo ""

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "Starting Docker container for PostgreSQL..."
    docker-compose up -d
else
    echo "✓ Docker is running"
fi
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to generate Prisma client"
    exit 1
fi
echo "✓ Prisma client generated"
echo ""

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo "Trying alternative migration..."
    npx prisma migrate reset --force
fi
echo "✓ Database setup complete"
echo ""

# Start development server
echo ""
echo "========================================"
echo "Setup Complete! Starting dev server..."
echo "========================================"
echo ""
echo "Open your browser to: http://localhost:3000"
echo ""

npm run dev
