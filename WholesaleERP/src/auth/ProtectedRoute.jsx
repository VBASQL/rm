// ============================================================
// FILE: ProtectedRoute.jsx
// PURPOSE: Route guard that redirects unauthenticated users to /login.
// DEPENDS ON: AuthProvider.jsx (useAuth hook)
// DEPENDED ON BY: App.jsx (wraps all authenticated routes)
//
// WHY THIS EXISTS:
//   Prevents unauthenticated access to any page except login.
//   If the user isn't signed in, they get sent to /login.
//   If they are, the child route renders normally.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

class ProtectedRoute extends React.Component {
  render() {
    const { isAuthenticated, children } = this.props;
    const location = this.props.location;

    if (!isAuthenticated) {
      // WHY: Pass current location as state so after login we can redirect
      // the user back to where they were trying to go.
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
  }
}

// WHY: Functional wrapper to inject hooks into the class component.
// Class component follows Rule #1 (OOP). Hooks provide router context.
function ProtectedRouteWrapper({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <ProtectedRoute isAuthenticated={isAuthenticated} location={location}>
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRouteWrapper;
