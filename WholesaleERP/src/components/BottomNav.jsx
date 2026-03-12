// ============================================================
// FILE: BottomNav.jsx
// PURPOSE: Mobile bottom tab bar for primary navigation.
//          5 tabs: Home, Customers, +New Order, Payments, Reports.
// DEPENDS ON: react-router-dom, lucide-react
// DEPENDED ON BY: All authenticated pages (rendered by App shell)
//
// WHY THIS EXISTS:
//   Mobile-first app — bottom nav is the primary navigation pattern
//   for phone screens. Thumb-accessible, always visible.
//   See BUILD_PLAN.md §5.2 bottom nav spec.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, PlusCircle, DollarSign, BarChart3 } from 'lucide-react';
import styles from '../styles/BottomNav.module.css';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/orders/new', label: 'New', icon: PlusCircle, isCenter: true },
  { path: '/payments', label: 'Pay', icon: DollarSign },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

class BottomNav extends React.Component {
  handleNavigate = (path) => {
    this.props.navigate(path);
  };

  render() {
    const { currentPath } = this.props;

    return (
      <nav className={styles.bottomNav}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentPath === item.path ||
            (item.path !== '/' && currentPath.startsWith(item.path));

          return (
            <button
              key={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''} ${item.isCenter ? styles.centerItem : ''}`}
              onClick={() => this.handleNavigate(item.path)}
              aria-label={item.label}
            >
              <Icon size={item.isCenter ? 28 : 22} />
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }
}

// WHY: Functional wrapper for router hooks.
function BottomNavWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  return <BottomNav currentPath={location.pathname} navigate={navigate} />;
}

export default BottomNavWrapper;
