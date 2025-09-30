const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Get all products
router.get('/', (req, res) => {
  const query = `
    SELECT 
      p.id, p.name, p.description, p.price, p.image_url, p.category, p.stock,
      IFNULL(SUM(oi.quantity), 0) AS sold
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    GROUP BY p.id
    ORDER BY p.category, p.name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch products'
      });
    }

    res.json({
      success: true,
      products: rows
    });
  });
});

// Get product by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      p.id, p.name, p.description, p.price, p.image_url, p.category, p.stock,
      IFNULL((SELECT SUM(oi.quantity) FROM order_items oi WHERE oi.product_id = p.id), 0) AS sold
    FROM products p
    WHERE p.id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch product'
      });
    }

    if (!row) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the given ID'
      });
    }

    res.json({
      success: true,
      product: row
    });
  });
});

// Get products by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params;

  const query = `
    SELECT 
      p.id, p.name, p.description, p.price, p.image_url, p.category, p.stock,
      IFNULL(SUM(oi.quantity), 0) AS sold
    FROM products p
    LEFT JOIN order_items oi ON oi.product_id = p.id
    WHERE p.category = ?
    GROUP BY p.id
    ORDER BY p.name
  `;

  db.all(query, [category], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch products by category'
      });
    }

    res.json({
      success: true,
      products: rows
    });
  });
});

// Get all categories
router.get('/categories/list', (req, res) => {
  const query = `
    SELECT DISTINCT category
    FROM products
    ORDER BY category
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch categories'
      });
    }

    const categories = rows.map(row => row.category);
    
    res.json({
      success: true,
      categories
    });
  });
});

// Create new product (admin endpoint)
router.post('/', (req, res) => {
  const { name, description, price, image_url, category, stock } = req.body;

  // Validate required fields
  if (!name || !price || !category) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Name, price, and category are required'
    });
  }

  // Validate price
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({
      error: 'Invalid price',
      message: 'Price must be a positive number'
    });
  }

  const stmt = db.prepare(`
    INSERT INTO products (name, description, price, image_url, category, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(name, description || null, price, image_url || null, category, stock || 0, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to create product'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: this.lastID
    });
  });

  stmt.finalize();
});

// Update product (admin endpoint)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category, stock } = req.body;

  const stmt = db.prepare(`
    UPDATE products 
    SET name = ?, description = ?, price = ?, image_url = ?, category = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(name, description, price, image_url, category, stock, id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update product'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  });

  stmt.finalize();
});

// Delete product (admin endpoint)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('DELETE FROM products WHERE id = ?');

  stmt.run(id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete product'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  });

  stmt.finalize();
});

module.exports = router;
