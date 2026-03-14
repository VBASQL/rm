// ============================================================
// FILE: ReturnOrder.jsx
// PURPOSE: Create and manage return orders. Returns are credit orders
//          that reduce customer balance. Can be created from a delivered
//          order or from scratch.
// DEPENDS ON: CartContext, AppContext, ProductModal, PageHeader, SearchBar
// DEPENDED ON BY: App.jsx (routes: /returns/new, /returns/:id)
//
// WHY THIS EXISTS:
//   When products are returned (damaged, wrong item, customer overstocked),
//   the salesperson creates a return order that credits the customer account.
//   Returns can reference an original order or be created fresh.
//   BUILD_PLAN.md: Returns feature for credit order tracking.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] #returns Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, AlertTriangle, Package, Trash2,
  Check, Plus, Minus, Scissors, Grid3X3, Search, GitBranch, MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCart, CART_ACTIONS } from '../context/CartContext';
import PageHeader from '../components/PageHeader';
import ProductModal from '../components/ProductModal';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import styles from '../styles/ReturnOrder.module.css';
import { RETURN_REASONS, DAMAGE_TYPES } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/format';

// ── ReturnOrder class ──────────────────────────────────────
class ReturnOrder extends React.Component {
  constructor(props) {
    super(props);

    // WHY: Determine mode based on URL params
    // - /returns/new?fromOrder=123 → return from existing delivered order
    // - /returns/new → return from scratch (select customer + products)
    // - /returns/:id → view/edit existing return
    const fromOrderId = props.queryFromOrderId ? Number(props.queryFromOrderId) : null;
    const isViewMode = !!props.returnId;

    this.state = {
      step: fromOrderId ? 2 : 1, // Skip customer select if from order
      customers: [],
      customersById: {},
      customerSearch: '',
      categories: [],
      products: [],
      selectedCategory: null,
      productSearch: '',
      modalProduct: null,
      // Existing return (view mode)
      existingReturn: null,
      // Split line modal
      showSplitModal: false,
      splitItem: null,
      splitKeepQty: 0,
      splitDamagedQty: 0,
      splitDamageType: 'crushed',
      // Mark all damaged modal
      showMarkAllModal: false,
      markAllDamageType: 'crushed',
      // Confirm process modal
      showProcessConfirm: false,
    };
  }

  componentDidMount() {
    this._loadInitialData();
  }

  _loadInitialData() {
    const { storage, queryFromOrderId, returnId, cartDispatch } = this.props;
    const customers = storage.getCustomers().sort((a, b) => a.name.localeCompare(b.name));
    const customersById = Object.fromEntries(customers.map(c => [c.id, c]));
    const categories = storage.getCategories();

    this.setState({ customers, customersById, categories });

    // MODE: View existing return
    if (returnId) {
      const ret = storage.getReturn(Number(returnId));
      if (ret) {
        this.setState({ existingReturn: ret });
        // Load into cart for consistency
        const customer = storage.getCustomer(ret.customerId);
        cartDispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: {
            customerId: ret.customerId,
            customerName: customer ? customer.name : '',
            lineItems: ret.lineItems.map(li => ({ ...li })),
            notes: ret.notes || '',
            isReturn: true,
            returnFromOrderId: ret.originalOrderId,
            returnFromOrderNumber: ret.originalOrderId
              ? storage.getOrder(ret.originalOrderId)?.orderNumber
              : null,
            returnReason: ret.returnReason,
          },
        });
        cartDispatch({ type: CART_ACTIONS.SET_RETURN_MODE, payload: { isReturn: true, returnFromOrderId: ret.originalOrderId } });
      }
      return;
    }

    // MODE: Create return from existing delivered order
    if (queryFromOrderId) {
      const order = storage.getOrder(Number(queryFromOrderId));
      if (order && order.status === 'Delivered') {
        const customer = storage.getCustomer(order.customerId);
        // Load order items into cart as return
        cartDispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: {
            customerId: order.customerId,
            customerName: customer ? customer.name : '',
            lineItems: order.lineItems.map(li => ({
              ...li,
              isDamaged: false,
              damageType: null,
            })),
            notes: '',
            isReturn: true,
            returnFromOrderId: order.id,
            returnFromOrderNumber: order.orderNumber,
            returnReason: null,
          },
        });
        cartDispatch({
          type: CART_ACTIONS.SET_RETURN_MODE,
          payload: { isReturn: true, returnFromOrderId: order.id, returnFromOrderNumber: order.orderNumber },
        });
      }
    } else {
      // MODE: Create return from scratch — initialize cart for return mode
      cartDispatch({ type: CART_ACTIONS.CLEAR_CART });
      cartDispatch({
        type: CART_ACTIONS.SET_RETURN_MODE,
        payload: { isReturn: true, returnFromOrderId: null, returnFromOrderNumber: null },
      });
    }
  }

  // ─── Step 1: Customer Selection ───────────────────────────

  handleSelectCustomer = (customer) => {
    const { cartDispatch, storage } = this.props;
    cartDispatch({ type: CART_ACTIONS.SET_CUSTOMER, payload: { id: customer.id, name: customer.name } });

    // For branch customers
    if (customer.isBranch) {
      cartDispatch({
        type: CART_ACTIONS.SET_BRANCH,
        payload: { id: customer.id, name: customer.name, address: customer.address },
      });
    }

    this.setState({ step: 2 });
  };

  // ─── Step 2: Build Return Items ───────────────────────────

  handleCategorySelect = (catId) => {
    const { storage } = this.props;
    const products = storage.getProductsByCategory(catId);
    this.setState({ selectedCategory: catId, products });
  };

  handleProductSearch = (query) => {
    this.setState({ productSearch: query });
    if (query.trim()) {
      const { storage } = this.props;
      const all = storage.getProducts();
      const q = query.toLowerCase();
      const filtered = all.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.flavor.toLowerCase().includes(q) ||
        p.code.includes(q)
      );
      this.setState({ products: filtered, selectedCategory: null });
    }
  };

  handleOpenProduct = (product) => {
    this.setState({ modalProduct: product });
  };

  handleCloseModal = () => {
    this.setState({ modalProduct: null });
  };

  handleAddToCart = (lineItem) => {
    const { cartDispatch } = this.props;
    // WHY: Return items start with isDamaged=false; salesperson marks damage explicitly
    cartDispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { ...lineItem, isDamaged: false, damageType: null },
    });
    this.setState({ modalProduct: null });
  };

  handleRemoveItem = (productId) => {
    const { cartDispatch } = this.props;
    cartDispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
  };

  handleQtyChange = (productId, delta) => {
    const { cartState, cartDispatch } = this.props;
    const item = cartState.lineItems.find(li => li.productId === productId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    cartDispatch({
      type: CART_ACTIONS.UPDATE_ITEM,
      payload: {
        ...item,
        quantity: newQty,
        lineTotal: newQty * item.casePrice,
        depositTotal: newQty * item.depositPerCase,
      },
    });
  };

  // ─── Damage Handling ──────────────────────────────────────

  handleToggleDamage = (productId) => {
    const { cartDispatch } = this.props;
    cartDispatch({ type: CART_ACTIONS.TOGGLE_ITEM_DAMAGE, payload: productId });
  };

  handleSetDamageType = (productId, damageType) => {
    const { cartDispatch } = this.props;
    cartDispatch({ type: CART_ACTIONS.SET_ITEM_DAMAGE_TYPE, payload: { productId, damageType } });
  };

  // ─── Split Line ───────────────────────────────────────────

  handleOpenSplitModal = (item) => {
    this.setState({
      showSplitModal: true,
      splitItem: item,
      splitKeepQty: Math.floor(item.quantity / 2),
      splitDamagedQty: item.quantity - Math.floor(item.quantity / 2),
      splitDamageType: 'crushed',
    });
  };

  handleSplitConfirm = () => {
    const { cartDispatch } = this.props;
    const { splitItem, splitKeepQty, splitDamagedQty, splitDamageType } = this.state;

    if (splitKeepQty <= 0 || splitDamagedQty <= 0) {
      this.props.showToast('Both quantities must be greater than 0', 'error');
      return;
    }

    cartDispatch({
      type: CART_ACTIONS.SPLIT_LINE,
      payload: {
        productId: splitItem.productId,
        keepQty: splitKeepQty,
        splitQty: splitDamagedQty,
        splitIsDamaged: true,
        splitDamageType,
      },
    });

    this.setState({ showSplitModal: false, splitItem: null });
    this.props.showToast('Line split successfully');
  };

  // ─── Mark All Damaged ─────────────────────────────────────

  handleMarkAllDamaged = () => {
    const { cartDispatch } = this.props;
    const { markAllDamageType } = this.state;
    cartDispatch({ type: CART_ACTIONS.MARK_ALL_DAMAGED, payload: markAllDamageType });
    this.setState({ showMarkAllModal: false });
    this.props.showToast('All items marked as damaged');
  };

  // ─── Step 3: Review & Submit ──────────────────────────────

  handleSetReturnReason = (reason) => {
    const { cartDispatch } = this.props;
    cartDispatch({ type: CART_ACTIONS.SET_RETURN_REASON, payload: reason });
  };

  handleSetNotes = (e) => {
    const { cartDispatch } = this.props;
    cartDispatch({ type: CART_ACTIONS.SET_NOTES, payload: e.target.value });
  };

  handleSubmitReturn = () => {
    const { storage, cartState, cartTotals, cartDispatch, navigate, showToast } = this.props;

    if (!cartState.returnReason) {
      showToast('Please select a return reason', 'error');
      return;
    }

    if (cartState.lineItems.length === 0) {
      showToast('No items in return', 'error');
      return;
    }

    const ret = storage.createReturn({
      customerId: cartState.customerId,
      salespersonId: 1,
      originalOrderId: cartState.returnFromOrderId,
      returnReason: cartState.returnReason,
      lineItems: cartState.lineItems.map(li => ({ ...li })),
      subtotal: cartTotals.subtotal,
      depositTotal: cartTotals.depositTotal,
      discountTotal: cartTotals.discountTotal,
      grandTotal: cartTotals.grandTotal,
      totalCases: cartTotals.totalCases,
      notes: cartState.notes,
    });

    cartDispatch({ type: CART_ACTIONS.CLEAR_CART });
    showToast(`Return ${ret.returnNumber} created!`);
    navigate(`/returns/${ret.id}`);
  };

  // ─── Process Return (view mode) ───────────────────────────

  handleProcessReturn = () => {
    const { storage, showToast, returnId } = this.props;
    try {
      const ret = storage.processReturn(Number(returnId));
      this.setState({ existingReturn: ret, showProcessConfirm: false });
      showToast(`Return processed — $${ret.grandTotal.toFixed(2)} credited`);
    } catch (err) {
      showToast(err.message || 'Failed to process return', 'error');
    }
  };

  // ─── Navigation ───────────────────────────────────────────

  goToStep = (step) => {
    this.setState({ step });
  };

  // ─── Render Helpers ───────────────────────────────────────

  _renderStep1() {
    const { customers, customerSearch, customersById } = this.state;
    const q = customerSearch.toLowerCase();
    const filtered = q
      ? customers.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.address && c.address.toLowerCase().includes(q))
        )
      : customers;

    return (
      <div className={styles.stepContent}>
        <div className={styles.stepHeader}>
          <h2 className={styles.stepTitle}>Select Customer</h2>
          <p className={styles.stepSubtitle}>Who is returning products?</p>
        </div>

        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className="form-input"
            placeholder="Search customers..."
            value={customerSearch}
            onChange={(e) => this.setState({ customerSearch: e.target.value })}
          />
        </div>

        <div className={styles.customerList}>
          {filtered.map(c => (
            <div
              key={c.id}
              className={`${styles.customerOption} ${c.isBranch ? styles.branchOption : ''}`}
              onClick={() => this.handleSelectCustomer(c)}
              role="button"
              tabIndex={0}
            >
              <div className={styles.custOptionInfo}>
                <div className={styles.custOptionTop}>
                  <span className={styles.custName}>{c.name}</span>
                  {c.isBranch && (
                    <span className={styles.branchTag}>
                      <GitBranch size={11} /> Branch
                    </span>
                  )}
                </div>
                {c.isBranch && c.address && (
                  <div className={styles.branchAddressLine}>
                    <MapPin size={11} />
                    <span>{c.address}</span>
                  </div>
                )}
                <span className={styles.custMeta}>
                  {c.isBranch && customersById[c.parentId]
                    ? `Account: ${customersById[c.parentId].name}`
                    : `${c.paymentType} · ${c.type}`}
                </span>
              </div>
              <ChevronRight size={18} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  _renderStep2() {
    const { cartState, storage } = this.props;
    const { categories, products, selectedCategory, productSearch, modalProduct } = this.state;

    const existingItem = modalProduct
      ? cartState.lineItems.find(li => li.productId === modalProduct.id)
      : null;

    return (
      <div className={styles.stepContent}>
        <div className={styles.customerBar}>
          <div className={styles.customerBarInfo}>
            <span className={styles.customerBarLabel}>Return for</span>
            <span className={styles.customerBarName}>{cartState.customerName}</span>
            {cartState.returnFromOrderNumber && (
              <span className={styles.fromOrderBadge}>
                From: {cartState.returnFromOrderNumber}
              </span>
            )}
          </div>
          {!cartState.returnFromOrderId && (
            <button
              className={styles.customerBarChange}
              onClick={() => this.goToStep(1)}
            >
              Change
            </button>
          )}
        </div>

        {/* Items in return */}
        {cartState.lineItems.length > 0 && (
          <div className={styles.returnItems}>
            <div className={styles.itemsHeader}>
              <h3>Return Items ({cartState.lineItems.length})</h3>
              <button
                className={styles.markAllBtn}
                onClick={() => this.setState({ showMarkAllModal: true })}
              >
                <AlertTriangle size={14} /> Mark All Damaged
              </button>
            </div>

            {cartState.lineItems.map(item => (
              <div
                key={item.productId}
                className={`${styles.itemRow} ${item.isDamaged ? styles.itemDamaged : ''}`}
              >
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.productName}</span>
                  <span className={styles.itemCode}>{item.productCode}</span>
                  {item.isDamaged && item.damageType && (
                    <span className={styles.damageBadge}>
                      💔 {DAMAGE_TYPES.find(d => d.id === item.damageType)?.label || item.damageType}
                    </span>
                  )}
                </div>

                <div className={styles.itemActions}>
                  {/* Quantity controls */}
                  <div className={styles.qtyControls}>
                    <button onClick={() => this.handleQtyChange(item.productId, -1)}>
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => this.handleQtyChange(item.productId, 1)}>
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Line total */}
                  <span className={styles.itemTotal}>
                    {formatCurrency(item.lineTotal + item.depositTotal)}
                  </span>

                  {/* Damage toggle */}
                  <button
                    className={`${styles.damageBtn} ${item.isDamaged ? styles.damageBtnActive : ''}`}
                    onClick={() => this.handleToggleDamage(item.productId)}
                    title="Mark as damaged"
                  >
                    <AlertTriangle size={14} />
                  </button>

                  {/* Split line (only if qty > 1) */}
                  {item.quantity > 1 && !String(item.productId).includes('_damaged') && (
                    <button
                      className={styles.splitBtn}
                      onClick={() => this.handleOpenSplitModal(item)}
                      title="Split line"
                    >
                      <Scissors size={14} />
                    </button>
                  )}

                  {/* Remove */}
                  <button
                    className={styles.removeBtn}
                    onClick={() => this.handleRemoveItem(item.productId)}
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Damage type selector (when damaged) */}
                {item.isDamaged && (
                  <div className={styles.damageTypeRow}>
                    <label>Damage Type:</label>
                    <select
                      value={item.damageType || ''}
                      onChange={(e) => this.handleSetDamageType(item.productId, e.target.value)}
                    >
                      <option value="">Select type...</option>
                      {DAMAGE_TYPES.map(dt => (
                        <option key={dt.id} value={dt.id}>{dt.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add products (only for from-scratch returns) */}
        {!cartState.returnFromOrderId && (
          <div className={styles.catalogSection}>
            <h3>Add Products to Return</h3>

            <div className={styles.searchWrap}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                className="form-input"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => this.handleProductSearch(e.target.value)}
              />
            </div>

            <div className={styles.categoryTabs}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.categoryTab} ${selectedCategory === cat.id ? styles.categoryTabActive : ''}`}
                  onClick={() => this.handleCategorySelect(cat.id)}
                >
                  <span className={styles.catIcon}>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {products.length > 0 && (
              <div className={styles.productGrid}>
                {products.map(product => (
                  <div
                    key={product.id}
                    className={styles.productCard}
                    onClick={() => this.handleOpenProduct(product)}
                  >
                    <div className={styles.productName}>{product.name}</div>
                    <div className={styles.productMeta}>
                      {product.size} · {product.packSize}
                    </div>
                    <div className={styles.productPrice}>
                      {formatCurrency(product.casePrice)}/case
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Continue to review */}
        {cartState.lineItems.length > 0 && (
          <button
            className={styles.continueBtn}
            onClick={() => this.goToStep(3)}
          >
            Continue to Review
            <ChevronRight size={18} />
          </button>
        )}

        {/* Product modal */}
        {modalProduct && (
          <ProductModal
            product={modalProduct}
            existingItem={existingItem}
            onAdd={this.handleAddToCart}
            onClose={this.handleCloseModal}
          />
        )}
      </div>
    );
  }

  _renderStep3() {
    const { cartState, cartTotals, storage } = this.props;
    const customer = cartState.customerId ? storage.getCustomer(cartState.customerId) : null;

    const damagedCount = cartState.lineItems.filter(li => li.isDamaged).length;

    return (
      <div className={styles.stepContent}>
        <div className={styles.stepHeader}>
          <h2 className={styles.stepTitle}>Review Return</h2>
        </div>

        {/* Customer info */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>Customer</div>
          <div className={styles.reviewCardBody}>
            <strong>{customer?.name}</strong>
            {customer?.address && <span className={styles.addressLine}>{customer.address}</span>}
          </div>
        </div>

        {/* Return reason */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>Return Reason *</div>
          <div className={styles.reasonGrid}>
            {RETURN_REASONS.map(reason => (
              <button
                key={reason.id}
                className={`${styles.reasonBtn} ${cartState.returnReason === reason.id ? styles.reasonBtnActive : ''}`}
                onClick={() => this.handleSetReturnReason(reason.id)}
              >
                <span className={styles.reasonIcon}>{reason.icon}</span>
                <span>{reason.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Line items */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>
            Items ({cartTotals.totalCases} cases)
            {damagedCount > 0 && (
              <span className={styles.damagedCountBadge}>
                {damagedCount} damaged
              </span>
            )}
          </div>
          <div className={styles.lineItemsList}>
            {cartState.lineItems.map(item => (
              <div
                key={item.productId}
                className={`${styles.reviewLine} ${item.isDamaged ? styles.reviewLineDamaged : ''}`}
              >
                <div className={styles.lineMain}>
                  <span className={styles.lineQty}>{item.quantity}x</span>
                  <span className={styles.lineName}>{item.productName}</span>
                  <span className={styles.linePrice}>{formatCurrency(item.lineTotal + item.depositTotal)}</span>
                </div>
                {item.isDamaged && (
                  <div className={styles.lineDamageNote}>
                    💔 Damaged: {DAMAGE_TYPES.find(d => d.id === item.damageType)?.label || 'Unspecified'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className={styles.reviewCard}>
          <div className={styles.totalsGrid}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotals.subtotal)}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Deposit</span>
              <span>{formatCurrency(cartTotals.depositTotal)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.totalRowGrand}`}>
              <span>Credit Amount</span>
              <span className={styles.creditAmount}>{formatCurrency(cartTotals.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className={styles.reviewCard}>
          <div className={styles.reviewCardHeader}>Notes</div>
          <textarea
            className="form-input"
            placeholder="Add any notes about this return..."
            value={cartState.notes || ''}
            onChange={this.handleSetNotes}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className={styles.actionButtons}>
          <button
            className="btn btn-secondary"
            onClick={() => this.goToStep(2)}
          >
            <ChevronLeft size={16} /> Back
          </button>
          <button
            className="btn btn-primary"
            onClick={this.handleSubmitReturn}
          >
            <Check size={16} /> Submit Return
          </button>
        </div>
      </div>
    );
  }

  _renderViewMode() {
    const { navigate, storage } = this.props;
    const { existingReturn } = this.state;

    if (!existingReturn) {
      return (
        <div className="page">
          <PageHeader title="Return" showBack onBack={() => navigate(-1)} />
          <p style={{ padding: 16, textAlign: 'center' }}>Return not found</p>
        </div>
      );
    }

    const customer = storage.getCustomer(existingReturn.customerId);
    const originalOrder = existingReturn.originalOrderId
      ? storage.getOrder(existingReturn.originalOrderId)
      : null;
    const damagedCount = existingReturn.lineItems.filter(li => li.isDamaged).length;
    const reason = RETURN_REASONS.find(r => r.id === existingReturn.returnReason);

    return (
      <div className="page">
        <PageHeader
          title={existingReturn.returnNumber}
          showBack
          onBack={() => navigate(-1)}
        />

        <div className={styles.content}>
          {/* Status banner */}
          <div className={`${styles.statusBanner} ${styles[`status${existingReturn.status}`]}`}>
            <StatusBadge status={existingReturn.status} />
            {existingReturn.status === 'Processed' && existingReturn.creditApplied && (
              <span className={styles.creditAppliedBadge}>✓ Credit Applied</span>
            )}
          </div>

          {/* Customer + Original Order */}
          <div className={styles.detailCard}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Customer</span>
              <span
                className={styles.detailValue}
                onClick={() => navigate(`/customers/${customer?.id}`)}
                style={{ cursor: 'pointer', color: 'var(--primary-color)' }}
              >
                {customer?.name || 'Unknown'}
              </span>
            </div>
            {originalOrder && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Original Order</span>
                <span
                  className={styles.detailValue}
                  onClick={() => navigate(`/orders/${originalOrder.id}`)}
                  style={{ cursor: 'pointer', color: 'var(--primary-color)' }}
                >
                  {originalOrder.orderNumber}
                </span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Reason</span>
              <span className={styles.detailValue}>
                {reason?.icon} {reason?.label || existingReturn.returnReason}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Created</span>
              <span className={styles.detailValue}>
                {formatDate(existingReturn.createdDate)}
              </span>
            </div>
            {existingReturn.processedDate && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Processed</span>
                <span className={styles.detailValue}>
                  {formatDate(existingReturn.processedDate)}
                </span>
              </div>
            )}
          </div>

          {/* Line items */}
          <div className={styles.detailCard}>
            <h3 className={styles.cardTitle}>
              Items ({existingReturn.totalCases} cases)
              {damagedCount > 0 && (
                <span className={styles.damagedCountBadge}>{damagedCount} damaged</span>
              )}
            </h3>
            <div className={styles.lineItemsList}>
              {existingReturn.lineItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`${styles.reviewLine} ${item.isDamaged ? styles.reviewLineDamaged : ''}`}
                >
                  <div className={styles.lineMain}>
                    <span className={styles.lineQty}>{item.quantity}x</span>
                    <span className={styles.lineName}>{item.productName}</span>
                    <span className={styles.linePrice}>
                      {formatCurrency(item.lineTotal + item.depositTotal)}
                    </span>
                  </div>
                  {item.isDamaged && (
                    <div className={styles.lineDamageNote}>
                      💔 {DAMAGE_TYPES.find(d => d.id === item.damageType)?.label || 'Damaged'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className={styles.detailCard}>
            <div className={styles.totalsGrid}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>{formatCurrency(existingReturn.subtotal)}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Deposit</span>
                <span>{formatCurrency(existingReturn.depositTotal)}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.totalRowGrand}`}>
                <span>Credit Amount</span>
                <span className={styles.creditAmount}>
                  {formatCurrency(existingReturn.grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {existingReturn.notes && (
            <div className={styles.detailCard}>
              <h3 className={styles.cardTitle}>Notes</h3>
              <p className={styles.notesText}>{existingReturn.notes}</p>
            </div>
          )}

          {/* Process button */}
          {existingReturn.status === 'Pending' && (
            <button
              className={styles.processBtn}
              onClick={() => this.setState({ showProcessConfirm: true })}
            >
              <Check size={18} />
              Process Return & Apply Credit
            </button>
          )}
        </div>

        {/* Process confirm dialog */}
        {this.state.showProcessConfirm && (
          <ConfirmDialog
            title="Process Return?"
            message={`This will credit ${formatCurrency(existingReturn.grandTotal)} to ${customer?.name}'s account. This cannot be undone.`}
            confirmLabel="Process Return"
            onConfirm={this.handleProcessReturn}
            onCancel={() => this.setState({ showProcessConfirm: false })}
          />
        )}
      </div>
    );
  }

  render() {
    const { navigate, returnId, cartState } = this.props;
    const { step, showSplitModal, splitItem, showMarkAllModal } = this.state;

    // View mode for existing return
    if (returnId) {
      return this._renderViewMode();
    }

    // Create mode
    const stepTitles = ['', 'Customer', 'Items', 'Review'];

    return (
      <div className="page">
        <PageHeader
          title={cartState.returnFromOrderNumber
            ? `Return from ${cartState.returnFromOrderNumber}`
            : 'New Return'
          }
          showBack
          onBack={() => {
            if (step > 1 && !cartState.returnFromOrderId) {
              this.goToStep(step - 1);
            } else {
              navigate(-1);
            }
          }}
        />

        {/* Step indicator */}
        <div className={styles.stepIndicator}>
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`${styles.stepDot} ${step >= s ? styles.stepDotActive : ''}`}
            >
              {s}
            </div>
          ))}
        </div>

        {step === 1 && this._renderStep1()}
        {step === 2 && this._renderStep2()}
        {step === 3 && this._renderStep3()}

        {/* Split line modal */}
        {showSplitModal && splitItem && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Split Line</h3>
              <p className={styles.modalSubtitle}>
                Split {splitItem.productName} into undamaged and damaged portions
              </p>

              <div className={styles.splitInputs}>
                <div className={styles.splitInput}>
                  <label>Undamaged Qty</label>
                  <input
                    type="number"
                    min={1}
                    max={splitItem.quantity - 1}
                    value={this.state.splitKeepQty}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(splitItem.quantity - 1, Number(e.target.value)));
                      this.setState({
                        splitKeepQty: val,
                        splitDamagedQty: splitItem.quantity - val,
                      });
                    }}
                  />
                </div>
                <div className={styles.splitInput}>
                  <label>Damaged Qty</label>
                  <input
                    type="number"
                    min={1}
                    max={splitItem.quantity - 1}
                    value={this.state.splitDamagedQty}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(splitItem.quantity - 1, Number(e.target.value)));
                      this.setState({
                        splitDamagedQty: val,
                        splitKeepQty: splitItem.quantity - val,
                      });
                    }}
                  />
                </div>
              </div>

              <div className={styles.splitDamageType}>
                <label>Damage Type</label>
                <select
                  value={this.state.splitDamageType}
                  onChange={(e) => this.setState({ splitDamageType: e.target.value })}
                >
                  {DAMAGE_TYPES.map(dt => (
                    <option key={dt.id} value={dt.id}>{dt.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                  className="btn btn-secondary"
                  onClick={() => this.setState({ showSplitModal: false, splitItem: null })}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={this.handleSplitConfirm}>
                  <Scissors size={14} /> Split Line
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark all damaged modal */}
        {showMarkAllModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Mark All Items Damaged</h3>
              <p className={styles.modalSubtitle}>
                Select the damage type for all items
              </p>

              <div className={styles.markAllDamageType}>
                <label>Damage Type</label>
                <select
                  value={this.state.markAllDamageType}
                  onChange={(e) => this.setState({ markAllDamageType: e.target.value })}
                >
                  {DAMAGE_TYPES.map(dt => (
                    <option key={dt.id} value={dt.id}>{dt.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                  className="btn btn-secondary"
                  onClick={() => this.setState({ showMarkAllModal: false })}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={this.handleMarkAllDamaged}>
                  <AlertTriangle size={14} /> Mark All Damaged
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

// ── Wrapper to inject hooks ─────────────────────────────────
function ReturnOrderWrapper(props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { storage } = useApp();
  const { cart: cartState, totals: cartTotals, dispatch: cartDispatch } = useCart();

  return (
    <ReturnOrder
      {...props}
      navigate={navigate}
      returnId={id}
      queryFromOrderId={searchParams.get('fromOrder')}
      storage={storage}
      cartState={cartState}
      cartTotals={cartTotals}
      cartDispatch={cartDispatch}
    />
  );
}

export default ReturnOrderWrapper;
