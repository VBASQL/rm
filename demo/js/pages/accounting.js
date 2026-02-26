// ===== Accounting Screens =====
import { CUSTOMERS, INVOICES, PAYMENTS, JOURNAL_ENTRIES, fmt$, customerName } from '../data.js';

export function accountingNav() {
  return [
    { section: 'Accounting', icon: '📊', label: 'Dashboard', page: 'main', default: true },
    { section: 'Accounting', icon: '📄', label: 'Invoices', page: 'invoices', badge: '3', badgeColor: 'orange' },
    { section: 'Accounting', icon: '💳', label: 'Payments', page: 'payments' },
    { section: 'Accounting', icon: '👥', label: 'Customers', page: 'customers' },
    { section: 'Accounting', icon: '📑', label: 'Statements', page: 'statements' },
    { section: 'Ledger', icon: '📒', label: 'Journal Entries', page: 'ledger' },
    { section: 'Ledger', icon: '📋', label: 'Chart of Accounts', page: 'coa' },
    { section: 'Tools', icon: '🤖', label: 'AI Invoice Review', page: 'ai-review' },
    { section: 'Tools', icon: '🔔', label: 'Notifications', page: 'notifications' },
    { section: 'Tools', icon: '📈', label: 'Reports', page: 'reports' },
  ];
}

export function renderAccounting(page) {
  switch(page) {
    case 'invoices': return invoicesPage();
    case 'invoice-detail': return invoiceDetailPage();
    case 'payments': return paymentsPage();
    case 'customers': return acctCustomersPage();
    case 'customer-account': return customerAccountPage();
    case 'statements': return statementsPage();
    case 'ledger': return ledgerPage();
    case 'coa': return coaPage();
    case 'ai-review': return aiReviewPage();
    case 'notifications': return notificationsPage();
    case 'reports': return acctReportsPage();
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
      ${inv.status!=='Paid'?`<button class="btn-primary btn-sm" onclick="window.ERP.nav('#/accounting/payments')">💳 Record Payment</button>`:''}
    </div></div>

    <div class="grid-2 mb-16" style="grid-template-columns:1fr 300px">
      <div class="invoice-preview">
        <div class="inv-header">
          <div><h2>📦 WholesaleERP</h2><div class="text-sm text-light">123 Distribution Way<br>Boston, MA 02101</div></div>
          <div style="text-align:right"><div style="font-size:20px;font-weight:700">INVOICE</div><div class="text-sm">${inv.id}</div><div class="text-sm">Date: ${inv.date}</div><div class="text-sm">Due: ${inv.due}</div></div>
        </div>
        <div class="mb-16"><strong>Bill To:</strong><br>${c.name}<br>${c.loc}<br>${c.contact} · ${c.phone}</div>
        <table>
          <thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
          <tbody>
            <tr><td>Whole Milk 4/1 GAL</td><td style="text-align:center">4</td><td style="text-align:right">$4.29</td><td style="text-align:right">$17.16</td></tr>
            <tr><td>Tomatoes Vine-Ripe 25 LB</td><td style="text-align:center">2</td><td style="text-align:right">$28.75</td><td style="text-align:right">$57.50</td></tr>
            <tr><td>Chicken Breast 40 LB</td><td style="text-align:center">1</td><td style="text-align:right">$89.50</td><td style="text-align:right">$89.50</td></tr>
          </tbody>
        </table>
        <div class="inv-total">
          <div>Subtotal: ${fmt$(inv.total * 0.9375)}</div>
          <div>Tax (6.25%): ${fmt$(inv.total * 0.0625)}</div>
          <div style="font-size:18px;font-weight:700;margin-top:8px">Total: ${fmt$(inv.total)}</div>
          ${inv.paid>0?`<div class="text-green">Paid: ${fmt$(inv.paid)}</div>`:''}
          ${inv.total-inv.paid>0?`<div class="text-red bold">Balance Due: ${fmt$(inv.total-inv.paid)}</div>`:''}
        </div>
      </div>
      <div>
        <div class="card">
          <h3>Status</h3>
          <div class="mb-8">${invBadge(inv.status)}</div>
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
  return `
    <div class="section-title"><h2>💳 Payment Processing</h2></div>
    <div class="grid-2">
      <div class="card">
        <h3>Record Payment</h3>
        <div class="form-group"><label>Customer</label><select>${CUSTOMERS.map(c=>`<option>${c.name}</option>`).join('')}</select></div>
        <div class="form-group"><label>Invoice</label><select><option>INV-4401 — $2,845.00</option><option>INV-4390 — $1,250.00 (Overdue)</option><option>INV-4385 — $2,400.00 remaining</option></select></div>
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
  const c = CUSTOMERS.find(c=>c.id===parseInt(params.get('id'))) || CUSTOMERS[6]; // Cambridge Catering
  const invs = INVOICES.filter(i=>i.customer===c.id);
  const pmts = PAYMENTS.filter(p=>p.customer===c.id);
  return `
    <div style="margin-bottom:16px"><a style="color:var(--primary);cursor:pointer;font-size:13px" onclick="window.ERP.nav('#/accounting/customers')">← Back to Customers</a></div>
    <div class="section-title"><h2>${c.name} — Account</h2></div>
    <div class="tiles">
      <div class="tile tile-blue"><div class="tile-label">Balance</div><div class="tile-value">${fmt$(c.balance)}</div></div>
      <div class="tile tile-green"><div class="tile-label">Credit Limit</div><div class="tile-value">${fmt$(c.creditLimit)}</div></div>
      <div class="tile tile-${c.balance/c.creditLimit>0.8?'red':'yellow'}"><div class="tile-label">Available</div><div class="tile-value">${fmt$(c.creditLimit-c.balance)}</div></div>
      <div class="tile"><div class="tile-label">Terms</div><div class="tile-value">${c.terms}</div></div>
    </div>
    <div class="grid-2">
      <div class="card"><h3>Invoices</h3>
        <table><thead><tr><th>Invoice</th><th>Date</th><th>Status</th><th style="text-align:right">Balance</th></tr></thead>
        <tbody>${invs.length?invs.map(i=>`<tr><td><strong style="cursor:pointer;color:var(--primary)" onclick="window.ERP.nav('#/accounting/invoice-detail?id=${i.id}')">${i.id}</strong></td><td>${i.date}</td><td>${invBadge(i.status)}</td><td style="text-align:right">${fmt$(i.total-i.paid)}</td></tr>`).join(''):'<tr><td colspan="4" class="text-center text-light">No invoices</td></tr>'}</tbody></table>
      </div>
      <div class="card"><h3>Payments</h3>
        <table><thead><tr><th>Payment</th><th>Date</th><th>Method</th><th style="text-align:right">Amount</th></tr></thead>
        <tbody>${pmts.length?pmts.map(p=>`<tr><td>${p.id}</td><td>${p.date}</td><td>${p.method}</td><td style="text-align:right">${fmt$(p.amount)}</td></tr>`).join(''):'<tr><td colspan="4" class="text-center text-light">No payments</td></tr>'}</tbody></table>
      </div>
    </div>`;
}

/* ── STATEMENTS ── */
function statementsPage() {
  return `
    <div class="section-title"><h2>📑 Statements</h2></div>
    <div class="grid-2">
      <div class="card">
        <h3>Statement Settings</h3>
        <div class="form-row">
          <div class="form-group"><label>Period</label><select><option>February 2026</option><option>January 2026</option></select></div>
          <div class="form-group"><label>Include</label><select><option>All Customers with Balance</option><option>Overdue Only</option><option>Specific Customer</option></select></div>
        </div>
        <div class="form-group"><label>Delivery Method</label>
          <div style="display:flex;gap:8px">
            <label style="display:flex;align-items:center;gap:4px;text-transform:none;letter-spacing:0"><input type="checkbox" checked> Email</label>
            <label style="display:flex;align-items:center;gap:4px;text-transform:none;letter-spacing:0"><input type="checkbox"> Print</label>
            <label style="display:flex;align-items:center;gap:4px;text-transform:none;letter-spacing:0"><input type="checkbox"> Portal</label>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn-primary" onclick="window.ERP.toast('Generating 6 statements…','success')">📩 Generate & Send</button>
          <button class="btn-outline">Preview</button>
        </div>
        <div class="info-box mt-16">📅 <strong>Auto-Schedule:</strong> Statements go out on 1st & 15th of each month.</div>
      </div>
      <div class="card">
        <h3>Statement Preview</h3>
        <div class="invoice-preview" style="font-size:11px;padding:20px">
          <div class="inv-header" style="padding-bottom:8px;margin-bottom:12px">
            <div><strong>📦 WholesaleERP</strong><br><span style="font-size:10px">Statement as of Feb 26, 2026</span></div>
            <div style="text-align:right"><strong>Cambridge Catering Co</strong><br><span style="font-size:10px">890 Mass Ave, Cambridge</span></div>
          </div>
          <table style="font-size:10px">
            <thead><tr><th>Date</th><th>Description</th><th style="text-align:right">Charges</th><th style="text-align:right">Payments</th><th style="text-align:right">Balance</th></tr></thead>
            <tbody>
              <tr><td>02/01</td><td>INV-4385</td><td style="text-align:right">$3,400</td><td></td><td style="text-align:right">$3,400</td></tr>
              <tr><td>02/15</td><td>PMT-8802</td><td></td><td style="text-align:right">$1,000</td><td style="text-align:right">$2,400</td></tr>
              <tr><td>02/26</td><td>INV-4405</td><td style="text-align:right">$3,100</td><td></td><td style="text-align:right">$5,500</td></tr>
            </tbody>
          </table>
          <div style="text-align:right;margin-top:8px;border-top:2px solid black;padding-top:4px"><strong>Balance Due: $5,500.00</strong></div>
          <div style="margin-top:8px;display:flex;justify-content:space-between;font-size:9px">
            <span>Current: $3,100</span><span>31-60: $2,400</span><span>61-90: $0</span><span>90+: $0</span>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>Recent Statement Runs</h3>
      <table><thead><tr><th>Date</th><th>Period</th><th>Customers</th><th>Method</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>2026-02-15</td><td>Feb 1-15</td><td>8</td><td>Email</td><td><span class="badge badge-green">Sent</span></td></tr>
        <tr><td>2026-02-01</td><td>January 2026</td><td>10</td><td>Email + Print</td><td><span class="badge badge-green">Sent</span></td></tr>
      </tbody></table>
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
