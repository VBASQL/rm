// ============================================================
// FILE: EmailService.js
// PURPOSE: Email sending abstraction. Phase 1 = mailto: links
//          (opens device email app). Phase 2 = server-side email.
// DEPENDS ON: Nothing
// DEPENDED ON BY: SendMessageModal, Customer Profile actions
//
// WHY THIS EXISTS:
//   Salespeople need to email invoices, statements, and balances
//   to customers. Phase 1 uses mailto: links because there's no
//   server yet. Phase 2 sends via SMTP from the server.
//   See BUILD_PLAN.md §9.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation — mailto: only.
// ============================================================

class EmailService {
  // WHY: mailto: approach opens the device's native email app with pre-filled
  // fields. Limited attachment support, but body text includes key details.
  // Phase 2 replaces this with a server POST that sends email directly.
  static sendInvoice(customerEmail, invoiceNumber, bodyText) {
    const subject = encodeURIComponent(`Invoice ${invoiceNumber} from WholesaleERP`);
    const body = encodeURIComponent(bodyText);
    window.location.href = `mailto:${encodeURIComponent(customerEmail)}?subject=${subject}&body=${body}`;
  }

  static sendStatement(customerEmail, customerName, bodyText) {
    const subject = encodeURIComponent(`Account Statement for ${customerName}`);
    const body = encodeURIComponent(bodyText);
    window.location.href = `mailto:${encodeURIComponent(customerEmail)}?subject=${subject}&body=${body}`;
  }

  static sendBalance(customerEmail, customerName, bodyText) {
    const subject = encodeURIComponent(`Balance Summary for ${customerName}`);
    const body = encodeURIComponent(bodyText);
    window.location.href = `mailto:${encodeURIComponent(customerEmail)}?subject=${subject}&body=${body}`;
  }
}

export default EmailService;
