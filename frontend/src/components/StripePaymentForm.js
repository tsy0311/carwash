import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { FaCreditCard, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const StripePaymentForm = ({ orderData, onSuccess, onError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const response = await api.post('/api/payments/create-intent', {
        amount: orderData.total,
        currency: 'MYR',
        metadata: {
          orderId: orderData.id,
          customerId: orderData.customerId,
          items: JSON.stringify(orderData.items)
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create payment intent');
      }

      const { clientSecret } = response.data;

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: orderData.customerInfo?.name || '',
            email: orderData.customerInfo?.email || '',
            phone: orderData.customerInfo?.phone || ''
          }
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        // Payment successful
        const paymentData = {
          paymentId: paymentIntent.id,
          method: 'card',
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency,
          status: 'completed',
          transactionId: paymentIntent.id,
          paymentMethodId: paymentIntent.payment_method
        };

        onSuccess(paymentData);
        toast.success('Payment completed successfully!');
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.message);
      onError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800">
          <FaCreditCard />
          <span className="font-medium">Secure Payment with Stripe</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Your payment information is encrypted and secure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3 focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-semibold text-lg text-primary">
              RM {orderData.total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || loading}
            className="flex-1 btn flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaCheckCircle />
                Pay RM {orderData.total.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="text-xs text-gray-500 text-center">
        <p>By proceeding, you agree to our terms of service and privacy policy.</p>
        <p>Powered by Stripe - Your payment information is secure and encrypted.</p>
      </div>
    </div>
  );
};

export default StripePaymentForm;
