# WHOLESALE ERP — CODE ARCHITECTURE
### Living Document — What Exists, How It Connects, What Changed
**Created: March 11, 2026 | Status: ACTIVE**

---

## 🚨 AI AGENT: READ THIS BEFORE MODIFYING ANY CODE

> **This is your context.** It tells you what exists, how things connect, and what was already
> changed (and why). Read the CHANGELOG section before touching any file. Update this document
> after every modification.

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [What Exists — Class & File Registry](#2-class-registry)
3. [How It Connects — Service Map](#3-service-map)
4. [Data Models](#4-data-models)
5. [Endpoints](#5-endpoints)
6. [Events & Side Effects](#6-events)
7. [Third-Party Integrations](#7-integrations)
8. [CHANGELOG — Read This First](#8-changelog)

---

<a name="1-system-overview"></a>
## 1. SYSTEM OVERVIEW

### Architecture
```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT DEVICES                            │
│  Desktop Browser (Office) │ Android Handheld (Field) │ Tablet    │
└──────────────────┬───────────────────┬──────────────────┬────────┘
                   │     HTTPS          │                  │
┌──────────────────▼───────────────────▼──────────────────▼────────┐
│                     WEB SERVER (ASP.NET Core)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐    │
│  │ Controllers  │→│  Application  │→│  Core (Entities,      │    │
│  │ + Razor Views│  │  Services     │  │  Interfaces, Events) │    │
│  └─────────────┘  └──────┬───────┘  └──────────────────────┘    │
│                          │                                       │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │                  INFRASTRUCTURE                           │   │
│  │  Repositories │ DB Context │ Authorize.NET │ SMTP │ Maps  │   │
│  └───────────────────────┬──────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                   POSTGRESQL DATABASE                             │
│                  (On-Premises / Hybrid)                           │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack
| Layer | Technology | Why Chosen |
|-------|-----------|------------|
| Backend | ASP.NET Core (.NET 8+) | Enterprise-grade, cross-platform, strong OOP support, native DI |
| Frontend Rendering | Razor Pages (server-rendered) | Fast initial load, SEO irrelevant (internal app), less JS overhead |
| Frontend Interactivity | HTMX + Alpine.js | Partial updates without SPA complexity, tiny footprint (~15-30KB) |
| Real-time | SignalR | WebSocket-based, built into ASP.NET, for live driver tracking and status updates |
| Database | PostgreSQL | Free (no licensing), powerful, geographic capabilities (PostGIS for driver tracking) |
| Payment Gateway | Authorize.NET SDK | Stakeholder's existing provider, PCI-compliant tokenization |
| Email | SMTP (configurable provider) | Base notification channel |
| Maps | Google Maps JS API | Driver tracking display + deep-link to nav apps |

### Data Flow Summary
```
SALESPERSON                WAREHOUSE               DRIVER                ACCOUNTING
    │                          │                      │                      │
    │ 1. Creates Order         │                      │                      │
    │ ──────────────────────►  │                      │                      │
    │                          │ 2. Picks Order       │                      │
    │                          │ ──────────────────►   │                      │
    │                          │                      │ 3. Confirms Delivery  │
    │                          │                      │ ──────────────────►   │
    │                          │                      │    (Auto-generates    │
    │                          │                      │     Invoice)          │
    │                          │                      │                      │ 4. Reviews/Locks
    │  ◄─── Notification ─────                       │                      │    Invoice
```

---

<a name="2-class-registry"></a>
## 2. WHAT EXISTS — CLASS & FILE REGISTRY

> Add every class here as it's built. Status: `[PLANNED]` → `[BUILT]` → `[REMOVED]`
> When modifying a class, check its entry here FIRST to understand what depends on it.

| Class | File | Category | Purpose | Depends On | Depended On By | Status |
|-------|------|----------|---------|-----------|----------------|--------|
| *Filled as code is written* | | | | | | |

---

<a name="3-service-map"></a>
## 3. HOW IT CONNECTS — SERVICE MAP

> Shows which service calls which. Update whenever a new dependency is added.

```
(Filled as services are wired together)
```

---

<a name="4-data-models"></a>
## 4. DATA MODELS

> Every entity, its fields, and how entities relate to each other.

### Entity Relationships
```
Customer ──── 1:N ──── CustomerLocation
    │ 1:N
    ▼
  Order ──── 1:N ──── OrderLineItem ──── N:1 ── Product
    │ 1:1 (on delivery)
    ▼
  Invoice ──── 1:N ──── InvoiceLineItem ── N:1 ── Product
    │ N:N (via PaymentApplication)
    ▼
  Payment ──── 1:N ──── PaymentApplication

  Route ──── 1:N ──── RouteStop ──── 1:1 ── Order
  Product ── N:1 ── ProductSubcategory ── N:1 ── ProductCategory
  Product ── 1:N ── PriceLevelPrice ── N:1 ── PriceLevel
  Customer ── N:1 ── CreditTier
  Customer ── N:1 ── PriceLevel
  User ── N:N ── Permission (via UserPermission)
  User ── N:1 ── Role
```

### Field Details
> *Added per entity as it's implemented. Format:*

```
### EntityName
| Field | Type | Purpose |
|-------|------|---------|
```

---

<a name="5-endpoints"></a>
## 5. ENDPOINTS

> Every route in the system. Added as each endpoint is built.

| Method | Route | Controller | Purpose | Status |
|--------|-------|-----------|---------|--------|
| *Filled as endpoints are built* | | | | |

---

<a name="6-events"></a>
## 6. EVENTS & SIDE EFFECTS

> What happens automatically when something occurs. This prevents agents from
> duplicating logic that's already handled by an event.

| Event | Triggered By | What Happens Automatically |
|-------|-------------|---------------------------|
| `OrderPlacedEvent` | OrderService.Create | Order appears in warehouse queue |
| `DeliveryConfirmedEvent` | DeliveryService.Confirm | Invoice auto-generated, accounting notified |
| `DeliveryEditedEvent` | DeliveryService.Confirm (with edits) | Salesperson notified, accounting flagged |
| `PaymentReceivedEvent` | PaymentService.Process | Customer balance updated, held orders released (pay-first) |
| *More added as events are implemented* | | |

---

<a name="7-integrations"></a>
## 7. THIRD-PARTY INTEGRATIONS

| Service | Purpose | Config Needed |
|---------|---------|---------------|
| Authorize.NET | Payments (card, ACH) | API Login ID, Transaction Key |
| SMTP | Email notifications | Host, port, credentials |
| Google Maps JS API | Driver tracking map | API Key |
| Google Maps / Waze | Driver nav (deep-link) | None |
| SignalR | Real-time updates | None (built-in) |

---

<a name="8-changelog"></a>
## 8. CHANGELOG — READ THIS FIRST

> **Newest first.** Before modifying ANY file, check if it appears in a changelog entry below.
> If it does, read that entry — you need to know what was changed and why.

### Format
```
#### #XXX — [YYYY-MM-DD] Short description
- **PROBLEM:** What was wrong or needed
- **FIX:** What was done
- **FILES:** What changed
- **REVERT RISK:** What breaks if this is undone
```

---

#### #005 — [2026-03-14] Reports — pre-build options + compact print styles

- **PROBLEM:** Age bucket chips and the "Balance Only / Invoice Breakdown" toggle were in the report phase (after Build). Salesperson had to generate the report before knowing what scope they were generating — confusing for collection calls. Print styles were too padded for production reports (50–200+ customers would waste pages).

- **FIX:**
  - Moved `bucketChips` and `viewToggle` from `_renderReport()` into `_renderSelectionPanel()`, above the Build button, inside two labeled `.preBuildSection` containers.
  - Build button disabled if no buckets selected (would produce empty report).
  - In `_renderReport()` the bucket chips are now read-only `<div>` (showing selected buckets + post-build dollar amounts) instead of interactive buttons — options were already set before build.
  - Completely rewrote `@media print` block: `font-size` reduced to 0.65–0.75rem for most text, all card padding collapsed (4px headers, 2px rows), `.reportRows` gap tightened, box shadows removed, `@page { margin: 10mm }` added for tight margins.
  - Added `.preBuildSection` and `.preBuildLabel` CSS classes.

- **FILES:** `Reports.jsx`, `Reports.module.css`

- **REVERT RISK:** LOW — changes isolated to selection panel layout and print CSS. Reverting moves bucket/toggle JSX back to report phase.

---

#### #004 — [2026-03-14] Reports complete redesign — single Balance Report

- **PROBLEM:** The three-tab Reports page (Aging / Open Invoices / Customer Balances) showed all data immediately on open. Salesperson needed a way to build a targeted collection report: pick specific customers, pick which aging buckets, and choose how much detail to show. Also: no contact info (phone, email, address) on exports — required for collection calls.

- **FIX:** Completely replaced the three-tab layout with a single **Balance Report** flow:
  1. **Selection phase (empty start):** Salesperson searches/filters customers by name or type, checks boxes, taps "Build Report". Nothing shown until build.
  2. **Report phase:** A/R summary card → aging bucket chips (Current / 1–30 / 31–60 / 61–90 / 90+ — tap to toggle) → "Balance Only" / "Invoice Breakdown" toggle → one card per customer (contact info always visible) → Export / Print / Send.
  3. **Export CSV:** Two formats depending on view mode. Both include: Customer Name, Contact Person, Phone, Email, Address, then bucket columns or invoice rows.
  4. **Print styles:** Controls hidden, cards break across pages cleanly.
  - Removed: REPORT_TABS, `_getFilteredInvoices()`, `_getAgingData()`, `_renderAging()`, `_renderOpenInvoices()`, `_renderBalances()`, old `_handleExport()` (tab-based).
  - Added: `BalanceReport` class (renamed from `Reports`), `_getFilteredCustomers()`, `_buildReport()`, `_getGrandTotals()`, `_renderSelectionPanel()`, `_renderReport()`, new `_handleExport()` (contact-info + two modes).

- **FILES:** `Reports.jsx` (full rewrite), `Reports.module.css` (full rewrite)

- **REVERT RISK:** HIGH — three-tab layout fully removed. Reverting requires restoring all three render methods, REPORT_TABS, old filters, and old CSS. Do not revert without restoring full prior content.

---

#### #002 — [2026-03-13] Shared OrderReceipt component — unified receipt/edit layout

- **PROBLEM:** Receipt layout was duplicated across NewOrder step 3 and OrderDetail. OrderDetail edit mode was bare-bones (qty ±1 only — no price editing, no discount %, no deposits, no totals). discountTotal calculation in handleSaveEdit was wrong: `(li.discount || 0) * li.quantity` treated discount as flat dollar amount instead of percentage.

- **FIX:** Extracted shared `OrderReceipt` class component used by both pages:
  - **OrderReceipt.jsx** (NEW): Handles editable mode (qty ±, price input with discount cap, discount % input with cap, per-line totals, deposit sub-lines, remove button) and read-only mode (6-col grid). Renders customer header block, line items, totals. Two injection slots: `children` (before totals, for order-level discount) and `afterTotals` (for delivery/notes/save buttons).
  - **OrderReceipt.module.css** (NEW): Consolidated receipt CSS — editable 7-col grid, read-only 6-col grid, customer block, totals section, deposit lines, discount warning states.
  - **NewOrder.jsx:** Replaced 5 inline edit handlers (`handleReviewQtyChange`, `handleReviewQtyInput`, `handleReviewPriceChange`, `handleReviewDiscountChange`, `_updateReviewItem`) with single `handleReceiptUpdateItem`. Replaced `_renderStep3` inline JSX with `<OrderReceipt editable>`.
  - **OrderDetail.jsx:** Replaced `handleEditQty`/`handleRemoveEditItem` with `handleEditUpdateItem`/`handleEditRemoveItem`. Fixed `discountTotal` formula: now `casePrice * quantity * (discount / 100)`. Added `displayItems`/`displayTotals` computed values for edit mode. Replaced inline receipt/edit JSX with `<OrderReceipt>`.
  - **Dead CSS removed** from NewOrder.module.css (~180 lines: old reviewItem card classes, old invoiceTable/totalSection) and OrderDetail.module.css (~100 lines: old invoiceTable, editRow, statusRow, customerLink).

- **FILES:** OrderReceipt.jsx (NEW), OrderReceipt.module.css (NEW), NewOrder.jsx, NewOrder.module.css, OrderDetail.jsx, OrderDetail.module.css

- **REVERT RISK:** MEDIUM — reverting requires restoring duplicated receipt JSX in both pages, restoring 5 edit handlers in NewOrder, restoring old editRow/invoiceTable in OrderDetail, and re-introducing the discountTotal calculation bug.

---

#### #003 — [2026-03-13] Submit & Pay for orders, mock CC/ACH payment processing

- **PROBLEM:** Prepaid customers had no way to pay for orders upfront. CC/ACH payments were just recorded — no processing flow. Full-credit customers needed forced credit-only option.

- **FIX:**
  - **PaymentModal:** Added mock payment processing — if customer has `savedPaymentMethods` for CC/ACH, shows processing spinner then success. If no saved method, shows "Send Payment Link" button. Added `orderMode`, `creditOnly`, `onToast` props. Processing states (spinner, checkmark).
  - **NewOrder:** Added "Submit & Pay" button for prepaid customers (required). Credit customers see both "Pay Now" (optional) and "Submit Order". Payment modal opens with order total, payment recorded against order.
  - **mockData:** Added `savedPaymentMethods` array to sample customers (Bella Cucina has CC, Grand Hotel has CC + ACH).

- **FILES:** PaymentModal.jsx, PaymentModal.module.css, NewOrder.jsx, NewOrder.module.css, mockData.js

- **REVERT RISK:** LOW — isolated to payment flow. Reverting removes Submit & Pay option but doesn't break other functionality.

---

#### #001 — [2026-03-13] Salesperson frontend feature build — Phase 1

- **PROBLEM:** Initial React SPA had basic page scaffolding but lacked real business logic — no discount caps, no payment credit mode, no editable orders, no status transitions, no filters, no email integration, no prepaid enforcement.

- **FIX:** Implemented ~20 features across 15+ files:
  - **Storage layer:** Added 9 new methods to StorageService/MockStorageService (reduceCustomerCredit, updateOrderStatus with auto-invoice on Delivered, getMostOrderedProducts, duplicateOrder, createInvoice, updateInvoice, getAlerts, getDiscountSettings, updateDiscountSettings). Removed "Shipped" status — orders go Draft→Submitted→Picking→Delivered.
  - **Settings:** 4-level discount caps UI (per-item fixed/$, per-item %, per-order fixed/$, per-order %).
  - **CartContext:** LOAD_CART, REORDER_ITEMS, APPLY_ORDER_DISCOUNT actions; orderDiscount state; updated totals calc.
  - **Dashboard:** Clickable alerts from getAlerts(), clickable activity with navigation.
  - **CustomerList:** Credit bar (green/orange/red), type badge, unapplied credit indicator.
  - **CustomerProfile:** 6 tabs (Overview, Orders, Invoices, Payments, Account, Notes). Overview redesigned with credit bar, balance cards, reduce credit limit. Invoices tab has email button per row. Payments tab (NEW). Account tab rewritten with details + Send Statement. SendMessageModal wired.
  - **OrderDetail:** Full rewrite — edit mode (Draft/Submitted only), status advance button (Move to Picking etc.), duplicate order via storage, print, email via SendMessageModal. Locks editing at Picking+.
  - **OrderHistory:** Removed Shipped filter.
  - **NewOrder:** "Most Ordered" 3rd catalog tab, tappable review items to edit via ProductModal, "Add More Items" button, order-wide discount field with cap enforcement, prepaid customer enforcement (blocks submit if balance > 0).
  - **ProductModal:** Per-item discount % field with cap from getDiscountSettings(), color-coded (green/orange/red).
  - **Payment:** "Just Collect Payment" mode — stores as account credit without invoice selection.
  - **PaymentModal:** "Account Credit" / "On Account" as 5th payment method (Wallet icon).
  - **Reports:** Date range + customer filters, Export CSV, Print, Send via SendMessageModal for all 3 tabs.

- **FILES:** StorageService.js, MockStorageService.js, mockData.js, CartContext.jsx, Dashboard.jsx, Dashboard.module.css, CustomerRow.jsx, CustomerRow.module.css, CustomerList.jsx, CustomerList.module.css, CustomerProfile.jsx, CustomerProfile.module.css, OrderDetail.jsx, OrderDetail.module.css, OrderHistory.jsx, StatusBadge.jsx, Settings.jsx, Settings.module.css, NewOrder.jsx, NewOrder.module.css, ProductModal.jsx, ProductModal.module.css, Payment.jsx, Payment.module.css, PaymentModal.jsx, PaymentModal.module.css, Reports.jsx, Reports.module.css, SendMessageModal.jsx, SendMessageModal.module.css

- **REVERT RISK:** HIGH — touches nearly every page and the storage layer. Reverting individual files will break imports and data flow. Revert entire commit or nothing.

---

**Last updated:** March 14, 2026 (changelog #005 added)
