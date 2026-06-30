// db.js — Database Connection & Schema Setup
// This file is responsible for:
// 1. Connecting to the SQLite database file (support_desk.db)
// 2. Creating the 'tickets' table if it doesn't exist yet
// 3. Exporting the database connection for use in server.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the database file (will be created automatically if it doesn't exist)
const DB_PATH = path.join(__dirname, 'support_desk.db');

// Create a new database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
    process.exit(1); // Stop the server if database connection fails
  }
  console.log('✅ Connected to SQLite database at:', DB_PATH);
});

// Enable WAL mode for better performance with concurrent reads
db.run('PRAGMA journal_mode=WAL;');

// SQL to create the tickets table
// We use IF NOT EXISTS so the table is only created on first run
const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS tickets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name   TEXT    NOT NULL,
    customer_email  TEXT    NOT NULL,
    subject         TEXT    NOT NULL,
    description     TEXT    NOT NULL,
    priority        TEXT    NOT NULL CHECK(priority IN ('Low', 'Medium', 'High')),
    status          TEXT    NOT NULL DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Resolved')),
    is_urgent       INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT    NOT NULL,
    updated_at      TEXT    NOT NULL
  );
`;

// Run the table creation SQL
db.run(CREATE_TABLE_SQL, (err) => {
  if (err) {
    console.error('❌ Failed to create tickets table:', err.message);
  } else {
    console.log('✅ Tickets table ready.');
  }
});

// Export the database connection so server.js can use it
module.exports = db;
