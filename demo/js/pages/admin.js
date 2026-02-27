// ===== Admin Screens =====
import { CUSTOMERS, PRODUCTS, CATEGORIES, USERS, TRUCKS, CREDIT_TIERS, PRICE_LEVELS, fmt$ } from '../data.js';

export function adminNav() {
  return [
    { section: 'Users', icon: '👤', label: 'Users & Roles', page: 'main', default: true },
    { section: 'Users', icon: '🔒', label: 'Permissions', page: 'permissions' },
    { section: 'Users', icon: '📱', label: 'Devices', page: 'devices' },
    { section: 'Catalog', icon: '📦', label: 'Products', page: 'products' },
    { section: 'Catalog', icon: '🏷️', label: 'Categories', page: 'categories' },
    { section: 'Pricing', icon: '💲', label: 'Price Lists', page: 'pricing' },
    { section: 'Pricing', icon: '🏷️', label: 'Discount Caps', page: 'discounts' },
    { section: 'Pricing', icon: '📝', label: 'Adjustments', page: 'adjustments' },
    { section: 'Policies', icon: '⭐', label: 'Credit Tiers', page: 'credit-tiers' },
    { section: 'Policies', icon: '📋', label: 'Order Rules', page: 'order-rules' },
    { section: 'System', icon: '🔔', label: 'Notifications', page: 'notifications' },
    { section: 'System', icon: '💳', label: 'Payment Gateway', page: 'gateway' },
    { section: 'System', icon: '🖨️', label: 'Printers', page: 'printers' },
    { section: 'System', icon: '⚙️', label: 'Settings', page: 'settings' },
    { section: 'System', icon: '📜', label: 'Audit Log', page: 'audit' },
  ];
}

export function renderAdmin(page) {
  const pages = {
    permissions: permissionsPage, devices: devicesPage, products: productsPage,
    categories: categoriesPage, pricing: pricingPage, discounts: discountsPage,
    adjustments: adjustmentsPage, 'credit-tiers': creditTiersPage,
    'order-rules': orderRulesPage, notifications: adminNotifPage, gateway: gatewayPage,
    printers: printersPage, settings: settingsPage, audit: auditPage,
  };
  return (pages[page] || usersPage)();
}

/* ── USERS & ROLES ── */
function usersPage() {
  return `
    <div class="section-title"><h2>👤 Users & Roles</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP.showModal('Add User','<div class=\\'form-group\\'><label>Name</label><input></div><div class=\\'form-group\\'><label>Email</label><input></div><div class=\\'form-group\\'><label>Role</label><select><option>Salesperson</option><option>Warehouse</option><option>Driver</option><option>Accountant</option><option>Manager</option><option>Admin</option></select></div>')">+ Add User</button>
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Active</th><th></th></tr></thead>
        <tbody>${USERS.map(u=>`<tr>
          <td><strong>${u.name}</strong></td><td>${u.email}</td>
          <td><span class="badge badge-${u.role==='Admin'?'purple':u.role==='Manager'?'blue':u.role==='Salesperson'?'green':u.role==='Accountant'?'yellow':u.role==='Driver'?'orange':'cyan'}">${u.role}</span></td>
          <td><span class="badge badge-${u.status==='Active'?'green':'red'}">${u.status}</span></td>
          <td class="text-light text-sm">${u.lastActive}</td>
          <td><button class="btn-outline btn-sm">Edit</button></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}

/* ── PERMISSION POLICIES ── */
function permissionsPage() {
  const allPerms = [
    { key: 'view_dashboard',      label: 'View Dashboard' },
    { key: 'create_orders',       label: 'Create Orders' },
    { key: 'edit_orders',         label: 'Edit Orders' },
    { key: 'cancel_orders',       label: 'Cancel Orders' },
    { key: 'edit_price',          label: 'Edit Price on Order' },
    { key: 'apply_discounts',     label: 'Apply Discounts' },
    { key: 'view_customers',      label: 'View Customer List' },
    { key: 'edit_credit',         label: 'Edit Credit Limits' },
    { key: 'process_payments',    label: 'Process Payments' },
    { key: 'view_invoices',       label: 'View Invoices' },
    { key: 'edit_invoices',       label: 'Edit Invoices' },
    { key: 'pick_orders',         label: 'Pick Orders' },
    { key: 'approve_short_picks', label: 'Approve Short Picks' },
    { key: 'confirm_deliveries',  label: 'Confirm Deliveries' },
    { key: 'view_reports',        label: 'View Reports' },
    { key: 'manage_users',        label: 'Manage Users' },
    { key: 'system_settings',     label: 'System Settings' },
    { key: 'view_audit',          label: 'View Audit Log' },
  ];

  const POLICIES = [
    { id:'pol-001', name:'Full Admin',       color:'purple', desc:'All permissions — unrestricted access',                    perms: allPerms.map(p=>p.key),                                                                                                                                                                              users:['Admin'] },
    { id:'pol-002', name:'Manager',          color:'blue',   desc:'Manage operations, approve overrides, view all',           perms:['view_dashboard','create_orders','edit_orders','cancel_orders','edit_price','apply_discounts','view_customers','edit_credit','process_payments','view_invoices','edit_invoices','pick_orders','approve_short_picks','confirm_deliveries','view_reports','view_audit'], users:['Karen Miller'] },
    { id:'pol-003', name:'Sales Standard',   color:'green',  desc:'Create & manage own orders, view customers',               perms:['view_dashboard','create_orders','edit_orders','view_customers','view_invoices','view_reports'],                                                                                                     users:['Marcus Johnson','Nicole Rivera'] },
    { id:'pol-004', name:'Senior Sales',     color:'cyan',   desc:'Sales Standard + price edits & full discounts',            perms:['view_dashboard','create_orders','edit_orders','cancel_orders','edit_price','apply_discounts','view_customers','view_invoices','view_reports'],                                                      users:[] },
    { id:'pol-005', name:'Accountant',       color:'yellow', desc:'Payments, invoices, credit management, reports',           perms:['view_dashboard','cancel_orders','view_customers','edit_credit','process_payments','view_invoices','edit_invoices','view_reports','view_audit'],                                                     users:['Lisa Chen'] },
    { id:'pol-006', name:'Warehouse Picker', color:'orange', desc:'Pick orders & view pick queue',                            perms:['view_dashboard','pick_orders','approve_short_picks'],                                                                                                                                               users:['Rachel Green'] },
    { id:'pol-007', name:'Driver',           color:'orange', desc:'Confirm deliveries & adjust quantities',                   perms:['view_dashboard','confirm_deliveries'],                                                                                                                                                              users:['Mike Roberts','Tom Davis'] },
    { id:'pol-008', name:'Read Only',        color:'blue',   desc:'View dashboard and reports only — no actions',             perms:['view_dashboard','view_reports'],                                                                                                                                                                    users:[] },
  ];

  const roleDefaults = [
    { role:'Admin',         color:'purple', policy:'Full Admin',       policyId:'pol-001' },
    { role:'Manager',       color:'blue',   policy:'Manager',          policyId:'pol-002' },
    { role:'Salesperson',   color:'green',  policy:'Sales Standard',   policyId:'pol-003' },
    { role:'Accountant',    color:'yellow', policy:'Accountant',       policyId:'pol-005' },
    { role:'Route Planner', color:'cyan',   policy:'Manager',          policyId:'pol-002' },
    { role:'Warehouse',     color:'orange', policy:'Warehouse Picker', policyId:'pol-006' },
    { role:'Driver',        color:'orange', policy:'Driver',           policyId:'pol-007' },
  ];

  const userAssignments = [
    { user:'Admin',          role:'Admin',         roleColor:'purple', policy:'Full Admin',       source:'Role Default' },
    { user:'Karen Miller',   role:'Manager',       roleColor:'blue',   policy:'Manager',          source:'Role Default' },
    { user:'Marcus Johnson', role:'Salesperson',   roleColor:'green',  policy:'Sales Standard',   source:'Role Default' },
    { user:'Nicole Rivera',  role:'Salesperson',   roleColor:'green',  policy:'Sales Standard',   source:'Role Default' },
    { user:'Lisa Chen',      role:'Accountant',    roleColor:'yellow', policy:'Accountant',       source:'Role Default' },
    { user:'Rachel Green',   role:'Warehouse',     roleColor:'orange', policy:'Warehouse Picker', source:'Role Default' },
    { user:'Mike Roberts',   role:'Driver',        roleColor:'orange', policy:'Driver',           source:'Role Default' },
    { user:'Tom Davis',      role:'Driver',        roleColor:'orange', policy:'Driver',           source:'Role Default' },
    { user:'Steve Kim',      role:'Route Planner', roleColor:'cyan',   policy:'Manager',          source:'Role Default' },
  ];

  // Register modal helpers so inline onclick can call them
  window.ERP._buildPolicyModal = () => {
    const checkboxes = allPerms.map(p =>
      `<label style="display:flex;align-items:center;gap:6px;font-size:12px;text-transform:none;letter-spacing:0;font-weight:400"><input type="checkbox"> ${p.label}</label>`
    ).join('');
    window.ERP.showModal('🏗️ Build New Policy',
      `<div class="form-group"><label>Policy Name</label><input placeholder="e.g. Senior Sales — Price Edit"></div>
       <div class="form-group"><label>Description</label><input placeholder="Short description of this policy's purpose"></div>
       <div style="margin-top:4px">
         <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-light);margin-bottom:8px">Permissions</div>
         <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${checkboxes}</div>
       </div>`,
      `<button class="btn-primary" onclick="window.ERP.toast('Policy saved! Assign it to users in the User Assignments tab.','success');window.ERP.closeModal()">💾 Save Policy</button>`
    );
  };

  window.ERP._assignPolicyModal = (user) => {
    const opts = POLICIES.map(p =>
      `<option value="${p.id}">${p.name} — ${p.desc}</option>`
    ).join('');
    window.ERP.showModal(`🔑 Assign Policy — ${user}`,
      `<div class="info-box mb-12">A custom policy overrides the role default for this user only.</div>
       <div class="form-group"><label>Current Policy</label><input value="Sales Standard (Role Default)" readonly style="opacity:.7"></div>
       <div class="form-group"><label>Assign New Policy</label><select>${opts}</select></div>
       <div class="warn-box mt-12" style="font-size:12px">⚠️ This user will see updated permissions on next login.</div>`,
      `<button class="btn-primary" onclick="window.ERP.toast('Senior Sales policy assigned to ${user}!','success');window.ERP.closeModal()">✅ Assign Policy</button>`
    );
  };

  return `
    <div class="section-title">
      <h2>🔒 Permission Policies</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP._buildPolicyModal()">+ Build Policy</button>
    </div>
    <div class="info-box mb-16">
      Permissions are managed through <strong>named policies</strong> — reusable bundles of capabilities. Each role has a
      <em>default policy</em>, but you can assign any policy to individual users to override the default.
      <span style="display:block;margin-top:4px;font-size:11px;color:var(--text-light)">Workflow: Build a policy → pick permissions → assign to a role or individual user.</span>
    </div>

    <div id="perm-wrap">
      <div class="tabs" style="margin-bottom:0">
        <div class="tab active" data-tab="policies" onclick="window.ERP._tab('perm-wrap','policies')">📋 Policies</div>
        <div class="tab" data-tab="role-defaults" onclick="window.ERP._tab('perm-wrap','role-defaults')">🏷️ Role Defaults</div>
        <div class="tab" data-tab="user-assignments" onclick="window.ERP._tab('perm-wrap','user-assignments')">👤 User Assignments</div>
      </div>

      <!-- POLICIES TAB -->
      <div class="tab-content active" data-tab="policies">
        <div class="card" style="padding:0;overflow:hidden">
          <table>
            <thead><tr><th>Policy Name</th><th>Description</th><th>Permissions</th><th>Assigned Users</th><th></th></tr></thead>
            <tbody>${POLICIES.map(p => `<tr>
              <td><strong><span class="badge badge-${p.color}" style="margin-right:6px">&nbsp;</span>${p.name}</strong></td>
              <td class="text-sm text-light">${p.desc}</td>
              <td><span class="badge badge-blue">${p.perms.length} / ${allPerms.length}</span></td>
              <td>${p.users.length ? p.users.map(u=>`<span class="badge badge-green" style="margin-right:2px;font-size:10px">${u}</span>`).join('') : '<span class="text-light text-sm">—</span>'}</td>
              <td style="white-space:nowrap">
                <button class="btn-outline btn-sm" onclick="window.ERP.toast('Editing ${p.name}…','')">Edit</button>
                <button class="btn-outline btn-sm" onclick="window.ERP.toast('Cloned: ${p.name} (copy)','success')">Clone</button>
              </td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
        <div class="card mt-16" style="border:2px dashed var(--border)">
          <h3 style="margin-bottom:12px">🏗️ How to Build a New Policy</h3>
          <div style="display:flex;gap:20px;flex-wrap:wrap">
            <div style="flex:1;min-width:150px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span class="badge badge-blue">Step 1</span><strong>Name It</strong></div>
              <div class="text-sm text-light">Give a clear name like "Senior Sales" and a short description.</div>
            </div>
            <div style="flex:1;min-width:150px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span class="badge badge-blue">Step 2</span><strong>Select Permissions</strong></div>
              <div class="text-sm text-light">Toggle each capability on or off. Clone an existing policy as a starting point.</div>
            </div>
            <div style="flex:1;min-width:150px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span class="badge badge-blue">Step 3</span><strong>Save &amp; Assign</strong></div>
              <div class="text-sm text-light">Save the policy, then assign it to individual users in the User Assignments tab.</div>
            </div>
          </div>
          <button class="btn-primary mt-16" onclick="window.ERP._buildPolicyModal()">+ Build New Policy →</button>
        </div>
      </div>

      <!-- ROLE DEFAULTS TAB -->
      <div class="tab-content" data-tab="role-defaults">
        <div class="info-box mb-16">
          Every new user automatically receives the <strong>default policy</strong> for their role. Changing a default here applies to all users on that role who have no custom per-user override.
        </div>
        <div class="card" style="padding:0;overflow:hidden">
          <table>
            <thead><tr><th>Role</th><th>Default Policy</th><th>Permissions Granted</th><th>Can Be Overridden?</th><th></th></tr></thead>
            <tbody>${roleDefaults.map(r => {
              const pol = POLICIES.find(p => p.name === r.policy) || POLICIES[0];
              return `<tr>
                <td><span class="badge badge-${r.color}">${r.role}</span></td>
                <td><strong>${r.policy}</strong></td>
                <td><span class="badge badge-blue">${pol.perms.length} / ${allPerms.length}</span></td>
                <td><span class="badge badge-green">Yes — per user</span></td>
                <td><button class="btn-outline btn-sm" onclick="window.ERP.toast('Changing default policy for ${r.role}…','')">Change Default</button></td>
              </tr>`;
            }).join('')}</tbody>
          </table>
        </div>
        <div class="warn-box mt-16">⚠️ Changing a role default does not override existing custom per-user assignments — only users still on "Role Default" are affected.</div>
      </div>

      <!-- USER ASSIGNMENTS TAB -->
      <div class="tab-content" data-tab="user-assignments">
        <div class="info-box mb-16">
          Users with a <span class="badge badge-purple">Custom</span> tag have a policy that overrides their role default.
          Users with <span class="badge badge-blue">Role Default</span> inherit the policy from their role automatically.
        </div>
        <div class="card" style="padding:0;overflow:hidden">
          <table>
            <thead><tr><th>User</th><th>Role</th><th>Active Policy</th><th>Source</th><th></th></tr></thead>
            <tbody>${userAssignments.map(u => `<tr>
              <td><strong>${u.user}</strong></td>
              <td><span class="badge badge-${u.roleColor}">${u.role}</span></td>
              <td>${u.policy}</td>
              <td><span class="badge badge-${u.source === 'Custom' ? 'purple' : 'blue'}">${u.source}</span></td>
              <td><button class="btn-outline btn-sm" onclick="window.ERP._assignPolicyModal('${u.user}')">Assign Policy</button></td>
            </tr>`).join('')}</tbody>
          </table>
        </div>
        <div class="card mt-16" style="border-left:3px solid var(--blue,#3b82f6)">
          <h3 style="margin-bottom:8px">📌 Demo: Promote Marcus Johnson to "Senior Sales"</h3>
          <p class="text-sm text-light" style="margin-bottom:12px">
            Marcus is currently on <strong>Sales Standard</strong> (role default) — he can create and view orders but cannot edit prices or apply discounts.
            Assigning <strong>Senior Sales</strong> grants those extra capabilities without changing his role title.
          </p>
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:14px">
            <div class="card" style="padding:8px 14px;flex:1;min-width:130px">
              <div class="text-xs text-light">Before</div>
              <div style="font-weight:600">Sales Standard</div>
              <div class="text-sm text-light">6 permissions · Role Default</div>
            </div>
            <div style="font-size:22px;color:var(--text-light)">→</div>
            <div class="card" style="padding:8px 14px;flex:1;min-width:130px;border-color:var(--blue,#3b82f6)">
              <div class="text-xs text-light">After</div>
              <div style="font-weight:600">Senior Sales <span class="badge badge-purple" style="font-size:10px">Custom</span></div>
              <div class="text-sm text-light">9 permissions · User Override</div>
            </div>
          </div>
          <button class="btn-primary" onclick="window.ERP._assignPolicyModal('Marcus Johnson')">Try It: Assign Policy to Marcus →</button>
        </div>
      </div>
    </div>`;
}

/* ── DEVICES ── */
function devicesPage() {
  const devices = [
    { name: 'iPhone 15 Pro — Marco', type: 'iOS', user: 'Marco Rossi', enrolled: 'Jan 5 2026', status: 'Active', lastSync: '5 min ago' },
    { name: 'Samsung Tab A8 — WH1', type: 'Android', user: 'Warehouse', enrolled: 'Dec 12 2025', status: 'Active', lastSync: '2 min ago' },
    { name: 'iPhone 14 — Kevin', type: 'iOS', user: 'Kevin Park', enrolled: 'Jan 10 2026', status: 'Active', lastSync: '12 min ago' },
    { name: 'Samsung Tab A8 — WH2', type: 'Android', user: 'Warehouse', enrolled: 'Feb 1 2026', status: 'Active', lastSync: '4 min ago' },
    { name: 'iPhone 13 — Tony', type: 'iOS', user: 'Tony Lopez', enrolled: 'Nov 20 2025', status: 'Revoked', lastSync: '3 days ago' },
  ];

  window.ERP._revokeDevice = (name, user) => {
    window.ERP.showModal('🔒 Revoke Device Access',
      `<div class="warn-box mb-16"><strong>⚠️ This will immediately block ${name} from accessing WholesaleERP.</strong></div>
       <table style="font-size:13px;width:100%">
         <tr><td style="padding:4px 0;color:var(--text-light)">Device</td><td><strong>${name}</strong></td></tr>
         <tr><td style="padding:4px 0;color:var(--text-light)">User</td><td>${user}</td></tr>
         <tr><td style="padding:4px 0;color:var(--text-light)">Effect</td><td>Session terminated · App locked · Re-enrollment required</td></tr>
       </table>
       <div class="form-group" style="margin-top:14px"><label>Reason (required)</label>
         <select>
           <option value="">— Select reason —</option>
           <option>Employee terminated</option>
           <option>Device lost or stolen</option>
           <option>Suspicious activity</option>
           <option>Employee on leave</option>
           <option>Device replaced</option>
           <option>Other</option>
         </select>
       </div>`,
      `<button class="btn-danger btn-sm" onclick="window.ERP.toast('Access revoked for ${name}. User notified.',''); window.ERP.closeModal()">🔒 Revoke Access</button>`
    );
  };

  window.ERP._wipeDevice = (name, user) => {
    window.ERP.showModal('🗑️ Remote Wipe — ' + name,
      `<div class="card" style="background:var(--red-light,#fef2f2);border-color:var(--red,#ef4444);padding:14px;margin-bottom:16px">
         <strong style="color:var(--red,#ef4444)">⚠️ DESTRUCTIVE ACTION — Cannot be undone</strong>
         <p class="text-sm" style="margin-top:6px">This will erase <strong>all WholesaleERP data</strong> from the device — cached orders, customer data, offline drafts — and force removal of the app.</p>
       </div>
       <table style="font-size:13px;width:100%">
         <tr><td style="padding:4px 0;color:var(--text-light)">Device</td><td><strong>${name}</strong></td></tr>
         <tr><td style="padding:4px 0;color:var(--text-light)">User</td><td>${user}</td></tr>
         <tr><td style="padding:4px 0;color:var(--text-light)">Scope</td><td>App data only (not full device wipe)</td></tr>
         <tr><td style="padding:4px 0;color:var(--text-light)">Timing</td><td>Immediate if online · On next connection if offline</td></tr>
       </table>
       <div class="form-group" style="margin-top:14px"><label>Type <strong>WIPE</strong> to confirm</label><input placeholder="WIPE" id="wipe-confirm-input"></div>`,
      `<button class="btn-danger btn-sm" onclick="
        const v = document.getElementById('wipe-confirm-input');
        if (!v || v.value.trim().toUpperCase() !== 'WIPE') {
          window.ERP.toast('Type WIPE to confirm','');
        } else {
          window.ERP.toast('Remote wipe issued for ${name}. Queued for delivery.','');
          window.ERP.closeModal();
        }
      ">🗑️ Confirm Wipe</button>`
    );
  };

  return `
    <div class="section-title"><h2>📱 Device Management</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP.toast('Device enrollment initiated','')">+ Enroll Device</button>
    </div>
    <div class="info-box mb-16" style="font-size:12px">
      <strong>Revoke Access</strong> — instantly blocks the user's session and locks the app. The device stays enrolled but needs admin re-approval to reconnect.&nbsp;&nbsp;
      <strong>Remote Wipe</strong> — erases all WholesaleERP app data from the device (offline cache, drafts, credentials). Delivered immediately if online.
    </div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Device</th><th>Type</th><th>User</th><th>Enrolled</th><th>Last Sync</th><th>Status</th><th style="min-width:200px"></th></tr></thead>
        <tbody>${devices.map(d => {
          const isRevoked = d.status === 'Revoked';
          const isInactive = d.status === 'Inactive' || isRevoked;
          return `<tr>
            <td><strong>${d.name}</strong></td>
            <td>${d.type === 'iOS' ? '🍎' : '🤖'} ${d.type}</td>
            <td>${d.user}</td>
            <td class="text-sm">${d.enrolled}</td>
            <td class="text-sm text-light">${d.lastSync}</td>
            <td><span class="badge badge-${d.status === 'Active' ? 'green' : isRevoked ? 'red' : 'yellow'}">${d.status}</span></td>
            <td style="white-space:nowrap;display:flex;gap:4px;padding:8px">
              ${!isRevoked
                ? `<button class="btn-outline btn-sm" onclick="window.ERP._revokeDevice('${d.name}','${d.user}')">🔒 Revoke</button>`
                : `<button class="btn-outline btn-sm" onclick="window.ERP.toast('Access restored for ${d.name}','success')" style="color:var(--green,#22c55e)">✓ Restore</button>`}
              <button class="btn-outline btn-sm" style="color:var(--red,#ef4444)" onclick="window.ERP._wipeDevice('${d.name}','${d.user}')">🗑️ Wipe</button>
            </td>
          </tr>`;
        }).join('')}</tbody>
      </table>
    </div>
    <div class="warn-box mt-16">All revoke and wipe actions are permanently recorded in the Audit Log with timestamp, admin name, reason, and device details.</div>`;
}

/* ── PRODUCTS ── */
function productsPage() {
  return `
    <div class="section-title"><h2>📦 Products</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP.showModal('Add Product','<div class=\\'form-group\\'><label>Code</label><input></div><div class=\\'form-group\\'><label>Name</label><input></div><div class=\\'form-row\\'><div class=\\'form-group\\'><label>Category</label><select>${CATEGORIES.map(c=>'<option>'+c.name+'</option>').join('')}</select></div><div class=\\'form-group\\'><label>Price</label><input type=number></div></div>')">+ Add Product</button>
    </div>
    <div class="search-bar"><input placeholder="Search products…"><select><option>All Categories</option>${CATEGORIES.map(c=>`<option>${c.name}</option>`).join('')}</select></div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Unit</th><th>Pack</th><th style="text-align:right">Price</th><th style="text-align:right">Stock</th><th></th></tr></thead>
        <tbody>${PRODUCTS.map(p=>{
          const cat = CATEGORIES.find(c=>c.id===p.category);
          return `<tr><td><code>${p.code}</code></td><td><strong>${p.name}</strong></td>
            <td>${cat?cat.icon+' '+cat.name:''}</td>
            <td>${p.unit}</td><td>${p.packSize}</td>
            <td style="text-align:right">${fmt$(p.price)}</td>
            <td style="text-align:right;${p.stock<20?'color:var(--red);font-weight:700':''}">${p.stock}</td>
            <td><button class="btn-outline btn-sm">Edit</button></td></tr>`;
        }).join('')}</tbody>
      </table>
    </div>`;
}

/* ── CATEGORIES ── */
function categoriesPage() {
  return `
    <div class="section-title"><h2>🏷️ Categories</h2>
      <button class="btn-primary btn-sm" style="margin-left:auto" onclick="window.ERP.toast('Add category…','')">+ Add Category</button>
    </div>
    <div class="grid-3">${CATEGORIES.map(c=>`
      <div class="card">
        <div style="font-size:32px;margin-bottom:8px">${c.icon}</div>
        <h3>${c.name}</h3>
        <p class="text-sm text-light">${PRODUCTS.filter(p=>p.category===c.id).length} products</p>
        <button class="btn-outline btn-sm mt-8">Edit</button>
      </div>`).join('')}
    </div>`;
}

/* ── PRICING / PRICE LISTS ── */
function pricingPage() {
  return `
    <div class="section-title"><h2>💲 Price Lists</h2></div>
    <div class="info-box mb-16">Customer-specific or group pricing. Each price list applies a multiplier to base product prices. Customers are assigned via Customer → Price Level.</div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Multiplier</th><th>Customers</th><th></th></tr></thead>
        <tbody>${PRICE_LEVELS.map(p=>`<tr>
          <td><strong>${p.id}</strong></td><td>${p.name}</td><td class="text-sm text-light">${p.desc}</td>
          <td><span class="badge badge-${p.mult<=0.9?'green':p.mult<=0.95?'yellow':'blue'}">${p.mult}×</span></td>
          <td>${CUSTOMERS.filter(c=>c.priceLevel===p.id).length}</td>
          <td><button class="btn-outline btn-sm">Edit</button></td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
    <div class="card mt-16">
      <h3>Price Preview: Whole Milk 4/1 GAL — Base $4.29</h3>
      <div class="stat-grid">${PRICE_LEVELS.map(p=>`
        <div class="stat-item"><div class="text-xs text-light">${p.name}</div><div class="bold">${fmt$(4.29*p.mult)}</div></div>`).join('')}
      </div>
    </div>`;
}

/* ── DISCOUNT CAPS ── */
function discountsPage() {
  return `
    <div class="section-title"><h2>🏷️ Discount Caps</h2></div>
    <div class="info-box mb-16">Maximum discount percentages allowed per role. Amounts exceeding the cap require manager approval.</div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Role</th><th>Max Line Discount</th><th>Max Order Discount</th><th>Requires Approval Above</th></tr></thead>
        <tbody>
          <tr><td>Salesperson</td><td>5%</td><td>3%</td><td>Any discount</td></tr>
          <tr><td>Sales Manager</td><td>15%</td><td>10%</td><td>Over 15%</td></tr>
          <tr><td>Admin</td><td>100%</td><td>100%</td><td>No limit</td></tr>
        </tbody>
      </table>
    </div>
    <div class="warn-box mt-16">Requests beyond cap are queued for manager approval. Salesperson sees "Pending Approval" status.</div>`;
}

/* ── ADJUSTMENTS ── */
function adjustmentsPage() {
  return `
    <div class="section-title"><h2>📝 Adjustments</h2></div>
    <div class="grid-2">
      <div class="card">
        <h3>Order Adjustment Policies</h3>
        <table><thead><tr><th>Policy</th><th>Value</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Post-delivery adjustments</td><td>Allowed within 24 hours</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>Short pick auto-adjust</td><td>Auto-reduce invoice on approval</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>Driver quantity edit</td><td>Reduce only, with reason code</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>Price adjustment</td><td>Requires manager approval</td><td><span class="badge badge-green">Active</span></td></tr>
          <tr><td>Return credits</td><td>Auto-create credit memo</td><td><span class="badge badge-yellow">Draft</span></td></tr>
        </tbody></table>
      </div>
      <div class="card">
        <h3>Recent Adjustments</h3>
        <table><thead><tr><th>Date</th><th>Order</th><th>Type</th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>Feb 26</td><td>ORD-2601</td><td>Short pick</td><td class="text-red">-$12.50</td></tr>
          <tr><td>Feb 25</td><td>ORD-2595</td><td>Driver adjust</td><td class="text-red">-$28.75</td></tr>
          <tr><td>Feb 25</td><td>ORD-2590</td><td>Return credit</td><td class="text-red">-$45.00</td></tr>
        </tbody></table>
      </div>
    </div>`;
}

/* ── CREDIT TIERS ── */
function creditTiersPage() {
  return `
    <div class="section-title"><h2>⭐ Credit Tiers</h2></div>
    <div class="grid-3">${CREDIT_TIERS.map(t=>`
      <div class="card card-border-${t.tier==='A'?'success':t.tier==='B'?'warn':'danger'}">
        <h3>Tier ${t.tier} — ${t.name}</h3>
        <table style="font-size:12px"><tbody>
          <tr><td>Default Limit</td><td style="text-align:right"><strong>${fmt$(t.defaultLimit)}</strong></td></tr>
          <tr><td>Terms</td><td style="text-align:right">${t.terms}</td></tr>
          <tr><td>Customers</td><td style="text-align:right">${CUSTOMERS.filter(c=>c.creditTier===t.tier).length}</td></tr>
        </tbody></table>
        <button class="btn-outline btn-sm mt-8">Edit Tier</button>
      </div>`).join('')}
    </div>
    <div class="card mt-16">
      <h3>Auto-Tier Rules</h3>
      <div class="info-box">Customers are automatically promoted or demoted based on payment history. Late payments > 3 in 90 days triggers downgrade warning.</div>
    </div>`;
}

/* ── ORDER RULES ── */
function orderRulesPage() {
  return `
    <div class="section-title"><h2>📋 Order Rules</h2></div>
    <div class="card">
      <table><thead><tr><th>Rule</th><th>Value</th><th>Enforced</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Minimum order amount</td><td>$50.00</td><td>At order entry</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>Maximum order amount</td><td>$25,000.00</td><td>Manager approval required</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>Credit check</td><td>Block if over limit</td><td>At order entry</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>Duplicate order detection</td><td>Same customer + same day</td><td>Warning only</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>Cut-off time</td><td>2:00 PM for next-day delivery</td><td>Soft warning</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>COD enforcement</td><td>Tier C customers</td><td>Auto-apply at order</td><td><span class="badge badge-green">Active</span></td></tr>
        <tr><td>Salesperson territory</td><td>Restrict to assigned customers</td><td>At order entry</td><td><span class="badge badge-yellow">Draft</span></td></tr>
      </tbody></table>
    </div>`;
}

/* ── ADMIN NOTIFICATIONS ── */
function adminNotifPage() {
  return `
    <div class="section-title"><h2>🔔 Notification Settings</h2></div>
    <div class="card">
      <h3>Alert Routing</h3>
      <table><thead><tr><th>Event</th><th>Email</th><th>Push</th><th>SMS</th><th>Recipients</th></tr></thead>
      <tbody>
        <tr><td>Credit limit exceeded</td><td>✓</td><td>✓</td><td></td><td>Accountant, Manager</td></tr>
        <tr><td>Order over $5,000</td><td>✓</td><td>✓</td><td></td><td>Manager</td></tr>
        <tr><td>Delivery rejected</td><td>✓</td><td>✓</td><td>✓</td><td>Manager, Salesperson</td></tr>
        <tr><td>Short pick detected</td><td>✓</td><td>✓</td><td></td><td>Warehouse Manager</td></tr>
        <tr><td>Invoice overdue</td><td>✓</td><td></td><td></td><td>Accountant</td></tr>
        <tr><td>New user enrolled</td><td>✓</td><td></td><td></td><td>Admin</td></tr>
        <tr><td>Device offline > 1hr</td><td>✓</td><td></td><td></td><td>Admin</td></tr>
        <tr><td>AI flag on order</td><td>✓</td><td>✓</td><td></td><td>Accountant, Manager</td></tr>
      </tbody></table>
    </div>`;
}

/* ── PAYMENT GATEWAY ── */
function gatewayPage() {
  return `
    <div class="section-title"><h2>💳 Payment Gateway — Authorize.NET</h2></div>
    <div class="grid-2">
      <div class="card">
        <h3>Configuration</h3>
        <div class="form-group"><label>API Login ID</label><input value="•••••6xK2m" type="password"></div>
        <div class="form-group"><label>Transaction Key</label><input value="•••••••••••" type="password"></div>
        <div class="form-group"><label>Environment</label><select><option>Production</option><option>Sandbox</option></select></div>
        <div class="form-group"><label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0"><input type="checkbox" checked> Enable credit card payments at delivery</label></div>
        <div class="form-group"><label style="display:flex;align-items:center;gap:8px;text-transform:none;letter-spacing:0"><input type="checkbox" checked> Enable ACH/eCheck payments</label></div>
        <button class="btn-primary mt-8" onclick="window.ERP.toast('Testing connection…','')">🔌 Test Connection</button>
      </div>
      <div class="card">
        <h3>Gateway Status</h3>
        <div class="success-box mb-16"><strong>✓ Connected</strong> — Last verified 5 min ago</div>
        <div class="stat-grid">
          <div class="stat-item"><div class="text-xs text-light">Today's Txns</div><div class="bold">12</div></div>
          <div class="stat-item"><div class="text-xs text-light">Today's Volume</div><div class="bold">${fmt$(4850)}</div></div>
          <div class="stat-item"><div class="text-xs text-light">Success Rate</div><div class="bold text-green">98.5%</div></div>
        </div>
      </div>
    </div>`;
}

/* ── PRINTERS ── */
function printersPage() {
  return `
    <div class="section-title"><h2>🖨️ Printers</h2></div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>Printer</th><th>Location</th><th>Type</th><th>Status</th><th>Default For</th><th></th></tr></thead>
        <tbody>
          <tr><td><strong>EPSON TM-T88VI</strong></td><td>Warehouse</td><td>Thermal</td><td><span class="badge badge-green">Online</span></td><td>Pick Lists, Labels</td><td><button class="btn-outline btn-sm">Config</button></td></tr>
          <tr><td><strong>HP LaserJet Pro</strong></td><td>Office</td><td>Laser</td><td><span class="badge badge-green">Online</span></td><td>Invoices, Statements</td><td><button class="btn-outline btn-sm">Config</button></td></tr>
          <tr><td><strong>Brother QL-820NWB</strong></td><td>Warehouse</td><td>Label</td><td><span class="badge badge-green">Online</span></td><td>Product Labels</td><td><button class="btn-outline btn-sm">Config</button></td></tr>
          <tr><td><strong>Zebra ZD421</strong></td><td>Dock</td><td>Label</td><td><span class="badge badge-yellow">Idle</span></td><td>Shipping Labels</td><td><button class="btn-outline btn-sm">Config</button></td></tr>
        </tbody>
      </table>
    </div>
    <div class="info-box mt-16">📌 Auto-print rules: Pick lists print automatically when order enters "Ready to Pick" status. Invoices print on delivery confirmation.</div>`;
}

/* ── SYSTEM SETTINGS ── */
function settingsPage() {
  return `
    <div class="section-title"><h2>⚙️ System Settings</h2></div>
    <div class="grid-2">
      <div class="card">
        <h3>Company</h3>
        <div class="form-group"><label>Company Name</label><input value="WholesaleERP Demo Co"></div>
        <div class="form-group"><label>Address</label><input value="123 Distribution Way, Boston, MA 02101"></div>
        <div class="form-row"><div class="form-group"><label>Phone</label><input value="(617) 555-0100"></div><div class="form-group"><label>Tax ID</label><input value="12-3456789"></div></div>
      </div>
      <div class="card">
        <h3>Operations</h3>
        <div class="form-row"><div class="form-group"><label>Order Cut-off</label><input type="time" value="14:00"></div><div class="form-group"><label>Tax Rate</label><input value="6.25%"></div></div>
        <div class="form-row"><div class="form-group"><label>Default Terms</label><select><option>Net 30</option><option>Net 15</option><option>COD</option></select></div><div class="form-group"><label>Currency</label><input value="USD" readonly></div></div>
      </div>
      <div class="card">
        <h3>Integrations</h3>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><span>QuickBooks Sync</span><span class="badge badge-green">Connected</span></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><span>Authorize.NET</span><span class="badge badge-green">Connected</span></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><span>Google Maps API</span><span class="badge badge-green">Active</span></div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0"><span>Twilio SMS</span><span class="badge badge-yellow">Not configured</span></div>
        </div>
      </div>
      <div class="card">
        <h3>Backup & Data</h3>
        <div class="success-box mb-8">✓ Last backup: Feb 26, 2026 03:00 AM</div>
        <div class="form-group"><label>Auto-backup</label><select><option>Daily at 3 AM</option><option>Every 12 hours</option></select></div>
        <div class="form-group"><label>Retention</label><input value="90 days"></div>
        <button class="btn-outline" onclick="window.ERP.toast('Backup started…','success')">📦 Backup Now</button>
      </div>
    </div>`;
}

/* ── AUDIT LOG ── */
function auditPage() {
  const logs = [
    { time: '14:23:15', user: 'Marco Rossi', action: 'Created order ORD-2605', type: 'Order', ip: '192.168.1.45' },
    { time: '14:18:02', user: 'Sarah Chen', action: 'Payment PMT-1105 applied to INV-4401', type: 'Payment', ip: '192.168.1.10' },
    { time: '14:05:30', user: 'Kevin Park', action: 'Delivery confirmed ORD-2601', type: 'Delivery', ip: '10.0.0.88' },
    { time: '13:55:12', user: 'Mike Torres', action: 'Pick completed ORD-2601', type: 'Pick', ip: '192.168.1.22' },
    { time: '13:42:08', user: 'Admin', action: 'Credit limit changed: Cambridge Catering $15K → $20K', type: 'Credit', ip: '192.168.1.1' },
    { time: '13:30:00', user: 'System', action: 'Auto-lock triggered for INV-4401', type: 'System', ip: '—' },
    { time: '12:15:45', user: 'Linda Wu', action: 'Route A optimized — saved 22 min', type: 'Route', ip: '192.168.1.10' },
    { time: '11:58:30', user: 'Admin', action: 'User Tony Lopez deactivated', type: 'User', ip: '192.168.1.1' },
  ];
  return `
    <div class="section-title"><h2>📜 Audit Log</h2></div>
    <div class="search-bar"><input placeholder="Search audit log…"><select><option>All Types</option><option>Order</option><option>Payment</option><option>Delivery</option><option>System</option><option>User</option></select></div>
    <div class="card" style="padding:0;overflow:hidden">
      <table style="font-size:12px">
        <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Type</th><th>IP</th></tr></thead>
        <tbody>${logs.map(l=>`<tr>
          <td class="text-light" style="white-space:nowrap">${l.time}</td>
          <td><strong>${l.user}</strong></td>
          <td>${l.action}</td>
          <td><span class="badge badge-blue">${l.type}</span></td>
          <td class="text-light">${l.ip}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>`;
}
