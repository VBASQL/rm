// ============================================================
// FILE: AddCustomer.jsx
// PURPOSE: Form for salespeople to add a new customer in the field.
// DEPENDS ON: PageHeader, AppContext (storage)
// DEPENDED ON BY: App.jsx (route: /customers/new)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.4: New customers are ALWAYS prepaid (no credit fields).
//   paymentType="prepaid", creditLimit=0, creditTier=null, terms="Prepaid".
//   On submit → create customer, redirect to profile.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import styles from '../styles/AddCustomer.module.css';

const CUSTOMER_TYPES = [
  'Restaurant', 'Deli', 'Caterer', 'Cafe', 'Hotel', 'Bakery', 'Other',
];

class AddCustomer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      contact: '',
      phone: '',
      email: '',
      type: '',
      address: '',
      billingAddress: '',
      sameAsBilling: true,
      notes: '',
      errors: {},
    };
  }

  _validate() {
    const { name, contact, phone, type, address } = this.state;
    const errors = {};

    if (!name.trim()) errors.name = 'Company name is required';
    if (!contact.trim()) errors.contact = 'Contact name is required';
    if (!phone.trim()) errors.phone = 'Phone is required';
    if (!type) errors.type = 'Customer type is required';
    if (!address.trim()) errors.address = 'Delivery address is required';

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (!this._validate()) return;

    const { name, contact, phone, email, type, address, billingAddress, sameAsBilling, notes } = this.state;
    const { storage, navigate, showToast } = this.props;

    const customer = storage.createCustomer({
      name: name.trim(),
      contact: contact.trim(),
      phone: phone.trim(),
      email: email.trim(),
      type,
      address: address.trim(),
      billingAddress: sameAsBilling ? address.trim() : billingAddress.trim(),
      notes: notes.trim() ? [notes.trim()] : [],
    });

    showToast(`${customer.name} created`);
    navigate(`/customers/${customer.id}`);
  };

  handleChange = (field) => (e) => {
    this.setState({ [field]: e.target.value });
  };

  handleCheckbox = () => {
    this.setState(prev => ({ sameAsBilling: !prev.sameAsBilling }));
  };

  render() {
    const { navigate } = this.props;
    const { name, contact, phone, email, type, address, billingAddress, sameAsBilling, notes, errors } = this.state;

    return (
      <div className="page">
        <PageHeader title="Add Customer" showBack onBack={() => navigate(-1)} />

        <form className={styles.form} onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'form-input-error' : ''}`}
              value={name}
              onChange={this.handleChange('name')}
              placeholder="e.g. Bella Cucina Restaurant"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contact Name *</label>
            <input
              type="text"
              className={`form-input ${errors.contact ? 'form-input-error' : ''}`}
              value={contact}
              onChange={this.handleChange('contact')}
              placeholder="Primary contact"
            />
            {errors.contact && <span className="form-error">{errors.contact}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input
              type="tel"
              className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
              value={phone}
              onChange={this.handleChange('phone')}
              placeholder="(555) 123-4567"
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={this.handleChange('email')}
              placeholder="email@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Customer Type *</label>
            <select
              className={`form-input ${errors.type ? 'form-input-error' : ''}`}
              value={type}
              onChange={this.handleChange('type')}
            >
              <option value="">Select type...</option>
              {CUSTOMER_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.type && <span className="form-error">{errors.type}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Address *</label>
            <textarea
              className={`form-input ${errors.address ? 'form-input-error' : ''}`}
              value={address}
              onChange={this.handleChange('address')}
              rows={2}
              placeholder="Street, City, State ZIP"
            />
            {errors.address && <span className="form-error">{errors.address}</span>}
          </div>

          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              id="sameAsBilling"
              checked={sameAsBilling}
              onChange={this.handleCheckbox}
            />
            <label htmlFor="sameAsBilling">Billing same as delivery</label>
          </div>

          {!sameAsBilling && (
            <div className="form-group">
              <label className="form-label">Billing Address</label>
              <textarea
                className="form-input"
                value={billingAddress}
                onChange={this.handleChange('billingAddress')}
                rows={2}
                placeholder="Street, City, State ZIP"
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-input"
              value={notes}
              onChange={this.handleChange('notes')}
              rows={3}
              placeholder="Any notes about this customer..."
            />
          </div>

          {/* WHY: Prepaid notice — per §5.4, salespeople cannot set credit terms. */}
          <p className={styles.prepaidNotice}>
            New customers start as <strong>Prepaid</strong>. Credit terms can only be set by accounting.
          </p>

          <button type="submit" className="btn btn-primary btn-full">
            Create Customer
          </button>
        </form>
      </div>
    );
  }
}

function AddCustomerWrapper(props) {
  const navigate = useNavigate();
  const { storage } = useApp();
  return <AddCustomer {...props} navigate={navigate} storage={storage} />;
}

export default AddCustomerWrapper;
