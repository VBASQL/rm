// ============================================================
// FILE: Breadcrumb.jsx
// PURPOSE: Navigation breadcrumb trail showing page hierarchy.
// DEPENDS ON: lucide-react, react-router-dom
// DEPENDED ON BY: CustomerProfile (for branch navigation context)
//
// WHY THIS EXISTS:
//   Users need visual context when navigating hierarchical data like
//   parent/branch customer relationships. Breadcrumbs show the path
//   and allow quick jumps to any level.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] Initial creation for branch navigation context.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import styles from '../styles/Breadcrumb.module.css';

/**
 * Breadcrumb - Navigation trail component
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of { label, path } objects
 *   - Last item is current page (not clickable)
 *   - Previous items are clickable navigation links
 * @param {boolean} props.showHome - Show home icon as first crumb (default: false)
 * 
 * Example:
 *   <Breadcrumb items={[
 *     { label: 'Customers', path: '/customers' },
 *     { label: 'ABC Liquor', path: '/customers/1' },
 *     { label: 'Downtown Branch' }  // current page, no path
 *   ]} />
 */
class Breadcrumb extends React.Component {
  handleClick = (path) => {
    if (path) {
      this.props.navigate(path);
    }
  };

  render() {
    const { items = [], showHome = false } = this.props;

    if (items.length === 0) return null;

    return (
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <ol className={styles.list}>
          {showHome && (
            <>
              <li className={styles.item}>
                <button
                  className={styles.link}
                  onClick={() => this.handleClick('/')}
                  type="button"
                >
                  <Home size={14} />
                </button>
              </li>
              <li className={styles.separator} aria-hidden="true">
                <ChevronRight size={14} />
              </li>
            </>
          )}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <React.Fragment key={item.label}>
                <li className={styles.item}>
                  {isLast || !item.path ? (
                    <span className={styles.current} aria-current="page">
                      {item.label}
                    </span>
                  ) : (
                    <button
                      className={styles.link}
                      onClick={() => this.handleClick(item.path)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  )}
                </li>
                {!isLast && (
                  <li className={styles.separator} aria-hidden="true">
                    <ChevronRight size={14} />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    );
  }
}

// HOC to inject navigate
function BreadcrumbWrapper(props) {
  const navigate = useNavigate();
  return <Breadcrumb {...props} navigate={navigate} />;
}

export default BreadcrumbWrapper;
