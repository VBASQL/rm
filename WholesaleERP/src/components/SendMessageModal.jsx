// ============================================================
// FILE: SendMessageModal.jsx
// PURPOSE: Email compose overlay — pre-filled recipient/subject,
//          attachment type selection with auto-download, mailto: link.
// DEPENDS ON: EmailService
// DEPENDED ON BY: CustomerProfile, OrderDetail, InvoiceDetail, Reports
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.12: "Send via email" for invoices/orders.
//   Phase 1 uses mailto: links + downloadable HTML attachments.
//   Phase 2 adds server-side sending with real SMTP attachments.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-14] #002 Added real attachment generation + download.
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { X, Mail, Paperclip, Send, Download, Check } from 'lucide-react';
import EmailService from '../services/EmailService';
import styles from '../styles/SendMessageModal.module.css';

const ATTACHMENT_TYPES = [
  { key: 'invoice', label: 'Invoice' },
  { key: 'order', label: 'Order Confirmation' },
  { key: 'statement', label: 'Account Statement' },
];

class SendMessageModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      to: props.recipientEmail || '',
      subject: props.subject || '',
      body: props.body || '',
      attachmentType: props.attachmentType || null,
      attachmentReady: false,
      attachmentFilename: null,
    };
  }

  // [MOD #002] When attachment type is selected, generate the file info
  _selectAttachment = (type) => {
    const data = this.props.attachmentData || {};
    const html = EmailService.generateAttachmentHTML(type, data);
    const filename = html ? EmailService.getAttachmentFilename(type, data) : null;
    this.setState({
      attachmentType: type,
      attachmentReady: !!html,
      attachmentFilename: filename,
    });
  };

  // [MOD #002] Download attachment file separately
  _handleDownloadAttachment = () => {
    const { attachmentType } = this.state;
    const data = this.props.attachmentData || {};
    const html = EmailService.generateAttachmentHTML(attachmentType, data);
    const filename = EmailService.getAttachmentFilename(attachmentType, data);
    if (html) {
      EmailService.downloadFile(filename, html, 'text/html');
    }
  };

  _handleSend = () => {
    const { to, subject, body, attachmentType } = this.state;
    if (!to) return;

    const data = this.props.attachmentData || {};
    const html = attachmentType ? EmailService.generateAttachmentHTML(attachmentType, data) : null;
    const filename = html ? EmailService.getAttachmentFilename(attachmentType, data) : null;

    // Opens mailto: AND downloads attachment file for manual attaching
    EmailService.composeEmailWithAttachment(to, subject, body, filename, html);

    if (this.props.onSent) this.props.onSent();
    this.props.onClose();
  };

  render() {
    const { onClose, attachmentData } = this.props;
    const { to, subject, body, attachmentType, attachmentReady, attachmentFilename } = this.state;
    const hasAttachmentData = attachmentData && Object.keys(attachmentData).length > 0;

    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.header}>
            <h3><Mail size={18} /> Compose Email</h3>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={22} />
            </button>
          </div>

          <div className={styles.body}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>To</label>
              <input
                type="email"
                className={styles.input}
                value={to}
                onChange={e => this.setState({ to: e.target.value })}
                placeholder="customer@email.com"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Subject</label>
              <input
                type="text"
                className={styles.input}
                value={subject}
                onChange={e => this.setState({ subject: e.target.value })}
                placeholder="Subject line"
              />
            </div>

            {/* [MOD #002] Attachment type selection — only show types that have data */}
            <div className={styles.field}>
              <label className={styles.fieldLabel}><Paperclip size={14} /> Attachment</label>
              <div className={styles.attachGrid}>
                {ATTACHMENT_TYPES.map(t => (
                  <button
                    key={t.key}
                    className={`${styles.attachBtn} ${attachmentType === t.key ? styles.attachActive : ''}`}
                    onClick={() => this._selectAttachment(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* [MOD #002] Attachment preview + download button */}
              {attachmentType && attachmentReady && (
                <div className={styles.attachPreview}>
                  <Check size={14} className={styles.attachCheckIcon} />
                  <span className={styles.attachFilename}>{attachmentFilename}</span>
                  <button
                    className={styles.attachDownloadBtn}
                    onClick={this._handleDownloadAttachment}
                    title="Download attachment file"
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              )}
              {attachmentType && !attachmentReady && hasAttachmentData && (
                <p className={styles.attachNote}>No data available for this attachment type.</p>
              )}
              {attachmentType && !hasAttachmentData && (
                <p className={styles.attachNote}>
                  Attachment will auto-download when you send.
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}>Message</label>
              <textarea
                className={styles.textarea}
                value={body}
                onChange={e => this.setState({ body: e.target.value })}
                rows={5}
                placeholder="Optional message…"
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={this._handleSend}
              disabled={!to}
            >
              <Send size={18} /> Send{attachmentReady ? ' with Attachment' : ''}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default SendMessageModal;
