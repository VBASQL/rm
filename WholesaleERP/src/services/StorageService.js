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
//   [2026-03-12] Initial creation.
// ============================================================

class StorageService {
  // ── Customer Operations ──────────────────────────────────
  getCustomers() { throw new Error('StorageService.getCustomers not implemented'); }
  getCustomer(_id) { throw new Error('StorageService.getCustomer not implemented'); }
  createCustomer(_data) { throw new Error('StorageService.createCustomer not implemented'); }
  updateCustomer(_id, _data) { throw new Error('StorageService.updateCustomer not implemented'); }

  // ── Product Operations ───────────────────────────────────
  getProducts() { throw new Error('StorageService.getProducts not implemented'); }
  getProductsByCategory(_categoryId) { throw new Error('StorageService.getProductsByCategory not implemented'); }
  getCategories() { throw new Error('StorageService.getCategories not implemented'); }

  // ── Order Operations ─────────────────────────────────────
  getOrders(_customerId) { throw new Error('StorageService.getOrders not implemented'); }
  getOrder(_id) { throw new Error('StorageService.getOrder not implemented'); }
  createOrder(_data) { throw new Error('StorageService.createOrder not implemented'); }
  updateOrder(_id, _data) { throw new Error('StorageService.updateOrder not implemented'); }

  // ── Invoice Operations ───────────────────────────────────
  getInvoices(_customerId) { throw new Error('StorageService.getInvoices not implemented'); }
  getInvoice(_id) { throw new Error('StorageService.getInvoice not implemented'); }

  // ── Payment Operations ───────────────────────────────────
  getPayments(_customerId) { throw new Error('StorageService.getPayments not implemented'); }
  createPayment(_data) { throw new Error('StorageService.createPayment not implemented'); }

  // ── Favorites ────────────────────────────────────────────
  getFavorites(_customerId) { throw new Error('StorageService.getFavorites not implemented'); }
  setFavorites(_customerId, _productIds) { throw new Error('StorageService.setFavorites not implemented'); }

  // ── User ─────────────────────────────────────────────────
  getCurrentUser() { throw new Error('StorageService.getCurrentUser not implemented'); }
}

export default StorageService;
