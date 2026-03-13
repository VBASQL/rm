// ============================================================
// FILE: NewOrder.jsx
// PURPOSE: 4-step order wizard: Select Customer → Build Order →
//          Review/Invoice Preview → Confirmation.
// DEPENDS ON: CartContext, AppContext, ProductModal, CartSummary,
//             SearchBar, PageHeader
// DEPENDED ON BY: App.jsx (route: /orders/new)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.6: Full order creation flow with catalog/favorites
//   toggle, product modal, inline price editing, delivery date, and
//   "Deliver Now" toggle. Prepaid customers prompted for payment.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-13] #001 Added "Most Ordered" tab, editable review items,
//     "Add More Items" button, order-wide discount, prepaid enforcement.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Star, Grid3X3, ChevronRight, Calendar, Truck, Check, TrendingUp, Plus,
  Minus, Trash2, AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCart, CART_ACTIONS } from '../context/CartContext';
import PageHeader from '../components/PageHeader';
import ProductModal from '../components/ProductModal';
import CartSummary from '../components/CartSummary';
import styles from '../styles/NewOrder.module.css';

class NewOrder extends React.Component {
  constructor(props) {
    super(props);

    // WHY: If customerId is in query params (from Customer Profile → New Order),
    // skip step 1 and go directly to catalog.
    const preselectedId = props.queryCustomerId
      ? Number(props.queryCustomerId)
      : null;

    this.state = {
      step: preselectedId ? 2 : 1,
      customers: [],
      customerSearch: '',
      categories: [],
      products: [],
      selectedCategory: null,
      catalogMode: 'catalog', // 'catalog' | 'favorites' | 'mostOrdered'
      modalProduct: null,
      favorites: [],
      productSearch: '',
      // [MOD #001] Most ordered products cache
      mostOrdered: [],
    };
  }

  componentDidMount() {
    this._loadInitialData();
  }

  _loadInitialData() {
    const { storage, queryCustomerId, cartDispatch } = this.props;
    const customers = storage.getCustomers().sort((a, b) => a.name.localeCompare(b.name));
    const categories = storage.getCategories();

    this.setState({ customers, categories });

    // WHY: Pre-select customer if navigated from profile or customer list
    if (queryCustomerId) {
      const customer = storage.getCustomer(Number(queryCustomerId));
      if (customer) {
        cartDispatch({ type: CART_ACTIONS.SET_CUSTOMER, payload: { id: customer.id, name: customer.name } });
        const favorites = storage.getFavorites(customer.id);
        this.setState({ favorites: favorites.map(f => f.id) });
      }
    }

    // [MOD #001] Load most ordered products
    const mostOrdered = storage.getMostOrderedProducts(20);
    this.setState({ mostOrdered });
  }

  // ───── Step 1: Customer Selection ─────

  handleSelectCustomer = (customer) => {
    const { cartDispatch, storage } = this.props;
    cartDispatch({ type: CART_ACTIONS.SET_CUSTOMER, payload: { id: customer.id, name: customer.name } });
    const favorites = storage.getFavorites(customer.id);
    this.setState({
      step: 2,
      favorites: favorites.map(f => f.id),
    });
  };

  // ───── Step 2: Build Order (Catalog) ─────

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
    cartDispatch({ type: CART_ACTIONS.ADD_ITEM, payload: lineItem });
    this.setState({ modalProduct: null });
  };

  handleRemoveFromCart = (productId) => {
    const { cartDispatch } = this.props;
    cartDispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
  };

  handleEditCartItem = (productId) => {
    const { storage } = this.props;
    const allProducts = storage.getProducts();
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      this.setState({ modalProduct: product });
    }
  };

  handleToggleFavorite = (productId) => {
    const { storage, cartState } = this.props;
    const { favorites } = this.state;
    let newFavs;
    if (favorites.includes(productId)) {
      newFavs = favorites.filter(id => id !== productId);
    } else {
      newFavs = [...favorites, productId];
    }
    this.setState({ favorites: newFavs });
    storage.setFavorites(cartState.customerId, newFavs);
  };

  // ───── Step 3: Review (fully editable) ─────

  handleSetDeliveryDate = (e) => {
    this.props.cartDispatch({ type: CART_ACTIONS.SET_DELIVERY_DATE, payload: e.target.value });
  };

  handleToggleDeliverNow = () => {
    const { cartState, cartDispatch } = this.props;
    cartDispatch({ type: CART_ACTIONS.SET_DELIVER_NOW, payload: !cartState.deliverNow });
  };

  // [MOD #002] Inline quantity change on review page
  handleReviewQtyChange = (item, delta) => {
    const { cartDispatch } = this.props;
    const newQty = Math.max(1, item.quantity + delta);
    this._updateReviewItem(item, { quantity: newQty });
  };

  handleReviewQtyInput = (item, val) => {
    const newQty = parseInt(val, 10);
    if (isNaN(newQty) || newQty < 1) return;
    this._updateReviewItem(item, { quantity: newQty });
  };

  // [MOD #002] Inline price edit on review page — enforces discount cap
  handleReviewPriceChange = (item, val) => {
    const price = parseFloat(val);
    if (isNaN(price) || price < 0) return;
    const { storage, showToast } = this.props;
    const caps = storage.getDiscountSettings();
    const maxPct = caps ? caps.perItemPercent : 15;

    // Calculate implied discount %
    const originalPrice = item.originalCasePrice || item.casePrice;
    const impliedDiscount = originalPrice > 0 ? ((originalPrice - price) / originalPrice) * 100 : 0;

    if (impliedDiscount >= maxPct) {
      showToast(`Price implies ${impliedDiscount.toFixed(1)}% discount — exceeds ${maxPct}% cap`);
      return;
    }
    if (impliedDiscount > maxPct * 0.7) {
      showToast(`Warning: ${impliedDiscount.toFixed(1)}% discount — approaching ${maxPct}% cap`);
    }

    this._updateReviewItem(item, { casePrice: price });
  };

  // [MOD #002] Inline discount % edit on review page
  handleReviewDiscountChange = (item, val) => {
    const disc = parseFloat(val) || 0;
    const { storage, showToast } = this.props;
    const caps = storage.getDiscountSettings();
    const maxPct = caps ? caps.perItemPercent : 15;

    if (disc >= maxPct) {
      showToast(`${disc}% discount exceeds ${maxPct}% cap — blocked`);
      return;
    }
    if (disc > maxPct * 0.7) {
      showToast(`Warning: ${disc}% discount — approaching ${maxPct}% cap`);
    }

    this._updateReviewItem(item, { discount: disc });
  };

  // [MOD #002] Remove line from review
  handleReviewRemoveItem = (productId) => {
    const { cartDispatch } = this.props;
    cartDispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
  };

  // [MOD #002] Shared helper to recalculate line total and dispatch update
  _updateReviewItem(item, changes) {
    const { cartDispatch } = this.props;
    const merged = { ...item, ...changes };
    // Preserve original price for discount cap calculation
    if (!merged.originalCasePrice) {
      merged.originalCasePrice = item.originalCasePrice || item.casePrice;
    }
    const rawLineTotal = merged.casePrice * merged.quantity;
    const discountAmount = rawLineTotal * ((merged.discount || 0) / 100);
    merged.lineTotal = rawLineTotal - discountAmount;
    merged.depositTotal = merged.depositPerCase * merged.quantity;
    cartDispatch({ type: CART_ACTIONS.UPDATE_ITEM, payload: merged });
  }

  handleSetNotes = (e) => {
    this.props.cartDispatch({ type: CART_ACTIONS.SET_NOTES, payload: e.target.value });
  };

  handleSubmitOrder = () => {
    const { storage, cartState, cartTotals, cartDispatch, navigate, showToast } = this.props;

    // [MOD #001] Prepaid enforcement: block submit if prepaid customer has balance
    const customer = storage.getCustomer(cartState.customerId);
    if (customer && customer.paymentType === 'prepaid' && customer.balance > 0) {
      showToast('Prepaid customer has outstanding balance — collect payment first');
      return;
    }

    const order = storage.createOrder({
      customerId: cartState.customerId,
      lineItems: cartState.lineItems,
      subtotal: cartTotals.subtotal,
      depositTotal: cartTotals.depositTotal,
      discountTotal: cartTotals.discountTotal,
      grandTotal: cartTotals.grandTotal,
      totalCases: cartTotals.totalCases,
      deliveryDate: cartState.deliverNow
        ? new Date().toISOString().split('T')[0]
        : cartState.deliveryDate,
      notes: cartState.notes,
      deliverNow: cartState.deliverNow,
    });

    cartDispatch({ type: CART_ACTIONS.CLEAR_CART });
    showToast(`Order ${order.orderNumber} submitted!`);

    this.setState({ step: 4, submittedOrder: order });
  };

  // ───── Navigation ─────

  goToStep = (step) => {
    this.setState({ step });
  };

  // ───── Rendering ─────

  _renderStep1() {
    const { customers, customerSearch } = this.state;
    const q = customerSearch.toLowerCase();
    const filtered = q
      ? customers.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
      : customers;

    return (
      <div className={styles.stepContent}>
        <div className={styles.searchWrap}>
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
              className={styles.customerOption}
              onClick={() => this.handleSelectCustomer(c)}
              role="button"
              tabIndex={0}
            >
              <div>
                <span className={styles.custName}>{c.name}</span>
                <span className={styles.custMeta}>{c.paymentType} · {c.type}</span>
              </div>
              <ChevronRight size={18} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  _renderStep2() {
    const { cartState } = this.props;
    const { categories, products, selectedCategory, catalogMode, favorites, productSearch, modalProduct, mostOrdered } = this.state;

    // Get display products based on mode
    const { storage } = this.props;
    let displayProducts = products;
    if (catalogMode === 'favorites') {
      displayProducts = storage.getProducts().filter(p => favorites.includes(p.id));
    } else if (catalogMode === 'mostOrdered') {
      // [MOD #001] Most Ordered tab — products already sorted by frequency
      displayProducts = mostOrdered;
    }

    // Find existing item in cart for modal
    const existingItem = modalProduct
      ? cartState.lineItems.find(li => li.productId === modalProduct.id)
      : null;

    return (
      <div className={styles.stepContent}>
        {/* Customer bar */}
        <div className={styles.customerBar}>
          <span>{cartState.customerName}</span>
        </div>

        {/* [MOD #001] Catalog / Favorites / Most Ordered toggle */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${catalogMode === 'catalog' ? styles.modeBtnActive : ''}`}
            onClick={() => this.setState({ catalogMode: 'catalog' })}
          >
            <Grid3X3 size={16} /> Catalog
          </button>
          <button
            className={`${styles.modeBtn} ${catalogMode === 'favorites' ? styles.modeBtnActive : ''}`}
            onClick={() => this.setState({ catalogMode: 'favorites' })}
          >
            <Star size={16} /> Favorites
          </button>
          <button
            className={`${styles.modeBtn} ${catalogMode === 'mostOrdered' ? styles.modeBtnActive : ''}`}
            onClick={() => this.setState({ catalogMode: 'mostOrdered' })}
          >
            <TrendingUp size={16} /> Top
          </button>
        </div>

        {catalogMode === 'catalog' && (
          <>
            {/* Search */}
            <div className={styles.searchWrap}>
              <input
                type="text"
                className="form-input"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => this.handleProductSearch(e.target.value)}
              />
            </div>

            {/* Category cards — horizontal scroll */}
            <div className={styles.categoryRow}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`${styles.categoryCard} ${selectedCategory === cat.id ? styles.categoryActive : ''}`}
                  onClick={() => this.handleCategorySelect(cat.id)}
                >
                  <span className={styles.catIcon}>{cat.icon}</span>
                  <span className={styles.catName}>{cat.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Product list */}
        <div className={styles.productList}>
          {displayProducts.length === 0 ? (
            <p className={styles.emptyProducts}>
              {catalogMode === 'favorites'
                ? 'No favorites saved yet. Browse the catalog and star products.'
                : catalogMode === 'mostOrdered'
                  ? 'No order history yet.'
                  : 'Select a category or search for products'}
            </p>
          ) : (
            displayProducts.map(product => (
              <div
                key={product.id}
                className={styles.productRow}
                onClick={() => this.handleOpenProduct(product)}
                role="button"
                tabIndex={0}
              >
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{product.name} — {product.flavor}</span>
                  <span className={styles.productMeta}>
                    {product.size} · {product.packSize} · ${product.casePrice.toFixed(2)}/cs
                  </span>
                </div>
                {product.stock <= 0 && (
                  <span className={styles.stockWarning}>Low Stock</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Product Modal */}
        {modalProduct && (
          <ProductModal
            product={modalProduct}
            existingItem={existingItem}
            isFavorite={favorites.includes(modalProduct.id)}
            onAdd={this.handleAddToCart}
            onClose={this.handleCloseModal}
            onToggleFavorite={this.handleToggleFavorite}
            discountCaps={storage.getDiscountSettings()}
          />
        )}

        {/* Cart Summary */}
        <CartSummary
          onReview={() => this.goToStep(3)}
          onRemoveItem={this.handleRemoveFromCart}
          onEditItem={this.handleEditCartItem}
        />
      </div>
    );
  }

  _renderStep3() {
    const { cartState, cartTotals, cartDispatch, storage, showToast } = this.props;
    const caps = storage.getDiscountSettings();
    const maxItemDisc = caps ? caps.perItemPercent : 15;

    // WHY: Default delivery date = next working day (Mon-Fri)
    const getNextWorkday = () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      while (d.getDay() === 0 || d.getDay() === 6) {
        d.setDate(d.getDate() + 1);
      }
      return d.toISOString().split('T')[0];
    };

    const deliveryDate = cartState.deliveryDate || getNextWorkday();

    // [MOD #001] Prepaid warning
    const customer = storage.getCustomer(cartState.customerId);
    const isPrepaidWithBalance = customer && customer.paymentType === 'prepaid' && customer.balance > 0;

    return (
      <div className={styles.stepContent}>
        <h3 className={styles.reviewTitle}>Order Review</h3>
        <p className={styles.reviewCustomer}>{cartState.customerName}</p>

        {/* [MOD #001] Prepaid warning */}
        {isPrepaidWithBalance && (
          <div className={styles.prepaidWarning}>
            ⚠️ Prepaid customer has ${customer.balance.toFixed(2)} outstanding — collect payment before submitting
          </div>
        )}

        {/* [MOD #002] Fully editable line items — qty, price, discount %, remove */}
        <div className={styles.reviewItems}>
          {cartState.lineItems.map(item => {
            const discWarn = (item.discount || 0) > maxItemDisc * 0.7;
            const originalPrice = item.originalCasePrice || item.casePrice;
            const priceChanged = item.casePrice !== originalPrice;

            return (
              <div key={item.productId} className={styles.reviewItem}>
                <div className={styles.reviewItemHeader}>
                  <div className={styles.reviewItemInfo}>
                    <span className={styles.reviewItemCode}>{item.productCode}</span>
                    <span className={styles.reviewItemName}>{item.productName}</span>
                  </div>
                  <button
                    className={styles.reviewRemoveBtn}
                    onClick={() => this.handleReviewRemoveItem(item.productId)}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.reviewItemFields}>
                  {/* Qty controls */}
                  <div className={styles.reviewField}>
                    <label className={styles.reviewFieldLabel}>Qty (cs)</label>
                    <div className={styles.reviewQtyRow}>
                      <button className={styles.reviewQtyBtn} onClick={() => this.handleReviewQtyChange(item, -1)}>
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        className={styles.reviewQtyInput}
                        value={item.quantity}
                        min="1"
                        onChange={(e) => this.handleReviewQtyInput(item, e.target.value)}
                      />
                      <button className={styles.reviewQtyBtn} onClick={() => this.handleReviewQtyChange(item, 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Case price — editable */}
                  <div className={styles.reviewField}>
                    <label className={styles.reviewFieldLabel}>
                      Cs Price {priceChanged && <span className={styles.priceOverride}>edited</span>}
                    </label>
                    <div className={styles.reviewPriceWrap}>
                      <span className={styles.dollarSign}>$</span>
                      <input
                        type="number"
                        className={styles.reviewPriceInput}
                        value={item.casePrice}
                        min="0"
                        step="0.01"
                        onChange={(e) => this.handleReviewPriceChange(item, e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Discount % — with cap warning */}
                  <div className={styles.reviewField}>
                    <label className={styles.reviewFieldLabel}>
                      Disc% {discWarn && <AlertTriangle size={12} className={styles.discWarnIcon} />}
                    </label>
                    <input
                      type="number"
                      className={`${styles.reviewDiscInput} ${discWarn ? styles.reviewDiscWarn : ''}`}
                      value={item.discount || 0}
                      min="0"
                      max={maxItemDisc}
                      step="0.5"
                      onChange={(e) => this.handleReviewDiscountChange(item, e.target.value)}
                    />
                  </div>

                  {/* Line total (read-only) */}
                  <div className={styles.reviewField}>
                    <label className={styles.reviewFieldLabel}>Total</label>
                    <span className={styles.reviewLineTotal}>${item.lineTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Deposit line */}
                <div className={styles.reviewDepositLine}>
                  ↳ Deposit: {item.quantity} × ${item.depositPerCase.toFixed(2)} = ${item.depositTotal.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {cartState.lineItems.length === 0 && (
          <div className={styles.emptyProducts}>No items in cart. Go back to add products.</div>
        )}

        {/* [MOD #001] Order-wide discount field */}
        <div className={styles.orderDiscountSection}>
          <label className={styles.orderDiscountLabel}>Order Discount %</label>
          <input
            type="number"
            className={styles.orderDiscountInput}
            min="0"
            max={(() => {
              const caps = storage.getDiscountSettings();
              return caps ? caps.perOrderPercent : 10;
            })()}
            step="0.5"
            value={typeof cartState.orderDiscount === 'object' ? cartState.orderDiscount.value : (cartState.orderDiscount || 0)}
            onChange={(e) => {
              const caps = storage.getDiscountSettings();
              const max = caps ? caps.perOrderPercent : 10;
              const val = Math.min(Math.max(0, parseFloat(e.target.value) || 0), max);
              cartDispatch({ type: CART_ACTIONS.APPLY_ORDER_DISCOUNT, payload: { type: 'percent', value: val } });
            }}
          />
          <span className={styles.orderDiscountCap}>
            max {(() => { const caps = storage.getDiscountSettings(); return caps ? caps.perOrderPercent : 10; })()}%
          </span>
        </div>

        {/* Totals */}
        <div className={styles.totalSection}>
          <div className={styles.totalRow}>
            <span>Subtotal</span><span>${cartTotals.subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Deposits</span><span>${cartTotals.depositTotal.toFixed(2)}</span>
          </div>
          {cartTotals.discountTotal > 0 && (
            <div className={styles.totalRow}>
              <span>Discount</span><span>-${cartTotals.discountTotal.toFixed(2)}</span>
            </div>
          )}
          <div className={`${styles.totalRow} ${styles.grandTotal}`}>
            <span>TOTAL</span><span>${cartTotals.grandTotal.toFixed(2)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Total Cases</span><span>{cartTotals.totalCases}</span>
          </div>
        </div>

        {/* Delivery date */}
        <div className={styles.deliverySection}>
          <div className={styles.deliverNowRow}>
            <label className={styles.deliverNowLabel}>
              <input
                type="checkbox"
                checked={cartState.deliverNow}
                onChange={this.handleToggleDeliverNow}
              />
              <Truck size={16} />
              Deliver Now (immediate delivery)
            </label>
          </div>

          {!cartState.deliverNow && (
            <div className="form-group">
              <label className="form-label">
                <Calendar size={14} /> Delivery Date
              </label>
              <input
                type="date"
                className="form-input"
                value={deliveryDate}
                onChange={this.handleSetDeliveryDate}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">Notes / Special Instructions</label>
          <textarea
            className="form-input"
            value={cartState.notes}
            onChange={this.handleSetNotes}
            rows={2}
            placeholder="Any special instructions..."
          />
        </div>

        <div className={styles.reviewActions}>
          <button className="btn btn-secondary" onClick={() => this.goToStep(2)}>
            ← Back
          </button>
          {/* [MOD #001] Add More Items button */}
          <button className="btn btn-secondary" onClick={() => this.goToStep(2)}>
            <Plus size={14} /> Add More
          </button>
          <button
            className="btn btn-primary"
            onClick={this.handleSubmitOrder}
            disabled={cartState.lineItems.length === 0}
          >
            Submit Order
          </button>
        </div>
      </div>
    );
  }

  _renderStep4() {
    const { navigate } = this.props;
    const { submittedOrder } = this.state;

    return (
      <div className={styles.stepContent}>
        <div className={styles.confirmation}>
          <div className={styles.checkCircle}>
            <Check size={36} />
          </div>
          <h2>Order Submitted!</h2>
          <p className={styles.confirmOrderNum}>{submittedOrder?.orderNumber}</p>
          <p className={styles.confirmDetail}>
            {submittedOrder?.totalCases} cases · ${submittedOrder?.grandTotal?.toFixed(2)}
          </p>

          <div className={styles.confirmActions}>
            <button className="btn btn-primary btn-full" onClick={() => navigate(`/orders/${submittedOrder?.id}`)}>
              View Order
            </button>
            <button className="btn btn-secondary btn-full" onClick={() => {
              this.setState({ step: 1, submittedOrder: null });
            }}>
              New Order
            </button>
            <button className="btn btn-secondary btn-full" onClick={() => navigate('/')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { navigate } = this.props;
    const { step } = this.state;

    const stepTitles = {
      1: 'Select Customer',
      2: 'Build Order',
      3: 'Review Order',
      4: 'Confirmation',
    };

    return (
      <div className="page">
        <PageHeader
          title={stepTitles[step]}
          showBack={step < 4}
          onBack={() => {
            if (step > 1) this.goToStep(step - 1);
            else navigate(-1);
          }}
        />

        {step === 1 && this._renderStep1()}
        {step === 2 && this._renderStep2()}
        {step === 3 && this._renderStep3()}
        {step === 4 && this._renderStep4()}
      </div>
    );
  }
}

function NewOrderWrapper(props) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { storage } = useApp();
  const { cart: cartState, totals: cartTotals, dispatch: cartDispatch } = useCart();

  return (
    <NewOrder
      {...props}
      navigate={navigate}
      queryCustomerId={searchParams.get('customerId')}
      storage={storage}
      cartState={cartState}
      cartTotals={cartTotals}
      cartDispatch={cartDispatch}
    />
  );
}

export default NewOrderWrapper;
