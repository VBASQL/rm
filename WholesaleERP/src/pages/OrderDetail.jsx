// ============================================================
// FILE: OrderDetail.jsx
// PURPOSE: Order detail view — line items, status timeline, status change
//          buttons, print/email, duplicate, edit (Draft/Submitted only).
// DEPENDS ON: PageHeader, StatusBadge, ConfirmDialog, SendMessageModal, OrderReceipt, AppContext
// DEPENDED ON BY: App.jsx (route: /orders/:id)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.7: Order # + status badge, customer name,
//   dates, line items (invoice format), totals, status timeline,
//   actions menu (Send, Duplicate, Cancel).
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] #003 handleDuplicate rewritten — now loads cart via LOAD_CART
//     and navigates to /orders/new?duplicate=1 so rep reviews before submitting.
//     OrderDetailWrapper updated to pass cartDispatch from useCart.
//   [2026-03-13] #002 Replaced bare-bones edit mode and inline receipt with
//     shared OrderReceipt component. Fixed discountTotal bug (was flat amount,
//     now percentage-based). Added locked banner, discount caps, computed totals.
//   [2026-03-13] #001 Removed 'Shipped' from STATUS_STEPS.
//     Added status change buttons, edit mode for Draft/Submitted,
//     auto-invoice on Delivered, print/email/duplicate actions.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, Send, XCircle, MoreVertical, Edit3, Printer, ChevronRight, Mail, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCart, CART_ACTIONS } from '../context/CartContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import SendMessageModal from '../components/SendMessageModal';
import OrderReceipt from '../components/OrderReceipt';
import MockFeatureBanner from '../components/MockFeatureBanner';
import { formatCurrency, formatDate } from '../utils/format';
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

  // [MOD #002] Duplicate — loads cart with original items + customer and
  // sends rep through the full order wizard (Step 2 → Review → Submit).
  // WHY CHANGED: Auto-duplicate bypassed review; reps need to verify qty,
  // pricing, and delivery date before submitting. Customer can also be
  // swapped via the Change button in Step 2.
  // BEFORE: called storage.duplicateOrder() and navigated to the new draft.
  // REVERT RISK: Restoring old path loses the review-gate requirement.
  handleDuplicate = () => {
    const { storage, navigate, cartDispatch, showToast } = this.props;
    const { order, customer } = this.state;
    this.setState({ showMenu: false });

    // Load original line items into cart (deep copy — no mutation of source order)
    cartDispatch({
      type: CART_ACTIONS.LOAD_CART,
      payload: {
        customerId: order.customerId,
        customerName: customer ? customer.name : '',
        lineItems: order.lineItems.map(li => ({ ...li })),
        deliveryDate: null,   // WHY: Force rep to pick a fresh date
        deliverNow: false,
        notes: order.notes || '',
        orderDiscount: { type: 'percent', value: 0 },
      },
    });

    showToast(`Building duplicate of ${order.orderNumber}`);
    // duplicate=1 tells NewOrder to skip customer-select and open at Step 2
    navigate('/orders/new?duplicate=1');
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
    showToast('Order cancelled', 'warning');
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
      showToast(err.message || 'Cannot change status', 'error');
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
    // WHY: discountTotal = sum of per-line discount amounts (percentage-based)
    // [MOD #002] BEFORE: (li.discount || 0) * li.quantity — treated discount as flat $
    // WHY CHANGED: discount field is a percentage (0–15), not dollars. Old calc was wrong.
    // REVERT RISK: Order totals stored with wrong discountTotal — accounting mismatch.
    const discountTotal = editItems.reduce((s, li) => {
      const raw = li.casePrice * li.quantity;
      return s + (raw * ((li.discount || 0) / 100));
    }, 0);
    const totalCases = editItems.reduce((s, li) => s + li.quantity, 0);
    // [MOD #003] BEFORE: grandTotal = subtotal + depositTotal (ignored discountTotal)
    // WHY CHANGED: Orders with item discounts must subtract discountTotal from grand total.
    // REVERT RISK: Stored totals will mismatch if discount handling reverted.
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

  // [MOD #002] OrderReceipt callback — receives fully-recalculated item
  // BEFORE: handleEditQty (qty ±1 only) and handleRemoveEditItem (no price/disc edit).
  // WHY CHANGED: OrderReceipt handles full editing (qty, price, discount, recalc).
  // REVERT RISK: Must restore old qty-only edit handlers + inline edit JSX.
  handleEditUpdateItem = (mergedItem) => {
    this.setState(prev => {
      const items = prev.editItems.map(li =>
        li.productId === mergedItem.productId ? mergedItem : li
      );
      return { editItems: items };
    });
  };

  // [MOD #002] OrderReceipt callback — remove item by productId
  handleEditRemoveItem = (productId) => {
    this.setState(prev => ({
      editItems: prev.editItems.filter(li => li.productId !== productId),
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

  // [MOD #returns] Create return from this delivered order
  handleCreateReturn = () => {
    const { navigate } = this.props;
    const { order } = this.state;
    this.setState({ showMenu: false });
    navigate(`/returns/new?fromOrder=${order.id}`);
  };

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
    // [MOD #returns] Can create return only after Delivered
    const canReturn = order.status === 'Delivered';
    // WHY: Once Picking starts, the warehouse is pulling product — no more changes.
    const isLocked = !['Draft', 'Submitted'].includes(order.status) && order.status !== 'Cancelled';
    const nextStatus = NEXT_STATUS[order.status];

    // [MOD #002] Discount caps for editable receipt
    const { storage, showToast } = this.props;
    const caps = storage.getDiscountSettings();
    const maxItemDisc = caps ? caps.perItemPercent : 15;

    // [MOD #002] Compute totals for edit mode so OrderReceipt can display them
    const displayItems = editMode ? editItems : order.lineItems;
    const displayTotals = editMode
      ? (() => {
          const subtotal = editItems.reduce((s, li) => s + li.lineTotal, 0);
          const depositTotal = editItems.reduce((s, li) => s + li.depositTotal, 0);
          const discountTotal = editItems.reduce((s, li) => {
            const raw = li.casePrice * li.quantity;
            return s + (raw * ((li.discount || 0) / 100));
          }, 0);
          const totalCases = editItems.reduce((s, li) => s + li.quantity, 0);
          return {
            subtotal,
            depositTotal,
            discountTotal,
            grandTotal: Math.round((subtotal + depositTotal) * 100) / 100,
            totalCases,
          };
        })()
      : {
          subtotal: order.subtotal,
          depositTotal: order.depositTotal,
          discountTotal: order.discountTotal,
          grandTotal: order.grandTotal,
          totalCases: order.totalCases,
        };

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
                  {canReturn && (
                    <button onClick={this.handleCreateReturn}>
                      <RotateCcw size={16} /> Create Return
                    </button>
                  )}
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
          {/* Locked banner — once Picking starts, no edits or cancels */}
          {isLocked && (
            <div className={styles.lockedBanner}>
              🔒 Order is locked — editing and cancellation are disabled once picking begins.
            </div>
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

          {/* Status advance button */}
          {nextStatus && order.status !== 'Cancelled' && !editMode && (
            <>
              <MockFeatureBanner
                title="Demo: Manual Status Advance"
                description="In production, status advances automatically — the warehouse confirms picking on their handheld scanner, and the driver confirms delivery on theirs. This button simulates those real-world events so you can see the full order flow."
              />
              <button className={styles.advanceBtn} onClick={this.handleAdvanceStatus}>
              <ChevronRight size={16} />
              Move to {nextStatus}
            </button>
            </>
          )}

          {/* [MOD #002] Shared receipt — replaced inline invoice table + edit rows
              BEFORE: Inline JSX with invoiceTable/invoiceLine for read-only, editRow for edit
              WHY CHANGED: Same receipt UX as NewOrder step 3; full edit capability
              REVERT RISK: Must restore ~200 lines of inline receipt/edit JSX */}
          <OrderReceipt
            editable={editMode}
            customer={customer}
            lineItems={displayItems}
            totals={displayTotals}
            orderNumber={order.orderNumber}
            statusBadge={<StatusBadge status={order.status} />}
            createdDate={order.createdDate}
            deliveryDate={order.deliveryDate}
            notes={!editMode ? order.notes : undefined}
            maxItemDiscount={maxItemDisc}
            onUpdateItem={this.handleEditUpdateItem}
            onRemoveItem={this.handleEditRemoveItem}
            onToast={showToast}
            onCustomerClick={() => navigate(`/customers/${customer.id}`)}
            amountPaid={order.amountPaid || 0}
            paymentStatus={order.paymentStatus}
            afterTotals={editMode ? (
              <>
                <div className="form-group" style={{ marginTop: 'var(--space-sm)' }}>
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
            ) : null}
          />
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
            body={`Dear ${customer.contact},\n\nPlease find details for order ${order.orderNumber}.\nTotal: ${formatCurrency(order.grandTotal)}\nDelivery: ${formatDate(order.deliveryDate)}\n\nThank you.`}
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
  // WHY: cartDispatch needed so handleDuplicate can pre-load the cart
  // before navigating to the new-order wizard.
  const { dispatch: cartDispatch } = useCart();
  return <OrderDetail {...props} navigate={navigate} orderId={id} storage={storage} cartDispatch={cartDispatch} />;
}

export default OrderDetailWrapper;
