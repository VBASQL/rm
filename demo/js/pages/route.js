// ===== Route Planner Screens =====
import { ROUTES, ORDERS, CUSTOMERS, TRUCKS, fmt$, customerName } from '../data.js';

export function routeNav() {
  return [
    { section: 'Routes', icon: '🗺', label: 'Route Builder', page: 'main', default: true },
    { section: 'Routes', icon: '📋', label: 'Route Assignment', page: 'assignment' },
    { section: 'Routes', icon: '🚛', label: 'Trucks', page: 'trucks' },
    { section: 'Tools', icon: '📍', label: 'Unassigned Orders', page: 'unassigned', badge: '2', badgeColor: 'red' },
    { section: 'Tools', icon: '📊', label: 'Route Reports', page: 'reports' },
  ];
}

export function renderRoute(page) {
  switch (page) {
    case 'assignment': return assignmentPage();
    case 'trucks': return trucksPage();
    case 'unassigned': return unassignedPage();
    case 'reports': return routeReportsPage();
    default: return builderPage();
  }
}

/* ── ROUTE BUILDER ── */
function builderPage() {
  return `
    <div class="section-title"><h2>🗺 Route Builder</h2>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-outline btn-sm" onclick="window.ERP.toast('Auto-optimizing routes…','')">🤖 Auto-Optimize</button>
        <button class="btn-primary btn-sm" onclick="window.ERP.toast('Routes saved','success')">💾 Save Routes</button>
      </div>
    </div>

    <div class="map-placeholder" style="height:240px">
      🗺 Interactive Map — Drag & drop stops to reorder<br>
      <span class="text-sm">🔵 Route A-1 · 🟢 Route B-2 · 🟠 Route C-3</span><br>
      <span class="text-xs text-light" style="margin-top:8px;display:block">Google Maps / Leaflet integration — routes shown with color-coded pins</span>
    </div>

    <div class="grid-3" style="margin-top:16px">
      ${ROUTES.map(r => `<div class="card">
        <div class="card-header">
          <div><strong>${r.name}</strong><br><span class="text-xs text-light">${r.driver} · ${r.truck}</span></div>
          ${badge(r.status)}
        </div>
        <div class="flex-between text-sm mb-8"><span>${r.stops} stops</span><span>${r.pct}% complete</span></div>
        <div class="progress mb-16"><div class="progress-fill" style="width:${r.pct}%"></div></div>

        <div style="max-height:200px;overflow-y:auto">
          ${r.id === 'Route A-1' ? routeAStops() : r.id === 'Route B-2' ? routeBStops() : routeCStops()}
        </div>

        <div style="display:flex;gap:6px;margin-top:12px">
          <button class="btn-outline btn-sm" style="flex:1">✏️ Edit</button>
          <button class="btn-outline btn-sm" style="flex:1" onclick="window.ERP.toast('Route optimized','success')">🔄 Optimize</button>
        </div>
      </div>`).join('')}
    </div>`;
}

function routeAStops() {
  const stops = [
    { n: 1, name: 'Bella Cucina', status: 'done' },
    { n: 2, name: 'Harbor Grill', status: 'done' },
    { n: 3, name: 'Ocean Prime', status: 'current' },
    { n: 4, name: "Tony's DT", status: 'pending' },
    { n: 5, name: "Tony's HQ", status: 'pending' },
    { n: 6, name: 'Waterfront Hotel', status: 'pending' },
  ];
  return stops.map(s => `<div class="stop-item stop-${s.status}" style="display:flex;align-items:center;gap:8px">
    <span class="drag-handle">⠿</span>
    <span class="text-sm"><strong>${s.n}.</strong> ${s.name}</span>
    <span style="margin-left:auto" class="text-xs">${s.status === 'done' ? '✅' : s.status === 'current' ? '🚛' : '⏳'}</span>
  </div>`).join('');
}
function routeBStops() {
  return ['Fresh Market Deli', 'Cambridge Catering', 'Local Bistro', 'Campus Cafe', 'Porter Square Grill'].map((n, i) =>
    `<div class="stop-item stop-pending" style="display:flex;align-items:center;gap:8px"><span class="drag-handle">⠿</span><span class="text-sm"><strong>${i+1}.</strong> ${n}</span></div>`
  ).join('');
}
function routeCStops() {
  return ['Sunrise Bakery', 'South Shore Diner', 'Marina Restaurant', 'Green Leaf Cafe'].map((n, i) =>
    `<div class="stop-item stop-pending" style="display:flex;align-items:center;gap:8px"><span class="drag-handle">⠿</span><span class="text-sm"><strong>${i+1}.</strong> ${n}</span></div>`
  ).join('');
}

/* ── ROUTE ASSIGNMENT ── */
function assignmentPage() {
  return `
    <div class="section-title"><h2>📋 Route Assignment</h2></div>
    <div class="tiles">
      <div class="tile tile-blue"><div class="tile-label">Total Routes</div><div class="tile-value">3</div></div>
      <div class="tile tile-green"><div class="tile-label">Assigned</div><div class="tile-value">2</div></div>
      <div class="tile tile-red"><div class="tile-label">Unassigned</div><div class="tile-value">1</div></div>
      <div class="tile tile-yellow"><div class="tile-label">Total Stops</div><div class="tile-value">15</div></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Route</th><th>Driver</th><th>Truck</th><th>Stops</th><th>Status</th><th style="text-align:right">Est. Value</th><th></th></tr></thead>
        <tbody>
          ${ROUTES.map(r => `<tr${!r.driver || r.driver === 'Unassigned' ? ' class="row-warn"' : ''}>
            <td><strong>${r.id}</strong><br><span class="text-xs text-light">${r.name.split(':')[1]?.trim() || ''}</span></td>
            <td>${r.driver === 'Unassigned' ? '<span class="text-red bold">⚠ Unassigned</span>' : r.driver}</td>
            <td>${r.truck}</td>
            <td>${r.stops}</td>
            <td>${badge(r.status)}</td>
            <td style="text-align:right">${r.id === 'Route A-1' ? fmt$(16885) : r.id === 'Route B-2' ? fmt$(3975) : fmt$(1170)}</td>
            <td>
              ${r.driver === 'Unassigned' ?
                `<button class="btn-primary btn-sm" onclick="window.ERP.showModal('Assign Driver','<div class=\\'form-group\\'><label>Driver</label><select><option>Tom Davis</option><option>Mike Roberts</option></select></div><div class=\\'form-group\\'><label>Truck</label><select><option>TRK-02 (Available)</option><option>TRK-05 (Available)</option></select></div>','<button class=\\'btn-primary\\' onclick=\\'window.ERP.toast(\"Driver assigned!\",\"success\");window.ERP.closeModal()\\'>Assign</button>')">Assign</button>` :
                `<button class="btn-outline btn-sm">Reassign</button>`}
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/* ── TRUCKS ── */
function trucksPage() {
  return `
    <div class="section-title"><h2>🚛 Fleet Management</h2></div>
    <div class="tiles">
      <div class="tile tile-green"><div class="tile-label">Available</div><div class="tile-value">${TRUCKS.filter(t => t.status === 'Available').length}</div></div>
      <div class="tile tile-blue"><div class="tile-label">In Use</div><div class="tile-value">${TRUCKS.filter(t => t.status === 'In Use').length}</div></div>
      <div class="tile tile-red"><div class="tile-label">Maintenance</div><div class="tile-value">${TRUCKS.filter(t => t.status === 'Maintenance').length}</div></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Truck ID</th><th>Type</th><th>Plate</th><th>Status</th><th>Driver</th><th></th></tr></thead>
        <tbody>${TRUCKS.map(t => `<tr>
          <td><strong>${t.id}</strong></td><td>${t.name}</td><td>${t.plate}</td>
          <td>${badge(t.status)}</td><td>${t.driver || '—'}</td>
          <td><button class="btn-outline btn-sm">Details</button></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

/* ── UNASSIGNED ── */
function unassignedPage() {
  const unassigned = ORDERS.filter(o => !o.route || o.route === '');
  return `
    <div class="section-title"><h2>📍 Unassigned Orders</h2></div>
    <div class="info-box mb-16">Orders that haven't been assigned to a route yet. Drag to a route or assign manually.</div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th style="text-align:right">Total</th><th></th></tr></thead>
        <tbody>
          <tr><td><strong>ORD-2610</strong></td><td>Green Leaf Cafe<br><span class="text-xs text-light">78 Newbury St</span></td><td>3</td><td style="text-align:right">${fmt$(280)}</td>
            <td><select style="padding:4px;border:1px solid var(--border);border-radius:4px;font-size:12px" onchange="window.ERP.toast('Assigned to '+this.value,'success')"><option>Assign to…</option><option>Route A-1</option><option>Route B-2</option><option>Route C-3</option></select></td></tr>
          <tr><td><strong>ORD-2612</strong></td><td>New Customer Café<br><span class="text-xs text-light">200 Boylston St</span></td><td>5</td><td style="text-align:right">${fmt$(450)}</td>
            <td><select style="padding:4px;border:1px solid var(--border);border-radius:4px;font-size:12px" onchange="window.ERP.toast('Assigned to '+this.value,'success')"><option>Assign to…</option><option>Route A-1</option><option>Route B-2</option><option>Route C-3</option></select></td></tr>
        </tbody>
      </table>
    </div>`;
}

/* ── REPORTS ── */
function routeReportsPage() {
  return `
    <div class="section-title"><h2>📊 Route Reports</h2></div>
    <div class="grid-3">
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">🗺</div><h3>Route Efficiency</h3><p class="text-sm text-light">Miles, time, stops per route</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">🚛</div><h3>Fleet Utilization</h3><p class="text-sm text-light">Truck usage and capacity</p></div>
      <div class="card report-card" onclick="window.ERP.nav('#/reports/main')"><div class="r-icon">⏱</div><h3>Delivery Times</h3><p class="text-sm text-light">On-time %, avg stop time</p></div>
    </div>`;
}

function badge(status) {
  const map = { 'In Progress': 'purple', 'In Use': 'blue', Loading: 'orange', 'Not Started': 'yellow', Available: 'green', Maintenance: 'red' };
  return `<span class="badge badge-${map[status] || 'blue'}">${status}</span>`;
}
