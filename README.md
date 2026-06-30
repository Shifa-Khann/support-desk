# 🎫 SupportDesk — Mini Customer Support Ticket System

A full-stack web application for managing customer support tickets. Built with **Node.js + Express** (backend), **SQLite** (database), and **React + Vite** (frontend).

---

## 📦 Project Structure

```
internship-project/
│
├── backend/                 ← Node.js + Express API Server
│   ├── db.js                ← SQLite connection & schema setup
│   ├── utils.js             ← Business logic: validation + urgency detection
│   ├── server.js            ← Express API routes (5 endpoints)
│   ├── test.js              ← Automated tests (Node built-in test runner)
│   └── package.json
│
└── frontend/                ← React + Vite SPA
    ├── src/
    │   ├── App.jsx          ← Root component (navigation + theme)
    │   ├── index.css        ← Premium design system with dark/light mode
    │   └── components/
    │       ├── Dashboard.jsx    ← Stats overview page
    │       ├── TicketForm.jsx   ← Create ticket form with live validation
    │       ├── TicketList.jsx   ← Ticket list with search/filter/sort
    │       └── TicketDetail.jsx ← Ticket detail modal + customer history
    └── index.html
```

---

## 🚀 Getting Started

### 1. Start the Backend

```bash
cd backend
npm install          # Install dependencies (only needed once)
node server.js       # Start the API server on http://localhost:3001
```

### 2. Start the Frontend (new terminal)

```bash
cd frontend
npm install          # Install dependencies (only needed once)
npm run dev          # Start Vite dev server on http://localhost:5173
```

Open your browser at **http://localhost:5173**

---

## 🔌 API Endpoints

| Method  | Endpoint                        | Description                                |
|---------|---------------------------------|--------------------------------------------|
| `POST`  | `/api/tickets`                  | Create a new ticket                        |
| `GET`   | `/api/tickets`                  | List tickets (with search/filter/sort)     |
| `GET`   | `/api/tickets/:id`              | Get one ticket + customer history          |
| `PATCH` | `/api/tickets/:id/status`       | Update ticket status                       |
| `GET`   | `/api/dashboard`                | Get summary statistics                     |

### Query params for `GET /api/tickets`:
- `search` — search across name, email, subject
- `priority` — filter: `Low`, `Medium`, `High`
- `status` — filter: `Open`, `In Progress`, `Resolved`
- `sort` — `newest` (default) or `oldest`

---

## 🗄️ Database Schema

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

## ✅ Validation Rules

| Field          | Rule                                                   |
|----------------|--------------------------------------------------------|
| customer_name  | Required, non-empty                                    |
| customer_email | Required, valid format (regex: `x@x.x`)               |
| subject        | Required, non-empty                                    |
| description    | Required, minimum 10 characters                        |
| priority       | Must be one of: `Low`, `Medium`, `High`               |
| status (PATCH) | Must be one of: `Open`, `In Progress`, `Resolved`     |

Validation runs on **both the frontend** (for instant feedback) and **the backend** (for security).

---

## 🚨 Urgent Ticket Detection

A ticket is automatically flagged as **urgent** if **either**:
- Its `priority` is `High`, OR  
- Its `description` contains the word **"urgent"** (case-insensitive)

This logic lives in `backend/utils.js → isUrgent()` and is applied on every `POST /api/tickets`.

---

## ⭐ Initiative Features

### 1. Customer Ticket History
When viewing a ticket, the **Customer Ticket History** panel shows all previous tickets from the same email address. This helps support agents see repeat issues and avoid duplication — a real production feature!

### 2. Dark / Light Mode
Click the toggle at the bottom of the sidebar to switch themes. The preference is saved in `localStorage` so it persists across page refreshes.

---

## 🧪 Running Tests

```bash
cd backend
node test.js
```

The test suite covers:
- ✅ Valid ticket passes validation
- ✅ Missing name fails
- ✅ Bad email format fails
- ✅ Short description (< 10 chars) fails
- ✅ Invalid priority fails
- ✅ Multiple errors all reported
- ✅ `High` priority → urgent
- ✅ "urgent" in description (any case) → urgent
- ✅ Medium priority, no "urgent" → not urgent
- ✅ Valid/invalid status values

---

## 🛠 Tech Stack

| Layer    | Technology                     |
|----------|-------------------------------|
| Frontend | React 19, Vite, Vanilla CSS   |
| Backend  | Node.js, Express 4            |
| Database | SQLite (via `sqlite3` package)|
| Tests    | Node.js built-in `node:test`  |
| Git      | Git + GitHub                  |
