// ============================================================
// FILE: StorageService.js
// PURPOSE: Abstract storage interface. All data access goes through this.
//          Concrete implementations: MockStorageService (Phase 1),
//          ApiStorageService (Phase 3 — real server).
// DEPENDS ON: Nothing
// DEPENDED ON BY: MockStorageService.js, all pages/components that read/write data
//
// WHY THIS EXISTS:
//   Abstraction layer so pages never know WHERE data comes from.
//   Phase 1 uses localStorage. Phase 3 uses API calls.
//   Zero page code changes when switching. See BUILD_PLAN.md §4.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] #branch Added branch operations — getBranches, createBranch,
//     getAccountOrders. Branches are delivery locations under a parent account,
//     sharing the account's credit/balance/terms but with their own address.
//   [2026-03-13] #001 Added invoice CRUD, alerts, discount settings, order status
//     transitions, most-ordered products, duplicate order, credit limit reduction,
//     payment history. Removed Shipped status — flow is now Picking → Delivered.
//   [2026-03-12] Initial creation.
// ============================================================

class StorageService {
  // ── Customer Operations ──────────────────────────────────
  getCustomers() { throw new Error('StorageService.getCustomers not implemented'); }
  getCustomer(_id) { throw new Error('StorageService.getCustomer not implemented'); }
  createCustomer(_data) { throw new Error('StorageService.createCustomer not implemented'); }
  updateCustomer(_id, _data) { throw new Error('StorageService.updateCustomer not implemented'); }

  // WHY: Salesperson can only reduce credit — never raise. Setting to 0 = prepaid.
  // Accounting will control increases when backend is live.
  reduceCustomerCredit(_id, _newLimit) { throw new Error('StorageService.reduceCustomerCredit not implemented'); }

  // [MOD #branch] Branch operations.
  // WHY: Branches are delivery locations under a parent account.
  // They share the account's credit limit, balance, and payment terms
  // but have their own address, contact, phone, and email.
  // All financial tracking (invoices, payments, balance) flows through the parent.
  getBranches(_parentId) { throw new Error('StorageService.getBranches not implemented'); }
  createBranch(_parentId, _data) { throw new Error('StorageService.createBranch not implemented'); }

  // WHY: Returns all orders placed for a parent account including any of its branches.
  // Use this when displaying the account-level order history on the parent profile.
  getAccountOrders(_customerId) { throw new Error('StorageService.getAccountOrders not implemented'); }

  // WHY: Returns the account (parent) customer ID for any customer.
  // For a branch: returns parentId. For a parent/standalone: returns its own id.
  getAccountId(_customerId) { throw new Error('StorageService.getAccountId not implemented'); }

  // ── Product Operations ───────────────────────────────────
  getProducts() { throw new Error('StorageService.getProducts not implemented'); }
  getProductsByCategory(_categoryId) { throw new Error('StorageService.getProductsByCategory not implemented'); }
  getCategories() { throw new Error('StorageService.getCategories not implemented'); }

  // ── Order Operations ─────────────────────────────────────
  getOrders(_customerId) { throw new Error('StorageService.getOrders not implemented'); }
  getOrder(_id) { throw new Error('StorageService.getOrder not implemented'); }
  createOrder(_data) { throw new Error('StorageService.createOrder not implemented'); }
  updateOrder(_id, _data) { throw new Error('StorageService.updateOrder not implemented'); }

  // WHY: Status flow is Draft → Submitted → Picking → Delivered → (invoice auto-created).
  // Shipped was removed — after picking, goods go directly to delivery.
  // Once status = Picking, order is locked from further edits.
  // When status changes to Delivered, an invoice is auto-generated.
  updateOrderStatus(_id, _newStatus) { throw new Error('StorageService.updateOrderStatus not implemented'); }

  // WHY: Returns products sorted by how often they appear in this customer's
  // committed orders (Delivered/Picking/Submitted). customerId is required so
  // the "Top" tab shows THAT customer's buying pattern, not global frequency.
  // [MOD #salesReport] Added customerId param — was _salespersonId (unused).
  getMostOrderedProducts(_customerId) { throw new Error('StorageService.getMostOrderedProducts not implemented'); }

  // WHY: Deep-copies line items from an existing order into a new draft.
  // targetCustomerId is optional — if null, uses the original order's customer.
  duplicateOrder(_orderId, _targetCustomerId) { throw new Error('StorageService.duplicateOrder not implemented'); }

  // ── Invoice Operations ───────────────────────────────────
  getInvoices(_customerId) { throw new Error('StorageService.getInvoices not implemented'); }
  getInvoice(_id) { throw new Error('StorageService.getInvoice not implemented'); }
  createInvoice(_data) { throw new Error('StorageService.createInvoice not implemented'); }
  updateInvoice(_id, _data) { throw new Error('StorageService.updateInvoice not implemented'); }

  // ── Payment Operations ───────────────────────────────────
  getPayments(_customerId) { throw new Error('StorageService.getPayments not implemented'); }
  createPayment(_data) { throw new Error('StorageService.createPayment not implemented'); }

  // [MOD #004] Get orders with unpaid balance (for payment collection page)
  getUnpaidOrders(_customerId) { throw new Error('StorageService.getUnpaidOrders not implemented'); }

  // [MOD #004] Apply customer's account credit to order or invoice
  applyAccountCredit(_customerId, _targetType, _targetId, _amount) { throw new Error('StorageService.applyAccountCredit not implemented'); }

  // ── Alerts ───────────────────────────────────────────────
  // WHY: Dynamically computed from data — overdue invoices, over-credit-limit,
  // accounts on hold. Each alert has a linkTo for navigation.
  getAlerts() { throw new Error('StorageService.getAlerts not implemented'); }

  // ── Discount Settings ────────────────────────────────────
  // WHY: 4-level caps (per-item fixed, per-item %, per-order fixed, per-order %)
  // editable from Settings page. Defaults provided; accounting controls later.
  getDiscountSettings() { throw new Error('StorageService.getDiscountSettings not implemented'); }
  updateDiscountSettings(_data) { throw new Error('StorageService.updateDiscountSettings not implemented'); }
  // ── Delivery Days ──────────────────────────────────────────
  // WHY: Array of weekday numbers (0–6) on which deliveries are available.
  // In production set by the warehouse. In demo: configurable from Settings.
  // [MOD #demo-delivery] Added.
  getDeliveryDays() { throw new Error('StorageService.getDeliveryDays not implemented'); }
  updateDeliveryDays(_days) { throw new Error('StorageService.updateDeliveryDays not implemented'); }
  // ── Favorites ────────────────────────────────────────────
  getFavorites(_customerId) { throw new Error('StorageService.getFavorites not implemented'); }
  setFavorites(_customerId, _productIds) { throw new Error('StorageService.setFavorites not implemented'); }

  // ── User ─────────────────────────────────────────────────
  getCurrentUser() { throw new Error('StorageService.getCurrentUser not implemented'); }
}

export default StorageService;
