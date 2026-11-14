# Honest Critique of Agent-Written Email Copy (`docs/email-copy.md`)

*(Step 11: Token alignment and reviewing agent-written copy before it ever reaches real customers.)*

---

## 1. Visual System Alignment (`src/lib/email/tokens.ts` & `verification-template.ts`)
Unlike ungrounded LLM defaults (which commonly emit generic purple gradients or `#3B82F6` blue buttons), `buildVerificationEmail` loads Task 1 Light Mode semantic roles straight from `src/styles/variables.css`:
- Header fill: `--color-primary` (`#007B71` teal) + `--color-on-primary` (`#FFFFFF`)
- Outer canvas: `--color-surface` (`#F4FBF8`)
- Inner receipt card: `--color-surface-container-low` (`#EEF5F2`) bordered by `--color-outline-variant` (`#BEC9C6`)
- OTP badge: `--color-primary-containr` (`#96F3E6`) with `--color-on-primary-container` (`#005049`) text
- Font stack: `--type-body-large-font-family` (`Plus Jakarta Sans`)

---

## 2. What I Would Rewrite Before Sending to Real Customers
The copy generated for `buildVerificationEmail` reads politely, but a real Fresh Fold Laundry owner or marketer should fix three gaps before customers ever see it:
1. **No physical shop street address or counter phone number:** In Nigeria, unfamiliar transactional emails without a real street landmark (e.g., Surulere / Yaba shop address) and Chinedu Okafor's counter number (`0803 000 4120`) look like generic spam or phishing.
2. **Missing anti-phishing callout for shop staff:** Customers regularly receive calls from third parties trying to claim washed laundry; the footer should explicitly say *"Fresh Fold Laundry staff at the counter will NEVER call asking you to read this email code aloud."*
3. **Stilted opening phrase:** *"Our records show a new customer account request for shop docket #400"* sounds robotic for a friendly welcome/verification email—reserve *"Our records show"* strictly for balance/order ledger views, and open warmly with the shop's name, expected readiness alert benefit, and clear next step after verifying.
