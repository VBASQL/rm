// ===== Driver Screens =====
import { CUSTOMERS, ORDERS, fmt$, customerName } from '../data.js';

export function driverNav() {
  return [
    { section: 'Route', icon: '🗺', label: 'My Route', page: 'main', default: true },
    { section: 'Route', icon: '📍', label: 'Current Stop', page: 'stop' },
    { section: 'Route', icon: '✅', label: 'Delivery Confirm', page: 'confirm' },
    { section: 'Route', icon: '📊', label: 'End of Route', page: 'summary' },
  ];
}

export function renderDriver(page) {
  switch (page) {
    case 'stop': return stopDetailPage();
    case 'confirm': return deliveryConfirmPage();
    case 'reject': return rejectPage();
    case 'summary': return endOfRoutePage();
    default: return myRoutePage();
  }
}

/* ── MY ROUTE ── */
function myRoutePage() {
  const stops = [
    { n: 1, name: 'Bella Cucina Restaurant', addr: '245 Hanover St', time: '7:15 AM', status: 'done', items: 12, total: 2845 },
    { n: 2, name: 'Harbor Grill', addr: '98 Seaport Blvd', time: '7:45 AM', status: 'done', items: 8, total: 1540 },
    { n: 3, name: 'Ocean Prime Seafood', addr: '321 Atlantic Ave', time: '8:30 AM', status: 'current', items: 18, total: 4200 },
    { n: 4, name: "Tony's Pizza — Downtown", addr: '44 Summer St', time: '9:15 AM', status: 'pending', items: 5, total: 650 },
    { n: 5, name: "Tony's Pizza — HQ", addr: '100 Federal St', time: '9:45 AM', status: 'pending', items: 14, total: 1850 },
    { n: 6, name: 'Waterfront Hotel', addr: '1 Harbor Way', time: '10:15 AM', status: 'pending', items: 24, total: 5800 },
  ];
  const doneCt = stops.filter(s => s.status === 'done').length;
  const pct = Math.round((doneCt / stops.length) * 100);

  return `
    <div class="mobile-frames-row">
      <!-- FRAME 1: Route List -->
      <div class="mobile-frame">
        <div class="mobile-header"><span>←</span><h2>My Route — A-1</h2><span>⋯</span></div>
        <div class="mobile-content">
          <div class="flex-between mb-8"><span class="text-sm bold">Today · ${stops.length} stops</span><span class="badge badge-blue">${pct}%</span></div>
          <div class="progress mb-16"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="flex-between text-xs text-light mb-16">
            <span>🚛 TRK-01 Refrigerated 26ft</span><span>ETA: 10:45 AM</span>
          </div>
          ${stops.map(s => `<div class="stop-item stop-${s.status}" style="cursor:pointer" onclick="window.ERP.nav('#/driver/stop')">
            <div class="flex-between">
              <div>
                <strong>${s.n}. ${s.name}</strong>
                <div class="text-xs text-light">${s.addr}</div>
              </div>
              <div style="text-align:right">
                <div class="text-xs">${s.time}</div>
                <div class="text-xs text-light">${s.items} items · ${fmt$(s.total)}</div>
              </div>
            </div>
          </div>`).join('')}
        </div>
        <div class="mobile-tab-bar">
          <div class="mobile-tab active"><span class="mt-icon">🗺</span>Route</div>
          <div class="mobile-tab" onclick="window.ERP.nav('#/driver/stop')"><span class="mt-icon">📍</span>Stop</div>
          <div class="mobile-tab" onclick="window.ERP.nav('#/driver/summary')"><span class="mt-icon">📊</span>Summary</div>
        </div>
      </div>

      <!-- FRAME 2: Stop Detail -->
      <div class="mobile-frame">
        <div class="mobile-header"><span onclick="window.ERP.nav('#/driver/main')" style="cursor:pointer">←</span><h2>Stop 3 of 6</h2><span>⋯</span></div>
        <div class="mobile-content">
          <div class="card mb-8">
            <strong>Ocean Prime Seafood</strong>
            <div class="text-sm text-light">321 Atlantic Ave, Boston</div>
            <div class="text-sm mt-8">📞 David Park · (617) 555-0456</div>
            <div style="display:flex;gap:8px;margin-top:12px">
              <button class="btn-primary btn-sm" style="flex:1" onclick="window.ERP.toast('Opening navigation…')">🗺 Navigate</button>
              <button class="btn-outline btn-sm" style="flex:1" onclick="window.ERP.toast('Calling…')">📞 Call</button>
            </div>
          </div>
          <div class="card mb-8">
            <div class="flex-between mb-8"><strong>Order ORD-2603</strong><span class="badge badge-purple">18 items</span></div>
            <div style="max-height:180px;overflow-y:auto">
              <table style="font-size:12px"><tbody>
                <tr><td>Whole Milk 4/1 GAL</td><td style="text-align:right">×4</td></tr>
                <tr><td>Romaine Hearts 24 CT</td><td style="text-align:right">×3</td></tr>
                <tr><td>NY Strip Steak 20 LB</td><td style="text-align:right">×2</td></tr>
                <tr><td>Atlantic Salmon 10 LB</td><td style="text-align:right">×3</td></tr>
                <tr><td>Jumbo Shrimp 5 LB</td><td style="text-align:right">×4</td></tr>
                <tr><td>Heavy Cream 12/1 QT</td><td style="text-align:right">×2</td></tr>
              </tbody></table>
            </div>
            <div class="flex-between mt-8" style="border-top:1px solid var(--border);padding-top:8px">
              <strong>Total</strong><strong>${fmt$(4200)}</strong>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn-primary w-full" onclick="window.ERP.nav('#/driver/confirm')">✅ Deliver</button>
            <button class="btn-outline" onclick="window.ERP.toast('Editing order…','')">✏️ Edit</button>
            <button class="btn-outline" style="color:var(--red);border-color:var(--red)" onclick="window.ERP.nav('#/driver/reject')">✗</button>
          </div>
          <button class="btn-outline w-full mt-8" onclick="window.ERP.toast('Invoice printed','success')">🖨 Print Invoice</button>
        </div>
      </div>

      <!-- FRAME 3: Action Frame -->
      <div class="mobile-frame">
        <div class="mobile-header green"><span onclick="window.ERP.nav('#/driver/stop')" style="cursor:pointer">←</span><h2>Delivery Confirmation</h2><span></span></div>
        <div class="mobile-content" style="padding:14px">

          <div class="success-box" style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <span style="font-size:20px">📄</span>
            <div>
              <div class="bold" style="font-size:13px">✓ Invoice INV-2603 generated</div>
              <div class="text-xs text-light">Posted to system · ${fmt$(4200)} · 18 items</div>
            </div>
          </div>

          <div class="form-group"><label>Items Verified</label>
            <div class="success-box">All 18 items confirmed as delivered ✓</div>
          </div>

          <div class="form-group"><label>Invoice Handoff</label>
            <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px">
              <div style="background:#f1f5f9;border-radius:8px;padding:10px;text-align:center;font-size:12px">🖨 Printed<br><span class="text-xs text-light">8:31 AM</span></div>
              <span class="text-xs text-light">OR</span>
              <div style="background:#f0fdf4;border-radius:8px;padding:10px;text-align:center;font-size:12px;color:var(--green)">✏️ Signed<br><span class="text-xs">David Park</span></div>
            </div>
          </div>

          <div class="form-group"><label>Delivery Notes</label>
            <textarea rows="2" placeholder="e.g., left with kitchen manager">Received by kitchen staff, loading dock.</textarea>
          </div>

          <button class="btn-success w-full" onclick="window.ERP.toast('Delivery confirmed!','success');setTimeout(()=>window.ERP.nav('#/driver/main'),800)">
            ✅ Confirm Delivery
          </button>
        </div>
      </div>
    </div>`;
}

/* ── STOP DETAIL (full page) ── */
function stopDetailPage() {
  return `
    <div class="mobile-frames-row" style="grid-template-columns:1fr 1fr">
      <div class="mobile-frame">
        <div class="mobile-header"><span onclick="window.ERP.nav('#/driver/main')" style="cursor:pointer">←</span><h2>Stop 3 — Ocean Prime</h2><span>⋯</span></div>
        <div class="mobile-content">
          <div class="map-placeholder" style="height:150px">🗺 Map — Navigate to 321 Atlantic Ave</div>
          <div class="card mb-8" style="padding:12px">
            <div class="flex-between"><strong>Ocean Prime Seafood</strong><span class="text-sm text-light">Stop 3 of 6</span></div>
            <div class="text-sm text-light">321 Atlantic Ave, Boston</div>
            <div class="flex-between mt-8">
              <span class="text-sm">📞 David Park</span>
              <span class="text-sm">${fmt$(4200)} · 18 items</span>
            </div>
          </div>
          <div class="card mb-8" style="padding:12px">
            <h3 style="font-size:13px;margin-bottom:8px">Order Items — ORD-2603</h3>
            <table style="font-size:12px">
              <thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr></thead>
              <tbody>
                <tr><td>Whole Milk 4/1 GAL</td><td style="text-align:center">4</td><td style="text-align:right">${fmt$(17.16)}</td></tr>
                <tr><td>Romaine Hearts 24 CT</td><td style="text-align:center">3</td><td style="text-align:right">${fmt$(97.50)}</td></tr>
                <tr><td>NY Strip Steak 20 LB</td><td style="text-align:center">2</td><td style="text-align:right">${fmt$(530.00)}</td></tr>
                <tr><td>Atlantic Salmon 10 LB</td><td style="text-align:center">3</td><td style="text-align:right">${fmt$(375.00)}</td></tr>
                <tr><td>Jumbo Shrimp 5 LB</td><td style="text-align:center">4</td><td style="text-align:right">${fmt$(288.00)}</td></tr>
                <tr><td>Heavy Cream 12/1 QT</td><td style="text-align:center">2</td><td style="text-align:right">${fmt$(10.98)}</td></tr>
              </tbody>
            </table>
            <div class="info-box mt-8">📝 Driver can edit quantities before confirming. Changes create adjustment on invoice.</div>
          </div>
          <div style="display:flex;gap:8px">
            <button class="btn-primary" style="flex:1" onclick="window.ERP.nav('#/driver/confirm')">✅ Deliver</button>
            <button class="btn-danger" style="flex:1" onclick="window.ERP.nav('#/driver/reject')">✗ Reject</button>
          </div>
        </div>
      </div>

      <!-- EDIT ORDER (driver) -->
      <div class="mobile-frame">
        <div class="mobile-header" style="background:var(--orange)"><span onclick="window.ERP.nav('#/driver/stop')" style="cursor:pointer">←</span><h2>Edit Order</h2><span></span></div>
        <div class="mobile-content" style="padding:12px 14px">
          <div class="warn-box" style="margin-bottom:12px">⚠️ Adjust quantities or remove lines not delivered. All changes are logged and reflected on the invoice.</div>
          <div style="overflow-x:auto;border-radius:8px;border:1px solid var(--border)">
            <table style="font-size:12px;margin:0">
              <thead><tr><th>Product</th><th style="text-align:center">Orig</th><th style="text-align:center">Actual</th><th></th></tr></thead>
              <tbody>
                <tr id="erow-milk"><td>Whole Milk</td><td style="text-align:center">4</td><td style="text-align:center"><input class="inline-input edit" type="number" value="4" min="0" style="width:52px"></td><td><button class="btn-danger btn-sm" onclick="if(confirm('Remove Whole Milk from this delivery?')){var r=document.getElementById('erow-milk');r.style.opacity='0.4';r.style.textDecoration='line-through';this.disabled=true;window.ERP.toast('Line removed','')}">✕</button></td></tr>
                <tr id="erow-romaine"><td>Romaine Hearts</td><td style="text-align:center">3</td><td style="text-align:center"><input class="inline-input edit" type="number" value="3" min="0" style="width:52px"></td><td><button class="btn-danger btn-sm" onclick="if(confirm('Remove Romaine Hearts from this delivery?')){var r=document.getElementById('erow-romaine');r.style.opacity='0.4';r.style.textDecoration='line-through';this.disabled=true;window.ERP.toast('Line removed','')}">✕</button></td></tr>
                <tr id="erow-steak" class="row-warn"><td>NY Strip Steak</td><td style="text-align:center">2</td><td style="text-align:center"><input class="inline-input edit" type="number" value="1" min="0" style="width:52px"></td><td><button class="btn-danger btn-sm" onclick="if(confirm('Remove NY Strip Steak from this delivery?')){var r=document.getElementById('erow-steak');r.style.opacity='0.4';r.style.textDecoration='line-through';this.disabled=true;window.ERP.toast('Line removed','')}">✕</button></td></tr>
                <tr id="erow-salmon"><td>Salmon Fillet</td><td style="text-align:center">3</td><td style="text-align:center"><input class="inline-input edit" type="number" value="3" min="0" style="width:52px"></td><td><button class="btn-danger btn-sm" onclick="if(confirm('Remove Salmon Fillet from this delivery?')){var r=document.getElementById('erow-salmon');r.style.opacity='0.4';r.style.textDecoration='line-through';this.disabled=true;window.ERP.toast('Line removed','')}">✕</button></td></tr>
                <tr id="erow-shrimp"><td>Jumbo Shrimp</td><td style="text-align:center">4</td><td style="text-align:center"><input class="inline-input edit" type="number" value="4" min="0" style="width:52px"></td><td><button class="btn-danger btn-sm" onclick="if(confirm('Remove Jumbo Shrimp from this delivery?')){var r=document.getElementById('erow-shrimp');r.style.opacity='0.4';r.style.textDecoration='line-through';this.disabled=true;window.ERP.toast('Line removed','')}">✕</button></td></tr>
                <tr id="erow-cream"><td>Heavy Cream</td><td style="text-align:center">2</td><td style="text-align:center"><input class="inline-input edit" type="number" value="2" min="0" style="width:52px"></td><td><button class="btn-danger btn-sm" onclick="if(confirm('Remove Heavy Cream from this delivery?')){var r=document.getElementById('erow-cream');r.style.opacity='0.4';r.style.textDecoration='line-through';this.disabled=true;window.ERP.toast('Line removed','')}">✕</button></td></tr>
              </tbody>
            </table>
          </div>
          <div class="form-group mt-12"><label>Reason for Change</label>
            <select style="font-size:13px"><option>Customer request — didn't need full qty</option><option>Item damaged</option><option>Item missing from truck</option><option>Other</option></select>
          </div>
          <button class="btn-primary w-full mt-8" onclick="window.ERP.toast('Order updated. Accounting and salesperson notified.','success')">Save Changes</button>
        </div>
      </div>
    </div>`;
}

/* ── DELIVERY CONFIRM ── */
function deliveryConfirmPage() {
  return `
    <div style="max-width:420px;margin:0 auto">
      <div class="mobile-frame">
        <div class="mobile-header green"><span onclick="window.ERP.nav('#/driver/stop')" style="cursor:pointer">←</span><h2>Confirm Delivery</h2><span></span></div>
        <div class="mobile-content" style="padding:14px">

          <!-- Invoice auto-generated banner -->
          <div class="success-box" style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <span style="font-size:20px">📄</span>
            <div>
              <div class="bold" style="font-size:13px">✓ Invoice INV-2603 generated</div>
              <div class="text-xs text-light">Posted to system · ${fmt$(4200)} · 18 items</div>
            </div>
          </div>

          <div class="card mb-12" style="padding:12px">
            <div class="flex-between"><strong>Ocean Prime Seafood</strong><span class="badge badge-blue">ORD-2603</span></div>
            <div class="text-xs text-light mt-4">321 Atlantic Ave, Boston · David Park</div>
          </div>

          <!-- Step 1: Verify -->
          <div class="form-group">
            <label style="font-size:12px;font-weight:700;color:var(--text-light)">STEP 1 — VERIFY ITEMS</label>
            <div style="display:flex;gap:8px">
              <button class="btn-success btn-sm" style="flex:1" id="btn-verify" onclick="document.getElementById('btn-verify').style.opacity='1';document.getElementById('btn-edit-items').style.opacity='.5';window.ERP.toast('Items verified','')">✓ All Correct</button>
              <button class="btn-outline btn-sm" style="flex:1" id="btn-edit-items" onclick="window.ERP.nav('#/driver/stop')">✏️ Edit Items</button>
            </div>
          </div>

          <!-- Step 2: Print or Sign -->
          <div class="form-group">
            <label style="font-size:12px;font-weight:700;color:var(--text-light)">STEP 2 — INVOICE HANDOFF</label>
            <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px">
              <button class="btn-outline" style="padding:12px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;border-radius:10px" id="btn-print"
                onclick="document.getElementById('btn-print').style.borderColor='var(--green)';document.getElementById('btn-print').style.color='var(--green)';document.getElementById('lbl-print').textContent='Printed ✓';window.ERP.toast('Printing invoice…','success')">
                <span style="font-size:22px">🖨</span>
                <span id="lbl-print" style="font-size:12px;font-weight:600">Print Invoice</span>
                <span style="font-size:10px;color:var(--text-light)">Bluetooth printer</span>
              </button>
              <div style="font-size:11px;font-weight:700;color:var(--text-light);text-align:center">OR</div>
              <button class="btn-outline" style="padding:12px 8px;display:flex;flex-direction:column;align-items:center;gap:4px;border-radius:10px" id="btn-sign"
                onclick="document.getElementById('sig-pad').style.display='block';document.getElementById('btn-sign').style.borderColor='var(--blue)';document.getElementById('btn-sign').style.color='var(--blue)')">
                <span style="font-size:22px">✏️</span>
                <span style="font-size:12px;font-weight:600">Digital Signature</span>
                <span style="font-size:10px;color:var(--text-light)">Customer signs on screen</span>
              </button>
            </div>
            <div id="sig-pad" style="display:none;margin-top:10px">
              <div class="signature-pad" onclick="this.classList.add('signed');this.innerHTML='<span style=font-size:13px>✓ Signed by David Park<\/span>';document.getElementById('btn-sign').style.borderColor='var(--green)';document.getElementById('btn-sign').style.color='var(--green)'">
                Tap to capture signature
              </div>
            </div>
          </div>

          <!-- Step 3: Notes -->
          <div class="form-group">
            <label style="font-size:12px;font-weight:700;color:var(--text-light)">STEP 3 — NOTES (OPTIONAL)</label>
            <textarea rows="2" placeholder="e.g., left at loading dock, received by kitchen manager…" style="font-size:13px"></textarea>
          </div>

          <button class="btn-success w-full" style="font-size:15px;padding:14px;margin-top:4px"
            onclick="window.ERP.toast('✅ Delivery confirmed — next stop loaded','success');setTimeout(()=>window.ERP.nav('#/driver/main'),900)">
            Confirm Delivery
          </button>
        </div>
      </div>
    </div>`;
}

/* ── REJECT / REFUSE ── */
function rejectPage() {
  return `
    <div style="max-width:420px;margin:0 auto">
      <div class="mobile-frame">
        <div class="mobile-header red"><span onclick="window.ERP.nav('#/driver/stop')" style="cursor:pointer">←</span><h2>Reject Delivery</h2><span></span></div>
        <div class="mobile-content">
          <div class="card mb-8" style="padding:12px">
            <strong>Ocean Prime Seafood</strong>
            <div class="text-sm text-light">ORD-2603 · ${fmt$(4200)}</div>
          </div>

          <div class="form-group"><label>Rejection Reason</label></div>
          <div class="radio-option" onclick="this.querySelector('input').checked=true"><input type="radio" name="reject"> <div><strong>Customer Refused</strong><div class="text-xs text-light">Customer doesn't want the delivery</div></div></div>
          <div class="radio-option" onclick="this.querySelector('input').checked=true"><input type="radio" name="reject"> <div><strong>Business Closed</strong><div class="text-xs text-light">Nobody available to receive</div></div></div>
          <div class="radio-option" onclick="this.querySelector('input').checked=true"><input type="radio" name="reject"> <div><strong>Damaged Goods</strong><div class="text-xs text-light">Product quality issue</div></div></div>
          <div class="radio-option" onclick="this.querySelector('input').checked=true"><input type="radio" name="reject"> <div><strong>Wrong Order</strong><div class="text-xs text-light">Items don't match what was ordered</div></div></div>
          <div class="radio-option" onclick="this.querySelector('input').checked=true"><input type="radio" name="reject"> <div><strong>Access Issue</strong><div class="text-xs text-light">Can't reach delivery location</div></div></div>

          <div class="form-group mt-16"><label>Additional Notes</label>
            <textarea rows="2" placeholder="Details about the rejection…"></textarea>
          </div>

          <div class="form-group"><label>Photo Evidence</label>
            <button class="btn-outline w-full">📷 Take Photo</button>
          </div>

          <button class="btn-danger w-full" style="font-size:15px;padding:12px" onclick="window.ERP.toast('Delivery rejected — returning to route','error');setTimeout(()=>window.ERP.nav('#/driver/main'),800)">
            Confirm Rejection
          </button>
          <button class="btn-outline w-full mt-8" onclick="window.ERP.nav('#/driver/stop')">Cancel</button>
        </div>
      </div>
    </div>`;
}

/* ── END OF ROUTE ── */
function endOfRoutePage() {
  return `
    <div style="max-width:600px;margin:0 auto">
      <div class="card text-center" style="padding:32px">
        <div style="font-size:48px;margin-bottom:12px">🏁</div>
        <h2>End of Route Summary</h2>
        <div class="text-sm text-light mb-16">Route A-1: Downtown Boston · Feb 26, 2026</div>

        <div class="tiles" style="grid-template-columns:repeat(3,1fr)">
          <div class="tile tile-green"><div class="tile-label">Delivered</div><div class="tile-value">4</div></div>
          <div class="tile tile-red"><div class="tile-label">Rejected</div><div class="tile-value">0</div></div>
          <div class="tile tile-blue"><div class="tile-label">Remaining</div><div class="tile-value">2</div></div>
        </div>

        <div class="card" style="text-align:left;margin-top:16px">
          <h3>Delivery Log</h3>
          <table><thead><tr><th>Stop</th><th>Customer</th><th>Status</th><th>Time</th><th style="text-align:right">Amount</th></tr></thead>
          <tbody>
            <tr><td>1</td><td>Bella Cucina</td><td><span class="badge badge-green">Delivered</span></td><td>7:15 AM</td><td style="text-align:right">${fmt$(2845)}</td></tr>
            <tr><td>2</td><td>Harbor Grill</td><td><span class="badge badge-green">Delivered</span></td><td>7:45 AM</td><td style="text-align:right">${fmt$(1540)}</td></tr>
            <tr><td>3</td><td>Ocean Prime</td><td><span class="badge badge-green">Delivered</span></td><td>8:32 AM</td><td style="text-align:right">${fmt$(4200)}</td></tr>
            <tr><td>4</td><td>Tony's Pizza DT</td><td><span class="badge badge-yellow">Pending</span></td><td>—</td><td style="text-align:right">${fmt$(650)}</td></tr>
            <tr><td>5</td><td>Tony's Pizza HQ</td><td><span class="badge badge-yellow">Pending</span></td><td>—</td><td style="text-align:right">${fmt$(1850)}</td></tr>
            <tr><td>6</td><td>Waterfront Hotel</td><td><span class="badge badge-yellow">Pending</span></td><td>—</td><td style="text-align:right">${fmt$(5800)}</td></tr>
          </tbody>
          <tfoot><tr><td colspan="4"><strong>Total Delivered</strong></td><td style="text-align:right"><strong>${fmt$(8585)}</strong></td></tr></tfoot></table>
        </div>

        <div class="grid-2 mt-16">
          <div class="card"><h3 class="text-sm">Cash/Check Collected</h3><div class="bold" style="font-size:20px;color:var(--green)">${fmt$(420)}</div><div class="text-xs text-light">1 check received</div></div>
          <div class="card"><h3 class="text-sm">Signatures</h3><div class="bold" style="font-size:20px;color:var(--green)">3 / 3</div><div class="text-xs text-light">All deliveries signed</div></div>
        </div>

        <div class="info-box mt-16">📍 Route started: 6:45 AM · Current: 8:45 AM · Estimated finish: 10:45 AM</div>

        <div style="display:flex;gap:8px;justify-content:center;margin-top:20px">
          <button class="btn-outline" onclick="window.ERP.nav('#/driver/main')">← Back to Route</button>
          <button class="btn-success" onclick="window.ERP.toast('Route completed! Summary sent to dispatch.','success')">🏁 End Route</button>
        </div>
      </div>
    </div>`;
}
