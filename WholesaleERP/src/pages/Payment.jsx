// ============================================================
// FILE: Payment.jsx
// PURPOSE: Collect payments from customers — select customer,
//          pick open invoices, apply payment via modal.
// DEPENDS ON: PageHeader, SearchBar, StatusBadge, EmptyState, PaymentModal, AppContext
// DEPENDED ON BY: App.jsx (route: /payments)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.9: Payment collection page. Search/select
//   customer, show open invoices, checkbox multi-select,
//   Payment Modal for amount/method/reference, apply oldest-first.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DollarSign, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import PaymentModal from '../components/PaymentModal';
import styles from '../styles/Payment.module.css';

class Payment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      invoices: [],
      customerSearch: '',
      selectedCustomer: null,
      selectedInvoiceIds: [],
      showPaymentModal: false,
    };
  }

  componentDidMount() {
    const { storage, searchParams } = this.props;
    const customers = storage.getCustomers();
    this.setState({ customers });

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
    // WHY: Only show invoices that still have a balance (not fully paid)
    const allInvoices = storage.getInvoices();
    const openInvoices = allInvoices
      .filter(inv => inv.customerId === customer.id && inv.status !== 'Paid')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // WHY: oldest first for payment application
    this.setState({
      selectedCustomer: customer,
      invoices: openInvoices,
      selectedInvoiceIds: [],
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

  _selectAll() {
    const { invoices, selectedInvoiceIds } = this.state;
    if (selectedInvoiceIds.length === invoices.length) {
      this.setState({ selectedInvoiceIds: [] });
    } else {
      this.setState({ selectedInvoiceIds: invoices.map(inv => inv.id) });
    }
  }

  _getSelectedTotal() {
    const { invoices, selectedInvoiceIds } = this.state;
    return invoices
      .filter(inv => selectedInvoiceIds.includes(inv.id))
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);
  }

  _handlePayment = (paymentData) => {
    const { storage, showToast } = this.props;
    const { selectedCustomer, selectedInvoiceIds, invoices } = this.state;

    // WHY: Apply payment to selected invoices, oldest first
    const selectedInvoices = invoices
      .filter(inv => selectedInvoiceIds.includes(inv.id))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    storage.createPayment({
      customerId: selectedCustomer.id,
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      invoiceIds: selectedInvoices.map(inv => inv.id),
      date: new Date().toISOString(),
    });

    // WHY: Refresh data after payment applied
    this._selectCustomer(selectedCustomer);
    this.setState({ showPaymentModal: false, selectedInvoiceIds: [] });
    showToast(`Payment of $${paymentData.amount.toFixed(2)} applied`);
  };

  _formatCurrency(amt) {
    return '$' + Number(amt).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  _formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  _getFilteredCustomers() {
    const { customers, customerSearch } = this.state;
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(c => c.name.toLowerCase().includes(q));
  }

  render() {
    const { navigate } = this.props;
    const { selectedCustomer, invoices, selectedInvoiceIds, customerSearch, showPaymentModal } = this.state;

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
                      Balance: {this._formatCurrency(c.currentBalance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Invoice selection */
            <div>
              <div className={styles.customerHeader}>
                <div>
                  <h3 className={styles.custHeaderName}>{selectedCustomer.name}</h3>
                  <span className={styles.custHeaderBalance}>
                    Balance: {this._formatCurrency(selectedCustomer.currentBalance)}
                  </span>
                </div>
                <button
                  className={styles.changeBtn}
                  onClick={() => this.setState({ selectedCustomer: null, invoices: [], selectedInvoiceIds: [] })}
                >
                  Change
                </button>
              </div>

              {invoices.length === 0 ? (
                <EmptyState
                  icon={DollarSign}
                  title="No open invoices"
                  message="This customer has no outstanding invoices"
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
                      const balance = inv.totalAmount - inv.amountPaid;
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
                              <span>Due: {this._formatDate(inv.dueDate)}</span>
                              <span className={styles.invoiceAmt}>{this._formatCurrency(balance)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {selectedInvoiceIds.length > 0 && (
                    <div className={styles.payBar}>
                      <div className={styles.payBarInfo}>
                        <span>{selectedInvoiceIds.length} invoice{selectedInvoiceIds.length > 1 ? 's' : ''}</span>
                        <span className={styles.payBarTotal}>{this._formatCurrency(this._getSelectedTotal())}</span>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => this.setState({ showPaymentModal: true })}
                      >
                        Apply Payment
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {showPaymentModal && (
          <PaymentModal
            customer={selectedCustomer}
            selectedInvoices={invoices.filter(inv => selectedInvoiceIds.includes(inv.id))}
            suggestedAmount={this._getSelectedTotal()}
            onApply={this._handlePayment}
            onClose={() => this.setState({ showPaymentModal: false })}
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
