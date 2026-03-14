// ============================================================
// FILE: Payment.jsx
// PURPOSE: Collect payments from customers — select customer,
//          pick open orders OR invoices, apply payment via modal.
//          Also supports "Just Collect Payment" mode (account credit).
// DEPENDS ON: PageHeader, StatusBadge, EmptyState, PaymentModal, AppContext
// DEPENDED ON BY: App.jsx (route: /payments)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.9: Payment collection page. Search/select
//   customer, show open invoices/orders, checkbox multi-select,
//   Payment Modal for amount/method/reference, apply oldest-first.
//
// MODIFICATION HISTORY (newest first):
//   [MOD #branch] _selectCustomer: loads invoices from parent account (accountId)
//     since invoices are always created on the parent, not per-branch.
//     Customer list shows "(Branch of X)" label so payee is clear.
//   [2026-03-13] #002 Added orders tab, account credit application,
//     partial payments for both orders and invoices.
//   [2026-03-13] #001 Added "Just Collect Payment" mode.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DollarSign, Search, FileText, ShoppingCart, Wallet, Printer, Mail, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import PaymentModal from '../components/PaymentModal';
import SendMessageModal from '../components/SendMessageModal';
import { formatCurrency, formatDate } from '../utils/format';
import styles from '../styles/Payment.module.css';

class Payment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      customersById: {}, // [MOD #branch] index for branch parent-name lookup
      invoices: [],
      orders: [], // [MOD #002] Unpaid orders
      customerSearch: '',
      selectedCustomer: null,
      selectedInvoiceIds: [],
      selectedOrderIds: [], // [MOD #002] Selected orders for payment
      showPaymentModal: false,
      // [MOD #001] Credit mode: collect payment without selection
      creditMode: false,
      // [MOD #002] Tab to switch between orders and invoices
      activeTab: 'orders', // 'orders' | 'invoices'
      // [MOD #002] Mode for PaymentModal: 'invoices' | 'orders' | 'credit'
      paymentMode: 'invoices',
      // [MOD #receipt] Track last payment for receipt send/print option
      // WHY: After payment is processed, show overlay with Print/Send Receipt
      // options — same UX as orders and invoices for consistency.
      lastPayment: null,
      showReceiptOptions: false,
      showSendReceiptModal: false,
    };
  }

  componentDidMount() {
    const { storage, searchParams } = this.props;
    const customers = storage.getCustomers();
    // [MOD #branch] Index by ID so the customer list can show parent names for branches.
    const customersById = Object.fromEntries(customers.map(c => [c.id, c]));
    this.setState({ customers, customersById });

    // WHY: If customerId passed via URL, pre-select that customer
    const customerId = searchParams.get('customerId');
    if (customerId) {
      const customer = storage.getCustomer(Number(customerId));
      if (customer) {
        this._selectCustomer(customer);
      }
    }
  }

  _selectCustomer(customer) {
    const { storage } = this.props;
    // [MOD #branch] Invoices are always created on the parent account.
    // WHY: In MockStorageService.updateOrderStatus, invoice.customerId = accountId (parent).
    //   Loading invoices by branch ID would return nothing.
    const accountId = customer.parentId || customer.id;

    // WHY: Only show invoices that still have a balance (not fully paid)
    const allInvoices = storage.getInvoices();
    const openInvoices = allInvoices
      .filter(inv => inv.customerId === accountId && inv.status !== 'Paid')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // WHY: oldest first

    // [MOD #002] Get unpaid orders (orders ARE under the customer/branch ID)
    const unpaidOrders = storage.getUnpaidOrders(customer.id)
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // WHY: oldest first

    // [MOD #002] Refresh customer data to get current credit balance
    const refreshedCustomer = storage.getCustomer(customer.id) || customer;

    this.setState({
      selectedCustomer: refreshedCustomer,
      invoices: openInvoices,
      orders: unpaidOrders,
      selectedInvoiceIds: [],
      selectedOrderIds: [],
      activeTab: unpaidOrders.length > 0 ? 'orders' : 'invoices', // WHY: default to orders if any exist
    });
  }

  _toggleInvoice(invoiceId) {
    this.setState(prev => {
      const ids = prev.selectedInvoiceIds.includes(invoiceId)
        ? prev.selectedInvoiceIds.filter(id => id !== invoiceId)
        : [...prev.selectedInvoiceIds, invoiceId];
      return { selectedInvoiceIds: ids };
    });
  }

  // [MOD #002] Toggle order selection
  _toggleOrder(orderId) {
    this.setState(prev => {
      const ids = prev.selectedOrderIds.includes(orderId)
        ? prev.selectedOrderIds.filter(id => id !== orderId)
        : [...prev.selectedOrderIds, orderId];
      return { selectedOrderIds: ids };
    });
  }

  _selectAll() {
    const { invoices, selectedInvoiceIds } = this.state;
    if (selectedInvoiceIds.length === invoices.length) {
      this.setState({ selectedInvoiceIds: [] });
    } else {
      this.setState({ selectedInvoiceIds: invoices.map(inv => inv.id) });
    }
  }

  // [MOD #002] Select/deselect all orders
  _selectAllOrders() {
    const { orders, selectedOrderIds } = this.state;
    if (selectedOrderIds.length === orders.length) {
      this.setState({ selectedOrderIds: [] });
    } else {
      this.setState({ selectedOrderIds: orders.map(o => o.id) });
    }
  }

  _getSelectedTotal() {
    const { invoices, selectedInvoiceIds } = this.state;
    return invoices
      .filter(inv => selectedInvoiceIds.includes(inv.id))
      .reduce((sum, inv) => sum + (inv.grandTotal - inv.amountPaid), 0);
  }

  // [MOD #002] Get total for selected orders
  _getSelectedOrderTotal() {
    const { orders, selectedOrderIds } = this.state;
    return orders
      .filter(o => selectedOrderIds.includes(o.id))
      .reduce((sum, o) => sum + (o.grandTotal - (o.amountPaid || 0)), 0);
  }

  // [MOD #004] Handle adding payment method from PaymentModal
  _handleAddPaymentMethod = (customerId, newMethod) => {
    const { storage } = this.props;
    const customer = storage.getCustomer(customerId);
    if (!customer) return;

    // Add new method to customer's savedPaymentMethods
    const existing = customer.savedPaymentMethods || [];
    storage.updateCustomer(customerId, {
      savedPaymentMethods: [...existing, newMethod],
    });

    // Refresh customer in state so modal sees the new method
    const refreshedCustomer = storage.getCustomer(customerId);
    this.setState({ selectedCustomer: refreshedCustomer });
  };

  _handlePayment = (paymentData) => {
    const { storage, showToast } = this.props;
    const { selectedCustomer, selectedInvoiceIds, invoices, selectedOrderIds, orders, paymentMode } = this.state;

    // [MOD #001] Credit mode — store as account credit, no items
    if (paymentMode === 'credit') {
      const payment = storage.createPayment({
        customerId: selectedCustomer.id,
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
        appliedTo: [], // WHY: empty = stored as account credit
        date: new Date().toISOString(),
      });
      this._selectCustomer(selectedCustomer);
      // [MOD #receipt] Store last payment and show receipt options
      this.setState({ showPaymentModal: false, lastPayment: payment, showReceiptOptions: true });
      showToast(`$${paymentData.amount.toFixed(2)} collected as account credit`);
      return;
    }

    // [MOD #002] Order payment mode
    if (paymentMode === 'orders') {
      const selectedOrders = orders
        .filter(o => selectedOrderIds.includes(o.id))
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // WHY: oldest first

      // WHY: Distribute payment across orders oldest-first
      let remaining = paymentData.amount;
      const appliedTo = selectedOrders.map(o => {
        const orderBalance = o.grandTotal - (o.amountPaid || 0);
        const applied = Math.min(remaining, orderBalance);
        remaining -= applied;
        return { orderId: o.id, amount: applied };
      }).filter(a => a.amount > 0);

      const payment = storage.createPayment({
        customerId: selectedCustomer.id,
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
        appliedTo,
        date: new Date().toISOString(),
      });

      this._selectCustomer(selectedCustomer);
      // [MOD #receipt] Store last payment and show receipt options
      this.setState({ showPaymentModal: false, selectedOrderIds: [], lastPayment: payment, showReceiptOptions: true });
      showToast(`Payment of $${paymentData.amount.toFixed(2)} applied to order${selectedOrderIds.length > 1 ? 's' : ''}`);
      return;
    }

    // Invoice payment mode (default)
    const selectedInvoices = invoices
      .filter(inv => selectedInvoiceIds.includes(inv.id))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // WHY: Distribute payment across invoices oldest-first
    let remaining = paymentData.amount;
    const appliedTo = selectedInvoices.map(inv => {
      const invBalance = inv.grandTotal - inv.amountPaid;
      const applied = Math.min(remaining, invBalance);
      remaining -= applied;
      return { invoiceId: inv.id, amount: applied };
    }).filter(a => a.amount > 0);

    const payment = storage.createPayment({
      customerId: selectedCustomer.id,
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      appliedTo,
      date: new Date().toISOString(),
    });

    // WHY: Refresh data after payment applied
    this._selectCustomer(selectedCustomer);
    // [MOD #receipt] Store last payment and show receipt options
    this.setState({ showPaymentModal: false, selectedInvoiceIds: [], lastPayment: payment, showReceiptOptions: true });
    showToast(`Payment of $${paymentData.amount.toFixed(2)} applied`);
  };

  // [MOD #002] Apply account credit to an order or invoice
  _handleApplyCredit = (targetType, targetId) => {
    const { storage, showToast } = this.props;
    const { selectedCustomer, orders, invoices } = this.state;

    // WHY: Get the balance of the target
    let targetBalance = 0;
    if (targetType === 'order') {
      const order = orders.find(o => o.id === targetId);
      targetBalance = order ? order.grandTotal - (order.amountPaid || 0) : 0;
    } else {
      const invoice = invoices.find(inv => inv.id === targetId);
      targetBalance = invoice ? invoice.grandTotal - invoice.amountPaid : 0;
    }

    const availableCredit = selectedCustomer.accountCredit || 0;
    const amountToApply = Math.min(availableCredit, targetBalance);

    if (amountToApply <= 0) {
      showToast('No credit available to apply', 'error');
      return;
    }

    storage.applyAccountCredit(selectedCustomer.id, targetType, targetId, amountToApply);
    this._selectCustomer(selectedCustomer);
    showToast(`$${amountToApply.toFixed(2)} credit applied`);
  };

  _getFilteredCustomers() {
    const { customers, customerSearch } = this.state;
    // [MOD #branch] Payments are collected at the parent account level only.
    // WHY: Balance lives on the parent; branches have no independent balance.
    const base = customers.filter(c => !c.isBranch);
    if (!customerSearch.trim()) return base;
    const q = customerSearch.toLowerCase();
    return base.filter(c => c.name.toLowerCase().includes(q));
  }

  render() {
    const { navigate } = this.props;
    const { selectedCustomer, invoices, orders, selectedInvoiceIds, selectedOrderIds, customerSearch, showPaymentModal, paymentMode, activeTab } = this.state;

    const accountCredit = selectedCustomer?.accountCredit || 0;

    return (
      <div className="page">
        <PageHeader title="Collect Payment" />

        <div className={styles.content}>
          {!selectedCustomer ? (
            /* Customer selection */
            <div>
              <div className={styles.searchWrap}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search customers…"
                  value={customerSearch}
                  onChange={e => this.setState({ customerSearch: e.target.value })}
                />
              </div>
              <div className={styles.customerList}>
                {this._getFilteredCustomers().map(c => (
                  <div
                    key={c.id}
                    className={styles.customerRow}
                    onClick={() => this._selectCustomer(c)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className={styles.custName}>{c.name}</span>
                    <span className={styles.custBalance}>
                      Balance: {formatCurrency(c.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Customer selected — show orders/invoices */
            <div>
              <div className={styles.customerHeader}>
                <div>
                  <h3 className={styles.custHeaderName}>{selectedCustomer.name}</h3>
                  <span className={styles.custHeaderBalance}>
                    Balance: {formatCurrency(selectedCustomer.balance)}
                  </span>
                </div>
                <button
                  className={styles.changeBtn}
                  onClick={() => this.setState({ selectedCustomer: null, invoices: [], orders: [], selectedInvoiceIds: [], selectedOrderIds: [] })}
                >
                  Change
                </button>
              </div>

              {/* [MOD #002] Account credit banner */}
              {accountCredit > 0 && (
                <div className={styles.creditBanner}>
                  <Wallet size={18} />
                  <span>Account Credit: <strong>{formatCurrency(accountCredit)}</strong></span>
                </div>
              )}

              {/* Always show Collect Payment — regardless of open items */}
              <button
                className={`btn btn-secondary ${styles.collectBtn}`}
                onClick={() => this.setState({ showPaymentModal: true, paymentMode: 'credit' })}
              >
                Just Collect Payment (Account Credit)
              </button>

              {/* [MOD #002] Tabs for orders vs invoices */}
              <div className={styles.tabs}>
                <button
                  className={`${styles.tab} ${activeTab === 'orders' ? styles.tabActive : ''}`}
                  onClick={() => this.setState({ activeTab: 'orders' })}
                >
                  <ShoppingCart size={16} />
                  Orders ({orders.length})
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'invoices' ? styles.tabActive : ''}`}
                  onClick={() => this.setState({ activeTab: 'invoices' })}
                >
                  <FileText size={16} />
                  Invoices ({invoices.length})
                </button>
              </div>

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <>
                  {orders.length === 0 ? (
                    <EmptyState
                      icon={<ShoppingCart size={40} />}
                      title="No unpaid orders"
                      message="This customer has no orders awaiting payment."
                    />
                  ) : (
                    <>
                      <div className={styles.selectAllRow}>
                        <label className={styles.checkLabel}>
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.length === orders.length}
                            onChange={() => this._selectAllOrders()}
                          />
                          Select All
                        </label>
                      </div>

                      <div className={styles.invoiceList}>
                        {orders.map(order => {
                          const balance = order.grandTotal - (order.amountPaid || 0);
                          const isSelected = selectedOrderIds.includes(order.id);
                          return (
                            <div
                              key={order.id}
                              className={`${styles.invoiceRow} ${isSelected ? styles.invoiceSelected : ''}`}
                              onClick={() => this._toggleOrder(order.id)}
                              role="button"
                              tabIndex={0}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className={styles.checkbox}
                              />
                              <div className={styles.invoiceInfo}>
                                <div className={styles.invoiceTop}>
                                  <span className={styles.invoiceNum}>{order.orderNumber}</span>
                                  <StatusBadge status={order.paymentStatus || 'Unpaid'} small />
                                </div>
                                <div className={styles.invoiceBottom}>
                                  <span>{formatDate(order.date)}</span>
                                  <span className={styles.invoiceAmt}>{formatCurrency(balance)}</span>
                                </div>
                                {/* [MOD #002] Apply credit button */}
                                {accountCredit > 0 && balance > 0 && (
                                  <button
                                    className={styles.applyCreditBtn}
                                    onClick={(e) => { e.stopPropagation(); this._handleApplyCredit('order', order.id); }}
                                  >
                                    Use Credit
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {selectedOrderIds.length > 0 && (
                        <div className={styles.payBar}>
                          <div className={styles.payBarInfo}>
                            <span>{selectedOrderIds.length} order{selectedOrderIds.length > 1 ? 's' : ''}</span>
                            <span className={styles.payBarTotal}>{formatCurrency(this._getSelectedOrderTotal())}</span>
                          </div>
                          <button
                            className="btn btn-primary"
                            onClick={() => this.setState({ showPaymentModal: true, paymentMode: 'orders' })}
                          >
                            Collect Payment
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Invoices Tab */}
              {activeTab === 'invoices' && (
                <>
                  {invoices.length === 0 ? (
                    <EmptyState
                      icon={<DollarSign size={40} />}
                      title="No open invoices"
                      message="This customer has no outstanding invoices."
                    />
                  ) : (
                    <>
                      <div className={styles.selectAllRow}>
                        <label className={styles.checkLabel}>
                          <input
                            type="checkbox"
                            checked={selectedInvoiceIds.length === invoices.length}
                            onChange={() => this._selectAll()}
                          />
                          Select All
                        </label>
                      </div>

                      <div className={styles.invoiceList}>
                        {invoices.map(inv => {
                          const balance = inv.grandTotal - inv.amountPaid;
                          const isSelected = selectedInvoiceIds.includes(inv.id);
                          return (
                            <div
                              key={inv.id}
                              className={`${styles.invoiceRow} ${isSelected ? styles.invoiceSelected : ''}`}
                              onClick={() => this._toggleInvoice(inv.id)}
                              role="button"
                              tabIndex={0}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className={styles.checkbox}
                              />
                              <div className={styles.invoiceInfo}>
                                <div className={styles.invoiceTop}>
                                  <span className={styles.invoiceNum}>{inv.invoiceNumber}</span>
                                  <StatusBadge status={inv.status} small />
                                </div>
                                <div className={styles.invoiceBottom}>
                                  <span>Due: {formatDate(inv.dueDate)}</span>
                                  <span className={styles.invoiceAmt}>{formatCurrency(balance)}</span>
                                </div>
                                {/* [MOD #002] Apply credit button */}
                                {accountCredit > 0 && balance > 0 && (
                                  <button
                                    className={styles.applyCreditBtn}
                                    onClick={(e) => { e.stopPropagation(); this._handleApplyCredit('invoice', inv.id); }}
                                  >
                                    Use Credit
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {selectedInvoiceIds.length > 0 && (
                        <div className={styles.payBar}>
                          <div className={styles.payBarInfo}>
                            <span>{selectedInvoiceIds.length} invoice{selectedInvoiceIds.length > 1 ? 's' : ''}</span>
                            <span className={styles.payBarTotal}>{formatCurrency(this._getSelectedTotal())}</span>
                          </div>
                          <button
                            className="btn btn-primary"
                            onClick={() => this.setState({ showPaymentModal: true, paymentMode: 'invoices' })}
                          >
                            Apply Payment
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {showPaymentModal && (
          <PaymentModal
            customer={selectedCustomer}
            selectedInvoices={paymentMode === 'invoices' ? invoices.filter(inv => selectedInvoiceIds.includes(inv.id)) : []}
            selectedOrders={paymentMode === 'orders' ? orders.filter(o => selectedOrderIds.includes(o.id)) : []}
            suggestedAmount={
              paymentMode === 'credit' ? 0 :
              paymentMode === 'orders' ? this._getSelectedOrderTotal() :
              this._getSelectedTotal()
            }
            onApply={this._handlePayment}
            onClose={() => this.setState({ showPaymentModal: false })}
            creditMode={paymentMode === 'credit'}
            orderMode={paymentMode === 'orders'}
            onToast={this.props.showToast}
            onAddPaymentMethod={this._handleAddPaymentMethod}
          />
        )}

        {/* [MOD #receipt] Receipt Options Overlay — shown after payment is applied.
            WHY: Same UX as orders/invoices — after completing the action, user
            can view the official receipt page or quick print/send from here. */}
        {this.state.showReceiptOptions && this.state.lastPayment && (
          <div className={styles.receiptOverlay} onClick={() => this.setState({ showReceiptOptions: false, lastPayment: null })}>
            <div className={styles.receiptSheet} onClick={e => e.stopPropagation()}>
              <h3 className={styles.receiptTitle}>Payment Received!</h3>
              <p className={styles.receiptAmount}>{formatCurrency(this.state.lastPayment.amount)}</p>
              <p className={styles.receiptCustomer}>{selectedCustomer?.name}</p>
              <div className={styles.receiptActions}>
                <button
                  className={styles.receiptBtn}
                  onClick={() => {
                    // Navigate to full receipt view page
                    this.props.navigate(`/payments/${this.state.lastPayment.id}`);
                  }}
                >
                  <Eye size={18} />
                  View Receipt
                </button>
                <button
                  className={styles.receiptBtn}
                  onClick={() => {
                    // Navigate to receipt page then print
                    this.props.navigate(`/payments/${this.state.lastPayment.id}?print=1`);
                  }}
                >
                  <Printer size={18} />
                  Print
                </button>
                <button
                  className={styles.receiptBtn}
                  onClick={() => this.setState({ showSendReceiptModal: true, showReceiptOptions: false })}
                >
                  <Mail size={18} />
                  Send
                </button>
              </div>
              <button
                className={styles.receiptDoneBtn}
                onClick={() => this.setState({ showReceiptOptions: false, lastPayment: null })}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* [MOD #receipt] Send Receipt Modal */}
        {this.state.showSendReceiptModal && this.state.lastPayment && selectedCustomer && (
          <SendMessageModal
            recipientEmail={selectedCustomer.email}
            subject={`Payment Receipt — ${selectedCustomer.name}`}
            body={`Dear ${selectedCustomer.contact || selectedCustomer.name},\n\nThank you for your payment of ${formatCurrency(this.state.lastPayment.amount)}.\n\nPayment Method: ${this.state.lastPayment.method}\n${this.state.lastPayment.reference ? `Reference: ${this.state.lastPayment.reference}\n` : ''}Date: ${formatDate(this.state.lastPayment.date)}\n\nPlease find your receipt attached.\n\nThank you for your business!`}
            attachmentType="payment"
            attachmentData={{ payment: this.state.lastPayment, customer: selectedCustomer }}
            onClose={() => this.setState({ showSendReceiptModal: false, lastPayment: null })}
            onSent={() => this.props.showToast('Receipt email opened')}
          />
        )}
      </div>
    );
  }
}

function PaymentWrapper(props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { storage } = useApp();
  return <Payment {...props} navigate={navigate} searchParams={searchParams} storage={storage} />;
}

export default PaymentWrapper;
