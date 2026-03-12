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

*No entries yet — development has not started.*

---

**Last updated:** March 11, 2026
