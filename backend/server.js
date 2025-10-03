// Load environment variables from .env file if it exists (for local development)
if (require('fs').existsSync('.env')) {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const path = require('path');

// Import routes
const contactRoutes = require('./routes/contact');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const bookingRoutes = require('./routes/bookings');
const serviceRoutes = require('./routes/services');
const servicePackageRoutes = require('./routes/servicePackages');
const customerRoutes = require('./routes/customers');
const reviewRoutes = require('./routes/reviews');
const productBundleRoutes = require('./routes/productBundles');
const paymentRoutes = require('./routes/payments');

// Import database
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for accurate IP detection (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Rate limiting (temporarily disabled for testing)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/contact', contactRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-packages', servicePackageRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/product-bundles', productBundleRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AUTOBATH API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
console.log('🚀 Starting AUTOBATH Backend...');
console.log('📋 Environment variables check:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- PORT:', process.env.PORT || 'not set');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');
console.log('- EMAIL_USER:', process.env.EMAIL_USER || 'not set');

initDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully');
    app.listen(PORT, () => {
      console.log(`🚗 AUTOBATH Backend running on port ${PORT}`);
      console.log(`📧 Email service configured for: autobath36@gmail.com`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'not set'}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });
