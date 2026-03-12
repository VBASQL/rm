// ============================================================
// FILE: AppContext.jsx
// PURPOSE: Global application state provider. Holds storage service
//          instance and shared state (customers, products, etc.)
// DEPENDS ON: MockStorageService.js
// DEPENDED ON BY: All pages and components that read/write data
//
// WHY THIS EXISTS:
//   Centralizes data access so pages don't import storage directly.
//   Switching from mock to API storage is one line change here.
//   See BUILD_PLAN.md §2 (State management: React Context + useReducer).
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React, { createContext, useContext, useMemo } from 'react';
import MockStorageService from '../services/MockStorageService';

const AppContext = createContext(null);

class AppProvider extends React.Component {
  constructor(props) {
    super(props);
    // WHY: Single storage instance for the entire app. Phase 1 = mock.
    // Phase 3: replace MockStorageService with ApiStorageService here.
    this._storage = new MockStorageService();
  }

  get storage() {
    return this._storage;
  }

  render() {
    const value = {
      storage: this._storage,
    };

    return (
      <AppContext.Provider value={value}>
        {this.props.children}
      </AppContext.Provider>
    );
  }
}

// WHY: Custom hook for cleaner access from functional components.
function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { AppProvider, useApp };
export default AppProvider;
