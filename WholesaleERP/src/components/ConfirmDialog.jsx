// ============================================================
// FILE: ConfirmDialog.jsx
// PURPOSE: Modal confirmation dialog for destructive actions.
// DEPENDS ON: Nothing
// DEPENDED ON BY: Cancel Order, Remove Item, Reset App Data
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §8: "ConfirmDialog — OK/Cancel before destructive action."
//   DEVELOPMENT_RULES.md: any destructive action needs user confirmation.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import styles from '../styles/ConfirmDialog.module.css';

class ConfirmDialog extends React.Component {
  // WHY: Stop clicks on the dialog panel from closing the overlay
  handlePanelClick = (e) => {
    e.stopPropagation();
  };

  render() {
    const { title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger } = this.props;

    return (
      <div className={styles.overlay} onClick={onCancel}>
        <div className={styles.dialog} onClick={this.handlePanelClick} role="dialog" aria-modal="true">
          <h3 className={styles.title}>{title}</h3>
          {message && <p className={styles.message}>{message}</p>}
          <div className={styles.actions}>
            <button className={`btn btn-secondary ${styles.cancelBtn}`} onClick={onCancel}>
              {cancelLabel}
            </button>
            <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'} ${styles.confirmBtn}`} onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ConfirmDialog;
