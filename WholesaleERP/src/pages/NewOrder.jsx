// ============================================================
// FILE: NewOrder.jsx
// PURPOSE: 4-step order wizard: Select Customer → Build Order →
//          Review/Invoice Preview → Confirmation.
// DEPENDS ON: CartContext, AppContext, ProductModal, CartSummary,
//             SearchBar, PageHeader, OrderReceipt
// DEPENDED ON BY: App.jsx (route: /orders/new)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.6: Full order creation flow with catalog/favorites
//   toggle, product modal, inline price editing, delivery date, and
//   "Deliver Now" toggle. Prepaid customers prompted for payment.
//
// MODIFICATION HISTORY (newest first):
//   [MOD #branch] Branch-aware Step 1: branches shown with delivery address + parent
//     account name so rep knows which location they're ordering for.
//     handleSelectCustomer dispatches SET_BRANCH for branch customers so cart
//     tracks delivery location separately from billing account.
//     handleSubmitOrder passes branchId through to createOrder.
//   [2026-03-14] #004 Added queryDuplicate prop — when duplicate=1 is in URL,
//     constructor starts at step 2 (cart already pre-loaded by OrderDetail).
//     NewOrderWrapper passes queryDuplicate from searchParams.
//   [2026-03-14] #003 Step 2 customer bar: added "Change" button and split
//     layout into label + name so reps can swap customer mid-order without
//     losing catalog state. .customerBar CSS expanded to flex row.
//   [2026-03-13] #002 Extracted shared OrderReceipt component — replaced
//     inline step 3 receipt/card layout and 5 inline edit handlers with
//     OrderReceipt + single handleReceiptUpdateItem callback.
//   [2026-03-13] #001 Added "Most Ordered" tab, editable review items,
//     "Add More Items" button, order-wide discount, prepaid enforcement.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Star, Grid3X3, ChevronRight, Calendar, Truck, Check, TrendingUp, Plus,
  Minus, Trash2, AlertTriangle, CreditCard, GitBranch, MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCart, CART_ACTIONS } from '../context/CartContext';
import PageHeader from '../components/PageHeader';
import ProductModal from '../components/ProductModal';
import CartSummary from '../components/CartSummary';
import OrderReceipt from '../components/OrderReceipt';
import PaymentModal from '../components/PaymentModal';
import MockFeatureBanner from '../components/MockFeatureBanner';
import styles from '../styles/NewOrder.module.css';

class NewOrder extends React.Component {
  constructor(props) {
    super(props);

    // WHY: If customerId is in query params (from Customer Profile → New Order),
    // skip step 1 and go directly to catalog.
    // WHY: If duplicate=1 (from OrderDetail → Duplicate), cart is already loaded
    // by OrderDetail before navigation — skip straight to Step 2.
    const preselectedId = props.queryCustomerId
      ? Number(props.queryCustomerId)
      : null;
    const isDuplicate = !!props.queryDuplicate;

    this.state = {
      step: (preselectedId || isDuplicate) ? 2 : 1,
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
      // [MOD #003] Payment modal for Submit & Pay
      showPaymentModal: false,
      // [MOD #demo-delivery] Track which month the calendar picker is showing.
      calendarYear: new Date().getFullYear(),
      calendarMonth: new Date().getMonth(),
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

    // [MOD #salesReport] Pass customerId so Top tab shows THIS customer's history.
    // BEFORE: getMostOrderedProducts(20) — 20 was ignored; data was global.
    // WHY CHANGED: Top tab is only useful if it reflects the customer being ordered for.
    if (queryCustomerId) {
      const mostOrdered = storage.getMostOrderedProducts(Number(queryCustomerId));
      this.setState({ mostOrdered });
    }
  }

  // ───── Step 1: Customer Selection ─────

  handleSelectCustomer = (customer) => {
    const { cartDispatch, storage } = this.props;
    cartDispatch({ type: CART_ACTIONS.SET_CUSTOMER, payload: { id: customer.id, name: customer.name } });

    // [MOD #branch] For branch customers: also record branch delivery info in cart.
    // WHY: The order is placed under the branch ID (for address/route) but billing
    // and balance updates resolve to the parent account in MockStorageService.createOrder.
    if (customer.isBranch) {
      cartDispatch({
        type: CART_ACTIONS.SET_BRANCH,
        payload: { id: customer.id, name: customer.name, address: customer.address },
      });
    }

    const favorites   = storage.getFavorites(customer.id);
    // [MOD #salesReport] Reload Top list scoped to the newly selected customer.
    // WHY: Customer changes at this point; stale global Top list would be wrong.
    const mostOrdered = storage.getMostOrderedProducts(customer.id);
    this.setState({
      step:      2,
      favorites: favorites.map(f => f.id),
      mostOrdered,
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

  // [MOD #demo-delivery] Calendar navigation — step one month back/forward.
  handleCalendarPrev = () => {
    this.setState(s => {
      const d = new Date(s.calendarYear, s.calendarMonth - 1, 1);
      return { calendarYear: d.getFullYear(), calendarMonth: d.getMonth() };
    });
  };

  handleCalendarNext = () => {
    this.setState(s => {
      const d = new Date(s.calendarYear, s.calendarMonth + 1, 1);
      return { calendarYear: d.getFullYear(), calendarMonth: d.getMonth() };
    });
  };

  handleToggleDeliverNow = () => {
    const { cartState, cartDispatch } = this.props;
    cartDispatch({ type: CART_ACTIONS.SET_DELIVER_NOW, payload: !cartState.deliverNow });
  };

  // [MOD #002] OrderReceipt update callback
  // BEFORE: 5 separate handlers (handleReviewQtyChange, handleReviewQtyInput,
  //   handleReviewPriceChange, handleReviewDiscountChange, _updateReviewItem).
  // WHY CHANGED: Edit logic moved into OrderReceipt — component recalculates
  //   lineTotal/depositTotal/discount internally and sends merged item back.
  // REVERT RISK: Removing this requires restoring all 5 handlers + inline JSX.
  handleReceiptUpdateItem = (mergedItem) => {
    const { cartDispatch } = this.props;
    cartDispatch({ type: CART_ACTIONS.UPDATE_ITEM, payload: mergedItem });
  };

  // [MOD #002] Remove line — unchanged logic, tag added for traceability
  handleReviewRemoveItem = (productId) => {
    const { cartDispatch } = this.props;
    cartDispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
  };

  handleSetNotes = (e) => {
    this.props.cartDispatch({ type: CART_ACTIONS.SET_NOTES, payload: e.target.value });
  };

  // [MOD #003] Submit & Pay — opens payment modal, then submits with payment attached
  handleSubmitAndPay = () => {
    this.setState({ showPaymentModal: true });
  };

  // [MOD #004] Handle adding payment method from PaymentModal
  handleAddPaymentMethod = (customerId, newMethod) => {
    const { storage, cartState, cartDispatch, setCustomer } = this.props;
    const customer = storage.getCustomer(customerId);
    if (!customer) return;

    // Add new method to customer's savedPaymentMethods
    const existing = customer.savedPaymentMethods || [];
    storage.updateCustomer(customerId, {
      savedPaymentMethods: [...existing, newMethod],
    });

    // Force re-render by updating cart customer (triggers refresh)
    if (setCustomer) {
      const refreshedCustomer = storage.getCustomer(customerId);
      setCustomer(refreshedCustomer);
    }
  };

  // [MOD #003] Payment applied — submit order with payment info
  handlePaymentApplied = (paymentData) => {
    const { storage, cartState, cartTotals, cartDispatch, navigate, showToast } = this.props;

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
      // [MOD #003] Mark as prepaid with payment info
      prepaidPayment: {
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
        processed: paymentData.processed || false,
      },
    });

    // WHY: Also record the payment in payment history
    storage.createPayment({
      customerId: cartState.customerId,
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      appliedTo: [{ orderId: order.id, amount: paymentData.amount }],
      date: new Date().toISOString(),
    });

    cartDispatch({ type: CART_ACTIONS.CLEAR_CART });
    this.setState({ showPaymentModal: false, step: 4, submittedOrder: order });
    showToast(`Order ${order.orderNumber} submitted with payment!`);

    // [MOD #nav] Replace history so browser back goes to dashboard, not empty cart
    navigate('/orders/new', { replace: true });
  };

  handleSubmitOrder = () => {
    const { storage, cartState, cartTotals, cartDispatch, navigate, showToast } = this.props;

    // [MOD #001] Prepaid enforcement: block submit if prepaid customer has balance
    const customer = storage.getCustomer(cartState.customerId);
    if (customer && customer.paymentType === 'prepaid' && customer.balance > 0) {
      showToast('Prepaid customer has outstanding balance — collect payment first', 'error');
      return;
    }

    const order = storage.createOrder({
      customerId: cartState.customerId,
      // [MOD #branch] Pass branchId so delivery address is recorded on the order.
      branchId: cartState.branchId || null,
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

    // [MOD #nav] Replace history so browser back goes to dashboard, not empty cart
    navigate('/orders/new', { replace: true });

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
      ? customers.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.address && c.address.toLowerCase().includes(q))
        )
      : customers;

    // [MOD #branch] Build parent-name lookup so branch rows show the account name.
    const customersById = Object.fromEntries(customers.map(c => [c.id, c]));

    return (
      <div className={styles.stepContent}>
        <div className={styles.searchWrap}>
          <input
            type="text"
            className="form-input"
            placeholder="Search customers or addresses..."
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
                  {/* [MOD #branch] Purple tag so reps instantly see which are branches */}
                  {c.isBranch && (
                    <span className={styles.branchTag}>
                      <GitBranch size={11} /> Branch
                    </span>
                  )}
                </div>
                {/* [MOD #branch] Show delivery address for branch locations */}
                {c.isBranch && c.address && (
                  <div className={styles.branchAddressLine}>
                    <MapPin size={11} />
                    <span>{c.address}</span>
                  </div>
                )}
                {/* Subtitle: parent account for branches, type for main accounts */}
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
        {/* Customer bar — shows selected customer with inline Change option.
            WHY: Sales reps sometimes pick the wrong customer. Changing here
            clears step 1 search and returns to customer select without losing
            catalog state (step resets but products/categories stay loaded). */}
        <div className={styles.customerBar}>
          <div className={styles.customerBarInfo}>
            <span className={styles.customerBarLabel}>Customer</span>
            <span className={styles.customerBarName}>{cartState.customerName}</span>
            {/* [MOD #branch] Show delivery address below name when a branch is selected.
                 WHY: Confirms the rep is ordering for the right physical location. */}
            {cartState.branchId && cartState.branchAddress && (
              <span className={styles.customerBarBranch}>
                <MapPin size={11} /> {cartState.branchAddress}
              </span>
            )}
          </div>
          <button
            className={styles.customerBarChange}
            onClick={() => this.goToStep(1)}
            aria-label="Change customer"
          >
            Change
          </button>
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

    // WHY: Reads configured delivery days from storage so Settings toggles
    // take effect immediately in the order wizard.
    // [MOD #demo-delivery] Replaced chip list with full month calendar.
    const deliveryDays = storage.getDeliveryDays(); // e.g. [1,2,3,4,5]

    // Find the first available delivery date (to use as default).
    const getFirstAvailableDate = () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      for (let i = 0; i < 60; i++) {
        if (deliveryDays.includes(d.getDay())) return d.toISOString().split('T')[0];
        d.setDate(d.getDate() + 1);
      }
      return new Date().toISOString().split('T')[0];
    };

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const firstAvailable = deliveryDays.length > 0 ? getFirstAvailableDate() : tomorrowStr;
    // A previously chosen date is kept if it is still a valid delivery day.
    const isValidChoice = cartState.deliveryDate &&
      cartState.deliveryDate >= tomorrowStr &&
      deliveryDays.includes(new Date(cartState.deliveryDate + 'T00:00:00').getDay());
    const deliveryDate = isValidChoice ? cartState.deliveryDate : firstAvailable;

    // Calendar state — which month is the picker showing.
    const { calendarYear, calendarMonth } = this.state;
    const todayStr = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(calendarYear, calendarMonth, 1);
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const startDow = firstOfMonth.getDay(); // 0=Sun
    const monthLabel = firstOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    // Build grid cells: leading nulls for offset, then day numbers.
    const calCells = [
      ...Array(startDow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    // [MOD #001] Prepaid warning
    const customer = storage.getCustomer(cartState.customerId);
    const isPrepaidWithBalance = customer && customer.paymentType === 'prepaid' && customer.balance > 0;
    // [MOD #003] Prepaid customers MUST pay upfront — only Submit & Pay allowed
    const isPrepaid = customer && customer.paymentType === 'prepaid';

    return (
      <div className={styles.stepContent}>
        {/* [MOD #002] Shared receipt — replaced inline card layout + invoice table
            BEFORE: Inline JSX with reviewItems/reviewItem cards, per-field editors
            WHY CHANGED: Identical edit UX needed in OrderDetail edit mode
            REVERT RISK: Must restore ~150 lines of inline JSX + 5 handler methods */}
        <OrderReceipt
          editable
          customer={customer}
          lineItems={cartState.lineItems}
          totals={cartTotals}
          orderNumber="Order Review"
          maxItemDiscount={maxItemDisc}
          onUpdateItem={this.handleReceiptUpdateItem}
          onRemoveItem={this.handleReviewRemoveItem}
          onToast={showToast}
          prepaidWarning={isPrepaidWithBalance
            ? `⚠️ Prepaid customer has $${customer.balance.toFixed(2)} outstanding — collect payment before submitting`
            : null}
          afterTotals={
            <>
              <div className={styles.receiptDivider} />

              {/* ── Delivery ── */}
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
                    {/* [MOD #demo-delivery] Full calendar picker.
                        Non-delivery days and past dates are grayed/disabled.
                        BEFORE: chip list of 14 dates.
                        REVERT RISK: Restoring chips loses month navigation. */}
                    <MockFeatureBanner
                      title="Demo: Delivery Schedule"
                      description="Non-delivery days are grayed out. In production this schedule is set by the warehouse and cannot be overridden by salespeople."
                    />
                    <div className={styles.calendarPicker}>
                      {/* Month navigation */}
                      <div className={styles.calendarNav}>
                        <button type="button" className={styles.calendarNavBtn} onClick={this.handleCalendarPrev}>
                          ‹
                        </button>
                        <span className={styles.calendarMonthLabel}>{monthLabel}</span>
                        <button type="button" className={styles.calendarNavBtn} onClick={this.handleCalendarNext}>
                          ›
                        </button>
                      </div>
                      {/* Day-of-week headers */}
                      <div className={styles.calendarGrid}>
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(h => (
                          <div key={h} className={styles.calendarDow}>{h}</div>
                        ))}
                        {calCells.map((day, idx) => {
                          if (day === null) return <div key={`e${idx}`} />;
                          const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                          const dow = new Date(dateStr + 'T00:00:00').getDay();
                          const isDelivery = deliveryDays.includes(dow);
                          const isPast = dateStr < tomorrowStr;
                          const isDisabled = !isDelivery || isPast;
                          const isSelected = dateStr === deliveryDate;
                          const isToday = dateStr === todayStr;
                          return (
                            <button
                              key={dateStr}
                              type="button"
                              disabled={isDisabled}
                              className={[
                                styles.calendarDay,
                                isDisabled ? styles.calendarDayDisabled : styles.calendarDayAvailable,
                                isSelected ? styles.calendarDaySelected : '',
                                isToday ? styles.calendarDayToday : '',
                              ].join(' ')}
                              onClick={() => !isDisabled && this.props.cartDispatch({
                                type: CART_ACTIONS.SET_DELIVERY_DATE, payload: dateStr })}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                      {deliveryDays.length === 0 && (
                        <p className={styles.noDeliveryDays}>
                          No delivery days configured — go to Settings to add days.
                        </p>
                      )}
                    </div>
                    {deliveryDate && (
                      <p className={styles.selectedDateLabel}>
                        Selected: {new Date(deliveryDate + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ── Notes ── */}
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
            </>
          }
        >
          {/* Before-totals slot: order-wide discount */}
          <div className={styles.orderDiscountSection}>
            <label className={styles.orderDiscountLabel}>Order Discount %</label>
            <input
              type="number"
              className={styles.orderDiscountInput}
              min="0"
              max={caps ? caps.perOrderPercent : 10}
              step="0.5"
              value={typeof cartState.orderDiscount === 'object' ? cartState.orderDiscount.value : (cartState.orderDiscount || 0)}
              onChange={(e) => {
                const max = caps ? caps.perOrderPercent : 10;
                const val = Math.min(Math.max(0, parseFloat(e.target.value) || 0), max);
                cartDispatch({ type: CART_ACTIONS.APPLY_ORDER_DISCOUNT, payload: { type: 'percent', value: val } });
              }}
            />
            <span className={styles.orderDiscountCap}>
              max {caps ? caps.perOrderPercent : 10}%
            </span>
          </div>
        </OrderReceipt>

        {/* ── Actions ── [MOD #003] Prepaid: only Submit & Pay. Credit: both options */}
        <div className={styles.reviewActions}>
          <button className="btn btn-secondary" onClick={() => this.goToStep(2)}>
            ← Back
          </button>
          {/* [MOD #001] Add More Items button */}
          <button className="btn btn-secondary" onClick={() => this.goToStep(2)}>
            <Plus size={14} /> Add More
          </button>
          {isPrepaid ? (
            /* Prepaid customers must pay before ordering */
            <button
              className="btn btn-primary"
              onClick={this.handleSubmitAndPay}
              disabled={cartState.lineItems.length === 0}
            >
              <CreditCard size={14} /> Submit & Pay
            </button>
          ) : (
            /* Credit customers can submit on account or pay upfront */
            <>
              <button
                className="btn btn-secondary"
                onClick={this.handleSubmitAndPay}
                disabled={cartState.lineItems.length === 0}
              >
                <CreditCard size={14} /> Pay Now
              </button>
              <button
                className="btn btn-primary"
                onClick={this.handleSubmitOrder}
                disabled={cartState.lineItems.length === 0}
              >
                Submit Order
              </button>
            </>
          )}
        </div>

        {/* [MOD #003] Payment modal for Submit & Pay */}
        {this.state.showPaymentModal && (
          <PaymentModal
            customer={customer}
            selectedInvoices={[]}
            suggestedAmount={cartTotals.grandTotal}
            onApply={this.handlePaymentApplied}
            onClose={() => this.setState({ showPaymentModal: false })}
            orderMode={true}
            creditOnly={isPrepaid}
            onToast={showToast}
            onAddPaymentMethod={this.handleAddPaymentMethod}
          />
        )}
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
      queryDuplicate={searchParams.get('duplicate')}
      storage={storage}
      cartState={cartState}
      cartTotals={cartTotals}
      cartDispatch={cartDispatch}
    />
  );
}

export default NewOrderWrapper;
