// ============================================================
// FILE: SearchBar.jsx
// PURPOSE: Universal search input with optional filter chips.
// DEPENDS ON: lucide-react
// DEPENDED ON BY: CustomerList, OrderHistory, Reports
//
// WHY THIS EXISTS:
//   Multiple pages need search + filter. Consistent component avoids
//   duplication. See BUILD_PLAN.md §8.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { Search, X } from 'lucide-react';
import styles from '../styles/SearchBar.module.css';

class SearchBar extends React.Component {
  handleClear = () => {
    this.props.onSearch('');
  };

  handleChange = (e) => {
    this.props.onSearch(e.target.value);
  };

  render() {
    const { value, placeholder, filters, activeFilter, onFilterChange } = this.props;

    return (
      <div className={styles.searchContainer}>
        <div className={styles.inputWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.input}
            placeholder={placeholder || 'Search...'}
            value={value}
            onChange={this.handleChange}
          />
          {value && (
            <button className={styles.clearButton} onClick={this.handleClear} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>

        {filters && filters.length > 0 && (
          <div className={styles.filterChips}>
            {filters.map(filter => (
              <button
                key={filter.value}
                className={`${styles.chip} ${activeFilter === filter.value ? styles.chipActive : ''}`}
                onClick={() => onFilterChange(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default SearchBar;
