const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Get all product bundles
router.get('/', (req, res) => {
  const query = `
    SELECT 
      id, name, description, bundle_price, individual_price, savings, 
      products, image_url, is_popular, is_active, created_at, updated_at
    FROM product_bundles 
    WHERE is_active = 1
    ORDER BY is_popular DESC, name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch product bundles'
      });
    }

    // Parse JSON fields
    const bundles = rows.map(bundle => ({
      ...bundle,
      products: JSON.parse(bundle.products || '[]'),
      savingsPercentage: Math.round((bundle.savings / bundle.individual_price) * 100)
    }));

    res.json({
      success: true,
      bundles
    });
  });
});

// Get product bundle by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      id, name, description, bundle_price, individual_price, savings, 
      products, image_url, is_popular, is_active, created_at, updated_at
    FROM product_bundles 
    WHERE id = ? AND is_active = 1
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch product bundle'
      });
    }

    if (!row) {
      return res.status(404).json({
        error: 'Product bundle not found',
        message: 'No active product bundle found with the given ID'
      });
    }

    // Parse JSON fields
    const bundle = {
      ...row,
      products: JSON.parse(row.products || '[]'),
      savingsPercentage: Math.round((row.savings / row.individual_price) * 100)
    };

    res.json({
      success: true,
      bundle
    });
  });
});

// Get bundle details with included products
router.get('/:id/details', (req, res) => {
  const { id } = req.params;

  const bundleQuery = `
    SELECT 
      id, name, description, bundle_price, individual_price, savings, 
      products, image_url, is_popular, is_active
    FROM product_bundles 
    WHERE id = ? AND is_active = 1
  `;

  db.get(bundleQuery, [id], (err, bundleRow) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch product bundle'
      });
    }

    if (!bundleRow) {
      return res.status(404).json({
        error: 'Product bundle not found',
        message: 'No active product bundle found with the given ID'
      });
    }

    const productIds = JSON.parse(bundleRow.products || '[]').map(item => item.product_id);
    
    if (productIds.length === 0) {
      return res.json({
        success: true,
        bundle: bundleRow,
        includedProducts: []
      });
    }

    // Get details of included products
    const placeholders = productIds.map(() => '?').join(',');
    const productsQuery = `
      SELECT id, name, description, price, category, stock
      FROM products 
      WHERE id IN (${placeholders}) AND stock > 0
    `;

    db.all(productsQuery, productIds, (err, productRows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to fetch included products'
        });
      }

      // Calculate total individual price
      const totalIndividualPrice = productRows.reduce((sum, product) => sum + product.price, 0);

      const bundleDetails = {
        ...bundleRow,
        products: JSON.parse(bundleRow.products || '[]'),
        savingsPercentage: Math.round((bundleRow.savings / bundleRow.individual_price) * 100),
        totalIndividualPrice,
        actualSavings: totalIndividualPrice - bundleRow.bundle_price
      };

      res.json({
        success: true,
        bundle: bundleDetails,
        includedProducts: productRows
      });
    });
  });
});

// Create new product bundle (admin endpoint)
router.post('/', (req, res) => {
  const { name, description, bundle_price, products, image_url, is_popular } = req.body;

  // Validate required fields
  if (!name || !bundle_price || !products || !Array.isArray(products)) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Name, bundle_price, and products array are required'
    });
  }

  // Validate price
  if (isNaN(bundle_price) || bundle_price <= 0) {
    return res.status(400).json({
      error: 'Invalid price',
      message: 'Bundle price must be a positive number'
    });
  }

  // Calculate individual price and savings
  const productIds = products.map(item => item.product_id);
  const placeholders = productIds.map(() => '?').join(',');
  
  const priceQuery = `
    SELECT id, price 
    FROM products 
    WHERE id IN (${placeholders})
  `;

  db.all(priceQuery, productIds, (err, priceRows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to calculate bundle pricing'
      });
    }

    if (priceRows.length !== products.length) {
      return res.status(400).json({
        error: 'Invalid products',
        message: 'Some products in the bundle are not found'
      });
    }

    // Calculate total individual price
    const individualPrice = products.reduce((total, bundleItem) => {
      const product = priceRows.find(p => p.id === bundleItem.product_id);
      return total + (product.price * bundleItem.quantity);
    }, 0);

    const savings = individualPrice - bundle_price;

    if (savings < 0) {
      return res.status(400).json({
        error: 'Invalid pricing',
        message: 'Bundle price cannot be higher than individual prices'
      });
    }

    const stmt = db.prepare(`
      INSERT INTO product_bundles (name, description, bundle_price, individual_price, savings, products, image_url, is_popular)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      name, 
      description || null, 
      bundle_price, 
      individualPrice, 
      savings, 
      JSON.stringify(products), 
      image_url || null, 
      is_popular || 0, 
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({
            error: 'Database error',
            message: 'Failed to create product bundle'
          });
        }

        res.status(201).json({
          success: true,
          message: 'Product bundle created successfully',
          bundleId: this.lastID,
          pricing: {
            bundlePrice: bundle_price,
            individualPrice,
            savings,
            savingsPercentage: Math.round((savings / individualPrice) * 100)
          }
        });
      }
    );

    stmt.finalize();
  });
});

// Update product bundle (admin endpoint)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, bundle_price, products, image_url, is_popular, is_active } = req.body;

  // If products are being updated, recalculate pricing
  if (products && Array.isArray(products)) {
    const productIds = products.map(item => item.product_id);
    const placeholders = productIds.map(() => '?').join(',');
    
    const priceQuery = `
      SELECT id, price 
      FROM products 
      WHERE id IN (${placeholders})
    `;

    db.all(priceQuery, productIds, (err, priceRows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to calculate bundle pricing'
        });
      }

      if (priceRows.length !== products.length) {
        return res.status(400).json({
          error: 'Invalid products',
          message: 'Some products in the bundle are not found'
        });
      }

      // Calculate new pricing
      const individualPrice = products.reduce((total, bundleItem) => {
        const product = priceRows.find(p => p.id === bundleItem.product_id);
        return total + (product.price * bundleItem.quantity);
      }, 0);

      const finalBundlePrice = bundle_price || individualPrice;
      const savings = individualPrice - finalBundlePrice;

      const stmt = db.prepare(`
        UPDATE product_bundles 
        SET name = COALESCE(?, name), 
            description = COALESCE(?, description), 
            bundle_price = COALESCE(?, bundle_price), 
            individual_price = ?, 
            savings = ?, 
            products = ?, 
            image_url = COALESCE(?, image_url), 
            is_popular = COALESCE(?, is_popular), 
            is_active = COALESCE(?, is_active), 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run(
        name, description, bundle_price, individualPrice, savings, 
        JSON.stringify(products), image_url, is_popular, is_active, id, 
        function(err) {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              error: 'Database error',
              message: 'Failed to update product bundle'
            });
          }

          if (this.changes === 0) {
            return res.status(404).json({
              error: 'Product bundle not found',
              message: 'No product bundle found with the given ID'
            });
          }

          res.json({
            success: true,
            message: 'Product bundle updated successfully'
          });
        }
      );

      stmt.finalize();
    });
  } else {
    // Update without changing products
    const stmt = db.prepare(`
      UPDATE product_bundles 
      SET name = COALESCE(?, name), 
          description = COALESCE(?, description), 
          bundle_price = COALESCE(?, bundle_price), 
          image_url = COALESCE(?, image_url), 
          is_popular = COALESCE(?, is_popular), 
          is_active = COALESCE(?, is_active), 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(name, description, bundle_price, image_url, is_popular, is_active, id, function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update product bundle'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: 'Product bundle not found',
          message: 'No product bundle found with the given ID'
        });
      }

      res.json({
        success: true,
        message: 'Product bundle updated successfully'
      });
    });

    stmt.finalize();
  }
});

// Delete product bundle (admin endpoint)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('UPDATE product_bundles SET is_active = 0 WHERE id = ?');

  stmt.run(id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete product bundle'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Product bundle not found',
        message: 'No product bundle found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Product bundle deleted successfully'
    });
  });

  stmt.finalize();
});

// Get popular bundles
router.get('/featured/popular', (req, res) => {
  const { limit = 3 } = req.query;

  const query = `
    SELECT 
      id, name, description, bundle_price, individual_price, savings, 
      products, image_url, is_popular
    FROM product_bundles 
    WHERE is_active = 1 AND is_popular = 1
    ORDER BY savings DESC
    LIMIT ?
  `;

  db.all(query, [parseInt(limit)], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch popular bundles'
      });
    }

    // Parse JSON fields
    const bundles = rows.map(bundle => ({
      ...bundle,
      products: JSON.parse(bundle.products || '[]'),
      savingsPercentage: Math.round((bundle.savings / bundle.individual_price) * 100)
    }));

    res.json({
      success: true,
      bundles
    });
  });
});

module.exports = router;
