// ===== Accounting Screens =====
import { CUSTOMERS, INVOICES, PAYMENTS, ORDERS, PRODUCTS, CATEGORIES, JOURNAL_ENTRIES, PRICE_LEVELS, USERS, ORDER_CAPS, fmt$, customerName, customerById, productById, invoicesByCustomer, ordersByCustomer, paymentsByCustomer, SALES_PERFORMANCE, CUSTOMER_METRICS, PRODUCT_METRICS, SAVED_VIEWS_SEED } from '../data.js';

export function accountingNav() {
  return [
    { section: 'Accounting', icon: '📊', label: 'Dashboard', page: 'main', default: true },
    { section: 'Accounting', icon: '🛒', label: 'Orders', page: 'orders' },
    { section: 'Accounting', icon: '📄', label: 'Invoices', page: 'invoices', badge: '3', badgeColor: 'orange' },
    { section: 'Accounting', icon: '💳', label: 'Payments', page: 'payments' },
    { section: 'Accounting', icon: '👥', label: 'Customers', page: 'customers' },
    { section: 'Accounting', icon: '📑', label: 'Statements', page: 'statements' },
    { section: 'Explorers', icon: '🔎', label: 'Customer Explorer', page: 'customer-explorer' },
    { section: 'Explorers', icon: '👤', label: 'Sales Rep Explorer', page: 'sales-explorer' },
    { section: 'Explorers', icon: '📦', label: 'Product Explorer', page: 'product-explorer' },
    { section: 'Explorers', icon: '💾', label: 'Saved Views', page: 'saved-views' },
    { section: 'Ledger', icon: '📒', label: 'Journal Entries', page: 'ledger' },
    { section: 'Ledger', icon: '📋', label: 'Chart of Accounts', page: 'coa' },
    { section: 'Tools', icon: '🔔', label: 'Notifications', page: 'notifications' },
    { section: 'Tools', icon: '📈', label: 'Reports', page: 'reports' },
    { section: 'Credit', icon: '🏦', label: 'Credit Mgmt', page: 'credit' },
    { section: 'Credit', icon: '🎛️', label: 'Credit Tiers', page: 'credit-tiers' },
    { section: 'Credit', icon: '🚨', label: 'Flag Rules', page: 'credit-rules' },
    { section: 'Pricing', icon: '🏷️', label: 'Price Levels', page: 'price-levels' },
    { section: 'Pricing', icon: '👥', label: 'Assign Levels', page: 'assign-levels' },
    { section: 'Discounts', icon: '✂️', label: 'Disc. Policies', page: 'disc-policies' },
    { section: 'Discounts', icon: '🔀', label: 'Assign Policies', page: 'assign-disc' },
  ];
}

export function renderAccounting(page) {
  const p = page.split('?')[0];   // strip query string so detail cases match
  switch(p) {
    case 'orders': return ordersPage();
    case 'order-detail': return orderDetailPage();
    case 'invoices': return invoicesPage();
    case 'invoice-detail': return invoiceDetailPage();
    case 'payments': return paymentsPage();
    case 'customers': return acctCustomersPage();
    case 'customer-account': return customerAccountPage();
    case 'statements': return statementsPage();
    case 'statement-detail': return statementDetailPage();
    case 'ledger': return ledgerPage();
    case 'coa': return coaPage();
    case 'notifications': return notificationsPage();
    case 'reports': return acctReportsPage();
    case 'credit': return creditReviewPage();
    case 'credit-tiers': return creditTiersPage();
    case 'credit-rules': return creditRulesPage();
    case 'price-levels': return priceLevelsPage();
    case 'assign-levels': return assignLevelsPage();
    case 'disc-policies': return discPoliciesPage();
    case 'assign-disc': return assignDiscPage();
    case 'customer-explorer': return customerExplorerPage();
    case 'sales-explorer': return salesExplorerPage();
    case 'product-explorer': return productExplorerPage();
    case 'saved-views': return savedViewsPage();
    case 'price-merger': return priceMergerPage();
    default: return dashboardPage();
  }
}

/* ── DASHBOARD ── */
function dashboardPage() {
  const totalAR = INVOICES.filter(i=>i.status!=='Paid').reduce((s,i)=>s+(i.total-i.paid),0);
  const overdue = INVOICES.filter(i=>i.status==='Overdue').reduce((s,i)=>s+(i.total-i.paid),0);
  return `
    <div class="section-title"><h2>📊 Accounting Dashboard</h2><span class="text-light text-sm">Feb 26, 2026</span></div>
    <div class="tiles">
      <div class="tile tile-blue"><div class="tile-label">Total AR</div><div class="tile-value">${fmt$(totalAR)}</div></div>
      <div class="tile tile-green"><div class="tile-label">Collected Today</div><div class="tile-value">${fmt$(420)}</div></div>
      <div class="tile tile-red"><div class="tile-label">Overdue</div><div class="tile-value">${fmt$(overdue)}</div><div class="tile-sub">${INVOICES.filter(i=>i.status==='Overdue').length} invoices</div></div>
      <div class="tile tile-yellow"><div class="tile-label">Pending Invoices</div><div class="tile-value">${INVOICES.filter(i=>i.status==='Open').length}</div></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><h3>⚡ Action Queue</h3></div>
        <div class="warn-box">🔴 <strong>2 overdue invoices</strong> — ${fmt$(overdue)} total past due. <a style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/accounting/invoices')">View →</a></div>
        <div class="warn-box">🟡 <strong>1 partial payment</strong> — Cambridge Catering ${fmt$(2400)} remaining. <a style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/accounting/payments')">Process →</a></div>
        <div class="info-box mt-8">📩 <strong>Statements ready</strong> — 3 customer statements pending for month-end. <a style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/accounting/statements')">Send →</a></div>
      </div>
      <div class="card">
        <h3>Today's Deliveries → Invoices</h3>
        <table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>
          <tr><td>ORD-2601</td><td>Bella Cucina</td><td><span class="badge badge-green">Invoiced</span></td><td style="text-align:right">${fmt$(2845)}</td></tr>
          <tr><td>ORD-2602</td><td>Harbor Grill</td><td><span class="badge badge-orange">In Transit</span></td><td style="text-align:right">${fmt$(1540)}</td></tr>
          <tr><td>ORD-2603</td><td>Ocean Prime</td><td><span class="badge badge-yellow">Picking</span></td><td style="text-align:right">${fmt$(4200)}</td></tr>
        </tbody></table>
      </div>
    </div>
    <div class="card">
      <h3>Recent Journal Entries</h3>
      <table><thead><tr><th>Entry</th><th>Date</th><th>Description</th><th>Debit</th><th>Credit</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${JOURNAL_ENTRIES.slice(0,3).map(j=>`<tr><td><strong>${j.id}</strong></td><td>${j.date}</td><td>${j.desc}</td><td>${j.debit}</td><td>${j.credit}</td><td style="text-align:right">${fmt$(j.amount)}</td></tr>`).join('')}</tbody></table>
    </div>`;
}

/* ── ORDERS (PRE-INVOICE) ── */
function ordersPage() {
  const invoicedOrderIds = new Set(INVOICES.map(i => i.orderId).filter(Boolean));
  const statusBadge = s => {
    const m = { Delivered: 'green', 'Out for Delivery': 'blue', Confirmed: 'blue',
      Picking: 'yellow', Pending: 'orange', Hold: 'red' };
    return `<span class="badge badge-${m[s]||'blue'}">${s}</span>`;
  };
  const payBadge = (ord) => {
    if (invoicedOrderIds.has(ord.id)) {
      const inv = INVOICES.find(i => i.orderId === ord.id);
      if (!inv) return `<span class="badge badge-blue">Invoiced</span>`;
      return invBadge(inv.status);
    }
    if (ord.status === 'Delivered') return `<span class="badge badge-orange">Awaiting Invoice</span>`;
    return `<span class="badge badge-gray" style="background:#e5e7eb;color:#6b7280">Not Yet Invoiced</span>`;
  };
  const invoiceLink = (ord) => {
    const inv = INVOICES.find(i => i.orderId === ord.id);
    return inv
      ? `<a style="color:var(--primary);cursor:pointer;font-size:12px" onclick="window.ERP.nav('#/accounting/invoice-detail?id=${inv.id}')">${inv.id} →</a>`
      : `<span class="text-light text-xs">—</span>`;
  };
  return `
    <div class="section-title"><h2>🛒 Orders</h2>
      <span class="text-light text-sm" style="margin-left:8px">Payment status before invoicing</span>
    </div>
    <div class="search-bar">
      <input placeholder="Search orders…" id="order-search">
      <select id="order-status-filter"><option value="">All Statuses</option><option>Pending</option><option>Confirmed</option><option>Picking</option><option>Out for Delivery</option><option>Delivered</option><option>Hold</option></select>
      <select id="order-pay-filter"><option value="">All Payment States</option><option>Not Yet Invoiced</option><option>Awaiting Invoice</option><option>Open</option><option>Partial</option><option>Paid</option><option>Overdue</option></select>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table id="orders-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Order Date</th><th>Delivery</th><th>Order Status</th><th>Payment Status</th><th style="text-align:right">Amount</th><th>Invoice</th><th></th></tr></thead>
        <tbody>${ORDERS.map(ord => {
          const c = CUSTOMERS.find(c => c.id === ord.customer);
          return `<tr>
            <td><strong style="cursor:pointer;color:var(--primary)" onclick="window.ERP.nav('#/accounting/order-detail?id=${ord.id}')">${ord.id}</strong></td>
            <td><a style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/accounting/customer-account?id=${ord.customer}')">${c ? c.name : ''}</a></td>
            <td>${ord.date}</td>
            <td>${ord.deliveryDate}</td>
            <td>${statusBadge(ord.status)}</td>
            <td>${payBadge(ord)}</td>
            <td style="text-align:right;font-weight:700">${fmt$(ord.total)}</td>
            <td>${invoiceLink(ord)}</td>
            <td><button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/customer-account?id=${ord.customer}')">Customer</button></td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>
    <div class="info-box mt-16">Orders with status <strong>Delivered</strong> and no invoice are flagged as <em>Awaiting Invoice</em>. Once a delivery is confirmed by the driver, an invoice is auto-generated.</div>`;
}

/* ── ORDER DETAIL ── */
function orderDetailPage() {
  const params = new URLSearchParams(location.hash.split('?')[1]||'');
  const ord = ORDERS.find(o=>o.id===params.get('id')) || ORDERS[0];
  const c = CUSTOMERS.find(c=>c.id===ord.customer) || CUSTOMERS[0];
  const inv = INVOICES.find(i=>i.orderId===ord.id);
  const isEditable = ord.status !== 'Delivered' && !inv;
  const statusColor = {Delivered:'green','Out for Delivery':'blue',Confirmed:'blue',Picking:'yellow',Pending:'orange',Hold:'red'};

  const lineItems = ord.items.map(item => {
    const p = PRODUCTS ? PRODUCTS.find(p=>p.id===item.productId) : null;
    const name = p ? `${p.name} ${p.flavor} ${p.size}` : `Product #${item.productId}`;
    const price = p ? p.price : 0;
    const lineTotal = price * item.qty;
    if (isEditable) {
      return `<tr>
        <td>${name}</td>
        <td style="text-align:center"><input class="inline-input edit" type="number" value="${item.qty}" style="width:60px;text-align:center"></td>
        <td style="text-align:right"><input class="inline-input edit" type="number" value="${price.toFixed(2)}" style="width:80px;text-align:right"></td>
        <td style="text-align:right;font-weight:600">${fmt$(lineTotal)}</td>
        <td><button class="btn-outline btn-sm" style="color:var(--red)" onclick="window.ERP.toast('Line removed','')">&times;</button></td>
      </tr>`;
    }
    return `<tr><td>${name}</td><td style="text-align:center">${item.qty}</td><td style="text-align:right">${fmt$(price)}</td><td style="text-align:right;font-weight:600">${fmt$(lineTotal)}</td><td></td></tr>`;
  }).join('');

  return `
    <div style="margin-bottom:16px"><a style="color:var(--primary);cursor:pointer;font-size:13px" onclick="window.ERP.nav('#/accounting/orders')">← Back to Orders</a></div>

    <div class="section-title">
      <h2>🛒 Order ${ord.id}</h2>
      <div style="margin-left:auto;display:flex;gap:8px">
        ${inv ? `<button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/invoice-detail?id=${inv.id}')">📄 View Invoice ${inv.id}</button>` : ''}
        ${isEditable ? `<button class="btn-outline btn-sm" onclick="window.ERP.toast('Changes discarded','')" >Discard</button><button class="btn-primary btn-sm" onclick="window.ERP.toast('Order saved','success')">💾 Save Changes</button>` : ''}
        <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/customer-account?id=${c.id}')">👤 Customer</button>
      </div>
    </div>

    ${!isEditable ? `<div class="info-box mb-16">${inv ? `🔒 Order is invoiced (${inv.id}) — editing disabled. <a style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/accounting/invoice-detail?id=${inv.id}')">Edit invoice instead →</a>` : '🔒 Delivered orders cannot be edited.'}</div>` : '<div class="success-box mb-16">✏️ This order is editable. Changes will recalculate the total.</div>'}

    <div class="grid-2 mb-16" style="grid-template-columns:1fr 280px">
      <div class="card">
        <h3>Line Items</h3>
        <table>
          <thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th><th></th></tr></thead>
          <tbody>${lineItems}</tbody>
          ${isEditable ? `<tfoot><tr><td colspan="5"><button class="btn-outline btn-sm" onclick="window.ERP.toast('Add item — product picker coming','')" >+ Add Item</button></td></tr></tfoot>` : ''}
        </table>
        <div class="inv-total">
          <div>Subtotal: ${fmt$(ord.total * 0.9375)}</div>
          <div>Tax (6.25%): ${fmt$(ord.total * 0.0625)}</div>
          <div style="font-size:18px;font-weight:700;margin-top:8px">Order Total: ${fmt$(ord.total)}</div>
        </div>
        ${isEditable ? `
        <div class="form-group mt-16"><label>Order Notes</label><textarea rows="2" placeholder="Special instructions, delivery notes…"></textarea></div>` : ''}
      </div>

      <div>
        <div class="card">
          <h3>Order Info</h3>
          <div class="form-group"><label>Customer</label>
            <div style="font-weight:600;padding:6px 0">${c.name}</div>
          </div>
          <div class="form-group"><label>Order Status</label>
            ${isEditable
              ? `<select><option ${ord.status==='Pending'?'selected':''}>Pending</option><option ${ord.status==='Confirmed'?'selected':''}>Confirmed</option><option ${ord.status==='Hold'?'selected':''}>Hold</option><option ${ord.status==='Cancelled'?'selected':''}>Cancelled</option></select>`
              : `<span class="badge badge-${statusColor[ord.status]||'blue'}">${ord.status}</span>`
            }
          </div>
          <div class="form-group"><label>Order Date</label>
            ${isEditable ? `<input type="date" value="${ord.date}">` : `<span>${ord.date}</span>`}
          </div>
          <div class="form-group"><label>Delivery Date</label>
            ${isEditable ? `<input type="date" value="${ord.deliveryDate}">` : `<span>${ord.deliveryDate}</span>`}
          </div>
          <div class="form-group"><label>Route</label>
            ${isEditable ? `<select><option>${ord.route}</option><option>Route A-1</option><option>Route B-2</option><option>Route C-3</option></select>` : `<span>${ord.route}</span>`}
          </div>
          <div class="form-group"><label>Salesperson</label>
            ${isEditable ? `<select><option ${ord.salesperson==='Marcus'?'selected':''}>Marcus</option><option ${ord.salesperson==='Nicole'?'selected':''}>Nicole</option></select>` : `<span>${ord.salesperson}</span>`}
          </div>
        </div>
        ${inv ? `<div class="card">
          <h3>Invoice</h3>
          <div class="mb-8">${invBadge(inv.status)}</div>
          <div class="text-sm">Invoice <strong style="cursor:pointer;color:var(--primary)" onclick="window.ERP.nav('#/accounting/invoice-detail?id=${inv.id}')">${inv.id}</strong></div>
          <div class="text-sm text-light">Date: ${inv.date} · Due: ${inv.due}</div>
          <div class="text-sm mt-4">Balance: <strong>${fmt$(inv.total - inv.paid)}</strong></div>
          ${inv.status!=='Paid' ? `<button class="btn-primary btn-sm mt-8" onclick="window.ERP.nav('#/accounting/payments?customer=${c.id}')">💳 Record Payment</button>` : ''}
        </div>` : `<div class="card"><h3>Invoice</h3><div class="text-sm text-light">${ord.status==='Delivered'?'No invoice generated yet.':'Invoice will be created on delivery.'}</div></div>`}
      </div>
    </div>`;
}

/* ── INVOICES ── */
function invoicesPage() {
  return `
    <div class="section-title"><h2>📄 Invoices</h2>
      <div style="margin-left:auto"><button class="btn-primary btn-sm" onclick="window.ERP.toast('Creating invoice…','')">+ New Invoice</button></div>
    </div>
    <div class="search-bar">
      <input placeholder="Search invoices…">
      <select><option>All Status</option><option>Open</option><option>Paid</option><option>Overdue</option><option>Partial</option></select>
      <select><option>All Dates</option><option>This Week</option><option>This Month</option></select>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th>Due</th><th>Status</th><th style="text-align:right">Total</th><th style="text-align:right">Paid</th><th style="text-align:right">Balance</th><th></th></tr></thead>
        <tbody>${INVOICES.map(inv=>{
          const c = CUSTOMERS.find(c=>c.id===inv.customer);
          const bal = inv.total - inv.paid;
          return `<tr class="${inv.status==='Overdue'?'row-danger':inv.status==='Partial'?'row-warn':''}">
            <td><strong style="cursor:pointer;color:var(--primary)" onclick="window.ERP.nav('#/accounting/invoice-detail?id=${inv.id}')">${inv.id}</strong></td>
            <td>${c?c.name:''}</td><td>${inv.date}</td><td>${inv.due}</td>
            <td>${invBadge(inv.status)}</td>
            <td style="text-align:right">${fmt$(inv.total)}</td>
            <td style="text-align:right">${fmt$(inv.paid)}</td>
            <td style="text-align:right;font-weight:700">${bal>0?fmt$(bal):'—'}</td>
            <td>${inv.status!=='Paid'?`<button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/payments')">Pay</button>`:''}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
}

/* ── INVOICE DETAIL ── */
function invoiceDetailPage() {
  const params = new URLSearchParams(location.hash.split('?')[1]||'');
  const inv = INVOICES.find(i=>i.id===params.get('id')) || INVOICES[0];
  const c = CUSTOMERS.find(c=>c.id===inv.customer) || CUSTOMERS[0];
  return `
    <div style="margin-bottom:16px"><a style="color:var(--primary);cursor:pointer;font-size:13px" onclick="window.ERP.nav('#/accounting/invoices')">← Back to Invoices</a></div>
    <div class="section-title"><h2>Invoice ${inv.id}</h2><div style="margin-left:auto;display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="window.ERP.toast('PDF generated','success')">📄 PDF</button>
      <button class="btn-outline btn-sm">🖨 Print</button>
      <button class="btn-outline btn-sm">📧 Email</button>
      ${inv.status!=='Paid'?`<button class="btn-primary btn-sm" onclick="window.ERP.nav('#/accounting/payments?customer=${inv.customer}')">💳 Record Payment</button>`:''}
    </div></div>
    ${inv.orderId ? `<div class="info-box mb-16" style="display:flex;align-items:center;gap:12px">🛒 <span>Generated from order <strong style="cursor:pointer;color:var(--primary)" onclick="window.ERP.nav('#/accounting/orders')">${inv.orderId}</strong> — <a style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/accounting/customer-account?id=${inv.customer}')">View Customer Account →</a></span></div>` : ''}

    <div class="grid-2 mb-16" style="grid-template-columns:1fr 300px">
      <div class="invoice-preview">
        <div class="inv-header">
          <div><h2>📦 WholesaleERP</h2><div class="text-sm text-light">123 Distribution Way<br>Boston, MA 02101</div></div>
          <div style="text-align:right"><div style="font-size:20px;font-weight:700">INVOICE</div><div class="text-sm">${inv.id}</div>
            <div class="text-sm">Date: ${inv.date}</div>
            <div class="text-sm" style="display:flex;align-items:center;gap:6px;justify-content:flex-end">Due: ${!inv.locked ? `<input type="date" value="${inv.due}" style="font-size:12px;padding:2px 4px;border:1px solid #d1d5db;border-radius:4px">` : inv.due}</div>
          </div>
        </div>
        <div class="mb-16"><strong>Bill To:</strong><br>${c.name}<br>${c.loc}<br>${c.contact} · ${c.phone}</div>
        <table>
          <thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th>${!inv.locked?'<th></th>':''}</tr></thead>
          <tbody>
            ${inv.orderId && ORDERS ? (() => {
              const srcOrd = ORDERS.find(o=>o.id===inv.orderId);
              if (!srcOrd) return '';
              return srcOrd.items.map(item => {
                const p = PRODUCTS ? PRODUCTS.find(p=>p.id===item.productId) : null;
                const name = p ? `${p.name} ${p.flavor} ${p.size}` : `Product #${item.productId}`;
                const price = p ? p.price : 0;
                const lineTotal = price * item.qty;
                if (!inv.locked) return `<tr><td>${name}</td><td style="text-align:center"><input class="inline-input edit" type="number" value="${item.qty}" style="width:55px;text-align:center"></td><td style="text-align:right"><input class="inline-input edit" type="number" value="${price.toFixed(2)}" style="width:75px;text-align:right"></td><td style="text-align:right">${fmt$(lineTotal)}</td><td><button class="btn-outline btn-sm" style="color:var(--red)" onclick="window.ERP.toast('Line removed','')">&times;</button></td></tr>`;
                return `<tr><td>${name}</td><td style="text-align:center">${item.qty}</td><td style="text-align:right">${fmt$(price)}</td><td style="text-align:right">${fmt$(lineTotal)}</td></tr>`;
              }).join('');
            })() : `
            <tr><td>Whole Milk 4/1 GAL</td><td style="text-align:center">${!inv.locked?`<input class="inline-input edit" type="number" value="4" style="width:55px;text-align:center">`:4}</td><td style="text-align:right">${!inv.locked?`<input class="inline-input edit" type="number" value="4.29" style="width:75px;text-align:right">`:'$4.29'}</td><td style="text-align:right">$17.16</td>${!inv.locked?'<td><button class="btn-outline btn-sm" style="color:var(--red)" onclick="window.ERP.toast(\"Line removed\",\"\")">×</button></td>':''}</tr>
            <tr><td>Tomatoes Vine-Ripe 25 LB</td><td style="text-align:center">${!inv.locked?`<input class="inline-input edit" type="number" value="2" style="width:55px;text-align:center">`:2}</td><td style="text-align:right">${!inv.locked?`<input class="inline-input edit" type="number" value="28.75" style="width:75px;text-align:right">`:'$28.75'}</td><td style="text-align:right">$57.50</td>${!inv.locked?'<td><button class="btn-outline btn-sm" style="color:var(--red)" onclick="window.ERP.toast(\"Line removed\",\"\")">×</button></td>':''}</tr>
            <tr><td>Chicken Breast 40 LB</td><td style="text-align:center">${!inv.locked?`<input class="inline-input edit" type="number" value="1" style="width:55px;text-align:center">`:1}</td><td style="text-align:right">${!inv.locked?`<input class="inline-input edit" type="number" value="89.50" style="width:75px;text-align:right">`:'$89.50'}</td><td style="text-align:right">$89.50</td>${!inv.locked?'<td><button class="btn-outline btn-sm" style="color:var(--red)" onclick="window.ERP.toast(\"Line removed\",\"\")">×</button></td>':''}</tr>`
            }
          </tbody>
          ${!inv.locked ? `<tfoot><tr><td colspan="5"><button class="btn-outline btn-sm" onclick="window.ERP.toast('Add item — product picker','')" >+ Add Item</button></td></tr></tfoot>` : ''}
        </table>
        <div class="inv-total">
          <div>Subtotal: ${fmt$(inv.total * 0.9375)}</div>
          <div>Tax (6.25%): ${fmt$(inv.total * 0.0625)}</div>
          <div style="font-size:18px;font-weight:700;margin-top:8px">Total: ${fmt$(inv.total)}</div>
          ${inv.paid>0?`<div class="text-green">Paid: ${fmt$(inv.paid)}</div>`:''}
          ${inv.total-inv.paid>0?`<div class="text-red bold">Balance Due: ${fmt$(inv.total-inv.paid)}</div>`:''}
        </div>
        ${!inv.locked ? `<div class="form-group mt-16"><label>Invoice Notes</label><textarea rows="2" placeholder="Notes printed on invoice…"></textarea></div>
        <div style="margin-top:12px"><button class="btn-primary" onclick="window.ERP.toast('Invoice saved','success')">💾 Save Changes</button></div>` : ''}
      </div>
      <div>
        <div class="card">
          <h3>Status</h3>
          <div class="mb-8">${invBadge(inv.status)}</div>
          ${!inv.locked ? `<div class="form-group"><label>Change Status</label><select><option ${inv.status==='Open'?'selected':''}>Open</option><option ${inv.status==='Partial'?'selected':''}>Partial</option><option ${inv.status==='Overdue'?'selected':''}>Overdue</option></select></div>` : ''}
          <div class="text-sm text-light">Invoice is ${inv.locked?'🔒 locked (delivered)':'🔓 editable'}</div>
        </div>
        <div class="card">
          <h3>Journal Entries</h3>
          <div class="info-box mb-8"><strong>JE-0026</strong><br>DR Accounts Receivable ${fmt$(inv.total)}<br>CR Sales Revenue ${fmt$(inv.total)}</div>
          ${inv.paid>0?`<div class="info-box"><strong>JE-0025</strong><br>DR Cash ${fmt$(inv.paid)}<br>CR Accounts Receivable ${fmt$(inv.paid)}</div>`:''}
        </div>
        <div class="card">
          <h3>Payments</h3>
          ${PAYMENTS.filter(p=>p.invoice===inv.id).map(p=>`<div class="success-box mb-8">${p.date} · ${p.method} · ${fmt$(p.amount)}</div>`).join('') || '<div class="text-sm text-light">No payments recorded</div>'}
        </div>
      </div>
    </div>`;
}

/* ── PAYMENTS ── */
function paymentsPage() {
  const params = new URLSearchParams(location.hash.split('?')[1]||'');
  const preselectId = params.get('customer') ? parseInt(params.get('customer')) : null;
  const preselect = preselectId ? CUSTOMERS.find(c => c.id === preselectId) : null;
  const custOptions = CUSTOMERS.map(c=>`<option value="${c.id}" ${c.id===preselectId?'selected':''}>${c.name}${c.balance>0?' — '+fmt$(c.balance)+' balance':''}</option>`).join('');
  const invOptions = preselect
    ? INVOICES.filter(i=>i.customer===preselect.id && i.status!=='Paid').map(i=>`<option value="${i.id}">${i.id} — ${fmt$(i.total-i.paid)} balance (${i.status})</option>`).join('') || '<option>No open invoices</option>'
    : INVOICES.filter(i=>i.status!=='Paid').map(i=>{const c=CUSTOMERS.find(c=>c.id===i.customer);return `<option value="${i.id}">${i.id} — ${c?c.name:''} — ${fmt$(i.total-i.paid)}</option>`;}).join('');
  return `
    <div class="section-title"><h2>💳 Payment Processing</h2>${preselect?`<span class="badge badge-blue" style="margin-left:12px;font-size:13px">Customer: ${preselect.name}</span>`:''}</div>
    <div class="grid-2">
      <div class="card">
        <h3>Record Payment</h3>
        <div class="form-group"><label>Customer</label><select>${custOptions}</select></div>
        <div class="form-group"><label>Invoice</label><select>${invOptions}</select></div>
        <div class="form-row">
          <div class="form-group"><label>Amount</label><input type="number" value="2845.00"></div>
          <div class="form-group"><label>Method</label><select><option>Check</option><option>ACH</option><option>Wire Transfer</option><option>Cash</option><option>Credit Card</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Reference #</label><input placeholder="Check #, wire ref…"></div>
          <div class="form-group"><label>Date</label><input type="date" value="2026-02-26"></div>
        </div>
        <div class="form-group"><label>Notes</label><textarea rows="2" placeholder="Payment notes…"></textarea></div>
        <div style="display:flex;gap:8px">
          <button class="btn-primary" onclick="window.ERP.toast('Payment recorded — journal entry created','success')">💳 Record Payment</button>
          <button class="btn-outline" onclick="window.ERP.toast('Multi-invoice selected','')">Apply to Multiple Invoices</button>
        </div>
      </div>
      <div class="card">
        <h3>Batch Payment</h3>
        <div class="info-box mb-16">Process a single payment across multiple invoices for the same customer.</div>
        <div class="form-group"><label>Customer</label><select><option>Cambridge Catering Co</option></select></div>
        <table><thead><tr><th><input type="checkbox" checked></th><th>Invoice</th><th style="text-align:right">Due</th><th style="text-align:right">Apply</th></tr></thead>
        <tbody>
          <tr><td><input type="checkbox" checked></td><td>INV-4385</td><td style="text-align:right">${fmt$(2400)}</td><td style="text-align:right"><input class="inline-input edit" value="2400.00"></td></tr>
        </tbody>
        <tfoot><tr><td colspan="3"><strong>Total Applied</strong></td><td style="text-align:right"><strong>${fmt$(2400)}</strong></td></tr></tfoot></table>
        <button class="btn-primary mt-8" onclick="window.ERP.toast('Batch payment applied','success')">Process Batch</button>
      </div>
    </div>

    <div class="card">
      <h3>Recent Payments</h3>
      <table><thead><tr><th>Payment</th><th>Customer</th><th>Invoice</th><th>Date</th><th>Method</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${PAYMENTS.map(p=>`<tr><td><strong>${p.id}</strong></td><td>${customerName(p.customer)}</td><td>${p.invoice}</td><td>${p.date}</td><td>${p.method}</td><td style="text-align:right">${fmt$(p.amount)}</td></tr>`).join('')}</tbody></table>
    </div>`;
}

/* ── CUSTOMERS (AGING) ── */
function acctCustomersPage() {
  return `
    <div class="section-title"><h2>👥 Customer Accounts</h2></div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Customer</th><th>Credit Tier</th><th style="text-align:right">Current</th><th style="text-align:right">31-60</th><th style="text-align:right">61-90</th><th style="text-align:right">90+</th><th style="text-align:right">Total</th><th></th></tr></thead>
        <tbody>${CUSTOMERS.filter(c=>c.balance>0).map(c=>{
          const cur=c.balance*0.4,d30=c.balance*0.3,d60=c.balance*0.2,d90=c.balance*0.1;
          return `<tr class="${d90>500?'row-danger':d60>500?'row-warn':''}">
            <td><strong style="cursor:pointer;color:var(--primary)" onclick="window.ERP.nav('#/accounting/customer-account?id=${c.id}')">${c.name}</strong></td>
            <td><span class="badge badge-${c.creditTier==='A'?'green':c.creditTier==='B'?'yellow':'red'}">Tier ${c.creditTier}</span></td>
            <td style="text-align:right">${fmt$(cur)}</td>
            <td style="text-align:right">${fmt$(d30)}</td>
            <td style="text-align:right">${fmt$(d60)}</td>
            <td style="text-align:right;${d90>0?'color:var(--red);font-weight:700':''}">${fmt$(d90)}</td>
            <td style="text-align:right;font-weight:700">${fmt$(c.balance)}</td>
            <td><button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/customer-account?id=${c.id}')">View</button></td>
          </tr>`;
        }).join('')}</tbody>
        <tfoot><tr><th>TOTAL</th><th></th>
          <th style="text-align:right">${fmt$(CUSTOMERS.reduce((s,c)=>s+c.balance*0.4,0))}</th>
          <th style="text-align:right">${fmt$(CUSTOMERS.reduce((s,c)=>s+c.balance*0.3,0))}</th>
          <th style="text-align:right">${fmt$(CUSTOMERS.reduce((s,c)=>s+c.balance*0.2,0))}</th>
          <th style="text-align:right">${fmt$(CUSTOMERS.reduce((s,c)=>s+c.balance*0.1,0))}</th>
          <th style="text-align:right">${fmt$(CUSTOMERS.reduce((s,c)=>s+c.balance,0))}</th>
          <th></th></tr></tfoot>
      </table>
    </div>`;
}

/* ── CUSTOMER ACCOUNT DETAIL ── */
function customerAccountPage() {
  const params = new URLSearchParams(location.hash.split('?')[1]||'');
  const c = CUSTOMERS.find(c=>c.id===parseInt(params.get('id'))) || CUSTOMERS[6];
  const invs = INVOICES.filter(i=>i.customer===c.id);
  const pmts = PAYMENTS.filter(p=>p.customer===c.id);
  const ords = ORDERS.filter(o=>o.customer===c.id);

  // ── Performance metrics ──
  const totalInvoiced = invs.reduce((s,i)=>s+i.total,0);
  const totalPaid = pmts.reduce((s,p)=>s+p.amount,0);
  const openBalance = invs.reduce((s,i)=>s+(i.total-i.paid),0);
  const paidOnTime = pmts.length; // simplified — all completed pmts
  const avgOrderVal = ords.length ? ords.reduce((s,o)=>s+o.total,0)/ords.length : c.avgOrder;
  const overdueInvs = invs.filter(i=>i.status==='Overdue');
  const openInvs = invs.filter(i=>i.status!=='Paid');
  const utilizationPct = c.creditLimit>0 ? Math.round((c.balance/c.creditLimit)*100) : 0;
  const utilizationColor = utilizationPct>85?'red':utilizationPct>60?'yellow':'green';

  // ── Orders not yet invoiced ──
  const invoicedOrderIds = new Set(INVOICES.map(i=>i.orderId).filter(Boolean));
  const uninvoicedOrds = ords.filter(o=>!invoicedOrderIds.has(o.id) && o.status==='Delivered');

  const ordStatusBadge = s => {
    const m={Delivered:'green','Out for Delivery':'blue',Confirmed:'blue',Picking:'yellow',Pending:'orange',Hold:'red'};
    return `<span class="badge badge-${m[s]||'blue'}">${s}</span>`;
  };

  return `
    <div style="margin-bottom:16px"><a style="color:var(--primary);cursor:pointer;font-size:13px" onclick="window.ERP.nav('#/accounting/customers')">← Back to Customers</a></div>

    <div class="section-title">
      <h2>👤 ${c.name}</h2>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/statement-detail?id=${c.id}')">📑 Statement</button>
        <button class="btn-primary btn-sm" onclick="window.ERP.nav('#/accounting/payments?customer=${c.id}')">💳 Record / Charge Payment</button>
      </div>
    </div>

    ${overdueInvs.length ? `<div class="warn-box mb-16">⚠️ <strong>${overdueInvs.length} overdue invoice${overdueInvs.length>1?'s':''}</strong> — ${fmt$(overdueInvs.reduce((s,i)=>s+(i.total-i.paid),0))} past due. Immediate follow-up recommended.</div>` : ''}
    ${uninvoicedOrds.length ? `<div class="info-box mb-16">🛒 <strong>${uninvoicedOrds.length} delivered order${uninvoicedOrds.length>1?'s':''} awaiting invoice</strong> — ${uninvoicedOrds.map(o=>o.id).join(', ')}. <a style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/accounting/orders')">Go to Orders →</a></div>` : ''}

    <!-- Snapshot tiles -->
    <div class="tiles">
      <div class="tile tile-blue"><div class="tile-label">Open Balance</div><div class="tile-value">${fmt$(openBalance)}</div><div class="tile-sub">${openInvs.length} open invoice${openInvs.length!==1?'s':''}</div></div>
      <div class="tile tile-${utilizationColor}"><div class="tile-label">Credit Used</div><div class="tile-value">${c.creditLimit>0?utilizationPct+'%':'Prepay'}</div><div class="tile-sub">${c.creditLimit>0?fmt$(c.balance)+' of '+fmt$(c.creditLimit):c.accountCredit>0?'Credit: '+fmt$(c.accountCredit):'No credit line'}</div></div>
      <div class="tile tile-green"><div class="tile-label">Total Collected</div><div class="tile-value">${fmt$(totalPaid)}</div><div class="tile-sub">${pmts.length} payment${pmts.length!==1?'s':''}</div></div>
      <div class="tile"><div class="tile-label">Avg Order</div><div class="tile-value">${fmt$(avgOrderVal)}</div><div class="tile-sub">${ords.length} orders on file</div></div>
    </div>

    <!-- Performance Snapshot -->
    <div class="card mb-16">
      <h3>📊 Performance Snapshot</h3>
      <div class="stat-grid" style="grid-template-columns:repeat(5,1fr)">
        <div class="stat-item"><div class="text-xs text-light">Customer Since</div><div class="bold">Jan 2024</div></div>
        <div class="stat-item"><div class="text-xs text-light">Account Type</div><div class="bold">${c.type}</div></div>
        <div class="stat-item"><div class="text-xs text-light">Terms</div><div class="bold">${c.terms}</div></div>
        <div class="stat-item"><div class="text-xs text-light">Credit Tier</div><div class="bold"><span class="badge badge-${c.creditTier==='A'?'green':c.creditTier==='B'?'yellow':c.creditTier==='Prepay'?'blue':'red'}">Tier ${c.creditTier}</span></div></div>
        <div class="stat-item"><div class="text-xs text-light">Last Order</div><div class="bold">${c.lastOrder}</div></div>
        <div class="stat-item"><div class="text-xs text-light">Route</div><div class="bold">${c.route||'—'}</div></div>
        <div class="stat-item"><div class="text-xs text-light">Price Level</div><div class="bold">${c.priceLevel}</div></div>
        <div class="stat-item"><div class="text-xs text-light">Total Invoiced</div><div class="bold">${fmt$(totalInvoiced)}</div></div>
        <div class="stat-item"><div class="text-xs text-light">Payment on File</div><div class="bold">${c.hasPaymentOnFile?'✅ Yes':'❌ No'}</div></div>
        <div class="stat-item"><div class="text-xs text-light">Account Credit</div><div class="bold">${c.accountCredit>0?fmt$(c.accountCredit):'—'}</div></div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Orders drill-down -->
      <div class="card">
        <div class="card-header" style="display:flex;align-items:center;justify-content:space-between">
          <h3>🛒 Orders</h3>
          <a style="font-size:12px;color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/accounting/orders')">All Orders →</a>
        </div>
        ${ords.length ? `<table>
          <thead><tr><th>Order</th><th>Date</th><th>Status</th><th style="text-align:right">Amount</th><th>Invoice</th></tr></thead>
          <tbody>${ords.map(o=>{
            const inv=INVOICES.find(i=>i.orderId===o.id);
            return `<tr>
              <td><strong>${o.id}</strong></td>
              <td>${o.date}</td>
              <td>${ordStatusBadge(o.status)}</td>
              <td style="text-align:right">${fmt$(o.total)}</td>
              <td>${inv?`<a style="color:var(--primary);cursor:pointer;font-size:12px" onclick="window.ERP.nav('#/accounting/invoice-detail?id=${inv.id}')">${inv.id}</a>`:'<span class="text-light text-xs">'+(o.status==='Delivered'?'Awaiting Invoice':'—')+'</span>'}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>` : '<div class="text-sm text-light">No orders found for this customer.</div>'}
      </div>

      <!-- Invoices drill-down -->
      <div class="card">
        <div class="card-header" style="display:flex;align-items:center;justify-content:space-between">
          <h3>📄 Invoices</h3>
          <a style="font-size:12px;color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/accounting/invoices')">All Invoices →</a>
        </div>
        ${invs.length ? `<table>
          <thead><tr><th>Invoice</th><th>Date</th><th>Due</th><th>Status</th><th style="text-align:right">Balance</th></tr></thead>
          <tbody>${invs.map(i=>`<tr class="${i.status==='Overdue'?'row-danger':i.status==='Partial'?'row-warn':''}"><td><strong style="cursor:pointer;color:var(--primary)" onclick="window.ERP.nav('#/accounting/invoice-detail?id=${i.id}')">${i.id}</strong></td><td>${i.date}</td><td>${i.due}</td><td>${invBadge(i.status)}</td><td style="text-align:right;font-weight:700">${fmt$(i.total-i.paid)}</td></tr>`).join('')}</tbody>
        </table>` : '<div class="text-sm text-light">No invoices found.</div>'}
      </div>
    </div>

    <!-- Payments history -->
    <div class="card">
      <div class="card-header" style="display:flex;align-items:center;justify-content:space-between">
        <h3>💳 Payment History</h3>
        <button class="btn-primary btn-sm" onclick="window.ERP.nav('#/accounting/payments?customer=${c.id}')">+ Record Payment</button>
      </div>
      ${pmts.length ? `<table>
        <thead><tr><th>Payment</th><th>Date</th><th>Invoice</th><th>Method</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${pmts.map(p=>`<tr><td><strong>${p.id}</strong></td><td>${p.date}</td><td>${p.invoice}</td><td>${p.method}</td><td style="text-align:right;color:var(--green);font-weight:700">${fmt$(p.amount)}</td></tr>`).join('')}</tbody>
      </table>` : '<div class="text-sm text-light">No payments recorded yet.</div>'}
    </div>

    <!-- Notification Automations -->
    <div class="card">
      <div class="card-header" style="display:flex;align-items:center;justify-content:space-between">
        <h3>🔔 Notification Automations</h3>
        <button class="btn-primary btn-sm" onclick="window.ERP.toast('Notification settings saved','success')">💾 Save</button>
      </div>
      <div class="info-box mb-16">These settings override the global dunning rules for this customer only.</div>
      <table style="width:100%">
        <thead><tr><th>Event</th><th style="text-align:center">Enabled</th><th>Delivery</th><th>Timing</th><th>Custom Message</th></tr></thead>
        <tbody>
          <tr>
            <td><strong>Order Confirmation</strong><div class="text-xs text-light">Sent when order is confirmed</div></td>
            <td style="text-align:center"><input type="checkbox" ${c.hasPaymentOnFile?'checked':''}></td>
            <td><select style="font-size:12px"><option>Email</option><option>SMS</option><option>Both</option></select></td>
            <td><span class="text-xs text-light">Immediate</span></td>
            <td><input placeholder="Leave blank for default…" style="font-size:12px;width:100%"></td>
          </tr>
          <tr>
            <td><strong>Invoice Sent</strong><div class="text-xs text-light">Sent when invoice is generated</div></td>
            <td style="text-align:center"><input type="checkbox" checked></td>
            <td><select style="font-size:12px"><option>Email</option><option>SMS</option><option>Both</option></select></td>
            <td><span class="text-xs text-light">Immediate</span></td>
            <td><input placeholder="Leave blank for default…" style="font-size:12px;width:100%"></td>
          </tr>
          <tr>
            <td><strong>Payment Reminder</strong><div class="text-xs text-light">Reminder before due date</div></td>
            <td style="text-align:center"><input type="checkbox" checked></td>
            <td><select style="font-size:12px"><option>Email</option><option>SMS</option><option>Both</option></select></td>
            <td><select style="font-size:12px"><option>3 days before due</option><option>5 days before due</option><option>7 days before due</option><option>1 day before due</option></select></td>
            <td><input placeholder="Leave blank for default…" style="font-size:12px;width:100%"></td>
          </tr>
          <tr>
            <td><strong>1st Overdue Notice</strong><div class="text-xs text-light">After due date passes</div></td>
            <td style="text-align:center"><input type="checkbox" checked></td>
            <td><select style="font-size:12px"><option>Email</option><option>SMS</option><option>Both</option></select></td>
            <td><select style="font-size:12px"><option>1 day after due</option><option>3 days after due</option><option>7 days after due</option></select></td>
            <td><input placeholder="Leave blank for default…" style="font-size:12px;width:100%"></td>
          </tr>
          <tr>
            <td><strong>2nd Overdue / Escalation</strong><div class="text-xs text-light">Escalated follow-up</div></td>
            <td style="text-align:center"><input type="checkbox" ${c.creditTier!=='C'?'checked':''}></td>
            <td><select style="font-size:12px"><option>Email</option><option>SMS</option><option>Both</option></select></td>
            <td><select style="font-size:12px"><option>7 days after due</option><option>14 days after due</option><option>30 days after due</option></select></td>
            <td><input placeholder="Leave blank for default…" style="font-size:12px;width:100%"></td>
          </tr>
          <tr>
            <td><strong>Account Hold Notice</strong><div class="text-xs text-light">When account is placed on hold</div></td>
            <td style="text-align:center"><input type="checkbox" checked></td>
            <td><select style="font-size:12px"><option>Email</option><option>Both</option></select></td>
            <td><span class="text-xs text-light">Immediate</span></td>
            <td><input placeholder="Leave blank for default…" style="font-size:12px;width:100%"></td>
          </tr>
        </tbody>
      </table>
      <div class="form-group mt-16">
        <label>Global Custom Message (this customer)</label>
        <textarea rows="2" placeholder="Prepended to all automated messages for ${c.name}. Leave blank to use company default."></textarea>
      </div>
      <div class="form-group">
        <label>CC Email Address</label>
        <input placeholder="e.g. owner@restaurant.com — copied on all notices" value="${c.email}">
      </div>
    </div>`;  
}

/* ── STATEMENTS ── */
function statementsPage() {
  const rows = CUSTOMERS.map(c => {
    const invs = INVOICES.filter(i => i.customer === c.id);
    const pmts = PAYMENTS.filter(p => p.customer === c.id);
    const totalCharged = invs.reduce((s, i) => s + i.total, 0);
    const totalPaid    = pmts.reduce((s, p) => s + p.amount, 0);
    const balance      = invs.reduce((s, i) => s + (i.total - i.paid), 0);
    const unapplied    = c.accountCredit || 0;
    const overdue      = invs.filter(i => i.status === 'Overdue').reduce((s, i) => s + (i.total - i.paid), 0);
    if (!totalCharged && !totalPaid) return null;
    return { c, totalCharged, totalPaid, balance, unapplied, overdue };
  }).filter(Boolean);

  return `
    <div class="section-title"><h2>📑 Statements</h2>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-outline btn-sm" onclick="window.ERP.toast('Printing all statements…','success')">🖨 Print All</button>
        <button class="btn-primary btn-sm" onclick="window.ERP.toast('Sending statements to all customers…','success')">📩 Send All</button>
      </div>
    </div>
    <div class="info-box mb-16">📅 <strong>Period: February 2026</strong> — Click any customer to view their full statement with transaction drill-down.
      <span style="margin-left:16px">Auto-schedule: 1st &amp; 15th of each month</span>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr>
          <th>Customer</th><th>Terms</th>
          <th style="text-align:right">Charges</th>
          <th style="text-align:right">Payments</th>
          <th style="text-align:right">Unapplied Credit</th>
          <th style="text-align:right">Balance Due</th>
          <th style="text-align:right">Overdue</th>
          <th></th>
        </tr></thead>
        <tbody>
          ${rows.map(({ c, totalCharged, totalPaid, balance, unapplied, overdue }) => `
          <tr class="${overdue > 0 ? 'row-danger' : ''}">
            <td>
              <strong style="cursor:pointer;color:var(--primary)" onclick="window.ERP.nav('#/accounting/statement-detail?id=${c.id}')">${c.name}</strong>
              <div class="text-xs text-light">${c.contact} · ${c.email}</div>
            </td>
            <td><span class="badge badge-${c.terms==='NET-30'?'blue':c.terms==='NET-15'?'yellow':c.terms==='COD'?'orange':'gray'}">${c.terms}</span></td>
            <td style="text-align:right">${fmt$(totalCharged)}</td>
            <td style="text-align:right;color:var(--green)">${totalPaid > 0 ? fmt$(totalPaid) : '—'}</td>
            <td style="text-align:right;color:var(--primary)">${unapplied > 0 ? fmt$(unapplied) : '—'}</td>
            <td style="text-align:right;font-weight:700">${balance > 0 ? fmt$(balance) : '<span class="text-green">✓ Clear</span>'}</td>
            <td style="text-align:right;${overdue > 0 ? 'color:var(--red);font-weight:700' : 'color:#9ca3af'}">${overdue > 0 ? fmt$(overdue) : '—'}</td>
            <td style="white-space:nowrap">
              <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/statement-detail?id=${c.id}')">View</button>
              <button class="btn-outline btn-sm" onclick="window.ERP.toast('Statement sent to ${c.email}','success')">📧</button>
            </td>
          </tr>`).join('')}
        </tbody>
        <tfoot><tr>
          <th colspan="2">TOTAL</th>
          <th style="text-align:right">${fmt$(rows.reduce((s,r)=>s+r.totalCharged,0))}</th>
          <th style="text-align:right">${fmt$(rows.reduce((s,r)=>s+r.totalPaid,0))}</th>
          <th style="text-align:right">${fmt$(rows.reduce((s,r)=>s+r.unapplied,0))}</th>
          <th style="text-align:right">${fmt$(rows.reduce((s,r)=>s+r.balance,0))}</th>
          <th style="text-align:right;color:var(--red)">${fmt$(rows.reduce((s,r)=>s+r.overdue,0))}</th>
          <th></th>
        </tr></tfoot>
      </table>
    </div>`;
}

/* ── STATEMENT DETAIL ── */
function statementDetailPage() {
  const params = new URLSearchParams(location.hash.split('?')[1]||'');
  const c = CUSTOMERS.find(c => c.id === parseInt(params.get('id'))) || CUSTOMERS[0];
  const invs = INVOICES.filter(i => i.customer === c.id);
  const pmts = PAYMENTS.filter(p => p.customer === c.id);
  const unapplied = c.accountCredit || 0;

  // Chronological ledger
  const txns = [
    ...invs.map(i => ({ date: i.date, type: 'Invoice', ref: i.id, desc: `Invoice ${i.id}`, charge: i.total, payment: 0, _inv: i })),
    ...pmts.map(p => ({ date: p.date, type: 'Payment', ref: p.id, desc: `${p.method}${p.ref?' · '+p.ref:''}`, charge: 0, payment: p.amount, _pmt: p })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  let running = 0;
  const ledgerRows = txns.map(t => { running += t.charge - t.payment; return { ...t, running }; });

  const totalCharged = invs.reduce((s, i) => s + i.total, 0);
  const totalPaid    = pmts.reduce((s, p) => s + p.amount, 0);
  const balanceDue   = invs.reduce((s, i) => s + (i.total - i.paid), 0);
  const overdue      = invs.filter(i => i.status === 'Overdue').reduce((s, i) => s + (i.total - i.paid), 0);
  const current      = invs.filter(i => i.status === 'Open').reduce((s, i) => s + (i.total - i.paid), 0);

  return `
    <div style="margin-bottom:16px"><a style="color:var(--primary);cursor:pointer;font-size:13px" onclick="window.ERP.nav('#/accounting/statements')">← Back to Statements</a></div>
    <div class="section-title">
      <h2>📑 ${c.name} — Statement</h2>
      <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <span class="text-light text-sm">As of Feb 27, 2026</span>
        <button class="btn-outline btn-sm" onclick="window.ERP.toast('PDF generated','success')">📄 PDF</button>
        <button class="btn-outline btn-sm">🖨 Print</button>
        <button class="btn-primary btn-sm" onclick="window.ERP.toast('Statement sent to ${c.email}','success')">📧 Email to ${c.contact}</button>
      </div>
    </div>

    <div class="tiles">
      <div class="tile tile-blue"><div class="tile-label">Balance Due</div><div class="tile-value">${fmt$(balanceDue)}</div></div>
      <div class="tile ${overdue>0?'tile-red':''}"><div class="tile-label">Overdue</div><div class="tile-value">${overdue>0?fmt$(overdue):'—'}</div></div>
      <div class="tile tile-green"><div class="tile-label">Total Paid</div><div class="tile-value">${fmt$(totalPaid)}</div></div>
      <div class="tile ${unapplied>0?'tile-blue':''}"><div class="tile-label">Unapplied Credit</div><div class="tile-value">${unapplied>0?fmt$(unapplied):'—'}</div></div>
    </div>

    <div class="grid-2 mt-16" style="grid-template-columns:1fr 280px;align-items:start">
      <!-- Transaction ledger -->
      <div class="card" style="padding:0;overflow:hidden">
        <div style="padding:16px 16px 0;display:flex;justify-content:space-between;align-items:center">
          <h3>📝 Transaction History</h3>
          <span class="text-xs text-light">February 2026</span>
        </div>
        <table style="margin-top:8px">
          <thead><tr>
            <th>Date</th><th>Type</th><th>Reference</th><th>Description</th>
            <th style="text-align:right">Charges</th>
            <th style="text-align:right">Payments</th>
            <th style="text-align:right">Balance</th>
          </tr></thead>
          <tbody>
            ${ledgerRows.length ? ledgerRows.map(t => `
            <tr>
              <td>${t.date}</td>
              <td><span class="badge badge-${t.type==='Invoice'?'blue':'green'}" style="font-size:10px">${t.type}</span></td>
              <td>${t.type==='Invoice'
                ? `<a style="color:var(--primary);cursor:pointer;font-size:12px" onclick="window.ERP.nav('#/accounting/invoice-detail?id=${t.ref}')">${t.ref} →</a>`
                : `<span class="text-sm">${t.ref}</span>`}
              </td>
              <td class="text-sm">${t.desc}${t._inv && t._inv.status!=='Paid' ? ' · '+invBadge(t._inv.status) : ''}</td>
              <td style="text-align:right">${t.charge>0 ? fmt$(t.charge) : ''}</td>
              <td style="text-align:right;color:var(--green)">${t.payment>0 ? fmt$(t.payment) : ''}</td>
              <td style="text-align:right;font-weight:700">${fmt$(t.running)}</td>
            </tr>`).join('') : '<tr><td colspan="7" class="text-center text-light" style="padding:16px">No transactions on record.</td></tr>'}
          </tbody>
          <tfoot>
            <tr style="background:#f9fafb">
              <td colspan="4"><strong>Totals</strong></td>
              <td style="text-align:right;font-weight:700">${fmt$(totalCharged)}</td>
              <td style="text-align:right;font-weight:700;color:var(--green)">${fmt$(totalPaid)}</td>
              <td style="text-align:right;font-weight:700;font-size:15px">${fmt$(balanceDue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Summary sidebar -->
      <div>
        <div class="card">
          <h3>📊 Summary</h3>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;justify-content:space-between"><span class="text-sm">Total Invoiced</span><strong>${fmt$(totalCharged)}</strong></div>
            <div style="display:flex;justify-content:space-between"><span class="text-sm" style="color:var(--green)">Total Payments</span><strong style="color:var(--green)">${fmt$(totalPaid)}</strong></div>
            ${unapplied>0 ? `<div style="display:flex;justify-content:space-between"><span class="text-sm" style="color:var(--primary)">Unapplied Credit</span><strong style="color:var(--primary)">(${fmt$(unapplied)})</strong></div>` : ''}
            <div style="border-top:2px solid var(--border);padding-top:8px;display:flex;justify-content:space-between"><span class="bold">Balance Due</span><strong style="font-size:16px">${fmt$(balanceDue)}</strong></div>
          </div>
        </div>

        <div class="card">
          <h3>📅 Aging</h3>
          <div style="display:flex;flex-direction:column;gap:6px;font-size:13px">
            <div style="display:flex;justify-content:space-between"><span>Current (0-30)</span><strong>${fmt$(current)}</strong></div>
            <div style="display:flex;justify-content:space-between"><span>31–60 days</span><strong class="text-yellow">${fmt$(overdue*0.35)}</strong></div>
            <div style="display:flex;justify-content:space-between"><span>61–90 days</span><strong class="text-orange">${fmt$(overdue*0.4)}</strong></div>
            <div style="display:flex;justify-content:space-between"><span>90+ days</span><strong class="${overdue>0?'text-red':''}">${fmt$(overdue*0.25)}</strong></div>
          </div>
        </div>

        <div class="card">
          <h3>📧 Send Statement</h3>
          <div class="form-group"><label>Method</label>
            <select><option>Email</option><option>Print</option><option>Both</option></select>
          </div>
          <div class="form-group"><label>To</label>
            <input value="${c.email}">
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn-primary" style="flex:1" onclick="window.ERP.toast('Statement sent to ${c.email}','success')">📧 Send</button>
            <button class="btn-outline" onclick="window.ERP.toast('PDF saved','success')">📄 PDF</button>
          </div>
          ${unapplied>0 ? `<div class="info-box mt-8">💰 ${fmt$(unapplied)} unapplied credit on account. <a style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/accounting/payments?customer=${c.id}')">Apply now →</a></div>` : ''}
          ${balanceDue>0 && c.status !== 'Hold' ? `<button class="btn-outline mt-8" style="width:100%" onclick="window.ERP.nav('#/accounting/payments?customer=${c.id}')">💳 Record Payment</button>` : ''}
        </div>
      </div>
    </div>`;
}

/* ── LEDGER ── */
function ledgerPage() {
  return `
    <div class="section-title"><h2>📒 Journal Entries</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP.toast('New journal entry form','')">+ New Entry</button>
    </div>
    <div class="search-bar"><input placeholder="Search entries…"><select><option>All Types</option><option>Sales</option><option>Payments</option><option>Adjustments</option></select></div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Entry</th><th>Date</th><th>Description</th><th>Debit Account</th><th>Credit Account</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${JOURNAL_ENTRIES.map(j=>`<tr><td><strong>${j.id}</strong></td><td>${j.date}</td><td>${j.desc}</td><td>${j.debit}</td><td>${j.credit}</td><td style="text-align:right">${fmt$(j.amount)}</td></tr>`).join('')}</tbody>
      </table>
    </div>
    <div class="info-box mt-16">📌 Double-entry bookkeeping: every transaction has equal debit and credit entries. Invoices auto-generate journal entries on delivery confirmation.</div>`;
}

/* ── CHART OF ACCOUNTS ── */
function coaPage() {
  const accounts = [
    { num: '1000', name: 'Cash', type: 'Asset', bal: 45200 },
    { num: '1100', name: 'Accounts Receivable', type: 'Asset', bal: 76350 },
    { num: '1200', name: 'Inventory', type: 'Asset', bal: 128500 },
    { num: '1500', name: 'Equipment', type: 'Asset', bal: 35000 },
    { num: '2000', name: 'Accounts Payable', type: 'Liability', bal: 42100 },
    { num: '2100', name: 'Sales Tax Payable', type: 'Liability', bal: 3850 },
    { num: '3000', name: 'Owner Equity', type: 'Equity', bal: 150000 },
    { num: '4000', name: 'Sales Revenue', type: 'Revenue', bal: 312400 },
    { num: '4100', name: 'Returns & Allowances', type: 'Revenue', bal: -2100 },
    { num: '5000', name: 'Cost of Goods Sold', type: 'Expense', bal: 198500 },
    { num: '5100', name: 'Delivery Expense', type: 'Expense', bal: 18600 },
    { num: '5200', name: 'Warehouse Operations', type: 'Expense', bal: 12400 },
  ];
  return `
    <div class="section-title"><h2>📋 Chart of Accounts</h2></div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Account #</th><th>Account Name</th><th>Type</th><th style="text-align:right">Balance</th></tr></thead>
        <tbody>${accounts.map(a=>`<tr>
          <td><code>${a.num}</code></td><td><strong>${a.name}</strong></td>
          <td><span class="badge badge-${a.type==='Asset'?'blue':a.type==='Liability'?'red':a.type==='Equity'?'purple':a.type==='Revenue'?'green':'orange'}">${a.type}</span></td>
          <td style="text-align:right">${fmt$(Math.abs(a.bal))}${a.bal<0?' CR':''}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

/* ── AI REVIEW ── */
function aiReviewPage() {
  return `
    <div class="section-title"><h2>🤖 AI Invoice Review</h2></div>
    <div class="info-box mb-16">AI scans today's invoices for anomalies — pricing errors, unusual quantities, credit limit risks.</div>
    <div class="grid-2">
      <div class="card card-border-warn">
        <h3>⚠️ Flagged Items (2)</h3>
        <div class="warn-box">🔴 <strong>ORD-2605 — Cambridge Catering</strong><br>Would exceed credit limit by $1,100. Customer on Tier C (COD). <br><br>
          <div style="display:flex;gap:8px"><button class="btn-outline btn-sm">Hold Order</button><button class="btn-primary btn-sm">Override & Approve</button></div>
        </div>
        <div class="warn-box">🟡 <strong>ORD-2603 — Ocean Prime</strong><br>NY Strip Steak quantity 2 cases is 3× the customer's average. May be data entry error.<br><br>
          <div style="display:flex;gap:8px"><button class="btn-outline btn-sm">Flag for Review</button><button class="btn-primary btn-sm">Approve as-is</button></div>
        </div>
      </div>
      <div class="card">
        <h3>✅ Clean Batch (6 invoices)</h3>
        <div class="success-box mb-8">All within normal parameters — no action needed.</div>
        <table style="font-size:12px"><tbody>
          <tr><td>INV-4401 Bella Cucina</td><td style="text-align:right">${fmt$(2845)}</td><td><span class="text-green">✓</span></td></tr>
          <tr><td>INV-4402 Tony's Pizza</td><td style="text-align:right">${fmt$(650)}</td><td><span class="text-green">✓</span></td></tr>
          <tr><td>INV-4403 Sunrise Bakery</td><td style="text-align:right">${fmt$(420)}</td><td><span class="text-green">✓</span></td></tr>
          <tr><td>INV-4404 Harbor Grill</td><td style="text-align:right">${fmt$(1540)}</td><td><span class="text-green">✓</span></td></tr>
          <tr><td>INV-4405 Fresh Market</td><td style="text-align:right">${fmt$(875)}</td><td><span class="text-green">✓</span></td></tr>
          <tr><td>INV-4406 Sunrise Bakery</td><td style="text-align:right">${fmt$(420)}</td><td><span class="text-green">✓</span></td></tr>
        </tbody></table>
        <button class="btn-success mt-8 w-full" onclick="window.ERP.toast('Batch approved','success')">✅ Approve Clean Batch</button>
      </div>
    </div>`;
}

/* ── NOTIFICATIONS / DUNNING ── */
function notificationsPage() {
  return `
    <div class="section-title"><h2>🔔 Notifications & Dunning</h2></div>
    <div class="grid-2">
      <div class="card">
        <h3>Dunning Rules</h3>
        <table><thead><tr><th>Days Overdue</th><th>Action</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>1 day</td><td>Friendly reminder email</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>7 days</td><td>Past due notice + email to salesperson</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>15 days</td><td>Late fee warning + manager alert</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>30 days</td><td>Account hold + COD enforced</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>60 days</td><td>Collections escalation</td><td><span class="badge badge-yellow">Draft</span></td></tr>
        </tbody></table>
        <button class="btn-outline btn-sm mt-8" onclick="window.ERP.toast('Editing dunning rules…','')">✏️ Edit Rules</button>
      </div>
      <div class="card">
        <h3>Notification Log</h3>
        <table><thead><tr><th>Date</th><th>Customer</th><th>Type</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Feb 26</td><td>Green Leaf Cafe</td><td>30-day hold notice</td><td><span class="badge badge-green">Sent</span></td></tr>
          <tr><td>Feb 26</td><td>Cambridge Catering</td><td>7-day past due</td><td><span class="badge badge-green">Sent</span></td></tr>
          <tr><td>Feb 25</td><td>Fresh Market Deli</td><td>1-day reminder</td><td><span class="badge badge-green">Sent</span></td></tr>
          <tr><td>Feb 20</td><td>Green Leaf Cafe</td><td>15-day warning</td><td><span class="badge badge-green">Sent</span></td></tr>
        </tbody></table>
      </div>
    </div>`;
}

/* ── REPORTS ── */
function acctReportsPage() {
  return `
    <div class="section-title"><h2>📈 Accounting Reports</h2></div>
    <div class="grid-3">
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">📊</div><h3>Aging Report</h3><p class="text-sm text-light">AR aging by customer/bucket</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">💰</div><h3>Revenue Summary</h3><p class="text-sm text-light">Revenue by period/customer</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">📄</div><h3>Invoice Register</h3><p class="text-sm text-light">All invoices with status</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">💳</div><h3>Payment Report</h3><p class="text-sm text-light">Collections by period</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">📒</div><h3>Trial Balance</h3><p class="text-sm text-light">All account balances</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">📑</div><h3>P&L Statement</h3><p class="text-sm text-light">Revenue minus expenses</p></div>
    </div>
    <div class="card">
      <h3>AR Aging Summary</h3>
      <div class="stat-grid">
        <div class="stat-item"><div class="text-xs text-light">Current</div><div class="bold" style="font-size:18px">${fmt$(30540)}</div></div>
        <div class="stat-item"><div class="text-xs text-light">31-60</div><div class="bold text-yellow" style="font-size:18px">${fmt$(22905)}</div></div>
        <div class="stat-item"><div class="text-xs text-light">61-90</div><div class="bold text-orange" style="font-size:18px">${fmt$(15270)}</div></div>
        <div class="stat-item"><div class="text-xs text-light">90+</div><div class="bold text-red" style="font-size:18px">${fmt$(7635)}</div></div>
      </div>
    </div>`;
}

function invBadge(s) {
  const m = { Open: 'blue', Paid: 'green', Overdue: 'red', Partial: 'orange' };
  return `<span class="badge badge-${m[s]||'blue'}">${s}</span>`;
}

/* ═══════════════════════════════════════════════════════════════
   CREDIT MANAGEMENT
   ═══════════════════════════════════════════════════════════════ */

// ── In-memory demo state (persists while tab is open) ──
window._creditTiers = window._creditTiers || [
  { id: 'A',      label: 'Tier A — Premium',  color: 'green',  limitMin: 20000, limitMax: 100000, terms: 'NET-30', description: 'Long-standing customers, excellent payment history.',       autoApprove: true  },
  { id: 'B',      label: 'Tier B — Standard', color: 'yellow', limitMin: 5000,  limitMax: 25000,  terms: 'NET-15', description: 'Good customers with occasional late payments.',              autoApprove: false },
  { id: 'C',      label: 'Tier C — Monitored',color: 'orange', limitMin: 2000,  limitMax: 10000,  terms: 'COD',    description: 'Customers with elevated risk — orders require review.',     autoApprove: false },
  { id: 'Prepay', label: 'Tier Prepay',        color: 'blue',   limitMin: 0,     limitMax: 0,      terms: 'Prepay', description: 'Prepaid only — no credit extension, account credits allowed.', autoApprove: false },
];

window._creditRules = window._creditRules || [
  { id: 1, name: 'High Utilization',     field: 'utilization', op: '>',  value: 85, action: 'flag',    severity: 'warn',    active: true  },
  { id: 2, name: 'Over Limit',           field: 'utilization', op: '>',  value: 100, action: 'hold',   severity: 'danger',  active: true  },
  { id: 3, name: 'Overdue Balance',      field: 'overdueDays', op: '>',  value: 30,  action: 'flag',   severity: 'warn',    active: true  },
  { id: 4, name: 'Severely Overdue',     field: 'overdueDays', op: '>',  value: 60,  action: 'lock',   severity: 'danger',  active: true  },
  { id: 5, name: 'No Payment on File',   field: 'noPayment',   op: '==', value: 1,   action: 'flag',   severity: 'info',    active: false },
  { id: 6, name: 'Balance Under Limit',  field: 'utilization', op: '<',  value: 20,  action: 'upgrade',severity: 'success', active: false },
];

window._creditOverrides = window._creditOverrides || {}; // { custId: { tier, limit, locked, note, ts } }

// ── helpers ──
function evalCustomerCredit(c) {
  const overdueInvs = INVOICES.filter(i => i.customer === c.id && i.status === 'Overdue');
  const utilization = c.creditLimit > 0 ? Math.round((c.balance / c.creditLimit) * 100) : (c.balance > 0 ? 999 : 0);
  const overdueDays = overdueInvs.length ? 35 : 0; // demo: overdue = 35d past due
  const noPayment   = c.hasPaymentOnFile ? 0 : 1;
  const flags = [];
  const ov = window._creditOverrides[c.id] || {};
  const effectiveTier = ov.tier || c.creditTier;
  const locked = !!(ov.locked);

  for (const rule of window._creditRules.filter(r => r.active)) {
    const fieldVal = rule.field === 'utilization' ? utilization
                   : rule.field === 'overdueDays' ? overdueDays
                   : rule.field === 'noPayment'   ? noPayment : 0;
    const triggered = rule.op === '>' ? fieldVal > rule.value
                    : rule.op === '<' ? fieldVal < rule.value
                    : fieldVal == rule.value;
    if (triggered) flags.push({ rule, fieldVal });
  }
  return { utilization, overdueDays, noPayment, flags, effectiveTier, locked };
}

/* ── CREDIT REVIEW QUEUE ── */
function creditReviewPage() {
  const tlabel = t => { const tier = window._creditTiers.find(x=>x.id===t); return tier?tier.label:t; };
  const rows = CUSTOMERS.map(c => ({ c, ev: evalCustomerCredit(c) }));
  const flagged  = rows.filter(r => r.ev.flags.length > 0);
  const locked   = rows.filter(r => r.ev.locked);
  const clean    = rows.filter(r => r.ev.flags.length === 0 && !r.ev.locked);

  const severityBadge = sev => ({
    danger:  '<span class="badge badge-red">🔴 Critical</span>',
    warn:    '<span class="badge badge-orange">🟡 Warning</span>',
    info:    '<span class="badge badge-blue">🔵 Info</span>',
    success: '<span class="badge badge-green">🟢 Upgrade</span>',
  }[sev] || sev);

  const tierBadge = t => {
    const tier = window._creditTiers.find(x=>x.id===t);
    return `<span class="badge badge-${tier?tier.color:'blue'}">${t}</span>`;
  };

  const actionBtns = (c, ev) => {
    const prepay = ev.effectiveTier === 'Prepay';
    const lockBtn = ev.locked
      ? `<button class="btn-outline btn-sm" style="color:var(--green)" onclick="window.ERP._creditUnlock(${c.id})">🔓 Unlock</button>`
      : `<button class="btn-outline btn-sm" style="color:var(--red)" onclick="window.ERP._creditLock(${c.id})">🔒 Lock Prepay Only</button>`;
    return `
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        <button class="btn-primary btn-sm" onclick="window.ERP._creditAdjust(${c.id})">✏️ Adjust</button>
        ${lockBtn}
        <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/customer-account?id=${c.id}')">👤 Profile</button>
      </div>`;
  };

  return `
    <div class="section-title">
      <h2>🏦 Credit Management — Review Queue</h2>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/credit-tiers')">🎛️ Manage Tiers</button>
        <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/credit-rules')">🚨 Flag Rules</button>
      </div>
    </div>

    <div class="tiles">
      <div class="tile tile-red"><div class="tile-label">Flagged</div><div class="tile-value">${flagged.length}</div><div class="tile-sub">Require review</div></div>
      <div class="tile tile-orange"><div class="tile-label">Locked Prepay</div><div class="tile-value">${locked.length}</div><div class="tile-sub">Prepaid orders only</div></div>
      <div class="tile tile-green"><div class="tile-label">In Good Standing</div><div class="tile-value">${clean.length}</div><div class="tile-sub">No active flags</div></div>
      <div class="tile tile-blue"><div class="tile-label">Active Tiers</div><div class="tile-value">${window._creditTiers.length}</div><div class="tile-sub">Defined</div></div>
    </div>

    ${flagged.length ? `
    <div class="card">
      <div class="card-header"><h3>🚨 Flagged Customers</h3><span class="text-sm text-light">${flagged.length} need attention</span></div>
      <table>
        <thead><tr><th>Customer</th><th>Tier</th><th>Balance / Limit</th><th>Utilization</th><th>Flags</th><th>Action</th></tr></thead>
        <tbody>${flagged.map(({c,ev})=>{
          const worstSev = ev.flags.reduce((a,f)=>({danger:4,warn:3,info:2,success:1}[f.rule.severity]||0) > ({danger:4,warn:3,info:2,success:1}[a]||0) ? f.rule.severity : a, 'info');
          const uColor = ev.utilization>100?'red':ev.utilization>85?'orange':ev.utilization>60?'yellow':'green';
          return `<tr>
            <td><strong>${c.name}</strong><div class="text-xs text-light">${c.code}</div></td>
            <td>${tierBadge(ev.effectiveTier)}${ev.locked?'<span class="badge badge-red" style="margin-left:4px">🔒 Locked</span>':''}</td>
            <td><span style="font-size:13px">${fmt$(c.balance)}</span><span class="text-light text-xs"> / ${c.creditLimit>0?fmt$(c.creditLimit):'Prepay'}</span></td>
            <td><span style="color:var(--${uColor})">${ev.utilization>0?ev.utilization+'%':'—'}</span></td>
            <td>${ev.flags.map(f=>severityBadge(f.rule.severity)+' <span class="text-xs">'+ f.rule.name +'</span>').join('<br>')}</td>
            <td>${actionBtns(c, ev)}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>` : `<div class="info-box">✅ No customers are currently flagged — all accounts are in good standing.</div>`}

    ${locked.length ? `
    <div class="card">
      <div class="card-header"><h3>🔒 Locked to Prepay</h3><span class="text-sm text-light">Prepaid orders only — no credit extended</span></div>
      <table>
        <thead><tr><th>Customer</th><th>Original Tier</th><th>Locked By</th><th>Note</th><th>Action</th></tr></thead>
        <tbody>${locked.map(({c,ev})=>{
          const ov = window._creditOverrides[c.id]||{};
          return `<tr>
            <td><strong>${c.name}</strong></td>
            <td>${tierBadge(c.creditTier)}</td>
            <td><span class="text-sm">${ov.by||'Lisa Chen'}</span><div class="text-xs text-light">${ov.ts||'Feb 26, 2026'}</div></td>
            <td class="text-sm text-light">${ov.note||'—'}</td>
            <td><button class="btn-outline btn-sm" style="color:var(--green)" onclick="window.ERP._creditUnlock(${c.id})">🔓 Unlock</button></td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>` : ''}

    <div class="card">
      <div class="card-header"><h3>✅ All Customers — Credit Snapshot</h3></div>
      <table>
        <thead><tr><th>Customer</th><th>Tier</th><th>Limit</th><th>Balance</th><th>Utilization</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows.map(({c,ev})=>{
          const uColor = ev.utilization>100?'red':ev.utilization>85?'orange':ev.utilization>60?'yellow':'green';
          const statusLabel = ev.locked ? '<span class="badge badge-red">🔒 Locked</span>'
                            : ev.flags.length ? '<span class="badge badge-orange">⚠️ Flagged</span>'
                            : '<span class="badge badge-green">✓ OK</span>';
          return `<tr>
            <td><strong>${c.name}</strong></td>
            <td>${tierBadge(ev.effectiveTier)}</td>
            <td class="text-right">${c.creditLimit>0?fmt$(c.creditLimit):'—'}</td>
            <td class="text-right">${fmt$(c.balance)}</td>
            <td style="color:var(--${uColor})">${c.creditLimit>0?ev.utilization+'%':'N/A'}</td>
            <td>${statusLabel}</td>
            <td><button class="btn-outline btn-sm" onclick="window.ERP._creditAdjust(${c.id})">✏️ Adjust</button></td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
}

/* ── CREDIT TIERS ── */
function creditTiersPage() {
  const tierBadge = t => `<span class="badge badge-${t.color}">${t.id}</span>`;
  return `
    <div class="section-title">
      <h2>🎛️ Credit Tiers</h2>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-primary btn-sm" onclick="window.ERP._creditNewTier()">＋ New Tier</button>
        <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/credit')">← Review Queue</button>
      </div>
    </div>

    <div class="info-box mb-16">💡 <strong>Credit tiers</strong> define credit limits, payment terms, and order approval rules for each class of customer. Assign a tier to a customer from the Review Queue or from their account profile.</div>

    <div style="display:flex;flex-direction:column;gap:16px">
      ${window._creditTiers.map((tier, idx) => `
      <div class="card" style="border-left:4px solid var(--${tier.color})">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px">
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              ${tierBadge(tier)}
              <h3 style="margin:0">${tier.label}</h3>
              ${tier.autoApprove ? '<span class="badge badge-green" style="font-size:11px">Auto-Approve Orders</span>' : ''}
            </div>
            <p class="text-sm" style="margin:0 0 12px">${tier.description}</p>
            <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
              <div class="stat-item"><div class="text-xs text-light">Terms</div><div class="bold">${tier.terms}</div></div>
              <div class="stat-item"><div class="text-xs text-light">Min Limit</div><div class="bold">${tier.limitMin>0?fmt$(tier.limitMin):'N/A'}</div></div>
              <div class="stat-item"><div class="text-xs text-light">Max Limit</div><div class="bold">${tier.limitMax>0?fmt$(tier.limitMax):'N/A'}</div></div>
              <div class="stat-item"><div class="text-xs text-light">Customers</div><div class="bold">${CUSTOMERS.filter(c=>(window._creditOverrides[c.id]||{}).tier===tier.id || (!(window._creditOverrides[c.id]||{}).tier && c.creditTier===tier.id)).length}</div></div>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button class="btn-outline btn-sm" onclick="window.ERP._creditEditTier(${idx})">✏️ Edit</button>
            ${tier.id !== 'Prepay' ? `<button class="btn-outline btn-sm" style="color:var(--red)" onclick="window.ERP._creditDeleteTier(${idx})">🗑 Delete</button>` : ''}
          </div>
        </div>
      </div>`).join('')}
    </div>

    <!-- Tier Assignment quick table -->
    <div class="card mt-16">
      <div class="card-header"><h3>👥 Customer Tier Assignments</h3><span class="text-sm text-light">Quick reassign</span></div>
      <table>
        <thead><tr><th>Customer</th><th>Current Tier</th><th>Override?</th><th>Assign Tier</th></tr></thead>
        <tbody>${CUSTOMERS.map(c=>{
          const ov = window._creditOverrides[c.id]||{};
          return `<tr>
            <td><strong>${c.name}</strong><span class="text-xs text-light" style="margin-left:6px">${c.code}</span></td>
            <td><span class="badge badge-${(window._creditTiers.find(t=>t.id===(ov.tier||c.creditTier))||{color:'blue'}).color}">${ov.tier||c.creditTier}</span>${ov.tier&&ov.tier!==c.creditTier?'<span class="text-xs text-orange" style="margin-left:4px">overridden</span>':''}</td>
            <td class="text-sm">${ov.tier ? (ov.by||'Lisa Chen') : '<span class="text-light">—</span>'}</td>
            <td>
              <select onchange="window.ERP._creditAssignTier(${c.id}, this.value)" style="padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px">
                ${window._creditTiers.map(t=>`<option value="${t.id}" ${(ov.tier||c.creditTier)===t.id?'selected':''}>${t.label}</option>`).join('')}
              </select>
            </td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
}

/* ── CREDIT FLAG RULES ── */
function creditRulesPage() {
  const SevBadge = s => ({
    danger:  '<span class="badge badge-red">🔴 Critical</span>',
    warn:    '<span class="badge badge-orange">🟡 Warning</span>',
    info:    '<span class="badge badge-blue">🔵 Info</span>',
    success: '<span class="badge badge-green">🟢 Upgrade</span>',
  }[s] || s);
  const ActionLabel = a => ({ flag:'Flag for Review', hold:'Place on Hold', lock:'Lock to Prepay Only', upgrade:'Suggest Credit Upgrade' }[a] || a);
  const FieldLabel  = f => ({ utilization:'Credit Utilization %', overdueDays:'Days Overdue', noPayment:'No Payment on File' }[f] || f);

  return `
    <div class="section-title">
      <h2>🚨 Credit Flag Rules</h2>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-primary btn-sm" onclick="window.ERP._creditNewRule()">＋ New Rule</button>
        <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/credit')">← Review Queue</button>
      </div>
    </div>

    <div class="info-box mb-16">💡 <strong>Flag rules</strong> are evaluated against every customer's account. When triggered, the customer is surfaced in the Review Queue with the appropriate severity and recommended action. Rules with <em>Lock to Prepay Only</em> restrict the customer to prepaid orders until manually reviewed.</div>

    <div class="card">
      <table>
        <thead><tr><th>Rule Name</th><th>Condition</th><th>Action</th><th>Severity</th><th>Status</th><th></th></tr></thead>
        <tbody>${window._creditRules.map((rule, idx) => `
          <tr>
            <td><strong>${rule.name}</strong></td>
            <td class="text-sm">${FieldLabel(rule.field)} ${rule.op} ${rule.value}${rule.field==='utilization'?'%':rule.field==='noPayment'?' (true)':' days'}</td>
            <td class="text-sm">${ActionLabel(rule.action)}</td>
            <td>${SevBadge(rule.severity)}</td>
            <td>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
                <input type="checkbox" ${rule.active?'checked':''} onchange="window.ERP._creditToggleRule(${idx},this.checked)">
                <span class="text-sm">${rule.active?'Active':'Inactive'}</span>
              </label>
            </td>
            <td>
              <div style="display:flex;gap:4px">
                <button class="btn-outline btn-sm" onclick="window.ERP._creditEditRule(${idx})">✏️ Edit</button>
                <button class="btn-outline btn-sm" style="color:var(--red)" onclick="window.ERP._creditDeleteRule(${idx})">🗑</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <!-- Simulation preview -->
    <div class="card mt-16">
      <div class="card-header"><h3>🔍 Rule Preview — Current Customer Portfolio</h3><span class="text-sm text-light">Based on active rules</span></div>
      <table>
        <thead><tr><th>Customer</th><th>Utilization</th><th>Triggered Rules</th><th>Recommended Action</th></tr></thead>
        <tbody>${CUSTOMERS.map(c=>{
          const ev = evalCustomerCredit(c);
          const uColor = ev.utilization>100?'red':ev.utilization>85?'orange':ev.utilization>60?'yellow':'green';
          if (!ev.flags.length) return `<tr><td>${c.name}</td><td style="color:var(--green)">${c.creditLimit>0?ev.utilization+'%':'N/A'}</td><td class="text-sm text-light">No active flags</td><td class="text-sm text-green">✓ None</td></tr>`;
          const worst = ev.flags.reduce((a,f)=>({lock:4,hold:3,flag:2,upgrade:1}[f.rule.action]||0) > ({lock:4,hold:3,flag:2,upgrade:1}[a]||0) ? f.rule.action : a, 'flag');
          return `<tr>
            <td><strong>${c.name}</strong></td>
            <td style="color:var(--${uColor})">${c.creditLimit>0?ev.utilization+'%':'—'}</td>
            <td>${ev.flags.map(f=>'<span class="text-xs">'+f.rule.name+'</span>').join(', ')}</td>
            <td><span class="text-sm bold">${ActionLabel(worst)}</span></td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
    </div>`;
}

// ── Credit action handlers (attached to window.ERP) ──
(function initCreditHandlers() {
  const refresh = () => window.ERP.nav('#/accounting/credit');
  const refreshTiers = () => window.ERP.nav('#/accounting/credit-tiers');
  const refreshRules = () => window.ERP.nav('#/accounting/credit-rules');

  window.ERP._creditLock = function(custId) {
    const c = CUSTOMERS.find(c=>c.id===custId);
    if (!c) return;
    const note = prompt(`Lock "${c.name}" to Prepaid orders only?\nEnter a note (optional):`, '') ;
    if (note === null) return; // cancelled
    window._creditOverrides[custId] = Object.assign(window._creditOverrides[custId]||{}, {
      locked: true, by: 'Lisa Chen', ts: 'Feb 27, 2026', note
    });
    window.ERP.toast(`🔒 ${c.name} locked to Prepay Only`, 'warn');
    refresh();
  };

  window.ERP._creditUnlock = function(custId) {
    const c = CUSTOMERS.find(c=>c.id===custId);
    if (!c) return;
    if (!confirm(`Unlock "${c.name}" and restore credit terms?`)) return;
    if (window._creditOverrides[custId]) window._creditOverrides[custId].locked = false;
    window.ERP.toast(`🔓 ${c.name} unlocked`, 'success');
    refresh();
  };

  window.ERP._creditAdjust = function(custId) {
    const c = CUSTOMERS.find(c=>c.id===custId);
    if (!c) return;
    const ov = window._creditOverrides[custId] || {};
    const currentTier = ov.tier || c.creditTier;
    const currentLimit = ov.creditLimit || c.creditLimit;
    const tierOptions = window._creditTiers.map(t => t.id).join(' / ');
    const newTier = prompt(`Adjust credit for "${c.name}"\nCurrent Tier: ${currentTier}\nAvailable tiers: ${tierOptions}\n\nNew tier (leave blank to keep):`, currentTier);
    if (newTier === null) return;
    const matchedTier = window._creditTiers.find(t => t.id === newTier.trim());
    if (newTier.trim() && !matchedTier) { alert('Unknown tier. Available: ' + tierOptions); return; }
    const newLimitStr = prompt(`New credit limit (current: ${fmt$(currentLimit)}):\nEnter amount or leave blank to keep:`, currentLimit);
    if (newLimitStr === null) return;
    const newLimit = newLimitStr.trim() ? parseFloat(newLimitStr.replace(/[^0-9.]/g,'')) : currentLimit;
    const note = prompt('Note for this adjustment:', '');
    if (note === null) return;
    window._creditOverrides[custId] = Object.assign(window._creditOverrides[custId]||{}, {
      tier: newTier.trim() || currentTier,
      creditLimit: isNaN(newLimit) ? currentLimit : newLimit,
      by: 'Lisa Chen', ts: 'Feb 27, 2026', note
    });
    window.ERP.toast(`✅ Credit updated for ${c.name}`, 'success');
    refresh();
  };

  window.ERP._creditAssignTier = function(custId, tierId) {
    const c = CUSTOMERS.find(c=>c.id===custId);
    if (!c) return;
    window._creditOverrides[custId] = Object.assign(window._creditOverrides[custId]||{}, {
      tier: tierId, by: 'Lisa Chen', ts: 'Feb 27, 2026'
    });
    window.ERP.toast(`Tier updated → ${tierId} for ${c.name}`, 'success');
    refreshTiers();
  };

  window.ERP._creditNewTier = function() {
    const id    = prompt('Tier ID (e.g. D, Gold, VIP):');
    if (!id || !id.trim()) return;
    if (window._creditTiers.find(t=>t.id===id.trim())) { alert('A tier with that ID already exists.'); return; }
    const label = prompt('Display label:', id.trim() + ' — New Tier');
    if (!label) return;
    const desc  = prompt('Description:', '') || '';
    const terms = prompt('Default payment terms (e.g. NET-30, COD, Prepay):', 'NET-30') || 'NET-30';
    const limitStr = prompt('Max credit limit (0 for prepay/no credit):', '10000');
    const limitMax = parseFloat((limitStr||'0').replace(/[^0-9.]/g,'')) || 0;
    const colors = ['blue','green','yellow','orange','red','purple'];
    const color = prompt('Color badge (' + colors.join('/') + '):', 'blue') || 'blue';
    window._creditTiers.push({ id: id.trim(), label, color, limitMin: 0, limitMax, terms, description: desc, autoApprove: false });
    window.ERP.toast(`✅ Tier "${id.trim()}" created`, 'success');
    refreshTiers();
  };

  window.ERP._creditEditTier = function(idx) {
    const tier = window._creditTiers[idx];
    if (!tier) return;
    const label = prompt('Display label:', tier.label);
    if (!label) return;
    const desc  = prompt('Description:', tier.description);
    if (desc === null) return;
    const terms = prompt('Payment terms:', tier.terms);
    if (!terms) return;
    const limitStr = prompt('Max credit limit:', tier.limitMax);
    const limitMax = parseFloat((limitStr||'0').replace(/[^0-9.]/g,'')) || tier.limitMax;
    const color = prompt('Badge color (blue/green/yellow/orange/red/purple):', tier.color) || tier.color;
    Object.assign(tier, { label, description: desc, terms, limitMax, color });
    window.ERP.toast(`✅ Tier "${tier.id}" updated`, 'success');
    refreshTiers();
  };

  window.ERP._creditDeleteTier = function(idx) {
    const tier = window._creditTiers[idx];
    if (!tier) return;
    if (!confirm(`Delete tier "${tier.label}"? This cannot be undone.`)) return;
    window._creditTiers.splice(idx, 1);
    window.ERP.toast(`Tier deleted`, 'warn');
    refreshTiers();
  };

  window.ERP._creditToggleRule = function(idx, active) {
    if (window._creditRules[idx]) window._creditRules[idx].active = active;
    window.ERP.toast(active ? 'Rule activated' : 'Rule deactivated', '');
    refreshRules();
  };

  window.ERP._creditNewRule = function() {
    const name = prompt('Rule name:');
    if (!name) return;
    const field = prompt('Field to evaluate:\n  utilization — Credit Utilization %\n  overdueDays — Days past due\n  noPayment   — No payment on file (1=true)', 'utilization');
    if (!field) return;
    const op    = prompt('Operator (> / < / ==):', '>');
    if (!op) return;
    const val   = parseFloat(prompt('Threshold value:', '80'));
    if (isNaN(val)) return;
    const action= prompt('Action when triggered:\n  flag    — Flag for Review\n  hold    — Place on Hold\n  lock    — Lock to Prepay Only\n  upgrade — Suggest Upgrade', 'flag');
    if (!action) return;
    const sev   = prompt('Severity (danger / warn / info / success):', 'warn');
    if (!sev) return;
    window._creditRules.push({ id: Date.now(), name, field, op, value: val, action, severity: sev, active: true });
    window.ERP.toast(`✅ Rule "${name}" created`, 'success');
    refreshRules();
  };

  window.ERP._creditEditRule = function(idx) {
    const r = window._creditRules[idx];
    if (!r) return;
    const name = prompt('Rule name:', r.name);
    if (!name) return;
    const valStr = prompt('Threshold value:', r.value);
    const val = parseFloat(valStr);
    if (isNaN(val)) return;
    const action = prompt('Action (flag / hold / lock / upgrade):', r.action);
    if (!action) return;
    const sev = prompt('Severity (danger / warn / info / success):', r.severity);
    if (!sev) return;
    Object.assign(r, { name, value: val, action, severity: sev });
    window.ERP.toast(`✅ Rule "${name}" updated`, 'success');
    refreshRules();
  };

  window.ERP._creditDeleteRule = function(idx) {
    const r = window._creditRules[idx];
    if (!r || !confirm(`Delete rule "${r.name}"?`)) return;
    window._creditRules.splice(idx, 1);
    window.ERP.toast('Rule deleted', 'warn');
    refreshRules();
  };
})();

// ═══════════════════════════════════════════════════════════
//  PRICE LEVELS — runtime state bootstrap
// ═══════════════════════════════════════════════════════════
(function initPriceLevels() {
  if (window._priceLevelsData) return; // already initialized

  // Markup multipliers from the seed data labels
  const markupOf = label => {
    const m = { 'Base + 15%': 1.15, 'Base + 8%': 1.08, 'Base cost': 1.00,
                'Base + 20%': 1.20, 'Base + 18%': 1.18, 'Base + 22%': 1.22 };
    return m[label] || 1.15;
  };

  // Build per-product price maps for every seed level
  window._priceLevelsData = PRICE_LEVELS.map(pl => {
    const mult = markupOf(pl.markup);
    const items = {};
    PRODUCTS.forEach(p => {
      items[p.id] = parseFloat((p.price * mult).toFixed(2));
    });
    return { id: pl.id, name: pl.name, description: pl.markup, items };
  });
  window._plNextId = window._priceLevelsData.length + 1;

  // Customer overrides: { customerId: levelName }
  // (seed from the priceLevel strings already on each customer)
  window._customerLevelOverrides = {};
  CUSTOMERS.forEach(c => { window._customerLevelOverrides[c.id] = c.priceLevel; });

  // Editor state
  window._plEditId       = null;   // level id being edited, null = list view
  window._plContainer    = '12oz Can';
  window._plPackSize     = '24-pack';
  window._plSearch       = '';
})();

// ───────────────────────────────────────────────────────────
//  PRICE LEVELS PAGE
// ───────────────────────────────────────────────────────────
function priceLevelsPage() {
  initPriceLevels_guard();
  if (window._plEditId !== null) return renderPriceLevelEditor();
  return renderPriceLevelList();
}

function initPriceLevels_guard() {
  if (!window._priceLevelsData) {
    // re-run bootstrap in case module reloaded
    const markupOf = label => {
      const m = { 'Base + 15%': 1.15, 'Base + 8%': 1.08, 'Base cost': 1.00,
                  'Base + 20%': 1.20, 'Base + 18%': 1.18, 'Base + 22%': 1.22 };
      return m[label] || 1.15;
    };
    window._priceLevelsData = PRICE_LEVELS.map(pl => {
      const mult = markupOf(pl.markup);
      const items = {};
      PRODUCTS.forEach(p => { items[p.id] = parseFloat((p.price * mult).toFixed(2)); });
      return { id: pl.id, name: pl.name, description: pl.markup, items };
    });
    window._plNextId = window._priceLevelsData.length + 1;
    window._customerLevelOverrides = {};
    CUSTOMERS.forEach(c => { window._customerLevelOverrides[c.id] = c.priceLevel; });
    window._plEditId = null;
    window._plContainer = '12oz Can';
    window._plPackSize = '24-pack';
    window._plSearch = '';
  }
}

/* ── LIST VIEW ── */
function renderPriceLevelList() {
  const levels = window._priceLevelsData;
  const custCountFor = name => CUSTOMERS.filter(c => (window._customerLevelOverrides[c.id] || c.priceLevel) === name).length;
  const customPriceCount = lv => Object.values(lv.items).length;

  return `
  <div class="section-title">
    <h2>🏷️ Price Levels</h2>
    <div style="margin-left:auto;display:flex;gap:8px">
      <button class="btn-primary btn-sm" onclick="window.ERP._plNewLevel()">＋ New Level</button>
      <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/assign-levels')">👥 Assign to Customers →</button>
    </div>
  </div>

  <div class="info-box mb-16">
    💡 <strong>Price levels</strong> define per-product prices for each customer segment. Set a custom price on any product — if left at base, the standard catalog price applies. Assign levels to customers on the <a style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/accounting/assign-levels')">Assign Levels</a> page.
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">
    ${levels.map(lv => {
      const custCount = custCountFor(lv.name);
      const prodCount = customPriceCount(lv);
      const sampleProducts = PRODUCTS.slice(0, 3);
      return `
      <div class="card" style="border-top:4px solid var(--primary)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div>
            <h3 style="margin:0 0 4px">${lv.name}</h3>
            <span class="text-sm text-light">${lv.description}</span>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button class="btn-outline btn-sm" onclick="window.ERP._plEditLevel(${lv.id})">✏️ Edit Prices</button>
            <button class="btn-outline btn-sm" style="color:var(--red)" onclick="window.ERP._plDeleteLevel(${lv.id})">🗑</button>
          </div>
        </div>
        <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
          <div class="stat-item"><div class="text-xs text-light">Customers</div><div class="bold">${custCount}</div></div>
          <div class="stat-item"><div class="text-xs text-light">Products Priced</div><div class="bold">${prodCount}</div></div>
          <div class="stat-item"><div class="text-xs text-light">Categories</div><div class="bold">${CATEGORIES.length}</div></div>
        </div>
        <div class="text-xs text-light" style="border-top:1px solid var(--border);padding-top:8px">
          Sample prices:
          ${sampleProducts.map(p => {
            const px = (lv.items[p.id] || p.price);
            return `<span style="margin-right:10px"><strong>${p.name} ${p.flavor}</strong> ${fmt$(px)}</span>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

/* ── EDITOR VIEW ── */
function renderPriceLevelEditor() {
  const lv = window._priceLevelsData.find(l => l.id === window._plEditId);
  if (!lv) { window._plEditId = null; return renderPriceLevelList(); }

  const _CONTAINER_TYPES = [
    { key: '12oz Can',          label: '12oz Can',     icon: '🥤' },
    { key: '20oz Bottle',       label: '20oz Bottle',  icon: '🍶' },
    { key: '2L Bottle',         label: '2L Bottle',    icon: '🧃' },
    { key: '12oz Glass Bottle', label: '12oz Glass',   icon: '🫙' },
  ];

  // Normalize container/packSize selection
  const validContainers = _CONTAINER_TYPES.filter(ct => PRODUCTS.some(p => p.size === ct.key));
  if (!validContainers.find(ct => ct.key === window._plContainer)) {
    window._plContainer = validContainers[0] ? validContainers[0].key : '';
  }
  const packSizes = [...new Set(PRODUCTS.filter(p => p.size === window._plContainer).map(p => p.packSize))];
  if (!packSizes.includes(window._plPackSize)) window._plPackSize = packSizes[0] || '';

  const search = (window._plSearch || '').toLowerCase().trim();
  const flavorProducts = search
    ? PRODUCTS.filter(p => {
        const q = search;
        return p.name.toLowerCase().includes(q) || p.flavor.toLowerCase().includes(q) ||
               p.code.toLowerCase().includes(q) || p.size.toLowerCase().includes(q);
      })
    : PRODUCTS.filter(p => p.size === window._plContainer && p.packSize === window._plPackSize);

  // Count products where price differs from base
  const customCount = PRODUCTS.filter(p => {
    const custom = lv.items[p.id];
    return custom !== undefined && Math.abs(custom - p.price) > 0.001;
  }).length;

  return `
  <div class="fade-in">
    <!-- Header -->
    <div class="flex-between mb-4" style="flex-wrap:wrap;gap:12px">
      <div>
        <button class="btn-ghost btn-sm mb-8" onclick="window.ERP._plCloseEditor()">← Back to Price Levels</button>
        <h2 style="margin:0">🏷️ Edit Prices — ${lv.name}</h2>
        <p class="text-light text-sm" style="margin:4px 0 0">${customCount} product${customCount !== 1 ? 's' : ''} with custom prices · ${CUSTOMERS.filter(c => (window._customerLevelOverrides[c.id] || c.priceLevel) === lv.name).length} customers assigned</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-outline btn-sm" onclick="window.ERP._plResetLevelToBase(${lv.id})">↺ Reset All to Base</button>
        <button class="btn-primary btn-sm" onclick="window.ERP._plCloseEditor()">✅ Done</button>
      </div>
    </div>

    <!-- Name editor -->
    <div class="card mb-16" style="padding:14px 16px">
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <label class="text-xs text-light" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Level Name</label>
          <input type="text" value="${lv.name}" id="pl-name-input"
            style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:0.95rem;font-weight:600"
            onchange="window.ERP._plRenameLevel(${lv.id}, this.value)">
        </div>
        <div style="flex:2;min-width:220px">
          <label class="text-xs text-light" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Description / Notes</label>
          <input type="text" value="${lv.description}" id="pl-desc-input"
            style="width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:0.9rem"
            onchange="window.ERP._plDescLevel(${lv.id}, this.value)">
        </div>
        <div style="min-width:160px">
          <label class="text-xs text-light" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Apply Markup % to All</label>
          <div style="display:flex;gap:6px;align-items:center">
            <input type="number" step="0.1" min="-50" max="200" placeholder="e.g. 15" id="pl-bulk-markup"
              style="width:80px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.9rem;text-align:center">
            <button class="btn-primary btn-sm" onclick="window.ERP._plApplyMarkup(${lv.id})">Apply</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px">
      <input type="text" placeholder="🔍 Search by name, flavor, size, code…" value="${window._plSearch || ''}"
        oninput="window.ERP._plSearchProducts(this.value)"
        style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:8px">
      ${window._plSearch ? `<button class="btn-ghost btn-sm" onclick="window.ERP._plSearchProducts('')">✕ Clear</button>` : ''}
    </div>

    ${!window._plSearch ? `
    <!-- Container type tabs -->
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      ${validContainers.map(ct => {
        const active = window._plContainer === ct.key;
        const customInCt = PRODUCTS.filter(p => p.size === ct.key && lv.items[p.id] !== undefined && Math.abs((lv.items[p.id]||p.price) - p.price) > 0.001).length;
        return `<button onclick="window.ERP._plSetContainer('${ct.key}')"
          style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 18px;border-radius:12px;cursor:pointer;
            border:2px solid ${active ? 'var(--primary)' : 'var(--border)'};
            background:${active ? 'var(--primary)' : '#fff'};
            color:${active ? '#fff' : 'var(--text)'};font-weight:${active ? 700 : 500};
            transition:all .15s;position:relative">
          <span style="font-size:1.6rem">${ct.icon}</span>
          <span style="font-size:0.82rem">${ct.label}</span>
          ${customInCt > 0 ? `<span style="position:absolute;top:6px;right:6px;background:${active ? '#fff' : 'var(--primary)'};color:${active ? 'var(--primary)' : '#fff'};width:18px;height:18px;border-radius:50%;font-size:0.65rem;font-weight:700;display:flex;align-items:center;justify-content:center">${customInCt}</span>` : ''}
        </button>`;
      }).join('')}
    </div>

    <!-- Pack size selector -->
    ${packSizes.length > 0 ? `
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
      <span class="text-xs text-light" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px">Case Size:</span>
      ${packSizes.map(ps => `
        <button onclick="window.ERP._plSetPackSize('${ps}')"
          class="btn-sm ${window._plPackSize === ps ? 'btn-primary' : 'btn-outline'}">
          📦 ${ps}
        </button>`).join('')}
    </div>` : ''}

    <div class="text-xs text-light mb-12" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px">
      ${flavorProducts.length} product${flavorProducts.length !== 1 ? 's' : ''} — ${window._plContainer} · ${window._plPackSize}
    </div>
    ` : `
    <div class="text-xs text-light mb-12" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px">
      ${flavorProducts.length} search result${flavorProducts.length !== 1 ? 's' : ''}
    </div>`}

    <!-- Product price grid -->
    ${renderPriceLevelProductGrid(lv, flavorProducts)}
  </div>`;
}

function renderPriceLevelProductGrid(lv, products) {
  if (products.length === 0) return '<p class="text-light">No products found.</p>';

  // Group by category
  const grouped = {};
  CATEGORIES.forEach(cat => { grouped[cat.id] = []; });
  products.forEach(p => {
    if (grouped[p.category] !== undefined) grouped[p.category].push(p);
  });

  let html = '';
  CATEGORIES.forEach(cat => {
    const prods = grouped[cat.id];
    if (!prods || prods.length === 0) return;
    html += `
    <div class="mb-20">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--border)">
        <span style="font-size:1.2rem">${cat.icon}</span>
        <span style="font-weight:700;font-size:0.95rem">${cat.name}</span>
        <span class="text-xs text-light">${prods.length} product${prods.length !== 1 ? 's' : ''}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
        ${prods.map(p => {
          const customPx  = lv.items[p.id];
          const displayPx = customPx !== undefined ? customPx : p.price;
          const isCustom  = customPx !== undefined && Math.abs(customPx - p.price) > 0.001;
          const pctDiff   = isCustom ? ((customPx / p.price - 1) * 100) : 0;
          const diffLabel = isCustom
            ? (pctDiff >= 0
                ? `<span style="color:var(--orange);font-size:0.7rem">+${pctDiff.toFixed(1)}%</span>`
                : `<span style="color:var(--green);font-size:0.7rem">${pctDiff.toFixed(1)}%</span>`)
            : `<span class="text-xs text-light">base</span>`;
          return `
          <div style="border:1.5px solid ${isCustom ? 'var(--primary)' : 'var(--border)'};border-radius:10px;padding:12px;background:${isCustom ? 'var(--primary)08' : '#fff'};transition:border .15s">
            <div style="font-weight:600;font-size:0.85rem;margin-bottom:2px">${p.name} ${p.flavor}</div>
            <div class="text-xs text-light mb-8">${p.code} · ${p.packSize}</div>
            <div style="display:flex;align-items:center;gap:6px">
              <span class="text-xs text-light">Base: ${fmt$(p.price)}</span>
              ${diffLabel}
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:8px">
              <span class="text-xs text-light" style="width:28px">$</span>
              <input type="number" min="0" step="0.01"
                value="${displayPx.toFixed(2)}"
                data-base="${p.price}"
                style="flex:1;padding:6px 8px;border:1.5px solid ${isCustom ? 'var(--primary)' : 'var(--border)'};border-radius:6px;font-size:0.9rem;font-weight:600;text-align:center"
                onchange="window.ERP._plSetPrice(${lv.id}, ${p.id}, parseFloat(this.value)||0)"
                onfocus="this.select()">
              ${isCustom ? `<button title="Reset to base price" style="padding:4px 7px;border:1px solid var(--border);border-radius:6px;background:#fff;cursor:pointer;font-size:0.75rem;color:var(--text-light)" onclick="window.ERP._plClearPrice(${lv.id}, ${p.id})">↺</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  });
  return html || '<p class="text-light">No products in this view.</p>';
}

// ───────────────────────────────────────────────────────────
//  ASSIGN LEVELS PAGE
// ───────────────────────────────────────────────────────────
function assignLevelsPage() {
  initPriceLevels_guard();
  const levels = window._priceLevelsData;

  return `
  <div class="section-title">
    <h2>👥 Assign Price Levels</h2>
    <div style="margin-left:auto;display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/price-levels')">🏷️ Manage Levels</button>
      <button class="btn-primary btn-sm" onclick="window.ERP._plSaveAssignments()">💾 Save Assignments</button>
    </div>
  </div>

  <div class="info-box mb-16">
    💡 Assign a <strong>Price Level</strong> to each customer. Prices defined in the level will apply automatically when a salesperson builds an order for that customer.
  </div>

  <!-- Summary strip -->
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
    ${levels.map(lv => {
      const n = CUSTOMERS.filter(c => (window._customerLevelOverrides[c.id] || c.priceLevel) === lv.name).length;
      return `<div style="padding:8px 14px;border-radius:20px;border:1.5px solid var(--border);font-size:0.82rem;background:#fff">
        <strong>${lv.name}</strong> <span class="text-light">${n} customer${n !== 1 ? 's' : ''}</span>
      </div>`;
    }).join('')}
  </div>

  <div class="card">
    <table>
      <thead>
        <tr>
          <th>Customer</th>
          <th>Type</th>
          <th>Current Level</th>
          <th>Assign Level</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${CUSTOMERS.map(c => {
          const current = window._customerLevelOverrides[c.id] || c.priceLevel;
          const lv = levels.find(l => l.name === current);
          return `<tr>
            <td>
              <strong>${c.name}</strong>
              <div class="text-xs text-light">${c.code} · ${c.contact}</div>
            </td>
            <td class="text-sm">${c.type}</td>
            <td>
              ${lv
                ? `<span style="padding:3px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;background:var(--primary)15;color:var(--primary)">${lv.name}</span>`
                : `<span class="text-xs text-light">${current || '—'}</span>`}
            </td>
            <td>
              <select id="pl-assign-${c.id}"
                style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem;min-width:180px"
                onchange="window.ERP._plPreviewAssign(${c.id}, this.value)">
                ${levels.map(l => `<option value="${l.name}" ${current === l.name ? 'selected' : ''}>${l.name}</option>`).join('')}
              </select>
            </td>
            <td>
              <span class="badge badge-${c.status === 'Active' ? 'green' : 'red'}">${c.status}</span>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>

  <!-- Bottom save bar -->
  <div style="position:sticky;bottom:0;left:0;right:0;background:rgba(255,255,255,0.95);border-top:1px solid var(--border);padding:12px 24px;display:flex;justify-content:flex-end;gap:10px;backdrop-filter:blur(6px);margin-top:16px;border-radius:0 0 12px 12px">
    <button class="btn-outline" onclick="window.ERP.nav('#/accounting/price-levels')">Cancel</button>
    <button class="btn-primary" onclick="window.ERP._plSaveAssignments()">💾 Save All Assignments</button>
  </div>`;
}

// ───────────────────────────────────────────────────────────
//  PRICE LEVELS — window.ERP handlers
// ───────────────────────────────────────────────────────────
(function() {
  function rerender() {
    const c = document.querySelector('.m-content') || document.querySelector('.content');
    if (c) c.innerHTML = window._plEditId !== null ? renderPriceLevelEditor() : renderPriceLevelList();
  }
  function rerenderAssign() {
    const c = document.querySelector('.m-content') || document.querySelector('.content');
    if (c) c.innerHTML = assignLevelsPage();
  }

  window.ERP._plNewLevel = function() {
    const name = prompt('Price Level name:', 'New Level');
    if (!name) return;
    const desc = prompt('Description / notes (e.g. "Base + 12%"):', 'Base + 12%') || '';
    const items = {};
    PRODUCTS.forEach(p => { items[p.id] = p.price; });
    const id = window._plNextId++;
    window._priceLevelsData.push({ id, name, description: desc, items });
    window.ERP.toast(`✅ Level "${name}" created`, 'success');
    rerender();
  };

  window.ERP._plEditLevel = function(id) {
    window._plEditId = id;
    window._plSearch = '';
    window._plContainer = '12oz Can';
    window._plPackSize = '24-pack';
    rerender();
  };

  window.ERP._plCloseEditor = function() {
    window._plEditId = null;
    rerender();
  };

  window.ERP._plDeleteLevel = function(id) {
    const lv = window._priceLevelsData.find(l => l.id === id);
    if (!lv) return;
    const custCount = CUSTOMERS.filter(c => (window._customerLevelOverrides[c.id] || c.priceLevel) === lv.name).length;
    if (custCount > 0 && !confirm(`"${lv.name}" is assigned to ${custCount} customer(s). Delete anyway?`)) return;
    window._priceLevelsData = window._priceLevelsData.filter(l => l.id !== id);
    window.ERP.toast(`Level "${lv.name}" deleted`, 'warn');
    rerender();
  };

  window.ERP._plRenameLevel = function(id, name) {
    const lv = window._priceLevelsData.find(l => l.id === id);
    if (!lv || !name.trim()) return;
    const old = lv.name;
    lv.name = name.trim();
    // update customer overrides that referenced the old name
    Object.keys(window._customerLevelOverrides).forEach(cid => {
      if (window._customerLevelOverrides[cid] === old) window._customerLevelOverrides[cid] = lv.name;
    });
    // no full rerender needed — just update header silently
    const h2 = document.querySelector('h2');
    if (h2) h2.textContent = `🏷️ Edit Prices — ${lv.name}`;
  };

  window.ERP._plDescLevel = function(id, desc) {
    const lv = window._priceLevelsData.find(l => l.id === id);
    if (lv) lv.description = desc;
  };

  window.ERP._plSetContainer = function(key) {
    window._plContainer = key;
    window._plSearch = '';
    rerender();
  };

  window.ERP._plSetPackSize = function(ps) {
    window._plPackSize = ps;
    rerender();
  };

  window.ERP._plSearchProducts = function(q) {
    window._plSearch = q;
    rerender();
  };

  window.ERP._plSetPrice = function(levelId, productId, price) {
    const lv = window._priceLevelsData.find(l => l.id === levelId);
    if (!lv) return;
    lv.items[productId] = parseFloat(price.toFixed(2));
    // Refresh just the badge & diff label without full rerender — do soft rerender
    const p = PRODUCTS.find(pr => pr.id === productId);
    if (p) {
      const isCustom = Math.abs(price - p.price) > 0.001;
      window.ERP.toast(isCustom ? `${p.name} ${p.flavor} → ${fmt$(price)}` : `${p.name} ${p.flavor} reset to base`, '');
    }
  };

  window.ERP._plClearPrice = function(levelId, productId) {
    const lv = window._priceLevelsData.find(l => l.id === levelId);
    const p  = PRODUCTS.find(pr => pr.id === productId);
    if (!lv || !p) return;
    lv.items[productId] = p.price;
    rerender();
  };

  window.ERP._plResetLevelToBase = function(id) {
    if (!confirm('Reset ALL prices in this level to base catalog prices?')) return;
    const lv = window._priceLevelsData.find(l => l.id === id);
    if (!lv) return;
    PRODUCTS.forEach(p => { lv.items[p.id] = p.price; });
    window.ERP.toast('All prices reset to base', 'warn');
    rerender();
  };

  window.ERP._plApplyMarkup = function(id) {
    const input = document.getElementById('pl-bulk-markup');
    if (!input) return;
    const pct = parseFloat(input.value);
    if (isNaN(pct)) { window.ERP.toast('Enter a valid % (e.g. 15 for +15%)', 'warn'); return; }
    const lv = window._priceLevelsData.find(l => l.id === id);
    if (!lv) return;
    const mult = 1 + (pct / 100);
    PRODUCTS.forEach(p => { lv.items[p.id] = parseFloat((p.price * mult).toFixed(2)); });
    lv.description = `Base + ${pct}%`;
    window.ERP.toast(`✅ Applied ${pct >= 0 ? '+' : ''}${pct}% markup to all products`, 'success');
    rerender();
  };

  window.ERP._plPreviewAssign = function(customerId, levelName) {
    window._customerLevelOverrides[customerId] = levelName;
  };

  window.ERP._plSaveAssignments = function() {
    // Read all selects and persist to overrides
    CUSTOMERS.forEach(c => {
      const sel = document.getElementById(`pl-assign-${c.id}`);
      if (sel) window._customerLevelOverrides[c.id] = sel.value;
    });
    window.ERP.toast('✅ Price level assignments saved', 'success');
    rerenderAssign();
  };
})();

// ═══════════════════════════════════════════════════════════
//  DISCOUNT CAPS POLICIES — runtime state bootstrap
// ═══════════════════════════════════════════════════════════
(function initDiscPolicies() {
  if (window._discPolicies) return;

  // Seed policies
  window._discPolicies = [
    {
      id: 1,
      name: 'Standard',
      description: 'Default caps for all salespersons',
      globalMax: 15,       // hard block above this %
      globalWarn: 10,      // warning above this %
      orderMax: 12,        // max % off entire order total (null = no limit)
      categoryOverrides: { 1: { max: 15, warn: 10 }, 2: { max: 15, warn: 10 }, 3: { max: 10, warn: 7 }, 4: { max: 15, warn: 10 } },
      productOverrides: {},  // { productId: { max, warn } }
    },
    {
      id: 2,
      name: 'Restricted',
      description: 'New reps or high-risk accounts — tighter caps',
      globalMax: 5,
      globalWarn: 3,
      orderMax: 5,
      categoryOverrides: {},
      productOverrides: {},
    },
    {
      id: 3,
      name: 'VIP / Wholesale',
      description: 'Trusted reps & wholesale customers — wider authority',
      globalMax: 25,
      globalWarn: 18,
      orderMax: 20,
      categoryOverrides: { 3: { max: 15, warn: 12 } },  // glass bottles tighter
      productOverrides: {},
    },
    {
      id: 4,
      name: 'No Discount',
      description: 'Discount not permitted — all discounts blocked',
      globalMax: 0,
      globalWarn: 0,
      orderMax: 0,
      categoryOverrides: {},
      productOverrides: {},
    },
  ];
  window._discNextId = 5;

  // Salesperson assignments: { userId: policyId }
  const salespersons = USERS.filter(u => u.role === 'Salesperson');
  window._discSalesAssign = {};
  salespersons.forEach(u => { window._discSalesAssign[u.id] = 1; }); // default = Standard

  // Customer overrides: { customerId: policyId | null }  null = inherit from salesperson
  window._discCustAssign = {};
  CUSTOMERS.forEach(c => { window._discCustAssign[c.id] = null; });

  // Editor state
  window._discEditId     = null;
  window._discContainer  = '12oz Can';
  window._discPackSize   = '24-pack';
  window._discSearch     = '';
  window._discAssignTab  = 'salespeople'; // 'salespeople' | 'customers'
})();

// ───────────────────────────────────────────────────────────
//  DISC POLICIES PAGE — router
// ───────────────────────────────────────────────────────────
function discPoliciesPage() {
  _discGuard();
  return window._discEditId !== null ? renderDiscEditor() : renderDiscList();
}

function _discGuard() {
  if (!window._discPolicies) {
    // lightweight re-init
    window._discPolicies = [
      { id: 1, name: 'Standard', description: 'Default caps for all salespersons', globalMax: 15, globalWarn: 10, orderMax: 12, categoryOverrides: {}, productOverrides: {} },
    ];
    window._discNextId    = 2;
    window._discSalesAssign  = {};
    window._discCustAssign   = {};
    USERS.filter(u => u.role === 'Salesperson').forEach(u => { window._discSalesAssign[u.id] = 1; });
    CUSTOMERS.forEach(c => { window._discCustAssign[c.id] = null; });
    window._discEditId    = null;
    window._discContainer = '12oz Can';
    window._discPackSize  = '24-pack';
    window._discSearch    = '';
    window._discAssignTab = 'salespeople';
  }
}

/* ── LIST VIEW ── */
function renderDiscList() {
  const policies = window._discPolicies;
  const salesPeople = USERS.filter(u => u.role === 'Salesperson');
  const salesCountFor = id => salesPeople.filter(u => window._discSalesAssign[u.id] === id).length;
  const custCountFor  = id => CUSTOMERS.filter(c => window._discCustAssign[c.id] === id).length;

  const severityColor = max => max === 0 ? 'var(--red)' : max <= 5 ? 'var(--orange)' : max <= 15 ? 'var(--primary)' : 'var(--green)';

  return `
  <div class="section-title">
    <h2>✂️ Discount Cap Policies</h2>
    <div style="margin-left:auto;display:flex;gap:8px">
      <button class="btn-primary btn-sm" onclick="window.ERP._discNewPolicy()">＋ New Policy</button>
      <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/assign-disc')">🔀 Assign to Reps & Customers →</button>
    </div>
  </div>

  <div class="info-box mb-16">
    💡 <strong>Discount cap policies</strong> define how much a salesperson may discount per product, per category, and per order. Policies are assigned to <strong>salespersons</strong> globally, and can be <strong>overridden per customer</strong> — e.g. giving a VIP customer wider authority regardless of who takes the order.
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px">
    ${policies.map(pol => {
      const sc = salesCountFor(pol.id);
      const cc = custCountFor(pol.id);
      const catOverCount = Object.keys(pol.categoryOverrides || {}).length;
      const prodOverCount= Object.keys(pol.productOverrides  || {}).length;
      return `
      <div class="card" style="border-top:4px solid ${severityColor(pol.globalMax)}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div>
            <h3 style="margin:0 0 4px">${pol.name}</h3>
            <span class="text-sm text-light">${pol.description}</span>
          </div>
          <div style="display:flex;gap:6px;flex-shrink:0">
            <button class="btn-outline btn-sm" onclick="window.ERP._discEditPolicy(${pol.id})">✏️ Edit</button>
            <button class="btn-outline btn-sm" style="color:var(--red)" onclick="window.ERP._discDeletePolicy(${pol.id})">🗑</button>
          </div>
        </div>
        <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">
          <div class="stat-item">
            <div class="text-xs text-light">Hard Cap</div>
            <div class="bold" style="color:${severityColor(pol.globalMax)}">${pol.globalMax}%</div>
          </div>
          <div class="stat-item">
            <div class="text-xs text-light">Warn At</div>
            <div class="bold" style="color:var(--orange)">${pol.globalWarn}%</div>
          </div>
          <div class="stat-item">
            <div class="text-xs text-light">Order Max</div>
            <div class="bold">${pol.orderMax != null ? pol.orderMax + '%' : '—'}</div>
          </div>
        </div>
        <div style="display:flex;gap:16px;font-size:0.8rem;color:var(--text-light);border-top:1px solid var(--border);padding-top:8px;flex-wrap:wrap">
          <span>👤 ${sc} rep${sc !== 1 ? 's' : ''}</span>
          <span>🏢 ${cc} customer override${cc !== 1 ? 's' : ''}</span>
          ${catOverCount  > 0 ? `<span>📁 ${catOverCount} category rule${catOverCount  !== 1 ? 's' : ''}</span>`  : ''}
          ${prodOverCount > 0 ? `<span>📦 ${prodOverCount} product rule${prodOverCount  !== 1 ? 's' : ''}</span>` : ''}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

/* ── EDITOR VIEW ── */
function renderDiscEditor() {
  const pol = window._discPolicies.find(p => p.id === window._discEditId);
  if (!pol) { window._discEditId = null; return renderDiscList(); }

  const _CONTAINER_TYPES = [
    { key: '12oz Can',          label: '12oz Can',     icon: '🥤' },
    { key: '20oz Bottle',       label: '20oz Bottle',  icon: '🍶' },
    { key: '2L Bottle',         label: '2L Bottle',    icon: '🧃' },
    { key: '12oz Glass Bottle', label: '12oz Glass',   icon: '🫙' },
  ];

  // Normalize container/pack selection
  const validContainers = _CONTAINER_TYPES.filter(ct => PRODUCTS.some(p => p.size === ct.key));
  if (!validContainers.find(ct => ct.key === window._discContainer)) {
    window._discContainer = validContainers[0] ? validContainers[0].key : '';
  }
  const packSizes = [...new Set(PRODUCTS.filter(p => p.size === window._discContainer).map(p => p.packSize))];
  if (!packSizes.includes(window._discPackSize)) window._discPackSize = packSizes[0] || '';

  const search = (window._discSearch || '').toLowerCase();
  const viewProducts = search
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(search) || p.flavor.toLowerCase().includes(search) ||
        p.code.toLowerCase().includes(search) || p.size.toLowerCase().includes(search))
    : PRODUCTS.filter(p => p.size === window._discContainer && p.packSize === window._discPackSize);

  const prodOverCount = Object.keys(pol.productOverrides || {}).length;

  return `
  <div class="fade-in">
    <!-- Header -->
    <div class="flex-between mb-4" style="flex-wrap:wrap;gap:12px">
      <div>
        <button class="btn-ghost btn-sm mb-8" onclick="window.ERP._discCloseEditor()">← Back to Discount Policies</button>
        <h2 style="margin:0">✂️ Edit Policy — ${pol.name}</h2>
        <p class="text-light text-sm" style="margin:4px 0 0">
          ${prodOverCount} product-level override${prodOverCount !== 1 ? 's' : ''} ·
          ${Object.keys(pol.categoryOverrides || {}).length} category rule${Object.keys(pol.categoryOverrides || {}).length !== 1 ? 's' : ''} ·
          ${[...USERS.filter(u => u.role === 'Salesperson').filter(u => window._discSalesAssign[u.id] === pol.id),
             ...CUSTOMERS.filter(c => window._discCustAssign[c.id] === pol.id)].length} assignments
        </p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn-outline btn-sm" onclick="window.ERP._discResetProductOverrides(${pol.id})">↺ Clear Product Overrides</button>
        <button class="btn-primary btn-sm" onclick="window.ERP._discCloseEditor()">✅ Done</button>
      </div>
    </div>

    <!-- Global caps card -->
    <div class="card mb-16">
      <h4 style="margin:0 0 12px">⚙️ Global Settings</h4>
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end">
        <!-- Name -->
        <div style="flex:2;min-width:180px">
          <label class="text-xs text-light" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Policy Name</label>
          <input type="text" value="${pol.name}" id="disc-name-input"
            style="width:100%;padding:7px 11px;border:1px solid var(--border);border-radius:8px;font-size:0.95rem;font-weight:600"
            onchange="window.ERP._discRename(${pol.id}, this.value)">
        </div>
        <!-- Description -->
        <div style="flex:3;min-width:200px">
          <label class="text-xs text-light" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Description</label>
          <input type="text" value="${pol.description}" id="disc-desc-input"
            style="width:100%;padding:7px 11px;border:1px solid var(--border);border-radius:8px;font-size:0.9rem"
            onchange="window.ERP._discDescUpdate(${pol.id}, this.value)">
        </div>
        <!-- Hard cap -->
        <div style="min-width:120px">
          <label class="text-xs text-light" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Hard Cap %</label>
          <div style="display:flex;align-items:center;gap:6px">
            <input type="number" min="0" max="100" step="1" value="${pol.globalMax}" id="disc-max-input"
              style="width:70px;padding:7px 10px;border:2px solid var(--red);border-radius:8px;font-size:0.95rem;font-weight:700;text-align:center;color:var(--red)"
              onchange="window.ERP._discSetGlobal(${pol.id}, 'globalMax', parseFloat(this.value)||0)">
            <span class="text-sm text-light">%</span>
          </div>
          <div class="text-xs text-light mt-4">Blocked above this</div>
        </div>
        <!-- Warn -->
        <div style="min-width:120px">
          <label class="text-xs text-light" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Warn At %</label>
          <div style="display:flex;align-items:center;gap:6px">
            <input type="number" min="0" max="100" step="1" value="${pol.globalWarn}" id="disc-warn-input"
              style="width:70px;padding:7px 10px;border:2px solid var(--orange);border-radius:8px;font-size:0.95rem;font-weight:700;text-align:center;color:var(--orange)"
              onchange="window.ERP._discSetGlobal(${pol.id}, 'globalWarn', parseFloat(this.value)||0)">
            <span class="text-sm text-light">%</span>
          </div>
          <div class="text-xs text-light mt-4">Warning shown above</div>
        </div>
        <!-- Order max -->
        <div style="min-width:120px">
          <label class="text-xs text-light" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Order-Level Max %</label>
          <div style="display:flex;align-items:center;gap:6px">
            <input type="number" min="0" max="100" step="1" value="${pol.orderMax != null ? pol.orderMax : ''}" placeholder="No limit" id="disc-order-input"
              style="width:85px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.9rem;text-align:center"
              onchange="window.ERP._discSetGlobal(${pol.id}, 'orderMax', this.value === '' ? null : parseFloat(this.value))">
            <span class="text-sm text-light">%</span>
          </div>
          <div class="text-xs text-light mt-4">Max avg discount/order</div>
        </div>
      </div>
    </div>

    <!-- Category overrides -->
    <div class="card mb-16">
      <h4 style="margin:0 0 4px">📁 Category-Level Overrides</h4>
      <p class="text-sm text-light" style="margin:0 0 12px">Set different caps for an entire product category. Leave blank to inherit the global caps above.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px">
        ${CATEGORIES.map(cat => {
          const ov = (pol.categoryOverrides || {})[cat.id] || {};
          const hasOv = ov.max !== undefined || ov.warn !== undefined;
          return `
          <div style="padding:14px;border:1.5px solid ${hasOv ? 'var(--primary)' : 'var(--border)'};border-radius:10px;background:${hasOv ? 'var(--primary)08' : '#fff'}">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
              <span style="font-size:1.2rem">${cat.icon}</span>
              <span style="font-weight:600;font-size:0.88rem">${cat.name}</span>
              ${hasOv ? '<span class="text-xs" style="color:var(--primary);margin-left:auto">custom</span>' : '<span class="text-xs text-light" style="margin-left:auto">global</span>'}
            </div>
            <div style="display:flex;gap:10px;align-items:center">
              <div>
                <div class="text-xs text-light mb-4">Hard Cap %</div>
                <input type="number" min="0" max="100" step="1"
                  value="${ov.max !== undefined ? ov.max : ''}"
                  placeholder="${pol.globalMax}"
                  style="width:64px;padding:5px 8px;border:1.5px solid ${ov.max !== undefined ? 'var(--red)' : 'var(--border)'};border-radius:6px;font-size:0.88rem;text-align:center;color:var(--red)"
                  onchange="window.ERP._discSetCatCap(${pol.id}, ${cat.id}, 'max', this.value)">
              </div>
              <div>
                <div class="text-xs text-light mb-4">Warn At %</div>
                <input type="number" min="0" max="100" step="1"
                  value="${ov.warn !== undefined ? ov.warn : ''}"
                  placeholder="${pol.globalWarn}"
                  style="width:64px;padding:5px 8px;border:1.5px solid ${ov.warn !== undefined ? 'var(--orange)' : 'var(--border)'};border-radius:6px;font-size:0.88rem;text-align:center;color:var(--orange)"
                  onchange="window.ERP._discSetCatCap(${pol.id}, ${cat.id}, 'warn', this.value)">
              </div>
              ${hasOv ? `<button title="Clear category overrides" style="padding:5px 8px;border:1px solid var(--border);border-radius:6px;background:#fff;cursor:pointer;font-size:0.75rem;color:var(--text-light);align-self:flex-end" onclick="window.ERP._discClearCatCap(${pol.id}, ${cat.id})">↺</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Product-level overrides (inventory browser) -->
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;flex-wrap:wrap;gap:10px">
        <div>
          <h4 style="margin:0 0 4px">📦 Product-Level Overrides</h4>
          <p class="text-sm text-light" style="margin:0">Set caps for specific products. Overrides category and global caps.</p>
        </div>
        <span class="text-sm text-light">${prodOverCount} override${prodOverCount !== 1 ? 's' : ''} set</span>
      </div>

      <!-- Search -->
      <div style="display:flex;gap:8px;align-items:center;margin:14px 0">
        <input type="text" placeholder="🔍 Search by name, flavor, size, code…" value="${window._discSearch || ''}"
          oninput="window.ERP._discSearchProducts(this.value)"
          style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:8px">
        ${window._discSearch ? `<button class="btn-ghost btn-sm" onclick="window.ERP._discSearchProducts('')">✕ Clear</button>` : ''}
      </div>

      ${!window._discSearch ? `
      <!-- Container tabs -->
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        ${validContainers.map(ct => {
          const active = window._discContainer === ct.key;
          const overInCt = PRODUCTS.filter(p => p.size === ct.key && (pol.productOverrides||{})[p.id] !== undefined).length;
          return `<button onclick="window.ERP._discSetContainer('${ct.key}')"
            style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 18px;border-radius:12px;cursor:pointer;
              border:2px solid ${active ? 'var(--primary)' : 'var(--border)'};
              background:${active ? 'var(--primary)' : '#fff'};
              color:${active ? '#fff' : 'var(--text)'};font-weight:${active ? 700 : 500};
              transition:all .15s;position:relative">
            <span style="font-size:1.6rem">${ct.icon}</span>
            <span style="font-size:0.82rem">${ct.label}</span>
            ${overInCt > 0 ? `<span style="position:absolute;top:6px;right:6px;background:${active ? '#fff' : 'var(--primary)'};color:${active ? 'var(--primary)' : '#fff'};width:18px;height:18px;border-radius:50%;font-size:0.65rem;font-weight:700;display:flex;align-items:center;justify-content:center">${overInCt}</span>` : ''}
          </button>`;
        }).join('')}
      </div>
      <!-- Pack size -->
      ${packSizes.length > 0 ? `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap">
        <span class="text-xs text-light" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px">Case Size:</span>
        ${packSizes.map(ps => `<button onclick="window.ERP._discSetPackSize('${ps}')" class="btn-sm ${window._discPackSize === ps ? 'btn-primary' : 'btn-outline'}">📦 ${ps}</button>`).join('')}
      </div>` : ''}
      <div class="text-xs text-light mb-12" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px">
        ${viewProducts.length} product${viewProducts.length !== 1 ? 's' : ''} — ${window._discContainer} · ${window._discPackSize}
      </div>
      ` : `
      <div class="text-xs text-light mb-12" style="font-weight:600;text-transform:uppercase;letter-spacing:.5px">
        ${viewProducts.length} search result${viewProducts.length !== 1 ? 's' : ''}
      </div>`}

      <!-- Product grid -->
      ${renderDiscProductGrid(pol, viewProducts)}
    </div>
  </div>`;
}

function renderDiscProductGrid(pol, products) {
  if (products.length === 0) return '<p class="text-light">No products found.</p>';

  const grouped = {};
  CATEGORIES.forEach(cat => { grouped[cat.id] = []; });
  products.forEach(p => { if (grouped[p.category] !== undefined) grouped[p.category].push(p); });

  let html = '';
  CATEGORIES.forEach(cat => {
    const prods = grouped[cat.id];
    if (!prods || !prods.length) return;
    const catOv    = (pol.categoryOverrides || {})[cat.id] || {};
    const effectiveMax  = catOv.max  !== undefined ? catOv.max  : pol.globalMax;
    const effectiveWarn = catOv.warn !== undefined ? catOv.warn : pol.globalWarn;

    html += `
    <div class="mb-20">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid var(--border)">
        <span style="font-size:1.2rem">${cat.icon}</span>
        <span style="font-weight:700;font-size:0.95rem">${cat.name}</span>
        <span class="text-xs text-light">${prods.length} product${prods.length !== 1 ? 's' : ''}</span>
        <span class="text-xs" style="margin-left:auto;color:var(--red)">Cat cap: ${effectiveMax}%</span>
        <span class="text-xs" style="color:var(--orange)">warn: ${effectiveWarn}%</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
        ${prods.map(p => {
          const ov = (pol.productOverrides || {})[p.id];
          const hasOv = ov !== undefined;
          const dispMax  = hasOv ? ov.max  : effectiveMax;
          const dispWarn = hasOv ? ov.warn : effectiveWarn;
          return `
          <div style="border:1.5px solid ${hasOv ? 'var(--primary)' : 'var(--border)'};border-radius:10px;padding:12px;background:${hasOv ? 'var(--primary)08' : '#fff'}">
            <div style="font-weight:600;font-size:0.85rem;margin-bottom:2px">${p.name} ${p.flavor}</div>
            <div class="text-xs text-light mb-8">${p.code} · ${p.packSize}</div>
            ${hasOv ? '<span class="text-xs" style="color:var(--primary)">product override</span>' : '<span class="text-xs text-light">category / global</span>'}
            <div style="display:grid;grid-template-columns:1fr 1fr ${hasOv ? 'auto' : ''};gap:6px;margin-top:8px;align-items:end">
              <div>
                <div class="text-xs text-light mb-3">Hard Cap %</div>
                <input type="number" min="0" max="100" step="1"
                  value="${hasOv ? ov.max : ''}"
                  placeholder="${effectiveMax}"
                  style="width:100%;padding:5px 8px;border:1.5px solid ${hasOv ? 'var(--red)' : 'var(--border)'};border-radius:6px;font-size:0.88rem;font-weight:${hasOv ? 700 : 400};text-align:center;color:var(--red)"
                  onchange="window.ERP._discSetProdCap(${pol.id}, ${p.id}, 'max', this.value)">
              </div>
              <div>
                <div class="text-xs text-light mb-3">Warn At %</div>
                <input type="number" min="0" max="100" step="1"
                  value="${hasOv ? ov.warn : ''}"
                  placeholder="${effectiveWarn}"
                  style="width:100%;padding:5px 8px;border:1.5px solid ${hasOv ? 'var(--orange)' : 'var(--border)'};border-radius:6px;font-size:0.88rem;font-weight:${hasOv ? 700 : 400};text-align:center;color:var(--orange)"
                  onchange="window.ERP._discSetProdCap(${pol.id}, ${p.id}, 'warn', this.value)">
              </div>
              ${hasOv ? `<button title="Reset to category/global" style="padding:5px 7px;border:1px solid var(--border);border-radius:6px;background:#fff;cursor:pointer;font-size:0.75rem;color:var(--text-light);align-self:flex-end" onclick="window.ERP._discClearProdCap(${pol.id}, ${p.id})">↺</button>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  });
  return html || '<p class="text-light">No products in this view.</p>';
}

// ───────────────────────────────────────────────────────────
//  ASSIGN DISCOUNT POLICIES PAGE
// ───────────────────────────────────────────────────────────
function assignDiscPage() {
  _discGuard();
  const tab = window._discAssignTab || 'salespeople';
  const policies = window._discPolicies;
  const salespeople = USERS.filter(u => u.role === 'Salesperson');

  const tabBtn = (key, label) => `
    <button onclick="window.ERP._discSetAssignTab('${key}')"
      style="padding:8px 18px;border-radius:8px;cursor:pointer;font-weight:${tab === key ? 700 : 400};
        border:2px solid ${tab === key ? 'var(--primary)' : 'var(--border)'};
        background:${tab === key ? 'var(--primary)' : '#fff'};
        color:${tab === key ? '#fff' : 'var(--text)'}">
      ${label}
    </button>`;

  return `
  <div class="section-title">
    <h2>🔀 Assign Discount Policies</h2>
    <div style="margin-left:auto;display:flex;gap:8px">
      <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/disc-policies')">✂️ Manage Policies</button>
      <button class="btn-primary btn-sm" onclick="window.ERP._discSaveAssign()">💾 Save</button>
    </div>
  </div>

  <div class="info-box mb-16">
    💡 A <strong>salesperson's policy</strong> governs all orders they place unless the customer has their own override. Customer overrides take priority — use them for VIP customers, prepay-only accounts, or customers with special pricing agreements.
  </div>

  <!-- Tab strip -->
  <div style="display:flex;gap:8px;margin-bottom:20px">
    ${tabBtn('salespeople', '👤 Salespersons (' + salespeople.length + ')')}
    ${tabBtn('customers',   '🏢 Customer Overrides (' + CUSTOMERS.filter(c => window._discCustAssign[c.id] !== null).length + ')')}
  </div>

  ${tab === 'salespeople' ? `
  <!-- Salesperson assignments -->
  <div class="card mb-16">
    <h4 style="margin-top:0">👤 Salesperson Policy Assignment</h4>
    <p class="text-sm text-light mb-16">The selected policy applies to all orders placed by this salesperson, unless a customer override exists.</p>
    <table>
      <thead><tr><th>Rep</th><th>Email</th><th>Status</th><th>Assigned Policy</th><th>Effective Caps</th></tr></thead>
      <tbody>
        ${salespeople.map(u => {
          const polId   = window._discSalesAssign[u.id] || 1;
          const pol     = policies.find(p => p.id === polId) || policies[0];
          return `<tr>
            <td>
              <strong>${u.name}</strong>
              <div class="text-xs text-light">${u.role}</div>
            </td>
            <td class="text-sm text-light">${u.email}</td>
            <td><span class="badge badge-${u.status === 'Active' ? 'green' : 'red'}">${u.status}</span></td>
            <td>
              <select id="disc-sales-${u.id}"
                onchange="window.ERP._discPreviewSales(${u.id}, parseInt(this.value))"
                style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem;min-width:180px">
                ${policies.map(p => `<option value="${p.id}" ${polId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
              </select>
            </td>
            <td class="text-sm">
              <span style="color:var(--red);font-weight:600">${pol.globalMax}% cap</span>
              <span class="text-light"> / </span>
              <span style="color:var(--orange)">${pol.globalWarn}% warn</span>
              ${pol.orderMax != null ? `<span class="text-light"> / order max </span><span style="font-weight:600">${pol.orderMax}%</span>` : ''}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
  ` : `
  <!-- Customer overrides -->
  <div class="card mb-16">
    <h4 style="margin-top:0">🏢 Customer Policy Overrides</h4>
    <p class="text-sm text-light mb-16">When set, this policy is used for any order placed for this customer — regardless of the rep's policy. Clear to fall back to the rep's assigned policy.</p>
    <table>
      <thead><tr><th>Customer</th><th>Type</th><th>Status</th><th>Override Policy</th><th>Effective</th></tr></thead>
      <tbody>
        ${CUSTOMERS.map(c => {
          const polId = window._discCustAssign[c.id];
          const pol   = polId ? policies.find(p => p.id === polId) : null;
          return `<tr>
            <td>
              <strong>${c.name}</strong>
              <div class="text-xs text-light">${c.code}</div>
            </td>
            <td class="text-sm">${c.type}</td>
            <td><span class="badge badge-${c.status === 'Active' ? 'green' : 'red'}">${c.status}</span></td>
            <td>
              <div style="display:flex;gap:6px;align-items:center">
                <select id="disc-cust-${c.id}"
                  onchange="window.ERP._discPreviewCust(${c.id}, this.value)"
                  style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem;min-width:180px">
                  <option value="">— Inherit from rep —</option>
                  ${policies.map(p => `<option value="${p.id}" ${polId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
                </select>
                ${polId ? `<button class="btn-ghost btn-sm" title="Clear override" onclick="window.ERP._discClearCustOverride(${c.id})">✕</button>` : ''}
              </div>
            </td>
            <td class="text-sm">
              ${pol
                ? `<span style="color:var(--primary);font-weight:600">${pol.name}</span> <span class="text-xs text-light">(override)</span>`
                : `<span class="text-light text-xs">Rep's policy</span>`}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>
  `}

  <!-- Summary -->
  <div class="card">
    <h4 style="margin-top:0">📊 Policy Coverage Summary</h4>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
      ${policies.map(pol => {
        const sc = salespeople.filter(u => window._discSalesAssign[u.id] === pol.id).length;
        const cc = CUSTOMERS.filter(c => window._discCustAssign[c.id] === pol.id).length;
        return `<div style="padding:12px;border:1.5px solid var(--border);border-radius:10px;background:#fff">
          <div style="font-weight:700;margin-bottom:4px">${pol.name}</div>
          <div class="text-xs text-light mb-6">${pol.globalMax}% cap · ${pol.globalWarn}% warn</div>
          <div class="text-sm">👤 ${sc} rep${sc !== 1 ? 's' : ''}</div>
          <div class="text-sm">🏢 ${cc} customer override${cc !== 1 ? 's' : ''}</div>
        </div>`;
      }).join('')}
    </div>
  </div>

  <!-- Sticky save bar -->
  <div style="position:sticky;bottom:0;background:rgba(255,255,255,0.95);border-top:1px solid var(--border);padding:12px 24px;display:flex;justify-content:flex-end;gap:10px;backdrop-filter:blur(6px);margin-top:16px;border-radius:0 0 12px 12px">
    <button class="btn-outline" onclick="window.ERP.nav('#/accounting/disc-policies')">Cancel</button>
    <button class="btn-primary" onclick="window.ERP._discSaveAssign()">💾 Save Assignments</button>
  </div>`;
}

// ───────────────────────────────────────────────────────────
//  DISCOUNT POLICIES — window.ERP handlers
// ───────────────────────────────────────────────────────────
(function() {
  function rerender() {
    const c = document.querySelector('.m-content') || document.querySelector('.content');
    if (c) c.innerHTML = window._discEditId !== null ? renderDiscEditor() : renderDiscList();
  }
  function rerenderAssign() {
    const c = document.querySelector('.m-content') || document.querySelector('.content');
    if (c) c.innerHTML = assignDiscPage();
  }

  // ── List actions ──
  window.ERP._discNewPolicy = function() {
    const name = prompt('Policy name:', 'New Policy');
    if (!name) return;
    const desc = prompt('Description:', '') || '';
    const globalMax  = parseFloat(prompt('Hard cap % (block above this):', '15') || '15');
    const globalWarn = parseFloat(prompt('Warn at % :', '10') || '10');
    const orderMaxStr = prompt('Order-level max % (leave blank = no limit):', '');
    const orderMax = orderMaxStr === '' || orderMaxStr === null ? null : parseFloat(orderMaxStr);
    const id = window._discNextId++;
    window._discPolicies.push({ id, name, description: desc, globalMax, globalWarn, orderMax, categoryOverrides: {}, productOverrides: {} });
    window.ERP.toast(`✅ Policy "${name}" created`, 'success');
    rerender();
  };

  window.ERP._discEditPolicy = function(id) {
    window._discEditId    = id;
    window._discSearch    = '';
    window._discContainer = '12oz Can';
    window._discPackSize  = '24-pack';
    rerender();
  };

  window.ERP._discCloseEditor = function() {
    window._discEditId = null;
    rerender();
  };

  window.ERP._discDeletePolicy = function(id) {
    const pol = window._discPolicies.find(p => p.id === id);
    if (!pol) return;
    const inUse = USERS.filter(u => u.role === 'Salesperson' && window._discSalesAssign[u.id] === id).length
                + CUSTOMERS.filter(c => window._discCustAssign[c.id] === id).length;
    if (inUse > 0 && !confirm(`"${pol.name}" is assigned to ${inUse} rep/customer(s). Delete anyway?`)) return;
    window._discPolicies = window._discPolicies.filter(p => p.id !== id);
    window.ERP.toast(`Policy "${pol.name}" deleted`, 'warn');
    rerender();
  };

  // ── Editor helpers ──
  window.ERP._discRename = function(id, name) {
    const pol = window._discPolicies.find(p => p.id === id);
    if (pol && name.trim()) pol.name = name.trim();
  };

  window.ERP._discDescUpdate = function(id, desc) {
    const pol = window._discPolicies.find(p => p.id === id);
    if (pol) pol.description = desc;
  };

  window.ERP._discSetGlobal = function(id, field, val) {
    const pol = window._discPolicies.find(p => p.id === id);
    if (!pol) return;
    pol[field] = val;
    window.ERP.toast(`${field === 'globalMax' ? 'Hard cap' : field === 'globalWarn' ? 'Warning threshold' : 'Order max'} updated`, '');
  };

  window.ERP._discSetCatCap = function(id, catId, field, raw) {
    const pol = window._discPolicies.find(p => p.id === id);
    if (!pol) return;
    if (!pol.categoryOverrides) pol.categoryOverrides = {};
    if (!pol.categoryOverrides[catId]) pol.categoryOverrides[catId] = {};
    if (raw === '' || raw === null) {
      delete pol.categoryOverrides[catId][field];
      if (!Object.keys(pol.categoryOverrides[catId]).length) delete pol.categoryOverrides[catId];
    } else {
      pol.categoryOverrides[catId][field] = parseFloat(raw);
    }
  };

  window.ERP._discClearCatCap = function(id, catId) {
    const pol = window._discPolicies.find(p => p.id === id);
    if (!pol || !pol.categoryOverrides) return;
    delete pol.categoryOverrides[catId];
    window.ERP.toast('Category override cleared', '');
    rerender();
  };

  window.ERP._discSetProdCap = function(id, prodId, field, raw) {
    const pol = window._discPolicies.find(p => p.id === id);
    if (!pol) return;
    if (!pol.productOverrides) pol.productOverrides = {};
    if (!pol.productOverrides[prodId]) pol.productOverrides[prodId] = {};
    if (raw === '' || raw === null) {
      delete pol.productOverrides[prodId][field];
      if (!Object.keys(pol.productOverrides[prodId]).length) delete pol.productOverrides[prodId];
    } else {
      pol.productOverrides[prodId][field] = parseFloat(raw);
    }
    // Soft update of badge
    const prodOverCount = Object.keys(pol.productOverrides || {}).length;
    const badge = document.querySelector('.disc-prod-count');
    if (badge) badge.textContent = `${prodOverCount} override${prodOverCount !== 1 ? 's' : ''} set`;
  };

  window.ERP._discClearProdCap = function(id, prodId) {
    const pol = window._discPolicies.find(p => p.id === id);
    if (!pol || !pol.productOverrides) return;
    delete pol.productOverrides[prodId];
    window.ERP.toast('Product override cleared', '');
    rerender();
  };

  window.ERP._discResetProductOverrides = function(id) {
    if (!confirm('Clear all product-level overrides for this policy?')) return;
    const pol = window._discPolicies.find(p => p.id === id);
    if (!pol) return;
    pol.productOverrides = {};
    window.ERP.toast('All product overrides cleared', 'warn');
    rerender();
  };

  // Container / pack nav
  window.ERP._discSetContainer = function(key) {
    window._discContainer = key;
    window._discSearch    = '';
    rerender();
  };
  window.ERP._discSetPackSize = function(ps) {
    window._discPackSize = ps;
    rerender();
  };
  window.ERP._discSearchProducts = function(q) {
    window._discSearch = q;
    rerender();
  };

  // ── Assign page actions ──
  window.ERP._discSetAssignTab = function(tab) {
    window._discAssignTab = tab;
    rerenderAssign();
  };

  window.ERP._discPreviewSales = function(userId, polId) {
    window._discSalesAssign[userId] = polId;
  };

  window.ERP._discPreviewCust = function(custId, raw) {
    window._discCustAssign[custId] = raw === '' ? null : parseInt(raw);
  };

  window.ERP._discClearCustOverride = function(custId) {
    window._discCustAssign[custId] = null;
    rerenderAssign();
  };

  window.ERP._discSaveAssign = function() {
    // Persist selects for salesperson tab
    USERS.filter(u => u.role === 'Salesperson').forEach(u => {
      const sel = document.getElementById(`disc-sales-${u.id}`);
      if (sel) window._discSalesAssign[u.id] = parseInt(sel.value);
    });
    // Persist selects for customer tab
    CUSTOMERS.forEach(c => {
      const sel = document.getElementById(`disc-cust-${c.id}`);
      if (sel) window._discCustAssign[c.id] = sel.value === '' ? null : parseInt(sel.value);
    });
    window.ERP.toast('✅ Discount policy assignments saved', 'success');
    rerenderAssign();
  };
})();



// ═══════════════════════════════════════════════════════════
//  EXPLORER SHARED STATE + COMPONENTS
// ═══════════════════════════════════════════════════════════

// ── Fake geo coordinates for customers (Boston area) ──
const CUSTOMER_GEO = {
  1: { x: 62, y: 38, area: 'Downtown' },    // Bella Cucina — Hanover St
  2: { x: 72, y: 52, area: 'Seaport' },     // Harbor Grill — Seaport
  3: { x: 35, y: 25, area: 'Cambridge' },   // Fresh Market — Cambridge
  4: { x: 68, y: 45, area: 'Downtown' },    // Ocean Prime — Atlantic Ave
  5: { x: 58, y: 42, area: 'Downtown' },    // Tony's Pizza DT — Summer St
  6: { x: 56, y: 40, area: 'Downtown' },    // Tony's HQ — Federal St
  7: { x: 30, y: 20, area: 'Cambridge' },   // Cambridge Catering — Mass Ave
  8: { x: 38, y: 15, area: 'Somerville' },  // Sunrise Bakery — Broadway
  9: { x: 75, y: 48, area: 'Waterfront' },  // Waterfront Hotel — Harbor Way
  10:{ x: 52, y: 35, area: 'Back Bay' },    // Green Leaf — Newbury St
};
const AREAS = ['Downtown', 'Seaport', 'Cambridge', 'Somerville', 'Waterfront', 'Back Bay'];

(function initExplorers() {
  if (window._explorerState) return;
  window._savedViews = JSON.parse(JSON.stringify(SAVED_VIEWS_SEED));
  window._svNextId = 100;
  window._explorerState = {
    dateFrom: '2026-01-01', dateTo: '2026-02-27',
    mapSelection: null, // {x1,y1,x2,y2} or null
    customer: { search:'', type:'', tier:'', status:'', priceLevel:'', terms:'', route:'', area:'', salesperson:'', hasOverdue:false, hasOpenOrders:false, productFilter:'', sortBy:'revenue', sortDir:'desc', selected: new Set(), page:1, minRevenue:'', maxBalance:'', minOnTime:'', customerSince:'' },
    sales:    { search:'', status:'', route:'', minQuota:'', minRevenue:'', maxDiscount:'', minCollection:'', sortBy:'revenue', sortDir:'desc', selected: new Set() },
    product:  { search:'', category:'', size:'', packSize:'', stockStatus:'', material:'', minRevenue:'', minUnitsSold:'', sortBy:'revenue', sortDir:'desc', selected: new Set() },
    bulkPanel: null,  // null or { type:'tier', explorerType:'customer' }
  };
})();

// ── Date Range Picker component ──
function dateRangePickerHTML() {
  const st = window._explorerState;
  return `
  <div class="card mb-16" style="padding:12px 16px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <span style="font-weight:700;font-size:0.9rem">📅 Date Range</span>
      <div style="display:flex;align-items:center;gap:6px">
        <input type="date" value="${st.dateFrom}" onchange="window.ERP._expDateRange('from',this.value)" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
        <span class="text-light">→</span>
        <input type="date" value="${st.dateTo}" onchange="window.ERP._expDateRange('to',this.value)" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
      </div>
      <div style="display:flex;gap:4px">
        <button class="btn-sm btn-outline" onclick="window.ERP._expDatePreset('7d')">7d</button>
        <button class="btn-sm btn-outline" onclick="window.ERP._expDatePreset('30d')">30d</button>
        <button class="btn-sm btn-outline" onclick="window.ERP._expDatePreset('90d')">90d</button>
        <button class="btn-sm btn-outline" onclick="window.ERP._expDatePreset('ytd')">YTD</button>
        <button class="btn-sm btn-outline" onclick="window.ERP._expDatePreset('all')">All</button>
      </div>
      ${st.mapSelection ? `<span class="badge badge-green" style="font-size:0.75rem">📍 Map area active</span><button class="btn-sm btn-outline" onclick="window.ERP._expClearMap()" style="font-size:0.7rem">✕ Clear map</button>` : ''}
    </div>
  </div>`;
}

// ── Map widget component ──
function mapWidgetHTML(explorerType) {
  const sel = window._explorerState.mapSelection;
  // Customer dots
  const dots = CUSTOMERS.map(c => {
    const g = CUSTOMER_GEO[c.id];
    if (!g) return '';
    const inSelection = sel ? (g.x >= Math.min(sel.x1,sel.x2) && g.x <= Math.max(sel.x1,sel.x2) && g.y >= Math.min(sel.y1,sel.y2) && g.y <= Math.max(sel.y1,sel.y2)) : true;
    const color = inSelection ? 'var(--primary)' : '#cbd5e1';
    const m = CUSTOMER_METRICS[c.id] || {};
    const size = m.revenue > 40000 ? 12 : m.revenue > 15000 ? 9 : 6;
    return `<div title="${c.name}&#10;${g.area} · ${fmt$(m.revenue||0)} rev" style="position:absolute;left:${g.x}%;top:${g.y}%;width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.2);cursor:pointer;transform:translate(-50%,-50%);transition:all 0.2s;z-index:${inSelection?2:1}" onclick="window.ERP._expMapDotClick(${c.id},'${explorerType}')"></div>`;
  }).join('');

  // Area labels
  const labels = [
    { name:'Downtown', x:60, y:44 }, { name:'Seaport', x:74, y:56 },
    { name:'Cambridge', x:32, y:28 }, { name:'Somerville', x:40, y:12 },
    { name:'Waterfront', x:78, y:42 }, { name:'Back Bay', x:48, y:38 }
  ];
  const labelHTML = labels.map(l => `<span style="position:absolute;left:${l.x}%;top:${l.y+6}%;font-size:0.6rem;color:var(--text-light);pointer-events:none;transform:translateX(-50%)">${l.name}</span>`).join('');

  // Selection rect
  const selRect = sel ? `<div style="position:absolute;left:${Math.min(sel.x1,sel.x2)}%;top:${Math.min(sel.y1,sel.y2)}%;width:${Math.abs(sel.x2-sel.x1)}%;height:${Math.abs(sel.y2-sel.y1)}%;background:rgba(59,130,246,0.12);border:2px dashed var(--primary);border-radius:4px;pointer-events:none;z-index:3"></div>` : '';

  return `
  <div class="card mb-16" style="padding:12px 16px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="font-weight:700;font-size:0.9rem">🗺️ Area Map</span>
      <span class="text-xs text-light">Click & drag to select region · Click dot for details</span>
    </div>
    <div id="exp-map" style="position:relative;width:100%;height:200px;background:linear-gradient(135deg,#e8f0fe 0%,#f0f4ff 40%,#dbeafe 70%,#bfdbfe 100%);border-radius:12px;border:1px solid var(--border);overflow:hidden;cursor:crosshair;user-select:none"
         onmousedown="window.ERP._expMapDown(event)" onmousemove="window.ERP._expMapMove(event)" onmouseup="window.ERP._expMapUp(event)">
      <!-- Fake roads -->
      <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0.15">
        <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="#64748b" stroke-width="2"/>
        <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="#64748b" stroke-width="2"/>
        <line x1="30%" y1="20%" x2="70%" y2="55%" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4"/>
        <line x1="60%" y1="30%" x2="80%" y2="55%" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4"/>
        <rect x="15%" y="5%" width="30%" height="25%" rx="6" fill="#94a3b8" opacity="0.08"/>
        <rect x="45%" y="30%" width="25%" height="20%" rx="6" fill="#94a3b8" opacity="0.08"/>
        <text x="10%" y="95%" font-size="9" fill="#94a3b8">Boston Metro Area</text>
      </svg>
      ${dots}
      ${labelHTML}
      ${selRect}
    </div>
  </div>`;
}

// ── Inline Bulk Action Panel (replaces browser prompts) ──
function bulkActionPanelHTML(explorerType) {
  const bp = window._explorerState.bulkPanel;
  if (!bp || bp.explorerType !== explorerType) return '';

  let inner = '';
  switch(bp.type) {
    case 'tier':
      inner = `<label class="text-sm" style="font-weight:600">Apply Credit Tier</label>
        <select id="bulk-tier-val" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem">
          <option value="A">A — Established</option><option value="B">B — Good Standing</option>
          <option value="C">C — New/Flagged</option><option value="Prepay">Prepay</option>
        </select>
        <button class="btn-primary btn-sm" onclick="window.ERP._expBulkConfirm()">Apply</button>`;
      break;
    case 'priceLevel':
      inner = `<label class="text-sm" style="font-weight:600">Apply Price Level</label>
        <select id="bulk-pl-val" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem">
          ${PRICE_LEVELS.map(l => `<option value="${l.name}">${l.name}</option>`).join('')}
        </select>
        <button class="btn-primary btn-sm" onclick="window.ERP._expBulkConfirm()">Apply</button>`;
      break;
    case 'discCap':
      inner = `<label class="text-sm" style="font-weight:600">Override Discount Cap %</label>
        <select id="bulk-dc-val" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem">
          <option value="5">5%</option><option value="8">8%</option><option value="10" selected>10%</option>
          <option value="12">12%</option><option value="15">15%</option><option value="20">20%</option>
        </select>
        <button class="btn-primary btn-sm" onclick="window.ERP._expBulkConfirm()">Apply</button>`;
      break;
    case 'discPolicy':
      inner = `<label class="text-sm" style="font-weight:600">Apply Disc Policy</label>
        <select id="bulk-dp-val" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem">
          <option value="Standard">Standard</option><option value="Volume">Volume</option>
          <option value="Premium">Premium</option><option value="None">None</option>
        </select>
        <button class="btn-primary btn-sm" onclick="window.ERP._expBulkConfirm()">Apply</button>`;
      break;
    case 'quota':
      inner = `<label class="text-sm" style="font-weight:600">Set Monthly Quota</label>
        <select id="bulk-q-val" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem">
          <option value="75000">$75,000</option><option value="100000">$100,000</option>
          <option value="125000">$125,000</option><option value="150000" selected>$150,000</option>
          <option value="175000">$175,000</option><option value="200000">$200,000</option>
        </select>
        <button class="btn-primary btn-sm" onclick="window.ERP._expBulkConfirm()">Apply</button>`;
      break;
    case 'adjustPrice':
      inner = `<label class="text-sm" style="font-weight:600">Price Adjustment</label>
        <select id="bulk-ap-val" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem">
          <option value="-10">-10%</option><option value="-5">-5%</option>
          <option value="5">+5%</option><option value="10">+10%</option>
          <option value="15" selected>+15%</option><option value="20">+20%</option>
        </select>
        <button class="btn-primary btn-sm" onclick="window.ERP._expBulkConfirm()">Apply</button>`;
      break;
    case 'productDiscCap':
      inner = `<label class="text-sm" style="font-weight:600">Category Disc Cap</label>
        <select id="bulk-pdc-val" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem">
          <option value="5">5%</option><option value="8">8%</option><option value="10" selected>10%</option>
          <option value="12">12%</option><option value="15">15%</option>
        </select>
        <button class="btn-primary btn-sm" onclick="window.ERP._expBulkConfirm()">Apply</button>`;
      break;
    case 'saveGroup':
      inner = `<label class="text-sm" style="font-weight:600">Group Name</label>
        <input id="bulk-sg-val" type="text" value="My Group" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem;min-width:180px">
        <button class="btn-primary btn-sm" onclick="window.ERP._expBulkConfirm()">Save</button>`;
      break;
    default: inner = `<span class="text-sm">Unknown action</span>`;
  }

  return `
  <div class="card mb-16" style="padding:10px 16px;background:#fffbe6;border:1px solid var(--orange);border-radius:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
    ${inner}
    <button class="btn-outline btn-sm" onclick="window.ERP._expBulkCancel()" style="margin-left:auto">✕ Cancel</button>
  </div>`;
}

// ── Shared handler IIFE for date range, map, bulk panel ──
(function() {
  // Date range
  window.ERP._expDateRange = function(which, val) {
    if (which === 'from') window._explorerState.dateFrom = val;
    else window._explorerState.dateTo = val;
    // Rerender whichever explorer is active
    _expRerender();
  };
  window.ERP._expDatePreset = function(preset) {
    const st = window._explorerState;
    const today = new Date('2026-02-27');
    switch(preset) {
      case '7d':  st.dateFrom = '2026-02-20'; break;
      case '30d': st.dateFrom = '2026-01-28'; break;
      case '90d': st.dateFrom = '2025-11-29'; break;
      case 'ytd': st.dateFrom = '2026-01-01'; break;
      case 'all': st.dateFrom = '2025-01-01'; break;
    }
    st.dateTo = '2026-02-27';
    _expRerender();
  };

  // Map drag selection
  let mapDragging = false, mapStart = null;
  window.ERP._expMapDown = function(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    mapStart = { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 };
    mapDragging = true;
  };
  window.ERP._expMapMove = function(e) {
    if (!mapDragging || !mapStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x2 = ((e.clientX - rect.left) / rect.width) * 100;
    const y2 = ((e.clientY - rect.top) / rect.height) * 100;
    window._explorerState.mapSelection = { x1: mapStart.x, y1: mapStart.y, x2, y2 };
    // Live preview — update just the map
    const mapEl = document.getElementById('exp-map');
    if (mapEl) {
      const sel = window._explorerState.mapSelection;
      let overlay = mapEl.querySelector('.map-sel-overlay');
      if (!overlay) { overlay = document.createElement('div'); overlay.className = 'map-sel-overlay'; overlay.style.cssText = 'position:absolute;border:2px dashed var(--primary);background:rgba(59,130,246,0.12);border-radius:4px;pointer-events:none;z-index:3'; mapEl.appendChild(overlay); }
      overlay.style.left = Math.min(sel.x1,sel.x2)+'%'; overlay.style.top = Math.min(sel.y1,sel.y2)+'%';
      overlay.style.width = Math.abs(sel.x2-sel.x1)+'%'; overlay.style.height = Math.abs(sel.y2-sel.y1)+'%';
    }
  };
  window.ERP._expMapUp = function(e) {
    if (!mapDragging) return;
    mapDragging = false;
    if (mapStart) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x2 = ((e.clientX - rect.left) / rect.width) * 100;
      const y2 = ((e.clientY - rect.top) / rect.height) * 100;
      // If drag is too small, treat as just a click (clear selection)
      if (Math.abs(x2 - mapStart.x) < 3 && Math.abs(y2 - mapStart.y) < 3) {
        window._explorerState.mapSelection = null;
      } else {
        window._explorerState.mapSelection = { x1: mapStart.x, y1: mapStart.y, x2, y2 };
      }
    }
    mapStart = null;
    _expRerender();
  };
  window.ERP._expClearMap = function() {
    window._explorerState.mapSelection = null;
    _expRerender();
  };
  window.ERP._expMapDotClick = function(custId, explorerType) {
    const c = CUSTOMERS.find(x=>x.id===custId);
    if (!c) return;
    if (explorerType === 'customer') {
      window.ERP.nav('#/accounting/customer-account?id=' + custId);
    }
  };

  // Bulk panel
  window.ERP._expBulkCancel = function() {
    window._explorerState.bulkPanel = null;
    _expRerender();
  };
  window.ERP._expBulkConfirm = function() {
    const bp = window._explorerState.bulkPanel;
    if (!bp) return;
    let count = 0;
    if (bp.explorerType === 'customer') count = window._explorerState.customer.selected.size;
    else if (bp.explorerType === 'sales') count = window._explorerState.sales.selected.size;
    else if (bp.explorerType === 'product') count = window._explorerState.product.selected.size;

    switch(bp.type) {
      case 'tier': { const v = document.getElementById('bulk-tier-val'); window.ERP.toast(`🎛️ Tier "${v?v.value:'B'}" applied to ${count} customer(s)`, 'success'); break; }
      case 'priceLevel': {
        const v = document.getElementById('bulk-pl-val');
        const lvl = v ? v.value : '';
        // Check for conflicts → trigger merger
        const ids = [...window._explorerState.customer.selected];
        const conflicts = ids.filter(id => { const c = CUSTOMERS.find(x=>x.id===id); return c && c.priceLevel !== lvl; });
        if (conflicts.length > 0) {
          window._priceMergerState = { sourceLevelName: lvl, targetCustomerIds: ids };
          window._explorerState.bulkPanel = null;
          window._explorerState.customer.selected.clear();
          window.ERP.nav('#/accounting/price-merger');
          return;
        }
        window.ERP.toast(`🏷️ Price level "${lvl}" applied to ${count} customer(s)`, 'success');
        break;
      }
      case 'discCap': { const v = document.getElementById('bulk-dc-val'); window.ERP.toast(`✂️ Disc cap ${v?v.value:'10'}% applied to ${count} customer(s)`, 'success'); break; }
      case 'discPolicy': { const v = document.getElementById('bulk-dp-val'); window.ERP.toast(`✂️ Disc policy "${v?v.value:'Standard'}" applied to ${count} rep(s)`, 'success'); break; }
      case 'quota': { const v = document.getElementById('bulk-q-val'); window.ERP.toast(`🎯 Quota set to ${fmt$(parseFloat(v?v.value:'150000'))} for ${count} rep(s)`, 'success'); break; }
      case 'adjustPrice': { const v = document.getElementById('bulk-ap-val'); window.ERP.toast(`🏷️ Price adjustment ${v?v.value:'+15'}% applied to ${count} product(s)`, 'success'); break; }
      case 'productDiscCap': { const v = document.getElementById('bulk-pdc-val'); window.ERP.toast(`✂️ Disc cap ${v?v.value:'10'}% applied to ${count} product(s)`, 'success'); break; }
      case 'saveGroup': {
        const v = document.getElementById('bulk-sg-val');
        const name = v ? v.value : 'My Group';
        const type = bp.explorerType === 'customer' ? 'customers' : bp.explorerType === 'sales' ? 'salespeople' : 'products';
        const icon = bp.explorerType === 'customer' ? '👥' : bp.explorerType === 'sales' ? '👤' : '📦';
        const ids = bp.explorerType === 'customer' ? [...window._explorerState.customer.selected] : bp.explorerType === 'sales' ? [...window._explorerState.sales.selected] : [...window._explorerState.product.selected];
        const entry = { id: window._svNextId++, name, type, icon, createdBy: 'Lisa Chen', created: '2026-02-27', filters: {}, description: `${ids.length} items` };
        if (bp.explorerType === 'customer') entry.customerIds = ids;
        else if (bp.explorerType === 'product') entry.productIds = ids;
        else entry.userIds = ids;
        window._savedViews.push(entry);
        window.ERP.toast(`💾 Group "${name}" saved with ${ids.length} items`, 'success');
        break;
      }
    }
    // Clear selection and panel
    if (bp.explorerType === 'customer') window._explorerState.customer.selected.clear();
    else if (bp.explorerType === 'sales') window._explorerState.sales.selected.clear();
    else if (bp.explorerType === 'product') window._explorerState.product.selected.clear();
    window._explorerState.bulkPanel = null;
    _expRerender();
  };

  // Generic rerender
  function _expRerender() {
    const hash = location.hash || '';
    let fn;
    if (hash.includes('customer-explorer')) fn = customerExplorerPage;
    else if (hash.includes('sales-explorer')) fn = salesExplorerPage;
    else if (hash.includes('product-explorer')) fn = productExplorerPage;
    else if (hash.includes('saved-views')) fn = savedViewsPage;
    if (fn) { const c = document.querySelector('.m-content') || document.querySelector('.content'); if (c) c.innerHTML = fn(); }
  }
  window._expRerender = _expRerender;
})();

// ═══════════════════════════════════════════════════════════
//  CUSTOMER EXPLORER PAGE
// ═══════════════════════════════════════════════════════════
function customerExplorerPage() {
  const st = window._explorerState.customer;

  // ── Filter customers ──
  let list = CUSTOMERS.slice();
  if (st.search) { const q = st.search.toLowerCase(); list = list.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)); }
  if (st.type) list = list.filter(c => c.type === st.type);
  if (st.tier) list = list.filter(c => c.creditTier === st.tier);
  if (st.status) list = list.filter(c => c.status === st.status);
  if (st.priceLevel) list = list.filter(c => c.priceLevel === st.priceLevel);
  if (st.terms) list = list.filter(c => c.terms === st.terms);
  if (st.route) list = list.filter(c => c.route === st.route);
  if (st.area) list = list.filter(c => { const g = CUSTOMER_GEO[c.id]; return g && g.area === st.area; });
  if (st.salesperson) {
    const spName = st.salesperson;
    list = list.filter(c => ORDERS.some(o => o.customer === c.id && o.salesperson === spName));
  }
  if (st.hasOverdue) list = list.filter(c => (CUSTOMER_METRICS[c.id]||{}).overdue > 0);
  if (st.hasOpenOrders) list = list.filter(c => ORDERS.some(o => o.customer === c.id && o.status !== 'Delivered'));
  if (st.customerSince) list = list.filter(c => c.lastOrder && c.lastOrder >= st.customerSince);
  if (st.minRevenue) list = list.filter(c => (CUSTOMER_METRICS[c.id]||{}).revenue >= parseFloat(st.minRevenue));
  if (st.maxBalance) list = list.filter(c => c.balance <= parseFloat(st.maxBalance));
  if (st.minOnTime) list = list.filter(c => (CUSTOMER_METRICS[c.id]||{}).paidOnTime >= parseFloat(st.minOnTime));
  // Map area selection filter
  const mapSel = window._explorerState.mapSelection;
  if (mapSel) {
    list = list.filter(c => {
      const g = CUSTOMER_GEO[c.id];
      if (!g) return false;
      return g.x >= Math.min(mapSel.x1,mapSel.x2) && g.x <= Math.max(mapSel.x1,mapSel.x2) &&
             g.y >= Math.min(mapSel.y1,mapSel.y2) && g.y <= Math.max(mapSel.y1,mapSel.y2);
    });
  }

  // ── Sort ──
  const dir = st.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    const ma = CUSTOMER_METRICS[a.id]||{}, mb = CUSTOMER_METRICS[b.id]||{};
    switch(st.sortBy) {
      case 'name':       return dir * a.name.localeCompare(b.name);
      case 'revenue':    return dir * ((ma.revenue||0) - (mb.revenue||0));
      case 'balance':    return dir * (a.balance - b.balance);
      case 'overdue':    return dir * ((ma.overdue||0) - (mb.overdue||0));
      case 'orders':     return dir * ((ma.orders||0) - (mb.orders||0));
      case 'paidOnTime': return dir * ((ma.paidOnTime||0) - (mb.paidOnTime||0));
      case 'avgPayDays': return dir * ((ma.avgPayDays||0) - (mb.avgPayDays||0));
      case 'daysSince':  return dir * ((ma.daysSinceOrder||0) - (mb.daysSinceOrder||0));
      case 'avgOrder':   return dir * ((ma.avgOrder||0) - (mb.avgOrder||0));
      case 'lastOrder':  return dir * ((a.lastOrder||'').localeCompare(b.lastOrder||''));
      case 'creditLimit':return dir * (a.creditLimit - b.creditLimit);
      default:           return dir * ((ma.revenue||0) - (mb.revenue||0));
    }
  });

  // ── KPI tiles ──
  const totRev = list.reduce((s,c) => s + ((CUSTOMER_METRICS[c.id]||{}).revenue||0), 0);
  const totBal = list.reduce((s,c) => s + c.balance, 0);
  const totOverdue = list.reduce((s,c) => s + ((CUSTOMER_METRICS[c.id]||{}).overdue||0), 0);
  const avgPayD = list.length ? (list.reduce((s,c) => s + ((CUSTOMER_METRICS[c.id]||{}).avgPayDays||0), 0) / list.length).toFixed(0) : 0;
  const avgOnTime = list.length ? (list.reduce((s,c) => s + ((CUSTOMER_METRICS[c.id]||{}).paidOnTime||0), 0) / list.length).toFixed(0) : 0;

  const selCount = st.selected.size;

  // ── active filter badges ──
  const activeFilters = [];
  if (st.type) activeFilters.push({label:'Type: '+st.type, clear:() => { st.type=''; }});
  if (st.tier) activeFilters.push({label:'Tier: '+st.tier, clear:() => { st.tier=''; }});
  if (st.status) activeFilters.push({label:'Status: '+st.status, clear:() => { st.status=''; }});
  if (st.priceLevel) activeFilters.push({label:'Price: '+st.priceLevel, clear:() => { st.priceLevel=''; }});
  if (st.terms) activeFilters.push({label:'Terms: '+st.terms, clear:() => { st.terms=''; }});
  if (st.route) activeFilters.push({label:'Route: '+st.route, clear:() => { st.route=''; }});
  if (st.area) activeFilters.push({label:'Area: '+st.area, clear:() => { st.area=''; }});
  if (st.salesperson) activeFilters.push({label:'Rep: '+st.salesperson, clear:() => { st.salesperson=''; }});
  if (st.hasOverdue) activeFilters.push({label:'Has Overdue', clear:() => { st.hasOverdue=false; }});
  if (st.hasOpenOrders) activeFilters.push({label:'Open Orders', clear:() => { st.hasOpenOrders=false; }});
  if (st.customerSince) activeFilters.push({label:'Since: '+st.customerSince, clear:() => { st.customerSince=''; }});
  if (st.minRevenue) activeFilters.push({label:'Rev ≥ '+fmt$(parseFloat(st.minRevenue)), clear:() => { st.minRevenue=''; }});
  if (st.maxBalance) activeFilters.push({label:'Bal ≤ '+fmt$(parseFloat(st.maxBalance)), clear:() => { st.maxBalance=''; }});
  if (st.minOnTime) activeFilters.push({label:'OT ≥ '+st.minOnTime+'%', clear:() => { st.minOnTime=''; }});
  // Store for handler
  window._custActiveFilters = activeFilters;

  // ── Render ──
  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
    <div><h2 style="margin:0">👥 Customer Explorer</h2><span class="text-sm text-light">${list.length} customers${selCount ? ` · ${selCount} selected` : ''}</span></div>
    <div style="display:flex;gap:6px">
      <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/saved-views')">📂 Saved Views</button>
      <button class="btn-outline btn-sm" onclick="window.ERP._custToggleFilters()">🔽 ${window._custShowFilters ? 'Hide' : 'Show'} Filters</button>
    </div>
  </div>

  ${dateRangePickerHTML()}

  <!-- Metric Filters (date-range-dependent) -->
  <div class="card mb-16" style="padding:12px 16px;border-left:4px solid var(--primary);background:#f8faff">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <span style="font-weight:700;font-size:0.9rem">📊 Metric Filters</span>
      <span class="text-xs text-light">Values computed within <strong>${window._explorerState.dateFrom}</strong> → <strong>${window._explorerState.dateTo}</strong></span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">
      <div>
        <label class="text-xs text-light">Min Revenue</label>
        <select onchange="window.ERP._custFilter('minRevenue',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">Any</option>
          <option value="5000" ${st.minRevenue==='5000'?'selected':''}>≥ $5K</option>
          <option value="10000" ${st.minRevenue==='10000'?'selected':''}>≥ $10K</option>
          <option value="25000" ${st.minRevenue==='25000'?'selected':''}>≥ $25K</option>
          <option value="50000" ${st.minRevenue==='50000'?'selected':''}>≥ $50K</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Max Balance</label>
        <select onchange="window.ERP._custFilter('maxBalance',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">Any</option>
          <option value="1000" ${st.maxBalance==='1000'?'selected':''}>≤ $1K</option>
          <option value="5000" ${st.maxBalance==='5000'?'selected':''}>≤ $5K</option>
          <option value="10000" ${st.maxBalance==='10000'?'selected':''}>≤ $10K</option>
          <option value="25000" ${st.maxBalance==='25000'?'selected':''}>≤ $25K</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Min On-Time %</label>
        <select onchange="window.ERP._custFilter('minOnTime',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">Any</option>
          <option value="50" ${st.minOnTime==='50'?'selected':''}>≥ 50%</option>
          <option value="70" ${st.minOnTime==='70'?'selected':''}>≥ 70%</option>
          <option value="85" ${st.minOnTime==='85'?'selected':''}>≥ 85%</option>
          <option value="95" ${st.minOnTime==='95'?'selected':''}>≥ 95%</option>
        </select>
      </div>
    </div>
  </div>

  <!-- KPI Tiles -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px">
    <div class="tile tile-blue"><div class="tile-label">Total Revenue</div><div class="tile-value">${fmt$(totRev)}</div></div>
    <div class="tile tile-red"><div class="tile-label">Total Balance</div><div class="tile-value">${fmt$(totBal)}</div></div>
    <div class="tile tile-orange"><div class="tile-label">Total Overdue</div><div class="tile-value">${fmt$(totOverdue)}</div></div>
    <div class="tile tile-green"><div class="tile-label">Avg Pay Days</div><div class="tile-value">${avgPayD}d</div></div>
    <div class="tile tile-blue"><div class="tile-label">Avg On-Time</div><div class="tile-value">${avgOnTime}%</div></div>
    <div class="tile"><div class="tile-label">Customers</div><div class="tile-value">${list.length}</div></div>
  </div>

  ${mapWidgetHTML('customer')}

  <!-- Active Filters -->
  ${activeFilters.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${activeFilters.map((f,i) =>
    `<span class="badge badge-blue" style="cursor:pointer;font-size:0.75rem" onclick="window.ERP._custClearFilter(${i})">${f.label} ✕</span>`).join('')}
    <span class="badge" style="cursor:pointer;font-size:0.75rem;background:#fee2e2" onclick="window.ERP._custClearAllFilters()">Clear All ✕</span></div>` : ''}

  <!-- Search & Sort Row -->
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap">
    <input type="text" placeholder="🔍 Search customers..." value="${st.search}" oninput="window.ERP._custFilter('search',this.value)" style="flex:1;min-width:160px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem">
    <select onchange="window.ERP._custFilter('sortBy',this.value)" style="padding:8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
      <option value="revenue" ${st.sortBy==='revenue'?'selected':''}>Sort: Revenue</option>
      <option value="name" ${st.sortBy==='name'?'selected':''}>Sort: Name</option>
      <option value="balance" ${st.sortBy==='balance'?'selected':''}>Sort: Balance</option>
      <option value="overdue" ${st.sortBy==='overdue'?'selected':''}>Sort: Overdue</option>
      <option value="orders" ${st.sortBy==='orders'?'selected':''}>Sort: # Orders</option>
      <option value="paidOnTime" ${st.sortBy==='paidOnTime'?'selected':''}>Sort: On-Time %</option>
      <option value="avgPayDays" ${st.sortBy==='avgPayDays'?'selected':''}>Sort: Avg Pay Days</option>
      <option value="daysSince" ${st.sortBy==='daysSince'?'selected':''}>Sort: Days Since Order</option>
      <option value="avgOrder" ${st.sortBy==='avgOrder'?'selected':''}>Sort: Avg Order</option>
      <option value="lastOrder" ${st.sortBy==='lastOrder'?'selected':''}>Sort: Last Order</option>
      <option value="creditLimit" ${st.sortBy==='creditLimit'?'selected':''}>Sort: Credit Limit</option>
    </select>
    <button class="btn-sm btn-outline" onclick="window.ERP._custFilter('sortDir', '${st.sortDir==='asc'?'desc':'asc'}')">${st.sortDir==='asc'?'↑ Asc':'↓ Desc'}</button>
  </div>

  <!-- Filter Panel (collapsible) -->
  ${window._custShowFilters ? `
  <div class="card mb-16 explorer-filter-panel" style="padding:14px 16px">
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">
      <div>
        <label class="text-xs text-light">Type</label>
        <select onchange="window.ERP._custFilter('type',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All Types</option>
          <option value="Restaurant" ${st.type==='Restaurant'?'selected':''}>Restaurant</option>
          <option value="Deli" ${st.type==='Deli'?'selected':''}>Deli</option>
          <option value="Caterer" ${st.type==='Caterer'?'selected':''}>Caterer</option>
          <option value="Bakery" ${st.type==='Bakery'?'selected':''}>Bakery</option>
          <option value="Hotel" ${st.type==='Hotel'?'selected':''}>Hotel</option>
          <option value="Cafe" ${st.type==='Cafe'?'selected':''}>Cafe</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Credit Tier</label>
        <select onchange="window.ERP._custFilter('tier',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All Tiers</option>
          <option value="A" ${st.tier==='A'?'selected':''}>A — Established</option>
          <option value="B" ${st.tier==='B'?'selected':''}>B — Good Standing</option>
          <option value="C" ${st.tier==='C'?'selected':''}>C — New/Flagged</option>
          <option value="Prepay" ${st.tier==='Prepay'?'selected':''}>Prepay</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Status</label>
        <select onchange="window.ERP._custFilter('status',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All</option>
          <option value="Active" ${st.status==='Active'?'selected':''}>Active</option>
          <option value="On Hold" ${st.status==='On Hold'?'selected':''}>On Hold</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Price Level</label>
        <select onchange="window.ERP._custFilter('priceLevel',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All Levels</option>
          ${PRICE_LEVELS.map(l=> `<option value="${l.name}" ${st.priceLevel===l.name?'selected':''}>${l.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Terms</label>
        <select onchange="window.ERP._custFilter('terms',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All Terms</option>
          <option value="Net 30" ${st.terms==='Net 30'?'selected':''}>Net 30</option>
          <option value="Net 15" ${st.terms==='Net 15'?'selected':''}>Net 15</option>
          <option value="Net 45" ${st.terms==='Net 45'?'selected':''}>Net 45</option>
          <option value="COD" ${st.terms==='COD'?'selected':''}>COD</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Route</label>
        <select onchange="window.ERP._custFilter('route',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All Routes</option>
          <option value="Route A-1" ${st.route==='Route A-1'?'selected':''}>A-1: Downtown</option>
          <option value="Route B-2" ${st.route==='Route B-2'?'selected':''}>B-2: Cambridge</option>
          <option value="Route C-3" ${st.route==='Route C-3'?'selected':''}>C-3: South Shore</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Area</label>
        <select onchange="window.ERP._custFilter('area',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All Areas</option>
          ${AREAS.map(a=> `<option value="${a}" ${st.area===a?'selected':''}>${a}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Salesperson</label>
        <select onchange="window.ERP._custFilter('salesperson',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All Reps</option>
          <option value="Marcus" ${st.salesperson==='Marcus'?'selected':''}>Marcus Johnson</option>
          <option value="Nicole" ${st.salesperson==='Nicole'?'selected':''}>Nicole Rivera</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Customer Since</label>
        <input type="date" value="${st.customerSince}" onchange="window.ERP._custFilter('customerSince',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <label style="display:flex;align-items:center;gap:4px;font-size:0.82rem;cursor:pointer"><input type="checkbox" ${st.hasOverdue?'checked':''} onchange="window.ERP._custFilter('hasOverdue',this.checked)"> Has Overdue</label>
      <label style="display:flex;align-items:center;gap:4px;font-size:0.82rem;cursor:pointer"><input type="checkbox" ${st.hasOpenOrders?'checked':''} onchange="window.ERP._custFilter('hasOpenOrders',this.checked)"> Open Orders</label>
    </div>
  </div>
  ` : ''}

  <!-- Bulk bar -->
  ${selCount ? `
  <div class="bulk-bar" style="padding:10px 16px;background:var(--primary);color:#fff;border-radius:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px">
    <span style="font-weight:600;font-size:0.85rem">${selCount} selected</span>
    <button onclick="window.ERP._custBulk('tier')">Set Tier</button>
    <button onclick="window.ERP._custBulk('priceLevel')">Set Price Level</button>
    <button onclick="window.ERP._custBulk('discCap')">Disc Cap</button>
    <button onclick="window.ERP._custBulk('saveGroup')">💾 Save Group</button>
    <button style="margin-left:auto" onclick="window.ERP._custSelectNone()">✕ Deselect</button>
  </div>` : ''}

  ${bulkActionPanelHTML('customer')}

  <!-- Table -->
  <div class="table-wrap">
    <table>
      <thead><tr>
        <th><input type="checkbox" onchange="window.ERP._custSelectAll(this.checked)" ${selCount===list.length&&list.length?'checked':''}></th>
        <th>Customer</th><th>Type</th><th>Tier</th><th>Route</th>
        <th style="text-align:right">Revenue</th><th style="text-align:right">Balance</th>
        <th style="text-align:right">Overdue</th><th style="text-align:center">On-Time</th>
        <th style="text-align:right">Avg Pay</th><th>Last Order</th>
      </tr></thead>
      <tbody>
      ${list.map(c => {
        const m = CUSTOMER_METRICS[c.id] || {};
        const sel = st.selected.has(c.id);
        const otColor = (m.paidOnTime||0) >= 85 ? 'var(--green)' : (m.paidOnTime||0) >= 60 ? 'var(--orange)' : 'var(--red)';
        const tierBadge = c.creditTier === 'A' ? 'badge-green' : c.creditTier === 'B' ? 'badge-blue' : 'badge-orange';
        const geo = CUSTOMER_GEO[c.id];
        return `<tr style="${sel?'background:#eff6ff':''}">
          <td><input type="checkbox" ${sel?'checked':''} onchange="window.ERP._custToggle(${c.id})"></td>
          <td><a href="#" onclick="window.ERP.nav('#/accounting/customer-account?id=${c.id}');return false" style="font-weight:600">${c.name}</a><br><span class="text-xs text-light">${c.code}${geo?' · '+geo.area:''}</span></td>
          <td><span class="badge">${c.type}</span></td>
          <td><span class="badge ${tierBadge}">${c.creditTier}</span></td>
          <td class="text-xs">${c.route||'—'}</td>
          <td style="text-align:right;font-weight:600">${fmt$(m.revenue||0)}</td>
          <td style="text-align:right;${c.balance>5000?'color:var(--red);font-weight:600':''}">${fmt$(c.balance)}</td>
          <td style="text-align:right;${(m.overdue||0)>0?'color:var(--red);font-weight:600':''}">${fmt$(m.overdue||0)}</td>
          <td style="text-align:center"><span style="color:${otColor};font-weight:600">${m.paidOnTime||0}%</span></td>
          <td style="text-align:right">${m.avgPayDays||0}d</td>
          <td class="text-xs">${c.lastOrder||'—'}</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
  </div>`;
}

// ── Customer Explorer Handlers ──
(function() {
  window._custShowFilters = false;
  window.ERP._custToggleFilters = function() { window._custShowFilters = !window._custShowFilters; window._expRerender(); };
  window.ERP._custFilter = function(key, val) {
    window._explorerState.customer[key] = val;
    window._expRerender();
  };
  window.ERP._custClearFilter = function(idx) {
    const f = window._custActiveFilters[idx];
    if (f) { f.clear(); window._expRerender(); }
  };
  window.ERP._custClearAllFilters = function() {
    const st = window._explorerState.customer;
    st.type=''; st.tier=''; st.status=''; st.priceLevel=''; st.terms=''; st.route=''; st.area=''; st.salesperson=''; st.hasOverdue=false; st.hasOpenOrders=false; st.customerSince=''; st.minRevenue=''; st.maxBalance=''; st.minOnTime='';
    window._expRerender();
  };
  window.ERP._custToggle = function(id) {
    const s = window._explorerState.customer.selected;
    s.has(id) ? s.delete(id) : s.add(id);
    window._expRerender();
  };
  window.ERP._custSelectAll = function(checked) {
    const st = window._explorerState.customer;
    st.selected.clear();
    if (checked) CUSTOMERS.forEach(c => st.selected.add(c.id));
    window._expRerender();
  };
  window.ERP._custSelectNone = function() {
    window._explorerState.customer.selected.clear();
    window._explorerState.bulkPanel = null;
    window._expRerender();
  };
  window.ERP._custBulk = function(type) {
    window._explorerState.bulkPanel = { type, explorerType: 'customer' };
    window._expRerender();
  };
})();

// ═══════════════════════════════════════════════════════════
//  SALES REP EXPLORER PAGE
// ═══════════════════════════════════════════════════════════
function salesExplorerPage() {
  const st = window._explorerState.sales;

  // ── Build rep list ──
  let reps = USERS.filter(u => u.role === 'Salesperson').map(u => {
    const perf = SALES_PERFORMANCE[u.id] || {};
    const repOrders = ORDERS.filter(o => o.salesperson === u.name.split(' ')[0]);
    const routes = [...new Set(repOrders.map(o => o.route).filter(Boolean))];
    return { ...u, perf, repOrders, routes };
  });

  // ── Filters ──
  if (st.search) { const q = st.search.toLowerCase(); reps = reps.filter(r => r.name.toLowerCase().includes(q)); }
  if (st.status) reps = reps.filter(r => r.status === st.status);
  if (st.route) reps = reps.filter(r => r.routes.includes(st.route));
  if (st.minQuota) reps = reps.filter(r => (r.perf.quotaPct||0) >= parseFloat(st.minQuota));
  if (st.minRevenue) reps = reps.filter(r => (r.perf.totalRevenue||0) >= parseFloat(st.minRevenue));
  if (st.maxDiscount) reps = reps.filter(r => (r.perf.discountAvg||0) <= parseFloat(st.maxDiscount));
  if (st.minCollection) reps = reps.filter(r => (r.perf.collectionRate||0) >= parseFloat(st.minCollection));

  // ── Sort ──
  const dir = st.sortDir === 'asc' ? 1 : -1;
  reps.sort((a, b) => {
    const pa = a.perf, pb = b.perf;
    switch(st.sortBy) {
      case 'name':        return dir * a.name.localeCompare(b.name);
      case 'revenue':     return dir * ((pa.totalRevenue||0) - (pb.totalRevenue||0));
      case 'orders':      return dir * ((pa.ordersThisMonth||0) - (pb.ordersThisMonth||0));
      case 'quota':       return dir * ((pa.quotaPct||0) - (pb.quotaPct||0));
      case 'discount':    return dir * ((pa.discountAvg||0) - (pb.discountAvg||0));
      case 'collection':  return dir * ((pa.collectionRate||0) - (pb.collectionRate||0));
      case 'outstanding': return dir * ((pa.outstanding||0) - (pb.outstanding||0));
      case 'customers':   return dir * ((pa.customersServed||0) - (pb.customersServed||0));
      case 'avgOrder':    return dir * ((pa.avgOrderValue||0) - (pb.avgOrderValue||0));
      case 'returnRate':  return dir * ((pa.returnRate||0) - (pb.returnRate||0));
      case 'overdue':     return dir * ((pa.overdue||0) - (pb.overdue||0));
      default: return dir * ((pa.totalRevenue||0) - (pb.totalRevenue||0));
    }
  });

  // ── KPIs ──
  const totRev = reps.reduce((s,r) => s + (r.perf.totalRevenue||0), 0);
  const totOrd = reps.reduce((s,r) => s + (r.perf.ordersThisMonth||0), 0);
  const avgQuota = reps.length ? (reps.reduce((s,r) => s + (r.perf.quotaPct||0), 0) / reps.length).toFixed(0) : 0;
  const totOutstanding = reps.reduce((s,r) => s + (r.perf.outstanding||0), 0);
  const avgDisc = reps.length ? (reps.reduce((s,r) => s + (r.perf.discountAvg||0), 0) / reps.length).toFixed(1) : 0;
  const avgColl = reps.length ? (reps.reduce((s,r) => s + (r.perf.collectionRate||0), 0) / reps.length).toFixed(0) : 0;
  const selCount = st.selected.size;

  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
    <div><h2 style="margin:0">👤 Sales Rep Explorer</h2><span class="text-sm text-light">${reps.length} reps${selCount ? ` · ${selCount} selected` : ''}</span></div>
    <div style="display:flex;gap:6px">
      <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/saved-views')">📂 Saved Views</button>
      <button class="btn-outline btn-sm" onclick="window.ERP._salesToggleFilters()">🔽 ${window._salesShowFilters ? 'Hide' : 'Show'} Filters</button>
    </div>
  </div>

  ${dateRangePickerHTML()}

  <!-- Metric Filters (date-range-dependent) -->
  <div class="card mb-16" style="padding:12px 16px;border-left:4px solid var(--primary);background:#f8faff">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <span style="font-weight:700;font-size:0.9rem">📊 Metric Filters</span>
      <span class="text-xs text-light">Values computed within <strong>${window._explorerState.dateFrom}</strong> → <strong>${window._explorerState.dateTo}</strong></span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">
      <div>
        <label class="text-xs text-light">Min Quota %</label>
        <select onchange="window.ERP._salesFilter('minQuota',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">Any</option>
          <option value="50" ${st.minQuota==='50'?'selected':''}>≥ 50%</option>
          <option value="75" ${st.minQuota==='75'?'selected':''}>≥ 75%</option>
          <option value="90" ${st.minQuota==='90'?'selected':''}>≥ 90%</option>
          <option value="100" ${st.minQuota==='100'?'selected':''}>≥ 100%</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Min Revenue</label>
        <select onchange="window.ERP._salesFilter('minRevenue',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">Any</option>
          <option value="50000" ${st.minRevenue==='50000'?'selected':''}>≥ $50K</option>
          <option value="100000" ${st.minRevenue==='100000'?'selected':''}>≥ $100K</option>
          <option value="150000" ${st.minRevenue==='150000'?'selected':''}>≥ $150K</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Max Discount %</label>
        <select onchange="window.ERP._salesFilter('maxDiscount',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">Any</option>
          <option value="5" ${st.maxDiscount==='5'?'selected':''}>≤ 5%</option>
          <option value="8" ${st.maxDiscount==='8'?'selected':''}>≤ 8%</option>
          <option value="10" ${st.maxDiscount==='10'?'selected':''}>≤ 10%</option>
          <option value="15" ${st.maxDiscount==='15'?'selected':''}>≤ 15%</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Min Collection %</label>
        <select onchange="window.ERP._salesFilter('minCollection',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">Any</option>
          <option value="80" ${st.minCollection==='80'?'selected':''}>≥ 80%</option>
          <option value="90" ${st.minCollection==='90'?'selected':''}>≥ 90%</option>
          <option value="95" ${st.minCollection==='95'?'selected':''}>≥ 95%</option>
        </select>
      </div>
    </div>
  </div>

  <!-- KPI Tiles -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:14px">
    <div class="tile tile-blue"><div class="tile-label">Total Revenue</div><div class="tile-value">${fmt$(totRev)}</div></div>
    <div class="tile tile-green"><div class="tile-label">Orders (Month)</div><div class="tile-value">${totOrd}</div></div>
    <div class="tile tile-orange"><div class="tile-label">Avg Quota %</div><div class="tile-value">${avgQuota}%</div></div>
    <div class="tile tile-red"><div class="tile-label">Outstanding</div><div class="tile-value">${fmt$(totOutstanding)}</div></div>
    <div class="tile"><div class="tile-label">Avg Discount</div><div class="tile-value">${avgDisc}%</div></div>
    <div class="tile tile-green"><div class="tile-label">Avg Collection</div><div class="tile-value">${avgColl}%</div></div>
  </div>

  <!-- Search & Sort -->
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap">
    <input type="text" placeholder="🔍 Search reps..." value="${st.search}" oninput="window.ERP._salesFilter('search',this.value)" style="flex:1;min-width:160px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem">
    <select onchange="window.ERP._salesFilter('sortBy',this.value)" style="padding:8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
      <option value="revenue" ${st.sortBy==='revenue'?'selected':''}>Sort: Revenue</option>
      <option value="name" ${st.sortBy==='name'?'selected':''}>Sort: Name</option>
      <option value="orders" ${st.sortBy==='orders'?'selected':''}>Sort: Orders</option>
      <option value="quota" ${st.sortBy==='quota'?'selected':''}>Sort: Quota %</option>
      <option value="discount" ${st.sortBy==='discount'?'selected':''}>Sort: Discount</option>
      <option value="collection" ${st.sortBy==='collection'?'selected':''}>Sort: Collection</option>
      <option value="outstanding" ${st.sortBy==='outstanding'?'selected':''}>Sort: Outstanding</option>
      <option value="overdue" ${st.sortBy==='overdue'?'selected':''}>Sort: Overdue</option>
      <option value="customers" ${st.sortBy==='customers'?'selected':''}>Sort: Customers</option>
      <option value="avgOrder" ${st.sortBy==='avgOrder'?'selected':''}>Sort: Avg Order</option>
      <option value="returnRate" ${st.sortBy==='returnRate'?'selected':''}>Sort: Return Rate</option>
    </select>
    <button class="btn-sm btn-outline" onclick="window.ERP._salesFilter('sortDir','${st.sortDir==='asc'?'desc':'asc'}')">${st.sortDir==='asc'?'↑ Asc':'↓ Desc'}</button>
  </div>

  <!-- Filter Panel -->
  ${window._salesShowFilters ? `
  <div class="card mb-16 explorer-filter-panel" style="padding:14px 16px">
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">
      <div>
        <label class="text-xs text-light">Status</label>
        <select onchange="window.ERP._salesFilter('status',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All</option><option value="Active" ${st.status==='Active'?'selected':''}>Active</option><option value="Inactive" ${st.status==='Inactive'?'selected':''}>Inactive</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Route</label>
        <select onchange="window.ERP._salesFilter('route',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All Routes</option>
          <option value="Route A-1" ${st.route==='Route A-1'?'selected':''}>A-1: Downtown</option>
          <option value="Route B-2" ${st.route==='Route B-2'?'selected':''}>B-2: Cambridge</option>
          <option value="Route C-3" ${st.route==='Route C-3'?'selected':''}>C-3: South Shore</option>
        </select>
      </div>
    </div>
  </div>` : ''}

  <!-- Bulk bar -->
  ${selCount ? `
  <div class="bulk-bar" style="padding:10px 16px;background:var(--primary);color:#fff;border-radius:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px">
    <span style="font-weight:600;font-size:0.85rem">${selCount} selected</span>
    <button onclick="window.ERP._salesBulk('quota')">Set Quota</button>
    <button onclick="window.ERP._salesBulk('discPolicy')">Set Disc Policy</button>
    <button onclick="window.ERP._salesBulk('saveGroup')">💾 Save Group</button>
    <button style="margin-left:auto" onclick="window.ERP._salesSelectNone()">✕ Deselect</button>
  </div>` : ''}

  ${bulkActionPanelHTML('sales')}

  <!-- Cards -->
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px">
  ${reps.map(r => {
    const p = r.perf;
    const sel = st.selected.has(r.id);
    const quotaColor = (p.quotaPct||0) >= 100 ? 'var(--green)' : (p.quotaPct||0) >= 75 ? 'var(--orange)' : 'var(--red)';
    const quotaPct = Math.min(p.quotaPct||0, 120);
    const monthBars = (p.monthlyRevenue||[]).map((v,i) => {
      const h = Math.max(4, (v / 45000) * 60);
      return `<div title="Month ${i+1}: ${fmt$(v)}" style="width:12px;height:${h}px;background:var(--primary);border-radius:2px;opacity:${i<11?0.5:1}"></div>`;
    }).join('');
    return `
    <div class="card" style="padding:16px;${sel?'border:2px solid var(--primary);background:#f8faff':''}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <input type="checkbox" ${sel?'checked':''} onchange="window.ERP._salesToggle(${r.id})">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:0.9rem">${r.name.split(' ').map(n=>n[0]).join('')}</div>
        <div>
          <div style="font-weight:700">${r.name}</div>
          <div class="text-xs text-light">${r.routes.join(', ')||'No routes'} · ${p.customersServed||0} customers</div>
        </div>
        <span class="badge ${r.status==='Active'?'badge-green':'badge-orange'}" style="margin-left:auto">${r.status}</span>
      </div>
      <!-- Stats grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">
        <div class="text-center"><div class="text-xs text-light">Revenue</div><div style="font-weight:700;font-size:0.95rem">${fmt$(p.totalRevenue||0)}</div></div>
        <div class="text-center"><div class="text-xs text-light">Orders/Mo</div><div style="font-weight:700;font-size:0.95rem">${p.ordersThisMonth||0}</div></div>
        <div class="text-center"><div class="text-xs text-light">Avg Order</div><div style="font-weight:700;font-size:0.95rem">${fmt$(p.avgOrderValue||0)}</div></div>
        <div class="text-center"><div class="text-xs text-light">Collection</div><div style="font-weight:700;font-size:0.95rem;color:${(p.collectionRate||0)>=90?'var(--green)':'var(--orange)'}">${p.collectionRate||0}%</div></div>
        <div class="text-center"><div class="text-xs text-light">Disc Avg</div><div style="font-weight:700;font-size:0.95rem">${p.discountAvg||0}%</div></div>
        <div class="text-center"><div class="text-xs text-light">Overdue</div><div style="font-weight:700;font-size:0.95rem;color:${(p.overdue||0)>0?'var(--red)':'inherit'}">${fmt$(p.overdue||0)}</div></div>
      </div>
      <!-- Quota bar -->
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:3px">
          <span class="text-light">Quota Progress</span><span style="font-weight:700;color:${quotaColor}">${p.quotaPct||0}%</span>
        </div>
        <div style="height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${Math.min(quotaPct,100)}%;background:${quotaColor};border-radius:4px;transition:width 0.3s"></div>
        </div>
      </div>
      <!-- Monthly sparkline -->
      <div style="display:flex;align-items:flex-end;gap:2px;height:60px;padding:4px 0;border-top:1px solid var(--border);margin-top:6px">${monthBars}</div>
      <div class="text-xs text-light" style="text-align:center;margin-top:2px">Monthly Revenue (12mo)</div>
    </div>`;
  }).join('')}
  </div>`;
}

// ── Sales Explorer Handlers ──
(function() {
  window._salesShowFilters = false;
  window.ERP._salesToggleFilters = function() { window._salesShowFilters = !window._salesShowFilters; window._expRerender(); };
  window.ERP._salesFilter = function(key, val) { window._explorerState.sales[key] = val; window._expRerender(); };
  window.ERP._salesToggle = function(id) {
    const s = window._explorerState.sales.selected;
    s.has(id) ? s.delete(id) : s.add(id);
    window._expRerender();
  };
  window.ERP._salesSelectNone = function() {
    window._explorerState.sales.selected.clear();
    window._explorerState.bulkPanel = null;
    window._expRerender();
  };
  window.ERP._salesBulk = function(type) {
    window._explorerState.bulkPanel = { type, explorerType: 'sales' };
    window._expRerender();
  };
})();

// ═══════════════════════════════════════════════════════════
//  PRODUCT EXPLORER PAGE
// ═══════════════════════════════════════════════════════════
function productExplorerPage() {
  const st = window._explorerState.product;

  // ── Filter ──
  let list = PRODUCTS.slice();
  if (st.search) { const q = st.search.toLowerCase(); list = list.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || (p.flavor||'').toLowerCase().includes(q)); }
  if (st.category) list = list.filter(p => String(p.category) === st.category);
  if (st.size) list = list.filter(p => p.size === st.size);
  if (st.packSize) list = list.filter(p => String(p.packSize) === st.packSize);
  if (st.material) list = list.filter(p => p.material === st.material);
  if (st.stockStatus) {
    if (st.stockStatus === 'low') list = list.filter(p => p.stock < 50);
    else if (st.stockStatus === 'ok') list = list.filter(p => p.stock >= 50 && p.stock <= (p.overStockLimit||200));
    else if (st.stockStatus === 'over') list = list.filter(p => p.stock > (p.overStockLimit||200));
  }
  if (st.minRevenue) list = list.filter(p => ((PRODUCT_METRICS[p.id]||{}).revenue||0) >= parseFloat(st.minRevenue));
  if (st.minUnitsSold) list = list.filter(p => ((PRODUCT_METRICS[p.id]||{}).unitsSold||0) >= parseFloat(st.minUnitsSold));

  // ── Sort ──
  const dir = st.sortDir === 'asc' ? 1 : -1;
  list.sort((a, b) => {
    const ma = PRODUCT_METRICS[a.id]||{}, mb = PRODUCT_METRICS[b.id]||{};
    switch(st.sortBy) {
      case 'name':       return dir * a.name.localeCompare(b.name);
      case 'revenue':    return dir * ((ma.revenue||0) - (mb.revenue||0));
      case 'unitsSold':  return dir * ((ma.unitsSold||0) - (mb.unitsSold||0));
      case 'price':      return dir * (a.price - b.price);
      case 'stock':      return dir * (a.stock - b.stock);
      case 'discount':   return dir * ((ma.avgDiscount||0) - (mb.avgDiscount||0));
      case 'returnRate': return dir * ((ma.returnRate||0) - (mb.returnRate||0));
      case 'unitPrice':  return dir * (a.unitPrice - b.unitPrice);
      case 'packSize':   return dir * (a.packSize - b.packSize);
      default: return dir * ((ma.revenue||0) - (mb.revenue||0));
    }
  });

  // ── KPIs ──
  const totRev = list.reduce((s,p) => s + ((PRODUCT_METRICS[p.id]||{}).revenue||0), 0);
  const totUnits = list.reduce((s,p) => s + ((PRODUCT_METRICS[p.id]||{}).unitsSold||0), 0);
  const avgDisc = list.length ? (list.reduce((s,p) => s + ((PRODUCT_METRICS[p.id]||{}).avgDiscount||0), 0) / list.length).toFixed(1) : 0;
  const avgReturn = list.length ? (list.reduce((s,p) => s + ((PRODUCT_METRICS[p.id]||{}).returnRate||0), 0) / list.length).toFixed(1) : 0;
  const lowStock = list.filter(p => p.stock < 50).length;
  const overStock = list.filter(p => p.stock > (p.overStockLimit||200)).length;
  const selCount = st.selected.size;

  // Get unique sizes and materials for filters
  const sizes = [...new Set(PRODUCTS.map(p => p.size))].sort();
  const materials = [...new Set(PRODUCTS.map(p => p.material))];
  const packSizes = [...new Set(PRODUCTS.map(p => p.packSize))].sort((a,b) => a-b);

  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px">
    <div><h2 style="margin:0">📦 Product Explorer</h2><span class="text-sm text-light">${list.length} of ${PRODUCTS.length} products${selCount ? ` · ${selCount} selected` : ''}</span></div>
    <div style="display:flex;gap:6px">
      <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/saved-views')">📂 Saved Views</button>
      <button class="btn-outline btn-sm" onclick="window.ERP._prodToggleFilters()">🔽 ${window._prodShowFilters ? 'Hide' : 'Show'} Filters</button>
    </div>
  </div>

  ${dateRangePickerHTML()}

  <!-- Metric Filters (date-range-dependent) -->
  <div class="card mb-16" style="padding:12px 16px;border-left:4px solid var(--primary);background:#f8faff">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <span style="font-weight:700;font-size:0.9rem">📊 Metric Filters</span>
      <span class="text-xs text-light">Values computed within <strong>${window._explorerState.dateFrom}</strong> → <strong>${window._explorerState.dateTo}</strong></span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px">
      <div>
        <label class="text-xs text-light">Min Revenue</label>
        <select onchange="window.ERP._prodFilter('minRevenue',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">Any</option>
          <option value="1000" ${st.minRevenue==='1000'?'selected':''}>≥ $1K</option>
          <option value="5000" ${st.minRevenue==='5000'?'selected':''}>≥ $5K</option>
          <option value="10000" ${st.minRevenue==='10000'?'selected':''}>≥ $10K</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Min Units Sold</label>
        <select onchange="window.ERP._prodFilter('minUnitsSold',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">Any</option>
          <option value="100" ${st.minUnitsSold==='100'?'selected':''}>≥ 100</option>
          <option value="500" ${st.minUnitsSold==='500'?'selected':''}>≥ 500</option>
          <option value="1000" ${st.minUnitsSold==='1000'?'selected':''}>≥ 1,000</option>
        </select>
      </div>
    </div>
  </div>

  <!-- KPI Tiles -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:14px">
    <div class="tile tile-blue"><div class="tile-label">Total Revenue</div><div class="tile-value">${fmt$(totRev)}</div></div>
    <div class="tile tile-green"><div class="tile-label">Units Sold</div><div class="tile-value">${totUnits.toLocaleString()}</div></div>
    <div class="tile"><div class="tile-label">Avg Discount</div><div class="tile-value">${avgDisc}%</div></div>
    <div class="tile tile-orange"><div class="tile-label">Avg Return</div><div class="tile-value">${avgReturn}%</div></div>
    <div class="tile tile-red"><div class="tile-label">Low Stock</div><div class="tile-value">${lowStock}</div></div>
    <div class="tile tile-orange"><div class="tile-label">Overstock</div><div class="tile-value">${overStock}</div></div>
  </div>

  <!-- Search & Sort -->
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap">
    <input type="text" placeholder="🔍 Search products..." value="${st.search}" oninput="window.ERP._prodFilter('search',this.value)" style="flex:1;min-width:160px;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:0.85rem">
    <select onchange="window.ERP._prodFilter('sortBy',this.value)" style="padding:8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
      <option value="revenue" ${st.sortBy==='revenue'?'selected':''}>Sort: Revenue</option>
      <option value="name" ${st.sortBy==='name'?'selected':''}>Sort: Name</option>
      <option value="unitsSold" ${st.sortBy==='unitsSold'?'selected':''}>Sort: Units Sold</option>
      <option value="price" ${st.sortBy==='price'?'selected':''}>Sort: Case Price</option>
      <option value="unitPrice" ${st.sortBy==='unitPrice'?'selected':''}>Sort: Unit Price</option>
      <option value="stock" ${st.sortBy==='stock'?'selected':''}>Sort: Stock</option>
      <option value="discount" ${st.sortBy==='discount'?'selected':''}>Sort: Discount</option>
      <option value="returnRate" ${st.sortBy==='returnRate'?'selected':''}>Sort: Return Rate</option>
      <option value="packSize" ${st.sortBy==='packSize'?'selected':''}>Sort: Pack Size</option>
    </select>
    <button class="btn-sm btn-outline" onclick="window.ERP._prodFilter('sortDir','${st.sortDir==='asc'?'desc':'asc'}')">${st.sortDir==='asc'?'↑ Asc':'↓ Desc'}</button>
  </div>

  <!-- Filter Panel -->
  ${window._prodShowFilters ? `
  <div class="card mb-16 explorer-filter-panel" style="padding:14px 16px">
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">
      <div>
        <label class="text-xs text-light">Category</label>
        <select onchange="window.ERP._prodFilter('category',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All</option>
          ${CATEGORIES.map(c => `<option value="${c.id}" ${st.category===String(c.id)?'selected':''}>${c.icon} ${c.name}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Size</label>
        <select onchange="window.ERP._prodFilter('size',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All Sizes</option>
          ${sizes.map(s => `<option value="${s}" ${st.size===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Pack Size</label>
        <select onchange="window.ERP._prodFilter('packSize',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All</option>
          ${packSizes.map(s => `<option value="${s}" ${st.packSize===String(s)?'selected':''}>${s}-pack</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Material</label>
        <select onchange="window.ERP._prodFilter('material',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All</option>
          ${materials.map(m => `<option value="${m}" ${st.material===m?'selected':''}>${m}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="text-xs text-light">Stock Status</label>
        <select onchange="window.ERP._prodFilter('stockStatus',this.value)" style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
          <option value="">All</option>
          <option value="low" ${st.stockStatus==='low'?'selected':''}>🔴 Low (&lt;50)</option>
          <option value="ok" ${st.stockStatus==='ok'?'selected':''}>🟢 Normal</option>
          <option value="over" ${st.stockStatus==='over'?'selected':''}>🟡 Overstock</option>
        </select>
      </div>
    </div>
  </div>` : ''}

  <!-- Bulk bar -->
  ${selCount ? `
  <div class="bulk-bar" style="padding:10px 16px;background:var(--primary);color:#fff;border-radius:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px">
    <span style="font-weight:600;font-size:0.85rem">${selCount} selected</span>
    <button onclick="window.ERP._prodBulk('adjustPrice')">Adjust Price</button>
    <button onclick="window.ERP._prodBulk('productDiscCap')">Disc Cap</button>
    <button onclick="window.ERP._prodBulk('saveGroup')">💾 Save Group</button>
    <button style="margin-left:auto" onclick="window.ERP._prodSelectNone()">✕ Deselect</button>
  </div>` : ''}

  ${bulkActionPanelHTML('product')}

  <!-- Table -->
  <div class="table-wrap">
    <table>
      <thead><tr>
        <th><input type="checkbox" onchange="window.ERP._prodSelectAll(this.checked)" ${selCount===list.length&&list.length?'checked':''}></th>
        <th>Product</th><th>Category</th><th>Size</th><th>Pack</th>
        <th style="text-align:right">Case $</th><th style="text-align:right">Unit $</th>
        <th style="text-align:right">Revenue</th><th style="text-align:right">Units</th>
        <th style="text-align:center">Stock</th><th style="text-align:right">Disc%</th>
      </tr></thead>
      <tbody>
      ${list.slice(0, 50).map(p => {
        const m = PRODUCT_METRICS[p.id] || {};
        const sel = st.selected.has(p.id);
        const cat = CATEGORIES.find(c => c.id === p.category) || { icon:'?', name:'?' };
        const stockColor = p.stock < 50 ? 'var(--red)' : p.stock > (p.overStockLimit||200) ? 'var(--orange)' : 'var(--green)';
        const stockIcon = p.stock < 50 ? '🔴' : p.stock > (p.overStockLimit||200) ? '🟡' : '🟢';
        return `<tr style="${sel?'background:#eff6ff':''}">
          <td><input type="checkbox" ${sel?'checked':''} onchange="window.ERP._prodToggle(${p.id})"></td>
          <td><span style="font-weight:600">${p.name}</span><br><span class="text-xs text-light">${p.code}${p.flavor?' · '+p.flavor:''}</span></td>
          <td><span class="badge">${cat.icon} ${cat.name}</span></td>
          <td class="text-xs">${p.size}</td>
          <td class="text-xs">${p.packSize}pk</td>
          <td style="text-align:right">${fmt$(p.price)}</td>
          <td style="text-align:right">${fmt$(p.unitPrice)}</td>
          <td style="text-align:right;font-weight:600">${fmt$(m.revenue||0)}</td>
          <td style="text-align:right">${(m.unitsSold||0).toLocaleString()}</td>
          <td style="text-align:center"><span title="${p.stock} units">${stockIcon} ${p.stock}</span></td>
          <td style="text-align:right">${m.avgDiscount||0}%</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
    ${list.length > 50 ? `<div class="text-sm text-light" style="text-align:center;padding:8px">Showing 50 of ${list.length} products. Use filters to narrow results.</div>` : ''}
  </div>`;
}

// ── Product Explorer Handlers ──
(function() {
  window._prodShowFilters = false;
  window.ERP._prodToggleFilters = function() { window._prodShowFilters = !window._prodShowFilters; window._expRerender(); };
  window.ERP._prodFilter = function(key, val) { window._explorerState.product[key] = val; window._expRerender(); };
  window.ERP._prodToggle = function(id) {
    const s = window._explorerState.product.selected;
    s.has(id) ? s.delete(id) : s.add(id);
    window._expRerender();
  };
  window.ERP._prodSelectAll = function(checked) {
    const st = window._explorerState.product;
    st.selected.clear();
    if (checked) PRODUCTS.forEach(p => st.selected.add(p.id));
    window._expRerender();
  };
  window.ERP._prodSelectNone = function() {
    window._explorerState.product.selected.clear();
    window._explorerState.bulkPanel = null;
    window._expRerender();
  };
  window.ERP._prodBulk = function(type) {
    window._explorerState.bulkPanel = { type, explorerType: 'product' };
    window._expRerender();
  };
})();

// ═══════════════════════════════════════════════════════════
//  SAVED VIEWS PAGE
// ═══════════════════════════════════════════════════════════
function savedViewsPage() {
  const views = window._savedViews || [];
  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div><h2 style="margin:0">📂 Saved Views</h2><span class="text-sm text-light">${views.length} saved views and groups</span></div>
    <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/customer-explorer')">← Back to Explorer</button>
  </div>

  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
  ${views.map(v => {
    const badge = v.type === 'customers' ? 'badge-blue' : v.type === 'products' ? 'badge-green' : 'badge-orange';
    const itemCount = v.customerIds ? v.customerIds.length : v.productIds ? v.productIds.length : v.userIds ? v.userIds.length : 0;
    return `
    <div class="card sv-card" style="padding:16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:1.4rem">${v.icon||'📋'}</span>
        <div style="flex:1">
          <div style="font-weight:700">${v.name}</div>
          <div class="text-xs text-light">${v.createdBy} · ${v.created}</div>
        </div>
        <span class="badge ${badge}">${v.type}</span>
      </div>
      <p class="text-sm text-light" style="margin:0 0 10px">${v.description}${itemCount ? ` · ${itemCount} items` : ''}</p>
      <div style="display:flex;gap:6px">
        <button class="btn-primary btn-sm" onclick="window.ERP._svLoad(${v.id})">Load</button>
        <button class="btn-outline btn-sm" onclick="window.ERP._svClone(${v.id})">Clone</button>
        <button class="btn-outline btn-sm" onclick="window.ERP._svDelete(${v.id})" style="color:var(--red)">🗑</button>
      </div>
    </div>`;
  }).join('')}
  </div>

  ${views.length === 0 ? `
  <div class="card" style="padding:40px;text-align:center">
    <div style="font-size:2.5rem;margin-bottom:10px">📂</div>
    <h3>No Saved Views</h3>
    <p class="text-light">Select items in any Explorer and click "Save Group" to create a view.</p>
    <button class="btn-primary" onclick="window.ERP.nav('#/accounting/customer-explorer')">Open Customer Explorer</button>
  </div>` : ''}`;
}

// ── Saved Views Handlers ──
(function() {
  window.ERP._svLoad = function(id) {
    const v = window._savedViews.find(x => x.id === id);
    if (!v) return;
    if (v.type === 'customers') {
      if (v.customerIds) { window._explorerState.customer.selected = new Set(v.customerIds); }
      window.ERP.nav('#/accounting/customer-explorer');
    } else if (v.type === 'products') {
      if (v.productIds) { window._explorerState.product.selected = new Set(v.productIds); }
      window.ERP.nav('#/accounting/product-explorer');
    } else {
      if (v.userIds) { window._explorerState.sales.selected = new Set(v.userIds); }
      window.ERP.nav('#/accounting/sales-explorer');
    }
    window.ERP.toast(`📂 Loaded view "${v.name}"`, 'success');
  };
  window.ERP._svClone = function(id) {
    const v = window._savedViews.find(x => x.id === id);
    if (!v) return;
    const clone = JSON.parse(JSON.stringify(v));
    clone.id = window._svNextId++;
    clone.name = v.name + ' (Copy)';
    clone.created = '2026-02-27';
    window._savedViews.push(clone);
    window.ERP.toast(`📋 Cloned "${v.name}"`, 'success');
    window._expRerender();
  };
  window.ERP._svDelete = function(id) {
    const idx = window._savedViews.findIndex(x => x.id === id);
    if (idx >= 0) {
      const name = window._savedViews[idx].name;
      window._savedViews.splice(idx, 1);
      window.ERP.toast(`🗑️ Deleted "${name}"`, 'info');
      window._expRerender();
    }
  };
})();

// ═══════════════════════════════════════════════════════════
//  PRICE LEVEL MERGER PAGE
// ═══════════════════════════════════════════════════════════
function priceMergerPage() {
  const ms = window._priceMergerState;
  if (!ms) {
    return `
    <div class="card" style="padding:40px;text-align:center">
      <div style="font-size:2.5rem;margin-bottom:10px">🔀</div>
      <h3>Price Level Merger</h3>
      <p class="text-light">Select customers in the Customer Explorer and choose "Set Price Level" to get started.</p>
      <button class="btn-primary" onclick="window.ERP.nav('#/accounting/customer-explorer')">Open Customer Explorer</button>
    </div>`;
  }

  const sourceLevel = PRICE_LEVELS.find(l => l.name === ms.sourceLevelName) || { name: ms.sourceLevelName, margin: 0 };
  const targetCusts = (ms.targetCustomerIds || []).map(id => CUSTOMERS.find(c => c.id === id)).filter(Boolean);
  
  // Per-customer resolution state
  if (!ms.resolutions) ms.resolutions = {};

  const rows = targetCusts.map(c => {
    const currentLevel = PRICE_LEVELS.find(l => l.name === c.priceLevel);
    const hasConflict = c.priceLevel !== sourceLevel.name;
    const resolution = ms.resolutions[c.id] || (hasConflict ? 'pending' : 'apply');
    const statusBadge = resolution === 'apply' ? '<span class="badge badge-green">Will Apply</span>' :
                         resolution === 'skip' ? '<span class="badge badge-orange">Skip</span>' :
                         '<span class="badge badge-red">Pending</span>';

    // Simulate product-level price delta
    const sampleProducts = PRODUCTS.slice(0, 3);
    const productRows = hasConflict ? sampleProducts.map(p => {
      const oldPrice = p.price;
      const newPrice = (p.price * (1 + (sourceLevel.margin - (currentLevel?currentLevel.margin:0)) / 100)).toFixed(2);
      const diff = (newPrice - oldPrice).toFixed(2);
      return `<div style="display:flex;justify-content:space-between;font-size:0.78rem;padding:2px 0">
        <span class="text-light">${p.name}</span>
        <span>${fmt$(oldPrice)} → <strong>${fmt$(parseFloat(newPrice))}</strong> <span style="color:${diff>=0?'var(--green)':'var(--red)'}">(${diff>=0?'+':''}${diff})</span></span>
      </div>`;
    }).join('') : '';

    return `
    <div class="card mb-16 ${hasConflict ? 'merger-row-conflict' : ''}" style="padding:14px 16px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:180px">
          <div style="font-weight:700">${c.name} <span class="text-xs text-light">${c.code}</span></div>
          <div class="text-xs text-light">Current: <strong>${c.priceLevel || 'None'}</strong>${currentLevel ? ` (${currentLevel.margin}% margin)` : ''} → New: <strong>${sourceLevel.name}</strong> (${sourceLevel.margin}% margin)</div>
        </div>
        ${statusBadge}
        ${hasConflict ? `
          <select onchange="window.ERP._mergerResolve(${c.id},this.value)" style="padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:0.82rem">
            <option value="pending" ${resolution==='pending'?'selected':''}>Choose...</option>
            <option value="apply" ${resolution==='apply'?'selected':''}>✅ Apply New Level</option>
            <option value="skip" ${resolution==='skip'?'selected':''}>⏭️ Skip</option>
          </select>` : ''}
      </div>
      ${productRows ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">${productRows}</div>` : ''}
    </div>`;
  }).join('');

  const pendingCount = targetCusts.filter(c => {
    const hasConflict = c.priceLevel !== sourceLevel.name;
    return hasConflict && (ms.resolutions[c.id] || 'pending') === 'pending';
  }).length;
  const applyCount = targetCusts.filter(c => (ms.resolutions[c.id] || (c.priceLevel !== sourceLevel.name ? 'pending' : 'apply')) === 'apply').length;

  return `
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px">
    <div><h2 style="margin:0">🔀 Price Level Merger</h2><span class="text-sm text-light">Applying <strong>${sourceLevel.name}</strong> to ${targetCusts.length} customers</span></div>
    <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/accounting/customer-explorer')">← Back to Explorer</button>
  </div>

  <!-- Summary bar -->
  <div class="card mb-16" style="padding:10px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
    <span class="text-sm"><strong>Target Level:</strong> ${sourceLevel.name} (${sourceLevel.margin}% margin)</span>
    <span class="badge badge-green">${applyCount} will apply</span>
    ${pendingCount ? `<span class="badge badge-red">${pendingCount} need resolution</span>` : ''}
    <div style="margin-left:auto;display:flex;gap:6px">
      <button class="btn-outline btn-sm" onclick="window.ERP._mergerResolveAll('apply')">✅ Apply All</button>
      <button class="btn-outline btn-sm" onclick="window.ERP._mergerResolveAll('skip')">⏭️ Skip All Conflicts</button>
      <button class="btn-primary btn-sm" onclick="window.ERP._mergerExecute()" ${pendingCount?'disabled':''}>🚀 Execute Merge</button>
    </div>
  </div>

  ${rows}`;
}

// ── Price Merger Handlers ──
(function() {
  window.ERP._mergerResolve = function(custId, res) {
    if (!window._priceMergerState) return;
    if (!window._priceMergerState.resolutions) window._priceMergerState.resolutions = {};
    window._priceMergerState.resolutions[custId] = res;
    window._expRerender();
  };
  window.ERP._mergerResolveAll = function(res) {
    if (!window._priceMergerState) return;
    const ms = window._priceMergerState;
    if (!ms.resolutions) ms.resolutions = {};
    const sourceLevel = PRICE_LEVELS.find(l => l.name === ms.sourceLevelName);
    (ms.targetCustomerIds||[]).forEach(id => {
      const c = CUSTOMERS.find(x => x.id === id);
      if (c && c.priceLevel !== (sourceLevel?sourceLevel.name:'')) {
        ms.resolutions[id] = res;
      }
    });
    window._expRerender();
  };
  window.ERP._mergerExecute = function() {
    const ms = window._priceMergerState;
    if (!ms) return;
    const applied = (ms.targetCustomerIds||[]).filter(id => {
      const c = CUSTOMERS.find(x => x.id === id);
      const conflict = c && c.priceLevel !== ms.sourceLevelName;
      const res = ms.resolutions ? ms.resolutions[id] : undefined;
      return !conflict || res === 'apply';
    });
    applied.forEach(id => {
      const c = CUSTOMERS.find(x => x.id === id);
      if (c) c.priceLevel = ms.sourceLevelName;
    });
    window.ERP.toast(`🔀 Applied "${ms.sourceLevelName}" to ${applied.length} customer(s)`, 'success');
    window._priceMergerState = null;
    window.ERP.nav('#/accounting/customer-explorer');
  };
})();
