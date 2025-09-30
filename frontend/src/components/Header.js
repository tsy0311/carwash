import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import CartModal from './CartModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getTotalItems } = useCart();
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/booking', label: 'Appointment' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-white to-gray-50 text-primary py-6 sticky top-0 z-50 shadow-lg border-b-4 border-secondary backdrop-blur-sm">
        <div className="container flex justify-between items-center">
          <Link to="/" className="no-underline text-inherit" onClick={closeMenu}>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider uppercase text-primary drop-shadow-sm transition-all duration-300 hover:scale-105 hover:text-secondary">
              AUTOBATH
              <span className="block text-sm md:text-base tracking-wider mt-[-3px] text-black font-medium opacity-80">
                DETAILING & ACCESSORIES
              </span>
            </h1>
          </Link>
          
          <nav className={`hidden md:flex items-center ${isMenuOpen ? 'md:flex' : ''}`}>
            <ul className="flex items-center space-x-8">
              {navItems.map(item => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`px-6 py-3 rounded-full font-semibold text-lg transition-all duration-300 relative block bg-white/10 border-2 border-transparent hover:text-white hover:bg-gradient-to-r hover:from-secondary hover:to-secondary-dark hover:-translate-y-1 hover:shadow-lg hover:border-white/20 ${
                      location.pathname === item.path 
                        ? 'text-white bg-gradient-to-r from-secondary to-secondary-dark -translate-y-1 shadow-lg border-white/20' 
                        : 'text-primary'
                    }`}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li 
                className="relative cursor-pointer text-primary text-xl px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 bg-white/10 border-2 border-transparent hover:text-white hover:bg-gradient-to-r hover:from-secondary hover:to-secondary-dark hover:-translate-y-1 hover:shadow-lg hover:border-white/20" 
                onClick={toggleCart}
              >
                <FaShoppingCart />
                <span className="text-base font-medium">Cart</span>
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg animate-pulse">
                  {getTotalItems()}
                </span>
              </li>
            </ul>
          </nav>

          <button 
            className="md:hidden bg-gradient-to-r from-secondary to-secondary-dark border-none text-white text-2xl cursor-pointer p-3 rounded-full transition-all duration-300 shadow-lg hover:scale-110 hover:shadow-xl" 
            onClick={toggleMenu}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        <nav className={`md:hidden absolute top-full left-0 right-0 bg-gradient-to-r from-white to-gray-50 shadow-2xl border-t-4 border-secondary z-50 transform transition-all duration-400 backdrop-blur-sm ${
          isMenuOpen 
            ? 'translate-y-0 opacity-100 visible' 
            : '-translate-y-full opacity-0 invisible'
        }`}>
          <ul className="flex flex-col w-full py-4">
            {navItems.map(item => (
              <li key={item.path} className="w-full text-center">
                <Link 
                  to={item.path} 
                  className={`block px-8 py-4 text-xl font-semibold border-b border-black/5 bg-white/50 mx-4 my-1 rounded-2xl transition-all duration-300 hover:bg-gradient-to-r hover:from-secondary hover:to-secondary-dark hover:text-white hover:translate-x-2 ${
                    location.pathname === item.path 
                      ? 'bg-gradient-to-r from-secondary to-secondary-dark text-white translate-x-2' 
                      : 'text-primary'
                  }`}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li 
              className="px-8 py-4 text-xl border-b border-black/5 bg-white/50 mx-4 my-1 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:bg-gradient-to-r hover:from-secondary hover:to-secondary-dark hover:text-white hover:translate-x-2 cursor-pointer" 
              onClick={toggleCart}
            >
              <FaShoppingCart />
              <span className="font-medium">Cart</span>
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg">
                {getTotalItems()}
              </span>
            </li>
          </ul>
        </nav>
      </header>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;
