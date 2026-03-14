// ============================================================
// FILE: OrderReceipt.jsx
// PURPOSE: Shared receipt/invoice-style view for order line items.
//   Supports editable mode (qty, price, discount, remove) for
//   NewOrder step 3 and OrderDetail edit mode, and read-only mode
//   for OrderDetail view. Shows payment status (Paid/Partial/Unpaid).
// DEPENDS ON: OrderReceipt.module.css
// DEPENDED ON BY: NewOrder (step 3), OrderDetail (edit + read-only)
//
// ⚠️ WARNING: This component is shared by NewOrder step 3 AND OrderDetail.
// Changes here affect both order creation review and order editing.
// Test BOTH flows after any change.
//
// WHY THIS EXISTS:
//   Same receipt layout was duplicated across NewOrder step 3 and
//   OrderDetail with inconsistent editing capabilities.
//   Single component ensures identical UX: customer header, editable
//   line items with discount/price, totals, notes, delivery options.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-13] #002 Added payment status section — shows amountPaid,
//     balance due, and Paid/Partial/Unpaid badge.
//   [2026-03-13] Initial extraction from NewOrder._renderStep3
//     and OrderDetail edit/read-only modes.
// ============================================================
import React from 'react';
import { Plus, Minus, Trash2, AlertTriangle, Truck, Calendar } from 'lucide-react';
import styles from '../styles/OrderReceipt.module.css';

// ⚠️ WARNING: Discount cap enforcement happens here — both price and discount%
// edits are validated against maxItemDiscount prop. Removing this validation
// allows salespeople to exceed discount limits set in Settings.
class OrderReceipt extends React.Component {
  // ───── Editable mode handlers ─────
  // WHY: All edit logic is in this component so both NewOrder and OrderDetail
  // get identical discount-cap enforcement, price validation, and total recalc.

  _handleQtyChange = (item, delta) => {
    const { onUpdateItem } = this.props;
    if (!onUpdateItem) return;
    const newQty = Math.max(1, item.quantity + delta);
    this._recalcAndUpdate(item, { quantity: newQty });
  };

  _handleQtyInput = (item, val) => {
    const newQty = parseInt(val, 10);
    if (isNaN(newQty) || newQty < 1) return;
    this._recalcAndUpdate(item, { quantity: newQty });
  };

  // WHY: Price edit enforces per-item discount cap — salesperson can lower
  // the price but implied discount% cannot exceed cap.
  _handlePriceChange = (item, val) => {
    const price = parseFloat(val);
    if (isNaN(price) || price < 0) return;
    const { maxItemDiscount, onToast } = this.props;
    const maxPct = maxItemDiscount || 15;

    const originalPrice = item.originalCasePrice || item.casePrice;
    const impliedDiscount = originalPrice > 0
      ? ((originalPrice - price) / originalPrice) * 100
      : 0;

    if (impliedDiscount > maxPct) {
      if (onToast) onToast(`Price implies ${impliedDiscount.toFixed(1)}% discount — exceeds ${maxPct}% cap`, 'error');
      return;
    }
    if (impliedDiscount > maxPct * 0.7) {
      if (onToast) onToast(`Warning: ${impliedDiscount.toFixed(1)}% discount — approaching ${maxPct}% cap`, 'warning');
    }

    this._recalcAndUpdate(item, { casePrice: price });
  };

  // WHY: Discount % edit enforces same cap as price.
  _handleDiscountChange = (item, val) => {
    const disc = parseFloat(val) || 0;
    const { maxItemDiscount, onToast } = this.props;
    const maxPct = maxItemDiscount || 15;

    if (disc > maxPct) {
      if (onToast) onToast(`${disc}% discount exceeds ${maxPct}% cap — blocked`, 'error');
      return;
    }
    if (disc > maxPct * 0.7) {
      if (onToast) onToast(`Warning: ${disc}% discount — approaching ${maxPct}% cap`, 'warning');
    }

    this._recalcAndUpdate(item, { discount: disc });
  };

  // WHY: Shared recalc — computes lineTotal and depositTotal after any field change.
  // Preserves originalCasePrice for discount cap reference.
  _recalcAndUpdate(item, changes) {
    const { onUpdateItem } = this.props;
    if (!onUpdateItem) return;
    const merged = { ...item, ...changes };
    if (!merged.originalCasePrice) {
      merged.originalCasePrice = item.originalCasePrice || item.casePrice;
    }
    const rawLineTotal = merged.casePrice * merged.quantity;
    const discountAmount = rawLineTotal * ((merged.discount || 0) / 100);
    merged.lineTotal = rawLineTotal - discountAmount;
    merged.depositTotal = merged.depositPerCase * merged.quantity;
    onUpdateItem(merged);
  }

  // ───── Rendering ─────

  _renderCustomerBlock() {
    const { customer, createdDate, deliveryDate, orderNumber, statusBadge } = this.props;
    if (!customer) return null;

    const formatDate = (d) => {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
      <>
        {/* ── Receipt Header ── */}
        <div className={styles.receiptHeader}>
          <div>
            <h2 className={styles.receiptTitle}>{orderNumber || 'Order Review'}</h2>
            {statusBadge}
          </div>
          <span className={styles.receiptDate}>
            {createdDate ? formatDate(createdDate) : new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
          </span>
        </div>

        <div className={styles.receiptDivider} />

        {/* ── Customer Info Block ── */}
        <div className={styles.receiptCustomer}>
          <div className={styles.receiptCustRow}>
            <div className={styles.receiptCustBlock}>
              <span className={styles.receiptCustLabel}>Customer</span>
              <span
                className={styles.receiptCustName}
                onClick={this.props.onCustomerClick}
                role={this.props.onCustomerClick ? 'button' : undefined}
                tabIndex={this.props.onCustomerClick ? 0 : undefined}
                style={this.props.onCustomerClick ? { cursor: 'pointer', color: 'var(--color-primary)' } : undefined}
              >
                {customer.name}
              </span>
              <span className={styles.receiptCustDetail}>{customer.code}</span>
            </div>
            <div className={styles.receiptCustBlock}>
              <span className={styles.receiptCustLabel}>Contact</span>
              <span className={styles.receiptCustDetail}>{customer.contact}</span>
              <span className={styles.receiptCustDetail}>{customer.phone}</span>
            </div>
          </div>
          <div className={styles.receiptCustRow}>
            <div className={styles.receiptCustBlock}>
              <span className={styles.receiptCustLabel}>Address</span>
              <span className={styles.receiptCustDetail}>{customer.address}</span>
            </div>
            <div className={styles.receiptCustBlock}>
              <span className={styles.receiptCustLabel}>Route</span>
              <span className={styles.receiptCustDetail}>{customer.route}</span>
            </div>
          </div>
          <div className={styles.receiptCustRow}>
            <div className={styles.receiptCustBlock}>
              <span className={styles.receiptCustLabel}>Payment</span>
              <span className={styles.receiptCustDetail}>
                {customer.paymentType === 'credit'
                  ? `Credit (${customer.terms}) · Tier ${customer.creditTier}`
                  : 'Prepaid'}
              </span>
            </div>
            <div className={styles.receiptCustBlock}>
              <span className={styles.receiptCustLabel}>
                {deliveryDate ? 'Delivery' : 'Balance'}
              </span>
              <span className={styles.receiptCustDetail}>
                {deliveryDate ? formatDate(deliveryDate) : `$${customer.balance.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  _renderEditableItems() {
    const { lineItems, maxItemDiscount, onRemoveItem } = this.props;
    const maxPct = maxItemDiscount || 15;

    return (
      <div className={styles.receiptItemsSection}>
        <div className={`${styles.receiptItemsHeader} ${styles.editableGrid}`}>
          <span>Code</span>
          <span>Product</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Disc%</span>
          <span>Total</span>
          <span></span>
        </div>

        {lineItems.map((item, idx) => {
          const discWarn = (item.discount || 0) > maxPct * 0.7;
          const originalPrice = item.originalCasePrice || item.casePrice;
          const priceChanged = item.casePrice !== originalPrice;
          const itemKey = item.productId || idx;

          return (
            <div key={itemKey} className={`${styles.receiptItemRow} ${styles.editableGrid}`}>
              <span className={styles.riColCode}>{item.productCode}</span>
              <span className={styles.riColName}>
                {item.productName}
                {priceChanged && <span className={styles.priceOverride}> edited</span>}
              </span>

              {/* Qty — editable */}
              <div className={styles.riColQty}>
                <div className={styles.riQtyControls}>
                  <button className={styles.riQtyBtn} onClick={() => this._handleQtyChange(item, -1)}>
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    className={styles.riQtyInput}
                    value={item.quantity}
                    min="1"
                    onChange={(e) => this._handleQtyInput(item, e.target.value)}
                  />
                  <button className={styles.riQtyBtn} onClick={() => this._handleQtyChange(item, 1)}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Price — editable */}
              <div className={styles.riColPrice}>
                <div className={styles.riPriceWrap}>
                  <span className={styles.riDollar}>$</span>
                  <input
                    type="number"
                    className={styles.riPriceInput}
                    value={item.casePrice}
                    min="0"
                    step="0.01"
                    onChange={(e) => this._handlePriceChange(item, e.target.value)}
                  />
                </div>
                {/* [MOD #unitPrice] Per-bottle price under case price */}
                {item.unitsPerCase > 0 && (
                  <span className={styles.riUnitPrice}>
                    ${(item.casePrice / item.unitsPerCase).toFixed(2)}/ea
                  </span>
                )}
              </div>

              {/* Discount — editable */}
              <div className={styles.riColDisc}>
                <input
                  type="number"
                  className={`${styles.riDiscInput} ${discWarn ? styles.discWarn : ''}`}
                  value={item.discount || 0}
                  min="0"
                  max={maxPct}
                  step="0.5"
                  onChange={(e) => this._handleDiscountChange(item, e.target.value)}
                />
              </div>

              {/* Line total */}
              <span className={styles.riColTotal}>${item.lineTotal.toFixed(2)}</span>

              {/* Remove */}
              <button
                className={styles.riRemoveBtn}
                onClick={() => onRemoveItem && onRemoveItem(item.productId || idx)}
                title="Remove item"
              >
                <Trash2 size={14} />
              </button>

              {/* Deposit sub-line */}
              {item.depositPerCase > 0 && (
                <div className={styles.riDepositLine}>
                  ↳ Deposit: {item.quantity} × ${item.depositPerCase.toFixed(2)} = ${item.depositTotal.toFixed(2)}
                </div>
              )}
            </div>
          );
        })}

        {lineItems.length === 0 && (
          <div className={styles.emptyItems}>No items. Go back to add products.</div>
        )}
      </div>
    );
  }

  _renderReadOnlyItems() {
    const { lineItems } = this.props;

    return (
      <div className={styles.receiptItemsSection}>
        <div className={`${styles.receiptItemsHeader} ${styles.readOnlyGrid}`}>
          <span>Code</span>
          <span>Product</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Disc%</span>
          <span>Total</span>
        </div>

        {lineItems.map((item, idx) => (
          <React.Fragment key={item.productId || idx}>
            <div className={`${styles.receiptItemRow} ${styles.readOnlyGrid}`}>
              <span className={styles.riColCode}>{item.productCode}</span>
              <span className={styles.riColName}>{item.productName}</span>
              <span className={styles.riColQtyStatic}>{item.quantity}</span>
              <span className={styles.riColPriceStatic}>
                ${item.casePrice.toFixed(2)}
                {/* [MOD #unitPrice] Per-bottle price in read-only mode */}
                {item.unitsPerCase > 0 && (
                  <span className={styles.riUnitPrice}>
                    ${(item.casePrice / item.unitsPerCase).toFixed(2)}/ea
                  </span>
                )}
              </span>
              <span className={styles.riColDiscStatic}>{item.discount ? `${item.discount}%` : '—'}</span>
              <span className={styles.riColTotal}>${item.lineTotal.toFixed(2)}</span>
            </div>
            {item.depositPerCase > 0 && (
              <div className={styles.riDepositLine}>
                ↳ Deposit: {item.quantity} × ${item.depositPerCase.toFixed(2)} = ${item.depositTotal.toFixed(2)}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  _renderTotals() {
    const { totals, amountPaid, paymentStatus, hidePayment, returnMode } = this.props;
    if (!totals) return null;

    const fmt = (amt) => '$' + Number(amt).toLocaleString('en-US', { minimumFractionDigits: 2 });
    const paid = amountPaid || 0;
    const balance = totals.grandTotal - paid;
    const status = paymentStatus || (paid >= totals.grandTotal ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid');

    return (
      <div className={styles.receiptTotals}>
        <div className={styles.totalRow}><span>Subtotal</span><span>{fmt(totals.subtotal)}</span></div>
        <div className={styles.totalRow}><span>Deposits</span><span>{fmt(totals.depositTotal)}</span></div>
        {totals.discountTotal > 0 && (
          <div className={styles.totalRow}><span>Discount</span><span>-{fmt(totals.discountTotal)}</span></div>
        )}
        <div className={`${styles.totalRow} ${styles.grandTotal}`}>
          {/* WHY: returnMode shows CREDIT label with negative sign so it's clear this is a credit, not a charge */}
          <span>{returnMode ? 'CREDIT' : 'TOTAL'}</span>
          <span>{returnMode ? '-' : ''}{fmt(totals.grandTotal)}</span>
        </div>
        <div className={styles.totalRow}><span>Total Cases</span><span>{totals.totalCases}</span></div>

        {/* [MOD #002] Payment status section — hidden for returns (hidePayment) */}
        {!hidePayment && (
          <div className={styles.paymentSection}>
            <div className={styles.totalRow}>
              <span>Amount Paid</span>
              <span className={paid > 0 ? styles.paidAmount : ''}>{fmt(paid)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.balanceRow}`}>
              <span>Balance Due</span>
              <span className={balance > 0 ? styles.balanceDue : styles.balancePaid}>{fmt(balance)}</span>
            </div>
            <div className={styles.paymentStatusRow}>
              <span className={`${styles.paymentBadge} ${styles['paymentBadge' + status]}`}>
                {status}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  render() {
    const {
      editable,
      lineItems,
      totals,
      notes,
      // Prepaid warning
      prepaidWarning,
      // WHY: Two injection slots — beforeTotals for order discount, afterTotals
      // for delivery/notes editing (NewOrder). children alias for beforeTotals.
      children,
      afterTotals,
      // Optional status badge rendered next to the title
      statusBadge,
    } = this.props;

    return (
      <div className={styles.receipt}>
        {this._renderCustomerBlock()}

        {/* Prepaid warning */}
        {prepaidWarning && (
          <div className={styles.prepaidWarning}>
            {prepaidWarning}
          </div>
        )}

        <div className={styles.receiptDivider} />

        {/* Line Items */}
        {editable ? this._renderEditableItems() : this._renderReadOnlyItems()}

        <div className={styles.receiptDivider} />

        {/* Before-totals slot: order-level discount etc — injected by parent */}
        {children}

        {/* Totals */}
        {this._renderTotals()}

        {/* After-totals slot: delivery, editable notes, etc */}
        {afterTotals}

        {/* Notes (read-only display) */}
        {!editable && notes && (
          <>
            <div className={styles.receiptDivider} />
            <div className={styles.notesSection}>
              <h4>Notes</h4>
              <p>{notes}</p>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default OrderReceipt;
