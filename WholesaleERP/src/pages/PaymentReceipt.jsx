// ============================================================
// FILE: PaymentReceipt.jsx
// PURPOSE: Payment receipt view — displays payment confirmation with
//          customer details, payment method, amount, and applied allocations.
//          Provides print and email actions for official receipts.
// DEPENDS ON: PageHeader, SendMessageModal, AppContext
// DEPENDED ON BY: App.jsx (route: /payments/:id)
//
// WHY THIS EXISTS:
//   After collecting payment, salesperson needs an official receipt view
//   that can be printed or emailed to the customer. Same UX pattern as
//   InvoiceDetail — dedicated page with print/email actions in header.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Mail, User, Printer, FileText, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SendMessageModal from '../components/SendMessageModal';
import { formatCurrency, formatDate } from '../utils/format';
import styles from '../styles/PaymentReceipt.module.css';

// WHY: Human-readable labels for payment method codes
const METHOD_LABELS = {
  cash: 'Cash',
  check: 'Check',
  credit_card: 'Credit Card',
  ach: 'ACH / Bank Transfer',
  wire: 'Wire Transfer',
};

class PaymentReceipt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      payment: null,
      customer: null,
      // [MOD #receipt] Store actual order/invoice objects to show real numbers
      appliedItems: [],
      showEmailModal: false,
    };
  }

  componentDidMount() {
    this._loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    // [MOD #receipt] Auto-print when ?print=1 query param is present
    // WHY: When user clicks "Print" from payment overlay or history,
    // navigate here with ?print=1 to trigger print dialog automatically.
    if (!prevState.payment && this.state.payment && this.props.autoPrint) {
      setTimeout(() => window.print(), 300);
    }
  }

  _loadData() {
    const { storage, id } = this.props;
    const payment = storage.getPayment(Number(id));
    if (!payment) return;

    const customer = payment.customerId ? storage.getCustomer(payment.customerId) : null;

    // [MOD #receipt] Load actual orders/invoices to get their real numbers
    // WHY: appliedTo contains IDs (1, 2, 3) but we need to show "ORD-0001", "INV-0001"
    const appliedItems = [];
    if (payment.appliedTo && payment.appliedTo.length > 0) {
      for (const item of payment.appliedTo) {
        if (item.invoiceId) {
          const invoice = storage.getInvoice(item.invoiceId);
          if (invoice) {
            appliedItems.push({
              type: 'invoice',
              id: item.invoiceId,
              number: invoice.invoiceNumber,
              amount: item.amount,
            });
          }
        } else if (item.orderId) {
          const order = storage.getOrder(item.orderId);
          if (order) {
            appliedItems.push({
              type: 'order',
              id: item.orderId,
              number: order.orderNumber,
              amount: item.amount,
            });
          }
        }
      }
    }

    this.setState({ payment, customer, appliedItems });
  }

  handlePrint = () => {
    window.print();
  };

  handleEmail = () => {
    this.setState({ showEmailModal: true });
  };

  _buildEmailBody() {
    const { payment, customer } = this.state;
    if (!payment) return '';

    const methodLabel = METHOD_LABELS[payment.method] || payment.method;
    const lines = [
      `Payment Receipt`,
      ``,
      `Amount: ${formatCurrency(payment.amount)}`,
      `Date: ${formatDate(payment.date)}`,
      `Method: ${methodLabel}`,
      payment.reference ? `Reference: ${payment.reference}` : null,
      ``,
      `Customer: ${customer?.name || ''}`,
      customer?.address ? `Address: ${customer.address}` : null,
      ``,
      `Thank you for your payment!`,
    ].filter(Boolean);

    return lines.join('\n');
  }

  // WHY: Show what the payment was applied to (orders, invoices, or credit)
  _renderAppliedTo() {
    const { payment, appliedItems } = this.state;
    const { navigate } = this.props;

    if (!payment.appliedTo || payment.appliedTo.length === 0) {
      // Payment went to account credit
      return (
        <div className={styles.appliedSection}>
          <h3 className={styles.sectionTitle}>Applied To</h3>
          <div className={styles.appliedRow}>
            <span className={styles.appliedLabel}>Account Credit</span>
            <span className={styles.appliedAmount}>{formatCurrency(payment.amount)}</span>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.appliedSection}>
        <h3 className={styles.sectionTitle}>Applied To</h3>
        {appliedItems.map((item, idx) => (
          <div
            key={idx}
            className={styles.appliedRow}
            onClick={() => {
              if (item.type === 'invoice') navigate(`/invoices/${item.id}`);
              else if (item.type === 'order') navigate(`/orders/${item.id}`);
            }}
            role="button"
            tabIndex={0}
          >
            <span className={styles.appliedIcon}>
              {item.type === 'invoice' ? <FileText size={14} /> : <ShoppingBag size={14} />}
            </span>
            <span className={styles.appliedLabel}>
              {item.number}
            </span>
            <span className={styles.appliedAmount}>{formatCurrency(item.amount)}</span>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { navigate } = this.props;
    const { payment, customer, showEmailModal } = this.state;

    if (!payment) {
      return (
        <>
          <PageHeader title="Receipt Not Found" showBack onBack={() => navigate(-1)} />
          <div className={styles.content}>
            <p>This payment receipt could not be found.</p>
          </div>
        </>
      );
    }

    const methodLabel = METHOD_LABELS[payment.method] || payment.method;

    return (
      <>
        <PageHeader
          title="Payment Receipt"
          showBack
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

        {/* WHY: Print-friendly receipt layout — company header, payment details, customer info */}
        <div className={styles.content}>
          {/* Receipt header with amount */}
          <div className={styles.receiptHeader}>
            <p className={styles.receiptLabel}>Amount Received</p>
            <h2 className={styles.receiptAmount}>{formatCurrency(payment.amount)}</h2>
            <p className={styles.receiptDate}>{formatDate(payment.date)}</p>
          </div>

          {/* Payment details card */}
          <div className={styles.detailCard}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Payment Method</span>
              <span className={styles.detailValue}>{methodLabel}</span>
            </div>
            {payment.reference && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Reference / Check #</span>
                <span className={styles.detailValue}>{payment.reference}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Receipt #</span>
              <span className={styles.detailValue}>PMT-{String(payment.id).padStart(6, '0')}</span>
            </div>
          </div>

          {/* Customer info */}
          {customer && (
            <div
              className={styles.customerCard}
              onClick={() => navigate(`/customers/${customer.id}`)}
              role="button"
              tabIndex={0}
            >
              <User size={16} className={styles.customerIcon} />
              <div className={styles.customerInfo}>
                <span className={styles.customerName}>{customer.name}</span>
                {customer.address && (
                  <span className={styles.customerAddress}>{customer.address}</span>
                )}
              </div>
            </div>
          )}

          {/* Applied to section */}
          {this._renderAppliedTo()}

          {/* Thank you message (shows in print) */}
          <p className={styles.thankYou}>Thank you for your payment!</p>
        </div>

        {/* Email modal */}
        {showEmailModal && customer && (
          <SendMessageModal
            recipientEmail={customer.email}
            subject={`Payment Receipt — ${customer.name}`}
            body={`Dear ${customer.contact || customer.name},\n\nThank you for your payment of ${formatCurrency(payment.amount)}.\n\nPayment Method: ${methodLabel}\n${payment.reference ? `Reference: ${payment.reference}\n` : ''}Date: ${formatDate(payment.date)}\n\nPlease find your receipt attached.\n\nThank you for your business!`}
            attachmentType="payment"
            attachmentData={{ payment, customer }}
            onClose={() => this.setState({ showEmailModal: false })}
            onSent={() => this.props.showToast('Receipt email opened')}
          />
        )}
      </>
    );
  }
}

// WHY: Functional wrapper to inject hooks (navigate, params, context) into class component.
// Same pattern as other detail pages (InvoiceDetail, OrderDetail).
function PaymentReceiptWrapper(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { storage } = useApp();

  // [MOD #receipt] Check for ?print=1 to auto-trigger print
  const autoPrint = searchParams.get('print') === '1';

  return (
    <PaymentReceipt
      {...props}
      navigate={navigate}
      id={id}
      storage={storage}
      autoPrint={autoPrint}
    />
  );
}

export default PaymentReceiptWrapper;
