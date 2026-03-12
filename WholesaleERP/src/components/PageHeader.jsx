// ============================================================
// FILE: PageHeader.jsx
// PURPOSE: Top bar with page title, optional back button, and action buttons.
// DEPENDS ON: lucide-react, react-router-dom
// DEPENDED ON BY: All authenticated pages
//
// WHY THIS EXISTS:
//   Consistent header across all pages. Supports title, back navigation,
//   and right-side action buttons (e.g., Add, Settings).
//   See BUILD_PLAN.md §8 Shared Components.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from '../styles/PageHeader.module.css';

class PageHeader extends React.Component {
  handleBack = () => {
    if (this.props.onBack) {
      this.props.onBack();
    } else {
      this.props.navigate(-1);
    }
  };

  render() {
    const { title, showBack, rightContent } = this.props;

    return (
      <header className={styles.header}>
        <div className={styles.left}>
          {showBack && (
            <button className={styles.backButton} onClick={this.handleBack} aria-label="Go back">
              <ArrowLeft size={22} />
            </button>
          )}
          <h1 className={styles.title}>{title}</h1>
        </div>
        {rightContent && (
          <div className={styles.right}>{rightContent}</div>
        )}
      </header>
    );
  }
}

function PageHeaderWrapper(props) {
  const navigate = useNavigate();
  return <PageHeader {...props} navigate={navigate} />;
}

export default PageHeaderWrapper;
