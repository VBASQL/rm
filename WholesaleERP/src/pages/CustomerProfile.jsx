// ============================================================
// FILE: CustomerProfile.jsx
// PURPOSE: Full customer detail page with 6 tabs — Overview, Orders,
//          Invoices, Payments, Account, Notes. Action bar at top.
// DEPENDS ON: PageHeader, StatusBadge, AppContext, EmptyState, SendMessageModal
// DEPENDED ON BY: App.jsx (route: /customers/:id)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.5: Customer Profile with action bar (New Order,
//   Collect Payment, Send Message, Call, Edit) and tabbed detail view.
//   Salesperson can reduce credit or switch to prepaid, NOT increase/grant credit.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-13] #001 Added Payments tab. Redesigned Overview with credit bar,
//     balance cards, recent orders/invoices. Added reduce credit limit control.
//     Made invoices clickable with email action. Wired SendMessageModal.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, DollarSign, Mail, Phone, Edit, Copy, ChevronRight,
  FileText, CreditCard, StickyNote, User, ShoppingBag, ArrowDownCircle, Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import SendMessageModal from '../components/SendMessageModal';
import styles from '../styles/CustomerProfile.module.css';

// [MOD #001] Added Payments tab between Invoices and Account
const TABS = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'invoices', label: 'Invoices', icon: FileText },
  { key: 'payments', label: 'Payments', icon: Wallet },
  { key: 'account', label: 'Account', icon: CreditCard },
  { key: 'notes', label: 'Notes', icon: StickyNote },
];

class CustomerProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customer: null,
      orders: [],
      invoices: [],
      payments: [],
      activeTab: 'overview',
      newNote: '',
      // [MOD #001] Credit reduction and email modal state
      showCreditReduce: false,
      newCreditLimit: '',
      showEmailModal: false,
      emailSubject: '',
      emailBody: '',
    };
  }

  componentDidMount() {
    this._loadData();
  }

  _loadData() {
    const { storage, customerId } = this.props;
    const customer = storage.getCustomer(Number(customerId));
    if (!customer) return;

    const orders = storage.getOrders(customer.id);
    const invoices = storage.getInvoices(customer.id);
    const payments = storage.getPayments(customer.id);

    this.setState({ customer, orders, invoices, payments });
  }

  handleTabChange = (tab) => {
    this.setState({ activeTab: tab });
  };

  handleAddNote = () => {
    const { newNote, customer } = this.state;
    if (!newNote.trim() || !customer) return;

    const { storage } = this.props;
    const updatedNotes = [...(customer.notes || []), newNote.trim()];
    storage.updateCustomer(customer.id, { notes: updatedNotes });

    this.setState({
      customer: { ...customer, notes: updatedNotes },
      newNote: '',
    });
    this.props.showToast('Note added');
  };

  // [MOD #001] Reduce credit limit — can only lower, never raise.
  handleReduceCredit = () => {
    const { customer, newCreditLimit } = this.state;
    const newLimit = Number(newCreditLimit);
    if (isNaN(newLimit) || newLimit >= customer.creditLimit) {
      this.props.showToast('New limit must be lower than current limit');
      return;
    }
    const updated = this.props.storage.reduceCustomerCredit(customer.id, newLimit);
    this.setState({
      customer: updated,
      showCreditReduce: false,
      newCreditLimit: '',
    });
    this.props.showToast(newLimit === 0 ? 'Converted to prepaid' : `Credit limit reduced to $${newLimit.toFixed(2)}`);
  };

  // [MOD #001] Open email modal pre-filled for invoice/statement
  handleEmailInvoice = (invoice) => {
    const { customer } = this.state;
    this.setState({
      showEmailModal: true,
      emailSubject: `Invoice ${invoice.invoiceNumber} — ${customer.name}`,
      emailBody: `Dear ${customer.contact},\n\nPlease find attached invoice ${invoice.invoiceNumber} for ${this._formatCurrency(invoice.grandTotal)}.\nAmount due: ${this._formatCurrency(invoice.amountDue)}\nDue date: ${this._formatDate(invoice.dueDate)}\n\nThank you for your business.`,
    });
  };

  handleEmailStatement = () => {
    const { customer } = this.state;
    this.setState({
      showEmailModal: true,
      emailSubject: `Account Statement — ${customer.name}`,
      emailBody: `Dear ${customer.contact},\n\nPlease find attached your account statement.\nCurrent balance: ${this._formatCurrency(customer.balance)}\n\nPlease don't hesitate to reach out with any questions.`,
    });
  };

  _formatCurrency(amount) {
    return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  _formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  // ───────── Tab renderers ─────────

  // [MOD #001] Redesigned Overview — main activity page with balance cards,
  // credit bar, recent orders/invoices at a glance.
  _renderOverview() {
    const { customer, orders, invoices, showCreditReduce, newCreditLimit } = this.state;
    const { navigate } = this.props;

    // Credit usage bar
    const isCredit = customer.paymentType === 'credit' && customer.creditLimit > 0;
    const creditUsage = isCredit ? (customer.balance / customer.creditLimit) : 0;
    const creditPercent = Math.min(creditUsage * 100, 100);
    let creditColor = 'var(--color-success)';
    if (creditUsage > 0.9) creditColor = 'var(--color-danger)';
    else if (creditUsage > 0.66) creditColor = 'var(--color-warning)';

    const recentOrders = [...orders].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)).slice(0, 3);
    const openInvoices = invoices.filter(i => i.status !== 'Paid').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 3);

    return (
      <div className={styles.tabContent}>
        {/* Balance + Credit Cards */}
        <div className={styles.balanceCards}>
          <div className={styles.balanceCard}>
            <span className={styles.balanceLabel}>Balance</span>
            <span className={styles.balanceAmount}>{this._formatCurrency(customer.balance)}</span>
          </div>
          {isCredit && (
            <div className={styles.balanceCard}>
              <span className={styles.balanceLabel}>Credit Limit</span>
              <span className={styles.balanceAmount}>{this._formatCurrency(customer.creditLimit)}</span>
            </div>
          )}
          {customer.accountCredit > 0 && (
            <div className={`${styles.balanceCard} ${styles.creditCard}`}>
              <span className={styles.balanceLabel}>Unapplied Credit</span>
              <span className={styles.creditAmount}>{this._formatCurrency(customer.accountCredit)}</span>
            </div>
          )}
        </div>

        {/* Credit usage bar */}
        {isCredit && (
          <div className={styles.creditBarSection}>
            <div className={styles.creditBarTrack}>
              <div
                className={styles.creditBarFill}
                style={{ width: `${creditPercent}%`, backgroundColor: creditColor }}
              />
            </div>
            <div className={styles.creditBarLabels}>
              <span>{Math.round(creditPercent)}% used</span>
              <span>{this._formatCurrency(customer.creditLimit - customer.balance)} available</span>
            </div>
          </div>
        )}

        {/* Reduce credit limit */}
        {isCredit && (
          <div className={styles.creditReduceSection}>
            {!showCreditReduce ? (
              <button
                className={styles.reduceBtn}
                onClick={() => this.setState({ showCreditReduce: true, newCreditLimit: '' })}
              >
                <ArrowDownCircle size={16} />
                Reduce Credit Limit
              </button>
            ) : (
              <div className={styles.reduceForm}>
                <span className={styles.reduceLabel}>New limit (current: {this._formatCurrency(customer.creditLimit)}):</span>
                <input
                  type="number"
                  min="0"
                  max={customer.creditLimit - 1}
                  step="100"
                  value={newCreditLimit}
                  onChange={e => this.setState({ newCreditLimit: e.target.value })}
                  placeholder="0 = prepaid"
                  className={styles.reduceInput}
                />
                <div className={styles.reduceActions}>
                  <button className="btn btn-primary" onClick={this.handleReduceCredit}>Confirm</button>
                  <button className="btn" onClick={() => this.setState({ showCreditReduce: false })}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contact info */}
        <section className={styles.infoSection}>
          <h4 className={styles.infoTitle}>Contact</h4>
          <div className={styles.infoRow}><span>Contact</span><span>{customer.contact}</span></div>
          <div className={styles.infoRow}><span>Phone</span><a href={`tel:${customer.phone}`}>{customer.phone}</a></div>
          <div className={styles.infoRow}><span>Email</span><span>{customer.email || '—'}</span></div>
          <div className={styles.infoRow}><span>Address</span><span>{customer.address}</span></div>
          <div className={styles.infoRow}><span>Route</span><span>{customer.route || 'Unassigned'}</span></div>
        </section>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <section className={styles.infoSection}>
            <h4 className={styles.infoTitle}>Recent Orders</h4>
            {recentOrders.map(order => (
              <div
                key={order.id}
                className={styles.listRow}
                onClick={() => navigate(`/orders/${order.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.listRowMain}>
                  <span className={styles.listRowTitle}>{order.orderNumber}</span>
                  <StatusBadge status={order.status} small />
                </div>
                <div className={styles.listRowSub}>
                  <span>{this._formatDate(order.createdDate)}</span>
                  <span>{order.totalCases} cases</span>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Open Invoices */}
        {openInvoices.length > 0 && (
          <section className={styles.infoSection}>
            <h4 className={styles.infoTitle}>Open Invoices</h4>
            {openInvoices.map(inv => (
              <div
                key={inv.id}
                className={styles.listRow}
                onClick={() => navigate(`/invoices/${inv.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.listRowMain}>
                  <span className={styles.listRowTitle}>{inv.invoiceNumber}</span>
                  <StatusBadge status={inv.status} small />
                </div>
                <div className={styles.listRowSub}>
                  <span>Due: {this._formatDate(inv.dueDate)}</span>
                  <span>{this._formatCurrency(inv.amountDue)}</span>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    );
  }

  _renderOrders() {
    const { orders } = this.state;
    const { navigate } = this.props;

    if (orders.length === 0) {
      return <EmptyState icon={<ShoppingBag size={40} />} title="No orders yet" message="Create a new order for this customer" />;
    }

    return (
      <div className={styles.tabContent}>
        {orders.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)).map(order => (
          <div
            key={order.id}
            className={styles.listRow}
            onClick={() => navigate(`/orders/${order.id}`)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.listRowMain}>
              <span className={styles.listRowTitle}>{order.orderNumber}</span>
              <StatusBadge status={order.status} small />
            </div>
            <div className={styles.listRowSub}>
              <span>{this._formatDate(order.createdDate)}</span>
              <span>{order.totalCases} cases · {this._formatCurrency(order.grandTotal)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // [MOD #001] Invoices tab — each row has email action button
  _renderInvoices() {
    const { invoices } = this.state;

    if (invoices.length === 0) {
      return <EmptyState icon={<FileText size={40} />} title="No invoices" message="Invoices are generated from orders" />;
    }

    return (
      <div className={styles.tabContent}>
        {invoices.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)).map(inv => (
          <div
            key={inv.id}
            className={styles.listRow}
            onClick={() => navigate(`/invoices/${inv.id}`)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.listRowMain}>
              <span className={styles.listRowTitle}>{inv.invoiceNumber}</span>
              <div className={styles.listRowActions}>
                <StatusBadge status={inv.status} small />
                <button
                  className={styles.emailBtn}
                  onClick={(e) => { e.stopPropagation(); this.handleEmailInvoice(inv); }}
                  title="Email invoice"
                >
                  <Mail size={14} />
                </button>
              </div>
            </div>
            <div className={styles.listRowSub}>
              <span>Due: {this._formatDate(inv.dueDate)}</span>
              <span>{this._formatCurrency(inv.amountDue)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // [MOD #001] Payments tab — all payments for this customer
  _renderPayments() {
    const { payments } = this.state;

    if (payments.length === 0) {
      return <EmptyState icon={<Wallet size={40} />} title="No payments" message="No payments recorded for this customer" />;
    }

    return (
      <div className={styles.tabContent}>
        {payments.sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => (
          <div key={p.id} className={styles.listRow}>
            <div className={styles.listRowMain}>
              <span className={styles.listRowTitle}>{this._formatCurrency(p.amount)}</span>
              <span className={styles.paymentMethod}>{p.method}</span>
            </div>
            <div className={styles.listRowSub}>
              <span>{this._formatDate(p.date)}</span>
              {p.reference && <span>Ref: {p.reference}</span>}
            </div>
            {p.appliedTo && p.appliedTo.length > 0 && (
              <div className={styles.listRowSub}>
                <span>Applied to: {p.appliedTo.map(a => `${a.invoiceId ? 'Inv' : 'Acct'} $${a.amount.toFixed(2)}`).join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // [MOD #001] Account tab — type info, credit details, send statement
  _renderAccount() {
    const { customer } = this.state;

    return (
      <div className={styles.tabContent}>
        <section className={styles.infoSection}>
          <h4 className={styles.infoTitle}>Account Details</h4>
          <div className={styles.infoRow}><span>Type</span><span>{customer.type}</span></div>
          <div className={styles.infoRow}><span>Payment</span><StatusBadge status={customer.paymentType} small /></div>
          <div className={styles.infoRow}><span>Terms</span><span>{customer.terms}</span></div>
          {customer.paymentType === 'credit' && (
            <>
              <div className={styles.infoRow}><span>Credit Tier</span><span>{customer.creditTier || '—'}</span></div>
              <div className={styles.infoRow}><span>Credit Limit</span><span>{this._formatCurrency(customer.creditLimit)}</span></div>
            </>
          )}
          <div className={styles.infoRow}><span>Price Level</span><span>{customer.priceLevel}</span></div>
          <div className={styles.infoRow}><span>Salesperson</span><span>{customer.assignedSalesperson}</span></div>
        </section>

        <section className={styles.infoSection}>
          <h4 className={styles.infoTitle}>Actions</h4>
          <button className={styles.actionBtn} onClick={this.handleEmailStatement}>
            <Mail size={16} /> Send Account Statement
          </button>
        </section>
      </div>
    );
  }

  _renderNotes() {
    const { customer, newNote } = this.state;
    const notes = customer.notes || [];

    return (
      <div className={styles.tabContent}>
        <div className={styles.noteInput}>
          <textarea
            className="form-input"
            value={newNote}
            onChange={(e) => this.setState({ newNote: e.target.value })}
            placeholder="Add a note..."
            rows={2}
          />
          <button
            className="btn btn-primary"
            onClick={this.handleAddNote}
            disabled={!newNote.trim()}
          >
            Save Note
          </button>
        </div>

        {notes.length === 0 ? (
          <p className={styles.emptyText}>No notes yet</p>
        ) : (
          <div className={styles.notesList}>
            {[...notes].reverse().map((note, idx) => (
              <div key={idx} className={styles.noteItem}>
                <p>{note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  render() {
    const { navigate } = this.props;
    const { customer, activeTab } = this.state;

    if (!customer) {
      return (
        <div className="page">
          <PageHeader title="Customer" showBack onBack={() => navigate(-1)} />
          <EmptyState title="Customer not found" message="This customer doesn't exist" />
        </div>
      );
    }

    return (
      <div className="page">
        <PageHeader title={customer.name} showBack onBack={() => navigate(-1)} />

        {/* Customer header with status */}
        <div className={styles.customerHeader}>
          <div className={styles.headerInfo}>
            <StatusBadge status={customer.status} />
            <span className={styles.customerType}>{customer.type}</span>
          </div>
        </div>

        {/* Action bar — always visible per §5.5 */}
        <div className={styles.actionBar}>
          <button className={styles.actionItem} onClick={() => navigate(`/orders/new?customerId=${customer.id}`)}>
            <Plus size={16} />
            <span>New Order</span>
          </button>
          <button className={styles.actionItem} onClick={() => navigate(`/payments?customerId=${customer.id}`)}>
            <DollarSign size={16} />
            <span>Payment</span>
          </button>
          <a className={styles.actionItem} href={`mailto:${customer.email}`}>
            <Mail size={16} />
            <span>Email</span>
          </a>
          <a className={styles.actionItem} href={`tel:${customer.phone}`}>
            <Phone size={16} />
            <span>Call</span>
          </a>
        </div>

        {/* Tab bar */}
        <div className={styles.tabBar}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                onClick={() => this.handleTabChange(tab.key)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && this._renderOverview()}
        {activeTab === 'orders' && this._renderOrders()}
        {activeTab === 'invoices' && this._renderInvoices()}
        {/* [MOD #001] Added Payments tab */}
        {activeTab === 'payments' && this._renderPayments()}
        {activeTab === 'account' && this._renderAccount()}
        {activeTab === 'notes' && this._renderNotes()}

        {/* [MOD #001] Email compose modal */}
        {this.state.showEmailModal && (
          <SendMessageModal
            recipientEmail={customer.email}
            subject={this.state.emailSubject}
            body={this.state.emailBody}
            attachmentData={{ customer, invoices, orders }}
            onClose={() => this.setState({ showEmailModal: false })}
            onSent={() => this.props.showToast('Email opened')}
          />
        )}
      </div>
    );
  }
}

function CustomerProfileWrapper(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { storage } = useApp();
  return <CustomerProfile {...props} navigate={navigate} customerId={id} storage={storage} />;
}

export default CustomerProfileWrapper;
