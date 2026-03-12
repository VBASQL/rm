// ============================================================
// FILE: OrderHistory.jsx
// PURPOSE: Scrollable list of all orders with search, status
//          filter chips, tap → OrderDetail.
// DEPENDS ON: PageHeader, SearchBar, StatusBadge, EmptyState, AppContext
// DEPENDED ON BY: App.jsx (route: /orders)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.8: Past-order list with search/filter,
//   newest first, each row shows order #, customer, date,
//   status, total cases.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import styles from '../styles/OrderHistory.module.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Submitted', label: 'Submitted' },
  { key: 'Picking', label: 'Picking' },
  { key: 'Shipped', label: 'Shipped' },
  { key: 'Delivered', label: 'Delivered' },
  { key: 'Cancelled', label: 'Cancelled' },
];

class OrderHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      customers: {},
      search: '',
      filter: 'all',
    };
  }

  componentDidMount() {
    this._loadData();
  }

  _loadData() {
    const { storage } = this.props;
    const orders = storage.getOrders();
    // WHY: Build lookup map so we can show customer names without N+1 calls
    const customerList = storage.getCustomers();
    const customers = {};
    customerList.forEach(c => { customers[c.id] = c; });
    this.setState({ orders, customers });
  }

  _formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  _getFiltered() {
    const { orders, customers, search, filter } = this.state;
    let filtered = [...orders];

    if (filter !== 'all') {
      filtered = filtered.filter(o => o.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(o => {
        const cust = customers[o.customerId];
        const custName = cust ? cust.name.toLowerCase() : '';
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          custName.includes(q)
        );
      });
    }

    // WHY: newest first so salesperson sees most recent activity
    filtered.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    return filtered;
  }

  render() {
    const { navigate } = this.props;
    const { search, filter } = this.state;
    const filtered = this._getFiltered();

    return (
      <div className="page">
        <PageHeader title="Orders" />

        <div className={styles.content}>
          <SearchBar
            value={search}
            onSearch={v => this.setState({ search: v })}
            placeholder="Search orders…"
            filters={FILTERS}
            activeFilter={filter}
            onFilterChange={f => this.setState({ filter: f })}
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No orders"
              message={search || filter !== 'all' ? 'Try different search or filters' : 'No orders yet'}
            />
          ) : (
            <div className={styles.list}>
              {filtered.map(order => {
                const cust = this.state.customers[order.customerId];
                return (
                  <div
                    key={order.id}
                    className={styles.row}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.rowMain}>
                      <span className={styles.orderNum}>{order.orderNumber}</span>
                      <StatusBadge status={order.status} small />
                    </div>
                    <div className={styles.rowSub}>
                      <span>{cust ? cust.name : 'Unknown'}</span>
                      <span>{this._formatDate(order.createdDate)}</span>
                    </div>
                    <div className={styles.rowMeta}>
                      <span>{order.totalCases} cases</span>
                      <span className={styles.total}>${order.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
}

function OrderHistoryWrapper(props) {
  const navigate = useNavigate();
  const { storage } = useApp();
  return <OrderHistory {...props} navigate={navigate} storage={storage} />;
}

export default OrderHistoryWrapper;
