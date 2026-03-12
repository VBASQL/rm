// ============================================================
// FILE: CustomerProfile.jsx
// PURPOSE: Full customer detail page with 5 tabs — Overview, Orders,
//          Invoices, Account, Notes. Action bar at top.
// DEPENDS ON: PageHeader, StatusBadge, AppContext, EmptyState
// DEPENDED ON BY: App.jsx (route: /customers/:id)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.5: Customer Profile with action bar (New Order,
//   Collect Payment, Send Message, Call, Edit) and 5 tabs.
//   Salesperson can reduce credit or switch to prepaid, NOT increase/grant credit.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, DollarSign, Mail, Phone, Edit, Copy, ChevronRight,
  FileText, CreditCard, StickyNote, User, ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import styles from '../styles/CustomerProfile.module.css';

const TABS = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'invoices', label: 'Invoices', icon: FileText },
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

  _renderOverview() {
    const { customer } = this.state;

    return (
      <div className={styles.tabContent}>
        <section className={styles.infoSection}>
          <h4 className={styles.infoTitle}>Contact</h4>
          <div className={styles.infoRow}><span>Contact</span><span>{customer.contact}</span></div>
          <div className={styles.infoRow}><span>Phone</span><a href={`tel:${customer.phone}`}>{customer.phone}</a></div>
          <div className={styles.infoRow}><span>Email</span><span>{customer.email || '—'}</span></div>
          <div className={styles.infoRow}><span>Address</span><span>{customer.address}</span></div>
        </section>

        <section className={styles.infoSection}>
          <h4 className={styles.infoTitle}>Account</h4>
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
          <div className={styles.infoRow}><span>Route</span><span>{customer.route || 'Unassigned'}</span></div>
          <div className={styles.infoRow}><span>Salesperson</span><span>{customer.assignedSalesperson}</span></div>
        </section>
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

  _renderInvoices() {
    const { invoices } = this.state;
    const { navigate } = this.props;

    if (invoices.length === 0) {
      return <EmptyState icon={<FileText size={40} />} title="No invoices" message="Invoices are generated from orders" />;
    }

    return (
      <div className={styles.tabContent}>
        {invoices.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate)).map(inv => (
          <div key={inv.id} className={styles.listRow}>
            <div className={styles.listRowMain}>
              <span className={styles.listRowTitle}>{inv.invoiceNumber}</span>
              <StatusBadge status={inv.status} small />
            </div>
            <div className={styles.listRowSub}>
              <span>Due: {this._formatDate(inv.dueDate)}</span>
              <span>Due: {this._formatCurrency(inv.amountDue)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  _renderAccount() {
    const { customer, payments } = this.state;

    return (
      <div className={styles.tabContent}>
        <section className={styles.infoSection}>
          <h4 className={styles.infoTitle}>Balance Overview</h4>
          <div className={styles.balanceCard}>
            <div className={styles.balanceRow}>
              <span>Outstanding Balance</span>
              <span className={styles.balanceAmount}>{this._formatCurrency(customer.balance)}</span>
            </div>
            {customer.accountCredit > 0 && (
              <div className={styles.balanceRow}>
                <span>Unapplied Credit</span>
                <span className={styles.creditAmount}>{this._formatCurrency(customer.accountCredit)}</span>
              </div>
            )}
          </div>
        </section>

        <section className={styles.infoSection}>
          <h4 className={styles.infoTitle}>Recent Payments</h4>
          {payments.length === 0 ? (
            <p className={styles.emptyText}>No payments recorded</p>
          ) : (
            payments.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(p => (
              <div key={p.id} className={styles.listRow}>
                <div className={styles.listRowMain}>
                  <span>{this._formatCurrency(p.amount)}</span>
                  <span className={styles.paymentMethod}>{p.method}</span>
                </div>
                <div className={styles.listRowSub}>
                  <span>{this._formatDate(p.date)}</span>
                  {p.reference && <span>Ref: {p.reference}</span>}
                </div>
              </div>
            ))
          )}
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
        {activeTab === 'account' && this._renderAccount()}
        {activeTab === 'notes' && this._renderNotes()}
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
