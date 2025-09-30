# 🚀 Quick Deployment Setup

## Option 1: Railway + Vercel (Recommended)

### Backend on Railway (5 minutes)
1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `carwash` repository
4. Railway will auto-detect it's a Node.js app
5. Add these environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   OAUTH_CLIENT_ID=your-google-oauth-client-id
   OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
   OAUTH_REFRESH_TOKEN=your-google-oauth-refresh-token
   ```
6. Railway will give you a URL like `https://your-app.railway.app`

### Frontend on Vercel (3 minutes)
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click "New Project" → Import your `carwash` repository
3. Set these settings:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-app.railway.app
   ```
5. Deploy! Vercel will give you a URL like `https://your-app.vercel.app`

### Update Backend CORS
In Railway dashboard, add this environment variable:
```
FRONTEND_URL=https://your-app.vercel.app
```

## Option 2: Render (Full Stack)

### Backend on Render
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment**: Node
5. Add environment variables (same as Railway)
6. Deploy!

### Frontend on Render
1. Click "New" → "Static Site"
2. Connect your GitHub repo
3. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
4. Add environment variable:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```
5. Deploy!

## 🔑 Required Environment Variables

### Backend (Railway/Render)
```env
NODE_ENV=production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
OAUTH_CLIENT_ID=your-google-oauth-client-id
OAUTH_CLIENT_SECRET=your-google-oauth-client-secret
OAUTH_REFRESH_TOKEN=your-google-oauth-refresh-token
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (Vercel/Render)
```env
REACT_APP_API_URL=https://your-backend-domain.com
```

## 🎯 GitHub Actions (Automatic Deployment)

The repository includes GitHub Actions workflows that will automatically deploy when you push to `main` branch.

### Required GitHub Secrets
Go to your GitHub repo → Settings → Secrets and variables → Actions

#### For Railway:
- `RAILWAY_TOKEN` - Get from Railway dashboard → Account → Tokens

#### For Vercel:
- `VERCEL_TOKEN` - Get from Vercel dashboard → Settings → Tokens
- `VERCEL_ORG_ID` - Get from Vercel dashboard → Settings → General
- `VERCEL_PROJECT_ID` - Get from your project settings

## ✅ Testing Your Deployment

1. **Backend Health Check**: Visit `https://your-backend-domain.com/api/health`
2. **Frontend**: Visit your frontend URL
3. **Test Features**: Try booking a service, contact form, etc.

## 🆘 Troubleshooting

### Common Issues:
- **CORS Error**: Make sure `FRONTEND_URL` is set correctly in backend
- **API Not Found**: Check `REACT_APP_API_URL` in frontend
- **Email Not Working**: Verify OAuth credentials are correct
- **Build Fails**: Check Node.js version (use 18.x)

### Getting Help:
- Check deployment logs in your hosting platform
- Review GitHub Actions logs
- Test locally with production environment variables

## 🎉 You're Done!

Your AutoBath car wash booking system is now live on the internet! 

- **Frontend**: `https://your-frontend-domain.com`
- **Backend API**: `https://your-backend-domain.com/api/health`

Share your website with customers and start taking bookings! 🚗✨
