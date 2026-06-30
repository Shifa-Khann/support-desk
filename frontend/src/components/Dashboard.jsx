// Dashboard.jsx — Stats overview + quick actions
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001/api';

// Inline SVG icons
function IconTickets(p)  { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>; }
function IconInbox(p)    { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>; }
function IconLoader(p)   { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>; }
function IconCheck(p)    { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>; }
function IconAlert(p)    { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>; }
function IconPlus(p)     { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>; }
function IconList(p)     { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>; }
function IconRefresh(p)  { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>; }
function IconWarn(p)     { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>; }

const STAT_CARDS = [
  { key: 'total',       label: 'Total',       Icon: IconTickets, cls: 'total'    },
  { key: 'open',        label: 'Open',        Icon: IconInbox,   cls: 'open'     },
  { key: 'in_progress', label: 'In Progress', Icon: IconLoader,  cls: 'progress' },
  { key: 'resolved',    label: 'Resolved',    Icon: IconCheck,   cls: 'resolved' },
  { key: 'urgent',      label: 'Urgent',      Icon: IconAlert,   cls: 'urgent'   },
];

export default function Dashboard({ onNavigate }) {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/dashboard`);
      if (!res.ok) throw new Error('Failed to fetch stats.');
      setStats(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <IconWarn />
        <span>{error} — Is the backend server running on port 3001?</span>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of all support tickets in the system</p>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {STAT_CARDS.map(({ key, label, Icon, cls }) => (
          <div key={key} className={`stat-card ${cls}`}>
            <div className="stat-icon-wrap">
              <Icon width="17" height="17" />
            </div>
            <div className="stat-value">{stats?.[key] ?? 0}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card">
        <p style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '14px' }}>
          Quick Actions
        </p>
        <div className="action-row">
          <button className="btn btn-primary" onClick={() => onNavigate('create')}>
            <IconPlus width="15" height="15" />
            New Ticket
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('list')}>
            <IconList width="15" height="15" />
            View All Tickets
          </button>
          <button className="btn btn-ghost" onClick={fetchStats}>
            <IconRefresh width="15" height="15" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
