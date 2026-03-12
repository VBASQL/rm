// ============================================================
// FILE: Dashboard.jsx
// PURPOSE: Home screen for salesperson — KPIs, quick actions, recent activity.
// DEPENDS ON: KpiCard, PageHeader, AppContext (storage), AuthProvider (user)
// DEPENDED ON BY: App.jsx (route: /)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.2: "Quick launchpad with at-a-glance stats. NOT a heavy
//   analytics page." Shows cases-only KPIs (no revenue), quick action buttons,
//   and a recent activity feed.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ClipboardList, Truck, AlertTriangle, Plus, Users, ListOrdered, DollarSign, Settings } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import KpiCard from '../components/KpiCard';
import styles from '../styles/Dashboard.module.css';

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      kpis: { casesToday: 0, openOrders: 0, deliveriesToday: 0, alerts: 0 },
      recentActivity: [],
    };
  }

  componentDidMount() {
    this._loadData();
  }

  _loadData() {
    const { storage } = this.props;

    // WHY: Compute KPIs from data. Cases only — no revenue per §7 KPI Display Rules.
    const orders = storage.getOrders();
    const customers = storage.getCustomers();
    const invoices = storage.getInvoices();
    const today = new Date().toISOString().split('T')[0];

    // Cases sold today: sum of totalCases for orders created today
    const casesToday = orders
      .filter(o => o.createdDate && o.createdDate.startsWith(today))
      .reduce((sum, o) => sum + (o.totalCases || 0), 0);

    // Open orders: Submitted or Picking
    const openOrders = orders.filter(o =>
      ['Submitted', 'Picking', 'Shipped'].includes(o.status)
    ).length;

    // Deliveries today: orders with deliverDate = today and status Shipped
    const deliveriesToday = orders.filter(o =>
      o.deliveryDate && o.deliveryDate.startsWith(today) &&
      ['Shipped', 'Delivered'].includes(o.status)
    ).length;

    // Alerts: overdue invoices + customers on hold
    const overdueInvoices = invoices.filter(i => i.status === 'Overdue').length;
    const holdCustomers = customers.filter(c => c.status === 'Hold').length;
    const alerts = overdueInvoices + holdCustomers;

    const recentActivity = storage.getRecentActivity();

    this.setState({
      kpis: { casesToday, openOrders, deliveriesToday, alerts },
      recentActivity,
    });
  }

  _getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  render() {
    const { user, navigate } = this.props;
    const { kpis, recentActivity } = this.state;
    const firstName = user?.name?.split(' ')[0] || 'there';

    return (
      <div className="page">
        <PageHeader
          title={`${this._getGreeting()}, ${firstName}`}
          rightContent={
            <button className={styles.settingsBtn} onClick={() => navigate('/settings')}>
              <Settings size={22} />
            </button>
          }
        />

        <div className={styles.content}>
          {/* KPI Cards — Cases only, no revenue (§7) */}
          <div className={styles.kpiGrid}>
            <KpiCard
              icon={<Package size={20} />}
              value={kpis.casesToday}
              label="Cases Today"
            />
            <KpiCard
              icon={<ClipboardList size={20} />}
              value={kpis.openOrders}
              label="Open Orders"
              onClick={() => navigate('/orders')}
            />
            <KpiCard
              icon={<Truck size={20} />}
              value={kpis.deliveriesToday}
              label="Deliveries"
            />
            <KpiCard
              icon={<AlertTriangle size={20} />}
              value={kpis.alerts}
              label="Alerts"
              variant={kpis.alerts > 0 ? 'danger' : undefined}
            />
          </div>

          {/* Quick Actions */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Quick Actions</h3>
            <div className={styles.quickActions}>
              <button className={styles.actionBtn} onClick={() => navigate('/orders/new')}>
                <Plus size={18} />
                <span>New Order</span>
              </button>
              <button className={styles.actionBtn} onClick={() => navigate('/customers')}>
                <Users size={18} />
                <span>Customers</span>
              </button>
              <button className={styles.actionBtn} onClick={() => navigate('/orders')}>
                <ListOrdered size={18} />
                <span>My Orders</span>
              </button>
              <button className={styles.actionBtn} onClick={() => navigate('/payments')}>
                <DollarSign size={18} />
                <span>Collect Payment</span>
              </button>
            </div>
          </section>

          {/* Recent Activity */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Recent Activity</h3>
            <div className={styles.activityFeed}>
              {recentActivity.length === 0 ? (
                <p className={styles.emptyText}>No recent activity</p>
              ) : (
                recentActivity.slice(0, 7).map((item, idx) => (
                  <div key={idx} className={styles.activityItem}>
                    <span className={styles.activityDot} />
                    <div className={styles.activityContent}>
                      <span className={styles.activityText}>{item.text}</span>
                      <span className={styles.activityTime}>
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    );
  }
}

// WHY: Functional wrapper to inject hooks (navigate, auth, storage) into class.
function DashboardWrapper(props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { storage } = useApp();
  return <Dashboard {...props} navigate={navigate} user={user} storage={storage} />;
}

export default DashboardWrapper;
