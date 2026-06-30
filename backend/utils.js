// utils.js — Business Logic Helpers
// These functions are kept separate from server.js to keep the code clean and testable.
// Each function does ONE thing, which is a best practice in software engineering.

/**
 * validateTicket
 * Validates the fields of a ticket before it is saved to the database.
 *
 * @param {object} ticket - The ticket data from the request body
 * @returns {{ valid: boolean, errors: string[] }} - Result with list of validation errors
 */
function validateTicket({ customer_name, customer_email, subject, description, priority }) {
  const errors = [];

  // --- Name validation ---
  if (!customer_name || customer_name.trim().length === 0) {
    errors.push('Customer name is required.');
  }

  // --- Email validation ---
  // We use a standard email regular expression to verify the format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!customer_email || !emailRegex.test(customer_email.trim())) {
    errors.push('A valid customer email is required (e.g. user@example.com).');
  }

  // --- Subject validation ---
  if (!subject || subject.trim().length === 0) {
    errors.push('Subject is required.');
  }

  // --- Description validation ---
  // Must be at least 10 characters so we have enough context about the issue
  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long.');
  }

  // --- Priority validation ---
  const validPriorities = ['Low', 'Medium', 'High'];
  if (!priority || !validPriorities.includes(priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * isUrgent
 * Determines if a ticket should be flagged as "urgent".
 *
 * A ticket is urgent if:
 * - Its priority is 'High', OR
 * - Its description contains the word "urgent" (case-insensitive)
 *
 * @param {string} priority - Ticket priority ('Low', 'Medium', 'High')
 * @param {string} description - Ticket description text
 * @returns {boolean} - true if urgent, false otherwise
 */
function isUrgent(priority, description) {
  if (priority === 'High') return true;
  if (description && description.toLowerCase().includes('urgent')) return true;
  return false;
}

/**
 * validateStatus
 * Validates a status value before updating a ticket.
 *
 * @param {string} status - The proposed new status
 * @returns {boolean} - true if valid
 */
function validateStatus(status) {
  const validStatuses = ['Open', 'In Progress', 'Resolved'];
  return validStatuses.includes(status);
}

// Export all helper functions so they can be imported by server.js and test.js
module.exports = { validateTicket, isUrgent, validateStatus };
