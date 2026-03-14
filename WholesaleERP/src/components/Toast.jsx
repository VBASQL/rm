// ============================================================
// FILE: Toast.jsx
// PURPOSE: Temporary confirmation/error message that auto-dismisses.
// DEPENDS ON: lucide-react
// DEPENDED ON BY: AppContext (provides showToast), pages that trigger actions
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §4 (Global Shell) specifies a floating toast for
//   confirmations ("Order submitted!", "Payment recorded") and errors.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';
import styles from '../styles/Toast.module.css';

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
};

class Toast extends React.Component {
  render() {
    const { message, type = 'success', onDismiss } = this.props;
    const IconComp = ICONS[type] || CheckCircle;

    return (
      <div className={`${styles.toast} ${styles[type]}`} role="alert">
        <IconComp size={18} className={styles.icon} />
        <span className={styles.message}>{message}</span>
        <button className={styles.close} onClick={onDismiss} aria-label="Dismiss">
          <X size={16} />
        </button>
      </div>
    );
  }
}

export default Toast;
