// ============================================================
// FILE: MockFeatureBanner.jsx
// PURPOSE: Amber callout banner that labels any demo-only feature
//          so stakeholders and testers know it's a showcase —
//          not how the feature will work in production.
// DEPENDS ON: Nothing
// DEPENDED ON BY: Login.jsx, OrderDetail.jsx, Settings.jsx, PaymentModal.jsx
//
// WHY THIS EXISTS:
//   The same app is shown to stakeholders as a production frontend
//   and as a demo. Several features are intentionally simulated
//   (mock auth, manual status advance, discount cap editor,
//   payment processing) so reviewers can see the full flow.
//   Without a clear visual label, reviewers may think these
//   behaviors ARE the production behavior and raise incorrect concerns.
//
// PROPS:
//   title       — Short bold label, e.g. "Demo Feature"
//   description — One-to-two sentence explanation of what's real in prod
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] Initial creation.
// ============================================================
import React from 'react';
import styles from '../styles/MockFeatureBanner.module.css';

class MockFeatureBanner extends React.Component {
  render() {
    const { title, description } = this.props;
    return (
      <div className={styles.banner}>
        <span className={styles.icon}>🧪</span>
        <div className={styles.text}>
          <span className={styles.title}>{title}</span>
          <span className={styles.desc}>{description}</span>
        </div>
      </div>
    );
  }
}

export default MockFeatureBanner;
