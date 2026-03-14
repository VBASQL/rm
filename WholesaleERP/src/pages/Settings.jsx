// ============================================================
// FILE: Settings.jsx
// PURPOSE: App settings — user info (read-only), sign out,
//          sync status, version, feedback link.
// DEPENDS ON: PageHeader, AuthProvider, AppContext
// DEPENDED ON BY: App.jsx (route: /settings)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.13: Settings page with user info display,
//   sign-out button, sync status indicator, app version.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] #demo-clear Added "Clear All Data" option with MockFeatureBanner
//     and confirm dialog. Calls storage.clearAllData() which empties all
//     collections but keeps the seed version so the app stays blank until
//     browser localStorage is manually cleared.
//   [2026-03-13] #001 Added Discount Caps section — 4-level editable fields.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, RefreshCw, Info, MessageSquare, Database, Trash2, Percent } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import MockFeatureBanner from '../components/MockFeatureBanner';
import styles from '../styles/Settings.module.css';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    // [MOD #001] Load discount settings from storage on init
    const discountSettings = props.storage.getDiscountSettings();
    // [MOD #demo-delivery] Load delivery schedule
    const deliveryDays = props.storage.getDeliveryDays();
    this.state = {
      showResetConfirm: false,
      // [MOD #demo-clear] Confirm dialog for wiping all data to blank.
      showClearConfirm: false,
      discountSettings,
      // [MOD #demo-delivery] Delivery day toggles.
      deliveryDays,
    };
  }

  _handleSignOut = () => {
    this.props.signOut();
    this.props.navigate('/login');
  };

  _handleResetData = () => {
    this.props.storage.resetToSeedData();
    // [MOD #001] Reload discount settings after reset
    const discountSettings = this.props.storage.getDiscountSettings();
    // [MOD #demo-delivery] Reload delivery days after reset
    const deliveryDays = this.props.storage.getDeliveryDays();
    this.setState({ showResetConfirm: false, discountSettings, deliveryDays });
    this.props.showToast('Data reset to defaults');
  };

  // [MOD #demo-clear] Wipe all data to empty for fresh-start testing.
  // WHY: Testers need to enter their own customers and orders without the
  // noise of pre-seeded demo accounts.
  _handleClearData = () => {
    this.props.storage.clearAllData();
    const discountSettings = this.props.storage.getDiscountSettings();
    // [MOD #demo-delivery] Reload delivery days after clear
    const deliveryDays = this.props.storage.getDeliveryDays();
    this.setState({ showClearConfirm: false, discountSettings, deliveryDays });
    this.props.showToast('All data cleared — starting fresh');
  };

  // [MOD #demo-delivery] Toggle a delivery day on/off.
  // WHY: At least one day must remain active or orders can never be placed.
  _handleToggleDeliveryDay = (dayNum) => {
    const { deliveryDays } = this.state;
    let updated;
    if (deliveryDays.includes(dayNum)) {
      // Prevent deselecting the last active day.
      if (deliveryDays.length <= 1) return;
      updated = deliveryDays.filter(d => d !== dayNum);
    } else {
      updated = [...deliveryDays, dayNum].sort((a, b) => a - b);
    }
    this.props.storage.updateDeliveryDays(updated);
    this.setState({ deliveryDays: updated });
  };

  // [MOD #001] Update a single discount cap field and persist to storage.
  // WHY: 4-level caps (per-item fixed/%, per-order fixed/%) editable by salesperson.
  // In production, accounting will control these from admin panel.
  _handleDiscountChange = (field, value) => {
    const numValue = Math.max(0, Number(value) || 0);
    const updated = { ...this.state.discountSettings, [field]: numValue };
    this.setState({ discountSettings: updated });
    this.props.storage.updateDiscountSettings(updated);
  };

  render() {
    const { user } = this.props;
    const { showResetConfirm, discountSettings, deliveryDays } = this.state;

    return (
      <div className="page">
        <PageHeader title="Settings" showBack onBack={() => this.props.navigate(-1)} />

        <div className={styles.content}>
          {/* User info */}
          <div className={styles.section}>
            <div className={styles.userCard}>
              <div className={styles.avatar}>
                <User size={32} />
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name || 'Unknown'}</span>
                <span className={styles.userEmail}>{user?.email || ''}</span>
                <span className={styles.userRole}>{user?.role || 'salesperson'}</span>
              </div>
            </div>
          </div>

          {/* Sync status */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Sync Status</h4>
            <div className={styles.row}>
              <RefreshCw size={18} className={styles.rowIcon} />
              <div className={styles.rowText}>
                <span>Data Storage</span>
                <span className={styles.rowSub}>Local (localStorage) — Phase 1</span>
              </div>
              <span className={styles.badge}>Offline</span>
            </div>
          </div>

          {/* Data management */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Data</h4>
            <MockFeatureBanner
              title="Demo: Data Management"
              description="These options exist because all data lives in your browser's localStorage. In production, data lives on the server and resets are admin-only operations."
            />
            <div
              className={styles.row}
              onClick={() => this.setState({ showResetConfirm: true })}
              role="button"
              tabIndex={0}
            >
              <Database size={18} className={styles.rowIcon} />
              <div className={styles.rowText}>
                <span>Reset Demo Data</span>
                <span className={styles.rowSub}>Restore all data to original seed values</span>
              </div>
              <Trash2 size={16} color="var(--color-danger)" />
            </div>
            {/* [MOD #demo-clear] Clear all data — blank slate for fresh-start testing */}
            <div
              className={styles.row}
              onClick={() => this.setState({ showClearConfirm: true })}
              role="button"
              tabIndex={0}
            >
              <Trash2 size={18} className={styles.rowIcon} />
              <div className={styles.rowText}>
                <span>Clear All Data</span>
                <span className={styles.rowSub}>Wipe everything — start from scratch</span>
              </div>
              <Trash2 size={16} color="var(--color-danger)" />
            </div>
          </div>

          {/* [MOD #001] Discount Caps — 4-level editable fields */}
          {/* WHY: Salesperson sets caps now; accounting controls later via admin. */}
          <div className={styles.section}>
            <MockFeatureBanner
              title="Demo: Editable Discount Caps"
              description="In production, your discount limits are assigned by accounting and locked to your user account. This editor lets you test how the pricing engine enforces caps during the demo."
            />
            <h4 className={styles.sectionTitle}>
              <Percent size={14} style={{ marginRight: 4, verticalAlign: 'text-bottom' }} />
              Discount Caps
            </h4>
            <div className={styles.discountGrid}>
              <div className={styles.discountField}>
                <label>Per-Item Max ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  value={discountSettings.perItemFixed}
                  onChange={e => this._handleDiscountChange('perItemFixed', e.target.value)}
                />
              </div>
              <div className={styles.discountField}>
                <label>Per-Item Max (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={discountSettings.perItemPercent}
                  onChange={e => this._handleDiscountChange('perItemPercent', e.target.value)}
                />
              </div>
              <div className={styles.discountField}>
                <label>Per-Order Max ($)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={discountSettings.perOrderFixed}
                  onChange={e => this._handleDiscountChange('perOrderFixed', e.target.value)}
                />
              </div>
              <div className={styles.discountField}>
                <label>Per-Order Max (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={discountSettings.perOrderPercent}
                  onChange={e => this._handleDiscountChange('perOrderPercent', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* [MOD #demo-delivery] Delivery Schedule — warehouse sets this in production */}
          <div className={styles.section}>
            <MockFeatureBanner
              title="Demo: Delivery Schedule"
              description="In production the warehouse sets available delivery days from the admin panel. Toggle days here to test how the order wizard restricts date selection."
            />
            <h4 className={styles.sectionTitle}>Delivery Schedule</h4>
            <div className={styles.dayToggles}>
              {[{ num: 1, label: 'Mon' }, { num: 2, label: 'Tue' }, { num: 3, label: 'Wed' },
                { num: 4, label: 'Thu' }, { num: 5, label: 'Fri' }, { num: 6, label: 'Sat' }, { num: 0, label: 'Sun' }]
                .map(({ num, label }) => (
                  <button
                    key={num}
                    type="button"
                    className={`${styles.dayToggle} ${deliveryDays.includes(num) ? styles.dayToggleActive : ''}`}
                    onClick={() => this._handleToggleDeliveryDay(num)}
                  >
                    {label}
                  </button>
                ))
              }
            </div>
            <p className={styles.dayToggleHint}>At least one day must remain active.</p>
          </div>

          {/* About */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>About</h4>
            <div className={styles.row}>
              <Info size={18} className={styles.rowIcon} />
              <div className={styles.rowText}>
                <span>Version</span>
                <span className={styles.rowSub}>1.0.0 — Phase 1 (MVP)</span>
              </div>
            </div>
            <div className={styles.row}>
              <MessageSquare size={18} className={styles.rowIcon} />
              <div className={styles.rowText}>
                <span>Send Feedback</span>
                <span className={styles.rowSub}>Report bugs or request features</span>
              </div>
            </div>
          </div>

          {/* Sign out */}
          <button className={styles.signOutBtn} onClick={this._handleSignOut}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {showResetConfirm && (
          <ConfirmDialog
            title="Reset All Data?"
            message="This will erase all changes and restore the original demo data. This cannot be undone."
            confirmLabel="Reset Data"
            danger
            onConfirm={this._handleResetData}
            onCancel={() => this.setState({ showResetConfirm: false })}
          />
        )}

        {/* [MOD #demo-clear] Clear confirm — wipes to empty, no re-seed */}
        {this.state.showClearConfirm && (
          <ConfirmDialog
            title="Clear All Data?"
            message="This wipes every customer, order, invoice, and product from the app and gives you a blank slate. The demo data will not come back until you clear your browser’s localStorage or click ‘Reset Demo Data’."
            confirmLabel="Clear Everything"
            danger
            onConfirm={this._handleClearData}
            onCancel={() => this.setState({ showClearConfirm: false })}
          />
        )}
      </div>
    );
  }
}

function SettingsWrapper(props) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { storage } = useApp();
  return <Settings {...props} navigate={navigate} user={user} signOut={signOut} storage={storage} />;
}

export default SettingsWrapper;
