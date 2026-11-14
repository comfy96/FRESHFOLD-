# Email Verification & OTP Design (`docs/verification-design.md`)

*(Step 10: Cryptographic code generation, 7-minute expiry justification, and predictable-code attack math.)*

---

## 1. Generation: CSPRNG (`src/lib/security/otp.ts`)
Verification codes are generated exclusively via Node's cryptographically secure pseudorandom number generator (`crypto.randomInt(100_000, 1_000_000).toString()`), never `Math.random()`, and stored hashed with SHA-256 (`code_hash`) alongside `expires_at`, `used_at`, and `attempts`.

### What an Attacker Could Do Against Predictable Codes
If codes used a seeded/time-based ordinary pseudorandom function (`Math.random()`, xorshift, or linear congruential generator derived from millisecond timestamps or incrementing IDs), an attacker observing even one or two OTP codes sent to their own test email could recover the PRNG's internal state—or simply synchronise guesses against `registration timestamp ± 1 second`. Even within our strict **7-minute window** (`OTP_EXPIRY_MINUTES = 7`) and **5 attempts per 15-minute rate limit** (`RATE_LIMIT_MAX_ATTEMPTS = 5`), predictable PRNG state collapses the effective search space from $900,000$ equally likely 6-digit codes down to only a handful of candidate outputs, allowing verification bypass before a single lockout triggers.

---

## 2. Expiry Justification: 7 Minutes (`OTP_EXPIRY_MINUTES = 7`)
- **What users actually need:** Amaka Obi registers on an entry-level Android smartphone in Lagos over intermittent 3G/2G data. Switching from the browser to Gmail, waiting for a mobile network sync or mail-server TLS queue, reading 6 digits, and tabbing back regularly takes 2 to 5 minutes (2 minutes fails too often and causes frustration).
- **Attack surface cost:** A 7-minute lifetime limits brute-force guessing far tighter than a 30-minute or 24-hour token while pairing with `OTP_MAX_ATTEMPTS = 5` and route rate limiting (`5 req / 15 min`), giving an online attacker attempting uniform random 6-digit guesses only $\frac{5}{900,000} \approx 0.00056\%$ chance per window before hard lockout.

---

## 3. Verification Edge Cases (`src/app/api/auth/verify/route.ts`)
Verification explicitly rejects:
1. **Expired codes** (`expiresAt.getTime() < Date.now()`)
2. **Wrong codes** (increments `attempts`, blocks after 5 bad guesses with `429`)
3. **Already-used codes** (`usedAt !== null` check + transaction updating `usedAt` and `emailVerified = true` together, ensuring a valid code cannot be replayed twice).
