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
import { renderReview, reviewNav } from './pages/review.js';

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
  review: { logo: '📦 WholesaleERP', user: 'Lisa Chen', initials: 'LC', notifs: 2 },
};

const NAVS = {
  sales: salesNav, warehouse: warehouseNav, driver: driverNav, route: routeNav,
  accounting: accountingNav, admin: adminNav, manager: managerNav, reports: reportsNav,
  review: reviewNav,
};

const RENDERERS = {
  login: renderLogin, sales: renderSales, warehouse: renderWarehouse, driver: renderDriver,
  route: renderRoute, accounting: renderAccounting, admin: renderAdmin,
  manager: renderManager, reports: renderReports,
  review: renderReview,
};

// ── STATE ──
let currentRole = 'login';
let currentPage = '';
let viewMode = 'desktop'; // 'desktop' | 'mobile'

// ── ROUTING ──
function parseHash() {
  const h = location.hash.slice(1) || '/login';
  const qIdx = h.indexOf('?');
  const pathPart = qIdx >= 0 ? h.slice(0, qIdx) : h;
  const query    = qIdx >= 0 ? h.slice(qIdx)    : '';
  const parts = pathPart.split('/').filter(Boolean);
  // Preserve query string so detail pages (order-detail?id=, customer?id=) can read it
  return { role: parts[0] || 'login', page: (parts.slice(1).join('/') || 'main') + query };
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
  const toggleBtn = (currentRole === 'sales')
    ? `<div class="view-toggle">
        <button class="toggle-btn ${viewMode === 'desktop' ? 'active' : ''}" onclick="window.ERP.setViewMode('desktop')" title="Desktop view">🖥️</button>
        <button class="toggle-btn ${viewMode === 'mobile' ? 'active' : ''}" onclick="window.ERP.setViewMode('mobile')" title="Mobile view">📱</button>
       </div>`
    : '';
  return `<div class="role-bar">
    <span>Demo</span>
    ${ROLES.map(r => `<button class="role-btn ${r.key === currentRole ? 'active' : ''}" onclick="window.ERP.switchRole('${r.key}')">${r.label}</button>`).join('')}
    ${toggleBtn}
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

function renderMobileBottomNav(role) {
  const navFn = NAVS[role];
  if (!navFn) return '';
  const items = navFn();
  const allItems = items.slice(0, 6);
  if (allItems.length === 0) return '';
  return `<div class="m-bottom-nav">
    ${allItems.map(item => {
      const active = currentPage === item.page || (currentPage === 'main' && item.default) ? ' active' : '';
      return `<a class="m-nav-item${active}" onclick="window.ERP.nav('#/${role}/${item.page}')">
        <span class="m-nav-icon">${item.icon}</span>
        <span class="m-nav-label">${item.label}</span>
      </a>`;
    }).join('')}
  </div>`;
}

function render() {
  const app = document.getElementById('app');
  const rendererFn = RENDERERS[currentRole];
  if (!rendererFn) { app.innerHTML = renderRoleBar(); return; }

  // Login page — no layout
  if (currentRole === 'login') {
    window.ERP._isMobile = false;
    app.innerHTML = renderRoleBar() + rendererFn(currentPage);
    return;
  }

  // Set mobile flag BEFORE rendering so page functions can branch
  window.ERP._isMobile = (viewMode === 'mobile' && currentRole === 'sales');
  const pageContent = rendererFn(currentPage);

  // ── Mobile view (sales only) — phone device frame ──
  if (window.ERP._isMobile) {
    app.innerHTML = renderRoleBar()
      + `<div class="mobile-preview-wrapper">
          <div class="mobile-device-frame">
            <div class="mobile-device-notch"></div>
            <div class="mobile-device-screen">
              <div class="m-header">
                <span class="m-logo">📦 WholesaleERP</span>
                <div style="display:flex;align-items:center;gap:10px">
                  <span class="m-notif">🔔<span class="m-notif-count">3</span></span>
                  <div class="m-avatar">MJ</div>
                </div>
              </div>
              <div class="m-content">${pageContent}</div>
              ${renderMobileBottomNav(currentRole)}
            </div>
          </div>
        </div>`;
    return;
  }

  // ── Desktop view ──
  if (currentRole === 'driver') {
    app.innerHTML = renderRoleBar() + `<div class="app-shell active">`
      + renderHeader(currentRole)
      + `<div style="padding:24px">${pageContent}</div></div>`;
    return;
  }

  app.innerHTML = renderRoleBar() + `<div class="app-shell active">`
    + renderHeader(currentRole)
    + `<div class="layout">`
    + renderSidebar(currentRole)
    + `<div class="content">${pageContent}</div>`
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
  _isMobile: false,
  switchRole(role) { if (role !== 'sales') viewMode = 'desktop'; navigate(`#/${role}/main`); },
  nav(path) { navigate(path); },
  setViewMode(mode) { viewMode = mode; render(); },
  // Generic tab switcher — finds all .tab and .tab-content inside the element with the given id
  _tab(id, tab) {
    const wrap = document.getElementById(id);
    if (!wrap) return;
    wrap.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    wrap.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.dataset.tab === tab));
  },
  toast, showModal, closeModal, navigate,
  initTabs, initSearch,
});

// ── INIT ──
window.addEventListener('hashchange', onHashChange);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/login';
  onHashChange();
});
