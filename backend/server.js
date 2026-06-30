// server.js — Express API Server
// This is the heart of the backend. It:
// 1. Sets up the Express web server
// 2. Defines all API routes (endpoints) for managing support tickets
// 3. Uses the database (db.js) and helper functions (utils.js)

const express = require('express');
const cors = require('cors');
const db = require('./db');
const { validateTicket, isUrgent, validateStatus } = require('./utils');

const app = express();
const PORT = 3001;

// ─────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────

// cors() allows the React frontend (running on a different port) to talk to this server
app.use(cors());

// express.json() parses incoming request bodies as JSON automatically
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// HELPER: Get current ISO timestamp
// ─────────────────────────────────────────────────────────────
const now = () => new Date().toISOString();

// ─────────────────────────────────────────────────────────────
// ROUTE 1: POST /api/tickets
// Purpose: Create a new support ticket
// ─────────────────────────────────────────────────────────────
app.post('/api/tickets', (req, res) => {
  const { customer_name, customer_email, subject, description, priority } = req.body;

  // Step 1: Validate input fields
  const { valid, errors } = validateTicket({ customer_name, customer_email, subject, description, priority });
  if (!valid) {
    // Return 400 Bad Request with a list of validation errors
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Step 2: Determine if the ticket is urgent
  const urgent = isUrgent(priority, description) ? 1 : 0;

  // Step 3: Insert into database
  const sql = `
    INSERT INTO tickets (customer_name, customer_email, subject, description, priority, status, is_urgent, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'Open', ?, ?, ?)
  `;
  const timestamp = now();

  db.run(sql, [
    customer_name.trim(),
    customer_email.trim().toLowerCase(),
    subject.trim(),
    description.trim(),
    priority,
    urgent,
    timestamp,
    timestamp,
  ], function (err) {
    if (err) {
      console.error('DB insert error:', err.message);
      return res.status(500).json({ error: 'Failed to create ticket.' });
    }

    // Step 4: Return the newly created ticket
    db.get('SELECT * FROM tickets WHERE id = ?', [this.lastID], (err, ticket) => {
      if (err) return res.status(500).json({ error: 'Ticket created but failed to retrieve it.' });
      res.status(201).json(ticket);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// ROUTE 2: GET /api/tickets
// Purpose: Get a list of all tickets with optional search/filter/sort
// Query params:
//   search   - text search across name, email, subject (case-insensitive)
//   priority - filter by 'Low', 'Medium', 'High'
//   status   - filter by 'Open', 'In Progress', 'Resolved'
//   sort     - 'newest' (default) or 'oldest'
// ─────────────────────────────────────────────────────────────
app.get('/api/tickets', (req, res) => {
  const { search, priority, status, sort } = req.query;

  // Build WHERE clauses dynamically
  const conditions = [];
  const params = [];

  if (search) {
    // Search across customer_name, customer_email, and subject
    conditions.push(`(
      LOWER(customer_name) LIKE ?
      OR LOWER(customer_email) LIKE ?
      OR LOWER(subject) LIKE ?
    )`);
    const term = `%${search.toLowerCase()}%`;
    params.push(term, term, term);
  }

  if (priority) {
    conditions.push('priority = ?');
    params.push(priority);
  }

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const order = sort === 'oldest' ? 'ASC' : 'DESC'; // newest by default

  const sql = `SELECT * FROM tickets ${whereClause} ORDER BY created_at ${order}`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('DB query error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch tickets.' });
    }
    res.json(rows);
  });
});

// ─────────────────────────────────────────────────────────────
// ROUTE 3: GET /api/tickets/:id
// Purpose: Get a single ticket by ID
// Also returns 'history': all OTHER tickets from the same email
//   This lets agents see a customer's full support history
// ─────────────────────────────────────────────────────────────
app.get('/api/tickets/:id', (req, res) => {
  const { id } = req.params;

  // First, get the main ticket
  db.get('SELECT * FROM tickets WHERE id = ?', [id], (err, ticket) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch ticket.' });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found.' });

    // Then, get all other tickets from the same customer email (for the history panel)
    db.all(
      'SELECT id, subject, status, priority, created_at FROM tickets WHERE customer_email = ? AND id != ? ORDER BY created_at DESC',
      [ticket.customer_email, id],
      (err, history) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch customer history.' });

        // Return ticket with embedded history
        res.json({ ...ticket, history });
      }
    );
  });
});

// ─────────────────────────────────────────────────────────────
// ROUTE 4: PATCH /api/tickets/:id/status
// Purpose: Update only the status of a ticket
// Body: { "status": "In Progress" }
// ─────────────────────────────────────────────────────────────
app.patch('/api/tickets/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate the new status value
  if (!validateStatus(status)) {
    return res.status(400).json({
      error: 'Invalid status. Must be one of: Open, In Progress, Resolved.',
    });
  }

  const sql = 'UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?';

  db.run(sql, [status, now(), id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to update status.' });
    if (this.changes === 0) return res.status(404).json({ error: 'Ticket not found.' });

    // Return the updated ticket
    db.get('SELECT * FROM tickets WHERE id = ?', [id], (err, ticket) => {
      if (err) return res.status(500).json({ error: 'Updated but failed to retrieve ticket.' });
      res.json(ticket);
    });
  });
});

// ─────────────────────────────────────────────────────────────
// ROUTE 5: GET /api/dashboard
// Purpose: Return summary statistics for the Dashboard page
// ─────────────────────────────────────────────────────────────
app.get('/api/dashboard', (req, res) => {
  const sql = `
    SELECT
      COUNT(*)                                     AS total,
      SUM(CASE WHEN status = 'Open'        THEN 1 ELSE 0 END) AS open,
      SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
      SUM(CASE WHEN status = 'Resolved'    THEN 1 ELSE 0 END) AS resolved,
      SUM(CASE WHEN is_urgent = 1          THEN 1 ELSE 0 END) AS urgent
    FROM tickets
  `;

  db.get(sql, [], (err, stats) => {
    if (err) {
      console.error('Dashboard query error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
    }
    res.json(stats);
  });
});

// ─────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SupportDesk API running at http://localhost:${PORT}`);
  console.log(`   Available endpoints:`);
  console.log(`   POST   /api/tickets`);
  console.log(`   GET    /api/tickets`);
  console.log(`   GET    /api/tickets/:id`);
  console.log(`   PATCH  /api/tickets/:id/status`);
  console.log(`   GET    /api/dashboard\n`);
});
