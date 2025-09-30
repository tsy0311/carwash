const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Get all customers (admin endpoint)
router.get('/', (req, res) => {
  const query = `
    SELECT 
      id, name, email, phone, address, vehicle_make, vehicle_model, 
      vehicle_year, vehicle_color, loyalty_points, loyalty_tier, 
      total_spent, last_service_date, created_at, updated_at
    FROM customers 
    ORDER BY created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch customers'
      });
    }

    res.json({
      success: true,
      customers: rows
    });
  });
});

// Get customer by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      id, name, email, phone, address, vehicle_make, vehicle_model, 
      vehicle_year, vehicle_color, loyalty_points, loyalty_tier, 
      total_spent, last_service_date, created_at, updated_at
    FROM customers 
    WHERE id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch customer'
      });
    }

    if (!row) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'No customer found with the given ID'
      });
    }

    res.json({
      success: true,
      customer: row
    });
  });
});

// Get customer by email
router.get('/email/:email', (req, res) => {
  const { email } = req.params;

  const query = `
    SELECT 
      id, name, email, phone, address, vehicle_make, vehicle_model, 
      vehicle_year, vehicle_color, loyalty_points, loyalty_tier, 
      total_spent, last_service_date, created_at, updated_at
    FROM customers 
    WHERE email = ?
  `;

  db.get(query, [email], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch customer'
      });
    }

    if (!row) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'No customer found with the given email'
      });
    }

    res.json({
      success: true,
      customer: row
    });
  });
});

// Get customer service history
router.get('/:id/history', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      b.id, b.customer_name, b.customer_email, b.service_type, 
      b.date, b.time_slot, b.status, b.notes, b.created_at,
      s.name as service_name, s.category, s.base_price
    FROM bookings b
    LEFT JOIN services s ON b.service_type = s.name
    WHERE b.customer_email IN (
      SELECT email FROM customers WHERE id = ?
    )
    ORDER BY b.date DESC, b.time_slot DESC
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch customer history'
      });
    }

    res.json({
      success: true,
      history: rows
    });
  });
});

// Get customer loyalty transactions
router.get('/:id/loyalty', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      lt.id, lt.transaction_type, lt.points, lt.description, 
      lt.order_id, lt.booking_id, lt.created_at,
      b.service_type, b.date
    FROM loyalty_transactions lt
    LEFT JOIN bookings b ON lt.booking_id = b.id
    WHERE lt.customer_id = ?
    ORDER BY lt.created_at DESC
  `;

  db.all(query, [id], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch loyalty transactions'
      });
    }

    res.json({
      success: true,
      transactions: rows
    });
  });
});

// Create or update customer
router.post('/', (req, res) => {
  const { 
    name, email, phone, address, vehicle_make, vehicle_model, 
    vehicle_year, vehicle_color 
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Name and email are required'
    });
  }

  // Check if customer already exists
  const checkQuery = 'SELECT id FROM customers WHERE email = ?';
  
  db.get(checkQuery, [email], (err, existingCustomer) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to check existing customer'
      });
    }

    if (existingCustomer) {
      // Update existing customer
      const updateQuery = `
        UPDATE customers 
        SET name = ?, phone = ?, address = ?, vehicle_make = ?, 
            vehicle_model = ?, vehicle_year = ?, vehicle_color = ?, 
            updated_at = CURRENT_TIMESTAMP
        WHERE email = ?
      `;

      db.run(updateQuery, [
        name, phone || null, address || null, vehicle_make || null, 
        vehicle_model || null, vehicle_year || null, vehicle_color || null, email
      ], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            error: 'Database error',
            message: 'Failed to update customer'
          });
        }

        res.json({
          success: true,
          message: 'Customer updated successfully',
          customerId: existingCustomer.id,
          isNew: false
        });
      });
    } else {
      // Create new customer
      const insertQuery = `
        INSERT INTO customers (name, email, phone, address, vehicle_make, vehicle_model, vehicle_year, vehicle_color)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(insertQuery, [
        name, email, phone || null, address || null, vehicle_make || null, 
        vehicle_model || null, vehicle_year || null, vehicle_color || null
      ], function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            error: 'Database error',
            message: 'Failed to create customer'
          });
        }

        res.status(201).json({
          success: true,
          message: 'Customer created successfully',
          customerId: this.lastID,
          isNew: true
        });
      });
    }
  });
});

// Update customer loyalty points
router.post('/:id/loyalty/update', (req, res) => {
  const { id } = req.params;
  const { points, transaction_type, description, order_id, booking_id } = req.body;

  if (!points || !transaction_type) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Points and transaction_type are required'
    });
  }

  // Start transaction
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Update customer loyalty points
    const updateCustomerQuery = `
      UPDATE customers 
      SET loyalty_points = loyalty_points + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(updateCustomerQuery, [points, id], function(err) {
      if (err) {
        console.error('Database error:', err);
        db.run('ROLLBACK');
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update loyalty points'
        });
      }

      if (this.changes === 0) {
        db.run('ROLLBACK');
        return res.status(404).json({
          error: 'Customer not found',
          message: 'No customer found with the given ID'
        });
      }

      // Add loyalty transaction record
      const insertTransactionQuery = `
        INSERT INTO loyalty_transactions (customer_id, transaction_type, points, description, order_id, booking_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(insertTransactionQuery, [
        id, transaction_type, points, description || null, order_id || null, booking_id || null
      ], function(err) {
        if (err) {
          console.error('Database error:', err);
          db.run('ROLLBACK');
          return res.status(500).json({
            error: 'Database error',
            message: 'Failed to record loyalty transaction'
          });
        }

        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              error: 'Database error',
              message: 'Failed to commit transaction'
            });
          }

          res.json({
            success: true,
            message: 'Loyalty points updated successfully',
            transactionId: this.lastID
          });
        });
      });
    });
  });
});

// Update customer loyalty tier
router.post('/:id/tier/update', (req, res) => {
  const { id } = req.params;

  // Get customer current loyalty points and spending
  const customerQuery = `
    SELECT loyalty_points, total_spent
    FROM customers 
    WHERE id = ?
  `;

  db.get(customerQuery, [id], (err, customer) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch customer data'
      });
    }

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'No customer found with the given ID'
      });
    }

    // Calculate new tier based on points and spending
    let newTier = 'Bronze';
    if (customer.loyalty_points >= 1000 || customer.total_spent >= 500) {
      newTier = 'Gold';
    } else if (customer.loyalty_points >= 500 || customer.total_spent >= 250) {
      newTier = 'Silver';
    }

    // Update customer tier
    const updateQuery = `
      UPDATE customers 
      SET loyalty_tier = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(updateQuery, [newTier, id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update loyalty tier'
        });
      }

      res.json({
        success: true,
        message: 'Loyalty tier updated successfully',
        newTier,
        loyaltyPoints: customer.loyalty_points,
        totalSpent: customer.total_spent
      });
    });
  });
});

// Update customer total spent
router.post('/:id/spending/update', (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount)) {
    return res.status(400).json({
      error: 'Invalid amount',
      message: 'Amount must be a valid number'
    });
  }

  const updateQuery = `
    UPDATE customers 
    SET total_spent = total_spent + ?, last_service_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(updateQuery, [amount, id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update spending'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'No customer found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Spending updated successfully'
    });
  });
});

// Delete customer (admin endpoint)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM customers WHERE id = ?');

  stmt.run(id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete customer'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Customer not found',
        message: 'No customer found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  });

  stmt.finalize();
});

module.exports = router;
