# WHOLESALE ERP — SALESPERSON FRONTEND BUILD PLAN
### What to Build, How It Works, What the Rules Are
**Created: March 12, 2026 | Status: DRAFT — Awaiting Approval**

---

## 🚨 AI AGENT: READ THIS BEFORE WRITING ANY CODE

> **This document is the build spec.** It defines every page, component, data model, and behavior
> for the salesperson frontend. Do not invent features. Do not skip features. Build exactly what's here.
> If something is ambiguous, check the Living Doc or ask — don't guess.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-overview)
2. [Tech Stack & Architecture](#2-tech-stack)
3. [Authentication](#3-auth)
4. [Data Layer & Storage](#4-data-layer)
5. [Page-by-Page Spec](#5-pages)
6. [Invoice Format](#6-invoice-format)
7. [Business Rules](#7-business-rules)
8. [Shared Components](#8-components)
9. [Messaging System](#9-messaging)
10. [Offline & Sync](#10-offline)
11. [Build Order](#11-build-order)
12. [Open Items — User to Provide](#12-open-items)

---

<a name="1-overview"></a>
## 1. PROJECT OVERVIEW

### What are we building?
A **mobile-first React web app** for wholesale beverage distributors — **salesperson role only**.
This is the **real production frontend**, not a demo or prototype.

### What is it for?
Salespeople use this on their phones to:
- View and manage their customer accounts
- Create new orders
- Collect payments (single or multi-invoice)
- Send invoices / statements / balance info via email
- Track outstanding balances and collections
- Add new customers

### What it is NOT:
- Not a demo or throwaway prototype
- Not a server-rendered app — it's a client-side SPA
- Not desktop-first — **mobile-first, phone screens first**
- Not a full ERP yet — salesperson frontend only (warehouse, driver, accounting, admin = later)

### Who uses it?
Salespeople in the field, on Android phones primarily. Occasionally on desktop for phone orders.

---

<a name="2-tech-stack"></a>
## 2. TECH STACK & ARCHITECTURE

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18+ | Component-based SPA |
| Build tool | Vite | Fast dev server, optimized builds |
| Routing | React Router v6 | Client-side page routing |
| State management | React Context + useReducer | Global state (auth, cart, sync) |
| Auth | `@azure/msal-react` (MSAL.js) | Entra ID sign-in + Google |
| Local storage | localStorage (Phase 1) → IndexedDB (Phase 2) | Mock data, offline storage |
| Styling | CSS Modules | Scoped styles, no conflicts |
| Icons | Lucide React | Lightweight icon set |
| Future: Native wrapper | Capacitor | APK from same codebase |
| Future: Backend | ASP.NET Core (.NET 8+) | API, auth proxy, database |

### Architecture Diagram
```
┌─────────────────────────────────────────┐
│           REACT SPA (Vite)              │
│                                         │
│  ┌──────────┐  ┌────────────────────┐   │
│  │  Pages    │  │  Shared Components │   │
│  │  (routes) │  │  (reusable UI)     │   │
│  └────┬─────┘  └────────┬───────────┘   │
│       │                  │               │
│  ┌────▼──────────────────▼───────────┐   │
│  │         State (Context)           │   │
│  │  auth │ cart │ customers │ sync   │   │
│  └────────────────┬──────────────────┘   │
│                   │                      │
│  ┌────────────────▼──────────────────┐   │
│  │       StorageService (abstract)   │   │
│  │  Phase 1: localStorage (mock)     │   │
│  │  Phase 2: IndexedDB (offline)     │   │
│  │  Phase 3: API calls (real server) │   │
│  └───────────────────────────────────┘   │
│                                         │
│  ┌───────────────────────────────────┐   │
│  │       AuthService (MSAL.js)       │   │
│  │  Entra ID + Google sign-in        │   │
│  └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Folder Structure
```
WholesaleERP/
├── BUILD_PLAN.md          ← This document
├── DEVELOPMENT_RULES.md   ← Coding rules for AI agents
├── CODE_ARCHITECTURE.md   ← Living doc of what exists
├── src/
│   ├── main.jsx           ← App entry point
│   ├── App.jsx            ← Router + auth wrapper
│   ├── auth/
│   │   ├── AuthProvider.jsx      ← MSAL context provider
│   │   ├── authConfig.js         ← Entra app registration config
│   │   └── ProtectedRoute.jsx    ← Route guard (redirects to login)
│   ├── services/
│   │   ├── StorageService.js     ← Abstract storage interface
│   │   ├── MockStorageService.js ← localStorage implementation
│   │   └── EmailService.js       ← Send email (mock for now)
│   ├── context/
│   │   ├── AppContext.jsx         ← Global state provider
│   │   └── CartContext.jsx        ← Order builder state
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CustomerList.jsx
│   │   ├── CustomerProfile.jsx
│   │   ├── AddCustomer.jsx
│   │   ├── NewOrder.jsx
│   │   ├── OrderDetail.jsx
│   │   ├── OrderHistory.jsx
│   │   ├── Payment.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   ├── components/
│   │   ├── BottomNav.jsx          ← Mobile bottom navigation
│   │   ├── PageHeader.jsx         ← Top bar with title + actions
│   │   ├── KpiCard.jsx            ← Dashboard stat card
│   │   ├── CustomerRow.jsx        ← Customer list item
│   │   ├── ProductModal.jsx       ← Big product edit overlay
│   │   ├── CartSummary.jsx        ← Running order total bar
│   │   ├── InvoicePreview.jsx     ← Old-system invoice format
│   │   ├── PaymentModal.jsx       ← Collect payment overlay
│   │   ├── SendMessageModal.jsx   ← Email with attachment
│   │   ├── StatusBadge.jsx        ← Colored status pill
│   │   ├── SearchBar.jsx          ← Universal search input
│   │   ├── EmptyState.jsx         ← Empty list placeholder
│   │   ├── LoadingSpinner.jsx     ← Loading indicator
│   │   └── ErrorBoundary.jsx      ← Catch-all error handler (Rule #6)
│   ├── data/
│   │   └── mockData.js            ← Seed data (customers, products)
│   └── styles/
│       ├── global.css             ← Reset, variables, typography
│       └── (component).module.css ← Per-component styles
├── public/
│   └── index.html
├── package.json
└── vite.config.js
```

---

<a name="3-auth"></a>
## 3. AUTHENTICATION

### Platform: Microsoft Entra ID (workforce tenant)

| Setting | Value |
|---------|-------|
| Tenant type | Workforce (standard Entra ID) |
| App registration | Single app — manages both sign-in methods |
| Sign-in method 1 | Google (primary — added as external identity provider on same app reg) |
| Sign-in method 2 | Email via Microsoft (fallback for users without Google or who prefer not to use it — Entra users invited by admin) |
| User management | Admin invites users — no self-registration |
| SSO | MSAL.js caches tokens — stays signed in across sessions |
| Token type | Entra ID tokens (access + ID tokens) |
| Library | `@azure/msal-react` + `@azure/msal-browser` |

### Login Screen Behavior
```
┌─────────────────────────────┐
│                             │
│      [Company Logo]         │
│                             │
│  ┌───────────────────────┐  │
│  │  Sign in with Google  │  │  ← Primary option. Redirects to
│  └───────────────────────┘  │    Entra, which redirects to Google
│                             │
│  ┌───────────────────────┐  │
│  │ Log in with Email     │  │  ← Fallback for users without Google.
│  │   via Microsoft       │  │    Redirects to Entra email login.
│  └───────────────────────┘  │    Works for any invited user.
│                             │
│  Only authorized users can  │
│  sign in. Contact your      │
│  admin for access.          │
│                             │
└─────────────────────────────┘
```

### Phase 1 (current build): Mock Auth
- Login screen looks exactly as above
- Buttons call mock auth — sets user data in localStorage
- Simulates signed-in state for testing all pages
- When real Entra config is added, swap mock for MSAL — **zero UI changes**

### Phase 2 (with backend): Real Entra
- Configure MSAL with real tenant ID, client ID, redirect URI
- Tokens verified by .NET backend
- Consider native auth proxy (no redirect) at that time

---

<a name="4-data-layer"></a>
## 4. DATA LAYER & STORAGE

### Storage Abstraction
All data access goes through `StorageService` — a class with a consistent interface.
Phase 1 uses `MockStorageService` (localStorage with seed data).
This swaps to `ApiStorageService` when the backend exists. **No page code changes.**

### StorageService Interface
```
getCustomers()           → Customer[]
getCustomer(id)          → Customer
createCustomer(data)     → Customer
updateCustomer(id, data) → Customer

getProducts()            → Product[]
getProductsByCategory(catId) → Product[]
getCategories()          → Category[]

getOrders(customerId?)   → Order[]
getOrder(id)             → Order
createOrder(data)        → Order
updateOrder(id, data)    → Order

getInvoices(customerId?) → Invoice[]
getInvoice(id)           → Invoice

getPayments(customerId?) → Payment[]
createPayment(data)      → Payment

getFavorites(customerId) → Product[]
setFavorites(customerId, productIds) → void

getCurrentUser()         → User
```

### Data Models

#### Customer
```
{
  id:              number,
  name:            string,         // "Bella Cucina Restaurant"
  code:            string,         // "BELL-001"
  contact:         string,         // primary contact name
  phone:           string,
  email:           string,
  type:            string,         // "Restaurant", "Deli", "Caterer", etc.
  paymentType:     string,         // "credit" | "prepaid"
  creditTier:      string | null,  // "A", "B", "C" or null if prepaid
  balance:         number,         // outstanding balance (dollars)
  creditLimit:     number,         // 0 for prepaid customers
  terms:           string,         // "NET-30", "NET-15", "Prepaid"
  parentId:        number | null,  // parent account for multi-location
  address:         string,         // delivery address
  billingAddress:  string,
  priceLevel:      string,         // determines pricing
  route:           string | null,  // assigned route
  status:          string,         // "Active", "Hold", "Inactive"
  lastOrderDate:   string | null,  // ISO date
  avgOrderCases:   number,         // average order in cases
  accountCredit:   number,         // unapplied credit on account
  assignedSalesperson: string,
  notes:           string[],       // internal notes
  createdDate:     string,         // ISO date
}
```

#### Product (user will provide exact categories/products later)
```
{
  id:              number,
  code:            string,         // 5-digit: "10023"
  name:            string,         // product name
  flavor:          string,
  categoryId:      number,
  size:            string,         // "12oz Can", "20oz Bottle"
  material:        string,         // "Aluminum", "Plastic", "Glass"
  packSize:        string,         // "24-pack", "12-pack", "6-pack"
  unitsPerCase:    number,         // small units inside one case
  casePrice:       number,         // price per case
  unitPrice:       number,         // price per small unit (casePrice / unitsPerCase)
  depositPerCase:  number,         // CRV/deposit per case
  stock:           number,         // current stock in cases
  overStockLimit:  number | null,  // how many cases over stock allowed
  status:          string,         // "Active", "Discontinued", "Out of Stock"
}
```

#### Category
```
{
  id:              number,
  name:            string,         // "Cola", "Lemon-Lime"
  icon:            string,         // emoji or icon name
  sortOrder:       number,
}
```

#### Order
```
{
  id:              number,
  orderNumber:     string,         // "ORD-20260312-001"
  customerId:      number,
  salespersonId:   number,
  status:          string,         // "Draft", "Submitted", "Picking", "Shipped", "Delivered", "Cancelled"
  lineItems:       OrderLineItem[],
  subtotal:        number,         // total case prices
  depositTotal:    number,         // total deposits
  discountTotal:   number,         // total discounts applied
  grandTotal:      number,         // subtotal + depositTotal - discountTotal
  totalCases:      number,         // sum of all line item quantities
  deliveryDate:    string,         // requested delivery date
  notes:           string,         // special instructions
  createdDate:     string,
  modifiedDate:    string,
}
```

#### OrderLineItem
```
{
  productId:       number,
  productCode:     string,         // 5-digit code
  productName:     string,
  quantity:        number,         // in cases
  unitsPerCase:    number,
  casePrice:       number,         // price per case (may be edited)
  depositPerCase:  number,
  discount:        number,         // discount amount per case
  lineTotal:       number,         // (casePrice - discount) * quantity
  depositTotal:    number,         // depositPerCase * quantity
}
```

#### Invoice (same structure as order but finalized)
```
{
  id:              number,
  invoiceNumber:   string,         // "INV-20260312-001"
  orderId:         number,
  customerId:      number,
  status:          string,         // "Open", "Partial", "Paid", "Overdue"
  lineItems:       InvoiceLineItem[],  // same shape as OrderLineItem
  subtotal:        number,
  depositTotal:    number,
  discountTotal:   number,
  grandTotal:      number,
  totalCases:      number,
  amountPaid:      number,
  amountDue:       number,         // grandTotal - amountPaid
  dueDate:         string,
  createdDate:     string,
  paidDate:        string | null,
}
```

#### Payment
```
{
  id:              number,
  customerId:      number,
  amount:          number,
  method:          string,         // "Cash", "Check", "Card", "ACH", "Credit"
  appliedTo:       PaymentApplication[],  // which invoices this covers
  unappliedAmount: number,        // amount not yet matched to invoices
  reference:       string,         // check number, transaction ID, etc.
  date:            string,
  collectedBy:     number,         // salesperson ID
}
```

#### PaymentApplication
```
{
  invoiceId:       number,
  amount:          number,         // how much of the payment applied to this invoice
}
```

---

<a name="5-pages"></a>
## 5. PAGE-BY-PAGE SPEC

---

### 5.1 LOGIN

**Route:** `/login`

**Layout:**
- Centered card on screen
- Company logo at top
- Two buttons:
  - "Sign in with Google" (Google colors/icon) — primary option
  - "Log in with Email via Microsoft" (Microsoft colors/icon) — fallback for users without Google
- Small text: "Only authorized users can sign in. Contact your admin for access."

**Behavior:**
- Phase 1: Mock auth — buttons set fake user in localStorage, redirect to dashboard
- Phase 2: MSAL.js redirects to Entra, which handles Google or Microsoft login
- If already signed in (token in cache), auto-redirect to dashboard
- On sign-in failure, show error message inline

---

### 5.2 DASHBOARD

**Route:** `/` (home)

**Purpose:** Quick launchpad with at-a-glance stats. NOT a heavy analytics page.

**Layout (mobile):**
```
┌─────────────────────────────┐
│  Good morning, [Name]    ⚙️  │  ← Header with settings icon
├─────────────────────────────┤
│                             │
│  ┌──────┐  ┌──────┐        │  ← KPI cards (2 per row)
│  │ 42   │  │ 12   │        │
│  │Cases │  │Orders│        │
│  │Today │  │Open  │        │
│  └──────┘  └──────┘        │
│                             │
│  ┌──────┐  ┌──────┐        │
│  │ 5    │  │ 3    │        │
│  │Deliv.│  │Alerts│        │
│  │Today │  │      │        │
│  └──────┘  └──────┘        │
│                             │
│  ── Quick Actions ────────  │
│  [+ New Order]              │
│  [👥 Customers]             │
│  [📋 My Orders]             │
│  [💰 Collect Payment]       │
│                             │
│  ── Recent Activity ──────  │
│  • Order #1042 — Bella...   │
│  • Payment $1,200 — Harbor  │
│  • Delivery confirmed — ... │
│                             │
├─────────────────────────────┤
│  🏠    👥    ➕    💰    📊  │  ← Bottom nav
└─────────────────────────────┘
```

**KPI Cards — CASES ONLY, NO REVENUE:**
- Cases Sold Today (number)
- Open Orders (count)
- Deliveries Today (count)
- Alerts (count — overdue, over-limit, holds)

**Quick Actions:** Tap → navigate to that page.

**Recent Activity:** Last 5-10 actions (orders placed, payments received, deliveries confirmed). Tappable → opens detail.

---

### 5.3 CUSTOMER LIST

**Route:** `/customers`

**Layout (mobile):**
```
┌─────────────────────────────┐
│  Customers           [+ Add]│  ← Header with Add button
├─────────────────────────────┤
│  🔍 Search customers...     │  ← Search bar
│  [All] [Active] [Hold] [◦◦] │  ← Filter chips
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │ Bella Cucina Restaurant ││  ← Tap row → Customer Profile
│  │ Last order: Feb 24      ││
│  │ Balance: $8,450  🔴 30d  ││  ← Overdue badge
│  │            [New Order ➜] ││  ← Inline quick action
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Harbor Grill            ││
│  │ Last order: Feb 25      ││
│  │ Balance: $3,200  🟢      ││
│  │            [New Order ➜] ││
│  └─────────────────────────┘│
│  ...                        │
├─────────────────────────────┤
│  🏠    👥    ➕    💰    📊  │
└─────────────────────────────┘
```

**Behavior:**
- Default sort: alphabetical
- Search: by name, code, contact, address
- Filter chips: All, Active, Hold, Overdue, Prepaid, Credit
- Each row: customer name, last order date, balance, status indicator
- Tap row → opens Customer Profile
- "New Order" button on each row → jumps to New Order with customer pre-selected
- "+ Add" button → opens Add Customer page
- Pull-to-refresh (mobile gesture)

---

### 5.4 ADD CUSTOMER

**Route:** `/customers/new`

**Purpose:** Salesperson can add a new customer in the field.

**Form Fields:**
| Field | Required | Notes |
|-------|----------|-------|
| Company Name | Yes | |
| Contact Name | Yes | Primary contact |
| Phone | Yes | |
| Email | No | |
| Customer Type | Yes | Dropdown: Restaurant, Deli, Caterer, Cafe, Hotel, Bakery, Other |
| Delivery Address | Yes | |
| Billing Address | No | "Same as delivery" checkbox |
| Notes | No | Free text |

**Business Rules:**
- **New customers are ALWAYS prepaid** — no credit fields shown
- `paymentType` is set to `"prepaid"` automatically
- `creditLimit` is set to `0` automatically
- `creditTier` is set to `null`
- `terms` is set to `"Prepaid"`
- `status` is set to `"Active"`
- Salesperson cannot grant credit — only accounting can do that later

**On Submit:** Customer created, redirect to Customer Profile.

---

### 5.5 CUSTOMER PROFILE

**Route:** `/customers/:id`

**Header:** Customer name, status badge, type, quick action menu (⋮)

**Action Bar (always visible at top of profile, not hidden in menu):**
- New Order
- Collect Payment → opens Payment Modal (two modes):
  - **Apply to invoices:** select open invoices to pay
  - **Just collect payment:** no invoice selected — records payment as unapplied credit on account
- Send Message (email with invoice/statement/balance)
- Call Customer (tel: link)
- Edit Customer Info

**Tabs (swipeable on mobile):**

#### Tab 1: Overview
- Contact info: name, phone, email, address(es)
- Account info: payment type (credit/prepaid), credit tier, credit limit, terms, price level
- Assigned salesperson, route
- **Credit controls (salesperson can only adjust DOWN):**
  - If customer is on credit: button "Reduce Credit Limit" and "Switch to Prepaid"
  - If customer is prepaid: no credit controls shown (only accounting can grant credit)
  - No "Increase Credit" or "Grant Credit" option exists here

#### Tab 2: Orders
- List of orders for this customer, newest first
- Each row: order #, date, status badge, total cases, total amount
- Tap → opens Order Detail
- Filter: by status, by date range
- Button: "Duplicate" on each order → starts New Order with those items pre-loaded

#### Tab 3: Invoices
- List of invoices, newest first
- Each row: invoice #, date, status badge (Open/Partial/Paid/Overdue), amount due
- Tap → opens Invoice detail (read-only view matching old-system format)
- Actions per invoice: Send (email), Collect Payment
- Multi-select: select multiple → "Collect Payment" on batch

#### Tab 4: Account
- Balance overview: total outstanding, current, 30-day, 60-day, 90+ day buckets
- Unapplied credits
- Payment history (recent payments with amounts and dates)
- "Send Statement" button → emails full statement
- "Send Balance" button → emails current balance summary

#### Tab 5: Notes
- Internal notes added by salespeople
- Add new note (text field + save)
- Activity log: orders placed, payments received, status changes (read-only feed)
- Timestamped, shows who made each entry

---

### 5.6 NEW ORDER (Wizard)

**Route:** `/orders/new`

#### Step 1: Select Customer
- If navigated from Customer List or Customer Profile → customer pre-selected, skip to Step 2
- Otherwise: search/select customer (same search as Customer List)
- If multi-location customer: select delivery location
- Shows customer payment type and balance at a glance

#### Step 2: Build Order
**Top bar:** Customer name | Running total: X cases | $X.XX

**Two catalog modes (toggle):**
```
[📋 Catalog]  [⭐ Favorites]    ← Toggle at top
```

**Catalog Mode:**
- Category cards at top (horizontal scroll): Cola, Lemon-Lime, Root Beer, Seltzer, etc.
- Tap category → shows products in that category
- Product list: product name, flavor, size/pack, case price, stock indicator
- **Tap product → opens Product Modal (big overlay)**

**Favorites Mode:**
- Shows the customer's saved favorite products (if any)
- Same product list format as catalog
- Tap product → same Product Modal
- "No favorites yet" state if empty

**Product Modal (the big box):**
```
┌─────────────────────────────┐
│  ✕                          │  ← Close button
│                             │
│  Cola — Classic             │
│  12oz Can · 24-pack         │
│  Code: 10023                │
│                             │
│  ┌─────────────────────┐    │
│  │ Quantity (cases)     │    │
│  │  [−]    4    [+]     │    │  ← Large tappable +/- buttons
│  └─────────────────────┘    │
│                             │
│  Units: 96 (4 × 24)        │  ← Auto-calculated
│                             │
│  ┌─────────────────────┐    │
│  │ Case Price           │    │
│  │  $ [12.99]           │    │  ← Editable (pre-filled with default)
│  └─────────────────────┘    │
│                             │
│  Deposit/case: $1.20        │  ← Read-only display
│  Line total:   $56.76       │  ← Auto-calculated
│                             │
│  [⭐ Add to Favorites]      │  ← Toggle favorite for this customer
│                             │
│  [ ADD TO ORDER ]           │  ← Primary button
│                             │
└─────────────────────────────┘
```

**Product Modal Behavior:**
- Opens as large overlay / bottom sheet on mobile
- Quantity: starts at 1, +/- buttons, or tap number to type directly
- Case Price: pre-filled with default price (from customer's price level), editable by salesperson
- Units auto-calculated: quantity × unitsPerCase
- Line total auto-calculated: (casePrice × quantity) + (depositPerCase × quantity)
- Deposit shown as info, not editable
- "Add to Favorites" toggles this product on/off for this customer's favorites list
- "ADD TO ORDER" adds to cart and closes modal
- If product already in cart, modal shows current qty and "UPDATE" instead of "ADD"

**Cart (persistent at bottom of Step 2):**
```
┌─────────────────────────────┐
│  🛒 4 items · 18 cases      │
│  Subtotal: $245.80          │
│  [Review Order →]           │  ← Advance to Step 3
└─────────────────────────────┘
```
- Tap cart bar → expands to show line items (swipe to remove, tap to edit via Product Modal)
- Cart persists across category browsing

#### Step 3: Invoice Preview
- Displays the order in **old-system invoice format** (see §6)
- Every field still editable at this stage — tap to modify
- Line items: 5-digit code, product name, cases ordered, units per case, case price, deposit/case, line total
- Deposit shown as secondary line per item
- Subtotal, total deposits, total discount, grand total
- Delivery date calendar — shows available working days (Mon–Fri), default: next working day
- **"Deliver Now" toggle** — marks order as immediate delivery (salesperson is delivering on the spot). Skips warehouse/route flow. Invoice generated immediately on submission.
- Notes / special instructions field
- "Back" to keep editing, "Submit" to place order

#### Step 4: Confirmation
- Order submitted successfully
- Order number displayed
- Summary: customer, total cases, grand total, delivery date
- Buttons: "View Order", "New Order", "Back to Dashboard"

**Prepaid customer flow:** If customer is prepaid, after Step 3 the system prompts "Collect payment now?" → opens Payment Modal → order only finalizes after payment recorded (or salesperson explicitly skips — flagged).

---

### 5.7 ORDER DETAIL

**Route:** `/orders/:id`

**Layout:**
- Header: Order # + status badge
- Customer name (tappable → profile)
- Date placed, delivery date
- Line items in invoice format (read-only)
- Totals: subtotal, deposits, discounts, grand total, total cases
- Status timeline: Draft → Submitted → Picking → Shipped → Delivered
- **Actions (in ⋮ menu):**
  - Send Order (email to customer)
  - Duplicate Order (→ New Order with these items)
  - Cancel Order (only if status allows — before picking)

---

### 5.8 ORDER HISTORY

**Route:** `/orders`

**Layout:**
- Search bar
- Filter chips: All, Submitted, Picking, Shipped, Delivered, Cancelled
- Date range filter
- List of orders, newest first
- Each row: order #, customer name, date, status badge, total cases
- Tap → Order Detail

---

### 5.9 PAYMENT

**Route:** `/payments` (collection hub) OR triggered from invoice/customer

**Two entry points:**

**A. From Customer Profile → Invoices tab → select invoice(s) → "Collect Payment"**
- Opens Payment Modal with selected invoice(s) pre-loaded

**B. From Payment page (dedicated collection hub)**
- Search/select customer
- Shows all open invoices for that customer
- Checkbox to select which invoices to pay
- "Select All" option

**Payment Modal:**
```
┌─────────────────────────────┐
│  Collect Payment       ✕    │
├─────────────────────────────┤
│  Customer: Bella Cucina     │
│                             │
│  Selected Invoices:         │
│  ☑ INV-001  $2,400  30d    │
│  ☑ INV-002  $1,800  15d    │
│  ☐ INV-003  $4,250  current│
│                             │
│  Total Selected: $4,200.00  │
│                             │
│  Payment Amount:            │
│  $ [4200.00]                │  ← Editable (can pay partial)
│                             │
│  Payment Method:            │
│  [Cash] [Check] [Card]      │
│  [ACH]  [Account Credit]    │
│                             │
│  Reference #: [________]    │  ← Check # or transaction ref
│                             │
│  [ APPLY PAYMENT ]          │
│                             │
└─────────────────────────────┘
```

**Payment Behavior:**
- Multi-invoice selection: pay across multiple invoices in one transaction
- Payment amount editable — can pay less than total (partial payment)
- If payment > selected invoices total → excess goes to unapplied credit on account
- If payment < total → applied to oldest invoice first, then next, etc.
- "Account Credit" method: applies existing account credit to invoices (no new money collected)
- After payment: invoices update status (Paid or Partial), customer balance updated
- Confirmation shown with receipt

---

### 5.10 REPORTS

**Route:** `/reports`

**Purpose:** Outstanding balances and open invoices for collection purposes ONLY.
No sales reports, no revenue metrics, no custom report builder.

**Layout:**
```
┌─────────────────────────────┐
│  Reports                    │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────────┐│
│  │ 📊 Aging Report         ││  ← Tap to open
│  │ Outstanding by age      ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ 📋 Open Invoices        ││  ← Tap to open
│  │ All unpaid invoices     ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ 👤 Customer Balances    ││  ← Tap to open
│  │ Who owes what           ││
│  └─────────────────────────┘│
│                             │
└─────────────────────────────┘
```

**Report Types:**

**A. Aging Report:**
- All customers with outstanding balance, grouped by age bucket:
  - Current (not yet due)
  - 1-30 days overdue
  - 31-60 days overdue
  - 61-90 days overdue
  - 90+ days overdue
- Summary bar at top: total per bucket
- Tap customer → shows their invoices in that bucket
- Sort by: amount, days overdue, customer name

**B. Open Invoices:**
- List of all open (unpaid or partially paid) invoices across all customers
- Columns: invoice #, customer, amount due, days outstanding, due date
- Sort by: due date, amount, customer
- Filter by: date range, customer, overdue only
- Tap → Invoice detail
- Quick action: "Collect" button per invoice

**C. Customer Balances:**
- All customers ranked by outstanding balance (highest first)
- Each row: customer name, total balance, oldest invoice age, last payment date
- Color indicators: green (current), yellow (30d), orange (60d), red (90+)
- Tap → Customer Profile Account tab

---

### 5.11 SETTINGS

**Route:** `/settings`

**Minimal page:**
- User profile info (name, email — read-only, from Entra)
- Sign out button
- Sync status (last sync time, pending items count)
- App version
- "Send Feedback / Report Issue" → opens email to support

---

<a name="6-invoice-format"></a>
## 6. INVOICE FORMAT

> **User will provide exact format details.** Below is the structure based on what's been described.
> This format is used in: Order Review (Step 3), Order Detail, Invoice Preview, Print, Email attachment.

### Line Item Format
```
┌──────┬──────────────────────┬───────┬───────┬─────────┬──────────┬──────────┐
│ Code │ Product Name         │ Cases │ Units │ Cs Price│ Dep/Case │ Total    │
│      │                      │       │ /Case │         │          │          │
├──────┼──────────────────────┼───────┼───────┼─────────┼──────────┼──────────┤
│10023 │ Cola Classic 12oz 24p│    4  │   24  │  $12.99 │   $1.20  │  $56.76  │
│      │   ↳ Deposit (4 × $1.20)                                   │   $4.80  │
│10045 │ Lemon-Lime 20oz 24p  │    2  │   24  │  $22.50 │   $1.20  │  $47.40  │
│      │   ↳ Deposit (2 × $1.20)                                   │   $2.40  │
├──────┴──────────────────────┴───────┴───────┴─────────┴──────────┼──────────┤
│                                                    Subtotal      │ $104.16  │
│                                                    Deposits      │   $7.20  │
│                                                    Discount      │  -$5.00  │
│                                                    ─────────────│──────────│
│                                                    TOTAL         │ $106.36  │
└──────────────────────────────────────────────────────────────────┴──────────┘
```

**Key invoice rules:**
- 5-digit product code
- Product name (includes flavor, size, pack)
- Everything measured in **cases**
- Case price = price per case
- Units/Case = small units in one case (shown for reference)
- Deposit per case = secondary line item under each product
- Deposit is a separate line, not rolled into the case price
- Totals: Subtotal (product only) + Deposits − Discounts = Grand Total

> ⬜ **User to provide:** Exact invoice layout matching old system. Above is a starting point.

---

<a name="7-business-rules"></a>
## 7. BUSINESS RULES

### Credit & Payment Rules
| Rule | Detail |
|------|--------|
| New customers | Always prepaid. `creditLimit = 0`, `paymentType = "prepaid"` |
| Salesperson: reduce credit | Can lower a customer's credit limit |
| Salesperson: switch to prepaid | Can change a credit customer to prepaid |
| Salesperson: grant/increase credit | **BLOCKED** — only accounting can do this |
| Prepaid customer orders | Must collect payment before order finalizes |
| Credit customer over limit | Warn or hard-block (configurable — default: warn) |
| Credit customer overdue | Flag on dashboard + customer list |

### Pricing Rules
| Rule | Detail |
|------|--------|
| Default price | Based on customer's price level |
| Salesperson price edit | Can change case price on any line (from Product Modal) |
| Discount cap | **HARD BLOCK** — salesperson cannot override. If edited price goes below the cap threshold, the system blocks the change. No warn option — just blocked. Cap threshold configurable by admin. |
| Deposit | Per case, not editable by salesperson, shown as secondary line |
| No sales tax | Wholesale — no tax calculated |

### Inventory / Stock Rules
| Rule | Detail |
|------|--------|
| In-stock product | Add to order normally, no warning |
| Over-stock order | Salesperson **CAN** order above current stock — system shows warning: "This quantity exceeds current stock. Confirm you can arrange delivery before the order date." Salesperson must acknowledge to proceed. |
| Out-of-stock product | Same warning — not blocked, just warned. Salesperson takes responsibility for confirming availability. |

### Order Rules
| Rule | Detail |
|------|--------|
| Delivery date | **Most orders are future delivery.** When creating an order, salesperson selects a delivery date from a calendar showing available future working days (Mon–Fri). Today is also available. Weekends/holidays are greyed out and not selectable. Default: next available working day. |
| Immediate delivery | **"Deliver Now" option** — for cases where the salesperson is also the driver (or is with the driver). Selecting this skips the warehouse/route flow — order is marked as delivered immediately on submission. Invoice is generated on the spot. Used for on-the-truck sales or same-visit delivery. |
| Order modifications | Free to edit before submission. After submission — limited (future: policy-controlled) |
| Cancel order | Allowed before picking begins. After picking — blocked for salesperson. |

### KPI Display Rules
| Rule | Detail |
|------|--------|
| Salespeople see | Cases only — cases sold, cases ordered, cases per customer |
| Salespeople do NOT see | Revenue, dollar totals per period, profit margins, company-wide revenue |
| Dollar amounts shown | Only on individual orders, invoices, payments, and customer balances — never aggregated as a KPI |

---

<a name="8-components"></a>
## 8. SHARED COMPONENTS

| Component | Purpose | Used by |
|-----------|---------|---------|
| `BottomNav` | Mobile tab bar (Home, Customers, +New, Pay, Reports) | All pages (except Login) |
| `PageHeader` | Top bar: title, back button, action buttons | All pages |
| `KpiCard` | Stat card: label + large number | Dashboard |
| `CustomerRow` | Customer list item (name, balance, status, quick action) | Customer List |
| `ProductModal` | Big overlay for product qty/price editing | New Order Step 2 |
| `CartSummary` | Floating bar: item count, case count, subtotal, advance CTA | New Order Step 2 |
| `InvoicePreview` | Formatted invoice matching old-system layout | Order Review, Order Detail, PDF |
| `PaymentModal` | Collect payment overlay (multi-invoice, method, amount) | Payment, Customer Profile |
| `SendMessageModal` | Compose email with attachment (invoice/statement/balance) | Customer Profile, Order Detail |
| `StatusBadge` | Colored pill: Active/Hold/Overdue/Paid/Partial/etc. | Throughout |
| `SearchBar` | Search input with filter chips | Customer List, Order History, Reports |
| `EmptyState` | Illustration + text for empty lists | Any list page |
| `LoadingSpinner` | Centered spinner | Data loading states |
| `ErrorBoundary` | Catch-all error handler per Rule #6 | App wrapper |
| `ConfirmDialog` | "Are you sure?" modal for destructive actions | Cancel order, switch to prepaid |
| `Toast` | Brief notification popup (success, error, info) | After actions |

---

<a name="9-messaging"></a>
## 9. MESSAGING SYSTEM

### Current Phase: Email via Device Mail App (mailto:)
- "Send" action available on: invoices, orders, statements, balance
- Opens `SendMessageModal` which prepares:
  - Pre-filled recipient (customer's email)
  - Subject line (auto-generated: "Invoice INV-001 from [Company]")
  - Attachment type: Invoice PDF, Statement PDF, or Balance Summary
  - Optional message body
- **Phase 1 (current):** Tapping "Send" opens a **draft in the device's native email app** via `mailto:` link. The salesperson reviews and sends manually from their email app. Attachments may need to be added manually in Phase 1 (mailto: has limited attachment support — body text includes the key details inline).
- **Phase 2 (with server):** Email sends automatically from the server — no manual step. Attachments included as PDF.

### Channel Buttons (visible but disabled)
```
[📧 Email]  [💬 SMS]  [📱 WhatsApp]
   Active     Coming     Coming
               Soon       Soon
```

- Email: functional — opens device email app with pre-filled draft (Phase 1), or auto-sends via server (Phase 2)
- SMS: visible, tappable → shows "Coming Soon" toast
- WhatsApp: visible, tappable → shows "Coming Soon" toast

---

<a name="10-offline"></a>
## 10. OFFLINE & SYNC

### Phase 1 (current build): No offline
- All data in localStorage
- No service worker yet
- App requires browser to be open

### Phase 2: Basic Offline
- Service Worker caches app shell (HTML/JS/CSS)
- IndexedDB replaces localStorage for data
- Pending orders queue — saved locally, synced when online
- Sync status indicator in header or Settings page

### Phase 3: Full Offline
- Full product catalog cached locally
- Customer data cached per salesperson
- Create orders offline → queue for sync
- Collect payments offline → queue for sync
- Conflict resolution when sync completes

---

<a name="11-build-order"></a>
## 11. BUILD ORDER

> Build in this sequence. Each step should be fully working before moving to the next.

| # | What to Build | Depends On | Deliverable |
|---|---------------|-----------|-------------|
| 1 | **Project scaffold** | Nothing | Vite + React + Router + CSS setup, folder structure, empty pages |
| 2 | **Data layer** | #1 | StorageService, MockStorageService, mock data seeding, data models |
| 3 | **Auth (mock)** | #1 | Login page with Google + Microsoft buttons (mock), AuthProvider, ProtectedRoute |
| 4 | **App shell** | #1, #3 | BottomNav, PageHeader, routing between pages, auth guard |
| 5 | **Dashboard** | #2, #4 | KPI cards (cases only), quick actions, recent activity feed |
| 6 | **Customer List** | #2, #4 | Search, filter, customer rows, "New Order" shortcut |
| 7 | **Add Customer** | #2, #6 | Form, validation, prepaid-only rule, creates customer |
| 8 | **Customer Profile** | #2, #6 | 5 tabs: Overview, Orders, Invoices, Account, Notes |
| 9 | **New Order — Catalog** | #2, #8 | Step 1 (customer select), Step 2 (browse categories, search), Product Modal, cart |
| 10 | **New Order — Favorites toggle** | #9 | Favorites list in Step 2, toggle catalog/favorites, add/remove favorites from Product Modal |
| 11 | **New Order — Review & Submit** | #9 | Step 3 (invoice preview, editable), Step 4 (confirmation) |
| 12 | **Order Detail** | #2, #11 | View order, status timeline, actions menu |
| 13 | **Order History** | #2, #12 | List with search/filter, links to Order Detail |
| 14 | **Payment** | #2, #8 | Payment Modal, multi-invoice select, payment methods, apply to invoices |
| 15 | **Reports** | #2, #14 | Aging report, open invoices, customer balances |
| 16 | **Messaging** | #8 | SendMessageModal, email action on invoices/orders/statements, SMS/WhatsApp coming-soon stubs |
| 17 | **Settings** | #4 | Profile info, sign out, sync status, version |
| 18 | **Error handling** | All | ErrorBoundary, error IDs, friendly messages per Rule #6 |
| 19 | **Polish & QA** | All | Responsive tweaks, loading states, empty states, edge cases |

---

<a name="12-open-items"></a>
## 12. OPEN ITEMS — USER TO PROVIDE

| # | What's Needed | Where It Affects |
|---|---------------|-----------------|
| 1 | **Exact product categories and products** | Mock data, catalog browsing, Product Modal |
| 2 | **Invoice format matching old system** | InvoicePreview component, PDF generation |
| 3 | **Company name and logo** | Login page, headers, invoice |
| 4 | **Entra tenant details** | Auth config (tenant ID, client ID) — Phase 2 |
| 5 | **Price levels per customer type** | Pricing logic, mock data |
| 6 | **Deposit rates per container type** | Product data, invoice calculations |
| 7 | **Discount cap thresholds** | Warn vs block levels for salesperson discounts |
| 8 | **Default delivery date rules per customer** | Order flow, delivery date prefill |

---

*End of BUILD_PLAN.md — Do not build anything outside this spec without updating this document first.*
