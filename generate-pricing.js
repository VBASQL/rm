const ExcelJS = require('exceljs');
const path = require('path');

const workbook = new ExcelJS.Workbook();
workbook.creator = 'Wholesale ERP';
workbook.created = new Date();

// ─── COLORS ───────────────────────────────────────────────────────────────────
const C = {
  darkNavy:    '1A2B4A',
  midBlue:     '2563EB',
  lightBlue:   'DBEAFE',
  accentGold:  'F59E0B',
  accentGoldL: 'FEF3C7',
  green:       '16A34A',
  greenLight:  'DCFCE7',
  purple:      '7C3AED',
  purpleLight: 'EDE9FE',
  teal:        '0D9488',
  tealLight:   'CCFBF1',
  white:       'FFFFFF',
  offWhite:    'F8FAFC',
  lightGray:   'E2E8F0',
  midGray:     '94A3B8',
  darkGray:    '334155',
  red:         'DC2626',
  rowAlt:      'F1F5F9',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fill(hex) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + hex } };
}
function font(opts = {}) {
  return { name: 'Calibri', size: opts.size || 11, bold: !!opts.bold, color: { argb: 'FF' + (opts.color || '000000') }, italic: !!opts.italic };
}
function border(style = 'thin', color = 'CBD5E1') {
  const s = { style, color: { argb: 'FF' + color } };
  return { top: s, left: s, bottom: s, right: s };
}
function align(h = 'left', v = 'middle', wrap = false) {
  return { horizontal: h, vertical: v, wrapText: wrap };
}
function currency(val) {
  return typeof val === 'number' ? val : null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHEET 1 — BASIC PRICING (3 BUNDLES)
// ─────────────────────────────────────────────────────────────────────────────
const ws1 = workbook.addWorksheet('Basic Pricing', {
  pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  views: [{ showGridLines: false }],
});

ws1.columns = [
  { key: 'item',    width: 40 },
  { key: 'onprem',  width: 22 },
  { key: 'cloud',   width: 22 },
  { key: 'hybrid',  width: 22 },
  { key: 'notes',   width: 38 },
];

// ── Title banner ──
ws1.mergeCells('A1:E1');
const title1 = ws1.getCell('A1');
title1.value = 'WHOLESALE ERP — PRICING PACKAGES';
title1.font = font({ size: 18, bold: true, color: C.white });
title1.fill = fill(C.darkNavy);
title1.alignment = align('center', 'middle');
ws1.getRow(1).height = 42;

// ── Subtitle ──
ws1.mergeCells('A2:E2');
const sub1 = ws1.getCell('A2');
sub1.value = 'Custom Order-to-Cash Platform for Wholesale Food Distribution  ·  Prepared March 5, 2026  ·  10 Hours Training Included';
sub1.font = font({ size: 10, color: C.white, italic: true });
sub1.fill = fill(C.midBlue);
sub1.alignment = align('center', 'middle');
ws1.getRow(2).height = 22;

// ── Spacer ──
ws1.getRow(3).height = 8;

// ── Column headers ──
const hdrRow = ws1.getRow(4);
hdrRow.height = 32;
const hdrs = ['', 'Option A\nFull On-Premises', 'Option C\nFull Cloud', 'Option B\nHybrid (DB on-prem, Web on cloud)', 'Notes'];
hdrs.forEach((h, i) => {
  const col = ['A','B','C','D','E'][i];
  const cell = ws1.getCell(`${col}4`);
  cell.value = h;
  cell.font = font({ bold: true, size: 11, color: C.white });
  cell.fill = fill(C.darkGray);
  cell.alignment = align('center', 'middle', true);
  cell.border = border('medium', C.darkNavy);
});

// ── Section helper ──
let r = 5;

function sectionHeader(label) {
  ws1.mergeCells(`A${r}:E${r}`);
  const cell = ws1.getCell(`A${r}`);
  cell.value = label.toUpperCase();
  cell.font = font({ bold: true, size: 10, color: C.white });
  cell.fill = fill(C.midBlue);
  cell.alignment = align('left', 'middle');
  cell.border = border('thin', C.midBlue);
  ws1.getRow(r).height = 20;
  r++;
}

function dataRow(label, onprem, cloud, hybrid, notes = '', highlight = false) {
  const row = ws1.getRow(r);
  row.height = 20;
  const bg = highlight ? C.accentGoldL : (r % 2 === 0 ? C.rowAlt : C.white);

  const cells = [
    { col: 'A', val: label, al: align('left', 'middle', true) },
    { col: 'B', val: onprem, al: align('center', 'middle') },
    { col: 'C', val: cloud,  al: align('center', 'middle') },
    { col: 'D', val: hybrid, al: align('center', 'middle') },
    { col: 'E', val: notes,  al: align('left', 'middle', true) },
  ];

  cells.forEach(({ col, val, al }) => {
    const cell = ws1.getCell(`${col}${r}`);
    cell.value = val;
    cell.font = font({ size: 10, color: C.darkGray });
    cell.fill = fill(bg);
    cell.alignment = al;
    cell.border = border('thin', 'CBD5E1');
    if (col !== 'A' && col !== 'E' && typeof val === 'number') {
      cell.numFmt = '"$"#,##0';
    }
  });
  r++;
}

function totalRow(label, onprem, cloud, hybrid) {
  const row = ws1.getRow(r);
  row.height = 26;
  const cols = ['A','B','C','D'];
  const vals = [label, onprem, cloud, hybrid];
  cols.forEach((col, i) => {
    const cell = ws1.getCell(`${col}${r}`);
    cell.value = vals[i];
    cell.font = font({ bold: true, size: 12, color: C.white });
    cell.fill = fill(C.darkNavy);
    cell.alignment = align(col === 'A' ? 'left' : 'center', 'middle');
    cell.border = border('medium', C.darkNavy);
    if (col !== 'A' && typeof vals[i] === 'number') {
      cell.numFmt = '"$"#,##0';
    }
  });
  // Notes cell
  const en = ws1.getCell(`E${r}`);
  en.fill = fill(C.darkNavy);
  en.border = border('medium', C.darkNavy);
  r++;
}

function monthlyRow(label, onprem, cloud, hybrid) {
  const row = ws1.getRow(r);
  row.height = 22;
  const cols = ['A','B','C','D'];
  const vals = [label, onprem, cloud, hybrid];
  cols.forEach((col, i) => {
    const cell = ws1.getCell(`${col}${r}`);
    cell.value = vals[i];
    cell.font = font({ bold: true, size: 10, color: C.darkNavy });
    cell.fill = fill(C.accentGoldL);
    cell.alignment = align(col === 'A' ? 'left' : 'center', 'middle');
    cell.border = border('medium', C.accentGold);
  });
  const en = ws1.getCell(`E${r}`);
  en.fill = fill(C.accentGoldL);
  en.border = border('medium', C.accentGold);
  r++;
}

function spacerRow() {
  ws1.getRow(r).height = 6;
  r++;
}

// ─── SOFTWARE BUILD ───────────────────────────────────────────────────────────
sectionHeader('Software Build');
dataRow('Application Development',              8500, 8500, 8500, '', true);
dataRow('  ✔  Salesperson App (mobile + desktop)',    '✔', '✔', '✔');
dataRow('  ✔  Warehouse & Route Planning',            '✔', '✔', '✔');
dataRow('  ✔  Driver App (print, nav, signature)',    '✔', '✔', '✔');
dataRow('  ✔  Full Invoicing & Double-Entry Accounting','✔','✔','✔');
dataRow('  ✔  Report Builder + Pre-built Reports',    '✔', '✔', '✔');
dataRow('  ✔  Admin / Back-End Control Panel',        '✔', '✔', '✔');
dataRow('  ✔  Notification Engine (email)',            '✔', '✔', '✔');
dataRow('  ✔  Audit Trail & Security',                '✔', '✔', '✔');
dataRow('  ✔  10 Hours Staff Training',               '✔', '✔', '✔');
dataRow('  ✔  1 Month Post-Launch Support',           '✔', '✔', '✔');
spacerRow();

// ─── SERVER SETUP ─────────────────────────────────────────────────────────────
sectionHeader('Server Setup & Deployment');
dataRow('Web Server Setup',                     2500, 1000, 1500, 'On-prem: physical machine config\nCloud: provisioned & managed');
dataRow('Database Server Setup',                0, 0, 0, 'Included in all options');
dataRow('SSL / Domain / DNS Configuration',     '✔', '✔', '✔');
dataRow('Security Hardening & Firewall',        '✔', '✔', '✔');
spacerRow();

// ─── SUPPORT ──────────────────────────────────────────────────────────────────
sectionHeader('Ongoing Costs');
dataRow('Post-launch support (after month 1)',  '85/hr', '85/hr', '85/hr', 'Billed in 15-min increments');
dataRow('Cloud hosting (monthly estimate)',     0, '~$50–$150/mo', '~$30–$80/mo', 'Cloud web server only for hybrid');
dataRow('Hardware / power (monthly)',           'Your cost', 0, 'Your cost', 'On-prem DB server for hybrid');
spacerRow();

// ─── TOTALS ───────────────────────────────────────────────────────────────────
totalRow('TOTAL ONE-TIME COST', 11000, 9500, 10000);
monthlyRow('ESTIMATED MONTHLY (ongoing)', 0, 100, 55);

spacerRow();

// ─── PAYMENT MILESTONES ───────────────────────────────────────────────────────
sectionHeader('Payment Milestones (No Upfront Payment)');
dataRow('Milestone 1 — Development Complete (40%)',   3400, 3400, 3400, 'Full working demo — you test every feature');
dataRow('Milestone 2 — Server Deployment (30%)',      2550, 2550, 2550, 'System installed, running, accessible');
dataRow('Milestone 3 — Go-Live (30%)',                2550, 2550, 2550, 'Staff trained (10 hrs), system live with real operations');
spacerRow();

// ─── FOOTNOTE ─────────────────────────────────────────────────────────────────
ws1.mergeCells(`A${r}:E${r}`);
const fn1 = ws1.getCell(`A${r}`);
fn1.value = '* Hybrid monthly estimate assumes a mid-tier VPS (~$30–80/mo). On-premises has no recurring software fee but hardware/power/maintenance is the client\'s responsibility. All estimates in USD.';
fn1.font = font({ size: 9, italic: true, color: C.midGray });
fn1.fill = fill(C.offWhite);
fn1.alignment = align('left', 'middle', true);
ws1.getRow(r).height = 28;


// ─────────────────────────────────────────────────────────────────────────────
//  SHEET 2 — OPTIONAL ADD-ONS
// ─────────────────────────────────────────────────────────────────────────────
const ws2 = workbook.addWorksheet('Optional Add-Ons', {
  pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1 },
  views: [{ showGridLines: false }],
});

ws2.columns = [
  { key: 'code',     width: 10 },
  { key: 'name',     width: 38 },
  { key: 'price',    width: 18 },
  { key: 'timeline', width: 18 },
  { key: 'notes',    width: 48 },
];

// ── Title banner ──
ws2.mergeCells('A1:E1');
const title2 = ws2.getCell('A1');
title2.value = 'WHOLESALE ERP — OPTIONAL ADD-ONS';
title2.font = font({ size: 18, bold: true, color: C.white });
title2.fill = fill(C.darkNavy);
title2.alignment = align('center', 'middle');
ws2.getRow(1).height = 42;

ws2.mergeCells('A2:E2');
const sub2 = ws2.getCell('A2');
sub2.value = 'All add-ons can be included now (cheaper) or retrofitted later  ·  Add-on prices are on top of the base package';
sub2.font = font({ size: 10, color: C.white, italic: true });
sub2.fill = fill(C.midBlue);
sub2.alignment = align('center', 'middle');
ws2.getRow(2).height = 22;

ws2.getRow(3).height = 8;

// ── Column headers ──
const hdrRow2 = ws2.getRow(4);
hdrRow2.height = 28;
['Code', 'Add-On', 'Price (+ Base)', 'Timeline', 'Notes'].forEach((h, i) => {
  const col = ['A','B','C','D','E'][i];
  const cell = ws2.getCell(`${col}4`);
  cell.value = h;
  cell.font = font({ bold: true, size: 11, color: C.white });
  cell.fill = fill(C.darkGray);
  cell.alignment = align('center', 'middle');
  cell.border = border('medium', C.darkNavy);
});

// Category colors
const catColors = {
  'Warehouse':    { bg: C.tealLight,   accent: C.teal   },
  'Communication':{ bg: C.lightBlue,   accent: C.midBlue},
  'Intelligence': { bg: C.purpleLight, accent: C.purple },
  'Customer':     { bg: C.greenLight,  accent: C.green  },
  'Security':     { bg: C.accentGoldL, accent: C.accentGold },
  'Infrastructure':{ bg: 'FEE2E2',     accent: C.red    },
  'Management':   { bg: 'F0FDF4',      accent: C.green  },
};

const addons = [
  // [code, name, price, priceNum, timeline, notes, category]
  ['Warehouse', null, null, null, null, null, null], // section header sentinel
  ['OPT-1',  'Digital Pick on Handheld',      '+$1,200', 1200, '+2–3 days', 'Replaces paper pick with digital handheld workflow', 'Warehouse'],
  ['OPT-2',  'AI Pick Sheet OCR',             '+$1,500', 1500, '+3–4 days', 'Photos paper pick; AI reads handwriting. Requires OpenAI API key (~$0.01–0.05/photo)', 'Warehouse'],

  ['Communication', null, null, null, null, null, null],
  ['OPT-4',  'SMS Notifications (Twilio)',     '+$800',    800, '+1–2 days', 'Adds SMS channel. Requires Twilio account (~$0.01–0.02/msg)', 'Communication'],
  ['OPT-5',  'WhatsApp Notifications',         '+$1,000', 1000, '+2–3 days', 'Adds WhatsApp channel. Requires Meta Business API approval (~$0.01–0.05/msg)', 'Communication'],
  ['OPT-3',  'Voice Ordering',                 '+$1,500', 1500, '+3–4 days', 'Salesperson speaks order naturally; AI maps to catalog. Requires OpenAI API key', 'Communication'],

  ['Intelligence', null, null, null, null, null, null],
  ['OPT-6a', 'Customer Credit Scoring',        '+$800',    800, '+2–3 days', 'Auto credit rating from payment history. Rules & thresholds fully configurable', 'Intelligence'],
  ['OPT-6b', 'Salesperson Performance Scoring','+$400',    400, '+1–2 days', 'Tracks volume, revenue, collection rate. Dashboards & leaderboards', 'Intelligence'],
  ['OPT-16', 'AI-Powered Reports',             '+$2,000', 2000, '+4–5 days', 'Ask questions in plain English; AI generates SQL. Data never leaves your server. Requires OpenAI API key', 'Intelligence'],

  ['Customer', null, null, null, null, null, null],
  ['OPT-7',  'Customer Self-Service Portal',   '+$2,500', 2500, '+3–5 days', 'Customers view balances, invoices, history, make payments. Optional order placement per customer', 'Customer'],
  ['OPT-8',  'Customer-Facing Ordering Website','TBD', null, 'TBD', 'Full branded e-commerce layer. Requires OPT-7. Scoped separately', 'Customer'],

  ['Security', null, null, null, null, null, null],
  ['OPT-9',  'Full Private Network Lockdown (VPN)','+$1,500',1500,'+2–3 days','App invisible to public internet. All devices via VPN tunnel. Hybrid discounted (~$800–$1,000)', 'Security'],
  ['OPT-10', 'SSO + Multi-Factor Authentication',  '+$400',  400, '+2–3 days','Sign in with Microsoft 365 / Google Workspace + MFA. Requires active M365 or Google WS subscription', 'Security'],

  ['Infrastructure', null, null, null, null, null, null],
  ['OPT-12', 'Truck-Specific Navigation',      '+$600',    600, '+1–2 days', 'Sygic Truck / CoPilot — bridges, weight limits, no-truck zones. ~$100–150/year per device', 'Infrastructure'],
  ['OPT-15', 'Temp Cloud Backup',              '+$800',    800, '+1–2 days', 'Cloud fallback when on-prem server is down. ~$30–60/month hosting. Hybrid: ~$300–500', 'Infrastructure'],
  ['OPT-17', 'Backup / Failover Server',       '+$1,000–$2,000', null, '+2–3 days','Automatic standby server. On-prem: ~$1,500–2,000. Cloud: ~$800–1,200', 'Infrastructure'],

  ['Management', null, null, null, null, null, null],
  ['OPT-13', 'Multi-Company / Multi-Tenant',   '+$1,800', 1800, '+3–4 days', 'Multiple companies/divisions, each with own customers, products, accounting. Cheapest to build in from start', 'Management'],
  ['OPT-14', 'Additional Training Hours',      '+$85/hr', null, 'As needed', 'Beyond the 10 included hours. Anytime — new staff, features refresher, advanced training', 'Management'],
];

let r2 = 5;
let rowCount = 0;

addons.forEach((item) => {
  const [code, name, priceStr, priceNum, timeline, notes, category] = item;

  // Section header row
  if (name === null) {
    ws2.mergeCells(`A${r2}:E${r2}`);
    const cell = ws2.getCell(`A${r2}`);
    cell.value = `  ${code.toUpperCase()}`;
    const cc = catColors[code] || { bg: C.lightGray, accent: C.midGray };
    cell.font = font({ bold: true, size: 10, color: C.white });
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + cc.accent } };
    cell.alignment = align('left', 'middle');
    cell.border = border('thin', cc.accent);
    ws2.getRow(r2).height = 20;
    r2++;
    rowCount = 0;
    return;
  }

  const cc = catColors[category] || { bg: C.offWhite, accent: C.midGray };
  const bg = rowCount % 2 === 0 ? cc.bg : C.white;
  const row = ws2.getRow(r2);
  row.height = 22;

  const cells2 = [
    { col: 'A', val: code },
    { col: 'B', val: name },
    { col: 'C', val: priceNum !== null ? priceNum : priceStr },
    { col: 'D', val: timeline },
    { col: 'E', val: notes },
  ];

  cells2.forEach(({ col, val }) => {
    const cell = ws2.getCell(`${col}${r2}`);
    cell.value = val;
    cell.font = font({ size: 10, color: C.darkGray, bold: col === 'A' });
    cell.fill = fill(bg);
    cell.alignment = align(col === 'C' ? 'center' : 'left', 'middle', col === 'E' || col === 'B');
    cell.border = border('thin', 'CBD5E1');
    if (col === 'C' && typeof val === 'number') {
      cell.numFmt = '"+$"#,##0';
    }
  });

  r2++;
  rowCount++;
});

// ── Summary total range ──
r2++;
ws2.mergeCells(`A${r2}:B${r2}`);
ws2.getCell(`A${r2}`).value = 'TOTAL — All Add-Ons (excluding TBD & hourly)';
ws2.getCell(`A${r2}`).font = font({ bold: true, size: 11, color: C.white });
ws2.getCell(`A${r2}`).fill = fill(C.darkNavy);
ws2.getCell(`A${r2}`).alignment = align('left', 'middle');
ws2.getCell(`A${r2}`).border = border('medium', C.darkNavy);

ws2.getCell(`C${r2}`).value = 18900;
ws2.getCell(`C${r2}`).numFmt = '"+$"#,##0';
ws2.getCell(`C${r2}`).font = font({ bold: true, size: 12, color: C.white });
ws2.getCell(`C${r2}`).fill = fill(C.darkNavy);
ws2.getCell(`C${r2}`).alignment = align('center', 'middle');
ws2.getCell(`C${r2}`).border = border('medium', C.darkNavy);

['D','E'].forEach(col => {
  const cell = ws2.getCell(`${col}${r2}`);
  cell.fill = fill(C.darkNavy);
  cell.border = border('medium', C.darkNavy);
});
ws2.getRow(r2).height = 28;


// ─── WRITE FILE ───────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, 'WholesaleERP_Pricing.xlsx');
workbook.xlsx.writeFile(outPath).then(() => {
  console.log('✅  Created:', outPath);
}).catch(err => {
  console.error('❌  Error:', err);
});
