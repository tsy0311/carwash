const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

// Business hours and slot config
const BUSINESS_DAYS = [1, 2, 3, 4, 5, 6]; // 1=Mon ... 6=Sat (0=Sun closed)
const OPEN_HOUR = 9;   // 9:00
const CLOSE_HOUR = 18; // 18:00 (last slot starts at 17:00)
const SLOT_MINUTES = 60;

function generateDailySlots(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay();
  if (!BUSINESS_DAYS.includes(day)) return [];
  const slots = [];
  for (let hour = OPEN_HOUR; hour < CLOSE_HOUR; hour += SLOT_MINUTES / 60) {
    const hh = String(hour).padStart(2, '0');
    slots.push(`${hh}:00`);
  }
  return slots;
}

function validateIsoDate(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

// GET /api/bookings/availability?date=YYYY-MM-DD
router.get('/availability', (req, res) => {
  const { date } = req.query;
  if (!date || !validateIsoDate(date)) {
    return res.status(400).json({ error: 'Invalid date', message: 'Use YYYY-MM-DD' });
  }

  const allSlots = generateDailySlots(date);
  if (allSlots.length === 0) {
    return res.json({ success: true, date, slots: [], closed: true });
  }

  db.all(
    `SELECT time_slot FROM bookings WHERE date = ? AND status != 'cancelled'`,
    [date],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      const booked = new Set(rows.map(r => r.time_slot));
      const available = allSlots.filter(s => !booked.has(s));
      res.json({ success: true, date, slots: available, closed: false });
    }
  );
});

// POST /api/bookings
// body: { name, email, phone, service, date (YYYY-MM-DD), timeSlot, notes }
router.post('/', (req, res) => {
  const { name, email, phone, service, date, timeSlot, notes } = req.body || {};

  if (!name || !email || !date || !timeSlot) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'name, email, date and timeSlot are required'
    });
  }

  if (!validateIsoDate(date)) {
    return res.status(400).json({ error: 'Invalid date', message: 'Use YYYY-MM-DD' });
  }

  const validSlots = new Set(generateDailySlots(date));
  if (!validSlots.has(timeSlot)) {
    return res.status(400).json({ error: 'Invalid timeSlot', message: 'Outside business hours or closed' });
  }

  // Ensure not double-booked
  db.get(
    `SELECT id FROM bookings WHERE date = ? AND time_slot = ? AND status != 'cancelled'`,
    [date, timeSlot],
    (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        return res.status(409).json({ error: 'Slot already booked' });
      }

      const stmt = db.prepare(`
        INSERT INTO bookings (customer_name, customer_email, customer_phone, service_type, date, time_slot, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `);
      stmt.run(name, email, phone || null, service || null, date, timeSlot, notes || null, function (insertErr) {
        if (insertErr) {
          console.error('Database error:', insertErr);
          return res.status(500).json({ error: 'Failed to create booking' });
        }
        res.json({ success: true, id: this.lastID, message: 'Booking created' });
      });
      stmt.finalize();
    }
  );
});

module.exports = router;


