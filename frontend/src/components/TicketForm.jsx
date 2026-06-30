// TicketForm.jsx — Create new ticket form with live validation
import { useState } from 'react';

const API_URL = 'http://localhost:3001/api';

// Inline SVG icons
function IconWarn(p)    { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>; }
function IconCheck(p)   { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>; }
function IconSend(p)    { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>; }
function IconAlert(p)   { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>; }
function IconLoader(p)  { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>; }

const FIELDS = ['customer_name', 'customer_email', 'subject', 'description', 'priority'];

export default function TicketForm({ onSuccess }) {
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium',
  });

  // Track which fields the user has interacted with
  const [touched, setTouched]         = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [success, setSuccess]         = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  }

  function handleBlur(e) {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  }

  // Client-side validation (mirrors backend utils.js)
  function getFieldError(field) {
    const v = form[field];
    if (field === 'customer_name' && (!v || !v.trim()))
      return 'Customer name is required.';
    if (field === 'customer_email') {
      if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
        return 'Please enter a valid email address.';
    }
    if (field === 'subject' && (!v || !v.trim()))
      return 'Subject is required.';
    if (field === 'description' && (!v || v.trim().length < 10))
      return 'Description must be at least 10 characters.';
    if (field === 'priority' && !['Low', 'Medium', 'High'].includes(v))
      return 'Please select a priority.';
    return null;
  }

  const isFormValid = FIELDS.every(f => !getFieldError(f));

  const willBeUrgent =
    form.priority === 'High' ||
    form.description.toLowerCase().includes('urgent');

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched(Object.fromEntries(FIELDS.map(f => [f, true])));
    if (!isFormValid) return;

    setSubmitting(true);
    setServerErrors([]);

    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerErrors(data.details || [data.error]);
        return;
      }

      setSuccess(true);
      setForm({ customer_name: '', customer_email: '', subject: '', description: '', priority: 'Medium' });
      setTouched({});
      if (onSuccess) onSuccess(data);
    } catch {
      setServerErrors(['Network error — is the backend server running?']);
    } finally {
      setSubmitting(false);
    }
  }

  function fieldClass(field, base = 'form-input') {
    return `${base} ${touched[field] && getFieldError(field) ? 'error' : ''}`;
  }

  const descLen = form.description.length;

  return (
    <div>
      <div className="page-header">
        <h2>New Support Ticket</h2>
        <p>Fill out the form below to open a support request.</p>
      </div>

      <div className="card" style={{ maxWidth: '680px' }}>
        {/* Success banner */}
        {success && (
          <div className="alert alert-success">
            <IconCheck width="15" height="15" />
            <span>
              Ticket submitted!{' '}
              <button
                style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}
                onClick={() => setSuccess(false)}
              >
                Submit another
              </button>
            </span>
          </div>
        )}

        {/* Server errors */}
        {serverErrors.length > 0 && (
          <div className="alert alert-error">
            <IconWarn width="15" height="15" />
            <div>
              <strong>Please fix the following:</strong>
              <ul style={{ marginTop: '4px', paddingLeft: '18px', fontWeight: 400 }}>
                {serverErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Urgent preview */}
        {willBeUrgent && (form.priority || form.description) && (
          <div className="alert alert-warning">
            <IconAlert width="15" height="15" />
            <span>
              This ticket will be flagged as <strong>urgent</strong>
              {form.priority === 'High' ? ' (High priority)' : ' ("urgent" keyword in description)'}.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name + Email */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="customer_name">
                Customer Name <span className="req">*</span>
              </label>
              <input
                id="customer_name"
                name="customer_name"
                type="text"
                className={fieldClass('customer_name')}
                value={form.customer_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Alice Smith"
                autoComplete="off"
              />
              {touched.customer_name && getFieldError('customer_name') && (
                <span className="form-error">
                  <IconWarn width="12" height="12" />
                  {getFieldError('customer_name')}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customer_email">
                Email Address <span className="req">*</span>
              </label>
              <input
                id="customer_email"
                name="customer_email"
                type="email"
                className={fieldClass('customer_email')}
                value={form.customer_email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="alice@example.com"
              />
              {touched.customer_email && getFieldError('customer_email') && (
                <span className="form-error">
                  <IconWarn width="12" height="12" />
                  {getFieldError('customer_email')}
                </span>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="form-group">
            <label className="form-label" htmlFor="subject">
              Subject <span className="req">*</span>
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              className={fieldClass('subject')}
              value={form.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Brief summary of the issue"
            />
            {touched.subject && getFieldError('subject') && (
              <span className="form-error">
                <IconWarn width="12" height="12" />
                {getFieldError('subject')}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description <span className="req">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className={fieldClass('description', 'form-textarea')}
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describe the issue in detail (minimum 10 characters)..."
            />
            <div className={`char-counter ${descLen > 0 && descLen < 10 ? 'warn' : ''}`}>
              <span>{descLen} chars</span>
              {descLen > 0 && descLen < 10 && (
                <span>{10 - descLen} more needed</span>
              )}
            </div>
            {touched.description && getFieldError('description') && (
              <span className="form-error">
                <IconWarn width="12" height="12" />
                {getFieldError('description')}
              </span>
            )}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">
              Priority <span className="req">*</span>
            </label>
            <div className="priority-pills">
              {['Low', 'Medium', 'High'].map(p => (
                <button
                  key={p}
                  type="button"
                  className={`priority-pill ${form.priority === p ? `active-${p.toLowerCase()}` : ''}`}
                  onClick={() => {
                    setForm(prev => ({ ...prev, priority: p }));
                    setTouched(prev => ({ ...prev, priority: true }));
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            {/* Hidden select for accessibility / form semantics */}
            <input type="hidden" name="priority" value={form.priority} />
          </div>

          <div className="divider" />

          {/* Submit */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="submit-ticket-btn"
            >
              {submitting
                ? <><IconLoader width="14" height="14" style={{ animation: 'spin .65s linear infinite' }} /> Submitting...</>
                : <><IconSend width="14" height="14" /> Submit Ticket</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
