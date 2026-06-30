// TicketDetail.jsx — Ticket Detail Modal Component
// Shown when a user clicks a ticket in the list.
// Features:
//   - Full ticket information display
//   - Status update (change to Open / In Progress / Resolved)
//   - Customer History panel (initiative feature!)

import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001/api';

// Helper: format ISO date string to human-readable
function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function TicketDetail({ ticketId, onClose, onStatusChanged }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Fetch full ticket details (including history) when modal opens
  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  async function fetchTicket() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/tickets/${ticketId}`);
      if (!res.ok) throw new Error('Ticket not found.');
      const data = await res.json();
      setTicket(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Update the ticket's status via PATCH /api/tickets/:id/status
  async function handleStatusChange(newStatus) {
    if (newStatus === ticket.status) return; // No change needed
    setUpdating(true);
    setUpdateSuccess(false);

    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status.');
      const updated = await res.json();
      setTicket(prev => ({ ...prev, ...updated }));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 2000);

      // Notify parent (TicketList) to refresh
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  // Helper: get the CSS class for a status button
  function statusBtnClass(btnStatus) {
    if (!ticket) return 'status-btn unselected';
    if (ticket.status === btnStatus) {
      const map = {
        'Open': 'selected-open',
        'In Progress': 'selected-progress',
        'Resolved': 'selected-resolved',
      };
      return `status-btn ${map[btnStatus] || 'unselected'}`;
    }
    return 'status-btn unselected';
  }

  // Priority badge CSS class
  function priorityClass(p) {
    return `badge badge-priority-${p?.toLowerCase()}`;
  }

  // Status badge CSS class
  function statusClass(s) {
    const map = { 'Open': 'open', 'In Progress': 'progress', 'Resolved': 'resolved' };
    return `badge badge-status-${map[s] || 'open'}`;
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading ticket...</span>
          </div>
        )}

        {error && !loading && (
          <div className="alert alert-error">⚠️ {error}</div>
        )}

        {ticket && !loading && (
          <>
            {/* Modal Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    TICKET #{ticket.id}
                  </span>
                  {ticket.is_urgent === 1 && (
                    <span className="badge badge-urgent">🚨 URGENT</span>
                  )}
                  <span className={statusClass(ticket.status)}>{ticket.status}</span>
                  <span className={priorityClass(ticket.priority)}>{ticket.priority} Priority</span>
                </div>
                <h2 className="modal-title" id="modal-title">{ticket.subject}</h2>
              </div>
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close ticket detail"
              >
                ✕
              </button>
            </div>

            {/* Status Update Success */}
            {updateSuccess && (
              <div className="alert alert-success">✅ Status updated successfully!</div>
            )}

            {/* ── SECTION: Customer Info ── */}
            <div className="modal-section">
              <h3 className="modal-section-title">👤 Customer Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Name</label>
                  <p>{ticket.customer_name}</p>
                </div>
                <div className="detail-item">
                  <label>Email</label>
                  <p>{ticket.customer_email}</p>
                </div>
                <div className="detail-item">
                  <label>Submitted</label>
                  <p>{formatDate(ticket.created_at)}</p>
                </div>
                <div className="detail-item">
                  <label>Last Updated</label>
                  <p>{formatDate(ticket.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* ── SECTION: Description ── */}
            <div className="modal-section">
              <h3 className="modal-section-title">📝 Description</h3>
              <div className="description-box">{ticket.description}</div>
            </div>

            {/* ── SECTION: Update Status ── */}
            <div className="modal-section">
              <h3 className="modal-section-title">🔄 Update Status</h3>
              <div className="status-selector">
                {['Open', 'In Progress', 'Resolved'].map(s => (
                  <button
                    key={s}
                    className={statusBtnClass(s)}
                    onClick={() => handleStatusChange(s)}
                    disabled={updating}
                    id={`status-btn-${s.replace(' ', '-').toLowerCase()}`}
                  >
                    {s === 'Open' && '📬 '}
                    {s === 'In Progress' && '⚙️ '}
                    {s === 'Resolved' && '✅ '}
                    {s}
                  </button>
                ))}
              </div>
              {updating && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  ⏳ Updating...
                </p>
              )}
            </div>

            {/* ── SECTION: Customer Ticket History (Initiative Feature!) ── */}
            <div className="modal-section">
              <h3 className="modal-section-title">
                📚 Customer Ticket History
                <span style={{ marginLeft: '8px', fontWeight: 400, fontSize: '0.75rem', textTransform: 'none', color: 'var(--accent)' }}>
                  — all tickets from {ticket.customer_email}
                </span>
              </h3>

              {ticket.history && ticket.history.length > 0 ? (
                <div className="history-list">
                  {ticket.history.map(h => (
                    <div key={h.id} className="history-item">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '30px' }}>#{h.id}</span>
                      <span className="history-subject">{h.subject}</span>
                      <span className={`badge badge-priority-${h.priority?.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                        {h.priority}
                      </span>
                      <span className={`badge badge-status-${h.status === 'Open' ? 'open' : h.status === 'In Progress' ? 'progress' : 'resolved'}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                        {h.status}
                      </span>
                      <span className="history-date">
                        {new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-history">No previous tickets from this customer. 🎉</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
