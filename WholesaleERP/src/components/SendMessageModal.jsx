// ============================================================
// FILE: SendMessageModal.jsx
// PURPOSE: Email compose overlay — pre-filled recipient/subject,
//          attachment type selection, mailto: link for Phase 1.
// DEPENDS ON: EmailService
// DEPENDED ON BY: CustomerProfile.jsx (or any page needing email)
//
// WHY THIS EXISTS:
//   BUILD_PLAN.md §5.12: "Send via email" for invoices/orders.
//   Phase 1 uses mailto: links. Phase 2 adds server-side sending.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-12] Initial creation.
// ============================================================
import React from 'react';
import { X, Mail, Paperclip, Send } from 'lucide-react';
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
    // WHY: Pre-fill from props so salesperson just reviews and sends
    this.state = {
      to: props.recipientEmail || '',
      subject: props.subject || '',
      body: props.body || '',
      attachmentType: props.attachmentType || null,
    };
  }

  _handleSend = () => {
    const { to, subject, body } = this.state;
    if (!to) return;
    // WHY: Phase 1 — mailto: link opens device email client
    EmailService.composeEmail(to, subject, body);
    if (this.props.onSent) this.props.onSent();
    this.props.onClose();
  };

  render() {
    const { onClose } = this.props;
    const { to, subject, body, attachmentType } = this.state;

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

            <div className={styles.field}>
              <label className={styles.fieldLabel}><Paperclip size={14} /> Attachment Type</label>
              <div className={styles.attachGrid}>
                {ATTACHMENT_TYPES.map(t => (
                  <button
                    key={t.key}
                    className={`${styles.attachBtn} ${attachmentType === t.key ? styles.attachActive : ''}`}
                    onClick={() => this.setState({ attachmentType: t.key })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
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
              <Send size={18} /> Send Email
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default SendMessageModal;
