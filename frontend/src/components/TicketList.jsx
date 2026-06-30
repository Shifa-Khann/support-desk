// TicketList.jsx — Ticket List Page Component
// Displays all tickets in a searchable, filterable, sortable list.
// Clicking a ticket card opens the TicketDetail modal.

import { useEffect, useState, useCallback } from 'react';
import TicketDetail from './TicketDetail';

const API_URL = 'http://localhost:3001/api';

// Helper: Format date for display
function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search, filter, and sort state
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sort, setSort] = useState('newest');

  // Which ticket is currently selected for detail view
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Fetch tickets whenever search/filter/sort changes
  useEffect(() => {
    // Debounce the search so we don't fire on every keystroke
    const timer = setTimeout(() => {
      fetchTickets();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterPriority, filterStatus, sort]);

  async function fetchTickets() {
    try {
      setLoading(true);
      setError('');

      // Build the query string from current filter state
      const params = new URLSearchParams();
      if (search)         params.append('search', search);
      if (filterPriority) params.append('priority', filterPriority);
      if (filterStatus)   params.append('status', filterStatus);
      if (sort)           params.append('sort', sort);

      const res = await fetch(`${API_URL}/tickets?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load tickets.');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Called by TicketDetail when status is changed — refreshes the list
  function handleStatusChanged() {
    fetchTickets();
  }

  // Status badge CSS class
  function statusBadgeClass(status) {
    const map = { 'Open': 'open', 'In Progress': 'progress', 'Resolved': 'resolved' };
    return `badge badge-status-${map[status] || 'open'}`;
  }

  // Priority badge CSS class
  function priorityBadgeClass(priority) {
    return `badge badge-priority-${priority?.toLowerCase()}`;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2>Support Tickets</h2>
        <p>
          {loading ? 'Loading...' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* ── Toolbar: Search + Filters + Sort ── */}
      <div className="toolbar">
        {/* Search box */}
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            id="ticket-search"
            type="text"
            className="search-input"
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Priority filter */}
        <select
          id="filter-priority"
          className="filter-select"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="High">🔴 High</option>
          <option value="Medium">🟡 Medium</option>
          <option value="Low">🟢 Low</option>
        </select>

        {/* Status filter */}
        <select
          id="filter-status"
          className="filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Open">📬 Open</option>
          <option value="In Progress">⚙️ In Progress</option>
          <option value="Resolved">✅ Resolved</option>
        </select>

        {/* Sort toggle */}
        <button
          id="sort-toggle"
          className="btn btn-secondary btn-sm"
          onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
        >
          {sort === 'newest' ? '🔽 Newest First' : '🔼 Oldest First'}
        </button>

        {/* Refresh */}
        <button className="btn btn-secondary btn-sm" onClick={fetchTickets}>
          🔄 Refresh
        </button>
      </div>

      {/* ── Error State ── */}
      {error && (
        <div className="alert alert-error">⚠️ {error} — Is the backend running on port 3001?</div>
      )}

      {/* ── Loading State ── */}
      {loading && !error && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <span>Loading tickets...</span>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && tickets.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <span className="empty-icon">🎫</span>
            <h3>No tickets found</h3>
            <p>
              {search || filterPriority || filterStatus
                ? 'Try adjusting your search or filters.'
                : 'No tickets have been submitted yet.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Ticket Cards ── */}
      {!loading && !error && tickets.length > 0 && (
        <div className="tickets-list">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className={`ticket-card ${ticket.is_urgent ? 'urgent-card' : ''}`}
              onClick={() => setSelectedTicketId(ticket.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setSelectedTicketId(ticket.id)}
              aria-label={`View ticket: ${ticket.subject}`}
            >
              {/* ID */}
              <span className="ticket-id-badge">#{ticket.id}</span>

              {/* Main content */}
              <div className="ticket-main">
                <div className="ticket-subject">{ticket.subject}</div>
                <div className="ticket-meta">
                  <span className="ticket-customer">👤 {ticket.customer_name}</span>
                  <span className="ticket-customer" style={{ color: 'var(--text-muted)' }}>
                    {ticket.customer_email}
                  </span>
                  <span className="ticket-date">🕒 {formatDate(ticket.created_at)}</span>
                </div>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {ticket.is_urgent === 1 && (
                  <span className="badge badge-urgent">🚨 URGENT</span>
                )}
                <span className={priorityBadgeClass(ticket.priority)}>{ticket.priority}</span>
                <span className={statusBadgeClass(ticket.status)}>{ticket.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Ticket Detail Modal ── */}
      {selectedTicketId !== null && (
        <TicketDetail
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          onStatusChanged={handleStatusChanged}
        />
      )}
    </div>
  );
}
