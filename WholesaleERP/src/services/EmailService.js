// ============================================================
// FILE: EmailService.js
// PURPOSE: Email sending abstraction. Phase 1 = mailto: links
//          (opens device email app) + downloadable attachments.
//          Phase 2 = server-side email with real SMTP attachments.
// DEPENDS ON: Nothing
// DEPENDED ON BY: SendMessageModal, Customer Profile actions
//
// WHY THIS EXISTS:
//   Salespeople need to email invoices, statements, and balances
//   to customers. Phase 1 uses mailto: links with auto-downloaded
//   attachment files. Phase 2 sends via SMTP from the server.
//   See BUILD_PLAN.md §9.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] #003 Added attachment generation + download support
//   [2026-03-13] #002 Added composeEmail() general-purpose method
//   [2026-03-12] Initial creation — mailto: only.
// ============================================================

class EmailService {

  // [MOD #002] General-purpose compose — used by SendMessageModal
  static composeEmail(to, subject, body) {
    const s = encodeURIComponent(subject);
    const b = encodeURIComponent(body);
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${s}&body=${b}`;
  }

  // [MOD #003] Compose email AND trigger attachment download
  static composeEmailWithAttachment(to, subject, body, filename, htmlContent) {
    EmailService.composeEmail(to, subject, body);
    if (filename && htmlContent) {
      EmailService.downloadFile(filename, htmlContent, 'text/html');
    }
  }

  // [MOD #003] Download file to device so user can attach it manually
  static downloadFile(filename, content, mimeType = 'text/html') {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // [MOD #003] Generate formatted HTML document for attachment
  static generateAttachmentHTML(type, data) {
    const now = new Date().toLocaleDateString();
    const companyName = 'WholesaleERP';

    if (type === 'invoice' && data.invoice) {
      const inv = data.invoice;
      const cust = data.customer || {};
      const lines = (inv.lineItems || []).map(li =>
        `<tr><td>${li.productCode || ''}</td><td>${li.productName || ''}</td>` +
        `<td style="text-align:right">${li.quantity || 0}</td>` +
        `<td style="text-align:right">$${(li.casePrice || 0).toFixed(2)}</td>` +
        `<td style="text-align:right">$${(li.lineTotal || 0).toFixed(2)}</td></tr>`
      ).join('');

      return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Invoice ${inv.invoiceNumber || ''}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}
table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f5f5f5;font-weight:bold}
.total{font-weight:bold;font-size:1.1em}
h1{color:#1a73e8}</style></head><body>
<h1>${companyName}</h1>
<h2>Invoice: ${inv.invoiceNumber || ''}</h2>
<p><strong>Customer:</strong> ${cust.name || ''}<br>
<strong>Date:</strong> ${inv.date || now}<br>
<strong>Due Date:</strong> ${inv.dueDate || ''}<br>
<strong>Status:</strong> ${inv.status || 'Open'}</p>
<table><thead><tr><th>Code</th><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
<tbody>${lines}</tbody></table>
<p class="total">Subtotal: $${(inv.subtotal || 0).toFixed(2)}</p>
${inv.depositTotal ? `<p>Deposits: $${inv.depositTotal.toFixed(2)}</p>` : ''}
${inv.discountTotal ? `<p>Discount: -$${inv.discountTotal.toFixed(2)}</p>` : ''}
<p class="total" style="font-size:1.3em">TOTAL: $${(inv.grandTotal || inv.total || 0).toFixed(2)}</p>
</body></html>`;
    }

    if (type === 'order' && data.order) {
      const ord = data.order;
      const cust = data.customer || {};
      const lines = (ord.lineItems || []).map(li =>
        `<tr><td>${li.productCode || ''}</td><td>${li.productName || ''}</td>` +
        `<td style="text-align:right">${li.quantity || 0}</td>` +
        `<td style="text-align:right">$${(li.casePrice || 0).toFixed(2)}</td>` +
        `<td style="text-align:right">$${(li.lineTotal || 0).toFixed(2)}</td></tr>`
      ).join('');

      return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Order ${ord.orderNumber || ''}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}
table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f5f5f5;font-weight:bold}
.total{font-weight:bold;font-size:1.1em}
h1{color:#1a73e8}</style></head><body>
<h1>${companyName}</h1>
<h2>Order Confirmation: ${ord.orderNumber || ''}</h2>
<p><strong>Customer:</strong> ${cust.name || ''}<br>
<strong>Date:</strong> ${ord.date || now}<br>
<strong>Delivery:</strong> ${ord.deliveryDate || 'TBD'}<br>
<strong>Status:</strong> ${ord.status || ''}</p>
<table><thead><tr><th>Code</th><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
<tbody>${lines}</tbody></table>
<p class="total" style="font-size:1.3em">TOTAL: $${(ord.grandTotal || 0).toFixed(2)}</p>
<p>Total Cases: ${ord.totalCases || ''}</p>
${ord.notes ? `<p><strong>Notes:</strong> ${ord.notes}</p>` : ''}
</body></html>`;
    }

    if (type === 'statement' && data.customer) {
      const cust = data.customer;
      const invoices = data.invoices || [];
      const rows = invoices.map(inv =>
        `<tr><td>${inv.invoiceNumber || ''}</td><td>${inv.date || ''}</td>` +
        `<td>${inv.dueDate || ''}</td><td>${inv.status || ''}</td>` +
        `<td style="text-align:right">$${(inv.total || inv.grandTotal || 0).toFixed(2)}</td>` +
        `<td style="text-align:right">$${(inv.amountPaid || 0).toFixed(2)}</td>` +
        `<td style="text-align:right">$${(inv.balance || (inv.total || 0) - (inv.amountPaid || 0)).toFixed(2)}</td></tr>`
      ).join('');

      return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Account Statement — ${cust.name || ''}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}
table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f5f5f5;font-weight:bold}
.total{font-weight:bold;font-size:1.1em}
h1{color:#1a73e8}</style></head><body>
<h1>${companyName}</h1>
<h2>Account Statement</h2>
<p><strong>Customer:</strong> ${cust.name || ''}<br>
<strong>Date:</strong> ${now}<br>
<strong>Account Balance:</strong> $${(cust.balance || 0).toFixed(2)}</p>
<table><thead><tr><th>Invoice</th><th>Date</th><th>Due</th><th>Status</th><th>Total</th><th>Paid</th><th>Balance</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="total" style="font-size:1.3em">Total Outstanding: $${(cust.balance || 0).toFixed(2)}</p>
</body></html>`;
    }

    // Fallback: generic content
    return null;
  }

  // [MOD #003] Get a suitable filename for the attachment
  static getAttachmentFilename(type, data) {
    if (type === 'invoice' && data.invoice) {
      return `Invoice_${data.invoice.invoiceNumber || 'draft'}.html`;
    }
    if (type === 'order' && data.order) {
      return `Order_${data.order.orderNumber || 'draft'}.html`;
    }
    if (type === 'statement' && data.customer) {
      return `Statement_${(data.customer.name || 'customer').replace(/\s+/g, '_')}.html`;
    }
    return `Document_${new Date().toISOString().split('T')[0]}.html`;
  }

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
