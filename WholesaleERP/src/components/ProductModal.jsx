// ============================================================
// FILE: ProductModal.jsx
// PURPOSE: Full-screen overlay for editing product quantity and price
//          before adding to the order cart.
// DEPENDS ON: CartContext, lucide-react
// DEPENDED ON BY: NewOrder page (Step 2)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.6 Product Modal: Large tappable +/- for quantity,
//   editable case price, auto-calculated units & line total, favorite toggle.
//   "ADD TO ORDER" or "UPDATE" if already in cart.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-13] #001 Added per-item discount % field with cap enforcement.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { X, Star, Minus, Plus } from 'lucide-react';
import styles from '../styles/ProductModal.module.css';

class ProductModal extends React.Component {
  constructor(props) {
    super(props);
    const { product, existingItem } = props;

    this.state = {
      quantity: existingItem ? existingItem.quantity : 1,
      casePrice: existingItem ? existingItem.casePrice : product.casePrice,
      isFavorite: props.isFavorite || false,
      // [MOD #001] Per-item discount % with cap enforcement
      discountPercent: existingItem ? (existingItem.discount || 0) : 0,
    };
  }

  handleQuantityChange = (delta) => {
    this.setState(prev => ({
      quantity: Math.max(1, prev.quantity + delta),
    }));
  };

  handleQuantityInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      this.setState({ quantity: val });
    }
  };

  handlePriceChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0) {
      this.setState({ casePrice: val });
    }
  };

  handleToggleFavorite = () => {
    this.setState(prev => ({ isFavorite: !prev.isFavorite }));
    if (this.props.onToggleFavorite) {
      this.props.onToggleFavorite(this.props.product.id);
    }
  };

  handleAdd = () => {
    const { product, onAdd } = this.props;
    const { quantity, casePrice, discountPercent } = this.state;

    // [MOD #001] Apply discount to line total
    const rawLineTotal = casePrice * quantity;
    const discountAmount = rawLineTotal * (discountPercent / 100);

    // [MOD #unitPrice] Compute per-unit price so every downstream display
    // (cart, receipt, invoice) can show it without recalculating.
    const unitPrice = product.unitsPerCase > 0
      ? casePrice / product.unitsPerCase
      : casePrice;

    const lineItem = {
      productId: product.id,
      productCode: product.code,
      productName: `${product.name} ${product.flavor} ${product.size} ${product.packSize}`,
      quantity,
      unitsPerCase: product.unitsPerCase,
      casePrice,
      unitPrice,
      depositPerCase: product.depositPerCase,
      discount: discountPercent,
      lineTotal: rawLineTotal - discountAmount,
      depositTotal: product.depositPerCase * quantity,
    };

    onAdd(lineItem);
  };

  render() {
    const { product, existingItem, onClose, discountCaps } = this.props;
    const { quantity, casePrice, isFavorite, discountPercent } = this.state;

    const units = quantity * product.unitsPerCase;
    const rawLineTotal = casePrice * quantity;
    const discountAmount = rawLineTotal * (discountPercent / 100);
    const lineTotal = rawLineTotal - discountAmount;
    const depositTotal = product.depositPerCase * quantity;
    // [MOD #unitPrice] Per-bottle price shown in modal
    const unitPriceDisplay = product.unitsPerCase > 0
      ? (casePrice / product.unitsPerCase) : casePrice;

    // [MOD #001] Determine cap and color coding
    const cap = discountCaps ? discountCaps.perItemPercent : 15;
    const discountColor = discountPercent === 0 ? '' :
      discountPercent <= cap * 0.5 ? styles.discountGreen :
      discountPercent <= cap ? styles.discountOrange :
      styles.discountRed;

    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.modalBody}>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>

            <h2 className={styles.productName}>
              {product.name} — {product.flavor}
            </h2>
            <p className={styles.productDetail}>
              {product.size} · {product.packSize}
            </p>
            <p className={styles.productDetail}>
              ${unitPriceDisplay.toFixed(2)}/ea
            </p>
            <p className={styles.productCode}>Code: {product.code}</p>

            {/* Quantity */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Quantity (cases)</label>
              <div className={styles.quantityRow}>
                <button className={styles.qtyBtn} onClick={() => this.handleQuantityChange(-1)}>
                  <Minus size={20} />
                </button>
                <input
                  type="number"
                  className={styles.qtyInput}
                  value={quantity}
                  onChange={this.handleQuantityInput}
                  min={1}
                />
                <button className={styles.qtyBtn} onClick={() => this.handleQuantityChange(1)}>
                  <Plus size={20} />
                </button>
              </div>
            </div>

            <p className={styles.unitsCalc}>
              Units: {units} ({quantity} × {product.unitsPerCase})
            </p>

            {/* Case Price — editable */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Case Price</label>
              <div className={styles.priceInput}>
                <span className={styles.dollarSign}>$</span>
                <input
                  type="number"
                  className={styles.priceField}
                  value={casePrice}
                  onChange={this.handlePriceChange}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            {/* [MOD #001] Per-item discount % field */}
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Discount %</label>
              <div className={`${styles.discountRow} ${discountColor}`}>
                <input
                  type="number"
                  className={styles.discountInput}
                  value={discountPercent}
                  onChange={(e) => {
                    const val = Math.min(Math.max(0, parseFloat(e.target.value) || 0), cap);
                    this.setState({ discountPercent: val });
                  }}
                  step="0.5"
                  min="0"
                  max={cap}
                />
                <span className={styles.discountCap}>max {cap}%</span>
              </div>
              {discountPercent > 0 && (
                <p className={styles.discountSaved}>
                  Saves ${discountAmount.toFixed(2)}
                </p>
              )}
            </div>

            <div className={styles.totalsRow}>
              <span>Deposit/case: ${product.depositPerCase.toFixed(2)}</span>
            </div>
            <div className={styles.totalsRow}>
              <span>Line total:</span>
              <span className={styles.lineTotal}>${(lineTotal + depositTotal).toFixed(2)}</span>
            </div>

            {/* Favorite toggle */}
            <button
              className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteActive : ''}`}
              onClick={this.handleToggleFavorite}
            >
              <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
          </div>

          <div className={styles.modalFooter}>
            <button className={`btn btn-primary btn-full ${styles.addBtn}`} onClick={this.handleAdd}>
              {existingItem ? 'UPDATE ORDER' : 'ADD TO ORDER'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ProductModal;
