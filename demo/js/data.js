// ===== WholesaleERP Demo — Own-Brand Beverage Distribution Data =====

export const ORDER_CAPS = {
  maxDiscountPct: 15,   // salesperson hard cap — above this is blocked
  warnDiscountPct: 10,  // above this shows a warning in UI
};

export const CUSTOMERS = [
  { id: 1, name: 'Bella Cucina Restaurant', code: 'BELL-001', contact: 'Maria Santos', phone: '(617) 555-0112', email: 'maria@bellacucina.com', type: 'Restaurant', creditTier: 'A', balance: 8450.00, creditLimit: 25000, terms: 'NET-30', parentId: null, loc: '245 Hanover St, Boston', priceLevel: 'Restaurant Standard', route: 'Route A-1', status: 'Active', lastOrder: '2026-02-24', avgOrder: 2200, hasPaymentOnFile: true, accountCredit: 0 },
  { id: 2, name: 'Harbor Grill', code: 'HARB-002', contact: 'James Chen', phone: '(617) 555-0234', email: 'james@harborgrill.com', type: 'Restaurant', creditTier: 'A', balance: 3200.00, creditLimit: 20000, terms: 'NET-30', parentId: null, loc: '98 Seaport Blvd, Boston', priceLevel: 'Restaurant Standard', route: 'Route A-1', status: 'Active', lastOrder: '2026-02-25', avgOrder: 1800, hasPaymentOnFile: true, accountCredit: 0 },
  { id: 3, name: 'Fresh Market Deli', code: 'FRES-003', contact: 'Sarah Kim', phone: '(781) 555-0345', email: 'sarah@freshmarket.com', type: 'Deli', creditTier: 'B', balance: 12300.00, creditLimit: 15000, terms: 'NET-15', parentId: null, loc: '567 Main St, Cambridge', priceLevel: 'Deli Standard', route: 'Route B-2', status: 'Active', lastOrder: '2026-02-23', avgOrder: 900, hasPaymentOnFile: false, accountCredit: 0 },
  { id: 4, name: 'Ocean Prime Seafood', code: 'OCEA-004', contact: 'David Park', phone: '(617) 555-0456', email: 'david@oceanprime.com', type: 'Restaurant', creditTier: 'A', balance: 0, creditLimit: 30000, terms: 'NET-30', parentId: null, loc: '321 Atlantic Ave, Boston', priceLevel: 'Premium', route: 'Route A-1', status: 'Active', lastOrder: '2026-02-26', avgOrder: 3500, hasPaymentOnFile: true, accountCredit: 0 },
  { id: 5, name: "Tony's Pizza — Downtown", code: 'TONY-005', contact: 'Tony Russo', phone: '(617) 555-0567', email: 'tony@tonyspizza.com', type: 'Restaurant', creditTier: 'B', balance: 4500.00, creditLimit: 10000, terms: 'NET-15', parentId: 6, loc: '44 Summer St, Boston', priceLevel: 'Restaurant Standard', route: 'Route A-1', status: 'Active', lastOrder: '2026-02-22', avgOrder: 650, hasPaymentOnFile: true, accountCredit: 0 },
  { id: 6, name: "Tony's Pizza — HQ", code: 'TONY-000', contact: 'Tony Russo', phone: '(617) 555-0560', email: 'admin@tonyspizza.com', type: 'Restaurant', creditTier: 'B', balance: 7200.00, creditLimit: 25000, terms: 'NET-15', parentId: null, loc: '100 Federal St, Boston', priceLevel: 'Restaurant Standard', route: null, status: 'Active', lastOrder: '2026-02-25', avgOrder: 1400, hasPaymentOnFile: true, accountCredit: 0 },
  { id: 7, name: 'Cambridge Catering Co', code: 'CAMB-007', contact: 'Linda Wu', phone: '(617) 555-0678', email: 'linda@cambcatering.com', type: 'Caterer', creditTier: 'Prepay', balance: 0, creditLimit: 0, terms: 'Prepay', parentId: null, loc: '890 Mass Ave, Cambridge', priceLevel: 'Wholesale', route: 'Route B-2', status: 'Active', lastOrder: '2026-02-10', avgOrder: 2800, hasPaymentOnFile: true, accountCredit: 750.00 },
  { id: 8, name: 'Sunrise Bakery', code: 'SUNR-008', contact: 'Emily White', phone: '(781) 555-0789', email: 'emily@sunrisebakery.com', type: 'Bakery', creditTier: 'A', balance: 1200.00, creditLimit: 12000, terms: 'NET-30', parentId: null, loc: '156 Broadway, Somerville', priceLevel: 'Bakery', route: 'Route C-3', status: 'Active', lastOrder: '2026-02-25', avgOrder: 450, hasPaymentOnFile: true, accountCredit: 0 },
  { id: 9, name: 'Waterfront Hotel', code: 'WATE-009', contact: 'Robert Taylor', phone: '(617) 555-0890', email: 'chef@waterfronthotel.com', type: 'Hotel', creditTier: 'A', balance: 22000.00, creditLimit: 50000, terms: 'NET-30', parentId: null, loc: '1 Harbor Way, Boston', priceLevel: 'Premium', route: 'Route A-1', status: 'Active', lastOrder: '2026-02-26', avgOrder: 5200, hasPaymentOnFile: true, accountCredit: 500.00 },
  { id: 10, name: 'Green Leaf Cafe', code: 'GREE-010', contact: 'Amy Chen', phone: '(617) 555-0901', email: 'amy@greenleaf.com', type: 'Cafe', creditTier: 'C', balance: 6100.00, creditLimit: 8000, terms: 'COD', parentId: null, loc: '78 Newbury St, Boston', priceLevel: 'Cafe Standard', route: 'Route C-3', status: 'Hold', lastOrder: '2026-01-28', avgOrder: 350, hasPaymentOnFile: false, accountCredit: 0 },
];

export const CATEGORIES = [
  { id: 1, name: 'Cola',               icon: '🥤' },
  { id: 2, name: 'Lemon-Lime & Citrus',icon: '🍋' },
  { id: 3, name: 'Root Beer & Cream',  icon: '🍺' },
  { id: 4, name: 'Seltzer',            icon: '💧' },
];

// Own-brand product catalog
// unitPrice = price per individual bottle/can, price = case price
// overStockLimit: cases above stock allowed. 0 = hard-blocked (override avail). null = unlimited
export const PRODUCTS = [
  // ══ Cola — 12oz Can ══
  { id: 1,  code: 'COL-12C-24', name: 'Cola', flavor: 'Classic',       category: 1, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.99, stock: 180, overStockLimit: 20 },
  { id: 4,  code: 'COL-CHC-24', name: 'Cola', flavor: 'Cherry',        category: 1, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.99, stock: 65,  overStockLimit: 10 },
  { id: 19, code: 'COL-BKC-24', name: 'Cola', flavor: 'Black Cherry',  category: 1, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.99, stock: 55,  overStockLimit: 10 },
  { id: 5,  code: 'COL-VAN-24', name: 'Cola', flavor: 'Vanilla',       category: 1, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.99, stock: 40,  overStockLimit: 10 },
  { id: 6,  code: 'COL-ZRC-24', name: 'Cola', flavor: 'Zero Sugar',    category: 1, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.99, stock: 150, overStockLimit: 20 },
  { id: 20, code: 'COL-CTZ-24', name: 'Cola', flavor: 'Citrus Burst',  category: 1, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.99, stock: 35,  overStockLimit: 10 },
  // ── Cola — 12oz Can 12-pack ──
  { id: 21, code: 'COL-12C-12', name: 'Cola', flavor: 'Classic',       category: 1, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.58, price:  6.89, stock: 120, overStockLimit: 20 },
  { id: 22, code: 'COL-CHC-12', name: 'Cola', flavor: 'Cherry',        category: 1, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.58, price:  6.89, stock: 55,  overStockLimit: 10 },
  { id: 23, code: 'COL-BKC-12', name: 'Cola', flavor: 'Black Cherry',  category: 1, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.58, price:  6.89, stock: 45,  overStockLimit: 10 },
  { id: 24, code: 'COL-ZRC-12', name: 'Cola', flavor: 'Zero Sugar',    category: 1, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.58, price:  6.89, stock: 95,  overStockLimit: 15 },
  // ── Cola — 12oz Can 6-pack ──
  { id: 25, code: 'COL-12C-6',  name: 'Cola', flavor: 'Classic',       category: 1, size: '12oz Can', material: 'Aluminum', packSize: '6-pack',  unit: 'CS', unitPrice: 0.62, price:  3.69, stock: 80,  overStockLimit: 15 },
  { id: 26, code: 'COL-ZRC-6',  name: 'Cola', flavor: 'Zero Sugar',    category: 1, size: '12oz Can', material: 'Aluminum', packSize: '6-pack',  unit: 'CS', unitPrice: 0.62, price:  3.69, stock: 60,  overStockLimit: 10 },
  // ── Cola — 20oz Bottle ──
  { id: 2,  code: 'COL-20P-24', name: 'Cola', flavor: 'Classic',       category: 1, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.95, price: 22.50, stock: 95,  overStockLimit: 20 },
  { id: 7,  code: 'COL-ZRP-24', name: 'Cola', flavor: 'Zero Sugar',    category: 1, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.95, price: 22.50, stock: 70,  overStockLimit: 15 },
  { id: 27, code: 'COL-CHC-20', name: 'Cola', flavor: 'Cherry',        category: 1, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.95, price: 22.50, stock: 40,  overStockLimit: 10 },
  { id: 28, code: 'COL-BKC-20', name: 'Cola', flavor: 'Black Cherry',  category: 1, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.95, price: 22.50, stock: 30,  overStockLimit: 10 },
  // ── Cola — 20oz Bottle 6-pack ──
  { id: 29, code: 'COL-20P-6',  name: 'Cola', flavor: 'Classic',       category: 1, size: '20oz Bottle', material: 'Plastic', packSize: '6-pack',  unit: 'CS', unitPrice: 0.99, price:  5.89, stock: 60,  overStockLimit: 10 },
  { id: 30, code: 'COL-ZRP-6',  name: 'Cola', flavor: 'Zero Sugar',    category: 1, size: '20oz Bottle', material: 'Plastic', packSize: '6-pack',  unit: 'CS', unitPrice: 0.99, price:  5.89, stock: 45,  overStockLimit: 10 },
  // ── Cola — 2L Bottle ──
  { id: 3,  code: 'COL-2LP-6',  name: 'Cola', flavor: 'Classic',       category: 1, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unit: 'CS', unitPrice: 1.69, price:  9.99, stock: 120, overStockLimit: 20 },
  { id: 31, code: 'COL-CHC-2L', name: 'Cola', flavor: 'Cherry',        category: 1, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unit: 'CS', unitPrice: 1.69, price:  9.99, stock: 45,  overStockLimit: 10 },
  { id: 32, code: 'COL-ZRC-2L', name: 'Cola', flavor: 'Zero Sugar',    category: 1, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unit: 'CS', unitPrice: 1.69, price:  9.99, stock: 70,  overStockLimit: 15 },

  // ══ Lemon-Lime & Citrus — 12oz Can 24-pack ══
  { id: 8,  code: 'LEM-12C-24', name: 'Lemon-Lime', flavor: 'Original',    category: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.99, stock: 175, overStockLimit: 20 },
  { id: 11, code: 'LEM-ZRC-24', name: 'Lemon-Lime', flavor: 'Zero Sugar',  category: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.99, stock: 60,  overStockLimit: 10 },
  { id: 12, code: 'ORA-12C-24', name: 'Orange',     flavor: 'Original',    category: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.49, stock: 85,  overStockLimit: 15 },
  { id: 33, code: 'ORA-ZRC-24', name: 'Orange',     flavor: 'Zero Sugar',  category: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.49, stock: 50,  overStockLimit: 10 },
  { id: 13, code: 'GRA-12C-24', name: 'Grape',      flavor: 'Original',    category: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.49, stock: 50,  overStockLimit: 10 },
  { id: 14, code: 'STR-12C-24', name: 'Strawberry', flavor: 'Original',    category: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.49, stock: 0,   overStockLimit: 0  },
  { id: 34, code: 'BKC-12C-24', name: 'Black Cherry',flavor:'Original',    category: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.49, stock: 70,  overStockLimit: 10 },
  { id: 35, code: 'GPF-12C-24', name: 'Grapefruit', flavor: 'Original',    category: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.49, stock: 60,  overStockLimit: 10 },
  { id: 36, code: 'WTM-12C-24', name: 'Watermelon', flavor: 'Original',    category: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.49, stock: 45,  overStockLimit: 10 },
  { id: 37, code: 'PNP-12C-24', name: 'Pineapple',  flavor: 'Original',    category: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.49, stock: 35,  overStockLimit: 10 },
  { id: 38, code: 'FPH-12C-24', name: 'Fruit Punch',flavor: 'Original',    category: 2, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 12.49, stock: 80,  overStockLimit: 15 },
  // ── Lemon-Lime & Citrus — 12oz Can 12-pack ──
  { id: 39, code: 'LEM-12C-12', name: 'Lemon-Lime',  flavor: 'Original',   category: 2, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.58, price:  6.89, stock: 110, overStockLimit: 15 },
  { id: 40, code: 'ORA-12C-12', name: 'Orange',       flavor: 'Original',   category: 2, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.58, price:  6.89, stock: 65,  overStockLimit: 10 },
  { id: 41, code: 'BKC-12C-12', name: 'Black Cherry', flavor: 'Original',   category: 2, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.58, price:  6.89, stock: 55,  overStockLimit: 10 },
  { id: 42, code: 'GPF-12C-12', name: 'Grapefruit',   flavor: 'Original',   category: 2, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.58, price:  6.89, stock: 40,  overStockLimit: 10 },
  { id: 43, code: 'WTM-12C-12', name: 'Watermelon',   flavor: 'Original',   category: 2, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.58, price:  6.89, stock: 30,  overStockLimit: 10 },
  // ── Lemon-Lime & Citrus — 20oz Bottle ──
  { id: 9,  code: 'LEM-20P-24', name: 'Lemon-Lime',  flavor: 'Original',   category: 2, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.95, price: 22.50, stock: 80,  overStockLimit: 15 },
  { id: 44, code: 'ORA-20P-24', name: 'Orange',       flavor: 'Original',   category: 2, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.95, price: 22.50, stock: 55,  overStockLimit: 10 },
  { id: 45, code: 'BKC-20P-24', name: 'Black Cherry', flavor: 'Original',   category: 2, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.95, price: 22.50, stock: 35,  overStockLimit: 10 },
  // ── Lemon-Lime & Citrus — 2L Bottle ──
  { id: 10, code: 'LEM-2LP-6',  name: 'Lemon-Lime',  flavor: 'Original',   category: 2, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unit: 'CS', unitPrice: 1.69, price:  9.99, stock: 100, overStockLimit: 20 },
  { id: 46, code: 'ORA-2LP-6',  name: 'Orange',       flavor: 'Original',   category: 2, size: '2L Bottle', material: 'Plastic', packSize: '6-pack', unit: 'CS', unitPrice: 1.69, price:  9.99, stock: 55,  overStockLimit: 10 },

  // ══ Root Beer & Cream — 12oz Can 24-pack ══
  { id: 15, code: 'RBR-12C-24', name: 'Root Beer',  flavor: 'Classic',    category: 3, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 11.99, stock: 95,  overStockLimit: 15 },
  { id: 47, code: 'RBR-HNY-24', name: 'Root Beer',  flavor: 'Honey',      category: 3, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 11.99, stock: 45,  overStockLimit: 10 },
  { id: 17, code: 'CRM-12C-24', name: 'Cream Soda', flavor: 'Classic',    category: 3, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 11.99, stock: 55,  overStockLimit: 10 },
  { id: 48, code: 'CRM-BKC-24', name: 'Cream Soda', flavor: 'Black Cherry',category:3, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 11.99, stock: 40,  overStockLimit: 10 },
  { id: 49, code: 'CRM-VAN-24', name: 'Cream Soda', flavor: 'Vanilla',    category: 3, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.55, price: 11.99, stock: 30,  overStockLimit: 10 },
  // ── Root Beer & Cream — 12oz Can 12-pack ──
  { id: 50, code: 'RBR-12C-12', name: 'Root Beer',  flavor: 'Classic',    category: 3, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.58, price:  7.19, stock: 70,  overStockLimit: 10 },
  { id: 51, code: 'CRM-12C-12', name: 'Cream Soda', flavor: 'Classic',    category: 3, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.58, price:  7.19, stock: 40,  overStockLimit: 10 },
  // ── Root Beer & Cream — 20oz Bottle ──
  { id: 52, code: 'RBR-20P-24', name: 'Root Beer',  flavor: 'Classic',    category: 3, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.99, price: 23.50, stock: 40,  overStockLimit: 10 },
  { id: 53, code: 'CRM-20P-24', name: 'Cream Soda', flavor: 'Classic',    category: 3, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.99, price: 23.50, stock: 25,  overStockLimit: 5  },
  // ── Root Beer & Cream — 12oz Glass Bottle 24-pack ──
  { id: 16, code: 'RBR-12G-24', name: 'Root Beer',  flavor: 'Classic',    category: 3, size: '12oz Glass Bottle', material: 'Glass',    packSize: '24-pack', unit: 'CS', unitPrice: 0.85, price: 19.99, stock: 30,  overStockLimit: 5 },
  { id: 18, code: 'CRM-12G-24', name: 'Cream Soda', flavor: 'Classic',    category: 3, size: '12oz Glass Bottle', material: 'Glass',    packSize: '24-pack', unit: 'CS', unitPrice: 0.85, price: 19.99, stock: 15,  overStockLimit: 5 },
  { id: 54, code: 'RBR-HNY-G',  name: 'Root Beer',  flavor: 'Honey',      category: 3, size: '12oz Glass Bottle', material: 'Glass',    packSize: '24-pack', unit: 'CS', unitPrice: 0.85, price: 19.99, stock: 20,  overStockLimit: 5 },
  // ── Root Beer & Cream — 12oz Glass Bottle 12-pack ──
  { id: 55, code: 'RBR-12G-12', name: 'Root Beer',  flavor: 'Classic',    category: 3, size: '12oz Glass Bottle', material: 'Glass',    packSize: '12-pack', unit: 'CS', unitPrice: 0.89, price: 10.69, stock: 25,  overStockLimit: 5 },
  { id: 56, code: 'CRM-12G-12', name: 'Cream Soda', flavor: 'Classic',    category: 3, size: '12oz Glass Bottle', material: 'Glass',    packSize: '12-pack', unit: 'CS', unitPrice: 0.89, price: 10.69, stock: 12,  overStockLimit: 5 },
  { id: 57, code: 'CRM-VAN-G',  name: 'Cream Soda', flavor: 'Vanilla',    category: 3, size: '12oz Glass Bottle', material: 'Glass',    packSize: '12-pack', unit: 'CS', unitPrice: 0.89, price: 10.69, stock: 10,  overStockLimit: 5 },

  // ══ Seltzer — 12oz Can 24-pack ══
  { id: 58, code: 'SEL-PLN-24', name: 'Seltzer', flavor: 'Plain',         category: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.48, price: 11.49, stock: 200, overStockLimit: 30 },
  { id: 59, code: 'SEL-LLM-24', name: 'Seltzer', flavor: 'Lemon Lime',    category: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.48, price: 11.49, stock: 175, overStockLimit: 25 },
  { id: 60, code: 'SEL-BKC-24', name: 'Seltzer', flavor: 'Black Cherry',  category: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.48, price: 11.49, stock: 150, overStockLimit: 25 },
  { id: 61, code: 'SEL-ORA-24', name: 'Seltzer', flavor: 'Orange',        category: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.48, price: 11.49, stock: 130, overStockLimit: 20 },
  { id: 62, code: 'SEL-GPF-24', name: 'Seltzer', flavor: 'Grapefruit',    category: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.48, price: 11.49, stock: 110, overStockLimit: 20 },
  { id: 63, code: 'SEL-RSP-24', name: 'Seltzer', flavor: 'Raspberry',     category: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.48, price: 11.49, stock: 95,  overStockLimit: 15 },
  { id: 64, code: 'SEL-WTM-24', name: 'Seltzer', flavor: 'Watermelon',    category: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.48, price: 11.49, stock: 80,  overStockLimit: 15 },
  { id: 65, code: 'SEL-PCH-24', name: 'Seltzer', flavor: 'Peach',         category: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.48, price: 11.49, stock: 70,  overStockLimit: 15 },
  { id: 66, code: 'SEL-MNG-24', name: 'Seltzer', flavor: 'Mango',         category: 4, size: '12oz Can', material: 'Aluminum', packSize: '24-pack', unit: 'CS', unitPrice: 0.48, price: 11.49, stock: 60,  overStockLimit: 15 },
  // ── Seltzer — 12oz Can 12-pack ──
  { id: 67, code: 'SEL-PLN-12', name: 'Seltzer', flavor: 'Plain',         category: 4, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.50, price:  5.99, stock: 160, overStockLimit: 25 },
  { id: 68, code: 'SEL-LLM-12', name: 'Seltzer', flavor: 'Lemon Lime',    category: 4, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.50, price:  5.99, stock: 140, overStockLimit: 20 },
  { id: 69, code: 'SEL-BKC-12', name: 'Seltzer', flavor: 'Black Cherry',  category: 4, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.50, price:  5.99, stock: 120, overStockLimit: 20 },
  { id: 70, code: 'SEL-ORA-12', name: 'Seltzer', flavor: 'Orange',        category: 4, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.50, price:  5.99, stock: 100, overStockLimit: 15 },
  { id: 71, code: 'SEL-GPF-12', name: 'Seltzer', flavor: 'Grapefruit',    category: 4, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.50, price:  5.99, stock: 85,  overStockLimit: 15 },
  { id: 72, code: 'SEL-RSP-12', name: 'Seltzer', flavor: 'Raspberry',     category: 4, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.50, price:  5.99, stock: 75,  overStockLimit: 15 },
  { id: 73, code: 'SEL-WTM-12', name: 'Seltzer', flavor: 'Watermelon',    category: 4, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.50, price:  5.99, stock: 65,  overStockLimit: 10 },
  { id: 74, code: 'SEL-PCH-12', name: 'Seltzer', flavor: 'Peach',         category: 4, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.50, price:  5.99, stock: 55,  overStockLimit: 10 },
  { id: 75, code: 'SEL-MNG-12', name: 'Seltzer', flavor: 'Mango',         category: 4, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.50, price:  5.99, stock: 50,  overStockLimit: 10 },
  { id: 76, code: 'SEL-CKL-12', name: 'Seltzer', flavor: 'Cucumber Lime', category: 4, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.50, price:  5.99, stock: 40,  overStockLimit: 10 },
  { id: 77, code: 'SEL-MXB-12', name: 'Seltzer', flavor: 'Mixed Berry',   category: 4, size: '12oz Can', material: 'Aluminum', packSize: '12-pack', unit: 'CS', unitPrice: 0.50, price:  5.99, stock: 35,  overStockLimit: 10 },
  // ── Seltzer — 12oz Can 6-pack ──
  { id: 78, code: 'SEL-PLN-6',  name: 'Seltzer', flavor: 'Plain',         category: 4, size: '12oz Can', material: 'Aluminum', packSize: '6-pack',  unit: 'CS', unitPrice: 0.52, price:  3.09, stock: 120, overStockLimit: 20 },
  { id: 79, code: 'SEL-LLM-6',  name: 'Seltzer', flavor: 'Lemon Lime',    category: 4, size: '12oz Can', material: 'Aluminum', packSize: '6-pack',  unit: 'CS', unitPrice: 0.52, price:  3.09, stock: 100, overStockLimit: 15 },
  { id: 80, code: 'SEL-BKC-6',  name: 'Seltzer', flavor: 'Black Cherry',  category: 4, size: '12oz Can', material: 'Aluminum', packSize: '6-pack',  unit: 'CS', unitPrice: 0.52, price:  3.09, stock: 90,  overStockLimit: 15 },
  { id: 81, code: 'SEL-ORA-6',  name: 'Seltzer', flavor: 'Orange',        category: 4, size: '12oz Can', material: 'Aluminum', packSize: '6-pack',  unit: 'CS', unitPrice: 0.52, price:  3.09, stock: 75,  overStockLimit: 15 },
  { id: 82, code: 'SEL-RSP-6',  name: 'Seltzer', flavor: 'Raspberry',     category: 4, size: '12oz Can', material: 'Aluminum', packSize: '6-pack',  unit: 'CS', unitPrice: 0.52, price:  3.09, stock: 60,  overStockLimit: 10 },
  { id: 83, code: 'SEL-WTM-6',  name: 'Seltzer', flavor: 'Watermelon',    category: 4, size: '12oz Can', material: 'Aluminum', packSize: '6-pack',  unit: 'CS', unitPrice: 0.52, price:  3.09, stock: 50,  overStockLimit: 10 },
  // ── Seltzer — 20oz Bottle ──
  { id: 84, code: 'SEL-PLN-20', name: 'Seltzer', flavor: 'Plain',         category: 4, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.85, price: 20.39, stock: 90,  overStockLimit: 15 },
  { id: 85, code: 'SEL-LLM-20', name: 'Seltzer', flavor: 'Lemon Lime',    category: 4, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.85, price: 20.39, stock: 75,  overStockLimit: 15 },
  { id: 86, code: 'SEL-BKC-20', name: 'Seltzer', flavor: 'Black Cherry',  category: 4, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.85, price: 20.39, stock: 60,  overStockLimit: 10 },
  { id: 87, code: 'SEL-ORA-20', name: 'Seltzer', flavor: 'Orange',        category: 4, size: '20oz Bottle', material: 'Plastic', packSize: '24-pack', unit: 'CS', unitPrice: 0.85, price: 20.39, stock: 50,  overStockLimit: 10 },
];

export const CRV_RATES = {
  '12oz Can': 0.05,
  '12oz Glass Bottle': 0.05,
  '20oz Bottle': 0.10, '2L Bottle': 0.10,
};

// Notification preferences per customer (keyed by customer id)
export const NOTIFICATION_PREFS = {
  1: { orderConfirm: true,  invoiceSent: true,  paymentReminder: true,  method: 'email' },
  2: { orderConfirm: true,  invoiceSent: true,  paymentReminder: true,  method: 'email' },
  3: { orderConfirm: false, invoiceSent: true,  paymentReminder: true,  method: 'both'  },
  4: { orderConfirm: true,  invoiceSent: true,  paymentReminder: false, method: 'email' },
  5: { orderConfirm: true,  invoiceSent: false, paymentReminder: true,  method: 'sms'   },
  6: { orderConfirm: true,  invoiceSent: true,  paymentReminder: true,  method: 'email' },
  7: { orderConfirm: true,  invoiceSent: true,  paymentReminder: false, method: 'email' },
  8: { orderConfirm: false, invoiceSent: false, paymentReminder: false, method: 'email' },
  9: { orderConfirm: true,  invoiceSent: true,  paymentReminder: true,  method: 'both'  },
  10:{ orderConfirm: false, invoiceSent: false, paymentReminder: false, method: 'email' },
};

export const ORDERS = [
  { id: 'ORD-2601', customer: 1, date: '2026-02-26', deliveryDate: '2026-02-27', status: 'Delivered',
    items: [{productId:1,qty:10},{productId:6,qty:8},{productId:8,qty:5}], total: 326.37, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2602', customer: 2, date: '2026-02-26', deliveryDate: '2026-02-27', status: 'Out for Delivery',
    items: [{productId:1,qty:12},{productId:12,qty:6}], total: 252.42, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2603', customer: 4, date: '2026-02-26', deliveryDate: '2026-02-27', status: 'Picking',
    items: [{productId:1,qty:15},{productId:8,qty:15},{productId:15,qty:6}], total: 504.84, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2604', customer: 3, date: '2026-02-26', deliveryDate: '2026-02-27', status: 'Pending',
    items: [{productId:8,qty:4},{productId:4,qty:3},{productId:17,qty:5}], total: 150.36, salesperson: 'Nicole', route: 'Route B-2' },
  { id: 'ORD-2605', customer: 7, date: '2026-02-26', deliveryDate: '2026-02-27', status: 'Pending',
    items: [{productId:1,qty:20},{productId:8,qty:20},{productId:12,qty:10}], total: 704.50, salesperson: 'Nicole', route: 'Route B-2' },
  { id: 'ORD-2606', customer: 5, date: '2026-02-25', deliveryDate: '2026-02-26', status: 'Delivered',
    items: [{productId:1,qty:5},{productId:15,qty:3}], total: 110.52, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2607', customer: 9, date: '2026-02-26', deliveryDate: '2026-02-27', status: 'Picking',
    items: [{productId:1,qty:20},{productId:6,qty:15},{productId:8,qty:10},{productId:3,qty:8},{productId:15,qty:10}], total: 770.75, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2608', customer: 8, date: '2026-02-25', deliveryDate: '2026-02-26', status: 'Delivered',
    items: [{productId:4,qty:4},{productId:15,qty:3},{productId:17,qty:2}], total: 122.71, salesperson: 'Nicole', route: 'Route C-3' },
  { id: 'ORD-2609', customer: 6, date: '2026-02-26', deliveryDate: '2026-02-27', status: 'Confirmed',
    items: [{productId:1,qty:8},{productId:8,qty:8},{productId:15,qty:4},{productId:5,qty:6}], total: 365.52, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2610', customer: 10, date: '2026-02-26', deliveryDate: '2026-02-27', status: 'Hold',
    items: [{productId:8,qty:10},{productId:17,qty:2}], total: 168.28, salesperson: 'Nicole', route: 'Route C-3' },
];

export const INVOICES = [
  { id: 'INV-4401', orderId: 'ORD-2601', customer: 1, date: '2026-02-26', due: '2026-03-28', total: 326.37, paid: 0, status: 'Open', locked: false },
  { id: 'INV-4402', orderId: 'ORD-2606', customer: 5, date: '2026-02-25', due: '2026-03-12', total: 110.52, paid: 0, status: 'Open', locked: false },
  { id: 'INV-4403', orderId: 'ORD-2608', customer: 8, date: '2026-02-25', due: '2026-03-27', total: 122.71, paid: 122.71, status: 'Paid', locked: true },
  { id: 'INV-4390', orderId: null, customer: 3, date: '2026-02-10', due: '2026-02-25', total: 1250.00, paid: 0, status: 'Overdue', locked: true },
  { id: 'INV-4385', orderId: null, customer: 7, date: '2026-02-01', due: '2026-02-01', total: 3400.00, paid: 1000.00, status: 'Partial', locked: true },
  { id: 'INV-4370', orderId: null, customer: 10, date: '2026-01-20', due: '2026-01-20', total: 890.00, paid: 0, status: 'Overdue', locked: true },
  { id: 'INV-4350', orderId: null, customer: 9, date: '2026-01-15', due: '2026-02-14', total: 5200.00, paid: 5200.00, status: 'Paid', locked: true },
  { id: 'INV-4340', orderId: null, customer: 2, date: '2026-01-10', due: '2026-02-09', total: 1800.00, paid: 1800.00, status: 'Paid', locked: true },
];

export const PAYMENTS = [
  { id: 'PMT-8801', invoice: 'INV-4403', customer: 8, date: '2026-02-25', amount: 122.71, method: 'Card on File', ref: 'AUTH-9821', status: 'Completed' },
  { id: 'PMT-8802', invoice: 'INV-4385', customer: 7, date: '2026-02-15', amount: 1000.00, method: 'Wire Transfer', ref: 'WIR-12345', status: 'Completed' },
  { id: 'PMT-8803', invoice: 'INV-4350', customer: 9, date: '2026-02-14', amount: 5200.00, method: 'ACH', ref: 'ACH-67890', status: 'Completed' },
  { id: 'PMT-8804', invoice: 'INV-4340', customer: 2, date: '2026-02-09', amount: 1800.00, method: 'Check #3312', ref: 'DEP-0209', status: 'Completed' },
];

export const JOURNAL_ENTRIES = [
  { id: 'JE-0026', date: '2026-02-26', desc: 'Sales — INV-4401 Bella Cucina', debit: 'Accounts Receivable', credit: 'Sales Revenue', amount: 326.37 },
  { id: 'JE-0025', date: '2026-02-25', desc: 'Payment — PMT-8801 Sunrise Bakery', debit: 'Cash', credit: 'Accounts Receivable', amount: 122.71 },
  { id: 'JE-0024', date: '2026-02-25', desc: 'Sales — INV-4402 Tony\'s Pizza', debit: 'Accounts Receivable', credit: 'Sales Revenue', amount: 110.52 },
  { id: 'JE-0023', date: '2026-02-15', desc: 'Payment — PMT-8802 Cambridge Catering', debit: 'Cash', credit: 'Accounts Receivable', amount: 1000.00 },
  { id: 'JE-0022', date: '2026-02-14', desc: 'Payment — PMT-8803 Waterfront Hotel', debit: 'Cash', credit: 'Accounts Receivable', amount: 5200.00 },
];

export const ROUTES = [
  { id: 'Route A-1', name: 'Route A-1: Downtown Boston', driver: 'Mike Roberts', truck: 'TRK-01 (Refrigerated 26ft)', stops: 6, status: 'In Progress', pct: 50 },
  { id: 'Route B-2', name: 'Route B-2: Cambridge / Somerville', driver: 'Tom Davis', truck: 'TRK-03 (Refrigerated 20ft)', stops: 5, status: 'Loading', pct: 0 },
  { id: 'Route C-3', name: 'Route C-3: South Shore', driver: 'Unassigned', truck: 'TRK-05 (Box 16ft)', stops: 4, status: 'Not Started', pct: 0 },
];

export const USERS = [
  { id: 1, name: 'Marcus Johnson', role: 'Salesperson', email: 'marcus@erp.local', status: 'Active', lastLogin: '2026-02-26 08:12' },
  { id: 2, name: 'Nicole Rivera', role: 'Salesperson', email: 'nicole@erp.local', status: 'Active', lastLogin: '2026-02-26 07:45' },
  { id: 3, name: 'Mike Roberts', role: 'Driver', email: 'mike@erp.local', status: 'Active', lastLogin: '2026-02-26 06:00' },
  { id: 4, name: 'Tom Davis', role: 'Driver', email: 'tom@erp.local', status: 'Active', lastLogin: '2026-02-26 06:30' },
  { id: 5, name: 'Rachel Green', role: 'Warehouse', email: 'rachel@erp.local', status: 'Active', lastLogin: '2026-02-26 05:45' },
  { id: 6, name: 'Lisa Chen', role: 'Accounting', email: 'lisa@erp.local', status: 'Active', lastLogin: '2026-02-26 08:00' },
  { id: 7, name: 'Steve Kim', role: 'Route Planner', email: 'steve@erp.local', status: 'Active', lastLogin: '2026-02-26 07:00' },
  { id: 8, name: 'Admin', role: 'Admin', email: 'admin@erp.local', status: 'Active', lastLogin: '2026-02-26 09:00' },
  { id: 9, name: 'Karen Miller', role: 'Manager', email: 'karen@erp.local', status: 'Active', lastLogin: '2026-02-26 08:30' },
];

export const TRUCKS = [
  { id: 'TRK-01', name: 'Refrigerated 26ft', plate: 'MA-1234', status: 'In Use', driver: 'Mike Roberts' },
  { id: 'TRK-02', name: 'Refrigerated 26ft', plate: 'MA-2345', status: 'Available', driver: null },
  { id: 'TRK-03', name: 'Refrigerated 20ft', plate: 'MA-3456', status: 'In Use', driver: 'Tom Davis' },
  { id: 'TRK-04', name: 'Refrigerated 20ft', plate: 'MA-4567', status: 'Maintenance', driver: null },
  { id: 'TRK-05', name: 'Box 16ft', plate: 'MA-5678', status: 'Available', driver: null },
];

export const ACCOUNT_CREDITS = { 7: 750.00, 9: 500.00 };

export const CREDIT_TIERS = [
  { tier: 'A', limit: '$50,000', terms: 'NET-30', desc: 'Established — 2+ years, always on time' },
  { tier: 'B', limit: '$15,000', terms: 'NET-15', desc: 'Good Standing — reliable payment history' },
  { tier: 'C', limit: '$8,000', terms: 'COD', desc: 'New or Flagged — cash on delivery required' },
  { tier: 'Prepay', limit: '$0', terms: 'Prepay', desc: 'No credit — full payment required before order confirmation' },
];

export const PRICE_LEVELS = [
  { id: 1, name: 'Restaurant Standard', customers: 5, markup: 'Base + 15%' },
  { id: 2, name: 'Premium', customers: 2, markup: 'Base + 8%' },
  { id: 3, name: 'Wholesale', customers: 1, markup: 'Base cost' },
  { id: 4, name: 'Deli Standard', customers: 1, markup: 'Base + 20%' },
  { id: 5, name: 'Bakery', customers: 1, markup: 'Base + 18%' },
  { id: 6, name: 'Cafe Standard', customers: 1, markup: 'Base + 22%' },
];

// ═══════════════════════════════════════════════════════════
//  SALESPERSON PERFORMANCE METRICS (demo)
// ═══════════════════════════════════════════════════════════
export const SALES_PERFORMANCE = {
  1: { // Marcus Johnson
    totalRevenue: 148250.00, ordersThisMonth: 42, avgOrderValue: 3529.76, collectionRate: 94.2,
    outstanding: 12400.00, overdue: 3200.00, discountAvg: 7.8, customersServed: 6,
    topProducts: [1, 8, 6], quota: 160000, quotaPct: 92.7, lastActivity: '2026-02-26',
    avgDeliveryDays: 1.2, returnRate: 1.5, newAccounts: 2, lostAccounts: 0,
    monthlyRevenue: [12800, 13500, 11200, 14800, 12400, 13900, 15200, 14100, 12600, 13400, 14800, 16200],
  },
  2: { // Nicole Rivera
    totalRevenue: 89400.00, ordersThisMonth: 28, avgOrderValue: 3192.86, collectionRate: 88.5,
    outstanding: 8900.00, overdue: 5600.00, discountAvg: 11.2, customersServed: 4,
    topProducts: [8, 4, 15], quota: 100000, quotaPct: 89.4, lastActivity: '2026-02-26',
    avgDeliveryDays: 1.4, returnRate: 2.1, newAccounts: 1, lostAccounts: 1,
    monthlyRevenue: [7200, 8100, 7600, 8800, 7400, 9200, 8600, 7900, 8300, 9100, 8800, 9400],
  },
};

// Customer-level revenue/activity metrics (demo pre-computed)
export const CUSTOMER_METRICS = {
  1:  { revenue: 42800, orders: 18, avgOrder: 2378, lastPayment: '2026-02-20', daysSinceOrder: 2,  overdue: 0,     paidOnTime: 95, topProducts: [1,6,8],    avgPayDays: 22 },
  2:  { revenue: 28500, orders: 14, avgOrder: 2036, lastPayment: '2026-02-09', daysSinceOrder: 1,  overdue: 0,     paidOnTime: 100,topProducts: [1,12],     avgPayDays: 18 },
  3:  { revenue: 15200, orders: 12, avgOrder: 1267, lastPayment: '2026-01-15', daysSinceOrder: 3,  overdue: 1250,  paidOnTime: 72, topProducts: [8,4,17],   avgPayDays: 28 },
  4:  { revenue: 68400, orders: 22, avgOrder: 3109, lastPayment: '2026-02-14', daysSinceOrder: 0,  overdue: 0,     paidOnTime: 98, topProducts: [1,8,15],   avgPayDays: 15 },
  5:  { revenue: 9800,  orders: 8,  avgOrder: 1225, lastPayment: '2026-02-18', daysSinceOrder: 4,  overdue: 0,     paidOnTime: 88, topProducts: [1,15],     avgPayDays: 20 },
  6:  { revenue: 22400, orders: 15, avgOrder: 1493, lastPayment: '2026-02-22', daysSinceOrder: 1,  overdue: 0,     paidOnTime: 90, topProducts: [1,8,5],    avgPayDays: 19 },
  7:  { revenue: 38600, orders: 10, avgOrder: 3860, lastPayment: '2026-02-15', daysSinceOrder: 16, overdue: 2400,  paidOnTime: 65, topProducts: [1,8,12],   avgPayDays: 35 },
  8:  { revenue: 8200,  orders: 10, avgOrder: 820,  lastPayment: '2026-02-25', daysSinceOrder: 1,  overdue: 0,     paidOnTime: 100,topProducts: [4,15,17],  avgPayDays: 14 },
  9:  { revenue: 92500, orders: 24, avgOrder: 3854, lastPayment: '2026-02-14', daysSinceOrder: 0,  overdue: 0,     paidOnTime: 96, topProducts: [1,6,8,3],  avgPayDays: 20 },
  10: { revenue: 5400,  orders: 6,  avgOrder: 900,  lastPayment: '2026-01-10', daysSinceOrder: 29, overdue: 890,   paidOnTime: 50, topProducts: [8,17],     avgPayDays: 42 },
};

// Product-level revenue/sales metrics (demo pre-computed)
export const PRODUCT_METRICS = {
  1:  { unitsSold: 820, revenue: 10647.80, topCustomers: [1,4,9],  avgDiscount: 5.2, returnRate: 0.8  },
  4:  { unitsSold: 280, revenue: 3637.20,  topCustomers: [3,8],    avgDiscount: 6.1, returnRate: 1.2  },
  6:  { unitsSold: 540, revenue: 7014.60,  topCustomers: [1,9],    avgDiscount: 4.8, returnRate: 0.5  },
  8:  { unitsSold: 680, revenue: 8833.20,  topCustomers: [4,9,7],  avgDiscount: 5.5, returnRate: 0.9  },
  12: { unitsSold: 310, revenue: 3871.90,  topCustomers: [2,7],    avgDiscount: 7.2, returnRate: 1.0  },
  15: { unitsSold: 420, revenue: 5035.80,  topCustomers: [4,8,5],  avgDiscount: 4.0, returnRate: 0.6  },
  17: { unitsSold: 180, revenue: 2158.20,  topCustomers: [3,8,10], avgDiscount: 8.5, returnRate: 1.8  },
  3:  { unitsSold: 290, revenue: 2897.10,  topCustomers: [9],      avgDiscount: 3.2, returnRate: 0.3  },
  5:  { unitsSold: 150, revenue: 1948.50,  topCustomers: [6],      avgDiscount: 6.8, returnRate: 1.5  },
};

// ═══════════════════════════════════════════════════════════
//  SAVED VIEWS (demo)
// ═══════════════════════════════════════════════════════════
export const SAVED_VIEWS_SEED = [
  { id: 1, name: 'Overdue Accounts', type: 'customers', icon: '🔴', createdBy: 'Lisa Chen', created: '2026-02-20',
    filters: { hasOverdue: true }, description: 'Customers with overdue balances', customerIds: [3, 7, 10] },
  { id: 2, name: 'VIP Restaurants', type: 'customers', icon: '⭐', createdBy: 'Lisa Chen', created: '2026-02-18',
    filters: { type: 'Restaurant', tier: 'A' }, description: 'Tier A restaurant accounts', customerIds: [1, 2, 4] },
  { id: 3, name: 'High-Volume Accounts', type: 'customers', icon: '📈', createdBy: 'Lisa Chen', created: '2026-02-15',
    filters: { minRevenue: 20000 }, description: 'Customers with >$20K revenue', customerIds: [1, 2, 4, 6, 7, 9] },
  { id: 4, name: 'Prepay & COD', type: 'customers', icon: '💵', createdBy: 'Lisa Chen', created: '2026-02-10',
    filters: { terms: ['Prepay','COD'] }, description: 'Cash-before-delivery accounts', customerIds: [7, 10] },
  { id: 5, name: 'Top Reps Q1', type: 'salespeople', icon: '🏆', createdBy: 'Karen Miller', created: '2026-02-01',
    filters: { minQuotaPct: 85 }, description: 'Reps hitting >85% quota', userIds: [1, 2] },
  { id: 6, name: 'Cola Best Sellers', type: 'products', icon: '🥤', createdBy: 'Lisa Chen', created: '2026-02-12',
    filters: { category: 1, minUnitsSold: 400 }, description: 'Top-selling cola SKUs', productIds: [1, 6] },
];

// Helper functions
export function productById(id) { return PRODUCTS.find(p => p.id === id); }
export function customerById(id) { return CUSTOMERS.find(c => c.id === id); }
export function customerName(id) { const c = customerById(id); return c ? c.name : 'Unknown'; }
export function categoryById(id) { return CATEGORIES.find(c => c.id === id); }
export function orderById(id) { return ORDERS.find(o => o.id === id); }
export function invoicesByCustomer(custId) { return INVOICES.filter(i => i.customer === custId); }
export function ordersByCustomer(custId) { return ORDERS.filter(o => o.customer === custId); }
export function paymentsByCustomer(custId) { return PAYMENTS.filter(p => p.customer === custId); }
export function fmt$(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
export function invoiceByOrder(ordId) { return INVOICES.find(i => i.orderId === ordId) || null; }
export function getCRV(product) {
  const rate = CRV_RATES[product.size] || 0.05;
  const unitsPerPack = parseInt(product.packSize) || 24;
  return rate * unitsPerPack;
}
