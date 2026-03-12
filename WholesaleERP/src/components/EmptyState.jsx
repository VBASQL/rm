// ============================================================
// FILE: EmptyState.jsx
// PURPOSE: Friendly placeholder when a list has zero items.
// DEPENDS ON: lucide-react
// DEPENDED ON BY: CustomerList, OrderHistory, Reports
//
// WHY THIS EXISTS:
//   Every list page must show a clear empty state with an optional
//   action button instead of white space.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import styles from '../styles/EmptyState.module.css';

class EmptyState extends React.Component {
  render() {
    const { icon, title, message, actionLabel, onAction } = this.props;

    return (
      <div className={styles.container}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <h3 className={styles.title}>{title}</h3>
        {message && <p className={styles.message}>{message}</p>}
        {actionLabel && onAction && (
          <button className={`btn btn-primary ${styles.action}`} onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    );
  }
}

export default EmptyState;
