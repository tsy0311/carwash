#!/bin/bash

# AutoBath Deployment Script
echo "🚗 Starting AutoBath deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm run build
cd ..

# Check if build was successful
if [ ! -d "frontend/build" ]; then
    echo "❌ Error: Frontend build failed"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "🚀 Ready for deployment!"

# Display next steps
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Set up deployment platforms:"
echo "   - Backend: Railway.app or Render.com"
echo "   - Frontend: Vercel.com or Netlify.com"
echo "3. Configure environment variables"
echo "4. Set up custom domains (optional)"
echo ""
echo "See DEPLOYMENT.md for detailed instructions."
