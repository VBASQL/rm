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
//   [2026-03-13] #001 Removed 'Shipped' filter chip.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/format';
import styles from '../styles/OrderHistory.module.css';

// [MOD #001] Removed 'Shipped' — flow is now Picking → Delivered.
// [MOD #returns-list] Added Return filter so returns appear alongside orders.
const FILTERS = [
  { value: 'all',       label: 'All' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Picking',   label: 'Picking' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Return',    label: 'Returns' },
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

    // [MOD #returns-list] Merge returns into the order list as _isReturn items.
    // WHY: Accounting needs to see returns alongside orders. Returns show with
    // their return number, Return status badge, and navigate to /returns/:id.
    const returns = storage.getReturns();
    const returnRows = returns.map(r => ({
      id: r.id,
      orderNumber: r.returnNumber,
      customerId: r.customerId,
      createdDate: r.createdDate,
      // WHY: Map return statuses to display values that the filter can match.
      status: r.status === 'Processed' ? 'Return Processed' : 'Return Pending',
      grandTotal: r.grandTotal,
      totalCases: r.totalCases,
      _isReturn: true,
    }));

    this.setState({ orders: [...orders, ...returnRows], customers });
  }

  _getFiltered() {
    const { orders, customers, search, filter } = this.state;
    let filtered = [...orders];

    if (filter === 'Return') {
      // [MOD #returns-list] Show only return rows when "Returns" filter is active.
      filtered = filtered.filter(o => o._isReturn);
    } else if (filter !== 'all') {
      // Normal order status filter — exclude return rows from non-Return filters.
      filtered = filtered.filter(o => !o._isReturn && o.status === filter);
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
        <PageHeader
          title="Orders"
          rightContent={
            <button
              className={styles.returnBtn}
              onClick={() => navigate('/returns/new')}
              aria-label="New Return"
            >
              <RotateCcw size={18} />
            </button>
          }
        />

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
              icon={<FileText size={40} />}
              title="No orders"
              message={search || filter !== 'all' ? 'Try different search or filters' : 'No orders yet'}
            />
          ) : (
            <div className={styles.list}>
              {filtered.map(order => {
                const cust = this.state.customers[order.customerId];
                // [MOD #returns-list] Returns navigate to /returns/:id and use
                // a return-specific status badge label.
                const handleClick = order._isReturn
                  ? () => navigate(`/returns/${order.id}`)
                  : () => navigate(`/orders/${order.id}`);
                return (
                  <div
                    key={`${order._isReturn ? 'ret' : 'ord'}-${order.id}`}
                    className={`${styles.row} ${order._isReturn ? styles.returnRow : ''}`}
                    onClick={handleClick}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.rowMain}>
                      <span className={styles.orderNum}>
                        {order._isReturn && <RotateCcw size={13} style={{ marginRight: 4, verticalAlign: 'middle', color: '#d32f2f' }} />}
                        {order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} small />
                    </div>
                    <div className={styles.rowSub}>
                      <span>{cust ? cust.name : 'Unknown'}</span>
                      <span>{formatDate(order.createdDate)}</span>
                    </div>
                    <div className={styles.rowMeta}>
                      <span>{order.totalCases} cases</span>
                      <span className={`${styles.total} ${order._isReturn ? styles.returnTotal : ''}`}>
                        {order._isReturn ? '-' : ''}${order.grandTotal.toFixed(2)}
                      </span>
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
