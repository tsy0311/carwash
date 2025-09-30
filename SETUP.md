# AUTOBATH Website Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Install Dependencies
```bash
# Navigate to the project directory
cd AutoBath

# Install all dependencies (frontend + backend)
npm run install-all
```

### Step 2: Configure Email Service

1. **Set up Gmail App Password:**
   - Go to your Google Account settings
   - Enable 2-Factor Authentication
   - Go to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Copy the generated password

2. **Update Email Configuration:**
   - Open `backend/config.js`
   - Replace `your_app_password_here` with your Gmail app password:
   ```javascript
   EMAIL: {
     PASS: 'your_actual_gmail_app_password'
   }
   ```

### Step 3: Start the Application
```bash
# Start both frontend and backend servers
npm run dev
```

This will start:
- ✅ Backend API server on `http://localhost:5000`
- ✅ Frontend React app on `http://localhost:3000`

### Step 4: Test the Application
1. Open `http://localhost:3000` in your browser
2. Try adding products to cart
3. Test the contact form
4. Complete a test order

## 🔧 Individual Server Commands

If you need to run servers separately:

```bash
# Backend only
npm run server

# Frontend only  
npm run client
```

## 📧 Email Configuration Details

### Gmail Setup
1. **Enable 2FA:** Your Gmail account must have 2-Factor Authentication enabled
2. **App Password:** Generate a specific app password for this application
3. **SMTP Settings:** The app uses Gmail's SMTP server (smtp.gmail.com:587)

### Email Templates
The system includes professional email templates for:
- Contact form submissions
- Customer order confirmations
- Admin notifications

## 🗄️ Database

- **SQLite Database:** Automatically created on first run
- **Sample Data:** Pre-loaded with 6 sample products
- **Location:** `backend/database.sqlite`

## 🌐 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category

### Contact
- `POST /api/contact/submit` - Submit contact form
- `GET /api/contact/messages` - Get all messages (admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders` - Get all orders (admin)

## 🎨 Customization

### Colors and Branding
Update CSS custom properties in `frontend/src/index.css`:
```css
:root {
  --primary: #000000;
  --secondary: #C19A6B;
  --brown: #C19A6B;
  /* ... other colors */
}
```

### Business Information
Update contact details in:
- `frontend/src/components/Footer.js`
- `frontend/src/pages/Contact.js`
- `backend/services/emailService.js`

## 🚀 Production Deployment

### Frontend (React)
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your hosting service
```

### Backend (Node.js)
```bash
cd backend
npm start
# Deploy to Heroku, DigitalOcean, AWS, etc.
```

### Environment Variables for Production
Create `.env` file in backend directory:
```env
NODE_ENV=production
PORT=5000
EMAIL_USER=autobath36@gmail.com
EMAIL_PASS=your_production_app_password
FRONTEND_URL=https://yourdomain.com
```

## 🔍 Troubleshooting

### Common Issues

1. **Email not sending:**
   - Check Gmail app password
   - Verify 2FA is enabled
   - Check firewall/antivirus blocking SMTP

2. **Database errors:**
   - Ensure write permissions in backend directory
   - Check if database.sqlite file exists

3. **CORS errors:**
   - Verify FRONTEND_URL in config matches your frontend URL
   - Check if both servers are running

4. **Port conflicts:**
   - Change PORT in backend/config.js if 5000 is in use
   - Update proxy in frontend/package.json if needed

### Logs and Debugging
- Backend logs appear in terminal where you ran `npm run dev`
- Frontend errors appear in browser console
- Check network tab for API call failures

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure email configuration is correct
4. Check that both servers are running

---

**Ready to launch your AUTOBATH website! 🚗✨**
