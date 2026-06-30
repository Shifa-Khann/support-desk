// Dashboard.jsx — Dashboard Page Component
// Shows summary statistics about all tickets using stat cards.
// Fetches data from GET /api/dashboard

import { useEffect, useState } from 'react';

// The base URL of our backend API
const API_URL = 'http://localhost:3001/api';

export default function Dashboard({ onNavigate }) {
  // 'stats' holds the ticket summary counts (total, open, etc.)
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect runs when the component first loads (like "on mount")
  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      // Fetch dashboard statistics from the backend
      const res = await fetch(`${API_URL}/dashboard`);
      if (!res.ok) throw new Error('Failed to fetch dashboard stats.');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        ⚠️ {error} — Is the backend server running?
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of all support tickets in the system</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <span className="stat-icon">🎫</span>
          <span className="stat-label">Total Tickets</span>
          <span className="stat-value">{stats?.total ?? 0}</span>
        </div>

        <div className="stat-card open">
          <span className="stat-icon">📬</span>
          <span className="stat-label">Open</span>
          <span className="stat-value">{stats?.open ?? 0}</span>
        </div>

        <div className="stat-card progress">
          <span className="stat-icon">⚙️</span>
          <span className="stat-label">In Progress</span>
          <span className="stat-value">{stats?.in_progress ?? 0}</span>
        </div>

        <div className="stat-card resolved">
          <span className="stat-icon">✅</span>
          <span className="stat-label">Resolved</span>
          <span className="stat-value">{stats?.resolved ?? 0}</span>
        </div>

        <div className="stat-card urgent">
          <span className="stat-icon">🚨</span>
          <span className="stat-label">Urgent</span>
          <span className="stat-value">{stats?.urgent ?? 0}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('create')}>
            ➕ New Ticket
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('list')}>
            📋 View All Tickets
          </button>
          <button className="btn btn-secondary" onClick={fetchStats}>
            🔄 Refresh Stats
          </button>
        </div>
      </div>

      {/* Tip box for the interview */}
      <div className="alert alert-info" style={{ marginTop: '24px' }}>
        💡 <strong>How it works:</strong> Statistics are fetched from <code>GET /api/dashboard</code>. Urgent tickets are those with High priority OR "urgent" in their description.
      </div>
    </div>
  );
}
