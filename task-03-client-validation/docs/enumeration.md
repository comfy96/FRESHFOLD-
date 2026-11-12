# Sensitive Data Shape & Enumeration Prevention (`docs/enumeration.md`)

*(Step 5: Do not leak the shape of sensitive data.)*

---

## 1. Which Field, and Why Its Shape Is Sensitive
- **Field:** `claimPin` (**Counter claim PIN**, `src/app/auth/AuthForm.tsx:325-347`)
- **Why sensitive:** At Fresh Fold Laundry, customer names and phone numbers appear on physical paper laundry dockets. The `claimPin` acts as the secret proof-of-ownership credential separating Amaka Obi's garment records and counter pickup from anyone who merely knows her name or phone number. Unlike a generic username, `claimPin` functions like a numeric password.

---

## 2. What an Attacker Gains From Knowing the Shape
Earlier prototypes commonly put hints like `placeholder="Enter 5-digit PIN (e.g. 48219)"` right inside the input. Revealing the exact length or pattern hands an attacker three advantages:
1. **Drastically shrunk keyspace:** Knowing a PIN is strictly 5 digits shrinks the brute-force search space from arbitrary strings down to exactly $10^5$ ($100,000$) combinations (or $99,990$ once identical digits like `11111` are excluded).
2. **Automated dictionary filtering:** Attackers skip testing 4-, 6-, or 8-digit values and focus 100% of rate-limited guesses inside the exact valid range.
3. **Rule-mismatch enumeration:** Combining length hints with verbose error messages lets scripts map validation boundaries before targeting real accounts.

Consequently, `claimPin` has **zero placeholder** and **zero pre-input format hint** on the input (`src/app/auth/AuthForm.tsx:329-340`).

---

## 3. The Trade-Off Accepted
Removing the placeholder makes the signup form **slightly harder for legitimate users**: Amaka sees `"Counter claim PIN"` without knowing upfront whether 4 digits (like her bank ATM card) is enough, and only learns `"Claim PIN must be 5 to 8 digits and not all identical"` if she enters 4 digits and blurs out (`onBlur`).

**Is it worth it?** Yes. First-time signup happens once, and a single inline blur nudge costs Amaka two extra seconds once—whereas exposing the exact PIN shape in HTML/UI permanently weakens every customer's pickup security across the shop's lifetime.
