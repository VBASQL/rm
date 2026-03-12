// ============================================================
// FILE: CustomerRow.jsx
// PURPOSE: Customer list item — shows name, balance, status, quick action.
// DEPENDS ON: StatusBadge.jsx, react-router-dom
// DEPENDED ON BY: CustomerList page
//
// WHY THIS EXISTS:
//   Each row in the customer list shows key info at a glance and provides
//   a "New Order" shortcut. See BUILD_PLAN.md §5.3.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import styles from '../styles/CustomerRow.module.css';

class CustomerRow extends React.Component {
  handleRowClick = () => {
    this.props.navigate(`/customers/${this.props.customer.id}`);
  };

  handleNewOrder = (e) => {
    // WHY: Stop propagation so row click (→ profile) doesn't fire
    // when the user taps the "New Order" button.
    e.stopPropagation();
    this.props.navigate(`/orders/new?customerId=${this.props.customer.id}`);
  };

  _formatDate(dateStr) {
    if (!dateStr) return 'No orders';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  _getOverdueDays(customer) {
    // WHY: Show overdue badge if customer has balance and any overdue invoice.
    // Simplified for mock — checks if balance > credit limit or status indicates overdue.
    if (customer.balance > customer.creditLimit && customer.creditLimit > 0) {
      return 'Over Limit';
    }
    return null;
  }

  render() {
    const { customer } = this.props;
    const overdue = this._getOverdueDays(customer);

    return (
      <div className={styles.row} onClick={this.handleRowClick} role="button" tabIndex={0}>
        <div className={styles.info}>
          <div className={styles.topLine}>
            <span className={styles.name}>{customer.name}</span>
            <StatusBadge status={customer.status} small />
          </div>
          <div className={styles.details}>
            <span className={styles.lastOrder}>
              Last order: {this._formatDate(customer.lastOrderDate)}
            </span>
            <span className={styles.balance}>
              Balance: ${customer.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              {overdue && <span className={styles.overdueBadge}> {overdue}</span>}
            </span>
          </div>
        </div>
        <button className={styles.newOrderBtn} onClick={this.handleNewOrder}>
          New Order →
        </button>
      </div>
    );
  }
}

function CustomerRowWrapper(props) {
  const navigate = useNavigate();
  return <CustomerRow {...props} navigate={navigate} />;
}

export default CustomerRowWrapper;
