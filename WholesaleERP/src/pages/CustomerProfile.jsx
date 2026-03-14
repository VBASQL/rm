// ============================================================
// FILE: CustomerProfile.jsx
// PURPOSE: Full customer detail page with tabs — Overview, Orders,
//          Invoices, Payments, Account, Branches, Notes.
//          Branches tab manages delivery locations (sub-accounts).
//          Branch profiles show Main Account banner linking to parent.
// DEPENDS ON: PageHeader, StatusBadge, AppContext, EmptyState, SendMessageModal
// DEPENDED ON BY: App.jsx (route: /customers/:id)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.5: Customer Profile with action bar (New Order,
//   Collect Payment, Send Message, Call, Edit) and tabbed detail view.
//   Salesperson can reduce credit or switch to prepaid, NOT increase/grant credit.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] #branch Added Branches tab for parent accounts: list branch
//     locations, add-branch form, navigate to branch profile.
//     For branch profiles: "Main Account" banner at top links back to parent
//     and shows parent's balance/credit (since financial state is at parent level).
//     Orders tab on parent now uses getAccountOrders (all branches included).
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
  Building2, Trash2, Star, Send, Loader2, MapPin, GitBranch, Printer,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import Breadcrumb from '../components/Breadcrumb';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import SendMessageModal from '../components/SendMessageModal';
import { formatCurrency, formatDate } from '../utils/format';
import styles from '../styles/CustomerProfile.module.css';

// [MOD #001] Added Payments tab between Invoices and Account
// [MOD #branch] Added Branches tab — only rendered for parent (non-branch) customers.
// WHY: Branch profiles don't have sub-branches; they navigate to parent for branch mgmt.
const TABS = [
  { key: 'overview',  label: 'Overview',  icon: User },
  { key: 'orders',   label: 'Orders',    icon: ShoppingBag },
  { key: 'invoices', label: 'Invoices',  icon: FileText },
  { key: 'payments', label: 'Payments',  icon: Wallet },
  { key: 'account',  label: 'Account',   icon: CreditCard },
  { key: 'branches', label: 'Branches',  icon: GitBranch },
  { key: 'notes',    label: 'Notes',     icon: StickyNote },
];

// WHY: Branch profiles hide the Branches tab — branches cannot have sub-branches.
const BRANCH_TABS = TABS.filter(t => t.key !== 'branches');

class CustomerProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customer: null,
      orders: [],
      invoices: [],
      payments: [],
      // [MOD #branch] branches: list of branch locations under this account.
      branches: [],
      // [MOD #branch] parentCustomer: loaded when viewing a branch profile.
      // WHY: Balance and credit info are displayed from the parent account,
      //   not the branch record (branch.balance is always $0).
      parentCustomer: null,
      activeTab: 'overview',
      newNote: '',
      // [MOD #001] Credit reduction and email modal state
      showCreditReduce: false,
      newCreditLimit: '',
      showEmailModal: false,
      emailSubject: '',
      emailBody: '',
      // [MOD #002] Payment methods management
      showAddPaymentMethod: false,
      sendingPaymentLink: false,
      // [MOD #branch] Add branch form state
      showAddBranch: false,
      newBranchName: '',
      newBranchContact: '',
      newBranchPhone: '',
      newBranchEmail: '',
      newBranchAddress: '',
      branchErrors: {},
      // [MOD #branch] Branch picker: shown when parent has 1+ branches and rep taps New Order.
      // WHY: Rep must confirm which location they are delivering to before building the order.
      showBranchPicker: false,
      // [MOD #receipt] Track selected payment for sending receipt from payment history.
      // WHY: Each payment in history can have its receipt sent/printed, same UX as invoices.
      selectedPaymentForReceipt: null,
    };
  }

  componentDidMount() {
    this._loadData();
  }

  _loadData() {
    const { storage, customerId } = this.props;
    const customer = storage.getCustomer(Number(customerId));
    if (!customer) return;

    // [MOD #branch] For branch profiles: load orders only for this branch.
    // For parent profiles: load all account orders including all branch locations.
    const orders = customer.isBranch
      ? storage.getOrders(customer.id)
      : storage.getAccountOrders(customer.id);

    // [MOD #branch] Invoices and payments are always at the parent account level.
    // WHY: All financial records are managed on the parent account, not per-branch.
    const accountId = customer.parentId || customer.id;
    const invoices = storage.getInvoices(accountId);
    const payments = storage.getPayments(accountId);

    // [MOD #branch] Load branch locations for parent accounts.
    const branches = customer.isBranch ? [] : storage.getBranches(customer.id);

    // [MOD #branch] Load parent customer for branch profiles so we can show
    // their balance and credit info (branch.balance is always $0).
    const parentCustomer = customer.isBranch ? storage.getCustomer(customer.parentId) : null;

    this.setState({ customer, orders, invoices, payments, branches, parentCustomer });
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
      this.props.showToast('New limit must be lower than current limit', 'error');
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

  // [MOD #branch] Add a new branch location under this account.
  // WHY: Branch gets its own address/contact but shares account's credit/terms/pricing.
  // [MOD #branch] New Order entry point from the action bar.
  // WHY: If this parent account has branch locations the rep must choose which
  //   delivery address the order is going to before we open the catalog.
  //   One branch — just ask once. Zero branches — go straight to the wizard.
  handleNewOrderClick = () => {
    const { navigate, customer } = this.props.navigate
      ? this.props
      : { navigate: this.props.navigate, customer: this.state.customer };
    const { branches } = this.state;
    const cust = this.state.customer;
    if (!cust) return;

    // Branch profiles already know their delivery location — go straight through.
    if (cust.isBranch) {
      this.props.navigate(`/orders/new?customerId=${cust.id}`);
      return;
    }

    // Parent with 1+ branches: ask which location.
    if (branches.length > 0) {
      this.setState({ showBranchPicker: true });
      return;
    }

    // No branches: order for the main account directly.
    this.props.navigate(`/orders/new?customerId=${cust.id}`);
  };

  handleAddBranch = () => {
    const { storage, showToast } = this.props;
    const { customer, newBranchName, newBranchContact, newBranchPhone, newBranchEmail, newBranchAddress } = this.state;

    // Validate required fields
    const branchErrors = {};
    if (!newBranchName.trim()) branchErrors.name = 'Branch name is required';
    if (!newBranchAddress.trim()) branchErrors.address = 'Delivery address is required';
    if (!newBranchContact.trim()) branchErrors.contact = 'Contact name is required';
    if (Object.keys(branchErrors).length > 0) {
      this.setState({ branchErrors });
      return;
    }

    const branch = storage.createBranch(customer.id, {
      name: newBranchName.trim(),
      contact: newBranchContact.trim(),
      phone: newBranchPhone.trim(),
      email: newBranchEmail.trim(),
      address: newBranchAddress.trim(),
      billingAddress: customer.billingAddress,
    });

    // Reload branches list
    const branches = storage.getBranches(customer.id);
    this.setState({
      branches,
      showAddBranch: false,
      newBranchName: '',
      newBranchContact: '',
      newBranchPhone: '',
      newBranchEmail: '',
      newBranchAddress: '',
      branchErrors: {},
    });
    showToast(`Branch "${branch.name}" added`);
  };

  // [MOD #001] Open email modal pre-filled for invoice/statement
  handleEmailInvoice = (invoice) => {
    const { customer } = this.state;
    this.setState({
      showEmailModal: true,
      emailSubject: `Invoice ${invoice.invoiceNumber} — ${customer.name}`,
      emailBody: `Dear ${customer.contact},\n\nPlease find attached invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.grandTotal)}.\nAmount due: ${formatCurrency(invoice.amountDue)}\nDue date: ${formatDate(invoice.dueDate)}\n\nThank you for your business.`,
    });
  };

  handleEmailStatement = () => {
    const { customer } = this.state;
    this.setState({
      showEmailModal: true,
      emailSubject: `Account Statement — ${customer.name}`,
      emailBody: `Dear ${customer.contact},\n\nPlease find attached your account statement.\nCurrent balance: ${formatCurrency(customer.balance)}\n\nPlease don't hesitate to reach out with any questions.`,
    });
  };

  // ───────── Tab renderers ─────────

  // [MOD #001] Redesigned Overview — main activity page with balance cards,
  // credit bar, recent orders/invoices at a glance.
  // [MOD #branch] For branch profiles: show parent account's balance and credit
  // since financial state lives at the parent level (branch.balance is always $0).
  _renderOverview() {
    const { customer, orders, invoices, showCreditReduce, newCreditLimit, parentCustomer } = this.state;
    const { navigate } = this.props;

    // [MOD #branch] For branches, display financial data from the parent account.
    // WHY: Balance and credit limit are tracked on the parent, not per-branch.
    const accountCustomer = parentCustomer || customer;

    // Credit usage bar
    const isCredit = accountCustomer.paymentType === 'credit' && accountCustomer.creditLimit > 0;
    const creditUsage = isCredit ? (accountCustomer.balance / accountCustomer.creditLimit) : 0;
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
            <span className={styles.balanceAmount}>{formatCurrency(accountCustomer.balance)}</span>
          </div>
          {isCredit && (
            <div className={styles.balanceCard}>
              <span className={styles.balanceLabel}>Credit Limit</span>
              <span className={styles.balanceAmount}>{formatCurrency(accountCustomer.creditLimit)}</span>
            </div>
          )}
          {accountCustomer.accountCredit > 0 && (
            <div className={`${styles.balanceCard} ${styles.creditCard}`}>
              <span className={styles.balanceLabel}>Unapplied Credit</span>
              <span className={styles.creditAmount}>{formatCurrency(accountCustomer.accountCredit)}</span>
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
              <span>{formatCurrency(accountCustomer.creditLimit - accountCustomer.balance)} available</span>
            </div>
          </div>
        )}

        {/* [MOD #branch] Only show reduce credit on parent account, not branch profiles.
             WHY: Credit management is always done at account level. */}
        {isCredit && !customer.isBranch && (
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
                <span className={styles.reduceLabel}>New limit (current: {formatCurrency(accountCustomer.creditLimit)}):</span>
                <input
                  type="number"
                  min="0"
                  max={accountCustomer.creditLimit - 1}
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
                  <span>{formatDate(order.createdDate)}</span>
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
                  <span>Due: {formatDate(inv.dueDate)}</span>
                  <span>{formatCurrency(inv.amountDue)}</span>
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
              <span>{formatDate(order.createdDate)}</span>
              <span>{order.totalCases} cases · {formatCurrency(order.grandTotal)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // [MOD #001] Invoices tab — each row has email action button
  _renderInvoices() {
    const { invoices } = this.state;
    const { navigate } = this.props;

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
              <span>Due: {formatDate(inv.dueDate)}</span>
              <span>{formatCurrency(inv.amountDue)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // [MOD #001] Payments tab — all payments for this customer
  // [MOD #receipt] Added send/print receipt buttons for each payment.
  // WHY: Same UX as invoices — user can send or print a receipt for any payment.
  _renderPayments() {
    const { navigate } = this.props;
    const { payments, customer } = this.state;

    if (payments.length === 0) {
      return <EmptyState icon={<Wallet size={40} />} title="No payments" message="No payments recorded for this customer" />;
    }

    const methodLabels = {
      cash: 'Cash',
      check: 'Check',
      credit_card: 'Credit Card',
      ach: 'ACH/Wire',
      account_credit: 'Account Credit',
    };

    return (
      <div className={styles.tabContent}>
        {payments.sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => (
          <div
            key={p.id}
            className={styles.listRow}
            onClick={() => navigate(`/payments/${p.id}`)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.listRowMain}>
              <span className={styles.listRowTitle}>{formatCurrency(p.amount)}</span>
              <div className={styles.listRowActions}>
                <span className={styles.paymentMethod}>{methodLabels[p.method] || p.method}</span>
                <button
                  className={styles.emailBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to receipt page then print
                    navigate(`/payments/${p.id}?print=1`);
                  }}
                  title="Print receipt"
                >
                  <Printer size={14} />
                </button>
                <button
                  className={styles.emailBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.setState({
                      selectedPaymentForReceipt: p,
                      showEmailModal: true,
                      emailSubject: `Payment Receipt — ${customer.name}`,
                      emailBody: `Dear ${customer.contact || customer.name},\n\nThank you for your payment of ${formatCurrency(p.amount)}.\n\nPayment Method: ${methodLabels[p.method] || p.method}\n${p.reference ? `Reference: ${p.reference}\n` : ''}Date: ${formatDate(p.date)}\n\nPlease find your receipt attached.\n\nThank you for your business!`,
                    });
                  }}
                  title="Send receipt"
                >
                  <Mail size={14} />
                </button>
              </div>
            </div>
            <div className={styles.listRowSub}>
              <span>{formatDate(p.date)}</span>
              {p.reference && <span>Ref: {p.reference}</span>}
            </div>
            {p.appliedTo && p.appliedTo.length > 0 && (
              <div className={styles.listRowSub}>
                <span>Applied to: {p.appliedTo.map(a => a.invoiceId ? `Inv #${a.invoiceId}` : `Order #${a.orderId}`).join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // [MOD #002] Set a saved payment method as default
  handleSetDefaultPaymentMethod = (methodId, methodType) => {
    const { storage } = this.props;
    const { customer } = this.state;
    
    const updatedMethods = (customer.savedPaymentMethods || []).map(m => ({
      ...m,
      // WHY: Only one default per type (card OR ach)
      isDefault: m.id === methodId ? true : (m.type === methodType ? false : m.isDefault),
    }));
    
    storage.updateCustomer(customer.id, { savedPaymentMethods: updatedMethods });
    this.setState({ customer: { ...customer, savedPaymentMethods: updatedMethods } });
    this.props.showToast('Default payment method updated');
  };

  // [MOD #002] Remove a saved payment method
  handleRemovePaymentMethod = (methodId) => {
    const { storage } = this.props;
    const { customer } = this.state;
    
    const updatedMethods = (customer.savedPaymentMethods || []).filter(m => m.id !== methodId);
    storage.updateCustomer(customer.id, { savedPaymentMethods: updatedMethods });
    this.setState({ customer: { ...customer, savedPaymentMethods: updatedMethods } });
    this.props.showToast('Payment method removed');
  };

  // [MOD #002] Send payment link to customer to add their own card/bank
  handleSendPaymentLink = () => {
    const { customer } = this.state;
    this.setState({ sendingPaymentLink: true });
    
    // WHY: Mock sending — in production this calls backend to send secure link
    setTimeout(() => {
      this.setState({ sendingPaymentLink: false });
      this.props.showToast(`Payment setup link sent to ${customer.email}`);
    }, 1500);
  };

  // [MOD #002] Add mock payment method (for demo purposes)
  handleAddMockPaymentMethod = (type) => {
    const { storage } = this.props;
    const { customer } = this.state;
    
    const existingMethods = customer.savedPaymentMethods || [];
    const hasTypeDefault = existingMethods.some(m => m.type === type && m.isDefault);
    
    const newMethod = type === 'credit_card' 
      ? {
          id: `cc_${Date.now()}`,
          type: 'credit_card',
          last4: String(Math.floor(1000 + Math.random() * 9000)),
          brand: ['Visa', 'Mastercard', 'Amex'][Math.floor(Math.random() * 3)],
          expiry: `${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}/${26 + Math.floor(Math.random() * 5)}`,
          isDefault: !hasTypeDefault,
        }
      : {
          id: `ach_${Date.now()}`,
          type: 'ach',
          last4: String(Math.floor(1000 + Math.random() * 9000)),
          bankName: ['Chase', 'Bank of America', 'Wells Fargo', 'Citi'][Math.floor(Math.random() * 4)],
          isDefault: !hasTypeDefault,
        };
    
    const updatedMethods = [...existingMethods, newMethod];
    storage.updateCustomer(customer.id, { savedPaymentMethods: updatedMethods });
    this.setState({ 
      customer: { ...customer, savedPaymentMethods: updatedMethods },
      showAddPaymentMethod: false,
    });
    this.props.showToast(`${type === 'credit_card' ? 'Card' : 'Bank account'} added`);
  };

  // [MOD #001] Account tab — type info, credit details, send statement
  _renderAccount() {
    const { customer, showAddPaymentMethod, sendingPaymentLink } = this.state;
    const savedMethods = customer.savedPaymentMethods || [];
    const savedCards = savedMethods.filter(m => m.type === 'credit_card');
    const savedBanks = savedMethods.filter(m => m.type === 'ach');

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
              <div className={styles.infoRow}><span>Credit Limit</span><span>{formatCurrency(customer.creditLimit)}</span></div>
            </>
          )}
          <div className={styles.infoRow}><span>Price Level</span><span>{customer.priceLevel}</span></div>
          <div className={styles.infoRow}><span>Salesperson</span><span>{customer.assignedSalesperson}</span></div>
        </section>

        {/* [MOD #002] Saved Payment Methods */}
        <section className={styles.infoSection}>
          <h4 className={styles.infoTitle}>Payment Methods on File</h4>
          
          {savedCards.length > 0 && (
            <div className={styles.paymentMethodsGroup}>
              <span className={styles.methodGroupLabel}>Credit Cards</span>
              {savedCards.map(card => (
                <div key={card.id} className={styles.paymentMethodRow}>
                  <CreditCard size={18} className={styles.methodIcon} />
                  <div className={styles.methodInfo}>
                    <span className={styles.methodMain}>{card.brand} ••••{card.last4}</span>
                    <span className={styles.methodSub}>Exp {card.expiry}</span>
                  </div>
                  {card.isDefault && <span className={styles.defaultBadge}>Default</span>}
                  <div className={styles.methodActions}>
                    {!card.isDefault && (
                      <button 
                        className={styles.methodActionBtn} 
                        onClick={() => this.handleSetDefaultPaymentMethod(card.id, 'credit_card')}
                        title="Set as default"
                      >
                        <Star size={14} />
                      </button>
                    )}
                    <button 
                      className={styles.methodActionBtn} 
                      onClick={() => this.handleRemovePaymentMethod(card.id)}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {savedBanks.length > 0 && (
            <div className={styles.paymentMethodsGroup}>
              <span className={styles.methodGroupLabel}>Bank Accounts (ACH)</span>
              {savedBanks.map(bank => (
                <div key={bank.id} className={styles.paymentMethodRow}>
                  <Building2 size={18} className={styles.methodIcon} />
                  <div className={styles.methodInfo}>
                    <span className={styles.methodMain}>{bank.bankName} ••••{bank.last4}</span>
                  </div>
                  {bank.isDefault && <span className={styles.defaultBadge}>Default</span>}
                  <div className={styles.methodActions}>
                    {!bank.isDefault && (
                      <button 
                        className={styles.methodActionBtn} 
                        onClick={() => this.handleSetDefaultPaymentMethod(bank.id, 'ach')}
                        title="Set as default"
                      >
                        <Star size={14} />
                      </button>
                    )}
                    <button 
                      className={styles.methodActionBtn} 
                      onClick={() => this.handleRemovePaymentMethod(bank.id)}
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {savedMethods.length === 0 && (
            <p className={styles.emptyText}>No payment methods on file</p>
          )}
          
          {/* Add payment method options */}
          {showAddPaymentMethod ? (
            <div className={styles.addMethodOptions}>
              <button className={styles.addMethodBtn} onClick={() => this.handleAddMockPaymentMethod('credit_card')}>
                <CreditCard size={16} /> Add Card (Mock)
              </button>
              <button className={styles.addMethodBtn} onClick={() => this.handleAddMockPaymentMethod('ach')}>
                <Building2 size={16} /> Add Bank (Mock)
              </button>
              <button className={styles.addMethodBtnCancel} onClick={() => this.setState({ showAddPaymentMethod: false })}>
                Cancel
              </button>
            </div>
          ) : (
            <div className={styles.paymentMethodActions}>
              <button className={styles.actionBtn} onClick={() => this.setState({ showAddPaymentMethod: true })}>
                <Plus size={16} /> Add Payment Method
              </button>
              <button 
                className={styles.actionBtn} 
                onClick={this.handleSendPaymentLink}
                disabled={sendingPaymentLink}
              >
                {sendingPaymentLink ? (
                  <><Loader2 size={16} className={styles.spinner} /> Sending...</>
                ) : (
                  <><Send size={16} /> Send Link to Customer</>
                )}
              </button>
            </div>
          )}
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

  // [MOD #branch] Branches tab — list delivery locations + add-branch form.
  // WHY: Parent accounts can have multiple delivery addresses (branches), each
  // gets their own orders but shares the billing account.
  _renderBranches() {
    const {
      branches, showAddBranch,
      newBranchName, newBranchContact, newBranchPhone, newBranchEmail, newBranchAddress,
      branchErrors
    } = this.state;
    const { navigate } = this.props;

    return (
      <div className={styles.tabContent}>
        {branches.length === 0 && !showAddBranch && (
          <p className={styles.emptyText}>No branch locations yet</p>
        )}

        {branches.map(branch => (
          <div
            key={branch.id}
            className={styles.branchItem}
            onClick={() => navigate(`/customers/${branch.id}`)}
          >
            <div className={styles.branchItemHeader}>
              <span className={styles.branchItemName}>{branch.name}</span>
              <ChevronRight size={16} className={styles.branchChevron} />
            </div>
            <div className={styles.branchItemAddress}>
              <MapPin size={12} />
              <span>{branch.address}</span>
            </div>
            {branch.contact && (
              <div className={styles.branchItemContact}>
                <span>{branch.contact}</span>
                {branch.phone && <span> · {branch.phone}</span>}
              </div>
            )}
          </div>
        ))}

        {!showAddBranch ? (
          <button className="btn btn-secondary" onClick={() => this.setState({ showAddBranch: true })}>
            <Plus size={16} />
            Add Branch Location
          </button>
        ) : (
          <div className={styles.addBranchForm}>
            <h4 className={styles.addBranchTitle}>New Branch Location</h4>
            <div className="form-group">
              <label className="form-label">Location Name *</label>
              <input
                className={`form-input ${branchErrors.name ? 'input-error' : ''}`}
                value={newBranchName}
                onChange={e => this.setState({ newBranchName: e.target.value })}
                placeholder="e.g. Grand Hotel — Midtown"
              />
              {branchErrors.name && <span className="form-error">{branchErrors.name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Address *</label>
              <input
                className={`form-input ${branchErrors.address ? 'input-error' : ''}`}
                value={newBranchAddress}
                onChange={e => this.setState({ newBranchAddress: e.target.value })}
                placeholder="Delivery address"
              />
              {branchErrors.address && <span className="form-error">{branchErrors.address}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Contact Name *</label>
              <input
                className={`form-input ${branchErrors.contact ? 'input-error' : ''}`}
                value={newBranchContact}
                onChange={e => this.setState({ newBranchContact: e.target.value })}
                placeholder="On-site contact"
              />
              {branchErrors.contact && <span className="form-error">{branchErrors.contact}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                className="form-input"
                value={newBranchPhone}
                onChange={e => this.setState({ newBranchPhone: e.target.value })}
                placeholder="(718) 555-0000"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                value={newBranchEmail}
                onChange={e => this.setState({ newBranchEmail: e.target.value })}
                placeholder="location@example.com"
              />
            </div>
            <div className={styles.branchFormActions}>
              <button
                className="btn btn-secondary"
                onClick={() => this.setState({ showAddBranch: false, branchErrors: {} })}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={this.handleAddBranch}>
                Save Branch
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // [MOD #branch] Picker sheet shown when a parent account has branches.
  // WHY: Replaces old Step-1 search for accounts navigated from the profile —
  //   the rep already knows the account, they just need to pick the location.
  _renderBranchPicker() {
    const { customer, branches } = this.state;
    const { navigate } = this.props;
    if (!customer) return null;

    const handlePick = (customerId) => {
      this.setState({ showBranchPicker: false });
      navigate(`/orders/new?customerId=${customerId}`);
    };

    return (
      <div className={styles.pickerOverlay} onClick={() => this.setState({ showBranchPicker: false })}>
        <div className={styles.pickerSheet} onClick={e => e.stopPropagation()}>
          <div className={styles.pickerHeader}>
            <span className={styles.pickerTitle}>Delivering to…</span>
            <button
              className={styles.pickerClose}
              onClick={() => this.setState({ showBranchPicker: false })}
              aria-label="Close"
            >✕</button>
          </div>

          {/* Main account row */}
          <div
            className={styles.pickerRow}
            onClick={() => handlePick(customer.id)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.pickerRowInfo}>
              <span className={styles.pickerRowName}>{customer.name}</span>
              <span className={styles.pickerRowSub}>{customer.address}</span>
            </div>
            <ChevronRight size={18} />
          </div>

          {/* Branch rows */}
          {branches.map(branch => (
            <div
              key={branch.id}
              className={styles.pickerRow}
              onClick={() => handlePick(branch.id)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.pickerRowInfo}>
                <div className={styles.pickerRowTop}>
                  <span className={styles.pickerRowName}>{branch.name}</span>
                  <span className={styles.branchTag}>Branch</span>
                </div>
                <span className={styles.pickerRowSub}>{branch.address}</span>
              </div>
              <ChevronRight size={18} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const { navigate } = this.props;
    const { customer, activeTab, parentCustomer } = this.state;

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

        {/* [MOD #branch] Breadcrumb navigation showing hierarchy context.
             WHY: Users need to see where they are in the customer hierarchy. */}
        <Breadcrumb
          items={
            customer.isBranch && parentCustomer
              ? [
                  { label: 'Customers', path: '/customers' },
                  { label: parentCustomer.name, path: `/customers/${parentCustomer.id}` },
                  { label: customer.name },
                ]
              : [
                  { label: 'Customers', path: '/customers' },
                  { label: customer.name },
                ]
          }
        />

        {/* Customer header with status */}
        <div className={styles.customerHeader}>
          <div className={styles.headerInfo}>
            <StatusBadge status={customer.status} />
            <span className={styles.customerType}>{customer.type}</span>
          </div>
        </div>

        {/* Action bar — always visible per §5.5 */}
        <div className={styles.actionBar}>
          <button className={styles.actionItem} onClick={this.handleNewOrderClick}>
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

        {/* [MOD #branch] Branches don't show the Branches sub-tab (they link back to parent instead) */}
        <div className={styles.tabBar}>
          {(customer.isBranch ? BRANCH_TABS : TABS).map(tab => {
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
        {/* [MOD #branch] Branches tab — only on parent accounts */}
        {activeTab === 'branches' && !customer.isBranch && this._renderBranches()}

        {/* [MOD #branch] Branch location picker */}
        {this.state.showBranchPicker && this._renderBranchPicker()}

        {/* [MOD #001] Email compose modal
            [MOD #receipt] Updated to handle payment receipts when selectedPaymentForReceipt is set. */}
        {this.state.showEmailModal && (
          <SendMessageModal
            recipientEmail={customer.email}
            subject={this.state.emailSubject}
            body={this.state.emailBody}
            attachmentType={this.state.selectedPaymentForReceipt ? 'payment' : undefined}
            attachmentData={
              this.state.selectedPaymentForReceipt
                ? { payment: this.state.selectedPaymentForReceipt, customer }
                : { customer, invoices: this.state.invoices, orders: this.state.orders }
            }
            onClose={() => this.setState({ showEmailModal: false, selectedPaymentForReceipt: null })}
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
