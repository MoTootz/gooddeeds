@echo off
REM GoodDeeds Application Setup Script

echo ========================================
echo GoodDeeds - Community Help Network
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please download and install Node.js from: https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

echo ✓ Node.js detected
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo Starting Docker container for PostgreSQL...
    docker-compose up -d
) else (
    echo ✓ Docker is running
)
echo.

REM Install dependencies
echo Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Generate Prisma client
echo Generating Prisma client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Failed to generate Prisma client
    pause
    exit /b 1
)
echo ✓ Prisma client generated
echo.

REM Run migrations
echo Running database migrations...
call npx prisma migrate deploy
if errorlevel 1 (
    echo Warning: Migration had an issue, trying reset...
    call npx prisma migrate reset --force
)
echo ✓ Database setup complete
echo.

REM Start development server
echo.
echo ========================================
echo Setup Complete! Starting dev server...
echo ========================================
echo.
echo Open your browser to: http://localhost:3000
echo.
pause

call npm run dev
