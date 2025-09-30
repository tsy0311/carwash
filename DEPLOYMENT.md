# Deployment Guide

This guide covers deploying the AutoBath application using GitHub Actions and various hosting platforms.

## 🚀 Quick Deployment Options

### Option 1: Railway (Backend) + Vercel (Frontend) - Recommended

#### Backend Deployment (Railway)
1. Go to [Railway.app](https://railway.app) and sign up with GitHub
2. Create a new project and connect your GitHub repository
3. Add environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   PORT=5000
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_OAUTH_ENABLED=true
   OAUTH_CLIENT_ID=your-google-oauth-client-id
   OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
   OAUTH_REFRESH_TOKEN=your-google-oauth-refresh-token
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```
4. Railway will automatically deploy from your main branch

#### Frontend Deployment (Vercel)
1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub
2. Import your GitHub repository
3. Set build settings:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-domain.railway.app
   ```
5. Deploy!

### Option 2: Render (Full Stack)

#### Backend on Render
1. Go to [Render.com](https://render.com) and sign up
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: Node
5. Add environment variables (same as Railway)

#### Frontend on Render
1. Create a new Static Site
2. Connect your GitHub repository
3. Configure:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`
4. Add environment variables:
   ```
   REACT_APP_API_URL=https://your-backend-domain.onrender.com
   ```

### Option 3: Docker Deployment

#### Using Docker Compose
1. Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - EMAIL_HOST=smtp.gmail.com
      - EMAIL_PORT=587
      - EMAIL_USER=${EMAIL_USER}
      - EMAIL_PASS=${EMAIL_PASS}
      - OAUTH_CLIENT_ID=${OAUTH_CLIENT_ID}
      - OAUTH_CLIENT_SECRET=${OAUTH_CLIENT_SECRET}
      - OAUTH_REFRESH_TOKEN=${OAUTH_REFRESH_TOKEN}
    volumes:
      - ./database:/app/database
```

2. Run: `docker-compose up -d`

## 🔧 GitHub Actions Setup

### Required Secrets
Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

#### For Railway Backend:
- `RAILWAY_TOKEN`: Get from Railway dashboard > Account > Tokens

#### For Vercel Frontend:
- `VERCEL_TOKEN`: Get from Vercel dashboard > Settings > Tokens
- `VERCEL_ORG_ID`: Get from Vercel dashboard > Settings > General
- `VERCEL_PROJECT_ID`: Get from your project settings

### Workflow Files
The repository includes:
- `.github/workflows/deploy-backend.yml` - Deploys backend to Railway
- `.github/workflows/deploy-frontend.yml` - Deploys frontend to Vercel

## 🌐 Custom Domain Setup

### Backend (Railway)
1. Go to your Railway project dashboard
2. Click on your service
3. Go to Settings > Domains
4. Add your custom domain (e.g., `api.autobath.com`)

### Frontend (Vercel)
1. Go to your Vercel project dashboard
2. Go to Settings > Domains
3. Add your custom domain (e.g., `autobath.com`)
4. Configure DNS records as instructed

## 🔒 Environment Variables

### Backend Required Variables:
```env
NODE_ENV=production
PORT=5000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_OAUTH_ENABLED=true
OAUTH_CLIENT_ID=your-google-oauth-client-id
OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
OAUTH_REFRESH_TOKEN=your-google-oauth-refresh-token
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Required Variables:
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

## 📊 Monitoring & Logs

### Railway
- View logs in Railway dashboard
- Monitor performance and errors
- Set up alerts for downtime

### Vercel
- View build logs and deployment status
- Monitor performance with Vercel Analytics
- Set up error tracking

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify no trailing spaces

3. **CORS Issues**
   - Update `FRONTEND_URL` in backend environment
   - Check CORS configuration in `server.js`

4. **Database Issues**
   - Ensure database file is writable
   - Check database initialization

### Getting Help:
- Check deployment logs in your hosting platform
- Review GitHub Actions logs
- Test locally with production environment variables

## 🔄 Continuous Deployment

The GitHub Actions workflows will automatically deploy when you push to the `main` branch. You can also trigger manual deployments from the GitHub Actions tab.

## 📈 Performance Optimization

1. **Frontend**:
   - Enable Vercel's edge caching
   - Optimize images and assets
   - Use CDN for static files

2. **Backend**:
   - Enable Railway's auto-scaling
   - Monitor database performance
   - Implement caching strategies

## 🔐 Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **HTTPS**: Always use HTTPS in production
3. **CORS**: Configure CORS properly for your domain
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **Database**: Use production-grade database for production
