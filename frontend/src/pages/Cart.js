import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaCreditCard } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const navigate = useNavigate();

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      setLoading(true);
      
      // Create order with payment information
      const orderData = {
        items: items,
        total: getTotalPrice(),
        customerInfo: customerInfo,
        payment: paymentData,
        status: 'pending'
      };

      const response = await api.post('/api/orders', orderData);
      
      if (response.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        setCustomerInfo({ name: '', email: '', phone: '' });
        navigate('/');
      } else {
        throw new Error(response.data.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    // Validation
    if (!customerInfo.name || !customerInfo.email) {
      toast.error('Please fill in your name and email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Open payment modal
    setShowPaymentModal(true);
  };

  if (items.length === 0) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="text-center py-16">
            <FaShoppingCart size={64} className="mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold text-primary mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some products to get started!</p>
            <button className="btn" onClick={() => navigate('/products')}>
              Shop Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="container">
        <div className="section-title">
          <h2>Shopping Cart</h2>
          <p>Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-box text-2xl text-secondary"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-primary mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{item.category}</p>
                    <p className="text-sm text-gray-600">RM {item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <FaMinus className="text-sm" />
                    </button>
                    <input 
                      type="number" 
                      className="w-16 h-8 text-center border border-gray-300 rounded focus:outline-none focus:border-secondary" 
                      value={item.quantity} 
                      min="1"
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                    />
                    <button 
                      className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <FaPlus className="text-sm" />
                    </button>
                  </div>
                  <div className="text-lg font-bold text-primary min-w-[100px] text-right">
                    RM {(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button 
                    className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-primary mb-4">Order Summary</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Items ({items.reduce((total, item) => total + item.quantity, 0)})</span>
                <span className="font-semibold">RM {getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-primary pt-4 border-t border-gray-200">
                <span>Total</span>
                <span>RM {getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <form className="bg-white rounded-xl shadow-lg border border-gray-200 p-6" onSubmit={handleCheckout}>
              <h3 className="text-xl font-bold text-primary mb-4">Customer Information</h3>
              
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={customerInfo.name}
                  onChange={handleCustomerInfoChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={customerInfo.email}
                  onChange={handleCustomerInfoChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={customerInfo.phone}
                  onChange={handleCustomerInfoChange}
                  className="form-control"
                />
              </div>
              
              <button 
                type="submit" 
                className="btn w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Proceed to Payment
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={{
          id: `ORDER_${Date.now()}`,
          items: items,
          total: getTotalPrice(),
          customerInfo: customerInfo
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Cart;
