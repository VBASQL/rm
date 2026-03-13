// ============================================================
// FILE: App.jsx
// PURPOSE: Root application component. Wraps providers, defines routes,
//          renders the app shell (header, bottom nav) on authenticated pages.
// DEPENDS ON: AuthProvider, AppProvider, CartProvider, ProtectedRoute,
//             BottomNav, ErrorBoundary, Toast, all page components
// DEPENDED ON BY: main.jsx
//
// WHY THIS EXISTS:
//   Central hub that composes the provider stack, route table, and shell
//   layout. Every authenticated page gets BottomNav and page padding.
//   Login has its own layout. See BUILD_PLAN.md §4 (App shell).
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React, { useState, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// Providers
import { AuthProvider } from './auth/AuthProvider';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './auth/ProtectedRoute';

// Shell components
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerList from './pages/CustomerList';
import AddCustomer from './pages/AddCustomer';
import CustomerProfile from './pages/CustomerProfile';
import NewOrder from './pages/NewOrder';
import OrderDetail from './pages/OrderDetail';
import OrderHistory from './pages/OrderHistory';
import Payment from './pages/Payment';
import Reports from './pages/Reports';
import InvoiceDetail from './pages/InvoiceDetail';
import Settings from './pages/Settings';

// WHY: Toast state lives at App level so any page can trigger a notification.
// This is simpler than adding toast logic to every context.
const TOAST_DURATION = 3000;

class App extends React.Component {
  render() {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <AppProvider>
            <CartProvider>
              <AppShell />
            </CartProvider>
          </AppProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  }
}

// WHY: Functional inner component that uses hooks for toast state and location.
// App class wraps providers; AppShell handles layout and routing.
function AppShell() {
  const location = useLocation();
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), TOAST_DURATION);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // WHY: Hide bottom nav on login page — login has its own full-screen layout.
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes — all require authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomerList showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/new"
          element={
            <ProtectedRoute>
              <AddCustomer showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <ProtectedRoute>
              <CustomerProfile showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/new"
          element={
            <ProtectedRoute>
              <NewOrder showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrderHistory showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/:id"
          element={
            <ProtectedRoute>
              <InvoiceDetail showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Payment showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports showToast={showToast} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings showToast={showToast} />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Bottom nav on all authenticated pages */}
      {!isLoginPage && <BottomNav />}

      {/* Global toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={dismissToast}
        />
      )}
    </>
  );
}

export default App;
