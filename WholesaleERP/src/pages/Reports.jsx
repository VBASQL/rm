// ============================================================
// FILE: Reports.jsx
// PURPOSE: Collection-focused reports — Aging, Open Invoices,
//          Customer Balances. No sales metrics per BUILD_PLAN §5.11.
// DEPENDS ON: PageHeader, AppContext, SendMessageModal
// DEPENDED ON BY: App.jsx (route: /reports)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.11: Three report types — Aging Report
//   (age buckets), Open Invoices list, Customer Balances summary.
//   Collection-focused only. No sales or revenue numbers.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-13] #001 Added date/customer filters, export CSV,
//     print, and send (email) for all report tabs.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, Users, Download, Printer, Mail, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import SendMessageModal from '../components/SendMessageModal';
import styles from '../styles/Reports.module.css';

const REPORT_TABS = [
  { key: 'aging', label: 'Aging', icon: Clock },
  { key: 'invoices', label: 'Invoices', icon: FileText },
  { key: 'balances', label: 'Balances', icon: Users },
];

class Reports extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'aging',
      invoices: [],
      customers: [],
      // [MOD #001] Filters
      filterCustomerId: '',
      filterDateFrom: '',
      filterDateTo: '',
      showFilters: false,
      showEmailModal: false,
    };
  }

  componentDidMount() {
    const { storage } = this.props;
    const invoices = storage.getInvoices();
    const customers = storage.getCustomers();
    this.setState({ invoices, customers });
  }

  _formatCurrency(amt) {
    return '$' + Number(amt).toLocaleString('en-US', { minimumFractionDigits: 2 });
  }

  _formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  _getDaysOverdue(dueDate) {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = Math.floor((now - due) / (1000 * 60 * 60 * 24));
    return diff;
  }

  // [MOD #001] Apply customer & date filters to invoices
  _getFilteredInvoices() {
    const { invoices, filterCustomerId, filterDateFrom, filterDateTo } = this.state;
    return invoices.filter(inv => {
      if (filterCustomerId && inv.customerId !== Number(filterCustomerId)) return false;
      if (filterDateFrom && inv.dueDate < filterDateFrom) return false;
      if (filterDateTo && inv.dueDate > filterDateTo) return false;
      return true;
    });
  }

  // WHY: Aging buckets are standard AR aging: Current, 1-30, 31-60, 61-90, 90+
  _getAgingData() {
    const filteredInvoices = this._getFilteredInvoices();
    const { customers } = this.state;
    const openInvoices = filteredInvoices.filter(inv => inv.status !== 'Paid');
    const custMap = {};
    customers.forEach(c => { custMap[c.id] = c; });

    const buckets = {
      current: { label: 'Current', total: 0, invoices: [] },
      '1-30': { label: '1-30 Days', total: 0, invoices: [] },
      '31-60': { label: '31-60 Days', total: 0, invoices: [] },
      '61-90': { label: '61-90 Days', total: 0, invoices: [] },
      '90+': { label: '90+ Days', total: 0, invoices: [] },
    };

    openInvoices.forEach(inv => {
      const balance = inv.grandTotal - inv.amountPaid;
      const days = this._getDaysOverdue(inv.dueDate);
      const entry = { ...inv, balance, daysOverdue: days, customerName: custMap[inv.customerId]?.name || 'Unknown' };

      if (days <= 0) { buckets.current.total += balance; buckets.current.invoices.push(entry); }
      else if (days <= 30) { buckets['1-30'].total += balance; buckets['1-30'].invoices.push(entry); }
      else if (days <= 60) { buckets['31-60'].total += balance; buckets['31-60'].invoices.push(entry); }
      else if (days <= 90) { buckets['61-90'].total += balance; buckets['61-90'].invoices.push(entry); }
      else { buckets['90+'].total += balance; buckets['90+'].invoices.push(entry); }
    });

    return buckets;
  }

  _renderAging() {
    const buckets = this._getAgingData();
    const totalAR = Object.values(buckets).reduce((sum, b) => sum + b.total, 0);

    return (
      <div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total A/R</span>
          <span className={styles.summaryValue}>{this._formatCurrency(totalAR)}</span>
        </div>

        {Object.entries(buckets).map(([key, bucket]) => (
          <div key={key} className={styles.bucketSection}>
            <div className={styles.bucketHeader}>
              <span>{bucket.label}</span>
              <span className={styles.bucketTotal}>{this._formatCurrency(bucket.total)}</span>
            </div>
            {bucket.invoices.length > 0 && (
              <div className={styles.bucketList}>
                {bucket.invoices.map(inv => (
                  <div
                    key={inv.id}
                    className={styles.bucketRow}
                    onClick={() => this.props.navigate(`/invoices/${inv.id}`)}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <span className={styles.bucketInvNum}>{inv.invoiceNumber}</span>
                      <span className={styles.bucketCust}>{inv.customerName}</span>
                    </div>
                    <span className={styles.bucketAmt}>{this._formatCurrency(inv.balance)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  _renderOpenInvoices() {
    const { customers, filterCustomerId } = this.state;
    const custMap = {};
    customers.forEach(c => { custMap[c.id] = c; });
    const filteredInvoices = this._getFilteredInvoices();
    const open = filteredInvoices
      .filter(inv => inv.status !== 'Paid')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return (
      <div className={styles.invoiceList}>
        {open.map(inv => {
          const balance = inv.grandTotal - inv.amountPaid;
          return (
            <div
              key={inv.id}
              className={styles.invoiceRow}
              onClick={() => this.props.navigate(`/invoices/${inv.id}`)}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.invoiceRowTop}>
                <span className={styles.invoiceNum}>{inv.invoiceNumber}</span>
                <StatusBadge status={inv.status} small />
              </div>
              <div className={styles.invoiceRowMid}>
                <span>{custMap[inv.customerId]?.name || 'Unknown'}</span>
                <span>Due: {this._formatDate(inv.dueDate)}</span>
              </div>
              <div className={styles.invoiceRowBot}>
                <span>Total: {this._formatCurrency(inv.grandTotal)}</span>
                <span className={styles.balanceText}>Balance: {this._formatCurrency(balance)}</span>
              </div>
            </div>
          );
        })}
        {open.length === 0 && (
          <p className={styles.emptyText}>No open invoices</p>
        )}
      </div>
    );
  }

  _renderBalances() {
    const { customers, filterCustomerId } = this.state;
    let filtered = [...customers].filter(c => c.balance > 0);
    if (filterCustomerId) {
      filtered = filtered.filter(c => c.id === Number(filterCustomerId));
    }
    const sorted = filtered.sort((a, b) => b.balance - a.balance);
    const totalBalance = sorted.reduce((sum, c) => sum + c.balance, 0);

    return (
      <div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Outstanding</span>
          <span className={styles.summaryValue}>{this._formatCurrency(totalBalance)}</span>
        </div>

        <div className={styles.balanceList}>
          {sorted.map(c => (
            <div
              key={c.id}
              className={styles.balanceRow}
              onClick={() => this.props.navigate(`/customers/${c.id}`)}
              role="button"
              tabIndex={0}
            >
              <div>
                <span className={styles.balanceName}>{c.name}</span>
                <StatusBadge status={c.status} small />
              </div>
              <span className={styles.balanceAmt}>{this._formatCurrency(c.balance)}</span>
            </div>
          ))}
          {sorted.length === 0 && (
            <p className={styles.emptyText}>No outstanding balances</p>
          )}
        </div>
      </div>
    );
  }

  // [MOD #001] Export current report tab as CSV
  _handleExport = () => {
    const { activeTab, customers } = this.state;
    const { showToast } = this.props;
    let csv = '';
    const custMap = {};
    customers.forEach(c => { custMap[c.id] = c; });

    if (activeTab === 'aging') {
      const buckets = this._getAgingData();
      csv = 'Bucket,Invoice,Customer,Balance\n';
      Object.entries(buckets).forEach(([, bucket]) => {
        bucket.invoices.forEach(inv => {
          csv += `"${bucket.label}","${inv.invoiceNumber}","${inv.customerName}",${inv.balance.toFixed(2)}\n`;
        });
      });
    } else if (activeTab === 'invoices') {
      const open = this._getFilteredInvoices().filter(inv => inv.status !== 'Paid');
      csv = 'Invoice,Customer,Status,Due Date,Total,Balance\n';
      open.forEach(inv => {
        const balance = inv.grandTotal - inv.amountPaid;
        csv += `"${inv.invoiceNumber}","${custMap[inv.customerId]?.name || ''}","${inv.status}","${inv.dueDate}",${inv.grandTotal.toFixed(2)},${balance.toFixed(2)}\n`;
      });
    } else {
      csv = 'Customer,Balance\n';
      customers.filter(c => c.balance > 0).forEach(c => {
        csv += `"${c.name}",${c.balance.toFixed(2)}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported');
  };

  // [MOD #001] Print
  _handlePrint = () => {
    window.print();
  };

  // [MOD #001] Send via email
  _handleSend = () => {
    this.setState({ showEmailModal: true });
  };

  render() {
    const { activeTab, customers, showFilters, filterCustomerId, filterDateFrom, filterDateTo, showEmailModal } = this.state;

    return (
      <div className="page">
        <PageHeader title="Reports" />

        <div className={styles.content}>
          <div className={styles.tabs}>
            {REPORT_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
                  onClick={() => this.setState({ activeTab: tab.key })}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* [MOD #001] Action bar: filter toggle, export, print, send */}
          <div className={styles.actionBar}>
            <button className={styles.actionBtn} onClick={() => this.setState(p => ({ showFilters: !p.showFilters }))}>
              <Filter size={16} /> Filter
            </button>
            <button className={styles.actionBtn} onClick={this._handleExport}>
              <Download size={16} /> Export
            </button>
            <button className={styles.actionBtn} onClick={this._handlePrint}>
              <Printer size={16} /> Print
            </button>
            <button className={styles.actionBtn} onClick={this._handleSend}>
              <Mail size={16} /> Send
            </button>
          </div>

          {/* [MOD #001] Filter panel */}
          {showFilters && (
            <div className={styles.filterPanel}>
              <div className={styles.filterField}>
                <label>Customer</label>
                <select
                  value={filterCustomerId}
                  onChange={e => this.setState({ filterCustomerId: e.target.value })}
                  className="form-input"
                >
                  <option value="">All Customers</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterField}>
                <label>From</label>
                <input
                  type="date"
                  className="form-input"
                  value={filterDateFrom}
                  onChange={e => this.setState({ filterDateFrom: e.target.value })}
                />
              </div>
              <div className={styles.filterField}>
                <label>To</label>
                <input
                  type="date"
                  className="form-input"
                  value={filterDateTo}
                  onChange={e => this.setState({ filterDateTo: e.target.value })}
                />
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => this.setState({ filterCustomerId: '', filterDateFrom: '', filterDateTo: '' })}
              >
                Clear
              </button>
            </div>
          )}

          {activeTab === 'aging' && this._renderAging()}
          {activeTab === 'invoices' && this._renderOpenInvoices()}
          {activeTab === 'balances' && this._renderBalances()}
        </div>

        {/* [MOD #001] Email modal for sending reports */}
        {showEmailModal && (
          <SendMessageModal
            title={`Send ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`}
            recipientEmail=""
            subject={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`}
            body={`Please find the ${activeTab} report attached.`}
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

function ReportsWrapper(props) {
  const navigate = useNavigate();
  const { storage } = useApp();
  return <Reports {...props} navigate={navigate} storage={storage} />;
}

export default ReportsWrapper;
