const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const { v4: uuidv4 } = require('uuid');

/**
 * @route GET /api/payments/methods
 * @desc Get available payment methods
 * @access Public
 */
router.get('/methods', (req, res) => {
  try {
    const methods = paymentService.getPaymentMethods();
    res.json({
      success: true,
      methods: methods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment methods'
    });
  }
});

/**
 * @route POST /api/payments/create-intent
 * @desc Create payment intent for Stripe
 * @access Public
 */
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    const paymentData = {
      amount: parseFloat(amount),
      currency: currency || 'MYR',
      metadata: metadata || {}
    };

    const result = await paymentService.createPaymentIntent(paymentData);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

/**
 * @route POST /api/payments/confirm
 * @desc Confirm payment intent
 * @access Public
 */
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required'
      });
    }

    const result = await paymentService.confirmPaymentIntent(paymentIntentId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment'
    });
  }
});

/**
 * @route POST /api/payments/tng/create
 * @desc Create TNG eWallet payment
 * @access Public
 */
router.post('/tng/create', async (req, res) => {
  try {
    const { amount, orderId, customerInfo } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    if (!customerInfo || !customerInfo.name || !customerInfo.email) {
      return res.status(400).json({
        success: false,
        error: 'Customer information is required'
      });
    }

    const paymentData = {
      amount: parseFloat(amount),
      orderId: orderId || uuidv4(),
      customerInfo: customerInfo
    };

    const result = await paymentService.createTNGPayment(paymentData);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error creating TNG payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create TNG payment'
    });
  }
});

/**
 * @route POST /api/payments/tng/verify
 * @desc Verify TNG payment status
 * @access Public
 */
router.post('/tng/verify', async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID is required'
      });
    }

    const result = await paymentService.verifyTNGPayment(paymentId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error verifying TNG payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify TNG payment'
    });
  }
});

/**
 * @route POST /api/payments/bank-transfer/create
 * @desc Create bank transfer payment
 * @access Public
 */
router.post('/bank-transfer/create', async (req, res) => {
  try {
    const { amount, orderId, customerInfo } = req.body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    const paymentData = {
      amount: parseFloat(amount),
      orderId: orderId || uuidv4(),
      customerInfo: customerInfo || {}
    };

    const result = await paymentService.createBankTransferPayment(paymentData);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error creating bank transfer payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bank transfer payment'
    });
  }
});

/**
 * @route POST /api/payments/refund
 * @desc Process refund
 * @access Public
 */
router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        error: 'Payment intent ID is required'
      });
    }

    const result = await paymentService.processRefund(paymentIntentId, amount);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund'
    });
  }
});

/**
 * @route POST /api/payments/validate
 * @desc Validate payment data
 * @access Public
 */
router.post('/validate', (req, res) => {
  try {
    const validation = paymentService.validatePaymentData(req.body);
    res.json(validation);
  } catch (error) {
    console.error('Error validating payment data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate payment data'
    });
  }
});

/**
 * @route GET /api/payments/webhook/stripe
 * @desc Stripe webhook endpoint
 * @access Public
 */
router.post('/webhook/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Update order status in database
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      // Handle failed payment
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

module.exports = router;
