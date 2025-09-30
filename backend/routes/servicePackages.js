const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Get all service packages
router.get('/', (req, res) => {
  const query = `
    SELECT 
      id, name, description, base_price, duration_minutes, services, 
      discount_percentage, image_url, is_popular, is_active,
      created_at, updated_at
    FROM service_packages 
    WHERE is_active = 1
    ORDER BY is_popular DESC, name
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch service packages'
      });
    }

    // Parse JSON fields and calculate final price
    const packages = rows.map(pkg => {
      const services = JSON.parse(pkg.services || '[]');
      const finalPrice = pkg.base_price * (1 - pkg.discount_percentage / 100);
      
      return {
        ...pkg,
        services,
        finalPrice: Math.round(finalPrice * 100) / 100,
        savings: pkg.base_price - finalPrice
      };
    });

    res.json({
      success: true,
      packages
    });
  });
});

// Get service package by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT 
      id, name, description, base_price, duration_minutes, services, 
      discount_percentage, image_url, is_popular, is_active,
      created_at, updated_at
    FROM service_packages 
    WHERE id = ? AND is_active = 1
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch service package'
      });
    }

    if (!row) {
      return res.status(404).json({
        error: 'Service package not found',
        message: 'No active service package found with the given ID'
      });
    }

    const services = JSON.parse(row.services || '[]');
    const finalPrice = row.base_price * (1 - row.discount_percentage / 100);

    const package = {
      ...row,
      services,
      finalPrice: Math.round(finalPrice * 100) / 100,
      savings: row.base_price - finalPrice
    };

    res.json({
      success: true,
      package
    });
  });
});

// Get package details with included services
router.get('/:id/details', (req, res) => {
  const { id } = req.params;

  const packageQuery = `
    SELECT 
      id, name, description, base_price, duration_minutes, services, 
      discount_percentage, image_url, is_popular, is_active
    FROM service_packages 
    WHERE id = ? AND is_active = 1
  `;

  db.get(packageQuery, [id], (err, packageRow) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch service package'
      });
    }

    if (!packageRow) {
      return res.status(404).json({
        error: 'Service package not found',
        message: 'No active service package found with the given ID'
      });
    }

    const serviceIds = JSON.parse(packageRow.services || '[]');
    
    if (serviceIds.length === 0) {
      return res.json({
        success: true,
        package: packageRow,
        includedServices: []
      });
    }

    // Get details of included services
    const placeholders = serviceIds.map(() => '?').join(',');
    const servicesQuery = `
      SELECT id, name, description, base_price, duration_minutes, category
      FROM services 
      WHERE id IN (${placeholders}) AND is_active = 1
    `;

    db.all(servicesQuery, serviceIds, (err, serviceRows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to fetch included services'
        });
      }

      const finalPrice = packageRow.base_price * (1 - packageRow.discount_percentage / 100);
      const totalIndividualPrice = serviceRows.reduce((sum, service) => sum + service.base_price, 0);

      const packageDetails = {
        ...packageRow,
        services: serviceIds,
        finalPrice: Math.round(finalPrice * 100) / 100,
        savings: packageRow.base_price - finalPrice,
        totalIndividualPrice,
        individualSavings: totalIndividualPrice - finalPrice
      };

      res.json({
        success: true,
        package: packageDetails,
        includedServices: serviceRows
      });
    });
  });
});

// Calculate dynamic pricing for package based on vehicle type
router.post('/:id/calculate-price', (req, res) => {
  const { id } = req.params;
  const { vehicleType } = req.body;

  if (!vehicleType) {
    return res.status(400).json({
      error: 'Missing required field',
      message: 'vehicleType is required'
    });
  }

  const packageQuery = `
    SELECT base_price, discount_percentage, services
    FROM service_packages 
    WHERE id = ? AND is_active = 1
  `;

  db.get(packageQuery, [id], (err, packageRow) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to calculate package price'
      });
    }

    if (!packageRow) {
      return res.status(404).json({
        error: 'Service package not found',
        message: 'No active service package found with the given ID'
      });
    }

    const serviceIds = JSON.parse(packageRow.services || '[]');
    
    // Get services to calculate individual pricing
    const placeholders = serviceIds.map(() => '?').join(',');
    const servicesQuery = `
      SELECT base_price, vehicle_types
      FROM services 
      WHERE id IN (${placeholders}) AND is_active = 1
    `;

    db.all(servicesQuery, serviceIds, (err, serviceRows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to calculate individual service prices'
        });
      }

      // Calculate vehicle type multiplier
      let vehicleMultiplier = 1.0;
      switch (vehicleType) {
        case 'sedan':
          vehicleMultiplier = 1.0;
          break;
        case 'suv':
          vehicleMultiplier = 1.3;
          break;
        case 'truck':
          vehicleMultiplier = 1.5;
          break;
        default:
          vehicleMultiplier = 1.0;
      }

      // Calculate total individual price with vehicle multiplier
      const totalIndividualPrice = serviceRows.reduce((sum, service) => {
        const vehicleTypes = JSON.parse(service.vehicle_types || '[]');
        if (vehicleTypes.includes(vehicleType)) {
          return sum + (service.base_price * vehicleMultiplier);
        }
        return sum;
      }, 0);

      // Calculate package price with vehicle multiplier and discount
      const adjustedPackagePrice = packageRow.base_price * vehicleMultiplier;
      const finalPackagePrice = adjustedPackagePrice * (1 - packageRow.discount_percentage / 100);

      res.json({
        success: true,
        vehicleType,
        vehicleMultiplier,
        packagePrice: {
          basePrice: packageRow.base_price,
          adjustedPrice: Math.round(adjustedPackagePrice * 100) / 100,
          finalPrice: Math.round(finalPackagePrice * 100) / 100,
          discountPercentage: packageRow.discount_percentage,
          savings: adjustedPackagePrice - finalPackagePrice
        },
        individualPricing: {
          totalPrice: Math.round(totalIndividualPrice * 100) / 100,
          finalPrice: Math.round(finalPackagePrice * 100) / 100,
          savings: Math.round((totalIndividualPrice - finalPackagePrice) * 100) / 100
        }
      });
    });
  });
});

// Create new service package (admin endpoint)
router.post('/', (req, res) => {
  const { name, description, base_price, duration_minutes, services, discount_percentage, image_url, is_popular } = req.body;

  // Validate required fields
  if (!name || !base_price || !duration_minutes || !services) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Name, base_price, duration_minutes, and services are required'
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
    INSERT INTO service_packages (name, description, base_price, duration_minutes, services, discount_percentage, image_url, is_popular)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    name, 
    description || null, 
    base_price, 
    duration_minutes, 
    JSON.stringify(services), 
    discount_percentage || 0, 
    image_url || null, 
    is_popular || 0, 
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to create service package'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Service package created successfully',
        packageId: this.lastID
      });
    }
  );

  stmt.finalize();
});

// Update service package (admin endpoint)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, base_price, duration_minutes, services, discount_percentage, image_url, is_popular, is_active } = req.body;

  const stmt = db.prepare(`
    UPDATE service_packages 
    SET name = ?, description = ?, base_price = ?, duration_minutes = ?, services = ?, 
        discount_percentage = ?, image_url = ?, is_popular = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    name, description, base_price, duration_minutes, JSON.stringify(services), 
    discount_percentage || 0, image_url, is_popular || 0, is_active, id, 
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to update service package'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: 'Service package not found',
          message: 'No service package found with the given ID'
        });
      }

      res.json({
        success: true,
        message: 'Service package updated successfully'
      });
    }
  );

  stmt.finalize();
});

// Delete service package (admin endpoint)
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare('UPDATE service_packages SET is_active = 0 WHERE id = ?');

  stmt.run(id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to delete service package'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Service package not found',
        message: 'No service package found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Service package deleted successfully'
    });
  });

  stmt.finalize();
});

module.exports = router;
