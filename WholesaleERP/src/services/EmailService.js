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
//   [2026-03-13] #004 shareWithAttachment — Web Share API (real draft+attachment
//                     on mobile); falls back to download+mailto on desktop.
//   [2026-03-14] #003 Added attachment generation + download support
//   [2026-03-13] #002 Added composeEmail() general-purpose method
//   [2026-03-12] Initial creation — mailto: only.
// ============================================================
import { formatDate } from '../utils/format';

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

  // [MOD #004] Mobile-first: opens native OS share sheet with the file already
  //            attached so the user just picks their email app — real draft + attachment.
  //            Falls back to download + mailto: on desktop / unsupported browsers.
  static async shareWithAttachment(to, subject, body, filename, htmlContent) {
    if (htmlContent && filename && typeof navigator !== 'undefined' && navigator.canShare) {
      const file = new File([htmlContent], filename, { type: 'text/html' });
      if (navigator.canShare({ files: [file] })) {
        try {
          // Include the recipient in the share text since Web Share API
          // cannot pre-fill the To: field directly.
          const shareText = to ? `To: ${to}\n\n${body}` : body;
          await navigator.share({ files: [file], title: subject, text: shareText });
          return; // native share sheet handled everything
        } catch (err) {
          if (err.name === 'AbortError') return; // user cancelled — do nothing
          // Any other error: fall through to desktop fallback
        }
      }
    }
    // Desktop fallback: download file for manual attach + open mailto: draft
    if (filename && htmlContent) {
      EmailService.downloadFile(filename, htmlContent, 'text/html');
    }
    EmailService.composeEmail(to, subject, body);
  }

  // [MOD #004] Returns true when the browser supports Web Share with files (mobile)
  static canUseNativeShare() {
    if (typeof navigator === 'undefined' || !navigator.canShare) return false;
    try {
      return navigator.canShare({ files: [new File(['x'], 'test.html', { type: 'text/html' })] });
    } catch {
      return false;
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

  // [MOD #receipt] Print a generated document in a new window.
  // WHY: window.print() prints the app screen, but user wants a clean receipt/invoice.
  // This opens the generated HTML in a popup and calls print on that window.
  static printDocument(type, data) {
    const html = EmailService.generateAttachmentHTML(type, data);
    if (!html) return;
    const printWin = window.open('', '_blank', 'width=800,height=600');
    if (!printWin) {
      // Popup blocked — fallback to download
      const filename = EmailService.getAttachmentFilename(type, data);
      EmailService.downloadFile(filename, html);
      return;
    }
    printWin.document.write(html);
    printWin.document.close();
    // Wait for content to load before printing
    printWin.onload = () => {
      printWin.focus();
      printWin.print();
    };
    // Also try printing immediately for browsers that don't fire onload for document.write
    setTimeout(() => {
      printWin.focus();
      printWin.print();
    }, 250);
  }

  // [MOD #003] Generate formatted HTML document for attachment
  static generateAttachmentHTML(type, data) {
    const now = formatDate(new Date());
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

    // [MOD #receipt] Payment receipt generation — shows payment details,
    // what it was applied to, and customer info.
    // WHY: After collecting payment, salesperson can email or print a receipt
    // for the customer's records — same workflow as orders/invoices.
    if (type === 'payment' && data.payment) {
      const pmt = data.payment;
      const cust = data.customer || {};
      const methodLabels = {
        cash: 'Cash',
        check: 'Check',
        credit_card: 'Credit Card',
        ach: 'ACH/Wire Transfer',
        account_credit: 'Account Credit',
      };
      const methodLabel = methodLabels[pmt.method] || pmt.method;

      // Build "applied to" section
      let appliedSection = '';
      if (pmt.appliedTo && pmt.appliedTo.length > 0) {
        const appliedRows = pmt.appliedTo.map(a => {
          if (a.invoiceId) {
            return `<tr><td>Invoice #${a.invoiceId}</td><td style="text-align:right">$${(a.amount || 0).toFixed(2)}</td></tr>`;
          } else if (a.orderId) {
            return `<tr><td>Order #${a.orderId}</td><td style="text-align:right">$${(a.amount || 0).toFixed(2)}</td></tr>`;
          }
          return '';
        }).join('');
        appliedSection = `<h3>Applied To</h3>
<table><thead><tr><th>Reference</th><th>Amount</th></tr></thead>
<tbody>${appliedRows}</tbody></table>`;
      } else {
        appliedSection = '<p><em>Stored as account credit — not yet applied to specific invoices/orders.</em></p>';
      }

      return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Payment Receipt — ${cust.name || 'Customer'}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}
table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f5f5f5;font-weight:bold}
.total{font-weight:bold;font-size:1.1em}
.receipt-box{border:2px solid #1a73e8;padding:24px;border-radius:8px;max-width:500px}
h1{color:#1a73e8;margin-bottom:4px}
.subtitle{color:#666;margin-top:0}</style></head><body>
<div class="receipt-box">
<h1>${companyName}</h1>
<p class="subtitle">Payment Receipt</p>
<hr>
<p><strong>Customer:</strong> ${cust.name || ''}<br>
<strong>Date:</strong> ${pmt.date ? formatDate(new Date(pmt.date)) : now}<br>
<strong>Payment Method:</strong> ${methodLabel}${pmt.reference ? `<br><strong>Reference:</strong> ${pmt.reference}` : ''}</p>
<p class="total" style="font-size:1.4em;color:#1a73e8">Amount Received: $${(pmt.amount || 0).toFixed(2)}</p>
${appliedSection}
<hr>
<p style="text-align:center;color:#666;font-size:0.9em">Thank you for your payment!</p>
</div>
</body></html>`;
    }

    if (type === 'return' && data.returnOrder) {
      const ret = data.returnOrder;
      const cust = data.customer || {};
      const lines = (ret.lineItems || []).map(li =>
        `<tr><td>${li.productCode || ''}</td><td>${li.productName || ''}</td>` +
        `<td style="text-align:right">${li.quantity || 0}</td>` +
        `<td style="text-align:right">$${(li.casePrice || 0).toFixed(2)}</td>` +
        `<td style="text-align:right">$${(li.lineTotal || 0).toFixed(2)}</td>` +
        `<td>${li.isDamaged ? (li.damageType || 'Yes') : ''}</td></tr>`
      ).join('');

      const statusText = ret.status === 'Processed'
        ? (ret.invoiceAdjusted ? 'Processed — Invoice Adjusted' : 'Processed — Credit Applied')
        : ret.status;

      return `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Return ${ret.returnNumber || ''}</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#333}
table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{border:1px solid #ddd;padding:8px;text-align:left}
th{background:#f5f5f5;font-weight:bold}
.total{font-weight:bold;font-size:1.1em}
.credit{color:#d32f2f;font-weight:bold;font-size:1.3em}
h1{color:#1a73e8}</style></head><body>
<h1>${companyName}</h1>
<h2>Credit Return: ${ret.returnNumber || ''}</h2>
<p><strong>Customer:</strong> ${cust.name || ''}<br>
<strong>Date:</strong> ${ret.createdDate ? formatDate(new Date(ret.createdDate)) : now}<br>
<strong>Status:</strong> ${statusText}<br>
${ret.returnReason ? `<strong>Reason:</strong> ${ret.returnReason}<br>` : ''}
${ret.originalOrderId ? `<strong>Original Order:</strong> #${ret.originalOrderId}<br>` : ''}</p>
<table><thead><tr><th>Code</th><th>Product</th><th>Qty</th><th>Price</th><th>Total</th><th>Damaged</th></tr></thead>
<tbody>${lines}</tbody></table>
<p class="total">Subtotal: $${(ret.subtotal || 0).toFixed(2)}</p>
${ret.depositTotal ? `<p>Deposits: $${ret.depositTotal.toFixed(2)}</p>` : ''}
${ret.discountTotal ? `<p>Discount: -$${ret.discountTotal.toFixed(2)}</p>` : ''}
<p class="credit">CREDIT TOTAL: -$${(ret.grandTotal || 0).toFixed(2)}</p>
${ret.notes ? `<p><strong>Notes:</strong> ${ret.notes}</p>` : ''}
</body></html>`;
    }

    // Fallback: generic content
    return null;
  }

  // [MOD #003] Get a suitable filename for the attachment
  // [MOD #receipt] Added payment receipt filename support.
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
    if (type === 'payment' && data.payment) {
      const dateStr = data.payment.date ? data.payment.date.split('T')[0] : new Date().toISOString().split('T')[0];
      return `PaymentReceipt_${dateStr}_${(data.customer?.name || 'customer').replace(/\s+/g, '_')}.html`;
    }
    if (type === 'return' && data.returnOrder) {
      return `Return_${data.returnOrder.returnNumber || 'draft'}.html`;
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
