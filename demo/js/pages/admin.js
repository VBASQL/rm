// ===== Admin Screens =====
import { CUSTOMERS, PRODUCTS, CATEGORIES, USERS, TRUCKS, CREDIT_TIERS, PRICE_LEVELS, fmt$ } from '../data.js';

export function adminNav() {
  return [
    { section: 'Users', icon: '👤', label: 'Users & Roles', page: 'main', default: true },
    { section: 'Users', icon: '🔒', label: 'Permissions', page: 'permissions' },
    { section: 'Users', icon: '📱', label: 'Devices', page: 'devices' },
    { section: 'Catalog', icon: '📦', label: 'Products', page: 'products' },
    { section: 'Catalog', icon: '🏷️', label: 'Categories', page: 'categories' },
    { section: 'Pricing', icon: '💲', label: 'Price Lists', page: 'pricing' },
    { section: 'Pricing', icon: '🏷️', label: 'Discount Caps', page: 'discounts' },
    { section: 'Pricing', icon: '📝', label: 'Adjustments', page: 'adjustments' },
    { section: 'Policies', icon: '🔐', label: 'Invoice Lock', page: 'invoice-lock' },
    { section: 'Policies', icon: '⭐', label: 'Credit Tiers', page: 'credit-tiers' },
    { section: 'Policies', icon: '📋', label: 'Order Rules', page: 'order-rules' },
    { section: 'System', icon: '🔔', label: 'Notifications', page: 'notifications' },
    { section: 'System', icon: '💳', label: 'Payment Gateway', page: 'gateway' },
    { section: 'System', icon: '🖨️', label: 'Printers', page: 'printers' },
    { section: 'System', icon: '⚙️', label: 'Settings', page: 'settings' },
    { section: 'System', icon: '📜', label: 'Audit Log', page: 'audit' },
  ];
}

export function renderAdmin(page) {
  const pages = {
    permissions: permissionsPage, devices: devicesPage, products: productsPage,
    categories: categoriesPage, pricing: pricingPage, discounts: discountsPage,
    adjustments: adjustmentsPage, 'invoice-lock': invoiceLockPage, 'credit-tiers': creditTiersPage,
    'order-rules': orderRulesPage, notifications: adminNotifPage, gateway: gatewayPage,
    printers: printersPage, settings: settingsPage, audit: auditPage,
  };
  return (pages[page] || usersPage)();
}

/* ── USERS & ROLES ── */
function usersPage() {
  return `
    <div class="section-title"><h2>👤 Users & Roles</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP.showModal('Add User','<div class=\\'form-group\\'><label>Name</label><input></div><div class=\\'form-group\\'><label>Email</label><input></div><div class=\\'form-group\\'><label>Role</label><select><option>Salesperson</option><option>Warehouse</option><option>Driver</option><option>Accountant</option><option>Manager</option><option>Admin</option></select></div>')">+ Add User</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Active</th><th></th></tr></thead>
        <tbody>${USERS.map(u=>`<tr>
          <td><strong>${u.name}</strong></td><td>${u.email}</td>
          <td><span class="badge badge-${u.role==='Admin'?'purple':u.role==='Manager'?'blue':u.role==='Salesperson'?'green':u.role==='Accountant'?'yellow':u.role==='Driver'?'orange':'cyan'}">${u.role}</span></td>
          <td><span class="badge badge-${u.status==='Active'?'green':'red'}">${u.status}</span></td>
          <td class="text-light text-sm">${u.lastActive}</td>
          <td><button class="btn-outline btn-sm">Edit</button></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

/* ── PERMISSIONS MATRIX ── */
function permissionsPage() {
  const roles = ['Admin','Manager','Accountant','Salesperson','Warehouse','Driver'];
  const perms = [
    { name: 'View Dashboard', roles: [1,1,1,1,1,1] },
    { name: 'Create Orders', roles: [1,1,0,1,0,0] },
    { name: 'Edit Orders', roles: [1,1,0,1,0,0] },
    { name: 'Cancel Orders', roles: [1,1,1,0,0,0] },
    { name: 'Edit Price on Order', roles: [1,1,0,'cap',0,0] },
    { name: 'Apply Discounts', roles: [1,1,0,'cap',0,0] },
    { name: 'View Customer List', roles: [1,1,1,1,0,0] },
    { name: 'Edit Credit Limits', roles: [1,1,1,0,0,0] },
    { name: 'Process Payments', roles: [1,0,1,0,0,0] },
    { name: 'View Invoices', roles: [1,1,1,1,0,0] },
    { name: 'Edit Invoices (unlocked)', roles: [1,1,1,0,0,0] },
    { name: 'Edit Invoices (locked)', roles: [1,0,0,0,0,0] },
    { name: 'Pick Orders', roles: [1,0,0,0,1,0] },
    { name: 'Approve Short Picks', roles: [1,1,0,0,1,0] },
    { name: 'Confirm Deliveries', roles: [1,0,0,0,0,1] },
    { name: 'Edit Delivery Quantities', roles: [1,0,0,0,0,1] },
    { name: 'View Reports', roles: [1,1,1,1,0,0] },
    { name: 'Manage Users', roles: [1,0,0,0,0,0] },
    { name: 'System Settings', roles: [1,0,0,0,0,0] },
    { name: 'View Audit Log', roles: [1,1,0,0,0,0] },
  ];
  return `
    <div class="section-title"><h2>🔒 Permissions Matrix</h2></div>
    <div class="info-box mb-16">RBAC (role-based access control) — each cell shows whether a role has the permission. <span class="badge badge-orange">cap</span> = allowed with discount cap limits.</div>
    <div class="card" style="padding:0;overflow:auto">
      <table style="font-size:12px">
        <thead><tr><th style="min-width:180px">Permission</th>${roles.map(r=>`<th style="text-align:center;min-width:80px">${r}</th>`).join('')}</tr></thead>
        <tbody>${perms.map(p=>`<tr><td>${p.name}</td>${p.roles.map(v=>`<td style="text-align:center">${v===1?'<span class="text-green">✓</span>':v==='cap'?'<span class="badge badge-orange" style="font-size:10px">cap</span>':'<span class="text-light">—</span>'}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </div>`;
}

/* ── DEVICES ── */
function devicesPage() {
  const devices = [
    { name: 'iPhone 15 Pro — Marco', type: 'iOS', user: 'Marco Rossi', enrolled: 'Jan 5 2026', status: 'Active', lastSync: '5 min ago' },
    { name: 'Samsung Tab A8 — WH1', type: 'Android', user: 'Warehouse', enrolled: 'Dec 12 2025', status: 'Active', lastSync: '2 min ago' },
    { name: 'iPhone 14 — Kevin', type: 'iOS', user: 'Kevin Park', enrolled: 'Jan 10 2026', status: 'Active', lastSync: '12 min ago' },
    { name: 'Samsung Tab A8 — WH2', type: 'Android', user: 'Warehouse', enrolled: 'Feb 1 2026', status: 'Active', lastSync: '4 min ago' },
    { name: 'iPhone 13 — Tony', type: 'iOS', user: 'Tony Lopez', enrolled: 'Nov 20 2025', status: 'Inactive', lastSync: '3 days ago' },
  ];
  return `
    <div class="section-title"><h2>📱 Device Management</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP.toast('Device enrollment initiated','')">+ Enroll Device</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Device</th><th>Type</th><th>User</th><th>Enrolled</th><th>Last Sync</th><th>Status</th><th></th></tr></thead>
        <tbody>${devices.map(d=>`<tr>
          <td><strong>${d.name}</strong></td><td>${d.type}</td><td>${d.user}</td>
          <td>${d.enrolled}</td><td class="text-sm">${d.lastSync}</td>
          <td><span class="badge badge-${d.status==='Active'?'green':'red'}">${d.status}</span></td>
          <td><button class="btn-outline btn-sm">Manage</button></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

/* ── PRODUCTS ── */
function productsPage() {
  return `
    <div class="section-title"><h2>📦 Products</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP.showModal('Add Product','<div class=\\'form-group\\'><label>Code</label><input></div><div class=\\'form-group\\'><label>Name</label><input></div><div class=\\'form-row\\'><div class=\\'form-group\\'><label>Category</label><select>${CATEGORIES.map(c=>'<option>'+c.name+'</option>').join('')}</select></div><div class=\\'form-group\\'><label>Price</label><input type=number></div></div>')">+ Add Product</button>
    </div>
    <div class="search-bar"><input placeholder="Search products…"><select><option>All Categories</option>${CATEGORIES.map(c=>`<option>${c.name}</option>`).join('')}</select></div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Unit</th><th>Pack</th><th style="text-align:right">Price</th><th style="text-align:right">Stock</th><th></th></tr></thead>
        <tbody>${PRODUCTS.map(p=>{
          const cat = CATEGORIES.find(c=>c.id===p.category);
          return `<tr><td><code>${p.code}</code></td><td><strong>${p.name}</strong></td>
            <td>${cat?cat.icon+' '+cat.name:''}</td>
            <td>${p.unit}</td><td>${p.packSize}</td>
            <td style="text-align:right">${fmt$(p.price)}</td>
            <td style="text-align:right;${p.stock<20?'color:var(--red);font-weight:700':''}">${p.stock}</td>
            <td><button class="btn-outline btn-sm">Edit</button></td></tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
}

/* ── CATEGORIES ── */
function categoriesPage() {
  return `
    <div class="section-title"><h2>🏷️ Categories</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP.toast('Add category…','')">+ Add Category</button>
    </div>
    <div class="grid-3">${CATEGORIES.map(c=>`
      <div class="card">
        <div style="font-size:32px;margin-bottom:8px">${c.icon}</div>
        <h3>${c.name}</h3>
        <p class="text-sm text-light">${PRODUCTS.filter(p=>p.category===c.id).length} products</p>
        <button class="btn-outline btn-sm mt-8">Edit</button>
      </div>`).join('')}
    </div>`;
}

/* ── PRICING / PRICE LISTS ── */
function pricingPage() {
  return `
    <div class="section-title"><h2>💲 Price Lists</h2></div>
    <div class="info-box mb-16">Customer-specific or group pricing. Each price list applies a multiplier to base product prices. Customers are assigned via Customer → Price Level.</div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Multiplier</th><th>Customers</th><th></th></tr></thead>
        <tbody>${PRICE_LEVELS.map(p=>`<tr>
          <td><strong>${p.id}</strong></td><td>${p.name}</td><td class="text-sm text-light">${p.desc}</td>
          <td><span class="badge badge-${p.mult<=0.9?'green':p.mult<=0.95?'yellow':'blue'}">${p.mult}×</span></td>
          <td>${CUSTOMERS.filter(c=>c.priceLevel===p.id).length}</td>
          <td><button class="btn-outline btn-sm">Edit</button></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
    <div class="card mt-16">
      <h3>Price Preview: Whole Milk 4/1 GAL — Base $4.29</h3>
      <div class="stat-grid">${PRICE_LEVELS.map(p=>`
        <div class="stat-item"><div class="text-xs text-light">${p.name}</div><div class="bold">${fmt$(4.29*p.mult)}</div></div>`).join('')}
      </div>
    </div>`;
}

/* ── DISCOUNT CAPS ── */
function discountsPage() {
  return `
    <div class="section-title"><h2>🏷️ Discount Caps</h2></div>
    <div class="info-box mb-16">Maximum discount percentages allowed per role. Amounts exceeding the cap require manager approval.</div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Role</th><th>Max Line Discount</th><th>Max Order Discount</th><th>Requires Approval Above</th></tr></thead>
        <tbody>
          <tr><td>Salesperson</td><td>5%</td><td>3%</td><td>Any discount</td></tr>
          <tr><td>Sales Manager</td><td>15%</td><td>10%</td><td>Over 15%</td></tr>
          <tr><td>Admin</td><td>100%</td><td>100%</td><td>No limit</td></tr>
        </tbody>
      </table>
    </div>
    <div class="warn-box mt-16">Requests beyond cap are queued for manager approval. Salesperson sees "Pending Approval" status.</div>`;
}

/* ── ADJUSTMENTS ── */
function adjustmentsPage() {
  return `
    <div class="section-title"><h2>📝 Adjustments</h2></div>
    <div class="grid-2">
      <div class="card">
        <h3>Order Adjustment Policies</h3>
        <table><thead><tr><th>Policy</th><th>Value</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Post-delivery adjustments</td><td>Allowed within 24 hours</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>Short pick auto-adjust</td><td>Auto-reduce invoice on approval</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>Driver quantity edit</td><td>Reduce only, with reason code</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>Price adjustment</td><td>Requires manager approval</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>Return credits</td><td>Auto-create credit memo</td><td><span class="badge badge-yellow">Draft</span></td></tr>
        </tbody></table>
      </div>
      <div class="card">
        <h3>Recent Adjustments</h3>
        <table><thead><tr><th>Date</th><th>Order</th><th>Type</th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>Feb 26</td><td>ORD-2601</td><td>Short pick</td><td class="text-red">-$12.50</td></tr>
          <tr><td>Feb 25</td><td>ORD-2595</td><td>Driver adjust</td><td class="text-red">-$28.75</td></tr>
          <tr><td>Feb 25</td><td>ORD-2590</td><td>Return credit</td><td class="text-red">-$45.00</td></tr>
        </tbody></table>
      </div>
    </div>`;
}

/* ── INVOICE LOCK ── */
function invoiceLockPage() {
  return `
    <div class="section-title"><h2>🔐 Invoice Lock Policy</h2></div>
    <div class="card">
      <h3>Lock Configuration</h3>
      <div class="info-box mb-16">Invoices lock automatically when a delivery is confirmed. Locked invoices cannot be edited except by Admin or Accountant with override permission.</div>
      <table style="max-width:600px"><thead><tr><th>Setting</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Auto-lock trigger</td><td><strong>Delivery confirmation</strong></td></tr>
        <tr><td>Lock scope</td><td>Unit prices, quantities, line items</td></tr>
        <tr><td>Unlock requires</td><td>Admin approval + reason code</td></tr>
        <tr><td>Post-lock adjustments</td><td>Credit memo only (new journal entry)</td></tr>
        <tr><td>Audit trail</td><td>All lock/unlock events logged</td></tr>
      </tbody></table>
      <div class="warn-box mt-16">🔒 <strong>Current Status:</strong> 42 invoices locked this month. 0 unlock requests pending.</div>
    </div>`;
}

/* ── CREDIT TIERS ── */
function creditTiersPage() {
  return `
    <div class="section-title"><h2>⭐ Credit Tiers</h2></div>
    <div class="grid-3">${CREDIT_TIERS.map(t=>`
      <div class="card card-border-${t.tier==='A'?'success':t.tier==='B'?'warn':'danger'}">
        <h3>Tier ${t.tier} — ${t.name}</h3>
        <table style="font-size:12px"><tbody>
          <tr><td>Default Limit</td><td style="text-align:right"><strong>${fmt$(t.defaultLimit)}</strong></td></tr>
          <tr><td>Terms</td><td style="text-align:right">${t.terms}</td></tr>
          <tr><td>Customers</td><td style="text-align:right">${CUSTOMERS.filter(c=>c.creditTier===t.tier).length}</td></tr>
        </tbody></table>
        <button class="btn-outline btn-sm mt-8">Edit Tier</button>
      </div>`).join('')}
    </div>
    <div class="card mt-16">
      <h3>Auto-Tier Rules</h3>
      <div class="info-box">Customers are automatically promoted or demoted based on payment history. Late payments > 3 in 90 days triggers downgrade warning.</div>
    </div>`;
}

/* ── ORDER RULES ── */
function orderRulesPage() {
  return `
    <div class="section-title"><h2>📋 Order Rules</h2></div>
    <div class="card">
      <table><thead><tr><th>Rule</th><th>Value</th><th>Enforced</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Minimum order amount</td><td>$50.00</td><td>At order entry</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>Maximum order amount</td><td>$25,000.00</td><td>Manager approval required</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>Credit check</td><td>Block if over limit</td><td>At order entry</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>Duplicate order detection</td><td>Same customer + same day</td><td>Warning only</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>Cut-off time</td><td>2:00 PM for next-day delivery</td><td>Soft warning</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>COD enforcement</td><td>Tier C customers</td><td>Auto-apply at order</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>Salesperson territory</td><td>Restrict to assigned customers</td><td>At order entry</td><td><span class="badge badge-yellow">Draft</span></td></tr>
      </tbody></table>
    </div>`;
}

/* ── ADMIN NOTIFICATIONS ── */
function adminNotifPage() {
  return `
    <div class="section-title"><h2>🔔 Notification Settings</h2></div>
    <div class="card">
      <h3>Alert Routing</h3>
      <table><thead><tr><th>Event</th><th>Email</th><th>Push</th><th>SMS</th><th>Recipients</th></tr></thead>
      <tbody>
        <tr><td>Credit limit exceeded</td><td>✓</td><td>✓</td><td></td><td>Accountant, Manager</td></tr>
        <tr><td>Order over $5,000</td><td>✓</td><td>✓</td><td></td><td>Manager</td></tr>
        <tr><td>Delivery rejected</td><td>✓</td><td>✓</td><td>✓</td><td>Manager, Salesperson</td></tr>
        <tr><td>Short pick detected</td><td>✓</td><td>✓</td><td></td><td>Warehouse Manager</td></tr>
        <tr><td>Invoice overdue</td><td>✓</td><td></td><td></td><td>Accountant</td></tr>
        <tr><td>New user enrolled</td><td>✓</td><td></td><td></td><td>Admin</td></tr>
        <tr><td>Device offline > 1hr</td><td>✓</td><td></td><td></td><td>Admin</td></tr>
        <tr><td>AI flag on order</td><td>✓</td><td>✓</td><td></td><td>Accountant, Manager</td></tr>
      </tbody></table>
    </div>`;
}

/* ── PAYMENT GATEWAY ── */
function gatewayPage() {
  return `
    <div class="section-title"><h2>💳 Payment Gateway — Authorize.NET</h2></div>
    <div class="grid-2">
      <div class="card">
        <h3>Configuration</h3>
        <div class="form-group"><label>API Login ID</label><input value="•••••6xK2m" type="password"></div>
        <div class="form-group"><label>Transaction Key</label><input value="•••••••••••" type="password"></div>
        <div class="form-group"><label>Environment</label><select><option>Production</option><option>Sandbox</option></select></div>
        <div class="form-group"><label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0"><input type="checkbox" checked> Enable credit card payments at delivery</label></div>
        <div class="form-group"><label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0"><input type="checkbox" checked> Enable ACH/eCheck payments</label></div>
        <button class="btn-primary mt-8" onclick="window.ERP.toast('Testing connection…','')">🔌 Test Connection</button>
      </div>
      <div class="card">
        <h3>Gateway Status</h3>
        <div class="success-box mb-16"><strong>✓ Connected</strong> — Last verified 5 min ago</div>
        <div class="stat-grid">
          <div class="stat-item"><div class="text-xs text-light">Today's Txns</div><div class="bold">12</div></div>
          <div class="stat-item"><div class="text-xs text-light">Today's Volume</div><div class="bold">${fmt$(4850)}</div></div>
          <div class="stat-item"><div class="text-xs text-light">Success Rate</div><div class="bold text-green">98.5%</div></div>
        </div>
      </div>
    </div>`;
}

/* ── PRINTERS ── */
function printersPage() {
  return `
    <div class="section-title"><h2>🖨️ Printers</h2></div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Printer</th><th>Location</th><th>Type</th><th>Status</th><th>Default For</th><th></th></tr></thead>
        <tbody>
          <tr><td><strong>EPSON TM-T88VI</strong></td><td>Warehouse</td><td>Thermal</td><td><span class="badge badge-green">Online</span></td><td>Pick Lists, Labels</td><td><button class="btn-outline btn-sm">Config</button></td></tr>
          <tr><td><strong>HP LaserJet Pro</strong></td><td>Office</td><td>Laser</td><td><span class="badge badge-green">Online</span></td><td>Invoices, Statements</td><td><button class="btn-outline btn-sm">Config</button></td></tr>
          <tr><td><strong>Brother QL-820NWB</strong></td><td>Warehouse</td><td>Label</td><td><span class="badge badge-green">Online</span></td><td>Product Labels</td><td><button class="btn-outline btn-sm">Config</button></td></tr>
          <tr><td><strong>Zebra ZD421</strong></td><td>Dock</td><td>Label</td><td><span class="badge badge-yellow">Idle</span></td><td>Shipping Labels</td><td><button class="btn-outline btn-sm">Config</button></td></tr>
        </tbody>
      </table>
    </div>
    <div class="info-box mt-16">📌 Auto-print rules: Pick lists print automatically when order enters "Ready to Pick" status. Invoices print on delivery confirmation.</div>`;
}

/* ── SYSTEM SETTINGS ── */
function settingsPage() {
  return `
    <div class="section-title"><h2>⚙️ System Settings</h2></div>
    <div class="grid-2">
      <div class="card">
        <h3>Company</h3>
        <div class="form-group"><label>Company Name</label><input value="WholesaleERP Demo Co"></div>
        <div class="form-group"><label>Address</label><input value="123 Distribution Way, Boston, MA 02101"></div>
        <div class="form-row"><div class="form-group"><label>Phone</label><input value="(617) 555-0100"></div><div class="form-group"><label>Tax ID</label><input value="12-3456789"></div></div>
      </div>
      <div class="card">
        <h3>Operations</h3>
        <div class="form-row"><div class="form-group"><label>Order Cut-off</label><input type="time" value="14:00"></div><div class="form-group"><label>Tax Rate</label><input value="6.25%"></div></div>
        <div class="form-row"><div class="form-group"><label>Default Terms</label><select><option>Net 30</option><option>Net 15</option><option>COD</option></select></div><div class="form-group"><label>Currency</label><input value="USD" readonly></div></div>
      </div>
      <div class="card">
        <h3>Integrations</h3>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><span>QuickBooks Sync</span><span class="badge badge-green">Connected</span></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><span>Authorize.NET</span><span class="badge badge-green">Connected</span></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><span>Google Maps API</span><span class="badge badge-green">Active</span></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0"><span>Twilio SMS</span><span class="badge badge-yellow">Not configured</span></div>
        </div>
      </div>
      <div class="card">
        <h3>Backup & Data</h3>
        <div class="success-box mb-8">✓ Last backup: Feb 26, 2026 03:00 AM</div>
        <div class="form-group"><label>Auto-backup</label><select><option>Daily at 3 AM</option><option>Every 12 hours</option></select></div>
        <div class="form-group"><label>Retention</label><input value="90 days"></div>
        <button class="btn-outline" onclick="window.ERP.toast('Backup started…','success')">📦 Backup Now</button>
      </div>
    </div>`;
}

/* ── AUDIT LOG ── */
function auditPage() {
  const logs = [
    { time: '14:23:15', user: 'Marco Rossi', action: 'Created order ORD-2605', type: 'Order', ip: '192.168.1.45' },
    { time: '14:18:02', user: 'Sarah Chen', action: 'Payment PMT-1105 applied to INV-4401', type: 'Payment', ip: '192.168.1.10' },
    { time: '14:05:30', user: 'Kevin Park', action: 'Delivery confirmed ORD-2601', type: 'Delivery', ip: '10.0.0.88' },
    { time: '13:55:12', user: 'Mike Torres', action: 'Pick completed ORD-2601', type: 'Pick', ip: '192.168.1.22' },
    { time: '13:42:08', user: 'Admin', action: 'Credit limit changed: Cambridge Catering $15K → $20K', type: 'Credit', ip: '192.168.1.1' },
    { time: '13:30:00', user: 'System', action: 'Auto-lock triggered for INV-4401', type: 'System', ip: '—' },
    { time: '12:15:45', user: 'Linda Wu', action: 'Route A optimized — saved 22 min', type: 'Route', ip: '192.168.1.10' },
    { time: '11:58:30', user: 'Admin', action: 'User Tony Lopez deactivated', type: 'User', ip: '192.168.1.1' },
  ];
  return `
    <div class="section-title"><h2>📜 Audit Log</h2></div>
    <div class="search-bar"><input placeholder="Search audit log…"><select><option>All Types</option><option>Order</option><option>Payment</option><option>Delivery</option><option>System</option><option>User</option></select></div>
    <div class="card" style="padding:0;overflow:hidden">
      <table style="font-size:12px">
        <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Type</th><th>IP</th></tr></thead>
        <tbody>${logs.map(l=>`<tr>
          <td class="text-light" style="white-space:nowrap">${l.time}</td>
          <td><strong>${l.user}</strong></td>
          <td>${l.action}</td>
          <td><span class="badge badge-blue">${l.type}</span></td>
          <td class="text-light">${l.ip}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}
