// ===== Route Planner Screens =====
import { ROUTES, ORDERS, CUSTOMERS, TRUCKS, fmt$, customerName } from '../data.js';

export function routeNav() {
  return [
    { section: 'Routes', icon: '🗺', label: 'Route Builder', page: 'main', default: true },
    { section: 'Routes', icon: '📋', label: 'Route Assignment', page: 'assignment' },
    { section: 'Routes', icon: '🚛', label: 'Trucks', page: 'trucks' },
    { section: 'Tools', icon: '📍', label: 'Unassigned Orders', page: 'unassigned', badge: '3', badgeColor: 'red' },
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

/* ═══════════════════════════════════════════════════════════
   ROUTE BUILDER — module-level state persists across renders
   ═══════════════════════════════════════════════════════════ */
let _rbState = null;

function getRBState() {
  if (_rbState) return _rbState;
  _rbState = {
    dragging: null,
    unassigned: [
      { id: 'ORD-2611', name: 'Porter Steakhouse',  addr: '45 Province St',   items: 4, total: 380, mx: 300, my: 115 },
      { id: 'ORD-2612', name: "New Customer Café",   addr: '200 Boylston St',  items: 5, total: 450, mx: 255, my: 150 },
      { id: 'ORD-2613', name: 'South End Market',    addr: '400 Harrison Ave', items: 2, total: 215, mx: 286, my: 195 },
    ],
    routes: {
      A1: {
        id: 'Route A-1', label: 'Downtown Boston', color: '#3b82f6',
        driver: 'Mike Roberts', truck: 'TRK-01', status: 'In Progress', pct: 50,
        stops: [
          { n:1, name:'Bella Cucina',     status:'done',    mx:322, my:70  },
          { n:2, name:'Harbor Grill',     status:'done',    mx:416, my:185 },
          { n:3, name:'Ocean Prime',      status:'current', mx:382, my:132 },
          { n:4, name:"Tony's DT",        status:'pending', mx:352, my:155 },
          { n:5, name:"Tony's HQ",        status:'pending', mx:344, my:170 },
          { n:6, name:'Waterfront Hotel', status:'pending', mx:428, my:148 },
        ],
      },
      B2: {
        id: 'Route B-2', label: 'Cambridge / Somerville', color: '#16a34a',
        driver: 'Tom Davis', truck: 'TRK-03', status: 'Loading', pct: 0,
        stops: [
          { n:1, name:'Porter Square Grill', status:'pending', mx:103, my:72  },
          { n:2, name:'Fresh Market Deli',   status:'pending', mx:138, my:92  },
          { n:3, name:'Local Bistro',         status:'pending', mx:150, my:105 },
          { n:4, name:'Cambridge Catering',  status:'pending', mx:166, my:122 },
          { n:5, name:'Campus Cafe',          status:'pending', mx:130, my:118 },
        ],
      },
      C3: {
        id: 'Route C-3', label: 'South Shore', color: '#ea580c',
        driver: 'Unassigned', truck: 'TRK-05', status: 'Not Started', pct: 0,
        stops: [
          { n:1, name:'Sunrise Bakery',    status:'pending', mx:188, my:62  },
          { n:2, name:'Green Leaf Cafe',   status:'pending', mx:268, my:170 },
          { n:3, name:'South Shore Diner', status:'pending', mx:310, my:256 },
          { n:4, name:'Marina Restaurant', status:'pending', mx:344, my:266 },
        ],
      },
    },
  };
  return _rbState;
}

/* ── DRAG-AND-DROP GLOBAL HANDLERS ── */
function setupDnD() {
  window._rbDragStart = (ev, orderId) => {
    getRBState().dragging = orderId;
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', orderId);
    setTimeout(() => ev.target.classList.add('rb-dragging'), 0);
  };
  window._rbDragEnd = (ev) => {
    ev.target.classList.remove('rb-dragging');
    getRBState().dragging = null;
    document.querySelectorAll('.rb-drop-zone').forEach(el => el.classList.remove('drag-over'));
  };
  window._rbDragOver = (ev, rid) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    document.getElementById('rb-dz-' + rid)?.classList.add('drag-over');
  };
  window._rbDragLeave = (ev, rid) => {
    const dz = document.getElementById('rb-dz-' + rid);
    if (dz && !dz.contains(ev.relatedTarget)) dz.classList.remove('drag-over');
  };
  window._rbDrop = (ev, rid) => {
    ev.preventDefault();
    const s = getRBState();
    document.getElementById('rb-dz-' + rid)?.classList.remove('drag-over');
    const orderId = ev.dataTransfer.getData('text/plain') || s.dragging;
    s.dragging = null;
    if (!orderId) return;
    const order = s.unassigned.find(o => o.id === orderId);
    if (!order) return;
    s.unassigned = s.unassigned.filter(o => o.id !== orderId);
    const route = s.routes[rid];
    const newStop = { n: route.stops.length + 1, name: order.name, status: 'pending', mx: order.mx, my: order.my };
    route.stops.push(newStop);
    _rbUpdateDOM(rid, order, newStop);
  };
  window._rbAutoOptimize = () => {
    const s = getRBState();
    if (!s.unassigned.length) { window.ERP.toast('All routes already optimized!', 'success'); return; }
    const rids = ['A1','B2','C3'];
    [...s.unassigned].forEach((order, i) => {
      const rid = rids[i % 3];
      const route = s.routes[rid];
      const ns = { n: route.stops.length + 1, name: order.name, status: 'pending', mx: order.mx, my: order.my };
      route.stops.push(ns);
      _rbUpdateDOM(rid, order, ns);
    });
    s.unassigned = [];
  };
}

function _rbUpdateDOM(rid, order, newStop) {
  const s = getRBState();
  const route = s.routes[rid];
  // unassigned panel
  const uPanel = document.getElementById('rb-unassigned');
  if (uPanel) uPanel.innerHTML = s.unassigned.length ? s.unassigned.map(renderDragCard).join('') : '<div class="rb-empty-bag">✅ All orders assigned!</div>';
  const uc = document.getElementById('rb-u-count');
  if (uc) { uc.textContent = s.unassigned.length || ''; uc.style.display = s.unassigned.length ? '' : 'none'; }
  // stops list
  const sl = document.getElementById('rb-stops-' + rid);
  if (sl) sl.innerHTML = route.stops.map(renderStopItem).join('');
  const cnt = document.getElementById('rb-cnt-' + rid);
  if (cnt) cnt.textContent = route.stops.length + ' stops';
  // map pin + line
  const layer = document.getElementById('rb-new-pins');
  if (layer) {
    const prev = route.stops[route.stops.length - 2];
    if (prev) {
      const ln = document.createElementNS('http://www.w3.org/2000/svg','line');
      ln.setAttribute('x1',prev.mx); ln.setAttribute('y1',prev.my);
      ln.setAttribute('x2',newStop.mx); ln.setAttribute('y2',newStop.my);
      ln.setAttribute('stroke',route.color); ln.setAttribute('stroke-width','2.5');
      ln.setAttribute('stroke-dasharray','5,3'); ln.setAttribute('opacity','0.85');
      layer.appendChild(ln);
    }
    const pulse = document.createElementNS('http://www.w3.org/2000/svg','circle');
    pulse.setAttribute('cx',newStop.mx); pulse.setAttribute('cy',newStop.my); pulse.setAttribute('r','8');
    pulse.setAttribute('fill','none'); pulse.setAttribute('stroke',route.color); pulse.setAttribute('stroke-width','2.5');
    pulse.setAttribute('class','rb-pulse-ring'); layer.appendChild(pulse);
    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('class','rb-pop-pin');
    g.innerHTML = `<circle cx="${newStop.mx}" cy="${newStop.my}" r="9" fill="${route.color}" stroke="white" stroke-width="2"/><text x="${newStop.mx}" y="${newStop.my+4}" text-anchor="middle" font-size="8" fill="white" font-weight="bold">${newStop.n}</text>`;
    layer.appendChild(g);
  }
  window.ERP.toast(`${order.name} → ${route.id}`, 'success');
}

function renderDragCard(o) {
  return `<div class="drag-card" draggable="true"
    ondragstart="window._rbDragStart(event,'${o.id}')"
    ondragend="window._rbDragEnd(event)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
      <span style="font-size:11px;font-weight:700;color:#2563eb">${o.id}</span>
      <span style="font-size:10px;color:#64748b">${o.items} items</span>
    </div>
    <div style="font-size:12px;font-weight:600;color:#1e293b;margin-bottom:1px">${o.name}</div>
    <div style="font-size:10px;color:#64748b;margin-bottom:5px">📍 ${o.addr}</div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="badge badge-yellow" style="font-size:9px;padding:2px 7px">Unassigned</span>
      <span style="font-size:11px;font-weight:700">${fmt$(o.total)}</span>
    </div>
  </div>`;
}

function renderStopItem(stop) {
  const icon  = stop.status === 'done' ? '✅' : stop.status === 'current' ? '🚛' : '⏳';
  const style = stop.status === 'done' ? 'opacity:0.6' : stop.status === 'current' ? 'background:#eff6ff;border-radius:4px;padding:2px 4px' : '';
  return `<div class="stop-item stop-${stop.status}" style="display:flex;align-items:center;gap:8px;${style}">
    <span class="drag-handle">⠿</span>
    <span class="text-sm"><strong>${stop.n}.</strong> ${stop.name}</span>
    <span style="margin-left:auto" class="text-xs">${icon}</span>
  </div>`;
}

/* ── SVG MAP ── */
function renderSVGMap(s) {
  const mkPin = (st, n, color, bgColor) => {
    const isCurrent = st.status === 'current';
    const isDone    = st.status === 'done';
    const r = isCurrent ? 9 : 7;
    const fill = isDone ? bgColor + '80' : isCurrent ? color : bgColor;
    const textFill = isDone ? color : isCurrent ? 'white' : color;
    const ring = isCurrent ? `<circle cx="${st.mx}" cy="${st.my}" r="15" fill="${color}" opacity="0.12" class="rb-pulse-static"/>` : '';
    return `${ring}<circle cx="${st.mx}" cy="${st.my}" r="${r}" fill="${fill}" stroke="${color}" stroke-width="${isCurrent?2:1.5}"/><text x="${st.mx}" y="${st.my+4}" text-anchor="middle" font-size="${r-1}" fill="${textFill}" font-weight="bold">${n}</text>`;
  };
  const aLine = s.routes.A1.stops.map(st => `${st.mx},${st.my}`).join(' ');
  const bLine = s.routes.B2.stops.map(st => `${st.mx},${st.my}`).join(' ');
  const cLine = s.routes.C3.stops.map(st => `${st.mx},${st.my}`).join(' ');
  return `<div class="rb-map-wrap">
    <div class="rb-map-legend">
      <span><span class="rb-leg-dot" style="background:#3b82f6"></span>Route A-1 (In Progress)</span>
      <span><span class="rb-leg-dot" style="background:#16a34a"></span>Route B-2 (Loading)</span>
      <span><span class="rb-leg-dot" style="background:#ea580c"></span>Route C-3 (Not Started)</span>
      <span><span class="rb-leg-dot" style="background:#e2e8f0;border:1.5px dashed #94a3b8"></span>Unassigned</span>
      <span style="margin-left:auto;font-size:11px;color:#64748b">🚛 = current truck position</span>
    </div>
    <svg id="rb-map-svg" viewBox="0 0 560 290" preserveAspectRatio="xMidYMid meet"
         style="width:100%;display:block;border-radius:8px;border:1px solid #e2e8f0">
      <defs><style>
        .rb-pulse-static{animation:rbPS 2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
        @keyframes rbPS{0%,100%{transform:scale(1);opacity:.12}50%{transform:scale(1.55);opacity:.25}}
        .rb-pulse-ring{animation:rbPR .9s ease-out forwards;transform-box:fill-box;transform-origin:center}
        @keyframes rbPR{0%{transform:scale(1);opacity:.85}100%{transform:scale(3.5);opacity:0}}
        .rb-pop-pin{animation:rbPI .45s cubic-bezier(.34,1.56,.64,1) both;transform-box:fill-box;transform-origin:center}
        @keyframes rbPI{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
      </style></defs>
      <!-- Base -->
      <rect width="560" height="290" fill="#eef2f7"/>
      <!-- Harbor -->
      <polygon points="455,62 508,0 560,0 560,290 455,290 386,238 396,178 438,142 460,80" fill="#bfdbfe" opacity=".55"/>
      <text x="484" y="108" font-size="9" fill="#60a5fa" font-weight="700">HARBOR</text>
      <!-- Charles River -->
      <path d="M 0,184 Q 52,178 108,181 Q 168,184 228,182 Q 260,181 284,178" stroke="#93c5fd" stroke-width="9" fill="none" opacity=".6"/>
      <text x="56" y="177" font-size="7" fill="#60a5fa">Charles River</text>
      <!-- Parks -->
      <rect x="232" y="138" width="52" height="36" rx="5" fill="#bbf7d0" opacity=".6"/>
      <text x="258" y="158" text-anchor="middle" font-size="7" fill="#16a34a">Common</text>
      <rect x="84" y="130" width="42" height="28" rx="4" fill="#bbf7d0" opacity=".45"/>
      <!-- Roads -->
      <line x1="308" y1="0"   x2="315" y2="290" stroke="#d1d5db" stroke-width="4"/>
      <line x1="45"  y1="202" x2="256" y2="80"  stroke="#e2e8f0" stroke-width="3"/>
      <line x1="72"  y1="152" x2="420" y2="152" stroke="#e2e8f0" stroke-width="2.5"/>
      <line x1="388" y1="60"  x2="394" y2="205" stroke="#e2e8f0" stroke-width="2.5"/>
      <line x1="282" y1="165" x2="445" y2="165" stroke="#e2e8f0" stroke-width="2"/>
      <line x1="60"  y1="90"  x2="290" y2="90"  stroke="#e2e8f0" stroke-width="2"/>
      <line x1="218" y1="100" x2="312" y2="268" stroke="#e2e8f0" stroke-width="1.5"/>
      <line x1="268" y1="152" x2="290" y2="230" stroke="#e2e8f0" stroke-width="1.5"/>
      <line x1="80"  y1="68"  x2="210" y2="68"  stroke="#e2e8f0" stroke-width="1.5"/>
      <!-- Labels -->
      <text x="98"  y="80"  font-size="9" fill="#94a3b8" font-weight="700">CAMBRIDGE</text>
      <text x="304" y="60"  font-size="9" fill="#94a3b8" font-weight="700">NORTH END</text>
      <text x="218" y="130" font-size="9" fill="#94a3b8" font-weight="700">BACK BAY</text>
      <text x="268" y="218" font-size="9" fill="#94a3b8" font-weight="700">SOUTH END</text>
      <text x="406" y="215" font-size="9" fill="#94a3b8" font-weight="700">SEAPORT</text>
      <text x="148" y="54"  font-size="9" fill="#94a3b8" font-weight="700">SOMERVILLE</text>
      <!-- Route lines -->
      <polyline points="${aLine}" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linejoin="round" opacity=".85"/>
      <polyline points="${bLine}" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linejoin="round" opacity=".85"/>
      <polyline points="${cLine}" fill="none" stroke="#ea580c" stroke-width="2.5" stroke-linejoin="round" stroke-dasharray="6,3" opacity=".85"/>
      <!-- Route A-1 pins -->
      ${s.routes.A1.stops.map((st,i) => mkPin(st,i+1,'#3b82f6','#dbeafe')).join('\n      ')}
      <!-- Route B-2 pins -->
      ${s.routes.B2.stops.map((st,i) => mkPin(st,i+1,'#16a34a','#d1fae5')).join('\n      ')}
      <!-- Route C-3 pins -->
      ${s.routes.C3.stops.map((st,i) => mkPin(st,i+1,'#ea580c','#fed7aa')).join('\n      ')}
      <!-- Unassigned ghost pins -->
      ${s.unassigned.map(o => `<circle cx="${o.mx}" cy="${o.my}" r="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2"/><text x="${o.mx}" y="${o.my+4}" text-anchor="middle" font-size="8" fill="#94a3b8">?</text>`).join('\n      ')}
      <!-- Truck at Ocean Prime (stop 3, current) -->
      <text x="369" y="126" font-size="14" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.3))">🚛</text>
      <!-- Dynamic pins layer -->
      <g id="rb-new-pins"></g>
    </svg>
  </div>`;
}

/* ── ROUTE BUILDER ── */
function builderPage() {
  setupDnD();
  const s = getRBState();
  const totalU = s.unassigned.length;
  return `
    <div class="section-title">
      <h2>🗺 Route Builder</h2>
      <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
        <button class="btn-outline btn-sm" onclick="window._rbAutoOptimize()">🤖 Auto-Assign All</button>
        <button class="btn-primary btn-sm" onclick="window.ERP.toast('Routes saved','success')">💾 Save Routes</button>
      </div>
    </div>

    <div class="rb-top-layout">
      <!-- SVG Map -->
      <div class="rb-map-col">
        ${renderSVGMap(s)}
      </div>

      <!-- Unassigned Orders panel -->
      <div class="rb-sidebar-col">
        <div class="card" style="margin-bottom:0;padding:14px;height:100%">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <h3 style="margin:0;font-size:14px">📦 Unassigned Orders</h3>
            <span id="rb-u-count" class="badge badge-red" style="${totalU ? '' : 'display:none'}">${totalU}</span>
          </div>
          <p style="font-size:11px;color:#64748b;margin-bottom:10px">↔ Drag a card onto a route below</p>
          <div id="rb-unassigned">
            ${s.unassigned.length ? s.unassigned.map(renderDragCard).join('') : '<div class="rb-empty-bag">✅ All orders assigned!</div>'}
          </div>
        </div>
      </div>
    </div>

    <!-- Route cards with drop zones -->
    <div class="grid-3" style="margin-top:16px">
      ${Object.entries(s.routes).map(([rid, route]) => `
        <div class="card" style="padding:16px">
          <div class="card-header" style="margin-bottom:10px">
            <div>
              <strong>${route.id}</strong>
              <br><span class="text-xs text-light">${route.driver} · ${route.truck}</span>
            </div>
            ${badge(route.status)}
          </div>
          <div class="flex-between text-sm mb-8">
            <span id="rb-cnt-${rid}">${route.stops.length} stops</span>
            <span>${route.pct}% complete</span>
          </div>
          <div class="progress mb-8">
            <div class="progress-fill" style="width:${route.pct}%;background:${route.color}"></div>
          </div>
          <div id="rb-stops-${rid}" style="max-height:190px;overflow-y:auto;margin-bottom:10px">
            ${route.stops.map(renderStopItem).join('')}
          </div>
          <div id="rb-dz-${rid}"
               class="rb-drop-zone"
               style="--dz-color:${route.color}"
               ondragover="window._rbDragOver(event,'${rid}')"
               ondragleave="window._rbDragLeave(event,'${rid}')"
               ondrop="window._rbDrop(event,'${rid}')">
            <span class="rb-dz-plus" style="border-color:${route.color}40;color:${route.color}">+</span>
            Drop order here
          </div>
          <div style="display:flex;gap:6px;margin-top:10px">
            <button class="btn-outline btn-sm" style="flex:1" onclick="window.ERP.toast('Opening editor…','')">✏️ Edit</button>
            <button class="btn-outline btn-sm" style="flex:1" onclick="window.ERP.toast('Route optimized','success')">🔄 Optimize</button>
          </div>
        </div>
      `).join('')}
    </div>`;
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
