import React, { useState } from 'react';
import { FaCreditCard, FaMobile, FaUniversity, FaMoneyBill } from 'react-icons/fa';
import PaymentModal from './PaymentModal';

const PaymentTest = () => {
  const [showModal, setShowModal] = useState(false);

  const testOrderData = {
    id: 'TEST_ORDER_001',
    items: [
      {
        id: 1,
        name: 'Car Wash Service',
        price: 50.00,
        quantity: 1,
        category: 'Service'
      },
      {
        id: 2,
        name: 'Wax Treatment',
        price: 30.00,
        quantity: 1,
        category: 'Service'
      }
    ],
    total: 80.00,
    customerInfo: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+60123456789'
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    alert(`Payment successful! Method: ${paymentData.method}, Amount: RM ${paymentData.amount}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-primary mb-6 text-center">
              Payment Integration Test
            </h1>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">Test Order</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Car Wash Service</span>
                  <span>RM 50.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Wax Treatment</span>
                  <span>RM 30.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-primary border-t pt-2">
                  <span>Total</span>
                  <span>RM 80.00</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-primary mb-4">Supported Payment Methods</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <FaCreditCard className="text-2xl text-blue-600" />
                  <div>
                    <h3 className="font-medium">Credit/Debit Card</h3>
                    <p className="text-sm text-gray-600">Visa, Mastercard, Amex</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <FaMobile className="text-2xl text-orange-600" />
                  <div>
                    <h3 className="font-medium">TNG eWallet</h3>
                    <p className="text-sm text-gray-600">QR Code Payment</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <FaUniversity className="text-2xl text-green-600" />
                  <div>
                    <h3 className="font-medium">Bank Transfer</h3>
                    <p className="text-sm text-gray-600">Direct Transfer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <FaMoneyBill className="text-2xl text-yellow-600" />
                  <div>
                    <h3 className="font-medium">Cash on Delivery</h3>
                    <p className="text-sm text-gray-600">Pay on Service</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary text-lg px-8 py-4"
              >
                Test Payment Integration
              </button>
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Test Instructions</h3>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Click "Test Payment Integration" to open the payment modal</li>
                <li>Try different payment methods to test the flow</li>
                <li>For Stripe: Use test card 4242 4242 4242 4242</li>
                <li>For TNG: Mock implementation will simulate payment</li>
                <li>For Bank Transfer: Generate reference number</li>
                <li>For Cash: Test order creation flow</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        orderData={testOrderData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default PaymentTest;
