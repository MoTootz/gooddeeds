@echo off
REM Database initialization script for Docker deployment (Windows)
REM This script sets up the database and runs migrations

setlocal enabledelayedexpansion

echo.
echo GoodDeeds Docker Initialization Script (Windows)
echo ==============================================
echo.

REM Check if docker-compose is available
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: docker-compose is not installed or not in PATH
    exit /b 1
)

echo Building Docker images...
call docker-compose build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to build Docker images
    exit /b 1
)

echo.
echo Starting services...
call docker-compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to start services
    exit /b 1
)

echo.
echo Waiting for PostgreSQL to be ready (10 seconds)...
timeout /t 10 /nobreak

echo.
echo Running Prisma migrations...
call docker-compose exec -T app npx prisma migrate deploy
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to run migrations
    exit /b 1
)

echo.
echo Database initialization complete!
echo.
echo Service Status:
call docker-compose ps

echo.
echo Application ready at: http://localhost:3000
echo.
echo Useful commands:
echo   - View logs: docker-compose logs -f app
echo   - Stop services: docker-compose stop
echo   - Start services: docker-compose start
echo   - Remove everything: docker-compose down -v
echo   - Database shell: docker-compose exec postgres psql -U gooddeeds_user -d gooddeeds
echo.
pause
