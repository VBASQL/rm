// ============================================================
// FILE: mockData.js
// PURPOSE: Seed data for Phase 1 development. Realistic wholesale
//          beverage distribution data: customers, products, orders,
//          invoices, payments.
// DEPENDS ON: Nothing
// DEPENDED ON BY: MockStorageService.js
//
// WHY THIS EXISTS:
//   Phase 1 has no backend. This seed data lets every page, modal,
//   and workflow be tested with realistic scenarios. Includes edge
//   cases: overdue customers, partial payments, multi-location accounts.
//
// ⚠️ WARNING: Product categories and exact products are placeholder.
//   User will provide exact catalog later (BUILD_PLAN.md §12, item #1).
//   Deposit rates are estimated (§12, item #6).
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-15] #unitPrice Added unitPrice to all seed lineItems (ORDERS, INVOICES,
//     RETURNS). Bumped SEED_VERSION to v6 to force re-seed.
//   [2026-03-14] #demo-delivery Added DEFAULT_DELIVERY_DAYS for warehouse schedule demo.
//   [2026-03-14] #branch Added branch customer records for multi-location accounts.
//     Branches share the parent account's credit/balance/terms but have
//     their own delivery address, contact, phone, and email.
//     Bumped SEED_VERSION to 'v3' to force re-seed with branch data (was v2 before branches were in CUSTOMERS array).
//   [2026-03-13] #001 Removed 'Shipped' status from order seed data (now Picking).
//     Added DEFAULT_DISCOUNT_SETTINGS for 4-level discount caps.
//     Added [MOD] tags to RECENT_ACTIVITY linkTo.
//   [2026-03-12] Initial creation — placeholder catalog.
// ============================================================

// WHY: Seed version controls force-reseed when new seed data is added.
// Increment this string whenever CUSTOMERS/PRODUCTS/ORDERS change shape.
// MockStorageService checks this and reseeds if version doesn't match.
// [MOD #catalog] Bumped to v5 — replaced placeholder catalog with real product catalog from CSV.
// [MOD #unitPrice] Bumped to v6 — added unitPrice to all seed lineItems.
export const SEED_VERSION = 'v6';

// ── CATEGORIES ───────────────────────────────────────────────
// WHY: Categories mirror the real product catalog provided by the business.
// In production these will come from the server and change often.
// Category IDs are stable references used by PRODUCTS.categoryId.
export const CATEGORIES = [
  { id: 1, name: '28oz Glass', icon: '🥂', sortOrder: 1 },
  { id: 2, name: '1 Liter Seltzer', icon: '💧', sortOrder: 2 },
  { id: 3, name: '1 Liter Flavor', icon: '🍶', sortOrder: 3 },
  { id: 4, name: '2 Liter Flavor', icon: '🍾', sortOrder: 4 },
  { id: 5, name: 'Flavored Seltzer', icon: '✨', sortOrder: 5 },
  { id: 6, name: 'Cans 12 Pack', icon: '🥫', sortOrder: 6 },
  { id: 7, name: 'Cans 24 Pack', icon: '🥤', sortOrder: 7 },
  { id: 8, name: '16.9oz Vichy', icon: '💦', sortOrder: 8 },
  { id: 9, name: '16.9oz Flavor', icon: '🧴', sortOrder: 9 },
  { id: 10, name: 'Spring Water', icon: '🫧', sortOrder: 10 },
  { id: 11, name: 'Ice Tea & Drinks', icon: '🍵', sortOrder: 11 },
  { id: 12, name: 'Clear Flavor', icon: '🔮', sortOrder: 12 },
  { id: 13, name: 'Syrup Gallons', icon: '🪣', sortOrder: 13 },
  { id: 14, name: 'Syrup Containers', icon: '🫙', sortOrder: 14 },
  { id: 15, name: 'Kids Drinks', icon: '🧃', sortOrder: 15 },
  { id: 16, name: 'First Class', icon: '⭐', sortOrder: 16 },
  { id: 17, name: '10x Energy', icon: '⚡', sortOrder: 17 },
  { id: 18, name: 'Halo2', icon: '💎', sortOrder: 18 },
  { id: 19, name: 'Yo Bev', icon: '🥝', sortOrder: 19 },
];

// ── PRODUCTS ─────────────────────────────────────────────────
// WHY: Real product catalog from business CSV.
// Prices, deposits, and stock are mock estimates — business will provide actuals.
// In production, products come from the server API and update frequently.
// ⚠️ WARNING: Product IDs are referenced by ORDERS, INVOICES, RETURNS, FAVORITES.
// Changing IDs here requires updating those references or bumping SEED_VERSION.
export const PRODUCTS = [
  // ── 28oz Glass (categoryId: 1) ──
  { id: 1, code: '10001', name: 'Glass Cola', flavor: 'Cola', categoryId: 1, size: '28oz Bottle', material: 'Glass', packSize: '24-pack', unitsPerCase: 24, casePrice: 19.99, unitPrice: 0.83, depositPerCase: 6.00, stock: 120, overStockLimit: 40, status: 'Active' },
  { id: 2, code: '10002', name: 'Glass Diet Cola', flavor: 'Diet Cola', categoryId: 1, size: '28oz Bottle', material: 'Glass', packSize: '24-pack', unitsPerCase: 24, casePrice: 19.99, unitPrice: 0.83, depositPerCase: 6.00, stock: 80, overStockLimit: 30, status: 'Active' },
  { id: 3, code: '10003', name: 'Glass Ginger Ale', flavor: 'Ginger Ale', categoryId: 1, size: '28oz Bottle', material: 'Glass', packSize: '24-pack', unitsPerCase: 24, casePrice: 19.99, unitPrice: 0.83, depositPerCase: 6.00, stock: 60, overStockLimit: 25, status: 'Active' },
  { id: 4, code: '10004', name: 'Glass Seltzer', flavor: 'Seltzer', categoryId: 1, size: '28oz Bottle', material: 'Glass', packSize: '24-pack', unitsPerCase: 24, casePrice: 18.99, unitPrice: 0.79, depositPerCase: 6.00, stock: 100, overStockLimit: 35, status: 'Active' },
  { id: 5, code: '10005', name: 'Glass Vichy', flavor: 'Vichy', categoryId: 1, size: '30oz Bottle', material: 'Glass', packSize: '24-pack', unitsPerCase: 24, casePrice: 20.99, unitPrice: 0.87, depositPerCase: 6.00, stock: 50, overStockLimit: 20, status: 'Active' },

  // ── 1 Liter Seltzer (categoryId: 2) ──
  { id: 6, code: '11001', name: '1 Liter Seltzer', flavor: 'Plain', categoryId: 2, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 8.99, unitPrice: 0.75, depositPerCase: 0.60, stock: 200, overStockLimit: 80, status: 'Active' },

  // ── 1 Liter Flavor (categoryId: 3) ──
  { id: 7, code: '12001', name: 'Black Cherry', flavor: 'Regular', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 90, overStockLimit: 30, status: 'Active' },
  { id: 8, code: '12002', name: 'Cola', flavor: 'Regular', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 150, overStockLimit: 50, status: 'Active' },
  { id: 9, code: '12003', name: 'Black Cherry', flavor: 'Diet', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 60, overStockLimit: 20, status: 'Active' },
  { id: 10, code: '12004', name: 'Cola', flavor: 'Diet', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 120, overStockLimit: 40, status: 'Active' },
  { id: 11, code: '12005', name: 'Ginger Ale', flavor: 'Diet', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 70, overStockLimit: 25, status: 'Active' },
  { id: 12, code: '12006', name: 'Half & Half', flavor: 'Diet', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 13, code: '12007', name: 'Lemon', flavor: 'Diet', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 65, overStockLimit: 22, status: 'Active' },
  { id: 14, code: '12008', name: 'Orange', flavor: 'Diet', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 50, overStockLimit: 18, status: 'Active' },
  { id: 15, code: '12009', name: 'Fruit Punch', flavor: 'Regular', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 75, overStockLimit: 25, status: 'Active' },
  { id: 16, code: '12010', name: 'Ginger Ale', flavor: 'Regular', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 85, overStockLimit: 30, status: 'Active' },
  { id: 17, code: '12011', name: 'Half & Half', flavor: 'Regular', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 70, overStockLimit: 25, status: 'Active' },
  { id: 18, code: '12012', name: 'Lemon', flavor: 'Regular', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 80, overStockLimit: 28, status: 'Active' },
  { id: 19, code: '12013', name: 'Orange', flavor: 'Regular', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 65, overStockLimit: 22, status: 'Active' },
  { id: 20, code: '12014', name: 'Pineapple', flavor: 'Regular', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 21, code: '12015', name: 'Cola', flavor: 'Zero', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 100, overStockLimit: 35, status: 'Active' },
  { id: 22, code: '12016', name: 'Ginger Ale', flavor: 'Zero', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 23, code: '12017', name: 'Half & Half', flavor: 'Zero', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 40, overStockLimit: 15, status: 'Active' },
  { id: 24, code: '12018', name: 'Lemon', flavor: 'Zero', categoryId: 3, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 50, overStockLimit: 18, status: 'Active' },

  // ── 2 Liter Flavor (categoryId: 4) ──
  { id: 25, code: '13001', name: 'Black Cherry', flavor: 'Regular', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 60, overStockLimit: 20, status: 'Active' },
  { id: 26, code: '13002', name: 'Cola', flavor: 'Regular', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 100, overStockLimit: 35, status: 'Active' },
  { id: 27, code: '13003', name: 'Black Cherry', flavor: 'Diet', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 40, overStockLimit: 15, status: 'Active' },
  { id: 28, code: '13004', name: 'Cola', flavor: 'Diet', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 80, overStockLimit: 28, status: 'Active' },
  { id: 29, code: '13005', name: 'Ginger Ale', flavor: 'Diet', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 30, code: '13006', name: 'Half & Half', flavor: 'Diet', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 35, overStockLimit: 12, status: 'Active' },
  { id: 31, code: '13007', name: 'Lemon', flavor: 'Diet', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 50, overStockLimit: 18, status: 'Active' },
  { id: 32, code: '13008', name: 'Orange', flavor: 'Diet', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 30, overStockLimit: 10, status: 'Active' },
  { id: 33, code: '13009', name: 'Fruit Punch', flavor: 'Regular', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 34, code: '13010', name: 'Ginger Ale', flavor: 'Regular', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 65, overStockLimit: 22, status: 'Active' },
  { id: 35, code: '13011', name: 'Half & Half', flavor: 'Regular', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 36, code: '13012', name: 'Lemon', flavor: 'Regular', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 60, overStockLimit: 20, status: 'Active' },
  { id: 37, code: '13013', name: 'Orange', flavor: 'Regular', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 50, overStockLimit: 18, status: 'Active' },
  { id: 38, code: '13014', name: 'Pineapple', flavor: 'Regular', categoryId: 4, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.30, stock: 35, overStockLimit: 12, status: 'Active' },

  // ── Flavored Seltzer (categoryId: 5) ──
  { id: 39, code: '14001', name: 'Cherry Seltzer', flavor: 'Cherry', categoryId: 5, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 80, overStockLimit: 28, status: 'Active' },
  { id: 40, code: '14002', name: 'Lemon Seltzer', flavor: 'Lemon', categoryId: 5, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 90, overStockLimit: 30, status: 'Active' },
  { id: 41, code: '14003', name: 'Mandarin Seltzer', flavor: 'Mandarin', categoryId: 5, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 65, overStockLimit: 22, status: 'Active' },
  { id: 42, code: '14004', name: 'Raspberry Lime Seltzer', flavor: 'Raspberry Lime', categoryId: 5, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 43, code: '14005', name: 'Strawberry Seltzer', flavor: 'Strawberry', categoryId: 5, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 70, overStockLimit: 25, status: 'Active' },

  // ── Cans 12 Pack (categoryId: 6) — no products yet ──

  // ── Cans 24 Pack (categoryId: 7) ──
  { id: 44, code: '16001', name: 'Black Cherry', flavor: 'Regular', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 13.49, unitPrice: 0.56, depositPerCase: 1.20, stock: 85, overStockLimit: 30, status: 'Active' },
  { id: 45, code: '16002', name: 'Cola', flavor: 'Regular', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, stock: 160, overStockLimit: 55, status: 'Active' },
  { id: 46, code: '16003', name: 'Diet Grapefruit Lemon', flavor: 'Diet', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 13.49, unitPrice: 0.56, depositPerCase: 1.20, stock: 40, overStockLimit: 15, status: 'Active' },
  { id: 47, code: '16004', name: 'Fruit Punch', flavor: 'Regular', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, stock: 70, overStockLimit: 25, status: 'Active' },
  { id: 48, code: '16005', name: 'Ginger Ale', flavor: 'Regular', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, stock: 90, overStockLimit: 32, status: 'Active' },
  { id: 49, code: '16006', name: 'Lemon', flavor: 'Regular', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, stock: 95, overStockLimit: 35, status: 'Active' },
  { id: 50, code: '16007', name: 'Lemon Seltzer', flavor: 'Seltzer', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 10.99, unitPrice: 0.46, depositPerCase: 1.20, stock: 110, overStockLimit: 40, status: 'Active' },
  { id: 51, code: '16008', name: 'Mix', flavor: 'Variety', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 13.99, unitPrice: 0.58, depositPerCase: 1.20, stock: 50, overStockLimit: 18, status: 'Active' },
  { id: 52, code: '16009', name: 'Mandarin Seltzer', flavor: 'Seltzer', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 10.99, unitPrice: 0.46, depositPerCase: 1.20, stock: 75, overStockLimit: 28, status: 'Active' },
  { id: 53, code: '16010', name: 'Orange', flavor: 'Regular', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 12.49, unitPrice: 0.52, depositPerCase: 1.20, stock: 80, overStockLimit: 28, status: 'Active' },
  { id: 54, code: '16011', name: 'Pineapple', flavor: 'Regular', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 12.49, unitPrice: 0.52, depositPerCase: 1.20, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 55, code: '16012', name: 'Seltzer', flavor: 'Plain', categoryId: 7, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 9.99, unitPrice: 0.42, depositPerCase: 1.20, stock: 200, overStockLimit: 70, status: 'Active' },

  // ── 16.9oz Vichy (categoryId: 8) ──
  { id: 56, code: '17001', name: 'Vichy Water', flavor: 'Plain', categoryId: 8, size: '16.9oz Bottle', material: 'Plastic', packSize: '24-pack', unitsPerCase: 24, casePrice: 7.99, unitPrice: 0.33, depositPerCase: 1.20, stock: 130, overStockLimit: 45, status: 'Active' },

  // ── 16.9oz Flavor (categoryId: 9) ──
  { id: 57, code: '18001', name: 'Cola', flavor: 'Regular', categoryId: 9, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 100, overStockLimit: 35, status: 'Active' },
  { id: 58, code: '18002', name: 'Kiwi Strawberry Clear', flavor: 'Kiwi Strawberry', categoryId: 9, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 59, code: '18003', name: 'Cherry Clear', flavor: 'Cherry', categoryId: 9, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 60, overStockLimit: 22, status: 'Active' },
  { id: 60, code: '18004', name: 'Cola', flavor: 'Diet', categoryId: 9, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 75, overStockLimit: 28, status: 'Active' },
  { id: 61, code: '18005', name: 'Half & Half', flavor: 'Diet', categoryId: 9, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 40, overStockLimit: 15, status: 'Active' },
  { id: 62, code: '18006', name: 'Fruit Punch', flavor: 'Regular', categoryId: 9, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 65, overStockLimit: 22, status: 'Active' },
  { id: 63, code: '18007', name: 'Ginger Ale', flavor: 'Regular', categoryId: 9, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 70, overStockLimit: 25, status: 'Active' },
  { id: 64, code: '18008', name: 'Half & Half', flavor: 'Regular', categoryId: 9, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 50, overStockLimit: 18, status: 'Active' },
  { id: 65, code: '18009', name: 'Orange', flavor: 'Regular', categoryId: 9, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 66, code: '18010', name: 'Pineapple', flavor: 'Regular', categoryId: 9, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 40, overStockLimit: 15, status: 'Active' },

  // ── Spring Water (categoryId: 10) ──
  { id: 67, code: '19001', name: 'Spring Water 1.5L', flavor: 'Plain', categoryId: 10, size: '1.5L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 9.99, unitPrice: 0.83, depositPerCase: 0.60, stock: 120, overStockLimit: 40, status: 'Active' },
  { id: 68, code: '19002', name: 'Spring Water 16.9oz', flavor: 'Plain', categoryId: 10, size: '16.9oz Bottle', material: 'Plastic', packSize: '24-pack', unitsPerCase: 24, casePrice: 6.99, unitPrice: 0.29, depositPerCase: 1.20, stock: 300, overStockLimit: 100, status: 'Active' },
  { id: 69, code: '19003', name: 'Spring Water 24oz', flavor: 'Plain', categoryId: 10, size: '24oz Bottle', material: 'Plastic', packSize: '24-pack', unitsPerCase: 24, casePrice: 8.99, unitPrice: 0.37, depositPerCase: 1.20, stock: 150, overStockLimit: 50, status: 'Active' },
  { id: 70, code: '19004', name: 'Spring Water 8oz', flavor: 'Plain', categoryId: 10, size: '8oz Bottle', material: 'Plastic', packSize: '32-pack', unitsPerCase: 32, casePrice: 5.99, unitPrice: 0.19, depositPerCase: 1.60, stock: 180, overStockLimit: 60, status: 'Active' },
  { id: 71, code: '19005', name: 'Rehydrate Water', flavor: 'Electrolyte', categoryId: 10, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unitsPerCase: 24, casePrice: 14.99, unitPrice: 0.62, depositPerCase: 1.20, stock: 80, overStockLimit: 28, status: 'Active' },
  { id: 72, code: '19006', name: 'Spring Water Gallon', flavor: 'Plain', categoryId: 10, size: '1 Gallon', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 11.99, unitPrice: 2.00, depositPerCase: 0.30, stock: 90, overStockLimit: 30, status: 'Active' },
  { id: 73, code: '19007', name: 'Truck Gallon Spring Water', flavor: 'Plain', categoryId: 10, size: '1 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 3.99, unitPrice: 3.99, depositPerCase: 0.00, stock: 500, overStockLimit: 150, status: 'Active' },

  // ── Ice Tea & Drinks (categoryId: 11) ──
  { id: 74, code: '20001', name: '10+1 Drinks', flavor: 'Variety', categoryId: 11, size: 'Variety Pack', material: 'Plastic', packSize: '11-pack', unitsPerCase: 11, casePrice: 14.99, unitPrice: 1.36, depositPerCase: 0.55, stock: 60, overStockLimit: 20, status: 'Active' },
  { id: 75, code: '20002', name: 'Fruit Drink', flavor: 'Fruit Punch', categoryId: 11, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 70, overStockLimit: 25, status: 'Active' },
  { id: 76, code: '20003', name: 'Fruit Drink', flavor: 'Kiwi Strawberry', categoryId: 11, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 50, overStockLimit: 18, status: 'Active' },
  { id: 77, code: '20004', name: 'Fruit Drink', flavor: 'Mango', categoryId: 11, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 78, code: '20005', name: 'Flavored Water', flavor: 'Apple', categoryId: 11, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 65, overStockLimit: 22, status: 'Active' },
  { id: 79, code: '20006', name: 'Flavored Water', flavor: 'Lemon', categoryId: 11, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 75, overStockLimit: 28, status: 'Active' },
  { id: 80, code: '20007', name: 'Flavored Water', flavor: 'Raspberry', categoryId: 11, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 81, code: '20008', name: 'Ice Tea', flavor: 'Lemon', categoryId: 11, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 90, overStockLimit: 32, status: 'Active' },
  { id: 82, code: '20009', name: 'Ice Tea', flavor: 'Peach', categoryId: 11, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 80, overStockLimit: 28, status: 'Active' },
  { id: 83, code: '20010', name: 'Ice Tea', flavor: 'Strawberry', categoryId: 11, size: '16.9oz Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, stock: 60, overStockLimit: 22, status: 'Active' },

  // ── Clear Flavor (categoryId: 12) ──
  { id: 84, code: '21001', name: 'Cherry Clear', flavor: 'Cherry', categoryId: 12, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 11.99, unitPrice: 1.00, depositPerCase: 0.60, stock: 70, overStockLimit: 25, status: 'Active' },
  { id: 85, code: '21002', name: 'Kiwi Strawberry Clear', flavor: 'Kiwi Strawberry', categoryId: 12, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 11.99, unitPrice: 1.00, depositPerCase: 0.60, stock: 50, overStockLimit: 18, status: 'Active' },
  { id: 86, code: '21003', name: 'Cherry Lime Clear', flavor: 'Cherry Lime', categoryId: 12, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 11.99, unitPrice: 1.00, depositPerCase: 0.60, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 87, code: '21004', name: 'Lemon Lime Clear', flavor: 'Lemon Lime', categoryId: 12, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 11.99, unitPrice: 1.00, depositPerCase: 0.60, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 88, code: '21005', name: 'Mango Passion Fruit Clear', flavor: 'Mango Passion Fruit', categoryId: 12, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 11.99, unitPrice: 1.00, depositPerCase: 0.60, stock: 40, overStockLimit: 15, status: 'Active' },
  { id: 89, code: '21006', name: 'Mixed Raspberry Clear', flavor: 'Mixed Raspberry', categoryId: 12, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 11.99, unitPrice: 1.00, depositPerCase: 0.60, stock: 50, overStockLimit: 18, status: 'Active' },
  { id: 90, code: '21007', name: 'Peach Clear', flavor: 'Peach', categoryId: 12, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 11.99, unitPrice: 1.00, depositPerCase: 0.60, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 91, code: '21008', name: 'Pomegranate Cranberry Clear', flavor: 'Pomegranate Cranberry', categoryId: 12, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 11.99, unitPrice: 1.00, depositPerCase: 0.60, stock: 35, overStockLimit: 12, status: 'Active' },

  // ── Syrup Gallons (categoryId: 13) ──
  { id: 92, code: '22001', name: 'Black Cherry Syrup', flavor: 'Black Cherry', categoryId: 13, size: '1 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 28.99, unitPrice: 28.99, depositPerCase: 0.00, stock: 30, overStockLimit: 10, status: 'Active' },
  { id: 93, code: '22002', name: 'Cola Syrup', flavor: 'Cola', categoryId: 13, size: '1 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 28.99, unitPrice: 28.99, depositPerCase: 0.00, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 94, code: '22003', name: 'Fruit Punch Syrup', flavor: 'Fruit Punch', categoryId: 13, size: '1 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 28.99, unitPrice: 28.99, depositPerCase: 0.00, stock: 25, overStockLimit: 8, status: 'Active' },
  { id: 95, code: '22004', name: 'Grape Syrup', flavor: 'Grape', categoryId: 13, size: '1 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 28.99, unitPrice: 28.99, depositPerCase: 0.00, stock: 20, overStockLimit: 8, status: 'Active' },
  { id: 96, code: '22005', name: 'Ginger Ale Syrup', flavor: 'Ginger Ale', categoryId: 13, size: '1 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 28.99, unitPrice: 28.99, depositPerCase: 0.00, stock: 30, overStockLimit: 10, status: 'Active' },
  { id: 97, code: '22006', name: 'Half & Half Syrup', flavor: 'Half & Half', categoryId: 13, size: '1 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 28.99, unitPrice: 28.99, depositPerCase: 0.00, stock: 25, overStockLimit: 8, status: 'Active' },
  { id: 98, code: '22007', name: 'Lemon Syrup', flavor: 'Lemon', categoryId: 13, size: '1 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 28.99, unitPrice: 28.99, depositPerCase: 0.00, stock: 30, overStockLimit: 10, status: 'Active' },
  { id: 99, code: '22008', name: 'Orange Syrup', flavor: 'Orange', categoryId: 13, size: '1 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 28.99, unitPrice: 28.99, depositPerCase: 0.00, stock: 22, overStockLimit: 8, status: 'Active' },
  { id: 100, code: '22009', name: 'Pineapple Syrup', flavor: 'Pineapple', categoryId: 13, size: '1 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 28.99, unitPrice: 28.99, depositPerCase: 0.00, stock: 18, overStockLimit: 6, status: 'Active' },

  // ── Syrup Containers (categoryId: 14) ──
  { id: 101, code: '23001', name: 'Cola Syrup Container', flavor: 'Cola', categoryId: 14, size: '5 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 69.99, unitPrice: 69.99, depositPerCase: 0.00, stock: 15, overStockLimit: 5, status: 'Active' },
  { id: 102, code: '23002', name: 'Ginger Ale Syrup Container', flavor: 'Ginger Ale', categoryId: 14, size: '5 Gallon', material: 'Plastic', packSize: 'Single', unitsPerCase: 1, casePrice: 69.99, unitPrice: 69.99, depositPerCase: 0.00, stock: 12, overStockLimit: 4, status: 'Active' },

  // ── Kids Drinks (categoryId: 15) — no products yet ──

  // ── First Class (categoryId: 16) ──
  { id: 103, code: '25001', name: 'FC Seltzer', flavor: 'Plain', categoryId: 16, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 14.99, unitPrice: 1.25, depositPerCase: 0.60, stock: 70, overStockLimit: 25, status: 'Active' },
  { id: 104, code: '25002', name: 'FC Cherry Seltzer', flavor: 'Cherry', categoryId: 16, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 14.99, unitPrice: 1.25, depositPerCase: 0.60, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 105, code: '25003', name: 'FC Lemon Lime Seltzer', flavor: 'Lemon Lime', categoryId: 16, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 14.99, unitPrice: 1.25, depositPerCase: 0.60, stock: 60, overStockLimit: 22, status: 'Active' },
  { id: 106, code: '25004', name: 'FC Mandarin Seltzer', flavor: 'Mandarin', categoryId: 16, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 14.99, unitPrice: 1.25, depositPerCase: 0.60, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 107, code: '25005', name: 'FC Kiwi Strawberry Seltzer', flavor: 'Kiwi Strawberry', categoryId: 16, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 14.99, unitPrice: 1.25, depositPerCase: 0.60, stock: 40, overStockLimit: 15, status: 'Active' },

  // ── 10x Energy (categoryId: 17) ──
  { id: 108, code: '26001', name: 'Blueberry', flavor: 'Regular', categoryId: 17, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 32.99, unitPrice: 1.37, depositPerCase: 1.20, stock: 60, overStockLimit: 20, status: 'Active' },
  { id: 109, code: '26002', name: 'Blueberry', flavor: 'Zero', categoryId: 17, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 32.99, unitPrice: 1.37, depositPerCase: 1.20, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 110, code: '26003', name: 'Mango', flavor: 'Regular', categoryId: 17, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 32.99, unitPrice: 1.37, depositPerCase: 1.20, stock: 50, overStockLimit: 18, status: 'Active' },
  { id: 111, code: '26004', name: 'Mango', flavor: 'Zero', categoryId: 17, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 32.99, unitPrice: 1.37, depositPerCase: 1.20, stock: 35, overStockLimit: 12, status: 'Active' },
  { id: 112, code: '26005', name: 'Peach', flavor: 'Regular', categoryId: 17, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 32.99, unitPrice: 1.37, depositPerCase: 1.20, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 113, code: '26006', name: 'Peach', flavor: 'Zero', categoryId: 17, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 32.99, unitPrice: 1.37, depositPerCase: 1.20, stock: 30, overStockLimit: 10, status: 'Active' },

  // ── Halo2 (categoryId: 18) ──
  { id: 114, code: '27001', name: 'Electrolyte Water 1.5L', flavor: 'Plain', categoryId: 18, size: '1.5L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 16.99, unitPrice: 1.42, depositPerCase: 0.60, stock: 50, overStockLimit: 18, status: 'Active' },
  { id: 115, code: '27002', name: 'Electrolyte Water 20oz', flavor: 'Plain', categoryId: 18, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unitsPerCase: 24, casePrice: 24.99, unitPrice: 1.04, depositPerCase: 1.20, stock: 75, overStockLimit: 28, status: 'Active' },

  // ── Yo Bev (categoryId: 19) ──
  { id: 116, code: '28001', name: 'Yo Bev', flavor: 'Blueberry', categoryId: 19, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 22.99, unitPrice: 0.96, depositPerCase: 1.20, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 117, code: '28002', name: 'Yo Bev', flavor: 'Ginger', categoryId: 19, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 22.99, unitPrice: 0.96, depositPerCase: 1.20, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 118, code: '28003', name: 'Yo Bev', flavor: 'Mango', categoryId: 19, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 22.99, unitPrice: 0.96, depositPerCase: 1.20, stock: 50, overStockLimit: 18, status: 'Active' },
  { id: 119, code: '28004', name: 'Yo Bev', flavor: 'Mojito', categoryId: 19, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 22.99, unitPrice: 0.96, depositPerCase: 1.20, stock: 40, overStockLimit: 15, status: 'Active' },
  { id: 120, code: '28005', name: 'Yo Bev', flavor: 'Peach Cherry', categoryId: 19, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 22.99, unitPrice: 0.96, depositPerCase: 1.20, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 121, code: '28006', name: 'Yo Bev', flavor: 'Grapefruit Mint', categoryId: 19, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 22.99, unitPrice: 0.96, depositPerCase: 1.20, stock: 35, overStockLimit: 12, status: 'Active' },
  { id: 122, code: '28007', name: 'Yo Bev', flavor: 'Watermelon Cucumber', categoryId: 19, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 22.99, unitPrice: 0.96, depositPerCase: 1.20, stock: 40, overStockLimit: 15, status: 'Active' },
];

// ── CUSTOMERS ────────────────────────────────────────────────
// WHY: Mix of credit and prepaid customers, different statuses, different
// balance scenarios to test all UI states (overdue, hold, active, etc.)
export const CUSTOMERS = [
  {
    id: 1, name: 'Bella Cucina Restaurant', code: 'BELL-001',
    contact: 'Marco Rossi', phone: '(555) 234-5678', email: 'marco@bellacucina.com',
    type: 'Restaurant', paymentType: 'credit', creditTier: 'A', balance: 8450.00,
    creditLimit: 15000, terms: 'NET-30', parentId: null,
    address: '123 Main St, Brooklyn, NY 11201', billingAddress: '123 Main St, Brooklyn, NY 11201',
    priceLevel: 'A', route: 'Route 1 - Brooklyn', status: 'Active',
    lastOrderDate: '2026-02-24', avgOrderCases: 18, accountCredit: 0,
    assignedSalesperson: 'Sarah Mitchell', notes: ['Prefers delivery before 10am', 'Always order extra cola during summer'],
    createdDate: '2024-06-15',
    // [MOD #002] Saved payment methods — customer already set up CC on file
    savedPaymentMethods: [
      { id: 'cc_1', type: 'credit_card', last4: '4242', brand: 'Visa', expiry: '12/27', isDefault: true },
    ],
  },
  {
    id: 2, name: 'Harbor Grill', code: 'HARB-001',
    contact: 'James Chen', phone: '(555) 345-6789', email: 'james@harborgrill.com',
    type: 'Restaurant', paymentType: 'credit', creditTier: 'B', balance: 3200.00,
    creditLimit: 8000, terms: 'NET-30', parentId: null,
    address: '456 Harbor Blvd, Brooklyn, NY 11231', billingAddress: '456 Harbor Blvd, Brooklyn, NY 11231',
    priceLevel: 'B', route: 'Route 1 - Brooklyn', status: 'Active',
    lastOrderDate: '2026-02-25', avgOrderCases: 12, accountCredit: 150.00,
    assignedSalesperson: 'Sarah Mitchell', notes: ['Parking in rear only'],
    createdDate: '2024-08-20',
  },
  {
    id: 3, name: 'Sunrise Deli', code: 'SUNR-001',
    contact: 'Amir Hassan', phone: '(555) 456-7890', email: 'amir@sunrisedeli.com',
    type: 'Deli', paymentType: 'credit', creditTier: 'C', balance: 12800.00,
    creditLimit: 10000, terms: 'NET-15', parentId: null,
    address: '789 Atlantic Ave, Brooklyn, NY 11238', billingAddress: '789 Atlantic Ave, Brooklyn, NY 11238',
    priceLevel: 'C', route: 'Route 2 - Downtown', status: 'Active',
    lastOrderDate: '2026-01-15', avgOrderCases: 8, accountCredit: 0,
    assignedSalesperson: 'Sarah Mitchell', notes: ['Over credit limit — collections needed', 'Owner prefers phone calls over email'],
    createdDate: '2025-01-10',
  },
  {
    id: 4, name: 'The Grand Hotel', code: 'GRAN-001',
    contact: 'Lisa Park', phone: '(555) 567-8901', email: 'purchasing@grandhotel.com',
    type: 'Hotel', paymentType: 'credit', creditTier: 'A', balance: 5600.00,
    creditLimit: 25000, terms: 'NET-30', parentId: null,
    address: '1 Plaza Drive, Manhattan, NY 10001', billingAddress: 'PO Box 100, Manhattan, NY 10001',
    priceLevel: 'A', route: 'Route 3 - Manhattan', status: 'Active',
    lastOrderDate: '2026-03-01', avgOrderCases: 35, accountCredit: 200.00,
    assignedSalesperson: 'Sarah Mitchell', notes: ['Dock delivery only — call 30 min ahead', 'Large event orders in summer'],
    createdDate: '2023-11-01',
    // [MOD #002] Has both CC and ACH on file
    savedPaymentMethods: [
      { id: 'cc_2', type: 'credit_card', last4: '1234', brand: 'Amex', expiry: '08/28', isDefault: true },
      { id: 'cc_3', type: 'credit_card', last4: '5678', brand: 'Mastercard', expiry: '03/27', isDefault: false },
      { id: 'ach_1', type: 'ach', last4: '6789', bankName: 'Chase', isDefault: true },
    ],
  },
  {
    id: 5, name: 'Fresh Bites Cafe', code: 'FRES-001',
    contact: 'Emma Wilson', phone: '(555) 678-9012', email: 'emma@freshbites.com',
    type: 'Cafe', paymentType: 'prepaid', creditTier: null, balance: 0,
    creditLimit: 0, terms: 'Prepaid', parentId: null,
    address: '321 Court St, Brooklyn, NY 11231', billingAddress: '321 Court St, Brooklyn, NY 11231',
    priceLevel: 'C', route: 'Route 1 - Brooklyn', status: 'Active',
    lastOrderDate: '2026-03-05', avgOrderCases: 5, accountCredit: 45.00,
    assignedSalesperson: 'Sarah Mitchell', notes: ['New customer — started Feb 2026'],
    createdDate: '2026-02-01',
  },
  {
    id: 6, name: 'Mario\'s Catering', code: 'MARI-001',
    contact: 'Mario Russo', phone: '(555) 789-0123', email: 'mario@marioscatering.com',
    type: 'Caterer', paymentType: 'credit', creditTier: 'B', balance: 6200.00,
    creditLimit: 12000, terms: 'NET-30', parentId: null,
    address: '555 5th Ave, Manhattan, NY 10017', billingAddress: '555 5th Ave, Manhattan, NY 10017',
    priceLevel: 'B', route: 'Route 3 - Manhattan', status: 'Active',
    lastOrderDate: '2026-02-28', avgOrderCases: 22, accountCredit: 0,
    assignedSalesperson: 'Sarah Mitchell', notes: ['Large orders for events — usually calls day before'],
    createdDate: '2024-03-15',
  },
  {
    id: 7, name: 'Brooklyn Bagels', code: 'BROO-001',
    contact: 'David Goldstein', phone: '(555) 890-1234', email: 'david@brooklynbagels.com',
    type: 'Bakery', paymentType: 'credit', creditTier: 'C', balance: 1800.00,
    creditLimit: 5000, terms: 'NET-15', parentId: null,
    address: '88 Bedford Ave, Brooklyn, NY 11211', billingAddress: '88 Bedford Ave, Brooklyn, NY 11211',
    priceLevel: 'C', route: 'Route 2 - Downtown', status: 'Hold',
    lastOrderDate: '2026-01-20', avgOrderCases: 6, accountCredit: 0,
    assignedSalesperson: 'Sarah Mitchell', notes: ['Account on hold — past due 60+ days', 'Spoke to owner 2/15 — promised payment by month end'],
    createdDate: '2025-05-01',
  },
  {
    id: 8, name: 'Seaside Fish Market', code: 'SEAS-001',
    contact: 'Tom O\'Brien', phone: '(555) 901-2345', email: 'tom@seasidefish.com',
    type: 'Restaurant', paymentType: 'prepaid', creditTier: null, balance: 0,
    creditLimit: 0, terms: 'Prepaid', parentId: null,
    address: '42 Pier Lane, Brooklyn, NY 11235', billingAddress: '42 Pier Lane, Brooklyn, NY 11235',
    priceLevel: 'C', route: 'Route 4 - Shore', status: 'Active',
    lastOrderDate: '2026-03-10', avgOrderCases: 4, accountCredit: 0,
    assignedSalesperson: 'Sarah Mitchell', notes: [],
    createdDate: '2026-01-15',
    isBranch: false,
  },

  // [MOD #branch] Branch locations — multi-location accounts.
  // WHY: Branches share parent account's credit limit, balance, payment terms,
  // and price level. Each branch has its own delivery address and contact.
  // Orders placed for a branch update the PARENT account's balance.
  // Billing/financial management always goes through the parent account.
  {
    id: 9, name: 'The Grand Hotel — Midtown', code: 'GRAN-001-B',
    contact: 'Rachel Kim', phone: '(555) 567-8920', email: 'midtown@grandhotel.com',
    type: 'Hotel', paymentType: 'credit', creditTier: 'A', balance: 0,
    creditLimit: 0, terms: 'NET-30', parentId: 4, isBranch: true,
    address: '45 Midtown Plaza, Manhattan, NY 10019', billingAddress: 'PO Box 100, Manhattan, NY 10001',
    priceLevel: 'A', route: 'Route 3 - Manhattan', status: 'Active',
    lastOrderDate: null, avgOrderCases: 0, accountCredit: 0,
    assignedSalesperson: 'Sarah Mitchell', notes: ['Side entrance for deliveries'],
    createdDate: '2024-06-01',
  },
  {
    id: 10, name: 'Bella Cucina Restaurant — Park Slope', code: 'BELL-001-B',
    contact: 'Sofia Rossi', phone: '(555) 234-5699', email: 'parkslope@bellacucina.com',
    type: 'Restaurant', paymentType: 'credit', creditTier: 'A', balance: 0,
    creditLimit: 0, terms: 'NET-30', parentId: 1, isBranch: true,
    address: '88 5th Ave, Brooklyn, NY 11217', billingAddress: '123 Main St, Brooklyn, NY 11201',
    priceLevel: 'A', route: 'Route 1 - Brooklyn', status: 'Active',
    lastOrderDate: null, avgOrderCases: 0, accountCredit: 0,
    assignedSalesperson: 'Sarah Mitchell', notes: ['Prefers delivery after 11am'],
    createdDate: '2025-03-01',
  },
];

// ── ORDERS ───────────────────────────────────────────────────
// [MOD #catalog] Updated product references to match new catalog IDs.
export const ORDERS = [
  {
    id: 1, orderNumber: 'ORD-20260310-001', customerId: 1, salespersonId: 1,
    status: 'Delivered',
    lineItems: [
      { productId: 45, productCode: '16002', productName: 'Cola Regular 12oz Can 24-pack', quantity: 5, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 64.95, depositTotal: 6.00 },
      { productId: 49, productCode: '16006', productName: 'Lemon Regular 12oz Can 24-pack', quantity: 3, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 38.97, depositTotal: 3.60 },
      { productId: 68, productCode: '19002', productName: 'Spring Water 16.9oz Plain 16.9oz Bottle 24-pack', quantity: 10, unitsPerCase: 24, casePrice: 6.99, unitPrice: 0.29, depositPerCase: 1.20, discount: 0, lineTotal: 69.90, depositTotal: 12.00 },
    ],
    subtotal: 173.82, depositTotal: 21.60, discountTotal: 0, grandTotal: 195.42, totalCases: 18,
    deliveryDate: '2026-03-10', notes: 'Deliver before 10am',
    createdDate: '2026-03-08', modifiedDate: '2026-03-10',
  },
  {
    id: 2, orderNumber: 'ORD-20260311-001', customerId: 2, salespersonId: 1,
    // [MOD #001] Was 'Shipped' — removed Shipped status from flow.
    status: 'Picking',
    lineItems: [
      { productId: 45, productCode: '16002', productName: 'Cola Regular 12oz Can 24-pack', quantity: 4, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 51.96, depositTotal: 4.80 },
      { productId: 44, productCode: '16001', productName: 'Black Cherry Regular 12oz Can 24-pack', quantity: 2, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 25.98, depositTotal: 2.40 },
      { productId: 108, productCode: '26001', productName: 'Blueberry Regular 12oz Can 24-pack', quantity: 1, unitsPerCase: 24, casePrice: 32.99, unitPrice: 1.37, depositPerCase: 1.20, discount: 0, lineTotal: 32.99, depositTotal: 1.20 },
    ],
    subtotal: 110.93, depositTotal: 8.40, discountTotal: 0, grandTotal: 119.33, totalCases: 7,
    deliveryDate: '2026-03-12', notes: '',
    createdDate: '2026-03-11', modifiedDate: '2026-03-11',
  },
  {
    id: 3, orderNumber: 'ORD-20260312-001', customerId: 4, salespersonId: 1,
    status: 'Submitted',
    lineItems: [
      { productId: 45, productCode: '16002', productName: 'Cola Regular 12oz Can 24-pack', quantity: 10, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0.50, lineTotal: 124.90, depositTotal: 12.00 },
      { productId: 21, productCode: '12015', productName: 'Cola Zero 1L Bottle 12-pack', quantity: 8, unitsPerCase: 12, casePrice: 12.99, unitPrice: 1.08, depositPerCase: 0.60, discount: 0, lineTotal: 103.92, depositTotal: 4.80 },
      { productId: 55, productCode: '16012', productName: 'Seltzer Plain 12oz Can 24-pack', quantity: 15, unitsPerCase: 24, casePrice: 9.99, unitPrice: 0.42, depositPerCase: 1.20, discount: 0, lineTotal: 149.85, depositTotal: 18.00 },
      { productId: 68, productCode: '19002', productName: 'Spring Water 16.9oz Plain 16.9oz Bottle 24-pack', quantity: 20, unitsPerCase: 24, casePrice: 6.99, unitPrice: 0.29, depositPerCase: 1.20, discount: 0, lineTotal: 139.80, depositTotal: 24.00 },
    ],
    subtotal: 518.47, depositTotal: 58.80, discountTotal: 5.00, grandTotal: 572.27, totalCases: 53,
    deliveryDate: '2026-03-14', notes: 'Large event order — call dock 30 min before',
    createdDate: '2026-03-12', modifiedDate: '2026-03-12',
  },
  {
    id: 4, orderNumber: 'ORD-20260305-001', customerId: 5, salespersonId: 1,
    status: 'Delivered',
    lineItems: [
      { productId: 55, productCode: '16012', productName: 'Seltzer Plain 12oz Can 24-pack', quantity: 2, unitsPerCase: 24, casePrice: 9.99, unitPrice: 0.42, depositPerCase: 1.20, discount: 0, lineTotal: 19.98, depositTotal: 2.40 },
      { productId: 78, productCode: '20005', productName: 'Flavored Water Apple 16.9oz Bottle 12-pack', quantity: 1, unitsPerCase: 12, casePrice: 10.99, unitPrice: 0.92, depositPerCase: 0.60, discount: 0, lineTotal: 10.99, depositTotal: 0.60 },
    ],
    subtotal: 30.97, depositTotal: 3.00, discountTotal: 0, grandTotal: 33.97, totalCases: 3,
    deliveryDate: '2026-03-05', notes: '',
    createdDate: '2026-03-04', modifiedDate: '2026-03-05',
  },
];

// ── INVOICES ─────────────────────────────────────────────────
// WHY: Invoices are generated from delivered orders. Mix of open, partial,
// paid, and overdue to test all status badges and aging report buckets.
// [MOD #catalog] Updated product references to match new catalog IDs.
// [MOD #unitPrice] Added unitPrice to all lineItems.
export const INVOICES = [
  {
    id: 1, invoiceNumber: 'INV-20260210-001', orderId: null, customerId: 1,
    status: 'Overdue',
    lineItems: [
      { productId: 45, productCode: '16002', productName: 'Cola Regular 12oz Can 24-pack', quantity: 8, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 103.92, depositTotal: 9.60 },
      { productId: 68, productCode: '19002', productName: 'Spring Water 16.9oz Plain 16.9oz Bottle 24-pack', quantity: 12, unitsPerCase: 24, casePrice: 6.99, unitPrice: 0.29, depositPerCase: 1.20, discount: 0, lineTotal: 83.88, depositTotal: 14.40 },
    ],
    subtotal: 187.80, depositTotal: 24.00, discountTotal: 0, grandTotal: 211.80, totalCases: 20,
    amountPaid: 0, amountDue: 211.80, dueDate: '2026-02-10',
    createdDate: '2026-01-10', paidDate: null,
  },
  {
    id: 2, invoiceNumber: 'INV-20260225-001', orderId: null, customerId: 1,
    status: 'Open',
    lineItems: [
      { productId: 45, productCode: '16002', productName: 'Cola Regular 12oz Can 24-pack', quantity: 5, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 64.95, depositTotal: 6.00 },
      { productId: 49, productCode: '16006', productName: 'Lemon Regular 12oz Can 24-pack', quantity: 3, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 38.97, depositTotal: 3.60 },
    ],
    subtotal: 103.92, depositTotal: 9.60, discountTotal: 0, grandTotal: 113.52, totalCases: 8,
    amountPaid: 0, amountDue: 113.52, dueDate: '2026-03-25',
    createdDate: '2026-02-25', paidDate: null,
  },
  {
    id: 3, invoiceNumber: 'INV-20260215-001', orderId: null, customerId: 2,
    status: 'Partial',
    lineItems: [
      { productId: 45, productCode: '16002', productName: 'Cola Regular 12oz Can 24-pack', quantity: 3, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 38.97, depositTotal: 3.60 },
      { productId: 108, productCode: '26001', productName: 'Blueberry Regular 12oz Can 24-pack', quantity: 2, unitsPerCase: 24, casePrice: 32.99, unitPrice: 1.37, depositPerCase: 1.20, discount: 0, lineTotal: 65.98, depositTotal: 2.40 },
    ],
    subtotal: 104.95, depositTotal: 6.00, discountTotal: 0, grandTotal: 110.95, totalCases: 5,
    amountPaid: 60.00, amountDue: 50.95, dueDate: '2026-03-15',
    createdDate: '2026-02-15', paidDate: null,
  },
  {
    id: 4, invoiceNumber: 'INV-20260301-001', orderId: null, customerId: 4,
    status: 'Paid',
    lineItems: [
      { productId: 55, productCode: '16012', productName: 'Seltzer Plain 12oz Can 24-pack', quantity: 10, unitsPerCase: 24, casePrice: 9.99, unitPrice: 0.42, depositPerCase: 1.20, discount: 0, lineTotal: 99.90, depositTotal: 12.00 },
    ],
    subtotal: 99.90, depositTotal: 12.00, discountTotal: 0, grandTotal: 111.90, totalCases: 10,
    amountPaid: 111.90, amountDue: 0, dueDate: '2026-03-31',
    createdDate: '2026-03-01', paidDate: '2026-03-05',
  },
  {
    id: 5, invoiceNumber: 'INV-20260110-001', orderId: null, customerId: 3,
    status: 'Overdue',
    lineItems: [
      { productId: 45, productCode: '16002', productName: 'Cola Regular 12oz Can 24-pack', quantity: 4, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 51.96, depositTotal: 4.80 },
      { productId: 49, productCode: '16006', productName: 'Lemon Regular 12oz Can 24-pack', quantity: 3, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 38.97, depositTotal: 3.60 },
      { productId: 53, productCode: '16010', productName: 'Orange Regular 12oz Can 24-pack', quantity: 2, unitsPerCase: 24, casePrice: 12.49, unitPrice: 0.52, depositPerCase: 1.20, discount: 0, lineTotal: 24.98, depositTotal: 2.40 },
    ],
    subtotal: 115.91, depositTotal: 10.80, discountTotal: 0, grandTotal: 126.71, totalCases: 9,
    amountPaid: 0, amountDue: 126.71, dueDate: '2026-01-25',
    createdDate: '2026-01-10', paidDate: null,
  },
  {
    id: 6, invoiceNumber: 'INV-20260310-001', orderId: 1, customerId: 1,
    status: 'Open',
    lineItems: [
      { productId: 45, productCode: '16002', productName: 'Cola Regular 12oz Can 24-pack', quantity: 5, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 64.95, depositTotal: 6.00 },
      { productId: 49, productCode: '16006', productName: 'Lemon Regular 12oz Can 24-pack', quantity: 3, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 38.97, depositTotal: 3.60 },
      { productId: 68, productCode: '19002', productName: 'Spring Water 16.9oz Plain 16.9oz Bottle 24-pack', quantity: 10, unitsPerCase: 24, casePrice: 6.99, unitPrice: 0.29, depositPerCase: 1.20, discount: 0, lineTotal: 69.90, depositTotal: 12.00 },
    ],
    subtotal: 173.82, depositTotal: 21.60, discountTotal: 0, grandTotal: 195.42, totalCases: 18,
    amountPaid: 0, amountDue: 195.42, dueDate: '2026-04-10',
    createdDate: '2026-03-10', paidDate: null,
  },
];

// ── PAYMENTS ─────────────────────────────────────────────────
export const PAYMENTS = [
  {
    id: 1, customerId: 2, amount: 60.00, method: 'Check',
    appliedTo: [{ invoiceId: 3, amount: 60.00 }],
    unappliedAmount: 0, reference: 'CHK-4521',
    date: '2026-02-28', collectedBy: 1,
  },
  {
    id: 2, customerId: 4, amount: 111.90, method: 'Card',
    appliedTo: [{ invoiceId: 4, amount: 111.90 }],
    unappliedAmount: 0, reference: 'TXN-88432',
    date: '2026-03-05', collectedBy: 1,
  },
  {
    id: 3, customerId: 5, amount: 42.57, method: 'Cash',
    appliedTo: [],
    unappliedAmount: 0, reference: '',
    date: '2026-03-05', collectedBy: 1,
  },
  {
    id: 4, customerId: 2, amount: 150.00, method: 'Cash',
    appliedTo: [],
    unappliedAmount: 150.00, reference: '',
    date: '2026-03-10', collectedBy: 1,
  },
];

// ── FAVORITES ────────────────────────────────────────────────
// WHY: Per-customer favorite products for quick re-ordering.
// [MOD #catalog] Updated product references to match new catalog IDs.
export const FAVORITES = {
  1: [45, 49, 68],       // Bella Cucina: Cola Cans, Lemon Cans, Spring Water
  2: [45, 44, 108],      // Harbor Grill: Cola Cans, Black Cherry Cans, 10x Energy
  4: [45, 21, 55, 68],   // Grand Hotel: Cola Cans, Zero Cola 1L, Seltzer Cans, Spring Water
};

// ── RECENT ACTIVITY ──────────────────────────────────────────
// WHY: Dashboard recent activity feed. In production this would be
// auto-generated from events. For mock, it's a static list.
// [MOD #001] linkTo paths are real routes — clicking navigates to the actual record.
export const RECENT_ACTIVITY = [
  { id: 1, type: 'order', text: 'Order #ORD-20260312-001 placed — The Grand Hotel', date: '2026-03-12T09:15:00Z', linkTo: '/orders/3' },
  { id: 2, type: 'payment', text: 'Payment $150.00 collected — Harbor Grill', date: '2026-03-10T14:30:00Z', linkTo: '/customers/2' },
  { id: 3, type: 'delivery', text: 'Delivery confirmed — Bella Cucina Restaurant', date: '2026-03-10T11:00:00Z', linkTo: '/orders/1' },
  { id: 4, type: 'order', text: 'Order #ORD-20260311-001 picking — Harbor Grill', date: '2026-03-11T08:00:00Z', linkTo: '/orders/2' },
  { id: 5, type: 'payment', text: 'Payment $111.90 collected — The Grand Hotel', date: '2026-03-05T16:45:00Z', linkTo: '/customers/4' },
  { id: 6, type: 'order', text: 'Order #ORD-20260305-001 delivered — Fresh Bites Cafe', date: '2026-03-05T10:00:00Z', linkTo: '/orders/4' },
  { id: 7, type: 'payment', text: 'Payment $60.00 collected — Harbor Grill', date: '2026-02-28T13:20:00Z', linkTo: '/customers/2' },
];

// ── RETURN REASONS ────────────────────────────────────────────
// WHY: Standard return reason codes for consistency in reporting.
// [MOD #returns] New constant.
export const RETURN_REASONS = [
  { id: 'damaged', label: 'Damaged Product', icon: '💔' },
  { id: 'wrong_item', label: 'Wrong Item Delivered', icon: '❌' },
  { id: 'quality', label: 'Quality Issue', icon: '⚠️' },
  { id: 'overstocked', label: 'Customer Overstocked', icon: '📦' },
  { id: 'expired', label: 'Expired/Near Expiry', icon: '📅' },
  { id: 'customer_changed_mind', label: 'Customer Changed Mind', icon: '🔄' },
  { id: 'other', label: 'Other', icon: '📝' },
];

// ── DAMAGE TYPES ──────────────────────────────────────────────
// WHY: Tracks how product was damaged for reporting and vendor claims.
// [MOD #returns] New constant.
export const DAMAGE_TYPES = [
  { id: 'crushed', label: 'Crushed/Dented' },
  { id: 'leaking', label: 'Leaking' },
  { id: 'broken', label: 'Broken/Shattered' },
  { id: 'contaminated', label: 'Contaminated' },
  { id: 'temperature', label: 'Temperature Damage' },
  { id: 'other', label: 'Other Damage' },
];

// ── RETURNS ──────────────────────────────────────────────────
// WHY: Return orders that credit the customer account. Returns can be:
//   - From existing delivered order (has originalOrderId)
//   - Created from scratch (originalOrderId = null)
// Line items can be marked as damaged with damageType.
// [MOD #returns] New seed data.
// [MOD #catalog] Updated product references to match new catalog IDs.
// [MOD #unitPrice] Added unitPrice to all lineItems.
export const RETURNS = [
  {
    id: 1, returnNumber: 'RET-20260312-001', customerId: 1, salespersonId: 1,
    status: 'Processed',
    originalOrderId: 1, // Linked to delivered order ORD-20260310-001
    returnReason: 'damaged',
    lineItems: [
      { productId: 45, productCode: '16002', productName: 'Cola Regular 12oz Can 24-pack', quantity: 2, unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, discount: 0, lineTotal: 25.98, depositTotal: 2.40, isDamaged: true, damageType: 'crushed' },
    ],
    subtotal: 25.98, depositTotal: 2.40, discountTotal: 0, grandTotal: 28.38, totalCases: 2,
    notes: 'Delivery truck incident — 2 cases crushed on arrival.',
    creditApplied: true,
    createdDate: '2026-03-12', modifiedDate: '2026-03-12', processedDate: '2026-03-12',
  },
  {
    id: 2, returnNumber: 'RET-20260313-001', customerId: 4, salespersonId: 1,
    status: 'Pending',
    originalOrderId: null, // Created from scratch — not linked to specific order
    returnReason: 'overstocked',
    lineItems: [
      { productId: 55, productCode: '16012', productName: 'Seltzer Plain 12oz Can 24-pack', quantity: 5, unitsPerCase: 24, casePrice: 9.99, unitPrice: 0.42, depositPerCase: 1.20, discount: 0, lineTotal: 49.95, depositTotal: 6.00, isDamaged: false, damageType: null },
      { productId: 68, productCode: '19002', productName: 'Spring Water 16.9oz Plain 16.9oz Bottle 24-pack', quantity: 8, unitsPerCase: 24, casePrice: 6.99, unitPrice: 0.29, depositPerCase: 1.20, discount: 0, lineTotal: 55.92, depositTotal: 9.60, isDamaged: false, damageType: null },
    ],
    subtotal: 105.87, depositTotal: 15.60, discountTotal: 0, grandTotal: 121.47, totalCases: 13,
    notes: 'Hotel event cancelled — returning overstock.',
    creditApplied: false,
    createdDate: '2026-03-13', modifiedDate: '2026-03-13', processedDate: null,
  },
];

// ── DEFAULT DISCOUNT SETTINGS ────────────────────────────────
// WHY: 4-level discount caps editable from Settings for demo purposes.
// In production, accounting will control these via admin panel.
// perItemFixed = max $ discount per single line item
// perItemPercent = max % discount per single line item
// perOrderFixed = max $ discount across entire order
// perOrderPercent = max % discount across entire order
export const DEFAULT_DISCOUNT_SETTINGS = {
  perItemFixed: 5.00,
  perItemPercent: 15,
  perOrderFixed: 50.00,
  perOrderPercent: 10,
};

// WHY: Default delivery schedule is Mon–Fri (weekday numbers 1–5).
// 0 = Sunday, 1 = Monday, ..., 6 = Saturday.
// In production the warehouse configures available delivery days
// from the admin panel. Demo exposes this in Settings so stakeholders
// can test how the order wizard restricts date selection.
// [MOD #demo-delivery] New constant.
export const DEFAULT_DELIVERY_DAYS = [1, 2, 3, 4, 5];
