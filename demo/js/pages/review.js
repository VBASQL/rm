// ===== Invoice & Statement Review Page =====
// Standalone demo page — pricing discrepancy flagging, adjustments, manual lock, bulk actions

const fmt$ = n => '$' + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/* ─── Demo Data ─── */

const PRICE_LEVELS_MAP = {
  'Premium':             { label: 'Premium',             multiplier: 1.00 },
  'Restaurant Standard': { label: 'Restaurant Standard', multiplier: 1.08 },
  'Deli Standard':       { label: 'Deli Standard',       multiplier: 1.12 },
  'Wholesale':           { label: 'Wholesale',           multiplier: 0.94 },
  'Bakery':              { label: 'Bakery',              multiplier: 1.05 },
  'Cafe Standard':       { label: 'Cafe Standard',       multiplier: 1.10 },
};

// Weekly invoice review data — demo invoices with line-level pricing flags
const WEEKLY_INVOICES = [
  {
    id: 'INV-5501', date: '2026-02-24', customer: 'Bella Cucina Restaurant',
    priceLevel: 'Restaurant Standard', customerCode: 'BELL-001',
    status: 'open', locked: false,
    lines: [
      { product: 'Cola Classic 12oz 24-pk', sku: 'COL-12C-24', qty: 10, billedPrice: 12.99, expectedPrice: 12.99, disc: 0 },
      { product: 'Lemon-Lime 20oz 24-pk',   sku: 'LEM-20P-24', qty: 6,  billedPrice: 24.50, expectedPrice: 22.50, disc: 0 },
      { product: 'Orange 12oz 24-pk',        sku: 'ORA-12C-24', qty: 8,  billedPrice: 12.49, expectedPrice: 12.49, disc: 0 },
    ],
  },
  {
    id: 'INV-5502', date: '2026-02-24', customer: 'Harbor Grill',
    priceLevel: 'Restaurant Standard', customerCode: 'HARB-002',
    status: 'open', locked: false,
    lines: [
      { product: 'Cola Classic 12oz 24-pk', sku: 'COL-12C-24', qty: 5, billedPrice: 11.50, expectedPrice: 12.99, disc: 0 },
      { product: 'Root Beer 24-pk',          sku: 'RBR-12C-24', qty: 4, billedPrice: 13.29, expectedPrice: 13.29, disc: 0 },
    ],
  },
  {
    id: 'INV-5503', date: '2026-02-25', customer: 'Fresh Market Deli',
    priceLevel: 'Deli Standard', customerCode: 'FRES-003',
    status: 'open', locked: false,
    lines: [
      { product: 'Cola Zero Sugar 12oz 24-pk', sku: 'COL-ZRC-24', qty: 12, billedPrice: 12.99, expectedPrice: 12.99, disc: 0 },
      { product: 'Grape 12oz 24-pk',            sku: 'GRA-12C-24', qty: 7,  billedPrice: 14.99, expectedPrice: 12.49, disc: 0 },
      { product: 'Seltzer Plain 12oz 24-pk',    sku: 'SEL-12C-24', qty: 6,  billedPrice: 13.00, expectedPrice: 13.00, disc: 0 },
    ],
  },
  {
    id: 'INV-5504', date: '2026-02-25', customer: 'Ocean Prime Seafood',
    priceLevel: 'Premium', customerCode: 'OCEA-004',
    status: 'approved', locked: false,
    lines: [
      { product: 'Cola Classic 20oz 24-pk', sku: 'COL-20P-24', qty: 20, billedPrice: 22.50, expectedPrice: 22.50, disc: 0 },
      { product: 'Seltzer Lime 12oz 24-pk', sku: 'SEL-LM-24',  qty: 10, billedPrice: 13.49, expectedPrice: 13.49, disc: 0 },
    ],
  },
  {
    id: 'INV-5505', date: '2026-02-26', customer: 'Cambridge Catering Co',
    priceLevel: 'Wholesale', customerCode: 'CAMB-007',
    status: 'open', locked: false,
    lines: [
      { product: 'Cola Classic 12oz 24-pk', sku: 'COL-12C-24', qty: 50, billedPrice: 12.99, expectedPrice: 12.22, disc: 0 },
      { product: 'Lemon-Lime 12oz 24-pk',   sku: 'LEM-12C-24', qty: 30, billedPrice: 12.99, expectedPrice: 12.22, disc: 0 },
      { product: 'Orange 12oz 24-pk',        sku: 'ORA-12C-24', qty: 25, billedPrice: 11.74, expectedPrice: 11.74, disc: 0 },
    ],
  },
  {
    id: 'INV-5506', date: '2026-02-26', customer: 'Waterfront Hotel',
    priceLevel: 'Premium', customerCode: 'WATE-009',
    status: 'open', locked: true,
    lines: [
      { product: 'Cola Classic 2L 6-pk',     sku: 'COL-2LP-6',  qty: 30, billedPrice: 9.99,  expectedPrice: 9.99,  disc: 0 },
      { product: 'Seltzer Peach 12oz 24-pk', sku: 'SEL-PC-24',  qty: 15, billedPrice: 13.49, expectedPrice: 13.49, disc: 0 },
      { product: 'Grape 12oz 24-pk',          sku: 'GRA-12C-24', qty: 12, billedPrice: 15.00, expectedPrice: 12.49, disc: 0 },
    ],
  },
  {
    id: 'INV-5507', date: '2026-02-27', customer: "Tony's Pizza — Downtown",
    priceLevel: 'Restaurant Standard', customerCode: 'TONY-005',
    status: 'open', locked: false,
    lines: [
      { product: 'Cola Cherry 12oz 24-pk', sku: 'COL-CHC-24', qty: 8, billedPrice: 12.99, expectedPrice: 12.99, disc: 0 },
      { product: 'Cola Classic 2L 6-pk',   sku: 'COL-2LP-6',  qty: 5, billedPrice: 9.99,  expectedPrice: 9.99,  disc: 0 },
    ],
  },
];

// Monthly statement review data
const MONTHLY_STATEMENTS = [
  {
    id: 'STMT-2602-001', period: 'Feb 2026', customer: 'Bella Cucina Restaurant',
    priceLevel: 'Restaurant Standard', customerCode: 'BELL-001', creditTier: 'A',
    invoiceCount: 4, invoiceTotal: 11420.00, paymentsReceived: 8450.00,
    expectedBalance: 2970.00, statementBalance: 3180.00,
    pricingFlags: 2, status: 'open', locked: false,
    notes: '',
  },
  {
    id: 'STMT-2602-002', period: 'Feb 2026', customer: 'Harbor Grill',
    priceLevel: 'Restaurant Standard', customerCode: 'HARB-002', creditTier: 'A',
    invoiceCount: 3, invoiceTotal: 5430.00, paymentsReceived: 5430.00,
    expectedBalance: 0.00, statementBalance: 0.00,
    pricingFlags: 1, status: 'approved', locked: false,
    notes: '',
  },
  {
    id: 'STMT-2602-003', period: 'Feb 2026', customer: 'Fresh Market Deli',
    priceLevel: 'Deli Standard', customerCode: 'FRES-003', creditTier: 'B',
    invoiceCount: 5, invoiceTotal: 8760.00, paymentsReceived: 3200.00,
    expectedBalance: 5560.00, statementBalance: 6100.00,
    pricingFlags: 2, status: 'open', locked: false,
    notes: '',
  },
  {
    id: 'STMT-2602-004', period: 'Feb 2026', customer: 'Ocean Prime Seafood',
    priceLevel: 'Premium', customerCode: 'OCEA-004', creditTier: 'A',
    invoiceCount: 6, invoiceTotal: 22400.00, paymentsReceived: 22400.00,
    expectedBalance: 0.00, statementBalance: 0.00,
    pricingFlags: 0, status: 'approved', locked: true,
    notes: 'Verified by A. Ekstein',
  },
  {
    id: 'STMT-2602-005', period: 'Feb 2026', customer: 'Cambridge Catering Co',
    priceLevel: 'Wholesale', customerCode: 'CAMB-007', creditTier: 'Prepay',
    invoiceCount: 2, invoiceTotal: 5600.00, paymentsReceived: 5600.00,
    expectedBalance: 0.00, statementBalance: 538.00,
    pricingFlags: 2, status: 'open', locked: false,
    notes: '',
  },
  {
    id: 'STMT-2602-006', period: 'Feb 2026', customer: 'Waterfront Hotel',
    priceLevel: 'Premium', customerCode: 'WATE-009', creditTier: 'A',
    invoiceCount: 8, invoiceTotal: 41600.00, paymentsReceived: 19600.00,
    expectedBalance: 22000.00, statementBalance: 22000.00,
    pricingFlags: 1, status: 'open', locked: true,
    notes: '',
  },
  {
    id: 'STMT-2602-007', period: 'Feb 2026', customer: "Tony's Pizza — Downtown",
    priceLevel: 'Restaurant Standard', customerCode: 'TONY-005', creditTier: 'B',
    invoiceCount: 3, invoiceTotal: 4500.00, paymentsReceived: 0.00,
    expectedBalance: 4500.00, statementBalance: 4500.00,
    pricingFlags: 0, status: 'approved', locked: false,
    notes: '',
  },
  {
    id: 'STMT-2602-008', period: 'Feb 2026', customer: 'Sunrise Bakery',
    priceLevel: 'Bakery', customerCode: 'SUNR-008', creditTier: 'A',
    invoiceCount: 4, invoiceTotal: 1800.00, paymentsReceived: 600.00,
    expectedBalance: 1200.00, statementBalance: 1200.00,
    pricingFlags: 0, status: 'approved', locked: false,
    notes: '',
  },
];

/* ─── Helpers ─── */
function flagCount(inv) {
  return inv.lines.filter(l => Math.abs(l.billedPrice - l.expectedPrice) > 0.005).length;
}
function invTotal(inv) {
  return inv.lines.reduce((s, l) => s + l.billedPrice * l.qty, 0);
}
function expectedTotal(inv) {
  return inv.lines.reduce((s, l) => s + l.expectedPrice * l.qty, 0);
}
function statusBadge(s, locked) {
  if (locked) return `<span class="badge badge-dark">🔒 Locked</span>`;
  if (s === 'approved') return `<span class="badge badge-green">✓ Approved</span>`;
  return `<span class="badge badge-yellow">⚠ Pending</span>`;
}
function flagBadge(n) {
  if (n === 0) return `<span class="badge badge-green">✓ No Flags</span>`;
  if (n === 1) return `<span class="badge badge-yellow">⚠ ${n} Flag</span>`;
  return `<span class="badge badge-red">🚨 ${n} Flags</span>`;
}
function discBadge(n) {
  if (n === 0) return `<span style="color:var(--text-light)">—</span>`;
  return `<span style="color:var(--red);font-weight:600">+${fmt$(n)}</span>`;
}

/* ─── Page State ─── */
let _tab = 'weekly'; // 'weekly' | 'monthly'

// Mutable session state — lives until the module is reloaded (page refresh)
const _INV_STATE  = WEEKLY_INVOICES.map(i  => ({ status: i.status,  locked: i.locked }));
const _STMT_STATE = MONTHLY_STATEMENTS.map(s => ({ status: s.status, locked: s.locked }));
const _INV_EXP    = WEEKLY_INVOICES.map(i  => i.lines.map(l => ({ exp: l.expectedPrice, qty: l.qty })));
const _STMT_EXP   = MONTHLY_STATEMENTS.map(s => ({ expBal: s.expectedBalance }));

const _fmtMoney = n => '$' + Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

function _refreshInvRow(idx) {
  const st  = _INV_STATE[idx];
  const row = document.getElementById('inv-row-' + idx);
  const statusEl  = document.getElementById('inv-status-' + idx);
  const actionsEl = document.getElementById('inv-actions-' + idx);
  if (!row || !statusEl || !actionsEl) return;
  if (st.locked) {
    statusEl.innerHTML = '<span class="badge badge-dark">\uD83D\uDD12 Locked</span>';
  } else if (st.status === 'approved') {
    statusEl.innerHTML = '<span class="badge badge-green">\u2713 Approved</span>';
  } else {
    statusEl.innerHTML = '<span class="badge badge-yellow">\u26A0 Pending</span>';
  }
  let b = '<div style="display:flex;gap:4px;flex-wrap:wrap">';
  b += '<button class="btn-outline btn-sm" onclick="reviewExpandInv(' + idx + ')">\uD83D\uDD0D Review</button>';
  if (!st.locked && st.status !== 'approved')
    b += '<button class="btn-success btn-sm" onclick="reviewApproveInv(' + idx + ')">\u2713 Approve</button>';
  if (!st.locked)
    b += '<button class="btn-outline btn-sm" style="color:var(--text-light)" onclick="reviewLockInv(' + idx + ')">\uD83D\uDD12 Lock</button>';
  else
    b += '<button class="btn-outline btn-sm" style="color:var(--orange)" onclick="reviewUnlockInv(' + idx + ')">\uD83D\uDD13 Unlock</button>';
  b += '</div>';
  actionsEl.innerHTML = b;
  if (st.locked) row.style.background = '#f1f5f9';
  else if (st.status === 'approved') row.style.background = '#f0fdf4';
  else {
    const flagsEl = document.getElementById('inv-flags-' + idx);
    row.style.background = (flagsEl && flagsEl.querySelector('.badge-red,.badge-yellow')) ? 'var(--yellow-bg)' : '';
  }
}

function _refreshStmtRow(idx) {
  const st  = _STMT_STATE[idx];
  const row = document.getElementById('stmt-row-' + idx);
  const statusEl  = document.getElementById('stmt-status-' + idx);
  const actionsEl = document.getElementById('stmt-actions-' + idx);
  if (!row || !statusEl || !actionsEl) return;
  if (st.locked) {
    statusEl.innerHTML = '<span class="badge badge-dark">\uD83D\uDD12 Locked</span>';
  } else if (st.status === 'approved') {
    statusEl.innerHTML = '<span class="badge badge-green">\u2713 Approved</span>';
  } else {
    statusEl.innerHTML = '<span class="badge badge-yellow">\u26A0 Pending</span>';
  }
  let b = '<div style="display:flex;gap:4px;flex-wrap:wrap">';
  b += '<button class="btn-outline btn-sm" onclick="reviewExpandStmt(' + idx + ')">\uD83D\uDD0D Review</button>';
  if (!st.locked && st.status !== 'approved')
    b += '<button class="btn-success btn-sm" onclick="reviewApproveStmt(' + idx + ')">\u2713 Approve</button>';
  if (!st.locked)
    b += '<button class="btn-outline btn-sm" style="color:var(--text-light)" onclick="reviewLockStmt(' + idx + ')">\uD83D\uDD12 Lock</button>';
  else
    b += '<button class="btn-outline btn-sm" style="color:var(--orange)" onclick="reviewUnlockStmt(' + idx + ')">\uD83D\uDD13 Unlock</button>';
  b += '</div>';
  actionsEl.innerHTML = b;
  if (st.locked) row.style.background = '#f1f5f9';
  else if (st.status === 'approved') row.style.background = '#f0fdf4';
  else {
    const flagsEl = document.getElementById('stmt-flags-' + idx);
    row.style.background = (flagsEl && flagsEl.querySelector('.badge-red,.badge-yellow')) ? 'var(--yellow-bg)' : '';
  }
}

/* ── Expand / Collapse ── */
window.reviewExpandInv = function(idx) {
  const row = document.getElementById('inv-detail-' + idx);
  if (!row) return;
  document.querySelectorAll('[id^="inv-detail-"]').forEach(r => { if (r.id !== 'inv-detail-' + idx) r.style.display = 'none'; });
  row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
};
window.reviewCollapseInv = function(idx) {
  const r = document.getElementById('inv-detail-' + idx); if (r) r.style.display = 'none';
};
window.reviewExpandStmt = function(idx) {
  const row = document.getElementById('stmt-detail-' + idx);
  if (!row) return;
  document.querySelectorAll('[id^="stmt-detail-"]').forEach(r => { if (r.id !== 'stmt-detail-' + idx) r.style.display = 'none'; });
  row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
};
window.reviewCollapseStmt = function(idx) {
  const r = document.getElementById('stmt-detail-' + idx); if (r) r.style.display = 'none';
};

/* ── Approve / Lock / Unlock – Invoice ── */
window.reviewApproveInv = function(idx) {
  _INV_STATE[idx].status = 'approved';
  _refreshInvRow(idx);
  window.ERP.toast('INV-' + (5501 + idx) + ' approved \u2713', 'success');
};
window.reviewLockInv = function(idx) {
  _INV_STATE[idx].locked = true; _INV_STATE[idx].status = 'approved';
  _refreshInvRow(idx);
  const d = document.getElementById('inv-detail-' + idx); if (d) d.style.display = 'none';
  window.ERP.toast('INV-' + (5501 + idx) + ' locked \uD83D\uDD12', '');
};
window.reviewUnlockInv = function(idx) {
  _INV_STATE[idx].locked = false;
  _refreshInvRow(idx);
  window.ERP.toast('INV-' + (5501 + idx) + ' unlocked', '');
};

/* ── Approve / Lock / Unlock – Statement ── */
window.reviewApproveStmt = function(idx) {
  _STMT_STATE[idx].status = 'approved';
  _refreshStmtRow(idx);
  window.ERP.toast('Statement approved \u2713', 'success');
};
window.reviewLockStmt = function(idx) {
  _STMT_STATE[idx].locked = true; _STMT_STATE[idx].status = 'approved';
  _refreshStmtRow(idx);
  const d = document.getElementById('stmt-detail-' + idx); if (d) d.style.display = 'none';
  window.ERP.toast('Statement locked \uD83D\uDD12', '');
};
window.reviewUnlockStmt = function(idx) {
  _STMT_STATE[idx].locked = false;
  _refreshStmtRow(idx);
  window.ERP.toast('Statement unlocked', '');
};

/* ── Save invoice line adjustments ── */
window.reviewSaveInvChanges = function(idx) {
  const expLines = _INV_EXP[idx] || [];
  let newBilled = 0, newExpected = 0, fc = 0;
  expLines.forEach((l, li) => {
    const inp = document.getElementById('price-' + idx + '-' + li);
    const billed = inp ? (parseFloat(inp.value) || 0) : l.exp;
    newBilled   += billed * l.qty;
    newExpected += l.exp   * l.qty;
    if (Math.abs(billed - l.exp) > 0.005) fc++;
  });
  const delta = newBilled - newExpected;
  const billedEl = document.getElementById('inv-billed-' + idx);
  if (billedEl) billedEl.textContent = _fmtMoney(newBilled);
  const deltaEl = document.getElementById('inv-delta-' + idx);
  if (deltaEl) deltaEl.innerHTML = delta === 0
    ? '<span style="color:var(--green)">&mdash;</span>'
    : '<span style="color:var(--red);font-weight:700">' + (delta > 0 ? '+' : '-') + _fmtMoney(delta) + '</span>';
  const flagsEl = document.getElementById('inv-flags-' + idx);
  if (flagsEl) flagsEl.innerHTML = fc === 0
    ? '<span class="badge badge-green">\u2713 No Flags</span>'
    : fc === 1 ? '<span class="badge badge-yellow">\u26A0 1 Flag</span>'
    : '<span class="badge badge-red">\uD83D\uDEA8 ' + fc + ' Flags</span>';
  const row = document.getElementById('inv-row-' + idx);
  if (row && !_INV_STATE[idx].locked && _INV_STATE[idx].status !== 'approved')
    row.style.background = fc > 0 ? 'var(--yellow-bg)' : '';
  window.ERP.toast('Invoice adjustments saved', 'success');
};

/* ── Save statement changes ── */
window.reviewSaveStmtChanges = function(idx) {
  const noteEl = document.getElementById('stmt-notes-' + idx);
  const adjEl  = document.getElementById('stmt-adj-'   + idx);
  const note = noteEl ? noteEl.value : '';
  const adj  = adjEl  ? (parseFloat(adjEl.value) || 0) : 0;
  const expBal = (_STMT_EXP[idx] || {}).expBal || 0;
  const diff = adj - expBal;
  const balEl  = document.getElementById('stmt-bal-'  + idx);
  const diffEl = document.getElementById('stmt-diff-' + idx);
  if (balEl)  balEl.innerHTML  = diff !== 0 ? '<span style="color:var(--red);font-weight:700">' + _fmtMoney(adj)  + '</span>' : _fmtMoney(adj);
  if (diffEl) diffEl.innerHTML = diff === 0  ? '<span style="color:var(--green)">&mdash;</span>' : '<span style="color:var(--red);font-weight:700">' + (diff > 0 ? '+' : '-') + _fmtMoney(diff) + '</span>';
  window.ERP.toast('Statement saved' + (note ? ' \u2014 ' + note.substring(0, 30) : ''), 'success');
};

/* ── Line-level adjustment helpers ── */
window.reviewRecalcLine = function(idx, li) {
  const input   = document.getElementById('price-' + idx + '-' + li);
  const totalEl = document.getElementById('linetotal-' + idx + '-' + li);
  if (!input || !totalEl) return;
  const cells = input.closest('tr').querySelectorAll('td');
  const qty = parseInt(cells[2] ? cells[2].textContent : '1') || 1;
  totalEl.textContent = _fmtMoney(parseFloat(input.value) * qty);
};
window.reviewAdjustLine = function(idx, li) {
  const input = document.getElementById('price-' + idx + '-' + li);
  if (!input) return;
  const cells = input.closest('tr').querySelectorAll('td');
  const expText = cells[4] ? cells[4].textContent.replace(/[^0-9.]/g, '') : '';
  if (expText) { input.value = parseFloat(expText).toFixed(2); window.reviewRecalcLine(idx, li); }
  window.ERP.toast('Line adjusted to expected price', 'success');
};
window.reviewAdjustAllLines = function(idx) {
  const expLines = _INV_EXP[idx] || [];
  expLines.forEach((l, li) => {
    const inp = document.getElementById('price-' + idx + '-' + li);
    if (inp) { inp.value = l.exp.toFixed(2); window.reviewRecalcLine(idx, li); }
  });
  window.ERP.toast('All lines adjusted to expected prices', 'success');
};

/* ── Bulk selection counter ── */
window.reviewBulkCheck = function() {
  const el = document.getElementById('inv-selected-count');
  if (el) el.textContent = document.querySelectorAll('.inv-select:checked').length + ' selected';
};
window.reviewBulkCheckStmt = function() {
  const el = document.getElementById('stmt-selected-count');
  if (el) el.textContent = document.querySelectorAll('.stmt-select:checked').length + ' selected';
};
window.reviewSelectAllInv = function(checked) {
  document.querySelectorAll('.inv-select').forEach(cb => { cb.checked = checked; });
  window.reviewBulkCheck();
};
window.reviewSelectAllStmt = function(checked) {
  document.querySelectorAll('.stmt-select').forEach(cb => { cb.checked = checked; });
  window.reviewBulkCheckStmt();
};

/* ── Bulk actions – Invoices ── */
window.reviewBulkApprove = function() {
  const cbs = [...document.querySelectorAll('.inv-select:checked')];
  if (!cbs.length) { window.ERP.toast('Select at least one invoice', ''); return; }
  cbs.forEach(cb => { const i = +cb.dataset.idx; _INV_STATE[i].status = 'approved'; _refreshInvRow(i); });
  window.ERP.toast(cbs.length + ' invoice(s) approved \u2713', 'success');
};
window.reviewBulkLock = function() {
  const cbs = [...document.querySelectorAll('.inv-select:checked')];
  if (!cbs.length) { window.ERP.toast('Select at least one invoice', ''); return; }
  cbs.forEach(cb => { const i = +cb.dataset.idx; _INV_STATE[i].locked = true; _INV_STATE[i].status = 'approved'; _refreshInvRow(i); });
  window.ERP.toast(cbs.length + ' invoice(s) locked \uD83D\uDD12', '');
};
window.reviewBulkAdjust = function() {
  const cbs = [...document.querySelectorAll('.inv-select:checked')];
  if (!cbs.length) { window.ERP.toast('Select at least one invoice', ''); return; }
  cbs.forEach(cb => {
    const i = +cb.dataset.idx;
    (_INV_EXP[i] || []).forEach((l, li) => {
      const inp = document.getElementById('price-' + i + '-' + li);
      if (inp) { inp.value = l.exp.toFixed(2); window.reviewRecalcLine(i, li); }
    });
    const fe = document.getElementById('inv-flags-' + i); if (fe) fe.innerHTML = '<span class="badge badge-green">\u2713 No Flags</span>';
    const de = document.getElementById('inv-delta-' + i); if (de) de.innerHTML = '<span style="color:var(--green)">&mdash;</span>';
    const row = document.getElementById('inv-row-' + i);
    if (row && !_INV_STATE[i].locked && _INV_STATE[i].status !== 'approved') row.style.background = '';
  });
  window.ERP.toast(cbs.length + ' invoice(s) adjusted to expected prices', 'success');
};
window.reviewBulkFlag = function() {
  const cbs = [...document.querySelectorAll('.inv-select:checked')];
  if (!cbs.length) { window.ERP.toast('Select at least one invoice', ''); return; }
  cbs.forEach(cb => {
    const i = +cb.dataset.idx;
    if (!_INV_STATE[i].locked) { _INV_STATE[i].status = 'pending'; _refreshInvRow(i); const row = document.getElementById('inv-row-' + i); if (row) row.style.background = 'var(--red-bg)'; }
  });
  window.ERP.toast(cbs.length + ' invoice(s) flagged for supervisor review', '');
};

/* ── Bulk actions – Statements ── */
window.reviewBulkApproveStmt = function() {
  const cbs = [...document.querySelectorAll('.stmt-select:checked')];
  if (!cbs.length) { window.ERP.toast('Select at least one statement', ''); return; }
  cbs.forEach(cb => { const i = +cb.dataset.idx; _STMT_STATE[i].status = 'approved'; _refreshStmtRow(i); });
  window.ERP.toast(cbs.length + ' statement(s) approved \u2713', 'success');
};
window.reviewBulkLockStmt = function() {
  const cbs = [...document.querySelectorAll('.stmt-select:checked')];
  if (!cbs.length) { window.ERP.toast('Select at least one statement', ''); return; }
  cbs.forEach(cb => { const i = +cb.dataset.idx; _STMT_STATE[i].locked = true; _STMT_STATE[i].status = 'approved'; _refreshStmtRow(i); });
  window.ERP.toast(cbs.length + ' statement(s) locked \uD83D\uDD12', '');
};
window.reviewBulkAdjustStmt = function() {
  const cbs = [...document.querySelectorAll('.stmt-select:checked')];
  if (!cbs.length) { window.ERP.toast('Select at least one statement', ''); return; }
  cbs.forEach(cb => {
    const i = +cb.dataset.idx;
    const expBal = (_STMT_EXP[i] || {}).expBal || 0;
    const de = document.getElementById('stmt-diff-' + i); if (de) de.innerHTML = '<span style="color:var(--green)">&mdash;</span>';
    const be = document.getElementById('stmt-bal-'  + i); if (be) be.textContent = _fmtMoney(expBal);
    const fe = document.getElementById('stmt-flags-'+ i); if (fe) fe.innerHTML = '<span class="badge badge-green">\u2713 No Flags</span>';
    const row = document.getElementById('stmt-row-' + i);
    if (row && !_STMT_STATE[i].locked && _STMT_STATE[i].status !== 'approved') row.style.background = '';
  });
  window.ERP.toast(cbs.length + ' statement balance(s) adjusted to expected', 'success');
};
window.reviewBulkFlagStmt = function() {
  const cbs = [...document.querySelectorAll('.stmt-select:checked')];
  if (!cbs.length) { window.ERP.toast('Select at least one statement', ''); return; }
  cbs.forEach(cb => {
    const i = +cb.dataset.idx;
    if (!_STMT_STATE[i].locked) { _STMT_STATE[i].status = 'pending'; _refreshStmtRow(i); const row = document.getElementById('stmt-row-' + i); if (row) row.style.background = 'var(--red-bg)'; }
  });
  window.ERP.toast(cbs.length + ' statement(s) sent for review', '');
};

/* ── Search / filter ── */
window.reviewFilterInv = function() {
  const q  = (document.getElementById('inv-search')?.value || '').toLowerCase();
  const sf = (document.getElementById('inv-status-filter')?.value || '').toLowerCase();
  const ff = document.getElementById('inv-flag-filter')?.value || '';
  document.querySelectorAll('#weekly-inv-body tr[id^="inv-row-"]').forEach(tr => {
    const text = tr.textContent.toLowerCase();
    const flags  = !!tr.querySelector('.badge-red,.badge-yellow');
    const locked = text.includes('locked');
    const appr   = text.includes('approved');
    let show = true;
    if (q  && !text.includes(q))              show = false;
    if (sf === 'pending'  && (locked || appr)) show = false;
    if (sf === 'approved' && !appr)            show = false;
    if (sf === 'locked'   && !locked)          show = false;
    if (sf === 'flagged'  && !flags)           show = false;
    if (ff === 'flags'    && !flags)           show = false;
    if (ff === 'clean'    && flags)            show = false;
    const idx = tr.id.replace('inv-row-', '');
    tr.style.display = show ? '' : 'none';
    const det = document.getElementById('inv-detail-' + idx);
    if (det && !show) det.style.display = 'none';
  });
};
window.reviewFilterStmt = function() {
  const q  = (document.getElementById('stmt-search')?.value || '').toLowerCase();
  const sf = (document.getElementById('stmt-status-filter')?.value || '').toLowerCase();
  const ff = document.getElementById('stmt-flag-filter')?.value || '';
  document.querySelectorAll('#monthly-stmt-body tr[id^="stmt-row-"]').forEach(tr => {
    const text  = tr.textContent.toLowerCase();
    const flags  = !!tr.querySelector('.badge-red,.badge-yellow');
    const diff   = !!tr.querySelector('[style*="color:var(--red)"]');
    const locked = text.includes('locked');
    const appr   = text.includes('approved');
    let show = true;
    if (q  && !text.includes(q))              show = false;
    if (sf === 'pending'  && (locked || appr)) show = false;
    if (sf === 'approved' && !appr)            show = false;
    if (sf === 'locked'   && !locked)          show = false;
    if (ff === 'flags'    && !flags)           show = false;
    if (ff === 'diff'     && !diff)            show = false;
    if (ff === 'clean'    && (flags || diff))   show = false;
    const idx = tr.id.replace('stmt-row-', '');
    tr.style.display = show ? '' : 'none';
    const det = document.getElementById('stmt-detail-' + idx);
    if (det && !show) det.style.display = 'none';
  });
};

/* ─── Main Entry ─── */
export function renderReview(page) {
  // Determine active tab from URL or default
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  _tab = params.get('tab') || 'weekly';
  return reviewPage();
}

export function reviewNav() {
  return [
    { section: 'Review', icon: '📋', label: 'Invoice & Statement Review', page: 'review', default: true },
  ];
}

/* ─── Main Page ─── */
function reviewPage() {
  const weeklyFlagCount = WEEKLY_INVOICES.reduce((s, i) => s + flagCount(i), 0);
  const weeklyPending   = WEEKLY_INVOICES.filter(i => !i.locked && i.status !== 'approved').length;
  const monthlyFlagCount = MONTHLY_STATEMENTS.reduce((s, s2) => s + s2.pricingFlags, 0);
  const monthlyPending   = MONTHLY_STATEMENTS.filter(s => !s.locked && s.status !== 'approved').length;
  const totalDiscrepancy = WEEKLY_INVOICES.reduce((s, i) => s + (invTotal(i) - expectedTotal(i)), 0);

  return `
    <div class="section-title">
      <h2>📋 Invoice &amp; Statement Review</h2>
      <span class="text-light text-sm">Week of Feb 24 – 27, 2026</span>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-outline btn-sm" onclick="window.ERP.toast('Export to CSV — demo only','')">⬇ Export</button>
        <button class="btn-primary btn-sm" onclick="window.ERP.toast('Email summary sent to manager','success')">📧 Email Summary</button>
      </div>
    </div>

    <!-- Summary Tiles -->
    <div class="tiles" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
      <div class="tile tile-red">
        <div class="tile-label">Total Pricing Flags</div>
        <div class="tile-value">${weeklyFlagCount + monthlyFlagCount}</div>
        <div class="tile-sub">Across invoices &amp; statements</div>
      </div>
      <div class="tile tile-yellow">
        <div class="tile-label">Pending Invoices</div>
        <div class="tile-value">${weeklyPending}</div>
        <div class="tile-sub">Awaiting approval or lock</div>
      </div>
      <div class="tile tile-orange">
        <div class="tile-label">Billed vs Expected</div>
        <div class="tile-value">${totalDiscrepancy >= 0 ? '+' : ''}${fmt$(totalDiscrepancy)}</div>
        <div class="tile-sub">Invoice overcharge delta</div>
      </div>
      <div class="tile tile-blue">
        <div class="tile-label">Stmt Pending</div>
        <div class="tile-value">${monthlyPending}</div>
        <div class="tile-sub">Monthly statements</div>
      </div>
    </div>

    <!-- Tab Switcher -->
    <div class="tabs" id="review-tabs">
      <div class="tab ${_tab === 'weekly' ? 'active' : ''}" onclick="
        document.querySelectorAll('#review-tabs .tab').forEach(t=>t.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('tab-weekly').style.display='block';
        document.getElementById('tab-monthly').style.display='none';
      ">📄 Weekly Invoice Review</div>
      <div class="tab ${_tab === 'monthly' ? 'active' : ''}" onclick="
        document.querySelectorAll('#review-tabs .tab').forEach(t=>t.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('tab-weekly').style.display='none';
        document.getElementById('tab-monthly').style.display='block';
      ">📑 Monthly Statement Review</div>
    </div>

    <!-- Weekly Tab -->
    <div id="tab-weekly" style="display:${_tab === 'weekly' ? 'block' : 'none'}">
      ${weeklyTab()}
    </div>

    <!-- Monthly Tab -->
    <div id="tab-monthly" style="display:${_tab === 'monthly' ? 'block' : 'none'}">
      ${monthlyTab()}
    </div>
  `;
}

/* ─── Weekly Invoice Review ─── */
function weeklyTab() {
  // Build rows
  const rows = WEEKLY_INVOICES.map((inv, idx) => {
    const flags = flagCount(inv);
    const billed = invTotal(inv);
    const expected = expectedTotal(inv);
    const delta = billed - expected;
    const rowStyle = flags > 0 ? (inv.locked ? '' : 'background:var(--yellow-bg)') : '';
    return `
      <tr style="${rowStyle}" id="inv-row-${idx}">
        <td style="width:32px">
          <input type="checkbox" class="inv-select" data-idx="${idx}" onchange="reviewBulkCheck()">
        </td>
        <td><strong>${inv.id}</strong></td>
        <td>${inv.date}</td>
        <td>${inv.customer}<br><span class="text-light" style="font-size:11px">${inv.customerCode}</span></td>
        <td><span class="badge badge-blue" style="font-size:10px">${inv.priceLevel}</span></td>
        <td id="inv-billed-${idx}" style="text-align:right">${fmt$(billed)}</td>
        <td style="text-align:right">${fmt$(expected)}</td>
        <td id="inv-delta-${idx}" style="text-align:right">${delta === 0 ? '<span style="color:var(--green)">—</span>' : `<span style="color:var(--red);font-weight:700">${delta > 0 ? '+' : ''}${fmt$(delta)}</span>`}</td>
        <td id="inv-flags-${idx}">${flagBadge(flags)}</td>
        <td id="inv-status-${idx}">${statusBadge(inv.status, inv.locked)}</td>
        <td id="inv-actions-${idx}">
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            <button class="btn-outline btn-sm" onclick="reviewExpandInv(${idx})">🔍 Review</button>
            ${!inv.locked && inv.status !== 'approved' ? `
              <button class="btn-success btn-sm" onclick="reviewApproveInv(${idx})">✓ Approve</button>
            ` : ''}
            ${!inv.locked ? `
              <button class="btn-outline btn-sm" style="color:var(--text-light)" onclick="reviewLockInv(${idx})">🔒 Lock</button>
            ` : `
              <button class="btn-outline btn-sm" style="color:var(--orange)" onclick="reviewUnlockInv(${idx})">🔓 Unlock</button>
            `}
          </div>
        </td>
      </tr>
      <!-- Expandable detail row -->
      <tr id="inv-detail-${idx}" style="display:none">
        <td colspan="11" style="padding:0">
          ${invDetailPanel(inv, idx)}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!-- Bulk Actions Bar -->
    <div class="card" style="padding:12px 16px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
          <input type="checkbox" id="inv-select-all" onchange="reviewSelectAllInv(this.checked)"> Select All Open
        </label>
        <span style="color:var(--border)">|</span>
        <span class="text-light text-sm" id="inv-selected-count">0 selected</span>
        <span style="color:var(--border)">|</span>
        <strong style="font-size:12px;color:var(--text-light);text-transform:uppercase;letter-spacing:.5px">Bulk Actions:</strong>
        <button class="btn-success btn-sm" onclick="reviewBulkApprove()">✓ Approve Selected</button>
        <button class="btn-outline btn-sm" onclick="reviewBulkLock()">🔒 Lock Selected</button>
        <button class="btn-warning btn-sm" onclick="reviewBulkAdjust()">✏ Adjust to Expected</button>
        <button class="btn-outline btn-sm" style="color:var(--red)" onclick="reviewBulkFlag()">🚨 Flag for Review</button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="search-bar" style="margin-bottom:12px">
      <input placeholder="Search invoices…" id="inv-search" oninput="reviewFilterInv()" style="flex:1">
      <select id="inv-status-filter" onchange="reviewFilterInv()">
        <option value="">All Statuses</option>
        <option>Pending</option>
        <option>Approved</option>
        <option>Locked</option>
        <option>Flagged</option>
      </select>
      <select id="inv-flag-filter" onchange="reviewFilterInv()">
        <option value="">All</option>
        <option value="flags">Has Flags Only</option>
        <option value="clean">Clean Only</option>
      </select>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <table id="weekly-inv-table">
        <thead>
          <tr>
            <th style="width:32px"></th>
            <th>Invoice</th><th>Date</th><th>Customer</th><th>Price Level</th>
            <th style="text-align:right">Billed</th>
            <th style="text-align:right">Expected</th>
            <th style="text-align:right">Δ Delta</th>
            <th>Flags</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody id="weekly-inv-body">${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="font-weight:700">Totals (${WEEKLY_INVOICES.length} invoices)</td>
            <td style="text-align:right;font-weight:700">${fmt$(WEEKLY_INVOICES.reduce((s,i)=>s+invTotal(i),0))}</td>
            <td style="text-align:right;font-weight:700">${fmt$(WEEKLY_INVOICES.reduce((s,i)=>s+expectedTotal(i),0))}</td>
            <td style="text-align:right;font-weight:700;color:var(--red)">
              ${fmt$(WEEKLY_INVOICES.reduce((s,i)=>s+(invTotal(i)-expectedTotal(i)),0))}
            </td>
            <td colspan="3"></td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="info-box mt-16">
      🏷️ <strong>How flags work:</strong> Each invoice line is compared against the customer's assigned price level.
      Rows highlighted in yellow have at least one billed price that deviates from the expected level price.
      Use <em>Adjust to Expected</em> to auto-correct, or manually edit in the detail panel.
    </div>
    ${reviewScripts()}
  `;
}

/* ─── Invoice Line-Level Detail Panel ─── */
function invDetailPanel(inv, idx) {
  const lineRows = inv.lines.map((l, li) => {
    const diff = l.billedPrice - l.expectedPrice;
    const lineTotal = l.billedPrice * l.qty;
    const isFlagged = Math.abs(diff) > 0.005;
    return `
      <tr style="${isFlagged ? 'background:var(--yellow-bg)' : ''}">
        <td>${l.sku}</td>
        <td>${l.product}</td>
        <td style="text-align:center">${l.qty}</td>
        <td style="text-align:right">
          ${inv.locked
            ? fmt$(l.billedPrice)
            : `<input class="inline-input" id="price-${idx}-${li}" type="number" value="${l.billedPrice.toFixed(2)}"
                style="width:80px;text-align:right;padding:4px 6px;border:1.5px solid ${isFlagged ? 'var(--orange)' : 'var(--border)'};border-radius:4px;font-size:12px"
                oninput="reviewRecalcLine(${idx},${li})">`
          }
        </td>
        <td style="text-align:right;color:${isFlagged ? 'var(--primary)' : 'var(--text-light)'}">
          ${fmt$(l.expectedPrice)}
          ${isFlagged ? `<br><span style="font-size:10px;color:var(--text-light)">(${inv.priceLevel})</span>` : ''}
        </td>
        <td style="text-align:right">
          ${isFlagged
            ? `<span style="color:var(--red);font-weight:700">${diff > 0 ? '+' : ''}${fmt$(diff)}</span>`
            : `<span style="color:var(--green)">✓</span>`
          }
        </td>
        <td style="text-align:right;font-weight:600" id="linetotal-${idx}-${li}">${fmt$(lineTotal)}</td>
        <td>
          ${isFlagged && !inv.locked
            ? `<button class="btn-outline btn-sm" style="font-size:11px" onclick="reviewAdjustLine(${idx},${li})">Use Expected</button>`
            : ''
          }
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div style="background:#f8fafc;border-top:2px solid var(--border);padding:16px 24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <strong style="font-size:14px">📄 ${inv.id} — Line Items</strong>
          <span class="text-light" style="font-size:12px;margin-left:12px">${inv.customer} · ${inv.priceLevel}</span>
          ${inv.locked ? '<span class="badge badge-dark" style="margin-left:8px">🔒 LOCKED — read only</span>' : ''}
        </div>
        <div style="display:flex;gap:8px">
          ${!inv.locked ? `<button class="btn-warning btn-sm" onclick="reviewAdjustAllLines(${idx})">✏ Adjust All to Expected</button>` : ''}
          <button class="btn-ghost btn-sm" onclick="reviewCollapseInv(${idx})">✕ Close</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>SKU</th><th>Product</th><th style="text-align:center">Qty</th>
            <th style="text-align:right">Billed Price</th>
            <th style="text-align:right">Expected Price</th>
            <th style="text-align:right">Δ/Unit</th>
            <th style="text-align:right">Line Total</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="detail-lines-${idx}">${lineRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="6" style="font-weight:700">Invoice Total</td>
            <td style="text-align:right;font-weight:700" id="inv-detail-total-${idx}">${fmt$(invTotal(inv))}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
      ${!inv.locked ? `
        <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">
          <button class="btn-outline btn-sm" onclick="reviewCollapseInv(${idx})">Cancel</button>
          <button class="btn-primary btn-sm" onclick="reviewSaveInvChanges(${idx})">💾 Save Adjustments</button>
          <button class="btn-success btn-sm" onclick="reviewApproveInv(${idx});reviewCollapseInv(${idx})">✓ Save &amp; Approve</button>
          <button class="btn-outline btn-sm" style="color:var(--text-light)" onclick="reviewLockInv(${idx});reviewCollapseInv(${idx})">🔒 Save &amp; Lock</button>
        </div>
      ` : ''}
    </div>
  `;
}

/* ─── Monthly Statement Review ─── */
function monthlyTab() {
  const rows = MONTHLY_STATEMENTS.map((s, idx) => {
    const diff = s.statementBalance - s.expectedBalance;
    const rowStyle = (s.pricingFlags > 0 && !s.locked) ? 'background:var(--yellow-bg)' : '';
    return `
      <tr style="${rowStyle}" id="stmt-row-${idx}">
        <td style="width:32px">
          <input type="checkbox" class="stmt-select" data-idx="${idx}" onchange="reviewBulkCheckStmt()">
        </td>
        <td><strong>${s.id}</strong></td>
        <td>${s.period}</td>
        <td>
          ${s.customer}<br>
          <span class="text-light" style="font-size:11px">${s.customerCode}</span>
        </td>
        <td>
          <span class="badge badge-blue" style="font-size:10px">${s.priceLevel}</span><br>
          <span style="font-size:10px;color:var(--text-light)">Tier ${s.creditTier}</span>
        </td>
        <td style="text-align:center">${s.invoiceCount}</td>
        <td style="text-align:right">${fmt$(s.invoiceTotal)}</td>
        <td style="text-align:right">${fmt$(s.paymentsReceived)}</td>
        <td style="text-align:right">${fmt$(s.expectedBalance)}</td>
        <td id="stmt-bal-${idx}" style="text-align:right">
          ${diff === 0
            ? fmt$(s.statementBalance)
            : `<span style="color:var(--red);font-weight:700">${fmt$(s.statementBalance)}</span>`
          }
        </td>
        <td id="stmt-diff-${idx}" style="text-align:right">
          ${diff === 0
            ? '<span style="color:var(--green)">—</span>'
            : `<span style="color:var(--red);font-weight:700">${diff > 0 ? '+' : ''}${fmt$(diff)}</span>`
          }
        </td>
        <td id="stmt-flags-${idx}">${flagBadge(s.pricingFlags)}</td>
        <td id="stmt-status-${idx}">${statusBadge(s.status, s.locked)}</td>
        <td id="stmt-actions-${idx}">
          <div style="display:flex;gap:4px;flex-wrap:wrap">
            <button class="btn-outline btn-sm" onclick="reviewExpandStmt(${idx})">🔍 Review</button>
            ${!s.locked && s.status !== 'approved' ? `
              <button class="btn-success btn-sm" onclick="reviewApproveStmt(${idx})">✓ Approve</button>
            ` : ''}
            ${!s.locked ? `
              <button class="btn-outline btn-sm" style="color:var(--text-light)" onclick="reviewLockStmt(${idx})">🔒 Lock</button>
            ` : `
              <button class="btn-outline btn-sm" style="color:var(--orange)" onclick="reviewUnlockStmt(${idx})">🔓 Unlock</button>
            `}
          </div>
        </td>
      </tr>
      <tr id="stmt-detail-${idx}" style="display:none">
        <td colspan="14" style="padding:0">
          ${stmtDetailPanel(s, idx)}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <!-- Bulk Actions Bar -->
    <div class="card" style="padding:12px 16px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
          <input type="checkbox" id="stmt-select-all" onchange="reviewSelectAllStmt(this.checked)"> Select All Open
        </label>
        <span style="color:var(--border)">|</span>
        <span class="text-light text-sm" id="stmt-selected-count">0 selected</span>
        <span style="color:var(--border)">|</span>
        <strong style="font-size:12px;color:var(--text-light);text-transform:uppercase;letter-spacing:.5px">Bulk Actions:</strong>
        <button class="btn-success btn-sm" onclick="reviewBulkApproveStmt()">✓ Approve Selected</button>
        <button class="btn-outline btn-sm" onclick="reviewBulkLockStmt()">🔒 Lock Selected</button>
        <button class="btn-warning btn-sm" onclick="reviewBulkAdjustStmt()">✏ Adjust Balances</button>
        <button class="btn-outline btn-sm" style="color:var(--red)" onclick="reviewBulkFlagStmt()">🚨 Send for Review</button>
      </div>
    </div>

    <!-- Filter -->
    <div class="search-bar" style="margin-bottom:12px">
      <input placeholder="Search statements…" id="stmt-search" oninput="reviewFilterStmt()" style="flex:1">
      <select id="stmt-status-filter" onchange="reviewFilterStmt()">
        <option value="">All Statuses</option>
        <option>Pending</option>
        <option>Approved</option>
        <option>Locked</option>
      </select>
      <select id="stmt-flag-filter" onchange="reviewFilterStmt()">
        <option value="">All</option>
        <option value="flags">Has Flags</option>
        <option value="diff">Balance Mismatch</option>
        <option value="clean">Clean</option>
      </select>
    </div>

    <div class="card" style="padding:0;overflow:hidden">
      <table id="monthly-stmt-table">
        <thead>
          <tr>
            <th style="width:32px"></th>
            <th>Statement</th><th>Period</th><th>Customer</th><th>Level / Tier</th>
            <th style="text-align:center"># Inv</th>
            <th style="text-align:right">Inv Total</th>
            <th style="text-align:right">Payments</th>
            <th style="text-align:right">Expected Bal</th>
            <th style="text-align:right">Stmt Bal</th>
            <th style="text-align:right">Δ Diff</th>
            <th>Pricing Flags</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody id="monthly-stmt-body">${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="6" style="font-weight:700">Totals (${MONTHLY_STATEMENTS.length} statements)</td>
            <td style="text-align:right;font-weight:700">${fmt$(MONTHLY_STATEMENTS.reduce((s,r)=>s+r.invoiceTotal,0))}</td>
            <td style="text-align:right;font-weight:700">${fmt$(MONTHLY_STATEMENTS.reduce((s,r)=>s+r.paymentsReceived,0))}</td>
            <td style="text-align:right;font-weight:700">${fmt$(MONTHLY_STATEMENTS.reduce((s,r)=>s+r.expectedBalance,0))}</td>
            <td style="text-align:right;font-weight:700">${fmt$(MONTHLY_STATEMENTS.reduce((s,r)=>s+r.statementBalance,0))}</td>
            <td style="text-align:right;font-weight:700;color:var(--red)">
              ${fmt$(MONTHLY_STATEMENTS.reduce((s,r)=>s+(r.statementBalance-r.expectedBalance),0))}
            </td>
            <td colspan="3"></td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div class="info-box mt-16">
      📑 <strong>Statement flags</strong> are raised when a customer's monthly statement balance differs from the
      expected balance (invoices − payments), or when individual invoice lines within the period had pricing-level
      discrepancies. Approve to confirm, or Lock to finalize. Locked statements cannot be edited.
    </div>
  `;
}

/* ─── Statement Detail Panel ─── */
function stmtDetailPanel(s, idx) {
  const diff = s.statementBalance - s.expectedBalance;
  return `
    <div style="background:#f8fafc;border-top:2px solid var(--border);padding:16px 24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div>
          <strong style="font-size:14px">📑 ${s.id} — ${s.customer}</strong>
          <span class="text-light" style="font-size:12px;margin-left:12px">${s.period} · ${s.priceLevel} · Credit Tier ${s.creditTier}</span>
          ${s.locked ? '<span class="badge badge-dark" style="margin-left:8px">🔒 LOCKED — read only</span>' : ''}
        </div>
        <button class="btn-ghost btn-sm" onclick="reviewCollapseStmt(${idx})">✕ Close</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px">
        <div style="background:white;border:1px solid var(--border);border-radius:8px;padding:14px">
          <div style="font-size:11px;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:.5px">Invoice Total</div>
          <div style="font-size:22px;font-weight:700;color:var(--text)">${fmt$(s.invoiceTotal)}</div>
          <div style="font-size:11px;color:var(--text-light)">${s.invoiceCount} invoices</div>
        </div>
        <div style="background:white;border:1px solid var(--border);border-radius:8px;padding:14px">
          <div style="font-size:11px;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:.5px">Payments Received</div>
          <div style="font-size:22px;font-weight:700;color:var(--green)">${fmt$(s.paymentsReceived)}</div>
        </div>
        <div style="background:white;border:1px solid ${diff !== 0 ? 'var(--orange)' : 'var(--border)'};border-radius:8px;padding:14px">
          <div style="font-size:11px;font-weight:600;color:var(--text-light);text-transform:uppercase;letter-spacing:.5px">Balance</div>
          <div style="font-size:22px;font-weight:700;color:${diff !== 0 ? 'var(--red)' : 'var(--green)'}">
            ${fmt$(s.statementBalance)}
          </div>
          <div style="font-size:11px;color:${diff !== 0 ? 'var(--red)' : 'var(--green)'}">
            ${diff !== 0 ? `Expected ${fmt$(s.expectedBalance)} · Δ ${diff > 0 ? '+' : ''}${fmt$(diff)}` : '✓ Matches expected balance'}
          </div>
        </div>
      </div>

      <!-- Flag breakdown -->
      ${s.pricingFlags > 0 ? `
        <div class="warn-box" style="margin-bottom:12px">
          🚨 <strong>${s.pricingFlags} pricing discrepanc${s.pricingFlags === 1 ? 'y' : 'ies'} detected</strong>
          on invoices in this period. Customer is on <strong>${s.priceLevel}</strong> — some invoice lines were billed
          at a different rate. Review individual invoices for details.
        </div>
      ` : `<div class="success-box" style="margin-bottom:12px">✓ No pricing discrepancies found on this customer's invoices for this period.</div>`}

      <!-- Notes + Manual Adjustment -->
      ${!s.locked ? `
        <div style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:flex-end">
          <div class="form-group" style="margin-bottom:0">
            <label>Notes / Reason for Adjustment</label>
            <input id="stmt-notes-${idx}" type="text" value="${s.notes}" placeholder="e.g. Verified with sales rep — price override approved"
              style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:6px;font-size:13px">
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label>Adjusted Balance</label>
            <input id="stmt-adj-${idx}" type="number" value="${s.statementBalance.toFixed(2)}"
              style="width:140px;padding:9px 12px;border:1.5px solid var(--border);border-radius:6px;font-size:13px;text-align:right">
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;justify-content:flex-end">
          <button class="btn-outline btn-sm" onclick="reviewCollapseStmt(${idx})">Cancel</button>
          <button class="btn-primary btn-sm" onclick="reviewSaveStmtChanges(${idx})">💾 Save Changes</button>
          <button class="btn-success btn-sm" onclick="reviewApproveStmt(${idx});reviewCollapseStmt(${idx})">✓ Save &amp; Approve</button>
          <button class="btn-outline btn-sm" style="color:var(--text-light)" onclick="reviewLockStmt(${idx});reviewCollapseStmt(${idx})">🔒 Save &amp; Lock</button>
        </div>
      ` : `<div class="info-box">🔒 This statement is locked. Unlock to make changes.</div>`}
    </div>
  `;
}

/* ─── Client-side Scripts ─── */
function reviewScripts() {
  return ''; // all interactive functions registered at module load (window.review*)
}
