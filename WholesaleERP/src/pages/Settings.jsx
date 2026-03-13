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
import styles from '../styles/Settings.module.css';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    // [MOD #001] Load discount settings from storage on init
    const discountSettings = props.storage.getDiscountSettings();
    this.state = {
      showResetConfirm: false,
      discountSettings,
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
    this.setState({ showResetConfirm: false, discountSettings });
    this.props.showToast('Data reset to defaults');
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
    const { showResetConfirm, discountSettings } = this.state;

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
          </div>

          {/* [MOD #001] Discount Caps — 4-level editable fields */}
          {/* WHY: Salesperson sets caps now; accounting controls later via admin. */}
          <div className={styles.section}>
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
