#!/bin/bash

# AutoBath Setup Script for Any Device
echo "🚗 Setting up AutoBath on this device..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "💡 First clone the repository: git clone https://github.com/tsy0311/carwash.git"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version is $NODE_VERSION. Recommended version is 18 or higher."
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Create environment files if they don't exist
echo "🔧 Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file..."
    cat > backend/.env << EOF
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DB_PATH=./database.sqlite

# Email Configuration (Optional - for testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# OAuth Configuration (Optional - for email features)
EMAIL_OAUTH_ENABLED=false
OAUTH_CLIENT_ID=your-google-oauth-client-id
OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
OAUTH_REFRESH_TOKEN=your-google-oauth-refresh-token
EOF
    echo "✅ Created backend/.env"
else
    echo "✅ backend/.env already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env file..."
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000
EOF
    echo "✅ Created frontend/.env"
else
    echo "✅ frontend/.env already exists"
fi

# Test if ports are available
echo "🔍 Checking if ports are available..."

# Check port 5000
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 5000 is already in use. You may need to stop other services."
else
    echo "✅ Port 5000 is available"
fi

# Check port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is already in use. You may need to stop other services."
else
    echo "✅ Port 3000 is available"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env and frontend/.env with your actual values"
echo "2. Run: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For detailed instructions, see SETUP_OTHER_DEVICE.md"
echo ""
echo "🚀 Ready to start development!"
