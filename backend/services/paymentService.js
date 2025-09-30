const Stripe = require('stripe');
const crypto = require('crypto');

// Initialize Stripe with secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key');

class PaymentService {
  constructor() {
    this.supportedMethods = {
      CARD: 'card',
      TNG: 'tng',
      BANK_TRANSFER: 'bank_transfer',
      CASH: 'cash'
    };
  }

  /**
   * Create a payment intent for Stripe
   * @param {Object} paymentData - Payment information
   * @returns {Object} Payment intent response
   */
  async createPaymentIntent(paymentData) {
    try {
      const { amount, currency = 'myr', metadata = {} } = paymentData;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          orderId: metadata.orderId || '',
          customerId: metadata.customerId || '',
          ...metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Confirm a payment intent
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @returns {Object} Confirmation response
   */
  async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
        charges: paymentIntent.charges?.data || []
      };
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create TNG eWallet payment request
   * @param {Object} paymentData - Payment information
   * @returns {Object} TNG payment response
   */
  async createTNGPayment(paymentData) {
    try {
      const { amount, orderId, customerInfo } = paymentData;
      
      // TNG eWallet integration would go here
      // This is a mock implementation - you would need to integrate with actual TNG API
      const tngPaymentId = this.generatePaymentId();
      
      // Simulate TNG payment creation
      const tngPayment = {
        paymentId: tngPaymentId,
        amount: amount,
        currency: 'MYR',
        status: 'pending',
        orderId: orderId,
        customerInfo: customerInfo,
        redirectUrl: `${process.env.FRONTEND_URL}/payment/tng/callback?paymentId=${tngPaymentId}`,
        qrCode: this.generateQRCode(tngPaymentId, amount),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      };

      return {
        success: true,
        payment: tngPayment
      };
    } catch (error) {
      console.error('TNG payment creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify TNG payment status
   * @param {string} paymentId - TNG payment ID
   * @returns {Object} Payment status
   */
  async verifyTNGPayment(paymentId) {
    try {
      // This would integrate with actual TNG API
      // For now, we'll simulate the verification
      const mockStatus = Math.random() > 0.1 ? 'completed' : 'pending';
      
      return {
        success: true,
        status: mockStatus,
        paymentId: paymentId,
        verifiedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('TNG payment verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create bank transfer payment
   * @param {Object} paymentData - Payment information
   * @returns {Object} Bank transfer details
   */
  async createBankTransferPayment(paymentData) {
    try {
      const { amount, orderId, customerInfo } = paymentData;
      const referenceNumber = this.generateReferenceNumber();
      
      const bankTransfer = {
        referenceNumber: referenceNumber,
        amount: amount,
        currency: 'MYR',
        bankName: 'Maybank',
        accountNumber: '1234567890',
        accountName: 'AUTOBATH DETAILING & ACCESSORIES',
        orderId: orderId,
        customerInfo: customerInfo,
        instructions: `Please transfer RM ${amount.toFixed(2)} to the account above and include reference: ${referenceNumber}`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      return {
        success: true,
        bankTransfer: bankTransfer
      };
    } catch (error) {
      console.error('Bank transfer creation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process refund
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @param {number} amount - Refund amount (optional, defaults to full refund)
   * @returns {Object} Refund response
   */
  async processRefund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason
      };
    } catch (error) {
      console.error('Refund processing failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get payment methods
   * @returns {Array} Available payment methods
   */
  getPaymentMethods() {
    return [
      {
        id: this.supportedMethods.CARD,
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, American Express',
        icon: 'credit-card',
        enabled: true
      },
      {
        id: this.supportedMethods.TNG,
        name: 'Touch \'n Go eWallet',
        description: 'Pay with TNG eWallet',
        icon: 'mobile',
        enabled: true
      },
      {
        id: this.supportedMethods.BANK_TRANSFER,
        name: 'Bank Transfer',
        description: 'Direct bank transfer',
        icon: 'university',
        enabled: true
      },
      {
        id: this.supportedMethods.CASH,
        name: 'Cash on Delivery',
        description: 'Pay when service is completed',
        icon: 'money-bill',
        enabled: true
      }
    ];
  }

  /**
   * Generate unique payment ID
   * @returns {string} Payment ID
   */
  generatePaymentId() {
    return 'TNG_' + crypto.randomBytes(16).toString('hex').toUpperCase();
  }

  /**
   * Generate reference number
   * @returns {string} Reference number
   */
  generateReferenceNumber() {
    return 'AUTOBATH_' + Date.now().toString().slice(-8);
  }

  /**
   * Generate QR code data for TNG
   * @param {string} paymentId - Payment ID
   * @param {number} amount - Payment amount
   * @returns {string} QR code data
   */
  generateQRCode(paymentId, amount) {
    // This would generate actual QR code data for TNG
    return `tng://payment?pid=${paymentId}&amt=${amount}&cur=MYR`;
  }

  /**
   * Validate payment data
   * @param {Object} paymentData - Payment data to validate
   * @returns {Object} Validation result
   */
  validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Invalid payment amount');
    }

    if (!paymentData.currency) {
      errors.push('Currency is required');
    }

    if (!paymentData.method) {
      errors.push('Payment method is required');
    }

    if (!Object.values(this.supportedMethods).includes(paymentData.method)) {
      errors.push('Unsupported payment method');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = new PaymentService();
