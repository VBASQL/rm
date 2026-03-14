// ============================================================
// FILE: BottomNav.jsx
// PURPOSE: Mobile bottom tab bar + FAB for primary navigation.
//          5 regular tabs: Home, Customers, Orders, Pay, Reports.
//          Separate FAB (round +) floats above nav bottom-right for New Order.
// DEPENDS ON: react-router-dom, lucide-react
// DEPENDED ON BY: All authenticated pages (rendered by App shell)
//
// WHY THIS EXISTS:
//   Mobile-first app — bottom nav is the primary navigation pattern.
//   FAB pattern (Material Design / iOS standard) keeps New Order always
//   reachable without displacing a nav slot. Thumb zone = bottom-right.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] Restored 5 nav tabs; moved New Order to standard FAB.
//   [2026-03-14] Reduced to 5 items with center raised button.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, ClipboardList, DollarSign, BarChart3, Plus } from 'lucide-react';
import styles from '../styles/BottomNav.module.css';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home, exact: true },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/orders', label: 'Orders', icon: ClipboardList, exact: true },
  { path: '/payments', label: 'Pay', icon: DollarSign },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

class BottomNav extends React.Component {
  handleNavigate = (path) => {
    this.props.navigate(path);
  };

  render() {
    const { currentPath, hideFab } = this.props;
    const isFabActive = currentPath === '/orders/new';

    return (
      <>
        {/* WHY: FAB is hidden on pages that have their own bottom action bars
            or where New Order is contextually irrelevant/redundant. */}
        {!hideFab && (
          <button
            className={`${styles.fab} ${isFabActive ? styles.fabActive : ''}`}
            onClick={() => this.handleNavigate('/orders/new')}
            aria-label="New Order"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        )}

        <nav className={styles.bottomNav}>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = item.exact
              ? currentPath === item.path
              : currentPath === item.path || currentPath.startsWith(item.path + '/');

            return (
              <button
                key={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => this.handleNavigate(item.path)}
                aria-label={item.label}
              >
                <Icon size={22} />
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </>
    );
  }
}

// WHY: Paths where the FAB is hidden — either redundant (already on that page)
// or has its own fixed bottom action bar that the FAB would overlap.
function shouldHideFab(path) {
  return (
    path === '/orders/new' ||       // already creating — redundant
    path === '/payments' ||          // payBar occupies the same bottom zone
    path === '/customers/new' ||     // form page, no value
    path === '/settings' ||          // config page, not a sales action
    path.startsWith('/returns')      // return flow has its own submit bar
  );
}

// WHY: Functional wrapper for router hooks.
function BottomNavWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <BottomNav
      currentPath={location.pathname}
      navigate={navigate}
      hideFab={shouldHideFab(location.pathname)}
    />
  );
}

export default BottomNavWrapper;
