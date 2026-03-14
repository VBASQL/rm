// ============================================================
// FILE: format.js
// PURPOSE: Shared formatting utilities for currency, dates, and
//          line item calculations. Prevents code duplication across
//          pages and ensures consistent formatting throughout the app.
// DEPENDS ON: None
// DEPENDED ON BY: OrderDetail, CustomerProfile, Payment, InvoiceDetail,
//                 ReturnOrder, OrderHistory, CustomerRow, PaymentModal,
//                 CartSummary, OrderReceipt
//
// WHY THIS EXISTS:
//   Previously, _formatCurrency() and _formatDate() were duplicated
//   across 8+ pages with identical or near-identical implementations.
//   This utility centralizes formatting for consistency and maintainability.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] Initial creation — extracted from page components.
// ============================================================

/**
 * Format a number as USD currency string.
 * @param {number} amt - Amount to format
 * @returns {string} Formatted string like "$1,234.56"
 */
export function formatCurrency(amt) {
  return '$' + Number(amt || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
}

/**
 * Format a date string for display.
 * @param {string|Date} d - Date to format
 * @param {'short'|'long'} format - 'short' = "Mar 14", 'long' = "Mar 14, 2026"
 * @returns {string} Formatted date string or '—' if invalid
 */
export function formatDate(d, format = 'long') {
  if (!d) return '—';
  const options = format === 'short'
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(d).toLocaleDateString('en-US', options);
}

/**
 * Calculate line total for an order item with discount applied.
 * @param {Object} item - Line item with casePrice, quantity, discount
 * @returns {number} Line total after discount, rounded to 2 decimals
 */
export function calcLineTotal(item) {
  const rawTotal = (item.casePrice || 0) * (item.quantity || 0);
  const discountAmount = rawTotal * ((item.discount || 0) / 100);
  return Math.round((rawTotal - discountAmount) * 100) / 100;
}

/**
 * Calculate deposit total for an order item.
 * @param {Object} item - Line item with depositPerCase, quantity
 * @returns {number} Deposit total
 */
export function calcDepositTotal(item) {
  return (item.depositPerCase || 0) * (item.quantity || 0);
}
