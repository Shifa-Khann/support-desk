// App.jsx — Main Application Component
// This is the root of the React app. It manages:
//   1. Which page/view is currently active (navigation)
//   2. Dark/Light mode theme toggle
//   3. Rendering the sidebar and main content area

import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import './index.css';

// Navigation items shown in the sidebar
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    icon: '📊' },
  { id: 'list',      label: 'All Tickets',  icon: '📋' },
  { id: 'create',    label: 'New Ticket',   icon: '➕' },
];

export default function App() {
  // Track which page is visible
  const [currentView, setCurrentView] = useState('dashboard');

  // Track dark/light mode — persisted in localStorage so it survives page refresh
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Apply theme to the <html> element whenever isDark changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  function toggleTheme() {
    setIsDark(prev => !prev);
  }

  // When a ticket is created successfully, navigate to the ticket list
  function handleTicketCreated() {
    setCurrentView('list');
  }

  // Render the correct page component based on currentView
  function renderPage() {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'list':
        return <TicketList />;
      case 'create':
        return <TicketForm onSuccess={handleTicketCreated} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  }

  return (
    <div className="app-layout">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="logo-icon">🎫</span>
          <h1>Support<span>Desk</span></h1>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id)}
              id={`nav-${item.id}`}
              aria-current={currentView === item.id ? 'page' : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Theme Toggle at Bottom */}
        <div className="sidebar-footer">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            id="theme-toggle-btn"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <span>{isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
            <div className={`toggle-switch ${isDark ? 'on' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content" role="main">
        {renderPage()}
      </main>
    </div>
  );
}
