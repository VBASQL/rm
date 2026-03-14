// ============================================================
// FILE: InvoiceDetail.jsx
// PURPOSE: Invoice detail view — line items, totals, payment history,
//          customer/order links, email action, demo date-change feature.
// DEPENDS ON: PageHeader, StatusBadge, SendMessageModal, MockFeatureBanner, AppContext
// DEPENDED ON BY: App.jsx (route: /invoices/:id)
//
// WHY THIS EXISTS:
//   Invoices need to be viewable from CustomerProfile and Reports.
//   Shows full breakdown: line items, deposits, discounts, totals,
//   payment status, and an email action to send to the customer.
//   [MOD #demo] Date-override feature lets testers backdate invoices
//   to move them into overdue/aging buckets without waiting for real time to pass.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] #demo Added invoice date override with due date recalculation
//     and linked order delivery date update. Marked with MockFeatureBanner.
//   [2026-03-13] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mail, ShoppingBag, User, Printer, Edit2, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import SendMessageModal from '../components/SendMessageModal';
import MockFeatureBanner from '../components/MockFeatureBanner';
import { formatCurrency, formatDate } from '../utils/format';
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
      // [MOD #demo] Date-override feature — lets testers backdate to test aging report.
      editingDate: false,
      editDateValue: '',
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

  handlePrint = () => {
    window.print();
  };

  handleEmail = () => {
    this.setState({ showEmailModal: true });
  };

  // [MOD #demo] Open the date editor — pre-fill with current invoice createdDate.
  handleEditDate = () => {
    const { invoice } = this.state;
    this.setState({ editingDate: true, editDateValue: invoice.createdDate || '' });
  };

  // [MOD #demo] Save new invoice date:
  //   1. Recalculate dueDate from new date + customer terms.
  //   2. Update invoice in storage.
  //   3. Update the linked order's deliveryDate to match (invoice is born at delivery).
  //   4. Reload so UI reflects changes.
  handleSaveDate = () => {
    const { storage, showToast } = this.props;
    const { invoice, customer, order, editDateValue } = this.state;
    if (!editDateValue) return;

    // WHY: Recalculate dueDate from new createdDate using the same terms logic
    // as MockStorageService.createInvoice so aging buckets are consistent.
    const terms = customer?.terms || '';
    const termMatch = terms.match(/NET-?(\d+)/i);
    const daysUntilDue = (customer?.paymentType === 'prepaid' || !termMatch) ? 0 : parseInt(termMatch[1], 10);
    const newDue = new Date(editDateValue);
    newDue.setDate(newDue.getDate() + daysUntilDue);
    const newDueStr = newDue.toISOString().split('T')[0];

    storage.updateInvoice(invoice.id, {
      createdDate: editDateValue,
      dueDate: newDueStr,
    });

    // WHY: Invoice is auto-generated at delivery, so sync order.deliveryDate
    // so the order timeline stays consistent with the invoice date.
    if (order) {
      storage.updateOrder(order.id, { deliveryDate: editDateValue });
    }

    this._loadData();
    this.setState({ editingDate: false, editDateValue: '' });
    showToast('Invoice date updated');
  };

  _buildEmailBody() {
    const { invoice, customer } = this.state;
    if (!invoice) return '';
    const lines = (invoice.lineItems || []).map(li =>
      `${li.productName}  Qty: ${li.quantity}  @${formatCurrency(li.unitPrice)}  = ${formatCurrency(li.lineTotal)}`
    );
    return [
      `Invoice: ${invoice.invoiceNumber}`,
      `Date: ${formatDate(invoice.createdDate)}`,
      `Due: ${formatDate(invoice.dueDate)}`,
      `Customer: ${customer?.name || ''}`,
      '',
      'Line Items:',
      ...lines,
      '',
      `Subtotal: ${formatCurrency(invoice.subtotal)}`,
      invoice.depositTotal ? `Deposits: -${formatCurrency(invoice.depositTotal)}` : null,
      invoice.discountTotal ? `Discounts: -${formatCurrency(invoice.discountTotal)}` : null,
      `Grand Total: ${formatCurrency(invoice.grandTotal)}`,
      '',
      `Amount Paid: ${formatCurrency(invoice.amountPaid)}`,
      `Balance Due: ${formatCurrency(invoice.amountDue)}`,
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

          {/* [MOD #demo] Date editor — backdate invoice to test aging report */}
          {!this.state.editingDate ? (
            <div className={styles.dateRow}>
              <span className={styles.dateText}>
                Created: {formatDate(invoice.createdDate)}
                {' · '}
                Due: {formatDate(invoice.dueDate)}
                {invoice.paidDate && ` · Paid: ${formatDate(invoice.paidDate)}`}
              </span>
              <button
                className={styles.editDateBtn}
                onClick={this.handleEditDate}
                title="Change invoice date (demo)"
              >
                <Edit2 size={14} />
              </button>
            </div>
          ) : (
            <div className={styles.editDateForm}>
              <MockFeatureBanner
                title="Demo: Backdate Invoice"
                description="In production invoice dates are set automatically at delivery and cannot be changed. This lets you test overdue and aging report buckets without waiting for real time to pass."
              />
              <div className={styles.editDateRow}>
                <input
                  type="date"
                  className={`form-input ${styles.editDateInput}`}
                  value={this.state.editDateValue}
                  onChange={e => this.setState({ editDateValue: e.target.value })}
                />
                <button className={styles.editDateSave} onClick={this.handleSaveDate} title="Save">
                  <Check size={16} />
                </button>
                <button className={styles.editDateCancel} onClick={() => this.setState({ editingDate: false })} title="Cancel">
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

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
                  <span>{formatCurrency(item.unitPrice)}</span>
                  <span>{formatCurrency(item.lineTotal)}</span>
                </div>
                {item.deposit > 0 && (
                  <div className={styles.depositLine}>
                    <span></span>
                    <span>Deposit: {formatCurrency(item.deposit)} × {item.quantity}</span>
                    <span></span>
                    <span></span>
                    <span>-{formatCurrency(item.deposit * item.quantity)}</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Totals */}
          <div className={styles.totalSection}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.depositTotal > 0 && (
              <div className={styles.totalRow}>
                <span>Deposits</span>
                <span>-{formatCurrency(invoice.depositTotal)}</span>
              </div>
            )}
            {invoice.discountTotal > 0 && (
              <div className={styles.totalRow}>
                <span>Discounts</span>
                <span>-{formatCurrency(invoice.discountTotal)}</span>
              </div>
            )}
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>Grand Total</span>
              <span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>

          {/* Payment summary */}
          <div className={styles.paymentSection}>
            <h4>Payment</h4>
            <div className={styles.totalRow}>
              <span>Amount Paid</span>
              <span>{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.balanceDue}`}>
              <span>Balance Due</span>
              <span>{formatCurrency(invoice.amountDue)}</span>
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
                      <span className={styles.historyDate}>{formatDate(p.date)}</span>
                      <span className={styles.historyMethod}>{p.method}</span>
                    </div>
                    <span className={styles.historyAmount}>
                      {formatCurrency(applied?.amount || p.amount)}
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
