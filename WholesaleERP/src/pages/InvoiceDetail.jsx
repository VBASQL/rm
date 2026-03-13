// ============================================================
// FILE: InvoiceDetail.jsx
// PURPOSE: Invoice detail view — line items, totals, payment history,
//          customer/order links, email action.
// DEPENDS ON: PageHeader, StatusBadge, SendMessageModal, AppContext
// DEPENDED ON BY: App.jsx (route: /invoices/:id)
//
// WHY THIS EXISTS:
//   Invoices need to be viewable from CustomerProfile and Reports.
//   Shows full breakdown: line items, deposits, discounts, totals,
//   payment status, and an email action to send to the customer.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-13] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, ShoppingBag, User, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import SendMessageModal from '../components/SendMessageModal';
import styles from '../styles/InvoiceDetail.module.css';

class InvoiceDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invoice: null,
      customer: null,
      order: null,
      payments: [],
      showEmailModal: false,
    };
  }

  componentDidMount() {
    this._loadData();
  }

  _loadData() {
    const { storage, id } = this.props;
    const invoice = storage.getInvoice(Number(id));
    if (!invoice) return;

    const customer = invoice.customerId ? storage.getCustomer(invoice.customerId) : null;
    const order = invoice.orderId ? storage.getOrder(invoice.orderId) : null;

    // WHY: Filter payments that were applied to this invoice
    const allPayments = storage.getPayments(invoice.customerId);
    const payments = allPayments.filter(p =>
      p.appliedTo && p.appliedTo.some(a => a.invoiceId === invoice.id)
    );

    this.setState({ invoice, customer, order, payments });
  }

  _formatCurrency(amt) {
    return '$' + Number(amt || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  _formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  handlePrint = () => {
    window.print();
  };

  handleEmail = () => {
    this.setState({ showEmailModal: true });
  };

  _buildEmailBody() {
    const { invoice, customer } = this.state;
    if (!invoice) return '';
    const lines = (invoice.lineItems || []).map(li =>
      `${li.productName}  Qty: ${li.quantity}  @${this._formatCurrency(li.unitPrice)}  = ${this._formatCurrency(li.lineTotal)}`
    );
    return [
      `Invoice: ${invoice.invoiceNumber}`,
      `Date: ${this._formatDate(invoice.createdDate)}`,
      `Due: ${this._formatDate(invoice.dueDate)}`,
      `Customer: ${customer?.name || ''}`,
      '',
      'Line Items:',
      ...lines,
      '',
      `Subtotal: ${this._formatCurrency(invoice.subtotal)}`,
      invoice.depositTotal ? `Deposits: -${this._formatCurrency(invoice.depositTotal)}` : null,
      invoice.discountTotal ? `Discounts: -${this._formatCurrency(invoice.discountTotal)}` : null,
      `Grand Total: ${this._formatCurrency(invoice.grandTotal)}`,
      '',
      `Amount Paid: ${this._formatCurrency(invoice.amountPaid)}`,
      `Balance Due: ${this._formatCurrency(invoice.amountDue)}`,
    ].filter(Boolean).join('\n');
  }

  render() {
    const { navigate } = this.props;
    const { invoice, customer, order, payments, showEmailModal } = this.state;

    if (!invoice) {
      return (
        <>
          <PageHeader title="Invoice Not Found" onBack={() => navigate(-1)} />
          <div className={styles.content}>
            <p>This invoice could not be found.</p>
          </div>
        </>
      );
    }

    const lineItems = invoice.lineItems || [];

    return (
      <>
        <PageHeader
          title={invoice.invoiceNumber}
          onBack={() => navigate(-1)}
          rightContent={
            <div className={styles.headerActions}>
              <button className={styles.iconBtn} onClick={this.handlePrint} title="Print">
                <Printer size={18} />
              </button>
              <button className={styles.iconBtn} onClick={this.handleEmail} title="Email">
                <Mail size={18} />
              </button>
            </div>
          }
        />
        <div className={styles.content}>
          {/* Status + dates */}
          <div className={styles.statusRow}>
            <StatusBadge status={invoice.status} />
          </div>
          <div className={styles.dateText}>
            Created: {this._formatDate(invoice.createdDate)}
            {' · '}
            Due: {this._formatDate(invoice.dueDate)}
            {invoice.paidDate && ` · Paid: ${this._formatDate(invoice.paidDate)}`}
          </div>

          {/* Customer + Order links */}
          {customer && (
            <div
              className={styles.linkRow}
              onClick={() => navigate(`/customers/${customer.id}`)}
              role="button"
              tabIndex={0}
            >
              <User size={14} />
              <span>{customer.name}</span>
            </div>
          )}
          {order && (
            <div
              className={styles.linkRow}
              onClick={() => navigate(`/orders/${order.id}`)}
              role="button"
              tabIndex={0}
            >
              <ShoppingBag size={14} />
              <span>{order.orderNumber}</span>
            </div>
          )}

          {/* Line items table */}
          <div className={styles.invoiceTable}>
            <div className={styles.invoiceHeader}>
              <span>SKU</span>
              <span>Product</span>
              <span>Qty</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            {lineItems.map((item, idx) => (
              <React.Fragment key={idx}>
                <div className={styles.invoiceLine}>
                  <span>{item.sku}</span>
                  <span className={styles.invoiceProductName}>{item.productName}</span>
                  <span>{item.quantity}</span>
                  <span>{this._formatCurrency(item.unitPrice)}</span>
                  <span>{this._formatCurrency(item.lineTotal)}</span>
                </div>
                {item.deposit > 0 && (
                  <div className={styles.depositLine}>
                    <span></span>
                    <span>Deposit: {this._formatCurrency(item.deposit)} × {item.quantity}</span>
                    <span></span>
                    <span></span>
                    <span>-{this._formatCurrency(item.deposit * item.quantity)}</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Totals */}
          <div className={styles.totalSection}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{this._formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.depositTotal > 0 && (
              <div className={styles.totalRow}>
                <span>Deposits</span>
                <span>-{this._formatCurrency(invoice.depositTotal)}</span>
              </div>
            )}
            {invoice.discountTotal > 0 && (
              <div className={styles.totalRow}>
                <span>Discounts</span>
                <span>-{this._formatCurrency(invoice.discountTotal)}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Grand Total</span>
              <span>{this._formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>

          {/* Payment summary */}
          <div className={styles.paymentSection}>
            <h4>Payment</h4>
            <div className={styles.totalRow}>
              <span>Amount Paid</span>
              <span>{this._formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.balanceDue}`}>
              <span>Balance Due</span>
              <span>{this._formatCurrency(invoice.amountDue)}</span>
            </div>
          </div>

          {/* Payment history */}
          {payments.length > 0 && (
            <div className={styles.historySection}>
              <h4>Payment History</h4>
              {payments.map(p => {
                const applied = p.appliedTo.find(a => a.invoiceId === invoice.id);
                return (
                  <div key={p.id} className={styles.historyRow}>
                    <div>
                      <span className={styles.historyDate}>{this._formatDate(p.date)}</span>
                      <span className={styles.historyMethod}>{p.method}</span>
                    </div>
                    <span className={styles.historyAmount}>
                      {this._formatCurrency(applied?.amount || p.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Email modal */}
        {showEmailModal && (
          <SendMessageModal
            recipientEmail={customer ? customer.email : ''}
            subject={`Invoice ${invoice.invoiceNumber}`}
            body={this._buildEmailBody()}
            attachmentType="invoice"
            attachmentData={{ invoice, customer }}
            onClose={() => this.setState({ showEmailModal: false })}
          />
        )}
      </>
    );
  }
}

// WHY: Wrapper provides hooks (navigate, params, context) to class component.
export default function InvoiceDetailWrapper(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { storage } = useApp();
  return <InvoiceDetail {...props} navigate={navigate} id={id} storage={storage} />;
}
