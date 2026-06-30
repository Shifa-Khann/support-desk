// TicketList.jsx — Searchable, filterable ticket table view
import { useEffect, useState } from 'react';
import TicketDetail from './TicketDetail';

const API_URL = 'http://localhost:3001/api';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

// Inline SVG icons
function IconSearch(p)   { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>; }
function IconChevron(p)  { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>; }
function IconWarn(p)     { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>; }
function IconEmpty(p)    { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>; }
function IconRefresh(p)  { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>; }
function IconSort(p)     { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M7 12h10M11 18h2"/></svg>; }

function statusBadgeClass(status) {
  const map = { 'Open': 'open', 'In Progress': 'progress', 'Resolved': 'resolved' };
  return `badge badge-status-${map[status] || 'open'}`;
}

function priorityBadgeClass(priority) {
  return `badge badge-priority-${priority?.toLowerCase()}`;
}

export default function TicketList() {
  const [tickets, setTickets]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus]     = useState('');
  const [sort, setSort]               = useState('newest');
  const [selectedId, setSelectedId]   = useState(null);

  useEffect(() => {
    const t = setTimeout(fetchTickets, 300);
    return () => clearTimeout(t);
  }, [search, filterPriority, filterStatus, sort]);

  async function fetchTickets() {
    try {
      setLoading(true);
      setError('');
      const p = new URLSearchParams();
      if (search)         p.append('search', search);
      if (filterPriority) p.append('priority', filterPriority);
      if (filterStatus)   p.append('status', filterStatus);
      if (sort)           p.append('sort', sort);
      const res = await fetch(`${API_URL}/tickets?${p}`);
      if (!res.ok) throw new Error('Failed to load tickets.');
      setTickets(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h2>Support Tickets</h2>
        <p>
          {loading
            ? 'Loading...'
            : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper">
          <IconSearch className="search-icon" />
          <input
            id="ticket-search"
            type="text"
            className="search-input"
            placeholder="Search by name, email or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          id="filter-priority"
          className="filter-select"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          id="filter-status"
          className="filter-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <button
          id="sort-toggle"
          className="btn btn-secondary"
          onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
        >
          <IconSort width="14" height="14" />
          {sort === 'newest' ? 'Newest first' : 'Oldest first'}
        </button>

        <button className="btn btn-ghost" onClick={fetchTickets}>
          <IconRefresh width="14" height="14" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <IconWarn />
          <span>{error} — Is the backend running on port 3001?</span>
        </div>
      )}

      {/* Loading */}
      {loading && !error && (
        <div className="loading-spinner">
          <div className="spinner" />
          <span>Loading tickets...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tickets.length === 0 && (
        <div className="tickets-table">
          <div className="empty-state">
            <IconEmpty className="empty-icon" />
            <h3>No tickets found</h3>
            <p>
              {search || filterPriority || filterStatus
                ? 'Try adjusting your filters.'
                : 'No tickets have been submitted yet.'}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && tickets.length > 0 && (
        <div className="tickets-table">
          {/* Header row */}
          <div className="tickets-table-header">
            <div className="th">ID</div>
            <div className="th">Subject / Customer</div>
            <div className="th">Date</div>
            <div className="th">Priority</div>
            <div className="th">Status</div>
            <div className="th" />
          </div>

          {/* Data rows */}
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className={`ticket-row ${ticket.is_urgent ? 'urgent-row' : ''}`}
              onClick={() => setSelectedId(ticket.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setSelectedId(ticket.id)}
              aria-label={`View ticket: ${ticket.subject}`}
            >
              <div className="td td-id">#{ticket.id}</div>

              <div className="td td-main">
                <div className="ticket-subject">{ticket.subject}</div>
                <div className="ticket-customer-info">
                  {ticket.customer_name} &middot; {ticket.customer_email}
                  {ticket.is_urgent === 1 && (
                    <span className="badge badge-urgent" style={{ marginLeft: '6px', fontSize: '.68rem', padding: '1px 6px' }}>
                      Urgent
                    </span>
                  )}
                </div>
              </div>

              <div className="td td-date">{formatDate(ticket.created_at)}</div>

              <div className="td">
                <span className={priorityBadgeClass(ticket.priority)}>{ticket.priority}</span>
              </div>

              <div className="td">
                <span className={statusBadgeClass(ticket.status)}>{ticket.status}</span>
              </div>

              <div className="td td-chevron">
                <IconChevron width="14" height="14" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedId !== null && (
        <TicketDetail
          ticketId={selectedId}
          onClose={() => setSelectedId(null)}
          onStatusChanged={fetchTickets}
        />
      )}
    </div>
  );
}
