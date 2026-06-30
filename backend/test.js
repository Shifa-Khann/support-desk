// test.js — Automated Tests for Business Logic
// These tests verify that our helper functions in utils.js work correctly.
// We use Node.js's built-in 'node:test' module — no extra packages needed!
//
// Run with:  node test.js

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateTicket, isUrgent, validateStatus } = require('./utils');

// ─────────────────────────────────────────────────────────────
// SECTION 1: validateTicket tests
// ─────────────────────────────────────────────────────────────

test('validateTicket: valid ticket should pass', () => {
  const ticket = {
    customer_name: 'Alice Smith',
    customer_email: 'alice@example.com',
    subject: 'Login Issue',
    description: 'I cannot log into my account since this morning.',
    priority: 'High',
  };
  const result = validateTicket(ticket);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
});

test('validateTicket: missing name should fail', () => {
  const ticket = {
    customer_name: '',
    customer_email: 'alice@example.com',
    subject: 'Login Issue',
    description: 'I cannot log into my account.',
    priority: 'Medium',
  };
  const result = validateTicket(ticket);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('name')));
});

test('validateTicket: invalid email format should fail', () => {
  const ticket = {
    customer_name: 'Alice',
    customer_email: 'not-an-email',
    subject: 'Billing Problem',
    description: 'I was charged twice for the same order.',
    priority: 'Medium',
  };
  const result = validateTicket(ticket);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('email')));
});

test('validateTicket: short description (< 10 chars) should fail', () => {
  const ticket = {
    customer_name: 'Bob',
    customer_email: 'bob@example.com',
    subject: 'Bug',
    description: 'Short',   // Only 5 characters
    priority: 'Low',
  };
  const result = validateTicket(ticket);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('10 characters')));
});

test('validateTicket: invalid priority should fail', () => {
  const ticket = {
    customer_name: 'Carol',
    customer_email: 'carol@example.com',
    subject: 'Feature Request',
    description: 'I would like to request a new dark mode feature.',
    priority: 'Critical', // Not a valid priority!
  };
  const result = validateTicket(ticket);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('Priority')));
});

test('validateTicket: multiple errors should all be reported', () => {
  const ticket = {
    customer_name: '',
    customer_email: 'bad-email',
    subject: '',
    description: 'short',
    priority: 'URGENT', // invalid
  };
  const result = validateTicket(ticket);
  assert.equal(result.valid, false);
  // All 5 fields are invalid, so we should have 5 errors
  assert.equal(result.errors.length, 5);
});

// ─────────────────────────────────────────────────────────────
// SECTION 2: isUrgent tests
// ─────────────────────────────────────────────────────────────

test('isUrgent: High priority → urgent', () => {
  assert.equal(isUrgent('High', 'Normal description.'), true);
});

test('isUrgent: "urgent" in description (lowercase) → urgent', () => {
  assert.equal(isUrgent('Low', 'This is an urgent matter.'), true);
});

test('isUrgent: "URGENT" in description (uppercase) → urgent', () => {
  assert.equal(isUrgent('Medium', 'URGENT: server is down!'), true);
});

test('isUrgent: Low priority, no "urgent" in description → not urgent', () => {
  assert.equal(isUrgent('Low', 'My invoice has an error.'), false);
});

test('isUrgent: Medium priority, no "urgent" in description → not urgent', () => {
  assert.equal(isUrgent('Medium', 'I need help with my account settings.'), false);
});

// ─────────────────────────────────────────────────────────────
// SECTION 3: validateStatus tests
// ─────────────────────────────────────────────────────────────

test('validateStatus: "Open" is valid', () => {
  assert.equal(validateStatus('Open'), true);
});

test('validateStatus: "In Progress" is valid', () => {
  assert.equal(validateStatus('In Progress'), true);
});

test('validateStatus: "Resolved" is valid', () => {
  assert.equal(validateStatus('Resolved'), true);
});

test('validateStatus: "Closed" is invalid', () => {
  assert.equal(validateStatus('Closed'), false);
});

test('validateStatus: empty string is invalid', () => {
  assert.equal(validateStatus(''), false);
});

test('validateStatus: "open" (lowercase) is invalid (case-sensitive)', () => {
  assert.equal(validateStatus('open'), false);
});
