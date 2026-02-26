// ===== WholesaleERP Demo — Core App Framework =====
window.ERP = window.ERP || {};
import { renderLogin } from './pages/login.js';
import { renderSales, salesNav } from './pages/sales.js';
import { renderWarehouse, warehouseNav } from './pages/warehouse.js';
import { renderDriver, driverNav } from './pages/driver.js';
import { renderRoute, routeNav } from './pages/route.js';
import { renderAccounting, accountingNav } from './pages/accounting.js';
import { renderAdmin, adminNav } from './pages/admin.js';
import { renderManager, managerNav } from './pages/manager.js';
import { renderReports, reportsNav } from './pages/reports.js';

// ── ROLES ──
const ROLES = [
  { key: 'login', label: 'Login' },
  { key: 'sales', label: 'Salesperson' },
  { key: 'warehouse', label: 'Warehouse' },
  { key: 'driver', label: 'Driver' },
  { key: 'route', label: 'Route Planner' },
  { key: 'accounting', label: 'Accounting' },
  { key: 'admin', label: 'Admin' },
  { key: 'manager', label: 'Manager' },
  { key: 'reports', label: 'Reports' },
];

const HEADERS = {
  sales: { logo: '📦 WholesaleERP', user: 'Marcus Johnson', initials: 'MJ', notifs: 3 },
  warehouse: { logo: '📦 WholesaleERP', user: 'Rachel Green', initials: 'RG', notifs: 8 },
  driver: { logo: '📦 WholesaleERP', user: 'Mike Roberts', initials: 'MR', notifs: 1 },
  route: { logo: '📦 WholesaleERP', user: 'Steve Kim', initials: 'SK', notifs: 2 },
  accounting: { logo: '📦 WholesaleERP', user: 'Lisa Chen', initials: 'LC', notifs: 5 },
  admin: { logo: '📦 WholesaleERP', user: 'Admin', initials: 'AD', notifs: 0 },
  manager: { logo: '📦 WholesaleERP', user: 'Karen Miller', initials: 'KM', notifs: 4 },
  reports: { logo: '📦 WholesaleERP', user: 'Karen Miller', initials: 'KM', notifs: 0 },
};

const NAVS = {
  sales: salesNav, warehouse: warehouseNav, driver: driverNav, route: routeNav,
  accounting: accountingNav, admin: adminNav, manager: managerNav, reports: reportsNav,
};

const RENDERERS = {
  login: renderLogin, sales: renderSales, warehouse: renderWarehouse, driver: renderDriver,
  route: renderRoute, accounting: renderAccounting, admin: renderAdmin,
  manager: renderManager, reports: renderReports,
};

// ── STATE ──
let currentRole = 'login';
let currentPage = '';

// ── ROUTING ──
function parseHash() {
  const h = location.hash.slice(1) || '/login';
  const parts = h.split('/').filter(Boolean);
  return { role: parts[0] || 'login', page: parts.slice(1).join('/') || 'main' };
}

export function navigate(path) {
  location.hash = path;
}

function onHashChange() {
  const { role, page } = parseHash();
  currentRole = role;
  currentPage = page;
  render();
}

// ── RENDERING ──
function renderRoleBar() {
  return `<div class="role-bar">
    <span>Demo</span>
    ${ROLES.map(r => `<button class="role-btn ${r.key === currentRole ? 'active' : ''}" onclick="window.ERP.switchRole('${r.key}')">${r.label}</button>`).join('')}
  </div>`;
}

function renderHeader(role) {
  const h = HEADERS[role];
  if (!h) return '';
  return `<div class="header">
    <div class="logo">${h.logo}</div>
    <div class="user-info">
      ${h.notifs > 0 ? `<div class="notif-badge">🔔<span class="count">${h.notifs}</span></div>` : ''}
      <span style="font-size:13px">${h.user}</span>
      <div class="avatar">${h.initials}</div>
    </div>
  </div>`;
}

function renderSidebar(role) {
  const navFn = NAVS[role];
  if (!navFn) return '';
  const items = navFn();
  let html = '<div class="sidebar">';
  let currentSection = '';
  for (const item of items) {
    if (item.section && item.section !== currentSection) {
      if (currentSection) html += '</div>';
      html += `<div class="nav-section"><h4>${item.section}</h4>`;
      currentSection = item.section;
    }
    const active = currentPage === item.page || (currentPage === 'main' && item.default) ? ' active' : '';
    html += `<a class="${active}" onclick="window.ERP.nav('#/${role}/${item.page}')">`
      + `<span class="icon">${item.icon}</span>${item.label}`
      + (item.badge ? ` <span class="badge badge-${item.badgeColor || 'blue'}" style="margin-left:auto;font-size:10px">${item.badge}</span>` : '')
      + `</a>`;
  }
  if (currentSection) html += '</div>';
  html += '</div>';
  return html;
}

function render() {
  const app = document.getElementById('app');
  const rendererFn = RENDERERS[currentRole];
  if (!rendererFn) { app.innerHTML = renderRoleBar(); return; }

  // Update role bar buttons
  document.querySelectorAll('.role-btn').forEach(b => {
    b.classList.toggle('active', b.textContent.toLowerCase().includes(currentRole));
  });

  if (currentRole === 'login') {
    app.innerHTML = renderRoleBar() + rendererFn(currentPage);
    return;
  }
  if (currentRole === 'driver') {
    // Driver uses mobile layout — no sidebar
    app.innerHTML = renderRoleBar() + `<div class="app-shell active">` + renderHeader(currentRole)
      + `<div style="padding:24px">${rendererFn(currentPage)}</div></div>`;
    return;
  }
  app.innerHTML = renderRoleBar() + `<div class="app-shell active">`
    + renderHeader(currentRole)
    + `<div class="layout">`
    + renderSidebar(currentRole)
    + `<div class="content">${rendererFn(currentPage)}</div>`
    + `</div></div>`;
}

// ── TOAST ──
export function toast(msg, type = '') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast ' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── TABS ──
export function initTabs(containerSelector) {
  setTimeout(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const tabs = container.querySelectorAll('.tab');
    const contents = container.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = container.querySelector(`.tab-content[data-tab="${tab.dataset.tab}"]`);
        if (target) target.classList.add('active');
      });
    });
  }, 0);
}

// ── WIZARD STEPS ──
export function initSteps(containerSelector, onChange) {
  setTimeout(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const steps = container.querySelectorAll('.step.clickable');
    steps.forEach(step => {
      step.addEventListener('click', () => {
        const idx = parseInt(step.dataset.step);
        if (onChange) onChange(idx);
      });
    });
  }, 0);
}

// ── SEARCH FILTER ──
export function initSearch(inputSelector, tableSelector, colIndex = 0) {
  setTimeout(() => {
    const input = document.querySelector(inputSelector);
    const table = document.querySelector(tableSelector);
    if (!input || !table) return;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      table.querySelectorAll('tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }, 0);
}

// ── MODAL ──
export function showModal(title, bodyHtml, actions) {
  let overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay hidden';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div class="modal">
    <h2>${title}</h2>
    <div>${bodyHtml}</div>
    <div class="modal-actions">
      <button class="btn-outline" onclick="window.ERP.closeModal()">Cancel</button>
      ${actions || ''}
    </div>
  </div>`;
  overlay.classList.remove('hidden');
  overlay.addEventListener('click', e => { if (e.target === overlay) window.ERP.closeModal(); });
}

export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ── EXPOSE GLOBALS ──
Object.assign(window.ERP, {
  switchRole(role) { navigate(`#/${role}/main`); },
  nav(path) { navigate(path); },
  toast, showModal, closeModal, navigate,
  initTabs, initSearch,
});

// ── INIT ──
window.addEventListener('hashchange', onHashChange);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/login';
  onHashChange();
});
