// ============================================================
// FILE: Reports.jsx
// PURPOSE: Single Balance Report — build by selecting customers,
//          filter by type, choose aging buckets, toggle invoice
//          breakdown vs balance-only. Contact info on every export.
// DEPENDS ON: PageHeader, AppContext, SendMessageModal
// DEPENDED ON BY: App.jsx (route: /reports)
//
// WHY THIS EXISTS:
//   Salespeople need to build collection reports on the fly:
//   pick which customers, which age bracket, and how much detail.
//   The report starts empty on purpose — showing everything at once
//   is noise. Salesperson builds the exact view they need before a call.
//   BUILD_PLAN.md §5.10: collection-focused only, no sales/revenue metrics.
//
// MODIFICATION HISTORY (newest first):
//   [MOD #branch] _buildReport uses parent account for invoice lookup on branches.
//     WHY: Invoices are always created on the parent (MockStorageService.updateOrderStatus
//     writes invoice.customerId = accountId). Selecting a branch without this fix
//     would generate an empty report card.
//     _renderSelectionPanel shows "(Branch of X)" label on branch rows.
//   [2026-03-14] #002 Complete redesign: single Balance Report replaces
//     three-tab Aging/Invoices/Balances layout. New flow: empty start →
//     select customers (search + type filter) → choose age buckets →
//     toggle invoice breakdown or balance-only → export/print with
//     full contact info per customer.
//     BEFORE: Three tabs, all data shown immediately.
//     WHY CHANGED: User request — empty until built, customer-centric
//     view, contact info on export for collection calls.
//     REVERT RISK: Three-tab layout gone; replaced entirely.
//   [2026-03-13] #001 Added date/customer filters, export CSV,
//     print, and send (email) for all report tabs.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, BarChart2, ChevronLeft,
  Download, Printer, Mail,
  User, Phone, AtSign, MapPin, RotateCcw, AlertTriangle, CheckCircle, Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SendMessageModal from '../components/SendMessageModal';
import styles from '../styles/Reports.module.css';

// WHY: Bucket definitions in one place — order matters for rendering.
const BUCKET_KEYS = ['current', '1-30', '31-60', '61-90', '90+'];
const BUCKET_META = {
  current:  { label: 'Current',     chipCls: 'chipCurrent',  barCls: 'barCurrent'  },
  '1-30':   { label: '1–30 Days',   chipCls: 'chip1to30',    barCls: 'bar1to30'    },
  '31-60':  { label: '31–60 Days',  chipCls: 'chip31to60',   barCls: 'bar31to60'   },
  '61-90':  { label: '61–90 Days',  chipCls: 'chip61to90',   barCls: 'bar61to90'   },
  '90+':    { label: '90+ Days',    chipCls: 'chip90plus',   barCls: 'bar90plus'   },
};

// ── [MOD #002] New class: BalanceReport ──────────────────────
// WHY: Renamed from Reports to BalanceReport to reflect single-report purpose.
//   Wrapped by ReportsWrapper (bottom) which injects navigate + storage.
class BalanceReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Raw data from storage
      customers: [],
      customersById: {}, // [MOD #branch] lookup map for branch parent names
      invoices: [],

      // ── Selection phase (pre-build) ──────────────────────
      searchQuery: '',
      filterType: '',       // e.g. 'Restaurant', 'Deli', 'Hotel' …
      selectedIds: new Set(),

      // ── Report options — chosen BEFORE build ───────────────
      // WHY: Salesperson decides what they want to see before generating,
      //   not after. Avoids confusion of re-generating to change scope.
      //   All buckets on by default; breakdown off (balance-only) by default.
      activeBuckets: new Set(BUCKET_KEYS),
      showBreakdown: false, // false = balance-only, true = invoice breakdown

      // ── Report state ─────────────────────────────────────
      reportBuilt: false,
      reportData: [],       // [{customer, buckets:{…}, totalBalance}]

      showEmailModal: false,
    };
  }

  componentDidMount() {
    const { storage } = this.props;
    const customers = storage.getCustomers();
    // [MOD #branch] Index customers by ID so _renderSelectionPanel can show parent names.
    const customersById = Object.fromEntries(customers.map(c => [c.id, c]));
    this.setState({
      customers,
      customersById,
      invoices:  storage.getInvoices(),
    });
  }

  // ── Helpers ─────────────────────────────────────────────

  _fmt(amt) {
    return '$' + Number(amt).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  _fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // WHY: Days overdue calculated once per invoice during build, not re-computed on render.
  _daysOverdue(dueDate) {
    return Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000);
  }

  // ── Customer selection helpers ───────────────────────────

  // WHY: Only derive unique types from loaded customers — never hard-code the list.
  _getCustomerTypes() {
    const { customers } = this.state;
    return [...new Set(customers.map(c => c.type).filter(Boolean))].sort();
  }

  _getFilteredCustomers() {
    const { customers, searchQuery, filterType } = this.state;
    // [MOD #branch] Reports run at the parent account level — branches share
    // the parent's invoices so including them separately would duplicate balances.
    // WHY: Invoice.customerId always = parentId (set in MockStorageService.updateOrderStatus).
    return customers.filter(c => {
      if (c.isBranch) return false;
      if (filterType && c.type !== filterType) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.code  && c.code.toLowerCase().includes(q)) ||
          (c.contact && c.contact.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }

  _handleSelectToggle(id) {
    this.setState(prev => {
      const next = new Set(prev.selectedIds);
      next.has(id) ? next.delete(id) : next.add(id);
      return { selectedIds: next };
    });
  }

  _handleSelectAll() {
    const filtered = this._getFilteredCustomers();
    this.setState(prev => {
      // Toggle: if all visible are already selected → deselect them; else select all.
      const allSelected = filtered.length > 0 && filtered.every(c => prev.selectedIds.has(c.id));
      const next = new Set(prev.selectedIds);
      if (allSelected) {
        filtered.forEach(c => next.delete(c.id));
      } else {
        filtered.forEach(c => next.add(c.id));
      }
      return { selectedIds: next };
    });
  }

  // ── Build report ─────────────────────────────────────────

  // WHY: Report computed once on "Build Report" press, not reactively on every
  //   state change. Filters (activeBuckets, showBreakdown) apply at render time
  //   so salesperson can toggle them without re-building.
  _buildReport() {
    const { customers, invoices, selectedIds } = this.state;

    const selected = customers.filter(c => selectedIds.has(c.id));

    const reportData = selected.map(customer => {
      // [MOD #branch] For branches: invoices live on the parent account.
      // WHY: MockStorageService.updateOrderStatus creates invoice.customerId = accountId (parent).
      //   Using customer.id for a branch would always return empty — no invoices found.
      const accountId = customer.parentId || customer.id;

      const openInvoices = invoices.filter(
        inv => inv.customerId === accountId && inv.status !== 'Paid'
      );

      const buckets = {
        current: { label: 'Current',    invoices: [], total: 0 },
        '1-30':  { label: '1–30 Days',  invoices: [], total: 0 },
        '31-60': { label: '31–60 Days', invoices: [], total: 0 },
        '61-90': { label: '61–90 Days', invoices: [], total: 0 },
        '90+':   { label: '90+ Days',   invoices: [], total: 0 },
      };

      openInvoices.forEach(inv => {
        const balance = inv.grandTotal - inv.amountPaid;
        const days    = this._daysOverdue(inv.dueDate);
        const entry   = { ...inv, balance, daysOverdue: days };

        if      (days <= 0)  { buckets.current.invoices.push(entry); buckets.current.total += balance; }
        else if (days <= 30) { buckets['1-30'].invoices.push(entry); buckets['1-30'].total  += balance; }
        else if (days <= 60) { buckets['31-60'].invoices.push(entry); buckets['31-60'].total += balance; }
        else if (days <= 90) { buckets['61-90'].invoices.push(entry); buckets['61-90'].total += balance; }
        else                 { buckets['90+'].invoices.push(entry);   buckets['90+'].total   += balance; }
      });

      const totalBalance = Object.values(buckets).reduce((s, b) => s + b.total, 0);
      // WHY: Account credit is cash on account not yet applied to an invoice.
      //   Net it against the gross A/R so the salesperson sees the true amount
      //   owed, not a misleading inflated figure.
      const accountCredit = customer.accountCredit || 0;
      const netBalance    = totalBalance - accountCredit;
      return { customer, buckets, totalBalance, accountCredit, netBalance };
    })
    // WHY: Filter on gross balance — customer has open invoices that need action.
    //   Unapplied credit still requires the salesperson to apply it; don't hide them.
    //   netBalance is shown on the card as informational, not as the include/exclude gate.
    .filter(row => row.totalBalance > 0)
    // WHY: Highest net balance first — biggest real exposures at top.
    .sort((a, b) => b.netBalance - a.netBalance);

    this.setState({ reportData, reportBuilt: true });
  }

  // ── Bucket filter chips ──────────────────────────────────

  _toggleBucket(key) {
    this.setState(prev => {
      const next = new Set(prev.activeBuckets);
      next.has(key) ? next.delete(key) : next.add(key);
      return { activeBuckets: next };
    });
  }

  // ── Grand totals for currently active buckets ────────────

  _getGrandTotals() {
    const { reportData, activeBuckets } = this.state;
    const totals = { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    let totalCredits = 0;
    reportData.forEach(({ buckets, accountCredit }) => {
      BUCKET_KEYS.forEach(k => { totals[k] += buckets[k].total; });
      totalCredits += accountCredit || 0;
    });
    // WHY: Grand total reflects net A/R — gross bucket totals minus all on-account credits.
    const grandTotal = BUCKET_KEYS
      .filter(k => activeBuckets.has(k))
      .reduce((s, k) => s + totals[k], 0) - totalCredits;
    return { totals, grandTotal, totalCredits };
  }

  // ── Export CSV with contact info ─────────────────────────

  // WHY: Contact info (name, phone, email, address) included on every export
  //   so the salesperson can use the CSV directly for collection calls without
  //   needing to look up each customer separately.
  _handleExport() {
    const { reportData, activeBuckets, showBreakdown } = this.state;
    const { showToast } = this.props;
    let csv = '';

    if (showBreakdown) {
      csv = 'Customer,Contact Person,Phone,Email,Address,Age Bucket,Invoice #,Due Date,Invoice Total,Balance,Days Overdue\n';
      reportData.forEach(({ customer, buckets }) => {
        BUCKET_KEYS.filter(k => activeBuckets.has(k)).forEach(key => {
          buckets[key].invoices.forEach(inv => {
            csv += [
              `"${customer.name}"`,
              `"${customer.contact  || ''}"`,
              `"${customer.phone    || ''}"`,
              `"${customer.email    || ''}"`,
              `"${customer.address  || ''}"`,
              `"${buckets[key].label}"`,
              `"${inv.invoiceNumber}"`,
              `"${inv.dueDate}"`,
              inv.grandTotal.toFixed(2),
              inv.balance.toFixed(2),
              inv.daysOverdue,
            ].join(',') + '\n';
          });
        });
      });
    } else {
      csv = 'Customer,Contact Person,Phone,Email,Address,Current,1-30 Days,31-60 Days,61-90 Days,90+ Days,Gross Balance,Account Credit,Net Balance\n';
      reportData.forEach(({ customer, buckets, totalBalance, accountCredit, netBalance }) => {
        const t = k => (activeBuckets.has(k) ? buckets[k].total.toFixed(2) : '0.00');
        csv += [
          `"${customer.name}"`,
          `"${customer.contact  || ''}"`,
          `"${customer.phone    || ''}"`,
          `"${customer.email    || ''}"`,
          `"${customer.address  || ''}"`,
          t('current'), t('1-30'), t('31-60'), t('61-90'), t('90+'),
          totalBalance.toFixed(2),
          (accountCredit || 0).toFixed(2),
          netBalance.toFixed(2),
        ].join(',') + '\n';
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `balance-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported');
  }

  // ── Render: selection panel ──────────────────────────────

  _renderSelectionPanel() {
    const { searchQuery, filterType, selectedIds, activeBuckets, showBreakdown } = this.state;
    const filtered   = this._getFilteredCustomers();
    const types      = this._getCustomerTypes();
    const allChecked = filtered.length > 0 && filtered.every(c => selectedIds.has(c.id));

    return (
      <div className={styles.selectionPanel}>

        <div className={styles.selectionHeader}>
          <span className={styles.selectionTitle}>Select Customers</span>
          {selectedIds.size > 0 && (
            <span className={styles.selectionCount}>{selectedIds.size} selected</span>
          )}
        </div>

        {/* Search + type filter */}
        <div className={styles.selectionFilters}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search name, code, contact…"
              value={searchQuery}
              onChange={e => this.setState({ searchQuery: e.target.value })}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => this.setState({ searchQuery: '' })}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            className={styles.typeFilter}
            value={filterType}
            onChange={e => this.setState({ filterType: e.target.value })}
          >
            <option value="">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Select-all row */}
        {filtered.length > 0 && (
          <label className={styles.selectAllRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={allChecked}
              onChange={() => this._handleSelectAll()}
            />
            <span className={styles.selectAllLabel}>
              Select all ({filtered.length})
            </span>
          </label>
        )}

        {/* Customer rows */}
        <div className={styles.customerPickList}>
          {filtered.map(c => {
            const { customersById } = this.state;
            const hasBalance = (c.balance || 0) > 0;
            // [MOD #branch] For branches: show parent name + branch address.
            // WHY: The balance on the branch is always $0, but rep may want to include
            //   it to see the parent's overdue invoices attributed to this location.
            return (
              <label key={c.id} className={styles.customerPickRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedIds.has(c.id)}
                  onChange={() => this._handleSelectToggle(c.id)}
                />
                <div className={styles.pickRowInfo}>
                  <span className={styles.pickRowName}>{c.name}</span>
                  {c.isBranch ? (
                    <span className={styles.pickRowMeta}>
                      Branch of {customersById[c.parentId]?.name || '?'}
                      {c.address && ` · ${c.address}`}
                    </span>
                  ) : (
                    <span className={styles.pickRowMeta}>{c.type} · {c.route}</span>
                  )}
                </div>
                {/* [MOD #branch] Show parent balance for branches since branch.balance = $0 */}
                <span className={hasBalance || c.isBranch ? styles.pickRowBal : styles.pickRowZero}>
                  {c.isBranch
                    ? this._fmt(customersById[c.parentId]?.balance || 0)
                    : this._fmt(c.balance || 0)}
                </span>
              </label>
            );
          })}
          {filtered.length === 0 && (
            <p className={styles.emptyPick}>No customers match your filters</p>
          )}
        </div>

        {/* Empty-state hint when nothing selected yet */}
        {selectedIds.size === 0 && filtered.length > 0 && (
          <p className={styles.emptyHint}>Select customers above to build a report</p>
        )}

        {/* ── Age buckets — chosen before build ────────────────── */}
        {/* WHY: Salesperson selects which aging brackets to include before
             generating so the output is scoped exactly as needed. */}
        <div className={styles.preBuildSection}>
          <span className={styles.preBuildLabel}>Include age buckets</span>
          <div className={styles.bucketChips}>
            {BUCKET_KEYS.map(key => {
              const active = activeBuckets.has(key);
              const meta   = BUCKET_META[key];
              return (
                <button
                  key={key}
                  className={`${styles.chip} ${active ? styles[meta.chipCls] : styles.chipOff}`}
                  onClick={() => this._toggleBucket(key)}
                >
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── View mode — chosen before build ─────────────────────── */}
        <div className={styles.preBuildSection}>
          <span className={styles.preBuildLabel}>Report detail</span>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleBtn} ${!showBreakdown ? styles.toggleActive : ''}`}
              onClick={() => this.setState({ showBreakdown: false })}
            >
              Balance Only
            </button>
            <button
              className={`${styles.toggleBtn} ${showBreakdown ? styles.toggleActive : ''}`}
              onClick={() => this.setState({ showBreakdown: true })}
            >
              Invoice Breakdown
            </button>
          </div>
        </div>

        {/* Build button */}
        <button
          className={styles.buildBtn}
          disabled={selectedIds.size === 0 || activeBuckets.size === 0}
          onClick={() => this._buildReport()}
        >
          <BarChart2 size={18} />
          Build Report
          {selectedIds.size > 0 && ` (${selectedIds.size})`}
        </button>
      </div>
    );
  }

  // ── Render: built report ─────────────────────────────────

  _renderReport() {
    const { reportData, activeBuckets, showBreakdown } = this.state;
    const { totals, grandTotal, totalCredits } = this._getGrandTotals();

    return (
      <div className={styles.reportPanel}>

        {/* Controls: back + actions */}
        <div className={styles.reportControls}>
          <button
            className={styles.backBtn}
            onClick={() => this.setState({ reportBuilt: false })}
          >
            <ChevronLeft size={16} /> Edit
          </button>
          <div className={styles.reportActions}>
            <button className={styles.actionBtn} onClick={() => this._handleExport()}>
              <Download size={16} /> Export
            </button>
            <button className={styles.actionBtn} onClick={() => window.print()}>
              <Printer size={16} /> Print
            </button>
            <button className={styles.actionBtn} onClick={() => this.setState({ showEmailModal: true })}>
              <Mail size={16} /> Send
            </button>
          </div>
        </div>

        {/* Grand total summary card */}
        <div className={styles.grandSummary}>
          <div>
            <span className={styles.grandLabel}>Net A/R</span>
            <span className={styles.grandSub}>
              {reportData.length} customer{reportData.length !== 1 ? 's' : ''}
              {totalCredits > 0 && ` · ${this._fmt(totalCredits)} credit`}
            </span>
          </div>
          <span className={styles.grandValue}>{this._fmt(grandTotal)}</span>
        </div>

        {/* Age bucket summary — read-only, shows selected buckets with totals.
             WHY: Buckets were chosen in selection phase; shown here as confirmation
             with live totals now that data is computed. */}
        <div className={styles.bucketChips}>
          {BUCKET_KEYS.filter(k => activeBuckets.has(k)).map(key => {
            const meta = BUCKET_META[key];
            return (
              <div
                key={key}
                className={`${styles.chip} ${styles[meta.chipCls]}`}
              >
                <span>{meta.label}</span>
                <span className={styles.chipAmt}>{this._fmt(totals[key])}</span>
              </div>
            );
          })}
        </div>

        {/* One card per customer */}
        <div className={styles.reportRows}>
          {reportData.map(({ customer, buckets, accountCredit, netBalance }) => {
            // WHY: Only count buckets the salesperson has toggled on.
            const visibleGross = BUCKET_KEYS
              .filter(k => activeBuckets.has(k))
              .reduce((s, k) => s + buckets[k].total, 0);
            // Net credit against the visible bucket total for this card's header amount.
            const visibleNet = Math.max(0, visibleGross - (accountCredit || 0));

            // Skip customer if selected buckets contain no invoices (gross = $0)
            if (visibleGross === 0) return null;

            return (
              <div key={customer.id} className={styles.customerCard}>

                {/* Header: name + net balance */}
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderLeft}>
                    <span className={styles.cardName}>{customer.name}</span>
                    <span className={styles.cardMeta}>{customer.code} · {customer.type}</span>
                  </div>
                  {/* WHY: Show net balance; if credit fully covers, show $0 in green
                       so salesperson knows to apply credit — not ignore the account. */}
                  <span className={`${styles.cardBalance} ${visibleNet === 0 ? styles.cardBalanceClear : ''}`}>
                    {this._fmt(visibleNet)}
                  </span>
                </div>

                {/* Contact info — always shown; critical for print and collection calls */}
                <div className={styles.cardContact}>
                  {customer.contact && (
                    <span className={styles.contactItem}>
                      <User size={12} /> {customer.contact}
                    </span>
                  )}
                  {customer.phone && (
                    <a href={`tel:${customer.phone}`} className={styles.contactLink}>
                      <Phone size={12} /> {customer.phone}
                    </a>
                  )}
                  {customer.email && (
                    <a href={`mailto:${customer.email}`} className={styles.contactLink}>
                      <AtSign size={12} /> {customer.email}
                    </a>
                  )}
                  {customer.address && (
                    <span className={styles.contactItem}>
                      <MapPin size={12} /> {customer.address}
                    </span>
                  )}
                </div>

                {/* Credit line — shown when customer has on-account credit to offset balance */}
                {accountCredit > 0 && (
                  <div className={styles.creditLine}>
                    <span className={styles.creditLabel}>Account Credit</span>
                    <span className={styles.creditAmt}>-{this._fmt(accountCredit)}</span>
                  </div>
                )}

                {/* ── Invoice breakdown mode ── */}
                {showBreakdown ? (
                  <div className={styles.breakdownWrap}>
                    {BUCKET_KEYS
                      .filter(k => activeBuckets.has(k) && buckets[k].invoices.length > 0)
                      .map(key => (
                        <div key={key} className={styles.breakdownBucket}>
                          <div className={`${styles.bucketBar} ${styles[BUCKET_META[key].barCls]}`}>
                            <span>{buckets[key].label}</span>
                            <span>{this._fmt(buckets[key].total)}</span>
                          </div>
                          {buckets[key].invoices.map(inv => (
                            <div
                              key={inv.id}
                              className={styles.invRow}
                              onClick={() => this.props.navigate(`/invoices/${inv.id}`)}
                              role="button"
                              tabIndex={0}
                            >
                              <div className={styles.invLeft}>
                                <span className={styles.invNum}>{inv.invoiceNumber}</span>
                                <span className={styles.invDue}>Due {this._fmtDate(inv.dueDate)}</span>
                              </div>
                              <div className={styles.invRight}>
                                {inv.daysOverdue > 0 && (
                                  <span className={styles.invOver}>{inv.daysOverdue}d over</span>
                                )}
                                <span className={styles.invBal}>{this._fmt(inv.balance)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  /* ── Balance-only mode ── */
                  <div className={styles.balSummary}>
                    {BUCKET_KEYS
                      .filter(k => activeBuckets.has(k) && buckets[k].total > 0)
                      .map(key => (
                        <div key={key} className={`${styles.balRow} ${styles[BUCKET_META[key].barCls]}`}>
                          <span className={styles.balLabel}>{buckets[key].label}</span>
                          <span className={styles.balAmt}>{this._fmt(buckets[key].total)}</span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            );
          })}

          {reportData.length === 0 && (
            <div className={styles.noResults}>
              <p>No outstanding balances for the selected customers</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main render ──────────────────────────────────────────

  render() {
    const { reportBuilt, showEmailModal } = this.state;
    // [MOD #salesReport] Added activeTab + onTabChange props for tab bar.
    // WHY: Wrapper manages which tab is active; both report classes render the
    //   same tab bar so the UX feels like a single tabbed page.
    const { activeTab, onTabChange } = this.props;

    return (
      <div className="page">
        {/* [MOD #salesReport] Title changed from "Balance Report" to "Reports"
             WHY: Page now contains two report types under shared header. */}
        <PageHeader title="Reports" />

        <div className={styles.tabBar}>
          <button
            className={`${styles.tab} ${activeTab === 'balance' ? styles.tabActive : ''}`}
            onClick={() => onTabChange('balance')}
          >
            Balance
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'sales' ? styles.tabActive : ''}`}
            onClick={() => onTabChange('sales')}
          >
            Sales
          </button>
        </div>

        <div className={styles.content}>
          {reportBuilt ? this._renderReport() : this._renderSelectionPanel()}
        </div>

        {showEmailModal && (
          <SendMessageModal
            title="Send Balance Report"
            recipientEmail=""
            subject="Balance Report"
            body="Please find the balance report attached."
            onSend={() => {
              this.setState({ showEmailModal: false });
              this.props.showToast('Report sent');
            }}
            onClose={() => this.setState({ showEmailModal: false })}
          />
        )}
      </div>
    );
  }
}

// ── Sales statuses counted as committed sales ─────────────────
// WHY: Draft = not yet committed; Cancelled = reversed.
//   Delivered, Picking, Submitted are all committed into the sales pipeline.
const SALES_STATUSES = new Set(['Delivered', 'Picking', 'Submitted']);

// ============================================================
// CLASS: SalesReport
// PURPOSE: Cases-only sales report. No revenue figures — only
//   number of cases per product. Filterable by date range,
//   customer type, or specific customer. Three breakdown modes:
//   no breakdown (totals), by date (daily/monthly), by customer.
//
// WHY THIS EXISTS:
//   Salesperson needs to see what moved (case volume) without
//   revenue numbers clouding the view. Breakdown modes mirror
//   how the monthly sales review is done: overall, day-by-day,
//   or per customer.
//
// MODIFICATION HISTORY:
//   [2026-03-14] #salesReport Initial creation.
// ============================================================
class SalesReport extends React.Component {
  constructor(props) {
    super(props);
    // WHY: Default date range = last 30 days so report is instantly
    //   useful without requiring manual filter entry.
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.state = {
      orders:      [],
      customers:   [],
      customersById: {},

      // ── Filters ───────────────────────────────────────────
      filterCustomerType: '',
      filterCustomerId: '',   // '' = all customers

      // ── Date range (applies when breakdownMode !== 'by-date') ──
      // WHY: When breakdown = by-date, the period defines the window;
      //   a separate date filter would conflict/confuse.
      filterDateFrom: thirtyDaysAgo.toISOString().slice(0, 10),
      filterDateTo:   today.toISOString().slice(0, 10),

      // ── Breakdown ─────────────────────────────────────────
      breakdownMode:       'none',   // 'none' | 'by-date' | 'by-customer'
      dateBreakdownPeriod: 'days30', // 'days30' | 'months6'

      // ── Report ────────────────────────────────────────────
      reportBuilt: false,
      reportData:  null,
    };
  }

  componentDidMount() {
    const { storage } = this.props;
    const customers = storage.getCustomers();
    const customersById = Object.fromEntries(customers.map(c => [c.id, c]));
    this.setState({
      orders: storage.getOrders(),
      customers,
      customersById,
    });
  }

  // ── Helpers ─────────────────────────────────────────────

  // WHY: Only derive types from loaded customers — never hard-code.
  _getCustomerTypes() {
    return [...new Set(this.state.customers.map(c => c.type).filter(Boolean))].sort();
  }

  // WHY: Branches share the parent's orders, so including them as separate
  //   filter options would cause double-counting. Parent accounts only.
  _getFilterableCustomers() {
    const { customers, filterCustomerType } = this.state;
    return customers.filter(c => {
      if (c.isBranch) return false;
      if (filterCustomerType && c.type !== filterCustomerType) return false;
      return true;
    });
  }

  // WHY: deliveryDate = when goods arrive and sale is realized.
  //   createdDate is fallback for orders not yet delivered.
  _getOrderDate(order) {
    return order.deliveryDate || order.createdDate;
  }

  // WHY: Generate period list once so both _buildReport and _renderByDate use
  //   the same set, preventing off-by-one mismatches.
  _getBreakdownPeriods(period) {
    const today = new Date();
    const periods = [];
    if (period === 'days30') {
      // 30 calendar days ending today, oldest first.
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateKey = d.toISOString().slice(0, 10);
        periods.push({
          key:   dateKey,
          label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        });
      }
    } else {
      // months6: current month + 5 previous = 6 months, oldest first.
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        periods.push({
          key:   monthKey,
          label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        });
      }
    }
    return periods;
  }

  _getFilteredOrders() {
    const {
      orders, customersById,
      filterCustomerType, filterCustomerId,
      breakdownMode, filterDateFrom, filterDateTo, dateBreakdownPeriod,
    } = this.state;

    return orders.filter(order => {
      if (!SALES_STATUSES.has(order.status)) return false;

      const customer = customersById[order.customerId];
      if (!customer) return false;

      // WHY: Branches inherit the parent's type, so filter against parent type.
      const parentCust = customer.isBranch
        ? (customersById[customer.parentId] || customer)
        : customer;

      if (filterCustomerType && parentCust.type !== filterCustomerType) return false;

      if (filterCustomerId) {
        const accountId = customer.isBranch ? customer.parentId : customer.id;
        if (accountId !== Number(filterCustomerId)) return false;
      }

      const orderDate = this._getOrderDate(order);
      if (!orderDate) return true;

      if (breakdownMode === 'by-date') {
        // Date window is defined by the breakdown period, not the date filter inputs.
        const today = new Date();
        let fromDate;
        if (dateBreakdownPeriod === 'days30') {
          const d = new Date(today);
          d.setDate(today.getDate() - 29); // 30 days inclusive of today
          fromDate = d.toISOString().slice(0, 10);
        } else {
          const d = new Date(today.getFullYear(), today.getMonth() - 5, 1);
          fromDate = d.toISOString().slice(0, 10);
        }
        const toDate = today.toISOString().slice(0, 10);
        return orderDate >= fromDate && orderDate <= toDate;
      } else {
        if (filterDateFrom && orderDate < filterDateFrom) return false;
        if (filterDateTo   && orderDate > filterDateTo)   return false;
        return true;
      }
    });
  }

  // ── Build report ─────────────────────────────────────────

  _buildReport() {
    const { breakdownMode, dateBreakdownPeriod, customersById } = this.state;
    const filtered = this._getFilteredOrders();

    let reportData;

    if (breakdownMode === 'none') {
      const casesMap = {};
      filtered.forEach(order => {
        order.lineItems.forEach(li => {
          if (!casesMap[li.productId]) {
            casesMap[li.productId] = {
              productId:   li.productId,
              productCode: li.productCode,
              productName: li.productName,
              totalCases:  0,
            };
          }
          casesMap[li.productId].totalCases += li.quantity;
        });
      });
      const products = Object.values(casesMap).sort((a, b) => b.totalCases - a.totalCases);
      reportData = {
        mode:       'none',
        products,
        totalCases: products.reduce((s, p) => s + p.totalCases, 0),
        orderCount: filtered.length,
      };

    } else if (breakdownMode === 'by-date') {
      const periods = this._getBreakdownPeriods(dateBreakdownPeriod);
      // Build a map: periodKey → { productId → {meta, totalCases} }
      const periodMap = {};
      periods.forEach(p => { periodMap[p.key] = {}; });

      let totalCases = 0;
      filtered.forEach(order => {
        const orderDate = this._getOrderDate(order);
        if (!orderDate) return;
        // WHY: Daily = exact date match; Monthly = first 7 chars (YYYY-MM).
        const periodKey = dateBreakdownPeriod === 'days30'
          ? orderDate
          : orderDate.slice(0, 7);

        if (!(periodKey in periodMap)) return; // outside window
        order.lineItems.forEach(li => {
          if (!periodMap[periodKey][li.productId]) {
            periodMap[periodKey][li.productId] = {
              productId:   li.productId,
              productCode: li.productCode,
              productName: li.productName,
              totalCases:  0,
            };
          }
          periodMap[periodKey][li.productId].totalCases += li.quantity;
          totalCases += li.quantity;
        });
      });

      const periodRows = periods.map(p => ({
        ...p,
        products:    Object.values(periodMap[p.key]).sort((a, b) => b.totalCases - a.totalCases),
        periodCases: Object.values(periodMap[p.key]).reduce((s, x) => s + x.totalCases, 0),
      }));

      reportData = {
        mode:                'by-date',
        dateBreakdownPeriod,
        periods:             periodRows,
        totalCases,
        orderCount:          filtered.length,
      };

    } else { // by-customer
      const customerMap = {};
      filtered.forEach(order => {
        const customer = customersById[order.customerId];
        if (!customer) return;
        // WHY: Map to parent so branch orders are attributed to the parent account.
        const custId = customer.isBranch ? customer.parentId : customer.id;
        const cust   = customersById[custId] || customer;

        if (!customerMap[custId]) {
          customerMap[custId] = { customer: cust, products: {}, totalCases: 0 };
        }
        order.lineItems.forEach(li => {
          if (!customerMap[custId].products[li.productId]) {
            customerMap[custId].products[li.productId] = {
              productId:   li.productId,
              productCode: li.productCode,
              productName: li.productName,
              totalCases:  0,
            };
          }
          customerMap[custId].products[li.productId].totalCases += li.quantity;
          customerMap[custId].totalCases += li.quantity;
        });
      });

      const custRows = Object.values(customerMap)
        .map(c => ({
          ...c,
          products: Object.values(c.products).sort((a, b) => b.totalCases - a.totalCases),
        }))
        .sort((a, b) => b.totalCases - a.totalCases);

      reportData = {
        mode:       'by-customer',
        customers:  custRows,
        totalCases: custRows.reduce((s, c) => s + c.totalCases, 0),
        orderCount: filtered.length,
      };
    }

    this.setState({ reportData, reportBuilt: true });
  }

  // ── Export CSV ───────────────────────────────────────────

  _handleExport() {
    const { reportData } = this.state;
    const { showToast } = this.props;
    if (!reportData) return;

    let csv = '';
    if (reportData.mode === 'none') {
      csv = 'Product Code,Product Name,Total Cases\n';
      reportData.products.forEach(p => {
        csv += `"${p.productCode}","${p.productName}",${p.totalCases}\n`;
      });
      csv += `,,Total,${reportData.totalCases}\n`;
    } else if (reportData.mode === 'by-date') {
      csv = 'Period,Product Code,Product Name,Cases\n';
      reportData.periods.forEach(period => {
        if (period.periodCases === 0) return;
        period.products.forEach(p => {
          csv += `"${period.label}","${p.productCode}","${p.productName}",${p.totalCases}\n`;
        });
      });
    } else {
      csv = 'Customer,Customer Type,Product Code,Product Name,Cases\n';
      reportData.customers.forEach(({ customer, products }) => {
        products.forEach(p => {
          csv += `"${customer.name}","${customer.type || ''}","${p.productCode}","${p.productName}",${p.totalCases}\n`;
        });
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported');
  }

  // ── Render: selection panel ──────────────────────────────

  _renderSelectionPanel() {
    const {
      filterCustomerType, filterCustomerId,
      filterDateFrom, filterDateTo,
      breakdownMode, dateBreakdownPeriod,
    } = this.state;
    const types               = this._getCustomerTypes();
    const filterableCustomers = this._getFilterableCustomers();

    return (
      <div className={styles.selectionPanel}>

        <div className={styles.selectionHeader}>
          <span className={styles.selectionTitle}>Sales Report</span>
        </div>

        {/* ── Customer filters ─────────────────────────────── */}
        <div className={styles.preBuildSection}>
          <span className={styles.preBuildLabel}>Filter by customer</span>
          <div className={styles.selectionFilters}>
            <select
              className={styles.typeFilter}
              style={{ flex: 1 }}
              value={filterCustomerType}
              onChange={e => this.setState({ filterCustomerType: e.target.value, filterCustomerId: '' })}
            >
              <option value="">All Types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              className={styles.typeFilter}
              style={{ flex: 2, minWidth: 0 }}
              value={filterCustomerId}
              onChange={e => this.setState({ filterCustomerId: e.target.value })}
            >
              <option value="">All Customers</option>
              {filterableCustomers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Date range — hidden when breakdown = by-date ──── */}
        {/* WHY: by-date breakdown defines its own date window (last 30 days /
             last 6 months). Showing a separate date filter would create conflicts. */}
        {breakdownMode !== 'by-date' && (
          <div className={styles.preBuildSection}>
            <span className={styles.preBuildLabel}>Date range</span>
            <div className={styles.salesDateRow}>
              <div className={styles.salesDateField}>
                <span className={styles.salesDateLabel}>From</span>
                <input
                  type="date"
                  className={styles.salesDateInput}
                  value={filterDateFrom}
                  onChange={e => this.setState({ filterDateFrom: e.target.value })}
                />
              </div>
              <div className={styles.salesDateField}>
                <span className={styles.salesDateLabel}>To</span>
                <input
                  type="date"
                  className={styles.salesDateInput}
                  value={filterDateTo}
                  onChange={e => this.setState({ filterDateTo: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Breakdown mode ───────────────────────────────── */}
        <div className={styles.preBuildSection}>
          <span className={styles.preBuildLabel}>Breakdown</span>
          <div className={styles.radioOpts}>
            {[
              { val: 'none',        label: 'No breakdown — totals only' },
              { val: 'by-date',     label: 'By date'                    },
              { val: 'by-customer', label: 'By customer'                },
            ].map(opt => (
              <label key={opt.val} className={styles.radioOpt}>
                <input
                  type="radio"
                  name="salesBreakdown"
                  value={opt.val}
                  checked={breakdownMode === opt.val}
                  onChange={() => this.setState({ breakdownMode: opt.val })}
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Sub-option: daily vs monthly — only when breakdown = by-date */}
          {breakdownMode === 'by-date' && (
            <div className={styles.viewToggle} style={{ marginTop: 6 }}>
              <button
                className={`${styles.toggleBtn} ${dateBreakdownPeriod === 'days30' ? styles.toggleActive : ''}`}
                onClick={() => this.setState({ dateBreakdownPeriod: 'days30' })}
              >
                Daily · Last 30 days
              </button>
              <button
                className={`${styles.toggleBtn} ${dateBreakdownPeriod === 'months6' ? styles.toggleActive : ''}`}
                onClick={() => this.setState({ dateBreakdownPeriod: 'months6' })}
              >
                Monthly · Last 6 months
              </button>
            </div>
          )}
        </div>

        <button className={styles.buildBtn} onClick={() => this._buildReport()}>
          <BarChart2 size={18} />
          Run Report
        </button>
      </div>
    );
  }

  // ── Render: shared product list ──────────────────────────

  // WHY: Used by all three breakdown modes — single source of truth for
  //   how a product row looks (name, code, case count).
  _renderProductList(products) {
    if (products.length === 0) {
      return <p className={styles.emptyPeriod}>No orders in this period</p>;
    }
    return (
      <div className={styles.salesProductList}>
        {products.map(p => (
          <div key={p.productId} className={styles.salesProductRow}>
            <div className={styles.salesProductInfo}>
              <span className={styles.salesProductName}>{p.productName}</span>
              <span className={styles.salesProductCode}>{p.productCode}</span>
            </div>
            <span className={styles.salesCaseBadge}>
              {p.totalCases.toLocaleString()}<span className={styles.salesCaseLabel}> cs</span>
            </span>
          </div>
        ))}
      </div>
    );
  }

  // ── Render: built report ─────────────────────────────────

  _renderReport() {
    const { reportData } = this.state;
    if (!reportData) return null;
    const { totalCases, orderCount } = reportData;

    return (
      <div className={styles.reportPanel}>

        {/* Controls: back + export/print */}
        <div className={styles.reportControls}>
          <button
            className={styles.backBtn}
            onClick={() => this.setState({ reportBuilt: false })}
          >
            <ChevronLeft size={16} /> Edit
          </button>
          <div className={styles.reportActions}>
            <button className={styles.actionBtn} onClick={() => this._handleExport()}>
              <Download size={16} /> Export
            </button>
            <button className={styles.actionBtn} onClick={() => window.print()}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Summary card: total cases + order count */}
        {/* WHY: No revenue shown — only cases. Report purpose is volume, not $. */}
        <div className={styles.grandSummary}>
          <div>
            <span className={styles.grandLabel}>Total Cases</span>
            <span className={styles.grandSub}>
              {orderCount} order{orderCount !== 1 ? 's' : ''}
            </span>
          </div>
          <span className={styles.grandValue}>{totalCases.toLocaleString()}</span>
        </div>

        {/* Mode-specific content */}
        {reportData.mode === 'none'        && this._renderNoBreakdown(reportData)}
        {reportData.mode === 'by-date'     && this._renderByDate(reportData)}
        {reportData.mode === 'by-customer' && this._renderByCustomer(reportData)}

        {totalCases === 0 && (
          <div className={styles.noResults}>
            <p>No orders found for the selected filters</p>
          </div>
        )}
      </div>
    );
  }

  _renderNoBreakdown({ products }) {
    if (products.length === 0) {
      return (
        <div className={styles.noResults}>
          <p>No orders found for the selected filters</p>
        </div>
      );
    }
    return (
      <div className={styles.customerCard}>
        {this._renderProductList(products)}
      </div>
    );
  }

  _renderByDate({ periods, dateBreakdownPeriod }) {
    const nonEmpty    = periods.filter(p => p.periodCases > 0);
    const hiddenCount = periods.length - nonEmpty.length;
    const unit        = dateBreakdownPeriod === 'days30' ? 'day' : 'month';

    return (
      <div className={styles.reportRows}>
        {hiddenCount > 0 && (
          /* WHY: Hide empty periods to reduce scrolling but tell the user they exist. */
          <p className={styles.emptyNote}>
            {hiddenCount} {unit}{hiddenCount !== 1 ? 's' : ''} with no orders hidden
          </p>
        )}
        {nonEmpty.map(period => (
          <div key={period.key} className={styles.customerCard}>
            <div className={styles.salesPeriodBar}>
              <span className={styles.salesPeriodLabel}>{period.label}</span>
              <span className={styles.salesPeriodCases}>{period.periodCases.toLocaleString()} cs</span>
            </div>
            {this._renderProductList(period.products)}
          </div>
        ))}
        {nonEmpty.length === 0 && (
          <div className={styles.noResults}><p>No orders in this period</p></div>
        )}
      </div>
    );
  }

  _renderByCustomer({ customers }) {
    if (customers.length === 0) {
      return (
        <div className={styles.noResults}>
          <p>No orders found for the selected filters</p>
        </div>
      );
    }
    return (
      <div className={styles.reportRows}>
        {customers.map(({ customer, products, totalCases }) => (
          <div key={customer.id} className={styles.customerCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <span className={styles.cardName}>{customer.name}</span>
                <span className={styles.cardMeta}>{customer.code} · {customer.type}</span>
              </div>
              <div className={styles.salesCustomerCases}>
                <span className={styles.salesCustomerCasesNum}>{totalCases.toLocaleString()}</span>
                <span className={styles.salesCustomerCasesUnit}>cases</span>
              </div>
            </div>
            {this._renderProductList(products)}
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { reportBuilt } = this.state;
    const { activeTab, onTabChange } = this.props;
    return (
      <div className="page">
        <PageHeader title="Reports" />
        <div className={styles.tabBar}>
          <button
            className={`${styles.tab} ${activeTab === 'balance' ? styles.tabActive : ''}`}
            onClick={() => onTabChange('balance')}
          >
            Balance
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'sales' ? styles.tabActive : ''}`}
            onClick={() => onTabChange('sales')}
          >
            Sales
          </button>
        </div>
        <div className={styles.content}>
          {reportBuilt ? this._renderReport() : this._renderSelectionPanel()}
        </div>
      </div>
    );
  }
}

// ============================================================
// CLASS: ReturnsReport
// PURPOSE: Display returns data — total returns, credit amounts,
//   damaged item counts. Filterable by status and date range.
//
// WHY THIS EXISTS:
//   Salesperson needs visibility into returns for customer service
//   follow-up and damaged inventory tracking. Shows which returns
//   are pending processing vs already credited.
//
// MODIFICATION HISTORY:
//   [2026-03-14] #returns Initial creation.
// ============================================================
class ReturnsReport extends React.Component {
  constructor(props) {
    super(props);
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.state = {
      returns:       [],
      customers:     [],
      customersById: {},

      // ── Filters ───────────────────────────────────────────
      filterStatus:   '',  // '' = all, 'Pending', 'Processed'
      filterDateFrom: thirtyDaysAgo.toISOString().slice(0, 10),
      filterDateTo:   today.toISOString().slice(0, 10),

      // ── Report ────────────────────────────────────────────
      reportBuilt: false,
      reportData:  null,
    };
  }

  componentDidMount() {
    const { storage } = this.props;
    const customers = storage.getCustomers();
    const customersById = Object.fromEntries(customers.map(c => [c.id, c]));
    this.setState({
      returns:       storage.getReturns(),
      customers,
      customersById,
    });
  }

  // ── Helpers ─────────────────────────────────────────────

  _fmt(amt) {
    return '$' + Number(amt).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  _fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  _getFilteredReturns() {
    const { returns, filterStatus, filterDateFrom, filterDateTo } = this.state;
    return returns.filter(ret => {
      if (filterStatus && ret.status !== filterStatus) return false;
      const retDate = ret.createdDate;
      if (filterDateFrom && retDate < filterDateFrom) return false;
      if (filterDateTo   && retDate > filterDateTo)   return false;
      return true;
    });
  }

  // ── Build report ─────────────────────────────────────────

  _buildReport() {
    const { customersById } = this.state;
    const filtered = this._getFilteredReturns();

    // Aggregate by customer
    const customerMap = {};
    let totalCredit = 0;
    let totalDamagedItems = 0;
    let pendingCount = 0;
    let processedCount = 0;

    filtered.forEach(ret => {
      const custId = ret.customerId;
      const customer = customersById[custId];

      if (!customerMap[custId]) {
        customerMap[custId] = {
          customer,
          returns:       [],
          totalCredit:   0,
          damagedItems:  0,
          pendingCount:  0,
          processedCount: 0,
        };
      }

      customerMap[custId].returns.push(ret);
      customerMap[custId].totalCredit += ret.grandTotal || 0;
      totalCredit += ret.grandTotal || 0;

      // Count damaged items
      const damaged = ret.lineItems.filter(li => li.isDamaged).length;
      customerMap[custId].damagedItems += damaged;
      totalDamagedItems += damaged;

      if (ret.status === 'Pending') {
        pendingCount++;
        customerMap[custId].pendingCount++;
      } else {
        processedCount++;
        customerMap[custId].processedCount++;
      }
    });

    const customerRows = Object.values(customerMap)
      .sort((a, b) => b.totalCredit - a.totalCredit);

    const reportData = {
      customerRows,
      totalReturns:     filtered.length,
      totalCredit,
      totalDamagedItems,
      pendingCount,
      processedCount,
    };

    this.setState({ reportData, reportBuilt: true });
  }

  // ── Export CSV ───────────────────────────────────────────

  _handleExport() {
    const { reportData } = this.state;
    const { showToast } = this.props;
    if (!reportData) return;

    let csv = 'Return #,Customer,Date,Status,Reason,Total Credit,Damaged Items\n';
    reportData.customerRows.forEach(({ returns, customer }) => {
      returns.forEach(ret => {
        const damaged = ret.lineItems.filter(li => li.isDamaged).length;
        csv += [
          `"${ret.returnNumber}"`,
          `"${customer?.name || '?'}"`,
          `"${ret.createdDate}"`,
          `"${ret.status}"`,
          `"${ret.returnReason || ''}"`,
          ret.grandTotal.toFixed(2),
          damaged,
        ].join(',') + '\n';
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `returns-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported');
  }

  // ── Render: selection panel ──────────────────────────────

  _renderSelectionPanel() {
    const { filterStatus, filterDateFrom, filterDateTo } = this.state;

    return (
      <div className={styles.selectionPanel}>

        <div className={styles.selectionHeader}>
          <span className={styles.selectionTitle}>Returns Report</span>
        </div>

        {/* ── Status filter ────────────────────────────────── */}
        <div className={styles.preBuildSection}>
          <span className={styles.preBuildLabel}>Filter by status</span>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleBtn} ${filterStatus === '' ? styles.toggleActive : ''}`}
              onClick={() => this.setState({ filterStatus: '' })}
            >
              All
            </button>
            <button
              className={`${styles.toggleBtn} ${filterStatus === 'Pending' ? styles.toggleActive : ''}`}
              onClick={() => this.setState({ filterStatus: 'Pending' })}
            >
              Pending
            </button>
            <button
              className={`${styles.toggleBtn} ${filterStatus === 'Processed' ? styles.toggleActive : ''}`}
              onClick={() => this.setState({ filterStatus: 'Processed' })}
            >
              Processed
            </button>
          </div>
        </div>

        {/* ── Date range ───────────────────────────────────── */}
        <div className={styles.preBuildSection}>
          <span className={styles.preBuildLabel}>Date range</span>
          <div className={styles.salesDateRow}>
            <div className={styles.salesDateField}>
              <span className={styles.salesDateLabel}>From</span>
              <input
                type="date"
                className={styles.salesDateInput}
                value={filterDateFrom}
                onChange={e => this.setState({ filterDateFrom: e.target.value })}
              />
            </div>
            <div className={styles.salesDateField}>
              <span className={styles.salesDateLabel}>To</span>
              <input
                type="date"
                className={styles.salesDateInput}
                value={filterDateTo}
                onChange={e => this.setState({ filterDateTo: e.target.value })}
              />
            </div>
          </div>
        </div>

        <button className={styles.buildBtn} onClick={() => this._buildReport()}>
          <RotateCcw size={18} />
          Run Report
        </button>
      </div>
    );
  }

  // ── Render: built report ─────────────────────────────────

  _renderReport() {
    const { navigate } = this.props;
    const { reportData } = this.state;
    if (!reportData) return null;
    const { customerRows, totalReturns, totalCredit, totalDamagedItems, pendingCount, processedCount } = reportData;

    return (
      <div className={styles.reportPanel}>

        {/* Controls: back + export/print */}
        <div className={styles.reportControls}>
          <button
            className={styles.backBtn}
            onClick={() => this.setState({ reportBuilt: false })}
          >
            <ChevronLeft size={16} /> Edit
          </button>
          <div className={styles.reportActions}>
            <button className={styles.actionBtn} onClick={() => this._handleExport()}>
              <Download size={16} /> Export
            </button>
            <button className={styles.actionBtn} onClick={() => window.print()}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className={styles.grandSummary}>
          <div>
            <span className={styles.grandLabel}>Total Credit</span>
            <span className={styles.grandSub}>
              {totalReturns} return{totalReturns !== 1 ? 's' : ''}
            </span>
          </div>
          <span className={styles.grandValue}>{this._fmt(totalCredit)}</span>
        </div>

        {/* Status + damage summary chips */}
        <div className={styles.bucketChips}>
          <div className={`${styles.chip} ${styles.chip1to30}`}>
            <Clock size={14} />
            <span>Pending: {pendingCount}</span>
          </div>
          <div className={`${styles.chip} ${styles.chipCurrent}`}>
            <CheckCircle size={14} />
            <span>Processed: {processedCount}</span>
          </div>
          {totalDamagedItems > 0 && (
            <div className={`${styles.chip} ${styles.chip90plus}`}>
              <AlertTriangle size={14} />
              <span>Damaged Items: {totalDamagedItems}</span>
            </div>
          )}
        </div>

        {/* Customer cards with returns */}
        <div className={styles.reportRows}>
          {customerRows.map(({ customer, returns, totalCredit: custCredit, damagedItems }) => (
            <div key={customer?.id || 'unknown'} className={styles.customerCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderLeft}>
                  <span className={styles.cardName}>{customer?.name || 'Unknown'}</span>
                  <span className={styles.cardMeta}>
                    {returns.length} return{returns.length !== 1 ? 's' : ''}
                    {damagedItems > 0 && ` · ${damagedItems} damaged`}
                  </span>
                </div>
                <span className={styles.cardBalance}>{this._fmt(custCredit)}</span>
              </div>

              {/* Individual returns */}
              <div className={styles.breakdownWrap}>
                {returns.map(ret => (
                  <div
                    key={ret.id}
                    className={styles.invRow}
                    onClick={() => navigate(`/returns/${ret.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.invLeft}>
                      <span className={styles.invNum}>{ret.returnNumber}</span>
                      <span className={styles.invDue}>{this._fmtDate(ret.createdDate)} · {ret.returnReason || ''}</span>
                    </div>
                    <div className={styles.invRight}>
                      <span className={ret.status === 'Pending' ? styles.invOver : styles.invBal}>
                        {ret.status}
                      </span>
                      <span className={styles.invBal}>{this._fmt(ret.grandTotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {customerRows.length === 0 && (
            <div className={styles.noResults}>
              <p>No returns found for the selected filters</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const { reportBuilt } = this.state;
    const { activeTab, onTabChange } = this.props;
    return (
      <div className="page">
        <PageHeader title="Reports" />
        <div className={styles.tabBar}>
          <button
            className={`${styles.tab} ${activeTab === 'balance' ? styles.tabActive : ''}`}
            onClick={() => onTabChange('balance')}
          >
            Balance
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'sales' ? styles.tabActive : ''}`}
            onClick={() => onTabChange('sales')}
          >
            Sales
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'returns' ? styles.tabActive : ''}`}
            onClick={() => onTabChange('returns')}
          >
            Returns
          </button>
        </div>
        <div className={styles.content}>
          {reportBuilt ? this._renderReport() : this._renderSelectionPanel()}
        </div>
      </div>
    );
  }
}

// ── Wrapper injects router + storage ─────────────────────────
// WHY: Class components can't use hooks directly; wrapper manages tab state
//   and injects navigate/storage/showToast/activeTab/onTabChange.
//
// [MOD #salesReport] Added tab state management (activeTab, setActiveTab) and
//   conditional rendering of SalesReport vs BalanceReport.
//   BEFORE: Always rendered BalanceReport.
//   WHY CHANGED: Two report types now live under one /reports route.
// [MOD #returns] Added ReturnsReport tab.
// [MOD #nav] Changed from conditional rendering to CSS hiding.
//   BEFORE: Only the active tab was mounted; switching tabs lost state.
//   WHY CHANGED: Preserve report state (selections, filters) when switching tabs.
//   REVERT RISK: Slight memory overhead having all 3 reports mounted.
function ReportsWrapper(props) {
  const navigate = useNavigate();
  const { storage } = useApp();
  const [activeTab, setActiveTab] = React.useState('balance');

  // [MOD #nav] Render all tabs, hide inactive with CSS to preserve state
  return (
    <>
      <div style={{ display: activeTab === 'balance' ? 'block' : 'none' }}>
        <BalanceReport
          {...props}
          navigate={navigate}
          storage={storage}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      <div style={{ display: activeTab === 'sales' ? 'block' : 'none' }}>
        <SalesReport
          {...props}
          navigate={navigate}
          storage={storage}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </>
  );
}

export default ReportsWrapper;

// ── DEAD CODE REMOVED IN #002 ─────────────────────────────────
// The following were removed: REPORT_TABS constant, _getFilteredInvoices(),
// _getAgingData(), _renderAging(), _renderOpenInvoices(), _renderBalances(),
// _handleExport (old per-tab version). All replaced by single-report flow above.
// Do NOT restore without reverting the full UI spec change.

// ── end of file ───────────────────────────────────────────────
