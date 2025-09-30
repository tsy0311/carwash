const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init');
const { sendEmail } = require('../services/emailService');

// Create new order
router.post('/', async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, items } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Customer name, email, and items are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { productId, quantity } = item;
      
      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({
          error: 'Invalid item data',
          message: 'Each item must have a valid product ID and quantity'
        });
      }

      // Get product details
      const product = await new Promise((resolve, reject) => {
        db.get('SELECT id, name, price, stock FROM products WHERE id = ?', [productId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!product) {
        return res.status(400).json({
          error: 'Product not found',
          message: `Product with ID ${productId} not found`
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          message: `Only ${product.stock} units available for ${product.name}`
        });
      }

      const itemTotal = product.price * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        total: itemTotal
      });
    }

    // Generate order ID
    const orderId = uuidv4();

    // Start transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Insert order
      const orderStmt = db.prepare(`
        INSERT INTO orders (id, customer_name, customer_email, customer_phone, total_amount)
        VALUES (?, ?, ?, ?, ?)
      `);

      orderStmt.run(orderId, customerName, customerEmail, customerPhone || null, totalAmount);

      // Insert order items
      const itemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `);

      for (const item of orderItems) {
        itemStmt.run(orderId, item.productId, item.quantity, item.price);
      }

      // Update product stock
      const stockStmt = db.prepare(`
        UPDATE products 
        SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      for (const item of orderItems) {
        stockStmt.run(item.quantity, item.productId);
      }

      db.run('COMMIT', (err) => {
        if (err) {
          console.error('Transaction error:', err);
          db.run('ROLLBACK');
          return res.status(500).json({
            error: 'Order creation failed',
            message: 'Failed to process order'
          });
        }

        // Send confirmation email
        const emailData = {
          to: customerEmail,
          subject: `Order Confirmation - ${orderId}`,
          template: 'orderConfirmation',
          data: {
            orderId,
            customerName,
            customerEmail,
            totalAmount: totalAmount.toFixed(2),
            orderDate: new Date().toLocaleDateString(),
            items: orderItems
          }
        };

        sendEmail(emailData).catch(error => {
          console.error('Failed to send order confirmation email:', error);
        });

        res.status(201).json({
          success: true,
          message: 'Order created successfully',
          order: {
            id: orderId,
            customerName,
            customerEmail,
            totalAmount,
            items: orderItems
          }
        });
      });

      orderStmt.finalize();
      itemStmt.finalize();
      stockStmt.finalize();
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: 'Order creation failed',
      message: 'Please try again'
    });
  }
});

// Get order by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  // Get order details
  const orderQuery = `
    SELECT id, customer_name, customer_email, customer_phone, total_amount, status, created_at
    FROM orders
    WHERE id = ?
  `;

  db.get(orderQuery, [id], (err, order) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch order'
      });
    }

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with the given ID'
      });
    }

    // Get order items
    const itemsQuery = `
      SELECT oi.quantity, oi.price, p.name, p.description
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;

    db.all(itemsQuery, [id], (err, items) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to fetch order items'
        });
      }

      res.json({
        success: true,
        order: {
          ...order,
          items
        }
      });
    });
  });
});

// Get all orders (admin endpoint)
router.get('/', (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;

  let query = `
    SELECT id, customer_name, customer_email, customer_phone, total_amount, status, created_at
    FROM orders
  `;
  const params = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch orders'
      });
    }

    res.json({
      success: true,
      orders: rows
    });
  });
});

// Update order status (admin endpoint)
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      message: 'Status must be pending, processing, shipped, delivered, or cancelled'
    });
  }

  const stmt = db.prepare(`
    UPDATE orders 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(status, id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update order status'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Order not found',
        message: 'No order found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  });

  stmt.finalize();
});

module.exports = router;
