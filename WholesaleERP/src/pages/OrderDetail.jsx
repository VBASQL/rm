// ============================================================
// FILE: OrderDetail.jsx
// PURPOSE: Order detail view — line items, status timeline, status change
//          buttons, print/email, duplicate, edit (Draft/Submitted only).
// DEPENDS ON: PageHeader, StatusBadge, ConfirmDialog, SendMessageModal, AppContext
// DEPENDED ON BY: App.jsx (route: /orders/:id)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.7: Order # + status badge, customer name,
//   dates, line items (invoice format), totals, status timeline,
//   actions menu (Send, Duplicate, Cancel).
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-13] #001 Removed 'Shipped' from STATUS_STEPS.
//     Added status change buttons, edit mode for Draft/Submitted,
//     auto-invoice on Delivered, print/email/duplicate actions.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Send, XCircle, MoreVertical, Edit3, Printer, ChevronRight, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCart, CART_ACTIONS } from '../context/CartContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import SendMessageModal from '../components/SendMessageModal';
import styles from '../styles/OrderDetail.module.css';

// [MOD #001] Removed 'Shipped' — flow is now Draft → Submitted → Picking → Delivered.
const STATUS_STEPS = ['Draft', 'Submitted', 'Picking', 'Delivered'];

// [MOD #001] Valid next-status for each current status
const NEXT_STATUS = {
  Draft: 'Submitted',
  Submitted: 'Picking',
  Picking: 'Delivered',
};

class OrderDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      order: null,
      customer: null,
      showMenu: false,
      showCancelConfirm: false,
      // [MOD #001] Email + editing state
      showEmailModal: false,
      editMode: false,
      editItems: [],
      editNotes: '',
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

  // [MOD #001] Duplicate via storage and navigate to the new order
  handleDuplicate = () => {
    const { storage, navigate, showToast } = this.props;
    const { order } = this.state;
    this.setState({ showMenu: false });
    const newOrder = storage.duplicateOrder(order.id);
    if (newOrder) {
      showToast(`Duplicated as ${newOrder.orderNumber}`);
      navigate(`/orders/${newOrder.id}`);
    }
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

  // [MOD #001] Advance order to next status
  handleAdvanceStatus = () => {
    const { storage, showToast } = this.props;
    const { order } = this.state;
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    // [MOD #002] Wrapped in try/catch — updateOrderStatus throws on invalid transition
    try {
      const result = storage.updateOrderStatus(order.id, nextStatus);
      this._loadData(); // WHY: reload full order from storage to ensure fresh state
      showToast(`Status updated to ${nextStatus}`);
    } catch (err) {
      showToast(err.message || 'Cannot change status');
    }
  };

  // [MOD #001] Enter edit mode — copy line items for editing
  handleEnterEdit = () => {
    const { order } = this.state;
    this.setState({
      editMode: true,
      editItems: order.lineItems.map(li => ({ ...li })),
      editNotes: order.notes || '',
      showMenu: false,
    });
  };

  // [MOD #001] Save edits back to storage
  handleSaveEdit = () => {
    const { storage, showToast } = this.props;
    const { order, editItems, editNotes } = this.state;

    const subtotal = editItems.reduce((s, li) => s + li.lineTotal, 0);
    const depositTotal = editItems.reduce((s, li) => s + li.depositTotal, 0);
    const discountTotal = editItems.reduce((s, li) => s + (li.discount || 0) * li.quantity, 0);
    const totalCases = editItems.reduce((s, li) => s + li.quantity, 0);
    const grandTotal = Math.round((subtotal + depositTotal - discountTotal) * 100) / 100;

    const updated = storage.updateOrder(order.id, {
      lineItems: editItems,
      notes: editNotes,
      subtotal,
      depositTotal,
      discountTotal,
      grandTotal,
      totalCases,
    });

    // [MOD #002] Reload from storage to ensure fresh state
    this._loadData();
    this.setState({ editMode: false });
    showToast('Order updated');
  };

  handleEditQty = (idx, delta) => {
    this.setState(prev => {
      const items = [...prev.editItems];
      const item = { ...items[idx] };
      item.quantity = Math.max(1, item.quantity + delta);
      item.lineTotal = item.casePrice * item.quantity;
      item.depositTotal = item.depositPerCase * item.quantity;
      items[idx] = item;
      return { editItems: items };
    });
  };

  handleRemoveEditItem = (idx) => {
    this.setState(prev => ({
      editItems: prev.editItems.filter((_, i) => i !== idx),
    }));
  };

  // [MOD #001] Print order
  handlePrint = () => {
    this.setState({ showMenu: false });
    window.print();
  };

  // [MOD #001] Email order
  handleEmail = () => {
    this.setState({ showMenu: false, showEmailModal: true });
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
    const { order, customer, showMenu, showCancelConfirm, showEmailModal, editMode, editItems, editNotes } = this.state;

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
    // [MOD #001] Can only edit before Picking
    const canEdit = ['Draft', 'Submitted'].includes(order.status);
    const nextStatus = NEXT_STATUS[order.status];

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
                  {canEdit && !editMode && (
                    <button onClick={this.handleEnterEdit}>
                      <Edit3 size={16} /> Edit Order
                    </button>
                  )}
                  <button onClick={this.handleDuplicate}>
                    <Copy size={16} /> Duplicate Order
                  </button>
                  <button onClick={this.handlePrint}>
                    <Printer size={16} /> Print
                  </button>
                  <button onClick={this.handleEmail}>
                    <Mail size={16} /> Send Email
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

          {/* [MOD #001] Status advance button */}
          {nextStatus && order.status !== 'Cancelled' && !editMode && (
            <button className={styles.advanceBtn} onClick={this.handleAdvanceStatus}>
              <ChevronRight size={16} />
              Move to {nextStatus}
            </button>
          )}

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

          {/* [MOD #001] Edit mode — editable quantities with remove */}
          {editMode ? (
            <>
              <div className={styles.invoiceTable}>
                <div className={styles.invoiceHeader}>
                  <span>Code</span>
                  <span>Product</span>
                  <span>Cs</span>
                  <span>Price</span>
                  <span></span>
                </div>
                {editItems.map((item, idx) => (
                  <div key={idx} className={styles.editRow}>
                    <span>{item.productCode}</span>
                    <span className={styles.invoiceProductName}>{item.productName}</span>
                    <div className={styles.editQty}>
                      <button onClick={() => this.handleEditQty(idx, -1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => this.handleEditQty(idx, 1)}>+</button>
                    </div>
                    <span>${item.casePrice.toFixed(2)}</span>
                    <button className={styles.removeBtn} onClick={() => this.handleRemoveEditItem(idx)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  value={editNotes}
                  onChange={e => this.setState({ editNotes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className={styles.editActions}>
                <button className="btn btn-secondary" onClick={() => this.setState({ editMode: false })}>Cancel</button>
                <button className="btn btn-primary" onClick={this.handleSaveEdit}>Save Changes</button>
              </div>
            </>
          ) : (
            <>
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
            </>
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

        {/* [MOD #001] Email modal */}
        {showEmailModal && customer && (
          <SendMessageModal
            recipientEmail={customer.email}
            subject={`Order ${order.orderNumber} — ${customer.name}`}
            body={`Dear ${customer.contact},\n\nPlease find details for order ${order.orderNumber}.\nTotal: ${this._formatCurrency(order.grandTotal)}\nDelivery: ${this._formatDate(order.deliveryDate)}\n\nThank you.`}
            attachmentType="order"
            attachmentData={{ order, customer }}
            onClose={() => this.setState({ showEmailModal: false })}
            onSent={() => this.props.showToast('Email opened')}
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
