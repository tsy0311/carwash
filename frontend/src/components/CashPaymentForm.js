import React from 'react';
import { FaMoneyBill, FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CashPaymentForm = ({ orderData, onSuccess, onError, onCancel }) => {
  const handleConfirmCashPayment = () => {
    const paymentData = {
      paymentId: `CASH_${Date.now()}`,
      method: 'cash',
      amount: orderData.total,
      currency: 'MYR',
      status: 'pending',
      transactionId: `CASH_${Date.now()}`,
      paymentType: 'cash_on_delivery'
    };

    onSuccess(paymentData);
    toast.success('Cash payment option selected. You will pay when the service is completed.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800">
          <FaMoneyBill />
          <span className="font-medium">Cash on Delivery</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Pay with cash when our service is completed at your location.
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Service Date</span>
            <span className="font-medium">{orderData.serviceDate || 'To be scheduled'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service Time</span>
            <span className="font-medium">{orderData.serviceTime || 'To be confirmed'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location</span>
            <span className="font-medium">{orderData.location || 'Your address'}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-primary pt-2 border-t border-gray-200">
            <span>Total Amount</span>
            <span>RM {orderData.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Process */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-3">How Cash Payment Works:</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Service Scheduling</p>
              <p className="text-xs text-blue-600">We'll contact you to schedule your service appointment</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Service Completion</p>
              <p className="text-xs text-blue-600">Our team will complete the service at your location</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Payment</p>
              <p className="text-xs text-blue-600">Pay the exact amount in cash to our service technician</p>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
          <FaExclamationTriangle />
          Important Notes
        </h4>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>Please have the exact amount ready (RM {orderData.total.toFixed(2)})</li>
          <li>Payment is due immediately after service completion</li>
          <li>We accept cash only - no change will be provided</li>
          <li>Service will only be completed upon payment confirmation</li>
          <li>Keep your receipt for warranty purposes</li>
        </ul>
      </div>

      {/* Service Area */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          <FaClock />
          Service Area & Timing
        </h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p><strong>Service Areas:</strong> Kajang, Cheras, and surrounding areas</p>
          <p><strong>Operating Hours:</strong> Monday - Sunday, 8:00 AM - 6:00 PM</p>
          <p><strong>Advance Booking:</strong> Recommended 24-48 hours in advance</p>
          <p><strong>Emergency Service:</strong> Available with additional charges</p>
        </div>
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
          onClick={handleConfirmCashPayment}
          className="flex-1 btn flex items-center justify-center gap-2"
        >
          <FaCheckCircle />
          Confirm Cash Payment
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>By confirming cash payment, you agree to pay the full amount upon service completion.</p>
        <p>Our team will contact you within 24 hours to schedule your appointment.</p>
      </div>
    </div>
  );
};

export default CashPaymentForm;
