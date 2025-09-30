@echo off
REM AutoBath Setup Script for Windows
echo 🚗 Setting up AutoBath on this device...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    echo 💡 First clone the repository: git clone https://github.com/tsy0311/carwash.git
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Install dependencies
echo 📦 Installing dependencies...
call npm run install-all

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Create environment files if they don't exist
echo 🔧 Setting up environment files...

REM Backend .env
if not exist "backend\.env" (
    echo Creating backend\.env file...
    (
        echo # Server Configuration
        echo NODE_ENV=development
        echo PORT=5000
        echo FRONTEND_URL=http://localhost:3000
        echo.
        echo # Database
        echo DB_PATH=./database.sqlite
        echo.
        echo # Email Configuration ^(Optional - for testing^)
        echo EMAIL_HOST=smtp.gmail.com
        echo EMAIL_PORT=587
        echo EMAIL_USER=your-email@gmail.com
        echo EMAIL_PASS=your-app-password
        echo.
        echo # OAuth Configuration ^(Optional - for email features^)
        echo EMAIL_OAUTH_ENABLED=false
        echo OAUTH_CLIENT_ID=your-google-oauth-client-id
        echo OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
        echo OAUTH_REFRESH_TOKEN=your-google-oauth-refresh-token
    ) > backend\.env
    echo ✅ Created backend\.env
) else (
    echo ✅ backend\.env already exists
)

REM Frontend .env
if not exist "frontend\.env" (
    echo Creating frontend\.env file...
    echo REACT_APP_API_URL=http://localhost:5000 > frontend\.env
    echo ✅ Created frontend\.env
) else (
    echo ✅ frontend\.env already exists
)

REM Check if ports are available
echo 🔍 Checking if ports are available...

REM Check port 5000
netstat -an | findstr :5000 >nul
if errorlevel 1 (
    echo ✅ Port 5000 is available
) else (
    echo ⚠️  Port 5000 is already in use. You may need to stop other services.
)

REM Check port 3000
netstat -an | findstr :3000 >nul
if errorlevel 1 (
    echo ✅ Port 3000 is available
) else (
    echo ⚠️  Port 3000 is already in use. You may need to stop other services.
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Edit backend\.env and frontend\.env with your actual values
echo 2. Run: npm run dev
echo 3. Open http://localhost:3000 in your browser
echo.
echo 📚 For detailed instructions, see SETUP_OTHER_DEVICE.md
echo.
echo 🚀 Ready to start development!
pause
