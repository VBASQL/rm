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
//   [2026-03-13] #001 Added: createInvoice, updateInvoice, getAlerts,
//     getMostOrderedProducts, duplicateOrder, reduceCustomerCredit,
//     updateOrderStatus (auto-invoice on Delivered), getDiscountSettings,
//     updateDiscountSettings. Added discountSettings storage key.
//     Removed Shipped from valid status transitions.
//   [2026-03-12] Initial creation.
// ============================================================
import StorageService from './StorageService';
import { CUSTOMERS, PRODUCTS, CATEGORIES, ORDERS, INVOICES, PAYMENTS, FAVORITES, RECENT_ACTIVITY, DEFAULT_DISCOUNT_SETTINGS } from '../data/mockData';

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
  seeded: 'wholesaleErp_seeded',
};

class MockStorageService extends StorageService {
  constructor() {
    super();
    this._seedIfNeeded();
  }

  // WHY: Seed once on first app load. Subsequent loads use existing
  // localStorage data so user changes persist across refreshes.
  _seedIfNeeded() {
    if (!localStorage.getItem(STORAGE_KEYS.seeded)) {
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
      localStorage.setItem(STORAGE_KEYS.seeded, 'true');
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
      ...data,
      // WHY: New customers are ALWAYS prepaid. Salesperson cannot grant credit.
      // Only accounting can change this later. See BUILD_PLAN.md §5.4.
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

    // WHY: Update customer's lastOrderDate to keep dashboard stats current.
    if (data.customerId) {
      this.updateCustomer(data.customerId, {
        lastOrderDate: now.split('T')[0],
      });
    }

    // WHY: Add to recent activity feed for dashboard.
    const customer = this.getCustomer(data.customerId);
    this._addActivity({
      type: 'order',
      text: `Order #${orderNum} placed — ${customer?.name || 'Unknown'}`,
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
      const invoice = this.createInvoice({
        orderId: order.id,
        customerId: order.customerId,
        lineItems: order.lineItems,
        subtotal: order.subtotal,
        depositTotal: order.depositTotal,
        discountTotal: order.discountTotal,
        grandTotal: order.grandTotal,
        totalCases: order.totalCases,
      });

      // WHY: Update customer balance — they now owe this amount.
      const customer = this.getCustomer(order.customerId);
      if (customer) {
        this.updateCustomer(order.customerId, {
          balance: (customer.balance || 0) + order.grandTotal,
        });
      }

      this._addActivity({
        type: 'delivery',
        text: `Delivery confirmed — ${customer?.name || 'Unknown'} (Invoice #${invoice.invoiceNumber})`,
        linkTo: `/orders/${order.id}`,
      });
    }

    return updated;
  }

  // [MOD #001] Returns products sorted by how often they appear in orders.
  // WHY: "Most Ordered" tab in NewOrder shows salesperson's most-used products first.
  getMostOrderedProducts() {
    const orders = this.getOrders();
    const productCounts = {};

    for (const order of orders) {
      if (order.status === 'Cancelled') continue;
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

  // [MOD #001] Invoice creation — called automatically when order status → Delivered.
  createInvoice(data) {
    const invoices = this.getInvoices();
    const newId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const invNum = `INV-${today}-${String(newId).padStart(3, '0')}`;

    // WHY: Default due date is 30 days from creation for credit customers.
    // Prepaid customers get same-day due date (already paid).
    const customer = data.customerId ? this.getCustomer(data.customerId) : null;
    const daysUntilDue = customer?.paymentType === 'prepaid' ? 0 : 30;
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

    // WHY: When payment is applied to invoices, update each invoice's
    // amountPaid and status. See BUILD_PLAN.md §5.9 Payment Behavior.
    if (data.appliedTo && data.appliedTo.length > 0) {
      const invoices = this._get(STORAGE_KEYS.invoices);
      for (const application of data.appliedTo) {
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
      this._set(STORAGE_KEYS.invoices, invoices);
    }

    // WHY: Update customer balance after payment.
    if (data.customerId) {
      const customer = this.getCustomer(data.customerId);
      if (customer) {
        const appliedAmount = (data.appliedTo || []).reduce((sum, a) => sum + a.amount, 0);
        const unapplied = data.amount - appliedAmount;
        this.updateCustomer(data.customerId, {
          balance: Math.max(0, customer.balance - appliedAmount),
          accountCredit: (customer.accountCredit || 0) + Math.max(0, unapplied),
        });
      }

      this._addActivity({
        type: 'payment',
        text: `Payment $${data.amount.toFixed(2)} collected — ${customer?.name || 'Unknown'}`,
        linkTo: `/customers/${data.customerId}`,
      });
    }

    return payment;
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
  // WHY: Allows resetting to seed data for testing. Not exposed in UI.
  resetToSeedData() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    this._seedIfNeeded();
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
}

export default MockStorageService;
