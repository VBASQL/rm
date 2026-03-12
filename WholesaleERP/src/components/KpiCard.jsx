// ============================================================
// FILE: KpiCard.jsx
// PURPOSE: Dashboard stat card showing a label and large number.
// DEPENDS ON: Nothing
// DEPENDED ON BY: Dashboard page
//
// WHY THIS EXISTS:
//   Dashboard shows 4 KPI cards: Cases Sold Today, Open Orders,
//   Deliveries Today, Alerts. Cases only — no revenue.
//   See BUILD_PLAN.md §5.2 and §7 KPI Display Rules.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import styles from '../styles/KpiCard.module.css';

class KpiCard extends React.Component {
  render() {
    const { icon, value, label, onClick, variant } = this.props;

    return (
      <div
        className={`${styles.card} ${variant ? styles[variant] : ''}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.value}>{value}</span>
        <span className={styles.label}>{label}</span>
      </div>
    );
  }
}

export default KpiCard;
