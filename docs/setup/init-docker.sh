#!/bin/bash
# Database initialization script for Docker deployment
# This script sets up the database and runs migrations

set -e

echo "🐳 GoodDeeds Docker Initialization Script"
echo "=========================================="

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed"
    exit 1
fi

echo ""
echo "📦 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

echo ""
echo "🔄 Running Prisma migrations..."
docker-compose exec -T app npx prisma migrate deploy

echo ""
echo "✅ Database initialization complete!"
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "🌐 Application ready at: http://localhost:3000"
echo ""
echo "📝 Useful commands:"
echo "  - View logs: docker-compose logs -f app"
echo "  - Stop services: docker-compose stop"
echo "  - Start services: docker-compose start"
echo "  - Remove everything: docker-compose down -v"
echo "  - Database shell: docker-compose exec postgres psql -U gooddeeds_user -d gooddeeds"
