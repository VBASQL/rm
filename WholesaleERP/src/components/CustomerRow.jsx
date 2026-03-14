// ============================================================
// FILE: CustomerRow.jsx
// PURPOSE: Customer list item — shows name, balance, credit bar,
//          unapplied credit indicator, status, quick order action.
// DEPENDS ON: StatusBadge.jsx, react-router-dom
// DEPENDED ON BY: CustomerList page
//
// WHY THIS EXISTS:
//   Each row in the customer list shows key info at a glance and provides
//   a "New Order" shortcut. See BUILD_PLAN.md §5.3.
//
// MODIFICATION HISTORY (newest first):
//   [MOD #branch] Show branch tag + parent name + address for branch customers.
//     All credit/balance display suppressed for branches (lives on parent).
//   [2026-03-13] #001 Added credit usage bar (green/orange/red), unapplied
//     credit indicator, payment type badge. Balance always visible.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/format';
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

  // [MOD #001] Credit bar color based on usage percentage.
  // WHY: Visual at-a-glance indicator — green (safe), orange (>66%), red (>90% or over).
  _getCreditBarInfo(customer) {
    if (customer.paymentType !== 'credit' || !customer.creditLimit) return null;
    const usage = customer.balance / customer.creditLimit;
    const percent = Math.min(usage * 100, 100);
    let color = 'var(--color-success)';
    if (usage > 0.9) color = 'var(--color-danger)';
    else if (usage > 0.66) color = 'var(--color-warning)';
    return { percent, color, over: usage > 1 };
  }

  render() {
    const { customer, parentName } = this.props;
    const creditBar = this._getCreditBarInfo(customer);

    return (
      <div className={styles.row} onClick={this.handleRowClick} role="button" tabIndex={0}>
        <div className={styles.info}>
          <div className={styles.topLine}>
            <span className={styles.name}>{customer.name}</span>
            {/* [MOD #branch] Visual tag so reps instantly spot branch locations */}
            {customer.isBranch && (
              <span className={styles.branchTag}>Branch</span>
            )}
            {!customer.isBranch && <StatusBadge status={customer.status} small />}
            {/* [MOD #001] Payment type badge — skip for branches (lives on parent) */}
            {!customer.isBranch && (
              <span className={`${styles.typeBadge} ${customer.paymentType === 'prepaid' ? styles.typePrepaid : styles.typeCredit}`}>
                {customer.paymentType === 'prepaid' ? 'Prepaid' : customer.creditTier || 'Credit'}
              </span>
            )}
          </div>

          {/* [MOD #branch] For branches: show parent account name + delivery address. */}
          {customer.isBranch ? (
            <div className={styles.branchMeta}>
              {parentName && (
                <span className={styles.branchParent}>Account: {parentName}</span>
              )}
              {customer.address && (
                <span className={styles.branchAddress}>{customer.address}</span>
              )}
            </div>
          ) : (
            <div className={styles.details}>
              <span className={styles.balance}>
                ${customer.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                {customer.paymentType === 'credit' && customer.creditLimit > 0 && (
                  <span className={styles.creditLimit}> / ${customer.creditLimit.toLocaleString()}</span>
                )}
                {creditBar?.over && <span className={styles.overdueBadge}> Over Limit</span>}
              </span>
              {/* [MOD #001] Unapplied credit indicator */}
              {customer.accountCredit > 0 && (
                <span className={styles.unappliedCredit}>
                  💰 ${customer.accountCredit.toFixed(2)} unapplied
                </span>
              )}
            </div>
          )}

          {/* [MOD #001] Credit usage bar — hidden for branches */}
          {!customer.isBranch && creditBar && (
            <div className={styles.creditBarTrack}>
              <div
                className={styles.creditBarFill}
                style={{ width: `${creditBar.percent}%`, backgroundColor: creditBar.color }}
              />
            </div>
          )}
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
