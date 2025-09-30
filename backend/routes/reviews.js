const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Get all reviews
router.get('/', (req, res) => {
  const { service_id, rating, is_approved } = req.query;
  
  let query = `
    SELECT 
      r.id, r.customer_id, r.customer_name, r.customer_email, r.service_id, r.booking_id,
      r.rating, r.title, r.comment, r.photos, r.is_verified, r.is_approved, r.created_at,
      s.name as service_name, s.category,
      b.service_type, b.date
    FROM reviews r
    LEFT JOIN services s ON r.service_id = s.id
    LEFT JOIN bookings b ON r.booking_id = b.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (service_id) {
    query += ' AND r.service_id = ?';
    params.push(service_id);
  }
  
  if (rating) {
    query += ' AND r.rating = ?';
    params.push(rating);
  }
  
  if (is_approved !== undefined) {
    query += ' AND r.is_approved = ?';
    params.push(is_approved === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY r.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch reviews'
      });
    }

    // Parse JSON fields
    const reviews = rows.map(review => ({
      ...review,
      photos: JSON.parse(review.photos || '[]')
    }));

    res.json({
      success: true,
      reviews
    });
  });
});

// Get review by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      r.id, r.customer_id, r.customer_name, r.customer_email, r.service_id, r.booking_id,
      r.rating, r.title, r.comment, r.photos, r.is_verified, r.is_approved, r.created_at,
      s.name as service_name, s.category,
      b.service_type, b.date
    FROM reviews r
    LEFT JOIN services s ON r.service_id = s.id
    LEFT JOIN bookings b ON r.booking_id = b.id
    WHERE r.id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch review'
      });
    }

    if (!row) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'No review found with the given ID'
      });
    }

    // Parse JSON fields
    const review = {
      ...row,
      photos: JSON.parse(row.photos || '[]')
    };

    res.json({
      success: true,
      review
    });
  });
});

// Get reviews for a specific service
router.get('/service/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  const { rating, limit = 10, offset = 0 } = req.query;

  let query = `
    SELECT 
      r.id, r.customer_name, r.rating, r.title, r.comment, r.photos, 
      r.is_verified, r.created_at
    FROM reviews r
    WHERE r.service_id = ? AND r.is_approved = 1
  `;
  
  const params = [serviceId];
  
  if (rating) {
    query += ' AND r.rating = ?';
    params.push(rating);
  }
  
  query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch service reviews'
      });
    }

    // Parse JSON fields
    const reviews = rows.map(review => ({
      ...review,
      photos: JSON.parse(review.photos || '[]')
    }));

    // Get review statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews 
      WHERE service_id = ? AND is_approved = 1
    `;

    db.get(statsQuery, [serviceId], (err, stats) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to fetch review statistics'
        });
      }

      res.json({
        success: true,
        reviews,
        statistics: {
          totalReviews: stats.total_reviews,
          averageRating: Math.round(stats.average_rating * 10) / 10 || 0,
          ratingDistribution: {
            5: stats.five_star,
            4: stats.four_star,
            3: stats.three_star,
            2: stats.two_star,
            1: stats.one_star
          }
        }
      });
    });
  });
});

// Create new review
router.post('/', (req, res) => {
  const { 
    customer_name, customer_email, service_id, booking_id, 
    rating, title, comment, photos 
  } = req.body;

  // Validate required fields
  if (!customer_name || !customer_email || !rating) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Customer name, email, and rating are required'
    });
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      error: 'Invalid rating',
      message: 'Rating must be between 1 and 5'
    });
  }

  // Check if customer already reviewed this service
  const checkQuery = `
    SELECT id FROM reviews 
    WHERE customer_email = ? AND service_id = ?
  `;

  db.get(checkQuery, [customer_email, service_id], (err, existingReview) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check existing review'
      });
    }

    if (existingReview) {
      return res.status(409).json({
        error: 'Review already exists',
        message: 'You have already reviewed this service'
      });
    }

    // Get customer ID if exists
    const customerQuery = 'SELECT id FROM customers WHERE email = ?';
    
    db.get(customerQuery, [customer_email], (err, customer) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to check customer'
        });
      }

      const stmt = db.prepare(`
        INSERT INTO reviews (customer_id, customer_name, customer_email, service_id, booking_id, rating, title, comment, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        customer ? customer.id : null,
        customer_name,
        customer_email,
        service_id || null,
        booking_id || null,
        rating,
        title || null,
        comment || null,
        JSON.stringify(photos || []),
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              error: 'Database error',
              message: 'Failed to create review'
            });
          }

          res.status(201).json({
            success: true,
            message: 'Review submitted successfully',
            reviewId: this.lastID
          });
        }
      );

      stmt.finalize();
    });
  });
});

// Update review approval status (admin endpoint)
router.put('/:id/approve', (req, res) => {
  const { id } = req.params;
  const { is_approved } = req.body;

  const stmt = db.prepare('UPDATE reviews SET is_approved = ? WHERE id = ?');

  stmt.run(is_approved ? 1 : 0, id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update review approval'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'No review found with the given ID'
      });
    }

    res.json({
      success: true,
      message: `Review ${is_approved ? 'approved' : 'rejected'} successfully`
    });
  });

  stmt.finalize();
});

// Update review (customer endpoint)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { rating, title, comment, photos } = req.body;

  // Validate rating if provided
  if (rating && (rating < 1 || rating > 5)) {
    return res.status(400).json({
      error: 'Invalid rating',
      message: 'Rating must be between 1 and 5'
    });
  }

  const stmt = db.prepare(`
    UPDATE reviews 
    SET rating = COALESCE(?, rating), 
        title = COALESCE(?, title), 
        comment = COALESCE(?, comment), 
        photos = COALESCE(?, photos)
    WHERE id = ?
  `);

  stmt.run(
    rating || null,
    title || null,
    comment || null,
    photos ? JSON.stringify(photos) : null,
    id,
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update review'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: 'Review not found',
          message: 'No review found with the given ID'
        });
      }

      res.json({
        success: true,
        message: 'Review updated successfully'
      });
    }
  );

  stmt.finalize();
});

// Delete review
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM reviews WHERE id = ?');

  stmt.run(id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete review'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Review not found',
        message: 'No review found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  });

  stmt.finalize();
});

// Get pending reviews (admin endpoint)
router.get('/admin/pending', (req, res) => {
  const query = `
    SELECT 
      r.id, r.customer_name, r.customer_email, r.service_id, r.booking_id,
      r.rating, r.title, r.comment, r.photos, r.is_verified, r.created_at,
      s.name as service_name, s.category,
      b.service_type, b.date
    FROM reviews r
    LEFT JOIN services s ON r.service_id = s.id
    LEFT JOIN bookings b ON r.booking_id = b.id
    WHERE r.is_approved = 0
    ORDER BY r.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch pending reviews'
      });
    }

    // Parse JSON fields
    const reviews = rows.map(review => ({
      ...review,
      photos: JSON.parse(review.photos || '[]')
    }));

    res.json({
      success: true,
      reviews
    });
  });
});

module.exports = router;
