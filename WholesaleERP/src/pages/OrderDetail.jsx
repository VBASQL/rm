// ============================================================
// FILE: OrderDetail.jsx
// PURPOSE: Read-only order view — line items in invoice format,
//          status timeline, action menu (send, duplicate, cancel).
// DEPENDS ON: PageHeader, StatusBadge, AppContext
// DEPENDED ON BY: App.jsx (route: /orders/:id)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.7: Order # + status badge, customer name,
//   dates, line items (invoice format), totals, status timeline,
//   actions menu (Send, Duplicate, Cancel).
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Send, XCircle, MoreVertical } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import styles from '../styles/OrderDetail.module.css';

const STATUS_STEPS = ['Draft', 'Submitted', 'Picking', 'Shipped', 'Delivered'];

class OrderDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      order: null,
      customer: null,
      showMenu: false,
      showCancelConfirm: false,
    };
  }

  componentDidMount() {
    this._loadData();
  }

  _loadData() {
    const { storage, orderId } = this.props;
    const order = storage.getOrder(Number(orderId));
    if (!order) return;
    const customer = storage.getCustomer(order.customerId);
    this.setState({ order, customer });
  }

  handleDuplicate = () => {
    const { navigate, order } = { navigate: this.props.navigate, order: this.state.order };
    this.setState({ showMenu: false });
    navigate(`/orders/new?customerId=${order.customerId}`);
  };

  handleCancel = () => {
    const { storage, showToast } = this.props;
    const { order } = this.state;
    storage.updateOrder(order.id, { status: 'Cancelled' });
    this.setState({
      order: { ...order, status: 'Cancelled' },
      showCancelConfirm: false,
      showMenu: false,
    });
    showToast('Order cancelled');
  };

  _formatCurrency(amt) {
    return '$' + Number(amt).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  _formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  _getStatusIndex(status) {
    const idx = STATUS_STEPS.indexOf(status);
    return idx >= 0 ? idx : -1;
  }

  render() {
    const { navigate } = this.props;
    const { order, customer, showMenu, showCancelConfirm } = this.state;

    if (!order) {
      return (
        <div className="page">
          <PageHeader title="Order" showBack onBack={() => navigate(-1)} />
          <p style={{ padding: 16, textAlign: 'center', color: '#5f6368' }}>Order not found</p>
        </div>
      );
    }

    const statusIdx = this._getStatusIndex(order.status);
    const canCancel = ['Draft', 'Submitted'].includes(order.status);

    return (
      <div className="page">
        <PageHeader
          title={order.orderNumber}
          showBack
          onBack={() => navigate(-1)}
          rightContent={
            <div style={{ position: 'relative' }}>
              <button className={styles.menuBtn} onClick={() => this.setState({ showMenu: !showMenu })}>
                <MoreVertical size={22} />
              </button>
              {showMenu && (
                <div className={styles.menu}>
                  <button onClick={this.handleDuplicate}>
                    <Copy size={16} /> Duplicate Order
                  </button>
                  {canCancel && (
                    <button onClick={() => this.setState({ showCancelConfirm: true, showMenu: false })}>
                      <XCircle size={16} /> Cancel Order
                    </button>
                  )}
                </div>
              )}
            </div>
          }
        />

        <div className={styles.content}>
          {/* Status and info */}
          <div className={styles.statusRow}>
            <StatusBadge status={order.status} />
            <span className={styles.dateText}>{this._formatDate(order.createdDate)}</span>
          </div>

          {customer && (
            <div
              className={styles.customerLink}
              onClick={() => navigate(`/customers/${customer.id}`)}
              role="button"
              tabIndex={0}
            >
              {customer.name} →
            </div>
          )}

          <div className={styles.infoRow}>
            <span>Delivery: {this._formatDate(order.deliveryDate)}</span>
          </div>

          {/* Status timeline */}
          {order.status !== 'Cancelled' && (
            <div className={styles.timeline}>
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className={`${styles.timelineStep} ${i <= statusIdx ? styles.timelineActive : ''}`}>
                  <div className={styles.timelineDot} />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}

          {/* Line items */}
          <div className={styles.invoiceTable}>
            <div className={styles.invoiceHeader}>
              <span>Code</span>
              <span>Product</span>
              <span>Cs</span>
              <span>Price</span>
              <span>Total</span>
            </div>
            {order.lineItems.map((item, idx) => (
              <React.Fragment key={idx}>
                <div className={styles.invoiceLine}>
                  <span>{item.productCode}</span>
                  <span className={styles.invoiceProductName}>{item.productName}</span>
                  <span>{item.quantity}</span>
                  <span>${item.casePrice.toFixed(2)}</span>
                  <span>${item.lineTotal.toFixed(2)}</span>
                </div>
                <div className={styles.depositLine}>
                  <span></span>
                  <span>↳ Deposit ({item.quantity} × ${item.depositPerCase.toFixed(2)})</span>
                  <span></span>
                  <span></span>
                  <span>${item.depositTotal.toFixed(2)}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Totals */}
          <div className={styles.totalSection}>
            <div className={styles.totalRow}><span>Subtotal</span><span>{this._formatCurrency(order.subtotal)}</span></div>
            <div className={styles.totalRow}><span>Deposits</span><span>{this._formatCurrency(order.depositTotal)}</span></div>
            {order.discountTotal > 0 && (
              <div className={styles.totalRow}><span>Discount</span><span>-{this._formatCurrency(order.discountTotal)}</span></div>
            )}
            <div className={`${styles.totalRow} ${styles.grandTotal}`}>
              <span>TOTAL</span><span>{this._formatCurrency(order.grandTotal)}</span>
            </div>
            <div className={styles.totalRow}><span>Total Cases</span><span>{order.totalCases}</span></div>
          </div>

          {order.notes && (
            <div className={styles.notesSection}>
              <h4>Notes</h4>
              <p>{order.notes}</p>
            </div>
          )}
        </div>

        {showCancelConfirm && (
          <ConfirmDialog
            title="Cancel Order?"
            message={`Are you sure you want to cancel ${order.orderNumber}? This cannot be undone.`}
            confirmLabel="Cancel Order"
            danger
            onConfirm={this.handleCancel}
            onCancel={() => this.setState({ showCancelConfirm: false })}
          />
        )}
      </div>
    );
  }
}

function OrderDetailWrapper(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { storage } = useApp();
  return <OrderDetail {...props} navigate={navigate} orderId={id} storage={storage} />;
}

export default OrderDetailWrapper;
