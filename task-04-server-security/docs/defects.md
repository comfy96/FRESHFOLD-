# Task 04 Code Defects (`docs/defects.md`)

Real defects verified in the current `feat/task-04-server-security` codebase, citing exact file paths, line numbers, and production costs.

---

## 1. In-Memory Rate Limiting Storage Clears on Process Restart
- **Location:** `src/lib/security/rate-limit.ts:16-25`
- **Defect:** `getStore()` stores IP attempt counters inside an in-process `Map<string, BucketEntry>` attached to `globalThis`. The counters do not persist across Node.js restarts or server deployments, and cannot be shared across multiple server processes or container replicas.
- **Production cost:** Every time the application restarts or auto-deploys a new build, all active lockout buckets reset immediately. An attacker triggering `HTTP 429` can either trigger a deployment, wait for a container restart, or target multiple cluster nodes in parallel to bypass the 5-attempt threshold.

---

## 2. No Account-Level Lockout on Repeated Failed Sign-Ins (IP Only)
- **Location:** `src/app/api/auth/login/route.ts:9-30, 62-75`
- **Defect:** While `/api/auth/login` checks `checkRateLimit('login', clientIp)` per IP, it does not track or increment failed login attempts on the target `Customer` database record (`customers` table lacks `failed_login_count` and `locked_until` columns).
- **Production cost:** An adversary using residential proxies or mobile VPN rotation (as demonstrated in `evidence/14-rate-limit-defeated.txt`) can send 5 password guesses per IP across 1,000 distinct IP addresses, attempting 5,000 dictionary guesses against Amaka Obi's email address without ever triggering an account-level lock.

---

## 3. Ephemeral In-Process Email Queue Vulnerable to Process Crash
- **Location:** `src/lib/email/mailer.ts:50-65` (`enqueueVerificationEmail`)
- **Defect:** `enqueueVerificationEmail` dispatches the SMTP transport via `setImmediate()` in local Node memory rather than a durable, persistent queue (e.g. BullMQ, RabbitMQ, or an SQLite job table with retries).
- **Production cost:** If the Next.js process crashes, receives a SIGTERM during deployment, or restarts right after account creation, the enqueued verification email is permanently lost without a retry record. The customer's account is created with `emailVerified = false`, but they never receive the 6-digit code and are trapped until code expiry.

---

## 4. Minimal Offline Breach Corpus on Network Timeout
- **Location:** `src/lib/security/breach-check.ts:9-18, 38-44`
- **Defect:** When Have I Been Pwned's API times out or the server loses internet access, `checkBreachedPassword` falls back to `KNOWN_BREACHED_CORPUS`, which contains only 8 hardcoded test strings.
- **Production cost:** If a shop server experiences intermittent outbound internet connectivity, registrations during the outage fall back to the 8-item set, allowing common leaked passwords like `dragon123` or `sunshine123` to be accepted into the database.
