// TicketForm.jsx — Create New Ticket Form Component
// Handles the form for submitting a new support ticket.
// Sends a POST request to /api/tickets.
// Includes live client-side validation with error messages.

import { useState } from 'react';

const API_URL = 'http://localhost:3001/api';

export default function TicketForm({ onSuccess }) {
  // Form field state — one piece of state for all fields
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium', // Default priority
  });

  // Track which fields have been "touched" (user interacted with them)
  // so we only show errors after the user has tried to fill the field
  const [touched, setTouched] = useState({});

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState([]); // Errors from the backend
  const [success, setSuccess] = useState(false);

  // Update form state when a field changes
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Mark field as touched when user types
    setTouched(prev => ({ ...prev, [name]: true }));
  }

  // Mark a field as touched when user leaves it (onBlur)
  function handleBlur(e) {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  }

  // ─── Client-side validation (mirrors backend utils.js) ───
  function getFieldError(field) {
    const value = form[field];

    if (field === 'customer_name' && (!value || value.trim().length === 0)) {
      return 'Customer name is required.';
    }

    if (field === 'customer_email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value || !emailRegex.test(value.trim())) {
        return 'Please enter a valid email address.';
      }
    }

    if (field === 'subject' && (!value || value.trim().length === 0)) {
      return 'Subject is required.';
    }

    if (field === 'description' && (!value || value.trim().length < 10)) {
      return 'Description must be at least 10 characters.';
    }

    if (field === 'priority' && !['Low', 'Medium', 'High'].includes(value)) {
      return 'Please select a priority.';
    }

    return null; // No error
  }

  // Check if form is entirely valid (used to disable submit button)
  const fields = ['customer_name', 'customer_email', 'subject', 'description', 'priority'];
  const isFormValid = fields.every(f => !getFieldError(f));

  // ─── Form Submission ───
  async function handleSubmit(e) {
    e.preventDefault();

    // Mark all fields as touched so errors appear
    setTouched(Object.fromEntries(fields.map(f => [f, true])));

    if (!isFormValid) return; // Don't submit if client-side validation fails

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
        // Backend returned validation errors
        setServerErrors(data.details || [data.error]);
        return;
      }

      // ✅ Success!
      setSuccess(true);
      setForm({ customer_name: '', customer_email: '', subject: '', description: '', priority: 'Medium' });
      setTouched({});

      // Notify parent component so it can refresh the ticket list
      if (onSuccess) onSuccess(data);

    } catch (err) {
      setServerErrors(['Network error — is the backend server running?']);
    } finally {
      setSubmitting(false);
    }
  }

  // Helper: gets the CSS class for a field (adds 'error' class if invalid & touched)
  function fieldClass(field, base = 'form-input') {
    return `${base} ${touched[field] && getFieldError(field) ? 'error' : ''}`;
  }

  // Check if ticket will be urgent (for live preview)
  const willBeUrgent =
    form.priority === 'High' ||
    form.description.toLowerCase().includes('urgent');

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2>Submit a Support Ticket</h2>
        <p>Fill out the form below to open a new customer support request.</p>
      </div>

      <div className="card" style={{ maxWidth: '720px' }}>
        {/* Success Message */}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            ✅ Ticket submitted successfully! You can{' '}
            <button
              style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => setSuccess(false)}
            >
              submit another
            </button>.
          </div>
        )}

        {/* Server-side Errors */}
        {serverErrors.length > 0 && (
          <div className="alert alert-error">
            <div>
              <strong>⚠️ Please fix the following errors:</strong>
              <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
                {serverErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Urgent Preview Badge */}
        {willBeUrgent && (form.priority || form.description) && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            🚨 This ticket will be flagged as <strong>URGENT</strong>
            {form.priority === 'High' ? ' (High priority)' : ' ("urgent" in description)'}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name + Email row */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="customer_name">
                Customer Name <span>*</span>
              </label>
              <input
                id="customer_name"
                name="customer_name"
                type="text"
                className={fieldClass('customer_name')}
                value={form.customer_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Alice Smith"
                autoComplete="off"
              />
              {touched.customer_name && getFieldError('customer_name') && (
                <span className="form-error">⚠ {getFieldError('customer_name')}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customer_email">
                Email Address <span>*</span>
              </label>
              <input
                id="customer_email"
                name="customer_email"
                type="email"
                className={fieldClass('customer_email')}
                value={form.customer_email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. alice@example.com"
              />
              {touched.customer_email && getFieldError('customer_email') && (
                <span className="form-error">⚠ {getFieldError('customer_email')}</span>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="form-group">
            <label className="form-label" htmlFor="subject">
              Subject <span>*</span>
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
              <span className="form-error">⚠ {getFieldError('subject')}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description <span>*</span>
            </label>
            <textarea
              id="description"
              name="description"
              className={fieldClass('description', 'form-textarea')}
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Please describe the issue in detail (minimum 10 characters)..."
            />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
              {form.description.length} chars
              {form.description.length < 10 && form.description.length > 0 && (
                <span style={{ color: 'var(--color-high)' }}> (need {10 - form.description.length} more)</span>
              )}
            </span>
            {touched.description && getFieldError('description') && (
              <span className="form-error">⚠ {getFieldError('description')}</span>
            )}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label" htmlFor="priority">
              Priority <span>*</span>
            </label>
            <select
              id="priority"
              name="priority"
              className={fieldClass('priority', 'form-select')}
              value={form.priority}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="Low">🟢 Low</option>
              <option value="Medium">🟡 Medium</option>
              <option value="High">🔴 High (Urgent)</option>
            </select>
            {touched.priority && getFieldError('priority') && (
              <span className="form-error">⚠ {getFieldError('priority')}</span>
            )}
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="submit-ticket-btn"
            >
              {submitting ? '⏳ Submitting...' : '🚀 Submit Ticket'}
            </button>
          </div>
        </form>
      </div>

      {/* Info tip */}
      <div className="alert alert-info" style={{ marginTop: '24px', maxWidth: '720px' }}>
        💡 <strong>Interview tip:</strong> Validation runs on both the frontend AND backend. The backend uses <code>utils.js</code> to validate and detect urgency independently of the frontend.
      </div>
    </div>
  );
}
