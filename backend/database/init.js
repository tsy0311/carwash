const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('../config');

const dbPath = path.resolve(__dirname, '..', config.DB_PATH);
console.log('📁 Database path:', dbPath);
console.log('📁 Current directory:', __dirname);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          image_url TEXT,
          category TEXT,
          stock INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Bookings table
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT,
          service_type TEXT,
          date TEXT NOT NULL,              -- YYYY-MM-DD
          time_slot TEXT NOT NULL,         -- e.g., 09:00, 10:00
          status TEXT DEFAULT 'pending',   -- pending | confirmed | cancelled
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Order items table
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id TEXT NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Contact messages table
      db.run(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          service_type TEXT,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'unread',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Services table
      db.run(`
        CREATE TABLE IF NOT EXISTS services (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          duration_minutes INTEGER NOT NULL,
          category TEXT NOT NULL,
          vehicle_types TEXT, -- JSON array: ["sedan", "suv", "truck"]
          requirements TEXT, -- JSON array of requirements
          image_url TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Service packages table
      db.run(`
        CREATE TABLE IF NOT EXISTS service_packages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          base_price DECIMAL(10,2) NOT NULL,
          duration_minutes INTEGER NOT NULL,
          services TEXT, -- JSON array of service IDs
          discount_percentage DECIMAL(5,2) DEFAULT 0,
          image_url TEXT,
          is_popular BOOLEAN DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Customers table
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          address TEXT,
          vehicle_make TEXT,
          vehicle_model TEXT,
          vehicle_year INTEGER,
          vehicle_color TEXT,
          loyalty_points INTEGER DEFAULT 0,
          loyalty_tier TEXT DEFAULT 'Bronze',
          total_spent DECIMAL(10,2) DEFAULT 0,
          last_service_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Reviews table
      db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          service_id INTEGER,
          booking_id INTEGER,
          rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
          title TEXT,
          comment TEXT,
          photos TEXT, -- JSON array of photo URLs
          is_verified BOOLEAN DEFAULT 0,
          is_approved BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers (id),
          FOREIGN KEY (service_id) REFERENCES services (id),
          FOREIGN KEY (booking_id) REFERENCES bookings (id)
        )
      `);

      // Loyalty transactions table
      db.run(`
        CREATE TABLE IF NOT EXISTS loyalty_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER NOT NULL,
          transaction_type TEXT NOT NULL, -- 'earn', 'redeem', 'adjustment'
          points INTEGER NOT NULL,
          description TEXT,
          order_id TEXT,
          booking_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers (id),
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (booking_id) REFERENCES bookings (id)
        )
      `);

      // Product bundles table
      db.run(`
        CREATE TABLE IF NOT EXISTS product_bundles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          bundle_price DECIMAL(10,2) NOT NULL,
          individual_price DECIMAL(10,2) NOT NULL,
          savings DECIMAL(10,2) NOT NULL,
          products TEXT, -- JSON array of product IDs with quantities
          image_url TEXT,
          is_popular BOOLEAN DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating tables:', err.message);
          reject(err);
        } else {
          console.log('Database tables initialized successfully');
          // Insert sample data
          insertSampleData()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  });
};

// Insert sample data
const insertSampleData = () => {
  return new Promise((resolve, reject) => {
    const products = [
      {
        name: 'Koch Chemie Car Soap',
        description: 'Premium pH-neutral shampoo that safely cleans without stripping wax or sealants.',
        price: 24.99,
        category: 'Cleaning',
        stock: 50
      },
      {
        name: 'Quick Detailer Spray',
        description: 'Spray wax and detailer in one for maintaining that just-detailed look between washes.',
        price: 18.99,
        category: 'Detailing',
        stock: 30
      },
      {
        name: 'Wheel Cleaner',
        description: 'Powerful yet safe cleaner that removes brake dust and grime from all wheel types.',
        price: 22.99,
        category: 'Cleaning',
        stock: 25
      },
      {
        name: 'Ceramic Coating Kit',
        description: 'Professional-grade ceramic coating that provides long-lasting protection for your paint.',
        price: 89.99,
        category: 'Protection',
        stock: 15
      },
      {
        name: 'Microfiber Towels (6-pack)',
        description: 'Premium ultra-soft microfiber towels for safe washing and drying.',
        price: 19.99,
        category: 'Accessories',
        stock: 40
      },
      {
        name: 'Leather Conditioner',
        description: 'Restores and protects leather surfaces with UV protection.',
        price: 26.99,
        category: 'Interior',
        stock: 20
      }
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO products (name, description, price, category, stock)
      VALUES (?, ?, ?, ?, ?)
    `);

    products.forEach(product => {
      stmt.run(product.name, product.description, product.price, product.category, product.stock);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error inserting sample products:', err.message);
        reject(err);
      } else {
        console.log('Sample products inserted successfully');
        
        // Insert sample services
        insertSampleServices()
          .then(() => insertSampleServicePackages())
          .then(() => insertSampleProductBundles())
          .then(() => resolve())
          .catch(reject);
      }
    });
  });
};

// Insert sample services
const insertSampleServices = () => {
  return new Promise((resolve, reject) => {
    const services = [
      {
        name: 'Basic Car Wash',
        description: 'Exterior wash, wheel cleaning, and basic interior vacuum',
        base_price: 25.00,
        duration_minutes: 45,
        category: 'Wash',
        vehicle_types: JSON.stringify(['sedan', 'suv', 'truck']),
        requirements: JSON.stringify(['Water access', 'Parking space'])
      },
      {
        name: 'Premium Detailing',
        description: 'Full exterior wash, wax, interior cleaning, and tire shine',
        base_price: 85.00,
        duration_minutes: 120,
        category: 'Detailing',
        vehicle_types: JSON.stringify(['sedan', 'suv', 'truck']),
        requirements: JSON.stringify(['Water access', 'Parking space', 'Shade preferred'])
      },
      {
        name: 'Ceramic Coating',
        description: 'Professional ceramic coating application with paint correction',
        base_price: 299.00,
        duration_minutes: 360,
        category: 'Protection',
        vehicle_types: JSON.stringify(['sedan', 'suv', 'truck']),
        requirements: JSON.stringify(['Indoor facility', '24-48 hours curing time'])
      },
      {
        name: 'Paint Correction',
        description: 'Multi-stage paint correction to remove swirls and scratches',
        base_price: 199.00,
        duration_minutes: 240,
        category: 'Correction',
        vehicle_types: JSON.stringify(['sedan', 'suv', 'truck']),
        requirements: JSON.stringify(['Indoor facility', 'Good lighting'])
      },
      {
        name: 'Interior Deep Clean',
        description: 'Complete interior cleaning including leather treatment and fabric protection',
        base_price: 75.00,
        duration_minutes: 90,
        category: 'Interior',
        vehicle_types: JSON.stringify(['sedan', 'suv', 'truck']),
        requirements: JSON.stringify(['Water access', 'Ventilation'])
      }
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO services (name, description, base_price, duration_minutes, category, vehicle_types, requirements)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    services.forEach(service => {
      stmt.run(service.name, service.description, service.base_price, service.duration_minutes, 
               service.category, service.vehicle_types, service.requirements);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error inserting sample services:', err.message);
        reject(err);
      } else {
        console.log('Sample services inserted successfully');
        resolve();
      }
    });
  });
};

// Insert sample service packages
const insertSampleServicePackages = () => {
  return new Promise((resolve, reject) => {
    const packages = [
      {
        name: 'Starter Package',
        description: 'Perfect for first-time customers - Basic wash with interior cleaning',
        base_price: 45.00,
        duration_minutes: 75,
        services: JSON.stringify([1, 5]), // Basic Car Wash + Interior Deep Clean
        discount_percentage: 10.00
      },
      {
        name: 'Premium Package',
        description: 'Our most popular package - Full detailing with paint protection',
        base_price: 120.00,
        duration_minutes: 180,
        services: JSON.stringify([2, 5]), // Premium Detailing + Interior Deep Clean
        discount_percentage: 15.00,
        is_popular: 1
      },
      {
        name: 'Protection Package',
        description: 'Complete protection with ceramic coating and paint correction',
        base_price: 450.00,
        duration_minutes: 480,
        services: JSON.stringify([3, 4, 5]), // Ceramic Coating + Paint Correction + Interior Deep Clean
        discount_percentage: 20.00
      }
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO service_packages (name, description, base_price, duration_minutes, services, discount_percentage, is_popular)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    packages.forEach(pkg => {
      stmt.run(pkg.name, pkg.description, pkg.base_price, pkg.duration_minutes, 
               pkg.services, pkg.discount_percentage, pkg.is_popular);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error inserting sample service packages:', err.message);
        reject(err);
      } else {
        console.log('Sample service packages inserted successfully');
        resolve();
      }
    });
  });
};

// Insert sample product bundles
const insertSampleProductBundles = () => {
  return new Promise((resolve, reject) => {
    const bundles = [
      {
        name: 'Cleaning Starter Kit',
        description: 'Everything you need to start detailing at home',
        bundle_price: 89.99,
        individual_price: 110.97,
        savings: 20.98,
        products: JSON.stringify([
          {product_id: 1, quantity: 1}, // Koch Chemie Car Soap
          {product_id: 3, quantity: 1}, // Wheel Cleaner
          {product_id: 5, quantity: 1}  // Microfiber Towels
        ]),
        is_popular: 1
      },
      {
        name: 'Interior Care Bundle',
        description: 'Complete interior cleaning and protection kit',
        bundle_price: 39.99,
        individual_price: 46.98,
        savings: 6.99,
        products: JSON.stringify([
          {product_id: 2, quantity: 1}, // Quick Detailer Spray
          {product_id: 6, quantity: 1}  // Leather Conditioner
        ])
      },
      {
        name: 'Professional Protection Kit',
        description: 'Premium protection products for serious car enthusiasts',
        bundle_price: 129.99,
        individual_price: 149.97,
        savings: 19.98,
        products: JSON.stringify([
          {product_id: 4, quantity: 1}, // Ceramic Coating Kit
          {product_id: 2, quantity: 2}, // Quick Detailer Spray
          {product_id: 5, quantity: 1}  // Microfiber Towels
        ])
      }
    ];

    const stmt = db.prepare(`
      INSERT OR IGNORE INTO product_bundles (name, description, bundle_price, individual_price, savings, products, is_popular)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    bundles.forEach(bundle => {
      stmt.run(bundle.name, bundle.description, bundle.bundle_price, bundle.individual_price, 
               bundle.savings, bundle.products, bundle.is_popular);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error('Error inserting sample product bundles:', err.message);
        reject(err);
      } else {
        console.log('Sample product bundles inserted successfully');
        resolve();
      }
    });
  });
};

module.exports = {
  db,
  initDatabase
};
