# AUTOBATH Website

A modern, full-stack website for AUTOBATH car detailing services built with React frontend and Node.js backend.

## 🚗 Features

- **Modern React Frontend** with responsive design
- **Node.js/Express Backend** with RESTful API
- **Email Service** for contact forms and order confirmations
- **Shopping Cart** with persistent storage
- **Product Management** with categories and inventory
- **Order Management** with email confirmations
- **SQLite Database** for data persistence
- **Professional Email Templates** with HTML styling

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- React Toastify for notifications
- React Icons
- CSS3 with custom properties

### Backend
- Node.js
- Express.js
- SQLite3 database
- Nodemailer for email service
- Helmet for security
- CORS for cross-origin requests
- Rate limiting

## 📁 Project Structure

```
AutoBath/
├── frontend/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   └── styles/         # CSS files
│   └── package.json
├── backend/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── database/           # Database setup
│   ├── config.js           # Configuration
│   └── server.js           # Main server file
└── package.json            # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git
- Gmail account for email service (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tsy0311/carwash.git
   cd carwash
   ```

2. **Quick Setup (Automated):**
   ```bash
   # Windows
   setup.bat
   
   # Mac/Linux
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Manual Setup:**
   ```bash
   # Install all dependencies
   npm run install-all
   
   # Create environment files
   # See SETUP_OTHER_DEVICE.md for detailed instructions
   ```

4. **Start the development servers:**
   ```bash
   npm run dev
   ```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### 🖥️ Running on Other Devices

For detailed instructions on setting up the project on any device, see:
- **[SETUP_OTHER_DEVICE.md](SETUP_OTHER_DEVICE.md)** - Complete setup guide
- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - Quick deployment guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Full deployment documentation

## 📧 Email Setup

### Gmail Configuration
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Update `backend/config.js` with your app password:
   ```javascript
   EMAIL: {
     PASS: 'your_gmail_app_password_here'
   }
   ```

## 🗄️ Database

The application uses SQLite3 database with the following tables:
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `contact_messages` - Contact form submissions

Database is automatically initialized with sample products on first run.

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=autobath36@gmail.com
EMAIL_PASS=your_app_password_here
DB_PATH=./database.sqlite
FRONTEND_URL=http://localhost:3000
```

## 📱 Features Overview

### Frontend Features
- **Responsive Design** - Works on all devices
- **Shopping Cart** - Add/remove products, quantity management
- **Contact Form** - Send inquiries with email notifications
- **Product Catalog** - Browse products by category
- **Order Checkout** - Complete order process with email confirmation

### Backend Features
- **RESTful API** - Clean API endpoints
- **Email Service** - Professional HTML email templates
- **Database Management** - SQLite with automatic migrations
- **Security** - Helmet, CORS, rate limiting
- **Error Handling** - Comprehensive error management

## 🎨 Customization

### Styling
- CSS custom properties in `frontend/src/index.css`
- Component-specific styles in individual CSS files
- Responsive design with mobile-first approach

### Email Templates
- Professional HTML templates in `backend/services/emailService.js`
- Customizable templates for different email types
- Branded styling with AUTOBATH colors

## 🚀 Deployment

### Frontend (React)
```bash
cd frontend
npm run build
```
Deploy the `build` folder to your hosting service.

### Backend (Node.js)
```bash
cd backend
npm start
```
Deploy to services like Heroku, DigitalOcean, or AWS.

### Production Considerations
- Set `NODE_ENV=production`
- Use environment variables for sensitive data
- Set up proper database backups
- Configure HTTPS
- Set up monitoring and logging

## 📞 Contact Information

**AUTOBATH**
- Address: 13 jalan rakan 12/2 Cheras, 43200 Kajang, Selangor
- Phone: (+60) 163399533
- Email: autobath36@gmail.com

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for AUTOBATH Car Detailing Services**
