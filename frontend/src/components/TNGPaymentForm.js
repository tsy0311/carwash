import React, { useState, useEffect, useCallback } from 'react';
import { FaMobile, FaQrcode, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const TNGPaymentForm = ({ orderData, onSuccess, onError, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const startPaymentPolling = useCallback((paymentId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.post('/api/payments/tng/verify', {
          paymentId: paymentId
        });

        if (response.data.success) {
          if (response.data.status === 'completed') {
            setPaymentStatus('completed');
            clearInterval(pollInterval);
            
            const paymentData = {
              paymentId: paymentId,
              method: 'tng',
              amount: orderData.total,
              currency: 'MYR',
              status: 'completed',
              transactionId: paymentId,
              qrCode: qrCode
            };

            onSuccess(paymentData);
            toast.success('TNG payment completed successfully!');
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 15 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'pending') {
        setError('Payment timeout. Please try again.');
        setPaymentStatus('timeout');
      }
    }, 15 * 60 * 1000);
  }, [orderData.total, qrCode, onSuccess, paymentStatus]);

  const createTNGPayment = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/payments/tng/create', {
        amount: orderData.total,
        orderId: orderData.id,
        customerInfo: orderData.customerInfo
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create TNG payment');
      }

      setPaymentData(response.data.payment);
      setQrCode(response.data.payment.qrCode);
      
      // Start polling for payment status
      startPaymentPolling(response.data.payment.paymentId);
    } catch (error) {
      console.error('TNG payment creation error:', error);
      setError(error.message);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  }, [orderData.total, orderData.id, orderData.customerInfo, onError, startPaymentPolling]);

  useEffect(() => {
    createTNGPayment();
  }, [createTNGPayment]);


  const copyPaymentId = () => {
    if (paymentData?.paymentId) {
      navigator.clipboard.writeText(paymentData.paymentId);
      toast.success('Payment ID copied to clipboard');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'timeout':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600" />;
      case 'timeout':
        return <FaExclamationTriangle className="text-red-600" />;
      default:
        return <FaSpinner className="animate-spin text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <FaSpinner className="animate-spin text-4xl text-secondary mx-auto mb-4" />
        <p className="text-gray-600">Creating TNG payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={createTNGPayment}
            className="btn btn-secondary"
          >
            Try Again
          </button>
          <button
            onClick={onCancel}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-orange-800">
          <FaMobile />
          <span className="font-medium">Touch 'n Go eWallet Payment</span>
        </div>
        <p className="text-sm text-orange-700 mt-1">
          Scan the QR code with your TNG eWallet app to complete payment.
        </p>
      </div>

      {/* Payment Status */}
      <div className={`border rounded-lg p-4 ${getStatusColor(paymentStatus)}`}>
        <div className="flex items-center gap-2">
          {getStatusIcon(paymentStatus)}
          <span className="font-medium">
            {paymentStatus === 'completed' && 'Payment Completed'}
            {paymentStatus === 'timeout' && 'Payment Timeout'}
            {paymentStatus === 'pending' && 'Waiting for Payment'}
          </span>
        </div>
        <p className="text-sm mt-1">
          {paymentStatus === 'completed' && 'Your payment has been processed successfully.'}
          {paymentStatus === 'timeout' && 'Payment session has expired. Please try again.'}
          {paymentStatus === 'pending' && 'Please scan the QR code below with your TNG eWallet app.'}
        </p>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Payment ID</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{paymentData?.paymentId}</span>
            <button
              onClick={copyPaymentId}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Copy Payment ID"
            >
              <FaCopy className="text-xs text-gray-500" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount</span>
          <span className="font-semibold text-lg text-primary">
            RM {paymentData?.amount?.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Expires</span>
          <span className="text-sm text-gray-500">
            {paymentData?.expiresAt ? new Date(paymentData.expiresAt).toLocaleTimeString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* QR Code */}
      {qrCode && paymentStatus === 'pending' && (
        <div className="text-center">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 inline-block">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <FaQrcode className="text-6xl text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">QR Code</p>
                <p className="text-xs text-gray-400 mt-1">Scan with TNG eWallet</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Scan this QR code with your TNG eWallet app
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">How to pay with TNG eWallet:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Open your TNG eWallet app</li>
          <li>Tap on "Scan QR" or "Pay"</li>
          <li>Scan the QR code above</li>
          <li>Confirm the payment amount</li>
          <li>Complete the payment</li>
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        {paymentStatus === 'timeout' && (
          <button
            onClick={createTNGPayment}
            className="flex-1 btn btn-secondary"
          >
            Try Again
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>Payment will be automatically verified once completed in your TNG eWallet app.</p>
        <p>If you encounter any issues, please contact our support team.</p>
      </div>
    </div>
  );
};

export default TNGPaymentForm;
