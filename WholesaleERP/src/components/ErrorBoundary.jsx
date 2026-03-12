// ============================================================
// FILE: ErrorBoundary.jsx
// PURPOSE: Catches rendering errors so the whole app doesn't crash.
// DEPENDS ON: Nothing
// DEPENDED ON BY: App.jsx (wraps the entire router)
//
// WHY THIS EXISTS:
//   DEVELOPMENT_RULES.md requires every component boundary to have
//   an error boundary. This is the top-level catch-all.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // WHY: In Phase 2, ship this to Application Insights.
    // For now, console.error is sufficient.
    console.error('[ErrorBoundary] Caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          padding: '24px',
          textAlign: 'center',
        }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>Something went wrong</h2>
          <p style={{ color: '#5f6368', margin: '0 0 16px', fontSize: '0.875rem' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 24px',
              background: '#1a73e8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
