# Stakeholder Interview — Question List
### Wholesale ERP / Order-to-Cash Platform
**Updated: February 26, 2026 — Post-Meeting Answers**

> **Meeting held February 25, 2026.** Most questions answered. Remaining items noted below.

---

## 1 — Inventory & Manufacturing Model ✅ ANSWERED

- [x] **[Q1a]** **Stock-based for now.** Inventory managed via manual updates or spreadsheet imports. Dynamic rules allow over-ordering on certain products or categories.
- [x] **[Q1b]** Salespeople see stock levels. **Warning on out-of-stock — salesperson can override** and place the order anyway. Not a hard block.
- [x] **[Q1c]** No manufacturing integration needed at this time. Standalone system.
- [x] **[Q8]** Duplicating a past order — inventory check applies (same warning, can override).
- [x] **[Q27]** Out of stock between order and picking — **warehouse decides** (partial pick allowed via policy settings). Salesperson already warned at order time.

---

## 2 — Product Codes & Integration ✅ ANSWERED

- [x] **[Q7a]** **5-digit code** (not 6). Auto-generated when product is first added. Standalone — no mapping to external departments. Structured hierarchy preferred: code should encode category → subcategory → type → flavor where practical.

---

## 3 — Customer Accounts & Credit ✅ ANSWERED

- [x] **[Q2]** **1-3 admins** control the admin panel. Small team.
- [x] **[Q3]** **All new customers default to $0 credit / pay-on-order.** Even salespeople can add these. To upgrade to credit customer → must be reviewed and approved by accounting and/or owner.
- [x] **[Q20]** Two starting tiers: **Pay-First** (default for new customers) and **Credit** (approved customers with set limits/terms). Credit scoring system requested as **OPTIONAL feature** — accounting sets policies for auto credit rating based on usage and payments, auto-block, flag for lowering, assist credit reviews.
- [x] **[Q34]** **Yes — customer tags/types** used for pricing and grouping. Part of the dynamic price level system (type, area, zip, custom groups all affect pricing).

---

## 4 — Pricing, Deposits & Tax ✅ ANSWERED

- [x] **[Q9]** CRV **per case**. Separate line on invoices. Varies by product (set per product/variant in catalog).
- [x] **[Q10]** **Dynamic, unlimited price levels.** Can be assigned by: individual customer, customer type, area, zip code, custom group, product, product category, or any combination. Not just "standard minus discount."
- [x] **[Q11]** **No automatic promotions** or volume deals at this time.
- [x] **[Q12]** **No sales tax.** Wholesale only. CRV is separate and not taxed.

---

## 5 — Returns & Credits ✅ ANSWERED

- [x] **[Q19a]** **Yes, product returns happen.** Credit is applied to the customer's account (credit memo). Details of approval workflow TBD but accounting manages.

---

## 6 — Order Modifications & Cancellations ✅ ANSWERED

- [x] **[Q28/29]** **Modifications allowed until picked.** Configurable rules per salesperson, per customer type, etc. After picking → treated as a return. **Invoice is only created on actual delivery** — not at order time.

---

## 7 — Invoicing & Accounting Workflow ✅ ANSWERED

- [x] **[Q32]** **Separate records.** Order = what was requested. Invoice = generated from delivered quantities.
- [x] **[Q33]** **No AI review needed.** System should flag price differences between standard/assigned price level and actual invoice prices — per invoice and per product. Regular rules-based flagging, not AI.

---

## 8 — Data Migration ✅ ANSWERED

- [x] **[Q5]** **Custom legacy system** — the one being replaced. Data migration required.
- [x] **[Q18]** Data is in the legacy system. Will need export/import. **Custom invoice and statement templates** are critical — must be assignable per customer.

---

## 9 — Onboarding ✅ ANSWERED

- [x] **[Q26]** Admin sets up accounts. No in-app wizard needed.
- [x] **[Q30]** **No special documents.** New customers default to pay-first ($0 credit). Credit upgrade requires accounting approval.

---

## 10 — Security & Access ⚠️ PARTIALLY ANSWERED

- [ ] **[Q35]** **Currently RDP only.** Need to discuss server specs and remote access with IT. **PENDING — requires IT conversation.**
- [ ] **[Q36]** **PENDING** — will be discussed with IT.

---

## Additional Insights from Meeting

| Topic | Detail |
|-------|--------|
| **Invoice/Statement Templates** | Critical requirement — customizable templates assignable per customer |
| **Voice Ordering** | Moved to **OPTIONAL**. Includes uploading recordings/voice notes, not just live speech |
| **AI Pick Sheet OCR** | Moved to **OPTIONAL** |
| **AI Invoice Review** | **Removed.** Replaced with rules-based price difference flagging (not AI) |
| **Credit Scoring System** | **New OPTIONAL feature** — auto credit rating, auto-block, flag for lowering, assist reviews |
| **Printers** | Standard Bluetooth printers, system supports unlimited devices |
| **Sales Tax** | None. Wholesale only. CRV is separate and not taxed |
| **5-Digit Codes** | Changed from 6-digit to 5-digit, auto-generated with structured hierarchy |

---

## ⚠️ Still Pending (Requires IT Meeting)

- Server specifications and current hardware
- Remote access requirements (VPN/SSO/MFA)
- Android device management approach (MDM or not)

---

*Answers documented February 26, 2026. Living Document updated accordingly.*
