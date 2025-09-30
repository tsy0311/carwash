import React, { useState } from 'react';
import { FaUniversity, FaCopy, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const BankTransferForm = ({ orderData, onSuccess, onError, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [bankTransferData, setBankTransferData] = useState(null);
  const [error, setError] = useState('');

  const createBankTransfer = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/payments/bank-transfer/create', {
        amount: orderData.total,
        orderId: orderData.id,
        customerInfo: orderData.customerInfo
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create bank transfer payment');
      }

      setBankTransferData(response.data.bankTransfer);
    } catch (error) {
      console.error('Bank transfer creation error:', error);
      setError(error.message);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleConfirmPayment = () => {
    const paymentData = {
      paymentId: bankTransferData.referenceNumber,
      method: 'bank_transfer',
      amount: orderData.total,
      currency: 'MYR',
      status: 'pending',
      transactionId: bankTransferData.referenceNumber,
      bankTransfer: bankTransferData
    };

    onSuccess(paymentData);
    toast.success('Bank transfer details saved. Please complete the transfer.');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <FaSpinner className="animate-spin text-4xl text-secondary mx-auto mb-4" />
        <p className="text-gray-600">Preparing bank transfer details...</p>
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
            onClick={createBankTransfer}
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

  if (!bankTransferData) {
    return (
      <div className="text-center py-8">
        <button
          onClick={createBankTransfer}
          className="btn btn-primary"
        >
          Generate Bank Transfer Details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800">
          <FaUniversity />
          <span className="font-medium">Bank Transfer Payment</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Transfer the exact amount to the account below and include the reference number.
        </p>
      </div>

      {/* Bank Details */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-primary mb-4">Transfer Details</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Bank Name</span>
            <span className="font-medium">{bankTransferData.bankName}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Account Number</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">{bankTransferData.accountNumber}</span>
              <button
                onClick={() => copyToClipboard(bankTransferData.accountNumber, 'Account number')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy Account Number"
              >
                <FaCopy className="text-xs text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Account Name</span>
            <span className="font-medium">{bankTransferData.accountName}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Reference Number</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-secondary">{bankTransferData.referenceNumber}</span>
              <button
                onClick={() => copyToClipboard(bankTransferData.referenceNumber, 'Reference number')}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Copy Reference Number"
              >
                <FaCopy className="text-xs text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Amount</span>
            <span className="font-bold text-lg text-primary">RM {bankTransferData.amount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Expires</span>
            <span className="text-sm text-gray-500">
              {new Date(bankTransferData.expiresAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Important Instructions:</h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Transfer the exact amount: <strong>RM {bankTransferData.amount.toFixed(2)}</strong></li>
          <li>Include the reference number: <strong>{bankTransferData.referenceNumber}</strong></li>
          <li>Keep your transfer receipt as proof of payment</li>
          <li>Payment will be verified within 24 hours</li>
          <li>Contact us if you need assistance</li>
        </ul>
      </div>

      {/* Payment Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">How to make the transfer:</h4>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Open your banking app or visit your bank's website</li>
          <li>Select "Transfer" or "Send Money"</li>
          <li>Enter the account details above</li>
          <li>Enter the exact amount: RM {bankTransferData.amount.toFixed(2)}</li>
          <li>In the reference/description field, enter: {bankTransferData.referenceNumber}</li>
          <li>Complete the transfer</li>
          <li>Save your transfer receipt</li>
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
        <button
          onClick={handleConfirmPayment}
          className="flex-1 btn flex items-center justify-center gap-2"
        >
          <FaCheckCircle />
          I Will Transfer Now
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>After completing the transfer, please keep your receipt as proof of payment.</p>
        <p>We will verify your payment and update your order status accordingly.</p>
      </div>
    </div>
  );
};

export default BankTransferForm;
