const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/emailService');
const { db } = require('../database/init');

// Contact form submission
router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, email, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, email, phone, service_type, message)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(name, email, phone || null, service || null, message, function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({
          error: 'Database error',
          message: 'Failed to save contact message'
        });
      }
    });

    stmt.finalize();

    // Send email notification
    const emailData = {
      to: 'autobath36@gmail.com',
      subject: `New ${service || 'Contact'} Inquiry from ${name}`,
      template: 'contact',
      data: {
        name,
        email,
        phone: phone || 'Not provided',
        service: service || 'General Inquiry',
        message,
        timestamp: new Date().toLocaleString()
      }
    };

    try {
      await sendEmail(emailData);
    } catch (e) {
      console.error('Admin notification email failed:', e.message || e);
    }

    // Send confirmation email to customer
    const customerEmailData = {
      to: email,
      subject: 'Thank you for contacting AUTOBATH',
      template: 'customer-confirmation',
      data: {
        name,
        service: service || 'General Inquiry'
      }
    };

    try {
      await sendEmail(customerEmailData);
    } catch (e) {
      console.error('Customer confirmation email failed:', e.message || e);
    }

    res.json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: 'Please try again or contact us directly'
    });
  }
});

// Get all contact messages (admin endpoint)
router.get('/messages', (req, res) => {
  const query = `
    SELECT id, name, email, phone, service_type, message, status, created_at
    FROM contact_messages
    ORDER BY created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to fetch contact messages'
      });
    }

    res.json({
      success: true,
      messages: rows
    });
  });
});

// Update message status (admin endpoint)
router.put('/messages/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['unread', 'read', 'replied'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      message: 'Status must be unread, read, or replied'
    });
  }

  const stmt = db.prepare(`
    UPDATE contact_messages 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(status, id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update message status'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Message not found',
        message: 'No message found with the given ID'
      });
    }

    res.json({
      success: true,
      message: 'Message status updated successfully'
    });
  });

  stmt.finalize();
});

module.exports = router;
