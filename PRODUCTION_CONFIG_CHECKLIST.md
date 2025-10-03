# 🚀 Production Configuration Checklist

## 📋 Files That Need Configuration Changes for Production

### 🔑 **CRITICAL - API Keys & Secrets**

#### **Backend Environment Variables** (`.env` file)
```bash
# Database
DB_PATH=./database.sqlite

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://autobath.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=autobath36@gmail.com
EMAIL_PASS=incorrectpassword

# OAuth (if using)
EMAIL_OAUTH_ENABLED=true
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret
OAUTH_REFRESH_TOKEN=your-refresh-token

# Stripe Payment
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### **Frontend Environment Variables** (`.env` file)
```bash
REACT_APP_API_URL=https://autobath.dev.test
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
```

---

### 📁 **Files to Update**

#### **1. Backend Configuration Files**

##### `backend/config.js` ✅ (Uses environment variables - GOOD)
- **Line 4**: `PORT: process.env.PORT || 5000` ✅
- **Line 5**: `NODE_ENV: process.env.NODE_ENV || 'development'` ✅
- **Line 9**: `HOST: process.env.EMAIL_HOST || 'smtp.gmail.com'` ✅
- **Line 11**: `USER: process.env.EMAIL_USER || ''` ✅
- **Line 12**: `PASS: process.env.EMAIL_PASS || ''` ✅
- **Line 25**: `FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'` ✅

##### `backend/server.js` ✅ (Uses environment variables - GOOD)
- **Line 25**: `const PORT = process.env.PORT || 5000` ✅
- **Line 43**: `origin: process.env.FRONTEND_URL || 'http://localhost:3000'` ✅
- **Line 100**: `console.log('📧 Email service configured for: autobath36@gmail.com')` ⚠️ **HARDCODED EMAIL**

##### `backend/services/paymentService.js` ⚠️ **NEEDS UPDATE**
- **Line 5**: `const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key')` ⚠️ **TEST KEY FALLBACK**

##### `backend/routes/payments.js` ✅ (Uses environment variables - GOOD)
- **Line 276**: `process.env.STRIPE_WEBHOOK_SECRET` ✅

##### `backend/services/emailService.js` ⚠️ **NEEDS UPDATE**
- **Line 121**: `autobath36@gmail.com` ⚠️ **HARDCODED EMAIL**

##### `backend/routes/contact.js` ⚠️ **NEEDS UPDATE**
- **Line 48**: `to: 'autobath36@gmail.com'` ⚠️ **HARDCODED EMAIL**

#### **2. Frontend Configuration Files**

##### `frontend/src/services/api.js` ✅ (Uses environment variables - GOOD)
- **Line 5**: `baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'` ✅

##### `frontend/src/components/PaymentModal.js` ⚠️ **NEEDS UPDATE**
- **Line 12**: `process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key'` ⚠️ **TEST KEY FALLBACK**

##### `frontend/package.json` ⚠️ **NEEDS UPDATE**
- **Line 51**: `"proxy": "http://localhost:5000"` ⚠️ **LOCALHOST PROXY**

#### **3. UI/Display Files** ⚠️ **NEEDS UPDATE**

##### `frontend/src/pages/Contact.js` ⚠️ **NEEDS UPDATE**
- **Line 76**: `autobath36@gmail.com` ⚠️ **HARDCODED EMAIL**

##### `frontend/src/components/Footer.js` ⚠️ **NEEDS UPDATE**
- **Line 62**: `autobath36@gmail.com` ⚠️ **HARDCODED EMAIL**

##### `frontend/src/pages/Booking.js` ⚠️ **NEEDS UPDATE**
- **Line 513**: `placeholder="you@example.com"` ⚠️ **EXAMPLE EMAIL**

##### `frontend/src/components/PaymentTest.js` ⚠️ **NEEDS UPDATE**
- **Line 29**: `email: 'john@example.com'` ⚠️ **TEST EMAIL**

#### **4. Deployment Configuration Files**

##### `vercel.json` ✅ (Uses environment variables - GOOD)
- **Line 19**: `"REACT_APP_API_URL": "@react_app_api_url"` ✅

##### `railway.json` ✅ (Uses environment variables - GOOD)
- **Line 8**: `"startCommand": "cd backend && npm start"` ✅

##### `Dockerfile` ✅ (Production ready - GOOD)
- All configurations are production-ready

#### **5. Documentation Files** ⚠️ **NEEDS UPDATE**

##### `README.md` ⚠️ **NEEDS UPDATE**
- **Line 98**: `http://localhost:5000` ⚠️ **LOCALHOST URL**
- **Line 99**: `http://localhost:3000` ⚠️ **LOCALHOST URL**
- **Line 142**: `EMAIL_USER=autobath36@gmail.com` ⚠️ **HARDCODED EMAIL**
- **Line 204**: `Email: autobath36@gmail.com` ⚠️ **HARDCODED EMAIL**

##### `PAYMENT_SETUP.md` ⚠️ **NEEDS UPDATE**
- **Line 38**: `EMAIL_USER=autobath36@gmail.com` ⚠️ **HARDCODED EMAIL**
- **Line 42**: `STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here` ⚠️ **TEST KEY**
- **Line 56**: `REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here` ⚠️ **TEST KEY**
- **Line 268**: `Email: autobath36@gmail.com` ⚠️ **HARDCODED EMAIL**

---

### 🚨 **CRITICAL CHANGES NEEDED**

#### **1. Hardcoded Email Addresses** (5 files)
- `backend/server.js:100`
- `backend/services/emailService.js:121`
- `backend/routes/contact.js:48`
- `frontend/src/pages/Contact.js:76`
- `frontend/src/components/Footer.js:62`

#### **2. Test API Keys** (2 files)
- `backend/services/paymentService.js:5` - Stripe secret key
- `frontend/src/components/PaymentModal.js:12` - Stripe publishable key

#### **3. Localhost URLs** (2 files)
- `frontend/package.json:51` - Proxy setting
- `README.md:98-99` - Documentation URLs

#### **4. Test/Example Data** (2 files)
- `frontend/src/pages/Booking.js:513` - Email placeholder
- `frontend/src/components/PaymentTest.js:29` - Test email

---

### 🔧 **Quick Fix Commands**

#### **Replace Hardcoded Email** (Replace `autobath36@gmail.com` with your production email)
```bash
# Find all occurrences
grep -r "autobath36@gmail.com" . --exclude-dir=node_modules

# Replace in all files
find . -name "*.js" -o -name "*.md" | xargs sed -i 's/autobath36@gmail.com/your-production-email@gmail.com/g'
```

#### **Replace Test Stripe Keys**
```bash
# Backend
sed -i 's/sk_test_your_stripe_secret_key/sk_live_your_live_stripe_secret_key/g' backend/services/paymentService.js

# Frontend
sed -i 's/pk_test_your_stripe_publishable_key/pk_live_your_live_stripe_publishable_key/g' frontend/src/components/PaymentModal.js
```

#### **Replace Localhost URLs**
```bash
# Frontend proxy
sed -i 's|"proxy": "http://localhost:5000"|"proxy": "https://your-backend-domain.com"|g' frontend/package.json
```

---

### ✅ **Production Environment Variables Checklist**

#### **Backend (.env)**
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000` (or your chosen port)
- [ ] `FRONTEND_URL=https://your-domain.com`
- [ ] `EMAIL_USER=your-production-email@gmail.com`
- [ ] `EMAIL_PASS=your-app-password`
- [ ] `STRIPE_SECRET_KEY=sk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET=whsec_...`

#### **Frontend (.env)**
- [ ] `REACT_APP_API_URL=https://your-backend-domain.com`
- [ ] `REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...`

#### **GitHub Secrets**
- [ ] `RAILWAY_TOKEN`
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`

---

### 🎯 **Priority Order**
1. **HIGH**: Update hardcoded email addresses
2. **HIGH**: Replace test Stripe keys with live keys
3. **MEDIUM**: Update localhost URLs in configuration
4. **LOW**: Update documentation and example data

**Total Files to Update: 12 files**
**Critical Security Issues: 7 files**
