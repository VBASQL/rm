// ============================================================
// FILE: LoadingSpinner.jsx
// PURPOSE: Centered loading indicator.
// DEPENDS ON: Nothing
// DEPENDED ON BY: Any page that loads async data
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import styles from '../styles/LoadingSpinner.module.css';

class LoadingSpinner extends React.Component {
  render() {
    const { message } = this.props;

    return (
      <div className={styles.container}>
        <div className={styles.spinner} />
        {message && <p className={styles.message}>{message}</p>}
      </div>
    );
  }
}

export default LoadingSpinner;
