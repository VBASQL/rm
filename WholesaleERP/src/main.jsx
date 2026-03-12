// ============================================================
// FILE: main.jsx
// PURPOSE: Application entry point. Mounts React app to DOM.
// DEPENDS ON: App.jsx
// DEPENDED ON BY: index.html (script tag)
//
// WHY THIS EXISTS:
//   Standard React entry — renders the root App component into #root.
//   BrowserRouter wraps here so all child components have routing context.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
