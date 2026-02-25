# Stakeholder Interview — Question List
### Wholesale ERP / Order-to-Cash Platform
**Updated: February 25, 2026**

> **22 questions remaining** for the stakeholder call. Organized by topic. Check off answers as you get them.

---

## 1 — Inventory & Manufacturing Model *(Critical — affects many other decisions)*

- [ ] **[Q1a]** Is your ordering model **stock-based** (inventory on hand, orders ship from stock), **pre-order/made-to-order** (manufacture or source after receiving orders), or **both**?
- [ ] **[Q1b]** If stock-based: does the system need to show **real-time stock levels** to salespeople? Should orders be blocked or warned when stock is insufficient (backorder)? How is stock currently tracked?
- [ ] **[Q1c]** If pre-order/manufacturing: when an order is placed, how does it trigger manufacturing or sourcing? Does the manufacturing side have its own system that needs to receive orders and send back "ready" status?
- [ ] **[Q8]** When a salesperson duplicates a past order, should the system check current inventory availability? *(Depends on Q1a/b)*
- [ ] **[Q27]** If a product goes out of stock between order placement and warehouse picking — what should happen? Auto-remove, flag to salesperson, or let warehouse decide? *(Depends on Q1a/b)*

---

## 2 — Product Codes & Integration

- [ ] **[Q7a]** The system uses a new 6-digit product code. Does it need to map to product codes from other departments (manufacturing, purchasing, accounting)? Or is it standalone for this app only? Do we need a cross-reference table?

---

## 3 — Customer Accounts & Credit

- [ ] **[Q2]** Who controls what admin panels? Which roles/people have access to system settings, policies, user management? Map out who manages what.
- [ ] **[Q3]** Is there a credit approval process when onboarding a new customer, or can any salesperson add one?
- [ ] **[Q20]** How many credit tiers to start with? What are their names and rules? (e.g. Tier 1 = net-30 credit, Tier 2 = pay before delivery)
- [ ] **[Q34]** Do you want to tag/classify customers by type (restaurant, grocery, gas station, chain, independent)? Would tags affect pricing, product visibility, or reporting?

---

## 4 — Pricing, Deposits & Tax

- [ ] **[Q9]** Are government deposits (CRV) per unit or per case? Do they vary by container type (can vs. bottle vs. size)? How should deposits be displayed on invoices — per line item, separate section, or rolled into price?
- [ ] **[Q10]** Do some customers have fully custom price lists, or is it always standard price minus a discount?
- [ ] **[Q11]** Are there automatic promotions or volume deals? (e.g. buy 10 cases get 1 free, tiered pricing)
- [ ] **[Q12]** Is tax calculated on the deposit amount separately from the product price?

---

## 5 — Returns & Credits

- [ ] **[Q19a]** How are general product returns handled? Can a customer return delivered products? If yes — what is the process, who approves, and how is the credit/refund calculated? Credit memo, line item on next order, or cash refund?

---

## 6 — Order Modifications & Cancellations

- [ ] **[Q28/29]** What are your current rules for order cancellations and modifications? At what stage do restrictions kick in? (We'll use these as defaults in the configurable policy engine.)

---

## 7 — Invoicing & Accounting Workflow

- [ ] **[Q32]** Confirm: orders and invoices are **separate records** — order tracks what was requested, invoice is generated from delivered quantities. Or does the order itself become the invoice?
- [ ] **[Q33]** Before invoices are "posted" (permanently locked, no more edits): what does accounting review them **for**? What errors or discrepancies do you typically catch during your weekly review? (This tells us what AI should auto-flag.)

---

## 8 — Data Migration

- [ ] **[Q5]** What is your current invoicing system? What data needs to be migrated?
- [ ] **[Q18]** Do you have an existing customer database? In what format (spreadsheet, accounting software, etc.)?

---

## 9 — Onboarding

- [ ] **[Q26]** User onboarding: guided in-app setup wizard, or admin sets up accounts and trains in person?
- [ ] **[Q30]** New customer onboarding: any required documents or approvals before a new customer can place their first order?

---

## 10 — Security & Access

- [ ] **[Q35]** Do users need remote access from outside the office network (working from home, remote accounting)? If yes — SSO with MFA, VPN, or both? *(Affects scope and pricing)*
- [ ] **[Q36]** Are the Android handhelds managed through MDM (like Microsoft Intune), or just handed out as-is?

---

## 📝 Notes from Call

| # | Question | Answer |
|---|----------|--------|
| Q1a | Stock-based, pre-order, or both? | |
| Q1b | Real-time stock levels? Backorder behavior? | |
| Q1c | Manufacturing trigger / system integration? | |
| Q2 | Who controls what admin panels? | |
| Q3 | Credit approval for new customers? | |
| Q5 | Current invoicing system / migration? | |
| Q7a | 6-digit code integration with other departments? | |
| Q8 | Inventory check on order duplicate? | |
| Q9 | CRV per unit/case? Display preference? | |
| Q10 | Custom price lists? | |
| Q11 | Auto promotions / volume deals? | |
| Q12 | Tax on deposits separately? | |
| Q18 | Existing customer database format? | |
| Q19a | General returns process? | |
| Q20 | Credit tier names and rules? | |
| Q26 | User onboarding approach? | |
| Q27 | Out-of-stock handling? | |
| Q28/29 | Current cancellation/modification rules? | |
| Q30 | New customer required docs? | |
| Q32 | Order vs invoice — separate records? | |
| Q33 | What does accounting review before posting? | |
| Q34 | Customer classification tags? | |
| Q35 | Remote access needs? | |
| Q36 | Android device management (MDM)? | |

---

*Bring completed answers back to update the Living Document.*
