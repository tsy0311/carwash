import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/contact/submit', formData);
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="contact section">
      <div className="container">
        <div className="section-title">
          <h2>Contact Us</h2>
          <p>Reach out to us to book an appointment or inquire about our products and services.</p>
        </div>
        
        <div className="contact-grid grid grid-2">
          <div className="contact-info">
            <h3>Get In Touch</h3>
            <div className="contact-details">
              <p><FaMapMarkerAlt /> 13 jalan rakan 12/2 Cheras, 43200 Kajang, Selangor</p>
              <p><FaPhone /> (+60) 163399533</p>
              <p><FaEnvelope /> autobath36@gmail.com</p>
              <p><FaClock /> Monday-Friday: 9am-6pm, Saturday: 10am-4pm</p>
            </div>
            <div className="social-icons">
              <button type="button" aria-label="Facebook"><FaFacebook /></button>
              <button type="button" aria-label="Instagram"><FaInstagram /></button>
              <button type="button" aria-label="Twitter"><FaTwitter /></button>
              <button type="button" aria-label="YouTube"><FaYoutube /></button>
            </div>
          </div>
          
          <div className="contact-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Select Service</option>
                  <option value="Exterior Detailing">Exterior Detailing</option>
                  <option value="Interior Detailing">Interior Detailing</option>
                  <option value="Premium Package">Premium Package</option>
                  <option value="Product Inquiry">Product Inquiry</option>
                </select>
              </div>
              
              <div className="form-group">
                <textarea
                  name="message"
                  placeholder="Your Message *"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-control"
                  rows="5"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
