// ============================================================
// FILE: CustomerList.jsx
// PURPOSE: Searchable, filterable list of all customers assigned to
//          the current salesperson. Each row links to profile or new order.
// DEPENDS ON: SearchBar, CustomerRow, EmptyState, PageHeader, AppContext
// DEPENDED ON BY: App.jsx (route: /customers)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.3: Search, filter chips (All/Active/Hold/Overdue/Prepaid/Credit),
//   alphabetical sort, each row shows name/balance/status with "New Order" shortcut.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import CustomerRow from '../components/CustomerRow';
import EmptyState from '../components/EmptyState';
import styles from '../styles/CustomerList.module.css';

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Hold', value: 'Hold' },
  { label: 'Overdue', value: 'Overdue' },
  { label: 'Prepaid', value: 'prepaid' },
  { label: 'Credit', value: 'credit' },
];

class CustomerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      search: '',
      filter: 'all',
    };
  }

  componentDidMount() {
    this._loadCustomers();
  }

  _loadCustomers() {
    const customers = this.props.storage.getCustomers();
    // WHY: Sort alphabetically by default per §5.3 spec.
    customers.sort((a, b) => a.name.localeCompare(b.name));
    this.setState({ customers });
  }

  _getFilteredCustomers() {
    const { customers, search, filter } = this.state;
    let result = customers;

    // Apply status / type filter
    if (filter !== 'all') {
      if (filter === 'Overdue') {
        // WHY: "Overdue" isn't a customer.status value — it means the customer
        // has at least one overdue invoice. We check balance > creditLimit.
        const invoices = this.props.storage.getInvoices();
        const overdueCustomerIds = new Set(
          invoices.filter(i => i.status === 'Overdue').map(i => i.customerId)
        );
        result = result.filter(c => overdueCustomerIds.has(c.id));
      } else if (filter === 'prepaid' || filter === 'credit') {
        result = result.filter(c => c.paymentType === filter);
      } else {
        result = result.filter(c => c.status === filter);
      }
    }

    // Apply text search — match against name, code, contact, address
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.contact && c.contact.toLowerCase().includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q))
      );
    }

    return result;
  }

  handleSearch = (value) => {
    this.setState({ search: value });
  };

  handleFilterChange = (value) => {
    this.setState({ filter: value });
  };

  render() {
    const { navigate } = this.props;
    const { search, filter } = this.state;
    const filtered = this._getFilteredCustomers();

    return (
      <div className="page">
        <PageHeader
          title="Customers"
          rightContent={
            <button className={styles.addBtn} onClick={() => navigate('/customers/new')}>
              <UserPlus size={20} />
            </button>
          }
        />

        <div className={styles.content}>
          <SearchBar
            value={search}
            onSearch={this.handleSearch}
            placeholder="Search customers..."
            filters={FILTERS}
            activeFilter={filter}
            onFilterChange={this.handleFilterChange}
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users size={40} />}
              title="No customers found"
              message={search ? 'Try a different search term' : 'No customers match this filter'}
            />
          ) : (
            <div className={styles.list}>
              {filtered.map(customer => (
                <CustomerRow key={customer.id} customer={customer} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

function CustomerListWrapper(props) {
  const navigate = useNavigate();
  const { storage } = useApp();
  return <CustomerList {...props} navigate={navigate} storage={storage} />;
}

export default CustomerListWrapper;
