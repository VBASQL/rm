// ============================================================
// FILE: PaymentModal.jsx
// PURPOSE: Overlay modal for applying a payment — amount input,
//          payment method buttons, reference field.
// DEPENDS ON: (none — standalone modal)
// DEPENDED ON BY: Payment.jsx, NewOrder.jsx
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.9: Payment Modal with invoice selection,
//   editable amount, payment method (Cash, Check, Credit Card,
//   ACH/Wire, Account Credit), reference number, APPLY PAYMENT button.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] #003 Improved charging UX — shows "Charge Visa ••••4242"
//     button text, "No card on file" message with Send Link option,
//     better processing/success states showing which card was charged.
//   [2026-03-13] #002 Added mock CC/ACH processing — if customer has
//     saved payment method, shows processing spinner then success.
//     If no saved method, shows "Send Payment Link" button instead.
//     Added orderMode prop for paying orders before submit.
//   [2026-03-13] #001 Added Account Credit as 5th payment method.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { X, Banknote, CreditCard, FileText, Building2, Wallet, Loader2, CheckCircle, Send, AlertCircle, Plus } from 'lucide-react';
import MockFeatureBanner from './MockFeatureBanner';
import { formatCurrency } from '../utils/format';
import styles from '../styles/PaymentModal.module.css';

const METHODS = [
  { key: 'cash', label: 'Cash', icon: Banknote },
  { key: 'check', label: 'Check', icon: FileText },
  { key: 'credit_card', label: 'Card', icon: CreditCard },
  { key: 'ach', label: 'ACH/Wire', icon: Building2 },
  // [MOD #001] Account Credit method for on-account payments
  { key: 'account_credit', label: 'On Account', icon: Wallet },
];

class PaymentModal extends React.Component {
  constructor(props) {
    super(props);
    // [MOD #002] Default to account_credit if creditOnly mode
    const defaultMethod = props.creditOnly ? 'account_credit' : 'cash';
    // [MOD #003] Get default saved payment method for CC/ACH
    const savedCards = this._getSavedMethods(props.customer, 'credit_card');
    const savedAch = this._getSavedMethods(props.customer, 'ach');
    this.state = {
      amount: props.suggestedAmount || 0,
      method: defaultMethod,
      reference: '',
      // [MOD #002] Processing states for CC/ACH
      processing: false,
      processed: false,
      // [MOD #003] Selected saved method ID (first one is default)
      selectedCardId: savedCards.length > 0 ? (savedCards.find(c => c.isDefault)?.id || savedCards[0].id) : null,
      selectedAchId: savedAch.length > 0 ? (savedAch.find(a => a.isDefault)?.id || savedAch[0].id) : null,
      // [MOD #003] Send payment link state
      sendingLink: false,
      linkSent: false,
      // [MOD #003] Track charged method for success message
      chargedMethod: null,
    };
  }

  // [MOD #003] Get saved methods of a specific type
  _getSavedMethods(customer, type) {
    if (!customer?.savedPaymentMethods) return [];
    return customer.savedPaymentMethods.filter(m => m.type === type);
  }

  _handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    this.setState({ amount: val });
  };

  // [MOD #002] Check if customer has saved payment method for CC/ACH
  _hasSavedMethod(methodType) {
    const { customer } = this.props;
    if (!customer?.savedPaymentMethods) return false;
    return customer.savedPaymentMethods.some(m => m.type === methodType);
  }

  // [MOD #002] Mock process saved payment method
  _handleProcessPayment = () => {
    const { onApply, customer } = this.props;
    const { amount, method, reference, selectedCardId, selectedAchId } = this.state;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    // [MOD #003] Get the selected saved method details
    const savedMethods = customer?.savedPaymentMethods || [];
    const selectedId = method === 'credit_card' ? selectedCardId : selectedAchId;
    const selectedMethod = savedMethods.find(m => m.id === selectedId);

    // WHY: Show spinner for 2s to simulate payment gateway call
    this.setState({ processing: true, chargedMethod: selectedMethod });
    setTimeout(() => {
      this.setState({ processing: false, processed: true });
      // WHY: Short delay after checkmark before closing
      setTimeout(() => {
        onApply({
          amount: numAmount,
          method,
          reference,
          processed: true,
          // [MOD #003] Include which card/account was charged
          savedMethodUsed: selectedMethod ? {
            id: selectedMethod.id,
            last4: selectedMethod.last4,
            brand: selectedMethod.brand,
            bankName: selectedMethod.bankName,
          } : null,
        });
      }, 1000);
    }, 2000);
  };

  // [MOD #003] Send payment link to customer
  _handleSendPaymentLink = () => {
    const { customer } = this.props;
    this.setState({ sendingLink: true });
    // WHY: Mock 1.5s delay then show success
    setTimeout(() => {
      this.setState({ sendingLink: false, linkSent: true });
      // Could show toast here
      console.log(`Payment link sent to ${customer.email}`);
    }, 1500);
  };

  // [MOD #004] Add mock payment method from payment modal
  _handleAddPaymentMethod = (type) => {
    const { customer, onAddPaymentMethod } = this.props;
    if (!onAddPaymentMethod) return;

    // Generate mock payment method
    const brands = ['Visa', 'Mastercard', 'Amex', 'Discover'];
    const banks = ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One'];
    const last4 = String(Math.floor(1000 + Math.random() * 9000));
    const id = `${type === 'credit_card' ? 'cc' : 'ach'}_${Date.now()}`;

    let newMethod;
    if (type === 'credit_card') {
      const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
      const year = String(27 + Math.floor(Math.random() * 5));
      newMethod = {
        id,
        type: 'credit_card',
        last4,
        brand: brands[Math.floor(Math.random() * brands.length)],
        expiry: `${month}/${year}`,
        isDefault: !this._hasSavedMethod('credit_card'), // Make default if first
      };
    } else {
      newMethod = {
        id,
        type: 'ach',
        last4,
        bankName: banks[Math.floor(Math.random() * banks.length)],
        isDefault: !this._hasSavedMethod('ach'), // Make default if first
      };
    }

    // Call parent to save, then update local state
    onAddPaymentMethod(customer.id, newMethod);
    
    // Update local selection to use the new method
    if (type === 'credit_card') {
      this.setState({ selectedCardId: id });
    } else {
      this.setState({ selectedAchId: id });
    }
  };

  // [MOD #003] Get the selected method details for display
  _getSelectedMethod() {
    const { customer } = this.props;
    const { method, selectedCardId, selectedAchId } = this.state;
    if (!customer?.savedPaymentMethods) return null;
    const selectedId = method === 'credit_card' ? selectedCardId : selectedAchId;
    return customer.savedPaymentMethods.find(m => m.id === selectedId) || null;
  }

  // [MOD #003] Format method label for button
  _getChargeButtonLabel() {
    const { amount, method } = this.state;
    const numAmount = parseFloat(amount) || 0;
    const selectedMethod = this._getSelectedMethod();
    
    if (!selectedMethod) {
      return `Apply ${formatCurrency(numAmount)}`;
    }
    
    if (method === 'credit_card') {
      return `Charge ${selectedMethod.brand} ••••${selectedMethod.last4} — ${formatCurrency(numAmount)}`;
    } else {
      return `Charge ${selectedMethod.bankName} ••••${selectedMethod.last4} — ${formatCurrency(numAmount)}`;
    }
  }

  _handleSubmit = () => {
    const { onApply } = this.props;
    const { amount, method, reference } = this.state;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    // [MOD #002] For CC/ACH with saved method, process payment
    if ((method === 'credit_card' || method === 'ach') && this._hasSavedMethod(method)) {
      this._handleProcessPayment();
      return;
    }

    onApply({ amount: numAmount, method, reference });
  };

  render() {
    const { customer, selectedInvoices, selectedOrders = [], onClose, creditMode, orderMode, creditOnly } = this.props;
    const { amount, method, reference, processing, processed, selectedCardId, selectedAchId, sendingLink, linkSent, chargedMethod } = this.state;
    const numAmount = parseFloat(amount) || 0;

    // [MOD #003] Get saved methods for display
    const savedCards = this._getSavedMethods(customer, 'credit_card');
    const savedAch = this._getSavedMethods(customer, 'ach');
    const showCardPicker = method === 'credit_card' && savedCards.length > 0;
    const showAchPicker = method === 'ach' && savedAch.length > 0;
    // [MOD #003] Show "no card on file" when card/ach selected but none saved
    const showNoCardMessage = method === 'credit_card' && savedCards.length === 0;
    const showNoAchMessage = method === 'ach' && savedAch.length === 0;
    const needsSavedMethod = showNoCardMessage || showNoAchMessage;

    // [MOD #002 update] Context text logic
    const contextText = creditMode
      ? 'Payment will be stored as account credit'
      : orderMode && selectedOrders.length > 0
        ? `${selectedOrders.length} order${selectedOrders.length > 1 ? 's' : ''} selected`
        : orderMode
          ? 'Pay for order before submitting'
          : `${selectedInvoices.length} invoice${selectedInvoices.length > 1 ? 's' : ''} selected`;

    // [MOD #003] Format processing text with card details
    const processingText = chargedMethod
      ? chargedMethod.brand 
        ? `Charging ${chargedMethod.brand} ••••${chargedMethod.last4}...`
        : `Charging ${chargedMethod.bankName} ••••${chargedMethod.last4}...`
      : 'Processing payment...';

    // [MOD #003] Format success text with card details
    const successText = chargedMethod
      ? chargedMethod.brand
        ? `${chargedMethod.brand} ••••${chargedMethod.last4} charged!`
        : `${chargedMethod.bankName} ••••${chargedMethod.last4} charged!`
      : 'Payment Processed!';

    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.header}>
            <h3>{creditMode ? 'Collect Payment' : orderMode ? 'Collect Payment' : 'Apply Payment'}</h3>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={22} />
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.custInfo}>
              <span className={styles.custName}>{customer.name}</span>
              <span className={styles.invCount}>{contextText}</span>
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

            {/* Method — [MOD #002] hide non-credit methods if creditOnly */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Payment Method</label>
              <div className={styles.methodGrid}>
                {METHODS.filter(m => !creditOnly || m.key === 'account_credit').map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.key}
                      className={`${styles.methodBtn} ${method === m.key ? styles.methodActive : ''}`}
                      onClick={() => this.setState({ method: m.key, linkSent: false })}
                      disabled={processing}
                    >
                      <Icon size={20} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* [MOD #003] Saved cards picker */}
            {showCardPicker && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Select Card to Charge</label>
                <div className={styles.savedMethodList}>
                  {savedCards.map(card => (
                    <label
                      key={card.id}
                      className={`${styles.savedMethod} ${selectedCardId === card.id ? styles.savedMethodSelected : ''}`}
                    >
                      <input
                        type="radio"
                        name="savedCard"
                        checked={selectedCardId === card.id}
                        onChange={() => this.setState({ selectedCardId: card.id })}
                        disabled={processing}
                      />
                      <CreditCard size={18} />
                      <span className={styles.savedMethodInfo}>
                        {card.brand} ••••{card.last4}
                        <span className={styles.savedMethodExp}>Exp {card.expiry}</span>
                      </span>
                      {card.isDefault && <span className={styles.defaultBadge}>Default</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* [MOD #003] No card on file message */}
            {showNoCardMessage && (
              <>
                <MockFeatureBanner
                  title="Demo: Send Payment Link"
                  description="In production, a tokenized payment link is sent to the customer via SMS or email through Authorize.NET — it expires after 24 hours and no card data touches this app."
                />
                <div className={styles.noMethodMessage}>
                  <AlertCircle size={18} />
                  <span>No card on file for this customer</span>
                </div>
              </>
            )}

            {/* [MOD #003] Saved ACH/bank picker */}
            {showAchPicker && (
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Select Bank Account to Charge</label>
                <div className={styles.savedMethodList}>
                  {savedAch.map(acct => (
                    <label
                      key={acct.id}
                      className={`${styles.savedMethod} ${selectedAchId === acct.id ? styles.savedMethodSelected : ''}`}
                    >
                      <input
                        type="radio"
                        name="savedAch"
                        checked={selectedAchId === acct.id}
                        onChange={() => this.setState({ selectedAchId: acct.id })}
                        disabled={processing}
                      />
                      <Building2 size={18} />
                      <span className={styles.savedMethodInfo}>
                        {acct.bankName} ••••{acct.last4}
                      </span>
                      {acct.isDefault && <span className={styles.defaultBadge}>Default</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* [MOD #003] No bank on file message */}
            {showNoAchMessage && (
              <>
                <MockFeatureBanner
                  title="Demo: Send Payment Link"
                  description="In production, a tokenized payment link is sent to the customer via SMS or email through Authorize.NET — it expires after 24 hours and no bank data touches this app."
                />
                <div className={styles.noMethodMessage}>
                  <AlertCircle size={18} />
                  <span>No bank account on file for this customer</span>
                </div>
              </>
            )}

            {/* Reference — only show for non-card/ach methods or when card exists */}
            {!needsSavedMethod && (
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
            )}
          </div>

          <div className={styles.footer}>
            {/* [MOD #003] Show processing state or normal button */}
            {processed ? (
              <div className={styles.processedState}>
                <CheckCircle size={32} className={styles.checkIcon} />
                <span>{successText}</span>
              </div>
            ) : processing ? (
              <>
                <MockFeatureBanner
                  title="Demo: Payment Gateway"
                  description="In production, this charges the card in real time via the Authorize.NET SDK. The spinner simulates the live gateway response."
                />
                <div className={styles.processingState}>
                  <Loader2 size={24} className={styles.spinner} />
                  <span>{processingText}</span>
                </div>
              </>
            ) : needsSavedMethod ? (
              /* [MOD #004] No saved method — show add option and send link */
              <div className={styles.noMethodActions}>
                {linkSent ? (
                  <div className={styles.linkSentMessage}>
                    <CheckCircle size={20} className={styles.checkIconSmall} />
                    <span>Payment link sent to {customer.email}</span>
                  </div>
                ) : (
                  <>
                    {/* Add payment method button */}
                    <button
                      className={styles.addMethodBtn}
                      onClick={() => this._handleAddPaymentMethod(method)}
                    >
                      <Plus size={18} />
                      <span>Add {method === 'credit_card' ? 'Card' : 'Bank Account'}</span>
                    </button>
                    
                    <div className={styles.orDivider}>
                      <span>or</span>
                    </div>

                    {/* Send link option */}
                    {sendingLink ? (
                      <button className={styles.sendLinkBtnAlt} disabled>
                        <Loader2 size={16} className={styles.spinner} />
                        <span>Sending...</span>
                      </button>
                    ) : (
                      <button className={styles.sendLinkBtnAlt} onClick={this._handleSendPaymentLink}>
                        <Send size={16} />
                        <span>Send link to customer</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '0.9375rem' }}
                onClick={this._handleSubmit}
                disabled={numAmount <= 0}
              >
                {this._getChargeButtonLabel()}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default PaymentModal;
