# Breached Password Check (`docs/breach-check.md`)

*(Step 9: Checking registration passwords against known leaked corpora using k-anonymity without revealing the password.)*

---

## 1. How the Mechanism Works (`src/lib/security/breach-check.ts`)
When a customer submits `/api/auth/register`, **after** Zod boundary validation passes:
1. We trim leading/trailing whitespace on `data.password` and compute its **SHA-1 digest** locally in Node (`crypto.createHash('sha1')`, uppercase hex).
2. We slice off **only the first 5 hex characters** (`prefix`) and keep the remaining 35 hex characters (`suffix`) strictly in local server memory.
3. Our server sends an HTTP GET request solely for `https://api.pwnedpasswords.com/range/${prefix}` (with `Add-Padding: true`).
4. HIBP returns every leaked SHA-1 suffix matching that 5-character bucket (typically several hundred candidates) alongside their breach appearance counts (`SUFFIX:COUNT`).
5. Our server compares our local `suffix` against the returned list in memory. If matched, registration is rejected with `HTTP 400` asking Amaka to choose a different passphrase.
6. *(Resilience fallback: if external network access is offline or times out after 4s, an explicit local common-breach corpus still blocks trivial leaked strings like `password123` and `1234567890` without leaking anything.)*

---

## 2. Why the Naive Version Would Be Unacceptable
The naive version sends the **plaintext password** (or its complete, unsliced hash) directly to a third-party breach API on signup. That immediately fails for three reasons:
1. **Plaintext exposure in transit & logs:** The third-party vendor—and any proxy, APM trace, or server access log along the path—receives the user's real plaintext secret paired directly with the customer's signup email/IP in that request window.
2. **Cross-service credential stuffing risk:** If the third-party provider is ever compromised or subpoenaed, attackers gain verified, fresh email-plus-password pairs for real active accounts.
3. **Zero user consent:** Customers agreed only to Fresh Fold Laundry storing their laundry account credentials cleanly hashed—not streaming their typed secrets to external databases.

With $k$-anonymity (`prefix` = $5$ hex chars = $16^5 = 1,048,576$ buckets across billions of passwords), neither HIBP nor network observers can tell *which* suffix inside the returned bucket belongs to our customer.
