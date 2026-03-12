// ============================================================
// FILE: AuthProvider.jsx
// PURPOSE: Provides authentication context to the entire app.
//          Phase 1 = mock auth via localStorage.
//          Phase 2 = MSAL.js with real Entra tokens.
// DEPENDS ON: authConfig.js
// DEPENDED ON BY: App.jsx, ProtectedRoute.jsx, all pages needing user info
//
// WHY THIS EXISTS:
//   Wraps the app with auth state so any component can check if the user
//   is signed in and access user info. Mock phase lets us build and test
//   every page without waiting for Entra configuration.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation — mock auth only.
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AUTH_CONFIG, MOCK_USER } from './authConfig';

const AuthContext = createContext(null);

const STORAGE_KEY = 'wholesaleErp_auth';

class AuthProvider extends React.Component {
  constructor(props) {
    super(props);
    // WHY: Check localStorage on mount to persist sign-in across page refreshes.
    const stored = localStorage.getItem(STORAGE_KEY);
    this.state = {
      user: stored ? JSON.parse(stored) : null,
      isAuthenticated: !!stored,
      isLoading: false,
      error: null,
    };
  }

  // WHY: Mock sign-in simulates Google/Microsoft login by setting a fake user
  // in localStorage. The login page looks identical to production — only the
  // backend call is mocked. Zero UI changes needed for Phase 2.
  signIn = (method) => {
    try {
      this.setState({ isLoading: true, error: null });

      if (AUTH_CONFIG.isMock) {
        const user = { ...MOCK_USER, signInMethod: method };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        this.setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      }
      // WHY: Phase 2 will add: else { msalInstance.loginRedirect(...) }
    } catch (err) {
      this.setState({
        error: 'Sign-in failed. Please try again.',
        isLoading: false,
      });
    }
  };

  signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    this.setState({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  };

  render() {
    const value = {
      user: this.state.user,
      isAuthenticated: this.state.isAuthenticated,
      isLoading: this.state.isLoading,
      error: this.state.error,
      signIn: this.signIn,
      signOut: this.signOut,
    };

    return (
      <AuthContext.Provider value={value}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

// WHY: Custom hook for cleaner component access — avoids importing
// AuthContext directly in every file.
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
export default AuthProvider;
