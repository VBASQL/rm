// ===== Warehouse Screens =====
import { ORDERS, CUSTOMERS, PRODUCTS, fmt$, customerName } from '../data.js';

export function warehouseNav() {
  return [
    { section: 'Orders', icon: '📋', label: 'Order Queue', page: 'main', default: true, badge: '5', badgeColor: 'orange' },
    { section: 'Orders', icon: '📦', label: 'Pick Order', page: 'pick' },
    { section: 'Orders', icon: '✅', label: 'Pick Approval', page: 'approval' },
    { section: 'Tools', icon: '🤖', label: 'AI Pick Review', page: 'ai-review' },
    { section: 'Tools', icon: '🖨', label: 'Print Management', page: 'print' },
    { section: 'Tools', icon: '📊', label: 'Reports', page: 'reports' },
  ];
}

export function renderWarehouse(page) {
  switch (page) {
    case 'pick': return pickOrderPage();
    case 'approval': return pickApprovalPage();
    case 'ai-review': return aiReviewPage();
    case 'print': return printManagementPage();
    case 'reports': return whReportsPage();
    default: return queuePage();
  }
}

/* ── ORDER QUEUE ── */
function queuePage() {
  const routes = [
    { name: 'Route A-1: Downtown Boston', driver: 'Mike Roberts', orders: ORDERS.filter(o => o.route === 'Route A-1') },
    { name: 'Route B-2: Cambridge', driver: 'Tom Davis', orders: ORDERS.filter(o => o.route === 'Route B-2') },
    { name: 'Route C-3: South Shore', driver: 'Unassigned', orders: ORDERS.filter(o => o.route === 'Route C-3') },
  ];
  return `
    <div class="section-title"><h2>📋 Order Queue</h2><span class="text-light text-sm">Wednesday, Feb 26 — Pick Cutoff: 11:00 AM</span></div>
    <div class="tiles">
      <div class="tile tile-blue"><div class="tile-label">Total Orders</div><div class="tile-value">${ORDERS.length}</div></div>
      <div class="tile tile-orange"><div class="tile-label">Pending Pick</div><div class="tile-value">${ORDERS.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length}</div></div>
      <div class="tile tile-yellow"><div class="tile-label">In Progress</div><div class="tile-value">${ORDERS.filter(o => o.status === 'Picking').length}</div></div>
      <div class="tile tile-green"><div class="tile-label">Ready to Load</div><div class="tile-value">2</div></div>
    </div>
    ${routes.map(r => `<div class="card">
      <div class="card-header"><h3>🚛 ${r.name}</h3><span class="text-sm text-light">Driver: ${r.driver} · ${r.orders.length} orders</span></div>
      <table><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Status</th><th style="text-align:right">Total</th><th></th></tr></thead>
      <tbody>${r.orders.map(o => `<tr${o.status === 'Hold' ? ' class="row-danger"' : ''}>
        <td><strong>${o.id}</strong></td><td>${customerName(o.customer)}</td><td>${o.items}</td>
        <td>${badge(o.status)}</td><td style="text-align:right">${fmt$(o.total)}</td>
        <td>${o.status === 'Pending' || o.status === 'Confirmed' ? `<button class="btn-primary btn-sm" onclick="window.ERP.nav('#/warehouse/pick')">Start Pick</button>` :
          o.status === 'Picking' ? `<button class="btn-outline btn-sm" onclick="window.ERP.nav('#/warehouse/pick')">Continue</button>` : ''}</td>
      </tr>`).join('')}</tbody></table>
    </div>`).join('')}`;
}

/* ── PICK ORDER ── */
function pickOrderPage() {
  const pickItems = [
    { code: '10101', name: 'Whole Milk', pack: '4/1 GAL', loc: 'A-12-3', ordered: 4, picked: 4 },
    { code: '20102', name: 'Tomatoes Vine-Ripe', pack: '25 LB', loc: 'C-04-1', ordered: 2, picked: 2 },
    { code: '30101', name: 'Chicken Breast Boneless', pack: '40 LB', loc: 'F-08-2', ordered: 1, picked: 1 },
    { code: '20101', name: 'Romaine Hearts', pack: '24 CT', loc: 'C-01-1', ordered: 3, picked: 0 },
    { code: '10103', name: 'Large Eggs Grade A', pack: '15 DOZ', loc: 'A-15-1', ordered: 2, picked: 0 },
    { code: '40101', name: 'Atlantic Salmon Fillet', pack: '10 LB', loc: 'F-12-3', ordered: 1, picked: 0 },
  ];
  const doneCt = pickItems.filter(i => i.picked >= i.ordered).length;
  const pct = Math.round((doneCt / pickItems.length) * 100);

  return `
    <div style="margin-bottom:16px"><a style="color:var(--primary);cursor:pointer;font-size:13px" onclick="window.ERP.nav('#/warehouse/main')">← Back to Queue</a></div>
    <div class="section-title"><h2>📦 Pick Order — ORD-2601</h2>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-outline btn-sm" onclick="window.ERP.toast('Pick list printed','success')">🖨 Print Pick List</button>
        <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/warehouse/ai-review')">🤖 AI Scan</button>
      </div>
    </div>

    <div class="grid-2 mb-16" style="grid-template-columns:1fr 300px">
      <div class="card">
        <div class="flex-between mb-8"><strong>Bella Cucina Restaurant</strong><span class="badge badge-blue">BELL-001</span></div>
        <div class="text-sm text-light">Route A-1 · 245 Hanover St, Boston</div>
      </div>
      <div class="card">
        <div class="flex-between"><span class="text-sm text-light">Pick Progress</span><span class="bold">${pct}%</span></div>
        <div class="progress mt-8"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="text-xs text-light mt-8">${doneCt} of ${pickItems.length} items picked</div>
      </div>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Loc</th><th>Code</th><th>Product</th><th>Pack</th><th style="text-align:center">Ordered</th><th style="text-align:center">Picked</th><th>Status</th></tr></thead>
        <tbody>${pickItems.map(item => {
          const done = item.picked >= item.ordered;
          return `<tr class="${done ? '' : 'row-highlight'}">
            <td><code>${item.loc}</code></td><td><code>${item.code}</code></td><td><strong>${item.name}</strong></td><td class="text-sm">${item.pack}</td>
            <td style="text-align:center">${item.ordered}</td>
            <td style="text-align:center"><input class="inline-input${done ? '' : ' edit'}" type="number" value="${item.picked}" min="0" max="${item.ordered}"></td>
            <td>${done ? '<span class="badge badge-green">✓ Picked</span>' : '<span class="badge badge-yellow">Pending</span>'}</td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>

    <div class="flex-between mt-16">
      <div class="info-box">💡 <strong>Tip:</strong> Pick items in location order (A→F) for fastest warehouse traversal.</div>
      <div style="display:flex;gap:8px">
        <button class="btn-outline" onclick="window.ERP.toast('Saved as partial pick')">Save Progress</button>
        <button class="btn-success" onclick="window.ERP.nav('#/warehouse/approval')">Complete Pick →</button>
      </div>
    </div>`;
}

/* ── PICK APPROVAL ── */
function pickApprovalPage() {
  return `
    <div class="section-title"><h2>✅ Pick Approval Queue</h2></div>
    <div class="info-box mb-16">Picks that require supervisor review before loading. Short picks and substitutions need approval.</div>

    <div class="card card-border-warn">
      <div class="card-header">
        <div><strong>ORD-2603 — Ocean Prime Seafood</strong><br><span class="text-sm text-light">Picked by Rachel Green · 9:42 AM</span></div>
        <span class="badge badge-yellow">Short Pick</span>
      </div>
      <table><thead><tr><th>Product</th><th style="text-align:center">Ordered</th><th style="text-align:center">Picked</th><th>Issue</th></tr></thead>
      <tbody>
        <tr class="row-warn"><td>Atlantic Salmon Fillet</td><td style="text-align:center">3</td><td style="text-align:center">2</td><td><span class="text-red">Short 1 — Out of stock</span></td></tr>
        <tr><td>Jumbo Shrimp 16/20</td><td style="text-align:center">4</td><td style="text-align:center">4</td><td><span class="text-green">Complete</span></td></tr>
        <tr><td>NY Strip Steak</td><td style="text-align:center">2</td><td style="text-align:center">2</td><td><span class="text-green">Complete</span></td></tr>
      </tbody></table>
      <div class="flex-between mt-16">
        <div class="form-group" style="flex:1;margin-right:12px;margin-bottom:0"><input placeholder="Approval notes — e.g., customer notified of short"></div>
        <div style="display:flex;gap:8px">
          <button class="btn-outline" onclick="window.ERP.toast('Sent back for re-pick','')">Send Back</button>
          <button class="btn-success" onclick="window.ERP.toast('Pick approved — ready to load','success')">✅ Approve</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div><strong>ORD-2609 — Tony's Pizza HQ</strong><br><span class="text-sm text-light">Picked by Rachel Green · 10:15 AM</span></div>
        <span class="badge badge-green">Complete</span>
      </div>
      <div class="text-sm text-light">14 items — all quantities match. No issues.</div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn-success" onclick="window.ERP.toast('Pick approved','success')">✅ Approve</button>
        <button class="btn-outline btn-sm">View Details</button>
      </div>
    </div>`;
}

/* ── AI PICK REVIEW ── */
function aiReviewPage() {
  return `
    <div class="section-title"><h2>🤖 AI Pick Verification</h2></div>
    <div class="info-box mb-16">AI-powered OCR scans the pick sheet photo and compares against the digital order. Discrepancies are highlighted.</div>

    <div class="grid-2">
      <div class="card">
        <h3>📸 Pick Sheet Photo</h3>
        <div class="map-placeholder" style="height:300px;background:#f1f5f9;border-color:#cbd5e1">
          📷 Camera / Upload Area<br><span class="text-sm">Take a photo of the handwritten pick sheet</span>
        </div>
        <div style="display:flex;gap:8px;justify-content:center">
          <button class="btn-primary" onclick="window.ERP.toast('Processing image…','')">📷 Take Photo</button>
          <button class="btn-outline">📁 Upload Image</button>
        </div>
      </div>
      <div class="card">
        <h3>🔍 AI Extracted vs System</h3>
        <table>
          <thead><tr><th>Product</th><th style="text-align:center">AI Read</th><th style="text-align:center">System</th><th>Match</th></tr></thead>
          <tbody>
            <tr><td>Whole Milk</td><td style="text-align:center">4</td><td style="text-align:center">4</td><td><span class="text-green bold">✓</span></td></tr>
            <tr><td>Tomatoes Vine-Ripe</td><td style="text-align:center">2</td><td style="text-align:center">2</td><td><span class="text-green bold">✓</span></td></tr>
            <tr><td>Chicken Breast</td><td style="text-align:center">1</td><td style="text-align:center">1</td><td><span class="text-green bold">✓</span></td></tr>
            <tr class="row-danger"><td>Romaine Hearts</td><td style="text-align:center">2</td><td style="text-align:center">3</td><td><span class="text-red bold">✗ Mismatch</span></td></tr>
            <tr><td>Large Eggs</td><td style="text-align:center">2</td><td style="text-align:center">2</td><td><span class="text-green bold">✓</span></td></tr>
            <tr><td>Salmon Fillet</td><td style="text-align:center">1</td><td style="text-align:center">1</td><td><span class="text-green bold">✓</span></td></tr>
          </tbody>
        </table>
        <div class="warn-box mt-16">⚠️ <strong>1 discrepancy found:</strong> Romaine Hearts — AI read 2, system expected 3. Please verify.</div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn-outline" onclick="window.ERP.toast('Sent for re-count','')">Re-count Item</button>
          <button class="btn-success" onclick="window.ERP.toast('Accepted with note','success')">Accept as 2</button>
        </div>
      </div>
    </div>`;
}

/* ── PRINT MANAGEMENT ── */
function printManagementPage() {
  return `
    <div class="section-title"><h2>🖨 Print Management</h2></div>
    <div class="info-box mb-16">Auto-delivery rule: when a pick list is printed, the order is automatically confirmed and moved to "picking" status.</div>
    <div class="grid-2">
      <div class="card">
        <h3>Print Queue</h3>
        <table><thead><tr><th>Document</th><th>Order</th><th>Type</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr><td>Pick List</td><td>ORD-2604</td><td>📋 Pick Sheet</td><td><span class="badge badge-yellow">Queued</span></td><td><button class="btn-primary btn-sm" onclick="window.ERP.toast('Printing…','success')">Print</button></td></tr>
          <tr><td>Pick List</td><td>ORD-2605</td><td>📋 Pick Sheet</td><td><span class="badge badge-yellow">Queued</span></td><td><button class="btn-primary btn-sm" onclick="window.ERP.toast('Printing…','success')">Print</button></td></tr>
          <tr><td>Invoice</td><td>ORD-2601</td><td>📄 Invoice</td><td><span class="badge badge-green">Printed</span></td><td><button class="btn-outline btn-sm">Reprint</button></td></tr>
          <tr><td>Delivery Note</td><td>ORD-2602</td><td>📄 Delivery</td><td><span class="badge badge-green">Printed</span></td><td><button class="btn-outline btn-sm">Reprint</button></td></tr>
        </tbody></table>
        <button class="btn-primary mt-16" onclick="window.ERP.toast('Batch printing 2 documents…','success')">🖨 Print All Queued</button>
      </div>
      <div class="card">
        <h3>Printer Settings</h3>
        <div class="form-group"><label>Default Printer</label><select><option>Office-HP-LaserJet (Main)</option><option>Warehouse-Brother (Labels)</option></select></div>
        <div class="form-group"><label>Auto-Print Pick Lists</label><select><option>Enabled — print on order confirm</option><option>Disabled — manual only</option></select></div>
        <div class="form-group"><label>Invoice Copies</label><select><option>2 copies (driver + customer)</option><option>3 copies (+ office)</option></select></div>
        <div class="info-box mt-8">📌 Print = Auto-Confirm: When a pick list prints, the order status changes from "Confirmed" to "Picking" automatically.</div>
      </div>
    </div>`;
}

/* ── REPORTS ── */
function whReportsPage() {
  return `
    <div class="section-title"><h2>📊 Warehouse Reports</h2></div>
    <div class="grid-3">
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">📦</div><h3>Pick Efficiency</h3><p class="text-sm text-light">Time per pick, accuracy rates</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">📊</div><h3>Order Volume</h3><p class="text-sm text-light">Daily/weekly order counts</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">⚠️</div><h3>Short Picks</h3><p class="text-sm text-light">Shortage trends and causes</p></div>
    </div>
    <div class="card">
      <h3>Today's Summary</h3>
      <div class="stat-grid">
        <div class="stat-item"><div class="text-xs text-light">Total Picked</div><div class="bold" style="font-size:20px">7</div></div>
        <div class="stat-item"><div class="text-xs text-light">Avg Pick Time</div><div class="bold" style="font-size:20px">12m</div></div>
        <div class="stat-item"><div class="text-xs text-light">Accuracy</div><div class="bold text-green" style="font-size:20px">96%</div></div>
        <div class="stat-item"><div class="text-xs text-light">Short Picks</div><div class="bold text-red" style="font-size:20px">1</div></div>
      </div>
    </div>`;
}

function badge(status) {
  const map = { Delivered: 'green', Pending: 'yellow', Picking: 'orange', 'Out for Delivery': 'purple', Confirmed: 'blue', Hold: 'red' };
  return `<span class="badge badge-${map[status] || 'blue'}">${status}</span>`;
}
