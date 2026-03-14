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
// [MOD #returns] Bumped to v4 to add returns seed data.
export const SEED_VERSION = 'v4';

// ── CATEGORIES ───────────────────────────────────────────────
export const CATEGORIES = [
  { id: 1, name: 'Cola', icon: '🥤', sortOrder: 1 },
  { id: 2, name: 'Lemon-Lime', icon: '🍋', sortOrder: 2 },
  { id: 3, name: 'Root Beer', icon: '🍺', sortOrder: 3 },
  { id: 4, name: 'Seltzer', icon: '💧', sortOrder: 4 },
  { id: 5, name: 'Orange', icon: '🍊', sortOrder: 5 },
  { id: 6, name: 'Energy', icon: '⚡', sortOrder: 6 },
  { id: 7, name: 'Water', icon: '🫧', sortOrder: 7 },
  { id: 8, name: 'Juice', icon: '🧃', sortOrder: 8 },
];

// ── PRODUCTS ─────────────────────────────────────────────────
// WHY: Prices, sizes, deposits are estimates. See BUILD_PLAN.md §12,
// items #1, #5, #6 for what the user needs to provide.
export const PRODUCTS = [
  // Cola
  { id: 1, code: '10001', name: 'Cola Classic', flavor: 'Classic', categoryId: 1, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, stock: 150, overStockLimit: 50, status: 'Active' },
  { id: 2, code: '10002', name: 'Cola Classic', flavor: 'Classic', categoryId: 1, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unitsPerCase: 24, casePrice: 22.50, unitPrice: 0.94, depositPerCase: 1.20, stock: 80, overStockLimit: 30, status: 'Active' },
  { id: 3, code: '10003', name: 'Cola Classic', flavor: 'Classic', categoryId: 1, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 15.99, unitPrice: 2.67, depositPerCase: 0.60, stock: 45, overStockLimit: 20, status: 'Active' },
  { id: 4, code: '10004', name: 'Cola Zero', flavor: 'Zero Sugar', categoryId: 1, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 13.49, unitPrice: 0.56, depositPerCase: 1.20, stock: 120, overStockLimit: 40, status: 'Active' },
  { id: 5, code: '10005', name: 'Cola Cherry', flavor: 'Cherry', categoryId: 1, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 13.49, unitPrice: 0.56, depositPerCase: 1.20, stock: 60, overStockLimit: 25, status: 'Active' },

  // Lemon-Lime
  { id: 6, code: '10010', name: 'Lemon-Lime Original', flavor: 'Original', categoryId: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, stock: 100, overStockLimit: 40, status: 'Active' },
  { id: 7, code: '10011', name: 'Lemon-Lime Original', flavor: 'Original', categoryId: 2, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unitsPerCase: 24, casePrice: 22.50, unitPrice: 0.94, depositPerCase: 1.20, stock: 55, overStockLimit: 20, status: 'Active' },
  { id: 8, code: '10012', name: 'Lemon-Lime Zero', flavor: 'Zero Sugar', categoryId: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 13.49, unitPrice: 0.56, depositPerCase: 1.20, stock: 40, overStockLimit: 15, status: 'Active' },

  // Root Beer
  { id: 9, code: '10020', name: 'Root Beer Classic', flavor: 'Classic', categoryId: 3, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 12.99, unitPrice: 0.54, depositPerCase: 1.20, stock: 70, overStockLimit: 30, status: 'Active' },
  { id: 10, code: '10021', name: 'Root Beer Classic', flavor: 'Classic', categoryId: 3, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unitsPerCase: 24, casePrice: 22.50, unitPrice: 0.94, depositPerCase: 1.20, stock: 35, overStockLimit: 15, status: 'Active' },
  { id: 11, code: '10022', name: 'Root Beer Float', flavor: 'Vanilla Float', categoryId: 3, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 13.99, unitPrice: 0.58, depositPerCase: 1.20, stock: 25, overStockLimit: 10, status: 'Active' },

  // Seltzer
  { id: 12, code: '10030', name: 'Seltzer Plain', flavor: 'Unflavored', categoryId: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 9.99, unitPrice: 0.42, depositPerCase: 1.20, stock: 200, overStockLimit: 80, status: 'Active' },
  { id: 13, code: '10031', name: 'Seltzer Lime', flavor: 'Lime', categoryId: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 10.99, unitPrice: 0.46, depositPerCase: 1.20, stock: 130, overStockLimit: 50, status: 'Active' },
  { id: 14, code: '10032', name: 'Seltzer Berry', flavor: 'Mixed Berry', categoryId: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 10.99, unitPrice: 0.46, depositPerCase: 1.20, stock: 90, overStockLimit: 40, status: 'Active' },

  // Orange
  { id: 15, code: '10040', name: 'Orange Soda', flavor: 'Original', categoryId: 5, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 12.49, unitPrice: 0.52, depositPerCase: 1.20, stock: 85, overStockLimit: 30, status: 'Active' },
  { id: 16, code: '10041', name: 'Orange Soda', flavor: 'Original', categoryId: 5, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unitsPerCase: 6, casePrice: 14.99, unitPrice: 2.50, depositPerCase: 0.60, stock: 30, overStockLimit: 10, status: 'Active' },

  // Energy
  { id: 17, code: '10050', name: 'Energy Boost', flavor: 'Original', categoryId: 6, size: '16oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 32.99, unitPrice: 1.37, depositPerCase: 1.20, stock: 60, overStockLimit: 20, status: 'Active' },
  { id: 18, code: '10051', name: 'Energy Boost', flavor: 'Tropical', categoryId: 6, size: '16oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 32.99, unitPrice: 1.37, depositPerCase: 1.20, stock: 45, overStockLimit: 15, status: 'Active' },
  { id: 19, code: '10052', name: 'Energy Boost Zero', flavor: 'Zero Sugar', categoryId: 6, size: '16oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 33.49, unitPrice: 1.40, depositPerCase: 1.20, stock: 0, overStockLimit: null, status: 'Out of Stock' },

  // Water
  { id: 20, code: '10060', name: 'Spring Water', flavor: 'Plain', categoryId: 7, size: '16.9oz Bottle', material: 'Plastic', packSize: '24-pack', unitsPerCase: 24, casePrice: 6.99, unitPrice: 0.29, depositPerCase: 1.20, stock: 300, overStockLimit: 100, status: 'Active' },
  { id: 21, code: '10061', name: 'Spring Water', flavor: 'Plain', categoryId: 7, size: '1L Bottle', material: 'Plastic', packSize: '12-pack', unitsPerCase: 12, casePrice: 8.99, unitPrice: 0.75, depositPerCase: 0.60, stock: 120, overStockLimit: 50, status: 'Active' },

  // Juice
  { id: 22, code: '10070', name: 'Apple Juice', flavor: 'Apple', categoryId: 8, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 18.99, unitPrice: 0.79, depositPerCase: 1.20, stock: 50, overStockLimit: 20, status: 'Active' },
  { id: 23, code: '10071', name: 'Grape Juice', flavor: 'Grape', categoryId: 8, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 18.99, unitPrice: 0.79, depositPerCase: 1.20, stock: 40, overStockLimit: 15, status: 'Active' },
  { id: 24, code: '10072', name: 'Cranberry Juice', flavor: 'Cranberry', categoryId: 8, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unitsPerCase: 24, casePrice: 19.99, unitPrice: 0.83, depositPerCase: 1.20, stock: 35, overStockLimit: 15, status: 'Active' },
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
export const ORDERS = [
  {
    id: 1, orderNumber: 'ORD-20260310-001', customerId: 1, salespersonId: 1,
    status: 'Delivered',
    lineItems: [
      { productId: 1, productCode: '10001', productName: 'Cola Classic 12oz 24pk', quantity: 5, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 64.95, depositTotal: 6.00 },
      { productId: 6, productCode: '10010', productName: 'Lemon-Lime Original 12oz 24pk', quantity: 3, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 38.97, depositTotal: 3.60 },
      { productId: 20, productCode: '10060', productName: 'Spring Water 16.9oz 24pk', quantity: 10, unitsPerCase: 24, casePrice: 6.99, depositPerCase: 1.20, discount: 0, lineTotal: 69.90, depositTotal: 12.00 },
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
      { productId: 1, productCode: '10001', productName: 'Cola Classic 12oz 24pk', quantity: 4, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 51.96, depositTotal: 4.80 },
      { productId: 9, productCode: '10020', productName: 'Root Beer Classic 12oz 24pk', quantity: 2, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 25.98, depositTotal: 2.40 },
      { productId: 17, productCode: '10050', productName: 'Energy Boost Original 16oz 24pk', quantity: 1, unitsPerCase: 24, casePrice: 32.99, depositPerCase: 1.20, discount: 0, lineTotal: 32.99, depositTotal: 1.20 },
    ],
    subtotal: 110.93, depositTotal: 8.40, discountTotal: 0, grandTotal: 119.33, totalCases: 7,
    deliveryDate: '2026-03-12', notes: '',
    createdDate: '2026-03-11', modifiedDate: '2026-03-11',
  },
  {
    id: 3, orderNumber: 'ORD-20260312-001', customerId: 4, salespersonId: 1,
    status: 'Submitted',
    lineItems: [
      { productId: 1, productCode: '10001', productName: 'Cola Classic 12oz 24pk', quantity: 10, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0.50, lineTotal: 124.90, depositTotal: 12.00 },
      { productId: 4, productCode: '10004', productName: 'Cola Zero 12oz 24pk', quantity: 8, unitsPerCase: 24, casePrice: 13.49, depositPerCase: 1.20, discount: 0, lineTotal: 107.92, depositTotal: 9.60 },
      { productId: 12, productCode: '10030', productName: 'Seltzer Plain 12oz 24pk', quantity: 15, unitsPerCase: 24, casePrice: 9.99, depositPerCase: 1.20, discount: 0, lineTotal: 149.85, depositTotal: 18.00 },
      { productId: 20, productCode: '10060', productName: 'Spring Water 16.9oz 24pk', quantity: 20, unitsPerCase: 24, casePrice: 6.99, depositPerCase: 1.20, discount: 0, lineTotal: 139.80, depositTotal: 24.00 },
    ],
    subtotal: 522.47, depositTotal: 63.60, discountTotal: 5.00, grandTotal: 581.07, totalCases: 53,
    deliveryDate: '2026-03-14', notes: 'Large event order — call dock 30 min before',
    createdDate: '2026-03-12', modifiedDate: '2026-03-12',
  },
  {
    id: 4, orderNumber: 'ORD-20260305-001', customerId: 5, salespersonId: 1,
    status: 'Delivered',
    lineItems: [
      { productId: 12, productCode: '10030', productName: 'Seltzer Plain 12oz 24pk', quantity: 2, unitsPerCase: 24, casePrice: 9.99, depositPerCase: 1.20, discount: 0, lineTotal: 19.98, depositTotal: 2.40 },
      { productId: 22, productCode: '10070', productName: 'Apple Juice 12oz 24pk', quantity: 1, unitsPerCase: 24, casePrice: 18.99, depositPerCase: 1.20, discount: 0, lineTotal: 18.99, depositTotal: 1.20 },
    ],
    subtotal: 38.97, depositTotal: 3.60, discountTotal: 0, grandTotal: 42.57, totalCases: 3,
    deliveryDate: '2026-03-05', notes: '',
    createdDate: '2026-03-04', modifiedDate: '2026-03-05',
  },
];

// ── INVOICES ─────────────────────────────────────────────────
// WHY: Invoices are generated from delivered orders. Mix of open, partial,
// paid, and overdue to test all status badges and aging report buckets.
export const INVOICES = [
  {
    id: 1, invoiceNumber: 'INV-20260210-001', orderId: null, customerId: 1,
    status: 'Overdue',
    lineItems: [
      { productId: 1, productCode: '10001', productName: 'Cola Classic 12oz 24pk', quantity: 8, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 103.92, depositTotal: 9.60 },
      { productId: 20, productCode: '10060', productName: 'Spring Water 16.9oz 24pk', quantity: 12, unitsPerCase: 24, casePrice: 6.99, depositPerCase: 1.20, discount: 0, lineTotal: 83.88, depositTotal: 14.40 },
    ],
    subtotal: 187.80, depositTotal: 24.00, discountTotal: 0, grandTotal: 211.80, totalCases: 20,
    amountPaid: 0, amountDue: 211.80, dueDate: '2026-02-10',
    createdDate: '2026-01-10', paidDate: null,
  },
  {
    id: 2, invoiceNumber: 'INV-20260225-001', orderId: null, customerId: 1,
    status: 'Open',
    lineItems: [
      { productId: 1, productCode: '10001', productName: 'Cola Classic 12oz 24pk', quantity: 5, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 64.95, depositTotal: 6.00 },
      { productId: 6, productCode: '10010', productName: 'Lemon-Lime Original 12oz 24pk', quantity: 3, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 38.97, depositTotal: 3.60 },
    ],
    subtotal: 103.92, depositTotal: 9.60, discountTotal: 0, grandTotal: 113.52, totalCases: 8,
    amountPaid: 0, amountDue: 113.52, dueDate: '2026-03-25',
    createdDate: '2026-02-25', paidDate: null,
  },
  {
    id: 3, invoiceNumber: 'INV-20260215-001', orderId: null, customerId: 2,
    status: 'Partial',
    lineItems: [
      { productId: 1, productCode: '10001', productName: 'Cola Classic 12oz 24pk', quantity: 3, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 38.97, depositTotal: 3.60 },
      { productId: 17, productCode: '10050', productName: 'Energy Boost Original 16oz 24pk', quantity: 2, unitsPerCase: 24, casePrice: 32.99, depositPerCase: 1.20, discount: 0, lineTotal: 65.98, depositTotal: 2.40 },
    ],
    subtotal: 104.95, depositTotal: 6.00, discountTotal: 0, grandTotal: 110.95, totalCases: 5,
    amountPaid: 60.00, amountDue: 50.95, dueDate: '2026-03-15',
    createdDate: '2026-02-15', paidDate: null,
  },
  {
    id: 4, invoiceNumber: 'INV-20260301-001', orderId: null, customerId: 4,
    status: 'Paid',
    lineItems: [
      { productId: 12, productCode: '10030', productName: 'Seltzer Plain 12oz 24pk', quantity: 10, unitsPerCase: 24, casePrice: 9.99, depositPerCase: 1.20, discount: 0, lineTotal: 99.90, depositTotal: 12.00 },
    ],
    subtotal: 99.90, depositTotal: 12.00, discountTotal: 0, grandTotal: 111.90, totalCases: 10,
    amountPaid: 111.90, amountDue: 0, dueDate: '2026-03-31',
    createdDate: '2026-03-01', paidDate: '2026-03-05',
  },
  {
    id: 5, invoiceNumber: 'INV-20260110-001', orderId: null, customerId: 3,
    status: 'Overdue',
    lineItems: [
      { productId: 1, productCode: '10001', productName: 'Cola Classic 12oz 24pk', quantity: 4, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 51.96, depositTotal: 4.80 },
      { productId: 6, productCode: '10010', productName: 'Lemon-Lime Original 12oz 24pk', quantity: 3, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 38.97, depositTotal: 3.60 },
      { productId: 15, productCode: '10040', productName: 'Orange Soda 12oz 24pk', quantity: 2, unitsPerCase: 24, casePrice: 12.49, depositPerCase: 1.20, discount: 0, lineTotal: 24.98, depositTotal: 2.40 },
    ],
    subtotal: 115.91, depositTotal: 10.80, discountTotal: 0, grandTotal: 126.71, totalCases: 9,
    amountPaid: 0, amountDue: 126.71, dueDate: '2026-01-25',
    createdDate: '2026-01-10', paidDate: null,
  },
  {
    id: 6, invoiceNumber: 'INV-20260310-001', orderId: 1, customerId: 1,
    status: 'Open',
    lineItems: [
      { productId: 1, productCode: '10001', productName: 'Cola Classic 12oz 24pk', quantity: 5, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 64.95, depositTotal: 6.00 },
      { productId: 6, productCode: '10010', productName: 'Lemon-Lime Original 12oz 24pk', quantity: 3, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 38.97, depositTotal: 3.60 },
      { productId: 20, productCode: '10060', productName: 'Spring Water 16.9oz 24pk', quantity: 10, unitsPerCase: 24, casePrice: 6.99, depositPerCase: 1.20, discount: 0, lineTotal: 69.90, depositTotal: 12.00 },
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
export const FAVORITES = {
  1: [1, 6, 20],       // Bella Cucina: Cola, Lemon-Lime, Water
  2: [1, 9, 17],       // Harbor Grill: Cola, Root Beer, Energy
  4: [1, 4, 12, 20],   // Grand Hotel: Cola, Cola Zero, Seltzer, Water
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
export const RETURNS = [
  {
    id: 1, returnNumber: 'RET-20260312-001', customerId: 1, salespersonId: 1,
    status: 'Processed',
    originalOrderId: 1, // Linked to delivered order ORD-20260310-001
    returnReason: 'damaged',
    lineItems: [
      { productId: 1, productCode: '10001', productName: 'Cola Classic 12oz 24pk', quantity: 2, unitsPerCase: 24, casePrice: 12.99, depositPerCase: 1.20, discount: 0, lineTotal: 25.98, depositTotal: 2.40, isDamaged: true, damageType: 'crushed' },
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
      { productId: 12, productCode: '10030', productName: 'Seltzer Plain 12oz 24pk', quantity: 5, unitsPerCase: 24, casePrice: 9.99, depositPerCase: 1.20, discount: 0, lineTotal: 49.95, depositTotal: 6.00, isDamaged: false, damageType: null },
      { productId: 20, productCode: '10060', productName: 'Spring Water 16.9oz 24pk', quantity: 8, unitsPerCase: 24, casePrice: 6.99, depositPerCase: 1.20, discount: 0, lineTotal: 55.92, depositTotal: 9.60, isDamaged: false, damageType: null },
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
