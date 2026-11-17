# Cryptographic Session Architecture (`docs/sessions.md`)

**Business:** Fresh Fold Laundry  
**Domain:** Nigerian Neighbourhood Laundry Portal & Ledger  
**Author:** Engineering Team  
**Date:** 2026-11-17  

---

## 1. Why Storing Raw Session IDs in the Database Is an Automatic Fail

In naive web applications, developers frequently generate an ID (such as a UUIDv4 or incrementing integer) and insert it directly into the database while writing the identical string to the user's browser cookie. 

In an audit or real-world security evaluation, **storing raw session IDs in the database is an automatic fail**. 

### The Threat Scenario
If an attacker exploits an unauthenticated SQL injection vulnerability, reads an unencrypted database backup, accesses a leaked SQLite `.db` file, or gains read access to server logs containing database query dumps:
1. **With Raw IDs Stored:** Every active session token in the database is immediately usable. The attacker simply copies any raw token string, sets `Cookie: freshfold_session=<stolen_token>`, and impersonates the victim instantly without knowing their password or triggering 2FA.
2. **With Hashed Session Tokens (Fresh Fold Design):** The database stores only `token_hash = SHA-256(raw_token)`. Because SHA-256 is a pre-image resistant one-way cryptographic hash function, possession of `token_hash` gives the attacker zero capability to reconstruct the 256-bit raw token required by the browser cookie jar. Database leaks do NOT become session hijacking incidents.

---

## 2. The Fresh Fold Cryptographic Session Lifecycle

Fresh Fold implements a dual-token cryptographic boundary in `src/lib/security/session.ts`:

```
+-----------------------------------------------------------------------------------+
| 1. Authentication Success (POST /api/auth/login)                                  |
+-----------------------------------------------------------------------------------+
                                      │
                                      ▼
       Generate 256-bit CSPRNG Raw Token: crypto.randomBytes(32).toString('hex')
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
      Client-Facing Raw Token                  Server Database Storage
      (Delivered in Set-Cookie)                token_hash = SHA-256(raw_token)
                 │                                         │
                 ▼                                         ▼
   Set-Cookie: freshfold_session=...;          INSERT INTO sessions (customer_id,
   HttpOnly; SameSite=Lax; Path=/              token_hash, expires_at)
```

### Verification & Validation Protocol
When an incoming HTTP request arrives at a protected endpoint (`/orders`, `/pickup`, `/admin`):
1. The server reads the raw token from the request cookie `freshfold_session`.
2. The server hashes the raw token in-memory: `computedHash = crypto.createHash('sha256').update(rawToken).digest('hex')`.
3. The server executes a database lookup: `SELECT * FROM sessions WHERE token_hash = computedHash`.
4. The server validates:
   - Does the session row exist?
   - Is `expires_at > NOW()`?
   - Is `revoked_at IS NULL`?
   - Is `customer.deleted_at IS NULL`?
5. If all checks pass, the session is authenticated and associated with the customer record.

---

## 3. Cookie Flags & RFC 6265bis Compliance

The session cookie returned by `src/lib/security/session.ts:getSessionCookieOptions` enforces strict browser protection flags:

| Cookie Attribute | Production Value | Development Value | Security & Operational Justification |
| :--- | :--- | :--- | :--- |
| **`Name`** | `freshfold_session` | `freshfold_session` | Standard namespace; avoids framework fingerprinting (e.g. `PHPSESSID`, `JSESSIONID`). |
| **`HttpOnly`** | `true` | `true` | **Blocks XSS Session Theft:** Prevents client-side scripts from reading `document.cookie`. Even if an XSS vulnerability occurs in an untrusted input display, the attacker cannot exfiltrate the session token. |
| **`Secure`** | `true` | `false` | **Enforces TLS/HTTPS:** Guarantees cookies are never transmitted across plaintext HTTP connections. Enabled automatically when `NODE_ENV === 'production'`. |
| **`SameSite`** | `lax` | `lax` | **CSRF Mitigation:** Prevents cross-site request forgery by omitting the cookie on cross-site POST/subrequests (e.g. malicious images, forms, or fetch requests from external domains), while still sending the cookie on safe top-level GET navigations. |
| **`Path`** | `/` | `/` | Scopes the session across the entire Fresh Fold origin. |
| **`Max-Age / Expires`** | 7 Days | 7 Days | `SESSION_DURATION_DAYS = 7` (exactly $604,800\text{ seconds}$). Balances convenience for retail laundry customers like Amaka Obi with session hygiene. |

---

## 4. Multi-Device Concurrency & Invalidation

1. **Independent Concurrent Sessions:**
   - Every login invokes `createSession(customerId)`, inserting a distinct row into `sessions`.
   - Logging in on a mobile phone (Amaka's Tecno Android) does not terminate an active session on a laptop browser.
   - Verified in `evidence/01-two-session-ids.txt`: two consecutive logins produced session `id=1` and `id=2` with completely independent 256-bit tokens and separate expiry dates.

2. **Targeted Logout (`revokeSession`):**
   - Logging out on one device deletes only the session matching the client's current `token_hash`. Other devices remain logged in.

3. **Global Revocation on Password Reset & Account Deletion (`revokeAllCustomerSessions`):**
   - When a password is reset via `/api/auth/reset` or an account deletion request is initiated via `/api/auth/delete-account`, all sessions associated with `customer_id` are deleted or marked revoked immediately across all devices (`DELETE FROM sessions WHERE customer_id = ?`).

---

## 5. Machine Evidence Cross-References
- **`evidence/01-two-session-ids.txt`**: Un-fakeable terminal capture of two distinct logins returning separate session tokens and verifying SHA-256 hash equivalence in SQLite.
- **`evidence/02-cookie-flags.png`**: High-resolution browser DevTools capture verifying `HttpOnly`, `SameSite=Lax`, 7-day expiration, and cryptographic token isolation.
