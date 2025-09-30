const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Get all services
router.get('/', (req, res) => {
  const query = `
    SELECT 
      id, name, description, base_price, duration_minutes, category, 
      vehicle_types, requirements, image_url, is_active,
      created_at, updated_at
    FROM services 
    WHERE is_active = 1
    ORDER BY category, name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch services'
      });
    }

    // Parse JSON fields
    const services = rows.map(service => ({
      ...service,
      vehicle_types: JSON.parse(service.vehicle_types || '[]'),
      requirements: JSON.parse(service.requirements || '[]')
    }));

    res.json({
      success: true,
      services
    });
  });
});

// Get service by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      id, name, description, base_price, duration_minutes, category, 
      vehicle_types, requirements, image_url, is_active,
      created_at, updated_at
    FROM services 
    WHERE id = ? AND is_active = 1
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch service'
      });
    }

    if (!row) {
      return res.status(404).json({
        error: 'Service not found',
        message: 'No active service found with the given ID'
      });
    }

    // Parse JSON fields
    const service = {
      ...row,
      vehicle_types: JSON.parse(row.vehicle_types || '[]'),
      requirements: JSON.parse(row.requirements || '[]')
    };

    res.json({
      success: true,
      service
    });
  });
});

// Get services by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params;

  const query = `
    SELECT 
      id, name, description, base_price, duration_minutes, category, 
      vehicle_types, requirements, image_url, is_active,
      created_at, updated_at
    FROM services 
    WHERE category = ? AND is_active = 1
    ORDER BY name
  `;

  db.all(query, [category], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch services by category'
      });
    }

    // Parse JSON fields
    const services = rows.map(service => ({
      ...service,
      vehicle_types: JSON.parse(service.vehicle_types || '[]'),
      requirements: JSON.parse(service.requirements || '[]')
    }));

    res.json({
      success: true,
      services
    });
  });
});

// Get all service categories
router.get('/categories/list', (req, res) => {
  const query = `
    SELECT DISTINCT category
    FROM services
    WHERE is_active = 1
    ORDER BY category
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch service categories'
      });
    }

    const categories = rows.map(row => row.category);
    
    res.json({
      success: true,
      categories
    });
  });
});

// Calculate dynamic pricing based on vehicle type
router.post('/calculate-price', (req, res) => {
  const { serviceId, vehicleType } = req.body;

  if (!serviceId || !vehicleType) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'serviceId and vehicleType are required'
    });
  }

  const query = `
    SELECT base_price, vehicle_types
    FROM services 
    WHERE id = ? AND is_active = 1
  `;

  db.get(query, [serviceId], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to calculate price'
      });
    }

    if (!row) {
      return res.status(404).json({
        error: 'Service not found',
        message: 'No active service found with the given ID'
      });
    }

    const vehicleTypes = JSON.parse(row.vehicle_types || '[]');
    if (!vehicleTypes.includes(vehicleType)) {
      return res.status(400).json({
        error: 'Invalid vehicle type',
        message: 'Vehicle type not supported for this service'
      });
    }

    // Dynamic pricing based on vehicle type
    let multiplier = 1.0;
    switch (vehicleType) {
      case 'sedan':
        multiplier = 1.0;
        break;
      case 'suv':
        multiplier = 1.3;
        break;
      case 'truck':
        multiplier = 1.5;
        break;
      default:
        multiplier = 1.0;
    }

    const finalPrice = row.base_price * multiplier;

    res.json({
      success: true,
      basePrice: row.base_price,
      vehicleType,
      multiplier,
      finalPrice: Math.round(finalPrice * 100) / 100
    });
  });
});

// Create new service (admin endpoint)
router.post('/', (req, res) => {
  const { name, description, base_price, duration_minutes, category, vehicle_types, requirements, image_url } = req.body;

  // Validate required fields
  if (!name || !base_price || !duration_minutes || !category) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Name, base_price, duration_minutes, and category are required'
    });
  }

  // Validate price
  if (isNaN(base_price) || base_price <= 0) {
    return res.status(400).json({
      error: 'Invalid price',
      message: 'Base price must be a positive number'
    });
  }

  const stmt = db.prepare(`
    INSERT INTO services (name, description, base_price, duration_minutes, category, vehicle_types, requirements, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    name, 
    description || null, 
    base_price, 
    duration_minutes, 
    category, 
    JSON.stringify(vehicle_types || []), 
    JSON.stringify(requirements || []), 
    image_url || null, 
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to create service'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        serviceId: this.lastID
      });
    }
  );

  stmt.finalize();
});

// Update service (admin endpoint)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, base_price, duration_minutes, category, vehicle_types, requirements, image_url, is_active } = req.body;

  const stmt = db.prepare(`
    UPDATE services 
    SET name = ?, description = ?, base_price = ?, duration_minutes = ?, category = ?, 
        vehicle_types = ?, requirements = ?, image_url = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    name, description, base_price, duration_minutes, category, 
    JSON.stringify(vehicle_types || []), JSON.stringify(requirements || []), image_url, is_active, id, 
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update service'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: 'Service not found',
          message: 'No service found with the given ID'
        });
      }

      res.json({
        success: true,
        message: 'Service updated successfully'
      });
    }
  );

  stmt.finalize();
});

// Delete service (admin endpoint)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('UPDATE services SET is_active = 0 WHERE id = ?');

  stmt.run(id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete service'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Service not found',
        message: 'No service found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  });

  stmt.finalize();
});

module.exports = router;
