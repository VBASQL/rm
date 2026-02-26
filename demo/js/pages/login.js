// ===== Login Screen =====

export function renderLogin() {
  return `<div class="login-page">
    <div class="login-box">
      <h1>📦 WholesaleERP</h1>
      <p>Wholesale Food Distribution Management</p>
      <label>Username</label>
      <input type="text" placeholder="Enter your username" value="marcus.johnson">
      <label>Password</label>
      <input type="password" placeholder="••••••••" value="••••••••">
      <div style="margin-top:12px">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;text-transform:none;letter-spacing:0">
          <input type="checkbox" checked> Remember this device
        </label>
      </div>
      <button class="btn-primary" onclick="window.ERP.switchRole('sales')">Sign In</button>
      <div class="device-badge">Registered Device — DESKTOP-MJ01</div>
      <div style="margin-top:16px;padding:12px;background:#f1f5f9;border-radius:8px">
        <div style="font-size:11px;color:#64748b;font-weight:600;margin-bottom:6px">🔒 SECURITY</div>
        <div style="font-size:11px;color:#64748b">Private network required &bull; Device registered &bull; IP whitelisted &bull; HTTPS encrypted</div>
      </div>
      <div style="margin-top:16px;text-align:center">
        <div style="font-size:10px;color:#94a3b8;margin-bottom:8px">QUICK DEMO ACCESS</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">
          <button class="btn-outline btn-sm" style="font-size:10px" onclick="window.ERP.switchRole('sales')">Salesperson</button>
          <button class="btn-outline btn-sm" style="font-size:10px" onclick="window.ERP.switchRole('warehouse')">Warehouse</button>
          <button class="btn-outline btn-sm" style="font-size:10px" onclick="window.ERP.switchRole('driver')">Driver</button>
          <button class="btn-outline btn-sm" style="font-size:10px" onclick="window.ERP.switchRole('route')">Route Planner</button>
          <button class="btn-outline btn-sm" style="font-size:10px" onclick="window.ERP.switchRole('accounting')">Accounting</button>
          <button class="btn-outline btn-sm" style="font-size:10px" onclick="window.ERP.switchRole('admin')">Admin</button>
          <button class="btn-outline btn-sm" style="font-size:10px" onclick="window.ERP.switchRole('manager')">Manager</button>
          <button class="btn-outline btn-sm" style="font-size:10px" onclick="window.ERP.switchRole('reports')">Reports</button>
        </div>
      </div>
    </div>
  </div>`;
}
