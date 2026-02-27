# WHOLESALE ERP — OPTIONAL ADD-ONS
### Companion Document to Stakeholder Proposal v2
**Prepared: February 26, 2026**

---

Each add-on can be included now or added later. Building during the initial build is cheaper and faster than retrofitting.

> See the main **[Stakeholder Proposal](Stakeholder_Proposal.md)** for base package details, pricing, and terms.

---

### OPT-1: Digital Pick on Handheld — +$1,200 / +2-3 days
Picker opens assigned order on tablet/handheld, sees line items with 5-digit codes and requested quantities, enters picked quantities per item. Submits to manager for approval. Replaces paper pick flow with a digital workflow.

### OPT-2: AI Pick Sheet OCR — +$1,500 / +3-4 days
Worker picks using paper and pen (current process). Manager photographs the completed pick sheet. AI reads handwritten quantities and maps them to line items using 5-digit product codes. Manager reviews AI readings on screen, confirms or corrects, and approves. Requires: OpenAI API key (ongoing usage cost ~$0.01-0.05 per photo).

### OPT-3: Voice Ordering — +$1,500 / +3-4 days
Salesperson speaks naturally ("three cases black cherry, eight cases lemon lime"). AI matches spoken words to actual products in your catalog — not just dictation. Plays back matches for confirmation. Three input methods: speak live in the app, paste a voice note (e.g. from WhatsApp or iMessage), or upload an audio file. Requires: OpenAI API key.

### OPT-4: SMS Notifications (Twilio) — +$800 / +1-2 days
Adds SMS as a notification channel. Same triggers and timing as email. Requires: Twilio account (SMS costs are yours, typically $0.01-0.02 per message). *Note: SMS messaging may require regulatory compliance registration (e.g. A2P 10DLC or toll-free verification) which involves a carrier approval process and may incur minor additional fees.*

### OPT-5: WhatsApp Notifications — +$1,000 / +2-3 days
Adds WhatsApp as a notification channel. Customers can reply (replies logged). Requires: WhatsApp Business API account (Meta approval process, messaging costs ~$0.01-0.05 per message). *Note: WhatsApp Business API requires Meta's business verification and approval process, which may involve regulatory compliance steps and minor additional fees.*

### OPT-6a: Customer Credit Scoring — +$800 / +2-3 days
Automatic credit rating based on customer behavior — order frequency, payment history, average days to pay, returned orders. System auto-flags, warns, or blocks based on configurable thresholds. **Scoring policies set and managed by accounting.** Scoring rules, weights, and thresholds are all configurable.

### OPT-6b: Salesperson Performance Scoring — +$400 / +1-2 days
Similar scoring system applied to salespeople — tracks order volume, revenue generated, collection rate, new customer acquisition, and other configurable metrics. Used for **reporting and performance visibility** (dashboards, leaderboards, trends). Scoring rules and weights configurable by management.

### OPT-7: Customer Self-Service Portal — +$2,500 / +3-5 days
Customers log in to view their account balance, invoices, statements, payment history, and make payments. Optionally enable customer-placed orders (per customer). Reduces phone calls to your office.

### OPT-8: Customer-Facing Ordering Website — Pricing TBD
A full branded website where smaller customers can browse your catalog, place orders, and manage their account. This is a larger standalone project — essentially a customer-facing e-commerce layer on top of the ERP. Login-required, feeds into the same order system. Requires OPT-7 (Customer Portal) as a foundation. Pricing and timeline will be scoped separately based on requirements.

### OPT-9: Full Private Network Lockdown (VPN) — +$1,500 / +2-3 days
App becomes completely invisible to the public internet. All mobile devices connect through VPN tunnel. Internal DNS only. Zero attack surface. Your IT manages the VPN server (I set it up). *Note: base package already includes device registration + IP allowlist + encryption, which is sufficient for most operations. VPN tunneling may have ongoing costs from your VPN provider depending on the solution chosen.*

*☁️ Hybrid deployment: Reduced cost (~$800–$1,000) — the cloud-to-database tunnel is already secured. Cloud providers include private networking, security groups, and built-in firewall rules. Less manual VPN infrastructure to set up.*

### OPT-10: SSO + Multi-Factor Authentication — +$400 / +2-3 days
Users sign in with company accounts (Microsoft 365 / Azure AD / Google Workspace). MFA adds authenticator app or SMS verification. Enables secure remote access without VPN. Requires active Microsoft 365 or Google Workspace subscription.

### OPT-12: Truck-Specific Navigation — +$600 / +1-2 days
Integrates truck-specific nav (Sygic Truck or CoPilot) that accounts for low bridges, weight limits, no-truck zones. Important for dense urban delivery areas. Ongoing cost: ~$100-150/year per device for Sygic license.

### OPT-13: Multi-Company / Multi-Tenant — +$1,800 / +3-4 days
Run separate companies or divisions within one system — each with their own customers, products, invoicing, and accounting. Managed from one login. Significantly cheaper to build in from the start.

### OPT-14: Additional Training Hours — +$85/hour
Need more than the included 5 hours? Additional training sessions for new staff, advanced features, or refresher courses billed at $85/hour. Can be scheduled anytime.

### OPT-15: Temp Cloud Backup — +$800 / +1-2 days
Cloud fallback during server downtime. If your on-premises database server goes down, a cloud-hosted replica can serve cached/replicated data until the local server is restored. Ongoing cost: cloud hosting fees (~$30-60/month).

*☁️ Hybrid deployment: Reduced cost (~$300–$500) — web server is already in the cloud, so only the database replication layer needs to be added. Snapshot backups of the web server are already included.*

### OPT-16: AI-Powered Reports — +$2,000 / +4-5 days
Ask questions in plain English: *"Show me total revenue by salesperson for the last 3 months compared to the previous 3 months."* AI writes a query and the system runs it.

**Critical privacy guarantee — AI never sees your data:**
- AI receives ONLY metadata: table names, column headers, column types, relationships
- AI writes a read-only SQL query (SELECT only — no writes possible)
- Query runs on your server, results display on your screen — results are NEVER sent back to the AI
- Advanced mode: AI writes Python scripts for complex analysis (statistical, forecasting) — executed in a sandboxed environment on your server (isolated, no network, no filesystem access, memory/time limited)
- Every AI-generated query is logged with user, timestamp, and query text

Requires: OpenAI API key (usage cost ~$0.01-0.10 per query).

### OPT-17: Backup / Failover Server — +$1,000–$2,000 / +2-3 days
A standby server configured to take over automatically if the main server shuts down (hardware failure, power outage, maintenance). Includes:
- Second server with identical configuration (database replica + application mirror)
- PostgreSQL streaming replication — data syncs continuously from primary to standby
- Automated health monitoring — detects when the primary is down
- Automatic or manual failover — standby promotes itself to primary within minutes
- After the main server is restored, data syncs back and roles return to normal

**On-premises:** Requires a second physical server machine. Price toward the higher end ($1,500–$2,000) due to manual hardware setup and network configuration.
**Cloud deployment:** Significantly cheaper ($800–$1,200) — spinning up a standby instance is built-in functionality. Cloud providers offer managed replication and automatic failover out of the box.

---

### Optional Add-On Summary

| # | Add-On | Price | Timeline |
|---|--------|-------|----------|
| OPT-1 | Digital Pick on Handheld | +$1,200 | +2-3 days |
| OPT-2 | AI Pick Sheet OCR | +$1,500 | +3-4 days |
| OPT-3 | Voice Ordering | +$1,500 | +3-4 days |
| OPT-4 | SMS Notifications | +$800 | +1-2 days |
| OPT-5 | WhatsApp Notifications | +$1,000 | +2-3 days |
| OPT-6a | Customer Credit Scoring | +$800 | +2-3 days |
| OPT-6b | Salesperson Performance Scoring | +$400 | +1-2 days |
| OPT-7 | Customer Portal | +$2,500 | +3-5 days |
| OPT-8 | Customer Ordering Website | TBD | TBD |
| OPT-9 | Full VPN Lockdown | +$1,500 | +2-3 days |
| OPT-10 | SSO + MFA | +$400 | +2-3 days |
| OPT-12 | Truck Navigation | +$600 | +1-2 days |
| OPT-13 | Multi-Company | +$1,800 | +3-4 days |
| OPT-14 | Additional Training Hours | +$85/hour | As needed |
| OPT-15 | Temp Cloud Backup | +$800 | +1-2 days |
| OPT-16 | AI-Powered Reports | +$2,000 | +4-5 days |
| OPT-17 | Backup / Failover Server | +$1,000–$2,000 | +2-3 days |

---

### Hybrid Deployment Impact on Add-On Pricing

If you choose the hybrid deployment option (cloud web server + on-premises database), the following add-ons cost less:

- **VPN Lockdown (OPT-9):** Cost reduced — the cloud-to-database tunnel is already secured. Cloud providers include private networking, security groups, and firewall rules as built-in features.
- **Cloud Backup (OPT-15):** Cost reduced or unnecessary for the web layer — cloud VPS includes snapshot backups. Database backups are handled locally.
- **Failover Server (OPT-17):** Cloud web server failover is significantly cheaper — spinning up a standby instance is built-in functionality. Database failover still requires a second local machine or replication setup.
