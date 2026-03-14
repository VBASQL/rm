const ExcelJS = require('exceljs');
const path = require('path');

const workbook = new ExcelJS.Workbook();
workbook.creator = 'Wholesale ERP';
workbook.created = new Date();

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const BRAND_DARK   = '1A3C5E';  // dark navy
const BRAND_MID    = '2563A8';  // strong blue
const BRAND_LIGHT  = 'D6E4F7';  // pale blue fill
const ACCENT_GREEN = '1E7A3A';  // money green
const GREY_ROW     = 'F5F7FA';
const WHITE        = 'FFFFFF';
const GOLD         = 'C9960C';

function cell(ws, row, col) { return ws.getCell(row, col); }

function applyBorder(c, style = 'thin', color = 'CCCCCC') {
  const b = { style, color: { argb: color } };
  c.border = { top: b, left: b, bottom: b, right: b };
}

function headerCell(c, text, bgHex, fgHex = WHITE, sz = 12, bold = true) {
  c.value = text;
  c.font  = { bold, size: sz, color: { argb: fgHex }, name: 'Calibri' };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } };
  c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  applyBorder(c, 'thin', '999999');
}

function dataCell(c, text, bgHex = WHITE, bold = false, align = 'left', color = '1A1A1A', sz = 11) {
  c.value = text;
  c.font  = { bold, size: sz, color: { argb: color }, name: 'Calibri' };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } };
  c.alignment = { vertical: 'middle', horizontal: align, wrapText: true };
  applyBorder(c, 'thin', 'DDDDDD');
}

function priceCell(c, text, bgHex = WHITE, bold = false, color = ACCENT_GREEN) {
  c.value = text;
  c.font  = { bold, size: 11, color: { argb: color }, name: 'Calibri' };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } };
  c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  applyBorder(c, 'thin', 'DDDDDD');
}

function sectionHeader(ws, row, fromCol, toCol, text, bgHex = BRAND_DARK) {
  ws.mergeCells(row, fromCol, row, toCol);
  const c = ws.getCell(row, fromCol);
  c.value = text;
  c.font  = { bold: true, size: 13, color: { argb: WHITE }, name: 'Calibri' };
  c.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgHex } };
  c.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  ws.getRow(row).height = 28;
  applyBorder(c, 'medium', '888888');
}

// ─────────────────────────────────────────────
// SHEET 1 — BASE PRICING
// ─────────────────────────────────────────────
const s1 = workbook.addWorksheet('Base Pricing', {
  pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true }
});

s1.views = [{ showGridLines: false }];

// Column widths
s1.columns = [
  { width: 3 },   // A  spacer
  { width: 32 },  // B  Item / Feature
  { width: 22 },  // C  Option A: On-Premises
  { width: 22 },  // D  Option B: Hybrid
  { width: 22 },  // E  Option C: Cloud
  { width: 3 },   // F  spacer
];

// ── Title banner ──────────────────────────────
s1.mergeCells('B1:E1');
const title = s1.getCell('B1');
title.value  = 'WHOLESALE ERP — BASE PACKAGE PRICING';
title.font   = { bold: true, size: 16, color: { argb: WHITE }, name: 'Calibri' };
title.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_DARK } };
title.alignment = { vertical: 'middle', horizontal: 'center' };
s1.getRow(1).height = 38;

// ── Sub-title ─────────────────────────────────
s1.mergeCells('B2:E2');
const sub = s1.getCell('B2');
sub.value = 'Prepared March 5, 2026  |  All prices in USD';
sub.font  = { italic: true, size: 10, color: { argb: '555555' }, name: 'Calibri' };
sub.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_LIGHT } };
sub.alignment = { vertical: 'middle', horizontal: 'center' };
s1.getRow(2).height = 20;

s1.getRow(3).height = 8; // spacer row

// ── Option headers ────────────────────────────
s1.getRow(4).height = 52;
dataCell(s1.getCell('B4'), '', WHITE);
headerCell(s1.getCell('C4'), '🏢  Option A\nFull On-Premises\n(web + DB on your server)', 'B34700');
headerCell(s1.getCell('D4'), '☁️  Option B\nHybrid\n(web on cloud · DB on-prem)', BRAND_MID);
headerCell(s1.getCell('E4'), '☁️  Option C\nFully Cloud\n(web + DB in the cloud)', '1A6B38');

// ── Section: Software ─────────────────────────
sectionHeader(s1, 5, 2, 5, '  SOFTWARE BUILD');
s1.getRow(5).height = 26;

const softwareRows = [
  ['Application build — complete ERP system', '$7,500', '$7,500', '$7,500'],
  ['Includes 5 hours staff training',          '✅', '✅', '✅'],
  ['1 month post-launch support',              '✅', '✅', '✅'],
  ['After first month: ongoing support',       '$85 / hour', '$85 / hour', '$85 / hour'],
  ['Payment schedule',                         '3 milestones (no upfront)', '3 milestones (no upfront)', '3 milestones (no upfront)'],
];

let r = 6;
softwareRows.forEach(([item, a, b, c], i) => {
  const bg = i % 2 === 0 ? WHITE : GREY_ROW;
  s1.getRow(r).height = 22;
  dataCell(s1.getCell(r, 2), item, bg);
  priceCell(s1.getCell(r, 3), a, bg, item.startsWith('Application'));
  priceCell(s1.getCell(r, 4), b, bg, item.startsWith('Application'));
  priceCell(s1.getCell(r, 5), c, bg, item.startsWith('Application'));
  r++;
});

// ── Section: Server Setup ─────────────────────
sectionHeader(s1, r, 2, 5, '  SERVER SETUP  (billed at deployment)');
s1.getRow(r).height = 26; r++;

const serverRows = [
  ['Server setup fee',                'One-time: $2,500', 'Varies by provider', 'Included in package'],
  ['Web server location',             'Your building',    'Cloud (provider of choice)', 'Cloud (provider of choice)'],
  ['Database server location',        'Your building',    'Your building',    'Cloud (provider of choice)'],
  ['Monthly server cost',             'None (own hardware)', '$20–$80/month',  '$50–$150/month'],
  ['Hardware purchase (if needed)',   'Your cost',        'DB server — your cost', 'None'],
  ['IT maintenance responsibility',   'You',              'Cloud layer — provider\nDB layer — you', 'Provider'],
];

serverRows.forEach(([item, a, b, c], i) => {
  const bg = i % 2 === 0 ? WHITE : GREY_ROW;
  s1.getRow(r).height = 22;
  dataCell(s1.getCell(r, 2), item, bg);
  dataCell(s1.getCell(r, 3), a, bg, false, 'center', item === 'Server setup fee' ? ACCENT_GREEN : '1A1A1A');
  dataCell(s1.getCell(r, 4), b, bg, false, 'center', item === 'Server setup fee' ? ACCENT_GREEN : '1A1A1A');
  dataCell(s1.getCell(r, 5), c, bg, false, 'center', item === 'Server setup fee' ? ACCENT_GREEN : '1A1A1A');
  r++;
});

// ── Section: Total ────────────────────────────
sectionHeader(s1, r, 2, 5, '  ESTIMATED TOTAL (software + setup, excl. optional add-ons)');
s1.getRow(r).height = 26; r++;

s1.getRow(r).height = 30;
dataCell(s1.getCell(r, 2), 'One-time Total', BRAND_LIGHT, true);
priceCell(s1.getCell(r, 3), '$10,000', BRAND_LIGHT, true, 'B34700');
priceCell(s1.getCell(r, 4), '$7,500 + setup', BRAND_LIGHT, true, BRAND_MID);
priceCell(s1.getCell(r, 5), '$10,000 flat\n(all-in package)', BRAND_LIGHT, true, ACCENT_GREEN);
s1.getRow(r).height = 30; r++;

s1.getRow(r).height = 22;
dataCell(s1.getCell(r, 2), 'Recurring Monthly', GREY_ROW, true);
priceCell(s1.getCell(r, 3), 'None', GREY_ROW, false, '555555');
priceCell(s1.getCell(r, 4), '~$20–$80 (cloud)\n+ DB hardware/power', GREY_ROW, false, '555555');
priceCell(s1.getCell(r, 5), '~$50–$150 (cloud hosting)', GREY_ROW, false, '555555');
r++;

// ── Section: Payment Milestones ───────────────
s1.getRow(r).height = 8; r++; // spacer
sectionHeader(s1, r, 2, 5, '  PAYMENT MILESTONES  (no money upfront)');
s1.getRow(r).height = 26; r++;

const milestones = [
  ['Milestone 1 — Development complete', '40% — $3,000', 'Full working demo you test yourself'],
  ['Milestone 2 — Server deployment',    '30% — $2,250', 'System installed, running, accessible'],
  ['Milestone 3 — Go-live',              '30% — $2,250', 'Staff trained (5 hrs), system live'],
];
milestones.forEach(([ms, pct, desc], i) => {
  const bg = i % 2 === 0 ? WHITE : GREY_ROW;
  s1.getRow(r).height = 22;
  s1.mergeCells(r, 3, r, 4);
  dataCell(s1.getCell(r, 2), ms, bg, true);
  priceCell(s1.getCell(r, 3), pct, bg, true, GOLD);
  dataCell(s1.getCell(r, 5), desc, bg, false, 'left', '444444', 10);
  r++;
});

// ─────────────────────────────────────────────
// SHEET 2 — OPTIONAL ADD-ONS
// ─────────────────────────────────────────────
const s2 = workbook.addWorksheet('Optional Add-Ons', {
  pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true }
});
s2.views = [{ showGridLines: false }];

s2.columns = [
  { width: 3 },   // A spacer
  { width: 8 },   // B code
  { width: 36 },  // C name
  { width: 18 },  // D price
  { width: 18 },  // E timeline
  { width: 40 },  // F notes
  { width: 3 },   // G spacer
];

// Title
s2.mergeCells('B1:F1');
const t2 = s2.getCell('B1');
t2.value = 'WHOLESALE ERP — OPTIONAL ADD-ONS';
t2.font  = { bold: true, size: 16, color: { argb: WHITE }, name: 'Calibri' };
t2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_DARK } };
t2.alignment = { vertical: 'middle', horizontal: 'center' };
s2.getRow(1).height = 38;

s2.mergeCells('B2:F2');
const sub2 = s2.getCell('B2');
sub2.value = 'Each add-on can be included now or added later — building during the initial build is cheaper.';
sub2.font  = { italic: true, size: 10, color: { argb: '555555' }, name: 'Calibri' };
sub2.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_LIGHT } };
sub2.alignment = { vertical: 'middle', horizontal: 'center' };
s2.getRow(2).height = 20;

s2.getRow(3).height = 8;

// Column headers
s2.getRow(4).height = 26;
[
  [2, '#', BRAND_MID],
  [3, 'Add-On Description', BRAND_MID],
  [4, 'Price', BRAND_MID],
  [5, 'Build Time', BRAND_MID],
  [6, 'Notes / Requirements', BRAND_MID],
].forEach(([col, text, bg]) => headerCell(s2.getCell(4, col), text, bg));

const addons = [
  ['OPT-1',  'Digital Pick on Handheld',              '+$1,200',      '+2–3 days',  ''],
  ['OPT-2',  'AI Pick Sheet OCR',                     '+$1,500',      '+3–4 days',  'Requires OpenAI API key (~$0.01–0.05/photo)'],
  ['OPT-3',  'Voice Ordering',                        '+$1,500',      '+3–4 days',  'Requires OpenAI API key'],
  ['OPT-4',  'SMS Notifications (Twilio)',             '+$800',        '+1–2 days',  'Requires Twilio account (~$0.01–0.02/msg)'],
  ['OPT-5',  'WhatsApp Notifications',                '+$1,000',      '+2–3 days',  'Requires WhatsApp Business API account'],
  ['OPT-6a', 'Customer Credit Scoring',               '+$800',        '+2–3 days',  ''],
  ['OPT-6b', 'Salesperson Performance Scoring',       '+$400',        '+1–2 days',  ''],
  ['OPT-7',  'Customer Self-Service Portal',          '+$2,500',      '+3–5 days',  ''],
  ['OPT-8',  'Customer-Facing Ordering Website',      'TBD',          'TBD',        'Requires OPT-7. Scoped separately.'],
  ['OPT-9',  'Full Private Network Lockdown (VPN)',   '+$1,500',      '+2–3 days',  'Hybrid: reduced to ~$800–$1,000'],
  ['OPT-10', 'SSO + Multi-Factor Authentication',     '+$400',        '+2–3 days',  'Requires Microsoft 365 or Google Workspace'],
  ['OPT-12', 'Truck-Specific Navigation',             '+$600',        '+1–2 days',  '~$100–150/year/device (Sygic license)'],
  ['OPT-13', 'Multi-Company / Multi-Tenant',         '+$1,800',      '+3–4 days',  'Much cheaper to build in from the start'],
  ['OPT-14', 'Additional Training Hours',             '+$85 / hour',  'As needed',  'Beyond 5 hours included in base'],
  ['OPT-15', 'Temp Cloud Backup',                     '+$800',        '+1–2 days',  '~$30–60/month. Hybrid: ~$300–500'],
  ['OPT-16', 'AI-Powered Reports',                    '+$2,000',      '+4–5 days',  'Requires OpenAI API key (~$0.01–0.10/query)'],
  ['OPT-17', 'Backup / Failover Server',              '+$1,000–$2,000', '+2–3 days','On-prem: $1,500–2,000. Cloud: $800–1,200'],
];

let r2 = 5;
addons.forEach(([code, name, price, time, notes], i) => {
  const bg = i % 2 === 0 ? WHITE : GREY_ROW;
  s2.getRow(r2).height = 22;
  dataCell(s2.getCell(r2, 2), code, bg, true, 'center', BRAND_DARK, 10);
  dataCell(s2.getCell(r2, 3), name, bg);
  priceCell(s2.getCell(r2, 4), price, bg, true);
  dataCell(s2.getCell(r2, 5), time, bg, false, 'center', '555555', 10);
  dataCell(s2.getCell(r2, 6), notes, bg, false, 'left', '666666', 10);
  r2++;
});

// Total row
s2.getRow(r2).height = 26;
s2.mergeCells(r2, 2, r2, 3);
dataCell(s2.getCell(r2, 2), 'MAX POSSIBLE ADD-ONS (excl. TBD, hourly, range midpoints)', BRAND_LIGHT, true);
priceCell(s2.getCell(r2, 4), '~$18,100', BRAND_LIGHT, true, BRAND_DARK);
dataCell(s2.getCell(r2, 5), '', BRAND_LIGHT);
dataCell(s2.getCell(r2, 6), 'If all fixed-price add-ons selected', BRAND_LIGHT, false, 'left', '555555', 10);

// ─────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────
const outPath = path.join(__dirname, 'WholesaleERP_Pricing.xlsx');
workbook.xlsx.writeFile(outPath).then(() => {
  console.log('✅  Created:', outPath);
}).catch(err => {
  console.error('❌  Error:', err);
});
