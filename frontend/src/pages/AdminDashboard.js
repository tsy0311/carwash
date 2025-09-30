import React, { useState, useEffect } from 'react';
import { FaUsers, FaCalendarAlt, FaShoppingCart, FaStar, FaDollarSign, FaChartLine, FaCog } from 'react-icons/fa';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [customersRes, bookingsRes, ordersRes, reviewsRes] = await Promise.all([
        api.get('/api/customers'),
        api.get('/api/bookings'),
        api.get('/api/orders'),
        api.get('/api/reviews')
      ]);

      const customers = customersRes.data.customers;
      const bookings = bookingsRes.data.bookings || [];
      const orders = ordersRes.data.orders || [];
      const reviews = reviewsRes.data.reviews;

      // Calculate statistics
      const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalBookings = bookings.length;
      const totalCustomers = customers.length;
      const totalReviews = reviews.length;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Recent activity
      const recentBookings = bookings.slice(0, 5);
      const recentOrders = orders.slice(0, 5);
      const recentReviews = reviews.slice(0, 5);

      // Booking status distribution
      const bookingStats = {
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
      };

      // Monthly revenue (last 6 months)
      const monthlyRevenue = [];
      const currentDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStart = month.toISOString().split('T')[0];
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const monthOrders = orders.filter(order => {
          const orderDate = new Date(order.created_at).toISOString().split('T')[0];
          return orderDate >= monthStart && orderDate <= monthEnd;
        });
        
        monthlyRevenue.push({
          month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthOrders.reduce((sum, order) => sum + order.total_amount, 0)
        });
      }

      setStats({
        totalRevenue,
        totalBookings,
        totalCustomers,
        totalReviews,
        averageRating,
        recentBookings,
        recentOrders,
        recentReviews,
        bookingStats,
        monthlyRevenue
      });

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#28a745';
      case 'cancelled': return '#dc3545';
      case 'completed': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p style={{ color: '#dc3545' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome to your business management center</p>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <FaCalendarAlt /> Bookings
          </button>
          <button 
            className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <FaUsers /> Customers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <FaStar /> Reviews
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FaShoppingCart /> Orders
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="dashboard-content">
            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon revenue">
                  <FaDollarSign />
                </div>
                <div className="metric-info">
                  <div className="metric-value">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="metric-label">Total Revenue</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon bookings">
                  <FaCalendarAlt />
                </div>
                <div className="metric-info">
                  <div className="metric-value">{stats.totalBookings}</div>
                  <div className="metric-label">Total Bookings</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon customers">
                  <FaUsers />
                </div>
                <div className="metric-info">
                  <div className="metric-value">{stats.totalCustomers}</div>
                  <div className="metric-label">Total Customers</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon reviews">
                  <FaStar />
                </div>
                <div className="metric-info">
                  <div className="metric-value">{stats.averageRating.toFixed(1)}</div>
                  <div className="metric-label">Avg Rating</div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
              <div className="chart-card">
                <h3>Booking Status Distribution</h3>
                <div className="booking-stats">
                  {Object.entries(stats.bookingStats).map(([status, count]) => (
                    <div key={status} className="status-item">
                      <div 
                        className="status-color" 
                        style={{ backgroundColor: getStatusColor(status) }}
                      ></div>
                      <span className="status-label">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                      <span className="status-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h3>Monthly Revenue</h3>
                <div className="revenue-chart">
                  {stats.monthlyRevenue.map((item, index) => (
                    <div key={index} className="revenue-item">
                      <div className="revenue-bar-container">
                        <div 
                          className="revenue-bar"
                          style={{ 
                            height: `${Math.max((item.revenue / Math.max(...stats.monthlyRevenue.map(r => r.revenue))) * 100, 5)}%`
                          }}
                        ></div>
                      </div>
                      <div className="revenue-label">{item.month}</div>
                      <div className="revenue-value">{formatCurrency(item.revenue)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <div className="activity-card">
                <h3>Recent Bookings</h3>
                <div className="activity-list">
                  {stats.recentBookings.map(booking => (
                    <div key={booking.id} className="activity-item">
                      <div className="activity-info">
                        <div className="activity-title">{booking.customer_name}</div>
                        <div className="activity-details">{booking.service_type} - {booking.date} {booking.time_slot}</div>
                      </div>
                      <div 
                        className="activity-status"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {booking.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="activity-card">
                <h3>Recent Orders</h3>
                <div className="activity-list">
                  {stats.recentOrders.map(order => (
                    <div key={order.id} className="activity-item">
                      <div className="activity-info">
                        <div className="activity-title">{order.customer_name}</div>
                        <div className="activity-details">{formatDate(order.created_at)}</div>
                      </div>
                      <div className="activity-amount">{formatCurrency(order.total_amount)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="activity-card">
                <h3>Recent Reviews</h3>
                <div className="activity-list">
                  {stats.recentReviews.map(review => (
                    <div key={review.id} className="activity-item">
                      <div className="activity-info">
                        <div className="activity-title">{review.customer_name}</div>
                        <div className="activity-details">{review.service_name || 'Service Review'}</div>
                      </div>
                      <div className="activity-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < review.rating ? 'star-filled' : 'star-empty'}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would go here */}
        {activeTab !== 'overview' && (
          <div className="dashboard-content">
            <div className="coming-soon">
              <FaCog className="coming-soon-icon" />
              <h3>Coming Soon</h3>
              <p>This section is under development. More detailed management features will be available soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
