// ===== Salesperson Screens =====
window.ERP = window.ERP || {};
import { CUSTOMERS, ORDERS, PRODUCTS, CATEGORIES, fmt$, categoryById } from '../data.js';

export function salesNav() {
  return [
    { section: 'Sales', icon: '📊', label: 'Dashboard', page: 'main', default: true },
    { section: 'Sales', icon: '👥', label: 'Customers', page: 'customers' },
    { section: 'Sales', icon: '📋', label: 'Order History', page: 'orders' },
    { section: 'Sales', icon: '🛒', label: 'New Order', page: 'new-order', badge: '+', badgeColor: 'green' },
    { section: 'Tools', icon: '📈', label: 'My Reports', page: 'reports' },
    { section: 'Tools', icon: '⭐', label: 'Favorites', page: 'favorites' },
  ];
}

export function renderSales(page) {
  switch (page) {
    case 'customers': return customersPage();
    case 'customer': return customerProfile();
    case 'new-order': return newOrderPage();
    case 'orders': return orderHistoryPage();
    case 'reports': return salesReportsPage();
    case 'favorites': return favoritesPage();
    default: return dashboardPage();
  }
}

/* ── DASHBOARD ── */
function dashboardPage() {
  const myOrders = ORDERS.filter(o => o.salesperson === 'Marcus');
  const todayTotal = myOrders.filter(o => o.date === '2026-02-26').reduce((s, o) => s + o.total, 0);
  return `
    <div class="section-title"><h2>📊 Sales Dashboard</h2><span class="text-light text-sm">Wednesday, Feb 26 2026</span></div>

    <div class="quick-actions">
      <div class="quick-action" onclick="window.ERP.nav('#/sales/new-order')"><div class="qa-icon">🛒</div><div class="qa-label">New Order</div></div>
      <div class="quick-action" onclick="window.ERP.nav('#/sales/customers')"><div class="qa-icon">👥</div><div class="qa-label">Customers</div></div>
      <div class="quick-action" onclick="window.ERP.nav('#/sales/orders')"><div class="qa-icon">📋</div><div class="qa-label">Order History</div></div>
      <div class="quick-action" onclick="window.ERP.nav('#/sales/reports')"><div class="qa-icon">📈</div><div class="qa-label">Reports</div></div>
      <div class="quick-action" onclick="window.ERP.toast('Opening catalog…')"><div class="qa-icon">📦</div><div class="qa-label">Product Catalog</div></div>
      <div class="quick-action" onclick="window.ERP.toast('Voice order…','')"><div class="qa-icon">🎤</div><div class="qa-label">Voice Order</div></div>
    </div>

    <div class="tiles">
      <div class="tile tile-blue"><div class="tile-label">Today's Orders</div><div class="tile-value">${myOrders.filter(o => o.date === '2026-02-26').length}</div><div class="tile-sub">${fmt$(todayTotal)} total value</div></div>
      <div class="tile tile-green"><div class="tile-label">Delivered</div><div class="tile-value">${myOrders.filter(o => o.status === 'Delivered').length}</div><div class="tile-sub">On time</div></div>
      <div class="tile tile-yellow"><div class="tile-label">Pending</div><div class="tile-value">${myOrders.filter(o => o.status === 'Pending' || o.status === 'Picking').length}</div><div class="tile-sub">In pipeline</div></div>
      <div class="tile tile-purple"><div class="tile-label">Active Customers</div><div class="tile-value">${CUSTOMERS.filter(c => c.status === 'Active').length}</div><div class="tile-sub">of ${CUSTOMERS.length} total</div></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>Recent Activity</h3><a class="text-sm" style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/sales/orders')">View All →</a></div>
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th style="text-align:right">Total</th></tr></thead>
          <tbody>${myOrders.slice(0, 5).map(o => {
            const c = CUSTOMERS.find(c => c.id === o.customer);
            const badge = statusBadge(o.status);
            return `<tr><td><strong>${o.id}</strong></td><td>${c ? c.name : ''}</td><td>${badge}</td><td style="text-align:right">${fmt$(o.total)}</td></tr>`;
          }).join('')}</tbody>
        </table>
      </div>
      <div class="card">
        <h3>⚠️ Attention Needed</h3>
        <div style="margin-top:12px">
          <div class="warn-box">🔴 <strong>Cambridge Catering</strong> — approaching credit limit (${fmt$(18900)} / ${fmt$(20000)})</div>
          <div class="warn-box">🟡 <strong>Green Leaf Cafe</strong> — account on HOLD, COD only</div>
          <div class="info-box" style="margin-top:8px">📞 2 customers due for check-in call this week</div>
        </div>
      </div>
    </div>`;
}

/* ── CUSTOMERS ── */
function customersPage() {
  return `
    <div class="section-title"><h2>👥 My Customers</h2>
      <div style="margin-left:auto;display:flex;gap:8px">
        <div class="view-switcher">
          <button class="active" onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('clist-table').style.display='';document.getElementById('clist-cards').style.display='none'">☰ List</button>
          <button onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('clist-table').style.display='none';document.getElementById('clist-cards').style.display=''">⊞ Cards</button>
        </div>
      </div>
    </div>

    <div class="search-bar" style="margin-bottom:16px">
      <input id="cust-search" placeholder="Search customers by name, code, or type…" oninput="window.ERP.initSearch('#cust-search','#cust-table')">
      <select><option>All Types</option><option>Restaurant</option><option>Deli</option><option>Caterer</option><option>Bakery</option><option>Hotel</option><option>Cafe</option></select>
      <select><option>All Tiers</option><option>Tier A</option><option>Tier B</option><option>Tier C</option></select>
      <select><option>All Status</option><option>Active</option><option>Warning</option><option>Hold</option></select>
    </div>

    <div id="clist-table">
      <div class="card" style="padding:0;overflow:hidden">
        <table id="cust-table">
          <thead><tr><th>Customer</th><th>Code</th><th>Type</th><th>Credit</th><th>Balance</th><th>Route</th><th>Status</th><th></th></tr></thead>
          <tbody>${CUSTOMERS.map(c => `<tr class="${c.status === 'Hold' ? 'row-danger' : c.status === 'Warning' ? 'row-warn' : ''}">
            <td><strong style="cursor:pointer;color:var(--primary)" onclick="window.ERP.nav('#/sales/customer?id=${c.id}')">${c.name}</strong><br><span class="text-xs text-light">${c.contact}</span></td>
            <td><code>${c.code}</code></td>
            <td>${c.type}</td>
            <td><span class="badge badge-${c.creditTier === 'A' ? 'green' : c.creditTier === 'B' ? 'yellow' : 'red'}">Tier ${c.creditTier}</span></td>
            <td style="text-align:right">${fmt$(c.balance)}</td>
            <td>${c.route || '—'}</td>
            <td>${statusBadge(c.status)}</td>
            <td><button class="btn-outline btn-sm" onclick="window.ERP.nav('#/sales/new-order?cust=${c.id}')">+ Order</button></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
    </div>

    <div id="clist-cards" style="display:none">
      <div class="grid-3">${CUSTOMERS.map(c => `<div class="card" style="cursor:pointer" onclick="window.ERP.nav('#/sales/customer?id=${c.id}')">
        <div class="flex-between mb-8"><strong>${c.name}</strong>${statusBadge(c.status)}</div>
        <div class="text-sm text-light mb-4">${c.type} · ${c.code}</div>
        <div class="flex-between text-sm"><span>Balance: <strong>${fmt$(c.balance)}</strong></span><span class="badge badge-${c.creditTier === 'A' ? 'green' : c.creditTier === 'B' ? 'yellow' : 'red'}">Tier ${c.creditTier}</span></div>
        <div class="text-xs text-light mt-8">${c.route || 'No route'} · Avg: ${fmt$(c.avgOrder)}/order</div>
      </div>`).join('')}</div>
    </div>`;
}

/* ── CUSTOMER PROFILE ── */
function customerProfile() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const cust = CUSTOMERS.find(c => c.id === parseInt(params.get('id'))) || CUSTOMERS[0];
  const custOrders = ORDERS.filter(o => o.customer === cust.id);
  const children = CUSTOMERS.filter(c => c.parentId === cust.id);
  const usedPct = Math.round((cust.balance / cust.creditLimit) * 100);

  return `
    <div style="margin-bottom:16px"><a style="color:var(--primary);cursor:pointer;font-size:13px" onclick="window.ERP.nav('#/sales/customers')">← Back to Customers</a></div>
    <div class="section-title"><h2>${cust.name}</h2><div style="margin-left:auto;display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="window.ERP.toast('Calling ${cust.contact}…')">📞 Call</button>
      <button class="btn-primary btn-sm" onclick="window.ERP.nav('#/sales/new-order?cust=${cust.id}')">🛒 New Order</button>
    </div></div>

    <div class="tabs" id="cust-tabs">
      <div class="tab active" data-tab="overview">Overview</div>
      <div class="tab" data-tab="orders">Orders (${custOrders.length})</div>
      <div class="tab" data-tab="account">Account</div>
      <div class="tab" data-tab="notes">Notes</div>
    </div>

    <div class="tab-content active" data-tab="overview">
      <div class="tiles">
        <div class="tile tile-blue"><div class="tile-label">Avg Order</div><div class="tile-value">${fmt$(cust.avgOrder)}</div></div>
        <div class="tile tile-green"><div class="tile-label">Last Order</div><div class="tile-value">${cust.lastOrder}</div></div>
        <div class="tile tile-${usedPct > 80 ? 'red' : usedPct > 50 ? 'yellow' : 'green'}"><div class="tile-label">Credit Used</div><div class="tile-value">${usedPct}%</div><div class="tile-sub">${fmt$(cust.balance)} / ${fmt$(cust.creditLimit)}</div></div>
        <div class="tile"><div class="tile-label">Terms</div><div class="tile-value">${cust.terms}</div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <h3>Contact Info</h3>
          <div class="form-group"><label>Contact</label><div>${cust.contact}</div></div>
          <div class="form-group"><label>Phone</label><div>${cust.phone}</div></div>
          <div class="form-group"><label>Email</label><div>${cust.email}</div></div>
          <div class="form-group"><label>Price Level</label><div>${cust.priceLevel}</div></div>
        </div>
        <div class="card">
          <h3>Delivery Locations</h3>
          <div class="stop-item stop-current"><strong>📍 Primary</strong><br><span class="text-sm">${cust.loc}</span><br><span class="text-xs text-light">Route: ${cust.route || 'Unassigned'}</span></div>
          ${children.map(ch => `<div class="stop-item stop-pending"><strong>📍 ${ch.name}</strong><br><span class="text-sm">${ch.loc}</span></div>`).join('')}
          <button class="btn-outline btn-sm mt-8" onclick="window.ERP.toast('Add location form…')">+ Add Location</button>
        </div>
      </div>
    </div>

    <div class="tab-content" data-tab="orders">
      <div class="card" style="padding:0;overflow:hidden">
        <table><thead><tr><th>Order #</th><th>Date</th><th>Items</th><th>Status</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${custOrders.length ? custOrders.map(o => `<tr><td><strong>${o.id}</strong></td><td>${o.date}</td><td>${o.items}</td><td>${statusBadge(o.status)}</td><td style="text-align:right">${fmt$(o.total)}</td></tr>`).join('') : '<tr><td colspan="5" class="text-center text-light" style="padding:24px">No orders found</td></tr>'}</tbody></table>
      </div>
      <button class="btn-primary mt-16" onclick="window.ERP.nav('#/sales/new-order?cust=${cust.id}')">🛒 Place New Order</button>
    </div>

    <div class="tab-content" data-tab="account">
      <div class="grid-2">
        <div class="card">
          <h3>Credit Summary</h3>
          <div class="form-group"><label>Credit Tier</label><div><span class="badge badge-${cust.creditTier === 'A' ? 'green' : cust.creditTier === 'B' ? 'yellow' : 'red'}">Tier ${cust.creditTier}</span></div></div>
          <div class="form-group"><label>Credit Limit</label><div>${fmt$(cust.creditLimit)}</div></div>
          <div class="form-group"><label>Current Balance</label><div><strong class="${usedPct > 80 ? 'text-red' : ''}">${fmt$(cust.balance)}</strong></div></div>
          <div class="form-group"><label>Available Credit</label><div>${fmt$(cust.creditLimit - cust.balance)}</div></div>
          <div class="form-group"><label>Payment Terms</label><div>${cust.terms}</div></div>
          <div class="progress mt-8"><div class="progress-fill" style="width:${usedPct}%;background:var(--${usedPct > 80 ? 'red' : usedPct > 50 ? 'yellow' : 'green'})"></div></div>
        </div>
        <div class="card">
          <h3>Aging Breakdown</h3>
          <table><thead><tr><th>Period</th><th style="text-align:right">Amount</th></tr></thead>
          <tbody>
            <tr><td>Current (0-30)</td><td style="text-align:right">${fmt$(cust.balance * 0.4)}</td></tr>
            <tr><td>31-60 days</td><td style="text-align:right">${fmt$(cust.balance * 0.3)}</td></tr>
            <tr><td>61-90 days</td><td style="text-align:right">${fmt$(cust.balance * 0.2)}</td></tr>
            <tr class="${cust.balance * 0.1 > 0 ? 'row-danger' : ''}"><td>90+ days</td><td style="text-align:right">${fmt$(cust.balance * 0.1)}</td></tr>
          </tbody>
          <tfoot><tr><td>Total</td><td style="text-align:right">${fmt$(cust.balance)}</td></tr></tfoot></table>
        </div>
      </div>
    </div>

    <div class="tab-content" data-tab="notes">
      <div class="card">
        <h3>Customer Notes</h3>
        <div class="info-box mb-16">📝 <strong>Feb 24</strong> — Spoke with ${cust.contact}, increase next week's produce order. Prefers delivery before 8 AM.</div>
        <div class="info-box mb-16">📝 <strong>Feb 18</strong> — Resolved short shipment on INV-4380. Credit issued for $45.00.</div>
        <div class="info-box mb-16">📝 <strong>Feb 10</strong> — Annual menu change coming March 1. Schedule meeting to review new items.</div>
        <div class="form-group mt-16"><label>Add Note</label><textarea rows="3" placeholder="Type a note…"></textarea></div>
        <button class="btn-primary btn-sm" onclick="window.ERP.toast('Note saved!','success')">Save Note</button>
      </div>
    </div>`;
}

/* ── NEW ORDER ── */
let orderStep = 1;
let cart = [
  { product: PRODUCTS[0], qty: 4 },
  { product: PRODUCTS[6], qty: 2 },
  { product: PRODUCTS[10], qty: 1 },
];

function newOrderPage() {
  return `
    <div class="section-title"><h2>🛒 New Order</h2></div>
    <div class="steps" id="order-steps">
      ${[{n:1,l:'Customer'},{n:2,l:'Products'},{n:3,l:'Review'},{n:4,l:'Confirm'}].map(s =>
        `<div class="step ${s.n < orderStep ? 'done' : ''} ${s.n === orderStep ? 'active' : ''} clickable" data-step="${s.n}" onclick="window.ERP._setOrderStep(${s.n})">
          <div class="step-num">${s.n < orderStep ? '✓' : s.n}</div><div class="step-label">${s.l}</div>
        </div>`
      ).join('')}
    </div>
    <div id="order-step-content">${orderStepContent(orderStep)}</div>`;
}

window.ERP._setOrderStep = function(n) {
  orderStep = n;
  const el = document.getElementById('order-step-content');
  if (el) el.innerHTML = orderStepContent(n);
  document.querySelectorAll('#order-steps .step').forEach(s => {
    const sn = parseInt(s.dataset.step);
    s.className = 'step clickable' + (sn < n ? ' done' : '') + (sn === n ? ' active' : '');
    s.querySelector('.step-num').textContent = sn < n ? '✓' : sn;
  });
};

function orderStepContent(step) {
  if (step === 1) return orderStep1();
  if (step === 2) return orderStep2();
  if (step === 3) return orderStep3();
  return orderStep4();
}

function orderStep1() {
  return `<div class="card">
    <h3>Select Customer</h3>
    <div class="search-bar"><input placeholder="Search customers…"><select><option>All Types</option></select></div>
    <table><thead><tr><th>Customer</th><th>Type</th><th>Credit</th><th>Last Order</th><th></th></tr></thead>
    <tbody>${CUSTOMERS.filter(c => c.status !== 'Hold').slice(0, 6).map(c => `<tr>
      <td><strong>${c.name}</strong><br><span class="text-xs text-light">${c.code}</span></td>
      <td>${c.type}</td>
      <td><span class="badge badge-${c.creditTier === 'A' ? 'green' : 'yellow'}">Tier ${c.creditTier}</span></td>
      <td>${c.lastOrder}</td>
      <td><button class="btn-primary btn-sm" onclick="window.ERP._setOrderStep(2)">Select</button></td>
    </tr>`).join('')}</tbody></table>
  </div>`;
}

function orderStep2() {
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  return `<div class="grid-2" style="grid-template-columns:1fr 340px">
    <div>
      <div class="card">
        <div class="card-header"><h3>Product Catalog</h3>
          <div style="display:flex;gap:8px">
            <button class="voice-btn sm" title="Voice Input" onclick="window.ERP.toast('Listening… say product and quantity','')">🎤</button>
          </div>
        </div>
        <div class="tabs" style="margin-bottom:12px">
          ${CATEGORIES.map((c, i) => `<div class="tab ${i === 0 ? 'active' : ''}" onclick="
            this.parentElement.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));this.classList.add('active');
            document.querySelectorAll('.cat-group').forEach(g=>g.style.display='none');document.getElementById('cat-${c.id}').style.display='';
          ">${c.icon} ${c.name}</div>`).join('')}
        </div>
        <div class="search-bar"><input placeholder="Search by name or 5-digit code…"></div>
        ${CATEGORIES.map((cat, idx) => `<div class="cat-group" id="cat-${cat.id}" style="${idx > 0 ? 'display:none' : ''}">
          <table><thead><tr><th>Code</th><th>Product</th><th>Pack</th><th style="text-align:right">Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>${PRODUCTS.filter(p => p.category === cat.id).map(p => `<tr>
            <td><code>${p.code}</code></td><td><strong>${p.name}</strong></td><td class="text-sm text-light">${p.packSize}</td>
            <td style="text-align:right">${fmt$(p.price)}</td>
            <td>${p.stock > 50 ? `<span class="text-green">${p.stock}</span>` : `<span class="text-red">${p.stock}</span>`}</td>
            <td><button class="btn-outline btn-sm" onclick="window.ERP.toast('Added to cart','success')">+ Add</button></td>
          </tr>`).join('')}</tbody></table>
        </div>`).join('')}
      </div>
      <div class="card">
        <h3>⏱ Quick Add</h3>
        <div class="grid-3" style="gap:8px">
          <div class="quick-action" onclick="window.ERP.toast('Duplicating last order…','success')"><div class="qa-icon">📋</div><div class="qa-label">Duplicate Last Order</div></div>
          <div class="quick-action" onclick="window.ERP.toast('Loading favorites…')"><div class="qa-icon">⭐</div><div class="qa-label">From Favorites</div></div>
          <div class="quick-action"><div class="qa-icon">🎤</div><div class="qa-label">Voice Entry</div></div>
        </div>
      </div>
    </div>
    <div>
      <div class="card" style="position:sticky;top:108px">
        <div class="card-header"><h3>🛒 Cart (${cart.length})</h3><span class="bold">${fmt$(cartTotal)}</span></div>
        <table><thead><tr><th>Item</th><th>Qty</th><th style="text-align:right">Subtotal</th></tr></thead>
        <tbody>${cart.map((item, i) => `<tr>
          <td><strong>${item.product.name}</strong><br><span class="text-xs text-light">${item.product.packSize}</span></td>
          <td><input class="inline-input" type="number" value="${item.qty}" min="1"></td>
          <td style="text-align:right">${fmt$(item.product.price * item.qty)}</td>
        </tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="2"><strong>Total</strong></td><td style="text-align:right"><strong>${fmt$(cartTotal)}</strong></td></tr></tfoot></table>
        <button class="btn-primary w-full mt-16" onclick="window.ERP._setOrderStep(3)">Review Order →</button>
      </div>
    </div>
  </div>`;
}

function orderStep3() {
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const tax = cartTotal * 0.0625;
  return `<div class="card">
    <h3>📄 Order Review — Bella Cucina Restaurant</h3>
    <div class="invoice-preview" style="margin-top:16px">
      <div class="inv-header">
        <div><h2>📦 WholesaleERP</h2><div class="text-sm text-light">123 Distribution Way, Boston MA</div></div>
        <div style="text-align:right"><div class="text-sm text-light">ORDER PREVIEW</div><div class="bold">Date: 2026-02-26</div><div class="text-sm">Bella Cucina · BELL-001</div></div>
      </div>
      <table>
        <thead><tr><th>Code</th><th>Product</th><th>Pack Size</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Extended</th></tr></thead>
        <tbody>${cart.map(item => `<tr>
          <td>${item.product.code}</td><td>${item.product.name}</td><td>${item.product.packSize}</td>
          <td style="text-align:center"><input class="inline-input edit" type="number" value="${item.qty}" min="1"></td>
          <td style="text-align:right">${fmt$(item.product.price)}</td>
          <td style="text-align:right">${fmt$(item.product.price * item.qty)}</td>
        </tr>`).join('')}</tbody>
      </table>
      <div class="inv-total">
        <div>Subtotal: ${fmt$(cartTotal)}</div>
        <div>Tax (6.25%): ${fmt$(tax)}</div>
        <div style="font-size:18px;font-weight:700;margin-top:8px">Total: ${fmt$(cartTotal + tax)}</div>
      </div>
    </div>
    <div class="flex-between mt-16">
      <button class="btn-outline" onclick="window.ERP._setOrderStep(2)">← Back to Products</button>
      <div style="display:flex;gap:8px">
        <button class="btn-outline" onclick="window.ERP.toast('Preview printed')">🖨 Print Preview</button>
        <button class="btn-primary" onclick="window.ERP._setOrderStep(4)">Submit Order →</button>
      </div>
    </div>
  </div>`;
}

function orderStep4() {
  return `<div class="card text-center" style="padding:48px">
    <div style="font-size:64px;margin-bottom:16px">✅</div>
    <h2 style="color:var(--green)">Order Submitted!</h2>
    <p class="text-light mt-8">Order <strong>ORD-2611</strong> has been placed for <strong>Bella Cucina Restaurant</strong></p>
    <div class="tiles mt-16" style="max-width:500px;margin:16px auto">
      <div class="tile tile-green"><div class="tile-label">Order #</div><div class="tile-value">ORD-2611</div></div>
      <div class="tile tile-blue"><div class="tile-label">Status</div><div class="tile-value">Confirmed</div></div>
    </div>
    <p class="text-sm text-light">The warehouse has been notified. This order is now in the pick queue.</p>
    <div style="margin-top:24px;display:flex;gap:8px;justify-content:center">
      <button class="btn-outline" onclick="window.ERP.nav('#/sales/orders')">View Orders</button>
      <button class="btn-primary" onclick="orderStep=1;window.ERP.nav('#/sales/new-order')">+ New Order</button>
    </div>
  </div>`;
}

/* ── ORDER HISTORY ── */
function orderHistoryPage() {
  return `
    <div class="section-title"><h2>📋 Order History</h2></div>
    <div class="search-bar">
      <input placeholder="Search orders…">
      <select><option>All Status</option><option>Pending</option><option>Confirmed</option><option>Picking</option><option>Out for Delivery</option><option>Delivered</option><option>Hold</option></select>
      <select><option>Last 7 Days</option><option>Last 30 Days</option><option>This Month</option><option>Custom Range</option></select>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table><thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Items</th><th>Route</th><th>Status</th><th style="text-align:right">Total</th></tr></thead>
      <tbody>${ORDERS.map(o => {
        const c = CUSTOMERS.find(c => c.id === o.customer);
        return `<tr>
          <td><strong>${o.id}</strong></td>
          <td><span style="cursor:pointer;color:var(--primary)" onclick="window.ERP.nav('#/sales/customer?id=${o.customer}')">${c ? c.name : ''}</span></td>
          <td>${o.date}</td><td>${o.items}</td><td>${o.route}</td>
          <td>${statusBadge(o.status)}</td>
          <td style="text-align:right">${fmt$(o.total)}</td>
        </tr>`;
      }).join('')}</tbody></table>
    </div>`;
}

/* ── REPORTS ── */
function salesReportsPage() {
  return `
    <div class="section-title"><h2>📈 My Reports</h2></div>
    <div class="tiles">
      <div class="tile tile-blue"><div class="tile-label">MTD Sales</div><div class="tile-value">${fmt$(42850)}</div><div class="tile-sub">+12% vs last month</div></div>
      <div class="tile tile-green"><div class="tile-label">Orders This Month</div><div class="tile-value">38</div><div class="tile-sub">Avg ${fmt$(1128)}/order</div></div>
      <div class="tile tile-purple"><div class="tile-label">Active Customers</div><div class="tile-value">8</div></div>
      <div class="tile tile-yellow"><div class="tile-label">Open AR</div><div class="tile-value">${fmt$(76350)}</div></div>
    </div>
    <div class="grid-2">
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">📊</div><h3>Sales by Customer</h3><p class="text-sm text-light">Revenue breakdown per customer</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">📦</div><h3>Product Movement</h3><p class="text-sm text-light">Top sellers and slow movers</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">📈</div><h3>Sales Trend</h3><p class="text-sm text-light">Weekly/monthly revenue chart</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">🏆</div><h3>Commission Report</h3><p class="text-sm text-light">Your earnings this period</p></div>
    </div>
    <div class="card"><h3>Saved Reports</h3>
    <table><thead><tr><th>Report</th><th>Last Run</th><th>Schedule</th><th></th></tr></thead>
    <tbody>
      <tr><td>Weekly Customer Summary</td><td>2026-02-24</td><td>Every Monday</td><td><button class="btn-outline btn-sm">Run Now</button></td></tr>
      <tr><td>Monthly Product Performance</td><td>2026-02-01</td><td>1st of month</td><td><button class="btn-outline btn-sm">Run Now</button></td></tr>
    </tbody></table></div>`;
}

/* ── FAVORITES ── */
function favoritesPage() {
  return `
    <div class="section-title"><h2>⭐ Favorites</h2></div>
    <div class="card"><h3>Favorite Products</h3>
    <table><thead><tr><th>Code</th><th>Product</th><th>Category</th><th style="text-align:right">Price</th><th></th></tr></thead>
    <tbody>${PRODUCTS.slice(0, 8).map(p => `<tr>
      <td><code>${p.code}</code></td><td>${p.name}</td><td>${categoryById(p.category)?.icon || ''} ${categoryById(p.category)?.name || ''}</td>
      <td style="text-align:right">${fmt$(p.price)}</td>
      <td><button class="btn-outline btn-sm">+ Add to Order</button></td>
    </tr>`).join('')}</tbody></table></div>
    <div class="card"><h3>Favorite Customers</h3>
    <div class="grid-3">${CUSTOMERS.slice(0, 3).map(c => `<div class="card" style="cursor:pointer" onclick="window.ERP.nav('#/sales/customer?id=${c.id}')">
      <strong>${c.name}</strong><div class="text-sm text-light">${c.type} · Last: ${c.lastOrder}</div>
    </div>`).join('')}</div></div>`;
}

/* ── HELPERS ── */
function statusBadge(status) {
  const map = {
    Active: 'green', Delivered: 'green', Paid: 'green', Confirmed: 'blue',
    Pending: 'yellow', Picking: 'orange', 'Out for Delivery': 'purple',
    Hold: 'red', Overdue: 'red', Warning: 'yellow', Partial: 'orange',
    Open: 'blue', 'In Progress': 'purple', 'Not Started': 'yellow', Loading: 'orange',
  };
  return `<span class="badge badge-${map[status] || 'blue'}">${status}</span>`;
}
