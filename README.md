# SupportDesk

A full-stack web application for managing customer support tickets, built with Node.js, Express, SQLite, and React.

---

## Project Structure

```
support-desk/
│
├── backend/
│   ├── db.js          — SQLite connection and schema setup
│   ├── utils.js       — Core business logic: validation and urgency detection
│   ├── server.js      — Express API (5 endpoints)
│   ├── test.js        — Automated test suite (Node built-in test runner)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx              — Root component: navigation and theme
    │   ├── index.css            — Design system with dark/light mode
    │   └── components/
    │       ├── Dashboard.jsx    — Statistics overview
    │       ├── TicketForm.jsx   — Ticket submission form with live validation
    │       ├── TicketList.jsx   — Searchable, filterable ticket table
    │       └── TicketDetail.jsx — Ticket detail modal with customer history
    └── index.html
```

---

## Getting Started

### 1. Start the Backend

```bash
cd backend
npm install       # Install dependencies (first run only)
node server.js    # Starts the API server at http://localhost:3001
```

### 2. Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install       # Install dependencies (first run only)
npm run dev       # Starts the dev server at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## API Reference

| Method  | Endpoint                   | Description                            |
|---------|----------------------------|----------------------------------------|
| `POST`  | `/api/tickets`             | Create a new ticket                    |
| `GET`   | `/api/tickets`             | List tickets (search, filter, sort)    |
| `GET`   | `/api/tickets/:id`         | Get a single ticket with history       |
| `PATCH` | `/api/tickets/:id/status`  | Update ticket status                   |
| `GET`   | `/api/dashboard`           | Get summary statistics                 |

### Query Parameters — `GET /api/tickets`

| Parameter  | Values                              | Description          |
|------------|-------------------------------------|----------------------|
| `search`   | Any string                          | Search by name, email, or subject |
| `priority` | `Low`, `Medium`, `High`             | Filter by priority   |
| `status`   | `Open`, `In Progress`, `Resolved`   | Filter by status     |
| `sort`     | `newest` (default), `oldest`        | Sort order           |

---

## Database Schema

```sql
CREATE TABLE tickets (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name   TEXT    NOT NULL,
  customer_email  TEXT    NOT NULL,
  subject         TEXT    NOT NULL,
  description     TEXT    NOT NULL,
  priority        TEXT    NOT NULL CHECK(priority IN ('Low', 'Medium', 'High')),
  status          TEXT    NOT NULL DEFAULT 'Open'
                          CHECK(status IN ('Open', 'In Progress', 'Resolved')),
  is_urgent       INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT    NOT NULL,
  updated_at      TEXT    NOT NULL
);
```

---

## Validation Rules

| Field            | Rule                                                 |
|------------------|------------------------------------------------------|
| `customer_name`  | Required, non-empty                                  |
| `customer_email` | Required, must match standard email format           |
| `subject`        | Required, non-empty                                  |
| `description`    | Required, minimum 10 characters                      |
| `priority`       | Must be one of: `Low`, `Medium`, `High`              |
| `status` (PATCH) | Must be one of: `Open`, `In Progress`, `Resolved`   |

Validation is enforced on both the **frontend** (for immediate user feedback) and the **backend** (as a security boundary). The shared logic lives in `backend/utils.js`.

---

## Urgent Ticket Detection

A ticket is automatically flagged as urgent if either condition is met:

- The `priority` field is set to `High`, or
- The `description` contains the word `urgent` (case-insensitive)

This detection runs server-side in `backend/utils.js → isUrgent()` on every `POST /api/tickets` request.

---

## Additional Features

### Customer Ticket History

When a ticket is opened in the detail view, a history panel displays all previous tickets submitted by the same email address. This allows support agents to identify recurring issues and understand a customer's full context at a glance.

### Dark and Light Mode

A theme toggle is available in the sidebar. The selected preference is persisted in `localStorage` and applied on every subsequent visit.

---

## Running Tests

```bash
cd backend
node test.js
```

The test suite covers:

- Valid ticket passes all validation checks
- Missing required fields are each individually rejected
- Invalid email format is rejected
- Description shorter than 10 characters is rejected
- Invalid priority value is rejected
- Multiple validation errors are all reported at once
- High priority tickets are flagged as urgent
- Tickets with "urgent" in the description are flagged as urgent (any casing)
- Tickets with medium priority and no urgency keyword are not flagged
- Valid and invalid status transitions are handled correctly

---

## Tech Stack

| Layer    | Technology                      |
|----------|---------------------------------|
| Frontend | React 19, Vite, Vanilla CSS     |
| Backend  | Node.js, Express 4              |
| Database | SQLite (`sqlite3`)              |
| Tests    | Node.js built-in `node:test`    |
| Version Control | Git, GitHub              |
