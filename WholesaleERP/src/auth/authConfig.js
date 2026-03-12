// ============================================================
// FILE: authConfig.js
// PURPOSE: MSAL / auth configuration. Phase 1 = mock values.
//          Phase 2 = real Entra tenant ID, client ID, redirect URI.
// DEPENDS ON: Nothing
// DEPENDED ON BY: AuthProvider.jsx
//
// WHY THIS EXISTS:
//   Centralizes auth config so swapping from mock to real Entra
//   is a single file change. No page code touches auth details.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation — mock config for Phase 1.
// ============================================================

// WHY: Phase 1 uses mock auth. These placeholders are replaced with real
// Entra values when the backend is ready. See BUILD_PLAN.md §3.
export const AUTH_CONFIG = {
  tenantId: 'PLACEHOLDER_TENANT_ID',
  clientId: 'PLACEHOLDER_CLIENT_ID',
  redirectUri: 'http://localhost:3000',
  isMock: true, // WHY: Toggle between mock and real auth. Set false for Phase 2.
};

// WHY: Mock user data simulates a signed-in salesperson for testing all pages.
export const MOCK_USER = {
  id: 1,
  name: 'Sarah Mitchell',
  email: 'sarah.mitchell@wholesaleerp.com',
  role: 'salesperson',
  avatar: null,
};
