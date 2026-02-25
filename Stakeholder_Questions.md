# Stakeholder Interview — Question List
### Wholesale ERP / Order-to-Cash Platform
**Prepared: February 24, 2026**

> Use this document on your stakeholder calls. Check off answers as you get them and bring back to the design session.

---

## 🏢 SECTION 1 — Company & Current Systems

- [ ] **[Q1]** What inventory and/or manufacturing system are you currently using? Does it have an API or data export capability?
- [ ] **[Q5]** What is your current invoicing system? What data will need to be migrated into the new app?
- [ ] **[Q18]** Do you have an existing customer database? In what format (spreadsheet, accounting software, etc.)?
- [ ] **[Q16]** Roughly how many people in each role: salespeople, warehouse workers/pickers, drivers, accountants?
- [ ] **[Q17]** What Bluetooth printer models are currently in use, or what models are you planning to use?

---

## 👥 SECTION 2 — Customer Accounts & Credit

- [ ] **[Q2]** Who is the owner-level system admin — one person, or a small group?
- [ ] **[Q3]** Is there a credit approval process when onboarding a new customer, or can any salesperson add a customer?
- [ ] **[Q20]** How many customer credit tiers do you want to start with? What would you name/define them? (e.g. Tier 1 = net-30 credit account, Tier 2 = pay before delivery, etc.)
- [ ] **[Q21]** What payment vault or legacy payment systems need to be supported beyond Authorize.NET?
- [ ] **[Q22]** Should credit limit review notifications go to the accountant only, or also CC the salesperson on that account?
- [ ] **[Q25]** For multi-location customers (e.g. a chain with multiple stores) — should billing always roll up to the parent account, or can individual locations have their own separate billing?

---

## 💰 SECTION 3 — Pricing, Deposits & Discounts

- [ ] **[Q4]** How are discounts structured — per product, per customer, per order, or all three?
- [ ] **[Q9]** Are government deposits (CRV) calculated per unit or per case? Do they vary by container type (can vs. bottle vs. size)?
- [ ] **[Q10]** Do some customers have fully custom price lists, or is it always standard price minus a discount?
- [ ] **[Q11]** Are there any automatic promotions or volume deals? (e.g. buy 10 cases get 1 free, tiered pricing)
- [ ] **[Q12]** Is tax calculated on the deposit amount separately from the product price?
- [ ] **[Q19]** How are deposit/bottle returns handled? Are they a line item credit on the next order, a separate transaction, or something else?

---

## 📦 SECTION 4 — Orders & Inventory

- [ ] **[Q7]** Should the voice ordering system recognize product SKU codes in addition to product names?
- [ ] **[Q8]** When a salesperson duplicates a past order, should the system check current inventory availability before confirming?
- [ ] **[Q27]** If a product goes out of stock between when an order is placed and when the warehouse picks it — what should happen? (Auto-remove, flag to salesperson, let warehouse decide, other?)

---

## 🚚 SECTION 5 — Delivery & Routing

- [ ] **[Q24]** Truck routing: drivers in dense urban areas (NYC etc.) face truck-restricted roads that Google Maps ignores. Should we integrate a truck-specific navigation solution (e.g. Sygic Truck, PCMiler), or is standard GPS acceptable and drivers use their own judgment?

---

## 🔒 SECTION 6 — Invoicing & Accounting Rules

- [ ] **[Q15]** What invoice lock period do you want to start with? (e.g. locked X days after creation, or after payment received)
- [ ] **[Q23]** What should the default salesperson dashboard look like out of the box — what's the most important information a salesperson needs to see at a glance?

---

## 📋 SECTION 7 — Orders, Adjustments & Cancellations

- [ ] **[Q28]** At what point in the flow can an order be cancelled, and by whom? (e.g. before picking starts, before truck loads, anytime with approval?)
- [ ] **[Q29]** What are the rules for modifying an order after it's placed? Should there be configurable caps on what adjustments salespeople vs. accountants can make, similar to discount caps?
- [ ] **[Q31]** Are there any specific fields or layout requirements for customer statements?

## 🛠️ SECTION 8 — Setup & Onboarding

- [ ] **[Q26]** For user onboarding: do you want a guided in-app setup wizard for new users, or will training be handled in person and admin sets up accounts directly?
- [ ] **[Q30]** New customer onboarding: are there any required documents or approvals before a new customer can place their first order?

---

## 📝 Notes from Call

*(Fill in during / after the call)*

| Q# | Answer / Notes |
|----|---------------|
| Q1 | |
| Q2 | |
| Q3 | |
| Q4 | |
| Q5 | |
| Q7 | |
| Q8 | |
| Q9 | |
| Q10 | |
| Q11 | |
| Q12 | |
| Q15 | |
| Q16 | |
| Q17 | |
| Q18 | |
| Q19 | |
| Q20 | |
| Q21 | |
| Q22 | |
| Q23 | |
| Q24 | |
| Q25 | |
| Q26 | |
| Q27 | |
| Q28 | |
| Q29 | |
| Q30 | |
| Q31 | |

---

*Bring completed answers back to the design session to update the Living Document and proceed to Phase 2: App Design.*
