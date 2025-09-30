# 🖥️ Running AutoBath on Another Device

This guide will help you clone and run the AutoBath project on any device (Windows, Mac, Linux).

## 📋 Prerequisites

Before starting, make sure you have these installed on the new device:

### Required Software:
1. **Git** - [Download here](https://git-scm.com/downloads)
2. **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
3. **Code Editor** (optional) - VS Code, Sublime Text, etc.

### Verify Installation:
```bash
git --version
node --version
npm --version
```

## 🚀 Quick Setup (5 minutes)

### Step 1: Clone the Repository
```bash
# Clone the repository
git clone https://github.com/tsy0311/carwash.git

# Navigate to the project directory
cd carwash
```

### Step 2: Install Dependencies
```bash
# Install all dependencies (root, backend, and frontend)
npm run install-all
```

### Step 3: Set Up Environment Variables

#### Backend Environment (.env file)
Create a file named `.env` in the `backend` directory:

```bash
# Navigate to backend directory
cd backend

# Create .env file (Windows)
echo. > .env

# Or create .env file (Mac/Linux)
touch .env
```

Add these variables to `backend/.env`:
```env
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
```

#### Frontend Environment
Create a file named `.env` in the `frontend` directory:

```bash
# Navigate to frontend directory
cd ../frontend

# Create .env file (Windows)
echo. > .env

# Or create .env file (Mac/Linux)
touch .env
```

Add this variable to `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### Step 4: Run the Application
```bash
# Go back to project root
cd ..

# Start both backend and frontend
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

## 🔧 Alternative Setup Methods

### Method 1: Manual Setup
```bash
# 1. Clone repository
git clone https://github.com/tsy0311/carwash.git
cd carwash

# 2. Install root dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install

# 4. Install frontend dependencies
cd ../frontend
npm install

# 5. Go back to root
cd ..

# 6. Start development
npm run dev
```

### Method 2: Using the Deploy Script
```bash
# Clone repository
git clone https://github.com/tsy0311/carwash.git
cd carwash

# Run deployment script (builds everything)
./deploy.sh

# Start development
npm run dev
```

### Method 3: Individual Services
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Command not found" errors
```bash
# Make sure Node.js and Git are installed
node --version
git --version

# If not installed, download from:
# Node.js: https://nodejs.org/
# Git: https://git-scm.com/downloads
```

#### 2. "Port already in use" error
```bash
# Kill processes using ports 3000 and 5000
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

#### 3. "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall everything
npm run install-all
```

#### 4. Database issues
```bash
# The database will be created automatically
# If you have issues, delete and let it recreate
rm backend/database.sqlite
```

#### 5. CORS errors
- Make sure `FRONTEND_URL=http://localhost:3000` is set in `backend/.env`
- Make sure `REACT_APP_API_URL=http://localhost:5000` is set in `frontend/.env`

## 📱 Mobile/Tablet Access

To access the app from other devices on the same network:

### 1. Find Your Computer's IP Address
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

### 2. Update Environment Variables
In `frontend/.env`:
```env
REACT_APP_API_URL=http://YOUR_IP_ADDRESS:5000
```

In `backend/.env`:
```env
FRONTEND_URL=http://YOUR_IP_ADDRESS:3000
```

### 3. Start with Network Access
```bash
# Start frontend with network access
cd frontend
npm start

# In another terminal, start backend
cd backend
npm run dev
```

### 4. Access from Mobile
- Open browser on mobile/tablet
- Go to `http://YOUR_IP_ADDRESS:3000`

## 🔄 Updating the Project

When you want to get the latest changes:

```bash
# Pull latest changes from GitHub
git pull origin main

# Reinstall dependencies (if package.json changed)
npm run install-all

# Start the application
npm run dev
```

## 📁 Project Structure

```
carwash/
├── backend/                 # Node.js API server
│   ├── .env               # Backend environment variables
│   ├── server.js          # Main server file
│   ├── routes/            # API routes
│   └── database/          # Database files
├── frontend/              # React application
│   ├── .env               # Frontend environment variables
│   ├── src/               # React source code
│   └── public/            # Static files
├── .github/               # GitHub Actions workflows
├── package.json           # Root package.json
└── README.md             # Project documentation
```

## 🎯 Quick Commands Reference

```bash
# Clone repository
git clone https://github.com/tsy0311/carwash.git

# Install all dependencies
npm run install-all

# Start development (both frontend and backend)
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Build for production
npm run build

# Check if everything is working
curl http://localhost:5000/api/health
```

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** in the terminal for error messages
2. **Verify environment variables** are set correctly
3. **Make sure ports 3000 and 5000** are available
4. **Check Node.js version** (should be 18 or higher)
5. **Try clearing node_modules** and reinstalling

## ✅ Success Checklist

- [ ] Git is installed and working
- [ ] Node.js is installed (version 18+)
- [ ] Repository cloned successfully
- [ ] Dependencies installed (`npm run install-all`)
- [ ] Environment variables set up
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3000
- [ ] Can access the website in browser

Once all items are checked, you're ready to develop! 🚗✨
