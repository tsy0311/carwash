
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCar, FaChair, FaGem, FaClock, FaUsers, FaShoppingCart, 
  FaCheck, FaTag, FaShieldAlt, FaMobile, FaGift,
  FaArrowRight, FaCalendarAlt, FaBox, FaCheckCircle
} from 'react-icons/fa';
import api from '../services/api';

const Home = () => {
  const [stats, setStats] = useState({
    totalServices: 0,
    totalPackages: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [popularPackages, setPopularPackages] = useState([]);

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: '0px', threshold: 0.15 }
    );

    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch data in parallel
      const [servicesRes, packagesRes] = await Promise.all([
        api.get('/api/services'),
        api.get('/api/service-packages')
      ]);

      const services = servicesRes.data.services;
      const packages = packagesRes.data.packages;

      // Calculate statistics
      setStats({
        totalServices: services.length,
        totalPackages: packages.length,
        averageRating: 4.8,
        totalReviews: 150
      });

      // Get popular packages (limit to 3)
      setPopularPackages(packages.filter(pkg => pkg.is_popular).slice(0, 3));

    } catch (error) {
      console.error('Error fetching home data:', error);
      // Don't show error to user, just use default values
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-white text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1565689223836-06670c6d3740?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
            alt="Professional car detailing"
            loading="eager"
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-8 py-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Premium Car Detailing Services
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-100 leading-relaxed">
            Experience the ultimate in automotive care with our professional detailing services, dynamic pricing, and comprehensive packages designed for every vehicle type.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/booking" className="btn btn-primary flex items-center gap-2">
              <FaCar /> Book Services
            </Link>
            <Link to="/booking" className="btn btn-secondary flex items-center gap-2">
              <FaCalendarAlt /> Book Now
            </Link>
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap gap-8 justify-center max-w-2xl mx-auto">
          <div className="text-center bg-white/10 px-6 py-4 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-3xl font-bold text-white mb-1">{stats.totalServices}+</div>
            <div className="text-sm text-white/80 uppercase tracking-wider">Services</div>
          </div>
          <div className="text-center bg-white/10 px-6 py-4 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-3xl font-bold text-white mb-1">{stats.totalPackages}</div>
            <div className="text-sm text-white/80 uppercase tracking-wider">Packages</div>
          </div>
          <div className="text-center bg-white/10 px-6 py-4 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-3xl font-bold text-white mb-1">{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-white/80 uppercase tracking-wider">Rating</div>
          </div>
          <div className="text-center bg-white/10 px-6 py-4 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-3xl font-bold text-white mb-1">{stats.totalReviews}+</div>
            <div className="text-sm text-white/80 uppercase tracking-wider">Reviews</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container">
          <div className="section-title">
            <h2>Why Choose AUTOBATH?</h2>
            <p>Discover the features that make us the premier choice for car detailing</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-0 text-center shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary overflow-hidden">
              <div className="w-full h-36 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/400x150/2C5282/ffffff?text=Dynamic+Pricing" 
                  alt="Dynamic pricing"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x150/2C5282/ffffff?text=Pricing';
                  }}
                />
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto -mt-10 mb-6 text-white text-3xl">
                <FaTag />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 px-6">Dynamic Pricing</h3>
              <p className="text-gray-600 leading-relaxed px-6 pb-6">Fair pricing based on your vehicle type - Sedan, SUV, or Truck</p>
            </div>
            <div className="bg-white rounded-2xl p-0 text-center shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary overflow-hidden">
              <div className="w-full h-36 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/400x150/2C5282/ffffff?text=Smart+Booking" 
                  alt="Smart booking"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x150/2C5282/ffffff?text=Booking';
                  }}
                />
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto -mt-10 mb-6 text-white text-3xl">
                <FaClock />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 px-6">Smart Booking</h3>
              <p className="text-gray-600 leading-relaxed px-6 pb-6">Service-specific time slots with duration-based scheduling</p>
            </div>
            <div className="bg-white rounded-2xl p-0 text-center shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary overflow-hidden">
              <div className="w-full h-36 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/400x150/2C5282/ffffff?text=Loyalty+Program" 
                  alt="Loyalty program"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x150/2C5282/ffffff?text=Loyalty';
                  }}
                />
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto -mt-10 mb-6 text-white text-3xl">
                <FaGift />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 px-6">Loyalty Program</h3>
              <p className="text-gray-600 leading-relaxed px-6 pb-6">Earn points with every service and unlock exclusive benefits</p>
            </div>
            <div className="bg-white rounded-2xl p-0 text-center shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary overflow-hidden">
              <div className="w-full h-36 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/400x150/2C5282/ffffff?text=Mobile+Ready" 
                  alt="Mobile ready"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x150/2C5282/ffffff?text=Mobile';
                  }}
                />
              </div>
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto -mt-10 mb-6 text-white text-3xl">
                <FaMobile />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4 px-6">Mobile Ready</h3>
              <p className="text-gray-600 leading-relaxed px-6 pb-6">Optimized for all devices with responsive design</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Packages Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="section-title">
            <h2>Popular Service Packages</h2>
            <p>Save more with our carefully curated packages</p>
            <Link to="/booking" className="inline-flex items-center gap-2 text-primary font-semibold mt-4 transition-all duration-300 hover:text-secondary hover:translate-x-1">
              Book Services <FaArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularPackages.map((packageData, index) => (
              <div key={packageData.id} className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary relative">
                <div className="absolute top-4 right-4 bg-secondary text-white px-4 py-2 rounded-full text-sm font-semibold z-10">
                  Most Popular
                </div>
                <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">{packageData.name}</h3>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-base line-through opacity-70">RM {packageData.base_price.toFixed(2)}</span>
                    <span className="text-4xl font-bold">RM {packageData.finalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-6 leading-relaxed">{packageData.description}</p>
                  <div className="flex justify-between items-center mb-6 p-4 bg-secondary/5 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 font-semibold">
                      <FaClock /> {formatDuration(packageData.duration_minutes)}
                    </div>
                    <div className="bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Save RM {packageData.savings.toFixed(2)}
                    </div>
                  </div>
                  <Link to={`/booking?package=${packageData.id}&type=package`} className="btn btn-primary w-full text-center">
                    Book This Package
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container">
          <div className="section-title">
            <h2>Our Services</h2>
            <p>Professional detailing services tailored to your needs</p>
            <Link to="/booking" className="inline-flex items-center gap-2 text-primary font-semibold mt-4 transition-all duration-300 hover:text-secondary hover:translate-x-1">
              Book Services <FaArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary">
              <div className="relative w-full h-48 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/400x200/2C5282/ffffff?text=Exterior+Detailing" 
                  alt="Exterior car detailing"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200/2C5282/ffffff?text=Exterior';
                  }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
                  <FaCar />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-primary mb-4">Exterior Detailing</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Complete exterior wash, wax, paint correction, and ceramic coating for a brilliant shine.</p>
                <div className="flex flex-col gap-2 mb-6 p-4 bg-secondary/5 rounded-lg">
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> Paint Correction</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> Ceramic Coating</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> Wheel Cleaning</span>
                </div>
                <Link to="/booking?service=1&type=single" className="btn w-full text-center">Book Exterior</Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary">
              <div className="relative w-full h-48 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/400x200/2C5282/ffffff?text=Interior+Detailing" 
                  alt="Interior car detailing"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200/2C5282/ffffff?text=Interior';
                  }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
                  <FaChair />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-primary mb-4">Interior Detailing</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Deep interior cleaning, leather treatment, and fabric protection for a fresh cabin.</p>
                <div className="flex flex-col gap-2 mb-6 p-4 bg-secondary/5 rounded-lg">
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> Leather Treatment</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> Steam Cleaning</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> Odor Elimination</span>
                </div>
                <Link to="/booking?service=2&type=single" className="btn w-full text-center">Book Interior</Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-secondary">
              <div className="relative w-full h-48 overflow-hidden">
                <img 
                  src="https://via.placeholder.com/400x200/2C5282/ffffff?text=Protection+Services" 
                  alt="Car protection services"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200/2C5282/ffffff?text=Protection';
                  }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
                  <FaShieldAlt />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-primary mb-4">Protection Services</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Advanced protection solutions including paint protection film and ceramic coatings.</p>
                <div className="flex flex-col gap-2 mb-6 p-4 bg-secondary/5 rounded-lg">
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> Paint Protection Film</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> Ceramic Coating</span>
                  <span className="flex items-center gap-2 text-sm text-gray-600"><FaCheck className="text-secondary" /> UV Protection</span>
                </div>
                <Link to="/booking?service=3&type=single" className="btn w-full text-center">Book Protection</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Bundles Section - Simplified */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="section-title">
            <h2>Popular Product Bundles</h2>
            <p>Save more with our carefully curated product combinations</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-secondary/10 flex flex-col items-center text-center gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-secondary">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl flex-shrink-0">
                <FaBox />
              </div>
              <div className="w-full">
                <h3 className="text-2xl font-bold text-primary mb-2">Cleaning Starter Kit</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">Everything you need to start detailing at home</p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-2xl font-bold text-primary">RM 89.99</span>
                  <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">Save RM 20.98</span>
                </div>
              </div>
              <Link to="/products" className="btn btn-primary flex items-center gap-2">
                <FaShoppingCart /> View Products
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-secondary/10 flex flex-col items-center text-center gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-secondary">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl flex-shrink-0">
                <FaGem />
              </div>
              <div className="w-full">
                <h3 className="text-2xl font-bold text-primary mb-2">Premium Protection Kit</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">Advanced protection for your vehicle's finish</p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-2xl font-bold text-primary">RM 149.99</span>
                  <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">Save RM 30.00</span>
                </div>
              </div>
              <Link to="/products" className="btn btn-primary flex items-center gap-2">
                <FaShoppingCart /> View Products
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-secondary/10 flex flex-col items-center text-center gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-secondary">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl flex-shrink-0">
                <FaShieldAlt />
              </div>
              <div className="w-full">
                <h3 className="text-2xl font-bold text-primary mb-2">Interior Care Kit</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">Complete interior cleaning and protection</p>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-2xl font-bold text-primary">RM 79.99</span>
                  <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-semibold">Save RM 15.00</span>
                </div>
              </div>
              <Link to="/products" className="btn btn-primary flex items-center gap-2">
                <FaShoppingCart /> View Products
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-primary mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-secondary">
                About AUTOBATH
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Founded in 2015, AUTOBATH has been providing premium car detailing services and products to car enthusiasts and everyday drivers alike. Our team of certified detailers are passionate about cars and committed to delivering exceptional results.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We use only the finest products, including Koch Chemie professional line, to ensure your vehicle receives the best care possible. Whether you're looking for a quick wash or a full paint correction, we have the expertise and equipment to exceed your expectations.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-gray-600 font-medium">
                  <FaCheckCircle className="text-secondary text-lg" /> Professional Certified Detailers
                </div>
                <div className="flex items-center gap-3 text-gray-600 font-medium">
                  <FaCheckCircle className="text-secondary text-lg" /> Premium Koch Chemie Products
                </div>
                <div className="flex items-center gap-3 text-gray-600 font-medium">
                  <FaCheckCircle className="text-secondary text-lg" /> Satisfaction Guarantee
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="btn btn-primary">Get in Touch</Link>
                <Link to="/booking" className="btn btn-secondary">Book Services</Link>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-secondary/10 relative">
              <img 
                src="https://images.unsplash.com/photo-1541348263662-e068662d82af?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Car detailing"
                loading="lazy"
                className="w-full h-auto"
              />
              <div className="absolute bottom-4 left-4 right-4 flex gap-4">
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl text-center flex-1">
                  <div className="text-2xl font-bold text-primary mb-1">8+</div>
                  <div className="text-sm text-gray-600 font-semibold">Years Experience</div>
                </div>
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl text-center flex-1">
                  <div className="text-2xl font-bold text-primary mb-1">1000+</div>
                  <div className="text-sm text-gray-600 font-semibold">Cars Detailed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://via.placeholder.com/1200x400/2C5282/ffffff?text=Professional+Car+Detailing" 
            alt="Professional car detailing service"
            loading="lazy"
            className="w-full h-full object-cover opacity-20"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/1200x400/2C5282/ffffff?text=AUTOBATH';
            }}
          />
        </div>
        <div className="container relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Transform Your Vehicle?</h2>
          <p className="text-xl md:text-2xl mb-10 opacity-90 leading-relaxed">
            Book your appointment today and experience the AUTOBATH difference
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/booking" className="btn btn-primary text-lg px-8 py-4 flex items-center gap-2">
              <FaCalendarAlt /> Book Appointment
            </Link>
            <Link to="/contact" className="btn btn-secondary text-lg px-8 py-4 flex items-center gap-2">
              <FaUsers /> Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
