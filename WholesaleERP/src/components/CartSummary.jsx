// ============================================================
// FILE: CartSummary.jsx
// PURPOSE: Floating bar at the bottom of the order builder showing
//          running total: item count, case count, subtotal, and
//          "Review Order" CTA button.
// DEPENDS ON: CartContext
// DEPENDED ON BY: NewOrder page (Step 2)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.6: "Cart (persistent at bottom of Step 2)"
//   Shows item count, case count, subtotal. Tapping expands line items.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from '../styles/CartSummary.module.css';

class CartSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { expanded: false };
  }

  toggleExpand = () => {
    this.setState(prev => ({ expanded: !prev.expanded }));
  };

  render() {
    const { lineItems, totals, onReview, onRemoveItem, onEditItem } = this.props;
    const { expanded } = this.state;

    if (lineItems.length === 0) return null;

    return (
      <div className={styles.container}>
        {/* Expanded view — show line items */}
        {expanded && (
          <div className={styles.expanded}>
            <div className={styles.expandedHeader}>
              <h4>Cart Items</h4>
              <button onClick={this.toggleExpand} className={styles.closeExpandBtn}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.itemList}>
              {lineItems.map(item => (
                <div key={item.productId} className={styles.cartItem}>
                  <div className={styles.itemInfo} onClick={() => onEditItem(item.productId)}>
                    <span className={styles.itemName}>{item.productName}</span>
                    <span className={styles.itemQty}>
                      {item.quantity} cs · ${item.lineTotal.toFixed(2)}
                    </span>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => onRemoveItem(item.productId)}
                  >
                    <Trash2 size={16} />
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
    />
  );
}

export default CartSummaryWrapper;
