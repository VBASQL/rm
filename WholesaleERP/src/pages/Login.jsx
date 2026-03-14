// ============================================================
// FILE: Login.jsx
// PURPOSE: Login page with Google and Microsoft sign-in buttons.
//          Phase 1 = mock auth. Phase 2 = real MSAL redirect.
// DEPENDS ON: AuthProvider.jsx (useAuth hook)
// DEPENDED ON BY: App.jsx (route: /login)
//
// WHY THIS EXISTS:
//   Entry point for unauthenticated users. Two sign-in options per
//   BUILD_PLAN.md §3: Google (primary) and Email via Microsoft (fallback).
//   UI is identical for mock and real auth — only the backend call changes.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation — mock auth.
// ============================================================
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import MockFeatureBanner from '../components/MockFeatureBanner';
import styles from '../styles/Login.module.css';

class LoginPage extends React.Component {
  handleGoogleSignIn = () => {
    this.props.signIn('google');
  };

  handleMicrosoftSignIn = () => {
    this.props.signIn('microsoft');
  };

  render() {
    const { isAuthenticated, isLoading, error } = this.props;
    const from = this.props.location?.state?.from?.pathname || '/';

    // WHY: If already signed in, skip login and go to where user was heading.
    // See BUILD_PLAN.md §5.1: "If already signed in, auto-redirect to dashboard."
    if (isAuthenticated) {
      return <Navigate to={from} replace />;
    }

    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.logo}>
            {/* WHY: Placeholder logo — user will provide real company logo.
                See BUILD_PLAN.md §12, item #3. */}
            <div className={styles.logoIcon}>📦</div>
            <h1 className={styles.logoText}>WholesaleERP</h1>
          </div>

          <MockFeatureBanner
            title="Demo Login"
            description="Sign-in is simulated. In production, this authenticates via Google OAuth or Microsoft Entra ID — no hardcoded accounts exist."
          />

          {error && (
            <div className={styles.errorMessage}>{error}</div>
          )}

          <button
            className={`${styles.signInButton} ${styles.googleButton}`}
            onClick={this.handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className={styles.buttonIcon} viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <button
            className={`${styles.signInButton} ${styles.microsoftButton}`}
            onClick={this.handleMicrosoftSignIn}
            disabled={isLoading}
          >
            <svg className={styles.buttonIcon} viewBox="0 0 21 21" width="20" height="20">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Log in with Email via Microsoft
          </button>

          <p className={styles.footerText}>
            Only authorized users can sign in.<br />
            Contact your admin for access.
          </p>
        </div>
      </div>
    );
  }
}

// WHY: Functional wrapper to inject hooks into class component.
function Login() {
  const auth = useAuth();
  const location = useLocation();
  return <LoginPage {...auth} location={location} />;
}

export default Login;
