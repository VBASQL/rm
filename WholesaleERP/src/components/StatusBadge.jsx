// ============================================================
// FILE: StatusBadge.jsx
// PURPOSE: Colored status pill component. Shows account/order/invoice status.
// DEPENDS ON: Nothing
// DEPENDED ON BY: CustomerRow, CustomerProfile, OrderDetail, InvoiceList
//
// WHY THIS EXISTS:
//   Consistent status display across the app. Color-coded for quick scanning.
//   See BUILD_PLAN.md §8: "Colored pill: Active/Hold/Overdue/Paid/Partial/etc."
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-13] #001 Removed 'Shipped' from STATUS_COLORS — status no longer exists.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import styles from '../styles/StatusBadge.module.css';

// WHY: Map statuses to color classes. Statuses come from data models
// (Customer.status, Order.status, Invoice.status). Each needs a distinct color.
// [MOD #001] Removed 'Shipped' — flow is now Picking → Delivered.
const STATUS_COLORS = {
  // Customer statuses
  'Active': 'green',
  'Hold': 'red',
  'Inactive': 'gray',
  // Order statuses
  'Draft': 'gray',
  'Submitted': 'blue',
  'Picking': 'yellow',
  'Delivered': 'green',
  'Cancelled': 'red',
  // Invoice statuses
  'Open': 'blue',
  'Partial': 'yellow',
  'Paid': 'green',
  'Overdue': 'red',
  // Payment types
  'credit': 'blue',
  'prepaid': 'green',
  // [MOD #returns-list] Return order statuses
  'Return Pending': 'yellow',
  'Return Processed': 'green',
  // [MOD #returns] Native return statuses (used in ReturnOrder view)
  'Pending': 'yellow',
  'Processed': 'green',
};

class StatusBadge extends React.Component {
  render() {
    const { status, small } = this.props;
    const colorClass = STATUS_COLORS[status] || 'gray';

    return (
      <span className={`${styles.badge} ${styles[colorClass]} ${small ? styles.small : ''}`}>
        {status}
      </span>
    );
  }
}

export default StatusBadge;
