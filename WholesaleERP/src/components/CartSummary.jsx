// ============================================================
// FILE: CartSummary.jsx
// PURPOSE: Floating bar at the bottom of the order builder showing
//          running total: item count, case count, subtotal, and
//          "Review Order" CTA button. Expandable with inline qty +/-,
//          edit (opens modal), and remove per item.
// DEPENDS ON: CartContext
// DEPENDED ON BY: NewOrder page (Step 2)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.6: "Cart (persistent at bottom of Step 2)"
//   Shows item count, case count, subtotal. Tapping expands line items
//   with full inline editing controls.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-13] #002 Made expanded cart fully editable: inline qty +/-,
//     direct qty input, edit button (opens ProductModal), remove button.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { ShoppingCart, X, Trash2, Minus, Plus, Edit3 } from 'lucide-react';
import { useCart, CART_ACTIONS } from '../context/CartContext';
import styles from '../styles/CartSummary.module.css';

class CartSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expanded: false };
  }

  toggleExpand = () => {
    this.setState(prev => ({ expanded: !prev.expanded }));
  };

  // [MOD #002] Inline quantity adjustment — dispatches UPDATE_ITEM with recalculated totals
  handleQtyChange = (item, delta) => {
    const { dispatch } = this.props;
    const newQty = Math.max(1, item.quantity + delta);
    const rawLineTotal = item.casePrice * newQty;
    const discountAmount = rawLineTotal * ((item.discount || 0) / 100);
    dispatch({
      type: CART_ACTIONS.UPDATE_ITEM,
      payload: {
        ...item,
        quantity: newQty,
        lineTotal: rawLineTotal - discountAmount,
        depositTotal: item.depositPerCase * newQty,
      },
    });
  };

  // [MOD #002] Direct qty input
  handleQtyInput = (item, val) => {
    const { dispatch } = this.props;
    const newQty = parseInt(val, 10);
    if (isNaN(newQty) || newQty < 1) return;
    const rawLineTotal = item.casePrice * newQty;
    const discountAmount = rawLineTotal * ((item.discount || 0) / 100);
    dispatch({
      type: CART_ACTIONS.UPDATE_ITEM,
      payload: {
        ...item,
        quantity: newQty,
        lineTotal: rawLineTotal - discountAmount,
        depositTotal: item.depositPerCase * newQty,
      },
    });
  };

  render() {
    const { lineItems, totals, onReview, onRemoveItem, onEditItem } = this.props;
    const { expanded } = this.state;

    if (lineItems.length === 0) return null;

    return (
      <>
        {/* [MOD #cartBlock] Backdrop when expanded — prevents cart from silently
            blocking product list / category dropdown behind it. */}
        {expanded && (
          <div className={styles.backdrop} onClick={this.toggleExpand} />
        )}
        <div className={styles.container}>
        {/* Expanded view — editable line items */}
        {expanded && (
          <div className={styles.expanded}>
            <div className={styles.expandedHeader}>
              <h4>Cart ({lineItems.length} items)</h4>
              <button onClick={this.toggleExpand} className={styles.closeExpandBtn}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.itemList}>
              {lineItems.map(item => (
                <div key={item.productId} className={styles.cartItem}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.productName}</span>
                    <span className={styles.itemQty}>
                      ${item.casePrice.toFixed(2)}/cs
                      {item.unitPrice != null && <> · ${item.unitPrice.toFixed(2)}/ea</>}
                      {' '}· ${item.lineTotal.toFixed(2)}
                    </span>
                  </div>
                  {/* [MOD #002] Inline qty controls */}
                  <div className={styles.qtyControls}>
                    <button className={styles.qtyBtn} onClick={() => this.handleQtyChange(item, -1)}>
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      className={styles.qtyInput}
                      value={item.quantity}
                      min="1"
                      onChange={(e) => this.handleQtyInput(item, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button className={styles.qtyBtn} onClick={() => this.handleQtyChange(item, 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                  {/* [MOD #002] Edit (opens ProductModal) and remove buttons */}
                  <button className={styles.editBtn} onClick={() => onEditItem(item.productId)}>
                    <Edit3 size={14} />
                  </button>
                  <button className={styles.removeBtn} onClick={() => onRemoveItem(item.productId)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed summary bar */}
        <div className={styles.bar} onClick={this.toggleExpand}>
          <div className={styles.barInfo}>
            <ShoppingCart size={18} />
            <span>{lineItems.length} items · {totals.totalCases} cases</span>
          </div>
          <span className={styles.barTotal}>
            ${totals.grandTotal.toFixed(2)}
          </span>
        </div>

        <button className={`btn btn-primary btn-full ${styles.reviewBtn}`} onClick={onReview}>
          Review Order →
        </button>
      </div>
      </>
    );
  }
}

function CartSummaryWrapper(props) {
  const { cart, totals, dispatch } = useCart();
  return (
    <CartSummary
      {...props}
      lineItems={cart.lineItems}
      totals={totals}
      dispatch={dispatch}
    />
  );
}

export default CartSummaryWrapper;
