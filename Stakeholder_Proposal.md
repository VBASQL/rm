# WHOLESALE ERP — STAKEHOLDER PROPOSAL
### Custom Order-to-Cash Platform for Wholesale Food Distribution
**Prepared: February 25, 2026**

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [What This System Does — Plain English](#2-what-this-system-does)
3. [How Your Team Will Use It — Step by Step](#3-how-your-team-will-use-it)
4. [What's Under the Hood](#4-whats-under-the-hood)
5. [Project Timeline — 4-Week Rapid Build](#5-project-timeline)
6. [Base Package — Pricing](#6-base-package-pricing)
7. [Optional Add-Ons — With Timeline & Cost Impact](#7-optional-add-ons)
8. [Total Investment Summary](#8-total-investment-summary)
9. [What We Need From You](#9-what-we-need-from-you)
10. [Terms & Conditions](#10-terms--conditions)

---

<a name="1-executive-summary"></a>
## 1. EXECUTIVE SUMMARY

You already have a comprehensive system that handles your wholesale distribution operation end-to-end — ordering, warehouse, delivery, invoicing, collections. Your team knows the workflow and it works. The problem isn't the process — it's that the technology underneath it is outdated, difficult to maintain, and nearly impossible to extend with new features or integrations.

**We're rebuilding the engine, not redesigning the car.**

The goal is to replace your current system with a modern platform that mirrors your existing workflow but runs on current technology — so it's faster, more reliable, accessible from any device, and ready to grow with you. When you want to add new features, integrate with other systems, or scale your operation, the platform is built for it from day one.

**Key points:**
- **Same workflow, modern foundation** — your team keeps working the way they already do. The screens and flows are designed around your existing process, not a generic template
- Runs on your own server — your data stays on your premises
- Works in any web browser — phones, tablets, desktops, no app store needed
- Built on a modern, maintainable codebase that's ready for future integrations and feature additions
- Smart features available when you're ready: voice ordering, AI-powered pick sheet reading, automatic invoice review
- Designed for speed — large buttons, minimal taps, works on cheap Android handhelds
- Full accounting built in — proper double-entry ledger, aging reports, statements, payment processing
- Every action logged — who did what, when, and why
- **Future-proof architecture** — adding new modules, connecting to external systems, or moving to the cloud later is straightforward, not a rebuild

---

<a name="2-what-this-system-does"></a>
## 2. WHAT THIS SYSTEM DOES — PLAIN ENGLISH

### The Big Picture

Your operation already follows this flow — and the new system keeps it exactly the same:

```
SALESPERSON          WAREHOUSE           DELIVERY            ACCOUNTING
places order    →    picks product   →   delivers to      →  invoices &
(phone/desktop)      off the shelf       customer's door      collects payment
```

The difference: everything now runs through one modern platform instead of your legacy system. The flow your team already knows stays the same — but it's faster, more reliable, works on any device, and every step is tracked automatically. When something changes upstream, everyone downstream sees it in real time instead of finding out later.

### Who Uses It and What They See

**Your salespeople** do what they already do — pick a customer, add products, review, and submit — but now through a clean, fast interface that works on their phone or desktop browser. They can browse the catalog, search, duplicate a past order, or even use voice input. They can also see their customer's balance, overdue invoices, credit status, and order history — everything they need to have an informed conversation with the customer.

**Your warehouse team** keeps their existing workflow. Orders show up organized by route and delivery area. A manager assigns orders to pickers. The picker can work digitally on a handheld or continue working on paper — if paper, the manager takes a photo of the completed pick sheet and the system reads the handwritten quantities automatically using AI. The manager reviews and approves, then the order is ready for the truck. No change to how the warehouse operates day-to-day.

**Your route planner** works the same way — sees all approved orders for the day, organizes them into routes (each route = one truck, one driver), and arranges the stop order. The system knows that the last stop needs to be loaded first on the truck.

**Your drivers** see their route with every stop listed in order — same as today, but now on a clean screen instead of a printout. They tap a stop, print the invoice on a small Bluetooth printer, and the delivery is automatically marked as confirmed. If there's a problem, they tap "Rejected" and select a reason. Managers see all of this in real time on a live tracking map.

**Your accounting team** gets a full dashboard that replaces whatever they're currently working with — invoices, payments, customer balances, aging reports, statements. Invoices are generated automatically from delivered orders. Payments can be processed through Authorize.NET (credit card, ACH). Statements can be sent automatically on a schedule or manually at any time via email, SMS, or WhatsApp.

**The owner/manager** gets the visibility upgrade — a dashboard with live driver tracking, revenue numbers, sales performance by salesperson, collection rates, outstanding receivables, and customizable reports. The kind of reporting that's hard or impossible to get out of the old system.

---

<a name="3-how-your-team-will-use-it"></a>
## 3. HOW YOUR TEAM WILL USE IT — STEP BY STEP

### 3.1 The Life of an Order — Complete Flow

Below is the complete journey of a single order from start to finish. This mirrors your existing process — the screens and steps are new, but the workflow is what your team already does.

---

#### SCENE 1: Salesperson Places the Order

**Where:** On the road (mobile phone) or at the office (desktop)

The salesperson opens the app in their phone's browser. They're immediately on their dashboard — a clean screen showing their customers, today's orders, and any alerts (like "Customer X is overdue on payment").

**Step 1 — Pick the customer**
They tap the search bar and type the first few letters of the customer name. The system finds it instantly. They could also scroll their "recent customers" list or tap a favorited customer. If the customer has multiple store locations, they pick which location this delivery is for.

**Step 2 — Build the order**
Now they're on the order screen. They have four ways to add products:

- **Browse:** Tap through categories — Beverages → Sparkling Water → Crystal Springs → Black Cherry → 12oz case. Add quantity. Next item.
- **Search:** Type "black cherry" in the search bar — system shows all matching products across all categories. Tap to add.
- **Voice:** Tap the microphone button and say naturally: *"Three cases black cherry, eight cases lemon lime, two cases orange."* The system uses AI to match what you said to actual products in the catalog. It plays back each match so you can confirm or correct.
- **Duplicate a past order:** Pull up this customer's last order, it loads every item and quantity. Adjust as needed.

As they add items, a running total builds at the bottom — item count, subtotal, deposits, total.

**Step 3 — Review**
They tap "Review Order." The screen shows exactly what the invoice will look like — every line item with product name, quantity, unit price, any discount applied, deposit amount, and line total. Grand total at the bottom. Delivery date (defaults to the customer's usual day, but they can change it). A notes field for special instructions ("leave at back dock, call when arriving").

At this stage, everything is still editable. They can add items, remove items, change quantities, apply a discount (within their allowed limits — the system enforces the cap automatically).

**Step 4 — Submit**
They tap "Submit Order." The order enters the system with a unique order number (e.g., ORD-2026-00142).

🔸 *If this customer is on credit terms (Tier 1):* The order goes straight to the warehouse queue.
🔸 *If this customer is pay-first (Tier 2):* The order is held. A payment link is sent to the customer. Only after payment clears does the order release to the warehouse.

The salesperson gets a confirmation screen. Done. Total time: 2-5 minutes for a typical order.

---

#### SCENE 2: Warehouse Picks the Order

**Where:** Warehouse, on Android handhelds or paper

It's the morning of the delivery day. The warehouse manager opens the Order Queue — a screen showing all orders grouped by route and delivery area.

**Step 1 — Assign to pickers**
The manager assigns each order to a picker. The picker sees the assignment appear on their handheld device (or the manager prints a pick list).

**Step 2 — Pick the order**

*Digital path:* The picker opens the order on their handheld. They see each line item — 6-digit product code, product name, requested quantity. They walk the warehouse, grab the product, and enter how many they actually picked. If a product is short, they enter the lower quantity (if partial picks are allowed by policy).

*Paper + AI path (your current workflow):* The picker works off a printed sheet with a pen. They write the picked quantities by hand. When done, they bring the clipboard back. The manager takes a photo of the completed sheet with their phone. The system's AI reads the handwritten numbers and maps them to each line item using the 6-digit product codes. The manager sees the AI's reading on screen, confirms it's correct (or fixes any misread numbers), and approves.

**Step 3 — Manager approval**
The manager reviews every picked order before it moves forward. They can override quantities, flag issues, or send it back to the picker. Once approved, the order is ready for routing.

---

#### SCENE 3: Route Planning & Truck Loading

**Where:** Office or warehouse, desktop or tablet

The route planner sees all approved orders for today. They drag orders into route groups — each route is one truck with one driver. Within each route, they arrange the stops in the order the driver should visit them (they know the streets and traffic patterns).

The system shows the total cases per route and the number of stops. The planner assigns a driver and a truck to each route.

**Key detail:** The truck is loaded in *reverse* stop order — the last delivery goes in first, the first delivery goes in last (so the driver can unload in order without digging through the truck).

Once the route is finalized, it's locked and the loading order is sent to the warehouse team.

---

#### SCENE 4: Driver Makes Deliveries

**Where:** On the road, Android handheld in the truck

The driver opens the app and sees their route — a list of stops in order. A progress bar shows "0 of 8 stops completed."

**At each stop:**

1. The driver taps the stop to see the order details — customer name, address, what's being delivered.
2. They tap "Navigate" — Google Maps or Waze opens with the address loaded.
3. They arrive at the location and tap "Print Invoice" — the invoice prints on the small Bluetooth printer in the truck.
4. **Delivery automatically confirmed.** When the invoice prints (or is sent electronically), the system marks it as delivered. No extra tap needed.
5. If there's a problem — customer refuses delivery, nobody's there, wrong address — the driver taps "Rejected," picks a reason from a dropdown, and optionally adds a note. The rejection is instantly visible to accounting and the salesperson.

🔸 *Location check:* If the driver prints an invoice but their GPS shows they're not near the delivery address, the system shows a warning: "You don't appear to be at this location. Print anyway?" It's not a hard block — they can proceed — but it's logged.

**End of route:** The driver sees a summary — X stops delivered, Y rejected, total cases delivered. They confirm the route is complete.

---

#### SCENE 5: Accounting Gets Paid

**Where:** Office, desktop

**Invoices are generated automatically** from delivered orders. The quantities actually delivered (what the picker confirmed, not what was originally ordered) become the billed amounts.

The accountant's dashboard shows:
- Invoices pending review
- Unapplied payments to reconcile
- Overdue accounts
- Credit limit reviews due

**Invoice review & finalization:**
At the end of the week (or on whatever schedule you choose), accounting reviews the week's invoices before they are "posted" — meaning officially locked into the books. The system's AI flags potential issues: pricing that looks wrong, quantities that are unusual for this customer, missing deposit charges, possible duplicates. The accountant reviews the flags, corrects anything needed, and posts the invoices.

**Collecting payments:**
- For credit customers: invoices are sent automatically. Payments come in via Authorize.NET (customer pays through a link, or accounting charges the card on file).
- For pay-first customers: payment was already collected before delivery.
- Any payment can be applied to specific invoices. If a payment doesn't match an exact invoice, the remainder sits in "unapplied payments" until the accountant matches it.

**Statements:** Sent automatically on a schedule (monthly, weekly, custom per customer) via email, SMS, or WhatsApp. Can also be sent manually at any time.

**Notifications:** The system sends automated reminders — "Your invoice is due in 3 days," "Payment received, thank you," "Your statement is ready." Channels, timing, and wording are all configurable.

---

### 3.2 Other Key Flows

#### Customer Credit Tiers
The system supports multiple customer tiers — you define as many as you need:
- **Credit customers** order first, pay later per their terms (net-15, net-30, etc.). Credit limits are set per customer. The system warns or blocks the salesperson when a customer approaches or exceeds their limit.
- **Pay-first customers** must pay before their order enters the warehouse. The system sends a payment link automatically and holds the order until payment clears.
- You can create additional tiers with custom rules at any time.

#### Discounts & Pricing Control
Salespeople can apply discounts in the field — but only within limits you set. If a salesperson's cap is 10% and they try to give 15%, the system blocks it. You define these caps per person, per group, or per role. Every discount is logged with who applied it and why.

#### Multi-Location Customers
One company (account) can have many delivery locations (store branches). Billing and credit roll up to the parent account. Each location has its own address, contact, and delivery schedule.

#### Admin Control Panel
A separate, powerful back-end area (not visible to field workers) where managers configure everything: user accounts, role permissions, discount policies, credit tiers, product catalog, notification rules, invoice lock periods, and more. Think of it as the control room behind the clean storefront.

---

<a name="4-whats-under-the-hood"></a>
## 4. WHAT'S UNDER THE HOOD

This section explains the technology choices — what the system is built with, where it runs, and how it's protected. It's written for decision-makers, not developers. The goal of every choice below is the same: build on proven, modern technology so the system is easy to maintain, easy to extend, and ready for whatever integrations or features you want to add down the road.

### 4.1 Where It Runs

The system runs **on your own server** in your office. Your data never leaves your building. All users — whether they're on a desktop in accounting or a phone in a customer's store — connect to that server over your local network.

The server runs Windows (which your team already knows) with two main components:
- **The application** — built on Microsoft's .NET platform (the same technology behind most enterprise Windows software). This is the engine that handles all the business logic, screens, and calculations.
- **The database** — PostgreSQL, a powerful free database system used by companies from startups to Fortune 500s. It stores all your customers, orders, invoices, products, and history. It includes geographic capabilities (for driver tracking and distance calculations) at no extra licensing cost.

**Why these choices matter to you:**
- .NET on Windows = no new infrastructure to learn. It runs natively on the servers you already have.
- PostgreSQL = zero licensing fees, forever. No "per user" or "per year" database costs. Full-featured.
- The app is a website, so it works in any browser — Chrome, Edge, Safari, Firefox. No app store, no installations, no updates to push to every device.
- **Future-readiness:** This stack is designed from the ground up so that adding new features, connecting to external systems (inventory, manufacturing, accounting exports), or eventually moving to the cloud is a natural extension — not a painful rewrite. That's the whole point of modernizing now.

### 4.2 How It Feels to Use

The system is designed as a **web application** — it looks and feels like a modern website, not clunky desktop software.

- **On desktop:** Full-screen browser experience with dashboards, tables, charts, and detailed forms
- **On mobile:** The same app, automatically reformatted for small screens with large buttons, swipe gestures, and minimal typing
- **Speed:** Pages load fast because the server does the heavy lifting and sends ready-made pages to the browser — the phone or handheld device doesn't need to be powerful

For the few screens that need richer interaction (the order builder with live search, the route planner with drag-and-drop, the live driver map), small targeted JavaScript modules handle those specific features without slowing everything else down.

### 4.3 Smart Features (AI-Powered)

Three areas use cloud-based AI (the app sends data to an AI service and gets results back):

1. **Voice ordering** — The salesperson speaks naturally, and the AI matches what they said to your actual product catalog. Not just dictation — it understands "three cases of the black cherry sparkling" and maps it to the correct product, flavor, and size.

2. **Pick sheet reading** — The warehouse worker fills out a paper pick sheet by hand. The manager photographs it. The AI reads the handwritten quantities and maps them to line items using the 6-digit product codes. The manager confirms and moves on.

3. **Invoice review** — Before invoices are posted, the AI scans for anomalies: pricing errors, unusual quantities for this customer, missing deposits, possible duplicates. Flags them for the accountant to review.

These AI calls go over the internet to a cloud service (OpenAI). Only the specific data needed is sent (audio clip, photo, invoice data) — not your entire database. All other system operations stay on your local network.

### 4.4 Security — How Your Data Is Protected

**Network:**
- The app and database sit on your private network — not on the public internet
- Desktop users connect directly over your office LAN
- Mobile/field devices connect through your firewall — only the app's specific port is open
- Standard firewall and antivirus on the server

**User access:**
- Every user has an account with a role (salesperson, driver, warehouse, accounting, admin)
- Permissions are granular — you control exactly what each person can see and do
- Salespeople only see their own customers. Drivers only see their own route. Accounting sees financial data. Managers see everything.
- Failed login attempts lock the account temporarily

**Mobile devices:**
- Company-owned handhelds are registered in the system — unregistered devices can't connect
- After initial setup, workers use a simple PIN or fingerprint to unlock (not full password every time)
- Admin can revoke a device instantly if it's lost or someone leaves
- No sensitive data stored in plain text on the device

**Financial data:**
- Credit card numbers never touch your system — they go directly to Authorize.NET's secure vault. Your app only sees a token like "Visa ending 4242"
- Every financial action (invoice, payment, credit, adjustment) creates an automatic audit trail
- The audit log is tamper-proof — even admins can't delete entries

**All encrypted:** All traffic between browsers and the server is encrypted (HTTPS), even on your local network.

### 4.5 Accounting Under the Hood

The system looks simple to the user, but underneath it follows **proper double-entry accounting** — the standard used by every serious financial system in the world.

What this means: every time someone creates an invoice, receives a payment, applies a discount, or issues a credit, the system automatically creates the correct accounting entries (debits and credits) in a real ledger. The accountant doesn't need to make these entries — the system generates them from normal business actions.

This gives you:
- Accounts receivable aging (who owes what, how overdue)
- Revenue reports by product, customer, salesperson, and time period
- Tax reports for government filing
- Trial balance for accountant verification
- Full transaction journal — every dollar traced from source to destination

### 4.6 Notifications System

The system has a built-in notification engine that sends messages automatically:
- **Channels:** Email, SMS (via Twilio), and WhatsApp
- **Triggers:** Invoice sent, payment due, payment received, delivery confirmed, credit limit approaching, statement ready — or custom triggers you define
- **Timing:** Configurable — e.g., reminder 3 days before due, again on due date, again 7 days after
- **Logging:** Every notification is logged — who received what, when, via which channel, and whether they replied

---

<a name="5-project-timeline"></a>
## 5. PROJECT TIMELINE — 4-WEEK RAPID BUILD

### Development Approach

We use a **design-first, build-fast** method with **parallel development agents** — multiple specialized development streams running simultaneously. Instead of one developer building everything sequentially, we spin up focused work streams that each handle a module of the system at the same time.

**Week 1** is purely design and foundation. **Weeks 2-3** are full parallel construction. **Week 4** is integration, testing, and delivery.

---

### WEEK 1 — FOUNDATION & DESIGN (Days 1-7)

| Day | Task | Deliverable |
|-----|------|-------------|
| 1-2 | Final stakeholder Q&A session — resolve all open questions | Completed requirements document |
| 2-3 | Database schema finalized — all tables, relationships, constraints | Database blueprint |
| 3-4 | UI wireframes for all screens — salesperson, warehouse, driver, accounting, admin | Clickable wireframes for review |
| 4-5 | API design — every endpoint documented | API specification |
| 5-6 | Server setup — Windows Server, PostgreSQL installed, project scaffolded, CI pipeline | Working dev environment |
| 6-7 | Seed data — test products, customers, users loaded | Ready for development |

**Milestone: Design Review** — End of Week 1, you see wireframes of every screen and approve before we build.

---

### WEEK 2 — PARALLEL BUILD, PHASE 1 (Days 8-14)

Multiple development streams launch simultaneously:

| Stream | What's Being Built | Depends On |
|--------|--------------------|------------|
| **Stream A** | Core data layer — Customer, Product, Order, Invoice entities + database migrations | Foundation (Week 1) |
| **Stream B** | Authentication — login, roles, permissions, device registration, session management | Foundation |
| **Stream C** | Product catalog — admin management screens, category/product/variant CRUD, pricing, visibility rules | Stream A (starts day 9) |
| **Stream D** | Salesperson screens — dashboard, customer list, customer profile, order wizard (browse + search + duplicate) | Stream A + C (starts day 10) |
| **Stream E** | Notification engine — trigger system, email/SMS/WhatsApp integration, templates, scheduling | Stream A (starts day 9) |

**Milestone: Core Demo** — End of Week 2, you can log in, browse products, and place an order through the system.

---

### WEEK 3 — PARALLEL BUILD, PHASE 2 (Days 15-21)

All remaining modules built simultaneously:

| Stream | What's Being Built | Depends On |
|--------|--------------------|------------|
| **Stream F** | Warehouse flow — order queue, pick assignment, digital pick, AI pick sheet (photo OCR), manager approval | Orders (Stream D) |
| **Stream G** | Route planning & driver flow — route builder, stop ordering, driver route screen, delivery confirmation, GPS integration, Bluetooth printing | Orders (Stream D) |
| **Stream H** | Invoicing & accounting — invoice generation from deliveries, payment processing (Authorize.NET), ledger entries, aging reports, statements | Orders + Delivery |
| **Stream I** | Admin panel — user management, policy configuration (discount caps, invoice locks, credit tiers), system settings | All core entities |
| **Stream J** | Manager dashboard — live route tracking (SignalR), KPI tiles, sales reports, custom report builder | All modules |

**Milestone: Full System Demo** — End of Week 3, every module is functional. You can walk through the complete flow: order → pick → route → deliver → invoice → pay.

---

### WEEK 4 — INTEGRATION, TESTING & DELIVERY (Days 22-28)

| Day | Task |
|-----|------|
| 22-23 | Integration testing — all modules talking to each other, end-to-end flow testing |
| 23-24 | Bug fixing — issues found during integration |
| 24-25 | Performance testing — load testing with realistic data volumes |
| 25-26 | User acceptance testing (UAT) — your team tests the system hands-on, provides feedback |
| 26-27 | Final fixes and polish from UAT feedback |
| 28 | **Deployment to your production server + handover** |

**Milestone: Go-Live** — End of Week 4, system is live on your server and your team starts using it.

---

### Post-Launch Support (Included)

- **2 weeks of bug-fix support** after go-live at no extra cost
- Priority response for critical issues (system down, data problems)
- Non-critical bugs addressed within 48 hours

---

<a name="6-base-package-pricing"></a>
## 6. BASE PACKAGE — PRICING

### What's Included in the Base Package

| Module | Included |
|--------|----------|
| Salesperson App (mobile + desktop) | ✅ |
| Product catalog management | ✅ |
| Order placement (browse, search, duplicate, voice) | ✅ |
| Customer management (profiles, tiers, multi-location) | ✅ |
| Warehouse flow (digital pick + AI paper pick sheet) | ✅ |
| Route planning & stop ordering | ✅ |
| Driver app (route, navigation, delivery confirmation) | ✅ |
| Bluetooth invoice printing | ✅ |
| Full invoicing & accounting (double-entry ledger) | ✅ |
| Payment processing (Authorize.NET) | ✅ |
| Statements (auto-send + manual) | ✅ |
| Notification engine (email, SMS, WhatsApp) | ✅ |
| Admin control panel (users, roles, permissions, policies) | ✅ |
| Manager dashboard & reports | ✅ |
| Live driver tracking (real-time map) | ✅ |
| Discount & adjustment policy engine | ✅ |
| Full audit trail | ✅ |
| Security (device registration, IP allowlist, encryption) | ✅ |
| On-premises deployment + server setup | ✅ |
| 2 weeks post-launch bug support | ✅ |

### Base Price

| | |
|---|---|
| **Total Base Package** | **$10,000** |
| Payment schedule | 40% upfront ($4,000) + 30% at Week 2 milestone ($3,000) + 30% at delivery ($3,000) |
| Development period | 4 weeks |
| Post-launch support | 2 weeks included |

---

<a name="7-optional-add-ons"></a>
## 7. OPTIONAL ADD-ONS — WITH TIMELINE & COST IMPACT

Each add-on below can be included now or added later. Adding them during the initial build is cheaper and faster than retrofitting later.

---

### OPT-1: Offline Mode
**What it does:** Salespeople and drivers can use the app without an internet or network connection. Orders placed offline are saved on the device and sync automatically when the connection returns. Product catalog and customer data are cached locally.

**Who needs it:** If your salespeople visit areas with poor connectivity (basements, rural areas, dead zones), or if your server goes down and you need operations to continue.

**Timeline impact:** Adds **5-7 days** to the build (overlaps with Week 3-4, extends delivery to ~5 weeks)

**Why it adds time:** Offline mode requires a separate local data layer on every device, a sync engine that resolves conflicts when the device reconnects, and encrypted local storage. This is a meaningful engineering addition.

| | |
|---|---|
| **Price** | **+$2,500** |
| **New delivery date** | ~5 weeks instead of 4 |

---

### OPT-2: Customer Self-Service Portal
**What it does:** Your customers log into their own portal where they can view their account balance, see invoices, download statements, make payments, and view order history. Optionally, they can place orders themselves (you can enable/disable this per customer).

**Who needs it:** Reduces phone calls to your office. Customers who want to self-serve can check their balance and pay without calling.

**Timeline impact:** Adds **4-5 days** (can run in parallel during Weeks 3-4, extends delivery by 3-5 days)

| | |
|---|---|
| **Price** | **+$2,000** |
| **New delivery date** | +3-5 days |

---

### OPT-3: Customer-Facing Ordering Website
**What it does:** A branded website where smaller customers can place orders directly — browse your catalog, build an order, submit. Orders feed into the same system as salesperson-placed orders. Can be restricted to approved customers only (login required).

**Who needs it:** If you have smaller customers who don't warrant a dedicated salesperson visit but still want to order from you.

**Timeline impact:** Adds **5-6 days** (mostly parallel, extends delivery by 4-5 days). Depends on Customer Portal (OPT-2) being built first.

| | |
|---|---|
| **Price** | **+$2,000** |
| **Requires** | OPT-2 (Customer Portal) |
| **New delivery date** | +4-5 days (on top of OPT-2) |

---

### OPT-4: Full Private Network Lockdown (VPN + Zero Public Exposure)
**What it does:** The app becomes completely invisible to the public internet. All mobile devices connect through a VPN tunnel. Internal DNS only — no public domain name. Maximum network isolation.

**Who needs it:** If you want enterprise-grade security where even knowing the app exists from outside is impossible.

**What you already get without it:** The base package already includes device registration, IP allowlisting, encrypted connections, and role-based permissions — which is sufficient security for most wholesale operations.

**Timeline impact:** Adds **2-3 days** (VPN server setup, certificate management, device VPN configuration)

| | |
|---|---|
| **Price** | **+$1,500** |
| **New delivery date** | +2-3 days |
| **Ongoing cost** | Your IT manages the VPN server (we set it up) |

---

### OPT-5: SSO + Multi-Factor Authentication (MFA)
**What it does:** Users sign in with their existing company accounts (Microsoft 365 / Azure AD / Google Workspace). Multi-factor authentication adds a second verification step (authenticator app code or SMS code) on top of the password.

**Who needs it:** If your team works remotely and needs secure access from outside the office network without VPN, or if you want centralized user management through your existing identity provider.

**Timeline impact:** Adds **2-3 days**

| | |
|---|---|
| **Price** | **+$1,200** |
| **New delivery date** | +2-3 days |
| **Requires** | Active Microsoft 365 or Google Workspace subscription |

---

### OPT-6: Data Migration (From Existing System)
**What it does:** We import your existing customer database, product catalog, and optionally historical invoices/transactions from your current system (QuickBooks, spreadsheets, or other) into the new platform. Includes data cleaning, format conversion, and verification.

**Who needs it:** If you don't want to manually re-enter all your customers, products, and pricing. Strongly recommended.

**Timeline impact:** Adds **2-4 days** depending on data volume and quality (can overlap with Week 1-2)

| | |
|---|---|
| **Price** | **+$800 – $1,500** (depends on data complexity) |
| **New delivery date** | Minimal — runs in parallel with build |

---

### OPT-7: Truck-Specific Navigation Integration
**What it does:** Instead of opening Google Maps/Waze for directions (which don't account for truck restrictions), the system integrates with a truck-specific navigation service (Sygic Truck or CoPilot) that accounts for low bridges, weight limits, no-truck zones, and truck-legal roads.

**Who needs it:** If your trucks deliver in dense urban areas (NYC boroughs, restricted streets) where standard GPS routing could send a truck down a street it shouldn't be on.

**Timeline impact:** Adds **1-2 days**

| | |
|---|---|
| **Price** | **+$600** |
| **Ongoing cost** | Sygic Truck license: ~$100-150/year per device |
| **New delivery date** | +1-2 days |

---

### OPT-8: Extended Post-Launch Support & Maintenance
**What it does:** Extends the included 2-week post-launch support to 3 months. Includes priority bug fixing, minor feature adjustments based on real-world usage feedback, performance monitoring, and one database health check.

**Timeline impact:** None — this happens after delivery.

| | |
|---|---|
| **Price** | **+$2,000** (3 months total) |
| **Covers** | Bug fixes, minor adjustments, monitoring, 1 DB health check |

---

### OPT-9: Multi-Company / Multi-Tenant Support
**What it does:** Run separate companies or business divisions within the same system — each with their own customers, products, invoicing, and accounting, but managed from one login. Useful if you have multiple business entities or want to offer the software to other wholesale distributors.

**Who needs it:** If you operate under multiple company names or plan to expand.

**Timeline impact:** Adds **3-4 days** (architectural change — better to include from the start)

| | |
|---|---|
| **Price** | **+$1,800** |
| **New delivery date** | +3-4 days |
| **Note** | Significantly cheaper to build in from the start than to add later |

---

<a name="8-total-investment-summary"></a>
## 8. TOTAL INVESTMENT SUMMARY

### Base Package

| Item | Price | Timeline |
|------|-------|----------|
| **Complete Wholesale ERP System** | **$10,000** | **4 weeks** |

### Optional Add-Ons

| # | Add-On | Price | Timeline Impact |
|---|--------|-------|-----------------|
| OPT-1 | Offline Mode | +$2,500 | +5-7 days |
| OPT-2 | Customer Portal | +$2,000 | +3-5 days |
| OPT-3 | Customer Ordering Website | +$2,000 | +4-5 days (requires OPT-2) |
| OPT-4 | Full VPN Lockdown | +$1,500 | +2-3 days |
| OPT-5 | SSO + MFA | +$1,200 | +2-3 days |
| OPT-6 | Data Migration | +$800–$1,500 | Minimal (parallel) |
| OPT-7 | Truck Navigation | +$600 | +1-2 days |
| OPT-8 | Extended Support (3 mo) | +$2,000 | None (post-launch) |
| OPT-9 | Multi-Company / Multi-Tenant | +$1,800 | +3-4 days |

### Example Packages

**Essentials (Base + recommended add-ons):**

| Item | Price |
|------|-------|
| Base Package | $10,000 |
| Data Migration (OPT-6) | +$1,000 |
| Extended Support (OPT-8) | +$2,000 |
| **Total** | **$13,000** |
| Timeline | ~4.5 weeks |

**Full Build (everything):**

| Item | Price |
|------|-------|
| Base Package | $10,000 |
| All optional add-ons | +$14,400 |
| **Total** | **$24,400** |
| Timeline | ~6-7 weeks |

---

<a name="9-what-we-need-from-you"></a>
## 9. WHAT WE NEED FROM YOU

Before development begins, we need the following:

### Before Week 1

| Item | Why |
|------|-----|
| Answers to the 22 open stakeholder questions (see separate document) | Finalizes requirements — some design decisions are blocked until these are answered |
| Access to your Windows Server (or specs so we can advise on setup) | We need to know what we're deploying to |
| A sample of your current product catalog (spreadsheet or export) | To design the data import and catalog structure |
| A sample of your current customer list | Same — data migration planning |
| Bluetooth printer model(s) in use or planned | Determines printing approach |
| Authorize.NET account credentials (sandbox for testing) | Payment integration |
| Twilio account (or we create one — SMS/WhatsApp costs are yours) | Notification integration |

### During Development

| Item | When |
|------|------|
| Wireframe review and sign-off | End of Week 1 |
| Core demo review | End of Week 2 |
| Full system demo + UAT | Week 4 |
| 2-3 team members available for testing | Week 4 |

---

<a name="10-terms--conditions"></a>
## 10. TERMS & CONDITIONS

### Payment Terms
- **40% due on contract signing** ($4,000) — triggers project start
- **30% due at Week 2 milestone** ($3,000) — core demo delivered and approved
- **30% due on final delivery** ($3,000) — system deployed to your server

For optional add-ons: payment is split proportionally across the same milestones.

### Scope & Change Requests
- This proposal covers all features listed in the Base Package (Section 6) and any selected optional add-ons
- Changes to requirements after development begins may affect timeline and cost
- Minor adjustments (cosmetic, layout tweaks, wording changes) are included at no extra cost
- Major scope additions (new modules, new user roles, new integrations not listed here) will be quoted separately before work begins
- All changes documented and agreed in writing

### Intellectual Property
- Upon final payment, you own the complete source code, database, and all project assets
- You may modify, extend, or host the system however you choose
- We retain the right to use general techniques and non-proprietary patterns in future work (no proprietary business logic)

### Warranty & Support
- 2 weeks of bug-fix support included after go-live (extendable via OPT-8)
- Bugs are defined as: system not working as described in this proposal
- Feature requests beyond the agreed scope are not bugs
- Critical bugs (system down, data loss) addressed within 4 hours during business hours
- Non-critical bugs addressed within 48 hours

### Confidentiality
- All business information, customer data, and trade secrets shared during the project are treated as confidential
- No data will be shared with third parties except as required by the agreed integrations (Authorize.NET, Twilio, OpenAI API)
- Data sent to AI services (voice clips, pick sheet photos, invoice data for review) is processed and not stored by the AI provider

### Cancellation
- If you cancel before development begins (Week 1): full refund minus $500 administrative fee
- If you cancel during development: payment for completed milestones is non-refundable; work completed to date is delivered to you
- We may pause the project if a milestone payment is more than 7 days overdue

---

## NEXT STEP

**To proceed:** Review this proposal, select any optional add-ons you want, and we'll schedule the stakeholder Q&A session to answer the 22 open questions. Once questions are answered and the first payment is received, development begins immediately.

> **Note:** Some details in this proposal will be updated after the stakeholder Q&A session — specific workflow rules, data migration scope, and configuration details will be finalized based on your answers.

---

*This proposal is valid for 30 days from the date above.*

*Prepared by: [Your Company Name]*
*Contact: [Your Email / Phone]*
