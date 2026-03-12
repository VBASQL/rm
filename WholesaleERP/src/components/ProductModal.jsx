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
    const { quantity, casePrice } = this.state;

    const lineItem = {
      productId: product.id,
      productCode: product.code,
      productName: `${product.name} ${product.flavor} ${product.size} ${product.packSize}`,
      quantity,
      unitsPerCase: product.unitsPerCase,
      casePrice,
      depositPerCase: product.depositPerCase,
      discount: 0,
      lineTotal: casePrice * quantity,
      depositTotal: product.depositPerCase * quantity,
    };

    onAdd(lineItem);
  };

  render() {
    const { product, existingItem, onClose } = this.props;
    const { quantity, casePrice, isFavorite } = this.state;

    const units = quantity * product.unitsPerCase;
    const lineTotal = casePrice * quantity;
    const depositTotal = product.depositPerCase * quantity;

    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>

          <h2 className={styles.productName}>
            {product.name} — {product.flavor}
          </h2>
          <p className={styles.productDetail}>
            {product.size} · {product.packSize}
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

          {/* Add / Update button */}
          <button className={`btn btn-primary btn-full ${styles.addBtn}`} onClick={this.handleAdd}>
            {existingItem ? 'UPDATE ORDER' : 'ADD TO ORDER'}
          </button>
        </div>
      </div>
    );
  }
}

export default ProductModal;
