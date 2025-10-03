# 🔧 Production Placeholders to Change for Render Deployment

## 📋 **CRITICAL CHANGES NEEDED**

### **1. HARDCODED EMAIL ADDRESSES** (Replace with your production email)

#### **Files to Update:**
- `backend/server.js:100`
- `backend/services/emailService.js:121`
- `backend/routes/contact.js:48`
- `frontend/src/pages/Contact.js:76`
- `frontend/src/components/Footer.js:62`

#### **Current Value:**
```
autobath36@gmail.com
```

#### **Replace With:**
```
autobath36@gmail.com```

---

### **2. API KEYS & SECRETS** (Replace with your production keys)

#### **Backend - Stripe Secret Key**
**File:** `backend/services/paymentService.js:5`
**Current:**
```javascript
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');
```
**Replace With:**
```javascript
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_live_YOUR_LIVE_STRIPE_SECRET_KEY');
```

#### **Frontend - Stripe Publishable Key**
**File:** `frontend/src/components/PaymentModal.js:12`
**Current:**
```javascript
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key');
```
**Replace With:**
```javascript
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_live_YOUR_LIVE_STRIPE_PUBLISHABLE_KEY');
```

---

### **3. LOCALHOST URLs** (Replace with your production domains)

#### **Frontend Proxy Setting**
**File:** `frontend/package.json:51`
**Current:**
```json
"proxy": "http://localhost:5000"
```
**Replace With:**
```json
"proxy": "https://YOUR_BACKEND_DOMAIN.onrender.com"
```

#### **Documentation URLs**
**File:** `README.md:98-99`
**Current:**
```
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`
```
**Replace With:**
```
- Backend server on `https://YOUR_BACKEND_DOMAIN.onrender.com`
- Frontend server on `https://YOUR_FRONTEND_DOMAIN.onrender.com`
```

---

### **4. EXAMPLE/TEST DATA** (Replace with production-appropriate data)

#### **Email Placeholder**
**File:** `frontend/src/pages/Booking.js:513`
**Current:**
```javascript
placeholder="you@example.com"
```
**Replace With:**
```javascript
placeholder="adisonteo33@gmail.com"
```

#### **Test Email**
**File:** `frontend/src/components/PaymentTest.js:29`
**Current:**
```javascript
email: 'john@example.com',
```
**Replace With:**
```javascript
email: 'test@yourdomain.com',
```

---

### **5. ENVIRONMENT VARIABLES** (Create these files)

#### **Backend Environment Variables** (`.env` file)
```bash
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://YOUR_FRONTEND_DOMAIN.onrender.com

# Database
DB_PATH=./database.sqlite

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=YOUR_PRODUCTION_EMAIL@gmail.com
EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD

# OAuth (if using)
EMAIL_OAUTH_ENABLED=false
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
OAUTH_REFRESH_TOKEN=

# Stripe Payment
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

#### **Frontend Environment Variables** (`.env` file)
```bash
REACT_APP_API_URL=https://YOUR_BACKEND_DOMAIN.onrender.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_STRIPE_PUBLISHABLE_KEY
```

---

### **6. RENDER-SPECIFIC CONFIGURATION**

#### **Create `render.yaml` file** (Root directory)
```yaml
services:
  - type: web
    name: autobath-backend
    env: node
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: FRONTEND_URL
        value: https://YOUR_FRONTEND_DOMAIN.onrender.com
      - key: EMAIL_USER
        value: YOUR_PRODUCTION_EMAIL@gmail.com
      - key: EMAIL_PASS
        value: YOUR_GMAIL_APP_PASSWORD
      - key: STRIPE_SECRET_KEY
        value: sk_live_YOUR_LIVE_STRIPE_SECRET_KEY
      - key: STRIPE_WEBHOOK_SECRET
        value: whsec_YOUR_WEBHOOK_SECRET

  - type: web
    name: autobath-frontend
    env: static
    plan: free
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/build
    envVars:
      - key: REACT_APP_API_URL
        value: https://YOUR_BACKEND_DOMAIN.onrender.com
      - key: REACT_APP_STRIPE_PUBLISHABLE_KEY
        value: pk_live_YOUR_LIVE_STRIPE_PUBLISHABLE_KEY
```

---

## 🎯 **YOUR TASK: Replace These Placeholders**

### **Replace the following placeholders with your actual values:**

1. **YOUR_PRODUCTION_EMAIL@gmail.com** → Your actual email address
2. **YOUR_BACKEND_DOMAIN** → Your Render backend service name
3. **YOUR_FRONTEND_DOMAIN** → Your Render frontend service name
4. **sk_live_YOUR_LIVE_STRIPE_SECRET_KEY** → Your live Stripe secret key
5. **pk_live_YOUR_LIVE_STRIPE_PUBLISHABLE_KEY** → Your live Stripe publishable key
6. **whsec_YOUR_WEBHOOK_SECRET** → Your Stripe webhook secret
7. **YOUR_GMAIL_APP_PASSWORD** → Your Gmail app password

---

## 📝 **QUICK REPLACEMENT GUIDE**

### **Step 1: Email Addresses**
Find and replace: `autobath36@gmail.com`
Replace with: `YOUR_PRODUCTION_EMAIL@gmail.com`

### **Step 2: Stripe Keys**
Find and replace: `sk_test_your_stripe_secret_key`
Replace with: `sk_live_YOUR_LIVE_STRIPE_SECRET_KEY`

Find and replace: `pk_test_your_stripe_publishable_key`
Replace with: `pk_live_YOUR_LIVE_STRIPE_PUBLISHABLE_KEY`

### **Step 3: Localhost URLs**
Find and replace: `http://localhost:5000`
Replace with: `https://YOUR_BACKEND_DOMAIN.onrender.com`

Find and replace: `http://localhost:3000`
Replace with: `https://YOUR_FRONTEND_DOMAIN.onrender.com`

### **Step 4: Example Data**
Find and replace: `you@example.com`
Replace with: `your-email@domain.com`

Find and replace: `john@example.com`
Replace with: `test@yourdomain.com`

---

## ✅ **FILES TO CREATE/UPDATE**

### **Files to Update (12 files):**
1. `backend/server.js`
2. `backend/services/emailService.js`
3. `backend/routes/contact.js`
4. `backend/services/paymentService.js`
5. `frontend/src/pages/Contact.js`
6. `frontend/src/components/Footer.js`
7. `frontend/src/components/PaymentModal.js`
8. `frontend/src/pages/Booking.js`
9. `frontend/src/components/PaymentTest.js`
10. `frontend/package.json`
11. `README.md`

### **Files to Create (3 files):**
1. `backend/.env`
2. `frontend/.env`
3. `render.yaml`

---

## 🚀 **NEXT STEPS**

1. **Edit this file** with your actual values
2. **Tell me which values you've updated**
3. **I'll help you apply the changes** to all files
4. **Deploy to Render** with the updated configuration

**Ready to start? Just replace the placeholders above with your actual values and let me know!**
