import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
              AUTOBATH
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Premium car detailing services and products to keep your vehicle looking its best.
            </p>
            <p className="text-gray-300 text-sm">
              &copy; {currentYear} AUTOBATH. All rights reserved.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-secondary transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-secondary transition-colors duration-300">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-secondary transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
              Contact Info
            </h3>
            <div className="space-y-3">
              <p className="text-gray-300 flex items-center gap-2">
                <FaMapMarkerAlt className="text-secondary" />
                13 jalan rakan 12/2 Cheras, 43200 Kajang, Selangor
              </p>
              <p className="text-gray-300 flex items-center gap-2">
                <FaPhone className="text-secondary" />
                (+60) 163399533
              </p>
              <p className="text-gray-300 flex items-center gap-2">
                <FaEnvelope className="text-secondary" />
                autobath36@gmail.com
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
              Follow Us
            </h3>
            <div className="flex gap-4">
              <button 
                type="button" 
                aria-label="Facebook"
                className="text-gray-300 hover:text-secondary transition-colors duration-300 text-2xl"
              >
                <FaFacebook />
              </button>
              <button 
                type="button" 
                aria-label="Instagram"
                className="text-gray-300 hover:text-secondary transition-colors duration-300 text-2xl"
              >
                <FaInstagram />
              </button>
              <button 
                type="button" 
                aria-label="Twitter"
                className="text-gray-300 hover:text-secondary transition-colors duration-300 text-2xl"
              >
                <FaTwitter />
              </button>
              <button 
                type="button" 
                aria-label="YouTube"
                className="text-gray-300 hover:text-secondary transition-colors duration-300 text-2xl"
              >
                <FaYoutube />
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center">
          <p className="text-gray-300 font-semibold text-secondary">
            AUTOBATH
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
