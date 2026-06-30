// TicketDetail.jsx — Ticket detail modal
// Shows full info, status update, and customer history
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3001/api';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatShortDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Inline SVG icons
function IconX(p)       { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>; }
function IconWarn(p)    { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>; }
function IconCheck(p)   { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>; }

function statusBadgeClass(s) {
  const map = { 'Open': 'open', 'In Progress': 'progress', 'Resolved': 'resolved' };
  return `badge badge-status-${map[s] || 'open'}`;
}

function priorityBadgeClass(p) {
  return `badge badge-priority-${p?.toLowerCase()}`;
}

export default function TicketDetail({ ticketId, onClose, onStatusChanged }) {
  const [ticket, setTicket]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [updating, setUpdating]     = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => { fetchTicket(); }, [ticketId]);

  async function fetchTicket() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/tickets/${ticketId}`);
      if (!res.ok) throw new Error('Ticket not found.');
      setTicket(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus) {
    if (!ticket || newStatus === ticket.status) return;
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
      setTimeout(() => setUpdateSuccess(false), 2500);
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  function statusBtnClass(btnStatus) {
    if (!ticket) return 'status-btn unselected';
    if (ticket.status === btnStatus) {
      const m = { 'Open': 'selected-open', 'In Progress': 'selected-progress', 'Resolved': 'selected-resolved' };
      return `status-btn ${m[btnStatus] || 'unselected'}`;
    }
    return 'status-btn unselected';
  }

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        {/* Loading */}
        {loading && (
          <div className="loading-spinner">
            <div className="spinner" />
            <span>Loading ticket...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ padding: '24px' }}>
            <div className="alert alert-error">
              <IconWarn width="15" height="15" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Content */}
        {ticket && !loading && (
          <>
            {/* Header */}
            <div className="modal-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="modal-meta">
                  <span className="ticket-ref">#{ticket.id}</span>
                  {ticket.is_urgent === 1 && (
                    <span className="badge badge-urgent">Urgent</span>
                  )}
                  <span className={statusBadgeClass(ticket.status)}>{ticket.status}</span>
                  <span className={priorityBadgeClass(ticket.priority)}>{ticket.priority}</span>
                </div>
                <h2 className="modal-title" id="modal-title">{ticket.subject}</h2>
              </div>
              <button
                className="modal-close"
                onClick={onClose}
                aria-label="Close"
              >
                <IconX width="14" height="14" />
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Success flash */}
              {updateSuccess && (
                <div className="alert alert-success">
                  <IconCheck width="15" height="15" />
                  <span>Status updated successfully.</span>
                </div>
              )}

              {/* Customer info */}
              <div className="modal-section">
                <div className="modal-section-title">Customer</div>
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

              {/* Description */}
              <div className="modal-section">
                <div className="modal-section-title">Description</div>
                <div className="description-box">{ticket.description}</div>
              </div>

              {/* Update status */}
              <div className="modal-section">
                <div className="modal-section-title">Update Status</div>
                <div className="status-selector">
                  {['Open', 'In Progress', 'Resolved'].map(s => (
                    <button
                      key={s}
                      className={statusBtnClass(s)}
                      onClick={() => handleStatusChange(s)}
                      disabled={updating}
                      id={`status-btn-${s.replace(' ', '-').toLowerCase()}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {updating && (
                  <p style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: '8px' }}>
                    Updating...
                  </p>
                )}
              </div>

              {/* Customer history */}
              <div className="modal-section">
                <div className="modal-section-title">
                  Customer History
                  <span style={{ marginLeft: '6px', fontWeight: 400, textTransform: 'none', color: 'var(--accent)', letterSpacing: 0 }}>
                    — {ticket.customer_email}
                  </span>
                </div>

                {ticket.history && ticket.history.length > 0 ? (
                  <div className="history-list">
                    {ticket.history.map(h => (
                      <div key={h.id} className="history-item">
                        <span className="history-id">#{h.id}</span>
                        <span className="history-subject">{h.subject}</span>
                        <span className={`badge badge-priority-${h.priority?.toLowerCase()}`} style={{ fontSize: '.68rem' }}>{h.priority}</span>
                        <span className={statusBadgeClass(h.status)} style={{ fontSize: '.68rem' }}>{h.status}</span>
                        <span className="history-date">{formatShortDate(h.created_at)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-history">No previous tickets from this customer.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
