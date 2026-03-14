// ============================================================
// FILE: AddCustomer.jsx
// PURPOSE: Form for salespeople to add a new customer in the field.
// DEPENDS ON: PageHeader, AppContext (storage), MockFeatureBanner
// DEPENDED ON BY: App.jsx (route: /customers/new)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.4: New customers are ALWAYS prepaid in production.
//   Demo mode adds a credit toggle so stakeholders can test credit flows.
//   paymentType, terms, creditLimit, creditTier are passed to createCustomer
//   which now places defaults BEFORE ...data spread so caller can override.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] #demo Added credit account toggle + terms/limit fields
//     with MockFeatureBanner. Fixed createCustomer to accept overrides.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import MockFeatureBanner from '../components/MockFeatureBanner';
import styles from '../styles/AddCustomer.module.css';

// [MOD #customtype] Preset types + placeholder for custom type entry.
// WHY: Salespeople need common types pre-filled, but also need to add
// new types they encounter in the field (e.g., "Food Truck", "Sports Bar").
const CUSTOMER_TYPES = [
  'Restaurant', 'Deli', 'Caterer', 'Cafe', 'Hotel', 'Bakery', 'Bar', 'Grocery', 'Food Truck', 'Other',
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
      // [MOD #customtype] Custom type entry — when user selects "Other" or wants
      // to type a new type not in the preset list.
      customType: '',
      showCustomTypeInput: false,
      address: '',
      billingAddress: '',
      sameAsBilling: true,
      notes: '',
      // [MOD #demo] Credit account fields — demo only.
      // In production these are set by accounting, not salesperson.
      paymentType: 'prepaid',
      terms: 'NET-30',
      creditLimit: '',
      creditTier: 'A',
      errors: {},
    };
  }

  _validate() {
    const { name, contact, phone, type, customType, showCustomTypeInput, address } = this.state;
    const errors = {};

    if (!name.trim()) errors.name = 'Company name is required';
    if (!contact.trim()) errors.contact = 'Contact name is required';
    if (!phone.trim()) errors.phone = 'Phone is required';
    // [MOD #customtype] Validate type — either preset or custom must be filled
    const effectiveType = showCustomTypeInput ? customType.trim() : type;
    if (!effectiveType) errors.type = 'Customer type is required';
    if (!address.trim()) errors.address = 'Delivery address is required';

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (!this._validate()) return;

    const { name, contact, phone, email, type, customType, showCustomTypeInput, address, billingAddress, sameAsBilling, notes, paymentType, terms, creditLimit, creditTier } = this.state;
    const { storage, navigate, showToast } = this.props;

    // [MOD #customtype] Use custom type if showCustomTypeInput is true
    const effectiveType = showCustomTypeInput ? customType.trim() : type;

    // [MOD #demo] Pass credit fields when paymentType is credit.
    // In production these are never submitted by salesperson — accounting sets them.
    const creditFields = paymentType === 'credit' ? {
      paymentType: 'credit',
      terms,
      creditLimit: Math.max(0, Number(creditLimit) || 0),
      creditTier,
    } : {};

    const customer = storage.createCustomer({
      name: name.trim(),
      contact: contact.trim(),
      phone: phone.trim(),
      email: email.trim(),
      type: effectiveType,
      address: address.trim(),
      billingAddress: sameAsBilling ? address.trim() : billingAddress.trim(),
      notes: notes.trim() ? [notes.trim()] : [],
      ...creditFields,
    });

    showToast(`${customer.name} created`);
    navigate(`/customers/${customer.id}`);
  };

  handleChange = (field) => (e) => {
    this.setState({ [field]: e.target.value });
  };

  // [MOD #customtype] Handle type selection — show custom input when "Other" selected
  handleTypeChange = (e) => {
    const value = e.target.value;
    if (value === 'Other') {
      this.setState({ type: value, showCustomTypeInput: true, customType: '' });
    } else {
      this.setState({ type: value, showCustomTypeInput: false, customType: '' });
    }
  };

  // [MOD #customtype] Toggle between preset and custom type entry
  handleToggleCustomType = () => {
    this.setState(prev => ({
      showCustomTypeInput: !prev.showCustomTypeInput,
      customType: '',
      type: prev.showCustomTypeInput ? '' : 'Other',
    }));
  };

  handleCheckbox = () => {
    this.setState(prev => ({ sameAsBilling: !prev.sameAsBilling }));
  };

  render() {
    const { navigate } = this.props;
    const { name, contact, phone, email, type, customType, showCustomTypeInput, address, billingAddress, sameAsBilling, notes, errors } = this.state;

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

          {/* [MOD #customtype] Type field — dropdown OR custom input */}
          <div className="form-group">
            <label className="form-label">Customer Type *</label>
            {!showCustomTypeInput ? (
              <>
                <select
                  className={`form-input ${errors.type ? 'form-input-error' : ''}`}
                  value={type}
                  onChange={this.handleTypeChange}
                >
                  <option value="">Select type...</option>
                  {CUSTOMER_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.customTypeLink}
                  onClick={this.handleToggleCustomType}
                >
                  + Add custom type
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  className={`form-input ${errors.type ? 'form-input-error' : ''}`}
                  value={customType}
                  onChange={this.handleChange('customType')}
                  placeholder="Enter custom type (e.g., Food Truck)"
                  autoFocus
                />
                <button
                  type="button"
                  className={styles.customTypeLink}
                  onClick={this.handleToggleCustomType}
                >
                  ← Back to preset types
                </button>
              </>
            )}
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

          {/* [MOD #demo] Payment type toggle — prepaid or credit account */}
          {/* WHY: In production salespeople cannot set credit terms.
              This toggle is demo-only so stakeholders can test credit flows. */}
          <MockFeatureBanner
            title="Demo: Credit Account Setup"
            description="In production all new accounts start as Prepaid — only accounting can grant credit terms, set limits, and assign a tier. This section exists so you can test credit account flows during the demo."
          />
          <div className="form-group">
            <label className="form-label">Payment Type</label>
            <div className={styles.paymentToggle}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${this.state.paymentType === 'prepaid' ? styles.toggleActive : ''}`}
                onClick={() => this.setState({ paymentType: 'prepaid' })}
              >
                Prepaid
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${this.state.paymentType === 'credit' ? styles.toggleActive : ''}`}
                onClick={() => this.setState({ paymentType: 'credit' })}
              >
                Credit Account
              </button>
            </div>
          </div>

          {this.state.paymentType === 'credit' && (
            <div className={styles.creditFields}>
              <div className="form-group">
                <label className="form-label">Terms</label>
                <select
                  className="form-input"
                  value={this.state.terms}
                  onChange={this.handleChange('terms')}
                >
                  <option value="NET-15">NET-15</option>
                  <option value="NET-30">NET-30</option>
                  <option value="NET-60">NET-60</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Credit Limit ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={this.state.creditLimit}
                  onChange={this.handleChange('creditLimit')}
                  min="0"
                  step="500"
                  placeholder="e.g. 5000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Credit Tier</label>
                <select
                  className="form-input"
                  value={this.state.creditTier}
                  onChange={this.handleChange('creditTier')}
                >
                  <option value="A">A — Standard</option>
                  <option value="B">B — Moderate</option>
                  <option value="C">C — Restricted</option>
                </select>
              </div>
            </div>
          )}

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
