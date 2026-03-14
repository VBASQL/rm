// ============================================================
// FILE: MockStorageService.js
// PURPOSE: localStorage-backed implementation of StorageService.
//          Seeds mock data on first use, provides full CRUD for Phase 1.
// DEPENDS ON: StorageService.js, mockData.js
// DEPENDED ON BY: AppContext.jsx (provides this as the active storage)
//
// WHY THIS EXISTS:
//   Phase 1 has no backend. This gives every page real data to work with
//   via the same interface the API version will use. Swap is one line
//   in AppContext.jsx. See BUILD_PLAN.md §4.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] #returns Added returns CRUD: getReturns, getReturn, createReturn,
//     updateReturn, processReturn. Returns are credit orders that reduce customer
//     balance. Line items can be marked damaged with type for vendor claims.
//   [2026-03-14] #branch Added getBranches, createBranch, getAccountOrders, getAccountId.
//     Updated createOrder to update PARENT account balance when a branch places an order.
//     Updated updateOrderStatus (Delivered) to update parent balance for branch orders.
//     Updated createPayment to find parent account when payment is for a branch.
//     Bumped SEED_VERSION check to force re-seed with branch mock data.
//   [2026-03-13] #001 Added: createInvoice, updateInvoice, getAlerts,
//     getMostOrderedProducts, duplicateOrder, reduceCustomerCredit,
//     updateOrderStatus (auto-invoice on Delivered), getDiscountSettings,
//     updateDiscountSettings. Added discountSettings storage key.
//     Removed Shipped from valid status transitions.
//   [2026-03-12] Initial creation.
// ============================================================
import StorageService from './StorageService';
import { CUSTOMERS, PRODUCTS, CATEGORIES, ORDERS, INVOICES, PAYMENTS, FAVORITES, RECENT_ACTIVITY, DEFAULT_DISCOUNT_SETTINGS, DEFAULT_DELIVERY_DAYS, RETURNS, SEED_VERSION } from '../data/mockData';

const STORAGE_KEYS = {
  customers: 'wholesaleErp_customers',
  products: 'wholesaleErp_products',
  categories: 'wholesaleErp_categories',
  orders: 'wholesaleErp_orders',
  invoices: 'wholesaleErp_invoices',
  payments: 'wholesaleErp_payments',
  favorites: 'wholesaleErp_favorites',
  activity: 'wholesaleErp_activity',
  // [MOD #001] Added discount settings storage key for 4-level caps
  discountSettings: 'wholesaleErp_discountSettings',
  // [MOD #demo-delivery] Warehouse delivery schedule (array of weekday numbers)
  deliveryDays: 'wholesaleErp_deliveryDays',
  // [MOD #returns] Return orders (credit orders)
  returns: 'wholesaleErp_returns',
  // [MOD #branch] seedVersion tracks which mock data version is loaded;
  // when SEED_VERSION in mockData.js is bumped, data re-seeds automatically.
  seeded: 'wholesaleErp_seeded',
};

class MockStorageService extends StorageService {
  constructor() {
    super();
    this._seedIfNeeded();
  }

  // WHY: Seed on first app load OR whenever SEED_VERSION changes.
  // SEED_VERSION is bumped in mockData.js when seed data shape changes
  // (e.g. adding branch customers). This ensures all dev environments
  // pick up the new data automatically without manual localStorage clears.
  // [MOD #branch] Changed from boolean 'true' to versioned check.
  _seedIfNeeded() {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.seeded);
    if (storedVersion !== SEED_VERSION) {
      localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(CUSTOMERS));
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(ORDERS));
      localStorage.setItem(STORAGE_KEYS.invoices, JSON.stringify(INVOICES));
      localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(PAYMENTS));
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(FAVORITES));
      localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(RECENT_ACTIVITY));
      // [MOD #001] Seed default discount settings
      localStorage.setItem(STORAGE_KEYS.discountSettings, JSON.stringify(DEFAULT_DISCOUNT_SETTINGS));
      // [MOD #demo-delivery] Seed delivery days (Mon-Fri)
      localStorage.setItem(STORAGE_KEYS.deliveryDays, JSON.stringify(DEFAULT_DELIVERY_DAYS));
      // [MOD #returns] Seed returns
      localStorage.setItem(STORAGE_KEYS.returns, JSON.stringify(RETURNS));
      localStorage.setItem(STORAGE_KEYS.seeded, SEED_VERSION);
    }
  }

  _get(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ── Customer Operations ──────────────────────────────────
  getCustomers() {
    return this._get(STORAGE_KEYS.customers);
  }

  getCustomer(id) {
    const customers = this.getCustomers();
    return customers.find(c => c.id === Number(id)) || null;
  }

  createCustomer(data) {
    const customers = this.getCustomers();
    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    const customer = {
      id: newId,
      // WHY: Defaults to prepaid. In production, accounting controls credit and
      // salespeople can never set these fields. For the demo UI, data can override
      // these defaults so stakeholders can test credit account flows.
      // [MOD #demo] Moved hardcoded fields BEFORE ...data spread so caller can override.
      // REVERT RISK: Restoring them after ...data locks all new customers to prepaid
      // and breaks the demo credit-terms feature in AddCustomer.jsx.
      paymentType: 'prepaid',
      creditTier: null,
      creditLimit: 0,
      terms: 'Prepaid',
      status: 'Active',
      balance: 0,
      accountCredit: 0,
      avgOrderCases: 0,
      lastOrderDate: null,
      assignedSalesperson: 'Sarah Mitchell',
      notes: [],
      createdDate: new Date().toISOString().split('T')[0],
      ...data,
      // WHY: savedPaymentMethods must always be an array — never let it come
      // in undefined from the form payload.
      savedPaymentMethods: data.savedPaymentMethods || [],
    };
    customers.push(customer);
    this._set(STORAGE_KEYS.customers, customers);
    return customer;
  }

  updateCustomer(id, data) {
    const customers = this.getCustomers();
    const index = customers.findIndex(c => c.id === Number(id));
    if (index === -1) return null;
    customers[index] = { ...customers[index], ...data };
    this._set(STORAGE_KEYS.customers, customers);
    return customers[index];
  }

  // [MOD #branch] getBranches — returns all customer records where parentId matches.
  // WHY: Branches are delivery locations under a parent account.
  getBranches(parentId) {
    return this.getCustomers().filter(c => c.parentId === Number(parentId));
  }

  // [MOD #branch] createBranch — creates a new delivery location under a parent account.
  // WHY: Branch inherits paymentType, priceLevel, terms, creditTier, status from parent.
  // Branch has its own address, contact, phone, email — everything delivery-specific.
  // Financial state (balance, creditLimit) stays at $0 on the branch record;
  // balance tracking happens on the parent account.
  createBranch(parentId, data) {
    const parent = this.getCustomer(Number(parentId));
    if (!parent) throw new Error('Parent customer not found');

    const customers = this.getCustomers();
    const newId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    const branchCount = this.getBranches(parentId).length + 1;

    const branch = {
      id: newId,
      code: `${parent.code}-B${branchCount}`,
      // WHY: Financial fields stay at zero — balance tracking is on parent account.
      paymentType: parent.paymentType,
      creditTier: parent.creditTier,
      creditLimit: 0,
      balance: 0,
      accountCredit: 0,
      terms: parent.terms,
      priceLevel: parent.priceLevel,
      status: parent.status,
      assignedSalesperson: parent.assignedSalesperson,
      route: parent.route,
      type: parent.type,
      avgOrderCases: 0,
      lastOrderDate: null,
      notes: [],
      savedPaymentMethods: [],
      createdDate: new Date().toISOString().split('T')[0],
      ...data,
      // These must come AFTER spread so they can't be overridden by caller.
      parentId: Number(parentId),
      isBranch: true,
    };
    customers.push(branch);
    this._set(STORAGE_KEYS.customers, customers);
    return branch;
  }

  // [MOD #branch] getAccountId — resolves to the root account ID for any customer.
  // WHY: Financial records (invoices, payments, balance) live on the parent account.
  // This helper lets any service find the account regardless of whether
  // a branch or parent ID was passed in.
  getAccountId(customerId) {
    const customer = this.getCustomer(Number(customerId));
    if (!customer) return Number(customerId);
    return customer.parentId || customer.id;
  }

  // [MOD #branch] getAccountOrders — returns all orders for a parent account
  // including orders placed at any of its branch locations.
  // WHY: Parent profile shows consolidated order history across all locations.
  getAccountOrders(customerId) {
    const id = Number(customerId);
    const customer = this.getCustomer(id);
    if (!customer) return [];

    // If called with a branch id, return just that branch's orders
    if (customer.isBranch) return this.getOrders(id);

    const branches = this.getBranches(id);
    const branchIds = new Set(branches.map(b => b.id));
    const allOrders = this._get(STORAGE_KEYS.orders);
    return allOrders.filter(o =>
      o.customerId === id || branchIds.has(o.customerId)
    );
  }

  // [MOD #001] Salesperson can only reduce credit — never raise.
  // WHY: Prevents salesperson from granting credit on their own.
  // Setting newLimit to 0 effectively converts the customer to prepaid.
  reduceCustomerCredit(id, newLimit) {
    const customer = this.getCustomer(id);
    if (!customer) return null;
    if (newLimit >= customer.creditLimit) {
      throw new Error('Can only reduce credit limit, not increase');
    }
    const updates = { creditLimit: Math.max(0, newLimit) };
    // WHY: If credit goes to 0, convert to prepaid so the system enforces prepayment.
    if (updates.creditLimit === 0) {
      updates.paymentType = 'prepaid';
      updates.creditTier = null;
      updates.terms = 'Prepaid';
    }
    return this.updateCustomer(id, updates);
  }

  // ── Product Operations ───────────────────────────────────
  getProducts() {
    return this._get(STORAGE_KEYS.products);
  }

  getProductsByCategory(categoryId) {
    return this.getProducts().filter(p => p.categoryId === Number(categoryId));
  }

  getCategories() {
    return this._get(STORAGE_KEYS.categories).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // ── Order Operations ─────────────────────────────────────
  getOrders(customerId) {
    const orders = this._get(STORAGE_KEYS.orders);
    if (customerId !== undefined && customerId !== null) {
      return orders.filter(o => o.customerId === Number(customerId));
    }
    return orders;
  }

  getOrder(id) {
    return this._get(STORAGE_KEYS.orders).find(o => o.id === Number(id)) || null;
  }

  createOrder(data) {
    const orders = this.getOrders();
    const newId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const orderNum = `ORD-${today}-${String(newId).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const order = {
      id: newId,
      orderNumber: orderNum,
      status: 'Submitted',
      createdDate: now,
      modifiedDate: now,
      ...data,
    };
    orders.push(order);
    this._set(STORAGE_KEYS.orders, orders);

    // [MOD #branch] When a branch places an order, update the PARENT account's
    // lastOrderDate — not the branch record (branch balance stays at $0).
    // WHY: Balance and account activity tracking lives at the parent level.
    if (data.customerId) {
      const customer = this.getCustomer(data.customerId);
      const accountId = customer?.parentId || data.customerId;
      this.updateCustomer(accountId, {
        lastOrderDate: now.split('T')[0],
      });
      // WHY: If branch, also update branch's lastOrderDate for quick reference.
      if (customer?.parentId) {
        this.updateCustomer(data.customerId, { lastOrderDate: now.split('T')[0] });
      }
    }

    // WHY: Add to recent activity feed for dashboard.
    const customer = this.getCustomer(data.customerId);
    // [MOD #branch] Show parent name in activity for branch orders.
    const displayName = customer?.isBranch
      ? `${this.getCustomer(customer.parentId)?.name || ''} (${customer.name})`
      : (customer?.name || 'Unknown');
    this._addActivity({
      type: 'order',
      text: `Order #${orderNum} placed — ${displayName}`,
      linkTo: `/orders/${newId}`,
    });

    return order;
  }

  updateOrder(id, data) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === Number(id));
    if (index === -1) return null;
    orders[index] = { ...orders[index], ...data, modifiedDate: new Date().toISOString() };
    this._set(STORAGE_KEYS.orders, orders);
    return orders[index];
  }

  // [MOD #001] Status transitions: Draft → Submitted → Picking → Delivered.
  // WHY: Once Picking, order is locked from content edits.
  // WHY: When status becomes Delivered, auto-create an invoice.
  updateOrderStatus(id, newStatus) {
    const VALID_TRANSITIONS = {
      'Draft': ['Submitted', 'Cancelled'],
      'Submitted': ['Picking', 'Cancelled'],
      'Picking': ['Delivered'],
      'Delivered': [],
      'Cancelled': [],
    };

    const order = this.getOrder(id);
    if (!order) return null;

    const allowed = VALID_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    const updated = this.updateOrder(id, { status: newStatus });

    // WHY: Auto-invoice on delivery — this is the core business rule.
    // An invoice is created with full order amount, linked to the order.
    if (newStatus === 'Delivered') {
      // [MOD #branch] If order is for a branch, invoice goes to PARENT account.
      // WHY: All financial records (invoices, balance) are managed at account level.
      const orderCustomer = this.getCustomer(order.customerId);
      const accountId = orderCustomer?.parentId || order.customerId;

      const invoice = this.createInvoice({
        orderId: order.id,
        // WHY: Invoice is always on the parent account, even if order was for a branch.
        customerId: accountId,
        branchId: orderCustomer?.isBranch ? order.customerId : null,
        lineItems: order.lineItems,
        subtotal: order.subtotal,
        depositTotal: order.depositTotal,
        discountTotal: order.discountTotal,
        grandTotal: order.grandTotal,
        totalCases: order.totalCases,
      });

      // [MOD #branch] Update PARENT account balance — branch balance stays at $0.
      const accountCustomer = this.getCustomer(accountId);
      if (accountCustomer) {
        this.updateCustomer(accountId, {
          balance: (accountCustomer.balance || 0) + order.grandTotal,
        });
      }

      const displayName = orderCustomer?.isBranch
        ? `${accountCustomer?.name || ''} (${orderCustomer.name})`
        : (accountCustomer?.name || 'Unknown');
      this._addActivity({
        type: 'delivery',
        text: `Delivery confirmed — ${displayName} (Invoice #${invoice.invoiceNumber})`,
        linkTo: `/orders/${order.id}`,
      });
    }

    return updated;
  }

  // [MOD #salesReport] getMostOrderedProducts now accepts customerId and uses
  //   committed-status filter (Delivered/Picking/Submitted) for consistency with
  //   the Sales Report. BEFORE: counted all non-Cancelled orders globally.
  //   WHY CHANGED: "Top" tab should show what THIS customer actually buys most,
  //   not a global ranking that's meaningless for the current order context.
  getMostOrderedProducts(customerId) {
    // WHY: Mirror SALES_STATUSES from Reports.jsx — only committed orders count.
    const COMMITTED = new Set(['Delivered', 'Picking', 'Submitted']);
    const orders = customerId != null
      ? this.getAccountOrders(Number(customerId))
      : this.getOrders();
    const productCounts = {};

    for (const order of orders) {
      if (!COMMITTED.has(order.status)) continue;
      for (const item of order.lineItems) {
        productCounts[item.productId] = (productCounts[item.productId] || 0) + item.quantity;
      }
    }

    const products = this.getProducts();
    return products
      .filter(p => productCounts[p.id])
      .sort((a, b) => (productCounts[b.id] || 0) - (productCounts[a.id] || 0));
  }

  // [MOD #001] Deep-copies line items from existing order into new draft.
  // WHY: Duplicate order is a huge time-saver for repeat customers.
  duplicateOrder(orderId, targetCustomerId) {
    const original = this.getOrder(orderId);
    if (!original) return null;

    const custId = targetCustomerId || original.customerId;
    return this.createOrder({
      customerId: custId,
      salespersonId: original.salespersonId,
      lineItems: original.lineItems.map(item => ({ ...item })),
      subtotal: original.subtotal,
      depositTotal: original.depositTotal,
      discountTotal: original.discountTotal,
      grandTotal: original.grandTotal,
      totalCases: original.totalCases,
      deliveryDate: null,
      notes: `Duplicated from ${original.orderNumber}`,
    });
  }

  // ── Invoice Operations ───────────────────────────────────
  getInvoices(customerId) {
    const invoices = this._get(STORAGE_KEYS.invoices);
    if (customerId !== undefined && customerId !== null) {
      return invoices.filter(i => i.customerId === Number(customerId));
    }
    return invoices;
  }

  getInvoice(id) {
    return this._get(STORAGE_KEYS.invoices).find(i => i.id === Number(id)) || null;
  }

  // WHY: Parse customer terms string to get days until due.
  // Terms are stored as 'NET-15', 'NET-30', 'Prepaid', etc.
  // Previously hardcoded to 30 — NET-15 customers got wrong due dates.
  // [MOD #demo] Extracted so InvoiceDetail date-change feature can reuse it.
  _daysUntilDueFromTerms(customer) {
    if (!customer || customer.paymentType === 'prepaid') return 0;
    const match = (customer.terms || '').match(/NET-?(\d+)/i);
    return match ? parseInt(match[1], 10) : 30; // default 30 for unrecognized terms
  }

  // [MOD #001] Invoice creation — called automatically when order status → Delivered.
  createInvoice(data) {
    const invoices = this.getInvoices();
    const newId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const invNum = `INV-${today}-${String(newId).padStart(3, '0')}`;

    // WHY: Due date calculated from customer terms (NET-15, NET-30, etc.).
    // Prepaid customers get same-day due date (already collected at order time).
    // [MOD #demo] Was hardcoded 30 — now uses _daysUntilDueFromTerms so NET-15
    // customers get the correct due date. Fixes aging report inaccuracy.
    const customer = data.customerId ? this.getCustomer(data.customerId) : null;
    const daysUntilDue = this._daysUntilDueFromTerms(customer);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysUntilDue);

    const invoice = {
      id: newId,
      invoiceNumber: invNum,
      status: 'Open',
      amountPaid: 0,
      amountDue: data.grandTotal || 0,
      dueDate: dueDate.toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
      paidDate: null,
      ...data,
    };
    invoices.push(invoice);
    this._set(STORAGE_KEYS.invoices, invoices);
    return invoice;
  }

  // [MOD #001] Update invoice fields (status, payment amounts, etc.)
  updateInvoice(id, data) {
    const invoices = this.getInvoices();
    const index = invoices.findIndex(i => i.id === Number(id));
    if (index === -1) return null;
    invoices[index] = { ...invoices[index], ...data };
    this._set(STORAGE_KEYS.invoices, invoices);
    return invoices[index];
  }

  // ── Payment Operations ───────────────────────────────────
  getPayments(customerId) {
    const payments = this._get(STORAGE_KEYS.payments);
    if (customerId !== undefined && customerId !== null) {
      return payments.filter(p => p.customerId === Number(customerId));
    }
    return payments;
  }

  // [MOD #receipt] Get single payment by ID — used by PaymentReceipt page.
  getPayment(id) {
    const payments = this._get(STORAGE_KEYS.payments);
    return payments.find(p => p.id === Number(id)) || null;
  }

  createPayment(data) {
    const payments = this.getPayments();
    const newId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;

    const payment = {
      id: newId,
      date: new Date().toISOString().split('T')[0],
      collectedBy: 1,
      ...data,
    };
    payments.push(payment);
    this._set(STORAGE_KEYS.payments, payments);

    // [MOD #004] Apply payments to orders AND/OR invoices
    if (data.appliedTo && data.appliedTo.length > 0) {
      const invoices = this._get(STORAGE_KEYS.invoices);
      const orders = this._get(STORAGE_KEYS.orders);

      for (const application of data.appliedTo) {
        // WHY: appliedTo can contain invoiceId OR orderId — handle both
        if (application.invoiceId) {
          const inv = invoices.find(i => i.id === application.invoiceId);
          if (inv) {
            inv.amountPaid = (inv.amountPaid || 0) + application.amount;
            inv.amountDue = inv.grandTotal - inv.amountPaid;
            if (inv.amountDue <= 0) {
              inv.status = 'Paid';
              inv.paidDate = new Date().toISOString().split('T')[0];
              inv.amountDue = 0;
            } else {
              inv.status = 'Partial';
            }
          }
        }
        if (application.orderId) {
          const ord = orders.find(o => o.id === application.orderId);
          if (ord) {
            ord.amountPaid = (ord.amountPaid || 0) + application.amount;
            // WHY: Orders get paymentStatus like invoices
            if (ord.amountPaid >= ord.grandTotal) {
              ord.paymentStatus = 'Paid';
            } else if (ord.amountPaid > 0) {
              ord.paymentStatus = 'Partial';
            }
          }
        }
      }
      this._set(STORAGE_KEYS.invoices, invoices);
      this._set(STORAGE_KEYS.orders, orders);
    }

    // [MOD #branch] Update PARENT account balance after payment.
    // WHY: Branch accounts hold no balance — all financial state is on the parent.
    // If a payment is recorded against a branch customerId, resolve to parent first.
    if (data.customerId) {
      const rawCustomer = this.getCustomer(data.customerId);
      const accountId = rawCustomer?.parentId || data.customerId;
      const customer = this.getCustomer(accountId);
      if (customer) {
        // [MOD #004] Only reduce balance for invoice payments, not order prepayments
        const invoiceApplied = (data.appliedTo || []).filter(a => a.invoiceId).reduce((sum, a) => sum + a.amount, 0);
        const totalApplied = (data.appliedTo || []).reduce((sum, a) => sum + a.amount, 0);
        const unapplied = data.amount - totalApplied;
        this.updateCustomer(accountId, {
          balance: Math.max(0, customer.balance - invoiceApplied),
          accountCredit: (customer.accountCredit || 0) + Math.max(0, unapplied),
        });
      }

      const displayName = rawCustomer?.isBranch
        ? `${customer?.name || ''} (${rawCustomer.name})`
        : (customer?.name || rawCustomer?.name || 'Unknown');
      this._addActivity({
        type: 'payment',
        text: `Payment $${data.amount.toFixed(2)} collected — ${displayName}`,
        linkTo: `/customers/${accountId}`,
      });
    }

    return payment;
  }

  // [MOD #004] Get orders that aren't fully paid (for payment collection)
  getUnpaidOrders(customerId) {
    const orders = this.getOrders(customerId);
    return orders.filter(o => {
      if (o.status === 'Cancelled') return false;
      const paid = o.amountPaid || 0;
      return paid < o.grandTotal;
    }).sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate)); // oldest first
  }

  // [MOD #004] Apply account credit to an order or invoice
  applyAccountCredit(customerId, targetType, targetId, amount) {
    const customer = this.getCustomer(customerId);
    if (!customer || (customer.accountCredit || 0) < amount) {
      throw new Error('Insufficient account credit');
    }

    // WHY: Reduce account credit and create a payment record
    this.updateCustomer(customerId, {
      accountCredit: (customer.accountCredit || 0) - amount,
    });

    const appliedTo = targetType === 'order'
      ? [{ orderId: targetId, amount }]
      : [{ invoiceId: targetId, amount }];

    return this.createPayment({
      customerId,
      amount,
      method: 'account_credit',
      reference: 'Applied from account credit',
      appliedTo,
      date: new Date().toISOString(),
    });
  }

  // ── Favorites ────────────────────────────────────────────
  getFavorites(customerId) {
    const allFavorites = this._get(STORAGE_KEYS.favorites) || {};
    const productIds = allFavorites[customerId] || [];
    const products = this.getProducts();
    return products.filter(p => productIds.includes(p.id));
  }

  setFavorites(customerId, productIds) {
    const allFavorites = this._get(STORAGE_KEYS.favorites) || {};
    allFavorites[customerId] = productIds;
    this._set(STORAGE_KEYS.favorites, allFavorites);
  }

  // ── User ─────────────────────────────────────────────────
  getCurrentUser() {
    const raw = localStorage.getItem('wholesaleErp_auth');
    return raw ? JSON.parse(raw) : null;
  }

  // ── Activity Feed ────────────────────────────────────────
  getRecentActivity(limit = 10) {
    const activity = this._get(STORAGE_KEYS.activity);
    return activity
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }

  _addActivity(data) {
    const activity = this._get(STORAGE_KEYS.activity);
    const newId = activity.length > 0 ? Math.max(...activity.map(a => a.id)) + 1 : 1;
    activity.unshift({
      id: newId,
      ...data,
      date: new Date().toISOString(),
    });
    this._set(STORAGE_KEYS.activity, activity);
  }

  // ── Utility ──────────────────────────────────────────────
  // WHY: Allows resetting to seed data for testing.
  resetToSeedData() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    this._seedIfNeeded();
  }

  // WHY: Wipes all data to empty so testers can add their own accounts from
  // scratch. Keeps the seeded version key intact so the app does NOT
  // auto-re-seed on the next load. Data comes back only when the browser's
  // localStorage is manually cleared (DevTools → Application → Clear Storage).
  // [MOD #demo-clear] New method for Settings "Clear All Data" feature.
  clearAllData() {
    const emptyKeys = [
      STORAGE_KEYS.customers,
      STORAGE_KEYS.products,
      STORAGE_KEYS.categories,
      STORAGE_KEYS.orders,
      STORAGE_KEYS.invoices,
      STORAGE_KEYS.payments,
      STORAGE_KEYS.favorites,
      STORAGE_KEYS.activity,
    ];
    emptyKeys.forEach(key => localStorage.setItem(key, JSON.stringify([])));
    localStorage.setItem(STORAGE_KEYS.discountSettings, JSON.stringify(DEFAULT_DISCOUNT_SETTINGS));
    // [MOD #demo-delivery] Reset delivery days to Mon-Fri defaults when clearing.
    localStorage.setItem(STORAGE_KEYS.deliveryDays, JSON.stringify(DEFAULT_DELIVERY_DAYS));
    // Leave STORAGE_KEYS.seeded intact so _seedIfNeeded() does not re-seed.
  }

  // ── Alerts ───────────────────────────────────────────────
  // [MOD #001] Dynamically computed from live data — overdue invoices,
  // over-credit-limit, accounts on hold. Each has a linkTo for navigation.
  getAlerts() {
    const alerts = [];
    const customers = this.getCustomers();
    const invoices = this.getInvoices();
    const today = new Date().toISOString().split('T')[0];

    // WHY: Overdue invoices are the most urgent — salesperson needs to collect.
    const overdueInvoices = invoices.filter(i => i.status !== 'Paid' && i.dueDate < today);
    for (const inv of overdueInvoices) {
      const customer = customers.find(c => c.id === inv.customerId);
      alerts.push({
        id: `overdue-${inv.id}`,
        type: 'overdue',
        severity: 'high',
        text: `Overdue: ${inv.invoiceNumber} — ${customer?.name || 'Unknown'} ($${inv.amountDue.toFixed(2)})`,
        linkTo: `/customers/${inv.customerId}`,
      });
    }

    // WHY: Over credit limit means the customer should not place new orders.
    for (const c of customers) {
      if (c.paymentType === 'credit' && c.balance > c.creditLimit) {
        alerts.push({
          id: `overcredit-${c.id}`,
          type: 'overcredit',
          severity: 'high',
          text: `Over credit limit: ${c.name} ($${c.balance.toFixed(2)} / $${c.creditLimit.toFixed(2)})`,
          linkTo: `/customers/${c.id}`,
        });
      }
    }

    // WHY: Accounts on hold can't order — salesperson should follow up.
    for (const c of customers) {
      if (c.status === 'Hold') {
        alerts.push({
          id: `hold-${c.id}`,
          type: 'hold',
          severity: 'medium',
          text: `Account on hold: ${c.name}`,
          linkTo: `/customers/${c.id}`,
        });
      }
    }

    return alerts;
  }

  // ── Discount Settings ────────────────────────────────────
  // [MOD #001] 4-level discount caps: per-item fixed/%, per-order fixed/%.
  getDiscountSettings() {
    const raw = localStorage.getItem(STORAGE_KEYS.discountSettings);
    return raw ? JSON.parse(raw) : DEFAULT_DISCOUNT_SETTINGS;
  }

  updateDiscountSettings(data) {
    const current = this.getDiscountSettings();
    const updated = { ...current, ...data };
    this._set(STORAGE_KEYS.discountSettings, updated);
    return updated;
  }
  // ── Delivery Days ────────────────────────────────────────
  // WHY: Returns the array of weekday numbers (0–6) on which deliveries run.
  // Default is Mon–Fri [1,2,3,4,5]. In production the warehouse admin configures
  // this; in the demo the Settings page exposes toggle buttons for each day.
  // [MOD #demo-delivery] New methods.
  getDeliveryDays() {
    const raw = localStorage.getItem(STORAGE_KEYS.deliveryDays);
    return raw ? JSON.parse(raw) : DEFAULT_DELIVERY_DAYS;
  }

  updateDeliveryDays(days) {
    this._set(STORAGE_KEYS.deliveryDays, days);
    return days;
  }

  // ── Return Operations ────────────────────────────────────
  // WHY: Returns are credit orders that reduce customer balance.
  // [MOD #returns] New section for return order management.

  // Get all returns, optionally filtered by customerId.
  getReturns(customerId) {
    const returns = this._get(STORAGE_KEYS.returns);
    if (customerId !== undefined && customerId !== null) {
      return returns.filter(r => r.customerId === Number(customerId));
    }
    return returns;
  }

  // Get single return by ID.
  getReturn(id) {
    return this._get(STORAGE_KEYS.returns).find(r => r.id === Number(id)) || null;
  }

  // Create a new return order.
  // WHY: Returns can be linked to an original order (returnFromOrderId) or
  // created from scratch (originalOrderId = null).
  // Line items can have isDamaged and damageType for vendor claim tracking.
  createReturn(data) {
    const returns = this.getReturns();
    const newId = returns.length > 0 ? Math.max(...returns.map(r => r.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const retNum = `RET-${today}-${String(newId).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const returnOrder = {
      id: newId,
      returnNumber: retNum,
      status: 'Pending', // Pending → Processed
      createdDate: now,
      modifiedDate: now,
      processedDate: null,
      creditApplied: false,
      ...data,
    };
    returns.push(returnOrder);
    this._set(STORAGE_KEYS.returns, returns);

    // Add to activity feed
    const customer = this.getCustomer(data.customerId);
    const accountId = customer?.parentId || data.customerId;
    const accountCustomer = customer?.isBranch ? this.getCustomer(accountId) : customer;
    const displayName = customer?.isBranch
      ? `${accountCustomer?.name || ''} (${customer.name})`
      : (customer?.name || 'Unknown');
    this._addActivity({
      type: 'return',
      text: `Return #${retNum} created — ${displayName}`,
      linkTo: `/returns/${newId}`,
    });

    return returnOrder;
  }

  // Update return fields.
  updateReturn(id, data) {
    const returns = this.getReturns();
    const index = returns.findIndex(r => r.id === Number(id));
    if (index === -1) return null;
    returns[index] = { ...returns[index], ...data, modifiedDate: new Date().toISOString() };
    this._set(STORAGE_KEYS.returns, returns);
    return returns[index];
  }

  // Process a return: apply credit to customer account.
  // WHY: Processing marks the return as complete and reduces customer balance.
  // This is the return equivalent of "Delivered" for orders.
  processReturn(id) {
    const ret = this.getReturn(id);
    if (!ret) return null;
    if (ret.status === 'Processed') {
      throw new Error('Return already processed');
    }

    // WHY: Apply credit to the parent account (same as order billing).
    const customer = this.getCustomer(ret.customerId);
    const accountId = customer?.parentId || ret.customerId;
    const accountCustomer = this.getCustomer(accountId);

    if (accountCustomer) {
      // WHY: Subtract return total from balance (credit the customer).
      const newBalance = Math.max(0, (accountCustomer.balance || 0) - ret.grandTotal);
      this.updateCustomer(accountId, { balance: newBalance });
    }

    // Mark return as processed
    const updated = this.updateReturn(id, {
      status: 'Processed',
      processedDate: new Date().toISOString().split('T')[0],
      creditApplied: true,
    });

    // Activity
    const displayName = customer?.isBranch
      ? `${accountCustomer?.name || ''} (${customer.name})`
      : (customer?.name || 'Unknown');
    this._addActivity({
      type: 'return',
      text: `Return #${ret.returnNumber} processed — ${displayName} ($${ret.grandTotal.toFixed(2)} credit)`,
      linkTo: `/returns/${id}`,
    });

    return updated;
  }

  // Get returns linked to a specific original order.
  getReturnsForOrder(orderId) {
    return this.getReturns().filter(r => r.originalOrderId === Number(orderId));
  }

  // Get damaged items across all returns for reporting.
  getDamagedItems(customerId) {
    const returns = customerId ? this.getReturns(customerId) : this.getReturns();
    const damaged = [];
    for (const ret of returns) {
      for (const item of ret.lineItems) {
        if (item.isDamaged) {
          damaged.push({
            ...item,
            returnId: ret.id,
            returnNumber: ret.returnNumber,
            customerId: ret.customerId,
            returnDate: ret.createdDate,
          });
        }
      }
    }
    return damaged;
  }
}

export default MockStorageService;
