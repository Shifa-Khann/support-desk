// main.jsx — React Application Entry Point
// This is the very first file React loads.
// It mounts the App component into the #root div in index.html.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// createRoot mounts our React app into the #root div in index.html
createRoot(document.getElementById('root')).render(
  // StrictMode is a development tool that helps catch potential issues
  <StrictMode>
    <App />
  </StrictMode>,
)
