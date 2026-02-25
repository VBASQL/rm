# WHOLESALE ERP / ORDER-TO-CASH PLATFORM
### Living Design & Planning Document
**Session 1 — February 24, 2026 | Status: User Flow Discovery in Progress**

---

## 🤖 CLAUDE'S BRIEFING — READ THIS FIRST

> **What we are doing:** Designing a full wholesale food distribution ERP app from scratch, through a structured Q&A session. Claude asks questions, pulls everything out of the user, and documents it here in real time. This document is the single source of truth.
>
> **Session structure:**
> 1. 🔵 **User Flow** ← WE ARE HERE — discovering all users, roles, needs, end-to-end flows
> 2. 🟡 App Design — screens, navigation, UX
> 3. 🟠 Infrastructure — tech stack, language, architecture
> 4. 🔴 Code Design — modules, classes, data models
> 5. 📋 Final Documentation — README, flow diagrams, API docs
> 6. 📅 Project Timeline — task list with durations
>
> **How to continue:** Read this whole document to restore context, then pick up from the **Next Steps** section at the bottom. Ask the next question in the Q&A flow. Update this document after every exchange.
>
> **Current focus:** Phase 2 UI/App Design started. Platform confirmed as browser-based web app on Windows server. Design principles captured. Next: go screen by screen through the app.
>
> **User:** Wholesale food distribution company. Food industry (bottles, cans, packaged goods). Company also does manufacturing and packaging. Currently on-premises setup. Plans to eventually move app to cloud, keep DB on-prem.

---

## 📋 Session Roadmap

| # | Phase | Status |
|---|-------|--------|
| 1 | User Flow | 🔵 IN PROGRESS |
| 2 | App Design | ⬜ Pending |
| 3 | Infrastructure | ⬜ Pending |
| 4 | Code Design | ⬜ Pending |
| 5 | Documentation | ⬜ Pending |
| 6 | Project Timeline | ⬜ Pending |

---

## 🧭 Core Design Principles

- **Flexibility over rigidity** — almost every rule (permissions, invoice locks, partial picks, discount caps) is configurable through admin panels, not hardcoded
- **Role-based permissions as a control panel** — roles are labels; actual permissions are granular and admin-assigned per user or group
- **Mobile-first for field users** — salespeople and drivers on Android handhelds; all field-facing screens must work perfectly on mobile browser
- **Offline resilience** — system must function without live DB connection; save locally, sync on reconnect
- **Modular / optional features** — offline mode, customer portal, cloud hosting, website integration are all toggleable modules
- **Voice as a first-class input** — voice ordering matches to product catalog via cloud AI (GPT-class model), not just transcription
- **Minimize friction for field users** — smart search, favorites, recents, duplicate order — reduce scrolling and taps
- **Audit trail everywhere** — especially for invoices, payments, discounts, and any locked record modifications

---

## 👥 User Roles

> Roles are configurable labels. Actual permissions set per user or group in admin control panel.

| Role | Primary Device | Key Responsibilities |
|------|---------------|----------------------|
| Accounts Payable / Accounting | Desktop | Customer setup, payments, invoices, statements, notifications, transactions |
| Product / Inventory Admin | Desktop | Categories, subcategories, products, flavors, sizes, pricing, deposits. May sync from external system |
| Salesperson | Mobile Android + Desktop | Place orders, view customer account, search products, apply discounts within policy |
| Warehouse Worker (Picker) | Android handheld + small printer | Receive orders, pick items, mark quantities, print pick lists |
| Warehouse Manager | Handheld / Tablet | Approve picked orders, override picks, manage warehouse settings |
| Route Planner | Desktop / Tablet | Assign deliveries to routes, organize stops, manage delivery dates |
| Driver | Mobile Android | View route, open GPS navigation, print invoice on delivery, confirm or reject |
| System Admin / Owner | Desktop | All permissions, invoice lock policies, multi-admin approval workflows, global settings |
| Customer *(future module)* | Browser / Portal | View account, pay invoices, optionally place orders |

---

## 🔵 PHASE 1: USER FLOW

### 1.1 Salesperson Order Flow

**Entry points:** Mobile browser (in-store, on the road) and Desktop (phone orders, office)

**Order creation steps:**
1. Select customer — quick search, recents list, favorites
2. Build order — multiple input methods:
   - **Voice mode** — speak naturally ("3 cases black cherry, 8 cases lemon"); AI matches to product catalog using cloud GPT-class model; plays back recording with each line highlighted for correction
   - **Browse mode** — Category → Subcategory → Product → Flavor → Size/Variant
   - **Favorites / Quick lists** — per salesperson or per customer
   - **Duplicate previous order** — reload past order and adjust quantities
3. Review full order summary
4. Submit — enters system (secondary approval optional, per permission settings)

**Product catalog rules:**
- Hierarchy: Category → Subcategory → Product → Flavor → Size/Variant
- Admin assigns which categories/products each salesperson can see
- Catalog layout and display order configurable globally and per salesperson
- Smart search across all levels — no endless scrolling

**Scheduling:**
- Orders can be placed for a future delivery date
- Default delivery date configurable per customer
- Warehouse sees upcoming orders surfaced ahead of time
- "ASAP" option for same-day or next-available delivery

---

### 1.2 Pricing & Discounts

- Base price per product (unit/case — units TBD)
- **Government deposit (CRV or equivalent)** — per container, shown separately on invoice, tracked separately in accounting
- Deposits can be discounted/waived by salesperson within policy-defined limits
- Salesperson can apply per-line-item discounts in the moment
- Discount caps enforced by policy — admin assigns policies to groups of salespeople
- Per-customer price lists — **TBD (see Open Questions)**
- Automatic promotions / volume deals — **TBD (see Open Questions)**

---

### 1.3 Warehouse Flow

- Orders transferred to warehouse on scheduled date (surfaced ahead of time)
- Picker receives order on handheld device
- Picker selects quantities per line — full, partial, or zero
- Whether partial shipments are allowed is a manager-configurable setting
- Customer charged only for what is actually picked and shipped
- Picker prints pick list to small Bluetooth printer
- Warehouse manager reviews and approves picked order before dispatch
- Manager approval required before route assignment

---

### 1.4 Delivery / Driver Flow

**Route Planning (done by warehouse manager or designated planner):**
- Planner sees all open orders for the day, organized by area/region
- Planner manually arranges stops in logical street order (they know the area)
- Truck loading order matters — last stop loaded first, first stop unloaded first; route order should reflect this
- Route assigned to a specific driver and truck

**Driver experience:**
- Driver sees their full route with stops in order on handheld device
- Opens integrated navigation per stop — Google Maps, Waze, or other (configurable)
- **Truck routing problem (flagged):** Standard GPS apps (Google Maps) don't account for truck restrictions (weight limits, low bridges, no-truck streets) — especially in dense urban areas like NYC. Possible solutions to research: use truck-specific nav (Sygic Truck, CoPilot), or note as known limitation. See Open Questions [Q24]
- Driver must follow stop order (truck loaded accordingly) but can flag issues

**At each stop:**
- Driver opens the order on device
- Prints invoice to Bluetooth printer on arrival
- Marks delivery as: **Confirmed** or **Rejected** (with reason)
- Status updates in system in real time

**Manager tracking dashboard:**
- Live view of all drivers on the road — location and progress
- Per-driver: which stops completed, which pending, which rejected
- Per-order: delivered / accepted / rejected with reason and timestamp
- Rejected orders flagged immediately to sales and accounting

---

### 1.5 Accounting & Invoicing

- Full transaction history per customer
- Unpaid invoice tracking and aging reports
- Invoice templates — per-customer assignment, customizable fields and layout
- Invoice locking — configurable lock period after creation or payment
- Invoice lock policy set by high-admin panel; policy changes may require multi-person approval workflow
- Adjustments after lock require documented reason and appropriate permission level
- Credit memos can be issued against locked invoices (rules TBD)
- Payment processing — integrated with **Authorize.NET**
- Non-applied payment tracking and reconciliation
- Statement generation — outstanding balance, payment history, unapplied credits

**Notifications:**
- Fully configurable notification system — managed primarily by accounting/managers
- Channels: SMS, WhatsApp, Email
- Triggers: configurable — invoice sent, payment due, payment received, statement ready, delivery confirmed, order placed, credit limit approaching, review date reached, custom triggers
- Timing/periods: configurable — e.g. reminder 3 days before due, again on due date, again 7 days after
- Salespeople can be granted permission to enable/manage certain notifications for their own customers
- Full log of all notifications sent — who received what, when, via which channel
- Customers can optionally reply (channel-dependent — e.g. WhatsApp replies logged)

---

### 1.6 Returns & Credits

- **No reverse logistics / return workflow needed** — the company does not handle product returns in the traditional sense
- **Deposit/bottle returns** (empty containers coming back) are treated as their own product line — same as any other SKU with a deposit value attached
- Exact structure of the deposit returns product line TBD — see Open Questions [Q19]

---

### 1.7 Customer Credit Tiers & Payment Control

**Customer tiers — fully configurable, admin can add/remove tiers and define rules per tier:**

**Tier 1 — Credit Customers** (standard wholesale accounts):
- Order placed → enters warehouse flow immediately
- Pays later per payment terms (net-15, net-30, etc.)
- Credit limit set by accounting per customer
- Credit limit review is a manual scheduled feature — accountant sets a reminder/notification date (e.g. "review in 2 months"); system notifies accountant on that date to re-evaluate
- Salesperson sees warning or is hard-blocked when customer is over limit or has overdue balance (warn vs. hard-block is configurable per policy)

**Tier 2 — Pay-First Customers** (smaller / new / high-risk accounts):
- Order placed but held — does NOT enter warehouse flow until payment clears
- **First-time payment flow:** payment link sent to customer → customer self-pays and gives consent → card/bank info saved to vault (Authorize.NET or compatible)
- **Returning payment flow:** salesperson or accountant charges stored token directly, OR sends new payment link
- Vault options: tokenized card, direct payment info (for legacy payment systems) — configurable
- Only after payment confirmed does order release to warehouse

**Credit tier system design:**
- Admin can create any number of tiers with custom names and rules
- Rules per tier are configurable: payment timing, credit limits, block vs. warn behavior, notification triggers, discount caps, etc.
- Assign customers to tiers individually or by group/policy
- All credit decisions and tier changes logged with full audit trail

---

### 1.9 Multi-Location Customers

- A single customer (company/account) can have multiple delivery locations (store branches)
- Each location has its own delivery address, contact, and potentially its own order history
- Billing/accounting rolls up to the parent account level
- Credit limit, payment terms, tier — set at parent account level
- Salesperson selects customer → then selects which location when placing an order
- Exact account hierarchy structure TBD — see Open Questions [Q25]

---

### 1.10 User Onboarding

- Formal in-app onboarding flow TBD — depends on client preference
- Options: guided in-app setup wizard, or informal (admin sets up users directly, trains in person)
- See Open Questions [Q26]

---

### 1.8 Salesperson Dashboard & Reports

**Default view — "smart summary" between simple and informative:**
- Customer list with at-a-glance status: last order date, outstanding balance, credit available, overdue flag
- Quick actions: place new order, view account, call/message customer
- Upcoming deliveries for their accounts
- Recent activity feed

**Customizable views:**
- Each salesperson configures their own default dashboard — what widgets, what columns, what order
- Save frequently-used reports as quick-access shortcuts
- Admin can set a company-wide default view that applies until salesperson customizes it

**Reports & dashboards:**
- Modern, smart, visual — charts, summaries, trends
- Per-customer: full transaction history, invoices, payments, aging, balance, credit status
- Portfolio view: all their customers in one list — who owes what, aging buckets, who to follow up with
- Sales performance: revenue by period, top products, top customers
- Custom report builder — salesperson defines columns, filters, date ranges, saves as named report

**Admin back-end (separate from field UI):**
- Power-user control panel for managers/admins who want deep configurability
- Manage: roles, permissions, policies, groups, discount caps, credit tiers, invoice lock rules, notification rules, product catalog structure, etc.
- Clearly separated from the clean field-facing UI so it doesn't clutter the day-to-day experience
- Think of it as two apps in one: a clean simple front-end for field users, a powerful back-end for admins

---

### 1.11 Product Catalog Management

**Admin/manager panel:**
- Separate back-end panel for managing what salespeople see and how
- Create/edit: categories, subcategories, products, flavors, sizes, variants
- Set pricing, deposit values, tax flags per product
- Control visibility: assign categories/products to specific salespeople or groups
- Set display order and layout of catalog
- Enable/disable products (out of stock, seasonal, discontinued)

**Salesperson catalog view:**
- Salespeople can customize how they personally see and navigate the catalog
- Save favorite products, custom quick-lists per customer
- View preferences (grid vs. list, sort order, etc.) saved per user
- Company default view set by admin, overridable by salesperson

**Inventory integration:**
- Full details TBD pending stakeholder answer on current inventory/manufacturing system
- Goal: pull live inventory data automatically where possible
- Someone should still have manual override ability
- Out-of-stock handling during order flow TBD — see Open Questions [Q1, Q27]

> ⬜ Inventory system details pending — see Open Questions [Q1] [Q27]

---

### 1.12 Statement Generation

- Default: monthly auto-send per customer
- Fully flexible — configurable per customer or per group/policy
- Options: frequency (weekly, monthly, custom), delivery channel (email, WhatsApp, SMS), auto vs. manual
- Manual send always available — accountant can send on demand at any time
- Statement content: outstanding invoices, payment history, unapplied credits, balance due
- Different customers/groups can have different statement schedules

---

### 1.13 New Customer Onboarding Flow

- Standard fields: company name, main contact, contact persons, email addresses, phone numbers
- Delivery address(es) — supports multiple locations under one account
- Billing address (may differ from delivery)
- Payment method(s) — card on file / vault token / payment terms
- Credit tier assignment
- Assigned salesperson(s)
- Any required documents or approvals TBD with accountant
- Admin or accounting creates the account; salesperson may be granted permission to create with limited fields

---

### 1.14 Order Modifications, Cancellations & Adjustments

- Salesperson can edit a placed order freely up to a configurable cutoff point (e.g. before warehouse starts picking)
- After picking begins — modifications restricted; who can do what is policy-controlled
- Cancellations and post-pick adjustments: rules TBD with stakeholders — will have a control panel similar to discount caps
- Adjustment caps: admin sets per-role limits on what adjustments salespeople or accountants can make
- All adjustments require a documented reason and are fully audit-logged
- Goal: more controlled than QuickBooks (which is too open) but not completely locked down
- ⬜ Exact rules TBD — see Open Questions [Q28, Q29]

---

### 1.15 Manager / Owner Dashboard & Reports

- Current state: legacy local system accessed via RDP, limited reporting, mostly raw tables
- New system should be a significant upgrade — modern, visual, intuitive
- **Standard reports to include (baseline):** sales by period, sales by salesperson, sales by customer, sales by product/category, outstanding receivables, aging report, payment collection rate, delivery performance (on-time, rejected), top customers, top products
- Reports should be visual — charts, trend lines, summaries, not just tables
- Custom report builder — filter by any field, date range, group by any dimension, save as named report
- Manager can see company-wide view; salesperson sees only their accounts
- All reports configurable and savable — manager sets up their own dashboard
- Feature ideas to propose to client: KPI tiles (revenue today/week/month vs. prior period), route completion live tracker, cash flow forecast, customer health score (order frequency + payment behavior)
- Client will review a summary before development begins — they can request additions or removals

---

## 🟡 Optional Feature Modules

| Module | Description | Priority |
|--------|-------------|----------|
| Offline Mode | App functions without live DB; saves locally, syncs on reconnect | High — current client need |
| Cloud App Deployment | App on cloud, DB stays on-prem initially | Medium — future |
| Temp Cloud Backup | Interim cloud backup during DB downtime | Medium |
| Customer Portal | Customers view accounts, pay invoices, optionally place orders | Phase 2 |
| Customer-Facing Website | For smaller customers — orders and account view | Phase 2 |
| Multi-Company / Multi-Tenant | Each customer as separate accounting entity | Phase 2 — wholesale expansion |

---

## 🚩 Open Questions — Stakeholder Interview Required

- **[Q1]** What inventory/manufacturing system is currently in use? Does it have an API or data export?
- **[Q2]** Who is the owner-level admin — one person or a small group?
- **[Q3]** Is there a credit approval step when onboarding a new customer?
- **[Q4]** Are discounts per product, per customer, per order — or all three?
- **[Q5]** What is the current invoicing system? What data needs to migrate?
- **[Q6]** Voice recognition: on-device (offline) or cloud-only? — *NOTED: Cloud preferred*
- **[Q7]** Should the voice system recognize product SKU codes in addition to names?
- **[Q8]** When duplicating a past order, should system check current inventory availability?
- **[Q9]** Are deposits (CRV) per unit or per case? Do they vary by container type (can vs bottle vs size)?
- **[Q10]** Do some customers have fully custom price lists, or always standard price minus a discount?
- **[Q11]** Are there automatic promotions or volume deals (buy X get Y, tiered pricing)?
- **[Q12]** Is tax calculated on the deposit separately from the product price?
- **[Q13]** How are returns/credits handled? Does the driver pick up returns on delivery?
- **[Q14]** Who can approve a return or issue a credit memo?
- **[Q15]** What is the exact invoice lock period the company wants to start with?
- **[Q16]** How many salespeople, warehouse workers, and drivers are there approximately?
- **[Q17]** What Bluetooth printer models are currently in use or planned?
- **[Q18]** Is there an existing customer database that needs to be imported?
- **[Q19]** How exactly are deposit/bottle returns handled as a product line? Are they a negative line item on the next order, a separate credit transaction, or something else?
- **[Q20]** Confirm with accountant: how many default credit tiers to start with, and what are their names/rules?
- **[Q21]** What payment vault/legacy systems need to be supported beyond Authorize.NET?
- **[Q22]** Should the credit review notification go to the accountant only, or also CC the salesperson on that account?
- **[Q23]** What default dashboard view does management want for salespeople out of the box?
- **[Q24]** Truck routing: should the app integrate a truck-specific navigation solution, or is standard GPS (Google Maps/Waze) acceptable with drivers using their own judgment?
- **[Q25]** Multi-location customers: confirm account hierarchy — parent account with child locations? Any cases where a location has its own separate billing?
- **[Q26]** User onboarding: invest in guided in-app onboarding, or handle training in person with simple admin setup?
- **[Q27]** When a product is out of stock between order placement and warehouse picking, what is the rule — auto-remove from order, flag to salesperson, or let warehouse decide? Are they a negative line item on the next order, a separate credit transaction, or something else?

---

## ⏭️ Next Steps

1. **Continue now:** Phase 2 — UI / App Design
2. **Parallel:** Stakeholder call using Stakeholder_Questions.md
3. **After answers:** Update open questions and adjust design decisions accordingly
2. **Then:** Remaining accounting edge cases
3. **Then:** Warehouse/delivery edge cases
4. **Stakeholder interview:** Use Open Questions list above
5. **Session 2:** App Design — screens, navigation, UX structure

---

## 🟡 PHASE 2: UI / APP DESIGN

### 2.1 Platform & Technology Direction

- **Platform:** Web browser-based — works on desktop, tablet, and mobile (responsive)
- **Deployment:** Installed on client's Windows server; web stack served locally (on-prem)
- Server setup: will need Node.js / web server packages installed on Windows — exact specs TBD pending IT conversation
- Mobile users (salespeople, drivers, warehouse) access via mobile browser — no native app needed
- Offline capability handled at the web app layer (service workers, local storage, sync)

### 2.2 UI Design Principles

**The brief (directly from client):**
- Not fancy — decent, clean, modern. Not Excel-with-buttons.
- Fast and responsive — snappy, no lag, no waiting
- Not overcomplicated — clean default views, complexity hidden until needed
- Settings/control panels are powerful but kept *separate* from the main workflow
- Smart and adaptive — UI adjusts based on context, role, and user preferences
- Lots of options, but surfaced intelligently — not dumped on the user at once

**Design language:**
- Clean, minimal chrome — content-first, not UI-first
- Modern data display — cards, summary tiles, smart tables (sortable, filterable, not static grids)
- Clear visual hierarchy — most important info largest, secondary info smaller
- Color used for status and alerts, not decoration (e.g. red = overdue, green = paid, yellow = pending)
- Consistent action patterns — same gestures/clicks do the same things everywhere
- Mobile: touch-friendly, large tap targets, minimal typing where possible

**Two-layer UI model:**
- **Layer 1 — Field UI:** Clean, focused, fast. What salespeople, drivers, and warehouse workers see. No clutter.
- **Layer 2 — Admin/Back-end:** Power settings, control panels, policies, configurations. Separate area, separate mindset.
- Users only see what their role needs — complexity hidden by default, accessible when needed

### 2.3 Screen Inventory

> ⬜ To be built out — screen by screen in next session

**Planned screen groups:**
- Auth: Login, role-based redirect on login
- Salesperson: Dashboard, Customer List, Customer Profile, New Order, Order Review, Order History
- Warehouse: Order Queue, Pick Order, Pick Confirmation, Print Management
- Driver: My Route, Stop Detail, Delivery Confirmation, Navigation Launch
- Accounting: Dashboard, Customer Account, Invoice Detail, Payment Processing, Statements, Notifications
- Route Planner: Open Orders, Route Builder, Route Assignment
- Admin Back-end: User Management, Roles & Permissions, Product Catalog, Pricing & Policies, Invoice Rules, Notification Rules, Credit Tier Settings, Discount & Adjustment Caps
- Manager: Reports Dashboard, Live Route Tracker, Sales Reports, Receivables

---

*Document last updated: Session 1 — February 24, 2026 | v0.7*
