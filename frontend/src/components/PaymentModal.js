import React, { useState, useEffect } from 'react';
import { FaTimes, FaCreditCard, FaMobile, FaUniversity, FaMoneyBill, FaExclamationTriangle } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import api from '../services/api';
import StripePaymentForm from './StripePaymentForm';
import TNGPaymentForm from './TNGPaymentForm';
import BankTransferForm from './BankTransferForm';
import CashPaymentForm from './CashPaymentForm';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key');

const PaymentModal = ({ isOpen, onClose, orderData, onPaymentSuccess }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('/api/payments/methods');
      setPaymentMethods(response.data.methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setError('Failed to load payment methods');
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    onPaymentSuccess(paymentData);
    onClose();
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  const getMethodIcon = (methodId) => {
    switch (methodId) {
      case 'card':
        return <FaCreditCard className="text-2xl" />;
      case 'tng':
        return <FaMobile className="text-2xl" />;
      case 'bank_transfer':
        return <FaUniversity className="text-2xl" />;
      case 'cash':
        return <FaMoneyBill className="text-2xl" />;
      default:
        return <FaCreditCard className="text-2xl" />;
    }
  };

  const renderPaymentForm = () => {
    if (!selectedMethod) return null;

    const commonProps = {
      orderData,
      onSuccess: handlePaymentSuccess,
      onError: handlePaymentError,
      onCancel: onClose
    };

    switch (selectedMethod) {
      case 'card':
        return (
          <Elements stripe={stripePromise}>
            <StripePaymentForm {...commonProps} />
          </Elements>
        );
      case 'tng':
        return <TNGPaymentForm {...commonProps} />;
      case 'bank_transfer':
        return <BankTransferForm {...commonProps} />;
      case 'cash':
        return <CashPaymentForm {...commonProps} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-primary">Choose Payment Method</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-primary mb-2">Order Summary</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Items ({orderData?.items?.length || 0})</span>
              <span>RM {orderData?.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg text-primary">
              <span>Total</span>
              <span>RM {orderData?.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Payment Methods */}
        {!selectedMethod ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Select Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={!method.enabled}
                  className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                    method.enabled
                      ? 'border-gray-200 hover:border-secondary hover:bg-secondary/5'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-secondary">
                      {getMethodIcon(method.id)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary">{method.name}</h4>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setSelectedMethod('')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-secondary">
                  {getMethodIcon(selectedMethod)}
                </div>
                <h3 className="text-lg font-semibold text-primary">
                  {paymentMethods.find(m => m.id === selectedMethod)?.name}
                </h3>
              </div>
            </div>
            {renderPaymentForm()}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
