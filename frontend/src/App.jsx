// App.jsx — Root component: navigation, theme, layout
import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import './index.css';

// SVG icon components (inline, no deps)
function IconGrid(p)    { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>; }
function IconTicket(p)  { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>; }
function IconPlus(p)    { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>; }
function IconMoon(p)    { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>; }
function IconSun(p)     { return <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>; }

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   Icon: IconGrid   },
  { id: 'list',      label: 'All Tickets', Icon: IconTicket },
  { id: 'create',    label: 'New Ticket',  Icon: IconPlus   },
];

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  // Persist theme in localStorage
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  function renderPage() {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
      case 'list':      return <TicketList />;
      case 'create':    return <TicketForm onSuccess={() => setCurrentView('list')} />;
      default:          return <Dashboard onNavigate={setCurrentView} />;
    }
  }

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">
            <IconTicket width="16" height="16" />
          </div>
          <h1>
            SupportDesk
            <span className="logo-sub">Ticket System</span>
          </h1>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-item ${currentView === id ? 'active' : ''}`}
              onClick={() => setCurrentView(id)}
              id={`nav-${id}`}
              aria-current={currentView === id ? 'page' : undefined}
            >
              <Icon className="nav-icon" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="sidebar-footer">
          <button
            className="theme-toggle"
            onClick={() => setIsDark(p => !p)}
            id="theme-toggle-btn"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark
              ? <><IconSun className="nav-icon" /><span>Light mode</span></>
              : <><IconMoon className="nav-icon" /><span>Dark mode</span></>
            }
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content" role="main">
        <div className="page-shell">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
