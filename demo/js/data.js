// ===== WholesaleERP Demo — Sample Data =====

export const CUSTOMERS = [
  { id: 1, name: 'Bella Cucina Restaurant', code: 'BELL-001', contact: 'Maria Santos', phone: '(617) 555-0112', email: 'maria@bellacucina.com', type: 'Restaurant', creditTier: 'A', balance: 8450.00, creditLimit: 25000, terms: 'NET-30', parentId: null, loc: '245 Hanover St, Boston', priceLevel: 'Restaurant Standard', route: 'Route A-1', status: 'Active', lastOrder: '2026-02-24', avgOrder: 2200 },
  { id: 2, name: 'Harbor Grill', code: 'HARB-002', contact: 'James Chen', phone: '(617) 555-0234', email: 'james@harborgrill.com', type: 'Restaurant', creditTier: 'A', balance: 3200.00, creditLimit: 20000, terms: 'NET-30', parentId: null, loc: '98 Seaport Blvd, Boston', priceLevel: 'Restaurant Standard', route: 'Route A-1', status: 'Active', lastOrder: '2026-02-25', avgOrder: 1800 },
  { id: 3, name: 'Fresh Market Deli', code: 'FRES-003', contact: 'Sarah Kim', phone: '(781) 555-0345', email: 'sarah@freshmarket.com', type: 'Deli', creditTier: 'B', balance: 12300.00, creditLimit: 15000, terms: 'NET-15', parentId: null, loc: '567 Main St, Cambridge', priceLevel: 'Deli Standard', route: 'Route B-2', status: 'Active', lastOrder: '2026-02-23', avgOrder: 900 },
  { id: 4, name: 'Ocean Prime Seafood', code: 'OCEA-004', contact: 'David Park', phone: '(617) 555-0456', email: 'david@oceanprime.com', type: 'Restaurant', creditTier: 'A', balance: 0, creditLimit: 30000, terms: 'NET-30', parentId: null, loc: '321 Atlantic Ave, Boston', priceLevel: 'Premium', route: 'Route A-1', status: 'Active', lastOrder: '2026-02-26', avgOrder: 3500 },
  { id: 5, name: "Tony's Pizza — Downtown", code: 'TONY-005', contact: 'Tony Russo', phone: '(617) 555-0567', email: 'tony@tonyspizza.com', type: 'Restaurant', creditTier: 'B', balance: 4500.00, creditLimit: 10000, terms: 'NET-15', parentId: 6, loc: '44 Summer St, Boston', priceLevel: 'Restaurant Standard', route: 'Route A-1', status: 'Active', lastOrder: '2026-02-22', avgOrder: 650 },
  { id: 6, name: "Tony's Pizza — HQ", code: 'TONY-000', contact: 'Tony Russo', phone: '(617) 555-0560', email: 'admin@tonyspizza.com', type: 'Restaurant', creditTier: 'B', balance: 7200.00, creditLimit: 25000, terms: 'NET-15', parentId: null, loc: '100 Federal St, Boston', priceLevel: 'Restaurant Standard', route: null, status: 'Active', lastOrder: '2026-02-25', avgOrder: 1400 },
  { id: 7, name: 'Cambridge Catering Co', code: 'CAMB-007', contact: 'Linda Wu', phone: '(617) 555-0678', email: 'linda@cambcatering.com', type: 'Caterer', creditTier: 'C', balance: 18900.00, creditLimit: 20000, terms: 'COD', parentId: null, loc: '890 Mass Ave, Cambridge', priceLevel: 'Wholesale', route: 'Route B-2', status: 'Warning', lastOrder: '2026-02-10', avgOrder: 2800 },
  { id: 8, name: 'Sunrise Bakery', code: 'SUNR-008', contact: 'Emily White', phone: '(781) 555-0789', email: 'emily@sunrisebakery.com', type: 'Bakery', creditTier: 'A', balance: 1200.00, creditLimit: 12000, terms: 'NET-30', parentId: null, loc: '156 Broadway, Somerville', priceLevel: 'Bakery', route: 'Route C-3', status: 'Active', lastOrder: '2026-02-25', avgOrder: 450 },
  { id: 9, name: 'Waterfront Hotel', code: 'WATE-009', contact: 'Robert Taylor', phone: '(617) 555-0890', email: 'chef@waterfronthotel.com', type: 'Hotel', creditTier: 'A', balance: 22000.00, creditLimit: 50000, terms: 'NET-30', parentId: null, loc: '1 Harbor Way, Boston', priceLevel: 'Premium', route: 'Route A-1', status: 'Active', lastOrder: '2026-02-26', avgOrder: 5200 },
  { id: 10, name: 'Green Leaf Cafe', code: 'GREE-010', contact: 'Amy Chen', phone: '(617) 555-0901', email: 'amy@greenleaf.com', type: 'Cafe', creditTier: 'C', balance: 6100.00, creditLimit: 8000, terms: 'COD', parentId: null, loc: '78 Newbury St, Boston', priceLevel: 'Cafe Standard', route: 'Route C-3', status: 'Hold', lastOrder: '2026-01-28', avgOrder: 350 },
];

export const CATEGORIES = [
  { id: 1, name: 'Dairy & Eggs', icon: '🥛' },
  { id: 2, name: 'Produce', icon: '🥬' },
  { id: 3, name: 'Meat & Poultry', icon: '🥩' },
  { id: 4, name: 'Seafood', icon: '🦐' },
  { id: 5, name: 'Dry Goods', icon: '🌾' },
  { id: 6, name: 'Frozen', icon: '🧊' },
  { id: 7, name: 'Beverages', icon: '🥤' },
  { id: 8, name: 'Oils & Condiments', icon: '🫒' },
];

export const PRODUCTS = [
  { id: 1, code: '10101', name: 'Whole Milk', category: 1, unit: 'GAL', packSize: '4/1 GAL', price: 4.29, stock: 340 },
  { id: 2, code: '10102', name: 'Heavy Cream', category: 1, unit: 'QT', packSize: '12/1 QT', price: 5.49, stock: 180 },
  { id: 3, code: '10103', name: 'Large Eggs Grade A', category: 1, unit: 'DOZ', packSize: '15 DOZ', price: 3.99, stock: 420 },
  { id: 4, code: '10204', name: 'Swiss Cheese Block', category: 1, unit: 'LB', packSize: '10 LB', price: 7.89, stock: 95 },
  { id: 5, code: '10205', name: 'Butter Unsalted', category: 1, unit: 'LB', packSize: '36/1 LB', price: 4.59, stock: 260 },
  { id: 6, code: '20101', name: 'Romaine Hearts', category: 2, unit: 'CS', packSize: '24 CT', price: 32.50, stock: 85 },
  { id: 7, code: '20102', name: 'Tomatoes Vine-Ripe', category: 2, unit: 'CS', packSize: '25 LB', price: 28.75, stock: 120 },
  { id: 8, code: '20103', name: 'Yellow Onions', category: 2, unit: 'BG', packSize: '50 LB', price: 18.90, stock: 200 },
  { id: 9, code: '20204', name: 'Red Bell Peppers', category: 2, unit: 'CS', packSize: '25 LB', price: 42.00, stock: 65 },
  { id: 10, code: '20205', name: 'Baby Spinach', category: 2, unit: 'CS', packSize: '4/2.5 LB', price: 22.00, stock: 90 },
  { id: 11, code: '30101', name: 'Chicken Breast Boneless', category: 3, unit: 'CS', packSize: '40 LB', price: 89.50, stock: 75 },
  { id: 12, code: '30102', name: 'Ground Beef 80/20', category: 3, unit: 'CS', packSize: '60 LB', price: 195.00, stock: 45 },
  { id: 13, code: '30203', name: 'Pork Tenderloin', category: 3, unit: 'CS', packSize: '12/1 LB', price: 68.00, stock: 55 },
  { id: 14, code: '30204', name: 'NY Strip Steak', category: 3, unit: 'CS', packSize: '20 LB', price: 265.00, stock: 30 },
  { id: 15, code: '40101', name: 'Atlantic Salmon Fillet', category: 4, unit: 'CS', packSize: '10 LB', price: 125.00, stock: 40 },
  { id: 16, code: '40102', name: 'Jumbo Shrimp 16/20', category: 4, unit: 'CS', packSize: '5 LB', price: 72.00, stock: 60 },
  { id: 17, code: '50101', name: 'All-Purpose Flour', category: 5, unit: 'BG', packSize: '50 LB', price: 22.50, stock: 310 },
  { id: 18, code: '50102', name: 'Granulated Sugar', category: 5, unit: 'BG', packSize: '50 LB', price: 28.00, stock: 280 },
  { id: 19, code: '50203', name: 'Jasmine Rice', category: 5, unit: 'BG', packSize: '50 LB', price: 35.00, stock: 150 },
  { id: 20, code: '60101', name: 'French Fries Crinkle', category: 6, unit: 'CS', packSize: '6/5 LB', price: 38.00, stock: 200 },
  { id: 21, code: '70101', name: 'Coca-Cola Classic', category: 7, unit: 'CS', packSize: '24/12 OZ', price: 18.99, stock: 400 },
  { id: 22, code: '80101', name: 'Extra Virgin Olive Oil', category: 8, unit: 'CS', packSize: '6/1 L', price: 54.00, stock: 130 },
  { id: 23, code: '80102', name: 'Soy Sauce', category: 8, unit: 'CS', packSize: '6/64 OZ', price: 32.00, stock: 110 },
  { id: 24, code: '80203', name: 'Balsamic Vinegar', category: 8, unit: 'CS', packSize: '6/500 ML', price: 28.00, stock: 85 },
];

export const ORDERS = [
  { id: 'ORD-2601', customer: 1, date: '2026-02-26', status: 'Delivered', items: 12, total: 2845.00, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2602', customer: 2, date: '2026-02-26', status: 'Out for Delivery', items: 8, total: 1540.00, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2603', customer: 4, date: '2026-02-26', status: 'Picking', items: 18, total: 4200.00, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2604', customer: 3, date: '2026-02-26', status: 'Pending', items: 6, total: 875.00, salesperson: 'Nicole', route: 'Route B-2' },
  { id: 'ORD-2605', customer: 7, date: '2026-02-26', status: 'Pending', items: 22, total: 3100.00, salesperson: 'Nicole', route: 'Route B-2' },
  { id: 'ORD-2606', customer: 5, date: '2026-02-25', status: 'Delivered', items: 5, total: 650.00, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2607', customer: 9, date: '2026-02-26', status: 'Picking', items: 24, total: 5800.00, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2608', customer: 8, date: '2026-02-25', status: 'Delivered', items: 4, total: 420.00, salesperson: 'Nicole', route: 'Route C-3' },
  { id: 'ORD-2609', customer: 6, date: '2026-02-26', status: 'Confirmed', items: 14, total: 1850.00, salesperson: 'Marcus', route: 'Route A-1' },
  { id: 'ORD-2610', customer: 10, date: '2026-02-26', status: 'Hold', items: 3, total: 280.00, salesperson: 'Nicole', route: 'Route C-3' },
];

export const INVOICES = [
  { id: 'INV-4401', orderId: 'ORD-2601', customer: 1, date: '2026-02-26', due: '2026-03-28', total: 2845.00, paid: 0, status: 'Open', locked: true },
  { id: 'INV-4402', orderId: 'ORD-2606', customer: 5, date: '2026-02-25', due: '2026-03-12', total: 650.00, paid: 0, status: 'Open', locked: true },
  { id: 'INV-4403', orderId: 'ORD-2608', customer: 8, date: '2026-02-25', due: '2026-03-27', total: 420.00, paid: 420.00, status: 'Paid', locked: true },
  { id: 'INV-4390', orderId: 'ORD-2580', customer: 3, date: '2026-02-10', due: '2026-02-25', total: 1250.00, paid: 0, status: 'Overdue', locked: true },
  { id: 'INV-4385', orderId: 'ORD-2575', customer: 7, date: '2026-02-01', due: '2026-02-01', total: 3400.00, paid: 1000.00, status: 'Partial', locked: true },
  { id: 'INV-4370', orderId: 'ORD-2560', customer: 10, date: '2026-01-20', due: '2026-01-20', total: 890.00, paid: 0, status: 'Overdue', locked: true },
  { id: 'INV-4350', orderId: 'ORD-2540', customer: 9, date: '2026-01-15', due: '2026-02-14', total: 5200.00, paid: 5200.00, status: 'Paid', locked: true },
  { id: 'INV-4340', orderId: 'ORD-2530', customer: 2, date: '2026-01-10', due: '2026-02-09', total: 1800.00, paid: 1800.00, status: 'Paid', locked: true },
];

export const PAYMENTS = [
  { id: 'PMT-8801', invoice: 'INV-4403', customer: 8, date: '2026-02-25', amount: 420.00, method: 'Check #4521', ref: 'DEP-0225' },
  { id: 'PMT-8802', invoice: 'INV-4385', customer: 7, date: '2026-02-15', amount: 1000.00, method: 'Wire Transfer', ref: 'WIR-12345' },
  { id: 'PMT-8803', invoice: 'INV-4350', customer: 9, date: '2026-02-14', amount: 5200.00, method: 'ACH', ref: 'ACH-67890' },
  { id: 'PMT-8804', invoice: 'INV-4340', customer: 2, date: '2026-02-09', amount: 1800.00, method: 'Check #3312', ref: 'DEP-0209' },
];

export const JOURNAL_ENTRIES = [
  { id: 'JE-0026', date: '2026-02-26', desc: 'Sales — INV-4401 Bella Cucina', debit: 'Accounts Receivable', credit: 'Sales Revenue', amount: 2845.00 },
  { id: 'JE-0025', date: '2026-02-25', desc: 'Payment — PMT-8801 Sunrise Bakery', debit: 'Cash', credit: 'Accounts Receivable', amount: 420.00 },
  { id: 'JE-0024', date: '2026-02-25', desc: 'Sales — INV-4402 Tony\'s Pizza', debit: 'Accounts Receivable', credit: 'Sales Revenue', amount: 650.00 },
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

export const CREDIT_TIERS = [
  { tier: 'A', limit: '$50,000', terms: 'NET-30', desc: 'Established — 2+ years, always on time' },
  { tier: 'B', limit: '$15,000', terms: 'NET-15', desc: 'Good Standing — reliable payment history' },
  { tier: 'C', limit: '$8,000', terms: 'COD', desc: 'New or Flagged — cash on delivery required' },
];

export const PRICE_LEVELS = [
  { id: 1, name: 'Restaurant Standard', customers: 5, markup: 'Base + 15%' },
  { id: 2, name: 'Premium', customers: 2, markup: 'Base + 8%' },
  { id: 3, name: 'Wholesale', customers: 1, markup: 'Base cost' },
  { id: 4, name: 'Deli Standard', customers: 1, markup: 'Base + 20%' },
  { id: 5, name: 'Bakery', customers: 1, markup: 'Base + 18%' },
  { id: 6, name: 'Cafe Standard', customers: 1, markup: 'Base + 22%' },
];

export function customerById(id) { return CUSTOMERS.find(c => c.id === id); }
export function customerName(id) { const c = customerById(id); return c ? c.name : 'Unknown'; }
export function categoryById(id) { return CATEGORIES.find(c => c.id === id); }
export function fmt$(n) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
