# WHOLESALE ERP — DEVELOPMENT RULES
### How AI Agents Build This Project
**Created: March 11, 2026 | Status: ACTIVE**

---

## 🚨 AI AGENT: READ THIS BEFORE WRITING ANY CODE

> **Context:** This project is built rapidly by AI agents under human direction. These rules ensure
> that when an AI agent picks up a file, it understands what exists, WHY it exists, what was already
> tried, and what will break if something is changed. Without these rules, agents will silently
> revert fixes, duplicate work, and break connected features.

---

## TABLE OF CONTENTS

1. [OOP — Everything is a Class](#rule-1)
2. [Comments — Always Explain WHY](#rule-2)
3. [The Living Doc — CODE_ARCHITECTURE.md](#rule-3)
4. [Modification Protocol — Read Before You Touch](#rule-4)
5. [Naming Conventions](#rule-5)
6. [Error Handling & Logging — Zero Blind Spots](#rule-6)
7. [The "Never Do" List](#rule-7)

---

<a name="rule-1"></a>
## RULE #1 — OOP: EVERYTHING IS A CLASS

All logic lives inside classes. No loose functions in global scope. No procedural scripts.

### Class Categories
Every class is one of these:

```
MODELS       — What data looks like         (Customer, Order, Invoice, Product)
SERVICES     — What happens to data         (OrderService, PricingEngine, InvoiceService)
REPOSITORIES — How data is saved/loaded     (CustomerRepository, OrderRepository)
CONTROLLERS  — Where requests come in       (OrderController, CustomerController)
VALIDATORS   — What checks data             (OrderValidator, PaymentValidator)
EVENTS       — What triggers side effects   (OrderPlacedEvent, DeliveryConfirmedEvent)
HANDLERS     — What responds to events      (OnDeliveryConfirmed_CreateInvoice)
```

### Key Principles
- **One class = one job.** `InvoiceService` handles invoices. It does NOT also send emails.
- **Depend on interfaces, not concrete classes.** `OrderService` receives `IOrderRepository`, not `PostgresOrderRepository`.
- **Constructor injection.** Services get their dependencies through the constructor. No `new` inside services.
- **One class = one file.** `OrderService` lives in `OrderService.cs`. Same name, always.

### Frontend Too
```javascript
// ✅ CORRECT
class OrderBuilder {
    constructor(catalogService, pricingService) {
        this._catalogService = catalogService;
        this._lineItems = [];
    }
}

// ❌ WRONG
function buildOrder(products) { ... }
```

---

<a name="rule-2"></a>
## RULE #2 — COMMENTS: ALWAYS EXPLAIN WHY

> **Every comment answers WHY, not WHAT.** The code says what. Comments explain why it was done
> this way, what was tried before, what business rule drives it, and what breaks if you change it.

### Required Comment Types

#### FILE HEADER — Every file
```csharp
// ============================================================
// FILE: OrderService.cs
// PURPOSE: Orchestrates order lifecycle from creation to submission.
// DEPENDS ON: IOrderRepository, IPricingEngine, ICreditService
// DEPENDED ON BY: OrderController, WarehouseQueueService
//
// WHY THIS EXISTS:
//   Orders go through stages (create → validate → price → credit-check → submit).
//   This service coordinates stages without owning the rules — each rule
//   lives in its own service/validator.
//
// MODIFICATION HISTORY (newest first):
//   [2026-03-15] #012 Changed stock check from hard-block to warning.
//   [2026-03-11] Initial creation.
// ============================================================
```

#### INLINE WHY — At every non-obvious decision
```csharp
// WHY: Round AFTER summing all lines, not per-line. Per-line rounding causes
// penny discrepancies on large orders. Accountant reconciles at order total level.
decimal orderTotal = Math.Round(lineItems.Sum(li => li.Quantity * li.UnitPrice), 2);

// WHY: CRV deposit added AFTER discounts. Discounts apply to product price only —
// never to government-mandated deposits. Stakeholder confirmed Feb 25 meeting.
decimal totalWithDeposit = orderTotal + CalculateCRV(lineItems);
```

#### ⚠️ WARNING — Things that break if changed
```csharp
// ⚠️ WARNING: This sort order = truck loading sequence.
// Last stop loaded FIRST, first stop loaded LAST.
// Reversing this sort means drivers unload the entire truck for stop #1.
// See WholesaleERP_LivingDoc.md §1.4.
stops.Sort((a, b) => b.StopOrder.CompareTo(a.StopOrder));
```

#### [MOD] TAGS — On every modification to existing code
```csharp
// [MOD #012] Changed from hard-block to warning for zero-stock orders.
// BEFORE: Threw StockExceededException — blocked order entirely.
// WHY CHANGED: Salespeople must be able to override. Stock restocked weekly.
// REVERT RISK: Salespeople get blocked on items that restock in days.
if (stock <= 0) {
    return OrderWarning.OutOfStock(product); // Was: throw new StockExceededException()
}
```

### Rules Summary
| Rule | Why |
|------|-----|
| No "what" comments | `// increment counter` on `counter++` — we can read |
| Every WHY must be present | If an agent asks "why is this like this?" the comment answers it |
| Reference the living doc | Business rules cite WholesaleERP_LivingDoc.md sections |
| [MOD] tags on every change | Prevents agents from reverting previous fixes |
| ⚠️ WARNING on danger zones | Prevents agents from making "obvious improvements" that break things |
| Keep comments current | Stale comments are worse than no comments. Update when you modify. |

---

<a name="rule-3"></a>
## RULE #3 — THE LIVING DOC: CODE_ARCHITECTURE.md

### What It Is
A single file that maps every class, service, endpoint, data model, and connection in the system.
Updated on every modification.

### Why It Exists
> AI agents lose context between sessions. This file IS the context. An agent reads it and
> knows: what exists, how it connects, what was changed, and what will break. Without it,
> every agent session starts from scratch and risks duplicating or breaking existing work.

### The CHANGELOG (Most Important Part)
Every modification gets an entry. Read newest-first. This is how agents know what was already
done and why.

```markdown
#### #012 — [2026-03-15] Stock check changed from block to warning
- **PROBLEM:** Salespeople couldn't place orders on zero-stock items
- **FIX:** Changed hard-block to warning with override ability
- **FILES:** OrderService.cs, OrderValidator.cs
- **REVERT RISK:** Salespeople get blocked from ordering restockable items
```

### Update Rules
| When | Do This |
|------|---------|
| Before writing new code | Add planned class/endpoint as `[PLANNED]` |
| After code works | Change to `[IMPLEMENTED]`, fill details |
| Before modifying code | Add CHANGELOG entry with what you intend to change |
| After modification | Complete the CHANGELOG entry with actual changes |
| When removing code | Mark as `[REMOVED]` — don't delete from doc |

---

<a name="rule-4"></a>
## RULE #4 — MODIFICATION PROTOCOL: READ BEFORE YOU TOUCH

Every time existing code is modified, follow this sequence:

```
1. READ CODE_ARCHITECTURE.md   → Understand what exists and how it connects
2. READ the CHANGELOG          → Know what was changed before and why
3. READ comments in the file   → Especially ⚠️ WARNING and [MOD] tags
4. ADD a CHANGELOG entry       → Document what you're about to change and why
5. MAKE the change             → Write the code
6. ADD [MOD] tag in the code   → Before/after/why on every changed block
7. UPDATE CODE_ARCHITECTURE.md → Keep the living doc current
```

### Why This Order
- Steps 1-3 prevent you from reverting a previous fix (the #1 risk with AI agents)
- Step 4 creates a record before you start
- Steps 6-7 leave breadcrumbs for the next agent session

---

<a name="rule-5"></a>
## RULE #5 — NAMING CONVENTIONS

| Element | Convention | Example |
|---------|-----------|---------|
| **Classes** | PascalCase noun | `OrderService`, `PricingEngine` |
| **Interfaces** | I + PascalCase | `IOrderService`, `ICustomerRepository` |
| **Methods** | PascalCase verb | `CreateOrder()`, `CalculatePrice()` |
| **Private fields** | _camelCase | `_orderRepository`, `_pricingEngine` |
| **Local variables** | camelCase | `orderTotal`, `lineItems` |
| **Constants** | UPPER_SNAKE | `MAX_DISCOUNT_PERCENT` |
| **DB tables** | PascalCase plural | `Customers`, `OrderLineItems` |
| **API routes** | kebab-case | `/api/orders/{id}/line-items` |
| **CSS classes** | kebab-case | `.order-card`, `.status-badge` |
| **JS classes** | PascalCase | `OrderBuilder` |
| **JS methods/vars** | camelCase | `calculateTotal()` |
| **Files** | Match class name | `OrderService.cs`, `OrderBuilder.js` |
| **Events** | PastTense + Event | `OrderPlacedEvent` |
| **Handlers** | On + Event + Action | `OnDeliveryConfirmed_CreateInvoice` |

---

<a name="rule-6"></a>
## RULE #6 — ERROR HANDLING & LOGGING: ZERO BLIND SPOTS

> **Philosophy:** No line of code runs unprotected. Every failure is captured, contextualized,
> and traced — but only the TOP of the call chain (controllers/entry points) actually LOGS.
> Everything below THROWS with a detailed message. The result: one log entry contains the
> entire hierarchy of failure from top to bottom.

---

### 6.1 — The Pattern: Throw Deep, Catch Once, Log at the Top

```
CONTROLLER (entry point)     ← catches, logs, returns friendly error + log ID
  └─ SERVICE                 ← wraps & re-throws with context
      └─ REPOSITORY / CLIENT ← wraps & re-throws with context
          └─ RAW EXCEPTION   ← the original failure
```

**Inner layers (services, repos, clients, validators) NEVER log.** They throw.
They catch low-level exceptions and re-throw wrapped with:
- What class and method was executing
- What input/parameters were being processed
- What business operation was in progress
- The original exception as the inner exception

**Only controllers / top-level entry points** catch the final exception, log it, and return.

---

### 6.2 — How Inner Code Throws (Services, Repos, Clients)

Every public method in every service, repository, and client is wrapped in try-catch.
On failure, re-throw with full context:

```csharp
// ============================================================
// SERVICE LAYER — throws with context, never logs
// ============================================================
public class OrderService : IOrderService
{
    public async Task<Order> CreateOrder(int customerId, List<LineItemDto> items)
    {
        try
        {
            var customer = await _customerRepo.GetById(customerId);
            var priceResult = await _pricingEngine.CalculatePrices(customer.Tier, items);
            // ... order creation logic
        }
        catch (Exception ex)
        {
            // WHY: Re-throw with full context so the controller log entry
            // shows the ENTIRE call chain, not just "object reference null".
            throw new ServiceException(
                $"OrderService.CreateOrder failed | customerId={customerId} | "
                + $"itemCount={items?.Count ?? 0} | operation=create-order",
                ex  // ← original exception preserved as InnerException
            );
        }
    }
}
```

```csharp
// ============================================================
// REPOSITORY LAYER — throws with context, never logs
// ============================================================
public class CustomerRepository : ICustomerRepository
{
    public async Task<Customer> GetById(int id)
    {
        try
        {
            // ... db query
        }
        catch (Exception ex)
        {
            throw new RepositoryException(
                $"CustomerRepository.GetById failed | id={id} | table=Customers",
                ex
            );
        }
    }
}
```

```csharp
// ============================================================
// EXTERNAL CLIENT — throws with context, never logs
// ============================================================
public class AuthorizeNetClient : IPaymentClient
{
    public async Task<PaymentResult> ChargeCard(string token, decimal amount)
    {
        try
        {
            // ... API call
        }
        catch (Exception ex)
        {
            throw new ExternalServiceException(
                $"AuthorizeNetClient.ChargeCard failed | amount={amount} | "
                + $"tokenPrefix={token?[..4]}*** | endpoint=payment/charge",
                ex
            );
        }
    }
}
```

**Result:** When the controller catches, `ex.ToString()` unrolls the ENTIRE chain:
```
ServiceException: OrderService.CreateOrder failed | customerId=42 | itemCount=5 | operation=create-order
 ---> RepositoryException: CustomerRepository.GetById failed | id=42 | table=Customers  
   ---> Npgsql.PostgresException: connection refused to 10.0.0.5:5432
```
**One log entry. Full picture. No digging.**

---

### 6.3 — How Controllers Catch and Log

Controllers are the ONLY place that catches exceptions, logs them, and returns a response.

```csharp
[HttpPost("create")]
public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
{
    try
    {
        var order = await _orderService.CreateOrder(request.CustomerId, request.Items);
        return Ok(order);
    }
    catch (Exception ex)
    {
        // This is the ONLY place in the entire call chain that logs.
        var logId = _errorLogger.LogError(ex, new ErrorContext
        {
            UserId = CurrentUserId,
            Action = "CreateOrder",
            Route = "/api/orders/create",
            RequestBody = SanitizeForLog(request)  // strip sensitive fields
        });

        // User gets friendly message + error ID. That's it.
        return StatusCode(500, new ErrorResponse
        {
            Message = "Something went wrong placing your order. Our team has been notified.",
            ErrorId = logId,       // e.g. "ERR-20260315-0042"
            SupportEnabled = true  // tells frontend to show "Send to Support" button
        });
    }
}
```

---

### 6.4 — Custom Logging System (We Build Our Own)

> No third-party logging frameworks. We build a simple, purpose-built logger that does
> exactly what we need: write to partitioned files and/or database, generate error IDs,
> and nothing else.

#### IErrorLogger Interface
```csharp
public interface IErrorLogger
{
    /// <summary>
    /// Logs an error and returns a unique error ID for the user.
    /// </summary>
    string LogError(Exception ex, ErrorContext context);

    /// <summary>
    /// Logs a non-error event (info, warning) — for audit trail.
    /// </summary>
    void LogEvent(LogLevel level, string message, object context = null);
}
```

#### What Gets Logged
Every log entry includes:

| Field | Example |
|-------|--------|
| **ErrorId** | `ERR-20260315-0042` |
| **Timestamp** | `2026-03-15T14:32:01Z` |
| **Level** | `ERROR`, `WARN`, `INFO` |
| **UserId** | `sales-user-7` |
| **Action** | `CreateOrder` |
| **Route** | `/api/orders/create` |
| **Full Exception Chain** | The entire `.ToString()` with all inner exceptions |
| **Request Snapshot** | Sanitized request body (no passwords, no card tokens) |
| **Machine/Instance** | Server identifier |

#### Storage: Partitioned Files + Optional DB

Logs are written to **daily partitioned files** and optionally mirrored to a DB table:

```
/logs/
  2026-03-15_errors.log      ← errors only
  2026-03-15_events.log      ← info + warnings
  2026-03-16_errors.log
  ...
```

**Why partitioned files:**
- Easy to find: "it broke on March 15" → open one file
- Easy to archive: zip old files, move to cold storage
- No dependency on DB being up (if DB is the problem, you still have file logs)
- DB mirror is optional secondary for querying/dashboards

**DB Table (optional mirror):**
```sql
CREATE TABLE ErrorLogs (
    ErrorId       VARCHAR(30) PRIMARY KEY,
    Timestamp     TIMESTAMPTZ NOT NULL,
    Level         VARCHAR(10) NOT NULL,
    UserId        VARCHAR(100),
    Action        VARCHAR(200),
    Route         VARCHAR(500),
    ExceptionChain TEXT NOT NULL,
    RequestSnapshot TEXT,
    MachineName   VARCHAR(100),
    Resolved      BOOLEAN DEFAULT FALSE
);
```

---

### 6.5 — User-Facing Error Experience

> Users NEVER see stack traces, class names, or technical details.
> They see a short friendly message + an error ID + a "Send to Support" button.

#### What the User Sees
```
┌─────────────────────────────────────────────┐
│  ⚠️ Something went wrong                    │
│                                             │
│  We couldn't complete your request.         │
│  Our team has been notified.                │
│                                             │
│  Error Reference: ERR-20260315-0042         │
│                                             │
│  ┌─────────────────────────────────┐        │
│  │  📧 Send to Tech Support        │        │
│  └─────────────────────────────────┘        │
└─────────────────────────────────────────────┘
```

#### "Send to Tech Support" Button
When clicked, this button automatically packages:

| Included | How |
|----------|-----|
| **Error ID** | From the error response |
| **Screenshot** | Browser captures current screen via `html2canvas` or similar |
| **Timestamp** | When the error occurred |
| **User info** | Logged-in user, role, current page |
| **Browser info** | UA string, screen resolution |

This is sent to a support endpoint or composed as a pre-filled email/ticket.
The user does NOT need to explain anything — the error ID links to the full log.

#### Frontend Implementation Pattern
```javascript
class ErrorHandler {
    // WHY: Centralized error display so every page shows errors the same way.
    // The error ID lets support find the full stack trace in seconds.
    static show(errorResponse) {
        const errorPanel = document.createElement('div');
        errorPanel.className = 'error-toast';
        errorPanel.innerHTML = `
            <div class="error-toast-content">
                <p class="error-message">${this._escapeHtml(errorResponse.message)}</p>
                <p class="error-id">Error Reference: ${this._escapeHtml(errorResponse.errorId)}</p>
                <button class="btn-support" onclick="ErrorHandler.sendToSupport('${this._escapeHtml(errorResponse.errorId)}')">
                    📧 Send to Tech Support
                </button>
            </div>`;
        document.body.appendChild(errorPanel);
    }

    static async sendToSupport(errorId) {
        // WHY: Screenshot gives support instant visual context without
        // asking the user "what were you looking at?"
        const screenshot = await this._captureScreenshot();

        const payload = {
            errorId: errorId,
            screenshot: screenshot,       // base64 PNG
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userId: AppState.currentUser?.id,
            userRole: AppState.currentUser?.role,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
            userAgent: navigator.userAgent
        };

        await fetch('/api/support/error-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        this._showConfirmation('Report sent! Support will reach out shortly.');
    }

    static async _captureScreenshot() {
        // WHY: html2canvas renders the current DOM to a canvas element,
        // then we export as base64 PNG. Lightweight, no browser extension needed.
        const canvas = await html2canvas(document.body);
        return canvas.toDataURL('image/png');
    }

    static _escapeHtml(str) {
        // WHY: Prevent XSS — error messages come from the server but we
        // never trust any string inserted into innerHTML.
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
```

---

### 6.6 — Exception Class Hierarchy

Custom exception classes so we know WHERE in the architecture a failure originated:

```csharp
// Base for all app exceptions — carries the context message pattern
public class AppException : Exception
{
    public AppException(string message, Exception inner = null) : base(message, inner) { }
}

// Thrown by service layer classes
public class ServiceException : AppException
{
    public ServiceException(string message, Exception inner = null) : base(message, inner) { }
}

// Thrown by repository layer classes
public class RepositoryException : AppException
{
    public RepositoryException(string message, Exception inner = null) : base(message, inner) { }
}

// Thrown by external API clients (Authorize.NET, SMTP, Google Maps, etc.)
public class ExternalServiceException : AppException
{
    public ExternalServiceException(string message, Exception inner = null) : base(message, inner) { }
}

// Thrown by validators when business rules fail (NOT an unexpected error)
public class ValidationException : AppException
{
    public List<string> Errors { get; }
    public ValidationException(List<string> errors) : base("Validation failed") { Errors = errors; }
}
```

---

### 6.7 — Rules Summary

| Rule | Why |
|------|-----|
| **Every public method is wrapped in try-catch** | Zero blind spots — nothing runs unprotected |
| **Inner layers THROW, never log** | One log entry captures the full chain, not scattered fragments |
| **Controllers are the only log point** | Single responsibility — one place to catch, log, respond |
| **Re-throw with class.method + parameters** | When you read the log, you see exactly what was happening |
| **Preserve inner exception always** | The chain of causation is never lost |
| **Custom logger, no third-party** | We control format, storage, and partitioning — no bloat |
| **Logs partitioned by day** | Find any error in seconds by date |
| **User gets friendly message + error ID** | No stack traces, no confusion, just a reference number |
| **Send to Support captures screenshot** | Support sees what the user saw — no back and forth |
| **Sanitize logs — no secrets** | Never log passwords, full card numbers, or tokens |

---

<a name="rule-7"></a>
## RULE #7 — THE "NEVER DO" LIST

| Never Do | Why |
|----------|-----|
| **Loose functions outside classes** | Breaks OOP. Every function belongs to a class. |
| **SQL string concatenation** | SQL injection. Parameterized queries only. |
| **`innerHTML` with user data** | XSS. Use `textContent` or framework encoding. |
| **Store card numbers** | PCI violation. Authorize.NET tokens only. |
| **Delete audit log entries** | Legal record. Append-only, even for admins. |
| **Hardcode business rules** | All thresholds, caps, tiers are admin-configurable. Not magic numbers. |
| **Skip the CHANGELOG** | Every modification is logged. No exceptions. |
| **Modify code without reading its comments** | You WILL revert a previous fix. |
| **Copy-paste business logic** | Extract to a shared service. Duplicates WILL diverge. |
| **`new` inside service classes** | Use constructor injection. `new` = hidden dependency. |
| **Log inside services/repos/clients** | Inner layers THROW with context. Only controllers log. |
| **Swallow exceptions (empty catch)** | Every catch must re-throw with context or log at top level. |
| **Show stack traces to users** | Users see friendly message + error ID. Period. |
| **Log passwords, tokens, or card numbers** | Sanitize before logging. Security is non-negotiable. |
| **Use third-party logging frameworks** | We built our own. It does exactly what we need. |

---

**Last updated:** March 11, 2026
**Applies to:** All code in the WholesaleERP project
