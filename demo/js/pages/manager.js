// ===== Manager Screens =====
import { CUSTOMERS, ORDERS, INVOICES, ROUTES, USERS, fmt$ } from '../data.js';

export function managerNav() {
  return [
    { section: 'Manager', icon: '📊', label: 'Dashboard', page: 'main', default: true },
    { section: 'Manager', icon: '🗺️', label: 'Live Tracker', page: 'tracker' },
    { section: 'Manager', icon: '🏆', label: 'Leaderboard', page: 'leaderboard' },
    { section: 'Manager', icon: '🔔', label: 'Alerts', page: 'alerts' },
    { section: 'Manager', icon: '📈', label: 'Revenue', page: 'revenue' },
    { section: 'Manager', icon: '🎯', label: 'Custom Views', page: 'custom' },
  ];
}

export function renderManager(page) {
  switch(page) {
    case 'tracker': return trackerPage();
    case 'leaderboard': return leaderboardPage();
    case 'alerts': return alertsPage();
    case 'revenue': return revenuePage();
    case 'custom': return customViewsPage();
    default: return mgrDashboardPage();
  }
}

/* ── DASHBOARD ── */
function mgrDashboardPage() {
  const totalRev = INVOICES.reduce((s,i)=>s+i.total,0);
  const collected = INVOICES.reduce((s,i)=>s+i.paid,0);
  return `
    <div class="section-title"><h2>📊 Manager Dashboard</h2><span class="text-light text-sm">Feb 26, 2026 · Real-time</span></div>
    <div class="tiles">
      <div class="tile tile-green"><div class="tile-label">Today's Revenue</div><div class="tile-value">${fmt$(12450)}</div><div class="tile-sub">↑ 8% vs last Wed</div></div>
      <div class="tile tile-blue"><div class="tile-label">Active Orders</div><div class="tile-value">${ORDERS.filter(o=>o.status!=='Delivered').length}</div><div class="tile-sub">${ORDERS.filter(o=>o.status==='In Transit').length} in transit</div></div>
      <div class="tile tile-purple"><div class="tile-label">Deliveries</div><div class="tile-value">18/24</div><div class="tile-sub">75% complete</div></div>
      <div class="tile tile-yellow"><div class="tile-label">AR Outstanding</div><div class="tile-value">${fmt$(CUSTOMERS.reduce((s,c)=>s+c.balance,0))}</div><div class="tile-sub">${fmt$(collected)} collected MTD</div></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3>🗺️ Route Progress</h3>
        ${ROUTES.map(r=>{
          const pct = r.id===1?75:r.id===2?40:10;
          return `<div class="mb-16">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px">
              <strong>Route ${String.fromCharCode(64+r.id)} — ${r.driver}</strong>
              <span class="text-sm">${pct}%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${pct>60?'var(--green)':pct>30?'var(--yellow)':'var(--blue)'}"></div></div>
            <div class="text-sm text-light mt-4">${r.stops} stops · ${r.truck}</div>
          </div>`;
        }).join('')}
        <button class="btn-outline w-full" onclick="window.ERP.nav('#/manager/tracker')">Open Live Tracker →</button>
      </div>
      <div class="card">
        <h3>⚡ Action Items</h3>
        <div class="warn-box mb-8">🔴 <strong>Credit limit exceeded</strong> — Cambridge Catering placed $3,100 order, $1,100 over limit. <button class="btn-outline btn-sm" onclick="window.ERP.toast('Approved','success')">Approve</button></div>
        <div class="warn-box mb-8">🟡 <strong>Short pick</strong> — ORD-2603 missing 1 case NY Strip Steak. <a style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/warehouse/pick-approval')">Review →</a></div>
        <div class="info-box mb-8">📩 <strong>3 orders</strong> pending route assignment. <a style="color:var(--primary);cursor:pointer" onclick="window.ERP.nav('#/route/unassigned')">Assign →</a></div>
        <div class="success-box">✅ Route A – Kevin completing ahead of schedule. ETA 2:30 PM.</div>
      </div>
    </div>

    <div class="card">
      <h3>🏆 Today's Salesperson Performance</h3>
      <table>
        <thead><tr><th>#</th><th>Salesperson</th><th style="text-align:right">Orders</th><th style="text-align:right">Revenue</th><th style="text-align:right">Avg Order</th><th>Trend</th></tr></thead>
        <tbody>
          <tr><td>1</td><td><strong>Marco Rossi</strong></td><td style="text-align:right">8</td><td style="text-align:right">${fmt$(6850)}</td><td style="text-align:right">${fmt$(856)}</td><td class="text-green">↑ 12%</td></tr>
          <tr><td>2</td><td><strong>Sarah Chen</strong></td><td style="text-align:right">6</td><td style="text-align:right">${fmt$(4200)}</td><td style="text-align:right">${fmt$(700)}</td><td class="text-green">↑ 5%</td></tr>
          <tr><td>3</td><td><strong>Tony Lopez</strong></td><td style="text-align:right">4</td><td style="text-align:right">${fmt$(1400)}</td><td style="text-align:right">${fmt$(350)}</td><td class="text-red">↓ 8%</td></tr>
        </tbody>
      </table>
    </div>`;
}

/* ── LIVE TRACKER ── */
function trackerPage() {
  return `
    <div class="section-title"><h2>🗺️ Live Route Tracker</h2><span class="text-light text-sm">Auto-refreshes every 30s</span></div>
    <div class="grid-2" style="grid-template-columns:1fr 320px">
      <div class="map-placeholder" style="min-height:450px">
        <div style="font-size:48px">🗺️</div>
        <div style="font-weight:700;font-size:18px">Live Map View</div>
        <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px;text-align:left;max-width:300px">
          <div style="display:flex;align-items:center;gap:8px"><span style="width:12px;height:12px;border-radius:50%;background:var(--green);display:inline-block"></span> Route A — Kevin Park (6/8 stops done)</div>
          <div style="display:flex;align-items:center;gap:8px"><span style="width:12px;height:12px;border-radius:50%;background:var(--blue);display:inline-block"></span> Route B — Alex Rivera (3/7 stops done)</div>
          <div style="display:flex;align-items:center;gap:8px"><span style="width:12px;height:12px;border-radius:50%;background:var(--orange);display:inline-block"></span> Route C — Tony Lopez (1/6 stops done)</div>
        </div>
        <div class="text-sm text-light mt-16">Google Maps integration shows real-time GPS positions</div>
      </div>
      <div>
        ${ROUTES.map(r=>{
          const pct = r.id===1?75:r.id===2?43:17;
          const color = r.id===1?'green':r.id===2?'blue':'orange';
          return `<div class="card mb-8">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <h3 style="margin:0">Route ${String.fromCharCode(64+r.id)}</h3>
              <span class="badge badge-${color}">${pct}%</span>
            </div>
            <div class="text-sm">👤 ${r.driver} · 🚛 ${r.truck}</div>
            <div class="progress-bar mt-8"><div class="progress-fill" style="width:${pct}%;background:var(--${color})"></div></div>
            <div class="text-xs text-light mt-4">${Math.round(r.stops*pct/100)}/${r.stops} stops · ETA ${r.id===1?'2:30 PM':r.id===2?'3:45 PM':'5:15 PM'}</div>
            <div style="display:flex;gap:4px;margin-top:8px">
              <button class="btn-outline btn-sm" onclick="window.ERP.toast('Calling ${r.driver}…','')">📞</button>
              <button class="btn-outline btn-sm" onclick="window.ERP.toast('Message sent','success')">💬</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
}

/* ── LEADERBOARD ── */
function leaderboardPage() {
  const reps = [
    { name: 'Marco Rossi', orders: 142, rev: 98500, avg: 693, customers: 28, new: 3, trend: 12 },
    { name: 'Sarah Chen', orders: 128, rev: 87200, avg: 681, customers: 25, new: 2, trend: 8 },
    { name: 'Tony Lopez', orders: 95, rev: 62100, avg: 654, customers: 20, new: 1, trend: -5 },
  ];
  return `
    <div class="section-title"><h2>🏆 Salesperson Leaderboard</h2>
      <div style="margin-left:auto"><select><option>This Month</option><option>This Quarter</option><option>This Year</option></select></div>
    </div>
    <div class="tiles">
      <div class="tile tile-green"><div class="tile-label">Total Revenue</div><div class="tile-value">${fmt$(reps.reduce((s,r)=>s+r.rev,0))}</div></div>
      <div class="tile tile-blue"><div class="tile-label">Total Orders</div><div class="tile-value">${reps.reduce((s,r)=>s+r.orders,0)}</div></div>
      <div class="tile tile-purple"><div class="tile-label">Avg Order</div><div class="tile-value">${fmt$(676)}</div></div>
      <div class="tile tile-yellow"><div class="tile-label">New Customers</div><div class="tile-value">6</div></div>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>#</th><th>Salesperson</th><th style="text-align:right">Orders</th><th style="text-align:right">Revenue</th><th style="text-align:right">Avg Order</th><th style="text-align:right">Active Cust.</th><th style="text-align:right">New Cust.</th><th>Trend</th></tr></thead>
        <tbody>${reps.map((r,i)=>`
          <tr ${i===0?'style="background:rgba(22,163,106,0.05)"':''}>
            <td>${i===0?'🥇':i===1?'🥈':'🥉'}</td>
            <td><strong>${r.name}</strong></td>
            <td style="text-align:right">${r.orders}</td>
            <td style="text-align:right">${fmt$(r.rev)}</td>
            <td style="text-align:right">${fmt$(r.avg)}</td>
            <td style="text-align:right">${r.customers}</td>
            <td style="text-align:right">${r.new}</td>
            <td class="${r.trend>0?'text-green':'text-red'}">${r.trend>0?'↑':'↓'} ${Math.abs(r.trend)}%</td>
          </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

/* ── ALERTS ── */
function alertsPage() {
  const alerts = [
    { time: '2:15 PM', level: 'red', title: 'Credit Limit Exceeded', msg: 'Cambridge Catering — $1,100 over limit on ORD-2605', actions: ['Approve','Hold'] },
    { time: '1:55 PM', level: 'orange', title: 'Short Pick', msg: 'ORD-2603 missing 1 case NY Strip Steak. Warehouse awaiting approval.', actions: ['Review'] },
    { time: '1:30 PM', level: 'yellow', title: 'Delivery Delay', msg: 'Route C running 25 min behind schedule.', actions: ['Message Driver'] },
    { time: '12:45 PM', level: 'blue', title: 'Large Order', msg: 'Ocean Prime placed $4,200 order — 2× their average.', actions: ['Review'] },
    { time: '11:30 AM', level: 'green', title: 'Route A Ahead', msg: 'Kevin Park completing Route A 30 min ahead of schedule.', actions: [] },
    { time: '10:00 AM', level: 'yellow', title: 'Overdue Invoice', msg: 'Green Leaf Cafe — INV-4380 is 12 days past due ($1,850).', actions: ['Send Reminder'] },
  ];
  return `
    <div class="section-title"><h2>🔔 Alerts & Notifications</h2>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-outline btn-sm">Mark All Read</button>
        <button class="btn-outline btn-sm">⚙️ Settings</button>
      </div>
    </div>
    ${alerts.map(a=>`
      <div class="card mb-8 card-border-${a.level==='red'?'danger':a.level==='orange'?'warn':a.level==='green'?'success':'info'}" style="display:flex;gap:16px;align-items:flex-start">
        <div style="font-size:20px">${a.level==='red'?'🔴':a.level==='orange'?'🟠':a.level==='yellow'?'🟡':a.level==='blue'?'🔵':'🟢'}</div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${a.title}</strong><span class="text-xs text-light">${a.time}</span>
          </div>
          <div class="text-sm mt-4">${a.msg}</div>
        </div>
        ${a.actions.length?`<div style="display:flex;gap:4px">${a.actions.map(act=>`<button class="btn-outline btn-sm" onclick="window.ERP.toast('${act}…','success')">${act}</button>`).join('')}</div>`:''}
      </div>`).join('')}`;
}

/* ── REVENUE ── */
function revenuePage() {
  const months = ['Sep','Oct','Nov','Dec','Jan','Feb'];
  const vals = [85200,92100,98500,105800,112400,94300];
  const max = Math.max(...vals);
  return `
    <div class="section-title"><h2>📈 Revenue Overview</h2>
      <div style="margin-left:auto"><select><option>Last 6 Months</option><option>This Year</option><option>Custom</option></select></div>
    </div>
    <div class="tiles">
      <div class="tile tile-green"><div class="tile-label">MTD Revenue</div><div class="tile-value">${fmt$(94300)}</div><div class="tile-sub">Feb 1-26</div></div>
      <div class="tile tile-blue"><div class="tile-label">YTD Revenue</div><div class="tile-value">${fmt$(206700)}</div></div>
      <div class="tile tile-purple"><div class="tile-label">Avg Monthly</div><div class="tile-value">${fmt$(98050)}</div></div>
      <div class="tile tile-yellow"><div class="tile-label">Growth</div><div class="tile-value">+11%</div><div class="tile-sub">vs same period last year</div></div>
    </div>
    <div class="card">
      <h3>Monthly Revenue</h3>
      <div style="display:flex;align-items:flex-end;gap:12px;height:200px;padding:16px 0">
        ${months.map((m,i)=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <span class="text-xs bold">${fmt$(vals[i]/1000)}K</span>
          <div style="width:100%;background:var(--primary);border-radius:4px 4px 0 0;height:${(vals[i]/max)*160}px;opacity:${i===months.length-1?1:0.7}"></div>
          <span class="text-xs text-light">${m}</span>
        </div>`).join('')}
      </div>
    </div>
    <div class="grid-2">
      <div class="card">
        <h3>Revenue by Category</h3>
        <table><tbody>
          <tr><td>🥩 Meat & Poultry</td><td style="text-align:right;font-weight:700">${fmt$(28400)}</td><td style="text-align:right">30%</td></tr>
          <tr><td>🧀 Dairy</td><td style="text-align:right;font-weight:700">${fmt$(18900)}</td><td style="text-align:right">20%</td></tr>
          <tr><td>🥬 Produce</td><td style="text-align:right;font-weight:700">${fmt$(16100)}</td><td style="text-align:right">17%</td></tr>
          <tr><td>🐟 Seafood</td><td style="text-align:right;font-weight:700">${fmt$(12500)}</td><td style="text-align:right">13%</td></tr>
          <tr><td>🍞 Bakery + Other</td><td style="text-align:right;font-weight:700">${fmt$(18400)}</td><td style="text-align:right">20%</td></tr>
        </tbody></table>
      </div>
      <div class="card">
        <h3>Top Customers (MTD)</h3>
        <table><tbody>
          ${CUSTOMERS.sort((a,b)=>parseFloat(b.avgOrder.replace(/[$,]/g,''))-parseFloat(a.avgOrder.replace(/[$,]/g,''))).slice(0,5).map((c,i)=>`
            <tr><td>${i+1}. <strong>${c.name}</strong></td><td style="text-align:right">${c.avgOrder} avg</td></tr>`).join('')}
        </tbody></table>
      </div>
    </div>`;
}

/* ── CUSTOM VIEWS ── */
function customViewsPage() {
  const views = [
    { name: 'Daily Operations', desc: 'Route progress + orders + warehouse queue', icon: '📋', widgets: 4 },
    { name: 'Financial Overview', desc: 'Revenue, AR aging, payments received', icon: '💰', widgets: 5 },
    { name: 'Sales Performance', desc: 'Leaderboard, customer activity, targets', icon: '🏆', widgets: 3 },
    { name: 'Warehouse Ops', desc: 'Pick queue, efficiency, short picks', icon: '🏭', widgets: 3 },
  ];
  return `
    <div class="section-title"><h2>🎯 Custom Dashboard Views</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP.toast('New view builder…','')">+ Create View</button>
    </div>
    <div class="info-box mb-16">Create and save custom dashboard views. Drag & drop widgets to build your ideal overview. Views are per-user and can be shared with the team.</div>
    <div class="grid-2">${views.map(v=>`
      <div class="card" style="cursor:pointer" onclick="window.ERP.toast('Loading ${v.name} view…','')">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <span style="font-size:28px">${v.icon}</span>
          <div><h3 style="margin:0">${v.name}</h3><p class="text-sm text-light" style="margin:0">${v.desc}</p></div>
        </div>
        <div class="text-xs text-light">${v.widgets} widgets · Last used today</div>
      </div>`).join('')}
    </div>
    <div class="card">
      <h3>Available Widgets</h3>
      <div class="grid-3">
        ${['📊 KPI Tiles','📈 Revenue Chart','🗺️ Live Map','📋 Order Queue','🏆 Leaderboard','⏰ Aging Summary','🚛 Route Progress','📦 Pick Queue','🔔 Alert Feed'].map(w=>`
          <div style="padding:12px;border:1px dashed var(--border);border-radius:8px;text-align:center;cursor:grab">${w}</div>`).join('')}
      </div>
    </div>`;
}
