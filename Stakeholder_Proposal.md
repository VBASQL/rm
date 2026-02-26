# WHOLESALE ERP — STAKEHOLDER PROPOSAL v2
### Custom Order-to-Cash Platform for Wholesale Food Distribution
**Prepared: February 26, 2026 | Updated after Stakeholder Meeting (Feb 25)**

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [What's Included — Base Package](#2-whats-included)
3. [Data Migration (Required)](#3-data-migration)
4. [Server Setup & Deployment (Required)](#4-server-setup)
5. [Optional Add-Ons](#5-optional-add-ons)
6. [Technical Details](#6-technical-details)
7. [Pricing & Timeline](#7-pricing--timeline)
8. [Terms & Conditions](#8-terms--conditions)

---

<a name="1-system-overview"></a>
## 1. SYSTEM OVERVIEW

You already have a comprehensive workflow for wholesale distribution — ordering, warehouse, delivery, invoicing, collections. **I'm rebuilding the engine, not redesigning the car.** The new system mirrors your existing process but runs on modern, maintainable technology.

**What you get:**
- Same workflow your team already knows — modern foundation underneath
- Runs on your own server — your data stays in your building
- Works in any web browser — phones, tablets, desktops, no app store needed
- Full accounting built in — proper double-entry ledger, aging reports, statements
- Comprehensive reporting — report builder, standard reports, saved/scheduled exports, graphs
- Every action logged — who did what, when, and why
- Future-proof — adding features, integrations, or moving to cloud later is a natural extension

**The flow stays the same:**

```
SALESPERSON          WAREHOUSE           DELIVERY            ACCOUNTING
places order    →    picks product   →   delivers to      →  invoices &
(phone/in field)     off the shelf       customer's door      collects payment
```

---

<a name="2-whats-included"></a>
## 2. WHAT'S INCLUDED — BASE PACKAGE ($7,500)

Everything below is included in the base price. Each section describes a screen group your team will use.

---

### 2.1 Login & Security

- Every user has an account with a role — system redirects to the right dashboard on login
- Roles: Salesperson, Warehouse Worker, Warehouse Manager, Driver, Route Planner, Accounting, Admin/Owner
- Permissions are granular — admin controls exactly what each person can see and do
- Company-owned Android handhelds: device registration required, PIN/biometric unlock after first login
- Desktop access: IP allowlist (office network only by default)
- All traffic encrypted (HTTPS), even on local network
- Failed login lockout, session timeout, tamper-proof audit log

---

### 2.2 Salesperson Screens

**Dashboard (hub/launchpad):**
- Quick-action buttons: New Order, Customer List, My Orders Today, Alerts
- Summary tiles: orders today, outstanding balance total, deliveries in progress
- Recent activity feed, link to full Reports page

**Customer List:**
- Search/filter by name, status, area, tier
- At-a-glance per row: name, last order, balance, overdue flag, credit status
- "New Order" button on each row — skip into order wizard directly

**Customer Profile (4 tabs):**
- Overview — contact info, addresses, credit status, tier, assigned salesperson
- Orders — order history, duplicate any past order, filter by date/status
- Account — invoices, payments, aging, balance, statements
- Notes/Activity — internal notes, notification log, activity feed

**New Order Wizard (4 steps):**
1. **Select Customer** — quick search, recents, favorites, pick delivery location
2. **Build Order** — browse catalog (Category → Subcategory → Product → Flavor → Size), search, duplicate past order, favorites/quick lists. Running total visible. Each item shows 5-digit code, name, qty, price, line total
3. **Review** — editable invoice preview. Adjust quantities, apply discounts (within policy caps), set delivery date, add notes
4. **Submit** — order enters system. Credit customers → straight to warehouse. Pay-first customers → held until payment clears

**Payment collection in the field:**
- Salespeople can collect payments from customers during visits
- Process through Authorize.NET (card, ACH) or record cash/check

---

### 2.3 Warehouse Screens

**Order Queue:**
- Orders grouped by route/delivery area
- Manager assigns orders to specific pickers
- Status tracking: New → Assigned → Picked → Approved

**Pick Flow (Base — Paper Pick + Manual Entry):**
- Manager prints pick list for the order
- Worker picks using pen and physical clipboard — standard paper process
- Worker returns completed clipboard to manager
- Manager manually enters results in system: edits quantities or removes lines, rest is confirmed
- Confirmed pick → moves to approved status

**Pick Approval:**
- Manager reviews every picked order before release
- Can override quantities, flag issues, reject back to picker
- Approved orders → ready for route assignment and truck loading

> Digital pick on handheld and AI pick sheet scanning are available as optional add-ons.

---

### 2.4 Route Planning Screens

> Route planning happens BEFORE the truck is loaded — the route determines loading order (last stop loaded first).

**Route Builder:**
- All approved/picked orders displayed, grouped by area
- Planner drags orders into route groups — each route = one truck + one driver
- Arranges stop order within each route (planner knows the streets)
- Shows total cases per route, number of stops
- Assigns driver and truck
- Finalized route → locked and sent to warehouse for truck loading

**Route Assignment View:**
- Summary of all routes for the day
- Can reassign driver/truck, reorder stops until loading begins

---

### 2.5 Driver Screens

**My Route:**
- List of stops in delivery order with progress bar
- Each stop: customer name, address, # cases, delivery window

**Stop Detail:**
- Order summary showing each product's 5-digit product code, name, and quantity
- **Driver can edit the order before confirming** — e.g. customer spots a problem at the door. Edits are flagged for accounting and salesperson is notified automatically
- **Print Invoice** — handheld portable Bluetooth thermal printer (driver carries it)
  - Location check: if GPS shows driver isn't near the address → warning (logged, not hard-blocked)
- **Digital Signature option** — customer signs on device screen instead of receiving printout
- **Launch Navigation** — opens Google Maps / Waze with destination
- **Delivery status:** Confirmed (tap to confirm) or Rejected (select reason + optional note)

**Auto-Confirmation Rule:** When the driver prints or sends the invoice, delivery is automatically marked as confirmed — no extra tap needed.

**End of Route:** Summary of completed/rejected stops, driver confirms route complete.

---

### 2.6 Accounting Screens

> Simpler than QuickBooks on the surface — but proper double-entry accounting runs automatically underneath every action.

**Dashboard:**
- KPI tiles: total receivables, overdue amount, payments received today/week, cash flow summary
- Action queue: invoices pending review, unapplied payments, credit reviews due, flagged orders
- Quick access: customer lookup, send statement, process payment, issue credit memo

**Invoice Detail:**
- Full invoice view (same layout as printed)
- Payment status and history, actions (apply payment, credit memo, send, print, adjust)
- PDF preview and download
- Linked journal entries visible for audit

**Payment Processing:**
- **Receive payment without selecting an invoice** — record a payment against a customer. It sits in "unapplied payments" until the accountant matches it to specific invoices later
- **Apply payment to specific invoice(s)** — select one or more open invoices and apply the payment directly
- **Both flows always available** — receive first / apply later, or receive and apply in one step
- Batch payment view — process multiple payments in one session
- Methods: card (Authorize.NET), ACH, check (manual entry), cash (manual entry)
- Unapplied payments dashboard — see all unmatched payments, match to invoices when ready

**Statements:**
- Per customer: outstanding invoices, payments, credits, running balance
- Send via email per customer preference
- Batch statement run — all customers at once or filtered group
- Configurable schedule (monthly, weekly, custom per customer)
- Auto-send on schedule + manual send anytime

**Invoice Review & Finalization:**
- End-of-week (configurable) review before invoices are "posted" to the ledger
- **Rules-based flagging** — system flags potential issues: pricing anomalies, unusual quantities vs. customer history, missing deposits, duplicates, discount policy violations
- Accountant reviews flags, corrects as needed, then finalizes → posted to ledger

**Monthly Statement Lock:**
- Manual monthly process (same pattern as weekly invoice review)
- Accounting reviews and locks monthly statements

**Pricing Management:**
- Create unlimited price levels (e.g. "Standard," "Preferred," "Chain Discount," "Zone A")
- Assign prices to products per level (e.g. Product X = $10.00 in Standard, $9.00 in Preferred)
- Assign customers to a price level — determines which prices they see and are charged
- Levels can be based on: customer type, area, zip code, custom groups, or individual customer override
- Admin can also access pricing for overrides

---

### 2.7 Accounting Engine (Under the Hood)

Everything below runs automatically — users never create journal entries manually.

**Double-Entry Ledger:**
- Every financial action creates proper journal entries automatically
- Invoice created → Debit: Accounts Receivable, Credit: Sales Revenue + Deposits + Tax
- Payment received → Debit: Cash/Bank, Credit: Accounts Receivable
- Discount applied → Debit: Discounts Given, Credit: Accounts Receivable
- Accountant CAN view the full ledger and drill into any entry

**Chart of Accounts:** Pre-configured (Accounts Receivable, Sales Revenue, Deposit Revenue, Discounts Given, Cash/Bank, Unapplied Payments, Credit Memos, Tax Payable). Admin can add/rename accounts.

**Standard Financial Reports:** AR Aging, Customer Statements, Transaction Journal, Revenue by period/product/customer/salesperson, Cash Receipts, Tax Report, Trial Balance.

---

### 2.8 Reports

> Reports are a first-class feature. Every user gets answers from system data without asking IT or exporting to Excel.

**Report Builder:**
- User-friendly — no SQL knowledge needed
- 3-step process: (1) Pick data source(s) — Orders, Invoices, Payments, Customers, Products, Deliveries, etc. (2) Select columns — drag/drop or checkbox. System auto-handles joins across data sources. (3) Filter & sort — date range, status, customer, salesperson, area, product, any field. AND/OR combinable.
- **Live preview** — results update as filters change
- **Auto-generated graphs** — bar, line, pie charts when report includes numeric columns. Interactive (hover, click to drill down)
- **Export:** PDF, Excel (.xlsx), CSV
- **Grouping & aggregation** — group by any dimension, auto-sum/average/count per group

**Standard Pre-Built Reports (ready out of the box):**
- **Sales:** by period, by salesperson (with leaderboard), by customer, by product/category, by area/zip, order volume trends
- **Accounting:** AR Aging, statements, revenue, cash receipts, tax, trial balance, transaction journal, unapplied payments, credit memos
- **Operations:** delivery performance (on-time, rejections), route efficiency, pick accuracy, driver performance, inventory movement
- **Customer:** activity over time, new acquisition, retention/churn, credit utilization

**Saved Reports & Scheduled Exports:**
- Save any report with a name — preserves filters, columns, sort, chart settings
- Recurring exports — schedule saved reports to auto-run and email (e.g. "Sales by Salesperson — Weekly" every Monday)
- Report library per user + admin-published company-wide shared reports
- Pin favorites to dashboard for one-click access

**Role-Based Access:**
- Salespeople see only their customers' data
- Accounting sees all financial data
- Managers see everything
- Admin controls report access via the same permission engine

---

### 2.9 Admin / Back-End Control Panel

> Separate area from field UI. Power-user settings — not visible to field workers.

**Sections:**
1. **Users & Roles** — create/edit users, assign roles, set granular permissions, manage teams
2. **Product Catalog** — categories, subcategories, products, 5-digit codes, pricing, deposits, display units (sales vs. warehouse view), visibility rules
3. **Pricing** — admin overrides and global settings (day-to-day pricing managed by accounting — see Section 2.6)
4. **Policies** — discount caps, adjustment rules (pre-pick open → post-pick strict), invoice lock period, order modification rules, credit tier definitions, approval workflows
5. **Notifications** — triggers, channels, timing, templates per event type
6. **System Settings** — company info, delivery date defaults, payment gateway config, printer settings, statement schedules

Each section has: list view with search/filter, detail/edit form, audit log.

---

### 2.10 Manager / Owner Dashboard

- **All features included** — owner sees everything, can customize visible sections
- **Multiple saved views** — "Daily Overview," "Sales Focus," "Collections Focus," etc.

**Default view:**
- **Live Route Tracker** — all drivers on a map in real time, per-driver stop progress
- **KPI Tiles:** revenue today/week/month vs. prior period, deliveries, rejection rate, collection rate, outstanding receivables
- **Salesperson Performance** — individual + comparison/leaderboard, revenue, orders, collection rate
- **Alerts & Flags** — rejected deliveries, over-limit customers, overdue accounts, pending approvals
- **Reports quick access** — links to full Report Builder and saved reports

**Customization:** drag-and-drop tiles, show/hide sections, save multiple named views.

---

### 2.11 Notifications (Base — Email Only)

- Built-in notification engine — email channel included in base
- **Triggers:** invoice sent, payment due, payment received, delivery confirmed, credit limit approaching, statement ready, review date reached, custom triggers
- **Timing:** configurable — e.g. reminder 3 days before due, again on due date, again 7 days after
- **Templates:** customizable per event type
- **Logging:** every notification logged — who, what, when, delivery status

> SMS (Twilio) and WhatsApp channels are available as optional add-ons.

---

### 2.12 Offline Mode (Basic — Included)

- Orders and delivery confirmations saved on device when connection drops
- Product catalog and customer data cached locally
- Sync engine queues offline actions → pushes to server on reconnect
- Conflict resolution: server timestamp wins, user notified of any overrides
- **Scope:** offline ordering + offline delivery. Accounting/admin always requires connection

---

### 2.13 Order Lifecycle & Policies

> **Core design principle:** Almost every rule in the system is configurable through admin/accounting control panels — not hardcoded. Order rules, discount caps, credit tiers, invoice locks, modification limits, notification triggers, catalog visibility — all adjustable per user, per group, per role, or system-wide. Sensible defaults ship out of the box; you customize from there.

**Order vs Invoice:**
- Separate records — order tracks what was requested, invoice generated from what was actually delivered

**Order Modification Rules (fully configurable):**
- Before picking: salespeople/accounting can freely edit (add/remove items, adjust quantities, discounts, delivery date, cancel)
- After picking begins: modifications become very strict — limited adjustments only
- **Policy engine controls everything post-pick:** what adjustments are possible, who can make them, what caps/limits apply — all configurable per role, per user, per group
- Cancellation rules, post-pick adjustments, return credits — all policy-controlled the same way
- Every change at every stage logged with who, what, when, documented reason

**Discount & Adjustment Caps (fully configurable):**
- Admin sets per-role/per-user/per-group limits on discounts salespeople can give
- System enforces caps automatically — salesperson can't exceed their limit
- Deposit discounts/waivers also controlled by policy
- Post-pick adjustments follow the same cap system

**Customer Credit Tiers (fully configurable):**
- Admin can create any number of tiers with custom names and rules
- **Credit customers:** order → warehouse immediately, pay later per terms (net-15, net-30, etc.)
- **Pay-first customers:** order held until payment clears, payment link sent automatically
- New customers default to $0 credit limit / pay-on-order
- Rules per tier: payment timing, credit limits, block vs. warn behavior, notification triggers, discount caps — all configurable
- Credit limit review: manual scheduled feature — accountant sets a reminder date, system notifies on that date
- All credit decisions and tier changes logged with full audit trail

**Invoice Lock & Finalization (manual process):**
- Accounting manually reviews and locks invoices (weekly review cycle, configurable)
- Once locked, adjustments require documented reason and elevated permission
- Credit memos can be issued against locked invoices
- Monthly statement lock follows the same manual review-and-lock pattern

**Product Codes:**
- 5-digit numeric auto-generated codes with structured hierarchy
- Universal identifier across all screens and printouts

**Pricing:**
- **Price levels** — admin creates unlimited named price levels (e.g. "Standard," "Preferred," "Chain Discount," "Zone A")
- **Products are assigned to price levels** — each product/variant gets a price in each level (e.g. Product X = $10.00 in Standard, $9.00 in Preferred, $8.50 in Chain)
- **Customers are assigned to a price level** — the customer's assigned level determines which prices they see and are charged
- Price levels can be based on: customer type, area, zip code, custom groups, or individual customer override
- When a salesperson opens an order for a customer, the system automatically shows that customer's price level prices
- CRV deposits: per case, shown separately on invoice, tracked separately in accounting, not taxed
- No sales tax (wholesale only)

**Permissions & Visibility (fully configurable):**
- Who sees what is NOT hardcoded by role — admin sets policies per user, per group, or per role
- Salespeople see only their assigned customers; drivers see only their route; accounting sees all financial data; managers see everything
- Admin can override any default (e.g. senior salesperson sees another's accounts)
- Same policy engine controls data visibility, discount caps, adjustment limits, and order rules

---

### 2.14 Security (Included)

- Device registration for mobile handhelds — unregistered devices blocked
- PIN/biometric unlock after initial login
- IP allowlist for desktop access
- HTTPS everywhere (even on LAN)
- Failed login lockout
- Tamper-proof audit log (append-only, even admins can't delete)
- Payment data (PCI compliant) — card numbers never touch the app, only Authorize.NET tokens
- Reason codes required for sensitive actions
- Admin can revoke devices and force-logout users remotely

---

<a name="3-data-migration"></a>
## 3. DATA MIGRATION (Required — Billed Separately)

This is a company with records going back to 2000 — starting from scratch is not an option. All existing data must be migrated into the new system.

**What's included:**
- Import existing customers, products, pricing, and historical invoices/transactions from your current system
- Data cleaning, format conversion, deduplication, and verification
- Mapping old data structures to the new system's schema
- Validation reports — you review and confirm the imported data is correct before go-live

**Pricing: $500 – $3,000** — exact cost depends on:
- **What data needs to be migrated** — basic records (customers, products, invoices, transactions) are on the lower end. Adding saved pricing rules, discount structures, customer-specific prices, policies, credit terms, salesperson assignments, and other configuration data increases complexity and cost.
- What data formats are available from the previous system (database export, spreadsheets, API, etc.)
- Volume and complexity of historical records
- How clean the existing data is (duplicates, inconsistencies, missing fields)
- Whether I receive the data before development starts (preferred — allows me to build the import alongside the system)

**Process:** I need access to your existing data as early as possible. I'll review it, assess the scope, and agree on a final migration price before work begins. Migration runs in parallel with the build — no impact on the 4-week timeline.

---

<a name="4-server-setup"></a>
## 4. SERVER SETUP & DEPLOYMENT (Required — Choose One)

The software price ($7,500) covers building the application. Getting it running requires server setup, which is a separate cost.

**In both options, your database stays on-premises — your data never leaves your building.** The choice is where the web server (the part that processes requests and serves the application) runs.

### Option A: Full On-Premises — $2,500 setup

Both the web server and database run on your hardware in your office. I install and configure everything from scratch:
- Windows Server OS configuration and hardening
- PostgreSQL database installation, tuning, and backup scheduling
- .NET 8+ runtime, web server (IIS/Kestrel), reverse proxy setup
- SSL certificates (purchase and configuration)
- Network configuration — firewall rules, port forwarding, DNS, static IP
- Security hardening (IP restrictions, device registration, encryption at rest)
- Initial performance testing and optimization

**Why it costs more:** Everything is manual. I install the operating system, download and configure every package, set up networking from your router/firewall, troubleshoot hardware compatibility, and test the full stack on your specific hardware. If something doesn't work with your network setup, I diagnose and fix it.

**Pros:** Data physically stays in your building, full hardware control, no cloud dependency
**Cons:** Ongoing maintenance costs (hardware upkeep, power, internet, OS updates, physical security). If the server hardware fails, you're down until it's fixed or replaced. You are responsible for keeping the server running.

### Option B: Hybrid — Cloud Web Server + On-Premises Database — setup & monthly costs vary

The **web server** (application processing) runs on a cloud VPS (Azure, AWS, DigitalOcean, Hetzner, etc.). The **database** stays on your on-premises server — your data never leaves your building. The cloud web server connects securely to your local database through an encrypted tunnel.

**The pitch: Your data is yours. Processing is in the cloud.**

**Why setup is cheaper:** Cloud servers already come pre-configured with a compatible operating system (Ubuntu Server or Windows Server — ready to go out of the box). Installing .NET and all application dependencies is a one-command process through built-in package managers. There's no physical networking to configure for the web layer — firewalls, security groups, DNS, and SSL certificates are all built into the cloud dashboard and can be automated. No additional hardware to spec, purchase, ship, rack, cable, or test for the application server. You still need a local machine for PostgreSQL, but a database-only server is simpler and cheaper to set up than a full application stack.

**Pros:**
- Data stays in your building (database is local)
- No additional hardware to buy for the web server
- Automatic power and internet redundancy for the application layer (cloud data centers have generators, redundant connections)
- Built-in backup for the application server (snapshots)
- Easy to scale up processing power (need more? click a button, pick a bigger instance)
- OS patches and security updates for the web server are simpler to apply
- If you already have a machine for the database, total hardware cost is much lower

**Cons:** Monthly recurring cost (depends on provider and server specs), requires a secure tunnel between cloud and local database, you still maintain the local database server

**Impact on optional add-ons with hybrid deployment:**
- **VPN Lockdown (OPT-9):** Cost reduced — the cloud-to-database tunnel is already secured. Cloud providers include private networking, security groups, and firewall rules as built-in features.
- **Cloud Backup (OPT-15):** Cost reduced or unnecessary for the web layer — cloud VPS includes snapshot backups. Database backups are handled locally.
- **Failover Server (OPT-17):** Cloud web server failover is significantly cheaper — spinning up a standby instance is built-in functionality. Database failover still requires a second local machine or replication setup.

**Monthly cost context:** Cloud hosting monthly costs are often comparable to or less than the electricity, internet bandwidth, and IT time you'd spend maintaining a full on-premises application server — plus you don't need to buy a second machine for the web layer.

---

<a name="5-optional-add-ons"></a>
## 5. OPTIONAL ADD-ONS

Each add-on can be included now or added later. Building during the initial build is cheaper and faster than retrofitting.

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

<a name="6-technical-details"></a>
## 6. TECHNICAL DETAILS

### Where It Runs
- **Database:** Always on-premises — PostgreSQL runs on your local server. Your data never leaves your building
- **Web server:** Your choice — on-premises (same machine or separate) or cloud VPS (see [Section 4](#4-server-setup))
- **Application:** ASP.NET Core (.NET 8+) — Microsoft's modern enterprise platform. Native on Windows and Linux
- **Database engine:** PostgreSQL — powerful, free (zero licensing fees forever), includes geographic capabilities for driver tracking
- **Web-based:** works in any browser (Chrome, Edge, Safari). No app store, no installations, no device updates

### How It Feels
- Modern web application — not clunky desktop software
- Desktop: full-screen dashboards, tables, charts
- Mobile: same app, auto-formatted for small screens, large buttons, minimal typing
- Fast: server does the heavy lifting, sends ready-made pages — phones don't need to be powerful
- Interactive sections (order builder, route planner, live map) use lightweight targeted JavaScript (~15-30KB)

### Architecture
- **Clean Architecture:** Web → Application → Core ← Infrastructure
- Server-rendered pages (Razor) + HTMX for partial updates + Alpine.js for micro-interactions
- SignalR for real-time features (driver tracking, live order status)
- Authorize.NET SDK for payment processing (PCI compliant, tokenized vault)
- SMTP for email notifications (base)
- Google Maps JS API for tracking display + deep-link to nav apps for drivers

### Security Summary
- Private network — database never exposed externally
- All traffic encrypted (HTTPS)
- Device registration + PIN/biometric for mobile
- IP allowlist for desktop
- Role-based granular permissions
- Append-only audit log
- PCI-compliant payment handling (card data never touches your system)

---

<a name="7-pricing--timeline"></a>
## 7. PRICING & TIMELINE

### Software Development

| | |
|---|---|
| **Software (application build)** | **$7,500** |
| **Payment schedule** | No upfront payment — see milestones below |
| **Development period** | 4 weeks |
| **Training** | 5 hours included |
| **Post-launch support** | First month free, then $85/hour |

### Payment Milestones — You Pay Only After I Deliver

| Milestone | What I Deliver | Payment |
|-----------|---------------|--------|
| **1. Development complete** | Full working demo — every feature running, you test it yourself | 40% ($3,000) |
| **2. Server deployment** | System installed on your server, running, accessible, configured | 30% ($2,250) |
| **3. Go-live** | Data migrated & verified, 5 hours of staff training, system live with real operations | 30% ($2,250) |

*No money changes hands until you see results. Each payment is triggered by a tangible deliverable you can verify.*

### Server Setup (billed separately — see [Section 4](#4-server-setup))

| Deployment Option | Setup Cost | Monthly Cost |
|---|---|---|
| **Option A: Full On-Premises** | **$2,500** | Ongoing maintenance (hardware, power, updates — your responsibility) |
| **Option B: Hybrid (cloud web + local DB)** | **Varies** | Varies (depends on cloud provider, server specs, region) |

### What's in the Base ($7,500)

| Feature | Included |
|---------|----------|
| Salesperson app (mobile + desktop) | ✅ |
| Product catalog management (5-digit codes, dynamic pricing) | ✅ |
| Order placement (browse, search, duplicate, favorites) | ✅ |
| Customer management (profiles, tiers, multi-location) | ✅ |
| Warehouse flow (paper pick + manual entry, manager approval) | ✅ |
| Route planning & stop ordering | ✅ |
| Driver app (route, nav, print, edit orders, digital signature) | ✅ |
| Bluetooth invoice printing | ✅ |
| Full invoicing & accounting (double-entry ledger) | ✅ |
| Rules-based invoice review & flagging | ✅ |
| Payment processing (Authorize.NET — card, ACH) | ✅ |
| Salesperson field payment collection | ✅ |
| Statements (auto-send + manual, configurable schedule) | ✅ |
| Notification engine (email channel) | ✅ |
| Report Builder (sort/filter/join, graphs, export) | ✅ |
| Standard pre-built reports (sales, accounting, operations, customer) | ✅ |
| Saved reports & scheduled exports | ✅ |
| Admin control panel (users, roles, permissions, policies, pricing) | ✅ |
| Manager dashboard (live tracking, KPIs, performance) | ✅ |
| Live driver tracking (real-time map) | ✅ |
| Discount & adjustment policy engine | ✅ |
| Basic offline mode (device storage, sync on reconnect) | ✅ |
| Full audit trail | ✅ |
| Security (device registration, IP allowlist, encryption) | ✅ |
- Deployment setup (on-prem or cloud — see Section 4) | ✅ |
| 5 hours staff training | ✅ |
| 1 month post-launch support (issues within reason) | ✅ |
| After first month: $85/hour support rate | ✅ |

### Example Packages

**Essentials — Full On-Premises:**

| Item | Price |
|------|-------|
| Software (base) | $7,500 |
| On-Prem Server Setup | +$2,500 |
| Data Migration (required) | +$500–$3,000 |
| **Total** | **$10,500–$13,000** |
| Monthly | Ongoing maintenance (your responsibility) |
| Timeline | ~4.5 weeks |

**Essentials — Hybrid (cloud web + local DB):**

| Item | Price |
|------|-------|
| Software (base) | $7,500 |
| Hybrid Server Setup | Varies |
| Data Migration (required) | +$500–$3,000 |
| **Total** | **$8,000+ (depends on cloud infrastructure)** |
| Monthly | Varies (cloud provider + local DB maintenance) |
| Timeline | ~4.5 weeks |

**Connected — Full On-Premises (Base + notifications + digital warehouse):**

| Item | Price |
|------|-------|
| Software (base) | $7,500 |
| On-Prem Server Setup | +$2,500 |
| Digital Pick (OPT-1) | +$1,200 |
| SMS Notifications (OPT-4) | +$800 |
| WhatsApp Notifications (OPT-5) | +$1,000 |
| Data Migration (required) | +$500–$3,000 |
| **Total** | **$13,500–$16,000** |
| Monthly | Ongoing maintenance (your responsibility) |
| Timeline | ~5 weeks |

**Connected — Hybrid (cloud web + local DB):**

| Item | Price |
|------|-------|
| Software (base) | $7,500 |
| Hybrid Server Setup | Varies |
| Digital Pick (OPT-1) | +$1,200 |
| SMS Notifications (OPT-4) | +$800 |
| WhatsApp Notifications (OPT-5) | +$1,000 |
| Data Migration (required) | +$500–$3,000 |
| **Total** | **$11,000+ (depends on cloud infrastructure)** |
| Monthly | Varies (cloud provider + local DB maintenance) |
| Timeline | ~5 weeks |

**Full Build — Full On-Premises (everything):**

| Item | Price |
|------|-------|
| Software (base) | $7,500 |
| On-Prem Server Setup | +$2,500 |
| Data Migration (required) | +$500–$3,000 |
| All optional add-ons (OPT-1 through OPT-17, excl. OPT-8 TBD, OPT-14 hourly) | +$17,800–$18,800 |
| **Total** | **~$28,300–$31,800** |
| Monthly | Ongoing maintenance (your responsibility) |
| Timeline | ~7-8 weeks |

**Full Build — Hybrid (cloud web + local DB, everything):**

| Item | Price |
|------|-------|
| Software (base) | $7,500 |
| Hybrid Server Setup | Varies |
| Data Migration (required) | +$500–$3,000 |
| All optional add-ons (OPT-1 through OPT-17, excl. OPT-8 TBD, OPT-14 hourly) | +$15,800–$16,400 |
| **Total** | **$23,800+ (depends on cloud infrastructure)** |
| Monthly | Varies (cloud provider + local DB maintenance) |
| Timeline | ~7-8 weeks |

*Hybrid full-build add-ons are lower because VPN (OPT-9), Cloud Backup (OPT-15), and Failover Server (OPT-17) cost less with cloud web server deployment.*

---

<a name="8-terms--conditions"></a>
## 8. TERMS & CONDITIONS

### Payment Terms
- **No upfront payment** — you pay only after I deliver
- **Milestone 1 — Development complete** (40% / $3,000): Full working demo, you test every feature
- **Milestone 2 — Server deployment** (30% / $2,250): Installed and running on your server
- **Milestone 3 — Go-live** (30% / $2,250): Data migrated, staff trained (5 hours), system live
- Server setup: billed separately at deployment (see [Section 4](#4-server-setup))
- Optional add-ons: payment split proportionally across same milestones

### Scope & Changes
- Covers all features listed in Base Package (Section 2) and selected optional add-ons
- Minor adjustments (cosmetic, layout, wording) included at no extra cost
- Major scope additions quoted separately before work begins
- All changes documented and agreed in writing

### Intellectual Property
- Upon final payment, you own the complete source code, database, and all project assets
- You may modify, extend, or host the system however you choose
- I retain the right to use general techniques and non-proprietary patterns in future work

### Support
- **First month after go-live: free support** — bug fixes, issues, and reasonable adjustments at no cost
- **After first month: $85/hour** — billed in 15-minute increments, quoted before work begins
- **Availability:** Monday–Friday, 9 AM – 6 PM (Eastern). No weekends or holidays unless pre-arranged.
- **Response times:**
  - Critical issues (system down, data loss): response within 4 business hours
  - Non-critical issues (bug, UI problem, minor feature not working): response within 1–2 business days
- **What counts as "reasonable" during the free month:**
  - Bug fixes — something doesn't work as designed
  - Minor adjustments — small layout, wording, or behavior tweaks
  - Configuration help — adjusting settings, policies, or rules within the admin panel
  - Quick questions — "how do I do X?" via email or message
- **What is NOT included (even during the free month):**
  - New features or functionality not in the original scope
  - Redesigning screens or workflows after sign-off
  - Ongoing training beyond the included 5 hours
  - IT/infrastructure issues (see section below)
- Feature requests beyond agreed scope are quoted separately

### IT vs. Application Responsibility (On-Premises Deployment)

Once the system is installed, running, and handed off at Milestone 3, there is a clear line between **application issues** (my responsibility) and **IT/infrastructure issues** (your responsibility):

**My responsibility (application issues):**
- Software bugs — the application doesn't work as designed
- Application errors, crashes, or unexpected behavior in the code
- Database schema issues caused by the application
- Issues introduced by any updates or patches I apply

**Your responsibility (IT/infrastructure issues):**
- Server hardware failures (disk, RAM, power supply, etc.)
- Operating system updates, patches, and reboots
- Network connectivity — internet outages, firewall changes, DNS, router/switch issues
- Power outages and UPS/backup power
- Server antivirus/security software conflicts
- User account management on the Windows Server itself
- Physical security of the server hardware
- ISP issues, static IP changes, domain/SSL certificate renewals
- Backup of the server and database files (I set up the schedule — you ensure it keeps running)
- Any third-party software installed on the server that interferes with the application

**Gray area — billed at $85/hour:**
- "The app stopped working" caused by a Windows update, antivirus quarantine, or network change — I can diagnose and fix, but this is an infrastructure-caused issue
- Server ran out of disk space, database can't write — infrastructure, but I can help clean up
- You changed firewall rules and broke connectivity — I can help reconfigure

*In short: if the application code is the problem, it's on me. If the server, network, hardware, or OS is the problem, it's on you. If you need me to help with infrastructure issues, I'm available at $85/hour.*

### Confidentiality
- All business information and customer data treated as confidential
- No data shared with third parties except agreed integrations (Authorize.NET, SMTP provider)
- Optional AI services (if selected): only specific data sent (audio, photo, metadata) — not your entire database. AI providers process and do not store data permanently

### Cancellation
- Before development: no cost (no payment has been made)
- During development: completed milestone payments non-refundable; work to date delivered to you
- Project may pause if milestone payment is more than 7 days overdue

---

## NEXT STEP

Review this proposal, select any optional add-ons, and confirm. Once first payment is received, development begins immediately.

> **Open items:** IT meeting needed for server specs and remote access requirements (Q35, Q36). These don't block project start — they can be resolved during Week 1.

---

*This proposal is valid for 30 days from the date above.*
