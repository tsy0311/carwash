import React from 'react';
import { FaTimes, FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartModal = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-primary">Your Cart</h3>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" onClick={onClose}>
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {items.length === 0 ? (
            <p className="text-center text-gray-600 py-8">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-lg flex items-center justify-center">
                    <i className="fas fa-box text-xl text-secondary"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-primary">{item.name}</div>
                    <div className="text-sm text-gray-600">RM {item.price.toFixed(2)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <input 
                        type="number" 
                        className="w-12 h-6 text-center border border-gray-300 rounded text-sm"
                        value={item.quantity} 
                        min="1"
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                      />
                      <button 
                        className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                  </div>
                  <button 
                    className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-primary">Total:</span>
              <span className="text-xl font-bold text-primary">RM {getTotalPrice().toFixed(2)}</span>
            </div>
            <button className="btn w-full" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
