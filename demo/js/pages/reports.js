// ===== Reports Screens =====
import { fmt$ } from '../data.js';

let reportStep = 1;

export function reportsNav() {
  return [
    { section: 'Reports', icon: '🔨', label: 'Report Builder', page: 'main', default: true },
    { section: 'Reports', icon: '📚', label: 'Standard Library', page: 'library' },
    { section: 'Reports', icon: '💾', label: 'Saved Reports', page: 'saved' },
    { section: 'Reports', icon: '📤', label: 'Scheduled', page: 'scheduled' },
    { section: 'Reports', icon: '🤖', label: 'AI Query', page: 'ai-query' },
  ];
}

export function renderReports(page) {
  switch(page) {
    case 'library': return libraryPage();
    case 'saved': return savedPage();
    case 'scheduled': return scheduledPage();
    case 'ai-query': return aiQueryPage();
    default: return builderPage();
  }
}

/* ── REPORT BUILDER ── */
function builderPage() {
  window.ERP._setReportStep = function(s){ reportStep = s; window.ERP.nav('#/reports/main'); };
  return `
    <div class="section-title"><h2>🔨 Report Builder</h2></div>
    <div class="steps mb-16">
      <div class="step ${reportStep>=1?'active':''}"><span class="step-num">1</span> Select Type</div>
      <div class="step ${reportStep>=2?'active':''}"><span class="step-num">2</span> Configure</div>
      <div class="step ${reportStep>=3?'active':''}"><span class="step-num">3</span> Generate</div>
    </div>
    ${reportStep===1?builderStep1():reportStep===2?builderStep2():builderStep3()}`;
}

function builderStep1() {
  const types = [
    { icon: '📊', name: 'Sales Report', desc: 'Revenue, orders, and customer analysis by period' },
    { icon: '💰', name: 'AR Aging', desc: 'Accounts receivable aging by customer and bucket' },
    { icon: '📦', name: 'Inventory', desc: 'Stock levels, movement, and valuation' },
    { icon: '🚛', name: 'Delivery', desc: 'Route efficiency, on-time rates, driver performance' },
    { icon: '👥', name: 'Customer', desc: 'Customer activity, ordering patterns, profitability' },
    { icon: '📋', name: 'Warehouse', desc: 'Pick accuracy, throughput, short pick analysis' },
    { icon: '💳', name: 'Payments', desc: 'Collections, payment methods, outstanding balances' },
    { icon: '📒', name: 'Financial', desc: 'P&L, trial balance, journal entries' },
  ];
  return `
    <div class="grid-2">${types.map(t=>`
      <div class="card" style="cursor:pointer" onclick="window.ERP._setReportStep(2)">
        <div style="display:flex;gap:12px;align-items:center">
          <span style="font-size:32px">${t.icon}</span>
          <div><h3 style="margin:0">${t.name}</h3><p class="text-sm text-light" style="margin:0">${t.desc}</p></div>
        </div>
      </div>`).join('')}
    </div>`;
}

function builderStep2() {
  return `
    <div class="card">
      <h3>📊 Sales Report — Configuration</h3>
      <div class="grid-2">
        <div>
          <div class="form-group"><label>Date Range</label>
            <div class="form-row"><input type="date" value="2026-02-01"><input type="date" value="2026-02-26"></div>
          </div>
          <div class="form-group"><label>Group By</label>
            <select><option>Customer</option><option>Salesperson</option><option>Category</option><option>Day</option><option>Week</option></select>
          </div>
          <div class="form-group"><label>Filter by Salesperson</label>
            <select><option>All</option><option>Marco Rossi</option><option>Sarah Chen</option><option>Tony Lopez</option></select>
          </div>
        </div>
        <div>
          <div class="form-group"><label>Columns to Include</label>
            <div style="display:flex;flex-direction:column;gap:4px">
              ${['Order Count','Revenue','Average Order','New Customers','Returns','Net Revenue','Growth %'].map(c=>
                `<label style="display:flex;align-items:center;gap:6px;text-transform:none;letter-spacing:0;font-size:13px"><input type="checkbox" ${c!=='Returns'?'checked':''}> ${c}</label>`
              ).join('')}
            </div>
          </div>
          <div class="form-group"><label>Format</label>
            <select><option>Table</option><option>Table + Chart</option><option>Summary Only</option></select>
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn-outline" onclick="window.ERP._setReportStep(1)">← Back</button>
        <button class="btn-primary" onclick="window.ERP._setReportStep(3)">Generate Report →</button>
      </div>
    </div>`;
}

function builderStep3() {
  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0">📊 Sales Report — Feb 1–26, 2026</h3>
        <div style="display:flex;gap:8px">
          <button class="btn-outline btn-sm">📄 PDF</button>
          <button class="btn-outline btn-sm">📊 Excel</button>
          <button class="btn-outline btn-sm">📧 Email</button>
          <button class="btn-outline btn-sm" onclick="window.ERP.toast('Saved to My Reports','success')">💾 Save</button>
          <button class="btn-outline btn-sm" onclick="window.ERP.nav('#/reports/scheduled')">⏰ Schedule</button>
        </div>
      </div>
      <div class="tiles mb-16">
        <div class="tile tile-green"><div class="tile-label">Total Revenue</div><div class="tile-value">${fmt$(94300)}</div></div>
        <div class="tile tile-blue"><div class="tile-label">Total Orders</div><div class="tile-value">365</div></div>
        <div class="tile tile-purple"><div class="tile-label">Avg Order</div><div class="tile-value">${fmt$(258)}</div></div>
        <div class="tile tile-yellow"><div class="tile-label">Growth</div><div class="tile-value">+8%</div></div>
      </div>
      <table>
        <thead><tr><th>Customer</th><th style="text-align:right">Orders</th><th style="text-align:right">Revenue</th><th style="text-align:right">Avg Order</th><th style="text-align:right">Growth</th></tr></thead>
        <tbody>
          <tr><td><strong>Bella Cucina</strong></td><td style="text-align:right">42</td><td style="text-align:right">${fmt$(18500)}</td><td style="text-align:right">${fmt$(440)}</td><td style="text-align:right" class="text-green">+15%</td></tr>
          <tr><td><strong>Ocean Prime</strong></td><td style="text-align:right">28</td><td style="text-align:right">${fmt$(14800)}</td><td style="text-align:right">${fmt$(529)}</td><td style="text-align:right" class="text-green">+22%</td></tr>
          <tr><td><strong>Harbor Grill</strong></td><td style="text-align:right">35</td><td style="text-align:right">${fmt$(12400)}</td><td style="text-align:right">${fmt$(354)}</td><td style="text-align:right" class="text-green">+5%</td></tr>
          <tr><td><strong>Cambridge Catering</strong></td><td style="text-align:right">52</td><td style="text-align:right">${fmt$(11200)}</td><td style="text-align:right">${fmt$(215)}</td><td style="text-align:right" class="text-red">-3%</td></tr>
          <tr><td><strong>Tony's Pizza</strong></td><td style="text-align:right">38</td><td style="text-align:right">${fmt$(9800)}</td><td style="text-align:right">${fmt$(258)}</td><td style="text-align:right" class="text-green">+8%</td></tr>
        </tbody>
        <tfoot><tr><th>TOTAL</th><th style="text-align:right">365</th><th style="text-align:right">${fmt$(94300)}</th><th style="text-align:right">${fmt$(258)}</th><th style="text-align:right" class="text-green">+8%</th></tr></tfoot>
      </table>
    </div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn-outline" onclick="window.ERP._setReportStep(2)">← Modify</button>
      <button class="btn-outline" onclick="window.ERP._setReportStep(1)">New Report</button>
    </div>`;
}

/* ── STANDARD LIBRARY ── */
function libraryPage() {
  const reports = [
    { cat: 'Sales', items: ['Daily Sales Summary','Weekly Revenue','Monthly Customer Report','Sales by Category','Salesperson Performance'] },
    { cat: 'Finance', items: ['AR Aging Report','Payment Collections','Invoice Register','Trial Balance','P&L Statement'] },
    { cat: 'Operations', items: ['Route Efficiency','Delivery Performance','Pick Accuracy','Warehouse Throughput','Short Pick Analysis'] },
    { cat: 'Inventory', items: ['Stock Levels','Inventory Valuation','Low Stock Alert','Product Movement','Category Analysis'] },
  ];
  return `
    <div class="section-title"><h2>📚 Standard Report Library</h2></div>
    ${reports.map(r=>`
      <div class="card mb-8">
        <h3>${r.cat} Reports</h3>
        <div class="grid-3">${r.items.map(i=>`
          <div style="padding:12px;border:1px solid var(--border);border-radius:8px;cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="window.ERP._setReportStep=function(s){};window.ERP.nav('#/reports/main')">
            <span class="text-sm">${i}</span>
            <span style="color:var(--primary);font-size:12px">Run →</span>
          </div>`).join('')}
        </div>
      </div>`).join('')}`;
}

/* ── SAVED REPORTS ── */
function savedPage() {
  const saved = [
    { name: 'Weekly Sales Summary', type: 'Sales', created: 'Feb 20', lastRun: 'Feb 26', by: 'Sarah Chen' },
    { name: 'AR Aging — Month End', type: 'Finance', created: 'Jan 31', lastRun: 'Feb 26', by: 'Sarah Chen' },
    { name: 'Route Efficiency Feb', type: 'Operations', created: 'Feb 1', lastRun: 'Feb 25', by: 'Linda Wu' },
    { name: 'Cambridge Catering History', type: 'Customer', created: 'Feb 15', lastRun: 'Feb 26', by: 'Marco Rossi' },
  ];
  return `
    <div class="section-title"><h2>💾 Saved Reports</h2></div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Report Name</th><th>Type</th><th>Created</th><th>Last Run</th><th>Created By</th><th></th></tr></thead>
        <tbody>${saved.map(s=>`<tr>
          <td><strong>${s.name}</strong></td>
          <td><span class="badge badge-blue">${s.type}</span></td>
          <td>${s.created}</td><td>${s.lastRun}</td><td>${s.by}</td>
          <td style="display:flex;gap:4px">
            <button class="btn-primary btn-sm" onclick="window.ERP.toast('Running report…','')">▶ Run</button>
            <button class="btn-outline btn-sm">Edit</button>
            <button class="btn-outline btn-sm">🗑</button>
          </td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

/* ── SCHEDULED EXPORTS ── */
function scheduledPage() {
  const sched = [
    { name: 'Daily Sales Summary', freq: 'Daily 6:00 AM', format: 'PDF + Email', to: 'manager@demo.com', status: 'Active' },
    { name: 'Weekly AR Aging', freq: 'Monday 8:00 AM', format: 'Excel + Email', to: 'accounting@demo.com', status: 'Active' },
    { name: 'Monthly P&L', freq: '1st of month', format: 'PDF', to: 'owner@demo.com', status: 'Active' },
    { name: 'Route Efficiency', freq: 'Friday 5:00 PM', format: 'Excel', to: 'operations@demo.com', status: 'Paused' },
  ];
  return `
    <div class="section-title"><h2>📤 Scheduled Exports</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP.toast('Schedule a report…','')">+ New Schedule</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Report</th><th>Frequency</th><th>Format</th><th>Recipients</th><th>Status</th><th></th></tr></thead>
        <tbody>${sched.map(s=>`<tr>
          <td><strong>${s.name}</strong></td><td>${s.freq}</td><td>${s.format}</td><td class="text-sm">${s.to}</td>
          <td><span class="badge badge-${s.status==='Active'?'green':'yellow'}">${s.status}</span></td>
          <td><button class="btn-outline btn-sm">Edit</button></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

/* ── AI QUERY ── */
function aiQueryPage() {
  return `
    <div class="section-title"><h2>🤖 AI Report Query</h2></div>
    <div class="card">
      <div class="info-box mb-16">Ask questions in plain English. The AI will generate the appropriate report or data view.</div>
      <div class="form-group">
        <label>Ask a question about your data</label>
        <div style="display:flex;gap:8px">
          <input style="flex:1" placeholder="e.g., Show me top 5 customers by revenue this month…" id="ai-query-input">
          <button class="btn-primary" onclick="document.getElementById('ai-result').style.display='block';window.ERP.toast('Generating…','success')">🤖 Ask</button>
        </div>
      </div>
      <div class="text-sm text-light mb-16">
        <strong>Try:</strong>
        <span style="cursor:pointer;color:var(--primary);margin:0 8px" onclick="document.getElementById('ai-query-input').value=this.textContent">"Which customers are overdue?"</span>
        <span style="cursor:pointer;color:var(--primary);margin:0 8px" onclick="document.getElementById('ai-query-input').value=this.textContent">"Compare this month vs last month revenue"</span>
        <span style="cursor:pointer;color:var(--primary);margin:0 8px" onclick="document.getElementById('ai-query-input').value=this.textContent">"Top selling products this week"</span>
      </div>
    </div>
    <div class="card" id="ai-result" style="display:none">
      <h3>🤖 Results: Top 5 Customers by Revenue (Feb 2026)</h3>
      <table>
        <thead><tr><th>#</th><th>Customer</th><th style="text-align:right">Revenue</th><th style="text-align:right">Orders</th></tr></thead>
        <tbody>
          <tr><td>1</td><td><strong>Bella Cucina</strong></td><td style="text-align:right">${fmt$(18500)}</td><td style="text-align:right">42</td></tr>
          <tr><td>2</td><td><strong>Ocean Prime</strong></td><td style="text-align:right">${fmt$(14800)}</td><td style="text-align:right">28</td></tr>
          <tr><td>3</td><td><strong>Harbor Grill</strong></td><td style="text-align:right">${fmt$(12400)}</td><td style="text-align:right">35</td></tr>
          <tr><td>4</td><td><strong>Cambridge Catering</strong></td><td style="text-align:right">${fmt$(11200)}</td><td style="text-align:right">52</td></tr>
          <tr><td>5</td><td><strong>Tony's Pizza</strong></td><td style="text-align:right">${fmt$(9800)}</td><td style="text-align:right">38</td></tr>
        </tbody>
      </table>
      <div class="text-sm text-light mt-8">Generated from 365 orders across 10 customers. <a style="color:var(--primary);cursor:pointer">Export to Excel</a></div>
    </div>`;
}
