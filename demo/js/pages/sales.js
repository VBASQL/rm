/* ═══════════════════════════════════════════════════════════════
   WHOLESALE ERP — SALESPERSON MODULE
   All own-brand beverage distribution
   ═══════════════════════════════════════════════════════════════ */

import {
  CUSTOMERS, CATEGORIES, PRODUCTS, ORDERS, INVOICES, PAYMENTS,
  CREDIT_TIERS, PRICE_LEVELS, ORDER_CAPS, NOTIFICATION_PREFS, ACCOUNT_CREDITS,
  productById, customerById, customerName, categoryById, orderById,
  invoicesByCustomer, ordersByCustomer, paymentsByCustomer, invoiceByOrder,
  fmt$, getCRV
} from '../data.js';

window.ERP = window.ERP || {};

// ── Nav ──
export function salesNav() {
  return [
    { section: 'Sales', icon: '📊', label: 'Dashboard',     page: 'main',          default: true },
    { section: 'Sales', icon: '➕', label: 'New Order',     page: 'new-order' },
    { section: 'Sales', icon: '📋', label: 'Order History', page: 'orders' },
    { section: 'Sales', icon: '👥', label: 'Customers',     page: 'customers' },
    { section: 'Tools', icon: '⭐', label: 'Favorites',     page: 'favorites' },
    { section: 'Tools', icon: '📈', label: 'Reports',       page: 'reports' },
    { section: 'Tools', icon: '🔔', label: 'Notifications', page: 'notifications' },
  ];
}

// ── State ──
let selectedCustomer = null;
let cart = [];
let orderStep = 1;
let productSearch = '';
let selectedCategory = 0;
let selectedContainer = '12oz Can';  // inventory browser — main container type
let selectedPackSize  = '24-pack';   // inventory browser — case size
let prepayCompleted = false;
let selectedPaymentMethod = '';
let orderDiscounts      = {}; // { productId: discountPct }
let orderPriceOverrides = {}; // { productId: manualPrice }
let stockOverrides      = new Set(); // productIds where manager override granted

// ══════════════════════════════════════════
//  ROUTER
// ══════════════════════════════════════════
export function renderSales(page) {
  // IMPORTANT: exact 'customers' MUST be checked before startsWith('customer')
  if (page === 'customers') return customersListPage();
  if (page && page.startsWith('order-detail')) return orderDetailPage(page);
  if (page && page.startsWith('customer')) return customerProfilePage(page);
  switch (page) {
    case 'new-order':     return newOrderPage();
    case 'orders':         return orderHistoryPage();
    case 'reports':        return salesReportsPage();
    case 'favorites':      return favoritesPage();
    case 'notifications':  return notificationsPage();
    default:               return dashboardPage();
  }
}

// ── Helpers ──
function getParam(page, key) {
  const m = page && page.match(new RegExp('[?&]' + key + '=([^&]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

const statusColor = s => ({
  'Delivered':'var(--green)','Confirmed':'var(--blue)','Picking':'var(--orange)',
  'Pending':'#eab308','Out for Delivery':'var(--primary)','Hold':'var(--red)',
  'Paid':'var(--green)','Open':'var(--blue)','Overdue':'var(--red)','Partial':'var(--orange)',
  'Completed':'var(--green)'
})[s] || 'var(--text-light)';

function rerender(pageFn) {
  const c = document.querySelector('.m-content') || document.querySelector('.content');
  if (c) c.innerHTML = pageFn();
}

// ══════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════
function dashboardPage() {
  if (window.ERP._isMobile) return mobileDashboard();
  const today = '2026-02-26';
  const todayOrders = ORDERS.filter(o => o.date === today);
  const todayRev = todayOrders.reduce((s, o) => s + o.total, 0);
  const openOrders = ORDERS.filter(o => !['Delivered','Cancelled'].includes(o.status));
  const pendingPay = INVOICES.filter(i => i.status !== 'Paid').reduce((s, i) => s + (i.total - i.paid), 0);

  // Attention customers — guard div-by-zero when creditLimit is 0
  const attention = CUSTOMERS.filter(c =>
    c.status === 'Hold' || c.status === 'Warning' ||
    c.creditLimit === 0 ||
    (c.creditLimit > 0 && c.balance / c.creditLimit > 0.8)
  );

  return `
  <div class="fade-in">
    <div class="flex-between mb-16">
      <div><h1 style="margin:0">Dashboard</h1><p class="text-light">Welcome back, Marcus</p></div>
      <button class="btn-primary" onclick="window.ERP.nav('#/sales/new-order')">➕ New Order</button>
    </div>

    <!-- KPI Row -->
    <div class="grid-4 mb-16">
      <div class="card kpi-card">
        <div class="text-xs text-light">TODAY'S ORDERS</div>
        <div class="kpi-value">${todayOrders.length}</div>
        <div class="text-xs text-light">${todayOrders.filter(o=>o.status==='Delivered').length} delivered</div>
      </div>
      <div class="card kpi-card">
        <div class="text-xs text-light">TODAY'S REVENUE</div>
        <div class="kpi-value">${fmt$(todayRev)}</div>
      </div>
      <div class="card kpi-card">
        <div class="text-xs text-light">OPEN ORDERS</div>
        <div class="kpi-value">${openOrders.length}</div>
      </div>
      <div class="card kpi-card">
        <div class="text-xs text-light">PENDING PAYMENTS</div>
        <div class="kpi-value" style="color:var(--red)">${fmt$(pendingPay)}</div>
      </div>
    </div>

    <!-- Pipeline + Attention -->
    <div class="grid-2 mb-16">
      <div class="card">
        <h3 style="margin-top:0">📦 Order Pipeline</h3>
        ${todayOrders.map(o => {
          const cust = customerById(o.customer);
          return `<div class="flex-between mb-8" style="padding:8px 0;border-bottom:1px solid var(--border)">
            <div>
              <a href="#" onclick="window.ERP.nav('#/sales/order-detail?id=${o.id}');return false" style="font-weight:600">${o.id}</a>
              <span class="text-sm text-light ml-8">${cust ? cust.name : 'Unknown'}</span>
            </div>
            <span class="status-badge" style="background:${statusColor(o.status)}20;color:${statusColor(o.status)}">${o.status}</span>
          </div>`;
        }).join('')}
      </div>
      <div class="card">
        <h3 style="margin-top:0">⚠️ Attention Needed</h3>
        ${attention.length === 0 ? '<p class="text-light">All clear!</p>' : attention.map(c => {
          const reason = c.status === 'Hold' ? '🔴 On Hold'
            : c.creditLimit === 0 ? '🟡 Prepay Account'
            : c.status === 'Warning' ? '🟡 Warning'
            : '🟠 Near credit limit';
          return `<div class="flex-between mb-8" style="padding:8px 0;border-bottom:1px solid var(--border)">
            <div>
              <a href="#" onclick="window.ERP.nav('#/sales/customer?id=${c.id}');return false" style="font-weight:600">${c.name}</a>
              <span class="text-sm text-light ml-8">${reason}</span>
            </div>
            <span class="text-sm">${c.creditLimit > 0 ? fmt$(c.balance) + ' / ' + fmt$(c.creditLimit) : 'Prepay'}</span>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="card">
      <h3 style="margin-top:0">🕐 Recent Activity</h3>
      <div class="text-sm">
        <div class="mb-8">📦 <strong>ORD-2607</strong> — Waterfront Hotel — 7 items, ${fmt$(1286.47)} — <span style="color:var(--orange)">Picking</span></div>
        <div class="mb-8">💵 <strong>PMT-8801</strong> — Sunrise Bakery — ${fmt$(107.91)} Card on File</div>
        <div class="mb-8">📦 <strong>ORD-2603</strong> — Ocean Prime Seafood — 5 items, ${fmt$(780.11)} — <span style="color:var(--orange)">Picking</span></div>
        <div class="mb-8">✅ <strong>ORD-2601</strong> — Bella Cucina — Delivered</div>
        <div>📋 <strong>ORD-2605</strong> — Cambridge Catering — 5 items, ${fmt$(948.30)} — <span style="color:#eab308">Pending</span></div>
      </div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════
//  CUSTOMERS LIST
// ══════════════════════════════════════════
function customersListPage() {
  if (window.ERP._isMobile) return mobileCustomersList();
  return `
  <div class="fade-in">
    <div class="flex-between mb-16">
      <h1 style="margin:0">Customers</h1>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="text" placeholder="🔍 Search customers…" id="cust-search"
          oninput="window.ERP._filterCustomers(this.value)"
          style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;width:250px">
      </div>
    </div>
    <div id="cust-list">
      ${renderCustomerList(CUSTOMERS)}
    </div>
  </div>`;
}

function renderCustomerList(custs) {
  if (custs.length === 0) return '<p class="text-light">No customers found.</p>';
  return `<div class="table-container"><table>
    <thead><tr>
      <th>Customer</th><th>Type</th><th>Tier</th><th>Balance</th><th>Status</th><th>Last Order</th><th></th>
    </tr></thead>
    <tbody>
    ${custs.map(c => {
      const pct = c.creditLimit > 0 ? Math.round((c.balance / c.creditLimit) * 100) : (c.balance > 0 ? 100 : 0);
      const pctColor = c.creditLimit === 0 ? 'var(--text-light)' : pct > 80 ? 'var(--red)' : pct > 60 ? 'var(--orange)' : 'var(--green)';
      return `<tr style="cursor:pointer" onclick="window.ERP.nav('#/sales/customer?id=${c.id}')">
        <td><strong>${c.name}</strong><br><span class="text-xs text-light">${c.code} · ${c.contact}</span></td>
        <td class="text-sm">${c.type}</td>
        <td><span class="text-sm" style="font-weight:600">${c.creditTier}</span></td>
        <td class="text-sm">
          ${c.creditLimit > 0 ? `${fmt$(c.balance)} / ${fmt$(c.creditLimit)}
          <div style="height:4px;background:var(--border);border-radius:2px;margin-top:4px">
            <div style="height:100%;width:${Math.min(pct,100)}%;background:${pctColor};border-radius:2px"></div>
          </div>` : '<span class="text-light">Prepay</span>'}
        </td>
        <td><span class="status-badge" style="background:${statusColor(c.status === 'Active' ? 'Confirmed' : c.status)}20;color:${statusColor(c.status === 'Active' ? 'Confirmed' : c.status)}">${c.status}</span></td>
        <td class="text-sm">${c.lastOrder || '—'}</td>
        <td><button class="btn-ghost btn-sm" onclick="event.stopPropagation();window.ERP.nav('#/sales/new-order');setTimeout(()=>window.ERP._selectOrderCustomer(${c.id}),50)">📦</button></td>
      </tr>`;
    }).join('')}
    </tbody></table></div>`;
}

// ══════════════════════════════════════════
//  CUSTOMER PROFILE
// ══════════════════════════════════════════
function customerProfilePage(page) {
  if (window.ERP._isMobile) return mobileCustomerProfile(page);
  const id = parseInt(getParam(page, 'id'));
  const cust = customerById(id);
  if (!cust) return '<div class="card"><p>Customer not found.</p><button class="btn-primary" onclick="window.ERP.nav(\'#/sales/customers\')">← Back</button></div>';

  const custOrders = ordersByCustomer(id);
  const custInvoices = invoicesByCustomer(id);
  const custPayments = paymentsByCustomer(id);
  const usedPct = cust.creditLimit > 0 ? Math.round((cust.balance / cust.creditLimit) * 100) : (cust.balance > 0 ? 100 : 0);
  const pctColor = cust.creditLimit === 0 ? 'var(--text-light)' : usedPct > 80 ? 'var(--red)' : usedPct > 60 ? 'var(--orange)' : 'var(--green)';
  const isPrepay = cust.creditLimit === 0;

  return `
  <div class="fade-in">
    <button class="btn-ghost mb-16" onclick="window.ERP.nav('#/sales/customers')">← Back to Customers</button>

    <!-- Customer Header -->
    <div class="card mb-16">
      <div class="flex-between" style="flex-wrap:wrap;gap:12px">
        <div>
          <h2 style="margin:0">${cust.name}</h2>
          <div class="text-sm text-light">${cust.code} · ${cust.type} · ${cust.contact}</div>
          <div class="text-sm text-light">${cust.loc}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn-primary btn-sm" onclick="window.ERP.nav('#/sales/new-order');setTimeout(()=>window.ERP._selectOrderCustomer(${cust.id}),50)">📦 New Order</button>
          <button class="btn-success btn-sm" onclick="window.ERP._showPaymentModal(${cust.id})">💵 Payment</button>
        </div>
      </div>
      <!-- Credit Bar -->
      <div class="mt-16" style="display:flex;gap:24px;flex-wrap:wrap;align-items:center">
        <div>
          <span class="text-xs text-light">TIER</span>
          <div style="font-weight:700;font-size:1.1rem">${cust.creditTier}</div>
        </div>
        <div>
          <span class="text-xs text-light">TERMS</span>
          <div style="font-weight:600">${cust.terms}</div>
        </div>
        <div style="flex:1;min-width:200px">
          <div class="flex-between text-xs text-light mb-4">
            <span>${isPrepay ? 'PREPAY ACCOUNT' : 'CREDIT USED'}</span>
            <span>${isPrepay ? 'No credit line' : usedPct + '% — ' + fmt$(cust.balance) + ' / ' + fmt$(cust.creditLimit)}</span>
          </div>
          ${isPrepay
            ? '<div style="padding:6px 12px;background:#fef3c7;border-radius:6px;font-size:0.8rem;color:#92400e">⚠️ Payment required before order confirmation</div>'
            : `<div style="height:8px;background:var(--border);border-radius:4px">
                <div style="height:100%;width:${Math.min(usedPct,100)}%;background:${pctColor};border-radius:4px;transition:width .3s"></div>
              </div>`}
        </div>
        <span class="status-badge" style="background:${statusColor(cust.status === 'Active' ? 'Confirmed' : cust.status)}20;color:${statusColor(cust.status === 'Active' ? 'Confirmed' : cust.status)}">${cust.status}</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs" id="cust-tabs">
      <div class="tab active" data-tab="activity" onclick="window.ERP._switchCustTab(this)">Activity</div>
      <div class="tab" data-tab="orders" onclick="window.ERP._switchCustTab(this)">Orders (${custOrders.length})</div>
      <div class="tab" data-tab="invoices" onclick="window.ERP._switchCustTab(this)">Invoices (${custInvoices.length})</div>
      <div class="tab" data-tab="account" onclick="window.ERP._switchCustTab(this)">Account</div>
      <div class="tab" data-tab="notes" onclick="window.ERP._switchCustTab(this)">Notes</div>
    </div>

    <!-- Tab: Activity (default) -->
    <div class="tab-content active" data-tab="activity">
      <div class="card mt-16">
        <h3 style="margin-top:0">Recent Activity</h3>
        ${custOrders.length === 0 && custPayments.length === 0
          ? '<p class="text-light">No recent activity.</p>'
          : ''}
        ${custOrders.length > 0 ? `
        <div class="table-container mb-8">
          <table><thead><tr><th>Order #</th><th>Date</th><th>Status</th><th style="text-align:right">Total</th><th></th></tr></thead>
          <tbody>${custOrders.map(o => `<tr style="cursor:pointer" onclick="window.ERP.nav('#/sales/order-detail?id=${o.id}')">
            <td><strong>${o.id}</strong></td>
            <td class="text-sm">${o.date}</td>
            <td><span class="status-badge" style="background:${statusColor(o.status)}20;color:${statusColor(o.status)}">${o.status}</span></td>
            <td style="text-align:right">${fmt$(o.total)}</td>
            <td style="white-space:nowrap">
              ${o.status === 'Pending' ? `<button class="btn-sm btn-outline" onclick="event.stopPropagation();window.ERP._editOrder('${o.id}')" style="margin-right:4px">✏️ Edit</button>` : ''}
              <button class="btn-ghost btn-sm" onclick="event.stopPropagation();window.ERP._duplicateOrder('${o.id}')">🔄</button>
            </td>
          </tr>`).join('')}</tbody></table></div>` : ''}
        ${custPayments.length > 0 ? `<div class="text-sm">${custPayments.slice(0,3).map(p => `
          <div class="mb-4" style="padding:6px 0;border-bottom:1px solid var(--border)">
            💵 <strong>${p.id}</strong> — ${fmt$(p.amount)} ${p.method} — ${p.date}
          </div>`).join('')}</div>` : ''}
      </div>
    </div>

    <!-- Tab: Orders -->
    <div class="tab-content" data-tab="orders">
      <div class="card mt-16">
        <h3 style="margin-top:0">Order History</h3>
        ${custOrders.length === 0 ? '<p class="text-light">No orders found.</p>' : `
        <div class="table-container"><table>
          <thead><tr><th>Order #</th><th>Date</th><th>Status</th><th>Items</th><th style="text-align:right">Total</th><th></th></tr></thead>
          <tbody>
          ${custOrders.map(o => `<tr>
            <td><a href="#" onclick="window.ERP.nav('#/sales/order-detail?id=${o.id}');return false">${o.id}</a></td>
            <td class="text-sm">${o.date}</td>
            <td><span class="status-badge" style="background:${statusColor(o.status)}20;color:${statusColor(o.status)}">${o.status}</span></td>
            <td class="text-sm">${o.items.length} items</td>
            <td style="text-align:right">${fmt$(o.total)}</td>
            <td style="white-space:nowrap">
              ${o.status === 'Pending' ? `<button class="btn-sm btn-primary" style="margin-right:4px" onclick="window.ERP._editOrder('${o.id}')">✏️ Edit</button>` : ''}
              <button class="btn-ghost btn-sm" onclick="window.ERP._duplicateOrder('${o.id}')" title="Duplicate">🔄</button>
            </td>
          </tr>`).join('')}
          </tbody></table></div>`}
      </div>
    </div>

    <!-- Tab: Invoices -->
    <div class="tab-content" data-tab="invoices">
      <div class="card mt-16">
        <h3 style="margin-top:0">Invoices</h3>
        ${custInvoices.length === 0 ? '<p class="text-light">No invoices found.</p>' : `
        <div class="table-container"><table>
          <thead><tr><th>Invoice #</th><th>Date</th><th>Due</th><th>Status</th><th style="text-align:right">Total</th><th style="text-align:right">Paid</th><th style="text-align:right">Balance</th><th></th></tr></thead>
          <tbody>
          ${custInvoices.map(i => {
            const bal = i.total - i.paid;
            return `<tr>
              <td>${i.id}</td>
              <td class="text-sm">${i.date}</td>
              <td class="text-sm">${i.due}</td>
              <td><span class="status-badge" style="background:${statusColor(i.status)}20;color:${statusColor(i.status)}">${i.status}</span></td>
              <td style="text-align:right">${fmt$(i.total)}</td>
              <td style="text-align:right">${fmt$(i.paid)}</td>
              <td style="text-align:right;font-weight:600;color:${bal > 0 ? 'var(--red)' : 'var(--green)'}">${fmt$(bal)}</td>
              <td>${bal > 0 ? `<button class="btn-sm btn-success" onclick="window.ERP._showPaymentModal(${cust.id},'${i.id}')">💵 Pay</button>` : '<span class="text-xs text-light">✔</span>'}</td>
            </tr>`;
          }).join('')}
          </tbody></table></div>`}
      </div>
    </div>

    <!-- Tab: Account -->
    <div class="tab-content" data-tab="account">
      <div class="grid-2 mt-16" style="gap:16px">
        <div class="card">
          <h4 style="margin-top:0">Credit Information</h4>
          <div class="mb-8"><span class="text-light">Credit Tier:</span> <strong>${cust.creditTier}</strong></div>
          <div class="mb-8"><span class="text-light">Credit Limit:</span> <strong>${isPrepay ? 'Prepay ($0)' : fmt$(cust.creditLimit)}</strong></div>
          <div class="mb-8"><span class="text-light">Current Balance:</span> <strong>${fmt$(cust.balance)}</strong></div>
          <div class="mb-8"><span class="text-light">Available Credit:</span> <strong>${isPrepay ? 'N/A (Prepay)' : fmt$(cust.creditLimit - cust.balance)}</strong></div>
          <div class="mb-8"><span class="text-light">Terms:</span> <strong>${cust.terms}</strong></div>
          <div class="mb-8"><span class="text-light">Price Level:</span> <strong>${cust.priceLevel}</strong></div>
          <div class="mb-8"><span class="text-light">Payment on File:</span> <strong>${cust.hasPaymentOnFile ? '✅ Yes' : '❌ No'}</strong></div>
        </div>
        <div class="card">
          <h4 style="margin-top:0">Contact & Location</h4>
          <div class="mb-8"><span class="text-light">Contact:</span> ${cust.contact}</div>
          <div class="mb-8"><span class="text-light">Phone:</span> ${cust.phone}</div>
          <div class="mb-8"><span class="text-light">Email:</span> ${cust.email}</div>
          <div class="mb-8"><span class="text-light">Address:</span> ${cust.loc}</div>
          <div class="mb-8"><span class="text-light">Route:</span> ${cust.route || 'None'}</div>
          ${cust.parentId ? `<div class="mb-8"><span class="text-light">Parent:</span> <a href="#" onclick="window.ERP.nav('#/sales/customer?id=${cust.parentId}');return false">${customerName(cust.parentId)}</a></div>` : ''}
        </div>
      </div>
      <div class="card mt-16">
        <h4 style="margin-top:0">Payment History</h4>
        ${custPayments.length === 0 ? '<p class="text-light">No payments recorded.</p>' : `
        <div class="table-container"><table>
          <thead><tr><th>Payment #</th><th>Date</th><th>Invoice</th><th>Method</th><th style="text-align:right">Amount</th><th>Status</th></tr></thead>
          <tbody>
          ${custPayments.map(p => `<tr>
            <td>${p.id}</td>
            <td class="text-sm">${p.date}</td>
            <td>${p.invoice || '—'}</td>
            <td class="text-sm">${p.method}</td>
            <td style="text-align:right">${fmt$(p.amount)}</td>
            <td><span class="status-badge" style="background:${statusColor(p.status)}20;color:${statusColor(p.status)}">${p.status}</span></td>
          </tr>`).join('')}
          </tbody></table></div>`}
      </div>
    </div>

    <!-- Tab: Notes -->
    <div class="tab-content" data-tab="notes">
      <div class="card mt-16">
        <textarea rows="3" placeholder="Add a note about this customer…" style="width:100%;padding:12px;border:1px solid var(--border);border-radius:8px;font-family:inherit;resize:vertical"></textarea>
        <button class="btn-primary btn-sm mt-8" onclick="window.ERP.toast('Note saved','success')">💾 Save Note</button>
      </div>
      <div class="mt-16">
        <div class="card mb-8" style="border-left:3px solid var(--blue)">
          <div class="flex-between mb-4"><strong>Marcus Johnson</strong><span class="text-xs text-light">2026-02-20</span></div>
          <p class="text-sm" style="margin:0">Customer requested delivery before 10 AM for weekday orders. Prefers palletized.</p>
        </div>
        <div class="card mb-8" style="border-left:3px solid var(--blue)">
          <div class="flex-between mb-4"><strong>Nicole Rivera</strong><span class="text-xs text-light">2026-01-15</span></div>
          <p class="text-sm" style="margin:0">Expanding their space — expect larger orders starting March.</p>
        </div>
      </div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════
//  ORDER DETAIL
// ══════════════════════════════════════════
function orderDetailPage(page) {
  if (window.ERP._isMobile) return mobileOrderDetail(page);
  const orderId = getParam(page, 'id');
  const order = orderById(orderId);
  if (!order) return '<div class="card"><p>Order not found.</p><button class="btn-primary" onclick="window.ERP.nav(\'#/sales/orders\')">← Back</button></div>';

  const cust = customerById(order.customer);
  const subtotal = order.items.reduce((s, i) => { const p = productById(i.productId); return s + (p ? p.price * i.qty : 0); }, 0);
  const crv = order.items.reduce((s, i) => { const p = productById(i.productId); return s + (p ? getCRV(p) * i.qty : 0); }, 0);

  // Invoice / payment status
  const inv = invoiceByOrder(orderId);
  const isPaid = inv && inv.status === 'Paid';
  const hasOpenBalance = inv && inv.status !== 'Paid' && (inv.total - inv.paid) > 0;

  // Status timeline
  const statuses = ['Pending','Confirmed','Picking','Out for Delivery','Delivered'];
  const currentIdx = statuses.indexOf(order.status);

  return `
  <div class="fade-in">
    <button class="btn-ghost mb-16" onclick="window.ERP.nav('#/sales/orders')">← Back to Orders</button>

    <div class="card mb-16">
      <div class="flex-between" style="flex-wrap:wrap;gap:12px">
        <div>
          <h2 style="margin:0">${order.id}</h2>
          <div class="text-sm text-light">${cust ? cust.name : 'Unknown'} · ${order.date} · ${order.route || '—'}</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <span class="status-badge" style="font-size:0.9rem;padding:6px 14px;background:${statusColor(order.status)}20;color:${statusColor(order.status)}">${order.status}</span>
          ${isPaid
            ? '<span class="status-badge" style="font-size:0.85rem;padding:5px 12px;background:var(--green-bg);color:var(--green)">💵 PAID</span>'
            : hasOpenBalance
              ? `<button class="btn-success btn-sm" onclick="window.ERP._showPaymentModal(${cust ? cust.id : 0},'${inv ? inv.id : ''}')">💵 Take Payment</button>`
              : '<span class="status-badge" style="font-size:0.8rem;padding:4px 10px;background:#f1f5f9;color:var(--text-light)">No Invoice Yet</span>'}
          ${order.status === 'Pending' ? `<button class="btn-primary btn-sm" onclick="window.ERP._editOrder('${order.id}')">✏️ Edit Order</button>` : ''}
          <button class="btn-outline btn-sm" onclick="window.ERP._duplicateOrder('${order.id}')">🔄 Duplicate</button>
          <button class="btn-outline btn-sm" onclick="window.ERP._printSavedOrder('${order.id}')">🖨️ Print</button>
          <button class="btn-outline btn-sm" onclick="window.ERP._sendSavedOrder('${order.id}')">📧 Send</button>
        </div>
      </div>
      ${inv ? `
      <div class="mt-12" style="background:var(--bg-secondary);border-radius:8px;padding:10px 14px;display:flex;gap:16px;flex-wrap:wrap;font-size:0.85rem">
        <span><span class="text-light">Invoice:</span> <strong>${inv.id}</strong></span>
        <span><span class="text-light">Due:</span> <strong>${inv.due}</strong></span>
        <span><span class="text-light">Total:</span> <strong>${fmt$(inv.total)}</strong></span>
        <span><span class="text-light">Paid:</span> <strong style="color:${inv.paid>0?'var(--green)':'var(--text-light)'}">${fmt$(inv.paid)}</strong></span>
        <span><span class="text-light">Balance:</span> <strong style="color:${(inv.total-inv.paid)>0?'var(--red)':'var(--green)'}">${fmt$(inv.total-inv.paid)}</strong></span>
        <span class="status-badge" style="background:${statusColor(inv.status)}20;color:${statusColor(inv.status)}">${inv.status}</span>
      </div>` : ''}
    </div>

    <!-- Status Timeline -->
    ${order.status !== 'Hold' ? `
    <div class="card mb-16">
      <div style="display:flex;justify-content:space-between;position:relative;padding:0 8px">
        <div style="position:absolute;top:14px;left:24px;right:24px;height:3px;background:var(--border)"></div>
        <div style="position:absolute;top:14px;left:24px;height:3px;background:var(--primary);width:${currentIdx >= 0 ? (currentIdx / (statuses.length - 1)) * 100 : 0}%;max-width:calc(100% - 48px);transition:width .5s"></div>
        ${statuses.map((s, i) => `<div style="text-align:center;position:relative;z-index:1">
          <div style="width:30px;height:30px;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;
            ${i <= currentIdx ? 'background:var(--primary);color:#fff' : 'background:var(--bg-secondary);border:2px solid var(--border);color:var(--text-light)'}">
            ${i < currentIdx ? '✓' : i + 1}
          </div>
          <div class="text-xs ${i <= currentIdx ? '' : 'text-light'}" style="margin-top:6px">${s}</div>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- Items -->
    <div class="card mb-16">
      <h3 style="margin-top:0">Order Items</h3>
      <div class="table-container"><table>
        <thead><tr><th>Code</th><th>Product</th><th>Container</th><th style="text-align:right">Unit</th><th style="text-align:right">Case Price</th><th style="text-align:center">Qty</th><th style="text-align:right">CRV</th><th style="text-align:right">Subtotal</th></tr></thead>
        <tbody>
        ${order.items.map(item => {
          const p = productById(item.productId);
          if (!p) return '';
          const lineCrv = getCRV(p) * item.qty;
          const lineTotal = p.price * item.qty + lineCrv;
          return `<tr>
            <td class="text-xs text-light">${p.code}</td>
            <td><strong>${p.name}</strong><br><span class="text-xs text-light">${p.flavor}</span></td>
            <td class="text-sm">${p.size}${p.material === 'Glass' ? ' 🫙' : ''}<br><span class="text-xs text-light">${p.packSize}</span></td>
            <td style="text-align:right" class="text-sm">${fmt$(p.unitPrice)}</td>
            <td style="text-align:right">${fmt$(p.price)}</td>
            <td style="text-align:center">${item.qty}</td>
            <td style="text-align:right" class="text-xs text-light">${fmt$(lineCrv)}</td>
            <td style="text-align:right;font-weight:600">${fmt$(lineTotal)}</td>
          </tr>`;
        }).join('')}
        </tbody>
        <tfoot>
          <tr><td colspan="6"></td><td style="text-align:right" class="text-light">Subtotal</td><td style="text-align:right">${fmt$(subtotal)}</td></tr>
          <tr><td colspan="6"></td><td style="text-align:right" class="text-light">CRV</td><td style="text-align:right">${fmt$(crv)}</td></tr>
          <tr><td colspan="6"></td><td style="text-align:right;font-weight:700">Total</td><td style="text-align:right;font-weight:700;font-size:1.1rem">${fmt$(subtotal + crv)}</td></tr>
        </tfoot>
      </table></div>
    </div>

    <!-- Delivery Info -->
    <div class="grid-2">
      <div class="card">
        <h4 style="margin-top:0">Delivery Details</h4>
        <div class="mb-8"><span class="text-light">Delivery Date:</span> ${order.deliveryDate}</div>
        <div class="mb-8"><span class="text-light">Route:</span> ${order.route || '—'}</div>
        <div class="mb-8"><span class="text-light">Salesperson:</span> ${order.salesperson}</div>
      </div>
      <div class="card">
        <h4 style="margin-top:0">Customer Info</h4>
        ${cust ? `
        <div class="mb-8"><span class="text-light">Name:</span> <a href="#" onclick="window.ERP.nav('#/sales/customer?id=${cust.id}');return false">${cust.name}</a></div>
        <div class="mb-8"><span class="text-light">Contact:</span> ${cust.contact} · ${cust.phone}</div>
        <div class="mb-8"><span class="text-light">Address:</span> ${cust.loc}</div>` : '<p class="text-light">Unknown customer</p>'}
      </div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════
//  ORDER HISTORY
// ══════════════════════════════════════════
function orderHistoryPage() {
  if (window.ERP._isMobile) return mobileOrderHistory();
  return `
  <div class="fade-in">
    <div class="flex-between mb-16">
      <h1 style="margin:0">Order History</h1>
      <button class="btn-primary" onclick="window.ERP.nav('#/sales/new-order')">➕ New Order</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      ${['All','Pending','Confirmed','Picking','Out for Delivery','Delivered','Hold'].map(s =>
        `<button class="btn-outline btn-sm" onclick="window.ERP._filterOrders('${s}')" style="font-size:0.8rem">${s}</button>`
      ).join('')}
    </div>
    <div id="order-list">
      ${renderOrderList(ORDERS)}
    </div>
  </div>`;
}

function renderOrderList(orders) {
  if (orders.length === 0) return '<p class="text-light">No orders found.</p>';
  return `<div class="table-container"><table>
    <thead><tr><th>Order #</th><th>Customer</th><th>Date</th><th>Items</th><th>Status</th><th style="text-align:right">Total</th><th></th></tr></thead>
    <tbody>
    ${orders.map(o => {
      const cust = customerById(o.customer);
      return `<tr style="cursor:pointer" onclick="window.ERP.nav('#/sales/order-detail?id=${o.id}')">
        <td><strong>${o.id}</strong></td>
        <td class="text-sm">${cust ? cust.name : 'Unknown'}</td>
        <td class="text-sm">${o.date}</td>
        <td class="text-sm">${o.items.length} items</td>
        <td><span class="status-badge" style="background:${statusColor(o.status)}20;color:${statusColor(o.status)}">${o.status}</span></td>
        <td style="text-align:right">${fmt$(o.total)}</td>
        <td style="white-space:nowrap">
          ${o.status === 'Pending' ? `<button class="btn-sm btn-primary" style="margin-right:4px" onclick="event.stopPropagation();window.ERP._editOrder('${o.id}')">✏️ Edit</button>` : ''}
          <button class="btn-ghost btn-sm" onclick="event.stopPropagation();window.ERP._duplicateOrder('${o.id}')" title="Duplicate">🔄</button>
        </td>
      </tr>`;
    }).join('')}
    </tbody></table></div>`;
}

// ══════════════════════════════════════════
//  NEW ORDER — Multi-step flow
// ══════════════════════════════════════════
function newOrderPage() {
  if (window.ERP._isMobile) return mobileNewOrder();
  // Step indicator
  const steps = ['Select Customer', 'Add Products', 'Review Order', 'Confirmation'];
  const stepBar = `<div style="display:flex;gap:4px;margin-bottom:24px">
    ${steps.map((s, i) => {
      const n = i + 1;
      const active = n === orderStep;
      const done = n < orderStep;
      return `<div style="flex:1;text-align:center;padding:10px 4px;border-radius:8px;font-size:0.8rem;font-weight:${active ? 700 : 400};
        background:${active ? 'var(--primary)' : done ? 'var(--green)' : 'var(--bg-secondary)'};
        color:${active || done ? '#fff' : 'var(--text-light)'}">
        ${done ? '✓' : n}. ${s}</div>`;
    }).join('')}
  </div>`;

  // Customer info bar (with dropdown for changing customer)
  const custBar = selectedCustomer && orderStep >= 2 ? `
    <div class="info-box mb-16" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span>📍 Customer:</span>
      <select style="font-weight:600;padding:6px 10px;border-radius:6px;border:1px solid var(--border);font-size:0.85rem;max-width:280px"
        onchange="window.ERP._changeOrderCustomer(parseInt(this.value))">
        ${CUSTOMERS.filter(c => c.status !== 'Hold').map(c =>
          `<option value="${c.id}" ${c.id === selectedCustomer.id ? 'selected' : ''}>${c.name} (${c.code})</option>`
        ).join('')}
      </select>
      <span class="text-sm text-light">
        Tier ${selectedCustomer.creditTier} ·
        ${selectedCustomer.creditLimit > 0
          ? 'Avail. credit: ' + fmt$(selectedCustomer.creditLimit - selectedCustomer.balance)
          : '⚠️ Prepay Required'}
      </span>
    </div>` : '';

  return `
  <div class="fade-in">
    <div class="flex-between mb-16">
      <h1 style="margin:0">New Order</h1>
      ${orderStep > 1 ? `<button class="btn-ghost" onclick="window.ERP._resetOrder()">✕ Cancel</button>` : ''}
    </div>
    ${stepBar}
    ${custBar}
    ${orderStep === 1 ? orderStep1()
      : orderStep === 2 ? orderStep2()
      : orderStep === 3 ? orderStep3()
      : orderStep4()}
  </div>`;
}

// ── Step 1: Select Customer ──
function orderStep1() {
  return `
  <div class="card">
    <h3 style="margin-top:0">Select Customer</h3>
    <input type="text" placeholder="🔍 Search customers…" id="order-cust-search"
      oninput="window.ERP._filterOrderCustomers(this.value)"
      style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;width:100%;margin-bottom:16px">
    <div id="order-cust-list">
      ${CUSTOMERS.map(c => {
        const disabled = c.status === 'Hold';
        const isPrepay = c.creditLimit === 0;
        return `<div style="padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;
          ${disabled ? 'opacity:0.5;' : 'cursor:pointer;'}
          display:flex;justify-content:space-between;align-items:center"
          ${disabled ? '' : `onclick="window.ERP._selectOrderCustomer(${c.id})"`}>
          <div>
            <strong>${c.name}</strong>
            <span class="text-xs text-light ml-8">${c.code}</span>
            ${disabled ? '<span class="text-xs" style="color:var(--red);margin-left:8px">🔴 On Hold</span>' : ''}
            ${isPrepay ? '<span class="text-xs" style="color:#b45309;margin-left:8px">⚠️ Prepay</span>' : ''}
          </div>
          <div class="text-sm text-light">
            ${c.creditLimit > 0 ? 'Tier ' + c.creditTier + ' · ' + fmt$(c.creditLimit - c.balance) + ' avail.' : 'Prepay'}
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ── Step 2: Product Catalog + Cart ──
function orderStep2() {
  // For search mode — search across all products
  const searchResults = productSearch
    ? PRODUCTS.filter(p => {
        const q = productSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.flavor.toLowerCase().includes(q) ||
               p.code.toLowerCase().includes(q) || p.size.toLowerCase().includes(q);
      })
    : [];

  const cartTotal = calcCartTotal();
  const cartSubtotal = calcCartSubtotal();
  const cartCrv = calcCartCRV();
  const cartItems = cart.length;

  return `
  <div style="display:grid;grid-template-columns:1fr 320px;gap:16px;align-items:start">
    <!-- Product Catalog -->
    <div>
      <!-- Search (always visible — clears to show browser) -->
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px">
        <input type="text" placeholder="🔍 Search across all flavors, sizes, codes…" value="${productSearch}"
          oninput="window.ERP._searchProducts(this.value)"
          style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:8px">
        ${productSearch ? `<button class="btn-ghost btn-sm" onclick="window.ERP._searchProducts('')" title="Clear search">✕ Clear</button>` : ''}
      </div>
      <!-- Hierarchical inventory browser OR search results -->
      ${productSearch ? renderProductTable(searchResults) : renderInventoryBrowser()}
    </div>
    <!-- Cart Sidebar -->
    <div class="card" style="position:sticky;top:16px">
      <h3 style="margin-top:0">🛒 Cart (${cartItems} items)</h3>
      ${cart.length === 0 ? '<p class="text-light text-sm">Add products to get started</p>' : `
        <div style="max-height:340px;overflow-y:auto">
          ${cart.map(item => {
            const p = productById(item.productId);
            if (!p) return '';
            const disc  = orderDiscounts[item.productId] || 0;
            const effPx = getItemPrice(item.productId);
            const lineTotal = effPx * item.qty;
            const isOverride = orderPriceOverrides[item.productId] !== undefined;
            return `<div style="padding:8px 0;border-bottom:1px solid var(--border)">
              <div class="flex-between">
                <div>
                  <div class="text-sm"><strong>${p.name}</strong> ${p.flavor}</div>
                  <div class="text-xs text-light">${p.size}${p.material === 'Glass' ? ' 🫙' : ''}</div>
                </div>
                <div style="display:flex;align-items:center;gap:4px">
                  <button class="btn-ghost" style="padding:2px 5px;font-size:0.8rem" onclick="window.ERP._cartQty(${p.id},-1)">−</button>
                  <input type="number" min="0" value="${item.qty}"
                    style="width:44px;padding:2px 4px;border:1px solid var(--border);border-radius:4px;font-size:0.8rem;text-align:center;font-weight:600"
                    onchange="window.ERP._setCartQtyDirect(${p.id}, parseInt(this.value)||0)">
                  <button class="btn-ghost" style="padding:2px 5px;font-size:0.8rem" onclick="window.ERP._cartQty(${p.id},1)">+</button>
                  <button class="btn-ghost" style="padding:2px 4px;font-size:0.7rem;color:var(--red)" onclick="window.ERP._removeFromCart(${p.id})">✕</button>
                </div>
              </div>
              <!-- Price / Discount row -->
              <div style="display:flex;align-items:center;gap:6px;margin-top:5px;font-size:0.78rem">
                <span class="text-light">Disc%</span>
                <input type="number" min="0" max="${ORDER_CAPS.maxDiscountPct}" step="1"
                  value="${disc > 0 ? disc : ''}"
                  placeholder="0"
                  style="width:48px;padding:2px 4px;border:1px solid ${disc > ORDER_CAPS.warnDiscountPct ? 'var(--orange)' : disc > 0 ? 'var(--green)' : 'var(--border)'};border-radius:4px;font-size:0.78rem;text-align:center"
                  onchange="window.ERP._setItemDiscount(${p.id}, parseFloat(this.value)||0)">
                <span class="text-light">or $</span>
                <input type="number" min="0" step="0.01"
                  value="${isOverride ? orderPriceOverrides[item.productId].toFixed(2) : ''}"
                  placeholder="${p.price.toFixed(2)}"
                  style="width:64px;padding:2px 4px;border:1px solid var(--border);border-radius:4px;font-size:0.78rem;text-align:center"
                  onchange="window.ERP._setItemPrice(${p.id}, this.value)">
                <span style="margin-left:auto;font-weight:600;color:${disc>0||isOverride?'var(--primary)':'var(--text)'}">${fmt$(lineTotal)}</span>
              </div>
              ${disc > ORDER_CAPS.warnDiscountPct ? `<div class="text-xs" style="color:var(--orange);margin-top:2px">⚠️ High discount</div>` : ''}
            </div>`;
          }).join('')}
        </div>
        <div style="border-top:2px solid var(--border);padding-top:12px;margin-top:8px">
          <div class="flex-between text-sm mb-4"><span>Subtotal</span><span>${fmt$(cartSubtotal)}</span></div>
          <div class="flex-between text-sm mb-4 text-light"><span>CRV</span><span>${fmt$(cartCrv)}</span></div>
          <div class="flex-between" style="font-weight:700;font-size:1.1rem"><span>Total</span><span>${fmt$(cartTotal)}</span></div>
        </div>
      `}
      <div style="margin-top:16px;display:flex;gap:8px">
        <button class="btn-outline" style="flex:1" onclick="window.ERP._setOrderStep(1)">← Back</button>
        <button class="btn-primary" style="flex:1" onclick="window.ERP._setOrderStep(3)" ${cart.length === 0 ? 'disabled' : ''}>Review →</button>
      </div>
    </div>
  </div>`;
}

function renderProductTable(products) {
  if (products.length === 0) return '<p class="text-light">No products match your search.</p>';
  return `<div class="table-container"><table>
    <thead><tr>
      <th>Code</th><th>Product</th><th>Container</th>
      <th style="text-align:right">Unit</th><th style="text-align:right">Case</th>
      <th style="text-align:center">Stock</th><th style="text-align:center;width:80px">Qty</th><th></th>
    </tr></thead>
    <tbody>
    ${products.map(p => {
      const inCart = cart.find(c => c.productId === p.id);
      const hasOverride = stockOverrides.has(p.id);
      const maxHard = p.overStockLimit === 0 ? p.stock : p.stock + p.overStockLimit;
      const oos = p.stock <= 0 && p.overStockLimit === 0 && !hasOverride;
      const low = p.stock > 0 && p.stock < 10;
      const inWarn = inCart && inCart.qty > p.stock && p.overStockLimit > 0;
      const aboveLimit = inCart && inWarn && inCart.qty > maxHard;
      const needsOverride = inCart && p.overStockLimit === 0 && inCart.qty > p.stock && !hasOverride;
      return `<tr style="${oos ? 'opacity:0.45' : ''}">
        <td class="text-xs text-light">${p.code}</td>
        <td>
          <strong>${p.name}</strong><br>
          <span class="text-xs text-light">${p.flavor}</span>
        </td>
        <td class="text-sm">
          ${p.size}${p.material === 'Glass' ? ' 🫙' : ''}<br>
          <span class="text-xs text-light">${p.packSize}</span>
        </td>
        <td style="text-align:right" class="text-sm">
          ${fmt$(p.unitPrice)}<br><span class="text-xs text-light">/ea</span>
        </td>
        <td style="text-align:right">
          ${fmt$(p.price)}<br><span class="text-xs text-light">/case</span>
        </td>
        <td style="text-align:center">
          <span style="color:${oos ? 'var(--red)' : low ? 'var(--orange)' : 'var(--text)'}">${p.stock} CS</span>
          ${low && !oos ? '<br><span class="text-xs" style="color:var(--orange)">Low</span>' : ''}
          ${oos ? '<br><span class="text-xs" style="color:var(--red)">OOS</span>' : ''}
          ${p.overStockLimit > 0 ? `<br><span class="text-xs text-light">+${p.overStockLimit} over OK</span>` : ''}
          ${hasOverride ? '<br><span class="text-xs" style="color:#7c3aed">★ Override</span>' : ''}
        </td>
        <td style="text-align:center">
          ${inCart ? `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
            <div style="display:flex;align-items:center;gap:3px">
              <button class="btn-ghost" style="padding:1px 5px;font-size:0.75rem" onclick="window.ERP._cartQty(${p.id},-1)">−</button>
              <input type="number" min="0" value="${inCart.qty}"
                style="width:46px;padding:1px 4px;border:1.5px solid ${aboveLimit ? 'var(--red)' : inWarn ? 'var(--orange)' : needsOverride ? 'var(--red)' : 'var(--border)'};border-radius:4px;font-size:0.8rem;text-align:center;font-weight:600"
                onchange="window.ERP._setCartQtyDirect(${p.id}, parseInt(this.value)||0)">
              <button class="btn-ghost" style="padding:1px 5px;font-size:0.75rem" onclick="window.ERP._cartQty(${p.id},1)">+</button>
            </div>
            ${aboveLimit ? `<span class="text-xs" style="color:var(--red)">⚠️ ${inCart.qty - maxHard} above limit</span>` : inWarn ? '<span class="text-xs" style="color:var(--orange)">⚠️ Over stock</span>' : ''}
            ${needsOverride ? `<button style="font-size:0.68rem;padding:1px 5px;border:1px solid #7c3aed;border-radius:4px;color:#7c3aed;background:transparent;cursor:pointer" onclick="window.ERP._grantStockOverride(${p.id})">Override</button>` : ''}
          </div>` : ''}
        </td>
        <td>
          ${oos
            ? `<div style="text-align:center"><span class="text-xs" style="color:var(--red)">OOS</span><br><button style="font-size:0.7rem;padding:2px 6px;border:1px solid #7c3aed;border-radius:4px;background:transparent;color:#7c3aed;cursor:pointer;margin-top:2px" onclick="window.ERP._grantStockOverride(${p.id})">Override</button></div>`
            : `<button class="btn-sm ${inCart ? 'btn-outline' : 'btn-primary'}" onclick="window.ERP._addToCart(${p.id})">${inCart ? '✓' : '+'}</button>`}
        </td>
      </tr>`;
    }).join('')}
    </tbody></table></div>`;
}

// ── Hierarchical Inventory Browser ──
// Hierarchy: Container Type (size/material) → Case Size (packSize) → Flavors grid
const _CONTAINER_TYPES = [
  { key: '12oz Can',          label: '12oz Can',     icon: '🥤' },
  { key: '20oz Bottle',       label: '20oz Bottle',  icon: '🍶' },
  { key: '2L Bottle',         label: '2L Bottle',    icon: '🧃' },
  { key: '12oz Glass Bottle', label: '12oz Glass',   icon: '🫙' },
];

function renderInventoryBrowser() {
  // Ensure the selected container is valid; default to first available
  const availableContainers = _CONTAINER_TYPES.filter(ct => PRODUCTS.some(p => p.size === ct.key));
  if (!availableContainers.find(ct => ct.key === selectedContainer)) {
    selectedContainer = availableContainers[0] ? availableContainers[0].key : null;
  }

  // Pack sizes available for the selected container
  const packSizes = [...new Set(PRODUCTS.filter(p => p.size === selectedContainer).map(p => p.packSize))];
  if (!packSizes.includes(selectedPackSize)) selectedPackSize = packSizes[0] || null;

  // Products for this container + pack size
  const flavorProducts = PRODUCTS.filter(p => p.size === selectedContainer && p.packSize === selectedPackSize);

  // Count in-cart items per container for badge
  const containerCartCount = ct => cart.filter(ci => PRODUCTS.find(p => p.id === ci.productId && p.size === ct.key)).length;

  return `
  <!-- Container Type Tabs -->
  <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
    ${availableContainers.map(ct => {
      const active = selectedContainer === ct.key;
      const inCartCount = containerCartCount(ct);
      return `<button onclick="window.ERP._setContainer('${ct.key}')"
        style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 18px;border-radius:12px;cursor:pointer;
          border:2px solid ${active ? 'var(--primary)' : 'var(--border)'};
          background:${active ? 'var(--primary)' : '#fff'};
          color:${active ? '#fff' : 'var(--text)'};
          font-weight:${active ? 700 : 500};
          transition:all .15s;
          position:relative">
        <span style="font-size:1.6rem">${ct.icon}</span>
        <span style="font-size:0.82rem">${ct.label}</span>
        ${inCartCount > 0 ? `<span style="position:absolute;top:6px;right:6px;background:${active ? '#fff' : 'var(--primary)'};color:${active ? 'var(--primary)' : '#fff'};width:18px;height:18px;border-radius:50%;font-size:0.65rem;font-weight:700;display:flex;align-items:center;justify-content:center">${inCartCount}</span>` : ''}
      </button>`;
    }).join('')}
  </div>

  <!-- Case Size Selector -->
  ${packSizes.length > 0 ? `
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
    <span class="text-xs text-light" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px">Case Size:</span>
    ${packSizes.map(ps => `
      <button onclick="window.ERP._setPackSize('${ps}')"
        class="btn-sm ${selectedPackSize === ps ? 'btn-primary' : 'btn-outline'}">
        📦 ${ps}
      </button>`).join('')}
  </div>` : ''}

  <!-- Flavor Cards Grid -->
  <div class="text-xs text-light mb-12" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px">
    ${flavorProducts.length} flavor${flavorProducts.length !== 1 ? 's' : ''} — ${selectedContainer} · ${selectedPackSize}
  </div>
  ${renderFlavorGrid(flavorProducts)}`;
}

function renderFlavorGrid(products) {
  if (products.length === 0) return '<p class="text-light">No products found in this category.</p>';
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:12px">
    ${products.map(p => {
      const inCart   = cart.find(c => c.productId === p.id);
      const hasOverride = stockOverrides.has(p.id);
      const maxHard  = p.overStockLimit === 0 ? p.stock : p.stock + p.overStockLimit;
      const oos      = p.stock <= 0 && p.overStockLimit === 0 && !hasOverride;
      const low      = p.stock > 0 && p.stock < 10;
      const inWarn   = inCart && inCart.qty > p.stock && p.overStockLimit > 0;
      const aboveLimit  = inCart && inWarn && inCart.qty > maxHard;
      const needsOverride = inCart && p.overStockLimit === 0 && inCart.qty > p.stock && !hasOverride;
      const qtyBorder = aboveLimit ? 'var(--red)' : inWarn ? 'var(--orange)' : needsOverride ? 'var(--red)' : 'var(--primary)';
      const crv = getCRV(p);
      return `<div style="
          border:2px solid ${inCart ? 'var(--primary)' : 'var(--border)'};
          border-radius:14px;
          padding:14px 12px;
          background:${inCart ? 'var(--primary-light)' : '#fff'};
          ${oos ? 'opacity:0.5;' : ''}
          display:flex;flex-direction:column;gap:7px;
          transition:box-shadow .15s;"
          ${oos ? '' : `onmouseenter="this.style.boxShadow='0 3px 10px rgba(0,0,0,.1)'" onmouseleave="this.style.boxShadow='none'"`}>
        <!-- Flavor name -->
        <div style="font-weight:700;font-size:1rem;line-height:1.2">${p.name}</div>
        <div style="font-size:0.82rem;color:var(--text-light);font-weight:600">${p.flavor}</div>
        <!-- Code -->
        <div class="text-xs text-light">${p.code}</div>
        <!-- Pricing row -->
        <div style="display:flex;flex-direction:column;gap:1px">
          <div style="font-size:1.15rem;font-weight:800;color:var(--primary)">${fmt$(p.price)}<span style="font-size:0.72rem;font-weight:500;color:var(--text-light)">/case</span></div>
          <div style="font-size:0.72rem;color:var(--text-light)">${fmt$(p.unitPrice)}/ea &nbsp;·&nbsp; CRV ${fmt$(crv)}</div>
        </div>
        <!-- Stock indicator -->
        <div style="font-size:0.75rem;font-weight:600;color:${oos ? 'var(--red)' : low ? 'var(--orange)' : 'var(--green)'}">
          ${oos ? '🔴 Out of Stock' : low ? `🟡 Low — ${p.stock} CS` : `✅ ${p.stock} CS`}
          ${p.overStockLimit > 0 ? `<span style="color:var(--text-light);font-weight:400"> +${p.overStockLimit} ok</span>` : ''}
          ${hasOverride ? ' <span style="color:#7c3aed">★</span>' : ''}
        </div>
        <!-- Controls -->
        ${inCart ? `
          <div style="display:flex;align-items:center;gap:4px;margin-top:2px">
            <button class="btn-ghost" style="padding:2px 8px;font-size:0.9rem;font-weight:700" onclick="window.ERP._cartQty(${p.id},-1)">−</button>
            <input type="number" min="0" value="${inCart.qty}"
              style="width:50px;padding:3px 5px;border:2px solid ${qtyBorder};border-radius:7px;font-size:0.88rem;text-align:center;font-weight:700;background:#fff"
              onchange="window.ERP._setCartQtyDirect(${p.id}, parseInt(this.value)||0)">
            <button class="btn-ghost" style="padding:2px 8px;font-size:0.9rem;font-weight:700" onclick="window.ERP._cartQty(${p.id},1)">+</button>
            <button class="btn-ghost" style="padding:2px 6px;font-size:0.75rem;color:var(--red);margin-left:auto" onclick="window.ERP._removeFromCart(${p.id})" title="Remove">✕</button>
          </div>
          ${aboveLimit ? `<div style="font-size:0.72rem;color:var(--red)">⚠️ ${inCart.qty - maxHard} above limit</div>` : inWarn ? `<div style="font-size:0.72rem;color:var(--orange)">⚠️ Over stock</div>` : ''}
          ${needsOverride ? `<button style="font-size:0.72rem;padding:3px 8px;border:1px solid #7c3aed;border-radius:6px;color:#7c3aed;background:transparent;cursor:pointer;margin-top:2px" onclick="window.ERP._grantStockOverride(${p.id})">★ Manager Override</button>` : ''}
        ` : oos ? `
          <button style="font-size:0.75rem;padding:5px 8px;border:1px solid #7c3aed;border-radius:8px;color:#7c3aed;background:transparent;cursor:pointer;width:100%;margin-top:2px" onclick="window.ERP._grantStockOverride(${p.id})">★ Manager Override</button>
        ` : `
          <button class="btn-primary btn-sm" style="width:100%;margin-top:2px;border-radius:8px;padding:6px 0"
            onclick="window.ERP._addToCart(${p.id})">+ Add to Cart</button>
        `}
      </div>`;
    }).join('')}
  </div>`;
}

// ── Step 3: Review Order — editable printout ──
function orderStep3() {
  if (!selectedCustomer) { orderStep = 1; return orderStep1(); }
  const cust = selectedCustomer;
  const isPrepay = cust.creditLimit === 0;

  const subtotal = calcCartSubtotal();
  const crv = calcCartCRV();
  const total = subtotal + crv;

  const postBalance = cust.balance + total;
  const overCredit = !isPrepay && cust.creditLimit > 0 && postBalance > cust.creditLimit;
  const today = new Date().toISOString().slice(0, 10);

  const hasDiscounts = Object.keys(orderDiscounts).some(k => (orderDiscounts[k] || 0) > 0) ||
                       Object.keys(orderPriceOverrides).length > 0;

  return `
  <div id="order-review-doc" style="max-width:760px;margin:0 auto">
    <!-- Print / Send toolbar -->
    <div class="flex-between mb-12" style="gap:8px;flex-wrap:wrap">
      <span class="text-light text-sm">Review every detail — all fields editable before submitting</span>
      <div style="display:flex;gap:8px">
        <button class="btn-outline btn-sm" onclick="window.ERP._printOrderReview()">🖨️ Print</button>
        <button class="btn-outline btn-sm" onclick="window.ERP._sendOrderReview()">📧 Send Copy</button>
      </div>
    </div>

    <!-- Document shell -->
    <div class="card" id="printable-order" style="padding:28px 32px;border:1px solid var(--border)">

      <!-- Header row -->
      <div class="flex-between mb-20" style="border-bottom:2px solid var(--primary);padding-bottom:16px">
        <div>
          <div style="font-size:1.4rem;font-weight:800;color:var(--primary)">📦 WholesaleERP</div>
          <div class="text-xs text-light">Own-Brand Beverage Distribution</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:1.1rem;font-weight:700">ORDER REVIEW</div>
          <div class="text-xs text-light">Draft — not yet submitted</div>
          <div class="text-xs text-light">Salesperson: Marcus Johnson</div>
        </div>
      </div>

      <!-- Customer + Delivery grid -->
      <div class="grid-2 mb-20" style="gap:24px">
        <div>
          <div class="text-xs text-light mb-6" style="font-weight:700;text-transform:uppercase;letter-spacing:.5px">Bill / Ship To</div>
          <div style="font-weight:700;font-size:1rem">${cust.name}</div>
          <div class="text-sm">${cust.code} · ${cust.type}</div>
          <div class="text-sm">${cust.loc}</div>
          <div class="text-sm">${cust.contact}</div>
          <div class="text-sm" style="color:var(--primary)">${cust.phone} · ${cust.email}</div>
          <div class="text-sm mt-8">
            <span class="text-light">Terms:</span> <strong>${cust.terms}</strong> &nbsp;
            <span class="text-light">Price Level:</span> <strong>${cust.priceLevel}</strong>
          </div>
          <div class="text-sm">
            <span class="text-light">Credit Tier:</span> <strong>${cust.creditTier}</strong>
            ${!isPrepay ? ` &nbsp; <span class="text-light">Avail:</span> <strong>${fmt$(cust.creditLimit - cust.balance)}</strong>` : ''}
          </div>
        </div>
        <div>
          <div class="text-xs text-light mb-6" style="font-weight:700;text-transform:uppercase;letter-spacing:.5px">Order Details</div>
          <div class="mb-8" style="display:flex;gap:8px;align-items:center">
            <span class="text-light text-sm" style="min-width:120px">Order Date:</span>
            <input type="date" value="${today}" style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:0.85rem">
          </div>
          <div class="mb-8" style="display:flex;gap:8px;align-items:center">
            <span class="text-light text-sm" style="min-width:120px">Delivery Date:</span>
            <input type="date" value="${new Date(Date.now()+86400000).toISOString().slice(0,10)}" style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:0.85rem">
          </div>
          <div class="mb-8" style="display:flex;gap:8px;align-items:center">
            <span class="text-light text-sm" style="min-width:120px">Route:</span>
            <select style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:0.85rem">
              <option>${cust.route || 'Unassigned'}</option>
              <option>Route A-1</option><option>Route B-2</option><option>Route C-3</option>
            </select>
          </div>
          <div style="display:flex;gap:8px;align-items:start">
            <span class="text-light text-sm" style="min-width:120px">Notes:</span>
            <textarea rows="2" placeholder="Delivery instructions, special requests…"
              style="flex:1;padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:0.85rem;resize:vertical"></textarea>
          </div>
        </div>
      </div>

      <!-- Items table -->
      <div class="table-container mb-16">
        <table>
          <thead style="background:var(--bg-secondary)">
            <tr>
              <th>Code</th><th>Product</th><th>Container</th>
              <th style="text-align:right">List Price</th>
              <th style="text-align:center;width:55px">Disc%</th>
              <th style="text-align:right">Net Price</th>
              <th style="text-align:center;width:70px">Qty (CS)</th>
              <th style="text-align:right">CRV</th>
              <th style="text-align:right">Line Total</th>
              <th style="width:30px"></th>
            </tr>
          </thead>
          <tbody>
          ${cart.map(item => {
            const p = productById(item.productId);
            if (!p) return '';
            const disc     = orderDiscounts[item.productId] || 0;
            const isOvr    = orderPriceOverrides[item.productId] !== undefined;
            const effPx    = getItemPrice(item.productId);
            const lineCrv  = getCRV(p) * item.qty;
            const lineTotal= effPx * item.qty + lineCrv;
            const overStock= item.qty > p.stock;
            const discColor= disc > ORDER_CAPS.maxDiscountPct ? 'var(--red)' : disc > ORDER_CAPS.warnDiscountPct ? 'var(--orange)' : 'var(--text)';
            return `<tr>
              <td class="text-xs text-light">${p.code}</td>
              <td><strong>${p.name}</strong> <span class="text-xs text-light">${p.flavor}</span></td>
              <td class="text-sm">${p.size}${p.material==='Glass'?' 🫙':''}<br><span class="text-xs text-light">${p.packSize}</span></td>
              <td style="text-align:right">${fmt$(p.price)}</td>
              <td style="text-align:center">
                <input type="number" min="0" max="${ORDER_CAPS.maxDiscountPct}" step="0.5"
                  value="${disc||''}" placeholder="0"
                  style="width:46px;text-align:center;padding:3px;border:1px solid ${discColor !== 'var(--text)' ? discColor : 'var(--border)'};border-radius:4px;font-size:0.8rem;color:${discColor}"
                  onchange="window.ERP._setItemDiscount(${p.id},parseFloat(this.value)||0)">
                <div class="text-xs" style="color:${discColor}">${disc>0?'-'+disc+'%':''}</div>
              </td>
              <td style="text-align:right">
                <input type="number" min="0" step="0.01"
                  value="${isOvr ? orderPriceOverrides[item.productId].toFixed(2) : effPx.toFixed(2)}"
                  style="width:72px;text-align:right;padding:3px 4px;border:1px solid var(--border);border-radius:4px;font-size:0.85rem;${disc>0||isOvr?'color:var(--primary);font-weight:600':''}"
                  onchange="window.ERP._setItemPrice(${p.id},this.value)">
              </td>
              <td style="text-align:center">
                <input type="number" min="0" value="${item.qty}"
                  style="width:52px;text-align:center;padding:3px;border:1px solid var(--border);border-radius:4px;font-size:0.85rem"
                  onchange="window.ERP._updateReviewQty(${item.productId}, parseInt(this.value)||0)">
                ${overStock ? `<div class="text-xs" style="color:var(--orange)">⚠️ ${p.stock}</div>` : ''}
              </td>
              <td style="text-align:right" class="text-xs text-light">${fmt$(lineCrv)}</td>
              <td style="text-align:right;font-weight:600">${fmt$(lineTotal)}</td>
              <td>
                <button class="btn-ghost" style="padding:2px 5px;font-size:0.7rem;color:var(--red)" onclick="window.ERP._removeFromCart(${p.id})">✕</button>
              </td>
            </tr>`;
          }).join('')}
          </tbody>
          <tfoot>
            <tr><td colspan="7"></td><td style="text-align:right" class="text-light">Subtotal</td><td style="text-align:right">${fmt$(subtotal)}</td><td></td></tr>
            ${hasDiscounts ? `<tr><td colspan="7"></td><td style="text-align:right;color:var(--primary)" class="text-sm">Discounts Applied</td><td style="text-align:right;color:var(--primary)">✓</td><td></td></tr>` : ''}
            <tr><td colspan="7"></td><td style="text-align:right" class="text-light">CRV</td><td style="text-align:right">${fmt$(crv)}</td><td></td></tr>
            <tr style="border-top:2px solid var(--border)"><td colspan="7"></td><td style="text-align:right;font-weight:700;font-size:1rem">Order Total</td><td style="text-align:right;font-weight:800;font-size:1.1rem;color:var(--primary)">${fmt$(total)}</td><td></td></tr>
          </tfoot>
        </table>
      </div>

      <!-- Signature / Acknowledgement -->
      <div class="grid-2" style="gap:24px;border-top:1px solid var(--border);padding-top:16px">
        <div>
          <div class="text-xs text-light mb-6">Salesperson Signature</div>
          <div style="border-bottom:1px solid var(--border);height:36px;margin-bottom:4px"></div>
          <div class="text-xs text-light">Marcus Johnson · ${today}</div>
        </div>
        <div>
          <div class="text-xs text-light mb-6">Customer Acknowledgement (optional)</div>
          <div style="border-bottom:1px solid var(--border);height:36px;margin-bottom:4px"></div>
          <div class="text-xs text-light">${cust.contact} · ${cust.name}</div>
        </div>
      </div>
    </div><!-- /printable-order -->

    <!-- Warnings -->
    ${overCredit ? `
    <div class="warn-box mt-16" style="border-color:var(--orange);background:#fff7ed">
      ⚠️ <strong>Over Credit Limit</strong> — Post-order balance ${fmt$(postBalance)} exceeds ${fmt$(cust.creditLimit)}.
      Order requires manager approval.
    </div>` : ''}

    ${isPrepay && !prepayCompleted ? `
    <div class="warn-box mt-16" style="border-color:#fca5a5;background:#fef2f2">
      🔴 <strong>Prepay Required</strong> — Payment of <strong>${fmt$(total)}</strong> must be collected before confirming.
    </div>` : ''}

    ${isPrepay && prepayCompleted ? `
    <div class="info-box mt-16" style="border-color:var(--green);background:#f0fdf4">
      ✅ <strong>Prepayment Collected</strong> — ${fmt$(total)} recorded (Pending verification).
    </div>` : ''}

    <div class="flex-between mt-16">
      <button class="btn-outline" onclick="window.ERP._setOrderStep(2)">← Back to Products</button>
      ${isPrepay && !prepayCompleted
        ? `<button class="btn-success" onclick="window.ERP._prepayOrder()">💵 Collect Payment & Submit →</button>`
        : `<button class="btn-primary" onclick="window.ERP._setOrderStep(4)">Submit Order →</button>`}
    </div>
  </div>`;
}

// ── Step 4: Confirmation ──
function orderStep4() {
  if (!selectedCustomer) { orderStep = 1; return orderStep1(); }
  const cust = selectedCustomer;
  const total = calcCartTotal();
  const newId = 'ORD-' + (2610 + Math.floor(Math.random() * 100) + 1);
  const isPrepay = cust.creditLimit === 0;
  const isCreditCust = !isPrepay;

  return `
  <div class="card" style="text-align:center;padding:40px">
    <div style="font-size:64px;margin-bottom:16px">✅</div>
    <h2>Order Submitted!</h2>
    <p class="text-light">Order <strong>${newId}</strong> has been placed for <strong>${cust.name}</strong></p>
    <div style="font-size:1.5rem;font-weight:700;margin:16px 0">${fmt$(total)}</div>
    <div class="text-sm text-light mb-16">${cart.length} items · Status: <span style="color:#eab308">Pending</span></div>
    ${isPrepay ? '<div class="text-sm" style="color:var(--green);margin-bottom:16px">💵 Prepayment collected (Pending verification)</div>' : ''}

    <!-- Payment option for credit customers -->
    ${isCreditCust ? `
    <div style="background:var(--bg-secondary);border:1px solid var(--border);border-radius:10px;padding:16px;margin:0 auto 20px;max-width:380px;text-align:left">
      <div style="font-weight:700;margin-bottom:8px">💵 Collect Payment Now? <span class="text-xs text-light">(Optional)</span></div>
      <div class="text-sm text-light mb-12">Customer has ${fmt$(cust.balance)} outstanding · Terms: ${cust.terms}</div>
      <div style="display:flex;gap:8px">
        <button class="btn-success" style="flex:1" onclick="window.ERP._showPaymentModal(${cust.id},null)">💵 Take Payment</button>
        <button class="btn-outline" style="flex:1" onclick="window.ERP.toast('Invoice will be created on delivery','info')">🧾 Invoice on Delivery</button>
      </div>
    </div>` : ''}

    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <button class="btn-primary" onclick="window.ERP._resetOrder();window.ERP.nav('#/sales/new-order')">📦 New Order</button>
      <button class="btn-outline" onclick="window.ERP._resetOrder();window.ERP.nav('#/sales/orders')">📋 View Orders</button>
      <button class="btn-outline" onclick="window.ERP._resetOrder();window.ERP.nav('#/sales/main')">🏠 Dashboard</button>
    </div>
  </div>`;
}

// ══════════════════════════════════════════
//  CART FUNCTIONS
// ══════════════════════════════════════════

// Returns effective case price for a product respecting overrides/discounts
function getItemPrice(productId) {
  const p = productById(productId);
  if (!p) return 0;
  if (orderPriceOverrides[productId] !== undefined) return orderPriceOverrides[productId];
  const disc = orderDiscounts[productId];
  if (disc !== undefined && disc > 0) return p.price * (1 - disc / 100);
  return p.price;
}

function calcCartSubtotal() {
  return cart.reduce((s, item) => {
    return s + getItemPrice(item.productId) * item.qty;
  }, 0);
}

function calcCartCRV() {
  return cart.reduce((s, item) => {
    const p = productById(item.productId);
    return s + (p ? getCRV(p) * item.qty : 0);
  }, 0);
}

function calcCartTotal() {
  return calcCartSubtotal() + calcCartCRV();
}

// ══════════════════════════════════════════
//  PAYMENT MODAL  (single · batch · credit)
// ══════════════════════════════════════════
function showPaymentModal(custId, invoiceId, isPrepay = false) {
  const cust = customerById(custId);
  if (!cust) return;

  const allInvoices = invoicesByCustomer(custId).filter(i => i.status !== 'Paid');
  const targetInv   = invoiceId ? allInvoices.find(i => i.id === invoiceId) : null;
  const allDue      = allInvoices.reduce((s, i) => s + (i.total - i.paid), 0);
  const credit      = ACCOUNT_CREDITS[custId] || cust.accountCredit || 0;
  const cartAmt     = isPrepay ? calcCartTotal() : 0;
  const defaultAmt  = isPrepay ? cartAmt : (targetInv ? (targetInv.total - targetInv.paid) : allDue);

  selectedPaymentMethod = '';

  const title = isPrepay ? `\ud83d\udcb5 Prepayment \u2014 ${cust.name}` : `\ud83d\udcb5 Record Payment \u2014 ${cust.name}`;

  const body = `
    <!-- Mode tabs -->
    <div style="display:flex;gap:0;margin-bottom:16px;border:1px solid var(--border);border-radius:8px;overflow:hidden">
      ${isPrepay ? '' : `
      <button id="ptab-single" style="flex:1;padding:8px;border:none;background:var(--primary);color:#fff;font-size:0.82rem;font-weight:600;cursor:pointer" onclick="window.ERP._switchPayTab('single')">Single</button>
      <button id="ptab-batch" style="flex:1;padding:8px;border:none;background:var(--bg-secondary);color:var(--text-light);font-size:0.82rem;font-weight:600;cursor:pointer" onclick="window.ERP._switchPayTab('batch')">Batch All</button>
      ${credit > 0 ? `<button id="ptab-credit" style="flex:1;padding:8px;border:none;background:var(--bg-secondary);color:var(--text-light);font-size:0.82rem;font-weight:600;cursor:pointer" onclick="window.ERP._switchPayTab('credit')">Acct Credit</button>` : ''}
      `}
    </div>

    <!-- SINGLE / PREPAY panel -->
    <div id="ppanel-single">
      <div class="mb-12">
        <label style="display:block;font-weight:600;margin-bottom:6px;font-size:0.85rem">Apply To</label>
        <select id="pay-apply-to" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:0.9rem">
          ${isPrepay ? '<option value="prepay">Order Prepayment</option>' : ''}
          ${targetInv ? `<option value="${targetInv.id}" selected>${targetInv.id} — ${fmt$(targetInv.total - targetInv.paid)} due (${targetInv.due})</option>` : ''}
          ${!targetInv && !isPrepay ? allInvoices.map(i =>
            `<option value="${i.id}">${i.id} — ${fmt$(i.total - i.paid)} due (${i.due})</option>`
          ).join('') : ''}
          ${!isPrepay ? `<option value="account">Apply to Account Balance</option>` : ''}
        </select>
      </div>
      <div style="text-align:center;margin-bottom:12px">
        <div class="text-xs text-light">AMOUNT</div>
        <div style="font-size:26px;font-weight:700;color:var(--primary)">${fmt$(defaultAmt)}</div>
      </div>
      <div class="mb-12">
        <label style="display:block;font-weight:600;margin-bottom:6px;font-size:0.85rem">Amount</label>
        <input type="number" id="pay-amount" value="${defaultAmt.toFixed(2)}" step="0.01" min="0"
          style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:1rem">
      </div>
      ${renderPayMethodGrid(cust)}
      <div class="mt-12">
        <label style="display:block;font-weight:600;margin-bottom:6px;font-size:0.85rem">Reference / Notes</label>
        <input type="text" id="pay-ref" placeholder="Check #, auth code, etc."
          style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px">
      </div>
    </div>

    <!-- BATCH panel -->
    <div id="ppanel-batch" style="display:none">
      <div style="font-weight:600;margin-bottom:8px">Select Invoices to Process</div>
      <div style="max-height:160px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;padding:8px;margin-bottom:12px">
        ${allInvoices.length === 0 ? '<div class="text-light text-sm">No open invoices.</div>' : allInvoices.map(i => {
          const bal = i.total - i.paid;
          return `<label style="display:flex;align-items:center;gap:8px;padding:6px;cursor:pointer;border-bottom:1px solid var(--border)">
            <input type="checkbox" class="batch-inv-chk" value="${i.id}" data-amount="${bal.toFixed(2)}"
              onchange="window.ERP._updateBatchTotal()" checked style="cursor:pointer">
            <span style="flex:1;font-size:0.85rem"><strong>${i.id}</strong> — Due ${i.due}</span>
            <span style="font-weight:600;color:var(--red)">${fmt$(bal)}</span>
          </label>`;
        }).join('')}
      </div>
      <div class="flex-between mb-12" style="font-weight:700;font-size:1rem">
        <span>Batch Total:</span>
        <span id="batch-total-display" style="color:var(--primary)">${fmt$(allDue)}</span>
      </div>
      ${renderPayMethodGrid(cust)}
      <div class="mt-12">
        <label style="display:block;font-weight:600;margin-bottom:6px;font-size:0.85rem">Reference</label>
        <input type="text" id="pay-ref-batch" placeholder="Batch ref / notes"
          style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px">
      </div>
    </div>

    <!-- ACCOUNT CREDIT panel -->
    ${credit > 0 ? `
    <div id="ppanel-credit" style="display:none">
      <div style="background:#eff6ff;border:1px solid var(--primary);border-radius:8px;padding:14px;margin-bottom:12px">
        <div style="font-weight:700;color:var(--primary);margin-bottom:4px">Account Credit Balance: ${fmt$(credit)}</div>
        <div class="text-sm text-light">Apply this credit toward open invoices or an order.</div>
      </div>
      <div class="mb-12">
        <label style="display:block;font-weight:600;margin-bottom:6px;font-size:0.85rem">Apply to Invoice</label>
        <select id="credit-apply-to" style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px">
          ${allInvoices.map(i => `<option value="${i.id}">${i.id} — ${fmt$(i.total-i.paid)} due</option>`).join('')}
          <option value="order">Current Order (if any)</option>
        </select>
      </div>
      <div class="mb-12">
        <label style="display:block;font-weight:600;margin-bottom:6px;font-size:0.85rem">Credit Amount to Apply</label>
        <input type="number" id="credit-amount" value="${Math.min(credit, allDue).toFixed(2)}" max="${credit}" step="0.01" min="0"
          style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:1rem">
        <div class="text-xs text-light mt-4">Max available: ${fmt$(credit)}</div>
      </div>
    </div>` : ''}
  `;

  const actions = isPrepay
    ? `<button class="btn-success" onclick="window.ERP._processPayment(${custId},true)">Process Prepayment</button>`
    : `<button class="btn-success" id="process-pay-btn" onclick="window.ERP._processPayment(${custId},false)">Process Payment</button>`;

  window.ERP.showModal(title, body, actions);
}

function renderPayMethodGrid(cust) {
  return `
    <div class="mb-12">
      <label style="display:block;font-weight:600;margin-bottom:8px;font-size:0.85rem">Payment Method</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        ${[
          { key:'card',  icon:'\ud83d\udcb3', label:'Card on File',   desc: cust.hasPaymentOnFile ? 'Visa \u2022\u2022\u2022\u2022 4242' : 'No card on file' },
          { key:'ach',   icon:'\ud83c\udfe6', label:'ACH / Bank',     desc:'Direct bank transfer' },
          { key:'check', icon:'\ud83d\udcdd', label:'Check',          desc:'Physical check deposit' },
          { key:'cash',  icon:'\ud83d\udcb5', label:'Cash',           desc:'Cash payment' },
        ].map(m => `
          <div class="card" style="padding:12px;cursor:pointer;border:2px solid var(--border);transition:border-color .15s" id="pay-method-${m.key}"
            onclick="window.ERP._selectPayMethod('${m.key}')">
            <div style="font-size:1.2rem">${m.icon}</div>
            <div style="font-weight:600;font-size:0.85rem">${m.label}</div>
            <div class="text-xs text-light">${m.desc}</div>
          </div>
        `).join('')}
      </div>
      <div class="card mt-8" style="padding:12px;cursor:pointer;border:2px solid var(--border);transition:border-color .15s" id="pay-method-link"
        onclick="window.ERP._selectPayMethod('link')">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="font-size:1.4rem">\ud83d\udd17</div>
          <div>
            <div style="font-weight:600;font-size:0.85rem">Send Payment Link</div>
            <div class="text-xs text-light">Email ${cust.email || 'customer'} a secure payment link</div>
          </div>
        </div>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
//  FAVORITES
// ══════════════════════════════════════════
function favoritesPage() {
  if (window.ERP._isMobile) return mobileFavorites();
  const favIds = [1, 4, 5, 6, 8, 12, 15, 17];
  const favs = favIds.map(id => productById(id)).filter(Boolean);

  return `
  <div class="fade-in">
    <h1 style="margin:0 0 16px">⭐ Favorites</h1>
    <p class="text-light mb-16">Quick-access products for repeat orders.</p>
    <div class="grid-4" style="gap:12px">
      ${favs.map(p => {
        const cat = categoryById(p.category);
        return `<div class="card" style="padding:16px;text-align:center">
          <div style="font-size:2rem;margin-bottom:8px">${cat ? cat.icon : '📦'}</div>
          <div style="font-weight:700">${p.name}</div>
          <div class="text-xs text-light">${p.flavor} · ${p.size}${p.material === 'Glass' ? ' 🫙' : ''}</div>
          <div class="text-sm mt-8">${fmt$(p.unitPrice)}/ea · ${fmt$(p.price)}/case</div>
          <div class="text-xs text-light">${p.stock} in stock</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ══════════════════════════════════════════
//  SALES REPORTS
// ══════════════════════════════════════════
function salesReportsPage() {
  if (window.ERP._isMobile) return mobileReports();
  const totalRev = ORDERS.reduce((s, o) => s + o.total, 0);
  const deliveredRev = ORDERS.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0);
  const avgOrder = totalRev / ORDERS.length;

  // Top products
  const prodQty = {};
  ORDERS.forEach(o => o.items.forEach(i => { prodQty[i.productId] = (prodQty[i.productId] || 0) + i.qty; }));
  const topProducts = Object.entries(prodQty).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, qty]) => {
    const p = productById(parseInt(id));
    return { product: p, qty };
  }).filter(x => x.product);

  // Top customers
  const custRev = {};
  ORDERS.forEach(o => { custRev[o.customer] = (custRev[o.customer] || 0) + o.total; });
  const topCustomers = Object.entries(custRev).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, rev]) => {
    const c = customerById(parseInt(id));
    return { customer: c, rev };
  }).filter(x => x.customer);

  // Custom report demo data
  const reportFields = [
    { id:'customer', label:'Customer Name', group:'Customer' },
    { id:'cust_type', label:'Customer Type', group:'Customer' },
    { id:'cust_route', label:'Route', group:'Customer' },
    { id:'cust_tier', label:'Credit Tier', group:'Customer' },
    { id:'order_id', label:'Order #', group:'Order' },
    { id:'order_date', label:'Order Date', group:'Order' },
    { id:'delivery_date', label:'Delivery Date', group:'Order' },
    { id:'order_status', label:'Status', group:'Order' },
    { id:'order_total', label:'Order Total', group:'Order' },
    { id:'salesperson', label:'Salesperson', group:'Order' },
    { id:'product', label:'Product Name', group:'Product' },
    { id:'flavor', label:'Flavor', group:'Product' },
    { id:'category', label:'Category', group:'Product' },
    { id:'qty', label:'Qty (Cases)', group:'Product' },
    { id:'unit_price', label:'Unit Price', group:'Product' },
    { id:'line_total', label:'Line Total', group:'Product' },
    { id:'inv_id', label:'Invoice #', group:'Invoice' },
    { id:'inv_status', label:'Invoice Status', group:'Invoice' },
    { id:'inv_due', label:'Due Date', group:'Invoice' },
    { id:'inv_balance', label:'Balance Due', group:'Invoice' },
  ];
  const groups = [...new Set(reportFields.map(f => f.group))];

  // Demo selected columns
  const demoSelected = ['customer','order_date','order_status','order_total','salesperson'];
  // Demo preview rows (first 5 orders)
  const demoRows = ORDERS.slice(0,5).map(o => {
    const c = customerById(o.customer);
    return { customer: c?.name||'?', order_date: o.date, order_status: o.status, order_total: fmt$(o.total), salesperson: o.salesperson };
  });
  const colLabels = { customer:'Customer', order_date:'Order Date', order_status:'Status', order_total:'Total', salesperson:'Salesperson' };

  return `
  <div class="fade-in">
    <h1 style="margin:0 0 16px">📊 Sales Reports</h1>

    <div class="tabs" id="report-tabs">
      <div class="tab active" data-tab="standard" onclick="window.ERP._switchCustTab(this)">📈 Standard</div>
      <div class="tab" data-tab="custom" onclick="window.ERP._switchCustTab(this)">🔧 Custom Report Builder</div>
    </div>

    <div class="tab-content active" data-tab="standard">
      <div class="grid-3 mb-16 mt-16">
        <div class="card kpi-card">
          <div class="text-xs text-light">TOTAL REVENUE</div>
          <div class="kpi-value">${fmt$(totalRev)}</div>
        </div>
        <div class="card kpi-card">
          <div class="text-xs text-light">DELIVERED REVENUE</div>
          <div class="kpi-value" style="color:var(--green)">${fmt$(deliveredRev)}</div>
        </div>
        <div class="card kpi-card">
          <div class="text-xs text-light">AVG ORDER VALUE</div>
          <div class="kpi-value">${fmt$(avgOrder)}</div>
        </div>
      </div>
      <div class="grid-2">
        <div class="card">
          <h3 style="margin-top:0">🏆 Top Products (by cases ordered)</h3>
          ${topProducts.map((tp, i) => `
            <div class="flex-between mb-8" style="padding:6px 0;border-bottom:1px solid var(--border)">
              <div>
                <span class="text-sm text-light" style="margin-right:8px">${i + 1}.</span>
                <strong>${tp.product.name}</strong>
                <span class="text-xs text-light">${tp.product.flavor} · ${tp.product.size}</span>
              </div>
              <div style="font-weight:600">${tp.qty} CS</div>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <h3 style="margin-top:0">🏅 Top Customers (by revenue)</h3>
          ${topCustomers.map((tc, i) => `
            <div class="flex-between mb-8" style="padding:6px 0;border-bottom:1px solid var(--border)">
              <div>
                <span class="text-sm text-light" style="margin-right:8px">${i + 1}.</span>
                <a href="#" onclick="window.ERP.nav('#/sales/customer?id=${tc.customer.id}');return false"><strong>${tc.customer.name}</strong></a>
              </div>
              <div style="font-weight:600">${fmt$(tc.rev)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- ── Custom Report Builder ── -->
    <div class="tab-content" data-tab="custom">
      <div class="card mt-16 mb-12" style="padding:12px 16px;background:#eff6ff;border:1px solid var(--primary)">
        <div class="text-sm">🔧 <strong>Custom Report Builder</strong> — drag fields from the left panel into your report columns. Add filters, choose grouping, and preview live results. <span class="text-light">(Demo — drag interactions are illustrative)</span></div>
      </div>

      <div style="display:grid;grid-template-columns:240px 1fr;gap:16px;align-items:start">

        <!-- Field Palette -->
        <div class="card" style="padding:12px">
          <div style="font-weight:700;font-size:0.85rem;margin-bottom:10px;color:var(--text-light);text-transform:uppercase">Available Fields</div>
          ${groups.map(g => `
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-light);text-transform:uppercase;margin:8px 0 4px">${g}</div>
            ${reportFields.filter(f => f.group === g).map(f => `
              <div draggable="true"
                style="padding:6px 10px;margin-bottom:4px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:6px;font-size:0.82rem;cursor:grab;display:flex;justify-content:space-between;align-items:center;user-select:none"
                ondragstart="this.style.opacity='0.4'" ondragend="this.style.opacity='1'"
                onclick="window.ERP._reportAddField('${f.id}','${f.label}')">
                <span>${f.label}</span>
                <span style="color:var(--text-light);font-size:0.7rem">drag →</span>
              </div>`).join('')}
          `).join('')}
        </div>

        <!-- Builder Canvas -->
        <div>
          <!-- Column chips -->
          <div class="card mb-12" style="min-height:60px">
            <div style="font-weight:700;font-size:0.8rem;margin-bottom:10px;color:var(--text-light);text-transform:uppercase">📋 Report Columns (drop here)</div>
            <div id="report-cols" style="display:flex;flex-wrap:wrap;gap:6px;min-height:36px;padding:6px;border:2px dashed var(--border);border-radius:8px"
              ondragover="event.preventDefault()" ondrop="window.ERP._reportDropField(event)">
              ${demoSelected.map(id => {
                const f = reportFields.find(x => x.id === id);
                return `<span id="rchip-${id}" style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:var(--primary);color:#fff;border-radius:20px;font-size:0.8rem;font-weight:600">
                  ${f ? f.label : id}
                  <span style="cursor:pointer;opacity:0.8;font-size:0.7rem" onclick="window.ERP._reportRemoveField('${id}')">✕</span>
                </span>`;
              }).join('')}
            </div>
          </div>

          <!-- Filters -->
          <div class="card mb-12">
            <div style="font-weight:700;font-size:0.8rem;margin-bottom:10px;color:var(--text-light);text-transform:uppercase">🔽 Filters</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
              <select style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-size:0.82rem;background:#fff">
                <option>Salesperson = Any</option>
                <option>Salesperson = Marcus</option>
                <option>Salesperson = Nicole</option>
              </select>
              <select style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-size:0.82rem;background:#fff">
                <option>Status = All</option>
                <option>Status = Pending</option>
                <option>Status = Delivered</option>
              </select>
              <select style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-size:0.82rem;background:#fff">
                <option>Date = Last 30 days</option>
                <option>Date = This week</option>
                <option>Date = Custom range…</option>
              </select>
              <select style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-size:0.82rem;background:#fff">
                <option>Group by: None</option>
                <option>Group by: Customer</option>
                <option>Group by: Route</option>
                <option>Group by: Salesperson</option>
              </select>
              <button class="btn-primary btn-sm" onclick="window.ERP.toast('Report generated with current filters','success')">▶ Run Report</button>
              <button class="btn-outline btn-sm" onclick="window.ERP.toast('Report exported to CSV','success')">⬇ Export CSV</button>
            </div>
          </div>

          <!-- Preview Table -->
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <div style="font-weight:700;font-size:0.8rem;color:var(--text-light);text-transform:uppercase">👁 Preview (${ORDERS.length} rows)</div>
              <span class="text-xs text-light">Showing first 5 rows</span>
            </div>
            <div class="table-container">
              <table>
                <thead><tr>${demoSelected.map(id => `<th>${colLabels[id]||id}</th>`).join('')}</tr></thead>
                <tbody>
                  ${demoRows.map(row => `<tr>${demoSelected.map(id => {
                    const v = row[id] || '—';
                    if (id === 'order_status') return `<td><span class="status-badge" style="background:${statusColor(v)}20;color:${statusColor(v)}">${v}</span></td>`;
                    if (id === 'order_total') return `<td style="font-weight:600">${v}</td>`;
                    return `<td class="text-sm">${v}</td>`;
                  }).join('')}</tr>`).join('')}
                </tbody>
                <tfoot>
                  <tr style="background:var(--bg-secondary)">
                    ${demoSelected.map((id,i) => i===0 ? `<td class="text-xs text-light"><strong>Totals</strong></td>` : id==='order_total' ? `<td style="font-weight:700">${fmt$(demoRows.reduce((s,r)=>s+parseFloat((r.order_total||'$0').replace(/[$,]/g,'')),0))}</td>` : `<td></td>`).join('')}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════
//  MOBILE PAGE RENDERS
// ══════════════════════════════════════════

function mobileDashboard() {
  const today = '2026-02-26';
  const todayOrders = ORDERS.filter(o => o.date === today);
  const todayRev = todayOrders.reduce((s, o) => s + o.total, 0);
  const openOrders = ORDERS.filter(o => !['Delivered','Cancelled'].includes(o.status));
  const pendingPay = INVOICES.filter(i => i.status !== 'Paid').reduce((s, i) => s + (i.total - i.paid), 0);
  const attention = CUSTOMERS.filter(c =>
    c.status === 'Hold' || c.status === 'Warning' ||
    c.creditLimit === 0 || (c.creditLimit > 0 && c.balance / c.creditLimit > 0.8)
  );

  return `<div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div><div style="font-weight:700;font-size:16px">Dashboard</div>
      <div style="font-size:11px;color:var(--text-light)">Welcome back, Marcus</div></div>
      <button style="background:var(--primary);color:#fff;border:none;border-radius:20px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer" onclick="window.ERP.nav('#/sales/new-order')">➕ New</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 10px;text-align:center">
        <div style="font-size:9px;color:var(--text-light);text-transform:uppercase;font-weight:600">Today's Orders</div>
        <div style="font-size:1.3rem;font-weight:800">${todayOrders.length}</div>
        <div style="font-size:9px;color:var(--text-light)">${todayOrders.filter(o=>o.status==='Delivered').length} delivered</div>
      </div>
      <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 10px;text-align:center">
        <div style="font-size:9px;color:var(--text-light);text-transform:uppercase;font-weight:600">Revenue</div>
        <div style="font-size:1.3rem;font-weight:800">${fmt$(todayRev)}</div>
      </div>
      <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 10px;text-align:center">
        <div style="font-size:9px;color:var(--text-light);text-transform:uppercase;font-weight:600">Open Orders</div>
        <div style="font-size:1.3rem;font-weight:800">${openOrders.length}</div>
      </div>
      <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px 10px;text-align:center">
        <div style="font-size:9px;color:var(--text-light);text-transform:uppercase;font-weight:600">Pending Pay</div>
        <div style="font-size:1.3rem;font-weight:800;color:var(--red)">${fmt$(pendingPay)}</div>
      </div>
    </div>

    <details style="margin-bottom:8px" open>
      <summary style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">📦 Order Pipeline (${todayOrders.length})<span style="margin-left:auto;font-size:11px;color:var(--text-light)">▸</span></summary>
      <div style="background:#fff;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:8px 12px">
        ${todayOrders.length === 0 ? '<div style="color:var(--text-light);font-size:12px;padding:8px 0">No orders today.</div>' : todayOrders.map(o => {
          const cust = customerById(o.customer);
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="window.ERP.nav('#/sales/order-detail?id=${o.id}')">
            <div><div style="font-weight:600;font-size:12px">${o.id}</div><div style="font-size:11px;color:var(--text-light)">${cust ? cust.name : 'Unknown'}</div></div>
            <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:${statusColor(o.status)}20;color:${statusColor(o.status)}">${o.status}</span>
          </div>`;
        }).join('')}
      </div>
    </details>

    <details style="margin-bottom:8px">
      <summary style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">⚠️ Attention (${attention.length})<span style="margin-left:auto;font-size:11px;color:var(--text-light)">▸</span></summary>
      <div style="background:#fff;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:8px 12px">
        ${attention.length === 0 ? '<div style="color:var(--text-light);font-size:12px;padding:8px 0">All clear!</div>' : attention.map(c => {
          const reason = c.status === 'Hold' ? '🔴 Hold' : c.creditLimit === 0 ? '🟡 Prepay' : c.status === 'Warning' ? '🟡 Warning' : '🟠 Near limit';
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="window.ERP.nav('#/sales/customer?id=${c.id}')">
            <div><div style="font-weight:600;font-size:12px">${c.name}</div><div style="font-size:10px;color:var(--text-light)">${reason}</div></div>
            <span style="font-size:11px;font-weight:600">${c.creditLimit > 0 ? fmt$(c.balance) + '/' + fmt$(c.creditLimit) : 'Prepay'}</span>
          </div>`;
        }).join('')}
      </div>
    </details>

    <details style="margin-bottom:8px">
      <summary style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">🕐 Recent Activity<span style="margin-left:auto;font-size:11px;color:var(--text-light)">▸</span></summary>
      <div style="background:#fff;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:8px 12px;font-size:11px">
        <div style="padding:6px 0;border-bottom:1px solid var(--border)">📦 <strong>ORD-2607</strong> — Waterfront Hotel — <span style="color:var(--orange)">Picking</span></div>
        <div style="padding:6px 0;border-bottom:1px solid var(--border)">💵 <strong>PMT-8801</strong> — Sunrise Bakery — ${fmt$(107.91)}</div>
        <div style="padding:6px 0;border-bottom:1px solid var(--border)">📦 <strong>ORD-2603</strong> — Ocean Prime — <span style="color:var(--orange)">Picking</span></div>
        <div style="padding:6px 0;border-bottom:1px solid var(--border)">✅ <strong>ORD-2601</strong> — Bella Cucina — Delivered</div>
        <div style="padding:6px 0">📋 <strong>ORD-2605</strong> — Cambridge Catering — <span style="color:#eab308">Pending</span></div>
      </div>
    </details>
  </div>`;
}

// ── Mobile Customers List ──
function mobileCustomersList() {
  return `<div>
    <div style="font-weight:700;font-size:16px;margin-bottom:10px">Customers</div>
    <input type="text" placeholder="🔍 Search customers…" id="cust-search"
      oninput="window.ERP._filterCustomersMobile(this.value)"
      style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:13px;margin-bottom:10px;background:#fff">
    <div id="cust-list-m">
      ${CUSTOMERS.map(c => mobileCustomerCard(c)).join('')}
    </div>
  </div>`;
}

function mobileCustomerCard(c) {
  const isPrepay = c.creditLimit === 0;
  const pct = c.creditLimit > 0 ? Math.round((c.balance / c.creditLimit) * 100) : 0;
  const pctColor = isPrepay ? 'var(--text-light)' : pct > 80 ? 'var(--red)' : pct > 60 ? 'var(--orange)' : 'var(--green)';
  return `<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;cursor:pointer" onclick="window.ERP.nav('#/sales/customer?id=${c.id}')">
    <div style="display:flex;justify-content:space-between;align-items:start">
      <div><div style="font-weight:700;font-size:13px">${c.name}</div><div style="font-size:10px;color:var(--text-light)">${c.code} · ${c.type}</div></div>
      <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:${statusColor(c.status === 'Active' ? 'Confirmed' : c.status)}20;color:${statusColor(c.status === 'Active' ? 'Confirmed' : c.status)}">${c.status}</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:11px">
      <span style="color:var(--text-light)">Tier ${c.creditTier}</span>
      ${isPrepay
        ? '<span style="color:#b45309">⚠️ Prepay</span>'
        : `<div style="display:flex;align-items:center;gap:6px">
            <div style="width:60px;height:4px;background:var(--border);border-radius:2px"><div style="height:100%;width:${Math.min(pct,100)}%;background:${pctColor};border-radius:2px"></div></div>
            <span>${fmt$(c.balance)}/${fmt$(c.creditLimit)}</span>
          </div>`}
    </div>
  </div>`;
}

// ── Mobile Customer Profile ──
function mobileCustomerProfile(page) {
  const id = parseInt(getParam(page, 'id'));
  const cust = customerById(id);
  if (!cust) return '<div style="padding:20px;text-align:center"><p>Not found.</p><div style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav(\'#/sales/customers\')">← Back</div></div>';

  const custOrders = ordersByCustomer(id);
  const custInvoices = invoicesByCustomer(id);
  const custPayments = paymentsByCustomer(id);
  const isPrepay = cust.creditLimit === 0;
  const usedPct = cust.creditLimit > 0 ? Math.round((cust.balance / cust.creditLimit) * 100) : 0;
  const pctColor = isPrepay ? 'var(--text-light)' : usedPct > 80 ? 'var(--red)' : usedPct > 60 ? 'var(--orange)' : 'var(--green)';

  return `<div>
    <div style="font-size:12px;color:var(--text-light);cursor:pointer;margin-bottom:10px" onclick="window.ERP.nav('#/sales/customers')">← Back to Customers</div>

    <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
        <div>
          <div style="font-weight:700;font-size:15px">${cust.name}</div>
          <div style="font-size:10px;color:var(--text-light)">${cust.code} · ${cust.type} · ${cust.contact}</div>
        </div>
        <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:${statusColor(cust.status === 'Active' ? 'Confirmed' : cust.status)}20;color:${statusColor(cust.status === 'Active' ? 'Confirmed' : cust.status)}">${cust.status}</span>
      </div>
      <div style="font-size:11px;margin-bottom:8px"><span style="color:var(--text-light)">Tier ${cust.creditTier} · ${cust.terms}</span></div>
      ${isPrepay
        ? '<div style="padding:6px 10px;background:#fef3c7;border-radius:6px;font-size:10px;color:#92400e">⚠️ Prepay — $0 credit line</div>'
        : `<div style="margin-bottom:4px;font-size:10px;color:var(--text-light);display:flex;justify-content:space-between"><span>Credit Used</span><span>${usedPct}% — ${fmt$(cust.balance)} / ${fmt$(cust.creditLimit)}</span></div>
          <div style="height:6px;background:var(--border);border-radius:3px"><div style="height:100%;width:${Math.min(usedPct,100)}%;background:${pctColor};border-radius:3px"></div></div>`}
      <div style="display:flex;gap:8px;margin-top:10px">
        <button style="flex:1;padding:8px;border:none;border-radius:8px;background:var(--primary);color:#fff;font-size:12px;font-weight:600;cursor:pointer" onclick="window.ERP.nav('#/sales/new-order');setTimeout(()=>window.ERP._selectOrderCustomer(${cust.id}),50)">📦 Order</button>
        <button style="flex:1;padding:8px;border:none;border-radius:8px;background:var(--green);color:#fff;font-size:12px;font-weight:600;cursor:pointer" onclick="window.ERP._showPaymentModal(${cust.id})">💵 Pay</button>
      </div>
    </div>

    <details style="margin-bottom:8px" open>
      <summary style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">📋 Orders (${custOrders.length})<span style="margin-left:auto;font-size:11px;color:var(--text-light)">▸</span></summary>
      <div style="background:#fff;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:8px 12px">
        ${custOrders.length === 0 ? '<div style="color:var(--text-light);font-size:12px;padding:6px 0">No orders.</div>' : custOrders.map(o => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="window.ERP.nav('#/sales/order-detail?id=${o.id}')">
            <div><div style="font-weight:600;font-size:12px">${o.id} <span style="color:var(--text-light);font-weight:400">${o.date}</span></div><div style="font-size:10px;color:var(--text-light)">${o.items.length} items · ${fmt$(o.total)}</div></div>
            <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:${statusColor(o.status)}20;color:${statusColor(o.status)}">${o.status}</span>
          </div>`).join('')}
      </div>
    </details>

    <details style="margin-bottom:8px">
      <summary style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">🧾 Invoices (${custInvoices.length})<span style="margin-left:auto;font-size:11px;color:var(--text-light)">▸</span></summary>
      <div style="background:#fff;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:8px 12px">
        ${custInvoices.length === 0 ? '<div style="color:var(--text-light);font-size:12px;padding:6px 0">No invoices.</div>' : custInvoices.map(i => {
          const bal = i.total - i.paid;
          return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
            <div><div style="font-weight:600;font-size:12px">${i.id}</div><div style="font-size:10px;color:var(--text-light)">Due ${i.due} · ${fmt$(i.total)}</div></div>
            <div style="text-align:right">
              <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:${statusColor(i.status)}20;color:${statusColor(i.status)}">${i.status}</span>
              ${bal > 0 ? `<div style="font-size:10px;color:var(--red);margin-top:2px">Bal: ${fmt$(bal)}</div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </details>

    <details style="margin-bottom:8px">
      <summary style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">💵 Payments (${custPayments.length})<span style="margin-left:auto;font-size:11px;color:var(--text-light)">▸</span></summary>
      <div style="background:#fff;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:8px 12px">
        ${custPayments.length === 0 ? '<div style="color:var(--text-light);font-size:12px;padding:6px 0">No payments.</div>' : custPayments.map(p => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
            <div><div style="font-weight:600;font-size:12px">${p.id}</div><div style="font-size:10px;color:var(--text-light)">${p.date} · ${p.method}</div></div>
            <div style="font-weight:600;font-size:12px;color:var(--green)">${fmt$(p.amount)}</div>
          </div>`).join('')}
      </div>
    </details>

    <details style="margin-bottom:8px">
      <summary style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">📍 Contact & Location<span style="margin-left:auto;font-size:11px;color:var(--text-light)">▸</span></summary>
      <div style="background:#fff;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:10px 12px;font-size:12px">
        <div style="padding:4px 0"><span style="color:var(--text-light)">Phone:</span> ${cust.phone}</div>
        <div style="padding:4px 0"><span style="color:var(--text-light)">Email:</span> ${cust.email}</div>
        <div style="padding:4px 0"><span style="color:var(--text-light)">Address:</span> ${cust.loc}</div>
        <div style="padding:4px 0"><span style="color:var(--text-light)">Route:</span> ${cust.route || 'None'}</div>
        <div style="padding:4px 0"><span style="color:var(--text-light)">Price Level:</span> ${cust.priceLevel}</div>
      </div>
    </details>
  </div>`;
}

// ── Mobile Order History ──
function mobileOrderHistory() {
  return `<div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div style="font-weight:700;font-size:16px">Orders</div>
      <button style="background:var(--primary);color:#fff;border:none;border-radius:20px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer" onclick="window.ERP.nav('#/sales/new-order')">➕ New</button>
    </div>
    <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;margin-bottom:10px;-webkit-overflow-scrolling:touch">
      ${['All','Pending','Confirmed','Picking','Delivered','Hold'].map(s =>
        `<button style="padding:6px 12px;border:1px solid var(--border);border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap;cursor:pointer;background:#fff;flex-shrink:0" onclick="window.ERP._filterOrdersMobile('${s}')">${s}</button>`
      ).join('')}
    </div>
    <div id="order-list-m">
      ${ORDERS.map(o => mobileOrderCard(o)).join('')}
    </div>
  </div>`;
}

function mobileOrderCard(o) {
  const cust = customerById(o.customer);
  return `<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;cursor:pointer" onclick="window.ERP.nav('#/sales/order-detail?id=${o.id}')">
    <div style="display:flex;justify-content:space-between;align-items:start">
      <div><div style="font-weight:700;font-size:13px">${o.id}</div><div style="font-size:11px;color:var(--text-light)">${cust ? cust.name : 'Unknown'}</div></div>
      <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;background:${statusColor(o.status)}20;color:${statusColor(o.status)}">${o.status}</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:11px;color:var(--text-light)">
      <span>${o.date} · ${o.items.length} items</span>
      <span style="font-weight:700;color:var(--text)">${fmt$(o.total)}</span>
    </div>
  </div>`;
}

// ── Mobile Order Detail ──
function mobileOrderDetail(page) {
  const orderId = getParam(page, 'id');
  const order = orderById(orderId);
  if (!order) return '<div style="padding:20px;text-align:center"><p>Order not found.</p><div style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav(\'#/sales/orders\')">← Back</div></div>';

  const cust = customerById(order.customer);
  const subtotal = order.items.reduce((s, i) => { const p = productById(i.productId); return s + (p ? p.price * i.qty : 0); }, 0);
  const crv = order.items.reduce((s, i) => { const p = productById(i.productId); return s + (p ? getCRV(p) * i.qty : 0); }, 0);
  const statuses = ['Pending','Confirmed','Picking','Out for Delivery','Delivered'];
  const currentIdx = statuses.indexOf(order.status);

  return `<div>
    <div style="font-size:12px;color:var(--text-light);cursor:pointer;margin-bottom:10px" onclick="window.ERP.nav('#/sales/orders')">← Back to Orders</div>

    <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div><div style="font-weight:700;font-size:16px">${order.id}</div><div style="font-size:11px;color:var(--text-light)">${cust ? cust.name : 'Unknown'} · ${order.date}</div></div>
        <span style="display:inline-block;padding:4px 10px;border-radius:10px;font-size:11px;font-weight:600;background:${statusColor(order.status)}20;color:${statusColor(order.status)}">${order.status}</span>
      </div>
    </div>

    ${(() => {
      const inv = invoiceByOrder(order.id);
      if (!inv) return '<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:11px;color:var(--text-light)">🧾 No Invoice Yet — created at delivery</div>';
      const bal = inv.total - inv.paid;
      const isPaid = inv.status === 'Paid';
      return `<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <div style="font-weight:700;font-size:13px">🧾 ${inv.id}</div>
          ${isPaid
            ? '<span style="padding:3px 10px;border-radius:8px;font-size:10px;font-weight:700;background:#dcfce7;color:#16a34a">✅ PAID</span>'
            : `<span style="padding:3px 10px;border-radius:8px;font-size:10px;font-weight:700;background:#fef9c3;color:#b45309">${inv.status}</span>`}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-light)"><span>Total</span><span style="color:var(--text)">${fmt$(inv.total)}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-light)"><span>Paid</span><span style="color:var(--green)">${fmt$(inv.paid)}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:2px"><span style="font-weight:600">Balance</span><span style="font-weight:700;color:${bal > 0 ? 'var(--red)' : 'var(--green)'}">${fmt$(bal)}</span></div>
        ${bal > 0 ? `<button style="width:100%;margin-top:8px;padding:8px;border:none;border-radius:8px;background:var(--green);color:#fff;font-weight:600;font-size:12px;cursor:pointer" onclick="window.ERP._showPaymentModal(${cust ? cust.id : 'null'},'${inv.id}')">💵 Take Payment</button>` : ''}
      </div>`;
    })()}

    ${order.status !== 'Hold' ? `
    <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;position:relative">
        <div style="position:absolute;top:11px;left:16px;right:16px;height:2px;background:var(--border)"></div>
        <div style="position:absolute;top:11px;left:16px;height:2px;background:var(--primary);width:${currentIdx >= 0 ? (currentIdx / (statuses.length - 1)) * 100 : 0}%;max-width:calc(100% - 32px)"></div>
        ${statuses.map((s, i) => `<div style="text-align:center;position:relative;z-index:1">
          <div style="width:24px;height:24px;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;${i <= currentIdx ? 'background:var(--primary);color:#fff' : 'background:#fff;border:2px solid var(--border);color:var(--text-light)'}">${i < currentIdx ? '✓' : i + 1}</div>
          <div style="font-size:7px;margin-top:3px;${i <= currentIdx ? 'color:var(--primary);font-weight:600' : 'color:var(--text-light)'}">${s === 'Out for Delivery' ? 'Out' : s}</div>
        </div>`).join('')}
      </div>
    </div>` : ''}

    <details style="margin-bottom:8px" open>
      <summary style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">📦 Items (${order.items.length})<span style="margin-left:auto;font-size:11px;color:var(--text-light)">▸</span></summary>
      <div style="background:#fff;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:8px 12px">
        ${order.items.map(item => {
          const p = productById(item.productId);
          if (!p) return '';
          const lineCrv = getCRV(p) * item.qty;
          const lineTotal = p.price * item.qty + lineCrv;
          return `<div style="padding:8px 0;border-bottom:1px solid var(--border)">
            <div style="display:flex;justify-content:space-between"><div style="font-weight:600;font-size:12px">${p.name} <span style="font-weight:400;color:var(--text-light)">${p.flavor}</span></div><span style="font-weight:700;font-size:12px">${fmt$(lineTotal)}</span></div>
            <div style="font-size:10px;color:var(--text-light)">${p.size}${p.material === 'Glass' ? ' 🫙' : ''} · ${item.qty} × ${fmt$(p.price)} + CRV ${fmt$(lineCrv)}</div>
          </div>`;
        }).join('')}
        <div style="border-top:2px solid var(--border);padding-top:8px;margin-top:4px">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-light)"><span>Subtotal</span><span>${fmt$(subtotal)}</span></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-light)"><span>CRV</span><span>${fmt$(crv)}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:14px;margin-top:4px"><span>Total</span><span>${fmt$(subtotal + crv)}</span></div>
        </div>
      </div>
    </details>

    <details style="margin-bottom:8px">
      <summary style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">🚚 Delivery Details<span style="margin-left:auto;font-size:11px;color:var(--text-light)">▸</span></summary>
      <div style="background:#fff;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:10px 12px;font-size:12px">
        <div style="padding:4px 0"><span style="color:var(--text-light)">Delivery Date:</span> ${order.deliveryDate}</div>
        <div style="padding:4px 0"><span style="color:var(--text-light)">Route:</span> ${order.route || '—'}</div>
        <div style="padding:4px 0"><span style="color:var(--text-light)">Salesperson:</span> ${order.salesperson}</div>
        ${cust ? `<div style="padding:4px 0"><span style="color:var(--text-light)">Customer:</span> <span style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/sales/customer?id=${cust.id}')">${cust.name}</span></div>` : ''}
      </div>
    </details>

    <div style="display:flex;gap:8px;margin-top:4px">
      <button style="flex:1;padding:10px;border:1.5px solid var(--primary);border-radius:10px;background:transparent;color:var(--primary);font-weight:600;font-size:13px;cursor:pointer" onclick="window.ERP._duplicateOrder('${order.id}')">🔄 Duplicate</button>
      <button style="flex:1;padding:10px;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text);font-weight:600;font-size:13px;cursor:pointer" onclick="window.ERP._printSavedOrder('${order.id}')">🖨️ Print</button>
      <button style="flex:1;padding:10px;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text);font-weight:600;font-size:13px;cursor:pointer" onclick="window.ERP._sendSavedOrder('${order.id}')">📧 Send</button>
    </div>
  </div>`;
}

// ── Mobile New Order ──
function mobileNewOrder() {
  const steps = ['Customer', 'Products', 'Review', 'Done'];
  const stepBar = `<div style="display:flex;gap:3px;margin-bottom:14px">
    ${steps.map((s, i) => {
      const n = i + 1;
      const active = n === orderStep;
      const done = n < orderStep;
      return `<div style="flex:1;text-align:center;padding:8px 2px;border-radius:6px;font-size:10px;font-weight:600;
        background:${active ? 'var(--primary)' : done ? 'var(--green)' : 'var(--bg)'};
        color:${active || done ? '#fff' : 'var(--text-light)'}">
        ${done ? '✓' : n}. ${s}</div>`;
    }).join('')}
  </div>`;

  return `<div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <div style="font-weight:700;font-size:16px">New Order</div>
      ${orderStep > 1 ? '<span style="font-size:12px;color:var(--red);cursor:pointer" onclick="window.ERP._resetOrder()">✕ Cancel</span>' : ''}
    </div>
    ${stepBar}
    ${selectedCustomer && orderStep >= 2 ? `
      <div style="background:var(--primary-light);border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:12px;display:flex;justify-content:space-between;align-items:center">
        <span>📍 <strong>${selectedCustomer.name}</strong></span>
        <span style="color:var(--text-light);font-size:10px">${selectedCustomer.creditLimit > 0 ? fmt$(selectedCustomer.creditLimit - selectedCustomer.balance) + ' avail.' : '⚠️ Prepay'}</span>
      </div>` : ''}
    ${orderStep === 1 ? mobileOrderStep1()
      : orderStep === 2 ? mobileOrderStep2()
      : orderStep === 3 ? mobileOrderStep3()
      : mobileOrderStep4()}
  </div>`;
}

function mobileOrderStep1() {
  return `
  <input type="text" placeholder="🔍 Search customers…" id="order-cust-search"
    oninput="window.ERP._filterOrderCustomersMobile(this.value)"
    style="width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:13px;margin-bottom:10px;background:#fff">
  <div id="order-cust-list-m">
    ${CUSTOMERS.map(c => {
      const disabled = c.status === 'Hold';
      const isPrepay = c.creditLimit === 0;
      return `<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;${disabled ? 'opacity:.5;' : 'cursor:pointer;'}" ${disabled ? '' : `onclick="window.ERP._selectOrderCustomer(${c.id})"`}>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:600;font-size:13px">${c.name} <span style="font-size:10px;color:var(--text-light)">${c.code}</span></div>
            ${disabled ? '<div style="font-size:10px;color:var(--red)">🔴 On Hold</div>' : ''}
            ${isPrepay ? '<div style="font-size:10px;color:#b45309">⚠️ Prepay</div>' : ''}
          </div>
          <span style="font-size:11px;color:var(--text-light)">${c.creditLimit > 0 ? 'Tier ' + c.creditTier : 'Prepay'}</span>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function mobileOrderStep2() {
  // Search mode: flat card grid across all products
  const searchResults = productSearch
    ? PRODUCTS.filter(p => {
        const q = productSearch.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.flavor.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      })
    : null;

  // Pack sizes for selected container
  const packSizes = [...new Set(PRODUCTS.filter(p => p.size === selectedContainer).map(p => p.packSize))];
  if (!packSizes.includes(selectedPackSize)) selectedPackSize = packSizes[0] || null;

  const flavorProducts = searchResults || PRODUCTS.filter(p => p.size === selectedContainer && p.packSize === selectedPackSize);

  const cartTotal = calcCartTotal();
  const cartItems = cart.reduce((s, c) => s + c.qty, 0);
  const availableContainers = _CONTAINER_TYPES.filter(ct => PRODUCTS.some(p => p.size === ct.key));

  return `
  <!-- Search bar -->
  <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px">
    <input type="text" placeholder="🔍 Search all products…" value="${productSearch}"
      oninput="window.ERP._searchProducts(this.value)"
      style="flex:1;padding:10px 12px;border:1px solid var(--border);border-radius:10px;font-size:13px;background:#fff">
    ${productSearch ? `<button style="padding:8px 10px;border:1px solid var(--border);border-radius:8px;background:#fff;cursor:pointer;font-size:12px" onclick="window.ERP._searchProducts('')">✕</button>` : ''}
  </div>

  ${searchResults ? `
    <div style="font-size:11px;color:var(--text-light);margin-bottom:8px">
      Search results (${searchResults.length}) — <span style="color:var(--primary);cursor:pointer" onclick="window.ERP._searchProducts('')">← Browse</span>
    </div>` : `

  <!-- Container Type Tabs (scrollable) -->
  <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:8px;-webkit-overflow-scrolling:touch">
    ${availableContainers.map(ct => {
      const active = selectedContainer === ct.key;
      const inCartCount = cart.filter(ci => PRODUCTS.find(p => p.id === ci.productId && p.size === ct.key)).length;
      return `<button onclick="window.ERP._setContainer('${ct.key}')"
        style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 14px;
          border-radius:10px;border:2px solid ${active ? 'var(--primary)' : 'var(--border)'};
          background:${active ? 'var(--primary)' : '#fff'};color:${active ? '#fff' : 'var(--text)'};
          font-size:11px;font-weight:600;cursor:pointer;position:relative;white-space:nowrap">
        <span style="font-size:1.3rem">${ct.icon}</span>
        <span>${ct.label}</span>
        ${inCartCount > 0 ? `<span style="position:absolute;top:4px;right:4px;background:${active ? '#fff' : 'var(--primary)'};color:${active ? 'var(--primary)' : '#fff'};width:16px;height:16px;border-radius:50%;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center">${inCartCount}</span>` : ''}
      </button>`;
    }).join('')}
  </div>

  <!-- Pack Size Selector -->
  ${packSizes.length > 1 ? `
  <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;flex-wrap:wrap">
    <span style="font-size:10px;color:var(--text-light);font-weight:600">Pack:</span>
    ${packSizes.map(ps => `<button onclick="window.ERP._setPackSize('${ps}')"
      style="padding:5px 12px;border:1.5px solid ${selectedPackSize === ps ? 'var(--primary)' : 'var(--border)'};border-radius:8px;background:${selectedPackSize === ps ? 'var(--primary)' : '#fff'};color:${selectedPackSize === ps ? '#fff' : 'var(--text)'};font-size:11px;font-weight:600;cursor:pointer">
      📦 ${ps}</button>`).join('')}
  </div>` : `<div style="font-size:10px;color:var(--text-light);margin-bottom:8px">📦 ${selectedPackSize} &nbsp;·&nbsp; ${flavorProducts.length} flavors</div>`}
  `}

  <!-- Product Cards Grid -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
    ${flavorProducts.map(p => {
      const inCart = cart.find(c => c.productId === p.id);
      const hasOverride = stockOverrides.has(p.id);
      const maxHard = p.overStockLimit === 0 ? p.stock : p.stock + p.overStockLimit;
      const oos = p.stock <= 0 && p.overStockLimit === 0 && !hasOverride;
      const inWarn = inCart && inCart.qty > p.stock && p.overStockLimit > 0;
      const aboveLimit = inCart && inWarn && inCart.qty > maxHard;
      const needsOverride = inCart && p.overStockLimit === 0 && inCart.qty > p.stock && !hasOverride;
      const qtyBorder = aboveLimit ? 'var(--red)' : inWarn ? 'var(--orange)' : needsOverride ? 'var(--red)' : 'var(--border)';
      return `<div style="background:${inCart ? 'var(--primary-light)' : '#fff'};border:1.5px solid ${inCart ? 'var(--primary)' : 'var(--border)'};border-radius:10px;padding:10px;text-align:center;${oos ? 'opacity:.45;' : 'cursor:pointer;'}" ${oos ? '' : `onclick="window.ERP._addToCart(${p.id})"`}>
        <div style="font-weight:700;font-size:12px;margin-bottom:1px">${p.name}</div>
        <div style="font-size:10px;color:var(--text-light);font-weight:600">${p.flavor}</div>
        ${searchResults ? `<div style="font-size:9px;color:var(--text-light)">${p.size}${p.material === 'Glass' ? ' 🫙' : ''} · ${p.packSize}</div>` : ''}
        <div style="font-weight:800;font-size:14px;color:var(--primary);margin:5px 0">${fmt$(p.price)}</div>
        <div style="font-size:9px;color:${oos ? 'var(--red)' : p.stock < 10 ? 'var(--orange)' : 'var(--text-light)'}">
          ${oos ? '🔴 OOS' : (p.stock < 10 ? '🟡 ' : '✅ ') + p.stock + ' CS'}
          ${p.overStockLimit > 0 ? `<span style="color:var(--text-light)"> +${p.overStockLimit}ok</span>` : ''}
          ${hasOverride ? ' <span style="color:#7c3aed">★</span>' : ''}
        </div>
        ${inCart ? `<div style="display:flex;align-items:center;justify-content:center;gap:5px;margin-top:7px" onclick="event.stopPropagation()">
          <button style="width:26px;height:26px;border:1px solid var(--border);border-radius:6px;background:#fff;cursor:pointer;font-weight:700" onclick="window.ERP._cartQty(${p.id},-1)">−</button>
          <input type="number" min="0" value="${inCart.qty}"
            style="width:38px;height:26px;border:1.5px solid ${qtyBorder};border-radius:5px;font-size:12px;font-weight:700;text-align:center;background:#fff"
            onclick="event.stopPropagation()" onchange="window.ERP._setCartQtyDirect(${p.id},parseInt(this.value)||0)">
          <button style="width:26px;height:26px;border:1px solid var(--border);border-radius:6px;background:#fff;cursor:pointer;font-weight:700" onclick="window.ERP._cartQty(${p.id},1)">+</button>
        </div>
        ${aboveLimit ? `<div style="font-size:9px;color:var(--red);margin-top:3px" onclick="event.stopPropagation()">⚠️ above limit</div>` : inWarn ? `<div style="font-size:9px;color:var(--orange);margin-top:3px" onclick="event.stopPropagation()">⚠️ over stock</div>` : ''}
        ${needsOverride ? `<button style="margin-top:4px;font-size:9px;padding:2px 6px;border:1px solid #7c3aed;border-radius:4px;color:#7c3aed;background:transparent;cursor:pointer" onclick="event.stopPropagation();window.ERP._grantStockOverride(${p.id})">Override</button>` : ''}
        ` : ''}
        ${oos ? `<button style="margin-top:4px;font-size:9px;padding:2px 6px;border:1px solid #7c3aed;border-radius:4px;color:#7c3aed;background:transparent;cursor:pointer" onclick="event.stopPropagation();window.ERP._grantStockOverride(${p.id})">Override</button>` : ''}
      </div>`;
    }).join('')}
  </div>
  ${flavorProducts.length === 0 ? '<div style="text-align:center;color:var(--text-light);padding:20px;font-size:12px">No products found.</div>' : ''}
  <div style="display:flex;gap:8px">
    <button style="flex:1;padding:10px;border:1.5px solid var(--primary);border-radius:10px;background:transparent;color:var(--primary);font-weight:600;font-size:12px;cursor:pointer" onclick="window.ERP._setOrderStep(1)">← Back</button>
    <button style="flex:2;padding:10px;border:none;border-radius:10px;background:var(--primary);color:#fff;font-weight:600;font-size:12px;cursor:pointer;${cart.length === 0 ? 'opacity:.5;' : ''}" onclick="window.ERP._setOrderStep(3)" ${cart.length === 0 ? 'disabled' : ''}>🛒 ${cartItems} items · ${fmt$(cartTotal)} →</button>
  </div>`;
}

function mobileOrderStep3() {
  if (!selectedCustomer) { orderStep = 1; return mobileOrderStep1(); }
  const cust = selectedCustomer;
  const isPrepay = cust.creditLimit === 0;
  const subtotal = calcCartSubtotal();
  const crv = calcCartCRV();
  const total = subtotal + crv;
  const postBalance = cust.balance + total;
  const overCredit = !isPrepay && cust.creditLimit > 0 && postBalance > cust.creditLimit;

  return `
  <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px">
    <div style="font-weight:700;font-size:14px;margin-bottom:10px">📋 Review Order</div>
    ${cart.map(item => {
      const p = productById(item.productId);
      if (!p) return '';
      const lineCrv = getCRV(p) * item.qty;
      const lineTotal = p.price * item.qty + lineCrv;
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
        <div style="flex:1">
          <div style="font-weight:600;font-size:12px">${p.name} <span style="font-weight:400;color:var(--text-light)">${p.flavor}</span></div>
          <div style="font-size:10px;color:var(--text-light)">${p.size} · List: ${fmt$(p.price)}/cs</div>
          <div style="display:flex;align-items:center;gap:4px;margin-top:4px" onclick="event.stopPropagation()">
            <label style="font-size:9px;color:var(--text-light)">Disc%</label>
            <input type="number" min="0" max="${ORDER_CAPS.maxDiscountPct - 0.01}" step="0.5" value="${orderDiscounts[p.id] || ''}" placeholder="0"
              style="width:44px;padding:2px 4px;border:1px solid ${
                (orderDiscounts[p.id]||0) > ORDER_CAPS.warnDiscountPct ? 'var(--orange)' :
                (orderDiscounts[p.id]||0) > 0 ? 'var(--green)' : 'var(--border)'
              };border-radius:4px;font-size:10px"
              onchange="window.ERP._setItemDiscount(${p.id},parseFloat(this.value)||0)">
            ${(orderDiscounts[p.id]||0) > ORDER_CAPS.warnDiscountPct ? `<span style="font-size:8px;color:var(--orange)">⚠️ High</span>` : ''}
            <span style="font-size:9px;color:var(--text-light)">Net: <strong style="color:var(--primary)">${fmt$(getItemPrice(p.id))}</strong></span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <button style="width:24px;height:24px;border:1px solid var(--border);border-radius:4px;background:#fff;cursor:pointer;font-size:12px" onclick="window.ERP._cartQty(${p.id},-1)">−</button>
          <span style="font-weight:700;font-size:12px;min-width:18px;text-align:center">${item.qty}</span>
          <button style="width:24px;height:24px;border:1px solid var(--border);border-radius:4px;background:#fff;cursor:pointer;font-size:12px" onclick="window.ERP._cartQty(${p.id},1)">+</button>
        </div>
        <div style="min-width:60px;text-align:right;font-weight:700;font-size:12px">${fmt$(getItemPrice(p.id)*item.qty + getCRV(p)*item.qty)}</div>
      </div>`;
    }).join('')}
    <div style="border-top:2px solid var(--border);padding-top:8px;margin-top:4px">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-light)"><span>Subtotal</span><span>${fmt$(subtotal)}</span></div>
      ${Object.keys(orderDiscounts).length > 0 ? `<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--orange)"><span>🏷️ Discounts Applied</span><span>✓</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-light)"><span>CRV</span><span>${fmt$(crv)}</span></div>
      <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;margin-top:6px"><span>Total</span><span>${fmt$(total)}</span></div>
    </div>
  </div>

  ${overCredit ? '<div style="background:#fff7ed;border:1px solid var(--orange);border-radius:8px;padding:10px;font-size:11px;margin-bottom:8px">⚠️ Over credit limit — needs manager approval.</div>' : ''}
  ${isPrepay && !prepayCompleted ? `<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:10px;font-size:11px;margin-bottom:8px">🔴 Prepay required: ${fmt$(total)}</div>` : ''}
  ${isPrepay && prepayCompleted ? '<div style="background:#f0fdf4;border:1px solid var(--green);border-radius:8px;padding:10px;font-size:11px;margin-bottom:8px">✅ Payment collected</div>' : ''}

  <div style="display:flex;gap:8px">
    <button style="flex:1;padding:10px;border:1.5px solid var(--primary);border-radius:10px;background:transparent;color:var(--primary);font-weight:600;font-size:12px;cursor:pointer" onclick="window.ERP._setOrderStep(2)">← Products</button>
    ${isPrepay && !prepayCompleted
      ? '<button style="flex:2;padding:10px;border:none;border-radius:10px;background:var(--green);color:#fff;font-weight:600;font-size:12px;cursor:pointer" onclick="window.ERP._prepayOrder()">💵 Pay & Submit</button>'
      : '<button style="flex:2;padding:10px;border:none;border-radius:10px;background:var(--primary);color:#fff;font-weight:600;font-size:12px;cursor:pointer" onclick="window.ERP._setOrderStep(4)">Submit Order →</button>'}
  </div>`;
}

function mobileOrderStep4() {
  if (!selectedCustomer) { orderStep = 1; return mobileOrderStep1(); }
  const total = calcCartTotal();
  const newId = 'ORD-' + (2610 + Math.floor(Math.random() * 100) + 1);

  return `
  <div style="text-align:center;padding:20px 0">
    <div style="font-size:56px;margin-bottom:12px">✅</div>
    <div style="font-weight:700;font-size:18px;margin-bottom:4px">Order Submitted!</div>
    <div style="font-size:12px;color:var(--text-light);margin-bottom:8px"><strong>${newId}</strong> for ${selectedCustomer.name}</div>
    <div style="font-size:1.4rem;font-weight:800;margin-bottom:4px">${fmt$(total)}</div>
    <div style="font-size:11px;color:var(--text-light);margin-bottom:16px">${cart.length} items · Pending</div>
    ${selectedCustomer.creditLimit === 0 ? '<div style="font-size:11px;color:var(--green);margin-bottom:12px">💵 Prepayment collected</div>' : ''}
    ${selectedCustomer.creditLimit > 0 ? `<div style="background:#f0fdf4;border:1px solid var(--green);border-radius:10px;padding:12px;margin-bottom:12px;text-align:left">
      <div style="font-weight:700;font-size:12px;margin-bottom:8px">💵 Payment Options</div>
      <button style="width:100%;padding:9px;border:none;border-radius:8px;background:var(--green);color:#fff;font-weight:600;font-size:12px;cursor:pointer;margin-bottom:6px" onclick="window.ERP._showPaymentModal(${selectedCustomer.id},null)">Collect Payment Now</button>
      <button style="width:100%;padding:9px;border:1px solid var(--border);border-radius:8px;background:#fff;color:var(--text);font-weight:600;font-size:12px;cursor:pointer" onclick="window.ERP.toast('Invoice will be sent at delivery','info')">🧾 Invoice on Delivery</button>
    </div>` : ''}
    <div style="display:flex;flex-direction:column;gap:8px">
      <button style="padding:10px;border:none;border-radius:10px;background:var(--primary);color:#fff;font-weight:600;font-size:13px;cursor:pointer" onclick="window.ERP._resetOrder();window.ERP.nav('#/sales/new-order')">📦 New Order</button>
      <button style="padding:10px;border:1.5px solid var(--primary);border-radius:10px;background:transparent;color:var(--primary);font-weight:600;font-size:13px;cursor:pointer" onclick="window.ERP._resetOrder();window.ERP.nav('#/sales/orders')">📋 View Orders</button>
      <button style="padding:10px;border:1.5px solid var(--border);border-radius:10px;background:transparent;color:var(--text-light);font-weight:600;font-size:13px;cursor:pointer" onclick="window.ERP._resetOrder();window.ERP.nav('#/sales/main')">🏠 Dashboard</button>
    </div>
  </div>`;
}

// ── Mobile Favorites ──
function mobileFavorites() {
  const favIds = [1, 4, 5, 6, 8, 12, 15, 17];
  const favs = favIds.map(id => productById(id)).filter(Boolean);

  return `<div>
    <div style="font-weight:700;font-size:16px;margin-bottom:4px">⭐ Favorites</div>
    <div style="font-size:11px;color:var(--text-light);margin-bottom:12px">Quick-access products for repeat orders</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      ${favs.map(p => {
        const cat = categoryById(p.category);
        return `<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;text-align:center">
          <div style="font-size:1.5rem;margin-bottom:4px">${cat ? cat.icon : '📦'}</div>
          <div style="font-weight:700;font-size:12px">${p.name}</div>
          <div style="font-size:9px;color:var(--text-light)">${p.flavor} · ${p.size}</div>
          <div style="font-weight:700;font-size:12px;color:var(--primary);margin-top:4px">${fmt$(p.price)}/cs</div>
          <div style="font-size:9px;color:var(--text-light)">${p.stock} in stock</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ── Mobile Reports ──
function mobileReports() {
  const totalRev = ORDERS.reduce((s, o) => s + o.total, 0);
  const deliveredRev = ORDERS.filter(o => o.status === 'Delivered').reduce((s, o) => s + o.total, 0);
  const avgOrder = totalRev / ORDERS.length;

  const prodQty = {};
  ORDERS.forEach(o => o.items.forEach(i => { prodQty[i.productId] = (prodQty[i.productId] || 0) + i.qty; }));
  const topProducts = Object.entries(prodQty).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, qty]) => {
    const p = productById(parseInt(id));
    return { product: p, qty };
  }).filter(x => x.product);

  const custRev = {};
  ORDERS.forEach(o => { custRev[o.customer] = (custRev[o.customer] || 0) + o.total; });
  const topCustomers = Object.entries(custRev).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, rev]) => {
    const c = customerById(parseInt(id));
    return { customer: c, rev };
  }).filter(x => x.customer);

  return `<div>
    <div style="font-weight:700;font-size:16px;margin-bottom:12px">📊 Sales Reports</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:12px">
      <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:10px 6px;text-align:center">
        <div style="font-size:8px;color:var(--text-light);text-transform:uppercase;font-weight:600">Total Rev</div>
        <div style="font-size:1rem;font-weight:800">${fmt$(totalRev)}</div>
      </div>
      <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:10px 6px;text-align:center">
        <div style="font-size:8px;color:var(--text-light);text-transform:uppercase;font-weight:600">Delivered</div>
        <div style="font-size:1rem;font-weight:800;color:var(--green)">${fmt$(deliveredRev)}</div>
      </div>
      <div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:10px 6px;text-align:center">
        <div style="font-size:8px;color:var(--text-light);text-transform:uppercase;font-weight:600">Avg Order</div>
        <div style="font-size:1rem;font-weight:800">${fmt$(avgOrder)}</div>
      </div>
    </div>

    <details style="margin-bottom:8px" open>
      <summary style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">🏆 Top Products<span style="margin-left:auto;font-size:11px;color:var(--text-light)">▸</span></summary>
      <div style="background:#fff;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:8px 12px">
        ${topProducts.map((tp, i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">
            <div style="font-size:12px"><span style="color:var(--text-light);margin-right:6px">${i + 1}.</span><strong>${tp.product.name}</strong> <span style="color:var(--text-light)">${tp.product.flavor}</span></div>
            <span style="font-weight:700;font-size:12px">${tp.qty} CS</span>
          </div>`).join('')}
      </div>
    </details>

    <details style="margin-bottom:8px">
      <summary style="display:flex;align-items:center;gap:6px;padding:10px 12px;background:#fff;border:1px solid var(--border);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">🏅 Top Customers<span style="margin-left:auto;font-size:11px;color:var(--text-light)">▸</span></summary>
      <div style="background:#fff;border:1px solid var(--border);border-top:none;border-radius:0 0 10px 10px;padding:8px 12px">
        ${topCustomers.map((tc, i) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="window.ERP.nav('#/sales/customer?id=${tc.customer.id}')">
            <div style="font-size:12px"><span style="color:var(--text-light);margin-right:6px">${i + 1}.</span><strong>${tc.customer.name}</strong></div>
            <span style="font-weight:700;font-size:12px">${fmt$(tc.rev)}</span>
          </div>`).join('')}
      </div>
    </details>
  </div>`;
}

// ══════════════════════════════════════════
//  NOTIFICATIONS PAGE
// ══════════════════════════════════════════
function notificationsPage() {
  if (window.ERP._isMobile) return mobileNotificationsPage();
  const methods = { email:'Email', sms:'SMS', both:'Email + SMS' };
  return `
  <div class="fade-in">
    <div class="flex-between mb-16">
      <div><h1 style="margin:0">🔔 Notifications</h1><p class="text-light">Automate order &amp; invoice alerts per customer</p></div>
      <button class="btn-primary" onclick="window.ERP.toast('Settings saved','success')">💾 Save All</button>
    </div>

    <div class="card mb-16" style="padding:12px 16px;background:#eff6ff;border:1px solid var(--primary)">
      <div class="text-sm"><strong>💡 How it works:</strong> When enabled, customers automatically receive notifications at each configured event. Toggle per customer and choose their preferred delivery method.</div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th style="text-align:center">Order Confirmed</th>
            <th style="text-align:center">Invoice Sent</th>
            <th style="text-align:center">Payment Reminder</th>
            <th style="text-align:center">Method</th>
            <th style="text-align:center">Test</th>
          </tr>
        </thead>
        <tbody>
          ${CUSTOMERS.filter(c => c.status !== 'Hold').map(c => {
            const prefs = NOTIFICATION_PREFS[c.id] || { orderConfirm:false, invoiceSent:false, paymentReminder:false, method:'email' };
            return `<tr>
              <td>
                <div style="font-weight:700">${c.name}</div>
                <div class="text-xs text-light">${c.contact} · ${c.email}</div>
              </td>
              <td style="text-align:center">
                <label class="toggle-wrap">
                  <input type="checkbox" ${prefs.orderConfirm ? 'checked' : ''} onchange="window.ERP.toast('Saved: Order confirm for ${c.name}','success')">
                  <span class="toggle-slider"></span>
                </label>
              </td>
              <td style="text-align:center">
                <label class="toggle-wrap">
                  <input type="checkbox" ${prefs.invoiceSent ? 'checked' : ''} onchange="window.ERP.toast('Saved: Invoice sent for ${c.name}','success')">
                  <span class="toggle-slider"></span>
                </label>
              </td>
              <td style="text-align:center">
                <label class="toggle-wrap">
                  <input type="checkbox" ${prefs.paymentReminder ? 'checked' : ''} onchange="window.ERP.toast('Saved: Payment reminder for ${c.name}','success')">
                  <span class="toggle-slider"></span>
                </label>
              </td>
              <td style="text-align:center">
                <select style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:0.82rem">
                  ${Object.entries(methods).map(([k,v]) => `<option value="${k}" ${prefs.method===k?'selected':''}>${v}</option>`).join('')}
                </select>
              </td>
              <td style="text-align:center">
                <button class="btn-ghost btn-sm" onclick="window.ERP.toast('📧 Test notification sent to ${c.name}','success')">Test</button>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>

    <!-- Notification Templates -->
    <div class="grid-3 mt-16" style="gap:12px">
      ${[
        { evt:'Order Confirmed', icon:'📦', desc:'Sent when order status changes to Confirmed.', preview:'Your order #ORD-XXXX has been confirmed for delivery on [date].' },
        { evt:'Invoice Sent',    icon:'🧾', desc:'Sent when a delivery invoice is created.',    preview:'Invoice #INV-XXXX for $X,XXX.XX is due [date]. Pay online: [link]' },
        { evt:'Payment Reminder',icon:'💵', desc:'Sent when invoice passes due date.',          preview:'Reminder: Invoice #INV-XXXX is overdue. Please contact us.' },
      ].map(t => `
        <div class="card">
          <div style="font-size:1.4rem;margin-bottom:6px">${t.icon}</div>
          <div style="font-weight:700;margin-bottom:4px">${t.evt}</div>
          <div class="text-xs text-light mb-8">${t.desc}</div>
          <div style="background:var(--bg-secondary);border-radius:6px;padding:8px;font-size:0.8rem;font-style:italic;color:var(--text-light)">"${t.preview}"</div>
          <button class="btn-ghost btn-sm mt-8" onclick="window.ERP.toast('Template editor coming soon','info')">✏️ Edit Template</button>
        </div>`).join('')}
    </div>
  </div>`;
}

function mobileNotificationsPage() {
  const methods = { email:'Email', sms:'SMS', both:'Email + SMS' };
  return `<div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div style="font-weight:700;font-size:16px">🔔 Notifications</div>
      <button style="padding:6px 14px;border:none;border-radius:8px;background:var(--primary);color:#fff;font-size:12px;font-weight:600;cursor:pointer" onclick="window.ERP.toast('Settings saved','success')">💾 Save</button>
    </div>
    ${CUSTOMERS.filter(c => c.status !== 'Hold').map(c => {
      const prefs = NOTIFICATION_PREFS[c.id] || { orderConfirm:false, invoiceSent:false, paymentReminder:false, method:'email' };
      return `<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px">
        <div style="font-weight:700;font-size:13px">${c.name}</div>
        <div style="font-size:10px;color:var(--text-light);margin-bottom:8px">${c.email}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:11px;margin-bottom:8px">
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" ${prefs.orderConfirm?'checked':''} onchange="window.ERP.toast('Saved','success')">Order Conf.
          </label>
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" ${prefs.invoiceSent?'checked':''} onchange="window.ERP.toast('Saved','success')">Invoice
          </label>
          <label style="display:flex;align-items:center;gap:4px;cursor:pointer">
            <input type="checkbox" ${prefs.paymentReminder?'checked':''} onchange="window.ERP.toast('Saved','success')">Pay Remind.
          </label>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <select style="flex:1;padding:5px 8px;border:1px solid var(--border);border-radius:6px;font-size:11px">
            ${Object.entries(methods).map(([k,v])=>`<option value="${k}" ${prefs.method===k?'selected':''}>${v}</option>`).join('')}
          </select>
          <button style="padding:5px 10px;border:1px solid var(--border);border-radius:6px;background:#fff;font-size:11px;cursor:pointer" onclick="window.ERP.toast('Test sent','success')">Test</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

// ══════════════════════════════════════════
//  WINDOW.ERP HANDLERS
// ══════════════════════════════════════════

// ── Tab switching ──
window.ERP._switchCustTab = function(el) {
  const tab = el.dataset.tab;
  const container = el.closest('.fade-in') || document.querySelector('.content') || document;
  container.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  container.querySelectorAll('.tab-content[data-tab]').forEach(c => {
    c.classList.toggle('active', c.dataset.tab === tab);
  });
};

// ── Customer list filter ──
window.ERP._filterCustomers = function(query) {
  const q = query.toLowerCase();
  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) ||
    c.contact.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
  );
  const el = document.getElementById('cust-list');
  if (el) el.innerHTML = renderCustomerList(filtered);
};

// ── Order list filter ──
window.ERP._filterOrders = function(status) {
  const filtered = status === 'All' ? ORDERS : ORDERS.filter(o => o.status === status);
  const el = document.getElementById('order-list');
  if (el) el.innerHTML = renderOrderList(filtered);
};

// ── Order customer filter (step 1) ──
window.ERP._filterOrderCustomers = function(query) {
  const q = query.toLowerCase();
  const el = document.getElementById('order-cust-list');
  if (!el) return;
  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q)
  );
  el.innerHTML = filtered.map(c => {
    const disabled = c.status === 'Hold';
    const isPrepay = c.creditLimit === 0;
    return `<div style="padding:12px;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;
      ${disabled ? 'opacity:0.5;' : 'cursor:pointer;'}
      display:flex;justify-content:space-between;align-items:center"
      ${disabled ? '' : `onclick="window.ERP._selectOrderCustomer(${c.id})"`}>
      <div>
        <strong>${c.name}</strong>
        <span class="text-xs text-light ml-8">${c.code}</span>
        ${disabled ? '<span class="text-xs" style="color:var(--red);margin-left:8px">🔴 On Hold</span>' : ''}
        ${isPrepay ? '<span class="text-xs" style="color:#b45309;margin-left:8px">⚠️ Prepay</span>' : ''}
      </div>
      <div class="text-sm text-light">${c.creditLimit > 0 ? 'Tier ' + c.creditTier + ' · ' + fmt$(c.creditLimit - c.balance) + ' avail.' : 'Prepay'}</div>
    </div>`;
  }).join('');
};

// ── Select customer for order ──
window.ERP._selectOrderCustomer = function(custId) {
  selectedCustomer = customerById(custId);
  cart = [];
  orderStep = 2;
  prepayCompleted = false;
  productSearch = '';
  selectedCategory = 0;
  rerender(newOrderPage);
};

// ── Change customer via dropdown (keeps cart) ──
window.ERP._changeOrderCustomer = function(custId) {
  selectedCustomer = customerById(custId);
  prepayCompleted = false;
  rerender(newOrderPage);
};

// ── Step navigation ──
window.ERP._setOrderStep = function(step) {
  if (step === 3 && cart.length === 0) return;
  orderStep = step;
  rerender(newOrderPage);
};

// ── Reset order ──
window.ERP._resetOrder = function() {
  selectedCustomer = null;
  cart = [];
  orderStep = 1;
  productSearch = '';
  selectedCategory = 0;
  selectedContainer = '12oz Can';
  selectedPackSize  = '24-pack';
  prepayCompleted = false;
  selectedPaymentMethod = '';
  orderDiscounts = {};
  orderPriceOverrides = {};
  stockOverrides = new Set();
  rerender(newOrderPage);
};

// ── Category filter (kept for mobile / legacy) ──
window.ERP._setCategory = function(catId) {
  selectedCategory = catId;
  rerender(newOrderPage);
};

// ── Inventory browser: set container type ──
window.ERP._setContainer = function(containerKey) {
  selectedContainer = containerKey;
  // Auto-select first pack size for this container
  const packs = [...new Set(PRODUCTS.filter(p => p.size === containerKey).map(p => p.packSize))];
  selectedPackSize = packs[0] || null;
  productSearch = ''; // clear search so browser shows
  rerender(newOrderPage);
};

// ── Inventory browser: set case/pack size ──
window.ERP._setPackSize = function(packKey) {
  selectedPackSize = packKey;
  rerender(newOrderPage);
};

// ── Product search ──
window.ERP._searchProducts = function(query) {
  productSearch = query;
  rerender(newOrderPage);
};

// ── Cart: add ──
window.ERP._addToCart = function(productId) {
  const p = productById(productId);
  if (!p) return;
  const existing = cart.find(c => c.productId === productId);
  const newQty = existing ? existing.qty + 1 : 1;
  const hasOverride = stockOverrides.has(productId);
  const maxHard = p.overStockLimit === 0 ? p.stock : p.stock + p.overStockLimit;

  if (!hasOverride) {
    if (p.overStockLimit === 0 && newQty > p.stock && p.stock > 0) {
      window.ERP.toast(`❌ ${p.name} ${p.flavor}: stock limit is ${p.stock} CS. Click "Manager Override" to proceed.`, 'error');
      if (!existing) cart.push({ productId, qty: 1 }); else existing.qty++; // let it appear so override btn shows
      rerender(newOrderPage);
      return;
    }
    if (p.overStockLimit === 0 && p.stock <= 0) {
      window.ERP.toast(`❌ ${p.name} ${p.flavor} is out of stock — override required`, 'error');
      cart.push({ productId, qty: 1 });
      rerender(newOrderPage);
      return;
    }
    if (newQty > p.stock && p.overStockLimit > 0) {
      if (newQty > maxHard) {
        window.ERP.toast(`⚠️ ${p.name}: ${newQty} CS — ${newQty - maxHard} above over-stock limit (${maxHard} CS max). Allowed with warning.`, 'warning');
      } else {
        window.ERP.toast(`⚠️ ${p.name}: ${newQty - p.stock} cases over stock (${p.overStockLimit} extra allowed)`, 'warning');
      }
    }
  }
  if (existing) existing.qty++;
  else cart.push({ productId, qty: 1 });
  rerender(newOrderPage);
};

// ── Cart: remove ──
window.ERP._removeFromCart = function(productId) {
  cart = cart.filter(c => c.productId !== productId);
  rerender(newOrderPage);
};

// ── Cart: adjust qty ──
window.ERP._cartQty = function(productId, delta) {
  const item = cart.find(c => c.productId === productId);
  if (!item) return;
  const p = productById(productId);
  const newQty = item.qty + delta;
  if (newQty <= 0) { cart = cart.filter(c => c.productId !== productId); rerender(newOrderPage); return; }
  if (p) {
    const hasOverride = stockOverrides.has(productId);
    const maxHard = p.overStockLimit === 0 ? p.stock : p.stock + p.overStockLimit;
    if (!hasOverride && delta > 0 && newQty > p.stock && p.overStockLimit > 0) {
      if (newQty > maxHard) {
        window.ERP.toast(`⚠️ ${p.name}: ${newQty - maxHard} above over-stock limit — allowed with warning`, 'warning');
      } else {
        window.ERP.toast(`⚠️ ${p.name}: ${newQty - p.stock} over stock (max +${p.overStockLimit})`, 'warning');
      }
    }
    if (!hasOverride && delta > 0 && p.overStockLimit === 0 && newQty > p.stock) {
      window.ERP.toast(`❌ ${p.name}: hard stock limit ${p.stock} CS — use Override button`, 'error');
      rerender(newOrderPage); return;
    }
  }
  item.qty = newQty;
  rerender(newOrderPage);
};

// ── Cart: direct qty input ──
window.ERP._setCartQtyDirect = function(productId, qty) {
  if (isNaN(qty) || qty < 0) return;
  const p = productById(productId);
  const hasOverride = stockOverrides.has(productId);
  if (qty === 0) { cart = cart.filter(c => c.productId !== productId); rerender(newOrderPage); return; }
  if (p && !hasOverride) {
    const maxHard = p.overStockLimit === 0 ? p.stock : p.stock + p.overStockLimit;
    if (p.overStockLimit === 0 && qty > p.stock) {
      window.ERP.toast(`❌ ${p.name}: stock limit ${p.stock} CS — click "Manager Override" in the row`, 'error');
      rerender(newOrderPage); return;
    }
    if (p.overStockLimit > 0 && qty > p.stock) {
      if (qty > maxHard) {
        window.ERP.toast(`⚠️ ${p.name}: ${qty - maxHard} above over-stock limit (${maxHard} CS) — allowed with warning`, 'warning');
      } else {
        window.ERP.toast(`⚠️ ${p.name}: ${qty - p.stock} over stock — allowed up to +${p.overStockLimit} CS`, 'warning');
      }
    }
  }
  const item = cart.find(c => c.productId === productId);
  if (item) item.qty = qty; else cart.push({ productId, qty });
  rerender(newOrderPage);
};

// ── Cart: grant manager override for stock limits ──
window.ERP._grantStockOverride = function(productId) {
  const p = productById(productId);
  stockOverrides.add(productId);
  // Ensure item is in cart at at least 1
  const item = cart.find(c => c.productId === productId);
  if (!item) cart.push({ productId, qty: 1 });
  window.ERP.toast(`✅ Manager override granted for ${p ? p.name + ' ' + p.flavor : productId} — stock limit bypassed`, 'success');
  rerender(newOrderPage);
};

// ── Review: edit qty inline ──
window.ERP._updateReviewQty = function(productId, qty) {
  if (qty <= 0) {
    cart = cart.filter(c => c.productId !== productId);
  } else {
    const item = cart.find(c => c.productId === productId);
    if (item) item.qty = qty;
  }
  rerender(newOrderPage);
};

// ── Item discount (% off case price) ──
window.ERP._setItemDiscount = function(productId, pct) {
  if (pct >= ORDER_CAPS.maxDiscountPct) {
    window.ERP.toast(`❌ ${pct}% discount reaches the ${ORDER_CAPS.maxDiscountPct}% cap — blocked`, 'error');
    rerender(newOrderPage);
    return;
  }
  if (pct === 0) {
    delete orderDiscounts[productId];
    delete orderPriceOverrides[productId];
  } else {
    if (pct > ORDER_CAPS.warnDiscountPct) {
      window.ERP.toast(`⚠️ ${pct}% — high discount applied`, 'warning');
    }
    delete orderPriceOverrides[productId];
    orderDiscounts[productId] = pct;
  }
  rerender(newOrderPage);
};

// ── Item manual price override ──
window.ERP._setItemPrice = function(productId, val) {
  const p = productById(productId);
  if (!p) return;
  const newPrice = parseFloat(val);
  if (isNaN(newPrice) || newPrice < 0) return;
  const impliedDisc = ((p.price - newPrice) / p.price) * 100;
  if (impliedDisc >= ORDER_CAPS.maxDiscountPct) {
    window.ERP.toast(`❌ That price implies a ${impliedDisc.toFixed(1)}% discount — reaches the ${ORDER_CAPS.maxDiscountPct}% cap — blocked`, 'error');
    rerender(newOrderPage);
    return;
  }
  delete orderDiscounts[productId];
  if (newPrice === p.price) { delete orderPriceOverrides[productId]; }
  else { orderPriceOverrides[productId] = newPrice; }
  rerender(newOrderPage);
};

// ── Prepay: open payment modal for $0 credit customers ──
window.ERP._prepayOrder = function() {
  if (!selectedCustomer) return;
  showPaymentModal(selectedCustomer.id, null, true);
};

// ── Payment modal ──
window.ERP._showPaymentModal = function(custId, invoiceId, isPrepay) {
  showPaymentModal(custId, invoiceId || null, isPrepay || false);
};

// ── Payment tab switching ──
window.ERP._switchPayTab = function(tab) {
  ['single','batch','credit'].forEach(t => {
    const panel = document.getElementById('ppanel-' + t);
    const btn   = document.getElementById('ptab-' + t);
    if (panel) panel.style.display = t === tab ? 'block' : 'none';
    if (btn)   { btn.style.background = t === tab ? 'var(--primary)' : 'var(--bg-secondary)'; btn.style.color = t === tab ? '#fff' : 'var(--text-light)'; }
  });
  const processBtn = document.getElementById('process-pay-btn');
  if (processBtn) processBtn.setAttribute('data-mode', tab);
};

// ── Batch total recalc ──
window.ERP._updateBatchTotal = function() {
  const boxes = document.querySelectorAll('.batch-inv-chk:checked');
  let total = 0;
  boxes.forEach(b => { total += parseFloat(b.dataset.amount) || 0; });
  const el = document.getElementById('batch-total-display');
  if (el) el.textContent = fmt$(total);
};

// ── Payment method selection ──
window.ERP._selectPayMethod = function(key) {
  selectedPaymentMethod = key;
  ['card','ach','check','cash','link'].forEach(k => {
    const el = document.getElementById('pay-method-' + k);
    if (el) el.style.borderColor = k === key ? 'var(--primary)' : 'var(--border)';
  });
};

// ── Process payment ──
window.ERP._processPayment = function(custId, isPrepay) {
  const cust  = customerById(custId);
  const btn   = document.getElementById('process-pay-btn');
  const mode  = btn ? btn.getAttribute('data-mode') || 'single' : 'single';

  if (mode === 'credit') {
    const amt = parseFloat(document.getElementById('credit-amount')?.value || '0');
    window.ERP.closeModal();
    window.ERP.toast(`✅ Account credit of ${fmt$(amt)} applied — balance updated`, 'success');
    return;
  }

  if (mode === 'batch') {
    const boxes = document.querySelectorAll('.batch-inv-chk:checked');
    if (!selectedPaymentMethod) { window.ERP.toast('Please select a payment method', 'error'); return; }
    const method = selectedPaymentMethod;
    const methodLabels = { card:'Card on File', ach:'ACH / Bank', check:'Check', cash:'Cash', link:'Payment Link' };
    let total = 0;
    const ids = [];
    boxes.forEach(b => { total += parseFloat(b.dataset.amount)||0; ids.push(b.value); });
    window.ERP.closeModal();
    window.ERP.toast(`💵 Batch payment of ${fmt$(total)} via ${methodLabels[method]} for ${ids.length} invoice(s) — Pending`, 'success');
    return;
  }

  // Single / prepay
  const amount = document.getElementById('pay-amount')?.value || '0';
  const method = selectedPaymentMethod;

  if (!method) { window.ERP.toast('Please select a payment method', 'error'); return; }

  window.ERP.closeModal();
  const methodLabels = { card:'Card on File', ach:'ACH / Bank', check:'Check', cash:'Cash', link:'Payment Link' };
  const label = methodLabels[method] || method;

  if (method === 'link') {
    window.ERP.toast(`🔗 Payment link sent to ${cust ? cust.email : 'customer'} for ${fmt$(parseFloat(amount))} — Pending`, 'success');
  } else {
    window.ERP.toast(`💵 Payment of ${fmt$(parseFloat(amount))} via ${label} recorded — Pending`, 'success');
  }

  if (isPrepay) {
    prepayCompleted = true;
    orderStep = 4;
    rerender(newOrderPage);
  }
};

// ── Duplicate order (loads cart, step 2 with customer dropdown) ──
window.ERP._duplicateOrder = function(orderId) {
  const order = orderById(orderId);
  if (!order) return;
  selectedCustomer = customerById(order.customer);
  cart = order.items.map(i => ({ productId: i.productId, qty: i.qty }));
  orderStep = 2;
  prepayCompleted = false;
  productSearch = '';
  selectedCategory = 0;
  orderDiscounts = {};
  orderPriceOverrides = {};
  stockOverrides = new Set();
  window.ERP.nav('#/sales/new-order');
};

// ── Edit pending order (loads into cart for modification) ──
window.ERP._editOrder = function(orderId) {
  const order = orderById(orderId);
  if (!order) { window.ERP.toast('Order not found', 'error'); return; }
  if (order.status !== 'Pending') { window.ERP.toast('Only Pending orders can be edited', 'warning'); return; }
  selectedCustomer = customerById(order.customer);
  cart = order.items.map(i => ({ productId: i.productId, qty: i.qty }));
  orderStep = 2;
  prepayCompleted = false;
  productSearch = '';
  selectedCategory = 0;
  orderDiscounts = {};
  orderPriceOverrides = {};
  stockOverrides = new Set();
  window.ERP.toast(`✏️ Editing ${orderId} — adjust items, then submit as updated order`, 'info');
  window.ERP.nav('#/sales/new-order');
};

// ── Custom Report Builder handlers ──
window.ERP._reportAddField = function(fieldId, label) {
  const chip = document.getElementById('rchip-' + fieldId);
  if (chip) { window.ERP.toast('Column already added', 'warning'); return; }
  const zone = document.getElementById('report-cols');
  if (!zone) return;
  const span = document.createElement('span');
  span.id = 'rchip-' + fieldId;
  span.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:var(--primary);color:#fff;border-radius:20px;font-size:0.8rem;font-weight:600';
  span.innerHTML = label + ` <span style="cursor:pointer;opacity:0.8;font-size:0.7rem" onclick="window.ERP._reportRemoveField('${fieldId}')">✕</span>`;
  zone.appendChild(span);
  window.ERP.toast(`Added "${label}" to report`, 'success');
};

window.ERP._reportRemoveField = function(fieldId) {
  const chip = document.getElementById('rchip-' + fieldId);
  if (chip) chip.remove();
};

window.ERP._reportDropField = function(ev) {
  ev.preventDefault();
  // drag-drop is illustrative; clicking chips calls _reportAddField directly
  window.ERP.toast('Drop to add field (use click or drag)', 'info');
};

// ── Print order review ──
window.ERP._printOrderReview = function() {
  window.print();
};
window.ERP._sendOrderReview = function() {
  window.ERP.toast('📧 Order draft sent electronically to customer for acknowledgement', 'success');
};

// ── Print/Send saved order ──
window.ERP._printSavedOrder = function(orderId) {
  window.ERP.toast('🖨️ Opening print view for ' + orderId, 'info');
  window.print();
};
window.ERP._sendSavedOrder = function(orderId) {
  window.ERP.toast('📧 Order ' + orderId + ' sent electronically to customer', 'success');
};

// ── Mobile-specific filter handlers ──
window.ERP._filterCustomersMobile = function(query) {
  const q = query.toLowerCase();
  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) ||
    c.contact.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
  );
  const el = document.getElementById('cust-list-m');
  if (el) el.innerHTML = filtered.length === 0
    ? '<div style="text-align:center;color:var(--text-light);padding:20px;font-size:12px">No customers found.</div>'
    : filtered.map(c => mobileCustomerCard(c)).join('');
};

window.ERP._filterOrdersMobile = function(status) {
  const filtered = status === 'All' ? ORDERS : ORDERS.filter(o => o.status === status);
  const el = document.getElementById('order-list-m');
  if (el) el.innerHTML = filtered.length === 0
    ? '<div style="text-align:center;color:var(--text-light);padding:20px;font-size:12px">No orders found.</div>'
    : filtered.map(o => mobileOrderCard(o)).join('');
};

window.ERP._filterOrderCustomersMobile = function(query) {
  const q = query.toLowerCase();
  const el = document.getElementById('order-cust-list-m');
  if (!el) return;
  const filtered = CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q)
  );
  el.innerHTML = filtered.map(c => {
    const disabled = c.status === 'Hold';
    const isPrepay = c.creditLimit === 0;
    return `<div style="background:#fff;border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:8px;${disabled ? 'opacity:.5;' : 'cursor:pointer;'}" ${disabled ? '' : `onclick="window.ERP._selectOrderCustomer(${c.id})"`}>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:600;font-size:13px">${c.name} <span style="font-size:10px;color:var(--text-light)">${c.code}</span></div>
          ${disabled ? '<div style="font-size:10px;color:var(--red)">🔴 On Hold</div>' : ''}
          ${isPrepay ? '<div style="font-size:10px;color:#b45309">⚠️ Prepay</div>' : ''}
        </div>
        <span style="font-size:11px;color:var(--text-light)">${c.creditLimit > 0 ? 'Tier ' + c.creditTier : 'Prepay'}</span>
      </div>
    </div>`;
  }).join('');
};
