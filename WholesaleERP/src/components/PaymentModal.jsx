// ============================================================
// FILE: PaymentModal.jsx
// PURPOSE: Overlay modal for applying a payment — amount input,
//          payment method buttons, reference field.
// DEPENDS ON: (none — standalone modal)
// DEPENDED ON BY: Payment.jsx
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.9: Payment Modal with invoice selection,
//   editable amount, payment method (Cash, Check, Credit Card,
//   ACH/Wire), reference number, APPLY PAYMENT button.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { X, Banknote, CreditCard, FileText, Building2 } from 'lucide-react';
import styles from '../styles/PaymentModal.module.css';

const METHODS = [
  { key: 'cash', label: 'Cash', icon: Banknote },
  { key: 'check', label: 'Check', icon: FileText },
  { key: 'credit_card', label: 'Card', icon: CreditCard },
  { key: 'ach', label: 'ACH/Wire', icon: Building2 },
];

class PaymentModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: props.suggestedAmount || 0,
      method: 'cash',
      reference: '',
    };
  }

  _handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    this.setState({ amount: val });
  };

  _handleSubmit = () => {
    const { onApply } = this.props;
    const { amount, method, reference } = this.state;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    onApply({ amount: numAmount, method, reference });
  };

  _formatCurrency(amt) {
    return '$' + Number(amt).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  render() {
    const { customer, selectedInvoices, onClose } = this.props;
    const { amount, method, reference } = this.state;
    const numAmount = parseFloat(amount) || 0;

    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.header}>
            <h3>Apply Payment</h3>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={22} />
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.custInfo}>
              <span className={styles.custName}>{customer.name}</span>
              <span className={styles.invCount}>
                {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected
              </span>
            </div>

            {/* Amount */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Payment Amount</label>
              <div className={styles.amountWrap}>
                <span className={styles.amountPrefix}>$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className={styles.amountInput}
                  value={amount}
                  onChange={this._handleAmountChange}
                />
              </div>
            </div>

            {/* Method */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Payment Method</label>
              <div className={styles.methodGrid}>
                {METHODS.map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.key}
                      className={`${styles.methodBtn} ${method === m.key ? styles.methodActive : ''}`}
                      onClick={() => this.setState({ method: m.key })}
                    >
                      <Icon size={20} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Reference # (optional)</label>
              <input
                type="text"
                className={styles.refInput}
                placeholder="Check number, transaction ID…"
                value={reference}
                onChange={e => this.setState({ reference: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px' }}
              onClick={this._handleSubmit}
              disabled={numAmount <= 0}
            >
              Apply {this._formatCurrency(numAmount)}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default PaymentModal;
