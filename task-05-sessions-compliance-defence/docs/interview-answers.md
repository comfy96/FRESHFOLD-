# Task 05 Interview Defence: The Comprehensive Viva (`docs/interview-answers.md`)

All twenty-two oral defence questions answered with technical precision from our Fresh Fold Laundry implementation, strictly under 200 words each.

---

### 1. Why is storing raw session IDs in a database an automatic fail?
Storing raw session IDs in a database exposes active sessions to immediate hijacking if an attacker reads a database dump, exploits SQL injection, or accesses unencrypted backups. If the database holds the exact string written to client cookies, an attacker simply sets `Cookie: freshfold_session=<stolen_id>` and gains full account access without knowing the password or passing 2FA. In Fresh Fold, the database persists only a one-way SHA-256 hash (`token_hash = SHA-256(raw_token)`). Because SHA-256 is pre-image resistant, possessing `token_hash` gives an adversary zero capability to reconstruct the 256-bit entropy token required by the browser cookie jar.

---

### 2. What cookie flags are mandatory for session cookies, and what does each flag protect against?
Three browser flags are mandatory:
1. **`HttpOnly`**: Blocks JavaScript from reading `document.cookie`. Even if an Cross-Site Scripting (XSS) payload executes in the DOM, malicious scripts cannot read or exfiltrate the session token.
2. **`SameSite=Lax`**: Mitigates Cross-Site Request Forgery (CSRF). The browser withholds the cookie on cross-site subrequests (images, iframes, fetch/XHR), sending it only on top-level safe GET navigations.
3. **`Secure`**: Enforces transmission strictly over encrypted TLS/HTTPS connections, preventing session token sniffing across unencrypted public Wi-Fi networks.

---

### 3. What is the difference between Soft Gating and Hard Gating, and why does Fresh Fold ship Soft Gating in production?
**Hard Gating** halts unverified customers at a blocking modal, forbidding access to docket records until an email OTP is confirmed. **Soft Gating** grants immediate authenticated session access to intake dockets while rendering an alert banner warning that verification is pending and receipt PDF delivery is paused. Fresh Fold ships Soft Gating to prevent physical counter friction. In Lagos, our persona Amaka Obi drops off clothes during morning commutes on flaky 2G data; if email delivery delays block her from verifying her item count with the clerk, trust collapses. Soft Gating preserves customer verification while gating high-risk actions.

---

### 4. How does Fresh Fold mitigate login timing attacks and email enumeration?
In naive authentication endpoints, non-existent emails return `401` in under 1 ms (skipping hash verification), whereas registered emails take ~86 ms to verify via Argon2id. Attackers measure round-trip latency to harvest registered customer directories. Fresh Fold eliminates this timing disparity by executing `verifySecret(DUMMY_ARGON2_HASH, candidatePassword)` whenever a customer record is null. Whether an account exists or not, the server computes a full 64 MiB Argon2id verification, ensuring identical response times (~90–130 ms) and identical generic error payloads (`{"error":"Incorrect email or password."}`).

---

### 5. What is the "logout edge case" on unreliable networks, and how did Fresh Fold resolve it?
In naive SPAs, the frontend optimistically clears local storage, sets `isLoggedIn = false`, and displays "Logged out" before the server responds. If mobile data drops during transit, `POST /api/auth/logout` never reaches the backend, leaving the session row active in SQLite while the UI lies to the customer. Fresh Fold's `LogoutButton.tsx` awaits positive server confirmation before navigating. If the network drops, it displays an accessible `role="alert"` warning informing the user that the session remains active on the server, offering explicit "Retry" and "Force Leave" controls.

---

### 6. When a user resets their password, what must happen to active sessions on other devices, and how is it implemented?
A password reset signifies that existing credentials or sessions may be compromised. All active sessions across all devices must be terminated immediately. In Fresh Fold, `POST /api/auth/reset/confirm` updates the customer's password hash and synchronously invokes `revokeAllCustomerSessions(customerId)`. This executes `DELETE FROM sessions WHERE customer_id = ?`, wiping every active session row in SQLite. When a lost phone or secondary laptop holding an old session cookie subsequently requests `/orders`, `validateSession` finds no database row and triggers an immediate `HTTP 307` redirect to login.

---

### 7. How does Fresh Fold resolve the conflict between the NDPA Right to Erasure and statutory CAMA tax retention laws?
Section 34 of the Nigeria Data Protection Act (NDPA) 2023 grants data subjects the Right to Erasure. However, Section 374 of the Companies and Allied Matters Act (CAMA) 2020 and FIRS tax regulations mandate retaining accounting and payment records for at least **6 years**. Running `ON DELETE CASCADE` breaches corporate tax laws. Fresh Fold resolves this by pairing **cryptographic PII anonymisation with financial record preservation**. Direct identifiers (name, email, phone) are irreversibly scrambled, while immutable transaction rows in `payments` remain intact linked to the anonymized customer key.

---

### 8. Explain the 4-stage account deletion lifecycle and why a 7-day grace period is mandatory.
1. **Stage 1 (Soft Delete & Immediate Lock):** Customer triggers deletion; server records `deleted_at = NOW()` and revokes all active sessions. Subsequent logins are rejected with `401`.
2. **Stage 2 (7-Day Grace Period):** Protects against accidental deletion or account sabotage by an attacker with temporary device access, allowing legitimate recovery through support.
3. **Stage 3 (Automated Idempotent Purge):** Nightly job strips PII, deletes verification codes, and redacts pickup notes.
4. **Stage 4 (Statutory Preservation):** Payment rows remain preserved for 6 years under CAMA 2020.

---

### 9. Why is the scheduled deletion purge job designed to be strictly idempotent?
A job is idempotent if running it multiple times yields the identical system state without errors or unintended side effects. In production, cron schedulers or distributed workers occasionally re-trigger jobs due to network timeouts. In Fresh Fold, `runDeletionPurgeJob` queries accounts where `deleted_at <= cutoff` and `email NOT LIKE '%@deleted.freshfold.ng'`. In `evidence/13` and `14`, Run 1 anonymized eligible accounts, while Run 2 immediately processed 0 accounts, mutated zero records, and exited with status 0, preventing duplicate operations or corrupted state.

---

### 10. What is the role of client-side state management in Fresh Fold, and why were Redux and Zustand rejected?
Fresh Fold manages UI state using lifted React component state and URL search parameters (`/auth?mode=signup|login|reset`). External state management libraries (Redux Toolkit, Zustand) were rejected because they add 1.2 KB to 32 KB of minified script and impose V8 engine parse overhead on low-cost Android Go devices with 2 GB RAM. Native React state allows non-sensitive data (customer email) to persist seamlessly when switching from failed login to password reset, while sensitive credentials (passwords) are cleanly wiped, incurring zero bundle overhead.

---

### 11. Why should customer queries always be scoped by `WHERE customer_id = ?`, and what vulnerability does this prevent?
Unscoped database queries create **Broken Object Level Authorization (BOLA / IDOR)**, ranked #1 in OWASP API Security. In Task 02, `/orders` executed `SELECT * FROM pickup_requests`, exposing all customer records. In Task 05, the server validates the authenticated session token from the cookie, resolves the trusted `session.customerId`, and queries `WHERE customer_id = session.customerId` (or `docket_number = session.docketNumber`). The client cannot influence which records are fetched by manipulating query parameters or URL IDs.

---

### 12. How does Role-Based Access Control (RBAC) protect the `/admin` route against ordinary customer sessions?
RBAC requires checking authenticated identity against an authorized permissions tier before serving protected resources. On `/admin`, the Server Component calls `validateSession(cookie)`. If valid, it inspects `session.role`. If `session.role !== 'admin'`, the server renders an explicit `HTTP 403 Forbidden` refusal card stating that the customer account (`Amaka Obi`, Docket #400) lacks staff privileges (`evidence/16`). Staff-only database metrics and customer tables are completely suppressed, preventing privilege escalation.

---

### 13. Explain how forward-only database migrations prevent production downtime and data loss.
Unversioned schema changes (such as raw `prisma db push`) risk dropping tables or truncating columns. Forward-only migrations use sequential, versioned SQL files applied incrementally. When adding a required column to a populated table, forward-only discipline mandates a safe 3-step transition:
1. Add the column as optional (`NULL`).
2. Run a migration script backfilling default values for existing rows.
3. Alter the column to required (`NOT NULL`).
This guarantees zero schema drift and avoids fatal SQLite `NOT NULL constraint failed` crashes.

---

### 14. What are the exact hardware benchmark figures for Argon2id vs SHA-256 on your system, and what do they prove?
On our local test machine (`task-04-server-security/evidence/08-hashing-benchmark.txt`), measured over 100 iterations:
- **Argon2id ($m=64\text{ MiB}, t=3, p=1$):** **`85.904 ms/hash`** ($\approx 11.64\text{ hashes/sec}$)
- **SHA-256:** **`0.000447 ms/hash`** ($\approx 2,237,136\text{ hashes/sec}$)
This proves Argon2id is over **192,000 times slower** than SHA-256 by design. By requiring 64 MiB of dedicated RAM per hash, Argon2id renders parallelized GPU and ASIC dictionary cracking rigs computationally and economically impossible.

---

### 15. What are the rate limiting parameters on Fresh Fold, and how can an attacker bypass naive IP-based limits?
Fresh Fold enforces **5 requests per 15 minutes** ($900\text{ seconds}$ retry-after) per IP on `/api/auth/*` endpoints (`evidence/13`). Naive IP-based limiters can be defeated by attackers routing traffic through residential proxy networks or spoofing proxy headers (`X-Forwarded-For`), as proved in `evidence/14-rate-limit-defeated.txt`. To mitigate this, production rate limiting must combine IP reputation with account-level lockout counters, CAPTCHA escalation, and trusted reverse-proxy header sanitization.

---

### 16. How does Have I Been Pwned's k-anonymity protocol check breached passwords without leaking the password or full hash?
K-anonymity allows verifying whether a password exists in a breach corpus without transmitting the password or its full hash. Fresh Fold computes the SHA-1 digest of the candidate password, extracts only the **first 5 hexadecimal characters** (the prefix), and transmits only those 5 characters to the HIBP API. HIBP returns a list of matching hash suffixes. Fresh Fold searches the returned list locally in memory for the remaining 35-character suffix. The full password hash never leaves the server.

---

### 17. Why was asynchronous background queueing (`setImmediate`) implemented for email verification OTPs?
Synchronous SMTP transmission blocks HTTP request execution for 1.5 to 4 seconds while establishing TLS handshakes and waiting for remote mail server acknowledgments. Under Nigerian cellular connectivity, slow round trips cause mobile timeouts. In Fresh Fold, `src/lib/email/mailer.ts` writes the verification record to SQLite, responds to the client in **`138 ms`**, and dispatches the SMTP email asynchronously via `setImmediate`, decoupling customer registration latency from third-party network delays.

---

### 18. What are the exact type scale dimensions for Display Large in Fresh Fold's design system, and why was this line height chosen?
In `task-01-design-system/docs/type-scale.md`:
- **Font Size:** `57px` (`3.5625rem`)
- **Line Height:** `80px` (`5rem`)
- **Letter Spacing:** `-0.25px`
- **Multiplier:** $80 / 57 \approx 1.403$
This line height was deliberately selected to preserve readability for large numeral dockets and brand headers on compact mobile viewports, preventing ascender/descender collisions when headings wrap across narrow screens.

---

### 19. What did your primary research interview with a real Nigerian laundry business owner reveal that contradicted your initial engineering assumptions?
Our interview with Chinedu Okafor of CleanEdge Laundry in Surulere revealed three contradictions:
1. **Chatbots are distrusted:** Customers demand dated, unalterable ledger lines ("Our records show") rather than conversational AI bots when tracking clothing.
2. **Prepaid e-commerce fails:** Over 70% of neighbourhood laundry is paid post-service upon counter pickup, requiring the ledger to support unpaid active intake dockets.
3. **Authenticator apps cause abandonment:** Low-end smartphone storage is filled with WhatsApp; requiring external authenticator apps causes immediate customer dropout.

---

### 20. Cross-Task Consistency: Cite the exact matching figures across Tasks 1 through 4.
All values match our recorded project evidence:
1. **Task 01 Typography:** Display Large is **`57px`** size, **`80px`** line height, and **`-0.25px`** letter spacing.
2. **Task 04 Cryptographic Benchmark:** Argon2id takes **`85.904 ms/hash`** vs SHA-256 at **`0.000447 ms/hash`**.
3. **Task 04 Rate Limiting:** Enforces **5 requests per 15 minutes** (**`900s`** retry-after).
4. **Task 04 OTP Lifecycle:** 6-digit CSPRNG verification code expires in **7 minutes** (**`420s`**).
5. **Task 05 Session Lifetime:** 256-bit token cookie expires in **7 days** (**`604,800s`**).
6. **Task 02 Runtime:** Node.js **`v22.5+`** prerequisite (tested on **`v26.13.0`**).

---

### 21. How does the system defend against Cross-Site Request Forgery (CSRF) on state-changing API endpoints?
Fresh Fold enforces a multi-layered CSRF defence:
1. **`SameSite=Lax` Cookie Flag:** The browser omits `freshfold_session` cookies on cross-origin POST, PUT, and DELETE requests originated from external domains.
2. **JSON Content-Type Requirement:** API endpoints reject standard HTML form-encoded payloads (`application/x-www-form-urlencoded`), requiring `Content-Type: application/json`. Cross-origin JSON posts trigger browser CORS preflight `OPTIONS` requests, preventing unauthorized cross-site submissions.
3. **Custom Header Validation:** Endpoints verify that requests originate from trusted client boundaries.

---

### 22. Name three specific technical areas you do not know, and explain how you plan to investigate them.
From [`docs/what-i-do-not-know.md`](what-i-do-not-know.md):
1. **SQLite WAL Checkpoint Contention:** Profiling checkpoint starvation (`SQLITE_BUSY`) under high-volume multi-worker concurrent writes. I will benchmark WAL mode under 200 writes/sec using `k6`.
2. **WebAuthn Passkey Synchronization on Android Go:** Keystore exception behavior on low-tier non-certified handsets. I will build an experimental `@simplewebauthn` prototype tested on physical Tecno test hardware.
3. **NDPA Cross-Border Adequacy for Foreign SMTP Relays:** Legal assessment criteria under NDPA Section 41 when routing transactional email through AWS SES in `eu-west-1`. I will review published NDPC adequacy guidelines with a certified DPCO.
