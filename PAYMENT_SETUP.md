# Payment Integration Setup Guide

This guide will help you set up the payment integration for the AUTOBATH website, including TNG eWallet and card payments.

## 🚀 Quick Start

### 1. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install stripe uuid
```

#### Frontend Dependencies
```bash
cd frontend
npm install @stripe/react-stripe-js @stripe/stripe-js qrcode
```

### 2. Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_PATH=./database.sqlite

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=autobath36@gmail.com
EMAIL_PASS=your_gmail_app_password_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# TNG eWallet Configuration (if applicable)
TNG_API_KEY=your_tng_api_key_here
TNG_MERCHANT_ID=your_tng_merchant_id_here
TNG_SECRET_KEY=your_tng_secret_key_here
```

#### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:

```env
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

## 💳 Payment Methods Supported

### 1. Credit/Debit Cards (Stripe)
- **Supported Cards**: Visa, Mastercard, American Express
- **Security**: PCI DSS compliant through Stripe
- **Processing**: Real-time payment processing
- **Fees**: Stripe's standard processing fees

### 2. Touch 'n Go eWallet
- **Integration**: QR code-based payment
- **Process**: Customer scans QR code with TNG app
- **Verification**: Automatic payment verification
- **Timeout**: 15-minute payment window

### 3. Bank Transfer
- **Method**: Direct bank transfer
- **Verification**: Manual verification within 24 hours
- **Reference**: Unique reference number for tracking
- **Expiry**: 24-hour payment window

### 4. Cash on Delivery
- **Process**: Pay when service is completed
- **Area**: Kajang, Cheras, and surrounding areas
- **Timing**: Service completion required before payment

## 🔧 Setup Instructions

### Stripe Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for a free account
   - Complete business verification

2. **Get API Keys**
   - Go to Developers > API Keys
   - Copy your Publishable Key (starts with `pk_test_`)
   - Copy your Secret Key (starts with `sk_test_`)

3. **Configure Webhooks** (Optional)
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/payments/webhook/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### TNG eWallet Setup

1. **Register as Merchant**
   - Contact TNG Digital for merchant registration
   - Complete business verification process
   - Get API credentials

2. **Integration**
   - The current implementation includes mock TNG integration
   - Replace mock functions with actual TNG API calls
   - Update `paymentService.js` with real TNG endpoints

## 📱 Frontend Components

### PaymentModal
- Main payment selection interface
- Supports all payment methods
- Responsive design for mobile and desktop

### StripePaymentForm
- Secure card input using Stripe Elements
- Real-time validation
- PCI DSS compliant

### TNGPaymentForm
- QR code generation and display
- Payment status polling
- Mobile-optimized interface

### BankTransferForm
- Bank account details display
- Reference number generation
- Copy-to-clipboard functionality

### CashPaymentForm
- Service scheduling information
- Payment instructions
- Terms and conditions

## 🔒 Security Features

### Data Protection
- No sensitive payment data stored locally
- Stripe handles all card data securely
- PCI DSS compliance through Stripe

### Validation
- Client-side form validation
- Server-side payment validation
- Email and phone number verification

### Error Handling
- Comprehensive error messages
- Payment failure recovery
- Timeout handling for TNG payments

## 🧪 Testing

### Test Cards (Stripe)
```
# Successful Payment
4242 4242 4242 4242

# Declined Payment
4000 0000 0000 0002

# Requires Authentication
4000 0025 0000 3155
```

### Test Scenarios
1. **Successful Payment**: Use test card 4242 4242 4242 4242
2. **Failed Payment**: Use test card 4000 0000 0000 0002
3. **TNG Payment**: Mock implementation with simulated success
4. **Bank Transfer**: Generate reference number and test flow
5. **Cash Payment**: Test order creation and scheduling

## 🚀 Deployment

### Production Setup

1. **Update Environment Variables**
   - Use production Stripe keys
   - Configure production database
   - Set up production email service

2. **SSL Certificate**
   - Required for Stripe integration
   - HTTPS mandatory for payment processing

3. **Webhook Configuration**
   - Set up production webhook endpoints
   - Configure proper error handling

### Monitoring

1. **Payment Logs**
   - Monitor payment success/failure rates
   - Track payment method usage
   - Set up alerts for failed payments

2. **Error Tracking**
   - Implement error logging
   - Monitor API response times
   - Track user payment flow

## 📊 Payment Analytics

### Available Metrics
- Payment method distribution
- Success/failure rates
- Average transaction value
- Payment completion time

### Reporting
- Daily payment summaries
- Monthly revenue reports
- Failed payment analysis
- Customer payment preferences

## 🛠️ Customization

### Adding New Payment Methods
1. Update `paymentService.js` with new method
2. Create new payment form component
3. Add method to `PaymentModal.js`
4. Update backend routes

### Styling
- All components use Tailwind CSS
- Consistent with AUTOBATH design system
- Mobile-responsive design
- Customizable color scheme

## 🆘 Troubleshooting

### Common Issues

1. **Stripe Keys Not Working**
   - Verify keys are correct
   - Check environment variable loading
   - Ensure HTTPS in production

2. **TNG Payment Not Working**
   - Verify API credentials
   - Check network connectivity
   - Review payment status polling

3. **Bank Transfer Issues**
   - Verify reference number generation
   - Check bank account details
   - Ensure proper validation

### Support
- Check browser console for errors
- Review server logs for API issues
- Test with different payment methods
- Verify environment configuration

## 📞 Support

For technical support or questions about payment integration:
- Email: autobath36@gmail.com
- Phone: (+60) 163399533
- Address: 13 jalan rakan 12/2 Cheras, 43200 Kajang, Selangor

---

**Note**: This payment integration is designed for the Malaysian market and supports local payment methods. Ensure compliance with local financial regulations and obtain necessary licenses for payment processing.
