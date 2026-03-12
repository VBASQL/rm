// ============================================================
// FILE: vite.config.js
// PURPOSE: Vite build configuration for the WholesaleERP React SPA.
// DEPENDS ON: @vitejs/plugin-react
// DEPENDED ON BY: All source files (build pipeline)
//
// WHY THIS EXISTS:
//   Vite provides fast HMR dev server and optimized production builds.
//   React plugin enables JSX transform and Fast Refresh.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
